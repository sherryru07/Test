sap.riv.module(
{
  qname : 'sap.viz.manifests.MultiBarChart',
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
{  qname : 'sap.viz.modules.manifests.xy.Bar',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.controller.Interaction',
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
    id : 'viz/multi_bar',
    name : 'IDS_MULTIBARCHART',
    base : 'riv/base/multiple/xy',
    modules : {
      legend : {
        data : {
          aa : [ 3 ]
        }
      },
      tooltip : {
        configure : {
          properties : {
            chartType : 'bar',
            orientation : 'left'
          }
        }
      },
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
        configure : {
          properties : {
            'mergeDataRange' : ['primary']
          }
        },
        modules: {
          plot : {
            id : 'sap.viz.modules.xycontainer',
            modules : {
              background : {
                configure : {
                  properties : {
                    direction : 'horizontal'
                  }
                }
              },
              dataLabel : {
                id : 'sap.viz.modules.datalabel',
                configure : {
                  propertyCategory : 'dataLabel',
                  properties : {
                    orientation : 'horizontal',
                    outsidePosition : 'right'
                  }
                }
              },
              xAxis : {
                id : 'sap.viz.modules.axis',
                configure : {
                  'description':'Settings for the value axis of an XY chart.',
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
              /**
               * 'xAxis2' : { },
               */
    
              yAxis : {
                id : 'sap.viz.modules.axis',
                data : {
                  aa : [ 1 ]
                },
                configure : {
                  'description':'Settings for the category axis of an XY chart.',
                  propertyCategory : 'yAxis',
                  properties : {
                    type : 'category',
                    position : 'left',
                    gridline : {
                      visible : false
                    }
                  },
                  propertiesOverride : {
                    title : {
                      isExported : false
                    },
                    gridline : {
              isExported : false
              },
              label : {
                    isExported : false
                    },
                    axisline : {
                    isExported : false
                   }
                  }
                }
              },
              
              plot : {
                id : 'sap.viz.modules.bar',
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
      max:1
     },
      secondaryValues: null,
      axisLabels:{
        max:1
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
        target : 'primaryDataRange',
        sourceModule : 'main.plot.plot',
        source : 'primaryDataRange'
      },
      {
        targetModule : 'main.plot.plot',
        target : 'primaryDataRange',
        sourceModule : 'main',
        source : 'primaryDataRange'
      },
      {
        /**
         * [jimmy/8/8/2012]each node in the path may have several entities
         * like main.plot, we may create several main.plots
         * (here the xycontainer), by using 'main.plot.xAxis'
         * here we actually means for xAxis in each main.plot
         * 
         * in the future, we may need support more complicated dependency resolving
         * like 'the 3rd xycontainer's xAxis', can be described
         * as main.plot[2].xAxis
         */
        targetModule : 'main.plot.xAxis',
        target : 'scale',
        sourceModule : 'main.plot.plot',
        source : 'primaryScale'
      }, { 
    targetModule : 'main.plot.xAxis',
    target : 'title',
        sourceModule : 'main.plot.plot',
        source : 'primaryAxisTitle'
      }, {
        targetModule : 'main.plot.yAxis',
        target : 'scale',
        sourceModule : 'main.plot.plot',
        source : 'categoryScale'
      }, {
        targetModule : 'legend',
        target : 'colorPalette',
        sourceModule : 'main.plot.plot',
        source : 'colorPalette'
      }, {
        targetModule : 'legend',
        target : 'setSelectionMode',
        sourceModule : 'main.interaction',
        source : 'getSelectionMode'
    }
      ],
      events : [ {
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