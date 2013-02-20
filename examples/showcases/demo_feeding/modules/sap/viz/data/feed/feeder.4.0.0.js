sap.riv.module(
{
  qname : 'sap.viz.data.feed.feeder',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.data.feed.feed',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.description.DimensionLabels',
  version : '4.0.0'
}
],
 function Setup(Feed, FunctionUtils, TypeUtils, DimensionLabels){
   
   return function(feedDefs, crossTableDS, feedingInfo){
    
     var FEED_D = 'Dimension';
     var FEED_M = 'Measure';
     
     var FEEDID = "feedId";
     
     var BINDTO = "binding";
     var TYPE = "type";
     var INDEX = "index";
     
     var _aaMap = []; // analysis axis index to feed map, _aamap[0] point to feed of axis 1 
     var _mgMap = []; // measure group index to feed map, _mgMap[0] point to feed of measure value group 1
     var _feeds = [];
     var _feedsMap = {};
     
     var _aaBindingInfo = [];
     
       function feeder() {
     
           return feeder;
       }
       
       feeder.init = function(){
         initFeeds(feedDefs);
         
         //TODO separate validation and init
         if(crossTableDS){
           if(feedingInfo){
             manualFeed(crossTableDS, feedingInfo);
           }else{
             autoFeed(crossTableDS);
           }
           
           feeder.checkValid();
         }
       };
       
       /**
        * @returns {feed}
        */
       feeder.getFeeds = function(){
         return _feeds;
       };
       
       /**
        * @param feedId
        *        feed id
        *        
        * @returns {feed}
        *           undefined if no feed matched
        * 
        */
       feeder.findFeed = function(feedId){
           return _feedsMap[feedId];
       };
       
      
       feeder.getAnalysisAxisIndex = function(feed){
        
         for(var i = 0; i < _aaMap.length; i++){
           if(_aaMap[i] === feed){
              return i;
           }
         }
         
       };
       
       feeder.getMeasureValuesGroupIndex = function(feed){
          
         for(var i = 0; i < _mgMap.length; i++){
           if(_mgMap[i] === feed){
              return i;
           }
         }
         
       };
       
       /**
        * TODO: add description
        */
       feeder.getMeasureValuesGroupFeeds = function(){
        
         return _mgMap;
       };
       
       /**
        * Check if meta data and raw data are matched. If not match, throw exception 
        */
       feeder.checkValid = function(){
         for(var i = 0; i < _feeds.length; i++){
           var feed = _feeds[i];
           var dataLength;
           if(feed.type() === "Dimension"){
            dataLength = feed.getDataCount();
            if(dataLength < feed.min() || (feed.max() !== Number.POSITIVE_INFINITY && dataLength > feed.max())){ 
               FunctionUtils.error(feed.feedId() + ": does not meet min or max number of feed definition");
            }
                
           }else if(feed.type() === "Measure"){
             dataLength = feed.getDataCount();
             if(dataLength < feed.min() || (feed.max() !== Number.POSITIVE_INFINITY && dataLength > feed.max())){ 
                FunctionUtils.error(feed.feedId() + ": does not meet min or max number of feed definition");
             }
             
           }else{
             FunctionUtils.error(feed.feedId() + ": wrong feed type");
           }
             
           
         }
         
        
       };
       
       feeder.getBindingInfo = function(){
        
         return _aaBindingInfo;
       };
       
       /**
        * TODO: add desc
        */
       function initFeeds(feedDefinitions){
           if( TypeUtils.isArray(feedDefinitions) ){
             
             var dimensonNumber  = 0;
             
             for(var i = 0; i < feedDefinitions.length; i++){
               
               var feedType = feedDefinitions[i]['type'];
               var aaIndex = feedDefinitions[i]['aaIndex'];
               var feedId = feedDefinitions[i]['id'];
                 
               if(feedType !== FEED_D && feedType !== FEED_M ){
                 FunctionUtils.error('wrong feed type in feed definition: ' + feedDefinitions[i]['id']); 
               }
               
                if(feedDefinitions[i]['type'] === FEED_D){
                 if(feedDefinitions[i]['aaIndex'] <= 0){
                    FunctionUtils.error('wrong analysis axis index in feed definition: ' + feedDefinitions[i]['id']);
                 }
                 
                 dimensonNumber++;
               }
                
                if(feedDefinitions[i]['type'] === FEED_M){
                 if(feedDefinitions[i]['mgIndex'] <= 0){
                    FunctionUtils.error('wrong  measure axis index in feed definition: ' + feedDefinitions[i]['id']);
                 }
                 
               }
              
               
               var arrayLength = _feeds.push(Feed(feedId, feedDefinitions[i]['name'],
                                         feedType, feedDefinitions[i]['min'],
                                         feedDefinitions[i]['max'], aaIndex,
                                         feedDefinitions[i]['acceptMND'], feedDefinitions[i]['mgIndex'],
                                         feedDefinitions[i]['maxStackedDims']));
               
               _feedsMap[feedId] = _feeds[arrayLength - 1];
               
               }
             
             for(i = 0; i < dimensonNumber; i++){
               _aaBindingInfo[i] = false; 
             }
           }
           
       }
       
             
       function autoFeed(crosstableDS){
         var axes = crosstableDS.getAnalysisAxisCount();
         var feed;
         for(var i = 0; i < axes; i++){
           feed = searchFeed(_feeds, FEED_D, i + 1);
           if(feed){
              var axis = crosstableDS.getAnalysisAxisByIdx(i);
              if(TypeUtils.isExist(feed.maxStackedDims()) && axis.getDimensionLabels().length > feed.maxStackedDims()){
                 FunctionUtils.error("Invalid Feeding: exceed max stacked dimension number " + feed.feedId() + " feed");
              }
             
              _aaMap[i] = feed;
              _aaBindingInfo[i] = true;
              feed.addData(axis);
           }
         }
         
         var mvgs = crosstableDS.getMeasureValuesGroupCount();
         for(i = 0; i < mvgs; i++){
           feed = searchFeed(_feeds, FEED_M, i + 1);
           if(feed){
              _mgMap[i] = feed;
              feed.addData(crosstableDS.getMeasureValuesGroupByIdx(i));
           }
           
         }
       }
       
       function searchFeed(feeds, type, index){
          for(var i = 0; i < feeds.length; i++){
            if(feeds[i].type() === type && feeds[i].getIndex() === index){
               return feeds[i];
            }
          }
      
          return null;
       }
       
       function manualFeed(crosstableDS, feedList){
         var dataLength;
         for(var i = 0; i < feedList.length; i++){
           var feeding = feedList[i];
           var feedId = feeding[FEEDID];
           if(!feedId){
              FunctionUtils.error("Invalid Feeding: no feed id");
           }
              
           var feed = _feedsMap[feedId];
           if(!feed){
              FunctionUtils.error("Invalid Feeding: no " + feedId + " feed");
           }
           
           var bindings = feeding[BINDTO];
           for(var j = 0; j < bindings.length; j++){
             var type = bindings[j][TYPE];
             var index = bindings[j][INDEX];
             
             if( type === "analysisAxis"){
               var aa =  crosstableDS.getAnalysisAxisByIdx(index - 1);
               if(!aa){
                  FunctionUtils.error("could not find axis " + index +  " in data set" + feedId + " feed");
               }
               
               if(TypeUtils.isExist(feed.maxStackedDims()) && aa.getDimensionLabels().length > feed.maxStackedDims()){
                  FunctionUtils.error("Invalid Feeding: exceed max stacked dimension number " + feedId + " feed");
               }
               
               dataLength = feed.getDataCount();
               if(feed.max() !== Number.POSITIVE_INFINITY && dataLength >= feed.max()){
                  FunctionUtils.error(feedId + " feed could not accept more data containers");
               }
               
               feed.addData(aa);  
               _aaMap[index - 1] = feed;
               _aaBindingInfo[feed.getIndex() - 1] = true;
               
             }else if(type === "measureValuesGroup"){
               
               var mvg = crosstableDS.getMeasureValuesGroupByIdx(index - 1);
               if(!mvg){
                  FunctionUtils.error("could not find measure values group " + index +  " in data set" + feedId + " feed");
               }
               
               dataLength = feed.getDataCount();
               if(feed.max() !== Number.POSITIVE_INFINITY && dataLength >= feed.max()){
                  FunctionUtils.error(feedId + " feed could not accept more data containers");
               }
               
               feed.addData(mvg);
               _mgMap[index-1] = feed;
               
             }else if(type === "measureNamesDimension"){
               if(feed.acceptMND() < 0){
                  FunctionUtils.error("could not accpet MeasureNamesDimension " + feedId + " feed");
               }
               
               dataLength = feed.getDataCount();
               if(feed.max() !== Number.POSITIVE_INFINITY && dataLength >= feed.max()){
                  FunctionUtils.error(feedId + " feed could not accept more data containers");
               }
               
               feed.addData(new DimensionLabels("", "measureNamesDimension", ""));
               
             }else{
               FunctionUtils.error("Invalid Binding");
             }
           }
           
         }
         
       }
       
       feeder.init();
       
       return feeder;
   };
   
});