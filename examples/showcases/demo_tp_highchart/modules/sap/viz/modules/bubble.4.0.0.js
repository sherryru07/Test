sap.riv.module(
{
  qname : 'sap.viz.modules.bubble',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.modules.dispatch',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.ColorSeriesGenerator',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.ShapeSeriesGenerator',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.Repository',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.TextUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.lassoSelection',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Scaler',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.NumberUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.DrawUtil',
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
{  qname : 'sap.viz.format.FormatManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.BoundUtil',
  version : '4.0.0'
}
],
function Setup(dispatch, ColorSeries, ShapeSeries, TypeUtils, Repository, TextUtils, lassoSelection, Scaler, NumberUtils, DrawUtil, langManager, tooltipDataHandler, Objects,formatManager, langManager, BoundUtil) 
{
    return function(manifest, ctx) 
    {
        var width = 500, height = 300, padding = 0;
        var data = null, props = {};
        var xScale = d3.scale.linear();
        var yScale = d3.scale.linear();
        var wScale, hScale;
        var wMax,wMin,hMax,hMin,xMax,xMin,yMax,yMin;
        //zhu alistar
        var randomSuffix = Repository.newId();
        function resetBoundaryValues(){
          wMax = 0; wMin = Number.MAX_VALUE;
          hMax = 0; hMin = Number.MAX_VALUE;
          xMax = 0; // max value for xAxis
          xMin = 0; // min value for xAxis
          yMax = 0; // max value for yAxis
          yMin = 0; // max value for yAxis  
        }
        resetBoundaryValues();
        var distinctValuesObj;
        var bubbleScale = 1/6;
        var color = ColorSeries.sap32().range(), shape = ShapeSeries.sapShapes().range();
        var markers = [];
        var g, defs, tooltipX, tooltipY, crossX, crossY;
        var selectionStatus = [];
        var tooltipVisible = true;
        var markerStyle = {
            'stroke' : '#ffffff',
            'stroke-width' : 1
        };
        var selectedMarkerStyle = {
            'stroke' : '#333333',
            'stroke-width' : 1
        };
        var animateTime = 1000;
        var enableDataLoadingAnimation = true,  // control initialization animation 
            enableDataUpdatingAnimation = true, // control data updating animation
            bFirstCreation = true;
        var eDispatch = new dispatch('selectData', 'deselectData', 'showTooltip', 'hideTooltip', 'initialized', 'startToInit');
        var _selection;
        var sizeLegendTitle = null;
        var drawingEffect = 'normal';
        var effectManager = ctx.effectManager;
        var markerSize = 10;
        var animationComplete = false;
        var formatString ;
        
        function bubble(selection) {
            BoundUtil.drawBound(selection, width, height);
            _selection = selection;
            renderChart(selection);
            bFirstCreation = false;
            return bubble;
        }

        bubble.width = function(value) {
            if (!arguments.length){
                return width;
            }
            width = value;
            if(TypeUtils.isExist(width) && TypeUtils.isExist(height)&& TypeUtils.isExist(data)){
               computeScales();
            }
            return bubble;
        };

        bubble.height = function(value) {
            if (!arguments.length){
                return height;
            }
            height = value;
            if(TypeUtils.isExist(width) && TypeUtils.isExist(height)&& TypeUtils.isExist(data)){
              computeScales();
            }
            return bubble;
        };
        
        bubble.afterUIComponentAppear = function(){
          eDispatch.initialized(); 
        };
        
        
        bubble.padding = function(value){
            if(!arguments.length){
                return padding;
            }
            padding = value;
            if(TypeUtils.isExist(width) && TypeUtils.isExist(height)&& TypeUtils.isExist(data)){
              computeScales();
            }
            return bubble;
        };
        bubble.valueAxis1Scale = function(value){
          if(!arguments.length){
                return xScale;
          }
          xScale = value;
          return bubble;
        };
        bubble.valueAxis2Scale = function(value){
          if(!arguments.length){
            return yScale;
          }
          yScale = value;
          return bubble;
        };
        
        bubble.valueAxis1DataRange = function(range){
          if (!arguments.length){
            return {
              min: xMin,
              max: xMax
            };
          }
          xMax = range.max;
          xMin = range.min;
          if(TypeUtils.isExist(width) && TypeUtils.isExist(height)){
            computeScales();
          }
          return bubble;
        };
        
        bubble.valueAxis2DataRange = function(range){
          if (!arguments.length){
            return {
              min: yMin,
              max: yMax
            };
          }
          yMax = range.max;
          yMin = range.min;
          if(TypeUtils.isExist(width) && TypeUtils.isExist(height)){
            computeScales();
          }
          return bubble;
        };
        
        bubble.bubbleWidthDataRange = function(range){
          if (!arguments.length){
            return {
              distinctValuesObj : distinctValuesObj,
              min: wMin,
              max: wMax
            };
          }
          wMax = range.max;
          wMin = range.min;
          distinctValuesObj = range.distinctValuesObj;
          if(TypeUtils.isExist(width) && TypeUtils.isExist(height)){
            computeScales();
          }
          return bubble;
        };
        
        bubble.bubbleHeightDataRange = function(range){
          if (!arguments.length){
            return {
              min: hMin,
              max: hMax
            };
          }
          hMax = range.max;
          hMin = range.min;
          if(TypeUtils.isExist(width) && TypeUtils.isExist(height)){
            computeScales();
          }
          return bubble;
        };
        
        bubble.colorPalette = function(value){
        if(!arguments.length){
          return color;
        }
        color = value;
        return bubble;
      };
      bubble.shapes = function(value){
        if(!arguments.length){
          return shape;
        }
        shape = value;
        return bubble;
      };
      bubble.sizeLegend = function() {
           var heightFeed = data.getMeasureValuesGroupDataByIdx(3);
           var hasHeightFeed = (TypeUtils.isExist(heightFeed) && heightFeed.values.length > 0);
          return {      
              bubbleScale : bubbleScale,
              space : padding,
              scale : wScale,
              data : sizeData(),
              title : sizeLegendTitle,
              hasHeightFeed : hasHeightFeed
          };
      };
        bubble.dispatch = function(_){
            if(!arguments.length){
                return eDispatch;
            }
            eDispatch = _;
            return this;
        };
        
        bubble.dataLabel = function(_){
          
        };
        

         /**
            * set/get data, for some modules like Title, it doesn't need data
            */
        bubble.data = function(value){
            if (!arguments.length){
                return data;
            }
            data = value;
            if(TypeUtils.isExist(width) && TypeUtils.isExist(height)&& TypeUtils.isExist(data)){
              calculateBoundaryValues();
              computeScales();
            }
            return bubble;            
        };

        bubble.valueAxis1Title = function(_){
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
        
        bubble.valueAxis2Title = function(_){
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
        /**
        * set/get properties
        */
        bubble.properties = function(_){
            if (!arguments.length){
                return props;
            }
            Objects.extend(true, props, _);
            parseOptions();
            return bubble;            
        };
     
     function parseOptions() {
       color = props.colorPalette;
       shape = props.shapePalette;
       tooltipVisible = props.axisTooltip.visible;
       drawingEffect = props.drawingEffect;
       enableDataLoadingAnimation =  props.animation.dataLoading;
       enableDataUpdatingAnimation =  props.animation.dataUpdating;
       formatString = props.axisTooltip.formatString;
       // necessary to check, since markerSize is N/A for bubble chart
       var _markerSize = props.markerSize;
       markerSize = TypeUtils.isExist(_markerSize) && _markerSize <= 32 && _markerSize >= 4 ? _markerSize : markerSize;
       if(props.xScaleType && props.xScaleType === "log") {
         xScale = d3.scale.log();
       }
     }
        
      function calculateBoundaryValues() {
          resetBoundaryValues();
          var measureFeed1 = data.getMeasureValuesGroupDataByIdx(0);
          var measureFeed2 = data.getMeasureValuesGroupDataByIdx(1);
          var bubbleWidthFeed = data.getMeasureValuesGroupDataByIdx(2);
          var bubbleHeightFeed = data.getMeasureValuesGroupDataByIdx(3);
          distinctValuesObj = {};
          
          for (var i = 0; i < measureFeed1.values[0].rows.length; i++) {
              for (var j = 0; j < measureFeed1.values[0].rows[i].length; j++) {
                  var x = measureFeed1.values[0].rows[i][j].val;
                  var y = measureFeed2.values[0].rows[i][j].val;
                  
                  if (NumberUtils.isNoValue(x) || NumberUtils.isNoValue(y)) {
                      continue;
                  }
                  
                  var w = bubbleWidthFeed && bubbleWidthFeed.values.length && TypeUtils.isExist(bubbleWidthFeed.values[0].rows[i][j].val) ? Math.abs(bubbleWidthFeed.values[0].rows[i][j].val) : null;
                  var h;
                  if (bubbleHeightFeed && bubbleHeightFeed.values.length) {
                      if (TypeUtils.isExist(bubbleHeightFeed.values[0].rows[i][j].val)) {
                          h = Math.abs(bubbleHeightFeed.values[0].rows[i][j].val);
                      } else {
                          h = null;
                      }
                  } else {
                      h = w;
                  }
      
                  if (!NumberUtils.isNoValue(w)) {
                      distinctValuesObj[w] = '';
                  } 
                  xMax = x > xMax ? x : xMax;
                  xMin = x < xMin ? x : xMin;
                  yMax = y > yMax ? y : yMax;
                  yMin = y < yMin ? y : yMin;
                  wMax = w > wMax ? w : wMax;
                  wMin = w < wMin ? w : wMin;
                  hMax = h > hMax ? h : hMax;
                  hMin = h < hMin ? h : hMin;
              }
          }
          
          
      }
    
        function computeScales() {

          var bubbleWidthFeed = data.getMeasureValuesGroupDataByIdx(2);
          var bubbleHeightFeed = data.getMeasureValuesGroupDataByIdx(3);
          if(props.xScaleRange){
            xScale.domain([props.xScaleRange.min, props.xScaleRange.max]).range([padding, width - padding]).nice();
          }else{
            //when xmax and xmin are 0, we make the xscale.domain(0,1)
            if( xMax === 0 && xMin === 0 ){
              xScale.domain([0, 1]).range([padding, width - padding]).nice();
            }else{
              xScale.domain([xMin * (1 + bubbleScale), xMax * (1 + bubbleScale)]).range([padding, width - padding]).nice();
            }
          }
          Scaler.perfect(xScale);
          //when ymin and ymax are 0 ,we make the yscale.domain(0,1)
          if( yMax === 0 && yMin === 0){
            yScale.domain([0,1]).range([height - padding, padding]).nice();  
          }else{
            yScale.domain([yMin * (1 + bubbleScale), yMax * (1 + bubbleScale)]).range([height - padding, padding]).nice();
          }
          Scaler.perfect(yScale);
          

          var rMax;
          //[Jimmi/8/17/2012]here we means if you don't feed data for width and height, we won't change the scale even if the data range
          //has been passed by  bubbleWidthDataRange and bubbleHeightDataRange
          if (bubbleWidthFeed && bubbleWidthFeed.values.length && wMax !== wMin) {
              if(props.wScaleMax){
                wScale = bubbleSizeScale(props.wScaleMax, true, bubbleHeightFeed);
              }
              else{
                wScale = bubbleSizeScale(wMax, true, bubbleHeightFeed);
              }
              sizeLegendTitle = bubbleWidthFeed.values[0].col;
          } else {
              wScale = function(value) {
                  return markerSize;
              };
          }
          
          if (bubbleHeightFeed && bubbleHeightFeed.values.length && hMax !== hMin) {
              hScale = bubbleSizeScale(hMax, false);
          } else {
            if(wScale && hMax > hMin){
              hScale = wScale;
            }else{
              hScale = function(value) {
                  return markerSize;
              };
            }
          }
        }
        
        function renderChart(selection) {
            // TODO: avoid repeat drawing data when re-draw
            if (g) {
                g.remove();
            }
            if (defs) {
                defs.remove();
            }
            
            eDispatch.startToInit();
            
            var i;//for iteration
            
            //we will share tooltip-x and tooltip-y between modules in a same chart
            var parent = d3.select(selection.node().ownerSVGElement.parentNode);
            if (tooltipVisible && parent.select('svg.sc-tooltip-x').node() === null) {
              parent.append('svg').style('position', 'absolute').attr('class', 'sc-tooltip-x').attr('pointer-events', 'none').attr('width', '0').attr('height', 0);
            }
            tooltipX = parent.select('svg.sc-tooltip-x');
            if (tooltipVisible && parent.select('svg.sc-tooltip-y').node() === null) {
              parent.append('svg').style('position', 'absolute').attr('class', 'sc-tooltip-y').attr('pointer-events', 'none').attr('width', '0').attr('height', 0);
            }
            tooltipY = parent.select('svg.sc-tooltip-y');
            
        //    getThemeStyleDef();
            
            var measureFeed1 = data.getMeasureValuesGroupDataByIdx(0);
            var measureFeed2 = data.getMeasureValuesGroupDataByIdx(1);
            var bubbleWidthFeed = data.getMeasureValuesGroupDataByIdx(2);
            var bubbleHeightFeed = data.getMeasureValuesGroupDataByIdx(3);
            var colorFeed = data.getAnalysisAxisDataByIdx(0);
            var shapeFeed = data.getAnalysisAxisDataByIdx(1);
            
           
            var clipPathId = 'edge-clip-' + randomSuffix;
            defs = selection.append('defs');
            defs.append('clipPath').attr('id', clipPathId).append('rect').attr('width', width).attr('height', height);
            
            g = selection.append('g').attr('class','datashapesgroup');  
            g.attr('clip-path', 'url(#' + clipPathId + ')');  
            
            g.append('rect')
                    .attr('x', 0)
                    .attr('y', 0)
                    .attr('width', width)
                    .attr('height', height)
                    .attr('fill-opacity', 0)
                    .attr('id', 'event-rect' + randomSuffix);
            crossX = g.append('line').attr('id', 'cross-x-' + randomSuffix).attr('stroke-width', 1).attr('stroke', '#cccccc').attr('shape-rendering','crispEdges').attr('visibility', 'hidden');
            crossY = g.append('line').attr('id', 'cross-y-' + randomSuffix).attr('stroke-width', 1).attr('stroke', '#cccccc').attr('shape-rendering','crispEdges').attr('visibility', 'hidden');
            
            var colorIndex = 0;
            var colorContainer = {};
            
            function renderByShape(i, renderShape, renderArray) {
                for (var j = 0; j < measureFeed1.values[0].rows[i].length; j++) {
                    // Currently just group by the first dimension in hierarchy
                    var colorFeedVal = (colorFeed && colorFeed.values.length  > 0) ? colorFeed.values[0].rows[j].val : 0;
                    var colorValue;
                    if (colorContainer[colorFeedVal]) {
                        colorValue = colorContainer[colorFeedVal];
                    } else {
                        colorValue = color[colorIndex % color.length];
                        colorContainer[colorFeedVal] = colorValue;
                        colorIndex++;
                    }
                    var x = measureFeed1.values[0].rows[i][j].val;
                    var y = measureFeed2.values[0].rows[i][j].val;
                    var w = bubbleWidthFeed && bubbleWidthFeed.values.length ? bubbleWidthFeed.values[0].rows[i][j].val : null;
                    var h = bubbleHeightFeed && bubbleHeightFeed.values.length ? bubbleHeightFeed.values[0].rows[i][j].val : null;
                    
                    var renderData = {
                        x : x,
                        y : y,
                        w : w, 
                        h : h,
                        colorIndex : j,
                        shapeIndex : i,
                        colorValue : colorValue,
                        shapeValue : renderShape,
                        val : [x, y, w, h],
                        ctx : [
                            measureFeed1.values[0].rows[i][j].ctx, 
                            measureFeed2.values[0].rows[i][j].ctx,
                            bubbleWidthFeed && bubbleWidthFeed.values.length ? bubbleWidthFeed.values[0].rows[i][j].ctx : null,
                            bubbleHeightFeed && bubbleHeightFeed.values.length ? bubbleHeightFeed.values[0].rows[i][j].ctx : null
                        ]
                    };
                    
                    if (!NumberUtils.isNoValue(x) && !NumberUtils.isNoValue(y)) {
                        renderArray.push(renderData);
                    }
                }
            }
            
            
            
            
            var renderArray = [];
            var renderShape;
            if (shapeFeed && shapeFeed.values.length > 0) {
                i = 0;
                for (var shapeIndex = 0, shapeContainer = {}; i < shapeFeed.values[0].rows.length; i++) {
                    // Currently just group by the first dimension in hierarchy
                    var shapeFeedVal = shapeFeed.values[0].rows[i].val;
                    if (shapeContainer[shapeFeedVal]) {
                        renderShape = shapeContainer[shapeFeedVal];
                    } else {
                        renderShape = shape[shapeIndex % shape.length];
                        shapeContainer[shapeFeedVal] = renderShape;
                        shapeIndex++;
                    }
                    renderByShape(i, renderShape, renderArray);
                }
            } else {
                renderByShape(0, shape[0], renderArray);
            }

            // sort to draw big shape first
            renderArray.sort(function(a, b) {
                var ah = a.h === null ? a.w : a.h;
                var bh = b.h === null ? b.w : b.h;
                return Math.abs(b.w * bh) - Math.abs(a.w * ah);
            });
            
            var completedArray = 0;
            animationComplete = false;
            hideTooltip();
            function checkAnimationCompleted(d, m) {
                completedArray++;
                if (completedArray === renderArray.length) {
                  animationComplete = true;
                    eDispatch.initialized();
                }
            }
 
            var enableAnimation = (enableDataLoadingAnimation && bFirstCreation) || (enableDataUpdatingAnimation && !bFirstCreation);
            for (i = 0; i < renderArray.length; i++) {
                var x = renderArray[i].x, 
                    y = renderArray[i].y, 
                    w = renderArray[i].w, 
                    h = bubbleHeightFeed && bubbleHeightFeed.values.length ? renderArray[i].h : w, 
                    colorValue = renderArray[i].colorValue; 
                renderShape = renderArray[i].shapeValue;
                    
                    
                var markerShape;
                
                var rx = wScale(w) / 2,
                  ry = hScale(h) / 2;
                var aniTime = 0;
                if (enableAnimation){
                  aniTime = animateTime;
                }
                var newG = g.append('g').attr('class', 'datashape').attr('transform', 'translate(' + xScale(x) + ',' + yScale(y) + ')');
                var element = DrawUtil.createElements(newG, {shape: renderShape, className: "viz-correlation-marker datapoint"} );
                var parameter = {
                  drawingEffect: drawingEffect,
                  fillColor: colorValue,
                  graphType: renderShape,
                  direction: 'vertical',
                  rx: rx,
                  ry: ry,
                  borderWidth:  markerStyle['stroke-width'],
                  borderColor: markerStyle['stroke'],
                  node:element,
                  visibility: "visible",
                  animateTime: aniTime,
                  endFunc: checkAnimationCompleted
                };

                DrawUtil.drawGraph(parameter, effectManager).attr('opacity', '0.8');    
            }
            selection.selectAll('.viz-correlation-marker').data(renderArray);
            
            if (!enableAnimation) {
              animationComplete = true;
                eDispatch.initialized();
            }
        }
        
        function bubbleSizeScale(vMax, wh, heightFeed) {
            // even 0 value for bubble size, still render a small size shape
            return function(value) {
                if (NumberUtils.isNoValue(value)) {
                    return 4;
                }
                var range;
                if (wh) {
                    range = !heightFeed && height < width ? height : width;
                } else {
                    range = height;
                }
                var r = Math.pow(Math.abs(value) / vMax, 0.5) * (range - padding) * bubbleScale;
                return r > 4 ? r : 4;
            };
        }
        
//        function getThemeStyleDef() {
//            var markerThemeStyle = ctx.styleManager.query('viz-correlation-marker');
//            if(markerThemeStyle){
//                if(markerThemeStyle['stroke']){
//                    markerStyle['stroke'] = markerThemeStyle['stroke'];
//                }
//                if(markerThemeStyle['stroke-width']){
//                    markerStyle['stroke-width'] = markerThemeStyle['stroke-width'];
//                }
//            }
//            var selectedMarkerThemeStyle = ctx.styleManager.query('viz-correlation-marker-selected');
//            if(selectedMarkerThemeStyle){
//                if(selectedMarkerThemeStyle['stroke']){
//                    selectedMarkerStyle['stroke'] = selectedMarkerThemeStyle['stroke'];
//                }
//                if(selectedMarkerThemeStyle['stroke-width']){
//                    selectedMarkerStyle['stroke-width'] = selectedMarkerThemeStyle['stroke-width'];
//                }
//            }
//        }
        
        function sizeData() {
            var wDistinctValues = 0;
            for (var i in distinctValuesObj) {
              if(distinctValuesObj.hasOwnProperty(i)){
                wDistinctValues++;
              }
            }
            if (wDistinctValues === 0) {
                return [];
            } else if (wDistinctValues === 1) {
                return [wMax];
            } else if (wDistinctValues === 2) {
                return [wMax, wMin];
            } else {
                return [wMax, (wMax + wMin) / 2, wMin];
            }
        }
        
        bubble.parent = function() {
            return _selection;
        };

        bubble.mouseover = function(target) {
            var item = d3.select(target);
            if(item === undefined || item.node() === null || !animationComplete){
              return;
            }
            if (item.attr('id') !== null && (item.attr('id') === ('event-rect' + randomSuffix) 
                || item.attr('id').indexOf('cross-x-') >= 0
                || item.attr('id').indexOf('cross-y-') >= 0)) {
                return;
            }
            var val = item.datum();
            item.attr('opacity', '1');
            crossX.attr('visibility', 'visible')
                    .attr('x1', 0)
                    .attr('y1', yScale(val.y))
                    .attr('x2', width)
                    .attr('y2', yScale(val.y));
            crossY.attr('visibility', 'visible')
                    .attr('x1', xScale(val.x))
                    .attr('y1', 0)
                    .attr('x2', xScale(val.x))
                    .attr('y2', height);
            showTooltip(val, _selection[0][0].getTransformToElement(_selection[0][0].ownerSVGElement));
            
        };
        
        bubble.mouseout = function(target, isHighlighted) {
            var item = d3.select(target);
            if(item === undefined || item.node() === null || !animationComplete) {return;}
            if (item.attr('id') === ('event-rect' + randomSuffix)) {
                return;
            }

            if (isHighlighted) {
                item.attr('opacity', '0.8');
            } else {
                item.attr('opacity', '0.2');
            }
            
            crossX.attr('visibility', 'hidden');
            crossY.attr('visibility', 'hidden');
            
            hideTooltip();
        };
        
        function showTooltip(val, transform) {
            var measureFeed1 = data.getMeasureValuesGroupDataByIdx(0);
            var measureFeed2 = data.getMeasureValuesGroupDataByIdx(1);
            var bubbleWidthFeed = data.getMeasureValuesGroupDataByIdx(2);
            var bubbleHeightFeed = data.getMeasureValuesGroupDataByIdx(3);
            var colorFeed = data.getAnalysisAxisDataByIdx(0);
            var shapeFeed = data.getAnalysisAxisDataByIdx(1);
            
            var tooltipData = {
                body: [],
                footer: []
            };
            var footer;//for iteration
            //push color footer to tooltipData
            for (var i = 0, len = (colorFeed ? colorFeed.values.length : 0); i < len; i++) {
              footer = {};
              footer.label = colorFeed.values[i].col.val;
              footer.value = colorFeed.values[i].rows[val.colorIndex].val;
              tooltipData.footer.push(footer);
            }
            //push shape footer to tooltipData
            for (var j = 0, jlen = (shapeFeed ? shapeFeed.values.length : 0); j < jlen; j++) {
              footer = {};
              footer.label = shapeFeed.values[j].col.val;
              footer.value = shapeFeed.values[j].rows[val.shapeIndex].val;
              tooltipData.footer.push(footer);
            }
            
            tooltipData.body.push({
              name : !TypeUtils.isExist(measureFeed1.values[0].col) ? langManager.get('IDS_ISNOVALUE') : measureFeed1.values[0].col,
              val : [{
                color : val.colorValue,
                shape : val.shapeValue,
                value : val.x
              }]
            });
            
            tooltipData.body.push({
              name : !TypeUtils.isExist(measureFeed2.values[0].col) ? langManager.get('IDS_ISNOVALUE') : measureFeed2.values[0].col,
              val :[{
                color : val.colorValue,
                shape : val.shapeValue,
                value : val.y
              }]
            });
            
            if (bubbleWidthFeed && bubbleWidthFeed.values.length > 0) {
              tooltipData.body.push({
                  name : !TypeUtils.isExist(bubbleWidthFeed.values[0].col) ? langManager.get('IDS_ISNOVALUE') : bubbleWidthFeed.values[0].col,
                  val : [{
                    color : val.colorValue,
                    shape : val.shapeValue,
                    value : NumberUtils.isNoValue(val.w) ? langManager.get('IDS_ISNOVALUE') : val.w
                  }]
                });
            }
            if (bubbleHeightFeed && bubbleHeightFeed.values.length > 0) {
              tooltipData.body.push({
                  name : !TypeUtils.isExist(bubbleHeightFeed.values[0].col) ? langManager.get('IDS_ISNOVALUE') : bubbleHeightFeed.values[0].col,
                  val : [{
                    color : val.colorValue,
                    shape : val.shapeValue,
                    value : NumberUtils.isNoValue(val.h) ? langManager.get('IDS_ISNOVALUE') : val.h
                  }]
                });
            }

            tooltipData.point = {
               x : xScale(val.x),
               y : yScale(val.y) + transform.f
            };
            tooltipData.plotArea = {
               x : transform.e,
               y : transform.f,
               width : width,
               height : height
            };
            
            eDispatch.showTooltip(tooltipDataHandler.formatTooltipData(tooltipData));
            
            if (tooltipVisible) {
                var xAxisValue, yAxisValue;
                if (TypeUtils.isExist(formatString)) {
                    xAxisValue = formatManager.format(val.x, formatString[0]);
                    yAxisValue = formatManager.format(val.y, formatString[1]);
                } else {
                    xAxisValue = val.x;
                    yAxisValue = val.y;
                }
                drawXYTooltip(xAxisValue, tooltipX, {
                    x : xScale(val.x),
                    y : yScale(val.y)
                }, transform, 'x');
                drawXYTooltip(yAxisValue, tooltipY, {
                    x : xScale(val.x),
                    y : yScale(val.y)
                }, transform, 'y');
            }

        }
        
        function hideTooltip() {
            eDispatch.hideTooltip();
            if (tooltipVisible) {
                tooltipX.selectAll('g').remove();
                tooltipY.selectAll('g').remove();
            }
        }
        
        function drawXYTooltip(value, container, point, transform, axis) {
            var font = {
                size : '12px',
                weight : 'bold',
                family : '"Open Sans", Arial, Helvetica, sans-serif'
            };
            var valueSize = TextUtils.fastMeasure(value, font.size, font.weight, font.family);
            container.attr('width', valueSize.width + 20).attr('height', valueSize.height + 10);
            container.wrapper = container.append('g');
            container.wrapper.append('rect')
                    .attr('x', 1)
                    .attr('y', 1)
                    .attr('rx', 4)
                    .attr('ry', 4)
                    .attr('width', valueSize.width + 18)
                    .attr('height', valueSize.height + 8)
                    .attr('fill', '#ffffff')
                    .attr('stroke', '#000000')
                    .attr('stroke-width', 1);
            container.wrapper.append('text')
                    .attr('x', 10)
                    .attr('y', valueSize.height + 3)
                    .attr('fill', '#000000')
                    .style('font', font.weight + ' ' + font.size + ' ' + font.family)
                    .text(value);
            if ('y' === axis) {
                container.style('left', transform.e - container.attr('width') + 1 + 'px').style('top',( point.y + transform.f - container.attr('height') / 2 ) + 'px');
            } else if ('x' === axis) {
                container.style('left', point.x + transform.e -  container.attr('width') / 2 + 'px').style('top', transform.f + height - 1 + 'px');
            }
        }

        function getChangedValues(changedArray) {
            var measureFeed1 = data.getMeasureValuesGroupDataByIdx(0);
            var measureFeed2 = data.getMeasureValuesGroupDataByIdx(1);
            var bubbleWidthFeed = data.getMeasureValuesGroupDataByIdx(2);
            var bubbleHeightFeed = data.getMeasureValuesGroupDataByIdx(3);
            var result = [];
            for (var i = 0; i < changedArray.length; i++) {
                var colorIndex = changedArray[i].colorIndex;
                var shapeIndex = changedArray[i].shapeIndex;
                
                result.push([
                    measureFeed1.values[0].rows[shapeIndex][colorIndex],
                    measureFeed2.values[0].rows[shapeIndex][colorIndex],
                    bubbleWidthFeed && bubbleWidthFeed.values.length > 0 ? bubbleWidthFeed.values[0].rows[shapeIndex][colorIndex] : null,
                    bubbleHeightFeed && bubbleHeightFeed.values.length > 0 ? bubbleHeightFeed.values[0].rows[shapeIndex][colorIndex] : null
                ]);
            }
            return result;
        }
        
        bubble.highlight = function(elems) {
            if (TypeUtils.isArray(elems)) {
                for (var i = 0, len = elems.length; i < len; i++) {
                    d3.select(elems[i]).attr('class', 'viz-correlation-marker-selected datapoint').attr('opacity', '0.8').attr('stroke', selectedMarkerStyle['stroke']).attr('stroke-width', selectedMarkerStyle['stroke-width']);
                }
            } else {
                d3.select(elems).attr('class', 'viz-correlation-marker-selected datapoint').attr('opacity', '0.8').attr('stroke', selectedMarkerStyle['stroke']).attr('stroke-width', selectedMarkerStyle['stroke-width']);
            }
        };
        
        bubble.unhighlight = function(elems) {
            if (TypeUtils.isArray(elems)) {
                for (var i = 0, len = elems.length; i < len; i++) {
                    d3.select(elems[i]).attr('class', 'viz-correlation-marker datapoint').attr('opacity', '0.2').attr('stroke', markerStyle['stroke']).attr('stroke-width', markerStyle['stroke-width']);
                }
            } else {
                d3.select(elems).attr('class', 'viz-correlation-marker datapoint').attr('opacity', '0.2').attr('stroke', markerStyle['stroke']).attr('stroke-width', markerStyle['stroke-width']);
            }
        };
        
        bubble.clear = function(gray) {
            var allMarks = _selection.selectAll('.datapoint').attr('class', 'viz-correlation-marker datapoint').attr('stroke', markerStyle['stroke']).attr('stroke-width', markerStyle['stroke-width']);
            if (gray) {
                allMarks.attr('opacity', '0.2');
            } else {
                allMarks.attr('opacity', '0.8');
            }
            
        };
        props = manifest.props(null);
        return bubble;
    };
});