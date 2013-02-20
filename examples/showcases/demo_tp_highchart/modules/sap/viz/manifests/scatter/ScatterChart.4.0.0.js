sap.riv.module(
{
  qname : 'sap.viz.manifests.scatter.ScatterChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.scatter.BaseBubbleChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Scatter',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var chart = {
    id : 'viz/scatter',
    name : 'IDS_SCATTERCHART',
    base : "viz/scatter/single/base",
    modules : {
      tooltip : {
        configure : {
          properties : {
            chartType : 'scatter'
          }
        }
      },
      main : {
        modules : {
          plot : {
            id : 'sap.viz.modules.scatter',
            configure : {
                'description': 'Settings regarding the chart area and plot area as well as general chart options.',
              propertyCategory : 'plotArea'
            }
          },
          dataLabel : {
            id : 'sap.viz.modules.datalabel',
            configure : {
              properties : {
                automaticInOutside : false
              }
            }
          }
        }
      }
    }
  };

  Manifest.register(chart);
});