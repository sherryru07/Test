sap.riv.module(
{
  qname : 'sap.viz.data.handler.MeasureDataHandler',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
}
],

function Setup(FunctionUtils){
  
  var MeasureValuesDataHandler = {
      
      makeMeasureValues: function(ctx, mvg, axisIndex, maxAxisNumber, matchMeasure){
          
          var values = [];
          for(var i = 0; i < mvg.values.length; i++){
              if(matchMeasure && i !== ctx.path.mi){
                 continue;
              }
            
              var value = {};
              var mv = mvg.values[i];
              var rows = mv["rows"];
              value["col"] = mv["col"];
              if(ctx){
                 value["rows"] = this.createMeasureValues(ctx, rows, axisIndex, maxAxisNumber);
              }else{
                value["rows"] = this.createMeasureValuesWithoutCtx(rows, axisIndex, maxAxisNumber);
              }
          
              values.push(value);
           }
          
          return values;
        },
       
        /**
         * Create Measure values without context
         *   
         * @param rows
         * @param axisIndex
         * @returns {Array}
         */
        createMeasureValuesWithoutCtx_1_2 : function(rows, axisIndex){
          var values = [], j, row;
          if(axisIndex[0] === 1){
             row = [];
             for(j = 0; j < rows[0].length; j++){
               row.push(rows[0][j]);
             }   
             values.push(row);
           
          }else if(axisIndex[0] === 2){     
             for(j = 0; j < rows[0].length; j++){
               row = [];
               row.push(rows[0][j]);
               values.push(row);
             }   
          }else{
             FunctionUtils.error("Not supported");
         } 
          
          return values;
        },
        
        createMeasureValuesWithoutCtx_1_3 : function(rows, axisIndex){
           var values = [], j, row;
           if(axisIndex[0] === 1){
              row = [];
              for(j = 0; j < rows[0].length; j++){
                  row.push(rows[0][j]);
           }   
              
           values.push([row]);
           
         }else if(axisIndex[0] === 2){
              row = [];
              for(j = 0; j < rows[0].length; j++){
                  row.push([rows[0][j]]);
              }
              
              values.push(row);
              
         }else if(axisIndex[0] === 3){   
               for(j = 0; j < rows[0].length; j++){
                   row = [];
                   row.push([rows[0][j]]);
                   values.push(row);
               }
         }else{
           FunctionUtils.error("Not supported");
         }  
           
         return values;
         
        },
        
        createMeasureValuesWithoutCtx : function(rows, axisIndex, maxAxisNumber){
           if(axisIndex.length === 1){
             if(maxAxisNumber === 1 || maxAxisNumber === 2){
                return this.createMeasureValuesWithoutCtx_1_2(rows, axisIndex); 
             }else if(maxAxisNumber === 3){
                return this.createMeasureValuesWithoutCtx_1_3(rows, axisIndex);
             }else{
                FunctionUtils.error("Not supported");
             }
           }else if(axisIndex.length === 2){
             if(maxAxisNumber === 2){
                return rows;
             }
             else if(maxAxisNumber === 3){
                return this.createMeasureValues_2_3(rows, axisIndex); 
             }else{
                FunctionUtils.error("Not supported");
             } 
             
           }else{
             FunctionUtils.error("Not supported");
           }
           
           FunctionUtils.error("Not supported");
      },
      
      /**
         * Create Measure values without context
         *   
         * @param rows
         * @param axisIndex
         * @returns {Array}
         */
        createMeasureValues_1_2 : function(ctx, rows, axisIndex){
          var values = [], j, row;
           if(axisIndex[0] === 1){
              row = [];
              for(j = 0; j < rows.length; j++){
                  row.push(rows[j][ctx.path.dii]);
              } 
              
           values.push(row);
           
         }else if(axisIndex[0] === 2){
           
           for(j = 0; j < rows.length; j++){
             row = [];
             row.push(rows[j][ctx.path.dii]);
             values.push(row);
           }  
           
         }else{
           FunctionUtils.error("Not supported");
         } 
          
          return values;
        },
        
        createMeasureValues_1_3 : function(ctx, rows, axisIndex){
          var values = [], j, row;
          if(axisIndex[0] === 1){
             
           row = [];
           for(j = 0; j < rows.length; j++){
             row.push(rows[j][ctx.path.dii]);
           }   
           values.push([row]);
           
         }else if(axisIndex[0] === 2){
           row = [];
           for(j = 0; j < rows.length; j++){
             
             row.push([rows[j][ctx.path.dii]]);
             
           }  
           values.push(row);
           
         }else if(axisIndex[0] === 3){
           
           for(j = 0; j < rows.length; j++){
             row = [];
             row.push([rows[j][ctx.path.dii]]);
             values.push(row);
           }
           
         }else{
           FunctionUtils.error("Not supported");
         }
           
           return values;
        },
      
      createMeasureValues : function(ctx, rows, axisIndex, maxAxisNumber){
         var values = [];
         if(axisIndex.length === 1){
             if(maxAxisNumber === 1 || maxAxisNumber === 2){
              return this.createMeasureValues_1_2(ctx, rows, axisIndex); 
             }else if(maxAxisNumber === 3){
               return this.createMeasureValues_1_3(ctx, rows, axisIndex);
             }else{
                FunctionUtils.error("Not supported");
             }
         }else if(axisIndex.length === 2){
             if(maxAxisNumber === 2){
                return rows;
             }else if(maxAxisNumber === 3){
                return this.createMeasureValues_2_3(rows, axisIndex);
             }else{
              FunctionUtils.error("Not supported");
             }
         }else{
             FunctionUtils.error("Not supported");
         }
           
         
           return values;
      },
     
        createMeasureValues_2_3 : function(rows, axisIndex){
          var i ,j, values;
          if(axisIndex[0] === 1 && axisIndex[1] === 2){
            return [rows];
          }else if(axisIndex[0] === 1 && axisIndex[1] === 3){
            values = [];
            for(i = 0 ; i < rows.length; i++){
                values.push([rows[i]]);
            }
            return values;
            
          }else if(axisIndex[0] === 2 && axisIndex[1] === 3){
            values = [];
            for(i = 0 ; i < rows.length; i++){
              var value = [];
              var cols = rows[i];
              for(j = 0; j < cols.length; j++){
                var col = cols[j];
                value.push([col]);
              }
              values.push(value);
            }
            
            return values;
          }else{
            FunctionUtils.error("Not supported");
          }
        }
        
     };
  
  return MeasureValuesDataHandler;
});