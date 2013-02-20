sap.riv.module(
{
  qname : 'sap.viz.mvc.CSSParserUtility',
  version : '4.0.0'},
[

],
function Setup() {
    var CSSParserUtility = function() {
    }
    
    var cp = CSSParserUtility.prototype;
    
    /*
     * split string
     */
    cp.split = function(str, splitter) {
        if (/['"]/.test(splitter)) throw '\' " is not allowed in splitter.';
        if (str == '') return [str];
        var stack = [];
        var res = [];
        var start = 0;
        var sl = splitter.length;
        var l = str.length;
        for (var i = 0; i < l; i++) {
            var c = str.charAt(i);
            if (c == "'" || c == '"') {
                if (stack.length > 0) {
                    var c2 = stack.pop();
                    if (c != c2) {
                        stack.push(c2);
                        stack.push(c);
                    } 
                } else {
                    stack.push(c);
                }
                continue;
            }
            if (stack.length > 0) continue;
            var sub = str.substring(i, i + sl);
            if (sub == splitter) {
                res.push(str.substring(start, i));
                i = start = i + sl;
            }
        }
        if (start < l) res.push(str.substring(start));
        return res;
    }
    /*
     * is the string a color
     */
    cp.COLORS = ['aqua', 'black', 'blue', 'fuchsia', 'gray', 'green', 'lime', 'maroon', 'navy', 'olive', 'orange', 'purple', 'red', 'silver', 'teal', 'white', 'yellow', 'transparent'];
    cp.isColor = function(colorStr) {
        colorStr = colorStr.toLowerCase();
        //color name
        if (this.COLORS.indexOf(colorStr) >= 0) return true;
        //starts with #
        if (colorStr.charAt(0) == '#') {
            var l = colorStr.length;
            if (l != 4 && l != 7) return false;
            return ! /[^0-9a-f]/.test(colorStr.substring(1));
        }
        //rgb()
        var num = '-?[0-9\\.]+%?';
        var rgbRE = RegExp('^rgb\\(' + num + ',' + num + ',' + num + '\\)$');
        if (rgbRE.test(colorStr)) return true;
        return false;
    }
    cp.NUM_RE_STR = '[0-9]+|[0-9]*\\.[0-9]+';
    /*
     * is the string a length
     */
    cp.isLength = function(lengthStr) {
        lengthStr = lengthStr.toLowerCase();
        var lengthRE =  new RegExp('^(' + this.NUM_RE_STR + ')(em|ex|in|cm|mm|pt|pc|px)$');
        return lengthRE.test(lengthStr);
    }
    /*
     * is percentage
     */
    cp.isPercentage = function(str) {
        var re = new RegExp('^' + this.NUM_RE_STR + '%$');
        return re.test(str);
    }
    /*
     * is the string a width
     */
    cp.WIDTHS = ['thin', 'medium', 'thick'];
    cp.isWidth = function(widthStr) {
        return this.WIDTHS.indexOf(widthStr) >=0 || this.isLength(widthStr);
    }
    /*
     * is the string a border style
     */
    cp.BORDER_STYLES = ['none', 'hidden', 'dotted', 'dashed', 'solid', 'double', 'groove', 'ridge', 'inset', 'outset'];
    cp.isBorderStyle = function(styleStr) {
        styleStr = styleStr.toLowerCase();
        return this.BORDER_STYLES.indexOf(styleStr) >= 0;
    }
    /*
     * is font style
     */
    cp.FONT_STYLES = ['italic', 'oblique'];
    cp.isFontStyle = function(str) {return this.FONT_STYLES.indexOf(str.toLowerCase()) >= 0;}
    /*
     * is font variant
     */
    cp.isFontVariant = function(str) {return 'small-caps' == str;}
    /*
     * is font weight
     */
    cp.FONT_WEIGHTS = ['bold', 'bolder', 'lighter', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
    cp.isFontWeight = function(str) {return this.FONT_WEIGHTS.indexOf(str.toLowerCase()) >= 0;}
    
    cp.TYPE_COLOR = 'color';
    cp.TYPE_WIDTH = 'width';
    cp.TYPE_BORDERSTYLE = 'borderstyle';
    cp.TYPE_FONTSTYLE = 'font-style';
    cp.TYPE_FONTVARIANT = 'font-variant';
    cp.TYPE_FONTWEIGHT = 'font-weight';
    cp.TYPE_UNKNOWN = 'unknown';
    cp.valueType = function(valStr) {
        if (this.isColor(valStr)) return this.TYPE_COLOR;
        if (this.isWidth(valStr)) return this.TYPE_WIDTH;
        if (this.isBorderStyle(valStr)) return this.TYPE_BORDERSTYLE;
        if (this.isFontStyle(valStr)) return this.TYPE_FONTSTYLE;
        if (this.isFontVariant(valStr)) return this.TYPE_FONTVARIANT;
        if (this.isFontWeight(valStr)) return this.TYPE_FONTWEIGHT;
        return this.TYPE_UNKNOWN;
    }
    
    //validator
    cp.FONT_SIZES = ['xx-small', 'x-small', 'small', 'medium', 'large', 'x-large', 'xx-large', 'smaller', 'larger'];
    cp.validateFontSize = function(str) {
        return this.FONT_SIZES.indexOf(str) >=0 || this.isLength(str) || this.isPercentage(str);
    }
    cp.validateMargin = function(str) {
        return str == 'auto' || this.isLength(str) || this.isPercentage(str);
    }
    cp.validatePadding = function(str) {
        return this.isLength(str) || this.isPercentage(str);
    }
    
    return CSSParserUtility;	
});