sap.riv.module(
{
  qname : 'sap.viz.data.description.MeasureValues',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.description.DataContainer',
  version : '4.0.0'
}
],
 function Setup(ObjUtils, DataContainer){
   
   /**
    * @private
    * @name sap.viz.data.description.MeasureValues
    */
     var MeasureValues = ObjUtils.derive(DataContainer, {
      
       /** 
        * @constructor
        * @param uid    identifier of measure values, usually name
        * @param values 
        */
       constructor : function ( uid, values ) {
           this._values = values;
       },
       
         getValues : function(){
           return this._values;
         }
    
    });
     
     
     
     return MeasureValues;
});