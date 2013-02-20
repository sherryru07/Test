var geoEffect = {
  legend : {
    drawingEffect : "glossy",
    title : {
      visible : true
    },
  },
  tooltip : {
    drawingEffect : "glossy"
  },
  plotArea : {
    drawingEffect : "glossy"
  }
};

sap.viz.TemplateManager.extend("flashy", {
  properties : {
    'viz/geobubble' : geoEffect,
    'viz/geopie' : geoEffect,
    'viz/choropleth' : geoEffect,
    'viz/multi_geobubble' : geoEffect,
    'viz/multi_choropleth' : geoEffect
  }
});
