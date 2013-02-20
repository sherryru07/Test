sap.riv.module(
{
  qname : 'sap.viz.manifests.scatter.BaseBubbleChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.BaseSingleChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Tooltip',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Axis',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var chart = {
    id : 'viz/scatter/single/base',
    name : 'IDS_BASEBUBBLECHART',
    'abstract' : true,
    base : 'riv/base/single',
    modules : {
      legend : {
        data : {
          aa : [ 1, 2 ]
        },
        configure : {
          properties : {
            type : 'BubbleColorLegend'
          },
          propertiesOverride:{
            isHierarchical:{
              isExported: false
            }
          }
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

            controllers : {
                'interaction' : { 
                    id : 'sap.viz.modules.controller.interaction',
                    configure : { 
                        propertyCategory :'interaction'
                    }
                }
            },

        modules : {
          dataLabel : {
            id : 'sap.viz.modules.datalabel',
            configure : {
              propertyCategory : 'dataLabel',
              properties : {
                paintingMode : 'rect-coordinate',
                orientation : 'vertical',
                visible : false,
                position : 'outside',
                outsideVisible : true
              }
            }
          },
          xAxis : {
            id : 'sap.viz.modules.axis',
            data : {
              mg : [ 1 ]
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
              mg : [ 2 ]
            },
            configure : {
                'description': 'Settings for the y axis of a normal bubble or scatter plot.',
              propertyCategory : 'yAxis',
              properties : {
                type : 'value',
                position : 'left',
                gridline : {
                  visible : true
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
        }
        }
      }
    },
    dependencies : {
      attributes : [ {
        targetModule : 'main.xAxis',
        target : 'scale',
        sourceModule : 'main.plot',
        source : 'valueAxis1Scale'
      }, {
        targetModule : 'main.yAxis',
        target : 'scale',
        sourceModule : 'main.plot',
        source : 'valueAxis2Scale'
      }, {
        targetModule : 'main.xAxis',
        target : 'title',
        sourceModule : 'main.plot',
        source : 'valueAxis1Title'
      }, {
        targetModule : 'main.yAxis',
        target : 'title',
        sourceModule : 'main.plot',
        source : 'valueAxis2Title'
      }, {
        targetModule : 'legend',
        target : 'colorPalette',
        sourceModule : 'main.plot',
        source : 'colorPalette'
      }, {
        targetModule : 'legend',
        target : 'shapes',
        sourceModule : 'main.plot',
        source : 'shapes'
      }, {
        targetModule : 'legend',
        target : 'setSelectionMode',
        sourceModule : 'main.interaction',
        source : 'getSelectionMode'
      }],
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
      }, {
          targetModule : 'main.interaction',
          listener : 'registerEvent',
          sourceModule : 'main.plot',
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
          targetModule : 'main.dataLabel',
          listener : 'showLabel',
          sourceModule : 'main.plot',
          type : 'initialized.datalabel'
        }, {
          targetModule : 'main.dataLabel',
          listener : 'removeLabel',
          sourceModule : 'main.plot',
          type : 'startToInit.datalabel'
        }]
    }
  };

  Manifest.register(chart);
});