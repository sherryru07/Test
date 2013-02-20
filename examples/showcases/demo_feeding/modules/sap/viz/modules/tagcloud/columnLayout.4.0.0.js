sap.riv.module(
{
  qname : 'sap.viz.modules.tagcloud.columnLayout',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.util.TextUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.NumberUtils',
  version : '4.0.0'
}
],
function Setup(TextRuler, NumberUtils) {
  var columnLayout = function() {
    var width = 300, height = 300, chartData = [], font = '';

    var column = function() {

    };
    column.width = function(_) {
      if (!arguments.length) {
          return width;  
      }
        
      width = _;
      return column;
    };

    column.height = function(_) {
      if (!arguments.length) {
          return height;
      }
        
      height = _;
      return column;
    };

    column.data = function(_) {
      if (!arguments.length) {
          return chartData;  
      }
       
      chartData = _;
      return column;
    };

    column.font = function(_) {
      if (!arguments.length) {
          return font;  
      }
        
      font = _;
      return column;
    };

    column.layout = function() {
      _layout();
      return column;
    };

    var _layout = function() {
      var tagArr = chartData;
      var d, textSize;
      for ( var i = 0, len = tagArr.length; i < len; i++) {
        d = tagArr[i];
        textSize = TextRuler.fastMeasure(tagArr[i].word.val+'i', tagArr[i].fontSize+'px', 'normal', font);
        d.width = textSize.width;
        d.height = textSize.height;
      }

      var startX = 0, startY = 0;
      for ( var j = 0, jlen = tagArr.length; j < jlen; j++) {
        d = tagArr[j];
        if(NumberUtils.isNoValue(tagArr[j].fontSize)) {
          continue;
        }
        startY = startY + d.height;
        d.x = startX;
        d.y = startY;
        d.rotate = undefined;
      }
    };
    return column;
  };
  return columnLayout;
});