sap.riv.module(
{
  qname : 'sap.viz.util.parseCSS',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.mvc.CSSParser',
  version : '4.0.0'
}
],
function Setup(CSSParser) {
  function process(attrName, value, result) {
    var subAttrs;
    attrName = attrName.toLowerCase();
    switch (attrName) {
    case 'border':
      subAttrs = CSSParser.processBorder(value);
      break;
    case 'border-top':
    case 'border-right':
    case 'border-bottom':
    case 'border-left':
      subAttrs = CSSParser.processBorderEdge(value, name);
      break;
    case 'border-color':
      subAttrs = CSSParser.processBorderColor(value);
      break;
    case 'border-style':
      subAttrs = CSSParser.processBorderStyle(value);
      break;
    case 'border-width':
      subAttrs = CSSParser.processBorderWidth(value);
      break;
    case 'font':
      subAttrs = CSSParser.processFont(value);
      break;
    case 'margin':
      subAttrs = CSSParser.processMargin(value);
      break;
    case 'padding':
      subAttrs = CSSParser.processPadding(value);
      break;
    default:
      break;
    }

    if (!subAttrs) {
      result[attrName] = value;
    } else {
      subAttrs.forEach(function(subAttr) {
        result[subAttr.name] = subAttr.value;
      });
    }
  }

  return function(css) {
    var result = {};
    for ( var selector in css) {
      if (css.hasOwnProperty(selector)) {
        var defs = css[selector];
        var rule = {};
        for ( var name in defs) {
          if (defs.hasOwnProperty(name)) {
            process(name, defs[name], rule);
          }
        }
        result[selector] = rule;
      }
    }

    return result;
  };
});