// ---------------------------------------------------------------------------
// 前端对接：把 vue-bill-print 的模板存储从 localStorage 换成 SQLite 后端。
//
// 用法（在你的应用入口调用一次）：
//
//   import { configure } from 'vue-bill-print'
//   import { createSqliteApiStore } from './apiStore'
//
//   configure({ store: createSqliteApiStore('http://localhost:3001') })
//
// 之后设计器点「保存」就会写进 SQLite，点开单据就会从 SQLite 读回模板。
// ---------------------------------------------------------------------------

import type { TemplateStore } from 'vue-bill-print';

export function createSqliteApiStore(baseUrl = ''): TemplateStore {
  const url = (path: string) => `${baseUrl}${path}`;

  return {
    // 读取模板：后端返回 { template: string | null }
    async load(formType: string): Promise<string | null> {
      const res = await fetch(
        url(`/api/print/template?type=${encodeURIComponent(formType)}`),
      );
      if (!res.ok) return null;
      const json = await res.json();
      return json.template ?? null;
    },

    // 保存模板：templateJson 已是序列化后的 PrintTemplateConfig 字符串
    async save(formType: string, templateJson: string): Promise<void> {
      await fetch(url('/api/print/template'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ formType, template: templateJson }),
      });
    },

    // 删除模板（可选）：返回是否真的删掉了
    async remove(formType: string): Promise<boolean> {
      const res = await fetch(
        url(`/api/print/template?type=${encodeURIComponent(formType)}`),
        { method: 'DELETE' },
      );
      if (!res.ok) return false;
      const json = await res.json();
      return !!json.removed;
    },
  };
}

// 顺带演示：从后端拉取真实单据业务数据（BackendData）
export async function fetchBillData(baseUrl: string, billNo: string) {
  const res = await fetch(`${baseUrl}/api/bill/${encodeURIComponent(billNo)}`);
  if (!res.ok) throw new Error(`bill ${billNo} not found`);
  return res.json();
}
