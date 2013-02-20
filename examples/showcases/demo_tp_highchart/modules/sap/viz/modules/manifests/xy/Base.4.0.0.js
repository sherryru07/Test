sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.xy.Base',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.feeds.XY',
  version : '4.0.0'
}
],
function Setup(Manifest, Constants) {
  var module = {
    'id' : 'sap.viz.modules.xy.base',
    'abstract' : true,
    'type' : Constants.Module.Type.Chart,
    'name' : 'xy base module',
    'datastructure' : 'DATA STRUCTURE DOC',
    'properties' : {  
    'colorPalette':
      {
         'name' : 'colorPalette',
          'supportedValueType' : 'StringArray',
          'defaultValue' : Constants.SAPColor,
          'description' : 'Set color palette for non_dual chart. Or dual chart\'s color palette if MND is on Category axis.'
      },
        'primaryValuesColorPalette' : {
          'name' : 'primaryValuesColorPalette',
          'supportedValueType' : 'StringArray',
          'defaultValue' : Constants.SAPColorDualAxis1,
          'description' : 'Set axis 1 color palette for dual chart.',
            'isExported' : false
        },  
        'secondaryValuesColorPalette' : {
          'name' : 'secondaryValuesColorPalette',
          'supportedValueType' : 'StringArray',
          'defaultValue' : Constants.SAPColorDualAxis2,
          'description' : 'Set axis 2 color palette for dual chart.',
            'isExported' : false
        },
        'drawingEffect':{
          'name' : 'drawingEffect',
           'supportedValueType' : 'List',
            'supportedValues' : [ 'normal', 'glossy' ],
            'defaultValue' : 'normal',
            'description' : 'Set drawing effect of XY.',
            'isExported' : true
        },
    },
    'events' : {
      'initialized': Constants.Module.Event.Initialized.desc,
      'selectData' : Constants.Module.Event.SelectData.desc,
      'deselectData' : Constants.Module.Event.DeSelectData.desc,
      'showTooltip' : Constants.Module.Event.TooltipShow.desc,
      'hideTooltip' : Constants.Module.Event.TooltipHide.desc
    },
    'feeds' : {
      id : "xy"
    },
    'css' : null,
    'configure' : null
  };

  Manifest.register(module);
});