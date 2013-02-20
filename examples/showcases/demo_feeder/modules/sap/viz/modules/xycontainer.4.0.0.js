sap.riv.module(
{
  qname : 'sap.viz.modules.xycontainer',
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
{  qname : 'sap.viz.manifest',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.handler.SingleChartDataHandler',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.dispatch',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.BoundUtil',
  version : '4.0.0'
}
],
function Setup ( TypeUtils, Objects, Functions, layout, Manifest, SingleChartDataHandler, dispatch, boundUtil) {    
  var retfn = function (manifest, ctx) {
    function load(moduleId) {
      return Manifest.module.get(moduleId).execute(ctx);
    }
      var width = 0, 
          height = 0, 
          properties = {}, 
          data = {},
          config = {},
          modules = {},
          selections = {},
          spaceWithoutPlot,
          parent = null; // a d3 selection
      
      var eDispatch = new dispatch('initialized', 'showTooltip', 'hideTooltip'), initializedModules = 0;;
      var innerProperties = manifest.props(null);
      ///////////////////////can be moved to base container/////////////////////
      var resolveProperties = function(nodeConfig, isContainer){
        var props = {}, // Empty properties basket
            propsCat,   // Property category node
            usrProps,   // User set properties
            sysProps;   // Predefined properties in configure node
        if(isContainer){
          //Jimmy/8/15/2012 pay attention to the property structure, for container we will pass
          //all properties instead of properties under propsCat only.
          if ( nodeConfig ) {
            propsCat = nodeConfig.propertyCategory;
            usrProps = properties;
            sysProps = {};
            sysProps[propsCat] = nodeConfig.properties;
            Objects.extend( true, props, sysProps, usrProps ); 
          }else{
            props = properties;
          }
        }else{
          if ( nodeConfig ) {
            propsCat = nodeConfig.propertyCategory;
            usrProps = properties[ propsCat ];
            sysProps = nodeConfig.properties;
            // User properties will override predefined properties 
            Objects.extend( true, props, sysProps, usrProps );
          }
        }
        return props;
    };
    
    var updateProperties = function (id, isContainer){
      var moduleManifest = config.modules; // Module configurations
      var props, nodeConfig, propsCat;
      if ( moduleManifest[id] && modules[id] ) {
        nodeConfig = moduleManifest[id].configure;
        if (isContainer){
          props = properties;
        }
        else {
          if (nodeConfig){
            propsCat = nodeConfig.propertyCategory;
            props = Objects.extend(true, {}, properties[propsCat]);
          }
          else{
            props = {};
          }
        }
        modules[id].properties(props);
      }
    };
    ///////////////////////can be moved to base container/////////////////////
    
    function initialize() {
      if ( TypeUtils.isEmptyObject(config) ) Functions.error('Container configuration missing');
      
      initializedModules = 0;
      
      initAxis('xAxis');
      initAxis('yAxis');
      initAxis('xAxis2');
      initAxis('yAxis2');
      initAxis('background');
      
      var plotConfig = config.modules.plot;
      if ( !plotConfig ) return;
      var plot = modules.plot = load(plotConfig.id);
      var dataHandler = new SingleChartDataHandler(data); 
      plot.data(dataHandler.getDataAdapter());
      
      var props;
      if ( plotConfig.configure ) {
        props = resolveProperties(plotConfig.configure);
        plot.properties(props);
      }
      
      if(plot.dispatch){
        var dis =  plot.dispatch();
        if(dis.initialized) { initializedModules++; dis.on('initialized.xycontainer', initialized);};
        if(dis.showTooltip) dis.on('showTooltip.xycontainer', showTooltip);
        if(dis.hideTooltip) dis.on('hideTooltip.xycontainer', hideTooltip);
      }
      
      var dataLabelConfig =  config.modules.dataLabel;
      if(TypeUtils.isExist(dataLabelConfig) && TypeUtils.isExist(plot.dataLabel)){
        var dataLabel = modules.dataLabel = load(dataLabelConfig.id);
        plot.dataLabel(dataLabel);
        dataLabel.plot(plot);
        if ( dataLabelConfig.configure ) {
          props = resolveProperties(dataLabelConfig.configure);
          dataLabel.properties(props);
        }
      }
      
      if ( modules.xAxis && !selections.xAxis )
        selections.xAxis = parent.append('g').attr('class', 'xAxis');
      if ( modules.xAxis2 && !selections.xAxis2 )
        selections.xAxis2 = parent.append('g').attr('class', 'xAxis2');
      if ( modules.yAxis && !selections.yAxis ) 
        selections.yAxis = parent.append('g').attr('class', 'yAxis');
      if ( modules.yAxis2 && !selections.yAxis2 ) 
        selections.yAxis2 = parent.append('g').attr('class', 'yAxis2');
      if ( modules.plot && !selections.plot ) 
        selections.plot = parent.append('g').attr('class', 'plot');
      if ( modules.background && !selections.background ) 
        selections.background = parent.insert('g', ':first-child').attr('class', 'background');        
    }
    
    function updateAxisData ( id ) {
      if(modules[id]){
        var axisConfig = config.modules[id];
        var axisDataConfig = axisConfig.data;
        if (axisDataConfig) {
          modules[id].data(data.createDataAdapterForModule(axisDataConfig));
        } 
      }  
    };
    
    function initAxis( id ) {
      if ( !config.modules[id] ) return;
      
      var axisConfig = config.modules[id],
          axis = modules[id] = load(axisConfig.id); // Saves references to axis function.
      
      updateAxisData(id);

      var props = resolveProperties(axisConfig.configure);
      axis.properties(props);
      
      if(axis.dispatch && axis.dispatch()['initialized']){
        initializedModules++;
        axis.dispatch().on('initialized.xycontainer', initialized);
      }
    }
    
    function relayout() {
      if ( TypeUtils.isEmptyObject(modules) || !width || !height) return;
      
      width = width < 0 ? 0 : width;
      height = height < 0 ? 0 : height;
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
      if ( modules.plot ) prefs.center = {};
      
      var solution = layout({
        type : 'border',
        bias : 'none',
        size : { width : width, height : height },
        prefs : prefs
      });

      //we have to layout top and bottom axes firstly, because if you change the size of top or bottom axes, the 
      //height of the axis may be changed (vertical label). Left and right axes have no vertical labels.
      if ( solution.east ) {
        // Modifies yAxis height and coordinate to handle vertical offset
        // to ensure joints with xAxis.
        var yAxis2Height = 0, yAxis2Y = 0;
        if ( solution.south ) {
          yAxis2Height = solution.east.bounds.height - solution.south.bounds.height;
          yAxis2Y = solution.east.bounds.y;
        }
        if ( solution.north ) {
          yAxis2Height = solution.east.bounds.height - solution.north.bounds.height;
          yAxis2Y = solution.west.bounds.y;
        }
        
        selections.yAxis2.attr('transform', 
          'translate(' + solution.east.bounds.x + ',' + yAxis2Y + ')');
        
        modules.yAxis2
          .width(solution.east.bounds.width)
          .height(yAxis2Height);
          
        modules.yAxis2.gridlineLength(solution.center.bounds.width); 
      } else if(modules.yAxis2) {
          modules.yAxis2.drawable(false);
      }

      if ( solution.north ) {
        
        var xAxis2Width = 0, xAxis2X = 0;
        if ( solution.west ) {
          xAxis2X = solution.north.bounds.x + solution.west.bounds.width;
        }

        selections.xAxis2.attr('transform', 
          'translate(' + xAxis2X + 
          ',' + solution.north.bounds.y + ')');

        modules.xAxis2
          .width(xAxis2X)
          .height(solution.north.bounds.height);
          
        modules.xAxis2.gridlineLength(solution.center.bounds.height);    
      } else if (modules.xAxis2) {
          modules.xAxis2.drawable(false);
      }
            
      if ( solution.west ) {
        // Modifies yAxis height and coordinate to handle vertical offset
        // to ensure joints with xAxis.
        var yAxisHeight = 0, yAxisY = 0;
        if ( solution.south ) {
          yAxisHeight = solution.west.bounds.height - solution.south.bounds.height;
          yAxisY = solution.west.bounds.y;
        }
        if ( solution.north ) {
          yAxisHeight = solution.west.bounds.height - solution.north.bounds.height;
          yAxisY = solution.west.bounds.y;
        }
        
        selections.yAxis.attr('transform', 
          'translate(' + solution.west.bounds.x + ',' + yAxisY + ')');
        
        modules.yAxis
          .width(solution.west.bounds.width)
          .height(yAxisHeight);
          
        modules.yAxis.gridlineLength(solution.center.bounds.width);  
      } else if(modules.yAxis) {
          modules.yAxis.drawable(false);
      }

      if ( solution.south ) {

        var xAxisWidth = 0, xAxisX = 0;
        if ( solution.west ) {
            xAxisX = solution.south.bounds.x + solution.west.bounds.width;
        }

        selections.xAxis.attr('transform', 
          'translate(' + xAxisX + 
          ',' + solution.south.bounds.y + ')');
          
        modules.xAxis
          .width(solution.south.bounds.width)
          .height(solution.south.bounds.height);
          
        modules.xAxis.gridlineLength(solution.center.bounds.height);
      }else if (modules.xAxis) {
          modules.xAxis.drawable(false);
      }

      //we should adjust the axes start and end padding
      //todo: add more padding
      var rightPadding = 0, rightPaddingxAxis = rightPaddingxAxis2 = 0;
      if(!solution.east)
      {
          if(modules.xAxis)
          {
            rightPaddingxAxis = modules.xAxis.endPadding();
          }
          if(modules.xAxis2)
          {
            rightPaddingxAxis2 = modules.xAxis2.endPadding();
          }
          rightPadding = rightPaddingxAxis > rightPaddingxAxis2 ? rightPaddingxAxis : rightPaddingxAxis2;
      }
      
      // if (!solution.south && modules.xAxis) {
          // modules.xAxis.drawable(false);
      // }
      // if (!solution.north && modules.xAxis2) {
          // modules.xAxis2.drawable(false);
      // }
            
      if ( solution.center ) {
        selections.plot.attr('transform', 
          'translate(' + solution.center.bounds.x + 
          ',' + solution.center.bounds.y + ')');
        var plotWidth = solution.center.bounds.width - rightPadding;
        modules.plot
          .width(plotWidth > 0 ? plotWidth : 0)
          .height(solution.center.bounds.height > 0 ? solution.center.bounds.height : 0);
        
        spaceWithoutPlot = width - plotWidth;

        if (selections.background) {
            selections.background.attr('transform', 
              'translate(' + solution.center.bounds.x + 
              ',' + solution.center.bounds.y + ')');
            modules.background
              .width(plotWidth > 0 ? plotWidth : 0)
              .height(solution.center.bounds.height > 0 ? solution.center.bounds.height : 0);
        }          
      }
      if ( solution.west )
      {
        modules.yAxis.gridlineLength(solution.center.bounds.width - rightPadding); 
      }
      
    }
    
    function container( selection ) {
      selection.each(function ( data ) {
        boundUtil.drawBound(selection, width, height);
        parent = selection;
        if ( TypeUtils.isEmptyObject(modules) ) initialize();
        render();
      });
      return container;
    }
    
    container.width = function (_) {
      if ( !arguments.length ) return width;
      width = _;
      //Jimmy,8/20/2012, as a container, you don't know whether your
      //sub elements need relayout even if the container size remains
      //the same. so here we just give a chance to sub elements to relayout
      relayout();
      return container;
    };
    
    container.height = function (_) {
      if ( !arguments.length ) return height;
      height = _;
      //see @width
      relayout();
      return container;
    };
    
    container.size = function(_) {
      if ( !arguments.length ) return {
        'width' : width,
        'height' : height
      };
      height = _.height;
      width = _.width;
      //see @width
      relayout();
      return container;
    };
    
    container.data = function (_) {
      if ( !arguments.length ) return data;
      data = _;
      if(!TypeUtils.isEmptyObject(modules)){
        //plot exists, we need update its data
        var dataHandler = new SingleChartDataHandler(data); 
        modules.plot.data(dataHandler.getDataAdapter());
        updateAxisData('xAxis');
        updateAxisData('yAxis');
        updateAxisData('xAxis2');
        updateAxisData('yAxis2');
      }
      
      return container;
    };
    
    container.properties = function (_) {
      if ( !arguments.length ) return innerProperties;
      properties = _;
      if(!TypeUtils.isEmptyObject(modules)){
        updateProperties('xAxis');
        updateProperties('xAxis2');
        updateProperties('yAxis');
        updateProperties('yAxis2');
        updateProperties('plot');
        updateProperties('dataLabel');
        updateProperties('background');
      }
      return container;
    };
    
    container.config = function (_) {
      if ( !arguments.length ) return config;
      config = _;
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
      if ( !arguments.length ) return parent;
      parent = _;
      return container;
    };
      
    container.dispatch = function(_){
        if ( !arguments.length) return eDispatch;
        eDispatch = _;
        return container;
    };
    
    container.infoForSizeLegend = function(){
            return {
              space : spaceWithoutPlot,
              number : 1,
              plotHeight : modules.plot.height()
            };
    };
    
    container.rotate = function(_) {
        var plot = modules.plot;
        if (!arguments.length) return plot.rotate();
        plot.rotate(_);
        return container;
    };
    
    function render() {
      for ( var sel in selections ) {
        if ( selections.hasOwnProperty(sel) ) {
          selections[sel].datum(modules[sel].data()).call(modules[sel]);
        }
      }
      if(TypeUtils.isExist(modules.dataLabel)){
        modules.dataLabel();
      }
    }
    
    var initializedCount = 0;
    function initialized(){
      if(initializedModules == ++initializedCount){
        initializedCount = 0;
        eDispatch.initialized();
      }
    };
    
    function showTooltip(evt){
        eDispatch.showTooltip(evt);
    };
    
    function hideTooltip(evt){
        eDispatch.hideTooltip(evt);
    };
    
    return container;
  };
  
  return retfn;
});