sap.riv.module(
{
  qname : 'sap.viz.modules.Constants',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.Constants',
  version : '4.0.0'
}
],
function Setup(constants) {
  var moduleConstants = {
    Type : {
      Chart : 'CHART',
      Container : 'CONTAINER',
      Supplementary : 'SUPPLEMENTARY',
      Controller : 'CONTROLLER',
      ThirdParty : 'THIRDPARTY'
    },
    CSS : {
      CLASS : {
        DATAPOINT : "datapoint"
      }
    },
    Event : {
      SelectData : {
        name: 'selectData',
        desc : 'Event fired when certain data point(s) is(are) selected, data context of selected item(s) would be passed in accordance with the following format.'
          + '<code>{name: "selectData",'
          + 'data:[{\n//selected element\'s detail\n'
          + 'target:"Dom Element",//an object pointed to corresponding dom element\n'
          + 'data:[{val: "...",//value of this element\n'
          + 'ctx:{type:"Dimension"||"Measure"||"MND",\n'
          + '//for Dimension\n'
          + 'path:{aa:"...",di:"...",dii:"..."},\n'
          + '//for Measure\n'
          + 'path:{mg:"...",mi:"...",dii_a1:"...",dii_a2:"..."},\n'
          + '//for MND\n'
          + 'path:{mg:"...",mi:"..."}\n'
          + '//path: analysis path\n'
          + '//aa: analysis axis index // 0 for analysis axis 1,  1 for analysis 2\n'
          + '//di: dimension index //zero based\n'
          + '//dii: dimension item index //zero based\n'
          + '//mg: measure group index // 0 for measure group 1,1 for measure group 2\n'
          + '//mi: measure index // measure index in measure group zero based\n'
          + '//dii_a1: each dii of di in analysis axis 1 index\n'
          + '//dii_a2: each dii of di in analysis axis 2 index\n'
          + '}},{\n//for bubble, tagcloud and scatter, there will be more than one values in one selected element.\n'
          + 'var:"...",ctx:"..."}]},{\n//if under multi selection, there will be more than one selected elements\n'
          + 'target:"...",data:["..."]}]}'
      },
      DeSelectData : {
        name: 'deselectData',
        desc : 'Event fired when certain data point(s) is(are) deselected, data context of deselected item(s) would be passed in accordance with the following format.'
          + '<code>{name: "deselectData",'
          + 'data:["---the same as selectedData---"]}'
      },
      TooltipShow : {
        name: 'showTooltip',
        desc : 'Event fired when the mouse hover onto the specific part of chart, data context of tooltip would be passed in accordance with the following format.'
          + '<code>{name:"showTooltip",data:{body:[{\n//data of one group\n'
          + 'name:"...",val:[{\n//data of one row\n'
          + 'color:"...",label:"...",shape:"...",value:"..."},"..."]},"..."],footer:[{label:"...",value:"..."},"..."],'
          + 'plotArea:{\n//this object specifies the plot area of the chart\n'
          + 'height:"...",width:"...",x:"...",y:"..."},point:{\n//this object specifies a point which affects the position of tooltip\n'
          + 'x:"...",y:"..."}}}'
      },
      TooltipHide : {
        name: 'hideTooltip',
        desc : 'Event fired when the mouse hover out of the specific part of chart, no data is passed.'
      },
      Initialized : {
        name: 'initialized',
        desc : 'Event fired when the loading ends.'
      },
      highlightedByLegend : {
        desc : "Event fired when legend item is clicked, which contains its data context."
      }   
    }
  };

  constants.Module = moduleConstants;

  return moduleConstants;
});