sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.PercentageStackedVerticalBarChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.StackedVerticalBar',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.xy.StackedVerticalBarChart',
  version : '4.0.0'
}
],
function Setup(Manifest) {
    var chart = {
      id : 'viz/100_stacked_column',
      name : 'IDS_PERCENTAGESTACKEDVERTICALBARCHART',
      base : 'viz/stacked_column',
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
                  } ,
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
                      chartType : '100_stacked_column',
                      orientation : 'bottom',
                      formatString: [["0.00%"],["0.00%"]]
                    }
                  }
              }
              
          }
    };

    Manifest.register(chart);
});