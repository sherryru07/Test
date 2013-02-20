sap.riv.module(
{
  qname : 'sap.viz.config',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
}
],
function Setup(FunctionUtils) {
  
  var configs = {};
  
  var enableCanvg = false; 
  
  var manager = {
      
      constructor : function(){
        return;
      },
      
      enableCanvg : function(_) {
          if(!arguments.length){
            return enableCanvg;
          }
          enableCanvg = _;
          return manager;
      },
      
      register : function(obj) {
          if(configs[obj.id]){
            return;
          }
          configs[obj.id] = obj.value;
          return manager;
      },
        
      get: function(ids){
        if(configs[ids]){
          return configs[ids];
        }
      }
  };
  
  return manager;
});