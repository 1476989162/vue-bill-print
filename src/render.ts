// src/render.ts — HTML template print engine
// 固定 HTML 模板打印：加载模板配置 → 填入数据 → 新窗口打印
import type { BackendData, FreeElementConfig, PrintTemplateConfig, TemplateStore } from './types';
import { normalizeBackendData } from './types';
import { st } from './i18n';
import { formatDateValue } from './format';
import { emitMessage, getStore } from './storage';
import JsBarcode from 'jsbarcode';
import * as QRCode from 'qrcode';

const PT_PER_MM = 2.835;
const DEFAULT_TITLE_TOP_PT = 28;

// Built-in HTML templates are optional via printBill({ fallbackHtml })

const mmToPx = (mm: number) => (mm * 96) / 25.4;
const pxToMm = (px: number) => (px * 25.4) / 96;
const ptToPx = (pt: number) => (pt * 96) / 72;
const ptToMm = (pt: number) => (pt * 25.4) / 72;
const pxToPt = (px: number) => (px * 72) / 96;

const nextFrame = () => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

const awaitLayoutReady = async () => {
  try { await document.fonts?.ready; } catch { /* ignore */ }
  await nextFrame();
};

/** 固定分页默认每页行数（针式短纸、不换行时约可排 11 行） */
export const DEFAULT_ROWS_PER_PAGE = 11;
const DEFAULT_SEQUENCE_COL_WIDTH = 20;
const DEFAULT_DETAIL_HEADER_HEIGHT = 14;
const DEFAULT_DETAIL_ROW_HEIGHT = 13;

const resolveRowsPerPage = (cfg: PrintTemplateConfig): number =>
  cfg.rowsPerPage > 0 ? cfg.rowsPerPage : DEFAULT_ROWS_PER_PAGE;

/** 配置行高（pt）——分页/单据体高度一律用配置值，避免实测偏大导致「每页行数」被压小、整体显大 */
const resolveConfigRowPt = (cfg: PrintTemplateConfig): number =>
  cfg.detailRowHeight || DEFAULT_DETAIL_ROW_HEIGHT;

/** 单行明细高度（px）：布局撑满可用实测，缺省回退配置 */
const resolveMeasuredRowPx = (cfg: PrintTemplateConfig, measure?: MeasureResult): number =>
  (measure && measure.measuredRowHeight > 0) ? measure.measuredRowHeight : ptToPx(resolveConfigRowPt(cfg));

/** 明细区高度（pt）= 列名行 + N 行明细 */
export const computeDetailBodyHeightPt = (
  cfg: PrintTemplateConfig,
  rowCount: number,
  _measure?: MeasureResult,
  includeHeader = true,
): number => {
  const headerPt = includeHeader ? (cfg.detailHeaderHeight || DEFAULT_DETAIL_HEADER_HEIGHT) : 0;
  return headerPt + Math.max(0, rowCount) * resolveConfigRowPt(cfg);
};

/** @deprecated 不再自动改写分区高度/位置，保留导出避免旧引用报错 */
export const syncDetailSectionHeight = (_cfg: PrintTemplateConfig, _measure?: MeasureResult): void => {};

const ensurePrintConfig = (cfg: PrintTemplateConfig): PrintTemplateConfig => {
  cfg.sequenceColumnWidth = cfg.sequenceColumnWidth || DEFAULT_SEQUENCE_COL_WIDTH;
  cfg.detailHeaderHeight = cfg.detailHeaderHeight || DEFAULT_DETAIL_HEADER_HEIGHT;
  cfg.detailRowHeight = cfg.detailRowHeight || DEFAULT_DETAIL_ROW_HEIGHT;
  if (cfg.allowTableOverflow == null) cfg.allowTableOverflow = true;
  if (cfg.headerNoWrap == null) cfg.headerNoWrap = true;
  if (!cfg.sections) {
    const defaultRowPt = cfg.detailRowHeight || DEFAULT_DETAIL_ROW_HEIGHT;
    const detailH = (cfg.detailHeaderHeight || DEFAULT_DETAIL_HEADER_HEIGHT) + resolveRowsPerPage(cfg) * defaultRowPt;
    cfg.sections = {
      header: { key: 'header', title: st('default.sectionHeader'), top: 20, height: Math.max((cfg.tableTop || 120) - 20, 60), visible: true, autoFlow: true },
      detail: { key: 'detail', title: st('default.sectionDetail'), top: cfg.tableTop || 120, height: Math.max(detailH, 60), visible: true, autoFlow: true },
      footer: { key: 'footer', title: st('default.sectionFooter'), top: 450, height: 55, visible: true, autoFlow: true },
    };
  }
  if (cfg.tableTop != null && cfg.sections.detail.top == null) {
    cfg.sections.detail.top = cfg.tableTop;
  }
  cfg.headerFields.forEach(field => { if (!field.section) field.section = 'header'; });
  cfg.freeElements.forEach(item => { if (!item.section) item.section = 'header'; });
  return cfg;
};

const isSectionVisible = (cfg: PrintTemplateConfig, key: 'header' | 'detail' | 'footer'): boolean =>
  cfg.sections?.[key]?.visible !== false;

const getSectionPrintMode = (cfg: PrintTemplateConfig, key: 'header' | 'footer'): 'every' | 'first' | 'last' => {
  const mode = cfg.sections?.[key]?.printMode;
  if (mode === 'every' || mode === 'first' || mode === 'last') return mode;
  if (key === 'header') return cfg.repeatHeader ? 'every' : 'first';
  return 'last';
};

const visibleDetailColumns = (cfg: PrintTemplateConfig): PrintTemplateConfig['detailColumns'] =>
  cfg.detailColumns.filter(c => c.visible);

const detailTableWidthPt = (cfg: PrintTemplateConfig, cols = visibleDetailColumns(cfg)): number =>
  (cfg.sequenceColumnWidth || DEFAULT_SEQUENCE_COL_WIDTH)
  + cols.reduce((sum, col) => sum + (Number(col.width) || 0), 0);

