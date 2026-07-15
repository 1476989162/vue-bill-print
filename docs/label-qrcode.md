# 标签二维码 / 条码示例

演示如何用 vue-bill-print 打印带**二维码**和**条码**的小尺寸标签（如物流面单、库位标签、产品贴标）。

在线可试：切换到演示页顶部的「物流标签(二维码)」模板。

## 原理

二维码、条码在设计器里属于**自由元素**（free element），和文本、横线一样可以拖放定位。它们的关键属性：

| 属性 | 说明 |
| --- | --- |
| `type` | `'qrcode'` 或 `'barcode'` |
| `content` | 编码内容，支持 `{键}` 占位符引用 `Tb` 表头值 |
| `barcodeFormat` | 仅条码：`CODE128`（默认）/ `EAN13` / `EAN8` / `UPC` / `CODE39` 等（jsbarcode 支持的格式） |
| `left` / `top` / `width` / `height` | 位置与尺寸（单位 pt，1mm ≈ 2.835pt） |

渲染时：
- 二维码由 `qrcode` 库生成为 dataURL 图片。
- 条码由 `jsbarcode` 生成。**若内容不符合所选格式**（如 EAN13 校验位错误），该元素会被**静默跳过**（不报错、不显示），所以务必保证内容合法。
- `content` 里的 `{SN}`、`{条码}` 等占位符会被 `Tb` 对应键的值替换。

## 数据（BackendData）

见 `playground/src/sampleData.ts` 的 `sampleLabel`。要点是把二维码/条码要编码的内容放进 `Tb`：

```ts
Tb: {
  品名: '不锈钢螺丝 M6',
  SN: 'SN-20260716-000123',   // 二维码内容
  条码: '6901234567892',       // 条码内容（合法 EAN-13）
  批次: 'LOT-260716',
  数量: 200, 单位: '盒', 仓位: 'A-03-12',
}
```

## 模板（PrintTemplateConfig）

见 `sampleLabel` 旁边的 `labelTemplate`，已配好一张 60mm×40mm 标签。核心是 `freeElements`：

```ts
freeElements: [
  { type: 'qrcode', left: 4,  top: 6,  width: 62, height: 62, content: '{SN}' },
  { type: 'text',   left: 72, top: 6,  width: 96, height: 14, content: '{品名}', fontSize: 11 },
  { type: 'barcode',left: 4,  top: 80, width: 120,height: 30, content: '{条码}', barcodeFormat: 'EAN13' },
  { type: 'text',   left: 128,top: 88, width: 38, height: 16, content: '{数量}{单位}', fontSize: 10 },
]
```

## 快速使用

```ts
import { configure, createLocalStorageStore, printBill } from 'vue-bill-print';
import { sampleLabel, labelTemplate } from './sampleData';

// 1) 把标签模板存入 store（一次即可，正常是设计器保存）
const store = createLocalStorageStore();
await store.save('物流标签', JSON.stringify(labelTemplate));
configure({ store });

// 2) 打印
await printBill({ formType: '物流标签', data: sampleLabel });
```

或在设计器里手动放置：拖入「二维码 / 条码」自由元素 → 在右侧属性面板把内容填成 `{SN}` / `{条码}` → 条码选择格式 `EAN13` → 保存。

## 手动在设计器中添加

1. 打开设计器，左侧「自由元素」区选择「二维码」或「条码」拖入画布。
2. 选中元素，右侧属性面板：
   - 内容填 `{SN}`（二维码）或 `{条码}`（条码），`{}` 内是 `Tb` 的键名。
   - 条码额外选择格式（EAN13 需 13 位合法数字、CODE128 可编码任意字符串）。
3. 调整位置/大小，点「保存」。
