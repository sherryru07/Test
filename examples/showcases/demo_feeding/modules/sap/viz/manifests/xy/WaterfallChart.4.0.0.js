sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.WaterfallChart',
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
}
],
function Setup(Manifest) {
    var chart = {
      id : 'viz/waterfall',
      name : 'IDS_WATERFALLCHART',
      base : 'riv/baseverticalchart',
      modules : {
          legend : null,        
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
                dataLabel : {
                  id : 'sap.viz.modules.datalabel',
                  configure : {
                    properties : {
                      automaticInOutside : false,
                      showZero : false,
                      outsideVisible : false
                    }
                  }
                },
                plot : {
                    id : 'sap.viz.modules.stackedwaterfall',
                    configure : {
                        'description': 'Settings regarding the chart area and plot area as well as general chart options.',
                        propertyCategory : 'plotArea',
                        propertiesOverride : {
                          isShowTotal : {
                            isExported : true
                          }
                        }
                    }
                }
              }
          }
      },
      feeds:{
        'regionColor' : null
      },
      dependencies : {
          attributes : [ {
            targetModule : 'main.yAxis',
            target : 'scale',
            sourceModule : 'main.plot',
            source : 'primaryScale'
          },{
            targetModule : 'main.xAxis',
            target : 'scale',
            sourceModule : 'main.plot',
            source : 'categoryScale'
          },null,{
      targetModule : 'main.yAxis',
            target : 'title',
            sourceModule : 'main.plot',
            source : 'primaryAxisTitle'
      }],
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