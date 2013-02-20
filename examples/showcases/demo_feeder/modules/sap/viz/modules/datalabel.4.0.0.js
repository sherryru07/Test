sap.riv.module(
{
  qname : 'sap.viz.modules.datalabel',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.util.TextUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.format.FormatManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifest',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
}
],
function Setup(TextUtils, TypeUtils, formatManager, Manifest,Objects){
    var dataLabel = function(manifest, ctx){
      var fontSize = '12px', fontColor = '#333333', fontFamily = '"Open Sans" Arial, Helvetica, sans-serif', fontWeight = 'normal';
      var properties = manifest.props(null);
      var dataLabel,                      // labels of each datashapesgroup
          dataLabels,                     // all labels, it must be two-dimension array
          originalLabels;                 // used for smartLayout, it must be one-dimension array
      var gPlot, parentNodeBBox;
      var labelStyle;
      var _SVGRoot;
      
      /*
       * Properties that needed for different charts.
       * Data label is designed as a general module, but different charts do have different requirements. Most of these properties are used for this reason.
       */
      var labelOrientation = 'horizontal',  // label can be horizontal or vertical
          orientation,                      // chart orientation, it is used during smart layout. if it is vertical, the move is from middle to top or bottom; if it is horizontal, the move is from middle to left or right.
          paintingMode,                     // the kind of coordinate system
          visible,                          // show or hide data label
          position,                         // data label can be inside or outside
          automaticInOutside,               // if the data label is longer than its owner element, move label out of it.
          formatString, isPercentMode, isStackMode, showZero, outsideVisible, outsidePosition, positionPreference,
          isGeoChart,     
          type;                             // label type, for now, two types, 1, value 2 label and value
      var isDonut = false;
      var heatMapLabelFontColor = '#ffffff', isHeatMap = false, isOneCategoryHeatmap = false, padding = 2, isTreeMap = false, treeMapLabelFontColor = '#ffffff';

      function label (){}
      
      label.removeLabel = function(){
        if(TypeUtils.isExist( gPlot.parent())){
          gPlot.parent().selectAll('g.datalabel').remove();
        }
      };
      
      /**
       * [08-Jan-2012 Nick]
       */
      label.showLabel = function(){
        if(visible && gPlot.parent()){
          getCSSSetting();
          gPlot.parent().selectAll('g.datalabel').remove();
          parentNodeBBox = gPlot.parent().node().getBoundingClientRect();
          prepareLabel();
          if(dataLabel.length === 0){
            return;
          }
          if (isHeatMap) {
            fontColor = heatMapLabelFontColor;
          } else if (isTreeMap) {
            fontColor = treeMapLabelFontColor;
          }
          labelStyle = 'fill:' + fontColor + '; font-family: ' + fontFamily + '; font-weight: ' + fontWeight +'; font-size: '+ fontSize +"; text-anchor:start";
          var datashapesgroups = gPlot.parent().selectAll('.datashapesgroup');
              datashapesgroups.each(function(d,i){
                var labelGroup =  d3.select(this).selectAll('g.datalabel').data([dataLabels[i]]);
                    labelGroup.enter().append('g').attr('class','datalabel');
                    labelGroup.each(function(labels, index){
                      var dLabel = d3.select(this).selectAll('text.datalabel').data(labels);
                      var text = dLabel.enter().append('g')
                                   .attr('transform',function(label){
                                       return label.transformString;
                                   });
                      text.each(function(d, i){
                        //we can also find main shape through data
                        var currd = gPlot.parent().selectAll('.datapoint').data()[i];
                        //register decoration to main shape
                        if(TypeUtils.isExist(currd.decoras)){
                          currd.decoras.push(this);
                        }
                      });
                      text = text.append('text');
                      text.text(function(d) {
                        return d.value;
                      });
                      text.attr('class','datalabel').attr('visibility', 'hidden');
                      text.attr('fill', fontColor)
                          .attr('x', function(d){
                            return d.x;
                          })
                          .attr('style',labelStyle)
                          .attr('y', function (d) {
                            return d.y;
                          });
                   
                      if(labelOrientation === 'vertical'){
                        text.attr('transform',function(d){
                          return 'rotate(270 '+d.centerX + ',' + d.centerY + ')';
                        });
                      }
                      
                    });
              });
              smartLayout();
        }
      };
      
      function smartLayout() {
        var gElements = gPlot.parent().selectAll('text.datalabel')[0];//gPlot.parent().selectAll('rect.viz-event-sub-layer')[0][0].getBoundingClientRect();
        var labels = [], label, plotArea = {};
        var i;
        for (i = 0; i < gElements.length; i++) {
          label = {};
          var elementBBox = gElements[i].getBoundingClientRect();
          label.top = elementBBox.top; //- parentNodeBBox.top;
          label.left = elementBBox.left; //- parentNodeBBox.left;
          label.right = elementBBox.right; //- parentNodeBBox.left;
          label.bottom = elementBBox.bottom; //- parentNodeBBox.top;
          label.visible = true;
          label.needMove = false;
          label.x = 0;
          label.y = 0;
          labels.push(label);
        }
        
        plotArea.top = parentNodeBBox.top;
        plotArea.left = parentNodeBBox.left;
        plotArea.right = parentNodeBBox.right;
        plotArea.bottom = parentNodeBBox.bottom;
        
        automaticLayout(originalLabels, labels, plotArea);
        removeUnqualifiedLabels(labels, plotArea);
        
        for (i = 0; i < labels.length; i++) {
          if (labels[i].visible) {
            if (labels[i].needMove) {
              gElements[i].setAttribute('x', labels[i].x);
              gElements[i].setAttribute('y', labels[i].y);
            }
            gElements[i].setAttribute('visibility', 'visible');
          } else {
            gElements[i].parentNode.parentNode.removeChild(gElements[i].parentNode);
          }
        }
      }
      
      function getCSSSetting() {
        var dataLabelStyle = ctx.styleManager.query('viz-datalabel');
        if(dataLabelStyle){
          if(dataLabelStyle['fill']){
            fontColor = dataLabelStyle['fill'];
          }
          if(dataLabelStyle['font-family']){
            fontFamily = dataLabelStyle['font-family'];
          }
          if(dataLabelStyle['font-size']){
            fontSize = dataLabelStyle['font-size'];
          }
          if(dataLabelStyle['font-weight']){
            fontWeight = dataLabelStyle['font-weight'];
          }
//          labelStyle = 'fill:' + fontColor + '; font-family: ' + fontFamily + '; font-size: '+ fontSize +";";
        }
      }
      
      function formatDataLabel(value,dataPoint){
        if(TypeUtils.isExist(formatString)){
          var formatedValue, iFormatString, indexOfiFS, indexOfctx;
          //for bubble ,val is an array , datalebel will display y .so just format the y value.
          if(TypeUtils.isArray(dataPoint.__data__.val)){
            iFormatString = formatString[0];
            indexOfctx = isGeoChart ?  0 : 1;
            indexOfiFS = dataPoint.__data__.ctx[indexOfctx].path.mi >= iFormatString.length ? iFormatString.length -1 : dataPoint.__data__.ctx[indexOfctx].path.mi;
            formatedValue = formatManager.format(value, iFormatString[indexOfiFS]);
          }else{
            iFormatString = formatString[dataPoint.__data__.ctx.path.mg];
            //if this array is null of undefined, we will use default value
            if(TypeUtils.isExist(iFormatString)){
              indexOfiFS = dataPoint.__data__.ctx.path.mi >= iFormatString.length ? iFormatString.length -1 : dataPoint.__data__.ctx.path.mi;
              formatedValue = formatManager.format(value, iFormatString[indexOfiFS]);
            }else{
              formatedValue = value;
            }
          }
          return formatedValue;
        }
        return value;
      }

      
      
      var automaticLayout = function(srcLabels, desLabels, plotArea) {
        
        if (srcLabels !== null && desLabels !== null) {
          for (var i = 0; i < srcLabels.length; i++) {
            if (i < desLabels.length) {
              if (!isStackMode && !isPercentMode && automaticInOutside  && orientation === 'horizontal') {
                if (showZero && srcLabels[i].value === 0) {
                  var bbox1 = srcLabels[i].datapointRect;
//                  desLabels[i].xAdjust = true;
//                  desLabels[i].x = (srcLabels[i].ownerWidth > 0) ? srcLabels[i].ownerWidth : 1;
                  desLabels[i].needMove = true;
                  desLabels[i].x = srcLabels[i].outsideX;
                  desLabels[i].y = srcLabels[i].outsideY;
                  desLabels[i].left = bbox1.right;
                  desLabels[i].right = bbox1.right + srcLabels[i].width;
                } else if (position === 'inside') {
                  if (srcLabels[i].width > srcLabels[i].ownerWidth || isCrossBorder(desLabels[i], plotArea)) {
//                    desLabels[i].xAdjust = true;
                    desLabels[i].needMove = true;
                    desLabels[i].x = srcLabels[i].outsideX;
                    desLabels[i].y = srcLabels[i].outsideY;
                    var boundingBox1 = srcLabels[i].datapointRect; 
                    if (srcLabels[i].value > 0) {
//                      desLabels[i].x = srcLabels[i].ownerWidth;
                      desLabels[i].left = boundingBox1.left + srcLabels[i].ownerWidth;
                      desLabels[i].right = boundingBox1.right + srcLabels[i].width;
                    } else {
//                      desLabels[i].x = - srcLabels[i].width;
                      desLabels[i].left =  boundingBox1.left - srcLabels[i].width;
                      desLabels[i].right = boundingBox1.right - srcLabels[i].ownerWidth;
                    }
                  }
                  
                  if (isCrossBorder(desLabels[i], plotArea)) {
                    desLabels[i].visible = false;
                  }
                } else if (position === 'outside') {
                  if (isCrossBorder(desLabels[i], plotArea)) {
                    if (srcLabels[i].width <= srcLabels[i].ownerWidth) {
//                      desLabels[i].xAdjust = true;
                      desLabels[i].needMove = true;
                      desLabels[i].x = srcLabels[i].insideX;
                      desLabels[i].y = srcLabels[i].insideY;
                      var boundingBox2 = srcLabels[i].datapointRect;
                      if (srcLabels[i].value > 0) {
//                        desLabels[i].x = srcLabels[i].x - (srcLabels[i].ownerWidth + srcLabels[i].width) / 2;
                        desLabels[i].left = boundingBox2.left + (srcLabels[i].ownerWidth - srcLabels[i].width) / 2;
                        desLabels[i].right = boundingBox2.right - (srcLabels[i].ownerWidth - srcLabels[i].width) / 2;                      
                      } else {
//                        desLabels[i].x = (srcLabels[i].ownerWidth - srcLabels[i].width) / 2;
                        desLabels[i].left = boundingBox2.left + (srcLabels[i].ownerWidth - srcLabels[i].width) / 2;
                        desLabels[i].right = boundingBox2.right - (srcLabels[i].ownerWidth - srcLabels[i].width) / 2;
                      }
                      
                      if (isCrossBorder(desLabels[i], plotArea)) {
                        desLabels[i].visible = false;
                      }
                    } else {
                      desLabels[i].visible = false;
                    }
                  }
                }
              } else if (!isStackMode && !isPercentMode && automaticInOutside && orientation === 'vertical') {
                if (showZero && srcLabels[i].value === 0) {
//                  desLabels[i].yAdjust = true;
//                  desLabels[i].y -= (srcLabels[i].ownerHeight > 0) ? srcLabels[i].ownerHeight : 1;
                  desLabels[i].needMove = true;
                  desLabels[i].x = srcLabels[i].outsideX;
                  desLabels[i].y = srcLabels[i].outsideY;  
                  var bbox2 = srcLabels[i].datapointRect;
                  desLabels[i].top = bbox2.top + srcLabels[i].height;
                  desLabels[i].bottom = bbox2.top;
                } else if (position === 'inside') {
                  if (srcLabels[i].height > srcLabels[i].ownerHeight || isCrossBorder(desLabels[i], plotArea)) {
//                    desLabels[i].yAdjust = true;
                    desLabels[i].needMove = true;
                    desLabels[i].x = srcLabels[i].outsideX;
                    desLabels[i].y = srcLabels[i].outsideY;
                    var boundingBox3 = srcLabels[i].datapointRect;
                    if (srcLabels[i].value >= 0) {
//                      desLabels[i].y = srcLabels[i].y - ((srcLabels[i].height - srcLabels[i].ownerHeight) / 2 + srcLabels[i].ownerHeight);
                      desLabels[i].top =  boundingBox3.top - srcLabels[i].height;
                      desLabels[i].bottom =  boundingBox3.bottom - srcLabels[i].ownerHeight;   
                    } else {
//                      desLabels[i].y = srcLabels[i].y + ((srcLabels[i].height - srcLabels[i].ownerHeight) / 2 + srcLabels[i].ownerHeight);
                      desLabels[i].top = boundingBox3.top + srcLabels[i].ownerHeight;
                      desLabels[i].bottom = boundingBox3.bottom + srcLabels[i].height;               
                    }
                  }
                  
                  if (isCrossBorder(desLabels[i], plotArea)) {
                    desLabels[i].visible = false;
                  }
                } else if (position === 'outside') {
                  if (isCrossBorder(desLabels[i], plotArea)) {
                    if (srcLabels[i].height <= srcLabels[i].ownerHeight) {
//                      desLabels[i].yAdjust = true;
                      desLabels[i].needMove = true;
                      desLabels[i].x = srcLabels[i].insideX;
                      desLabels[i].y = srcLabels[i].insideY;   
                      var boundingBox4 = srcLabels[i].datapointRect;
                      if (srcLabels[i].value > 0) {
//                        desLabels[i].y = srcLabels[i].y + (srcLabels[i].ownerHeight + srcLabels[i].height) / 2;
                        desLabels[i].top = boundingBox4.top + (srcLabels[i].ownerHeight - srcLabels[i].height) / 2;
                        desLabels[i].bottom =  boundingBox4.bottom - (srcLabels[i].ownerHeight - srcLabels[i].height) / 2;                      
                      } else {
//                        desLabels[i].y = srcLabels[i].y - (srcLabels[i].ownerHeight + srcLabels[i].height) / 2;
                        desLabels[i].top = boundingBox4.top + (srcLabels[i].ownerHeight - srcLabels[i].height) / 2;
                        desLabels[i].bottom =  boundingBox4.bottom - (srcLabels[i].ownerHeight - srcLabels[i].height) / 2;                     
                      }               
                      if (isCrossBorder(desLabels[i], plotArea)) {
                        desLabels[i].visible = false;
                      }
                    } else {
                      desLabels[i].visible = false;
                    }
                  }
                }
              } else if (!isStackMode && !isPercentMode && !automaticInOutside) {
                if (orientation === 'horizontal') {
                  if (showZero && srcLabels[i].value === 0 && !isGeoChart && srcLabels[i].width === 0) {
                    var bbox3 = srcLabels[i].datapointRect;
                    desLabels[i].left = bbox3.right;
                    desLabels[i].right = bbox3.right + srcLabels[i].width;
                  } else if (!outsideVisible && srcLabels[i].width > srcLabels[i].ownerWidth) {
                    desLabels[i].visible = false;
                  }
                  
                } else if (orientation === 'vertical') {
                  if (showZero && srcLabels[i].value === 0 && !isGeoChart && srcLabels[i].height === 0) {
                    var bbox4 = srcLabels[i].datapointRect;
                    desLabels[i].top = bbox4.top + srcLabels[i].height;
                    desLabels[i].bottom = bbox4.top;
                  } else if (!outsideVisible) {
                    if (isHeatMap || isTreeMap) {
                      if (isOneCategoryHeatmap || isTreeMap) {
                        if (srcLabels[i].height > srcLabels[i].ownerHeight/2) {
                          desLabels[i].visible = false;
                        }
                      } else {
                        if (srcLabels[i].height > srcLabels[i].ownerHeight) {
                          desLabels[i].visible = false;
                        }
                      }
                      
                      if (srcLabels[i].width > srcLabels[i].ownerWidth) {
                        desLabels[i].visible = false;
                      }
                    } else if (srcLabels[i].height > srcLabels[i].ownerHeight) {
                      desLabels[i].visible = false;
                    }
                  }
                }
                
                if (showZero && srcLabels[i].value === 0 && position === 'inside' && !isGeoChart) {
                  desLabels[i].needMove = true;
                  desLabels[i].x = srcLabels[i].outsideX;
                  desLabels[i].y = srcLabels[i].outsideY;
                } else if (!showZero && srcLabels[i].value === 0) {
                  desLabels[i].visible = false;
                }
 
                /**
                 * The following logic is for some case that 0 value is shown at X axis in Scatter chart.
                 * The data label bounding rectangle is in plot area in this case, so half of data label will be shown
                 *  at X axis. But the correct behavior is that value 0 is only shown at Y axis when data label is above
                 *  scatter point.
                 */
                if (!isHeatMap && !isTreeMap && paintingMode === 'rect-coordinate' && orientation === 'vertical' && outsidePosition === 'up') {
                  var bbox5 = srcLabels[i].datapointRect;
                  if ((bbox5.left === plotArea.left)) {
                    desLabels[i].visible = false;
                  }
                }
                
                if (isCrossBorder(desLabels[i], plotArea)) {
                  desLabels[i].visible = false;
                }
                
              } else if (isStackMode) {
                if (orientation === 'horizontal') {
                  if (isCrossBorder(desLabels[i], plotArea) || (srcLabels[i].width > srcLabels[i].ownerWidth) || srcLabels[i].value === 0) {
                    desLabels[i].visible = false;
                  }
                } else if (orientation === 'vertical') {
                  if (isCrossBorder(desLabels[i], plotArea) || (srcLabels[i].height > srcLabels[i].ownerHeight) || srcLabels[i].value === 0) {
                    desLabels[i].visible = false;
                  }
                }
              } else if (isPercentMode) {
                if (isCrossBorder(desLabels[i], plotArea)) {
                  desLabels[i].visible = false;
                }
              }
            }
          }
          resetFlags();
        }
      };

      var resetFlags = function() {
        isHeatMap = false;
        isOneCategoryHeatmap = false;
        isTreeMap = false;
      };
      
      var parseOptions = function(props){
        orientation = TypeUtils.isExist(props.orientation) ? props.orientation : orientation;
        paintingMode = TypeUtils.isExist(props.paintingMode) ? props.paintingMode : paintingMode;
        visible = TypeUtils.isExist(props.visible) ? props.visible : visible;
        position = TypeUtils.isExist(props.position) ? props.position : position;
        automaticInOutside = TypeUtils.isExist(props.automaticInOutside) ? props.automaticInOutside : automaticInOutside;
        formatString = TypeUtils.isExist(props.formatString) ? props.formatString : formatString;
        isPercentMode = TypeUtils.isExist(props.isPercentMode) ? props.isPercentMode : isPercentMode;
        isStackMode = TypeUtils.isExist(props.isStackMode) ? props.isStackMode : isStackMode;
        isDonut = TypeUtils.isExist(props.isDonut) ? props.isDonut : isDonut;
        showZero = TypeUtils.isExist(props.showZero) ? props.showZero : showZero;
        outsideVisible = TypeUtils.isExist(props.outsideVisible) ? props.outsideVisible : outsideVisible;
        outsidePosition = TypeUtils.isExist(props.outsidePosition) ? props.outsidePosition : outsidePosition;
        isGeoChart = TypeUtils.isExist(props.isGeoChart) ? props.isGeoChart : isGeoChart;
        positionPreference = TypeUtils.isExist(props.positionPreference) ? props.positionPreference : positionPreference;
        type = TypeUtils.isExist(props.type) ? props.type : type;
      };
      
      //get customlabel text from from the rawObj, if the type is url, return the original text
      var getCustomlabelText = function(rawObj){
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
        return ret;
      };
      
      var prepareLabel = function(){
        _SVGRoot = gPlot.parent()[0][0].ownerSVGElement;
        dataLabel = [], dataLabels = [], originalLabels = [];
        if( _SVGRoot !== null && _SVGRoot.getBBox().width === 0){
          return;
        }
        var i = 0, j = 0, label, plotOffset, tempElement;
        var datashapeOffset, labelSize, percentageValue;
        
        var boundarySelection = gPlot.parent().selectAll('.datashapesgroup');
        if(boundarySelection[0].length === 0){
          boundarySelection = gPlot.parent();
        }
        var gElements = boundarySelection.selectAll('.datapoint');
        
        if(paintingMode === 'polar-coordinate'){
          for( i = 0 ; i < boundarySelection[0].length; i++){
            plotOffset = boundarySelection[0][i].getTransformToElement(_SVGRoot);
            dataLabel = [];
            for( j = 0 ; j < gElements[i].length; j++){
              label = {};
              tempElement = gElements[i][j];
              datashapeOffset = tempElement.getTransformToElement(_SVGRoot);
              /**
               *  [07-Jan-2012 Nick] 
               *  FIX FOR IE, in some cases, datashapesOffset is null here.
               *  So if it is null, the logic should jump out of here.
               */
              if(!TypeUtils.isExist(datashapeOffset)){
                  break;
              }
              label.dataShape = tempElement;
              var dimensions = '';
              percentageValue = (tempElement.__data__.endAngle - tempElement.__data__.startAngle) / ( 2 * Math.PI);
              percentageValue = formatDataLabel(percentageValue, tempElement);
              /*
               * [18-Dec-2012 Nick] Combine measures and dimensions into one label. (for pie only)
               */
              if(type === 'label and value'){
                var dimensionObjects = tempElement.__data__.dimValueObjects;
                for(var k=0; k < dimensionObjects.length; k++){
                  dimensions += getCustomlabelText(dimensionObjects[k]);
                  if(k !== (dimensionObjects.length - 1)){
                    dimensions += '/';
                  }
                }  
              }
              label.value = dimensions + ' (' + percentageValue + ')';
              
              label.transformString = ('translate(' + (datashapeOffset.e - plotOffset.e) + ',' + (datashapeOffset.f - plotOffset.f) + ')' );

              labelSize = TextUtils.fastMeasure(label.value, fontSize, fontWeight, fontFamily);
              var r = tempElement.__data__.r;           
              var mAngle = (tempElement.__data__.endAngle + tempElement.__data__.startAngle)/ 2;        
              var sinLabelAngle = Math.sin(mAngle);
              var cosLabelAngle = Math.cos(mAngle);
            
              var labelCenterX, labelCenterY;
            
              if(isDonut){
                labelCenterX = 0.65 * r * sinLabelAngle;
                labelCenterY = 0.65 * r * cosLabelAngle;
              }else{
                labelCenterX = 0.5 * r * sinLabelAngle;
                labelCenterY = 0.5 * r * cosLabelAngle;
              }
            
              label.x = 0 + labelCenterX * datashapeOffset.a - labelSize.width/2;
              label.y = 0 - labelCenterY * datashapeOffset.d + labelSize.height/2;
              label.centerX = labelCenterX;
              label.centerY = labelCenterY;
              label.datapointRect = tempElement.getBoundingClientRect();
            
              dataLabel.push(label);
              originalLabels.push(label);
            }
            dataLabels.push(dataLabel);
          }
        }else if(paintingMode === 'rect-coordinate'){
          for( i = 0; i < boundarySelection[0].length; i++){
            plotOffset = boundarySelection[0][i].getTransformToElement(_SVGRoot);
            dataLabel = [];
            for( j = 0 ; j < gElements[i].length; j++){
              label = {};
              tempElement = gElements[i][j];
              datashapeOffset = tempElement.getTransformToElement(_SVGRoot);
              
              /**
               *  [07-Jan-2012 Nick] 
               *  FIX FOR IE, in some cases, datashapesOffset is null here,
               *  so if it is null, the logic should jump out of here.
               */
              if(!TypeUtils.isExist(datashapeOffset)){
                  break;
              }
              label.dataShape = tempElement;
              var bbox = tempElement.getBBox();        
              /*
               * [18-Dec-2012 Nick] 
               * For different charts, the requirements of showing label are different.
               * 1. Geo bubble/chorolopeth chart, it has an array of values in __data__.val, but the array only has one object
               * 2. Bubble and scatter has more than one object in __data__.val, but only y member is displayed.
               * 3. for the other charts, show val directly.
               */
              var originalValue;
              if(TypeUtils.isArray(tempElement.__data__.val)){
                if(isGeoChart){
                  originalValue = tempElement.__data__.val[0];
                }else{
                  originalValue = tempElement.__data__.y;
                }
              }else{
                if(isPercentMode && type === 'value'){
                  originalValue = tempElement.__data__.value;
                }else{
                  originalValue = tempElement.__data__.val;
                }
              }
              if(type !== 'value' && tempElement.__data__.isNegative){
                originalValue = '-' + originalValue;
              }
              var heatMapLabelWidth = 0, heatMapLabelHeight = 0;
              if (tempElement.__data__.isOnlyOneCategory !== undefined) {
                isHeatMap = true;
                if (tempElement.__data__.isOnlyOneCategory) {
                  isOneCategoryHeatmap = true;
                  var heatMapLabel = gPlot.parent().selectAll('text.heatmapdatalabel')[0][0];
                  if (heatMapLabel) {
                    var heatmapLabelBBox = heatMapLabel.getBBox();
                    heatMapLabelWidth = heatmapLabelBBox.width;
                    heatMapLabelHeight = heatmapLabelBBox.height;
                  }
                }
              }
              
              var treeMapLabelWidth = 0, treeMapLabelHeight = 0;
              if (tempElement.__data__.isTreeMap !== undefined) {
                isTreeMap = true;
                var treeMapLabel = gPlot.parent().selectAll('text.treemapdatalabel')[0][0];
                if (treeMapLabel) {
                  var treeMapLabelBBox = treeMapLabel.getBBox();
                  treeMapLabelWidth = treeMapLabelBBox.width;
                  treeMapLabelHeight = treeMapLabelBBox.height;
                }
              }
        
              label.value =  formatDataLabel(originalValue, tempElement);
              if(type === 'label and value'){
                label.value = tempElement.__data__.label + ' (' + label.value + ')';
              }
              var x = bbox.x * datashapeOffset.a, y = bbox.y * datashapeOffset.d, width = bbox.width* datashapeOffset.a, height = bbox.height* datashapeOffset.d;    
              /**
               *  [18-Dec-2012 Nick] 
               *  plotOffset means the offset between g.datashapesgroup and svg root element
               *  datashapeOffset means the offset between element.datapoint and svg root element
               *  so the difference between them means the offset between element.datapoint and g.datashapesgroup
               */
              label.transformString = ('translate(' + (datashapeOffset.e - plotOffset.e) + ',' + (datashapeOffset.f - plotOffset.f) + ')' );
              var insideCenterX = 0, insideCenterY = 0, outsideUpCenterX = 0, outsideUpCenterY = 0, outsideDownCenterX = 0, outsideDownCenterY = 0, outsideLeftCenterX = 0, outsideRightCenterX = 0, outsideLeftCenterY = 0, outsideRightCenterY = 0;
              if (isHeatMap || isTreeMap) {
                var labelValue = label.value;
                if (TypeUtils.isNumber(labelValue)){
                  labelValue = labelValue.toString();
                }
                var dataLabeFontColor = null;
                if (isHeatMap) {
                  dataLabeFontColor = heatMapLabelFontColor;
                } else if (isTreeMap) {
                  dataLabeFontColor = treeMapLabelFontColor;
                }
                label.value = TextUtils.ellipsis(labelValue, null, width - 3,  "fill:" + dataLabeFontColor + ";font-family:" + fontFamily + ";font-size:" + fontSize);
              }
              labelSize = TextUtils.fastMeasure(label.value, fontSize, fontWeight, fontFamily);
 
              if(orientation === 'horizontal'){
                label.centerX = x + width/2;
                label.centerY = y + height/2;
                /**
                 * [07-Jan-2012 Nick]
                 * if the label value is negative, set outsidePosition to left, so make sure it is listed on the left sideof data shape element
                 */
                if (positionPreference && position === 'outside') {
                  if (outsidePosition === 'right'){
                    label.centerX = label.centerX  + width/2 + labelSize.width/2;
                  }
                } else {
                  if(position === 'outside'){
                    if( outsidePosition === 'left' || (!TypeUtils.isExist(tempElement.__data__.isNegative) && originalValue < 0)){
                      label.centerX = label.centerX - (width/2 + labelSize.width/2);
                    }else if (outsidePosition === 'right'){
                      label.centerX = label.centerX  + width/2 + labelSize.width/2;
                    }
                  }
                }
                insideCenterX = x + width/2;
                insideCenterY = y + height/2;

                if (!(!TypeUtils.isExist(tempElement.__data__.isNegative) && originalValue < 0)) {
                  outsideRightCenterX = label.centerX  + width/2 + labelSize.width/2;
                  outsideRightCenterY = y + height/2;
                } else {
                  outsideLeftCenterX = label.centerX - (width/2 + labelSize.width/2);
                  outsideLeftCenterY = y + height/2;
                }

              }else{
                label.centerX = x + width/2;
                label.centerY = y + height/2;
                /**
                 * [07-Jan-2012 Nick]
                 * if the label value is negative, set outsidePosition to down, so make sure it is listed below the data shape element
                 */
                if(tempElement.__data__.isNegative){
                  outsidePosition = 'down';
                }   
                if (isHeatMap && isOneCategoryHeatmap) {
                  label.centerY += labelSize.height/2;
                } else if (isTreeMap) {
                  label.centerY += (treeMapLabelHeight/2 + labelSize.height/2);
                }
                
                if (positionPreference && position === 'outside') {
                  if (outsidePosition === 'up'){
                    label.centerY = label.centerY - height/2 - labelSize.height/2;
                  }
                } else {
                  if(position === 'outside'){
                    if( outsidePosition === 'down' || (!TypeUtils.isExist(tempElement.__data__.isNegative) && originalValue < 0)){
                      label.centerY = label.centerY + height/2 + labelSize.height/2;
                    }else if (outsidePosition === 'up'){
                      label.centerY = label.centerY - height/2 - labelSize.height/2;
                    } 
                  }
                }
	
                insideCenterY = y + height/2;
                insideCenterX = x + width/2;
                
                if (!(!TypeUtils.isExist(tempElement.__data__.isNegative) && originalValue < 0)) {
                  outsideUpCenterY = label.centerY - height/2 - labelSize.height/2;
                  outsideUpCenterX = x + width/2;
                } else {
                  outsideDownCenterY = label.centerY + height/2 + labelSize.height/2;
                  outsideDownCenterX = x + width/2;
                }
              }
              label.x = label.centerX - labelSize.width/2;
              label.y = label.centerY - labelSize.y/2;
              label.width = labelSize.width;
              label.height = labelSize.height;
              label.ownerWidth = width;
              label.ownerHeight = height;
              label.datapointRect = tempElement.getBoundingClientRect();
              label.insideX = insideCenterX - labelSize.width/2;
              label.insideY = insideCenterY - labelSize.y/2;
              if (orientation === 'horizontal') {
                if (!(!TypeUtils.isExist(tempElement.__data__.isNegative) && originalValue < 0)) {
                  label.outsideX = outsideRightCenterX - labelSize.width/2;
                  label.outsideY = outsideRightCenterY - labelSize.y/2;
                } else {
                  label.outsideX = outsideLeftCenterX - labelSize.width/2;
                  label.outsideY = outsideLeftCenterY - labelSize.y/2;
                }
              } else if (orientation === 'vertical') {
                if (!(!TypeUtils.isExist(tempElement.__data__.isNegative) && originalValue < 0)) {
                  label.outsideX = outsideUpCenterX - labelSize.width/2;
                  label.outsideY = outsideUpCenterY - labelSize.y/2;
                } else {
                  label.outsideX = outsideDownCenterX - labelSize.width/2;
                  label.outsideY = outsideDownCenterY - labelSize.y/2;
                }
              }
              dataLabel.push(label);
              originalLabels.push(label);
            }
            dataLabels.push(dataLabel);
          }
        }
      };
      
      var isOverlappedWith = function(srcLabel, desLabel) {
//        var left1 = srcLabel.x, top1 = srcLabel.y - srcLabel.height, right1 = srcLabel.x + srcLabel.width, bottom1 = srcLabel.y;
//        var left2 = desLabel.x, top2 = desLabel.y - desLabel.height, right2 = desLabel.x + desLabel.width, bottom2 = desLabel.y;
        
        var left1 = srcLabel.left, top1 = srcLabel.top, right1 = srcLabel.right, bottom1 = srcLabel.bottom;
        var left2 = desLabel.left, top2 = desLabel.top, right2 = desLabel.right, bottom2 = desLabel.bottom;
        
        // the source label is inside target label
        // left2 + top2
        if (left1 <= left2 && left2 <= right1 && top1 <= top2 && top2 <= bottom1) {
            return true;
        }
        // right2 + top2
        if (left1 <= right2 && right2 <= right1 && top1 <= top2 && top2 <= bottom1) {
            return true;
        }
        // left2 + bottom2
        if (left1 <= left2 && left2 <= right1 && top1 <= bottom2 && bottom2 <= bottom1) {
            return true;
        }
        // right2 + bottom2
        if (left1 <= right2 && right2 <= right1 && top1 <= bottom2 && bottom2 <= bottom1) {
            return true;
        }
        
        // the target label is inside the source label
        // left1 + top1
        if (left2 <= left1 && left1 <= right2 && top2 <= top1 && top1 <= bottom2) {
            return true;
        }
        // right1 + top1
        if (left2 <= right1 && right1 <= right2 && top2 <= top1 && top1 <= bottom2) {
            return true;
        }
        // left1 + bottom1
        if (left2 <= left1 && left1 <= right2 && top2 <= bottom1 && bottom1 <= bottom2) {
            return true;
        }
        // right1 + bottom1
        if (left2 <= right1 && right1 <= right2 && top2 <= bottom1 && bottom1 <= bottom2) {
            return true;
        }
        
        // test the segment intersection
        if (left1 <= left2 && left2 <= right1 && top2 <= top1 && top1 <= bottom2) {
            return true;
        }
        if (left1 <= left2 && left2 <= right1 && top2 <= bottom1 && bottom1 <= bottom2) {
            return true;
        }
        if (left1 <= right2 && right2 <= right1 && top2 <= top1 && top1 <= bottom2) {
            return true;
        }
        if (left1 <= right2 && right2 <= right1 && top2 <= bottom1 && bottom1 <= bottom2) {
            return true;
        }
        
        return false;        
      };
      
      var removeUnqualifiedLabels = function(labels, plotArea) {

        if (labels === null || plotArea === null) {
          return;
         }
            
         for (var i = 0; i < labels.length; i++) {
           
           var srcLabel = labels[i];
           
//           if (isCrossBorder(srcLabel, plotArea)) {
//             srcLabel.visible = false;
//             continue;
//           }
           if (!srcLabel.visible) {
             continue;
           }
           for (var j = i + 1; j < labels.length; j++) {
             var desLabel = labels[j];
             if (!desLabel.visible) {
               continue;
             }
             if (isOverlappedWith(srcLabel, desLabel)) {
               desLabel.visible = false;
             }
           }
         }
         
      };
      
      var isCrossBorder = function(label, plotArea) {
//        if (label.x < 0 || label.y < 0) {
//          return true;
//        }
//        
//        if (label.x + label.width > plotArea.width) {
//          return true;
//        }
//       
//        if (label.y > plotArea.height) {
//          return true;
//        }
//
//        return false;
        
        if (label.top < plotArea.top || label.left < plotArea.left || label.right > plotArea.right || label.bottom > plotArea.bottom) {
          return true;
        }
        
        return false;
      };
     
      label.plot = function(_){
        if(!arguments.length){
          return gPlot;
        }
        gPlot = _;
      };

      label.parent = function(){};
      
      label.properties = function(_){
        if(!arguments.length){
          return properties;
        }        
        Objects.extend(true,properties, _);
        parseOptions(properties);
      };
      
      return label;
    };
    return dataLabel; 
});