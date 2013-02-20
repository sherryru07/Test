sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.DualVerticalBarChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.xy.VerticalBarChart',
  version : '4.0.0'
}
],
function Setup(Manifest,Constants) {
  var chart = {
    id : 'viz/dual_column',
    name : 'IDS_DUALVERTICALBARCHART',
    base : 'viz/column',
      modules : {
          main : {
              modules : {
                plot: {
                  configure: {
                    propertiesOverride:{
                      primaryValuesColorPalette:{
                        isExported: true
                      },
                      secondaryValuesColorPalette: {
                        isExported: true
                      }
                    }
                  }
                },
              yAxis:{
                      id : 'sap.viz.modules.axis',
                  configure:{
                    'description':'Settings for the value axis at left or bottom of an XY chart with 2 value axis.',
                    propertiesOverride:{
                      title:{
                        applyAxislineColor:{
                          isExported: true
                        }
                      }
                    }
                  }
                },
                yAxis2 : {
                    id : 'sap.viz.modules.axis',
                    configure : {
                        'description':'Settings for the value axis at right or top of an XY chart with 2 value axis.',
                        propertyCategory : 'yAxis2',
                        properties : {
                            type : 'value',
                            position : 'right'
                        },
                        propertiesOverride:{
                          title:{
                            applyAxislineColor:{
                              isExported: true
                            }
                          }
                        }
                    }
                }
              }
          }
      },
    feeds:{
      secondaryValues: {
        min : 1,
        max : Number.POSITIVE_INFINITY 
      }
    },
      dependencies : {
        attributes : [ {
          targetModule : 'main.plot',
          target : 'primaryDataRange',
          sourceModule : 'main.yAxis',
          source : 'range'
        }, {
          targetModule : 'main.yAxis',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'primaryScale'
        }, {
          targetModule : 'main.plot',
          target : 'secondDataRange',
          sourceModule : 'main.yAxis2',
          source : 'range'
        }, {
          targetModule : 'main.yAxis2',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'secondScale'
        }, {
          targetModule : 'main.yAxis',
          target : 'color',
          sourceModule : 'main.plot',
          source : 'primaryAxisColor'
        }, {
          targetModule : 'main.yAxis2',
          target : 'color',
          sourceModule : 'main.plot',
          source : 'secondAxisColor'
        }, {
          targetModule : 'main.xAxis',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'categoryScale'
        }, {
      targetModule : 'main.yAxis2',
       target : 'title',
       sourceModule : 'main.plot',
       source : 'secondAxisTitle'
    },{
      targetModule : 'main.yAxis',
       target : 'title',
       sourceModule : 'main.plot',
       source : 'primaryAxisTitle'
    },{
          targetModule : 'legend',
          target : 'colorPalette',
          sourceModule : 'main.plot',
          source : 'colorPalette'
        },{
        targetModule : 'legend',
        target : 'setSelectionMode',
        sourceModule : 'main.interaction',
        source : 'getSelectionMode'
        } ]
    }
  };

  Manifest.register(chart);
});