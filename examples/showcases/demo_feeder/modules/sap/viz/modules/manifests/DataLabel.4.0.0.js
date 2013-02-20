sap.riv.module(
{
  qname : 'sap.viz.modules.manifests.DataLabel',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.manifests.Module',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.datalabel',
  version : '4.0.0'
}
],
function Setup(Manifest,Constants, fn) {
  var module = {
    'id' : 'sap.viz.modules.datalabel',
    'name' : 'datalabel',
    'type' : Constants.Module.Type.Supplementary,
    'properties' : {  
      'visible': {
        'name' : 'visible',
        'supportedValueType' : 'Boolean',
        'defaultValue' : false,
        'description' : 'Set whether data label is visible.',
     },
     'isDonut': {
       'name' : 'isDonut',
       'supportedValueType' : 'Boolean',
       'defaultValue' : false,
       'description' : 'Set for donut chart only.',
       'isExported': false
    },
    'type' : {
      'name' : 'type',
      'supportedValueType' : 'String',
      'defaultValue' : 'value',
      'description' : 'Set the type of label',
      'isExported': false
    },
    'automaticInOutside': {
      'name' : 'automaticInOutside',
      'supportedValueType' : 'Boolean',
      'defaultValue' : true,
      'description' : 'if it is true, the data label will be automatically placed outside when data label postion property is inside and vice versa.',
      'isExported': false    
    },
    'showZero': {
      'name' : 'showZero',
      'supportedValueType' : 'Boolean',
      'defaultValue' : true,
      'description' : 'if it is true, the value zero will be shown in data label.',
      'isExported': false    
    },
    'isGeoChart': {
      'name' : 'isGeoChart',
      'supportedValueType' : 'Boolean',
      'defaultValue' : false,
      'description' : 'if it is true, it is a geo chart.',
      'isExported': false    
    },
    'isStackMode': {
      'name' : 'isStackMode',
      'supportedValueType' : 'Boolean',
      'defaultValue' : false,
      'description' : 'Set for stack chart only.',
      'isExported': false    
    },
    'isPercentMode': {
      'name' : 'isPercentMode',
      'supportedValueType' : 'Boolean',
      'defaultValue' : false,
      'description' : 'Set for percent chart only.',
      'isExported': false    
    },
    'positionPreference': {
      'name' : 'positionPreference',
      'supportedValueType' : 'Boolean',
      'defaultValue' : false,
      'description' : 'If it is true, the data label position is defined by property outsidePosition no matter whether data label value is negative.',
      'isExported': false    
    },
    'outsideVisible': {
      'name' : 'outsideVisible',
      'supportedValueType' : 'Boolean',
      'defaultValue' : true,
      'description' : 'when data label is oustide, it can control whether it is visible or not.',
      'isExported': false    
    },
    'outsidePosition': {
      'name' : 'outsidePosition',
      'supportedValueType' : 'List',
      'supportedValues': ['up','down', 'left', 'right'],
      'defaultValue' : 'up',
      'description' : 'when data label is oustide, its position is above the element.',
      'isExported': false    
    },
        'paintingMode': {
           'name' : 'paintingMode',
           'supportedValueType' : 'List',
           'supportedValues': ['rect-coordinate','polar-coordinate'],
           'defaultValue' : 'rect-coordinate',
           'description' : 'Set painting mode of data labels.',
           'isExported' : false
        },
        'position': {
           'name' : 'position',
           'supportedValueType' : 'List',
           'supportedValues' : ['inside','outside'],
           'defaultValue' : 'inside',
           'description' : 'Set position of data labels.'
        },
        'orientation': {
           'name' : 'orientation',
           'supportedValueType' : 'List',
           'supportedValues' : ['horizontal', 'vertical'],
           'defaultValue' : 'vertical',
           'description' : 'Set orientation of data labels.',
           'isExported' : false
        },
        'formatString': {
        	'name' : 'formatString',
        	'supportedValueType': 'Two-Dimensions-Array',
          'defaultValue' : null,
        	'description' : 'Set format string of datalabel.As we may have dual axis with serveral measures,the first array is applied to primary axis and the second one is applied to the second axis.'
        		+'If the length of format string list is less than the length of data series, the last format string in the list will be applied to exceeded data series.' 
        	}
      },
      'css' : {
        '.viz-datalabel' : {
          'description' : 'Define style for the data label',
          'value' : {
            'fill' : '#333333',
            'font-family' : "'Open Sans', Arial, Helvetica, sans-serif",
            'font-size' : '12px',
            'font-weight' : 'normal'
          }
        }
      },
      configure: null,
    fn : fn
  };

  Manifest.register(module);
});