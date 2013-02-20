sap.riv.module(
{
  qname : 'sap.viz.manifests.MultiDualPercentageStackedVerticalBarChart',
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
{  qname : 'sap.viz.manifests.MultiDualStackedVerticalBarChart',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var multiVBarChart = {
    id : 'viz/multi_100_dual_stacked_column',
    name : 'IDS_MULTIDUALPERCENTAGESTACKEDVERTICALBARCHART',
    base : 'viz/multi_dual_stacked_column',
    modules : {
      main : {
        modules: {
          plot : {
            modules : {
              yAxis : {
                id : 'sap.viz.modules.axis',
                configure : {
                  properties : {
                    isPercentMode : true
                  }
                }
              },
              yAxis2 : {
                id : 'sap.viz.modules.axis',
                configure : {
                  properties : {
                    isPercentMode : true
                  }
                }
              },
              plot : {
                id : 'sap.viz.modules.stackedverticalbar',
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

  Manifest.register(multiVBarChart);
});