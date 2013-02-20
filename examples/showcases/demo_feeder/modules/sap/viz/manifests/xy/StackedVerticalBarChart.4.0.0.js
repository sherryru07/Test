sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.StackedVerticalBarChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.StackedVerticalBar',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.xy.VerticalBarChart',
  version : '4.0.0'
}
],
function Setup(Manifest) {
    var chart = {
      id : 'viz/stacked_column',
      name : 'IDS_STACKEDVERTICALBARCHART',
      base : 'viz/column',
      feeds:{
        secondaryValues: null
      },
      modules : {
          main : {
              modules : {
                  plot : {
                    id : 'sap.viz.modules.stackedverticalbar',
                    configure : {
                  'description': 'Settings regarding the chart area and plot area as well as general chart options.',
                        propertyCategory : 'plotArea'
                    }
                  },
                  dataLabel : {
                    id : 'sap.viz.modules.datalabel',
                    configure : {
                      properties : {
                        automaticInOutside : false,
                        isStackMode : true,
                        showZero : false
                      },
                      propertiesOverride : {
                        position : {
                          isExported : false
                        }
                      }
                    }
                  }
              }
          }
      }
    };

    Manifest.register(chart);
});