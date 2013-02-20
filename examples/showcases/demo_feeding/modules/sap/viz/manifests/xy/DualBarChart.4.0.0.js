sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.DualBarChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.xy.BarChart',
  version : '4.0.0'
}
],
function Setup(Manifest,Constants) {
  var chart = {
    id : 'viz/dual_bar',
    name : 'IDS_DUALBARCHART',
    base : 'viz/bar',
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
                xAxis:{
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
                xAxis2 : {
                    id : 'sap.viz.modules.axis',
                    configure : {
                      'description':'Settings for the value axis at right or top of an XY chart with 2 value axis.',
                        propertyCategory : 'xAxis2',
                        properties : {
                            type : 'value',
                            position : 'top',
                            gridline : {
                                visible : false
                            }
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
    }// or null
    },
      dependencies : {
        attributes : [ {
          targetModule : 'main.xAxis',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'primaryScale'
        }, {
          targetModule : 'main.xAxis2',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'secondScale'
        }, {
          targetModule : 'main.xAxis',
          target : 'color',
          sourceModule : 'main.plot',
          source : 'primaryAxisColor'
        }, {
          targetModule : 'main.xAxis2',
          target : 'color',
          sourceModule : 'main.plot',
          source : 'secondAxisColor'
        }, {
          targetModule : 'main.yAxis',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'categoryScale'
        },{
      targetModule : 'main.xAxis',
       target : 'title',
       sourceModule : 'main.plot',
       source : 'primaryAxisTitle'
    }, {
      targetModule : 'main.xAxis2',
       target : 'title',
       sourceModule : 'main.plot',
       source : 'secondAxisTitle'
    },{
          targetModule : 'legend',
          target : 'colorPalette',
          sourceModule : 'main.plot',
          source : 'colorPalette'
        }, {
        targetModule : 'legend',
        target : 'setSelectionMode',
        sourceModule : 'main.interaction',
        source : 'getSelectionMode'
      } ]
    }
  };

  Manifest.register(chart);
});