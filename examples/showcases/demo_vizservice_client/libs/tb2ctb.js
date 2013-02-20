var queryEngine = "jslinq";

function queryDims(data, axisBinding) {
	var result;
	if (queryEngine === "jsonpath") {
		result = uniqueArray(jsonPath(data, "$.*." + axisBinding));
	} else if (queryEngine === "spahql") {
		var db = SpahQL.db(data);
		result = uniqueArray(db.select("//*/" + axisBinding).values());
	} else if (queryEngine === "sqlike") {
		var query = SQLike.q({
			SelectDistinct : [axisBinding],
			From : data,
			OrderBy : [axisBinding]
		})

		function queryToArry(q) {
			var a = [];
			for (var i = 0; i < q.length; i++) {
				a.push(q[i][axisBinding]);
			}
			return a;
		}

		result = queryToArry(query);
	} else if (queryEngine === "jslinq") {
		//order removed
		var query = JSLINQ(data).Distinct(function(item) {
			return item[axisBinding];
		});

		result = query.items;
	} else if (queryEngine === "jsinq") {
		var enumerable = new jsinq.Enumerable(data);

		var query = enumerable.orderBy(function(item) {
			return item[axisBinding];
		}).select(function(item) {
			return item[axisBinding];
		}).distinct().toArray();

		result = query;
	} else if (queryEngine === "jsinq-query") {
		var enumerable = new jsinq.Enumerable(data);
		var queryString = ' from item in $0 orderby item.' + axisBinding + ' select item.' + axisBinding;
		var strQuery = new jsinq.Query(queryString);
		strQuery.setValue(0, enumerable);
		result = strQuery.execute().distinct().toArray();
	} else if (queryEngine === "jlinq") {
		result = jLinq.from(data).orderBy(axisBinding).distinct(axisBinding);
	}
	return result;
}

function queryMesureValue(data, dims1, values1, dims2, values2, measureName) {
	var result;
	if (queryEngine === "jsonpath") {
		var filter = "?(";

		for (var i = 0; i < values1.length; i++) {
			filter = filter + "@." + dims1[i] + "==\'" + values1[i] + "\'";
			if (values1.length !== 0) {
				filter = filter + " && ";
			}
		}

		for (var i = 0; i < values2.length; i++) {
			filter = filter + "@." + dims2[i] + "==\'" + values2[i] + "\' ";
			if (i !== values2.length - 1) {
				filter = filter + " && ";
			}
		}
		filter = filter + ")";
		//console.log(JSON.stringify(filter));
		result = jsonPath(data, "$..[" + filter + "]." + measureName);
	} else if (queryEngine === "spahql") {
		var db = SpahQL.db(data);
		var selection = db.select("/*")
		for (var i = 0; i < values1.length; i++) {
			selection = selection.select("/[/" + dims1[i] + " == '" + values1[i] + "']");
		}
		for (var i = 0; i < values2.length; i++) {
			selection = selection.select("/[/" + dims2[i] + " == '" + values2[i] + "']");
		}
		selection = selection.select("/" + measureName);
		result = selection.values();
	} else if (queryEngine === "sqlike") {
		var query = SQLike.q({
			SelectDistinct : [measureName],
			From : data,
			Where : function() {
				var condition = true;
				for (var i = 0; i < values1.length; i++) {
					condition = condition && (this[dims1[i]] == values1[i] )
				}
				for (var i = 0; i < values2.length; i++) {
					condition = condition && (this[dims2[i]] == values2[i] )
				}
				return condition;
			}
		})
		//console.log(JSON.stringify(query));
		result = [query[0][measureName]];
	} else if (queryEngine === "jslinq") {
		var query = JSLINQ(data).Where(function(item) {
			var condition = true;
			for (var i = 0; i < values1.length; i++) {
				condition = condition && (item[dims1[i]] == values1[i] )
			}
			for (var i = 0; i < values2.length; i++) {
				condition = condition && (item[dims2[i]] == values2[i] )
			}
			return condition;
		}).Select(function(item) {
			return item[measureName];
		});

		//console.log(JSON.stringify(query));
		result = query.items;
	} else if (queryEngine === "jsinq") {
		var ret = [];
		var enumerable = new jsinq.Enumerable(data);

		var query = enumerable.where(function(item) {
			var condition = true;
			for (var i = 0; i < values1.length; i++) {
				condition = condition && (item[dims1[i]] == values1[i] )
			}
			for (var i = 0; i < values2.length; i++) {
				condition = condition && (item[dims2[i]] == values2[i] )
			}
			return condition;
		}).select(function(item) {
			return item[measureName];
		}).toArray();

		result = query;
	} else if (queryEngine === "jsinq-query") {
		var ret = [], filter = '', queryString;
		var enumerable = new jsinq.Enumerable(data);

		for (var i = 0; i < values1.length; i++) {
			filter = filter + "item." + dims1[i] + "== '" + values1[i] + "'";
			if (values1.length !== 0) {
				filter = filter + " && ";
			}
		}

		for (var i = 0; i < values2.length; i++) {
			filter = filter + "item." + dims2[i] + "=='" + values2[i] + "' ";
			if (i !== values2.length - 1) {
				filter = filter + " && ";
			}
		}

		queryString = ' from item in $0 where ' + filter + 'select item.' + measureName;
		var strQuery = new jsinq.Query(queryString);
		strQuery.setValue(0, enumerable);
		result = strQuery.execute().toArray();
	} else if (queryEngine === "jlinq") {
		result = jLinq.from(data).where(function(item) {
			var condition = true;
			for (var i = 0; i < values1.length; i++) {
				condition = condition && (item[dims1[i]] == values1[i] )
			}
			for (var i = 0; i < values2.length; i++) {
				condition = condition && (item[dims2[i]] == values2[i] )
			}
			return condition;
		}).select(function(item) {
			return item[measureName];
		});
	}
	return result;
}

