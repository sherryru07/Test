var plainTableBuilder = function(div,meta, data) {	
	var table = d3.select(div).append("table");
	var tableData = buildPlainTableData(meta,data);
	console.log(tableData);
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
	
	//console.log(table);
};
//Build Data Table
function buildPlainTableData(metadata, data) {
	result = [];
	var headerRow = [];
	for (var i = 0; i < metadata.length ; i ++) {
		
		headerRow.push({type:"th",name:metadata[i].type,value:metadata[i].colName});
	}
	result.push(headerRow);
	
	for (var i = 0; i < data.length ; i ++) {
		var row = [];
		for (var j =0; j < metadata.length ; j ++) {
		row.push({type:"td",name:metadata[j].colName,value:data[i][metadata[j].colName]});
		}
		result.push(row);
	}
	
	return result;
};
