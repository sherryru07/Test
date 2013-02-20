sap.riv.module(
{
  qname : 'sap.viz.util.ColorSeriesGenerator',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.Constants',
  version : '4.0.0'
}
],
function Setup(constants) {
    var ColorSeriesGenerator = {
      /**
       * return d3 ordinal scale of sap standard color palette 
       */
      sap32 : function(){
      return d3.scale.ordinal().range(constants.SAPColorSingleAxis);
      },
      sap32dualaxis1 : function(){
            return d3.scale.ordinal().range(constants.SAPColorDualAxis1);
        },
        sap32dualaxis2 : function(){
            return d3.scale.ordinal().range(constants.SAPColorDualAxis2);
        },      
    }

    return ColorSeriesGenerator;
});