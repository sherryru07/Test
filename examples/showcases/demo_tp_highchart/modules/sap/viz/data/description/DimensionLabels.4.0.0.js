sap.riv.module(
{
  qname : 'sap.viz.data.description.DimensionLabels',
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
   
  
     var DimensionLabels = ObjUtils.derive(DataContainer, {
      
       /**
          * @name sap.viz.data.description.DimensionLabels
          * @param   uid    identifier of dimension labels, usually name 
        */
      
       constructor : function ( uid, type, values ) {
           this._type = type;
           this._values = values;
       },
       
       getValues : function(){
           return this._values;
       },
         
       getType : function(){
           return this._type;
       }
       
    });
     
     
     return DimensionLabels;
  });