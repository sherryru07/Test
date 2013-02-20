sap.riv.module(
{
  qname : 'sap.viz.modules.controller.lasso',
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
{  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.BoundingBox',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
}
],
function Setup(TextUtils, dispatch, ObjectUtils, TypeUtils, BoundingBox,Constants) {
  return function(){
    var eDispatch = null;
    var g, m, eventshape, props, domElement, modules, plots = [], lastSelected = [], selectionMode = 'multiple', lastLassoed = [];
    var startPos,  //point on client position
      lassoHelper, //a rect holder
      hitTestRect = {}, eFilter = '.datapoint', 
      isLassoStart = false,
      selectWithCtrlKey = false;
    
    var unhighlightTarget = null, lastOvered = [], eventLayer = null, lastHovered = [];
    
    var reset = function(){
      plots = [];
    };
    
    //selection is the contain of main
    var lasso = function(){
      return lasso;
    };
    
    lasso.lastOvered = function(_){
      if(!arguments.length){
        return lastOvered;
      }
      lastOvered = _;
      return lasso;
    };
    
    lasso.unhighlightTarget = function(_){
      if(!arguments.length){
        return unhighlightTarget;
      }
      unhighlightTarget = _;
      return lasso;
    };
    
    lasso.lastHovered = function(_){
      if(!arguments.length){
        return lastHovered;
      }
      lastHovered = _;
      return lasso;
    };
    
    lasso.eventLayer = function(_){
      if(!arguments.length){
        return eventLayer;
      }
      eventLayer = _;
      return lasso;
    };
    
    lasso.registerEvent = function(){
      var temp = m.modules();
      for(var i in temp){
        if(temp.hasOwnProperty(i) && !(temp[i] instanceof Array) && temp[i].parent()){
          plots.push(temp[i]);
        }
      }
      
      g.on('mousedown.lasso', lassoStart, true);
      g.on('mousemove.lasso', lassoMove, true);
      g.on('mouseup.lasso', lassoEnd, true);
      
      $(g.node()).mouseleave(mouseleaveHandler);
    };
    
    lasso.dispatch = function(_){
      if(!arguments.length){
        return eDispatch;
      }
      eDispatch = _;
      return lasso;
    };
    
    lasso.properties = function(_){
      if(!arguments.length){
        return props;
      }
      props = _;
      selectionMode = props.selectability && props.selectability.mode ? props.selectability.mode: 'multiple';
      selectWithCtrlKey = props.selectability && props.selectability.selectWithCtrlKey;
      return lasso;
    };
    
    lasso.isLasso = function(){
      return isLassoStart;
    };
    
    lasso.selected = function(_){
      if(!arguments.length){
        return lastSelected;
      }
      lastSelected = _;
      return lasso;
    };
    
    lasso.module = function(_){
      if(!arguments.length){
        return m;
      }
      reset();
      m = _, g = m.parent(), domElement = g.node();
      return lasso;
    };

    /*
     * alternative to mouse
     * reason: the result is incorrect in chrome/ie9 when browser zoom != 1
     */
    var mouse = function() {
      var e = d3.event,
          // geo needs to use eventLayer due to the fact that domElement will a bounding rect
          // that is greater than the viewport
          node = !eventLayer.empty() ? eventLayer.node() : domElement, 
          rect = node.getBoundingClientRect(),
          x = e.clientX - rect.left,
          y = e.clientY - rect.top;

      return [ x, y ];
    };

    // return a bounding box for the provided node
    var getBoundingBox = function(node) {
      var rect = node.getBoundingClientRect();
      return { x: rect.left, y: rect.top, height: rect.height, width: rect.width };
    };

    var stopEvent = function() {
      if(d3.event){
        d3.event.stopPropagation();
        d3.event.preventDefault();
      }
    };
    
    //filter the selectees to see whether the shape intersect with hitTestRect. 
    var filter = function(selectees, hitTestRect){
      var res = [];
      
      selectees.filter(function(d, m){
        var rect = getBoundingBox(this);
        if(BoundingBox.intersects(rect , hitTestRect)){
          res.push(this);
        }
      });

      return res;
    };
    
    var lassoStart = function(){
      if (selectionMode !== 'multiple')
        return;

      if (selectWithCtrlKey && !(d3.event.ctrlKey)) {
        return;
      }

      startPos = mouse();
      
      lassoHelper = g.append('rect')
        .attr('x', startPos[0])
        .attr('y', startPos[1])
        .attr('width', 0)
        .attr('height', 0)
        .attr('pointer-events', 'none')
        .attr('fill', 'rgba(64,176,240, 0.4)')
        .style('stroke-width', '2px')
        .attr('stroke', 'rgb(64, 176, 240)');
      
      isLassoStart = true;
      stopEvent();
    };
    
    var clearPlots  = function(_){
      for(var i = 0; i< plots.length; i++){
        if(plots[i].clear){
          plots[i].clear(_);
        }
      }
    };
    
    var lassoMove = function(){
      if(selectionMode !== 'multiple' || !isLassoStart)
        return;
      
      var pos = mouse(),
        x = Math.min(pos[0], startPos[0]),
        y = Math.min(pos[1], startPos[1]),
        width = Math.abs(pos[0] - startPos[0]),
        height = Math.abs(pos[1] - startPos[1]);

      lassoHelper.attr('x', x).attr('y', y).attr('width', width).attr('height', height);
    };
    
    var lassoEnd = function(){
      var clientPoint = {
          x : d3.event.clientX,
          y:  d3.event.clientY
      };
      lassoEndHandler(clientPoint);
    };

    var lassoEndHandler = function(clientPoint){
      if(selectionMode !== 'multiple' || !isLassoStart)
        return;
      
      isLassoStart = false;

      var bnode = lassoHelper.node(), box = getBoundingBox(bnode), bwidth = parseFloat(bnode.getAttribute('width')), bheight = parseFloat(bnode.getAttribute('height')),
          selectedData = [], 
          deselectedData = [];

      // remove the lasso element after this function executes
      setTimeout(function() {
        lassoHelper.remove();
      }, 0);
    
      if(bwidth || bheight){
        var plot, candidates, isInShape = false, selectees = null, selectedObj = [], 
            plotSubLayer = null,
            plotBox = null,
            intersectedBox = null;
        for(var i = 0, len= plots.length; i< len; i++) {
          plot = plots[i];
          candidates = null;

          if (TypeUtils.isFunction(plot.getDatapointsInRect)) {
            // if the plot supports this function, use it to retrieve datapoints within the 
            // bounds of the lasso element
            candidates = plot.getDatapointsInRect(lassoHelper.node());
          }
          else {
            // get a rectangle that represent the viewbox of the plot module
            plotSubLayer = plot.parent().select('rect.viz-event-sub-layer').node();

            // find the intersection of the plot rectangle with the lasso rectangle
            plotBox = plotSubLayer ? getBoundingBox(plotSubLayer) : null;
            intersectedBox = plotBox ? BoundingBox.intersection(plotBox, box) : box; // fall back to lasso rect if plot rectangle not available

            if (!intersectedBox) {
              // this is null if the lasso was not over the plot's area
              // no need to check datapoints for this plot
              continue;
            }

            selectees = plot.parent().selectAll('.datapoint');

            if(selectees[0].length > 0){
              candidates = filter( selectees , intersectedBox );
            }
          }

          if(candidates && candidates.length > 0 ){
            selectedObj.push({
              plot: plot,
              selected: candidates
            });
          }
        }
        
        if(selectedObj.length > 0){
          
          if(lastSelected.length  == 0){
            
            unhighlightTarget(lastSelected, false);
            
            clearPlots(true);
          }
          
          //if the length of lastSelect is large than 0, it means that the chart is in highlight status, do not need to clear the chart to gray
          var plot = null, selected = null, isHighlight = false, lastSelectedBack = ObjectUtils.extend(true , [], lastSelected);
          for(var i=0, len= selectedObj.length; i < len; i++){
            plot = selectedObj[i].plot, selected = selectedObj[i].selected;
            for(var j=0, jlen = selected.length; j < jlen; j++){
              for(var t =0, tlen = lastSelectedBack.length; t < tlen; t++){
                if(selected[j] == lastSelectedBack[t]){
                  isHighlight = true;
                  break;
                }
              }
              
              //If the shape is not in queue of lastSelected
              //maybe we should deselect the shape which is already in highlight status, currently, do not need
              if(isHighlight){
                //lastSelected.splice((t - 1, 1));
                selectedData.push(selected[j]); // only fire the change the data
              }else{
                lastSelected.push(selected[j]);
                selectedData.push(selected[j]); // only fire the change the data
              }
              
              isHighlight = false;
            }
            //highlight selected shapes
            plot.highlight(selected);
          }
        }else{
          //there are no shapes selected
          if(lastSelected.length > 0){
            //if there are selected before, clear all
            unhighlightTarget(lastSelected, false);

            
            clearPlots();
          }
          
          deselectedData  = deselectedData.concat(lastSelected);
          
          lastSelected.splice(0, lastSelected.length);
        }
        
        //eDispatch.lassoEnd(candidates);
        if(selectedData.length > 0){
          fireSelectDataEvent(selectedData);
        }
        
        if(deselectedData.length >0){
          fireDeselectDataEvent(deselectedData);
        }
        
        //clear lastOvered effect
        for(var i =0, len = lastOvered.length; i< len;i++){
          if(lastOvered[i].plot.mouseout){
            lastOvered[i].plot.mouseout(lastOvered[i].target, true);
          }
        }
        
        lastOvered.splice(0, lastOvered.length);
        
        stopEvent();
      }
    };
    
    var mouseleaveHandler = function(evt){
      if(isLassoStart){
        var clientPoint = {
            x: evt.clientX,
            y: evt.clientY
        };
        lassoEndHandler(clientPoint);
        
        isLassoStart = false;
      }
      
      for(var i=0, len = lastHovered.length; i <len; i++){
        if(lastHovered[i].blurOut){
          lastHovered[i].blurOut();
        }
      }
      
      lastHovered.splice(0, lastHovered.length);
    };
    
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
    
    return lasso;
  };
});