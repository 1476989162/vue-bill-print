import type { BackendData } from 'vue-bill-print';

/** Demo sales outbound bill */
export const sampleOutbound: BackendData = {
  Identify: 1001,
  Tb: {
    单据类型: '销售出库',
    单据编号: 'XSCK-20260714-001',
    客户: '山东示例商贸有限公司',
    仓库: '成品仓',
    业务员: '张三',
    日期: '2026-07-14',
    备注: '针式短纸演示 · 请在设计器中保存模板后再点打印',
  },
  TbDetail: [
    { 货品编码: 'P001', 货品名称: '不锈钢螺丝 M6', 规格: 'M6×20', 单位: '盒', 数量: 12, 单价: 18.5, 金额: 222 },
    { 货品编码: 'P002', 货品名称: '密封圈', 规格: 'Φ32', 单位: '个', 数量: 40, 单价: 2.3, 金额: 92 },
    { 货品编码: 'P003', 货品名称: '轴承 6202', 规格: '6202-2RS', 单位: '套', 数量: 8, 单价: 15, 金额: 120 },
    { 货品编码: 'P004', 货品名称: '润滑脂', 规格: '1kg', 单位: '桶', 数量: 3, 单价: 45, 金额: 135 },
    { 货品编码: 'P005', 货品名称: '包装纸箱', 规格: '中号', 单位: '个', 数量: 10, 单价: 3.2, 金额: 32 },
    { 货品编码: 'P006', 货品名称: '标签纸', 规格: '50×30', 单位: '卷', 数量: 5, 单价: 12, 金额: 60 },
    { 货品编码: 'P007', 货品名称: '扎带', 规格: '200mm', 单位: '包', 数量: 6, 单价: 8, 金额: 48 },
    { 货品编码: 'P008', 货品名称: '泡沫垫', 规格: 'A4', 单位: '张', 数量: 20, 单价: 1.5, 金额: 30 },
    { 货品编码: 'P009', 货品名称: '胶带', 规格: '48mm', 单位: '卷', 数量: 4, 单价: 6, 金额: 24 },
    { 货品编码: 'P010', 货品名称: '说明书', 规格: '中文', 单位: '本', 数量: 12, 单价: 0.8, 金额: 9.6 },
    { 货品编码: 'P011', 货品名称: '合格证', 规格: '标准', 单位: '张', 数量: 12, 单价: 0.2, 金额: 2.4 },
    { 货品编码: 'P012', 货品名称: '配件袋', 规格: '小号', 单位: '个', 数量: 12, 单价: 0.5, 金额: 6 },
  ],
  TbHeaders: [
    { Key: '单据编号', Title: '单据编号', Type: 'String', Visible: true },
    { Key: '客户', Title: '客户', Type: 'String', Visible: true },
    { Key: '仓库', Title: '仓库', Type: 'String', Visible: true },
    { Key: '业务员', Title: '业务员', Type: 'String', Visible: true },
    { Key: '日期', Title: '日期', Type: 'Date', Visible: true },
    { Key: '备注', Title: '备注', Type: 'String', Visible: true },
  ],
  TbDetailHeaders: [
    { Key: '货品编码', Title: '编码', Type: 'String', Visible: true },
    { Key: '货品名称', Title: '名称', Type: 'String', Visible: true },
    { Key: '规格', Title: '规格', Type: 'String', Visible: true },
    { Key: '单位', Title: '单位', Type: 'String', Visible: true },
    { Key: '数量', Title: '数量', Type: 'Number', Visible: true },
    { Key: '单价', Title: '单价', Type: 'Decimal', Visible: true },
    { Key: '金额', Title: '金额', Type: 'Decimal', Visible: true },
  ],
};


