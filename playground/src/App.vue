<script setup lang="ts">
import { ref, computed } from 'vue';
import { PrintDesigner, printBill } from 'vue-bill-print';
import { sampleOutbound, samplePurchase, sampleInbound } from './sampleData';

const templates = [
    { key: 'outbound', label: '销售出库', data: sampleOutbound },
    { key: 'purchase', label: '采购订单', data: samplePurchase },
    { key: 'inbound', label: '采购入库', data: sampleInbound },
  ] as const;
  const curTpl = ref<typeof templates[number]['key']>('outbound');
  const formType = computed(() => templates.find(x => x.key === curTpl.value)!.label);
  const curData = computed(() => templates.find(x => x.key === curTpl.value)!.data);
const showDesigner = ref(true);
const printing = ref(false);

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
        <p class="eyebrow">Open source skeleton</p>
        <h1>vue-bill-print</h1>
        <p class="lead">
          Vue 3 单据打印设计器骨架：拖拽设计、自定义纸张（含针式）、按页类型分页、纯 HTML 打印。
        </p>
        <div class="actions">
          <button class="btn primary" :disabled="printing" @click="onPrint">
            {{ printing ? '准备打印…' : '直接打印（printBill）' }}
          </button>
          <div class="template-switcher">
          <button v-for="tpl in templates" :key="tpl.key" class="btn" :class="{ primary: curTpl === tpl.key }" @click="curTpl = tpl.key">{{ tpl.label }}</button>
        </div>
          <button class="btn" @click="showDesigner = !showDesigner">
            {{ showDesigner ? '隐藏设计器' : '显示设计器' }}
          </button>
        </div>
      </div>
      <aside class="tips">
        <strong>试用步骤</strong>
        <ol>
          <li>在设计器里调整纸张 / 字段 / 每页行数</li>
          <li>点「保存」（写入 localStorage）</li>
          <li>点「预览」或上方「直接打印」</li>
          <li>Chrome 打印边距选「无」</li>
        </ol>
      </aside>
    </header>

    <section v-if="showDesigner" class="designer-wrap">
      <PrintDesigner :form-type="formType" :backend-data="curData" />
    </section>
  </div>
</template>

<style scoped>
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
  max-width: 1200px;
  margin: 0 auto;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 8px;
  min-height: 70vh;
  overflow: hidden;
}
.template-switcher { display: flex; gap: 8px; }
@media (max-width: 900px) {
  .hero { grid-template-columns: 1fr; }
}
</style>
