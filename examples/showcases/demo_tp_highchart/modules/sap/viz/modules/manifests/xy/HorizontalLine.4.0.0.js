sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.xy.HorizontalLine',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.horizontalline',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.Line',
  version : '4.0.0'
}
],
function Setup(Manifest, Constants, fn) {
  var module = {
    'id' : 'sap.viz.modules.horizontalline',
    'name' : 'horizontalline',
    base : 'sap.viz.modules.line',
    
    fn : fn
  };

  Manifest.register(module);
});