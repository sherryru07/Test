sap.riv.module(
{
  qname : 'sap.viz.modules.tagcloud.wordleLayout',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.util.TextUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.NumberUtils',
  version : '4.0.0'
}
],
function Setup(TextRuler, NumberUtils) {
  var wordleLayout = function() {
    var width = 300, height = 300, chartData = [], font = '';

    var wordle = function() {

    };
    wordle.width = function(_) {
      if (!arguments.length) {
        return width;  
      }
        
      width = _;
      return wordle;
    };

    wordle.height = function(_) {
      if (!arguments.length) {
        return height;
      }
        
      height = _;
      return wordle;
    };

    wordle.data = function(_) {
      if (!arguments.length) {
        return chartData; 
      }
       

      _.sort(function(a, b) {
        if (a.wordSize && b.wordSize) {
          return b.wordSize.val - a.wordSize.val;
        }
      });
      chartData = _;
      return wordle;
    };

    wordle.font = function(_) {
      if (!arguments.length) {
        return font;
      }
       
      font = _;
      return wordle;
    };

    wordle.layout = function() {
      var relayout = false, layoutCount = 0;
      while (!relayout) {
        relayout = _layout(++layoutCount);
      }
      return wordle;
    };

    var _layout = function(layoutCount) {
      var tagArr = chartData, textSize, d, root;
      for ( var i = 0, len = tagArr.length; i < len; i++) {
        d = tagArr[i];

        if (NumberUtils.isNoValue(d.fontSize)) {
          continue;
        }

        textSize = TextRuler.fastMeasure(tagArr[i].word.val + 'i',
            tagArr[i].fontSize + 'px', 'normal', font);

        d.width = textSize.width;
        d.height = textSize.height;

        d.x = undefined;
        d.y = undefined;

        d.rect = new rect(d.width, d.height);

        var flag;
        if (!root) {
          var rotate;
          if (d.width <= width && d.height <= height) {
            rotate = false;
          } else if (d.height <= width && d.width <= height) {
            rotate = true;
          }
          if (rotate !== null) {
            root = d;
            if (rotate){
              d.rect.rotate();
            }
            d.rect.position(width / 2, height / 2);
            flag = true;
          }

        } else {
          var list = [];
          list.push(root);
          while (list.length !== 0) {
            var parent = list.shift();

            if (parent.child){
              parent.child.forEach(function(c) {
                if (c){
                  list.push(c);
                }
              });
            }

            flag = placeTag(d, parent, root);
            if (flag){
              break;
            }
          }
        }

        if (flag) {
          d.x = d.rect.x;
          d.y = d.rect.y;
          d.rotate = d.rect.rotated ? 90 : 0;
        }
      }

      tagArr.forEach(function(d) {
        delete d.child;
        delete d.rect;
      });

      return true;
    };

    function placeTag(tag, parent, root) {
      var rect = tag.rect;
      var child = parent.child;
      if (!child) {
        child = [];
        parent.child = child;
      }
      for ( var j = 0; j < 2; j++) {
        if (j === 1) {
          rect.rotate();
        }

        for ( var i = 0; i < 4; i++) {
          if (child[i]){
            continue;
          }

          var x, y;
          switch (i) {
          case 0:
            x = parent.x;
            y = parent.rect.y0 - rect.h / 2;
            break;
          case 1:
            y = parent.y;
            x = parent.rect.x1 + rect.w / 2;
            break;
          case 2:
            x = parent.x;
            y = parent.rect.y1 + rect.h / 2;
            break;
          case 3:
            y = parent.y;
            x = parent.rect.x0 - rect.w / 2;
            break;
          }

          rect.position(x, y);

          if (rect.x0 >= 0 && rect.y0 >= 0 && rect.x1 <= width && rect.y1 <= height) {
            if (validPosition(rect, parent, root)) {
              child[i] = tag;
              return true;
            }
          }
        }
      }

      rect.rotate();

      return false;
    }

    function validPosition(rect, parent, root) {
      if (root !== parent){
        if (!rect.notInterects(root.rect)){
          return false;
        }
      }

      for ( var i = 0, child = root.child, len = child ? child.length : 0; i < len; i++) {
        if (child[i] && !validPosition(rect, parent, child[i])){
          return false;
        }
      }

      return true;
    }

    function rect(w, h) {
      this.w = w;
      this.h = h;
      this.rotated = false;
    }

    rect.prototype = {
      position : function(x, y) {
        this.x = x;
        this.y = y;

        var _x = this.w / 2, _y = this.h / 2;
        this.x0 = x - _x;
        this.x1 = x + _x;
        this.y0 = y - _y;
        this.y1 = y + _y;
      },

      notInterects : function(rect) {
        return this.x1 <= rect.x0 || this.x0 >= rect.x1 || this.y1 <= rect.y0 || this.y0 >= rect.y1;
      },

      rotate : function() {
        this.rotated = !this.rotated;
        var t = this.h;
        this.h = this.w;
        this.w = t;
      }
    };

    return wordle;
  };
  return wordleLayout;
});