// getBoundingClientRect 已是 CSS 像素，勿再除以 devicePixelRatio（会导致高 DPI 下测高偏小、行被裁切）
const elHeight = (el: Element | null | undefined): number => {
  if (!el) return 0;
  return (el as HTMLElement).getBoundingClientRect().height;
};

const getColType = (key: string, cfg: PrintTemplateConfig, data: BackendData): string => {
  const col = cfg.detailColumns.find(c => c.key === key);
  if (col?.type) return col.type;
  const h = data.TbDetailHeaders?.find(x => x.Key === key);
  return h?.Type || '';
};

const getHeaderType = (key: string, data: BackendData): string => {
  const h = data.TbHeaders?.find(x => x.Key === key);
  return h?.Type || '';
};

const isNumericType = (type: string): boolean => {
  const t = (type || '').toLowerCase();
  return t === 'number' || t === 'decimal' || t === 'float' || t === 'double' || t === 'int' || t === 'integer';
};

const formatCellValue = (val: unknown, type: string, decimalPlaces?: number | null, dateFormat?: string): string => {
  if (val == null || val === '') return '';
  if (type === 'Date') return formatDateValue(String(val), false, dateFormat);
  if (type === 'DateTime') return formatDateValue(String(val), true, dateFormat);
  if (isNumericType(type) || (decimalPlaces != null && decimalPlaces >= 0)) {
    const n = Number(val);
    if (!Number.isFinite(n)) return String(val);
    const places = decimalPlaces != null && decimalPlaces >= 0 ? decimalPlaces : 2;
    return n.toFixed(places);
  }
  return String(val);
};

function computeSummary(
  s: { method: string; field: string },
  cols: PrintTemplateConfig['detailColumns'] | unknown[],
  rows: Record<string, unknown>[],
): string {
  if (!rows?.length || !s.field) return '0';
  const vals = rows.map(r => Number(r[s.field]) || 0);
  const col = (cols as PrintTemplateConfig['detailColumns']).find?.(c => c.key === s.field);
  const places = col?.decimalPlaces != null && col.decimalPlaces >= 0 ? col.decimalPlaces : 2;
  if (s.method === 'sum') return vals.reduce((a, b) => a + b, 0).toFixed(places);
  if (s.method === 'count') return vals.length.toString();
  if (s.method === 'avg') return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(places);
  return '';
}

/** 续页明细表起始 Y（约 2mm） */
const CONTINUATION_TABLE_TOP_PT = (2 * 72) / 25.4;

export const getTitleTopPt = (cfg: PrintTemplateConfig): number => cfg.titleTop ?? DEFAULT_TITLE_TOP_PT;

const getTableTopPt = (cfg: PrintTemplateConfig, useFullHeader: boolean): number => {
  if (!useFullHeader) return CONTINUATION_TABLE_TOP_PT;
  if (cfg.sections?.detail?.top != null) return cfg.sections.detail.top;
  if (cfg.tableTop > 0) return cfg.tableTop;
  if (cfg.headerFields.length > 0) {
    return Math.max(...cfg.headerFields.map(h => h.top + h.fontSize * 1.2)) + 4;
  }
  return getTitleTopPt(cfg) + cfg.titleFontSize * 1.2 + 8;
};

/** 纸张内容区高度（pt，已扣除页边距；绝对定位坐标系相对此区域） */
const pageContentHeightPt = (cfg: PrintTemplateConfig): number =>
  Math.max(0, (cfg.paper.height - cfg.paper.marginTop - cfg.paper.marginBottom) * PT_PER_MM);

/** 页码区高度预留（pt）——与 CSS .page-num 的 4.5mm 对齐 */
const PAGE_NUM_MM = 4.5;
const pageNumReservePt = (cfg: PrintTemplateConfig): number =>
  cfg.showPageNumber ? PAGE_NUM_MM * PT_PER_MM : 0;

/** 主内容区高度（pt）：整页内容区减去页码条 */
const pageMainHeightPt = (cfg: PrintTemplateConfig): number =>
  Math.max(0, pageContentHeightPt(cfg) - pageNumReservePt(cfg));

/** 本页是否打印下部分（仅末页，或 printMode=every） */
const shouldShowFooter = (cfg: PrintTemplateConfig, pageIdx: number, totalPages: number): boolean =>
  isSectionVisible(cfg, 'footer')
  && (pageIdx === totalPages - 1 || getSectionPrintMode(cfg, 'footer') === 'every');

/** 本页是否打印上部分：仅首页（续页去掉表头高度，腾出明细行） */
const shouldShowHeader = (cfg: PrintTemplateConfig, pageIdx: number): boolean =>
  isSectionVisible(cfg, 'header') && pageIdx === 0;

const resolveFooterReservePt = (cfg: PrintTemplateConfig): number =>
  Math.max(20, cfg.sections?.footer?.height || 40);

type PageKind = 'single' | 'first' | 'middle' | 'last';

/**
 * 按页类型计算本页最多可排明细行（设计行高、1:1、不缩放）。
 * - single：表头 + 列头 + 行 + 合计 + 下部分
 * - first：表头 + 列头 + 行（无下部分）
 * - middle：无表头（续页顶）+ 列头(可选) + 行
 * - last：无表头 + 列头(可选) + 行 + 合计 + 下部分
 * 再与设计器「每页行数」取较小值。
 */
