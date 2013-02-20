sap.riv.module(
{
  qname : 'sap.viz.data.feed.feed',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
}
],
 function Setup(FunctionUtils){
   
   return function(feedId, feedName, type, min, max, aaIndex, acceptMND, mgIndex, maxStackedDims){
     
         var _feedId = feedId;
         var _feedName = feedName;
         var _type = type;
         var _min = min;
         var _max = max;
         var _aaIndex = aaIndex;
         var _acceptMND = acceptMND;
         var _mgIndex = mgIndex;
         var _maxStackedDims = maxStackedDims;
         
         var _data = [];
     
       function feed() {
         return feed;
       }
       
       feed.feedId = function(_){  
         if (!arguments.length){
             return _feedId;
         }
        
         _feedId = _;
         
         return feed;
       };
       
       feed.feedName = function(_){
         if (!arguments.length){
             return _feedName;
         }
         
         _feedName = _; 
         
         return feed;
       };
       
       feed.type = function(_){
         if (!arguments.length){
             return _type;
         }
         
        _type = _;
        
        return feed;
       };
       
       feed.min = function(_){    
         if (!arguments.length){
            return _min;     
         }
     
         _min =  _;
         return feed;
       };
       
       feed.max = function(_){
         if (!arguments.length){
             return _max;
         }
         
         
         _max = _;
         
         return feed; 
       };
       
       feed.analysisAxisIndex = function(_){
         if (!arguments.length){
             return _aaIndex;  
         }
         
         
         _aaIndex = _;
         
         return feed;
       };
      
       feed.measureGroupIndex = function(_){
         if (!arguments.length){
             return _mgIndex;
         }
         
         _mgIndex = _;
         
         return feed;
       };
       
       feed.acceptMND = function(_){
         if (!arguments.length){
             return _acceptMND;  
         }
         
         
         _acceptMND = _;
         
         return feed;
       };
       
       feed.maxStackedDims = function(_){
         if (!arguments.length){
             return _maxStackedDims;
         }
         
         _maxStackedDims = _;
         
         return feed;
       };
       
       feed.data = function(_){
         if (!arguments.length){
             return _data;
         }
         
         _data = _;
         
         return feed;
       };
       
       
       feed.addData = function(_){
         _data.push(_);
         return feed;
       };
       
       feed.getMeasureNames = function(){
         
         var mgIndex  =  _mgIndex - 1;
         var measureNames = [];
         for(var i = 0; i < _data.length; i++){
             measureNames.push({'val':_data[i]['name'],'ctx': {'mg': mgIndex, 'mi': i}});
         }
         
         return measureNames;
       };
       
         feed.getMeasureValues = function(){
         var values = [];
         if(_data.length > 0){
            return _data[0].getMeasureValues();
         }
         
         return values;
           
       };
       
         feed.getMeasureCount = function(){
            return _data.length;
       };
     
       /**
        * @returns check if the feed has been feeded MND
        */
       feed.hasMNDFeeded = function(){
          
          var data = feed.data();
          for(var i = 0; i < data.length; i++){
            if(data[i].getType() === "measureNamesDimension"){
               return true;
            }
          }
          
          return false;
       };
       
       feed.hasFeeded = function(){
          return feed.data().length > 0 ?  true : false;
       };
       
       feed.getIndex = function(){
          return feed.analysisAxisIndex() ? feed.analysisAxisIndex() : feed.measureGroupIndex();
       };
       
       feed.getDataCount = function(){
         if(feed.type() === "Dimension"){
            return feed.data().length;
         }
         else{
            return feed.data().length > 0 ? feed.data()[0].getMeasureValues().length : 0; 
         }
          
       };
       
     return feed;
   };
  
 });