sap.riv.module(
{
  qname : 'sap.viz.modules.piewithdepth',
  version : '4.0.0',
  exported : true
},
[
{
  qname : 'sap.viz.modules.pie.sector',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.pie.selection',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.pie.tooltip',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.TextUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.ColorSeriesGenerator',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.dispatch',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.UADetector',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.Repository',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
},
{  qname : 'sap.viz.format.FormatManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.lang.langManager',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.BoundUtil',
  version : '4.0.0'
}
],
function Setup(sectorModule, selectionModule, tooltip, TextUtils,
    ColorSeriesGenerator, dispatch, UADetector, FunctionUtils, TypeUtils,
    Repository, Objects, formatManager, langManager, BoundUtil) {

    var fn = function(manifest) {
        var width = 500, height = 300, padding = 0;
        var data = null, props = {};
        var zAngle = Math.PI / 4;
        var rx = 0, ry = 0, drx = 0, dry = 0, baseHeight = 0, bottomCX = 0, bottomCY = 0;
        var heightScale = d3.scale.linear();
        var color = ColorSeriesGenerator.sap32().range();
        var isDonut = false;
        var _selection;
        var rotationAngle = 0;
        var _dispatch = dispatch('initialized', 'startToInit');

        function pie(selection) {
            BoundUtil.drawBound(selection, width, height);
            _selection = selection;
            renderChart(selection);
            return pie;
        }


        pie.width = function(value) {
            if (!arguments.length) {
                return width;
            }
            width = value;
            if (TypeUtils.isExist(width) && TypeUtils.isExist(height)) {
                getPieLayout();
                if (_selection) {
                    renderChart(_selection);
                }
            }
            return pie;
        };

        pie.height = function(value) {
            if (!arguments.length) {
                return height;
            }
            height = value;
            if (TypeUtils.isExist(width) && TypeUtils.isExist(height)) {
                getPieLayout();
                if (_selection) {
                    renderChart(_selection);
                }
            }
            return pie;
        };

        pie.padding = function(value) {
            if (!arguments.length) {
                return padding;
            }
            padding = value;
            if (TypeUtils.isExist(width) && TypeUtils.isExist(height)) {
                getPieLayout();
                if (_selection) {
                    renderChart(_selection);
                }
            }
            return pie;
        };

        pie.properties = function(_) {
            if (!arguments.length) {
                return props;
            }
            Objects.extend(true, props, _);
            parseOptions();
            return pie;
        };

        pie.parent = function() {
            return _selection;
        };
        
        pie.dispatch = function(_) {
            return _dispatch;
        };
        
        pie.afterUIComponentAppear = function(){
          _dispatch.initialized(); 
        };
        
        pie.dataLabel = function(_) {
        };

        pie.data = function(value) {
            if (!arguments.length) {
                return data;
            }
            data = value;
            return pie;
        };
        
        pie.colorPalette = function(_) {
            if (arguments.length === 0) {
                return color;
            }
            color = _;
            return pie;
        }; 
        
        pie.rotate = function(_) {
            if (arguments.length === 0) {
                return {
                    xAngle : 0,
                    yAngle : rotationAngle * 180 / Math.PI
                };
            }
            rotationAngle = _.yAngle * Math.PI / 180;
            renderChart(_selection);
            return pie;
        };


        function parseOptions() {
            color = props.colorPalette;
            isDonut = props.isDonut;
        };

        function getPieLayout() {
            var base = Math.min(width, height);
            rx = base / 2;
            ry = rx * Math.cos(zAngle);
            drx = rx / 2.414;
            dry = ry / 2.414;
            bottomCX = width / 2;
            bottomCY = height / 2 + base / 2 - ry;
            baseHeight = base - 2 * ry;
        };

        function renderChart(selection) {
            selection.select('.datashapesgroup').remove();
            var sectors = prepareData();
            var g = selection.append('g').attr('class', 'datashapesgroup');
            renderSectors(sectors, g);
        };

        function prepareData() {
            var sectorFeed = data.getMeasureValuesGroupDataByIdx(0);
            var depthFeed = data.getMeasureValuesGroupDataByIdx(1);

            var sum = 0, maxDepthVal = 0;
            for (var i = 0; i < sectorFeed.values[0].rows[0].length; i++) {
                sum += Math.abs(sectorFeed.values[0].rows[0][i].val);
                maxDepthVal = Math.max(maxDepthVal, Math.abs(depthFeed.values[0].rows[0][i].val));
            }

            heightScale.domain([0, maxDepthVal]).range([0, baseHeight]);
            var result = [];
            for (var i = 0, lastAngle = rotationAngle - Math.PI / 2; i < sectorFeed.values[0].rows[0].length; i++) {
                var obj = {
                    startAngle : lastAngle,
                    endAngle : lastAngle + Math.abs(sectorFeed.values[0].rows[0][i].val) / sum * Math.PI * 2,
                    cy : bottomCY - heightScale(Math.abs(depthFeed.values[0].rows[0][i].val)),
                    colorValue : color[i % color.length],
                    val : [
                        sectorFeed.values[0].rows[0][i].val,
                        depthFeed.values[0].rows[0][i].val
                    ],
                    ctx : [
                        sectorFeed.values[0].rows[0][i].ctx,
                        depthFeed.values[0].rows[0][i].ctx
                    ]
                };
                obj.topPoint1 = [bottomCX + rx * Math.cos(obj.startAngle), obj.cy + ry * Math.sin(obj.startAngle)];
                obj.topPoint2 = [bottomCX + rx * Math.cos(obj.endAngle), obj.cy + ry * Math.sin(obj.endAngle)];
                obj.bottomPoint1 = [bottomCX + rx * Math.cos(obj.startAngle), bottomCY + ry * Math.sin(obj.startAngle)];
                obj.bottomPoint2 = [bottomCX + rx * Math.cos(obj.endAngle), bottomCY + ry * Math.sin(obj.endAngle)];
                
                if (isDonut) {
                    obj.topPoint4 = [bottomCX + drx * Math.cos(obj.startAngle), obj.cy + dry * Math.sin(obj.startAngle)];
                    obj.topPoint3 = [bottomCX + drx * Math.cos(obj.endAngle), obj.cy + dry * Math.sin(obj.endAngle)];
                    obj.bottomPoint4 = [bottomCX + drx * Math.cos(obj.startAngle), bottomCY + dry * Math.sin(obj.startAngle)];
                    obj.bottomPoint3 = [bottomCX + drx * Math.cos(obj.endAngle), bottomCY + dry * Math.sin(obj.endAngle)];
                }

                result.push(obj);
                lastAngle = obj.endAngle;
            }
            return result;
        };

        function renderSectors(sectors, g) {
            // sort sectors to handle cover relationship
            sectors.sort(function(a, b) {
                var asa = getSimpleAngle(a.startAngle);
                var aea = getSimpleAngle(a.endAngle);
                var bsa = getSimpleAngle(b.startAngle);
                var bea = getSimpleAngle(b.endAngle);
                
                if (asa < Math.PI / 2 && aea > Math.PI / 2
                    || asa < Math.PI / 2 && aea < asa
                    || asa > Math.PI / 2 && aea > Math.PI / 2 && aea < asa) {
                    return 1;
                }
                if (bsa < Math.PI / 2 && bea > Math.PI / 2
                    || bsa < Math.PI / 2 && bea < bsa
                    || bsa > Math.PI / 2 && bea > Math.PI / 2 && bea < bsa) {
                    return -1;
                }
                if (aea < asa) {
                    return -1;   
                }
                if (bea < bsa) {
                    return 1;
                }
                return Math.max(a.bottomPoint1[1], a.bottomPoint2[1]) - Math.max(b.bottomPoint1[1], b.bottomPoint2[1]);
            });
            
            for (var i = 0; i < sectors.length; i++) {
                var sectorWrapper = g.append('g').attr('class', 'datashape');
                if (isDonut) {
                    renderDonutSide(sectors[i], sectorWrapper);
                    renderSectorCylinder(sectors[i], sectorWrapper);
                    renderDonutTop(sectors[i], sectorWrapper);
                } else {
                    renderSectorSide(sectors[i], sectorWrapper);
                    renderSectorCylinder(sectors[i], sectorWrapper);
                    renderSectorTop(sectors[i], sectorWrapper);
                }
                
            }
            
            _dispatch.initialized({
                name : 'initialized'
            });
        };
        
        function getSimpleAngle(angle) {
            if (angle >= - Math.PI / 2 && angle <= Math.PI / 2 * 3) {
                return angle;
            } else if (angle < - Math.PI / 2) {
                return getSimpleAngle(2 * Math.PI + angle);
            } else if (angle > Math.PI / 2 * 3) {
                return getSimpleAngle(angle - 2 * Math.PI);
            }
        };
        
        function getDarkColor(color) {
            var hsl = d3.rgb(color).hsl();
            return d3.hsl(hsl.h, hsl.s, hsl.l * 0.9).rgb().toString();
        };
        
        function renderSectorSide(sector, g) {
            var topPoint1, bottomPoint1, topPoint2, bottomPoint2;
            if (sector.bottomPoint1[1] >= sector.bottomPoint2[1]) {
                topPoint1 = sector.topPoint2;
                bottomPoint1 = sector.bottomPoint2;
                topPoint2 = sector.topPoint1;
                bottomPoint2 = sector.bottomPoint1;
            } else {
                topPoint1 = sector.topPoint1;
                bottomPoint1 = sector.bottomPoint1;
                topPoint2 = sector.topPoint2;
                bottomPoint2 = sector.bottomPoint2;
            }
            var def = 'M' + bottomCX + ',' + bottomCY
                    + 'L' + bottomCX + ',' + sector.cy
                    + 'L' + topPoint1[0] + ',' + topPoint1[1]
                    + 'L' + bottomPoint1[0] + ',' + bottomPoint1[1] + 'z';
            g.append('path').attr('d', def).attr('fill', getDarkColor(sector.colorValue));
            def = 'M' + bottomCX + ',' + bottomCY
                    + 'L' + bottomCX + ',' + sector.cy
                    + 'L' + topPoint2[0] + ',' + topPoint2[1]
                    + 'L' + bottomPoint2[0] + ',' + bottomPoint2[1] + 'z';
            g.append('path').attr('d', def).attr('fill', getDarkColor(sector.colorValue));
        };
        
        function renderDonutSide(sector, g) {
            var topPoint1, topPoint2, topPoint3, topPoint4, bottomPoint1, bottomPoint2, bottomPoint3, bottomPoint4;
            if (sector.bottomPoint1[1] >= sector.bottomPoint2[1]) {
                topPoint1 = sector.topPoint2;
                topPoint2 = sector.topPoint3;
                topPoint3 = sector.topPoint1;
                topPoint4 = sector.topPoint4;
                bottomPoint1 = sector.bottomPoint2;
                bottomPoint2 = sector.bottomPoint3;
                bottomPoint3 = sector.bottomPoint1;
                bottomPoint4 = sector.bottomPoint4;
            } else {
                topPoint1 = sector.topPoint1;
                topPoint2 = sector.topPoint4;
                topPoint3 = sector.topPoint2;
                topPoint4 = sector.topPoint3;
                bottomPoint1 = sector.bottomPoint1;
                bottomPoint2 = sector.bottomPoint4;
                bottomPoint3 = sector.bottomPoint2;
                bottomPoint4 = sector.bottomPoint3;
            }
            var def = 'M' + topPoint1[0] + ',' + topPoint1[1]
                    + 'L' + topPoint2[0] + ',' + topPoint2[1]
                    + 'L' + bottomPoint2[0] + ',' + bottomPoint2[1]
                    + 'L' + bottomPoint1[0] + ',' + bottomPoint1[1] + 'z';
            g.append('path').attr('d', def).attr('fill', getDarkColor(sector.colorValue));
            
            renderDonutCylinder(sector, g);
            
            def = 'M' + topPoint3[0] + ',' + topPoint3[1]
                    + 'L' + topPoint4[0] + ',' + topPoint4[1]
                    + 'L' + bottomPoint4[0] + ',' + bottomPoint4[1]
                    + 'L' + bottomPoint3[0] + ',' + bottomPoint3[1] + 'z';
            g.append('path').attr('d', def).attr('fill', getDarkColor(sector.colorValue));
        };

        function renderSectorCylinder(sector, g) {
            var sa = getSimpleAngle(sector.startAngle);
            var ea = getSimpleAngle(sector.endAngle);
            
            if (sa > 0 && ea > sa && ea < Math.PI) {
                var def = 'M' + sector.topPoint1[0] + ',' + sector.topPoint1[1]
                    + 'A' + rx + ',' + ry + ' 0 ' + '0,1 '
                    + sector.topPoint2[0] + ',' + sector.topPoint2[1]
                    + 'L' + sector.bottomPoint2[0] + ',' + sector.bottomPoint2[1]
                    + 'A' + rx + ',' + ry + ' 0 ' + '0,0 '
                    + sector.bottomPoint1[0] + ',' + sector.bottomPoint1[1] + 'z';
                g.append('path').attr('d', def).attr('fill', getDarkColor(sector.colorValue));
            } else if ((sa < 0 || sa > Math.PI) && ea < Math.PI && ea > 0) {
                var def = 'M' + (bottomCX + rx) + ',' + sector.cy
                    + 'A' + rx + ',' + ry + ' 0 ' + '0,1 '
                    + sector.topPoint2[0] + ',' + sector.topPoint2[1]
                    + 'L' + sector.bottomPoint2[0] + ',' + sector.bottomPoint2[1]
                    + 'A' + rx + ',' + ry + ' 0 ' + '0,0 '
                    + (bottomCX + rx) + ',' + bottomCY + 'z';
                g.append('path').attr('d', def).attr('fill', getDarkColor(sector.colorValue));
            } else if (sa > 0 && sa < Math.PI && (ea > Math.PI || ea < 0)) {
                var def = 'M' + sector.topPoint1[0] + ',' + sector.topPoint1[1]
                    + 'A' + rx + ',' + ry + ' 0 ' + '0,1 '
                    + (bottomCX - rx) + ',' + sector.cy
                    + 'L' + (bottomCX - rx) + ',' + bottomCY
                    + 'A' + rx + ',' + ry + ' 0 ' + '0,0 '
                    + sector.bottomPoint1[0] + ',' + sector.bottomPoint1[1] + 'z';
                g.append('path').attr('d', def).attr('fill', getDarkColor(sector.colorValue));
            } else if (sa <= 0 && (ea >= Math.PI || ea < sa) || sa >= Math.PI && ea >= Math.PI && ea < sa) {
                var def = 'M' + (bottomCX + rx) + ',' + sector.cy
                    + 'A' + rx + ',' + ry + ' 0 ' + '0,1 '
                    + (bottomCX - rx) + ',' + sector.cy
                    + 'L' + (bottomCX - rx) + ',' + bottomCY
                    + 'A' + rx + ',' + ry + ' 0 ' + '0,0 '
                    + (bottomCX + rx) + ',' + bottomCY + 'z';
                g.append('path').attr('d', def).attr('fill', getDarkColor(sector.colorValue));
            } else if (sa > 0 && sa < Math.PI && ea > 0 && ea > Math.PI && ea < sa) {
                var def1 = 'M' + (bottomCX + rx) + ',' + sector.cy
                    + 'A' + rx + ',' + ry + ' 0 ' + '0,1 '
                    + sector.topPoint1[0] + ',' + sector.topPoint1[1]
                    + 'L' + sector.bottomPoint1[0] + ',' + sector.bottomPoint1[1]
                    + 'A' + rx + ',' + ry + ' 0 ' + '0,0 '
                    + (bottomCX + rx) + ',' + bottomCY + 'z';
                var def2 = 'M' + sector.topPoint2[0] + ',' + sector.topPoint2[1]
                    + 'A' + rx + ',' + ry + ' 0 ' + '0,1 '
                    + (bottomCX - rx) + ',' + sector.cy
                    + 'L' + (bottomCX - rx) + ',' + bottomCY
                    + 'A' + rx + ',' + ry + ' 0 ' + '0,0 '
                    + sector.bottomPoint2[0] + ',' + sector.bottomPoint2[1] + 'z';
                g.append('path').attr('d', def1).attr('fill', getDarkColor(sector.colorValue));
                g.append('path').attr('d', def2).attr('fill', getDarkColor(sector.colorValue));
            }
        };
        
        function renderDonutCylinder(sector, g) {
            var largeAngle = sector.endAngle - sector.startAngle > Math.PI ? '1' : '0';
            var def = 'M' + sector.topPoint4[0] + ',' + sector.topPoint4[1]
                    + 'A' + drx + ',' + dry + ' 0 ' + largeAngle + ',1 '
                    + sector.topPoint3[0] + ',' + sector.topPoint3[1]
                    + 'L' + sector.bottomPoint3[0] + ',' + sector.bottomPoint3[1]
                    + 'A' + drx + ',' + dry + ' 0 ' + largeAngle + ',0 '
                    + sector.bottomPoint4[0] + ',' + sector.bottomPoint4[1] + 'z';
            g.append('path').attr('d', def).attr('fill', getDarkColor(sector.colorValue));
        };


        function renderSectorTop(sector, g) {
            var def = 'M' + bottomCX + ',' + sector.cy 
                    + 'L' + sector.topPoint1[0] + ',' + sector.topPoint1[1] 
                    + 'A' + rx + ',' + ry + ' 0 ' 
                    + (sector.endAngle - sector.startAngle > Math.PI ? '1' : '0') + ',1 ' 
                    + sector.topPoint2[0] + ',' + sector.topPoint2[1] + 'z';
            g.append('path').attr('class', 'datapoint').attr('d', def).attr('fill', sector.colorValue).data(sector.val);
        };
        
        function renderDonutTop(sector, g) {
            var def = 'M' + bottomCX + ',' + sector.cy 
                    + 'L' + sector.topPoint1[0] + ',' + sector.topPoint1[1] 
                    + 'A' + rx + ',' + ry + ' 0 ' 
                    + (sector.endAngle - sector.startAngle > Math.PI ? '1' : '0') + ',1 ' 
                    + sector.topPoint2[0] + ',' + sector.topPoint2[1]
                    + 'L' + sector.topPoint3[0] + ',' + sector.topPoint3[1]
                    + 'A' + drx + ',' + dry + ' 0 ' 
                    + (sector.endAngle - sector.startAngle > Math.PI ? '1' : '0') + ',0 ' 
                    + sector.topPoint4[0] + ',' + sector.topPoint4[1] + 'z';
            g.append('path').attr('class', 'datapoint').attr('d', def).attr('fill', sector.colorValue).data(sector.val);
        };
        
        props = manifest.props(null);
        return pie;
    };
  return fn;
});