sap.riv.module(
{
  qname : 'sap.viz.manifests.MultiDonutChart',
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
{  qname : 'sap.viz.modules.manifests.Pie',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.MultiPieChart',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var multiChart = {
    id : 'viz/multi_donut',
    name : 'IDS_MULTIDONUTCHART',
    base : 'viz/multi_pie',
    modules : {
      main : {
        modules: {
          plot : {
            id : 'sap.viz.modules.xycontainer',
            modules : {
              plot : {
                id : 'sap.viz.modules.pie',
                configure : {
              'description': 'Settings regarding the chart area and plot area as well as general chart options.',
                  propertyCategory : 'plotArea',
                  properties : {
                      'isDonut' : true
                  }
                }
              },          
              dataLabel : {
                id : 'sap.viz.modules.datalabel',
                configure : {
                  propertyCategory : 'dataLabel',
                  properties : {
                    isDonut : true
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  Manifest.register(multiChart);
});