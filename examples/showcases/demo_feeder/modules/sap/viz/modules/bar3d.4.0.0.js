sap.riv.module(
{
  qname : 'sap.viz.modules.bar3d',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.modules.util.MNDHandler',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Scaler',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.threeD.cube',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.threeD.matrix',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.dispatch',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.tooltip',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.tooltipDataHandler',
  version : '4.0.0'
}
],
function Setup(MNDHandler, Scaler, Objects, cube, matrix, langManager, ObjectUtils, dispatch, TypeUtils, tooltip, tooltipDataHandler) {

  var barPaddingRatio = 0.5;

  return function(manifest) {
    var width = 0, height = 0, data, properties = manifest.props(null), m = matrix();
    var datas, d = dispatch('initialized', 'showTooltip', 'hideTooltip', 'valueScaleChange', 'primaryCategoryScaleChange', 'secondaryCategoryScaleChange');
    var parent = null;
    var lastHovered = null;
    
    var secondaryCategoryData = {
        'sap.viz.modules.column3d.dimension':{
          key: 'sap.viz.modules.column3d.dimension',
          values : [{
            col: {val:''},
            rows: []
          }]
        }
    };
    
    var primaryCategoryData = {
        'sap.viz.modules.column3d.dimension':{
          key: 'sap.viz.modules.column3d.dimension',
          values : [{
            col: {val:''},
            rows: []
          }]
        }
    };
    
    var primaryCategoryScale = d3.scale.ordinal(), secondaryCategoryScale = d3.scale
        .ordinal(), valueScale = d3.scale.linear();

    var cubeBuilder = cube();

    var colorPalette = d3.scale.ordinal();

    function chart(selection) {

      parent = selection;
      
      var styles = selection.selectAll("style").data(
          [ ".normal rect{stroke:#FFF; opacity:1} .selected rect{stroke:#000; opacity:1} .deselected rect{stroke:#FFF; opacity:0.4}" ]);
      styles.exit().remove();
      styles.enter().append("style");
      styles.text(String);

      colorPalette.range(properties.colorPalette);

      var primaryCategoryRangeBand = primaryCategoryScale.rangeBand();
      var secondaryCategoryRangeBand = secondaryCategoryScale.rangeBand();

      var vertical = isVertical();

      var barCategorySize = primaryCategoryRangeBand /
          (1 + 2 * barPaddingRatio);
      var barDepth = barCategorySize;
      var barCategoryPadding = barCategorySize * barPaddingRatio;
      var barValueSize = vertical ? function(d) {
        return height - valueScale(d.data.val);
      } : function(d) {
        return valueScale(d.data.val);
      };

      cubeBuilder.width(vertical ? barCategorySize : barValueSize).height(
          vertical ? barValueSize : barCategorySize).depth(barDepth).matrix(
          function(d) {
            var primaryCategoryOffset = d.aa1 * primaryCategoryRangeBand +
                barCategoryPadding;

            var x = vertical ? primaryCategoryOffset : 0;
            var y = vertical ? valueScale(d.data.val) : height -
                primaryCategoryOffset;
            var z = d.aa2 * secondaryCategoryRangeBand + barCategoryPadding;
            return matrix().translate(x, y, z).transform(m);
          }).color(function(d) {
        return colorPalette(d.aa2);
      });

      var mainShapesGroup = selection.select('g.mainshapesgroup');
      if(!TypeUtils.isExist(mainShapesGroup[0][0])){
        mainShapesGroup = selection.append('g').attr('class', 'mainshapesgroup');
      }
      
      var dataShapes = mainShapesGroup.selectAll("g.datashape").data(datas);
      
      dataShapes.exit().remove();
      dataShapes.enter().append("g").attr("class", "datashape");

      cubeBuilder(dataShapes);

      d.initialized();
     
    }
    chart.afterUIComponentAppear = function(){
      d.initialized(); 
    };
    
    chart.width = function(value) {
      if (!arguments.length) {
        return width;
      }

      width = value;

      if (isVertical()) {
        updatePrimaryCategoryScaleRange();
        updateSecondaryCategoryScaleRange();
      } else {
        updateValueScaleRange();
      }

      return chart;
    };

    chart.height = function(value) {
      if (!arguments.length) {
        return height;
      }

      height = value;

      if (isVertical()) {
        updateValueScaleRange();
      } else {
        updatePrimaryCategoryScaleRange();
        updateSecondaryCategoryScaleRange();
      }

      return chart;
    };

    chart.primaryCategoryScale = function(scale) {
      if (!arguments.length) {
        return primaryCategoryScale;
      }
      primaryCategoryScale = scale;
      return chart;
    };

    chart.secondaryCategoryScale = function(scale) {
      if (!arguments.length) {
        return secondaryCategoryScale;
      }
      secondaryCategoryScale = scale;
      return chart;
    };

    chart.valueScale = function(scale) {
      if (!arguments.length) {
        return valueScale;
      }
      valueScale = scale;
      return chart;
    };

    chart.data = function(value) {
      if (!arguments.length) {
        return data;
      }
      data = value;

      var mndData = MNDHandler(data);
      
      generateSecondCategoryData(mndData, data);
      
      var parsedData = mndData.MG1;

      var i;

      var primaryCategoryLength = parsedData[0].length;
      var primaryCategoryDomain = new Array(primaryCategoryLength);
      for (i = 0; i < primaryCategoryLength; i++) {
        primaryCategoryDomain[i] = i;
      }
      primaryCategoryScale.domain(primaryCategoryDomain);

      var secondaryCategoryLength = parsedData.length;
      var secondaryCategoryDomain = new Array(secondaryCategoryLength);
      for (i = 0; i < secondaryCategoryLength; i++) {
        secondaryCategoryDomain[i] = i;
      }
      secondaryCategoryScale.domain(secondaryCategoryDomain);

      updateSecondaryCategoryScaleRange();

      datas = [];
      for ( var i = 0, len1 = parsedData.length; i < len1; i++) {
        var groupData = parsedData[i];
        for ( var j = 0, len2 = groupData.length; j < len2; j++) {
          datas.push({
            data : groupData[j],
            aa2 : i,
            aa1 : j
          });
        }
      }

      var extent = d3.extent(datas, function(o) {
        return o.data.val;
      });
      var min = extent[0], max = extent[1];
      var bottom = min >= 0 ? 0 : min;
      var top = max <= 0 ? 0 : max;
      if (bottom === 0 && top === 0) {
        top = 100;
      }

      valueScale.domain([ bottom, top ]);
      Scaler.perfect(valueScale);
      return chart;
    };

    /**
     * set/get properties
     */
    chart.properties = function(props) {
      if (!arguments.length) {
        return properties;
      }
      Objects.extend(true, properties, props);

      updatePrimaryCategoryScaleRange();
      updateSecondaryCategoryScaleRange();
      updateValueScaleRange();

      return chart;
    };

    chart.colorPalette = function(_) {
      if (!arguments.length) {
        return properties.colorPalette;
      }
      properties.colorPalette = _;
      return this;
    };

    chart.matrix = function(_) {
      if (!arguments.length) {
        return m;
      }
      m = _;
      return this;
    };

    chart.secondaryCategoryData = function(_){
      if(!arguments.length){
        return secondaryCategoryData;
      }
      secondaryCategoryData = _;
      return this;
    };

    chart.primaryCategoryData = function(_){
      if(!arguments.length) {
        return primaryCategoryData;
      }
      primaryCategoryData = _;
      return chart;
    };
    
    chart.dispatch = function(_){
      if(!arguments.length){
        return d;
      }
      d = _;
      return chart;
    };
    
    chart.parent = function(){
      if( !arguments.length ){
        return parent;
      }
      parent = _;
      return chart;
    };
    
    chart.highlight = function(_){
      if (_ instanceof Array) {
        for ( var i = 0; i < _.length; i++) {
          // _[i].setAttribute('opacity', 1);
          var classname = _[i].getAttribute('class');
          classname = classname.replace('normal', 'selected');
          classname = classname.replace('deselected', 'selected');
          _[i].setAttribute('class', classname);
        }
      } else {
        // _.setAttribute('opacity', 1);
        var classname = _.getAttribute('class');
        classname = classname.replace('normal', 'selected');
        classname = classname.replace('deselected', 'selected');
        _.setAttribute('class', classname);
      }
    };
    
    chart.unhighlight = function(_){
      if (_ instanceof Array) {
        for ( var i = 0; i < _.length; i++) {
          // _[i].setAttribute('opacity', 0.4);
          var classname = _[i].getAttribute('class');
          classname = classname.replace('selected', 'deselected');
          classname = classname.replace('nomral', 'deselected');
          _[i].setAttribute('class', classname);
        }
      } else {
        var classname = _.getAttribute('class');
        classname = classname.replace('selected', 'deselected');
        classname = classname.replace('nomral', 'deselected');
        _.setAttribute('class', classname);
      }
    };
    
    chart.clear = function(gray){
      if (gray == null) {
        parent.selectAll('.datapoint').each(function(d) {
          var classname = this.getAttribute('class');
          if (classname.indexOf('deselected') != -1) {
            classname = classname.replace('deselected', 'normal');
          } else {
            classname = classname.replace('selected', 'normal');
          }
          this.setAttribute('class', classname);
        });
      } else {
        parent.selectAll('.datapoint').each(function(d) {
          var classname = this.getAttribute('class');
          classname = classname.replace('selected', 'deselected');
          classname = classname.replace('normal', 'deselected');
          this.setAttribute('class', classname);
        });
      }
    };
    
    chart.mouseover = function(node) {
      if (lastHovered === node) {
        return;
      }

      var tooltipData = {
        body : [],
        footer : []
      };

      var nd = node.__data__.data, body = tooltipData.body, footer = tooltipData.footer;
      var path = nd.data.ctx.path;

      body.push({
        name : data.getMeasureValuesGroupDataByIdx(0).values[path.mi].col,
        val : [ {
          value : nd.data.val,
          color : node.__data__.c,
          shape : 'squareWithRadius'
        } ]
      });

      var a0data = data.getAnalysisAxisDataByIdx(0), aa1 = path.dii_a1;
      if (a0data) {
        for ( var i = 0, len = a0data.values.length; i < len; i++) {
          footer.push({
            'label' : a0data.values[i].col.val,
            'value' : a0data.values[i].rows[aa1].val,
          });
        }
      }

      var a1data = data.getAnalysisAxisDataByIdx(1), aa2 = path.dii_a2;
      if (a1data) {
        for ( var i = 0, len = a1data.values.length; i < len; i++) {
          if (a1data.values[i].type === 'MND') {
            continue;
          }
          footer.push({
            'label' : a1data.values[i].col.val,
            'value' : a1data.values[i].rows[aa2].val,
          });
        }
      }
      var transform = parent.node().getTransformToElement(
          parent.node().ownerSVGElement);

      var rtp = node.__data__.rtp;
      tooltipData.point = {
        x : rtp.x + transform.e,
        y : rtp.y + transform.f
      };

      tooltipData.plotArea = {
        x : transform.e,
        y : transform.f,
        width : width,
        height : height
      };

      lastHovered = node;
      d.showTooltip(tooltipDataHandler.formatTooltipData(tooltipData));

    };

    chart.mouseout = function(target) {
      lastHovered = null;
      d.hideTooltip();
    };
    
    function isVertical() {
      return properties.direction === "vertical";
    }

    function updatePrimaryCategoryScaleRange() {
      primaryCategoryScale.rangeBands(isVertical() ? [ 0, width ]
          : [ height, 0 ]);
      d.primaryCategoryScaleChange(primaryCategoryScale,isVertical() ? [ 0, width ]
      : [ height, 0 ]);
    }

    function updateSecondaryCategoryScaleRange() {
      secondaryCategoryScale.rangeBands([
          0,
          primaryCategoryScale.rangeBand() *
              secondaryCategoryScale.domain().length ]);
      d.secondaryCategoryScaleChange(secondaryCategoryScale, [0, primaryCategoryScale.rangeBand() * 
          secondaryCategoryScale.domain().length ]);
    }

    function updateValueScaleRange() {
      valueScale.range(isVertical() ? [ height, 0 ] : [ 0, width ]);
      d.valueScaleChange(valueScale,  isVertical() ? [ height, 0 ] : [ 0, width ]);
    }
    
    var handleNull = function(_){
      var defaultString = langManager.get('IDS_ISNOVALUE');
      if (_ === null || _ === undefined){
        return defaultString;
      }
      else{ 
        return _;
      }
    };
    
    var handleNullInArray = function(array){
      for (var i = 0; i < array.length; ++i){
        array[i].val = handleNull(array[i].val);
      }
      return array;
    };
    
    var _setPathByaa = function(path){
      var pathObj = {};
      switch(path.aa){
        case 0:
          pathObj.dii_a1 = path.dii;
          break;
        case 1:
          pathObj.dii_a2 = path.dii;
          break;
        case 2:
          pathObj.dii_a3 = path.dii;
          break;
      }
      return pathObj;
    };
    
    var _parseColorLegendFeeds = function(colorFeeds, shapeFeeds){
      var title, labels = [], colorFeedLength, shapeFeedLength;
      var colorData = _parseLegendFeed(title, colorFeeds, colorFeedLength);
      colorFeedLength = colorData.feedsLength;
      var shapeData = _parseLegendFeed(title, shapeFeeds, shapeFeedLength);
      shapeFeedLength = shapeData.feedsLength;
      
      secondaryCategoryData['sap.viz.modules.column3d.dimension'].values[0].rows = shapeData.labels;
      primaryCategoryData['sap.viz.modules.column3d.dimension'].values[0].rows = colorData.labels

    };
    
    var getCartesian = function(arrays, symbol) {
      var result = arrays[0];
      var fff = function(arr) {
        var ar = result;
        result = [];
        for(var i = 0; i < ar.length; i++) {
          for(var j = 0; j < arr.length; j++) {
            var t1 = (ar[i].val === undefined) ? ar[i].val : ar[i].val, t2 = (arr[j].val === undefined) ? arr[j].val : arr[j].val;
            var ctx = {
              path : {}
            };
            ObjectUtils.extend(ctx.path, ar[i].ctx.path, arr[j].ctx.path);
            result.push({
              'val': t1 + symbol + t2, 
              'ctx': ctx
            });
          }
        }
      };
      for(var i = 1; i < arrays.length; i++) {
        fff(arrays[i]);
      }

      return result;
    };
    
    var _parseLegendFeed = function(title, feeds, feedsLength){
      var labels = [], rows = [], dimensionTag = ' / ', measureTag = ' - ';
      var MNDIndex, hasOnlyMND = false, i, j, len;
      //Handle colors feeds
      if(feeds && feeds.length > 0){
        for(i = 0, len = feeds.length; i < len; i++) {
          if(feeds[i].type !== 'MND') {
            if(title === undefined) {
              title = handleNull(feeds[i].col.val);
            } else {
              title = title + dimensionTag + handleNull(feeds[i].col.val);
            }
            
            rows = feeds[i].rows;
            for(j = 0; j < rows.length; j++) {
              if(labels[j] === undefined) {
                labels[j] = {};
                labels[j].val = handleNull(rows[j].val);
                labels[j].ctx = {
                  path : _setPathByaa(rows[j].ctx.path)
                };
              } else {
                labels[j].val = labels[j].val + dimensionTag + handleNull(rows[j].val);
              }
            }
          } else {
            MNDIndex = i;
          }
        }
        feedsLength = labels.length;
      }
      
      //Handle Colors with MND
      if(MNDIndex !== undefined) {
        //Save color feed with MND status.
        if(labels.length > 0){
          if(feeds[MNDIndex].rows.length > 1){
            if(MNDIndex === 0) {
              title = langManager.get('IDS_DEFAULTMND') + measureTag + title; 
              //MND is the first feed type. Legend label should be 'MND - A/B/C'
              labels = getCartesian([handleNullInArray(feeds[MNDIndex].rows), labels], measureTag);
              feedsLength = feedsLength * feeds[MNDIndex].rows.length;
            } else if(MNDIndex === feeds.length - 1) {
              title = title + measureTag + langManager.get('IDS_DEFAULTMND');
              //MND is the last feed type. Legend label should be 'A/B/C - MND'
              labels = getCartesian([labels, handleNullInArray(feeds[MNDIndex].rows)], measureTag);
              feedsLength = feedsLength * feeds[MNDIndex].rows.length;
            } 
          }
        }else{
          title = langManager.get('IDS_DEFAULTMND');
          rows = feeds[MNDIndex].rows;
          for(j = 0; j < rows.length; j++) {
            rows[j].val = handleNull(rows[j].val);
            labels.push(rows[j]);
          }
          feedsLength = rows.length;
          if(rows.length === 1){
            hasOnlyMND = true;
          }
        }
      }
      
      return {
        'title' : title,
        'labels' : labels,
        'feedsLength' : feedsLength,
        'MNDInfo' : {
          'MNDIndex' : MNDIndex,
          'hasOnlyMND': hasOnlyMND //Only has MND, no cartesian
        }
      };
    };

    function generateSecondCategoryData(){
      var colorFeeds = null, shapeFeeds = null;;
      var aa = data.getAnalysisAxisDataByIdx(0);
      if(aa){ 
        colorFeeds = aa.values;
      }
     
      aa = data.getAnalysisAxisDataByIdx(1);
      if(aa){
        shapeFeeds = aa.values;
      }
     
      _parseColorLegendFeeds(colorFeeds, shapeFeeds);
    };
    
    return chart;
  };
});