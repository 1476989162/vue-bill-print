# vue-bill-print

[![CI](https://github.com/1476989162/vue-bill-print/actions/workflows/ci.yml/badge.svg)](https://github.com/1476989162/vue-bill-print/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/vue-bill-print)](https://www.npmjs.com/package/vue-bill-print)
[![npm downloads](https://img.shields.io/npm/dm/vue-bill-print)](https://www.npmjs.com/package/vue-bill-print)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)


Vue 3 **单据打印设计器**骨架：拖拽设计模板、自定义纸张（含针式短纸）、按页类型分页、纯 HTML 打印（不依赖 hiprint）。

> 当前为可运行的开源骨架（`0.1.0`）。核心渲染引擎已从生产项目抽出；UI 仍使用少量工具类（playground 用 UnoCSS）。欢迎试用与提 Issue。

## Features

- 可视化设计器：表头字段 / 明细列 / 横线 / 文本 / 条码 / 二维码
- 自定义纸张尺寸与边距（A3/A4/A5/B5/自定义）
- 针式短纸友好：`@page { margin: 0 }` + 设计边距用 padding，避免 Chrome「边距:无」缩放错乱
- 按页类型分页：首页 / 续页 / 末页容量不同，表头仅首页，页脚贴表格底
- 模板存取可注入：localStorage / 你们自己的后端 API
- 零 Element Plus 运行时依赖（设计器按钮已改为原生）

## Quick start (playground)

```bash
pnpm install
pnpm dev
```

浏览器打开 `http://localhost:5177`：

1. 调整纸张 / 字段 / 每页行数  
2. 点「保存」  
3. 点「预览」或「直接打印」  
4. Chrome 打印边距选 **无**

## Install (after publish)

```bash
pnpm add vue-bill-print
# peer: vue ^3.4
```

```ts
import { configure, createLocalStorageStore, printBill, PrintDesigner } from 'vue-bill-print'

configure({
  store: createLocalStorageStore(),
  onMessage: (level, text) => console.log(level, text),
})

await printBill({
  formType: '销售出库',
  data: billData, // { Tb, TbDetail, TbHeaders, TbDetailHeaders }
})
```

```vue
<template>
  <PrintDesigner form-type="销售出库" :backend-data="billData" />
</template>
```

## Connect your backend

实现 `TemplateStore` 即可对接任意接口：

```ts
import { configure, type TemplateStore } from 'vue-bill-print'

const apiStore: TemplateStore = {
  async load(formType) {
    const res = await fetch(`/api/print/template?type=${encodeURIComponent(formType)}`)
    const json = await res.json()
    return json.template ?? null // stringified PrintTemplateConfig
  },
  async save(formType, templateJson) {
    await fetch('/api/print/template', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ formType, template: templateJson }),
    })
  },
}

configure({ store: apiStore })
```

## Data shape

```ts
interface BackendData {
  Tb: Record<string, unknown>           // header values
  TbDetail: Record<string, unknown>[]   // detail rows
  TbHeaders: { Key: string; Title: string; Type?: string; Visible?: boolean }[]
  TbDetailHeaders: { Key: string; Title: string; Type?: string; Visible?: boolean }[]
}
```

Compatible with many Chinese ERP bill payloads (`Tb` / `TbDetail` naming kept for migration ease).

## Project layout

```text
vue-bill-print/
├── src/
│   ├── index.ts           # public exports
│   ├── types.ts           # TemplateStore / PrintTemplateConfig / BackendData
│   ├── storage.ts         # configure() + localStorage store
│   ├── print.ts           # printBill()
│   ├── render.ts          # HTML render + pagination engine
│   ├── format.ts
│   └── PrintDesigner.vue  # visual designer
├── playground/            # Vite demo
├── README.md
└── LICENSE                # MIT
```

## Roadmap

- [ ] Designer CSS 自包含（去掉对 UnoCSS 工具类的依赖）
- [ ] npm 发布与 CI
- [ ] 英文文档
- [ ] 更多 demo 模板（采购订单 / 入库）
- [ ] `header` / `details` 别名（兼容非 `Tb` 命名）

## License

MIT
