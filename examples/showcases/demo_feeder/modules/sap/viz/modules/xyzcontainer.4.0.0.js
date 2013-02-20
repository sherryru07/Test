sap.riv.module(
{
  qname : 'sap.viz.modules.xyzcontainer',
  version : '4.0.0'},
[
{
  qname : 'sap.viz.base.utils.TypeUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.util.Objects',
  version : '4.0.0'
},
{  qname : 'sap.viz.base.utils.FunctionUtils',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.xyzlayout',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifest',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.handler.SingleChartDataHandler',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.dispatch',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.threeD.matrix',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.threeD.Point',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.threeD.Vector3D',
  version : '4.0.0'
},
{  qname : 'sap.viz.modules.util.BoundUtil',
  version : '4.0.0'
}
],
function Setup(TypeUtils, Objects, Functions, xyzlayout, Manifest,
    SingleChartDataHandler, dispatch, matrix, Point3D, Vector3D, boundUtil) {

  // xyzcontainer
  var retfn = function(manifest, ctx) {

    function load(moduleId) {
      return Manifest.module.get(moduleId).execute(ctx);
    }
    var width = 0, height = 0, properties = {}, data = {}, config = {}, modules = {}, selections = {}, spaceWithoutPlot, parent = null; // a d3
    // selection

    var eDispatch = new dispatch('initialized', 'showTooltip', 'hideTooltip'), initializedModules = 0;
    ;
    var innerProperties = manifest.props(null);
    var xAngle = 20, yAngle = 50;

    var count = 0;
    var yAxisScale = d3.scale.linear(); // can be linear or ordinal scale
    var xAxisScale =  d3.scale.ordinal(); // can be linear or ordinal scale
    var zAxisScale =  d3.scale.ordinal();
    // /////////////////////can be moved to base container/////////////////////
    var resolveProperties = function(nodeConfig, isContainer) {
      var props = {}, // Empty properties basket
      propsCat, // Property category node
      usrProps, // User set properties
      sysProps; // Predefined properties in configure node
      if (isContainer) {
        // Jimmy/8/15/2012 pay attention to the property structure, for
        // container we will pass
        // all properties instead of properties under propsCat only.
        if (nodeConfig) {
          propsCat = nodeConfig.propertyCategory;
          usrProps = properties;
          sysProps = {};
          sysProps[propsCat] = nodeConfig.properties;
          Objects.extend(true, props, sysProps, usrProps);
        } else {
          props = properties;
        }
      } else {
        if (nodeConfig) {
          propsCat = nodeConfig.propertyCategory;
          usrProps = properties[propsCat];
          sysProps = nodeConfig.properties;
          // User properties will override predefined properties
          Objects.extend(true, props, sysProps, usrProps);
        }
      }
      return props;
    };

    var updateProperties = function(id, isContainer) {
      var moduleManifest = config.modules; // Module configurations
      var props, nodeConfig, propsCat;
      if (moduleManifest[id] && modules[id]) {
        nodeConfig = moduleManifest[id].configure;
        if (isContainer) {
          props = properties;
        } else {
          if (nodeConfig) {
            propsCat = nodeConfig.propertyCategory;
            props = Objects.extend(true, {}, properties[propsCat]);
          } else {
            props = {};
          }
        }
        modules[id].properties(props);
      }
    };
    // /////////////////////can be moved to base container/////////////////////

    function initialize() {
      if (TypeUtils.isEmptyObject(config))
        Functions.error('Container configuration missing');

      initializedModules = 0;

      initAxis('xAxis');
      initAxis('yAxis');
      initAxis('zAxis');
      initAxis('background');

      var plotConfig = config.modules.plot;
      if (!plotConfig)
        return;
      var plot = modules.plot = load(plotConfig.id);
      var dataHandler = new SingleChartDataHandler(data);
      plot.data(dataHandler.getDataAdapter());

      var props;
      if (plotConfig.configure) {
        props = resolveProperties(plotConfig.configure);
        plot.properties(props);
      }

      if (plot.dispatch) {
        var dis = plot.dispatch();
        if (dis.initialized) {
          initializedModules++;
          dis.on('initialized.xycontainer', initialized);
        }
        ;
        if (dis.showTooltip)
          dis.on('showTooltip.xycontainer', showTooltip);
        if (dis.hideTooltip)
          dis.on('hideTooltip.xycontainer', hideTooltip);
      }

      var dataLabelConfig = config.modules.dataLabel;
      if (TypeUtils.isExist(dataLabelConfig)
          && TypeUtils.isExist(plot.dataLabel)) {
        var dataLabel = modules.dataLabel = load(dataLabelConfig.id);
        plot.dataLabel(dataLabel);
        dataLabel.plot(plot);
        if (dataLabelConfig.configure) {
          props = resolveProperties(dataLabelConfig.configure);
          dataLabel.properties(props);
        }
      }

      if (modules.xAxis && !selections.xAxis)
        selections.xAxis = parent.append('g').attr('class', 'xAxis');
      if (modules.yAxis && !selections.yAxis)
        selections.yAxis = parent.append('g').attr('class', 'yAxis');
      if (modules.zAxis && !selections.zAxis)
        selections.zAxis = parent.append('g').attr('class', 'zAxis');
      if (modules.plot && !selections.plot)
        selections.plot = parent.append('g').attr('class', 'plot');
      if (modules.background && !selections.background)
        selections.background = parent.insert('g', ':first-child').attr(
            'class', 'background');
    }

    function updateAxisData(id) {
      if (modules[id]) {
        var axisConfig = config.modules[id];
        var axisDataConfig = axisConfig.data;
        if (axisDataConfig) {
          modules[id].data(data.createDataAdapterForModule(axisDataConfig));
        }
      }
    }
    ;

    function initAxis(id) {
      if (!config.modules[id])
        return;

      var axisConfig = config.modules[id], axis = modules[id] = load(axisConfig.id);

      updateAxisData(id);

      var props = resolveProperties(axisConfig.configure);
      axis.properties(props);

      if (axis.dispatch && axis.dispatch()['initialized']) {
        initializedModules++;
        axis.dispatch().on('initialized.xycontainer', initialized);
      }
    }

    var initBoundingBox = function(width, height, depth) {
      var bounds = [ {
        x : 0,
        y : 0,
        z : 0
      }, {
        x : 0,
        y : 0,
        z : depth
      }, {
        x : width,
        y : 0,
        z : 0
      }, {
        x : width,
        y : 0,
        z : depth
      }, {
        x : 0,
        y : height,
        z : 0
      }, {
        x : 0,
        y : height,
        z : depth
      }, {
        x : width,
        y : height,
        z : 0
      }, {
        x : width,
        y : height,
        z : depth
      } ];

      return bounds.map(function(bound) {
        return new Point3D(bound.x, bound.y, bound.z);
      });
    };

    var computeTransformBB = function(bounds, m) {
      var point = bounds[0];
      point.transform(m);

      var minx = point.x, miny = point.y, maxx = point.x, maxy = point.y;

      for ( var i = 1, len = bounds.length; i < len; i++) {
        point = bounds[i];
        point.transform(m);

        minx = Math.min(minx, point.x);
        miny = Math.min(miny, point.y);
        maxx = Math.max(maxx, point.x);
        maxy = Math.max(maxy, point.y);
      }

      return {
        x : minx,
        y : miny,
        z : maxx,
        w : maxy
      };

    };

    function radian(deg) {
      return deg * Math.PI / 180;
    }

    var computeMargin = function(params, info3d, omatrix, cwidth, cheight,
        cdepth, southPrefSize, westPrefSize, eastPrefSize) {

      var sangle = layoutAxis('south', params, 'xAxis', xAxisScale, omatrix, 0,
          0, cwidth, cheight, cdepth, info3d.x0, info3d.x1, info3d.y0,
          info3d.z0, info3d.z1)
      var asangle = Math.abs(radian(sangle));

      var wangle = layoutAxis('west', params, 'yAxis', yAxisScale, omatrix, 0,
          0, cwidth, cheight, cdepth, info3d.x0, info3d.x1, info3d.y0,
          info3d.z0, info3d.z1)
      var awangle = Math.abs(radian(wangle));

      var zangle = layoutAxis('none', params, 'zAxis', zAxisScale, omatrix, 0,
          0, cwidth, cheight, cdepth, info3d.x0, info3d.x1, info3d.y0,
          info3d.z0, info3d.z1)
      var azangle = Math.abs(radian(zangle));

      var left = 0, top = 0, right = 0, bottom = 0;

      left = westPrefSize.width * Math.cos(awangle);

      if (zangle <= 1 && sangle > 0
          && !(zangle == 1 && sangle == 91 && xAngle > 0)) {
        left = (left > southPrefSize.height * Math.cos(asangle)) ? left
            : southPrefSize.height * Math.cos(asangle);
        right = eastPrefSize.height * Math.cos(azangle);

        bottom = (southPrefSize.height * Math.sin(asangle) > eastPrefSize.height
            * Math.sin(azangle)) ? southPrefSize.height * Math.sin(asangle)
            : eastPrefSize.height * Math.sin(azangle)

      } else {
        left = (left > eastPrefSize.height * Math.cos(azangle)) ? left
            : eastPrefSize.height * Math.cos(azangle);
        right = southPrefSize.height * Math.cos(asangle);

        bottom = (southPrefSize.height * Math.sin(asangle) > eastPrefSize.height
            * Math.sin(azangle)) ? southPrefSize.height * Math.sin(asangle)
            : eastPrefSize.height * Math.sin(azangle)
      }
      return {
        top : 0,
        left : left,
        bottom : bottom,
        right : right
      };
    };

    var prepareScale = function(sizeH, sizeV, bb, margin, param) {
      var bbSizeX = bb.z - bb.x;
      var bbSizeY = bb.w - bb.y;

      var ratioX = sizeH / bbSizeX;
      var ratioY = sizeV / bbSizeY;
      var minRatio = Math.min(ratioX, ratioY);

      return {
        x : minRatio,
        y : ratioY,
        z : minRatio
      };

    };

    var computeScale = function(width, height, depth, m) {
      var bounds = initBoundingBox(width, height, depth);
      var bb = computeTransformBB(bounds, m);
      var savedBB = {
        x : bb.x,
        y : bb.y,
        x : bb.z,
        w : bb.w
      };
      var margin = computeMargin();
      var scale = prepareScale(width, height, bb, margin);
      return scale;
    };

    var generateRendererParam = function(m) {
      var camera_ = new Vector3D(0, 0, 1);

      var isRenderRT = false, // left
      isRenderTP = false, // top
      isRenderFT = false; // front

      var origin = new Point3D(0, 0, 0);
      var pointX = new Point3D(1, 0, 0);
      var pointY = new Point3D(0, -1, 0);
      var pointZ = new Point3D(0, 0, 1);

      origin.transform(m);
      pointX.transform(m);
      pointY.transform(m);
      pointZ.transform(m);

      var renderingOrderX = new Vector3D(pointX.x - origin.x, pointX.y
          - origin.y, pointX.z - origin.z), renderingOrderY = new Vector3D(
          pointY.x - origin.x, pointY.y - origin.y, pointY.z - origin.z), renderingOrderZ = new Vector3D(
          pointZ.x - origin.x, pointZ.y - origin.y, pointZ.z - origin.z)

      if (camera_.dotProduct(renderingOrderX) < 0) {
        isRenderRT = true;
      }

      if (camera_.dotProduct(renderingOrderY) < 0) {
        isRenderTP = true;
      }

      if (camera_.dotProduct(renderingOrderZ) > 0) {
        isRenderFT = true;
      }

      return {
        isRenderRT : isRenderRT,
        isRenderTP : isRenderTP,
        isRenderFT : isRenderFT,
        renderingOrderX : renderingOrderX,
        renderingOrderY : renderingOrderY,
        renderingOrderz : renderingOrderZ
      };
    };

    function layoutAxis3D(params_, x_, y_, width_, height_, yDepth_) {
      var x0, x1, y0, y1, z0, z1;
      y0 = y_ + height_;

      if (params_.isRenderFT) {
        x0 = x_;
        if (params_.isRenderTP)
          z0 = 0;
        else
          z0 = yDepth_;
      } else {
        x0 = x_ + width_;
        if (params_.isRenderTP)
          z0 = yDepth_;
        else
          z0 = 0;
      }
      if (params_.isRenderRT) {
        z1 = 0;
        if (params_.isRenderTP)
          x1 = x_ + width_;
        else
          x1 = x_;
      } else {
        z1 = yDepth_;
        if (params_.isRenderTP)
          x1 = x_;
        else
          x1 = x_ + width_;
      }

      return {
        x0 : x0,
        x1 : x1,
        y0 : y0,
        z0 : z0,
        z1 : z1
      };
    }
    ;

    function layoutAxis(type, params, axis, scale, m, x_, y_, width_, height_,
        yDepth_, x0, x1, y0, z0, z1) {
      var origin, point, tick, vector;
      var length, angle, labelAngle, tickAngle, gap;

      switch (type) {
        case 'south':
          origin = new Point3D(x_, y0, z0);
          gap = (0 == z0) ? -yDepth_ : yDepth_;
          tick = new Point3D(x_, y0, z0 + gap);
          point = new Point3D(x_ + width_, y0, z0);
          break;
        case 'north':
          origin = new Point3D(x_, height_ - y0, yDepth_ - z0);
          gap = (0 == z0) ? -yDepth_ : yDepth_;
          tick = new Point3D(x_, y0, yDepth_ - z0 + gap);
          point = new Point3D(x_ + width_, height_ - y0, yDepth_ - z0);
          break;
        case 'west':
          origin = new Point3D(x0, y_, z1);
          tick = new Point3D(x0 - width_, y_, z1);
          point = new Point3D(x0, y_ - height_, z1);
          break;
        case 'east':
          origin = new Point3D(width_ - x0, y_ + height_, yDepth_ - z1);
          tick = new Point3D(width_, y_ + height_, yDepth_ - z1);
          point = new Point3D(width_ - x0, y_, yDepth_ - z1);
          break;
        default:
          origin = new Point3D(x1, y0, 0);
          gap = (x_ == x1) ? -width_ : width_;
          tick = new Point3D(x1 + gap, y0, 0);
          point = new Point3D(x1, y0, yDepth_);
          break;
      }

      origin.transform(m);
      tick.transform(m);
      point.transform(m);

      if (type == 'west') {
        labelAngle = 0;
        tickAngle = 0;
      } else {
        vector = new Vector3D(tick.x - origin.x, tick.y - origin.y, point.z
            - origin.z);
        labelAngle = Math.atan2(vector.values[0], vector.values[1]) * 180
            / Math.PI + 90;
        if (labelAngle > 90)
          labelAngle -= 180;
        else if (labelAngle < -90)
          labelAngle += 180;
        labelAngle = computeAngle3D(labelAngle);
        tickAngle = Math.atan2(vector.values[1], vector.values[0]) * 180
            / Math.PI;
      }

      modules[axis].labelAngle(labelAngle).tickAngle(tickAngle);

      vector = new Vector3D(point.x - origin.x, point.y - origin.y, point.z
          - origin.z);
      selections[axis].attr('transform', 'translate(' + origin.x + ' '
          + origin.y + ')');
      angle = Math.atan2(vector.values[1], vector.values[0]) * 180 / Math.PI
          + 90;

      // a special setting, if the angle
      if (type === 'none' && angle == 0) {
        angle = -1;
      }
      modules[axis].angle(angle);

      modules[axis].labelAlign('start');

      length = (point.x - origin.x) * (point.x - origin.x)
          + (point.y - origin.y) * (point.y - origin.y);

      if (length < 0.01)
        length = 0;

      if (type == 'west') {
        modules[axis].height(Math.sqrt(length));
      } else {
        modules[axis].width(Math.sqrt(length));
      }

      if (scale.rangeBands) {
        scale.rangeBands([ 0, Math.sqrt(length) ]);
      } else {
        scale.range([ Math.sqrt(length), 0 ]);
      }

      return labelAngle;
    }
    ;

    function computeAngle3D(angleParam) {

      var angle = angleParam % 360;
      if (-271 < angle && angle < -270)
        return -271;
      else if (-270 <= angle && angle < -269)
        return -269;
      if (-181 < angle && angle < -180)
        return -181;
      else if (-180 <= angle && angle < -179)
        return -179;
      else if (-91 < angle && angle < -90)
        return -91;
      else if (-90 <= angle && angle < -89)
        return -89;
      else if (-1 < angle && angle < 0)
        return -1;
      else if (0 <= angle && angle < 1)
        return 1;
      else if (89 < angle && angle < 90)
        return 89;
      else if (90 <= angle && angle < 91)
        return 91;
      else if (179 < angle && angle < 180)
        return 179;
      else if (180 <= angle && angle < 181)
        return 181;
      else if (269 < angle && angle < 270)
        return 269;
      else if (270 <= angle && angle < 271)
        return 271;
      else if (359 < angle && angle < 360)
        return 359;
      return Math.round(angleParam);
    }

    function relayout(firstLayout) {
      count++;
      if (TypeUtils.isEmptyObject(modules) || !width || !height)
        return;

      width = width < 0 ? 0 : width;
      height = height < 0 ? 0 : height;

      if (count % 4 != 0) {
        modules.plot.width(width).height(height);
      } else {

        var southPrefSize = modules.xAxis.getPreferredSize();
        var westPrefSize = modules.yAxis.getPreferredSize();
        var eastPrefSize = modules.zAxis.getPreferredSize();

        var cwidth = southPrefSize.width, cheight = westPrefSize.height, cdepth = eastPrefSize.width;
        var omatrix = matrix().rotateY(yAngle).rotateX(xAngle);

        var params = generateRendererParam(omatrix);
        var info3d = layoutAxis3D(params, 0, 0, cwidth, cheight, cdepth);

        var bounds = initBoundingBox(cwidth, cheight, cdepth);
        var bb = computeTransformBB(bounds, omatrix);
        var savedBB = {
          x : bb.x,
          y : bb.y,
          x : bb.z,
          w : bb.w
        };

        var margin = computeMargin(params, info3d, omatrix, cwidth, cheight,
            cdepth, southPrefSize, westPrefSize, eastPrefSize);
        var sizeV = height - margin.bottom - margin.top;
        var sizeH = width - margin.left - margin.right;
        var scale = prepareScale(sizeH, sizeV, bb, margin);
        var scaleMatrix = omatrix.unit().scale(scale.x, scale.y, scale.z)
            .clone();
        omatrix.rotateY(yAngle).rotateX(xAngle);

        var offsetX = 0, offsetY = 0;
        var exit = 0;
        while (exit < 10) {

          bounds = initBoundingBox(cwidth, cheight, cdepth);
          bb = computeTransformBB(bounds, omatrix);

          offsetX = 0 - bb.x + margin.left + (sizeH - bb.z + bb.x) / 2;
          offsetY = 0 - bb.y + margin.top + (sizeV - bb.w + bb.y) / 2;

          if (offsetX > 0 && offsetY > 0) {
            break;
          }

          scale = prepareScale(sizeH, sizeV, bb, margin);

          omatrix = scaleMatrix.clone();
          omatrix.scale(scale.x, scale.y, scale.z);
          scaleMatrix = omatrix.clone();

          omatrix.rotateY(yAngle).rotateX(xAngle);
          exit++;
        }

        modules.plot.matrix(omatrix);

        layoutAxis('south', params, 'xAxis', xAxisScale, omatrix, 0, 0, cwidth,
            cheight, cdepth, info3d.x0, info3d.x1, info3d.y0, info3d.z0,
            info3d.z1)

        layoutAxis('west', params, 'yAxis', yAxisScale, omatrix, 0, 0, cwidth,
            cheight, cdepth, info3d.x0, info3d.x1, info3d.y0, info3d.z0,
            info3d.z1)

        layoutAxis('none', params, 'zAxis', zAxisScale, omatrix, 0, 0, cwidth,
            cheight, cdepth, info3d.x0, info3d.x1, info3d.y0, info3d.z0,
            info3d.z1)

        var node = selections.yAxis.node(), transform = node
            .getTransformToElement(node.parentNode);
        selections.yAxis.attr('transform', 'translate('
            + (transform.e - westPrefSize.width) + ',' + transform.f + ')');

        bounds = initBoundingBox(cwidth, cheight, cdepth);
        bb = computeTransformBB(bounds, omatrix);

        node = selections.yAxis.node(), transform = node
            .getTransformToElement(node.parentNode);
        selections.yAxis.attr('transform', 'translate('
            + (transform.e + offsetX) + ',' + (transform.f + offsetY) + ')');

        node = selections.xAxis.node(), transform = node
            .getTransformToElement(node.parentNode);
        selections.xAxis.attr('transform', 'translate('
            + (transform.e + offsetX) + ',' + (transform.f + offsetY) + ')');

        node = selections.zAxis.node(), transform = node
            .getTransformToElement(node.parentNode);
        selections.zAxis.attr('transform', 'translate('
            + (transform.e + offsetX) + ',' + (transform.f + offsetY) + ')');

        node = selections.plot.node();
        selections.plot.attr('transform', 'translate(' + (offsetX) + ','
            + (offsetY) + ')');

      }

    }

    function container(selection) {
      selection.each(function(data) {
        parent = selection;
        boundUtil.drawBound(selection, width, height);
        if (TypeUtils.isEmptyObject(modules))
          initialize();
        render();
      });
      return container;
    }

    container.width = function(_, firstLayout) {
      if (!arguments.length)
        return width;
      width = _;
      // Jimmy,8/20/2012, as a container, you don't know whether your
      // sub elements need relayout even if the container size remains
      // the same. so here we just give a chance to sub elements to relayout
      relayout(firstLayout);
      return container;
    };

    container.height = function(_, firstLayout) {
      if (!arguments.length)
        return height;
      height = _;
      // see @width
      relayout(firstLayout);
      return container;
    };

    container.size = function(_) {
      if (!arguments.length)
        return {
          'width' : width,
          'height' : height
        };
      height = _.height;
      width = _.width;
      // see @width
      relayout();
      return container;
    };

    container.data = function(_) {
      if (!arguments.length)
        return data;
      data = _;
      if (!TypeUtils.isEmptyObject(modules)) {
        // plot exists, we need update its data
        var dataHandler = new SingleChartDataHandler(data);
        modules.plot.data(dataHandler.getDataAdapter());
        updateAxisData('xAxis');
        updateAxisData('yAxis');
        updateAxisData('zAxis');
      }

      return container;
    };

    container.properties = function(_) {
      if (!arguments.length)
        return innerProperties;
      properties = _;
      if (!TypeUtils.isEmptyObject(modules)) {
        updateProperties('xAxis');
        updateProperties('yAxis');
        updateProperties('zAxis');
        updateProperties('plot');
        updateProperties('datalabel');
        updateProperties('background');
      }
      Objects.extend(true, innerProperties, _.xyzcontainer);
      xAngle = innerProperties && innerProperties.xAngle ? innerProperties.xAngle
          : xAngle;
      yAngle = innerProperties && innerProperties.yAngle ? innerProperties.yAngle
          : yAngle;
      return container;
    };

    container.config = function(_) {
      if (!arguments.length)
        return config;
      config = _;
      return container;
    };

    container.modules = function(_) {
      if (!arguments.length) {
        if (TypeUtils.isEmptyObject(modules)) {
          initialize();
        }
        return modules;
      }
      modules = _;
      return container;
    };

    container.parent = function(_) {
      if (!arguments.length)
        return parent;
      parent = _;
      return container;
    };

    container.rotate = function(_){
      if(!arguments.length){
        return {
          xAngle: xAngle,
          yAngle: yAngle
        };
      }
      
      count = 2;
      xAngle = _.xAngle;
      yAngle = _.yAngle;
      relayout();
      relayout();
      render();
      
      return container;
    };
    
    container.dispatch = function(_) {
      if (!arguments.length)
        return eDispatch;
      eDispatch = _;
      return container;
    };

    container.infoForSizeLegend = function() {
      return {
        space : spaceWithoutPlot,
        number : 1,
        plotHeight : modules.plot.height()
      };
    };

    container.yAxis = function(_) {
      if (!arguments.length) {
        return yAxisScale;
      }
      yAxisScale = _.copy();
      return container;
    };

    container.xAxis = function(_) {
      if (!arguments.length) {
        return xAxisScale;
      }
      xAxisScale = _.copy();
      return container;
    };

    container.zAxis = function(_) {
      if (!arguments.length) {
        return zAxisScale;
      }
      zAxisScale = _.copy();
      return container;
    };

    container.xAxisScaleChange = function(_, range){
      if(  xAxisScale.rangeBands ){
        xAxisScale.rangeBands(range);
      }else {
        xAxisScale.range(range);
      }
    };
    
    container.zAxisScaleChange = function(_, range){
        zAxisScale.rangeBands(range);
    };
    
    container.yAxisScaleChange = function(_, range){
      if(  yAxisScale.rangeBands ){
        yAxisScale.rangeBands(range);
      }else {
        yAxisScale.range(range);
      }
    };
    
    
    function render() {
      for ( var sel in selections) {
        if (selections.hasOwnProperty(sel)) {
          selections[sel].datum(modules[sel].data()).call(modules[sel]);
        }
      }
      if (TypeUtils.isExist(modules.dataLabel)) {
        modules.dataLabel();
      }
    }

    var initializedCount = 0;
    function initialized() {
      if (initializedModules == ++initializedCount) {
        initializedCount = 0;
        eDispatch.initialized();
      }
    }
    ;

    function showTooltip(evt) {
      eDispatch.showTooltip(evt);
    }
    ;

    function hideTooltip(evt) {
      eDispatch.hideTooltip(evt);
    }
    ;

    return container;
  };
  return retfn;
});