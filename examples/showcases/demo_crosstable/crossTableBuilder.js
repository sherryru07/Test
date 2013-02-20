var crosstableBuider = function(div, data, binding) {
	var cData = buildCrossTableData(data, binding);

	var selection = d3.select(div);
	var length = cData.length;
	for(var i = 0; i < length; i++) {
		var cell = selection.append("div").style("float", "left").style("margin", "10px");
		renderTable(cell, cData[i]);
	}

};
function renderTable(selection, tableData) {
	var table = selection.append("table");

	var tr = table.selectAll("tr").data(tableData).enter().append("tr");

	var th = tr.selectAll("th").data(function(d) {
		var result = [];
		for(var i in d ) {
			if(d[i].type === "th") {
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
		for(var i in d ) {
			if(d[i].type === "td") {
				result.push(d[i]);
			}
		}
		return result;
	}).enter().append("td").text(function(d) {
		return d.value;
	}).attr("colspan", function(d) {
		return d.colspan;
	});
};

function buildCrossTableData(data, binding) {
	var result = [];
	var fdata = buildFlatData(data);
	var tdata = dataTransform(fdata, binding);
	result = buildTableData(tdata);
	return result;
};

function dataTransform(fdata, binding) {
	var result = {};
	result.data = [];
	result.rowheaders = [];
	result.colheaders = [];
	result.multiheaders = [];

	var mndheader = [];
	for(var i = 0; i < fdata.mg.length; i++) {
		mndheader.push({
			val : fdata.mg[i].name,
			name : "mnd"
		});
	}

	if(binding.multi.length === 0) {
		result.multiheaders.push([{
			val : "",
			name : ""
		}]);

		if($.inArray("aa1", binding.col) >= 0) {
			if($.inArray("mnd", binding.col) >= 0) {
				if($.inArray("mnd", binding.col) === 0) {
					result.colheaders = multiplyHeader([mndheader], fdata.aa1);
					result.rowheaders = fdata.aa2;
					result.data = multiplyData("mnd", "aa1", fdata);
				} else {
					result.colheaders = multiplyHeader(fdata.aa1, [mndheader]);
					result.rowheaders = fdata.aa2;
					result.data = multiplyData("aa1", "mnd", fdata);
				}
			} else {
				if($.inArray("mnd", binding.row) === 0) {
					result.colheaders = fdata.aa1;
					result.rowheaders = multiplyHeader([mndheader], fdata.aa2);
					result.data = multiplyData("mnd", "aa2", fdata);
				} else {
					result.colheaders = fdata.aa1;
					result.rowheaders = multiplyHeader(fdata.aa2, [mndheader]);
					result.data = multiplyData("aa2", "mnd", fdata);
				}
			}

		} else if($.inArray("aa1", binding.row) >= 0) {
			if($.inArray("mnd", binding.row) >= 0) {
				if($.inArray("mnd", binding.row) === 0) {
					result.colheaders = fdata.aa2;
					result.rowheaders = multiplyHeader([mndheader], fdata.aa1);
					result.data = multiplyData("mnd", "aa1", fdata);
				} else {
					result.colheaders = fdata.aa2;
					result.rowheaders = multiplyHeader(fdata.aa1, [mndheader]);
					result.data = multiplyData("aa1", "mnd", fdata);
				}
			} else {
				if($.inArray("mnd", binding.col) === 0) {
					result.colheaders = multiplyHeader([mndheader], fdata.aa2);
					result.rowheaders = fdata.aa1;
					result.data = multiplyData("mnd", "aa2", fdata);
				} else {
					result.colheaders = multiplyHeader(fdata.aa2, [mndheader]);
					result.rowheaders = fdata.aa1;
					result.data = multiplyData("aa2", "mnd", fdata);
				}
			}
			result.data[0] = rows2cols(result.data[0]);

		} else {
			//wrong binding
		}

	} else {

		if(binding.multi[0] === "mnd") {
			var length = fdata.mg.length;
			result.multiheaders.push(mndheader);
			for(var i = 0; i < length; i++) {
				result.data.push(fdata.mg[i].val);
			}
			result.rowheaders = fdata.aa2;
			result.colheaders = fdata.aa1;
			if(binding.col[0] === "aa2") {
				revertCR(result);
			}

		} else if(binding.multi[0] === "aa1") {
			var length = fdata.aa1[0].length;
			result.colheaders.push(mndheader);

			for(var i = 0; i < length; i++) {
				var data1 = [];
				for(var j = 0; j < fdata.aa2[0].length; j++) {
					var data2 = [];
					for(var k = 0; k < fdata.mg.length; k++) {
						data2.push(fdata.mg[k].val[j][i]);
					}
					data1.push(data2);
				}
				result.data.push(data1);
			}

			result.multiheaders = fdata.aa1;
			result.rowheaders = fdata.aa2;
			if(binding.col[0] === "aa2") {
				revertCR(result);
			}

		} else if(binding.multi[0] === "aa2") {
			var length = fdata.aa2[0].length;
			result.rowheaders.push(mndheader);
			for(var i = 0; i < length; i++) {
				var aData = [];
				for(var j = 0; j < fdata.mg.length; j++) {
					aData.push(fdata.mg[j].val[i]);
				}
				result.data.push(aData);
			}

			result.multiheaders = fdata.aa2;
			result.colheaders = fdata.aa1;
			if(binding.col[0] === "mnd") {
				revertCR(result);
			}

		}
	}

	return result;
};

function buildTableData(tdata) {
	var multiTables = [];

	for(var mi = 0; mi < tdata.multiheaders[0].length; mi++) {
		var table = [];
		for(var i = 0; i < tdata.colheaders.length; i++) {
			var row = [];

			//Row/Col Header for the first cell
			if(i === 0) {
				var header = "";
				for(var j = 0; j < tdata.multiheaders.length; j++) {
					header = header + tdata.multiheaders[j][mi].val;
					if(j !== tdata.multiheaders.length - 1) {
						header = header + "/";
					}
				}

				row.push({
					type : "th",
					colspan : tdata.rowheaders.length,
					rowspan : tdata.colheaders.length,
					name : "",
					value : header
				});
			}

			for(var j = 0; j < tdata.colheaders[0].length; j++) {
				row.push({
					type : "th",
					colspan : 1,
					name : tdata.colheaders[i][j].name,
					value : tdata.colheaders[i][j].val
				});
			}

			table.push(row);
		}

		var cellRowLength = tdata.rowheaders[0].length;
		for(var i = 0; i < cellRowLength; i++) {
			var row = [];
			for(var j = 0; j < tdata.rowheaders.length; j++) {
				row.push({
					type : "th",
					colspan : 1,
					name : tdata.rowheaders[j][i].name,
					value : tdata.rowheaders[j][i].val
				});
			}

			for(var j = 0; j < tdata.data[mi][0].length; j++) {
				row.push({
					type : "td",
					colspan : 1,
					value : tdata.data[mi][i][j]
				});
			}
			table.push(row);
		}
		multiTables.push(table);
	}

	return multiTables;
};

function revertCR(tdata) {
	//switch col and row headers
	var temp = tdata.rowheaders;
	tdata.rowheaders = tdata.colheaders;
	tdata.colheaders = temp;

	//switch data
	for(var i = 0; i < tdata.data.length; i++) {
		tdata.data[i] = rows2cols(tdata.data[i]);
	}
};

function rows2cols(a) {
	var r = [];
	var t;

	for(var i = 0, iLen = a.length; i < iLen; i++) {
		t = a[i];

		for(var j = 0, jLen = t.length; j < jLen; j++) {
			if(!r[j]) {
				r[j] = [];
			}
			r[j][i] = t[j];
		}
	}
	return r;
};

function multiplyHeader(header1, header2) {
	var result = [];
	for(var i = 0; i < header1.length; i++) {
		var row = [];
		for(var j = 0; j < header1[i].length; j++) {
			for(var k = 0; k < header2[0].length; k++) {
				row.push(header1[i][j]);
			}
		}
		result.push(row);
	}

	for(var i = 0; i < header2.length; i++) {
		var row = [];
		for(var j = 0; j < header1[0].length; j++) {
			row = row.concat(header2[i]);
		}
		result.push(row);
	}
	return result;
};

function multiplyData(d1, d2, fdata) {
	var table = [];

	if(d1 === "mnd") {
		if(d2 === "aa1") {
			for(var i = 0; i < fdata.mg[0].val.length; i++) {
				var row = [];
				for(var j = 0; j < fdata.mg.length; j++) {
					row = row.concat(fdata.mg[j].val[i]);
				}
				table.push(row);
			}

		} else if(d2 === "aa2") {
			for(var i = 0; i < fdata.mg.length; i++) {
				for(var j = 0; j < fdata.aa2[0].length; j++) {
					table.push(fdata.mg[i].val[j]);
				}
			}
		}

	} else if(d2 === "mnd") {
		if(d1 === "aa1") {
			for(var i = 0; i < fdata.mg[0].val.length; i++) {
				var row = [];
				for(var j = 0; j < fdata.mg[0].val[i].length; j++) {
					for(var k = 0; k < fdata.mg.length; k++) {
						row.push(fdata.mg[k].val[i][j]);
					}
				}
				table.push(row);
			}

		} else if(d1 === "aa2") {
			for(var i = 0; i < fdata.aa2[0].length; i++) {
				for(var j = 0; j < fdata.mg.length; j++) {
					table.push(fdata.mg[j].val[i]);
				}
			}
		}
	} else {
		//wrong parameter, there must be one mnd for multiply
	}

	return [table];

}

// make simple data structure
function buildFlatData(data) {
	var aa1, aa2, val, result;
	for(var i = 0; i < data.analysisAxis.length; i++) {
		if(data.analysisAxis[i].index === 1) {
			aa1 = data.analysisAxis[i].data;
		} else if(data.analysisAxis[i].index === 2) {
			aa2 = data.analysisAxis[i].data;
		} else {
			console.log('Does not support more than 2 axis for now');
		}
	}
	result = {};
	result.aa1 = buildDimensionFlatData(aa1);
	result.aa2 = buildDimensionFlatData(aa2);
	result.mg = [];

	for(var i = 0; i < data.measureValuesGroup.length; i++) {
		var mg = data.measureValuesGroup[i].data;
		result.mg = result.mg.concat(buildMeasureFlatData(mg));
	}

	return result;
};

function buildDimensionFlatData(aa) {
	var result = [];

	for(var i = 0; i < aa.length; i++) {
		var dim = [];
		for(var j = 0; j < aa[i].values.length; j++) {
			var val = {};
			val.val = aa[i].values[j];
			val.name = aa[i].name;
			dim.push(val);
		}
		result.push(dim);
	}

	return result;
};

function buildMeasureFlatData(mg) {
	var result = [];

	for(var i = 0; i < mg.length; i++) {
		var dim = {};
		dim.name = mg[i].name;
		dim.val = mg[i].values;
		result.push(dim);
	}

	return result;
};