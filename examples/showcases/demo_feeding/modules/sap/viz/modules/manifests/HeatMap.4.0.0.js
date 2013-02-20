sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.HeatMap',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.heatmap',
  version : '4.0.0'
},
{  qname : 'sap.viz.feeds.HeatMap',
  version : '4.0.0'
}
],
function Setup(Manifest, Constants, fn) {

    var module = {
      'id' : 'sap.viz.modules.heatmap',
      'type' : Constants.Module.Type.Chart,
      'name' : 'heatmap',
      'properties' : {
        'border' : {
          'name' : 'border',
      'description' : 'Settings for border.',
          'supportedValueType' : 'Object',
          'supportedValues' : {
            'visible' : {
                'name' : 'visible',
                'supportedValueType' : 'Boolean',
                'defaultValue' : true,
                'description' : 'Set visibility of zone edge.'
            },
          },
        },

        'animation' : {
          'name' : 'animation',
          'supportedValueType' : 'Object',
          'supportedValues' : {
            'dataLoading' : {
              'name' : 'dataLoading',
              'supportedValueType' : 'Boolean',
              'defaultValue' : true,
              'description' : 'Set enabled/disabled data loading animation of plot area.'
            },
            'dataUpdating' : {
              'name' : 'dataUpdating',
              'supportedValueType' : 'Boolean',
              'defaultValue' : false,
              'description' : 'Set enabled/disabled data updating animation of plot area.'
            }
          },
          'description' : 'Settings for animation of plot area.'
        },
        'startColor' : {
          'name' : 'startColor',
          'supportedValueType' : 'String',
          'defaultValue' : "#C2E3A9",
          'description' : 'Set heatMap startColor.'
        },
      
        'endColor' : {
          'name' : 'endColor',
          'supportedValueType' : 'String',
          'defaultValue' : "#73C03C",
          'description' : 'Set heatMap endColor.'
        },

        'tooltip' : {
          'name' : 'tooltip',
      'description' : 'Settings for tooltip.',
          'supportedValueType' : 'Object',
          'supportedValues' : {
              'visible': {
                    'name' : 'enabled',
                    'supportedValueType' : 'Boolean',
                    'defaultValue' : true,
                    'description' : 'Set enabled/disabled tooltip.'
              },
          },
        'isExported' : false
        }
      },
      'events' : {
        'initialized': Constants.Module.Event.Initialized.desc,
        'selectData' : Constants.Module.Event.SelectData.desc,
      'deselectData' : Constants.Module.Event.DeSelectData.desc,
      'showTooltip' : Constants.Module.Event.TooltipShow.desc,
      'hideTooltip' : Constants.Module.Event.TooltipHide.desc

      },
      'feeds' :{
          id:"heatMap"
      },
      'css' : {},
      'configure' : null,
      fn : fn
    };

    Manifest.register(module);
});