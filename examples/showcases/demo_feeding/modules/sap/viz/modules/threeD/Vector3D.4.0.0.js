sap.riv.module(
{
  qname : 'sap.viz.modules.threeD.Vector3D',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.threeD.Vector',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.threeD.Point',
  version : '4.0.0'
}
],
function Setup(Vector, Point) {
  function Vector3D() {
    Vector.apply(this, arguments);
  }

  Vector3D.prototype = Object.create(Vector.prototype);

  Vector3D.prototype.transform = function(m) {
    var p1 = new Point(0, 0, 0).transform(m);
    var p2 = new Point(this.value(0), this.value(1), this.value(2))
        .transform(m);
    this.value(0, p2.x - p1.x);
    this.value(1, p2.y - p1.y);
    this.value(2, p2.z - p1.z);
    return this;
  };

  return Vector3D;
});