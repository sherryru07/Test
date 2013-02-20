sap.riv.module(
{
  qname : 'sap.viz.util.BoundingBox',
  version : '4.0.0'},
[

],

function Setup() {
  var boundingbox = {};
  boundingbox.getBBox = function (node, rootNode) {
    var matrix;
    if (arguments.length === 1) {
      matrix = node.getCTM();
    } else {
      matrix = node.getTransformToElement(rootNode);
    }
    return boundingbox.getBBoxHelp(node, matrix);
  };

  boundingbox.getBBoxHelp = function (node, matrix) {
    var box = node.getBBox();
    var corners = new Array();
    var point = d3.select('svg')[0][0].createSVGPoint();
    point.x = box.x;
    point.y = box.y;
    corners.push(point.matrixTransform(matrix));
    point.x = box.x + box.width;
    point.y = box.y;
    corners.push(point.matrixTransform(matrix));
    point.x = box.x + box.width;
    point.y = box.y + box.height;
    corners.push(point.matrixTransform(matrix));
    point.x = box.x;
    point.y = box.y + box.height;
    corners.push(point.matrixTransform(matrix));
    var minX = corners[0].x;
    var maxX = corners[0].x;
    var minY = corners[0].y;
    var maxY = corners[0].y;
    for (var i = 1; i < corners.length; i++) {
      var x = corners[i].x;
      var y = corners[i].y;
      if (x < minX) {
        minX = x;
      } else if (x > maxX) {
        maxX = x;
      }
      if (y < minY) {
        minY = y;
      } else if (y > maxY) {
        maxY = y;
      }
    }

    return {
      x: minX,
      y: minY,
      width: maxX - minX,
      height: maxY - minY
    };
  };

  // return true if the two boxes intersect
  boundingbox.intersects = function(a, b) {
    return (a.x <= (b.x + b.width) &&
        b.x <= (a.x + a.width) &&
        a.y <= (b.y + b.height) &&
        b.y <= (a.y + a.height));
  };

  // returns a box representing the intersection of box1 and box2 if it exists, otherwise null
  boundingbox.intersection = function(box1, box2) {
    if (boundingbox.intersects(box1, box2)) {
      var x1 = Math.max(box1.x, box2.x),
          x2 = Math.min(box1.x + box1.width, box2.x + box2.width),
          y1 = Math.max(box1.y, box2.y),
          y2 = Math.min(box1.y + box1.height, box2.y + box2.height);

      return {
        x: x1,
        y: y1,
        width: x2 - x1,
        height: y2 - y1
      };
    }

    return null;
  };

  return boundingbox;
});