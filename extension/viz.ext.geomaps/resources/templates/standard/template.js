var geoEffect = {
  legend : {
    drawingEffect : "normal",
    title : {
      visible : true
    },
  },
  tooltip : {
    drawingEffect : "normal"
  },
  plotArea : {
    drawingEffect : "normal"
  }
};

sap.viz.TemplateManager.extend("standard", {
  properties : {
    'viz/geobubble' : geoEffect,
    'viz/geopie' : geoEffect,
    'viz/choropleth' : geoEffect,
    'viz/multi_geobubble' : geoEffect,
    'viz/multi_choropleth' : geoEffect
  }
});
