sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.xy.Mekko',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.mekko',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.BaseBar',
  version : '4.0.0'
}
],
function Setup(Manifest, fn) {
	/**
	 * Mekko chart's feed defination is similar with bar chart. It accept a dimension axis and two measure value axis like dual bar chart.
	 */
  var module = {
    'id' : 'sap.viz.modules.mekko',
    'name' : 'mekko',
    base : "sap.viz.modules.xy.bar.base",
    'properties' : {
    	'mode' : {
            'name' : 'mode',
            'supportedValueType' : 'List',
            'supportedValues' : [ 'comparison', 'percentage' ],
            'defaultValue' : 'comparison',
            'description' : 'Set dispaly mode of mekko chart.'
          },
          'orientation' : {
            'name' : 'orientation',
            'supportedValueType' : 'List',
            'supportedValues' : [ 'vertical', 'horizontal' ],
            'defaultValue' : 'horizontal',
            'description' : 'vertical or horizontal mekko chart.'
          },
    },
    fn : fn
  };

  Manifest.register(module);
});