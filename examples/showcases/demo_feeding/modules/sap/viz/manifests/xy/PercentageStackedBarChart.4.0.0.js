sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.PercentageStackedBarChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.StackedBar',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.xy.StackedBarChart',
  version : '4.0.0'
}
],
function Setup(Manifest) {
    var chart = {
      id : 'viz/100_stacked_bar',
      name : 'IDS_PERCENTAGESTACKEDBARCHART',
      base : 'viz/stacked_bar',
      modules : {
          main : {
              modules : {
                  plot : {
                    id : 'sap.viz.modules.stackedbar',
                    configure : {
                        properties : {
                             mode : 'percentage'
                        }
                    }
                  },            
                  xAxis : {
                    id : 'sap.viz.modules.axis',
                    configure : {
                    'description': 'Settings for the value axis of an XY chart.',
                      propertyCategory : 'xAxis',
                      properties : {
                        isPercentMode : true
                      }
                    }
                  },
                  dataLabel : {
                      id : 'sap.viz.modules.datalabel',
                      configure : {
                        propertyCategory : 'dataLabel',
                        properties : {
                          type : 'value',
                          isPercentMode: true,
                          showZero : true
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
                  chartType : '100_stacked_bar',
                  orientation : 'left',
                  formatString: [["0.00%"],["0.00%"]]
                }
              }
          }
      }
    };

    Manifest.register(chart);
});