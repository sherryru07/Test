sap.riv.module(
{
  qname : 'sap.viz.manifests.MultiDualVerticalBarChart',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
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
{  qname : 'sap.viz.modules.manifests.xy.VerticalBar',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.BaseMultipleChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.BaseMultipleXYChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.MultiVerticalBarChart',
  version : '4.0.0'
}
],
function Setup(Manifest,Constants) {
  var multiVBarChart = {
    id : 'viz/multi_dual_column',
    name : 'IDS_MULTIDUALVERTICALBARCHART',
    base : 'viz/multi_column',
    modules : {
      main : {
        configure : {
          properties : {
            'mergeDataRange' : ['primary', 'second']
          }
        },
        modules: {
          plot : {
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
                    'description':'Settings for the value axis at left or bottom of an XY chart with 2 value axis.'
                  }
                },
              yAxis2 : {
                id : 'sap.viz.modules.axis',
                configure : {
                  'description':'Settings for the value axis at right or top of an XY chart with 2 value axis.',
                 propertyCategory : 'yAxis2',
                  properties : {
                    title : {
                      visible : false
                    },
                    type : 'value',
                    position : 'right'
                  },
                  propertiesOverride : {
                    title : {
                      isExported : false
                    }                    
                  }
                }
              }
            }
          }
        }
      }
    },
    feeds:{
      multiplier:{
      max:1
     },
     secondaryValues:
     {
       min: 1,
    max : Number.POSITIVE_INFINITY 
     },
    axisLabels:{
        max:1
      }
    },
    dependencies : {
      attributes : [
      {
        targetModule : 'main.xAxis2',
        target : 'scale',
        sourceModule : 'main',
        source : 'xCategoryScale'
      }, 
      {
        targetModule : 'main.yAxis',
        target : 'scale',
        sourceModule : 'main',
        source : 'yCategoryScale'
      },
      {
        targetModule : 'main',
        target : 'primaryDataRange',
        sourceModule : 'main.plot.plot',
        source : 'primaryDataRange'
      },
      {
        targetModule : 'main.plot.plot',
        target : 'primaryDataRange',
        sourceModule : 'main',
        source : 'primaryDataRange'
      },
      {
        targetModule : 'main',
        target : 'secondDataRange',
        sourceModule : 'main.plot.plot',
        source : 'secondDataRange'
      },
      {
        targetModule : 'main.plot.plot',
        target : 'secondDataRange',
        sourceModule : 'main',
        source : 'secondDataRange'
      },
      {
        targetModule : 'main.plot.yAxis',
        target : 'scale',
        sourceModule : 'main.plot.plot',
        source : 'primaryScale'
      }, {
        targetModule : 'main.plot.yAxis',
        target : 'title',
        sourceModule : 'main.plot.plot',
        source : 'primaryAxisTitle'
      },
      {
        targetModule : 'main.plot.yAxis2',
        target : 'scale',
        sourceModule : 'main.plot.plot',
        source : 'secondScale'
      }, {
        targetModule : 'main.plot.yAxis2',
        target : 'title',
        sourceModule : 'main.plot.plot',
        source : 'secondAxisTitle'
      },
      {
        targetModule : 'main.plot.yAxis',
        target : 'color',
        sourceModule : 'main.plot.plot',
        source : 'primaryAxisColor'
      },
      {
        targetModule : 'main.plot.yAxis2',
        target : 'color',
        sourceModule : 'main.plot.plot',
        source : 'secondAxisColor'
      },
      {
        targetModule : 'main.plot.xAxis',
        target : 'scale',
        sourceModule : 'main.plot.plot',
        source : 'categoryScale'
      },
      {
        targetModule : 'legend',
        target : 'colorPalette',
        sourceModule : 'main.plot.plot',
        source : 'colorPalette'
      }
      ]
    }
  };

  Manifest.register(multiVBarChart);
});