sap.riv.module(
{
  qname : 'sap.viz.util.NumberUtils',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
}
],
function Setup(TypeUtils) {
  var NumberUtils = {
    isNoValue: function(n) {
      return TypeUtils.isNaN(n);
    }
  };
  return NumberUtils;
});