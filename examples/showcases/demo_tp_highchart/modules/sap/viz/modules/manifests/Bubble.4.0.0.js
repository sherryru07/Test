sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.Bubble',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.bubble',
  version : '4.0.0'
},
{  qname : 'sap.viz.feeds.Scatter',
  version : '4.0.0'
}
],
function Setup(Manifest, Constants, fn) {
  var module = {
    'id' : 'sap.viz.modules.bubble',
    'type' : Constants.Module.Type.Chart,
    'name' : 'bubble',
    'data' : 'DATA STRUCTURE DOC',
    'properties' : {
      'colorPalette' : {
        'name' : 'colorPalette',
        'supportedValueType' : 'StringArray',
        'defaultValue' : Constants.SAPColor,
        'description' : 'Set marker color of bubble.'
      },
      'shapePalette' : {
        'name' : 'shapePalette',
        'supportedValueType' : 'StringArray',
        'defaultValue' : [ 'circle', 'square', 'diamond', 'triangle-up',
            'triangle-down', 'triangle-left', 'triangle-right', 'cross', 'intersection' ],
        'supportedValues' : [ 'circle', 'square', 'diamond', 'triangle-up',
              'triangle-down', 'triangle-left', 'triangle-right', 'cross', 'intersection' ],
        'description' : 'Set marker shape of bubble.'
      },
      'axisTooltip' : {
        'name' : 'axisTooltip',
        'supportedValueType' : 'Object',
        'supportedValues' : {
          'visible' : {
            'name' : 'visible',
            'supportedValueType' : 'Boolean',
            'defaultValue' : true,
            'description' : 'enabled/disabled tooltip.'
          },
          'formatString': {
      		'name' : 'formatString',
      		'supportedValueType': 'StringArray',
      		'defaultValue' : null,
      		'description' : 'Set format string for small tooltip.The first one is applied to xAxis and the second one is applied to yAxis'
          }
        },
        
        'description' : 'Set tooltip related properties.'
      },
      'animation' : {
          'name' : 'animation',
          'supportedValueType' : 'Object',
          'supportedValues' : {
            'dataLoading' : {
              'name' : 'dataLoading',
              'supportedValueType' : 'Boolean',
              'defaultValue' : true,
              'description' : 'enable/disable data loading animation of bubble/scatter.'
            },
            'dataUpdating' : {
              'name' : 'dataUpdating',
              'supportedValueType' : 'Boolean',
              'defaultValue' : true,
              'description' : 'enable/disable data updating animation of bubble/scatter.'
            }
          },
          'description' : 'Set animation of bubble/scatter.'
        },
        'drawingEffect':{
          'name' : 'drawingEffect',
           'supportedValueType' : 'List',
            'supportedValues' : [ 'normal', 'glossy' ],
            'defaultValue' : 'normal',
            'description' : 'Drawing effect of bubble marker.',
            'isExported' : true
        }
    },
    'events' : {
      'initialized': Constants.Module.Event.Initialized.desc,
        'selectData' : Constants.Module.Event.SelectData.desc,
        'deselectData' : Constants.Module.Event.DeSelectData.desc,
        'showTooltip' : Constants.Module.Event.TooltipShow.desc,
        'hideTooltip' : Constants.Module.Event.TooltipHide.desc
    },
    'feeds' : {
      id : "scatter",
      configure : {
        bubbleWidth:
        {
          min:1
        }
      }
    },
  
    'configure' : null,
    fn : fn
  };
  Manifest.register(module);
});