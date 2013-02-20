sap.riv.module(
{
  qname : 'sap.viz.manifests.RadarChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.BaseSingleChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Radar',
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
    id : 'viz/radar',
    name : 'IDS_RADARCHART',
    base : "riv/base/single",
    modules : {
      legend : {
        id : "sap.viz.modules.legend",
        data : {
          aa : [ 2, 3 ]
        }
      },
      tooltip : {
        id : "sap.viz.modules.tooltip",
        configure : {
        propertyCategory : 'tooltip',
          properties : {
            chartType : "radar",
            orientation : "left"
          }
        }
      },
      main : {
        id : 'sap.viz.modules.xycontainer',
        controllers : {
          interaction : {
            id : "sap.viz.modules.controller.interaction",
            configure : {
              propertyCategory : "interaction",
              properties : {
                supportedEventNames : [ "mousemove", "mouseup", "touchstart" ]
              }
            }
          }
        },
        modules : {
          plot: {
            id : 'sap.viz.modules.radar',
            configure : {
            'description': 'Settings regarding the chart area and plot area as well as general chart options.',
              propertyCategory : 'plotArea'
            }    
          },
          dataLabel : {
            id : 'sap.viz.modules.datalabel',
            configure : {
              propertyCategory : 'dataLabel',
              properties : {
                paintingMode : 'rect-coordinate',
                visible : false,
                orientation : 'vertical',
                position : 'outside',
                automaticInOutside : false,
                showZero : true,
                isStackMode : false,
                isPercentMode : false,
                outsideVisible : true,
                outsidePosition : 'up'
              }
            }
          }
        }
      }
    },
    dependencies : {
      attributes : [{
        targetModule : "legend",
        target : "colorPalette",
        sourceModule : "main.plot",
        source : "colorPalette"
      },  {
        targetModule : 'legend',
        target : 'shapes',
        sourceModule : 'main.plot',
        source : 'shapes'
      }, {
          targetModule : 'legend',
          target : 'setSelectionMode',
          sourceModule : 'main.interaction',
          source : 'getSelectionMode'
      } ],
      events : [{
        targetModule : "main.interaction",
        listener : "registerEvent",
        sourceModule : "main.plot",
        type : "initialized.interaction"
      },{
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
        targetModule : "tooltip",
        listener : "showTooltip",
        sourceModule : "main.plot",
        type : "showTooltip"
      }, {
        targetModule : "tooltip",
        listener : "hideTooltip",
        sourceModule : "main.plot",
        type : "hideTooltip"
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