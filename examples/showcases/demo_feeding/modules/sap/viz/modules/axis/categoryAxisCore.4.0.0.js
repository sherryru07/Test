sap.riv.module(
{
  qname : 'sap.viz.modules.axis.categoryAxisCore',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.util.TextUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.NumberUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.threeD.Point',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.threeD.matrix',
  version : '4.0.0'
},
{  qname : 'sap.viz.format.FormatManager',
  version : '4.0.0'
}
],
function Setup(TextUtils, NumberUtils, Objects, langManager, TypeUtils, Point, matrix, FormatManager) {

  return function() {
        
        var m_position;
        var m_axScale;

        var m_textOffset = 6;
        var m_tickSize = 5;
        
        var m_styleLineSrokeWidth = 1;
        var m_styleGridLineColor = "#d8d8d8";

        var m_disableSpaceLimit = false;
        
        var m_style = null; //used to hold style passed from axis
        var m_props = 
        { 
            "title": {"visible": false, "text": undefined,},
            "gridline": {"visible": false, "color": m_styleGridLineColor, "showFirstLine": false, "length": 0, "showLastLine": false, "type":"line"},
            "type" : "value",
            "visible" : true,
            "label": {"visible": true, "formatString": "", hideStrategy : '' },
            "position": "left",
            "color": "#333333",
            "shapeRendering": true,
            "forceVerticalFont": false
        }; 

        var m_matrix = matrix(), labelAngle = null, labelAlign=null, angle = null, tickAngle = null;
        
        var m_spaceLimit = -1;
        axis.spaceLimit = function(_spaceLimit)
        {
            if (!arguments.length) 
                return m_spaceLimit;

            if(!m_disableSpaceLimit)
            {
                m_spaceLimit = _spaceLimit;
            }

            return axis;
        }

        var adjustScale = function()
        {
            //we have to adjust the scale because we may not draw all the levels.
            var scaleToDraw = [];
            var isMutilayer = m_axScale.length > 1 ? true : false;
            
            for(var iScale = 0; iScale < m_axScale.length; iScale++)
            {
                var axDomain = m_axScale[iScale].domain;//["a", "b"]
                var axRange = m_axScale[iScale].range;//[[0, 100], [100. 200], ...]

                //count the max text size
                var re = maxLabelTextHeight(axDomain, axRange);
                var isVertical = re.isVertical;

                if(m_position == "left" || m_position == "right")
                {
                    m_axScale[iScale].labelsToDraw = buildLeftRightToDrawLabels(axDomain, axRange, isMutilayer);
                }
                else
                {
                    m_axScale[iScale].labelsToDraw = buildTopBottomToDrawLabels(axDomain, axRange, isVertical, isMutilayer);
                }
                
                if(iScale === 0){
                  scaleToDraw.push(m_axScale[iScale]);
                }
                else if(m_axScale[iScale].labelsToDraw.length == m_axScale[iScale].domain.length)
                {
                  scaleToDraw.push(m_axScale[iScale]);
                }
                //for mekko chart ,the scale is not equal. So if a label can be draw, we should draw the whole layer.
                else if(m_axScale[iScale].labelsToDraw.length > 0 && TypeUtils.isExist(m_axScale.noEqual)&&m_axScale.noEqual === true )
                {
                  scaleToDraw.push(m_axScale[iScale]);
                }
            }
            return scaleToDraw;
        }
        
        var drawGridLine = function(selection, x1, y1, x2, y2){
          var gridline = selection.append("line")
                          .attr("y1", y1)
                          .attr("y2", y2)
                          .attr("x1", x1)
                          .attr("x2", x2)
                          .attr("stroke", m_props.gridline.color)
                          .attr("stroke-width", m_props.gridline.size)
                          .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
          if(m_props.gridline.type == "dotted")
          {
               gridline.attr("stroke-dasharray", "3, 2");
          }                        
        };

        function axis(selection)
        {
            //we have to adjust the scale
            var scaleToDraw = adjustScale();

            //---we should dicide show or hide somethings because of the spaceLimit
            if(m_spaceLimit >= 0)
            {
                var scaleToAdjust = [];
                var spacings = axis.getPreferredSize().spacings;
                var spaceLeft = m_spaceLimit;


                for(var i = 0; i < spacings.length; i++)
                {
                    if(spaceLeft >= spacings[i])
                    {
                        scaleToAdjust.push(scaleToDraw[i]);
                        spaceLeft -= spacings[i];
                    }
                    else
                    {
                        break;
                    }
                }

                if(scaleToAdjust.length == 0 && scaleToDraw.length > 0)
                {
                    //scaleToAdjust.push(scaleToDraw[0]);//always draw one
                    var lastDomain = [];
                    for (var i = 0; i < scaleToDraw[0].domain.length; i++) {
                        lastDomain.push('');
                    }
                    scaleToAdjust.push({
                            domain : lastDomain, 
                            range : scaleToDraw[0].range
                        });
                }

                scaleToDraw = scaleToAdjust;
            }
            //------------------------------------------------------
            var isMutilayer = scaleToDraw.length > 1 ? true : false;
            if(m_position == "left")
            {
                var iDraw = 0;
                var lastLevelWidth = 0;
                
                for(var iScale = 0; iScale < scaleToDraw.length; iScale++, iDraw++)
                {
                    if(!m_props.label.visible && iScale != (scaleToDraw.length-1))
                    {
                        continue;
                    }

                    var axDomain = scaleToDraw[iScale].domain;//["a", "b"]
                    var axRange = scaleToDraw[iScale].range;//[[0, 100], [100. 200], ...]

                    //count the max text size
                    var re = maxLabelTextWidth(axDomain, axRange);
                    var maxTextWidth = re.maxLabelTextWidth;
                    //var isVertical = re.isVertical;

                    if(!m_props.label.visible)
                    {
                        maxTextWidth = 0;
                    }
                    
                    
                      
                    if(iScale == (scaleToDraw.length-1))
                    {
                        if(m_props.gridline.showFirstLine)
                        {
                            drawGridLine(selection,
                                  lastLevelWidth + (maxTextWidth + 2*m_textOffset), 
                                  axRange[axRange.length-1][1], 
                                  lastLevelWidth + (maxTextWidth + 2*m_textOffset) + m_props.gridline.length, 
                                  axRange[axRange.length-1][1]);
                        }

                        if(m_props.gridline.showLastLine)
                        {
                            drawGridLine(selection,
                                  lastLevelWidth + (maxTextWidth + 2*m_textOffset), 
                                  axRange[0][0], 
                                  lastLevelWidth + (maxTextWidth + 2*m_textOffset) + m_props.gridline.length, 
                                  axRange[0][0]);
                        }
                    }

                    ///////////////drawing the most inner vertical line////////////////
                    if( scaleToDraw.length == 1 ) {
                        ////////////////in single case, also include the first and last tick////////
                        //<path d="M150 0 L75 200 L225 200 Z" />
                        var x1 = lastLevelWidth + (maxTextWidth + 2*m_textOffset);
                        var x2 = lastLevelWidth + (maxTextWidth + 2*m_textOffset);
                        var y1 = axRange[0][0];
                        var y2 = axRange[axRange.length-1][1];

                        var dPath  = "M" + (x1-m_tickSize) + " " + y1
                            dPath += "L" + x1 + " " + y1;
                            dPath += "L" + x2 + " " + y2;
                            dPath += "L" + (x2-m_tickSize) + " " + y2;

                        var axLine = selection.append("path")
                                    .attr("d", dPath)
                                    .attr("fill", "none")
                                    .attr("stroke", m_props.color)
                                    .attr("stroke-width", m_props.lineSize)
                                    .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");

                    }else if(scaleToDraw.length >= 2 && (iScale == scaleToDraw.length -1)) {
                        var axLine = selection.append("line")
                                    .attr("x1", lastLevelWidth + (maxTextWidth + 2*m_textOffset))
                                    .attr("x2", lastLevelWidth + (maxTextWidth + 2*m_textOffset))
                                    .attr("y1", axRange[0][0])
                                    .attr("y2", axRange[axRange.length-1][1])
                                    .attr("class", "domain")
                                    .attr("stroke", m_props.color)
                                    .attr("stroke-width", m_props.lineSize)
                                    .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                    }
                    /////////////// end of drawing the most inner vertical line////////////////


                    ///////////////drawing vertical line for each level, based on lastLevelWidth///// 
                    if(scaleToDraw.length >= 2 && m_props.label.visible)
                    {
                         selection.append("line")
                        .attr("x1", lastLevelWidth)
                        .attr("x2", lastLevelWidth)
                        .attr("y1", axRange[0][0])
                        .attr("y2", axRange[axRange.length-1][1])
                        .attr("class", "domain")
                        .attr("stroke", m_props.color)
                        .attr("stroke-width", m_props.lineSize)
                        .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                    }
                    ///////////////end of drawing vertical line for each level, based on lastLevelWidth/////

                    //draw gridline in the last scaleToDraw///////////////////////
                    //FIXME Jimmy/9/22/2012 currently the grid line only used for
                    //multi charts. we have a bug for the last gridline here, if for example
                    //we draw gridline for yaxis on [i][1], then the last gridline
                    //will override xaxis. so we have to seperate last gridline
                    if(m_props.gridline.visible && iScale == (scaleToDraw.length-1)){
                      for(var i = 0; i < axDomain.length; i++)
                      {
                        drawGridLine(selection,
                                lastLevelWidth + (maxTextWidth + 2*m_textOffset), 
                                axRange[i][0], 
                                lastLevelWidth + (maxTextWidth + 2*m_textOffset) + m_props.gridline.length, 
                                axRange[i][0]);
                        if((i == (axDomain.length - 1)) || (axRange[i][1] != axRange[i+1][0])){
                          drawGridLine(selection,
                                lastLevelWidth + (maxTextWidth + 2*m_textOffset), 
                                axRange[i][1], 
                                lastLevelWidth + (maxTextWidth + 2*m_textOffset) + m_props.gridline.length, 
                                axRange[i][1]);
                        }
                      }
                      //we need an extra line to close the gridline area, otherwise, if we have only one axis, the gridline area will be kept open
                      drawGridLine(selection,
                                lastLevelWidth + (maxTextWidth + 2*m_textOffset) + m_props.gridline.length,
                                axRange[0][0], 
                                lastLevelWidth + (maxTextWidth + 2*m_textOffset) + m_props.gridline.length,
                                axRange[i - 1][1]
                                );
                    }
                    //end draw gridline in the last scaleToDraw///////////////////////


                    for(var i = 0; i < axDomain.length; i++)
                    {
                        /////////////////////////////draw tick for single case, horizontal line for multi case////////
                        if(scaleToDraw.length == 1 || (scaleToDraw.length != 1 && !m_props.label.visible))//draw ticks
                        {
                          //Jimmy/9/22/2012 to @Catkin, in which scenario axRange[i][0] will not be equal with axRange[i-1][1]?
                          if(i > 0 && (axRange[i][0] != axRange[i-1][1]))
                          {
                              var axTick1 = selection.append("line")
                                          .attr("x1", (maxTextWidth + 2*m_textOffset) - m_tickSize)
                                          .attr("x2", (maxTextWidth + 2*m_textOffset))
                                          .attr("y1", axRange[i][0])
                                          .attr("y2", axRange[i][0])
                                          .attr("stroke", m_props.color)
                                          .attr("stroke-width", m_props.lineSize)
                                          .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");

                          }
                          
                          ////////////////in single case, first and last tick is already drawn in path, ignore them here////////
                          if(i != (axDomain.length - 1)){
                            var axTick2 = selection.append("line")
                                        .attr("x1", (maxTextWidth + 2*m_textOffset) - m_tickSize)
                                        .attr("x2", (maxTextWidth + 2*m_textOffset))
                                        .attr("y1", axRange[i][1])
                                        .attr("y2", axRange[i][1])
                                        .attr("stroke", m_props.color)
                                        .attr("stroke-width", m_props.lineSize)
                                        .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                          }
                        }
                                      
                        if(scaleToDraw.length >= 2 && m_props.label.visible)
                        {
                             selection.append("line")
                            .attr("x1", lastLevelWidth)
                            .attr("x2", lastLevelWidth + (maxTextWidth + 2*m_textOffset))
                            .attr("y1", axRange[i][0])
                            .attr("y2", axRange[i][0])
                            .attr("stroke", m_props.color)
                            .attr("stroke-width", m_props.lineSize)
                            .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                            
                            //Jimmy/9/22/2012 to @Catkin, in which scenario axRange[i][1] will not be equal with axRange[i+1][0]?
                            if((i == (axDomain.length - 1)) || (axRange[i][1] != axRange[i+1][0])){
                               selection.append("line")
                              .attr("x1", lastLevelWidth)
                              .attr("x2", lastLevelWidth + (maxTextWidth + 2*m_textOffset))
                              .attr("y1", axRange[i][1])
                              .attr("y2", axRange[i][1])
                              .attr("stroke", m_props.color)
                              .attr("stroke-width", m_props.lineSize)
                              .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto"); 
                            }
                        }
                        /////////////////////////////draw tick for single case, horizontal line for multi case////////
                    }

                    var labelsToDraw = scaleToDraw[iScale].labelsToDraw;
                    var customlabelCfg;
                    for(var i = 0; i < labelsToDraw.length; i++)
                    {
                      customlabelCfg = labelsToDraw[i].custom;
                      if(customlabelCfg && customlabelCfg.type === 'url'){
                        //draw as an icon, same size as text
                      }else{
                        var m_label = TypeUtils.isExist(labelsToDraw[i].text)? labelsToDraw[i].text:'';
                        if(m_props.label.visible)
                        {
                            //selection.append("circle").attr("cx", lastLevelWidth + maxTextWidth - m_textOffset).attr("cy", axRange[i][0] + (axRange[i][1] - axRange[i][0])/2). attr("r", 3);
                            var axLabels = selection.append("text")
                                          .attr("x", lastLevelWidth + maxTextWidth + m_textOffset)
                                          .attr("y", labelsToDraw[i].y)
                                          .attr("dominant-baseline", "middle")//"auto")//"hanging")//"central")
                                          .attr("text-anchor", "end") // text-align
                                          .text(m_label)
                                          .attr("fill", m_style.label.fill)
                                          .attr("font-size", m_style.label['font-size'])
                                          .attr("font-weight", m_style.label['font-weight'])
                                          .attr("font-family", m_style.label['font-family']); 

                            adjustLabelForIE(axLabels);
                        }   
                      }
                    }

                    lastLevelWidth += (maxTextWidth + 2*m_textOffset);
                }
            }
            else if(m_position == "right")
            {
                var iDraw = 0;
                var lastLevelWidth = 0;
                
                for(var iScale = (scaleToDraw.length-1); iScale >= 0; iScale--, iDraw++)
                {
                    if(!m_props.label.visible && iScale != (scaleToDraw.length-1))
                    {
                        continue;
                    }

                    var axDomain = scaleToDraw[iScale].domain;//["a", "b"]
                    var axRange = scaleToDraw[iScale].range;//[[0, 100], [100. 200], ...]

                    //count the max text size
                    var re = maxLabelTextWidth(axDomain, axRange);
                    var maxTextWidth = re.maxLabelTextWidth;
                    //var isVertical = re.isVertical;

                    if(iScale == (scaleToDraw.length-1))
                    {
                        if(m_props.gridline.showFirstLine)
                        {
                            drawGridLine(selection,
                                  lastLevelWidth, 
                                  axRange[axRange.length-1][1], 
                                  lastLevelWidth-m_props.gridline.length, 
                                  axRange[axRange.length-1][1]);
                        }

                        if(m_props.gridline.showLastLine)
                        {
                            drawGridLine(selection,
                                  lastLevelWidth, 
                                  axRange[0][0], 
                                  lastLevelWidth-m_props.gridline.length, 
                                  axRange[0][0]);
                        }
                    }

                    if((scaleToDraw.length == 1) )
                    {
                        //<path d="M150 0 L75 200 L225 200 Z" />
                        var x1 = lastLevelWidth;
                        var x2 = lastLevelWidth;
                        var y1 = axRange[0][0];
                        var y2 = axRange[axRange.length-1][1];

                        var dPath  = "M" + (x1+m_tickSize) + " " + y1
                            dPath += "L" + x1 + " " + y1;
                            dPath += "L" + x2 + " " + y2;
                            dPath += "L" + (x1+m_tickSize) + " " + y2;

                        var axLine = selection.append("path")
                                    .attr("d", dPath)
                                    .attr("fill", "none")
                                    .attr("stroke", m_props.color)
                                    .attr("stroke-width", m_props.lineSize)
                                    .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                    }
                    else if(scaleToDraw.length >= 2 && (iScale == (scaleToDraw.length-1)) ) 
                    {
                        var axLine = selection.append("line")
                                    .attr("x1", lastLevelWidth)
                                    .attr("x2", lastLevelWidth)
                                    .attr("y1", axRange[0][0])
                                    .attr("y2", axRange[axRange.length-1][1])
                                    .attr("stroke", m_props.color)
                                    .attr("stroke-width", m_props.lineSize)
                                    .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                    }

                    if(scaleToDraw.length >= 2 && m_props.label.visible)
                    {
                         selection.append("line")
                        .attr("x1", lastLevelWidth + (maxTextWidth + 2*m_textOffset))
                        .attr("x2", lastLevelWidth + (maxTextWidth + 2*m_textOffset))
                        .attr("y1", axRange[0][0])
                        .attr("y2", axRange[axRange.length-1][1])
                        .attr("stroke", m_props.color)
                        .attr("stroke-width", m_props.lineSize)
                        .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                    }
                    
                    if(m_props.gridline.visible && iScale == (scaleToDraw.length-1)){
                      for(var i = 0; i < axDomain.length; i++)
                      {
                        drawGridLine(selection,
                                lastLevelWidth + (maxTextWidth + 2*m_textOffset), 
                                axRange[i][0], 
                                lastLevelWidth + (maxTextWidth + 2*m_textOffset) + m_props.gridline.length, 
                                axRange[i][0]);
                        if((i == (axDomain.length - 1)) || (axRange[i][1] != axRange[i+1][0])){
                          drawGridLine(selection,
                                lastLevelWidth + (maxTextWidth + 2*m_textOffset), 
                                axRange[i][1], 
                                lastLevelWidth + (maxTextWidth + 2*m_textOffset) + m_props.gridline.length, 
                                axRange[i][1]);
                        }
                      }

                    }

                    for(var i = 0; i < axDomain.length; i++)
                    {
                        if(scaleToDraw.length == 1 || (scaleToDraw.length != 1 && !m_props.label.visible))//draw ticks
                        {
                            if(i > 0 && (axRange[i][0] != axRange[i-1][1]))
                            {
                                var axTick1 = selection.append("line")
                                            .attr("x1", 0)
                                            .attr("x2", m_tickSize)
                                            .attr("y1", axRange[i][0])
                                            .attr("y2", axRange[i][0])
                                            .attr("stroke", m_props.color)
                                            .attr("stroke-width", m_props.lineSize)
                                            .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                            }
                            if(i != (axDomain.length - 1)){
                              var axTick2 = selection.append("line")
                                          .attr("x1", 0)
                                          .attr("x2", m_tickSize)
                                          .attr("y1", axRange[i][1])
                                          .attr("y2", axRange[i][1])
                                          .attr("stroke", m_props.color)
                                          .attr("stroke-width", m_props.lineSize)
                                          .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                            }
                        }
                                      
                        if(scaleToDraw.length >= 2 && m_props.label.visible)
                        {
                             selection.append("line")
                            .attr("x1", lastLevelWidth)
                            .attr("x2", lastLevelWidth + (maxTextWidth + 2*m_textOffset))
                            .attr("y1", axRange[i][0])
                            .attr("y2", axRange[i][0])
                            .attr("stroke", m_props.color)
                            .attr("stroke-width", 1)
                            .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                            
                            if((i == (axDomain.length - 1)) || (axRange[i][1] != axRange[i+1][0])){
                               selection.append("line")
                              .attr("x1", lastLevelWidth)
                              .attr("x2", lastLevelWidth + (maxTextWidth + 2*m_textOffset))
                              .attr("y1", axRange[i][1])
                              .attr("y2", axRange[i][1])
                              .attr("stroke", m_props.color)
                              .attr("stroke-width", m_props.lineSize)
                              .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                            }
                        }
                    }

                    var labelsToDraw = scaleToDraw[iScale].labelsToDraw;
                    var customlabelCfg;
                    for(var i = 0; i < labelsToDraw.length; i++)
                    {
                      customlabelCfg = labelsToDraw[i].custom;
                      if(customlabelCfg && customlabelCfg.type === 'url'){
                        //draw as an icon, same size as text
                      }else{
                        var m_label = TypeUtils.isExist(labelsToDraw[i].text)? labelsToDraw[i].text:'';
                        if(m_props.label.visible)
                        {
                            //selection.append("circle").attr("cx", lastLevelWidth + 100000).attr("cy", axRange[i][0] + (axRange[i][1] - axRange[i][0])/2). attr("r", 3);
                            var axLabels = selection.append("text")
                                          .attr("x", lastLevelWidth + m_textOffset)
                                          .attr("y", labelsToDraw[i].y)
                                          .attr("text-anchor", "start") // text-align
                                          .attr("dominant-baseline", "middle")//"auto")//"hanging")//"central")
                                          .text(m_label)
                                          .attr("fill", m_style.label.fill)
                                          .attr("font-size", m_style.label['font-size'])
                                          .attr("font-weight", m_style.label['font-weight'])
                                          .attr("font-family", m_style.label['font-family']); 

                            adjustLabelForIE(axLabels);
                        }
                      }
                    }
                    
                    lastLevelWidth += (maxTextWidth + 2*m_textOffset);
                }
            }
            else if(m_position == "bottom")
            {
                var iDraw = 0;
                var lastLevelHeight = 0;
                
                for(var iScale = (scaleToDraw.length - 1); iScale >= 0; iScale--, iDraw++)
                {
                    if(!m_props.label.visible && iScale != (scaleToDraw.length-1))
                    {
                        continue;
                    }

                    var axDomain = scaleToDraw[iScale].domain;//["a", "b"]
                    var axRange = scaleToDraw[iScale].range;//[[0, 100], [100. 200], ...]

                    //count the max text size
                    var re = maxLabelTextHeight(axDomain, axRange);
                    var maxTextHeight = re.maxLabelTextHeight;
                    var isVertical = re.isVertical;

                    if(iScale == (scaleToDraw.length - 1))
                    {
                        if(m_props.gridline.showFirstLine)
                        {
                            drawGridLine(selection,
                                  axRange[0][0],  
                                  lastLevelHeight, 
                                  axRange[0][0],
                                  lastLevelHeight-m_props.gridline.length
                                  );
                        }

                        if(m_props.gridline.showLastLine)
                        {
                            drawGridLine(selection,
                                  axRange[axRange.length-1][0],  
                                  lastLevelHeight, 
                                  axRange[axRange.length-1][0],
                                  lastLevelHeight-m_props.gridline.length
                                  );
                        }
                    }

                    if(scaleToDraw.length == 1)
                    {
                        var x1 = axRange[0][0];
                        var x2 = axRange[axRange.length-1][1];
                        var y1 = lastLevelHeight;
                        var y2 = lastLevelHeight;

                        var dPath  = "M" + x1 + " " + (y1+m_tickSize);
                            dPath += "L" + x1 + " " + y1;
                            dPath += "L" + x2 + " " + y2;
                            dPath += "L" + x2 + " " + (y2+m_tickSize);

                        var axLine = selection.append("path")
                                    .attr("d", dPath)
                                    .attr("fill", "none")
                                    .attr("stroke", m_props.color)
                                    .attr("stroke-width", m_props.lineSize)
                                    .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                        
                        if(angle){
                          var aAngle = angle * Math.PI /180;
                          var cosAngle = Math.cos(aAngle);
                          var sinAngle = (45 == angle)? cosAngle: Math.sin(aAngle); 
                          dPath = 'M ' + axRange[0][0] + ' ' + lastLevelHeight;
                          dPath += 'L' + (axRange[0][0] + axRange[axRange.length-1][1] * sinAngle) + ' ' + (lastLevelHeight - axRange[axRange.length-1][1] * cosAngle);
                          dPath += 'Z';
                          
                          axLine.attr('d', dPath);
                        }
                    }
                    else if( scaleToDraw.length >= 2 && (iScale == scaleToDraw.length-1) )
                    {
                        var axLine = selection.append("line")
                                    .attr("x1", axRange[0][0])
                                    .attr("x2", axRange[axRange.length-1][1])
                                    .attr("y1", lastLevelHeight)
                                    .attr("y2", lastLevelHeight)
                                    .attr("stroke", m_props.color)
                                    .attr("stroke-width", m_props.lineSize)
                                    .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                    }

                    if(scaleToDraw.length >= 2 && m_props.label.visible)
                    {
                         selection.append("line")
                        .attr("x1", axRange[0][0])
                        .attr("x2", axRange[axRange.length-1][1])
                        .attr("y1", lastLevelHeight + maxTextHeight + 2*m_textOffset)
                        .attr("y2", lastLevelHeight + maxTextHeight + 2*m_textOffset)
                        .attr("stroke", m_props.color)
                        .attr("stroke-width", m_props.lineSize)
                        .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                    }
                    
                    //draw gridline in the last scaleToDraw///////////////////////
                    if(m_props.gridline.visible && iScale == (scaleToDraw.length-1)){
                      for(var i = 0; i < axDomain.length; i++)
                      {
                        drawGridLine(selection,
                                axRange[i][0],
                                lastLevelHeight + (maxTextHeight + 2*m_textOffset),
                                axRange[i][0],
                                lastLevelHeight + (maxTextHeight + 2*m_textOffset) + m_props.gridline.length 
                                );
                        if((i == (axDomain.length - 1)) || (axRange[i][1] != axRange[i+1][0])){
                          drawGridLine(selection,
                                axRange[i][1],
                                lastLevelHeight + (maxTextHeight + 2*m_textOffset), 
                                axRange[i][1],
                                lastLevelHeight + (maxTextHeight + 2*m_textOffset) + m_props.gridline.length 
                                );
                        }
                      }
                    }
                    //end draw gridline in the last scaleToDraw///////////////////////


                    for(var i = 0; i < axDomain.length; i++)
                    {
                        if(scaleToDraw.length == 1 || (scaleToDraw.length != 1 && !m_props.label.visible))//draw ticks
                        {
                            if(i > 0 && (axRange[i][0] != axRange[i-1][1]))
                            {
                                var axTick1 = selection.append("line")
                                            .attr("x1", axRange[i][0])
                                            .attr("x2", axRange[i][0])
                                            .attr("y1", 0)
                                            .attr("y2", m_tickSize)
                                            .attr("stroke", m_props.color)
                                            .attr("stroke-width", m_props.lineSize)
                                            .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                            }
                            if(i != (axDomain.length - 1)){
                              var axTick2 = selection.append("line")
                                          .attr("x1", axRange[i][1])
                                          .attr("x2", axRange[i][1])
                                          .attr("y1", 0)
                                          .attr("y2", m_tickSize)
                                          .attr("stroke", m_props.color)
                                          .attr("stroke-width", m_props.lineSize)
                                          .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                              
                              if(angle){
                                var aAngle = angle * Math.PI /180;
                                var cosAngle = Math.cos(aAngle);
                                var sinAngle = (45 === angle) ? cosAngle : Math.sin(aAngle);
                                var tAngle = tickAngle * Math.PI / 180;
                                var cosTAngle = Math.cos(tAngle);
                                var sinTAngle = Math.sin(tAngle);
                                
                                var tickStartX  =   axRange[i][1] * sinAngle;
                                tickStartY =  -axRange[i][1] * cosAngle;
                                var x2 = tickStartX + m_tickSize * cosTAngle,
                                  y2 = tickStartY + m_tickSize * sinTAngle;
                                  
                                axTick2.attr('x1', tickStartX).attr('y1', tickStartY).attr('x2', x2).attr('y2', y2);  
                                }
                              
                            }
                        }
                                      
                        if(scaleToDraw.length >= 2 && m_props.label.visible)
                        {
                             selection.append("line")
                            .attr("x1", axRange[i][0])
                            .attr("x2", axRange[i][0])
                            .attr("y1", lastLevelHeight)
                            .attr("y2", lastLevelHeight + 2*m_textOffset + maxTextHeight)
                            .attr("stroke", m_props.color)
                            .attr("stroke-width", m_props.lineSize)
                            .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                             
                            if((i == (axDomain.length - 1)) || (axRange[i][1] != axRange[i+1][0])){
                               selection.append("line")
                              .attr("x1", axRange[i][1])
                              .attr("x2", axRange[i][1])
                              .attr("y1", lastLevelHeight)
                              .attr("y2", lastLevelHeight + 2*m_textOffset + maxTextHeight)
                              .attr("stroke", m_props.color)
                              .attr("stroke-width", m_props.lineSize)
                              .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                            }
                        }
                    }

                    var labelsToDraw = scaleToDraw[iScale].labelsToDraw;
                    drawTopBottomLabels(selection, labelsToDraw, lastLevelHeight, maxTextHeight, axDomain, isVertical, scaleToDraw.length != 1);

                    lastLevelHeight += (maxTextHeight + 2*m_textOffset);
                }
            }
            else if(m_position == "top")
            {
                var iDraw = 0;
                var lastLevelHeight = 0;
                
                for(var iScale = 0; iScale < scaleToDraw.length; iScale++, iDraw++)
                {
                    if(!m_props.label.visible && iScale != (scaleToDraw.length-1))
                    {
                        continue;
                    }

                    var axDomain = scaleToDraw[iScale].domain;//["a", "b"]
                    var axRange = scaleToDraw[iScale].range;//[[0, 100], [100. 200], ...]

                    //count the max text size
                    var re = maxLabelTextHeight(axDomain, axRange);
                    var maxTextHeight = re.maxLabelTextHeight;
                    var isVertical = re.isVertical;

                    if(!m_props.label.visible)
                    {
                        maxTextHeight = 0;
                    }

                    if(iScale == (scaleToDraw.length-1))
                    {
                        if(m_props.gridline.showFirstLine)
                        {
                            drawGridLine(selection,
                                  axRange[0][0],  
                                  maxTextHeight + 2*m_textOffset + lastLevelHeight, 
                                  axRange[0][0],
                                  maxTextHeight + 2*m_textOffset + lastLevelHeight+m_props.gridline.length
                                  );
                        }

                        if(m_props.gridline.showLastLine)
                        {
                            drawGridLine(selection,
                                  axRange[axRange.length-1][1],  
                                  maxTextHeight + 2*m_textOffset + lastLevelHeight, 
                                  axRange[axRange.length-1][1],
                                  maxTextHeight + 2*m_textOffset + lastLevelHeight+m_props.gridline.length
                                  );
                        }
                    }

                    if( (scaleToDraw.length == 1) )
                    {
                        var x1 = axRange[0][0];
                        var x2 = axRange[axRange.length-1][1];
                        var y1 = maxTextHeight + 2*m_textOffset + lastLevelHeight;
                        var y2 = maxTextHeight + 2*m_textOffset + lastLevelHeight;

                        var dPath  = "M" + x1 + " " + (y1-m_tickSize);
                            dPath += "L" + x1 + " " + y1;
                            dPath += "L" + x2 + " " + y2;
                            dPath += "L" + x2 + " " + (y2-m_tickSize);

                        var axLine = selection.append("path")
                                    .attr("d", dPath)
                                    .attr("fill", "none")
                                    .attr("stroke", m_props.color)
                                    .attr("stroke-width", m_props.lineSize)
                                    .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                    }
                    else if( scaleToDraw.length >= 2 && (iScale == scaleToDraw.length-1) )
                    {
                        var axLine = selection.append("line")
                                    .attr("x1", axRange[0][0])
                                    .attr("x2", axRange[axRange.length-1][1])
                                    .attr("y1", maxTextHeight + 2*m_textOffset + lastLevelHeight)
                                    .attr("y2", maxTextHeight + 2*m_textOffset + lastLevelHeight)
                                    .attr("stroke", m_props.color)
                                    .attr("stroke-width", m_props.lineSize)
                                    .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                    }

                    if(scaleToDraw.length >= 2 && m_props.label.visible)
                    {
                         selection.append("line")
                        .attr("x1", axRange[0][0])
                        .attr("x2", axRange[axRange.length-1][1])
                        .attr("y1", lastLevelHeight)
                        .attr("y2", lastLevelHeight)
                        .attr("stroke", m_props.color)
                        .attr("stroke-width", m_props.lineSize)
                        .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                    }
                    
                    //draw gridline in the last scaleToDraw///////////////////////
                    if(m_props.gridline.visible && iScale == (scaleToDraw.length-1)){
                      for(var i = 0; i < axDomain.length; i++)
                      {
                        drawGridLine(selection,
                                axRange[i][0],
                                lastLevelHeight + (maxTextHeight + 2*m_textOffset),
                                axRange[i][0],
                                lastLevelHeight + (maxTextHeight + 2*m_textOffset) + m_props.gridline.length 
                                );
                        if((i == (axDomain.length - 1)) || (axRange[i][1] != axRange[i+1][0])){
                          drawGridLine(selection,
                                axRange[i][1],
                                lastLevelHeight + (maxTextHeight + 2*m_textOffset), 
                                axRange[i][1],
                                lastLevelHeight + (maxTextHeight + 2*m_textOffset) + m_props.gridline.length 
                                );
                        }
                      }
                      //we need an extra line to close the gridline area, otherwise, if we have only one axis, the gridline area will be kept open
                      drawGridLine(selection,
                                axRange[0][0],
                                lastLevelHeight + (maxTextHeight + 2*m_textOffset) + m_props.gridline.length, 
                                axRange[i - 1][1],
                                lastLevelHeight + (maxTextHeight + 2*m_textOffset) + m_props.gridline.length 
                                );
                    }
                    //end draw gridline in the last scaleToDraw///////////////////////

                    for(var i = 0; i < axDomain.length; i++)
                    {
                        if(scaleToDraw.length == 1 || (scaleToDraw.length != 1 && !m_props.label.visible))//draw ticks
                        {
                            if(i > 0 && (axRange[i][0] != axRange[i-1][1]))
                            {
                                var axTick1 = selection.append("line")
                                            .attr("x1", axRange[i][0])
                                            .attr("x2", axRange[i][0])
                                            .attr("y1", (maxTextHeight + 2*m_textOffset))
                                            .attr("y2", (maxTextHeight + 2*m_textOffset)-m_tickSize)
                                            .attr("stroke", m_props.color)
                                            .attr("stroke-width", m_props.lineSize)
                                            .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                            }
                            
                            ////////////////in single case, first and last tick is already drawn in path, ignore them here////////
                          if(i != (axDomain.length - 1)){
                            var axTick2 = selection.append("line")
                                        .attr("x1", axRange[i][1])
                                        .attr("x2", axRange[i][1])
                                        .attr("y1", (maxTextHeight + 2*m_textOffset))
                                        .attr("y2", (maxTextHeight + 2*m_textOffset)-m_tickSize)
                                        .attr("stroke", m_props.color)
                                        .attr("stroke-width", m_props.lineSize)
                                        .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                          }
                        }
                                      
                        if(scaleToDraw.length >= 2 && m_props.label.visible)
                        {
                             selection.append("line")
                            .attr("x1", axRange[i][0])
                            .attr("x2", axRange[i][0])
                            .attr("y1", lastLevelHeight)
                            .attr("y2", lastLevelHeight + (maxTextHeight + 2*m_textOffset))
                            .attr("stroke", m_props.color)
                            .attr("stroke-width", m_props.lineSize)
                            .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                             
                            //Jimmy/9/22/2012 to @Catkin, in which scenario axRange[i][1] will not be equal with axRange[i+1][0]?
                            if((i == (axDomain.length - 1)) || (axRange[i][1] != axRange[i+1][0])){
                               selection.append("line")
                              .attr("x1", axRange[i][1])
                              .attr("x2", axRange[i][1])
                              .attr("y1", lastLevelHeight)
                              .attr("y2", lastLevelHeight + (maxTextHeight + 2*m_textOffset))
                              .attr("stroke", m_props.color)
                              .attr("stroke-width", m_props.lineSize)
                              .attr("shape-rendering", m_props.shapeRendering ? "crispEdges": "auto");
                            }
                        }
                    }

                    var labelsToDraw = scaleToDraw[iScale].labelsToDraw;
                    drawTopBottomLabels(selection, labelsToDraw, lastLevelHeight, maxTextHeight, axDomain, isVertical, scaleToDraw.length != 1);
                    lastLevelHeight += (maxTextHeight + 2*m_textOffset);
                }
            }

        };

        var adjustLabelForIE = function(text)
        {
            if(jQuery.browser.msie)
            {
                //dominant-baseline does not work
                var textHeight = m_style.label['font-size'].toString();
                var indexPX = textHeight.indexOf("px");
                if(indexPX >= 0)
                {
                    textHeight = textHeight.substr(0, indexPX);
                }

                //textHeight = fastMeasure(text, m_style.label).height;
                var y = text.attr("y");
                text.attr("y", Number(y) + textHeight/2);
                text.attr("dominant-baseline", "auto");
            }
        }

        //get customlabel text from from the rawObj, if the type is url, return the original text
        var getCustomlabelText = function(rawObj){
          var ret;
          if(rawObj.info){
            var clobj = rawObj.info.customlabel;
            if(clobj){
              if(clobj.type === 'url'){
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
          //so we will first resolve customlabel and then do format
          ret = isInvalidString(ret) ? langManager.get('IDS_ISNOVALUE'): ret;
          ret = FormatManager.format(ret, m_props.label.formatString);
          return ret;
        };
        
        var getCustomlabelCfg = function(rawObj){
          if(rawObj.info && rawObj.info.customlabel){
            return rawObj.info.customlabel;
          }
        };
        
        var buildLeftRightToDrawLabels = function(allLabels, allLabelsLocation, isMutilayer)
        {
          //Jimmy/12/26/2012 extend allLabels from stringArray to objectArray to support customlabel
            //we always draw the bottom label for yAxis.

            //build the "todraw" array
            //count all the labels y1 and y2, and save them.
            var allTicksLabels = [];
            for(var i = 0; i < allLabels.length; i++)
            {
                var item = {};
                item.text = getCustomlabelText(allLabels[i]);
                item.custom = getCustomlabelCfg(allLabels[i]);
                //count y1 and y2
                var itemMeasure = fastMeasure (item.text, m_style.label);
                var centerY = allLabelsLocation[i][0] + (allLabelsLocation[i][1] - allLabelsLocation[i][0])/2;
                item.width = itemMeasure.width;
                item.height = itemMeasure.height;
                item.y = centerY;
                item.y1 = centerY - item.height/2;
                item.y2 = centerY + item.height/2;
                allTicksLabels.push(item);
            }

            //now we should decide which label to draw.
            //iBeyond = 0:0,1,2,3,4,5,6,...
            //iBeyond = 1:0, ,2, ,4, ,6,...
            //iBeyond = 2:0, , ,3, , ,6,...
            //...
            //iBeyond = (allTicksLabels.length - 1):0
            var ticksLabelsToDraw = [];
            if(m_props.label.hideStrategy != 'greedy'){
                for(var iBeyond = 0; iBeyond <= (allTicksLabels.length - 1); iBeyond++)
                {
                    var isDrawable = true;
                    for(var i = (allTicksLabels.length - 1); i >= 0 ; i-=(iBeyond+1))
                    {   
                        var item = allTicksLabels[i];
                        if(i != (allTicksLabels.length - 1))
                        {
                            var previousIndex = i + (iBeyond+1);

                                if(allTicksLabels[i].y2 >= allTicksLabels[previousIndex].y1)
                                {
                                    isDrawable = false;
                                    break;
                                }
                        }
                        ticksLabelsToDraw.push(item);
                    }
                    if(isDrawable) //iBeyond = (allTicksLabels.length - 1) is always drawable
                    {
                        break;
                    }
                    else
                    {
                        ticksLabelsToDraw = [];
                    }
                }
            }else{
                
              for(var previousIndex = iBeyond = (allTicksLabels.length - 1); iBeyond >=0; iBeyond--){
                    var item = allTicksLabels[iBeyond];
                     
                     if(previousIndex === iBeyond&&allLabelsLocation[iBeyond][1]!=allLabelsLocation[iBeyond][0]){
                          if(isMutilayer && item.y1>allLabelsLocation[iBeyond][0]&&item.y2<allLabelsLocation[iBeyond][1]){
                            ticksLabelsToDraw.push(item);
                          }else if(!isMutilayer){
                            ticksLabelsToDraw.push(item);
                          }
                     }else{
                        if(item.y2 <= allTicksLabels[previousIndex].y1&&allLabelsLocation[iBeyond][1]!=allLabelsLocation[iBeyond][0]){
                            if(isMutilayer)
                            {
                              //if have more than one layers, need to detecte whether the label is between gridlines
                              if(item.y1>allLabelsLocation[iBeyond][0]&&item.y2<allLabelsLocation[iBeyond][1])
                              {
                                ticksLabelsToDraw.push(item);
                                previousIndex = iBeyond;
                              }
                            }
                            else
                            {
                            //if have only one layer , just need to detecte whether overlap is exist
                              ticksLabelsToDraw.push(item);
                              previousIndex = iBeyond;
                            }
                        }
                     }
                  }
            }

            return ticksLabelsToDraw;
        }

        var buildTopBottomToDrawLabels = function(allLabels, allLabelsLocation, isVertical, isMutilayer)
        {
          //Jimmy/12/26/2012 extend allLabels from stringArray to objectArray to support customlabel
            //we always draw the first label for xAxis.

            //build the "todraw" array
            //count all the labels y1 and y2, and save them.
            var allTicksLabels = [];
            for(var i = 0; i < allLabels.length; i++)
            {
                var item = {};
                item.text = getCustomlabelText(allLabels[i]);
                item.custom = getCustomlabelCfg(allLabels[i]);
                //count x1 and x2
                var itemMeasure = fastMeasure (item.text, m_style.label);
                if(isVertical)
                {
                    item.width = itemMeasure.height;
                    item.height = itemMeasure.width;
                }
                else
                {
                    item.width = itemMeasure.width;
                    item.height = itemMeasure.height;
                }

                var centerX = allLabelsLocation[i][0] + (allLabelsLocation[i][1] - allLabelsLocation[i][0])/2;

                item.x = centerX;
                item.x1 = centerX - item.width/2;
                item.x2 = centerX + item.width/2;
                
                allTicksLabels.push(item);
            }

            //now we should decide which label to draw.
            //iBeyond = 0:0,1,2,3,4,5,6,...
            //iBeyond = 1:0, ,2, ,4, ,6,...
            //iBeyond = 2:0, , ,3, , ,6,...
            //...
            //iBeyond = (allTicksLabels.length - 1):0
            var ticksLabelsToDraw = [];
            if(m_props.label.hideStrategy != 'greedy'){
              for(var iBeyond = 0; iBeyond <= (allTicksLabels.length - 1); iBeyond++)
              {
                  var isDrawable = true;
                  for(var i = 0; i < allTicksLabels.length; i+=(iBeyond+1))
                  {   
                      var item = allTicksLabels[i];
                      if(i != 0)
                      {
                          var previousIndex = i - (iBeyond+1);

                          if(allTicksLabels[i].x1 <= allTicksLabels[previousIndex].x2 || allLabelsLocation[iBeyond][1] === allLabelsLocation[iBeyond][0])
                          {
                              isDrawable = false;
                              break;
                          }
                      }
                      ticksLabelsToDraw.push(item);
                  }
                  if(isDrawable) //iBeyond = (allTicksLabels.length - 1) is always drawable
                  {
                      break;
                  }
                  else
                  {
                      ticksLabelsToDraw = [];
                  }
              }
            }else{

              for(var previousIndex = iBeyond = (allTicksLabels.length - 1); iBeyond >=0; iBeyond--){
                    var item = allTicksLabels[iBeyond];
                     
                     if(previousIndex === iBeyond && allLabelsLocation[iBeyond][1] != allLabelsLocation[iBeyond][0]){
                        if(isMutilayer && item.x1 > allLabelsLocation[iBeyond][0] && item.x2 < allLabelsLocation[iBeyond][1]){
                          ticksLabelsToDraw.push(item);
                        }else if(!isMutilayer){
                          ticksLabelsToDraw.push(item);
                        }
                     }else{
                        if(item.x2 <= allTicksLabels[previousIndex].x1&&allLabelsLocation[iBeyond][1]!=allLabelsLocation[iBeyond][0]){
                        if(isMutilayer)
                        {
                            //if have more than one layers, need to detecte whether the label is between gridlines
                            if(item.x1>allLabelsLocation[iBeyond][0]&&item.x2<allLabelsLocation[iBeyond][1])
                            {
                              ticksLabelsToDraw.push(item);
                              previousIndex = iBeyond;
                            }
                          }
                          else
                          {
                          //if have only one layer , just need to detecte whether overlap is exist
                            ticksLabelsToDraw.push(item);
                            previousIndex = iBeyond;
                          }
                        }
                     }
                  }
            }

            //console.log(ticksLabelsToDraw);

            return ticksLabelsToDraw;
        }

        var drawTopBottomLabels = function(selection, labelsToDraw, lastLevelHeight, maxTextHeight, axDomain, isVertical, isHierarchical)
        {
            if (labelsToDraw === undefined) {
              return;
            }

            for(var i = 0; i < labelsToDraw.length; i++)
            {
              var label = TypeUtils.isExist(labelsToDraw[i].text)? labelsToDraw[i].text:'';
                if(m_props.label.visible)
                {
                  if(angle){
                    var aAngle = angle * Math.PI /180;
                    var cosAngle = Math.cos(aAngle);
                    var sinAngle = (45 === angle) ? cosAngle : Math.sin(aAngle);
                    var tAngle = tickAngle * Math.PI / 180;
                    var cosTAngle = Math.cos(tAngle);
                    var sinTAngle = Math.sin(tAngle);
                    
                    var tickStartX  =   labelsToDraw[i].x * sinAngle;
                    tickStartY =  - labelsToDraw[i].x * cosAngle;
                    
                    var axLabels = selection.append("text")
                            .attr("x", tickStartX + m_textOffset * cosTAngle)
                            .attr("y", tickStartY + lastLevelHeight + m_textOffset * sinTAngle)
                            .attr("dominant-baseline", "middle")//"auto")//"hanging")//"central")
                            .attr("text-anchor", 'start') // text-align
                            .text(label)
                            .attr("fill", m_style.label.fill)
                            .attr("font-size", m_style.label['font-size'])
                            .attr("font-weight", m_style.label['font-weight'])
                            .attr("font-family", m_style.label['font-family']); 
                    
                    if(tickAngle > 90){
                      axLabels.attr("text-anchor", 'end').attr('transform', 'rotate( ' + (tickAngle - 180) + ' ' +axLabels.attr("x") + ' ' +axLabels.attr("y") + ')');
                    }else{
                    axLabels.attr('transform', 'rotate( ' + (tickAngle) + ' ' +axLabels.attr("x") + ' ' +axLabels.attr("y") + ')');
                    }
                  }else{
                    //selection.append("circle").attr("cx", axRange[i][0] + (axRange[i][1] - axRange[i][0])/2).attr("cy", lastLevelHeight + maxTextHeight/2 + m_textOffset). attr("r", 5);                               
                    var axLabels = selection.append("text")
                                    .attr("x", labelsToDraw[i].x)
                                    .attr("y", lastLevelHeight + maxTextHeight/2 + m_textOffset)
                                    .attr("dominant-baseline", "middle")//"auto")//"hanging")//"central")
                                    .attr("text-anchor", "middle") // text-align
                                    .text(label)
                                    .attr("fill", m_style.label.fill)
                                    .attr("font-size", m_style.label['font-size'])
                                    .attr("font-weight", m_style.label['font-weight'])
                                    .attr("font-family", m_style.label['font-family']); 
                      
                      if(isVertical)
                      {
                          if(!isHierarchical){
                            if(m_position == 'top'){
                              axLabels.attr('text-anchor', 'start')
                              .attr("y", lastLevelHeight + maxTextHeight + m_textOffset);
                            }else if(m_position == 'bottom'){
                              axLabels.attr("y", lastLevelHeight + m_textOffset).attr('text-anchor', 'end');
                            }
                          }
                          
                          var ac = "-90";
                          axLabels.attr("transform","rotate( " + ac + " " + axLabels.attr("x") + " "  + axLabels.attr("y") + " )");
                         
                      }
                      adjustLabelForIE(axLabels);
                  }
                }
            }
        };


        axis.position = function(_position) {
            if (!arguments.length) 
                return m_position;
            m_position = _position;
            return axis;
        };

        axis.properties = function(_properties) {
            if (arguments.length == 0)
                return m_props;

            m_props = Objects.extend(true, m_props, _properties);
            return axis;
        };
        
        axis.style = function(_style) {
          if(arguments.length == 0)
            return m_style;
          m_style = Objects.extend(true, m_style, _style);
          return axis;
        };

        axis.axScale = function(_axScale) {
            if (!arguments.length) 
                return m_axScale;
            m_axScale = _axScale;
            return axis;
        };

        axis.getPreferredSize = function() {

            var scaleToDraw = adjustScale();

            var axisWidth = 0;
            var axisHeight = 0;

            var axisSpacings = [];

            for(var i = 0; i < scaleToDraw.length; i++)
            {
                if(!m_props.label.visible && i != (scaleToDraw.length-1))
                {
                    continue;
                }

                var axDomain = scaleToDraw[i].domain;//["a", "b"]
                var axRange = scaleToDraw[i].range;//[[0, 100], [100. 200], ...]

                if(axDomain.length === 0 || axRange.length === 0)
                {
                    continue;
                }

                if(m_position == "bottom" || m_position == "top")
                {
                    axisWidth = Math.abs(axRange[axRange.length-1][1] - axRange[0][0]) + m_styleLineSrokeWidth;
                    
                    var offsetHeight = 0;
                    if(m_props.label.visible)
                    {
                        offsetHeight += maxLabelTextHeight(axDomain, axRange).maxLabelTextHeight;
                    }

                    offsetHeight += 2*m_textOffset;
                    axisHeight += offsetHeight;

                    axisSpacings.push(offsetHeight);
                }
                else if(m_position == "left" || m_position == "right")
                {
                    var offsetWidth = 0;

                    if(m_props.label.visible)
                    {
                        offsetWidth += maxLabelTextWidth(axDomain, axRange).maxLabelTextWidth;
                    }
                    offsetWidth += 2*m_textOffset;

                    axisWidth += offsetWidth;
                    axisSpacings.push(offsetWidth);

                    axisHeight = Math.abs(axRange[axRange.length-1][1] - axRange[0][0]) + m_styleLineSrokeWidth;
                }
            }

            //--------------
            if(m_spaceLimit >= 0)
            {
                var spacings = axisSpacings;
                var spaceLeft = m_spaceLimit;

                var spacingToDraw = 0;


                for(var i = 0; i < spacings.length; i++)
                {
                    if(spaceLeft >= spacings[i])
                    {
                        spacingToDraw += spacings[i];
                        spaceLeft -= spacings[i];
                    }
                    else
                    {
                        break;
                    }
                }

                if(spacingToDraw == 0 && spacings.length > 0)
                {
                    spacingToDraw += spacings[0];
                }


                if(m_position == "bottom" || m_position == "top")
                {
                    axisHeight = spacingToDraw;
                }
                else if(m_position == "left" || m_position == "right")
                {
                    axisWidth = spacingToDraw;
                }
            }

            //------------------------------------

            return {
                width : axisWidth,
                height : axisHeight,
                spacings : axisSpacings,
            };
        };

        axis.matrix = function(_){
          if(!arguments.length){
            return m_matrix;
          }
          m_matrix = _;
          return axis;
        };
        
        axis.labelAngle = function(_){
          if(!arguments.length){
            return labelAngle;
          }
          labelAngle = _;
          return axis;
        };
        
        axis.tickAngle = function(_){
          if(!arguments.length){
            return tickAngle;
          }
          tickAngle = _;
          return axis;
        };
        
        axis.angle = function(_){
          if(!arguments.length){
            return angle;
          }
          angle = _;
          return axis;
        };
        
        axis.labelAlign = function(_){
          if(!arguments.length){
            return labelAlign;
          }
          labelAlign = _;
          return axis;
        };
        
        var resolveMaxAndMinInDomain = function(domain, rangeArray){
          var heightArray = [];
          var widthArray = [];
          var isVerticalFont = false;
          for(var i = 0; i < domain.length; i++)
          {
              var tSize = fastMeasure( getCustomlabelText(domain[i]) , m_style.label);

              var tHeight = tSize.height;
              var tWidth = tSize.width;
              var interval = rangeArray[i][1]-rangeArray[i][0];

              if((tHeight < tWidth) && interval!=0 && tWidth > interval )
              {
                  if(m_position == "top" || m_position == "bottom")
                  {
                      isVerticalFont = true;
                  }
              }

              heightArray.push(tHeight);
              widthArray.push(tWidth);
          }
          
          return {
            'heights' : heightArray,
            'widths' : widthArray,
            'isVerticalFont' : isVerticalFont
          };
        };
        
        var maxLabelTextHeight = function (domain, rangeArray)
        {
          //Jimmy/10/26/2012 we extend domain from string array to object to support customlabel
            var re = {"maxLabelTextHeight": 0, "isVertical": false};
            var maxTextHeight = 0;
            var isVerticalFont = false;
            var sizes = resolveMaxAndMinInDomain(domain, rangeArray);
            isVerticalFont = m_props.forceVerticalFont === true ? true: sizes.isVerticalFont;
            
            for(var i = 0; i < domain.length; i++)
            {
                if(isVerticalFont)
                {
                    if(maxTextHeight < sizes.widths[i])
                    {
                        maxTextHeight = sizes.widths[i];
                    }
                }
                else
                {
                    if(maxTextHeight < sizes.heights[i])
                    {
                        maxTextHeight = sizes.heights[i];
                    }
                }
            }
            re.maxLabelTextHeight = maxTextHeight;
            re.isVertical = isVerticalFont;
            return re;
        };

        var maxLabelTextWidth = function (domain, rangeArray)
        {
            var re = {"maxLabelTextWidth": 0, "isVertical": false};
            var maxTextWidth = 0;
            var isVerticalFont = false;
            var sizes = resolveMaxAndMinInDomain(domain, rangeArray);
            isVerticalFont = m_props.forceVerticalFont === true ? true: sizes.isVerticalFont;
            
            for(var i = 0; i < domain.length; i++)
            {
                if(isVerticalFont)
                {
                    if(maxTextWidth < sizes.heights[i])
                    {
                        maxTextWidth = sizes.heights[i];
                    }
                }
                else
                {
                    if(maxTextWidth < sizes.widths[i])
                    {
                        maxTextWidth = sizes.widths[i];
                    }
                }
            }

            re.maxLabelTextWidth = maxTextWidth;
            re.isVertical = isVerticalFont;

            return re;
        };
        
        var fastMeasure = function(_text, _style)
        {
            return TextUtils.fastMeasure(_text, _style['font-size'],
                                                _style['font-weight'],
                                                _style['font-family']);
        };
        
        var isInvalidString = function(str){
           if( typeof (str) != "string" && NumberUtils.isNoValue(str))
             {
                   return true;
             }
           return false;
        }

        return axis;
    };
});