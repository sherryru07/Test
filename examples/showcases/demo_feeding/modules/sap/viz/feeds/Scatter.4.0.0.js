sap.riv.module(
{
  qname : 'sap.viz.feeds.Scatter',
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
    id : "scatter",
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
      'min' : 1,
      'max' : 1,
      'mgIndex' : 1
    }, {
      'id' : 'secondaryValues',
      'name' : 'Secondary Values',
      'type' : constants.Type.Measure,
      'min' : 1,
      'max' : 1,
      'mgIndex' : 2
    }, {
      'id' : 'bubbleWidth',
      'name' : 'Bubble Width',
      'type' : constants.Type.Measure,
      'min' : 0,
      'max' : 1,
      'mgIndex' : 3
    }, {
      'id' : 'bubbleHeight',
      'name' : 'Bubble Height',
      'type' : constants.Type.Measure,
      'min' : 0,
      'max' : 1,
      'mgIndex' : 4
    } ]
  };
  Manifest.register(feeds);
});