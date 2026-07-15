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
      header: { key: 'header', title: '上部分', top: 0, height: 56, visible: true, autoFlow: true, printMode: 'first' },
      detail: { key: 'detail', title: '单据体', top: 57, height: 190, visible: true, autoFlow: true },
      footer: { key: 'footer', title: '下部分', top: 248, height: 16, visible: true, autoFlow: true, printMode: 'last' },
    },
    // 表头：3 列 × 2 行网格，充分利用纸张宽度（与 sampleOutbound.Tb 字段一一对应）
    headerFields: [
      { key: '单据编号', title: '单据编号', left: 14, top: 20, fontSize: 9, width: 130, bold: false, align: 'left', showLabel: true, section: 'header' },
      { key: '客户', title: '客户', left: 178, top: 20, fontSize: 9, width: 200, bold: false, align: 'left', showLabel: true, section: 'header' },
      { key: '仓库', title: '仓库', left: 458, top: 20, fontSize: 9, width: 110, bold: false, align: 'left', showLabel: true, section: 'header' },
      { key: '业务员', title: '业务员', left: 14, top: 39, fontSize: 9, width: 130, bold: false, align: 'left', showLabel: true, section: 'header' },
      { key: '日期', title: '日期', left: 178, top: 39, fontSize: 9, width: 130, bold: false, align: 'left', showLabel: true, section: 'header' },
      { key: '备注', title: '备注', left: 342, top: 39, fontSize: 9, width: 226, bold: false, align: 'left', showLabel: true, section: 'header' },
    ],
    // 明细：与 sampleOutbound.TbDetail 字段一一对应
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
      { type: 'text', left: 14, top: 249, width: 200, height: 14, content: '签字：', fontSize: 9, section: 'footer' },
    ],
    summaryRows: [],
    tableLeft: 10,
    tableTop: 57,
    sequenceColumnWidth: 20,
    detailHeaderHeight: 14,
    detailRowHeight: 13,
    allowTableOverflow: true,
    headerNoWrap: true,
    title: '销售出库',
    titleFontSize: 14,
    titleTop: 3,
    titleLeft: 0,
    titleWidth: 0,
    titleMarginBottom: 1,
    rowsPerPage: 12,
    repeatHeader: true,
    repeatColumnHeader: true,
    footerText: '',
    showPageNumber: true,
    version: 3,
  },
  '采购订单': {
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
      header: { key: 'header', title: '上部分', top: 0, height: 55, visible: true, autoFlow: true, printMode: 'first' },
      detail: { key: 'detail', title: '单据体', top: 56, height: 190, visible: true, autoFlow: true },
      footer: { key: 'footer', title: '下部分', top: 246.09736584444164, height: 20, visible: true, autoFlow: true, printMode: 'last' },
    },
    headerFields: [
      { key: '订单编号', title: '订单编号', left: 14.748804993456325, top: 19.746306337471104, fontSize: 9, width: 120, bold: false, align: 'left', showLabel: true, section: 'header' },
      { key: '供应商', title: '供应商', left: 162.83664848513803, top: 21.002709252363257, fontSize: 9, width: 120, bold: false, align: 'left', showLabel: true, section: 'header' },
      { key: '采购员', title: '采购员', left: 160.27696160791544, top: 36.99853179476949, fontSize: 9, width: 120, bold: false, align: 'left', showLabel: true, section: 'header' },
      { key: '交货仓库', title: '交货仓库', left: 515.3164734419128, top: 17.496016060432183, fontSize: 9, width: 120, bold: false, align: 'left', showLabel: true, section: 'header' },
      { key: '下单日期', title: '下单日期', left: 13.998708234443352, top: 42.24920910786031, fontSize: 9, width: 120, bold: false, align: 'left', showLabel: true, section: 'header' },
      { key: '预计到货', title: '预计到货', left: 518.3168604779646, top: 31.747854481678687, fontSize: 9, width: 120, bold: false, align: 'left', showLabel: true, section: 'header' },
      { key: '备注', title: '备注', left: 55.25398419788401, top: 250.8698702083435, fontSize: 9, width: 120, bold: false, align: 'left', showLabel: true, section: 'footer' },
    ],
    detailColumns: [
      { key: '物料编码', title: '编码', width: 120, align: 'center', visible: true, type: 'String' },
      { key: '物料名称', title: '名称', width: 140, align: 'center', visible: true, type: 'String' },
      { key: '规格', title: '规格', width: 140, align: 'center', visible: true, type: 'String' },
      { key: '单位', title: '单位', width: 50, align: 'center', visible: true, type: 'String' },
      { key: '数量', title: '数量', width: 50, align: 'center', visible: true, type: 'Number' },
      { key: '单价', title: '单价', width: 50, align: 'center', visible: true, type: 'Decimal' },
      { key: '金额', title: '金额', width: 50, align: 'center', visible: true, type: 'Decimal' },
    ],
    freeElements: [],
    summaryRows: [],
    tableLeft: 10,
    tableTop: 56,
    sequenceColumnWidth: 20,
    detailHeaderHeight: 14,
    detailRowHeight: 13,
    allowTableOverflow: true,
    headerNoWrap: true,
    title: '采购订单',
    titleFontSize: 14,
    titleTop: 0,
    titleLeft: 0,
    titleWidth: 0,
    titleMarginBottom: 1,
    rowsPerPage: 12,
    repeatHeader: true,
    repeatColumnHeader: true,
    footerText: '',
    showPageNumber: true,
    version: 3,
  },
  '采购入库': {
    paper: {
      width: 241,
      height: 93,
      orientation: 'portrait',
      marginTop: 8,
      marginRight: 6,
      marginBottom: 8,
      marginLeft: 6,
    },
    sections: {
      header: { key: 'header', title: '上部分', top: 0, height: 55, visible: true, autoFlow: true, printMode: 'first' },
      detail: { key: 'detail', title: '单据体', top: 56, height: 225, visible: true, autoFlow: true },
      footer: { key: 'footer', title: '下部分', top: 285.81280187767135, height: 20, visible: true, autoFlow: true, printMode: 'last' },
    },
    headerFields: [
      { key: '入库单号', title: '入库单号', left: 5.475008299191671, top: 15.237192928631675, fontSize: 9, width: 120, bold: false, align: 'left', showLabel: true, section: 'header' },
      { key: '供应商', title: '供应商', left: 159.97253622582483, top: 16.523324022221562, fontSize: 9, width: 120, bold: false, align: 'left', showLabel: true, section: 'header' },
      { key: '仓库', title: '仓库', left: 446.9335423738778, top: 17.57955656276996, fontSize: 9, width: 120, bold: false, align: 'left', showLabel: true, section: 'header' },
      { key: '验收员', title: '验收员', left: 54.01785481852906, top: 289.97625198607403, fontSize: 9, width: 120, bold: false, align: 'left', showLabel: true, section: 'header' },
      { key: '入库日期', title: '入库日期', left: 556.8796883950977, top: 19.4806478356229, fontSize: 9, width: 120, bold: false, align: 'left', showLabel: true, section: 'header' },
      { key: '关联订单', title: '关联订单', left: 6.171649921686832, top: 38.89481645506558, fontSize: 9, width: 120, bold: false, align: 'left', showLabel: true, section: 'header' },
      { key: '备注', title: '备注', left: 430.61566962770314, top: 38.81642288466677, fontSize: 9, width: 120, bold: false, align: 'left', showLabel: true, section: 'header' },
    ],
    detailColumns: [
      { key: '物料编码', title: '编码', width: 120, align: 'center', visible: true, type: 'String' },
      { key: '物料名称', title: '名称', width: 120, align: 'center', visible: true, type: 'String' },
      { key: '规格', title: '规格', width: 120, align: 'center', visible: true, type: 'String' },
      { key: '单位', title: '单位', width: 50, align: 'center', visible: true, type: 'String' },
      { key: '应收', title: '应收', width: 50, align: 'center', visible: true, type: 'Number' },
      { key: '实收', title: '实收', width: 50, align: 'center', visible: true, type: 'Number' },
      { key: '金额', title: '金额', width: 50, align: 'center', visible: true, type: 'Decimal' },
    ],
    freeElements: [],
    summaryRows: [],
    tableLeft: 10,
    tableTop: 56,
    sequenceColumnWidth: 20,
    detailHeaderHeight: 14,
    detailRowHeight: 13,
    allowTableOverflow: true,
    headerNoWrap: true,
    title: '采购入库',
    titleFontSize: 14,
    titleTop: 0,
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
