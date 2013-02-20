sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.HorizontalStackedWaterfallChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Axis',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.StackedWaterfall',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.xy.StackedWaterfallChart',
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
  var chart = {
    id : 'viz/horizontal_stacked_waterfall',
    name : 'IDS_HORIZONTALSTACKEDWATERFALL',
    base : "viz/stacked_waterfall",
    modules : {
      tooltip : {
        id : 'sap.viz.modules.tooltip',
        configure : {
          propertyCategory : 'tooltip',
          properties : {
            chartType : 'bar'
          }
        }
      },
      main : {
        modules : {
          plot : {
            id : 'sap.viz.modules.stackedwaterfall',
            configure : {
              propertyCategory : 'plotArea',
              properties : {
                'isHorizontal' : true
              }
            }
          },
          xAxis : {
            id : 'sap.viz.modules.axis',
            configure : {
              'description' : 'Settings for the value axis of an XY chart.',
              propertyCategory : 'xAxis',
              properties : {
                type : 'value',
                position : 'bottom',
                gridline : {
                  visible : true
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
              'description' : 'Settings for the category axis of an XY chart.',
              propertyCategory : 'yAxis',
              properties : {
                type : 'category',
                position : 'left',
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
          background : {
            id: 'sap.viz.modules.background',
            configure : {
              propertyCategory : 'background',
              properties : {
                direction : 'horizontal'
              }
            }
          },
          dataLabel : {
            id : 'sap.viz.modules.datalabel',
            configure : {
              properties : {
                automaticInOutside : false,
                isStackMode : true,
                showZero : false
              },
              propertiesOverride : {
                position : {
                  isExported : false
                }
              }
            }
          }
        }
      }
    },
    feeds : {
      axisLabels : {
        maxStackedDims : 1
      }
    },
    dependencies : {
      attributes : [ {
        targetModule : 'main.xAxis',
        target : 'scale',
        sourceModule : 'main.plot',
        source : 'primaryScale'
      }, {
        targetModule : 'main.yAxis',
        target : 'scale',
        sourceModule : 'main.plot',
        source : 'categoryScale'
      }, undefined, {
        targetModule : 'main.xAxis',
        target : 'title',
        sourceModule : 'main.plot',
        source : 'primaryAxisTitle'
      },{
        targetModule : 'main.xAxis',
        target : 'independentData',
        sourceModule : 'main.plot',
        source : 'dimensionData'
      } ]
    }
  };
  Manifest.register(chart);
});