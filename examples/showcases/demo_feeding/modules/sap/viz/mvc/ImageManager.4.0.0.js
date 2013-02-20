sap.riv.module(
{
  qname : 'sap.viz.mvc.ImageManager',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.LinkedHashMap',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
}
],
function Setup(ObjUtils, LinkedHashMap, FuncUtils) {
	/**
	 * The image object
	 * 
	 * @name sap.viz.mvc.Image
	 * @constructor
	 */
	var img = function(htmlImageElement) {
		this._imgEl = htmlImageElement;
	};

	/**
	 * Return the underlying htmlImageElement
	 * 
	 * @name sap.viz.mvc.Image#getBitmap
	 * @function
	 * @returns {HtmlImageElement}
	 */
	img.prototype.getBitmap = function() {
		return this._imgEl;
	};

	/**
	 * Get or set the visual width of the image
	 * 
	 * @name sap.viz.mvc.Image#width
	 * @param {undefined|Number}
	 *            width the new width of the image
	 * @returns {this|Number} when in set mode the return will be the image
	 *          object itself; in get mode the return will be the width
	 */
	img.prototype.width = function(width) {
		if (width !== undefined) {
			this._imgEl.width = width;
			return this;
		}
		return this._imgEl.width;
	};

	/**
	 * Get or set the visual height of the image
	 * 
	 * @name sap.viz.mvc.Image#height
	 * @param {undefined|Number}
	 *            height the new height of the image
	 * @returns {this|Number} when in set mode the return will be the image
	 *          object itself; in get mode the return will be the height
	 */
	img.prototype.height = function(height) {
		if (height !== undefined) {
			this._imgEl.height = height;
			return this;
		}
		return this._imgEl.height;
	};

	/**
	 * Get the intrinsic height of the image
	 * 
	 * @name sap.viz.mvc.Image#intrinsicHeight
	 * @returns {Number}
	 */
	img.prototype.intrinsicHeight = function() {
		return this._imgEl.naturalHeight;
	};

	/**
	 * Get the intrinsic width of the image
	 * 
	 * @name sap.viz.mvc.Image#intrinsicWidth
	 * @returns {Number}
	 */
	img.prototype.intrinsicWidth = function() {
		return this._imgEl.naturalWidth;
	};

	/**
	 * Get the url of the image
	 * 
	 * @name sap.viz.mvc.Image#url
	 * @returns {String} the url of the image
	 */
	img.prototype.url = function() {
		return this._imgEl.src;
	};

	var _imageCache = new LinkedHashMap();
	var _id2src = new LinkedHashMap();
	var _src2ids = {};

	/**
	 * This class defines global shared image manager used for loading external
	 * image. The loading process is asynchronously. The loaded images are
	 * indentified by src urls internally, and can shared within the all viz
	 * application. You must assign an id when loading an image. You can
	 * retrieve the loaded image by id only. the same image can be assigned
	 * multiple ids.
	 * 
	 * @name sap.viz.mvc.ImageManager
	 * @class
	 */
	var ImageManager = {
		/**
		 * Load an image designated by URL. The loading is asynchronized, the
		 * image will be available when the onComplete is called
		 * 
		 * @param {String}
		 *            id the caller-provided Id of the image to be loaded and
		 *            retrieved later.
		 * @param {String}
		 *            url the url of the image to be loaded
		 * @param {Function}
		 *            [onComplete], the on complete callback. the single
		 *            argument is of type boolean indicating the if loaded
		 *            successful
		 */
		loadImage : function(id, url, onComplete) {
			if (id && url) {
				onComplete = onComplete || FuncUtils.noop;
				if (_id2src.has(id)) {
					if (_imageCache.get(_id2src.get(url))) {
						onComplete(true);
					}
				}
				var imgEl = new Image();
				imgEl.onabort = imgEl.onerror = function() {
					onComplete(false, {
						id : id,
						url : url
					});
				};
				imgEl.onload = ObjUtils.proxy(function() {
					var src = imgEl.src;
					if (!_imageCache.has(src)) {
						var imgObj = new img(imgEl);
						_id2src.add(id, src);
						_src2ids[src] = {
							ids : {
								id : id
							},
							length : 1
						};
						_imageCache.add(src, imgObj);
					} else {
						_id2src.add(id, imgEl.src);
						_src2ids[src].ids[id] = id;
						_src2ids[src].length++;
					}
					onComplete(true, {
						id : id,
						url : url
					});
				}, this);
				imgEl.src = url;
			}
		},
		/**
		 * Load an array of images concurrently. The loading is asynchronized,
		 * the images will be available when the onComplete is called
		 * 
		 * @param {Object[]}
		 *            urls the array of the image url to be loaded. The urls
		 *            should follow the format:
		 * 
		 * <pre>
		 * [ {
		 * 	id : 'IMAGE_ID',
		 * 	url : 'IMAGE_URL'
		 * } ]
		 * </pre>
		 * 
		 * @param {Function}
		 *            [onComplete] the on-complete function callback. the single
		 *            argument is of type boolean indicating the if loaded
		 *            successful
		 */
		loadImages : function(urls, onProgress, onComplete) {
			onProgress = onProgress || FuncUtils.noop;
			onComplete = onComplete || FuncUtils.noop;
			var total = urls.length;
			if (total == 0) {
				onComplete(true);
			} else {
				var count = 0;
				var _stepFunction = function(isSuccessful, imgInfo) {
					count++;
					if (count < total) {
						onProgress(count / total, isSuccessful, imgInfo);
					} else {
						onComplete(true, imgInfo);
					}
				};
				for ( var i = 0, len = urls.length; i < len; i++) {
					ImageManager.loadImage(urls[i].id, urls[i].url, _stepFunction);
				}
			}
		},

		/**
		 * Check if the image has been loaded
		 * 
		 * @param {String}
		 *            id the id of the image to be checked
		 * @returns {Boolean}
		 */
		hasImage : function(id) {
			return _id2src.has(id);
		},

		/**
		 * Get the loaded image by its id, the caller has to ensure the image is
		 * loaded
		 * 
		 * @param {String}
		 *            id the id of the image to get
		 * @returns {sap.viz.mvc.Image}
		 */
		getImage : function(id) {
			if (_id2src.has(id)) {
				return _imageCache.get(_id2src.get(id));
			}
		},

		/**
		 * Remove the loaded image from internal cache
		 * 
		 * @param {String}
		 *            id the id of the image
		 */
		disposeImage : function(id) {
			if (_id2src.has(id)) {
				var src = _id2src.remove(id);
				delete _src2ids[src].ids[id];
				_src2ids[src].length--;
				if (_src2ids[src].length === 0) {
					delete _src2ids[src];
					_imageCache.remove(src);
				}
			}
		}
	};
	return ImageManager;
});