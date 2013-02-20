sap.riv.module(
{
  qname : 'sap.viz.manifests.MultiDualStackedBarChart',
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
{  qname : 'sap.viz.modules.manifests.xy.StackedBar',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.BaseMultipleChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.BaseMultipleXYChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.MultiDualBarChart',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var multiBarChart = {
    id : 'viz/multi_dual_stacked_bar',
    name : 'IDS_MULTIDUALSTACKEDBARCHART',
    base : 'viz/multi_dual_bar',
    modules : {
      main : {
        modules: {
          plot : {
            id : 'sap.viz.modules.xycontainer',
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
      }
    }
  };

  Manifest.register(multiBarChart);
});