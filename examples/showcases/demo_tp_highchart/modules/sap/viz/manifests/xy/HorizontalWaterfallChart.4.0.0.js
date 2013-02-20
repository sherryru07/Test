sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.HorizontalWaterfallChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.StackedWaterfall',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.xy.BaseHorizontalChart',
  version : '4.0.0'
}
],
function Setup(Manifest) {
    var chart = {
      id : 'viz/horizontal_waterfall',
      name : 'IDS_HORIZONTALWATERFALLCHART',
      base : 'riv/basehorizontalchart',
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
                        properties : {
                          'isHorizontal' : true
                        },
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
            targetModule : 'main.xAxis',
            target : 'scale',
            sourceModule : 'main.plot',
            source : 'primaryScale'
          },{
            targetModule : 'main.yAxis',
            target : 'scale',
            sourceModule : 'main.plot',
            source : 'categoryScale'
          },null,{
        targetModule : 'main.xAxis',
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