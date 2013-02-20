var binding = {
	col : ["aa1"],
	row : ["aa2"],
	multi : ["mnd"]
};
var targetStrs = ["[Column]", "[Row]", "[Multiplier]"];
var sourceStrs = ["{Analysis Axis 1}", "{Analysis Axis 2}", "{Measure Name Dimension}"];

var data = {
    analysisAxis: [{
        index: 1,
        data: [{
            type: "Dimension",
            name: "Product",
            values: ["Car", "Truck", "Motorcycle", "Bicycle"]
        }]
    }, {
        index: 2,
        data: [{
            type: "Dimension",
            name: "Country",
            values: ["China", "USA"]
        }, {
            type: "Dimension",
            name: "Year",
            values: ["2001", "2001"]
        }]
    }],
    measureValuesGroup: [{
        index: 1,
        data: [{
            type: "Measure",
            name: "Profit",
            values: [
                [25, 136, 23, 116],
                [58, 128, 43, 73]
            ]
        }, {
            type: "Measure",
            name: "Revenue",
            values: [
                [50, 236, 43, 126],
                [158, 228, 143, 183]
            ]
        }]
    }]
};

$(document).ready(function() {
	var editor, delay;
	//Build Initial Table
	crosstableBuider("#chart", data, binding);

	//Build Tree View for binding
	$("#treeview").kendoTreeView({
		dragAndDrop : true,
		dataSource : [{
			text : "[Column]",
			expanded : true,
			items : [{
				text : "{Analysis Axis 1}"
			}]
		}, {
			text : "[Row]",
			expanded : true,
			items : [{
				text : "{Analysis Axis 2}"
			}]
		}, {
			text : "[Multiplier]",
			expanded : true,
			items : [{
				text : "{Measure Name Dimension}"
			}]
		}],
		drop : onDrop,
		dragend : onDragEnd
	}).data("kendoTreeView");

	//Build Dataset Code
	editor = CodeMirror.fromTextArea(document.getElementById("dataset"), {
		lineNumbers : false,
		matchBrackets : true,
		mode : "javascript",
		onChange : function() {
			clearTimeout(delay);
			delay = setTimeout(onDataChange, 300);
		},
		onCursorActivity : function() {
			//TODO
		}
	});

	editor.setValue(js_beautify(JSON.stringify(data)));

	function onDataChange() {
		updateCrossTable();
	}
	
	function updateCrossTable() {
		var treeStr = $("#treeview").getKendoTreeView().root.context.textContent;
		data = eval("(" + editor.getValue() + ')');
		var abinding = string2binding(treeStr);
		if(validateBinding(abinding)) {
			$("#chart").empty();
			$("#log").empty();
			crosstableBuider("#chart", data, abinding);
		} else {
			console.log("Invalid Binding");
			$("#log").empty();
			$("#log").append("Invalid Binding : " + JSON.stringify(abinding));
		}
	}

	function onDrop(e) {
		//TODO
		//Validate Drop
		//var position = e.dropPosition, targetStr = e.dropTarget.textContent, sourceStr = e.sourceNode.textContent, distStr = e.destinationNode.textContent;

		//if($.inArray(sourceStr, sourceStrs) < 0) {
		//	alert("Invalid Binding");
		//}
	}

	function onDragEnd(e) {
		updateCrossTable();
	}

	function validateBinding(b) {
		if(b.col.length > 2 || b.col.length === 0 || b.row.length > 2 || b.row.length === 0 || b.multi.length > 1) {
			return false;
		}
		
		if($.inArray("aa1", b.col)>=0 && $.inArray("aa2", b.col)>=0) {
			return false;
		}
		
		if($.inArray("aa1", b.row)>=0 && $.inArray("aa2", b.row)>=0) {
			return false;
		}

		return true;
	}

	function string2binding(content) {
		var binding = {};
		var strList = content.split("[");
		for(var i = 0; i < strList.length; i++) {
			var items = strList[i].split("]");

			if(items[0] === "Column") {
				binding.col = [];
				if(items.length === 2) {
					buildBinding(binding.col, items[1]);
				}

			} else if(items[0] === "Row") {
				binding.row = [];
				if(items.length === 2) {
					buildBinding(binding.row, items[1]);
				}

			} else if(items[0] === "Multiplier") {
				binding.multi = [];
				if(items.length === 2) {
					buildBinding(binding.multi, items[1]);
				}
			} else {
				//invalid binding
			}

		}

		return binding;
	}

	function buildBinding(to, source) {
		var strList = source.split("{");
		for(var i = 0; i < strList.length; i++) {
			var bind = strList[i];
			if(bind.indexOf("Analysis Axis 1") >= 0) {
				to.push("aa1");
			} else if(bind.indexOf("Analysis Axis 2") >= 0) {
				to.push("aa2");
			} else if(bind.indexOf("Measure Name Dimension") >= 0) {
				to.push("mnd");
			}
		}
	}

});
