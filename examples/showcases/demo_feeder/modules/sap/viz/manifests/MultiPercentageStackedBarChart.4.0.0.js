sap.riv.module(
{
  qname : 'sap.viz.manifests.MultiPercentageStackedBarChart',
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
{  qname : 'sap.viz.manifests.MultiStackedBarChart',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var multiBarChart = {
    id : 'viz/multi_100_stacked_bar',
    name : 'IDS_MULTIPERCENTAGESTACKEDBARCHART',
    base : 'viz/multi_stacked_bar',
    feeds:{
      multiplier:{
      max:1
     },
     secondaryValues: null,
      axisLabels:{
        max:1
      }
    },
    modules : {
      main : {
        modules: {
          plot : {
            id : 'sap.viz.modules.xycontainer',
            modules : {
              xAxis : {
                id : 'sap.viz.modules.axis',
                configure : {
                  properties : {
                    isPercentMode : true
                  }
                }
              },
              plot : {
                id : 'sap.viz.modules.stackedbar',
                configure : {
                  properties : {
                    'mode' : 'percentage'
                  }
                }
              },
              dataLabel : {
                  id : 'sap.viz.modules.datalabel',
                  configure : {
                    propertyCategory : 'dataLabel',
                    properties : {
                      isPercentMode : true,
                      type : 'value',
                      showZero : true
                    }
                  }
              }
            }
          }
        }
      },
      tooltip : {
          id : 'sap.viz.modules.tooltip',
          configure : {
            propertyCategory : 'tooltip',
            properties : {
        formatString: [["0.00%"],["0.00%"]]
            }
          }
      }
    }
  };

  Manifest.register(multiBarChart);
});