sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.controller.Rotate',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.controller.rotate',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.controller.Base',
  version : '4.0.0'
}
],
function Setup(Manifest, fn) {
  var module = {
    'id' : 'sap.viz.modules.controller.rotate',
    'name' : 'selection',
    'base' : "sap.viz.modules.controller.base",
    'description': 'Settings for the interactions of the chart.',
    'properties' : {},
    'fn' : fn
  };

  Manifest.register(module);
});