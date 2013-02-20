sap.riv.module(
{
  qname : 'sap.viz.modules.treemap',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.modules.dispatch',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.ColorSeriesGenerator',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.tooltipDataHandler',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.NumberUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.NumberUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.TextUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.MeasureBasedColoring',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.Repository',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.BoundUtil',
  version : '4.0.0'
}
],
function Setup(dispatch, ColorSeries, tooltipDataHandler, NumberUtils, 
               TypeUtils, NumberUtils, TextUtils, MeasureBasedColoring, langManager, 
               Repository, Objects, boundUtil) {
    //treemap has no MND
    var treeMap = function(manifest, ctx) {

//--------------------------start of internal vars-----------------------------
        var randomSuffix = Repository.newId();              //diff all the id
        var extendObj = function(target, source)
        {
            for(var prop in source)
            {
                if(typeof(source[prop]) === "object")
                {
                    if(target[prop])
                    {
                        target[prop] = extendObj(target[prop], source[prop]);
                    }
                    else
                    {
                        target[prop] = source[prop];
                    }
                }
                else
                {
                    target[prop] = source[prop];
                }
            }
            return target;
        };      

        var m_selectionList = [];

        var m_width, m_height;
        var m_props =
        {
            "emptycolor":"#e0e0e0",
            'animation': {
                dataLoading : true,
                dataUpdating : false,
                resize : true,
            },
            'colornumber': 5,
            'discretecolor' : false,
            'colorPalette': [],
            tooltip: {
                enabled: true,
            }
        };
        
        m_props = extendObj(m_props, manifest.props(null));

        var m_propsOutput = manifest.props(null);

        var m_styleTooltipFont = "'Open Sans', Arial, Helvetica, sans-serif";

        var m_data;

        var m_HLElement;

        var m_redrawAll = true;

        var m_className = "tree";
        var m_classNameItem = "treeItem";

        var m_padding;

        var m_xScale = d3.scale.ordinal();
        var m_yScale = d3.scale.ordinal();

        var m_dispatch = new dispatch('selectData', 'deselectData', 'initialized', 'showTooltip', 'hideTooltip', 'startToInit');

        var m_styleLineColor = "#ffffff";
        
        var m_dataDimensions;
        var m_dataRectWeight;
        var m_dataRectColor;

        var m_dataRects;

        var m_selection = null;

        var m_tooltipElement = null;
        var m_guidline = null;

        var m_effectManager = ctx.effectManager;
        var m_maxDimensionLevel = 6;

        var m_colorScale = null;
        
        var m_defaultString = langManager.get('IDS_ISNOVALUE');

        var m_styleLabel = {};
        m_styleLabel.fontSize = "12px";
        m_styleLabel.fontWeight = "normal";
        m_styleLabel.fontFamily = "'Open Sans', Arial, Helvetica, sans-serif";
        m_styleLabel.fill = "#ffffff";

//--------------------------end of internal vars-------------------------------
//--------------------------start of internal functions------------------------
        var fastMeasure = function(_text, _style)
        {
            return TextUtils.fastMeasure(_text, _style['font-size'],
                                                _style['font-weight'],
                                                _style['font-family']);
        }        

        var stringNoValueHandler = function(str)
        {
            if(str === null || str === undefined)
            {
                str = langManager.get('IDS_ISNOVALUE');
            }
            return str;
        }

        var generateTooltipData = function(dataIndex){

            var tooltipData = {
                body:[],
                footer:[]
            };
            var dataItem = m_dataRects[dataIndex];
            var weightValue = {
                    'name': stringNoValueHandler(dataItem.weight.col),
                    val:[{
                        value: NumberUtils.isNoValue(dataItem.weight.row.val)?m_defaultString:dataItem.weight.row.val
                    }]
            };
            
            tooltipData.body.push(weightValue);

            if(m_dataRectColor)
            {
                var colorValue = {
                        'name': stringNoValueHandler(dataItem.color.col),
                        val:[{
                            value: NumberUtils.isNoValue(dataItem.color.row.val)?m_defaultString:dataItem.color.row.val
                        }]
                };
                
                tooltipData.body.push(colorValue);
            }

            if(TypeUtils.isExist(m_dataDimensions)){
                for(var tval = m_dataDimensions.values, len = tval.length, i = len -1; i  >= 0; i--){
                    var footer = {};
                    footer.label = tval[i].col;
                    footer.value = tval[i].rows[dataIndex%tval[i].rows.length];
                    tooltipData.footer.push(footer);
                }
            }
                        
            return tooltipData;
        };

        var HLCell = function(item)
        {
            if(!NumberUtils.isNoValue(item.datum().val))
            {
                m_HLElement.attr("visibility", "visible");

                var iLeft = item.datum().left+m_padding;
                var iRight = item.datum().left + item.datum().width-m_padding;
                var iTop = item.datum().top+m_padding;
                var iBottom = item.datum().top + item.datum().height-m_padding;

                m_HLElement.select(".HLLeft").attr("x1",iLeft).attr("y1",iTop).attr("x2",iLeft).attr("y2",iBottom);
                m_HLElement.select(".HLRight").attr("x1",iRight).attr("y1",iTop).attr("x2",iRight).attr("y2",iBottom);
                m_HLElement.select(".HLTop").attr("x1",iLeft).attr("y1",iTop).attr("x2",iRight).attr("y2",iTop);
                m_HLElement.select(".HLBottom").attr("x1",iLeft).attr("y1",iBottom).attr("x2",iRight).attr("y2",iBottom);
            }
        };

        var unHLCell = function(item)
        {
            m_HLElement.attr("visibility", "hidden");
        };

        var endAnimation = function(d, i)
        {   
            if(  (d && d.index === (m_dataRects.length - 1) && d.children.length === 0 )//the last datapoint
               || (m_dataRects.length === 0) //no data
               || (d === undefined && i === undefined) //not in "each"
              )
            {
                m_dispatch.initialized();
            }
        };

        var drawTreeMapItems = function(treeLevelRoot, rectObjs, redrawAll, iLevel)
        {
            if(rectObjs.length <= 0)
            {
                return;
            }

            //rectObjs.length > 0
            var isLeafItem = (rectObjs[0].children.length === 0);
            
            //draw this level
            if(redrawAll)
            {
                treeLevelRoot = treeLevelRoot.append("g").attr("class", m_className + "Level" + rectObjs[0].level);
            }
            else
            {
                treeLevelRoot = treeLevelRoot.select("." + m_className + "Level" + rectObjs[0].level);
            }

            var rectObjArrayToDraw = [];
            for(var i = 0; i < rectObjs.length; i++)
            {
                if(rectObjs[i].level === iLevel)
                {
                    rectObjArrayToDraw.push(rectObjs[i]);
                }
            }

            var rootClassName = treeLevelRoot.attr("class");
            var items = treeLevelRoot.selectAll("." + rootClassName + " > ." + m_classNameItem);

            items = items.data(rectObjArrayToDraw,function(d){return d.index;});
                                 
            var toDrawItems = items.enter();
            var toDeleteItems = items.exit();

            var gItems;//items of this level

            //help functions
            var textLength = function(data)
            {
                var style = {};
                style['font-size'] = m_styleLabel.fontSize;
                style['font-weight'] = m_styleLabel.fontWeight;
                style['font-family'] = m_styleLabel.fontFamily;

                var textHeight = fastMeasure(data.label, style).height;
                var textLength = 0;
                if(textHeight > data.height)
                {
                    textLength = -1;//do not show text
                }
                else
                {
                    textLength = data.width - 6;
                }
                return textLength;
            }

            var xLocation = function(d)
            {
//                return d.left+d.width/2;
              return (isLeafItem)?(d.width/2):(d.left+d.width/2);
            }

            var yLocation = function(d)
            {
                var style = {};
                style['font-size'] = m_styleLabel.fontSize;
                style['font-weight'] = m_styleLabel.fontWeight;
                style['font-family'] = m_styleLabel.fontFamily;
                var labelHeight = fastMeasure(d.label, style).height;

                if(d.children.length === 0)
                {
//                    return d.top + d.height/2 + labelHeight/2 - labelHeight/10;
                  return (isLeafItem)?(d.height/2 + labelHeight/2 - labelHeight/10):(d.top + d.height/2 + labelHeight/2 - labelHeight/10);
                }
                else
                {
                    return d.top + labelHeight - labelHeight/10;
                }
            }

            var getText = function(d)
            {
                var styleStr = "font-size:" + m_styleLabel.fontSize;
                styleStr += "font-weight:" + m_styleLabel.fontWeight;
                styleStr += "font-family:" + m_styleLabel.fontFamily;

                var text = "";
                if(d.showLabel)
                {
                    text = TextUtils.ellipsis(d.label, this, textLength(d), styleStr);
                }
                return text;
            }

            var textLocation = function(d)
            {
                return "middle";
            }

            var textColor = function(d)
            {
                var tColor;
                if(d.children.length === 0)
                {
                    tColor = "white";
                }
                else
                {
                    if(d.level === (d.levelNum -1))//leaf
                    {
                        tColor = "white";
                    }
                    else if((d.levelNum - d.level) === 6)
                    {
                        tColor = "white";
                    }
                    else if((d.levelNum - d.level) === 5)
                    {
                        tColor = "white";
                    }
                    else if((d.levelNum - d.level) === 4)
                    {
                        tColor = "white";
                    }
                    else if((d.levelNum - d.level) === 3)
                    {
                        tColor = "#595959";
                    }
                    else//((d.levelNum - d.level) === 2)
                    {
                        tColor = "#464646";
                    }
                }

                return tColor;
            }

            var drawRect = function(rect)
            {
                var rectRes = rect.attr("x", function(d){return (isLeafItem)?(0):(d.left+m_padding);})
                .attr("y", function(d){return (isLeafItem)?(0):(d.top+m_padding);})
                .attr("width", function(d){return d.width-2*m_padding>0?d.width-2*m_padding:0;})
                .attr("height",function(d){return d.height-2*m_padding>0?d.height-2*m_padding:0;})
                .attr("fill",function(d){
                    var parameter = {
                        drawingEffect:'normal',
                        fillColor : d.color};
                    return m_effectManager.register(parameter);
                    })
                .attr("shape-rendering", "crispEdges");

                return rectRes;
            }

            var drawLabels = function(labels)
            {
              var labelsRes = null;
              
              if (isLeafItem) {
                labelsRes = labels.attr("x", xLocation)
                .attr("y", yLocation)
                .attr('class', 'treemapdatalabel')
                //ie does not support this property
                //.attr("dominant-baseline", "central")//"auto")//"hanging")//"central")
                .attr("text-anchor", textLocation) // text-align
                .attr("fill", textColor)
                .style("font-size", m_styleLabel.fontSize)
                .style("font-family", m_styleLabel.fontFamily)
                .attr('pointer-events', 'none');
               } else {
                 labelsRes = labels.attr("x", xLocation)
                 .attr("y", yLocation)       
                  //ie does not support this property
                  //.attr("dominant-baseline", "central")//"auto")//"hanging")//"central")
                 .attr("text-anchor", textLocation) // text-align
                 .attr("fill", textColor)
                 .style("font-size", m_styleLabel.fontSize)
                 .style("font-family", m_styleLabel.fontFamily)
                 .attr('pointer-events', 'none');
               } 
              
              labelsRes.text(getText);
              return labelsRes;
            };

            if(redrawAll)
            {
              var className = m_classNameItem;
              if(isLeafItem) {
                className += ' datashape';
              }
              
              gItems = toDrawItems.append("g").attr('class', className);
              if (isLeafItem) {
                gItems.attr('transform', function(d) {return 'translate(' + (d.left+m_padding) + ',' + (d.top+m_padding) + ')';});
               }
                //add rect
                var rects = gItems.append("rect");
                drawRect(rects);

                if(isLeafItem)
                {
                    rects.attr('id', function(d, i){return ("HM" + d.index + randomSuffix);})
                         .attr('class', 'datapoint');
                }

                //add labels
                var labels = gItems.append("text");
                drawLabels(labels);

            }
            else
            {

                gItems = items;

                //move rects and labels
                var rect = items.select("rect");
                var labels = items.select("text");

                if(m_props.animation.resize)
                {
                    rect = rect.transition();
                    labels = labels.transition();
                }
                
                if (isLeafItem) {
                  gItems.attr('transform', function(d) {
                    var transformStr = 'translate(' + (d.left+m_padding) + ',' + (d.top+m_padding) + ')';
                    return transformStr;
                    });
                }
                
                rect = drawRect(rect);
                labels = drawLabels(labels);
                        
                var aTime = 500;
                if(m_props.animation.resize)
                {
                    rect.delay(0).duration(aTime).each('end',endAnimation);
                    labels.delay(0).duration(aTime);
                }
                else
                {
                    endAnimation();
                }
            }
            
            //draw children recursively
            var eachSubFun = function(thisObj, d, i)
            {
                var thisItem = d3.select(thisObj);
                var da = thisItem.datum().children;

                drawTreeMapItems(thisItem, thisItem.datum().children, redrawAll, iLevel + 1);
            }

            gItems.each(function(d, i)
                {
                    eachSubFun(this, d, i);
                }
            );

            //animation
            gItems = treeLevelRoot.selectAll("." + m_classNameItem);
            if(redrawAll)
            {
                if(m_props.animation.dataLoading)
                {
                    gItems.attr('opacity', 0);
                    gItems.transition()
                        .delay(0)
                        .duration(1000).attr('opacity', 1).each('end',endAnimation);
                }
                else
                {
                    endAnimation();
                }
            }
            else
            {
                endAnimation();
            }

            return gItems;
        };

        var drawTreeMap = function(selection, rectObjs)
        {
            if(m_redrawAll)
            {
                selection.selectAll("*").remove();
            }
            boundUtil.drawBound(selection, m_width, m_height);

            var treeLevelRoot = selection;
            
            var datashapesgroup = selection.selectAll('g.datashapesgroup');
            if(!TypeUtils.isExist(datashapesgroup[0][0])){
              datashapesgroup = selection.append('g').attr('class', 'datashapesgroup');
            }
            drawTreeMapItems(datashapesgroup, rectObjs, m_redrawAll, 0);
        
            //the HLCell Rectange
            if(m_redrawAll)
            {
                m_HLElement = selection.append('g').attr('class', 'HLElement').attr("visibility", "hidden");
                m_HLElement.append('line').attr('class', 'HLLeft').attr("x1",0).attr("y1",0).attr("x2",0).attr("y2",0).attr("shape-rendering", "crispEdges").attr("stroke","#6c6c6c");
                m_HLElement.append('line').attr('class', 'HLRight').attr("x1",0).attr("y1",0).attr("x2",0).attr("y2",0).attr("shape-rendering", "crispEdges").attr("stroke","#6c6c6c");
                m_HLElement.append('line').attr('class', 'HLTop').attr("x1",0).attr("y1",0).attr("x2",0).attr("y2",0).attr("shape-rendering", "crispEdges").attr("stroke","#6c6c6c");
                m_HLElement.append('line').attr('class', 'HLBottom').attr("x1",0).attr("y1",0).attr("x2",0).attr("y2",0).attr("shape-rendering", "crispEdges").attr("stroke","#6c6c6c");
            }
            else
            {
                if(m_HLElement)
                {
                    m_HLElement.attr("visibility", "hidden");
                }
            }

            m_redrawAll = false;
        }

        var buildColorScale = function()
        {
            //return a color scale like
            //var domainRg = [ [10,40], [40, 100] ];
            //var rangeRg = ['#ff0000', '#00ff00' ];
            //d3.scale.ordinal().domain(domainRg).range(rangeRg);
            if(m_dataRectColor)
            {
                var colorObjArray = [];

                var hData = m_dataRectColor.values[0].rows[0];
                //add the data to heatObjArray. the number of rectanges is the number of rectanglecolor.valuies.
                for(var i = 0; i < hData.length; i++)
                {
                    colorObjArray.push(hData[i]);
                }

                //count the max and min value of heatObjArray[i].val
                var maxVal = -Number.MAX_VALUE;
                var minVal = Number.MAX_VALUE;

                for(var iObj = 0; iObj < colorObjArray.length; iObj++)
                {
                    if(!NumberUtils.isNoValue(colorObjArray[iObj].val))
                    {
                        if(maxVal < colorObjArray[iObj].val)
                        {
                            maxVal = colorObjArray[iObj].val;
                        }

                        if(minVal > colorObjArray[iObj].val)
                        {
                            minVal = colorObjArray[iObj].val;
                        }
                    }
                }
                //has "novalue" or not
                var hasNullValue = false;
                for(var i = 0; i < colorObjArray.length; i++)
                {
                    if( NumberUtils.isNoValue(colorObjArray[i].val))
                    {
                        hasNullValue = true;
                    }
                }
            }
            
            var numS = m_props.colornumber;

            var fontColorScale;
            if(minVal === Number.MAX_VALUE && maxVal === -Number.MAX_VALUE
                || (!m_dataRectColor)    
            ){
                //do not show the scale if there is no color measure, or there are just "No values"
                fontColorScale = undefined;
            } else {
                var fontColorScale = MeasureBasedColoring.getScale(minVal, maxVal, numS, m_props.startColor, m_props.endColor);
                if(hasNullValue){
                    var domains = fontColorScale.domain();
                    var ranges = fontColorScale.range();
                    domains.push([]);
                    ranges.push(m_props.emptycolor);
                }
            }

            return fontColorScale;
        }

//----------------layout function: squarifiedTreeMapLayout-----------------------------------------------
        //please refer to http://www.win.tue.nl/~vanwijk/stm.pdf
        var squarifiedTreeMapLayout = function(rectObjs)
        {
            var squarifiedLayout = function (rectObjs, baseRect, isCurrentLevelShowLabel)
            {
                //the function will set 
                //item.left
                //item.top
                //item.height
                //item.width
                //item.labelHeight
                //item.labelWidth
                //item.showLabel
                //item.needMoreHeightToShowLabel
                //for all rectObjs items, and may change items order
                var allWeight = 0;
                for(var i = 0; i < rectObjs.length; i++)
                {
                    allWeight += rectObjs[i].val;
                }

                //to make the sort stable, we must use a stable sort. But Javascript sort may not stable in 
                //Chrome. So using bubble sort here (do not use rectObjs.sort)
                //sort it!
                var weightOrder = function(objA, objB)
                {
                    var compareObjs = 0; 
                    if(objB.val !== objA.val)
                    {
                        compareObjs = objA.val - objB.val;
                    }
                    return compareObjs;
                }
                var tmpObj;
                for (var time = 0; time < rectObjs.length - 1; time++)
                {
                    for (var i = rectObjs.length - 1; i> time; i--)
                    {
                        if (weightOrder(rectObjs[i], rectObjs[i - 1]) > 0)
                        {
                            tmpObj = rectObjs[i - 1];
                            rectObjs[i - 1] = rectObjs[i];
                            rectObjs[i] = tmpObj;
                        }
                    }
                }

                //the current row rectangle
                var currentRowRect = {
                        left:0,
                        top:0,
                        width:0,
                        height:0,
                        weight:0,
                        items:[],//indexs of items
                        worstRadio:0, 
                    };

                //currentRow rect + space rect
                var currentLiveRect = {
                        left:0,
                        top:0,
                        width:0,
                        height:0,
                        weight:0,
                        vertical:false,
                    };
                
                //layout this level
                for(var i = 0; i < rectObjs.length; i++)
                {
                    squarify(rectObjs, i, allWeight, currentRowRect, currentLiveRect, baseRect);
                }

                //Now some additional work.
                for(var itemIndex = 0; itemIndex < rectObjs.length; itemIndex++)
                {
                    //make sure no "NaN"
                    if(!rectObjs[itemIndex].left)
                    {
                        rectObjs[itemIndex].left = 0;
                    }

                    if(!rectObjs[itemIndex].top)
                    {
                        rectObjs[itemIndex].top = 0;
                    }

                    if(!rectObjs[itemIndex].width)
                    {
                        rectObjs[itemIndex].width = 0;
                    }

                    if(!rectObjs[itemIndex].height)
                    {
                        rectObjs[itemIndex].height = 0;
                    }

                    //draw label or not
                    var miniLabel = "";
                    if(rectObjs[itemIndex].label && rectObjs[itemIndex].label.length && rectObjs[itemIndex].label.length > 0)
                    {
                        var strBegin = rectObjs[itemIndex].label[0];
                        miniLabel = strBegin.concat("...");
                    }

                    var style = {};
                    style['font-size'] = m_styleLabel.fontSize;
                    style['font-weight'] = m_styleLabel.fontWeight;
                    style['font-family'] = m_styleLabel.fontFamily;

                    rectObjs[itemIndex].labelHeight = fastMeasure(miniLabel, style).height;
                    rectObjs[itemIndex].labelWidth = fastMeasure(miniLabel, style).width;

                    rectObjs[itemIndex].needMoreHeightToShowLabel = false;

                    if((rectObjs[itemIndex].labelHeight < rectObjs[itemIndex].height)
                        && (rectObjs[itemIndex].labelWidth < rectObjs[itemIndex].width))
                    {
                        rectObjs[itemIndex].showLabel = true;
                    }
                    else
                    {
                        rectObjs[itemIndex].showLabel = false;
                        if(rectObjs[itemIndex].labelHeight >= rectObjs[itemIndex].height)
                        {
                            rectObjs[itemIndex].needMoreHeightToShowLabel = true;
                        }
                    }
                }
                
                var isLeafNodeNeedMoreHeight = true;
                //check each leaf
                for(var itemIndex = 0; itemIndex < rectObjs.length; itemIndex++)
                {
                    if(rectObjs[itemIndex].level === (rectObjs[itemIndex].levelNum - 1))
                    {
                        if(!rectObjs[itemIndex].needMoreHeightToShowLabel)
                        {
                            isLeafNodeNeedMoreHeight = false;
                            break;
                        }
                    }
                    else
                    {
                        isLeafNodeNeedMoreHeight = false;
                    }
                }

                var hideLabelFun = function(i)
                {
                    if(rectObjs[i].level !== (rectObjs[i].levelNum - 1))
                    {
                        rectObjs[i].showLabel = false;
                    }

                    //adjust base rect for children
                    baseRectForChild.top = rectObjs[i].top + m_padding*2;
                    baseRectForChild.left = rectObjs[i].left + m_padding*2;
                    baseRectForChild.width = rectObjs[i].width - m_padding*2 - m_padding;
                    baseRectForChild.height = rectObjs[i].height - m_padding*2 - m_padding;
                }

                if(!isLeafNodeNeedMoreHeight)
                {
                    for(var i = 0; i < rectObjs.length; i++)
                    {
                        if(rectObjs[i].children.length > 0)
                        {
                            var showLabelForChildren = true;
                            if(!isCurrentLevelShowLabel)
                            {
                                showLabelForChildren = false;
                            }

                            var labelHeight = rectObjs[i].labelHeight;

                            var baseRectForChild = {};
                            baseRectForChild.top = rectObjs[i].top + m_padding*2 + labelHeight;
                            baseRectForChild.left = rectObjs[i].left + m_padding*2;
                            baseRectForChild.width = rectObjs[i].width - m_padding*2 - m_padding;
                            baseRectForChild.height = rectObjs[i].height - m_padding*2 - m_padding - labelHeight;

                            if(!showLabelForChildren)
                            {
                                hideLabelFun(i);
                            }

                            isLeafNodeNeedMoreHeight = squarifiedLayout(rectObjs[i].children, baseRectForChild, showLabelForChildren);
                            if((isLeafNodeNeedMoreHeight || !rectObjs[i].showLabel) && showLabelForChildren)//relayout
                            {
                                hideLabelFun(i);
                                isLeafNodeNeedMoreHeight = squarifiedLayout(rectObjs[i].children, baseRectForChild, false);
                            }
                        }
                    }
                }
                
                return isLeafNodeNeedMoreHeight;
            }

            var rectAspectRatio = function(rect)
            {
                //radio >= 1
                var radio;
                if(rect.height > rect.width)
                {
                    radio = rect.height/rect.width;
                }
                else
                {
                    radio = rect.width/rect.height;
                }

                radio = Math.floor(radio*1000);
                return radio;
            }

            var worstAspectRatio = function(rectObjs, newItemWeight, isInCurrentRow, currentRowRect, currentLiveRect)
            {
                //return the worst AspectRatio in the (changed) currentRow and the new item. 
                var worstRadio = 0;

                var newItemRect = {};
                if(isInCurrentRow)
                {
                    //if currentLiveRect is vertical, 
                    //it means items in currentRow is horizontal.
                    if(currentLiveRect.vertical)
                    {
                        newItemRect.width = currentLiveRect.width * (newItemWeight / (currentRowRect.weight + newItemWeight));
                        newItemRect.height = currentLiveRect.height * ((currentRowRect.weight + newItemWeight) / currentLiveRect.weight);
                    }
                    else
                    {
                        newItemRect.height = currentLiveRect.height * (newItemWeight / (currentRowRect.weight + newItemWeight));
                        newItemRect.width = currentLiveRect.width * ((currentRowRect.weight + newItemWeight) / currentLiveRect.weight);
                    }

                    worstRadio = rectAspectRatio(newItemRect);

                    //adjust items in currentRowRect, count the worstRadio
                    for(var i = 0; i < currentRowRect.items.length; i++)
                    {
                        var objIndex = currentRowRect.items[i];
                        var currentItemRect = {};
                        if(currentLiveRect.vertical)
                        {
                            currentItemRect.width = currentRowRect.width * (rectObjs[objIndex].val / (currentRowRect.weight + newItemWeight));
                            currentItemRect.height = currentLiveRect.height * ((currentRowRect.weight + newItemWeight) / currentLiveRect.weight);
                        }
                        else
                        {
                            currentItemRect.height = currentRowRect.height * (rectObjs[objIndex].val / (currentRowRect.weight + newItemWeight));
                            currentItemRect.width = currentLiveRect.width * ((currentRowRect.weight + newItemWeight) / currentLiveRect.weight);
                        }

                        //current item radio
                        var currentItemRadio = rectAspectRatio(currentItemRect);

                        //update the worst
                        if(worstRadio < currentItemRadio)
                        {
                            worstRadio = currentItemRadio;
                        }
                    }
                }
                else
                {
                    worstRadio = currentRowRect.worstRadio;
                }

                return worstRadio;
            }

            var getCurrentSpaceRect = function(currentRowRect, currentLiveRect)
            {
                var currentSpaceRect = {};
                currentSpaceRect.weight = currentLiveRect.weight - currentRowRect.weight;

                if(currentLiveRect.width === currentRowRect.width)
                {
                    currentSpaceRect.left = currentLiveRect.left;
                    currentSpaceRect.top = currentRowRect.top + currentRowRect.height;
                    currentSpaceRect.width = currentLiveRect.width;
                    currentSpaceRect.height = currentLiveRect.height - currentRowRect.height;
                }
                else
                {
                    currentSpaceRect.left = currentRowRect.left + currentRowRect.width;
                    currentSpaceRect.top = currentLiveRect.top;
                    currentSpaceRect.width = currentLiveRect.width - currentRowRect.width;
                    currentSpaceRect.height = currentLiveRect.height;
                }

                return currentSpaceRect;
            }

            var squarify = function (rectObjs, itemIndex, allWeight, currentRowRect, currentLiveRect, baseRect)
            {
                //itemIndex : const
                //allWeight : const
                //currentRowRect : be changed
                //currentLiveRect : be changed
                if(itemIndex === 0)
                {
                    rectObjs[itemIndex].left = baseRect.left;
                    rectObjs[itemIndex].top = baseRect.top;

                    if(baseRect.width > baseRect.height)
                    {
                        //layout the item
                        rectObjs[itemIndex].height = baseRect.height;
                        rectObjs[itemIndex].width = baseRect.width * (rectObjs[itemIndex].val / allWeight);
                        currentLiveRect.vertical = false;
                    }
                    else
                    {
                        //layout the item
                        rectObjs[itemIndex].width = baseRect.width;
                        rectObjs[itemIndex].height = baseRect.height * (rectObjs[itemIndex].val / allWeight);
                        currentLiveRect.vertical = true;
                    }
                    
                    //adjust currentRowRect
                    currentRowRect.left = baseRect.left;
                    currentRowRect.top = baseRect.top;
                    currentRowRect.width = rectObjs[itemIndex].width;
                    currentRowRect.height = rectObjs[itemIndex].height;
                    currentRowRect.weight = rectObjs[itemIndex].val;
                    currentRowRect.items.push(itemIndex);
                    currentRowRect.worstRadio = rectAspectRatio(currentRowRect);

                    //adjust currentLiveRect
                    currentLiveRect.left = baseRect.left;
                    currentLiveRect.top = baseRect.top;
                    currentLiveRect.width = baseRect.width;
                    currentLiveRect.height = baseRect.height;
                    currentLiveRect.weight = allWeight;
                }
                else if(itemIndex === (rectObjs.length -1))
                {
                    //just put it into the space
                    var currentSpaceRect = getCurrentSpaceRect(currentRowRect, currentLiveRect);
                    rectObjs[itemIndex].left = currentSpaceRect.left;
                    rectObjs[itemIndex].top = currentSpaceRect.top;
                    rectObjs[itemIndex].width = currentSpaceRect.width;
                    rectObjs[itemIndex].height = currentSpaceRect.height;
                }
                else
                {                
                    var inRowWorstRadio = (worstAspectRatio(rectObjs, rectObjs[itemIndex].val, true, currentRowRect, currentLiveRect));
                    var newRowWorstRadio = (worstAspectRatio(rectObjs, rectObjs[itemIndex].val, false, currentRowRect, currentLiveRect));

                    if(inRowWorstRadio < newRowWorstRadio)
                    {
                        //update the worstRadio
                        currentRowRect.worstRadio = inRowWorstRadio;

                        //adjust currentRowRect
                        currentRowRect.items.push(itemIndex);
                        currentRowRect.weight += rectObjs[itemIndex].val;

                        if(currentLiveRect.vertical)
                        {
                            currentRowRect.height = currentLiveRect.height * (currentRowRect.weight / currentLiveRect.weight);
                        }
                        else
                        {
                            currentRowRect.width = currentLiveRect.width * (currentRowRect.weight / currentLiveRect.weight);
                        }

                        //adjust items in currentRowRect
                        for(var i = 0; i < currentRowRect.items.length; i++)
                        {
                            var objIndex = currentRowRect.items[i];
                            if(currentLiveRect.vertical)
                            {
                                rectObjs[objIndex].width = currentRowRect.width * (rectObjs[objIndex].val / currentRowRect.weight);
                                rectObjs[objIndex].height = currentLiveRect.height * (currentRowRect.weight / currentLiveRect.weight);

                                rectObjs[objIndex].top = currentRowRect.top;
                                
                                if(i === 0)//for the first item in the row
                                {
                                    rectObjs[objIndex].left = currentRowRect.left;
                                }
                                else
                                {
                                    rectObjs[objIndex].left = rectObjs[objIndex-1].left + rectObjs[objIndex-1].width;
                                }
                            }
                            else
                            {
                                rectObjs[objIndex].height = currentRowRect.height * (rectObjs[objIndex].val / currentRowRect.weight);
                                rectObjs[objIndex].width = currentLiveRect.width * (currentRowRect.weight / currentLiveRect.weight);

                                rectObjs[objIndex].left = currentRowRect.left;
                                
                                if(i === 0)//for the first item in the row
                                {
                                    rectObjs[objIndex].top = currentRowRect.top;
                                }
                                else
                                {
                                    rectObjs[objIndex].top = rectObjs[objIndex-1].top + rectObjs[objIndex-1].height;
                                }
                            }
                        }

                        //do not need to adjust currentLiveRect.
                    }
                    else
                    {
                        //make a new currentLiveRect
                        var newCurrentLiveRect = getCurrentSpaceRect(currentRowRect, currentLiveRect);
                        
                        currentLiveRect.left = newCurrentLiveRect.left;
                        currentLiveRect.top = newCurrentLiveRect.top;
                        currentLiveRect.width = newCurrentLiveRect.width;
                        currentLiveRect.height = newCurrentLiveRect.height;
                        currentLiveRect.weight = newCurrentLiveRect.weight;

                        if(currentLiveRect.width > currentLiveRect.height)
                        {
                            currentLiveRect.vertical = false;
                        }
                        else
                        {
                            currentLiveRect.vertical = true;
                        }

                        //make a new currentRowRect
                        currentRowRect.left = currentLiveRect.left;
                        currentRowRect.top = currentLiveRect.top;
                        currentRowRect.weight = rectObjs[itemIndex].val;
                        if(currentLiveRect.vertical) 
                        {
                            currentRowRect.width = currentLiveRect.width;
                            currentRowRect.height = currentLiveRect.height * (rectObjs[itemIndex].val / currentLiveRect.weight);
                        }
                        else
                        {
                            currentRowRect.height = currentLiveRect.height;
                            currentRowRect.width = currentLiveRect.width * (rectObjs[itemIndex].val / currentLiveRect.weight);
                        }

                        currentRowRect.worstRadio = rectAspectRatio(currentRowRect);        
                        currentRowRect.items = [];
                        currentRowRect.items.push(itemIndex);

                        //layout the item
                        rectObjs[itemIndex].width = currentRowRect.width;
                        rectObjs[itemIndex].height = currentRowRect.height;
                        rectObjs[itemIndex].top = currentRowRect.top;
                        rectObjs[itemIndex].left = currentRowRect.left;
                    }
                }
            }
            //the entry of squarifiedTreeMapLayout
            var baseRect = {};
            baseRect.top = 0;
            baseRect.left = 0;
            baseRect.width = m_width;
            baseRect.height = m_height;
            
            var isLeafNodeNeedMoreHeight = squarifiedLayout(rectObjs, baseRect, true);
            if(isLeafNodeNeedMoreHeight)//relayout
            {
                squarifiedLayout(rectObjs, baseRect, false);
            }
        }
//----------------end of layout function: squarifiedTreeMapLayout-----------------------------------------------
        var buildTreeData = function(m_dataRects, iLevel, levelNum, startIndex, endIndex)
        {
            if(iLevel >= levelNum)
            {
                return [];
            }

            var rectObjArray = [];

            //each item:
            //color:#333333
            //colorValue:2
            //ctx:(color m ctx)
            //label:
            //val:(the weight) (if it is a negative value, we set it to 0)
            //children: a rectObjArray or []
            //level: leaf is 0
            //levelNum
            //index (id)
            var lastDimensionName = undefined;
            
            var childrenStartIndex = startIndex;
            var childrenEndIndex = childrenStartIndex + 1;

            for(var i = startIndex; i < endIndex; i++)
            {
                var rectObjItem = {};
                var currentDimensionName = m_dataRects[i].dimensions[iLevel].row.val;
                if(currentDimensionName !== lastDimensionName || 
                    iLevel === levelNum - 1) //for leaf items, we do not merge
                {
                    //set rectObjItem.color and rectObjItem.colorValue
                    var color = setItemColor(i, iLevel, levelNum, rectObjItem);

                    rectObjItem.label = m_dataRects[i].dimensions[iLevel].row.val;
                    rectObjItem.level = iLevel;
                    rectObjItem.levelNum = levelNum;
                    rectObjItem.isTreeMap = true;
                    
                    if(iLevel === levelNum - 1)//leaf node
                    {
                        rectObjItem.ctx = m_dataRects[i].weight.row.ctx;//legned is for weight
                    }
                    else
                    {
                        rectObjItem.ctx = null;
                    }
                    rectObjItem.index = i;
                    
                    if(m_dataRects[i].weight.row.val >= 0)
                    {
                        rectObjItem.val = m_dataRects[i].weight.row.val;
                    }
                    else
                    {
                        //https://tipjira.pgdev.sap.corp/browse/BITVIZA-137 "Treat negative value as zero."
                        rectObjItem.val = 0;
                    }

                    //we should update the children of previous item
                    if(rectObjArray.length >0)
                    {
                        rectObjArray[rectObjArray.length -1].children = buildTreeData(m_dataRects,
                                       (iLevel + 1), levelNum, childrenStartIndex, childrenEndIndex);

                        childrenStartIndex = i;
                        childrenEndIndex = childrenStartIndex + 1;
                    }

                    //add new item and update childrenIndexs
                    rectObjArray.push(rectObjItem);
                }
                else
                {
                    //update the last item
                    if(m_dataRects[i].weight.row.val >= 0)
                    {
                        rectObjArray[rectObjArray.length -1].val += m_dataRects[i].weight.row.val;
                    }
                    
                    childrenEndIndex++;
                }
                lastDimensionName = currentDimensionName;

                if(i === endIndex - 1)
                {
                    //we should update the children of previous item
                    if(rectObjArray.length >0)
                    {
                        rectObjArray[rectObjArray.length -1].children = buildTreeData(m_dataRects,
                                       (iLevel + 1), levelNum, childrenStartIndex, childrenEndIndex);
                    }
                }
            }

            return rectObjArray;
        }

        var setItemColor = function(index, iLevel, levelNum, rectObjItem)
        {
            if(iLevel !== (levelNum - 1))//not leaf
            {
                //set rectObjItem.color
                var level = (levelNum -1 - iLevel);
                if(level === 1)
                {
                    rectObjItem.color = "#f9f9f9";
                }
                else if(level === 2)
                {
                    rectObjItem.color = "#e3e3e3";
                }
                else if(level === 3)
                {
                    rectObjItem.color = "#bfbfbf";
                }
                else if(level === 4)
                {
                    rectObjItem.color = "#989898";
                }
                else if(level === 5)
                {
                    rectObjItem.color = "#717171";
                }
                //set rectObjItem.colorValue
                rectObjItem.colorValue = Number.MAX_VALUE;
            }
            else
            {
                if(m_dataRects[index].color)
                {
                    //set colorValue
                    rectObjItem.colorValue = m_dataRects[index].color.row.val;

                    //set rectObjItem.color. m_colorScale is set
                    if(m_colorScale)
                    {
                        var domainArray = m_colorScale.domain();

                        if(NumberUtils.isNoValue(rectObjItem.colorValue))
                        {
                            rectObjItem.color = m_props.emptycolor;
                        }
                        else
                        {
                            var domainValue;
                            for( var j = 0; j<domainArray.length; j++)
                            {
                                var tdv = domainArray[j];
                                if ((j == domainArray.length-1) || (domainArray[j+1].length == 0)) {
                                    domainValue = tdv;
                                    break;
                                }
                                if ((rectObjItem.colorValue >= tdv[0]) && (rectObjItem.colorValue < tdv[1])) {
                                    domainValue = tdv;
                                    break;
                                }
                            }
                            rectObjItem.color = m_colorScale(domainValue);
                        }
                    }
                    else
                    {
                        rectObjItem.color = m_props.emptycolor;
                    }
                }
                else
                {
                    rectObjItem.colorValue = Number.MAX_VALUE;

                    //set rectObjItem.color
                    var colorArray = ColorSeries.sap32().range();
                    rectObjItem.color = colorArray[0];
                }
            }
        }

//--------------------------end of internal functions--------------------------
//--------------------------external functions---------------------------------

        function chart(selection) {
            m_selection = selection;
            m_dispatch.startToInit();
            if(m_props.border && m_props.border.visible)
            {
                m_padding = 1;
            }
            else
            {
                m_padding = 0;
            }
            //build color scale
            m_colorScale = buildColorScale();

            //prepare tree data, and draw the treeMap level by level
            var levelNum = m_dataRects[0].dimensions.length;

            var rectObjArray = buildTreeData(m_dataRects, 0, levelNum, 0, m_dataRects.length);

            //existing data is read-only in layout and draw functions
            //layout it recursively
            squarifiedTreeMapLayout(rectObjArray);

            //draw the treemap recursively (update it, or redraw it)
            drawTreeMap(selection, rectObjArray);

            return chart;
        };

        chart.dataLabel = function(_){
          
        };
        
        chart.afterUIComponentAppear = function(){
          m_dispatch.initialized(); 
        };
        
        
        chart.mouseover = function(elem){
            var item = d3.select(d3.event.target);
            var clickedItemID = item.attr('id');
            if(clickedItemID && m_props.tooltip.enabled)
            {
              var tmpLength = clickedItemID.toString().length - randomSuffix.toString().length - 2;
                var dataIndex = clickedItemID.toString().substr(2 , tmpLength);
                
                var transform = m_selection.node().getTransformToElement(m_selection.node().ownerSVGElement);
                var svgBoundingBox = m_selection.node().ownerSVGElement.getBoundingClientRect();
                var rectBoundingBox =  elem.getBoundingClientRect();
                //showTooltip(dataIndex);
                var tooltipData = generateTooltipData(dataIndex);
                tooltipData.point = {
                        x : rectBoundingBox.left - svgBoundingBox.left + rectBoundingBox.width/2,
                        y : (rectBoundingBox.height > 16) ? rectBoundingBox.top - svgBoundingBox.top + 8 : rectBoundingBox.top - svgBoundingBox.top + rectBoundingBox.height/2
                };
                tooltipData.plotArea = {
                        x : transform.e,
                        y : transform.f,
                        width : m_width,
                        height : m_height
                };
                m_dispatch.showTooltip(tooltipDataHandler.formatTooltipData(tooltipData));
                HLCell(item);
            }

        };
        
        chart.mouseout = function(){
            if(m_props.tooltip.enabled)
            {
                m_dispatch.hideTooltip();
            }

            if(d3.event)
            {
                var item = d3.select(d3.event.target);
                unHLCell(item);
            }
        };

        /*
         * Add mouse interaction functions.
         */
        chart.parent = function(){
            return m_selection;
        };

        chart.highlight = function(elems){
            if(elems instanceof Array){
                for(var i = 0, len = elems.length; i < len; i++){
                    elems[i].setAttribute('opacity', 1);
                }
            }else{
                elems.setAttribute('opacity', 1);
            }
        };
        
        chart.unhighlight = function(elems){
            if(elems instanceof Array){
                for(var i = 0, len = elems.length; i < len; i++){
                    elems[i].setAttribute('opacity', 0.2);
                }
            }else{
                elems.setAttribute('opacity', 0.2);
            }
        };
        
        chart.clear = function(gray){
            if( gray == null){
                m_selection.selectAll('.datapoint').attr('opacity', 1);
            }else{
                m_selection.selectAll('.datapoint').attr('opacity', 0.2);
            }
        };
        
        chart.width = function(_width){
            if (!arguments.length){
              return m_width;
            }
            m_width = _width;
            return chart;
        };

        chart.height = function(_height){
            if (!arguments.length){
              return m_height;
            }
            m_height = _height;
            return chart;       
        };

        chart.data = function(value){
            if (!arguments.length){
                return m_data;
            }

            m_data = value;
            m_redrawAll = true;
            
            m_dataDimensions = m_data.getAnalysisAxisDataByIdx(0);
            m_dataRectWeight = m_data.getMeasureValuesGroupDataByIdx(0);
            m_dataRectColor = m_data.getMeasureValuesGroupDataByIdx(1);

            var dataDimensions = m_data.getAnalysisAxisDataByIdx(0);
            var dataRectWeight = m_data.getMeasureValuesGroupDataByIdx(0);
            var dataRectColor = m_data.getMeasureValuesGroupDataByIdx(1);

            //make the rect array which has all datas(not a tree)
            m_dataRects = [];

            //add weight
            var vArray = dataRectWeight.values[0].rows[0];
            for(var i = 0; i < vArray.length; i++)
            {
                var dataRectItem = {};

                var weightObj = {};
                weightObj.col = dataRectWeight.values[0].col;
                weightObj.row = vArray[i];

                dataRectItem.weight = weightObj;

                m_dataRects.push(dataRectItem);
            }

            //add color
            if(dataRectColor)
            {
                var vArray = dataRectColor.values[0].rows[0];
                for(var i = 0; i < m_dataRects.length; i++)
                {
                    var dataRectItem = m_dataRects[i];

                    var colorObj = {};
                    colorObj.col = dataRectColor.values[0].col;
                    colorObj.row = vArray[i];

                    dataRectItem.color = colorObj;
                }
            }

            //add dimensions (6 levels at most)
            var vArray = dataDimensions.values;
            for(var i = 0; i < m_dataRects.length; i++)
            {
                var dataRectItem = m_dataRects[i];

                var dimensionArray = [];
                var levels = vArray.length;
                if(levels > m_maxDimensionLevel)
                {
                    levels = m_maxDimensionLevel;
                }
                for(var j = 0; j < levels; j++)
                {
                    var dimensionItem = {};
                    dimensionItem.col = dataDimensions.values[j].col;
                    dimensionItem.row = dataDimensions.values[j].rows[i];

                    dimensionArray.push(dimensionItem);
                }

                dataRectItem.dimensions = dimensionArray;
            }
            
            return chart;
        };

        chart.properties = function(props){
            if (!arguments.length){
                return m_propsOutput;
            }           
            Objects.extend(true, m_props, props);
            Objects.extend(true, m_propsOutput, props);
            m_redrawAll = true;
            return chart;           
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
            data = datapoints[i].__data__.colorValue;
            if(NumberUtils.isNoValue(selectedData.val)){
              if(NumberUtils.isNoValue(data)){
                ctxDatapoints.push(datapoints[i]);
              }
            }else{
              if(data < ranges.endValue && data > ranges.startValue){
                ctxDatapoints.push(datapoints[i]);
              }else{
                if(!ranges.isLeftOpen && data === ranges.startValue) {
                  ctxDatapoints.push(datapoints[i]);
                }else if(!ranges.isRightOpen && data === ranges.endValue){
                  ctxDatapoints.push(datapoints[i]);
                }
              }
            }
          }
          return ctxDatapoints;
        };
         
        /**
         * for MBC legend
         */
        chart.mbcLegendInfo = function(){
            var hColor = buildColorScale();
            var title = "";
            if(m_dataRectColor)
            {
                title = m_dataRectColor.values[0].col;
            }
            return {
                'colorScale' : hColor,
                'title': title,
            };
        };

        /**
         * required by the layout
         */
        chart.getPreferredSize = function(){  
          
        };

        /**
         * get/set your event dispatch if you support event
         */
        chart.dispatch = function(_){
            if(!arguments.length)
                return m_dispatch;
            m_dispatch = _;
            return chart;
        };
        return chart;
    };

    return treeMap;
});