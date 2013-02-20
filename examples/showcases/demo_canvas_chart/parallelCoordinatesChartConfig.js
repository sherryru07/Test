var chart = {
  id : 'riv/parco',
  name : 'Parallel Coordinates Chart',
  modules : {
    title : {
      id : 'sap.viz.modules.title',
      configure : {
	      propertyCategory : 'title'
      }
    },
    legend : {
      id : 'sap.viz.modules.legend',
      data : {
	      aa : [ 2 ]
      },
      configure : {
	      propertyCategory : 'legend'
      }
    },
    main : {
      id : 'sap.viz.modules.xycontainer',
      modules : {
	      plot : {
		      id : 'sap.viz.modules.parco'
	      }
      }
    }
  },
  dependencies : {
    attributes : [ {
      targetModule : 'legend',
      target : 'colorPalette',
      sourceModule : 'main.plot',
      source : 'colorPalette'
    } ],
    events : []
  }
};