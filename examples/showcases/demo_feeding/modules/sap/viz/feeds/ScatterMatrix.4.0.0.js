sap.riv.module(
{
  qname : 'sap.viz.feeds.ScatterMatrix',
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
function Setup(Manifest, constants) {
    var feeds = {
      id : "scattermatrix",
      feeds : [ {
        'id' : 'regionColor',
        'name' : 'Region Color',
        'type' : constants.Type.Dimension,
        'min' : 0,
        'max' : 1,
        'aaIndex' : 1,
        'acceptMND': -1
      }, {
        'id' : 'regionShape',
        'name' : 'Region Shape',
        'type' : constants.Type.Dimension,
        'min' : 0,
        'max' : 1,
        'aaIndex' : 2,
        'acceptMND': -1
      }, {
        'id' : 'primaryValues',
        'name' : 'Primary Values',
        'type' : constants.Type.Measure,
        'min' : 2,
        'max' : constants.Constraints.INF,
        'mgIndex' : 1
      }]
    };
    Manifest.register(feeds);
});