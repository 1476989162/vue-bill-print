# 数据结构详解：BackendData 与 TbHeaders / TbDetailHeaders

vue-bill-print 的所有渲染都围绕一份 `BackendData`。它由**两类数据**组成：

- **值**：`Tb`（表头一条记录）+ `TbDetail`（明细多行）—— 实际要打印的内容。
- **元数据**：`TbHeaders`（表头字段说明）+ `TbDetailHeaders`（明细列说明）—— 告诉设计器「有哪些字段可拖、每个字段叫什么、是什么类型、怎么格式化」。

```ts
interface BackendData {
  Tb: Record<string, unknown>;            // 表头值：一条记录（键 -> 值）
  TbDetail: Record<string, unknown>[];    // 明细行：多条记录
  TbHeaders: FieldMeta[];                 // 表头字段元数据
  TbDetailHeaders: FieldMeta[];           // 明细列元数据
}
```

> 别名兼容：`header` / `details` / `headerMeta` / `detailMeta` 分别等价于 `Tb` / `TbDetail` / `TbHeaders` / `TbDetailHeaders`，方便从不同 ERP 迁移。库内部会先 `normalizeBackendData()` 归一化。

---

## 值 vs 元数据的关系

`Tb` / `TbDetail` 里的**键**，要和 `TbHeaders` / `TbDetailHeaders` 里的 `Key` 对应：

```
Tb = { 客户: '山东商贸', 日期: '2026-07-16' }
                ▲               ▲
TbHeaders = [ { Key:'客户', Title:'客户', Type:'String' },
              { Key:'日期', Title:'日期', Type:'Date' } ]
```

- **值**决定「打印出来是什么内容」。
- **元数据**决定「设计器里显示哪些可拖字段、标题叫什么、按什么类型格式化」。

一个字段即使有值，如果不在元数据里，设计器的字段面板里就看不到它（但仍可通过 `{键}` 占位符引用，见下）。

---

## FieldMeta 字段逐个说明

`TbHeaders` 和 `TbDetailHeaders` 的元素都是 `FieldMeta`：

```ts
interface FieldMeta {
  Key: string;          // 必填：对应 Tb / TbDetail 里的键名
  Title: string;        // 必填：显示用标题（设计器字段名、明细列表头）
  Type?: string;        // 数据类型，决定格式化方式
  Visible?: boolean;    // 是否出现在设计器字段面板
  IsPrint?: boolean;    // 兜底 HTML 模板里是否打印该表头字段
  PrintWidth?: number;  // 建议列宽（保留字段）
  [key: string]: unknown; // 允许携带你自己的扩展属性
}
```

### `Key`（必填）
字段的唯一标识，必须与 `Tb` / `TbDetail` 行对象里的**键名完全一致**（含大小写、中文）。渲染时用 `Key` 去行数据里取值。

```ts
TbDetail:        [{ 货品编码: 'P001', 数量: 12 }]
TbDetailHeaders: [{ Key: '货品编码', Title: '编码' }, { Key: '数量', Title: '数量' }]
```

### `Title`（必填）
人类可读的显示名：
- 表头（`TbHeaders`）：设计器左侧「表头字段」列表里显示的名字，也是拖到画布后默认的字段标签。
- 明细（`TbDetailHeaders`）：打印时**明细表格的列表头文字**。

`Key` 和 `Title` 可以不同，例如 `Key:'货品编码'` 而 `Title:'编码'`（列头更短）。

### `Type`（可选，格式化关键）
决定**打印时如何格式化该字段的值**。大小写敏感，识别的值：

| Type | 行为 | 示例输入 → 输出 |
| --- | --- | --- |
| `String`（默认/未识别） | 原样输出 | `'A'` → `A` |
| `Date` | 格式化为 `YYYY-MM-DD` | `'2026-07-16T00:00:00'` → `2026-07-16` |
| `DateTime` | 格式化为 `YYYY-MM-DD HH:mm:ss` | `'2026-07-16T09:30:00'` → `2026-07-16 09:30:00` |
| `Number` / `Int` / `Integer` | 按数值处理，默认保留 2 位小数 | `12` → `12.00` |
| `Decimal` / `Float` / `Double` | 同上，数值格式化 | `18.5` → `18.50` |

要点：
- 数值类型默认保留 **2 位小数**；若要改小数位，在设计器里对该字段/列设置 `decimalPlaces`（表头字段 `HeaderFieldConfig.decimalPlaces`、明细列 `DetailColumnConfig.decimalPlaces`），会覆盖默认。
- 日期类型可在设计器里用 `dateFormat` 指定 token（`YYYY MM DD HH mm ss`）自定义格式。
- 不认识的 `Type`（或省略）一律当 `String` 原样输出。
- 明细列的 `Type` 也可以由设计器里的列配置 `DetailColumnConfig.type` 覆盖；未配置时回落到 `TbDetailHeaders` 的 `Type`。

