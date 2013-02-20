sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.PercentageHorizontalMekkoChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.xy.HorizontalMekkoChart',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var chart = {
    id : 'viz/100_horizontal_mekko',
    name : 'IDS_PERCENTAGEHORIZONTALMEKKOCHART',
    base : 'viz/horizontal_mekko',
      modules : {
      
          tooltip : {
              id : 'sap.viz.modules.tooltip',
              configure : {
                propertyCategory : 'tooltip',
                properties : {
                  chartType : 'mekko',
                  formatString: [["0.00%"],[""]]
                }
              }
          },
          main : {
              modules : {
                dataLabel : {
                    id : 'sap.viz.modules.datalabel',
                    configure : {
                      propertyCategory : 'dataLabel',
                      properties : {
                        isPercentMode: true
                      }
                    }
                  },
                plot: {
                  id : 'sap.viz.modules.mekko',
                  configure: {
                    propertyCategory : 'plotArea',
                    properties : {
                        mode: 'percentage'
                      },
                      propertiesOverride:{
                        primaryValuesColorPalette:{
                          isExported: false
                        },
                        
                        mode: {
                          isExported: false
                        },
                        orientation: {
                            isExported: false
                          }
                     }
                  }
                },
                xAxis : {
                    id : 'sap.viz.modules.axis',
                    configure : {
                    'description': 'Settings for the value axis of an XY chart.',
                      propertyCategory : 'xAxis',
                      properties : {
                        isPercentMode : true
                      }
                    }
                  }
              }
            }
          }
      };


  Manifest.register(chart);
});