//Global data and options
var ds = new sap.viz.data.CrosstableDataset();
var dspie = new sap.viz.data.CrosstableDataset();
ds.setData({
	'analysisAxis' : [{
		'index' : 1,
		'data' : [{
			'type' : 'Dimension',
			'name' : 'Product',
			'values' : ['Car', 'Truck', 'Motorcycle', 'Bicycle']
		}]
	}, {
		'index' : 2,
		'data' : [{
			'type' : 'Dimension',
			'name' : 'Country',
			'values' : ['China', 'USA']
		}, {
			'type' : 'Dimension',
			'name' : 'Year',
			'values' : ['2001', '2001']
		}]
	}],
	'measureValuesGroup' : [{
		'index' : 1,
		'data' : [{
			'type' : 'Measure',
			'name' : 'Profit',
			'values' : [[25, 136, 23, 116], [58, 128, 43, 73]]
		}, {
			'type' : 'Measure',
			'name' : 'Revenue',
			'values' : [[50, 236, 43, 126], [158, 228, 143, 183]]
		}]
	}]
});
dspie.setData({
	'analysisAxis' : [{
		'index' : 1,
		'data' : [{
			'type' : 'Dimension',
			'name' : 'Country',
			'values' : ['China', 'China', 'USA', 'USA', 'Canada', 'Canada']
		}, {
			'type' : 'Dimension',
			'name' : 'Year',
			'values' : ['2001', '2002', '2001', '2002', '2001', '2002']
		}]
	}],
	'measureValuesGroup' : [{
		'index' : 1,
		'data' : [{
			'type' : 'Measure',
			'name' : 'Profit',
			'values' : [[25, 58, 58, 159, 149, 38]]
		}]
	}]
});

var chartOption = {
	title : {
		visible : true,
		text : 'Sample Annoation'
	}
};
