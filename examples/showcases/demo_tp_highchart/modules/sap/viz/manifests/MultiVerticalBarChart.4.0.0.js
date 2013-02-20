sap.riv.module(
{
  qname : 'sap.viz.manifests.MultiVerticalBarChart',
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
{  qname : 'sap.viz.modules.manifests.xy.VerticalBar',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.BaseMultipleChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.BaseMultipleXYChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.MultiBarChart',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var multiVBarChart = {
    id : 'viz/multi_column',
    name : 'IDS_MULTIVERTICALBARCHART',
    base : 'viz/multi_bar',
    modules : {
      tooltip : {
        configure : {
          properties : {
            chartType : 'verticalbar',
            orientation : 'left'
          }
        }
      },
      main : {
        modules: {
          plot : {
            modules : {
              background : {
                configure : {
                  properties : {
                    direction : 'vertical'
                  }
                }
              },
              dataLabel : {
                id : 'sap.viz.modules.datalabel',
                configure : {
                  propertyCategory : 'dataLabel',
                  properties : {
                    orientation : 'vertical',
                    outsidePosition : 'up'
                  }
                }
              },
              xAxis : {
                data : {
                  aa : [ 1 ]
                },
                configure : {
                  'description':'Settings for the category axis of an XY chart.',
                  properties : {
                    type : 'category',
                    gridline : {
                      visible : false
                    }
                  },
                  propertiesOverride : {                   
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
              /**
               * 'xAxis2' : { },
               */
    
              yAxis : {
                data : null,
                configure : {
                  'description':'Settings for the value axis of an XY chart.',
                  properties : {
                    type : 'value',
                    gridline : {
                      visible : true
                    }
                  },
                  propertiesOverride : {                   
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
              
              plot : {
                id : 'sap.viz.modules.verticalbar',
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
        axisLabels:{
        max:1
      },
      secondaryValues: null
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
        targetModule : 'main.plot.yAxis',
        target : 'scale',
        sourceModule : 'main.plot.plot',
        source : 'primaryScale'
      }, { targetModule : 'main.plot.yAxis',
        target : 'title',
        sourceModule : 'main.plot.plot',
        source : 'primaryAxisTitle'
      }, {
        targetModule : 'main.plot.xAxis',
        target : 'scale',
        sourceModule : 'main.plot.plot',
        source : 'categoryScale'
      }, {
        targetModule : 'legend',
        target : 'colorPalette',
        sourceModule : 'main.plot.plot',
        source : 'colorPalette'
      }
      ]
    }
  };

  Manifest.register(multiVBarChart);
});