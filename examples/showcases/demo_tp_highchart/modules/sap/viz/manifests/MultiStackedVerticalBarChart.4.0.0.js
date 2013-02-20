sap.riv.module(
{
  qname : 'sap.viz.manifests.MultiStackedVerticalBarChart',
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
{  qname : 'sap.viz.modules.manifests.xy.StackedVerticalBar',
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
function Setup(Manifest) {
  var multiBarChart = {
    id : 'viz/multi_stacked_column',
    name : 'IDS_MULTISTACKEDVERTICALBARCHART',
    base : 'viz/multi_column',
    modules : {
      main : {
        modules: {
          plot : {
            id : 'sap.viz.modules.xycontainer',
            modules : {
              plot : {
                id : 'sap.viz.modules.stackedverticalbar',
                configure : {
              'description': 'Settings regarding the chart area and plot area as well as general chart options.',
                  propertyCategory : 'plotArea'
                }
              },
              dataLabel : {
                id : 'sap.viz.modules.datalabel',
                configure : {
                  properties : {
                    automaticInOutside : false,
                    isStackMode : true,
                    showZero : false
                  },
                  propertiesOverride : {
                    position : {
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
      axisLabels:{
      max:1
    },
    secondaryValues: null
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
        /**
         * [jimmy/8/8/2012]each node in the path may have several entities
         * like main.plot, we may create several main.plots
         * (here the xycontainer), by using 'main.plot.xAxis'
         * here we actually means for xAxis in each main.plot
         * 
         * in the future, we may need support more complicated dependency resolving
         * like 'the 3rd xycontainer's xAxis', can be described
         * as main.plot[2].xAxis
         */
        targetModule : 'main.plot.yAxis',
        target : 'scale',
        sourceModule : 'main.plot.plot',
        source : 'primaryScale'
      },{
    targetModule : 'main.plot.yAxis',
        target : 'title',
        sourceModule : 'main.plot.plot',
        source : 'primaryAxisTitle'
      }, {
        targetModule : 'main.plot.xAxis',
        target : 'scale',
        sourceModule : 'main.plot.plot',
        source : 'categoryScale'
      }, {
        targetModule : 'legend',
        target : 'colorPalette',
        sourceModule : 'main.plot.plot',
        source : 'colorPalette'
      }
      ]
    }
  };

  Manifest.register(multiBarChart);
});