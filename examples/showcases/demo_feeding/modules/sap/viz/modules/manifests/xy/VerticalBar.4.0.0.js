sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.xy.VerticalBar',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.verticalbar',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.BaseBar',
  version : '4.0.0'
}
],
function Setup(Manifest, fn) {
  var module = {
    'id' : 'sap.viz.modules.verticalbar',
    'name' : 'vertical bar',
    base : "sap.viz.modules.xy.bar.base",
    fn : fn
  };

  Manifest.register(module);
});