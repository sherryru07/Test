sap.riv.module(
{
  qname : 'sap.viz.modules.legend.colorLegendArea',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.util.TextUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.dispatch',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.DrawUtil',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.Repository',
  version : '4.0.0'
}
],
function Setup(TextRuler, dispatch, DrawUtil, Repository) {
  var colorLegendArea = function(ctx){
    var width = 400, height = 200, valueLabelFont = {
      'fontfamily' : "'Open Sans', Arial, Helvetica, sans-serif",
      'fontsize' : '12px',
      'fontweight' : 'normal',
      'color' : '#333333'
    }, options = {
      isHierarchy : undefined,
      position : 'right',
      legendType : 'ColorLegend'
    }, colorLabelSize = 1, shapes = [], colors = [], colorFeedLength = 0, shapeFeedLength = 0, 
    textHeight = 20, colorLabelMarginRight = 0.5, rowMarginBottom = 0.6, selectedItem = [], selectionMode = 'multiple';
    
    var effectManager = null;
    
    //alex su
    //These are two cursors to depict legend rows to be shown.
    var randomSuffix = Repository.newId();
    var startRow = 0;
    var endRow = Infinity;
    
    //Each row's position [{x: 10, y: 10}, {...}...]
    var rowPosArr = [], chartData = {};
    
    var chart = function(selection){
      selection.each(function(){
        getThemeStyleDef();
        
        var labelsData = getLabelData();  

        var isItemsOverflow =  false;
        if(labelsData.length > 0 && labelsData.length < chartData.length){
          isItemsOverflow = true;
        }

        var wrap = d3.select(this);
        wrap.attr('style', 'font-family:'+valueLabelFont.fontfamily+'; font-size:'+valueLabelFont.fontsize+'; font-weight:'+valueLabelFont.fontweight+';fill:'+valueLabelFont.color+";");
        //Create each row
        var gEnterRow = wrap.selectAll('g.row').data(labelsData, function(d, i){
          return d.val;
        });
        gEnterRow.exit().remove();
        
        var rectEnterRow = gEnterRow.enter().append('g').attr('class', function(d, i) {
          return randomSuffix+' row ID_' + i;
        });
        
        
        //alex su
        //Add 'rect' element to indicate selected/hover item.
        var indicatedItems = rectEnterRow.append('rect').attr('class', function(d, i){
          return 'legend-indicatedRect-'+randomSuffix+'-ID_' +i;
        });
        var rectMargin = rowMarginBottom * textHeight/2;
        indicatedItems.attr('width', width+10).attr('height', textHeight + rectMargin*2).attr('fill', 'rgba(255, 255, 255, 0)').attr('x', -5).attr('y', -rectMargin);

        var i, j, len, jLen, rowWrap;
        if((options.legendType !== 'BubbleColorLegend') && options.isHierarchy) {
          //Legend with hierarchy
          var labelItem, rowItems, lastRowLabel = [], itemXPos = 0, itemYPos = 0;

          for(i = 0, len = labelsData.length; i < len; i++) {
            itemXPos = 0, itemYPos = 0;
            
            //'China / 2001 / Car - Profit' TO ['China', '2001', 'Car', 'Profit']
            labelItem = labelsData[i].val;
            labelItem = labelItem.replace('-', '/');
            rowItems = labelItem.split(' / ');
            rowWrap = d3.select(this).select("g.row.ID_" + i);
            //Create each row's sub elements.
            var isShowWholeItem = false;
            for(j = 0, jLen = rowItems.length - 1; j < jLen; j++) {
              if(lastRowLabel[j] !== rowItems[j]) {
                //Only with last label and color label
                isShowWholeItem = true;
                break;
              }
            }
            
            var t = rowWrap.selectAll('g').data(rowItems);
            t.enter().append('g').attr('class', function(d, i) {
              return randomSuffix+' label ID_' + i;
            });

            for(j = 0, jLen = rowItems.length; j < jLen; j++) {
              var gWrap;
              if(j === jLen - 1) {
                //With legend marker
                gWrap = createRowWithColorLabel(rowWrap.select('g.label.ID_'+j), i, true, rowItems[j]);
                gWrap.attr('transform', function(d, index) {
                  itemXPos = 10 * j;
                  if(isShowWholeItem){
                    itemYPos = textHeight + itemYPos + rowMarginBottom * textHeight;                    
                  }
                  return 'translate(' + itemXPos + ',' + itemYPos + ')';
                });
              } else {
                if(isShowWholeItem) {
                  //No legend marker
                  gWrap = createRowWithColorLabel(rowWrap.select('g.label.ID_'+j), i, false, rowItems[j]);
                  gWrap.attr('transform', function(d, index) {
                    itemXPos = 10 * j;
                    if(j > 0){
                      itemYPos = textHeight + itemYPos + rowMarginBottom * textHeight;
                    }
                    return 'translate(' + itemXPos + ',' + itemYPos + ')';
                  });
                }
              }
              if(gWrap){
                gWrap.attr('visibility', function(d, index){
                  var visible = 'visible';
                  if((rowPosArr[i] === undefined) || (rowPosArr[i].y + itemYPos > height - textHeight)){
                    visible = 'hidden';
                    isItemsOverflow = true;
                  }
                  return visible;
                });
              }
              lastRowLabel[j] = rowItems[j];
            }
          }
          
          gEnterRow.attr('transform', function(d, i){
            if(rowPosArr[i]){
              return 'translate('+ rowPosArr[i].x + ',' + rowPosArr[i].y + ')';
            }
          });
        } else {
          //Create each row
          for(i = 0, len = labelsData.length; i < len; i++) {
            rowWrap = d3.select(this).selectAll("g.row.ID_" + i);
            createRowWithColorLabel(rowWrap, i, true, labelsData[i].val);
          }

          //Each row position
          gEnterRow.attr('transform', function(d, i) {
            if(rowPosArr[i]){
              return 'translate(' + rowPosArr[i].x + ',' + rowPosArr[i].y + ')';
            }
          }).attr('visibility', function(d, index){
            var visible = 'visible';
            if((rowPosArr[index] === undefined) || (rowPosArr[index].y > height - 2*textHeight)){
              visible = 'hidden';
              isItemsOverflow = true;
            }
            return visible;
          });
        }
        
        //Add 'rect' element to handle click event.
        var eventItems = rectEnterRow.append('rect').attr('class', function(d, i){
          return 'legend-eventRect-'+randomSuffix+'-ID_' +i;
        });
        eventItems.attr('width', width).attr('height', textHeight).attr('fill', 'rgba(255, 255, 255, 0)');
        
        //Much items ellipsis
        var itemsEllipsis = d3.select(this).selectAll('text.itemsEllipsis');
        if(itemsEllipsis.empty()){
          itemsEllipsis = d3.select(this).append('text').attr('class', 'itemsEllipsis').text('...')
            .attr('text-anchor', 'middle');
        }
        itemsEllipsis.attr('dx', width/2).attr('dy', height).attr('visibility', function(){
          var visible = 'hidden';
          if(isItemsOverflow){
            visible = 'visible';
          }
          return visible;
        });
        
        d3.select(this).on('mouseover', hoverHandler).on('mouseout', blurHandler)
          .on('mousedown', itemClicked).on('mouseup', blurHandler).on('touchend', blurHandler);
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
      colors = _;  
      return chart;
    };

    chart.shapes = function(_) {
      if(!arguments.length){
        return shapes;
      }
      shapes = _;
      return chart;
    };
    
    chart.colorFeedLength = function(_){
      colorFeedLength = _;
      return chart;
    };
    
    chart.shapeFeedLength = function(_){
      shapeFeedLength = _;
      return chart;
    };
    
    chart.data = function(_){
      if(!arguments.length){
        return chartData;
      }
      chartData = _;
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
    
    chart.getPreferredSize = function(wholeSize) {
      getThemeStyleDef();
      return _calculateRowPosition(wholeSize);
    };
    
    chart.setSelectionMode = function(_){
      selectionMode = _;
    };
    
    chart.effectManager = function(_) {
      if(!arguments.length){
        return effectManager;
      }
      effectManager = _;

      return chart;
    };
    
    var getLabelData = function(){
      var labelsData = [], len = rowPosArr.length;
      if(chartData.length > 0){
        //Split items
        labelsData = chartData.slice(0, len);
        startRow = 0;
        endRow = len;
      }
      return labelsData;
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
    
    var hoverHandler = function(){
      if(selectionMode === 'single' || selectionMode === 'none' || options.isHierarchy){ 
        return;
      }
      
      var item = d3.select(d3.event.target);
        var clickedItemClass = item.attr('class');
        
        if(!clickedItemClass || clickedItemClass.search('eventRect') === -1){
          return;
        }
        
      var id = clickedItemClass.split('ID_')[1];
      var indicatedItem = d3.selectAll('.legend-indicatedRect-'+randomSuffix+'-ID_'+id);
      indicatedItem.attr('fill', '#cccccc');
    };
    
    var blurHandler = function(){
      if(selectionMode === 'single' || selectionMode === 'none' || options.isHierarchy){
        return;
      }
      
      var item = d3.select(d3.event.target);
        var clickedItemClass = item.attr('class');
        
        if(!clickedItemClass || clickedItemClass.search('eventRect') === -1){
          return;
        }
        
        var id = clickedItemClass.split('ID_')[1];
        var indicatedItem = d3.selectAll('.legend-indicatedRect-'+randomSuffix+'-ID_'+id);
      indicatedItem.attr('fill', 'rgba(0,0,0,0)');
    };
    
    var itemClicked = function(){
      if(selectionMode === 'single' || selectionMode === 'none' || options.isHierarchy){
        return;
      }
      
      var item = d3.select(d3.event.target);
        var clickedItemClass = item.attr('class');
        
        if(!clickedItemClass || clickedItemClass.search('eventRect') === -1){
          return;
        }
        
        var id = clickedItemClass.split('ID_')[1];
        var indicatedItem = d3.selectAll('.legend-indicatedRect-'+randomSuffix+'-ID_'+id);
      indicatedItem.attr('fill', '#808080');
    };
    
    chart.clickHandler = function(){
      if(selectionMode === 'single' || selectionMode === 'none' || options.isHierarchy){
        return;
      }
      
      //TODO
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
    
    chart.deselectByCtx = function(deselectedData){
      if(!deselectedData){
        //deslected All items. Remove all selected legend items.
        selectedItem = [];
//        d3.selectAll('.indicatedRect').attr('fill', 'rgba(0,0,0,0)');
      }else{
        var itemData, isSame = true;
        for(var i = 0, len = selectedItem.length; i < len; i++){
          isSame = true;
          itemData = selectedItem[i].__data__.ctx.path;
          if(!itemData){
            itemData = selectedItem[i].__data__.ctx.ranges;
            if(itemData !== deselectedData.ctx.ranges){
              isSame = false;
            }
          }else{
            for(var k in itemData){
              if(deselectedData.ctx.path[k] !== undefined){
                if(deselectedData.ctx.path[k].length > 0){
                  if(deselectedData.ctx.path[k] !== itemData[k]){
                    isSame = false;
                  }
                }else{
                  if(deselectedData.ctx.path[k] !== itemData[k]){
                    isSame = false;
                  }
                }
              }
            }
          }
          
          if(isSame === true){
            //remove the deselected item.
            selectedItem.splice(i, 1);
            break;
          }
        }
      }
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
    
    /*
     * Calculate legend row position and return legend max size. 
     */
    var _calculateRowPosition = function(wholeSize) {
      var maxHeight = 0, maxWidth = 0, minWidth = 0,
        maxRowTextSize = {'width':0, 'height':0}, 
        labelsData = chartData,
        maxRowWidth = 0;
      if(labelsData && labelsData.length > 0){
        var labelFont = "font-size:" + valueLabelFont.fontsize + "; font-weight:" + valueLabelFont.fontweight + "; font-family:" + valueLabelFont.fontfamily;
        
        var rowLabelSize = [], xPos = 0, yPos = 0; //each row text width
        textHeight = parseInt(valueLabelFont.fontsize, 10); //1em
        rowPosArr = [];
        
        var i, j, len, jLen;
        //Measure labels size
        //If colors feed don't have MND, can't show legend in hierarchy.
        if((options.legendType !== 'BubbleColorLegend') && options.isHierarchy){
          //Measure hierarchy legend
          var labelItem, rowItems, rowItemSize, maxRowItemSize = {'width' : 0, 'height': 0}, lastRowLabel = [];
          for(i = 0, len = labelsData.length; i < len; i++) {
            //'China / 2001 / Car - Profit' TO ['China', '2001', 'Car', 'Profit']
            labelItem = labelsData[i].val;
            labelItem = labelItem.replace('-', '/');
            rowItems = labelItem.split(' / ');
            
            //Create each row's sub elements.
            var isShowWholeItem = false;
            for(j = 0, jLen = rowItems.length - 1; j < jLen; j++) {
              if(lastRowLabel[j] !== rowItems[j]) {
                //Only with last label and color label
                isShowWholeItem = true;
                break;
              }
            }
            
            //Calculate each row's max item size
            var itemHeight = 0;
            for(j = 0, jLen = rowItems.length; j < jLen; j++) {
              rowItemSize = TextRuler.measure(rowItems[j], labelFont);
              if(j === jLen - 1){
                rowItemSize.width = rowItemSize.width + (colorLabelSize + colorLabelMarginRight)*textHeight;
                itemHeight = itemHeight + (rowMarginBottom+1) * textHeight;
              }else if(isShowWholeItem){
                itemHeight = itemHeight + (rowMarginBottom+1) * textHeight;
              }
              rowItemSize.width = rowItemSize.width + 10*j;
              if(rowItemSize.width > maxRowItemSize.width){
                maxRowItemSize = rowItemSize; 
              }
              lastRowLabel[j] = rowItems[j];
            }
            if(maxRowItemSize.width > maxRowWidth){
              maxRowWidth = maxRowItemSize.width;
            }
            rowLabelSize.push(itemHeight);
            
            //Calculate each row's position
            // if(options.position === 'left' || options.position === 'right') {
              if(i > 0){
                yPos = yPos + rowLabelSize[i-1];              
              }
              if(yPos + textHeight > wholeSize.height){
                break;
              }
            // }else{
  //             
            // }
            rowPosArr.push({x: xPos, y: yPos});
          }
          maxWidth = xPos + maxRowWidth;
          maxHeight = yPos + rowLabelSize[rowLabelSize.length - 1];
          
          minWidth = TextRuler.measure('M...', labelFont).width;
        }else{
          var labelText, rowTextSize;
          //Calculate each row's position
          if(options.position === 'left' || options.position === 'right') {
            var rowTextLength;
            for(i = 0, len = labelsData.length; i < len; i++){
              //Set Y-Position
              if(i > 0){
                yPos = yPos + textHeight + textHeight*rowMarginBottom;
              }
              if(yPos + textHeight > wholeSize.height){
                break;
              }
              rowPosArr.push({x: xPos, y: yPos});
              
              //Set max text length
              labelText = labelsData[i].val;
              if(labelsData[i].size === undefined){
                labelsData[i].size = TextRuler.measure(labelText, labelFont);
              }
              rowTextLength = labelsData[i].size;
              if(rowTextLength.width > maxRowTextSize.width){
                maxRowTextSize = rowTextLength;
              }
              
//              rowTextLength = labelText.length;
//              //Get longest text item
//              if(rowTextLength > maxRowTextLength){
//                maxRowTextLength = rowTextLength;
//                maxRowTextIndex = i;
//              } else if(rowTextLength === maxRowTextLength){
//                var a = TextRuler.measure(labelsData[maxRowTextIndex].val, labelFont).width;
//                var b = TextRuler.measure(labelsData[i].val, labelFont).width;
//                if(b > a){
//                  maxRowTextIndex = i;
//                }
//              }
            }
//            if(labelsData[maxRowTextIndex]){
//              maxRowTextSize = TextRuler.measure(labelsData[maxRowTextIndex].val, labelFont);
//            }
          }else{
            for(i = 0, len = labelsData.length; i < len; i++){
              labelText = labelsData[i].val;
              rowTextSize = TextRuler.measure(labelText, labelFont);
              rowLabelSize.push(rowTextSize.width);
              
              //Calculate each row's position
              if(i > 0){
                xPos = xPos + (colorLabelSize + colorLabelMarginRight) * textHeight + rowLabelSize[i-1];              
              }
              if(xPos + textHeight > wholeSize.height){
                break;
              }
              rowPosArr.push({x: xPos, y: yPos});
            }
          }
          
          //Calculation final row text size.
          maxRowWidth = (colorLabelSize + colorLabelMarginRight) * textHeight + maxRowTextSize.width;
          if(options.position === 'left' || options.position === 'right') {
            maxWidth = xPos + maxRowWidth;
            maxHeight = yPos + textHeight;
          }else{
            maxWidth = xPos + rowLabelSize[rowLabelSize.length -1] + (colorLabelSize + colorLabelMarginRight) * textHeight;
            maxHeight = maxRowTextSize.height;          
          }
          minWidth = xPos + (colorLabelSize + colorLabelMarginRight) * textHeight + TextRuler.measure('M...', labelFont).width; 
        }
      }
      if(minWidth > maxWidth){
        minWidth = maxWidth;
      }
      return {
        minHeight : 2 * textHeight,
        minWidth: minWidth,
        height: maxHeight,
        width: maxWidth
      };
    };
    
    var createRowWithColorLabel = function(wrap, index, isShowColorLabel, labelText) {
      var dx = 0, colorLabelType;
      var markerSize = colorLabelSize * textHeight;

      if(isShowColorLabel) {
        if(shapeFeedLength > 0){
          colorLabelType = shapes[index % (shapes.length > shapeFeedLength ? shapeFeedLength : shapes.length)];
        }else{
          if(options.legendType === 'BubbleColorLegend'){
            colorLabelType = (shapes[0] === undefined) ? 'square' : shapes[0];
          }else{
            var tmpShape = shapes[index % shapes.length];
            colorLabelType = (tmpShape === undefined) ? 'square' : tmpShape;
            if(colorLabelType === 'square'){
              colorLabelType = "squareWithRadius";
            }
          }
        }
        
        var centerPos = textHeight / 2; 
        var path = wrap.selectAll('path').data([labelText]);
        DrawUtil.createElements(path.enter(),{shape: colorLabelType, className: null} );
        path.attr("transform", function(d,i)
        {
          var color;
          if(shapeFeedLength > 0) {
            i = Math.floor(index / shapeFeedLength);
            var t = colors.length > colorFeedLength ? colorFeedLength : colors.length;
            if(t > 0){
              color = colors[i % t];
            }else{
              color = colors[0];
            }
          } else {
            color = colors[index % (colors.length > colorFeedLength ? colorFeedLength : colors.length)];
          }
          var parameter = {
              drawingEffect:options.drawingEffect,
              graphType:colorLabelType,
              fillColor : color,
              direction : 'vertical',
              rx: markerSize / 2,
              ry: markerSize / 2,
              borderWidth: 0,
              borderColor: "transparent",
              node:d3.select(this)
//              visibility: "visible"
          };
          DrawUtil.drawGraph(parameter, effectManager);
          return 'translate(' + centerPos + ',' + centerPos + ')';
          
        });
        dx = markerSize + colorLabelMarginRight * textHeight;
      }
      // item text label
      var text = wrap.selectAll('text').data([labelText]);
      text.enter().append('text');
      text.attr('x', dx).attr('y', textHeight).text(function(d) {
          return d;
        });
      
      var labelFont = "font-size:" + valueLabelFont.fontsize + "; font-weight:" + valueLabelFont.fontweight + "; font-family:" + valueLabelFont.fontfamily;
      text.each(function(d) {
        TextRuler.ellipsis(d, this, width-dx, labelFont);
      });
      return wrap;
    };
    return chart;
  };
    
  return colorLegendArea;
});