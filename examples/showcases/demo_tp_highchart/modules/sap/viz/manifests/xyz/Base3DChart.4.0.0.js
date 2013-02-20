sap.riv.module(
{
  qname : 'sap.viz.manifests.xyz.Base3DChart',
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
{  qname : 'sap.viz.modules.manifests.XYZContainer',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Axis',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Background',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xyz.Bar3D',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.controller.Interaction',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.controller.Rotate',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  return function(direction) {
    var isVertical = direction === "vertical";

    var categoryAxis, valueAxis;
    if (isVertical) {
      categoryAxis = "xAxis";
      valueAxis = "yAxis";
    } else {
      categoryAxis = "yAxis";
      valueAxis = "xAxis";
    }

    var chart = {
      id : 'viz/3d_' + (isVertical ? 'column' : 'bar'),
      name : 'IDS_3D_' + (isVertical ? 'COLUMN' : 'BAR'),
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
              orientation : 'left'
            }
          }
        },
        main : {
          id : 'sap.viz.modules.xyzcontainer',
          controllers : {
            'interaction' : {
              id : 'sap.viz.modules.controller.interaction',
              configure : {
                propertyCategory : 'interaction',
                properties : {
                  //supportedEventNames: ['mouseup', 'mousemove', 'touchstart'],
                  selectability: {
                    mode: 'multiple',
                    selectWithCtrlKey: true
                  },
                  preserveSelectionWhenDragging: true
                }
              }
            },
            
            'rotate': {
              id : 'sap.viz.modules.controller.rotate',
              configure : {
                propertyCategory: 'rotate'
              }
            }
          },
          modules : {
            plot : {
              id : 'sap.viz.modules.bar3d',
              configure : {
                'description' : 'Settings regarding the chart area and plot area as well as general chart options.',
                propertyCategory : 'plotArea',
                properties : {
                  direction : direction
                }
              }
            },
            zAxis : {
              id : 'sap.viz.modules.axis',
              configure : {
                'description' : 'Settings for the category axis of an XYZ chart.',
                propertyCategory : 'zAxis',
                properties : {
                  type : 'category',
                  position : 'bottom',
                  forceVerticalFont : true,
                  gridline : {
                    visible : false
                  },
                  shapeRendering : false,
                  isIndependentMode : true
                }
              }
            },

            background : {
              id : 'sap.viz.modules.background',
              configure : {
                propertyCategory : 'background',
                properties : {
                  direction : direction
                }
              }
            }
          },
       configure : {
                    propertyCategory : 'xyzcontainer',
                    properties : {
                      xAngle:20,
                      yAngle:50
                    }
           }
        }
      },
      dependencies : {
        attributes : [{
          targetModule : 'main',
          target : categoryAxis ,
          sourceModule : 'main.plot',
          source : 'primaryCategoryScale'
        }, {
          targetModule : 'main',
          target : valueAxis,
          sourceModule : 'main.plot',
          source : 'valueScale'
        },{
          targetModule : 'main.' + valueAxis,
          target : 'scale',
          sourceModule : 'main',
          source : valueAxis
        }, {
          targetModule : 'main.' + categoryAxis,
          target : 'scale',
          sourceModule : 'main',
          source : categoryAxis
        },{
          targetModule : 'main',
          target : 'zAxis',
          sourceModule : 'main.plot',
          source : 'secondaryCategoryScale'
        }, {
          targetModule : 'main.zAxis',
          target : 'scale',
          sourceModule : 'main',
          source : 'zAxis'
        },{
          targetModule : 'legend',
          target : 'colorPalette',
          sourceModule : 'main.plot',
          source : 'colorPalette'
        },{
          targetModule : 'main.zAxis',
          target : 'independentData',
          sourceModule : 'main.plot',
          source : 'secondaryCategoryData'
      },{
        targetModule : 'main.'+categoryAxis,
        target : 'independentData',
        sourceModule : 'main.plot',
        source : 'primaryCategoryData'
      } ],
        events : [ {
          targetModule : 'main.interaction',
          listener : 'registerEvent',
          sourceModule : 'main.plot',
          type : 'initialized.interaction'
        }, {
          targetModule : 'main.rotate',
          listener : 'registerEvent',
          sourceModule : 'main.plot',
          type : 'initialized.rotate'
        }, {
          targetModule : 'main',
          listener : isVertical? 'xAxisScaleChange': 'yAxisScaleChange',
          sourceModule : 'main.plot',
          type : 'primaryCategoryScaleChange.xyzcontainer'
        },{
          targetModule : 'main',
          listener : isVertical? 'yAxisScaleChange': 'xAxisScaleChange',
          sourceModule : 'main.plot',
          type : 'valueScaleChange.xyzcontainer'
        },{
          targetModule : 'main',
          listener : 'zAxisScaleChange',
          sourceModule : 'main.plot',
          type : 'secondaryCategoryScaleChange.xyzcontainer'
        },{
          targetModule : 'tooltip',
          listener : 'showTooltip',
          sourceModule : 'main.plot',
          type : 'showTooltip.tooltip'
        }, {
          targetModule : 'tooltip',
          listener : 'hideTooltip',
          sourceModule : 'main.plot',
          type : 'hideTooltip.tooltip'
        }]
      }
    };

    var modules = chart.modules.main.modules;

    modules[categoryAxis] = {
      id : 'sap.viz.modules.axis',
      data : {
        aa : [ 1 ]
      },
      configure : {
        'description' : 'Settings for the value axis of an XYZ chart.',
        propertyCategory : categoryAxis,
        properties : {
          type : 'category',
          isIndependentMode : true,
          position : isVertical ? 'bottom' : 'left',
          forceVerticalFont : (isVertical ? true : undefined),
          gridline : {
            visible : false,
            showFirstLine: (isVertical ? false : true),
            showLastLine: (isVertical ? false : true)
          },
          shapeRendering : false
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
    };

    modules[valueAxis] = {
      id : 'sap.viz.modules.axis',
      configure : {
        'description' : 'Settings for the category axis of an XYZ chart.',
        propertyCategory : valueAxis,
        properties : {
          type : 'value',
          position : (isVertical ? 'left' : 'bottom'),
          forceVerticalFont : (isVertical ? undefined : true),
          shapeRendering : false,
          gridline : {
              showFirstLine: (isVertical ? true : false),
              showLastLine: (isVertical ? true : false)
          }
        }
      }
    };

    Manifest.register(chart);
  };
});