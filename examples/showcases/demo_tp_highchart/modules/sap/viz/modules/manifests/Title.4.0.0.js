sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.Title',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.title',
  version : '4.0.0'
}
],
function Setup(Manifest, Constants, fn) {
  var module = {
    'id' : 'sap.viz.modules.title',
    'type' : Constants.Module.Type.Supplementary,
    'name' : 'title',
    'description': "Settings for the chart's main title.",
    'properties' : {
      'visible' : {
        'name' : 'visible',
        'supportedValueType' : 'Boolean',
        'defaultValue' : false,
        'description' : 'Set visibility of chart title.'
      },
      'text' : {
        'name' : 'text',
        'supportedValueType' : 'String',
        'defaultValue' : null,
        'description' : 'Set chart title text.'
      },
      'alignment' : {
        'name' : 'alignment',
        'supportedValueType' : 'List',
        'supportedValues' : [ 'left', 'center', 'right' ],
        'defaultValue' : 'center',
        'description' : 'Set chart title alignment.'
      }
    },
    'css' : {
      '.viz-title-label' : {
        'description' : 'Define style for the title label.',
        'value' : {
          'font-family' : "'Open Sans', Arial, Helvetica, sans-serif",
          'font-size' : '16px',
          'font-weight' : 'bold',
          'fill' : '#333333'
        }
      }
    },
    'configure' : null,
    fn : fn
  };

  Manifest.register(module);
});