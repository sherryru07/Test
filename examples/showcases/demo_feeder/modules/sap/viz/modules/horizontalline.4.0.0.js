sap.riv.module(
{
  qname : 'sap.viz.modules.horizontalline',
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
function Setup(dispatch, MNDHandler, TypeUtils, Scaler, ColorSeries, BoundingBox, NumberUtils, langManager, DrawUtil, TooltipDataHandler, Manifest, Repository, Objects,UADetector,BoundUtil) 
{
  return function(manifest, ctx) 
  {
    var width, height;
    var data_ = null, props;
    var randomSuffix = Repository.newId();
    //alex su
    var tooltipData = null;
    var _tooltipDataHandler;

    var bgColor = "#FFFFFF";
    var hoverColor = "gray";
    var selectedColor = "#333333";
    var xScale = d3.scale.ordinal();
    var mouseMoveLine;
    var preHighLightIndex;
    var g;
    var svgMarkersGroup, svgLinesGroup, svgLightLinesGroup;
    var eDispatch = new dispatch('showTooltip', 'hideTooltip', 'initialized', 'startToInit');
    var hasMND;
    var bMNDOnColor;
    var bMNDInner;
    var effectManager = ctx.effectManager;
    var valueAxis1Data = {
        data: [],
        scale: d3.scale.linear(),
        colorPalette:null,
        selectedMarkers: null,
        markers:[],
        bottomValue: null,
        topValue:null,
        highLines:[]
    };

    var valueAxis2Data = {
        data: [],
        scale: d3.scale.linear(),
        colorPalette:null,
        selectedMarkers: null,
        markers:[],
        bottomValue: null,
        topValue:null,
        highLines:[]
    };
    var colorPalette = [];
    var PREFIXAXIS1 = 'axis1';
    var PREFIXAXIS2 = 'axis2';

    var bAnimationComplete = false;
    var enableDataLoadingAnimation = true;

    var selectedMarkerNum = 0;

    // clip defs for enimation

    var clipRect;    
    var OPACITY = 0.4;

    function horizontalline(selection) {
      BoundUtil.drawBound(selection, width, height);
      //selection.each(generate);
      
      //alex su
      _tooltipDataHandler = TooltipDataHandler();
      
      renderChart(selection);
      return horizontalline;
    }

   
    function calculateMinMax(axisValue)
    {
      var minMax = {
          min:null,
          max:null
      };
      if(!axisValue.data || axisValue.data.length === 0){
        return null;
      }
      minMax.max = Number(d3.max(axisValue.data, function(d){
        return d3.max(d, function(_){ return _.val;});
      }));
      minMax.min = Number(d3.min(axisValue.data, function(d){
        return d3.min(d, function(_){ return _.val;});
      }));
      if(NumberUtils.isNoValue(minMax.max )) {
        return null;
      }
      if(minMax.min >= 0)
      {
        minMax.min = 0;
        minMax.max += minMax.max * 5 / width ;
      }
      else if(minMax.max <= 0){
        minMax.max = 0;
        minMax.min +=  minMax.min * 5 / width;
      }else{
        var temp = (minMax.max - minMax.min) * 5 / width;
        minMax.min -= temp;
        minMax.max += temp;
      }
      
      return minMax;
    }

    function createColorPalette()
    {
      colorPalette = [];
      var i = 0, j = 0;
      if(valueAxis2Data.data && valueAxis2Data.data.length > 0){
        valueAxis1Data.colorPalette = props.primaryValuesColorPalette ;
      } else { 
        valueAxis1Data.colorPalette = props.colorPalette;
      }

      valueAxis2Data.colorPalette = props.secondaryValuesColorPalette;
      
      if (hasMND && bMNDOnColor && bMNDInner) {
        var dva1 = data_.getMeasureValuesGroupDataByIdx(0);
        var dva2 = data_.getMeasureValuesGroupDataByIdx(1);
        var mg1mNum=0, mg2mNum=0, mNum=0, colorAxisDataNum=0;
        if (dva1 && dva1.values.length>0) { 
          mg1mNum = dva1.values.length;
          colorAxisDataNum = dva1.values[0].rows.length;
        }
        if (dva2 && dva2.values.length>0) {
          mg2mNum = dva2.values.length;
          colorAxisDataNum = dva2.values[0].rows.length;
        }

        for (i=0; i<colorAxisDataNum; i++) {
          for (j=0; j<mg1mNum; j++) {
            colorPalette.push(valueAxis1Data.colorPalette[i*mg1mNum+j % valueAxis1Data.colorPalette.length]);
          }
          for (j=0; j<mg2mNum; j++){
            colorPalette.push(valueAxis2Data.colorPalette[i*mg2mNum+j % valueAxis2Data.colorPalette.length]);
          }
        }
      } else {
        for(i = 0; i < valueAxis1Data.data.length; ++i){
          colorPalette.push(valueAxis1Data.colorPalette[i % valueAxis1Data.colorPalette.length]);
        }
        if(valueAxis2Data.data && valueAxis2Data.data.length > 0)
        {
          for(i = 0; i < valueAxis2Data.data.length; ++i){
            colorPalette.push(valueAxis2Data.colorPalette[i % valueAxis2Data.colorPalette.length]);
          }
        }
      }
    }

    function calculateScale(axisValue)
    {
      if(axisValue.data && axisValue.data.length > 0 )
      {
        if( axisValue.topValue === null || axisValue.topValue === undefined)
        {
          var minMax = calculateMinMax(axisValue);
          if(!minMax || (minMax.min === 0 && minMax.max === 0)){
            axisValue.scale.domain([]).range ([]);
          } else {
            axisValue.scale.domain([minMax.min, minMax.max]).range ([0, width]);
          }
        }
        else{
          axisValue.scale.domain([axisValue.bottomValue, axisValue.topValue]).range ([0, width]);
        }
      }
      else{
        axisValue.scale.domain([0,0]).range([0,0]);
      }
      return axisValue.scale;
    }

    function computeScales()
    {
      var domain = [];
      var categoryNum = 0;
      if (valueAxis1Data.data.length !== 0) {
        categoryNum = valueAxis1Data.data[0].length;
      } else {
        categoryNum = valueAxis2Data.data[0].length;
      }
      for (var i=0; i < categoryNum; i++){
        domain.push(i);
      }
      xScale.domain(domain).rangeBands([height, 0]);
      calculateScale(valueAxis1Data);
      calculateScale(valueAxis2Data);
      if (valueAxis1Data.data && valueAxis1Data.data.length > 0 &&
            valueAxis2Data.data && valueAxis2Data.data.length > 0 ) {
        
        if(valueAxis1Data.scale.domain().length === 0 && valueAxis2Data.scale.domain().length === 0){
          valueAxis1Data.scale.domain([0, 1]).range ([0, width]); 
          valueAxis2Data.scale.domain([0, 1]).range ([0, width]); 
        } else if(valueAxis1Data.scale.domain().length === 0 && valueAxis2Data.scale.domain().length !== 0){
          valueAxis1Data.scale.domain(valueAxis2Data.scale.domain()).range(valueAxis2Data.scale.range());
        } else if(valueAxis1Data.scale.domain().length !== 0 && valueAxis2Data.scale.domain().length === 0){
          valueAxis2Data.scale.domain(valueAxis1Data.scale.domain()).range(valueAxis1Data.scale.range());
        }
        
        if (!valueAxis1Data.manualRange && !valueAxis2Data.manualRange) {
            Scaler.perfectDual(valueAxis1Data.scale, valueAxis2Data.scale);
        } else if (!valueAxis1Data.manualRange) {
            Scaler.perfect(valueAxis1Data.scale);
        } else if (!valueAxis2Data.manualRange) {
            Scaler.perfect(valueAxis2Data.scale);
        }
      } else if (valueAxis1Data.data && valueAxis1Data.data.length > 0 && !valueAxis1Data.manualRange) {
        if(valueAxis1Data.scale.domain().length === 0){
          valueAxis1Data.scale.domain([0, 1]).range ([0, width]);
        }
        Scaler.perfect(valueAxis1Data.scale);
      } else if (valueAxis2Data.data && valueAxis2Data.data.length > 0 && !valueAxis2Data.manualRange) {
        if(valueAxis2Data.scale.domain().length === 0){
          valueAxis2Data.scale.domain([0, 1]).range ([0, width]);
        }
        Scaler.perfect(valueAxis2Data.scale);
      }
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
          if(!props.marker.visible)
          {
            if(selectedMarkerNum > 0){
              d3.select(valueAxis1Data.markers[seriesIndex][groupIndex]).attr("opacity", OPACITY).attr("visibility", visible);
            }else{
              d3.select(valueAxis1Data.markers[seriesIndex][groupIndex]).attr("opacity", 1).attr("visibility", visible);
            }
          }
        }
      }  

      if(!valueAxis2Data.data) {return;}

      for(seriesIndex = 0; seriesIndex < valueAxis2Data.data.length; ++seriesIndex)
      {
        if(!valueAxis2Data.selectedMarkers[seriesIndex][groupIndex])
        {
          changeOneMarker(seriesIndex, groupIndex, borderColor, valueAxis2Data);
          if(!props.marker.visible)
          {
            if(selectedMarkerNum > 0){
              d3.select(valueAxis2Data.markers[seriesIndex][groupIndex]).attr("opacity", OPACITY).attr("visibility", visible);
            }else{
              d3.select(valueAxis2Data.markers[seriesIndex][groupIndex]).attr("opacity", 1).attr("visibility", visible);
            }
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
      if (valueAxis1Data.data.length !== 0) {
        categoryNum = valueAxis1Data.data[0].length;
      } else {
        categoryNum = valueAxis2Data.data[0].length;
      }      
      if(index > categoryNum - 1) { index = categoryNum - 1;}
      if(index < 0){ index = 0;}
      return categoryNum - 1 - index;
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
      valueAxis.selectedMarkers[yi][xi] = true;
    
      if(xi > 0 && valueAxis.selectedMarkers[yi][xi - 1]){
        valueAxis.highLines[yi][xi - 1].attr("visibility", "visible");
      }
      if(xi < valueAxis.highLines[0].length && valueAxis.selectedMarkers[yi][xi + 1]){
        valueAxis.highLines[yi][xi].attr("visibility", "visible");
      }
      
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
      
      d3.select(valueAxis.markers[yi][xi]).attr("opacity", OPACITY );
      if(!props.marker.visible && xi !== preHighLightIndex){
        d3.select(valueAxis.markers[yi][xi]).attr("visibility", "hidden");
      }
      valueAxis.selectedMarkers[yi][xi] = false;
  
      if(xi > 0 && valueAxis.selectedMarkers[yi][xi - 1]){
        valueAxis.highLines[yi][xi - 1].attr("visibility", "hidden");
      }
      if(xi < valueAxis.highLines[0].length && valueAxis.selectedMarkers[yi][xi + 1]){
        valueAxis.highLines[yi][xi].attr("visibility", "hidden");
      }
  
      --selectedMarkerNum;
    }

    
    function processNullValue(axisValue)
    {
      var result = {
          data:[],
          color:[]
      };
      var arr = [], obj, k;

      for(var i = 0; i < axisValue.length; ++i)
      {
        var preIndex = 0;
        for(var j = 0; j < axisValue[i].length; ++j)
        {
          if(NumberUtils.isNoValue(axisValue[i][j].val))
          {
            if(j > preIndex)
            {
              arr = [];
              for(k = preIndex; k < j; k++)
              {
                obj = axisValue[i][k];
                obj.x = k;  
                arr.push(obj);
              }
              result.data.push(arr);
              result.color.push(i);
            }
            preIndex = j + 1;
          }
        }
        
        if(preIndex < axisValue[i].length)
        {
          arr = [];
          for(k = preIndex; k <  axisValue[i].length; k++)
          {
            obj = axisValue[i][k];
            obj.x = k;
            arr.push(obj);
          }
          result.data.push(arr);
          result.color.push(i);
        }
      }
      return result;
    }
    
    function processOneAxis(axisValue, prefix)
    {
      if(!axisValue.data || axisValue.data.length === 0){
        return;
      }
      var axisGroup = svgLinesGroup.select("g." + prefix);
      if(axisGroup.empty())
      {
        axisGroup = svgLinesGroup.append("svg:g").attr("class", prefix);
      }
      axisValue.selectedMarkers = new Array(axisValue.data.length);
      axisValue.markers = [];
      var result = processNullValue(axisValue.data);
      
      var lines = axisGroup.selectAll("." + "lines").data(result.data);
      
      lines.enter().append("path").attr('class', "lines")
        .attr("stroke-width", props.width).attr("stroke-linejoin", "round");
      lines.exit().remove();
      lines.attr("stroke-width", props.width);//@Alex: add this line to update attributes.       
      var line = d3.svg.line().y(function(d,i) { return xScale(d.x) + xScale.rangeBand() / 2; }).x(function(d) {  return axisValue.scale(d.val); });
      lines.attr("transform", 
          function(d, i) {
            d3.select(this).attr("d", line(d))
            .attr("stroke",  function (){
                var para = { graphType:"line", 
                fillColor:axisValue.colorPalette[result.color[i] %  axisValue.colorPalette.length]};
                return effectManager.register(para);
                });
      });
      
      // draw highlight lines
      var lightLineGroup = svgLightLinesGroup.selectAll("g." + prefix);
      if(lightLineGroup.empty())
      {
        lightLineGroup = svgLightLinesGroup.append("svg:g").attr("class", prefix);
      }
      var groups = lightLineGroup.selectAll("g").data(axisValue.data);
      groups.enter().append("g");
      groups.exit().remove();
      axisValue.highLines = [];
      groups.attr("transform", function(d,i){
         d3.select(this).selectAll(".lightLine").remove();
        axisValue.highLines.push([]);
        for(var j = 1 ; j < d.length; ++j)
        {
          if(NumberUtils.isNoValue(d[j].val) || NumberUtils.isNoValue(d[j-1].val) ){
            axisValue.highLines[i].push(null); 
          } else {
            axisValue.highLines[i].push(d3.select(this).append("svg:line").attr("class", "lightLine").attr("x1", axisValue.scale(d[j-1].val)).
              attr("y1", xScale(j-1) + xScale.rangeBand() / 2).attr("x2",axisValue.scale(d[j].val)).attr("y2", xScale(j) + xScale.rangeBand() / 2)
              .attr("stroke-width", props.width).attr("stroke",  
                  axisValue.colorPalette[i %  axisValue.colorPalette.length]).attr("visibility", "hidden"));    
          }
        }
        
      });
      
      // draw markers
      for(var seriesIndex = 0; seriesIndex < axisValue.data.length; ++seriesIndex)
      {
        axisValue.selectedMarkers[seriesIndex] = [];
        for(var dataIndex = 0; dataIndex < axisValue.data[0].length; ++dataIndex)
        {
          axisValue.selectedMarkers[seriesIndex][dataIndex] = false;
        }
      }
      var markerGroup = svgMarkersGroup.select("g." + prefix);
      if(markerGroup.empty()){
        markerGroup = svgMarkersGroup.append("svg:g").attr("class", prefix);
      }
      groups = markerGroup.selectAll("g.marker").data(axisValue.data);
      groups.enter().append("svg:g").attr("class", "marker");
      groups.exit().remove();
      
      var visible = "hidden";
      if(props && props.marker && props.marker.visible){
        visible  = "visible";
      }
      groups.attr("transform", function(d, i) {
        
        var seriesMarkers = d3.select(this).selectAll(".datashape").data(d);
        var datashape = seriesMarkers.enter().append('g').attr('class','datashape');
        
        DrawUtil.createElements(datashape,{shape: props.marker.shape, className: "datapoint"} );
        seriesMarkers.exit().remove();
        var markerArr = [];
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
              drawingEffect: props.drawingEffect,
              graphType: props.marker.shape,
              fillColor: axisValue.colorPalette[i % axisValue.colorPalette.length],
              direction :'vertical',
              rx: props.marker.size / 2,
              ry: props.marker.size / 2,
              borderWidth: 2,
              borderColor: props.style.marker.stroke,
              node:d3.select(this).select('path'),
              visibility: visible
          };
          DrawUtil.drawGraph(parameter, effectManager);
          return "translate(" + axisValue.scale(point.val)+ "," + (xScale(index) + xScale.rangeBand() / 2)  + ")"; 
        });

        axisValue.markers.push(markerArr);
      });
    }

    function processOneAxisDeselectAll(valueAxis,  xIndex)
    {
      if(selectedMarkerNum === 0 || !valueAxis.selectedMarkers || valueAxis.selectedMarkers.length === 0){
        return;
      }
      
      for(var seriesIndex = 0; seriesIndex < valueAxis.selectedMarkers.length; ++seriesIndex)
      {
        for(var groupIndex = 0; groupIndex < valueAxis.selectedMarkers[0].length; ++groupIndex)
        {
          if(!valueAxis.selectedMarkers[seriesIndex][groupIndex]) {continue;}
          
          if(groupIndex === xIndex)
          {
            changeOneMarker(seriesIndex, groupIndex, bgColor, valueAxis);
            if(!props.marker.visible){
              d3.select(valueAxis.markers[seriesIndex][groupIndex]).attr("opacity", OPACITY ).attr("visibility", "visible");
            }
          }
          else
          {
            changeOneMarker(seriesIndex, groupIndex, props.style.marker.stroke, valueAxis);
            if(!props.marker.visible){
              d3.select(valueAxis.markers[seriesIndex][groupIndex]).attr("visibility", "hidden");
            }
          }
          valueAxis.selectedMarkers[seriesIndex][groupIndex] = false;
        }
      }
    }

    function deselectedAllHandler()
    {
      var ypoint =  (d3.event ? d3.event.clientY : 0) - g.node().getBoundingClientRect().top ;
      var xIndex = getCategoryIndex(ypoint);
      processOneAxisDeselectAll(valueAxis1Data, xIndex);
      processOneAxisDeselectAll(valueAxis2Data, xIndex);
      selectedMarkerNum = 0;
    }

    
    
    function renderChart(selection)
    {
      getCSSStyle();
      eDispatch.startToInit();
      if(!g) {
        g = selection.append("svg:g");  
      }

      if(!mouseMoveLine){
        mouseMoveLine = g.append("svg:line");
      }

      mouseMoveLine.attr("x1", 0).attr("y1", 0).attr("x2", width).attr("y2", 0)
      .attr("stroke-width", 1).attr("stroke", hoverColor)
      .attr("visibility", "hidden").attr("stroke-linejoin", "round");
      if(!svgLinesGroup)
      {
        svgLinesGroup = g.append("svg:g").attr("class", "datalines");
        svgLightLinesGroup = g.append("svg:g").attr("class", "lightLines");
        svgMarkersGroup = g.append("svg:g").attr("class", "markers datashapesgroup");
      }
      if(!clipRect){
        clipRect = g.append("svg:defs").append("svg:clipPath").attr("id", "clip1_" + randomSuffix).append("rect");
      }
      
      clipRect.attr("x", 0).attr("y", (enableDataLoadingAnimation ? height : 0)).attr("height", (enableDataLoadingAnimation ? 0 : height)).attr("width", width);
      selectedMarkerNum = 0;
      lightAll();
      svgMarkersGroup.attr("clip-path", "url(#clip1_" + randomSuffix + ")").attr("fill", "none");
      svgLinesGroup.attr("clip-path", "url(#clip1_" + randomSuffix + ")").attr("fill", "none");
      svgLightLinesGroup.attr("clip-path", "url(#clip1_" + randomSuffix + ")").attr("fill", "none");

      if(enableDataLoadingAnimation)
      {
        bAnimationComplete = true;

        var totalNumber = 0;
        var interval = height / 50;
        var func = setInterval(function(d){
          if(totalNumber >= height)
          {
            clearInterval(func);
            eDispatch.initialized();
          }
          else
          {
            totalNumber += interval;
            clipRect.attr("height", totalNumber);
            clipRect.attr("y", height - totalNumber);
          }
        },
        20);
      }else{
        eDispatch.initialized();
      }
      processOneAxis(valueAxis1Data, PREFIXAXIS1);
      processOneAxis(valueAxis2Data, PREFIXAXIS2);

    }

    function lightAll() {
      svgLightLinesGroup.selectAll("g." +  PREFIXAXIS1).selectAll(".lightLine").attr("visibility", "hidden");
      svgLightLinesGroup.selectAll("g." +  PREFIXAXIS2).selectAll(".lightLine").attr("visibility", "hidden");
      svgLinesGroup.attr("opacity", 1);
      if(UADetector.isIE()){
        svgLinesGroup.selectAll(".lines").attr("visibility", "visible");
      }
      svgMarkersGroup.selectAll("g." +  PREFIXAXIS1).selectAll("g.marker").selectAll(".datapoint").attr("opacity", 1);
      svgMarkersGroup.selectAll("g." +  PREFIXAXIS2).selectAll("g.marker").selectAll(".datapoint").attr("opacity", 1);
    }

    function grayAll() {
      svgLightLinesGroup.selectAll("g." +  PREFIXAXIS1).selectAll(".lightLine").attr("visibility", "hidden");
      svgLightLinesGroup.selectAll("g." +  PREFIXAXIS2).selectAll(".lightLine").attr("visibility", "hidden");
      svgLinesGroup.attr("opacity", OPACITY);
      if(UADetector.isIE()){
        svgLinesGroup.selectAll(".lines").attr("visibility", "visible");
      }
      svgMarkersGroup.selectAll("g." +  PREFIXAXIS1).selectAll("g.marker").selectAll(".datapoint").attr("opacity", OPACITY);
      svgMarkersGroup.selectAll("g." +  PREFIXAXIS2).selectAll("g.marker").selectAll(".datapoint").attr("opacity", OPACITY);
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
      
      if (!props.style.marker)
      {
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
    
    horizontalline.afterUIComponentAppear = function(){
      eDispatch.initialized(); 
    };
    
    horizontalline.width = function(value) {
      if (!arguments.length){
        return width;
      }
      width = value;
      if(TypeUtils.isExist(width) && TypeUtils.isExist(height)&& TypeUtils.isExist(data_)){
        computeScales();
      }
      return horizontalline;
    };

    horizontalline.height = function(value) {
      if (!arguments.length){
        return height;
      }
      height = value;
      if(TypeUtils.isExist(width) && TypeUtils.isExist(height)&& TypeUtils.isExist(data_)){
        computeScales();
      }
      return horizontalline;
    };
    
    /*;
     * get/set properties
     */
    horizontalline.properties = function(_) {
      if (!arguments.length){
        return props;
      }
        
      Objects.extend(true, props, _);
      if(props.marker.size < 4 || props.marker.size > 32) { props.marker.size = 6;}
      if(props.width < 1 || props.width > 7) {props.width = 2;}
      enableDataLoadingAnimation =  props.animation.dataLoading;
      
      getCSSStyle();
      
      createColorPalette();
      return horizontalline;
    };
    
    horizontalline.primaryAxisColor = function(){
        if(valueAxis2Data.data && valueAxis2Data.data.length > 0){
          return effectManager.register({graphType:"line", fillColor: valueAxis1Data.colorPalette[0]});
        }else{
          return null;
        }
      };
        
      horizontalline.secondAxisColor = function(){
        return effectManager.register({graphType:"line", fillColor:  valueAxis2Data.colorPalette[0]});
      };     
    /**
     * get/set your event dispatch if you support event
     */
    horizontalline.dispatch = function(_){
      if(!arguments.length){
        return eDispatch;
      }
      eDispatch = _;
      return horizontalline;
    };
          
    /**
     * set/get data, for some modules like Title, it doesn't need data
     */
    horizontalline.data = function(value){
      if (!arguments.length){
        return data_;
      }
      data_ = value;
      var obj = MNDHandler(data_);
      valueAxis1Data.data = obj["MG1"];
      valueAxis2Data.data = obj["MG2"];

      hasMND = obj["hasMND"];
      bMNDOnColor = obj["MNDOnColor"];
      bMNDInner = obj["MNDInner"];
      //alex su
      tooltipData = TooltipDataHandler.dataTransform(obj);
      if(TypeUtils.isExist(width) && TypeUtils.isExist(height)&& TypeUtils.isExist(data_)){
        computeScales();
      }
      createColorPalette();
      return horizontalline;        
    };

    horizontalline.primaryAxisTitle = function(_){
        if(!arguments.length){
          var titles =  data_.getMeasureValuesGroupDataByIdx(0), title = [];
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
      
      horizontalline.secondAxisTitle = function(_){
        if(!arguments.length){
          var titles =  data_.getMeasureValuesGroupDataByIdx(1), title = [];
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
     * get color palette
     */
    horizontalline.getColorPalette = function() {
      if(colorPalette.length === 0)
      {
        createColorPalette();
      }
      return colorPalette;
    };


    horizontalline.shapePalette = function(_){
      if(!arguments.length){
        return [props.marker.shape];
      }
      return horizontalline;
    };


    horizontalline.primaryScale = function(scale)
    {
      if(!arguments.length)
      {
        return valueAxis1Data.scale;
      }
      valueAxis1Data.scale = scale;
      return horizontalline;
    };

    horizontalline.secondaryScale = function(scale)
    {
      if(!arguments.length)
      {
        return valueAxis2Data.scale;
      }
      valueAxis2Data.scale = scale;
      return horizontalline;
    };

    horizontalline.categoryScale = function(scale)
    {
      if(!arguments.length)
      {
        return xScale;
      }
      xScale = scale;
      return horizontalline;

    };

    horizontalline.primaryDataRange = function(range){
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
          if(TypeUtils.isExist(width) && TypeUtils.isExist(height)){
            calculateScale(valueAxis1Data);
          }
      }
      return horizontalline;
    };

    horizontalline.secondDataRange = function(range){
      if (!arguments.length){
        return {
          min: valueAxis2Data.scale.domain()[0],
          max: valueAxis2Data.scale.domain()[1]
        };
      }
      if (range !== null) {
          valueAxis2Data.topValue = range.max;
          valueAxis2Data.bottomValue = range.min;
          if (range.from === 'axis') {
            valueAxis2Data.manualRange = true;
          }
          if(TypeUtils.isExist(width) && TypeUtils.isExist(height)){
            calculateScale(valueAxis2Data);
          }
      }
      return horizontalline;
    };
    
    horizontalline.parent = function() { 
      return g;
    };
    
    horizontalline.dataLabel = function(_){
     
    }
    /**
     * get/set size
     */
    horizontalline.size = function(w, h) {
      if (arguments.length === 0){
        return {
          width : horizontalline.width(),
          height : horizontalline.height()
        };
      }
      horizontalline.width(w).height(h);
      return horizontalline;
    };
    
    horizontalline.clear = function (gray) {
      deselectedAllHandler();
      if (gray === null || gray === undefined){
        lightAll();
      } else {
        grayAll();
      }
    };

    horizontalline.highlight = function (elements) {
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
        if(!processOneAxisSelect(valueAxis1Data, marker )){
          processOneAxisSelect(valueAxis2Data, marker );
        }
      }
    };
    
    horizontalline.unhighlight = function (elements) {
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

        if(!processOneAxisDeselect(valueAxis1Data, marker)){
          processOneAxisDeselect(valueAxis2Data, marker);
        }
      }
    };
    horizontalline.hoverOnPoint = function(point)
    {  
      var point0 = point.x, point1 = point.y;
      if(point1 < 0 || point1 > height){
        return;
      }

      var xIndex = getCategoryIndex(point1);
      if(preHighLightIndex === xIndex) { return; }
      var yCoord = xScale(xIndex) + xScale.rangeBand() / 2;
      changeGroupMarker(preHighLightIndex, "hidden", props.style.marker.stroke);
      changeGroupMarker(xIndex, "visible", bgColor);  

      preHighLightIndex = xIndex;
      if (props.hoverline.visible) {
        mouseMoveLine.attr("y1", yCoord).attr("y2", yCoord);
        mouseMoveLine.attr("visibility", "visible");
      } else {
        mouseMoveLine.attr("visibility", "hidden");
      }
      if (props.tooltip.enabled) {
        var pt = {};
        var matrix = g.node().getTransformToElement(g.node().ownerSVGElement);
        pt.x = width * 3 / 4 + matrix.e;
        pt.y = yCoord + matrix.f;
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
    
    horizontalline.blurOut = function()
    {  
      mouseMoveLine.attr("visibility", "hidden");
      changeGroupMarker(preHighLightIndex, "hidden", props.style.marker.stroke);
      preHighLightIndex = null;
      if (props.tooltip.enabled) { 
        eDispatch.hideTooltip();
      }
    };
    
    props = manifest.props(null);
    return horizontalline;
  };
});