sap.riv.module(
{
  qname : 'sap.viz.modules.layout',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
}
],
function Setup(TypeUtils) {
  
  /*
   * Function set that represents a light-weight layout manager
   * who calculates optimal component layout data, rather than
   * operating on components directly.
   */
  return function ( spec ) {
    
    var defaults = {
      resize : true,
      type : 'grid',
      padding : [0,0,0,0],
      hgap : 0,
      vgap : 0
    };  
  
    var hgap = spec.hgap || defaults.hgap,
        vgap = spec.vgap || defaults.vgap,
        padding = spec.padding || defaults.padding,
        bias = spec.bias || 'none';
    
    //Jimmy8/7/2012, different layout function may return different layoutSolution
    //so initialize it in each layout function
    var layoutSolution; // returning data
    
    switch ( spec.type ) {
    case 'border' : 
      border(spec.prefs);
      break;
    case 'grid' :
      grid(spec.prefs);
      break;
    case 'table' :
      //FIXME Elliott/Jimmy 8/7/2012, table layout has some special options
      //here we will read spec inside table layout function directly. consider
      //making it consistent with others 
    table();
    break;
    default :
      grid(spec.prefs);
    }
    
    /**
     * Represents a border-docking layout method which assigns components
     * with spaces of omni-directional border insets. Padding is leaved
     * prior to layout. Component marked as a bias will be processed first
     * to embody the predominance of it. North and South parts are naturally
     * biased against other parts due to the nature of border layout. So
     * the bias attribute supports up to two values: 'west', 'east' or both
     * (in an array and order matters). The center part is under passive 
     * control and queued last to be processed.
     * 
     * ---------------------------------------
     * |               Padding               |
     * |   -------------------------------   |
     * |   |     |     North       |     |   |
     * |   -------------------------------   |
     * |   |     |                 |     |   |
     * |   |  W  |                 |  E  |   |
     * |   |  e  |     Center      |  a  |   |
     * |   |  s  |                 |  s  |   |
     * |   |  t  |                 |  t  |   |
     * |   |     |                 |     |   |
     * |   |     |                 |     |   |
     * |   -------------------------------   |
     * |   |     |     South       |     |   |
     * |   -------------------------------   |
     * |                                     |
     * ---------------------------------------
     */
    function border( options ) {
    layoutSolution = {};
      var packedSize = {}; // Size without paddings.
      packedSize.width = spec.size.width - padding[1] - padding[3];
      packedSize.height = spec.size.height - padding[0] - padding[2];
      
      // Enclosing dimension bounds
      var minX = padding[3],
          minY = padding[0],
          maxX = spec.size.width - padding[1],
          maxY = spec.size.height - padding[2];

      var queue = new Array, i;
      
      // Layout ordering rule
      if ( bias instanceof Array ) {
        queue[0] = bias[0];
        queue[1] = bias[1];
        queue[2] = 'north';
        queue[3] = 'south';
      } else {
        switch ( bias ) {
        case 'west' :
          queue[0] = 'west';
          queue[1] = 'north';
          queue[2] = 'south';
          queue[3] = 'east';
          break;
        case 'east' :
          queue[0] = 'east';
          queue[1] = 'north';
          queue[2] = 'south';
          queue[3] = 'west';
          break;
        default :
          queue[0] = 'north';
          queue[1] = 'south';
          queue[2] = 'east';
          queue[3] = 'west';
        }
      }
      queue[4] = 'center';
      
      for ( i = 0; i < queue.length; i++ ) {
        doLayout(queue[i]);
      }
      
      function doLayout( division ) {
          
                function getAvailableSpacings(maxSize) {
                    if (arguments.length < 2) {
                        return 0;
                    }
                    var spacings = Array.prototype.slice.apply(arguments).slice(1);
                    var spacingsByOrder = [];
                    for (var i = 0; i < spacings.length; i++) {
                        if (spacings[i].length > 1) {
                            spacingsByOrder[i] = spacings[i].slice(1);
                            spacingsByOrder[i].push(spacings[i][0]);
                        }
                    }
                    
                    var availableSpacings = 0;
                    var availableSpacingsSum = 0;
                    for (var i = 0; i < spacingsByOrder[0].length; i++) {
                        for (var j = 0; j < spacingsByOrder.length; j++) {
                            availableSpacingsSum += spacingsByOrder[j][i];
                        }
                        if (availableSpacingsSum > maxSize) {
                            return availableSpacings;
                        }
                        availableSpacings += spacingsByOrder[0][i];
                    }
                    return availableSpacings;
                }

        var node = {}, preferredSize = {};
        if ( division === 'north' && options.north ) {
          node = layoutSolution.north = {};
          preferredSize = options.north.size;
          var nodeHeight = preferredSize.height;
          var heightSum = nodeHeight;
          if (preferredSize.spacings && options.south && options.south.size.spacings) {
              heightSum += options.south.size.height;
          }
          
          if (preferredSize.maxSizeConstant && heightSum > packedSize.height * preferredSize.maxSizeConstant) {
              if (preferredSize.hideOversize) {
                  nodeHeight = 0;
              } else if (preferredSize.spacings) {
                  if (options.south && options.south.size.spacings) {
                      nodeHeight = getAvailableSpacings(packedSize.height * preferredSize.maxSizeConstant, preferredSize.spacings, options.south.size.spacings);
                  } else {
                      nodeHeight = getAvailableSpacings(packedSize.height * preferredSize.maxSizeConstant, preferredSize.spacings);
                  }
              } else {
                  nodeHeight = packedSize.height * preferredSize.maxSizeConstant;
              }
          }
          node.bounds = { 
            x : minX, 
            y : minY,
            width  : maxX - minX,
            height : nodeHeight
          };
          minY += (node.bounds.height + hgap);
          if (node.bounds.height == 0) {
              layoutSolution.north = null;
          }
        }
        
        if ( division === 'east' && options.east ) {
          node = layoutSolution.east = {};
          preferredSize = options.east.size;
          var nodeWidth = preferredSize.width;
          var widthSum = nodeWidth;
          if (preferredSize.spacings && options.west && options.west.size.spacings) {
              widthSum += options.west.size.width;
          }
          if (preferredSize.maxSizeConstant && widthSum > packedSize.width * preferredSize.maxSizeConstant) {
              if (preferredSize.hideOversize) {
                  nodeWidth = 0;
              } else if (preferredSize.spacings) {
                  if (options.west && options.west.size.spacings) {
                      nodeWidth = getAvailableSpacings(packedSize.width * preferredSize.maxSizeConstant, preferredSize.spacings, options.west.size.spacings);
                  } else {
                      nodeWidth = getAvailableSpacings(packedSize.width * preferredSize.maxSizeConstant, preferredSize.spacings);
                  }
              } else {
                  nodeWidth = packedSize.width * preferredSize.maxSizeConstant;
              }
          }
          if (nodeWidth < preferredSize.minWidth) {
              nodeWidth = 0;
          }
          node.bounds = { 
            x : maxX - nodeWidth,
            y : minY,
            width : nodeWidth,
            height : maxY - minY
          };
          
          if (node.bounds.height < preferredSize.minHeight) {
              node.bounds.width = 0;
          }
          
          maxX -= (node.bounds.width - vgap);
          if (node.bounds.width == 0) {
              layoutSolution.east = null;
          }
        }
        
        if ( division === 'south' && options.south ) {
          node = layoutSolution.south = {};
          preferredSize = options.south.size;
          var nodeHeight = preferredSize.height;
          var heightSum = nodeHeight;
          if (preferredSize.spacings && options.north && options.north.size.spacings) {
              heightSum += options.north.size.height;
          }
          if (preferredSize.maxSizeConstant && heightSum > packedSize.height * preferredSize.maxSizeConstant) {
              if (preferredSize.hideOversize) {
                  nodeHeight = 0;
              } else if (preferredSize.spacings) {
                  if (options.north && options.north.size.spacings) {
                      nodeHeight = getAvailableSpacings(packedSize.height * preferredSize.maxSizeConstant, preferredSize.spacings, options.north.size.spacings);
                  } else {
                      nodeHeight = getAvailableSpacings(packedSize.height * preferredSize.maxSizeConstant, preferredSize.spacings);
                  }
              } else {
                  nodeHeight = packedSize.height * preferredSize.maxSizeConstant;
              }
          }
          node.bounds = {
            x : minX,
            y : (maxY - nodeHeight) < minY ? minY : (maxY - nodeHeight),
            width  : maxX - minX
          };
          node.bounds.height = nodeHeight;
          maxY -= (node.bounds.height - hgap);
          if (node.bounds.height == 0) {
              layoutSolution.south = null;
          }
        }
        
        if ( division === 'west' && options.west ) {
          node = layoutSolution.west = {};
          preferredSize = options.west.size;
          var nodeWidth = preferredSize.width;
          var widthSum = nodeWidth;
          if (preferredSize.spacings && options.east && options.east.size.spacings) {
              widthSum += options.east.size.width;
          }
          if (preferredSize.maxSizeConstant && widthSum > packedSize.width * preferredSize.maxSizeConstant) {
              if (preferredSize.hideOversize) {
                  nodeWidth = 0;
              } else if (preferredSize.spacings) {
                  if (options.east && options.east.size.spacings) {
                      nodeWidth = getAvailableSpacings(packedSize.width * preferredSize.maxSizeConstant, preferredSize.spacings, options.east.size.spacings);
                  } else {
                      nodeWidth = getAvailableSpacings(packedSize.width * preferredSize.maxSizeConstant, preferredSize.spacings);
                  }
              } else {
                  nodeWidth = packedSize.width * preferredSize.maxSizeConstant;
              }
          }
          node.bounds = {
            x : minX,
            y : minY,
            width  : nodeWidth,
            height : (minY + preferredSize.height) > maxY ? maxY : (minY + preferredSize.height)
          };
          minX += (node.bounds.width + vgap);
          if (node.bounds.width == 0) {
              layoutSolution.west = null;
          }
        }
        
        if ( division === 'center' && options.center ) {
          node = layoutSolution.center = {};
          node.bounds = {
            x : minX,
            y : minY,
            width  : maxX - minX,
            height : maxY - minY
          };
        }
      }
    }
    
    function grid( options ) {}
    
    /**
     * compared to HTML table, currently we only support cellpadding. we don't (need) support cellspacing 
   * @param {Object} options
     */
    function table( options ) {
      layoutSolution = [];//return layout solution by column * row
      //table layout options
      var columns = TypeUtils.isExist(spec.columns) ? spec.columns : 3;
      var rows = TypeUtils.isExist(spec.rows) ? spec.rows : 2;
      var cellpadding = TypeUtils.isExist(spec.cellpadding) ? spec.cellpadding : 5;
      var paddingThreshold = TypeUtils.isExist(spec.paddingThreshold) ? spec.paddingThreshold : 0.1;
      
      var packedSize = {}; // Size without paddings.
        packedSize.width = spec.size.width - padding[1] - padding[3];
        packedSize.height = spec.size.height - padding[0] - padding[2];
        
        var avgWidth = packedSize.width/columns;
        var avgHeight = packedSize.height/rows;
        //don't make the cellPadding too large
        if (cellpadding > avgWidth * paddingThreshold || cellpadding > avgHeight * paddingThreshold){
          cellpadding = 2;
        }
        var cellWidth = (packedSize.width - 2 * columns * cellpadding)/columns;
        cellWidth = cellWidth > 0 ? cellWidth : 0;
        var cellHeight = (packedSize.height - 2 * rows * cellpadding)/rows;
        cellHeight = cellHeight > 0 ? cellHeight : 0;
      
        // Enclosing dimension bounds
        var minX = padding[3],
        minY = padding[0],
        maxX = spec.size.width - padding[1],
        maxY = spec.size.height - padding[2];
        
        for( var col = 0; col < columns; col++ ){
          var colia = [];//column iteration array
          for( var row = 0; row < rows; row++ ){
            var node = {};
            node.bounds = {
              x: col * avgWidth + avgWidth/2 - cellWidth/2,
              y: row * avgHeight + avgHeight/2 - cellHeight/2,
              width: cellWidth,
              height: cellHeight
            };
            colia.push(node);
          }
          layoutSolution.push(colia);
        }
        
    }
    
    return layoutSolution;
  };
  
});