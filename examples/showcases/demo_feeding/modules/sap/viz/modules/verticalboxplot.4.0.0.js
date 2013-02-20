sap.riv.module(
{
  qname : 'sap.viz.modules.verticalboxplot',
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
{  qname : 'sap.viz.util.ColorSeriesGenerator',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Scaler',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.NumberUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.tooltipDataHandler',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.BoundUtil',
  version : '4.0.0'
}
],
function Setup(TypeUtils, dispatch, MNDHandler, ColorSeries, Scaler, NumberUtils, langManager,tooltipDataHandler, Objects, boundUtil) {
  var boxplot = function(manifest, ctx) {

    var sWrapper = null, 
      dimensionGroup = [], 
      dimensionDomain = [], 
      seriesData = [], 
      legendData = [], 
      regionData = [], 
      dimensionData = [], 
      boxplotData = [],
      colorPalette = [],
      boxColorPalette = [],
      _data = null; 
    var  dimensions = {
        'sap.viz.modules.verticalboxplot.dimension' : {
                'key' : 'sap.viz.modules.verticalboxplot.dimension',
                'values' : null
        }
      };

    var width = undefined, 
      height = undefined, 
      xScale = d3.scale.ordinal(), 
      yScale = d3.scale.linear(), 
      xDimensionScale = d3.scale.ordinal(),
      decorativeShape,
      boxWidth,
      lastHovered = null,
      tooltipVisible = true,
      scaleMinMax = {
          min: 0,
          max: 0
      },
      effectManager = ctx.effectManager,
      drawingEffect = 'normal',
      defaultString = langManager.get('IDS_ISNOVALUE');
    
        var _properties = {},
          eDispatch = new dispatch('showTooltip', 'hideTooltip', 'initialized');
    
    var outLierLayout = {
      width : '1',
      color : '#000000'
    };

    var quartileLayout = {
      width: '0',
      midLineColor: '#000000'
    };
    
    var lowOutLiersObj = [], highOutLiersObj = [], whiskersObj = [], lowWhiskerObj = [], highWhiskerObj = [], quartilesObj = [], outLiersObj = [];
    
    var makeScales = function() {
      var domain = [];
      for ( var i = 0; i < seriesData.length; i++) {
        domain.push(i);
      }
      //when all data is 0 or null ,we should make yScale.domain from 0 to 1
      xScale.domain(domain).rangeBands([0, width]);
      xDimensionScale.domain(dimensionDomain).rangeBands([0, width]);   
      if(!scaleMinMax || (scaleMinMax.min === 0 && scaleMinMax.max === 0)){
        yScale.domain([ 0, 1 ]).range([ height, 0 ]).nice();

      } else{
        yScale.domain([ scaleMinMax.min, scaleMinMax.max ]).range([ height, 0 ]).nice();

      }
      Scaler.perfect(yScale);

    };
    
    chart.dimensionData = function(_)
    {
      if (!arguments.length){
        return dimensions;
      }
      dimensions = _;
      return chart;    
    };
    
    function locateBoundary(data) {
      
      if (TypeUtils.isExist(data)) {
        length = data.length;
        var firstLoop = false;
        for (var i = 0; i < length; i++) {
          
          if (data[i].length > 0) {
            if (!firstLoop) {
              scaleMinMax = findMinMax(data[i]);
              firstLoop = true;
            } else {
              var tmp = findMinMax(data[i]);
              if (tmp) {
                if (tmp.min < scaleMinMax.min) {
                  scaleMinMax.min = tmp.min;
                }
                if (tmp.max > scaleMinMax.max) {
                  scaleMinMax.max = tmp.max;
                }
              }
              
            }
          }
        }
      }
      
    }
    
    function findMinMax(range) {
      var minMax = {min:0, max:0};
      if (TypeUtils.isExist(range)) {
        range.sort( function(aObj, bObj) { return aObj.val - bObj.val; });
        
        minMax = {min: range[0].val, max: range[range.length - 1].val};
      }
      return minMax;
    }

    function clearBoxData() {
      lowOutLiersObj = [];
      highOutLiersObj = [];
      whiskersObj = [];
      lowWhiskerObj = [];
      highWhiskerObj = [];
      quartilesObj = [];
      outLiersObj = [];
    }
    
    function clearGlobalData() {
      dimensionGroup = []; 
      dimensionDomain = []; 
      seriesData = []; 
      legendData = []; 
      regionData = []; 
      dimensionData = []; 
      boxplotData = []; 
    }

    function even(n) {
      return (n & 1) == 0;
    }

    function median(distribution, start, end) {
      var n = end - start + 1;
      if (n <= 0)
        return -1;

      var ret;
      var ctxValue = distribution[start + Math.floor((n + 1) / 2) - 1].ctx;

      if (even(n)) {
        ret = (distribution[start + Math.floor((n + 1) / 2) - 1].val + distribution[start
            + Math.floor((n + 1) / 2)].val) / 2;
      } else {
        ret = distribution[start + Math.floor((n + 1) / 2) - 1].val;
      }
      return {
        'ctx' : ctxValue,
        'val' : ret
      };
    }

    function setDistribution(distribution) {

      if (distribution && distribution.length > 0) {
        var n = distribution.length,
          box = {
            'Maximum:': null,
            '3rd Quartile:': null,
            'Median:': null,
            '1st Quartile:': null,
            'Minimum:': null  
          };
        
            midLine = median(distribution,  0,  n - 1);
            box['Median:'] = midLine;
            
          // Q1 is the median of the first half of the set; we add the median to
            // it if the whole set length is even
            var bak = distribution[Math.floor(n / 2)];
            distribution[Math.floor(n / 2)] = midLine;
            var boxBottom = median(distribution, 0, Math.floor(n / 2));
            distribution[Math.floor(n / 2)] = bak;
            
            // Q3 is the median of the second half of the set; we add the median to
            // it if the whole set length is even
            bak = distribution[Math.floor((n - 1) / 2)];
            distribution[Math.floor((n - 1) / 2)] = midLine;
            var boxTop  = median(distribution, Math.floor((n - 1) / 2), n - 1);
            distribution[Math.floor((n - 1) / 2)] = bak;
            box['3rd Quartile:'] = boxTop;
            box['1st Quartile:'] = boxBottom;
            
        // inter-quartile range
        var iqr = boxTop.val - boxBottom.val;
        // lower adjacent limit
        var lal = boxBottom.val - 1.5 * iqr;
        // upper adjacent limit
        var ual = boxTop.val + 1.5 * iqr;

        // search for the lowest non outlier
        var i = 0;
        while (distribution[i].val < lal)
          i++;
        lowWhisker = distribution[i];
        box['Minimum:'] = lowWhisker;

        if (lowWhisker) {
          if (boxBottom) {
            if (boxBottom.val != lowWhisker.val) {
              lowWhiskerObj.push({
                'pair' : [boxBottom, lowWhisker],
                'ctx' : [boxBottom.ctx, lowWhisker.ctx],
                'val' : [boxBottom.val, lowWhisker.val]
              });
            }
          }
        }

        // low outliers are all the values lower than lowest non outlier
        for ( var k = 0; k < i; k++)
          outLiersObj.push(distribution[k]);

        // search for the largest non outlier
        var j = n - 1;
        while (distribution[j].val > ual)
          j--;
        highWhisker = distribution[j];
        box['Maximum:'] = highWhisker;

        for ( var k = 0; k < n - j - 1; k++)
          outLiersObj.push(distribution[j + 1 + k]);

        if (outLiersObj.length > 0)
          box['outLiers(s)'] = outLiersObj.length;
        // if (lowWhiskerObj.length == 1) {
        // whiskersObj.push(lowWhiskerObj[0]);
        // }

        // if (highWhiskerObj.length == 1) {
        // whiskersObj.push(highWhiskerObj[0]);
        // }

        if (highWhisker) {
          if (boxTop) {
            if (boxTop.val != highWhisker.val) {
              highWhiskerObj.push({
                'pair' : [highWhisker, boxTop],
                'ctx' : [highWhisker.ctx, boxTop.ctx],
                'val' : [highWhisker.val, boxTop.val]
              });
            }
          }
        }

        if (boxBottom && boxTop && midLine) {
          if (boxBottom.val == boxTop.val) {
            quartilesObj.push({
              'pair' : [boxBottom, boxBottom],
              'midLine': null,
              'ctx' : [boxBottom.ctx],
              'val' : [boxBottom.val]
            });
          } else if (midLine.val == boxTop.val || midLine.val == boxBottom.val) {
            quartilesObj.push({
              'pair' : [boxTop, boxBottom],
              'midLine': null,
              'ctx' : [boxTop.ctx, boxBottom.ctx],
              'val' : [boxTop.val, boxBottom.val]
            });
          } else {
            quartilesObj.push({
              'pair' : [boxTop, midLine],
              'midLine': midLine,
              'ctx' : [boxTop.ctx],
              'val' : [boxTop.val]
            });
            quartilesObj.push({
              'pair' : [midLine, boxBottom],
              'midLine': midLine,
              'ctx' : [boxBottom.ctx],
              'val' : [boxBottom.val]
            });
          }
        }
        
        boxplotData.push(box);
      }
    }
      
    function chart(selection) { 
      
      selection.each(function() {
        
        boundUtil.drawBound(selection, width, height);
          
        boxNumber = 1, boxGroupNumber = seriesData.length, boxWidth = 8 * (xScale.rangeBand()) / (9 * boxNumber + 7);
  
          var svg = sWrapper = d3.select(this);
          svg.selectAll('g.box').remove();
          
          if(decorativeShape == null){
            decorativeShape = svg.append('rect').attr('width', xScale.rangeBand() - boxWidth/2).attr('height', height).style('visibility', 'hidden').attr('fill', 'rgba(133,133,133, 0.2)');
          }else{
            decorativeShape.attr('width', xScale.rangeBand() - boxWidth/2).attr('height',height).style('visibility', 'hidden');
          }
          
          var boxGroup = svg.selectAll('g.box').data(seriesData);

          boxGroup.enter().append('g');
        boxGroup.attr('class', 'box').each( function(boxData, outerIndex) {
              
            if (boxData.length == 0) {
              boxplotData.push({});
              return;
            }
            
            boxData = boxData.sort(function(aObj, bObj) { return aObj.val - bObj.val; });
    
                var arrLength = boxData.length, min = boxData[0], max = boxData[arrLength - 1];
    
                setDistribution(boxData);
    
                var outLiersSelector = d3.select(this).selectAll('circle.outliers').data(outLiersObj);
                outLiersSelector.enter().append('circle');
                outLiersSelector.attr('cx', function(outLier) {
                  var x = xScale(outerIndex) + boxWidth;
                  return x;
                })
                .attr('cy', function(outLier, num) {
                  var y = yScale(outLier.val);
                  return y;
                })
                .attr('r', '2')
                //.attr('shape-rendering', 'crispEdges')
                .attr('stroke', effectManager.register(
                                                    {
                                                  drawingEffect : 'normal',
                                                  fillColor : outLierLayout.color
                                                }
                                                      )
             )
                .attr('stroke-width', outLierLayout.width)
                .attr('fill', 'none')
                .attr('class', 'datapoint outliers');
                
                outLiersSelector.exit().remove();

                var quartileSelector = d3.select(this).selectAll('rect.quartile').data(quartilesObj);
                quartileSelector.enter().append('rect');
                quartileSelector.attr('x', function(quartile) {
                  var x = xScale(outerIndex) + boxWidth / 2;
                  return x;
                })
                .attr('y', function(quartile, num) {
                  var y = yScale(quartile.pair[0].val);
                  return y;
  
                })
                .attr('width', boxWidth)
                .attr('height', function(quartile, num) {
                  var height = 0;
                  var pairDiff = quartile.pair[1].val - quartile.pair[0].val;
                  if (pairDiff == 0) {
                    height = 1;
                  } else {
                    height = yScale(quartile.pair[1].val) - yScale(quartile.pair[0].val);
                  }
  
                  return height;
                })
                .attr('shape-rendering', 'crispEdges')
                .attr( 'fill', function(d){
                  var parameter = {
                      drawingEffect : drawingEffect,
                      fillColor : boxColorPalette[outerIndex % boxColorPalette.length],
                      direction : 'horizontal'
                    };
            return effectManager.register(parameter);   
                })
                .attr('stroke-width', quartileLayout.width)
                //.attr('stroke', '#000000')
                .attr('class', 'datapoint quartile');
                
                if (quartilesObj.length == 2) {
                  var midLineXStart = xScale(outerIndex) + boxWidth / 2;
                  var midLineXEnd = midLineXStart + boxWidth;
                  var midLineYStart = midLineYEnd = yScale(quartilesObj[0].midLine.val);
                  var lineSelector = d3.select(this);
                    lineSelector.append('line')
                    .attr('x1', midLineXStart)
                    .attr('y1', midLineYStart)
                    .attr('x2', midLineXEnd)
                    .attr('y2', midLineYEnd)
                    .attr('stroke', '#ffffff')
                    .attr('stroke-width', 1)
                    .attr('shape-rendering', 'crispEdges')
                    .attr('class', 'midline');
                }
                
                quartileSelector.exit().remove();
    
                var verticalLineXStart = 0, verticalLineYStart = 0, verticalLineXEnd = 0, verticalLineYEnd = 0;
                var horizontalLineXStart = 0, horizontalLineYStart = 0, horizontalLineXEnd = 0, horizontalLineYEnd = 0;
                var whiskerSelector = d3.select(this).selectAll('rect.rectlowwhisker').data(lowWhiskerObj);
                whiskerSelector.enter().append('rect');
                whiskerSelector.attr('x', function(whisker) {
                  var x = xScale(outerIndex) + boxWidth / 2;
                  horizontalLineXStart = x;
                  horizontalLineXEnd = x + boxWidth;
                  verticalLineXStart = verticalLineXEnd = x + boxWidth / 2;
                  return x;
                  })
                  .attr('y', function(whisker) {
                    var tmpPair = whisker.pair;
                    var y = yScale(tmpPair[0].val);
                    verticalLineYStart = y;
                    horizontalLineYStart = horizontalLineYEnd = yScale(tmpPair[1].val);
                    return y;
                  })
                  .attr('width', boxWidth)
                  .attr('height', function(whisker) {
                    var height = yScale(whisker.pair[1].val) - yScale(whisker.pair[0].val);
                    verticalLineYEnd = yScale(whisker.pair[1].val);
                    var lineSelector = d3.select(this.parentNode);
                    lineSelector.append('line')
                    .attr('x1', verticalLineXStart)
                    .attr('y1', verticalLineYStart)
                    .attr('x2', verticalLineXEnd)
                    .attr('y2', verticalLineYEnd)
                    .attr('stroke', effectManager.register(
                                      {
                                        drawingEffect : 'normal',
                                        fillColor : '#000000'
                                      }
                                    )
                                 )
                    .attr('stroke-width', 1)
                    .attr('shape-rendering', 'crispEdges')
                    .attr('class', 'lineverticallowwhisker');
                    
                    var lineSelector = d3.select(this.parentNode);
                    lineSelector.append('line')
                    .attr('x1', horizontalLineXStart)
                    .attr('y1', horizontalLineYStart)
                    .attr('x2', horizontalLineXEnd)
                    .attr('y2', horizontalLineYEnd)
                    .attr('stroke', function(d){
                          var parameter = {
                         drawingEffect : 'normal',
                         fillColor : boxColorPalette[outerIndex % boxColorPalette.length]
                        };
                                   return effectManager.register(parameter);  
                                }
                         )
                    .attr('stroke-width', 1)
                    .attr('shape-rendering', 'crispEdges')
                    .attr('class', 'linehorizontallowwhisker');
                    return height;
                    })
                  .attr('shape-rendering', 'crispEdges')
                  .attr('fill-opacity', '0')
                  .attr('stroke-width', '0')
                  .attr('class', 'datapoint rectlowwhisker');
                
                whiskerSelector.exit().remove();
    
                var verticalLineXStart = 0, verticalLineYStart = 0, verticalLineXEnd = 0, verticalLineYEnd = 0;
                var horizontalLineXStart = 0, horizontalLineYStart = 0, horizontalLineXEnd = 0, horizontalLineYEnd = 0;
                var whiskerSelector = d3.select(this).selectAll('rect.recthighwhisker').data(highWhiskerObj);
                whiskerSelector.enter().append('rect');
                whiskerSelector
                    .attr('x', function(whisker) {
                      var x = xScale(outerIndex) + boxWidth / 2;
                      horizontalLineXStart = x;
                      horizontalLineXEnd = x + boxWidth;
                      verticalLineXStart = verticalLineXEnd = x + boxWidth / 2;
                      return x;
                      })
                    .attr('y', function(whisker, num) {
                      var tmpPair = whisker.pair;
                      var y = yScale(tmpPair[0].val);
                      verticalLineYStart = y;
                      horizontalLineYStart = horizontalLineYEnd = yScale(tmpPair[0].val);
                      return y;
                      })
                    .attr('width', boxWidth)
                    .attr('height', function(whiskersObj, num) {
                      var height = yScale(whiskersObj.pair[1].val) - yScale(whiskersObj.pair[0].val);
                      verticalLineYEnd = verticalLineYStart + height;
                      var lineSelector = d3.select(this.parentNode);
                      lineSelector.append('line')
                      .attr('x1', verticalLineXStart)
                      .attr('y1', verticalLineYStart)
                      .attr('x2', verticalLineXEnd)
                      .attr('y2', verticalLineYEnd)
                      .attr('stroke', effectManager.register(
                                      {
                                        drawingEffect : 'normal',
                                        fillColor : '#000000'
                                      }
                                    )
                                 )
                      .attr('stroke-width', 1)
                      .attr('shape-rendering', 'crispEdges')
                      .attr('class', 'lineverticalhighwhisker');
  
                      var lineSelector = d3.select(this.parentNode);
                      lineSelector.append('line')
                      .attr('x1', horizontalLineXStart)
                      .attr('y1', horizontalLineYStart)
                      .attr('x2', horizontalLineXEnd)
                      .attr('y2', horizontalLineYEnd)
                      .attr('stroke', function(d){
                            var parameter = {
                         drawingEffect : 'normal',
                         fillColor : boxColorPalette[outerIndex % boxColorPalette.length]
                        };
                                   return effectManager.register(parameter);  
                                }
                           )
                      .attr('stroke-width', 1)
                      .attr('shape-rendering', 'crispEdges')
                      .attr('class', 'linehorizontalhighwhisker');
                       
                      return height;
                      })
                    .attr('shape-rendering', 'crispEdges')
                    .attr('fill-opacity', '0')
                    .attr('stroke-width', '0')
                    .attr('class', 'datapoint recthighwhisker');
                
                whiskerSelector.exit().remove();
                
                clearBoxData();
          eDispatch.initialized();
          
          });  
          boxGroup.exit().remove();
      });
    return chart;
    };
  
    chart.width = function(value) {
      if (!arguments.length) {
        return width;
      }
      
      width = value;
      if (TypeUtils.isExist(width) && TypeUtils.isExist(height) && TypeUtils.isExist(seriesData)) {
        makeScales();
      }
      return chart;
    };
      
    chart.height = function(value) {
      if (!arguments.length) {
        return height;
      }

      height = value;
      if (TypeUtils.isExist(width) && TypeUtils.isExist(height) && TypeUtils.isExist(seriesData)) {
        makeScales();
      }
      return chart;
    }; 
    
    var handleNull = function(_) {
      if (_ === null || _ === undefined) {
        return defaultString;
      } else {
        return _;
      }
    };

    function getTooltipData(index) {
      
      var tooltipData =  {
          'body': [],
          'footer': []
        },
        internalIndex = 0;
      
      if (regionData) {

        var body = {
          'name': null,
          'val': []
        };
        
        internalIndex = index % regionData.length;
        body.name = regionData[internalIndex].name;
  
        if (regionData[internalIndex].label != null && regionData[internalIndex].shape != null && boxColorPalette[internalIndex] != null) {
          var item = {
              'shape': null,
              'color': null,
              'label': null,
              'value': null
            };
          
          item.shape = regionData[internalIndex].shape;
          item.color = boxColorPalette[internalIndex];
          item.label = regionData[internalIndex].label;
          body.val.push(item);
        }
        
        if (boxplotData) {
          
          if (boxplotData[index]) {

            for (var i in boxplotData[index]) {
              var item = {
                  'shape': null,
                  'color': null,
                  'label': null,
                  'value': null
                };
              item.label = i;
              if (boxplotData[index][i]) {
                if (i == 'outLiers(s)') {
                  item.value = boxplotData[index][i];
                } else {
                  item.value = boxplotData[index][i].val;
                }
              }
              body.val.push(item);
            }
          }
        }
        
        tooltipData.body.push(body);
      }
      
      if (dimensionData) {
        internalIndex = Math.floor(index / regionData.length);
        for (var i = 0; i < dimensionData.length; i++) {
          
          if (dimensionData[i].rows.length > 0) {
            var footer = {
                'label': null,
                'value': null
              };
            footer.label = dimensionData[i].col;
            footer.value = dimensionData[i].rows[internalIndex];
            
            tooltipData.footer.push(footer);
          }
        }
      }
    
      return tooltipData;
    }
    
    function generateTooltipData() {
      
      if (dimensions) {
        for (var i in dimensions) {
          dimensionData = dimensions[i].values;
        }
      }
      
      if (legendData) {
        var legendList = legendData.values;
        if (legendList.length > 1) {
          if (legendList[0].type == 'MND') {
            //mnd scan
            for (var mndIndex = 0; mndIndex < legendList[0].rows.length; mndIndex++) {

              //vertical scan
              for (var m = 0; m < legendList[1].rows.length; m++) {
                var legendObj = {
                    'name': null,
                    'shape': null,
                    'color': null,
                    'label': null
                  };
                legendObj.name = legendList[0].rows[mndIndex];
                var label = [];
                
                //horizontal scan
                for (var n = 1; n < legendList.length; n++) {
                  label.push(legendList[n].rows[m]);
                }
                legendObj.label = label;
                regionData.push(legendObj);
              }    

            }
          } else if (legendList[legendList.length - 1].type == 'MND') {

            for (var m = 0; m < legendList[0].rows.length; m++) {

              var label = [];
              for (var n = 0; n < legendList.length - 1; n++) {
                label.push(legendList[n].rows[m]);              
              }
              

              for (var mndIndex = 0; mndIndex < legendList[legendList.length - 1].rows.length; mndIndex++) {
                var legendObj = {
                    'name': null,
                    'shape': null,
                    'color': null,
                    'label': null
                  };
                legendObj.label = label;
                legendObj.name = legendList[legendList.length - 1].rows[mndIndex];
                regionData.push(legendObj);
              }
            }
          } 
        } else {
          for (var m = 0; m < legendList[0].rows.length; m++) {
            var legendObj = {
                'name': null,
                'shape': null,
                'color': null,
                'label': null
              };
            legendObj.name = legendList[0].rows[m];
            regionData.push(legendObj);
          }
        }
      }
      
      for (var k = 0; k < regionData.length; k++) {
        //regionData[k].color = boxColorPalette[k % boxColorPalette.length];
        regionData[k].shape = 'squareWithRadius';
      }
    }

    function setElementAttribute(element, attribute, value) {
      if (element) {
        var className = element.getAttribute('class');
        if(className.indexOf('recthighwhisker') == -1 && className.indexOf('rectlowwhisker') == -1
           && className.indexOf('linehorizontalhighwhisker') == -1 && className.indexOf('lineverticalhighwhisker') == -1
           && className.indexOf('linehorizontallowwhisker') == -1 && className.indexOf('lineverticallowwhisker') == -1) {
          element.setAttribute(attribute, value);
        }else if (className.indexOf('recthighwhisker') != -1) {
          var nodeList = element.parentNode.querySelectorAll('line');
          if (nodeList) {
            for (var j = 0, nodeListLen = nodeList.length; j < nodeListLen; j++) {
              var nodeClassName = nodeList[j].getAttribute('class');
              if (nodeClassName.indexOf('linehorizontalhighwhisker') != -1 || nodeClassName.indexOf('lineverticalhighwhisker') != -1) {
                nodeList[j].setAttribute(attribute, value);
              }
            }
          }
        } else if(className.indexOf('rectlowwhisker') != -1) {
          var nodeList = element.parentNode.querySelectorAll('line');
          if (nodeList) {
            for (var j = 0, nodeListLen = nodeList.length; j < nodeListLen; j++) {
              var nodeClassName = nodeList[j].getAttribute('class');
              if (nodeClassName.indexOf('linehorizontallowwhisker') != -1 || nodeClassName.indexOf('lineverticallowwhisker') != -1) {
                nodeList[j].setAttribute(attribute, value);
              }
            }
          }        
        }      
      }
    }
    
      chart.parent = function(){
        return sWrapper;
      };
      
      chart.highlight = function(elems){
        if(elems instanceof Array){
          for(var i = 0, elemsLen = elems.length; i < elemsLen; i++) {
          var item = elems[i];
          setElementAttribute(item, 'opacity', 1);
          }
        }else{
        setElementAttribute(elems, 'opacity', 1);
        }
      };
      
      chart.unhighlight = function(elems){
        if(elems instanceof Array){
          for(var i = 0, len = elems.length; i < len; i++){
          var item = elems[i];
          setElementAttribute(item, 'opacity', 0.2);
          }
        }else{
        setElementAttribute(elems, 'opacity', 0.2);
        }
      };
      
      chart.clear = function(gray){
        if( gray == null){
          sWrapper.selectAll('.datapoint').attr('opacity', 1);
          sWrapper.selectAll('.lineverticallowwhisker').attr('opacity', 1);
          sWrapper.selectAll('.lineverticalhighwhisker').attr('opacity', 1);
          sWrapper.selectAll('.linehorizontallowwhisker').attr('opacity', 1);
          sWrapper.selectAll('.linehorizontalhighwhisker').attr('opacity', 1);
        }else{
          sWrapper.selectAll('.datapoint').attr('opacity', 0.2);
          sWrapper.selectAll('.lineverticallowwhisker').attr('opacity', 0.2);
          sWrapper.selectAll('.lineverticalhighwhisker').attr('opacity', 0.2);
          sWrapper.selectAll('.linehorizontallowwhisker').attr('opacity', 0.2);
          sWrapper.selectAll('.linehorizontalhighwhisker').attr('opacity', 0.2);
        }
        
        sWrapper.selectAll('.recthighwhisker').attr('opacity', 0);
        sWrapper.selectAll('.rectlowwhisker').attr('opacity', 0);
      };
  
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

      if (i > (seriesData.length - 1)
          || i < 0) {
        decorativeShape.style(
            'visibility', 'hidden');
        return;
      }
      
      decorativeShape.attr(
          'x',
          xScale.rangeBand() * i + boxWidth/4).style(
          'visibility', 'visible');
      
      if(lastHovered !== i){
        if (tooltipVisible) {
          lastHovered = i;
          //this.parentNode point to plot graphic. it is different from bar chart as in bar chart it should get the yoffset which can get it from mian graphic element.
          var transform = sWrapper[0][0].getTransformToElement(sWrapper[0][0].ownerSVGElement);
          var xoffset = transform.e;

          var tooltipData = getTooltipData(i);
          
          tooltipData.point = {
              x: xScale.rangeBand()*i + 0.5 * xScale.rangeBand() + xoffset,
              y: d3.event.layerY
              };
          tooltipData.plotArea = {
                        x : transform.e,
                        y : transform.f,
                        width : width,
                        height : height
                    };
          eDispatch.showTooltip(tooltipDataHandler.formatTooltipData(tooltipData));
        }
      }
      
      };
  
      chart.blurOut = function(){
        decorativeShape.style('visibility', 'hidden');
        lastHovered = null;
      if (tooltipVisible) {
          eDispatch.hideTooltip();
      }
      };
      
      function makeSubGroup(row, start, end, groups, parentGroupIndex) {
      if (row && start <= end && end < row.length) {
        var subStart = subEnd = pos = start;
        while (pos <= end) {
          while (((pos+1) <= end) && (row[pos + 1].val == row[pos].val)) {
            subEnd++;
            pos++;
          }
            
          groups.push({
            'val': row[subStart],
            'parentGroupIndex': parentGroupIndex,
            'start': subStart,
            'end': subEnd
          });
          pos++;
          subStart = subEnd = pos;
        }          
      }
    }

    
    function generateGroup(row) {
      var curGroups = [];
      if (row) {
        var mapLen = dimensionGroup.length;
        var preGroups = mapLen > 0?dimensionGroup[mapLen - 1].val : null;
        if (preGroups) {
          for (var i = 0, len = preGroups.length; i < len; i++) {
            var preGroup = preGroups[i];
            var start = preGroup.start;
            var end = preGroup.end;
            makeSubGroup(row, start, end, curGroups, i );
          }
        } else {
          makeSubGroup(row, 0, row.length - 1, curGroups, null);
        }
      }
      return curGroups;
    }

    function dataTransform(originalData) {
      if (originalData) {
        var originalDimension = originalData.getAnalysisAxisDataByIdx(0);
        legendData = originalData.getAnalysisAxisDataByIdx(1);
        if (originalDimension) {
          var len = originalDimension.values.length;
          if (len == 1) {
            dimensionGroup.push({'col': originalDimension.values[0].col.val, 'val': []});
          } else {
            for (var i = 0; i < len - 1; i++) {
              var row = originalDimension.values[i].rows;
              dimensionGroup.push({'col': originalDimension.values[i].col.val, 'val': generateGroup(row)});
            }
          }
        }
      }
    }
    
    function caculateLeavesNum(start, end) {
      
      var len = dimensionGroup.length, num = 0, index = 0, leavesGroups = dimensionGroup[len - 1].val;
      while (leavesGroups[index].start != start) {
        index++;
      }      
      while (leavesGroups[index].end != end) {
        num++;
        index++;
      }
      num++;
      return num;
    }

    function generateDimensions() {
      if (dimensionGroup) {
        var len = dimensionGroup.length, groups = null;
        
        groups = dimensionGroup[len - 1].val;
        if (groups.length == 0) {
          dimensionDomain.push(0);
          dimensionDomain.push(1);
        } else {
          for (var i = 0, lenScale = groups.length; i < lenScale; i++) {
            dimensionDomain.push(i);
          }
        }
        
        if (groups.length == 0) {
          dimensions['sap.viz.modules.verticalboxplot.dimension'].values = [{'col': {'val': dimensionGroup[len - 1].col}, 'rows': []}];
        } else {
          
          var scaleValues = [];
          for (var j = 0; j < len; j++) {
            var obj = {
              'col': {'val': ''},
              'rows': []
            };
            obj.col.val = dimensionGroup[j].col;
            var rowGroups = dimensionGroup[j].val;
            for (var k = 0,  lenRowGroups =  rowGroups.length; k < lenRowGroups; k++) {
              var start = rowGroups[k].start, end = rowGroups[k].end, num = caculateLeavesNum(start, end);
              for (var m = 0; m < num; m++) {
                obj.rows.push({
                  'val': handleNull(rowGroups[k].val.val),
                  'info' : rowGroups[k].val.info
                });
              }
            }
            
            scaleValues.push(obj);
          }
              
          dimensions['sap.viz.modules.verticalboxplot.dimension'].values = scaleValues;
        }        
      }      
    }
    
    function createColorPalette(length) {
      boxColorPalette = [];
      if (colorPalette.length > 0) {
        for( var i = 0; i < length; ++i) {
          boxColorPalette.push(colorPalette[i % colorPalette.length]);
        }
      }
    }
    
      function parseOptions(){  
      tooltipVisible = _properties.tooltip.enabled;
        colorPalette = _properties.colorPalette;
        drawingEffect = _properties.drawingEffect;
      }
      
    chart.data = function(value) {
      if (!arguments.length) {
        return _data;
      }
      
      clearGlobalData();
      parseOptions();
      
      _data = value;
        var obj = MNDHandler(_data);
        dataTransform(_data);
        dataMG1 = obj["MG1"];
        
      var len = dataMG1.length;
      var groups = dimensionGroup[dimensionGroup.length - 1].val;
      if (groups.length != 0) {
        for (var i = 0, groupsLen = groups.length; i < groupsLen; i++) {
          var start = groups[i].start, end = groups[i].end;
          for (var j = 0; j < len; j++) {
            var row = [], left = start, right = end;
            for (;left <= right; left++) {
              if (!NumberUtils.isNoValue(dataMG1[j][left].val))
                row.push(dataMG1[j][left]);
            }
            seriesData.push(row);
          }
        }
      } else {
        for (var j = 0; j < len; j++) {
          var row = [];
          for (var m = 0; m < dataMG1[j].length; m++) {
            if (!NumberUtils.isNoValue(dataMG1[j][m].val)) {
              row.push(dataMG1[j][m]);
            } 
          }
          seriesData.push(row);
        }
      }
        
      locateBoundary(seriesData);
      generateDimensions();
      
      if (TypeUtils.isExist(width) && TypeUtils.isExist(height)) {
        makeScales();
      }
      
      generateTooltipData();
            createColorPalette(regionData.length);
      
      return chart;
    };
    
    chart.primaryAxisTitle = function(_){
        if(!arguments.length){
          var titles =  _data.getMeasureValuesGroupDataByIdx(0), title = [];
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
          var titles =  _data.getMeasureValuesGroupDataByIdx(1), title = [];
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
      
    chart.properties = function(props){

        if (!arguments.length){
          return _properties;
         }
      
      Objects.extend(true, _properties, props);
            parseOptions();
            createColorPalette(regionData.length);
            
         return chart;        
      };
    
    chart.categoryScale = function(scale){
      if (!arguments.length){
        return xDimensionScale;
      }
      xDimensionScale = scale;
      return chart;
     };
     
     chart.primaryScale = function(scale){
       if (!arguments.length){
         return yScale;
       }
       yScale = scale;
       return chart;
     };
  
    chart.colorPalette = function(Palette){
      if (!arguments.length){
        return colorPalette;
      }
      colorPalette = Palette;
      return chart;
     };
  
     chart.dispatch = function(_){
        if(!arguments.length)
          return eDispatch;
        eDispatch = _;
        return this;
      };
    _properties = manifest.props(null);
    return chart;
  };

  return boxplot;
});