export const pageRowCapacity = (
  cfg: PrintTemplateConfig,
  kind: PageKind,
  hasSummary: boolean,
): number => {
  const pageIdx = kind === 'middle' || kind === 'last' ? 1 : 0;
  const showHeader = kind === 'single' || kind === 'first'
    ? shouldShowHeader(cfg, 0)
    : shouldShowHeader(cfg, 1);
  const showFooter = kind === 'single' || kind === 'last'
    ? isSectionVisible(cfg, 'footer')
    : getSectionPrintMode(cfg, 'footer') === 'every';
  const includeSummary = hasSummary && (kind === 'single' || kind === 'last');
  const showColHeader = pageIdx === 0 || cfg.repeatColumnHeader;

  const tableTopPt = getTableTopPt(cfg, showHeader);
  const mainH = pageMainHeightPt(cfg);
  const reserve = showFooter ? resolveFooterReservePt(cfg) : 0;
  const theadPt = showColHeader ? (cfg.detailHeaderHeight || DEFAULT_DETAIL_HEADER_HEIGHT) : 0;
  const rowPt = Math.max(1, resolveConfigRowPt(cfg));
  const summarySlots = includeSummary ? 1 : 0;
  const available = Math.max(0, mainH - reserve - tableTopPt - theadPt);
  const physical = Math.max(1, Math.floor(available / rowPt) - summarySlots);
  return Math.max(1, Math.min(resolveRowsPerPage(cfg), physical));
};

/** 设计器提示：单页（含头尾）建议行数 */
export const computeMaxFittingRows = (
  cfg: PrintTemplateConfig,
  opts: { includeSummary?: boolean; includeFooter?: boolean } = {},
): number => {
  const hasSummary = opts.includeSummary !== false;
  if (opts.includeFooter === false) return pageRowCapacity(cfg, 'first', false);
  return pageRowCapacity(cfg, 'single', hasSummary);
};

/** 续页容量（无表头） */
export const computeContinuationFittingRows = (cfg: PrintTemplateConfig): number =>
  pageRowCapacity(cfg, 'middle', false);

/**
 * 按页类型容量分页：
 * 能一页装下 → 单页（头+尾都占高度）；
 * 否则首页占表头、中间页去掉表头、末页占下部分+合计。
 */
const paginateByPageKind = (
  allRows: Record<string, unknown>[],
  cfg: PrintTemplateConfig,
  hasSummary: boolean,
): { pages: Record<string, unknown>[][]; capacities: number[] } => {
  if (allRows.length === 0) {
    return { pages: [[]], capacities: [pageRowCapacity(cfg, 'single', hasSummary)] };
  }

  const singleCap = pageRowCapacity(cfg, 'single', hasSummary);
  if (allRows.length <= singleCap) {
    return { pages: [allRows], capacities: [singleCap] };
  }

  const firstCap = pageRowCapacity(cfg, 'first', false);
  const middleCap = pageRowCapacity(cfg, 'middle', false);
  const lastCap = pageRowCapacity(cfg, 'last', hasSummary);

  const fillPages = (pageCount: number): Record<string, unknown>[][] | null => {
    const pages: Record<string, unknown>[][] = [];
    let offset = 0;
    for (let i = 0; i < pageCount; i++) {
      const kind: PageKind = i === 0 ? 'first' : i === pageCount - 1 ? 'last' : 'middle';
      const cap = kind === 'first' ? firstCap : kind === 'last' ? lastCap : middleCap;
      if (offset >= allRows.length) return null;
      const take = Math.min(cap, allRows.length - offset);
      if (i < pageCount - 1 && offset + take >= allRows.length) return null;
      const slice = i === pageCount - 1
        ? allRows.slice(offset)
        : allRows.slice(offset, offset + take);
      if (i === pageCount - 1 && slice.length > lastCap) return null;
      pages.push(slice);
      offset += slice.length;
    }
    return offset === allRows.length ? pages : null;
  };

  let pageCount = 2;
  while (pageCount < allRows.length + 2) {
    const totalCap = firstCap + lastCap + Math.max(0, pageCount - 2) * middleCap;
    if (allRows.length <= totalCap) {
      const pages = fillPages(pageCount);
      if (pages) {
        const capacities = pages.map((_, i) => {
          if (i === 0) return firstCap;
          if (i === pages.length - 1) return lastCap;
          return middleCap;
        });
        return { pages, capacities };
      }
    }
    pageCount += 1;
  }

  const rpp = Math.max(1, resolveRowsPerPage(cfg));
  const pages: Record<string, unknown>[][] = [];
  for (let i = 0; i < allRows.length; i += rpp) pages.push(allRows.slice(i, i + rpp));
  return { pages, capacities: pages.map(() => rpp) };
};

/** 末页表格底边 Y（pt），用于下部分贴表后 */
const getTableBottomPt = (
  cfg: PrintTemplateConfig,
  opts: {
    pageIdx: number;
    pageRows: Record<string, unknown>[];
    emptyPad: number;
    includeSummary: boolean;
    showHeader: boolean;
  },
): number => {
  const tableTopPt = getTableTopPt(cfg, opts.showHeader);
  const showColHeader = opts.pageIdx === 0 || cfg.repeatColumnHeader;
  const headerPt = showColHeader ? (cfg.detailHeaderHeight || DEFAULT_DETAIL_HEADER_HEIGHT) : 0;
  const rowPt = resolveConfigRowPt(cfg);
  const summaryPt = opts.includeSummary ? rowPt : 0;
  return tableTopPt + headerPt + (opts.pageRows.length + opts.emptyPad) * rowPt + summaryPt;
};

interface TableAreaLayout {
  tableTopPt: number;
  tableLeftMm: number;
  areaHeightMm: number;
}

interface TableAreaLayoutOpts {
  pageIdx: number;
  rowCount: number;
  includeSummary: boolean;
  showHeader: boolean;
}

/** 表格区域：设计行高 × 行数，1:1 不缩放 */
const getTableAreaLayout = (cfg: PrintTemplateConfig, opts: TableAreaLayoutOpts): TableAreaLayout => {
  const tableTopPt = getTableTopPt(cfg, opts.showHeader);
  const showColHeader = opts.pageIdx === 0 || cfg.repeatColumnHeader;
  const theadMm = showColHeader ? ptToMm(cfg.detailHeaderHeight || DEFAULT_DETAIL_HEADER_HEIGHT) : 0;
  const rowMm = ptToMm(resolveConfigRowPt(cfg));
  const summaryMm = opts.includeSummary ? rowMm : 0;
  const areaHeightMm = theadMm + opts.rowCount * rowMm + summaryMm;
  return {
    tableTopPt,
    tableLeftMm: (cfg.tableLeft || 0) / PT_PER_MM,
    areaHeightMm,
  };
};

