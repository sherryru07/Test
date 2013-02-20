sap.riv.module(
{
  qname : 'sap.viz.modules.pie.sector',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.Constants',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.NumberUtils',
  version : '4.0.0'
}
],
function Setup(Constants, NumberUtils) {
  var CSSCLASS_SECTOR = 'viz-pie-sector';
  var pieLayout = d3.layout.pie().sort(null).value(function(d) {
    return d.v;
  });

  function SectorData(mvObject, dimValueObjects, color, r, value, startAngle,
      endAngle, p) {
    this.dimValueObjects = dimValueObjects;
    this.color = color;
    this.r = r;
    this._value = value;
    this.startAngle = startAngle;
    this.endAngle = endAngle;
    this.p = p;
    this.decoras = [];

    for ( var i in mvObject) {
      if (mvObject.hasOwnProperty(i)) {
        this[i] = mvObject[i];
      }
    }
  }

  SectorData.prototype = {
    midAngle : function() {
      return (this.endAngle + this.startAngle) / 2;
    },

    dimValues : function() {
      return this.dimValueObjects.map(function(o) {
        var ret;
        if(o.info){
          var clobj = o.info.customlabel;
          if(clobj){
            if(clobj.type === 'url'){
              ret = o.val;
            }else if(clobj.type === 'string'){
              ret = clobj.val;
            }
          }else{
            ret = o.val;
          }
        }else{
          ret = o.val;
        }
        return ret;
      });
    },

    value : function(format) {
      var v = this._value;
      if (format) {
        return d3.format(format)(v);
      }
      return v;
    },

    proportion : function(format) {
      var v = (this.endAngle - this.startAngle) / (2 * Math.PI);
      if (format) {
        return d3.format(format)(v);
      }
      return v;
    }
  };

  function sectorDatas(d, effectManager) {
    var mvs = d.measure.rows[0];
    var dimensions = d.dimensions;

    var domain = [];
    var datas = mvs.map(function(mv, i) {
      domain.push(i);
      return {
        v : mv.val,
        i : i
      };
    }).filter(function(o) {
      var v = o.v;
      return (!NumberUtils.isNoValue(v)) && v > 0;
    });

    var color = d.color.domain(domain);
    var r = d.or;
    var result = pieLayout(datas).map(function(data) {
      var index = data.data.i;
      var fillID = effectManager.register({
        drawingEffect : d.drawingEffect,
        graphType : 'sector',
        fillColor : color(index),
        direction : 'vertical',
        radius : r
      });
      return new SectorData(mvs[index], dimensions.map(function(dimVs) {
        return dimVs.rows[index];
      }), fillID, r, data.value, data.startAngle, data.endAngle, d.p);
    });
    return result;
  }

  var module = function() {
    function sector(sectorGroup, effectManager) {
      var sectors = module.all(sectorGroup).data(function(d) {
        return sectorDatas(d, effectManager);
      });
      sectors.exit().remove();
      sectors.enter().append('svg:g').attr('class', 'datashape').append(
          'svg:path').attr("class",
          Constants.CSS.CLASS.DATAPOINT + ' ' + CSSCLASS_SECTOR);
      sectors.select('g.datashape path').attr("fill", function(d) {
        return d.color;
      }).attr("d", d3.svg.arc().outerRadius(function(d) {
        return d.r;
      }));
    }

    return sector;
  };

  module.all = function(sectorGroup) {
    return sectorGroup.selectAll("g.datashape");
  };

  module.cssText = function(styleManager) {
    return '.' + CSSCLASS_SECTOR + '{' + styleManager.cssText(CSSCLASS_SECTOR) +
        '}';
  };

  return module;
});