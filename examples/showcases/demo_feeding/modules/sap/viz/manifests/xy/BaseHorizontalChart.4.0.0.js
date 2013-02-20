sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.BaseHorizontalChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Title',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Legend',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.XYContainer',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Tooltip',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Axis',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Background',
  version : '4.0.0'
}
],
function Setup(Manifest) {
    var chart = {
      id : 'riv/basehorizontalchart',
      name : 'IDS_BASEHORIZONTALCHART',
     'abstract' : true,
      modules : {
        title : {
          id : 'sap.viz.modules.title',
          configure : {
              propertyCategory : 'title'
          }
        },
        legend : {
          id : 'sap.viz.modules.legend',
          data : {
              aa : [ 2 ]
          },
          configure : {
              propertyCategory : 'legend'
          }
        },
        tooltip : {
          id : 'sap.viz.modules.tooltip',
          configure : {
            propertyCategory : 'tooltip',
            properties : {
              chartType : 'bar',
              orientation : 'left'
            }
          }
        },
        /**
             * 'sizeLegend' : {}
             */
        main : {
          id : 'sap.viz.modules.xycontainer',
          modules : {
            dataLabel : {
              id : 'sap.viz.modules.datalabel',
              configure : {
                propertyCategory : 'dataLabel',
                properties : {
                  paintingMode : 'rect-coordinate',
                  visible : false,
                  orientation : 'horizontal',
                  position : 'inside',
                  automaticInOutside : true,
                  showZero : true,
                  isStackMode : false,
                  isPercentMode : false,
                  outsideVisible : true,
                  outsidePosition : 'right'
                }
              }
            },
            xAxis : {
              id : 'sap.viz.modules.axis',
              configure : {
              'description': 'Settings for the value axis of an XY chart.',
                propertyCategory : 'xAxis',
                properties : {
                  type : 'value',
                  position : 'bottom'
                }
              }
            },

            yAxis : {
              id : 'sap.viz.modules.axis',
              data : {
                  aa : [ 1 ]
              },
              configure : {
              'description': 'Settings for the category axis of an XY chart.',
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
      }
          }
        }
      },
      
      dependencies : {
        attributes : [ {
          targetModule : 'main.xAxis',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'primaryScale'
        },{
          targetModule : 'main.yAxis',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'categoryScale'
        },{
          targetModule : 'legend',
          target : 'colorPalette',
          sourceModule : 'main.plot',
          source : 'colorPalette'
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