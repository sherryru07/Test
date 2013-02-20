sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.ScatterMatrixContainer',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.scattermatrixcontainer',
  version : '4.0.0'
},
{  qname : 'sap.viz.feeds.ScatterMatrix',
  version : '4.0.0'
}
],
function Setup(Manifest, Constants, fn) {
    
    var module = {
      'id' : 'sap.viz.modules.scattermatrixcontainer',
        'type' : Constants.Module.Type.Container,
        'name' : 'Scatter Matrix Container',
        'description': 'Settings for the subcharts layout of Scatter Matrix chart.',
        'properties' : {
            'plotTitle' : {
              'name' : 'plotTitle',
        'description': 'Settings for plot title.',
              'supportedValueType' : 'Object',
              'supportedValues' : {
                'visible' : {
                  'name' : 'visible',
                  'supportedValueType' : 'Boolean',
                  'defaultValue' : true,
                  'description' : 'Set visibility of sub plot title.'
                }
              },
            }
        },
        'css' : {
            '.viz-matrix-sub-title' : {
                'description' : 'Define style for the sub plot title.',
                'value' : {
                    'fill' : 'black',
                    'font-family' : "'Open Sans', Arial, Helvetica, sans-serif",
                    'font-size' : '12px',
                    'font-weight' : 'bold'
                }
            }
        },
        'feeds' : { 
            id : 'scattermatrix'
        },
    'events' : {
      'showTooltip' : Constants.Module.Event.TooltipShow.desc,
      'hideTooltip' : Constants.Module.Event.TooltipHide.desc
    },
        'fn' : fn
    };
    Manifest.register(module);
});