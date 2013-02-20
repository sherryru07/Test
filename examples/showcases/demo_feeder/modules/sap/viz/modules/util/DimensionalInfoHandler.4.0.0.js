sap.riv.module(
{
  qname : 'sap.viz.modules.util.DimensionalInfoHandler',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
}
],
function Setup(langManager) {
  //fake dataset
  return function(props, multiplier) {
    var data_ = multiplier;
    var props_ = props;
    var dimInCol_;
    var dimInRow_;
    var rowDimension_ = {
      'values' : []
    };

    var colDimension_ = {
      'values' : []  
    };
    var ctx_ = [];
    var rowCount_;
    var colCount_;
    var mndDefaultString = langManager.get('IDS_DEFAULTMND');
    var my = function() {

    };


    my.setData = function(data)
    {
      data_ = data;
      return my;
    };

    my.setProperties = function(props)
    {
      props_ = props;
      return my;
    };

    my.getColumnDimensionData = function()
    {
      return  colDimension_;
    };

    my.getRowDimensionData = function()
    {
      return rowDimension_;
    };

    my.getContexts = function()
    {
      return ctx_;
    };

    function buildIndexMeasuresOnly()
    {
      var i = 0;
      if(dimInCol_ > 0)
      {
        rowCount_ = 1;
        colCount_ = data_.values[0].rows.length;
        ctx_.push([]);
        var colDimVals = colDimension_.values;
        colDimVals[0] = { 
            'col':{
          'val': mndDefaultString
        },
        'rows':[]
        };

        for(i = 0; i < data_.values[0].rows.length; ++i)
        {
          colDimVals[0].rows.push({ 
            'val': data_.values[0].rows[i].val,
            'info': data_.values[0].rows[i].info
          });
          ctx_[0].push(data_.values[0].rows[i].ctx);
        }
      }
      else
      {
        rowCount_ = data_.values[0].rows.length;
        colCount_ = 1;
        var rowDimVals = rowDimension_.values;
        rowDimVals[0] = { 
            'col':{
        'val': mndDefaultString
        },
        'rows':[]
        };
        for(i = 0; i < data_.values[0].rows.length; ++i)
        {
          rowDimVals[0].rows.push({
            'val': data_.values[0].rows[i].val,
            'info': data_.values[0].rows[i].info
          });
          ctx_.push([data_.values[0].rows[i].ctx]);
        }
      }
    }

    function initilize()
    {
      rowDimension_.values = [];
      colDimension_.values = [];
      rowCount_ = 0;
      colCount_ = 0;
      ctx_ = [];
    }
    // compare tow title is the same
    function compare(index, preIndex, startDim, dimNum)
    {
      for(var i = startDim; i < startDim + dimNum; ++i)
      {
        if(data_.values[i].rows[index].val !== data_.values[i].rows[preIndex].val){
          return false;
        }
      }
      return true;
    }

    //  
    function buildUniqueIndexes(uniqueIndex, index, startDim, dimNum)
    {
      var start = 0;
      var end = uniqueIndex.length;
      var isFound = true;
      for ( var level = 0; isFound && level < dimNum; ++level) {
        var nextStart = end;
        var nextEnd = start;
        isFound = false;
        for ( var pos = start; pos < end; ++pos) {
          if (data_.values[startDim + level].rows[uniqueIndex[pos]].val=== data_.values[startDim + level].rows[index].val) {
            isFound = true;
            if (pos < nextStart){
              nextStart = pos;
            }
            if (pos >= nextEnd){
              nextEnd = pos + 1;
            }
          }
        }

        if (isFound) {
          start = nextStart;
          end = nextEnd;
        }
      }

      if (!isFound)
      {
        if (end < uniqueIndex.length){
          uniqueIndex.splice(end, 0, index);
        } else {
          uniqueIndex.push(index);}
      }       
    }

    // use one array to stroe one column header title
    function buildOneHeader(index, startDim, dimNum)
    {
      var result = [];
      for(var i = startDim; i < startDim + dimNum; ++i)
      {
        result.push(data_.values[i].rows[index].val);
      }
      return result;
    }

    // generate hashmap map from name to col index
    function generateIndexMap(allUniqueColIndex, startDim, dimNum)
    {
      var map = {};
      for(var i = 0; i < allUniqueColIndex.length; ++i)
      {
        map[buildOneHeader(allUniqueColIndex[i], startDim, dimNum)] = i;
      }
      return map;
    }

    function processColHeader(startDim, dimNum)
    {
      var colIndex = [];
      var allUniqueColIndex = [];
      allUniqueColIndex.push(0);
      var i;
      var element = {};
      for(i = 1; i < data_.values[startDim].rows.length; ++i)
      {
        buildUniqueIndexes(allUniqueColIndex, i, startDim, dimNum);
      }

      //build column dimension data set
      var colDimVals = colDimension_.values;
      for(i = 0; i < dimNum; ++i)
      {
        element = {};
        element.col = data_.values[startDim + i].col;
        element.rows = [];
        element.rows[0] = {
          'val': data_.values[startDim + i].rows[0].val,
          'info': data_.values[startDim + i].rows[0].info
        };
        colDimVals.push(element);
      }
      for(i = 0; i < allUniqueColIndex.length; ++i)
      {
        for(var j = 0; j < dimNum; j++)
        {
          colDimVals[j].rows[i] = {
            'val': data_.values[startDim + j].rows[allUniqueColIndex[i]].val,
            'info': data_.values[startDim + j].rows[allUniqueColIndex[i]].info
          };
        }

      }
      // to solve performance issue
      var hashMap = generateIndexMap(allUniqueColIndex, startDim, dimNum);
      for(i = 0; i < data_.values[startDim].rows.length; ++i)
      {
        element = buildOneHeader(i, startDim, dimNum);
        colIndex[i] = hashMap[element];
      }
      colCount_ = allUniqueColIndex.length;
      return colIndex;
    }
    
    
    function cloneOneContext(ctx)
    {
      if(!ctx) {return null;}
      return {
        'type': ctx.type,
        'path':{
          'aa': ctx.path.aa,
          'di': ctx.path.di,
          'dii': ctx.path.dii
        }
      };
    }
    
    function cloneOneRowContext(row)
    {
      var clones = [];
      for(var i = 0; i < row.length; ++i)
      {
        clones.push(cloneOneContext(row[i]));
      }
      return clones;
    }

    function addMeasureContext(row, ctx)
    {
      
      for(var i = 0; i < row.length; ++i)
      {
        if(!row[i]) {row[i] = {path:{}};}
        row[i].path.mg = ctx.path.mg;
        row[i].path.mi = ctx.path.mi;
      }
    }

    function expendContexts(num)
    {
      var totalRow = ctx_.length;
      for(var i = 0; i < num; ++i)
      {
        for(var j = 0; j < totalRow; ++j)
        {
          ctx_.push(cloneOneRowContext(ctx_[j]));
        }
      }
    }

    function addMND(bMNDInner, bMNDInRow, dimInRow, dimInCol)
    {
      var indexMND = bMNDInner ? data_.values.length - 1 : 0;
      var measures = data_.values[indexMND].rows;
      //new dimension to add row or column
      var row = {};
         row.col = data_.values[indexMND].col;
         row.rows = []; 
      var dimVals = bMNDInRow ? rowDimension_.values :colDimension_.values;
      var dimNums = bMNDInRow ? dimInRow : dimInCol;
      var i, j, k;
      var element;
      
      //1 MND in row and no dimension in row
      if(bMNDInRow && dimInRow === 0)
      {
        dimVals[0] = { 
            'col':{
            'val': mndDefaultString
          },
          'rows':[]
        };
        addMeasureContext(ctx_[0], measures[0].ctx);
        //Jimmy,12/27/2012 we don't have additional info for MND for now
        dimVals[0].rows.push({ 'val': measures[0].val});
        for(i = 1; i < measures.length; ++i)
        {
          dimVals[0].rows.push({ 'val': measures[i].val});
          ctx_.push(cloneOneRowContext(ctx_[0]));
          addMeasureContext(ctx_[i], measures[i].ctx);
        }
        rowCount_ = measures.length;
        return;
      }
      
      //2 MND in column and no dimension in column
      if(!bMNDInRow && dimInCol === 0)
      {
        //create column dimension and set value
        dimVals[0] = { 
            'col':{
            'val': mndDefaultString
            },
            'rows':[]
        };
        for(i = 0; i < measures.length; ++i)
        {
          dimVals[0].rows.push({'val' : measures[i].val});
        }
        
        // expand context  
        for(i = 0; i < ctx_.length; ++i)
        {
          ctx_[i][0].path.mg = measures[0].ctx.path.mg;
          ctx_[i][0].path.mi = measures[0].ctx.path.mi;
          for(j = 1; j < measures.length; ++j)
          {
            ctx_[i].push(cloneOneContext(ctx_[i][0]));
            ctx_[i][j].path.mg = measures[j].ctx.path.mg;
            ctx_[i][j].path.mi = measures[j].ctx.path.mi;
          }
        }
        return;
      }
      var count = bMNDInRow ? rowCount_ : colCount_;
      // 3 have dimensions in column and have dimensions in row
      if( bMNDInner)
      {
        // add measure data
        for(i = 0; i < count; ++i)
        {
          for(j = 0; j < dimVals.length; ++j)
          {
            for(k = 1; k < measures.length; ++k)
            {
              element =  {
                'val': dimVals[j].rows[i * measures.length + k - 1].val,
                'info': dimVals[j].rows[i * measures.length + k - 1].info
              };
              dimVals[j].rows.splice(i * measures.length + k, 0, element);
            }
          }
        }

        //add MND dimension to row/column
        for(i = 0; i < count; ++i)
        {
          for(j = 0; j < measures.length; ++j)
          {
            element =  {'val': measures[j].val};
            row.rows.push(element);
          }
        }
        dimVals.push(row);

        if(bMNDInRow)
        {
          rowCount_ *= measures.length;
          for(i = 0; i < rowCount_; i += measures.length)
          {
            addMeasureContext(ctx_[i], measures[0].ctx);
            for(j = 1; j < measures.length; ++j)
            {
              var oneRow = cloneOneRowContext(ctx_[i]);
              ctx_.splice(i + j, 0, oneRow);
              addMeasureContext(ctx_[i + j],  measures[j].ctx);
            }
          }

        }else{      
          colCount_ *= measures.length;
          for(i = 0; i < ctx_.length; ++i)
          {
            for(j = 0; j < colCount_; j+= measures.length)
            {
              ctx_[i][j].path.mg = measures[0].ctx.path.mg;
              ctx_[i][j].path.mi = measures[0].ctx.path.mi;    
              for(k = 1; k < measures.length; ++k)
              {
                ctx_[i].splice(j + k, 0, cloneOneContext(ctx_[i][j]));
                ctx_[i][j + k].path.mg = measures[k].ctx.path.mg;
                ctx_[i][j + k].path.mi = measures[k].ctx.path.mi;
              }
            }
          }
        }
        return;
      }
      else {

        //expand value first; 
        for(i = 1; i < measures.length; ++i)
        {
          for(j = 0; j < dimNums; ++j)
          {
            for(k = 0; k < count; ++k)
            {
              element = {
                'val': dimVals[j].rows[k].val,
                'info': dimVals[j].rows[k].info
              };
              dimVals[j].rows.push(element);
            }
          }
        }

        //add 
        for(j = 0; j < measures.length; ++j)
        {
          for(i = 0; i < count; ++i)
          {
            element =  {'val': measures[j].val};
            row.rows.push(element);
          }
        }
        dimVals.splice(0, 0, row);
        if(bMNDInRow)
        {
          rowCount_ *= measures.length;
          expendContexts(measures.length - 1);
          for(i = 0; i < rowCount_; ++i)
          {
            addMeasureContext(ctx_[i], measures[rowCount_ % measures.length].ctx);
          }
        }else{
          colCount_ *= measures.length;

          for(i = 0; i < ctx_.length; ++i)
          {
            var rows = [];
            addMeasureContext(ctx_[i], measures[0].ctx);
            for(j = 1; j < measures.length; ++j)
            {
              var addedRow = cloneOneRowContext(i);
              addMeasureContext(addedRow, measures[0].ctx);
              rows = rows.concat(cloneOneRowContext(i));
            }
            ctx_[i] = ctx_[i].concat(rows);
          }
        }
      }
    }
    
    function buildRowDimension(dimInRow, startIndex, rowIndexs){

      var rowDimVals = rowDimension_.values;
      var i = 0;
      for(i = 0; i < dimInRow; ++i)
      {
        var element = {};
        element.col = data_.values[startIndex + i].col;
        element.rows = [];
        element.rows[0] = {
          'val': data_.values[startIndex + i].rows[0].val,
          'info': data_.values[startIndex + i].rows[0].info
        };
        rowDimVals.push(element);
      }
      for (i = 1; i < data_.values[startIndex].rows.length; ++i)
      {
        if (compare(i, i - 1, startIndex, dimInRow)){
          rowIndexs[i] = rowCount_;
        }else {  
          ++rowCount_;
          for(var j = 0; j < dimInRow; j++)
          {
            rowDimVals[j].rows[rowCount_] = {
              'val': data_.values[startIndex + j].rows[i].val,
              'info': data_.values[startIndex + j].rows[i].info
            };
          }
          rowIndexs[i] = rowCount_;
        }
      }
      ++rowCount_;
    }
    
    // Mix MND and dimension case
    function processDimsWithMeasure()
    {
      var startIndex = 0,
        endIndex = data_.values.length;
      var dimInRow = dimInRow_,
        dimInCol = dimInCol_;
      var bMNDInner = false,
        bMNDInRow = true;
      var i;
      if(data_.values[0].type === "MND")
      {
        ++startIndex;
        if(dimInRow > 0){ 
          --dimInRow;
        } else {
          --dimInCol;
          bMNDInRow = false;
        }
      }

      if(data_.values[endIndex - 1].type === "MND")
      {
        bMNDInner = true;
        --endIndex;
        if(dimInCol > 0)
        {
          --dimInCol;
          bMNDInRow = false;
        }else{
          bMNDInRow = true;
          --dimInRow;
        }
      }

      //process no MND cases first
      if(startIndex < endIndex)
      {
        //some dimension in row and some in column 
        var rowIndexs = [];
        if(dimInCol > 0 || dimInRow > 0)
        {
          //process row dimension first
          rowIndexs[0] = 0;
          rowCount_ = 0;
          if(dimInRow > 0)
          {
            buildRowDimension(dimInRow, startIndex, rowIndexs);
          }else{
            rowCount_ = 1;
            for(i = 1; i < data_.values[startIndex].rows.length; ++i){
              rowIndexs[i] = 0;
            }
          }
          
          //build column dimensions and indexes
          var colIndexs = [];
          if(dimInCol > 0)
          {
            colIndexs = processColHeader(startIndex + dimInRow, dimInCol);
          }else{
            colCount_ = 1;
            for(i = 0; i < data_.values[startIndex].rows.length; ++i){
              colIndexs[i] = 0;
            }
          }
          
          //generate data context for each sub chart
          ctx_ = new Array(rowCount_);
          for(i = 0; i < rowCount_; ++i)
          {
            ctx_[i] = [];
            for(var j = 0; j < colCount_; ++j){
              ctx_[i][j] = null;
            }
          }

          for(i = 0 ; i < data_.values[startIndex].rows.length; ++i)
          {
            ctx_[rowIndexs[i]][colIndexs[i]] = data_.values[startIndex + dimInRow + dimInCol - 1].rows[i].ctx;
          }
        }
        
        //process measure names at last
        if(dimInRow < dimInRow_ || dimInCol < dimInCol_)
        {
          addMND(bMNDInner, bMNDInRow, dimInRow, dimInCol);
        }
      }
    }

    my.process = function()
    {
      initilize();
      if(!data_ || !data_.values || data_.values.length === 0) {return;}
      dimInCol_ =  props_ && props_["numberOfDimensionsInColumn"] !== undefined ?  props_["numberOfDimensionsInColumn"] : 1;
      if(!dimInCol_ || dimInCol_ < 0) { dimInCol_ = 0;}
      if(dimInCol_ > data_.values.length) {dimInCol_ = data_.values.length;}
      dimInRow_ = data_.values.length - dimInCol_;
      if(dimInRow_ < 0){ dimInRow_ = 0;}

      if(data_.values.length === 1 && data_.values[0].type === "MND")
      {
        buildIndexMeasuresOnly();
      }else{
        processDimsWithMeasure();
      }
    };

    return my;

  };
});