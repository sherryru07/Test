sap.riv.module(
{
  qname : 'sap.viz.base.utils.LinkedHashMap',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
}
],
function Setup(FuncUtils) {
	/**
	 * Iterator for LinkedHashMap, to get an iterator for a linkedHashMap
	 * instance, use {@link sap.viz.base.utils.LinkedHashMap#getIterator}
	 * 
	 * @name sap.viz.base.utils.LinkedHashMap.Iterator
	 * @constructor
	 */
	var lhmItr = function(lhm, reverseOrder) {
		this._lhm = lhm;
		this._reverse = reverseOrder || false;
		this._count = lhm._length;
		this._cursor = this._reverse ? this._lhm._last : this._lhm._head;
		if (this._reverse) {
			this.hasMore = this._hasMoreInReverse;
		} else {
			this.hasMore = this._hasMoreInOrder;
		}
	};

	lhmItr.prototype._hasMoreInOrder = function() {
		if (this._count !== 0) {
			if (this._count === this._lhm._length) {
				this._cursor = this._lhm._head;
			} else {
				this._cursor = this._cursor.next;
			}
			this._count--;
			return true;
		} else {
			return false;
		}
	};

	lhmItr.prototype._hasMoreInReverse = function() {
		if (this._count !== 0) {
			if (this._count === this._lhm._length) {
				this._cursor = this._lhm._last;
			} else {
				this._cursor = this._cursor.prev;
			}
			this._count--;
			return true;
		} else {
			return false;
		}
	};
	/**
	 * Find if there is more item to iterate, calling this method will move the
	 * cursor forward to next item
	 * 
	 * @name sap.viz.base.utils.LinkedHashMap.Iterator#hasMore
	 * @function
	 * @returns {Boolean}
	 */
	lhmItr.prototype.hasMore = FuncUtils.noop;

	/**
	 * Get the entry at the current cursor, calling this method without calling
	 * hasMore method will return the same entry
	 * 
	 * @name sap.viz.base.utils.LinkedHashMap.Iterator#next
	 * @function
	 * @returns {Object} with key & value property indicating the entry's key
	 *          and value object
	 */
	lhmItr.prototype.next = function() {
		var ret = {
			key : this._cursor.key,
			value : this._cursor.value
		};
		return ret;
	};
	/**
	 * Get the value of entry at the current cursor, calling this method without
	 * calling hasMore method will return the same entry
	 * 
	 * @name sap.viz.base.utils.LinkedHashMap.Iterator#nextValue
	 * @function
	 * @returns {Object}
	 */
	lhmItr.prototype.nextValue = function() {
		return this._cursor.value;
	};
	/**
	 * Get the key of entry at the current cursor, calling this method without
	 * calling hasMore method will return the same entry
	 * 
	 * @name sap.viz.base.utils.LinkedHashMap.Iterator#nextKey
	 * @function
	 * @returns {String}
	 */
	lhmItr.prototype.nextKey = function() {
		return this._cursor.key;
	};
	/**
	 * Reset the iterator to initial state
	 * 
	 * @name sap.viz.base.utils.LinkedHashMap.Iterator#reset
	 * @function
	 */
	lhmItr.prototype.reset = function() {
		this._count = this._lhm._length;
	};
	/**
	 * Create an empty LinkedHashMap
	 * 
	 * @name sap.viz.base.utils.LinkedHashMap
	 * @constructor
	 */
	var LinkedHashMap = function() {
		this._map = {};
		this._head = undefined;
		this._last = undefined;
		this._length = 0;
	};
	var lhmp = LinkedHashMap.prototype;

	/**
	 * Add one entry, if the key for the entry is already existing, then the old
	 * value will be replaced.
	 * 
	 * @name sap.viz.base.utils.LinkedHashMap#add
	 * @function
	 * @param {String}
	 *            key the key for the entry
	 * @param {Object}
	 *            value the value for the entry
	 * @returns {undefined|Object} undefined if key is new, otherwise will be
	 *          the replaced value
	 */
	lhmp.add = function(key, value) {
		var m = this._map;
		var ret = null;
		var node = {
			prev : null,
			key : key,
			value : value,
			next : null
		};
		if (!this._length) {
			this._head = this._last = node;
		}
		if (!m.hasOwnProperty(key)) {
			m[key] = node;
			this._length++;
			node.prev = this._last;
			this._last.next = node;
			this._last = node;
			this._last.next = this._head;
			this._head.prev = this._last;
		} else {
			ret = m[key].value;
			m[key].value = value;
		}
		return ret;
	};
	/**
	 * Add entries from an existing linked hash map, the duplicated entry will
	 * be replaced silently
	 * 
	 * @name sap.viz.base.utils.LinkedHashMap#addAll
	 * @function
	 * @param {sap.viz.base.utils.LinkedHashMap}
	 *            linkedHashMap another linkedHashMap to added
	 */
	lhmp.addAll = function(linkedHashMap) {
		var itr = linkedHashMap.getIterator();
		var entry;
		while (itr.hasMore()) {
			entry = itr.next();
			this.add(entry.key, entry.value);
		}
	};
	/**
	 * Insert the entry before one entry, if the inserted entry exists or the
	 * entry to be inserted before doesn't exist, insertion will fail silently
	 * 
	 * @name sap.viz.base.utils.LinkedHashMap#insertBefore
	 * @function
	 * @param {String}
	 *            key the key for the entry
	 * @param {Object}
	 *            value the value for the entry
	 * @param {String}
	 *            beforeKey the key of the entry to be inserted before
	 * @returns {Object} the value inserted
	 */
	lhmp.insertBefore = function(key, value, beforeKey) {
		var m = this._map;
		if (!m.hasOwnProperty(key) && m.hasOwnProperty(beforeKey)) {
			var nnode = {
				prev : null,
				key : key,
				value : value,
				next : null
			};
			var anode = m[beforeKey];
			if (anode !== this._head) {
				nnode.prev = anode.prev;
				anode.prev.next = nnode;
			} else {
				this._head = nnode;
				nnode.prev = this._last;
			}
			nnode.next = anode;
			anode.prev = nnode;
			m[key] = nnode;
			this._length++;
			return value;
		}
	};
	/**
	 * Insert the entry after one entry, if the inserted entry exists or the
	 * entry to be inserted after doesn't exist, insertion will fail silently
	 * 
	 * @name sap.viz.base.utils.LinkedHashMap#insertAfter
	 * @function
	 * @param {String}
	 *            key the key for the entry
	 * @param {Object}
	 *            value the value for the entry
	 * @param {String}
	 *            afterKey the key of the entry to be inserted after
	 * @returns {Object} the value inserted
	 */
	lhmp.insertAfter = function(key, value, afterKey) {
		var m = this._map;
		if (!m.hasOwnProperty(key) && m.hasOwnProperty(afterKey)) {
			var nnode = {
				prev : null,
				key : key,
				value : value,
				next : null
			};
			var anode = m[afterKey];
			if (anode !== this._last) {
				nnode.next = anode.next;
				anode.next.prev = nnode;
			} else {
				this._last = nnode;
				this._last.next = this._head;
			}
			anode.next = nnode;
			nnode.prev = anode;
			m[key] = nnode;
			this._length++;
			return value;
		}
	};
	/**
	 * Replace the existing entry with new entry, including key in place
	 * 
	 * @name sap.viz.base.utils.LinkedHashMap#replace
	 * @function
	 * @param {String}
	 *            key the key for the entry to be replaced
	 * @param {withKey}
	 *            withKey the key for the entry to be added
	 * @param {Object}
	 *            andValue the value of the entry to be added
	 * @returns {Object} the value to be replaced
	 */
	lhmp.replace = function(key, withKey, andValue) {
		var m = this._map;
		if (!m.hasOwnProperty(withKey) && m.hasOwnProperty(key)) {
			var nnode = {
				prev : null,
				key : withKey,
				value : andValue,
				next : null
			};
			var rnode = m[key];
			nnode.prev = rnode.prev;
			nnode.next = rnode.next;
			rnode.prev.next = nnode;
			rnode.next.prev = nnode;
			if (this._head === rnode)
				this._head = nnode;
			if (this._last === rnode)
				this._last = nnode;
			m[withKey] = nnode;
			delete m[key];
			return rnode.value;
		}
	};
	/**
	 * Get the value for the key
	 * 
	 * @name sap.viz.base.utils.LinkedHashMap#get
	 * @function
	 * @param {String}
	 *            key the key for the entry to get
	 * 
	 * @returns {undefined|Object} the value for the key or undefined if key is
	 *          non-existing
	 */
	lhmp.get = function(key) {
		var m = this._map;
		if (m.hasOwnProperty(key)) {
			return m[key].value;
		}
		return null;
	};
	/**
	 * Get the first inserted entry
	 * 
	 * @name sap.viz.base.utils.LinkedHashMap#getFirstInsert
	 * @function
	 * 
	 * @returns {Object} the value first inserted
	 */
	lhmp.getFirstInsert = function() {
		return this._head ? this._head.value : null;
	};
	/**
	 * Get the last inserted entry
	 * 
	 * @name sap.viz.base.utils.LinkedHashMap#getLastInsert
	 * @function
	 * 
	 * @returns {Object} the value last inserted
	 */
	lhmp.getLastInsert = function() {
		return this._last ? this._last.value : null;
	};
	/**
	 * Move entry associated with key to the last of the link
	 * 
	 * @name sap.viz.base.utils.LinkedHashMap#moveToLast
	 * @function
	 * @param {String}
	 *            key the key of the entry to move
	 */
	lhmp.moveToLast = function(key) {
		var m = this._map;
		if (m.hasOwnProperty(key) && this._last.key !== key) {
			var node = m[key];
			node.prev.next = node.next;
			node.next.prev = node.prev;
			node.prev = this._last;
			node.next = this._last.next;
			this._last.next = node;
			this._last = node;
			this._head = node.next;
			this._head.prev = node;

		}
	};
	/**
	 * Move entry associated with key to the first of the link
	 * 
	 * @name sap.viz.base.utils.LinkedHashMap#moveToFirst
	 * @function
	 * @param {String}
	 *            key the key of the entry to move
	 */
	lhmp.moveToFirst = function(key) {
		var m = this._map;
		if (m.hasOwnProperty(key) && this._head.key !== key) {
			var node = m[key];
			node.prev.next = node.next;
			node.next.prev = node.prev;
			node.next = this._head;
			node.prev = this._head.prev;
			this._head.prev = node;
			this._head = node;
			this._last = node.prev;
			this._last.next = node;
		}
	};
	/**
	 * Check whether having the key
	 * 
	 * @name sap.viz.base.utils.LinkedHashMap#has
	 * @function
	 * @param {String}
	 *            key the key of the entry to check
	 * @returns {Boolean}
	 */
	lhmp.has = function(key) {
		var m = this._map;
		return m.hasOwnProperty(key);
	};
	/**
	 * Remove the entry associated with the key
	 * 
	 * @name sap.viz.base.utils.LinkedHashMap#remove
	 * @function
	 * @param {String}
	 *            key the key of the entry to remove
	 * @returns {undefined|Object} the removed item or undefined if key is
	 *          non-existing
	 */
	lhmp.remove = function(key) {
		var m = this._map;
		var ret;
		if (m.hasOwnProperty(key)) {
			var node = m[key];
			ret = node.value;
			if (node === this._head) {
				this._head = node.next;
			} else if (node === this._last) {
				this._last = node.prev;
			} else {
				node.prev.next = node.next;
				node.next.prev = node.prev;
			}
			delete m[key];
			this._length--;
			if (this._length === 0) {
				this._head = this._last = undefined;
			}
			return ret;
		}
	};
	/**
	 * Remove all entries added before
	 * 
	 * @name sap.viz.base.utils.LinkedHashMap#purgeAll
	 * @function
	 * 
	 */
	lhmp.purgeAll = function() {
		this._map = {};
		this._head = undefined;
		this._last = undefined;
		this._length = 0;
	};
	/**
	 * Whether the map is empty
	 * 
	 * @name sap.viz.base.utils.LinkedHashMap#isEmpty
	 * @function
	 * 
	 * @returns {Boolean}
	 */
	lhmp.isEmpty = function() {
		return this._length == 0;
	};
	/**
	 * Length of the map
	 * 
	 * @name sap.viz.base.utils.LinkedHashMap#length
	 * @function
	 * @returns {Integer}
	 */
	lhmp.length = function() {
		return this._length;
	};
	/**
	 * Get the iterator of the map
	 * 
	 * @name sap.viz.base.utils.LinkedHashMap#getIterator
	 * @function
	 * @param {Boolean}
	 *            reverseOrder whether iterate in reverse order
	 * @returns {sap.viz.base.utils.LinkedHashMap.Iterator}
	 */
	lhmp.getIterator = function(reverseOrder) {
		return new lhmItr(this, reverseOrder);
	};
	return LinkedHashMap;
});