sap.riv.module(
{
  qname : 'sap.viz.feeds.Radar',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.feeds.Manifest',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.feed.Constants',
  version : '4.0.0'
}
],
function Setup( Manifest, constants ) {
  var colors = {
    id : "regionColor",
    name : "Region Color",
    type : constants.Type.Dimension,
    min : 0,
    max : 2,
    aaIndex : 2,
    acceptMND : 2
  },
  
  shapes = {
    id : "regionShape",
    name : "Region Shape",
    type : constants.Type.Dimension,
    min : 0,
    max : 2,
    aaIndex : 3,
    acceptMND : 0
  },
  
  axes = {
    id : "radarAxes",
    name : "Radar Axes",
    type : constants.Type.Dimension,
    min : 1,
    max : 1,
    aaIndex : 1,
    acceptMND : 1
  },

  values = {
    id : "radarAxesValues",
    name : "Radar Axes Values",
    type : constants.Type.Measure,
    min : 1,
    max : constants.Constraints.INF,
    mgIndex : 1
  };

  var feeds = {
    id : "radar",
    feeds : [ colors, shapes, axes, values ]
  };
  Manifest.register(feeds);
});