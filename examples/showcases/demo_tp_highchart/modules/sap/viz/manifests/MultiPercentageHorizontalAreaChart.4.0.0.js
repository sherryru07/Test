sap.riv.module(
{
  qname : 'sap.viz.manifests.MultiPercentageHorizontalAreaChart',
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
{  qname : 'sap.viz.modules.manifests.xy.Area',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.BaseMultipleChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.MultiHorizontalAreaChart',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var multiAreaChart = {
    id : 'viz/multi_100_horizontal_area',
    name : 'IDS_MULTIPERCENTAGEHORIZONTALAREACHART',
    base : 'viz/multi_horizontal_area',
    modules : {
      tooltip : {
        configure : {
          properties : {
            chartType : 'horizontalline',
            orientation : 'left',
            formatString: [["0.00%"],["0.00%"]]
          }
        }
      },  
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
                id : 'sap.viz.modules.area',
                configure : {
                  'description': 'Settings regarding the chart area and plot area as well as general chart options.',
                  propertyCategory : 'plotArea',
                  properties : {
                    mode:'percentage'
                  }
                }
              },         
              dataLabel : {
                  id : 'sap.viz.modules.datalabel',
                  configure : {
                    propertyCategory : 'dataLabel',
                    properties : {
                      isPercentMode: true
                    }
                  }
                }
            }
          }
        }
      }
    }   
  };

  Manifest.register(multiAreaChart);
});