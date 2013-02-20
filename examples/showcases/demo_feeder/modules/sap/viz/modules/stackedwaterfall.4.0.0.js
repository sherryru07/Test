sap.riv.module(
{
  qname : 'sap.viz.modules.stackedwaterfall',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.dispatch',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.MNDHandler',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.NumberUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Scaler',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.ColorSeriesGenerator',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.tooltipDataHandler',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.BoundUtil',
  version : '4.0.0'
}
],
function Setup(TypeUtils, dispatch, MNDHandler, langManager, NumberUtils, Scaler, ColorSeries, Objects, TooltipDataHandler, boundUtil) {
  var stackedwaterfall = function(manifest, ctx) {
    var options, width, height, originData, chartData, primaryAxisMinValue, primaryAxisMaxValue, categoryLen, measureLength, 
        tooltipVisible, decorativeShape, barInfo, isDataSchemaChanged = false, isDataLoading = true, isSizeChanged = false, isDatasetChanged = false,
        lastHovered = null, dimensionData, measureData, isShowTotal, isShowSubtotal,
        eDispatch = new dispatch('selectData', 'deselectData', 'showTooltip', 'hideTooltip', 'initialized', 'startToInit');
    var defaultString = langManager.get('IDS_ISNOVALUE'),
        colorPalette = ColorSeries.sap32().range(), 
        shapePalette = ['squareWithRadius'],
        totalIntervalTime = 1200, sWrapper;
    
    var effectManager = ctx.effectManager, drawingEffect = 'normal';
    
    var categoryScale = d3.scale.ordinal(), primaryScale = d3.scale.linear();

    var chart = function(selection) {
      boundUtil.drawBound(selection, width, height);
      
      if(!TypeUtils.isExist(primaryScale)){
        return;
      }
      selection.each(function(){
        //calculate information
        barInfo = _getBarInfo();
        var barSize = barInfo.barSize;
        //TODO start from zero. Do we support start from certain position? 
        var intialValue = 0;
        var interval = totalIntervalTime / categoryLen;
        
        sWrapper = d3.select(this);
        
        // append decorativeShape bar
        if (decorativeShape === undefined) {
          decorativeShape = sWrapper.append('rect').style('visibility', 'hidden').attr('fill', 'rgba(133,133,133, 0.2)');
        } else {
          decorativeShape.style('visibility', 'hidden');
        }
        //set decorative shape info.
        if(options.isHorizontal === false){
          decorativeShape.attr('width', categoryScale.rangeBand() - barInfo.barGap).attr('height', height);
        }else{
          decorativeShape.attr('height', categoryScale.rangeBand() - barInfo.barGap).attr('width', width);
        }
       
        if(isDataSchemaChanged === true){
          //Data structure changed. reset. 
          sWrapper.selectAll('g.waterfallgroup').remove();
          sWrapper.selectAll('g.datashapesgroup').remove();
        }
        //create stacked waterfall group
        var mainShapesWrapper = sWrapper.selectAll('g.datashapesgroup');
        if(mainShapesWrapper.empty()){
          mainShapesWrapper = sWrapper.append('g').attr('class', 'datashapesgroup');
        }
        var wrap = mainShapesWrapper.selectAll('g.waterfallgroup').data(chartData);
        wrap.enter().append('g').attr('class', 'waterfallgroup');
        wrap.exit().remove();
        
        var hasAnmation = true;
        if(isDataLoading){
          hasAnmation = options.animation.dataLoading;
        }else if(isDatasetChanged){
          hasAnmation = options.animation.dataUpdating;
        }else if(isSizeChanged){
          hasAnmation = options.animation.resizing;
        }
        
        wrap.each(function(dw, m){
          var categoryPos =  categoryScale(m) + barInfo.barGap;
          //each bar group
          var dataShape = d3.select(this).selectAll('g.datashape').data(function(){return dw.items;});
          var dataShapeEnter = dataShape.enter().append('g').attr('class','datashape');
          dataShapeEnter.append('rect').attr('class', 'datapoint').attr('fill-opacity', 1);
          
          if(!hasAnmation){
            //************No animation**************
            dataShape.exit().remove();
            
            dataShape.each(function(d, j){
              //each rect item
              var shapeWrap = d3.select(this);
              var rectElement = shapeWrap.selectAll('rect');
              if(options.isHorizontal === false){
                shapeWrap.attr('transform', function(){
                  var y=(d.val > 0) ? primaryScale(intialValue + d.after) : primaryScale(intialValue + d.before);
                  return 'translate('+categoryPos+','+y+')';
                });
                
                rectElement.attr('fill',function(){
                      var parameters = {
                      drawingEffect : drawingEffect,
                      fillColor : colorPalette[j % colorPalette.length],
                      direction : 'horizontal'
                    };
                    return effectManager.register(parameters);
                  })
                  .attr('width', barSize)
                  .attr('height', function(){
                    return Math.abs(primaryScale(d.after)-primaryScale(d.before));
                  });
              }else{
                shapeWrap.attr('transform', function(){
                  var x= (d.val > 0) ? primaryScale(intialValue + d.before) : primaryScale(intialValue + d.after);
                  return 'translate('+x+','+categoryPos+')';
                });
                
                rectElement.attr('fill',function(){
                      var parameters = {
                      drawingEffect : drawingEffect,
                      fillColor : colorPalette[j % colorPalette.length],
                      direction : 'vertical'
                    };
                    return effectManager.register(parameters);
                  })
                  .attr('height', barSize)
                  .attr('width', function(){
                    return Math.abs(primaryScale(d.after)-primaryScale(d.before));
                  });
              }
            });
            eDispatch.initialized();
          }else{
            //************with animation**************
            //Set enter data shape info
            if(options.isHorizontal === false){
              dataShapeEnter.selectAll('rect').attr('height', 0);
              dataShapeEnter.attr('transform', function(d){
                var y = primaryScale(intialValue + d.before); 
                return 'translate('+categoryPos+','+y+')';
              });
            }else{
              dataShapeEnter.selectAll('rect').attr('width', 0);
              dataShapeEnter.attr('transform', function(d){
                var x = primaryScale(intialValue + d.before);
                return 'translate('+x+','+categoryPos+')';
              });
            }
            //remove data shape
            dataShape.exit()
              .transition()
              .duration(interval)
              .attr('height', 0)
              .attr('width', 0)
              .remove();
            
            dataShape.each(function(d, j){
              //each rect item
              var rectElement = d3.select(this).selectAll('rect');
              if(options.isHorizontal === false){
                d3.select(this).transition()
                  .duration(interval)
                  .delay(function(){
                    return m*interval;
                  })
                  .attr('transform', function(){
                    var y = (d.val > 0) ? primaryScale(intialValue + d.after) : primaryScale(intialValue + d.before);
                    return 'translate('+categoryPos+','+y+')';
                  });
                
                rectElement.attr('fill',function(){
                  var parameters = {
                      drawingEffect : drawingEffect,
                      fillColor : colorPalette[j % colorPalette.length],
                      direction : 'horizontal'
                    };
                    return effectManager.register(parameters);
                  })
                  .attr('width', barSize)
                  .transition()
                    .duration(interval)
                    .delay(function(){
                      return m*interval;
                    })
                    .attr('height', function(){
                      return Math.abs(primaryScale(d.after)-primaryScale(d.before));
                    })
                    .each('end', function(){
                      if(m === categoryLen -1 && j === dw.items.length - 1){
                        eDispatch.initialized();
                      }
                    });
              }else{
                d3.select(this).transition()
                  .duration(interval)
                  .delay(function(){
                    return m*interval;
                  })
                  .attr('transform', function(){
                    var x = (d.val > 0) ? primaryScale(intialValue + d.before) : primaryScale(intialValue + d.after);
                    return 'translate('+x+','+categoryPos+')';
                  });
                rectElement.attr('fill',function(){
                  var parameters = {
                      drawingEffect : drawingEffect,
                      fillColor : colorPalette[j % colorPalette.length],
                      direction : 'vertical'
                    };
                    return effectManager.register(parameters);
                  })
                  .attr('height', barSize)
                  .transition()
                    .duration(interval)
                    .delay(function(){
                      return m*interval;
                    })
                    .attr('width', function(){
                      return Math.abs(primaryScale(d.after)-primaryScale(d.before));
                    })
                    .each('end', function(){
                      if(m === categoryLen -1 && j === dw.items.length - 1){
                        eDispatch.initialized();
                      }
                  });
              }
            });
          }
        });
        //reset flags
        isDataLoading = false;
        isSizeChanged = false;
        isDatasetChanged = false;
      });
    };
    chart.afterUIComponentAppear = function(){
      eDispatch.initialized(); 
    };
    
    chart.hoverOnPoint = function(point) {
      var xOnModule = point.x, yOnModule = point.y;
      var posModule;
      if(options.isHorizontal === false){
        //vertical stacked waterfall bar chart
        posModule = xOnModule;
      }else{
        //horizontal stacked waterfall bar chart
        posModule = yOnModule;
      }
      // find the closet dimension
      var i = -1;
      var groupCount = chartData.length;
      while (i < groupCount) {
        if (Math.abs(posModule - categoryScale.rangeBand() * i - 0.5 * categoryScale.rangeBand()) <= 0.5 * categoryScale.rangeBand()) {
          break;
        }
        i++;
      }

      if (i > (groupCount - 1) || i < 0) {
        decorativeShape.style('visibility', 'hidden');
        return;
      }
      if(options.isHorizontal === false){
        decorativeShape.attr('x', categoryScale.rangeBand() * i + barInfo.barGap / 2);
      }else{
        decorativeShape.attr('y', categoryScale.rangeBand() * i + barInfo.barGap / 2 );
      }
      decorativeShape.style('visibility', 'visible');
      
      if (lastHovered !== i) {
        if (tooltipVisible) {
          lastHovered = i;
          // this.parentNode point to plot graphic. it is different from bar
          // chart as in bar chart it should get the yoffset which can get it
          // from mian graphic element
          var transform = sWrapper.node().getTransformToElement(sWrapper.node().ownerSVGElement);
          var tData = _getTooltipData(i);
          if (options.isHorizontal === false) {
            // vertical stacked waterfall bar chart
            tData.point = {
              x : categoryScale.rangeBand() * i + 0.5 * categoryScale.rangeBand() + transform.e,
              y : d3.event.layerY
            };
          } else {
            // horizontal stacked waterfall bar chart
            tData.point = {
              x : d3.event.layerY,
              y : categoryScale.rangeBand() * i + 0.5 * categoryScale.rangeBand() + transform.f
            };
          }
          
          eDispatch.showTooltip(TooltipDataHandler.formatTooltipData(tData));
        }
      }

    };

    chart.blurOut = function() {
      decorativeShape.style('visibility', 'hidden');
      lastHovered = null;
      if (tooltipVisible) {
        eDispatch.hideTooltip();
      }
    };
  
    chart.highlight = function(elems) {
      if (elems instanceof Array) {
        for ( var i = 0, len = elems.length; i < len; i++) {
          elems[i].setAttribute('fill-opacity', 1);
        }
      } else {
        elems.setAttribute('fill-opacity', 1);
      }
    };

    chart.unhighlight = function(elems) {
      if (elems instanceof Array) {
        for ( var i = 0, len = elems.length; i < len; i++) {
          elems[i].setAttribute('fill-opacity', 0.2);
        }
      } else {
        elems.setAttribute('fill-opacity', 0.2);
      }
    };

    chart.clear = function(gray) {
      if (gray === undefined) {
        sWrapper.selectAll('.datapoint').attr('fill-opacity', 1);
      } else {
        sWrapper.selectAll('.datapoint').attr('fill-opacity', 0.2);
      }
    };

    chart.parent = function() {
      return sWrapper;
    };
    
    chart.data = function(_) {
      if (!arguments.length) {
        return originData;
      }
      originData = _;
      _parseOriginData(_);
      
      if(TypeUtils.isExist(width) && TypeUtils.isExist(height)){
        _makeScale();
      }
      return chart;
    };

    chart.properties = function(props) {
      if (!arguments.length) {
        return options;
      }
      
      Objects.extend(true, options, props);
      colorPalette = options.colorPalette;
      drawingEffect = options.drawingEffect;
      tooltipVisible = options.tooltip.enabled;
      
      if(isShowTotal !== options.isShowTotal || isShowSubtotal !== options.subtotal.visible){
        //isShowTotal is changed, update dataset.
        isShowTotal = options.isShowTotal;
        isShowSubtotal = options.subtotal.visible;
        _parseOriginData(originData);
      }
      return chart;
    };

    chart.width = function(_) {
      if (!arguments.length) {
        return width;
      }
      isSizeChanged = (!isSizeChanged && (_ === width)) ? false : true;
      width = _;
      _makeScale();
      return chart;
    };

    chart.height = function(_) {
      if (!arguments.length) {
        return height;
      }
      isSizeChanged = (!isSizeChanged && (_ === height)) ? false : true;
      height = _;
      _makeScale();
      return chart;
    };

    chart.primaryAxisTitle = function(_) {
      if(!arguments.length){
        var titles =  originData.getMeasureValuesGroupDataByIdx(0), title = [];
        if(titles){
          for(var i=0, len =titles.values.length; i< len;i++ ){
                if (titles.values[i].col !== null && titles.values[i].col !== undefined)
                {
                    title.push(titles.values[i].col);
                }
                else
                {
                    title.push(langManager.get('IDS_ISNOVALUE'));
                }
          }
        }
        return title.join('/');
      }
      return chart;
    };

    chart.secondAxisTitle = function(_) {
      if(!arguments.length){
        var titles =  originData.getMeasureValuesGroupDataByIdx(1), title = [];
        if(titles){
          for(var i=0, len =titles.values.length; i< len;i++ ){
                if (titles.values[i].col !== null && titles.values[i].col !== undefined)
                {
                    title.push(titles.values[i].col);
                }
                else
                {
                    title.push(langManager.get('IDS_ISNOVALUE'));
                }
          }
        }
        return title.join('/');
      }
      return chart;
    };

    chart.categoryScale = function(scale) {
      if (!arguments.length) {
        return categoryScale;
      }
      categoryScale = scale;
      return chart;
    };

    chart.primaryScale = function(scale) {
      if (!arguments.length) {
        return primaryScale;
      }
      primaryScale = scale;
      return chart;
    };
    
    chart.colorPalette = function(_){
      if(!arguments.length){
        return colorPalette;
      }
      colorPalette = _;
      return this;
    };

    chart.dispatch = function(_) {
      if (!arguments.length){
        return eDispatch;
      }
      eDispatch = _;
      return chart;
    };

    chart.dataLabel = function(_) {
      return chart;
    };
    
    chart.dimensionData = function(_){
      if (!arguments.length) {
        return dimensionData;
      }
      dimensionData = _;
    };
    
    var _getBarInfo = function(){
      //Calculate bar size and bar gap.
      var defaultBarSize = 2 * (categoryScale.rangeBand()) / 3;
      var defaultBarGap = defaultBarSize / 2;
      var customizeBarGap = options.barGap;
      var barGap = defaultBarGap, barSize = defaultBarSize;
      
      if(customizeBarGap !== undefined){
        var customizeBarSize = categoryScale.rangeBand() - customizeBarGap;
        if(!(customizeBarGap < 5 || customizeBarSize < 0)){
          barSize = customizeBarSize;
          barGap = customizeBarGap;
        }
      }
      
      //bar gap = single side gap width
      return {
        'barSize': barSize,
        'barGap' : barGap/2
      };
    };
    
    var _getTooltipData = function(index) {
      var body = {
        'name' : null,
        'val' : []
      };
      var aa1 = originData.getAnalysisAxisDataByIdx(0);
      var aa2 = originData.getAnalysisAxisDataByIdx(1);
      body.name = originData.getMeasureValuesGroupDataByIdx(0).values[0].col;
      var item, itemRows = measureData.values[0].rows, colorRows;
      if(aa2 !== null){
        colorRows = aa2.values[0].rows;
      }
      for(var i = 0; i < itemRows.length; i++){
        if(itemRows[i][index] !== undefined){
          item = {
            'shape' : 'squareWithRadius',
            'color' : colorPalette[i % colorPalette.length],
            'value' : itemRows[i][index]
          };
          if(colorRows!==undefined){
            item.label = colorRows[i];
          }
          body.val.push(item);
        }
      }
      var footer = {
        'label' : aa1.values[0].col,
        'value' : aa1.values[0].rows[index]
      };
      var tooltipData = {
        'body' : [],
        'footer' : []
      };
      tooltipData.body.push(body);
      tooltipData.footer.push(footer);
      return tooltipData;
    };
      
    var _makeScale = function(){
      var domain = [];
      for (var i=0; i < categoryLen; i++){
           domain.push(i);
      }
      //when all data is 0 or null, we make primaryScale.domain from 0 to 1
      if(options.isHorizontal === true){
        categoryScale.domain(domain).rangeBands([0, height]);
        if( primaryAxisMinValue === 0 && primaryAxisMaxValue === 0){
          primaryScale.domain([0, 1]).range([0, width]).nice();
        }else{
          primaryScale.domain([primaryAxisMinValue, primaryAxisMaxValue]).range([0, width]).nice();
        }
      }else{
        categoryScale.domain(domain).rangeBands([0, width]);
        if( primaryAxisMinValue === 0 && primaryAxisMaxValue === 0){
          primaryScale.domain([0, 1]).range([height, 0]).nice();
        }else{
          primaryScale.domain([primaryAxisMinValue, primaryAxisMaxValue]).range([height, 0]).nice();
        }
        
      }
      Scaler.perfect(primaryScale);
    };
    
    var _parseOriginData = function(data){
      //set dimension data for category axis
      dimensionData = {};
      measureData = {};
      dimensionData = data.getAnalysisAxisDataByIdx(0);
      $.extend(true, measureData, data.getMeasureValuesGroupDataByIdx(0));
      
      var obj = MNDHandler(data);
      var mgData = obj["MG1"], start = 0;  //default start position is 0
      isDataSchemaChanged = false;
      
      //Check update type: update dataset, data schema or data loading
      if(categoryLen===undefined && measureLength===undefined){
        //Data loading
        isDataLoading = true;
      }else{
        isDatasetChanged = true;
      }
      //Check new dataset structure. 
      if((categoryLen!==undefined && measureLength!==undefined) && (categoryLen !== mgData[0].length || measureLength !== mgData.length)){
        isDataSchemaChanged = true;
      }
      
      var positive_start, negative_start, totalValue = 0, eachValueItem = {}, items = [], itemValue, before, after, sum = 0; //total is for each bar group, sum means total value of all value 
      positive_start = negative_start = start;
      chartData = [], primaryAxisMinValue = 0, primaryAxisMaxValue = 0;
      
      categoryLen = mgData[0].length;
      measureLength = mgData.length;
      
      //check sub-group and add sub-total value
      var subIndex, tmpCategoryLen, subGroups;
      if(options.subtotal.visible === true){
        subIndex = 0;
        tmpCategoryLen = categoryLen;
        subGroups = options.subtotal.subGroups;
      }
      
      for ( var i = 0; i < categoryLen; i++) {
        //positive and negative start from the same position.
        positive_start = negative_start = start;
        //reset
        items = [], totalValue = 0;

        for ( var j = 0; j < measureLength; j++) {
          //Handle each value
          itemValue = _handleNullValue(mgData[j][i].val);
          if(itemValue !== defaultString){
            
            //except Null value
            totalValue = totalValue + itemValue;
            
            //adjust before and after value
            if(itemValue > 0){
              before = positive_start;
              after = positive_start + itemValue;
              positive_start = after;
            } else {
              before = negative_start;
              after = negative_start + itemValue;
              negative_start = after;
            }
            
            //Set primaryAxisMinValue, primaryAxisMaxValue
            if(after > primaryAxisMaxValue){
              primaryAxisMaxValue = after;
            }
            if(after < primaryAxisMinValue){
              primaryAxisMinValue = after;
            }
            
            eachValueItem = {
                "val": mgData[j][i].val,
                "before": before,
                "after": after,
                "ctx": mgData[j][i].ctx
            };
            items.push(eachValueItem);
          }
        }
        chartData.push({
          "total": totalValue,
          "start": start,
          "items": items
        });
        
        //reset sum
        sum = sum + totalValue;
        
        if(options.subtotal.visible === true){
          //Add sub-total value
          if(i === subGroups[subIndex] - 1){
            //last category bar in this bar group. And add sub-total
            if(options.subtotal.isRuntimeTotal){
              _addTotalItemToChartData(i+subGroups[subIndex], subIndex, start, totalValue, "sub-total-"+subIndex);
            }else{
              _addTotalItemToChartData(i+subGroups[subIndex], subIndex, 0, sum, "sub-total-"+subIndex);
            }
            subIndex++;
            tmpCategoryLen++;
          }
        }
        //reset start position.
        start = start + totalValue;
      }
      
      if(tmpCategoryLen !== undefined){
        categoryLen = tmpCategoryLen;
      }
      
      if(isShowTotal){
        _addTotalItemToChartData(categoryLen, subIndex, 0, sum, "total");
        categoryLen++;
      }
      
    };

    var _addTotalItemToChartData = function(index, subIndex, start, sum, dimensionName){
      chartData.push({
        "total": sum,
        "start": start,
        "items": [{
          "val": sum,
          "before": start,
          "after": start + sum,
          "ctx": {
            "path" : {
              "mg" : sum,
              "mi" : 0
            }
          }
        }]
      });
      dimensionData.values[0].rows.splice(index, 0, {val: dimensionName});
      measureData.values[0].rows[0].splice(index, 0, {val:sum});
      for(var i = 1; i < measureData.values[0].rows.length; i++){
        measureData.values[0].rows[i].splice(index, 0, undefined);
      }
    };
    
    var _handleNullValue = function(value){
      return (value === null || value === undefined) ? defaultString : value;
    };
    
    options = manifest.props(null);
    return chart;
  };
  return stackedwaterfall;
});