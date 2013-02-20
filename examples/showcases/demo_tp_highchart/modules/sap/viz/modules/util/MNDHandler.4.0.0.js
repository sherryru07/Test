sap.riv.module(
{
  qname : 'sap.viz.modules.util.MNDHandler',
  version : '4.0.0'},
[

],
function Setup() 
{

  return function(data) 
  {
    var dataset1;
    var dataset2;
    var hasMND = false;
    var bMNDOnColor = true;
    var bMNDInner = false; 
    var bDualAxis = false;
    var measureFeed2 = data.getMeasureValuesGroupDataByIdx(1);
    var measureFeed1 = data.getMeasureValuesGroupDataByIdx(0);
    var regionColorFeed = data.getAnalysisAxisDataByIdx(1);
    var categoryFeed = data.getAnalysisAxisDataByIdx(0);

    if((measureFeed2 && measureFeed2.values && measureFeed2.values.length > 0))
    {
      bDualAxis = true;
    }
    if(categoryFeed && categoryFeed.values && categoryFeed.values.length > 0)
    {
      if (categoryFeed.values[0].type === 'MND')
      {
        hasMND = true;
        bMNDOnColor = false;
        bMNDInner = false;
      }else if(categoryFeed.values[categoryFeed.values.length - 1].type === 'MND')
      {
        hasMND = true;
        bMNDOnColor = false;
        bMNDInner = true;
      }
    }

    if(regionColorFeed && regionColorFeed.values && regionColorFeed.values.length > 0)
    {
      if(regionColorFeed.values[0].type === 'MND')
      {
        hasMND = true;
        bMNDInner = false;
      }else if(regionColorFeed.values[regionColorFeed.values.length - 1].type === 'MND')
      {
        hasMND = true;
        bMNDInner = true;
      }
    }

    // MND on axis label
    function processOneAxisValue(feed)
    {
      var dataset = [];
      var i, j, k;
      var measureData;
      if (feed.values.length <= 0){
        return dataset;
      }
      if (hasMND && !bMNDOnColor)
      {
        for(j = 0; j < feed.values[0].rows.length; ++j)
        {    
          measureData = new Array(feed.values.length * feed.values[0].rows[0].length);
          for(k = 0; k < feed.values[0].rows[0].length; ++k)
          {
            for(i = 0 ; i < feed.values.length; ++i)
            {
              var dataPoint = {};
              dataPoint.val = feed.values[i].rows[j][k].val;
              dataPoint.ctx = feed.values[i].rows[j][k].ctx;
              if(bMNDInner){
                measureData[k * feed.values.length + i] = dataPoint;
              } else {
                measureData[i * feed.values[0].rows[0].length + k] = dataPoint; 
              }
            }
          }
          dataset.push(measureData);
        }  
      }
      else // MND on Region color or no MND
      {
        dataset = new Array(feed.values.length * feed.values[0].rows.length);

        for(i = 0 ; i < feed.values.length; ++i)
        {
          for(j = 0; j < feed.values[0].rows.length; ++j)
          {    
            measureData = feed.values[i].rows[j];
            if(!hasMND || !bMNDInner){
              dataset[i * feed.values[0].rows.length + j] = measureData;
            } else {
              dataset[j * feed.values.length + i] = measureData;
            }
          }
        }
      }

      return dataset;
    }

    function addOneMeasure(dataset, measure)
    {
      for(var i = 0; i < measure.length; ++i)
      {
        dataset[i] = dataset[i].concat(measure[i]);
      }
    }

    function mergeTwoAxis(result)
    {
      var colors = [];
      var measure1Num = measureFeed1.values.length;
      var measure2Num = measureFeed2.values.length;
      var columnNum  = measureFeed1.values[0].rows[0].length;
      var dataset = new Array(measureFeed1.values[0].rows.length); 
      var curColumn = 0;
      var i,j,k;
      for(i = 0; i < dataset.length; ++i){
        dataset[i] = [];
      }
      if(bMNDInner){
        var rowNum = measureFeed1.values[0].rows.length;
        for(i = 0; i < columnNum; ++i)
        {

          for(j = 0; j < measure1Num; ++j)
          {
            for(k = 0; k < rowNum; ++k){
              dataset[k][curColumn] = measureFeed1.values[j].rows[k][i];
            }
            colors[curColumn] = 0;
            ++curColumn;
          }
          for(j = 0; j < measure2Num; ++j)
          {
            for(k = 0; k < rowNum; ++k){
              dataset[k][curColumn] = measureFeed2.values[j].rows[k][i];
            }
            colors[curColumn] = 1;
            ++curColumn;
          }
        }
      }else{
        for(i = 0; i < measure1Num; ++i)
        {
          for(j = 0; j < columnNum; ++j)
          {
            colors[curColumn++] = 0; 
          }
          addOneMeasure(dataset, measureFeed1.values[i].rows);
        }
        for(i = 0; i < measure2Num; ++i)
        {
          for(j = 0; j < columnNum; ++j)
          {
            colors[curColumn++] = 1; 
          }
          addOneMeasure(dataset, measureFeed2.values[i].rows);
        }
      }
      result['MG1'] = dataset;
      result["MG1Number"] = measureFeed1.values.length;
      result['color'] = colors;
    }

    var result = {};

    if(bDualAxis && !bMNDOnColor)
    {
      mergeTwoAxis(result);
    }else{
      dataset1 = processOneAxisValue(measureFeed1);
      result["MG1Number"] = measureFeed1.values.length;
      if(bDualAxis){
        dataset2 = processOneAxisValue(measureFeed2);
        result["MG2Number"] = measureFeed2.values.length;
      }
      result["MG1"] = dataset1;
      result["MG2"] = dataset2;
    }
    result["hasMND"] = hasMND;
    result["MNDOnColor"] = bMNDOnColor;
    result['MNDInner'] = bMNDInner;
    return result;

  };
});