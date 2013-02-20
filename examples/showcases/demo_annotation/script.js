(function($, $S) {
	//$ jQuery
	//$S window.localStorage
	//Variables Declaration
	var layer, currentId = 0, docId = 0;
	var currentDocument = {};
	var documentList = [];
	//Board where the Posticks are sticked

	//When the document is ready, load default chart
	$(document).ready(function() {
		sap.viz.TemplateManager.loadPath=["../../resources/templates/"];
		sap.viz.lang.langManager.loadPath=["../../resources/langs/"];

		var Environment = sap.viz.env;
		var vizcore = sap.viz.core;

		Environment.initialize({
			'log' : 'debug'
		});

		currentDocument.type = 'viz/bar';
		currentDocument.data = ds;
		currentDocument.option = chartOption;

		loadDocument(currentDocument, "chart");
	});

	function loadDocument(doc, divId) {
		var div = $('#' + divId);
		currentDocument = doc;
		div.empty();
		var chart = sap.viz.core.createViz({
			type : doc.type,
			data : doc.data,
			container : div,
			options : doc.option
		});

		if (currentDocument.annotations) {
			for (var i = 0; i < currentDocument.annotations.length; i++) {
				loadAnnotation(currentDocument.annotations[i]);
			}
		}

	};

	function saveCurrentDocument(name) {
		//deep copy of current document
		if (currentDocument.annotations) {
			for (var i = 0; i < currentDocument.annotations.length; i++) {
				if (currentDocument.annotations[i].id) {
					var note = $('#' + currentDocument.annotations[i].id + ' > ' + ' .editable');
					currentDocument.annotations[i].content = note.text();
					currentDocument.annotations[i].lasso = undefined;
				}
			}
		}
		var doc = {};
		doc = jQuery.extend(true, {}, currentDocument);
		doc.name = name;
		documentList.push(doc);
	};

	function loadChart(type) {
		currentDocument = {};
		if (type === "bar") {
			currentDocument.type = 'viz/bar';
			currentDocument.data = ds;
		} else if (type === "pie") {
			currentDocument.type = 'viz/pie';
			currentDocument.data = dspie;
		} else if (type === "line") {
			currentDocument.type = 'viz/line';
			currentDocument.data = ds;
			loadDocument(currentDocument, "chart");
		}

		currentDocument.option = chartOption;
		currentDocument.annotations = undefined;

		loadDocument(currentDocument, "chart");

	};

	//Change Chart Type
	$('#chartType').live('click', function() {
		$("#chart").append('<div id="changeTypeDlg" title="Chose Chart Type"><img class="selectType" id="pie" width="32px" src="resources/images/chart_pie_c.png" alt="PIE"/><img class="selectType" id="bar" width="32px" src="resources/images/chart_bar_c.png" alt="PIE"/><img class="selectType" id="line" width="32px" src="resources/images/chart_line_c.png" alt="PIE"/></div>');
		$("#changeTypeDlg").dialog({
			position : {
				my : "center",
				at : "center",
				of : $("#chart")
			}
		});

		$('.selectType').live('click', function() {
			$("#changeTypeDlg").fadeOut('slow', function() {
				$("#changeTypeDlg").remove();
			});

			var type = $(this).attr("id");
			loadChart(type);
		});
	});

	//Save current document
	$('#save').live('click', function() {
		docId++;

		if (confirm('Save current chart as Document' + docId + ' ?')) {
			saveCurrentDocument("Document" + docId);
		} else {
			docId--;
		}
	});

	//Load
	$('#open').live('click', function() {
		$("#chart").append('<div id="docList" title="Chose saved document"><div id="docList"><div></div>');

		$("#docList").dialog({
			position : {
				my : "center",
				at : "center",
				of : $("#chart")
			},
			close : function() {
				$(".ui-dialog").remove();
				$("#docList").remove();
			}
		});

		for (var i = 0; i < documentList.length; i++) {
			$("#docList").append('<img class="selectDoc" id="' + documentList[i].name + '" title = "' + documentList[i].name + '" width="32px" src="resources/images/doc.png" alt="' + documentList[i].name + '"/>')
		}

		$('.selectDoc').live('click', function() {
			$("#docList").fadeOut('slow', function() {
				$("#docList").remove();
			});
			var name = $(this).attr("id");

			if (documentList) {
				for (var i = 0; i < documentList.length; i++) {
					if (documentList[i].name === name) {
						loadDocument(documentList[i], "chart");
					}
				}
			}

			//Hide Annotation on load
			$(".annotation").fadeOut('fast', function() {
			});
		});

	});

	//Remove Postick
	$('span.delete').live('click', function() {
		if (confirm('Are you sure you want to delete this Note?')) {
			var $this = $(this);
			var id = $this.parent().parent().attr("id");
			$this.closest('.annotation').fadeOut('slow', function() {
				deleteNote(id);
			});
		}
	});

	$('span.min').live('click', function() {
		var $this = $(this);
		$this.closest('.annotation').fadeOut('slow', function() {
		});
	});

	function generateId() {
		currentId++;
		return "annoation_" + currentId;
	}

	//Get Cross table axis, dimension, measure information
	function getDataInfo(data, ctx) {
		var ret = "";
		var aa1 = data._analysisAxis[0], aa2 = data._analysisAxis[1], mvg = data._measureValuesGroup;

		if (aa1) {
			ret = ret + getDimensionInfo(aa1._dimensionLabels, ctx.path.dii_a1);
		}
		if (aa2) {
			ret = ret + getDimensionInfo(aa2._dimensionLabels, ctx.path.dii_a2);
		}

		ret = ret + mvg[ctx.path.mg]._measureValues[ctx.path.mi]._uId + ":";
		return ret;
	}

	function getDimensionInfo(dimLabel, index) {
		var ret = "";
		for (var i = 0; i < dimLabel.length; i++) {
			var dim = dimLabel[i];
			ret = ret + dim._uId + ":" + dim._values[index] + "/";
		}
		return ret;
	}

	function loadAnnotation(annotation) {
		var root = d3.select("[id^=rootComponent]");
		var id = generateId();
		if (annotation.type === "point") {
			createNote(annotation.x, annotation.y, annotation.targets, id, annotation.content);
			var anchor = root.append("div").attr("id", "note_anchor_" + id).style("position", "absolute").style("left", annotation.x - 8 + "px").style("top", annotation.y - 50 - 8 + "px").append("image").attr("src", "resources/images/1351058161_comment_edit.png").on("mouseover", function(d) {
				showNote(id);
			}).on("mouseout", function(d) {
				//annoationUnHover(d);
			});
		} else if (annotation.type === "area") {
			createNote(annotation.x, annotation.y, annotation.targets, id, annotation.content);
			if (annotation.lasso) {
				annotation.lasso.attr("id", "note_anchor_" + id);
				annotation.lasso.on("mouseover", function(d) {
					showNote(id);
				}).on("mouseout", function(d) {
					//hideNote(id);
				});
			} else {
				var lasso = root.append("div").style("position", "absolute").style("left", annotation.x - annotation.w + "px").style("top", annotation.y - annotation.h - 50 + "px").attr("class", "lasso");
				lasso.style("width", annotation.w + "px").style("height", annotation.h + "px");
				lasso.on("mouseover", function(d) {
					showNote(id);
				}).on("mouseout", function(d) {
					//hideNote(id);
				});
			}
		}
		annotation.id = id;
	}

	function createNote(x, y, datapoints, id, content) {
		var contextString = "";
		if (content) {
			contextString = content;
		} else {
			if (datapoints) {
				for (var i = 0; i < datapoints.length; i++) {
					var data = d3.select(datapoints[i]).data()[0];
					contextString = contextString + getDataInfo(currentDocument.data, data.ctx) + data.val + "  ";
				}
			}
		}

		$("#chart").append('<div class="annotation" id=' + id + ' style="position:absolute;left:' + x + 'px;top:' + y + 'px"><div class="toolbar"><span class="min" title="Minimize"><img src="resources/images/1351058158_arrow_down.png" alt="_"></span><span class="delete" title="Delete"><img src="resources/images/1351058046_trash.png" alt="_"></span></div><div contenteditable class="editable">' + contextString + '</div></div>');
		$(".annotation").draggable({
			cancel : '.editable'
		});
	}

	function showNote(id) {
		$("#" + id).fadeIn('slow', function() {
		});
	}

	function hideNote(id) {
		$("#" + id).fadeOut('slow', function() {
		});
	}

	function deleteNote(id) {
		$("#note_anchor_" + id).remove();
		$("#" + id).remove();
		if (currentDocument.annotations) {
			for (var i = 0; i < currentDocument.annotations.length; i++) {
				if (currentDocument.annotations[i].id === id) {
					currentDocument.annotations[i] = undefined;
				}
			}
		}
	}


	$('#pointSelection').click(function() {
		$("body").css('cursor', 'crosshair');
		pointSelection();
	});

	$('#lassoSelection').click(function() {
		$("body").css('cursor', 'crosshair');
		lassoSelection();
	});

	function pointSelection() {
		layer = d3.select("#chart").append("svg").style("position", "absolute").style("left", 0).style("top", 50).style("width", 800).style("height", 600).attr("class", "annotation_helper");
		var helper = layer.append("rect").style("opacity", 0.2).attr("width", 800).attr("height", 600).attr("class", "annotation_helper").on("mousedown", function() {
			dropAnnoation();
		});
	};

	function lassoSelection() {
		layer = d3.select("#chart").append("svg").style("position", "absolute").style("left", 0).style("top", 50).style("width", 800).style("height", 600).attr("class", "annotation_helper");
		var root = d3.select("[id^=rootComponent]");
		var lasso, x, y, id;
		var helper = layer.append("rect").style("opacity", 0.2).attr("width", 800).attr("height", 600).attr("class", "annotation_helper").on("mousedown", function() {
			if (lasso) {
				lasso.remove();
			}
			x = d3.event.pageX;
			y = d3.event.pageY;

			lasso = root.append("div").style("position", "absolute").style("left", x + "px").style("top", y - 50 + "px").attr("class", "lasso");
		}).on("mousemove", function() {
			if (lasso) {
				var w = d3.event.pageX - x, h = d3.event.pageY - y;
				lasso.style("width", w + "px").style("height", h + "px");
			}
		}).on("mouseup", function() {
			var annotation = {};
			annotation.x = d3.event.pageX, annotation.y = d3.event.pageY;
			annotation.w = annotation.x - x, annotation.h = annotation.y - y;
			var hit = {
				height : annotation.w,
				width : annotation.h,
				x : x,
				y : y
			};
			var dataPoints = d3.selectAll(".datapoint");
			var targets = intersect(dataPoints, hit);
			annotation.type = "area";
			annotation.targets = targets;
			annotation.lasso = lasso;

			loadAnnotation(annotation);
			if (currentDocument.annotations === undefined) {
				currentDocument.annotations = [];
			}

			currentDocument.annotations.push(annotation);

			d3.select(".annotation_helper").remove();
			lasso = undefined;
			$("body").css('cursor', 'auto');
		});
	};

	function dropAnnoation() {
		var annotation = {};
		annotation.x = d3.event.pageX, annotation.y = d3.event.pageY;
		var hit = {
			height : 0,
			width : 0,
			x : annotation.x,
			y : annotation.y
		};
		var dataPoints = d3.selectAll(".datapoint");
		var targets = intersect(dataPoints, hit);
		annotation.type = "point";
		annotation.targets = targets;
		loadAnnotation(annotation);
		if (currentDocument.annotations === undefined) {
			currentDocument.annotations = [];
		}

		currentDocument.annotations.push(annotation);

		$("body").css('cursor', 'auto');
		d3.select(".annotation_helper").remove();
	};

	function intersect(selectees, hitTestRect) {
		var res = [];

		var getBoundingBox = function(node) {
			var rect = node.getBoundingClientRect();
			return {
				x : rect.left,
				y : rect.top,
				height : rect.height,
				width : rect.width
			};
		};

		var boundingbox = {};

		boundingbox.intersects = function(a, b) {
			return (a.x <= (b.x + b.width) && b.x <= (a.x + a.width) && a.y <= (b.y + b.height) && b.y <= (a.y + a.height));
		};

		selectees.filter(function(d, m) {
			var rect = getBoundingBox(this);
			if (boundingbox.intersects(rect, hitTestRect)) {
				res.push(this);
			}
		});

		return res;
	}

})(jQuery, window.localStorage);
