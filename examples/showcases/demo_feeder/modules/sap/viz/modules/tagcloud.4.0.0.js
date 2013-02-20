sap.riv.module(
{
  qname : 'sap.viz.modules.tagcloud',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.dispatch',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.ColorSeriesGenerator',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.tagcloud.rowLayout',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.tagcloud.columnLayout',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.tagcloud.wordleLayout',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.MeasureBasedColoring',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.NumberUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.Repository',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.tooltipDataHandler',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.BoundUtil',
  version : '4.0.0'
}
],
function Setup(TypeUtils, dispatch, ColorSeries, langManager, RowLayout, ColumnLayout, WordleLayout, MeasureBasedColoring, NumberUtils, Repository, tooltipDataHandler, Objects, boundUtil) {
  var tagCloud = function(manifest, ctx) {
    var width = 400, height = 200, wrap = null, chartData = {}, tagArr = [], maxfont = 48, minfont = 12, fontColorScale, selectionList = [], effectManager = ctx.effectManager;
    var randomSuffix = Repository.newId();
    var minFontFamily = Number.MAX_VALUE, maxFontFamily = Number.MIN_VALUE, hasNullValue = false, tooltipVisible = true, isDatasetChanged = false;
    var tagStyle = {
      'fontfamily' : "'Open Sans', Arial, Helvetica, sans-serif",
      'color' : '#555555'
    };
    var options, opacity = 1, defaultString = langManager.get('IDS_ISNOVALUE');
    var eDispatch = new dispatch('initialized', 'showTooltip', 'hideTooltip'); //, 'showTooltip', 'hideTooltip'
      
    var decorativeShape = null;
    
    var chart = function(selection) {
      selection.each(function() {
        boundUtil.drawBound(selection, width, height);
        
        _calculateTagPosition();
        
        if(decorativeShape === null){
          decorativeShape = selection.append('rect').attr('fill', 'rgba(133,133,133, 0.2)').style('visibility', 'hidden');
        }else{
          decorativeShape.attr('width', 0).attr('height', 0).attr('x', 0).attr('y', 0).style('visibility', 'hidden');
        }
        
        //filter hidden data
        var labelsData = _filterData();
        
        wrap = d3.select(this);

        //remove old data item while updateing dataset
        if(isDatasetChanged && !wrap.selectAll('g.word').empty()){
          isDatasetChanged = false;
          wrap.selectAll('g.word').remove();
        }
        
        wrap.attr('style', 'cursor:default');//.on('click', clickHandler).on('mouseover', mouseOverHandler).on('mouseout', mouseOutHandler);
        var wordsWrap = wrap.selectAll('g.word').data(labelsData, function(d, i){
          return (d.word ? d.word.val : "") + " " + (d.wordFontFamily ? d.wordFontFamily.val : "") + " " + (d.wordSize ? d.wordSize.val : "");
        });
        
        wordsWrap.selectAll('text').data(function(d, i){
          return d;
        }).text(function(d, i){ 
          return d.word.val;
        });
        
        var wordsWrapEnter = wordsWrap.enter().append('g').attr('class', 'word').append('text').text(function(d, i){ 
            return d.word.val;
          })
          .attr('id', function(d, i){
            return 'TAG_ID_' + i + randomSuffix;
          })
          .attr('class', 'datapoint')
          .attr('visibility', function(d, i){
            var isVisible = 'visible';
            if(NumberUtils.isNoValue(d.fontSize) || d.x === undefined || d.y === undefined){
              isVisible = 'hidden';
            }
            return isVisible;
          })  
          .attr('font-size', function(d, i){
            return d.fontSize;
          }).attr('font-family', tagStyle.fontfamily);
//        wordsWrap.exit().remove();
        
//        wordsWrap.transition().attr('dx', function(d, i){
//            return d.x;
//          }).attr('dy', function(d, i){
//            return d.y;
//          }).duration(800).delay(100);
        
//        wordsWrap.append('line').attr('stroke', 'red').attr('x1', function(d, i){
//              return d.x + d.x0;
//            }).attr('y1', function(d, i){
//              return d.y;
//            }).attr('x2', function(d, i){
//              return d.x + d.x1;
//            }).attr('y2', function(d, i){
//              return d.y;
//            }).attr('fill', 'none');
        wordsWrap.exit().attr('transform', 'translate(-1000, -1000)');
        wordsWrap.selectAll('.datapoint').attr("fill",function(d, i){
          var color;
          if(fontColorScale && d.wordFontFamily !== null && d.wordFontFamily.val !== null){
            var j, len, domain = fontColorScale.domain();
            for(j = 0, len = domain.length - 1; j < len; j++){
              if(d.wordFontFamily.val!==null && (domain[j][1] > d.wordFontFamily.val)){
                break;
              }
            }
            color = fontColorScale(domain[j]);
          }else{
            color = tagStyle.color;
          }  
          var parameter = {
            fillColor:color,
            drawingEffect:"normal"
          };
          return effectManager.register(parameter);
        }).attr('text-anchor', function(){
          if(options.layout === 'Wordle'){
            return 'middle';
          }else{
            return 'start';
          }
        });
        wordsWrap.selectAll('text').attr('fill-opacity', opacity);
        
        if(options.animation.dataLoading){
          wordsWrap.transition().attr('transform', function(d, i){
            var translate = '';
            if(d.x !== undefined && d.y !== undefined && d.y < height && d.x < width){
              translate = 'translate('+[d.x, d.y]+')';
            }else{
              translate = 'translate(-1000, -1000)';
            }
            if(d.rotate){
              translate = translate + " rotate(" + d.rotate + ")";
            }
            return translate;
          }).duration(800).delay(100).each('end', function(d, i){
            var translate = '';
            if(d.x !== undefined && d.y !== undefined && d.y < height && d.x < width){
              translate = 'translate('+[d.x, d.y]+')';
            }else{
              translate = 'translate(-1000, -1000)';
            }
            if(d.rotate){
              translate = translate + " rotate(" + d.rotate + ")";
            }
            this.setAttribute('transform', translate);
            
            if(i === labelsData.length-1){
              eDispatch.initialized();
            }
          });
        }else{
          wordsWrap.attr('transform', function(d, i){
            var translate = '';
            if(d.x !== undefined && d.y !== undefined){
              translate = 'translate('+[d.x, d.y]+')';
            }else{
              translate = 'translate(-1000, -1000)';
            }
            if(d.rotate){
              translate = translate + " rotate(" + d.rotate + ")";
            }
            return translate;
          });
          eDispatch.initialized(); 
        }
      });
    };
      
      /**
      * set/get width
      */
      chart.width = function(_){
          if (!arguments.length){
            return width;
          }
          width = _;
          return chart;
      };

      /**
      * set/get height
      */
      chart.height = function(_){
        if (!arguments.length){
          return height;
         }
        height = _;
         return chart;        
      };

      /**
      * set/get data, for some modules like Title, it doesn't need data
      */
      chart.data = function(_){
        if (!arguments.length){
          return chartData;
         }
        var data = {};
        data.words = _.getAnalysisAxisDataByIdx(0).values[0];

        var wordsData = _.getMeasureValuesGroupDataByIdx(0);
        if(wordsData && _.getMeasureValuesGroupDataByIdx(0).values.length > 0){
          data.wordsSize = _.getMeasureValuesGroupDataByIdx(0).values[0];
        }else{
          data.wordsSize = undefined;
        }
        
        var wordsFontFamilySata = _.getMeasureValuesGroupDataByIdx(1);
        if(wordsFontFamilySata && wordsFontFamilySata.values.length > 0){
          data.wordsFontFamily = _.getMeasureValuesGroupDataByIdx(1).values[0];
        }else{
          data.wordsFontFamily = undefined;
          fontColorScale = undefined;
        }
        _parseData(data);
        
        //Check dataset is changed.
        isDatasetChanged = _isDatasetChanged(data);
        chartData = data;
         return chart;        
      };

      /**
      * set/get properties
      */
      chart.properties = function(props){
        if (!arguments.length){
          return options;
         }
         Objects.extend(true, options, props);
         tooltipVisible = options.tooltip.enabled;
      if (fontColorScale) {
        _calculateFontFamily(minFontFamily, maxFontFamily, hasNullValue);
      }
         return chart;
      };
      
      /**
     * get/set your event dispatch if you support event
     */
      chart.dispatch = function(_){
        if(!arguments.length){
          return eDispatch;
        }
        eDispatch = _;
        return chart;
      };
      
      
      /*
       * Font color scale.
       */
      chart.mbcLegendInfo = function(){
        var title = chartData.wordsFontFamily ? chartData.wordsFontFamily.col : '';
        return {
          'colorScale' : fontColorScale,
          'title' : title
        };
      };
      
      /*
       * Add mouse interaction functions.
       */
      chart.parent = function(){
        return wrap;
      };
      
      chart.highlight = function(elems){
        if(elems instanceof Array){
          for(var i = 0, len = elems.length; i < len; i++){
            elems[i].setAttribute('fill-opacity', 1);
//            opacity = 0.2;
          }
        }else{
          elems.setAttribute('fill-opacity', 1);
//          opacity = 0.2;
        }
      };
      
      chart.unhighlight = function(elems){
        if(elems instanceof Array){
          for(var i = 0, len = elems.length; i < len; i++){
            elems[i].setAttribute('fill-opacity', 0.2);
          }
        }else{
          elems.setAttribute('fill-opacity', 0.2);
        }
      };
      
      chart.clear = function(gray){
        if( gray === undefined){
          wrap.selectAll('.datapoint').attr('fill-opacity', 1);
          opacity = 1;
        }else{
          wrap.selectAll('.datapoint').attr('fill-opacity', 0.2);
        }
      };
      
      chart.mouseover = function(point){
        var item = d3.select(d3.event.target);
        var clickedItemID = item.attr('id');
        if(clickedItemID && tooltipVisible){
          var tooltipData = generateTooltipData(item.datum());
          var transform = wrap.node().getTransformToElement(wrap.node().ownerSVGElement);
          var svgRect = wrap.node().ownerSVGElement.getBoundingClientRect();
          var itemRect = item.node().getBoundingClientRect(), wrapRect = wrap.node().getBoundingClientRect();
          
          decorativeShape.attr('width', itemRect.width).attr('height', itemRect.height).attr('x', itemRect.left - wrapRect.left).attr('y', itemRect.top - wrapRect.top).style('visibility', 'visible');
          tooltipData.point = {
            x: itemRect.left - svgRect.left + itemRect.width/2,
            y: itemRect.top - svgRect.top
          };
          
          tooltipData.plotArea = {
            x : transform.e,
          y : transform.f,
          width : width,
          height : height
          };
          
          eDispatch.showTooltip(tooltipDataHandler.formatTooltipData(tooltipData));
        }
      };
      
      chart.mouseout = function(){
        decorativeShape.attr('width', 0).attr('height', 0).attr('x', 0).attr('y', 0).style('visibility', 'hidden');
        if(tooltipVisible){
          eDispatch.hideTooltip();
        }
      };
      
      /**
       * interfaces for MBC legend selection
       * @param {Object} selectedData 
       * <pre>
       * {
       * ctx: {
       *   ranges: {
       *    endValue:100
       *    isLeftOpen:false
       *    isRightOpen:true
       *    startValue:84
       *   }
       * },
       * val: 84   
       * }
       * @returns {Array} d3 selections in the given range  
       */
      chart.getDatapointsByRange = function(selectedData){
        var datapoints = d3.selectAll('.datapoint')[0], ctxDatapoints = [], ranges = selectedData.ctx.ranges, data;
        for(var i = 0, len = datapoints.length; i < len; i++){
          data = datapoints[i].__data__.wordFontFamily.val;
          if (NumberUtils.isNoValue(selectedData.val)) {
          if (NumberUtils.isNoValue(data)) {
            ctxDatapoints.push(datapoints[i]);
          }
        } else {
          if (data < ranges.endValue && data > ranges.startValue) {
            ctxDatapoints.push(datapoints[i]);
          } else {
            if (!ranges.isLeftOpen && data === ranges.startValue) {
              ctxDatapoints.push(datapoints[i]);
            } else if (!ranges.isRightOpen && data === ranges.endValue) {
              ctxDatapoints.push(datapoints[i]);
            }
          }
        }
        }
        return ctxDatapoints;
      };
    
    var _isDatasetChanged = function(newData){
      var oldData = chartData, isDatasetChanged = false;
      if(oldData.words && newData.words){
        if(oldData.words.rows.length !== newData.words.rows.length){
          isDatasetChanged = true;
        }else if((oldData.wordsFontFamily && !newData.wordsFontFamily) || (!oldData.wordsFontFamily && newData.wordsFontFamily)){
          isDatasetChanged = true;
        }else{
          var oldWords = oldData.words.rows, newWords = newData.words.rows;
          for(var i = 0, iLen = oldWords.length; i < iLen; i++){
            if(oldWords[i].val !== newWords[i].val){
              isDatasetChanged = true;
              break;
            }
          }
        }
      }
      return isDatasetChanged;
    };
      
    var _filterData = function(){
      var labelsData = [], item;
      for(var i = 0, len = tagArr.length; i < len; i++){
        item = tagArr[i];
        if(!(NumberUtils.isNoValue(item.fontSize) || item.x === undefined || item.y === undefined || item.y > height || item.x > width)){
          //Hide this tag, remove it.
          labelsData.push(item);
        }
      }
      return labelsData;
    };
    
      var generateTooltipData = function(data){
        var tooltipData = {
            body: [],
            footer: []
        };
        
        if(chartData.wordsSize){
          tooltipData.body.push({
            name: chartData.wordsSize.col,
            val:[{
              value: data.wordSize
            }]
          });
        }
        
        if(chartData.wordsFontFamily){
          tooltipData.body.push({
            name:chartData.wordsFontFamily.col,
            val:[{
              value: data.wordFontFamily
            }]
          });
        }
        
        if(chartData.words){
          tooltipData.footer.push({
            label: chartData.words.col,
            value: data.word
          });
        }
        
        return tooltipData;
      };
        
      var _parseData = function(data){
      tagArr = [];
      var minFontSize, maxFontSize, fontfamilyValue, tagItem;
      minFontFamily = undefined, maxFontFamily = undefined, hasNullValue = false;
      
      for(var i=0, len = data.words.rows.length; i < len; i++){
        if(data.words && data.words.rows[i].val && data.wordsSize && data.wordsSize.rows[0][i] && !NumberUtils.isNoValue(data.wordsSize.rows[0][i].val)){
          tagItem = {};
          tagItem.word = data.words.rows[i];
          tagItem.wordSize = (data.wordsSize ? data.wordsSize.rows[0][i] : undefined);
          tagItem.wordFontFamily = (data.wordsFontFamily ? data.wordsFontFamily.rows[0][i] : undefined);
          
          //For selection event data.
          tagItem.val = [data.words.rows[i].val];
          tagItem.ctx = [data.words.rows[i].ctx];
        
          if(tagItem.wordSize){
            tagItem.val.push(data.wordsSize.rows[0][i].val);
            tagItem.ctx.push(data.wordsSize.rows[0][i].ctx);
            
            if(tagItem.wordSize.val !== null){
              if(minFontSize === undefined || tagItem.wordSize.val < minFontSize){
                minFontSize = tagItem.wordSize.val; 
              }
              if(maxFontSize === undefined || tagItem.wordSize.val > maxFontSize){
                maxFontSize = tagItem.wordSize.val; 
              }
            }
          }
          
          if(tagItem.wordFontFamily){
            tagItem.val.push(tagItem.wordFontFamily.val);
            tagItem.ctx.push(tagItem.wordFontFamily.ctx);
            
            fontfamilyValue = tagItem.wordFontFamily.val;
            
            if(fontfamilyValue === null){
              hasNullValue = true;
            }else{
              if(minFontFamily === undefined || fontfamilyValue < minFontFamily){
                minFontFamily = tagItem.wordFontFamily.val; 
              }
              if(maxFontFamily === undefined || fontfamilyValue > maxFontFamily){
                maxFontFamily = tagItem.wordFontFamily.val; 
              }
            }
          }
          tagArr.push(tagItem);
        }
      }
      
      //Linear font weight scale. Add more scale type here.
      _calculateFontSize(minFontSize, maxFontSize);
      if(data.wordsFontFamily){
        _calculateFontFamily(minFontFamily, maxFontFamily, hasNullValue);
      }else{
        fontColorScale = undefined;
      }
    };
    
    /*
     * Calculate font size by font-weight
     */
    var _calculateFontSize = function(min, max){
      //Generate font size arguments
      var count = tagArr.length;
      var a, b, fsize;
      
      if (min === 0){
              min = 1;
              max += 1;
          }
      
      if (count > 1) {
        b = (maxfont - (minfont * (max / min))) / (1 - (max / min));
        a = (minfont - b) / min;
      } else {
        b = 0;
        a = maxfont / (min < 0 ? -min : min);
      }
      
      for(var i=0, len = tagArr.length; i < len; i++){
        //Set Font Size
        if(tagArr[i].wordSize && min !== max){
          fsize = Math.round(a * tagArr[i].wordSize.val + b);
        }else{
          fsize = minfont;
        }
        tagArr[i].fontSize = (tagArr[i].wordSize.val === null) ? null : fsize;
      }
    };
    
    /*
     * Calculate font color family.
     */
    var _calculateFontFamily = function(minVal, maxVal, hasNullValue){
      if(minVal === undefined && maxVal === undefined){
        fontColorScale = d3.scale.ordinal().domain([[]]).range([tagStyle.color]);
      }else{
        fontColorScale = MeasureBasedColoring.getScale(minVal, maxVal, 5, options.startColor, options.endColor);
        
        if(hasNullValue){
          var domains = fontColorScale.domain();
          var ranges = fontColorScale.range();
          domains.push([]);
          ranges.push(tagStyle.color);
        }
      }
    };
    
    var _calculateTagPosition = function(){
      var layout;
      if(options.layout === 'Column'){
        layout = ColumnLayout();
      } else if(options.layout === 'Row'){
        layout = RowLayout();
      } else if(options.layout === 'Wordle'){
        layout = WordleLayout();
      }
      
      if(layout !== undefined){
        //TODO remove me
        var start = (new Date()).valueOf();
        layout.width(width).height(height).data(tagArr).font(tagStyle.fontfamily).layout();
        var end = (new Date()).valueOf();
        //console.log(options.layout, start, end, end-start);
      }
    };
    
    var _handleNullValue = function(value){
      return (value === null || value === undefined) ? defaultString : value;
    };
    
    options = manifest.props(null);
      return chart;
  };
  return tagCloud;
});