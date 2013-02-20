sap.riv.module(
{
  qname : 'sap.viz.manifests.pie.PieWithDepthChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.pie.PieChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.PieWithDepth',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.DataLabel',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.controller.Interaction',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.controller.Rotate',
  version : '4.0.0'
}
],
function Setup(Manifest) {
  var chart = {
    id : 'viz/pie_with_depth',
    name : 'IDS_PIEWITHDEPTHCHART',
    base : "riv/base/single",
    modules : {
      legend : {
        data : {
          aa : [ 1 ]
        }
      },
      main : {
        controllers : {
            'interaction' : {
              id : 'sap.viz.modules.controller.interaction',
              configure : {
                propertyCategory : 'interaction',
                properties : {
                  supportedEventNames: ['mouseup', 'mousemove', 'touchstart'],
                  selectability: {
                    mode: 'multiple',
                    selectWithCtrlKey: true
                  },
                  preserveSelectionWhenDragging: true
                }
              }
            },
            
            'rotate': {
              id : 'sap.viz.modules.controller.rotate',
              configure : {
                propertyCategory: 'rotate'
              }
            }
          },
        modules : {
          plot : {
            id : 'sap.viz.modules.piewithdepth',
            configure : {
                'description': 'Settings regarding the chart area and plot area as well as general chart options.',
              propertyCategory : 'plotArea'
            }
          }
        }
      }
    },
    dependencies : {
      attributes : [ {
        targetModule : 'legend',
        target : 'colorPalette',
        sourceModule : 'main.plot',
        source : 'colorPalette'
      }],
      events : [ {
          targetModule : 'main.interaction',
          listener : 'registerEvent',
          sourceModule : 'main.plot',
          type : 'initialized.interaction'
        }, {
          targetModule : 'main.rotate',
          listener : 'registerEvent',
          sourceModule : 'main.plot',
          type : 'initialized.rotate'
        }]
    }
  };

  Manifest.register(chart);
});