sap.riv.module(
{
  qname : 'sap.viz.manifests.BaseMultipleChart',
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
{  qname : 'sap.viz.modules.manifests.Background',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var multiChart = {
    id : 'riv/base/multiple',
    name : 'IDS_BASEMULTIPLECHART',
    base : 'riv/base',
    'abstract' : true,
    modules : {
      main : {
        id : 'sap.viz.modules.tablecontainer',
        configure : {
          propertyCategory : 'multiLayout'
        },
        modules: {
          xAxis2 : {
            id : 'sap.viz.modules.axis',
            configure : {
            'description': 'Settings for the column axis of multiple charts.',
              propertyCategory : 'columnAxis',
              properties : {
                title : {
                  visible : false
                },
                gridline : {
                  visible : true
                },
                color : '#d8d8d8',
                type : 'category',
                position : 'top'
              },
        propertiesOverride : {                  
                label : {
                isExported : false
                },
                axisline : {
                isExported : false
               },
              gridline:{
                isExported:false,
                 color: {
                 isExported:false
               },
              size: {
                 isExported:false
               }
            }
        }
            }
          },
          yAxis : {
            id : 'sap.viz.modules.axis',
            configure : {
            'description': 'Settings for the row axis of multiple charts.',
              propertyCategory : 'rowAxis',
              properties : {
                type : 'category',
                position : 'left',
                title : {
                  visible : false
                },
                color : '#d8d8d8',
                gridline : {
                  visible : true
                }
              },
              propertiesOverride : {                  
                label : {
                isExported : false
                },
                axisline : {
                isExported : false
               },
               gridline:{
                 isExported:false,
                 color: {
                      isExported:false
                    },
                 size: {
                      isExported:false
                    }
                 }
           }
            }
          },
          plot : {
            id : 'sap.viz.modules.xycontainer'
          }
        }
      }
    }
  };

  Manifest.register(multiChart);
});