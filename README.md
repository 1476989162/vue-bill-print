# vue-bill-print

[![CI](https://github.com/1476989162/vue-bill-print/actions/workflows/ci.yml/badge.svg)](https://github.com/1476989162/vue-bill-print/actions/workflows/ci.yml)
[![npm](https://img.shields.io/npm/v/vue-bill-print)](https://www.npmjs.com/package/vue-bill-print)
[![npm downloads](https://img.shields.io/npm/dm/vue-bill-print)](https://www.npmjs.com/package/vue-bill-print)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[English](README.en.md) · 简体中文

[🌐 Live Demo](https://1476989162.github.io/vue-bill-print/) · 在线试玩设计器与多套单据模板


Vue 3 **单据打印设计器**骨架：拖拽设计模板、自定义纸张（含针式短纸）、按页类型分页、纯 HTML 打印（不依赖 hiprint）。

> 当前版本 `0.1.2`。核心渲染引擎已从生产项目抽出；设计器 CSS 已自包含，不依赖 UnoCSS/Tailwind。欢迎试用与提 Issue。


## 演示

在线体验（GitHub Pages）：<https://1476989162.github.io/vue-bill-print/>


| 设计器界面 | 预览打印 |
| :---: | :---: |
| ![设计器](docs/screenshots/designer.png) | ![预览](docs/screenshots/preview.png) |

## 功能特性

- 可视化设计器：表头字段 / 明细列 / 横线 / 文本 / 条码 / 二维码
- 自定义纸张尺寸与边距（A3/A4/A5/B5/自定义）
- 针式短纸友好：`@page { margin: 0 }` + 设计边距用 padding，避免 Chrome「边距:无」缩放错乱
- 按页类型分页：首页 / 续页 / 末页容量不同，表头仅首页，页脚贴表格底
- 模板存取可注入：localStorage / 你们自己的后端 API
- 零 Element Plus 运行时依赖（设计器按钮已改为原生）
- 🌐 国际化：内置 zh-CN / en，通过 setLocale() 切换

## 快速开始

```bash
pnpm install
pnpm dev
```

浏览器打开 `http://localhost:5177`：

1. 调整纸张 / 字段 / 每页行数  
2. 点「保存」  
3. 点「预览」或「直接打印」  
4. Chrome 打印边距选 **无**

## 安装

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

## 对接后端

实现 `TemplateStore` 即可对接任意接口：

```ts
import { configure, type TemplateStore } from 'vue-bill-print'

const apiStore: TemplateStore = {
  async load(formType) {
    const res = await fetch(`/api/print/template?type=${encodeURIComponent(formType)}`)
    const json = await res.json()
    return json.template ?? null // 序列化后的 PrintTemplateConfig
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

### SQLite 完整示例

`examples/sqlite-backend/` 提供了一个开箱即用的 **SQLite** 后端（Express + 内置 `node:sqlite`，无需原生编译），演示 `load / save / remove` 三个接口，以及如何从数据库表组装 `BackendData`：

```bash
cd examples/sqlite-backend
npm install
npm start        # http://localhost:3001
```

前端只需：

```ts
import { configure } from 'vue-bill-print'
import { createSqliteApiStore } from './examples/sqlite-backend/apiStore'

configure({ store: createSqliteApiStore('http://localhost:3001') })
```

详见 [examples/sqlite-backend/README.md](examples/sqlite-backend/README.md)。换 MySQL / PostgreSQL 只需替换 3 条 SQL。

## 国际化

设计器界面支持中文和英文，可在运行时切换：

```ts
import { setLocale, getLocale, t, st } from 'vue-bill-print'

// 切换到英文
setLocale('en')

// 查看当前语言
console.log(getLocale()) // 'zh-CN' | 'en'

// Vue 模板中
// {{ t('toolbar.paper') }}

// 纯 TypeScript（渲染引擎）
// st('render.pageNum', 1, 3)
```

> 库默认使用 zh-CN。在应用启动时调用一次 setLocale('en') 即可切换为英文界面。

## 数据结构

```ts
interface BackendData {
  Tb: Record<string, unknown>           // 表头值
  TbDetail: Record<string, unknown>[]   // 明细行
  TbHeaders: { Key: string; Title: string; Type?: string; Visible?: boolean }[]
  TbDetailHeaders: { Key: string; Title: string; Type?: string; Visible?: boolean }[]
}
```

兼容国内多数 ERP 单据的数据格式（保留 `Tb` / `TbDetail` 命名，便于迁移）。

各字段（尤其 `TbHeaders` / `TbDetailHeaders` 里 `Key` / `Title` / `Type` / `Visible` / `IsPrint` / `PrintWidth`）的含义、取值与渲染行为，见 **[docs/data-structure.md](docs/data-structure.md)**。

### 标签二维码 / 条码

想打印带二维码、条码的小标签？演示页顶部切到「物流标签(二维码)」模板即可体验，做法见 **[docs/label-qrcode.md](docs/label-qrcode.md)**，示例数据与模板见 `playground/src/sampleData.ts` 的 `sampleLabel` / `labelTemplate`。

## 项目结构

```text
vue-bill-print/
├── src/
│   ├── index.ts           # 公共导出
│   ├── types.ts           # TemplateStore / PrintTemplateConfig / BackendData
│   ├── storage.ts         # configure() + localStorage 存储
│   ├── print.ts           # printBill()
│   ├── render.ts          # HTML 渲染 + 分页引擎
│   ├── format.ts
│   ├── i18n/              # 国际化（zh-CN / en）
│   └── PrintDesigner.vue  # 可视化设计器
├── examples/
│   └── sqlite-backend/    # SQLite 后端对接示例（Express + 内置 node:sqlite）
├── docs/
│   ├── data-structure.md  # 数据结构 / TbHeaders / TbDetailHeaders 详解
│   └── label-qrcode.md    # 标签二维码 / 条码示例
├── playground/            # Vite 演示（含物流标签模板）
├── README.md
└── LICENSE                # MIT
```

## 待办

- [x] 自包含 CSS（去掉 UnoCSS 依赖）
- [x] CI 自动化（typecheck + build）
- [x] 英文文档
- [x] 更多 demo 模板（采购订单 / 入库）
- [x] `header` / `details` 别名兼容
- [x] 国际化（zh-CN / en 语言包）
- [x] 首次 npm 发布
- [x] SQLite 后端对接示例
- [x] 数据结构 / TbHeaders 详解文档
- [x] 标签二维码 / 条码示例

## License

MIT
