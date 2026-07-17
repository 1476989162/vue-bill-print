# SQLite 后端示例

演示如何用 **SQLite** 持久化 vue-bill-print 的打印模板，替代默认的浏览器 `localStorage`。

本示例使用 Node.js 内置的 **`node:sqlite`**（Node ≥ 22.5），**无需原生编译、零额外数据库依赖**，开箱即用。

对接的唯一契约是库导出的 `TemplateStore` 接口：

```ts
interface TemplateStore {
  load(formType: string): Promise<string | null>;   // 读模板
  save(formType: string, templateJson: string): Promise<void>;  // 存模板
  remove?(formType: string): Promise<boolean>;       // 删模板（可选）
}
```

模板本身是设计器保存出来的 `PrintTemplateConfig` 的 **JSON 字符串**，后端不需要理解它的结构，当成一段文本存取即可。

## 目录

| 文件 | 作用 |
| --- | --- |
| `server.js` | Express + node:sqlite（`DatabaseSync`）服务，提供模板存取 API |
| `apiStore.ts` | 前端适配器：实现 `TemplateStore`，把请求打到本服务 |
| `package.json` | 后端依赖 |

## 数据库表

```
print_template          -- 打印模板（核心）
  form_type  TEXT PK    -- 单据类型，如 '销售出库'
  template   TEXT       -- PrintTemplateConfig 的 JSON 字符串
  updated_at TEXT

bill / bill_detail      -- 单据业务表（演示真实数据来源，可选）
```

一个 `form_type` 对应一份模板，用 `INSERT ... ON CONFLICT DO UPDATE`（UPSERT）实现「有则更新、无则插入」。

## 运行后端

```bash
cd examples/sqlite-backend
npm install      # node:sqlite 无需原生编译，安装即可
npm start          # http://localhost:3001
```

> 需要 Node.js ≥ 22.5（`node:sqlite` 自该版本起内置）。

首次启动会自动建表并插入一条示例单据 `XSCK-20260716-001`。

## 接口一览

| 方法 | 路径 | 对应 TemplateStore |
| --- | --- | --- |
| GET | `/api/print/template?type=销售出库` | `load` |
| POST | `/api/print/template`（body: `{ formType, template }`） | `save` |
| DELETE | `/api/print/template?type=销售出库` | `remove` |
| GET | `/api/bill/:billNo` | 组装 `BackendData`（额外演示） |

快速自测：

```bash
# 存
curl -X POST http://localhost:3001/api/print/template \
  -H 'Content-Type: application/json' \
  -d '{"formType":"销售出库","template":"{\"paper\":{}}"}'

# 读
curl 'http://localhost:3001/api/print/template?type=销售出库'

# 拉业务数据
curl http://localhost:3001/api/bill/XSCK-20260716-001
```

## 前端接入

```ts
import { configure } from 'vue-bill-print';
import { createSqliteApiStore } from './apiStore';

// 应用启动时配置一次，全局生效
configure({ store: createSqliteApiStore('http://localhost:3001') });
```

之后设计器里点「保存」就写进 SQLite，重新打开单据会从 SQLite 读回模板。其余用法（`printBill`、`<PrintDesigner>`）完全不变。

如果要顺便从数据库取真实单据数据渲染：

```ts
import { fetchBillData } from './apiStore';

const data = await fetchBillData('http://localhost:3001', 'XSCK-20260716-001');
// data 即 BackendData：{ Tb, TbDetail, TbHeaders, TbDetailHeaders }
await printBill({ formType: '销售出库', data });
```

## 换成 MySQL / PostgreSQL？

只需把 `server.js` 里的 3 条 SQL（load / save / remove）换成对应驱动即可，接口契约和前端代码都不用改。核心就是这张 `print_template(form_type PK, template TEXT)` 表。
（本示例用 Node 内置 `node:sqlite`，若换 MySQL / PostgreSQL 只需引入对应 npm 包并替换这 3 条语句。）
