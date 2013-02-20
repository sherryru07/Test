sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.xy.VerticalBoxplot',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.verticalboxplot',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.Base',
  version : '4.0.0'
}
],
function Setup(Manifest, fn) {
  var module = {
    'id' : 'sap.viz.modules.verticalboxplot',
    'name' : 'vertical boxplot',
    base : "sap.viz.modules.xy.base",
    'properties' : { 
          'primaryValuesColorPalette' : null,
          'secondaryValuesColorPalette' : null,
          'tooltip' : {
            'name' : 'tooltip',
            'supportedValueType' : 'Object',
            'supportedValues' : {
              'enabled' : {
                'name' : 'enabled',
                'supportedValueType' : 'Boolean',
                'defaultValue' : true,
                'description' : 'Set enabled/disabled tooltip.'
              }
            },
            'isExported' : false,
            'description' : 'Settings for tooltip related properties.'
          }
    },
    'feeds' : {
      configure : {
          secondaryValues:null,
          axisLabels:{
          acceptMND: -1,
          min : 1,
          max : 1
        }
      }
    },
    fn : fn
  };

  Manifest.register(module);
});