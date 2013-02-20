sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.xyz.Bar3D',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.bar3d',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.BaseBar',
  version : '4.0.0'
}
],
function Setup(Manifest, fn, Constants) {
  var module = {
    'id' : 'sap.viz.modules.bar3d',
    'name' : '3d bar',
    'type' : Constants.Module.Type.Chart,
    fn : fn,
    'properties' : {
      'colorPalette' : {
        'name' : 'colorPalette',
        'supportedValueType' : 'StringArray',
        'defaultValue' : Constants.SAPColor,
        'description' : 'Set color palette.'
      },
      'direction' : {
        'name' : "direction",
        'supportedValueType' : 'List',
        'supportedValues' : [ 'vertical', 'horizontal' ],
        'defaultValue' : "vertical",
        'description' : 'Set direction.',
        'isExported' : false
      }
    },
    'feeds' : {
      id : "xy",
      configure : {
        secondaryValues : null
      }
    }
  };

  Manifest.register(module);
});