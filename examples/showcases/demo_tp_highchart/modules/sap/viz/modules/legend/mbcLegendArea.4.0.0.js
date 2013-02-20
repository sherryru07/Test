sap.riv.module(
{
  qname : 'sap.viz.modules.legend.mbcLegendArea',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.util.TextUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.format.FormatManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
}
],
function Setup(TextRuler, langManager,FormatManager,TypeUtils) {
  var mbcLegendArea = function(ctx){
    
    var width = 400, height = 200, valueLabelFont = {
        'fontfamily' : "'Open Sans', Arial, Helvetica, sans-serif",
        'fontsize' : '12px',
        'fontweight' : 'normal',
        'color' : '#333333'
      }, chartData, colors = [], markerSize = {width: 18, height : 20}, valuePaddingLeft = 10, paddingBottom = 1,
        selectedItem = [], selectionMode = 'selectionMode', posInfo = {
        markerPaddingRight : 0.5,
        paddingTop : 1,
        maxValueSpace : 1.6,
        minValueSpace : 0.5,
        minMarkerHeight : 10,  //10pixel
        space : 0
      }, nullLabelIndex = -1, textHeight = 20, minimized = false, noValueString = langManager.get('IDS_ISNOVALUE'), options;
    var effectManager = null;
        
    var chart = function(selection){
      selection.each(function(){
        getThemeStyleDef();
        
        //Calculate marker size.
        _calMarkerSize();
        
        var labelsData = chartData, textElements, y = 0, visible = 'visible', j, jlen;
        var wrap = d3.select(this);
        
        var indicatedRectElement = wrap.selectAll('rect.indicatedRect');
        if(indicatedRectElement.empty()){
          indicatedRectElement = wrap.append('rect').attr('class', 'indicatedRect');
        }
        indicatedRectElement.attr('visibility', 'hidden')
          .attr('width', markerSize.width + 8).attr('height', markerSize.height+2);
        
        var gWrap = wrap.selectAll('g.row').data(labelsData, function(d, i){
          return d.val;
        });
        
        gWrap.exit().remove();
        var gEnterWrap = gWrap.enter().append('g').attr('class', 'row');
        gEnterWrap.append('rect').attr('class', function(d, i){
          return 'marker ID_' + i;
        });
        gEnterWrap.append('text');

        var rectElements = gWrap.selectAll('rect.marker').attr('width', markerSize.width).attr('height', markerSize.height);
        var parameter, fillID;
        for(j = 0, jlen = rectElements.length; j < jlen; j++){
          y = (markerSize.height + paddingBottom) * ((nullLabelIndex !== -1) ? (j-1) : j);
          if(labelsData[j].val === 'N/A'){
            y = (markerSize.height + paddingBottom)*(jlen > 1 ? jlen : 0);
          }
          rectElements[j][0].setAttribute('y', y);
          
          parameter = {
            drawingEffect : 'normal',
            fillColor : colors[labelsData.length - j - 1]
          };
          fillID = effectManager.register(parameter);
          rectElements[j][0].setAttribute('fill', fillID);
        }

        textElements = gWrap.selectAll('text').text(function(d, i){
          var txt = d.val;
          if(txt === 'N/A'){
            txt = noValueString;
          }
          if(TypeUtils.isExist(options.formatString)){
              txt = FormatManager.format(txt , options.formatString );
          }
          return txt;
        }).attr('x', markerSize.width + valuePaddingLeft);
        y = 0;
        for(j = 0, jlen = textElements.length; j < jlen; j++){
          y = markerSize.height*((nullLabelIndex !== -1) ? j : (j+1)) + textHeight/2;
          if(labelsData[j].val === 'N/A'){
            y = (markerSize.height + paddingBottom)*(jlen > 1 ? jlen : 0) + textHeight/2 + markerSize.height/2;
          }
          if(minimized && j !== jlen-1 && (labelsData[j].val !== 'N/A')){
            visible = 'hidden';
          }else {
            visible = 'visible';
          }
          
          textElements[j][0].setAttribute('y', y);
          textElements[j][0].setAttribute('visibility', visible);
        }
        
        
        if(labelsData.length > 1){
          //Add top text
          var topTextElements = wrap.selectAll('text.topText');
          if(topTextElements.empty()){
            topTextElements = wrap.append('text').attr('class', 'topText');
          }
          var topTextLabel;
          if(nullLabelIndex !== -1){
            topTextLabel = labelsData[1].ctx.ranges.endValue;
          }else{
            topTextLabel = labelsData[0].ctx.ranges.endValue;
          }
          if(TypeUtils.isExist(options.formatString)){
            topTextLabel = FormatManager.format(topTextLabel, options.formatString);
          }
          topTextElements.text(topTextLabel).attr('x', markerSize.width + valuePaddingLeft).attr('y', textHeight/2);
        }else if(labelsData.length === 1){
          textElements[0][0].setAttribute('y', textHeight/2 + markerSize.height/2);
        }
        
        wrap.attr('style', 'font-size: '+valueLabelFont.fontsize+'; font-family:'+valueLabelFont.fontfamily+'; font-weight:'+valueLabelFont.fontweight+'; fill: '+valueLabelFont.color+";");
        wrap.on('mouseover', hoverHandler).on('mouseout', blurHandler).on('mousedown', itemClicked).on('mouseup', blurHandler);
      });
    };
    
    var hoverHandler = function(){
      if(selectionMode === 'single' || selectionMode === 'none' || options.isHierarchy){
        return;
      }
      var item = d3.select(d3.event.target);
        var clickedItemClass = item.attr('class');
        
        if(!clickedItemClass || clickedItemClass.search('marker') === -1){
          return;
        }
        var x = item.attr('x'), y = item.attr('y');
        
      var indicatedItem = d3.selectAll('.indicatedRect');
      indicatedItem.attr('visibility', 'visible').attr('fill', '#cccccc').attr('x', x - 4).attr('y', y- 1);
    };
    
    var blurHandler = function(){
      if(selectionMode === 'single' || selectionMode === 'none' || options.isHierarchy){
        return;
      }
      var item = d3.select(d3.event.target);
        var clickedItemClass = item.attr('class');
        
        if(!clickedItemClass || clickedItemClass.search('marker') === -1){
          return;
        }
        
      var indicatedItem = d3.selectAll('.indicatedRect');
      indicatedItem.attr('visibility', 'hidden');
    };
    
    var itemClicked = function(){
      if(selectionMode === 'single' || selectionMode === 'none' || options.isHierarchy){
        return;
      }
      var item = d3.select(d3.event.target);
        var clickedItemClass = item.attr('class');
        
        if(!clickedItemClass || clickedItemClass.search('marker') === -1){
          return;
        }
        var x = item.attr('x'), y = item.attr('y');
        
      var indicatedItem = d3.selectAll('.indicatedRect');
      indicatedItem.attr('visibility', 'visible').attr('fill', '#808080').attr('x', x - 4).attr('y', y- 1);
    };
    
    chart.clickHandler = function(){
      if(selectionMode === 'single' || selectionMode === 'none' || options.isHierarchy){
        return;
      }
      
      if(d3.event.type === 'touchstart'){
        //VD effect
        itemClicked();
      }  
      
      var isSelected = false;
      
      if(_contains(selectedItem, d3.event.target)){
        //has been selected.
        isSelected = true;
      }else{
        //New selected item
        selectedItem.push(d3.event.target);
      }
      return isSelected;
    };
    
    chart.width = function(_) {
      if(!arguments.length){
        return width;
      }
      width = _;
      return chart;
    };

    
    chart.height = function(_) {
      if(!arguments.length){
        return height;
      }
      height = _;
      return chart;
    };
    
    chart.properties = function(properties) {
      if(!arguments.length){
        return options;
      }
      //TODO use extends...
      options = properties;
      return chart;
    };
    
    chart.data = function(_){
      if(!arguments.length){
        return chartData;
      }
      chartData = _;
      return chart;
    };
    
    chart.setSelectionMode = function(_){
      selectionMode = _;
    };
    
    chart.getPreferredSize = function() {
      var maxWidth = 0, maxHeight = 0, minHeight = 0, data = chartData;
      if(data){
        //reset N/A flag
        nullLabelIndex = -1;
        
        getThemeStyleDef();
        
        var maxValueWidth = -1, valueSize, labelFont = "font-size:" + valueLabelFont.fontsize + "; font-weight:" + valueLabelFont.fontweight + "; font-family:" + valueLabelFont.fontfamily;
        var len = data.length;
        for ( var i = 0; i < len; i++) {
          if(data[i].val === 'N/A'){
            valueSize = TextRuler.measure(noValueString, labelFont);
            nullLabelIndex = i;
          }else{
            var value = data[i].val;
            if(TypeUtils.isExist(options.formatString)){
                value = FormatManager.format(value , options.formatString );
              }
            valueSize = TextRuler.measure(value, labelFont);
            
          }
          if ((valueSize === undefined) || (valueSize.width > maxValueWidth)) {
            maxValueWidth = valueSize.width;
          }
        }
        
        textHeight = parseInt(valueLabelFont.fontsize, 10); //1em
        var h = (posInfo.maxValueSpace + 1) * textHeight;
        
        maxWidth = markerSize.width + posInfo.markerPaddingRight * textHeight + maxValueWidth;
        if(nullLabelIndex !== -1){
          maxHeight = (h + paddingBottom) * (len+1) + textHeight;
          minHeight = (posInfo.minMarkerHeight + paddingBottom) * (len+1) + textHeight;
        }else{
          maxHeight = (h + paddingBottom) * len + textHeight;
          minHeight = (posInfo.minMarkerHeight + paddingBottom) * len + textHeight;
        }
      }
      return {
        minHeight: minHeight,
        minWidth: maxWidth,
        width: maxWidth,
        height: maxHeight
      };
    };
    
    chart.color = function(_) {
      if(!arguments.length){
        return colors;
      }
      colors = _;  
      return chart;
    };
    
    chart.effectManager = function(_) {
      if(!arguments.length){
        return effectManager;
      }
      effectManager = _;

      return chart;
    };
    
    var _calMarkerSize = function(){
      var len = chartData.length, h = 0, space = 0;
      minimized = false;
      if(nullLabelIndex !== -1){
        space = (height - (len + 2) * textHeight)/(len+1);
      }else{
        space = (height - (len + 1) * textHeight)/len;
      }
      h = space + textHeight;
      
      var maxValueSpace = posInfo.maxValueSpace * textHeight;
      if(space > maxValueSpace){
        space = maxValueSpace;
        h = space + textHeight;
      }else {
        var minValueSpace = posInfo.minValueSpace * textHeight;
        if(space < minValueSpace){
          h = posInfo.minMarkerHeight;
          space = 0;
          minimized = true;
        }
      }
      posInfo.space = space;
      markerSize.height = h;
    };
    
    //Utility method.
    var _contains = function(a, obj){
      for (var i = 0; i < a.length; i++) {
            if (a[i] === obj) {
                return true;
            }
        }
        return false;
    };
    
    var getThemeStyleDef = function(){
      var valueLabelStyle = ctx.styleManager.query('viz-legend-valueLabel');
      if(valueLabelStyle){
        if(valueLabelStyle['fill']){
          valueLabelFont.color = valueLabelStyle['fill'];
        }
        if(valueLabelStyle['font-family']){
          valueLabelFont.fontfamily = valueLabelStyle['font-family'];
        }
        if(valueLabelStyle['font-size']){
          valueLabelFont.fontsize = valueLabelStyle['font-size'];
        }
        if(valueLabelStyle['font-weight']){
          valueLabelFont.fontweight = valueLabelStyle['font-weight'];
        }
      }
    };
    
    return chart;
  };
  return mbcLegendArea;
});