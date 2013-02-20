sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.xy.HorizontalCombination',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.horizontalcombination',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.Combination',
  version : '4.0.0'
}
],
function Setup(Manifest, fn) {

  var module = {
    base : "sap.viz.modules.combination",
    'id' : 'sap.viz.modules.horizontalcombination',
    'name' : 'horizontalcombination',
    fn : fn
  };

  Manifest.register(module);
});