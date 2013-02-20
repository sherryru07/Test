sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.DualStackedVerticalBarChart',
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
{  qname : 'sap.viz.manifests.xy.StackedVerticalBarChart',
  version : '4.0.0'
}
],
function Setup(Manifest,Constants) {
    var chart = {
      id : 'viz/dual_stacked_column',
      name : 'IDS_DUALSTACKEDVERTICALBARCHART',
      base : 'viz/dual_column',
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
                    id : 'sap.viz.modules.stackedverticalbar',
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