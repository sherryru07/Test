sap.riv.module(
{
  qname : 'sap.viz.util.EffectManager',
  version : '4.0.0'},
[

],
function Setup(){

  /**
   * 
   * @param svgdef d3 svg defs to store all gradient effect
   * @return TODO: add desc
   */
  function EffectManager(svgdef, enableGhostEffect){
    this._defs  = svgdef;
    this._enableGhostEffect = enableGhostEffect;
  }

  function color2hex(color) {
    var hex;
    if(color !== undefined && typeof(color) === 'object') {
      if (color.rgb) {
        hex = color.rgb().toString();
      } else {
        hex = color.toString();
      }
    } else if (typeof(color) === 'string') {
      hex = d3.rgb(color.toLowerCase()).toString();
    }
    return hex;
  }
  
  function rgb2gray (hex) {
    var r = parseInt(hex.substr(1, 2), 16);
    var g = parseInt(hex.substr(3, 2), 16);
    var b = parseInt(hex.substr(5, 2), 16);

    var gstr;
    if ((r === g) && (g === b)) {
      gstr = (Math.round(256 + r + (255 - r)*0.6).toString(16)).substr(1);
    } else {
      var gray = (r*299 + g*587 + b*114 + 500) / 1000;
      gstr = (Math.round(256 + gray).toString(16)).substr(1);
    }
    return '#' + gstr + gstr + gstr;
  }

  function increaseBrightness(hex, percent) {
    var r = parseInt(hex.substr(1, 2), 16);
    var g = parseInt(hex.substr(3, 2), 16);
    var b = parseInt(hex.substr(5, 2), 16);

    var temp;
    if (percent >= 0) {
      temp = '#';
      temp += (Math.round(256 + r + (255 - r) * percent / 100).toString(16)).substr(1);
      temp += (Math.round(256 + g + (255 - g) * percent / 100).toString(16)).substr(1);
      temp += (Math.round(256 + b + (255 - b) * percent / 100).toString(16)).substr(1);
      return temp;
    } else {
      temp = '#';
      temp += (Math.round(256 + r * (100 + percent) / 100).toString(16)).substr(1);
      temp += (Math.round(256 + g * (100 + percent) / 100).toString(16)).substr(1);
      temp += (Math.round(256 + b * (100 + percent) / 100).toString(16)).substr(1);
      return temp;
    }
  }
  
  function drawGlossySector(d3defs, id, fillColor, radius) {
    var c0 = fillColor;
    var c2 = increaseBrightness(c0, 50);
    var c3 = increaseBrightness(fillColor, -30);

    var d3rg = d3defs.append('radialGradient');
    var rg = d3rg[0][0];
    rg.setAttribute('id', id);
    rg.setAttribute('cx', 0);
    rg.setAttribute('cy', 0);
    rg.setAttribute('r', radius);
    rg.setAttribute('fx', 0);
    rg.setAttribute('fy', 0);
    rg.setAttribute('gradientUnits',"userSpaceOnUse");
    d3rg.append("stop").attr('stop-opacity' , 1).attr("offset", 0).attr("stop-color", c2);
    d3rg.append("stop").attr('stop-opacity' , 1).attr("offset", 0.9).attr("stop-color", c0);
    d3rg.append("stop").attr('stop-opacity' , 1).attr("offset", 1).attr("stop-color", c3);
  }
   
  function drawGlossyCircle(d3defs, id, fillColor) {
    var c0 = fillColor;
    var c1 = increaseBrightness(c0, 10);
    var c2 = increaseBrightness(c0, 80);

    var d3rg = d3defs.append('radialGradient');
    var rg = d3rg[0][0];
    rg.setAttribute('id', id);
    rg.setAttribute('cx', '50%');
    rg.setAttribute('cy', '50%');
    rg.setAttribute('r', '50%');
    rg.setAttribute('fx', '50%');
    rg.setAttribute('fy', '20%');
    d3rg.append("stop").attr('stop-opacity' , 1).attr("offset", 0).attr("stop-color", c2);
    d3rg.append("stop").attr('stop-opacity' , 1).attr("offset", 0.7).attr("stop-color", c1);
    d3rg.append("stop").attr('stop-opacity' , 1).attr("offset", 0.9).attr("stop-color", c0);
    d3rg.append("stop").attr('stop-opacity' , 1).attr("offset", 1).attr("stop-color", c0);
  }

  function drawGlossyRectangle(d3defs, id, fillColor, direction) {
     var c1 = increaseBrightness(fillColor, 30);
     var c2 = increaseBrightness(fillColor, 50);
     var c3 = increaseBrightness(fillColor, -10);
     var c4 = increaseBrightness(fillColor, 10);
     var gradient = d3defs.append("svg:linearGradient").attr("id", id).attr("x1", "0%").attr("y1", "0%");
     if(direction === 'horizontal') {
       gradient.attr("y2", "0%").attr("x2", "100%");
     } else {
       gradient.attr("y2", "100%").attr("x2", "0%");
     }
     
     gradient.append("stop").attr('stop-opacity' , 1).attr("offset", 0).attr("stop-color", c1);
     gradient.append("stop").attr('stop-opacity' , 1).attr("offset", 0.2).attr("stop-color", c2);
     gradient.append("stop").attr('stop-opacity' , 1).attr("offset", 0.8).attr("stop-color", c3);
     gradient.append("stop").attr('stop-opacity' , 1).attr("offset", 1).attr("stop-color", c4);
  }

  function drawGlossyBackground(d3defs, id, fillColor, direction) {
     var gradient = d3defs.append("svg:linearGradient").attr("id", id);
     if(direction === 'horizontal') {
       gradient.attr("x1", "100%").attr("y1", "0%").attr("x2", "0%").attr("y2", "0%");
     } else {
       gradient.attr("x1", "0%").attr("y1", "0%").attr("x2", "0%").attr("y2", "100%");
     }
     
     gradient.append("stop").attr('stop-opacity' , 1).attr("offset", 0).attr("stop-color", '#ffffff');
     gradient.append("stop").attr('stop-opacity' , 1).attr("offset", 1).attr("stop-color", fillColor);
  }

  
  function getFillElementId(parameters, color)
  {
    var id;
    if(parameters.drawingEffect === "glossy")
    {
      switch(parameters.graphType)
      {
      case 'sector':
        id = parameters.drawingEffect + parameters.graphType + color.slice(1) + Math.round(parameters.radius);
        break;
      case 'circle':
        id = parameters.drawingEffect + parameters.graphType + color.slice(1);
        break;
      case 'triangle-up' :
      case 'triangle-down' :
        id = parameters.drawingEffect + 'triangle' + color.slice(1) + 'vertical';
        break;
      case 'triangle-left' :
      case 'triangle-right' :
        id =  parameters.drawingEffect + 'triangle' + color.slice(1) + 'horizontal';
        break;
      case 'rectangle' :
      case 'diamond' :
      case 'cross' :
      case 'star' :
      case 'intersection' :
      case 'background' :
        id =  parameters.drawingEffect + 'rectangle' + color.slice(1) + parameters.direction;
        break;
      default :
        id =  parameters.drawingEffect + 'rectangle' + color.slice(1) + parameters.direction;
        break;
      case 'line' :
        id = null;
        break;
      }
    }

    return id;

  }
  /**
   * 
   * @param parameters
   * {
   *   graphType: 'circle','square','diamond'.....
   *   drawingEffect,
   *   fillColor,
   *   direction,  "horizontal" means left to right. "vertical" means top to bottom
   * }
   * @return id to use in "fill"
   */

  EffectManager.prototype.register = function(parameters)
  {
    var originalColor = parameters.fillColor;

    if (this._enableGhostEffect) {
      originalColor = color2hex(originalColor);
      originalColor = rgb2gray(originalColor);
    }

    var color = color2hex(originalColor);
    var id = getFillElementId(parameters, color);
    if(!id) { return originalColor; }

    var element = this._defs.select("#" + id);
    if(element.empty())
    {
      if(parameters.drawingEffect === "glossy") {
        switch (parameters.graphType)
        {
        case 'background' : 
          drawGlossyBackground(this._defs, id, color, parameters.direction);
          break;
         case 'sector' :
          drawGlossySector(this._defs, id, color, parameters.radius);
          break;
         case 'circle' :
          drawGlossyCircle(this._defs, id, color, parameters.direction);
          break;
         case 'triangle-up' :
         case 'triangle-down' :
          drawGlossyRectangle(this._defs, id, color, 'vertical');
          break;
         case 'triangle-left' :
         case 'triangle-right' :
          drawGlossyRectangle(this._defs, id, color, 'horizontal');
          break;
         case 'rectangle' :
         case 'diamond' :
         case 'cross' :
         case 'star' :
         case 'intersection' :
           drawGlossyRectangle(this._defs, id, color, parameters.direction);
           break;
         default :
          drawGlossyRectangle(this._defs, id, color, parameters.direction);
          break;
         }
       } else {
            return color;
       }
     }
     return "url(#" + id + ")";
     
   };
   
   EffectManager.prototype.setContainer = function(container){
    this._defs = container;
  };

  EffectManager.prototype.ghostEffect = function(_){
    if(!arguments.length) {
      return this._enableGhostEffect;
    }
    this._enableGhostEffect = _;
  };
  return EffectManager;
});