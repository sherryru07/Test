sap.riv.module(
{
  qname : 'sap.viz.modules.xyzlayout',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.threeD.matrix',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.threeD.Point',
  version : '4.0.0'
}
],
function Setup(TypeUtils, matrix, Point) {
  /*
   * Function set that represents a light-weight layout manager
   * who calculates optimal component layout data, rather than
   * operating on components directly.
   */
  var initBoundingBox = function(width, height, depth) {
    var bounds = [ {
      x : 0,
      y : 0,
      z : 0
    }, {
      x : 0,
      y : 0,
      z : depth
    }, {
      x : width,
      y : 0,
      z : 0
    }, {
      x : width,
      y : 0,
      z : depth
    }, {
      x : 0,
      y : height,
      z : 0
    }, {
      x : 0,
      y : height,
      z : depth
    }, {
      x : width,
      y : height,
      z : 0
    }, {
      x : width,
      y : height,
      z : depth
    } ];

    return bounds.map(function(bound) {
      return new Point(bound.x, bound.y, bound.z);
    });
  };

  var computeTransformBB = function(bounds, m) {
    var point = bounds[0];
    point.transform(m);

    var minx = point.x, miny = point.y, maxx = point.x, maxy = point.y;

    for ( var i = 1, len = bounds.length; i < len; i++) {
      point = bounds[i];
      point.transform(m);

      minx = Math.min(minx, point.x);
      miny = Math.min(miny, point.y);
      maxx = Math.max(maxx, point.x);
      maxy = Math.max(maxy, point.y);
    }

    return {
      x : minx,
      y : miny,
      z : maxx,
      w : maxy
    };

  };

  var computerMargin = function(prefs, m_xaxis, m_yaxis, m_zaxis) {
    return {
      top : 0,
      left : prefs.west.size.width,
      bottom : prefs.south.size.height > prefs.east.size.height ? prefs.south.size.height
          : prefs.east.size.height,
      right : prefs.east.size.height
    };
  };

  var prepareScale = function(width, height, bb, margin) {
    var bbSizeX = bb.z - bb.x;
    var bbSizeY = bb.w - bb.y;

    var sizeV = height - margin.bottom - margin.top;
    var sizeH = width - margin.left - margin.right;

    var ratioX = sizeH / bbSizeX;
    var ratioY = sizeV / bbSizeY;
    var minRatio = Math.min(ratioX, ratioY);

    return {
      x : minRatio,
      y : ratioY,
      z : minRatio
    };

  };

  var computeScale = function(width, height, depth, m, m_xaxis, m_yaxis,
      m_zaxis, prefs) {
    var bounds = initBoundingBox(width, height, depth);
    var bb = computeTransformBB(bounds, m);
    var savedBB = {
      x : bb.x,
      y : bb.y,
      x : bb.z,
      w : bb.w
    };
    var margin = computerMargin(prefs, m_xaxis, m_yaxis, m_zaxis);
    var scale = prepareScale(width, height, bb, margin);
    return scale;
  };

  var xyzlayout = function(spec) {

    var defaults = {
      resize : true,
      type : 'grid',
      padding : [ 0, 0, 0, 0 ],
      hgap : 0,
      vgap : 0
    };

    var hgap = spec.hgap || defaults.hgap, vgap = spec.vgap || defaults.vgap, padding = spec.padding
        || defaults.padding, bias = spec.bias || 'none';

    var m_xaxis = spec.m_xaxis, m_yaxis = spec.m_yaxis, m_zaxis = spec.m_zaxis, m_plot = spec.m_plot, m_background = spec.m_background;
    var twidth = spec.size.width, theight = spec.size.height;
    var xAngle = spec.xAngle, yAngle = spec.yAngle;

    var layoutSolution = {}, options = spec.prefs;

    var defaults = {
      resize : true,
      type : 'grid',
      padding : [ 0, 0, 0, 0 ],
      hgap : 0,
      vgap : 0
    };

    var hgap = spec.hgap || defaults.hgap, vgap = spec.vgap || defaults.vgap, padding = spec.padding
        || defaults.padding, bias = spec.bias || 'none';

    var m_xaxis = spec.m_xaxis, m_yaxis = spec.m_yaxis, m_zaxis = spec.m_zaxis, m_plot = spec.m_plot, m_background = spec.m_background;
    var twidth = spec.size.width, theight = spec.size.height;
    var xAngle = spec.xAngle, yAngle = spec.yAngle;

    var layoutSolution = {}, options = spec.prefs;

    if (!spec.finalLayout) {
      node = layoutSolution.center = {};
      node.bounds = {
        x : 0,
        y : 0,
        width : twidth,
        height : theight
      };

      return layoutSolution;
    }

    var w_y = options.west.size.width, h_y = options.west.size.height, w_x = options.south.size.width, h_x = options.south.size.height, w_z = options.east.size.width, h_z = options.east.size.height;

    var m = matrix();//.transform(matrix().rotateY(yAngle).rotateX(xAngle));
    m.transform(matrix().rotateY(yAngle).rotateX(xAngle));

    //var m_scale = computeScale(twidth, theight, w_z, m, m_xaxis, m_yaxis, m_zaxis, options);
    var bounds = initBoundingBox(twidth, theight, w_z);
    var bb = computeTransformBB(bounds, m);
    //var savedBB  =  { x: bb.x, y: bb.y, x: bb.z, w: bb.w};
    var margin = computerMargin(options, m_xaxis, m_yaxis, m_zaxis);
    var m_scale = prepareScale(twidth, theight, bb, margin);

    layoutSolution.scale = m_scale;

    h_y = theight - h_x;

    m.scale(m_scale.x, m_scale.y, m_scale.z);
    m_xaxis.scale(m_scale.x, m_scale.y, m_scale.z);
    m_yaxis.scale(m_scale.x, m_scale.y, m_scale.z);
    m_zaxis.scale(m_scale.x, m_scale.y, m_scale.z);
    m_plot.scale(m_scale.x, m_scale.y, m_scale.z);

    bounds = initBoundingBox(twidth, theight, w_z);
    var newbb = computeTransformBB(bounds, m);
    var scaledHeight = newbb.w - newbb.y;
    var scaledWidth = newbb.z - newbb.x;

    var minx = (twidth - scaledWidth) / 2;
    var miny = (theight - scaledHeight) / 2
        + Math.abs(new Point(0, 0, w_z).transform(m).y);//m.transformPoint({x:0,y:0,z:w_z}).y);

    //west
    var node = layoutSolution.west = {};
    var westpoint = new Point(0, 0, 0).transform(m);// m.transformPoint({x:0, y:0, z:0});
    var westpoint2 = new Point(0, h_y, 0).transform(m);
    var westlength = Math.sqrt(Math.pow(westpoint2.y - westpoint.y, 2)
        + Math.pow(westpoint2.x - westpoint.x, 2));
    node.bounds = {
      x : westpoint.x - w_y,
      y : westpoint.y - 7.5,
      width : w_z,
      height : westlength
    };
    m_yaxis.rotateY(-90).translate(westpoint.x, westpoint.y, 0).transform(
        matrix().rotateY(yAngle).rotateX(xAngle));

    //south
    node = layoutSolution.south = {};

    var mm = matrix().rotateY(yAngle).rotateX(xAngle);
    var spoint = new Point(0, h_y, 0).transform(m);
    var southpoint = new Point(0, h_y, 0).transform(mm);// m_yaxis.transformPoint({x: w_y, y:h_y - options.west.endPadding, z:0});

    var southpoint2 = new Point(w_x, h_y, 0).transform(mm);
    var southlength = Math.sqrt(Math.pow(southpoint2.y - southpoint.y, 2)
        + Math.pow(southpoint2.x - southpoint.x, 2));
    node.bounds = {
      x : spoint.x,
      y : spoint.y,
      width : southlength * m_scale.x,
      height : h_x
    };
    node.angle = Math.atan(mm.value(1, 0) / mm.value(0, 0)) * 180 / Math.PI;
    node.labelAngle = Math.atan(mm.value(1, 2) / mm.value(0, 2)) * 180 / Math.PI;
    node.tickAngle = Math.atan(mm.value(1, 2) / mm.value(0, 2)) * 180 / Math.PI;
    
    m_xaxis.rotateX(-90).transform(matrix().rotateY(yAngle).rotateX(xAngle))
        .translate(southpoint.x, southpoint.y, 0);

    //center
    node = layoutSolution.center = {};
    var centerpoint = new Point(0, 0, 0).transform(m);// m_yaxis.transformPoint({x: w_y, y: 0, z:0});
    node.bounds = {
      x : centerpoint.x,
      y : centerpoint.y,
      width : w_x,
      height : h_y - options.west.endPadding
    };
    m_plot.transform(matrix().rotateY(yAngle).rotateX(xAngle)).translate(
        centerpoint.x, centerpoint.y, 0);

    //east
    node = layoutSolution.east = {};
    var epoint = new Point(w_x, h_y - options.west.endPadding, 0).transform(m);

    var eastpoint = new Point(w_x, 0, 0).transform(mm); //m_xaxis.transformPoint({x: w_x, y:0, z: 0});
    var eastpoint2 = new Point(w_x, 0, w_z).transform(mm);
    var eastlength = Math.sqrt(Math.pow(eastpoint2.y - eastpoint.y, 2)
        + Math.pow(eastpoint2.x - eastpoint.x, 2));

    node.bounds = {
      x : epoint.x,
      y : epoint.y,
      width : eastlength * m_scale.z,
      height : h_z
    };
    node.angle = Math.atan(mm.value(1, 2) / mm.value(0, 2)) * 180 / Math.PI;
    node.labelAngle = Math.atan(mm.value(1, 0) / mm.value(0, 0)) * 180 / Math.PI;
    node.tickAngle = Math.atan(mm.value(1, 0) / mm.value(0, 0)) * 180 / Math.PI;
    
    m_zaxis.rotateY(-90).rotateZ(-90).transform(
        matrix().rotateY(yAngle).rotateX(xAngle)).translate(eastpoint.x,
        eastpoint.y, 0);

    node = layoutSolution.background = {};
    var backgroundpoint = new Point(w_y + w_z, 0, 0).transform(m_yaxis); // m_yaxis.transformPoint({x: w_y + w_z, y :0, z: 0});
    node.bounds = {
      x : backgroundpoint.x,
      y : backgroundpoint.y,
      width : w_x,
      height : h_y - options.west.endPadding
    };
    m_background.scale(layoutSolution.scale.x, layoutSolution.scale.y,
        layoutSolution.scale.z).transform(
        matrix().rotateY(yAngle).rotateX(xAngle)).translate(backgroundpoint.x,
        backgroundpoint.y, 0);

    return layoutSolution;
  };

  return xyzlayout;
});