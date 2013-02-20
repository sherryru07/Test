sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.TagCloud',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.tagcloud',
  version : '4.0.0'
},
{  qname : 'sap.viz.feeds.TagCloud',
  version : '4.0.0'
}
],
function Setup(Manifest, Constants, fn) {
  var module = {
    'id' : 'sap.viz.modules.tagcloud',
    'type' : Constants.Module.Type.Chart,
    'name' : 'tagcloud',
    'properties' : {
      'layout' : {
        'name' : 'layout',
        'supportedValueType' : 'List',
        'supportedValues' : [ 'Row', 'Column', 'Wordle' ],
        'defaultValue' : 'Wordle',
        'description' : 'Set layout fo tag cloud.'
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
            },
            'dataUpdating' : {
              'name' : 'dataUpdating',
              'supportedValueType' : 'Boolean',
              'defaultValue' : false,
              'description' : 'Set enabled/disabled data updating animation of plot area.'
            }
          },
          'description' : 'Settings for animation of plot area.'
        },
      'startColor' : {
          'name' : 'startColor',
          'supportedValueType' : 'String',
          'defaultValue' : "#C2E3A9",
          'description' : 'Set tagCloud start color.'
        },
        
        'endColor' : {
          'name' : 'endColor',
          'supportedValueType' : 'String',
          'defaultValue' : "#73C03C",
          'description' : 'Set tagCloud endcolor.'
        },
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
      id : "tagCloud"
    },
    'css' : {},
    'configure' : null,
    fn : fn
  };
  Manifest.register(module);
});