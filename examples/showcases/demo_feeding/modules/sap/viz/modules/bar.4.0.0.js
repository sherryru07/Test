sap.riv.module(
{
  qname : 'sap.viz.modules.bar',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.dispatch',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.MNDHandler',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.ColorSeriesGenerator',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.tooltipDataHandler',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.NumberUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.lassoSelection',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Scaler',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.Repository',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.datalabel',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.BoundUtil',
  version : '4.0.0'
}
],
function Setup(TypeUtils, dispatch, MNDHandler, ColorSeries, tooltipDataHandler, NumberUtils, lassoSelection, Scaler, Repository, dataLabel, Objects, langManager, BoundUtil) {
  var bar = function(manifest, ctx) {
    var  tooltipDataHandlerObj;
    var  data1,                 // data1 for value axis 1
         data2,                 // data2 for value axis 2
         data,                  // data from measure feed
         seriesData = [],             // seriesData is used to draw chart, it is transferred from data
         primaryAxisTopBoundary = 0,       // max value for value axis 1
         primaryAxisBottomBoundary = 0,
         primaryAxisManualRange = false,
         secondaryAxisManualRange = false,
         secondaryAxisTopBoundary = 0,
         secondaryAxisBottomBoundary = 0,      // max value for value axis 2
         gWrapper = null;
    
    var  width,          // chart width
         height,          // chart height
         isDualAxis = false,
         hasMNDonCategoryAxis = false,
         id = Math.floor(Math.random() * 10000),
         colorPalette = [],
         axis1ColorPalette,
         axis2ColorPalette,
         MNDInnerOnColor = false,
         measureOnAxis1 = 0,
         measureOnAxis2 = 0,
         shapePalette = ['squareWithRadius'],      // shape palette for legend
         properties,          // poreperteis that is used to control chart
         eDispatch = new dispatch('selectData', 'deselectData', 'showTooltip', 'hideTooltip','initialized','startToInit');
        
    
    
    var effectManager = ctx.effectManager;
    
    var valueScales = [],
        yScale = d3.scale.ordinal(),    // category scale
        xScale = d3.scale.linear(),      // scale for value axis 1
        xScale2 = d3.scale.linear();    // scale for value axis 2
      
      //variable for event
    var decorativeShape = null,           // the shape to show the effect of mouse move
        lastSelected = [],           // the variable to hold all selected shapes
        lastHovered = null,         // last hovered dimention item index
        tooltipVisible = true,  
        isLasso = false;
      
    var indexforSecondaryAxis = 0,        // if data index of seriesData is bigger than it, which means those data should be scaled by xScale2    
        barNumber,              // the number of bar in each group    
        barGroupNumber,            // the number of bar groups 
        barWidth = [],            // array to store all bars' widths.
        barHeight;              // barHeight is fixed and all bars have the same height.
    
    var enableDataLoadingAnimation = true,   // control initialization animation  
        enableDataUpdatingAnimation = true, // control data updating animation
        enableRoundCorner = false,      // enable/disable round corner bar
        clipEdge = true,          // if it is false, the chart can be drawn out of the plot area.
        totalIntervalTime = 1000,      // animation time limited. all animation must be completed within it.
        isOnlyInitAnimation = false;    // for now, only init animation is supported
    
    var defsEnter = null, 
        roundCornerDefs = null,
        suffix = Repository.newId();
    
    var drawingEffect = 'normal';
    
    var sizeChange = false, dataStructureChange = false, dataValueChange = false;

    var dataLabel;
    
    /**
     * Parse options
     */
    var parseOptions = function(){
        enableRoundCorner = properties.isRoundCorner;
        enableDataLoadingAnimation =  properties.animation.dataLoading; 
        enableDataUpdatingAnimation =  properties.animation.dataUpdating; 

        tooltipVisible = properties.tooltip.enabled;
          
        if(isDualAxis && !hasMNDonCategoryAxis){
          axis1ColorPalette = properties.primaryValuesColorPalette;   
          axis2ColorPalette = properties.secondaryValuesColorPalette;
        }else{
          axis2ColorPalette = properties.colorPalette;
          axis1ColorPalette = properties.colorPalette;
        }
        drawingEffect = properties.drawingEffect; 
        
        var colorIndexes = 0;
        if(!hasMNDonCategoryAxis){
          indexforSecondaryAxis = data1.length;
          colorIndexes = seriesData[0].length;   
        }else{
          colorIndexes = seriesData.length * seriesData[0].length;
        }
        colorPalette = [];
        var i = 0;
        if(MNDInnerOnColor){
          var flag = 0, flag2 = 0, j = 0;
          for(i = 0 ; i < indexforSecondaryAxis; i++){
            colorPalette.push(axis1ColorPalette[i % axis1ColorPalette.length]);
            flag++;
            if(flag === measureOnAxis1){
              flag2 = 0;
              for(; j <=(colorIndexes-indexforSecondaryAxis); j++){
                if(flag2 >= measureOnAxis2){
                  flag = 0;
                  break;
                }
              colorPalette.push(axis2ColorPalette[j % axis2ColorPalette.length]);  
              flag2++;
            }
          }
        }
      }else{
        for(i = 0; i < colorIndexes; i++){
          if(i < indexforSecondaryAxis){
            colorPalette.push(axis1ColorPalette[i % axis1ColorPalette.length]);
          }else if(isDualAxis && !hasMNDonCategoryAxis){
            colorPalette.push(axis2ColorPalette[(i-indexforSecondaryAxis) % axis2ColorPalette.length]);  
          }
        }
      }
    };
      
    /**
     * Create chart
     */
    function chart(selection){
        BoundUtil.drawBound(selection, width, height);
      
        var countMagnitude = function(number)
        {
            var res = 0;
            //0.0234: 0.01
            //0.234: 0.1
            //2.34: 1
            //23.4: 10
            //234:100
            //234:100
            if(number >= 1)
            {
                res = 1;
                for(;;)
                {
                    if((number / 10) < 1)
                    {
                        break;
                    }
                    else
                    {
                        number /= 10;
                        res *= 10;
                    }
                }
            }
            else if(number < 1)
            {
                res = 0.1;
                for(;;)
                {
                    if((number * 10) >= 1)
                    {
                        break;
                    }
                    else
                    {
                        number *= 10;
                        res /= 10;
                    }
                }
            }
            return res;
        }

        var bestImageNumberRatio = function(seriesData, valueScale, barHeight)
        {
            var res = 1;
            var imageRatioObjs = [];
            for(var i = 0; i < seriesData.length; i++)
            {
                for(var j = 0; j < seriesData[i].length; j++)
                {
                    var ratioItem = {};
                    ratioItem.rectWidth = valueScale(seriesData[i][j].val);
                    ratioItem.rectHeight = barHeight;

                    ratioItem.imageWidth = barHeight;
                    ratioItem.val = seriesData[i][j].val;

                    imageRatioObjs.push(ratioItem);
                }
            }
            //var points = [40,100,1,5,25,10];
            imageRatioObjs.sort(function(a,b){return b.rectWidth-a.rectWidth});
            if(imageRatioObjs.length != 0)
            {
                var bestImageNum = imageRatioObjs[0].rectWidth/imageRatioObjs[0].imageWidth;
                var theVal = imageRatioObjs[0].val;

                var baseMagnitude = countMagnitude(bestImageNum/theVal);

                var imageNumTest1 = Math.abs(baseMagnitude * theVal - bestImageNum);
                var imageNumTest2 = Math.abs(baseMagnitude * 10 * theVal - bestImageNum);
                
                if(imageNumTest1 < imageNumTest2
                    && (baseMagnitude * theVal * imageRatioObjs[0].imageWidth) >= imageRatioObjs[0].rectWidth*0.2)
                {
                    res = baseMagnitude;
                }
                else
                {
                    res = baseMagnitude * 10;
                }
            }

            return res;
        }

        var imageFill = function(barShape, bar, i, barHeight)
        {

            var defIDFun = function(d, itemIndex) {
                    return "defID-" + i + itemIndex;//i is group index
                };

            var pathIDFun = function(d, itemIndex) {
                    return "pathID-" + i + itemIndex;//i is group index
                };

            var urlPathIDFun = function(d, itemIndex) {
                    return "url(#" + pathIDFun(d, itemIndex) + ")";//i is group index
                };

            var urlIDFun = function(d, itemIndex) {
                    return "url(#" + defIDFun(d, itemIndex) + ")";//i is group index
                };

            var rectWidthFun = function(d) {
                    var valueScale = valueScales[d.valueAxis];
                    return valueScale(d.val);
                };

            var imageNumber = function(perDefData)
            {
                var val = perDefData.val;
                if(perDefData.val < 0)
                {
                    val = -val;
                }

                var res = {number:0, interval:barHeight};
                res.number = val*imageNumRatio;

                //to count the interval
                var intNum = Math.floor(res.number);
                var decimalNum = res.number - intNum;

                var rectWidth = rectWidthFun(perDefData);
                var imageWidth = barHeight;
                var lastImageWidth = imageWidth * decimalNum;

                //   imageWidth + (intNum-1)*interval + (interval-imageWidth) + lastImageWidth == rectWidth   //interval >= imageWidth           
                //or imageWidth + (intNum-1)*interval == rectWidth //interval < imageWidth && (lastImageWidth <= interval)
                //or intNum*interval + lastImageWidth == rectWidth //interval < imageWidth && (lastImageWidth > interval)
                var intervalTest1;
                if(intNum == 0)
                {
                    intervalTest1 = 0;
                }
                else
                {
                    if(rectWidth > lastImageWidth)
                    {
                        intervalTest1 = (rectWidth - lastImageWidth)/intNum; 
                    }
                    else
                    {
                        intervalTest1 = 0;
                    }
                }
                
                var intervalTest2;
                if(intNum <= 1)
                {
                    intervalTest2 = rectWidth/2;
                }
                else
                {
                    if(rectWidth > imageWidth)
                    {
                        intervalTest2  = (rectWidth - imageWidth)/(intNum - 1);
                    }
                    else
                    {
                        intervalTest2 = rectWidth/(intNum + 1);
                    }
                }

                var intervalTest3;
                if(intNum === 0)
                {
                    intervalTest3 = 0;
                }
                else if(rectWidth > imageWidth)//imageWidth > lastImageWidth
                {
                    intervalTest3  = (rectWidth - lastImageWidth)/intNum;
                }
                else
                {
                    intervalTest3 = rectWidth/(intNum + 1);
                }


                if(intervalTest1 >= imageWidth)
                {
                    res.interval = intervalTest1;
                }
                else if (intervalTest2 < imageWidth && (lastImageWidth <= intervalTest2))
                {
                    res.interval = intervalTest2;
                }
                else
                {
                    res.interval = intervalTest3;
                }

                return res;
            }

            var imageRatioObjs = [];
            

            var imagesFun = function (perDefData,k)
            {
                var thisObj = d3.select(this);

                var rectWidth = rectWidthFun(perDefData);
                var rectHeight = barHeight;

                var imageNum = imageNumber(perDefData);

                var intNum = Math.floor(imageNum.number);
                var decimalNum = imageNum.number - intNum;

                thisObj.selectAll("image").remove();

                var iImage = 0;
                for(; iImage < intNum; iImage++)
                {
                    thisObj.append("image")
                        .attr("xlink:xlink:href", properties.fillMode.imagePalette[k])
                        .attr("width",rectHeight)
                        .attr("height",rectHeight)
                        .attr("x",iImage*imageNum.interval);
                }

                if(decimalNum)
                {
                    var startX = iImage*imageNum.interval;
                    var imagePath = startX + ",0 ";
                    imagePath += ((startX + rectHeight*decimalNum) + ",0 ");
                    imagePath += ((startX + rectHeight*decimalNum) + "," + rectHeight + " ");
                    imagePath += (startX + "," + rectHeight + " ");

                    //for the decimalNum. add the 
                    thisObj.append("clipPath")
                        .attr("id", pathIDFun)
                        .append("polygon")
                        .attr("points",imagePath);

                    //<clipPath id="hex-mask">
                    //<polygon points="100,0 150,0 150,100 100,100" />
                    //</clipPath>
                    //<image x="100" y="0" clip-path="url(#hex-mask)" opacity="1" height="100" width="100" xlink:href="file:///C:/Users/I052223/Desktop/pics/trunk.png" />

                    thisObj.append("image")
                        .attr("xlink:xlink:href", properties.fillMode.imagePalette[k])
                        .attr("width",rectHeight)
                        .attr("height",rectHeight)
                        .attr("x",startX)
                        .attr("clip-path",urlPathIDFun);
                }
                
            };

            //start of the function
            barShape.selectAll("defs").remove();
            var imageDef = barShape.append("defs").append("pattern")
                .attr("id", defIDFun)
                .attr("patternUnits","userSpaceOnUse")
                //.attr("width",20)//plot width
                //.attr("height",20);//plot height
                .attr("width",rectWidthFun)
                .attr("height",barHeight);

            //we use "each" to access data and index
            //to make the imageNumRatio
            var imageNumRatio = 1;
            imageDef.each( function(d)
            {
                var valueScale = valueScales[d.valueAxis];
                imageNumRatio = bestImageNumberRatio(seriesData, valueScale, barHeight);
            }
            );

            imageDef.each(imagesFun);
            bar.attr('fill',urlIDFun);
        };


      tooltipDataHandlerObj = tooltipDataHandler();
      
      // [19-Oct-2012 Nick] if the size of plot area is too small, there is no value scale created and the whole drawing part is skipped.
      if(valueScales.length === 0){ 
        return;
      }
      eDispatch.startToInit();
      
      selection.each(function(){
        barNumber = seriesData[0].length;
        barGroupNumber =  seriesData.length;      
        barHeight = 8 * (yScale.rangeBand()) / (9*barNumber +7 );
        
        var svg = (gWrapper = d3.select(this));
 
        //append decorativeShape bar
        if(decorativeShape === null){
          decorativeShape = d3.select(this).append('rect').attr('visibility', 'hidden').attr('width', width).attr('height',  yScale.rangeBand() - barHeight/2).attr(
              'fill', 'rgba(133,133,133, 0.2)');
        }else{
          decorativeShape.attr('width', width).attr('height',  yScale.rangeBand() - barHeight/2).attr('visibility', 'hidden');
        }
        
        if(defsEnter === null){
          defsEnter = svg.append('defs').append('clipPath').append('rect').attr('width', width).attr('height', height);    
        }else{
          defsEnter.attr('width', width).attr('height', height);
        }    
          
        if(roundCornerDefs === null){      
          roundCornerDefs = svg.append('defs');
        }else{
          if( dataStructureChange || sizeChange || dataValueChange || !enableRoundCorner){
            roundCornerDefs.remove();
            roundCornerDefs = svg.append('defs');
          }
        }
          
        var r = Math.log(barHeight)/Math.log(2);
        if( r < 0 ){
          enableRoundCorner = false;
        }
        var valueScale;
        var datashapesgroup = svg.selectAll('g.datashapesgroup');
        if(!TypeUtils.isExist(datashapesgroup[0][0])){
          datashapesgroup = svg.append('g').attr('class', 'datashapesgroup');
        }
        var barGroup = datashapesgroup.selectAll('g.bar').data(seriesData), lastBarGroupIndex = seriesData.length -1;
           barGroup.enter().append('g');
           barGroup.attr('class','bar').each( function (perBarGroup,i) {
                var barTransition, yArray = [];
                // wrap a datashape g for each rect
                var barShape = d3.select(this).selectAll('g.datashape').data(perBarGroup);
                    barShape.enter().append('g').attr('class','datashape').append('rect').attr('class', 'datapoint');
                    barShape.exit().remove();
                    barShape.attr('transform',function(perRectData, m){
                        var x;                   
                        valueScale = valueScales[perRectData.valueAxis];
                        if(perRectData.val < 0){
                          x =  valueScale(perRectData.val) ;
                        }else{
                          x = valueScale(0);
                        }
                        var y = yScale(i) + barHeight * (barNumber - m - 1);
                            y = y + barHeight/8 * (barNumber - m - 1) + barHeight /2;
                            
                        yArray.push(y);
                        return 'translate('+x+','+y+')';         
                    });
                var bar = barShape.select('rect.datapoint'), 
                    lastBarIndex = seriesData[0].length -1;
                

                bar.attr('fill',function(perRectData,i){
                      perRectData.fillColor = colorPalette [ i % colorPalette.length];
                      var parameter = {
                          drawingEffect:drawingEffect,
                          fillColor : perRectData.fillColor,
                          direction : 'vertical'
                      };
                      return effectManager.register(parameter);
                    })
                    .attr('shape-rendering','crispEdges').attr('fill-opacity', 1);

                  if(enableDataLoadingAnimation && !isOnlyInitAnimation ){
                    // [04 - Sep - 2012 Nick] DataStructureChange means the structure of data is changed. 
                    // It means the whole DOM nodes needed to be removed (handled by d3) and append new ones.
                    if(dataStructureChange){
                      bar.attr('y', function(perRectData, m){
                            var y = yScale(i) - yArray[m] + barHeight * (barNumber - m  - 1);
                            y = y + barHeight/8 * (barNumber - m - 1) + barHeight /2;
                            return  y;
                          })
                          .attr('x', function(perRectData){
                            valueScale = valueScales[perRectData.valueAxis];
                            if(perRectData.val  > 0){
                              return 0;
                            }else{
                              return valueScale(0) - valueScale(perRectData.val);
                            }
                           })
                           .attr('height', barHeight).attr('width', 0)
                           .attr('class', function(d, m){
                             return 'datapoint series-'+m;
                           });
                      
                      if(enableRoundCorner){
                        bar.attr('clip-path', function(perRectData, m){
                          var w = this.getAttribute('width'), h = this.getAttribute('height'),x = this.getAttribute('x'), y =this.getAttribute('y');
                          var id ='roundCorner-clip' + '-' + m + i  +  suffix;
                          roundCornerDefs.append('clipPath').attr('id', id)
                              .append('rect').attr('rx', r).attr('ry', r)
                              .attr('width', w + r).attr('height', barHeight).attr('y', y).attr('x',x)
                              .transition().delay(function(d,m){return (m + barNumber * i) * interval;})
                              .attr('x', function(){
                                valueScale = valueScales[perRectData.valueAxis];
                                if(perRectData.val < 0){
                                  return 0;
                                }else{
                                  return 0 - r;
                                }
                              })
                              .attr('width',  function(){
                                valueScale = valueScales[perRectData.valueAxis];
                                // [10 - Sep - 2012 Nick] if the value is invalid number, there is no bar but 
                                // the space is reserved
                                if(perRectData.val !== ' ' && perRectData.val !== 0){
                                  var width = Math.abs(valueScale(perRectData.val) - valueScale(0));
                                  // [10 - Sep - 2012 Nick] if the width of one bar is less than 1px, use 1px.
                                  return  width + r;
                                }else{
                                  return 0;
                                }
                              });
                        return 'url(#' + id + ')'; });
                      }
                  
                      var interval = totalIntervalTime / (barNumber * barGroupNumber);
                      barTransition = bar.transition();
                      barTransition.delay(function(d,m){return (m + barNumber * i) * interval;})
                        .attr('x', 0).attr('y', 0)
                        .attr('width',  function(perRectData){
                          valueScale = valueScales[perRectData.valueAxis];
                          // [10 - Sep - 2012 Nick] if the value is invalid number, there is no bar but 
                          // the space is reserved
                          if(perRectData.val !== ' ' && perRectData.val !== 0 ){
                            var width = Math.abs(valueScale(perRectData.val) - valueScale(0));
                            // [10 - Sep - 2012 Nick] if the width of one bar is less than 1px, use 1px.
                            return  width;
                          }else{
                            return 0;
                          }
                        })
                        .each('end', function(d, m){
                          if(m === lastBarIndex && i === lastBarGroupIndex){
                            completeAnimation();
                          }
                        });
                    }
                    // [04 - Sep - 2012 Nick] if the size of plot area is changed, re-scale chart
                    else if(sizeChange){
                      if(enableRoundCorner){
                        bar.attr('clip-path', function(perRectData, m){
                          var w = parseFloat(this.getAttribute('width')), h = this.getAttribute('height'),x = this.getAttribute('x'), y =this.getAttribute('y');
                          var id ='roundCorner-clip' + '-' + m + i  +  suffix;
                          roundCornerDefs.append('clipPath').attr('id', id)
                            .append('rect').attr('rx', r).attr('ry', r)
                            .attr('width', w + r).attr('height', h).attr('y', y).attr('x',x)
                            .transition().duration(totalIntervalTime)
                            .attr('x', function(){
                              if(perRectData.val < 0){
                                return  0;
                              }else{
                                return 0 - r;
                              }
                            })
                            .attr('width',  function(){
                              valueScale = valueScales[perRectData.valueAxis];
                              // [10 - Sep - 2012 Nick] if the value is invalid number, there is no bar but 
                              // the space is reserved
                              if(perRectData.val !== ' ' && perRectData.val !== 0){
                                var width = Math.abs(valueScale(perRectData.val) - valueScale(0));
                                // [10 - Sep - 2012 Nick] if the width of one bar is less than 1px, use 1px.
                                return width + r;
                              }else{
                                return 0;
                              }
                            })
                            .attr('height', barHeight)
                            .attr('y', 0);
                          return 'url(#' + id + ')'; });
                      }

                      barTransition = bar.transition();
                      barTransition.duration(totalIntervalTime)
                        .attr('x', 0).attr('y', 0)
                        .attr('width',  function(perRectData, m){
                          valueScale = valueScales[perRectData.valueAxis];
                          if(perRectData.val !== ' ' && perRectData.val !== 0){
                            var width = Math.abs(valueScale(perRectData.val) - valueScale(0));
                            // [10 - Sep - 2012 Nick] if the width of one bar is less than 1px, use 1px.
                            return width;
                          }else{
                            return 0;
                          }
                        })
                        .attr('height', barHeight)
                        .each('end', function(d, m){
                          if(m === lastBarIndex && i === lastBarGroupIndex){
                            completeAnimation();
                          }
                        });
                    }
                    else if(dataValueChange){
                      if(enableRoundCorner){
                        bar.attr('clip-path', function(perRectData, m){
                          var w = parseFloat(this.getAttribute('width')), h = this.getAttribute('height'),x = this.getAttribute('x'), y =this.getAttribute('y');
                          var id ='roundCorner-clip' + '-' + m + i  +  suffix;
                          roundCornerDefs.append('clipPath').attr('id', id)
                                .append('rect').attr('rx', r).attr('ry', r)
                                .attr('x',  - r).attr('width', w + r).attr('height', h).attr('y', y)
                                .transition().duration(totalIntervalTime)
                                .attr('width',  function(){
                                    valueScale = valueScales[perRectData.valueAxis];
                                  // [10 - Sep - 2012 Nick] if the value is invalid number, there is no bar but 
                                  // the space is reserved
                                    if(perRectData.val !== ' ' && perRectData.val !== 0){
                                    var width = Math.abs(valueScale(perRectData.val) - valueScale(0));
                                    // [10 - Sep - 2012 Nick] if the width of one bar is less than 1px, use 1px.
                                    return (width + r);
                                  }else{
                                    return 0;
                                  }
                                 })
                                .attr('height', barHeight)
                                .attr('y', function(){
                                  var y = yScale(i) + barHeight * (barNumber - m - 1);
                                  y = y + barHeight/8 * (barNumber - m - 1) + barHeight /2;
                                  return  y;
                                });
                          return 'url(#' + id + ')'; });
                      }
                      
                      //To seperate dataValueChange, as in size change, we calculate more than data value change.
                      //in value change, only change the width, in size, there are height width, y
                      barTransition = bar.transition();
                      barTransition.duration(totalIntervalTime)
                      .attr('width',  function(perRectData){
                        valueScale = valueScales[perRectData.valueAxis];
                        if(perRectData.val !== ' ' && perRectData.val !== 0){
                          var width = Math.abs(valueScale(perRectData.val) - valueScale(0));
                          // [10 - Sep - 2012 Nick] if the width of one bar is less than 1px, use 1px.
                          return width;
                        }else{
                          return 0;
                        }
                      })
                      .attr('x', 0).attr('y', 0)
                      .each('end', function(d, m){
                        if(m === lastBarIndex && i === lastBarGroupIndex){
                          completeAnimation();
                        }
                      });
                    }                      
                    else if(enableRoundCorner){
                      bar.attr('clip-path', function(perRectData, m){
                        var id = 'roundCorner-clip' + '-' + m + i + suffix;    
                        roundCornerDefs.append('clipPath').attr('id', id)
                          .append('rect').attr('rx', r).attr('ry', r)
                          .attr('width', function(){
                            valueScale = valueScales[perRectData.valueAxis];
                            // [10 - Sep - 2012 Nick] if the value is invalid number, there is no bar but 
                            // the space is reserved
                            if(perRectData.val !== ' ' && perRectData.val !== 0){
                              var width = Math.abs(valueScale(perRectData.val) - valueScale(0));
                              // [10 - Sep - 2012 Nick] if the width of one bar is less than 1px, use 1px.
                              return (width + r);
                            }else{
                              return 0;
                            }
                          })
                          .attr('height', barHeight)
                          .attr('y', 0)
                          .attr('x', function(){
                            valueScale = valueScales[perRectData.valueAxis];
                            if(perRectData.val < 0){
                              return  0;
                            }else{
                              return 0 - r;
                            }
                          });
                          return 'url(#' + id + ')';
                      });
                    }  
                  }
                  // [04 - Sep - 2012 Nick] if the animation is disabled
                  else{
                    bar.attr('width', function(perRectData){
                        valueScale = valueScales[perRectData.valueAxis];
                        if(perRectData.val !== ' ' && perRectData.val !== 0){
                          var width = Math.abs(valueScale(perRectData.val) - valueScale(0));
                          // [10 - Sep - 2012 Nick] if the width of one bar is less than 1px, use 1px.
                          return width;
                        }else{
                          return 0;
                        }
                      })
                      .attr('x', 0).attr('height', barHeight).attr('y', 0);
                    if(enableRoundCorner){
                      bar.attr('clip-path', function(perRectData, m){
                        var id = 'roundCorner-clip' + '-' + m + i + suffix;    
                        roundCornerDefs.append('clipPath').attr('id', id)
                          .append('rect').attr('rx', r).attr('ry', r)
                          .attr('width', function(){
                            valueScale = valueScales[perRectData.valueAxis];
                            // [10 - Sep - 2012 Nick] if the value is invalid number, there is no bar but 
                            // the space is reserved
                            if(perRectData.val !== ' ' && perRectData.val !== 0){
                              var width = Math.abs(valueScale(perRectData.val) - valueScale(0));
                              // [10 - Sep - 2012 Nick] if the width of one bar is less than 1px, use 1px.
                              return (width + r);
                            }else{
                              return 0;
                            }
                          })
                          .attr('height', barHeight)
                          .attr('y', 0)
                          .attr('x', function(){
                            valueScale = valueScales[perRectData.valueAxis];
                            if(perRectData.val < 0){
                              return  0;
                            }else{
                              return 0 - r;
                            }
                          });
                          return 'url(#' + id + ')';
                      });
                    }
                  }

//----------------call image fill functions-----------------------------------------------------
                //barItem: the datashape which has one rect and one defs
                //bar: the bar rect in the barItem
                //i: is group index
                //barHeight: the height of the bar

                if(properties.fillMode.image && !isDualAxis)
                {
                    imageFill(barShape, bar, i, barHeight);
                }
//----------------------------------------------------------------------------------------------
                 // bar.exit().remove();
              });

          barGroup.exit().remove();
        
        //reset status
        sizeChange = false, dataStructureChange = false, dataValueChange = false;
        });
        
        if(!enableDataLoadingAnimation){
          completeAnimation();
        }
        
        return chart;
      }
    
    function completeAnimation(){
        eDispatch.initialized();  
    }
    
    chart.afterUIComponentAppear = function(){
      eDispatch.initialized(); 
    };
    
    
    chart.dataLabel = function(label){
      if(!arguments.length){
        return label;
      }
      dataLabel = label;
    };
    /**
     * Mouse over 
     */
      chart.hoverOnPoint = function(point){
        var xOnModule = point.x, yOnModule = point.y;
      // find the closet dimension
      var i = -1;
      while (i < seriesData.length) {
        if (Math.abs(yOnModule - yScale.rangeBand()*i - 0.5 * yScale.rangeBand() ) <= 0.5 * yScale.rangeBand()) {
          break;
        }
        i++;
      }

      if (i > (seriesData.length - 1) || i < 0) {
        decorativeShape.attr(
            'visibility', 'hidden');
        return;
      }

      decorativeShape.attr(
          'y',
          yScale.rangeBand() * i + barHeight/4).attr(
          'visibility', 'visible');

      if(i !== lastHovered){
        if (tooltipVisible) {      
          lastHovered = i;
          //this.parentNode.parentNode.parentNode point to the main container
          var transform = gWrapper[0][0].getTransformToElement(gWrapper[0][0].ownerSVGElement);
          var yoffset = transform.f;
          
          var tData = tooltipDataHandlerObj.generateTooltipData(data, seriesData, barGroupNumber-1-i, colorPalette, shapePalette);
          tData.point = {
              x: d3.event.layerX,
              y: yScale.rangeBand()*i + 0.5 * yScale.rangeBand() + yoffset
          };
          tData.plotArea = {
            x : transform.e,
            y : transform.f,
            width : width,
            height : height
          };
          eDispatch.showTooltip(tooltipDataHandler.formatTooltipData(tData));
        }
      }
      };
      
      chart.parent = function(){
        return gWrapper;
      };
      
      chart.highlight = function(elems){
        if(elems instanceof Array){
          for(var i = 0, len = elems.length; i < len; i++){
            elems[i].setAttribute('fill-opacity', 1);
          }
        }else{
          elems.setAttribute('fill-opacity', 1);
        }
      };
      
      chart.unhighlight = function(elems){
        if(elems instanceof Array){
          for(var i = 0, len = elems.length; i < len; i++){
            elems[i].setAttribute('fill-opacity', 0.2);
          }
        }else{
          elems.setAttribute('fill-opacity', 0.2);
        }
      };
      
      chart.clear = function(gray){
        if( gray == null){
          gWrapper.selectAll('.datapoint').attr('fill-opacity', 1);
        }else{
          gWrapper.selectAll('.datapoint').attr('fill-opacity', 0.2);
        }
      };
      
      /**
       * TODO: add desc
       */
      chart.blurOut = function(){
        lastHovered = null;
        decorativeShape.attr('visibility', 'hidden');
      if (tooltipVisible) {      
        eDispatch.hideTooltip();
      }
      };
      
      /**
      * set/get width
      */
      chart.width = function(value){
          if (!arguments.length){
            return width;
          }
          sizeChange = (width === value)&&!sizeChange? false:true;
          width = value;
        if(TypeUtils.isExist(width) && TypeUtils.isExist(height)&& TypeUtils.isExist(seriesData)){
          makeScales();
        }
          return chart;
      };

      /**
      * set/get height
      */
      chart.height = function(value){
        if (!arguments.length){
          return height;
         }
        sizeChange = (height === value)&&!sizeChange? false:true;
        height = value;
        if(TypeUtils.isExist(width) && TypeUtils.isExist(height)&& TypeUtils.isExist(seriesData)){
          makeScales();
        }
         return chart;        
      };

      /**
      * set/get data, for some modules like Title, it doesn't need data
      */
      chart.data = function(value){
        if (!arguments.length){
          return data;
         }
        data = value;
        var obj = MNDHandler(data);
        
        data1 = obj["MG1"];
        data2 = obj["MG2"];
        measureOnAxis1 = obj.MG1Number;
        measureOnAxis2 = obj.MG2Number || 0;
        MNDInnerOnColor = obj.MNDOnColor && obj.MNDInner;
        
        if(TypeUtils.isExist(obj.color)){
          hasMNDonCategoryAxis = true;
          isDualAxis = true;
        }else{
          hasMNDonCategoryAxis = false;
          if(TypeUtils.isExist(data2)){
                isDualAxis = true;
            }else{
                isDualAxis = false;
            }
        }
        
        var _seriesData = dataTransform(data1, data2, obj.color);
        //judge what changed in dataset
        if(seriesData.length !== _seriesData.length || _seriesData[0].length !== seriesData[0].length){
          dataStructureChange = true;
        }else {
          dataValueChange = true;
        }
        seriesData = _seriesData;
        if(TypeUtils.isExist(width) && TypeUtils.isExist(height)){
          makeScales();
        }
      parseOptions();
         return chart;        
      };

      /**
      * set/get properties
      */
      chart.properties = function(props){
        if (!arguments.length){
          return properties;
         }
         Objects.extend(true, properties, props);
            parseOptions();
            
         return chart;        
      };
      
      /**
       * TODO: add desc
       */
      var makeScales = function(){
      var domain = [];
      valueScales = [];
      for (var i=0; i < seriesData.length; i++){
           domain.push(i);
        }
        yScale.domain(domain).rangeBands([height, 0]);
        //when data is all 0 or null, we make the xScale.domain(0,1)
        if(primaryAxisBottomBoundary === 0 && primaryAxisTopBoundary === 0){
          xScale.domain([0,1]).range([0, width]);
        }else{
          xScale.domain([primaryAxisBottomBoundary, primaryAxisTopBoundary]).range([0, width]);
        }
        if(TypeUtils.isExist(data2) || isDualAxis){
        //when data of second axis is all 0 or null, we make the xScale2 same with xScale .

          if(secondaryAxisTopBoundary === 0 && secondaryAxisBottomBoundary === 0){
            xScale2.domain(xScale.domain()).range(xScale.range());
          }else{
            xScale2.domain([secondaryAxisBottomBoundary, secondaryAxisTopBoundary]).range([0, width])
            //when data of first axis is all 0 or null, we make the xScale same with xScale2 .
            if(primaryAxisBottomBoundary === 0 && primaryAxisTopBoundary === 0){
              xScale.domain(xScale2.domain()).range(xScale2.range());
            }
          }
          if (!secondaryAxisManualRange && !primaryAxisManualRange)
          {
              Scaler.perfectDual(xScale, xScale2);
          }
          else if(!secondaryAxisManualRange && primaryAxisManualRange)
          {
              Scaler.perfect(xScale2);
          }
          else if (secondaryAxisManualRange && !primaryAxisManualRange)
          {
              Scaler.perfect(xScale);
          }
        } else { 
          if (!primaryAxisManualRange) {
            Scaler.perfect(xScale);
          }
          xScale2.range([0, 0]);
        }
        valueScales.push(xScale);
        valueScales.push(xScale2);
      };
      
      /**
       * TODO: add desc. please don't leave empty otherwise jsdoc will complain.
       */
      chart.categoryScale = function(scale){
        if (!arguments.length){
          return yScale;
         }
        yScale = scale;
         return chart;
      };
     
      chart.primaryScale = function(scale){
        if (!arguments.length){
          return xScale;
         }
        xScale = scale;
        valueScales[0] = xScale;
         return chart;
      };
      
      chart.secondScale = function(scale){
        if (!arguments.length){
          return xScale2;
         }
        xScale2 = scale;
        valueScales[1] = xScale2;
         return chart;
      };
      
      chart.primaryAxisColor = function(){
        if(isDualAxis && !hasMNDonCategoryAxis){
          return colorPalette[0];
        }else{
           //Jimmy/Nick/10/18/2012 we are telling axis to draw with default color
          return undefined;
        }
      };
      
      chart.secondAxisColor = function(){
        if(!hasMNDonCategoryAxis){
          return colorPalette[seriesData[0].length - 1];
        }else{
           //Jimmy/Nick/10/18/2012 we are telling axis to draw with default color
          return undefined;
        }
      };     
      
      chart.primaryDataRange = function(range){
        if (!arguments.length){
          return {
            min: primaryAxisBottomBoundary,
            max: primaryAxisTopBoundary
          };
        }
        if (range !== null) {
            primaryAxisTopBoundary = range.max;
            primaryAxisBottomBoundary = range.min;
            if (range.from === 'axis') {
                primaryAxisManualRange = true;
            }
            if(TypeUtils.isExist(width) && TypeUtils.isExist(height)){
              makeScales();
            }
        }
        return chart;
      };
      
      chart.secondDataRange = function(range){
        if (!arguments.length){
          return {
            min: secondaryAxisBottomBoundary,
            max: secondaryAxisTopBoundary
          };
        }
        if (range !== null) {
            secondaryAxisTopBoundary = range.max;
            secondaryAxisBottomBoundary = range.min;
            if (range.from === 'axis') {
                secondaryAxisManualRange = true;
            }
            if(TypeUtils.isExist(width) && TypeUtils.isExist(height)){
              makeScales();
            }
        }
        return chart;
      };      
      
      /**
      * get preferred size
      * @return {
          'width': NUMBER,
          'height' : NUMBER
        }
      */
      chart.getPreferredSize = function(){
        
      };
      
      /**
     * get/set your event dispatch if you support event
     */
      chart.dispatch = function(_){
        if(!arguments.length){
          return eDispatch;
        }
        eDispatch = _;
        return this;
      };
      
      /**
      * get/set your color palette if you support color palette
      */
      chart.colorPalette = function(_){
        if(!arguments.length){
          return colorPalette;
        }
        colorPalette = _;
        return this;
      };        
        // chart.primaryValuesColorPalette = function(_){
            // if(!arguments.length){
                // return axis1ColorPalette;
            // }  
            // axis1ColorPalette = _;
            // return this;
        // };
// 
        // chart.secondaryValuesColorPalette = function(_){
            // if(!arguments.length){
                // return axis2ColorPalette;
            // }  
            // axis2ColorPalette = _;
            // return this;
        // };        

      /**
      * get/set your shape Palette if you support shape Palette
      */
      chart.shapePalette = function(_){
        if(!arguments.length){
          return shapePalette;
        }
        shapePalette = _;
        return this;
      };
      
      chart.primaryAxisTitle = function(_){
        if(!arguments.length){
          var titles =  data.getMeasureValuesGroupDataByIdx(0), title = [];
          if(titles){
            for(var i=0, len =titles.values.length; i< len;i++ ){
                if (titles.values[i].col !== null && titles.values[i].col !== undefined)
                {
                    title.push(titles.values[i].col);
                }
                else
                {
                    title.push(langManager.get('IDS_ISNOVALUE'));
                }
            }
          }
          return title.join('/');
        }
        return this;
      };
      
      chart.secondAxisTitle = function(_){
        if(!arguments.length){
          var titles =  data.getMeasureValuesGroupDataByIdx(1), title = [];
          if(titles){
            for(var i=0, len =titles.values.length; i< len;i++ ){
                if (titles.values[i].col !== null && titles.values[i].col !== undefined)
                {
                    title.push(titles.values[i].col);
                }
                else
                {
                    title.push(langManager.get('IDS_ISNOVALUE'));
                }
            }
          }
          return title.join('/');
        }
        return this;
      };
//      var dataTransform = function(data1,data2){
//        var barGroups = [];
//      // the number of bar in each group
//      var barGroupNumber =  data1[0].length;
//      var barGroup = [];
//      for(var i=0; i<data1.length; i++){
//        var temp = d3.max(data1[i], function(m){return m.val;});
//        var temp2 = d3.min(data1[i], function(m){return m.val;});
//        if(primaryAxisTopBoundary <temp){
//          primaryAxisTopBoundary = temp;
//        }
//        if(primaryAxisBottomBoundary > temp2){
//            primaryAxisBottomBoundary = temp2;
//        }
//          barGroup.push(data1[i]);
//        }
//      if(data2 != undefined){
//      
//        for(i=0; i<data2.length; i++){
//          var temp = d3.max(data2[i], function(m){return m.val;});
//          var temp2 = d3.min(data2[i], function(m){return m.val;});
//          if(secondaryAxisTopBoundary < temp){
//            secondaryAxisTopBoundary = temp;
//          }
//          if(secondaryAxisBottomBoundary > temp2){
//              secondaryAxisBottomBoundary = temp2;
//          }
//          barGroup.push(data2[i]);
//        }
//      }
//       
//      for(var j=0; j < barGroupNumber; j++){
//        var ds = [];
//        for(i=0; i< barGroup.length; i++){
//          ds.push(barGroup[i][j]);
//        }
//        barGroups.push(ds);
//      }
//     
//        return barGroups;
//      };
      
      var dataTransform = function(valueAxis1,valueAxis2, colorIndexArray){
        primaryAxisTopBoundary = primaryAxisBottomBoundary = 0;
        secondaryAxisTopBoundary = secondaryAxisBottomBoundary = 0;
        var barGroups = [];
      // the number of bar in each group
        var barGroupNumber = 0;
        
        if (valueAxis1[0] && valueAxis1[0].length) {
            barGroupNumber =  valueAxis1[0].length;
        } else if (valueAxis2[0] && valueAxis2[0].length){
            barGroupNumber =  valueAxis2[0].length;
        }
      var barGroup = [];
      var temp = 0, temp2 = 0;
      var i = 0, j = 0;
      for(i=0; i < valueAxis1.length; i++){
        if(hasMNDonCategoryAxis){
          for(j = 0;  j< valueAxis1[i].length; j++){
            if(colorIndexArray[j] === 0){
              temp = valueAxis1[i][j].val;
              valueAxis1[i][j].valueAxis = 0;
              
              if(primaryAxisTopBoundary <temp){
                primaryAxisTopBoundary = temp;
              }
              if(primaryAxisBottomBoundary > temp){
                primaryAxisBottomBoundary = temp;
              }
              indexforSecondaryAxis++;
            }else{
              temp2 = valueAxis1[i][j].val;
              valueAxis1[i][j].valueAxis = 1;
              
              if(secondaryAxisTopBoundary < temp2){
                secondaryAxisTopBoundary = temp2;
              }
              if(secondaryAxisBottomBoundary > temp2){
                  secondaryAxisBottomBoundary = temp2;
              }
            }
          }
        }else{
          temp = d3.max(valueAxis1[i], function(m){return m.val;});
          temp2 = d3.min(valueAxis1[i], function(m){return m.val;});
          
          if(primaryAxisTopBoundary <temp){
            primaryAxisTopBoundary = temp;
          }
          if(primaryAxisBottomBoundary > temp2){
            primaryAxisBottomBoundary = temp2;
          }
        }
        barGroup.push(valueAxis1[i]);
          
        }
      if(valueAxis2 !== undefined){
        for(i=0; i<valueAxis2.length; i++){
          temp = d3.max(valueAxis2[i], function(m){return m.val;});
          temp2 = d3.min(valueAxis2[i], function(m){return m.val;});
          
          if(secondaryAxisTopBoundary < temp){
            secondaryAxisTopBoundary = temp;
          }
          if(secondaryAxisBottomBoundary > temp2){
              secondaryAxisBottomBoundary = temp2;
          }
          barGroup.push(valueAxis2[i]);
        }
      }
      
      for(j=0; j < barGroupNumber; j++){
        var ds = [];
        for(i=0; i< barGroup.length; i++){
          if(!hasMNDonCategoryAxis){
            if( i < valueAxis1.length){
              barGroup[i][j].valueAxis = 0;
            }else{
              barGroup[i][j].valueAxis = 1;
            }
          }
          if(NumberUtils.isNoValue(barGroup[i][j].val)){
            barGroup[i][j].val = ' ';
          }
          ds.push(barGroup[i][j]);
        }
        if(MNDInnerOnColor){
          var dSet = [], flag1=0, flag2=0;
          var n=0;
          for(var m=0; m < valueAxis1.length; m++){
            dSet.push(ds[m]);
            flag1++;
            if(flag1 === measureOnAxis1 && valueAxis2 !== undefined){
              flag2 = 0;
              for(; n<valueAxis2.length; n++){
                if(flag2 >= measureOnAxis2){
                  flag1 = 0;
                  break;
                }
                dSet.push(ds[valueAxis1.length+n]);
                flag2++;
              }
            }
          }
          barGroups.push(dSet);
        }else{
          barGroups.push(ds);
        }
      }
     
        return barGroups;
      };      
      
    properties = manifest.props(null);
      return chart;
  };
  return bar;
});