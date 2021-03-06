sap.riv.module(
{
  qname : 'sap.viz.base.Repository',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
}
],
function Setup(){
	var generateId = function() {//guid generator
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {var r = Math.random()*16|0,v=c=='x'?r:r&0x3|0x8;return v.toString(16);});
	};
	var ExType = {
		ID_REGISTERED 		: 1,
		OBJ_REGISTERED 		: 2,
		ID_NEEDED			: 3,
		ID_NOT_REGISTERED 	: 4,
		OBJ_NULL			: 5
	}
	var createEx = function(type, param1) {
		var ex = {};
		ex.type = type;
		switch (type) {
			case ExType.ID_REGISTERED:
				ex.message = "ID '" + param1 + "' has been registered.";
				break;
			case ExType.OBJ_REGISTERED:
				ex.message = "The vizObj has been registered, its Id is '" + param1 + "'.";
				break;
			case ExType.ID_NEEDED:
				ex.message = "Please specify Id";
				break;
			case ExType.ID_NOT_REGISTERED:
				ex.message = "No vizObj was registered with Id '" + param1 + "'";
				break;
			case ExType.OBJ_NULL:
				ex.message = "Null object is not allowed";
				break;
		}
		return ex;
	}
	
	var registry = {};
	/*member functions of Repository*/
	/*
	 * register a viz object with its ID 
	 * @param id optional, id of vizObj, if null a new id will be generated
	 * @param vizObj
	 * @return id of vizObj
	 * @throws id is registered; vizObj is registered;
	 */
	var registerFunc = function(id, vizObj) {
		if (!vizObj) {
			throw createEx(ExType.OBJ_NULL);
		}
		id = id ? id : generateId();
		//check Id
		if (registry[id]) {
			throw createEx(ExType.ID_REGISTERED, id);
		}
		//check vizObj
		for (var x in registry) {
			if (vizObj == registry[x]) {
				throw createEx(ExType.OBJ_REGISTERED, x);
			}
		}
		registry[id] = vizObj;
		return id;
	};
	/*
	 * unregister a viz object with its ID
	 * @param id id of vizObj
	 * @return
	 * @throws id is null; No vizObj is registered with id;
	 */
	var unregisterFunc = function(id) {
		if (!id) {
			throw createEx(ExType.ID_NEEDED);
		}
		if (!registry[id]) {
			throw createEx(ExType.ID_NOT_REGISTERED, id);
		}
		delete registry[id];
	};
	/*
	 * get a viz object by its ID
	 * @param id id of vizObj
	 * @return vizObj
	 * @throws id is null;
	 */
	var getFunc = function(id) {
		if (!id) {
			throw createEx(ExType.ID_NEEDED, id);
		}
		return registry[id];
	};
	/*
	 * get Ids of all viz objects in repository
	 * @return Id array
	 */
	var getAllFunc = function() {
		var ids = [];
		for (var x in registry) {
			ids.push(x);
		}
		return ids;
	};
	/*
	 * generate a new unique ID beginning with prefix. 
	 * @param prefix
	 * @return id
	 */
	var newIdFunc = function(prefix) {
		var id = generateId();
		return prefix ? prefix + "_" + id : id;
	};
	var Repository = {
		register 	: registerFunc,
		unregister 	: unregisterFunc,
		get 		: getFunc,
		getAll 		: getAllFunc,
		newId 		: newIdFunc
	};
	return Repository;
});