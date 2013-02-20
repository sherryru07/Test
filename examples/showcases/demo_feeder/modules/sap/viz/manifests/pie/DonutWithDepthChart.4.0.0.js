sap.riv.module(
{
  qname : 'sap.viz.manifests.pie.DonutWithDepthChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.pie.PieWithDepthChart',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var donutChart = {
    'id' : 'viz/donut_with_depth',
    'name' : 'IDS_DONUTWITHDEPTHCHART',
    base : 'viz/pie_with_depth',
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
          }
        }
      }
    }
  };

  Manifest.register(donutChart);
});