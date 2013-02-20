sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.StackedWaterfallChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.StackedWaterfall',
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
      id : 'viz/stacked_waterfall',
      name : 'IDS_STACKEDWATERFALLCHART',
      base : 'riv/baseverticalchart',
      modules : {
        main : {
        controllers : {
            'interaction' : {
              id : 'sap.viz.modules.controller.interaction',
              configure : {
                propertyCategory : 'interaction',
                properties : {
                  supportedEventNames: ['mouseup', 'mousemove', 'touchstart']
                }
              }
            }
          },
          modules : {
            plot : {
              id : 'sap.viz.modules.stackedwaterfall',
              configure : {
                  'description': 'Settings regarding the chart area and plot area as well as general chart options.',
                  propertyCategory : 'plotArea'
              }
            },
            dataLabel : {
              id : 'sap.viz.modules.datalabel',
              configure : {
                properties : {
                  automaticInOutside : false,
                  isStackMode : true,
                  showZero : false
                },
                propertiesOverride : {
                  position : {
                    isExported : false
                  }
                }
              }
            }
          }
        }
      },
      feeds : {
        axisLabels : {
          maxStackedDims : 1
        }
      },
      dependencies : {
        attributes : [ undefined, undefined, undefined,
         {
          targetModule : 'main.yAxis',
          target : 'title',
          sourceModule : 'main.plot',
          source : 'primaryAxisTitle'
        },{
          targetModule : 'main.yAxis',
          target : 'independentData',
          sourceModule : 'main.plot',
          source : 'dimensionData'
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
        } ]
      }
    };

    Manifest.register(chart);
});