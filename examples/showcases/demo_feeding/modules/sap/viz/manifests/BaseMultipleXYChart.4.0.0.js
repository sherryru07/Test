sap.riv.module(
{
  qname : 'sap.viz.manifests.BaseMultipleXYChart',
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
{  qname : 'sap.viz.manifests.BaseMultipleChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Tooltip',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var multiXYChart = {
    id : 'riv/base/multiple/xy',
    name : 'IDS_BASEMULTIPLEXYCHART',
    base : 'riv/base/multiple',
    'abstract' : true,
    modules : {
      tooltip : {
        id : 'sap.viz.modules.tooltip',
        configure : {
          propertyCategory : 'tooltip'
        }
      },
      main : {
        modules: {
          plot : {
            id : 'sap.viz.modules.xycontainer',
            modules : {
              background : {
                id : 'sap.viz.modules.background',
                configure : {
                  propertyCategory : 'background',
                  properties : {
                    direction : 'vertical'
                  }
                }
              },
              dataLabel : {
                id : 'sap.viz.modules.datalabel',
                configure : {
                  propertyCategory : 'dataLabel',
                  properties : {
                    paintingMode : 'rect-coordinate',
                    visible : false,
                    position : 'inside',
                    automaticInOutside : true,
                    showZero : true,
                    isStackMode : false,
                    isPercentMode : false,
                    outsideVisible : true
                  }
                }
              }
            }
          }
        }
      }
    }
  };

  Manifest.register(multiXYChart);
});