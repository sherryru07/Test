sap.riv.module(
{
  qname : 'sap.viz.data.info.Handler',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
}
],
function Setup(ObjectUtils, TypeUtils) {
  var ANALYSISAXIS = "analysisAxis";
  var MEASUREVALUESGROUP = "measureValuesGroup";
  var handler = {};
  var _handlers = {};
  /*
   {
   'analysisAxis': [{
   'index': 1,
   'data': [{
   'name': 'Product',
   'values': ['Car', 'Truck', 'Motorcycle', 'Bicycle']
   }]
   }, {
   'index' : 2,
   'data': [{
   'name': 'Country',
   'values': ['China', 'USA']
   }, {
   'name': 'Year',
   'values': ['2001', '2001']
   }]
   }],
   'measureValuesGroup': [{
   'index': 1,
   'data': [{
   'name': 'Profit',
   'values': [[25, 136, 23, 116], [58, 128, 43, 73]]
   }, {
   'name': 'Revenue',
   'values': [[50, 236, 43, 126], [158, 228, 143, 183]]
   }]
   }]};
   * */
  
  function findInJson(jsondata, targetname){
    var anax = jsondata[ANALYSISAXIS].concat(jsondata[MEASUREVALUESGROUP]);
    var ret = [];
    anax.forEach(function(ana, idx){
      var anad = ana.data;
      anad.forEach(function(d, didx){
        if(d.name === targetname){
          ret.push(d);
        }
      }, this);
    }, this);
    return ret;
  }
  
  var customlabel = {
    'type' : 'customlabel',
    /*'value': [{
     'name': 'Country', //dimension name
     'mapping': {'CHN', {'type': 'url', 'val': 'http://xxxx/xxxx.png'},
     'GER', {'type': 'string', 'val': 'Germany'},
     'FRA', {'type': 'string', 'val': 'France'}} //support both string and url
     }] //you can have several mappings, it will be merged inside crosstable dataset. no info will be created (existed will be deleted) if the mapping value is same as the original value.*/
    'process' : function(value, jsondata) {
      var iterate, dname, finds, mapping, m, dvalues, mappingfound, removeinfo;
      for(var i = 0, len = value.length; i < len; i++) {
        iterate = value[i];
        dname = iterate.name;
        finds = findInJson(jsondata, dname);
        finds.forEach(function(d, tdidx) {
          //if no infos exist, create one, delete it if no info found
          mappingfound = false;
          if(!d.infos){
            removeinfo = true;
            d.infos = [];
          }
          
          dvalues = d.values;          
          mapping = iterate.mapping;
          dvalues.forEach(function(v, idx) {
            if(mapping[v]){
              if(mapping[v].type === 'string' && mapping[v].val === v){
                //we won't create mapping for it. existing mapping should be deleted
                if(d.infos[idx]){
                  delete d.infos[idx][customlabel.type];
                  //if it becomes empty, set it to undefined
                  if(TypeUtils.isEmptyObject(d.infos[idx])){
                    d.infos[idx] = undefined;
                  }
                } 
              }else{
                mappingfound = true;
                d.infos[idx] = d.infos[idx] ? d.infos[idx] : {};
                d.infos[idx][customlabel.type] = mapping[v];  
              }
            }else{
              if(!d.infos[idx]){
                d.infos[idx] = undefined;
              }
            }  
          }, this);

          if(removeinfo && !mappingfound){
            delete d.infos;
          }
        }, this);
      }
    },
    
    'merge' : function(jsondata){
      var ret = {};
      ret.type = customlabel.type;
      ret.value = [];
      var anax = jsondata[ANALYSISAXIS];
      var found;
      anax.forEach(function(ana, idx){
        var anad = ana.data;
        anad.forEach(function(d, didx){
          if(d.infos){
            var dmapping = {};
            dmapping.name = d.name;
            dmapping.mapping = {};
            found = false;
            d.infos.forEach(function(dinfo, dinfoidx){
              if(dinfo && dinfo[customlabel.type]){
                found = true;
                dmapping.mapping[d.values[dinfoidx]] = dinfo[customlabel.type];
              }
            }, this);
            if(found){
              ret.value.push(dmapping);
            }
          }
        }, this);
      }, this);
      if(ret.value.length > 0){
        return ret;
      }  
    },
    
    'remove' : function(jsondata){
      var anax = jsondata[ANALYSISAXIS];
      var stillHasInfo = false;
      anax.forEach(function(ana, idx){
        var anad = ana.data;
        anad.forEach(function(d, didx){
          if(d.infos){
            stillHasInfo = false;
            d.infos.forEach(function(dinfo, dinfoidx){
              if(dinfo){
                delete dinfo[customlabel.type];
                if(TypeUtils.isEmptyObject(dinfo)){
                  d.infos[dinfoidx] = undefined;
                }else{
                  stillHasInfo = true;
                }
              }
            }, this);
            if(!stillHasInfo){
              delete d.infos;
            }
          }
        }, this);
      }, this);
    }
  };

  handler.register = function(hndl) {
    _handlers[hndl.type] = hndl;
  };

  handler.get = function(type) {
    return _handlers[type];
  };
  
  /*
   * call each handler to extract corresponding info to an object and return
   */
  handler.mergeInfo = function(jsondata){
    var iter, ret = [], mr;
    for(var type in _handlers){
      if(_handlers.hasOwnProperty(type)){
        iter = _handlers[type];
        mr = iter.merge(jsondata);
        if(mr){
          //return a copy, intend to use ObjectUtils as we want to deep copy the array
          ret.push(ObjectUtils.extend(true, {}, mr));
        }
      }
    }
    return ret;
  };
  
  handler.register(customlabel);
  
  return handler;

});