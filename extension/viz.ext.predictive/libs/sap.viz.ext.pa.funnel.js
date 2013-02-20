(function(){	

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	///////////////////////// Module Function /////////////////////////

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	function shadeColor(color, shade) {

	        var colorInt = parseInt(color.substring(1),16);

	

	        var R = (colorInt & 0xFF0000) >> 16;

	        var G = (colorInt & 0x00FF00) >> 8;

	        var B = (colorInt & 0x0000FF) >> 0;

	

	        R = R + Math.floor((shade/255)*R);

	        G = G + Math.floor((shade/255)*G);

	        B = B + Math.floor((shade/255)*B);

	

	        var newColorInt = (R<<16) + (G<<8) + (B);

	        var newColorStr = "#"+newColorInt.toString(16);

	

	        return newColorStr;

	    }

	

	

	var funnelChart=function () {
var data,width = undefined,height = undefined,id = Math.floor(Math.random() * 10000), colorPalette = d3.scale.category20().range().concat(d3.scale.category20b().range()).concat(d3.scale.category20c().range()), shapePalette = ['square'],
	// shape palette for legend
	properties = {};
           var sortedData=[];
			
	       function chart(selection) {
		                               selection.each(function() {
		                            var colorData = data.getAnalysisAxisDataByIdx(1);
									var dimensionName = colorData.values[0].col.val;
									var mg0 = data.getMeasureValuesGroupDataByIdx(0);
		// parsing the data into measure and dimension array...
									var measureName=mg0.values[0].col;
									for(var i = 0; i < mg0.values.length; i++) {
										var val = mg0.values[i];

										for(var j = 0; j < val.rows.length; j++) {
											for(var k = 0; k < val.rows[j].length; k++) {
											var obj=[];
											obj.push(colorData.values[0].rows[j].val);
											obj.push(val.rows[j][k].val);
											sortedData.push(obj);
												
												
											}

					}
				}
		//sorting in descending order...
		sortedData.sort(function(a,b) { return b[1]-a[1]} );
		
		var dimData = []; //dimension data array
	    var mesData = []; //measure data array
				  for (var rowIndex = 0; rowIndex < sortedData.length; rowIndex++) {
					 var rowData = sortedData[rowIndex];
					 dimData.push(rowData[0]);
					 var num = Number(rowData[1]);
					 if(isNaN(num)) {
						num = 0;
					}
					mesData.push(num);
				   }
			
			
	var m = [30, 10, 10, 10],
    w = width - m[1] - m[3],
    h = height - m[0] - m[2];
	
var svg = d3.select(this).append("svg:svg")
    .attr("width", w + m[1] + m[3])
    .attr("height", h + m[0] + m[2])
    .append("svg:g")
    .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
// 10% of the width for legend, 10% of width for left margin, 10% of the width for line, 10% of the width for displaying percentage, remaining 60% for funnel width.
var funnelHeight=h,funnelWidth=(60/100)*w;
var percentage=new Array();
var color = d3.scale.category10().domain(dimData);

// funnel will start after 20% of the width( legend and left margin)...
var funnel_LeftStart=w/5;
//for displaying legends...
var legend = svg.selectAll("g.legend")
.data(dimData)
.enter().append("svg:g")
.attr("class", "legend")
.attr("transform", function(d, i) { return "translate(0," + (i * 15) + ")"; });

legend.append("svg:line")
.style("stroke", function(d,i){return color(d);})
.style("stroke-width",5)
.attr("x2", 20);

legend.append("svg:text")
.attr("x", 22)
.attr("dy", ".31em")
.text(function(d) { return  d; });
// data limit of 30 uniques values in dimension...
if(mesData.length>30)
	{
	mesData=mesData.splice(0,30);
	dimData=dimData.splice(0,30);
	
	//pending error message dispalying top 30 values..
    }

var totalSum=0;
for(var k=0;k<mesData.length;k++)
	{
	totalSum=totalSum+mesData[k];
	}
for(var k=0;k<mesData.length;k++)
{
percentage[k]=(mesData[k]/totalSum)*100;
}

var yoffsetpercentage=new Array();
var xoffsetpercentage=new Array();

yoffsetpercentage[0]=0;
for( var i=1;i<=percentage.length;i++)
	{
	yoffsetpercentage[i]=(percentage[i-1]/100)*funnelHeight; // calculating the height in ratio of the percentage of the data.
	}
xoffsetpercentage[0]=0;
for( var i=1;i<=percentage.length;i++)
{
xoffsetpercentage[i]=(yoffsetpercentage[i]*funnelWidth)/(2*funnelHeight); // calculating the width in ratio of the height of the data.using tan theta to calculate the ratio.
}

var ellipseRadius;
var verticalSpace;
var xslope;
var xcoord_1,ycoord_1,xcoord_2,ycoord_2,xcoord_3,ycoord_3,xcoord_4,ycoord_4;
var x1y1,x2y2,x3y3,x4y4;
var initial_height=funnelHeight-yoffsetpercentage[yoffsetpercentage.length-1];
var initial_width=xoffsetpercentage[xoffsetpercentage.length-1];

for(var i=xoffsetpercentage.length-1;i>0;i--)
	{
	verticalSpace=(15/100)*yoffsetpercentage[i]; // spacing between the each polygon in funnel is 15% of the height of each polygon
	if(verticalSpace>15)
	verticalSpace=15;
	 xslope=(verticalSpace*funnelWidth)/(2*funnelHeight); // calculating the xslope in ratio of the vertical spacing of the data.using tan theta to calculate the ratio.
	 xcoord_1=funnel_LeftStart+(funnelWidth/2)-initial_width;
	 ycoord_1=initial_height;
	 xcoord_2=funnel_LeftStart+(funnelWidth/2)+initial_width;
	 ycoord_2=ycoord_1;
	
	var gg=svg.append("svg:linearGradient").attr("id","grad"+i).attr("x1","0%").attr("y1","0%").attr("x2","0%").attr("y2","100%");
	gg.append("svg:stop").attr("offset","0%").style("stop-color",function(d){  {xcolor=color(dimData[i-1]); return xcolor;}}).style("stop-opacity",1);
	var newColor = shadeColor(xcolor, -120);
	gg.append("svg:stop").attr("offset","100%").style("stop-color",newColor).style("stop-opacity",1);
	var g=svg.append("svg:g").attr("class","hoverfinal");
	// ry for lower ellipse...
	ellipseRadius=((30*2)/funnelWidth)*((initial_width-xoffsetpercentage[i])+xslope); // max ellipse radius ry is fixed to 30, thereafter radius is calculated as a ratio of the rx of ellipse..
			
	 ycoord_3=initial_height+yoffsetpercentage[i]-verticalSpace;
	 xcoord_3=funnel_LeftStart+(funnelWidth/2)+(initial_width-xoffsetpercentage[i])+xslope;
	 xcoord_4=funnel_LeftStart+(funnelWidth/2)-(initial_width-xoffsetpercentage[i])-xslope;
	 // drawing the lower ellipse...
	 g.append("svg:ellipse").attr("cx",funnel_LeftStart+funnelWidth/2).attr("cy",ycoord_3).attr("rx",(initial_width-xoffsetpercentage[i])+xslope).attr("ry",ellipseRadius).style("fill",newColor).append("title")
	    .text(dimData[i-1]+" ["+mesData[i-1]+"("+percentage[i-1].toFixed(1)+"%)]");
		
	ycoord_4=ycoord_3;
	
	 x1y1= xcoord_1+","+ ycoord_1;
	 x2y2=xcoord_2+","+ycoord_2;
	 x3y3= xcoord_3 +","+ ycoord_3;
	 x4y4 = xcoord_4 +","+ ycoord_4;
	// drawing the polygon...
	g.append("svg:polygon").attr("id","polygontool").attr("points",x1y1.toString()+" "+ x2y2.toString()+" "+x3y3.toString()+" "+ x4y4.toString()).style("fill","url(#grad"+i+")")
	.append("title")
   .text(dimData[i-1]+" ["+mesData[i-1]+"("+percentage[i-1].toFixed(1)+"%)]"); 
	
	ellipseRadius=((30*2)/funnelWidth)*(initial_width);// ry for upper elipse...
	//drawing the upper ellipse...
	g.append("svg:ellipse").attr("cx",funnel_LeftStart+funnelWidth/2).attr("cy",initial_height).attr("rx",initial_width).attr("ry",ellipseRadius).style("fill","url(#grad"+i+")").append("title")
   .text(dimData[i-1]+" ["+mesData[i-1]+"("+percentage[i-1].toFixed(1)+"%)]");
	// if the space is not enuf for dispalying the percentage, it is skipped...
	if(((ycoord_3-ycoord_1)>=5))
	{ g.append("svg:line")
	    .attr("x1", xcoord_3+(yoffsetpercentage[i]/2*funnelWidth)/(2*funnelHeight))
	    .attr("y1", initial_height+(yoffsetpercentage[i]-verticalSpace)/2)
	    .attr("x2", (3/10)*w+funnelWidth)
	    .attr("y2", initial_height+(yoffsetpercentage[i]-verticalSpace)/2)
	    .style("stroke","black");
		g.append("svg:text")
		.attr("x", (3/10)*w+funnelWidth+1).attr("y",initial_height+(yoffsetpercentage[i]-verticalSpace)/2)
		.attr("dy", ".31em").attr("font-size",12)
		.text(mesData[i-1] + "(" +percentage[i-1].toFixed(1)+"%)");
	}
	// calculating the new width and height while drawing bottom to up funnel...	
	initial_height=initial_height-yoffsetpercentage[i-1];
	initial_width=initial_width+xoffsetpercentage[i-1];
		
	}
	
	});
		return chart;
	};	
// set/get width
	chart.width = function(value) {
		if(!arguments.length) {
			return width;
		}
		width = value;
		return chart;
	};
	// set/get height
	chart.height = function(value) {
		if(!arguments.length) {
			return height;
		}
		height = value;
		return chart;
	};
	// set/get data
	chart.data = function(value) {
		if(!arguments.length) {
			return data;
		}
		data = value;
		return chart;
	};
	chart.properties = function(props) {
		if(!arguments.length) {
			return properties;
		}
		properties = props;
		return chart;
	};
	/**
	 * get/set your color palette if you support color palette
	 */
	chart.colorPalette = function(_) {
		if(!arguments.length) {
			return colorPalette;
		}
		colorPalette = _;
		return this;
	};
	

	return chart;
	

	
	};

	

	

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	///////////////////////// Module Configuration /////////////////////////

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	var valueFeed = {

		'id' : 'sap.viz.modules.funnel.valueaxis1',

		'name' : 'Primary Values',

		'type' : 'Measure',

		'min' : 1,

		'max' : Number.POSITIVE_INFINITY,

		'mgIndex' : 1

	};

	

	var dimensionFeed = {

		'id' : 'sap.viz.modules.funnel.dimension',

		'name' : 'Sample',

		'type' : 'Dimension',

		'min' : 1,

		'max' : 1,

		'acceptMND' : false,

		'aaIndex' : 1

	};

	

	var colorFeed = {

		'id' : 'sap.viz.modules.funnel.series.color',

		'name' : 'Category',

		'type' : 'Dimension',

		'min' : 1,

		'max' : Number.POSITIVE_INFINITY,

		'acceptMND' : false,

		'aaIndex' : 2

	};

	var module = {

		'id' : 'sap.viz.modules.funnel',

		'type' : 'CHART',

		'name' : 'funnel Chart',

		'datastructure' : 'DATA STRUCTURE DOC',

		'properties' : {

		},

		'events' : {

		},

		'feeds' : [valueFeed, dimensionFeed, colorFeed],

		'css' : null,

		'configure' : null,

		'fn' : funnelChart

	};
	sap.viz.manifest.module.register(module);

	

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	///////////////////////// Chart Configuration /////////////////////////

	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

	var chart = {

	  id : 'viz/ext/pa/funnel',

	  name : 'funnel Chart',

	  modules : {

	    

	    main : {

	      id : 'sap.viz.modules.xycontainer',

	      modules : {

		      plot : {

			      id : 'sap.viz.modules.funnel'

		      }

	      }

	    }

	  },

	  dependencies : {

	       events : []

	  }

	};
	sap.viz.manifest.viz.register(chart);

})();