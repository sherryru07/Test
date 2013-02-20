sap.riv.module(
{
  qname : 'sap.viz.modules.legend.sizeLegendArea',
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
  var colorLegendArea = function(ctx){
    
    var width = 400, height = 200, valueLabelFont = {
      'fontfamily' : "'Open Sans', Arial, Helvetica, sans-serif",
      'fontsize' : '14px',
      'fontweight' : 'normal',
      'color' : '#333333'
    }, chartData=[0, 0, 0], scale, colors, shapes, guildeLineWidth = 10, valuePaddingLeft = 15, valueLabelHeight = 0, options;
    
    var effectManager  = null;
    
    var chart = function(selection){
      selection.each(function(){
        if(scale === undefined){
          return;
        }
        
        getThemeStyleDef();
        
        //Smart value label management.
        var visibleData = [], labelFont = "font-size:" + valueLabelFont.fontsize + "; font-weight:" + valueLabelFont.fontweight + "; font-family:" + valueLabelFont.fontfamily;
        if(valueLabelHeight === 0){
          valueLabelHeight = TextRuler.measure('M', labelFont).height;
        }
        var visibleCount = Math.round(height / valueLabelHeight);
        switch(visibleCount){
        case 0:
        case 1:
        case 2:
        case 3:
          visibleData.push(chartData[0]);
          break;
        case 4:
          visibleData.push(chartData[0]);
          if(chartData.length > 1){
            visibleData.push(chartData[chartData.length -1]);
          }
          break;
        default :
          visibleData = chartData;
        }
        
        var bubbleSizeArr = [], maxWidth = -1, dataWidth, value;
        for(var i = 0, len = visibleData.length; i < len; i++){
          bubbleSizeArr.push(scale(visibleData[i])/2);
          value = _isNullValue(visibleData[i]);
          if(TypeUtils.isExist(options.formatString)){
              value = FormatManager.format(value , options.formatString );
            }
          dataWidth = TextRuler.measure(value, labelFont).width;
          if(dataWidth > maxWidth){
            maxWidth = dataWidth;
          }
        }
        var maxBubbleSize = bubbleSizeArr[0];
        var wrap = d3.select(this);
        var textHeight = parseInt(valueLabelFont.fontsize, 10); //1em
        var circlesWrap = wrap.selectAll('g.legend-circles');
        if(circlesWrap.empty()){
          circlesWrap = wrap.append('g').attr('class', 'legend-circles').data([bubbleSizeArr]);
        }
        circlesWrap.attr('transform', 'translate(' + maxBubbleSize + ',' + (maxBubbleSize+textHeight)+ ')');
        
        var parameter = {
          drawingEffect : options.drawingEffect,
          graphType : 'circle',
          fillColor : '#748CB2'
        };
        var fillID = effectManager.register(parameter);
        var circleElements = circlesWrap.selectAll('circle').data(bubbleSizeArr, function(d, i){
          return d;
        });
        circleElements.exit().remove();
        circleElements.enter().append('circle').attr('stroke', 'white').attr('stroke-width', 1).attr('fill', fillID).attr('opacity', '0.85');
        circleElements.attr('r', function(d, i){ return d;})
          .attr('cx', function(d, i){
            return 0;
          }).attr('cy', function(d, i){
            return maxBubbleSize-d;
          });
        
        var labelsWrap = wrap.selectAll('g.legend-valueLabels');
        if(labelsWrap.empty()){
          labelsWrap = wrap.append('g').attr('class', 'legend-valueLabels').data([visibleData]);
        }
        var labelX = (maxBubbleSize*2+valuePaddingLeft+guildeLineWidth+maxWidth) > width ? width : (maxBubbleSize*2+valuePaddingLeft+guildeLineWidth+maxWidth);
        labelsWrap.attr('transform', 'translate('+ labelX +', '+(maxBubbleSize+textHeight*3/2)+')');
        var valueElements = labelsWrap.selectAll('text').data(visibleData, function(d, i){
          return d;
        });
        valueElements.exit().remove();
        valueElements.enter().append('text').attr('text-anchor', 'end');
        valueElements.attr('font-family', valueLabelFont.fontfamily).attr('font-size', valueLabelFont.fontsize)
          .attr('font-weight', valueLabelFont.fontweight).attr('fill', valueLabelFont.color).text(function(d, i){
            var value = _isNullValue(d);
            if(TypeUtils.isExist(options.formatString)){
              value = FormatManager.format(value , options.formatString );
            }
            return value;
          }).attr('dx', 0).attr('dy', function(d, i){
            var dy = (i-1)*maxBubbleSize - 2;
            if(visibleData.length === 2 && i === 1){
              dy = maxBubbleSize - 2;
            }
            return dy;
          });
        
        var guidelineWrap = wrap.selectAll('g.legend-guideLines');
        if(!guidelineWrap.empty()){
          //Empty
          guidelineWrap.remove();
        }
        guidelineWrap = wrap.append('g').attr('class', 'legend-guideLines').attr('transform', 'translate(' + maxBubbleSize + ',' + (maxBubbleSize+textHeight)+ ')');
        if(visibleData.length > 0){
          guidelineWrap.append('path').attr('stroke', 'gray').attr('d', 'M 0 '+ -maxBubbleSize +' L '+(maxBubbleSize+guildeLineWidth)+" "+ -maxBubbleSize);
        }
        if(visibleData.length > 1){
          guidelineWrap.append('path').attr('stroke', 'gray').attr('d', 'M 0 '+ maxBubbleSize +'L'+(maxBubbleSize+guildeLineWidth)+" "+ maxBubbleSize);
        }
        if(visibleData.length > 2){
          guidelineWrap.append('path').attr('stroke', 'gray').attr('d', 'M 0 '+ (maxBubbleSize - bubbleSizeArr[1]) +' L '+maxBubbleSize+" 0"+  ' M '+ maxBubbleSize + " 0 " + " L "+ (maxBubbleSize + guildeLineWidth) +" 0");
        }
      });
        
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
    
    chart.color = function(_) {
      if(!arguments.length){
        return colors;
      }
      return chart;
    };

    chart.shapes = function(_) {
      if(!arguments.length){
        return shapes;
      }
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
    
    chart.scale = function(_){
      if(!arguments.length){
        return scale;
      }
      scale = _;
      return chart;
    };
    
    chart.effectManager = function(_) {
      if(!arguments.length){
        return effectManager;
      }

      effectManager = _;
      return chart;
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
    
    chart.getPreferredSize = function(chartSize, layoutSpace, legendSpace, containerInfo, bubbleScale, bubbleSpace, hasHeightFeed){
      if(chartSize){
        getThemeStyleDef();
      }
      var maxWidth = 0, maxHeight = 0, minWidth = 0;
      if(scale && layoutSpace){
        valueLabelHeight = 0;
        
        var maxValueWidth = -1, maxBubbleSize, valueSize, value = null,
          data = chartData, labelFont = "font-size:" + valueLabelFont.fontsize + "; font-weight:" + valueLabelFont.fontweight + "; font-family:" + valueLabelFont.fontfamily;
        for(var i = 0, len = data.length; i < len; i++){
          value = _isNullValue(data[i]);
          if(TypeUtils.isExist(options.formatString)){
              value = FormatManager.format(value , options.formatString );
            }
          valueSize = TextRuler.measure(value, labelFont);
          if((valueSize === undefined) || (valueSize.width > maxValueWidth)) {
            maxValueWidth = valueSize.width;
          }
        }
        
        var space =  maxValueWidth + valuePaddingLeft + guildeLineWidth;
        maxBubbleSize = chartSize ? (chartSize.width - layoutSpace - legendSpace - space - containerInfo.space - containerInfo.number * bubbleSpace) / (1 + (1 / bubbleScale) * containerInfo.number) : scale(data[0]);
          valueLabelHeight = valueSize.height;
        

        if (!hasHeightFeed && containerInfo.plotHeight) {
          maxBubbleSize = Math.min((containerInfo.plotHeight - bubbleSpace) * bubbleScale, maxBubbleSize);
        }
        
        maxHeight = maxBubbleSize + valueSize.height * 2;
        maxWidth = maxBubbleSize + space;
        minWidth = maxWidth;
      }
      
      return {
        minHeight: maxHeight,
        minWidth: minWidth,
        height: maxHeight,
        width: maxWidth
      };
    };
    
    return chart;
  };
    
  var _isNullValue = function(value){
    return (value === null) ? langManager.get('IDS_ISNOVALUE') : value;
  };
  
  return colorLegendArea;
});