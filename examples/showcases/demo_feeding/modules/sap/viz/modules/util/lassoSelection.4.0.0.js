sap.riv.module(
{
  qname : 'sap.viz.modules.util.lassoSelection',
  version : '4.0.0'},
[

],
function Setup() 
{
  return function(){
    var layerPos = {},//point on svg xy-coordinate
      clientPos = {},  //point on client position
      svgBoundingBox = null; //to improve performance, save all the bound of selected shape
    var lassoHelper, //div holder 
      lassoStart, lassoMove, lassoFinish, //lasso handler 
      start = false, 
      gWrapper = null, 
      gSelection = null, hitTestRect = {}, elementFilter, selectees,
      decorativeRect = null;
    //selection should be a svg element, as some function as svg native function. 
    var lassoSelection = function(selection, options){
      
      lassoHelper = $('<div id="lasso-selection-help" style="position:absolute;pointer-events:none;background:#cccccc;"></div>');
      elementFilter = options && options.filter ? options.filter:'.datapoint';
      gSelection = d3.select(selection).select('.main').length > 0  ? d3.select(selection).select('.main')[0][0] :  selection;
      gWrapper = d3.select(gSelection);
      var bbox = gSelection.getBBox();
      //as SVG limitation, you can not get the event info if you click where there is no shape.
      decorativeRect = gWrapper.insert('rect', 'g').attr('width', bbox.width).attr('height', bbox.height).attr('x', 0).attr('y', 0).attr('fill-opacity', 0);
      lassoStart = options.lassoStart ?options.lassoStart: function(){}, 
      lassoMove = options.lassoMove ? options.lassoMove: function(){}, 
      lassoEnd = options.lassoEnd ? options.lassoEnd: function(){};
      //register event on svg element
      gWrapper.on('mousedown', lassoSelection.start);
      gWrapper.on('mousemove', lassoSelection.move);
      gWrapper.on('mouseup', lassoSelection.end);
      return lassoSelection;
    };
    //intersect two rectangle
    function intersect(a, b) {
        return (a.x <= (b.x + b.width) &&
                b.x <= (a.x + a.width) &&
                a.y <= (b.y + b.height) &&
                b.y <= (a.y + a.height));
    };
    
    //filter the selectees to see whether the shape intersect with hitTestRect. 
    var filter = function(point, size){
      
      hitTestRect.x = point.x;
      hitTestRect.y = point.y;
      hitTestRect.height = size.height;
      hitTestRect.width = size.width;
      
      var res = [];
      //to reduce the time to get the bounding value, restore them into variable.
      if(selectees == null){
        selectees = gWrapper.selectAll(elementFilter);;
      }
      
      selectees.filter(function(d, m){
        var bounding = this.getBoundingClientRect();
        var rect = {
          x : bounding.left,
          y : bounding.top,
          width : bounding.width,
          height : bounding.height
        };
        if(intersect(rect , hitTestRect)){
          res.push(this);
        }
      });

      return res;
    };
    
    lassoSelection.start = function(){
      //as the layerX's issue in IE, so use the other way to calculate the x/y point on svg element.
      //layerX = pageX - svgBounding.left
      //layerY = pageY - svgBounding.top
      svgBoundingBox = gSelection.ownerSVGElement.getBoundingClientRect();
      clientPos.x = d3.event.clientX, clientPos.y = d3.event.clientY;
      layerPos.x = clientPos.x - svgBoundingBox.left, layerPos.y = clientPos.y - svgBoundingBox.top;
      
      lassoHelper.css({
        "left": layerPos.x,
        "top": layerPos.y,
        "width": 0,
        "height": 0
      });
      
      //insert the background before the svg element in order to draw the background the behind svg
      lassoHelper.insertBefore(gSelection.ownerSVGElement.parentNode);
      
      var candidates = filter({x:clientPos.x, y:clientPos.y}, {width:0, height:0});
      
      lassoStart(candidates);
      
      start = true;
    };
    
    /**
     * when mouse move, only show the background
     */
    lassoSelection.move = function(){
      if(start){
        svgBoundingBox = gSelection.ownerSVGElement.getBoundingClientRect();
        var x1 = layerPos.x, y1 = layerPos.y, x2 = d3.event.clientX - svgBoundingBox.left, y2 = d3.event.clientY - svgBoundingBox.top;
        if (x1 > x2) { var tmp = x2; x2 = x1; x1 = tmp; }
        if (y1 > y2) { var tmp = y2; y2 = y1; y1 = tmp; }
        lassoHelper.css({left: x1, top: y1, width: x2-x1, height: y2-y1});
      }
    };
    
    lassoSelection.end = function(){
      lassoHelper.css({
        width:0,
        height:0
      });
      lassoHelper.remove();
      svgBoundingBox = gSelection.ownerSVGElement.getBoundingClientRect();
      var x1 = layerPos.x, y1 = layerPos.y, x2 = d3.event.clientX - svgBoundingBox.left, y2 = d3.event.clientY - svgBoundingBox.top;
      var cx1 = clientPos.x, cy1 = clientPos.y , cx2 = d3.event.clientX, cy2 = d3.event.clientY;
      if (x1 > x2) { var tmp = x2; x2 = x1; x1 = tmp; tmp = cx2; cx2 = cx1; cx1 = tmp;}
      if (y1 > y2) { var tmp = y2; y2 = y1; y1 = tmp; tmp = cy2; cy2 = cy1; cy1 = tmp; }
      //lassoHelper.css({left: x1, top: y1, width: x2-x1, height: y2-y1});
      
      if(x1 === x2 && y1 === y2){
        start = false;
      }else{
        var candidates = filter({x:cx1, y:cy1}, {width: x2-x1, height: y2-y1});
        lassoEnd(candidates);
        start = false;
      }
    };
    
    return lassoSelection;
  };
});