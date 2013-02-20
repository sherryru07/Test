sap.riv.module(
{
  qname : 'sap.viz.data.MultiAxesDataAdapter',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
}
],
function Setup(TypeUtils, FunctionUtils){


   /**
    * @name sap.viz.data.MultiAxesDataAdapter
    * @constructor
      */
   function MultiAxesDataAdapter(bindingInfo){
     this._bindingInfo = bindingInfo;
     this._aa  = [];
     this._mg  = [];
     this._fakeData = false;
     this._dataPointCount = 0;
     this._emptyDataset = false;
   }
   
   /**
    * @name sap.viz.data.MultiAxesDataAdapter#addAnalysisAxis
    * @function
    * @param {Object} aa
    */
   MultiAxesDataAdapter.prototype.addAnalysisAxis = function(aa){
        if(aa){
           this._aa.push(aa);
        }
   };
   
   /**
    * @name sap.viz.data.MultiAxesDataAdapter#addMeasureValuesGroup
    * @function 
    * @param {Object} mg
    */
   MultiAxesDataAdapter.prototype.addMeasureValuesGroup = function(mg){
        if(mg){
          this._mg.push(mg);
        }
   };
   
   /**
    * @name sap.viz.data.MultiAxesDataAdapter#getAnalysisAxisDataByIdx
    * @function 
    * @param {Object} index
    */
   MultiAxesDataAdapter.prototype.getAnalysisAxisDataByIdx = function(idx){
     if(!arguments.length){
        return this._aa;
     }
     
     for(var i = 0; i < this._aa.length; i++){
       if(this._aa[i].index === idx){
          return this._aa[i];
       }
     }
     
     return null;
   };
   
   /**
    * @name sap.viz.data.MultiAxesDataAdapter#getMeasureValuesGroupDataByIdx
    * @function 
    * @param {Object} index
    */
   MultiAxesDataAdapter.prototype.getMeasureValuesGroupDataByIdx = function(idx){
     if(!arguments.length){
        return this._mg;
     }
     
     for(var i = 0; i < this._mg.length; i++){
       if(this._mg[i].index === idx){
          return this._mg[i];
       }
     }
     
     return null;
   };
   
   MultiAxesDataAdapter.prototype.createDataAdapterForModule = function(ctx){
     
      var subDataAdapter = new MultiAxesDataAdapter();
      var i;
      if(ctx && ctx.aa){
        for(i = 0; i < ctx.aa.length; i++){
          var aa = this.getAnalysisAxisDataByIdx(ctx.aa[i] - 1);
          if(aa){
             subDataAdapter.addAnalysisAxis({index:i, values: aa.values});
          }
        } 
      }
      
      if(ctx && ctx.mg){
        for(i = 0; i < ctx.mg.length; i++){
          var mg = this.getMeasureValuesGroupDataByIdx(ctx.mg[i] - 1);
          if(mg){
             subDataAdapter.addMeasureValuesGroup({index: i, values: mg.values});
          }
        }
      }
      
      return subDataAdapter;
     
   };
   
   MultiAxesDataAdapter.prototype.getBindingInfo = function(){
        return this._bindingInfo;
   };
   
   MultiAxesDataAdapter.prototype.fakeData = function(_){
     if (!arguments.length){
         return this._fakeData;
     }
     
     this._fakeData = _;
   };
   

   MultiAxesDataAdapter.prototype.dataPointCount = function(_){
     if (!arguments.length){
       return this._dataPointCount;
     }
     
     this._dataPointCount = _;
   };
   
   MultiAxesDataAdapter.prototype.emptyDataset = function(_){
     if (!arguments.length){
         return this._emptyDataset;
     }
     
     this._emptyDataset = _;
   };
   
   return MultiAxesDataAdapter;
   
});