/** Demo purchase order (采购订单) — uses neutral header/details aliases */
export const samplePurchase: BackendData = {
  Identify: 2001,
  header: {
    单据类型: '采购订单',
    订单编号: 'CGDD-20260714-001',
    供应商: '江苏原材料供应有限公司',
    采购员: '李四',
    交货仓库: '原料仓',
    下单日期: '2026-07-14',
    预计到货: '2026-07-20',
    备注: '账期 30 天 · 到货验收后入库',
  },
  details: [
    { 物料编码: 'M001', 物料名称: '冷轧钢板', 规格: '1.5mm×1250×2500', 单位: '张', 数量: 50, 单价: 320, 金额: 16000 },
    { 物料编码: 'M002', 物料名称: '铝型材', 规格: '6063-T5', 单位: 'm', 数量: 200, 单价: 28, 金额: 5600 },
    { 物料编码: 'M003', 物料名称: '不锈钢管', 规格: 'Φ32×2.0', 单位: 'm', 数量: 120, 单价: 45, 金额: 5400 },
    { 物料编码: 'M004', 物料名称: '碳钢圆钢', 规格: 'Φ20', 单位: 'kg', 数量: 800, 单价: 6.5, 金额: 5200 },
    { 物料编码: 'M005', 物料名称: '镀锌板', 规格: '0.8mm', 单位: '张', 数量: 60, 单价: 180, 金额: 10800 },
    { 物料编码: 'M006', 物料名称: '铜排', 规格: 'TMY-40×4', 单位: 'm', 数量: 30, 单价: 95, 金额: 2850 },
    { 物料编码: 'M007', 物料名称: '角钢', 规格: 'L50×5', 单位: 'm', 数量: 150, 单价: 22, 金额: 3300 },
    { 物料编码: 'M008', 物料名称: '工字钢', 规格: 'I16', 单位: 'm', 数量: 40, 单价: 88, 金额: 3520 },
  ],
  headerMeta: [
    { Key: '订单编号', Title: '订单编号', Type: 'String', Visible: true },
    { Key: '供应商', Title: '供应商', Type: 'String', Visible: true },
    { Key: '采购员', Title: '采购员', Type: 'String', Visible: true },
    { Key: '交货仓库', Title: '交货仓库', Type: 'String', Visible: true },
    { Key: '下单日期', Title: '下单日期', Type: 'Date', Visible: true },
    { Key: '预计到货', Title: '预计到货', Type: 'Date', Visible: true },
    { Key: '备注', Title: '备注', Type: 'String', Visible: true },
  ],
  detailMeta: [
    { Key: '物料编码', Title: '编码', Type: 'String', Visible: true },
    { Key: '物料名称', Title: '名称', Type: 'String', Visible: true },
    { Key: '规格', Title: '规格', Type: 'String', Visible: true },
    { Key: '单位', Title: '单位', Type: 'String', Visible: true },
    { Key: '数量', Title: '数量', Type: 'Number', Visible: true },
    { Key: '单价', Title: '单价', Type: 'Decimal', Visible: true },
    { Key: '金额', Title: '金额', Type: 'Decimal', Visible: true },
  ],
};

/** Demo stock-in bill (采购入库单) */
export const sampleInbound: BackendData = {
  Identify: 3001,
  Tb: {
    单据类型: '采购入库单',
    入库单号: 'RKD-20260714-001',
    供应商: '江苏原材料供应有限公司',
    仓库: '原料仓',
    验收员: '王五',
    入库日期: '2026-07-20',
    关联订单: 'CGDD-20260714-001',
    备注: '全部验收合格',
  },
  TbDetail: [
    { 物料编码: 'M001', 物料名称: '冷轧钢板', 规格: '1.5mm×1250×2500', 单位: '张', 应收: 50, 实收: 50, 金额: 16000 },
    { 物料编码: 'M002', 物料名称: '铝型材', 规格: '6063-T5', 单位: 'm', 应收: 200, 实收: 198, 金额: 5544 },
    { 物料编码: 'M003', 物料名称: '不锈钢管', 规格: 'Φ32×2.0', 单位: 'm', 应收: 120, 实收: 120, 金额: 5400 },
    { 物料编码: 'M004', 物料名称: '碳钢圆钢', 规格: 'Φ20', 单位: 'kg', 应收: 800, 实收: 800, 金额: 5200 },
    { 物料编码: 'M005', 物料名称: '镀锌板', 规格: '0.8mm', 单位: '张', 应收: 60, 实收: 59, 金额: 10620 },
    { 物料编码: 'M006', 物料名称: '铜排', 规格: 'TMY-40×4', 单位: 'm', 应收: 30, 实收: 30, 金额: 2850 },
  ],
  TbHeaders: [
    { Key: '入库单号', Title: '入库单号', Type: 'String', Visible: true },
    { Key: '供应商', Title: '供应商', Type: 'String', Visible: true },
    { Key: '仓库', Title: '仓库', Type: 'String', Visible: true },
    { Key: '验收员', Title: '验收员', Type: 'String', Visible: true },
    { Key: '入库日期', Title: '入库日期', Type: 'Date', Visible: true },
    { Key: '关联订单', Title: '关联订单', Type: 'String', Visible: true },
    { Key: '备注', Title: '备注', Type: 'String', Visible: true },
  ],
  TbDetailHeaders: [
    { Key: '物料编码', Title: '编码', Type: 'String', Visible: true },
    { Key: '物料名称', Title: '名称', Type: 'String', Visible: true },
    { Key: '规格', Title: '规格', Type: 'String', Visible: true },
    { Key: '单位', Title: '单位', Type: 'String', Visible: true },
    { Key: '应收', Title: '应收', Type: 'Number', Visible: true },
    { Key: '实收', Title: '实收', Type: 'Number', Visible: true },
    { Key: '金额', Title: '金额', Type: 'Decimal', Visible: true },
  ],
};

