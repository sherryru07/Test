sap.riv.module(
{
  qname : 'sap.viz.data.feed.Constants',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.Constants',
  version : '4.0.0'
}
],
function Setup(constants) {
  var feed = {
    Type : {
      Dimension : "Dimension",
      Measure : "Measure"
    },
    Constraints : {
      INF : Number.POSITIVE_INFINITY
    }
  };
  constants.Feed = feed;
  return feed;
});