sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.DualPercentageStackedBarChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.StackedBar',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.xy.DualStackedBarChart',
  version : '4.0.0'
}
],
function Setup(Manifest,Constants) {
    var chart = {
      id : 'viz/100_dual_stacked_bar',
      name : 'IDS_DUALPERCENTAGESTACKEDBARCHART',
      base : 'viz/dual_stacked_bar',
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
                  dataLabel : {
                      id : 'sap.viz.modules.datalabel',
                      configure : {
                        propertyCategory : 'dataLabel',
                        properties : {
                          isPercentMode : true,
                          showZero : true
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
                      xAxis2 : {
                          id : 'sap.viz.modules.axis',
                          configure : {
                          'description': 'Settings for the value axis of an XY chart.',
                            propertyCategory : 'xAxis2',
                            properties : {
                              isPercentMode : true
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
                  chartType : '100_dual_stacked_bar',
                  orientation : 'left'
                }
              }
          }
      }  
    };

    Manifest.register(chart);
});