/**
 * Demo 物流/仓储标签（含二维码 + 条码）
 *
 * 标签类单据的特点：纸张很小、明细行数少、重点是二维码/条码 + 少量关键字段。
 * 二维码/条码内容在设计器里通过「自由元素」放置，内容用 {键} 占位符引用 Tb 表头值，
 * 例如二维码内容填 {SN} 就会渲染成该单据的序列号二维码。
 *
 * 建议纸张：60mm × 40mm 不干胶标签（下方 labelTemplate 已配好）。
 */
export const sampleLabel: BackendData = {
  Identify: 4001,
  Tb: {
    品名: '不锈钢螺丝 M6',
    规格: 'M6×20',
    SN: 'SN-20260716-000123',       // 二维码内容
    批次: 'LOT-260716',
    条码: '6901234567892',           // 条码内容（EAN-13）
    数量: 200,
    单位: '盒',
    仓位: 'A-03-12',
    生产日期: '2026-07-16',
  },
  TbDetail: [
    { 序号: 1, 项目: '品名', 内容: '不锈钢螺丝 M6' },
    { 序号: 2, 项目: '规格', 内容: 'M6×20' },
    { 序号: 3, 项目: '批次', 内容: 'LOT-260716' },
  ],
  TbHeaders: [
    { Key: '品名', Title: '品名', Type: 'String', Visible: true },
    { Key: '规格', Title: '规格', Type: 'String', Visible: true },
    { Key: 'SN', Title: 'SN序列号', Type: 'String', Visible: true },
    { Key: '批次', Title: '批次', Type: 'String', Visible: true },
    { Key: '条码', Title: '条码', Type: 'String', Visible: true },
    { Key: '数量', Title: '数量', Type: 'Number', Visible: true },
    { Key: '单位', Title: '单位', Type: 'String', Visible: true },
    { Key: '仓位', Title: '仓位', Type: 'String', Visible: true },
    { Key: '生产日期', Title: '生产日期', Type: 'Date', Visible: true },
  ],
  TbDetailHeaders: [
    { Key: '序号', Title: '#', Type: 'Number', Visible: true },
    { Key: '项目', Title: '项目', Type: 'String', Visible: true },
    { Key: '内容', Title: '内容', Type: 'String', Visible: true },
  ],
};

/**
 * 预置的标签模板（PrintTemplateConfig）——可直接存入 TemplateStore 使用。
 * 演示了 qrcode / barcode / 文本 三种自由元素，内容均用 {键} 占位符绑定 Tb。
 * 纸张 60mm × 40mm 不干胶标签，四周零边距。
 */
export const labelTemplate = {
  paper: { width: 60, height: 40, orientation: 'portrait', marginTop: 0, marginRight: 0, marginBottom: 0, marginLeft: 0 },
  sections: {
    header: { key: 'header', title: '表头', top: 0, height: 113, visible: true, autoFlow: false, printMode: 'every' },
    detail: { key: 'detail', title: '明细', top: 113, height: 0, visible: false, autoFlow: true },
    footer: { key: 'footer', title: '表尾', top: 113, height: 0, visible: false, autoFlow: true, printMode: 'last' },
  },
  headerFields: [],
  detailColumns: [],
  // 自由元素坐标单位为 pt（1mm ≈ 2.835pt）
  freeElements: [
    // 二维码：内容 = SN 序列号
    { type: 'qrcode', left: 4, top: 6, width: 62, height: 62, content: '{SN}', section: 'header' },
    // 品名（大字）
    { type: 'text', left: 72, top: 6, width: 96, height: 14, content: '{品名}', fontSize: 11, section: 'header' },
    // 规格 + 批次
    { type: 'text', left: 72, top: 24, width: 96, height: 12, content: '规格 {规格}', fontSize: 8, section: 'header' },
    { type: 'text', left: 72, top: 36, width: 96, height: 12, content: '批次 {批次}  仓位 {仓位}', fontSize: 8, section: 'header' },
    // 分隔线
    { type: 'hline', left: 4, top: 74, width: 162, height: 1, section: 'header' },
    // 条码：EAN-13，内容 = 条码字段
    { type: 'barcode', left: 4, top: 80, width: 120, height: 30, content: '{条码}', barcodeFormat: 'EAN13', section: 'header' },
    // 数量
    { type: 'text', left: 128, top: 88, width: 38, height: 16, content: '{数量}{单位}', fontSize: 10, section: 'header' },
  ],
  summaryRows: [],
  tableLeft: 10,
  tableTop: 113,
  sequenceColumnWidth: 24,
  detailHeaderHeight: 18,
  detailRowHeight: 18,
  allowTableOverflow: true,
  headerNoWrap: true,
  title: '',
  titleFontSize: 12,
  titleTop: 0,
  titleLeft: 0,
  titleWidth: 0,
  titleMarginBottom: 0,
  rowsPerPage: 3,
  repeatHeader: false,
  repeatColumnHeader: false,
  footerText: '',
  showPageNumber: false,
  version: 3,
};