function uniqueArray(inArray) {
	var arr = [];
	for (var i = 0; i < inArray.length; i++) {
		if (jQuery.inArray(inArray[i], arr) === -1) {
			arr.push(inArray[i]);
		}
	}
	return arr;
}

function table2Crosstable(tab, axis1, axis2, mgs) {
	var buildAxis = true, crosstable = {}, dims1, dims2, mgData = [];
	crosstable.analysisAxis = [];
	var axis1Data = {
		index : 1,
		data : []
	}, axis2Data = {
		index : 2,
		data : []
	};

	//Build Axis1
	if (axis1.length > 0) {
		crosstable.analysisAxis.push(axis1Data);
		dims1 = getDimsOnAxis(tab, axis1);
		axis1Data.data = buildAxisStructure(axis1);
	} else {
		//TODO
		//Wrong feeding
		console.log("Invalid Binding , axis1 must contain binding. ");
	}
	//Build Axis2
	if (axis2.length > 0) {
		crosstable.analysisAxis.push(axis2Data);
		dims2 = getDimsOnAxis(tab, axis2);
		axis2Data.data = buildAxisStructure(axis2);
	}

	//Build MG
	for (var i = 0; i < mgs.length; i++) {
		var mv = {
			index : i + 1,
			data : []
		};

		for (var j = 0; j < mgs[i].length; j++) {
			var mvItem = {};
			mvItem.type = "Measure";
			mvItem.name = mgs[i][j];
			mvItem.values = buildMV(dims1, dims2, tab, mvItem.name);
			mv.data.push(mvItem);
		}
		if (mgs[i].length > 0) {
			mgData.push(mv);
		}
	}
	crosstable.measureValuesGroup = mgData;

	//common function
	function getDimsOnAxis(source, axisbinding) {
		var dims = [];
		for (var i = 0; i < axisbinding.length; i++) {
			//Select All dimension names
			dims.push(queryDims(tab, axisbinding[i]));
		}
		return dims;
	}

	function buildAxisStructure(dim) {
		var ret = []
		for (var i = 0; i < dim.length; i++) {
			var d = {};
			d.type = "Dimension";
			d.name = dim[i];
			d.values = [];
			ret.push(d);
		}
		return ret;
	}

	function addAxisValues(axisData, value) {
		for (var i = 0; i < axisData.length; i++) {
			axisData[i].values.push(value[i]);
		}
	}

	function buildMV(dim1Names, dim2Names, data, measureName) {
		var result = [];

		//TODO, replace with two loops
		function iterator(dims) {
			var it = {}, i = 0, j = 0, stack, pointer;

			for (var i = 0; i < dims.length; i++) {
				stack = {};
				stack.pointer = 0;
				stack.values = dims[i];
				stack.getValue = function() {
					return this.values[this.pointer];
				};
				stack.hasNext = function() {
					if (this.pointer + 1 === this.values.length) {
						this.pointer = 0;
						if (this.parent) {
							return this.parent.hasNext();
						} else {
							return false;
						}
					}
					this.pointer++;
					return true;
				}
				stack.parent = pointer;
				pointer = stack;
			}

			stack.pointer = -1;

			it.hasNext = function() {
				return stack.hasNext();
			}

			it.getValue = function() {
				var ret = [];
				var p = stack;
				while (true) {
					if (!p) {
						break;
					}
					ret.push(p.getValue());
					p = p.parent;
				}
				return ret.reverse();
			}

			return it;
		}

		var buildA1 = true;

		if (!dim2Names) {
			var itDims1 = iterator(dim1Names)
			var val = [];
			result.push(val);
			while (itDims1.hasNext()) {
				var v1 = itDims1.getValue();
				var oneDim = queryMesureValue(data, axis1, v1, axis2, [], measureName);

				var i = 0, length = oneDim.length, v = 0;
				for (; i < length; i++) {
					v = v + oneDim[i];
				}
				val.push(v);

				if (buildAxis && buildA1) {
					addAxisValues(axis1Data.data, v1);
				}
			}
			buildA1 = false;
		} else {
			var itDims2 = iterator(dim2Names);
			while (itDims2.hasNext()) {
				var itDims1 = iterator(dim1Names), v2 = itDims2.getValue();
				if (buildAxis) {
					addAxisValues(axis2Data.data, v2);
				}
				var val = [];
				result.push(val);
				while (itDims1.hasNext()) {
					var v1 = itDims1.getValue();
					var oneDim = queryMesureValue(data, axis1, v1, axis2, v2, measureName);

					var i = 0, length = oneDim.length, v = 0;
					for (; i < length; i++) {
						v = v + oneDim[i];
					}
					val.push(v);
					if (buildAxis && buildA1) {
						addAxisValues(axis1Data.data, v1);
					}
				}
				buildA1 = false;
			}
		}

		buildAxis = false;

		return result;
	}

	return crosstable;
}