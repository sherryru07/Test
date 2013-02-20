sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.xy.BaseBar',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.Base',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var module = {
    'id' : 'sap.viz.modules.xy.bar.base',
    'name' : 'bar',
    base : "sap.viz.modules.xy.base",
    'abstract' : true,
    'properties' : {
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
      },
      'isRoundCorner' : {
        'name' : 'isRoundCorner',
        'supportedValueType' : 'Boolean',
        'defaultValue' : false,
        'description' : 'Set enable/disable round corner of bar.'
      },
      'animation' : {
        'name' : 'animation',
        'supportedValueType' : 'Object',
        'supportedValues' : {
          'dataLoading' : {
            'name' : 'dataLoading',
            'supportedValueType' : 'Boolean',
            'defaultValue' : true,
            'description' : 'Set enable/disable data loading animation of plot area.'
          },
          'dataUpdating' : {
            'name' : 'dataUpdating',
            'supportedValueType' : 'Boolean',
            'defaultValue' : true,
            'description' : 'Set enable/disable data updating animation of plot area.'
          },
          'resizing' : {
            'name' : 'resizing',
            'supportedValueType' : 'Boolean',
            'defaultValue' : true,
            'description' : 'Set enable/disable resize animation of plot area.'
          }
        },
        'description' : 'Settings for animation of plot area.'
      }
    }
  };

  Manifest.register(module);
});