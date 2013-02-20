sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.xy.StackedBar',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.stackedbar',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.Bar',
  version : '4.0.0'
}
],
function Setup(Manifest, fn) {
    var module = {
      'id' : 'sap.viz.modules.stackedbar',
      'name' : 'stacked bar',
      base : "sap.viz.modules.bar",
      'properties' : {
        'mode' : {
          'name' : 'mode',
          'supportedValueType' : 'List',
          'supportedValues' : [ 'comparison', 'percentage' ],
          'defaultValue' : 'comparison',
          'description' : 'Set dispaly mode of stacked bar.',
          'isExported' : true
        }
      },
      fn : fn
    };

    Manifest.register(module);
});