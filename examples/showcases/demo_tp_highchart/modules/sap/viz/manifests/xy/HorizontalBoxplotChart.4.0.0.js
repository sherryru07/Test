sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.HorizontalBoxplotChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.HorizontalBoxplot',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.xy.BaseHorizontalChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.controller.Interaction',
  version : '4.0.0'
}
],
function Setup(Manifest) {
    var chart = {
      id : 'viz/horizontal_boxplot',
      name : 'IDS_HORIZONTALBOXPLOTCHART',
      base : 'riv/basehorizontalchart',
      modules : {
          tooltip : {
              id : 'sap.viz.modules.tooltip',
              configure : {
                propertyCategory : 'tooltip',
                properties : {
                  chartType : 'horizontalboxplot',
                  orientation : 'left'
                }
              }
          },
          main : {
              modules : {
                dataLabel:null,
                yAxis : {
                  id : 'sap.viz.modules.axis',
                  configure : {
                    properties : {
                      isIndependentMode : true
                    }
                  }
                },
                plot : {
                    id : 'sap.viz.modules.horizontalboxplot',
                    configure : {
                  'description': 'Settings regarding the chart area and plot area as well as general chart options.',
                        propertyCategory : 'plotArea'
                    }
                }
              },
          controllers : {
              'interaction' : {
                    id : 'sap.viz.modules.controller.interaction',
                    configure : {
                          propertyCategory : 'interaction'
                    }
                }
        }
          }
      },

     dependencies : {
       attributes : [ {
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
              targetModule : 'main.yAxis',
              target : 'independentData',
              sourceModule : 'main.plot',
              source : 'dimensionData'
          },{
            targetModule : 'legend',
            target : 'colorPalette',
            sourceModule : 'main.plot',
            source : 'colorPalette'
          }, {
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
            type : 'initialized'
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
        }
          ]
        }
    };
    Manifest.register(chart);
});