sap.riv.module(
{
  qname : 'sap.viz.manifests.MultiHorizontalLineChart',
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
{  qname : 'sap.viz.modules.manifests.xy.HorizontalLine',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.BaseMultipleChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.MultiLineChart',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var multiBarChart = {
    id : 'viz/multi_horizontal_line',
    name : 'IDS_MULTIHORIZONTALLINECHART',
    base : 'viz/multi_line',
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
              dataLabel : {
                id : 'sap.viz.modules.datalabel',
                configure : {
                  propertyCategory : 'dataLabel',
                  properties : {
                    position : 'outside',
                    automaticInOutside : false,
                    orientation : 'horizontal',
                    outsidePosition : 'right',
                    positionPreference : true
                  }
                }
              },
              plot : {
                id : 'sap.viz.modules.horizontalline',
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
        targetModule : 'main.plot.xAxis',
        target : 'scale',
        sourceModule : 'main.plot.plot',
        source : 'primaryScale'
      }, {
        targetModule : 'main.plot.xAxis',
        target : 'title',
        sourceModule : 'main.plot.plot',
        source : 'primaryAxisTitle'
      },{
        targetModule : 'main.plot.yAxis',
        target : 'scale',
        sourceModule : 'main.plot.plot',
        source : 'categoryScale'
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
      } ]
    }
  };

  Manifest.register(multiBarChart);
});