### `Visible`（可选，默认 `true`）
控制该字段**是否出现在设计器的可拖拽字段面板**里。

- `Visible: false` → 设计器字段列表里**不显示**这个字段，用户拖不到它。
- 注意：它**不影响已经拖到画布上、或已存模板里的**该字段——那些仍会打印。`Visible` 只管「设计阶段能不能选它」。
- 想临时隐藏一批内部字段（如主键、外键）但仍保留在数据里时很有用。

### `IsPrint`（可选，默认 `true`）
仅在**没有保存过设计模板、走内置兜底 HTML** 时起作用：`IsPrint: false` 的**表头**字段不会出现在兜底表头区。一旦你在设计器里保存了模板，打印以模板为准，`IsPrint` 不再生效。日常有模板的场景基本用不到它。

### `PrintWidth`（可选）
建议列宽（pt）。当前为**保留/扩展字段**：类型里定义了它，但渲染引擎的列宽以设计器里 `DetailColumnConfig.width` 为准。可用于你自己的初始化逻辑（例如根据 `PrintWidth` 预设列宽后再存模板）。

### 自定义扩展属性
`FieldMeta` 带 `[key: string]: unknown`，可以塞入你自己的元信息（如 `align`、`source`、`dbColumn`），库会忽略不认识的键，方便你在应用层二次利用。

---

## 表头字段 vs 明细列：区别

| | TbHeaders（表头字段） | TbDetailHeaders（明细列） |
| --- | --- | --- |
| 数据来源 | `Tb`（一条记录） | `TbDetail`（多行） |
| 设计器里表现 | 可自由拖放到画布任意位置的**独立文本字段** | 明细**表格的一列**（顺序、列宽、对齐可调） |
| `Title` 作用 | 字段标签 | **列表头文字** |
| 典型字段 | 单据编号、客户、日期、备注 | 编码、名称、数量、单价、金额 |

简单记：**TbHeaders 是「散落在单据顶部的键值对」，TbDetailHeaders 是「中间明细表格的列定义」。**

---

## 占位符引用（自由文本 / 条码 / 二维码）

设计器里的自由文本、条码、二维码元素，其内容支持用 `{键}` 引用 **`Tb`（表头）** 的值：

```
文本内容： 单号：{单据编号}   客户：{客户}
二维码内容：{单据编号}
```

渲染时 `{单据编号}` 会被 `Tb['单据编号']` 的值替换，并按该键在 `TbHeaders` 里的 `Type` 做格式化。注意：占位符目前只解析 `Tb` 表头值，不解析明细行。

---

## 一份完整示例

```ts
const data: BackendData = {
  Identify: 1001,
  Tb: {
    单据编号: 'XSCK-20260716-001',
    客户: '山东示例商贸有限公司',
    日期: '2026-07-16',
    金额合计: 434,
  },
  TbDetail: [
    { 货品编码: 'P001', 货品名称: '不锈钢螺丝 M6', 数量: 12, 单价: 18.5, 金额: 222 },
    { 货品编码: 'P002', 货品名称: '密封圈',       数量: 40, 单价: 2.3,  金额: 92  },
  ],
  TbHeaders: [
    { Key: '单据编号', Title: '单据编号', Type: 'String', Visible: true },
    { Key: '客户',     Title: '客户',     Type: 'String', Visible: true },
    { Key: '日期',     Title: '日期',     Type: 'Date',   Visible: true },
    { Key: '金额合计', Title: '金额合计', Type: 'Decimal',Visible: true },
    // 主键不想让用户拖到画布，但仍保留在数据里：
    { Key: 'Identify', Title: '内部ID',  Type: 'Number', Visible: false },
  ],
  TbDetailHeaders: [
    { Key: '货品编码', Title: '编码', Type: 'String',  Visible: true },
    { Key: '货品名称', Title: '名称', Type: 'String',  Visible: true },
    { Key: '数量',     Title: '数量', Type: 'Number',  Visible: true },
    { Key: '单价',     Title: '单价', Type: 'Decimal', Visible: true },
    { Key: '金额',     Title: '金额', Type: 'Decimal', Visible: true },
  ],
};
```

打印效果：
- 顶部散落 4 个表头字段（`Identify` 因 `Visible:false` 不在设计器面板出现）。
- 中间明细表格 5 列，`数量` 保留 2 位、`单价`/`金额` 保留 2 位小数。
- `日期` 自动格式化为 `2026-07-16`。
