
var count = -1;

var runChart = function(editor) {
	$('#chart').empty();
	eval(editor.getValue());
};


var getNextCode = function() {
	count++;
	return js_beautify(codeList[count%codeList.length]) + "\n\n";
}

var getPrevCode = function() {
	count--;
	if(count < 0 ) {
		count = count + codeList.length;
	}
	return js_beautify(codeList[count%codeList.length]) + "\n\n";
}

$(document).ready(function() {
	var windowCode = $("#window_code"),
		windowChart = $("#window_chart"),
		delay;

	var onCustom = function() {
		runChart(editor);
	}
	
	var onCursor = function() {
		var content = editor.getValue();
		var curPos = editor.cursorCoords(true,"page");
		var charPos = editor.coordsChar(curPos);
		console.log(charPos.line + ":" + charPos.ch);
		var meta = codeAnalysis(content);
		var ctx = getCursorContext(content, charPos.line, charPos.ch);
		if( ctx ) {
			highlight(ctx, meta.type);
		}
		
	};
	
	//TODO
	//Call this only when code change
	//Merge duplicated code with cursor analysis
	var codeAnalysis = function(content, line, ch) {
		var measureFlag = "type: \"Measure\",";
		var createFlag = "createViz";
		var indexFlag = "index:";
		var code = {};
		code.measure = [];
		
		var contents = content.split("\n");	
		var length = contents.length;
		
		for ( var i =0; i < length ; i++) {
			var line = contents[i];		
			if( line.search(measureFlag) !== -1) {
				var nameLine = contents[i+1];
				var lastIndexLine, lastIndexLineNum, mg, mi;
				// Find last index line
				for ( var j = i; j !== 0; j--) {
					if ( contents[j].indexOf(indexFlag) >= 0) {
						lastIndexLineNum = j;
						lastIndexLine = contents[j];
						break;
					}
				}
				
				if (lastIndexLine !== undefined) {
					var mgStr = $.trim(lastIndexLine).split(/[:,\s+]/)[2];
					var countBrackets = 0;
					mg = parseInt(mgStr) -1;
					for ( var j = lastIndexLineNum + 1; j < i ; j ++ ) {
						if (contents[j].indexOf("{") >= 0) {
							countBrackets ++;
						}
					}
					mi = countBrackets -1;
				}
				var measure = {};				
				measure.name = nameLine.split("\"")[1];
				measure.values = [];
				var index = i+3;
				while(true) {					
					var row = {};
					row.line = index;
					row.index = index - i -3;
					var valueLine = contents [index++];
					row.valueString = valueLine;
					measure.values.push(row);
					row.col = [];
					row.mg = mg;
					row.mi = mi;
					var measureValues = valueLine.split(/[,\[\]]/);
					var measureValuesLength = measureValues.length;
					var pos = measureValues[0].length;
					for ( var j = 1; j < measureValuesLength ; j ++) {
						if(measureValues[j].length === 0) {
							continue;
						}
						var col = {}; 
						pos++; //Add one position for splitter
						col.start = pos ; 
						pos = pos + measureValues[j].length;
						col.end = pos;
						col.index = j - 1;
						col.val = measureValues[j];						
						row.col.push(col);
					}
					if(valueLine.lastIndexOf("]") === valueLine.length -1) {
						break;
					}
				}
				code.measure.push(measure);
			} else if( line.search(createFlag) !== -1) {
				var typeLine = contents[i+1];
				code.type = typeLine.split("\"")[1];
			}
		}
		return code;
	};
	
	var highlight = function (ctx,type) {
		var datapoints = d3.selectAll(".main .plot .datapoint");
		var plot = d3.select(".main .plot");
	
		datapoints.each(function(d){
			var  datapoint = d3.select(this);
			if ( d.ctx[0] === undefined ) { 
				if( d.ctx.path.dii_a1 === ctx.col && d.ctx.path.dii_a2 === ctx.row 
				&& d.ctx.path.mg === ctx.mg && d.ctx.path.mi === ctx.mi ) {
					var barW = datapoint.attr("width");
					var barH = datapoint.attr("height");
					var yPos = datapoint.attr("y");
					var plotRect = plot[0][0].getBoundingClientRect();
					if( type === "viz/bar" || type == "viz/stacked_bar") {
						datapoint.transition().duration(500).attr("width", 0).
							transition().delay(600).duration(500).attr("width", barW);
					} else if ( type === "viz/column" ) {
						datapoint.transition().duration(500).attr("height", 0).attr("y",plotRect.height).
							transition().delay(600).duration(500).attr("height", barH).attr("y",yPos);
					} else if ( type == "viz/stacked_column" ) {
						datapoint.transition().duration(500).attr("height", 0).attr("y", ( parseFloat(barH) + parseFloat(yPos) ) ).
							transition().delay(600).duration(500).attr("height", barH).attr("y", yPos);
					} else if ( type == "viz/line" || type == "viz/dual_line" ) {
						var isHidden = datapoint.attr("visibility") ;
						if ( isHidden && isHidden === "hidden" ) {
							datapoint.transition().duration(500).attr("visibility", "visible").
								transition().delay(600).duration(500).attr("visibility", "hidden");
						} else {
							datapoint.transition().duration(500).attr("stroke-width", 12).attr("stroke", datapoint.attr("fill")).
								transition().delay(600).duration(500).attr("stroke-width", 0);
						}

						
					} else if ( type == "viz/pie" ) {
						// TODO
						// Call Action to Select the Data Point
						datapoint.transition().duration(500).attr("stroke-width", 5).attr("stroke", "red").
							transition().delay(600).duration(500).attr("stroke-width", 0);
					} 
				}
			} else {
				if( d.ctx[0].path.dii_a1 === ctx.col && d.ctx[0].path.dii_a2 === ctx.row ) {
					if ( type == "viz/bubble" ) {
						datapoint.transition().duration(500).attr("stroke-width", 15).attr("stroke", datapoint.attr("fill")).
							transition().delay(600).duration(500).attr("stroke-width", 0);
					} 
				}
			}
		});
	};
	
	var getCursorContext = function(content, ln, ch) {
		var measureFlag = "type: \"Measure\",";
		var createFlag = "createViz";
		var indexFlag = "index:";
		var code = {};
		code.measure = [];
		
		var contents = content.split("\n");
		
		var length = contents.length;
		for ( var i =0; i < length ; i++) {
			var line = contents[i];		
			if( line.search(measureFlag) !== -1) {
				var nameLine = contents[i+1];
				var lastIndexLine, lastIndexLineNum, mg, mi;
				// Find last index line
				for ( var j = i; j !== 0; j--) {
					if ( contents[j].indexOf(indexFlag) >= 0) {
						lastIndexLineNum = j;
						lastIndexLine = contents[j];
						break;
					}
				}
				
				if (lastIndexLine !== undefined) {
					var mgStr = $.trim(lastIndexLine).split(/[:,\s+]/)[2];
					mgStr = mgStr.replace(/[\'\"]/g,'');
					var countBrackets = 0;
					mg = parseInt(mgStr) -1;
					for ( var j = lastIndexLineNum + 1; j < i ; j ++ ) {
						if (contents[j].indexOf("{") >= 0) {
							countBrackets ++;
						}
					}
					mi = countBrackets -1;
				}
				var measure = {};				
				measure.name = nameLine.split("\"")[1];
				measure.values = [];
				var index = i+3;
				while(true) {
					var row = {};
					row.line = index;
					row.index = index - i - 3;
					var valueLine = contents [index++];
					row.valueString = valueLine;
					measure.values.push(row);
					row.col = [];
					row.mg = mg;
					row.mi = mi;
					var measureValues = valueLine.split(/[,\[\]]/);
					var measureValuesLength = measureValues.length;
					var pos = measureValues[0].length;
					for ( var j = 1; j < measureValuesLength ; j ++) {
						if(measureValues[j].length === 0) {
							continue;
						}
						var col = {};
						pos++; //Add one position for splitter
						col.start = pos; 
						pos = pos + measureValues[j].length;
						col.end = pos;
						col.index = j - 1;
						col.val = measureValues[j];
						row.col.push(col);
						if( row.line === ln &&
							ch >= col.start &&
							ch <= col.end ) {
							return {row : row.index , col : col.index , mg : mg, mi : mi};
						}
					}
					if(valueLine.lastIndexOf("]") === valueLine.length -1) {
						break;
					}
				}
				code.measure.push(measure);
			} else if( line.search(createFlag) !== -1) {
				var typeLine = contents[i+1];
				code.type = typeLine.split("\"")[1];
			}
		}
	};
	
	if (!windowCode.data("kendoWindow")) {
		windowCode.kendoWindow({
		width: "700px",
		height : "820px",
		actions: ["arrow-prev","arrow-next"],
		title: "Code"
		});
	}

	var editor = CodeMirror.fromTextArea(document.getElementById("code"), {
		lineNumbers: true,
		matchBrackets : true,
		mode : "javascript",
		onChange: function() {
			  clearTimeout(delay);
			  delay = setTimeout(onCustom, 300);
			},
		onCursorActivity: function (){
			onCursor();
			}
		});

	editor.setValue(getNextCode());		
	
	$(".k-window-actions .k-link").on("click", function(event){
		if( $(this).text() === "arrow-next") {
			editor.setValue(getNextCode());
		}
		
		if( $(this).text() === "arrow-prev") {
			editor.setValue(getPrevCode());
		}
	})
	

});