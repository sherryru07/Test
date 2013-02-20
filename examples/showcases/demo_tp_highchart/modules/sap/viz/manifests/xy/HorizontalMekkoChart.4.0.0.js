sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.HorizontalMekkoChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.xy.BarChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.Mekko',
  version : '4.0.0'
}
],
function Setup(Manifest,Constants) {
  var chart = {
    id : 'viz/horizontal_mekko',
    name : 'IDS_HORIZONTALMEKKOCHART',
    base : 'viz/bar',
      modules : {
          main : {
              modules : {
        dataLabel : {
                  id : 'sap.viz.modules.datalabel',
                  configure : {
                    properties : {
                      automaticInOutside : false,
                      isStackMode : true,
                      showZero : false
                    },
                    propertiesOverride:{
                      position : {
                        isExported : false
                      }
                    }
                  }
                },
                plot: {
                  id : 'sap.viz.modules.mekko',
                  configure: {
                    propertyCategory : 'plotArea',
                      propertiesOverride:{
                        primaryValuesColorPalette:{
                          isExported: false
                        },
                        
                        mode: {
                          isExported: false
                        },
                        orientation: {
                          isExported: false
                        }
                     }
                  }
                },
                xAxis:{
                      id : 'sap.viz.modules.axis',
                    configure:{
                      'description':'Settings for the value axis at left or bottom of an XY chart with 2 value axis.'
                    }
                },
                yAxis : {
                   id : 'sap.viz.modules.axis',
                   configure : {
                     properties:{
                       type : 'category',
                             position : 'left',
                             label:{
                               hideStrategy : 'greedy'
                             }
                     }
                   }
                },
                yAxis2 : {
                    id : 'sap.viz.modules.axis',
                    configure : {
                      'description':'Settings for the value axis at right or top of an XY chart with 2 value axis.',
                        propertyCategory : 'yAxis2',
                        properties : {
                          isIndependentMode : true,
                            type : 'category',
                            position : 'right',
                            gridline : {
                                visible : false
                            },                          
                            label:{
                              hideStrategy : 'greedy'
                            }
                  
                        },
                        propertiesOverride:{
                          gridline: {
                              isExported: false
                            },
                            axisline: {
                              isExported: false
                            },
                            label:{
                              numberFormat:{
                                isExported: false
                              }
                            }
                         }
                    }
                }
         
              }
          },
          tooltip : {
            id : 'sap.viz.modules.tooltip',
            configure : {
              propertyCategory : 'tooltip',
              properties : {
                chartType : 'mekko',
                orientation : 'left'
              }
            }
        }
      },
    feeds:{
    secondaryValues: {
      min : 1,
      max : 1
    },
    primaryValues : {
       min : 1,
         max : 1
    },
    regionColor :{
      min: 0,
      max: 1,
      acceptMND: -1
    },
    axisLabels :{
      min: 1,
      max: 1,
      acceptMND: -1
    }
    },
      dependencies : {
        attributes : [ {
          targetModule : 'main.xAxis',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'primaryScale'
        }, {
          targetModule : 'main.yAxis2',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'secondCategoryScale'
        }, {
          targetModule : 'main.xAxis',
          target : 'color',
          sourceModule : 'main.plot',
          source : 'primaryAxisColor'
        }, {
          targetModule : 'main.yAxis',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'categoryScale'
        },{
      targetModule : 'main.xAxis',
       target : 'title',
       sourceModule : 'main.plot',
       source : 'primaryAxisTitle'
    }, {
      targetModule : 'main.yAxis2',
       target : 'title',
       sourceModule : 'main.plot',
       source : 'secondAxisTitle'
    },{
        targetModule : 'main.yAxis2',
        target : 'independentData',
        sourceModule : 'main.plot',
        source : 'dimensionData'
    }, {
          targetModule : 'legend',
          target : 'colorPalette',
          sourceModule : 'main.plot',
          source : 'colorPalette'
        }, {
        targetModule : 'legend',
        target : 'setSelectionMode',
        sourceModule : 'main.interaction',
        source : 'getSelectionMode'
      } ]
    }
  };

  Manifest.register(chart);
});