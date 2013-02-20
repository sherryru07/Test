sap.riv.module(
{
  qname : 'sap.viz.manifests.MultiDualStackedVerticalBarChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.BaseChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.XYContainer',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.TableContainer',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Axis',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.StackedVerticalBar',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.BaseMultipleChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.BaseMultipleXYChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.MultiDualVerticalBarChart',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var multiVBarChart = {
    id : 'viz/multi_dual_stacked_column',
    name : 'IDS_MULTIDUALSTACKEDVERTICALBARCHART',
    base : 'viz/multi_dual_column',
    modules : {
      main : {
        modules: {
          plot : {
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
      }
    }
  };

  Manifest.register(multiVBarChart);
});