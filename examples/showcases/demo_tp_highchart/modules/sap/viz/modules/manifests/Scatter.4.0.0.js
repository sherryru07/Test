sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.Scatter',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Bubble',
  version : '4.0.0'
}
],
function Setup(Manifest, Constants) {
  var module = {
    'id' : 'sap.viz.modules.scatter',
    base : 'sap.viz.modules.bubble',
    'name' : 'scatter',
    'properties' : {
        'markerSize' : {
            'name' : 'markerSize',
              'supportedValueType' : 'PositiveInt',
              'defaultValue' : "10",
              'description' : 'Set marker size of data point. The available range is from 4 to 32.'
        }
    },
    'feeds' : {
      configure : {
        bubbleWidth : null,
        bubbleHeight : null
      }
    }
  };
  Manifest.register(module);
});