sap.riv.module(
{
  qname : 'sap.viz.modules.tagcloud.rowLayout',
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
  var rowLayout = function() {
    var width = 300, height = 300, chartData = [], font = '';

    var row = function() {

    };
    row.width = function(_) {
      if (!arguments.length){
        return width;
      }
      width = _;
      return row;
    };

    row.height = function(_) {
      if (!arguments.length){
        return height;
      }
      height = _;
      return row;
    };

    row.data = function(_) {
      if (!arguments.length){
        return chartData;
      }
      chartData = _;
      return row;
    };

    row.font = function(_) {
      if (!arguments.length){
        return font;
      }
      font = _;
      return row;
    };

    row.layout = function() {
      _layout();
      return row;
    };

    var _layout = function() {
      var tagArr = chartData;
      var d, textSize, i, len;
      for (i = 0, len = tagArr.length; i < len; i++) {
        d = tagArr[i];
        textSize = TextRuler.fastMeasure(tagArr[i].word.val+'i', tagArr[i].fontSize+'px', 'normal', font);
        d.width = textSize.width;
        d.height = textSize.height;
      }

      var startX = 0;
      var maxRowHeight = tagArr[0].height, startY = 0, newLineIndex = 0;
      for (i = 0, len = tagArr.length; i < len; i++) {
        d = tagArr[i];
        
        if(NumberUtils.isNoValue(tagArr[i].fontSize)){
          continue;
        }
        
        if (startX + d.width > width) {
          // New Row
          startX = 0;
          _adjustLastLineTagPosition(newLineIndex, i, startY + maxRowHeight);
          
          newLineIndex = i;
          startY = startY + maxRowHeight;
          maxRowHeight = tagArr[i].height;
        }
        if(d.height > maxRowHeight){
          maxRowHeight = d.height;
        }
        d.x = startX;
        d.y = startY;
        startX = startX + d.width;
        d.rotate = undefined;
      }
      _adjustLastLineTagPosition(newLineIndex, i, startY + maxRowHeight);
    };
    
    /*
     * Set last line tag position.
     */
    var _adjustLastLineTagPosition = function(startIndex, endIndex, newYPosition){
      var dArr;
      for(var j = startIndex; j < endIndex; j++){
        dArr = chartData[j];
        dArr.y = newYPosition;
      }
    };
    return row;
  };
  return rowLayout;
});