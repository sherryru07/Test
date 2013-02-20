sap.riv.module(
{
  qname : 'sap.viz.modules.scattermatrixcontainer',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.layout',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.handler.MultiChartDataHandler',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifest',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.TextUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.dispatch',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.BoundUtil',
  version : '4.0.0'
}
],
function Setup(TypeUtils, Objects, Functions, layout, MultiChartDataHandler, Manifest, TextUtils, dispatch, langManager, boundUtil) {

    return function(manifest, ctx) {
        var width = 0, height = 0, subWidth = 0, subHeight = 0,
        properties = {}, data = {}, config = {}, modules = {}, selections = {}, parent = null, // a d3 selection
        dataHandler = null, plotLabels = [];
        var plotTitleVisible = true;
        var isTitleHidden = false;
        var eDispatch = new dispatch('initialized', 'showTooltip', 'hideTooltip'), avaPlotCount = 0;
        var font = {};
        var innerProperties = manifest.props(null);

        var handleNull = function(_) {
          if (_ === null || _ === undefined) {
            return langManager.get('IDS_ISNOVALUE');
          } else {
            return _;
          }
        };
    
        function load(moduleId) {
            return Manifest.module.get(moduleId).execute(ctx);
        }
        
        function getThemeStyleDef() {
            var titleStyle = ctx.styleManager.query('viz-matrix-sub-title');
            if(titleStyle) {
                if(titleStyle['fill']){
                    font.fill = titleStyle['fill'];
                }
                if(titleStyle['font-family']){
                    font.family = titleStyle['font-family'];
                }
                if(titleStyle['font-size']){
                    font.size = titleStyle['font-size'];
                }
                if(titleStyle['font-weight']){
                    font.weight = titleStyle['font-weight'];
                }
            }
        };
        
        function initializePlot() {
          var plotConfig = config.modules.plot;
          if (!plotConfig)
              return;
          delete modules.plot;
          modules.plot = [];
          var measureNum = data.getMeasureValuesGroupDataByIdx()[0].values.length;
          for (var colI = 0; colI < measureNum; colI++) {
              for (var rowI = 0; rowI < measureNum; rowI++) {
                  var plotI = modules.plot[rowI * measureNum + colI] = load(plotConfig.id);
                  plotI.config(plotConfig);
                  avaPlotCount++;
                  if(plotI.dispatch){
                      var dis =  plotI.dispatch();
                        if(dis.initialized) dis.on('initialized.scattermatrixcontainer', initialized);
                        if(dis.showTooltip) dis.on('showTooltip.scattermatrixcontainer', showTooltip);
                        if(dis.hideTooltip) dis.on('hideTooltip.scattermatrixcontainer', hideTooltip);
                   }
              }
          }
        }
        
        function updatePlotProperties() {
          if (TypeUtils.isExist(properties.multiLayout) && TypeUtils.isExist(properties.multiLayout.plotTitle) && TypeUtils.isExist(properties.multiLayout.plotTitle.visible)) {
            plotTitleVisible = properties.multiLayout.plotTitle.visible;
            innerProperties.plotTitle.visible = properties.multiLayout.plotTitle.visible;              
          }
          
          var plots = modules.plot;
          if(plots){
            var plotConfig = config.modules.plot;
            if (!plotConfig)
                return;
            var props;
            if (plotConfig.configure) {
                if (plotConfig.configure.propertyCategory) {
                  props = Objects.extend(true, {}, properties[ plotConfig.configure.propertyCategory ]);
               }
            } else {
                props = properties;
            }

            for(var i = 0, len = plots.length; i < len; i++){
              if (props) {
                plots[i].properties(props);
              }
            }
          }
          getThemeStyleDef();
        }
        
        function updatePlotData() {
          plotLabels = [];//can we split data label updating outside?
          dataHandler = new MultiChartDataHandler(data, "measures");
          var measureNum = data.getMeasureValuesGroupDataByIdx()[0].values.length;
          for (var colI = 0; colI < measureNum; colI++) {
              for (var rowI = 0; rowI < measureNum; rowI++) {
                  var dataI = dataHandler.getSubDataAdapterByMeasures({
                      row : rowI,
                      col : colI
                  });
                  var plotI = modules.plot[rowI * measureNum + colI];
                  plotI.data(dataI);
                  
                  var plotLabel = plotLabels[rowI * measureNum + colI];
                  if(!plotLabel) plotLabel = plotLabels[rowI * measureNum + colI] = {};
                  //we may already have other members here in plotLabel, do not remove them while updating
                  plotLabel.empty = (colI == rowI);
                  plotLabel.label = (colI == rowI 
                          ? handleNull(dataI.getMeasureValuesGroupDataByIdx(0).values[0].col) 
                          : handleNull(dataI.getMeasureValuesGroupDataByIdx(0).values[0].col) + ' - ' + handleNull(dataI.getMeasureValuesGroupDataByIdx(1).values[0].col));
              }
          }
        }
        
        function initializePlotElements() {
          delete selections.plot;
          parent.select('.plot').remove();
          if (modules.plot && !selections.plot) {
            var splots = selections.plot = [];
            var plotRoot = selections.plotRoot = parent.append('g').attr('class', 'plot');
            for (var i = 0, len = modules.plot.length; i < len; i++) {
                splots[i] = plotRoot.append('g').attr('class', 'plot' + i);

                var plotI = modules.plot[i];
                var subModules = plotI.parent(splots[i]).modules();

                for (var m in subModules )
                if (subModules.hasOwnProperty(m))
                    modules['plot[' + i + ']' + '.' + m] = subModules[m];
            }
          }
        }

        function initialize() {
            if (TypeUtils.isEmptyObject(config))
                Functions.error('Container configuration missing');

            avaPlotCount = 0;
            initializePlot();
            updatePlotProperties();
            updatePlotData();
            initializePlotElements();
        };
        
        function relayout() {
            if (TypeUtils.isEmptyObject(modules) || !width || !height)
                return;
            
            getThemeStyleDef();
            var measureNum = data.getMeasureValuesGroupDataByIdx()[0].values.length;
            subWidth = width / measureNum;
            subHeight = height / measureNum;
            var labelSize = getMaxLabelSize();
            var labelHeight = labelSize.height;
            if (!plotTitleVisible || labelSize.width > subWidth || labelSize.height > subHeight / 3) {
                labelSize.height = 0;
                isTitleHidden = true;
            }
            for (var colI = 0; colI < measureNum; colI++) {
                for (var rowI = 0; rowI < measureNum; rowI++) {
                    
                    var plotI = modules.plot[rowI * measureNum + colI];
                    var splotI = selections.plot[rowI * measureNum + colI];
                    plotI.width(subWidth).height(subHeight - labelHeight);
                    splotI.attr('transform', 'translate(' + (subWidth * colI) + ',' + (subHeight * rowI) + ')');
                }
            }
        };

        function container(selection) {
            selection.each(function(data) {
                parent = selection;
                boundUtil.drawBound(selection, width, height);
                if (TypeUtils.isEmptyObject(modules)){
                    initialize();
                }
                relayout();
                render();
            });
            return container;
        }


        container.width = function(_) {
            if (!arguments.length)
                return width;
            if (width !== _) {
                width = _;
                relayout();
            }
            return container;
        };

        container.height = function(_) {
            if (!arguments.length)
                return height;
            if (height !== _) {
                height = _;
                relayout();
            }
            return container;
        };

        container.size = function(_) {
            if (!arguments.length)
                return {
                    'width' : width,
                    'height' : height
                };
            if (height !== _.height || width !== _.width) {
                height = _.height;
                width = _.width;
                relayout();
            }
            return container;
        };

        container.data = function(_) {
            if (!arguments.length)
                return data;
            data = _;
            if(!TypeUtils.isEmptyObject(modules)){
              //TODO Jimmy/9/11/2012 currently we can't know
              //whether it's a data change only (without schema change)
              //but we do have chance in new data model. for now, we just
              //update everything

              avaPlotCount = 0;
              initializePlot();
              updatePlotProperties();
              updatePlotData();
              initializePlotElements();
            }
            return container;
        };

        container.properties = function(_) {
            if (!arguments.length)
                return innerProperties;
            properties = _;
            if(!TypeUtils.isEmptyObject(modules)){
              updatePlotProperties();
            }
            return container;
        };

        container.config = function(_) {
            if (!arguments.length)
                return config;
            config = _;
            return container;
        };

        container.modules = function(_) {
            if (!arguments.length) {
                if (TypeUtils.isEmptyObject(modules)) {
                    initialize();
                }
                return modules;
            }
            modules = _;
            return container;
        };

        container.parent = function(_) {
            if (!arguments.length)
                return parent;
            parent = _;
            return container;
        };

        container.dispatch = function(_){
          if( !arguments.length){
            return eDispatch;
          }
          eDispatch = _;
          return container;
        };
        
        function render() {

            if (selections.plot) {
                for (var i = 0, len = selections.plot.length; i < len; i++) {
                    if (plotLabels[i].empty) {
                        renderLabel(selections.plot[i], plotLabels[i], subHeight / 2);
                        initialized();
                    } else {
                        selections.plot[i].datum(modules.plot[i].data()).call(modules.plot[i]);
                        renderLabel(selections.plot[i], plotLabels[i], subHeight);
                    }
                    
                }
            }
            isTitleHidden = false;
        };
        
        function renderLabel(plot, labelObj, ybaseline) {
            if (labelObj.shape) {
                labelObj.shape.remove();
            }
            
            if (isTitleHidden) {
                return;
            }
            
            var labelSize = TextUtils.fastMeasure(labelObj.label, font.size, font.weight, font.family);
            
            labelObj.shape = plot.append('text').attr('class', 'sub-plot-title')
                    .attr('text-anchor', 'middle')
                    .attr('x', subWidth / 2)
                    .attr('y', ybaseline - labelSize.height / 2)
                    .attr('fill', font.fill)
                    .style('font-weight', font.weight).style('font-size', font.size).style('font-family', font.family)
                    .attr('dominant-baseline', 'middle')
                    .style('cursor', 'default');
            TextUtils.ellipsis(labelObj.label, labelObj.shape.node(), subWidth - 5 /* leave some padding */, "font:" + font.weight + ' ' + font.size + ' ' + font.family);
        };
        
        function getMaxLabelSize() {
            var maxWidth = 0, maxHeight = 0;
            for (var i = 0, len = plotLabels.length; i < len; i++) {
                var size = TextUtils.fastMeasure(plotLabels[i].label, font.size, font.weight, font.family);
                maxHeight = size.height > maxHeight ? size.height : maxHeight;
                maxWidth = size.width > maxWidth ? size.width : maxWidth;
            }
            return {
                width : maxWidth,
                height : maxHeight
            };
        }
        
        var initializedPlots = 0;
        function initialized(){
          if(++initializedPlots == avaPlotCount){
            initializedPlots = 0;
            eDispatch.initialized();
          }
        }
        
        function showTooltip(evt){
          eDispatch.showTooltip(evt);
        };
        
        function hideTooltip(evt){
          eDispatch.hideTooltip(evt);
        };
        
        return container;
    };

});