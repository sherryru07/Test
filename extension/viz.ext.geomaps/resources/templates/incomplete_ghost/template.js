var axisColor = "#333333";

var backgroundProperty = {
    border:{
        left:{
            visible: false
        },
        
        right:{
            visible: false
        },
        
        top:{
            visible: false
        },
        
        bottom:{
            visible: false
        }
    }
};

var interactionProperty = {
    selectability : {
        mode : "none"
    },
    enableMouseOver : false,
    enableMouseOut : false,
    enableMouseMove : false
};

var animationProperty = {
    dataLoading : false,
    dataUpdating : false
};

var ghostPropertiesGeoChart = {
    
    plotArea : {
        animation : animationProperty
    },
    
    title: {
        visible: false
    },
    
    legend: {
        visible: false
    },

    sizeLegend : {
        visible : false
    },
    
    background : backgroundProperty,
    interaction : interactionProperty,

    geoController : {
        disableInteraction : true
    }
};

sap.viz.TemplateManager.extend("incomplete_ghost", {
    properties : {
        'viz/geobubble' : ghostPropertiesGeoChart,
        'viz/geopie' : ghostPropertiesGeoChart,
        'viz/choropleth' : ghostPropertiesGeoChart,
        'viz/multi_geobubble' : ghostPropertiesGeoChart,
        'viz/multi_choropleth' : ghostPropertiesGeoChart
    }
});