const buildTableAreaStyle = (layout: TableAreaLayout, tableWidthPt: number): string =>
  `position:absolute;left:${layout.tableLeftMm}mm;top:${layout.tableTopPt}pt;width:${tableWidthPt}pt;height:${layout.areaHeightMm}mm`;

const buildTableInnerStyle = (tableWidthPt: number): string =>
  `width:${tableWidthPt}pt;border-collapse:collapse;table-layout:fixed`;

export const buildTitleHtml = (cfg: PrintTemplateConfig, show: boolean): string => {
  if (!show) return '';
  const top = getTitleTopPt(cfg);
  const left = cfg.titleLeft ?? 0;
  const width = cfg.titleWidth ?? 0;
  const base = `position:absolute;top:${top}pt;font-size:${cfg.titleFontSize}pt;font-weight:600;margin:0;padding:0;line-height:1.2;text-align:center;white-space:nowrap;overflow:hidden`;
  if (width > 0) {
    return `<h1 style="${base};left:${left}pt;width:${width}pt">${cfg.title}</h1>`;
  }
  if (left > 0) {
    return `<h1 style="${base};left:${left}pt;right:0">${cfg.title}</h1>`;
  }
  return `<h1 style="${base};left:0;right:0">${cfg.title}</h1>`;
};

/** @deprecated 保留导出避免旧引用报错；打印已改为使用模板原始坐标 */
export const resolveHeaderFields = (cfg: PrintTemplateConfig) => cfg.headerFields.map(f => ({ ...f }));

interface MeasureResult {
  rowHeights: number[];
  measuredRowHeight: number;
  theadHeight: number;
  summaryHeight: number;
  pageNumHeight: number;
}

/** 页底页码区预留（页码 position:absolute 贴底，仅防表格与页码文字重叠） */
const pageFooterReservePx = (m: MeasureResult, showPageNumber: boolean): number =>
  showPageNumber ? m.pageNumHeight + mmToPx(0.5) : mmToPx(1);

const pageContentHeightPx = (cfg: PrintTemplateConfig): number =>
  mmToPx(cfg.paper.height - cfg.paper.marginTop - cfg.paper.marginBottom);

/**
 * 打印样式：
 * - @page margin 固定为 0，避免与 Chrome「边距:无」冲突导致整页比例错乱
 * - 设计边距用 .print-page 的 padding 实现，坐标系仍相对内容区
 * - 100% 原尺寸，不做自动缩放（针式/自定义纸 S1:241×93.1 必须实际大小）
 */
const buildPrintStyles = (cfg: PrintTemplateConfig): string => {
  const landscape = cfg.paper.orientation === 'landscape';
  const pw = landscape ? cfg.paper.height : cfg.paper.width;
  const ph = landscape ? cfg.paper.width : cfg.paper.height;
  const mt = cfg.paper.marginTop;
  const mr = cfg.paper.marginRight;
  const mb = cfg.paper.marginBottom;
  const ml = cfg.paper.marginLeft;
  const pageContentW = Math.max(0, pw - ml - mr);
  const pageContentH = Math.max(0, ph - mt - mb);
  const pageNumMm = cfg.showPageNumber ? PAGE_NUM_MM : 0;
  const mainH = Math.max(0, pageContentH - pageNumMm);
  return `
  @page { size: ${pw}mm ${ph}mm; margin: 0; }
  * { margin:0; padding:0; box-sizing:border-box; }
  html, body { width:${pw}mm; height:auto; }
  body { font-family:"Microsoft YaHei",sans-serif; font-size:9pt; color:#000; }
  .print-page {
    display:flex; flex-direction:column;
    width:${pw}mm; height:${ph}mm;
    padding:${mt}mm ${mr}mm ${mb}mm ${ml}mm;
    overflow:hidden; page-break-inside:avoid; break-inside:avoid;
    page-break-after:always; break-after:page;
  }
  .print-page:last-child { page-break-after:auto; break-after:auto; }
  .print-page-main {
    position:relative; flex:0 0 auto;
    width:${pageContentW}mm; height:${mainH}mm; overflow:hidden;
  }
  .page-num {
    flex:0 0 auto; height:${pageNumMm}mm; box-sizing:border-box;
    text-align:center; font-size:7pt; color:#999;
    font-family:"Microsoft YaHei",sans-serif; line-height:${pageNumMm}mm;
  }
  .table-area { overflow:hidden; }
  table { border-collapse:collapse; table-layout:fixed; }
  td, th { border:0.5pt solid #333; padding:0.8mm 1mm; text-align:center; }
  td.border { border:0.5pt solid #333; }
  th { font-weight:600; background:#f0f0f0; }
  .text-right { text-align:right; }`;
};

const buildFieldsHtml = (
  cfg: PrintTemplateConfig,
  data: BackendData,
  section: 'header' | 'footer' = 'header',
  topDelta = 0,
): string =>
  cfg.headerFields.filter(f => (f.section || 'header') === section).map(f => {
    const type = getHeaderType(f.key, data);
    const val = formatCellValue(data.Tb?.[f.key], type, f.decimalPlaces, f.dateFormat);
    const label = f.showLabel ? `<span style="color:#666;font-size:${f.fontSize - 1}pt">${f.title}：</span>` : '';
    return `<div style="position:absolute;left:${f.left}pt;top:${f.top + topDelta}pt;font-size:${f.fontSize}pt;width:${f.width}pt;font-weight:${f.bold ? 'bold' : 'normal'};text-align:${f.align};white-space:nowrap;overflow:hidden">${label}<span>${val}</span></div>`;
  }).join('\n  ');

const replacePlaceholders = (text: string, data: BackendData): string =>
  text.replace(/\{([^{}]+)\}/g, (_, key: string) => {
    const k = key.trim();
    const type = getHeaderType(k, data);
    const val = data.Tb?.[k];
    return val == null ? '' : formatCellValue(val, type);
  });

