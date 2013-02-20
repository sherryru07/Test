sap.riv.module(
{
  qname : 'sap.viz.modules.controller.rotate',
  version : '4.0.0'},
[

],
function Setup() {
  
  return function(manifest){
    
    var m = null, g = null, props =  manifest.props(null), xAngle = 0, yAngle = 0, mousedown = false;
    var rotate = function(){
      
      return rotate;
    };
    

    rotate.registerEvent = function() {
      g.on('mousedown.rotate', start).on('mousemove.rotate', move).on(
          'mouseup.rotate', end);
      
      $(g.node()).mouseleave(end);
      
      var angle = m.rotate();
      xAngle = angle.xAngle;
      yAngle = angle.yAngle;
      
    };

    function start() {
      oldX = d3.event.layerX;
      oldY = d3.event.layerY;
      mousedown = true;
    };

    function move() {
     if(mousedown == true){
       var x = d3.event.layerX;
       var y = d3.event.layerY;
       
       yAngle += (oldX - x) /2;
       if(yAngle > 180){
         yAngle -= 360;
       }else if(yAngle < -180){
         yAngle += 360;
       }
       
       xAngle += (y - oldY)/2;
       if(xAngle > 90){
         xAngle = 90;
       } else if(xAngle < -90){
         xAngle = -90;
       }
       
       oldX = x;
       oldY = y;
       
       m.rotate({
         xAngle: xAngle,
         yAngle: yAngle
         });
     }
    }

    function end() {
      mousedown = false;
    }
    
    rotate.module = function(_){
      if(!arguments.length){
        return m;
      }
      m = _; g = m.parent();
      return rotate;
    };
    
    rotate.properties = function(_){
      if(!arguments.length){
        return props;
      }
      props = _;
      return rotate;
    };
    
    return rotate;
    
  };
});