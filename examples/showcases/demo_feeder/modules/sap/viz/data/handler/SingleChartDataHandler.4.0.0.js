sap.riv.module(
{
  qname : 'sap.viz.data.handler.SingleChartDataHandler',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.MultiAxesDataAdapter',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.handler.MeasureDataHandler',
  version : '4.0.0'
}
],
 function Setup(FunctionUtils, MultiAxesDataAdapter, MeasureDataHandler){
   
   
   function initMeasureValueAxisIndex(bindingInfo){
     
      //axis 1 has been feeded with crosstable
      if(bindingInfo[0] === true){
       if(bindingInfo[1] === true){
          return [1 ,2];
       }
       else if(bindingInfo[2] === true){
        // pass crosstable data to module if module accpet more than 2 axis feed
          return [1, 2];
       }
       else if(bindingInfo[3] === true){// Multi Radar, aa 4 could not be feeded
          FunctionUtils.error("Not Supported");
       }
       else{
          return [1];
       }
      }else if(bindingInfo[1] === true){
       if(bindingInfo[2] === true){
          //pass crosstable data to module if module accpet more than 2 axis feed
          return [1,2];
       }
       else if(bindingInfo[3] === true){
          FunctionUtils.error("Not Supported");
       }
       else{
         //pass crosstable data to module if module accpet more than 2 axis feed
         if(bindingInfo.length > 2){
            return [1];
         }
         else{
            return [2];
         }
       }
      }else if(bindingInfo[2] === true){
        if(bindingInfo[3] === true){
           FunctionUtils.error("Not Supported");
        }
        else{
         //pass crosstable data to module if module accpet more than 2 axis feed
         return [1];
        }
      }else{
        for(var i = 0; i< bindingInfo.length;i++){
          if(bindingInfo[i] === true){
            FunctionUtils.error("could not determin measure value axis index");
          }
        }
        //all false
        return [1];
      }
       
      FunctionUtils.error("could not determin measure value axis index");
     
    } 
   
   function SinngleChartDataHandler(dataAdapter){
        this._dataAdapter =  dataAdapter;
   }
   
   SinngleChartDataHandler.prototype.getDataAdapter = function(){
      if(this._dataAdapter.getBindingInfo() === null || this._dataAdapter.getBindingInfo() === undefined ){
         return this._dataAdapter;
      }
      else{
         return this.getChartDataAdapter();
      }
   };
   
   SinngleChartDataHandler.prototype.getChartDataAdapter = function(){
      var measureAxisIndex = initMeasureValueAxisIndex(this._dataAdapter.getBindingInfo());
      var aa = this._dataAdapter.getAnalysisAxisDataByIdx();
      var mg = this._dataAdapter.getMeasureValuesGroupDataByIdx();
      var dataAdapter = new MultiAxesDataAdapter();
      for(var i = 0; i < aa.length; i++){
        var axis = aa[i];
        dataAdapter.addAnalysisAxis({index: axis.index, values: axis.values});
      }
      
      for(i = 0; i < mg.length; i++){
        var mvg = mg[i];
        dataAdapter.addMeasureValuesGroup({index:mvg.index, values: MeasureDataHandler.makeMeasureValues(null, mvg, measureAxisIndex, 2, false)});
      }
      
      return dataAdapter;
   };
   
   return SinngleChartDataHandler;
 });