const generateBarcodeCache = async (
  cfg: PrintTemplateConfig,
  data: BackendData,
): Promise<Map<FreeElementConfig, string>> => {
  const cache = new Map<FreeElementConfig, string>();
  if (typeof document === 'undefined') return cache;
  for (const e of cfg.freeElements) {
    if (e.type !== 'barcode' && e.type !== 'qrcode') continue;
    const content = replacePlaceholders(e.content || ' ', data) || ' ';
    try {
      if (e.type === 'barcode') {
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, content, {
          format: e.barcodeFormat || 'CODE128',
          width: 2, height: 50, displayValue: true, fontSize: 8, margin: 2,
        });
        cache.set(e, canvas.toDataURL('image/png'));
      } else {
        cache.set(e, await QRCode.toDataURL(content, { width: 200, margin: 1 }));
      }
    } catch { /* 内容不合法（如 EAN13 校验失败），跳过 */ }
  }
  return cache;
};

const buildFreeHtml = (
  cfg: PrintTemplateConfig,
  section: 'header' | 'footer',
  data: BackendData,
  barcodeCache?: Map<FreeElementConfig, string>,
  topDelta = 0,
): string =>
  cfg.freeElements.filter(e => (e.section || 'header') === section).map(e => {
    const pos = `position:absolute;left:${e.left}pt;top:${e.top + topDelta}pt`;
    if (e.type === 'hline') return `<div style="${pos};width:${e.width}pt;border-top:0.5pt solid #333;height:1pt"></div>`;
    if (e.type === 'barcode' || e.type === 'qrcode') {
      const url = barcodeCache?.get(e);
      if (!url) return '';
      return `<img src="${url}" style="${pos};width:${e.width}pt;height:${e.height}pt">`;
    }
    const content = replacePlaceholders(e.content || '', data);
    return `<div style="${pos};width:${e.width}pt;font-size:${e.fontSize || 9}pt">${content}</div>`;
  }).join('\n  ');

const buildColHeadersHtml = (visCols: PrintTemplateConfig['detailColumns']): string =>
  visCols.map(c =>
    `<th style="width:${c.width}pt;text-align:${c.align};border:0.5pt solid #333;padding:0.3mm 0.6mm;font-weight:600;background:#f0f0f0;font-size:8pt;line-height:1.1;white-space:nowrap;overflow:hidden">${c.title}</th>`
  ).join('\n        ');

const resolveRowHeightPt = (cfg: PrintTemplateConfig, _measure?: MeasureResult): number =>
  resolveConfigRowPt(cfg);

const buildDetailRowHtml = (
  row: Record<string, unknown>,
  rowNum: number,
  visCols: PrintTemplateConfig['detailColumns'],
  cfg: PrintTemplateConfig,
  data: BackendData,
  rowClass = '',
  rowHeightPt?: number,
): string => {
  const rowH = rowHeightPt ?? (cfg.detailRowHeight || DEFAULT_DETAIL_ROW_HEIGHT);
  const cells = visCols.map(c => {
    const type = getColType(c.key, cfg, data);
    const val = formatCellValue(row[c.key], type, c.decimalPlaces);
    return `<td style="text-align:${c.align};border:0.5pt solid #333;padding:0.3mm 0.6mm;font-size:8pt;line-height:1.1;white-space:nowrap;overflow:hidden">${val}</td>`;
  }).join('\n          ');
  const cls = rowClass ? ` class="${rowClass}"` : '';
  return `        <tr${cls} style="height:${rowH}pt">\n          <td style="border:0.5pt solid #333;padding:0.3mm 0.6mm;font-size:8pt;line-height:1.1;text-align:center;white-space:nowrap;overflow:hidden">${rowNum}</td>\n          ${cells}\n        </tr>`;
};

const buildEmptyDetailRowHtml = (cfg: PrintTemplateConfig, visCols: PrintTemplateConfig['detailColumns'], rowHeightPt?: number): string => {
  const rowH = rowHeightPt ?? (cfg.detailRowHeight || DEFAULT_DETAIL_ROW_HEIGHT);
  return `<tr style="height:${rowH}pt"><td style="border:0.5pt solid #333;padding:0.3mm 0.6mm;font-size:8pt">&nbsp;</td>${visCols.map(() => '<td style="border:0.5pt solid #333;padding:0.3mm 0.6mm;font-size:8pt">&nbsp;</td>').join('')}</tr>`;
};

/** 在固定高度表格内撑满剩余空间（表格边框延伸到底） */
const buildFillRowHtml = (visCols: PrintTemplateConfig['detailColumns']): string =>
  `<tr class="table-fill"><td colspan="${visCols.length + 1}" style="border-left:0.5pt solid #333;border-right:0.5pt solid #333;border-bottom:0.5pt solid #333;height:100%;padding:0;line-height:0;font-size:0;vertical-align:top">&nbsp;</td></tr>`;

/**
 * 汇总行：同一行显示；# 与第一列合并为「合计」；数值列只显示数字不加「合计：」。
 */
