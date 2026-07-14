import type { PrintTemplateConfig } from './types';

/**
 * 内置默认模板。
 * key 为 designer 的 formType（即 playground 传入的模板 label，如 "销售出库"）。
 * 首次打开 / 点击「重置示例」时，若该 formType 无已保存模板且存在此处默认，
 * 则直接载入该版式；否则回退到 seedFromBackend() 自动铺字段。
 *
 * 坐标单位：字段 left/top 为 pt，纸张 width/height 为 mm。
 */
export const BUILTIN_DEFAULTS: Record<string, PrintTemplateConfig> = {
  '销售出库': {
    paper: {
      width: 241,
      height: 93,
      orientation: 'portrait',
      marginTop: 0,
      marginRight: 0,
      marginBottom: 0,
      marginLeft: 0,
    },
    sections: {
      header: {
        key: 'header',
        title: '上部分',
        top: 20,
        height: 50,
        visible: true,
        autoFlow: true,
        printMode: 'first',
      },
      detail: {
        key: 'detail',
        title: '单据体',
        top: 70,
        height: 180,
        visible: true,
        autoFlow: true,
      },
      footer: {
        key: 'footer',
        title: '下部分',
        top: 252.0325110283591,
        height: 20,
        visible: true,
        autoFlow: true,
        printMode: 'last',
      },
    },
    headerFields: [
      { key: '单据编号', title: '单据编号', left: 20, top: 30, fontSize: 9, width: 120, bold: false, align: 'left', showLabel: true, section: 'header' },
      { key: '客户', title: '客户', left: 162.5178665190121, top: 28.747467445626782, fontSize: 9, width: 120, bold: false, align: 'left', showLabel: true, section: 'header' },
      { key: '仓库', title: '仓库', left: 518.185602701592, top: 54.51327280481327, fontSize: 9, width: 120, bold: false, align: 'left', showLabel: true, section: 'header' },
      { key: '业务员', title: '业务员', left: 22.24977258358606, top: 58.50754720301193, fontSize: 9, width: 120, bold: false, align: 'left', showLabel: true, section: 'header' },
      { key: '日期', title: '日期', left: 515.1195638862173, top: 29.49756420463976, fontSize: 9, width: 120, bold: false, align: 'left', showLabel: true, section: 'header' },
      { key: '备注', title: '备注', left: 264.55913606033033, top: 56.00410384803342, fontSize: 9, width: 120, bold: false, align: 'left', showLabel: true, section: 'header' },
    ],
    detailColumns: [
      { key: '货品编码', title: '编码', width: 120, align: 'center', visible: true, type: 'String' },
      { key: '货品名称', title: '名称', width: 140, align: 'center', visible: true, type: 'String' },
      { key: '规格', title: '规格', width: 140, align: 'center', visible: true, type: 'String' },
      { key: '单位', title: '单位', width: 50, align: 'center', visible: true, type: 'String' },
      { key: '数量', title: '数量', width: 50, align: 'center', visible: true, type: 'Number' },
      { key: '单价', title: '单价', width: 50, align: 'center', visible: true, type: 'Decimal' },
      { key: '金额', title: '金额', width: 50, align: 'center', visible: true, type: 'Decimal' },
    ],
    freeElements: [
      { type: 'text', left: 106.36371127158506, top: 250.62610249634622, width: 100, height: 16, content: '签字：', fontSize: 9, section: 'footer' },
    ],
    summaryRows: [],
    tableLeft: 10,
    tableTop: 70,
    sequenceColumnWidth: 20,
    detailHeaderHeight: 14,
    detailRowHeight: 13,
    allowTableOverflow: true,
    headerNoWrap: true,
    title: '销售出库',
    titleFontSize: 14,
    titleTop: 0.9938873621467677,
    titleLeft: 0,
    titleWidth: 0,
    titleMarginBottom: 1,
    rowsPerPage: 11,
    repeatHeader: true,
    repeatColumnHeader: true,
    footerText: '',
    showPageNumber: true,
    version: 3,
  },
};

/** 深拷贝内置默认模板（避免外部直接修改常量） */
export const getBuiltinDefault = (formType: string): PrintTemplateConfig | null => {
  const tpl = BUILTIN_DEFAULTS[formType];
  if (!tpl) return null;
  return JSON.parse(JSON.stringify(tpl)) as PrintTemplateConfig;
};
