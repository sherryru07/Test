sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.MekkoChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.xy.VerticalBarChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.Mekko',
  version : '4.0.0'
}
],
function Setup(Manifest,Constants) {
  var chart = {
    id : 'viz/mekko',
    name : 'IDS_MEKKOCHART',
    base : 'viz/column',
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
                    properties : {
                        orientation: 'vertical'
                      },
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
                yAxis:{
                      id : 'sap.viz.modules.axis',
                    configure:{
                      'description':'Settings for the value axis at left or bottom of an XY chart with 2 value axis.',
                      properties:{
                        position : 'left'
                      }
                    }
                },
                xAxis : {
                   id : 'sap.viz.modules.axis',
                   configure : {
                     properties:{
                       type : 'category',
                             position : 'bottom',
                             label:{
                               hideStrategy : 'greedy'
                             }
                     }
                   }
                },
                xAxis2 : {
                    id : 'sap.viz.modules.axis',
                    configure : {
                      'description':'Settings for the value axis at right or top of an XY chart with 2 value axis.',
                        propertyCategory : 'xAxis2',
                        properties : {
                          isIndependentMode : true,
                            type : 'category',
                            position : 'top',
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
                  orientation : 'bottom'
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
          targetModule : 'main.yAxis',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'primaryScale'
        }, {
          targetModule : 'main.xAxis2',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'secondCategoryScale'
        }, {
          targetModule : 'main.yAxis',
          target : 'color',
          sourceModule : 'main.plot',
          source : 'primaryAxisColor'
        }, {
          targetModule : 'main.xAxis',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'categoryScale'
        },{
      targetModule : 'main.yAxis',
       target : 'title',
       sourceModule : 'main.plot',
       source : 'primaryAxisTitle'
    }, {
      targetModule : 'main.xAxis2',
       target : 'title',
       sourceModule : 'main.plot',
       source : 'secondAxisTitle'
    },{
        targetModule : 'main.xAxis2',
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