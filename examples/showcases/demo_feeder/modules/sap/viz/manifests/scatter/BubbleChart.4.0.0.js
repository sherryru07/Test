sap.riv.module(
{
  qname : 'sap.viz.manifests.scatter.BubbleChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.scatter.BaseBubbleChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Bubble',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var chart = {
    id : 'viz/bubble',
    name : 'IDS_BUBBLECHART',
    base : "viz/scatter/single/base",
    modules : {
      sizeLegend : {
        id : 'sap.viz.modules.legend',
        configure : {
          'description': 'The size legend is a box mapping the charts data shapes\' size to the value by some typical symbols and associated indication values.',
          propertyCategory : 'sizeLegend',
          properties : {
            type : 'SizeLegend'
          },
          propertiesOverride :{
            isHierarchical : {
                  isExported : false
              },
            formatString: {
              isExported: true
            }
          }

        }
      },
      tooltip : {
        configure : {
          properties : {
            chartType : 'bubble'
          }
        }
      },
      main : {
        modules : {
          dataLabel : {
            id : 'sap.viz.modules.datalabel',
            configure : {
              properties : {
                automaticInOutside : true
              }
            }
          },
          plot : {
            id : 'sap.viz.modules.bubble',
            configure : {
                'description': 'Settings regarding the chart area and plot area as well as general chart options.',
              propertyCategory : 'plotArea'
            }
          }
        }
      }
    },
    dependencies : {
      attributes : [  
        undefined, undefined, undefined, undefined, undefined, undefined, undefined,
     {
        targetModule : 'sizeLegend',
        target : 'sizeLegendInfo',
        sourceModule : 'main.plot',
        source : 'sizeLegend'
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
      } ]
    }
  };

  Manifest.register(chart);
});