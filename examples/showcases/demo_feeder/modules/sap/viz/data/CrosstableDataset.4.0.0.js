sap.riv.module(
{
  qname : 'sap.viz.data.CrosstableDataset',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.data.feed.feeder',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.description.AnalysisAxis',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.description.MeasureValuesGroup',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.info.Handler',
  version : '4.0.0'
}
],
 function Setup(Feeder, TypeUtils, FunctionUtils, AnalysisAxis, MeasureValuesGroup, Handler){
 
   var TYPE   =    'type';
   var NAME   =    'name';
   var VALUES =    'values';
   
   var FEEDID =  'feedId';
   var MND    =  'MeasureNamesDimension';
   
   var ANALYSISAXIS = "analysisAxis";
   var MEASUREVALUESGROUP = "measureValuesGroup";
      
   function getMeasureValueDataPointCount(measureValue){
         var values = measureValue.getValues();
     
         return values.length > 0 ? values.length * values[0].length : 0;
   }
   
   /**
    * @name sap.viz.data.CrosstableDataset
    * @constructor
     */
   function crossTableDataSet(){
        this._analysisAxis = [];
        this._measureValuesGroup = [];
        this._dataSet = {};
        this._emptyDataset = false;
   }
   
   /**
    * Get/Set data
    * @name sap.viz.data.CrosstableDataset#data
    * @param data
    *        data with metaData and rawData
    * @returns {Object} {@link sap.viz.data.CrosstableDataset}
    */
   crossTableDataSet.prototype.data = function(data){
     if(!arguments.length){
       return this._dataSet;
     }
     this._analysisAxis = [];
     this._measureValuesGroup = [];
     this._dataSet = data;
     this.init(this._dataSet);
     return this;
   };
   
   //@deprecated
   crossTableDataSet.prototype.setData = function(in_data){
     this.data(in_data);
   };
   
   /**
    get/set additional info for the crosstable dataset
    @param {Object}info {
       'type': 'customlabel'|'geo'
       'value': [{
          'name': 'Country', //dimension name
          'mapping': {'CHN', {'type': 'url', 'val': 'http://xxxx/xxxx.png'},
                      'GER', {'type': 'string', 'val': 'Germany'},
                      'FRA', {'type': 'string', 'val': 'France'}} //support both string and url
       }] //you can have several mappings, it will be merged inside crosstable dataset. no info will be created (existed will be deleted) if the mapping value is same as the original value.
    }
    @returns {Object} return a copy of current additional info if no param provided
   */
   crossTableDataSet.prototype.info = function(info){
     if(!arguments.length){
       return Handler.mergeInfo(this._dataSet);
     }
     
     if(info && info.type){
       var handler = Handler.get(info.type);
       if(handler){
         handler.process(info.value, this._dataSet);
       }
       //Jimmy, 12/28/2012, AnalysisAxis reads info reference from this._dataset.
       //here the reference may be deleted (in clearInfo) and recreated(here), to make sure AnalysisAxis
       //still can get the right infos, we recreate them.
       //or we can optimize it to save infos in analysisAxis and merge them when we get data and info?
      this._analysisAxis = [];
      this._measureValuesGroup = [];
      this.init(this._dataSet);
     }
     return this;
   };
   
    /**
      clear specific additional info for the crosstable dataset
      @param {String}type "customlabel"||"geo" 
    */
    crossTableDataSet.prototype.clearInfo = function(type){
      if(type){
       var handler = Handler.get(type);
       if(handler){
         handler.remove(this._dataSet);
       }
      }
      return this;  
    };
   
   crossTableDataSet.prototype.init = function(data){
      if(!data || !data[MEASUREVALUESGROUP] || (data[ANALYSISAXIS] && !data[MEASUREVALUESGROUP])){
       //FIX ME Remove when multihandler is available
       return;// FunctionUtils.error("dataset is empty or invalid");
      }
      var aaLabels = [1,1];

      
      var axes = data[ANALYSISAXIS];
      var i = 0;
      var mvgs, mvg, mv;
      if(axes){
        if(axes.length > 2){
         FunctionUtils.error("could not accept more than 2 axes");
        }
        
        for(;i < axes.length; i++){
          var axis = axes[i];
          var axisIndex = axis["index"];
          if(axisIndex !== 1 && axisIndex !== 2){
           FunctionUtils.error("Axis index should be 1 or 2");
          }
          
          if(this._analysisAxis[axisIndex - 1]){
           FunctionUtils.error("Axis " + axisIndex + " already exists");
          }
          
          var aa = new AnalysisAxis(axis["data"]);
          aaLabels[axisIndex - 1] = aa.validate();
          this._analysisAxis[axisIndex - 1] = aa;
          
        }
        
       //TODO handle if only meta data exist in data set when layout
       if(aaLabels[0] === 0){
          aaLabels[1] = 0;
          this._emptyDataset = true;
       }

        mvgs = data[MEASUREVALUESGROUP];
        for(i = 0;i < mvgs.length; i++){
          mvg = mvgs[i];
          var mvgIndex = mvg["index"];
          if(this._measureValuesGroup[mvgIndex - 1]){
            FunctionUtils.error("MeausreValuesGroup " + mvgIndex + " already exists");
          }
          
          mv =  new MeasureValuesGroup(mvg["data"]);
          mv.validate(aaLabels);
          this._measureValuesGroup[mvgIndex - 1] = mv;
        }
      }else{ // no axes case
        
        mvgs = data[MEASUREVALUESGROUP];
        for(i = 0;i < mvgs.length; i++){
          mvg = mvgs[i];
          mv =  new MeasureValuesGroup(mvg["data"]);
          if(i === 0){
            aaLabels = mv.validate();
          }  
          else{
            mv.validate(aaLabels);
          }
          
          this._measureValuesGroup[mvg["index"] - 1] = mv;
        }
      }
      
      
   };
   
   /**
    * @name sap.viz.data.CrosstableDataset#getAnalysisAxisCount
    * @ignore 
    */
   crossTableDataSet.prototype.getAnalysisAxisCount = function(){
      return this._analysisAxis.length;    
   };
   
   /**
    * @name sap.viz.data.CrosstableDataset#getAnalysisAxisByIdx
    * @ignore
    * @param index 
    */
   crossTableDataSet.prototype.getAnalysisAxisByIdx = function(index){
     return this._analysisAxis[index];
   };
   
   /**
    * @name sap.viz.data.CrosstableDataset#getMeasureValuesGroupCount
    * @ignore 
    */
   crossTableDataSet.prototype.getMeasureValuesGroupCount = function(){
      return this._measureValuesGroup.length;    
   };
   
   /**
    * @name sap.viz.data.CrosstableDataset#getMeasureValuesGroupByIdx
    * @ignore
    * @param index 
    */
   crossTableDataSet.prototype.getMeasureValuesGroupByIdx = function(index){
     return this._measureValuesGroup[index];
   };
   
   /**
      * @name sap.viz.data.CrosstableDataset#hasFakeData
      * @ignore
      */
   crossTableDataSet.prototype.hasFakeData = function(){
     for(var i = 0; i < this._measureValuesGroup.length; i++){
       if(this._measureValuesGroup[i].hasFakeData()){
        return true;
       }
     }
     
     for(i = 0; i < this._analysisAxis.length; i++){
       if(this._analysisAxis[i].hasFakeData()){
        return true;
       }
     }
     
     return false;
   };
   
   /**
      * @name sap.viz.data.CrosstableDataset#getDataPointCount
      * @ignore
      */
   crossTableDataSet.prototype.getDataPointCount = function(){
     
     var dpCount = 0;
     var mvDPCount = getMeasureValueDataPointCount(this._measureValuesGroup[0].getMeasureValues()[0]);
     for(var i = 0; i < this._measureValuesGroup.length; i++){
       dpCount +=  mvDPCount * this._measureValuesGroup[i].getMeasureValues().length;
     }
     
     return dpCount;
   };
   
    /**
      * @name sap.viz.data.CrosstableDataset#isEmptyDataSet
      * @ignore
    */
   crossTableDataSet.prototype.isEmptyDataset = function(){
      return this._emptyDataset;
   };
   
    return crossTableDataSet;
 });