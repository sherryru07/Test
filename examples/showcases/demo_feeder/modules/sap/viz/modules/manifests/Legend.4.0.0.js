sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.Legend',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.legend',
  version : '4.0.0'
}
],
function Setup(Manifest, Constants, fn) {
  var module = {
    'id' : 'sap.viz.modules.legend',
    'type' : Constants.Module.Type.Supplementary,
    'name' : 'legend',
    'description': 'The legend is a box containing a symbol and name for each series item or point item in the chart.',
    'properties' : {
      'visible' : {
        'name' : 'visible',
        'supportedValueType' : 'Boolean',
        'defaultValue' : true,
        'description' : 'Set visibility of legend.'
      },
      'title' : {
        'name' : 'title',
      'description' : 'Settings for legend title.',
        'supportedValueType' : 'Object',
        'supportedValues' : {
        'visible' : {
            'name' : 'visible',
            'supportedValueType' : 'Boolean',
            'defaultValue' : false,
            'description' : 'Set visibility of legend title.'
           }, 
          'text':{
            'name' : 'text',
            'supportedValueType' : 'String',
            'defaultValue' : null,
            'description' : 'Set text of legend title.'
           }
        }
      },
      'formatString': {
    		'name' : 'formatString',
    		'supportedValueType': 'String',
    		'defaultValue' : null,
    		'description' : 'Set format string of legend.',
    		'isExported': false
    	},
      'isHierarchical' : {
        'name' : 'isHierarchical',
        'supportedValueType' : 'Boolean',
        'defaultValue' : false,
        'description' : 'Set hierarchy legend. Supported only when legend is located in the right of chart.',
        'isExported': true
      },
      'position' : {
        'name' : 'position',
        'supportedValueType' : 'List',
        'supportedValues' : [ 'right' ],
        'defaultValue' : 'right',
        'description' : 'Set legend position. Only support legend is located in the right side.',
        'isExported' : false
      },
      'type' : {
        'name' : 'type',
        'supportedValueType' : 'List',
        'supportedValues' : [ 'ColorLegend', 'BubbleColorLegend', 'SizeLegend', 'MeasureBasedColoringLegend' ],
        'defaultValue' : 'ColorLegend',
        'description' : 'Set legend type of Bubble chart. Non-bubble chart is not supported.',
        'isExported' : false
      },
      'alignment' : {
        'name' : 'alignment',
          'supportedValueType' : 'List',
          'supportedValues' : [ 'start', 'middle', 'end' ],
          'defaultValue' : 'start',
          'description' : 'Set alignment of legend.',
          'isExported' : false
      },
      'drawingEffect':{
        'name' : 'drawingEffect',
         'supportedValueType' : 'List',
          'supportedValues' : [ 'normal', 'glossy' ],
          'defaultValue' : 'normal',
          'description' : 'Set drawing effect of legend.',
          'isExported' : true
      }
    },
    'css' : {
      '.viz-legend-title' : {
        'description' : 'Define style for the legend title.',
        'value' : {
          'fill' : 'black',
          'font-family' : "'Open Sans', Arial, Helvetica, sans-serif",
          'font-size' : '14px',
          'font-weight' : 'bold'
        }
      },
      '.viz-legend-valueLabel' : {
        'description' : 'Define style for the legend label.',
        'value' : {
          'fill' : 'black',
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