sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.StackedBarChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.StackedBar',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.xy.BarChart',
  version : '4.0.0'
}
],
function Setup(Manifest) {
    var chart = {
      id : 'viz/stacked_bar',
      name : 'IDS_STACKEDBARCHART',
      base : 'viz/bar',
      feeds:{
        secondaryValues: null
      },
      modules : {
          main : {
              modules : {
                  plot : {
                    id : 'sap.viz.modules.stackedbar',
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