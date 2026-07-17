// ---------------------------------------------------------------------------
// vue-bill-print · SQLite 后端示例
//
// 演示如何用 SQLite 持久化「打印模板 JSON」，替代前端 localStorage。
// 对接点就是库里的 TemplateStore 接口（load / save / remove）。
//
//   前端 apiStore.load(formType)  ->  GET  /api/print/template?type=xxx
//   前端 apiStore.save(formType)  ->  POST /api/print/template
//   前端 apiStore.remove(formType)->  DELETE /api/print/template?type=xxx
//
// 另外附带一张「单据业务表」示例（bill / bill_detail），演示后端如何把
// 真实业务数据组装成前端需要的 BackendData（Tb / TbDetail / TbHeaders …）。
//
// 本示例使用 Node.js 内置的 node:sqlite（Node ≥ 22.5），无需原生编译、
// 零额外依赖，开箱即用。如需换 MySQL / PostgreSQL，只需把下面 3 条
// SQL（load / save / remove）换成对应驱动即可，接口契约和前端代码都不变。
//
// 运行：
//   npm install      # node:sqlite 无需编译，安装即可
//   npm start        # 默认 http://localhost:3001
// ---------------------------------------------------------------------------

import express from 'express';
import cors from 'cors';
import { DatabaseSync } from 'node:sqlite';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(join(__dirname, 'bill-print.db'));
// WAL 提升并发读写；个别网络盘/挂载盘不支持，失败则回退默认模式，不影响功能。
try { db.exec('PRAGMA journal_mode = WAL;'); } catch { /* fallback to default rollback journal */ }

// ---------------------------------------------------------------------------
// 1. 建表
// ---------------------------------------------------------------------------

// 1.1 打印模板表：一个 formType（单据类型）对应一份模板 JSON
//     模板 JSON 就是设计器保存出来的 PrintTemplateConfig 序列化结果。
db.exec(`
  CREATE TABLE IF NOT EXISTS print_template (
    form_type   TEXT PRIMARY KEY,          -- 单据类型，如 '销售出库'
    template    TEXT NOT NULL,             -- PrintTemplateConfig 的 JSON 字符串
    updated_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
`);

// 1.2 单据主表 + 明细表：演示真实业务数据来源（可选）
db.exec(`
  CREATE TABLE IF NOT EXISTS bill (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    form_type   TEXT NOT NULL,             -- 单据类型
    bill_no     TEXT NOT NULL UNIQUE,      -- 单据编号
    customer    TEXT,                      -- 客户/供应商
    warehouse   TEXT,                      -- 仓库
    clerk       TEXT,                      -- 业务员
    bill_date   TEXT,                      -- 单据日期
    remark      TEXT
  );

  CREATE TABLE IF NOT EXISTS bill_detail (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    bill_id     INTEGER NOT NULL REFERENCES bill(id) ON DELETE CASCADE,
    code        TEXT,                      -- 货品编码
    name        TEXT,                      -- 货品名称
    spec        TEXT,                      -- 规格
    unit        TEXT,                      -- 单位
    qty         REAL,                      -- 数量
    price       REAL,                      -- 单价
    amount      REAL                       -- 金额
  );
`);

// ---------------------------------------------------------------------------
// 2. 预置一条示例单据（仅首次运行时插入）
// ---------------------------------------------------------------------------
const seedCount = db.prepare('SELECT COUNT(*) AS n FROM bill').get();
if (seedCount.n === 0) {
  const insertBill = db.prepare(`
    INSERT INTO bill (form_type, bill_no, customer, warehouse, clerk, bill_date, remark)
    VALUES (@form_type, @bill_no, @customer, @warehouse, @clerk, @bill_date, @remark)
  `);
  const insertDetail = db.prepare(`
    INSERT INTO bill_detail (bill_id, code, name, spec, unit, qty, price, amount)
    VALUES (@bill_id, @code, @name, @spec, @unit, @qty, @price, @amount)
  `);
  const info = insertBill.run({
    form_type: '销售出库',
    bill_no: 'XSCK-20260716-001',
    customer: '山东示例商贸有限公司',
    warehouse: '成品仓',
    clerk: '张三',
    bill_date: '2026-07-16',
    remark: '来自 SQLite 的示例数据',
  });
  const billId = info.lastInsertRowid;
  const rows = [
    { code: 'P001', name: '不锈钢螺丝 M6', spec: 'M6×20', unit: '盒', qty: 12, price: 18.5 },
    { code: 'P002', name: '密封圈', spec: 'Φ32', unit: '个', qty: 40, price: 2.3 },
    { code: 'P003', name: '轴承 6202', spec: '6202-2RS', unit: '套', qty: 8, price: 15 },
  ];
  for (const r of rows) {
    insertDetail.run({ bill_id: billId, ...r, amount: +(r.qty * r.price).toFixed(2) });
  }
  console.log('[seed] inserted demo bill XSCK-20260716-001');
}

