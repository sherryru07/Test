sap.riv.module(
{
  qname : 'sap.viz.manifests.BaseChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Title',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Legend',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.DataLabel',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var chart = {
    id : 'riv/base',
    name : 'IDS_BASECHART',
    'abstract' : true,
    modules : {
      title : {
        id : 'sap.viz.modules.title',
        configure : {
          propertyCategory : 'title'
        }
      },
      legend : {
        id : 'sap.viz.modules.legend',
        configure : {
          propertyCategory : 'legend'
        }
      }
    },
    dependencies : {

    }
  };

  Manifest.register(chart);
});