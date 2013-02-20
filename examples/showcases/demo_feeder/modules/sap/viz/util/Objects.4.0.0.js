sap.riv.module(
{
  qname : 'sap.viz.util.Objects',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
}
],
function Setup(TypeUtils) {

  var objects = {
    // copy from sap.viz.base.utils.ObjectUtils.extend
    // in this version, when target is array, just use src replace target
    extend : function() {
      var options, name, src, copy, copyIsArray, clone, target = arguments[0] || {}, i = 1, length = arguments.length, deep = false;

      // Handle a deep copy situation
      if (typeof target === "boolean") {
        deep = target;
        target = arguments[1] || {};
        // skip the boolean and the target
        i = 2;
      }

      // Handle case when target is a string or something (possible in
      // deep
      // copy)
      if (typeof target !== "object" && !TypeUtils.isFunction(target)) {
        target = {};
      }

      // extend jQuery itself if only one argument is passed
      if (length === i) {
        target = this;
        --i;
      }

      for (; i < length; i++) {
        // Only deal with non-null/undefined values
        if ((options = arguments[i]) !== null) {
          // Extend the base object
          for (name in options) {
            if (options.hasOwnProperty(name)){
              src = target[name];
              copy = options[name];

              // Prevent never-ending loop
              if (target === copy) {
                continue;
              }

              // Recurse if we're merging plain objects or arrays
              // in this version, when target is array, just src replace target
              if (deep && copy && (TypeUtils.isPlainObject(copy))) {
                if (copyIsArray) {
                  copyIsArray = false;
                  clone = src && TypeUtils.isArray(src) ? src : [];

                } else {
                  clone = src && TypeUtils.isPlainObject(src) ? src : {};
                }
                // Never move original objects, clone them
                target[name] = objects.extend(deep, clone, copy);
                // Don't bring in undefined values
              } else if (copy !== undefined) {
                target[name] = copy;
              }              
            }
          }
        }
      }
      // Return the modified object
      return target;
    },    
    equal: function (objA, objB){
      if(typeof arguments[0] !== typeof arguments[1]){
        return false;
      }
      if (objA === undefined){
        if (objB !== undefined){
          return false;
        }
      }
      if (objA === null){
        if (objB !== null){
          return false;
        }
      }
      if(objA instanceof Array){
        if (!(objB instanceof Array)){
          return false;
        }
        if(objA.length !== objB.length){
          return false;
        }
        var arrayEqualResult = true;
        for(var i = 0; i < objA.length; i++){
          if(typeof objA[i] !== typeof objB[i]){
            return false;
          }
          if(typeof objA[i] === 'boolean' || typeof objA[i] === 'number' || typeof objA[i] === 'string' || typeof objA[i] === 'undefined' || objA[i] === null){
            arrayEqualResult = (objA[i] === objB[i]);
          }
          else if(objA[i] instanceof Object){
            arrayEqualResult = this.equal(objA[i] , objB[i]);
          }
          else{
            return false;
          }
          if(!arrayEqualResult){
            return false;
          }
        }
        return true;
      }
      if(objA instanceof Object && objB instanceof Object && typeof objA !== 'function' && typeof objB !== 'function'){
        if (objB === null || objB instanceof Array){
          return false;
        }
        var attrLenA = 0, attrLenB = 0;
        var attr;
        for(attr in objA){
          if (objA.hasOwnProperty(attr)){
            if(typeof objA[attr] === 'boolean' || typeof objA[attr] === 'number' || typeof objB[attr] === 'string' || typeof objA[attr] === 'undefined' || objA[attr] === null){
              if(objA[attr] !== objB[attr]){
                return false;
              }
            }
            else{
              if(!this.equal(objA[attr], objB[attr])){
                return false;
              }
            }
            attrLenA++;
          }
        }
        for(attr in objB){
         if(objB.hasOwnProperty(attr)){
           attrLenB++;
         }
        }
        if(attrLenA !== attrLenB){
          return false;
        }
        return true;
      }
      return objA === objB;
    }

  };
  return objects;
});