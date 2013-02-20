sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.Tooltip',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.tooltip',
  version : '4.0.0'
}
],
function Setup(Manifest, Constants, fn) {
  var module = {
    'id' : 'sap.viz.modules.tooltip',
    'type' : Constants.Module.Type.Supplementary,
    'name' : 'tooltip',
    'description': 'Settings for the tooltip that appears when the user hovers over a series or point.',
    'properties' : {
      'visible' : {
        'name' : 'visible',
          'supportedValueType' : 'Boolean',
          'defaultValue' : true,
          'description' : 'Set visibility of tooltip.'
      },
     'drawingEffect':{
       'name' : 'drawingEffect',
       'supportedValueType' : 'List',
       'supportedValues' : [ 'normal', 'glossy' ],
           'defaultValue' : 'normal',
           'description' : 'Set drawing effect of Tooltip.',
           'isExported' : true
    },
	'formatString': {
	'name' : 'formatString',
	'supportedValueType': 'Two-Dimensions-Array',
  'defaultValue' : null,
	'description' : 'Set format string of tooltip. As we may have dual axis with serveral measures, the first array is applied to primary axis and the second one is applied to the second one.'
		+'If the length of format string list is less than the length of data series, the last format string in the list will be applied to exceeded data series.' 
	}
      },
    'css' : {
      '.viz-tooltip-background' : {
        'description' : 'Define style for the tooltip background.',
        'value' : {
          'fill' : '#ffffff'
        }
      },
      '.viz-tooltip-title' : {
        'description' : 'Define style for the tooltip title.',
        'value' : {
          'fill' : '#333333'
        }
      },
      '.viz-tooltip-label' : {
        'description' : 'Define style for the tooltip label.',
        'value' : {
          'fill' : '#333333'
        }
      },
      '.viz-tooltip-value' : {
        'description' : 'Define style for the tooltip value.',
        'value' : {
          'fill' : '#333333'
        }
      }
    },
    fn : fn
  };

  Manifest.register(module);
});