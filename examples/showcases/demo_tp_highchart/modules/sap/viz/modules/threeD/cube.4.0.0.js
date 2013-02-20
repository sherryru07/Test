sap.riv.module(
{
  qname : 'sap.viz.modules.threeD.cube',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.threeD.Vector4D',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.threeD.Vector3D',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.threeD.matrix',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.threeD.Point',
  version : '4.0.0'
}
],
function Setup(Vector4D, Vector3D, matrix, Point3D) {
  return function() {
    var width, height, depth, transformMatrix, color;
    function cube(parent) {
      var wrapper = parent.selectAll("g.cube").data(function(d, i) {
        var wv = d3.functor(width).apply(this, arguments);
        var hv = d3.functor(height).apply(this, arguments);
        var dv = d3.functor(depth).apply(this, arguments);
        var m = d3.functor(transformMatrix).apply(this, arguments);
        var c = d3.functor(color).apply(this, arguments);

        return [ {
          wv : wv,
          hv : hv,
          dv : dv,
          m : m,
          data : d,
          c : c
        } ];
      });
      wrapper.exit().remove();
      wrapper.enter().append("g").attr("class", "cube datapoint normal");

      var initBoundingBox = function(w, h, d){
        return [
                [0,0,0],
                [0,h,0],
                [0,h,d],
                [0,0,d],
                [w,0,0],
                [w,h,0],
                [w,h,d],
                [w,0,d]
                ];
      };
      
      var rects = wrapper.selectAll("rect[class|=\"cube-surface\"]").data(
          function(d) {
            var wv = d.wv;
            var hv = d.hv;
            var dv = d.dv;

            var c = d.c;
            var hsl = d3.rgb(c).hsl();
            var light = hsl.l;
            var lightC = d3.hsl(hsl.h, hsl.s, light * 1.06).rgb().toString();
            var darkC = d3.hsl(hsl.h, hsl.s, light * 0.94).rgb().toString();

            var rectDatas = new Array({
              m : matrix().rotateX(90).translate(0, hv, 0).transform(d.m),
              type : "bottom"
            }, {
              m : matrix().rotateY(180).translate(0, 0, dv).transform(d.m),
              type : "back"
            }, {
              m : matrix().rotateY(90).transform(d.m),
              type : "left"
            }, {
              type : "front",
              m : d.m
            }, {
              m : matrix().rotateY(-90).translate(wv, 0, 0).transform(d.m),
              type : "right"
            }, {
              m : matrix().rotateX(-90).transform(d.m),
              type : "top"
            });

            rectDatas.forEach(function(o) {
              o.normal = new Vector3D(0, 0, -1).transform(o.m);
            });

            rectDatas = rectDatas.filter(function(o) {
              return o.normal.value(2) < 0;
            });

            rectDatas.forEach(function(o) {
              switch (o.type) {
              case "bottom":
                o.x = 0;
                o.y = 0;
                o.w = wv;
                o.h = dv;
                break;
              case "back":
                o.x = -wv;
                o.y = 0;
                o.w = wv;
                o.h = hv;
                break;
              case "left":
                o.x = -dv;
                o.y = 0;
                o.w = dv;
                o.h = hv;
                break;
              case "front":
                o.x = 0;
                o.y = 0;
                o.w = wv;
                o.h = hv;
                break;
              case "right":
                o.x = 0;
                o.y = 0;
                o.w = dv;
                o.h = hv;
                break;
              case "top":
                o.x = 0;
                o.y = -dv;
                o.w = wv;
                o.h = dv;
                break;
              }

              var normalX = o.normal.value(0);
              o.fill = normalX === 0 ? lightC : (normalX < 0 ? c : darkC);
            });

            return rectDatas;
          });

      rects.exit().remove();

      rects.enter().append("rect").attr("class", function(d) {
        return "cube-surface-" + d.type;
      });

      rects.attr("x", function(d) {
        return d.x;
      }).attr("y", function(d) {
        return d.y;
      }).attr("width", function(d) {
        return d.w;
      }).attr("height", function(d) {
        return d.h;
      }).attr("transform", function(d) {
        if (d.m) {
          return d.m.projection();
        }
      }).attr("fill", function(d) {
        return d.fill;
      });

      wrapper.each(function(d) {
        var flbpz = 0;
        if (d.m) {
          var ctMz = d.m.row(2);
          flbpz = new Vector4D(0, d.hv, 0, 1).dotProduct(ctMz);
        }
        d3.select(this.parentNode).datum().flbpz = flbpz;
        
        var points = initBoundingBox(d.wv, d.hv, d.dv), npoints = [];
        points.forEach(function(p){
          npoints.push(new Point3D(p[0], p[1], p[2]).transform(d.m));
        });
        
        npoints.sort(function(a, b) {
          return (b.x - a.x);
         });
         
         npoints.splice(2);
         
         npoints.sort(function(a,b){
           return (a.y - b.y);
         });
       
         d.rtp = npoints[0];
      });

      parent.sort(function(a, b) {
        return d3.descending(a.flbpz, b.flbpz);
      });
    }

    cube.width = function() {
      if (arguments.length === 0) {
        return width;
      }

      width = arguments[0];
      return cube;
    };

    cube.height = function() {
      if (arguments.length === 0) {
        return height;
      }

      height = arguments[0];
      return cube;
    };

    cube.depth = function() {
      if (arguments.length === 0) {
        return depth;
      }

      depth = arguments[0];
      return cube;
    };

    cube.matrix = function() {
      if (arguments.length === 0) {
        return transformMatrix;
      }

      transformMatrix = arguments[0];
      return cube;
    };

    cube.color = function() {
      if (arguments.length === 0) {
        return color;
      }

      color = arguments[0];
      return cube;
    };

    return cube;
  };
});