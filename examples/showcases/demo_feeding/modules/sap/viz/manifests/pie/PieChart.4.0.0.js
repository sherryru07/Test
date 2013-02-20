sap.riv.module(
{
  qname : 'sap.viz.manifests.pie.PieChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.BaseSingleChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Pie',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.DataLabel',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.controller.Interaction',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var pieChart = {
    id : 'viz/pie',
    name : 'IDS_PIECHART',
    base : 'riv/base/single',
    modules : {
      legend : {
        data : {
          aa : [ 1 ]
        }
      },
      main : {
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
            id : 'sap.viz.modules.pie',
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
                paintingMode : 'polar-coordinate',
                visible : false,
                type : 'label and value',
                formatString : [['0.00%'],[]],
                automaticInOutside : false,
                outsideVisible : true
              }
            }
          }
        }
      }
    },
    dependencies : {
      attributes : [ {
        targetModule : 'legend',
        target : 'colorPalette',
        sourceModule : 'main.plot',
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
      } , {
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

  Manifest.register(pieChart);
});