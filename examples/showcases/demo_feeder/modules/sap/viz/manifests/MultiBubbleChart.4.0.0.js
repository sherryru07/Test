sap.riv.module(
{
  qname : 'sap.viz.manifests.MultiBubbleChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.BaseChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.XYContainer',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.TableContainer',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Axis',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Scatter',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.MultiScatterChart',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var multiBarChart = {
    id : 'viz/multi_bubble',
    name : 'IDS_MULTIBUBBLECHART',
    base : 'viz/multi_scatter',
    modules : {
      legend : {
        data : {
          aa : [ 2, 3 ]
        }
      },
      sizeLegend : {
        id : 'sap.viz.modules.legend',
        configure : {
          'description': 'The size legend is a box mapping the charts data shapes\' size to the value by some typical symbols and associated indication values.',
          propertyCategory : 'sizeLegend',
          properties : {
            type : 'SizeLegend'
          }
        }
      },
      tooltip : {
        configure : {
          properties : {
            chartType : 'bubble',
            orientation : 'left'
          }
        }
      },
      main : {
        configure : {
          properties : {
            'mergeDataRange' : ['valueAxis1', 'valueAxis2', 'bubbleWidth', 'bubbleHeight']
          }
        },
        modules: {
          plot : {
            id : 'sap.viz.modules.xycontainer',
            modules : {
              dataLabel : {
                id : 'sap.viz.modules.datalabel',
                configure : {
                  propertyCategory : 'dataLabel',
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
        }
      }
    },
    feeds:{
        multiplier:{
          acceptMND:-1
         },
         secondaryValues: {
         max: 1
      }// or null
    },
    dependencies : {
      attributes : [
      {
        targetModule : 'main.xAxis2',
        target : 'scale',
        sourceModule : 'main',
        source : 'xCategoryScale'
      }, 
      {
        targetModule : 'main.yAxis',
        target : 'scale',
        sourceModule : 'main',
        source : 'yCategoryScale'
      },
      {
        targetModule : 'main',
        target : 'valueAxis1DataRange',
        sourceModule : 'main.plot.plot',
        source : 'valueAxis1DataRange'
      },
      {
        targetModule : 'main.plot.plot',
        target : 'valueAxis1DataRange',
        sourceModule : 'main',
        source : 'valueAxis1DataRange'
      },
      {
        targetModule : 'main',
        target : 'valueAxis2DataRange',
        sourceModule : 'main.plot.plot',
        source : 'valueAxis2DataRange'
      },
      {
        targetModule : 'main.plot.plot',
        target : 'valueAxis2DataRange',
        sourceModule : 'main',
        source : 'valueAxis2DataRange'
      },
      {
        targetModule : 'main',
        target : 'bubbleWidthDataRange',
        sourceModule : 'main.plot.plot',
        source : 'bubbleWidthDataRange'
      },
      {
        targetModule : 'main.plot.plot',
        target : 'bubbleWidthDataRange',
        sourceModule : 'main',
        source : 'bubbleWidthDataRange'
      },
      {
        targetModule : 'main',
        target : 'bubbleHeightDataRange',
        sourceModule : 'main.plot.plot',
        source : 'bubbleHeightDataRange'
      },
      {
        targetModule : 'main.plot.plot',
        target : 'bubbleHeightDataRange',
        sourceModule : 'main',
        source : 'bubbleHeightDataRange'
      },
      {
        targetModule : 'main.plot.xAxis',
        target : 'scale',
        sourceModule : 'main.plot.plot',
        source : 'valueAxis1Scale'
      }, {
        targetModule : 'main.plot.yAxis',
        target : 'scale',
        sourceModule : 'main.plot.plot',
        source : 'valueAxis2Scale'
      }, {
        targetModule : 'main.plot.xAxis',
        target : 'title',
        sourceModule : 'main.plot.plot',
        source : 'valueAxis1Title'
      }, {
        targetModule : 'main.plot.yAxis',
        target : 'title',
        sourceModule : 'main.plot.plot',
        source : 'valueAxis2Title'
      }, {
        targetModule : 'legend',
        target : 'colorPalette',
        sourceModule : 'main.plot.plot',
        source : 'colorPalette'
      }, {
        targetModule : 'legend',
        target : 'shapes',
        sourceModule : 'main.plot.plot',
        source : 'shapes'
      }, {
          targetModule : 'sizeLegend',
          target : 'sizeLegendInfo',
          sourceModule : 'main.plot.plot',
          source : 'sizeLegend'
        }
      ]
    }
  };

  Manifest.register(multiBarChart);
});