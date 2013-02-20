$(document).ready(function(){
  var charts = [
/*
  {
    "chart_category": "Area",
    "chart_name": "Area Chart",
    "chart_id": "area",
    "has_multiple": ""
  },*/

  {
    "chart_category": "Bar",
    "chart_name": "100% Stacked Bar Chart",
    "chart_id": "100_stacked_bar",
    "has_multiple": true
  },
  {
    "chart_category": "Bar",
    "chart_name": "100% Stacked Bar Chart with 2 X-Axes",
    "chart_id": "100_dual_stacked_bar",
    "has_multiple": true
  },
  {
    "chart_category": "Bar",
    "chart_name": "100% Stacked Column Chart",
    "chart_id": "100_stacked_column",
    "has_multiple": true
  },
  {
    "chart_category": "Bar",
    "chart_name": "100% Stacked Column Chart with 2 Y-Axes",
    "chart_id": "100_dual_stacked_column",
    "has_multiple": true
  },
  {
    "chart_category": "Bar",
    "chart_name": "Bar Chart",
    "chart_id": "bar",
    "has_multiple": true
  },
  {
    "chart_category": "Bar",
    "chart_name": "Bar Chart with 2 X-Axes",
    "chart_id": "dual_bar",
    "has_multiple": true
  },
  {
    "chart_category": "Bar",
    "chart_name": "Column Chart",
    "chart_id": "column",
    "has_multiple": true
  },
  {
    "chart_category": "Bar",
    "chart_name": "Column Chart with 2 Y-Axes",
    "chart_id": "dual_column",
    "has_multiple": true
  },
  {
    "chart_category": "Bar",
    "chart_name": "Stacked Bar Chart",
    "chart_id": "stacked_bar",
    "has_multiple": true
  },
  {
    "chart_category": "Bar",
    "chart_name": "Stacked Bar Chart with 2 X-Axes",
    "chart_id": "dual_stacked_bar",
    "has_multiple": true
  },
  {
    "chart_category": "Bar",
    "chart_name": "Stacked Column Chart",
    "chart_id": "stacked_column",
    "has_multiple": true
  },
  {
    "chart_category": "Bar",
    "chart_name": "Stacked Column Chart with 2 Y-Axes",
    "chart_id": "dual_stacked_column",
    "has_multiple": true
  },
  {
    "chart_category": "Combination",
    "chart_name": "Combined Bar Line Chart",
    "chart_id": "horizontal_combination",
    "has_multiple": ""
  },
  {
    "chart_category": "Combination",
    "chart_name": "Combined Bar Line Chart with 2 X-Axes",
    "chart_id": "dual_horizontal_combination",
    "has_multiple": ""
  },
  {
    "chart_category": "Combination",
    "chart_name": "Combined Column Line Chart",
    "chart_id": "combination",
    "has_multiple": ""
  },
  {
    "chart_category": "Combination",
    "chart_name": "Combined Column Line Chart with 2 Y-Axes",
    "chart_id": "dual_combination",
    "has_multiple": ""
  },
  {
    "chart_category": "Line",
    "chart_name": "Horizontal Line Chart",
    "chart_id": "horizontal_line",
    "has_multiple": true
  },
  {
    "chart_category": "Line",
    "chart_name": "Horizontal Line Chart with 2 X-Axes",
    "chart_id": "dual_horizontal_line",
    "has_multiple": true
  },
  
  {
    "chart_category": "Line",
    "chart_name": "Line Chart",
    "chart_id": "line",
    "has_multiple": true
  },
  {
    "chart_category": "Line",
    "chart_name": "Line Chart with 2 Y-Axes",
    "chart_id": "dual_line",
    "has_multiple": true
  },
  {
    "chart_category": "Line",
    "chart_name": "Spark Line Chart",
    "chart_id": "sparkline",
    "has_multiple": ""
  },
  {
    "chart_category": "Pie",
    "chart_name": "Pie Chart",
    "chart_id": "pie",
    "has_multiple": true
  },
  {
    "chart_category": "Pie",
    "chart_name": "Donut Chart",
    "chart_id": "donut",
    "has_multiple": true
  },
  {
    "chart_category": "Scatter",
    "chart_name": "Scatter Plot",
    "chart_id": "scatter",
    "has_multiple": true
  },
  {
    "chart_category": "Scatter",
    "chart_name": "Bubble Chart",
    "chart_id": "bubble",
    "has_multiple": true
  },
  {
    "chart_category": "Map",
    "chart_name": "Tree Map",
    "chart_id": "treemap",
    "has_multiple": ""
  },
  {
    "chart_category": "Map",
    "chart_name": "Heat Map",
    "chart_id": "heatmap",
    "has_multiple": ""
  },
  {
    "chart_category": "Radar",
    "chart_name": "Radar Chart",
    "chart_id": "radar",
    "has_multiple": true
  },
  {
    "chart_category": "Boxplot",
    "chart_name": "Box Plot",
    "chart_id": "boxplot",
    "has_multiple": ""
  },
  {
    "chart_category": "Boxplot",
    "chart_name": "Horizontal Box Plot",
    "chart_id": "horizontal_boxplot",
    "has_multiple": ""
  },
  {
    "chart_category": "Waterfall",
    "chart_name": "Horizontal Waterfall Chart",
    "chart_id": "horizontal_waterfall",
    "has_multiple": ""
  },
  {
    "chart_category": "Waterfall",
    "chart_name": "Waterfall Chart",
    "chart_id": "waterfall",
    "has_multiple": ""
  },
  {
    "chart_category": "Tag Cloud",
    "chart_name": "Tag Cloud",
    "chart_id": "tagcloud",
    "has_multiple": ""
  },
  {
    "chart_category": "Geographic",
    "chart_name": "Geo Bubble Chart",
    "chart_id": "geobubble",
    "has_multiple": ""
  },
  {
    "chart_category": "Geographic",
    "chart_name": "Geo Choropleth Chart",
    "chart_id": "choropleth",
    "has_multiple": ""
  },
  {
    "chart_category": "Geographic",
    "chart_name": "Geo Pie Chart",
    "chart_id": "geopie",
    "has_multiple": ""
  },
  {
    "chart_category": "Multiple",
    "chart_name": "Multiple 100% Stacked Bar Chart",
    "chart_id": "multi_100_stacked_bar",
    "has_multiple": ""
  },
  {
    "chart_category": "Multiple",
    "chart_name": "Multiple 100% Stacked Bar Chart with 2 X-Axes",
    "chart_id": "multi_100_dual_stacked_bar",
    "has_multiple": ""
  },
  {
    "chart_category": "Multiple",
    "chart_name": "Multiple 100% Stacked Column Chart",
    "chart_id": "multi_100_stacked_column",
    "has_multiple": ""
  },
  {
    "chart_category": "Multiple",
    "chart_name": "Multiple 100% Stacked Column Chart with 2 Y-Axes",
    "chart_id": "multi_100_dual_stacked_column",
    "has_multiple": ""
  },
  {
    "chart_category": "Multiple",
    "chart_name": "Multiple Bar Chart",
    "chart_id": "multi_bar",
    "has_multiple": ""
  },
  {
    "chart_category": "Multiple",
    "chart_name": "Multiple Bar Chart with 2 X-Axes",
    "chart_id": "multi_dual_bar",
    "has_multiple": ""
  },
  {
    "chart_category": "Multiple",
    "chart_name": "Multiple Bubble Chart",
    "chart_id": "multi_bubble",
    "has_multiple": ""
  },
  {
    "chart_category": "Multiple",
    "chart_name": "Multiple Column Chart",
    "chart_id": "multi_column",
    "has_multiple": ""
  },
  {
    "chart_category": "Multiple",
    "chart_name": "Multiple Column Chart with 2 Y-Axes",
    "chart_id": "multi_dual_column",
    "has_multiple": ""
  },
  {
    "chart_category": "Multiple",
    "chart_name": "Multiple Donut Chart",
    "chart_id": "multi_donut",
    "has_multiple": ""
  },
  {
    "chart_category": "Multiple",
    "chart_name": "Multiple Horizontal Line Chart",
    "chart_id": "multi_horizontal_line",
    "has_multiple": ""
  },
  {
    "chart_category": "Multiple",
    "chart_name": "Multiple Horizontal Line Chart with 2 X-Axes",
    "chart_id": "multi_dual_horizontal_line",
    "has_multiple": ""
  },
  {
    "chart_category": "Multiple",
    "chart_name": "Multiple Line Chart",
    "chart_id": "multi_line",
    "has_multiple": ""
  },
  {
    "chart_category": "Multiple",
    "chart_name": "Multiple Line Chart with 2 Y-Axes",
    "chart_id": "multi_dual_line",
    "has_multiple": ""
  },
  {
    "chart_category": "Multiple",
    "chart_name": "Multiple Pie Chart",
    "chart_id": "multi_pie",
    "has_multiple": ""
  },
  {
    "chart_category": "Multiple",
    "chart_name": "Multiple Radar Chart",
    "chart_id": "multi_radar",
    "has_multiple": ""
  },
  {
    "chart_category": "Multiple",
    "chart_name": "Multiple Scatter Plot",
    "chart_id": "multi_scatter",
    "has_multiple": ""
  },
  {
    "chart_category": "Multiple",
    "chart_name": "Multiple Stacked Bar Chart",
    "chart_id": "multi_stacked_bar",
    "has_multiple": ""
  },
  {
    "chart_category": "Multiple",
    "chart_name": "Multiple Stacked Bar Chart with 2 X-Axes",
    "chart_id": "multi_dual_stacked_bar",
    "has_multiple": ""
  },
  {
    "chart_category": "Multiple",
    "chart_name": "Multiple Stacked Column Chart",
    "chart_id": "multi_stacked_column",
    "has_multiple": ""
  },
  {
    "chart_category": "Multiple",
    "chart_name": "Multiple Stacked Column Chart with 2 Y-Axes",
    "chart_id": "multi_dual_stacked_column",
    "has_multiple": ""
  },
  {
    "chart_category": "Multiple",
    "chart_name": "Scatter Matrix Chart",
    "chart_id": "scatter_matrix",
    "has_multiple": ""
  },
  {
    "chart_category": "Extensions",
    "chart_name": "Predictive Funnel Chart",
    "chart_id": "ext/pa/funnel",
    "has_multiple": ""
  },
  {
    "chart_category": "Extensions",
    "chart_name": "Predictive ParallelCoordinates Chart",
    "chart_id": "ext/pa/pc",
    "has_multiple": ""
  }
];
function encode4Id(id){
  return id.replace(/\//g,"-")
}
function decode4Id(id){
  return id.replace(/\-/g,"/")
}
  //$("#chart_index").prepend('<span style="font-size:11px;padding-left:100px;">'+charts.length+' charts totally</span>');
  var chartIdx= $("#chart_index>ul"), chartCateUL;

  //charts should be pre-ordered by chart category
  var chartmap = charts.reduce(function(m,cha,i){
    if(!m[cha.chart_category]){
      m[cha.chart_category]=[];
      //add cate to index div
      chartIdx.append('<li><div class="cate">'+cha.chart_category+
        '</div><ul style="display:none;"></ul></li>');
    }
    m[cha.chart_category].push({
          id:cha.chart_id,
          name:cha.chart_name,
          has_multiple:cha.has_multiple
      });

    //add chart to chart category
    chartCateUL = chartIdx.find("li>ul:last");
    chartCateUL.append('<li><div id="'+encode4Id(cha.chart_id)+
      '" class="chartItem'+
      ((cha.has_multiple==true)?' has_multiple':'')+'">'+
      cha.chart_name+'</div></li>');

      return m;
  },{});

  function selectChart(target){
    var $target=$("#"+target);
    // if(typeof target ==="string")
    var targetDecoded = decode4Id(target);
    // else
    //  $target=target
    $("div.cate").removeClass("selected");
    $("div.chartItem").removeClass("selected");
    $target.addClass("selected");
    var targetCate = $target.parent().parent().parent().find("div.cate")
    targetCate.addClass("selected");
    targetCate.parent().find("ul").show("fast");
    $("#chart_title").html($target.html())
    $("#demo_info>a").attr("href","examples/demo_"+target).attr("title", "examples/demo_"+target);
    //$("#demo_info>span").html("examples/demo_"+target);
    //show or hide type chooser
    var curentChart=charts.filter(function(c){
      return c.chart_id === targetDecoded;
    })[0];
    if(curentChart.has_multiple===true||curentChart.chart_category.toLowerCase()==="multiple"){
      if(curentChart.chart_category.toLowerCase()==="multiple"){
        $("#typeChooser>li:first-child").removeClass("selected");
        $("#typeChooser>li:last-child").addClass("selected");
      }else{
        $("#typeChooser>li:first-child").addClass("selected");
        $("#typeChooser>li:last-child").removeClass("selected");
      }
      $("#typeChooser, label[for=typeChooser]").show();
    }else{
      $("#typeChooser, label[for=typeChooser]").hide();
    }
    drawChart(decode4Id(targetDecoded));
  }
  function selectMultiple(id){
    selectChart("multi_"+id);
  }


  var splitter = $("#splitter"),
    splitBtn = $("#splitBtn"),
    chart_index = $("#chart_index"),
    chart_content = $("#chart_content");

  //set content width
  var all = $("#chart_index,#chart_content,#splitter")  
  $(window).resize(function(){
    all.height(1);
    all.height($(document).height()-60);
    $("#chart_index>ul").height(chart_index.height()-118);
    chart_content.width(1)
    var newW =$("body").width()-((chart_index.css("display")==="none")?10:311);
    chart_content.width(newW);
    $("#chart").trigger("resizestop");
    // chart_index.height(0);
    // splitter.height(0);
    // chart_content.height(0);
    // chart_index.height($(window).height()-60);
    // splitter.height(chart_index.height());
    // chart_content.height(chart_index.height());
  });
  // $(window).resize();
  // chart_index.bind("resize",function(){
  //  $("#splitter").height(chart_index.height());
  // });
  // chart_index.resize()
  function toggleIndex(){
    // function(){
      //fix splitBtn position
      // splitBtn.remove();
      // splitter.append(splitBtn);
      if(chart_index.css("display")==="none"){
        splitter.css("left","301px");
        chart_content.css("left","311px");
        chart_content.width(chart_content.width()-chart_index.width()-1);
        chart_index.toggle();
      }else {
        chart_index.toggle();
        splitter.css("left","0px");
        chart_content.css("left","10px");
        chart_content.width(chart_content.width()+chart_index.width()+1);
      }
    // });
  }
  splitter.bind("click",toggleIndex);
  function toggleMenu(target){
    target.parent().find("ul").toggle("fast",function(){
      //chart_index.resize();
    });

  }

  $("div.cate").bind("click",function(e){
    var $target=$(e.target);
    toggleMenu($target);
  });
  function drawChart(chartId){
    var drawFunc=$("#chart").data("drawChart");
    if(drawFunc){
      drawFunc("viz/"+chartId);
    }
  }

  $("div.chartItem").bind("click",function(e){
    selectChart(e.target.id);
  });
  //template swith
    var TemplateManager = sap.viz.TemplateManager;  
    //TemplateManager.loadPath.push("resources/templates/");
  $("#templateChooser>li").bind("click",function(e){
    var currentType=$(e.target).parent().find("li.selected").removeClass("selected").html().toLowerCase();
    var type=$(e.target).addClass("selected").html().toLowerCase();
    if(currentType===type)
      return;
    TemplateManager.apply(type);
  });
  //type switch
  $("#typeChooser>li").bind("click",function(e){
    // if(e.target.tagName!=="LI")
    //  return;
    var currentType=$(e.target).parent().find("li.selected").removeClass("selected").html().toLowerCase();
    var type=$(e.target).addClass("selected").html().toLowerCase();
    if(currentType===type)
      return;
    var curentChartId=$("div.chartItem.selected").attr("id");
    if(currentType==="single"&&type==="multiple"){
      selectMultiple(curentChartId)
    }
    if(currentType==="multiple"&&type==="single"){
      selectChart(curentChartId.replace("multi_",""))
    }

  });
  $("#chart").resizable();
  
  $(window).resize();
  selectChart("100_stacked_bar")
});