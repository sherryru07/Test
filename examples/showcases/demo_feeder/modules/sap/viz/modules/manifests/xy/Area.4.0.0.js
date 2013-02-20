sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.xy.Area',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.area',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.Base',
  version : '4.0.0'
}
],
function Setup(Manifest, Constants, fn) {
  var module = {
    'id' : 'sap.viz.modules.area',
    'name' : 'area',
     base : 'sap.viz.modules.xy.base',
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
      'mode' : {
        'name' : 'mode',
        'supportedValueType' : 'List',
        'supportedValues' : [ 'comparison', 'percentage' ],
        'defaultValue' : 'comparison',
        'description' : 'Set dispaly mode of area chart.',
         'isExported' : false
      },
      'orientation' : {
        'name' : 'orientation',
        'supportedValueType' : 'List',
        'supportedValues' : [ 'vertical', 'horizontal' ],
        'defaultValue' : 'vertical',
        'description' : 'vertical or horizontal area chart.',
        'isExported' : false
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
            }
          },
          'description' : 'Settings for tooltip related properties.'
     },
      'hoverline' : {
          'name' : 'hoverline',
          'supportedValueType' : 'Object',
          'description' : 'Settings for hoverline properties.',
          'supportedValues' : {
            'visible' : {
              'name' : 'visible',
              'supportedValueType' : 'Boolean',
              'defaultValue' : true,
              'description' : 'Set to enabled/disabled hoverline or not.'
            }
          }
      },
      'marker' : {
        'name' : 'marker',
      'description': 'Settings for marker/data point graphics',
        'supportedValueType' : 'Object',
        'isExported' :false,
        'supportedValues' : {
          'visible' : {
            'name' : 'visible',
            'supportedValueType' : 'Boolean',
            'defaultValue' : false,
            'description' : 'Set show marker or not.',
            'isExported' :false
          },
          'shape' : {
            'name' : 'shape',
            'supportedValueType' : 'List',
            'supportedValues' : ['circle', 'diamond', 'triangle-up', 'triangle-down', 'triangle-left', 'triangle-right', 'cross', 'intersection'],
            'defaultValue' : 'circle',
            'description' : 'Set marker shapes for chart.'
          },
          'size' : {
            'name' : 'size',
            'supportedValueType' : 'PositiveInt',
            'defaultValue' : "4",
            'min' : '4',
            'max' : '32',
            'description' : 'Set marker size of data point, range[4,32]. When beyond the range, the marker size is default size 4.'
          }
        }
      }
    },
    'css' : {
     
        '.viz-plot-hoverline': {
          'description' : 'Define style for hoverline in line.',
          'value' : {
            'stroke' : '#cccccc'
          }
      }
    },
    fn : fn
  };

  Manifest.register(module);
});