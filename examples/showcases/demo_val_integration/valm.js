$(function() {
	var valFn = function() {
		var data, // data
		width = undefined,
		// chart width
		height = undefined, xScale = undefined, yScale = undefined, configSpec = undefined, viewMode = undefined, markType = undefined, xData, yData, xType = 'value', yType = 'value'
		// chart height
		id = Math.floor(Math.random() * 10000),
		// shape palette for legend
		properties = {};
		//var plot
		var val = require("val");
		var render = val.renderer(), plot = undefined;

		function chart(selection) {
			selection.each(function() {
				var m = [0, 0, 0, 0], w = width - m[1] - m[3], h = height - m[0] - m[2], i = 0, root;
				var vis = d3.select(this).append("svg:g").attr("transform", "translate(" + m[3] + "," + m[0] + ")");
				var d = crosstable2table(data);
				buildVal(vis, h, w, d);

			});
			return chart;
		}

		function crosstable2table(crosstable) {
			var dimension = crosstable._aa[0].values;
			var measure = crosstable._mg[0].values;
			var result = [], length = dimension[0].rows.length;
			
			if(dimension[0].type === "MND") {
				length = dimension[1].rows.length;
			}

			for (var i = 0; i < length; i++) {
				var o = {}, id = "";

				for (var j = 0; j < dimension.length; j++) {
					if(dimension[j].type === "MND") {
						continue;
					}
					o[dimension[j].col.val] = dimension[j].rows[i].val;
					id = id + dimension[j].rows[i].val + "~";
				}

				for (var j = 0; j < measure.length; j++) {
					o[measure[j].col] = measure[j].rows[0][i].val;
				}
				o.id = id;
				result.push(o);
			}

			return result;
		}

		function makeScale(name, rangeMax) {
			var scaleObj = {
				scale : null,
				type : ""
			};
			return scaleObj;
		}

		function buildVal(svg, h, w, d) {

			var palette = properties.palette;
			// and plot the marks
			var markType = properties.viewMode;
			var viewMode = properties.markType;

			var fieldSpec = properties.fieldSpec;

			function dims(d, name) {
				var ret = [];
				for (var i = 0; i < d.length; ++i) {
					ret.push(d[i][name]);
				}
				return ret;
			}

			function isDim(name) {
				var va = data._aa[0].values;
				var i = 0, length = va.length;
				for (; i < length; i++) {
					if (va[i].col.val === name) {
						return true;
					}
				}
				return false;
			}
			
			if (isDim(fieldSpec.x)) {
				xScale = d3.scale.ordinal().domain(dims(d, fieldSpec.x)).rangeBands([0, w]);
			} else {
				//TODO
				//Need Cacluate the domain according to the view mode
				xScale = d3.scale.linear().domain([0.0, 40.0]).range([0, w]);
			}

			if (isDim(fieldSpec.y)) {
				yScale = d3.scale.ordinal().domain(dims(d, fieldSpec.y)).rangeBands([h, 0]);
			} else {
				//TODO
				//Need Cacluate the domain according to the view mode
				yScale = d3.scale.linear().domain([0.0, 40.0]).range([h, 0]);
			}
			if (plot) {
				render.data([]).render();
			}
			plot = render.markType(markType).canvas(svg).scaleX(xScale).scaleY(yScale).fields(fieldSpec).data(d).color(val.colors.categorical(palette)).viewmode(viewMode).render();
		}

		/**
		 * set/get width
		 */
		chart.width = function(value) {
			if (!arguments.length) {
				return width;
			}
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
			if (!arguments.length) {
				return properties;
			}
			properties = props;
			return chart;
		};
		/**
		 * get/set your event dispatch if you support event
		 */
		chart.dispatch = function(_) {
			//DO Nothing Now
			return this;
		};

		/**
		 * set/get width
		 */
		chart.xScale = function(value) {
			if (!arguments.length) {
				return xScale;
			}
			xScale = value;
			return chart;
		};

		/**
		 * set/get width
		 */
		chart.yScale = function(value) {
			if (!arguments.length) {
				return yScale;
			}
			yScale = value;
			return chart;
		};

		chart.yData = function(value) {
			if (!arguments.length) {
				return yData;
			}
			yData = value;
			return chart;
		};

		chart.xData = function(value) {
			if (!arguments.length) {
				return xData;
			}
			xData = value;
			return chart;
		};

		chart.yType = function(value) {
			if (!arguments.length) {
				return yType;
			}
			yType = value;
			return chart;
		};

		chart.xType = function(value) {
			if (!arguments.length) {
				return xType;
			}
			xType = value;
			return chart;
		};

		return chart;
	};
	//set parco manifest
	var valueFeed = {
		'id' : 'sap.viz.modules.val.valueaxis',
		'name' : 'Measures',
		'type' : 'Measure',
		'min' : 1,
		'max' : Number.POSITIVE_INFINITY,
		'mgIndex' : 1
	};

	var dimensionFeed = {
		'id' : 'sap.viz.modules.val.dimension',
		'name' : 'Dimensions',
		'type' : 'Dimension',
		'min' : 1,
		'max' : Number.POSITIVE_INFINITY,
		'acceptMND' : false,
		'aaIndex' : 1
	};

	valModuleConfig = {
		'id' : 'sap.viz.modules.val',
		'type' : 'CHART',
		'name' : 'val',
		'datastructure' : 'DATA STRUCTURE DOC',
		'properties' : {
		},
		'events' : {
		},
		'feeds' : [valueFeed, dimensionFeed],
		'css' : null,
		'configure' : null,
		'fn' : valFn
	};

	sap.viz.manifest.module.register(valModuleConfig);

});
