sap.riv.module(
{
  qname : 'sap.viz.modules.mekko',
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
function Setup(TypeUtils, ObjectUtils, dispatch, MNDHandler,tooltipDataHandler, ColorSeries, Scaler, Repository, NumberUtils, Objects , langManager, BoundUtil) {
 var mekko = function(manifest, ctx) {
      var data,
          data1 = [[]],
          data2 = [[]],
          seriesData , tooltipData = [], //in stacked chart the value in tooltip is the same with data in seriesData, but in percentage chart it use the absolute value of negative data.
          primaryAxisTopBoundary = 0,
          primaryAxisBottomBoundary = 0,
          secondaryAxisTopBoundary = 0,
          secondaryAxisBottomBoundary = 0,
          gWrapper = null;
      
      var defaultString = langManager.get('IDS_ISNOVALUE');
      
      var width, 
          height,
          x = 0, y = 0,
          colorPalette = [],
          axis1ColorPalette,
          shapePalette = ['squareWithRadius'],
          properties = manifest.props(null),
          eDispatch = new dispatch('selectData', 'deselectData', 'showTooltip', 'hideTooltip', 'initialized', 'startToInit');
                
      var effectManager = ctx.effectManager;
      
      var categoryScale = d3.scale.ordinal(),
          valueScale = d3.scale.linear();
      categoryScale.noEqual = true;
      
      var decorativeShape = null,
          lastHovered = null;
        
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
          tooltipVisible = true,
          totalIntervalTime = 1000;
      
      var defsEnter = null, 
          roundCornerDefs = null,
          suffix = Repository.newId();
      
      var mode = 'comparison'; // bar display mode
      
      var drawingEffect = 'normal';
      
      var sizeChange = false, dataStructureChange = false, dataValueChange = false,modeChange = false;
    
      var dimensionData = {
          'sap.viz.modules.mekko.dimension':{
            key: 'sap.viz.modules.mekko.dimension',
            values : [{
              col: {val:''},
              rows: []
            }]
          }
      };
      
      var rangeBounds = [], rangeSumForScale = [],rangeSumForValue = [];

      var isHorizontal = true, afterAttachToDOM = false;
      
      var parseOptions = function(){
          if(mode === properties.mode){
            mode = properties.mode === 'percentage'? 'percentage': 'comparison';
            modeChange = false;
          }
          else{
            mode = properties.mode === 'percentage'? 'percentage': 'comparison';
            modeChange = true;
          }
          isHorizontal = properties.orientation === 'horizontal'? true: false;
          enableRoundCorner = properties.isRoundCorner;
          enableDataLoadingAnimation =  properties.animation.dataLoading; 
          enableDataUpdatingAnimation =  properties.animation.dataUpdating; 
          tooltipVisible = properties.tooltip.enabled;      
    
          axis1ColorPalette = properties.colorPalette;
          
          drawingEffect = properties.drawingEffect;
          
          colorPalette = [];
          var i,j;
      
          for(i=0 ; i < seriesData[0].length; i++){
              for(j=0; j < seriesData[0][0].length; j++){
               colorPalette.push(axis1ColorPalette[j % axis1ColorPalette.length]);
              }
            }           
        };
        
        function chart(selection){
            BoundUtil.drawBound(selection, width, height);
            //deal with percentage mode
            if(mode === 'percentage'){
              turnToPercentage();
              

            }
            if(mode ==='comparison'){
              turnToComparison();
              
            }
            //if there is no scale, do not need to draw anything.
            if(!TypeUtils.isExist(valueScale)) {
              return;
            }
            eDispatch.startToInit();
            selection.each(function(){
              
            barNumber = (TypeUtils.isExist(data2)) ? 2 : 1;
            barHeight = 8 * (categoryScale.rangeBand()) / (9*barNumber +7 );
            
            barNumberinGroup = seriesData[0][0].length + ((TypeUtils.isExist(seriesData[0][1])) ? seriesData[0][1].length : 0);
          
          var barGroupNumber = seriesData.length;
            var svg = (gWrapper = d3.select(this));
            //append decorativeShape
              if(decorativeShape === null){
                if(isHorizontal){
                  decorativeShape = svg.append('rect').attr('width', width).attr('height',
                  categoryScale.rangeBand() - barHeight/2).attr('visibility', 'hidden').attr(
                      'fill', 'rgba(133,133,133, 0.2)');
                }
                else{
                  decorativeShape = svg.append('rect').attr('width', categoryScale.rangeBand() - barHeight/2).attr('height',
                  height).attr('visibility', 'hidden').attr(
                      'fill', 'rgba(133,133,133, 0.2)');  
                }
              }else{
                if(isHorizontal){
                  decorativeShape.attr('width', width).attr('height', categoryScale.rangeBand() - barHeight/2).attr('visibility', 'hidden');
                }
                else{
                  decorativeShape.attr('width', categoryScale.rangeBand() - barHeight/2).attr('height', height).attr('visibility', 'hidden');
                
                }
              }
              
              if(defsEnter === null){
              defsEnter = svg.append('defs').append('clipPath').append('rect').attr('width', width).attr('height', height);    
            }else{
              defsEnter.attr('width', width).attr('height', height);
            }  
              
            if(roundCornerDefs === null){      
              roundCornerDefs = svg.append('defs').attr('id', 'round-corner-clip' + suffix);
            }else{
              if( dataStructureChange || sizeChange || dataValueChange ){
                roundCornerDefs.remove();
                roundCornerDefs = svg.append('defs').attr('id', 'round-corner-clip' + suffix);
              }
            }    
            
            
            var datashapesgroup = svg.selectAll('g.datashapesgroup');
            if(!TypeUtils.isExist(datashapesgroup[0][0])){
              datashapesgroup = svg.append('g').attr('class', 'datashapesgroup');
            }
            
            var barGroup;
            if(enableDataLoadingAnimation && !isOnlyInitAnimation){
                barGroup = datashapesgroup.selectAll('g.bar').data(seriesData);       
                barGroup.enter().append('g');
                barGroup.attr('class','bar').each( function (perGroupData,i) {
            var barHeightInitial = isHorizontal? 8 * (rangeBounds[barGroupNumber - i -1]- rangeBounds[barGroupNumber - i]) / (9*barNumberinGroup +7 ):8 * (rangeBounds[i+1]- rangeBounds[i]) / (9*barNumberinGroup +7 );
            
            //2012-12-31 for roundcorner by yuanhao.
            var barFinalHeight = isHorizontal? rangeBounds[barGroupNumber - i -1]- rangeBounds[barGroupNumber - i] : rangeBounds[i+1]- rangeBounds[i];
            if( barFinalHeight > 1){
              barFinalHeight = barFinalHeight - 1;
            }
            var r = Math.log(barFinalHeight)/Math.log(2);
            if( r < 0 ){
              enableRoundCorner = false;
            } 
            var axisGroup = d3.select(this).selectAll('g.axisGroup').data(perGroupData);     
                    axisGroup.enter().append('g');
                    axisGroup.attr('class','axisGroup').each( function (perAxisData,j) {  
                      // This is for dual axis
                      
                      var fillingColor = axis1ColorPalette ;
                      var startPoint = barHeight /2;
                      var initStartPoint = categoryScale(i);

                      // This is for pos/neg values.
                      var positiveX = 0, negativeX = 0,  positiveStackedValue =  0, negativeStackedValue = 0;
                      var yArray = [],xArray = [];
                      // wrap a datashape g for each rect
                      var barShape = d3.select(this).selectAll('g.datashape').data(perAxisData);
                          barShape.enter().append('g').attr('class','datashape')

                          barShape.each(function(d){
                            var bar = d3.select(this).selectAll('rect').data([d]);
                            bar.enter().append('rect');
                            bar.exit().remove();
                          });
                          barShape.exit().remove();

                          if(afterAttachToDOM){
                            barShape.each(function(){
                              if(TypeUtils.isExist(this.getTransformToElement(this.parentNode))){
                                xArray.push(this.getTransformToElement(this.parentNode).e);
                                yArray.push(this.getTransformToElement(this.parentNode).f);
                              }else{
                                xArray.push(0);
                                yArray.push(0);
                              }

                            });
                          }
                          //transform for datashape
                          barShape.attr('transform', function (perRectData, k){
                            if(isHorizontal){
                              var y = height - rangeBounds[barGroupNumber - i - 1] ;
                              
                              var x;
                              if(perRectData.val >= 0){
                                
                                positiveX = valueScale(positiveStackedValue);
                                positiveStackedValue += perRectData.val;
                                x = positiveX;
                               }else{
                                negativeStackedValue += perRectData.val;
                                negativeX = valueScale(negativeStackedValue);
                               
                                x = negativeX;
                               }
                            }
                            //for vertical valueScale has been reversed.
                            else{
                              var x = rangeBounds[i];

                              var y ;
                              if(perRectData.val >= 0){
                                positiveStackedValue += perRectData.val;
                                positiveY = valueScale(positiveStackedValue);
                                
                                y = positiveY;
                               }else{
                                
                                negativeY = valueScale(negativeStackedValue);
                                negativeStackedValue += perRectData.val;
                                y = negativeY;
                               }
                            }
                             return 'translate('+x+','+y+')';
                          });

                      var bar = d3.select(this).selectAll('rect');
                        
                        bar.attr('fill', function(d,colorIndex){  
                          d.fillColor = fillingColor[colorIndex % fillingColor.length];
                          var parameter = {
                              drawingEffect:drawingEffect,
                              fillColor : d.fillColor,
                              direction : isHorizontal?'vertical': 'horizontal'
                          };
                          return effectManager.register(parameter);
                        }).attr('class', 'datapoint').attr('fill-opacity', 1);
                      
                      //If data structure change or data value change, we should do animation from beginning.
                      if(dataStructureChange){
                        if(isHorizontal){
                          bar.attr('height', barHeightInitial).attr('y', function (perRectData, m) {
                              return  barHeightInitial*m;
                             })
                             .attr('x', 0)
                             .attr('width', 0);
                           
                          //2012-12-31 by yuanhao for roundcorner
                          if(enableRoundCorner){
                            bar.attr('clip-path', function(perRectData, indexinGroup){
                              if(indexinGroup === negativeIndexes[j][i] || indexinGroup === positiveIndexes[j][i]){
                                var id = 'roundCorner-clip' + '-' + indexinGroup + i + j + suffix;
                                var roudCorner = roundCornerDefs.append('clipPath').attr('id', id)
                                                                .append('rect').attr('class', 'roundCorner-clip')
                                                                .attr('rx', r).attr('ry', r).attr('y', this.y.baseVal.value)
                                                                .attr('height', barHeightInitial).attr('width', 0)
                                                                .attr('x', this.x.baseVal.value)
                                                                .transition().duration(totalIntervalTime/2)
                                                                .attr('x',function(){
                                                                  if(indexinGroup === negativeIndexes[j][i] ){
                                                                    return 0;
                                                                  }else{
                                                                    return 0 -r;
                                                                  }
                                                                })
                                                                .attr('width',function(){
                                                                  return Math.abs(valueScale(perRectData.val) -  valueScale(0)) + r;
                                                                })
                                                                .transition().delay(totalIntervalTime/2).duration(totalIntervalTime/2)
                                                                .attr('height', barFinalHeight).attr('y', 0);
                                return 'url(#' + id + ')';
                              }
                            });
                          }

                           negativeStackedValue = 0;
                           bar.transition().duration(totalIntervalTime/2).attr('width', function(perRectData, m){
                            return Math.abs(valueScale(perRectData.val) -  valueScale(0));
                          }).attr('x', 0)
                            .transition().delay(totalIntervalTime/2).duration(totalIntervalTime/2).attr('height',function(perRectData , m){
                              var h = rangeBounds[barGroupNumber - i -1]- rangeBounds[barGroupNumber - i];
                              if(h > 1){
                              return rangeBounds[barGroupNumber - i -1]- rangeBounds[barGroupNumber - i] - 1;
                              }else{
                                return rangeBounds[barGroupNumber - i -1]- rangeBounds[barGroupNumber - i];
                              }})
                            .attr('y', 0)
                            .attr('width', function(perRectData, m){
                              return Math.abs(valueScale(perRectData.val) -  valueScale(0));
                            })
                            .each('end', function(perRectData, m){
                              if(i === 0 && m === barNumberinGroup - 1){
                                initialized();
                              }
                            });
                        }
                        else{
                          bar.attr('width', barHeightInitial).attr('x', function (perRectData, m) {
                              return  barHeightInitial*m;
                             })
                             .attr('y', function(perRectData, m){
                              return Math.abs(valueScale(perRectData.val) - valueScale(0));
                             })
                             .attr('height', 0);
                           
                           //2012-12-31 by yuanhao for roundcorner
                          if(enableRoundCorner){
                            bar.attr('clip-path', function(perRectData, indexinGroup){
                              if(indexinGroup === negativeIndexes[j][i] || indexinGroup === positiveIndexes[j][i]){
                                var id = 'roundCorner-clip' + '-' + indexinGroup + i + j + suffix;
                                var roudCorner = roundCornerDefs.append('clipPath').attr('id', id)
                                                                .append('rect').attr('class', 'roundCorner-clip')
                                                                .attr('rx', r).attr('ry', r).attr('y', this.y.baseVal.value)
                                                                .attr('width', barHeightInitial).attr('height', 0)
                                                                .attr('x', this.x.baseVal.value)
                                                                .transition().duration(totalIntervalTime/2)
                                                                .attr('y',function(){
                                                                  if(indexinGroup === negativeIndexes[j][i] ){
                                                                    return 0 -r;
                                                                  }else{
                                                                    return 0;
                                                                  }
                                                                })
                                                                .attr('height',function(){
                                                                  return Math.abs(valueScale(perRectData.val) -  valueScale(0)) + r;
                                                                })
                                                                .transition().delay(totalIntervalTime/2).duration(totalIntervalTime/2)
                                                                .attr('width', barFinalHeight).attr('x', 0);
                                return 'url(#' + id + ')';
                              }
                            });
                          }

                           negativeStackedValue = 0;
                           bar.transition().duration(totalIntervalTime/2).attr('height', function(perRectData, m){
                            return Math.abs(valueScale(perRectData.val) -  valueScale(0));
                          }).attr('y', 0)
                            .transition().delay(totalIntervalTime/2).duration(totalIntervalTime/2).attr('width',function(perRectData , m){
                              var w = rangeBounds[i + 1]- rangeBounds[i];
                              if(w > 1){
                              return rangeBounds[i + 1]- rangeBounds[i] - 1;
                              }else{
                                return rangeBounds[i + 1]- rangeBounds[i];
                              }})
                            .attr('x', 0)
                            .attr('height', function(perRectData, m){
                              return Math.abs(valueScale(perRectData.val) -  valueScale(0));
                            })
                            .each('end', function(perRectData, m){
                              if(i === 0 && m === barNumberinGroup - 1){
                                initialized();
                              }
                            });
                        }
                      }
                      //if datavalue change , we need put the x,y,width ,height to last postion
                      else if( dataValueChange){
                        bar.attr('x',function(d,k){
                          return xArray[k] - this.parentNode.getTransformToElement(this.parentNode.parentNode).e;
                        })
                        .attr('y',function(d,k){
                          return yArray[k] - this.parentNode.getTransformToElement(this.parentNode.parentNode).f;
                        });
                        var barTransition = bar.transition();
                        if(isHorizontal){
                          barTransition.duration(totalIntervalTime/2)
                          .attr('width', function(perRectData, m){
                             return Math.abs(valueScale(perRectData.val) -  valueScale(0));
                           })
                           .attr('x', 0)
                          .attr('height',function(perRectData , m){
                            var h = rangeBounds[barGroupNumber - i -1]- rangeBounds[barGroupNumber - i];
                            if(h > 1){
                              return rangeBounds[barGroupNumber - i -1]- rangeBounds[barGroupNumber - i] - 1;
                            }else{
                              return rangeBounds[barGroupNumber - i -1]- rangeBounds[barGroupNumber - i];
                            }
                          })
                          .attr('y', 0)
                          .each('end', function(perRectData, m){
                            if(i === 0 && m === barNumberinGroup - 1){
                              initialized();
                            }
                          });
                          //2012-12-31 by yuanhao for roundcorner
                          if(enableRoundCorner){
                            barTransition.attr('clip-path', function(perRectData, indexinGroup){
                              if(indexinGroup === negativeIndexes[j][i] || indexinGroup === positiveIndexes[j][i]){
                                var id = 'roundCorner-clip' + '-' + indexinGroup + i + j + suffix;
                                var x = parseFloat(this.x.baseVal.value) ;
                                var roundCorner = roundCornerDefs.append('clipPath').attr('id', id)
                                          .append('rect').attr('class', 'roundCorner-clip')
                                          .attr('rx', r).attr('ry', r).attr('height',this.height.baseVal.value).attr('width', this.width.baseVal.value + r)
                                          .attr('x', function(){
                                            return x - ((indexinGroup === negativeIndexes[j][i]) ? 0 : r);
                                          })
                                          .attr('y',this.y.baseVal.value)
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
                                          .attr('height',barFinalHeight).attr('y',0);  
                                return 'url(#' + id + ')' ;
                              }
                            });
                          }
                        }
                        else{
                          barTransition.duration(totalIntervalTime/2)
                          .attr('height', function(perRectData, m){
                             return Math.abs(valueScale(perRectData.val) -  valueScale(0));
                           })
                           .attr('y', 0)
                          .attr('width',function(perRectData , m){
                            var w = rangeBounds[i + 1]- rangeBounds[i];
                            if(w > 1){
                              return rangeBounds[i + 1]- rangeBounds[i] - 1;
                            }else{
                              return rangeBounds[i + 1]- rangeBounds[i];
                            }
                          })
                          .attr('x', 0)
                          .each('end', function(perRectData, m){
                            if(i === 0 && m === barNumberinGroup - 1){
                              initialized();
                            }
                          });
                          //2012-12-31 by yuanhao for roundcorner
                          if(enableRoundCorner){
                            barTransition.attr('clip-path', function(perRectData, indexinGroup){
                              if(indexinGroup === negativeIndexes[j][i] || indexinGroup === positiveIndexes[j][i]){
                                var id = 'roundCorner-clip' + '-' + indexinGroup + i + j + suffix;
                                var y = parseFloat(this.y.baseVal.value) ;
                                var roundCorner = roundCornerDefs.append('clipPath').attr('id', id)
                                          .append('rect').attr('class', 'roundCorner-clip')
                                          .attr('rx', r).attr('ry', r).attr('width',this.width.baseVal.value).attr('height', this.height.baseVal.value + r)
                                          .attr('y', function(){
                                            return y - ((indexinGroup === negativeIndexes[j][i]) ? r : 0);
                                          })
                                          .attr('x',this.x.baseVal.value)
                                          .transition().duration(totalIntervalTime/2)
                                          .attr('y',function(){
                                            if(indexinGroup === negativeIndexes[j][i]){
                                              return 0 - r;
                                            }else{
                                              return 0 ;
                                            }
                                          })
                                          .attr('height', function(){
                                             return Math.abs(valueScale(perRectData.val) - valueScale(0)) + r;
                                          })
                                          .attr('width',barFinalHeight).attr('x',0);  
                                return 'url(#' + id + ')' ;
                              }
                            });
                          }
                        }
                      }
                      //if plot container size change, we should update x, y, width, height of bar rects.
                      //The behavour of value change is not same as bar's, in mekko, it also has to change
                      //x, y, width, height of bar rects.
                      else if(sizeChange){
                        if(isHorizontal){
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
                          var barTransition = bar.transition();
                          barTransition.duration(totalIntervalTime/2)
                          .attr('width', function(perRectData, m){
                             return Math.abs(valueScale(perRectData.val) -  valueScale(0));
                           })
                          .attr('x', 0)
                          .attr('height',function(perRectData , m){
                            var h = rangeBounds[barGroupNumber - i -1]- rangeBounds[barGroupNumber - i];
                            if(h > 1){
                              return rangeBounds[barGroupNumber - i -1]- rangeBounds[barGroupNumber - i] - 1;
                            }else{
                              return rangeBounds[barGroupNumber - i -1]- rangeBounds[barGroupNumber - i];
                            }
                          })
                          .attr('y', 0)
                          .each('end', function(perRectData, m){
                            if(i === 0 && m === barNumberinGroup - 1){
                              initialized();
                            }
                          });
                          //2012-12-31 by yuanhao for roundcorner
                          if(enableRoundCorner){
                            barTransition.attr('clip-path', function(perRectData, indexinGroup){
                              if(indexinGroup === negativeIndexes[j][i] || indexinGroup === positiveIndexes[j][i]){
                                var id = 'roundCorner-clip' + '-' + indexinGroup + i + j + suffix;
                                var x = parseFloat(this.x.baseVal.value) ;
                                var roundCorner = roundCornerDefs.append('clipPath').attr('id', id)
                                          .append('rect').attr('class', 'roundCorner-clip')
                                          .attr('rx', r).attr('ry', r).attr('height',this.height.baseVal.value).attr('width', this.width.baseVal.value + r)
                                          .attr('x', function(){
                                            return x - ((indexinGroup === negativeIndexes[j][i]) ? 0 : r);
                                          })
                                          .attr('y',this.y.baseVal.value)
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
                                          .attr('height',barFinalHeight).attr('y',0);  
                                return 'url(#' + id + ')' ;
                              }
                            });
                          }
                        }
                        else{
                          bar.attr('y',function(d,k){
                            return yArray[k] - this.parentNode.getTransformToElement(this.parentNode.parentNode).f;
                          })
                          .attr('height', function(perRectData){
                           var newHeight = Math.abs(valueScale(perRectData.val) - valueScale(0));
                           if(parseFloat(this.height.baseVal.value) > newHeight){
                             return this.height.baseVal.value;
                           }else{
                             return newHeight;
                           }
                          });
                          var barTransition = bar.transition();
                          barTransition.duration(totalIntervalTime/2)
                          .attr('height', function(perRectData, m){
                             return Math.abs(valueScale(perRectData.val) -  valueScale(0));
                           })
                          .attr('y', 0)
                          .attr('width',function(perRectData , m){
                            var w = rangeBounds[i + 1]- rangeBounds[i];
                            if(w > 1){
                              return rangeBounds[i + 1]- rangeBounds[i] - 1;
                            }else{
                              return rangeBounds[i + 1]- rangeBounds[i];
                            }
                          })
                          .attr('x', 0)
                          .each('end', function(perRectData, m){
                            if(i === 0 && m === barNumberinGroup - 1){
                              initialized();
                            }
                          });
                          //2012-12-31 by yuanhao for roundcorner
                          if(enableRoundCorner){
                            barTransition.attr('clip-path', function(perRectData, indexinGroup){
                              if(indexinGroup === negativeIndexes[j][i] || indexinGroup === positiveIndexes[j][i]){
                                var id = 'roundCorner-clip' + '-' + indexinGroup + i + j + suffix;
                                var y = parseFloat(this.y.baseVal.value) ;
                                var roundCorner = roundCornerDefs.append('clipPath').attr('id', id)
                                          .append('rect').attr('class', 'roundCorner-clip')
                                          .attr('rx', r).attr('ry', r).attr('width',this.width.baseVal.value).attr('height', this.height.baseVal.value + r)
                                          .attr('y', function(){
                                            return y - ((indexinGroup === negativeIndexes[j][i]) ? r : 0);
                                          })
                                          .attr('x',this.x.baseVal.value)
                                          .transition().duration(totalIntervalTime/2)
                                          .attr('y',function(){
                                            if(indexinGroup === negativeIndexes[j][i]){
                                              return 0 - r;
                                            }else{
                                              return 0 ;
                                            }
                                          })
                                          .attr('height', function(){
                                             return Math.abs(valueScale(perRectData.val) - valueScale(0)) + r;
                                          })
                                          .attr('width',barFinalHeight).attr('x',0);  
                                return 'url(#' + id + ')' ;
                              }
                            });
                          }
                        }
                      }
                      //if modeChange we just adjust the x of bar to last postion
                      else if(modeChange){
                        if(isHorizontal){
                          bar.attr('x',function(d,k){
                          return xArray[k] - this.parentNode.getTransformToElement(this.parentNode.parentNode).e;
                          });
                          var barTransition = bar.transition();
                          barTransition.duration(totalIntervalTime/2)
                          .attr('width', function(perRectData, m){
                             return Math.abs(valueScale(perRectData.val) -  valueScale(0));
                           })
                           .attr('x', 0)
                          .attr('height',function(perRectData , m){
                            var h = rangeBounds[barGroupNumber - i -1]- rangeBounds[barGroupNumber - i];
                            if(h > 1){
                              return rangeBounds[barGroupNumber - i -1]- rangeBounds[barGroupNumber - i] - 1;
                            }else{
                              return rangeBounds[barGroupNumber - i -1]- rangeBounds[barGroupNumber - i];
                            }
                          })
                          .attr('y', 0)
                          .each('end', function(perRectData, m){
                            if(i === 0 && m === barNumberinGroup - 1){
                              initialized();
                            }
                          });
                          //2012-12-31 by yuanhao for roundcorner
                          if(enableRoundCorner){
                            barTransition.attr('clip-path', function(perRectData, indexinGroup){
                              if(indexinGroup === negativeIndexes[j][i] || indexinGroup === positiveIndexes[j][i]){
                                var id = 'roundCorner-clip' + '-' + indexinGroup + i + j + suffix;
                                var x = parseFloat(this.x.baseVal.value) ;
                                var roundCorner = roundCornerDefs.append('clipPath').attr('id', id)
                                          .append('rect').attr('class', 'roundCorner-clip')
                                          .attr('rx', r).attr('ry', r).attr('height',this.height.baseVal.value).attr('width', this.width.baseVal.value + r)
                                          .attr('x', function(){
                                            return x - ((indexinGroup === negativeIndexes[j][i]) ? 0 : r);
                                          })
                                          .attr('y',this.y.baseVal.value)
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
                                          .attr('height',barFinalHeight).attr('y',0);  
                                return 'url(#' + id + ')' ;
                              }
                            });
                          }
                        }
                        else{
                          bar.attr('y',function(d,k){
                          return yArray[k] - this.parentNode.getTransformToElement(this.parentNode.parentNode).f;
                          });
                          var barTransition = bar.transition();
                          barTransition.duration(totalIntervalTime/2)
                          .attr('height', function(perRectData, m){
                             return Math.abs(valueScale(perRectData.val) -  valueScale(0));
                           })
                           .attr('y', 0)
                          .attr('width',function(perRectData , m){
                            var w = rangeBounds[i + 1]- rangeBounds[i];
                            if(w > 1){
                              return rangeBounds[i + 1]- rangeBounds[i] - 1;
                            }else{
                              return rangeBounds[i + 1]- rangeBounds[i];
                            }
                          })
                          .attr('x', 0)
                          .each('end', function(perRectData, m){
                            if(i === 0 && m === barNumberinGroup - 1){
                              initialized();
                            }
                          });
                          //2012-12-31 by yuanhao for roundcorner
                          if(enableRoundCorner){
                            barTransition.attr('clip-path', function(perRectData, indexinGroup){
                              if(indexinGroup === negativeIndexes[j][i] || indexinGroup === positiveIndexes[j][i]){
                                var id = 'roundCorner-clip' + '-' + indexinGroup + i + j + suffix;
                                var y = parseFloat(this.y.baseVal.value) ;
                                var roundCorner = roundCornerDefs.append('clipPath').attr('id', id)
                                          .append('rect').attr('class', 'roundCorner-clip')
                                          .attr('rx', r).attr('ry', r).attr('width',this.width.baseVal.value).attr('height', this.height.baseVal.value + r)
                                          .attr('y', function(){
                                            return y - ((indexinGroup === negativeIndexes[j][i]) ? r : 0);
                                          })
                                          .attr('x',this.x.baseVal.value)
                                          .transition().duration(totalIntervalTime/2)
                                          .attr('y',function(){
                                            if(indexinGroup === negativeIndexes[j][i]){
                                              return 0 - r;
                                            }else{
                                              return 0 ;
                                            }
                                          })
                                          .attr('height', function(){
                                             return Math.abs(valueScale(perRectData.val) - valueScale(0)) + r;
                                          })
                                          .attr('width',barFinalHeight).attr('x',0);  
                                return 'url(#' + id + ')' ;
                              }
                            });
                          }
                        }
                      }
                      
                      //bar.exit().remove();  //Nick                
                    });
                  axisGroup.exit().remove();
                });
                barGroup.exit().remove();
                if(!enableDataUpdatingAnimation){
                  isOnlyInitAnimation = true;
                }
              }else{
                barGroup = svg.selectAll('g.bar').data(seriesData);     
                barGroup.enter().append('g');
                barGroup.attr('class','bar').each( function (perGroupData,i) {
                var barFinalHeight = isHorizontal? rangeBounds[barGroupNumber - i -1]- rangeBounds[barGroupNumber - i] : rangeBounds[i+1]- rangeBounds[i];
                if( barFinalHeight > 1){
                  barFinalHeight = barFinalHeight - 1;
                }
                var r = Math.log(barFinalHeight)/Math.log(2);
                if( r < 0 ){
                  enableRoundCorner = false;
                } 
                var axisGroup = d3.select(this).selectAll('g.axisGroup').data(perGroupData);     
                  axisGroup.enter().append('g');
                  axisGroup.attr('class','axisGroup').each( function (perAxisData,j) {
                    
                    
                    var fillingColor =  axis1ColorPalette;
                    var positiveX = 0, negativeX = 0,  positiveStackedValue =  0, negativeStackedValue = 0;
                    var positiveIndex = 0, negativeIndex = -1;
                    var yArray = [] ,xArray = [];
                    
                    // wrap a datashape g for each rect
                    var barShape = d3.select(this).selectAll('g.datashape').data(perAxisData);
                        barShape.enter().append('g').attr('class','datashape')
                        barShape.each(function(d){
                          var bar = d3.select(this).selectAll('rect').data([d]);
                          bar.enter().append('rect');
                          bar.exit().remove();
                        });
                        barShape.exit().remove();

                        
                        //transform for datashape
                        barShape.attr('transform', function (perRectData, k){
                            if(isHorizontal){
                              var y = height - rangeBounds[barGroupNumber - i - 1] ;
                              
                              var x;
                              if(perRectData.val >= 0){
                                
                                positiveX = valueScale(positiveStackedValue);
                                positiveStackedValue += perRectData.val;
                                x = positiveX;
                               }else{
                                negativeStackedValue += perRectData.val;
                                negativeX = valueScale(negativeStackedValue);
                               
                                x = negativeX;
                               }
                            }
                            //for vertical valueScale has been reversed.
                            else{
                              var x = rangeBounds[i];

                              var y ;
                              if(perRectData.val >= 0){
                                positiveStackedValue += perRectData.val;
                                positiveY = valueScale(positiveStackedValue);
                                
                                y = positiveY;
                               }else{
                                
                                negativeY = valueScale(negativeStackedValue);
                                negativeStackedValue += perRectData.val;
                                y = negativeY;
                               }
                            }
                             return 'translate('+x+','+y+')';
                          });
                        var bar = d3.select(this).selectAll('rect');
                    
                        if(isHorizontal){
                          bar.attr('width', function(perRectData, m){
                           return Math.abs(valueScale(perRectData.val) -  valueScale(0));
                           })
                          .attr('x', 0)
                          .attr('height',function(perRectData , m){
                            var h = rangeBounds[barGroupNumber - i -1]- rangeBounds[barGroupNumber - i];
                            if(h > 1){
                              return rangeBounds[barGroupNumber - i -1]- rangeBounds[barGroupNumber - i] - 1;
                            }else{
                              return rangeBounds[barGroupNumber - i -1]- rangeBounds[barGroupNumber - i];
                            }})
                          .attr('y', 0)
                          .attr('fill', function(d,colorIndex){  
                            d.fillColor = fillingColor[colorIndex % fillingColor.length];
                            var parameter = {
                              drawingEffect:drawingEffect,
                              fillColor : d.fillColor,
                              direction : 'vertical'
                            };
                          return effectManager.register(parameter);
                           })
                           .attr('class', 'datapoint').attr('fill-opacity', 1);
                            //2012-12-31 by yuanhao for roundcorner
                          if(enableRoundCorner){
                            bar.attr('clip-path', function(perRectData, indexinGroup){
                              if(indexinGroup === negativeIndexes[j][i] || indexinGroup === positiveIndexes[j][i]){
                                var id = 'roundCorner-clip' + '-' + indexinGroup + i + j + suffix;
                                var roudCorner = roundCornerDefs.append('clipPath').attr('id', id)
                                                                .append('rect').attr('class', 'roundCorner-clip')
                                                                .attr('rx', r).attr('ry', r)
                                                                .attr('x',function(){
                                                                  if(indexinGroup === negativeIndexes[j][i] ){
                                                                    return 0;
                                                                  }else{
                                                                    return 0 -r;
                                                                  }
                                                                })
                                                                .attr('width',function(){
                                                                  return Math.abs(valueScale(perRectData.val) -  valueScale(0)) + r;
                                                                })
                                                                .attr('height', barFinalHeight).attr('y', 0);
                                return 'url(#' + id + ')';
                              }
                            });
                          }

                         }
                         else{
                          bar.attr('height', function(perRectData, m){
                           return Math.abs(valueScale(perRectData.val) -  valueScale(0));
                           })
                          .attr('x', 0)
                          .attr('width',function(perRectData , m){
                            var w = rangeBounds[i + 1]- rangeBounds[i];
                            if(w > 1){
                              return rangeBounds[i + 1]- rangeBounds[i] - 1;
                            }else{
                              return rangeBounds[i + 1]- rangeBounds[i];
                            }
                          })
                          .attr('y', 0)
                          .attr('fill', function(d,colorIndex){  
                            d.fillColor = fillingColor[colorIndex % fillingColor.length];
                            var parameter = {
                              drawingEffect:drawingEffect,
                              fillColor : d.fillColor,
                              direction : 'horizontal'
                            };
                          return effectManager.register(parameter);
                           })
                           .attr('class', 'datapoint').attr('fill-opacity', 1);
                            //2012-12-31 by yuanhao for roundcorner
                          if(enableRoundCorner){
                            bar.attr('clip-path', function(perRectData, indexinGroup){
                              if(indexinGroup === negativeIndexes[j][i] || indexinGroup === positiveIndexes[j][i]){
                                var id = 'roundCorner-clip' + '-' + indexinGroup + i + j + suffix;
                                var roudCorner = roundCornerDefs.append('clipPath').attr('id', id)
                                                                .append('rect').attr('class', 'roundCorner-clip')
                                                                .attr('rx', r).attr('ry', r)
                                                                .attr('y',function(){
                                                                  if(indexinGroup === negativeIndexes[j][i] ){
                                                                    return 0 - r;
                                                                  }else{
                                                                    return 0 ;
                                                                  }
                                                                })
                                                                .attr('height',function(){
                                                                  return Math.abs(valueScale(perRectData.val) -  valueScale(0)) + r;
                                                                })
                                                                .attr('width', barFinalHeight).attr('x', 0);
                                return 'url(#' + id + ')';
                              }
                            });
                          }
                         }
                      });
                    axisGroup.exit().remove();
                  });        
                barGroup.exit().remove();
            }
            
            sizeChange = false, dataValueChange = false, dataStructureChange = false;
            });
            
            if(!enableDataLoadingAnimation || !enableDataUpdatingAnimation){
              initialized();
            }
            
            return chart;
          }
        
        chart.hoverOnPoint = function(point){
          var xOnModule = point.x, yOnModule = point.y;
          // find the closet dimension
          var i = 0, len = rangeBounds.length -1, currentBound = 0;
          if(isHorizontal){
            while (i < len ) {
              if (yOnModule >= (height - rangeBounds[i]) && yOnModule < (height - rangeBounds[i+1])) {
                currentBound = rangeBounds[i] - rangeBounds[i+1];
                break;
              };
              i++;
            }
          }else{
            while (i < len ) {
              if (xOnModule >= (rangeBounds[i]) && xOnModule < (rangeBounds[i+1])) {
                currentBound = rangeBounds[i+1] - rangeBounds[i];
                break;
              };
              i++;
            }
          }
          if (i > (seriesData.length - 1) || i < 0) {
            decorativeShape.attr(
                'visibility', 'hidden');
            return;
          }
          
          if(isHorizontal){
            decorativeShape.attr(
              'y', height - rangeBounds[i]).attr(
              'visibility', 'visible').attr('height', currentBound);
          }else{
            decorativeShape.attr(
              'x', rangeBounds[i]).attr(
              'visibility', 'visible').attr('width', currentBound);
          }
          if(i !== lastHovered){
            if (tooltipVisible) {
              lastHovered = i;
              //this.parentNode.parentNode.parentNode point to the main container
              var transform = gWrapper[0][0].getTransformToElement(gWrapper[0][0].ownerSVGElement);
              var yoffset = transform.f;
              var xoffset = transform.e;
              var tData = isHorizontal? generateTooltipData(barGroupNumber - i -1): generateTooltipData(i);
              
              tData.point = {
                  x: isHorizontal? d3.event.layerX : rangeBounds[i] + currentBound/2 + xoffset,
                  y: isHorizontal? height - rangeBounds[i] + currentBound/2 + yoffset: d3.event.layerY
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
        
        var generateTooltipData = function(aai1){
        var tData = {
          'body' : [],
          'footer' : []
        };
        var a0data = data.getAnalysisAxisDataByIdx(0).values;

        var g0data = data.getMeasureValuesGroupDataByIdx(0).values;
        var g1data = data.getMeasureValuesGroupDataByIdx(1).values;
        // have two analysis
        if( TypeUtils.isExist(data.getAnalysisAxisDataByIdx(1)) ){
          var a1data = data.getAnalysisAxisDataByIdx(1).values;
        }
        //make up body data
        var elemcount = tooltipData[0][0].length;
        
        for(var i = 0, ilen = g0data.length; i < ilen; i++){
          var tbody = {}, rows = [];
          tbody.name = g0data[i].col;
          tbody.val = rows;
          for(var j = 0; j < elemcount; j++){
            var label = '';
            if(TypeUtils.isExist(a1data)){
              for(var t = 0, tlen = a1data.length;  t < tlen; t++){
                if(t === 0){
                  label += a1data[t].rows[j].val;
                }else{
                  label += ' / ' + a1data[t].rows[j].val;
                }
                
              }
            }
            rows.push({
              value: tooltipData[aai1][0][j].isNaN ? defaultString : tooltipData[aai1][0][j].val,  
              label: label,
              shape: 'squareWithRadius',
              color: colorPalette[j]
            });
          }
          
          tData.body.push(tbody);
        }


      //make up body data
        //from d1data
        var tbody = {}, rows = [];
        tbody.name = g1data[0].col;
        tbody.val = rows;
        rows.push({
          value:TypeUtils.isExist( rangeSum[aai1] ) ? rangeSum[aai1] : defaultString,
          valueAxis: 1
        });
        tData.body.push(tbody);
      
      //from a0data
      for(var i =0, len = a0data.length; i < len; i++){
        var footer = {};
        footer.label = a0data[i].col.val;
        footer.value = a0data[i].rows[aai1].val;
        
        tData.footer.push(footer);
      }
        
      return tData;
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
        function turnToComparison(){
          var obj = ObjectUtils.extend(true, {}, MNDHandler(data));
                   
          var _data1 = obj["MG1"];
          var _data2 = obj["MG2"];
          measureOnAxis1 = obj.MG1Number;
          tooltipData = [];
          
          var _seriesData = dataHandler(_data1, null, obj.color);
           
          
          seriesData = _seriesData;
          data1 = _data1;
          data2 = _data2;
          
          tooltipData = ObjectUtils.extend(true, {}, seriesData); 
        }

        function initialized(){
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
        
            makeScales();
          
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
        
            makeScales();
          
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
          var obj = ObjectUtils.extend(true, {}, MNDHandler(data));
                   
          var _data1 = obj["MG1"];
          var _data2 = obj["MG2"];
          measureOnAxis1 = obj.MG1Number;
          tooltipData = [];
          
          var _seriesData = dataHandler(_data1, null, obj.color);
          
          if(data1.length !== _data1.length || data1[0].length !== _data1[0].length){
              dataStructureChange = true;
          }else{
            dataValueChange = true;
          }
          
          seriesData = _seriesData;
          data1 = _data1;
          data2 = _data2;
          
      tooltipData = ObjectUtils.extend(true, {}, seriesData); 
          
          
        
      makeScales();
          
        
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
          
          makeScales();
          
          return chart;        
      };
         
      //adjust domain and rangebouds, for all no_value or zero value
      var adjustScale = function( rangeBounds){
        for(var i = 0; i< rangeBounds.length ;i++){
          if(!NumberUtils.isNoValue(rangeBounds[i]) && rangeBounds[i] != 0 )
            return;
        }

        for(var i = 1; i< rangeBounds.length ;i++){
            rangeBounds[i] = i*(isHorizontal? height / (rangeBounds.length -1) : width /(rangeBounds.length -1));
        }
      }
      var makeScales = function(){
        if(TypeUtils.isExist(width) && TypeUtils.isExist(height)&& TypeUtils.isExist(seriesData)){
            var domain = [], total = 0, tempsum = 0;
            rangeBounds = [], rangeSum = [],  rangeBounds[0] = 0;
            var rows = dimensionData['sap.viz.modules.mekko.dimension'].values[0].rows = [];
            dimensionData['sap.viz.modules.mekko.dimension'].values[0].col.val = data.getMeasureValuesGroupDataByIdx(1).values[0].col;
            for (var i=0, len = data2.length; i < len; i++){
              for(var j = 0; j< data2[i].length; j++){
                
                if(TypeUtils.isExist(rangeSum[j])){
                  rangeSum[j] += data2[i][j].val;
                }
                else{
                  rangeSum[j] = data2[i][j].val;
                }
              }
            }
            for (var i = 0 ,len = rangeSum.length; i < len; i++){
              domain.push(i);
              total += rangeSum[i] > 0? rangeSum[i] : (0 - rangeSum[i]);
            }  
            for(var j =0, len = rangeSum.length; tempsum += Math.abs(rangeSum[j]), j<len; j++){
              tempsum = parseFloat(tempsum.toFixed(8));
              rangeBounds[j+1] = total==0? null : Math.abs(isHorizontal? tempsum/total*height : tempsum/total*width);
              rows.push({
                val : TypeUtils.isExist( rangeSum[j] ) ? rangeSum[j] : defaultString
              });
            }
            //adjust domain and rangebouds, for all no_value or zero value
            adjustScale(rangeBounds);
            //if is horizontal we need to reverse the categoryScale, otherwise we need to reverse the valueScale
            if(isHorizontal){
              
              categoryScale.domain(domain).range(rangeBounds.reverse());
              if(mode === 'percentage'){                
                valueScale.domain([0,1]).range([0, width]).nice();
                Scaler.perfect(valueScale);
              }else{
                //when all data is 0 or null, we make domain (0,1)
                if( primaryAxisBottomBoundary === 0 && primaryAxisTopBoundary === 0){
                  valueScale.domain([0,1]).range([0, width]).nice();
                }else{
                  valueScale.domain([primaryAxisBottomBoundary,primaryAxisTopBoundary]).range([0, width]).nice();
                }
                Scaler.perfect(valueScale);
              }
            }else{
              categoryScale.domain(domain).range(rangeBounds);
              if(mode === 'percentage'){
                valueScale.domain([1,0]).range([0, height]).nice();
                Scaler.perfect(valueScale);
              }else{
                if( primaryAxisBottomBoundary === 0 && primaryAxisTopBoundary === 0){
                  valueScale.domain([1, 0]).range([0, height]).nice();                 
                }else{
                  valueScale.domain([primaryAxisTopBoundary, primaryAxisBottomBoundary]).range([0, height]).nice();
                }
                Scaler.perfect(valueScale);
              }
            }
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
            return categoryScale;
         }
          categoryScale = scale;
         return chart;
      };
      
      chart.dimensionData = function(_){
        if(!arguments.length){
          return dimensionData;
        }
        dimensionData = _;
        return chart;
      };
      
      chart.secondCategoryScale = function(){
        if(!arguments.length){
          return categoryScale;
        }
        categoryScale = _;
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
        primaryAxisTopBoundary = range.max;
        primaryAxisBottomBoundary = range.min;
        
        makeScales();
        
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
        secondaryAxisTopBoundary = range.max;
        secondaryAxisBottomBoundary = range.min;
        
        makeScales();
        
        return chart;
      }; 
         
      chart.primaryScale = function(scale){
          if (!arguments.length){
            return valueScale;
         }
          valueScale = scale;
         return chart;
      };       

        chart.primaryAxisColor = function(){
            //as in mekko, it does not has MND feed, so always return undefined.
            return undefined;
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
                valueAxis1Data[i][j].val = 0;
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
                valueAxis2Data[i][j].val = 0;
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
    return mekko;
});