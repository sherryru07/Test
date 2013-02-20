sap.riv.module(
{
  qname : 'sap.viz.data.handler.MultiChartDataHandler',
  version : '4.0.0'},
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
    
   function initSubChartAxes(axes){
     
       var sub = axes.slice(0);
       sub.sort(function(a,b){return a.index -b.index;});
       sub.shift();  
       
       return sub;
   }
   
   function initMeasureValueAxisIndexForMeasure(bindingInfo){
     if(bindingInfo[0] === true){
       if(bindingInfo[1] === true){
          return [1,2];
       }else{
         return [1];
       }
      
     }else if(bindingInfo[1] === true){
       return [2];
     }else{
       return [1]; 
     }
     
   }
   
   function initMeasureValueAxisIndex(bindingInfo){
     
      //axis 1 has been feeded with crosstable
      if(bindingInfo[0] === true){
         if(bindingInfo[1] === true){
            return [1];
         }else if(bindingInfo[2] === true){
            if(bindingInfo.length > 3){
               return [1];//Multi Radar,pass crosstable to radar as single chart handler
            }else{
               return [2];
            }
         }else if(bindingInfo[3] === true){// Multi Radar, aa 4 could not be feeded
            FunctionUtils.error("Not Supported");
         }else{
            return [1];
         }
      }else if(bindingInfo[1] === true){
         if(bindingInfo[2] === true){
            return [1, 2];
         }else if(bindingInfo[3] === true){
            FunctionUtils.error("Not Supported");
         }else{
            return [1];
         }
      }else if(bindingInfo[2] === true){
        if(bindingInfo[3] === true){
           FunctionUtils.error("Not Supported");
        }
        else{
          if(bindingInfo.length > 3){
             return [1];//Multi Radar,pass crosstable to radar as single chart handler
          }else{
             return [2];
          }
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
   
   function MultiChartDataHandler(dataAdapter, type){
        this._dataAdapter =  dataAdapter;
        this._aa = this._dataAdapter.getAnalysisAxisDataByIdx();
        this._mg = this._dataAdapter.getMeasureValuesGroupDataByIdx();
        this._subAxes = initSubChartAxes(this._aa);
        this._type = type;
        
        if(this._type === undefined){
           this._measureValueAxisIndex = initMeasureValueAxisIndex(this._dataAdapter.getBindingInfo());
           this._maxMeasureAxis = 2;
        }else if(this._type === "measures"){
           this._measureValueAxisIndex = initMeasureValueAxisIndexForMeasure(this._dataAdapter.getBindingInfo());
           this._maxMeasureAxis = this._dataAdapter.getBindingInfo().length ;
        }
      
   }
   
   MultiChartDataHandler.prototype.getSubDataAdapter = function(ctx){
       if(this._type === undefined){
          return this.getSubDataAdapterByContext(ctx);
       }else if(this._type === "measures"){
          return this.getSubDataAdapterByMeasures(ctx);
       }
       
       return null;
     
   };
   
   MultiChartDataHandler.prototype.getSubDataAdapterByContext = function(ctx){
     var dataAdapter, subAxis, i, mvg;
     if(ctx){
        //Multiplier with MND
        if(ctx.path.mg !== undefined && ctx.path.mi !== undefined){
          if(ctx.path.di !== undefined && ctx.path.dii !== undefined){ // Mulitplier with Dimension and MND
             dataAdapter = new MultiAxesDataAdapter();
            
            for(i = 0; i < this._subAxes.length; i++){
              subAxis = this._subAxes[i];
              dataAdapter.addAnalysisAxis({index: subAxis.index - 1, values: subAxis.values});
            }
            
            mvg = this._mg[ctx.path.mg];
            dataAdapter.addMeasureValuesGroup({index: 0, values: MeasureDataHandler.makeMeasureValues(ctx, mvg, this._measureValueAxisIndex, this._maxMeasureAxis, true)});
            
            
            return dataAdapter;

          }else{//Multiplier with MND only
           dataAdapter = new MultiAxesDataAdapter();
           
           for(i = 0; i < this._subAxes.length; i++){
             subAxis = this._subAxes[i];
             dataAdapter.addAnalysisAxis({index: subAxis.index - 1, values: subAxis.values});
           }
           
           mvg = this._mg[ctx.path.mg];
           //MeasureDataHandler.makeMeasureValues(ctx, mvg, this._measureValueAxisIndex, this._maxAxisCount
           dataAdapter.addMeasureValuesGroup({index: 0, values:MeasureDataHandler.makeMeasureValues(null, {"values":[mvg.values[ctx.path.mi]]}, this._measureValueAxisIndex, this._maxMeasureAxis, false)});
           
           return dataAdapter;
          }
          
        }else{ //Multiplier without MND
          dataAdapter = new MultiAxesDataAdapter();
        
          for(i = 0; i < this._subAxes.length; i++){
            subAxis = this._subAxes[i];
            dataAdapter.addAnalysisAxis({index: subAxis.index - 1, values: subAxis.values});
          }
          
          for(i = 0; i < this._mg.length; i++){
            mvg = this._mg[i];
            dataAdapter.addMeasureValuesGroup({index: mvg.index, values:  MeasureDataHandler.makeMeasureValues(ctx, mvg, this._measureValueAxisIndex, this._maxMeasureAxis, false)});
          }
          
          return dataAdapter;
          }
       }
     
     return null;
   };
   
   MultiChartDataHandler.prototype.getSubDataAdapterByMeasures = function(ctx){
     var dataAdapter = new MultiAxesDataAdapter();
      
     for(var i = 0; i < this._aa.length; i++){
        dataAdapter.addAnalysisAxis(this._aa[i]);
     }
      
     var mg = this._mg[0];
     
     dataAdapter.addMeasureValuesGroup({index : 0, values : MeasureDataHandler.makeMeasureValues(null, {"values":[mg.values[ctx.row]]}, this._measureValueAxisIndex, this._maxMeasureAxis, false)});
     dataAdapter.addMeasureValuesGroup({index : 1, values : MeasureDataHandler.makeMeasureValues(null, {"values":[mg.values[ctx.col]]}, this._measureValueAxisIndex, this._maxMeasureAxis, false)});
     
     return dataAdapter;
   };
   
   
   return MultiChartDataHandler;
   
 });