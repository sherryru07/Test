sap.riv.module(
{
  qname : 'sap.viz.core',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.mvc.UIController',
  version : '4.0.0'
},
{  qname : 'sap.viz.mvc.D3BasedComponent',
  version : '4.0.0'
},
{  qname : 'sap.viz.mvc.VizApplication',
  version : '4.0.0'
},
{  qname : 'sap.viz.mvc.VizAppDelegate',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifest',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.layout',
  version : '4.0.0'
},
{  qname : 'sap.viz.load',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.xycontainer',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.feed.feeder',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.handler.BaseDataHandler',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.MultiAxesDataAdapter',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.EffectManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.config',
  version : '4.0.0'
},
{  qname : 'sap.viz.StyleManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.parseCSS',
  version : '4.0.0'
},
{  qname : 'sap.viz.TemplateManager',
  version : '4.0.0'
}
],
function Setup( TypeUtils, ObjectUtils, Objects, Functions, UIController, D3Component, VizApplication, VizAppDelegate, manifest, layout, loader, container, Feeder,BaseDataHandler, MultiAxesDataAdapter, EffectManager, langManager, CanvgConfig, StyleManager, parseCSS, TemplateManager) {

  function buildPropertiesTree(obj){
    var returnObj = {};
    for (var i in obj){
      if (obj.hasOwnProperty(i)){
        if (obj[i].supportedValueType === "Object"){
          returnObj[i] = buildPropertiesTree(obj[i].supportedValues);
        }
        else {
          returnObj[i] = obj[i].defaultValue;
        }
      }
    }
    return returnObj;
  }
  function mergeProperties(defaultProp, fullProp){
    var returnProp =Objects.extend(true,{},defaultProp);
    for (var i in defaultProp){
      if (defaultProp.hasOwnProperty(i)){
        if (typeof fullProp === 'object' && fullProp.hasOwnProperty(i)){
          if (defaultProp[i] !== null && typeof defaultProp[i] === 'object' && !(defaultProp[i] instanceof Array)) {
            returnProp[i] = mergeProperties(defaultProp[i],fullProp[i]);
          }
          else {
            if ((fullProp[i] !== undefined && fullProp[i] instanceof Array && defaultProp[i] instanceof Array) || 
                (fullProp[i] !== undefined && typeof fullProp[i] !== 'object')){
              returnProp[i] = fullProp[i];
            }
          }
        }
      }
    }
    return returnProp;
  }

  function extractProperties(modules, chartId){
    var defaultProperties = manifest.viz.get(chartId).allProperties();
    var mergedProperties = {};
    var tempKey;
    var tempProp = {};
    var i, j;
    for(i in modules){
      if (modules.hasOwnProperty(i)){
        if (modules[i].properties && !TypeUtils.isEmptyObject(modules[i].properties())){
          if (i.indexOf('[') > -1){
            if (parseInt(i[i.indexOf('[') + 1],10) > 0){
              continue;
            }
            else {
              tempKey = i.substring(0,i.indexOf('[')) + i.substring(i.indexOf(']') + 1);
            }
          }
          else {
            tempKey = i;
          }
          for (j in defaultProperties){
            if (defaultProperties.hasOwnProperty(j)){
              if (defaultProperties[j].moduleRefPath === tempKey){
                tempProp = buildPropertiesTree(defaultProperties[j]);
                mergedProperties[j] = mergeProperties(tempProp, modules[i].properties());
              }
            }
          }
        }
      }
    }
    return mergedProperties;

  }
  
  function load(moduleId) {
    return manifest.module.get(moduleId).execute();
  }
  

  function dispatchData(moduleConfig, data) {
    var result;
    if (moduleConfig) {
      var dataConfig = moduleConfig.data;
      if (dataConfig) {
        result = data.createDataAdapterForModule(dataConfig);
      }
    }
    return result;
  }
  
  /* Represents the root component. */
  var ChartComponent = ObjectUtils.derive(D3Component, {
    constructor : function ( options ) {
      this._config = options.config;      // Chart configuration
      this._data = options.data;          // Transformed data set
      this._inputProperties = options.options; // Chart properties
      this._properties = {};
      //TODO: support empty data set in module level 
      if(this._data.emptyDataset() === true){
         return;
      }
      
      this._canvas_rootThreshold = d3.select(document.createElement('div')), this._canvas_rootThreshold.append('svg');
      this._canvas_root = d3.select(document.createElement('canvas')).style('width', 0).style('height', 0);
      this._container.prepend(this._canvas_root.node());
      var m_canvg_config = CanvgConfig.get(this._config.id)? CanvgConfig.get(this._config.id): {} ; 
      this._max_svg =  CanvgConfig.enableCanvg() && m_canvg_config.max_svg? m_canvg_config.max_svg : Number.POSITIVE_INFINITY ;
      if(this._data.dataPointCount() > this._max_svg){
        this._root =  this._canvas_rootThreshold.select('svg');
        this._compoennt_status = 'canvg';
      }else{
        this._root = this.getD3Root();      // D3 selection
        this._compoennt_status = 'svg';
      }
      this._modules = {};                 // Chart sub components
      this._subModuleNames = [];    // used to update sub modules when data update
      this._subControllers = [];  //used to update controllers when data update
      this._effectManager = null;
      this._styleManager = new StyleManager();
      this._initialize(options.style);

      //@Alex Su
      this._propertiesIsNewest = false;
      this._outputProperties = {};
      
      this._langManagerListener = {
        fn : this._localeChanged,
        scope : this
      };
      
      this._dispatch = d3.dispatch('dataTruncation');
      
      langManager.addListener(this._langManagerListener);
      
      this._attachEvents(options);
    },
    
    _attachEvents : function(options){
      var events = options.events;
      
      for(var obj in events){
        if(events.hasOwnProperty){
          this.attachEvent(obj, events[obj].fn, events[obj].scope);
        }
      }
    },
    
    //event register strategy
    //1. when modules A, B, C in the same level has this event type dispatch, register this event type on all modules.
    //2. If the module A contain other modules B, C and A, B, C all has this event type dispatch, only register event on this module.
    //3. Also there are event on chart controller, and the event name in chart controller should be unique.
    attachEvent : function(evtType, callback, scope){
      var modules = this.modules(), hittedModules = {};
      var dispatch = this._dispatch;
      
      //we support optional namespace in evtType
      var i = evtType.indexOf(".");
      var typeToCheck = i > 0 ? evtType.substring(0, i) : evtType;
      
      //first check the event on chart controller
      if(dispatch[typeToCheck]){
        dispatch.on(typeToCheck, function(){
          callback.apply(scope, arguments);
        });
      }
      
      for(var m in modules){
        if(modules.hasOwnProperty(m)){
          var slist = m.split('.'),  index = slist.length - 1;
          if(modules[m].dispatch && modules[m].dispatch()[typeToCheck]){
            
            for(var t = 0; t <= index; t++){
              if(hittedModules[t] && hittedModules[t][slist.slice(0, t).toString()]){
                break;
              }
            }
            //if t is larger than index, it means do not exist the parent modules has this event type dispatch.
            if(t > index){
              if(!hittedModules[slist.length]){
                hittedModules[slist.length] = {};
              }
            hittedModules[slist.length][slist.toString()] = modules[m];
            modules[m].dispatch().on(evtType, function(){
              callback.apply(scope, arguments);
            });
            }
          }
        }
      }
    },
    
    _updateSubModules : function(parentModule) {
      //clean all current submodules
      for(var i = 0, len = this._subModuleNames.length; i < len; i++){
        delete this._modules[this._subModuleNames[i]];
      }
      this._subModuleNames.length = 0;
      if(parentModule.modules){
        var subModules = parentModule.modules();
        var sname;                              
        for ( var m in subModules ) {
          if ( subModules.hasOwnProperty(m) ) {
            sname = 'main.' + m;
            this._subModuleNames.push(sname);
            this._modules[sname] = subModules[m];
          }
        }
      }
    },
    
    _updateSubControllers : function(parentModule) {
      for(var i = 0, len = this._subControllers.length; i < len; i++){
        this._modules[this._subControllers[i]].module(parentModule);
      }
    },
    
    //////////////////////Can be moved to base container///////////////////
    _resolveProperties : function(nodeConfig, isContainer){
      var props = {}, // Empty properties basket
          propsCat,   // Property category node
          usrProps,   // User set properties
          sysProps;   // Predefined properties in configure node
      if(isContainer){
        //Jimmy/8/15/2012 pay attention to the property structure, for container we will pass
        //all properties instead of properties under propsCat only.
        if ( nodeConfig ) {
          propsCat = nodeConfig.propertyCategory;
          usrProps = this._properties;
          sysProps = {};
          sysProps[propsCat] = nodeConfig.properties;
          Objects.extend( true, props, sysProps, usrProps );
        }else{
          props = this._properties;
        }
      }else{
        if ( nodeConfig ) {
          propsCat = nodeConfig.propertyCategory;
          usrProps = this._properties[ propsCat ];
          sysProps = nodeConfig.properties;
          // User properties will override predefined properties 
          // upon a merge. FIXME handle array values (Raised by Jimmy)
          Objects.extend( true, props, sysProps, usrProps );
        }
      }
      return props;
    },
    
    _updateProperties : function (id, isContainer){
      var moduleManifest = this._config.modules; // Module configurations
      var props, nodeConfig, propsCat;
      if ( moduleManifest[id] && this._modules[id] ) {
        nodeConfig = moduleManifest[id].configure;
        if (isContainer){
          props = this._properties;
        }
        else {
          if (nodeConfig){
            propsCat = nodeConfig.propertyCategory;
            props = Objects.extend(true, {}, this._properties[propsCat ]);
          }
          else{
            props = {};
          }
        }
        this._modules[id].properties(props);
      }
    },
    
    //TO FIX: delete this
    _updateControllerProperties : function (id){
      var controllersManifest = this._config.modules.main.controllers; // Module configurations
      
      if(controllersManifest === undefined){
        return;
      }
      
      var props, nodeConfig;
      var path = 'main.' + id;
      if ( controllersManifest[id] && this._modules[path] ) {
        nodeConfig = controllersManifest[id].configure;
        props = this._resolveProperties (nodeConfig);
        this._modules[path].properties(props);
      }
    },
    
    //////////////////////Can be moved to base container///////////////////
    
    _initialize : function (style) {
      this._mergeInputProperties();
      //initial effect manager first
      this._effectManager = new EffectManager(this._root.append("svg:defs"), this._data.fakeData());
      
      var ctx = {
        effectManager : this._effectManager,
        styleManager : this._styleManager
      };
      
      this._styleManager.update(style);

      function load(moduleId) {
        return manifest.module.get(moduleId).execute(ctx);
      }
      
      var moduleManifest = this._config.modules; // Module configurations
      var props, nodeController,nodeConfig; // The 'controller' node of modules 
      // Feed data to components for size calculation.
      var legend, legendData = {};
      if ( moduleManifest.legend ) {
         legendData = dispatchData(moduleManifest.legend, this._data);
        legend = load( moduleManifest.legend.id );
        nodeConfig = moduleManifest.legend.configure;
        props = this._resolveProperties(nodeConfig);
        this._modules.legend = legend.data(legendData).properties(props);
        this._root.append('g').attr('class', 'legend');
      }
      
      if ( moduleManifest.sizeLegend ) {
         legendData = dispatchData(moduleManifest.sizeLegend, this._data);
        legend = load( moduleManifest.sizeLegend.id );
        nodeConfig = moduleManifest.sizeLegend.configure;
        props = this._resolveProperties(nodeConfig);
        this._modules.sizeLegend = legend.data(legendData).properties(props);
        this._root.append('g').attr('class', 'sizeLegend');
      }
      
      if ( moduleManifest.title ) {
        var title = load( moduleManifest.title.id );
        nodeConfig = moduleManifest.title.configure;
        props = this._resolveProperties(nodeConfig);
        this._modules.title = title.properties(props);
        this._root.append('g').attr('class', 'title');
      }
      
      if ( moduleManifest.main ) {
        var container = load( moduleManifest.main.id );
        nodeConfig = moduleManifest.main.configure;
        
        //FIXME currently it's hard coded here we assume the plot is container, actually we should
          //check the plot type
        props = this._resolveProperties(nodeConfig, true);
        this._modules.main = container.data(this._data)
                            .config(moduleManifest.main)
                            .properties(props);
        
        // Merge Ian Li's fix to make canvg waiting for chart modules' initialized event
        if(this._modules.main.dispatch && this._modules.main.dispatch()['initialized']){
            var _self = this;
            this._modules.main.dispatch().on('initialized.sap.core', function(){
              _self._exportToCanvas.apply(_self);
            });
          }
          
        this._root.append('g').attr('class', 'main');
        var containerModules = this._modules.main
                              .parent(this._root.select('.main'));
        
        this._updateSubModules(containerModules);
                
        //Jimmy/8/22/2012 we introduce controller module which can be configured to any module (except controller module of course)
        //as for now, we only add the support to container. TODO
        
        nodeController = moduleManifest.main.controllers;
        if(nodeController){
          for(var nc in nodeController){
            if(nodeController.hasOwnProperty(nc)){
              var controller = load(nodeController[nc].id);
              var controllerConfig =  nodeController[nc].configure;
              var propsCat,usrProps,sysProps;
              controller().module(this._modules['main']);
              props = {};
              propsCat = controllerConfig.propertyCategory;
              usrProps = this._properties[ propsCat ];
              sysProps = controllerConfig.properties;
              Objects.extend( true, props, sysProps, usrProps );
              controller.properties(props);
              this._subControllers.push('main.' + nc);
              this._modules['main.' + nc] = controller;
            }
          }
        }   
      }
      
      if ( moduleManifest.tooltip ) {
        var tooltip = load( moduleManifest.tooltip.id );
        nodeConfig = moduleManifest.tooltip.configure;
        props = this._resolveProperties(nodeConfig);
        this._modules.tooltip = tooltip(this._container[0]).properties(props);
      }
     
    },

    // Current layout policy doesn't pass component references
    // to the layout functions, hence only component size and
    // layout preferences are passed and only layout solution
    // is expected to be returned.
    _doLayout : function ( newSize, actualLayout ) {
      var vgap = 8, padding = 20; //2em . 1em = 10px in sdk
      // reduce padding when chart size is small
      if (newSize.width < padding * 10) {
          padding = newSize.width / 10;
      }
      if (newSize.height < padding * 10) {
          padding = newSize.height / 10;
      }
      var preferences = {};
      
      if ( this._modules.title ) {
        preferences.north = { size : this._modules.title.getPreferredSize() };
      }
      //FIXME Elliott/8/20/2012, need support different legend position
      var preferenceEast = { width : 0, height: 0, minWidth: 0, maxSizeConstant: 1 }, 
        sizeLegendPS = { 
            width : 0, 
            height: 0,
            titleSize : {
                width : 0,
                height : 0
            }
        },
        legendPS = { 
            width : 0, 
            height: 0,
            titleSize : {
                width : 0,
                height : 0
            }
        };
      if ( this._modules.legend ) {
        legendPS = this._modules.legend.getPreferredSize(newSize);
        preferenceEast.width = Math.max ( preferenceEast.width, legendPS.width );
        preferenceEast.height = Math.max ( preferenceEast.height, legendPS.height );
        preferenceEast.minWidth = Math.max ( preferenceEast.minWidth, legendPS.minWidth );
        preferenceEast.minHeight = legendPS.minHeight;
        preferenceEast.maxSizeConstant = Math.min ( preferenceEast.maxSizeConstant, legendPS.maxSizeConstant );
      }
      
      preferences.east = { size : preferenceEast };
      if ( this._modules.main ) {
        preferences.center = {};
      }

      function layoutSolution() {
        return layout({
          type : 'border',
          hgap : 8,
          vgap : vgap,
          bias : 'north', // default bias is north
          size : {
            width : newSize.width,
            height : newSize.height
          },
          padding : [ padding, padding, padding, padding ],
          prefs : preferences
        });
      }

      var solution = layoutSolution();

      // by Jia Liu
      // only for size legend.
      if (actualLayout && this._modules.sizeLegend && this._modules.sizeLegend.isVisible()) {
        if (solution.center) {
          // only update size for container to force container layout
          // internally
          this._modules.main.width(solution.center.bounds.width)
              .height(solution.center.bounds.height);
  
          // call container's API infoForSizeLegend to calculate correct
          // max bubble size and size legend size
          sizeLegendPS = this._modules.sizeLegend.getPreferredSize(
              newSize, vgap + 2 * padding, this._modules.main
                  .infoForSizeLegend());
          var legendWidth = Math.max(sizeLegendPS.width, legendPS.width);
          preferenceEast.width = legendWidth < newSize.width * 1/3 ? legendWidth : newSize.width * 1/3;
          preferenceEast.height = sizeLegendPS.height;
          preferenceEast.minWidth = sizeLegendPS.minWidth;
          preferenceEast.minHeight = sizeLegendPS.minHeight;
  
          // use size legend size as preferred size to layout again
          solution = layoutSolution();
        }
      }      
      
      if ( solution.north ) {
        this._root.select('.title').attr('visibility', 'visible').attr('transform', 
          'translate(' + solution.north.bounds.x + 
          ', ' + solution.north.bounds.y + ')');
        this._modules.title
          .width(solution.north.bounds.width)
          .height(solution.north.bounds.height);
      } else {
          this._root.select('.title').attr('visibility', 'hidden');
      }

      if ( solution.east ) {
        var eastHeight = solution.east.bounds.height; 
        var eastY = solution.east.bounds.y;
        var sizeLegendHeight = 0;
        var showSizeLegendTitle = true;
        if (sizeLegendPS.height + 8 + legendPS.height > solution.east.bounds.height) {
            showSizeLegendTitle = sizeLegendPS.titleSize.height < sizeLegendPS.height * 1/3 && sizeLegendPS.titleSize.height < solution.east.bounds.height * 1/3;
            
        }
        
        if ( this._modules.sizeLegend ) {
            this._modules.sizeLegend.hide(false);
          this._root.select('.sizeLegend').attr('transform', 
          'translate(' + solution.east.bounds.x + 
          ', '+ eastY +')');
          
          sizeLegendHeight = sizeLegendPS.height;
          if (!showSizeLegendTitle) {
              this._modules.sizeLegend.hideTitle();
              sizeLegendHeight -= sizeLegendPS.titleSize.height;
          }
          
          this._modules.sizeLegend
            .width(solution.east.bounds.width)
            .height(sizeLegendHeight);
          //FIXME Elliott/8/20/2012, hard code padding here
          eastY = eastY + sizeLegendHeight + 8;
      }
      
      var showLegendTitle = true;
      if ((sizeLegendHeight > 0 ? sizeLegendHeight + 8 : 0) + legendPS.height > solution.east.bounds.height) {
          showLegendTitle = legendPS.titleSize.height < (eastHeight - sizeLegendPS.height) * 0.3;
      }
        
        if ( this._modules.legend ) {
          this._modules.legend.hide(false);
          this._root.select('.legend').attr('transform', 
          'translate(' + solution.east.bounds.x + 
          ', '+ eastY +')');
          
          if (!showLegendTitle) {
              this._modules.legend.hideTitle();
          }
          
          this._modules.legend
            .width(solution.east.bounds.width)
            .height(eastHeight - sizeLegendPS.height);
        }
      } else {
          if (this._modules.legend) {
              this._modules.legend.hide(true);
          }
          if (this._modules.sizeLegend) {
              this._modules.sizeLegend.hide(true);
          }
      }
      
      if ( solution.center ) {
        this._root.select('.main').attr('transform', 
          'translate(' + solution.center.bounds.x + 
          ', ' + solution.center.bounds.y + ')');
        this._modules.main
          .width(solution.center.bounds.width, (actualLayout === undefined ) ? true : undefined)
          .height(solution.center.bounds.height,  (actualLayout === undefined ) ? true : undefined);
          
        if ( this._modules.tooltip ) {
          this._modules.tooltip.plotArea(solution.center.bounds).zone(newSize);
        }
      }
    },
    
    _updateAllProperties : function(){
      this._mergeInputProperties();
      this._updateSubModuleProperties();
    },
    
    //TODO: refactor this hard code
    _updateSubModuleProperties:function(){
      this._updateProperties('legend');
      this._updateProperties('title');
      this._updateProperties('sizeLegend');
      this._updateProperties('tooltip');
      this._updateProperties('main', true);
      this._updateControllerProperties('interaction');
      this._updateControllerProperties('geoController');      
    },
    
    _mergeInputProperties:function (){
      Objects.extend(true, this._properties, this._inputProperties);
      this._mergeCanvgProperties();      
    },
    
    _mergeCanvgProperties:function (){
      if(CanvgConfig.enableCanvg() && this._data.dataPointCount() >= this._max_svg){
        var temp = {};
        //TODO: currently, can not get property cateogry in geo chart by this._config.getChartPropCate(),
        //we use plotArea instead of this function 
        temp['plotArea'] = {
            animation: {
              dataLoading: false,
              dataUpdating: false
            }
        };
        Objects.extend(true, this._properties, temp);
      }
    },
    
    render : function(){
      //TODO: support empty data set in module level 
      if(this._data.emptyDataset() === true){
         return;
      }
      
      this._relayout(this.size());
      this._paint();
    },
    
    _localeChanged : function(){
      //update the data of modules to let the module have change to make up locale string again.
       var moduleManifest = this._config.modules;
         var ddata = dispatchData(moduleManifest.legend, this._data);
         if(ddata) {
            this._modules.legend.data(ddata);
         }
         ddata = dispatchData(moduleManifest.sizeLegend, this._data);
         if(ddata) {
            this._modules.sizeLegend.data(ddata);
         }
         ddata = dispatchData(moduleManifest.title, this._data);
         if(ddata) {
            this._modules.title.data(ddata);
         }
          this._modules.main.data(this._data); 
         
      this._updateAllProperties();
      this.render();
    },
    
    properties : function (_) {
      if ( !arguments.length ) {
        if (!this._propertiesIsNewest){
          this._outputProperties = extractProperties(this._modules, this._config.id);
          this._propertiesIsNewest = true;
        }
        return this._outputProperties;
      }
      this._propertiesIsNewest = false;
      this._inputProperties = _;
      
      //update properties
      this._updateAllProperties();
    },
    
    style : function (_) {
      if ( !arguments.length ) {
        return this._styleManager.style;
      }
      
      this._styleManager.update(parseCSS(_));
    },
    
    data : function (_) {
      if ( !arguments.length ) {
        return this._data;
      }
     
      this._data = _;
      
      this._effectManager.ghostEffect(this._data.fakeData());
      
      //currenty, we should update properties when reset dataset. As when change the component mode from svg to canvg, we should disable all animation
      this._updateAllProperties();
      
      //switch canvg mode to svg mode when change the size of dataset
      if(CanvgConfig.enableCanvg() &&this._data.dataPointCount() >= this._max_svg &&  this._compoennt_status === 'svg') { //svg => canvg
        //turn to canvg mode, switch  svg node and fake svg node
        //1. 
        this._root = this._d3Root;
        $(this._d3Root.node()).remove();
        this._d3Root = this._canvas_rootThreshold.select('svg');
        $(this._d3Root.node()).remove();
       // $(this._canvas_rootThreshold.node()).append(this._root.node());
        if(this._canvas_rootThreshold.select('svg').node() === null){
          this._canvas_rootThreshold.node().appendChild(this._root.node());
        }else{
          $(this._root.node()).insertBefore(this._canvas_rootThreshold.select('svg').node());
        }
        if(d3.select(this._container.get(0)).select('svg').node() === null){
          this._container.get(0).appendChild(this._d3Root.node());
        }else{
          $(this._d3Root.node()).insertBefore( d3.select(this._container.get(0)).select('svg').node());
        }
        
        this._compoennt_status = 'canvg';
      } else if (CanvgConfig.enableCanvg() && this._data.dataPointCount() < this._max_svg && this._compoennt_status === 'canvg'){// canvg => svg
        //clear the canvas and reset the size of canvas
        this._canvas_root.node().getContext('2d').clearRect(0, 0, this._canvas_root.node().width, this._canvas_root.node().height);
        this._canvas_root.style('width', 0), this._canvas_root.style('height', 0);
        this._canvas_root.attr('width', 0), this._canvas_root.attr('height', 0);
        
        this._d3Root = d3.select(this._container.get(0)).select('svg');
        this._root =  this._canvas_rootThreshold.select('svg');
        this._root.remove();
        $(this._root.node()).insertBefore(this._d3Root.node());
        this._canvas_rootThreshold.insert("svg", "svg").attr('width', this.size().width).attr('height', this.size().height);
        
        this._d3Root.remove();
        this._d3Root = this._root;
        this._compoennt_status = 'svg';
      }
      
      //redispatch data
      var moduleManifest = this._config.modules;
      var ddata = dispatchData(moduleManifest.legend, this._data);
      if(ddata) {
        this._modules.legend.data(ddata);
      }
      ddata = dispatchData(moduleManifest.sizeLegend, this._data);
      if(ddata) {
        this._modules.sizeLegend.data(ddata);  
      }
      ddata = dispatchData(moduleManifest.title, this._data);
      if(ddata) {
        this._modules.title.data(ddata);
      }
      
      this._modules.main.data(this._data);
      
      //after we reset data, we need update submodules as they may
      //have changed during data update
      //TODO a potential optimization here: if we split data update and schema data updata
      //we can skip module update when only data has been updated 
      this._updateSubModules(this._modules.main);
      this._updateSubControllers(this._modules.main);
    },
    
    modules : function () {
      return this._modules;
    },
    
    _relayout : function(newSize){
      this._doLayout(newSize);
      this._loadDependencies();
      //Jimmy/8/20/2012, scales may be different after dependencies have been resolved,
      //so we layout again to use the latest scales
      //see tablecontainer#158(//JIMMY/8/8/2012) for axis case. we also have the case for
      //bubble size legend. it should be able to be optimized in the future 
      this._doLayout(newSize, true);
    },
    
    // Callback invoked by platform upon the occurrence of a resizing event.
    doContentResize : function ( oldSize, newSize ) {
      this.callParent('doContentResize', oldSize, newSize);
      this.render();
    },
    
    _expandDependencyDefs : function(item){
      var defs = [];
      var sourceModule = item['sourceModule'];
      var targetModule = item['targetModule'];
      var expandedSourceModules = this._expandModulePath(sourceModule);
      var expandedTargetModules = this._expandModulePath(targetModule);
      if(expandedSourceModules.length > 1 && expandedTargetModules.length > 1){
        if(expandedSourceModules.length !== expandedTargetModules.length){
          Functions.error('Error on resolving dependency:' + sourceModule + ',' + targetModule);
        }else{
          for(var i = 0, len = expandedSourceModules.length; i < len; i++){
            defs.push({
              'sourceModule' : expandedSourceModules[i],
              'targetModule' : expandedTargetModules[i],
              'source' : item['source'],
              'target' : item['target'],
              'type' : item['type'],
              'listener' : item['listener']
            });
          }
        }
      }else{
        //we are sure that one of the loop will execute only once, and we don't care which one
        for(var n = 0, nlen = expandedSourceModules.length; n < nlen; n++){
          for(var j = 0, jlen = expandedTargetModules.length; j < jlen; j++){
            defs.push({
              'sourceModule' : expandedSourceModules[n],
              'targetModule' : expandedTargetModules[j],
              'source' : item['source'],
              'target' : item['target'],
              'type' : item['type'],
              'listener' : item['listener']
            });
          }
        }
      }
      
      //FIXME jimmy/8/8/2012 if both sourceModule and targetModule have
      //been expanded, and they have different number of items, what should
      //we do? do cartesian product? currently we simply throw exception
      return defs;
    },
    
    //nodeN.nodeN-1.nodeN-2...node1, for each nodeN,
    //if we have several entities for it, we should expand it
    _expandModulePath : function(path){
      var pathArray = path.split('.');
      var currentPrefix = [];
      var currentExpand = [];
      for(var i = 0, len = pathArray.length; i < len; i++){
        var j = 0, jlen = currentPrefix.length;
        do
          {
            var pathI = jlen > 0 ? [currentPrefix[j], pathArray[i]].join('.') : pathArray[i];
            if(TypeUtils.isArray(this._modules[pathI])){
              //we have to expand this, and we may have undefined items in the array
              for(var k = 0, klen = this._modules[pathI].length; k < klen; k++){
                if(this._modules[pathI][k]){
                  var newPrefix = jlen > 0 ? [currentPrefix[j], pathArray[i] + '[' + k + ']'].join('.') : pathArray[i] + '[' + k + ']';
                  currentExpand.push(newPrefix);
                }
              }
            }else{
              //put it in directly
              currentExpand.push(pathI);
            }
            j++;
          }
        while(j < jlen);
        var refTemp = currentPrefix;
        currentPrefix = [].concat(currentExpand);
        currentExpand.length = 0;
        refTemp.length = 0;
      }
      return currentPrefix;  
    },

    _expandModules : function(){
      var modules = this._modules;
      var result = [];
      for(var p in modules){
        if (modules.hasOwnProperty(p)) { 
          var m = modules[p];
          if(TypeUtils.isArray(m)) {
            for (var i = 0; i < m.length; i++) {
              result[p + '[' + i + ']'] = m[i];
            }
          } else {
            result[p] = m; 
          }
        }
      }
        
      return result;
    },
    
    // Configures various kinds of module dependencies.
    _loadDependencies : function () {
      var dependencies = this._config.dependencies, item, i;
      var attrs = dependencies.attributes || [],
          events = dependencies.events || [];
      
      var expandedDefs, expandedDef;
      
      // Resolve attributes.
      /*
     * [jimmy/8/8/2012]each node in the path may have several entities
     * like main.plot, we may create several main.plots
     * (here the xycontainer), by using 'main.plot.xAxis'
     * here we actually means for xAxis in each main.plot
     * 
     * in the future, we may need support more complicated dependency resolving
     * like 'the 3rd xycontainer's xAxis', can be described
     * as main.plot[2].xAxis
     */
      var modules = this._expandModules();
      
      for ( i = 0; i < attrs.length; i++ ) {
        item = attrs[i];
        if( item === null ){
          continue;
        }
        expandedDefs = this._expandDependencyDefs(item);
        for(var j = 0, jlen = expandedDefs.length; j < jlen; j++) {
          expandedDef = expandedDefs[j];
          if ( modules[ expandedDef['sourceModule'] ] && modules[ expandedDef['targetModule'] ] ) {
            if ( typeof modules[ expandedDef['sourceModule'] ][ expandedDef['source'] ] === 'function' &&
                 typeof modules[ expandedDef['targetModule'] ][ expandedDef['target'] ] === 'function' ) {
              modules[ expandedDef['targetModule'] ][ expandedDef['target'] ]( 
                modules[ expandedDef['sourceModule']][ expandedDef['source']]() );
            } else {
              Functions.error('dependency configuration error');
            }
          } else {
            Functions.error('dependency configuration error');
          }
        }
      }
      
      // Resolve events.
      for ( i = 0; i < events.length; i++ ) {
        item = events[i];
        expandedDefs = this._expandDependencyDefs(item);
        for(var n = 0, nlen = expandedDefs.length; n < nlen; n++) {
          expandedDef = expandedDefs[n];
          if ( modules[ expandedDef['targetModule'] ] && modules[ expandedDef['sourceModule'] ] ) {
            if ( typeof modules[ expandedDef['targetModule'] ][ expandedDef['listener'] ] === 'function' &&
                 typeof modules[ expandedDef['sourceModule'] ] === 'function' ) {
                   if(typeof modules[ expandedDef['sourceModule'] ].dispatch === 'function'){
                      modules[ expandedDef['sourceModule'] ].dispatch().on(expandedDef['type'] + '.' + expandedDef['targetModule'] + '.' + n, 
                        modules[ expandedDef['targetModule'] ][ expandedDef['listener'] ]);
                   } else {
                     Functions.error('dependency configuration error:' + expandedDef['sourceModule'] + ' does not support event!');
                   }
            } else {
              Functions.error('dependency configuration error');
            }
          } else {
            Functions.error('dependency configuration error: source or target does not exist!');
          }
        }
      }
    },
        
    _paint : function () {
      if ( this._modules.title ) {
        this._root.select('.title').call(this._modules.title);
      } 
      if ( this._modules.legend ) {
        this._root.select('.legend')
          .datum(this._modules.legend.data())
          .call(this._modules.legend);
      }
      if ( this._modules.sizeLegend ) {
        this._root.select('.sizeLegend')
          .datum(this._modules.sizeLegend.data())
          .call(this._modules.sizeLegend);
      }
      if ( this._modules.main ) {
        this._root.select('.main')
          .datum(this._modules.main.data())
          .call(this._modules.main);
      }
      
    },
    
    // Merge Ian Li's fix to make canvg waiting for chart modules' initialized event
    _exportToCanvas: function(){
      if(CanvgConfig.enableCanvg() && this._compoennt_status === 'canvg'){
        this._root.attr( 'height', this.size().height);
        this._root.attr('width', this.size().width);
        //set the d3root svg size to 0
        this._d3Root.attr( 'height', 0);
        this._d3Root.attr('width', 0);
        this._canvas_rootThreshold.selectAll('title').remove();
        if(canvg) {
          canvg(this._canvas_root.node(), this._canvas_rootThreshold.html(), { ignoreMouse: true, ignoreAnimation: true });
          
          this._dispatch.dataTruncation();
        }
      }
    },
    
    /**
     * Loops over events configuration of each module
     * and return the events types.
     * 
     * @function
     * @returns {Array} Array of supported event types
     */
    getSupportedEvents : function () {
      var events = [];
      var modules = this._config.modules;
      
      function getEventDefs( modules ) {
        for ( var m in modules ) {
          if ( modules.hasOwnProperty(m) ) {
            if(!modules[m]) {
                continue;
            }
              
            var module = manifest.module.get(modules[m].id);
            if ( module && module.events ) {
              events.push({
                sourceId : modules[m].id,
                source : {},
                evtTypes : module.events
              });
            }
            // Continue searching for composite module like a container
            if ( modules[m].modules ) {
                getEventDefs(modules[m].modules);
            } 
          }
        }
      }
      getEventDefs(modules);
      return events;
    },
    
    destroy : function(){
      langManager.removeListener(this._langManagerListener);
      this.removeFromSuperComponent();
    }
  });
  
  /* Represents the chart controller. */
  var ChartController = ObjectUtils.derive(UIController, {
    constructor : function ( options ) {
      this._parseOptions(options);
    },
    
    _parseOptions : function ( options ) {
      if ( !manifest.viz.get(options.vizType) ) {
        Functions.error('Invalid vizType');  
      } 
      this._dataset = options.dataset ? options.dataset : {};
      this._options = options.option;
      this._vizType = options.vizType;
      this._dataFeeding = options.feeding;
      this._style = options.style;
      this._events = options.events;
    },
    
    initUIComponent : function ( width, height ) {
      var config = manifest.viz.get(this._vizType);
    this._cc_component = new ChartComponent({
        id : 'rootComponent',
        data : this._dataset,
        dataFeeding : this._dataFeeding,
        config : config,
        options : this._options,
        clipToBound : true,
        size : { w : width, h : height },
        style : this._style,
        events : this._events
      });
        
      
      return this._cc_component;
    },
    
    getSupportedEvents : function () {
      return this._cc_component.getSupportedEvents();
    },
    
    setDataset : function ( dataset ) {
      this._cc_component.data(dataset);
    },
    
    doThemeChanged : function(){
      this._cc_component.themeChanged();
    },
    
    updateProperties : function (props) {
      this._cc_component.properties(props);
    },
    
    getProperties : function() {
      return this._cc_component.properties();
    },
    
    style : function () {
      return this._cc_component.style.apply(this._cc_component, arguments);
    },
    
    render : function(){
      this._cc_component.render();
    },
    
    destroy : function(){
      this._cc_component.destroy();
    },

    /**
     * [05-Jan-2013 Nick] FIXME Temp work around for datalabel when the chart animation is disabled
     */
    afterUIComponentAppear : function(){
      var props = this._cc_component.properties();
      var func;
      if(!props.plotArea || !props.plotArea.animation || !props.plotArea.animation.dataLoading){
        if(!this._cc_component.modules()){
           return;
        }
        
        var plot = this._cc_component.modules()['main.plot'];
        if(TypeUtils.isArray(plot)){
          for(var i = 0; i<plot.length; i++){
            if(TypeUtils.isExist(plot[i])){
              func = plot[i].modules()['plot'].afterUIComponentAppear;
              if(TypeUtils.isExist(func)){
                func();
              }
            }
          }
        }else{
          func = plot.afterUIComponentAppear;
          if(TypeUtils.isExist(func)){
            func();
          }
        }
      }
  }
    
  });
  
  /* Represents the application delegate class. */
  var AppDelegate = ObjectUtils.derive(VizAppDelegate, {
    appDidFinishLaunching : function ( app, launchOptions ) {
      // Format data set from data feeds.
      this._vc_vizType = launchOptions.vizType;
      this._vc_dataset = launchOptions.data.rawData;
      this._vc_feeding = launchOptions.feeding;
      this._vc_properties = launchOptions.options;
      var datapointCount =  this._vc_dataset.getDataPointCount();
      var vc_config = CanvgConfig.get(this._vc_vizType) ?CanvgConfig.get(this._vc_vizType) : {} ;
      this.max_canvas = CanvgConfig.enableCanvg() && vc_config.max_canvas ? vc_config.max_canvas : Number.POSITIVE_INFINITY;
      var dataAdapter = this._vc_createAdapter(this._vc_vizType, this._vc_dataset, this._vc_feeding, this.max_canvas);
    this._controller = new ChartController({
          vizType : this._vc_vizType,
          dataset : dataAdapter,
          option : launchOptions.options, // Chart properties,
          style : launchOptions.style,
          events : launchOptions.events
    });  
      
      this.registerPublicMethod('update', this._vc_update);
      this.registerPublicMethod('destroy', this._vc_destroy);
      this.registerPublicMethod('getStyle', this._vc_getStyle);
    },
    
    _vc_createAdapter : function(vizType, rawData, feeding, upperLimit) {
      var feeder = Feeder(manifest.viz.get(vizType).allFeeds(true), rawData, feeding);
      var dataHandler = new BaseDataHandler(feeder, rawData, upperLimit);
      var feeds = feeder.getFeeds();
      var dataAdapter = new MultiAxesDataAdapter(feeder.getBindingInfo());
      dataAdapter.fakeData(rawData.hasFakeData());
      dataAdapter.emptyDataset(rawData.isEmptyDataset());
      dataAdapter.dataPointCount(rawData.getDataPointCount());
      var id, dataItems;
      for ( var i = 0, len = feeds.length; i < len; i++ ) {
      id = feeds[i].feedId();
        dataItems = dataHandler.getFeedValues(id);
        if(dataItems !== null){
          if(feeds[i].type() === "Dimension"){
            dataAdapter.addAnalysisAxis({values:dataItems, index: feeds[i].getIndex() - 1});
          }else{
            dataAdapter.addMeasureValuesGroup({values:dataItems, index: feeds[i].getIndex() - 1});
          }
        }     
      }
      return dataAdapter;
    },
    
    _vc_getStyle : function() {
      return this._controller.style();
    },
    
    _vc_update : function(updates) {
      if(updates){
        var needRender = false;
        //TODO Jimmy/9/19/2012 finish update property workflow
        //especially properties like 'numberOfDimensionsInColumn' which will
        //affect the structure, and ideally, we need merge all updates into one
        //function in each module, currently we still call them separately  
        if(updates.properties) {
          if(this._controller){
            this._vc_properties = updates.properties;
            this._controller.updateProperties(this._vc_properties);
            needRender = true;
          }
        }
        
        if(updates.style) {
            this._controller.style(updates.style);
            needRender = true;
        }
        
        if(updates.data || updates.feeding) {
          if(updates.data) {
              this._vc_dataset = updates.data;
          }
          if(updates.feeding) {
              this._vc_feeding = updates.feeding;
          }
          var newAdapter = this._vc_createAdapter(this._vc_vizType, this._vc_dataset, this._vc_feeding, this.max_canvas);
          this._controller.setDataset(newAdapter);
          needRender = true;
        }
        if(needRender)
        {
          this._controller.render();
        }
      }
    },
    
    rootController : function () {
      return this._controller;
    },
    
    getSupportedEvents : function () {
      return this._controller.getSupportedEvents();
    },
    
    setDataset : function ( dataset ) {
      this._vc_dataset = dataset;
      var newAdapter = this._vc_createAdapter(this._vc_vizType, this._vc_dataset, this._vc_feeding);
      this._controller.setDataset(newAdapter);
    },
    
    getDataset : function (){
      return this._vc_dataset;
    },
    
    updateProperties : function (props) {
      if(this._controller){
        this._vc_properties = props;
        this._controller.updateProperties(this._vc_properties);
      }
    },
    
    getProperties : function() {
      return this._controller.getProperties();
    },
    
    _vc_destroy : function(){
      this._controller.destroy();
    }    
  });
  
  var riv = 
  /**
     * @lends sap.viz.core
     */
  {
        /**
         * @constructs
         */
        constructor : function() {

        },
        
        /**
         * @ignore 
         */
        instances : [], // Stores references to chart applications for easy processing of global events.
        
        /**
         * The main entry point of creating a chart.
         * @param {Object} usrOptions
         * <pre>
         * {
         *   type: 'viz/bar', //see propDoc.html for all supported viz chart types
         *   options: {}, //see propDoc.html for all supported options for each viz type
         *   style: {}, //see propDoc.html for all supported css items for each viz type
         *   container: HTMLDivElement, // HTMLDivElement is the container of viz chart in html
         *   data: {@link sap.viz.data.CrosstableDataset},
         *   feeding: {@link sap.viz.VizInstance#feeding}
         * }
         * </pre>
         * @returns {Object} vizApplication instance {@link sap.viz.VizInstance}
         */
        createViz : function ( usrOptions ) {
          var _eventsListeners = {}; //holder event lister
          var _feeding = usrOptions.feeding;
          
          var viz = 
          /**
           * @lends sap.viz.VizInstance.prototype
           */
          {
            /**
             * it can only be created by {@link sap.viz.core}
             * @constructs
             */
            constructor : function() {
    
            },
            
            /**
             * add event listener. one eventType can only have one listener, to register multiple listeners to a certain eventType you
             * have to add additional namespace after the eventType, such as 'selectData.foo' or 'selectData.bar'
             * @param {String} evtType see propDoc.html for supported events for each kind of chart
             * @param {Function} callback listener function
             * @returns {Object} {@link sap.viz.VizInstance}
             */
            on : function ( evtType, callback, scope ) {
              _eventsListeners[evtType] = {
                  callback : callback,
                  scope: scope
              };
              viz.app.getDelegate().rootController().rootUIComponent().attachEvent(evtType, callback, scope);
              
              return viz;
            },
            
            /**
             * Get/set chart size.
             * @param {Object} size {width:xx, height:xx}
             * @returns {Object} {@link sap.viz.VizInstance}
             */
            size : function (size) {
              if ( !arguments.length ) {
                  return viz.app.size();  
              }
              viz.app.size(size);
              
              return viz;
            },
            
            /**
             * Get/set chart data.
             * @param {Object} data {@link sap.viz.data.CrosstableDataset} 
             * @returns {Object} {@link sap.viz.VizInstance}
             */
            data : function (data) {
              if ( !arguments.length ) {
                  return viz.app.getDataset();  
              }
              viz.update({
                data : data
              });
              
              //rebind event listener as upon data update, sub plots may be recreated
              for(var evt in _eventsListeners){
               if(_eventsListeners.hasOwnProperty(evt)){
                 viz.on(evt, _eventsListeners[evt].callback, _eventsListeners[evt].scope);
               }
              }
              
              return viz;
            },
            
            /**
             * Get/set chart properties.
             * @ignore
             * @param {Object} props see propDoc.html
             * @returns {Object} {@link sap.viz.VizInstance}
             */
            properties : function (props) {
              if ( !arguments.length ){
                return viz.app.properties();  
              } 
              viz.update({
                properties : props
              });
              
              return viz;
            },
            
            /**
             * Get/set chart style.
             * @param {Object} style the style object
             * @returns {Object} {@link sap.viz.VizInstance}
             * @example
             * chartInstance.style({
             *  '.viz-title-label' : {
             *      fill : '#FF0000'
             *   }
             * });
             */
            style : function (style) {
              if ( !arguments.length ){
                return viz.app.invokePublicMethod('getStyle');  
              } 
              viz.update({
                style : style
              });
              
              return viz;
            },
            
            /**
             * Get/set data feeding info
             * @param {Object} feedingObj in the following structure: 
             *  <pre>
             *  {
                  'feedid'   : feedid  // feed id for example 'RegionColor', see propDoc.html
                  'binding'   :[ {
                      'type' : 'analysisAxis' | 'measureValueGroup' | 'measureNamesDimension',
                      'index':  Number 
                  }]
                }
                </pre>
               @returns {Object} {@link sap.viz.VizInstance} 
             */
            feeding : function(feedingObj) {
              if( !arguments.length ) {
                  return _feeding;
              } 
              
              _feeding = feedingObj;
              viz.update({
                feeding : feedingObj
              });
              
              return viz;
            },
            
            /**
             * Update various items in one go.
             * @param {Object} updates {data: {@link sap.viz.data.CrosstableDataset}, feeding: feedingObj, style: cssObject}
             * @returns {Object} {@link sap.viz.VizInstance}
             */
            update : function ( updates ) {
              if(updates){
                //we actually support use a null value to clear current feeding and switch to use
                //auto feed
                if(TypeUtils.isDefined(updates.feeding)) {
                  _feeding = updates.feeding;
                }
                viz.app.invokePublicMethod('update', updates);
              }
              return viz;
            },
            

            /**
             * Destroy this chart instance. This will remove all dom
             * nodes of chart and its listeners.
             */
            destroy : function() {
              riv.instances.splice(riv.instances.indexOf(this), 1);
              viz.app.invokePublicMethod('destroy');
            },
            
            /**
             * export chart instance into a JSON object which contains
             * all information of the chart including type, data, properties
             * style, feeding and size
             */
            toJSON : function() {
              var doc = {};
              doc.type = usrOptions.type;
              doc.data = viz.app.getDataset();
              doc.properties = viz.app.properties(); 
              doc.style = viz.app.invokePublicMethod('getStyle');
              doc.feeding = _feeding;
              doc.size = viz.app.size();
              return doc;	
            }
          };
          
          var template = TemplateManager.current();
          
          var type = usrOptions.type;
          
          viz.app = new VizApplication({
            wrapperDivEl : usrOptions.container,
            delegateClass : AppDelegate,
            launchOption : {
              vizType : type,
              options : Objects.extend(true, null, template.props(type), usrOptions.options),
              style : Objects.extend(true, null, template.css, parseCSS(usrOptions.style)),
              data : { rawData : usrOptions.data },
              feeding : usrOptions.feeding || usrOptions.dataFeeding, /* dataFeeding for backward compatibility*/ 
              events : usrOptions.events
            }
          });          

          Object.defineProperty(viz, "type", {
            value : type,
            enumerable : true
          });
          
          viz.app.getDelegate = function () {
            return this._delegate;
          };
          riv.instances.push(viz);
          return viz;
        },
        
        /**
         * Destroy chart.
         * @param {Object...} viz instances to be destroyed
         */
        destroyViz : function(){
          for(var i=-1, j = arguments.length;++i<j;) {
              arguments[i].destroy(); 
          }
        },
        
        /**
         * load chart from JSON into a div
         * @param {Object...} viz json document
         * @param {Object...} div object to contain the visualization
         */
        loadViz : function(doc, container){
          var option = {};
          option.container = container;
          option.type = doc.type;
          option.options = doc.properties;
          option.data = doc.data;
          option.style = doc.style;
          option.feeding = doc.feeding;
           
          this.createViz(option); 
        },
        
        /**
         * export chart instance into a JSON object which contains
         * all information of the chart including type, data, properties
         * style, feeding and size
         * @param {Object...} {@link sap.viz.VizInstance}
         */
        exportViz : function(chart){
          return chart.toJSON();           
        }
  }; 
  
  return riv;
});