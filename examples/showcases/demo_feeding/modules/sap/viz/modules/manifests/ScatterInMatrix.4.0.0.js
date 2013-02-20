sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.ScatterInMatrix',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Scatter',
  version : '4.0.0'
}
],
function Setup(Manifest, Constants) {
    var module = {
      'id' : 'sap.viz.modules.scatterInMatrix',
      base : 'sap.viz.modules.scatter',
      'name' : 'scatterInMatrix',
      'feeds' : null
    };
    Manifest.register(module);
});