sap.riv.module(
{
  qname : 'sap.viz.modules.pie',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.modules.pie.sector',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.pie.selection',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.pie.tooltip',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.TextUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.ColorSeriesGenerator',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.dispatch',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.UADetector',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.Repository',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
},
{  qname : 'sap.viz.format.FormatManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.BoundUtil',
  version : '4.0.0'
}
],
function Setup(sectorModule, selectionModule, tooltip, TextUtils,
    ColorSeriesGenerator, dispatch, UADetector, FunctionUtils, TypeUtils,
    Repository, Objects, formatManager, langManager, BoundUtil) {
  var horizontalMarginRatio = 2.414;
  // Alistar zhu
  var randomSuffix = Repository.newId();
  var innerRadiusRatio = function(outerRadius) {
    // 12em
    // return outerRadius >= 12 * 14 ? horizontalMarginRatio : 1.618;
    return horizontalMarginRatio;
  };

  var padding = 6;

  var loadingAnimationDuration = 600;
  var defaultColorPalette = ColorSeriesGenerator.sap32();

  var id = "viz-pie";
  var defsId = id + "-defs" + randomSuffix;

  var clipPathIdPrefix = id + "-clipPath-";
  var wrapperClass = id, mainshapeClass = 'datashapesgroup', backgroundClass = "background", donutTitleClass = wrapperClass +
      "-donut-title", hoverSectorClass = "hoverSector", sectorGroupClass = "sectorgroup";

  var selection = selectionModule();

  var tooltipFunc = tooltip();

  var sectorFunc = sectorModule();

  var defaultStyle = "." +
      wrapperClass +
      "{font-family:'Open Sans',Arial,Helvetica,sans-serif;text-anchor:middle}" +
      "." + wrapperClass + " ." + backgroundClass + "{fill-opacity:0;}" + " ." +
      donutTitleClass +
      "{font-weight:bold;font-size:16px;fill:#333;dominant-baseline: middle}" +
      tooltipFunc.defaultStyle(wrapperClass) +
      selection.defaultStyle(hoverSectorClass, sectorGroupClass);

  function rotateTootltipBySector(d, tip, caret) {
    if (!caret) {
      caret = tip.caret();
    }
    caret.show().rotateTo(d.midAngle());
    var tipValue, tipPercentage;
    tipValue = d.value();
    tipPercentage = d.proportion();
    if (TypeUtils.isExist(d.p.tooltip.formatString)) {
      tipValue = formatManager.format(tipValue, d.p.tooltip.formatString[0]);
      tipPercentage = formatManager.format(tipPercentage,
          d.p.tooltip.formatString[1]);
    } else {
      tipValue = d.value(d.p.tooltip.valueFormat);
      tipPercentage = d.proportion(d.p.tooltip.percentageFormat);
    }

    tip.texts(d.dimValues().map(function(s) {
      return s === null ? langManager.get('IDS_ISNOVALUE') : s;
    }).join(" - "), tipValue, tipPercentage).show();
  }

  function donutTitle(wrapper) {
    var text = wrapper.selectAll("text." + donutTitleClass).data(function(d) {
      if (d.p.isDonut) {
        var title = d.measure.col;
        if (title === null) {
          title = langManager.get('IDS_ISNOVALUE');
        }

        return [ {
          width : d.ir,
          title : title
        } ];
      }

      return [];
    });
    text.exit().remove();
    text.enter().insert("svg:text", ".sectorgroup").attr("class",
        donutTitleClass);

    text.each(function(d) {
      TextUtils.ellipsisInCircle(d.title, this, d.width, 0);
    });
  }

  function calculateOuterRadiusByHeight(h) {
    return h / 2 - padding;
  }

  function calculateOuterRadiusByWidth(w) {
    return Math.max(w / 2 / (1 + 1 / horizontalMarginRatio), padding *
        horizontalMarginRatio);
  }

  function calculateOuterRadius(w, h, maxRadius) {
    if (maxRadius) {
      return Math.min(h / 2, w / 2);
    }
    return Math.min(calculateOuterRadiusByHeight(h),
        calculateOuterRadiusByWidth(w));
  }

  function calculateInnerRadius(outerRadius) {
    return outerRadius / innerRadiusRatio(outerRadius);
  }

  var clipPathArc = d3.svg.arc();

  function clipPathTween(d) {
    var clipPathInterpolate = d3.interpolateNumber(d.startAngle, d.endAngle);
    return function(t) {
      d.endAngle = clipPathInterpolate(t);
      return clipPathArc(d);
    };
  }

  function defStyles(defs, styleManager) {
    var style = d3.select(defs).selectAll("style").data(
        [ defaultStyle + sectorModule.cssText(styleManager) ]);

    style.exit().remove();
    style.enter().append("style");
    style.text(String);
  }

  function highlight(el, flag, onSector, tip, sectorGroup) {
    selection.select(TypeUtils.isArray(el) ? d3.selectAll(el) : d3.select(el),
        flag);
    if (onSector === false) {
      refreshTooltip(tip, sectorGroup);
    }
  }

  function refreshTooltip(tip, sectorGroup) {
    if (!tip) {
      return;
    }
    var selectedSectors = selection.allSelected(sectorGroup);

    if (selectedSectors.empty()) {
      tip.hide();
    } else {
      var d = sectorGroup.datum();
      if (!d.p.tooltip.visible) {
        tip.hide();
      } else {
        var sum = 0;
        var proportionSum = 0;
        var numer = 0;
        selectedSectors.each(function(d) {
          sum += d.val;
          proportionSum += d.proportion();
          numer++;
        });
        var caret = tip.caret();
        if (numer === 1) {
          rotateTootltipBySector(selectedSectors.datum(), tip, caret);
        } else {
          tip.texts(numer + " selected", d3.format(d.p.tooltip.valueFormat)
              (sum), d3.format(d.p.tooltip.percentageFormat)(proportionSum));
          caret.hide();
        }
      }
    }
  }

  var fn = function(manifest, ctx) {
    var width = null, height = null, data = null, props = manifest.props(null), colorPalette;
    var effectManager = ctx.effectManager;
    var widthFunctor, heightFunctor, propsFunctor = FunctionUtils.noop;

    var parent, sectorGroup, wrapper, tip;

    var _dispatch = dispatch("selectData", "deselectData", "initialized",
        'startToInit');

    function pie() {
      parent = this;
      BoundUtil.drawBound(parent, width, height);
      
      var root = this.node().ownerSVGElement;
      var defs = root.getElementById(defsId);
      if (!defs) {
        defs = document.createElementNS(root.namespaceURI, "defs");
        root.insertBefore(defs, root.childNodes[0]);
        defs.id = defsId;
        tooltipFunc.createShadowFilterDef(defs);

        effectManager.setContainer(d3.select(defs));
      }
      _dispatch.startToInit();
      defStyles(defs, ctx.styleManager);

      wrapper = this.selectAll("g." + wrapperClass).data(pieWrapperData(data));
      wrapper.exit().each(
          function(d) {
            document.documentElement.removeEventListener("keydown",
                d.keydownListener);
            delete d.keydownListener;
          }).remove();
      
      var enterWrapper = wrapper.enter().append("g").attr("class", wrapperClass);
      if(!props.isGeoPie){
          enterWrapper.append("g").attr("class", sectorGroupClass + " " + mainshapeClass);
      }else{
          enterWrapper.append("g").attr("class", sectorGroupClass);
      }
      


      wrapper.attr(
          "transform",
          function(d) {
            if (d.p.alignCenter) {
              return null;
            }
            return "translate(" + d.w / 2 + "," +
                (d.p.valign === "center" ? d.h / 2 : (d.or + padding)) + ")";
          }).select("." + backgroundClass).attr("width", function(d) {
        return d.w;
      }).attr("height", function(d) {
        return d.h;
      }).attr("x", function(d) {
        return -d.w / 2;
      }).attr("y", function(d) {
        return -d.h / 2;
      });

      var clipPath = wrapper.selectAll(function() {
        var result = [];
        Array.prototype.forEach.call(this.childNodes, function(node) {
          if (node.tagName === 'clipPath') {
            result.push(node);
          }
        });
        return result;
      }).data(function(d) {
        var result = [];
        var isDonut = d.p.isDonut;
        var animation = d.animation = d.p.animation.dataLoading;
        if (isDonut || animation) {
          result.push({
            innerRadius : isDonut ? d.ir : 0,
            outerRadius : d.or + padding,
            startAngle : 0,
            endAngle : Math.PI * 2,
            animation : animation
          });
        }
        return result;
      });

      clipPath.exit().remove();
      clipPath.enter().append("svg:clipPath").attr(
          "id",
          function() {
            var id, k = 0;
            while (true) {
              id = clipPathIdPrefix + (k++) + randomSuffix;
              if (!document.getElementById(id)) {
                break;
              }
            }
            this.parentNode.querySelector("." + sectorGroupClass).setAttribute(
                "clip-path", "url(#" + id + ")");
            return id;
          }).append("svg:path").attr("clip-rule", "evenodd").attr("d",
          clipPathArc);

      wrapper.call(donutTitle);
      sectorGroup = wrapper.select("g." + sectorGroupClass ).call(sectorFunc, effectManager);

      selection.clearAll(sectorGroup);

      wrapper.call(tooltipFunc, ctx.styleManager);
      tip = tooltipFunc.select(wrapper);
      if (tip) {
        tip.hide();
      }
      clipPath.filter(function(d) {
        return d.animation;
      }).select(":first-Child").transition().duration(loadingAnimationDuration)
          .each(
              "end",
              function(d) {
                var clipPathNode = this.parentNode;
                var wrapperNode = clipPathNode.parentNode;
                if (wrapperNode) {
                  if (d.innerRadius === 0) {
                    wrapperNode.removeChild(clipPathNode);
                    wrapperNode.querySelector("." + sectorGroupClass)
                        .removeAttribute("clip-path");
                  }
                  var wrapperData = d3.select(wrapperNode).datum();
                  wrapperData.animationEnd = true;
                  fireInitializedEvent(wrapperData);
                }
              }).attrTween("d", clipPathTween);

      clipPath.filter(function(d) {
        return !d.animation;
      }).select(":first-Child").attr("d", clipPathArc);

      wrapper.each(function(d) {
        d.domInitialized = true;
        fireInitializedEvent(d);
      });
    }

    function pieWrapperData(d) {
      var parentNode = this.parentNode;
      var p = propsFunctor.apply(parentNode, arguments);
      var w = widthFunctor.apply(parentNode, arguments);
      var h = heightFunctor.apply(parentNode, arguments);
      var or = calculateOuterRadius(w, h, p.maxRadius);
      var colorRange = d3.functor(colorPalette).apply(parentNode, arguments);

      var result = {
        w : w,
        h : h,
        p : p,
        or : or,
        ir : calculateInnerRadius(or),
        color : colorRange ? d3.scale.ordinal().range(colorRange)
            : defaultColorPalette.copy(),
        measure : d.getMeasureValuesGroupDataByIdx(0).values[0],
        dimensions : d.getAnalysisAxisDataByIdx(0).values
      };
      result.drawingEffect = result.p.drawingEffect;

      return [ result ];
    }

    function fireInitializedEvent(d) {
      if (d.domInitialized && (!d.animation || d.animationEnd)) {
        _dispatch.initialized({
          name : 'initialized'
        });
      }
    }
    
    pie.afterUIComponentAppear = function(){
      _dispatch.initialized(); 
    };
    
    pie.dataLabel = function(_) {
    };

    pie.parent = function() {
      return parent;
    };

    pie.clear = function(flag) {
      selection.clear(sectorGroup, flag);
      return pie;
    };

    pie.highlight = function(el, onSector) {
      highlight(el, true, onSector, tip, sectorGroup);
      return pie;
    };

    pie.unhighlight = function(el, onSector) {
      highlight(el, false, onSector, tip, sectorGroup);
      return pie;
    };

    pie.mouseover = function(el) {
      var s = d3.select(el);
      s.classed(hoverSectorClass, true);

      var d = s.datum();
      if (d.p.tooltip.visible) {
        if (tip) {
          rotateTootltipBySector(d, tip, undefined);
        }
      } else {
        if (tip) {
          tip.hide();
        }
      }
      return pie;
    };

    pie.mouseout = function(el) {
      var sect = d3.select(el);
      if (UADetector.isIE()) {
        setTimeout(function() {
          sect.classed(hoverSectorClass, false);
        }, 0);
      } else {
        sect.classed(hoverSectorClass, false);
      }

      if (!tip) {
        return;
      }

      refreshTooltip(tip, sectorGroup);
      return pie;
    };

    /**
     * get/set width
     */
    pie.width = function(_) {
      if (arguments.length === 0) {
        return width;
      }
      width = _;
      widthFunctor = d3.functor(width);
      return pie;
    };

    /**
     * get/set height
     */
    pie.height = function(_) {
      if (arguments.length === 0) {
        return height;
      }
      height = _;
      heightFunctor = d3.functor(height);
      return pie;
    };

    /**
     * get/set size
     */
    pie.size = function(w, h) {
      if (arguments.length === 0) {
        return {
          width : this.width(),
          height : this.height()
        };
      }
      pie.width(w).height(h);
      return pie;
    };

    /**
     * get/set data
     */
    pie.data = function(_) {
      if (arguments.length === 0) {
        return data;
      }
      data = _;
      return pie;
    };

    /**
     * get event dispath
     */
    pie.dispatch = function(_) {
      return _dispatch;
    };

    /**
     * get/set properties
     */
    pie.properties = function(_) {
      if (arguments.length === 0) {
        return props;
      }
      Objects.extend(true, props, _);
      propsFunctor = d3.functor(props);

      if (typeof (props) === "function") {
        colorPalette = function(d, i) {
          return propsFunctor.apply(this, arguments).colorPalette;
        };
      } else if (props.colorPalette) {
        colorPalette = props.colorPalette;
      }
      return pie;
    };

    /**
     * get/set color palette
     */
    pie.colorPalette = function(_) {
      if (arguments.length === 0) {
        return colorPalette || defaultColorPalette.range();
      }
      colorPalette = _;
      return pie;
    };
    return pie;
  };

  return fn;
});