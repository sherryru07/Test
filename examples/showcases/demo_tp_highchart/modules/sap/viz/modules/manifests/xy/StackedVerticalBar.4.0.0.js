sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.xy.StackedVerticalBar',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.stackedverticalbar',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.VerticalBar',
  version : '4.0.0'
}
],
function Setup(Manifest, fn) {
    var module = {
      'id' : 'sap.viz.modules.stackedverticalbar',
      'name' : 'stacked vertical bar',
      base : "sap.viz.modules.verticalbar",
      'properties' : {
        'mode' : {
          'name' : 'mode',
          'supportedValueType' : 'List',
          'supportedValues' : [ 'comparison', 'percentage' ],
          'defaultValue' : 'comparison',
          'description' : 'Set dispaly mode of stacked vertical bar.',
            'isExported' : true
        }
      },
      fn : fn
    };

    Manifest.register(module);
});