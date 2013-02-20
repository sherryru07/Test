sap.riv.module(
{
  qname : 'sap.viz.modules.threeD.Vector4D',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.threeD.Vector',
  version : '4.0.0'
}
],
function Setup(Vector) {
  function Vector4D(p1, p2, p3, p4) {
    Vector.apply(this, arguments);
  }

  Vector4D.prototype = Object.create(Vector.prototype);

  return Vector4D;
});