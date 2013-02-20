sap.riv.module(
{
  qname : 'sap.viz.modules.tablecontainer',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.layout',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.DimensionalInfoHandler',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.handler.MultiChartDataHandler',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifest',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.MultiAxesDataAdapter',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.dispatch',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.BoundUtil',
  version : '4.0.0'
}
],
function Setup ( TypeUtils, Objects, Functions, layout, DIHandler, MCHandler, Manifest, MultiAxesDataAdapter,dispatch, boundUtil) {
  
  var retfn =  function (manifest, ctx) {
    var width = 0, 
        height = 0,
        centerWidth = 0, //size for the real table area without table headers
        centerHeight = 0, 
        properties = {},
        //for containers we use properties to hold any properties we have to pass to sub
        //then we use this internalProps to hold properties for container itself
        internalProps = manifest.props(null),
        internalRange = {}, //used for data range merge
        multiData = {
          
        },//used to save raw data process result
        subModuleNames = [], //used to update sub modules while data updating
        subControllerNames = [], //used to update controllers while data updating  
        data = null,
        config = {},
        modules = {},
        selections = {},
        parent = null, // a d3 selection
        rows = 3,
        columns = 2,
        xCategoryScale = d3.scale.ordinal(),
        yCategoryScale = d3.scale.ordinal(),
        eDispatch = new dispatch('initialized', 'showTooltip', 'hideTooltip'), avaPlotCount = 0, avaModulesCount = 0;
    
    //for container, we won't extract properties exactly for it. so we have to
    //get property by ourselves. the property category should be consistent with
    //module definition
    var PROPERTYCATEGORY = 'multiLayout';
    
    function load(moduleId) {
      return Manifest.module.get(moduleId).execute(ctx);
    }
    
    function initialize() {
      if ( TypeUtils.isEmptyObject(config) ) {
        Functions.error('Container configuration missing');
      }
      
      processRawData();
      avaPlotCount = 0, avaModulesCount = 0;
      //Jimmy/9/13/2012 we only support yAxis and xAxis2 for now, the other two won't be initialized
      initAxis(config, 'xAxis', multiData.columnData);
      initAxis(config, 'yAxis', multiData.rowData);
      initAxis(config, 'xAxis2', multiData.columnData);
      initAxis(config, 'yAxis2', multiData.rowData);
      
      initializePlots();
      updateProperties("plot");
      updateProperties("xAxis2");
      updateProperties("yAxis");        
      updatePlotData();
      initializePlotElements();
      
      avaModulesCount = avaModulesCount + avaPlotCount;
    }
    
    function processRawData() {
      delete multiData.contexts;
      delete multiData.columnData;
      delete multiData.rowData;
      delete multiData.dataHandler;
      //get dimensional info
      //FIXME jimmy/8/8/2012, we assume to use dimensional layout by default
      //we may need support other layouts
      //FIXME jimmy/8/8/2012, how to know which feed is for multiplier?
      var dih = DIHandler({
        'numberOfDimensionsInColumn' : internalProps.numberOfDimensionsInColumn
      }, data.getAnalysisAxisDataByIdx(0));//data['sap.viz.multiplier']);
      
      dih.process();
      
      var rowD = dih.getRowDimensionData();
      var columnD = dih.getColumnDimensionData();
      var contexts = dih.getContexts();
      rows = contexts.length;
      columns = rows > 0 ? contexts[0].length : columns;
      
      var columnData = new MultiAxesDataAdapter();
      columnData.addAnalysisAxis({key:columnData.key, index : 0, values: columnD.values});
      var rowData = new MultiAxesDataAdapter();
      rowData.addAnalysisAxis({key:rowD.key, index : 0, values: rowD.values});
      
      multiData.contexts = contexts;
      multiData.columnData = columnData;
      multiData.rowData = rowData;
      multiData.dataHandler = new MCHandler(data);
    }
    
    function initAxis( config, id , axisData) {
      if ( !config.modules[id] ) {
        return;
      }
      
      var axisConfig = config.modules[id],
          axis = modules[id] = load(axisConfig.id); // Saves references to axis function.
      
      updateAxisData(id, axisData);
          
      var props = {}, usrProps, sysProps;
      if ( axisConfig.configure ) {
        usrProps = properties[axisConfig.configure.propertyCategory] || {};
        sysProps = axisConfig.configure.properties || {};
        Objects.extend( true, props, sysProps, usrProps );
        axis.properties(props);
      }
      
      if(axis.dispatch && axis.dispatch()['initialized']){
        avaModulesCount++;
        axis.dispatch().on('initialized.tablecontainer', initialized);
      }
      
      selections[id] = parent.append('g').attr('class', id);
    }
    
    function updateAxisData (id, axisData) {
      if(modules[id]){
        modules[id].data(axisData);
      }
    }
    
    function initializePlots() {
      var plotConfig = config.modules.plot;
      if ( !plotConfig ) {
        return;
      }
      
      cleanSubControllers();
      cleanSubModules();

      //we will create multi plot here
      var contexts = multiData.contexts;
      var plots = modules.plot = [];
      for(var colI = 0; colI < columns; colI++){
        for(var rowI = 0; rowI < rows; rowI++){
          //contexts returned from dimensionalInfoHandler is rows*column
          var ctxI = contexts[rowI][colI];
          //[Jimmy/8/28/2012]we won't create sub plots when ctxI is undefined. but do we need
          //filter them out of the array? currently we will still have the full-size array with
          //some of them undefined. other parts who need read them should pay attention to (like
          //dependency resolving, and controller etc.)
          if(ctxI){
            
            var i = colI * rows + rowI;
            var plotI = plots[i] = load(plotConfig.id);
            plotI.config(plotConfig);

            if(plotI.dispatch){
              avaPlotCount++;
              var dis =  plotI.dispatch();
                 if(dis.initialized) {
                   dis.on('initialized.tablecontainer', initialized);
                 }
                 if(dis.showTooltip) {
                   dis.on('showTooltip.tablecontainer', showTooltip);
                 }
                 if(dis.hideTooltip) {
                   dis.on('hideTooltip.tablecontainer', hideTooltip);
                 }
            }
            
          }
        }
      }
    }
    
    function updatePlotProperties() {
      var plots = modules.plot;
      if(plots){
        var plotConfig = config.modules.plot;
        if ( !plotConfig ) {
          return;
        }
        //Jimmy/8/23/2012 pay attention to the property structure, for container we will pass
        //all properties instead of properties under propsCat only.
        //FIXME currently it's hard coded here we assume the plot is container, actually we should
        //check the plot type
        var props = null, usrProps, sysProps;
        var nodeConfig = plotConfig.configure;
        if ( nodeConfig ) {
          sysProps = {};
          if ( nodeConfig.propertyCategory ) {
            sysProps[nodeConfig.propertyCategory]  = nodeConfig.properties;
          }
          usrProps = properties;
          props = {};
          Objects.extend( true, props, sysProps, usrProps ); 
        }else{
          props = properties;
        }
        
        for(var i = 0, len = plots.length; i < len; i++){
          if(props && plots[i]){
            plots[i].properties(props);
          }
        }
      }
    }
    //TO FIX: remove this work around.
    function updateProperties(moduleId){
      if (moduleId === 'plot'){
        updatePlotProperties();
      }
      else{
        var module = modules[moduleId];
        if(module){
          var moduleConfig = config.modules[moduleId];
          if ( !moduleConfig ) {
            return;
          }
          var props;
          var nodeConfig = moduleConfig.configure;
          if ( nodeConfig ) {
            props = Objects.extend(true, {}, properties[ nodeConfig.propertyCategory ]);
          }else{
            props = properties;
          }
         module.properties(props); 
        }
      }
    }
    
    function updatePlotData() {
      var dataHandler = multiData.dataHandler;
      var contexts = multiData.contexts;
      var plots = modules.plot;
      for(var colI = 0; colI < columns; colI++){
        for(var rowI = 0; rowI < rows; rowI++){
          //contexts returned from dimensionalInfoHandler is rows*column
          var ctxI = contexts[rowI][colI];
          if(ctxI){
            var i = colI * rows + rowI;
            var dataI = dataHandler.getSubDataAdapter(ctxI);
            if(plots[i]){
              plots[i].data(dataI);
            }  
          }
        }
      }
    }
    
    function initializePlotElements() {
      var plotConfig = config.modules.plot;
      if ( !plotConfig ) {
        return;
      }
           
      var plots = modules.plot;
      var splots = selections.plot = [];
      if(selections.plotRoot){
        selections.plotRoot.remove();
      }
      var plotRoot = selections.plotRoot = parent.append('g').attr('class', 'plot');
      
      for(var colI = 0; colI < columns; colI++){
        for(var rowI = 0; rowI < rows; rowI++){
          var i = colI * rows + rowI;
          if(plots[i]){
            var plotI = plots[i];
            
            //create svg elements
            splots[i] = plotRoot.append('g').attr('class', 'plot' + i);
            plotI.parent(splots[i]);
            
            if(plotI.modules){
              var subModules = plotI.modules();
              var sname;
              for ( var m in subModules ){
                if ( subModules.hasOwnProperty(m) ){
                  sname = 'plot[' + i + ']' + '.' + m;
                  subModuleNames.push(sname);
                  modules['plot[' + i + ']' + '.' + m] = subModules[m];
                }
              }  
            }
            
             //Jimmy/8/22/2012 we introduce controller module which can be configured to any module (except controller module of course)
            //as for now, we only add the support to container. TODO
           
            var nodeController = plotConfig.controllers;
            if(nodeController){
              for(var nc in nodeController){
                if(nodeController.hasOwnProperty(nc)){
                  var controllerConfig = nodeController[nc];
                  var controller = load(controllerConfig.id);
                  controller().module(plotI);
                  var props = {};
                  var propsCat = controllerConfig.propertyCategory;
                  var usrProps = properties[ propsCat ];
                  var sysProps = controllerConfig.properties;
                  Objects.extend( true, props, sysProps, usrProps );
                  controller.properties(props);
                  subControllerNames.push('plot[' + i + ']' + '.' + nc);
                  modules['plot[' + i + ']' + '.' + nc] = controller;
                }
              }
            }
          }
        }
      }
    }
    
    function cleanSubControllers() {
      //clean all current submodules
      for(var i = 0, len = subControllerNames.length; i < len; i++){
        delete modules[subControllerNames[i]];
      }
      subControllerNames = [];
    }
    
    function cleanSubModules () {
      //clean all current submodules
      for(var i = 0, len = subModuleNames.length; i < len; i++){
        delete modules[subModuleNames[i]];
      }
      subModuleNames = [];
    }

    function relayout() {
      if ( TypeUtils.isEmptyObject(modules) || !width || !height ) {
        return;
      }
      
      var prefs = {};
      if ( modules.xAxis ) {
          modules.xAxis.drawable(true);
          prefs.south = { size : modules.xAxis.getPreferredSize() };
      }
      if ( modules.yAxis ) {
          modules.yAxis.drawable(true);
          prefs.west = { size : modules.yAxis.getPreferredSize() };
      }
      if ( modules.xAxis2 ) {
          modules.xAxis2.drawable(true);
          prefs.north = { size : modules.xAxis2.getPreferredSize() };
      }
      if ( modules.yAxis2 ) {
          modules.yAxis2.drawable(true);
          prefs.east = { size : modules.yAxis2.getPreferredSize() };
      }
      if ( modules.plot ) {
        prefs.center = {};
      }
      
      var solution = layout({
        type : 'border',
        bias : 'none',
        size : { width : width, height : height },
        prefs : prefs
      });
      
      centerWidth = solution.center.bounds.width;
      centerHeight = solution.center.bounds.height;
      
      //JIMMY/8/8/2012, WHY WE NEED DO THIS HERE?
      //the first time layout, we haven't set scale to axis (as dependency resolve happens after
       // the first layout), so the preferred size we get from axis is 0. then during dependency
       //resolving, we return scale to axis based on this inaccurate preferred size.
       
       //then during rendering, we will do layout again, this time we get a new preferred size from
       //axis as axis has scale now. but with this new preferred size, the scale has also to be updated,
       //but we won't do dependency resolving anymore. so we have to update the scale here. as axis
       //has the same reference of the scale, it can also get the new scale value.
       
       //so the preferred size returned by axis is actually based on the old scale and thus inaccurate. why
       //it doesn't affect the rendering result? for horizontal axis, the scale only matters the width of the axis
       //which we don't care, we only care height for horizontal axis. for vertical axis, the scale only matters
       //the height of the axis while we only care the width of it during layout.
       
       //so that's why we need layout again before rendering. we want to get the preferredsize from axis
       //even with a wrong scale. if axis can return preferredsize without scale (it's only possible for one
       //direction which is exactly we care during layout), we don't need do this.  
      xCategoryScale.rangeBands([0, centerWidth]);
      yCategoryScale.rangeBands([0, centerHeight]);
      
      if ( solution.north ) {
        // Modifies xAxis width and coordinate to handle horizontal offset
        // to ensure joints with yAxis.
        var xAxis2Width = 0, xAxis2X = 0;
        if ( solution.west ) {
          xAxis2Width = solution.north.bounds.width - solution.west.bounds.width;
          xAxis2X = solution.north.bounds.x + solution.west.bounds.width;
        }
        if ( solution.east ) {
          xAxis2Width = solution.north.bounds.width - solution.east.bounds.width;
        }
        
        selections.xAxis2.attr('transform', 
          'translate(' + xAxis2X + ',' + solution.north.bounds.y + ')');
        
        modules.xAxis2
          .width(xAxis2Width)
          .height(solution.north.bounds.height);
      
        modules.xAxis2.gridlineLength(solution.center.bounds.height);  
      } else if (modules.xAxis2) {
          modules.xAxis2.drawable(false);
      }
      
      if ( solution.east ) {
        selections.yAxis2.attr('transform', 
          'translate(' + solution.east.bounds.x + 
          ',' + solution.east.bounds.y + ')');
        modules.yAxis2
          .width(solution.east.bounds.width)
          .height(solution.east.bounds.height);
          
        modules.yAxis2.gridlineLength(solution.center.bounds.width);    
      } else if (modules.yAxis2) {
          modules.yAxis2.drawable(false);
      }
      
      if ( solution.south ) {
        // Modifies xAxis width and coordinate to handle horizontal offset
        // to ensure joints with yAxis.
        var xAxisWidth = 0, xAxisX = 0;
        if ( solution.west ) {
          xAxisWidth = solution.south.bounds.width - solution.west.bounds.width;
          xAxisX = solution.south.bounds.x + solution.west.bounds.width;
        }
        if ( solution.east ){
          xAxisWidth = solution.south.bounds.width - solution.east.bounds.width;
        }
        
        selections.xAxis.attr('transform', 
          'translate(' + xAxisX + ',' + solution.south.bounds.y + ')');
        
        modules.xAxis
          .width(xAxisWidth)
          .height(solution.south.bounds.height);

        modules.xAxis.gridlineLength(solution.center.bounds.height);
      } else if (modules.xAxis) {
          modules.xAxis.drawable(false);
      }
      
      if ( solution.west ) {
        selections.yAxis.attr('transform', 
          'translate(' + solution.west.bounds.x + 
          ',' + solution.west.bounds.y + ')');
        modules.yAxis
          .width(solution.west.bounds.width)
          .height(solution.west.bounds.height);
      
        modules.yAxis.gridlineLength(solution.center.bounds.width);       
      } else if (modules.yAxis) {
          modules.yAxis.drawable(false);
      }
      
      if ( solution.center ) {
        selections.plotRoot.attr('transform', 
          'translate(' + solution.center.bounds.x + 
          ',' + solution.center.bounds.y + ')');
          
        var centersolution = layout({
          type : 'table',
          bias : 'none',
          size : { width : solution.center.bounds.width, height : solution.center.bounds.height },
          columns : columns,
          rows : rows,
          cellpadding : internalProps.cellPadding,
          paddingThreshold : internalProps.paddingThreshold
        });
        
        for(var colI = 0; colI < columns; colI++){
          for(var rowI = 0; rowI < rows; rowI++){
            var plotI = modules.plot[colI * rows + rowI];
            if(plotI){
              var csi = centersolution[colI][rowI];
              var splotI = selections.plot[colI * rows + rowI];
              plotI.width(csi.bounds.width).height(csi.bounds.height);
              splotI.attr('transform', 
                  'translate(' + csi.bounds.x + 
                  ',' + csi.bounds.y + ')');
            }
          }
        }
      }
    }
    
    
    function dataRange(type) {
        return function(range) {
            if (!arguments.length) {
                return internalRange[type];
            } else {
                if (!internalRange[type]) {
                    internalRange[type] = range;
                } else {
                    var currentRange = internalRange[type];
                    if (range.distinctValuesObj) {
                        for (var i in range.distinctValuesObj) {
                            if (range.distinctValuesObj.hasOwnProperty(i)){
                              currentRange.distinctValuesObj[i] = range.distinctValuesObj[i];
                            }
                        }
                    }
                    
                    if (range.min < currentRange.min) {
                        currentRange.min = range.min;
                    }
                    if (range.max > currentRange.max) {
                        currentRange.max = range.max;
                    }
                    
                    if (range.hasNoValue) {
                      currentRange.hasNoValue = true;
                    }

                }
            }
        };
    }

    
    function resolveMergeDataRange (types){
      //for each type we will generate a function to set/get data range
      for(var i = 0, len = types.length; i < len; i++){
        container[types[i] + 'DataRange'] = dataRange(types[i]);
      }
    }
    
    function parseProperties (props){
      properties = props;
      if(props[PROPERTYCATEGORY]){
        if(props[PROPERTYCATEGORY].mergeDataRange){
          internalProps.mergeDataRange = props[PROPERTYCATEGORY].mergeDataRange;
          resolveMergeDataRange(internalProps.mergeDataRange);
        }
        var formerDimsInCol = internalProps.numberOfDimensionsInColumn;
        Objects.extend(true, internalProps, props[PROPERTYCATEGORY]);
        if (modules.plot && formerDimsInCol !== internalProps.numberOfDimensionsInColumn){
          processRawData();
          internalRange = {};
          updateAxisData('xAxis', multiData.columnData);
          updateAxisData('yAxis', multiData.rowData);
          updateAxisData('xAxis2', multiData.columnData);
          updateAxisData('yAxis2', multiData.rowData);
          updatePlotData();
          relayout();
        }
      }
    }
    
    function buildXCateScale(){
      var domain = [];
      for (var i = 0; i < columns; i++){
         domain.push(i);
      }
      var xAxis = modules.xAxis ? modules.xAxis : modules.xAxis2;
      xCategoryScale.domain(domain).rangeBands([0, centerWidth]);
    }
    
    function buildYCateScale(){
      var domain = [];
      for (var i = 0; i < rows; i++){
         domain.push(i);
      }
      var yAxis = modules.yAxis ? modules.yAxis : modules.yAxis2;
      yCategoryScale.domain(domain).rangeBands([0, centerHeight]);
    }

    function container( selection ) {
      selection.each(function ( data ) {
        parent = selection;
        boundUtil.drawBound(selection, width, height);
        if ( TypeUtils.isEmptyObject(modules) ){ 
          initialize();
        }
        render();
      });
      return container;
    }
    
    container.width = function (_) {
      if ( !arguments.length ) {
        return width;
      }
      width = _;
      //Jimmy,8/20/2012, as a container, you don't know whether your
      //sub elements need relayout even if the container size remains
      //the same. so here we just give a chance to sub elements to relayout
      relayout();
      return container;
    };
    
    container.height = function (_) {
      if ( !arguments.length ) {
        return height;
      }
      height = _;
      //see @width
      relayout();
      return container;
    };
    
    container.size = function(_) {
      if ( !arguments.length ) {
        return {
          'width' : width,
          'height' : height
        };
      }
      height = _.height;
      width = _.width;
      //see @width
      relayout();
      return container;
    };
    
    container.data = function (_) {
      if ( !arguments.length ) {
        return data;
      }
      data = _;
      
      //clean internal data range
      for(var i in internalRange){
        if(internalRange.hasOwnProperty(i)){
          delete internalRange[i];
        }
      }
      
      if(!TypeUtils.isEmptyObject(modules)){
        processRawData();

        avaModulesCount = avaModulesCount - avaPlotCount;
       
        updateAxisData('xAxis', multiData.columnData);
        updateAxisData('yAxis', multiData.rowData);
        updateAxisData('xAxis2', multiData.columnData);
        updateAxisData('yAxis2', multiData.rowData);
        
        avaPlotCount = 0;
        //Jimmy/9/13/2012 we may have chance to split data update and data
        //schema update in the future
        initializePlots();
        updateProperties("plot");
        updateProperties("xAxis2");
        updateProperties("yAxis");        
        updatePlotData();
        initializePlotElements();
        
        avaModulesCount = avaModulesCount + avaPlotCount;
      }
      return container;
    };
    
    container.properties = function (_) {
      if ( !arguments.length ) {
        return internalProps;
      }
      //FIXME JIMMY/8/8/2012, columns/rows may be different with different properties
      parseProperties(_);
      //update properties of sub plots
      if(!TypeUtils.isEmptyObject(modules)){
        //Jimmy/9/19/2012, we may need deal with internalProps.numberOfDimensionsInColumn update
        //we don't need recreate plots but we need rearrange plots and change data
        updateProperties("plot");
        updateProperties("xAxis2");
        updateProperties("yAxis");        
      }
      return container;
    };
    
    container.config = function (_) {
      if ( !arguments.length ) {
        return config;
      }
      config = _;
      return container;
    };
    
    container.xCategoryScale = function (_) {
      if ( !arguments.length ) {
        buildXCateScale();
        return xCategoryScale;
      }
      xCategoryScale = _;
      return container;
    };
    
    container.yCategoryScale = function (_) {
      if ( !arguments.length ) {
        buildYCateScale();
        return yCategoryScale;
      }
      yCategoryScale = _;
      return container;
    };
    
    container.modules = function (_) {
      if ( !arguments.length ) {
        if ( TypeUtils.isEmptyObject(modules) ) {
          initialize();
        } 
        return modules;
      }
      modules = _;
      return container;
    };
    
    container.parent = function (_) {
      if ( !arguments.length ) {
        return parent;
      }
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

    container.infoForSizeLegend = function() {
      var plot;
      for ( var i = -1, j = modules.plot.length; ++i < j;) {
        plot = modules.plot[i];
        if (plot){
          break;
        }
      }
      return {
        space : plot ? (width - centerWidth + plot.infoForSizeLegend().space * columns) : 0,
        number : columns,
        plotHeight : plot ? plot.height() : 0
      };
    };
    
    container.plotRegion = function () {
      return {
        selection: selections.plotRoot,
        width: centerWidth,
        height: centerHeight
      };
    };
    
    function renderAxis (id){
      if(selections[id]){
        parent.select('.' + id).datum(modules[id].data()).call(modules[id]);
      }
    }
    
    function render() {
      renderAxis('xAxis');
      renderAxis('xAxis2');
      renderAxis('yAxis');
      renderAxis('yAxis2');
      
      if(selections.plot){
        for(var i = 0, len = selections.plot.length; i < len; i++){
          if(selections.plot[i]){
            selections.plot[i].datum(modules.plot[i].data()).call(modules.plot[i]);
          }
        }
      }
    }
    
    var initializedPlots = 0;
    function initialized(){
      if(++initializedPlots === avaModulesCount){
        initializedPlots = 0;
        eDispatch.initialized();
      }
    }
    
    function showTooltip(evt){
      eDispatch.showTooltip(evt);
    }
    
    function hideTooltip(evt){
      eDispatch.hideTooltip(evt);
    }
    
    return container;
  };
  
  return retfn;
  
});