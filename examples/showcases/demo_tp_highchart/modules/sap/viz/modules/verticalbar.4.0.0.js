sap.riv.module(
{
  qname : 'sap.viz.modules.verticalbar',
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
function Setup(TypeUtils, dispatch, MNDHandler, tooltipDataHandler, ColorSeries, Scaler, Repository, NumberUtils, Objects, langManager, boundUtil) {
  var vBar = function(manifest, ctx) {
    var tooltipDataHandlerObj;
    var data1, 
        data2, 
        data, 
        seriesData = [], 
        primaryAxisTopBoundary = 0, 
        primaryAxisBottomBoundary = 0,
        primaryAxisManualRange = false,
        secondaryAxisManualRange = false,
        secondaryAxisTopBoundary = 0,
        secondaryAxisBottomBoundary = 0,
        sWrapper = null;
    
    var width = undefined, 
        height = undefined,
        id = Math.floor(Math.random() * 10000),
        x = 0, 
        y = 0,
        isDualAxis = false,
        colorPalette = [],
        axis1ColorPalette,
        axis2ColorPalette,
        MNDInnerOnColor = false,
        measureOnAxis1 = 0,
        measureOnAxis2 = 0,
        shapePalette = ['squareWithRadius'],
        properties,
        eDispatch = new dispatch('showTooltip', 'hideTooltip', 'initialized', 'startToInit');
      
    var effectManager = ctx.effectManager;
    
    var valueScales = [],
        xScale = d3.scale.ordinal(),
        yScale = d3.scale.linear(),
        yScale2 = d3.scale.linear();


    var decorativeShape, 
        eventLayerShape, 
        lastSelected = [], 
        tooltipVisible = true,
        lastHovered = null;

      
    var indexforSecondaryAxis = 0,
        barNumber,
        barGroupNumber,
        barWidth,
        yPositions = [];
        
    var enableDataLoadingAnimation = true,
        enableDataUpdatingAnimation = true,
        enableRoundCorner = false,
        clipEdge = true,
        totalIntervalTime = 1000,
        afterAttachToDOM = false,
        isOnlyInitAnimation = false;
    
    var defsEnter, 
        roundCornerDefs,
        suffix = Repository.newId();
    var drawingEffect = 'normal';
    
    var sizeChange = false, dataStructureChange = false, dataValueChange = false;
    
    chart.hoverOnPoint = function(point){
        var xOnModule = point.x, yOnModule = point.y;
        // find the closet dimension
        var i = -1;
        while (i < seriesData.length) {
          if (Math.abs(xOnModule - xScale.rangeBand()*i - 0.5 * xScale.rangeBand() ) <= 0.5 * xScale.rangeBand()) {
            break;
          }
          i++;
        }

        if (i > (seriesData.length - 1)|| i < 0) {
          decorativeShape.attr('visibility', 'hidden');
          return;
        }
      
        decorativeShape.attr('x',xScale.rangeBand() * i + barWidth/4)
                       .attr('visibility', 'visible');
      
        if(lastHovered !== i){
          if (tooltipVisible) {
            lastHovered = i;
            //this.parentNode point to plot graphic. it is different from bar chart as in bar chart it should get the yoffset which can get it from mian graphic element
            var transform = sWrapper[0][0].getTransformToElement(sWrapper[0][0].ownerSVGElement);
            var xoffset = transform.e;
            
            var tData = tooltipDataHandlerObj.generateTooltipData(data, seriesData, i, colorPalette, shapePalette);
            tData.point = {
              x: xScale.rangeBand()*i + 0.5 * xScale.rangeBand() + xoffset,
              y: d3.event.layerY
            };
            tData.plotArea = {
              x : transform.e,
              y : transform.f,
              width : width,
              height : height
            };
            eDispatch.showTooltip(tooltipDataHandler.formatTooltipData(tData));
          }
        }
      };
    
      chart.parent = function(){
        return sWrapper;
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
          sWrapper.selectAll('.datapoint').attr('fill-opacity', 1);
        }else{
          sWrapper.selectAll('.datapoint').attr('fill-opacity', 0.2);
        }
      };
      

      chart.blurOut = function(){
        decorativeShape.attr('visibility', 'hidden');
        lastHovered = null;
      if (tooltipVisible) {
          eDispatch.hideTooltip();
      }
      };
      
      var parseOptions = function(){
        enableRoundCorner = properties.isRoundCorner;
        enableDataLoadingAnimation =  properties.animation.dataLoading; 
        enableDataUpdatingAnimation =  properties.animation.dataUpdating; 
        tooltipVisible = properties.tooltip.enabled;
        drawingEffect = properties.drawingEffect;
      
        if(isDualAxis && !hasMNDonCategoryAxis){
          axis1ColorPalette = properties.primaryValuesColorPalette;   
          axis2ColorPalette = properties.secondaryValuesColorPalette;
        }else{
          axis2ColorPalette = properties.colorPalette;
          axis1ColorPalette = properties.colorPalette;
        }
        var colorIndexes = 0;
        if(!hasMNDonCategoryAxis){
          indexforSecondaryAxis = data1.length;
          colorIndexes = seriesData[0].length;   
        }else{
          colorIndexes = seriesData.length * seriesData[0].length;
        }
        colorPalette = [];
        if(MNDInnerOnColor){
          var flag = 0, flag2 = 0, j = 0;
          for(var i=0 ; i < indexforSecondaryAxis; i++){
            colorPalette.push(axis1ColorPalette[i % axis1ColorPalette.length]);
            flag++;
            if(flag == measureOnAxis1){
              flag2 = 0;
              for(; j <=(colorIndexes-indexforSecondaryAxis); j++){
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
          for(var i=0 ; i < colorIndexes; i++){
            if(i < indexforSecondaryAxis){
              colorPalette.push(axis1ColorPalette[i % axis1ColorPalette.length]);
            }else if(isDualAxis && !hasMNDonCategoryAxis){
              colorPalette.push(axis2ColorPalette[(i-indexforSecondaryAxis) % axis2ColorPalette.length]);  
            }
          }  
        }
      };
      
      /**
       * Create chart
       */

      function chart(selection){
        
        boundUtil.drawBound(selection, width, height);

        tooltipDataHandlerObj = tooltipDataHandler();
        
        // [19-Oct-2012 Nick] if the size of plot area is too small, there is no value scale created and the whole drawing part is skipped.
        if(valueScales.length == 0) return;
        
        eDispatch.startToInit();
        
        selection.each(function(){
              barNumber = seriesData[0].length;
              barGroupNumber =  seriesData.length;
              barWidth = 8 * (xScale.rangeBand()) / (9*barNumber +7 );
              
              var svg = sWrapper = d3.select(this);

              if(decorativeShape == null){
                  decorativeShape = svg.append('rect').attr('width', xScale.rangeBand() - barWidth/2).attr('height',height).attr('visibility', 'hidden')
                    .attr('fill', 'rgba(133,133,133, 0.2)');
                }else{
                  decorativeShape.attr('width', xScale.rangeBand() - barWidth/2).attr('height',height).attr('visibility', 'hidden');
                }
    
              //vertical bar
              if(defsEnter == null){
                defsEnter = svg.append('defs').append('clipPath').append('rect').attr('width', width).attr('height', height);    
              }else{
                defsEnter.attr('width', width).attr('height', height);
              }    
              
              if(roundCornerDefs == null){      
                roundCornerDefs = svg.append('defs');
              }else{
                if( dataStructureChange || sizeChange || dataValueChange || !enableRoundCorner){
                  roundCornerDefs.remove();
                  roundCornerDefs = svg.append('defs')
                }
              }
            
              var r = Math.log(barWidth)/Math.log(2);
              if( r < 0 ){
                enableRoundCorner = false;
              }
              var valueScale;
              var datashapesgroup = svg.selectAll('g.datashapesgroup');
              if(!TypeUtils.isExist(datashapesgroup[0][0])){
                datashapesgroup = svg.append('g').attr('class', 'datashapesgroup');
              }
              
              var barGroup = datashapesgroup.selectAll('g.bar').data(seriesData), lastBarGroupIndex = seriesData.length -1, lastBarIndex = seriesData[0].length - 1;    
                  barGroup.enter().append('g');
                  barGroup.attr('class','bar').each( function (perBarGroup, i) {
                      var xArray=[], yArray=[];
                      var barShape = d3.select(this).selectAll('g.datashape').data(perBarGroup);
                      barShape.enter().append('g').attr('class','datashape').append('rect').attr('class', 'datapoint');

                      barShape.exit().remove();
                      // [21-Nov-2012 Nick] Keep the original x-position for each g.datashape, it is used when data value changes.
                      if(afterAttachToDOM){
                        barShape.each(function(){
                          yArray.push(this.getTransformToElement(this.parentNode).f);
                        });
                      }
                      barShape.attr('transform', function(perRectData,m){
                          var y;
                          valueScale = valueScales[perRectData.valueAxis];
                          if(perRectData.val >= 0){
                            y = valueScale(perRectData.val);
                          }else{
                           y = valueScale(0) ;
                          }
                          var x = xScale(i) + barWidth * m;
                          x = x + barWidth/8 *(m) + barWidth/2;
                          xArray.push(x);
                          return 'translate('+x+','+y+')';
                      });
                      var bar = barShape.select('rect.datapoint');
                        bar.attr('fill', function(d,i){ 
                                  d.fillColor = colorPalette[i % colorPalette.length]; 
                                  var parameter = {
                                      drawingEffect:drawingEffect,
                                      fillColor : d.fillColor,
                                      direction : 'horizontal'
                                  };
                                  return effectManager.register(parameter);
                            })
                            .attr('shape-rendering','crispEdges').attr('fill-opacity', 1);
                      
                      if(enableDataLoadingAnimation && !isOnlyInitAnimation ){
                      // [05 - Sep - 2012 Nick] DataStructureChange means the structure of data is changed. 
                      // It means the whole DOM nodes needed to be removed (handled by d3) and append new ones.
                      if(dataStructureChange){
                        bar.attr('width', barWidth).attr('height', 0)
                           .attr('x', function (perRectData, m) {
                             var x = xScale(i) - xArray[m] + barWidth * m;
                             x = x + barWidth/8 *(m) + barWidth/2;
                             return x;
                           })
                          .attr('y', function(perRectData){
                            valueScale = valueScales[perRectData.valueAxis];
                            // [10 - Sep - 2012 Nick] if the value is invalid number, there is no bar but 
                            // the space is reserved
                            if(perRectData.val !== ' ' && perRectData.val != 0 && perRectData.val > 0){
                              var height = Math.abs(valueScale(perRectData.val) - valueScale(0));
                              return height;
                            }else{
                              return 0;
                            }
                          });
 
                        
                        if(enableRoundCorner){
                          bar.attr('clip-path', function(perRectData, m){
                            var w = this.getAttribute('width'), h = this.getAttribute('height'),x = this.getAttribute('x'), y =this.getAttribute('y');
                            var id = 'roundCorner-clip' + '-' + m + i + suffix;
                            roundCornerDefs.append('clipPath').attr('id', id)
                                .append('rect').attr('rx', r).attr('ry', r)
                                .attr('x', 0).attr('width', barWidth)
                                .attr('y', h)
                                .transition().delay(function(d,m){return (m + barNumber * i) * interval})
                                .attr('height', function(){
                                  valueScale = valueScales[perRectData.valueAxis];
                                  // [10 - Sep - 2012 Nick] if the value is invalid number, there is no bar but 
                                  // the space is reserved
                                  if(perRectData.val !== ' ' && perRectData.val != 0){
                                    var height = Math.abs(valueScale(perRectData.val) - valueScale(0));
                                    // [10 - Sep - 2012 Nick] if the height of one bar is less than 1px, use 1px.
                                    return (height + r); 
                                  }else{
                                    return 0;
                                  }
                                })
                                .attr('y', function(){
                                  if(perRectData.val > 0){
                                    return  0;
                                  }else{
                                    return 0 - r;
                                  }
                                });
                            return 'url(#' + id + ')'; });
                        }
                        
                        var interval = totalIntervalTime / (barNumber * barGroupNumber);
                        bar.transition().delay(function(d,m){return (m + barNumber * i) * interval})
                          .attr('height', function(perRectData,m){
                            valueScale = valueScales[perRectData.valueAxis];
                            // [10 - Sep - 2012 Nick] if the value is invalid number, there is no bar but 
                            // the space is reserved
                            if(perRectData.val !== ' ' && perRectData.val != 0){
                              var height = Math.abs(valueScale(perRectData.val) - valueScale(0));
                              return height;
                            }else{
                              return 0;
                            }
                          })
                          .attr('y', 0).attr('x',0)
                          .each('end', function(perRectData, m){
                            if(m === lastBarIndex && i === lastBarGroupIndex){
                              completeAnimation();
                            }
                          });
                      }else if(sizeChange){
                        if(enableRoundCorner){
                          bar.attr('clip-path', function(perRectData, m){
                            var w = this.getAttribute('width'), h = this.getAttribute('height'),x = this.getAttribute('x'), y =this.getAttribute('y');
                            var id = 'roundCorner-clip' + '-' + m + i + suffix;    
                            roundCornerDefs.append('clipPath').attr('id', id).append('rect').attr('rx', r).attr('ry', r)
                                  .attr('width', w).attr('x', x).attr('height', h)
                                  .attr('y', function(){
                                      if(perRectData.val > 0){
                                        return 0;
                                      }else{
                                        return 0 - r;
                                      }
                                  })
                                  .transition().duration(totalIntervalTime).attr('width',barWidth)
                                  .attr('height', function(){
                                    valueScale = valueScales[perRectData.valueAxis];
                                    // [10 - Sep - 2012 Nick] if the value is invalid number, there is no bar but 
                                    // the space is reserved
                                    if(perRectData.val !== ' ' && perRectData.val != 0){
                                      var height = Math.abs(valueScale(perRectData.val) - valueScale(0));
                                      // [10 - Sep - 2012 Nick] if the width of one bar is less than 1px, use 1px.
                                      return  (height + r); 
                                    }else{
                                      return 0;
                                    }
                                  })
                            return 'url(#' + id + ')'; });
                        }
                        //bar.transition().delay(function(d,m){return (m + barNumber * i) * interval}).attr('width',  function(d, m){
                        bar.transition().duration(totalIntervalTime).attr('width', barWidth)
                           .attr('height', function(perRectData){
                              valueScale = valueScales[perRectData.valueAxis];
                            // [10 - Sep - 2012 Nick] if the value is invalid number, there is no bar but 
                            // the space is reserved
                              if(perRectData.val !== ' ' && perRectData.val != 0){
                              var height = Math.abs(valueScale(perRectData.val) - valueScale(0));
                              return  height; 
                            }else{
                              return 0;
                            }
                           })
                           .attr('y', 0).attr('x', 0)
                           .each('end', function(d, m){
                             if(m === lastBarIndex && i === lastBarGroupIndex){
                               completeAnimation();
                             }
                           });
                      }else if(dataValueChange){
                        var barYP = [];
                        bar.attr('y',function(d,k){
                          var pos = yArray[k] - this.parentNode.getTransformToElement(this.parentNode.parentNode).f;
                          barYP.push(pos);
                          return pos;
                        })
                        if(enableRoundCorner){
                          bar.attr('clip-path', function(perRectData, m){
                            var w = this.getAttribute('width'), h = this.getAttribute('height'),x = this.getAttribute('x'), y =this.getAttribute('y');
                            var id = 'roundCorner-clip' + '-' + m + i + suffix;  
                            roundCornerDefs.append('clipPath').attr('id', id)
                                .append('rect').attr('rx', r).attr('ry', r)
                                  .attr('x', x).attr('width', barWidth)
                                  .attr('height', function(){
                                    valueScale = valueScales[perRectData.valueAxis];
                                    var newHeight = Math.abs(valueScale(perRectData.val) - valueScale(0));
                                    if(parseFloat(h) > newHeight){
                                      return h;
                                    }else{
                                      return newHeight;
                                    }
                                  }) 
                                  .attr('y', function(){
                                    return barYP[m];
                                  })
                                  .transition().duration(totalIntervalTime)
                                  .attr('height', function(){
                                      valueScale = valueScales[perRectData.valueAxis];
                                    // [10 - Sep - 2012 Nick] if the value is invalid number, there is no bar but 
                                    // the space is reserved
                                      if(perRectData.val !== ' ' && perRectData.val != 0){
                                      var height = Math.abs(valueScale(perRectData.val) - valueScale(0));
                                      // [10 - Sep - 2012 Nick] if the width of one bar is less than 1px, use 1px.
                                      return (height + r); 
                                    }else{
                                      return 0;
                                    }
                                  }).attr('y', function () {
                                      valueScale = valueScales[perRectData.valueAxis];
                                    if(perRectData.val >= 0){
                                      return 0;
                                    }else{
                                      return 0 - r;
                                    }
                                  });
                            return 'url(#' + id + ')'; });
                        }
                        
                        //To seperate dataValueChange, as in size change, we calculate more than data value change.
                        //in value change, only change the width, in size, there are height width, y
                        bar.transition().duration(totalIntervalTime)
                          .attr('height', function(perRectData,m){
                            valueScale = valueScales[perRectData.valueAxis];
                            // [10 - Sep - 2012 Nick] if the value is invalid number, there is no bar but 
                            // the space is reserved
                            if(perRectData.val !== ' ' && perRectData.val != 0){
                              var height = Math.abs(valueScale(perRectData.val) - valueScale(0));
                              // [10 - Sep - 2012 Nick] if the width of one bar is less than 1px, use 1px.
                              perRectData.height = height;
                              return height; 
                            }else{
                              return 0;
                            }
                          })
                          .attr('y', 0).attr('x',0)
                          .each('end', function(d, m){
                            if(m === lastBarIndex && i === lastBarGroupIndex){
                              completeAnimation();
                            }
                          });
                      }
                      else if(enableRoundCorner){
                        bar.attr('clip-path', function(perRectData, m){
                          var id = 'roundCorner-clip' + '-' + m + i + suffix;    
                        roundCornerDefs.append('clipPath').attr('id', id)
                          .append('rect').attr('rx', r).attr('ry', r)
                          .attr('width', barWidth)
                          .attr('height', function(){
                            valueScale = valueScales[perRectData.valueAxis];
                            // [10 - Sep - 2012 Nick] if the value is invalid number, there is no bar but 
                            // the space is reserved
                            if(perRectData.val !== ' ' && perRectData.val != 0){
                              var height = Math.abs(valueScale(perRectData.val) - valueScale(0));
                              // [10 - Sep - 2012 Nick] if the width of one bar is less than 1px, use 1px.
                              return  (height + r); 
                            }else{
                              return 0;
                            }
                          })
                          .attr('y', function () {
                               valueScale = valueScales[perRectData.valueAxis];
                               if(perRectData.val >= 0){
                                 return 0;
                               }else{
                                 return 0 - r;
                               }
                          })
                          .attr('x', 0);
                        return 'url(#' + id + ')'; });
                        }  
                    }
                      // [05-Sep-2012 Nick] When animation is disabled, the chart is drawed here.
                      else{
                      bar.attr('width', barWidth)
                         .attr('height', function(perRectData){
                            valueScale = valueScales[perRectData.valueAxis];
                            // [10 - Sep - 2012 Nick] if the value is invalid number, there is no bar but 
                          // the space is reserved
                            if(perRectData.val !== ' ' && perRectData.val != 0){
                            var height = Math.abs(valueScale(perRectData.val) - valueScale(0));
                            // [10 - Sep - 2012 Nick] if the width of one bar is less than 1px, use 1px.
                            perRectData.height = height;
                            return height; 
                          }else{
                            return 0;
                          }
                         })
                         .attr('y', 0).attr('x', 0);
                      
                      if(enableRoundCorner){
                          bar.attr('clip-path', function(perRectData, m){
                            var id = 'roundCorner-clip' + '-' + m + i + suffix;    
                          roundCornerDefs.append('clipPath').attr('id', id)
                            .append('rect').attr('rx', r).attr('ry', r)
                            .attr('width', barWidth)
                            .attr('height', function(){
                              valueScale = valueScales[perRectData.valueAxis];
                              // [10 - Sep - 2012 Nick] if the value is invalid number, there is no bar but 
                              // the space is reserved
                              if(perRectData.val !== ' ' && perRectData.val != 0){
                                var height = Math.abs(valueScale(perRectData.val) - valueScale(0));
                                // [10 - Sep - 2012 Nick] if the width of one bar is less than 1px, use 1px.
                                return  (height + r); 
                              }else{
                                return 0;
                              }
                            })
                            .attr('y', function () {
                                 valueScale = valueScales[perRectData.valueAxis];
                                 if(perRectData.val >= 0){
                                   return 0;
                                 }else{
                                   return 0 - r;
                                 }
                            })
                            .attr('x', 0);
                          return 'url(#' + id + ')'; });
                        }
                      }
                     // bar.exit().remove();
                });

                barGroup.exit().remove();
                sizeChange = false, dataValueChange = false, dataStructureChange = false;
            
        });
        if(!enableDataLoadingAnimation)
          completeAnimation();
        
        return chart;
      }
      

      function completeAnimation(){
          eDispatch.initialized();
          afterAttachToDOM = true;
      }
      
      chart.afterUIComponentAppear = function(){
        eDispatch.initialized(); 
      };
      
      
    function changeYPosition(d,m){
      var i = d3.interpolate(height,  (m >= indexforSecondaryAxis) ? yScale2(d.val) : yScale(d.val));
        return function(t){ 
          return   i(t);
        }
    };
    
      /**
      * set/get width
      */
      chart.width = function(value){
          if (!arguments.length){
            return width;
          }
          sizeChange =  (width === value)&&!sizeChange ? false:true;
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
        sizeChange = (height === value)&&!sizeChange ? false:true;
        height = value;
        if(TypeUtils.isExist(width) && TypeUtils.isExist(height) && TypeUtils.isExist(seriesData)){
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

        data1 = obj["MG1"];
        data2 = obj["MG2"];
        measureOnAxis1 = obj.MG1Number;
        measureOnAxis2 = obj.MG2Number || 0;
        MNDInnerOnColor = obj.MNDOnColor && obj.MNDInner;
 
        if(TypeUtils.isExist(obj.color)){
          hasMNDonCategoryAxis = true;
          isDualAxis = true;
        }else{
          hasMNDonCategoryAxis = false;
          if(TypeUtils.isExist(data2)){
                isDualAxis = true;
            }else{
                isDualAxis = false;
            }
        }
        
        var _seriesData = dataTransform(data1,data2, obj.color);
        //judge what changed in dataset
        if(seriesData.length !== _seriesData.length || _seriesData[0].length !== seriesData[0].length){
          dataStructureChange = true;
        }else {
          dataValueChange = true;
        }
        seriesData = _seriesData;
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
     
      /**
       * TODO: add desc
       */
      var makeScales = function(){
      var domain = [];
      for (var i=0; i < seriesData.length; i++){
           domain.push(i);
        }
      
      valueScales = [];
        //when all data is 0 or null, we make yscale.domain from 0 to 1
        xScale.domain(domain).rangeBands([0, width]);
        if(primaryAxisBottomBoundary === 0 && primaryAxisTopBoundary === 0){
          yScale.domain([0, 1]).range([height, 0]);

        }else{
          yScale.domain([primaryAxisBottomBoundary, primaryAxisTopBoundary]).range([height, 0]);

        }

        if(TypeUtils.isExist(data2) || isDualAxis){
        //when data of second axis is all 0 or null, we make the xScale2 same with xScale .

          if(secondaryAxisTopBoundary === 0 && secondaryAxisBottomBoundary === 0){
            yScale2.domain(yScale.domain()).range(yScale.range());
          }else{
            yScale2.domain([secondaryAxisBottomBoundary, secondaryAxisTopBoundary]).range([height, 0])
            //when data of first axis is all 0 or null, we make the xScale same with xScale2 .
            if(primaryAxisBottomBoundary === 0 && primaryAxisTopBoundary === 0){
              yScale.domain(yScale2.domain()).range(yScale2.range());
            }
          }
          if (!secondaryAxisManualRange && !primaryAxisManualRange)
          {
              Scaler.perfectDual(yScale, yScale2);
          }
          else if(!secondaryAxisManualRange && primaryAxisManualRange)
          {
              Scaler.perfect(yScale2);
          }
          else if (secondaryAxisManualRange && !primaryAxisManualRange)
          {
              Scaler.perfect(yScale);
          }
        }else{
          if (!primaryAxisManualRange) {
            Scaler.perfect(yScale);
          }
          yScale2.range([0, 0]);
        }
            valueScales.push(yScale);
            valueScales.push(yScale2);
      };
      
      /**
       * TODO: please fill your comments here, or jsdoc will complain.
       */
      chart.categoryScale = function(scale){
        if (!arguments.length){
          return xScale;
         }
        xScale = scale;
         return chart;
      };
     
      chart.primaryScale = function(scale){
        if (!arguments.length){
          return yScale;
         }
        yScale = scale;
        valueScales[0] = yScale;
         return chart;
      };
      
      chart.secondScale = function(scale){
        if (!arguments.length){
          return yScale2;
         }
        yScale2 = scale;
        valueScales[1] = yScale2;
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
        if(!hasMNDonCategoryAxis){
          return colorPalette[seriesData[0].length - 1];
        }else{
           //Jimmy/Nick/10/18/2012 we are telling axis to draw with default color
          return undefined;
        }
      };          
      
      chart.primaryDataRange = function(range){
        if (!arguments.length){
          return {
            min: primaryAxisBottomBoundary,
            max: primaryAxisTopBoundary
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
          return {
            min: secondaryAxisBottomBoundary,
            max: secondaryAxisTopBoundary
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
        if(!arguments.length)
          return y;
        y = _;
        return this;
      };

      chart.dispatch = function(_){
        if(!arguments.length)
          return eDispatch;
        eDispatch = _;
        return this;
      };
      
    chart.dataLabel = function(_){};
    
    chart.eventTarget = function (evt) {
      if (evt.type == 'mousemove') {
        return chart.hoverOnPoint;
      } else if (evt.type == 'mouseout') {
        return blurOut;
      }
    };
      
      /**
      * get/set your color palette if you support color palette
      */
      chart.colorPalette = function(_){
        if(!arguments.length){
          return colorPalette;
        }
        colorPalette = _;
        return this;
      };

                
        // chart.primaryValuesColorPalette = function(_){
            // if(!arguments.length){
                // return axis1ColorPalette;
            // }  
            // axis1ColorPalette = _;
            // return this;
        // };
// 
        // chart.secondaryValuesColorPalette = function(_){
            // if(!arguments.length){
                // return axis2ColorPalette;
            // }  
            // axis2ColorPalette = _;
            // return this;
        // };        

      /**
      * get/set your shape Palette if you support shape Palette
      */
      chart.shapePalette = function(_){
        if(!arguments.length){
          return shapePalette;
        }
        shapePalette = _;
        return this;
      };
      
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
      
//      var dataTransform = function(data1,data2){
//        var stackedBarGroup = [];
//      // the number of bar in each group
//      var barGroupNumber =  data1[0].length;
//      var transferredDataSet = [];
//      for(var i=0; i<data1.length; i++){
//                var temp = d3.max(data1[i], function(m){return m.val;});
//                var temp2 = d3.min(data1[i], function(m){return m.val;});
//                if(primaryAxisTopBoundary <temp){
//                    primaryAxisTopBoundary = temp;
//                }
//                if(primaryAxisBottomBoundary > temp2){
//                    primaryAxisBottomBoundary = temp2;
//                }
//          transferredDataSet.push(data1[i]);
//        }
//      if(data2 != undefined){
//        for(i=0; i<data2.length; i++){
//                    var temp = d3.max(data2[i], function(m){return m.val;});
//                    var temp2 = d3.min(data2[i], function(m){return m.val;});
//                    if(secondaryAxisTopBoundary < temp){
//                        secondaryAxisTopBoundary = temp;
//                    }
//                    if(secondaryAxisBottomBoundary > temp2){
//                        secondaryAxisBottomBoundary = temp2;
//                    }
//          transferredDataSet.push(data2[i]);
//        }
//      }
//       
//      for(var j=0; j < barGroupNumber; j++){
//        var ds = [];
//        for(i=0; i< transferredDataSet.length; i++){
//          ds.push(transferredDataSet[i][j]);
//        }
//        stackedBarGroup.push(ds);
//      }
//     
//        return stackedBarGroup;
//      };
      
      var dataTransform = function(valueAxis1,valueAxis2, colorIndexArray){
        primaryAxisTopBoundary = primaryAxisBottomBoundary = 0;
        secondaryAxisTopBoundary = secondaryAxisBottomBoundary = 0;
        var barGroups = [];
      // the number of bar in each group
      var barGroupNumber = 0;
      
      if (valueAxis1[0] && valueAxis1[0].length) {
            barGroupNumber = valueAxis1[0].length;
      } else if (valueAxis2[0] && valueAxis2[0].length) {
            barGroupNumber = valueAxis2[0].length;
      }
      var barGroup = [];
      var temp = temp2 = 0;
      for(var i=0; i < valueAxis1.length; i++){
        if(hasMNDonCategoryAxis){
          for(var j = 0;  j< valueAxis1[i].length; j++){
            if(colorIndexArray[j] == 0){
              temp = valueAxis1[i][j].val;
              valueAxis1[i][j].valueAxis = 0;
              
              if(primaryAxisTopBoundary <temp){
                primaryAxisTopBoundary = temp;
              }
              if(primaryAxisBottomBoundary > temp){
                primaryAxisBottomBoundary = temp;
              }
              indexforSecondaryAxis++;
            }else{
              temp2 = valueAxis1[i][j].val;
              
              valueAxis1[i][j].valueAxis = 1;
              if(secondaryAxisTopBoundary < temp2){
                secondaryAxisTopBoundary = temp2;
              }
              if(secondaryAxisBottomBoundary > temp2){
                  secondaryAxisBottomBoundary = temp2;
              }
            }
          }
        }else{
          temp = d3.max(valueAxis1[i], function(m){return m.val;});
          temp2 = d3.min(valueAxis1[i], function(m){return m.val;});
          
          if(primaryAxisTopBoundary <temp){
            primaryAxisTopBoundary = temp;
          }
          if(primaryAxisBottomBoundary > temp2){
            primaryAxisBottomBoundary = temp2;
          }
        }
        barGroup.push(valueAxis1[i]);
          
        }
      if(valueAxis2 != undefined){
      
        for(i=0; i<valueAxis2.length; i++){
          var temp = d3.max(valueAxis2[i], function(m){return m.val;});
          var temp2 = d3.min(valueAxis2[i], function(m){return m.val;});
          
          if(secondaryAxisTopBoundary < temp){
            secondaryAxisTopBoundary = temp;
          }
          if(secondaryAxisBottomBoundary > temp2){
              secondaryAxisBottomBoundary = temp2;
          }
          barGroup.push(valueAxis2[i]);
        }
      }
      
      
       
      for(var j=0; j < barGroupNumber; j++){
        var ds = [];
        for(i=0; i< barGroup.length; i++){
          if(!hasMNDonCategoryAxis){
            if( i < valueAxis1.length){
              barGroup[i][j].valueAxis = 0;
            }else{
              barGroup[i][j].valueAxis = 1;
            }
          }
          if(NumberUtils.isNoValue(barGroup[i][j].val)){
            barGroup[i][j].val = ' ';
          }
          ds.push(barGroup[i][j]);
        }
        if(MNDInnerOnColor){
          var dSet = [], flag1=0, flag2=0;
          var n=0;
          for(var m=0; m < valueAxis1.length; m++){
            dSet.push(ds[m]);
            flag1++;
            if(flag1 == measureOnAxis1 && valueAxis2 != undefined){
              flag2 = 0;
              for(; n<valueAxis2.length; n++){
                if(flag2 >= measureOnAxis2){
                  flag1 = 0;
                  break;
                }
                dSet.push(ds[valueAxis1.length+n]);
                flag2++;
              }
            }
          }
          barGroups.push(dSet);
        }else{
          barGroups.push(ds);
        }
      }
        return barGroups;
      };
    
      properties = manifest.props(null);
      return chart;
  };
  return vBar;
});