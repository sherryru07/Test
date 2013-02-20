sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.Radar',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.radar',
  version : '4.0.0'
},
{  qname : 'sap.viz.feeds.Radar',
  version : '4.0.0'
}
],
function Setup( Manifest, Constants, fn ) {
  var module = {
    id : "sap.viz.modules.radar",
    type : Constants.Module.Type.Chart,
    name : "radar",
    description : "Radar module properties",
    properties : {
      drawingEffect : {
        name : 'drawingEffect',
        supportedValueType : 'List',
        supportedValues : [ 'normal', 'glossy' ],
        defaultValue : 'normal',
        description : 'Set drawing effect of radar.',
        isExported : true
      },
      polarGrid : {
        name : "polarGrid",
        supportedValueType : "Object",
        supportedValues : {
          visible : {
            name : "visible",
            supportedValueType : "Boolean",
            defaultValue : true,
            description : "Set polar gridline visibility switch."
          },
          color : {
            name : "color",
            supportedValueType : "String",
            defaultValue : "#d8d8d8",
            description : "Set polar gridline color."
          }
        },
        description : "Settings for Polar gridline customizations."
      },
      valueAxis : {
        name : "valueAxis",
        supportedValueType : "Object",
        supportedValues : {
          visible : {
            name : "visible",
            supportedValueType : "Boolean",
            defaultValue : true,
            description : "Set value axis visibility switch."
          },
          title : {
            name : "title",
            supportedValueType : "Object",
            supportedValues : {
              visible : {
                name : "visible",
                supportedValueType : "Boolean",
                defaultValue : false,
                description : "Set value axis title visibility switch."
              },
              text : {
                name : "text",
                supportedValueType : "String",
                defaultValue : "Value",
                description : "Set value axis title text."
              },
            },
            description : "Settings for value axis title."
          },
          label : {
        	name : "label",
        	supportedValueType : "Object",
        	supportedValues : {         	  
        	  formatString : {
                name : 'formatString',
        		supportedValueType : 'String',
        		defaultValue : null,
        		description : 'Set format string of value axis. If number format and format string are both set, number format will be ignored. '
        	  }
            },
              description : "Settings for axis label."
          }
        },
        description : "Settings for value axis at side bar."
      },
      polarAxis : {
        name : "polarAxis",
        supportedValueType : "Object",
        supportedValues : {
          title : {
            name : "title",
            description: "Settings for polar axis title.",
            supportedValueType : "Object",
            supportedValues : {
              visible : {
                name : "visible",
                supportedValueType : "Boolean",
                defaultValue : false,
                description : "Set category axis visibility switch."
              },
              text : {
                name : "text",
                supportedValueType : "String",
                defaultValue : "Categories",
                description : "Set category axis text."
              }
            }
          }
        },
        description : "Settings for polar axes customizations."
      },
      colorPalette : {
        name : "colorPalette",
        defaultValue : Constants.SAPColor,
        description : "Set marker color customizations."
      },
      shapePalette : {
        name : "shapePalette",
        supportedValueType : "StringArray",
        defaultValue : [ "circle", "diamond", "triangle-up", "triangle-down", 
                  "triangle-left", "triangle-right", "cross", "intersection" ],
        supportedValues : [ "circle", "diamond", "triangle-up", "triangle-down", 
                  "triangle-left", "triangle-right", "cross", "intersection" ],
        description : 'Set marker shape customizations.'
      },
      line : {
        name : "line",
        description : "Settings for line customizations.",
        supportedValueType : "Object",
        supportedValues : {
          width : {
            name : 'width',
            supportedValueType : 'PositiveInt',
            defaultValue : 2,
            description : "Line weight settings. Range is [1, 7]"
          }
        }
      },
      surface : {
        name : "surface",
        supportedValueType : "Object",
        supportedValues : {
          fill : {
            name : 'fill',
            supportedValueType : 'Object',
            supportedValues : {
              visible : {
                name : 'visible',
                supportedValueType : 'Boolean',
                defaultValue : true,
                description : 'Set enable/disable fill effect for polar area.'
              },
              transparency : {
                name : 'transparency',
                supportedValueType : 'Double',
                defaultValue : 0.3,
                //min : '0',
                //max : '1',
                description : 'Set alpha value for polar area fill color.'
              },
            }
          }
        },
        description : "Settings for Surface customizations."
      },
      marker : {
        name : "marker",
        //description : "Settings for data point marker customizations.",
        supportedValueType : "Object",
        supportedValues : {
          size : {
            name : "size",
            supportedValueType : "PositiveInt",
            defaultValue : 6,
            min : 4,
            max : 32,
            description : "Set marker size customization."
          }
        },
        description : "Settings for marker/data point graphics."
      },
      tooltip : {
        name : "tooltip",
        supportedValueType : "Object",
        supportedValues : {
          enabled : {
            name : "enabled",
            supportedValueType : "Boolean",
            supportedValues : [ true, false ],
            defaultValue : true,
            description : "Set tooltip enablement."
          }
        },
        'isExported' : false,
        description : "Settings for tooltip customization."
      },
    },
    events : {
      'initialized': Constants.Module.Event.Initialized.desc,
      selectData : Constants.Module.Event.SelectData.desc,
      deselectData : Constants.Module.Event.DeSelectData.desc,
      showTooltip : Constants.Module.Event.TooltipShow.desc,
      hideTooltip : Constants.Module.Event.TooltipHide.desc
    },
    feeds : {
      id : "radar"
    },
    css : {    
      ".viz-axis-title" : {
        description : "Font style for polar axis title.",
        value : {
          fill : "#333333",
          "font-family" : "'Open Sans', Arial, Helvetica, sans-serif",
          "font-size" : "14px",
          "font-weight" : "bold"
        }
      },
      '.viz-axis-label' : {
        'description' : 'Define style for the axis label.',
        'value' : {
          'fill' : '#333333',
          'font-family' : "'Open Sans', Arial, Helvetica, sans-serif",
          'font-size' : '12px',
          'font-weight' : 'normal'
        }
      },     
      ".viz-polar-axis-label" : {
        description : "Font styles for polar axis labels.",
        value : {
          "font-family" : "'Open Sans', Arial, Helvetica, sans-serif",
          "fill" : "#333333",
          "font-size" : "11px",
          "font-weight" : "bold"
        }
      }
    },
    configure : null,
    fn : fn
  };
  Manifest.register(module);
});