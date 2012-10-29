Aldu.extend({
  UI : {
    engine : null,
    processHtml : function(context) {
      Aldu.UI.Form.init(context);
      Aldu.UI.Table.init(context);
      Aldu.UI.Panel.init(context);
      Aldu.each(Aldu.UI._processCallbacks, function(i, callback) {
        callback.call(this, context);
      });
    },
    _processCallbacks : [],
    addProcessCallback : function(callback) {
      Aldu.UI._processCallbacks.push(callback);
    },
    init : function(context) {
      return Aldu.UI.processHtml(context);
    }
  }
});
