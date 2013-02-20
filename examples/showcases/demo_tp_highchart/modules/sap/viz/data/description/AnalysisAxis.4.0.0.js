sap.riv.module(
{
  qname : 'sap.viz.data.description.AnalysisAxis',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.data.description.DimensionLabels',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
}
],
 function Setup(DimensionLabels, FunctionUtils, TypeUtils){
   
   var AnalysisAxis = function(data){
     this._dimensionLabels = [];
     this.init(data);
    
   };
   
   AnalysisAxis.prototype.init = function(data){
     
       for(var i = 0; i < data.length; i++){
         this._dimensionLabels[i] = new DimensionLabels(data[i]["name"], data[i]["type"]? data[i]["type"] : "Dimension",
                                                    data[i]["values"] );
         
         this._dimensionLabels[i].fake( data[i]["isFake"] ? data[i]["isFake"] : false);
         this._dimensionLabels[i].infos( data[i]["infos"] ? data[i]["infos"] : null);
       }
   };
   
   AnalysisAxis.prototype.getDimensionLabels = function(){
     return this._dimensionLabels;
   };
   
   AnalysisAxis.prototype.getType = function(){
     return "analysisAxis";
   };
   
   AnalysisAxis.prototype.validate  = function(){
      
      var labels = 1;
      var dimensions = this.getDimensionLabels();
      for(var i = 0; i < dimensions.length;i++){
        if(i === 0){
           labels = dimensions[i].getValues().length;
           if(TypeUtils.isExist(dimensions[i].infos()) && labels !== dimensions[i].infos().length){
              FunctionUtils.error(dimensions[i].getId() + " wrong infos count");
           }
        }
        else{
         if(labels !== dimensions[i].getValues().length){
            FunctionUtils.error(dimensions[i].getId() + " wrong dimension labels count");
         }
         
         if(TypeUtils.isExist(dimensions[i].infos()) && labels !== dimensions[i].infos().length){
                FunctionUtils.error(dimensions[i].getId() + " wrong infos count");
         }
        }
      }
      
      return labels;
     
   };
   
   AnalysisAxis.prototype.hasFakeData = function(){
      var dimensions = this.getDimensionLabels();
      for(var i = 0; i < dimensions.length;i++){
        if(dimensions[i].fake()){
           return true;
        }
      }
      
      return false;
   };
   
   return AnalysisAxis;
 });