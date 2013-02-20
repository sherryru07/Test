sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.TableContainer',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.tablecontainer',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.feed.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
}
],
function Setup(Manifest, moduleConstants, fn, feedConstants, Constants) {
    var multiplierFeed = {
    'id' : 'multiplier',
    'name' : 'Chart Multiplier',
    'type' : feedConstants.Type.Dimension,
    'min' : 1,
    'max' : 1,
    'aaIndex' : 1,
    'acceptMND' : 0
  };

  var module = {
    'id' : 'sap.viz.modules.tablecontainer',
    'type' : moduleConstants.Type.Container,
    'name' : 'table container',
    'description': 'Settings for the subcharts layout of multiple charts.',
    //TODO support different layout: row/column/dimensional
    'properties' : {
      'mergeDataRange' : {
        'name' : 'mergeDataRange',
        'supportedValueType' : 'List',
        'supportedValues' : ['ANY DATA RANGE NAME'],
        'defaultValue' : null,
        'description' : 'Set mergeDataRange. Specify names of data range you want to merge, we will generate corresponding functions in this module to do the real merge. for example, if \'primary\' and \'second\' are specified here, two functions will be generated: \'primaryDataRange\' and \'secondDataRange\'. the function name is the range name plus \'DataRange\'. these generated functions support both getter and setter, for setter, you can pass any number of ranges {min:NUM, max:NUM} to it to merge, then you can get the merged result through the getter.',
        'isExported' : false
      },
      'numberOfDimensionsInColumn' : {
        'name' : 'numberOfDimensionsInColumn',
        'supportedValueType' : 'PositiveInt',
        'defaultValue' : 1,
        'description' : 'Set the specified number of dimensions, retrieved from the end of the dimension list in multiplier, will be put in column when doing multiple layout.'
      },
      'cellPadding' : {
        'name' : 'cellPadding',
        'supportedValueType' : 'PositiveInt',
        'defaultValue' : 15,
        'description' : 'Set padding between cells of sub plots. If cellPadding value exceeds containerSize * threshold, we set it to 0.'
      },
      'paddingThreshold' : {
        'name' : 'paddingThreshold',
        'supportedValueType' : 'Number',
        'defaultValue' : 0.2,
        'description' : 'Set paddingThreshold, if cellPadding value exceeds the containerSize * threshold, we set it to 0.',
        'isExported' : false
      }
    },
  'events' : {
      'showTooltip' : Constants.Module.Event.TooltipShow.desc,
      'hideTooltip' : Constants.Module.Event.TooltipHide.desc
   },
    //TODO
    'css' : null,
    'feeds' : [multiplierFeed],
    'fn' : fn
  };
  Manifest.register(module);
});