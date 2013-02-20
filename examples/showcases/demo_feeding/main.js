$(function(){
		sap.viz.TemplateManager.loadPath=["../../resources/templates/"];
		sap.viz.lang.langManager.loadPath=["../../resources/langs/"];
	var Environment = sap.viz.env;
	var CrosstableDataset = sap.viz.data.CrosstableDataset;
	var viz = sap.viz.core;
	var Manifest = sap.viz.manifest;
	var TemplateManager = sap.viz.TemplateManager;
	Environment.initialize({
	'log': 'debug'
	});

	//a instance of feedingFunction
	var feedControl; 

	function smartLayout(){
		$('div#feeds').change(
		function()
		{
			// $('div#dataTable').width($('body').width()-$('div#feeds').width()-$('#feedingString').width()-15);
			$('#dataDisplay').height($('body').height()-$('#chartDisplay').height()); 
			$('#dataTable').width($('body').width()-$('#feedingString').width()-$('#dataString').width()-$('#optionsString').width()-30);
		});
	}

	function initChartId(){
		var chartMap =[];
			Manifest.viz.each(function(_viz, id){
				if(_viz["abstract"] == false)
					  chartMap.push({
						  value: id					  });
			});
			chartMap.sort(function(a,b){
	            return a.value > b.value ? 1: -1;
	        });
			 for( i = 0, length = chartMap.length; i < length; i++){
				 $("#chartIds").append('<option value=' + chartMap[i].value + '> ' + chartMap[i].value + '</option>');
	         }
			$("#chartIds").val('viz/bar');
	}

	(function (){
		
		// var _severURL = 'http://10.193.229.55:8800/';	
		var _severURL = 'http://shgtgvmwin007.dhcp.pgdev.sap.corp:8800/';
		var _genURL = function(type){
			switch(type){
				case 'getData':
					return (_severURL + 'dataquery/data?jsoncallback=?');
				case 'getMetaData':
					return (_severURL + 'dataquery/metadata?jsoncallback=?');
				case 'getFeedData':
					return (_severURL + 'datafeed/feed?jsoncallback=?');
				case 'getTable':
					return (_severURL + "dataquery/table?jsoncallback=?");
				case 'getFeedAll':
					return (_severURL + 'datafeed/feedall?jsoncallback=?');
			}	
		};
		
		_getDataFromNodeServer = function(dataPara,callback){
			$.ajax({				
				url: _genURL(dataPara.action),
				dataType: 'json',
				data: dataPara,
				success: callback,
				contentType :"application/json; charset=UTF-8",
				scriptCharset : 'UTF-8'
			});
		};

	})();
	function initDataSet() {
		//add some change callback
		$("#chartIds").change(function(){
			chooseDataSets();
			chartChange();
		});
		$("#dataSets").change(function(){
			dataSetsChange();
		});
		_getDataFromNodeServer({action: "getTable"},
		function(data) {
			var i =0;
			while(i < data.vizst.length) {
				var option = data.vizst[i];
				$('#dataSets').append('<option value=' + option + '> ' + option + '</option>');
				i++;
			};
			$('#dataSets').val('a1a1a2a2a2mmmm');
			// chartChange();
			//showDataContainers($('#dataSets').attr('value'));
			$('#dataSets').change();
		});
		// $('#dataSets').append('1');
	}

	function initFeedingPanel(){
		//enable the sort function between feed items and dimension/measure items
			var sortOpts1 = {
					 items: "#stitle",
					 connectWith: [".feedContainer", ".dataContainer"],
					 update: function(event, ui){
						feedControl.doFeed();
						// $('div#dataTable').width($('body').width()-$('div#feeds').width()-$('#feedingString').width()-15);
						// $('#dataDisplay').height($('body').height()-$('#chartDisplay').height()); 
						// $('#dataTable').width($('body').width()-$('#feedingString').width()-$('#dataString').width()-$('#optionsString').width()-30);
					 }
				 };
			
			var sortOpts2 = {
					 items: "#stitle",
					 connectWith: [".feedContainer", ".dataContainer"],
					 placeholder: "ui-state-highlight"
				 };
			$(".feedContainer").sortable(sortOpts1);
			$(".dataContainer").sortable(sortOpts2);
	}
	function initTemplate(){
		var templateSelect = $("#templates");
		templateSelect.change(function() {
			TemplateManager.apply(this.value);
		});
	}
	var setup = function() {
		
		 //do some initial 
		smartLayout();			
		initChartId();
		
		//initFeedingPanel
		initFeedingPanel();
		//initTemplate
		initTemplate();
		//asynchronous
		initDataSet();
		
		
	    //for feedControl = feeding()
		feeding = function(){
			var feedsClass = $('.feed');
			var dataFeed = [];
			return initParameter(feedsClass,dataFeed,CrosstableDataset,viz,Manifest,queryTable, TemplateManager );
			//return initParameter(feedsClass,CrosstableDataset,viz,Manifest,queryTable, TemplateManager );
			
		};
		
		
	};

	function showFeeds(chartType){
		$('#measureTree li').remove();
		$('#dimensionTree li').remove();
		$('#Trillis h4').remove();
		$('#Trillis #trillisTree').remove();
		// feeds = Feeder(Manifest.viz.get($("#chartIds").attr('value')).allFeeds(), null, null).getFeeds();
		var feeds = Manifest.viz.get($("#chartIds").attr('value')).allFeeds();
		for (var i = 0; i < feeds.length; i++) {
			var feed = feeds[i];
			if(feed.type == 'Dimension'){	
				if(feed.id != "multiplier") {
					$('#dimensionTree').append('<li class=feed feedPos=' + i+ '><span>' + feed.name+ '</span><ul><li></li><li></li></ul></li>');
					$('#dimensionTree li ul li').attr("id", "stitle");
				}else {
					$('div#Trillis').append('<h4 class="ui-widget-header">Trillis</h4>');
					$('div#Trillis').append('<ul id="trillisTree" class="ui-widget-content"></ul>');
					$('#trillisTree').append('<div id="trillisTreeView" class=feed feedPos=' + i+ '></div>');
					$('#trillisTreeView').append('<li id="Columns"><span>ColumnBy:</span><ul><li></li><li></li></ul></li>');
					$('#trillisTreeView').append('<li id="Rows"><span>RowBy:</span><ul><li></li><li></li></ul></li>');
					$('#trillisTreeView li ul li').attr("id", "stitle");
				}
			}else {
				$('#measureTree').append('<li class=feed feedPos=' + i+ '><span>' + feed.name + '</span><ul><li></li><li></li></ul></li>');
				$('#measureTree li ul li').attr("id", "stitle");
			}
		}
		$('.feedTB').remove();
		for(var i = 0; i < feeds.length; i++){
			var feed = feeds[i];
			var td = '<tr class = feedTB>' + 
				 '<td>' + feed.id + '</td>' + 
				 '<td>' + feed.name + '</td>' + 
				 '<td>' + feed.type + '</td>' + 
				 '<td>' + feed.min + '</td>' +
				 '<td>' + feed.max + '</td>' +
				 '<td>' + feed.aaIndex + '</td>' +  
				 '<td>' + feed.mgIndex + '</td>' + 
				 '<td>' + feed.acceptMND + '</td>' + 
				 '<td>' + feed.maxStackedDims + '</td>' + 
				 '</tr>';

		   $('#feedTable').append(td);
		}
	}
	function showDataContainers(table){
		queryTable = table;
		_getDataFromNodeServer({
					table: table,
					action: "getMetaData"
				},
				function(data) {
				   $('#dataTree li').remove();
				    var dcContainers = data;
				   var i;
				   for (i=0;i<dcContainers.length;i++){
						var c ;
						if(dcContainers[i].type == "varchar") {
							c = "ui-dimension";
						}else {
							c = "ui-measure";
						}
						$('#dataTree').append('<li><span class='+c+' dcPos=' + i +'>' + dcContainers[i].colName + '</span></li>');
						
					}	
					$('#dataTree').append('<li><span dcPos=' + i + '>MND</span></li>');
					var dataMND = {
						colName : "MND",
						pos : ""+(i+1),
						type : "varchar"
					};
					dcContainers.push(dataMND);
					$('#dataTree li').attr("id", "stitle");
					$('#dataTree li').attr('class','ui-state-default');
					//initial feedControl 
					if(feedControl==null)
						feedControl = feeding();
					feedControl.setDcContainers(dcContainers);
					feedControl.doFeed();
				});
		$('.feedContainer li ul li').attr('class','ui-state-highlight');  
	}

	function dataSetsChange() {
		var	table = $("#dataSets").attr("value");
		$('div#dataTable').empty(); 
		$('#dataString').val('');
		$('#feedingString').val('');
		$('#optionsString').val('');
		showFeeds($("#chartIds").attr('value'));
		showDataContainers($('#dataSets').attr('value'));
		$('#chart').empty();	
		$('#feedingStatus').text('No Feeding');
	}

	function chartChange(){
		$('div#dataTable').empty(); 
		$('#dataString').val('');
		$('#feedingString').val('');
		$('#optionsString').val('');
		showFeeds($("#chartIds").attr('value'));
		showDataContainers($('#dataSets').attr('value'));
		$('#chart').empty();	
		$('#feedingStatus').text('No Feeding');
	}

	function chooseDataSets(){
		var thisChartId = $('#chartIds').val();
		// for geo chart ,we choose corresponding ds
		if(thisChartId.search('geo')==-1&&thisChartId.search('choropleth')==-1)
		{
			var dataSetsForGeo = $('#dataSets option');
			for(var i = 0 ; i< dataSetsForGeo.length ;i++)
			{
					dataSetsForGeo[i].disabled = "";
				
			}
		}
		else 
		{
			var dataSetsForGeo = $('#dataSets option');
			for(var i = 0 ; i< dataSetsForGeo.length ;i++)
			{
				if(dataSetsForGeo[i].value.search('geo')==-1&&dataSetsForGeo[i].value.search('choropleth')==-1)
					dataSetsForGeo[i].disabled = "disabled";			
			}
			dataSetsForGeo = $('#dataSets option:enabled');
			$("#dataSets").val("dataSetsForGeo[0].text");
		}

	}
	applySettings = function (){
		feedControl.applySettings();
	}
	updateData = function (){
		feedControl.updateData();
	}
	gostSwitch = function (){
		feedControl.doFeed();
	}

	setup();
});
