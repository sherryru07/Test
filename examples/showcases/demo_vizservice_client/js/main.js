// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
	// Great success! All the File APIs are supported.
} else {
	alert('The File APIs are not fully supported in this browser.');
}

//Initialization parameter for vis
var Environment = sap.viz.env;
var CrosstableDataset = sap.viz.data.CrosstableDataset;
var vizcore = sap.viz.core;
var chartInstance = {};
initChartInstance();

Environment.initialize({
	'log' : 'debug'
});

$(document).ready(function() {
	initTypeMenu();
	$('.dropdown-toggle').dropdown();

	//Import Data From CSV
	$("#btnCSVImport").click(function() {
		var files = document.getElementById('csvfiles').files;
		if (!files.length) {
			alert('Please select a file!');
			return;
		}
		var file = files[0];
		var reader = new FileReader();

		// Closure to capture the file information.
		reader.onloadend = function(evt) {
			// Convert CSV to JSON and Load into Table
			if (evt.target.readyState == FileReader.DONE) {// DONE == 2
				var result = evt.target.result;
				var tb = csvToJSON(result);
				//empty chart when data reloaded
				$('#chart').empty();
				chartInstance.chart = undefined;
				updateOptionPanel();
				jsonToTable("dataTable", tb);
				updateFeedPanel(tb);
			}
		};

		// Read in the image file as a data URL.
		reader.readAsText(file);
	});

	//Import Data from JSON file
	$("#btnJSONImport").click(function() {
		var files = document.getElementById('jsonfiles').files;
		if (!files.length) {
			alert('Please select a file!');
			return;
		}
		var file = files[0];
		var reader = new FileReader();

		// Closure to capture the file information.
		reader.onloadend = function(evt) {
			// Convert CSV to JSON and Load into Table
			if (evt.target.readyState == FileReader.DONE) {// DONE == 2
				var result = evt.target.result;
				var tb = eval(result);
				//empty chart when data reloaded
				$('#chart').empty();
				chartInstance.chart = undefined;
				updateOptionPanel();
				jsonToTable("dataTable", tb);
				updateFeedPanel(tb);
			}
		};

		// Read in the image file as a data URL.
		reader.readAsText(file);
	});
});

function initTypeMenu() {
	var category = chartConfig.getCategory();
	var categoryMenus = d3.select("#choseTypeMenu").selectAll("a").data(category).enter().append("li").classed("dropdown-submenu", true);
	categoryMenus.append("a").text(function(d) {
		return d;
	}).attr("tabindex", "-1").attr("herf", "#")
	categoryMenus.append("ul").classed("dropdown-menu", true).selectAll("a").data(function(d) {
		return chartConfig.getType(d);
	}).enter().append("li").append("a").text(function(d) {
		return d["chart_name"];
	}).attr("tabindex", "-1").attr("herf", "#").on("click", function(d) {
		updateChartType("viz/" + d["chart_id"]);
	});
};

function feedData(data) {
	function getFeedData(name) {
		var items = d3.select("#" + name + "Feed").selectAll("div");
		var da = [];
		items.each(function() {
			da.push(d3.select(this).text());
		})
		return da;
	}

	var axis1FeedData = getFeedData("axis1");
	var axis2FeedData = getFeedData("axis2");
	var m1FeedData = getFeedData("measure1");
	var m2FeedData = getFeedData("measure2");
	var m3FeedData = getFeedData("measure3");
	var m4FeedData = getFeedData("measure4");
	var mgsFeedData = [m1FeedData, m2FeedData, m3FeedData, m4FeedData];
	//TODO feed validation
	//TODO convert measure
	var cleanData = $.extend(true, [], data);
	var i = 0, length = cleanData.length;
	//cleanData.shift();
	for (; i < length; i++) {
		var item = cleanData[i];
		for (obj in item ) {
			if ($.inArray(obj, m1FeedData) !== -1 || $.inArray(obj, m2FeedData) !== -1 || $.inArray(obj, m3FeedData) !== -1 || $.inArray(obj, m4FeedData) !== -1) {
				item[obj] = parseFloat(item[obj]);
			}
		}
	}
	chartInstance.data = table2Crosstable(cleanData, axis1FeedData, axis2FeedData, mgsFeedData);
	if (chartInstance.chart) {
		updateData();
	} else if (chartInstance.type) {
		createChart('chart', chartInstance.data, chartInstance.type, chartInstance.option);
	}
};

