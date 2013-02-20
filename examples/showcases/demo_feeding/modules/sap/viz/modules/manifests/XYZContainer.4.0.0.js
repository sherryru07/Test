sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.XYZContainer',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.xyzcontainer',
  version : '4.0.0'
}
],
function Setup(Manifest, Constants, fn) {
  var module = {
    'id' : 'sap.viz.modules.xyzcontainer',
    'type' : Constants.Module.Type.Container,
    'name' : 'single container',
    'properties' : {
			'xAngle': {
    				 name : 'xAngle',
    				 supportedValueType: 'Number',
    				 defaultValue: 20
			},
			'yAngle': {
				 name: 'yAngle',
				 supportedValueType: 'Number',
				 defaultValue : 50
			}
    },
    'css' : null,
    'configure' : null,
    'events' : {
      'showTooltip' : Constants.Module.Event.TooltipShow.desc,
      'hideTooltip' : Constants.Module.Event.TooltipHide.desc
    },
    fn : fn
  };

  Manifest.register(module);
});