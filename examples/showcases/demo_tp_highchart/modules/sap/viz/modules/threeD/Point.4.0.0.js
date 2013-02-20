sap.riv.module(
{
  qname : 'sap.viz.modules.threeD.Point',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.threeD.Vector4D',
  version : '4.0.0'
}
],
function Setup(Vector4D) {
  function Point(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
  }
  Point.prototype.transform = function(m) {
    var vector = new Vector4D(this.x, this.y, this.z, 1);
    this.x = m.row(0).dotProduct(vector);
    this.y = m.row(1).dotProduct(vector);
    this.z = m.row(2).dotProduct(vector);
    return this;
  };

  return Point;
});