sap.riv.module(
{
  qname : 'sap.viz.manifests.MultiScatterChart',
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
{  qname : 'sap.viz.manifests.BaseMultipleChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.BaseMultipleXYChart',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var multiBarChart = {
    id : 'viz/multi_scatter',
    name : 'IDS_MULTISCATTERCHART',
    base : 'riv/base/multiple/xy',
   
    modules : {
      legend : {
        data : {
          aa : [ 2,3 ]
        },
        configure : {
         properties : {
            type : 'BubbleColorLegend'
          }
        }
      },
      tooltip : {
        configure : {
          properties : {
            chartType : 'scatter',
            orientation : 'left'
          }
        }
      },
      main : {
        controllers : {
            'interaction' : { 
                    id : 'sap.viz.modules.controller.interaction',
                configure : { 
                    propertyCategory :'interaction'
                }
            }
        },
          
        configure : {
          properties : {
            'mergeDataRange' : ['valueAxis1', 'valueAxis2']
          }
        },
        modules: {
          plot : {
            id : 'sap.viz.modules.xycontainer',
            modules : {
              xAxis : {
                id : 'sap.viz.modules.axis',
                configure : {
                'description': 'Settings for the x axis of a normal bubble or scatter plot.',
                 propertyCategory : 'xAxis',
                  properties : {
                    title : {
                      visible : false
                    },
                    type : 'value',
                    position : 'bottom'
                  },
                  propertiesOverride : {
                    title : {
                      isExported : false
                    }                    
                  }
                }
              },
              dataLabel : {
                id : 'sap.viz.modules.datalabel',
                configure : {
                  propertyCategory : 'dataLabel',
                  properties : {
                    automaticInOutside : false,
                    orientation : 'vertical',
                    position : 'outside',
                    outsideVisible : true
                  }
                }
              },
              /**
               * 'xAxis2' : { },
               */
    
              yAxis : {
                id : 'sap.viz.modules.axis',
                configure : {
                'description': 'Settings for the y axis of a normal bubble or scatter plot.',
                  propertyCategory : 'yAxis',
                  properties : {
                    title : {
                      visible : false
                    },
                    type : 'value',
                    position : 'left'
                  },
                  propertiesOverride : {
                    title : {
                      isExported : false
                    }                    
                  }
                }
              },
              
              plot : {
                id : 'sap.viz.modules.scatter',
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
       }
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
        targetModule : 'main.plot.xAxis',
        target : 'scale',
        sourceModule : 'main.plot.plot',
        source : 'valueAxis1Scale'
      }, {
        targetModule : 'main.plot.xAxis',
        target : 'title',
        sourceModule : 'main.plot.plot',
        source : 'valueAxis1Title'
      }, {
        targetModule : 'main.plot.yAxis',
        target : 'scale',
        sourceModule : 'main.plot.plot',
        source : 'valueAxis2Scale'
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
        targetModule : 'legend',
        target : 'setSelectionMode',
        sourceModule : 'main.interaction',
        source : 'getSelectionMode'
    }
      ],
      events : [  {
          targetModule : 'main.interaction',
          listener : 'registerEvent',
          sourceModule : 'main',
          type : 'initialized.interaction'
        }, {
            targetModule : 'tooltip',
            listener : 'showTooltip',
            sourceModule : 'main',
            type : 'showTooltip'
        }, {
            targetModule : 'tooltip',
            listener : 'hideTooltip',
            sourceModule : 'main',
            type : 'hideTooltip'
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
          targetModule : 'main.plot.dataLabel',
          listener : 'showLabel',
          sourceModule : 'main.plot.plot',
          type : 'initialized.datalabel'
        }, {
          targetModule : 'main.plot.dataLabel',
          listener : 'removeLabel',
          sourceModule : 'main.plot.plot',
          type : 'startToInit.datalabel'
        }]
    }
  };

  Manifest.register(multiBarChart);
});