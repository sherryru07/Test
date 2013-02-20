sap.riv.module(
{
  qname : 'sap.viz.data.handler.BaseDataHandler',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
}
],
 function Setup(FunctionUtils, TypeUtils, langManager){
 
   
   /**
    * determine which feed should be appended with MeasureNamesDimension 
    * @param feeds feeds Array
    * @returns feedId  to auto feed mnd
    */
   function determineMNDFeed(feeds){
     
     var dimensionFeed = [];
     var allFeeded = true;
     //first to see if MND is manually feeded
     var i = 0;
     for(; i < feeds.length; i++){
       var feed = feeds[i];
       if(feed.type() === "Dimension" && feed.acceptMND() >= 0){
         if(feed.hasMNDFeeded()){
            return feed.feedId();
         }else if(feed.getDataCount() < feed.max()){
           dimensionFeed[feed.acceptMND()] = feed;
           if(allFeeded){
              allFeeded = feed.hasFeeded();
           }
         }
           
       } 
     }
     
     if(dimensionFeed.length === 0){
        return "";
     }
     
     //Second, see which feed should be auto feeded MND
     //case 1: all feeds has been feeded, decide by mndPriority
     
     if(allFeeded){
        return dimensionFeed[dimensionFeed.length - 1].feedId();
     }
      
     //case 2: not all feeds has been feeded, feed MND to non-feeded feed with highest priority
     for(i = dimensionFeed.length - 1; i >= 0; i--){
       if(dimensionFeed[i] && !dimensionFeed[i].hasFeeded()){
          return dimensionFeed[i].feedId();
       }
     }
     
     return "";
   }
   
   /**
    * return a validate value according to val passed by user
    * 1 if val is string, just return
    * 2 if val is number, convert to string , return
    * 3 if val is other type, return null
    * 
    */
   function validateStringValue(val){
     if(TypeUtils.isString(val)){
        return val;
     }else if(TypeUtils.isNumber(val)){
        return val.toString();
     }else{
        return null;
     }
   }
   
   /**
    * return a validate value according to val passed by user
    * 1 if val is number, just return
    * 2 if val is string, convert to number , return
    * 3 if val is other type, return null
    * 
    */
   function validateNumberValue(val){
     if(TypeUtils.isNumber(val)){
        return parseFloat(val);
     }else{
        return null;
     }
   }
   
   function initDataPointUpperLimit(rawData, upperLimit){
       var limit = [ Number.POSITIVE_INFINITY, Number.POSITIVE_INFINITY];
       
       var rawDataCount = rawData.getDataPointCount();
       if(upperLimit === Number.POSITIVE_INFINITY || !TypeUtils.isNumber(upperLimit) || upperLimit >= rawDataCount){
          return limit;
       }
       
       //get total measure values count
       var mvCount = 0;
       var mvgCount = rawData.getMeasureValuesGroupCount();
       for(var i = 0; i < mvgCount; i++){
         mvCount += rawData.getMeasureValuesGroupByIdx(i).getMeasureValues().length;
       }
       
       //limit of one measure value
       var mvLimit = Math.floor(upperLimit / mvCount);
       
       var aaCount = rawData.getAnalysisAxisCount();
       if(aaCount === 0 || aaCount === 1){
          limit[0] = mvLimit; 
       }else if(aaCount === 2){
         var mv = rawData.getMeasureValuesGroupByIdx(0).getMeasureValues()[0];
         //var aa2Point = mv.getValues().length;
         var aa1Point = mv.getValues()[0].length;
         if(mvLimit/aa1Point < 1){
           limit[0] = mvLimit;
           limit[1] = 1;
         }else{
           limit[1] = Math.floor(mvLimit/aa1Point);
         }
       }
       
       return limit;
   }
   
   function BaseDataHandler(feeder, rawData, upperLimit){
          this._feeder  = feeder;
          this._feeds   = feeder.getFeeds();
          this._mndFeed = determineMNDFeed(this._feeds);
          this._limit = initDataPointUpperLimit(rawData, upperLimit);
   }
   
   
   BaseDataHandler.prototype.getFeedValues = function(feedId){
      var feed = this._feeder.findFeed(feedId);
      if(!feed){
         FunctionUtils.error('could not find feed definition of ' + feedId );
      }
      
      if(feed.type() === "Dimension"){
         return this.getDimensionFeedValues(feed);
      }else if(feed.type() === "Measure"){
         return this.getMeasureFeedValues(feed);
      }
     
   };
   
   
   BaseDataHandler.prototype.getDimensionFeedValues = function(feed){
     
      var feedValues = [];
      var hasManualMND = false;
      
      var datas = feed.data();
      
      var obj;
      
      var mndDefaultString = langManager.get('IDS_DEFAULTMND');
      if(datas.length > 0){
        
        for(var i = 0; i < datas.length; i++ ){
          var data = datas[i];
       
          if(data){
            if(data.getType() === "measureNamesDimension"){ 
                obj = {};
                
                //col
                obj['col'] = {'val': mndDefaultString};
                obj['type'] = 'MND';
                
                obj['rows'] = this.getMeasureNamesValues(); 
                feedValues.push(obj);
                hasManualMND = true;
                
            }else if(data.getType() === "analysisAxis"){
              
              var dimensionLabels = data.getDimensionLabels();
              var aaIndex = this._feeder.getAnalysisAxisIndex(feed);
              
              for(var j = 0 ; j < dimensionLabels.length; j++){
                  obj = {};
                  
                  //col
                  obj['col'] = {'val': validateStringValue(dimensionLabels[j].getId())};
                  //rows
                  var rows = [];
                  var values =  dimensionLabels[j].getValues();
                  var infos =  dimensionLabels[j].infos();
                  var limit = values.length;
                  if(this._limit[aaIndex] !== Number.POSITIVE_INFINITY){
                     limit = this._limit[aaIndex];
                  }
                  
                  for(var k = 0; k < limit; k++){
                        var value = { 'val':validateStringValue(values[k]), 
                                      'ctx': {
                                                          'type' : 'Dimension',
                                                          'path': {
                                                                     'aa': aaIndex,
                                                                     'di':  j,
                                                                     'dii': k  }
                                                         }
                                                };
                        
                        if(TypeUtils.isExist(infos)){
                           value.info = infos[k];
                        }
                        
                    rows.push(value);
     
                  }
                  
                  obj['rows'] = rows;
                    
                  feedValues.push(obj);
               }                
            }else{
              FunctionUtils.error('wrong type when getting data');
            } 
          }
          
        }
      }
     
      if(feed.feedId() === this._mndFeed && hasManualMND === false){
          //col
          obj = {};
          obj['col'] = {'val': mndDefaultString};
          obj['type'] = 'MND';
          
          obj['rows'] = this.getMeasureNamesValues();
          
          feedValues.unshift(obj);
      }
      
      return feedValues.length > 0 ? feedValues : null;
   };
   
     BaseDataHandler.prototype.getMeasureFeedValues = function(feed){
       var feedValues = [];
       var measureValues = feed.getMeasureValues();
         var mgIndex = this._feeder.getMeasureValuesGroupIndex(feed);
         for(var i = 0; i < measureValues.length; i++){
                 var obj = {};
                 
                 //col
                 obj['col'] =  validateStringValue(measureValues[i].getId());
                 
                 //rows
                 var rows = [];
                 var values =  measureValues[i].getValues(); //values is an aa2 * aa1 array;
                 //aa2
                 var aa2Limit = values.length;
                 if(this._limit[1] !== Number.POSITIVE_INFINITY){
                    aa2Limit = this._limit[1];
                 }
                 
                 for(var j = 0; j < aa2Limit; j++){
                   var value = values[j];
                   var row = [];
                   //aa1
                   var aa1Limit = value.length;
                   if(this._limit[0] !== Number.POSITIVE_INFINITY){
                      aa1Limit = this._limit[0];
                   }
                   
                   for(var k = 0; k < aa1Limit; k++){
                    
                     row.push({'val': validateNumberValue(value[k]), 'ctx': {
                                                    'type' : 'Measure',
                                                    'path': {
                                                      'mg'     :  mgIndex,
                                                      'mi'     :  i,
                                                      'dii_a1' :  k, 
                                                      'dii_a2' :  j
                                                    }
                                                       }
                               });
                   }
                   
                   rows.push(row);
                 }
                 
                 obj['rows'] = rows;
                 
                 feedValues.push(obj);
         }
         
          return feedValues.length > 0 ? feedValues : null;
   };
   
   
     BaseDataHandler.prototype.getMeasureNamesValues = function(){
       var values = [];
     var mgFeeds = this._feeder.getMeasureValuesGroupFeeds();
     for(var i = 0; i < mgFeeds.length; i++){
       if(mgFeeds[i].hasFeeded()){   
           var mvs = mgFeeds[i].getMeasureValues();
           for(var j = 0; j < mvs.length; j++){
             values.push({'val':validateStringValue(mvs[j].getId()),'ctx': { 'path' : {'mg': i, 'mi': j}}});
           }   
         }    
       }  
     
     return values;
   };
   
   return BaseDataHandler;
 });