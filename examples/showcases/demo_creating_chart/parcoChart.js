var parcoChart = function() {

	var data, // data
	width = undefined,
	// chart width
	height = undefined,
	// chart height
	id = Math.floor(Math.random() * 10000), colorPalette = d3.scale.category20().range(), shapePalette = ['square'],
	// shape palette for legend
	properties = {};
	// poreperteis that is used to control chart
	/**
	 * Create chart
	 */

	function chart(selection) {

		selection.each(function() {
			// Data Convert
			var valueNames = [];
			var dimensionName = data._aa[1].values[0].col.val;

			for(var i = 0; i < data._mg[0].values.length; i++) {
				valueNames.push(data._mg[0].values[i].col);
			}

			var buildData = function() {
				var result = [];
				for(var i = 0; i < data._mg[0].values.length; i++) {
					var val = data._mg[0].values[i];

					for(var j = 0; j < val.rows.length; j++) {
						for(var k = 0; k < val.rows[j].length; k++) {
							var obj;
							var index = k + j * val.rows[j].length;
							if(result[index] === undefined) {
								obj = {};
								result[index] = obj;
							} else {
								obj = result[index];
							}
							obj[val.col] = val.rows[j][k].val;
							obj[dimensionName] = data._aa[1].values[0].rows[j].val;
						}

					}
				}
				return result;
			};
			var parrellData = buildData();

			var w0 = 40, w1 = 20, h0 = 20, h1 = 20, w = width - w0 - w1, h = height - h0 - h1;

			//D3 Parrell Coordinate
			var x = d3.scale.ordinal().domain(valueNames).rangePoints([0, w]), y = {};
			var line = d3.svg.line(), axis = d3.svg.axis().orient("left"), foreground, canvas;

			valueNames.forEach(function(d) {
				y[d] = d3.scale.linear().domain(d3.extent(parrellData, function(p) {
					return +p[d];
				})).range([h, 0]);

				y[d].brush = d3.svg.brush().y(y[d]).on("brush", brush);
			});
			canvas = d3.select(this).append("svg:g").attr("transform", "translate(" + w0 + "," + h0 + ")");

			// Add foreground lines.
			foreground = canvas.append("svg:g").attr("class", "foreground").selectAll("path").data(parrellData).enter().append("svg:path").attr("d", path).attr("class", function(d) {
				return d[dimensionName];
			}).style("stroke-width", 1.5).style("fill", "none").style("stroke-opacity", 0.5).style("stroke", function(d) {
				return colorPalette[colorIndex(d[dimensionName]) % colorPalette.length];
			});
			// Add a group element for each trait.
			var g = canvas.selectAll(".trait").data(valueNames).enter().append("svg:g").attr("class", "trait").attr("transform", function(d) {
				return "translate(" + x(d) + ")";
			}).call(d3.behavior.drag().origin(function(d) {
				return {
					x : x(d)
				};
			}).on("dragstart", dragstart).on("drag", drag).on("dragend", dragend));

			// Add an axis and title.
			g.append("svg:g").attr("class", "axis").each(function(d) {
				d3.select(this).call(axis.scale(y[d]));
			}).append("svg:text").attr("text-anchor", "middle").attr("y", -9).text(String);

			// Add a brush for each axis.
			g.append("svg:g").attr("class", "brush").each(function(d) {
				d3.select(this).call(y[d].brush);
			}).selectAll("rect").attr("x", -8).attr("width", 16);

			function colorIndex(dimensionValue) {
				var d = data._aa[1].values[0].rows;
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
