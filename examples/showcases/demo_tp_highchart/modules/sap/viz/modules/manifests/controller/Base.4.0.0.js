sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.controller.Base',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
}
],
function Setup(Manifest, Constants) {
  var module = {
    'id' : 'sap.viz.modules.controller.base',
    'abstract' : true,
    'type' : Constants.Module.Type.Controller,
    'name' : 'controller base module',
    'properties' : null,
    'events' : null,
    'feeds' : null
  };

  Manifest.register(module);
});