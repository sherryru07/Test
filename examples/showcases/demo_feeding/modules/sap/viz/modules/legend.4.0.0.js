sap.riv.module(
{
  qname : 'sap.viz.modules.legend',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.manifest',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.TextUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.dispatch',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.legend.colorLegendArea',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.legend.sizeLegendArea',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.legend.mbcLegendArea',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.BoundUtil',
  version : '4.0.0'
}
],
function Setup(Manifest, TextRuler, TypeUtils, dispatch, ObjectUtils, ColorLegendArea, SizeLegendArea, MBCLegendArea, langManager,Objects, BoundUtil) {
  var legend = function(manifest, ctx) {
    var width, height, preferenceSize = {width: 200, height: 200}, position = 'right', titleFont = {
      'fontfamily' : "'Open Sans', Arial, Helvetica, sans-serif",
      'fontsize' : '14px',
      'fontweight' : 'bold',
      'color' : '#333333'
    }, valueLabelFont = {
      'fontfamily' : "'Open Sans', Arial, Helvetica, sans-serif",
      'fontsize' : '12px',
      'fontweight' : 'normal',
      'color' : '#333333'
    },options = {}, isVisible = true, isHidden = false, shapes = [], colors = [], textHeight = 20, 
    margin = {
      top : 0,
      right : 0,
      bottom : 0,
      left : 1.15
    }, titleMarginBottom = 0.5, legendAreaPos = {x:0, y:0}, sizeScale, sizeBubbleScale, sizeBubbleSpace, sizeBubbleHasHeightFeed, colorScale, hideTitle = false;
    
    //Each row's position [{x: 10, y: 10}, {...}...]
    var chartData = {title:'', labels:''}, bubleSizeData = [], data = null, shapeFeeds = [], colorFeeds = [], colorFeedLength = 0, shapeFeedLength = 0, relayout = true;
    var legendArea = ColorLegendArea(ctx);
    var eDispatch = new dispatch('highlightedByLegend');
    var effectManager = ctx.effectManager;
    var properties;
    var isHierarchicalChanged = false;
    var chart = function(selection) {
      BoundUtil.drawBound(selection, width, height);
      selection.each(function() {
        if(isColorLegend() || isBubbleColorLegend()){
          if(chartData.labels.length === 0){
            isVisible = false;
          }
        }
        
        if(isVisible && !isHidden){
          getThemeStyleDef();
          
          if(relayout){
            _calculateRowPosition({'width': width, 'height' : height});
          }

          var xPos = margin.left * textHeight, yPos = margin.top * textHeight;
          
          var wrap = d3.select(this).selectAll('g.legend-content').data([chartData]);
          wrap.enter().append('g').attr('class', 'legend-content');//.attr('clip-path', 'url(#legend-edge-clip)');
          if (isHierarchicalChanged){
            isHierarchicalChanged = false;
            wrap.selectAll('.legend .row').remove();
          }
          //Legend Title
          if(options.isShowTitle && !hideTitle) {
            var titleTextHeight = parseInt(titleFont.fontsize, 10);
            var titleStyle = 'font-weight: ' + titleFont.fontweight +'; fill:' + titleFont.color + '; font-family: ' + titleFont.fontfamily + '; font-size: '+titleFont.fontsize+";";
            var titleLabel = (options.titleText===undefined || options.titleText === null) ? chartData.title : options.titleText;
            
            var labelTitleElement = wrap.selectAll('text.legend-labelTitle');
            if(labelTitleElement.empty()){
              labelTitleElement = wrap.append('text').attr('class', 'legend-labelTitle');
            }
            labelTitleElement.text(titleLabel).attr('dx', xPos).attr('dy', yPos + titleTextHeight).attr('style', titleStyle).attr('visibility', 'visible');
            
            //Show ... in title 
            labelTitleElement.each(function(d) {
              TextRuler.ellipsis(titleLabel, this, width-xPos, titleStyle);
            });
          }else{
            wrap.selectAll('text.legend-labelTitle').attr('visibility', 'hidden');
            if (hideTitle) {
                hideTitle = false;
            } 
          }
  
          var labelsData = chartData.labels;
          // Create Legend Groups
          var gEnterCol = wrap.selectAll('g.legend-groups').data([labelsData]);
          gEnterCol.enter().append('g').attr('class', 'legend-groups');
          gEnterCol.attr('transform', 'translate('+legendAreaPos.x+','+legendAreaPos.y+')');
  
          var tmpWidth = ((width===undefined) ? preferenceSize.width : width) - xPos;
          var tmpHeight = ((height===undefined) ? preferenceSize.height : height) - yPos;
          //TODO Need to handle legend in the top/bottom side.
          legendArea.properties(options).width(tmpWidth).height(tmpHeight-legendAreaPos.y).effectManager(effectManager);
          if(isSizeLegend()){
            legendArea.data(bubleSizeData).scale(sizeScale);
          }else if(isMeasureBasedColoringLegend()){
            legendArea.data(labelsData).color(colorScale.range());
          }else{
            legendArea.data(labelsData).color(colors).colorFeedLength(colorFeedLength).shapeFeedLength(shapeFeedLength);
          }
          //Bind click handler in legend labels
          gEnterCol.call(legendArea).on('click', clickHandler).on('touchstart', clickHandler);
          
          //Vertical align to center
          if(options.position === 'left' || options.position === 'right') {
            switch(options.alignment){
              case 'end':
                wrap.attr('transform', 'translate(0, '+(((height-preferenceSize.height) > 0) ? ((height-preferenceSize.height)) : 0)+')');
                break;
              case 'middle':
                wrap.attr('transform', 'translate(0, '+(((height-preferenceSize.height)/2 > 0) ? ((height-preferenceSize.height)/2) : 0)+')');
                break;
            }
          }
        }else{
          //Handle visible is false.
                    var elements = d3.select(this).selectAll('g.legend-content');
                    if (!elements.empty()) {
                        elements.remove();
                    }
//          var clipPathWrap = d3.select(this).select('#legend-edge-clip');
//          if(!clipPathWrap.empty()){
//            clipPathWrap.remove();
//          }
        }
        isHidden = false;
      });
    };

    var clickHandler = function(data){
      if(options.isHierarchy) {
        return;
      }
      
      var className = d3.select(d3.event.target).attr('class');
      //TODO Use class name to check clicked item. Color legend and mbc legend use the same class name.
      if(className){
        var isSelected = legendArea.clickHandler();
        var index = parseInt(d3.select(d3.event.target).attr('class').split('ID_')[1], 10);
        if(chartData.labels[index] !== undefined){
          eDispatch.highlightedByLegend(chartData.labels[index], isSelected);
        }
      }
    };
    
    chart.deselectLegend = function(deselectedData){
      //TODO MBC support legend interaction.
      if(!(isMeasureBasedColoringLegend() || isSizeLegend())){
        legendArea.deselectByCtx(deselectedData);
      }
    };
    
    chart.width = function(_) {
      if(!arguments.length){
        return width;
      }
      width = _;
      relayout = true;
      return chart;
    };

    chart.height = function(_) {
      if(!arguments.length){
        return height;
      }
      height = _;
      relayout = true;
      return chart;
    };

    chart.position = function(_) {
      if(!arguments.length){
        return position;
      }
      position = _;
      return chart;
    };

    chart.colorPalette = function(_) {
      if(!arguments.length){
        return colors;
      }
      colors = _;  
      legendArea.color(_);
      return chart;
    };

    chart.shapes = function(_) {
      if(!arguments.length){
        return shapes;
      }
      shapes = _;
      legendArea.shapes(_);
      return chart;
    };

    chart.properties = function(props) {
      if(!arguments.length){
        return properties;
      }
      //TODO use extends...
      if (properties && props && properties.isHierarchical !== props.isHierarchical){
        isHierarchicalChanged = true;
      }
      Objects.extend(true, properties, props);
      options.visible = properties.visible;
      isVisible = options.visible;
      options.isShowTitle = properties.title.visible;
      options.titleText = properties.title.text;
      options.isHierarchy = properties.isHierarchical;
      options.position = properties.position;
     
      options.formatString = properties.formatString;
      
      if(options.legendType !== properties.type){
        options.legendType = properties.type;
        if(data && chartData.labels){
          parseFeedsData(data);
          legendArea.data(chartData.labels);
        }
      }
      options.alignment = properties.alignment;
      options.drawingEffect = properties.drawingEffect;
      
      if(isSizeLegend()){
        legendArea = SizeLegendArea(ctx);
        
      }else if (isMeasureBasedColoringLegend()){
        legendArea = MBCLegendArea(ctx);
      }
      legendArea.properties(options);
      return chart;
    };

    chart.getPreferredSize = function(wholeSize, layoutSpace, containerInfo) {
      getThemeStyleDef();
      return _calculateRowPosition(wholeSize, layoutSpace, containerInfo);
    };
    
    chart.data = function(_) {
      if(!arguments.length){
        return data;
      }
      data = _;
      parseFeedsData(_);
      legendArea.data(chartData.labels);
      return chart;
    };
    
    chart.sizeLegendInfo = function(_){
      if(!arguments.length){
        return sizeScale;
      }
      //Size scale
      sizeScale = _.scale;
      legendArea.scale(sizeScale);
      
      sizeBubbleScale = _.bubbleScale;
      
      sizeBubbleSpace = _.space;
      
      sizeBubbleHasHeightFeed = _.hasHeightFeed;
      
      //Size data
      if(_.data.length === 0){
        isVisible = false;
      }else{
        isVisible = options.visible;
        bubleSizeData = _.data;
        legendArea.data(bubleSizeData);
      }
      
      //Size legend title
      chartData.title = handleNull(_.title);
      
      return chart;
    };
    
    chart.hideTitle = function() {
        hideTitle = true;
        return chart;
    },
    
    chart.hide = function(_) {
        isHidden = _;
        return chart;
    },
    
    /*
     * Measure based coloring
     */
    chart.mbcLegendInfo = function(_){
      if(!arguments.length){
        return colorScale;
      }
      if(_.colorScale === undefined){
        isVisible = false;
      }else{
        isVisible = options.visible;
        colorScale = _.colorScale;
        //Legend title
        chartData.title = handleNull(_.title);
        _parseMeasureBasedColoringLegend();
        legendArea.data(chartData.labels);
      }
      return chart;
    };
    
    chart.setSelectionMode = function(_){
      if(!(isMeasureBasedColoringLegend() || isSizeLegend())){
        legendArea.setSelectionMode(_);
      }
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
    
      //alex su
      chart.isVisible = function(){
        return isVisible;
      };
      
    var getThemeStyleDef = function(){
      var titleStyle = ctx.styleManager.query('viz-legend-title');
      if(titleStyle){
        if(titleStyle['fill']){
          titleFont.color = titleStyle['fill'];
        }
        if(titleStyle['font-family']){
          titleFont.fontfamily = titleStyle['font-family'];
        }
        if(titleStyle['font-size']){
          titleFont.fontsize = titleStyle['font-size'];
        }
        if(titleStyle['font-weight']){
          titleFont.fontweight = titleStyle['font-weight'];
        }
      }
      
      var valueLabelStyle = ctx.styleManager.query('viz-legend-valueLabel');
      if(valueLabelStyle){
        if(valueLabelStyle['fill']){
          valueLabelFont.color = valueLabelStyle['fill'];
        }
        if(valueLabelStyle['font-family']){
          valueLabelFont.fontfamily = valueLabelStyle['font-family'];
        }
        if(valueLabelStyle['font-size']){
          valueLabelFont.fontsize = valueLabelStyle['font-size'];
        }
        if(valueLabelStyle['font-weight']){
          valueLabelFont.fontweight = valueLabelStyle['font-weight'];
        }
      }
    };
    
    var buildColorShapeFeeds = function(feed){
      if(isColorFeeds(feed.key)) {
        colorFeeds = feed.values;
      } else {
        if(isShapeFeeds(feed.key)) {
          shapeFeeds = feed.values;
        }
      }
    };
    
    var parseFeedsData = function(data) {
      if(!data){
        return;
      }
      colorFeeds = [];
      shapeFeeds = [];
      var aa = data.getAnalysisAxisDataByIdx(0);
      if(aa){ 
        colorFeeds = aa.values;
      }
      
      aa = data.getAnalysisAxisDataByIdx(1);
      if(aa){
        shapeFeeds = aa.values;
      }
      
      if(isBubbleColorLegend()){
        _parseBubbleColorLegendFeeds();
      }else if(!(isSizeLegend())){
        _parseColorLegendFeeds();
      }
    };
    
    var _parseMeasureBasedColoringLegend = function(){
      var labels = [], item = {
        'val' : undefined,
        'ctx' : {}
      };
      var mbcDomains = colorScale.domain();
      for(var len = mbcDomains.length, i = 0, j = len-1; i < len; i++){
        if(mbcDomains[i].length > 0){
//          item.val = '[ ' + mbcDomains[i][0] + ' ; ' + mbcDomains[i][1] + ( i===len-1 ? ' ]' : ' [');
          item.val = mbcDomains[i][0];
          item.ctx.ranges = {
            startValue : mbcDomains[i][0],
            endValue : mbcDomains[i][1],
            isRightOpen : true,
            isLeftOpen : false
          };
        }else{
          item.val = 'N/A';
          item.ctx.ranges = {};
          if(labels[j+1] !== undefined){
            labels[j+1].ctx.ranges.isRightOpen = false;
          }
        }
        if(j === 0){
          item.ctx.ranges.isRightOpen = false;
        }
        labels[j] = {};
        ObjectUtils.extend(true, labels[j--], item);
      }
      
      chartData.labels = labels;
    };
    
    var _parseBubbleColorLegendFeeds = function(){
      var labels = [], title ='', tmpVal = '', i, j = 0, len, tmpLabel={
        'val' : undefined,
        'ctx' : {
          'path' : {}
        }
      }, dii;
      colorFeedLength = 0, shapeFeedLength = 0;
      
      if(colorFeeds && colorFeeds.length > 0 && colorFeeds[0].rows.length > 0){
        var firstColorFeed = colorFeeds[0];
        title = handleNull(firstColorFeed.col.val);
        
        dii = 'dii_a'+(firstColorFeed.rows[0].ctx.path.aa+1);
        tmpLabel = {
          'val' : firstColorFeed.rows[0].val,
          'ctx' : {
            'path' : { }
          },
          'info' : firstColorFeed.rows[0].info
        };
        tmpLabel.ctx.path[dii] = [firstColorFeed.rows[0].ctx.path.dii];
        
        for(i = 1, len = firstColorFeed.rows.length; i < len; i++){
          tmpVal = firstColorFeed.rows[i].val;
          if(tmpVal === tmpLabel.val || _containsVal(labels, tmpVal)){
            tmpLabel.ctx.path[dii].push(firstColorFeed.rows[i].ctx.path.dii);
          }else{
            labels[j] = {};
            tmpLabel.val = resolveCustomLabel(tmpLabel);
            ObjectUtils.extend(true, labels[j++], tmpLabel);
            //New color label. Add it to uniqueColorLabel and assign its new color
            tmpLabel.val = tmpVal;
            tmpLabel.ctx = {
              path : { }
            };
            tmpLabel.ctx.path[dii] = [firstColorFeed.rows[i].ctx.path.dii];
          }
        }
        //Add the last one
        labels[j] = {};
        tmpLabel.val = resolveCustomLabel(tmpLabel);
        ObjectUtils.extend(true, labels[j], tmpLabel);
        
        colorFeedLength = labels.length;
      }
      
      if(shapeFeeds && shapeFeeds.length > 0) {
        var firstShapeFeed = shapeFeeds[0], shapeLabels=[];
        title = (title === '') ? handleNull(firstShapeFeed.col.val) : title + " / " + handleNull(firstShapeFeed.col.val);
        
        dii = 'dii_a'+(firstShapeFeed.rows[0].ctx.path.aa+1);
        tmpLabel = {
          'val' : firstShapeFeed.rows[0].val,
          'ctx' : {
            'path' : {}
          },
          'info' : firstShapeFeed.rows[0].info
        }, j = 0;
        tmpLabel.ctx.path[dii] = [firstShapeFeed.rows[0].ctx.path.dii];
        
        for(i = 1, len = firstShapeFeed.rows.length; i < len; i++){
          tmpVal = firstShapeFeed.rows[i].val;
          if(tmpVal === tmpLabel.val || _containsVal(shapeLabels, tmpVal)){
            tmpLabel.ctx.path[dii].push(firstShapeFeed.rows[i].ctx.path.dii);
          }else{
            shapeLabels[j] = {};
            tmpLabel.val = resolveCustomLabel(tmpLabel);
            ObjectUtils.extend(true, shapeLabels[j++], tmpLabel);
            //New shape label. Add it to uniqueColorLabel and assign its new color
            tmpLabel.val = tmpVal;
            tmpLabel.ctx = {
              path : {}
            };
            tmpLabel.ctx.path[dii] = [firstShapeFeed.rows[i].ctx.path.dii];
          }
        }
        //Add the last one
        shapeLabels[j] = {};
        tmpLabel.val = resolveCustomLabel(tmpLabel);
        ObjectUtils.extend(true, shapeLabels[j], tmpLabel);

        shapeFeedLength = shapeLabels.length;
        if(labels.length > 0){
          labels = getCartesian([labels, shapeLabels], ' / ');
        }else{
          labels = shapeLabels;
        }
      }
      
      if(labels.length === 0){
        isVisible = false;
      }else{
        isVisible = options.visible;
      }
       
      chartData = {
        'title' : title,
        'labels' : labels
      };
    };
    
    var _parseColorLegendFeeds = function(){
      var title, labels = [];
      var colorData = _parseLegendFeed(title, colorFeeds, colorFeedLength);
      colorFeedLength = colorData.feedsLength;
      var shapeData = _parseLegendFeed(title, shapeFeeds, shapeFeedLength);
      shapeFeedLength = shapeData.feedsLength;
      
      //Color and Shape Cartesian
      if(shapeData.labels.length > 0){
        if(colorData.labels.length > 0){
          if(colorData.MNDInfo.MNDIndex === undefined && shapeData.MNDInfo.MNDIndex === undefined){
            //Has color and shape feed and no MND. So use '/'
            labels = getCartesian([colorData.labels, shapeData.labels], ' / ');
            title = colorData.title + " / " + shapeData.title;
          }else {
            if((colorData.MNDInfo.MNDIndex !== undefined && !colorData.MNDInfo.hasOnlyMND) || (shapeData.MNDInfo.MNDIndex !== undefined && !shapeData.MNDInfo.hasOnlyMND)){
              labels = getCartesian([colorData.labels, shapeData.labels], ' - ');
              title = colorData.title + " - " + shapeData.title;
            } else if (colorData.MNDInfo.MNDIndex !== undefined && colorData.MNDInfo.hasOnlyMND){
              labels = shapeData.labels;
              title = shapeData.title;
            } else {
              labels = colorData.labels;
              title = colorData.title;
            }
              
          } 
        }else{
          labels = shapeData.labels;
          title = shapeData.title;
        }
      }else{
        labels = colorData.labels;
        title = colorData.title;
      }

      if(labels.length === 0){
        isVisible = false;
      }else{
        isVisible = options.visible;
      }
      chartData = {
        'title' : title,
        'labels' : labels
      };
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
                labels[j].val = resolveCustomLabel(rows[j]);
                labels[j].ctx = {
                  path : _setPathByaa(rows[j].ctx.path)
                };
              } else {
                labels[j].val = labels[j].val + dimensionTag + resolveCustomLabel(rows[j]);
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
            labels[j] = {};
            labels[j].val = resolveCustomLabel(rows[j]);
            labels[j].ctx = rows[j].ctx;
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
    
    /*
     * Calculate legend row position and return legend max size. 
     */
    var _calculateRowPosition = function(wholeSize, layoutSpace, containerInfo) {
      var maxHeight = 0, maxWidth = 0, minWidth = 0, minHeight = 0, titleSize = {width:0, height:0}, legendAreaSize = {};
      
      //Cal legend size and position.
      if(options.visible){
        var labelFont = "font-size:" + titleFont.fontsize + "; font-weight:" + titleFont.fontweight + "; font-family:" + titleFont.fontfamily;
        
        textHeight = parseInt(valueLabelFont.fontsize, 10); //1em
        
        var xPos = margin.left * textHeight, yPos = margin.top * textHeight;
        
        //Measure title size
        if(options.isShowTitle) {
          titleSize = TextRuler.measure(((options.titleText===undefined || options.titleText === null) ? chartData.title : options.titleText), labelFont);
          if (!hideTitle) {
              yPos = yPos + titleSize.height + titleMarginBottom * textHeight;
          }
        }
        
        //Legend Area Position
        legendAreaPos = { x : xPos, y: yPos};
        
        legendAreaSize = legendArea.getPreferredSize({height: wholeSize.height-xPos, width: wholeSize.width}, layoutSpace, xPos, containerInfo, sizeBubbleScale, sizeBubbleSpace, sizeBubbleHasHeightFeed);
        
        if(legendAreaSize.width > 0 && legendAreaSize.height > 0){
          //Measure labels size
          //If colors feed don't have MND, can't show legend in hierarchy.
          if(!isBubbleColorLegend() && options.isHierarchy){
            maxWidth = xPos + ((titleSize.width > legendAreaSize.width) ? titleSize.width : legendAreaSize.width);
            maxHeight = yPos + legendAreaSize.height;
          }else{
            if(options.position === 'left' || options.position === 'right') {
              maxWidth = xPos + ((titleSize.width > legendAreaSize.width && !isSizeLegend()) ? titleSize.width : legendAreaSize.width);
              maxHeight = yPos + legendAreaSize.height;
            }else{
              maxWidth = xPos + legendAreaSize.width;
              maxHeight = titleSize.height + titleMarginBottom * textHeight + textHeight;          
            }
          }
          minWidth = xPos + (legendAreaSize.minWidth ? legendAreaSize.minWidth : 0);
          minHeight = yPos + (legendAreaSize.minHeight ? legendAreaSize.minHeight : 0);
        }
        
        relayout = false;
      }
      
      //create preference size object.
      preferenceSize = {
          maxSizeConstant : 1 / 3,
          titleSize : titleSize,
          minWidth: minWidth,
        height: maxHeight,
        width: maxWidth
      };
      if(legendAreaSize.minHeight){
        preferenceSize.minHeight = minHeight;
      }
      return preferenceSize;
    };
    
    var _containsVal = function(a, obj){
      for (var i = 0; i < a.length; i++) {
            if (a[i].val === obj) {
                return true;
            }
        }
        return false;
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
    
    var isColorFeeds = function(feedName){
      var result = false;
//      if(Manifest.feeds[feedName].semantic === 'COLOR'){
//        result = true;
//      }
      if(feedName.search('color') !== -1){
        result = true;
      }
      return result;
    };
    
    var isShapeFeeds = function(feedName){
      var result = false;
//      if(Manifest.feeds[feedName].semantic === 'SHAPE'){
//        result = true;
//      }
      if(feedName.search('shape') !== -1){
        result = true;
      }
      return result;
    };
    
    var isColorLegend = function(){
      var result = false;
      if(options.legendType === 'ColorLegend'){
        result = true;
      }
      return result;  
    };
    
    var isSizeLegend = function(){
      var result = false;
      if(options.legendType === 'SizeLegend'){
        result = true;
      }
      return result;  
    };
    
    var isBubbleColorLegend = function(){
      var result = false;
      if(options.legendType === 'BubbleColorLegend'){
        result = true;
      }
      return result;  
    };
    
    var isMeasureBasedColoringLegend = function(){
      var result = false;
      if(options.legendType === 'MeasureBasedColoringLegend'){
        result = true;
      }
      return result;  
    };
    
    //alex su
    var handleNull = function(_){
      var defaultString = langManager.get('IDS_ISNOVALUE');
      if (_ === null || _ === undefined){
        return defaultString;
      }
      else{ 
        return _;
      }
    };
    
    var resolveCustomLabel = function(rawObj){
      var ret;
      if(rawObj.info){
        var clobj = rawObj.info.customlabel;
        if(clobj){
          if(clobj.type === 'url'){
            //Jimmy/12/27/2012 do we still need the orginal value in legend here?
            ret = rawObj.val;
          }else if(clobj.type === 'string'){
            ret = clobj.val;
          }
        }else{
          ret = rawObj.val;
        }
      }else{
        ret = rawObj.val;
      }
      ret = handleNull(ret);
      return ret;  
    };
    
    var handleNullInArray = function(array){
      for (var i = 0; i < array.length; ++i){
        array[i].val = handleNull(array[i].val);
      }
      return array;
    };
    
//    var handleNullInArray = function(array){
//      var newArray = cloneObject(array);
//      for (var i = 0; i < newArray.length; ++i)
//        newArray[i].val = handleNull(newArray[i].val);
//      return newArray;
//    };
//    
//    var cloneObject = function(object){
//
//          if(typeof(object)!='object') return object;
//          if(object==null) return object;
//          
//          var o=Object.prototype.toString.call(object)==='[object Array]'?[]:{};
//
//          for(var i in object){
//                  if(typeof object[i] === 'object'  ){
//                          o[i]=cloneObject(object[i]);
//                  }else o[i]=object[i];
//          }
//          
//          return o;
//    };
    
    properties = manifest.props(null);
    chart.properties(null);
    return chart;
  };
  return legend;
});