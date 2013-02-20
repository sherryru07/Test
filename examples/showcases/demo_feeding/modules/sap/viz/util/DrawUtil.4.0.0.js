sap.riv.module(
{
  qname : 'sap.viz.util.DrawUtil',
  version : '4.0.0'},
[

],

function Setup() {

  var DrawUtil = {

  };

  /**
   *  props = {
   *    type: 
   *    rx:
   *    ry:
   *  }
   *  @return path "d" for D3 
   */
  DrawUtil.createMarkerData = function (props){
    // TODO Maybe we can use hashmap to cache here
    //if(symbolMap[props]) return symbolMap[props];
    var result;
    var temp = props.borderWidth / 2;
    switch(props.type)
    {
    case "circle" :
      result = "M" + (-props.rx - temp)  + ",0 A" + (props.rx + temp) + "," + (props.ry + temp) + " 0 1,0 " + (props.rx + temp) + ",0 A";
      result += (props.rx + temp) + "," + (props.ry + temp) + " 0 1,0 " + (-props.rx -temp) + ",0z";
      break;
    case "cross" :
      result = "M" + (-props.rx - temp) + "," + (-props.ry/3 - temp) + "H" + (-props.rx/3  - temp) + "V" + (-props.ry - temp)+ "H" + (props.rx/3 +temp);
      result += "V" + (-props.ry/3 - temp) + "H" + (props.rx + temp) + "V" + (props.ry/3 + temp) + "H" + (props.rx/3 + temp);
      result += "V" + (props.ry +temp) + "H" + (-props.rx/3 - temp) + "V" + (props.ry/3 + temp) + "H" + (-props.rx -temp) + "Z";
      break;
    case "diamond" :
      result = "M0," + (-props.ry -temp)  + "L" + (props.rx + temp) + ",0" + " 0," + (props.ry + temp) + " " + (-props.rx -temp) + ",0" + "Z";
      break;
    case "square" :
      result = "M" + (-props.rx - temp) + "," + (-props.ry - temp) + "L" + (props.rx + temp) + ",";
      result += (-props.ry - temp) + "L" + (props.rx + temp) + "," + (props.ry + temp) + "L" + (-props.rx - temp) + "," + (props.ry + temp) + "Z";
      break;
    case "triangle-down" :
      result = "M0," + (props.ry + temp) + "L" + (props.rx + temp) + "," + -(props.ry + temp) + " " + -(props.rx + temp) + "," + -(props.ry + temp) + "Z";
      break;
    case "triangle-up" :
      result =  "M0," + -(props.ry + temp) + "L" + (props.rx + temp) + "," + (props.ry + temp) + " " + -(props.rx + temp) + "," + (props.ry + temp) + "Z";
      break;
    case "triangle-left" :
      result = "M" + -(props.rx + temp) + ",0L" + (props.rx + temp) + "," + (props.ry + temp) + " " + (props.rx + temp) + "," + -(props.ry + temp) + "Z";
      break;
    case "triangle-right" :
      result = "M" + (props.rx + temp) + ",0L" + -(props.rx + temp) + "," + (props.ry + temp) + " " + -(props.rx + temp) + "," + -(props.ry + temp) + "Z";
      break;
    case "intersection" :
      result = "M" + (props.rx + temp) + "," + (props.ry + temp) + "L" +  (props.rx/3 + temp) + ",0L" + (props.rx + temp) + "," + -(props.ry +temp) + "L";
      result += (props.rx / 2 - temp) + "," + -(props.ry + temp) + "L0," + (-props.ry/3 - temp) + "L" + (-props.rx / 2 + temp) + "," + -(props.ry + temp) + "L";
      result += -(props.rx + temp) + "," + -(props.ry +temp) + "L" + -(props.rx/3 + temp) + ",0L" + -(props.rx + temp) + "," + (props.ry + temp) + "L";
      result += (-props.rx/2 + temp) + "," + (props.ry + temp) + "L0," + (props.ry/3 + temp) + "L" + (props.rx/2 - temp) + "," + (props.ry + temp) + "Z";
      break;
    case 'squareWithRadius' : 
      var r = props.rx;
      var radius = r - 3;
      result = "M0," +  -r + "L" + -radius + ","+ -r + "Q" + -r +"," + -r + " " + -r + "," + -radius + "L" + -r +"," + radius + "Q" + -r + "," + r + " " + -radius + "," + r;
      result += "L" + radius + "," + r +"Q" + r + "," + r + " " + r + "," +radius + "L" + r +"," + -radius + "Q" + r + "," + -r + " "+ radius + "," + -r +"Z";
      break;
    }
    //symbolMap[props] = result;
    return result;

  };

  function getAnimationInitData(props)
  {
    var result;
    switch(props.type)
    {
    case "circle" :
      result = "M0,0A0,0 0 1,0 0,0A0,0 0 1,0 0,0z"; 
      break;
    case "cross" :
      result = "M0,0H0V0H0V0H0V0H0V0H0V0H0Z";
      break;
    case "diamond" :
      result = "M0,0L0,0 0,0 0,0Z";
      break;

    case "triangle-down" :

    case "triangle-up" :
    case "triangle-left" :
    case "triangle-right" :  
      result = "M0,0L0,0 0,0Z";
      break;
    case "intersection" :
      result = "M0,0L0,0L0,0L0,0L0,0L0,0L0,0L0,0L0,0L0,0L0,0L0,0Z";
      break;
    case 'squareWithRadius' : 
      result = "M0,0L0,0Q0,0 0,0L0,0Q0,0 0,0L0,0Q0,0 0,0L0,0Q0,0 0,0Z";
      break;  
    case "square" :
      result = "M0,0L0,0L0,0L0,0Z";
      break;
    default:
      result = "M0,0L0,0L0,0L0,0Z";
      break;
    }
    return result;
  }
  
  DrawUtil.createElements = function(d3Enter, props)
  {
    return d3Enter.append("path").attr("class", props.className);
  };
  
  DrawUtil.createElement = function(d3Parent, props, effectManager)
  {
    var d3Element = d3Parent.append("path").attr("class", props.className);
    props.node = d3Element;
    DrawUtil.drawGraph(props, effectManager);
    return d3Element;
  };

  /**
   * props = {
   *   node: current d3 svg element,
   *  graphType : marker type
   *  drawingEffect: drawingEffect
   *  direction : direction
   *   rx : size
   *  ry: size
   *  fillColor: color
   *  borderWidth:
   *  borderColor,
   *  visibility: "visible" or "hidden"
   *  animateTime: total time for animation in ms 
   *  strokeOpacity: opacity for border line
   *  endFunc: callback function, when animation complete, it will be called
   * }
   *  effectManager: current effectManager
   */
  DrawUtil.drawGraph =  function (props, effectManager)
  {
    var para = {
        type: props.graphType,
        rx:Math.round(props.rx),
        ry:Math.round(props.ry),
        borderWidth: props.borderWidth ? Math.round(props.borderWidth) : 0
    };
    var data = DrawUtil.createMarkerData(para);

    var fillId = effectManager.register(props);
    props.node.attr("fill", fillId).attr("stroke-width", props.borderWidth).attr("stroke", props.borderColor)
       .attr("visibility", props.visibility).attr("stroke-opacity", props.strokeOpacity);
    if(props.animateTime && props.animateTime > 0) {
      props.node.attr("d", getAnimationInitData(para));
      props.node.transition().duration(props.animateTime).attr("d", data).each('end', props.endFunc);
    } else {
      props.node.attr("d", data);
    }
    return  props.node;
  };
  
  return DrawUtil;
});