function csvToJSON(csv) {
	var hasHeader = $("#csvHasHeader").is(":checked");
	var hasSemantic = $("#csvHasSemantic").is(":checked");
	var rows = csv.split("\n"), header, i, length = rows.length;
	var result = [];

	if (hasSemantic) {
		header = rows[1].split(",");
		var semanticHeaders = rows[0].split(",");
		for (var j = 0; j < header.length; j++) {
			header[j] = header[j] + "_" + semanticHeaders[j];
		}
		i = 2;
	} else if (hasHeader) {
		header = rows[0].split(",");
		i = 1;
	} else {
		var colLength = rows[0].split(",").length;
		header = [];
		for (var j = 0; j < colLength; j++) {
			header.push("col" + j);
		}
		i = 0;
	}

	for (; i < length; i++) {
		if (rows[i].length > 0) {
			var row = rows[i].split(",");
			var j = 0, hLength = row.length;
			var item = {};
			for (; j < hLength; j++) {
				item[$.trim(header[j])] = $.trim(row[j]);
			}
			result.push(item);
		}
	}
	return result;
};

function buildMetaData(json) {
	var meta = [];

	for (var o in json[0]) {
		var item = {};
		item.colName = o;
		meta.push(item);
	}

	return meta;
};

function jsonToTable(tableId, json) {
	var meta = buildMetaData(json);
	var table = d3.select("#" + tableId);
	var tableData = buildPlainTableData(meta, json);
	//console.log(tableData);
	$("#" + tableId).empty();

	var tr = table.selectAll("tr").data(tableData).enter().append("tr");
	var th = tr.selectAll("th").data(function(d) {
		var result = [];
		for (var i in d ) {
			if (d[i].type === "th") {
				result.push(d[i]);
			}
		}
		return result;
	}).enter().append("th").text(function(d) {
		return d.value;
	}).attr("colspan", function(d) {
		return d.colspan;
	}).attr("rowspan", function(d) {
		return d.rowspan;
	});
	var td = tr.selectAll("td").data(function(d) {
		var result = [];
		for (var i in d ) {
			if (d[i].type === "td") {
				result.push(d[i]);
			}
		}
		return result;
	}).enter().append("td").text(function(d) {
		return d.value;
	}).attr("colspan", function(d) {
		return d.colspan;
	});

	function buildPlainTableData(metadata, data) {
		result = [];
		var headerRow = [];
		for (var i = 0; i < metadata.length; i++) {

			headerRow.push({
				type : "th",
				name : metadata[i].type,
				value : metadata[i].colName
			});
		}
		result.push(headerRow);

		for (var i = 0; i < data.length; i++) {
			var row = [];
			for (var j = 0; j < metadata.length; j++) {
				row.push({
					type : "td",
					name : metadata[j].colName,
					value : data[i][metadata[j].colName]
				});
			}
			result.push(row);
		}

		return result;
	};
};

function initChartInstance() {
	chartInstance.type = undefined;
	chartInstance.data = undefined;
	chartInstance.option = {};
	chartInstance.binding = {};
	chartInstance.chart = undefined;
}

function createChart(container, data, type, options) {
	$("#" + container).empty();
	var ds = new CrosstableDataset();
	ds.setData(data);
	try {
		chartInstance.chart = vizcore.createViz({
			type : type,
			data : ds,
			container : $('#' + container),
			options : options
		});
	} catch (error) {
		chartInstance.chart = undefined;
		//TODO
		//Invalid Feed
	}
}

function updateData() {
	var ds = new CrosstableDataset();
	ds.setData(chartInstance.data);
	try {
		chartInstance.chart.data(ds);
	} catch (error) {
		//TODO
		//Invalid Feed
	}
}

function updateChartType(type) {
	chartInstance.type = type;
	if (chartInstance.data) {
		createChart("chart", chartInstance.data, chartInstance.type = type, chartInstance.option);
	}
	d3.select("#chartTypeLabel").text(type);
	var props = sap.viz.manifest.viz.get(type).allProperties();
	//console.log(props);
	updateOptionPanel(props);
	updateFeedInfo();
}

