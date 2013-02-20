sap.riv.module(
{
  qname : 'sap.viz.util.MeasureBasedColoring',
  version : '4.0.0'},
[

],
function Setup() {
  var MeasureBasedColoring = {
    getScale : function(minVal, maxVal, ticksCount, startColor, endColor) {
      var colorScale = d3.scale.linear().domain([ minVal, maxVal ])
        .range([ startColor, endColor ]).nice();
     
      var colorScaleNice = colorScale.domain(); 
      var t1 = getAccFormat(colorScaleNice[0]), t2 = getAccFormat(colorScaleNice[1]);
      var totalPrecision = t1 > t2 ? t1 : t2;
      totalPrecision++;
      
      var niceDomain = colorScale.domain();
      niceDomain = formatRange(niceDomain, totalPrecision);
      
      minVal = niceDomain[0];
      maxVal = niceDomain[1];
      
      if(minVal === maxVal){
        //only one value in range.
        ticksCount = 1;
      }
      var span = maxVal - minVal, ticks = [], step, precision = 0;
      if(span / ticksCount > 1){
        if (span % ticksCount === 0) {
          // divied properly
          step = format(span / ticksCount, totalPrecision + 1);
          precision = getAccFormat(step);
          
          for ( var i = 0; i < ticksCount + 1; i++) {
            ticks.push(minVal + format(i * step, precision));
          }
        } else {
          step = Math.ceil(span / ticksCount);
          precision = getAccFormat(step);
          var start = Math.floor(minVal / step) * step;
          if(start === 0 || (start + step*ticksCount < maxVal)) start = minVal;
          
          for ( var i = 0; i < ticksCount + 1; i++) {
            ticks.push(start + format(i * step, precision));
          }
        }
      }else{
        //Can't be divided with integrate. 
        start = minVal, step = format(span / ticksCount, totalPrecision + 1);
        precision = getAccFormat(step);
        
        for(var i = 0; i < ticksCount; i++){
          ticks.push(start + format(i * step, precision));
        }
        ticks.push(format(maxVal, precision));
      }
      
      //format all values
      for(var i = 0, len = ticks.length; i < len; i++){
        ticks[i] = format(ticks[i], precision);
      }
      
      //reset color scale
      colorScale = d3.scale.linear().domain([ 0, ticksCount-1 ]).range([ startColor, endColor ]);
      
      var domainRg = [], rangeRg = [];
      for ( var i = 0, len = ticks.length - 1; i < len; i++) {
        domainRg.push([ ticks[i], ticks[i + 1] ]);
        rangeRg.push(colorScale(i));
      }

      var fontColorScale = d3.scale.ordinal().domain(domainRg).range(rangeRg);
      return fontColorScale;
    }
  };
  
  var formatRange = function(range, precision){
    for(var i = 0, len = range.length; i < len; i++){
      range[i] = format(range[i], precision);
    }
    return range;
  };
  
  var getAccFormat = function(value){
    var t = value.toString().split(".");
    return t.length > 1 ? t[1].length : 0;
  };
  
  var format = function(value, precision){
    return Math.round(Math.pow(10, precision) * value) / Math.pow(10, precision);
  };
  
  return MeasureBasedColoring;
});