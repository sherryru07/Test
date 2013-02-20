sap.riv.module(
{
  qname : 'sap.viz.data.description.MeasureValuesGroup',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.data.description.MeasureValues',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
}
],
 function Setup(MeasureValues, FunctionUtils){
   
   var MeasureValuesGroup = function(data){
       this._measureValues = [];
       this.init(data);
   };
   
   MeasureValuesGroup.prototype.init = function(data){
     
       for(var i = 0; i < data.length; i++){
           this._measureValues[i] = new MeasureValues(data[i]["name"], data[i]["values"]);
           this._measureValues[i].fake(data[i]["isFake"] ? data[i]["isFake"] : false);
           this._measureValues[i].infos(data[i]["infos"] ? data[i]["infos"] : null);
       }
   };
   
   MeasureValuesGroup.prototype.getMeasureValues = function(){
       return this._measureValues;
   };
   
   MeasureValuesGroup.prototype.getType = function(){
       return "measureValuesGroup";
   };
   
   MeasureValuesGroup.prototype.validate  = function(labels){
       
      var measures, value, i, j;
      if (!arguments.length){
        var label = [1,1];
        measures = this.getMeasureValues();
        for(i = 0; i < measures.length;i++){
          value = measures[i].getValues();
          if(i === 0){
           if(value.length !== label[1]){
              FunctionUtils.error(measures[i].getId() + " wrong values count in aa2. should be " + label[1]);
           }
           
           label[0] = value[0].length;
           
          }else{
            if(value.length !== label[1]){
               FunctionUtils.error(measures[i].getId() + " wrong values count in aa2. should be " + label[1]);
            }
            
            for(j = 0; j < value.length; j++){
              if(value[j].length !== label[0] ){
                 FunctionUtils.error(measures[i].getId() + " wrong values count in aa1. should be " + label[0]);
              }
            }  
          }
          
        }
        
        return label;
        
      }else{
        measures = this.getMeasureValues();
        for(i = 0; i < measures.length;i++){
          value = measures[i].getValues();
          if(value.length !== labels[1]){
             FunctionUtils.error(measures[i].getId() + " wrong values count in aa2. should be " + labels[1]);
          }
          
          for(j = 0; j < value.length; j++){
            if(value[j].length !== labels[0] ){
               FunctionUtils.error(measures[i].getId() + " wrong values count in aa1. should be " + labels[0]);
            }
          }
        }
      }
     
   };
   
   MeasureValuesGroup.prototype.hasFakeData = function(){
      var measures = this.getMeasureValues();
      for(var i = 0; i < measures.length;i++){
        if(measures[i].fake()){
           return true;
        }
      }
      
      return false;
   };
   
   return MeasureValuesGroup;
 });