function buildOpt(opt, name, value) {
	var names = name.split(".");
	var i = 0, length = names.length, p = opt;
	for (; i < length; i++) {
		if (p[names[i]] === undefined) {
			p[names[i]] = {};
		}
		if (i === length - 1) {
			p[names[i]] = value;
		} else {
			p = p[names[i]];
		}
	}
}

function updateOptionPanel() {
	$("#optionPanelInner").empty();
	if (chartInstance.type === undefined) {
		return;
	}
	var properties = sap.viz.manifest.viz.get(chartInstance.type).allProperties()

	var propArray = [];
	for (var i in properties) {
		propToArray(i, properties[i], propArray);
	}

	function propToArray(name, prop, a) {
		for (var i in prop) {
			if (prop[i].supportedValueType === "Object") {
				propToArray(name + "." + i, prop[i].supportedValues, a);
			} else {
				a.push({
					name : name + "." + i,
					val : prop[i]
				});
			}
		}
	}

	var optionPanel = d3.select("#optionPanelInner").append("ul");
	var items = optionPanel.selectAll(".prop").data(propArray).enter().append("li").classed("proplist", true);
	items.each(function(da) {
		//Add Name Lable
		d3.select(this).append("span").classed("label", true).text(da.name).style("margin", "2px");

		d3.select(this).append("span").text(" : ");

		//Add property control
		if (da.val.supportedValueType == "Boolean") {
			var btngroup = d3.select(this).append("div").classed("btn-group", true).attr("data-toggle", "buttons-radio");
			var bData = ["true", "false"];
			btngroup.selectAll("button").data(bData).enter().append("button").classed("btn btn-mini", true).text(function(d) {
				return d;
			}).on("click", function(d) {
				if (chartInstance.chart) {
					var opt = {};
					buildOpt(opt, da.name, d3.select(this).text() === "true");
					//onsole.log(opt);
					chartInstance.chart.properties(opt);
				} else {
					buildOpt(chartInstance.option, da.name, d3.select(this).text() === "true");
				}

			});

		} else if (da.val.supportedValueType == "List") {
			d3.select(this).append("div").classed("btn-group", true).attr("data-toggle", "buttons-radio").selectAll("button").data(da.val.supportedValues).enter().append("button").text(function(d) {
				return d;
			}).classed("btn btn-mini", true).on("click", function(d) {
				if (chartInstance.chart) {
					var opt = {};
					buildOpt(opt, da.name, d3.select(this).text());
					//onsole.log(opt);
					chartInstance.chart.properties(opt);
				} else {
					buildOpt(chartInstance.option, da.name, d3.select(this).text());
				}

			});
		} else if (da.val.supportedValueType == "String") {
			var item = d3.select(this).append("input").attr("type", "text").style("height", "14px").style("margin", "2px").on("change", function(d) {
				if (chartInstance.chart) {
					var opt = {};
					buildOpt(opt, da.name, d3.event.currentTarget.value);
					//onsole.log(opt);
					chartInstance.chart.properties(opt);
				} else {
					buildOpt(chartInstance.option, da.name, d3.event.currentTarget.value);
				}
			});
			if (da.val.defaultValue) {
				item.attr("placeholder", da.val.defaultValue);
			}
		} else {
			d3.select(this).append("span").classed("label label-warning", true).text("NA");
		}

	})
	//items.append("input").attr("type","text");
}

