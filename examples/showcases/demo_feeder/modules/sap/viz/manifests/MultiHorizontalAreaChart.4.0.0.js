sap.riv.module(
{
  qname : 'sap.viz.manifests.MultiHorizontalAreaChart',
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
{  qname : 'sap.viz.modules.manifests.xy.Area',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.BaseMultipleChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.MultiAreaChart',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var multiAreaChart = {
    id : 'viz/multi_horizontal_area',
    name : 'IDS_MULTIHORIZONTALAREACHART',
    base : 'viz/multi_area',
    modules : {
      tooltip : {
        configure : {
          properties : {
            chartType : 'horizontalline',
            orientation : 'left'
          }
        }
      },  
      main : {
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
              xAxis : {
                id : 'sap.viz.modules.axis',
                data : null,
                configure : {
                  'description':'Settings for the value axis of an XY chart.',
                  propertyCategory : 'xAxis',
                  properties : {
                    gridline : {
                      visible : true
                    },
                    type : 'value',
                    position : 'bottom'
                  },
                  propertiesOverride : {
                    title : {
                      isExported : false
                    },
                    gridline : {
                      isExported : true
                    },
                    label : {
                      isExported : true
                    },
                      axisline : {
                      isExported : true
                    }
                  }
                }
              },

              yAxis : {
                id : 'sap.viz.modules.axis',
                data : {
                  aa : [ 1 ]
                }, 
                configure : {
                  'description':'Settings for the catetory axis of an XY chart.',
                  propertyCategory : 'yAxis',
                  properties : {
                      gridline : {
                      visible : false
                    },
                    type : 'category',
                    position : 'left'
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
              dataLabel : {
                id : 'sap.viz.modules.datalabel',
                configure : {
                  propertyCategory : 'dataLabel',
                  properties : {
                    position : 'outside',
                    orientation : 'horizontal',
                    automaticInOutside : false,
                    outsidePosition : 'left'
                  },
                  propertiesOverride:{
                    position : {
                      isExported : false
                    }
                  }
                }
              },             
              plot : {
                id : 'sap.viz.modules.area',
                configure : {
              'description': 'Settings regarding the chart area and plot area as well as general chart options.',
                  propertyCategory : 'plotArea',
                   properties : {
                   orientation: 'horizontal'
                  }
                }
              }
            }
            
          }
        }
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
        targetModule : 'main.plot.yAxis',
        target : 'scale',
        sourceModule : 'main.plot.plot',
        source : 'categoryScale'
      }, {
        targetModule : 'main.plot.xAxis',
        target : 'scale',
        sourceModule : 'main.plot.plot',
        source : 'primaryScale'
      }, {
        targetModule : 'main.plot.xAxis',
        target : 'title',
        sourceModule : 'main.plot.plot',
        source : 'primaryAxisTitle'
      },
      {
        targetModule : 'legend',
        target : 'colorPalette',
        sourceModule : 'main.plot.plot',
        source : 'getColorPalette'
      },
      {
        targetModule : 'legend',
        target : 'shapes',
        sourceModule : 'main.plot.plot',
        source : 'shapePalette'
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
        } , {
          targetModule : 'main.interaction',
        listener : 'highlightedByLegend',
        sourceModule : 'legend',
        type : 'highlightedByLegend'
      }, {
          targetModule : 'legend',
        listener : 'deselectLegend',
        sourceModule : 'main.interaction',
        type : 'deselectLegend'
        }]
    }
  };

  Manifest.register(multiAreaChart);
});