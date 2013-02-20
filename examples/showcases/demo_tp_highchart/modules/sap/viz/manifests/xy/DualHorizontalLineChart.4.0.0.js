sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.DualHorizontalLineChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.HorizontalLine',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.xy.HorizontalLineChart',
  version : '4.0.0'
}
],
function Setup(Manifest,Constants) {
  var chart = {
    'id' : 'viz/dual_horizontal_line',
    'name' : 'IDS_DUALHORIZONTALLINECHART',
    'base' : 'viz/horizontal_line',
     'modules' : {
      
      /**
       * 'sizeLegend' : {}
       */
      'main' : {
        'id' : 'sap.viz.modules.xycontainer',
        'modules' : {
       
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
    },
    
    feeds:{
      secondaryValues: {
        min : 1,
        max : Number.POSITIVE_INFINITY 
      },
      axisLabels:{
        acceptMND : -1,
        max: 1
        },
        regionColor:{
          acceptMND: 0
        }
    },
    /**
     * the dependencies will be resolved globally to allow modules inside
     * container depend on modules outside, so the keys should be globally
     * unique
     */
    dependencies : {
      attributes : [ {
        targetModule : 'main.yAxis',
        target : 'scale',
        sourceModule : 'main.plot',
        source : 'categoryScale'
      }, {
        targetModule : 'legend',
        target : 'colorPalette',
        sourceModule : 'main.plot',
        source : 'getColorPalette'
      }, {
        targetModule : 'main.xAxis',
        target : 'scale',
        sourceModule : 'main.plot',
        source : 'primaryScale'
      }, {
        targetModule : 'main.xAxis2',
        target : 'scale',
        sourceModule : 'main.plot',
        source : 'secondaryScale'
      }, {
        targetModule : 'main.xAxis',
        target : 'title',
        sourceModule : 'main.plot',
        source : 'primaryAxisTitle'
      }, {
        targetModule : 'main.xAxis2',
        target : 'title',
        sourceModule : 'main.plot',
        source : 'secondAxisTitle'
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
        },{
        targetModule : 'legend',
        target : 'shapes',
        sourceModule : 'main.plot',
        source : 'shapePalette'
      } ]
    }
  };
  Manifest.register(chart);
});