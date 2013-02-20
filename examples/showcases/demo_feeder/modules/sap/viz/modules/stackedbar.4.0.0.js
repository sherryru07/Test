sap.riv.module(
{
  qname : 'sap.viz.modules.stackedbar',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.dispatch',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.MNDHandler',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.tooltipDataHandler',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.ColorSeriesGenerator',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Scaler',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.Repository',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.NumberUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.BoundUtil',
  version : '4.0.0'
}
],
function Setup(TypeUtils, ObjectUtils, dispatch, MNDHandler,tooltipDataHandler, ColorSeries, Scaler, Repository, NumberUtils, Objects, langManager, boundUtil) {
  var bar = function(manifest, ctx) {
    var tooltipHandlerObj = null;
    var data, 
        data1 = [[]],
        data2 = [[]],
        seriesData = [], tooltipData = [], //in stacked chart the value in tooltip is the same with data in seriesData, but in percentage chart it use the absolute value of negative data.
        primaryAxisTopBoundary = 0,
        primaryAxisBottomBoundary = 0,
        primaryAxisManualRange = false,
        secondaryAxisManualRange = false,
        secondaryAxisTopBoundary = 0,
        secondaryAxisBottomBoundary = 0,
        gWrapper = null;
    
    var width, 
        height,
        id = Math.floor(Math.random() * 10000),
        x = 0, y = 0,
        isDualAxis = false,
        colorPalette = [],
        axis1ColorPalette,
        axis2ColorPalette,
        MNDInnerOnColor = false,
        measureOnAxis1 = 0,
        measureOnAxis2 = 0,
        shapePalette = ['squareWithRadius'],
        properties,
        eDispatch = new dispatch('selectData', 'deselectData', 'showTooltip', 'hideTooltip', 'initialized', 'startToInit');
      
    var effectManager = ctx.effectManager;
    
    var yScale = d3.scale.ordinal(),
        xScale = d3.scale.linear(),
        xScale2 = d3.scale.linear();
      
    var decorativeShape = null,
        lastSelected = [],
        evtData = [],
        lastHovered = null,
        isLasso = false;
      
    var barNumber = 1,
        barGroupNumber,
        barNumberinGroup,
        barHeight,
        positiveIndexes = [], 
        negativeIndexes = [];
      
    var enableDataLoadingAnimation = true,
        enableDataUpdatingAnimation = true,
        enableRoundCorner = false,
        clipEdge = true,
        hasMNDonCategoryAxis = false,
        isOnlyInitAnimation = false,
        afterAttachToDOM = false,
        tooltipVisible,
        totalIntervalTime = 1000;
    
    var defsEnter = null, 
        roundCornerDefs = null,
        suffix = Repository.newId();
    
    var mode = 'comparison'; // bar display mode
    
    var drawingEffect = 'normal';
    
    var sizeChange = false, dataStructureChange = false, dataValueChange = false;
    
      
    var parseOptions = function(){
        enableRoundCorner = properties.isRoundCorner;
        mode = properties.mode === 'percentage'? 'percentage': 'comparison';
        enableDataLoadingAnimation =  properties.animation.dataLoading; 
        enableDataUpdatingAnimation =  properties.animation.dataUpdating; 
        tooltipVisible = properties.tooltip.enabled;      
        if(isDualAxis && !hasMNDonCategoryAxis){
          axis1ColorPalette = properties.primaryValuesColorPalette;   
          axis2ColorPalette = properties.secondaryValuesColorPalette;
        }else{
          axis2ColorPalette = properties.colorPalette;
          axis1ColorPalette = properties.colorPalette;
        }

        drawingEffect = properties.drawingEffect;
        
        var indexforSecondaryAxis = data1.length;
            colorPalette = [];
        var i,j;
        if(MNDInnerOnColor){
          var flag = 0, flag2 = 0;
          for(i=0; i < seriesData[0][0].length; i++){
            colorPalette.push(axis1ColorPalette[i % axis1ColorPalette.length]);
            flag++;
            if(flag === measureOnAxis1 && isDualAxis && TypeUtils.isExist(seriesData[0][1])){
              flag2 = 0;
              for(j=0; j <=seriesData[0][1].length; j++){
                if(flag2 >= measureOnAxis2){
                  flag = 0;
                  break;
                }
              colorPalette.push(axis2ColorPalette[j % axis2ColorPalette.length]);  
              flag2++;
            }
          }
        }
      }else{
          for(i=0 ; i < seriesData[0].length; i++){
            for(j=0; j < seriesData[0][0].length; j++){
               colorPalette.push(axis1ColorPalette[j % axis1ColorPalette.length]);
            }
            if(isDualAxis && TypeUtils.isExist(seriesData[0][1])){
              for(j=0; j < seriesData[0][1].length; j++){
                colorPalette.push(axis2ColorPalette[j % axis2ColorPalette.length]);  
              }
            }
          }
        }                    
      };
      
      function chart(selection){
        boundUtil.drawBound(selection, width, height);
        
        //deal with percentage mode
        if(mode === 'percentage'){
          turnToPercentage();
        }
        
        tooltipHandlerObj = tooltipDataHandler();
        
        // [19-Oct-2012 Nick] if the size of plot area is too small, there is no value scale created and the whole drawing part is skipped.
        if(!TypeUtils.isExist(xScale) && !TypeUtils.isExist(xScale2)) {
          return;
        }
        eDispatch.startToInit();
        
        selection.each(function(){
          
        barNumber = (TypeUtils.isExist(data2)) ? 2 : 1;
        barHeight = 8 * (yScale.rangeBand()) / (9*barNumber +7 );
        
        barNumberinGroup = seriesData[0][0].length + ((TypeUtils.isExist(seriesData[0][1])) ? seriesData[0][1].length : 0);
        var barHeightInitial = 8 * (yScale.rangeBand()) / (9*barNumberinGroup +7 );
          
        var svg = (gWrapper = d3.select(this));
        //append decorativeShape
          if(decorativeShape === null){
            decorativeShape = svg.append('rect').attr('width', width).attr('height',
            yScale.rangeBand() - barHeight/2).attr('visibility', 'hidden').attr(
                'fill', 'rgba(133,133,133, 0.2)');
          }else{
            decorativeShape.attr('width', width).attr('height', yScale.rangeBand() - barHeight/2).attr('visibility', 'hidden');
          }
          
          if(defsEnter === null){
          defsEnter = svg.append('defs').append('clipPath').append('rect').attr('width', width).attr('height', height);    
        }else{
          defsEnter.attr('width', width).attr('height', height);
        }  
          
           if(roundCornerDefs === null){      
          roundCornerDefs = svg.append('defs').attr('id', 'round-corner-clip' + suffix);
        }else{
          if( dataStructureChange || sizeChange || dataValueChange  || !enableRoundCorner){
            roundCornerDefs.remove();
            roundCornerDefs = svg.append('defs').attr('id', 'round-corner-clip' + suffix);
          }
        }    
        
        var r = Math.log(barHeight)/Math.log(2);
        if( r < 0 ){
          enableRoundCorner = false;
        }
        var datashapesgroup = svg.selectAll('g.datashapesgroup');
        if(!TypeUtils.isExist(datashapesgroup[0][0])){
          datashapesgroup = svg.append('g').attr('class', 'datashapesgroup');
        }
        var barGroup;
            barGroup = datashapesgroup.selectAll('g.bar').data(seriesData);     
            barGroup.enter().append('g');
            barGroup.attr('class','bar').each( function (perGroupData,i) {
              var axisGroup = d3.select(this).selectAll('g.axisGroup').data(perGroupData);     
                axisGroup.enter().append('g');
                axisGroup.attr('class','axisGroup').each( function (perAxisData,j) {  
                  // This is for dual axis
                  var valueScale = (j === 0) ? xScale : xScale2;
                  var startPoint = (j === 0) ? barHeight /2 : (barHeight /2 + barHeight + barHeight/8);
                  var initStartPoint = (j === 0) ? yScale(i) : (yScale(i) + barHeight / 2 + barHeight) ;
                  var fillingColor =  (j === 0) ? axis1ColorPalette : axis2ColorPalette;
                  
                  // This is for pos/neg values.
                  var positiveX = 0, negativeX = 0,  positiveStackedValue =  0, negativeStackedValue = 0;
                  var yArray = [], xArray=[];
                  // wrap a datashape g for each rect
                  var barShape = d3.select(this).selectAll('g.datashape').data(perAxisData);
                      barShape.enter().append('g').attr('class','datashape').append('rect').attr('class', 'datapoint');
                      barShape.exit().remove();
                      
                      // [21-Nov-2012 Nick] Keep the original x-position for each g.datashape, it is used when data value changes.
                      if(afterAttachToDOM){
                        barShape.each(function(){
                          xArray.push(this.getTransformToElement(this.parentNode).e);
                        });
                      }
                      
                      // [20-Nov-2012 Nick] As g.datashape is considered as a 'shape' concept, all positioning behavior is applied to this element
                      barShape.attr('transform', function (perRectData, k) {
                        var y = yScale(i) + startPoint;
                        yArray.push(y);
                        
                        var x;
                        if(perRectData.val >= 0){
                          positiveX = valueScale(positiveStackedValue);
                          positiveStackedValue += perAxisData[k].val;
                                         x = positiveX;
                        }else{
                          negativeStackedValue += perAxisData[k].val;
                          x =  valueScale(negativeStackedValue);
                        }     
                          return 'translate('+x+','+y+')'
                      });
                      
                  var bar = barShape.select('rect.datapoint');
                      bar.attr('fill', function(d,colorIndex){  
                        d.fillColor = fillingColor[colorIndex % fillingColor.length];
                        var parameter = {
                          drawingEffect:drawingEffect,
                          fillColor : d.fillColor,
                          direction : 'vertical'
                        };
                        return effectManager.register(parameter);
                      }).attr('shape-rendering','crispEdges').attr('fill-opacity', 1);
                  
                  // [04 - Sep - 2012 Nick] DataStructureChange means the structure of data is changed. 
                  // It means the whole DOM nodes needed to be removed (handled by d3) and append new ones.
                  if(enableDataLoadingAnimation && !isOnlyInitAnimation){
                  if(dataStructureChange){
                    bar.attr('height',barHeightInitial)
                       .attr('y', function (perRectData, m) {
                           var y = initStartPoint - yArray[m] + barHeightInitial * m;
                           y = y + barHeightInitial/8 *(m) + barHeightInitial /2;
                           return y;
                       }).attr('x', function(perRectData){
                         if(perRectData.val  > 0){
                           return 0;
                         }else{
                           return valueScale(0) - valueScale(perRectData.val);
                         }
                       }).attr('width', 0);

                    // [04 - Sep - 2012 Nick] Round corner enabled. Do the same transition as the bars do.
                    if(enableRoundCorner){
                      bar.attr('clip-path', function(perRectData, indexinGroup){
                        if(indexinGroup === negativeIndexes[j][i] || indexinGroup === positiveIndexes[j][i]){
                            var id = 'roundCorner-clip' + '-' + indexinGroup + i + j + suffix;
                            var roundCorner = roundCornerDefs.append('clipPath').attr('id', id)
                                      .append('rect').attr('class', 'roundCorner-clip')
                                      .attr('rx', r).attr('ry', r).attr('y',  this.y.baseVal.value)
                                      .attr('height',barHeightInitial).attr('width', 0)
                                      .attr('x', this.x.baseVal.value)
                                      .transition().duration(totalIntervalTime/2)
                                      .attr('x',function(){
                                        if(indexinGroup ===  negativeIndexes[j][i] ){
                                          return 0;
                                        }else{
                                          return 0 - r;
                                        }
                                      })
                                      .attr('width', function(){
                                         return Math.abs(valueScale(perRectData.val) - valueScale(0)) + r;
                                      })
                                      .transition().delay(totalIntervalTime/2).duration(totalIntervalTime/2)
                                      .attr('height',barHeight).attr('y', 0);
                          return 'url(#' + id + ')' ;
                        }
                         
                      });
                    }
                    negativeStackedValue = 0;
                    bar.transition().duration(totalIntervalTime/2)
                       .attr('width', function(perRectData){
                         return Math.abs(valueScale(perRectData.val) - valueScale(0));
                       })
                       .attr('x', 0);
                    
                    bar.transition().delay(totalIntervalTime/2).duration(totalIntervalTime/2)
                       .attr('height',barHeight)
                       .attr('y', 0)
                       .each('end', function(d, m){
                        //As in large data with animation, transition code will be washed away, we should reset the width of rect in the animation end.
                           this.setAttribute('width', Math.abs(valueScale(d.val) - valueScale(0)) );
                         // Fire out event to tell the animation is done.
                         if(m === seriesData[0][0].length - 1 && i === 0){
                           completeAnimation();
                         }
                       });
                  }
                  else if(sizeChange){
                    bar.attr('x',function(d,k){
                          return xArray[k] - this.parentNode.getTransformToElement(this.parentNode.parentNode).e;
                       })
                       .attr('width', function(perRectData){
                         var newWidth = Math.abs(valueScale(perRectData.val) - valueScale(0));
                         if(parseFloat(this.width.baseVal.value) > newWidth){
                           return this.width.baseVal.value;
                         }else{
                           return newWidth;
                         }
                     });
                    var sizeTransition = bar.transition();
                    sizeTransition.duration(totalIntervalTime/2)
                       .attr('width', function(perRectData){
                         return Math.abs(valueScale(perRectData.val) - valueScale(0));
                       })
                       .attr('x',0)
                       .attr('height',barHeight)
                       .each('end', function(d, m){
                        this.setAttribute('width', Math.abs(valueScale(d.val) - valueScale(0)));
                         // Fire out event to tell the animation is done.
                         if(m === seriesData[0][0].length - 1 && i === 0){
                           completeAnimation();
                         }
                       });
                    
                      if(enableRoundCorner){
                        sizeTransition.attr('clip-path', function(perRectData, indexinGroup){
                          if(indexinGroup === negativeIndexes[j][i] || indexinGroup === positiveIndexes[j][i]){
                            var id = 'roundCorner-clip' + '-' + indexinGroup + i + j + suffix;
                            var x = parseFloat(this.x.baseVal.value) ;
                            var roundCorner = roundCornerDefs.append('clipPath').attr('id', id)
                                        .append('rect').attr('class', 'roundCorner-clip')
                                        .attr('rx', r).attr('ry', r).attr('y',  this.y.baseVal.value)
                                        .attr('height',this.height.baseVal.value).attr('width', this.width.baseVal.value + r)
                                        .attr('x', function(){
                                          return x - ((indexinGroup === negativeIndexes[j][i]) ? 0 : r);
                                        })
                                        .transition().duration(totalIntervalTime/2)
                                        .attr('x',function(){
                                          if(indexinGroup === negativeIndexes[j][i]){
                                            return 0;
                                          }else{
                                            return 0 - r;
                                          }
                                        })
                                        .attr('width', function(){
                                           return Math.abs(valueScale(perRectData.val) - valueScale(0)) + r;
                                        })
                                        .attr('height',barHeight).attr('y', 0);
                            return 'url(#' + id + ')' ;
                          }
                           
                        });
                      }
                  }
                  // [04 - Sep - 2012 Nick] Data has the same structure, but the value changed.
                  // TO BE TESTED ! WE DO NOT HAVE THIS WORK FLOW NOW.  
                  else if(dataValueChange){
                    bar.attr('x',function(d,k){
                        return xArray[k] - this.parentNode.getTransformToElement(this.parentNode.parentNode).e;
                    });
                    var stateChange = bar.transition();
                      stateChange.duration(totalIntervalTime/2)
                        .attr('width', function(perRectData){
                          return Math.abs(valueScale(perRectData.val) - valueScale(0));
                        })
                        .attr('x', 0)
                        .each('end', function(d, m){
                          this.setAttribute('width', Math.abs(valueScale(d.val) - valueScale(0)));
                          // Fire out event to tell the animation is done.
                          if(m === seriesData[0][0].length - 1 && i === 0){
                            completeAnimation();
                          }
                        });
                        if(enableRoundCorner){
                          stateChange.attr('clip-path', function(perRectData, indexinGroup){
                            if(indexinGroup === negativeIndexes[j][i] || indexinGroup === positiveIndexes[j][i]){
                              var id = 'roundCorner-clip' + '-' + indexinGroup + i + j + suffix;
                              var x = parseFloat(this.x.baseVal.value) ;
                              var roundCorner = roundCornerDefs.append('clipPath').attr('id', id)
                                        .append('rect').attr('class', 'roundCorner-clip')
                                        .attr('rx', r).attr('ry', r).attr('y',  this.y.baseVal.value)
                                        .attr('height',barHeight).attr('width', this.width.baseVal.value + r)
                                        .attr('x', function(){
                                          return x - ((indexinGroup === negativeIndexes[j][i]) ? 0 : r);
                                        })
                                        .transition().duration(totalIntervalTime/2)
                                        .attr('x',function(){
                                          if(indexinGroup === negativeIndexes[j][i]){
                                            return 0;
                                          }else{
                                            return 0 - r;
                                          }
                                        })
                                        .attr('width', function(){
                                           return Math.abs(valueScale(perRectData.val) - valueScale(0)) + r;
                                        });  
                              return 'url(#' + id + ')' ;
                            }
                          });
                      }
                  }
                  else if (enableRoundCorner){
                    bar.attr('clip-path', function(perRectData, indexinGroup){
                      if(indexinGroup === negativeIndexes[j][i] || indexinGroup === positiveIndexes[j][i]){
                        var id = 'roundCorner-clip' + '-' + indexinGroup + i + j + suffix;
                        var roundCorner = roundCornerDefs.append('clipPath').attr('id', id)
                                    .append('rect').attr('class', 'roundCorner-clip')
                                    .attr('rx', r).attr('ry', r).attr('y',  this.y.baseVal.value)
                                    .attr('height',barHeight).attr('width', function(){
                                                                  return  Math.abs(valueScale(perRectData.val) - valueScale(0) ) + r;
                                                              });
                        if(indexinGroup === negativeIndexes[j][i]){
                          roundCorner.attr('x',0);
                        }else{
                          roundCorner.attr('x',0 - r);  
                        }
            
                        return 'url(#' + id + ')' ;
                      }
                       
                    });
                  }

                //  bar.exit().remove();  
                }else{
                  bar.attr('y',0).attr('x', 0) 
                     .attr('width',function(perRectData,k){
                           var width = Math.abs(valueScale(perRectData.val) -  valueScale(0));
                           return width;                   
                     })
                     .attr('height',barHeight);
                  
                  if(enableRoundCorner){
                    bar.attr('clip-path', function(perRectData, indexinGroup){
                      if(indexinGroup === negativeIndexes[j][i] || indexinGroup === positiveIndexes[j][i]){
                        var id = 'roundCorner-clip' + '-' + indexinGroup + i + j + suffix;
                        var roundCorner = roundCornerDefs.append('clipPath').attr('id', id)
                                    .append('rect').attr('class', 'roundCorner-clip')
                                    .attr('rx', r).attr('ry', r).attr('y',  this.y.baseVal.value)
                                    .attr('height',barHeight).attr('width', function(){
                                                                  return  Math.abs(valueScale(perRectData.val) - valueScale(0) ) + r;
                                                              });
                        if(indexinGroup === negativeIndexes[j][i]){
                          roundCorner.attr('x',0);
                        }else{
                          roundCorner.attr('x',0 - r);  
                        }
            
                        return 'url(#' + id + ')' ;
                      }
                       
                    });
                  }
                }
              });
              axisGroup.exit().remove();
          });
          barGroup.exit().remove();
          if(!enableDataUpdatingAnimation){
            isOnlyInitAnimation = true;
          }
         
        
        sizeChange = false, dataValueChange = false, dataStructureChange = false;
        });
        
        if(!enableDataLoadingAnimation){
          completeAnimation();
        }
        
        return chart;
      }
     
      chart.hoverOnPoint = function(point){
        var xOnModule = point.x, yOnModule = point.y;
      // find the closet dimension
      var i = -1;
      while (i < seriesData.length) {
        if (Math.abs(yOnModule - yScale.rangeBand()*i - 0.5 * yScale.rangeBand() ) <= 0.5 * yScale.rangeBand()) {
          break;
        }
        i++;
      }

      if (i > (seriesData.length - 1) || i < 0) {
        decorativeShape.attr(
            'visibility', 'hidden');
        return;
      }

      decorativeShape.attr(
          'y',
          yScale.rangeBand() * i + barHeight/4).attr(
          'visibility', 'visible');

      if(i !== lastHovered){
        if (tooltipVisible) {
          lastHovered = i;
          //this.parentNode.parentNode.parentNode point to the main container
          var transform = gWrapper[0][0].getTransformToElement(gWrapper[0][0].ownerSVGElement);
          var yoffset = transform.f;
          var sumAxis1 = 1, sumAxis2 = 1 , m = 0;
          var tData = tooltipHandlerObj.generateTooltipData(data, tooltipData, barGroupNumber-1-i, colorPalette, shapePalette);
          
          tData.point = {
              x: d3.event.layerX,
              y: yScale.rangeBand()*i + 0.5 * yScale.rangeBand() + yoffset
          };
          tData.plotArea = {
            x : transform.e,
            y : transform.f,
            width : width,
            height : height
          };
          tData.valueAxis0Count = seriesData[0][0].length;
          tData.valueAxis1Count = TypeUtils.isExist(seriesData[0][1]) ? seriesData[0][1].length:0;
          eDispatch.showTooltip(tooltipDataHandler.formatTooltipData(tData));
        }
      }
      };
      
      chart.blurOut = function(){
        decorativeShape.attr('visibility', 'hidden');
        lastHovered = null;
      if (tooltipVisible) {      
        eDispatch.hideTooltip();
      }
      };
      
      chart.parent = function(){
        return gWrapper;
      };
      
      chart.highlight = function(elems){
        if(elems instanceof Array){
          for(var i = 0, len = elems.length; i < len; i++){
            elems[i].setAttribute('fill-opacity', 1);
          }
        }else{
          elems.setAttribute('fill-opacity', 1);
        }
      };
      
      chart.unhighlight = function(elems){
        if(elems instanceof Array){
          for(var i = 0, len = elems.length; i < len; i++){
            elems[i].setAttribute('fill-opacity', 0.2);
          }
        }else{
          elems.setAttribute('fill-opacity', 0.2);
        }
      };
      
      chart.clear = function(gray){
        if( gray == null){
          gWrapper.selectAll('.datapoint').attr('fill-opacity', 1);
        }else{
          gWrapper.selectAll('.datapoint').attr('fill-opacity', 0.2);
        }
      };
      
        function turnToPercentage(){
          for(var i=0, len = seriesData.length; i < len; i++){
            for(var j=0 , rowSeriesData = seriesData[i], rowTooltipData = tooltipData[i]; j < rowSeriesData.length; j++){
              var sum = 0, avaCount = 0, k;
              for(k=0; k < rowSeriesData[j].length; k++){
                sum += Math.abs(rowSeriesData[j][k].val);
                if(!rowSeriesData[j][k].isNaN) {
                  avaCount++;
                }
              }
              if(sum === 0){

                for(k=0; k < rowSeriesData[j].length; k++){
                        rowSeriesData[j][k].value = TypeUtils.isExist(rowSeriesData[j][k].value) ? rowSeriesData[j][k].value : rowSeriesData[j][k].val;
                        rowSeriesData[j][k].val = rowSeriesData[j][k].isNaN? 0:1/avaCount ;
                        if(TypeUtils.isExist(rowTooltipData[j]) &&TypeUtils.isExist(rowTooltipData[j][k]) ){
                          rowTooltipData[j][k].val = rowTooltipData[j][k].isNaN? ' ' : 1/avaCount;
                        }
                }
              }else{
                for(k=0; k < rowSeriesData[j].length; k++){
                    if(rowSeriesData[j][k].val < 0){
                      rowSeriesData[j][k].isNegative = true;
                    }
                    rowSeriesData[j][k].value = TypeUtils.isExist(rowSeriesData[j][k].value) ? rowSeriesData[j][k].value : rowSeriesData[j][k].val;
                    rowSeriesData[j][k].val = Math.abs(rowSeriesData[j][k].val/sum);
                    if(TypeUtils.isExist(rowTooltipData[j]) &&TypeUtils.isExist(rowTooltipData[j][k]) ){
                      rowTooltipData[j][k].val = rowTooltipData[j][k].isNaN? ' ' : rowTooltipData[j][k].val/sum;
                    }
                }
              }
              
            }
          }
      }
      
      function completeAnimation(){
            eDispatch.initialized();
            afterAttachToDOM = true;
      }
      
      chart.afterUIComponentAppear = function(){
        eDispatch.initialized(); 
      };
      
      
      /**
      * set/get width
      */
      chart.width = function(value){
          if (!arguments.length){
            return width;
          }
          sizeChange = (width === value)&&!sizeChange? false:true;
          width = value;
      if(TypeUtils.isExist(width) && TypeUtils.isExist(height)&& TypeUtils.isExist(seriesData)){
          makeScales();
        }
          return chart;
      };

      /**
      * set/get height
      */
      chart.height = function(value){
        if (!arguments.length){
          return height;
         }
        sizeChange = (height === value)&&!sizeChange? false:true;
        height = value;
      if(TypeUtils.isExist(width) && TypeUtils.isExist(height)&& TypeUtils.isExist(seriesData)){
          makeScales();
        }
         return chart;        
      };
      /**
       * set/get data, for some modules like Title, it doesn't need data
       */
      chart.data = function(value){
        if (!arguments.length){
          return data;
        }
        data = value;
        var obj = MNDHandler(data);
                 
        var _data1 = obj["MG1"];
        var _data2 = obj["MG2"];
        measureOnAxis1 = obj.MG1Number;
        measureOnAxis2 = obj.MG2Number || 0;
        MNDInnerOnColor = obj.MNDOnColor && obj.MNDInner;
        tooltipData = [];
        var i;
        
        if(TypeUtils.isExist(obj.color)){
          hasMNDonCategoryAxis = true;
          isDualAxis = true;
          var tempData1 = [], tempData2 = [];
          var tempStackedData1 = [], tempStackedData2 = [];
          for(i=0; i<_data1.length; i++){
            tempData1 = [];
            tempData2 = [];
            for(var j=0; j<_data1[i].length; j++){
              if(obj.color[j] === 0){
                tempData1.push(_data1[i][j]);
                tempData2.push({
                  val:null,
                  hasMNDonCategoryAxis : true
                });
              }else{
                tempData1.push({
                  val:null,
                  hasMNDonCategoryAxis : true
                });
                tempData2.push(_data1[i][j]);
              }
            }
            tempStackedData1.push(tempData1);
            tempStackedData2.push(tempData2);
          }
          _data1 = tempStackedData1;
          _data2 = tempStackedData2;
          
      }else{
            hasMNDonCategoryAxis = false;
            if(TypeUtils.isExist(_data2)){
              if(! dataStructureChange && 
                  (data2.length !== _data2.length || data2[0].length !== _data2[0].length)){
                  dataStructureChange = true;
               }
              isDualAxis = true;
            }else{
              isDualAxis = false;
            }
     }
     if(data1.length !== _data1.length || data1[0].length !== _data1[0].length){
       dataStructureChange = true;
     }

      var _seriesData = dataHandler(_data1, _data2, obj.color);
      
        //judge what changed in dataset
        if(!dataStructureChange){
          dataValueChange = true;
        }
        seriesData = _seriesData;
        data1 = _data1;
        data2 = _data2;
        
        if(hasMNDonCategoryAxis){
          for(i=0; i< seriesData.length; i++){
            var temp = seriesData[i];
            if(temp[0][0].hasMNDonCategoryAxis){
              tooltipData.push(temp[1]);
            }else{
              tooltipData.push(temp[0]);
            }
          }
        }else{
          tooltipData = ObjectUtils.extend(true, {}, seriesData); 
        }
        
      if(TypeUtils.isExist(width) && TypeUtils.isExist(height)){
          makeScales();
        }
      
      parseOptions();
      
      return chart;        
    };


    /**
     * set/get properties
    */
    chart.properties = function(props){
      if (!arguments.length){
          return properties;
       }
      Objects.extend(true, properties, props);
            parseOptions();
        
        return chart;        
    };
       

    var makeScales = function(){
      var domain = [];
      for (var i=0; i < seriesData.length; i++){
          domain.push(i);
        }
        yScale.domain(domain).rangeBands([height, 0]);
        if(mode === 'percentage'){
          xScale.domain([0,1]).range([0, width]);
          xScale2.domain([0,1]).range([0, width]);
        }else{
          //when all data is 0 or null ,we make the domain from 0 to 1
          if(primaryAxisBottomBoundary === 0 && primaryAxisTopBoundary === 0 ){
            xScale.domain([0,1]).range([0, width]);
          }else{
            xScale.domain([primaryAxisBottomBoundary,primaryAxisTopBoundary]).range([0, width]);            
          }
         
          
          if( TypeUtils.isExist(data2) || isDualAxis ){
          //when data of second axis is all 0 or null, we make the xScale2 same with xScale .

            if(secondaryAxisTopBoundary === 0 && secondaryAxisBottomBoundary === 0){
              xScale2.domain(xScale.domain()).range(xScale.range());
            }else{
              xScale2.domain([secondaryAxisBottomBoundary, secondaryAxisTopBoundary]).range([0, width])
              //when data of first axis is all 0 or null, we make the xScale same with xScale2 .
              if(primaryAxisBottomBoundary === 0 && primaryAxisTopBoundary === 0){
                xScale.domain(xScale2.domain()).range(xScale2.range());
              }
            }

          }else{
            if (!primaryAxisManualRange) {
              Scaler.perfect(xScale);
            }
          }
        }
        if (!primaryAxisManualRange && !secondaryAxisManualRange)
        {
            Scaler.perfectDual(xScale, xScale2);
        }
        else if(!primaryAxisManualRange && secondaryAxisManualRange)
        {
            Scaler.perfect(xScale);
        }
        else if(primaryAxisManualRange && !secondaryAxisManualRange)
        {
            Scaler.perfect(xScale2);
        }
        if(!TypeUtils.isExist(data2)){
            xScale2.range([0, 0]);
        }
    };


    chart.colorPalette = function(Palette){
        if (!arguments.length){
          return colorPalette;
       }
        colorPalette = Palette;
       return chart;        
    };

    chart.categoryScale = function(scale){
        if (!arguments.length){
          return yScale;
       }
        yScale = scale;
       return chart;
    };
    
    chart.primaryDataRange = function(range){
      if (!arguments.length){
        var maxt, mint;
        if(mode === 'percentage'){
          maxt = 1;
          mint = 0;
        }else{
          mint = primaryAxisBottomBoundary < 0 ? primaryAxisBottomBoundary : 0;
          maxt = primaryAxisTopBoundary;
        }
        return {
          min: mint,
          max: maxt
        };
      }
      if (range !== null) {
          primaryAxisTopBoundary = range.max;
          primaryAxisBottomBoundary = range.min;
          if (range.from === 'axis') {
            primaryAxisManualRange = true;
          }
          if(TypeUtils.isExist(width) && TypeUtils.isExist(height)){
            makeScales();
          }
      }
      return chart;
    };
      
    chart.secondDataRange = function(range){
      if (!arguments.length){
        var maxt, mint;
        if(mode === 'percentage'){
          maxt = 1;
          mint = 0;
        }else{
          mint = secondaryAxisBottomBoundary< 0 ? secondaryAxisBottomBoundary : 0 ;
          maxt = secondaryAxisTopBoundary;
        }
        return {
          min: mint,
          max: maxt
        };
      }
      if (range !== null) {
          secondaryAxisTopBoundary = range.max;
          secondaryAxisBottomBoundary = range.min;
          if (range.from === 'axis') {
            secondaryAxisManualRange = true;
          }
          if(TypeUtils.isExist(width) && TypeUtils.isExist(height)){
            makeScales();
          }
      }
      return chart;
    }; 
       
    chart.primaryScale = function(scale){
        if (!arguments.length){
          return xScale;
       }
        xScale = scale;
       return chart;
    };     
    
    chart.secondScale = function(scale){
            if (!arguments.length){
                return xScale2;
            }
            xScale2 = scale;
            return chart;
        };    

      chart.primaryAxisColor = function(){
        if(isDualAxis && !hasMNDonCategoryAxis){
          return colorPalette[0];
        }else{
          //Jimmy/Nick/10/18/2012 we are telling axis to draw with default color
          return undefined;
        }
      };
      
      chart.secondAxisColor = function(){
        if(TypeUtils.isExist(seriesData[0][1]) && !hasMNDonCategoryAxis){
          return axis2ColorPalette[seriesData[0][1].length-1];
        }else{
          //Jimmy/Nick/10/18/2012 we are telling axis to draw with default color
          return undefined;
        }
      };          
        
      /**
      * get preferred size
      * @return {
          'width': NUMBER,
          'height' : NUMBER
        }
      */
      chart.getPreferredSize = function(){
        
      };
     
      chart.x = function(_){
        if(!arguments.length){
          return x;
        }
        x= _;
        return this;
      };
      
      chart.y = function(_){
        if(!arguments.length){
          return y;
        }
        y = _;
        return this;
      };
      
      chart.dispatch = function(_){
        if(!arguments.length){
          return eDispatch;
        }
        eDispatch = _;
        return this;
      };
      
      chart.dataLabel = function(_){};
      
      chart.primaryAxisTitle = function(_){
        if(!arguments.length){
          var titles =  data.getMeasureValuesGroupDataByIdx(0), title = [];
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
        return this;
      };
      
      chart.secondAxisTitle = function(_){
        if(!arguments.length){
          var titles =  data.getMeasureValuesGroupDataByIdx(1), title = [];
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
        return this;
      };
      
//      var dataTransform = function(data1, data2){
//        var stackedBarGroup = [];
//      // the number of bar in each group
//      var barGroupNumber =  data1[0].length;;
//      var transferredDataSet = data1;
//      var temp, temp2;
//      for(var j=0; j < barGroupNumber; j++){
//        var ds = [];
//        temp = 0, temp2 = 0
//        for(i=0; i< transferredDataSet.length; i++){
//          ds.push(transferredDataSet[i][j]);
//          if(transferredDataSet[i][j].val >= 0){
//            temp += transferredDataSet[i][j].val;
//          }else{
//            temp2 += transferredDataSet[i][j].val;
//          }
//        }
//        if(primaryAxisTopBoundary < temp){
//          primaryAxisTopBoundary = temp
//        }
//        if(primaryAxisBottomBoundary > temp2){
//          primaryAxisBottomBoundary = temp2
//        }
//        stackedBarGroup.push(ds);
//      }
//      if(TypeUtils.isExist(data2)){
//          barGroupNumber =  data2[0].length;;
//                transferredDataSet = data2;
//                for(var j=0; j < barGroupNumber; j++){
//                    temp = 0
//                    for(i=0; i< transferredDataSet.length; i++){
//                        stackedBarGroup[j].push(transferredDataSet[i][j]);
//                        temp += transferredDataSet[i][j].val;
//                    }
//                    if(secondaryAxisBoundary < temp){
//                        secondaryAxisBoundary = temp
//                    }
//                }
//            }
//      
//        return stackedBarGroup;
//      };
      
      var dataHandler = function(valueAxis1Data, valueAxis2Data, colorIndexArray){
        
        var positiveIndex = -1, negativeIndex = -1;
        positiveIndexes = [[],[]], negativeIndexes = [[],[]];
      
        primaryAxisTopBoundary = primaryAxisBottomBoundary = 0;
        secondaryAxisTopBoundary = secondaryAxisBottomBoundary = 0;
        
        var stackedBarGroupsData = [];
        // the number of bar in each group
        barGroupNumber =  valueAxis1Data[0].length;
        var temp, temp2;
        for(var j=0; j < barGroupNumber; j++){
          var tempDataSetAxis1 = [], tempDataSetAxis2 = [];
          var oneGroupDataSet = [];
          temp = 0, temp2 = 0;
          positiveIndex = -1, negativeIndex = -1;
          for(var i=0; i< valueAxis1Data.length; i++){
            if(NumberUtils.isNoValue(valueAxis1Data[i][j].val)){
              //Jimmy/1/9/2013, what happens if we use null as the number value
              //see http://stackoverflow.com/questions/2910495/why-null-0-null-0-but-not-null-0
              //and http://bclary.com/2004/11/07/#a-11.8.5
              //checked in chrome/IE9/firefox/javafx, it works fine
              //the change is to ensure we display 'No Value' in other places related to this data point
              valueAxis1Data[i][j].val = null;
              valueAxis1Data[i][j].isNaN = true;
            }else{
              
              if(valueAxis1Data[i][j].val >= 0){
                temp += valueAxis1Data[i][j].val;
                positiveIndex = i;
              }else{
                temp2 += valueAxis1Data[i][j].val;
                negativeIndex = i;
              }
            }
          tempDataSetAxis1.push(valueAxis1Data[i][j]);
        }
        positiveIndexes[0].push(positiveIndex);
        negativeIndexes[0].push(negativeIndex);
        
        if(primaryAxisTopBoundary < temp){
          primaryAxisTopBoundary = temp;
        }
        if(primaryAxisBottomBoundary > temp2){
          primaryAxisBottomBoundary = temp2;
        }
        oneGroupDataSet.push(tempDataSetAxis1);
        
        
        if(TypeUtils.isExist(valueAxis2Data)){
          temp = 0, temp2 = 0;
          positiveIndex = -1, negativeIndex = -1;
          for(i=0; i< valueAxis2Data.length; i++){
            positiveIndex = 0, negativeIndex = -1;
            if(NumberUtils.isNoValue(valueAxis2Data[i][j].val)){
              //Jimmy/1/9/2013, what happens if we use null as the number value
              //see http://stackoverflow.com/questions/2910495/why-null-0-null-0-but-not-null-0
              //and http://bclary.com/2004/11/07/#a-11.8.5
              //checked in chrome/IE9/firefox/javafx, it works fine
              //the change is to ensure we display 'No Value' in other places related to this data point
              valueAxis2Data[i][j].val = null;
              valueAxis2Data[i][j].isNaN = true;
            }else{
              
              if(valueAxis2Data[i][j].val >= 0){
                temp += valueAxis2Data[i][j].val;
                positiveIndex = i;
              }else{
                temp2 += valueAxis2Data[i][j].val;
                negativeIndex = i;
              }
            }
            tempDataSetAxis2.push(valueAxis2Data[i][j]);
          }
          positiveIndexes[1].push(positiveIndex);
          negativeIndexes[1].push(negativeIndex);
          
          if(secondaryAxisTopBoundary < temp){
            secondaryAxisTopBoundary = temp;
          }
          if(secondaryAxisBottomBoundary > temp2){
            secondaryAxisBottomBoundary = temp2;
          }
          oneGroupDataSet.push(tempDataSetAxis2);
        }
        stackedBarGroupsData.push(oneGroupDataSet);
       }
        
        return stackedBarGroupsData;
      };
    
      properties = manifest.props(null);
      return chart;
  };
  return bar;
});