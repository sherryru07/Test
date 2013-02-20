sap.riv.module(
{
  qname : 'sap.viz.modules.threeD.Vector',
  version : '4.0.0'},
[

],
function Setup(Point) {
  function Vector() {
    this.values = [];
    for ( var i = 0, len = arguments.length; i < len; i++) {
      this.values.push(arguments[i]);
    }
  }

  Vector.prototype.dotProduct = function(v) {
    var dimension = v.dimension();
    if (dimension !== this.dimension()) {
      throw new Error(
          "The vectors to be dot-producted must have same dimension, but the dimension of this vector is " +
              this.dimension + " and another one is " + dimension + ".");
    }
    var sum = 0;
    for ( var i = 0; i < dimension; i++) {
      sum += this.value(i) * v.value(i);
    }
    return sum;
  };

  Vector.prototype.dimension = function(v) {
    return this.values.length;
  };

  Vector.prototype.value = function(i, d) {
    if (arguments.length >= 2) {
      this.values[i] = d;
    }
    return this.values[i];
  };

  return Vector;
});