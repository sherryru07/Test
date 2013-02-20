sap.riv.module(
{
  qname : 'sap.viz.modules.axis',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.util.TextUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.axis.valueAxisCore',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.axis.categoryAxisCore',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.NumberUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.dispatch',
  version : '4.0.0'
},
{  qname : 'sap.viz.format.FormatManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.threeD.matrix',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.BoundUtil',
  version : '4.0.0'
}
],
function Setup(TextUtils, Objects, valueAxisCore, categoryAxisCore, langManager, NumberUtils, dispatch, FormatManager, matrix, BoundUtil) {

    return function(manifest, ctx) {
        //we should build the axis Data Module, and then draw the axis.
        var m_AxisDM = null;

        var parent = null;
        var m_width = 0;
        var m_height = 0;

        var m_isDrawBody = true;

        var m_spaceLimit = -1;

        var m_axClassName = "viz-axis";
        var m_axBodyClassName = "viz-axis-body";
        var m_axTitleClassName = "viz-axis-title";
        var m_axLabelClassName = "viz-axis-label";

        var m_titleOffset = 11;

        var m_data = { };
        var m_dataAxis = { };
        
        var m_isTitleVisible = true;
        
        var m_props = manifest.props(null);
        
        var m_drawable = true;

        var eDispatch = new dispatch('initialized');
        
        var m_defaultColor = m_props.color;

        var m_scale = null;

        var m_effectManager;
        if(ctx)
        {
           m_effectManager = ctx.effectManager;
        }
        
        var m_title = null;
        
        var m_style = {};
        
        
        var getThemeStyleDef = function () {
          if(ctx)  {
              m_style.title = ctx.styleManager.query(m_axTitleClassName);
              m_style.label = ctx.styleManager.query(m_axLabelClassName);
              if (m_props.title.applyAxislineColor){
                m_style.title.fill = m_props.color;
              }
          }
        };

        var m_matrix = matrix(), labelAngle = null, labelAlign = null, angle = null, tickAngle = null;
        
        var drawAll = function()
        {
            if(!m_drawable)
            {
                //do not draw bacause of smart layout
                return false;
            }
            else
            {
                if(!drawBody() && !drawTitle())
                {
                    return false;
                }
            }

            return true;
        };

        var drawTitle = function() 
        {
            return m_props.title.visible && m_props.visible;
        };

        var drawBody = function() 
        {
            if(!m_isDrawBody)
            {
                return false;
            }

            var rangeArray = m_scale.range();
            var domainArray = m_scale.domain();
            var rangeBand = null;
            if(m_props.type === "category")
            {
                rangeBand = m_scale.rangeBand();
            }

            var hasData = false;
            if(!m_props.isIndependentMode)
            {
                if(m_dataAxis)
                {
                    hasData = true;
                }
            }
            else
            {
                if(m_data)
                {
                    hasData = true;
                }
            }

            return !(!m_props.visible ||
                   (rangeArray[0] === 0 && rangeArray[rangeArray.length-1] === 0 && rangeArray.length >=2 ) ||
                   (rangeArray.length === 1 && rangeArray[0] === 0 &&
                    domainArray.length === 1 && domainArray[0] === 0 && m_props.type === "value") ||
                   ((!rangeBand || !hasData) && rangeArray.length === 1 && rangeArray[0] === 0 &&
                     domainArray.length === 1 && domainArray[0] === 0 && m_props.type === "category")    
                );
        };

        var axis = function (selection) {
                var pre = axis.getPreferredSize();
                BoundUtil.drawBound(selection, pre.width, pre.height);
          
                parent = selection;
                //in axis, we cannot use data driven way like
                //        var e = selectDIV.selectAll("p")
                //.data(pdata,function(d){return d;});
             
                //e.enter().append("p")
                //.text(function(d){return d;});

                //e.exit().remove();
                //to control the redraw, because axis is not based on data, but based on scale

                //there should be only one axis Class
                var axisClass = selection.select("." + m_axClassName);

                var rangeArray = m_scale.range();
                var domainArray = m_scale.domain();
                if(!drawAll())
                {
                    //remove all the axis 
                    //to improve the performance, we should remove as less elements as possible.
                    axisClass.remove();
                }
                else
                {
                    //---we should dicide show or hide somethings because of the spaceLimit
                    var spacings = axis.getPreferredSize().spacings;

                    var titleSpace = spacings[0];
                    var bodySpace = 0;
                    for(var i = 1; i < spacings.length; i++)
                    {
                        bodySpace += spacings[i];
                    }

                    if(m_spaceLimit >= 0 && m_spaceLimit < (titleSpace + bodySpace))
                    {
                        m_isTitleVisible = false;
                    }

                    prepareProperties();

                    var core;
                    var coreScale;
                    var re = getCoreAndScale();
                    core = re.core;
                    coreScale = re.coreScale;

                    //the axis body
                    var axisCore = core()
                                  .properties(m_props)
                                  .style(m_style)
                                  .position(m_props.position)
                                  .axScale(coreScale)
                                  .spaceLimit(m_spaceLimit)
                                  .matrix(m_matrix)
                                  .labelAngle(labelAngle)
                                  .labelAlign(labelAlign)
                                  .angle(angle)
                                  .tickAngle(tickAngle);

                    var axisBody;
                    if(axisClass.empty())
                    {
                        axisClass = selection.append("g")
                                 .attr("class", m_axClassName);

                        axisBody = axisClass.append("g")
                                  .attr("class", m_axBodyClassName);
                    }
                    else
                    {
                        //redraw axis body
                        var e=axisClass.select("." + m_axBodyClassName).remove();

                        axisBody = axisClass.append("g")
                                  .attr("class", m_axBodyClassName);

                        axisBody = axisClass.select("." + m_axBodyClassName);
                    }

                    if(drawBody())
                    {
                        axisBody.call(axisCore);
                    }

                    //build axis title Text
                    var title = "";
                    if(m_props.title.text !== undefined && m_props.title.text !== null)
                    {
                        title = m_props.title.text;
                    }
                    else
                    {
                        if(m_props.type === "value")
                        {
                            if(m_title) 
                            {
                                title = m_title;
                            }
                            else
                            {
                                title = langManager.get('IDS_ISNOVALUE');
                            }
                        }
                        else //let us build the title!
                        {
                            var dataset = [];
                            if(m_props.isIndependentMode)
                            {
                                if(m_data)
                                {
                                    for(var dataObj in m_data)
                                    {
                                        if (m_data.hasOwnProperty(dataObj))
                                        {
                                            dataset = m_data[dataObj].values;
                                            break;
                                        }
                                    }
                                }
                            }
                            else
                            {
                                if(m_dataAxis)
                                {
                                    dataset = m_dataAxis.values;
                                }
                            }

                            for(var k = 0 ; k < dataset.length; k++)
                            {
                                if(dataset[k].type)
                                {
                                    if(dataset[k].type === "MND" && k === 0)
                                    {
                                        title += langManager.get('IDS_DEFAULTMND') + ((dataset.length === 1)? "" : " - ");
                                    }
                                    else if(dataset[k].type === "MND" && k === (dataset.length-1))
                                    {
                                        title += " - " + langManager.get('IDS_DEFAULTMND');
                                    }
                                }
                                else
                                {
                                    if(dataset[k].col.val)
                                    {
                                        title += dataset[k].col.val;
                                    }
                                    else
                                    {
                                        title += langManager.get('IDS_ISNOVALUE');
                                    }

                                    if(k !== (dataset.length-1) && !dataset[k+1].type)
                                    {
                                        title += " / ";
                                    }
                                }
                            }
                        }
                    }
                    

                    //redraw axis title
                    var titleOffset = m_titleOffset;
                    axisClass.select("." + m_axTitleClassName).remove();

                    if(drawTitle())
                    {
                        if(m_props.title.visible && m_isTitleVisible)
                        {  
                            var pSize = axisCore.getPreferredSize();
                            var axTitle = axisClass.append("g")
                                  .attr("class", m_axTitleClassName)
                                  .append("text")
                                  .attr("text-anchor", "middle")
                                  .attr("fill", m_style.title.fill)
                                  .attr("font-size", m_style.title['font-size'])
                                  .attr("font-weight", m_style.title['font-weight'])
                                  .attr("font-family", m_style.title['font-family']); // text-align
                                  
                            if(m_props.position === "bottom")
                            {
                                if(!drawBody())
                                {
                                    pSize.height = 0;
                                }
                                  axTitle.attr("x", pSize.width/2)
                                         .attr("y", pSize.height + titleOffset)
                                         .attr("dominant-baseline", "hanging");//"auto")//"hanging")//"central");
                                    
                                  if(jQuery.browser.msie)
                                  {
                                      //dominant-baseline does not work
                                      var textHeight = m_style.title['font-size'].toString();
                                      var indexPX = textHeight.indexOf("px");
                                      if(indexPX >= 0)
                                      {
                                          textHeight = textHeight.substr(0, indexPX);
                                      }
                                      axTitle.attr("y", Number(axTitle.attr("y")) + textHeight/2);
                                      axTitle.attr("dominant-baseline", "auto");
                                  }

                                TextUtils.ellipsis(title, axTitle.node(), pSize.width, m_style.title.toString());
                            }
                            else if(m_props.position === "top")
                            {
                                if(!drawBody())
                                {
                                    pSize.height = 0;
                                }

                                titleHieght = fastMeasure(title, m_style.title).height;

                                axisBody.attr("transform", "translate(0, " + (titleHieght + titleOffset) + ")");

                                axTitle.attr("x", pSize.width/2)
                                  .attr("y", titleHieght)
                                  .attr("dx", "0") // padding-right
                                  .attr("dy", "0") // vertical-align: middle?
                                  .attr("dominant-baseline", "auto");//"auto")//"hanging")//"central")
                                
                                TextUtils.ellipsis(title, axTitle.node(), pSize.width, m_style.title.toString());
                            }
                            else if(m_props.position === "left")
                            {
                                if(!drawBody())
                                {
                                    pSize.width = 0;
                                }

                                //title is vertical
                                titleWidth = fastMeasure(title, m_style.title).height;

                                axisBody.attr("transform", "translate(" + (titleWidth + titleOffset) + ", " + 0 + ")");

                                var centerX = titleWidth;
                                var centerY = pSize.height/2;
                                var ac = "-90";

                                //axisClass.append("circle").attr("cx", centerX).attr("cy", centerY). attr("r", 5);
                                axTitle.attr("transform","rotate( " + ac + " " + centerX + " "  + centerY + " )")
                                  .attr("x", centerX)
                                  .attr("y", centerY)
                                  .attr("dominant-baseline", "auto");//"auto")//"hanging")//"central")
                                
                                TextUtils.ellipsis(title, axTitle.node(), pSize.height, m_style.title.toString());
                            }
                            else// if(m_props.position == "right")
                            {
                                if(!drawBody())
                                {
                                    pSize.width = 0;
                                }

                                //title is vertical
                                titleWidth = fastMeasure(title, m_style.title).height;
                                
                                centerX = pSize.width + titleWidth/2 + titleOffset;
                                centerY = pSize.height/2;
                                var ac = "-90";

                                //axisClass.append("circle").attr("cx", centerX).attr("cy", centerY). attr("r", 5);
                                axTitle.attr("transform","rotate( " + ac + " " + centerX + " "  + centerY + " )")
                                  .attr("x", centerX)
                                  .attr("y", centerY - titleWidth/2)
                                  .attr("dominant-baseline", "hanging")//"auto")//"hanging")//"central")

                                if(jQuery.browser.msie)
                                {
                                    //dominant-baseline does not work
                                    var textHeight = m_style.title['font-size'].toString();
                                    var indexPX = textHeight.indexOf("px");
                                    if(indexPX >= 0)
                                    {
                                        textHeight = textHeight.substr(0, indexPX);
                                    }

                                    centerY = Number(pSize.height/2) + textHeight/2;
                                    axTitle.attr("y", centerY);
                                    axTitle.attr("dominant-baseline", "auto");
                                }

                                TextUtils.ellipsis(title, axTitle.node(), pSize.height, m_style.title.toString());
                            }
                        }
                    }
                    m_isTitleVisible = true;
                }
                
            eDispatch.initialized();
            
            return axis;
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
          labelAngle = pmod( _, 360);
          return axis;
        };
        
        axis.tickAngle = function(_){
          if(!arguments.length){
            return tickAngle;
          }
          tickAngle =pmod( _, 360);
          return axis;
        };
        
        axis.angle = function(_){
          if(!arguments.length){
            return angle;
          }
          angle = pmod( _, 360);
          return axis;
        };
        
        function pmod(a,m)
        {
          var ret = a % m;
          if (0 > ret)
            ret += m;
          return ret;
        }
        
        axis.labelAlign = function(_){
          if(!arguments.length){
            return labelAlign;
          }
          labelAlign = _;
          return axis;
        };
        
        axis.parent = function (_) {
          if ( !arguments.length ) return parent;
          parent = _;
          return axis;
        };

        axis.width = function(_width) {
            if (arguments.length == 0) {
                return m_width;
            }
            else {
                m_width = _width;

                if(m_props.position == "bottom" || m_props.position == "top")
                {
                    if(m_height)
                    {
                        m_spaceLimit = m_height;

                    }
                }
                else if(m_props.position == "left" || m_props.position == "right")
                {
                    if(m_width)
                    {
                        m_spaceLimit = m_width;
                    }
                }

                return axis;
            }
        };

        axis.height = function(_height) {
            if (arguments.length == 0)
                return m_height;
            
            m_height = _height;
            if(m_props.position == "bottom" || m_props.position == "top")
            {
                if(m_height)
                {
                    m_spaceLimit = m_height;

                }
            }
            else if(m_props.position == "left" || m_props.position == "right")
            {
                if(m_width)
                {
                    m_spaceLimit = m_width;
                }
            }

            
            return axis;
        };

        axis.gridlineLength = function(_gridlineLength) {
            if (arguments.length == 0)
                return m_props.gridline.length;
            m_props.gridline.length = _gridlineLength;
            return axis;
        };

        axis.startPadding = function() {
            var padding = 0;
            if(m_props.type == "value")
            {
                padding = valueAxisCore()
                         .properties(m_props)
                         .style(m_style)
                         .position(m_props.position)
                         .axScale(m_scale)
                         .startPadding();
            }
            return padding;
        };

        axis.endPadding = function() {
            var padding = 0;
            if(m_props.type == "value")
            {
                padding = valueAxisCore()
                         .properties(m_props)
                         .style(m_style)
                         .position(m_props.position)
                         .axScale(m_scale)
                         .endPadding();
            }
            return padding;
        };

        axis.size = function(_size) {
            if (arguments.length == 0)
                return {
                           "width" : m_width,
                           "height": m_height,
                       };
            m_width = _size.width;
            m_height = _size.height;
            return axis;
        };
        
        /*
         * Jimmy/9/22/2012 if axis works under independentMode(boxplot for now)
         * it doesn't rely on the data passed through this API from container, instead, boxplot
         * will pass calculated data through dependency 
         */
        axis.independentData = function(_data) {
          if(m_props.isIndependentMode) {
            if (arguments.length == 0)
                return m_data;
            m_data = _data;
          }
        },

        axis.data = function(_data) {
            if (arguments.length == 0)
                return m_data;
            
            if(!m_props.isIndependentMode)
            {
              m_data = _data;
              if(_data.getAnalysisAxisDataByIdx)
              {
                m_dataAxis = m_data.getAnalysisAxisDataByIdx(0);
              }
            }
            return axis;
        };

        axis.title = function(_title) {
            if (arguments.length == 0)
                return m_title;
            m_title = _title;
            return axis;
        };

        axis.properties = function(_properties) {
            if (arguments.length == 0){
                return m_props;
            }

            Objects.extend(true, m_props, _properties);

            if(_properties.color)
            {
                m_props.customizedColor = _properties.color;
            }

            return axis;
        };

        axis.range = function() {
            var range = null;
            if ((m_props.type === "value") && (m_props.scale.fixedRange)) {
                if ((m_props.scale.maxValue !== null) && (m_props.scale.minValue !== null)) {
                    range = {
                        max : m_props.scale.maxValue,
                        min : m_props.scale.minValue,
                        from : 'axis'
                    };
                }
            }
            return range;
        }

        axis.scale = function(_scale) {
            if (arguments.length == 0)
                return m_scale;

            m_scale = _scale;
            return axis;
        };

        axis.isDrawBody = function(_isDrawBody) {
            if (arguments.length == 0)
                return m_isDrawBody;

            m_isDrawBody = _isDrawBody;
            return axis;
        };

        axis.color = function(_color) {
          if (arguments.length == 0)
              return m_props.color;
          if (m_props.customizedColor){
            _color = m_props.customizedColor;              
          }
          if(!_color){
              _color = m_defaultColor;
          }

          m_props = Objects.extend(true, m_props, {"color":_color});

          if (m_props.title.applyAxislineColor && _color) {
            m_style.title.fill = _color;
          }

          return axis;
        };

        axis.drawable = function(_drawable) {
            //drawable or not because of smart layout
            if (arguments.length == 0)
                return m_drawable;

            m_drawable = _drawable;

            return axis;
        };

        axis.getPreferredSize = function() {
            getThemeStyleDef();
            var rangeArray = [0];
            var domainArray = [0];
            if(m_scale)
            {
                rangeArray = m_scale.range();
                domainArray = m_scale.domain();
            }

            if(!m_scale || (!drawAll()) )            
            {
                return {
                    width : 0,
                    height : 0,
                    manual: false,
                };
            }
            else {
                //body size && title size
                var reCS = getCoreAndScale();
                var axisCore = (reCS.core)()
                              .properties(m_props)
                              .style(m_style)
                              .position(m_props.position)
                              .axScale(reCS.coreScale)
                              .spaceLimit(m_spaceLimit);
                
                var title, resultSize;
                if(m_props.title.visible && m_props.visible)
                {
                    //console.log(m_props.title.text);
                    if(m_props.title.text !== undefined && m_props.title.text !== null)
                    {
                        title = m_props.title.text;
                    }
                    else
                    {
                        title = "Value";
                    }
                }
                
                var titleHieght = 0;
                var titleWidth = 0;
                var titleOffset = 0;
                var axisSpacings = [];

                var sizeCore = axisCore.getPreferredSize();

                
                if(m_props.position == "bottom" || m_props.position == "top")
                {
                    if(!drawBody())
                    {
                        sizeCore.height = 0;
                        sizeCore.spacings = [];
                    }

                    if(m_props.title.visible && m_props.visible)
                    {
                        titleHieght = fastMeasure(title, m_style.title).height; 
                        titleOffset = m_titleOffset;
                    }

                    var titleSpace = titleHieght + titleOffset;
                    axisSpacings = axisSpacings.concat([titleSpace]);
                    axisSpacings = axisSpacings.concat(sizeCore.spacings);

                    var bodySpace = 0;
                    for(var i = 1; i < axisSpacings.length; i++)
                    {
                        bodySpace += axisSpacings[i];
                    }

                    var fullHeight = titleSpace + bodySpace;
                    var realHeight = fullHeight;
                    
                    if(m_spaceLimit >= 0 && m_spaceLimit < fullHeight)
                    {
                        realHeight = sizeCore.height;//no title
                    }

                    resultSize = {
                        maxSizeConstant : 0.5,
                        width: sizeCore.width,
                        height: fullHeight,
                        realHeight: realHeight,
                        spacings: axisSpacings,
                        manual: false,
                    }
                }
                else if(m_props.position == "left" || m_props.position == "right")
                {
                    if(!drawBody())
                    {
                        sizeCore.width = 0;
                        sizeCore.spacings = [];
                    }

                    if(m_props.title.visible && m_props.visible)
                    {
                        //title is vertical
                        titleWidth = fastMeasure(title, m_style.title).height; 
                        titleOffset = m_titleOffset;
                    }

                    var titleSpace = titleWidth + titleOffset;
                    axisSpacings = axisSpacings.concat([titleSpace]);
                    axisSpacings = axisSpacings.concat(sizeCore.spacings);

                    var bodySpace = 0;
                    for(var i = 1; i < axisSpacings.length; i++)
                    {
                        bodySpace += axisSpacings[i];
                    }

                    var fullWidth = bodySpace + titleSpace;
                    var realWidth = fullWidth;
                    
                    if(m_spaceLimit >= 0 && m_spaceLimit < fullWidth)
                    {
                        realWidth = sizeCore.width;//no title
                    }
                    

                    resultSize = {
                        maxSizeConstant : 0.5,
                        width: fullWidth,
                        realWidth: realWidth,
                        height: sizeCore.height,
                        spacings: axisSpacings,
                        manual: false,
                    }
                }
                if ((m_props.layoutInfo.width > 0) && (m_props.layoutInfo.height > 0) ) {
                    resultSize.width = m_props.layoutInfo.width;
                    resultSize.realWidth = m_props.layoutInfo.width;
                    resultSize.height = m_props.layoutInfo.height;
                    resultSize.realHeight = m_props.layoutInfo.height;
                    resultSize.manual = true;
                }
                return resultSize;
            }
        };

        axis.dispatch = function(_){
          if(!arguments.length)
            return eDispatch;
          eDispatch = _;return axis;
        };
        
        var fastMeasure = function(_text, _style)
        {
            return TextUtils.fastMeasure(_text, _style['font-size'],
                                                _style['font-weight'],
                                                _style['font-family']);
        };

        //Alex Su: to build a hierarchical structure basing on raw data.
        function hasMND(data){
          if (data[0].type === 'MND' || data[data.length - 1].type === 'MND'){
            return true;
          } else {
            return false;
          }
        }
        
        function hasOnlyMND(data){
          if (data.length === 1 && data[0].type === 'MND'){
            return true;
          } else {
            return false;
          }
        }
        
        function isMNDBefore(data){
          if (data[0].type === 'MND'){
            return true;
          } else {
            return false;
          }
        }
        
        function getMNDData(data){
          if (! hasMND(data)){
            return;
          }
          if (isMNDBefore(data)){
            return data[0];
          } else {
            return data[data.length - 1];
          }
        }
        
        function processRawData(data){
          if (! hasMND(data) || hasOnlyMND(data)){
            return data;
          }
          var newData = [];
          var i, j, k;
          for (i = 0; i < data.length; ++i){
            newData.push({
              col: data[i].col,
              rows: []
            });
          }
          var mndData = getMNDData(data);
          var mndLength = mndData.rows.length;
          var cateLength;
          if (isMNDBefore(data)){
            cateLength = data[1].rows.length;
            for (i = 0; i < mndLength; ++i){
              for (j = 0; j < cateLength; ++j){
                newData[0].rows.push(data[0].rows[i]);
              }
            }
            for (i = 1; i < data.length; ++i){
              for (j = 0; j < mndLength; ++j){
                newData[i].rows = newData[i].rows.concat(data[i].rows);
              }
            }
          } else {
            cateLength = data[0].rows.length;
            for (i = 0; i < cateLength; ++i){
              newData[newData.length - 1].rows = newData[newData.length - 1].rows.concat(data[data.length - 1].rows);
            }
            for (i = 0; i < data.length - 1; ++i){
              for (j = 0; j < cateLength; ++j){
                for (k = 0; k < mndLength; ++k){
                  newData[i].rows.push(data[i].rows[j]);
                }
              }
            }
          }
          return newData;
        }
        
        function buildHierarchicalData(data){
          var i,j;
          var categoryHierarchicalData = [];
          var rowData, cellData, spaceCount;
          var tempCellCount, tempSpaceCount;
          for (i = 0; i < data.length; ++i){
            rowData = [];
            spaceCount = 0;
            tempSpaceCount = 0;
            tempCellCount = 0;
            for (j = 0; j < data[i].rows.length; ++j){
              cellData = {};
              if (i === data.length - 1){
                cellData.value = data[i].rows[j];
                cellData.space = 1;
              } else {
                ++spaceCount;
                ++tempSpaceCount;
                if (i > 0 && tempSpaceCount >= categoryHierarchicalData[i - 1][tempCellCount].space){
                  cellData.value = data[i].rows[j];
                  cellData.space = spaceCount;
                  spaceCount = 0;
                  tempSpaceCount = 0;
                  ++tempCellCount;
                }
                else {
                  if (j + 1 < data[i].rows.length && data[i].rows[j].val === data[i].rows[j + 1].val){
                    continue;
                  }
                  else {
                    cellData.value = data[i].rows[j];
                    cellData.space = spaceCount;
                    spaceCount = 0;                  
                  }
                }                
              }
              rowData.push(cellData);
            }
            categoryHierarchicalData.push(rowData);
          }
          return categoryHierarchicalData;
        }
                
        function processData(data){
          var newData = processRawData(data);
          var hierarchicalData = buildHierarchicalData(newData);
          return hierarchicalData;
        }
        
        function reverseHierarchicalData(hData){
          for (var i = 0; i < hData.length; ++i){
            hData[i].reverse();
          }
        }
        
        var getCoreAndScale = function()
        {
            var re = { };
            var coreScale;
            if(m_props.type == "category") //a new scale is required
            {
                coreScale = [];
                //build labels (domain)
                var dataset = [];
                if(m_props.isIndependentMode) {
                    for(dataObj in m_data) {
                        dataset = m_data[dataObj].values;
                    }
                } else {
                    if(m_dataAxis) {
                        dataset = m_dataAxis.values;
                    }
                }
                var hierarchicalData = [];
                if (dataset && dataset.length){
                  hierarchicalData = processData(dataset);
                }
                //reverse domain or not,
                var oRange = m_scale.range();
                //by yuanhao 2012-12-17 ,
                if(oRange[0] > oRange[oRange.length -1 ])
                {
                    reverseHierarchicalData(hierarchicalData);
                }
                //if orRangeBand is 0, which means module do not use ordinal scale like normal, the scale is not equal every unit.
                var dataCount = hierarchicalData.length === 0 ? 0 : hierarchicalData[hierarchicalData.length - 1].length;
                var orRangeBand = m_scale.rangeBand(), orRangeBands = [];
                
                //Alex Su. Handling for boxplot.
                var isBoxPlotWithSingleAAFeed = false;
                if (dataset && dataset.length > 0 && dataset[0].rows.length === 0){
                  isBoxPlotWithSingleAAFeed = true;
                  dataCount = 1;
                  var cellData = {
                      value: {},
                      space: 1
                  };
                  cellData.value = {
                      val: m_dataAxis.values[0].col.val,
                      ctx:null
                  };
                  hierarchicalData = [[cellData]];
                }
                
                var di;
                if(!m_scale.noEqual){
                  if (! hasOnlyMND(dataset) && ! isBoxPlotWithSingleAAFeed){
                    for(di = 0; di < dataCount; di++){
                        orRangeBands[di] = orRangeBand;
                    }
                  } else {
                    var tickSpace = parseInt(oRange.length / dataCount, 10);
                    for(di = 0; di < dataCount; di++){
                      orRangeBands[di] = orRangeBand * tickSpace;
                    }
                  }
                }else{
                  for(di = 0; di < dataCount; di++){
                      orRangeBands[di] = Math.abs(oRange[di] - oRange[di+1]);
                  }
                }
                
                function getRangeEnd(endIndex){
                    var sum = 0;
                    for(var ix = 0; ix < endIndex; ix++){
                        sum +=orRangeBands[ix];
                    }
                    return sum;
                }
                var coreScaleItem = {};
                var cgDomain = [];
                var cgRange = [];
                var i, j, spaceCount = 0;
                var rangeStart, rangeEnd;
                for (i = 0; i < hierarchicalData.length; ++i){
                  cgDomain = [];
                  cgRange = [];
                  spaceCount = 0;
                  for (j = 0; j < hierarchicalData[i].length; ++j){
                    cgDomain.push(hierarchicalData[i][j].value);
                    
                    spaceCount += hierarchicalData[i][j].space;
                    rangeStart = j > 0 ? cgRange[j - 1][1] : 0;
                    rangeEnd = getRangeEnd(spaceCount);
                    cgRange.push([rangeStart, rangeEnd]);
                  }
                  var coreScaleItem = { 
                      "domain": cgDomain, 
                      "range":  cgRange,
                   };
       
                  coreScale.push(coreScaleItem);//add to the latest
                }
                
                core = categoryAxisCore;
            }
            else //value axis
            {   
                core = valueAxisCore;
                coreScale = m_scale;
            }
            re.core = core;
            re.coreScale = coreScale;
            re.coreScale.noEqual = m_scale.noEqual;
            return re;
        }
        
        function prepareProperties()
        {
            if (!m_effectManager) return;

            if(m_props.customizedColor) {
                m_props.color = m_props.customizedColor;
            }
            var parameter = {
                    drawingEffect : 'normal',
                    fillColor : m_props.color,
            };
            m_props.color = m_effectManager.register(parameter);

            parameter = {
                    drawingEffect : 'normal',
                    fillColor : m_style.label.fill,
            };
            m_style.label.fill = m_effectManager.register(parameter);

            parameter = {
                    drawingEffect : 'normal',
                    fillColor : m_style.title.fill,
            };
            m_style.title.fill = m_effectManager.register(parameter);
        }

        return axis;
    };
});