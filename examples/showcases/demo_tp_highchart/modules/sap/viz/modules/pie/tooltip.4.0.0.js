sap.riv.module(
{
  qname : 'sap.viz.modules.pie.tooltip',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.util.TextUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.UADetector',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.Repository',
  version : '4.0.0'
}
],
function Setup(TextUtils, UADetector, Repository) {
  var wrapperClass = "tooltip", caretClass = "caret", minRadius = 8.9 * 14 / 2;
  var caretAngle = 60, textsVSpacing = 8;
  // alistar zhu
  var randomSuffix = Repository.newId();
  var shadowFilterId = "tooltip-caret-shadow-" + randomSuffix;
  var textClassNamesInTheme = [ "viz-pie-tooltip-label-dimensions",
      "viz-pie-tooltip-label-value", "viz-pie-tooltip-label-percentage" ];

  function renderCaret(p) {
    return p.append("svg:path").attr("class", caretClass).attr("d", "M 0 0 Z");
  }

  function createShadowFilterDef(defs) {
    var ns = defs.namespaceURI;
    var shadowFilter = defs.appendChild(document.createElementNS(ns, "filter"));
    shadowFilter.id = shadowFilterId;

    var feGaussianBlur = shadowFilter.appendChild(document.createElementNS(ns,
        "feGaussianBlur"));
    feGaussianBlur.setAttribute("in", "SourceAlpha");
    feGaussianBlur.setAttribute("stdDeviation", 3);
    feGaussianBlur.setAttribute("result", "blur");

    var feMerges = shadowFilter.appendChild(document.createElementNS(ns,
        "feMerge"));
    feMerges.appendChild(document.createElementNS(ns, "feMergeNode"))
        .setAttribute("in", "blur");
    feMerges.appendChild(document.createElementNS(ns, "feMergeNode"))
        .setAttribute("in", "SourceGraphic");
  }

  function renderTexts(p) {
    var texts = [];
    for ( var i = 0; i < 3; i++) {
      texts[i] = p.append("svg:text").attr("class", textClass(i)).datum(
          function(d) {
            return {
              text : ""
            };
          });
    }
  }

  function texts(p) {
    return p.selectAll("text");
  }

  function applyTextStyles(texts, styleManager) {
    texts.attr("style", function(d, i) {
      var className = textClassNamesInTheme[i];
      return styleManager.cssText(className);
    });
  }

  function textClass(i) {
    return "label" + (i + 1);
  }

  function adjustTexts(texts) {
    var textClass1 = textClass(1);
    var text1Height;
    texts.each(function(d) {
      d.r = d3.select(this.parentNode).datum().r;
    }).filter("." + textClass1).attr("dy", function(d) {
      var dy = 0, txt = d.text;
      if (UADetector.isIE()) {
        dy = TextUtils.verticalCentralOffset(txt, this);
      }

      TextUtils.ellipsisInCircle(txt, this, d.r, 0);
      text1Height = this.getBBox().height;

      return dy;
    });
    texts.filter(":not(." + textClass1 + ")").attr(
        "dy",
        function(d, i) {
          var txt = d.text;
          var txtHeight = TextUtils.measure(txt, this).height;

          var dy = (UADetector.isIE() ? (i === 0 ? 0 : txtHeight)
              : (txtHeight / 2)) +
              text1Height / 2 + textsVSpacing;

          var maxLength = Math.sqrt(Math.pow(d.r, 2) -
              Math.pow(txtHeight + text1Height / 2 + textsVSpacing, 2)) * 2;

          TextUtils.ellipsis(txt, this, maxLength);
          if (i === 0) {
            dy = -dy;
          }

          return dy;
        });
  }

  function normalizeAngle(a) {
    a %= 360;

    if (a < 0) {
      a += 360;
    }
    return a;
  }

  function caretRotateTween(el, endAngle) {
    var transformList = el.transform.baseVal;
    var startAngle = transformList.numberOfItems === 0 ? 0
        : normalizeAngle(transformList.getItem(0).angle);

    var endAngles = [];
    endAngles[0] = normalizeAngle(endAngle);
    endAngles[1] = endAngles[0] - 360;
    endAngles[2] = endAngles[0] + 360;

    var minRange = 360, index = null;
    for ( var i = 0; i < endAngles.length; i++) {
      var range = Math.abs(endAngles[i] - startAngle);
      if (range < minRange) {
        minRange = range;
        index = i;
      }
    }

    var interpolator = d3.interpolateNumber(startAngle, endAngles[index]);
    return function(t) {
      return "rotate(" + interpolator(t) + ")";
    };
  }

  function computeCaretSize(or) {
    if (or >= 12 * 14) {
      return 14;
    }

    if (or >= 8 * 14) {
      return 0.8 * 14;
    }

    return 0.5 * 14;
  }

  return function() {
    function tooltip(p, styleManager) {
      var wrapper = p.selectAll("g." + wrapperClass).data(function(d, i) {
        var data;
        if (d.or > minRadius) {
          data = [ {
            r : d.ir,
            caretSize : computeCaretSize(d.or)
          } ];
        } else {
          data = new Array(0);
        }
        return data;
      });
      wrapper.exit().remove();

      texts(wrapper).call(applyTextStyles, styleManager).call(adjustTexts);

      var enterWrapper = wrapper.enter().append("svg:g").attr("class",
          wrapperClass).style("opacity", 0).attr("visibility", "hidden").attr(
          "pointer-events", "none").call(renderCaret).call(renderTexts);

      texts(enterWrapper).call(applyTextStyles, styleManager);
    }

    tooltip.createShadowFilterDef = createShadowFilterDef;

    tooltip.defaultStyle = function(parentClass) {
      return "." +
          parentClass +
          " ." +
          wrapperClass +
          " text{dominant-baseline:central}." +
          parentClass +
          " ." +
          wrapperClass +
          " ." +
          caretClass +
          "{fill:#fff;" +
          (UADetector.isSafari() ? "-webkit-svg-shadow: 0 0 10px rgba(0, 0, 0, 0.25)"
              : "filter:url(#" + shadowFilterId + ")") + "}";
    };

    tooltip.select = function(p) {
      var wrapper = p.selectAll("g." + wrapperClass);
      if (wrapper.empty()) {
        return null;
      }

      return {
        show : function() {
          wrapper.attr("visibility", null).transition().duration(200).style(
              "opacity", 1);
          return this;
        },
        hide : function() {
          wrapper.transition().each("end", function() {
            wrapper.attr("visibility", "hidden");
          }).duration(200).style("opacity", 0);
          return this;
        },
        texts : function() {
          var values = arguments;
          texts(wrapper).each(function(d, i) {
            d.text = values[i];
          }).call(adjustTexts);
          return this;
        },
        caret : function() {
          var caret = wrapper.select("." + caretClass);

          return {
            show : function() {
              caret.attr("d", function(d) {
                var x = Math.tan(caretAngle * Math.PI / 360) * d.caretSize;
                var y = Math.sqrt(d.r * d.r - x * x);
                return "M 0 " + -(y + d.caretSize) + " L " + x + " " + -y +
                    " A " + d.r + " " + d.r + " 0 1 1 " + -x + " " + -y + " Z";
              });
              return this;
            },
            hide : function() {
              caret.attr("d", function(d) {
                return "M 0 " + d.r + " A " + d.r + " " + d.r + " 0 1 1 0 " +
                    -d.r + " A " + d.r + " " + d.r + " 0 1 1 0 " + d.r + " Z";
              });
              return this;
            },
            rotateTo : function(angle) {
              caret.transition().duration(200).attrTween("transform",
                  function() {
                    return caretRotateTween(this, angle * 180 / Math.PI);
                  });

              return this;
            }
          };
        }
      };
    };

    return tooltip;
  };
});