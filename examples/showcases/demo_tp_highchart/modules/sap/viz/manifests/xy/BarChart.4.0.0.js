sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.BarChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.Bar',
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
      id : 'viz/bar',
      name : 'IDS_BARCHART',
      base : 'riv/basehorizontalchart',
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
                    id : 'sap.viz.modules.bar',
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
          targetModule : 'main.xAxis',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'primaryScale'
        }, {
          targetModule : 'main.xAxis',
          target : 'color',
          sourceModule : 'main.plot',
          source : 'primaryAxisColor'
        }, {
          targetModule : 'main.yAxis',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'categoryScale'
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
        }, 
        {
          targetModule : 'main.interaction',
          listener : 'registerEvent',
          sourceModule : 'main.plot',
          type : 'initialized.interaction'
        },{
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