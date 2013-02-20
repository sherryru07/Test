//The tree strcuture assume each parent has several children and each children has only one parent

function table2tree(data) {
	var tree = {};
	var root = findRoot(data);
	buildTree(tree,data,root);
	return tree;
}

function buildTree(tree, data, parent) {
	var parentNames = data.getAnalysisAxisDataByIdx(0).values[0].rows;
	var childrenNames = data.getAnalysisAxisDataByIdx(0).values[1].rows;
	var values = data.getMeasureValuesGroupDataByIdx(0).values[0].rows[0];
	var index = 0, parentIndex = [];
	
	while (true) {
		var pos = inArray(parent, parentNames, index) ;
		
		if ( pos === -1) {
			break;
		}
		parentIndex.push(pos);
		index = pos + 1;
	}
	
	for ( var i = 0; i < parentIndex.length ; i ++ ) {
		var child = insert2Tree(tree, parentNames[parentIndex[i]].val, childrenNames[parentIndex[i]].val, values[parentIndex[i]].val);
		buildTree(child,data,childrenNames[parentIndex[i]].val);
	}
}

function insert2Tree(tree, parent, child, value) {
	if(tree.name === undefined) {
		tree.name = parent;
	}

	if(tree.children === undefined) {
		tree.children = [];
	}

	var result = {
		name : child
	};
	
	if( value !== null) {
		result.size = value;
	}
	
	tree.children.push(result);
	return result;
}

function findRoot(data) {
	var parentNames = data.getAnalysisAxisDataByIdx(0).values[0].rows;
	var childrenNames = data.getAnalysisAxisDataByIdx(0).values[1].rows;
	var length = parentNames.length;

	for(var i = 0; i < length; i++) {
		var name = parentNames[i].val;
		if(inArray(name, childrenNames, 0) === -1) {
			return name;
		}
	}
}

function inArray(value, arr, fromIndex) {
	for (var i = fromIndex; i < arr.length; i ++) {
		if ( value === arr[i].val ) {
			return i;
		}
	}
	return -1;
}
