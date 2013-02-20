sap.riv.module(
{
  qname : 'sap.viz.manifests.ScatterMatrixChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Title',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.ScatterMatrixContainer',
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
{  qname : 'sap.viz.modules.manifests.ScatterInMatrix',
  version : '4.0.0'
}
],
function Setup(Manifest) {
    var scatterMatrix = {
        id : 'viz/scatter_matrix',
        name : 'IDS_SCATTERMATRIXCHART',
        base : 'riv/base',
        modules : {

            legend : {
                data : { 
                    aa :[1, 2]
                }, 
                configure : { 
                    properties : { 
                        type :'BubbleColorLegend'
                    }
                }
            },

            tooltip : { 
                id : 'sap.viz.modules.tooltip',
                configure : { 
                    propertyCategory : 'tooltip',
                    properties : { 
            chartType: 'scattermatrix',
                        orientation :'left'
                    }
                }
            },

            main : {
                id : 'sap.viz.modules.scattermatrixcontainer',
                
                configure : {
                    propertyCategory : 'multiLayout'
                },
                  
                controllers : {
                    'interaction' : { 
                        id : 'sap.viz.modules.controller.interaction',
                        configure : { 
                            propertyCategory :'interaction'
                        }
                    }
                },
                
                modules : {
                    plot : {
                        id : 'sap.viz.modules.xycontainer',
                        modules : {
                            xAxis : {
                                id : 'sap.viz.modules.axis',
                                data : {
                                    mg : [1]
                                },
                                configure : {
                                'description': 'Settings for the x axis of a normal bubble or scatter plot.',
                                    propertyCategory : 'xAxis',
                                    properties : {
                                        type : 'value',
                                        position : 'bottom',
                                        gridline : {
                                            visible : false
                                        }
                                    }
                                }
                            },

                            yAxis : {
                                id : 'sap.viz.modules.axis',
                                data : {
                                    mg : [2]
                                },
                                configure : {
                              'description': 'Settings for the y axis of a normal bubble or scatter plot.',
                                   propertyCategory : 'yAxis',
                                    properties : {
                                        type : 'value',
                                        position : 'left',
                                        gridline : {
                                            visible : false
                                        }
                                    }
                                }
                            },
              
              background : {
                id: 'sap.viz.modules.background',
                configure : {
                  propertyCategory : 'background',
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
                    paintingMode : 'rect-coordinate',
                    visible : false,
                    position : 'outside'
                  }
                }
              },
              
                            plot : {
                                id : 'sap.viz.modules.scatterInMatrix',
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
        dependencies : {
            attributes : [{
                targetModule : 'main.plot.yAxis',
                target : 'scale',
                sourceModule : 'main.plot.plot',
                source : 'valueAxis2Scale'
            }, {
                targetModule : 'main.plot.xAxis',
                target : 'scale',
                sourceModule : 'main.plot.plot',
                source : 'valueAxis1Scale'
            }, {
                targetModule : 'main.plot.xAxis',
                target : 'title',
                sourceModule : 'main.plot.plot',
                source : 'valueAxis1Title'
            }, {
                targetModule : 'main.plot.yAxis',
                target : 'title',
                sourceModule : 'main.plot.plot',
                source : 'valueAxis2Title'
            }, {
                targetModule : 'legend',
                target : 'colorPalette',
                sourceModule : 'main.plot.plot',
                source : 'colorPalette'
            }, {
                targetModule : 'legend',
                target : 'shapes',
                sourceModule : 'main.plot.plot',
                source : 'shapes'
            }, {
          targetModule : 'legend',
          target : 'setSelectionMode',
          sourceModule : 'main.interaction',
          source : 'getSelectionMode'
            }],

            events :[{
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
                listener : 'registerEvent',
                sourceModule : 'main',
                type : 'initialized.interaction'
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
      } ]

        }
    };

    Manifest.register(scatterMatrix);
});