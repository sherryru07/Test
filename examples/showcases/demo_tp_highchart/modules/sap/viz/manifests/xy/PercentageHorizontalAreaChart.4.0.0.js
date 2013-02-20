sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.PercentageHorizontalAreaChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.xy.HorizontalAreaChart',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var chart = {
    id : 'viz/100_horizontal_area',
    name : 'IDS_PERCENTAGEHORIZONTALAREACHART',
    base: 'viz/horizontal_area',
    
    modules : {  
      main : {    
        'modules' : {
          plot : {
            
            configure : {
              properties: {
                mode : "percentage"
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
      },
      tooltip : {
        id : 'sap.viz.modules.tooltip',
        configure : {
          propertyCategory : 'tooltip',
          properties : {
            chartType : 'horizontalline',
            orientation : 'left',
            formatString: [["0.00%"],["0.00%"]]
          }
        }
    }
     
    }   
  };
  Manifest.register(chart);
});