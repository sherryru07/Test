sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.DualStackedBarChart',
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
{  qname : 'sap.viz.manifests.xy.StackedBarChart',
  version : '4.0.0'
}
],
function Setup(Manifest,Constants) {
    var chart = {
      id : 'viz/dual_stacked_bar',
      name : 'IDS_DUALSTACKEDBARCHART',
      base : 'viz/dual_bar',
      modules : {
          main : {
            modules : {
              dataLabel : {
                id : 'sap.viz.modules.datalabel',
                configure : {
                  properties : {
                    automaticInOutside : false,
                    isStackMode : true,
                    showZero : false
                  },
                  propertiesOverride:{
                    position : {
                      isExported : false
                    }
                  }
                }
              },
                  plot : {
                    id : 'sap.viz.modules.stackedbar',
                    configure : {
                  'description': 'Settings regarding the chart area and plot area as well as general chart options.',
                        propertyCategory : 'plotArea'
                    }
                  }
              }
          }
      }
    };

    Manifest.register(chart);
});