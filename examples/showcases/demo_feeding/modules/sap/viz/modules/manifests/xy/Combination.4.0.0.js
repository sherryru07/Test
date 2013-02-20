sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.xy.Combination',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.combination',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.Base',
  version : '4.0.0'
}
],
function Setup(Manifest, Constants, fn) {

  var module = {
    base : "sap.viz.modules.xy.base",
    'id' : 'sap.viz.modules.combination',
    'name' : 'combination',
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
      'animation' : {
          'name' : 'animation',
          'supportedValueType' : 'Object',
          'supportedValues' : {
            'dataLoading' : {
              'name' : 'dataLoading',
              'supportedValueType' : 'Boolean',
              'defaultValue' : true,
              'description' : 'Set enabled/disabled data loading animation of plot area.'
            }
          },
          'description' : 'Settings for animation of plot area.'
      },
      'dataShape' : {
          'name' : 'dataShape',
          'supportedValueType' : 'Object',
          'supportedValues' : {
            'primaryAxis' : {
              'name' : 'primaryAxis',
              'supportedValueType' : 'StringArray',
              'supportedValues' : [ 'bar', 'line' ],
              'defaultValue' : [ 'bar', 'line', 'line'],
              'description' : 'Set shape of measure index1 data.'
            },
            'secondAxis' : {
              'name' : 'secondAxis',
              'supportedValueType' : 'StringArray',
              'supportedValues' : [ 'line', 'line' ],
              'defaultValue' : [ 'line', 'line', 'line'],
              'description' : 'Set shape of measure index2 data.',
                'isExported': false
            }
          },
          'description' : 'Set shape of measure data.'
      },
      'bar' : {
          'name' : 'bar',
          'supportedValueType' : 'Object',
          'supportedValues' : {
            'isRoundCorner' : {
            'name' : 'isRoundCorner',
            'supportedValueType' : 'Boolean',
            'defaultValue' : false,
            'description' : 'Set enable/disable round corner of bar.'
          }
          },
          'description' : 'Settings for bar properties.'     
      }, //bar
      'line' : {
          'name' : 'line',
          'supportedValueType' : 'Object',
          'supportedValues' : {
            'width' : {
            'name' : 'width',
            'supportedValueType' : 'PositiveInt',
            'defaultValue' : 2,
            'description' : 'Set width of line, range[1,7]. When beyond the range, the line width is default size 2.'
            },
            'marker' : {
                'name' : 'marker',
                'description' : 'Set marker/data point graphics settings.',
                'supportedValueType' : 'Object',
                'supportedValues' : {
                    'visible' : {
                      'name' : 'visible',
                      'supportedValueType' : 'Boolean',
                      'defaultValue' : false,
                      'description' : 'Set to show marker or not.'
                    },
                    'shape' : {
                      'name' : 'shape',
                      'supportedValueType' : 'StringArray',
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
          'description' : 'Settings for line properties.'
      } //line
    }, 
    fn : fn
  
  };

  Manifest.register(module);
});