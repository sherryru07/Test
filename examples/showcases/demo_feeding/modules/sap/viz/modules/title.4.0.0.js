sap.riv.module(
{
  qname : 'sap.viz.modules.title',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.util.TextUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.BoundUtil',
  version : '4.0.0'
}
],
function Setup(TextUtils, langManager, Objects, boundUtil) {
  var title = function(manifest, ctx) {
    var width = 500, height = 100; 
    var titleStyle = null;
    
    var options = {}, size = {
      width : 500,
      height : 100
        }, titleText = undefined;
    
    var chart = function(selection) {
      if (options.visible) {
        boundUtil.drawBound(selection, width, height);
        updateTitleStyle();
        var wrapper = this.selectAll('text.chart-title').data([titleText]);
        wrapper.exit().remove();
        wrapper.enter().append('text').attr('class', 'chart-title');
        wrapper.attr('style', titleStyle)
               .attr('text-anchor', function(){
                 if (options.alignment == 'right')
                    return 'end';
                 else if (options.alignment == 'left')
                    return 'start';
                 else
                    return 'middle';   
               })
               .attr('x', function() {
                 if (options.alignment == 'right')
                   return width;
                 else if (options.alignment == 'left')
                   return 0;
                 else
                   return (width) / 2; //"center" anyway
               }).attr('y', height/2);
        TextUtils.ellipsis(titleText, wrapper.node(), width, titleStyle);
      }
      
      return chart;
    };

    chart.width = function(value) {
      if(!arguments.length)
        return width;
      width = value;
      return chart;
    };

    chart.height = function(value) {
      if(!arguments.length)
        return height;
      height = value;
      return chart;
    };
    
    chart.size = function(value) {
      if(!arguments.length)
        return size;
      size = value;
      return chart;
    };

    chart.properties = function(properties) {
      if (!arguments.length)
        return options;

      Objects.extend(true, options, properties);

      if (options.text === undefined || options.text === null) {
        titleText = langManager.get('IDS_DEFAULTCHARTTITLE');
      }else{
        titleText = options.text;
      }

      return chart;
    };
    
    chart.getPreferredSize = function() {
      if (options.visible) {
        updateTitleStyle();
        var titleSize = TextUtils.measure(titleText, titleStyle);
        return {
          hideOversize : true,
          maxSizeConstant : 1 / 3,
          'width' : titleSize.width,
          'height' : titleSize.height
        };
      }
      
      return {
        'width' : 0,
        'height' : 0
      };      
    };
    
    function updateTitleStyle() {
      titleStyle = ctx.styleManager.cssText('viz-title-label');
    }
    
    options = manifest.props(null);
    return chart;
  };
  
  return title;
});