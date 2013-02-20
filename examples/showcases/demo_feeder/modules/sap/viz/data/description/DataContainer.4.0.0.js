sap.riv.module(
{
  qname : 'sap.viz.data.description.DataContainer',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
}
],
 function Setup(ObjUtils){
   
   var DataContainer = function(uid){
     this._uId = uid; 
     this._isFake = false;
     this._infos = null;
   };
        
  
   DataContainer.prototype.getId = function(){
           return this._uId;
     };
     
     DataContainer.prototype.fake = function(_){
       if (!arguments.length){
           return this._isFake;
       }
       
       this._isFake = _;
     };
       
     DataContainer.prototype.infos = function(_){
         if (!arguments.length){
             return this._infos;
         }
           
         this._infos = _;
     };

     return DataContainer;
 });