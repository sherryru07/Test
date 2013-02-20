sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.DualPercentageStackedVerticalBarChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.StackedVerticalBar',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.xy.DualStackedVerticalBarChart',
  version : '4.0.0'
}
],
function Setup(Manifest,Constants) {
    var chart = {
      id : 'viz/100_dual_stacked_column',
      name : 'IDS_DUALPERCENTAGESTACKEDVERTICALBARCHART',
      base : 'viz/dual_stacked_column',
      modules : {
          main : {
              modules : {
                  plot : {
                    id : 'sap.viz.modules.stackedverticalbar',
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
                  yAxis : {
                    id : 'sap.viz.modules.axis',
                    configure : {
                    'description': 'Settings for the value axis of an XY chart.',
                      propertyCategory : 'yAxis',
                      properties : {
                        isPercentMode : true
                      }
                    }
                  },
                  yAxis2 : {
                      id : 'sap.viz.modules.axis',
                      configure : {
                      'description': 'Settings for the value axis of an XY chart.',
                        propertyCategory : 'yAxis2',
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
                  chartType : '100_dual_stacked_column',
                  orientation : 'bottom'
                }
              }
          }
      }    
    };

    Manifest.register(chart);
});