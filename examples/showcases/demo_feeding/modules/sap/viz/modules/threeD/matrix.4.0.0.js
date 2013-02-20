sap.riv.module(
{
  qname : 'sap.viz.modules.threeD.matrix',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.threeD.Vector4D',
  version : '4.0.0'
}
],
function Setup(Vector4D) {
  var dimension = 4;
  var length = dimension * dimension;

  function radian(deg) {
    return deg * Math.PI / 180;
  }

  var matrixBuilder = function() {
    var values = new Array(length);

    var matrix = {
      unit : function() {
        for ( var i = 0; i < length; i++) {
          values[i] = (i % (dimension + 1) === 0) ? 1 : 0;
        }
        return matrix;
      },

      value : function(row, col, v) {
        var index = row * dimension + col;
        if (arguments.length >= 3) {
          values[index] = v;
          return matrix;
        }
        return values[index];
      },

      row : function(row) {
        var array = [];
        var start = row * dimension;
        for ( var i = 0; i < dimension; i++) {
          array[i] = values[start + i];
        }
        return new Vector4D(array[0], array[1], array[2], array[3]);
      },

      col : function(col) {
        var array = [];
        for ( var i = 0; i < dimension; i++) {
          array[i] = values[dimension * i + col];
        }
        return new Vector4D(array[0], array[1], array[2], array[3]);
      },

      translate : function(tx, ty, tz) {
        return matrix.transform(matrixBuilder().value(0, 3, tx || 0).value(1,
            3, ty || 0).value(2, 3, tz || 0));
      },

      scale : function(tx, ty, tz) {
        return matrix.transform(matrixBuilder().value(0, 0, tx || 0).value(1,
            1, ty || 0).value(2, 2, tz || 0));
      },

      rotateX : function(deg) {
        var r = radian(deg);
        var sin = Math.sin(r);
        var cos = Math.cos(r);
        return matrix.transform(matrixBuilder().value(1, 1, cos).value(1, 2,
            -sin).value(2, 1, sin).value(2, 2, cos));
      },

      rotateY : function(deg) {
        var r = radian(deg);
        var sin = Math.sin(r);
        var cos = Math.cos(r);
        return matrix.transform(matrixBuilder().value(0, 0, cos).value(0, 2,
            sin).value(2, 0, -sin).value(2, 2, cos));
      },
      
      rotateZ : function(deg){
        var r = radian(deg);
        var sin = Math.sin(r);
        var cos = Math.cos(r);
        return matrix.transform(matrixBuilder().value(0, 0, cos).value(0, 1,
            -sin).value(1, 0, sin).value(1, 1, cos));
      },
      
      transform : function(m) {
        if (m) {
          var rows = [], cols = [];
          for ( var i = 0; i < dimension; i++) {
            rows.push(m.row(i));
            cols.push(matrix.col(i));
          }
          for ( var i = 0; i < dimension; i++) {
            var start = i * dimension;
            for ( var j = 0; j < dimension; j++) {
              var index = start + j;
              values[index] = rows[i].dotProduct(cols[j]);
            }
          }
        }
        return matrix;
      },

      clone : function() {
        var newMatrix = matrixBuilder();
        for ( var i = 0; i < dimension; i++) {
          for ( var j = 0; j < dimension; j++) {
            newMatrix.value(i, j, matrix.value(i, j));
          }
        }
        return newMatrix;
      },

      projection : function() {
        return "matrix(" + matrix.value(0, 0) + "," + matrix.value(1, 0) + "," +
            matrix.value(0, 1) + "," + matrix.value(1, 1) + "," +
            matrix.value(0, 3) + "," + matrix.value(1, 3) + ")";
      },

      translatedProjection : function(){
        return "translate(" + this.value(0,3) + "," + this.value(1,3) +")";
      },
      
      toString : function() {
        var str = "";

        for ( var i = 0; i < length; i++) {
          if (i % 4 !== 0) {
            str += ", ";
          }
          str += values[i];
          if ((i - 3) % 4 === 0) {
            str += "\n";
          }
        }

        return str;
      }
    };

    return matrix.unit();
  };

  return matrixBuilder;
});