sap.riv.module(
{
  qname : 'sap.viz.manifests.pie.DonutChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.pie.PieChart',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var donutChart = {
    'id' : 'viz/donut',
    'name' : 'IDS_DONUTCHART',
    base : 'viz/pie',
    'modules' : {
      'main' : {
        'modules' : {
          'plot' : {
            'configure' : {
                'description': 'Settings regarding the chart area and plot area as well as general chart options.',
              'propertyCategory' : 'plotArea',
              'properties' : {
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
  };

  Manifest.register(donutChart);
});