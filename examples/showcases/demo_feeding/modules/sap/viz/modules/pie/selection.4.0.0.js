sap.riv.module(
{
  qname : 'sap.viz.modules.pie.selection',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.modules.pie.sector',
  version : '4.0.0'
}
],
function Setup(sectorModule) {
  var selectedSectorClass = "selectedSector";
  var selectedClass = "selected";
  var selectedDataLabel;
  function select(sect, flag, noAnimation) {
    sect.classed(selectedSectorClass, flag);
    var dx = 0, dy = 0;
    if (!noAnimation) {
      sect = sect.transition().duration(200);
    }
    sect.each(function(d) {
      dx = 0, dy = 0;
      if (flag) {
        if (this.parentNode.parentNode.childNodes.length !== 1) {
          var a = d.midAngle();
          var r = d.r;
          var sectorMoveOffset;
          if (r >= 96) {
            sectorMoveOffset = 6;
          } else if (r >= 24) {
            sectorMoveOffset = 4;
          } else {
            sectorMoveOffset = 2;
          }
          dx = sectorMoveOffset * Math.sin(a);
          dy = -sectorMoveOffset * Math.cos(a);
        }
      }

      d3.select(this.parentNode).attr('transform', "translate(" + dx + "," + dy + ")");
    });
    sect.each('start', function(d){
      var transformStr = d3.select(this.parentNode).attr('transform');
      d.decoras.forEach(function(element, index, array){
          selectedDataLabel = d3.select(element);
          selectedDataLabel.transition().attr('transform', /** we can't get the value in the start of the animation d3.select(this).attr('transform')*/transformStr);    
          if(selectedDataLabel[0][0] !== null){
            if(dx === 0 && dy === 0){
              selectedDataLabel.attr('fill-opacity', null);
            }else{
              selectedDataLabel.attr('fill-opacity', '1');
            }
           }else{
            selectedDataLabel.attr('fill-opacity', '1');
           }
          }, this);   
    });
  }

  function selected(sect) {
    return sect.classed(selectedSectorClass);
  }

  return function() {
    return {
      allSelected : function(sectorGroup) {
        return sectorGroup.selectAll("." + selectedSectorClass);
      },

      select : function(s, flag) {
        select(s, flag);
      },

      clear : function(g, flag) {
        g.classed(selectedClass, flag);
      },

      defaultStyle : function(hoverSectorClass, sectorGroupClass) {
        var selectedGroupClass = "." + sectorGroupClass + "." + selectedClass;
        return selectedGroupClass + "{fill-opacity:0.4}" + " ." +
            selectedSectorClass + "," + selectedGroupClass + " ." +
            hoverSectorClass + "{fill-opacity:1}";
      },

      clearAll : function(sectorGroup) {
        sectorGroup.classed(selectedClass, false);
        this.allSelected(sectorGroup).call(select, false, true);
      }
    };
  };
});