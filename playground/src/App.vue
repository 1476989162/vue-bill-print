<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { PrintDesigner, printBill, getLocale, setLocale } from 'vue-bill-print';
import { sampleOutbound, samplePurchase, sampleInbound } from './sampleData';

const demoI18n: Record<string, Record<string, string>> = {
  'zh-CN': {
    'demo.openSource': '开源骨架',
    'demo.lead': 'Vue 3 单据打印设计器骨架：拖拽设计、自定义纸张（含针式）、按页类型分页、纯 HTML 打印。',
    'demo.print': '直接打印（printBill）',
    'demo.printing': '准备打印…',
    'demo.hideDesigner': '隐藏设计器',
    'demo.showDesigner': '显示设计器',
    'demo.steps': '试用步骤',
    'demo.step1': '在设计器里调整纸张 / 字段 / 每页行数',
    'demo.step2': '点「保存」（写入 localStorage）',
    'demo.step3': '点「预览」或上方「直接打印」',
    'demo.step4': 'Chrome 打印边距选「无」',
    'demo.lang': '语言',
    'demo.tpl.outbound': '销售出库',
    'demo.tpl.purchase': '采购订单',
    'demo.tpl.inbound': '采购入库',
    'demo.editData': '查看/编辑数据',
    'demo.dataEditor': '示例数据 (Tb / TbDetail …)',
    'demo.dataEditorHint': '可直接修改 JSON；点击“应用”后设计器实时重排。支持 Tb/TbDetail 或 header/details 别名。',
    'demo.apply': '应用',
    'demo.cancel': '取消',
  },
  'en': {
    'demo.openSource': 'Open source skeleton',
    'demo.lead': 'Vue 3 bill print designer skeleton: drag to design, custom paper (incl. dot-matrix), paginate by page type, pure HTML printing.',
    'demo.print': 'Print directly (printBill)',
    'demo.printing': 'Preparing…',
    'demo.hideDesigner': 'Hide Designer',
    'demo.showDesigner': 'Show Designer',
    'demo.steps': 'Try it out',
    'demo.step1': 'Adjust paper / fields / rows-per-page in the designer',
    'demo.step2': 'Click "Save" (writes to localStorage)',
    'demo.step3': 'Click "Preview" or "Print directly" above',
    'demo.step4': 'In Chrome print dialog, set margins to "None"',
    'demo.lang': 'Language',
    'demo.tpl.outbound': 'Sales Outbound',
    'demo.tpl.purchase': 'Purchase Order',
    'demo.tpl.inbound': 'Stock In',
    'demo.editData': 'View / Edit Data',
    'demo.dataEditor': 'Sample Data (Tb / TbDetail …)',
    'demo.dataEditorHint': 'Edit the JSON directly; click Apply to re-layout the designer live. Supports Tb/TbDetail or header/details aliases.',
    'demo.apply': 'Apply',
    'demo.cancel': 'Cancel',
  },
};
const demoT = (key: string) => (demoI18n[getLocale()] || demoI18n['zh-CN'])[key] || key;

const currentLocale = ref(getLocale());
watch(currentLocale, (v) => setLocale(v as 'zh-CN' | 'en'));

const templates = [
    { key: 'outbound', labelKey: 'demo.tpl.outbound', formType: '销售出库', data: sampleOutbound },
    { key: 'purchase', labelKey: 'demo.tpl.purchase', formType: '采购订单', data: samplePurchase },
    { key: 'inbound', labelKey: 'demo.tpl.inbound', formType: '采购入库', data: sampleInbound },
  ] as const;
  const curTpl = ref<typeof templates[number]['key']>('outbound');
  const formType = computed(() => templates.find(x => x.key === curTpl.value)!.formType);
  const curData = computed(() => editableData.value ?? templates.find(x => x.key === curTpl.value)!.data);
const showDesigner = ref(true);
const printing = ref(false);

// 示例数据可查看/编辑：切换模板时同步 editable 副本
const editableData = ref(null);
const dataModalOpen = ref(false);
const dataText = ref('');
const dataError = ref('');
const syncEditable = () => { editableData.value = JSON.parse(JSON.stringify(curData.value)); };
watch(curTpl, () => { syncEditable(); }, { immediate: true });
const openDataEditor = () => {
  dataText.value = JSON.stringify(editableData.value, null, 2);
  dataError.value = '';
  dataModalOpen.value = true;
};
const applyData = () => {
  try {
    const parsed = JSON.parse(dataText.value);
    editableData.value = parsed;
    dataModalOpen.value = false;
  } catch (e) {
    dataError.value = String(e);
  }
};

const onPrint = async () => {
  printing.value = true;
  try {
    await printBill({ formType: formType.value, data: curData.value });
  } finally {
    printing.value = false;
  }
};
</script>

