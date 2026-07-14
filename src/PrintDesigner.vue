<!-- src/components/PrintDesigner.vue -->
<template>
  <div class="print-designer flex flex-col designer-root">
    <!-- 工具栏 -->
    <div class="toolbar flex items-center gap-1 bg-gray-100 p-2 rounded mb-1 flex-wrap text-xs">
      <span class="font-medium">{{ t("toolbar.paper") }}</span>
      <button type="button" v-for="(v, t) in paperPresets" :key="t" :class="['vbp-btn', curPaperType === t ? 'vbp-btn-primary' : '']" 
        @click="setPaper(t, v)">{{ t }}</button>
      <button type="button"  :class="['vbp-btn', curPaperType === 'custom' ? 'vbp-btn-primary' : '']"
        @click="openCustomPaperPop">{{ t('toolbar.custom') }}</button>
      <!-- 自定义纸张弹窗 - 用普通 div 模拟，避免 el-popover 兼容问题 -->
      <div v-if="showPaperPop" class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-20"
        @click.self="showPaperPop = false">
        <div class="bg-white rounded shadow-lg p-4 w-64 text-sm" @click.stop>
          <div class="font-medium mb-2">{{ t("paperSetting.title") }}</div>
          <div class="flex gap-2 items-center mb-2">
            <span>{{ t("toolbar.width") }}</span><input v-model.number="customW" type="number" class="w-16 border rounded px-1" />
            <span>{{ t("toolbar.height") }}</span><input v-model.number="customH" type="number" class="w-16 border rounded px-1" />
          </div>
          <button type="button" class="vbp-btn vbp-btn-primary"   @click="applyCustomPaper">{{ t('toolbar.confirm') }}</button>
          <button type="button" class="vbp-btn"  @click="showPaperPop = false">{{ t('toolbar.cancel') }}</button>
        </div>
      </div>
      <button type="button" class="vbp-btn"  @click="toggleOrientation">{{ isLandscape ? t('toolbar.portrait') : t('toolbar.landscape') }}</button>

      <div class="border-r border-gray-300 mx-1" style="height:1em"></div>
      <span class="font-medium">{{ t("toolbar.margin") }}</span>
      <span>{{ t("toolbar.marginTop") }}</span><input v-model.number="config.paper.marginTop" type="number"
        class="w-10 border rounded px-0.5 text-xs" />
      <span>{{ t("toolbar.marginBottom") }}</span><input v-model.number="config.paper.marginBottom" type="number"
        class="w-10 border rounded px-0.5 text-xs" />
      <span>{{ t("toolbar.marginLeft") }}</span><input v-model.number="config.paper.marginLeft" type="number"
        class="w-10 border rounded px-0.5 text-xs" />
      <span>{{ t("toolbar.marginRight") }}</span><input v-model.number="config.paper.marginRight" type="number"
        class="w-10 border rounded px-0.5 text-xs" />

      <div class="border-r border-gray-300 mx-1" style="height:1em"></div>
      <span class="font-medium">{{ t("toolbar.rowsPerPage") }}</span><input v-model.number="config.rowsPerPage"
        type="number" class="w-12 border rounded px-0.5 text-xs" min="1" :title="t('toolbar.rowsPerPageTitle')" />
      <span class="text-gray-500 text-xs" :title="t('toolbar.singleHint', suggestedRows, continuationRows)">
        {{ t("toolbar.singleLe") }}{{ suggestedRows }} / {{ t("toolbar.continuationLe") }}{{ continuationRows }}
      </span>
      <span v-if="config.rowsPerPage > continuationRows" class="text-amber-600 text-xs">{{ t("toolbar.overflowWarn") }}</span>
      <span v-if="tableOverflowPt > 0" class="text-red-600">超宽 {{ (tableOverflowPt / PT_PER_MM).toFixed(1) }}mm</span>
      <label class="flex items-center gap-0.5 ml-1"><input type="checkbox" v-model="repeatHeaderComputed" />{{ t('toolbar.repeatHeader') }}</label>
      <label class="flex items-center gap-0.5"><input type="checkbox" v-model="config.repeatColumnHeader" />{{ t('toolbar.repeatColHeader') }}</label>
      <label class="flex items-center gap-0.5 ml-1" :title="t('toolbar.gapGuideTitle')"><input type="checkbox"
          v-model="showGapGuide" /> {{ t("toolbar.gapGuide") }}</label>

      <div class="border-r border-gray-300 mx-1" style="height:1em"></div>
      <button type="button" class="vbp-btn vbp-btn-primary"   @click="saveConfig">{{ t('toolbar.save') }}</button>
      <button type="button" class="vbp-btn"  @click="loadConfig">{{ t('toolbar.load') }}</button>
      <button type="button" class="vbp-btn"  @click="resetToSample">{{ t('actions.resetSample') }}</button>
      <button type="button" class="vbp-btn"  @click="previewPrint">{{ t('toolbar.preview') }}</button>
      <button type="button" class="vbp-btn"  @click="openJson">{{ t('toolbar.viewJson') }}</button>
    </div>

    <!-- 主体三栏 -->
    <div class="flex flex-row flex-1 overflow-hidden">
      <!-- 左栏 -->
      <div class="left flex flex-col bg-white border rounded shadow-sm p-2 mr-1 overflow-auto designer-left">
        <div class="text-xs font-medium mb-1">{{ t("panel.headerFields") }}</div>
        <div v-for="f in headerFields" :key="f.key"
          class="field-item px-2 py-0.5 mb-0.5 text-xs bg-blue-50 border rounded cursor-grab select-none"
          draggable="true" @dragstart="onDragStart($event, 'header', f)">{{ f.title }}</div>
        <div class="text-xs font-medium mt-2 mb-1">{{ t("panel.detailColumns") }}</div>
        <div v-for="c in detailFields" :key="c.key"
          class="field-item px-2 py-0.5 mb-0.5 text-xs bg-green-50 border rounded cursor-grab select-none"
          draggable="true" @dragstart="onDragStart($event, 'detail', c)">{{ c.title }}</div>
        <div class="text-xs font-medium mt-2 mb-1">{{ t("panel.freeElements") }}</div>
        <div class="field-item px-2 py-0.5 mb-0.5 text-xs bg-gray-100 border rounded cursor-grab select-none"
          draggable="true" @dragstart="onDragStart($event, 'free', { type: 'hline' })">{{ t('panel.hLine') }}</div>
        <div class="field-item px-2 py-0.5 mb-0.5 text-xs bg-gray-100 border rounded cursor-grab select-none"
          draggable="true" @dragstart="onDragStart($event, 'free', { type: 'text', content: t('free.textDefault') })">{{ t('panel.text') }}</div>
        <div class="field-item px-2 py-0.5 mb-0.5 text-xs bg-gray-100 border rounded cursor-grab select-none"
          draggable="true" @dragstart="onDragStart($event, 'free', { type: 'barcode', content: '123456' })">{{ t('panel.barcode') }}</div>
        <div class="field-item px-2 py-0.5 mb-0.5 text-xs bg-gray-100 border rounded cursor-grab select-none"
          draggable="true" @dragstart="onDragStart($event, 'free', { type: 'qrcode', content: '123456' })">{{ t('panel.qrcode') }}</div>
      </div>

      <!-- 中栏：画布 -->
      <div class="center flex-1 bg-gray-200 rounded overflow-auto flex items-start justify-center p-4"
        @drop="handleCanvasDrop" @dragover="onCanvasDragOver">
        <div class="canvas-with-rulers">
          <!-- 顶部 X 标尺 (mm) -->
          <div class="ruler-corner"></div>
          <div class="ruler-h" :style="{ width: config.paper.width + 'mm' }">
            <span v-for="mm in xLabelMm" :key="'xl' + mm" class="ruler-label-h" :style="{ left: mm + 'mm' }">{{ mm
              }}</span>
          </div>
          <!-- 左侧 Y 标尺 (mm) -->
          <div class="ruler-v" :style="{ height: config.paper.height + 'mm' }">
            <span v-for="mm in yLabelMm" :key="'yl' + mm" class="ruler-label-v" :style="{ top: mm + 'mm' }">{{ mm
              }}</span>
          </div>
          <div ref="canvasRef" class="canvas bg-white shadow-lg" :style="canvasStyle" @click="deselectAll"
            @drop.stop="handleCanvasDrop" @dragover="onCanvasDragOver">
            <div v-for="section in sectionList" v-show="section.visible" :key="section.key"
              class="section-band absolute left-0 right-0 cursor-move select-none"
              :class="{ 'ring-2 ring-blue-500 section-band--active': selType === 'section' && selSectionKey === section.key }"
              :style="{ top: section.top + 'pt', height: section.height + 'pt', zIndex: selType === 'section' && selSectionKey === section.key ? 15 : 2 }"
              draggable="true"
              @dragstart="onElDragStart($event, 'section', section.key)" @dragend="onElDragEnd"
              @click.stop="selectSection(section.key)">
              <span class="section-band-label">{{ section.title }}<em v-if="section.key === 'header'"
                  class="section-tag">{{ section.printMode === 'first' ? t('canvas.firstPageOnly') : t('canvas.everyPage') }}</em><em
                  v-else-if="section.key === 'footer'"
                  class="section-tag">{{ section.printMode === 'every' ? t('canvas.everyPage') : t('canvas.lastPageOnly') }}</em></span>
            </div>
            <!-- 标题（可拖拽，与打印坐标一致） -->
            <div v-if="config.sections?.header.visible !== false"
              class="absolute border border-transparent hover:border-blue-400 select-none cursor-move text-center font-bold canvas-el"
              :class="{ 'ring-2 ring-blue-500': selType === 'title' }" :style="titleCanvasStyle" draggable="true"
              @dragstart="onElDragStart($event, 'title', 0)" @dragend="onElDragEnd"
              @click.stop="selectItem('title', 0)">
              {{ config.title }}
            </div>

            <!-- 表头字段（可拖拽移动） -->
            <div v-for="(f, i) in visibleHeaderFields" :key="'h' + i"
              class="absolute border border-transparent hover:border-blue-400 select-none cursor-move canvas-el"
              :class="{ 'ring-2 ring-blue-500': selIdx === i && selType === 'header' }"
              :style="{ left: f.left + 'pt', top: f.top + 'pt', fontSize: f.fontSize + 'pt', width: f.width + 'pt', fontWeight: f.bold ? 'bold' : 'normal', textAlign: f.align, whiteSpace: 'nowrap', overflow: 'hidden', zIndex: 20 }"
              draggable="true" @dragstart="onElDragStart($event, 'header', i)" @dragend="onElDragEnd"
              @click.stop="selectItem('header', i)" @dblclick="removeItem('header', i)">
              <span v-if="f.showLabel" class="text-gray-500">{{ f.title }}:</span>
              <span class="text-gray-800">{{ '{' + f.key + '}' }}</span>
            </div>

            <!-- 表格与标题间距辅助线 -->
            <div v-if="showGapGuide && config.detailColumns.length > 0 && tableTitleGapPt >= 0"
              class="gap-guide pointer-events-none select-none"
              :style="{ top: titleBottomPt + 'pt', height: tableTitleGapPt + 'pt' }">
              <div class="gap-guide-line gap-guide-line--top"></div>
              <div class="gap-guide-line gap-guide-line--bottom"></div>
              <div class="gap-guide-label">{{ tableTitleGapPt.toFixed(0) }} pt ≈ {{ (tableTitleGapPt / 2.835).toFixed(1)
                }} mm</div>
            </div>

            <!-- 明细表格（可拖拽移动） -->
            <div v-if="config.sections?.detail.visible !== false && config.detailColumns.length > 0"
              class="absolute border border-transparent hover:border-blue-300 select-none cursor-move canvas-el"
              :class="{ 'ring-2 ring-blue-500': selType === 'table' }"
              :style="{ left: config.tableLeft + 'pt', top: config.tableTop + 'pt', width: detailTableWidthPt + 'pt', zIndex: 10 }" draggable="true"
              @dragstart="onElDragStart($event, 'table', 0)" @dragend="onElDragEnd" @click.stop="selectItem('table', 0)"
              @dblclick="deselectAll">
              <div class="text-xs" style="cursor:move">
                <table class="text-xs border-collapse" :style="{ width: detailTableWidthPt + 'pt', tableLayout: 'fixed' }">
                  <colgroup>
                    <col :style="{ width: sequenceColumnWidth + 'pt' }" />
                    <col v-for="c in visCols" :key="c.key" :style="{ width: c.width + 'pt' }" />
                  </colgroup>
                  <thead>
                    <tr :style="{ height: detailHeaderHeight + 'pt' }">
                      <th class="border px-1 py-0.5 bg-gray-50" :style="{ width: sequenceColumnWidth + 'pt' }">#</th>
                      <th v-for="c in visCols" :key="c.key" class="border px-1 py-0.5 bg-gray-50"
                        :class="{ 'ring-2 ring-blue-500': selType === 'detail' && selIdx === colIndex(c.key) }"
                        :style="{ width: c.width + 'pt', textAlign: c.align, whiteSpace: 'nowrap', overflow: 'hidden' }"
                        @click.stop="selectItem('detail', colIndex(c.key))">{{ c.title }}</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr :style="{ height: detailRowHeight + 'pt' }">
                      <td colspan="10" class="border text-center text-gray-300 py-1">{{ t("canvas.detailData") }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- 自由元素（可拖拽移动） -->
            <div v-for="(e, i) in visibleFreeElements" :key="'e' + i"
              class="absolute border border-transparent hover:border-blue-400 select-none cursor-move canvas-el"
              :class="{ 'ring-2 ring-blue-500': selIdx === freeIndex(e) && selType === 'free' }"
              :style="{ left: e.left + 'pt', top: e.top + 'pt', width: e.width + 'pt', height: e.height + 'pt', fontSize: (e.fontSize || 9) + 'pt', zIndex: 20 }"
              draggable="true" @dragstart="onElDragStart($event, 'free', freeIndex(e))" @dragend="onElDragEnd"
              @click.stop="selectItem('free', freeIndex(e))" @dblclick="removeItem('free', freeIndex(e))">
              <div v-if="e.type === 'hline'" :style="{ borderTop: '1pt solid #333', height: '1pt' }"></div>
              <img v-else-if="e.type === 'barcode' || e.type === 'qrcode'" :src="dataUrlCache[freeIndex(e)]"
                :style="{ width: e.width + 'pt', height: e.height + 'pt', display: 'block' }" />
              <div v-else>{{ e.content }}</div>
            </div>

            <!-- {{ t("footer.title") }}预览：页码贴内容区底（与打印一致） -->
            <div v-if="config.showPageNumber"
              class="absolute text-xs text-gray-400 pointer-events-none text-center"
              :style="{ left: '0', right: '0', top: pageNumPreviewTopPt + 'pt', zIndex: 5 }">
              {{ t("canvas.pageNum", 1, 1) }}<span v-if="config.footerText"> | {{ config.footerText }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右栏 -->
      <div class="right flex flex-col bg-white border rounded shadow-sm p-2 ml-1 overflow-auto designer-right">
        <div class="text-xs font-medium mb-2">属性 <span v-if="selIdx >= 0"
            class="text-gray-400 font-normal">(双击删除)</span></div>
        <div v-if="selIdx < 0 && selType !== 'section' && selType !== 'title'" class="text-xs text-gray-400 mb-2">选中画布上的元素编辑属性</div>

        <!-- 标题 -->
        <template v-if="selType === 'title'">
          <div class="text-xs font-medium mb-1">{{ t("props.docTitle") }}</div>
          <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-xs mt-1">
            <span>{{ t("props.name") }}</span><input v-model="config.title" class="border rounded px-1" />
            <span>{{ t("props.fontSize") }}</span><input v-model.number="config.titleFontSize" type="number" class="border rounded px-1"
              min="8" max="28" />
            <span>{{ t("field.left") }}</span><input v-model.number="config.titleLeft" type="number" class="border rounded px-1" min="0" />
            <span>{{ t("field.top") }}</span><input v-model.number="config.titleTop" type="number" class="border rounded px-1" min="0" />
            <span>{{ t("field.width") }}</span>
            <div class="flex items-center gap-0.5">
              <input v-model.number="config.titleWidth" type="number" class="border rounded px-1 w-full" min="0"
                placeholder="0=通栏" />
              <span class="text-gray-400 shrink-0">pt</span>
            </div>
          </div>
          <div class="text-xs text-gray-400 mt-1">{{ t("props.docTitleHint") }}</div>
        </template>

        <!-- 全局（未选中元素时） -->
        <template v-if="selIdx < 0 && selType !== 'title'">
          <div class="text-xs text-gray-400 mb-2">{{ t("props.selectHint") }}</div>
        </template>

        <!-- 全局：单据名称（兼容旧入口，选中标题时见上方） -->
        <template v-if="selIdx < 0 && selType !== 'title'">
          <div class="text-xs font-medium mb-1">{{ t("props.docName") }}</div>
          <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-xs mt-1">
            <span>{{ t("props.name") }}</span><input v-model="config.title" class="border rounded px-1 col-span-1" />
            <span>{{ t("props.fontSize") }}</span><input v-model.number="config.titleFontSize" type="number" class="border rounded px-1"
              min="8" max="28" />
          </div>
        </template>

        <template v-if="selType === 'section' && selSection">
          <div class="text-xs font-medium mb-1">{{ t("section.label", selSection.title) }}</div>
          <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-xs mt-1">
            <span>{{ t("section.name") }}</span><input v-model="selSection.title" class="border rounded px-1" />
            <span>{{ t("section.top") }}</span><input :value="selSection.top" type="number" class="border rounded px-1"
              @input="onSectionTopInput(selSection.key, $event)" />
            <span>{{ t("section.height") }}</span><input v-model.number="selSection.height" type="number" class="border rounded px-1" min="1" />
            <template v-if="selSection.key === 'header'">
              <span>{{ t("section.printMode") }}</span>
              <select v-model="selSection.printMode" class="border rounded px-1 text-xs">
                <option value="every">{{ t("canvas.everyPage") }}</option>
                <option value="first">{{ t("canvas.firstPageOnly") }}</option>
              </select>
            </template>
            <template v-if="selSection.key === 'footer'">
              <span>打印</span>
              <select v-model="selSection.printMode" class="border rounded px-1 text-xs">
                <option value="every">每页</option>
                <option value="last">{{ t("canvas.lastPageOnly") }}</option>
              </select>
            </template>
          </div>
          <label class="text-xs mt-1 flex items-center gap-1"><input type="checkbox" v-model="selSection.visible" />
            {{ t("section.show") }}</label>
          <div class="flex gap-1 mt-2">
            <button type="button" class="vbp-btn"  @click="hideSection(selSection.key)">{{ t("section.hide") }}</button>
          </div>
        </template>

        <!-- 表格位置 -->
        <template v-if="selType === 'table'">
          <div class="text-xs font-medium mb-1">{{ t("table.position") }}</div>
          <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-xs mt-1">
            <span>{{ t("table.left") }}</span><input v-model.number="config.tableLeft" type="number" class="border rounded px-1" />
            <span>{{ t("table.top") }}</span><input v-model.number="config.tableTop" type="number" class="border rounded px-1" />
            <span>{{ t("table.seqCol") }}</span><input v-model.number="config.sequenceColumnWidth" type="number" class="border rounded px-1"
              min="10" />
            <span>{{ t("table.colHeaderH") }}</span><input v-model.number="config.detailHeaderHeight" type="number" class="border rounded px-1"
              min="8" />
            <span>{{ t("table.rowH") }}</span><input v-model.number="config.detailRowHeight" type="number" class="border rounded px-1"
              min="8" />
          </div>
          <div class="text-xs text-gray-500 mt-1">{{ t("table.widthInfo", (detailTableWidthPt / PT_PER_MM).toFixed(1), (printableWidthPt / PT_PER_MM).toFixed(1)) }}</div>
          <div class="text-xs text-gray-400 mt-1">{{ t("table.hint") }}</div>
          <div v-if="tableTitleGapPt >= 0"
            class="text-xs mt-2 p-1.5 rounded bg-amber-50 border border-amber-200 text-amber-900">
            <div>标题底 → 表格顶：<strong>{{ tableTitleGapPt.toFixed(0) }} pt</strong>（≈ {{ (tableTitleGapPt /
              2.835).toFixed(1) }} mm）</div>
            <div class="mt-1 text-amber-800">{{ t("table.gapNote") }}</div>
          </div>
        </template>

        <!-- 表头字段 -->
        <template v-if="selType === 'header' && selField">
          <div class="text-xs mb-1 font-mono">{{ selField.key }}</div>
          <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-xs mt-1">
            <span>{{ t("field.title") }}</span><input v-model="selField.title" class="border rounded px-1" />
            <span>{{ t("field.fontSize") }}</span><input v-model.number="selField.fontSize" type="number" class="border rounded px-1" min="6"
              max="24" />
            <span>{{ t("field.width") }}</span><input v-model.number="selField.width" type="number" class="border rounded px-1" min="20"
              max="500" />
            <span>{{ t("field.left") }}</span><input v-model.number="selField.left" type="number" class="border rounded px-1" />
            <span>{{ t("field.top") }}</span><input v-model.number="selField.top" type="number" class="border rounded px-1" />
            <span>{{ t("field.section") }}</span>
            <select v-model="selField.section" class="border rounded px-1 text-xs">
              <option value="header">{{ t("field.sectionHeader") }}</option>
              <option value="footer">{{ t("field.sectionFooter") }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2 mt-1 text-xs">
            <label><input type="checkbox" v-model="selField.bold" /> {{ t("field.bold") }}</label>
            <label><input type="checkbox" v-model="selField.showLabel" /> {{ t("field.showLabel") }}</label>
          </div>
          <div class="text-xs mt-1 flex items-center gap-2">
            <span>{{ t("field.align") }}</span>
            <select v-model="selField.align" class="border rounded px-1 text-xs">
              <option value="left">{{ t("field.alignLeft") }}</option>
              <option value="center">{{ t("field.alignCenter") }}</option>
              <option value="right">{{ t("field.alignRight") }}</option>
            </select>
          </div>
          <div v-if="selFieldTypeIsNumber" class="text-xs mt-1 flex items-center gap-2">
            <span>{{ t("field.decimalPlaces") }}</span>
            <input v-model.number="selField.decimalPlaces" type="number" class="border rounded px-1 w-12" min="0" max="6"
              placeholder="默认" :title="t('field.decimalHint')" />
            <span class="text-gray-400">{{ t("field.decimalHintShort") }}</span>
          </div>
          <div v-if="selFieldTypeIsDate" class="text-xs mt-1 flex items-center gap-2">
            <span>{{ t("field.dateFormat") }}</span>
            <input v-model="selField.dateFormat" class="border rounded px-1" placeholder="YYYY-MM-DD"
              :title="t('field.dateFormatHint')" />
          </div>
          <button type="button" class="vbp-btn mt-2" @click="removeItem('header', selIdx)">{{ t('field.delete') }}</button>
        </template>

        <!-- 明细列 -->
        <template v-if="selType === 'detail' && selCol">
          <div class="text-xs mb-1 font-mono">{{ selCol.key }}</div>
          <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-xs mt-1">
            <span>标题</span><input v-model="selCol.title" class="border rounded px-1" />
            <span>列宽</span><input v-model.number="selCol.width" type="number" class="border rounded px-1" min="15"
              max="300" />
            <span>小数位</span>
            <input v-model.number="selCol.decimalPlaces" type="number" class="border rounded px-1" min="0" max="6"
              placeholder="默认" title="数值列保留小数位数；空=不强制，建议 0～6" />
          </div>
          <div class="text-xs text-gray-400 mt-0.5">数值列可设小数位（如单价 2、数量 0）</div>
          <label class="text-xs mt-1 flex items-center gap-1"><input type="checkbox" v-model="selCol.visible" />
            可见</label>
          <div class="text-xs mt-1 flex items-center gap-2">
            <span>对齐</span>
            <select v-model="selCol.align" class="border rounded px-1 text-xs">
              <option value="left">左</option>
              <option value="center">中</option>
              <option value="right">右</option>
            </select>
          </div>
          <div class="flex gap-1 mt-2">
            <button type="button" class="vbp-btn"  :disabled="selIdx <= 0" @click="moveDetailCol(-1)">↑ 左移</button>
            <button type="button" class="vbp-btn"  :disabled="selIdx >= config.detailColumns.length - 1" @click="moveDetailCol(1)">↓
              右移</button>
          </div>
          <button type="button" class="vbp-btn mt-2" @click="removeItem('detail', selIdx)">{{ t('field.delete') }}</button>
        </template>

        <!-- 自由元素 -->
        <template v-if="selType === 'free' && selFree">
          <div class="text-xs mb-1 font-mono">{{ selFree.type === 'barcode' ? '条码' : selFree.type === 'qrcode' ? '二维码' : '自由元素' }}</div>
          <div class="grid grid-cols-2 gap-x-2 gap-y-1 text-xs mt-1">
            <span>内容</span><input v-model="selFree.content" class="border rounded px-1" placeholder="文本或 {字段名}" />
            <template v-if="selFree.type === 'barcode'">
              <span>格式</span>
              <select v-model="selFree.barcodeFormat" class="border rounded px-1 text-xs">
                <option value="CODE128">CODE128（通用）</option>
                <option value="CODE39">CODE39</option>
                <option value="EAN13">EAN13</option>
                <option value="EAN8">EAN8</option>
                <option value="UPC">UPC</option>
                <option value="ITF14">ITF14</option>
              </select>
            </template>
            <span>分区</span>
            <select v-model="selFree.section" class="border rounded px-1 text-xs">
              <option value="header">上部分（每页）</option>
              <option value="footer">下部分（仅末页）</option>
            </select>
            <span>{{ t("toolbar.width") }}</span><input v-model.number="selFree.width" type="number" class="border rounded px-1" min="10" />
            <span>{{ t("toolbar.height") }}</span><input v-model.number="selFree.height" type="number" class="border rounded px-1" min="1" />
            <span>左</span><input v-model.number="selFree.left" type="number" class="border rounded px-1" />
            <span>上</span><input v-model.number="selFree.top" type="number" class="border rounded px-1" />
            <template v-if="selFree.type !== 'barcode' && selFree.type !== 'qrcode'">
              <span>字号</span><input v-model.number="selFree.fontSize" type="number" class="border rounded px-1" min="6"
                max="24" />
            </template>
          </div>
          <div v-if="selFree.type === 'barcode' || selFree.type === 'qrcode'" class="text-xs text-gray-400 mt-1">内容支持
            {字段名} 占位符，打印时替换为表头字段值</div>
          <button type="button" class="vbp-btn mt-2" @click="removeItem('free', selIdx)">{{ t('field.delete') }}</button>
        </template>

        <!-- {{ t("tpl.panels") }}（始终显示，隐藏的分区也可在此恢复） -->
        <div class="text-xs font-medium mt-3 mb-1">{{ t("tpl.panels") }}</div>
        <div v-for="section in sectionList" :key="section.key"
          class="text-xs flex items-center gap-1 mb-1 p-1 bg-gray-50 rounded border"
          :class="{ 'opacity-50': !section.visible }">
          <label class="flex items-center gap-1 flex-1">
            <input type="checkbox" v-model="section.visible" />
            <span>{{ section.title }}</span>
            <span v-if="!section.visible" class="text-gray-400">(已隐藏)</span>
          </label>
          <button class="text-blue-600" @click="selectSection(section.key)">{{ t('tpl.edit') }}</button>
        </div>

        <!-- 汇总 -->
        <div class="text-xs font-medium mt-3 mb-1">{{ t("summary.title") }}</div>
        <div v-if="!config.summaryRows.length" class="text-xs text-gray-400">{{ t('summary.none') }}</div>
        <div v-for="(s, i) in config.summaryRows" :key="i"
          class="text-xs flex items-center gap-1 mb-2 p-1 bg-blue-50 rounded border">
          <select v-model="s.method" class="border rounded px-0.5 text-xs w-14">
            <option value="sum">{{ t('summary.sum') }}</option>
            <option value="count">{{ t('summary.count') }}</option>
            <option value="avg">{{ t('summary.avg') }}</option>
          </select>
          <select v-model="s.field" class="border rounded px-0.5 text-xs flex-1">
            <option value="">{{ t("summary.selectColumn") }}</option>
            <option v-for="c in config.detailColumns" :key="c.key" :value="c.key">{{ c.title }}</option>
          </select>
          <span v-if="s.field" class="text-gray-600 italic">({{config.detailColumns.find(c => c.key === s.field)?.title
            }})</span>
          <button class="text-red-500" @click="config.summaryRows.splice(i, 1)">✕</button>
        </div>
        <button type="button" class="vbp-btn mt-1"
          @click="config.summaryRows.push({ label: t('summary.sum'), field: config.detailColumns[0]?.key || '', method: 'sum', position: 'footer' })">+
          添加</button>

        <div class="text-xs font-medium mt-3 mb-1">{{ t("footer.title") }}</div>
        <label class="text-xs flex items-center gap-1"><input type="checkbox" v-model="config.showPageNumber" />
          显示页码</label>
        <input v-model="config.footerText" class="border rounded px-1 w-full mt-1 text-xs" :placeholder="t('footer.textPlaceholder')" />
      </div>
    </div>
  </div>

  <!-- JSON 查看器 -->
  <div v-if="showJson" class="vbp-modal-mask" @click.self="showJson = false">
    <div class="vbp-modal">
      <div class="vbp-modal-head">
        <span>{{ t('json.title') }}</span>
        <div class="flex gap-1">
          <button type="button" class="vbp-btn" @click="copyJson">{{ t('json.copy') }}</button>
          <button type="button" class="vbp-btn" @click="showJson = false">{{ t('json.close') }}</button>
        </div>
      </div>
      <textarea class="vbp-modal-body" readonly :value="jsonText"></textarea>
      <div class="text-xs text-gray-400 mt-1 px-2 pb-2">{{ t('json.hint') }}</div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { t } from "./i18n";
import { ref, reactive, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import type { BackendData, PrintSectionConfig, PrintSectionKey, PrintTemplateConfig, TemplateStore, MessageLevel } from './types';
import { normalizeBackendData } from './types';
import { getStore, emitMessage } from './storage';
import { getTitleTopPt, DEFAULT_ROWS_PER_PAGE, computeMaxFittingRows, computeContinuationFittingRows, renderFromConfigAsync } from './render';
import { getBuiltinDefault } from './defaultTemplates';
import JsBarcode from 'jsbarcode';
import * as QRCode from 'qrcode';

const props = defineProps<{
  formType: string;
  backendData: BackendData | null;
  /** Inject template persistence; defaults to configure()/localStorage */
  store?: TemplateStore;
  onMessage?: (level: MessageLevel, text: string) => void;
}>();

const notify = (level: MessageLevel, text: string) => emitMessage(level, text, props.onMessage);
const storeOf = () => getStore(props.store);

const canvasRef = ref<HTMLElement | null>(null);
const showGapGuide = ref(true);
const TITLE_LINE_HEIGHT = 1.2;
const PT_PER_MM = 2.835;
const DEFAULT_SEQUENCE_COL_WIDTH = 20;
const DEFAULT_DETAIL_HEADER_HEIGHT = 14;
const DEFAULT_DETAIL_ROW_HEIGHT = 13;

// 纸张
const paperPresets: Record<string, { w: number; h: number }> = { A3: { w: 297, h: 420 }, A4: { w: 210, h: 297 }, A5: { w: 148, h: 210 }, B5: { w: 176, h: 250 } };
const curPaperType = ref('A5');
const showPaperPop = ref(false);
const customW = ref(148); const customH = ref(210);
const isLandscape = computed(() => config.paper.orientation === 'landscape');
const toggleOrientation = () => {
  config.paper.orientation = isLandscape.value ? 'portrait' : 'landscape';
};

// 字段列表
const headerFields = computed(() => {
  const nd = normalizeBackendData(props.backendData);
  return nd.TbHeaders.filter(h => h.Visible !== false).map(h => ({ key: h.Key, title: h.Title, type: h.Type }));
});
const detailFields = computed(() => {
  const nd = normalizeBackendData(props.backendData);
  return nd.TbDetailHeaders.filter(h => h.Visible !== false).map(h => ({ key: h.Key, title: h.Title, type: h.Type }));
});

const createDefaultSections = () => {
  const rows = DEFAULT_ROWS_PER_PAGE;
  const rowPt = DEFAULT_DETAIL_ROW_HEIGHT;
  const detailH = DEFAULT_DETAIL_HEADER_HEIGHT + rows * rowPt;
  return {
    header: { key: 'header', title: t('default.sectionHeader'), top: 20, height: 95, visible: true, autoFlow: true, printMode: 'every' } as PrintSectionConfig,
    detail: { key: 'detail', title: t('default.sectionDetail'), top: 120, height: Math.max(detailH, 60), visible: true, autoFlow: true } as PrintSectionConfig,
    footer: { key: 'footer', title: t('default.sectionFooter'), top: 450, height: 55, visible: true, autoFlow: true, printMode: 'last' } as PrintSectionConfig,
  };
};

// 配置
const config = reactive<PrintTemplateConfig>({
  paper: { width: 148, height: 210, orientation: 'portrait', marginTop: 8, marginRight: 6, marginBottom: 8, marginLeft: 6 },
  sections: createDefaultSections(),
  headerFields: [], detailColumns: [], freeElements: [], summaryRows: [],
  tableLeft: 10, tableTop: 120,
  sequenceColumnWidth: DEFAULT_SEQUENCE_COL_WIDTH,
  detailHeaderHeight: DEFAULT_DETAIL_HEADER_HEIGHT,
  detailRowHeight: DEFAULT_DETAIL_ROW_HEIGHT,
  allowTableOverflow: true,
  headerNoWrap: true,
  title: t('default.docTitle'), titleFontSize: 14, titleTop: 28, titleLeft: 0, titleWidth: 0,
  titleMarginBottom: 1, rowsPerPage: DEFAULT_ROWS_PER_PAGE, repeatHeader: true, repeatColumnHeader: true,
  footerText: '', showPageNumber: true, version: 3,
});

// 标尺刻度 (mm)：每 5mm 显示数字
const RULER_LABEL_STEP_MM = 5;
const buildRulerLabels = (maxMm: number) => {
  const labels: number[] = [];
  for (let mm = RULER_LABEL_STEP_MM; mm <= maxMm; mm += RULER_LABEL_STEP_MM) labels.push(mm);
  return labels;
};
const xLabelMm = computed(() => buildRulerLabels(config.paper.width));
const yLabelMm = computed(() => buildRulerLabels(config.paper.height));

const colIndex = (key: string) => config.detailColumns.findIndex(c => c.key === key);
const freeIndex = (item: unknown) => config.freeElements.findIndex(e => e === item);
const moveDetailCol = (dir: -1 | 1) => {
  const i = selIdx.value;
  const j = i + dir;
  if (selType.value !== 'detail' || i < 0 || j < 0 || j >= config.detailColumns.length) return;
  const [col] = config.detailColumns.splice(i, 1);
  config.detailColumns.splice(j, 0, col);
  selIdx.value = j;
};

const sectionKeys: PrintSectionKey[] = ['header', 'detail', 'footer'];
const sectionList = computed(() => sectionKeys.map(key => config.sections![key]));
const repeatHeaderComputed = computed({
  get: () => config.sections?.header?.printMode === 'every',
  set: (v: boolean) => {
    if (config.sections?.header) config.sections.header.printMode = v ? 'every' : 'first';
  },
});
const normalizeSections = () => {
  if (!config.sections) {
    config.sections = createDefaultSections();
    return;
  }
  const defaults = createDefaultSections();
  for (const key of sectionKeys) {
    const s = config.sections[key];
    const d = defaults[key];
    if (!s) {
      config.sections[key] = { ...d };
      continue;
    }
    if (!s.key) s.key = key;
    if (!s.title) s.title = d.title;
    if (s.visible == null) s.visible = true;
    if (s.autoFlow == null) s.autoFlow = true;
    if (key === 'header' && !s.printMode) {
      s.printMode = config.repeatHeader ? 'every' : 'first';
    }
    if (key === 'footer' && !s.printMode) {
      s.printMode = 'last';
    }
  }
};

const visibleHeaderFields = computed(() =>
  config.headerFields.filter(f => {
    const sectionKey = f.section || 'header';
    // 表头字段允许放在上/下部分；所在分区隐藏时不显示
    if (sectionKey === 'detail') return config.sections?.header?.visible !== false;
    return config.sections?.[sectionKey as PrintSectionKey]?.visible !== false;
  })
);
// 选中表头字段的类型判断（用于显示小数位/日期格式控件）
const selFieldType = computed(() => {
  if (!selField.value) return '';
  const h = normalizeBackendData(props.backendData).TbHeaders.find(x => x.Key === selField.value!.key);
  return h?.Type || '';
});
const selFieldTypeIsNumber = computed(() => {
  const t = selFieldType.value.toLowerCase();
  return t === 'number' || t === 'decimal' || t === 'float' || t === 'double' || t === 'int' || t === 'integer';
});
const selFieldTypeIsDate = computed(() => {
  const t = selFieldType.value.toLowerCase();
  return t === 'date' || t === 'datetime';
});

const visibleFreeElements = computed(() =>
  config.freeElements.filter(e => config.sections?.[e.section || 'header']?.visible !== false)
);

// 条码/二维码预览图缓存：key = freeElements 索引
const dataUrlCache = reactive<Record<number, string>>({});
const regenerateBarcodes = async () => {
  if (typeof document === 'undefined') return;
  for (let i = 0; i < config.freeElements.length; i++) {
    const e = config.freeElements[i];
    if (e.type !== 'barcode' && e.type !== 'qrcode') continue;
    try {
      if (e.type === 'barcode') {
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, e.content || ' ', {
          format: e.barcodeFormat || 'CODE128',
          width: 2, height: 50, displayValue: true, fontSize: 8, margin: 2,
        });
        dataUrlCache[i] = canvas.toDataURL('image/png');
      } else {
        dataUrlCache[i] = await QRCode.toDataURL(e.content || ' ', { width: 200, margin: 1 });
      }
    } catch {
      delete dataUrlCache[i];
    }
  }
};
watch(
  () => config.freeElements.map(e => `${e.type}|${e.content}|${e.barcodeFormat}`),
  regenerateBarcodes,
  { deep: true },
);
const sequenceColumnWidth = computed(() => config.sequenceColumnWidth || DEFAULT_SEQUENCE_COL_WIDTH);
const detailHeaderHeight = computed(() => config.detailHeaderHeight || DEFAULT_DETAIL_HEADER_HEIGHT);
const detailRowHeight = computed(() => config.detailRowHeight || DEFAULT_DETAIL_ROW_HEIGHT);
const detailTableWidthPt = computed(() =>
  sequenceColumnWidth.value + visCols.value.reduce((sum, col) => sum + (Number(col.width) || 0), 0)
);
const printableWidthPt = computed(() =>
  Math.max(0, (config.paper.width - config.paper.marginLeft - config.paper.marginRight) * PT_PER_MM - (config.tableLeft || 0))
);
const tableOverflowPt = computed(() => Math.max(0, detailTableWidthPt.value - printableWidthPt.value));
/** 当前纸张在设计尺寸下大约能排几行（不缩放）；超出则提示调{{ t("table.rowH") }}/行数 */
const suggestedRows = computed(() => computeMaxFittingRows(config, { includeSummary: true, includeFooter: true }));
const continuationRows = computed(() => computeContinuationFittingRows(config));

/** 内容区高度（pt），与打印坐标系一致 */
const contentHeightPt = computed(() =>
  Math.max(0, (config.paper.height - config.paper.marginTop - config.paper.marginBottom) * PT_PER_MM)
);
/** 页码预览贴内容区底 */
const pageNumPreviewTopPt = computed(() => Math.max(0, contentHeightPt.value - 12));

const shiftItemsInSection = (sectionKey: PrintSectionKey, deltaTop: number) => {
  if (sectionKey === 'detail') {
    config.tableTop = Math.max(0, config.tableTop + deltaTop);
    if (config.sections?.detail) config.sections.detail.top = config.tableTop;
    return;
  }
  if (sectionKey === 'header') {
    config.titleTop = Math.max(0, (config.titleTop || 0) + deltaTop);
  }
  config.headerFields
    .filter(field => (field.section || 'header') === sectionKey)
    .forEach(field => { field.top = Math.max(0, field.top + deltaTop); });
  config.freeElements
    .filter(item => (item.section || 'header') === sectionKey)
    .forEach(item => { item.top = Math.max(0, item.top + deltaTop); });
};

const moveSectionTo = (sectionKey: PrintSectionKey, nextTop: number) => {
  const section = config.sections?.[sectionKey];
  if (!section) return;
  const safeTop = Math.max(0, nextTop);
  const deltaTop = safeTop - section.top;
  section.top = safeTop;
  shiftItemsInSection(sectionKey, deltaTop);
};

const onSectionTopInput = (sectionKey: PrintSectionKey, event: Event) => {
  const input = event.target as HTMLInputElement | null;
  moveSectionTo(sectionKey, Number(input?.value) || 0);
};

const findSectionKeyByTop = (top: number): PrintSectionKey => {
  const hit = sectionList.value
    .filter(section => section.visible && top >= section.top && top <= section.top + section.height)
    .sort((a, b) => b.top - a.top)[0];
  if (hit) return hit.key;
  // ponytail: 表格下方默认归下部分，表格上方归上部分
  const detail = config.sections?.detail;
  if (detail && top >= detail.top + detail.height) return 'footer';
  return 'header';
};

const hideSection = (sectionKey: PrintSectionKey) => {
  const section = config.sections?.[sectionKey];
  if (!section) return;
  section.visible = false;
};

const syncColumnTypes = () => {
  for (const col of config.detailColumns) {
    if (!col.type) {
      const h = normalizeBackendData(props.backendData).TbDetailHeaders.find(x => x.Key === col.key);
      if (h?.Type) col.type = h.Type;
    }
  }
  if (config.titleMarginBottom == null) config.titleMarginBottom = 1;
  if (config.titleTop == null) config.titleTop = 28;
  if (config.titleLeft == null) config.titleLeft = 0;
  if (config.titleWidth == null) config.titleWidth = 0;
  if (!config.rowsPerPage || config.rowsPerPage < 1) config.rowsPerPage = DEFAULT_ROWS_PER_PAGE;
  if (!config.sequenceColumnWidth) config.sequenceColumnWidth = DEFAULT_SEQUENCE_COL_WIDTH;
  if (!config.detailHeaderHeight) config.detailHeaderHeight = DEFAULT_DETAIL_HEADER_HEIGHT;
  if (!config.detailRowHeight) config.detailRowHeight = DEFAULT_DETAIL_ROW_HEIGHT;
  if (config.allowTableOverflow == null) config.allowTableOverflow = true;
  if (config.headerNoWrap == null) config.headerNoWrap = true;
  config.version = Math.max(Number(config.version || 0), 3);
  normalizeSections();
  config.headerFields.forEach(field => { if (!field.section) field.section = 'header'; });
  config.freeElements.forEach(item => {
    if (!item.section) item.section = findSectionKeyByTop(item.top);
  });
};

/** 根据纸张尺寸识别预设或自定义 */
const syncPaperTypeFromConfig = () => {
  const w = config.paper.width;
  const h = config.paper.height;
  for (const [type, preset] of Object.entries(paperPresets)) {
    const pw = config.paper.orientation === 'portrait' ? preset.w : preset.h;
    const ph = config.paper.orientation === 'portrait' ? preset.h : preset.w;
    if (Math.abs(w - pw) < 0.5 && Math.abs(h - ph) < 0.5) {
      curPaperType.value = type;
      return;
    }
  }
  curPaperType.value = 'custom';
  customW.value = w;
  customH.value = h;
};

const normalizeLoadedConfig = () => {
  syncColumnTypes();
  syncPaperTypeFromConfig();
};

// 计算属性
const canvasStyle = computed(() => {
  const w = isLandscape.value ? config.paper.height : config.paper.width;
  const h = isLandscape.value ? config.paper.width : config.paper.height;
  return {
    width: w + 'mm',
    minHeight: h + 'mm',
    padding: `${config.paper.marginTop}mm ${config.paper.marginRight}mm ${config.paper.marginBottom}mm ${config.paper.marginLeft}mm`,
    position: 'relative' as const,
    overflow: 'visible',
  };
});
const visCols = computed(() => config.detailColumns.filter(c => c.visible));
watch(() => config.tableTop, top => {
  if (config.sections?.detail && config.sections.detail.top !== top) config.sections.detail.top = top;
});
const titleBottomPt = computed(() => getTitleTopPt(config) + config.titleFontSize * TITLE_LINE_HEIGHT);
const tableTitleGapPt = computed(() => config.tableTop - titleBottomPt.value);
const titleCanvasStyle = computed(() => {
  const top = getTitleTopPt(config);
  const left = config.titleLeft ?? 0;
  const width = config.titleWidth ?? 0;
  const base: Record<string, string> = {
    top: `${top}pt`,
    fontSize: `${config.titleFontSize}pt`,
    lineHeight: '1.2',
  };
  if (width > 0) {
    base.left = `${left}pt`;
    base.width = `${width}pt`;
  } else if (left > 0) {
    base.left = `${left}pt`;
    base.right = '0';
  } else {
    base.left = '0';
    base.right = '0';
  }
  return base;
});

// 选中
const selIdx = ref(-1);
const selType = ref<'header' | 'detail' | 'free' | 'table' | 'title' | 'section' | ''>('');
const selSectionKey = ref<PrintSectionKey | ''>('');
const selField = computed(() => selType.value === 'header' && selIdx.value >= 0 ? config.headerFields[selIdx.value] : null);
const selCol = computed(() => selType.value === 'detail' && selIdx.value >= 0 ? config.detailColumns[selIdx.value] : null);
const selFree = computed(() => selType.value === 'free' && selIdx.value >= 0 ? config.freeElements[selIdx.value] : null);
const selSection = computed(() => selType.value === 'section' && selSectionKey.value ? config.sections?.[selSectionKey.value] : null);
const deselectAll = () => { selIdx.value = -1; selType.value = ''; selSectionKey.value = ''; };
const selectItem = (type: string, idx: number) => { selType.value = type as any; selIdx.value = idx; selSectionKey.value = ''; };
const selectSection = (key: PrintSectionKey) => { selType.value = 'section'; selSectionKey.value = key; selIdx.value = -1; };
const removeItem = (type: string, idx: number) => {
  if (type === 'header') config.headerFields.splice(idx, 1);
  else if (type === 'detail') config.detailColumns.splice(idx, 1);
  else if (type === 'free') config.freeElements.splice(idx, 1);
  selIdx.value = -1; selType.value = '';
};

// 从左侧面板拖入 / 画布内移动
let dragData: { type: string; data: any } | null = null;
let moveDrag: { type: string; idx: number | PrintSectionKey } | null = null;
// 鼠标按下时相对元素左上角的偏移 (pt)，drop 时减去以保持相对位置
let dragOffsetPt = { x: 0, y: 0 };

const getCanvasPxPerMm = () => {
  const canvas = canvasRef.value;
  if (!canvas) return 0;
  const rect = canvas.getBoundingClientRect();
  return rect.width / config.paper.width;
};

const getCanvasPt = (e: DragEvent) => {
  const canvas = canvasRef.value;
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const pxPerMm = rect.width / config.paper.width;
  return {
    ptX: ((e.clientX - rect.left) / pxPerMm) * 2.835,
    ptY: ((e.clientY - rect.top) / pxPerMm) * 2.835,
  };
};

const onCanvasDragOver = (e: DragEvent) => {
  e.preventDefault();
  if (e.dataTransfer) e.dataTransfer.dropEffect = moveDrag ? 'move' : 'copy';
};

const onDragStart = (e: DragEvent, type: string, data: any) => {
  moveDrag = null;
  dragData = { type, data };
  dragOffsetPt = { x: 0, y: 0 };
  if (e.dataTransfer) e.dataTransfer.effectAllowed = 'copy';
};

const onElDragStart = (e: DragEvent, type: string, idx: number | PrintSectionKey) => {
  dragData = null;
  moveDrag = { type, idx };
  e.stopPropagation();

  const target = e.currentTarget as HTMLElement | null;
  const pxPerMm = getCanvasPxPerMm();
  if (target && pxPerMm > 0) {
    const r = target.getBoundingClientRect();
    dragOffsetPt = {
      x: ((e.clientX - r.left) / pxPerMm) * 2.835,
      y: ((e.clientY - r.top) / pxPerMm) * 2.835,
    };
  } else {
    dragOffsetPt = { x: 0, y: 0 };
  }

  if (e.dataTransfer) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', 'move');
  }
};

const onElDragEnd = () => { moveDrag = null; dragOffsetPt = { x: 0, y: 0 }; };

const handleCanvasDrop = (e: DragEvent) => {
  e.preventDefault();
  const pos = getCanvasPt(e);
  if (!pos) return;
  const { ptX, ptY } = pos;

  if (moveDrag) {
    const { type, idx } = moveDrag;
    // 减去鼠标在元素内的偏移，保持元素与鼠标的相对位置
    const newLeft = Math.max(0, ptX - dragOffsetPt.x);
    const newTop = Math.max(0, ptY - dragOffsetPt.y);
    if (type === 'header' && config.headerFields[idx as number]) {
      config.headerFields[idx as number].left = newLeft;
      config.headerFields[idx as number].top = newTop;
      // 按落点归属上/下部分，避免拖到下部分后仍按表头逻辑被盖住或打印异常
      const sectionKey = findSectionKeyByTop(newTop);
      config.headerFields[idx as number].section = sectionKey === 'detail' ? 'header' : sectionKey;
    } else if (type === 'free' && config.freeElements[idx as number]) {
      config.freeElements[idx as number].left = newLeft;
      config.freeElements[idx as number].top = newTop;
      config.freeElements[idx as number].section = findSectionKeyByTop(newTop);
    } else if (type === 'table') {
      config.tableLeft = newLeft;
      config.tableTop = newTop;
      if (config.sections?.detail) config.sections.detail.top = newTop;
    } else if (type === 'title') {
      config.titleLeft = newLeft;
      config.titleTop = newTop;
    } else if (type === 'section') {
      moveSectionTo(idx as PrintSectionKey, newTop);
    }
    moveDrag = null;
    dragOffsetPt = { x: 0, y: 0 };
    return;
  }

  if (!dragData) return;
  const { type, data } = dragData;
  if (type === 'header') {
    const sectionKey = findSectionKeyByTop(ptY);
    config.headerFields.push({
      key: data.key,
      title: data.title,
      left: ptX,
      top: ptY,
      fontSize: 9,
      width: 120,
      bold: false,
      align: 'left',
      showLabel: true,
      section: sectionKey === 'detail' ? 'header' : sectionKey,
    });
  } else if (type === 'detail') config.detailColumns.push({ key: data.key, title: data.title, width: 60, align: 'center', visible: true, type: data.type });
  else if (type === 'free') {
    const t = data.type || 'text';
    const defaultSize = t === 'hline' ? { width: 120, height: 2 }
      : t === 'barcode' ? { width: 150, height: 50 }
      : t === 'qrcode' ? { width: 80, height: 80 }
      : { width: 100, height: 16 };
    config.freeElements.push({
      type: t,
      left: ptX, top: ptY,
      width: defaultSize.width, height: defaultSize.height,
      content: data.content ?? (t === 'text' ? '文本' : '123456'),
      fontSize: 9,
      ...(t === 'barcode' ? { barcodeFormat: 'CODE128' } : {}),
    });
  }
  if (type === 'free') {
    const lastFree = config.freeElements[config.freeElements.length - 1];
    if (lastFree && !lastFree.section) lastFree.section = findSectionKeyByTop(ptY);
  }
  dragData = null;
};

// 纸张
const setPaper = (type: string, v: { w: number; h: number }) => {
  curPaperType.value = type;
  config.paper.width = v.w;
  config.paper.height = v.h;
};
const openCustomPaperPop = () => {
  customW.value = config.paper.width;
  customH.value = config.paper.height;
  showPaperPop.value = true;
};
const applyCustomPaper = () => {
  curPaperType.value = 'custom';
  config.paper.width = customW.value;
  config.paper.height = customH.value;
  showPaperPop.value = false;
};

// 保存/加载/预览
const saveConfig = async () => {
  try {
    if (config.rowsPerPage > continuationRows.value) {
      notify('warning', `每页上限 ${config.rowsPerPage} 超出续页容量（≤${continuationRows.value}）。单页含头尾约 ${suggestedRows.value} 行。打印按页类型自动分页，不会缩放。`);
    }
    await storeOf().save(props.formType, JSON.stringify(config));
    notify('success', t('notify.saveSuccess'));
  } catch (err) { notify('error', t('notify.saveFailed', String(err))); }
};

const loadConfig = async () => {
  try {
    const templateJson = await storeOf().load(props.formType);
    if (!templateJson) { notify('warning', t('notify.templateNotFound')); return; }
    Object.assign(config, JSON.parse(templateJson));
    normalizeLoadedConfig();
    notify('success', t('notify.loadSuccess'));
  } catch (err) { notify('error', t('notify.loadFailed', String(err))); }
};

const showJson = ref(false);
const jsonText = computed(() => JSON.stringify(config, null, 2));
const openJson = () => { showJson.value = true; };
const copyJson = async () => {
  try {
    await navigator.clipboard.writeText(jsonText.value);
    notify('success', t('notify.copied'));
  } catch {
    notify('error', t('notify.copyFailed'));
  }
};

const previewPrint = async () => {
  if (!props.backendData) { notify('error', t('notify.noData')); return; }
  try {
    const html = await renderFromConfigAsync(config as PrintTemplateConfig, normalizeBackendData(props.backendData));
    const pw = window.open('', '_blank', 'width=800,height=600,scrollbars=yes');
    if (!pw) { notify('error', '打印窗口被拦截'); return; }
    pw.document.write(html);
    pw.document.close();
    setTimeout(() => { pw.focus(); pw.print(); }, 300);
  } catch (err) { notify('error', '打印失败: ' + err); }
};

// 键盘微调：选中元素后，方向键移动 1pt，Shift+方向键移动 10pt
const onKeyDown = (e: KeyboardEvent) => {
  const target = e.target as HTMLElement | null;
  if (target && ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
  const step = e.shiftKey ? 10 : 1;
  let handled = false;
  const move = (obj: { top?: number; left?: number }, allowLeft = true) => {
    if (e.key === 'ArrowUp') { obj.top = (obj.top ?? 0) - step; handled = true; }
    else if (e.key === 'ArrowDown') { obj.top = (obj.top ?? 0) + step; handled = true; }
    else if (allowLeft && e.key === 'ArrowLeft') { obj.left = (obj.left ?? 0) - step; handled = true; }
    else if (allowLeft && e.key === 'ArrowRight') { obj.left = (obj.left ?? 0) + step; handled = true; }
  };
  if (selType.value === 'header' && config.headerFields[selIdx.value]) {
    move(config.headerFields[selIdx.value]);
  } else if (selType.value === 'free' && config.freeElements[selIdx.value]) {
    move(config.freeElements[selIdx.value]);
  } else if (selType.value === 'title') {
    move(config as any);
  } else if (selType.value === 'table') {
    move(config as any);
  } else if (selType.value === 'section' && selSectionKey.value) {
    const s = config.sections?.[selSectionKey.value];
    if (!s) return;
    if (e.key === 'ArrowUp') { moveSectionTo(selSectionKey.value, s.top - step); handled = true; }
    else if (e.key === 'ArrowDown') { moveSectionTo(selSectionKey.value, s.top + step); handled = true; }
  }
  if (handled) e.preventDefault();
};

// 优先载入内置默认模板（首次打开/重置示例时），无则回退到示例铺字段
const applyBuiltinOrDefault = () => {
  const builtin = getBuiltinDefault(props.formType || '');
  if (builtin) {
    Object.assign(config, JSON.parse(JSON.stringify(builtin)));
  } else {
    seedFromBackend();
  }
  normalizeLoadedConfig();
};

// 从后端数据铺表头/明细字段（仅当无已保存模板或该模板字段为空时）
const seedFromBackend = () => {
  config.title = props.formType || config.title;
  headerFields.value.forEach((h, i) => config.headerFields.push({ key: h.key, title: h.title, left: 20, top: 30 + i * 16, fontSize: 9, width: 120, bold: false, align: 'left', showLabel: true, section: 'header' }));
  detailFields.value.forEach(d => config.detailColumns.push({ key: d.key, title: d.title, width: 50, align: 'center', visible: true, type: d.type }));
};

// 生命周期
onMounted(async () => {
  document.addEventListener('keydown', onKeyDown);
  if (!props.backendData) return;
  let loaded = false;
  try {
    const templateJson = await storeOf().load(props.formType);
    if (templateJson) {
      Object.assign(config, JSON.parse(templateJson));
      normalizeLoadedConfig();
      loaded = true;
      if (!config.headerFields?.length && !config.detailColumns?.length) {
        seedFromBackend();
      }
    }
  } catch { /* use defaults */ }
  if (!loaded) applyBuiltinOrDefault();
});
onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown);
});

