sap.riv.module(
{
  qname : 'sap.viz.modules.util.BoundUtil',
  version : '4.0.0'},
[

],
function Setup() 
{
  var BoundUtil = {
      drawBound : function(selection, width, height ){
          if(selection.select('.bound').node() == null){
            selection.insert('rect', ':first-child').attr('class', 'bound').attr('width', width).attr('height', height).attr('visibility', 'hidden');
          }else{
            selection.select('.bound').attr('width', width).attr('height', height);
          }
      }
  };
  
  return BoundUtil;
});