sap.riv.module(
{
  qname : 'sap.viz.modules.radar',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.TextUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.dispatch',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.axis',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.ColorSeriesGenerator',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.ShapeSeriesGenerator',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Scaler',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.DrawUtil',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.tooltipDataHandler',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.BoundUtil',
  version : '4.0.0'
}
],
function Setup( callouts, types, texts, evtHub, axis, colorRange, shapeRange, scaler, global, 
  painter, langManager, tooltipDataHandler, Objects, BoundUtil) {
  return function ( conf, ctx ) {
    var width = 0, height = 0, data = {}, properties = {}, angles,
        rescale, styles = {}, radar, valueaxis, yscale = d3.scale.linear(), 
        defaults, brush = {}, colorPalette = [], shapePalette = [], textRuler,
        dispatch, container = null, ranges, selections = {}, selectionMode = 'multiple', 
        arrange, effects = ctx.effectManager;
    
    dispatch = evtHub("selectData", "deselectData", 
      "showTooltip", "hideTooltip", "initialized", 'startToInit');
    
    radar = {
      clazz : "spiderweb",
      node : null,
      color : colorRange.sap32(),
      shape : shapeRange.sapShapes(),
      radiusLength : 0,
      radius : d3.scale.linear(),
      anchor : { x : 0, y : 0 },
      radians : [],
      series : [],
      categories : [],
      caption : { 
        node : null,
        name : "category-axis-title",
        width : 0,
        height : 0
      },
      labels : {},
      locked : false,
    };
    
    valueaxis = {
      clazz : "valueaxis",
      anchor : { x : 0, y : 0 },
      ref : axis(global.get("sap.viz.modules.axis"), ctx),
      node : null,
      width : 0,
      height : 0
    };
    
//    properties = {
//      drawingEffect : "normal",
//      polarGrid : { visible : true, color : "#d8d8d8" },
//      polarAxis : { title : { visible : false, text : "Categories" } },
//      valueAxis : { visible : true, title : { visible : false, text : "Value" }, label : { formatString : null} },
//      line : { width : 2 },
//      surface : { fill : { visible : true, transparency : 0.3 } },
//      colorPalette : [],
//      shapePalette : [],
//      marker : { size : 6 },
//      tooltip : { enabled : true },
//      multichart : false
//    };
    properties = conf.props(null);
    
    css = {
     // background : "viz-plot-background",
      axisTitle : "viz-axis-title"
    },
    
    styles = {
      spacing : { hgap : 5, vgap : 5 },
     // background : { css : { key : "viz-plot-background", def : null } },
      alignment : { horizontal : "center" },
      polaraxis : { 
        clazz : "polar_axis", 
        color : "#6c6c6c", 
        weight : "1px",
        labels : { css : { key : "viz-polar-axis-label", def : null } },
        title : { css: { key : "viz-polar-axis-title", def : null } }
      },
      polargrid : { clazz : "polar_grid", color : "#d8d8d8", weight : "1px" },
      line : { clazz : "dataline" },
      valueaxis : { clazz : "value_axis", title : { css : { key : "viz-axis-title", def : null } }},
      marker : { clazz : "datapoint", css : { key : "viz-radar-marker", def : null },
                 stroke : "transparent" },
      labels : { color : "#333333", fontSize : "14px", fontWeight : "normal", fontFamily : "Arial" },
      tooltip : { radialOffset : 1 * 10  } // 1em
    };
    
    ranges = {
      dataline : {
        weight : [ 1, 7 ]
      },
      marker : {
        size : [ 4, 32 ]
      }
    };
    
    defaults = {
      options : $.extend( true, {}, properties ),
      styles : $.extend( true, {}, styles ),
      wording : {
        dash : " - ",
        dot : ".",
        slash : " / ",
        ellipsis : "...",
        series : "s",
        data : "d",
        measureIndex : " mi",
        and : " & "
      }
    };
    
    // only deal with domain values
    rescale = function () {
      var series = radar.series, min = arguments[0], max = arguments[1];
      // Measure values are always two-dimensional.
      radar.max = typeof max !== "undefined" ? max :
                  d3.max( d3.merge( d3.merge(series) ), function (_) { return _.val; } );
      radar.min = typeof min !== "undefined" ? min : 
                  d3.min( d3.merge( d3.merge(series) ), function (_) { return _.val; } );
      
      if ( radar.min === radar.max ) {
        if ( radar.min === 0 ) radar.max = 100;
        if ( radar.min < 0 ) radar.max = 0;
        if ( radar.min > 0 ) radar.min = 0;
      }
      
      if ( !radar.min || radar.min === "NaN" ) {
        radar.min = 0;
      }
      if ( !radar.max || radar.max === "NaN" ) {
        radar.max = 0;
      }
    };

    textRuler = function ( text, style ) {
      return texts.fastMeasure(text, style["font-size"] || style.fontSize,
        style["font-weight"] || style.fontWeight, style["font-family"] || style.fontFamily);
    };
    
    /* Layout algorithm. Arguments are preferred widths */
    arrange = function () {
      var sizes = arguments[0],
          axisWidth = sizes.valueaxis, lblW = sizes.lblW, lblH = sizes.lblH,
          caption = sizes.caption,
          pole = {}, w, r, adjust, bbox,
          hgap = styles.spacing.hgap, vgap = styles.spacing.vgap,
          counter = -1, mem = [];
      
      (function layout() {
        counter++;
        if ( lblH - 1/3 * height > 0 ) lblH = 0;
        if ( caption.height - 1/3 * height > 0 ) caption.height = 0;
        if ( caption.width - 2/3 * width > 0 ) caption.width = 0;  
        
        if ( width - height >= 0 ) {
          r = ( height - 2 * (lblH + 2 * vgap) - 
            (caption.height !== 0 ? caption.height + 2 * vgap : 0) ) / 2;
          w = 2 * r + 2 * (lblW + 2 * hgap) + axisWidth;
          if ( w > width ) {
            adjust = w - width;
            r = ( height - adjust - 2 * (lblH + 2 * vgap) - 
              (caption.height !== 0 ? caption.height + 2 * vgap : 0) ) / 2;
          }
        } else {
          r = ( width - 2 * (lblW + 2 * hgap) - axisWidth ) / 2;
        }
    
        mem[counter] = r;
        if ( typeof mem[counter - 2] !== 'undefined' && mem[counter - 2] <= 0 ) { return 0; } // prevent infinite loops   
        
        if ( lblW > r || r <= 0 ) {
          lblW = 0, lblH = 0; 
          caption.width = 0, caption.height = 0; 
          r = layout();
          
          if ( axisWidth > r) {
            axisWidth = 0;
            r = layout();
            if ( width >= height ) {
              if ( r < height / 2 ) r = height / 2, vgap = 0;
            } else {
              if ( r < width / 2 ) r = width / 2, hgap = 0;
            }
          }
        }
        return r;
      })();
      
      bbox = { // bounding box
        width : axisWidth + 2 * r + 4 * hgap + 2 * lblW,
        height : 2 * ( lblH + r ) + 4 * vgap + 
          (caption.height !== 0 ? caption.height + 2 * vgap : 0)
      };
      
      radar.radiusLength = r;
      valueaxis.width = axisWidth;
      valueaxis.anchor.x = 0;
      valueaxis.anchor.y = lblH + 2 * vgap;
      radar.caption.width = caption.width;
      radar.caption.height = caption.height;
      pole.x = axisWidth + lblW + r + hgap * 2;
      pole.y = lblH + r + vgap * 2;
      caption.x = pole.x;
      caption.y = pole.y + r + lblH + 2 * vgap + caption.height / 2;
      
      var xoffset = 0, yoffset = 0;
      if ( axisWidth ) {
        valueaxis.ref.gridlineLength(pole.x - axisWidth);
        if ( width > height ) {
          xoffset = width / 2 - bbox.width / 2;
          valueaxis.anchor.x += xoffset;
          pole.x += xoffset;
          caption.x += xoffset;
        }
      } else {
        if ( width > height ) {
          xoffset = width / 2 - pole.x;
          pole.x += xoffset;
          caption.x += xoffset;
        } 
      }
      
      //radar.caption.node.attr("transform", "translate(" + caption.x + "," + caption.y + ")");
      radar.caption.node.attr("x", caption.x);
      radar.caption.node.attr("y", caption.y);
      valueaxis.node.attr("transform", "translate(" + 
        valueaxis.anchor.x + "," + valueaxis.anchor.y + ")");
      radar.node.attr("transform", "translate(" + pole.x + "," + pole.y + ")");
      radar.pole = pole;
      radar.labels.width = lblW;
      radar.labels.height = lblH;
    };
    
    /*
     * Creates scale function/object for angular computation.
     * 
     * @param nulls - indexes of empty elements
     * @param N - numbers of non-empty elements
     * @param cardinal - numbers of all elements
     */
    angles = function ( nulls, N, cardinal ) {
      var domain = [], intervals = [], i;
      if ( !nulls.length ) {
        return d3.scale.linear()
          .domain([ 0, cardinal ])
          .range([ 0, 2 * Math.PI ]);
      }
      //if ( nulls.length > N ) callouts.error("Invalid argument.");
      for ( i = 0; i < cardinal; i++ ) {
        domain.push(i);
        intervals.push(i / cardinal * 2 * Math.PI);
      }
      for ( i = nulls.length - 1; i >= 0; i-- ) {
        intervals.splice(nulls[i].order, 1);
      }
      
      return d3.scale.ordinal()
            .domain(domain)
            .range(intervals);
    };
    
    function chart ( selection ) {
      BoundUtil.drawBound(selection, width, height);
      dispatch.startToInit();
      selection.each(function ( datum ) {
        var parent = d3.select(this), prefix = defaults.wording;
        valueaxis.node = null;
        radar.node = null;
        radar.radiusLength = 0;
        container = parent;
        
        parent.select(prefix.dot.concat(valueaxis.clazz)).remove();
        parent.select(prefix.dot.concat(radar.clazz)).remove();
        parent.select( prefix.dot + radar.caption.name ).remove();
        
        valueaxis.node = parent.append("g").attr("class", valueaxis.clazz);
        radar.node = parent.append("g").attr("class", radar.clazz + ' datashapesgroup');
        radar.caption.node = parent.append("text").attr("class", radar.caption.name);
        
        styles.valueaxis.title.css.def = ctx.styleManager.query(styles.valueaxis.title.css.key);
        styles.polaraxis.labels.css.def = ctx.styleManager.query(styles.polaraxis.labels.css.key);
        
        var cardinal, lblW, lblH, r, i, j, pole = {},
            labels = radar.categories, series = radar.series,
            hgap = styles.spacing.hgap, vgap = styles.spacing.vgap, 
            radians = radar.radians;
        
        var ls = []; // Labels array
        for ( i = 0; i < labels.length; i++ ) {
          ls.push( textRuler(labels[i], styles.polaraxis.labels.css.def) );
        }
        lblW = d3.max( ls, function (_) { return _.width; } );
        lblH = d3.max( ls, function (_) { return _.height; } );

        yscale.domain([radar.min, radar.max])
              .range([200, 0]); // fake radius length
        scaler.perfect(yscale);
        
        valueaxis.ref.scale(yscale).properties({
          label : {
        	visible : true,
        	formatString : properties.valueAxis.label.formatString        	  
          },
          title : {
            visible : properties.valueAxis.title.visible,
            text : properties.valueAxis.title.text
          },
          type : "value",
          position : "left",
          gridline : {
            visible : true,
            showFirstLine : true,
            showLastLine : true,
            type : "dotted"
          }
        });
        
        valueaxis.width = properties.valueAxis.visible ? valueaxis.ref.getPreferredSize().width : 0;
        if ( valueaxis.width > 0.5 * width ) valueaxis.width = 0;
        
        arrange({ 
          valueaxis : valueaxis.width, 
          lblW : lblW,
          lblH : lblH, 
          caption : {
            width : textRuler( properties.polarAxis.title.visible ? 
              properties.polarAxis.title.text : 0, styles.polaraxis.labels.css.def ).width,
            height : textRuler( properties.polarAxis.title.visible ? 
              properties.polarAxis.title.text : 0, styles.polaraxis.labels.css.def).height,
          }});
        
        if ( properties.polarAxis.title.visible && radar.caption.width 
             && radar.caption.height ) {
          radar.caption.node
            .text(properties.polarAxis.title.text)
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .style("font-family", styles.valueaxis.title.css.def["font-family"])
            .style("font-size", styles.valueaxis.title.css.def["font-size"])
            .style("font-weight", styles.valueaxis.title.css.def["font-weight"])
            .style("fill", styles.valueaxis.title.css.def["fill"]);
        }
        
        yscale.range([ radar.radiusLength, 0 ]); // Re-calculate scale
        scaler.perfect(yscale);
        
        valueaxis.ref.scale(yscale);
        if ( properties.valueAxis.visible && valueaxis.width ) {
          valueaxis.node.call(valueaxis.ref);
        }
        
        var line = radar.node.append("g").attr("class", "polaraxes-group")
                  .selectAll(styles.polaraxis.clazz).data(labels);
        // Create nodes upon new data injected
        line.enter()
          .append("g")
          .attr("transform", function (d , i) {
            var rotation = i / labels.length * 360 - 90;
            if ( rotation > -180 && rotation < 180 ) {
              radians.push({ axisIdx : i,
                radian : -1 * rotation * Math.PI / 180 });
            } else { // rotation > 180 and rotation < 270
              radians.push({ axisIdx : i,
                radian : (360 - rotation) * Math.PI / 180 });
            }
            return "rotate("+ rotation +") translate("+ radar.radiusLength +")";
          });
        line.append("svg:line")
          .attr("x2", -1 * radar.radiusLength)
          .style("stroke", effects.register({
            drawingEffect: "normal",
            fillColor: styles.polaraxis.color
          }))
          .style("stroke-width", styles.polaraxis.weight)
          .style("fill", "transparent");
        
        radians.sort( function (a, b) { return a.radian - b.radian; } );
        
        var angle; // Polar angle
        
        if ( radar.labels.width && radar.labels.height ) {
          // Plot category labels
          line.append("g").attr("class", "categoryLabel")
            .append("text")
            .text(function (d, i) { return d; })
            .attr("text-anchor", "middle")
            .attr("alignment-baseline", "middle")
            .attr("transform", function (d, i) {
              angle = i / labels.length * 360 - 90;
              if ( angle % 90 === 0 ) {
                if ( angle === -90 || angle === 270 ) {
                  return "rotate(90) translate(0," + (-1 * ( 
                    textRuler(d, styles.polaraxis.labels.css.def).height / 2 + vgap ) ) +")";
                } else if ( angle === 0 ) {
                  return "translate("+ ( textRuler(d, styles.polaraxis.labels.css.def).width / 2 + hgap ) +")";
                } else if ( angle === 180 ) {
                  return "rotate(180) translate(" + ( -1 * ( 
                    textRuler(d, styles.polaraxis.labels.css.def).width / 2 + hgap ) ) +")";
                } else {
                  return "rotate(-90) translate(0," + ( 
                    textRuler(d, styles.polaraxis.labels.css.def).height / 2 + vgap ) +")";
                }
              }
              if ( (angle > -90 && angle < 0) || (angle > 0 && angle < 90) ) {
                return "rotate("+ (-1 * angle) +") translate(" + 
                  ( textRuler(d, styles.polaraxis.labels.css.def).width / 2 + hgap ) +",0)";
              }
              return "rotate("+ (-1 * angle) +") translate(" +
                ( -1 * (textRuler(d, styles.polaraxis.labels.css.def).width / 2 + hgap) ) +",0)";

            })
            .style("font-family", styles.polaraxis.labels.css.def["font-family"])
            .style("font-size", styles.polaraxis.labels.css.def["font-size"])
            .style("fill", effects.register({
              drawingEffect: "normal",
              fillColor: styles.polaraxis.labels.css.def["fill"]
            }));        
        }
        
        if ( !radar.min && !radar.max ) {
          dispatch.initialized();
          return;
        }
        
        // Reset value scales to desired orders
        yscale.domain([ radar.max, radar.min ]);
        scaler.perfect(yscale);
        
        cardinal  = radar.categories.length;
        
        // Default polar angle scale
        angle = angles([], cardinal, cardinal);
        
        // Path generator of line data on the radar plate
        var polarLine = d3.svg.line.radial()
          .interpolate("linear")
          .radius(yscale)
          .angle(function (d, i) { return angle(i); });

        var tickValues = yscale.ticks( yscale.tickNum ), polarTicks = [], circle = [];
        for ( i = 0; i < tickValues.length; i++ ) {
          circle = [];
          for ( j = 0; j < labels.length; j++ ) {
            circle.push(tickValues[i]);
          }
          polarTicks.push(circle);
        }

        if ( properties.polarGrid.visible ) {
          radar.node.append("g").attr("class", "polargrid-group")
            .selectAll( "." + styles.polargrid.clazz )
            .data( polarTicks )
          .enter()
            .append("path")
            .attr("class", styles.polargrid.childClazz)
            .attr("d", function (d) { return polarLine(d) + "Z"; })
            .style("fill", "none")
            .style("stroke", effects.register({
              drawingEffect : "normal",
              fillColor : styles.polargrid.color}))
            .style("stroke-width", styles.polargrid.weight);
        }
        
        // Plot actual data
        radar.node.append("g")
          .attr("class", "dataline-group")
          .selectAll( "." + styles.line.clazz )
          .data(series)
        .enter()
          .append("path")
          .attr("class", function (d, i) {
            return prefix.series.concat(i + " ").concat(styles.line.clazz);
           })
          .attr("d", function (d, i) { // Each d is a data series
            if ( !d.length ) return;
            var numbers = [];
            angle = angles([], cardinal, cardinal);
            for ( var n = 0; n < d.length; n++ ) numbers.push(d[n].val);
            if ( numbers.length !== radar.categories.length ) {
              angle = angles(chart.vacants[i], numbers.length, cardinal);
            }
            return polarLine(numbers) + "Z"; 
          })
          .style("fill", function (d, i) {
            if ( !d.length ) return; 
            if ( properties.surface.fill.visible ) {
              return effects.register({
                drawingEffect: "normal",
                fillColor: d[0].color
              });
            }
          })
          .style("fill-opacity", function (d, i) {
            if ( properties.surface.fill.visible ) return properties.surface.fill.transparency;
            return 0;
          })
          .style("stroke", function (d, i) { 
            if ( !d.length ) return;
            return effects.register({
              drawingEffect: "normal",
              fillColor: d[0].color}); 
          })
          .style("stroke-width", properties.line.width > ranges.dataline.weight[1] || 
             properties.line.width < ranges.dataline.weight[0] ? 
             defaults.options.line.width : properties.line.width
          );
        
        // draw markers
        var markerContainer = radar.node.append("g")
          .attr("class", "marker-container")
          .selectAll("." + styles.marker.clazz)
          .data(series).enter().append("g");

        markerContainer.attr("class", "marker-group").each(function ( datum, index ) { 
          // for each series
          var nulls = chart.vacants[index], radians = [];
          $.each(radar.categories, function ( i, d ) { 
            radians.push(i / cardinal * 2 * Math.PI - 0.5 * Math.PI);
          });
          for ( var i = nulls.length - 1; i >= 0; i-- ) {
            radians.splice(nulls[i].order, 1);
          }
          
          d3.select(this).append("g")
            .attr("class", "marker-series")
            .selectAll("." + styles.marker.clazz)
            .data(datum)
            .enter()
            .append('g').attr('class','datashape')
            .attr("transform", function (d, i) {
              var x = yscale(d.val) * Math.cos(radians[i]);
                  y = yscale(d.val) * Math.sin(radians[i]);
              return "translate("+ x + ", " + y + ") rotate(0)";
            })
            .append("path")
            .attr("class", function (d, i) {
              return (
                prefix.series + index + " " +       // series index 
                prefix.data + d.order + " " +       // data index 
                styles.marker.clazz +               // class
                prefix.measureIndex + d.ctx.path.mi // measure index
              );
            })
            .attr("d", function (d, i) {
              return painter.createMarkerData({
                type : d.shape,
                rx : styles.marker.size / 2,
                ry : styles.marker.size / 2,
                borderWidth : 2
              });
            })
            .style("fill", function (d) {
              var parameters = {
                drawingEffect : properties.drawingEffect,
                graphType : d.shape,
                fillColor : d.color,
                direction : 'vertical',
              };
              return effects.register(parameters);
            });
          });
        
        // create place holder elements for empty values
        var phantomMarker = radar.node.append("g")
          .attr("class", "phantom-marker-group")
          .selectAll(".phantom-marker-series").data(chart.vacants)
          .enter().append("g");
          
        phantomMarker
          .attr("class", "phantom-marker-series")
          .each(function ( datum, index ) {
            d3.select(this)
              .selectAll(".phantom-marker")
              .data(datum)
            .enter()
              .append("path")
              .attr("class", function (d, i) {
                return (
                  prefix.series + index + " " +       // series index 
                  prefix.data + d.order + " " +       // data index 
                  prefix.measureIndex + d.ctx.path.mi // measure index
                );
              })
              .style("fill", "none");
          });
        
        dispatch.initialized();
      });
    }
    
    chart.dataLabel = function(_){}
    
    chart.data = function (_) {
      if ( !arguments.length ) return data;
      data = _, radar.series = [], radar.categories = [],
      radar.radians = [],
      shapePalette = [], colorPalette = [], chart.vacants = [];
      
      // Data processing is effective upon the
      // completion of various customizations.
      if ( !chart.caliberated ) return chart;
      
      // Analysis Axis 1 and one Measure Group 
      // are required to be fed to radar chart.
      var aa1 = data.getAnalysisAxisDataByIdx(0).values,
          mg = data.getMeasureValuesGroupDataByIdx(0).values,
          aa2 = data.getAnalysisAxisDataByIdx(1),
          aa3 = data.getAnalysisAxisDataByIdx(2),
          series = [], depth, cardinal, layer, hierarchy = [],
          feedings = {
            aa2 : { fed : aa2 !== null && aa2.values.length ? true : false, axesFed : false, hasMND : false },
            aa3 : { fed : aa3 !== null && aa3.values.length ? true : false, axesFed : false, hasMND : false }
          }, i, j, x;
      
      radar.mndized = aa1[0].type && aa1[0].type.toLowerCase() === "mnd" ? true : false;
      
      // Extracts dimension labels
      for ( i = 0; i < aa1.length; i++ ) {
        layer = [];
        for ( j = 0; j < aa1[i].rows.length; j++ ) {
          layer.push(aa1[i].rows[j].val);
        }
        hierarchy.push(layer);
      }
      
      depth = hierarchy.length, cardinal = hierarchy[0].length;
      if ( depth === 1 ) {
        for ( i = 0; i < cardinal; i++ ) { 
          radar.categories.push(hierarchy[0][i] === '' || hierarchy[0][i] === null ?
            langManager.get('IDS_ISNOVALUE') : hierarchy[0][i]);
        }
      } else { // splice layered dimension labels
        var column = [];
        for ( i = 0; i < cardinal; i++ ) {
          for ( j = 0; j < depth; j++ ) column.push(hierarchy[j][i]);
          radar.categories.push(column.join(defaults.wording.slash));
          column = [];
        }
      }

      cardinal = mg[0].rows[0].length;

      // deal with two-dimensional data
      if ( radar.mndized ) {
        /*
         * In case of AA1 is MNDized, each of the 
         * analysis axis has the chance of getting 
         * fed by one, two or not any axes at all.
         */
        if ( !feedings.aa2.fed && !feedings.aa3.fed ) {
          colorPalette.push(radar.color(0));
          shapePalette.push(radar.shape(0));
        }
        
        // AA2's always bound to rows in cross-table.
        if ( feedings.aa2.fed ) {
          for ( i = 0; i < aa2.values[0].rows.length; i++ ) {
            colorPalette.push(radar.color(i));
          }
          if ( !feedings.aa3.fed ) shapePalette.push(radar.shape(0));
        }
        
        // AA3's usually bound to columns in cross-table.
        if ( feedings.aa3.fed ) {
          for ( i = 0; i < aa3.values[0].rows.length; i++ ) {
            shapePalette.push(radar.shape(i));
          }
          if ( !feedings.aa2.fed ) colorPalette.push(radar.color(0));
        }
        
        for ( i = 0; i < mg.length; i++ ) {
          for ( j = 0; j < mg[i].rows.length; j++ ) {
            for ( x = 0; x < cardinal; x++ ) {
              mg[i].rows[j][x].color = colorPalette[x] || radar.color(0);
              if ( feedings.aa2.fed ) {
                mg[i].rows[j][x].shape = shapePalette[j] || radar.shape(0);
              } else {
                mg[i].rows[j][x].shape = shapePalette[x] || radar.shape(0);
              }
            }
          }
        }
        
        // Transform measure group into series.
        var entry, temp = [], item = [];
        for ( i = 0; i < mg[0].rows.length; i++ ) {
          entry = [];
          for ( j = 0; j < mg.length; j++ ) {
            entry.push(mg[j].rows[i]);
          }
          temp.push(entry);
        }

        for ( i = 0; i < temp.length; i++ ) {
          // process each same row of cross tables
          for ( x = 0; x < cardinal; x++ ) {
            // loops against columns
            for ( j = 0; j < temp[i].length; j++, nulls = [] ) {
              item.push(temp[i][j][x]);
            }
            series.push(item);
            item = [];
          }
        }
        
        $.each(series, function ( index, item ) {
          var values = item, nulls = [];
          for ( var i = 0; i < values.length; i++ ) {
            values[i].order = i; // actual data index
            if ( values[i].val === null ) nulls.push(values[i]);
          }
          for ( i = values.length - 1; i >= 0; i-- ) {
            if ( values[i].val === null ) values.splice(i, 1);
          }
          chart.vacants.push(nulls);
        });
        
        if ( properties.polarAxis.title.text === "Categories" ) { // not customized
          properties.polarAxis.title.text = langManager.get('IDS_DEFAULTMND');
        }
      } else {
        if ( feedings.aa2.fed ) {
          for ( i = 0; i < aa2.values.length; i++ ) {
            if ( aa2.values[i].type && 
                 aa2.values[i].type.toLowerCase() === "mnd" ) {
              feedings.aa2.hasMND = true;
            }
          }
          if ( feedings.aa2.hasMND ) {
            if ( aa2.values.length >= 2 ) feedings.aa2.axesFed = true;
            else feedings.aa2.axesFed = false;
          } else {
            feedings.aa2.axesFed = true;
          }
        }
        
        if ( feedings.aa3.fed ) {
          for ( i = 0; i < aa3.values.length; i++ ) {
            if ( aa3.values[i].type && 
                 aa3.values[i].type.toLowerCase() === "mnd" ) {
              feedings.aa3.hasMND = true;
            }
          }
          if ( feedings.aa3.hasMND ) {
            if ( aa3.values.length >= 2 ) feedings.aa3.axesFed = true;
            else feedings.aa3.axesFed = false;
          } else {
            feedings.aa3.axesFed = true;
          }
        }
  
        // Extract series values from measure groups
        var colorCursor = 0, shapeCursor = 0, x,
            aa2mndized = feedings.aa2.hasMND && !feedings.aa2.axesFed,
            aa3mndized = feedings.aa3.hasMND && !feedings.aa3.axesFed,
            nulls = [];
            
        for ( i = 0; i < mg.length; i++ ) {
          if ( aa2mndized ) colorPalette.push(radar.color(i));
          if ( aa3mndized ) shapePalette.push(radar.shape(i));
          
          for ( j = 0; j < mg[i].rows.length; j++, nulls = []) {
            // filter out null values
            for ( x = 0; x < mg[i].rows[j].length; x++ ) {
              if ( mg[i].rows[j][x].val === null ) {
                nulls.push(mg[i].rows[j][x]);
              }
              mg[i].rows[j][x].order = x;
            }
            series.push(mg[i].rows[j]);
            chart.vacants.push(nulls);
            
            if ( feedings.aa2.fed ) {
              if ( aa2mndized ) {
                for ( x = 0; x < mg[i].rows[j].length; x++ ) {
                  mg[i].rows[j][x].color = radar.color(i);
                }
              } else if ( feedings.aa2.hasMND && feedings.aa2.axesFed ) {
                colorCursor++;
                colorPalette.push(radar.color(colorCursor));
                for ( x = 0; x < mg[i].rows[j].length; x++ ) {
                  mg[i].rows[j][x].color = radar.color(colorCursor);
                }
              } else {
                colorPalette.push(radar.color(j));
                for ( x = 0; x < mg[i].rows[j].length; x++ ) {
                  mg[i].rows[j][x].color = radar.color(j);
                }
              }
            } else {
              // Default value in case aa2 is fed nothing
              colorPalette.push(radar.color(0));
              for ( x = 0; x < mg[i].rows[j].length; x++ ) {
                mg[i].rows[j][x].color = radar.color(0);
              }
            }
            if ( feedings.aa3.fed ) {
              if ( aa3mndized ) {
                for ( x = 0; x < mg[i].rows[j].length; x++ ) {
                  mg[i].rows[j][x].shape = radar.shape(i);
                }
              } else if ( feedings.aa3.hasMND && feedings.aa3.axesFed ) {
                shapeCursor++;
                shapePalette.push(radar.shape(shapeCursor));
                for ( x = 0; x < mg[i].rows[j].length; x++ ) {
                  mg[i].rows[j][x].shape = radar.shape(shapeCursor);
                }
              } else {
                if ( feedings.aa2.fed ) {
                  if ( feedings.aa2.hasMND ) {
                    shapePalette.push(radar.shape(j));
                    for ( x = 0; x < mg[i].rows[j].length; x++ ) {
                      mg[i].rows[j][x].shape = radar.shape(j);
                    }
                  } else {
                    for ( x = 0; x < mg[i].rows[j].length; x++ ) {
                      shapePalette.push(radar.shape(x));
                      mg[i].rows[j][x].shape = radar.shape(x);
                    }
                  }
                }

              }
            } else {
              shapePalette.push(radar.shape(0));
              for ( x = 0; x < mg[i].rows[j].length; x++ ) {
                mg[i].rows[j][x].shape = radar.shape(0);
              }
            }
          }
        }
        for ( i = 0; i < series.length; i++ ) {
          for ( j = series[i].length - 1; j >= 0; j-- ) {
            for ( var n = 0; n < chart.vacants[i].length; n++ ) {
              if ( chart.vacants[i][n].order === j ) series[i].splice(j, 1);
            }
          }
        }
        if ( properties.polarAxis.title.text === "Categories" ) { // not customized
          properties.polarAxis.title.text = combine_dimension_titles(aa1);
        }
      }
      if ( properties.valueAxis.title.text === "Value" ) {
        var measures = [];
        for ( i = 0; i < mg.length; i++ ) {
          measures.push(mg[i].col === '' || mg[i].col === null ? langManager.get('IDS_ISNOVALUE') : mg[i].col);
        }
        properties.valueAxis.title.text = measures.join(defaults.wording.and);
      }
      
      radar.series = series;
      radar.feedings = feedings;
      if ( !radar.locked ) rescale();
      
      return chart;
    };
    
    function combine_dimension_titles ( axes ) {
      var str = '';
      for ( var i = 0; i < axes.length; i++ ) {
        str = str.concat(axes[i].col.val === null ? langManager.get('IDS_ISNOVALUE') : axes[i].col.val + 
          defaults.wording.slash);
      }
      return str.lastIndexOf(defaults.wording.slash) > 0 ? 
             str.substr(0, str.lastIndexOf(defaults.wording.slash)) : str;
    }
    
    chart.primaryDataRange = function (_) {
      if ( !arguments.length ) return { 
        min : radar.min, max : radar.max 
      };
      radar.min = _.min;
      radar.max = _.max;
      rescale(_.min, _.max);
      radar.locked = true;
      return chart;
    };
    
    chart.colorPalette = function (_) {
      if ( !arguments.length ) return colorPalette;
      colorPalette = _;
      return chart;
    };
    
    chart.shapes = function (_) {
      if ( !arguments.length ) return shapePalette;
      shapePalette = _;
      return chart;
    };
    
    chart.dispatch = function (_) {
      if ( !arguments.length ) return dispatch;
      dispatch = _;
      return chart;
    };
    
    chart.properties = function (_) {
      if ( !arguments.length ) return properties;
      Objects.extend(true, properties, _);
      if ( properties.colorPalette.length ) radar.color.range(properties.colorPalette);
      if ( properties.shapePalette.length ) radar.shape.range(properties.shapePalette);
      styles.marker.size = properties.marker.size;
      if ( styles.marker.size > ranges.marker.size[1] ||  styles.marker.size < ranges.marker.size[0]) styles.marker.size =  6;
      styles.polargrid.color = properties.polarGrid.color;
      chart.caliberated = true;
      chart.data(data);
      return chart;
    };
    
    chart.afterUIComponentAppear = function(){
      dispatch.initialized(); 
    };
    
    chart.width = function (_) {
      if ( !arguments.length ) return width;
      var changed = width === _ ? false : true;
      width = _;
      if ( types.isEmptyObject(data) && height ) chart.data(data);
      if ( changed && !radar.locked  ) rescale();
      return chart;
    };
    
    chart.height = function (_) {
      if ( !arguments.length ) return height;
      var changed = height === _ ? false : true;
      height = _;
      if ( types.isEmptyObject(data) && width ) chart.data(data);
      if ( changed && !radar.locked ) rescale();
      return chart;
    };
    
    chart.size = function (_) {
      if ( !arguments.length ) return {
        width : width, height : height
      };
      width = _;
      height = _;
      if ( types.isEmptyObject(data) && width && height ) chart.data(data);
      if ( width && height && radar.series.length ) rescale();
      return chart;
    };
    
    chart.parent = function (_) {
      if ( !arguments.length ) return container;
      container = _;
      return chart;
    };
    
    chart.hoverOnPoint = function ( cursor ) {
      var pole = radar.pole, theta, r,
          prefix = defaults.wording,
          radians = radar.radians,
          point = {
            x : cursor.x - pole.x,
            y : pole.y - cursor.y
          };
      r = Math.sqrt( Math.pow(point.x, 2) + Math.pow(point.y, 2) );
      
      // out of radius range
      if ( r > radar.radiusLength ) {
        if ( typeof chart.last !== "undefined" && 
            (types.isEmptyObject(selections)) ) {
          brush.straight(prefix.dot + prefix.data + chart.last, true);
        }
        // hide tool tip
        if ( properties.tooltip.enabled ) radar.prompt();
        return;
      }
      
      // range is (-PI, PI]
      theta = Math.atan2( point.y, point.x );
      
      // search for the target interval that the angle locates in
      var bisect = d3.bisector(function (d) { return d.radian; }).right,
          intv = bisect(radians, theta), mid, left, right, target;          
      
      if ( intv === 0 ) {
        left = radians.length - 1, right = 0;
        if ( radians[left].radian === Math.PI ) {
          mid = -1 * (Math.PI + Math.abs(radians[right].radian)) / 2;
          target = theta > mid ? target = radians[right].axisIdx : 
                   target = radians[left].axisIdx;
        } else {
          target = radians[0].axisIdx;
        }
      } else if ( intv === radians.length ) {
        target = radians[radians.length - 1].axisIdx;
      } else {
        left = intv - 1, right = intv;
        mid = (radians[left].radian + radians[right].radian) / 2;
        target = theta > mid ? target = radians[right].axisIdx : 
                 target = radians[left].axisIdx;
      }
      
      if ( typeof chart.last !== "undefined" && chart.last !== target ) {
        brush.straight(prefix.dot + prefix.data + chart.last, true);
      }
      
      brush.focus(prefix.dot + prefix.data + target, true);
      
      if ( !types.isEmptyObject(selections) ) {
        brush.dim(prefix.dot + prefix.data + target, true);
        for ( var key in selections ) {
          for ( var i = 0; i < selections[key].length; i++ )
            brush.highlight(selections[key]);
        }
      }
      
      // prompt tool tip if allowed
      if ( properties.tooltip.enabled ) radar.prompt(target);
      
      // Memorize the last processed axis index
      chart.last = target;
    };
    
    chart.clear = function () {
      if ( !arguments[0] ) {
        brush.straight().bright();
        selections = {};
      } else {
        brush.dim();
      }
    };
    
    chart.highlight = function ( objects ) {
      if ( !radar.min && !radar.max ) return;
      
      var target = objects instanceof Array ? objects : [ objects ], query = /[sS][0-9]+/, key;
      
      selectionMode = typeof arguments[1] === 'boolean' ? 'multiple' : ( 
        typeof arguments[1] === 'string' ? arguments[1].toLowerCase() :
        typeof arguments[2] === 'string' ? arguments[2].toLowerCase() : 'multiple');
          
      brush.highlight(target);
      
      for ( var i = 0, exists = false; i < target.length; i++, exists = false ) {
        key = target[i].className.baseVal.match(query)[0];
        if ( selections[key] ) {
          for ( var j = 0; j < selections[key].length; j++ ) {
            if ( selections[key][j] === target[i] ) exists = true;
          }
          if ( !exists ) selections[key].push(target[i]);
        } else {
          selections[key] = [];
          selections[key].push(target[i]);
        }
      }

      if ( selectionMode === 'single' ) return;

      var cardinal, seriesOrder;
      for ( var n in selections ) {
        if ( selections.hasOwnProperty(n) ) {
          seriesOrder = n.substr(1);
          cardinal = radar.series[seriesOrder].length;
          highlight(n, selections[n], cardinal);
        }
      }
    };
    
    function highlight( series, datapoints, cardinal ) {
      if ( datapoints.length === cardinal ) {
        brush.highlight2(defaults.wording.dot + series, true);
      } else {
        brush.highlight(datapoints);
      }
    }
    
    chart.unhighlight = function ( object ) {
      var target = object instanceof Array ? object : [object];
      brush.straight(target).dim(target);
     
      if ( selectionMode === 'single' ) { 
        selections = []; return; 
      }
      
      $.each(target, function ( index, item ) {
        var series = item.className.baseVal.match(/[sS][0-9]+/)[0];
      
        for ( var key in selections ) {
          for ( var i = 0; i < selections[key].length; i++ ) {
            if ( selections[key][i] === object ) {
              selections[key].splice(i, 1); break;
            }
          }
        }
        brush.straight2(defaults.wording.dot + series)
             .dim(defaults.wording.dot + series);
      });
    };
    
    chart.blurOut = function () {
      dispatch.hideTooltip();
    };
    
    radar.prompt = function () {
      if ( typeof arguments[0] === "undefined" ) { dispatch.hideTooltip(); return; }
      
      var volume, item = {}, elements, target = arguments[0], 
          prefix = defaults.wording, anchor = {}, angle = 0,
          r = radar.radiusLength - styles.tooltip.radialOffset, 
          translation = container[0][0].getTransformToElement(container[0][0].ownerSVGElement),
          i;
      
      for ( i = 0; i < radar.radians.length; i++ ) {
        if ( radar.radians[i].axisIdx === target ) {
          angle = radar.radians[i].radian; break;
        }
      }
      
      anchor.x = r * Math.cos(angle);
      anchor.y = r * Math.sin(angle);
      orient = angle <= 0.5 * Math.PI && angle > -0.5 * Math.PI ? "left" : "right";
      
      volume = {
        body : [],
        plotArea : {
          x : translation.e,
          y : translation.f,
          width : width,
          height : height
        },
        point : { // where tool tip arrow points to
          x : anchor.x + radar.pole.x + translation.e,
          y : anchor.y < 0 ? 
              Math.abs(anchor.y) + radar.pole.y + translation.f : 
              radar.pole.y - anchor.y + translation.f, 
          orientation : orient,
          angle : angle,
          range : {
            x : angle === 0.5 * Math.PI || angle === -0.5 * Math.PI ? 0 : 
                Math.abs(anchor.x),
            y : angle === 0 || angle === Math.PI || angle === -1 * Math.PI ? 0 : 
                Math.abs(anchor.y)
          }
        },
        footer : []
      };

      var aa1 = data.getAnalysisAxisDataByIdx(0).values,
          aa2 = radar.feedings.aa2.fed ? data.getAnalysisAxisDataByIdx(1).values : null,
          aa3 = radar.feedings.aa3.fed ? data.getAnalysisAxisDataByIdx(2).values : null,
          mg = data.getMeasureValuesGroupDataByIdx(0).values;
      
      elements = radar.node.selectAll("." + prefix.data + target);
      var col, row, cardinal, index, i, j, temp;
      
      if ( radar.mndized ) {
        item = { 
          name : radar.categories[target] === '' || radar.categories[target] === null ? 
                 langManager.get('IDS_ISNOVALUE') : radar.categories[target], 
          val : []
        };
        
        // normal case
        elements.each(function (d) {
          var entry = {};
          entry.color = d.color;
          entry.shape = d.shape;
          entry.value = d.val !== null ? d.val : langManager.get('IDS_ISNOVALUE');
          
          if ( !radar.feedings.aa2.fed && !radar.feedings.aa3.fed ) {
            entry.label = null;
          }
          
          if ( radar.feedings.aa2.fed ) {
            index = properties.multichart ? d.ctx.path.dii_a2 : d.ctx.path.dii_a1;
            for ( i = 0, temp = []; i < aa2.length; i++ ) {
              temp.push(aa2[i].rows[index]);
            }
            col = temp;
            if ( !radar.feedings.aa3.fed ) entry.label = col;
          }
          
          if ( radar.feedings.aa3.fed ) {
            index = radar.feedings.aa2.fed ? d.ctx.path.dii_a2 : d.ctx.path.dii_a1;
            for ( i = 0, temp = []; i < aa3.length; i++ ) {
              temp.push(aa3[i].rows[index]);
            }
            if ( radar.feedings.aa2.fed ) {
              row = temp;
              entry.label = [];
              entry.label = entry.label.concat(col);
	            entry.label = entry.label.concat(row);
            } else {
              col = temp;
              entry.label = col;
            }
          }
          
          item.val.push(entry);
        });
        
        volume.body.push(item);
      } else {
        if ( !radar.feedings.aa2.axesFed && !radar.feedings.aa3.axesFed ) {
          elements.each(function (d) {
            var entry = {}, item = { name : mg[d.ctx.path.mi].col, val : [] };
            entry.color = d.color;
            entry.shape = d.shape;
            entry.value = d.val !== null ? d.val : langManager.get('IDS_ISNOVALUE');
            entry.label = null;
            
            item.val.push(entry);
            volume.body.push(item);
          });
        } else {
          for ( var x = 0; x < mg.length; x++ ) {
            item = { name : mg[x].col === null ? langManager.get('IDS_ISNOVALUE') : mg[x].col, val : [] };
            
            elements.each(function (d) {
              var entry = {};
              entry.color = d.color;
              entry.shape = d.shape;
              entry.value = d.val !== null ? d.val : langManager.get('IDS_ISNOVALUE');
              
              var clazz = d3.select(this)[0][0].className.baseVal
                .match(/\smi[0-9]+/);
              if ( clazz !== null ) clazz = clazz[0];
              else return;
              
              temp = [];
              if ( clazz === (prefix.measureIndex + x) ) {
                var aa = aa2 !== null ? aa2 : aa3;
                for ( i = 0; i < aa.length; i++ ) {
                  if ( d.ctx.path.dii_a2 > aa[i].rows.length - 1 ) {
                    d.ctx.path.dii_a2 = aa[i].rows.length - 1;
                  }
                  temp.push(aa[i].rows[d.ctx.path.dii_a2]);
                }
                entry.label = temp;
              } else return;
              item.val.push(entry);
            });
            volume.body.push(item);
          }
        }
        
        var dimension = {};
        for ( i = 0; i < aa1.length; i++ ) {
          dimension = {};
          dimension.label = aa1[i].col;
          dimension.value = aa1[i].rows[target];
          volume.footer.push(dimension);
        }
      }
      dispatch.showTooltip(tooltipDataHandler.formatTooltipData(volume));
    };
    
    brush.params = { // UX defined
      stroke : {
        invisible : "transparent",
        natural : "#ffffff",
        heavy : "#333333"
      },
      
      weight : {
        natural : properties.line.width,
        heavy : "2px"
      },
      
      opacity : {
        natural : 1,
        low : 0.2
      }
    };
    
    /*
     * Functions of the effects library are
     * state-less. Each of the function accepts
     * one of the two types of arguments: 
     * DOM nodes in array, or
     * CSS class with an optional boolean field
     * in determining whether all elements with
     * the given CSS class will be selected.
     */
    brush.dim = function () {
      var prefix = defaults.wording;
      if ( !arguments.length ) { // select everything
        radar.node.selectAll(prefix.dot + styles.line.clazz)
          .attr("opacity", brush.params.opacity.low);
        radar.node.selectAll(prefix.dot + styles.marker.clazz)
          .attr("opacity", brush.params.opacity.low);
      } else if ( arguments[0] instanceof Array ) {
        for ( var i = 0; i < arguments[0].length; i++ ) {
          d3.select(arguments[0][i])
            .attr("opacity", brush.params.opacity.low);
        }
      } else if ( arguments[1] ) {
        radar.node.selectAll(arguments[0])
          .attr("opacity", brush.params.opacity.low);
      } else {
        radar.node.select(arguments[0])
          .attr("opacity", brush.params.opacity.low);
      }
      return brush;
    };
    
    brush.bright = function () {
      var prefix = defaults.wording;
      if ( !arguments.length ) {
        radar.node.selectAll(prefix.dot + styles.line.clazz)
          .attr("opacity", brush.params.opacity.natural);
        radar.node.selectAll(prefix.dot + styles.marker.clazz)
          .attr("opacity", brush.params.opacity.natural);
      } else if ( arguments[0] instanceof Array ) {
        for ( var i = 0; i < arguments[0].length; i++ ) {
          d3.select(arguments[0][i])
            .attr("opacity", brush.params.opacity.natural);
        }
      } else if ( arguments[1] ) {
        radar.node.selectAll(arguments[0])
          .attr("opacity", brush.params.opacity.natural);
      } else {
        radar.node.select(arguments[0])
          .attr("opacity", brush.params.opacity.natural);
      }
      return brush;
    };
    
    // remove all decorations
    brush.straight = function () {
      var prefix = defaults.wording;
      if ( !arguments.length ) {
        radar.node.selectAll(prefix.dot + styles.marker.clazz)
          .style("stroke", brush.params.stroke.invisible);
      } else if ( arguments[0] instanceof Array ) {
        for ( var i = 0; i < arguments[0].length; i++ ) {
          d3.select(arguments[0][i])
            .style("stroke", brush.params.stroke.invisible);
        }
      } else if ( arguments[1] ) {
        radar.node.selectAll(arguments[0])
          .style("stroke", brush.params.stroke.invisible);
      } else {
        radar.node.select(arguments[0])
          .style("stroke", brush.params.stroke.invisible);
      }
      return brush;
    };
    
    // Just recover stroke-width
    brush.straight2 = function () {
      var prefix = defaults.wording;
      if ( !arguments.length ) {
        radar.node.selectAll(prefix.dot + styles.marker.clazz)
          .style("stroke-width", brush.params.weight.natural);
      } else if ( arguments[0] instanceof Array ) {
        for ( var i = 0; i < arguments[0].length; i++ ) {
          d3.select(arguments[0][i])
            .style("stroke-width", brush.params.weight.natural);
        }
      } else if ( arguments[1] ) {
        radar.node.selectAll(arguments[0])
          .style("stroke-width", brush.params.weight.natural);
      } else {
        radar.node.select(arguments[0])
          .style("stroke-width", brush.params.weight.natural);
      }
      return brush;
    };
    
    // Change stroke color and stroke-width
    brush.highlight = function () {
      if ( !arguments.length ) return;
      if ( arguments[0] instanceof Array ) {
        for ( var i = 0; i < arguments[0].length; i++ ) {
          d3.select(arguments[0][i])
            .style("stroke", brush.params.stroke.heavy)
            .style("stroke-width", brush.params.weight.heavy)
            .attr("opacity", brush.params.opacity.natural);
        }
      } else if ( arguments[1] ) {
        radar.node.selectAll(arguments[0])
          .style("stroke", brush.params.stroke.heavy)
          .style("stroke-width", brush.params.weight.heavy)
          .attr("opacity", brush.params.opacity.natural);
      } else {
        radar.node.select(arguments[0])
          .style("stroke", brush.params.stroke.heavy)
          .style("stroke-width", brush.params.weight.heavy)
          .attr("opacity", brush.params.opacity.natural);
      }
      return brush;
    };
    
    // Just thicken stroke-width
    brush.highlight2 = function () {
      if ( !arguments.length ) return;
      if ( arguments[0] instanceof Array ) {
        for ( var i = 0; i < arguments[0].length; i++ ) {
          d3.select(arguments[0][i])
            .style("stroke-width", brush.params.weight.heavy)
            .attr("opacity", brush.params.opacity.natural);
        }
      } else if ( arguments[1] ) {
        radar.node.selectAll(arguments[0])
          .style("stroke-width", brush.params.weight.heavy)
          .attr("opacity", brush.params.opacity.natural);
      } else {
        radar.node.select(arguments[0])
          .style("stroke-width", brush.params.weight.heavy)
          .attr("opacity", brush.params.opacity.natural);
      }
      return brush;
    };
    
    brush.focus = function () {
      if ( !arguments.length ) return;
      if ( arguments[0] instanceof Array ) {
        for ( var i = 0; i < arguments[0].length; i++ ) {
          d3.select(arguments[0][i])
            .style("stroke", brush.params.stroke.natural)
            .style("stroke-width", brush.params.weight.natural);
        }
      } else if ( arguments[1] ) {
        radar.node.selectAll(arguments[0])
          .style("stroke", brush.params.stroke.natural)
          .style("stroke-width", brush.params.weight.natural);
      } else {
        radar.node.select(arguments[0])
          .style("stroke", brush.params.stroke.natural)
          .style("stroke-width", brush.params.weight.natural);
      }
      return brush;
    };
    
    
    return chart;
  };
});