<template>
  <div class="page">
    <header class="hero">
      <div>
        <p class="eyebrow">{{ demoT('demo.openSource') }}</p>
        <h1>vue-bill-print</h1>
        <p class="lead">{{ demoT('demo.lead') }}</p>
        <div class="actions">
          <button class="btn primary" :disabled="printing" @click="onPrint">
            {{ printing ? demoT('demo.printing') : demoT('demo.print') }}
          </button>
          <div class="template-switcher">
          <button v-for="tpl in templates" :key="tpl.key" class="btn" :class="{ primary: curTpl === tpl.key }" @click="curTpl = tpl.key">{{ demoT(tpl.labelKey) }}</button>
        </div>
          <button class="btn" @click="showDesigner = !showDesigner">
            {{ showDesigner ? demoT('demo.hideDesigner') : demoT('demo.showDesigner') }}
          </button>
          <button class="btn" @click="openDataEditor">{{ demoT('demo.editData') }}</button>
        </div>
      </div>
      <aside class="tips">
        <strong>{{ demoT('demo.steps') }}</strong>
        <ol>
          <li>{{ demoT('demo.step1') }}</li>
          <li>{{ demoT('demo.step2') }}</li>
          <li>{{ demoT('demo.step3') }}</li>
          <li>{{ demoT('demo.step4') }}</li>
        </ol>
      </aside>
      <div class="lang-switch">
        <span class="text-xs text-gray-500">{{ demoT('demo.lang') }}:</span>
        <button class="btn xs" :class="{ primary: currentLocale === 'zh-CN' }" @click="currentLocale = 'zh-CN'">中文</button>
        <button class="btn xs" :class="{ primary: currentLocale === 'en' }" @click="currentLocale = 'en'">EN</button>
      </div>
    </header>

    <section v-if="showDesigner" class="designer-wrap">
      <PrintDesigner :form-type="formType" :backend-data="curData" />
    </section>

    <div v-if="dataModalOpen" class="data-modal-mask" @click.self="dataModalOpen = false">
      <div class="data-modal">
        <div class="data-modal-head">
          <strong>{{ demoT('demo.dataEditor') }}</strong>
          <button class="btn xs" @click="dataModalOpen = false">×</button>
        </div>
        <p class="data-modal-hint">{{ demoT('demo.dataEditorHint') }}</p>
        <textarea v-model="dataText" class="data-modal-text" spellcheck="false"></textarea>
        <div v-if="dataError" class="data-modal-err">{{ dataError }}</div>
        <div class="data-modal-foot">
          <button class="btn xs" @click="dataModalOpen = false">{{ demoT('demo.cancel') }}</button>
          <button class="btn xs primary" @click="applyData">{{ demoT('demo.apply') }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.data-modal-mask { position: fixed; inset: 0; background: rgba(15, 23, 42, 0.45); display: flex; align-items: center; justify-content: center; z-index: 1000; }
.data-modal { width: min(720px, 92vw); max-height: 84vh; background: #fff; border-radius: 14px; display: flex; flex-direction: column; box-shadow: 0 20px 60px rgba(0,0,0,0.25); overflow: hidden; }
.data-modal-head { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid #e2e8f0; }
.data-modal-head .btn.xs { padding: 2px 10px; font-size: 16px; line-height: 1; }
.data-modal-hint { margin: 0; padding: 8px 16px 0; font-size: 12px; color: #64748b; }
.data-modal-text { flex: 1; margin: 10px 16px; min-height: 320px; resize: vertical; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; line-height: 1.5; border: 1px solid #cbd5e1; border-radius: 8px; padding: 10px; background: #f8fafc; }
.data-modal-err { margin: 0 16px; color: #dc2626; font-size: 12px; white-space: pre-wrap; }
.data-modal-foot { display: flex; justify-content: flex-end; gap: 8px; padding: 10px 16px 14px; }

.page {
  min-height: 100vh;
  background:
    radial-gradient(1200px 500px at 10% -10%, #dbeafe 0%, transparent 55%),
    linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%);
  color: #0f172a;
  padding: 24px;
}
.hero {
  max-width: 1200px;
  margin: 0 auto 16px;
  display: grid;
  grid-template-columns: 1.4fr 1fr;
  gap: 20px;
  align-items: start;
}
.eyebrow {
  margin: 0 0 6px;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #2563eb;
  font-weight: 700;
}
h1 {
  margin: 0 0 8px;
  font-size: 36px;
  line-height: 1.1;
  letter-spacing: -0.03em;
}
.lead {
  margin: 0 0 16px;
  max-width: 52ch;
  color: #334155;
  line-height: 1.6;
}
.actions { display: flex; gap: 10px; flex-wrap: wrap; }
.btn {
  border: 1px solid #cbd5e1;
  background: #fff;
  border-radius: 999px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
}
.btn.primary {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
}
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.tips {
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 16px 18px;
  backdrop-filter: blur(6px);
}
.tips ol {
  margin: 8px 0 0;
  padding-left: 18px;
  color: #475569;
  line-height: 1.7;
}
.designer-wrap {
  width: 100%;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 8px;
  height: calc(100vh - 220px);
  min-height: 520px;
  overflow: hidden;
}
.template-switcher { display: flex; gap: 8px; }
.lang-switch { display: flex; align-items: center; gap: 6px; margin-top: 12px; }
.btn.xs { padding: 4px 10px; font-size: 12px; }
@media (max-width: 900px) {
  .hero { grid-template-columns: 1fr; }
}
</style>
