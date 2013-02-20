sap.riv.module(
{
  qname : 'sap.viz.modules.horizontalcombination',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.modules.dispatch',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifest',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.ColorSeriesGenerator',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.MNDHandler',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.MultiAxesDataAdapter',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.tooltipDataHandler',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Scaler',
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
{  qname : 'sap.viz.modules.util.BoundUtil',
  version : '4.0.0'
}
],
function Setup(dispatch, Manifest, ColorSeries, MNDHandler, TypeUtils, ObjUtils, MultiAxesDataAdapter, TooltipDataHandler, Scaler, NumberUtils, Objects, langManager, BoundUtil) {
  var combination = function(manifest, ctx) {
    function module(selection) {
      _tooltipDataHandler = TooltipDataHandler();
      BoundUtil.drawBound(selection, _width, _height);
      selection.each(
        function(inputData) {
          if (inputData !== undefined) {
            prepareData(inputData);
          }
          _d3root = d3.select(this);
          
          redraw();
        }
      );//each
      return module;
    }

    /**
     * set/get width
     */
    module.width = function(_) {
      if (!arguments.length) {
        return _width;
      }
      _width =  _ ;
      if(TypeUtils.isExist(_width) && TypeUtils.isExist(_height)&& TypeUtils.isExist(_rawdata)) {
        computeScales();
      }
      return module;
    };
    /**
     * set/get height
     */
    module.height = function(_) {
      if (!arguments.length) {
        return _height;
      }
      _height =  _ ;
      if(TypeUtils.isExist(_width) && TypeUtils.isExist(_height)&& TypeUtils.isExist(_rawdata)) {
        computeScales();
      }
      return module;
    };
    
    module.afterUIComponentAppear = function(){
      _eDispatch.initialized(); 
    };
    /**
     * set/get size
     * 
     * @param {Object}
     *            {'width':Num, 'height':Num}
     */
    module.size = function(_) {
      if (!arguments.length) {
        return {
          width : _width,
          height: _height
        };
      }
      _width = _.width;
      _height = _.height;
      if(TypeUtils.isExist(_width) && TypeUtils.isExist(_height)&& TypeUtils.isExist(_rawdata)) {
        computeScales();
      }
      return module;
    };

    /**
     * set/get properties
     */
    module.properties = function(_) {
      if (!arguments.length) {
        return getProperty();
      }
      setProperty(Objects.extend(true, getProperty(), _));
      prepareData(_rawdata, true);
      return module;
    };
    
    module.dataLabel = function(_){};
    /**
     * set/get data
     */
    module.data = function(_) {
      if (!arguments.length) {
        return _rawdata;
      }
      prepareData(_);
      return module;
    };

    module.primaryAxisTitle = function(_){
        if(!arguments.length) {
          var titles =  _rawdata.getMeasureValuesGroupDataByIdx(0), title = [];
          if(titles){
            for(var i=0, len =titles.values.length; i< len;i++ ){
                if (titles.values[i].col !== null && titles.values[i].col !== undefined)
                {
                    title.push(titles.values[i].col);
                }
                else
                {
                    title.push(langManager.get('IDS_ISNOVALUE'));
                }
            }
          }
          return title.join('/');
        }
        return this;
      };
      
      module.secondAxisTitle = function(_){
        if(!arguments.length){
          var titles =  _rawdata.getMeasureValuesGroupDataByIdx(1), title = [];
          if(titles){
            for(var i=0, len =titles.values.length; i< len;i++ ){
                if (titles.values[i].col !== null && titles.values[i].col !== undefined)
                {
                    title.push(titles.values[i].col);
                }
                else
                {
                    title.push(langManager.get('IDS_ISNOVALUE'));
                }
            }
          }
          return title.join('/');
        }
        return this;
      };
     
      module.dispatch = function(_){
        if(!arguments.length) {
          return _eDispatch;
        }
        _eDispatch = _;
        return module;
      };

      module.primaryScale = function(scale)
      {
        if(!arguments.length) {
          return _valueAxis1.scale;
        }
        _valueAxis1.scale = scale;
        return module;
      };
      
      module.secondaryScale = function(scale)
      {
        if(!arguments.length) {
          return _valueAxis2.scale;
        }
        _valueAxis2.scale = scale;
        return module;
      };
      
      module.categoryScale = function(scale)
      {
        if(!arguments.length) {
          return _xScale;
        }
        _xScale = scale;
        return module;
      };

    module.primaryDataRange = function(range){
      if (!arguments.length){
        return {
          min: _valueAxis1.scale.domain()[0],
          max: _valueAxis1.scale.domain()[1]
        };
      }
      
      if (range !== null) {
          _valueAxis1.topValue = range.max;
          _valueAxis1.bottomValue = range.min;
          if (range.from === 'axis') {
            _valueAxis1.manualRange = true;
          }
          if(TypeUtils.isExist(_width) && TypeUtils.isExist(_height)){
            calculateScale(_valueAxis1, _valueAxis1.scale);
          }
      }
      return module;
    };

    module.secondDataRange = function(range){
      if (!arguments.length){
        return {
          min: _valueAxis2.scale.domain()[0],
          max: _valueAxis2.scale.domain()[1]
        };
      }
      if (range !== null) {
          _valueAxis2.topValue = range.max;
          _valueAxis2.bottomValue = range.min;
          if (range.from === 'axis') {
            _valueAxis2.manualRange = true;
          }
          if(TypeUtils.isExist(_width) && TypeUtils.isExist(_height)){
            calculateScale(_valueAxis2, _valueAxis2.scale);
          }
      }
      return module;
    };

    module.primaryAxisColor = function() 
    {
      if (!_props.MNDOnCategory) {
        return _props.primaryValuesColorPalette[0];
      } else {
        return null;
      }
    };
    
    module.secondAxisColor = function() 
    {
      if (!_props.MNDOnCategory) {
        return _props.secondaryValuesColorPalette[0];
      } else {
        return null;
      }
    };

      module.colorPalette = function(Palette){
        if (!arguments.length){
          return _colorPalette;
         }
         return module;
      };

      module.shapePalette = function(Palette){
        if (!arguments.length){
          return _shapePalette;
         }
         return module;
      };

    module.parent = function () {
      return _d3root;
    };
    
    module.clear = function (gray) {
      for (var i in _module)
      {
        if (gray === undefined) {
          _module[i].module.clear();
        } else {
          _module[i].module.clear('grayall');
        }
      }
    };

    module.highlight = function (elements) {
      var i, j;
      var elementArray;
      if (elements instanceof Array) {
        elementArray = elements;
      } else {
        elementArray = [];
        elementArray.push(elements);
      }
      
      if (elementArray.length === 0) {
        return;
      }
      for (i in _module) {
        if (_module.hasOwnProperty(i)) {
          _module[i].highlightArray = [];
        }
      }

      for (i=0; i<elementArray.length; i++) {
        var element = elementArray[i];
        for (j in _module) {
          if (_module.hasOwnProperty(j)) {
              var dpa = _module[j].dataPointElements;
              if (isExist(dpa, element)) {
                _module[j].highlightArray.push(element);
                break;
              }
          }
        }
      }

      for (i in _module) {
        if (_module.hasOwnProperty(i)) {
          _module[i].module.highlight(_module[i].highlightArray);
        }
      }
    };

    module.unhighlight = function (elements) {
      var i, j;
      var elementArray;
      if (elements instanceof Array) {
        elementArray = elements;
      } else {
        elementArray = [];
        elementArray.push(elements);
      }    
      for (i in _module) {
        if (_module.hasOwnProperty(i)) {
          _module[i].unhighlightArray = [];
        }
      }

      for (i=0; i<elementArray.length; i++) {
        var element = elementArray[i];
        for (j in _module) {
          if (_module.hasOwnProperty(j)) {
              var dpa = _module[j].dataPointElements;
              if (isExist(dpa, element)) {
                _module[j].unhighlightArray.push(element);
                break;
              }
          }
        }
      }

      for (i in _module) {
        if (_module.hasOwnProperty(i)) {
          _module[i].module.unhighlight(_module[i].unhighlightArray);
        }
      }
    };
    
    module.hoverOnPoint = function( point ) {
      var i;
      if (_props.tooltip.enabled) {
        var point0= point.x, point1 = point.y;
  
        if(point1 < 0 || point1 > _height) {
          return;
        }
        var xIndex = getCategoryIndex(point1);
        if(_preMouseMoveXIndex === xIndex) {
          return;
        }
        _preMouseMoveXIndex = xIndex;

        var tData = _tooltipDataHandler.generateTooltipData(_rawdata, 
                                   _tooltipdata, 
                                   xIndex, 
                                   _colorPalette, 
                                   _shapePalette);
        var matrix = _d3root.node().getTransformToElement(_d3root.node().ownerSVGElement);
        tData.point = {
            y: (_height - _xScale.rangeBand()*(xIndex + 0.5)) + matrix.f,
            x: _width*3/4 + matrix.e
        };
        _eDispatch.showTooltip(TooltipDataHandler.formatTooltipData(tData));
      }
      for (i in _module) {
        if (_module.hasOwnProperty(i)) {
          _module[i].module.hoverOnPoint(point);
        }
      }
      return true;
    };

    module.blurOut = function( ) {
      var i;
      if (_props.tooltip.enabled) {
        _eDispatch.hideTooltip();
        _preMouseMoveXIndex = -1;
      }
      for (i in _module) {
        if (_module.hasOwnProperty(i)) {
          _module[i].module.blurOut();
        }
      }      
      return true;
    };  

      var _xScale = d3.scale.ordinal(),
        _valueAxis1 = {
        scale: d3.scale.linear()
      },
      _valueAxis2 = {
        scale: d3.scale.linear()
      };

    
    //private field
    var _tooltipDataHandler;
    var _eDispatch = new dispatch('showTooltip', 'hideTooltip', 'initialized', 'startToInit');
    //property
    var _width, _height;
    var _props = {
      priorityMap : {
        'bar' : 5,
        'line' : 0
      },
      defaultShape : 'line',
      MNDOnCategory : false,
      MNDInner : false
    };
    
    var _effectManager = ctx.effectManager;
    //data
    var _rawdata, _tooltipdata;
    var _d3root;
    var _colorPalette, _shapePalette;
    
    //module
    var _module;

    var _preMouseMoveXIndex = -1;

    var dummyDispatch = function (_) {
      this.mtype = _;
    };
    dummyDispatch.prototype.initialized = function() {
      _dummyDispatchHelper.initialized(this.mtype);
    };
    dummyDispatch.prototype.startToInit = function() {
      _eDispatch.startToInit();
    };

    var _dummyDispatchHelper = {
      initialized : function(mtype) {
        var i;
        if (_module[mtype]) {
          _module[mtype].isCompleteAnimation = true;
        }
        for (i in _module) {
          if (!_module[i].isCompleteAnimation) {
            return true;
          }
        }
        _eDispatch.initialized();
        return true;
      }
    };

    function init() {
      //TODO: should destroy useless module here(stop animation of useless module)
      _module = {};
    }
    function prepareData ( rawdata , isMandatory ) {
      var i, j, mtype, tm;
      if ((rawdata === null) || (rawdata === undefined) || (!isMandatory && (_rawdata === rawdata))) {
        return;
      }

      init();
      _rawdata = rawdata;

       var obj = MNDHandler(_rawdata );
      _props.MNDInner = obj.MNDInner;
      _valueAxis1.data = obj['MG1'];
      _valueAxis2.data = obj['MG2'];
      _tooltipdata = TooltipDataHandler.dataTransform(obj);

      if (obj.color) {
        var tempData = obj['MG1'];
        var data0 = [];
        var data1 = [];
        for (i=0; i<tempData.length; i++) {
          var temp0 = [];
          var temp1 = [];
          var temp = tempData[i];
          for (j=0; j<temp.length; j++) {
            if (obj.color[j] === 0) {
              temp0.push(temp[j]);
            } else if (obj.color[j] === 1) {
              temp1.push(temp[j]);
            }
          }
          data0.push(temp0);
          data1.push(temp1);
        }
        _valueAxis1.data = data0;
        _valueAxis2.data = data1;
      }
      if(TypeUtils.isExist(_width) && TypeUtils.isExist(_height)&& TypeUtils.isExist(_rawdata)) {
        computeScales();
      }
      if (obj.hasMND && !obj.MNDOnColor) {
        mtype = _props.dataShape.primaryAxis[0];
        if (mtype === undefined) {
          mtype = _props.defaultShape;
        }
        if (_module[mtype] === undefined) {
          _module[mtype] = {};
        }
        _module[mtype].data = _rawdata;
        _props.MNDOnCategory = true;
      } else {
        _props.MNDOnCategory = false;
        var daa1 = _rawdata.getAnalysisAxisDataByIdx(0);
        var daa2 = _rawdata.getAnalysisAxisDataByIdx(1);
        var dva1 = _rawdata.getMeasureValuesGroupDataByIdx(0);
        var dva2 = _rawdata.getMeasureValuesGroupDataByIdx(1);
        for (i=0; i<dva1.values.length; i++) {
          mtype = _props.dataShape.primaryAxis[i];
          if (mtype === undefined) {
            mtype = _props.defaultShape;
          }
          if (_module[mtype] === undefined) {
            _module[mtype] = {m1Num:0, m2Num:0};
          }
          tm = _module[mtype];
          tm.m1Num ++;
          if (tm.data === undefined) {
            tm.data = new MultiAxesDataAdapter();
            tm.data.addAnalysisAxis(daa1);
            tm.data.addAnalysisAxis(daa2);
            tm.data.addMeasureValuesGroup({
              index: dva1.index,
              values: []
            });
            if (dva2) {
              tm.data.addMeasureValuesGroup({
                index: dva2.index,
                values: []
              });
            }
          }
          var tva1 = tm.data.getMeasureValuesGroupDataByIdx(0);
          tva1.values.push(dva1.values[i]);
        }
        
        if (dva2) {
          for (i=0; i<dva2.values.length; i++) {
            mtype = _props.dataShape.secondAxis[i];
            if (mtype === undefined) {
              mtype = _props.defaultShape;
            }
            if (_module[mtype] === undefined) {
              _module[mtype] = {m1Num:0, m2Num:0};
            }
            tm = _module[mtype];
            tm.m2Num ++;
            if (tm.data === undefined) {
              tm.data = new MultiAxesDataAdapter();
              tm.data.addAnalysisAxis(daa1);
              tm.data.addAnalysisAxis(daa2);
              tm.data.addMeasureValuesGroup({
                index: dva1.index,
                values: []
              });
              if (dva2) {
                tm.data.addMeasureValuesGroup({
                  index: dva2.index,
                  values: []
                });
              }
            }
            var tva2 = tm.data.getMeasureValuesGroupDataByIdx(1);
            tva2.values.push(dva2.values[i]);
          }
        }
      }
      prepareColor();
    }
    
    function prepareColor() {
      var i, j, color, mtype, tm;
      if (_rawdata === undefined) { return; }
      
      var dva1 = _rawdata.getMeasureValuesGroupDataByIdx(0);
      var dva2 = _rawdata.getMeasureValuesGroupDataByIdx(1);
      var valueAxis1ColorPalette;
      var valueAxis2ColorPalette;

      if (dva2 && !_props.MNDOnCategory) {
        valueAxis1ColorPalette = _props.primaryValuesColorPalette;  
      }else{
        valueAxis1ColorPalette = _props.colorPalette;
      }
      
      valueAxis2ColorPalette = _props.secondaryValuesColorPalette;
      
      _colorPalette = [];
      _shapePalette = [];
      for (i in _module) {
        if (_module.hasOwnProperty(i)) {
            _module[i].colorPaletteY1 = [];
            _module[i].currentM1Index = -1;
            if (dva2) {
              _module[i].colorPaletteY2 = [];
              _module[i].currentM2Index = -1;
            }
        }
      }
      
      if (_props.MNDOnCategory) {
        mtype = _props.dataShape.primaryAxis[0];
        var rowslength = dva1.values[0].rows.length;
        for (j=0; j<rowslength; j++) {
          _module[mtype].colorPaletteY1.push(valueAxis1ColorPalette[(j) % valueAxis1ColorPalette.length]);
          _shapePalette.push(getShape(mtype));
          _colorPalette.push(valueAxis1ColorPalette[(j) % valueAxis1ColorPalette.length]);
        }
      } else {
        var measure1Num = dva1.values.length;
        var measure2Num = 0;
        if (dva2) {
          measure2Num = dva2.values.length;
        }
        var measureNum = measure1Num + measure2Num;
        var colorAxisDataNum = dva1.values[0].rows.length;
        for (i=0; i<measure1Num; i++) {
          mtype = _props.dataShape.primaryAxis[i];
          if (mtype === undefined) {
            mtype = _props.defaultShape;
          }
          tm = _module[mtype];
          tm.currentM1Index ++;
          for (j=0; j<colorAxisDataNum; j++) {
            if (_props.MNDInner) {
              color = valueAxis1ColorPalette[(i+j*measure1Num ) % valueAxis1ColorPalette.length];
              tm.colorPaletteY1[tm.currentM1Index+j*tm.m1Num] = color;
              _shapePalette[i+j*measureNum] = getShape(mtype);
              _colorPalette[i+j*measureNum] = color;
            } else {
              color = valueAxis1ColorPalette[(i*colorAxisDataNum+j) % valueAxis1ColorPalette.length];
              _module[mtype].colorPaletteY1.push(color);
              _shapePalette.push(getShape(mtype));
              _colorPalette.push(color);
            }
          }
        }

        if (dva2) {
          for (i=0; i<measure2Num; i++) {
            mtype = _props.dataShape.secondAxis[i];
            if (mtype === undefined) {
              mtype = _props.defaultShape;
            }
            tm = _module[mtype];
            tm.currentM2Index ++;
            for (j=0; j<colorAxisDataNum; j++) {
              if (_props.MNDInner) {
                color = valueAxis2ColorPalette[(i+j*measure2Num ) % valueAxis2ColorPalette.length];
                tm.colorPaletteY2[tm.currentM2Index+j*tm.m2Num] = color;
                _shapePalette[measure1Num+i+j*measureNum] = getShape(mtype);
                _colorPalette[measure1Num+i+j*measureNum] = color;
              } else {
                color = valueAxis2ColorPalette[(i*colorAxisDataNum+j) % valueAxis2ColorPalette.length];
                _module[mtype].colorPaletteY2.push(color);
                _shapePalette.push(getShape(mtype));
                _colorPalette.push(color);
              }
            }
          }
        }
      } // _props.MNDOnCategory
    }
    function moduleSortHelp(a, b) {
      return (_props.priorityMap[b] - _props.priorityMap[a]);
    }
    function prepareModule() {
      var tempA = [],i;
      for (i in _module) {
        if (_module.hasOwnProperty(i)) {
          tempA.push(i);
        }
      }
      tempA.sort(moduleSortHelp);
      
      _d3root.selectAll('.module').remove(); //TODO: should not always remove all
      var d3modules = _d3root.selectAll('.module').data(tempA);
      d3modules.enter().append('svg:g').attr('class', 'module');
      d3modules.exit().remove();
      
      d3modules.each(function(d) {
        _module[d].d3root = d3.select(this);
      });
      
      for (i in _module) {
        if (_module.hasOwnProperty(i)) {
            _module[i].module = getModule(i); //TODO: should not always new module instance
            var props = {
              colorPalette : _module[i].colorPaletteY1,
              primaryValuesColorPalette : _module[i].colorPaletteY1,
              tooltip : {enabled : false},
              animation : { 'dataLoading' : _props.animation.dataLoading },
              drawingEffect: _props.drawingEffect
            };
            if (_module[i].colorPaletteY2) {
              props.secondaryValuesColorPalette = _module[i].colorPaletteY2;
            }
            switch (i) {
            case 'line' :
              props.hoverline = { visible : false };
              ObjUtils.extend(props, _props.line);
              break;
            case 'bar' :
              props.animation.dataUpdating = _props.animation.dataLoading; 
              ObjUtils.extend(props, _props.bar);
              break;
            default :
              break;
            }
            _module[i].props = props;
            _module[i].module.dispatch(new dummyDispatch(i));
        }
      }
    }

    function redraw() {
      var i;
      prepareModule();

      for (i in _module) {
        if (_module.hasOwnProperty(i)) {
            var m = _module[i];
            m.module.width(_width).height(_height).data(m.data)
                .properties(m.props).primaryScale(_valueAxis1.scale)
                .categoryScale(_xScale);
            var dva2 = _rawdata.getMeasureValuesGroupDataByIdx(1);
            if (dva2) {
              switch(i) {
              case 'bar' :
                m.module.secondScale(_valueAxis2.scale); break;
              case 'line' :
                m.module.secondaryScale(_valueAxis2.scale); break;
              default:
                break;
              }
            }
            m.d3root.call(m.module);
            m.dataPointElements = [];
            m.d3root.selectAll('.datapoint').each(function(){m.dataPointElements.push(this);});
        }
      }
    }

    function getCategoryIndex(val)
    {
      var categoryNum = _xScale.domain().length;
      var index = val / _xScale.rangeBand();
        index = Math.floor(index);
       
      return categoryNum - 1 - index;
    }

      function computeScales() {
          var domain = [];
          var categoryNum = 0;
          if (_props.MNDOnCategory) {
            if (_valueAxis1.data && _valueAxis1.data.length > 0) {
              categoryNum += _valueAxis1.data[0].length;
            }
            if (_valueAxis2.data && _valueAxis2.data.length > 0) {
              categoryNum += _valueAxis2.data[0].length;
            }        
          } else {
            if (_valueAxis1.data && _valueAxis1.data.length > 0) {
              categoryNum = _valueAxis1.data[0].length;
            } else {
              categoryNum = _valueAxis2.data[0].length;  
            }
          }
          for (var i=0; i < categoryNum; i++) {
             domain.push(i);
          }      
          _xScale.domain(domain).rangeBands([_height, 0]);

          calculateScale(_valueAxis1, _valueAxis1.scale);
          calculateScale(_valueAxis2, _valueAxis2.scale);

          if (_valueAxis1.data && _valueAxis1.data.length > 0 &&
              _valueAxis2.data && _valueAxis2.data.length > 0 ) {
          if(_valueAxis1.scale.domain().length === 0 && _valueAxis2.scale.domain().length === 0){
            _valueAxis1.scale.domain([0, 1]).range ([0,_width]); 
            _valueAxis2.scale.domain([0, 1]).range ([0,_width]); 
          } else if(_valueAxis1.scale.domain().length === 0 && _valueAxis2.scale.domain().length !== 0){
            _valueAxis1.scale.domain(_valueAxis2.scale.domain()).range(_valueAxis2.scale.range());
          } else if(_valueAxis1.scale.domain().length !== 0 && _valueAxis2.scale.domain().length === 0){
            _valueAxis2.scale.domain(_valueAxis1.scale.domain()).range(_valueAxis1.scale.range());
          }

          if (!_valueAxis1.manualRange && !_valueAxis2.manualRange) {
              Scaler.perfectDual(_valueAxis1.scale, _valueAxis2.scale);
          } else if (!_valueAxis1.manualRange) {
              Scaler.perfect(_valueAxis1.scale);
          } else if (!_valueAxis2.manualRange) {
              Scaler.perfect(_valueAxis2.scale);
          }
        } else if (_valueAxis1.data && _valueAxis1.data.length > 0 && !_valueAxis1.manualRange) {
          if(_valueAxis1.scale.domain().length === 0){
            _valueAxis1.scale.domain([0, 1]).range ([0,_width]);
          }
          Scaler.perfect(_valueAxis1.scale);
        } else if (_valueAxis2.data && _valueAxis2.data.length > 0 && !_valueAxis2.manualRange) {
          if(_valueAxis2.scale.domain().length === 0){
            _valueAxis2.scale.domain([0, 1]).range ([0,_width]);
          }
          Scaler.perfect(_valueAxis2.scale);
        }
      }

    function calculateScale(axisValue, scale) {
        if(axisValue.data && axisValue.data.length > 0) {
            if(axisValue.topValue === undefined) {
              var minMax = calculateMinMax(axisValue);
              if(!minMax || ( minMax.min === 0 && minMax.max === 0)) {
                scale.domain([]).range ([]); 
              } else {
                scale.domain([minMax.min, minMax.max]).range ([0, _width]);
              }
            } else {
              scale.domain([axisValue.bottomValue, axisValue.topValue]).range ([0, _width]);
            }
        } else {
          scale.domain([0,0]).range(0,0);
        }
      }

    function getProperty() {
      var temp = {};
      temp.tooltip = {enabled: _props.tooltip.enabled};
      temp.primaryValuesColorPalette = _props.primaryValuesColorPalette;
      temp.secondaryValuesColorPalette = _props.secondaryValuesColorPalette;
      temp.colorPalette = _props.colorPalette;
      temp.drawingEffect = _props.drawingEffect;
      temp.animation = { 'dataLoading' : _props.animation.dataLoading };
      temp.dataShape = {};
      ObjUtils.extend(true, temp.dataShape, _props.dataShape);
      temp.bar = {};
      ObjUtils.extend(true, temp.bar, _props.bar);
      temp.line = {};
      ObjUtils.extend(true, temp.line, _props.line);
  
      return temp;
    }

    function setProperty (props) {
      _props.tooltip = {enabled: props.tooltip.enabled};
      _props.primaryValuesColorPalette = props.primaryValuesColorPalette;
      _props.secondaryValuesColorPalette = props.secondaryValuesColorPalette;
      _props.drawingEffect = props.drawingEffect;
      _props.colorPalette = props.colorPalette;
      _props.animation = {dataLoading : props.animation.dataLoading};
      _props.dataShape = {};
      ObjUtils.extend(true, _props.dataShape, props.dataShape);
      _props.bar = {};
      ObjUtils.extend(true, _props.bar, props.bar);
      _props.line = {};
      ObjUtils.extend(true, _props.line, props.line);

      return _props;
    }

    function getModule(mtype) {
      var result;
      switch (mtype) {
      case 'bar':
        result = Manifest.module.get("sap.viz.modules.bar"); break;
      case 'line':
        result = Manifest.module.get("sap.viz.modules.horizontalline"); break;
      default:
        break;
      }
      return result.fn(result, ctx);
    }
    
    function getShape(mtype) {
      var result;
      switch (mtype) {
      case 'line':
        result = _props.line.marker.shape;
        break;
      case 'bar':
        result = 'squareWithRadius'; break;
      default:
        break;
      }
      return result;
    }

    function isExist(ao, element) {
      for (var n=0; n<ao.length; n++) {
        if (ao[n] === element) {
          return true;
        }
      }
      return false;
    }

    function calculateMinMax(axisValue)
    {
      if(!axisValue.data || axisValue.data.length === 0) {
        return null;
      }
      var minMax = {
          min: null,
          max: null
      };
      minMax.max = d3.max(axisValue.data, function(d){
        return d3.max(d, function(_){ return _.val;});
      });
      minMax.min = d3.min(axisValue.data, function(d){
        return d3.min(d, function(_){ return _.val;});
      });
      if(NumberUtils.isNoValue(minMax.max )) {
        return null;
      }
      if(minMax.min >= 0) {
        minMax.min = 0;
        minMax.max += minMax.max * 5 / _width;
      } else if(minMax.max <= 0) {
        minMax.max = 0;
        minMax.min +=  minMax.min * 5/ _width;
      } else {
        var temp = (minMax.max - minMax.min) * 5 / _width;
        minMax.min -= temp;
        minMax.max += temp;
      }
      
      return minMax;
    }
    setProperty(manifest.props(null));
    return module;
  };
  return combination;
});