const buildSummaryRowsHtml = (
  cfg: PrintTemplateConfig,
  visCols: PrintTemplateConfig['detailColumns'],
  rows: Record<string, unknown>[],
  summaryClass = '',
): string => {
  const summaries = cfg.summaryRows.filter(s => s.position === 'footer' && s.field);
  if (!summaries.length) return '';

  const used = new Set<string>();
  const restCols = visCols.slice(1);
  const restCells = restCols.map(c => {
    const matched = summaries.filter(s => s.field === c.key);
    if (!matched.length) {
      return `<td style="border:0.5pt solid #333;padding:0.3mm 0.6mm;font-size:8pt">&nbsp;</td>`;
    }
    matched.forEach(s => used.add(`${s.method}:${s.field}`));
    const text = matched.map(s => computeSummary(s, visCols, rows)).join('　');
    return `<td class="border text-right font-bold" style="border:0.5pt solid #333;padding:0.3mm 0.6mm;font-size:8pt;text-align:right;font-weight:700;white-space:nowrap">${text}</td>`;
  }).join('');

  const firstCol = visCols[0];
  if (firstCol) {
    summaries.filter(s => s.field === firstCol.key).forEach(s => used.add(`${s.method}:${s.field}`));
  }

  const leftovers = summaries.filter(s => !used.has(`${s.method}:${s.field}`));
  const firstColVals = firstCol
    ? summaries.filter(s => s.field === firstCol.key).map(s => computeSummary(s, visCols, rows))
    : [];
  const leftoverText = leftovers.map(s => {
    const colName = visCols.find(c => c.key === s.field)?.title || s.field;
    return `${colName}：${computeSummary(s, visCols, rows)}`;
  }).join('　');

  const labelParts = ['合计', ...firstColVals, leftoverText].filter(Boolean);
  const labelText = labelParts.join('　');
  const cls = summaryClass ? ` class="${summaryClass}"` : '';
  const rowH = cfg.detailRowHeight || DEFAULT_DETAIL_ROW_HEIGHT;
  const labelCell = `<td class="border font-bold" colspan="2" style="border:0.5pt solid #333;padding:0.3mm 0.6mm;font-size:8pt;text-align:left;font-weight:700;white-space:nowrap">${labelText}</td>`;

  if (!visCols.length) {
    return `<tr${cls} style="height:${rowH}pt">${labelCell}</tr>`;
  }
  return `<tr${cls} style="height:${rowH}pt">${labelCell}${restCells}</tr>`;
};

const measureTheadAndSummary = async (
  cfg: PrintTemplateConfig,
  data: BackendData,
): Promise<Pick<MeasureResult, 'measuredRowHeight' | 'theadHeight' | 'summaryHeight' | 'pageNumHeight'>> => {
  const visCols = visibleDetailColumns(cfg);
  const tableWidthPt = detailTableWidthPt(cfg, visCols);
  const contentWidthMm = ptToMm(tableWidthPt);
  const colHeadersHtml = buildColHeadersHtml(visCols);
  const sampleRow = (data.TbDetail?.[0] || {}) as Record<string, unknown>;
  const detailRowHtml = buildDetailRowHtml(sampleRow, 1, visCols, cfg, data, 'measure-row');
  const theadHtml = `<thead><tr style="height:${cfg.detailHeaderHeight || DEFAULT_DETAIL_HEADER_HEIGHT}pt"><th style="width:${cfg.sequenceColumnWidth || DEFAULT_SEQUENCE_COL_WIDTH}pt;border:0.5pt solid #333;padding:0.8mm 1mm;font-size:8pt;background:#f0f0f0;white-space:nowrap">#</th>${colHeadersHtml}</tr></thead>`;
  const summaryHtml = buildSummaryRowsHtml(cfg, visCols, data.TbDetail || [], 'summary-row');

  const container = document.createElement('div');
  container.setAttribute('aria-hidden', 'true');
  container.style.cssText = `position:fixed;left:-10000px;top:0;visibility:hidden;width:${contentWidthMm}mm`;
  container.innerHTML = `
    <table style="width:${tableWidthPt}pt;border-collapse:collapse;table-layout:fixed">${theadHtml}<tbody>${detailRowHtml}${summaryHtml}</tbody></table>
    <div class="page-num" style="font-size:7pt;line-height:1.2">第 1 页 / 共 1 页</div>`;
  document.body.appendChild(container);
  await awaitLayoutReady();

  const measuredRowHeight = elHeight(container.querySelector('tr.measure-row'))
    || ptToPx(cfg.detailRowHeight || DEFAULT_DETAIL_ROW_HEIGHT);
  const result = {
    measuredRowHeight,
    theadHeight: elHeight(container.querySelector('thead')),
    summaryHeight: elHeight(container.querySelector('tr.summary-row')),
    pageNumHeight: elHeight(container.querySelector('.page-num')) || mmToPx(3),
  };
  document.body.removeChild(container);
  return result;
};

const measurePrintLayout = async (cfg: PrintTemplateConfig, data: BackendData): Promise<MeasureResult> => ({
  rowHeights: [],
  ...(await measureTheadAndSummary(cfg, data)),
});

interface PageBuildOpts {
  pageIdx: number;
  pageRows: Record<string, unknown>[];
  globalStartIdx: number;
  totalPages: number;
  includeSummary: boolean;
  emptyPad?: number;
  barcodeCache?: Map<FreeElementConfig, string>;
}

const buildTableBodyHtml = (
  cfg: PrintTemplateConfig,
  data: BackendData,
  opts: PageBuildOpts,
): string => {
  if (!isSectionVisible(cfg, 'detail')) return '';
  const visCols = visibleDetailColumns(cfg);
  const tableWidthPt = detailTableWidthPt(cfg, visCols);
  const colHeadersHtml = buildColHeadersHtml(visCols);
  const showColHeader = opts.pageIdx === 0 || cfg.repeatColumnHeader;
  const emptyPad = opts.emptyPad ?? 0;
  const rowPt = resolveConfigRowPt(cfg);
  const headerPt = cfg.detailHeaderHeight || DEFAULT_DETAIL_HEADER_HEIGHT;
  const summaryRows = opts.includeSummary ? 1 : 0;
  const layout = getTableAreaLayout(cfg, {
    pageIdx: opts.pageIdx,
    rowCount: opts.pageRows.length + emptyPad + summaryRows,
    includeSummary: false,
    showHeader: shouldShowHeader(cfg, opts.pageIdx),
  });

  const detailRows = opts.pageRows.map((row, i) =>
    buildDetailRowHtml(row, opts.globalStartIdx + i + 1, visCols, cfg, data, '', rowPt)
  ).join('\n');

  const emptyRowsHtml = emptyPad > 0
    ? Array.from({ length: emptyPad }, () => buildEmptyDetailRowHtml(cfg, visCols, rowPt)).join('\n')
    : '';

  const summaryRowsHtml = opts.includeSummary
    ? buildSummaryRowsHtml(cfg, visCols, data.TbDetail || [])
    : '';

  const colGroupHtml = `<colgroup><col style="width:${cfg.sequenceColumnWidth || DEFAULT_SEQUENCE_COL_WIDTH}pt">${visCols.map(c => `<col style="width:${c.width}pt">`).join('')}</colgroup>`;
  const theadHtml = `<thead><tr style="height:${headerPt}pt"><th style="width:${cfg.sequenceColumnWidth || DEFAULT_SEQUENCE_COL_WIDTH}pt;border:0.5pt solid #333;padding:0.3mm 0.6mm;font-size:8pt;line-height:1.1;background:#f0f0f0;white-space:nowrap;overflow:hidden">#</th>${colHeadersHtml}</tr></thead>`;

  return `<div class="table-area" style="${buildTableAreaStyle(layout, tableWidthPt)}">
    <table style="${buildTableInnerStyle(tableWidthPt)}">
      ${colGroupHtml}
      ${showColHeader ? theadHtml : ''}
      <tbody>${detailRows}${emptyRowsHtml}${summaryRowsHtml}</tbody>
    </table>
  </div>`;
};