// 切换模板 / 后端数据时，若该 formType 无自定义保存则按示例重铺字段
watch(
  () => [props.formType, props.backendData],
  async () => {
    if (!props.backendData) return;
    let hasSaved = false;
    try {
      const tj = await storeOf().load(props.formType);
      hasSaved = !!tj;
    } catch { hasSaved = false; }
    if (hasSaved) return;
    config.headerFields = [];
    config.detailColumns = [];
    applyBuiltinOrDefault();
  }
);

// 重置为当前 formType 的示例模板
const resetToSample = async () => {
  try { await storeOf()?.remove?.(props.formType); } catch { /* ignore */ }
  config.headerFields = [];
  config.detailColumns = [];
  applyBuiltinOrDefault();
  notify('success', t('notify.resetOk'));
};
</script>

<style scoped>
.print-designer {
  font-size: 14px;
}

/* 铺满父容器（demo 中父容器给定高度；库使用时不强制全屏） */
.designer-root {
  height: 100%;
  min-height: 480px;
}

.designer-left {
  min-width: 190px;
  width: 190px;
  flex: 0 0 190px;
}

.designer-right {
  min-width: 240px;
  width: 240px;
  flex: 0 0 240px;
}

.center {
  min-width: 0;
}

.field-item:hover {
  border-color: #409eff !important;
}

