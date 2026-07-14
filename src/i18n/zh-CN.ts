/** 简体中文语言包 */
export const zhCN: Record<string, string> = {
  // ---- 工具栏 ----
  'toolbar.paper': '纸张：',
  'toolbar.custom': '自定义',
  'toolbar.width': '宽',
  'toolbar.height': '高',
  'toolbar.confirm': '确定',
  'toolbar.cancel': '取消',
  'toolbar.portrait': '纵向',
  'toolbar.landscape': '横向',
  'toolbar.margin': '边距：',
  'toolbar.marginTop': '上',
  'toolbar.marginBottom': '下',
  'toolbar.marginLeft': '左',
  'toolbar.marginRight': '右',
  'toolbar.rowsPerPage': '每页行数',
  'toolbar.rowsPerPageTitle': '固定每页明细行数（原尺寸分页，不缩放）。装不下请调小行高或减少行数',
  'toolbar.singleLe': '单页≤',
  'toolbar.continuationLe': '续页≤',
  'toolbar.singleHint': '单页含头尾约 {0} 行；续页无表头约 {1} 行',

  // ---- 左侧面板 ----
  'panel.headerFields': '表头字段',
  'panel.detailColumns': '明细列',
  'panel.freeElements': '辅助元素',
  'panel.hLine': '横线',
  'panel.text': '文本',
  'panel.barcode': '条码',
  'panel.qrcode': '二维码',

  // ---- 画布 ----
  'canvas.detailData': '明细数据',
  'canvas.pageNum': '第 {0} 页 / 共 {1} 页',
  'canvas.firstPageOnly': '仅首页',
  'canvas.everyPage': '每页',
  'canvas.lastPageOnly': '仅末页',

  // ---- 右侧属性面板 ----
  'props.title': '属性',
  'props.doubleClickDelete': '(双击删除)',
  'props.selectHint': '选中画布上的元素编辑属性',
  'props.docName': '单据名称',
  'props.name': '名称',
  'props.fontSize': '字号',

  // ---- 分区编辑 ----
  'section.label': '分区：{0}',
  'section.name': '名称',
  'section.top': '上',
  'section.height': '高度',
  'section.printMode': '打印',
  'section.show': '显示',
  'section.hide': '隐藏段落',

  // ---- 表格 ----
  'table.position': '表格位置 (pt)',
  'table.left': '左',
  'table.top': '上',
  'table.seqCol': '序号列',
  'table.colHeaderH': '列名高',
  'table.rowH': '行高',
  'table.widthInfo': '表宽 {0}mm；可打印 {1}mm',
  'table.hint': '预览/打印按「上」值定位明细表，1pt≈0.35mm',
  'table.titleGapWarn': '标题可能覆盖表格上方，建议标题字号≥{0}',
  'table.titleGapOk': '与标题间距 {0}pt（约 {1}mm）',

  // ---- 表头字段 ----
  'field.title': '标题',
  'field.key': '字段名',
  'field.width': '字段宽',
  'field.fontSize': '字号',
  'field.left': '左',
  'field.top': '上',
  'field.section': '分区',
  'field.sectionHeader': '上部分',
  'field.sectionFooter': '下部分',
  'field.bold': '加粗',
  'field.showLabel': '标签',
  'field.align': '对齐',
  'field.alignLeft': '左',
  'field.alignCenter': '中',
  'field.alignRight': '右',
  'field.delete': '删除',

  // ---- 明细列 ----
  'column.title': '标题',
  'column.width': '列宽',
  'column.decimalPlaces': '小数位',
  'column.decimalHint': '数值列可设小数位（如单价 2、数量 0）',
  'column.visible': '可见',
  'column.align': '对齐',
  'column.moveLeft': '↑ 左移',
  'column.moveRight': '↓ 右移',
  'column.delete': '删除',

  // ---- 自由元素 ----
  'free.barcode': '条码',
  'free.qrcode': '二维码',
  'free.element': '自由元素',
  'free.content': '内容',
  'free.format': '格式',
  'free.code128': 'CODE128（通用）',
  'free.code39': 'CODE39',
  'free.ean13': 'EAN13',
  'free.fontSize': '字体',
  'free.bold': '加粗',
  'free.align': '对齐',
  'free.section': '分区',
  'free.contentHint': '内容支持 {字段名} 占位符，打印时替换为表头字段值',
  'free.delete': '删除',

  // ---- 模板分区列表 ----
  'tpl.panels': '模板分区',
  'tpl.hidden': '(已隐藏)',
  'tpl.edit': '编辑',

  // ---- 汇总行 ----
  'summary.title': '汇总行',
  'summary.none': '无',
  'summary.sum': '合计',
  'summary.count': '计数',
  'summary.avg': '平均',
  'summary.selectColumn': '-- 选择列 --',
  'summary.add': '添加',

  // ---- 页脚 ----
  'footer.title': '页脚',
  'footer.showPageNum': '显示页码',
  'footer.text': '自定义页脚文本',
  'footer.textPlaceholder': '自定义页脚文本',

  // ---- 默认值 ----
  'default.docTitle': '采购申请单',
  'default.sectionHeader': '上部分',
  'default.sectionDetail': '单据体',
  'default.sectionFooter': '下部分',

  // ---- 通知 ----
  'notify.saveSuccess': '模板保存成功',
  'notify.saveFailed': '保存失败: {0}',
  'notify.loadSuccess': '模板加载成功',
  'notify.loadFailed': '加载失败: {0}',
  'notify.templateNotFound': '未找到模板',
  'notify.noData': '无数据',
  'notify.rowsWarn': '每页上限 {0} 超出续页容量（≤{1}）。单页含头尾约 {2} 行。打印按页类型自动分页，不会缩放。',

  // ---- 渲染引擎 ----
  'render.pageNum': '第 {0} 页 / 共 {1} 页',
  'render.total': '合计',
  'render.noDetail': '无明细',
  'render.templateNotFound': '未找到打印模板: {0}',
  'render.printBlocked': '打印窗口被浏览器拦截',

  // ---- Paper setting popup ----
  'paperSetting.title': '自定义纸张(mm)',
};
