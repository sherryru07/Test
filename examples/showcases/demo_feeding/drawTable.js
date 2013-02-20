function drawTable(tableContainer,tableData)
{
	tableContainer.empty();
	var row = calculateHeight(tableData);
	var col = calculateWidth(tableData);
	var measureArray = colectMeasure(tableData);
	for(var m=0;m<measureArray.length;m++)
	{
		var k=m+1;
		if(measureArray[m].name != "") {
			var measureTitle = "<table>"+measureArray[m].name+":</table>";
		}else {
			var measureTitle = "<table>Fake Data:</table>";
		}
		var table = '<table id="table'+k+'" border=1>';
		var tr = '';
		//draw aa1 cells
		for(var i=0;i<extralHeight(tableData);i++)
		{
			var td='';
			for(j=0;j<col;j++)
			{
				if(j<extralWidth(tableData))
				{
					var celString = '';
				}else
				{
					celString = tableData.analysisAxis[0].data[i].values[j-extralWidth(tableData)];
				}
				td= td+'<th>'+celString+'</th>';
			}
			tr = tr+'<tr>'+td+'</tr>';
		}
		
		//draw aa2 and measures
		for(var i=extralHeight(tableData);i<row;i++)
		{
			var td='';
			for(var j=0;j<col;j++)
			{
				if(j<extralWidth(tableData))
				{
					var celString = tableData.analysisAxis[1].data[j].values[i-extralHeight(tableData)];
					td= td+'<th>'+celString+'</th>';
				}else
				{
					celString = measureArray[m].values[i-extralHeight(tableData)][j-extralWidth(tableData)];
					td= td+'<td>'+celString+'</td>';
				}
			}
			tr = tr+'<tr>'+td+'</tr>';
		}
		table = table+tr+'</table>';
		tableContainer.append(measureTitle);
		tableContainer.append(table);
	}
}

//calculate the aa1's number
function extralHeight(tableData)
{
	if(tableData.analysisAxis != null) {
		if(tableData.analysisAxis[0] == null)
			return 0;
		else
			return tableData.analysisAxis[0].data.length;
	}else {
		return 0;
	}
}

//calculate the aa2's number
function extralWidth(tableData)
{
	if(tableData.analysisAxis != null) {
		if(tableData.analysisAxis[1] == null)
			return 0;
		else
			return tableData.analysisAxis[1].data.length;
	}else {
		return 0;
	}
}

//the table's height is extralHeight plus the aa2's number
function calculateHeight(tableData)
{
	if(tableData.analysisAxis != null) {
		if(tableData.analysisAxis[1] == null)
		{
			return extralHeight(tableData)+1;
		}else
		{
			return extralHeight(tableData)+tableData.analysisAxis[1].data[0].values.length;
		}
	}else {
		return 1;
	}
}

//the table's width is extralWidth plus the aa1's number
function calculateWidth(tableData)
{
	if(tableData.analysisAxis != null) {
		if(tableData.analysisAxis[0] == null)
		{
			return extalWidth(tableData)+1;
		}else
		{
			return extralWidth(tableData)+tableData.analysisAxis[0].data[0].values.length;
		}
	}else {
		return tableData.measureValuesGroup[0].data[0].values[0].length;
	}
}

function colectMeasure(tableData)
{
	var measureSet = [];
	var tempData = tableData.measureValuesGroup;
	for(var i=0;i<tempData.length;i++)
	{
		for(var j=0;j<tempData[i].data.length;j++)
		{
			var measureobj={};
			measureobj.name = tempData[i].data[j].name;
			measureobj.values = tempData[i].data[j].values;
			measureSet.push(measureobj);
		}
	}
	return measureSet;
}