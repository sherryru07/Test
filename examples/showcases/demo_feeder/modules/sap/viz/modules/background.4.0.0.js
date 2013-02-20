sap.riv.module(
{
  qname : 'sap.viz.modules.background',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.base.Repository',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.dispatch',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.BoundUtil',
  version : '4.0.0'
}
],
function Setup(Repository, dispatch, Objects, BoundUtil) {
  return function(manifest, ctx) {
 
     var CSSCLASS_BORDER = 'viz-plot-background-border',
      CSSCLASS_BACKGROUND = 'viz-plot-background';
    var randomSuffix = Repository.newId();
    var width = 0, 
      height = 0;
    var effectManager = ctx.effectManager,
      properties,
      d3root;
    var eDispatch = new dispatch('initialized');
    
    function background(selection) {
      d3root = selection;
      BoundUtil.drawBound(selection, width, height);
      
      if (properties.visible) {
        getCSSStyle();
        drawCSS();

        var d3rect = d3root.select('#' + 'background-rect-' + randomSuffix);
        if (d3rect.empty()) {
          d3rect = d3root.append('svg:rect').attr('id', 'background-rect-' + randomSuffix);
        }
        var fillID = effectManager.register({
          graphType : 'background',
          fillColor : properties.style.fillColor,
          drawingEffect : properties.drawingEffect,
          direction : properties.direction
        });
        d3rect.attr('x', 0).attr('y', 0).attr('width', width).attr('height', height).attr('fill', fillID);
        
        var borderData = [];
        if (properties.border.left.visible) {
          borderData.push({
            x1: 0, y1: 0, x2: 0, y2: height
          });
        }
        if (properties.border.right.visible) {
          borderData.push({
            x1: width, y1: 0, x2: width, y2: height
          });
        }
        if (properties.border.top.visible) {
          borderData.push({
            x1: 0, y1: 0, x2: width, y2: 0
          });
        }
        if (properties.border.bottom.visible) {
          borderData.push({
            x1: 0, y1: height, x2: width, y2: height
          });
        }
        
        var d3border = selection.selectAll("." + CSSCLASS_BORDER).data(borderData);
        d3border.enter().append('svg:line').attr('class', CSSCLASS_BORDER);
        d3border.exit().remove();
        d3border.attr('x1', function(d){return d.x1;}).attr('y1', function(d){return d.y1;})
          .attr('x2', function(d){return d.x2;}).attr('y2', function(d){return d.y2;});
      } else {
        var temp = d3root.node();
        while(temp.hasChildNodes()) {
            temp.removeChild(temp.firstChild);
        }
      }
      
      //currently, we do not have animation. If it has, should fire initialized event after animation complete.
      eDispatch.initialized();
      
      return background;
    }
    
    background.properties = function(_){
      if (!arguments.length){
        return properties;
       }
      Objects.extend(true, properties, _);
      return background;
    };
    background.size = function(_size) {
      if (arguments.length === 0) {
        return {
            "width" : width,
            "height": height
        };
      }
      width = _size.width;
      height = _size.height;
      return background;
    };
    background.width = function(_width) {
      if (arguments.length === 0) {
        return width;
      }
      width = _width;
      return background;
    };
    background.height = function(_height) {
      if (arguments.length === 0) {
        return height;
      }
      height = _height;
      return background;
    };
    background.data = function(_) {
      if(!arguments.length) {
        return {};
      }
      return background;
    };
    background.parent = function() {
      return null;
    };

    background.dispatch = function(_){
      if(!arguments.length) {
        return eDispatch;
      }
      eDispatch = _;
      return background;
    };
    
    function drawCSS () {
      var d3defs = d3root.select('#' + 'background-defs-' + randomSuffix);
      if (d3defs.empty()) {
        d3defs = d3root.insert('defs', ':first-child').attr('id', 'background-defs-' + randomSuffix);
      }
      
      var d3style = d3defs.select('style');
      if (d3style.empty()) {
        d3style = d3defs.insert('style', ':first-child');
        d3style[0][0].setAttribute('type', 'text/css');
      }
      var cssStr = '.' + CSSCLASS_BORDER + '{' + ctx.styleManager.cssText(CSSCLASS_BORDER) + '}';
      d3style[0][0].textContent = cssStr;
    }
    
    function getCSSStyle() {
      if (!properties.style) {
        properties.style = {};
      }
      var cssDef = ctx.styleManager.query(CSSCLASS_BACKGROUND);
      if (cssDef) {
        if (cssDef['fill']) {
          properties.style.fillColor = cssDef['fill'];
        }
      }
    }

    properties = manifest.props(null);
    return background;

  };
});