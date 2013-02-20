sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.XYContainer',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.xycontainer',
  version : '4.0.0'
}
],
function Setup(Manifest, Constants, fn) {
  var module = {
    'id' : 'sap.viz.modules.xycontainer',
    'type' : Constants.Module.Type.Container,
    'name' : 'single container',
    'properties' : null,
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