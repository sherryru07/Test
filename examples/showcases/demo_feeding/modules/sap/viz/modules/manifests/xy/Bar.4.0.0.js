sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.xy.Bar',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.bar',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.BaseBar',
  version : '4.0.0'
}
],
function Setup(Manifest, fn) {
  var module = {
    'id' : 'sap.viz.modules.bar',
    'name' : 'bar',
    base : "sap.viz.modules.xy.bar.base",
    'properties' : {
      'fillMode' : {
        'name' : 'fillMode',
        'supportedValueType' : 'Object',
        'supportedValues' : {
          'image' : {
            'name' : 'image',
            'supportedValueType' : 'Boolean',
            'defaultValue' : false,
            'description' : 'Set enabled/disabled image fill.'
          },
          'imagePalette' : {
            'name' : 'imagePalette',
            'supportedValueType' : 'StringArray',
            'supportedValues' : [ 'image1.png', 'image2.png', 'image3.png', 'image4.png' ],
            'defaultValue' : [ 'http://www.sap.com/global/ui/images/global/sap-logo.png', 
                               'http://www.sap.com/global/ui/images/global/sap-logo.png', 
                               'http://www.sap.com/global/ui/images/global/sap-logo.png',
                               'http://www.sap.com/global/ui/images/global/sap-logo.png',
            ],
            'description' : 'images to fill the bar',
          } 
        },
        'isExported' : true,
        'description' : 'Settings for tooltip related properties.'
      }
    },
    fn : fn
  };

  Manifest.register(module);
});