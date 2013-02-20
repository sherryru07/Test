sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.xy.StackedWaterfall',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.stackedwaterfall',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.BaseBar',
  version : '4.0.0'
}
],
function Setup(Manifest, Constants, fn) {
    var module = {
      'id' : 'sap.viz.modules.stackedwaterfall',
      'name' : 'stackedwaterfall',
      base : "sap.viz.modules.xy.bar.base",
      'properties' : {
        'isRoundCorner' : null,
        'primaryValuesColorPalette' : null,
        'secondaryValuesColorPalette' : null,
        'isHorizontal' : {
          'name' : 'isHorizontal',
          'supportedValueType' : 'Boolean',
          'defaultValue' : false,
          'description' : 'Set stacked waterfall orientaion.',
          'isExported' : false
        },
        'isShowTotal' : {
          'name' : 'isShowTotal',
          'supportedValueType' : 'Boolean',
          'defaultValue' : false,
          'description' : 'Set stacked waterfall show/hide total value.',
          'isExported' : false
        },
        'subtotal' : {
          'name' : 'subtotal',
          'supportedValueType' : 'Object',
          'supportedValues' : {
            'visible' : {
              'name' : 'visible',
              'supportedValueType' : 'Boolean',
              'defaultValue' : true,
              'description' : 'Set visibility of subtotal.'
            }, 
            'isRuntimeTotal' : {
              'name' : 'isRuntimeTotal',
              'supportedValueType' : 'Boolean',
              'defaultValue' : true,
              'description' : 'Set isRuntimeTotal of subtotal.'
            },
            'subGroups' : {
              'name' : 'subGroups',
              'supportedValueType' : 'StringArray',
              'defaultValue' : [],
              'description' : 'Set bar groups.',
                'isExported' : false
            }
          },
          'isExported' : false,
          'description' : 'Settings for subtotal related properties.'
        },
        'barGap': {
          'name' : 'barGap',
          'supportedValueType' : 'PositiveInt',
          'defualtValue' : undefined,
          'min' : '5',
          'description': "Set the distance between bars. Default value is the same as bar size.",
          'isExported' : true
        }
      },
      fn : fn,
      'feeds' : {
        configure : {
          'secondaryValues' : null,
          'regionColor': {
            acceptMND : -1,
            min : 1,
            max : 1
          },
          'axisLabels' : {
            max : 1,
            acceptMND : -1
          },
          'primaryValues' : {
            max : 1
          }
        }
      }
    };

    Manifest.register(module);
});