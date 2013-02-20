sap.riv.module(
{
  qname : 'sap.viz.modules.area',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.modules.dispatch',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.MNDHandler',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Scaler',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.ColorSeriesGenerator',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.BoundingBox',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.NumberUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.DrawUtil',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.tooltipDataHandler',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.Repository',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.UADetector',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.BoundUtil',
  version : '4.0.0'
}
],
function Setup(dispatch, MNDHandler, TypeUtils, Scaler, ColorSeries, BoundingBox, NumberUtils, langManager, DrawUtil, TooltipDataHandler, Manifest, Repository, Objects,UADetector, BoundUtil) 
{
  return function(manifest, ctx) 
  {
    var width, height;
    var data_ = null, props;
    //alistar zhu
    var randomSuffix = Repository.newId();
    //alex su
    var tooltipData = null;
    var _tooltipDataHandler;

    var bgColor = "#FFFFFF";
    var hoverColor = "#cccccc";
    var selectedColor = "#333333";
    var xScale = d3.scale.ordinal();
    var mouseMoveLine;
    var preHighLightIndex;
    var g;
    var svgMarkersGroup, svgAreasGroup, svgAreaBgGroup;
    var eDispatch = new dispatch('showTooltip', 'hideTooltip', 'initialized', 'startToInit');
    var effectManager = ctx.effectManager;
    var valueAxis1Data = {
        data: [],
        scale: d3.scale.linear(),
        colorPalette:null,
        selectedMarkers: null,
        markers:[],
        areas:[],
        bottomValue: null,
        topValue:null
    };

  
    var colorPalette = [];
    var bAnimationComplete = false;
    var enableDataLoadingAnimation = true;

    var selectedMarkerNum = 0;

    // clip defs for enimation

    var clipRect;
    
    var OPACITY = 0.4;
    
    var bDataUpdated = false;
    function area(selection) {
      //selection.each(generate);
      BoundUtil.drawBound(selection, width, height);
      //alex su
      _tooltipDataHandler = TooltipDataHandler();
      
      renderChart(selection);
      return area;
    }

   // For normal stacked area chart, currently we only use globally stacked 
//    function calculateStackedMinMax(axisValue, minMax)
//    {
//    
//      var accuPositiveValues = new Array(axisValue.data[0].length);
//      var accuNegativeValues = new Array(axisValue.data[0].length);
//      var i;
//      for(i = 0; i < accuPositiveValues.length; ++i)
//      {
//        accuPositiveValues[i] = 0;
//        accuNegativeValues[i] = 0;
//      }
//      for(i = 0; i < axisValue.data.length; ++i)
//      {
//        for(var j = 0; j < axisValue.data[i].length; ++j)
//        {
//          if(!NumberUtils.isNoValue(axisValue.data[i][j].val))
//          {
//            if(axisValue.data[i][j].val >= 0)
//            {
//              accuPositiveValues[j] += axisValue.data[i][j].val ;
//            } else {
//              accuNegativeValues[j] += axisValue.data[i][j].val ;
//            }
//          }
//        }
//      }
//      minMax.max = d3.max(accuPositiveValues);
//      minMax.min = d3.min(accuNegativeValues);
//    }
    
    function calculateGloballyStackedMinMax(axisValue, minMax)
    {
    
      var accuValues = new Array(axisValue.data[0].length);
      var i;
      for(i = 0; i < accuValues.length; ++i)
      {
        accuValues[i] = 0;
      }
      for(i = 0; i < axisValue.data.length; ++i)
      {
        for(var j = 0; j < axisValue.data[i].length; ++j)
        {
          if(!NumberUtils.isNoValue(axisValue.data[i][j].val))
          {
              accuValues[j] += axisValue.data[i][j].val;
              if(minMax.min === null)
              {
                minMax.min = accuValues[j];
                minMax.max = accuValues[j];
              }else{
                minMax.min = minMax.min > accuValues[j] ? accuValues[j] : minMax.min;
                minMax.max = minMax.max > accuValues[j] ? minMax.max : accuValues[j];
              }
          }
        }
      }
    }


    function calculateMinMax(axisValue)
    {
      var minMax = {
          min:null,
          max:null
      };
      if(!axisValue.data || axisValue.data.length === 0){
        return minMax;}
      if(props.mode === "percentage"){
        minMax.min = 0;
        minMax.max = 1;
        return minMax;
      }
      /*  for normal stacked chart and non-stacked chart
     if(props.bStacked){
        calculateStackedMinMax(axisValue, minMax);
      }else{
        minMax.max = Number(d3.max(axisValue.data, function(d){
          return d3.max(d, function(_){ return _.val;});
        }));
        minMax.min = Number(d3.min(axisValue.data, function(d){
          return d3.min(d, function(_){ return _.val;});
        }));
      }
      */
      calculateGloballyStackedMinMax(axisValue, minMax);
      if(NumberUtils.isNoValue(minMax.max )) { return null;}
      
      if(minMax.min >= 0)
      {
        minMax.min = 0;
        minMax.max += minMax.max * 5 / (props.orientation === "vertical" ? height :width) ;
      }
      else if(minMax.max <= 0){
        minMax.max = 0;
        minMax.min +=  minMax.min * 5/ (props.orientation === "vertical" ? height :width);
      }else{
        var temp = (minMax.max - minMax.min) * 5 / (props.orientation === "vertical" ? height :width);
        minMax.min -= temp;
        minMax.max += temp;
      }
      if(minMax.min === 0 && minMax.max === 0){
        minMax.max = 1;
      }
      return minMax;
    }

    function createColorPalette()
    {
      colorPalette = [];
      var i = 0, j = 0;
      valueAxis1Data.colorPalette = props.colorPalette;
      for(i = 0; i < valueAxis1Data.data.length; ++i)
      {
      colorPalette.push(valueAxis1Data.colorPalette[i% valueAxis1Data.colorPalette.length]);
      }
    }

    function calculateScale(axisValue)
    {
       var range = (props.orientation === "vertical" ? [height, 0] : [0,width])
      if(axisValue.data && axisValue.data.length > 0)
      { 
        if(axisValue.topValue === null || axisValue.topValue === undefined)
        {
          var minMax = calculateMinMax(axisValue);
          if(!minMax) {
            axisValue.scale.domain([0, 0]).range (range);
          }
          else  {
            axisValue.scale.domain([minMax.min, minMax.max]).range(range);
          }
        }
        else{
          axisValue.scale.domain([axisValue.bottomValue, axisValue.topValue]).range(range);
        }
        if (!axisValue.manualRange) {
            axisValue.scale.nice();
            Scaler.perfect(axisValue.scale);
        }
      }
      else{
        axisValue.scale.domain([0,0]).range([0,0]);
      }
      return axisValue.scale;
    }

    function computeScales()
    {
      if(!(TypeUtils.isExist(width) && TypeUtils.isExist(height)&& TypeUtils.isExist(data_)))
      {
        return;
      }
      var domain = [];
      var categoryNum = valueAxis1Data.data[0].length;
     
      for (var i=0; i < categoryNum; i++){
        domain.push(i);
      }
      xScale.domain(domain).rangeBands(props.orientation === "vertical" ? [0, width] :[height, 0]);
      calculateScale(valueAxis1Data);
    }

    function changeGroupMarker(groupIndex, visible, borderColor)
    {
      if(groupIndex === undefined || groupIndex === null){
        return;
      }
      var seriesIndex = 0;
      for(seriesIndex = 0; seriesIndex < valueAxis1Data.data.length; ++seriesIndex)
      {   
        if(!valueAxis1Data.selectedMarkers[seriesIndex][groupIndex])
        {
          changeOneMarker(seriesIndex, groupIndex, borderColor, valueAxis1Data);
         if(selectedMarkerNum > 0){
           d3.select(valueAxis1Data.markers[seriesIndex][groupIndex]).attr("opacity", OPACITY).attr("visibility", visible);
         }else{
          d3.select(valueAxis1Data.markers[seriesIndex][groupIndex]).attr("opacity", 1).attr("visibility", visible);
         }
        }
      }

    }

    function changeOneMarker(seriesIndex, xIndex, borderColor, valueAxis)
    {
      d3.select(valueAxis.markers[seriesIndex][xIndex]).attr("stroke",  borderColor);
    }

    function getCategoryIndex(val)
    {
      var index = val / xScale.rangeBand();
      index = Math.floor(index);
      var categoryNum = 0;
      categoryNum = valueAxis1Data.data[0].length;
      if(index > categoryNum - 1) {index = categoryNum - 1;}
      if(index < 0) { index = 0;}
      return (props.orientation === "vertical" ? index : categoryNum - 1 - index);
    }

    function processOneAxisSelect(valueAxis, marker) {
      var findFlag = false, yi, xi;
      for(var i = 0; i < valueAxis.markers.length && !findFlag; i++)
      {
        var xMarks = valueAxis.markers[i];
        for (var j = 0; j<xMarks.length && !findFlag ; j++)
        {
          if(xMarks[j] === marker) {
            findFlag = true;
            yi = i;
            xi = j;
          }
        } //for j
      }//for i

      if (!findFlag) {
        return false;
      }

      if (valueAxis.selectedMarkers[yi][xi]) {
        return true;
      }

      changeOneMarker(yi, xi, selectedColor, valueAxis);
      d3.select(valueAxis.markers[yi][xi]).attr("opacity", 1).attr("visibility", "visible");
      svgAreaBgGroup.selectAll(".areabg").attr("opacity", OPACITY).attr("stroke-opacity", OPACITY);;
      d3.select(valueAxis.areas[yi][xi]).attr("opacity", 1).attr("visibility", "visible");
      valueAxis.selectedMarkers[yi][xi] = true;
      ++selectedMarkerNum;
    }

    function processOneAxisDeselect (valueAxis, marker) {
      var xi = preHighLightIndex;

      var findFlag = false, yi;
      for(var i = 0; i < valueAxis.markers.length && !findFlag; i++)
      {
        var xMarks = valueAxis.markers[i];
        for (var j = 0; j<xMarks.length && !findFlag ; j++)
        {
          if(xMarks[j] === marker) {
            findFlag = true;
            yi = i;
            xi = j;
          }
        } 
      }

      if (!findFlag) {
        return false;
      }

      if (!valueAxis.selectedMarkers[yi][xi]){
        return true;
      }

      if(xi === preHighLightIndex){
        changeOneMarker(yi, xi, bgColor, valueAxis);
      }
      else{
        changeOneMarker(yi, xi, props.style.marker.stroke, valueAxis);
      }
      
      d3.select(valueAxis.markers[yi][xi]).attr("opacity", OPACITY);
      d3.select(valueAxis.areas[yi][xi]).attr("visibility", "hidden");
      if(xi !== preHighLightIndex){
        d3.select(valueAxis.markers[yi][xi]).attr("visibility", "hidden");
      }
      valueAxis.selectedMarkers[yi][xi] = false;
  
      --selectedMarkerNum;
      
//      if(selectedMarkerNum <= 0){
//        svgAreaBgGroup.selectAll(".areabg").attr("opacity", 1).attr("stroke-opacity", 1);
//      }
    }
    
//    function processNullValue(axisValue)
//    {
//      var result = {
//          data:[],
//          color:[]
//      };
//      var arr = [];
//      var k;
//      var obj = {};
//      for(var i = 0; i < axisValue.length; ++i)
//      {
//        var preIndex = 0;
//        for(var j = 0; j < axisValue[i].length; ++j)
//        {
//          if(NumberUtils.isNoValue(axisValue[i][j].val))
//          {
//            if(j > preIndex)
//            {
//              arr = [];
//              arr.push({x:preIndex, y:0});
//              for(k = preIndex; k < j; k++)
//              {
//                obj = {};
//                obj.y = axisValue[i][k].val;
//                obj.x = k;  
//                arr.push(obj);
//              }
//              arr.push({x:k-1, y:0});
//              result.data.push(arr);
//              result.color.push(i);
//             }
//             preIndex = j + 1;
//           }
//        }
//        
//        if(preIndex < axisValue[i].length)
//        {
//          arr = [];
//          arr.push({x:preIndex, y:0});
//          for(k = preIndex; k <  axisValue[i].length; k++)
//          {
//            obj = {};
//            obj.y = axisValue[i][k].val;
//            obj.x = k;
//            arr.push(obj);
//          }
//          arr.push({x:k-1, y:0});
//          result.data.push(arr);
//          result.color.push(i);
//        }
//      }
//      return result;
//    }
//    
//    // for normal stacked area chart, currently not used
//    function generateAreaData(axisValue)
//    {
//      var result = {
//          data:[],
//          color:[],
//          accuPositiveVal:[],
//          accuNegativeVal:[]
//      };
//      var arr = [];
//      var i;
//      var topAreaData = [];
//      var bottomAreaData = [];
//      //generate area for all series
//      for(i = 0; i < axisValue.length; ++i)
//      {
//        result.accuPositiveVal[i] = new Array(axisValue[i].length);
//        result.accuNegativeVal[i] = new Array(axisValue[i].length);
//        for(var j = 0; j < axisValue[i].length; ++j)
//        {
//          result.accuPositiveVal[i][j] = (i > 0 ? result.accuPositiveVal[i-1][j] : 0);
//          result.accuNegativeVal[i][j] =  (i > 0 ? result.accuNegativeVal[i-1][j] : 0);
//          if(!NumberUtils.isNoValue(axisValue[i][j].val))
//          {
//            if(axisValue[i][j].val >= 0)
//            {
//              bottomAreaData.push({x:j, y:result.accuPositiveVal[i][j]});
//              result.accuPositiveVal[i][j] += axisValue[i][j].val ;
//              topAreaData.push({x:j, y: result.accuPositiveVal[i][j]});
//              
//            } else if(axisValue[i][j].val < 0){
//              topAreaData.push({x:j, y:result.accuNegativeVal[i][j]});
//              result.accuNegativeVal[i][j] += axisValue[i][j].val ;
//              bottomAreaData.push({x:j, y:result.accuNegativeVal[i][j]});
//            } 
//            
//            } else {
//            if(j > 0 && !NumberUtils.isNoValue(axisValue[i][j-1].val) )
//            {
//              if(axisValue[i][j - 1].val >= 0)
//              {
//                topAreaData.push({x:j, y: result.accuPositiveVal[i][j]});
//              } else {
//                topAreaData.push({x:j, y:result.accuNegativeVal[i][j]});
//              }
//              topAreaData = topAreaData.concat(bottomAreaData.reverse());
//              result.data.push(topAreaData);
//              result.color.push(i);
//              topAreaData = [];
//              bottomAreaData = [];
//            }
//            
//            if( j < axisValue[i].length - 1 &&  !NumberUtils.isNoValue(axisValue[i][j+1].val))
//            {
//              if(axisValue[i][j+1].val >= 0)
//              {
//                topAreaData.push({x:j, y:result.accuPositiveVal[i][j]});
//              }else{
//                topAreaData.push({x:j, y:result.accuNegativeVal[i][j]});
//              }
//            }
//          }
//        }
//        
//        if(topAreaData.length > 0)
//        {
//          topAreaData = topAreaData.concat(bottomAreaData.reverse());
//          result.data.push(topAreaData);
//          result.color.push(i);
//          topAreaData = [];
//          bottomAreaData = [];
//        }
//      }
//      return result;
//    }

    function generateGloballyStackedAreaData(axisValue)
    {
      var result = {
          data:[],   // store data for each point which use to highlight one area 
          bgAreaData:[], // draw area background region
          accuVal:[]  // accumulated values for stacked area
      };
      var i , j;
      var topAreaData = [];
      var bottomAreaData = [];
   
      // speical process for percentage chart, divide regions for zero values
      var groupValueNumbers = new Array(axisValue[0].length);
      if(props.mode === "percentage" && bDataUpdated)
      {
        turnToPercentage(axisValue);
        bDataUpdated = false;
      }
      
      for( i = 0; i < groupValueNumbers.length; ++i)
      {
        groupValueNumbers[i] = 0;
      }
      result.bgAreaData = new Array(axisValue.length);
      for(i = 0; i < axisValue.length; ++i)
      {     
        result.bgAreaData[i] = [];
        result.accuVal[i] = new Array(axisValue[i].length);
        for( j = 0; j < axisValue[i].length; ++j)
        {
          result.accuVal[i][j] = (i > 0 ? result.accuVal[i-1][j] : 0);
          if(!NumberUtils.isNoValue(axisValue[i][j].val))
          {
            groupValueNumbers[j] ++;
            result.accuVal[i][j] += (props.mode === "percentage" ? Math.abs(axisValue[i][j].val) : axisValue[i][j].val);
          }
        }
      }
      
      // generate background area shape
      for(i = 0; i < axisValue.length; ++i)
      {
        for(j = 0; j < axisValue[i].length; ++j)
        {      
          if(!NumberUtils.isNoValue(axisValue[i][j].val))
          {
            // there are 0 values in group and group contain 0 and null value only 
              bottomAreaData.push({x:j, y: ( i > 0 ? result.accuVal[i - 1][j] : 0)});
              topAreaData.push({x:j, y: result.accuVal[i][j]});
          } else {
            if(groupValueNumbers[j] > 0)
            {
              if(j > 0 && !NumberUtils.isNoValue(axisValue[i][j-1].val) )
              {
                topAreaData.push({x:j, y: result.accuVal[i][j]}); 
                topAreaData = topAreaData.concat(bottomAreaData.reverse());
                result.bgAreaData[i].push(topAreaData);
                topAreaData = [];
                bottomAreaData = [];
              }

              if( j < axisValue[i].length - 1 &&  !NumberUtils.isNoValue(axisValue[i][j+1].val))
              {
                topAreaData.push({x:j, y:result.accuVal[i][j]});
              }
            }else if(topAreaData.length > 0)
            {
              topAreaData = topAreaData.concat(bottomAreaData.reverse());
              result.bgAreaData[i].push(topAreaData);
              topAreaData = [];
              bottomAreaData = [];
            }
          }         
        }

        if(topAreaData.length > 0)
        {
          topAreaData = topAreaData.concat(bottomAreaData.reverse());
          result.bgAreaData[i].push(topAreaData);
          topAreaData = [];
          bottomAreaData = [];
        }
      }
      
      
      // generate path for every point's area
      var element = {};
      for(i = 0; i < axisValue.length; ++i)
      {
        result.data[i] = [];
        for(j = 0; j < axisValue[i].length; ++j)
        {  
            if( j > 0 )
            {
               if( groupValueNumbers[j - 1] > 0)
               {
                 topAreaData.push({x: j - 0.5, y : (result.accuVal[i][j - 1] + result.accuVal[i][j]) / 2});
                 bottomAreaData.push({x : j - 0.5, y: (i > 0 ? ((result.accuVal[i - 1][j - 1] + result.accuVal[i - 1][j]) / 2) : 0)});
               }
            }
            topAreaData.push({x: j, y : result.accuVal[i][j]});
            bottomAreaData.push({x :j, y: ( i > 0 ? result.accuVal[i - 1][j] : 0)});
            if(j < axisValue[0].length - 1)
            {
              if( groupValueNumbers[j + 1] > 0)
              {
                topAreaData.push({x: j + 0.5, y : (result.accuVal[i][j] + result.accuVal[i][j + 1]) / 2});
                bottomAreaData.push({x : j + 0.5, y: (i > 0 ? ((result.accuVal[i - 1][j] + result.accuVal[i - 1][j + 1]) / 2) : 0)});
              }
            }
            topAreaData = topAreaData.concat(bottomAreaData.reverse());
            result.data[i].push(topAreaData);
            topAreaData = [];
            bottomAreaData = [];
            
        }
      }
      return result;
    }
    
    
    function processOneAxis(axisValue)
    {
      if(!axisValue.data || axisValue.data.length === 0){
        return;
      }
      var result = generateGloballyStackedAreaData(axisValue.data);
      // for normal stacked and non-stacked
//      if(props.bStacked){
//        result = generateAreaData(axisValue.data);
//      } else {
//        result = processNullValue(axisValue.data);
//      }


      var areas = svgAreaBgGroup.selectAll("." + "areagroup").data(result.bgAreaData);
      areas.enter().append("svg:g").attr("class", "areagroup");
      areas.exit().remove();
      // draw area chart
      var line = (props.orientation === "vertical" ?  d3.svg.line().x(function(d,i) { return xScale(d.x) + xScale.rangeBand(
) / 2; }).
      y(function(d) {  return axisValue.scale(d.y); }) :
      d3.svg.line().y(function(d,i) { return xScale(d.x) + xScale.rangeBand() / 2; }).
      x(function(d) {  return axisValue.scale(d.y); }));
      areas.attr("transform", 
          function(d, i) {
            var areaShapes = d3.select(this).selectAll(".areabg").data(d);
            areaShapes.enter().append("svg:path").attr("stroke-linejoin", "round").attr("class", "areabg").attr("opacity", 1).attr("stroke-opacity", 1);
            areaShapes.exit().remove();
            areaShapes.attr("transform", function(areapath, index)
            {
            d3.select(this).attr("d", line(areapath)).attr("stroke", function (){
              var para = { graphType:"line", 
                  fillColor:axisValue.colorPalette[i %  axisValue.colorPalette.length]};
                  return effectManager.register(para);
                  })
            .attr("stroke-width", 1)
            .attr("fill",  function (){
                var para = { 
                  drawingEffect:props.drawingEffect,
                  graphType:"rectangle", 
                  direction : props.orientation,
                  fillColor:axisValue.colorPalette[i %  axisValue.colorPalette.length]};
                  return effectManager.register(para);
                });
            });
      });
      
      line = ( props.orientation === "vertical" ? d3.svg.line().x(function(d,i) { return (d.x + 0.5) * xScale.rangeBand();}).
      y(function(d) {  return axisValue.scale(d.y); }) :
      d3.svg.line().y(function(d,i) { return height - (d.x + 0.5) * xScale.rangeBand();}).
      x(function(d) {  return axisValue.scale(d.y); }));
      axisValue.areas = [];
      areas = svgAreasGroup.selectAll("." + "area").data(result.data);
      areas.enter().append("svg:g").attr("class", "area");
      areas.exit().remove();
      areas.attr("transform", 
          function(d, i) {
            markerArr = [];
            var areaShapes = d3.select(this).selectAll(".areashape").data(d);
            areaShapes.enter().append("svg:path").attr("stroke-linejoin", "round").attr("class", "areashape");
            areaShapes.exit().remove();
            areaShapes.attr("transform",function(point, index){
              markerArr.push(d3.select(this).node());
              d3.select(this).attr("d", line(result.data[i][index])).attr("stroke", function (){
                var para = { graphType:"line", 
                    fillColor:axisValue.colorPalette[i %  axisValue.colorPalette.length]};
                    return effectManager.register(para);
              }).attr("stroke-width", 1).attr("visibility", "hidden").attr("fill",  function (){
                var para = { 
                    drawingEffect:props.drawingEffect,
                    graphType:"rectangle", 
                    direction : props.orientation,
                    fillColor:axisValue.colorPalette[i %  axisValue.colorPalette.length]};
            return effectManager.register(para);
            });

      });
      axisValue.areas.push(markerArr);
      }
     );
      
      axisValue.selectedMarkers = new Array(axisValue.data.length);
      axisValue.markers = [];
      
      // draw markers
      for(var seriesIndex = 0; seriesIndex < axisValue.data.length; ++seriesIndex)
      {
        axisValue.selectedMarkers[seriesIndex] = [];
        for(var dataIndex = 0; dataIndex < axisValue.data[0].length; ++dataIndex)
        {
          axisValue.selectedMarkers[seriesIndex][dataIndex] = false;
        }
      }
 
      var groups = svgMarkersGroup.selectAll("g.marker").data(axisValue.data);
      groups.enter().append("svg:g").attr("class", "marker");
      groups.exit().remove();
      
      var visible = "hidden";
      groups.attr("transform", function(d, i) {
        
        var seriesMarkers = d3.select(this).selectAll(".datashape").data(d);
        var datashape = seriesMarkers.enter().append('g').attr('class','datashape');
        DrawUtil.createElements(datashape,{shape: props.marker.shape, className: "datapoint"} );
        seriesMarkers.exit().remove();
        markerArr = [];
        seriesMarkers.attr("transform",function(point, index)
        {   
          if(NumberUtils.isNoValue(point.val))
          { 
              d3.select(this).remove();
              markerArr.push(null);
              return;
          }
          markerArr.push(d3.select(this).selectAll('path').node());
        
          var parameter = {
              drawingEffect:props.drawingEffect,
              graphType: props.marker.shape,
              fillColor : axisValue.colorPalette[i % axisValue.colorPalette.length],
              direction : 'vertical',
              rx: props.marker.size / 2,
              ry: props.marker.size / 2,
              borderWidth: 2,
              borderColor: props.style.marker.stroke,
              strokeOpacity: 0.3,
              node:d3.select(this).select('path'),
              visibility: visible
          };

          DrawUtil.drawGraph(parameter, effectManager);
 
          return   props.orientation === "vertical"
           ? "translate(" + (xScale(index) + xScale.rangeBand() / 2) + "," + axisValue.scale(result.accuVal[i][index]) + ")"
           :  "translate(" + axisValue.scale(result.accuVal[i][index]) + "," + (xScale(index) + xScale.rangeBand() / 2) + ")";
          
//         for non-stacked and normal stacked case
 //         if(props.bStacked)
 //         {
 //           return  "translate(" + (xScale(index) + xScale.rangeBand() / 2) + "," + axisValue.scale(point.val >= 0 ? result.accuPositiveVal[i][index] : result.accuNegativeVal[i][index]) + ")"; 
 //         } else {
 //            return  "translate(" + (xScale(index) + xScale.rangeBand() / 2) + "," + axisValue.scale(point.val) + ")";  
 //         }
        });

        axisValue.markers.push(markerArr); 
      });
    }

    function processOneAxisDeselectAll(valueAxis, xIndex)
    {
      if(selectedMarkerNum === 0 || !valueAxis.selectedMarkers || valueAxis.selectedMarkers.length === 0){
        return;
      }

      for(var seriesIndex = 0; seriesIndex < valueAxis.selectedMarkers.length; ++seriesIndex)
      {
        for(var groupIndex = 0; groupIndex < valueAxis.selectedMarkers[0].length; ++groupIndex)
        {
          if(!valueAxis.selectedMarkers[seriesIndex][groupIndex]) {continue;}
          d3.select(valueAxis.areas[seriesIndex][groupIndex]).attr("visibility", "hidden");
          if(groupIndex === xIndex)
          {
            changeOneMarker(seriesIndex, groupIndex, bgColor, valueAxis);
            d3.select(valueAxis.markers[seriesIndex][groupIndex]).attr("opacity", OPACITY).attr("visibility", "visible");
          }
          else
          {
            changeOneMarker(seriesIndex, groupIndex, props.style.marker.stroke, valueAxis);
            d3.select(valueAxis.markers[seriesIndex][groupIndex]).attr("visibility", "hidden");
          }
        
          valueAxis.selectedMarkers[seriesIndex][groupIndex] = false;
        }
      }
    }

    function deselectedAllHandler()
    {
      var xpoint =   props.orientation === "vertical" ? (d3.event ? d3.event.clientX : 0) - g.node().getBoundingClientRect().left 
      :(d3.event ? d3.event.clientY : 0) - g.node().getBoundingClientRect().top;
      var xIndex = getCategoryIndex(xpoint);

      processOneAxisDeselectAll(valueAxis1Data, xIndex);
      selectedMarkerNum = 0;
    }

    
    function renderChart(selection)
    {
      getCSSStyle();
      eDispatch.startToInit();
      if(!g){ g = selection.append("svg:g");}
      if(!svgMarkersGroup)
      {
        svgAreaBgGroup = g.append("svg:g").attr("class", "areasbg");
        svgAreasGroup = g.append("svg:g").attr("class", "areas");
        if(!mouseMoveLine) {mouseMoveLine = g.append("svg:line");}
        svgMarkersGroup = g.append("svg:g").attr("class", "markers datashapesgroup");
      }    
      if( props.orientation === "vertical" )
      {
        mouseMoveLine.attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", height)
       .attr("stroke-width", 1).attr("stroke", hoverColor)
       .attr("visibility", "hidden").attr("stroke-linejoin", "round");
      }else {
        mouseMoveLine.attr("x1", 0).attr("y1", 0).attr("x2", width).attr("y2", 0)
        .attr("stroke-width", 1).attr("stroke", hoverColor)
        .attr("visibility", "hidden").attr("stroke-linejoin", "round");
      }
      selectedMarkerNum = 0;
      lightAll();
      

      if(!clipRect){
        clipRect = g.append("svg:defs").append("svg:clipPath").attr("id", "clip1_" + randomSuffix).append("rect");
      }
      if( props.orientation === "vertical" )
      {
        clipRect
          .attr("x", 0).attr("y", 0).attr("height", height).attr("width", (enableDataLoadingAnimation ? 0 : width));
      }else{
        clipRect.attr("x", 0).attr("y", (enableDataLoadingAnimation ? height : 0)).attr("height", (enableDataLoadingAnimation ? 0 : height)).attr("width", width);
      }

      svgAreaBgGroup.attr("clip-path", "url(#clip1_" + randomSuffix + ")").attr("fill", "none");
      svgMarkersGroup.attr("clip-path", "url(#clip1_" + randomSuffix + ")").attr("fill", "none");
      if(enableDataLoadingAnimation )
      {
        bAnimationComplete = true;
        var totalNumber = 0;
        var interval = (props.orientation === "vertical" ? width / 50 : height / 50);
        var func = setInterval(function(d){
          if(totalNumber >= (props.orientation === "vertical" ? width : height))
          {
            clearInterval(func);
            eDispatch.initialized();
            svgMarkersGroup.attr("clip-path", null);
          }
          else
          {
            totalNumber += interval;
            if (props.orientation === "vertical" ){
              clipRect.attr("width", totalNumber);
            } else {
              clipRect.attr("height", totalNumber);
              clipRect.attr("y", height - totalNumber);
            }
          }
        },
        20);
      }else {
          eDispatch.initialized();
          svgMarkersGroup.attr("clip-path", null);
          svgAreaBgGroup.attr("clip-path", null);
      }
        
      processOneAxis(valueAxis1Data);
    }
    
    // turn to percentage for value axis
    function turnToPercentage(data)
    {
      
      if(data === null || data === undefined  || data[0].length === 0)
        return;
      
      var i = 0, j = 0;
      var groupSums = new Array(data[0].length);
      var zeroNumbers = new Array(data[0].length);
      for( i = 0; i < groupSums.length; ++i)
      {
        groupSums[i] = 0;
        zeroNumbers[i] = 0;
      }
      for(i = 0; i < data.length; ++i)
      {
        for(j = 0; j < data[i].length; ++j)
        {
          if(!NumberUtils.isNoValue(data[i][j].val))
          {
            groupSums[j] += Math.abs(data[i][j].val);
            if(data[i][j].val === 0)
            {
              ++zeroNumbers[j];
            }
          }
        }
      }
      
      for(i = 0; i < data.length; ++i)
      {
        for(j = 0; j < data[i].length; ++j)
        {
           data[i][j].value = data[i][j].val;
          if(!NumberUtils.isNoValue(data[i][j].val))
              {
                if(groupSums[j] > 0){
                  data[i][j].val = data[i][j].val / groupSums[j];
                }else if(zeroNumbers[j] > 0){
                  data[i][j].val = 1 / zeroNumbers[j];
                }
              } 
        }
      }

    }
  

    function lightAll() {
      svgAreaBgGroup.selectAll(".areabg").attr("opacity", 1).attr("stroke-opacity", 1);
      svgAreasGroup.selectAll(".areashape").attr("visibility", "hidden");
      svgMarkersGroup.selectAll(".datapoint").attr("opacity", 1);
    }

    function grayAll() {
      svgAreaBgGroup.selectAll(".areabg").attr("opacity", OPACITY).attr("stroke-opacity", OPACITY);
      svgAreasGroup.selectAll(".areashape").attr("visibility", "hidden");
      svgMarkersGroup.selectAll(".datapoint").attr("opacity", OPACITY);
    }
    
    function getCSSStyle() {
      if (!props.style){
        props.style = {};
      } 
      var cssDef;
      cssDef = ctx.styleManager.query('viz-plot-background');
      if (cssDef) {
        if (cssDef['fill']) {
          bgColor = cssDef['fill'];
        }
      }
      
      if (!props.style.marker){
        props.style.marker = {};
      }
      props.style.marker.stroke = "transparent";
     
      cssDef = ctx.styleManager.query('viz-plot-hoverline');
      if(cssDef)
      {
        if (cssDef['stroke']){
          hoverColor = cssDef['stroke'];
        }
      }
    }
    area.width = function(value) {
      if (!arguments.length){
        return width;
      }
      width = value;
      computeScales();
     
      return area;
    };
    
    area.height = function(value) {
      if (!arguments.length){
        return height;
      }
      height = value;
      computeScales();
      return area;
    };
    
    area.afterUIComponentAppear = function(){
      eDispatch.initialized(); 
    };
    /*
     * get/set properties
     */
    area.properties = function(_) {
      if (!arguments.length){
        return props;
      } 
      Objects.extend(true, props, _);
      computeScales();
     // if(props.marker.size < 4 || props.marker.size > 32) { props.marker.size = 6;}
     // if(props.width < 1 || props.width > 7) { props.width = 2; }
      props.marker.size = 4;
      props.marker.shape = "circle";
      enableDataLoadingAnimation =  props.animation.dataLoading;
      
      getCSSStyle();

      createColorPalette();
      return area;
    };
    
    area.primaryAxisColor = function(){
          return null;
    };
        
        
    /**
     * get/set your event dispatch if you support event
     */
    area.dispatch = function(_){
      if(!arguments.length){
        return eDispatch;}
      eDispatch = _;
      return area;
    };
    /**
     * set/get data, for some modules like Title, it doesn't need data
     */
    area.data = function(value){
      if (!arguments.length){
        return data_;
      }
      allDataIsNaN = true;
      bDataUpdated = true;
      data_ = value;
      var obj = MNDHandler(data_);
      valueAxis1Data.data = obj["MG1"];
      //alex su
      tooltipData = TooltipDataHandler.dataTransform(obj);
      computeScales();
      createColorPalette();
      return area;        
    };
    
    area.dataLabel = function(_){};
      
      area.primaryAxisTitle = function(_){
        if(!arguments.length){
          var titles =  data_.getMeasureValuesGroupDataByIdx(0), title = [];
          if(titles){
            for(var i=0, len =titles.values.length; i< len;i++ ){
                if (titles.values[i].col !== null && titles.values[i].col !== undefined) {
                  title.push(titles.values[i].col);
                } else {
                  title.push(langManager.get('IDS_ISNOVALUE'));
                }
            }
          }
          return title.join('/');
        }
        return this;
      };
      
     
    /**
     * get color palette
     */
    area.getColorPalette = function() {
      if(colorPalette.length === 0)
      {
        createColorPalette();
      }
      return colorPalette;
    };

    area.shapePalette = function(){
      if(!arguments.length){
        return [props.marker.shape];
      }
      return area;
    };

    area.primaryScale = function(scale)
    {
      if(!arguments.length)
      {
        return valueAxis1Data.scale;
      }
      valueAxis1Data.scale = scale;
      return area;
    };

    area.categoryScale = function(scale)
    {
      if(!arguments.length)
      {
        return xScale;
      }
      xScale = scale;
      return area;

    };

    area.primaryDataRange = function(range){
      if (!arguments.length){
        return {
          min: valueAxis1Data.scale.domain()[0],
          max: valueAxis1Data.scale.domain()[1]
        };
      }
      if (range !== null) {
          valueAxis1Data.topValue = range.max;
          valueAxis1Data.bottomValue = range.min;
          if (range.from === 'axis') {
            valueAxis1Data.manualRange = true;
          }
          if(TypeUtils.isExist(width) && TypeUtils.isExist(height)) {
            calculateScale(valueAxis1Data);
          }
      }
      return area;
    };

    area.parent = function() { 
      return g;
    };

    /**
     * get/set size
     */
    area.size = function(w, h) {
      if (arguments.length === 0){
        return {
          width : area.width(),
          height : area.height()
        };
      }
      area.width(w).height(h);
      return area;
    };
    
    area.clear = function (gray) {
      deselectedAllHandler();
      if (gray === null || gray === undefined){
        lightAll();
      } else {
        grayAll();
      }
    };

    area.highlight = function (elements) {
      var elementArray;
      if (elements instanceof Array) {
        elementArray = elements;
      } else {
        elementArray = [];
        elementArray.push(elements);
      }

      for (var i=0; i<elementArray.length; i++)
      {
        var marker = elementArray[i];
        processOneAxisSelect(valueAxis1Data, marker );
      }
    };

    area.unhighlight = function (elements) {
      var elementArray;
      if (elements instanceof Array) {
        elementArray = elements;
      } else {
        elementArray = [];
        elementArray.push(elements);
      }
      
      for (var i=0; i<elementArray.length; i++)
      {
        var marker = elementArray[i];
        processOneAxisDeselect(valueAxis1Data, marker);
      }

    };
    
    area.hoverOnPoint = function(point)
    {  
      var point0 = point.x, point1 = point.y;
      if (props.orientation === "vertical" ){
        if(point0 < 0 || point0 > width){
          return;
        }
      } else {
        if(point1 < 0 || point1 > height){
          return;
        }
      }

      var xIndex = getCategoryIndex(props.orientation === "vertical" ? point0 : point1);
      if(preHighLightIndex === xIndex) { return; }
      var xCoord = xScale(xIndex) + xScale.rangeBand() / 2;
      changeGroupMarker(preHighLightIndex, "hidden", props.style.marker.stroke);
      changeGroupMarker(xIndex, "visible", bgColor);  

      preHighLightIndex = xIndex;


      if (props.hoverline.visible) {
        mouseMoveLine.attr( props.orientation === "vertical" ? "x1" : "y1", xCoord).attr(props.orientation === "vertical" ? "x2" : "y2", xCoord);
        mouseMoveLine.attr("visibility", "visible");
      } else {
        mouseMoveLine.attr("visibility", "hidden");
      }

      if (props.tooltip.enabled) {
        var pt = {};
        var matrix = g.node().getTransformToElement(g.node().ownerSVGElement);
        if(props.orientation === "vertical")
        {
          pt.x = xScale(xIndex) + xScale.rangeBand() / 2 + matrix.e;
          pt.y = height / 4 + matrix.f;
        } else {
          pt.x = width * 3 / 4 + matrix.e;
          pt.y = xCoord + matrix.f;
        }
        //var globalPoint = pt.matrixTransform(g.node().parentNode.parentNode.getScreenCTM().inverse());
        //var tData = generateTooltipData(xIndex);
        //alex su
        var tData = _tooltipDataHandler.generateTooltipData(data_, 
               tooltipData, 
               xIndex, 
               colorPalette, 
               [props.marker.shape]);
        tData.point = pt;
        tData.plotArea = {
          x : matrix.e,
          y : matrix.f,
          width : width,
          height : height
        };
        eDispatch.showTooltip(TooltipDataHandler.formatTooltipData(tData));
      }

    };

    area.blurOut = function()
    {  
      mouseMoveLine.attr("visibility", "hidden");
      changeGroupMarker(preHighLightIndex, "hidden", props.style.marker.stroke);
      preHighLightIndex = null;
      if (props.tooltip.enabled) { 
        eDispatch.hideTooltip();
      }
    };
    
    area.dataLabel = function(_){};
    
    props = manifest.props(null);
    return area;
  };
});