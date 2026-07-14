/** English locale bundle */
export const en: Record<string, string> = {
  // ---- Toolbar ----
  'toolbar.paper': 'Paper:',
  'toolbar.custom': 'Custom',
  'toolbar.width': 'W',
  'toolbar.height': 'H',
  'toolbar.confirm': 'OK',
  'toolbar.cancel': 'Cancel',
  'toolbar.portrait': 'Portrait',
  'toolbar.landscape': 'Landscape',
  'toolbar.margin': 'Margin:',
  'toolbar.marginTop': 'Top',
  'toolbar.marginBottom': 'Bottom',
  'toolbar.marginLeft': 'Left',
  'toolbar.marginRight': 'Right',
  'toolbar.rowsPerPage': 'Rows/page',
  'toolbar.rowsPerPageTitle': 'Fixed detail rows per page (original size, no scaling). Reduce row height or row count if overflow.',
  'toolbar.singleLe': 'Single≤',
  'toolbar.continuationLe': 'Cont≤',
  'toolbar.singleHint': 'Single page with header/footer approx {0} rows; continuation without header approx {1} rows',

  // ---- Left panel ----
  'panel.headerFields': 'Header Fields',
  'panel.detailColumns': 'Detail Columns',
  'panel.freeElements': 'Elements',
  'panel.hLine': 'Line',
  'panel.text': 'Text',
  'panel.barcode': 'Barcode',
  'panel.qrcode': 'QR Code',

  // ---- Canvas ----
  'canvas.detailData': 'Detail Data',
  'canvas.pageNum': 'Page {0} / {1}',
  'canvas.firstPageOnly': '1st Page',
  'canvas.everyPage': 'Every',
  'canvas.lastPageOnly': 'Last Page',

  // ---- Properties panel ----
  'props.title': 'Properties',
  'props.doubleClickDelete': '(double-click to delete)',
  'props.selectHint': 'Select an element on the canvas to edit',
  'props.docName': 'Doc Title',
  'props.name': 'Name',
  'props.fontSize': 'Font Size',

  // ---- Section editing ----
  'section.label': 'Section: {0}',
  'section.name': 'Name',
  'section.top': 'Top',
  'section.height': 'Height',
  'section.printMode': 'Print',
  'section.show': 'Show',
  'section.hide': 'Hide',

  // ---- Table ----
  'table.position': 'Table Position (pt)',
  'table.left': 'Left',
  'table.top': 'Top',
  'table.seqCol': 'Seq #',
  'table.colHeaderH': 'Header H',
  'table.rowH': 'Row H',
  'table.widthInfo': 'Table width {0}mm; printable {1}mm',
  'table.hint': 'Preview/Print positions table by its "Top" value, 1pt≈0.35mm',
  'table.titleGapWarn': 'Title may overlap table; suggest title font ≥{0}',
  'table.titleGapOk': 'Title spacing {0}pt (~{1}mm)',

  // ---- Header field ----
  'field.title': 'Title',
  'field.key': 'Field Key',
  'field.width': 'Width',
  'field.fontSize': 'Font Size',
  'field.left': 'Left',
  'field.top': 'Top',
  'field.section': 'Section',
  'field.sectionHeader': 'Header',
  'field.sectionFooter': 'Footer',
  'field.bold': 'Bold',
  'field.showLabel': 'Label',
  'field.align': 'Align',
  'field.alignLeft': 'Left',
  'field.alignCenter': 'Center',
  'field.alignRight': 'Right',
  'field.delete': 'Delete',

  // ---- Detail column ----
  'column.title': 'Title',
  'column.width': 'Width',
  'column.decimalPlaces': 'Decimals',
  'column.decimalHint': 'Set decimal places for numeric columns (e.g. price 2, qty 0)',
  'column.visible': 'Visible',
  'column.align': 'Align',
  'column.moveLeft': '↑ Left',
  'column.moveRight': '↓ Right',
  'column.delete': 'Delete',

  // ---- Free elements ----
  'free.barcode': 'Barcode',
  'free.qrcode': 'QR Code',
  'free.element': 'Element',
  'free.content': 'Content',
  'free.format': 'Format',
  'free.code128': 'CODE128 (general)',
  'free.code39': 'CODE39',
  'free.ean13': 'EAN13',
  'free.fontSize': 'Font',
  'free.bold': 'Bold',
  'free.align': 'Align',
  'free.section': 'Section',
  'free.contentHint': 'Content supports {fieldName} placeholders, replaced with header field values at print time',
  'free.delete': 'Delete',

  // ---- Template panels ----
  'tpl.panels': 'Sections',
  'tpl.hidden': '(hidden)',
  'tpl.edit': 'Edit',

  // ---- Summary ----
  'summary.title': 'Summary',
  'summary.none': 'None',
  'summary.sum': 'Total',
  'summary.count': 'Count',
  'summary.avg': 'Avg',
  'summary.selectColumn': '-- Select Column --',
  'summary.add': 'Add',

  // ---- Footer ----
  'footer.title': 'Footer',
  'footer.showPageNum': 'Page Numbers',
  'footer.text': 'Footer Text',
  'footer.textPlaceholder': 'Custom footer text',

  // ---- Defaults ----
  'default.docTitle': 'Purchase Request',
  'default.sectionHeader': 'Header',
  'default.sectionDetail': 'Details',
  'default.sectionFooter': 'Footer',

  // ---- Notifications ----
  'notify.saveSuccess': 'Template saved successfully',
  'notify.saveFailed': 'Save failed: {0}',
  'notify.loadSuccess': 'Template loaded successfully',
  'notify.loadFailed': 'Load failed: {0}',
  'notify.templateNotFound': 'Template not found',
  'notify.noData': 'No data',
  'notify.rowsWarn': 'Per-page limit {0} exceeds continuation capacity (≤{1}). Single page with header/footer ≈ {2} rows. Printing auto-paginates by page kind without scaling.',

  // ---- Renderer ----
  'render.pageNum': 'Page {0} / {1}',
  'render.total': 'Total',
  'render.noDetail': 'No data',
  'render.templateNotFound': 'Template not found: {0}',
  'render.printBlocked': 'Print window was blocked by the browser',

  // ---- Paper setting popup ----
  'paperSetting.title': 'Custom Paper (mm)',
};
