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