// ---------------------------------------------------------------------------
// 3. 预编译语句
// ---------------------------------------------------------------------------
const stmtLoadTpl   = db.prepare('SELECT template FROM print_template WHERE form_type = ?');
const stmtSaveTpl   = db.prepare(`
  INSERT INTO print_template (form_type, template, updated_at)
  VALUES (@form_type, @template, datetime('now'))
  ON CONFLICT(form_type) DO UPDATE SET
    template   = excluded.template,
    updated_at = excluded.updated_at
`);
const stmtRemoveTpl = db.prepare('DELETE FROM print_template WHERE form_type = ?');

const stmtGetBill    = db.prepare('SELECT * FROM bill WHERE bill_no = ?');
const stmtGetDetails = db.prepare('SELECT * FROM bill_detail WHERE bill_id = ? ORDER BY id');

// ---------------------------------------------------------------------------
// 4. HTTP 接口
// ---------------------------------------------------------------------------
const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

// 4.1 加载模板 —— 对应 TemplateStore.load()
//     未找到时返回 { template: null }，前端据此使用内置默认模板。
app.get('/api/print/template', (req, res) => {
  const type = String(req.query.type || '');
  if (!type) return res.status(400).json({ error: 'missing type' });
  const row = stmtLoadTpl.get(type);
  res.json({ template: row ? row.template : null });
});

// 4.2 保存模板 —— 对应 TemplateStore.save()
//     body: { formType, template }  template 为 JSON 字符串
app.post('/api/print/template', (req, res) => {
  const { formType, template } = req.body || {};
  if (!formType || typeof template !== 'string') {
    return res.status(400).json({ error: 'formType and template(string) required' });
  }
  stmtSaveTpl.run({ form_type: formType, template });
  res.json({ ok: true });
});

// 4.3 删除模板 —— 对应 TemplateStore.remove()
app.delete('/api/print/template', (req, res) => {
  const type = String(req.query.type || '');
  if (!type) return res.status(400).json({ error: 'missing type' });
  const info = stmtRemoveTpl.run(type);
  res.json({ removed: info.changes > 0 });
});

// 4.4 组装单据业务数据 —— 演示后端如何生成 BackendData
//     前端拿到后直接传给 <PrintDesigner :backend-data> 或 printBill({ data })。
app.get('/api/bill/:billNo', (req, res) => {
  const bill = stmtGetBill.get(req.params.billNo);
  if (!bill) return res.status(404).json({ error: 'bill not found' });
  const details = stmtGetDetails.all(bill.id);

  // 把数据库行映射成前端字段名（这里用中文键，和示例模板一致）
  const backendData = {
    Identify: bill.id,
    Tb: {
      单据类型: bill.form_type,
      单据编号: bill.bill_no,
      客户: bill.customer,
      仓库: bill.warehouse,
      业务员: bill.clerk,
      日期: bill.bill_date,
      备注: bill.remark,
    },
    TbDetail: details.map((d) => ({
      货品编码: d.code,
      货品名称: d.name,
      规格: d.spec,
      单位: d.unit,
      数量: d.qty,
      单价: d.price,
      金额: d.amount,
    })),
    // 列元数据：决定设计器里可拖拽哪些字段、以及打印时的格式化
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
  res.json(backendData);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`vue-bill-print SQLite backend on http://localhost:${PORT}`);
});
