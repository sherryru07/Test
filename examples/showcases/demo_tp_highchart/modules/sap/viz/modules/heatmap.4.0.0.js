sap.riv.module(
{
  qname : 'sap.viz.modules.heatmap',
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
{  qname : 'sap.viz.util.EffectManager',
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
function Setup(dispatch, ColorSeries, tooltipDataHandler, NumberUtils,EffectManager, TypeUtils, NumberUtils, TextRuler, MeasureBasedColoring, langManager, Repository, Objects, BoundUtil) {
    //heatmap has no MND
    var heatMap = function(manifest, ctx) {
    
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
            },
            'colornumber': 5,
            'discretecolor' : false,
            'guideline' : 
            {
                visible: false,
                color: "#ffff90",
            },
            'drawemptycell': true,
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

        var m_className = "heatMap";
        var m_classEmptyValue = "heatMap_emptyValue";

        var m_padding = 1;

        var m_xScale = d3.scale.ordinal();
        var m_yScale = d3.scale.ordinal();

        var m_dispatch = new dispatch('selectData', 'deselectData', 'initialized', 'showTooltip', 'hideTooltip', 'startToInit');

        var hColor = undefined; //Color Scale

        var m_styleLineColor = "#ffffff";
        
        var m_dataXAxis;
        var m_dataYAxis;
        var m_dataRect;

        var m_heatMapBody;//the root class
        var m_rects;//rects in the heatmap

        var m_selection = null;

        var m_tooltipElement = null;
        var m_guidline = null;

        //we need to draw some recs. So I will build a obj array, each item is a rec.
        var m_heatObjArray = [];

        var m_effectManager = ctx.effectManager;
        
        var m_defaultString = langManager.get('IDS_ISNOVALUE');
        
        var m_dataShape = null;
        
        function chart(selection){
          BoundUtil.drawBound(selection, m_width, m_height);
          m_dispatch.startToInit();
            m_selection = selection;
            //console.log(m_redrawAll);

            //prepare data
            m_heatObjArray = [];
            
            var isOnlyOneCategroy = false;
            if(!m_dataYAxis)
            {
                isOnlyOneCategroy = true;
            }

            if(isOnlyOneCategroy)
            {
                //build labels
                var labelArray = [];
                var vArray = m_dataRect.values[0].rows[0];
                //add the data to m_heatObjArray. the number of rectanges is the number of rectanglecolor.valuies.
                for(var i = 0; i < vArray.length; i++)
                {
                    m_heatObjArray.push(vArray[i]);
                }

                //build labelArray
                for(var i = 0; i < m_heatObjArray.length; i++)
                {
                    var label = "";
                    for(var j = 0; j < m_dataXAxis.values.length; j++)
                    {
                        label += m_dataXAxis.values[j].rows[i].val;
                        if(j != (m_dataXAxis.values.length-1))
                        {
                            label += " / ";
                        }
                    }
                    labelArray.push(label);
                }

                for(var i = 0; i < m_heatObjArray.length; i++)
                {
                    m_heatObjArray[i].label = labelArray[i];
                    m_heatObjArray[i].isOnlyOneCategory = true;
                }
            }
            else
            {
                //for the 2 categories, we have to count the numCol and the numRow.
                var hCol = m_dataXAxis.values[0].rows;
                var hRow = m_dataYAxis.values[0].rows;
                var hData = m_dataRect.values[0].rows;

                var numCol = hCol.length;
                var numRow = hRow.length;

                for(var i = 0; i < numRow; i++)
                {
                    for(var j = 0; j < numCol; j++)
                    {
                        m_heatObjArray.push(hData[i][j]);
                    }
                }
                
                for(var i = 0; i < m_heatObjArray.length; i++)
                {
                  m_heatObjArray[i].isOnlyOneCategory = false;
                }
            }

            // //count the max and min value of m_heatObjArray[i].val
            // var maxVal = -Number.MAX_VALUE;
            // var minVal = Number.MAX_VALUE;

            // for(var iObj = 0; iObj < m_heatObjArray.length; iObj++)
            // {
                // if(!NumberUtils.isNoValue(m_heatObjArray[iObj].val))
                // {
                    // if(maxVal < m_heatObjArray[iObj].val)
                    // {
                        // maxVal = m_heatObjArray[iObj].val;
                    // }

                    // if(minVal > m_heatObjArray[iObj].val)
                    // {
                        // minVal = m_heatObjArray[iObj].val;
                    // }
                // }
            // }

            //var numS = m_props.colornumber;

            hColor = buildColorScale();
            var domainArray = hColor.domain();
            for(var i = 0; i < m_heatObjArray.length; i++)
            {
                var domainValue;
                if(NumberUtils.isNoValue(m_heatObjArray[i].val)) {
                    m_heatObjArray[i].color = m_props.emptycolor;
                } else {
                    for (var j=0; j<domainArray.length; j++) {
                        var tdv = domainArray[j];
                        if ((j == domainArray.length-1) || (domainArray[j+1].length == 0)) {
                            domainValue = tdv;
                            break;
                        }
                        if ((m_heatObjArray[i].val >= tdv[0]) && (m_heatObjArray[i].val < tdv[1])) {
                            domainValue = tdv;
                            break;
                        }
                    }
                    m_heatObjArray[i].color = hColor(domainValue);
                }
                
                
                // for(var j = 0; j < numS; j++)
                // {
                     // if(NumberUtils.isNoValue(m_heatObjArray[i].val))
                    // {
                        // m_heatObjArray[i].color = m_props.emptycolor;
                        // break;
                    // }
                     // else if( m_heatObjArray[i].val == maxVal )
                    // {
                        // m_heatObjArray[i].color = hColor([(minVal + (maxVal-minVal)/numS*(numS-1)), maxVal]);
                        // break;
                    // }
                    // else if(m_heatObjArray[i].val >= (minVal + (maxVal-minVal)/numS*j) && m_heatObjArray[i].val < (minVal + (maxVal-minVal)/numS*(j+1)))
                    // {
                        // m_heatObjArray[i].color = hColor( [(minVal + (maxVal-minVal)/numS*j), (minVal + (maxVal-minVal)/numS*(j+1))]  );
                       
                    // }
                    
                // }
            }

            if(isOnlyOneCategroy)
            {
                //build the rect size. The rule is making the rect width and height have similar values
                var score = -Number.MAX_VALUE;//the bigger the better

                var rHeight;
                var rWidth;
                
                var iRow;
                var iCol;

                var emptyCellNum;

                var scoreArray = [];
                var varianceRec;

                if(m_heatObjArray.length == 1)
                {
                    rHeight = m_height;
                    rWidth = m_width;
                    iCol = 1;
                    iRow = 1;
                }
                else
                {

                    for(iRow = 1; iRow <= m_heatObjArray.length; iRow++)
                    {
                        //count the height
                        rHeight = m_height/iRow;

                        //count the num of one row. 
                        var iCol = m_heatObjArray.length;
                        for(; iCol >= 0; iCol--)
                        {
                            if((iCol * iRow) < m_heatObjArray.length)
                            {
                                iCol++;
                                break;
                            }
                        }

                        //count the width
                        rWidth = m_width/iCol;

                        emptyCellNum = (iCol * iRow) - m_heatObjArray.length;
                        varianceRec = (rHeight - rWidth)*(rHeight - rWidth);

                        if(varianceRec < 1)
                        {
                            varianceRec = 1; //to avoid 1/varianceRec huge number
                        }

                        var score;
                        if(emptyCellNum == 0 && varianceRec == 0)
                        {
                            score = 1 + 1;
                        }
                        else if(emptyCellNum == 0 && varianceRec != 0)
                        {
                            score = 1 + 1/varianceRec;
                        }
                        else if(emptyCellNum != 0 && varianceRec == 0)
                        {
                            score = 1 + 1;
                        }
                        else
                        {
                            score = 1 + 1/varianceRec;
                        }
                        
                        scoreArray.push(
                        {
                            "iRow":iRow,
                            "iCol":iCol,
                            "rHeight":rHeight,
                            "rWidth":rWidth,
                            "varianceRec":varianceRec,
                            "emptyCellNum":emptyCellNum,
                            "score":score
                        });
                    }
                    //select the best score
                    var maxS = 0;
                    var iChoose = -1;
                    for(var i = 0; i < scoreArray.length; i++)
                    {
                        if(scoreArray[i].score > maxS)
                        {
                            maxS = scoreArray[i].score;
                            iChoose = i;
                        }
                    }

                    rHeight = scoreArray[iChoose].rHeight;
                    rWidth = scoreArray[iChoose].rWidth;
                    iCol = scoreArray[iChoose].iCol;
                    iRow = scoreArray[iChoose].iRow;
                    
                }



                //build the rect height, width, and left, right
                for(var i = 0; i < m_heatObjArray.length; i++)
                {
                    m_heatObjArray[i].width = rWidth;
                    m_heatObjArray[i].height = rHeight;

                    m_heatObjArray[i].left = rWidth * (i%iCol);
                    m_heatObjArray[i].top = rHeight * (Math.floor(i/iCol));
                }
            }
            else
            {
                //build the rect height, width, and left, right
                for(var i = 0; i < m_heatObjArray.length; i++)
                {
                    m_heatObjArray[i].width = m_width/numCol;
                    m_heatObjArray[i].height = m_height/numRow;

                    m_heatObjArray[i].left = (m_width/numCol) * (i%numCol);
                    //the Y is from the bottom
                    m_heatObjArray[i].top = (m_height-m_height/numRow) - ((m_height/numRow) * (Math.floor(i/numCol)));
                }
            }

            if(m_redrawAll)
            {
                selection.select("." + m_className).remove();
            }

            if(isOnlyOneCategroy)
            {
              var datashapesgroup = selection.selectAll('g.datashapesgroup');
              if(!TypeUtils.isExist(datashapesgroup[0][0])){
                datashapesgroup = selection.append('g').attr('class', 'datashapesgroup');
              }
                //draw the rects
                if(m_redrawAll)
                {
                    m_heatMapBody = datashapesgroup.append("g").attr("class", m_className);
                }
                else
                {
                    m_heatMapBody = datashapesgroup.select("." + m_className);
                }

                var m_heatObjArrayToDraw = [];
                for(var i = 0; i < m_heatObjArray.length; i++)
                {
                    if(!m_props.drawemptycell && !m_heatObjArray[i].val)
                    {
                        continue;
                    }
                    else
                    {
                        m_heatObjArray[i].index = i;
                        m_heatObjArrayToDraw.push(m_heatObjArray[i]);
                    }
                }
                //draw rects 
                var item = m_heatMapBody.selectAll("rect")
                     .data(m_heatObjArrayToDraw,function(d){return d.index;});
                    
                     
                var toDrawItems = item.enter();
                var toDeleteItems = item.exit();

                var rects;

                if(m_redrawAll)
                {
                  m_dataShape = toDrawItems.append("g").attr("class","datashape");
                  m_dataShape.attr('transform', function(d) {return 'translate(' + (d.left+m_padding) + ',' + (d.top+m_padding) + ')';});
                  
                    rects = m_dataShape.append("rect")
                            .attr('id', function(d, i){return ("HM" + d.index + randomSuffix);})
                            .attr('class', 'datapoint')
                            .attr("x", 0)
                            .attr("y", 0)
                            .attr("width", function(d){return d.width-2*m_padding;})
                            .attr("height",function(d){return d.height-2*m_padding;})
                            .attr("fill",function(d){ 
                                var parameter = {
                                    drawingEffect:'normal',
                                    fillColor : d.color};
                                return m_effectManager.register(parameter);
                                })
                            .attr("shape-rendering", "crispEdges");
                }
                else
                {
                    if (m_dataShape)
                    {
                        m_dataShape.attr('transform', function(d) {return 'translate(' + (d.left+m_padding) + ',' + (d.top+m_padding) + ')';});
                    }

                    if(m_props.animation.dataUpdating)
                    {
                        rects = item
                                .attr('id', function(d, i){return ("HM" + d.index + randomSuffix);})
                                .attr('class', 'datapoint')
                                .transition()
                                .delay(0)
                                .duration(500)
                                .attr("x", 0)
                                .attr("y", 0)
                                .attr("width", function(d){return d.width-2*m_padding;})
                                .attr("height",function(d){return d.height-2*m_padding;})
                                .attr("fill",function(d){ 
                                    var parameter = {
                                        drawingEffect:'normal',
                                        fillColor : d.color};
                                    return m_effectManager.register(parameter);
                                    })
                                .attr("shape-rendering", "crispEdges")
                                .each('end',endAnimation);
                    }
                    else
                    {
                        rects = item
                                .attr('id', function(d, i){return ("HM" + d.index + randomSuffix);})
                                .attr('class', 'datapoint')
                                .attr("x", 0)
                                .attr("y", 0)
                                .attr("width", function(d){return d.width-2*m_padding;})
                                .attr("height",function(d){return d.height-2*m_padding;})
                                .attr("fill",function(d){ 
                                    var parameter = {
                                        drawingEffect:'normal',
                                        fillColor : d.color};
                                    return m_effectManager.register(parameter);
                                    })
                                .attr("shape-rendering", "crispEdges");
                        
                    }
                    //unselect all of them
                    rects.attr('opacity', 1);
                }


                if(!m_props.border || (m_props.border && m_props.border.visible))
                {
                    rects.attr("stroke",m_styleLineColor)
                           .attr("stroke-width","1");
                }

                if(m_redrawAll)
                {
                    if(m_props.animation.dataLoading){
                        rects.attr('opacity', 0);

                        rects.transition()
                            .delay(0)
                            .duration(1000).attr('opacity', 1)
                            .each('end',endAnimation);
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

                //labels
                if(m_redrawAll)
                {
                  if (m_dataShape) {
                    m_dataShape.append("text")
                                .attr("class", "heatmapdatalabel")
                                .attr("x", function(d){return d.width/2;})
                                .attr("y", function(d){return d.height/2;})
//                                .attr("dominant-baseline", "central")//"auto")//"hanging")//"central")
                                .attr("text-anchor", "middle") // text-align
                                .text(function(d){return d.label;})
                                .attr("fill", "#ffffff")
                                .style("font-size", "12px")
                                .style("font-family", "'Open Sans', Arial, Helvetica, sans-serif")
                                .attr('pointer-events', 'none')
                                .each(function(d) {
                                    //Jimmy, BITVIZ-384, add padding before text
                                    TextRuler.ellipsis(d.label, this, d.width - 5, "fill:#ffffff;font-family:'Open Sans', Arial, Helvetica, sans-serif;font-size:12px;");
                                });
                  }
                }
                else
                {
                     m_heatMapBody.selectAll("text").remove();
                     m_heatMapBody.selectAll("rect").data(m_heatObjArrayToDraw,function(d){return d.index;}).enter();
                     
                     m_dataShape.append("text")
                     .attr("class", "heatmapdatalabel")
                    .attr("x", function(d){return d.width/2;})
                    .attr("y", function(d){return d.height/2;})
//                    .attr("dominant-baseline", "central")//"auto")//"hanging")//"central")
                    .attr("text-anchor", "middle") // text-align
                    .text(function(d){return d.label;})
                    .attr("fill", "#ffffff")
                    .style("font-size", "12px")
                    .style("font-family", "'Open Sans', Arial, Helvetica, sans-serif")
                    .attr('pointer-events', 'none')
                    .each(function(d) {
                        //Jimmy, BITVIZ-384, add padding before text
                        TextRuler.ellipsis(d.label, this, d.width - 5, "fill:#ffffff;font-family:'Open Sans', Arial, Helvetica, sans-serif;font-size:12px;");
                    });
                }

                m_rects = rects;
            }
            else
            {
              var datashapesgroup = selection.selectAll('g.datashapesgroup');
              if(!TypeUtils.isExist(datashapesgroup[0][0])){
                datashapesgroup = selection.append('g').attr('class', 'datashapesgroup');
              }
                //draw the rects
                if(m_redrawAll)
                {
                    m_heatMapBody = datashapesgroup.append("g").attr("class", m_className);
                }
                else
                {
                    m_heatMapBody = datashapesgroup.select("." + m_className);
                }

                if(!m_props.drawemptycell)
                {
                    //draw a rect
                    if(m_redrawAll)
                    {
                        m_heatMapBody.append('rect')
                                   .attr("x", 0)
                                   .attr("y", 0)
                                   .attr("width", m_width)
                                   .attr("height",m_height)
                                   .attr("fill",m_props.emptycolor)
                                   .attr("class", m_classEmptyValue)
                                   .attr("shape-rendering", "crispEdges");
                    }
                    else
                    {
                        m_heatMapBody.select("." + m_classEmptyValue)
                                   .attr("x", 0)
                                   .attr("y", 0)
                                   .attr("width", m_width)
                                   .attr("height",m_height)
                                   .attr("fill",m_props.emptycolor)
                                   .attr("class", m_classEmptyValue)
                                   .attr("shape-rendering", "crispEdges");

                    }
                }

                var m_heatObjArrayToDraw = [];
                for(var i = 0; i < m_heatObjArray.length; i++)
                {
                    if(!m_props.drawemptycell && !m_heatObjArray[i].val)
                    {
                        continue;
                    }
                    else
                    {
                        m_heatObjArray[i].index = i;
                        m_heatObjArrayToDraw.push(m_heatObjArray[i]);
                    }
                }
                
                //draw rects 
                var item = m_heatMapBody.selectAll("rect")
                     .data(m_heatObjArrayToDraw,function(d){return d.index;});

                var toDrawItems = item.enter();
                var toDeleteItems = item.exit();

                var rects;
                if(m_redrawAll)
                {
                  m_dataShape = toDrawItems.append("g").attr("class","datashape");
                  m_dataShape.attr('transform', function(d) {return 'translate(' + (d.left) + ',' + (d.top) + ')';});
                  
                    rects = m_dataShape.append("rect")
                        .attr('id', function(d, i){return ("HM" + d.index + randomSuffix);})
                        .attr('class', 'datapoint')
                        .attr("x", 0)
                        .attr("y", 0)
                        .attr("width", function(d){return d.width;})
                        .attr("height",function(d){return d.height;})
                        .attr("fill",function(d){ 
                            var parameter = {
                                drawingEffect:'normal',
                                fillColor : d.color};
                            return m_effectManager.register(parameter);
                            })
                        .attr("shape-rendering", "crispEdges");
                }
                else
                {
                  if (m_dataShape) {
                    m_dataShape.attr('transform', function(d) {return 'translate(' + (d.left) + ',' + (d.top) + ')';});
                  }
                    if(m_props.animation.dataUpdating)
                    {
                        rects = item
                            .attr('id', function(d, i){return ("HM" + d.index + randomSuffix);})
                            .attr('class', 'datapoint')
                            .transition()
                            .delay(0)
                            .duration(500)
                            .attr("x", 0)
                            .attr("y", 0)
                            .attr("width", function(d){return d.width;})
                            .attr("height",function(d){return d.height;})
                            .attr("fill",function(d){ 
                                var parameter = {
                                    drawingEffect:'normal',
                                    fillColor : d.color};
                                return m_effectManager.register(parameter);
                                })
                            .attr("shape-rendering", "crispEdges")
                            .each('end',endAnimation);
                    }
                    else
                    {
                        rects = item
                            .attr('id', function(d, i){return ("HM" + d.index + randomSuffix);})
                            .attr('class', 'datapoint')
                            .attr("x", 0)
                            .attr("y", 0)
                            .attr("width", function(d){return d.width;})
                            .attr("height",function(d){return d.height;})
                            .attr("fill",function(d){ 
                                var parameter = {
                                    drawingEffect:'normal',
                                    fillColor : d.color};
                                return m_effectManager.register(parameter);
                                })
                            .attr("shape-rendering", "crispEdges");
                    }
                    //unselect all of them
                    rects.attr('opacity', 1);
                }


                if(!m_props.border || (m_props.border && m_props.border.visible))
                {
                    rects.attr("stroke",m_styleLineColor)
                           .attr("stroke-width","1");
                }

                if(m_redrawAll)
                {
                    if(m_props.animation.dataLoading){
                        rects.attr('opacity', 0);

                        rects.transition()
                            .delay(0)
                            .duration(1000).attr('opacity', 1)
                            .each('end',endAnimation);
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

                m_rects = rects;
            }
            //the HLCell Rectange
            if(m_redrawAll)
            {
                m_HLElement = m_heatMapBody.append('g').attr('class', 'HLElement').attr("visibility", "hidden");
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

            //tooltip
            if(m_redrawAll)
            {
                m_tooltipElement = m_heatMapBody.append('g').attr('class', 'heatMapTooltip');
                m_tooltipElement.append('rect').attr('ry', 6).attr('rx', 6).attr('opacity', 0.8).attr("stroke-width","1").attr("stroke","#666666");

                var rectText = m_dataRect.values[0].col;
                var xText = m_dataXAxis.values[0].col.val;
                var yText = "";
                if(m_dataYAxis)
                {
                    yText = m_dataYAxis.values[0].col.val;
                }
                
                m_tooltipElement.append('text').attr('text-anchor', 'start').attr('font-size', '12px') 
                                               .attr('font-family', m_styleTooltipFont)
                                               .attr('font-weight', "bold")
                                               .attr("x", 20).attr("y", 18).attr("fill", "#333333").text(rectText);

                m_tooltipElement.append('text').attr('text-anchor', 'start').attr('font-size', '12px').attr("class", "valText")
                                               .attr('font-family', m_styleTooltipFont)
                                               .attr("x", 30).attr("y", 33).attr("fill", "#333333");


                m_tooltipElement.append('line').attr("x1", 0).attr("y1", 40)
                                               .attr("x2", 160).attr("y2", 40).attr("stroke", "#666666");

                m_tooltipElement.append('text').attr('text-anchor', 'end').attr('font-size', '11px') 
                                               .attr('font-family', m_styleTooltipFont)
                                               .attr('font-weight', "bold")
                                               .attr("x", 80).attr("y", 55).attr("fill", "#333333").text(xText);

                m_tooltipElement.append('text').attr('text-anchor', 'start').attr('font-size', '10px').attr("class", "valXValue")
                                               .attr('font-family', m_styleTooltipFont)
                                               .attr("x", 85).attr("y", 55).attr("fill", "#333333");

                m_tooltipElement.append('text').attr('text-anchor', 'end').attr('font-size', '11px') 
                                               .attr('font-family', m_styleTooltipFont)
                                               .attr('font-weight', "bold")
                                               .attr("x", 80).attr("y", 70).attr("fill", "#333333").text(yText);

                m_tooltipElement.append('text').attr('text-anchor', 'start').attr('font-size', '10px').attr("class", "valYValue")
                                               .attr('font-family', m_styleTooltipFont)
                                               .attr("x", 85).attr("y", 70).attr("fill", "#333333");

                m_tooltipElement.attr('visibility', 'hidden');
            }


            //guidline
            if(m_redrawAll)
            {
                m_guidline = m_heatMapBody.append('g').attr('class', 'heatMapGuideline');
                m_guidline.append("line").attr("x1", 0).attr("y1", 0).attr("x2", 0).attr("y2", m_height).attr("stroke", m_props.guideline.color).attr("shape-rendering", "crispEdges").attr('class', 'xGuidline');
                m_guidline.append("line").attr("x1", 0).attr("y1", 0).attr("x2", m_width).attr("y2", 0).attr("stroke", m_props.guideline.color).attr("shape-rendering", "crispEdges").attr('class', 'yGuidline');
                m_guidline.attr('visibility', 'hidden');
            }

            m_redrawAll = false;
            return chart;
        };
        
        var endAnimation = function(d, i)
        {
            if(  (i === (m_heatObjArray.length - 1))//the last datapoint
               || (m_heatObjArray.length === 0) //no data
               || (d === undefined && i === undefined) //not in "each"
              )
            {
                m_dispatch.initialized();
            }
        };

        function deregisterEvent(){
            
        };
        
        function registerEvent(){
            
        };

        var showTooltip = function(dataIndex){ 
            var dataItem = m_heatObjArray[dataIndex];
            var valXValue = "";
            var valYValue = "";



           var isOnlyOneCategroy = false;
            if(!m_dataYAxis)
            {
                isOnlyOneCategroy = true;
            }

            if(isOnlyOneCategroy)
            {
                valXValue = m_dataXAxis.values[0].rows[dataIndex].val;
                if(m_dataYAxis)
                {
                    valYValue = m_dataYAxis.values[0].rows[dataIndex].val;
                }
            }
            else
            {
                //for the 2 categories, we have to count the numCol and the numRow.
                var hCol = m_dataXAxis.values[0].rows;
                var hRow = m_dataYAxis.values[0].rows;
                var hData = m_dataRect.values[0].rows;

                var numCol = hCol.length;
                var numRow = hRow.length;

                valXValue = m_dataXAxis.values[0].rows[dataIndex%numCol].val;
                valYValue = m_dataYAxis.values[0].rows[Math.floor(dataIndex/numCol)].val;
            }

            m_tooltipElement.select("rect").attr("width", 160).attr("height", 78).attr("fill" , "rgb(255,255,255)");
            m_tooltipElement.attr("transform", "translate(" + (dataItem.left + dataItem.width/2 + 5) + "," + (dataItem.top + dataItem.height/2 + 5) + ")");
            if(!NumberUtils.isNoValue(dataItem.val))
            {
                m_tooltipElement.select(".valText").text(dataItem.val);
                m_tooltipElement.select(".valXValue").text(valXValue);
                m_tooltipElement.select(".valYValue").text(valYValue);

                m_tooltipElement.attr('visibility', 'visible');

                //guideline
                if(m_props.guideline.visible)
                {
                    m_guidline.select(".xGuidline").attr("x1", m_heatObjArray[dataIndex].left + m_heatObjArray[dataIndex].width/2).attr("x2", m_heatObjArray[dataIndex].left + m_heatObjArray[dataIndex].width/2);
                    m_guidline.select(".yGuidline").attr("y1", m_heatObjArray[dataIndex].top + m_heatObjArray[dataIndex].height/2).attr("y2", m_heatObjArray[dataIndex].top + m_heatObjArray[dataIndex].height/2);
                    m_guidline.attr('visibility', 'visible');
                }
            }            
        };

        var stringNoValueHandler = function(str)
        {
            if(str === null || str === undefined)
            {
                str = langManager.get('IDS_ISNOVALUE');
            }
            return str;
        }
        
        var generateTooltipData = function(dataIndex){
            //for heatmap, we only have one measure so that the body's length is always 1
            var tooltipData = {
                body:[],
                footer:[]
            };
            var dataItem = m_heatObjArray[dataIndex];
            var body = {
                    'name': stringNoValueHandler(m_dataRect.values[0].col),
                    val:[{
                        color: dataItem.color,
                        value: NumberUtils.isNoValue(dataItem.val)?m_defaultString:dataItem.val
                    }]
            };
            
            tooltipData.body.push(body);
            
            if(TypeUtils.isExist(m_dataXAxis)){
                for(var tval = m_dataXAxis.values, len = tval.length, i = len -1; i  >= 0; i--){
                    var footer = {};
                    footer.label = tval[i].col;
                    footer.value = tval[i].rows[dataIndex%tval[i].rows.length];
                    tooltipData.footer.push(footer);
                }
            }
            
            if(TypeUtils.isExist(m_dataYAxis)){
                var dataIndexInYAxis = Math.floor(dataIndex / m_dataXAxis.values[0].rows.length);
                for(var tval = m_dataYAxis.values, len = tval.length, i = len -1; i >= 0; i--){
                    var footer = {};
                    footer.label = tval[i].col;
                    footer.value = tval[i].rows[dataIndexInYAxis%tval[i].rows.length];
                    tooltipData.footer.push(footer);
                }
            }
            
            return tooltipData;
        };
        
        var hideTooltip = function(){
            m_tooltipElement.attr('visibility', 'hidden');
            m_guidline.attr('visibility', 'hidden');
        };

        var HLCell = function(item)
        {
            if(!NumberUtils.isNoValue(item.datum().val))
            {
                m_HLElement.attr("visibility", "visible");

                var iLeft = item.datum().left;
                var iRight = item.datum().left + item.datum().width;
                var iTop = item.datum().top;
                var iBottom = item.datum().top + item.datum().height;

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
        
        chart.afterUIComponentAppear = function(){
          m_dispatch.initialized(); 
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

            makeXScale();
            return chart;
        };

        chart.height = function(_height){
            if (!arguments.length){
              return m_height;
            }
            m_height = _height;
            
            makeYScale();
            return chart;       
        };

        chart.data = function(value){
            if (!arguments.length){
                return m_data;
            }

            m_data = value;
            m_redrawAll = true;
            
            m_dataXAxis = m_data.getAnalysisAxisDataByIdx(0);
            m_dataYAxis = m_data.getAnalysisAxisDataByIdx(1);
            m_dataRect = m_data.getMeasureValuesGroupDataByIdx(0);
            
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
            data = datapoints[i].__data__.val;
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
         
        chart.mbcLegendInfo = function(){
            var hColor = buildColorScale();
            return {
                'colorScale' : hColor,
                'title': m_dataRect.values[0].col
            };
        };

        chart.getPreferredSize = function(){
            
        };

        chart.categoryScaleX = function(){
            return m_xScale;
        };
       
        chart.isDrawXaxisBody = function(){
            var isOnlyOneCategroy = false;
            if(!m_dataYAxis)
            {
                isOnlyOneCategroy = true;
            }
            return (!isOnlyOneCategroy);
        };

        chart.categoryScaleY = function(){
            return m_yScale;
        };

        chart.dataLabel = function(_){
          
        };
        
        var buildColorScale = function()
        {
            //return a color scale like
            //var domainRg = [ [10,40], [40, 100] ];
            //var rangeRg = ['#ff0000', '#00ff00' ];
            //hColor = d3.scale.ordinal().domain(domainRg).range(rangeRg);

            var hColor = d3.scale.ordinal();

            //we need to draw some recs. So I will build a obj array, each item is a rec.
            var heatObjArray = [];
            
            var isOnlyOneCategroy = false;
            if(!m_dataYAxis)
            {
                isOnlyOneCategroy = true;
            }

            if(isOnlyOneCategroy)
            {
                var hData = m_dataRect.values[0].rows[0];
                //add the data to heatObjArray. the number of rectanges is the number of rectanglecolor.valuies.
                for(var i = 0; i < hData.length; i++)
                {
                    heatObjArray.push(hData[i]);
                }
            }
            else
            {
                //for the 2 categories, we have to count the numCol and the numRow.
                var hCol = m_dataXAxis.values[0].rows;
                var hRow = m_dataYAxis.values[0].rows;
                var hData = m_dataRect.values[0].rows;

                var numCol = hCol.length;
                var numRow = hRow.length;

                for(var i = 0; i < numRow; i++)
                {
                    for(var j = 0; j < numCol; j++)
                    {
                        heatObjArray.push(hData[i][j]);
                    }
                }
            }

            //count the max and min value of heatObjArray[i].val
            var maxVal = -Number.MAX_VALUE;
            var minVal = Number.MAX_VALUE;

            for(var iObj = 0; iObj < heatObjArray.length; iObj++)
            {
                if(!NumberUtils.isNoValue(heatObjArray[iObj].val))
                {
                    if(maxVal < heatObjArray[iObj].val)
                    {
                        maxVal = heatObjArray[iObj].val;
                    }

                    if(minVal > heatObjArray[iObj].val)
                    {
                        minVal = heatObjArray[iObj].val;
                    }
                }
            }
            //has "novalue" or not
            var hasNullValue = false;
            for(var i = 0; i < heatObjArray.length; i++)
            {
                if( NumberUtils.isNoValue(heatObjArray[i].val))
                {
                    hasNullValue = true;
                }
            }
            
            var numS = m_props.colornumber;

            var fontColorScale;
            if(minVal === Number.MAX_VALUE && maxVal === -Number.MAX_VALUE){
                fontColorScale = d3.scale.ordinal().domain([[]]).range([m_props.emptycolor]);
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
            // //build the color
            // var heatColor = d3.scale.linear()
                // .domain([minVal, maxVal])
                // .range([m_props.startcolor, m_props.endcolor]);

            // //build a d3.scale.ordinal() for legend
            // var domainRg = [];
            // var rangeRg = [];
            // for(var j = 0; j < (numS-1); j++)
            // {
                // domainRg.push( [minVal + (maxVal-minVal)/numS*j, (minVal + (maxVal-minVal)/numS*(j+1))] );
                // rangeRg.push( heatColor(minVal + (maxVal-minVal)/(numS-1)*j) );
            // }

            // domainRg.push( [minVal + (maxVal-minVal)/numS*(numS-1), maxVal] );
            // rangeRg.push( heatColor(maxVal) );



            // if(m_props.discretecolor)
            // {
                // var colorArray;
                // if(m_props.colorPalette.length == 0)
                // {
                    // colorArray = ColorSeries.sap32().range();
                // }
                // else
                // {
                    // colorArray = m_props.colorPalette;
                // }

                // var j = 0;
                // for(var i = 0; i < rangeRg.length; i++)
                // {
                    // rangeRg[i] = colorArray[j];
                    // j = (j+1)%(colorArray.length);
                // }
            // }

            // if(hasNULL) //no value
            // {
                // domainRg.push([]);
                // rangeRg.push(m_props.emptycolor);
            // }


            // hColor = d3.scale.ordinal().domain(domainRg).range(rangeRg);

            // return hColor;
        }

        var makeXScale = function()
        {
            var isOnlyOneCategroy = false;
            if(!m_dataYAxis)
            {
                isOnlyOneCategroy = true;
            }
            

            var hCol = m_dataXAxis.values[0].rows;
            var dArray = [];
            for(var i = 0; i < hCol.length; i++)
            {
                dArray.push(i);
            }

            m_xScale = m_xScale.domain(dArray)
                                .rangeBands([0, m_width]);
        };

        var makeYScale = function()
        {
            var isOnlyOneCategroy = false;
            if(!m_dataYAxis)
            {
                isOnlyOneCategroy = true;
            }
            
            if(isOnlyOneCategroy)
            {
                //no yAxis
                m_yScale = m_yScale.domain([0,0])
                                .rangeBands([0,0]);
            }
            else
            {
                var hRow = m_dataYAxis.values[0].rows;
                var dArray = [];
                for(var i = 0; i < hRow.length; i++)
                {
                    dArray.push(i);
                }

                //y is from bottom
                m_yScale = m_yScale.domain(dArray)
                                .rangeBands([m_height, 0]);
            }
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
        return chart;
    };

    return heatMap;
});