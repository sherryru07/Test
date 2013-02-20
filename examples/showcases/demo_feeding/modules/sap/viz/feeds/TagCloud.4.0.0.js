sap.riv.module(
{
  qname : 'sap.viz.feeds.TagCloud',
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
    id : "tagCloud",
    feeds : [ {
      'id' : 'tagName',
      'name' : 'Tags Name',
      'type' : constants.Type.Dimension,
      'min' : 1,
      'max' : 1,
      'aaIndex' : 1,
      'acceptMND': -1,
      'maxStackedDims' : 1 
      
    }, {
      'id' : 'tagWeight',
      'name' : 'Tags Weight',
      'type' : constants.Type.Measure,
      'min' : 1,
      'max' : 1,
      'mgIndex' : 1
    }, {
      'id' : 'tagFamily',
      'name' : 'Tags Family',
      'type' : constants.Type.Measure,
      'min' : 0,
      'max' : 1,
      'mgIndex' : 2
    } ]
  };
  Manifest.register(feeds);
});