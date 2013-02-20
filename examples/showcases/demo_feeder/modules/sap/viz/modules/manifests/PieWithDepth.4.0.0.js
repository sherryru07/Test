sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.PieWithDepth',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.piewithdepth',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Pie',
  version : '4.0.0'
}
],
function Setup(Manifest, Constants, fn) {
  var module = {
    'id' : 'sap.viz.modules.piewithdepth',
    base : 'sap.viz.modules.pie',
    'name' : 'piewithdepth',

    'feeds' : {
      id : "pie",
      configure : null
    },
    fn : fn
  };
  Manifest.register(module);
});