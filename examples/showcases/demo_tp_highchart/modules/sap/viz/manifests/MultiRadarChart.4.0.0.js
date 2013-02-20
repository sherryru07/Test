sap.riv.module(
{
  qname : 'sap.viz.manifests.MultiRadarChart',
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
{  qname : 'sap.viz.modules.manifests.Radar',
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
},
{  qname : 'sap.viz.modules.manifests.Tooltip',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Background',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var multiRadarChart = {
    id : 'viz/multi_radar',
    name : 'IDS_MULTIRADARCHART',
    base : 'riv/base/multiple/xy',
    modules : {
      legend : {
        data : {
          aa : [ 3]
        }
      },
      tooltip : {
        id : "sap.viz.modules.tooltip",
        configure : {
          properties : {
            chartType : "radar",
            orientation : "left"
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
              dataLabel : {
                id : 'sap.viz.modules.datalabel',
                configure : {
                  propertyCategory : 'dataLabel',
                  properties : {
                    orientation : 'vertical',
                    position : 'outside',
                    automaticInOutside : false,
                    outsidePosition : 'up'
                  },
                  propertiesOverride : {
                    position : {
                      isExported : false
                    }                    
                  }
                }
              },
              plot : {
                id : 'sap.viz.modules.radar',
                configure : {
                  description: 'Settings regarding the chart area and plot area as well as general chart options.',
                  propertyCategory : "plotArea",
                  properties : {
                    multichart : true
                  }
                }
              },
              background : {
                configure : {
                  propertyCategory : 'background',
                  properties : {
                    visible : false
                  }
                }
              }
            }
          }
        }
      }
    },
    feeds : {
      multiplier : {
        acceptMND : 0,
        max : 2
      },
      
      regionShape : {
        max : 0
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
        targetModule : "legend",
        target : "colorPalette",
        sourceModule : "main.plot.plot",
        source : "colorPalette"
      }, 
      {
        targetModule : 'legend',
        target : 'shapes',
        sourceModule : 'main.plot.plot',
        source : 'shapes'
      }
      ], 
      events : [ 
      {
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

  Manifest.register(multiRadarChart);
});