const buildSinglePageInnerHtml = (
  cfg: PrintTemplateConfig,
  data: BackendData,
  opts: PageBuildOpts,
): string => {
  const showHeader = shouldShowHeader(cfg, opts.pageIdx);
  const showTitle = isSectionVisible(cfg, 'header') && opts.pageIdx === 0;
  const showFooter = shouldShowFooter(cfg, opts.pageIdx, opts.totalPages);
  const emptyPad = opts.emptyPad ?? 0;

  // 末页下部分：锚定在表格底边之后（区内字段保持与设计稿相对位置）
  const tableBottomPt = getTableBottomPt(cfg, {
    pageIdx: opts.pageIdx,
    pageRows: opts.pageRows,
    emptyPad,
    includeSummary: opts.includeSummary,
    showHeader,
  });
  const footerSectionTop = cfg.sections?.footer?.top ?? tableBottomPt;
  const footerTopDelta = showFooter ? (tableBottomPt - footerSectionTop) : 0;
  const footerTextTop = (cfg.sections?.footer?.top ?? tableBottomPt) + footerTopDelta;

  return `
    ${buildTitleHtml(cfg, showTitle)}
    ${showHeader ? buildFieldsHtml(cfg, data, 'header') + buildFreeHtml(cfg, 'header', data, opts.barcodeCache) : ''}
    ${buildTableBodyHtml(cfg, data, { ...opts, emptyPad })}
    ${showFooter ? buildFieldsHtml(cfg, data, 'footer', footerTopDelta) + buildFreeHtml(cfg, 'footer', data, opts.barcodeCache, footerTopDelta) : ''}
    ${showFooter && cfg.footerText ? `<div style="position:absolute;left:10pt;top:${footerTextTop}pt;font-size:8pt;color:#666">${cfg.footerText}</div>` : ''}`;
};

