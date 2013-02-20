sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.Pie',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.pie',
  version : '4.0.0'
},
{  qname : 'sap.viz.feeds.Pie',
  version : '4.0.0'
}
],
function Setup(Manifest, Constants, fn) {
  var module = {
    'id' : 'sap.viz.modules.pie',
    'type' : Constants.Module.Type.Chart,
    'name' : 'pie',
    'properties' : {
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
      'colorPalette' : {
        'name' : 'colorPalette',
        'supportedValueType' : 'StringArray',
        'defaultValue' : Constants.SAPColor,
        'description' : 'Set the color palette for sectors.'
      },
      'isDonut' : {
        'name' : 'isDonut',
        'supportedValueType' : 'Boolean',
        'defaultValue' : false,
        'description' : 'Set whether is a donut or pie.'
      },
      'isGeoPie' : {
        'name' : 'isGeoPie',
        'supportedValueType' : 'Boolean',
        'defaultValue' : false,
        'description' : 'Set whether is a geo pie.'
      },
      'valign' : {
        'name' : 'valign',
        'supportedValueType' : 'List',
        'supportedValues' : [ 'top', 'center' ],
        'defaultValue' : "top",
        'description' : 'Set vertical aligment.',
        'isExported' : false
      },
      'tooltip' : {
        'name' : 'tooltip',
        'supportedValueType' : 'Object',
        'supportedValues' : {
          'visible' : {
            'name' : 'visible',
            'supportedValueType' : 'Boolean',
            'defaultValue' : true,
            'description' : 'Set whether tooltip is enabled.'
          },
          'valueFormat' : {
            'name' : 'valueFormat',
            'supportedValueType' : 'String',
            'defaultValue' : 'n',
            'description' : 'Set the number format of measure value in tooltip.'
          },
          'percentageFormat' : {
            'name' : 'percentageFormat',
            'supportedValueType' : 'String',
            'defaultValue' : ".0%",
            'description' : 'Set the number format of percentage label in tooltip.'
          },
          'formatString': {
        		'name' : 'formatString',
        		'supportedValueType': 'StringArray',
        	  'defaultValue' : null,
        		'description' : 'Set format string of tooltip. The first string is applied to value and the second is applied to percentage. '
          }
        },
        'description' : 'Settings for tooltip related properties.'
      },
      'drawingEffect' : {
        'name' : 'drawingEffect',
        'supportedValueType' : 'List',
        'supportedValues' : [ 'normal', 'glossy' ],
        'defaultValue' : 'normal',
        'description' : 'Set drawing effect of Pie.',
        'isExported' : true
      }
    },
    'events' : {
      'initialized': Constants.Module.Event.Initialized.desc,
      'selectData' : Constants.Module.Event.SelectData.desc,
      'deselectData' : Constants.Module.Event.DeSelectData.desc
    },
    'feeds' : {
      id : "pie",
      configure : {
        pieDepthSize : null
      }
    },
    'css' : {
      '.viz-pie-tooltip-label-dimensions' : {
        'description' : 'Define style for the first label(dimension values) in tooltip.',
        'value' : {
          'font-family' : "'Open Sans', Arial, Helvetica, sans-serif",
          'font-size' : '14px',
          'font-weight' : 'normal',
          'fill' : '#000'
        }
      },
      '.viz-pie-tooltip-label-value' : {
        'description' : 'Define style for the second label(measure value) in tooltip.',
        'value' : {
          'font-family' : "'Open Sans', Arial, Helvetica, sans-serif",
          'font-size' : '18px',
          'font-weight' : 'bold',
          'fill' : '#000'
        }
      },
      '.viz-pie-tooltip-label-percentage' : {
        'description' : 'Define style for the third label(percentage) in tooltip.',
        'value' : {
          'font-family' : "'Open Sans', Arial, Helvetica, sans-serif",
          'font-size' : '16px',
          'font-weight' : 'normal',
          'fill' : '#333'
        }
      },
      '.viz-pie-sector' : {
        'description' : 'Define style for sector in pie.',
        'value' : {
          'stroke' : 'transparent'
        }
      }
    },
    fn : fn
  };

  Manifest.register(module);
});