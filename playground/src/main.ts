import { createApp } from 'vue';
import App from './App.vue';
import { configure, createLocalStorageStore } from 'vue-bill-print';
import { labelTemplate } from './sampleData';

configure({
  store: createLocalStorageStore('vue-bill-print-demo:'),
  onMessage: (level, text) => {
    // Simple toast for playground
    const el = document.createElement('div');
    el.textContent = text;
    el.style.cssText = [
      'position:fixed', 'right:16px', 'top:16px', 'z-index:9999',
      'padding:10px 14px', 'border-radius:8px', 'font-size:13px',
      'box-shadow:0 8px 24px rgba(0,0,0,.12)', 'background:#111827', 'color:#fff',
      level === 'error' ? 'background:#b91c1c' : '',
      level === 'warning' ? 'background:#b45309' : '',
      level === 'success' ? 'background:#047857' : '',
    ].filter(Boolean).join(';');
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  },
});


// 预置「物流标签」模板，让二维码/条码示例开箱即用（仅当用户还没保存过时写入）
const LABEL_KEY = 'vue-bill-print-demo:物流标签';
if (!localStorage.getItem(LABEL_KEY)) {
  localStorage.setItem(LABEL_KEY, JSON.stringify(labelTemplate));
}

createApp(App).mount('#app');
