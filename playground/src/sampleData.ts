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