.canvas-with-rulers {
  display: grid;
  grid-template-columns: 5mm auto;
  grid-template-rows: 4mm auto;
  grid-template-areas:
    "corner ruler-h"
    "ruler-v canvas";
}

.ruler-corner {
  grid-area: corner;
  background: #e8e8e8;
}

.ruler-h {
  grid-area: ruler-h;
  height: 4mm;
  background: #f5f5f5;
  border-bottom: 0.5px solid #ccc;
  position: relative;
  background-image: repeating-linear-gradient(to right, #bbb 0, #bbb 0.2mm, transparent 0.2mm, transparent 5mm);
}

.ruler-v {
  grid-area: ruler-v;
  width: 5mm;
  background: #f5f5f5;
  border-right: 0.5px solid #ccc;
  position: relative;
  background-image: repeating-linear-gradient(to bottom, #bbb 0, #bbb 0.2mm, transparent 0.2mm, transparent 5mm);
}

.ruler-label-h {
  position: absolute;
  top: 0.5mm;
  transform: translateX(-50%);
  font-size: 7px;
  line-height: 1;
  color: #666;
  pointer-events: none;
  white-space: nowrap;
}

.ruler-label-v {
  position: absolute;
  left: 0.5mm;
  transform: translateY(-50%);
  font-size: 7px;
  line-height: 1;
  color: #666;
  pointer-events: none;
  white-space: nowrap;
}

.canvas {
  grid-area: canvas;
  position: relative;
  overflow: visible;
}

.canvas-el {
  z-index: 20;
}

.section-band {
  z-index: 2;
  border-top: 0.5pt dashed rgba(37, 99, 235, 0.45);
  border-bottom: 0.5pt dashed rgba(37, 99, 235, 0.35);
  background: rgba(37, 99, 235, 0.045);
  pointer-events: auto;
  cursor: move;
}

.section-band--active {
  border-color: #2563eb;
  background: rgba(37, 99, 235, 0.1);
}

.section-band-label {
  position: absolute;
  left: 2pt;
  top: 1pt;
  font-size: 7pt;
  line-height: 1;
  color: #2563eb;
  background: rgba(255, 255, 255, 0.85);
  padding: 1pt 3pt;
  border-radius: 2pt;
  pointer-events: none;
}

.section-band .section-tag {
  font-style: normal;
  font-size: 6pt;
  margin-left: 2pt;
  padding: 0.5pt 2pt;
  background: rgba(37, 99, 235, 0.14);
  border-radius: 2pt;
}

.grid-cols-2 {
  display: grid;
  grid-template-columns: 1fr 2fr;
}

.gap-guide {
  position: absolute;
  left: 0;
  right: 0;
  z-index: 0;
  background: repeating-linear-gradient(-45deg,
      rgba(245, 158, 11, 0.06),
      rgba(245, 158, 11, 0.06) 3px,
      rgba(245, 158, 11, 0.14) 3px,
      rgba(245, 158, 11, 0.14) 6px);
  border-left: 1.5pt dashed rgba(245, 158, 11, 0.55);
}

.gap-guide-line {
  position: absolute;
  left: 0;
  right: 0;
  border-top: 1pt dashed rgba(245, 158, 11, 0.75);
}

.gap-guide-line--top {
  top: 0;
}

.gap-guide-line--bottom {
  bottom: 0;
}

.gap-guide-label {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  font-size: 8pt;
  line-height: 1.2;
  color: #b45309;
  background: rgba(255, 251, 235, 0.92);
  padding: 1pt 4pt;
  border: 0.5pt solid rgba(245, 158, 11, 0.5);
  border-radius: 2pt;
  white-space: nowrap;
}

.vbp-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 2px 8px;
  font-size: 12px;
  line-height: 1.4;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background: #fff;
  color: #111827;
  cursor: pointer;
}
.vbp-btn:hover { background: #f3f4f6; }
.vbp-btn-primary {
  background: #2563eb;
  border-color: #2563eb;
  color: #fff;
}
.vbp-btn-primary:hover { background: #1d4ed8; }

</style>

<style>
/* --- self-contained utility classes (no UnoCSS/Tailwind needed) --- */
.print-designer .flex { display: flex; }
.print-designer .flex-col { flex-direction: column; }
.print-designer .flex-row { flex-direction: row; }
.print-designer .flex-1 { flex: 1 1 0%; }
.print-designer .flex-wrap { flex-wrap: wrap; }
.print-designer .grid { display: grid; }
.print-designer .items-center { align-items: center; }
.print-designer .items-start { align-items: flex-start; }
.print-designer .justify-center { justify-content: center; }
.print-designer .text-center { text-align: center; }
.print-designer .fixed { position: fixed; }
.print-designer .absolute { position: absolute; }
.print-designer .inset-0 { inset: 0; }
.print-designer .left-0 { left: 0; }
.print-designer .right-0 { right: 0; }
.print-designer .z-50 { z-index: 50; }
.print-designer .overflow-auto { overflow: auto; }
.print-designer .overflow-hidden { overflow: hidden; }
.print-designer .h-87vh { height: 87vh; }
.print-designer .w-full { width: 100%; }
.print-designer .w-10 { width: 2.5rem; }
.print-designer .w-12 { width: 3rem; }
.print-designer .w-14 { width: 3.5rem; }
.print-designer .w-16 { width: 4rem; }
.print-designer .w-64 { width: 16rem; }
.print-designer .shrink-0 { flex-shrink: 0; }
.print-designer .col-span-1 { grid-column: span 1 / span 1; }
.print-designer .gap-0\.5 { gap: 0.125rem; }
.print-designer .gap-1 { gap: 0.25rem; }
.print-designer .gap-2 { gap: 0.5rem; }
.print-designer .gap-x-2 { column-gap: 0.5rem; }
.print-designer .gap-y-1 { row-gap: 0.25rem; }
.print-designer .p-1 { padding: 0.25rem; }
.print-designer .p-1\.5 { padding: 0.375rem; }
.print-designer .p-2 { padding: 0.5rem; }
.print-designer .p-4 { padding: 1rem; }
.print-designer .px-0\.5 { padding-left: 0.125rem; padding-right: 0.125rem; }
.print-designer .px-1 { padding-left: 0.25rem; padding-right: 0.25rem; }
.print-designer .px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
.print-designer .py-0\.5 { padding-top: 0.125rem; padding-bottom: 0.125rem; }
.print-designer .py-1 { padding-top: 0.25rem; padding-bottom: 0.25rem; }
.print-designer .mb-0\.5 { margin-bottom: 0.125rem; }
.print-designer .mb-1 { margin-bottom: 0.25rem; }
.print-designer .mb-2 { margin-bottom: 0.5rem; }
.print-designer .mt-0\.5 { margin-top: 0.125rem; }
.print-designer .mt-1 { margin-top: 0.25rem; }
.print-designer .mt-2 { margin-top: 0.5rem; }
.print-designer .mt-3 { margin-top: 0.75rem; }
.print-designer .ml-1 { margin-left: 0.25rem; }
.print-designer .mr-1 { margin-right: 0.25rem; }
.print-designer .mx-1 { margin-left: 0.25rem; margin-right: 0.25rem; }
.print-designer .rounded { border-radius: 0.25rem; }
.print-designer .border { border: 1px solid #d1d5db; }
.print-designer .border-r { border-right: 1px solid #d1d5db; }
.print-designer .border-collapse { border-collapse: collapse; }
.print-designer .border-transparent { border-color: transparent; }
.print-designer .border-gray-300 { border-color: #d1d5db; }
.print-designer .border-amber-200 { border-color: #fde68a; }
.print-designer .bg-white { background: #fff; }
.print-designer .bg-black { background: #000; }
.print-designer .bg-gray-50 { background: #f9fafb; }
.print-designer .bg-gray-100 { background: #f3f4f6; }
.print-designer .bg-gray-200 { background: #e5e7eb; }
.print-designer .bg-blue-50 { background: #eff6ff; }
.print-designer .bg-green-50 { background: #f0fdf4; }
.print-designer .bg-amber-50 { background: #fffbeb; }
.print-designer .bg-opacity-20 { background: rgba(0,0,0,0.2); }
.print-designer .shadow-sm { box-shadow: 0 1px 2px rgba(0,0,0,0.05); }
.print-designer .shadow-lg { box-shadow: 0 10px 15px rgba(0,0,0,0.1), 0 4px 6px rgba(0,0,0,0.05); }
.print-designer .text-xs { font-size: 0.75rem; line-height: 1rem; }
.print-designer .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
.print-designer .font-medium { font-weight: 500; }
.print-designer .font-bold { font-weight: 700; }
.print-designer .font-normal { font-weight: 400; }
.print-designer .font-mono { font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
.print-designer .italic { font-style: italic; }
.print-designer .text-gray-300 { color: #d1d5db; }
.print-designer .text-gray-400 { color: #9ca3af; }
.print-designer .text-gray-500 { color: #6b7280; }
.print-designer .text-gray-600 { color: #4b5563; }
.print-designer .text-gray-800 { color: #1f2937; }
.print-designer .text-blue-600 { color: #2563eb; }
.print-designer .text-red-500 { color: #ef4444; }
.print-designer .text-red-600 { color: #dc2626; }
.print-designer .text-amber-600 { color: #d97706; }
.print-designer .text-amber-800 { color: #92400e; }
.print-designer .text-amber-900 { color: #78350f; }
.print-designer .cursor-grab { cursor: grab; }
.print-designer .cursor-move { cursor: move; }
.print-designer .select-none { user-select: none; }
.print-designer .pointer-events-none { pointer-events: none; }
.print-designer .opacity-50 { opacity: 0.5; }
.print-designer .ring-2.ring-blue-500 { box-shadow: 0 0 0 2px #3b82f6; }
.print-designer .ring-2 { box-shadow: 0 0 0 2px #3b82f6; }
.print-designer .hover:border-blue-300:hover { border-color: #93c5fd; }
.print-designer .hover:border-blue-400:hover { border-color: #60a5fa; }

/* JSON 查看器弹窗 */
.vbp-modal-mask {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}
.vbp-modal {
  width: min(720px, 92vw);
  max-height: 82vh;
  background: #fff;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.25);
}
.vbp-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
}
.vbp-modal-body {
  flex: 1;
  min-height: 240px;
  margin: 0;
  border: 0;
  padding: 12px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 12px;
  line-height: 1.5;
  color: #1f2937;
  resize: none;
  outline: none;
}
</style>
