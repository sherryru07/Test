sap.riv.module(
{
  qname : 'sap.viz.modules.tooltip',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.modules.dispatch',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
},
{  qname : 'sap.viz.format.FormatManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
}
],
function Setup(Dispatch, Objects, formatManager, TypeUtils, ObjectUtils, langManager) {
  var tooltip =  function(manifest, ctx) {
    var _display = {
      singleMeasure : {
        label : {
          font : 'bold 11px sans-serif',
          color : '#333333'
        },
        value : {
          font : 'bold 14px sans-serif',
          color : '#333333'
        },
        padding : {
          vertical : 9,
          horizontal : 10
        }
      },
      multipleMeasure : {
        label : {
          font :  "12px 'Open Sans', Arial, Helvetica, sans-serif",
          color : '#333333'
        },
        value : {
          font : "12px 'Open Sans', Arial, Helvetica, sans-serif",
          color : '#333333'
        },
        padding : {
          vertical : 8,
          horizontal : 10,
          inline : 6,
          symbolGap : 7,
          defaultSpace : 8
        }
      },
      title : {
        color : '#333333',
        font : "bold 13px 'Open Sans', Arial, Helvetica, sans-serif",
        formatString : ''
      },
      footer : {
        label : {
          font :  "bold 10.5px 'Open Sans', Arial, Helvetica, sans-serif",
          color : '#333333'
        },
        value : {
          font : "10.5px 'Open Sans', Arial, Helvetica, sans-serif",
          color : '#333333'
        },
        padding : {
          inline : 6
        }
      },
      valueFormat : [],
      labelFormat : [],
      maxDimensionLabelWidth : 150,
      maxMeasureLabelWidth : 80
    };

    var _shapeLayout = {
      padding : 5,
      radius : 4,
      markerWidth : 12,
      markerHeight : 8,
      borderWidth : 2
    };

    var _shapes = {
      tooltip : null,
      tooltipRB : null,
      dimensionLabel : null,
      separateLine : null,
      measureLabels : [],
      measureMarks : [],
      valueLabels : []
    };

    var _currentValue = {
      offset : undefined
    };

    var _defaultToolTipColors = {
      backgroundColor : '#ffffff',
      borderColor : '#000000',
      separateLineColor : [ '#ffffff', '#8a8a8a', '#ffffff' ],
      separateLineSingleColor : '#AAAAAA',
      guideLineColor : '#AAAAAA'
    };

    var _svgPathCommand = {
      arcA : 'A',
      lineToA : 'L',
      moveToA : 'M',
      closePath: 'z'
    };
    
    var _symbol = {
      symbolSize : 8,
      hasSymbol : false
    };
    
    var _symbolClassName = 'tooltipsymbol', _paragraphTitleClassName = 'tooltipparagraphtitle', _paragraphLabelTextClassName = 'tooltipparagraphlabel', _paragraphValueTextClassName = 'tooltipparagraphvalue', _footerLabelClassName = 'tooltipfooterlabel', _footerValueClassName = 'tooltipfootervalue';
    
    var vis = null, gWrapper = null;
    var tooltipWidth = 0, tooltipHeight = 0, textMaxWidth = 0, effectManager = ctx.effectManager,
    zone = {
        width : 200,
        height : 100
    },
    
    plotArea = {
        width: 160,
          height: 70,
          x: 0,
          y: 0
    },
    
    _properties = {},
    
    //tooltip border marker orientation
    _orientation = null,

    //variables are for tooltip content truncation case
    _truncationParameter = {
      isTruncated : false,
      currentFooterIndex : -1,
      currentBodyIndex : -1,
      defaultValue : '...',
      font : 'bold 20px Arial',
      color : '#000000'
    };
    
    var defaultString = langManager.get('IDS_ISNOVALUE');

    var handleNull = function(_) {
      if (_ === null || _ === undefined) {
        return defaultString;
      } else {
        return _;
      }
    };
    
    function clearTruncationParameter() {
      _truncationParameter.isTruncated = false;
      _truncationParameter.currentFooterIndex = -1;
      _truncationParameter.currentBodyIndex = -1;
    }
    
    function tooltip(selection) {
      vis = d3.select(selection).append('svg').style('position', 'absolute').attr('pointer-events', 'none').attr('width', '0').attr('height', 0).attr('class','tooltip');
      
      return tooltip;
    }

    function getTooltipHeightV2(vis, data) {
      var bodyInline = _display.multipleMeasure.padding.inline, 
        multipleVertical = _display.multipleMeasure.padding.vertical,
        multipleLabelFont = _display.multipleMeasure.label.font,
        multipleValueFont = _display.multipleMeasure.value.font,
        footerInline = _display.footer.padding.inline,
        footerLabelFont = _display.footer.label.font,
        titleFont = _display.title.font;
      var tooltipHeight = 0, tooltipBody = data.body, tooltipFooter = data.footer;
       
        
        //First rule, make sure the content contains the first paragraph title and footer if the tooltip height is beyond zone height.
        if (tooltipBody && tooltipBody.length > 0) {
            tooltipHeight = multipleVertical;
          
            if (tooltipFooter && tooltipFooter.length > 0) {
              var firstPlaceHolderHeight = 0;
              if (tooltipBody[0].name !== null) {
                firstPlaceHolderHeight =  getTextBox(vis, tooltipBody[0].name,  titleFont).height + bodyInline + getTextBox(vis, _truncationParameter.defaultValue,  _truncationParameter.font).height;
              }
              
              if (tooltipFooter[0].label !== null) {
                var footerlabelBox1 = getTextBox(vis, tooltipFooter[0].label, footerLabelFont);
                
                tooltipHeight += multipleVertical * 3;
                
                tooltipHeight += (tooltipFooter.length * footerlabelBox1.height + footerInline * (tooltipFooter.length - 1));
            
                tooltipHeight += firstPlaceHolderHeight;
                if (tooltipHeight > zone.height) {
                  _truncationParameter.isTruncated = true;
                  _truncationParameter.currentBodyIndex = 0;
                  
                  var num1 = 0;
                  while (tooltipHeight > zone.height) {
                    tooltipHeight -= footerlabelBox1.height;
                    tooltipHeight -= footerInline;
                    num1++;
                  }
                  _truncationParameter.currentFooterIndex = tooltipFooter.length - num1 - 1;
                  
                  return tooltipHeight;
                }
                
                tooltipHeight -= firstPlaceHolderHeight;
              }
            } else {
              tooltipHeight += multipleVertical;
            }
            
            var paragraphTitleNum = 0, paragraphLineNum = 0;
          for (var i = 0; i < tooltipBody.length; i++) {
            paragraphTitleNum++;
            paragraphLineNum += tooltipBody[i].val.length;
          }
          
          if (tooltipBody[0].name !== null) {
            tooltipHeight += (paragraphTitleNum * getTextBox(vis, tooltipBody[0].name,  titleFont).height);
          }
          
        var maxValue = 0;
          if (tooltipBody[0].val.length > 0) {
            if (tooltipBody[0].val[0].label !== null) {
              maxValue = getTextBox(vis, tooltipBody[0].val[0].label,  multipleLabelFont).height;
            }
            
            if (tooltipBody[0].val[0].value !== null) {
              var valueHeight = getTextBox(vis, tooltipBody[0].val[0].value,  multipleValueFont).height;
              if (valueHeight > maxValue) {
                maxValue = valueHeight;
              }
            }
            
            tooltipHeight += (paragraphLineNum * maxValue);
          }
            
          tooltipHeight += (bodyInline * (paragraphTitleNum + paragraphLineNum - 1));
          
            if (tooltipHeight > zone.height) {
              _truncationParameter.isTruncated = true;
              
              var num2 = 0;
              while (tooltipHeight > zone.height) {
                tooltipHeight -= maxValue;
                tooltipHeight -= bodyInline;
                num2++;
              }
              
              _truncationParameter.currentBodyIndex = paragraphTitleNum + paragraphLineNum - num2 - 2;
              var defaultValueBox1 = getTextBox(vis, _truncationParameter.defaultValue, _truncationParameter.font);
              
              return tooltipHeight + (defaultValueBox1.height - maxValue);
            }
        } else  if (tooltipFooter && tooltipFooter.length > 0) {
          if (tooltipFooter[0].label !== null) {
            var footerlabelBox2= getTextBox(vis, tooltipFooter[0].label, footerLabelFont);
            
            tooltipHeight += multipleVertical;
            
            tooltipHeight += (tooltipFooter.length * footerlabelBox2.height + footerInline * (tooltipFooter.length - 1));
        
              if (tooltipHeight > zone.height) {
                _truncationParameter.isTruncated = true;
                var num = 0;
                while (tooltipHeight > zone.height) {
                  tooltipHeight -= footerlabelBox2.height;
                  tooltipHeight -= footerInline;
                  num++;
                }
                
                _truncationParameter.currentFooterIndex = tooltipFooter.length - num - 1;
                var defaultValueBox2 = getTextBox(vis, _truncationParameter.defaultValue, _truncationParameter.font);
                
                return tooltipHeight + (defaultValueBox2.height - footerlabelBox2.height);
              }
          }
        }    
        
        return tooltipHeight;
    }
        
    function getTooltipWidthV2(vis, data) {
        var tooltipWidth = 0, multipleHorizontal = _display.multipleMeasure.padding.horizontal, symbolGap = _display.multipleMeasure.padding.symbolGap, defaultSpace = _display.multipleMeasure.padding.defaultSpace, symbolSize = _symbol.symbolSize;
        
        tooltipWidth = textMaxWidth + (multipleHorizontal * 2) + defaultSpace;
        if (_symbol.hasSymbol) {
          tooltipWidth += symbolSize + symbolGap;
        }
        return tooltipWidth;
    }
        
    function getTextMaxWidthV2(vis, data) {
      var maxValue = 0, tmpWidth = 0, tooltipBody = data.body, tooltipFooter = data.footer;
      
      if (tooltipBody) {
        for (var i = 0; i < tooltipBody.length; i++) {
          if (tooltipBody[i].name !== null) {
            tmpWidth = getTextBox(vis, tooltipBody[i].name, _display.title.font).width;
            if (tmpWidth > maxValue) {
              maxValue = tmpWidth;
            }
          }
      
          var paragraphValue = tooltipBody[i].val;
          if (paragraphValue) {
            if (paragraphValue.length === 1 && (paragraphValue[0].value !== null)) {
              var valueBox = getTextBox(vis, paragraphValue[0].value, _display.multipleMeasure.value.font);
              _symbol.symbolSize = valueBox.height * 0.8;
              _symbol.hasSymbol = true;
              if (valueBox.width > maxValue) {
                maxValue = valueBox.width;
              }
            } else if (paragraphValue.length > 1) {
              if (paragraphValue[0].label !== null) {
                if (paragraphValue[0].shape !== null && paragraphValue[0].color !== null) {
                  _symbol.symbolSize = getTextBox(vis, paragraphValue[0].label, _display.multipleMeasure.label.font).height * 0.8;
                  _symbol.hasSymbol = true;
                }
              }
              
              if (paragraphValue[0].value !== null) {
                if (paragraphValue[0].shape !== null && paragraphValue[0].color !== null) {
                  _symbol.symbolSize = getTextBox(vis, paragraphValue[0].value, _display.multipleMeasure.value.font).height * 0.8;
                  _symbol.hasSymbol = true;
                }               
              }
              
              for (var j = 0; j < paragraphValue.length; j++) {
                if ((paragraphValue[j].label !== null) && (paragraphValue[j].value !== null)) {
                  tmpWidth = getTextBox(vis, paragraphValue[j].label, _display.multipleMeasure.label.font).width + getTextBox(vis, paragraphValue[j].value, _display.multipleMeasure.value.font).width;
                  if (tmpWidth > maxValue) {
                    maxValue = tmpWidth;
                  }
                } else if (paragraphValue[j].label !== null) {
                  tmpWidth = getTextBox(vis, paragraphValue[j].label, _display.multipleMeasure.label.font).width;
                  if (tmpWidth > maxValue) {
                    maxValue = tmpWidth;
                  }                    
                } else if (paragraphValue[j].value !== null) {
                  tmpWidth = getTextBox(vis, paragraphValue[j].value, _display.multipleMeasure.value.font).width;
                  if (tmpWidth > maxValue) {
                    maxValue = tmpWidth;
                  }                    
                }
              }
            }
          }
        }
      }
      
      if (tooltipFooter) {
        for (var m = 0; m < tooltipFooter.length; m++) {
          var item = tooltipFooter[m];
          
          if (item.label && item.value) {
            tmpWidth = getTextBox(vis, item.label, _display.footer.label.font).width + getTextBox(vis, item.value, _display.footer.value.font).width;
        if (tmpWidth > maxValue) {
          maxValue = tmpWidth;
        }
          }
        }
      }
    
      return maxValue;
    }
        
    function getSymbolPath(type, size){
      var symbolPath = '', r, rx, ry; 
      switch(type){
        case 'circle' :
          r = size / 2;
          symbolPath = "M0," + r + "A" + r + "," + r + " 0 1,1 0," + (-r) + "A" + r + "," + r + " 0 1,1 0," + r + "Z";
          break;
        case "cross" :
          rx = size / 6;
          ry = size / 6;
          symbolPath = "M" + -3 * rx + "," + -ry + "H" + -rx + "V" + -3 * ry + "H" + rx + "V" + -ry + "H" + 3 * rx + "V" + ry + "H" + rx + "V" + 3 * ry + "H" + -rx + "V" + ry + "H" + -3 * rx + "Z";
          break;
        case "triangle-down" :
          rx = size / 2;
          ry = size / 2;
          symbolPath = "M0," + ry + "L" + rx + "," + -ry + " " + -rx + "," + -ry + "Z";
          break;
        case "triangle-up" :
          rx = size / 2;
          ry = size / 2;
          symbolPath = "M0," + -ry + "L" + rx + "," + ry + " " + -rx + "," + ry + "Z";
          break;
        case "diamond" :
          rx = size / 2;
          ry = size / 2;
          symbolPath = "M0," + -ry + "L" + rx + ",0" + " 0," + ry + " " + -rx + ",0" + "Z";
          break;
        case 'squareWithRadius' : 
          r = size / 2;
          var radius = r - 3;
          symbolPath = "M0," +  -r + "L" + -radius + ","+ -r + "Q" + -r +"," + -r + " " + -r + "," + -radius + "L" + -r +"," + radius + "Q" + -r + "," + r + " " + -radius + "," + r + "L" + radius + "," + r +"Q" + r + "," + r + " " + r + "," +radius + "L" + r +"," + -radius + "Q" + r + "," + -r + " "+ radius + "," + -r +"Z";
          break;
        case 'square' :
          r = size / 2;
          symbolPath = "M" + -r + "," + -r + "L" + r + "," + -r + " " + r + "," + r + " " + -r + "," + r + "Z";
          break;
        case "triangle-left" :
          rx = size / 2;
          ry = size / 2;
          symbolPath = "M" + -rx + ",0L" + rx + "," + ry + " " + rx + "," + -ry + "Z";
          break;
        case "triangle-right" :
          rx = size / 2;
          ry = size / 2;
          symbolPath = "M" + rx + ",0L" + -rx + "," + ry + " " + -rx + "," + -ry + "Z";
          break;
        case "intersection" :
          rx = size / 2;
          ry = size / 2;
          symbolPath = "M" + rx + ',' + ry + ' ' +  rx/3 + ',0 ' + rx + ',' + -ry + ' ' + rx / 2 + ',' + -ry + ' 0,' + -ry/3 + ' ' + -rx / 2 + ',' + -ry + ' ' + -rx + ',' + -ry + ' ' + -rx/3 + ',0 ' + -rx + ',' + ry + ' ' + -rx/2 + ',' + ry + ' 0,' + ry/3 + ' ' + rx/2 + ',' + ry;
          break;
      }
      
      return symbolPath;
    }
      
    function drawSymbolV2(vis, pos, symbolType, color, symbolSize, className) {
      var parameter = {
        drawingEffect: _properties.drawingEffect,
        fillColor : color,
        graphType : symbolType,
        direction : 'vertical'
      };
        
      var fillId =  effectManager.register(parameter);
      vis.append('path').attr('d', getSymbolPath(symbolType, symbolSize)).attr('transform', 'translate(' + pos.x + ',' + pos.y + ')').attr('fill', fillId).attr('class', className);
    } 
        
    function drawContentV2(vis, pos, data, markerPos) {
      //Because yStart starts at a offset radius in function drawShape, to substract radius here.
      var xStart = pos.x, yStart = pos.y - _shapeLayout.radius / 2;
      //var markerPos = properties.orientation;
      var markerWidth = _shapeLayout.markerWidth, markerHeight = _shapeLayout.markerHeight;
      
      if (markerPos === 'left') {
        xStart += markerHeight;
      }
      if (markerPos === 'top') {
        yStart += markerHeight;
      }
  
      var multipleHorizontal = _display.multipleMeasure.padding.horizontal, multipleVertical = _display.multipleMeasure.padding.vertical, multipleInline = _display.multipleMeasure.padding.inline, symbolGap = _display.multipleMeasure.padding.symbolGap, 
          defaultSpace = _display.multipleMeasure.padding.defaultSpace;
      var symbolSize = _symbol.symbolSize, hasSymbol = _symbol.hasSymbol;
      var titleColor = _display.title.color, titleFont = _display.title.font;
      var multipleLabelFont = _display.multipleMeasure.label.font, multipleLabelColor = _display.multipleMeasure.label.color, 
          singleLabelFont = _display.singleMeasure.label.font, singleLabelColor = _display.singleMeasure.label.color;
      var multipleValueFont = _display.multipleMeasure.value.font, multipleValueColor = _display.multipleMeasure.value.color, 
          singleValueFont = _display.singleMeasure.value.font, singleValueColor = _display.singleMeasure.value.color;
      var footerInline = _display.footer.padding.inline, footerLabelFont = _display.footer.label.font, 
          footerValueFont = _display.footer.value.font, footerLabelColor = _display.footer.label.color, 
          footerValueColor = _display.footer.value.color;
      var tooltipBody = data.body, tooltipFooter = data.footer;
      var currentBodyIndex = -1, currentFooterIndex = -1;
      var rowPos = {
                x : 0,
                y : 0
            };
        
      var isBreak = false;
        
        if (tooltipBody) {

          for (var i = 0; i < tooltipBody.length; i++) {
            
            if (isBreak) {
              break;
            }
            
            var paragraph = tooltipBody[i];
            if (paragraph.name) {
              var titleBox = getTextBox(vis, paragraph.name, titleFont);
              var titleHeight = titleBox.height;          
              rowPos.x = xStart + multipleHorizontal;
              if (i === 0) {
                rowPos.y = yStart + titleHeight + multipleVertical;
              }
              else {
                rowPos.y += (yStart + titleHeight + multipleInline);
              }
              
              drawTextV2(vis, rowPos, paragraph.name, titleColor, titleFont, _paragraphTitleClassName);
              currentBodyIndex++;
              if (_truncationParameter.isTruncated && currentBodyIndex === _truncationParameter.currentBodyIndex) {
                var valueBox1 = getTextBox(vis, _truncationParameter.defaultValue, _truncationParameter.font);
                rowPos.x = xStart + (tooltipWidth - valueBox1.width - multipleHorizontal);
                rowPos.y += (multipleInline + valueBox1.height);
                drawTextV2(vis, rowPos, _truncationParameter.defaultValue, _truncationParameter.color, _truncationParameter.font, _paragraphValueTextClassName);    
                break;
              }
            }
            
            if (paragraph.val.length > 0) {
              
              if (paragraph.val.length > 1) {
                var labelBox = null, valueBox = null, offset = null;
                for (var j = 0; j < paragraph.val.length; j++) {
                  
                  if ((paragraph.val[j].shape !== null) && (paragraph.val[j].color !== null) && (paragraph.val[j].label !== null) && (paragraph.val[j].value !== null)) {                     
                    labelBox = getTextBox(vis, paragraph.val[j].label, multipleLabelFont);
                    valueBox = getTextBox(vis, paragraph.val[j].value, multipleValueFont);
                    offset = (labelBox.height >= valueBox.height) ? labelBox.height: valueBox.heigth;
                    
                    rowPos.x = xStart + multipleHorizontal + symbolSize / 2;
                    rowPos.y += (multipleInline + offset);
                    //drawSymbol
                    drawSymbolV2(vis, {x: rowPos.x, y: (rowPos.y - symbolSize/2)}, paragraph.val[j].shape,  paragraph.val[j].color, symbolSize, _symbolClassName);
                    
                    rowPos.x = xStart + multipleHorizontal + symbolSize + symbolGap;
                    drawTextV2(vis, rowPos, paragraph.val[j].label, multipleLabelColor, multipleLabelFont, _paragraphLabelTextClassName);
                    
                    rowPos.x = xStart + (tooltipWidth - valueBox.width - multipleHorizontal);
                    drawTextV2(vis, rowPos, paragraph.val[j].value, multipleValueColor, multipleValueFont, _paragraphValueTextClassName);                          
                  } else if ((paragraph.val[j].shape !== null) && (paragraph.val[j].color !== null) && (paragraph.val[j].label !== null)) {
                    labelBox = getTextBox(vis, paragraph.val[j].label, multipleLabelFont);
                    rowPos.x = xStart + multipleHorizontal + symbolSize / 2;
                    rowPos.y += (multipleInline + labelBox.height);
                    //drawSymbol
                    drawSymbolV2(vis, {x: rowPos.x, y: (rowPos.y - symbolSize/2)}, paragraph.val[j].shape, paragraph.val[j].color, symbolSize, _symbolClassName);
                    
                    rowPos.x = xStart + multipleHorizontal + symbolSize + symbolGap;
                    drawTextV2(vis, rowPos, paragraph.val[j].label, multipleLabelColor, multipleLabelFont, _paragraphLabelTextClassName);

                  } else if ((paragraph.val[j].shape !== null) && (paragraph.val[j].color !== null) && (paragraph.val[j].value !== null)) {
                    valueBox = getTextBox(vis, paragraph.val[j].value, multipleValueFont);
                    rowPos.x = xStart + multipleHorizontal + symbolSize / 2;
                    rowPos.y += (multipleInline + valueBox.height);
                    //drawSymbol
                    drawSymbolV2(vis, {x: rowPos.x, y: (rowPos.y - symbolSize/2)}, paragraph.val[j].shape, paragraph.val[j].color, symbolSize, _symbolClassName);
                    
                    rowPos.x = xStart + tooltipWidth - valueBox.width - multipleHorizontal;
                    drawTextV2(vis, rowPos, paragraph.val[j].value, multipleValueColor, multipleValueFont, _paragraphValueTextClassName);
                  
                  } else if ((paragraph.val[j].label !== null) && (paragraph.val[j].value !== null)) {
                    labelBox = getTextBox(vis, paragraph.val[j].label, multipleLabelFont);
                    valueBox = getTextBox(vis, paragraph.val[j].value, multipleValueFont);
                    offset = (labelBox.height >= valueBox.height) ? labelBox.height: valueBox.heigth;
     
                    rowPos.x = xStart + multipleHorizontal;
                    rowPos.y += (multipleInline + offset);
                    drawTextV2(vis, rowPos, paragraph.val[j].label, multipleLabelColor, multipleLabelFont, _paragraphLabelTextClassName);
                    
                    rowPos.x = xStart + (tooltipWidth - valueBox.width - multipleHorizontal);
                    drawTextV2(vis, rowPos, paragraph.val[j].value, multipleValueColor, multipleValueFont, _paragraphValueTextClassName);
                  }
                  
                  currentBodyIndex++;
                  if (_truncationParameter.isTruncated && currentBodyIndex === _truncationParameter.currentBodyIndex) {
                    var valueBox2 = getTextBox(vis, _truncationParameter.defaultValue, _truncationParameter.font);
                    rowPos.x = xStart + (tooltipWidth - valueBox2.width - multipleHorizontal);
                    rowPos.y += (multipleInline + valueBox2.height);
                    drawTextV2(vis, rowPos, _truncationParameter.defaultValue, _truncationParameter.color, _truncationParameter.font, _paragraphValueTextClassName);
                    isBreak = true;
                    break;
                  }  
                }
                
              } else if (paragraph.val.length === 1) {
                if (paragraph.val[0].value !== null) {
                  var tempValueBox = getTextBox(vis, paragraph.val[0].value, multipleValueFont);
                  rowPos.y += (multipleInline + tempValueBox.height);
                  
                  if (_properties.chartType === 'heatmap' || _properties.chartType === 'treemap' || _properties.chartType === 'tagcloud' || _properties.chartType === 'geo' ||_properties.chartType === 'mekko') {
                    rowPos.x = xStart + (tooltipWidth - tempValueBox.width - multipleHorizontal);

                  } else if (paragraph.val[0].shape !== null && paragraph.val[0].color !== null) {
                    rowPos.x = xStart + multipleHorizontal + symbolSize / 2;
                    drawSymbolV2(vis, {x: rowPos.x, y: (rowPos.y - symbolSize/2)}, paragraph.val[0].shape, paragraph.val[0].color, symbolSize, _symbolClassName);
                    rowPos.x = xStart + (tooltipWidth - tempValueBox.width - multipleHorizontal);
                    
                  }
                  drawTextV2(vis, rowPos, paragraph.val[0].value, multipleValueColor, multipleValueFont, _paragraphValueTextClassName);
                  
                  currentBodyIndex++;
                  if (_truncationParameter.isTruncated && currentBodyIndex === _truncationParameter.currentBodyIndex) {
                    var valueBox3 = getTextBox(vis, _truncationParameter.defaultValue, multipleValueFont);
                    rowPos.x = xStart + (tooltipWidth - valueBox3.width - multipleHorizontal);
                    rowPos.y += (multipleInline + valueBox3.height);
                    drawTextV2(vis, rowPos, _truncationParameter.defaultValue, _truncationParameter.color, _truncationParameter.font, _paragraphValueTextClassName);    
                    break;
                  }
                }
              }
            }
          }
        }
        
        if (tooltipFooter && tooltipFooter.length > 0) {
          //draw seperated line
                var separateLineStart = {
                      x: xStart,
                      y: rowPos.y + multipleVertical
                    };
 
                var separateLineEnd = {
                      x: xStart + tooltipWidth,
                      y: rowPos.y + multipleVertical
                    };
                
                vis.append('line').attr('x1', separateLineStart.x + 1).attr('y1', separateLineStart.y).attr('x2', separateLineEnd.x - 1).attr('y2', separateLineEnd.y).style('stroke',  _defaultToolTipColors.separateLineSingleColor).style('stroke-width', 1).style('shape-rendering', 'crispEdges');
            rowPos.y += (multipleVertical * 2);
        
            //draw footer
            for (var k = 0; k < tooltipFooter.length; k++) {
              if (TypeUtils.isExist(tooltipFooter[k].label) && TypeUtils.isExist(tooltipFooter[k].value)) {
                var footerLabelBox = getTextBox(vis, tooltipFooter[k].label, footerLabelFont), footerValueBox = getTextBox(vis, tooltipFooter[k].value, footerValueFont);
                rowPos.x = xStart + multipleHorizontal;
                if (k > 0) {
                  rowPos.y += footerInline;
                }
                
                rowPos.y += (footerLabelBox.height);
                //draw label
                drawTextV2(vis, rowPos, tooltipFooter[k].label, footerLabelColor, footerLabelFont, _footerLabelClassName);
                
                rowPos.x = xStart + (tooltipWidth - footerValueBox.width - multipleHorizontal);
                //draw value
                drawTextV2(vis,rowPos, tooltipFooter[k].value, footerValueColor, footerValueFont, _footerValueClassName);
                
                currentFooterIndex++;
                if (_truncationParameter.isTruncated && currentFooterIndex === _truncationParameter.currentFooterIndex) {
                  break;
                }
              }
            }
        }            
    }
        
    var formatTooltipData = function(data){
      if(TypeUtils.isExist(_properties.formatString)){
        var body = data.body, ibody, valueAxis0sum = 1, valueAxis0Count = 0, valueAxis1sum = 1, valueAxis1Count =0, t0count = data.valueAxis0Count, t1count = data.valueAxis1Count;
        var indexAxis0 = 0, indexAxis1 = 0;
        var formatString = _properties.formatString;
        var iFormatString,indexOfFS;
        if(TypeUtils.isExist(body)){
          for(var i=0, len=body.length; i< len; i++){
            ibody = body[i];
            if(TypeUtils.isExist(ibody.val[0].valueAxis)){
              indexOfFS = ibody.val[0].valueAxis;
            }
            else {
              indexOfFS = 0;
            }
            iFormatString = formatString[indexOfFS];
            //if formatstring is unll or undefined ,we will use the default value
            if(TypeUtils.isExist(iFormatString)){
              var indexOfiFS = 0;
              if(indexOfFS===0){
                indexOfiFS = indexAxis0 >= iFormatString.length ? iFormatString.length -1 : indexAxis0;
                indexAxis0++;
              }
              else if(indexOfFS===1){
                indexOfiFS = indexAxis1 >= iFormatString.length ? iFormatString.length -1 : indexAxis1;
                indexAxis1++;
              }
              for(var j=0, jlen= ibody.val.length; j < jlen; j++){
                          ibody.val[j].value = formatManager.format(ibody.val[j].value, iFormatString[indexOfiFS]);
              }
            }
            
          }
        }
      }
      return data;
    };
    
    tooltip.showTooltip = function (eventData) {
      var data = ObjectUtils.extend(true, {}, eventData.data);
      data = formatTooltipData(data);
      if(gWrapper !== null){
        gWrapper.remove();
      }
      
      if (_properties.visible) {
        if (data.plotArea) {
            tooltip.plotArea(data.plotArea);
        }
        
        _orientation = _properties.orientation;
        gWrapper = vis.append('svg:g');
        updateTooltipStyle();
      
        textMaxWidth = getTextMaxWidthV2(vis, data);
        tooltipWidth = getTooltipWidthV2(gWrapper, data);
        tooltipHeight = getTooltipHeightV2(gWrapper, data);
          
        var tmpWidth = tooltipWidth, tmpHeight = tooltipHeight;
        if (_orientation === 'top' || _orientation === 'bottom') {
          tmpHeight += _shapeLayout.markerHeight;
        }
        
        if (_orientation === 'left' || _orientation === 'right') {
          tmpWidth += _shapeLayout.markerHeight;
        }
        vis.attr('width', tmpWidth + _shapeLayout.padding).attr('height', tmpHeight + _shapeLayout.padding);
        
        //appendLinearGradient(gWrapper);
  
        var tooltipPos = calculatePos(data.point, plotArea, zone, tooltipWidth, tooltipHeight);
        drawShape(gWrapper, {x:0,y:0, absoluteMarkerOffset : tooltipPos.absoluteMarkerOffset}, tooltipWidth, tooltipHeight, _orientation);
        drawContentV2(gWrapper, {x:0,y:0}, data, _orientation);
        vis.style('left', tooltipPos.x + 'px').style('top', tooltipPos.y + 'px');
        clearTruncationParameter();
      }
    };  
    
    tooltip.hideTooltip = function () {
      if (gWrapper !== null) {
        gWrapper.remove();
        vis.attr('width', 0).attr('height', 0);
        gWrapper = null;
        }
    };
    
    function calculateSymbolSize(data) {
      if (data.labels) {
        _symbol.symbolSize = getTextBox(vis, data.labels[0].label, _display.multipleMeasure.label.font).height;
      }
    }
    
      function calculatePos(point, plotArea, zone, tooltipWidth, tooltipHeight) {
      var tooltipPos = {
          x: 0,
          y: 0,
          absoluteMarkerOffset: 0
      };
      
      var chartType = _properties.chartType;
      var markerHeight = _shapeLayout.markerHeight, markerWidth = _shapeLayout.markerWidth;
      var rightOffset = 0,  leftOffset = 0, topOffset = 0, bottomOffset = 0;

//      if (tooltipWidth > zone.width || tooltipHeight > zone.height) {
//        return tooltipPos;
//      } 
      
      if (_properties.chartType === undefined) {
        tooltipPos.x = point.x;
        tooltipPos.y = point.y - tooltipHeight/2;
      } else if (chartType === 'heatmap' || chartType === 'treemap' || chartType === 'tagcloud') {
        
        if (_orientation === 'bottom') {
          var upBorder = zone.height - point.y + tooltipHeight + markerHeight;
          if (upBorder > zone.height) {
            _orientation = 'top';
            tooltipPos.y = point.y;
          } else {
            tooltipPos.y = point.y - tooltipHeight - markerHeight;
          }
        }
        
        var tooltipPosX;
        if (chartType === 'heatmap' || chartType === 'treemap' || chartType === 'tagcloud') 
        {
            tooltipPosX = calculateTooltipPosXForMBCCharts(point, plotArea, zone, tooltipWidth);
        }
        else
        {
            tooltipPosX = calculateTooltipPosX(point, plotArea, zone, tooltipWidth);
        }

        tooltipPos.x = tooltipPosX.x;
        tooltipPos.absoluteMarkerOffset = tooltipPosX.absoluteMarkerOffset;
        
      } else if (chartType === 'line' || chartType === 'verticalboxplot' || chartType === 'verticalbar') {
        if (_orientation === 'left') {
          var rightBorder = point.x + tooltipWidth + markerHeight;
          if (rightBorder > zone.width) {
            _orientation = 'right';
            tooltipPos.x = point.x - tooltipWidth - markerHeight;
          } else {
            tooltipPos.x = point.x + markerHeight;
          }
        }
        if (tooltipHeight / 2 < plotArea.y) {
          //tooltip marker is over chart top border.
          tooltipPos.y = plotArea.y - (tooltipHeight - markerWidth) / 2;
        } else {
          tooltipPos.y = 0;
        }
        
      } else if (chartType === 'radar') {
        rightOffset = 0;
        leftOffset = 0;
        topOffset = 0;
        bottomOffset = 0;
        var x = 0, y = 0;
        
        _orientation = point.orientation;
        tooltipPos.x = point.x;
        tooltipPos.y = point.y - tooltipHeight / 2;
        
        if (point.orientation === 'right') {
          tooltipPos.x -= (tooltipWidth + markerHeight);
        }
        
        if (point.orientation === 'left') {
          rightOffset = point.x + tooltipWidth + markerHeight - zone.width;

        }
        
        if (point.orientation === 'right') {
          leftOffset = point.x - tooltipWidth - markerHeight;
        }
        
        topOffset = point.y - tooltipHeight / 2;
        bottomOffset = point.y + tooltipHeight / 2 - zone.height;
        
        if (rightOffset <= 0 && leftOffset >= 0 && topOffset >= 0 && bottomOffset <= 0) {
          return tooltipPos;
        }
        
        if (rightOffset > 0 &&  rightOffset > point.range.x) {
          return tooltipPos;
        }
        
        if (leftOffset < 0 && Math.abs(leftOffset) > point.range.x) {
          return tooltipPos;
        }
        
        if (topOffset < 0 && Math.abs(topOffset) > point.range.y) {
          return tooltipPos;
        }
        
        if (bottomOffset > 0 && bottomOffset > point.range.y) {
          return tooltipPos;
        }
        
        var angle = point.angle * 180 / Math.PI, radian = point.angle;
        
        if (angle >= 0) {

          if (angle === 0 && rightOffset > 0) {
            tooltipPos.x -= rightOffset;
          } else if (angle === 90 && topOffset < 0) {
            tooltipPos.y -= topOffset;
          } else if (angle === 180 && leftOffset < 0) {
            tooltipPos.x -= leftOffset;
          } else if (angle > 0 && angle < 90) {
            if (topOffset < 0 && rightOffset > 0) {
              //both tooltip top and right border cross chart top and right border
              var  topOffsetAbs1 = Math.abs(topOffset);
              if (topOffsetAbs1 >= rightOffset) {
                y = topOffsetAbs1;
                x = y / Math.tan(radian);
              } else  {
                x = rightOffset;
                y = x * Math.tan(radian);
                
              }
            } else if (topOffset < 0 && rightOffset <= 0) {
              //only tooltip top border cross chart top border
              y = Math.abs(topOffset);
              x = y / Math.tan(radian);
            } else if (topOffset >= 0 && rightOffset > 0) {
              //only tooltip right border cross chart right border
              x = rightOffset;
              y = x * Math.tan(radian);
            }
            
            tooltipPos.x -=x;
            tooltipPos.y += y;
            
          } else if (angle > 90 && angle < 180) {
            if (topOffset < 0 && leftOffset < 0) {
              //both tooltip top and left border cross chart top and left border
              var topOffsetAbs2 = Math.abs(topOffset), leftOffsetAbs1 = Math.abs(leftOffset);
              if (topOffsetAbs2 >= leftOffsetAbs1) {
                y = topOffsetAbs2;
                x = y / Math.tan(Math.PI - radian);
              } else {
                x = leftOffsetAbs1;
                y = x * Math.tan(Math.PI - radian);
              }
              
            } else if (topOffset < 0 && leftOffset >= 0) {
              //only tooltip top border cross chart top border
              y = Math.abs(topOffset);
              x = y / Math.tan(Math.PI - radian);
              
            } else if (topOffset >= 0 && leftOffset < 0) {
              //only tooltip left border cross chart left border
              x = Math.abs(leftOffset);
              y = x * Math.tan(Math.PI -radian);
            }
            
            tooltipPos.x +=x;
            tooltipPos.y += y;
          }
          
        } else {
          
          var angleAbs = Math.abs(angle);
          if (angleAbs === 0 && rightOffset > 0) {
            tooltipPos.x -= rightOffset;
          } else if (angleAbs === 90 && bottomOffset > 0) {
            tooltipPos.y -= bottomOffset;
          } else if (angleAbs === 180 && leftOffset < 0) {
            tooltipPos.x -= leftOffset;
          } else if (angleAbs > 0 && angleAbs < 90) {
            if (bottomOffset > 0 && rightOffset > 0) {
              //both tooltip bottom and right border cross chart top and right border
              if (bottomOffset >= rightOffset) {
                y = bottomOffset;
                x = y / Math.tan(Math.abs(radian));
              } else  {
                x = rightOffset;
                y = x * Math.tan(Math.abs(radian));
                
              }
            } else if (bottomOffset > 0 && rightOffset <= 0) {
              //only tooltip bottom border cross chart bottom border
              y = bottomOffset;
              x = y / Math.tan(Math.abs(radian));
            } else if (bottomOffset <= 0 && rightOffset > 0) {
              //only tooltip right border cross chart right border
              x = rightOffset;
              y = x * Math.tan(Math.abs(radian));
            }
            
            tooltipPos.x -=x;
            tooltipPos.y -= y;            
          } else if (angleAbs > 90 && angleAbs < 180) {
            if (bottomOffset > 0 && leftOffset < 0) {
              var leftOffsetAbs2 = Math.abs(leftOffset);
              //both tooltip bottomOffset and left border cross chart top and left border
              if (bottomOffset >= leftOffsetAbs2) {
                y = bottomOffset;
                x = y / Math.tan(Math.PI - Math.abs(radian));
              } else {
                x = leftOffsetAbs2;
                y = x * Math.tan(Math.PI - Math.abs(radian));
              }
              
            } else if (bottomOffset > 0 && leftOffset >= 0) {
              //only tooltip bottom border cross chart bottom border
              y = bottomOffset;
              x = y / Math.tan(Math.PI - Math.abs(radian));
              
            } else if (bottomOffset <= 0 && leftOffset < 0) {
              //only tooltip left border cross chart left border
              x = Math.abs(leftOffset);
              y = x * Math.tan(Math.PI -Math.abs(radian));
            }
            
            tooltipPos.x +=x;
            tooltipPos.y -= y;            
          }      
        }
        
      } else if (chartType === 'geo' && _orientation === 'left'){
        // In this style, tooltip will always point to the plot origin horizontally.
       topOffset = point.y - tooltipHeight / 2;
       bottomOffset = point.y + tooltipHeight / 2 - zone.height;
        
        tooltipPos.y = topOffset;
        
        if (plotArea.x + plotArea.width + tooltipWidth - markerHeight > zone.width) {
          tooltipPos.x = plotArea.x - plotArea.width - tooltipWidth;
          _orientation = 'right';
        } else {
          tooltipPos.x = plotArea.x + plotArea.width - markerHeight;
        }

        if (topOffset < 0) {
          tooltipPos.y = 0;
          tooltipPos.absoluteMarkerOffset = topOffset;
        }
        
        if (bottomOffset > 0) {
          tooltipPos.y = zone.height - tooltipHeight;
          tooltipPos.absoluteMarkerOffset = bottomOffset;
        }
      } else {
        
        if (_properties.orientation === 'left') {
          
          rightOffset = plotArea.x + plotArea.width + tooltipWidth + markerHeight - zone.width;
          topOffset = point.y - tooltipHeight / 2;
          bottomOffset = point.y + tooltipHeight / 2 - zone.height;
          
          tooltipPos.y = point.y - tooltipHeight / 2;
          
          if (rightOffset > 0) {
            tooltipPos.x = zone.width - markerHeight - tooltipWidth;
          } else {
            tooltipPos.x = plotArea.x + plotArea.width - markerHeight;
          }
          
          if (topOffset < 0) {
            tooltipPos.y = 0;
            tooltipPos.absoluteMarkerOffset = topOffset;
          }
          
          if (bottomOffset > 0) {
            tooltipPos.y = zone.height - tooltipHeight;
            tooltipPos.absoluteMarkerOffset = bottomOffset;
          }

        } else if (_properties.orientation === 'bottom') {      
  
          var top = plotArea.y - tooltipHeight;
          if (top < 0) {
            tooltipPos.y = 0;
          } else {
            tooltipPos.y = plotArea.y - tooltipHeight;
          }
          
          var posX;
          if (chartType === 'heatmap' || chartType === 'treemap' || chartType === 'tagcloud') 
          {
              posX = calculateTooltipPosXForMBCCharts(point, plotArea, zone, tooltipWidth);
          }
          else
          {
              posX = calculateTooltipPosX(point, plotArea, zone, tooltipWidth);
          }
          tooltipPos.x = posX.x;
          tooltipPos.absoluteMarkerOffset = posX.absoluteMarkerOffset;
        }
        
      }

      return tooltipPos;
    }
    
    function calculateTooltipPosX(point, plotArea, zone, tooltipWidth) {
      var tooltipPosX = {
          x: 0,
          absoluteMarkerOffset: 0
      };
      
      var leftBorder = tooltipWidth / 2 - (point.x - plotArea.x) + plotArea.width;
      var rightBorder = point.x - plotArea.x + tooltipWidth / 2;
      if (leftBorder > zone.width) {
        tooltipPosX.x = plotArea.x;
        tooltipPosX.absoluteMarkerOffset = point.x - plotArea.x - tooltipWidth / 2;
      } else if (rightBorder > zone.width) {
        tooltipPosX.x = plotArea.x + (plotArea.width - tooltipWidth);
        tooltipPosX.absoluteMarkerOffset = plotArea.width - (point.x - plotArea.x) - tooltipWidth / 2;
      } else {
        tooltipPosX.x = point.x - tooltipWidth / 2;
        tooltipPosX.absoluteMarkerOffset = 0;
      }
      
      return tooltipPosX;
    }

    function calculateTooltipPosXForMBCCharts(point, plotArea, zone, tooltipWidth) {
      var tooltipPosX = {
          x: 0,
          absoluteMarkerOffset: 0
      };
      
      var leftBorder = tooltipWidth - (point.x - plotArea.x) + plotArea.width;
      var rightBorder = point.x - plotArea.x + tooltipWidth;

      if (leftBorder > zone.width) {
        tooltipPosX.x = plotArea.x;
        tooltipPosX.absoluteMarkerOffset = point.x - plotArea.x - tooltipWidth / 2;
      } else if (rightBorder > zone.width) {
        tooltipPosX.x = plotArea.x + (plotArea.width - tooltipWidth);
        
        if(tooltipPosX.x + tooltipWidth > plotArea.width)
        {
            tooltipPosX.absoluteMarkerOffset = point.x - plotArea.x - plotArea.width + tooltipWidth / 2;
        }
        else
        {
            tooltipPosX.absoluteMarkerOffset = plotArea.width - (point.x - plotArea.x) - tooltipWidth / 2;
        }
      } else {
        tooltipPosX.x = point.x - tooltipWidth / 2;
        tooltipPosX.absoluteMarkerOffset = 0;
      }
      
      return tooltipPosX;
    }
    
    function calculateTooltipPosY(point, plotArea, zone, tooltipHeight) {
      var tooltipPosY = {
          y: 0,
          absoluteMarkerOffset: 0
      };
      
      var upBorder = plotArea.height + (tooltipHeight / 2 - (point.y - plotArea.y));
      var downBorder = point.y - plotArea.y + tooltipHeight / 2;
      if (upBorder > zone.height) {
        tooltipPosY.y = plotArea.y;
        tooltipPosY.absoluteMarkerOffset = point.y - plotArea.y - tooltipHeight / 2;
      } else if (downBorder > zone.height) {
        tooltipPosY.y = plotArea.y + plotArea.height - tooltipHeight;
        tooltipPosY.absoluteMarkerOffset = point.y - (plotArea.height - tooltipHeight) - plotArea.y - tooltipHeight / 2;
      } else {
        tooltipPosY.y = point.y - tooltipHeight / 2;
        tooltipPosY.absoluteMarkerOffset = 0;
      }
      
      return tooltipPosY;
    }
    
    function drawShape(vis, pos, width, height, markerPos) {
      
      var xStart = pos.x, yStart = pos.y, offset = pos.absoluteMarkerOffset, radius = _shapeLayout.radius, markerWidth = _shapeLayout.markerWidth, markerHeight = _shapeLayout.markerHeight;
      var space = ' ';
      var lineTo = _svgPathCommand.lineToA, moveTo = _svgPathCommand.moveToA, arc = _svgPathCommand.arcA, closePath = _svgPathCommand.closePath;
      //var markerPos = properties.orientation;
      
      if (markerPos === 'left') {
        xStart += markerHeight;
      }
      if (markerPos === 'top') {
        yStart += markerHeight;
      }

      var path = moveTo + space + xStart + space + (yStart + radius) + space;

      if (markerPos === 'left') {
          path += lineTo + space + xStart + space + (yStart + height / 2 + offset - markerWidth / 2 ) + space;
          path += lineTo + space + (xStart - markerHeight) + space + (yStart + height / 2 + offset ) + space;
          path += lineTo + space + xStart + space + (yStart + height / 2 + offset + markerWidth / 2 ) + space;
      }

      path += lineTo + xStart + space + (yStart + height - radius) + space;

      path += arc + space + radius + space + radius + space + '0' + space + '0' + space + '0' + space + (xStart + radius) + space + (yStart + height) + space;

      if (markerPos === 'bottom') {
          path += lineTo + space + (xStart + width / 2 + offset - markerWidth / 2) + space + (yStart + height) + space;
          path += lineTo + space + (xStart + width / 2 + offset) + space + (yStart + height + markerHeight) + space;
          path += lineTo + space + (xStart + width / 2 + offset + markerWidth / 2) + space + (yStart + height) + space;
      }

      path += lineTo + space + (xStart + width - radius) + space + (yStart + height) + space;

      path += space + arc + space + radius + space + radius + space + '0' + space + '0' + space + '0' + space + (xStart + width) + space + (yStart + height - radius) + space;

      if (markerPos === 'right') {
          path += lineTo + space + (xStart + width) + space + (yStart + height / 2 + offset + markerWidth / 2) + space;
          path += lineTo + space + (xStart + width + markerHeight) + space + (yStart + height / 2 - offset) + space;
          path += lineTo + space + (xStart + width) + space + (yStart + height / 2 + offset - markerWidth / 2) + space;
      }

      path += lineTo + space + (xStart + width) + space + (yStart + radius) + space;

      path += space + arc + space + radius + space + radius + space + '0' + space + '0' + space + '0' + space + (xStart + width - radius) + space + yStart + space;

      if (markerPos === 'top') {
          path += lineTo + space + (xStart + width / 2 + offset + markerWidth / 2) + space + yStart + space;
          path += lineTo + space + (xStart + width / 2 + offset) + space + (yStart - markerHeight) + space;
          path += lineTo + space + (xStart + width / 2 + offset - markerWidth / 2) + space + yStart + space;
      }

      path += lineTo + space + (xStart + radius) + space + yStart + space;

      path += arc + space + radius + space + radius + space + '0' + space + '0' + space + '0' + space + xStart + space + (yStart + radius) + space;

      path += closePath;
      
      vis.append('path').attr('d', path).attr('fill', _defaultToolTipColors.backgroundColor).attr('stroke', _defaultToolTipColors.borderColor).style('stroke-width', 1).style('-webkit-svg-shadow', '3px 3px 8px rgba(0, 0, 0, 0.3)');

    }

    function getCustomlabel(rawObj){
      var ret;
      if(rawObj.info){
        var clobj = rawObj.info.customlabel;
        if(clobj){
          if(clobj.type === 'url'){
            ret = rawObj.val;
          }else if(clobj.type === 'string'){
            ret = clobj.val;
          }
        }else{
          ret = rawObj.val;
        }
      }else{
        ret = rawObj.val;
      }
      ret = handleNull(ret);
      return ret;
    }
    
    function resolveText(rawObj){
      var ret = [];
      if(TypeUtils.isPlainObject(rawObj)){ 
        ret.push(getCustomlabel(rawObj));
      }else if(TypeUtils.isArray(rawObj)){
        rawObj.forEach(function(iter, index){
          ret.push(resolveText(iter));
        }, this);
      }else{
        ret.push(rawObj);
      }
      return ret;
    }
    
    function getTextBox(vis, text, style) {
      /*[Jimmy/1/2/2013]we extend text to also accepts Object with following structure: 
       * {
       *   val: xxxx
       *   info: xxxx
       * }, same structure as we used in module. then we can support additional info like customlabel in tooltip
       * text can also be array, we will compose each member with '/' (hard coded currently) and measure the final result
       */
      var resolvedTexts = resolveText(text);
      var composedText = resolvedTexts.join('*');
      var textHandler = vis.append('svg:text').attr('x', 0).attr('y', 0).attr('visibility', 'hidden').style('font', style).text(composedText);
      var bbox = textHandler.node().getBBox();
      textHandler.remove();
      return bbox;
    }

    function getTextMaxWidth(vis, data) {
      var maxValue = 0, textWidth = 0;
      if (data.title !== null) {
          if (data.labels.length > 0) {
              var bBox = getTextBox(vis, data.title, _display.title.font);
              var currentMax = bBox.width;

              for (var i = 0, len = data.labels.length; i < len; i++) {
                 textWidth = getTextBox(vis, data.labels[i].label, _display.multipleMeasure.label.font).width + getTextBox(vis, data.labels[i].value, _display.multipleMeasure.value.font).width;
                  if (textWidth > currentMax) {
                      currentMax = textWidth;
                  }
              }
              maxValue = currentMax;
          }
      } else {
          maxValue = getTextBox(vis, data.labels[0].label, _display.singleMeasure.label.font).width;
          textWidth = getTextBox(vis, data.labels[0].value, _display.singleMeasure.value.font).width;

          if (textWidth > maxValue) {
              maxValue = textWidth;
          }
      }
      return maxValue;
    }

    function getTooltipWidth(vis, data) {
      var tooltipWidth = 0, symbolSize = _symbol.symbolSize;
      var singleHorizontal = _display.singleMeasure.padding.horizontal, multipleHorizontal = _display.multipleMeasure.padding.horizontal, symbolGap = _display.multipleMeasure.padding.symbolGap, defaultSpace = _display.multipleMeasure.padding.defaultSpace;
      if (data.title !== null) {
        tooltipWidth = textMaxWidth + (multipleHorizontal * 2) + defaultSpace; //+ radius * 2;
        if (data.shapes && data.colors) {
          tooltipWidth +=  symbolSize + symbolGap;
        }
      } else {
        tooltipWidth = textMaxWidth + (singleHorizontal * 2); 
      }
      return tooltipWidth;
    }

    function getTooltipHeight(vis, data) {
      var inline = _display.multipleMeasure.padding.inline, multipleVertical = _display.multipleMeasure.padding.vertical, singleVertical = _display.singleMeasure.padding.vertical;
      var multipleValueFont = _display.multipleMeasure.value.font, singleValueFont = _display.singleMeasure.value.font;
      var titleFont = _display.title.font;
      var tooltipHeight = 0;
        if (data.title !== null) {
            tooltipHeight = (multipleVertical * 3) + (inline * (data.labels.length - 1)) + getTextBox(vis, data.title, titleFont).height + getTextBox(vis, data.labels[0].value, multipleValueFont).height * data.labels.length;

        } else {
            tooltipHeight = (singleVertical * 3 ) + getTextBox(vis, data.labels[0].value, singleValueFont).height;
        }
        return tooltipHeight;
    }
        
    function appendLinearGradient(vis) {
      var gradient = vis.append('svg:defs').append('svg:linearGradient').attr('id', 'tooltipGradient1').attr('x1', '0%').attr('y1', '0%').attr('x2', '80%').attr('y2', '0%').attr('x3', '100%').attr('y3', '0%');
      gradient.append('svg:stop').attr('offset', '30%').attr('style', 'stop-color:' + _defaultToolTipColors.separateLineColor[0]);
      gradient.append('svg:stop').attr('offset', '60%').attr('style', 'stop-color:' + _defaultToolTipColors.separateLineColor[1]);
      gradient.append('svg:stop').attr('offset', '100%').attr('style', 'stop-color:' + _defaultToolTipColors.separateLineColor[2]);          
    }
  
    function drawSymbol(vis, pos, symbolSize, symbolType, color) {
      var symbolPath = d3.svg.symbol().type(symbolType).size(symbolSize * symbolSize);
      var parameter = {
          drawingEffect: _properties.drawingEffect,
          fillColor : color,
        graphType : symbolType,
          direction : 'vertical'
      };
      var fillId =  effectManager.register(parameter);
      vis.append('path').attr('d', symbolPath).attr('transform', 'translate(' + pos.x + ',' + pos.y + ')').attr('fill', fillId);
    } 
        
    function drawText(vis, pos, text, color, style) {
      vis.append('text').attr('x', pos.x).attr('y', pos.y).attr('fill', color).style('font', style).text(text);
    }
        
    function drawTextV2(vis, pos, text, color, style, className) {
      /*[Jimmy/1/2/2013]we extend text to also accepts Object with following structure: 
       * {
       *   val: xxxx
       *   info: xxxx
       * }, same structure as we used in module. then we can support additional info like customlabel in tooltip
       * text can also be array, we will compose each member with '/' (hard coded currently) and measure the final result
       */
      var resolvedTexts = resolveText(text);
      var composedText = resolvedTexts.join('/');
      vis.append('text').attr('x', pos.x).attr('y', pos.y).attr('fill', color).style('font', style).text(composedText).attr('class', className);
    }
    
    function drawContent(vis, pos, data) {}
        
    tooltip.zone = function(_){
      if(!arguments.length){
        return zone;
      }
      zone = _;
      return this;
    };
  
    tooltip.plotArea = function(_){
      if(!arguments.length){
        return plotArea;
      }
      plotArea = _;
      return this;
    };
        
    tooltip.properties = function (_) {
      if (!arguments.length){
          return _properties;
       }
      Objects.extend(true, _properties, _);
      return this;
    };
    
    function updateTooltipStyle() {
      var cssDef;
      
      cssDef = ctx.styleManager.query('viz-tooltip-background');
      if (cssDef && (cssDef['fill']) && (_defaultToolTipColors.backgroundColor !== cssDef['fill'])) {
        _defaultToolTipColors.backgroundColor = cssDef['fill'];
      }
      
      cssDef = ctx.styleManager.query('viz-tooltip-title');
      if (cssDef && (cssDef['fill']) && (_display.title.color !== cssDef['fill'])) {
        _display.title.color = cssDef['fill'];
      }

      cssDef = ctx.styleManager.query('viz-tooltip-label');
      if (cssDef && cssDef['fill']) {
        _display.singleMeasure.label.color  = cssDef['fill'];
        _display.multipleMeasure.label.color = cssDef['fill'];
      }

      cssDef = ctx.styleManager.query('viz-tooltip-value');
      if (cssDef && cssDef['fill']) {
        _display.singleMeasure.value.color  = cssDef['fill'];
        _display.multipleMeasure.value.color = cssDef['fill'];
      } 
    }
    
    _properties = manifest.props(null);
    return tooltip;
  };
  return tooltip;
});