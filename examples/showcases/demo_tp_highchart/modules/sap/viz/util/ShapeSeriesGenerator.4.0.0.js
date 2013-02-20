sap.riv.module(
{
  qname : 'sap.viz.util.ShapeSeriesGenerator',
  version : '4.0.0'},
[

],
function Setup(){
  var ShapeSeries = {
    sapShapes : function(){
      return d3.scale.ordinal().range(['circle', 'diamond', 'triangle-up', 'triangle-down', 'triangle-left', 'triangle-right', 'cross', 'intersection']);
    }
  };
  return ShapeSeries;
});