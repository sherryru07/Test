sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.HorizontalCombinationChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Title',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Legend',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.XYContainer',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Tooltip',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Axis',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.HorizontalCombination',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.HorizontalLine',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.Bar',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.controller.Interaction',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.xy.BaseHorizontalChart',
  version : '4.0.0'
}
],
function Setup (Manifest) {
  var chart={
    base : 'riv/basehorizontalchart',
    id:'viz/horizontal_combination',
    name:'IDS_HORIZONTALCOMBINATIONCHART',
    modules:{
      tooltip : {
        configure : {
        properties : {
          chartType : 'horizontalline',
          orientation : 'left'
        }
        }
      },
      main:{
        controllers : {
          'interaction' : {
          id : 'sap.viz.modules.controller.interaction',
          configure : {
            propertyCategory : 'selectability'
          }
          }
        },        
        modules:{
          plot:{
            id:'sap.viz.modules.horizontalcombination',
            configure:{
                  'description': 'Settings regarding the chart area and plot area as well as general chart options.',
              propertyCategory:'plotArea'
            }
          },
          dataLabel : {
            id : 'sap.viz.modules.datalabel',
            configure : {
              propertyCategory : 'dataLabel',
              properties : {
                position : 'outside'
              }
            }
          }
        }
      }
    },
    feeds : {
        secondaryValues: null
    },
    dependencies:{
      attributes:[
        {
          targetModule : 'main.yAxis',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'categoryScale'
        },{
          targetModule : 'main.xAxis',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'primaryScale'
        },{
          targetModule : 'main.xAxis',
          target : 'title',
          sourceModule : 'main.plot',
          source : 'primaryAxisTitle'
        },{
          targetModule : 'legend',
          target : 'colorPalette',
          sourceModule : 'main.plot',
          source : 'colorPalette'
        },{
          targetModule:'legend',
          target:'shapes',
          sourceModule:'main.plot',
          source:'shapePalette'
        },{
            targetModule : 'legend',
            target : 'setSelectionMode',
            sourceModule : 'main.interaction',
            source : 'getSelectionMode'
        }
      ],
      events : [ 
        {
          targetModule : 'tooltip',
          listener : 'showTooltip',
          sourceModule : 'main.plot',
          type : 'showTooltip'
        }, {
          targetModule : 'tooltip',
          listener : 'hideTooltip',
          sourceModule : 'main.plot',
          type : 'hideTooltip'
        }, {
          targetModule : 'main.interaction',
          listener : 'registerEvent',
          sourceModule : 'main.plot',
          type : 'initialized.interaction'
        }, {
            targetModule : 'main.interaction',
            listener : 'highlightedByLegend',
            sourceModule : 'legend',
            type : 'highlightedByLegend'
        }, {
                targetModule : 'legend',
              listener : 'deselectLegend',
              sourceModule : 'main.interaction',
              type : 'deselectLegend'
        } , {
          targetModule : 'main.dataLabel',
          listener : 'showLabel',
          sourceModule : 'main.plot',
          type : 'initialized.datalabel'
        }, {
          targetModule : 'main.dataLabel',
          listener : 'removeLabel',
          sourceModule : 'main.plot',
          type : 'startToInit.datalabel'
        } 
      ]      
    }
  };

  Manifest.register(chart);
});