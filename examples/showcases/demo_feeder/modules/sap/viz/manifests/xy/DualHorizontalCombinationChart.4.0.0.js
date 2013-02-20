sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.DualHorizontalCombinationChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.xy.HorizontalCombinationChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.HorizontalCombination',
  version : '4.0.0'
}
],
 function Setup (Manifest, Constants) {
  var chart={
    id:'viz/dual_horizontal_combination',
    name:'IDS_DUALHORIZONTALCOMBINATIONCHART',
    base : 'viz/horizontal_combination',
    modules:{
      main:{
        modules:{
                  plot: {
                    configure: {
                      propertiesOverride:{
                        primaryValuesColorPalette:{
                          isExported: true
                        },
                        secondaryValuesColorPalette: {
                          isExported: true
                        },
                        dataShape:{
                          secondAxis:{
                            isExported: true
                          }
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
          'xAxis2' : {
            'id' : 'sap.viz.modules.axis',
            'configure' : {
                        'description':'Settings for the value axis at right or top of an XY chart with 2 value axis.',
            'propertyCategory' : 'xAxis2',
            'properties' : {
              'type' : 'value',
              'position' : 'top',
              'gridline' : {
                'visible' : false
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
        min: 1,
        max: Number.POSITIVE_INFINITY 
      }
    },
    dependencies:{
      attributes:[
        {
          targetModule : 'main.yAxis',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'categoryScale'
        },{
          targetModule : 'main.xAxis2',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'secondaryScale'
        },{
          targetModule : 'main.xAxis',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'primaryScale'
        },{
          targetModule : 'main.xAxis',
          target : 'color',
          sourceModule : 'main.plot',
          source : 'primaryAxisColor'
        },{
          targetModule : 'main.xAxis2',
          target : 'color',
          sourceModule : 'main.plot',
          source : 'secondAxisColor'
        },{
          targetModule : 'main.xAxis',
          target : 'title',
          sourceModule : 'main.plot',
          source : 'primaryAxisTitle'
        },{
          targetModule : 'main.xAxis2',
          target : 'title',
          sourceModule : 'main.plot',
          source : 'secondAxisTitle'
        },{
          targetModule : 'legend',
          target : 'colorPalette',
          sourceModule : 'main.plot',
          source : 'colorPalette'
        },{
          targetModule:'legend',
          target:'shapes',
          sourceModule:'main.plot',
          source:'shapePalette'
        }
      ]
    }
  };

  Manifest.register(chart);
});