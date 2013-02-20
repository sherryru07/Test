sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.xy.Line',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.line',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.Base',
  version : '4.0.0'
}
],
function Setup(Manifest, Constants, fn) {
  var module = {
    'id' : 'sap.viz.modules.line',
    'name' : 'line',
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
      'width' : {
        'name' : 'width',
        'supportedValueType' : 'PositiveInt',
        'defaultValue' : 2,
        'min' : '1',
        'max' : '7',
        'description' : 'Set width of line, range[1,7]. When beyond the range, the line width is default size 2.'
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
              'description' : 'Set to enabled/disabled hoverline or not.',
            },
          },
      },
      'marker' : {
        'name' : 'marker',
      'description': 'Settings for marker/data point graphics',
        'supportedValueType' : 'Object',
        'supportedValues' : {
          'visible' : {
            'name' : 'visible',
            'supportedValueType' : 'Boolean',
            'defaultValue' : false,
            'description' : 'Set show marker or not.'
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
            'defaultValue' : "6",
            'min' : '4',
            'max' : '32',
            'description' : 'Set marker size of data point, range[4,32]. When beyond the range, the marker size is default size 6.'
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