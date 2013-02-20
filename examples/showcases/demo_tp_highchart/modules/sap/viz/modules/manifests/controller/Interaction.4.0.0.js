sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.controller.Interaction',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.controller.interaction',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.controller.Base',
  version : '4.0.0'
}
],
function Setup(Manifest, fn) {
  var module = {
    'id' : 'sap.viz.modules.controller.interaction',
    'name' : 'selection',
    'base' : "sap.viz.modules.controller.base",
    'description': 'Settings for the interactions of the chart.',
    'properties' : {
      'selectability' : {
        'name' : 'selectability',
        'supportedValueType': 'Object',
        'supportedValues': {
          mode: {
             'name' : 'mode',
            'supportedValueType' : 'List',
            'supportedValues' : [ 'single', 'multiple', 'none' ],
            'defaultValue' : 'multiple',
            'description' : 'Set the selection mode. Single means you only can select one at the same time. Multiple means you can select several ones. None means you can not select anything. '
          },
          selectWithCtrlKey: {
            name:"selectWithCtrlKey",
            supportedValueType:"Boolean",
            defaultValue: false,
            description: "Set whether lasso selection needs ctrl key pressed.",
            isExported: false
          }
        },
        'description': 'Settings for selectability.'
      },
      supportedEventNames:{
        name: "supportedEventNames",
        supportedValueType: "StringArray",
        supportedValues: ['mouseup','mousemove','mouseout','mouseover','touchstart'],
        defaultValue:['mouseup', 'mousemove', 'mouseout', 'mouseover','touchstart'],
        description: "Set supported event names.",
        isExported: false
      },
      enableMouseMove:{
        name: "enableMouseMove",
        supportedValueType: "Boolean",
        defaultValue:true,
        description: "Set whether mouse move is enabled.",
        isExported: false
     },
      enableMouseOver:{
        name: "enableMouseOver",
        supportedValueType: "Boolean",
        defaultValue:true,
        description: "Set whether mouse over is enabled.",
        isExported: false
      },
      enableMouseOut:{
        name: "enableMouseOut",
        supportedValueType: "Boolean",
        defaultValue:true,
        description: "Set whether mouse out is enabled.",
        isExported: false
      },
      supportLassoEvent:{
        name: "supportLassoEvent",
        supportedValueType: "Boolean",
        defaultValue:true,
        description: "Set whether support lasso event is enabled.",
        isExported: false
      },
      holdSelection:{
        name: "holdSelection",
        supportedValueType: "Boolean",
        defaultValue:false,
        description: "Set whether hold selection is enabled.",
        isExported: false
      },
      preserveSelectionWhenDragging:{
        name: "preserveSelectionWhenDragging",
        supportedValueType: "Boolean",
        defaultValue:false,
        description: "Set whether preserve selection when dragging is enabled.",
        isExported: false
      }
    },
    'fn' : fn
  };

  Manifest.register(module);
});