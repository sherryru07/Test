sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.VerticalBarChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.VerticalBar',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.xy.BaseVerticalChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.controller.Interaction',
  version : '4.0.0'
}
],
function Setup(Manifest) {
    var chart = {
      id : 'viz/column',
      name : 'IDS_VERTICALBARCHART',
      base : 'riv/baseverticalchart',
      modules : {
          main : {
              controllers : {
                'interaction' : {
                  id : 'sap.viz.modules.controller.interaction',
                  configure : {
                    propertyCategory : 'interaction',
          properties : {}
                  }
                }
              },      
              modules : {
                plot : {
                    id : 'sap.viz.modules.verticalbar',
                    configure : {
                  'description': 'Settings regarding the chart area and plot area as well as general chart options.',
                        propertyCategory : 'plotArea'
                    }
                }
              }
          }
      },
      feeds:{
        secondaryValues:  null
      },
      dependencies : {
        attributes : [ {
          targetModule : 'main.plot',
          target : 'primaryDataRange',
          sourceModule : 'main.yAxis',
          source : 'range'
        }, {
          targetModule : 'main.yAxis',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'primaryScale'
        }, {
          targetModule : 'main.yAxis',
          target : 'color',
          sourceModule : 'main.plot',
          source : 'primaryAxisColor'
        }, {
          targetModule : 'main.xAxis',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'categoryScale'
        },{
      targetModule : 'main.yAxis',
       target : 'title',
       sourceModule : 'main.plot',
       source : 'primaryAxisTitle'
    },{
          targetModule : 'legend',
          target : 'colorPalette',
          sourceModule : 'main.plot',
          source : 'colorPalette'
        },{
        targetModule : 'legend',
        target : 'setSelectionMode',
        sourceModule : 'main.interaction',
        source : 'getSelectionMode'
        } ],
         events : [ {
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
      }, {
        targetModule : 'main.dataLabel',
        listener : 'showLabel',
        sourceModule : 'main.plot',
        type : 'initialized.datalabel'
      }, {
        targetModule : 'main.dataLabel',
        listener : 'removeLabel',
        sourceModule : 'main.plot',
        type : 'startToInit.datalabel'
      }]
      }
    };
    Manifest.register(chart);
});