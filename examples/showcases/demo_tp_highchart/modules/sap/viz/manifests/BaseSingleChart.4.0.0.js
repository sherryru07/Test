sap.riv.module(
{
  qname : 'sap.viz.manifests.BaseSingleChart',
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
{  qname : 'sap.viz.modules.manifests.Background',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var pieChart = {
    id : 'riv/base/single',
    name : 'IDS_BASESINGLECHART',
    base : 'riv/base',
    'abstract' : true,
    modules : {
      main : {
        id : 'sap.viz.modules.xycontainer'
      }
    }
  };

  Manifest.register(pieChart);
});