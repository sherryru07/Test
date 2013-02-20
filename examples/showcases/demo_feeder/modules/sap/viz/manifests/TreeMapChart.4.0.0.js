sap.riv.module(
{
  qname : 'sap.viz.manifests.TreeMapChart',
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
{  qname : 'sap.viz.modules.manifests.TreeMap',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var chart = {
    id : 'viz/treemap',
    name : 'IDS_TREEMAPCHART',
      base : 'riv/base/single',
    modules : {
        
      legend : {
          id : 'sap.viz.modules.legend',
        configure : {
          'description': 'The measure based coloring legend is a bar containing segments with different colors and a value scale on side to indicate the relationship between the values and colors in the chart. ',
          properties : {
              type : 'MeasureBasedColoringLegend'
            },
            propertiesOverride : {
              isHierarchical : {
                isExported : false
              },
              formatString: {
                isExported: true
              }
            }
        }
      },
    tooltip : {
          id : 'sap.viz.modules.tooltip',
          configure : {
            propertyCategory : 'tooltip',
            properties : {
              chartType : 'treemap',
              orientation : 'bottom'
            }
          }
        },

      main : {
        modules : {
          dataLabel : {
            id : 'sap.viz.modules.datalabel',
            configure : {
              propertyCategory : 'dataLabel',
              properties : {
                paintingMode : 'rect-coordinate',
                visible : false,
                orientation : 'vertical',
                position : 'inside',
                automaticInOutside : false,
                showZero : true,
                isStackMode : false,
                isPercentMode : false,
                outsideVisible : false
              }
            }
          },
          plot : {
            id : 'sap.viz.modules.treemap',
            configure : {
              'description': 'Settings regarding the chart area and plot area as well as general chart options.',
              propertyCategory : 'plotArea'
            }
          }
        },
        controllers : {
             'interaction' : {
                   id : 'sap.viz.modules.controller.interaction',
                   configure : {
                       propertyCategory : 'interaction',
                        properties : {
                          supportedEventNames: ['mouseup', 'mouseover', 'mouseout', 'touchstart']
                        }
                   }
             }
        }
      }
    },
    dependencies : {
      attributes : [ 
      {
        targetModule : 'legend',
        target : 'mbcLegendInfo',
        sourceModule : 'main.plot',
        source : 'mbcLegendInfo'
      }, {
          targetModule : 'legend',
          target : 'setSelectionMode',
          sourceModule : 'main.interaction',
          source : 'getSelectionMode'
      }],
    
          events : [ {
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