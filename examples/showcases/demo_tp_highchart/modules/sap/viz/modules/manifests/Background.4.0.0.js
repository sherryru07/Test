sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.Background',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.background',
  version : '4.0.0'
}
],
function Setup(Manifest, Constants, fn) {
  var visibleObj = {
        'name' : 'visible',
        'supportedValueType' : 'Boolean',
        'defaultValue' : true,
        'description' : 'Set visibility of background.'
      };
  var module = {
    'id' : 'sap.viz.modules.background',
    'type' : Constants.Module.Type.Supplementary,
    'name' : 'background',
    'description': 'Settings for the background for the outer chart area.',
    'properties' : {
      'visible' : visibleObj,
    'border' : {
        'name' : 'border',
      'description' : 'Settings for border property.',
        'supportedValueType' : 'Object',
        'supportedValues' : { 
      'left' : {
        'name' : 'left',
        'description' : 'Set left border property.',
        'supportedValueType' : 'Object',
        'supportedValues' : {
          'visible' : visibleObj,
        },
          }, 
      'right' : {
        'name' : 'right',
        'description' : 'Set right border property.',
        'supportedValueType' : 'Object',
        'supportedValues' : {
          'visible' : visibleObj,
        },
          }, 
      'top' : {
        'name' : 'top',
        'description' : 'Set top border property.',
        'supportedValueType' : 'Object',
        'supportedValues' : {
          'visible' : visibleObj,
        },
          }, 
      'bottom' : {
        'name' : 'bottom',
        'description' : 'Set bottom border property.',
        'supportedValueType' : 'Object',
        'supportedValues' : {
          'visible' : visibleObj,
        },
          },
          },
    },
        'drawingEffect':{
          'name' : 'drawingEffect',
            'description' : 'Set drawing effect of background.',
          'supportedValueType' : 'List',
            'supportedValues' : [ 'normal', 'glossy' ],
            'defaultValue' : 'normal',
            'isExported' : true,
        },
        'direction':{
          'name' : 'direction',
            'description' : 'Set gradient direction of background.',
          'supportedValueType' : 'List',
            'supportedValues' : [ 'horizontal', 'vertical' ],
            'defaultValue' : 'vertical',
        }
    },
    'css' : {
      '.viz-plot-background' : {
        'description' : 'Define style for the plot background.',
        'value' : {
          'fill' : '#ffffff',
        }
      },
      '.viz-plot-background-border' : {
        'description' : 'Define style for the plot background border.',
        'value' : {
          'stroke' : '#d8d8d8',
      'stroke-width' : 1,
      'shape-rendering' : 'crispEdges',
        }
      },
    },
    'configure' : null,
    fn : fn
  };
  Manifest.register(module);
});