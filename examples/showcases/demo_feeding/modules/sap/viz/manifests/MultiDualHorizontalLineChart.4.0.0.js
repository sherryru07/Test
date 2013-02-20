sap.riv.module(
{
  qname : 'sap.viz.manifests.MultiDualHorizontalLineChart',
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
{  qname : 'sap.viz.modules.manifests.xy.Line',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.BaseMultipleChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.BaseMultipleXYChart',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.MultiHorizontalLineChart',
  version : '4.0.0'
}
],
function Setup(Manifest,Constants) {
  var multiBarChart = {
    id : 'viz/multi_dual_horizontal_line',
    name : 'IDS_MULTIDUALHORIZONTALLINECHART',
    base : 'viz/multi_horizontal_line',
    modules : {
      main : {
        configure : {
          properties : {
            'mergeDataRange' : ['primary', 'second']
          }
        },
        modules: {
          plot : {
            id : 'sap.viz.modules.xycontainer',
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
                    'description':'Settings for the value axis at left or bottom of an XY chart with 2 value axis.'
                  }
                },
              xAxis2 : {
                id : 'sap.viz.modules.axis',
                configure : {
                  'description':'Settings for the value axis at right or top of an XY chart with 2 value axis.',
                  propertyCategory : 'xAxis2',
                  properties : {
                    title : {
                      visible : false
                    },
                    type : 'value',
                    position : 'top'
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
        max:1,
        acceptMND: -1
      },
      regionColor:{
        acceptMND: 1
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
        targetModule : 'main.plot.xAxis',
        target : 'scale',
        sourceModule : 'main.plot.plot',
        source : 'primaryScale'
      },{
        targetModule : 'main.plot.xAxis',
        target : 'title',
        sourceModule : 'main.plot.plot',
        source : 'primaryAxisTitle'
      },
      {
        targetModule : 'main.plot.xAxis2',
        target : 'scale',
        sourceModule : 'main.plot.plot',
        source : 'secondaryScale'
      },{
        targetModule : 'main.plot.xAxis2',
        target : 'title',
        sourceModule : 'main.plot.plot',
        source : 'secondAxisTitle'
      },
      {
        targetModule : 'main.plot.xAxis',
        target : 'color',
        sourceModule : 'main.plot.plot',
        source : 'primaryAxisColor'
      },
      {
        targetModule : 'main.plot.xAxis2',
        target : 'color',
        sourceModule : 'main.plot.plot',
        source : 'secondAxisColor'
      },
      {
        targetModule : 'main.plot.yAxis',
        target : 'scale',
        sourceModule : 'main.plot.plot',
        source : 'categoryScale'
      }, 
      {
        targetModule : 'legend',
        target : 'colorPalette',
        sourceModule : 'main.plot.plot',
        source : 'getColorPalette'
      },
      {
        targetModule : 'legend',
        target : 'shapes',
        sourceModule : 'main.plot.plot',
        source : 'shapePalette'
      }
      ]
    }
  };

  Manifest.register(multiBarChart);
});