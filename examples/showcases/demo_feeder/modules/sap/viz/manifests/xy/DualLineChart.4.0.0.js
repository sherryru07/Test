sap.riv.module(
{
  qname : 'sap.viz.manifests.xy.DualLineChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.xy.Line',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.xy.LineChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.controller.Interaction',
  version : '4.0.0'
}
],
function Setup(Manifest,Constants) {
  var chart = {
    id : 'viz/dual_line',
    name : 'IDS_DIUALLINECHART',
    base: 'viz/line',
    'modules' : {
    
      /**
       * 'sizeLegend' : {}
       */
      main : {
              controllers : {
                'interaction' : {
                  id : 'sap.viz.modules.controller.interaction',
                  configure : {
                    propertyCategory : 'interaction'
                  }
                }
              },
       
        modules : {
         
          /**
           * 'xAxis2' : { },
           */
        
            plot : {
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
                position : 'right',
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
          targetModule : 'main.xAxis',
          target : 'scale',
          sourceModule : 'main.plot',
          source : 'categoryScale'
        }, {
          targetModule : 'legend',
          target : 'colorPalette',
          sourceModule : 'main.plot',
          source : 'getColorPalette'
        }, {
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
          source : 'secondaryScale'
        }, {
      targetModule : 'main.yAxis',
      target : 'title',
      sourceModule : 'main.plot',
      source : 'primaryAxisTitle'
      }, {
      targetModule : 'main.yAxis2',
      target : 'title',
      sourceModule : 'main.plot',
      source : 'secondAxisTitle'
      },{
            targetModule : 'main.yAxis',
            target : 'color',
            sourceModule : 'main.plot',
            source : 'primaryAxisColor'
          }, {
            targetModule : 'main.yAxis2',
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