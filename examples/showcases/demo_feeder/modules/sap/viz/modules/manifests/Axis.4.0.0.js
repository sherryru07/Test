sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.Axis',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.axis',
  version : '4.0.0'
}
],
function Setup(Manifest, Constants, fn) {
  var module = {
    'id' : 'sap.viz.modules.axis',
    'type' : Constants.Module.Type.Supplementary,
    'name' : 'axis',
    'properties' : {
      'isIndependentMode' : {
        'name' : 'isIndependentMode',
        'supportedValueType' : 'Boolean',
        'defaultValue' : false,
        'description' : 'Set whether axis works on independent mode, currently it is used specially for boxplot chart.',
        'isExported' : false
      },
      'isPercentMode' : {
        'name' : 'isPercentMode',
        'supportedValueType' : 'Boolean',
        'defaultValue' : false,
        'description' : 'Show the label 0.1 as 10',
        'isExported' : false
      },
    'lineSize' : {
        'name' : 'lineSize',
        'supportedValueType' : 'String',
        'defaultValue' : '1',
        'description' : 'Set line size of axis.',
        'isExported' : true,
      },
      'title' : {
        'name' : 'title',
      'description' : 'Settings for axis title.',
        'supportedValueType' : 'Object',
        'supportedValues' : {
        'visible' : {
        'name' : 'visible',
        'supportedValueType' : 'Boolean',
        'defaultValue' : false,
        'description' : 'Set visibility of axis title.'
        }, 
        'text' : {
        'name' : 'text',
        'supportedValueType' : 'String',
        'defaultValue' : null,
        'description' : 'Set text of axis title.'
        },
        'applyAxislineColor' : {
        'name' : 'applyAxislineColor',
        'supportedValueType' : 'Boolean',
        'defaultValue' : false,
        'description' : 'Set title color same with axisline color.',
        'isExported' : false,
        },
      },
      },
      'gridline' : {
        'name' : 'gridline',
      'description' : 'Settings for axis gridline.',
        'supportedValueType' : 'Object',
        'supportedValues' : {
        'visible': {
          'name' : 'visible',
          'supportedValueType' : 'Boolean',
          'defaultValue' : true,
          'description' : 'Set visibility of axis gridline.'
        },
        showFirstLine : {
              'name' : 'showFirstLine',
              'supportedValueType' : 'Boolean',
              'defaultValue' : false,
              'description' : 'Set enabled/disabled the first line of gridlines.',
              'isExported' : false,
        },
        showLastLine : {
              'name' : 'showLastLine',
              'supportedValueType' : 'Boolean',
              'defaultValue' : false,
              'description' : 'Set enabled/disabled the last line of gridlines.',
              'isExported' : false,
        },
        'type' : {
          'name' : 'type',
          'supportedValueType' : 'List',
          'supportedValues' : [ 'line', 'dotted', 'incised'],
          'defaultValue' : 'line',
          'description' : 'Set type of gridline.',
          'isExported' : true,
        },
        'color' : {
          'name' : 'color',
          'supportedValueType' : 'String',
          'defaultValue' : '#d8d8d8',
          'description' : 'Set color of gridline.',
          'isExported' : true,
        },
        'size' : {
          'name' : 'size',
          'supportedValueType' : 'String',
          'defaultValue' : '1',
          'description' : 'Set line size of gridline.',
          'isExported' : true,
        },        
          },
      }, 
    'color' : {
        'name' : 'color',
        'supportedValueType' : 'String',
        'defaultValue' : '#6c6c6c',
        'description' : 'Set color of axisline.',
          'isExported' : true,
      },
      'axisline' : {
        'name' : 'axisline',
      'description' : 'Settings for axisline.',
        'supportedValueType' : 'Object',
        'supportedValues' : {
        'visible' : {
        'name' : 'visible',
        'supportedValueType' : 'Boolean',
        'defaultValue' : true,
        'description' : 'Set visibility of axisline.'
        },
      },
      },    
      'type' : {
        'name' : 'type',
        'supportedValueType' : 'List',
        'supportedValues' : [ 'value', 'category', ],
        'defaultValue' : 'value',
        'description' : 'Set type of axis.',
          'isExported' : false,
      },
      'visible' : {
        'name' : 'visible',
        'supportedValueType' : 'Boolean',
        'defaultValue' : true,
        'description' : 'Set visibility of axis.',
      },
      'label' : {
        'name' : 'label',
      'description' : 'Settings for axis label.',
        'supportedValueType' : 'Object',
        'supportedValues' : {
        'visible' : {
        'name' : 'visible',
        'supportedValueType' : 'Boolean',
        'defaultValue' : true,
        'description' : 'Set visibility of axis label.'
        }, 
        'numberFormat' : {
        'name' : 'numberFormat',
        'supportedValueType' : 'String',
        'defaultValue' : '',
        'description' : 'Set number format of value axis.'
        },
        'formatString' : {
         'name' : 'formatString',
         'supportedValueType' : 'String',
         'defaultValue' : null,
         'description' : 'Set format string of value axis. If number format and format string are both set, number format will be ignored. '
        }
      },
      },
      'position' : {
        'name' : 'position',
        'supportedValueType' : 'List',
        'supportedValues' : [ 'left', 'right', 'top', 'bottom' ],
        'defaultValue' : 'bottom',
        'description' : 'Set position of axis.',
          'isExported' : false,
      },
      'scale' : {
        'name' : 'scale',
        'description' : 'Set scale for yAxis.',
        'supportedValueType' : 'Object',
        'supportedValues' : {
            'fixedRange' : {
                'name' : 'fixedRange',
                'supportedValueType' : 'Boolean',
                'defaultValue' : false,
                'description' : 'Enable/disable fixed axis range according minValue and maxValue.',
                'isExported' : false
            },
            'minValue' : {
                'name' : 'minValue',
                'supportedValueType' : 'Number',
                'defaultValue' : 0,
                'description' : 'Set minValue of yAxis.',
                'isExported' : false
            },
            'maxValue' : {
                'name' : 'maxValue',
                'supportedValueType' : 'Number',
                'defaultValue' : 0,
                'description' : 'Set maxValue of yAxis.',
                'isExported' : false
            }
        },
        'isExported' : false
      },
      'layoutInfo' : {
        'name' : 'layoutInfo',
        'description' : 'Settings layoutInfo for axis.',
        'supportedValueType' : 'Object',
        'supportedValues' : {
            'width' : {
                'name' : 'width',
                'supportedValueType' : 'Number',
                'defaultValue' : 0,
                'description' : 'Set width of xAxis.',
                'isExported' : false
            }, 
            'height' : {
                'name' : 'height',
                'supportedValueType' : 'Number',
                'defaultValue' : 0,
                'description' : 'Set height of xAxis.',
                'isExported' : false
            }
        },
        'isExported' : false
      }
    },
    'css' : {
      '.viz-axis-title' : {
        'description' : 'Define style for the axis title.',
        'value' : {
          'fill' : 'black',
          'font-family' : "'Open Sans', Arial, Helvetica, sans-serif",
          'font-size' : '14px',
          'font-weight' : 'bold'
        }
      },
      '.viz-axis-label' : {
        'description' : 'Define style for the axis label.',
        'value' : {
          'fill' : '#333333',
          'font-family' : "'Open Sans', Arial, Helvetica, sans-serif",
          'font-size' : '12px',
          'font-weight' : 'normal'
        }
      }
    },
    'configure' : null,
    fn : fn
  };
  Manifest.register(module);
});