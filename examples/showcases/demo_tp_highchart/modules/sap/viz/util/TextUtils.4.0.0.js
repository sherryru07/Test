sap.riv.module(
{
  qname : 'sap.viz.util.TextUtils',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.UADetector',
  version : '4.0.0'
}
],
function Setup(TypeUtils, UADetector) {
  var ns = "http://www.w3.org/2000/svg";
  var node;
  var sensitiveStyle = [ "font", "font-family", "font-size",
      "font-size-adjust", "font-stretch", "font-style", "font-variant",
      "font-weight", "letter-spacing", "word-spacing", "alignment-baseline",
      "baseline-shift", "dominant-baseline" ];
  var textSizeCache = [];

  function getNode() {
    if (!node) {
      var svg = document.body.appendChild(document.createElementNS(ns, "svg"));
      svg.style.cssText = "position:absolute;left:-1000px;top:-1000px;z-index:-9000;width:1px;height:1px";
      node = svg.appendChild(document.createElementNS(ns, "text"));
    }

    return node;
  }

  function applyText(text, style) {
    var node = getNode();

    if (!style)
      node.removeAttribute("style");
    else {
      if (!TypeUtils.isString(style)) {
        var computedStyle = UADetector.isIE() ? style.ownerSVGElement
            .getComputedStyle(style) : getComputedStyle(style);

        var cssText = "";
        sensitiveStyle.forEach(function(i) {
          var s = computedStyle.getPropertyValue(i);
          if (s != null)
            cssText += i + ":" + s + ";";
        });
        style = cssText;
      }
      node.style.cssText = style;
    }
    if (text == null)
      text = "";

    node.textContent = text;
    return node;
  }
  
  function ellipsis(text, textNode, expectedLength, cssStyle, textApplied) {
    if (expectedLength > 0) {
      var node = textApplied ? getNode() : applyText(text, (cssStyle != null ? cssStyle : textNode));
      if (node.getComputedTextLength() <= expectedLength) {
        if (textNode) {
          textNode.textContent = text;
        }
        return text;
      }

      node.textContent = "...";
      expectedLength -= node.getComputedTextLength();
      node.textContent = text;

      if (expectedLength > 0) {
        var charNumber = text.length;
        var i = 0;
        while (++i < charNumber) {
          if (node.getSubStringLength(0, charNumber - i) <= expectedLength) {
            var reText = text.substring(0, charNumber - i) + "...";
            if (textNode) {
              textNode.textContent = reText;
              textNode.appendChild(document.createElementNS(
                  textNode.namespaceURI, "title")).textContent = text;
            }
            return reText;
          }
        }
      }
    }
    if (textNode) {
      textNode.textContent = "";
    }
    return "";
  }  

  return {
    /**
     * Measure the dimension of the text in given style
     * 
     * @param {String}
     *          text the text to be measured
     * @param style
     *          the style definition text or a DOM node. If it is a node, its
     *          style will be used to measure text.
     * @returns {Object}
     */
    measure : function(text, style) {
        if (text === '') {
            return {
                width : 0,
                  height : 0,
                  x : 0,
                  y : 0
            };
        }
      var box = applyText(text, style).getBBox();
      return {
        width : box.width,
        height : box.height,
        x : box.x,
        y : box.y
      };
    },

    /**
     * Fast measure the dimension of the text in given fontSize, fontWeight and
     * fontFamily
     * 
     * @param {String}
     *          text the text to be measured
     * @param {String}
     *          fontSize
     * @param {String}
     *          fontWeight
     * @param {String}
     *          fontFamily
     * @returns {Object}
     */
    fastMeasure : function(text, tFontSize, tFontWeight, tFontFamily) {
      var index = text + tFontSize + tFontWeight + tFontFamily;
      var cachedSize = textSizeCache[index];
      if (!cachedSize) {
        textSizeCache[index] = this.measure(text, "font-size:" + tFontSize
            + "; font-weight:" + tFontWeight + "; font-family:" + tFontFamily);

        cachedSize = textSizeCache[index];
      }
      return cachedSize;
    },

    /**
     * Ellipsis long text.
     * 
     * @param {String}
     *          text the text to be processed
     * @param {Node}
     *          textNode the svg:text which will be display text
     * @param {Number}
     *          maxLength the max text length
     */
    ellipsis : function(text, textNode, maxLength, cssStyle) {
      return ellipsis(text, textNode, maxLength, cssStyle, false);
    },
   
    /**
     * Ellipsis long text in a circle area.
     * 
     * @param {String}
     *          text the text to be processed
     * @param {Node}
     *          textNode the svg:text which will be display text
     * @param {Number}
     *          r the radius of circle
     * @param {Number}
     *          h the offset from center of circle
     */
    ellipsisInCircle : function(text, textNode, r, h) {
      var node = applyText(text, textNode);

      var maxLength = Math.sqrt(Math.pow(r, 2)
          - Math.pow(h + node.getBBox().height / 2, 2)) * 2;
      ellipsis(text, textNode, maxLength, null, true);
    },

    verticalCentralOffset : function(text, textNode) {
      var tmpNode = applyText(text, textNode);
      var box = tmpNode.getBBox();
      var actualHeight = -box.y;
      var fontSize = parseInt(tmpNode.ownerSVGElement.getComputedStyle(tmpNode)["fontSize"]);
      return (actualHeight - (box.height - fontSize)) / 2;
    }
  };
});