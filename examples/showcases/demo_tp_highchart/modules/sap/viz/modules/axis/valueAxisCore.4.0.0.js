sap.riv.module(
{
  qname : 'sap.viz.modules.axis.valueAxisCore',
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
{  qname : 'sap.viz.format.FormatManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.threeD.Point',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.threeD.matrix',
  version : '4.0.0'
}
],
function Setup(TextUtils, NumberUtils, Objects, FormatManager, Point, matrix) {

    return function() {
   
        var m_position;
        var m_axScale = null;

        var m_tickSize = 5;
        var m_textOffset = 4;

        var m_axDefaultTickNum = 7;

        var m_styleLineSrokeWidth = 1;
        var m_styleAxisColor = "#6c6c6c";
        var m_styleGridLineColor = "#d8d8d8";
        var m_styleGridIncisedLineColor = "#ffffff";
        var m_styleAxisLabelColor = "#333333";
        
        var m_style = null;
        var m_props = { 
            "title": {"visible": false, "text": undefined,},
            "gridline": {"visible": true, "color": m_styleGridLineColor, "showFirstLine": false, "length": 0, "showLastLine": false, "type":"line"},
            "type" : "value",
            "visible" : true,
            "label": {"visible": true, "numberFormat" : "","formatString": "", },
            "position": "left",
            "color": m_styleAxisColor,
            "axisline" : {"visible": true},
            "shapeRendering": true
        };

        var m_matrix = matrix(), labelAngle = null, labelAlign = null, angle = null, tickAngle = null;
        
        var m_spaceLimit = -1;
        axis.spaceLimit = function(_spaceLimit)
        {
            if (!arguments.length) 
                return m_spaceLimit;
            m_spaceLimit = _spaceLimit;
            return axis;
        }

        function axis(selection) {
                
                var axRange = m_axScale.range();//[0, 500]
                var axDomain = m_axScale.domain();//[-100, 2000]

                if(axRange[0] == 0 && axRange[1] == 0)
                {
                    return;//do not draw value axis
                }

                var axTicksLabels = getTicksLabel();

                if(m_position == "bottom")
                {
                    var maxTextHeight = 0;
                    if(m_props.label.visible) {
                        var textArray = [];
                        for(var i = 0; i < axTicksLabels.length; i++)
                        {
                            textArray.push(axTicksLabels[i].text);
                        }
                        maxTextHeight = maxLabelTextHeight(textArray);
                    }
                    if  ((m_spaceLimit != -1) && (maxTextHeight + m_tickSize + 2*m_textOffset + m_styleLineSrokeWidth/2 > m_spaceLimit)) {
                        axTicksLabels = [];
                    }

                    for(var i = 0; i < axTicksLabels.length; i++)
                    {
                        var axTick = selection.append("line")
                                    .attr("x1", m_axScale(axTicksLabels[i].value))
                                    .attr("x2", m_axScale(axTicksLabels[i].value))
                                    .attr("y1", 0)
                                    .attr("y2", m_tickSize + 1)//line contains the first but not the last point
                                    .attr("stroke", m_props.color)
                                    .attr("stroke-width", m_props.lineSize)
                                    .attr("shape-rendering",  m_props.shapeRendering ? "crispEdges": "auto");

                        if(angle){
                            var aAngle = angle * Math.PI /180;
                            var cosAngle = Math.cos(aAngle);
                            var sinAngle = (45 === angle) ? cosAngle : Math.sin(aAngle);
                            var tAngle = tickAngle * Math.PI / 180;
                            var cosTAngle = Math.cos(tAngle);
                            var sinTAngle = Math.sin(tAngle);
                            
                            var tickStartX  =   m_axScale(axTicksLabels[i].value) * sinAngle;
                            tickStartY =  -m_axScale(axTicksLabels[i].value) * cosAngle;
                            var x2 = tickStartX + ( m_tickSize + 1) * cosTAngle,
                              y2 = tickStartY + ( m_tickSize + 1) * sinTAngle;
                              
                            axTick.attr('x1', tickStartX).attr('y1', tickStartY).attr('x2', x2).attr('y2', y2);  
                          }
                        
                        var drawLine = function()
                        {
                             var line = selection.append("line")
                            .attr("x1", m_axScale(axTicksLabels[i].value))
                            .attr("x2", m_axScale(axTicksLabels[i].value))
                            .attr("y1", -m_props.gridline.length)
                            .attr("y2", 0)
                            .attr("stroke", m_props.gridline.color)
                            .attr("stroke-width", m_props.gridline.size)
                            .attr("shape-rendering",  m_props.shapeRendering ? "crispEdges": "auto");

                            if(m_props.gridline.type == "dotted")
                            {
                                 line.attr("stroke-dasharray", "3, 2");
                            }
                            
                            if(m_props.gridline.type == "incised")
                            {
                                var line = selection.append("line")
                                .attr("x1", m_axScale(axTicksLabels[i].value)-1)
                                .attr("x2", m_axScale(axTicksLabels[i].value)-1)
                                .attr("y1", -m_props.gridline.length)
                                .attr("y2", 0)
                                .attr("stroke", m_styleGridIncisedLineColor)
                                .attr("stroke-width", m_props.gridline.size)
                                .attr("shape-rendering",  m_props.shapeRendering ? "crispEdges": "auto");
                            }
                        };

                        if( i == 0 && m_props.gridline.showFirstLine)
                        {
                             drawLine();
                        }
                        else if ( i == (axTicksLabels.length - 1) && m_props.gridline.showLastLine)
                        {
                             drawLine();
                        }
                        else if ( (i != (axTicksLabels.length - 1))
                               && (i != 0)
                               && m_props.gridline.visible )
                        {
                             drawLine();
                        }
                    }

                    if(m_props.label.visible)
                    {
                        drawTopBottomLabels(selection, "Bottom", axTicksLabels, maxTextHeight);
                    }

                    if (m_props.axisline.visible) {
                        var x1 = axRange[0];
                        var x2 = axRange[1];
                        var y1 = 0;
                        var y2 = 0;

                        var endSize = 0;//m_tickSize

                        var dPath  = "M" + x1 + " " + (y1 + endSize);
                            dPath += "L" + x1 + " " + y1;
                            dPath += "L" + x2 + " " + y2;
                            dPath += "L" + x2 + " " + (y2 + endSize);

                        var axLine = selection.append("path")
                                    .attr("d", dPath)
                                    .attr("fill", "none")
                                    .attr("stroke", m_props.color)
                                    .attr("stroke-width", m_props.lineSize)
                                    .attr("shape-rendering",  m_props.shapeRendering ? "crispEdges": "auto");
                        
                        if( angle ){
                          var aAngle = angle * Math.PI /180;
                          var cosAngle = Math.cos(aAngle);
                          var sinAngle = (45 == angle)? cosAngle: Math.sin(aAngle); 
                          dPath = 'M ' + axRange[1]  + ' ' + y1;
                          dPath += 'L' + (axRange[1] + axRange[0] * sinAngle) + ' ' + ( y1 - axRange[0] * cosAngle);
                          dPath += 'Z';
                          
                          axLine.attr('d', dPath);
                        }
                    }
                }
                else if(m_position == "top")
                {
                    var maxTextHeight = 0;
                    if(m_props.label.visible) {
                        var textArray = [];
                        for(var i = 0; i < axTicksLabels.length; i++)
                        {
                            textArray.push(axTicksLabels[i].text);
                        }
                        maxTextHeight = maxLabelTextHeight(textArray);
                    }
                    if ((m_spaceLimit != -1) && (maxTextHeight + m_tickSize + 2*m_textOffset + m_styleLineSrokeWidth/2 > m_spaceLimit)) {
                        axTicksLabels = [];
                    }
                    
                    var nOffset = 1;
                    if(m_props.label.visible)
                    {
                        nOffset = 2;
                    }

                    for(var i = 0; i < axTicksLabels.length; i++)
                    {
                        var axTick = selection.append("line")
                                    .attr("x1", m_axScale(axTicksLabels[i].value))
                                    .attr("x2", m_axScale(axTicksLabels[i].value))
                                    .attr("y1", maxTextHeight + nOffset*m_textOffset)
                                    .attr("y2", maxTextHeight + nOffset*m_textOffset + m_tickSize)
                                    .attr("stroke", m_props.color)
                                    .attr("stroke-width", m_props.lineSize)
                                    .attr("shape-rendering",  m_props.shapeRendering ? "crispEdges": "auto");

                        var drawLine = function()
                        {
                            var gridline = selection.append("line")
                                        .attr("x1", m_axScale(axTicksLabels[i].value))
                                        .attr("x2", m_axScale(axTicksLabels[i].value))
                                        .attr("y1", maxTextHeight + m_tickSize + nOffset*m_textOffset)
                                        .attr("y2", maxTextHeight + m_tickSize + nOffset*m_textOffset + m_props.gridline.length)
                                        .attr("stroke", m_props.gridline.color)
                                        .attr("stroke-width", m_props.gridline.size)
                                        .attr("shape-rendering",  m_props.shapeRendering ? "crispEdges": "auto");

                            if(m_props.gridline.type == "dotted")
                            {
                                 gridline.attr("stroke-dasharray", "3, 2");
                            }

                            if(m_props.gridline.type == "incised")
                            {
                                var gridline = selection.append("line")
                                        .attr("x1", m_axScale(axTicksLabels[i].value)-1)
                                        .attr("x2", m_axScale(axTicksLabels[i].value)-1)
                                        .attr("y1", maxTextHeight + m_tickSize + nOffset*m_textOffset)
                                        .attr("y2", maxTextHeight + m_tickSize + nOffset*m_textOffset + m_props.gridline.length)
                                        .attr("stroke", m_styleGridIncisedLineColor)
                                        .attr("stroke-width", m_props.gridline.size)
                                        .attr("shape-rendering",  m_props.shapeRendering ? "crispEdges": "auto");
                            }
                        };

                        if( i == 0 && m_props.gridline.showFirstLine)
                        {
                             drawLine();
                        }
                        else if ( i == (axTicksLabels.length - 1) && m_props.gridline.showLastLine)
                        {
                             drawLine();
                        }
                        else if ( (i != (axTicksLabels.length - 1))
                               && (i != 0)
                               && m_props.gridline.visible )
                        {
                             drawLine();
                        }
                    }

                    if(m_props.label.visible)
                    {
                        drawTopBottomLabels(selection, "Top", axTicksLabels, maxTextHeight);
                    }

                    if (m_props.axisline.visible) {
                        var x1 = axRange[0];
                        var x2 = axRange[1];
                        var y1 = maxTextHeight + m_tickSize + nOffset*m_textOffset;
                        var y2 = maxTextHeight + m_tickSize + nOffset*m_textOffset;

                        var endSize = 0;//m_tickSize
                        var dPath  = "M" + x1 + " " + (y1 - endSize);
                            dPath += "L" + x1 + " " + y1;
                            dPath += "L" + x2 + " " + y2;
                            dPath += "L" + x2 + " " + (y2 - endSize);

                        var axLine = selection.append("path")
                                    .attr("d", dPath)
                                    .attr("fill", "none")
                                    .attr("stroke", m_props.color)
                                    .attr("stroke-width", m_props.lineSize)
                                    .attr("shape-rendering",  m_props.shapeRendering ? "crispEdges": "auto");
                    }

                }
                else if(m_position == "left")
                {
                    //we must change axTicksLabels, remove some lable array items for label management
                    //console.log(axTicksLabels);
                    axTicksLabels = buildToDrawLabels(axTicksLabels);

                    //count the max text width
                    var maxTextWidth = 0;
                    if(m_props.label.visible) {
                        var textArray = [];
                        for(var i = 0; i < axTicksLabels.length; i++)
                        {
                            textArray.push(axTicksLabels[i].text);
                        }
                        maxTextWidth = maxLabelTextWidth(textArray);
                    }
                    if ((m_spaceLimit != -1) && (maxTextWidth + m_tickSize + 2*m_textOffset + m_styleLineSrokeWidth/2 > m_spaceLimit)) {
                        axTicksLabels = [];
                    }

                    var nOffset = 1;
                    if(m_props.label.visible)
                    {
                        nOffset = 2;
                    }

                    for(var i = 0; i < axTicksLabels.length; i++)
                    {
                        var axTick = selection.append("line")
                                    .attr("x1", maxTextWidth + nOffset*m_textOffset)
                                    .attr("x2", maxTextWidth + nOffset*m_textOffset + m_tickSize)
                                    .attr("y1", m_axScale(axTicksLabels[i].value))
                                    .attr("y2", m_axScale(axTicksLabels[i].value))
                                    .attr("stroke", m_props.color)
                                    .attr("stroke-width", m_props.lineSize)
                                    .attr("shape-rendering",  m_props.shapeRendering ? "crispEdges": "auto");

                        var drawLine = function()
                        {
                            var gridline = selection.append("line")
                                        .attr("y1", m_axScale(axTicksLabels[i].value))
                                        .attr("y2", m_axScale(axTicksLabels[i].value))
                                        .attr("x1", maxTextWidth + nOffset*m_textOffset + m_tickSize)
                                        .attr("x2", maxTextWidth + nOffset*m_textOffset + m_tickSize + m_props.gridline.length)
                                        .attr("stroke", m_props.gridline.color)
                                        .attr("stroke-width", m_props.gridline.size)
                                        .attr("shape-rendering",  m_props.shapeRendering ? "crispEdges": "auto");

                            if(m_props.gridline.type == "dotted")
                            {
                                 gridline.attr("stroke-dasharray", "3, 2");
                            }

                            if(m_props.gridline.type == "incised")
                            {
                                var gridline = selection.append("line")
                                        .attr("y1", m_axScale(axTicksLabels[i].value)+1)
                                        .attr("y2", m_axScale(axTicksLabels[i].value)+1)
                                        .attr("x1", maxTextWidth + nOffset*m_textOffset + m_tickSize)
                                        .attr("x2", maxTextWidth + nOffset*m_textOffset + m_tickSize + m_props.gridline.length)
                                        .attr("stroke", m_styleGridIncisedLineColor)
                                        .attr("stroke-width", m_props.gridline.size)
                                        .attr("shape-rendering",  m_props.shapeRendering ? "crispEdges": "auto");
                            }
                            
                        };

                        if( i == 0 && m_props.gridline.showFirstLine)
                        {
                             drawLine();
                        }
                        else if ( i == (axTicksLabels.length - 1) && m_props.gridline.showLastLine)
                        {
                             drawLine();
                        }
                        else if ( (i != (axTicksLabels.length - 1))
                               && (i != 0)
                               && m_props.gridline.visible )
                        {
                             drawLine();
                        }
                        
                        //selection.append("circle").attr("cx", maxTextWidth).attr("cy", m_axScale(axTicksLabels.value[i])). attr("r", 3);
                        if(m_props.label.visible)
                        {
                            var text = selection.append("text")
                           .attr("x", maxTextWidth + m_textOffset)
                           .attr("y", m_axScale(axTicksLabels[i].value))
                           .attr("dominant-baseline", "middle")//"auto")//"hanging")//"central")
                           .attr("text-anchor", "end") // text-align
                           .text(axTicksLabels[i].text)
                           .attr("fill", m_style.label.fill)
                           .attr("font-size", m_style.label['font-size'])
                           .attr("font-weight", m_style.label['font-weight'])
                           .attr("font-family", m_style.label['font-family']);

                            adjustLabelForIE(text);
                        }
                    }

                    if (m_props.axisline.visible) {
                        var x1 = maxTextWidth + nOffset*m_textOffset + m_tickSize;
                        var x2 = maxTextWidth + nOffset*m_textOffset + m_tickSize;
                        var y1 = axRange[0];
                        var y2 = axRange[1];

                        var endSize = 0;//m_tickSizes
                        var dPath  = "M" + (x1 - endSize) + " " + y1;
                            dPath += "L" + x1 + " " + y1;
                            dPath += "L" + x2 + " " + y2;
                            dPath += "L" + (x2 - endSize) + " " + y2;
                        
                        var axLine = selection.append("path")
                                    .attr("d", dPath)
                                    .attr("fill", "none")
                                    .attr("stroke", m_props.color)
                                    .attr("stroke-width", m_props.lineSize)
                                    .attr("shape-rendering",  m_props.shapeRendering ? "crispEdges": "auto");
                    }
                }
                else if(m_position == "right")
                {
                    //we must change axTicksLabels, remove some lable array items for label management
                    //console.log(axTicksLabels);
                    axTicksLabels = buildToDrawLabels(axTicksLabels);
                    if(m_props.label.visible) {
                        var textArray = [];
                        for(var i = 0; i < axTicksLabels.length; i++)
                        {
                            textArray.push(axTicksLabels[i].text);
                        }
                        maxTextWidth = maxLabelTextWidth(textArray);
                    }
                    if ((m_spaceLimit != -1) && (maxTextWidth + m_tickSize + 2*m_textOffset + m_styleLineSrokeWidth/2 > m_spaceLimit)) {
                        axTicksLabels = [];
                    }

                    for(var i = 0; i < axTicksLabels.length; i++)
                    {
                        var axTick = selection.append("line")
                                    .attr("x1", 0)
                                    .attr("x2", m_tickSize)
                                    .attr("y1", m_axScale(axTicksLabels[i].value))
                                    .attr("y2", m_axScale(axTicksLabels[i].value))
                                    .attr("stroke", m_props.color)
                                    .attr("stroke-width", m_props.lineSize)
                                    .attr("shape-rendering",  m_props.shapeRendering ? "crispEdges": "auto");

                        var drawLine = function()
                        {
                            var gridline = selection.append("line")
                                        .attr("y1", m_axScale(axTicksLabels[i].value))
                                        .attr("y2", m_axScale(axTicksLabels[i].value))
                                        .attr("x1", -m_props.gridline.length)
                                        .attr("x2", 0)
                                        .attr("stroke", m_props.gridline.color)
                                        .attr("stroke-width", m_props.gridline.size)
                                        .attr("shape-rendering",  m_props.shapeRendering ? "crispEdges": "auto");

                            if(m_props.gridline.type == "dotted")
                            {
                                 gridline.attr("stroke-dasharray", "3, 2");
                            }
                            if(m_props.gridline.type == "incised")
                            {
                                var gridline = selection.append("line")
                                        .attr("y1", m_axScale(axTicksLabels[i].value)+1)
                                        .attr("y2", m_axScale(axTicksLabels[i].value)+1)
                                        .attr("x1", -m_props.gridline.length)
                                        .attr("x2", 0)
                                        .attr("stroke", m_styleGridIncisedLineColor)
                                        .attr("stroke-width", m_props.gridline.size)
                                        .attr("shape-rendering",  m_props.shapeRendering ? "crispEdges": "auto");
                            }
                        };

                        if( i == 0 && m_props.gridline.showFirstLine)
                        {
                             drawLine();
                        }
                        else if ( i == (axTicksLabels.length - 1) && m_props.gridline.showLastLine)
                        {
                             drawLine();
                        }
                        else if ( (i != (axTicksLabels.length - 1))
                               && (i != 0)
                               && m_props.gridline.visible )
                        {
                             drawLine();
                        }

                        //selection.append("circle").attr("cx", m_tickSize + m_textOffset).attr("cy", m_axScale(axTicksLabels.value[i])). attr("r", 3);
                        if(m_props.label.visible)
                        {
                            var text = selection.append("text")
                            .attr("x", m_tickSize + m_textOffset)
                            .attr("y", m_axScale(axTicksLabels[i].value))
                            .attr("dominant-baseline", "middle")//"auto")//"hanging")//"central")
                            .attr("text-anchor", "start") // text-align
                            .text(axTicksLabels[i].text)
                            .attr("fill", m_style.label.fill)
                            .attr("font-size", m_style.label['font-size'])
                            .attr("font-weight", m_style.label['font-weight'])
                            .attr("font-family", m_style.label['font-family']);

                            adjustLabelForIE(text);
                        }
                    }

                    if (m_props.axisline.visible) {
                        var x1 = 0;
                        var x2 = 0;
                        var y1 = axRange[0];
                        var y2 = axRange[1];

                        var endSize = 0;//m_tickSizes
                        var dPath  = "M" + (x1 + endSize) + " " + y1;
                            dPath += "L" + x1 + " " + y1;
                            dPath += "L" + x2 + " " + y2;
                            dPath += "L" + (x2 + endSize) + " " + y2;

                        var axLine = selection.append("path")
                                .attr("d", dPath)
                                .attr("fill", "none")
                                .attr("stroke", m_props.color)
                                .attr("stroke-width", m_props.lineSize)
                                .attr("shape-rendering",  m_props.shapeRendering ? "crispEdges": "auto");
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
        
        axis.position = function(_position) {
            if (!arguments.length) 
                return m_position;
            m_position = _position;
            return axis;
        };
        
        axis.style = function(_style) {
          if(arguments.length == 0)
            return m_style;
          m_style = Objects.extend(true, m_style, _style);
          return axis;
        };

        axis.properties = function(_properties) {
            if (arguments.length == 0)
                return m_props;

            m_props = extendObj(m_props, _properties);
            return axis;
        };

        axis.axScale = function(_axScale) {
            if (!arguments.length) 
                return m_axScale;
            m_axScale = _axScale;
            return axis;
        };

        axis.startPadding = function() {
            if(m_axScale)
            {
                var axTicksLabels = getTicksLabel();
                
                var labelSize = 0;
                if(axTicksLabels.length > 0)
                {
                    labelSize = fastMeasure(axTicksLabels[0].text, m_style.label);
                }
                if(labelSize == 0){
                  return 0;
                }
                if(m_position == "top" || m_position == "bottom")
                {
                    return labelSize.width/2;
                }
                else
                {
                    return labelSize.height/2;
                }
            }
            else
            {
                return 0;
            }
        };

        axis.endPadding = function() {
            if(m_axScale)
            {
                var axTicksLabels = getTicksLabel();

                var labelSize = 0;

                if(axTicksLabels.length > 0)
                {
                    labelSize = fastMeasure(axTicksLabels[axTicksLabels.length-1].text, m_style.label);
                }
                if(labelSize == 0){
                  return 0;
                }
                if(m_position == "top" || m_position == "bottom")
                {
                    return labelSize.width/2;
                }
                else
                {
                    return labelSize.height/2;
                }
            }
            else
            {
                return 0;
            }
        };

        axis.getPreferredSize = function() {

            var axDomain = m_axScale.domain();//[0, 100]
            var axRange = m_axScale.range();//[0, 200]

            var axisWidth = 0;
            var axisHeight = 0;

            var axisSpacings = [];

            if( !(axRange[0] == 0 && axRange[1] == 0) )
            {
                if(m_position == "bottom" || m_position == "top")
                {
                    axisWidth = Math.abs(axRange[1] - axRange[0]) + m_styleLineSrokeWidth;
                    if(m_props.label.visible)
                    {
                        var axTicksLabels = getTicksLabel();
                        var textArray = [];
                        for(var i = 0; i < axTicksLabels.length; i++)
                        {
                            textArray.push(axTicksLabels[i].text);
                        }
                        axisHeight = maxLabelTextHeight(textArray) + m_tickSize + 2*m_textOffset + m_styleLineSrokeWidth/2;
                    }
                    else
                    {
                        axisHeight = m_tickSize + m_textOffset + m_styleLineSrokeWidth/2;
                    }
                    axisSpacings.push(axisHeight);
                }
                else if(m_position == "left" || m_position == "right")
                {
                    if(m_props.label.visible)
                    {
                        var axTicksLabels = getTicksLabel();
                        var textArray = [];
                        for(var i = 0; i < axTicksLabels.length; i++)
                        {
                            textArray.push(axTicksLabels[i].text);
                        }
                        axisWidth = maxLabelTextWidth(textArray) + m_tickSize + 2*m_textOffset + m_styleLineSrokeWidth/2;
                    }
                    else
                    {
                        axisWidth = m_tickSize + m_textOffset + m_styleLineSrokeWidth/2;
                    }
                    axisSpacings.push(axisWidth);

                    axisHeight = Math.abs(axRange[1] - axRange[0]) + m_styleLineSrokeWidth;
                }
            }

            return {
                width : axisWidth,
                height : axisHeight,
                spacings : axisSpacings,

            };
        };

        var buildToDrawLabels = function(axTicksLabels)
        {
            if(axTicksLabels.length > 0)
            {
                if(m_axScale (axTicksLabels[0].value) > m_axScale (axTicksLabels[axTicksLabels.length-1].value))
                {
                    axTicksLabels.reverse();
                }
            }
            //build the "todraw" array
            //count all the labels y1 and y2, and save them.
            var allTicksLabels = [];
            for(var i = 0; i < axTicksLabels.length; i++)
            {   
              if(!NumberUtils.isNoValue(axTicksLabels[i].value)){
                var item = {};
                item.value = axTicksLabels[i].value;
                item.text = axTicksLabels[i].text;

                //count y1 and y2
                var itemHeight = fastMeasure (item.text, m_style.label).height;
                var centerY = m_axScale (item.value);

                item.start =  centerY - itemHeight/2;
                item.end =   centerY + itemHeight/2;
                
                allTicksLabels.push(item);
              }
            }
            //console.log(allTicksLabels);

            var ticksLabelsToDraw = [];
            ticksLabelsToDraw = calculateLabelsToDraw(allTicksLabels);

            //console.log(ticksLabelsToDraw);
            return ticksLabelsToDraw;
        };

        var drawTopBottomLabels = function(selection, type, ticksLabels, maxTextHeight)
        {
            if(ticksLabels.length == 0)
            {
                return;
            }

            if(ticksLabels.length > 0)
            {
                if(m_axScale (ticksLabels[0].value) > m_axScale (ticksLabels[ticksLabels.length-1].value))
                {
                    ticksLabels.reverse();
                }
            }
            //build the "todraw" array
            //count all the labels x1 and x2, and save them.
            var allTicksLabels = [];
            for(var i = 0; i < ticksLabels.length; i++)
            {   
                var item = {};
                item.value = ticksLabels[i].value;
                item.text = ticksLabels[i].text;

                //count x1 and x2
                var itemWidth = fastMeasure (item.text, m_style.label).width;
                var centerX = m_axScale (item.value);

                item.start = centerX - itemWidth/2;
                item.end = centerX + itemWidth/2;

                allTicksLabels.push(item);
            }

            var ticksLabelsToDraw = [];
            ticksLabelsToDraw = calculateLabelsToDraw(allTicksLabels);

            //console.log(ticksLabelsToDraw);
            for(var i = 0; i < ticksLabelsToDraw.length; i++)
            {
              if(angle){
                var aAngle = angle * Math.PI /180;
                var cosAngle = Math.cos(aAngle);
                var sinAngle = (45 === angle) ? cosAngle : Math.sin(aAngle);
                var tAngle = tickAngle * Math.PI / 180;
                var cosTAngle = Math.cos(tAngle);
                var sinTAngle = Math.sin(tAngle);
                
                var tickStartX  =    m_axScale(ticksLabelsToDraw[i].value) * sinAngle;
                tickStartY =  -  m_axScale(ticksLabelsToDraw[i].value) * cosAngle;
                
                var item = selection.append('text')
                  .attr('x', tickStartX + m_textOffset * cosTAngle)
                  .attr('y', tickStartY + m_textOffset * sinTAngle)
                  .attr("dominant-baseline", "middle")//"auto")//"hanging")//"central")
                  .attr("text-anchor", 'start') // text-align
                  .text(ticksLabelsToDraw[i].text)
                  .attr("fill", m_style.label.fill)
                  .attr("font-size", m_style.label['font-size'])
                  .attr("font-weight", m_style.label['font-weight'])
                  .attr("font-family", m_style.label['font-family']); 
          
                  if(tickAngle > 90){
                    item.attr("text-anchor", 'end').attr('transform', 'rotate( ' + (tickAngle - 180) + ' ' +item.attr("x") + ' ' +item.attr("y") + ')');
                  }else{
                    item.attr('transform', 'rotate( ' + (tickAngle) + ' ' +item.attr("x") + ' ' +item.attr("y") + ')');
                  }
              }else{
              //selection.append("circle").attr("cx", m_axScale(axTicksLabels.value[i])).attr("cy", m_textOffset + m_tickSize). attr("r", 3);
                var item = selection.append("text")
                 .attr("x", m_axScale(ticksLabelsToDraw[i].value))
                 .attr("y", m_textOffset + m_tickSize)
                 .attr("dominant-baseline", "hanging")//"auto")//"hanging")//"central")
                 .attr("text-anchor", "middle") // text-align
                 .text(ticksLabelsToDraw[i].text)
                 .attr("fill", m_style.label.fill)
                 .attr("font-size", m_style.label['font-size'])
                 .attr("font-weight", m_style.label['font-weight'])
                 .attr("font-family", m_style.label['font-family']);

                //IE does not support dominant-baseline
                item.attr("dominant-baseline", "auto");
                item.attr("y", maxTextHeight + m_textOffset);
              }
            }
        };

        var calculateLabelsToDraw = function(allTicksLabels)
        {
            var labelsToDraw = [];
            
            if(allTicksLabels.length > 0)
            {
                //split allTicksLabels if it is required.
                if( !(allTicksLabels[0].value >= 0 && allTicksLabels[allTicksLabels.length - 1].value >= 0) 
                  &&!(allTicksLabels[0].value <= 0 && allTicksLabels[allTicksLabels.length - 1].value <= 0)
                  )
                {
                    var negativeArray = [];
                    var positiveArray = [];
                    for(var i = 0; i < allTicksLabels.length; i++)
                    {
                        if(allTicksLabels[i].value <= 0)
                        {
                            negativeArray.push(allTicksLabels[i]);
                        }

                        if(allTicksLabels[i].value >= 0)
                        {
                            positiveArray.push(allTicksLabels[i]);
                        }
                    }
                    negativeArray = calculateLabelsToDrawHelper(negativeArray);
                    positiveArray = calculateLabelsToDrawHelper(positiveArray);

                    var compareValue = function (firstObj, secondObj)
                    {
                        return firstObj.value - secondObj.value;
                    }
                    negativeArray.sort(compareValue);
                    positiveArray.sort(compareValue);

                    if( negativeArray[negativeArray.length -1].value == 0
                        && positiveArray[0].value == 0)
                    {
                        negativeArray.pop();
                    }

                    //console.log(negativeArray);
                    labelsToDraw = negativeArray.concat(positiveArray);
                }
                else
                {
                    labelsToDraw = calculateLabelsToDrawHelper(allTicksLabels);
                }
            }

            //BITVIZA-454 [label management] When the height/width of 
            //vertical/horizontal axis is small that can only hold one axis label, the label 
            //should be hidden.
            if(labelsToDraw.length <= 1)
            {
                labelsToDraw = [];
            }

            return labelsToDraw;
        }

        var calculateLabelsToDrawHelper = function(allTicksLabels)
        {
            //allTicksLabels:
            //[0, X]
            //[-X, 0]
            //[X1, X2] (X1>0, X2>0)
            //[X1, X2] (X1<0, X2<0)

            //now we should decide which label to draw.
            //iBeyond = 0:0,1,2,3,4,5,6,...
            //iBeyond = 1:0, ,2, ,4, ,6,...
            //iBeyond = 2:0, , ,3, , ,6,...
            //...
            //iBeyond = (allTicksLabels.length - 1):0
            var ticksLabelsToDraw = [];

            for(var iBeyond = 0; iBeyond <= (allTicksLabels.length - 1); iBeyond++)
            {
                var isDrawable = true;
                for(var i = 0; i < allTicksLabels.length-1; i+=(iBeyond+1))
                {
                    var item = allTicksLabels[i];
                    if(i != 0)
                    {
                        var previousItem = ticksLabelsToDraw[ticksLabelsToDraw.length-1];
                        if (allTicksLabels[i].start <= previousItem.end)
                        {
                            //for [0.9,1,2,3....], if cannot draw second axis label, just ignore second, then continue
                            if (ticksLabelsToDraw.length > 1) {
                                isDrawable = false;
                                break;
                            }
                        } else {
                            ticksLabelsToDraw.push(item);
                        }
                    } else {
                        //add the first axis tick label
                        ticksLabelsToDraw.push(item);
                    }
                }
                //for [.....5,5.1], always draw the last axis tick label
                var lastItem = allTicksLabels[allTicksLabels.length-1];
                if (lastItem.start < ticksLabelsToDraw[ticksLabelsToDraw.length-1].end) {
                    ticksLabelsToDraw.pop();
                }
                ticksLabelsToDraw.push(lastItem);
                
                if(isDrawable) {//find the labels
                    break;
                } else {
                    ticksLabelsToDraw = [];
                }
            }
            
            return ticksLabelsToDraw;
        }

        var getTicksLabel = function ()
        {
            var axDomain = m_axScale.domain();//[-100, 2000]

            var tickNum = m_axDefaultTickNum;
            if(m_axScale.tickHint)//after perfect
            {
                tickNum = m_axScale.tickHint;
            }

            var axTicksLabels = m_axScale.ticks(tickNum);//[0, 2000, 4000, ...]
            // [21-Sep-2012 Nick ] FIXME Comment out this part to fix bug BITVIZA-383, any particular reason to filter ticks?
            // if it is yes, what kind of criteria should be taken?
//            if(axTicksLabels.length > 20)
//            {
//                //too many ticks. filter some ticks
//                var tempTicks = [];
//                for(var i = 0; i < axTicksLabels.length; i++)
//                {
//                    if(axTicksLabels[i].toString().substr(0,1) == "1"
//                      || axTicksLabels[i].toString().substr(0,1) == "2"
//                      || axTicksLabels[i].toString().substr(0,1) == "5")
//                    {
//                        tempTicks.push(axTicksLabels[i]);
//                    }
//                }
//                axTicksLabels = tempTicks;
//            }

            for(var i=0; i < axTicksLabels.length; i++){
              axTicksLabels[i] = parseFloat( axTicksLabels[i].toFixed(8));
            }
            var beginLabel;
            var endLabel;
            if(axDomain[0] <= axDomain[axDomain.length -1])
            {
                beginLabel = axDomain[0];
                endLabel = axDomain[axDomain.length -1];
            }
            else
            {
                beginLabel = axDomain[axDomain.length -1];
                endLabel = axDomain[0];
            }

            if(axTicksLabels.length > 0)
            {
                if(axTicksLabels[0] != beginLabel) {
                    //the first label is not the first doamin. Add it.
                    axTicksLabels.unshift(beginLabel);
                }
                
                if(axTicksLabels[axTicksLabels.length -1] != endLabel) {
                    //the last label is not the end. Add it.
                    axTicksLabels.push(endLabel);
                }
            }

            var ticks = [];
            for(var i = 0; i < axTicksLabels.length; i++)
            {
                var tickItem = {};
                tickItem.value = axTicksLabels[i];
                if(m_props.isPercentMode)
                {
                    tickItem.text = parseFloat((axTicksLabels[i]*100).toFixed(8)).toString();
                }
                else
                {
                    tickItem.text = parseFloat(axTicksLabels[i].toFixed(8)).toString();
                }
                ticks.push(tickItem);
            }

          //format value label by d3
            if(m_props.label)
            {
                if(!m_props.label.formatString && m_props.label.numberFormat){
                    for(var i = 0; i < axTicksLabels.length; i++)
                    {
                        var formatFun = d3.format(m_props.label.numberFormat);
                        ticks[i].text = (formatFun(axTicksLabels[i]));
                    }
                }else if(m_props.label.formatString){
                    var formatString = m_props.label.formatString;
                    for(var i = 0; i < axTicksLabels.length; i++)
                    {
                        ticks[i].text = (FormatManager.format(axTicksLabels[i], formatString));
                    }
                }
                
            }
            
            return ticks;
        }

        var maxLabelTextHeight = function (textArray)
        {
            var maxTextHeight = 0;
            for(var i = 0; i <  textArray.length; i++)
            {
                var tLen = fastMeasure(textArray[i], m_style.label).height;
                if(maxTextHeight < tLen)
                {
                    maxTextHeight = tLen;
                }
            }
            return maxTextHeight;
        }

        var maxLabelTextWidth = function (textArray)
        {
            var maxTextWidth = 0;
            for(var i = 0; i <  textArray.length; i++)
            {
                var tLen = fastMeasure(textArray[i], m_style.label).width;
                if(maxTextWidth < tLen)
                {
                    maxTextWidth = tLen;
                }
            }
            return maxTextWidth;
        }
        
        var fastMeasure = function(_text, _style)
        {
            return TextUtils.fastMeasure(_text, _style['font-size'],
                                                _style['font-weight'],
                                                _style['font-family']);
        }        

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
        
        return axis;
    };
});