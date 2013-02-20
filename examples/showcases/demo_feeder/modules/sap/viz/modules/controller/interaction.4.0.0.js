sap.riv.module(
{
  qname : 'sap.viz.modules.controller.interaction',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.util.TextUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.dispatch',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.controller.lasso',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
}
],
function Setup(TextUtils, dispatch, lassoHelp, TypeUtils,Constants, Objects) {
  return function(manifest){
    
    var g = null, m, lastSelected = [], selectionMode = 'multiple', plots = [], subeventLayers = [], props = manifest.props(null), lasso = lassoHelp(), supportedEventNames = []; 
    var supportLassoEvent = true, lastHovered = [], eventLayer = null, lastOvered = [];
    var eDispatch = new dispatch('selectData', 'deselectData', 'deselectLegend');
    var mouseEventHandler = {
        'mouseup' :  null,
        'mousemove' : null,
        'mouseout' : null,
        'mouseover' : null,
        'touchstart' : null
    }, isRegister = false, defaultSupportedEventNames = ['mouseup', 'mousemove', 'mouseout', 'mouseover','touchstart'],
      mousedownPos = null,
      preserveSelectionWhenDragging = false;
    
    var enableMouseMove = true, enableMouseOver = true, enableMouseOut = true, holdSelection = false;
    
    var reset = function(){
      isRegister = false;
      plots = [];
      lastSelected.splice(0, lastSelected.length);
      lastHovered.splice(0, lastHovered.length);
      lastOvered.splice(0, lastOvered.length);
      for(var i =0, len = subeventLayers.length; i<len;i++){
        subeventLayers[i].remove();
      }
      subeventLayers = [];
    };
    
    var selection = function(){
      
      lasso.dispatch(eDispatch).selected(lastSelected).lastOvered(lastOvered).lastHovered(lastHovered).unhighlightTarget(unhighlightTarget);
      
      return selection;
    };
    
    var clearPlots  = function(_){
      for(var i = 0; i< plots.length; i++){
        if(plots[i].clear){
          plots[i].clear(_);
        }
      }
    };

    var pointInPlot = function(t, plot){
      var p = plot.parent()[0][0].getBoundingClientRect();
      return (t.x >= p.left && t.x <= p.left + p.width && t.y >= p.top && t.y <= p.top + p.height);
    };

    // returns an array of the plot's parent nodes, in the same order as the "plots" array
    var getPlotNodes = function() {
      var nodes = [];
      for (var i = 0, len = plots.length; i < len; i++) {
        if (plots[i].parent()) {
          nodes.push(plots[i].parent().node());
        }
      }
      return nodes;
    };

    // returns the index of the plot (in the "plots" array) that contains the target element
    // nodes is optional and should contain the container elements for the plots
    var plotIndexContainingTarget = function(target, nodes) {
      var n = target,
        plotNodes = nodes || getPlotNodes(),
        idx;

      for (; n && n.ownerSVGElement; n = n.parentNode) {
        idx = plotNodes.indexOf(n);
        if (idx !== -1) {
          return idx;
        }
      }

      return -1;
    };

    // returns the plot module object that contains the target element
    var plotContainingTarget = function(target, nodes) {
      var plotIdx = plotIndexContainingTarget(target, nodes);

      if (plotIdx !== -1) {
        return plots[plotIdx];
      }

      return null;
    };

    // returns the input targets, organized by their parent plot
    // the result object is an array, with each entry corresponding to a plot in the "plot" array
    // each entry is an array of targets
    var groupTargetsByPlot = function(targets) {
      var plotNodes = getPlotNodes(),
          results = [];

      for (var i = 0, len = plots.length; i < len; i++) {
        results.push([]);
      }

      for (var i = 0, len = targets.length; i < len; i++) {
        var target = targets[i],
          idx = plotIndexContainingTarget(target, plotNodes),
          plotTargets;

        if (idx !== -1) {
          plotTargets = results[idx];
          plotTargets.push(target);
        }
        else {
          // log/throw error?
        }
      }

      return results;
    };

    var highlightTarget = function(target) {
      var plot = plotContainingTarget(target);
      if (plot && plot.highlight) {
        plot.highlight(target, selectionMode);
      }
    };
    
    // CTIsDatapoint means the current target is datapoint shape or not
    // target can be an array or a single element
    var unhighlightTarget = function(target, CTIsDatapoint) {
      var targets = TypeUtils.isArray(target) ? target : [ target ],
          targetsGroupedByPlot = groupTargetsByPlot(targets);

      for (var i = plots.length - 1; i >= 0; i--) {
        var plot = plots[i],
            plotTargets = targetsGroupedByPlot[i];

        if (plotTargets && plotTargets.length > 0 && plot.unhighlight) {
          plot.unhighlight(plotTargets, CTIsDatapoint);
        }
      }
    };
    
    selection.registerEvent = function(){
      //TODO, [Ian] register event function will be called more than once as in multi chart, modules will fire more than one complete animation event.
      if(isRegister == false){
        isRegister = true;
        
        
        var temp = m.modules();
        for(var i in temp){
          if(temp.hasOwnProperty(i) && !(temp[i] instanceof Array) && temp[i].parent()){
            var height, width;
            if (temp[i].getPreferredSize && temp[i].getPreferredSize()){
              height = temp[i].getPreferredSize().height;
              width = temp[i].getPreferredSize().width;
            } else {
              height = temp[i].height();
              width = temp[i].width();
            }
            var subeventLayer = temp[i].parent().insert('rect', 'g').attr('width', width).attr('height', height).attr('opacity', '0').attr('class', 'viz-event-sub-layer');
            subeventLayers.push(subeventLayer);

            plots.push(temp[i]);
          }
        }
        
        if(!eventLayer){
          eventLayer = g.insert("rect", "g").attr("x", 0).attr("y", 0).attr("fill-opacity", 0);
          lasso.eventLayer(eventLayer);
        }
        eventLayer.attr("width", m.width()).attr("height", m.height());
        if(supportedEventNames != null && supportedEventNames instanceof Array){
          for(var i=0, len = supportedEventNames.length; i< len; i++){
            if(mouseEventHandler[supportedEventNames[i]]){
              g.on(supportedEventNames[i] + '.interaction', mouseEventHandler[supportedEventNames[i]]);
            }
          }
        }
        
        if(supportLassoEvent == true){
          lasso.registerEvent();
        }
        if (preserveSelectionWhenDragging === true) {
          g.on('mousedown.preserveSelectionWhenDragging', function() {
              mousedownPos = d3.mouse(g.node());
            }, true);
        }
      }else{
        eventLayer.attr('width', m.width()).attr('height', m.height());
        lasso.eventLayer(eventLayer);
        
        //reset the size of subevent layer
        for(var i=0, len= subeventLayers.length; i<len; i++){
          subeventLayers[i].attr('width', plots[i].width()).attr('height', plots[i].height());
        }
        
        for(var i=0, len =lastHovered.length; i<len; i++){
          if(lastHovered[i].blurOut){
            lastHovered[i].blurOut();
          }
        }
        lastHovered.splice(0, lastHovered.length);
        
        for(var i=0, len =lastOvered.length; i< len; i++){
          if(lastOvered[i].plot.mouseout){
            lastOvered[i].plot.mouseout();
          }
        }
        lastOvered.splice(0, lastOvered.length);
        
        if(holdSelection == false){
          lastSelected.splice(0, lastSelected.length);
        }
      }
      
    };
    
    //[2012/09/11 Christy] Get selection mode for legend.
    selection.getSelectionMode = function(){
      return selectionMode;
    };
    
    //[2012/09/10 Christy] Legend is selected.  
    selection.highlightedByLegend = function(selectedData, isSelected){
      if(selectionMode === 'single' || selectionMode === 'none'){
        //Doesn't work in single mode.
        return;
      }
      var datapoints = [], itemData, isSame = true, ctxDatapoints = [], isDeselected = true, selectedObjs = [], selectDatas = [], deselectDatas = [], selectDatapoints = [], deselectDatapoints = [];
      for(var i = 0, len = plots.length; i < len; i++){
        //Reset datapoints arrary which contains selectedData ctx.
        ctxDatapoints = [];
        
        if(selectedData.ctx.ranges){
          //MBC legend
          if(plots[i].getDatapointsByRange){
            ctxDatapoints = plots[i].getDatapointsByRange(selectedData);
            selectedObjs.push({
              plot: plots[i],
              ctxDatapoints : ctxDatapoints
            });
          }
        } else { 
          if (plots[i].getDatapointsByLegend) {
            ctxDatapoints = plots[i].getDatapointsByLegend(selectedData);
            selectedObjs.push({
              plot: plots[i],
              ctxDatapoints : ctxDatapoints
            });
          } else {
            datapoints = plots[i].parent().selectAll('.datapoint')[0];
            
            for(var j = 0, jLen = datapoints.length; j < jLen; j++){
              if(datapoints[j].__data__ && datapoints[j].__data__.ctx){
                if(datapoints[j].__data__.ctx.path) {
                  itemData = datapoints[j].__data__.ctx.path;
                }else{
                  //Multi measures. For bubble or tagcloud.
                  itemData = datapoints[j].__data__.ctx[0].path;
                }
                
                //Check selectedData contains this ctx.
                isSame = true;
                for(var k in itemData){
                  if(selectedData.ctx.path[k] != undefined){
                    if(selectedData.ctx.path[k].length > 0){
                      if(_contains(selectedData.ctx.path[k], itemData[k]) === false){
                        isSame = false;
                      }
                    }else{
                      if(selectedData.ctx.path[k] !== itemData[k]){
                        isSame = false;
                      }
                    }
                  }
                }
                if(isSame === true){
                  //Push datapoint which has the same ctx with selectedData.
                  ctxDatapoints.push(datapoints[j]);
                }
              }
            }
          
            if(datapoints.length > 0){
              selectedObjs.push({
                plot: plots[i],
                ctxDatapoints : ctxDatapoints
              });
            }
          }
        }
      }

      //Deselected this series datapoint or not.
      if(lastSelected.length === 0){
        isDeselected = false;
      } else {
        var numOfDataPoints = 0;
        
        for(var i = 0, len = selectedObjs.length; i < len; i++){
          ctxDatapoints = selectedObjs[i].ctxDatapoints;
          var kLen = ctxDatapoints.length;
          numOfDataPoints += kLen;
          for(var k= 0; k < kLen; k++){
            if(_contains(lastSelected, ctxDatapoints[k]) === false){
              //One ctxDatapoint is not selected. Highlight this series datapoints.
              isDeselected = false;
              break;
            }
          }
        }
        if (isDeselected && !numOfDataPoints) {
          isDeselected = false;
        }
      }
      
      for(var i = 0, len = selectedObjs.length; i < len; i++){
        ctxDatapoints = selectedObjs[i].ctxDatapoints;  
        selectDatapoints = [], deselectDatapoints = [];
        for(var k= 0, kLen = ctxDatapoints.length; k < kLen; k++){
          var index = _contains(lastSelected, ctxDatapoints[k]);
          if(isDeselected){
            //deselected
            deselectDatapoints.push(ctxDatapoints[k]);
            lastSelected.splice(index, 1);
            deselectDatas.push(ctxDatapoints[k]);
          }else{
            //selected
            if(lastSelected.length == 0){
              clearPlots(true);
            }
            selectDatapoints.push(ctxDatapoints[k]);
            selectDatas.push(ctxDatapoints[k]);
            if(index === false){
              lastSelected.push(ctxDatapoints[k]);
            }
          }
        }
        
        //update highlight and unhighlight effect.
        if(deselectDatapoints.length > 0){
          selectedObjs[i].plot.unhighlight(deselectDatapoints, false, selectionMode);
        }
        if(selectDatapoints.length > 0){
          selectedObjs[i].plot.highlight(selectDatapoints, false, selectionMode);
        }
        
        if(isDeselected){
          //remove legend selected effect.
          eDispatch.deselectLegend(selectedData);
        }
        if(lastSelected.length === 0){
          clearPlots();
        }
      }
      
      //Send select/deselect event
      if(selectDatas.length > 0){
          fireSelectDataEvent(selectDatas);
        }
        
        if(deselectDatas.length > 0){
          fireDeselectDataEvent(deselectDatas);
        }
        
      return isDeselected;
    };
    
    //[2012/09/10 Christy] utility method.
    var _contains = function(a, obj){
      for (var i = 0; i < a.length; i++) {
            if (a[i] === obj) {
                return i;
            }
        }
        return false;
    };
    
    selection.dispatch = function(_){
      if(!arguments.length){
        return eDispatch;
      }
      eDispatch = _;
      return selection;
    };
    
    mouseEventHandler['mousemove'] = function(){
      if(lasso.isLasso() || enableMouseMove == false){
        return;
      }
      var cp = {
          x: d3.event.clientX,
          y: d3.event.clientY
      };
      var hoveredplots = [];
      for(var i =0, len = plots.length; i< len; i++){
        if(plots[i].parent() && pointInPlot(cp, plots[i])){
          hoveredplots.push(plots[i]);
        }
      }
      
      var isHovered = false;
      for(var i =0, len= lastHovered.length; i< len; i++){
        for(var j=0, jlen = hoveredplots.length; j< jlen; j++){
          if(lastHovered[i] == hoveredplots[j]){
            isHovered = true;
            break;
          }
        }
        if(isHovered == false && lastHovered[i].blurOut){
          lastHovered[i].blurOut();
        }
        isHovered = false;
      }
      
      for(var i=0, len= hoveredplots.length; i < len; i++){
        if(hoveredplots[i].hoverOnPoint){
            var cb = hoveredplots[i].parent().node().getBoundingClientRect();
             
             hoveredplots[i].hoverOnPoint({
               x : cp.x - cb.left,
               y : cp.y - cb.top
             });
        }
      }
      
      lastHovered.splice(0, lastHovered.length);
      for(var i=0, len = hoveredplots.length; i<len;i++){
        lastHovered.push(hoveredplots[i]);
      }
    };
    
    mouseEventHandler['mouseover'] = function(){
      if(lasso.isLasso() || enableMouseOver == false){
        return;
      }
      
       var target = d3.event.target, classname = target.getAttribute('class');
       if(classname != null && classname.indexOf('datalabel') != -1){
         target = target.__data__.dataShape;
       }else {
         target = isDatapoint(target);
         classname = target.getAttribute('class');
       }
       
       if(classname != null && (classname.indexOf('datapoint') != -1 || classname.indexOf('datalabel') != -1) ){
         
         var isHighlighted = false;
         for(var i=0, len = lastSelected.length; i < len; i++){
           if(target === lastSelected[i]){
             isHighlighted = true;
             break;
           }
         }
        
         if(lastSelected.length == 0 ){
          isHighlighted = true;
        }

        var plot = plotContainingTarget(target);
        if (plot) {
          lastOvered.push({
               plot: plot,
               target: target
            });

          if(plot.mouseover){
            plot.mouseover(target, isHighlighted);
          }
        }
       }
       
    };
    
    mouseEventHandler['mouseout'] = function(){
      if(lasso.isLasso() || enableMouseOut == false){
        return;
      }
      
       var target = d3.event.target, classname = target.getAttribute('class');
       if(classname != null && classname.indexOf('datalabel') != -1){
         target = target.__data__.dataShape;
       }else {
         target = isDatapoint(target);
         classname = target.getAttribute('class');
       }
 
       if(classname != null && (classname.indexOf('datapoint') != -1 || classname.indexOf('datalabel') != -1) ){
         
         var isHighlighted = false;
         for(var i=0, len = lastSelected.length; i < len; i++){
           if(target === lastSelected[i]){
             isHighlighted = true;
             break;
           }
         }
         
        if(lastSelected.length == 0 ){
          isHighlighted = true;
        }
         
        var plot = plotContainingTarget(target);

        for (var i = 0, len = lastOvered.length; i < len; i++) {
          var lastOver = lastOvered[i];

          // FIXME always invoke mouseout event handler on plot?
          if (lastOver.target === target/* && lastOver.plot === plot*/) {
            lastOvered.splice(i, 1);
            if (plot.mouseout) {
              plot.mouseout(target, isHighlighted);
            }
            break;
          }
        }
       }
    };
    
    var isDatapoint = function(node){
      if(node === g.node()){
        return node;
      }else{
        var classname = node.getAttribute('class');
        if(classname != null && classname.indexOf('datapoint') != -1){
          return node;
        }else{
          return isDatapoint(node.parentNode);
        }
      }
      
    };
    mouseEventHandler['mouseup'] = function(){
      if (preserveSelectionWhenDragging && mousedownPos) {
        var pos = d3.mouse(g.node());

        // cheap mechanism to cancel the 'mouseup' event handler when dragging the mouse
        // for example, when panning the geocharts
        if (Math.abs(pos[0] - mousedownPos[0]) > 5 ||
            Math.abs(pos[1] - mousedownPos[1]) > 5) {
          return;
        }
      }
      if(selectionMode !== 'none'){
          
          var target = d3.event.target,  classname = target.getAttribute('class'), selectDatas = [], deselectDatas = [];
          
          if( classname != null && classname.indexOf('datalabel') != -1){
            target = target.__data__.dataShape;
          }else {
            target = isDatapoint(target);
            classname = target.getAttribute('class');
          }
          
          //if  the click is on eventLayer, deselect all
          if( classname == null || (classname.indexOf('datapoint') == -1 && classname.indexOf('datalabel') == -1) ){
            
            unhighlightTarget(lastSelected, false);

            clearPlots();
            deselectDatas = deselectDatas.concat(lastSelected);
            lastSelected.splice(0, lastSelected.length);
            
            //[2012/09/11 Christy] deselect all legend items.
            eDispatch.deselectLegend();
          }else{
            var isHighlighted = false;
            for(var i =0, len = lastSelected.length; i<len; i++){
              if(target == lastSelected[i]){
                isHighlighted = true;
                break;
              }
            }
            if(lastSelected.length == 0){ //it means the isHighlighted false
              
              clearPlots(true);
              highlightTarget(target);
              lastSelected.push(target);
              
              selectDatas.push(target);
            }else{
              if(isHighlighted){
                if(selectionMode == 'single'){
                  unhighlightTarget(lastSelected[0]);
                  
                  clearPlots();
                  lastSelected.splice(0, lastSelected.length);
                  
                  deselectDatas.push(target);
                }else{
                  var changeSelected = lastSelected.splice((i),1);
                  deselectDatas = deselectDatas.concat(changeSelected);
                  
                  if(lastSelected.length == 0){
                    unhighlightTarget(target);
                    clearPlots();
                  }else{
                    unhighlightTarget(target);
                    deselectDatas.push(target);
                  }
                }
              }else{
                if(selectionMode == 'single'){
                  unhighlightTarget(lastSelected[0]);
                  deselectDatas.push(lastSelected[0]);
                  
                  highlightTarget(target);
                  selectDatas.push(target);
                  
                  lastSelected[0] = target;
                }else{
                  
                  selectDatas.push(target);
                  highlightTarget(target);
                  
                  lastSelected.push(target);
                }
              }
            }
          }
          
          if(selectDatas.length > 0){
            fireSelectDataEvent(selectDatas);
          }
          
          if(deselectDatas.length > 0){
            fireDeselectDataEvent(deselectDatas);
          }
          
        }
    };
    
    mouseEventHandler['touchstart'] = mouseEventHandler['mouseup'];
    
    function fireSelectDataEvent(selectedShapes){
      var selectData = [];
      for(var i=0, len= selectedShapes.length; i < len; i++){
        var tarData = [], value = selectedShapes[i].__data__;
        if(value.val instanceof Array){
          for(var j=0, jlen= value.val.length; j< jlen; j++ ){
            tarData.push({
              val: value.val[j],
              ctx: value.ctx[j]
            });
          }
        }else{
          tarData.push({
            val: selectedShapes[i].__data__.val,
            ctx: selectedShapes[i].__data__.ctx
          });
        }
        selectData.push({
          target: selectedShapes[i],
          data: tarData
        });
      }
      
      eDispatch.selectData({
        name: Constants.Module.Event.SelectData.name,
        data: selectData
      });
    };
    
    function fireDeselectDataEvent(deselectShapes){
      var deselectData = [];
      for(var i=0, len= deselectShapes.length; i < len; i++){
        var tarData = [], value = deselectShapes[i].__data__;
        if(value.val instanceof Array){
          for(var j=0, jlen=value.val.length; j< jlen; j++ ){
            tarData.push({
              val: value.val[j],
              ctx: value.ctx[j]
            });
          }
        }else{
          tarData.push({
            val: deselectShapes[i].__data__.val,
            ctx: deselectShapes[i].__data__.ctx
          });
        }
        deselectData.push({
          target: deselectShapes[i],
          data: tarData
        });
      }
      
      eDispatch.deselectData({
        name: Constants.Module.Event.DeSelectData.name,
        data: deselectData
      });
    };
    
    function parseOptions(){
      selectionMode = props.selectability.mode;
      supportedEventNames = props.supportedEventNames;
      enableMouseMove = props.enableMouseMove;
      enableMouseOver = props.enableMouseOver;
      enableMouseOut = props.enableMouseOut;
      supportLassoEvent = props.supportLassoEvent;
      holdSelection = props.holdSelection;
      preserveSelectionWhenDragging = props.preserveSelectionWhenDragging;

    }
    selection.properties = function(_){
      if(!arguments.length){
        return props;
      }
      Objects.extend(true, props, _);
      lasso.properties(props);
      parseOptions();
    };
    
    selection.module = function(_){
      if(!arguments.length){
        return m;
      }
      reset();//clear flag to have another chance to register event
      m = _, g = m.parent();
      lasso.module(_);
      return selection;
    };
    return selection;
  };
});