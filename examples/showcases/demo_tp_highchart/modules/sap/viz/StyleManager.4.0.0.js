sap.riv.module(
{
  qname : 'sap.viz.StyleManager',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.ObjectUtils',
  version : '4.0.0'
}
],
function Setup(ObjectUtils) {
  function StyleDef(rule) {
    ObjectUtils.extend(this, rule);
  }

  StyleDef.prototype.toString = function() {
    var str = "", i;

    for (i in this) {
      if (this.hasOwnProperty(i)) {
        str += i + ":" + this[i] + ";";
      }
    }

    return str;
  };

  function StyleManager() {
    this.style = {};
    this.defaultStyle = {};
  }

  StyleManager.prototype.update = function(cssObj) {
    ObjectUtils.extend(true, this.style, cssObj);
  };

  StyleManager.prototype.setDefault = function(cssObj) {
    this.defaultStyle = ObjectUtils.extend(true, null, cssObj, this.defaultStyle);
  };

  StyleManager.prototype.query = function(classNames,  backupStyle) {
    
    if (/\./.test(classNames)) {
      throw '. is not allowed';
    }
    var cls = classNames.split(' ');

    var cssValueObj = {};
    for ( var i = 0, l = cls.length; i < l; i++) {
      if (cls[i] === '') {
        continue;
      }

      ObjectUtils.extend(cssValueObj, this.defaultStyle['.' + cls[i]], backupStyle, this.style['.' + cls[i]]);
    }

    return new StyleDef(cssValueObj);
  };

  StyleManager.prototype.cssText = function(classNames) {
    return this.query(classNames).toString();
  };

  return StyleManager;
});