/** 从 PrintTemplateConfig 渲染为打印 HTML（按页类型容量分页） */
export const renderFromConfig = (
  cfg: PrintTemplateConfig,
  data: BackendData,
  pages?: Record<string, unknown>[][],
  _measure?: MeasureResult,
  emptyPads?: number[],
  _fillFlags?: boolean[],
  barcodeCache?: Map<FreeElementConfig, string>,
): string => {
  ensurePrintConfig(cfg);
  const allRows = (data.TbDetail || []) as Record<string, unknown>[];
  const hasSummary = cfg.summaryRows.some(s => s.position === 'footer');
  const paginated = pages
    ? { pages, capacities: pages.map(p => Math.max(p.length, 1)) }
    : paginateByPageKind(allRows, cfg, hasSummary);
  const resolvedPages = paginated.pages;
  if (resolvedPages.length === 0) resolvedPages.push([]);

  const totalPages = resolvedPages.length;
  const lastPageIdx = totalPages - 1;

  let globalStart = 0;

  const bodyHtml = resolvedPages.map((pageRows, pageIdx) => {
    const isLast = pageIdx === lastPageIdx;
    const pageCap = paginated.capacities[pageIdx] ?? resolveRowsPerPage(cfg);
    const emptyPad = emptyPads?.[pageIdx]
      ?? (!isLast ? Math.max(0, pageCap - pageRows.length) : 0);

    const inner = buildSinglePageInnerHtml(cfg, data, {
      pageIdx,
      pageRows,
      globalStartIdx: globalStart,
      totalPages,
      includeSummary: isLast && hasSummary,
      emptyPad,
      barcodeCache,
    });
    globalStart += pageRows.length;

    const pageNumHtml = cfg.showPageNumber
      ? `<div class="page-num">第 ${pageIdx + 1} 页 / 共 ${totalPages} 页</div>`
      : '';

    return `  <div class="print-page" style="page-break-after:${pageIdx < lastPageIdx ? 'always' : 'auto'}">
    <div class="print-page-main">${inner}</div>
    ${pageNumHtml}
  </div>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${cfg.title}</title>
<style>${buildPrintStyles(cfg)}</style>
</head>
<body>
  ${bodyHtml}
</body>
</html>`;
};

/** 按页类型容量分页渲染：单页含头尾，续页去掉表头 */
export const renderFromConfigAsync = async (cfg: PrintTemplateConfig, data: BackendData): Promise<string> => {
  ensurePrintConfig(cfg);
  const allRows = (data.TbDetail || []) as Record<string, unknown>[];
  const barcodeCache = await generateBarcodeCache(cfg, data);
  const hasSummary = cfg.summaryRows.some(s => s.position === 'footer');
  const { pages, capacities } = paginateByPageKind(allRows, cfg, hasSummary);
  const lastIdx = pages.length - 1;
  const emptyPads = pages.map((pageRows, pageIdx) =>
    pageIdx !== lastIdx ? Math.max(0, (capacities[pageIdx] ?? 0) - pageRows.length) : 0,
  );
  return renderFromConfig(cfg, data, pages, undefined, emptyPads, undefined, barcodeCache);
};

const GENERIC_HTML = (formType: string, data: BackendData, paper = 'A4'): string => {
  const tbKeys = (data.TbHeaders || []).filter(h => h.IsPrint !== false).map(h => h.Key);
  const detailKeys = (data.TbDetailHeaders || []).filter(h => h.Visible !== false).map(h => ({ key: h.Key, title: h.Title, type: h.Type }));

  const headerFields = tbKeys.map(k => {
    const h = data.TbHeaders?.find(x => x.Key === k);
    const v = formatCellValue(data.Tb?.[k], h?.Type || '');
    return `<span style="display:inline-block;margin-right:4mm"><strong>${k}：</strong>${v}</span>`;
  }).join('\n  ');

  const colHeaders = detailKeys.map(d => `<th style="border:0.5pt solid #333;padding:1mm;font-size:8pt;background:#f0f0f0">${d.title}</th>`).join('\n        ');
  const detailRows = (data.TbDetail || []).map(row => {
    const cells = detailKeys.map(d => `<td style="border:0.5pt solid #333;padding:1mm;font-size:8pt">${formatCellValue(row[d.key], d.type || '')}</td>`).join('\n          ');
    return `        <tr>\n          ${cells}\n        </tr>`;
  }).join('\n');

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>${formType}</title>
<style>
  @page { size: ${paper}; margin: 10mm 8mm; }
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family:"Microsoft YaHei",sans-serif; font-size:9pt; color:#000; }
  h1 { text-align:center; font-size:16pt; font-weight:600; margin-bottom:4mm; }
  .header { margin-bottom:2mm; }
  table { width:100%; border-collapse:collapse; }
  th, td { border:0.5pt solid #333; padding:1mm; text-align:center; }
</style>
</head>
<body>
  <h1>${formType}</h1>
  <div class="header">${headerFields}</div>
  <hr style="margin:2mm 0">
  <table>
    <thead><tr><th style="width:6%">#</th>${colHeaders}</tr></thead>
    <tbody>${detailRows || '<tr><td colspan="100" style="text-align:center;padding:2mm">无明细</td></tr>'}</tbody>
  </table>
</body>
</html>`;
};

export interface ResolveTemplateOptions {
  formType: string;
  data?: BackendData;
  store?: TemplateStore;
  /** Static HTML string used when no JSON designer template is saved */
  fallbackHtml?: string;
}

/**
 * Resolve printable HTML.
 * Priority: JSON designer template → fallbackHtml → generic dynamic HTML
 */
export const getHtmlTemplate = async (opts: ResolveTemplateOptions): Promise<string | null> => {
  const { formType, data, fallbackHtml } = opts;
  const store = getStore(opts.store);

  if (data) {
    try {
      const templateJson = await store.load(formType);
      if (templateJson) {
        const parsed = JSON.parse(templateJson);
        if (parsed.paper && parsed.version) {
          return renderFromConfigAsync(parsed as PrintTemplateConfig, data);
        }
      }
    } catch (e) {
      console.warn('[vue-bill-print] designer template load failed:', e);
    }
  }

  if (fallbackHtml) return fallbackHtml;

  if (data) return GENERIC_HTML(formType, data);
  return null;
};

/** 替换 {{Tb.字段}} 和 {{#each TbDetail}} 占位符 */
const renderTemplate = (template: string, data: BackendData): string => {
  let result = template.replace(/{{#each\s+TbDetail}}([\s\S]*?){{\/each}}/g, (_, block: string) => {
    if (!data.TbDetail?.length) return '';
    return data.TbDetail.map(row => {
      let html = block;
      for (const [k, v] of Object.entries(row)) html = html.replace(new RegExp(`\\{\\{${escapeRegExp(k)}\\}\\}`, 'g'), formatValue(v));
      return html;
    }).join('');
  });
  if (data.Tb) {
    for (const [k, v] of Object.entries(data.Tb)) result = result.replace(new RegExp(`\\{\\{Tb\\.${escapeRegExp(k)}\\}\\}`, 'g'), formatValue(v));
  }
  return result.replace(/\{\{[\s\S]*?\}\}/g, '');
};

const escapeRegExp = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const formatValue = (val: unknown) => val == null || val === '' ? '' : String(val);

/**
 * Open a print window with the resolved HTML.
 * Prefer the higher-level `printBill()` from `./print`.
 */
export const htmlPrint = async (
  formType: string,
  backendData: BackendData,
  opts?: { store?: TemplateStore; fallbackHtml?: string; onMessage?: (level: 'error' | 'warning' | 'success' | 'info', text: string) => void },
): Promise<void> => {
  const template = await getHtmlTemplate({
    formType,
    data: backendData,
    store: opts?.store,
    fallbackHtml: opts?.fallbackHtml,
  });
  if (!template) {
    emitMessage('error', st('render.templateNotFound', formType), opts?.onMessage);
    return;
  }

  const trimmed = template.trimStart();
  const html = trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html')
    ? template
    : renderTemplate(template, backendData);
  const printWindow = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
  if (!printWindow) {
    emitMessage('error', st('render.printBlocked'), opts?.onMessage);
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();
  const hasPrinted = { current: false };
  const safeClose = () => { try { printWindow.close(); } catch { /* ignore */ } };
  printWindow.onafterprint = () => { hasPrinted.current = true; safeClose(); };
  printWindow.onload = () => {
    if (hasPrinted.current) return;
    hasPrinted.current = true;
    printWindow.focus();
    printWindow.print();
  };
  setTimeout(() => {
    if (hasPrinted.current) return;
    hasPrinted.current = true;
    try { printWindow.focus(); printWindow.print(); } catch { /* ignore */ }
    setTimeout(safeClose, 500);
  }, 800);
};
