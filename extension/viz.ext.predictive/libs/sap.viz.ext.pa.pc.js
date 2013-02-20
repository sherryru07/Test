(function(){
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////// Module Function /////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var parcoChart = function() {
	
		var data, // data
		width = undefined, // chart width
		height = undefined, // chart height
		id = Math.floor(Math.random() * 10000), 
		colorPalette = d3.scale.category20().range().concat(d3.scale.category20b().range()).concat(d3.scale.category20c().range()), 
		shapePalette = ['square'], // shape palette for legend
		properties = {}; // poreperteis that is used to control chart
		var d = d3.dispatch('initialized');
		/**
		 * Create chart
		 */
	
		function chart(selection) {
	
			selection.each(function() {
				// Data Convert
				var valueNames = [];
				var colorData = data.getAnalysisAxisDataByIdx(1);
				var dimensionName = colorData.values[0].col.val;
	
				var mg0 = data.getMeasureValuesGroupDataByIdx(0);
				for(var i = 0; i < mg0.values.length; i++) {
					valueNames.push(mg0.values[i].col);
				}
	
				var buildData = function() {
					var result = [];
					//var index = k + j * val.rows[j].length;
					var index = -1;
					for(var i = 0; i < mg0.values.length; i++) {
						var val = mg0.values[i];
	
						for(var j = 0; j < val.rows.length; j++) {
							for(var k = 0; k < val.rows[j].length; k++) {
								var obj;
								if(val.rows[j][k].val!=null)
								{
								index++;
								if(result[index] === undefined) {
									obj = {};
									result[index] = obj;
								} else {
									obj = result[index];
								}
								
								obj[val.col] = val.rows[j][k].val;
								obj[dimensionName] = colorData.values[0].rows[j].val;
								}
							}
	
						}
						index= -1;
					}
					return result;
				};
				var parrellData = buildData();
	
				var w0 = 40, w1 = 40, h0 = 20, h1 = 20, w = width - w0 - w1, h = height - h0 - h1;
	
				//D3 Parrell Coordinate
				var x = d3.scale.ordinal().domain(valueNames).rangePoints([0, w]), y = {};
				var line = d3.svg.line(), axis = d3.svg.axis().orient("left"), foreground, canvas;
	
				valueNames.forEach(function(d) {
					y[d] = d3.scale.linear().domain(d3.extent(parrellData, function(p) {
						return +p[d];
					})).range([h, 0]);
	
					y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush);
				});
				canvas = d3.select(this).append("svg:g").attr( "font-family","Tahoma,Arial,Helvetica,sans-serif")
			    .attr("font-size","12px")
			     .style("margin-top","50px")
			     .attr("shape-rendering","crispEdges").attr("transform", "translate(" + w0 + "," + h0 + ")");
				
				var g = canvas.selectAll("axis").data(valueNames).enter().append("svg:g").attr("class", "trait").style("fill","none").style("stroke","#000").attr("transform", function(d) {
					return "translate(" + x(d) + ")";
				}).call(d3.behavior.drag().origin(function(d) {
					return {
						x : x(d)
					};
				}).on("dragstart", dragstart).on("drag", drag).on("dragend", dragend));
				
				//canvas.selectAll("axis").selectAll("line").attr("width", "1px");
	
				// Add an axis and title.
				
				    
				// Add a brush for each axis.
				g.append("svg:g").attr("class", "brush").each(function(d) {
					d3.select(this).call(y[d].brush);
				}).selectAll("rect").style("fill","none").style("stroke","#fff").attr("x", -8).attr("width", 16);
	
				// Add foreground lines.
				foreground = canvas.append("svg:g").attr("class", "foreground").selectAll("path").data(parrellData).enter().append("svg:path").attr("d", path).attr("class", function(d) {
					return d[dimensionName];
				}).style("stroke-width", 1.5).style("fill", "none").style("stroke-opacity", 0.5).style("stroke", function(d) {
					return colorPalette[colorIndex(d[dimensionName]) % colorPalette.length];
				});
				// Add a group element for each trait.
				var g = canvas.selectAll("axis").data(valueNames).enter().append("svg:g").attr("class", "trait").style("fill","none").style("stroke","#000").attr("transform", function(d) {
					return "translate(" + x(d) + ")";
				}).call(d3.behavior.drag().origin(function(d) {
					return {
						x : x(d)
					};
				}).on("dragstart", dragstart).on("drag", drag).on("dragend", dragend));
				g.append("svg:g").attr("class", "axis").each(function(d) {
					d3.select(this).call(axis.scale(y[d]));
				}).append("svg:text").attr("text-anchor", "middle").attr("y", -9).text(String);
				
	
				function colorIndex(dimensionValue) {
					var d = colorData.values[0].rows;
					for(var i = 0; i < d.length; i++) {
						if(d[i].val === dimensionValue) {
							return i;
						}
					}
					return 0;
				};
	
				function path(d) {
					return line(valueNames.map(function(p) {
						return [x(p), y[p](d[p])];
					}));
				};
	
				// Handles a brush event, toggling the display of foreground lines.
	
				function brush() {
					var actives = valueNames.filter(function(p) {
						return !y[p].brush.empty();
					}), extents = actives.map(function(p) {
						return y[p].brush.extent();
					});
					foreground.style("stroke", function(d) {
						var check = !actives.every(function(p, i) {
							return extents[i][0] <= d[p] && d[p] <= extents[i][1];
						});
						if(check) {
							return "#000";
						}
						return colorPalette[colorIndex(d[dimensionName]) % colorPalette.length];
					}).style("stroke-opacity", function(d) {
						var check = !actives.every(function(p, i) {
							return extents[i][0] <= d[p] && d[p] <= extents[i][1];
						});
						if(check) {
							return .05;
						}
						return 0.5;
					});
				}
	
				function dragstart(d) {
					i = valueNames.indexOf(d);
				}
	
				function drag(d) {
					x.range()[i] = d3.event.x;
					valueNames.sort(function(a, b) {
						return x(a) - x(b);
					});
					g.attr("transform", function(d) {
						return "translate(" + x(d) + ")";
					});
					foreground.attr("d", path);
				}
	
				function dragend(d) {
					x.domain(valueNames).rangePoints([0, w]);
					var t = d3.transition().duration(500);
					t.selectAll(".trait").attr("transform", function(d) {
						return "translate(" + x(d) + ")";
					});
					t.selectAll(".foreground path").attr("d", path);
				}
	
			});
			d.initialized();
			return chart;
		};
	
		/**
		 * set/get width
		 */
		chart.width = function(value) {
			if(!arguments.length) {
				return width;
			}
			width = value;
			return chart;
		};
		/**
		 * set/get height
		 */
		chart.height = function(value) {
			if(!arguments.length) {
				return height;
			}
			height = value;
			return chart;
		};
		/**
		 * set/get data, for some modules like Title, it doesn't need data
		 */
		chart.data = function(value) {
			if(!arguments.length) {
				return data;
			}
			data = value;
			return chart;
		};
		/**
		 * get preferred size
		 * @return {
		 'width': NUMBER,
		 'height' : NUMBER
		 }
		 */
		chart.getPreferredSize = function() {
		};
		/**
		 * set/get properties
		 */
		chart.properties = function(props) {
			if(!arguments.length) {
				return properties;
			}
			properties = props;
			if (props && props.colorPalette) colorPalette = props.colorPalette;
			return chart;
		};
		
		// canvg support..
		chart.dispatch = function(_){
			//d is a instance of d3.dispatch
		if(!arguments.length){
				return d;
			}
			d = _;
		return chart;
		};

		/**
		 * get/set your color palette if you support color palette
		 */
		chart.colorPalette = function(_) {
			if(!arguments.length) {
				return colorPalette;
			}
			colorPalette = _;
			return this;
		};
		return chart;
		
	};
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////// Module Configuration /////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////	
	/*Feed Definition*/
	var valueFeed = {
		'id' : 'sap.viz.modules.parco.valueaxis1',
		'name' : 'Primary Values',
		'type' : 'Measure',
		'min' : 1,
		'max' : Number.POSITIVE_INFINITY,
		'mgIndex' : 1
	};

	var dimensionFeed = {
		'id' : 'sap.viz.modules.parco.dimension',
		'name' : 'Sample',
		'type' : 'Dimension',
		'min' : 1,
		'max' : 1,
		'acceptMND' : false,
		'aaIndex' : 1
	};

	var colorFeed = {
		'id' : 'sap.viz.modules.parco.series.color',
		'name' : 'Category',
		'type' : 'Dimension',
		'min' : 1,
		'max' : Number.POSITIVE_INFINITY,
		'acceptMND' : false,
		'aaIndex' : 2
	};

	
	/*Module Definition*/
	var module = {
		'id' : 'sap.viz.modules.parco',
		'type' : 'CHART',
		'name' : 'parallel coordinates',
		'datastructure' : 'DATA STRUCTURE DOC',
		'properties' : {
		},
		'events' : {
		},
		'feeds' : [valueFeed, dimensionFeed, colorFeed],
		'css' : null,
		'configure' : null,
		'fn' : parcoChart
	};
	sap.viz.manifest.module.register(module);	
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////// Chart Configuration /////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var chart = {
	  id : 'viz/ext/pa/pc',
	  name : 'Parallel Coordinates Chart',
	  modules : {
	    title : {
	      id : 'sap.viz.modules.title',
	      configure : {
		      propertyCategory : 'title'
	      }
	    },
	    legend : {
	      id : 'sap.viz.modules.legend',
	      data : {
		      aa : [ 2 ]
	      },
	      configure : {
		      propertyCategory : 'legend'
	      }
	    },
	    main : {
	      id : 'sap.viz.modules.xycontainer',
	      modules : {
		      plot : {
			      id : 'sap.viz.modules.parco',
			      configure : {
			      	propertyCategory : 'plotArea'
			      }
		      }
	      }
	    }
	  },
	  dependencies : {
	    attributes : [ {
	      targetModule : 'legend',
	      target : 'colorPalette',
	      sourceModule : 'main.plot',
	      source : 'colorPalette'
	    } ],
	    events : []
	  }
	};
	
	sap.viz.manifest.viz.register(chart);
	
	
})();