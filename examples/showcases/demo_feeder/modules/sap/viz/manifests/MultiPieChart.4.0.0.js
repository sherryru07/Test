sap.riv.module(
{
  qname : 'sap.viz.manifests.MultiPieChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.feed.Constants',
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
{  qname : 'sap.viz.modules.manifests.Pie',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.BaseMultipleChart',
  version : '4.0.0'
}
],
function Setup(Manifest, constants) {
  var multiChart = {
    id : 'viz/multi_pie',
    name : 'IDS_MULTIPIECHART',
    base : 'riv/base/multiple',
    modules : {
      legend : {
        data : {
          aa : [ 2 ]
        }
      },
      main : {
        configure : {
          properties : {
            'cellPadding' : 5
          }
        },
        controllers : {
          'interaction' : {
            id : 'sap.viz.modules.controller.interaction',
            configure : {
              propertyCategory : 'interaction',
              properties : {
                supportedEventNames : [ 'mouseup', 'mouseover', 'mouseout',
                    'touchstart' ]
              }
            }
          }
        },
        modules : {
          plot : {
            id : 'sap.viz.modules.xycontainer',
            modules : {
              plot : {
                id : 'sap.viz.modules.pie',
                configure : {
                  'description': 'Settings regarding the chart area and plot area as well as general chart options.',
                  propertyCategory : 'plotArea',
                  properties : {
                    valign : "center"
                  }
                }
              },
              dataLabel : {
                id : 'sap.viz.modules.datalabel',
                configure : {
                  propertyCategory : 'dataLabel',
                  properties : {
                    paintingMode : 'polar-coordinate',
                    visible : false,
                    formatString : [['0.00%'],[]],
                    automaticInOutside : false,
                    outsideVisible : true,
                    type : 'label and value'
                  }
                }
              }
            }
          }
        }
      }
    },
    feeds : {
      multiplier : {
        acceptMND : 0,
        max : 2
      },
      pieSectorSize : {
        max : constants.Constraints.INF
      }
    },
    dependencies : {
      attributes : [ {
        targetModule : 'main.xAxis2',
        target : 'scale',
        sourceModule : 'main',
        source : 'xCategoryScale'
      }, {
        targetModule : 'main.yAxis',
        target : 'scale',
        sourceModule : 'main',
        source : 'yCategoryScale'
      }, {
        targetModule : 'legend',
        target : 'colorPalette',
        sourceModule : 'main.plot.plot',
        source : 'colorPalette'
      }, {
        targetModule : 'legend',
        target : 'setSelectionMode',
        sourceModule : 'main.interaction',
        source : 'getSelectionMode'
      } ],
      events : [ {
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
      } , {
        targetModule : 'main.plot.dataLabel',
        listener : 'showLabel',
        sourceModule : 'main.plot.plot',
        type : 'initialized.datalabel'
      }, {
        targetModule : 'main.plot.dataLabel',
        listener : 'removeLabel',
        sourceModule : 'main.plot.plot',
        type : 'startToInit.datalabel'
      }]
    }
  };

  Manifest.register(multiChart);
});