function updateFeedPanel(tb) {
	//Add Feed buttons
	var meta = buildMetaData(tb);
	$("#feedSource").empty();
	var feedPool = d3.select("#feedSource").append("div");
	feedPool.append("span").text("pool items").classed("label label-inverse", true);
	feedPool.on("drop", function(e) {
		d3.event.preventDefault();
		var data = d3.event.dataTransfer.getData("Text");
		$(this).append($("#" + data).parent());
		feedData(tb);
	}).on("dragover", function(d) {
		d3.event.preventDefault();
	}).classed("feed", true).selectAll("div").data(meta).enter().append("li").classed("feedSourceList", true).append("div").text(function(d) {
		return d.colName;
	}).classed("label label-info", true).attr("draggable", "true").attr("id", function(d) {
		return d.colName.replace(/\s+/g, '') + "FeedId";
	}).on("dragstart", function(d) {
		d3.event.dataTransfer.setData("Text", d3.event.target.id)
	});

	//Add Feed Target
	var feedDef = [{
		id : "axis1",
		name : "a1",
		tooltip : "axis 1, drop dimension item to feed"
	}, {
		id : "axis2",
		name : "a2",
		tooltip : "axis 2, drop dimension item to feed"
	}, {
		id : "measure1",
		name : "m1",
		tooltip : "measure group 1, drop measure item to feed"
	}, {
		id : "measure2",
		name : "m2",
		tooltip : "measure group 2, drop measure item to feed"
	}, {
		id : "measure3",
		name : "m3",
		tooltip : "measure group 3, drop measure item to feed"
	}, {
		id : "measure4",
		name : "m4",
		tooltip : "measure group 4, drop measure item to feed"
	}];
	$("#feedTarget").empty();
	var feedTarget = d3.select("#feedTarget").selectAll("div").data(feedDef).enter().append("div").attr("id", function(d) {
		return d.id + "Feed";
	}).classed("feed", true).on("drop", function(e) {
		d3.event.preventDefault();
		var data = d3.event.dataTransfer.getData("Text");
		$(this).append($("#" + data).parent());
		feedData(tb);
	}).on("dragover", function(d) {
		d3.event.preventDefault();
	}).append("span").append("a").text(function(d) {
		return d.name;
	}).classed("badge", true).attr("title", function(d) {
		return d.tooltip;
	}).attr("href", "#");

	//Hide Other Panels
	$('#feedPanel').collapse("show");
	updateFeedInfo();
}

function updateFeedInfo() {
	if (!chartInstance.type) {
		return;
	}

	var feeds = sap.viz.manifest.viz.get(chartInstance.type).allFeeds();
	console.log(feeds);
	var maxMeasureFeed = 0, maxAxisFeed = 0;

	for (var i = 0; i < feeds.length; i++) {
		var feed = feeds[i];
		var span, scope = feed.min;
		if (feed.type === "Dimension") {
			var id = "axis" + feed.aaIndex + "Feed";
			span = d3.select("#" + id).select("span");

			span.selectAll("a").remove();
			span.append("a").text(function(d) {
				return "a" + feed.aaIndex;
			}).classed("badge badge-success", true).attr("title", function(d) {
				return feed.name + " bind to axis " + feed.aaIndex;
			}).attr("href", "#");
			if (feed.aaIndex > maxAxisFeed) {
				maxAxisFeed = feed.aaIndex;
			}
			scope = scope + "+";
		}

		if (feed.type === "Measure") {
			var id = "measure" + feed.mgIndex + "Feed";
			//var label = feed.name + "/" + feed.min + "~" + feed.max + ":";
			span = d3.select("#" + id).select("span");
			span.selectAll("a").remove();
			span.append("a").text(function(d) {
				return "m" + feed.mgIndex;
			}).classed("badge badge-success", true).attr("title", function(d) {
				return feed.name + " bind to measure group " + feed.mgIndex;
			}).attr("href", "#");

			if (feed.mgIndex > maxMeasureFeed) {
				maxMeasureFeed = feed.mgIndex;
			}

			if (feed.max === Infinity) {
				scope = scope + "+";
			} else if (feed.max !== feed.min) {
				scope = scope + "~" + feed.max;
			}
		}

		span.append("a").text(scope).classed("badge badge-important", true).attr("title", "number of accepted feed items").attr("href", "#");
	}

	//
	for (var i = maxAxisFeed + 1; i < 3; i++) {
		var id = "axis" + i + "Feed";
		//var label = feed.name + "/" + feed.min + "~" + feed.max + ":";
		var span = d3.select("#" + id).select("span");
		span.selectAll("a").remove();
		span.append("a").text(function(d) {
			return "a" + i;
		}).classed("badge", true).attr("title", function(d) {
			return "un-supported axis feed";
		}).attr("href", "#");
	}

	for (var i = maxMeasureFeed + 1; i < 5; i++) {
		var id = "measure" + i + "Feed";
		//var label = feed.name + "/" + feed.min + "~" + feed.max + ":";
		var span = d3.select("#" + id).select("span");
		span.selectAll("a").remove();
		span.append("a").text(function(d) {
			return "m" + i;
		}).classed("badge", true).attr("title", function(d) {
			return "un-supported measure feed";
		}).attr("href", "#");
	}

	//var feedDa = d3.select("#feedTarget").selectAll("div").data();
}

