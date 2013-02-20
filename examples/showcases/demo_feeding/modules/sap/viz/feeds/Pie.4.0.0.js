sap.riv.module(
{
  qname : 'sap.viz.feeds.Pie',
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
    id : "pie",
    feeds : [ {
      'id' : 'pieSectorColor',
      'name' : 'Sector Color',
      'type' : constants.Type.Dimension,
      'min' : 1,
      'max' : 1,
      'aaIndex' : 1,
      'acceptMND': -1
    }, {
      'id' : 'pieSectorSize',
      'name' : 'Sector Size',
      'type' : constants.Type.Measure,
      'min' : 1,
      'max' : 1,
      'mgIndex' : 1
    }, {
      'id' : 'pieDepthSize',
      'name' : 'Depth Size',
      'type' : constants.Type.Measure,
      'min' : 0,
      'max' : 1,
      'mgIndex' : 2
    } ]
  };
  Manifest.register(feeds);
});