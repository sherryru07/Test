$(function() {
	var valueFeed = {
		'id' : 'sap.viz.modules.parco.valueaxis1',
		'name' : 'Primary Values',
		'type' : 'Measure',
		'min' : 1,
		'max' : Number.POSITIVE_INFINITY,
		'mgIndex' : 1
	};

	var dimensionFeed = {
		'id' : 'sap.viz.modules.parco.dimension',
		'name' : 'Sample',
		'type' : 'Dimension',
		'min' : 1,
		'max' : 1,
		'acceptMND' : false,
		'aaIndex' : 1
	};

	var colorFeed = {
		'id' : 'sap.viz.modules.parco.series.color',
		'name' : 'Category',
		'type' : 'Dimension',
		'min' : 1,
		'max' : Number.POSITIVE_INFINITY,
		'acceptMND' : false,
		'aaIndex' : 2
	};
	module = {
		'id' : 'sap.viz.modules.parco',
		'type' : 'CHART',
		'name' : 'parallel coordinates',
		'datastructure' : 'DATA STRUCTURE DOC',
		'properties' : {
		},
		'events' : {
		},
		'feeds' : [valueFeed, dimensionFeed, colorFeed],
		'css' : null,
		'configure' : null,
		'fn' : parcoChart
	};

	sap.viz.Manifest.module.register(module);
});
