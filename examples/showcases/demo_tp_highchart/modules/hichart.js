sap.riv.require(
[
{
  qname : 'sap.viz.util.ColorSeriesGenerator',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.feeds.Manifest',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.feed.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifests.Viz',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.xycontainer',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.axis',
  version : '4.0.0'
}
],
function main(ColorSeriesGenerator, Manifest, feeds, constants, Viz, Objects) {

  //TODO MND cartesian

  function getRawVals(dim) {
    if (!dim)
      return null;
    else
      return Array.prototype.map.call(dim, function(o) {
        return o.val;
      });
  }


  function flattenData(data) {
    var d1 = data.getAnalysisAxisDataByIdx(0) ? data.getAnalysisAxisDataByIdx(0).values[0] : null,
      d2 = data.getAnalysisAxisDataByIdx(1) ? data.getAnalysisAxisDataByIdx(1).values[0] : null,
      m1 = data.getMeasureValuesGroupDataByIdx(0) ? data.getMeasureValuesGroupDataByIdx(0).values[0] : null,
    //m2 = data.getMeasureValuesGroupDataByIdx(1)?data.getMeasureValuesGroupDataByIdx(1).values[0]:null;
      series = [], dimensions,
      axis1 = getRawVals(d1.rows),
      axis2 = d2 ? getRawVals(d2.rows) : null,
      sector = (d2 !== null) ? d2 : null,
      sl, i = 0;
      
    if (sector !== null) {
      sl = sector.rows.length;
      for ( i = 0; i < sl; i++) {
        series.push({
          "name" : sector.rows[i].val,
          "data" : getRawVals(m1.rows[i])
        });
      }
    } else {
      sl = d1.rows.length;
      for ( i = 0; i < sl; i++) {
        series.push([d1.rows[i].val, m1.rows[0][i].val]);
      }
      series = [{
        "data" : series
      }];
    }

    dimensions = (axis2 === null) ? null : axis1;
    return {
      "dimensionName" : d1.col.val,
      "dimensions" : dimensions,
      "measureName" : m1.col,
      "series" : series
    };
  }

  var fn = function(manifest) {
    //var defaultColorPalette = ColorSeriesGenerator.sap32();
    var width = null, height = null, data = null, props = null;

    function chart(selection) {
      selection.each(function() {

        //var format = d3.format('.2%');
        var xLabels = [];
        var highSeries = [];
        var i = 0, j = 0;

        var flattenedData = flattenData(data);
        xLabels = flattenedData["dimensions"];
        highSeries = flattenedData["series"];

        //remove svg elements generated by D3Componnent
        var container = props.chart.renderTo;
        if ( typeof container === "string")
          $("#" + container).html("");
        else if ( typeof container === "object" && container instanceof $)
          container.html("");

        //props.colors = colorPalette;
        if (xLabels.length > 0) {
          props.xAxis = {
            categories : xLabels,
            title : {
              text : flattenedData["dimensionName"]
            }
          };
          props.yAxis = {
            min : 0,
            title : {
              text : flattenedData["measureName"],
              align : 'high'
            },
            labels : {
              overflow : 'justify'
            }
          };
        }
        props.series = highSeries;
        var chart = new Highcharts.Chart(props);
      });
      return chart;
    }

    /**
     * set/get width
     */
    chart.width = function(value) {
      if (!arguments.length) {
        return width;
      }
      sizeChange = (width === value) && !sizeChange ? false : true;
      width = value;
      return chart;
    };

    /**
     * set/get height
     */
    chart.height = function(value) {
      if (!arguments.length) {
        return height;
      }
      sizeChange = (height === value) && !sizeChange ? false : true;
      height = value;
      return chart;
    };

    /**
     * set/get data, for some modules like Title, it doesn't need data
     */

    chart.data = function(value) {
      if (!arguments.length) {
        return data;
      }
      data = value;
      return chart;
    };

    /**
     * set/get properties
     */
    chart.properties = function(_) {
      if (arguments.length === 0) {
        return props;
      }
      Objects.extend(true, props, _);
      //parseOptions();

      return chart;
    };
    props = manifest.props(null);
    return chart;
  };
  var aa1 = {
    'id' : 'AxisLabels',
    'name' : 'IDS_AXISLABELS',
    'type' : constants.Type.Dimension,
    'min' : 1,
    'max' : 1,
    'acceptMND' : -1,
    'aaIndex' : 1
  };
  var aa2 = {
    'id' : 'HiRegionColor',
    'name' : 'Region Color',
    'type' : constants.Type.Dimension,
    'min' : 0,
    'max' : 1,
    'aaIndex' : 2,
    'acceptMND' : -1,
  };
  var valueAxis1 = {
    'id' : 'PrimaryValues',
    'name' : 'IDS_PRIMARYVALUES',
    'type' : constants.Type.Measure,
    'min' : 1,
    'max' : constants.Constraints.INF,
    'mgIndex' : 1
  };

  var valueAxis2 = {
    'id' : 'SecondaryValues',
    'name' : 'IDS_SECONDARYVALUES',
    'type' : constants.Type.Measure,
    'min' : 0,
    'max' : constants.Constraints.INF,
    'mgIndex' : 2
  };

  var module = {
    'id' : 'sap.viz.modules.hichart',
    'type' : 'CHART',
    'name' : 'hi pie',
    'properties' : null,
    'events' : null,
    'feeds' : [aa1, aa2, valueAxis1, valueAxis2],
    'css' : null,
    fn : fn
  };

  sap.viz.manifest.module.register(module);

  var hiChart = {
    'id' : 'tp/hichart',
    'name' : 'high Chart',
    'modules' : {
      main : {
        id : 'sap.viz.modules.xycontainer', 
        modules : {
          plot : {
            id : 'sap.viz.modules.hichart',
            configure : {
              propertyCategory : 'hichart'
            }
          }
        }
      }
    },
    dependencies : {
      attributes : [],
      events : []
    }
  };
  Viz.register(hiChart);
});