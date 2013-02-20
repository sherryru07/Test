sap.riv.module(
{
  qname : 'sap.viz.modules.util.tooltipDataHandler',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.data.feed.feeder',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.Constants',
  version : '4.0.0'
}
],
function Setup(feeder, langManager, Constants) {
  var tooltipDataHandler = function() {
    var _buffer = [];

    var my = {};

    var defaultString = langManager.get('IDS_ISNOVALUE');

    var handleNull = function(_) {
      if (_ === null || _ === undefined) {
        return defaultString;
      } else {
        return _;
      }
    };

    /**
     * 
     * @param data
     * @param seriesData
     * @param aai1
     * @param colorPalette
     * @param shapePalette
     * @param postProcess
     *          {Function} you can round the data or other thing.
     * @returns TOOD: add desc
     */
    my.generateTooltipData = function(data, seriesData, aai1, colorPalette,
        shapePalette, postProcess) {

      var parseFeedsData = function(data) {
        var barGroupValue;
        var isStacked = false;
        if (seriesData[aai1][0] !== undefined && seriesData[aai1][0].length > 0) {
          barGroupValue = d3.merge([ seriesData[aai1][0], seriesData[aai1][1] ]);
          isStacked = true;
        } else {
          barGroupValue = seriesData[aai1];
        }

        var tooltipData = {
          'body' : [],
          'footer' : []
        };
        var valueLength = barGroupValue.length;
        var isDual = false;
        var division = 0;
        var mvgData = [data.getMeasureValuesGroupDataByIdx(0), data.getMeasureValuesGroupDataByIdx(1)];
        var aaData = [data.getAnalysisAxisDataByIdx(0), data.getAnalysisAxisDataByIdx(1)];
        var MNDHandler = mndHandler(aaData);
        
        if (mvgData[0] && mvgData[1]) {
          isDual = true;
          division = mvgData[0].values.length;
        }
        var isMNDbeforeCate = false;
        var MNDLength;
        var i = 0, j = 0, k = 0,len;
        var measureIndex;
        var body;
        var valueIndex;
        var itemLabel;
        var item;
        var footer;

        if (!MNDHandler.hasMNDonCate && !MNDHandler.hasMNDonColor) {
          // MND does not feed on either category or color

          if (aaData[1]) {
            measureIndex = 0;
            if (mvgData[0]) {
              for ( i = 0; i < mvgData[0].values.length; ++i) {
                body = {
                  'name' : handleNull(mvgData[0].values[i].col),
                  'val' : []
                };
                for ( j = 0, len = mvgData[0].values[i].rows.length; j < len; ++j) {
                  valueIndex = measureIndex * len + j;
                  itemLabel = [];
                  for ( k = 0; k < aaData[1].values.length; ++k) {
                    itemLabel.push(aaData[1].values[k].rows[j]);
                  }
                  item = {
                    'shape' : shapePalette[valueIndex % shapePalette.length],
                    'color' : colorPalette[valueIndex % colorPalette.length],
                    'label' : itemLabel,
                    'value' : barGroupValue[valueIndex].val === ' ' ? defaultString
                        : postProcess === undefined ? handleNull(barGroupValue[valueIndex].val)
                            : postProcess(barGroupValue[valueIndex].val),
                     'valueAxis' : 0
                  };
                  body.val.push(item);
                }
                tooltipData.body.push(body);
                ++measureIndex;
              }
            }
            // for dual chart
            if (mvgData[1]) {
              for ( i = 0; i < mvgData[1].values.length; ++i) {
                body = {
                  'name' : handleNull(mvgData[1].values[i].col),
                  'val' : []
                };
                for ( j = 0, len = mvgData[1].values[i].rows.length; j < len; ++j) {
                  valueIndex = measureIndex * len + j;
                  itemLabel = [];
                  for ( k = 0; k < aaData[1].values.length; ++k) {
                    itemLabel.push(aaData[1].values[k].rows[j]);
                  }
                  item = {
                    'shape' : shapePalette[valueIndex % shapePalette.length],
                    'color' : colorPalette[valueIndex % colorPalette.length],
                    'label' : itemLabel,
                    'value' : barGroupValue[valueIndex].val === ' ' ? defaultString
                        : postProcess === undefined ? handleNull(barGroupValue[valueIndex].val)
                            : postProcess(barGroupValue[valueIndex].val),
                     'valueAxis' : 1
                  };
                  body.val.push(item);
                }
                tooltipData.body.push(body);
                ++measureIndex;
              }
            }
          } else {
            body = {
              'name' : handleNull(mvgData[0].values[0].col),
              'val' : []
            };
            item = {
              'shape' : shapePalette[0 % shapePalette.length],
              'color' : colorPalette[0 % colorPalette.length],
              'label' : null,
              'value' : barGroupValue[0].val === ' ' ? defaultString
                  : postProcess === undefined ? handleNull(barGroupValue[0].val)
                      : postProcess(barGroupValue[0].val),
               'valueAxis' : 0
            };
            body.val.push(item);
            tooltipData.body.push(body);
          }
          for (i = 0, len = aaData[0].values.length; i < len; ++i) {
            footer = {
              'label' : aaData[0].values[i].col,
              'value' : aaData[0].values[i].rows[aai1]
            };
            tooltipData.footer.unshift(footer);
          }

        } else if (MNDHandler.hasMNDonColor) {
          // MND feeds on color
          for (i = 0; i < aaData[1].values.length; ++i) {
            if (aaData[1].values[i].type === 'MND') {
              MNDLength = aaData[1].values[i].rows.length;
              if (i === 0) {
                isMNDbeforeCate = true;
              }
              break;
            }
          }

          measureIndex = 0;
          var colorIndex;
          if (mvgData[0]) {
            for (i = 0; i < mvgData[0].values.length; ++i) {
              body = {
                'name' : handleNull(mvgData[0].values[i].col),
                'val' : []
              };
              for (j = 0, len = mvgData[0].values[i].rows.length; j < len; ++j) {
                colorIndex = undefined;
                if (isMNDbeforeCate){
                  valueIndex = measureIndex * len + j;
                }
                else if (!isStacked || !isDual){
                  valueIndex = j * MNDLength + measureIndex;
                }
                else {
                  valueIndex = j * division + measureIndex;
                  colorIndex = j * MNDLength + measureIndex;
                }
                itemLabel = [];
                for (k = 0; k < aaData[1].values.length; ++k) {
                  if (aaData[1].values[k].type !== 'MND') {
                    itemLabel.push(aaData[1].values[k].rows[j]);
                  }
                }
                item = {
                  'shape' : colorIndex !== undefined ? shapePalette[colorIndex  % shapePalette.length] 
                : shapePalette[valueIndex % shapePalette.length],
                  'color' : colorIndex !== undefined ? colorPalette[colorIndex % colorPalette.length] 
                  : colorPalette[valueIndex % colorPalette.length],
                  'label' : itemLabel,
                  'value' : barGroupValue[valueIndex].val === ' ' ? defaultString
                      : postProcess === undefined ? handleNull(barGroupValue[valueIndex].val)
                          : postProcess(barGroupValue[valueIndex].val),
                   'valueAxis' : 0
                };
                body.val.push(item);
              }
              tooltipData.body.push(body);
              ++measureIndex;
            }
          }
          // for dual chart
          if (mvgData[1]) {
            for (i = 0; i < mvgData[1].values.length; ++i) {
              body = {
                'name' : handleNull(mvgData[1].values[i].col),
                'val' : []
              };
              for (j = 0, len = mvgData[1].values[i].rows.length; j < len; ++j) {
                colorIndex = undefined;
                if (isMNDbeforeCate){
                  valueIndex = measureIndex * len + j;
                }
                else if (!isStacked || !isDual){
                  valueIndex = j * MNDLength + measureIndex;
                }
                else {
                  valueIndex = j * (MNDLength - division) + measureIndex - division + parseInt(valueLength * division / MNDLength, 10);
                  colorIndex = j * MNDLength + measureIndex;
                }

                itemLabel = [];
                for (k = 0; k < aaData[1].values.length; ++k) {
                  if (aaData[1].values[k].type !== 'MND') {
                    itemLabel.push(aaData[1].values[k].rows[j]);
                  }
                }
                item = {
                  'shape' : colorIndex !== undefined ? shapePalette[colorIndex % shapePalette.length] 
                : shapePalette[valueIndex  % shapePalette.length],
                  'color' : colorIndex !== undefined ? colorPalette[colorIndex % colorPalette.length] 
                  : colorPalette[valueIndex % colorPalette.length],
                  'label' : itemLabel,
                  'value' : barGroupValue[valueIndex].val === ' ' ? defaultString
                      : postProcess === undefined ? handleNull(barGroupValue[valueIndex].val)
                          : postProcess(barGroupValue[valueIndex].val),
                   'valueAxis' : 1
                };
                body.val.push(item);
              }
              tooltipData.body.push(body);
              ++measureIndex;
            }
          }
          for (i = 0, len = aaData[0].values.length; i < len; ++i) {
            footer = {
              'label' : aaData[0].values[i].col,
              'value' : aaData[0].values[i].rows[aai1]
            };
            tooltipData.footer.unshift(footer);
          }

        } else {
          // MND feeds on category axis
          var bodyName = null;
          var categoryLength;
          for (i = 0; i < aaData[0].values.length; ++i) {
            if (aaData[0].values[i].type === 'MND') {
              MNDLength = aaData[0].values[i].rows.length;
              var groupCount = 0;
              if (seriesData.length !== undefined) {
                groupCount = seriesData.length;
              } else {
                for (j in seriesData) {
                  if (seriesData.hasOwnProperty(j)){
                    ++groupCount;
                  }
                }
              }

              categoryLength = groupCount / MNDLength;
              if (i === 0) {
                isMNDbeforeCate = true;
                bodyName = aaData[0].values[i].rows[parseInt(aai1 / categoryLength, 10)];
              } else {
                // isMNDbeforeCate = false;
                bodyName = aaData[0].values[i].rows[aai1 % MNDLength];
              }
              break;
            }
          }
          body = {
            'name' : bodyName,
            'val' : []
          };

          if (aaData[1]) {
            // there exists color feeds.
            // var measureIndex = 0;
            if (mvgData[0]) {
              for (j = 0, len = mvgData[0].values[0].rows.length; j < len; ++j) {
                valueIndex = j;
                itemLabel = [];
                for (k = 0; k < aaData[1].values.length; ++k) {
                  itemLabel.push(aaData[1].values[k].rows[j]);
                }
                item = {
                  'shape' : shapePalette[valueIndex % shapePalette.length],
                  'color' : colorPalette[valueIndex % colorPalette.length],
                  'label' : itemLabel,
                  'value' : barGroupValue[valueIndex].val === ' ' ? defaultString
                      : postProcess === undefined ? handleNull(barGroupValue[valueIndex].val)
                          : postProcess(barGroupValue[valueIndex].val),
                   'valueAxis' : 0
                };
                body.val.push(item);
              }
            }
          } else {
            // otherwise...
            item = {
              'shape' : shapePalette[0 % shapePalette.length],
              'color' : colorPalette[0 % colorPalette.length],
              'label' : null,
              'value' : barGroupValue[0].val === ' ' ? defaultString
                  : postProcess === undefined ? handleNull(barGroupValue[0].val)
                      : postProcess(barGroupValue[0].val),
               'valueAxis' : 0
            };
            body.val.push(item);
          }
          tooltipData.body.push(body);
          for (i = 0, len = aaData[0].values.length; i < len; ++i) {
            if (aaData[0].values[i].type !== 'MND') {
              footer = {
                'label' : aaData[0].values[i].col,
                'value' : null
              };
              if (isMNDbeforeCate) {
                footer.value = aaData[0].values[i].rows[aai1  % categoryLength];
              } else {
                footer.value = aaData[0].values[i].rows[parseInt(aai1 / MNDLength, 10)];
              }
              tooltipData.footer.unshift(footer);
            }
          }

        }
        return tooltipData;
      };

      var help = function(index) {
        if (_buffer[index] === undefined) {
          _buffer[index] = parseFeedsData(data);
        }
        return _buffer[index];
      };

      return help(aai1);
    };
    return my;
  };

  function mndHandler(aaData) {
    var hasMNDonCate = false;
    var j, len;
    if (aaData[0]){
      for (j = 0, len = aaData[0].values.length; j < len; ++j){
        if (aaData[0].values[j].type && aaData[0].values[j].type === 'MND'){
          hasMNDonCate = true;
        }
      }
    }
     var hasMNDonColor = false;
    if (!hasMNDonCate) {
      if (aaData[1]){
        for (j = 0, len = aaData[1].values.length; j < len; ++j){
          if (aaData[1].values[j].type && aaData[1].values[j].type === 'MND'){
            hasMNDonColor = true;
          }
        }
      }
    }
    return {
      hasMNDonCate : hasMNDonCate,
      hasMNDonColor : hasMNDonColor
    };
  }

  tooltipDataHandler.formatTooltipData = function(data) {
    var tooltipEventData = {
      name : Constants.Module.Event.TooltipShow.name,
      data : data
    };
    return tooltipEventData;
  };

  tooltipDataHandler.dataTransform = function(obj) {
    var data1 = obj['MG1'];
    var data2 = obj['MG2'];

    var transferredDataSet = [];
    var i, j;
    if (obj.hasMND && obj.MNDOnColor && obj.MNDInner) {
      var mg1mnum = 0, mg2mnum = 0, colorAxisDataNum = 0;
      if (obj['MG1Number']) {
        mg1mnum = obj['MG1Number'];
        colorAxisDataNum = data1.length / mg1mnum;
      }
      if (obj['MG2Number']) {
        mg2mnum = obj['MG2Number'];
        colorAxisDataNum = data2.length / mg2mnum;
      }

      for (i = 0; i < colorAxisDataNum; i++) {
        for (j = 0; j < mg1mnum; j++) {
          transferredDataSet.push(data1[i * mg1mnum + j]);
        }
        for (j = 0; j < mg2mnum; j++) {
          transferredDataSet.push(data2[i * mg2mnum + j]);
        }
      }
    } else {
      if (data1) {
        for (i = 0; i < data1.length; i++) {
          transferredDataSet.push(data1[i]);
        }
      }
      if (data2) {
        for (i = 0; i < data2.length; i++) {
          transferredDataSet.push(data2[i]);
        }
      }
    }

    var stackedBarGroup = [];
    // the number of bar in each group
    var barGroupNumber;
    if (data1.length !== 0) {
      barGroupNumber = data1[0].length;
    } else {
      barGroupNumber = data2[0].length;
    }
    for ( j = 0; j < barGroupNumber; j++) {
      var ds = [];
      for (i = 0; i < transferredDataSet.length; i++) {
        ds.push(transferredDataSet[i][j]);
      }
      stackedBarGroup.push(ds);
    }

    return stackedBarGroup;
  };

  return tooltipDataHandler;
});