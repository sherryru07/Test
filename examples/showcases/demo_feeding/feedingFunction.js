

function initParameter(feedsClass,dataFeed,CrosstableDataset,viz,Manifest,queryTable,templateManager) {

	var dcContainers = [];
	var localChartInstance;
	var localFeedsClass = feedsClass;
	var localDataFeed = dataFeed;
	var localCrosstableDataset = CrosstableDataset;
	var localVIZ = viz;
	var localManifest = Manifest;
	var localTable = queryTable;
	var localTemplateManager = templateManager;

	//get the localDataFeed[k].feed.min
	function getMinFeedLength(feedDataName){
		for (var k=0;k<localDataFeed.length;k++) {
			if(feedDataName == localDataFeed[k].name){
			   return localDataFeed[k].feed.min;
			}
		}
		
		return 0;
	}
	//check the AnalsisAxis whether need to be feeded.
	function needAnalysisAxisFeed(feedDataName){

		if(getMinFeedLength(feedDataName)==0)
			return true;
		else if(getMinFeedLength(feedDataName)==1){
			for (var k=0;k<localDataFeed.length;k++) {
				if(feedDataName == localDataFeed[k].name){
					if (localDataFeed[k].dc.length > 0 && localDataFeed[k].dc[0].colName == "MND"	)
						return	true;   
					// if (localDataFeed[k].dc.length == 0 && localDataFeed[k].feed.acceptMND>-1 )
					// 	return	true;  		
				}
			}
		
		}

		return false;
	}
	//judge the chart is Geo or not
	function isGeoOrNor()
	{
		var thisChartId = $('#chartIds').val();
		if(thisChartId.search('geo')==-1&&thisChartId.search('choropleth')==-1)
			return false;

		else return true ;
	}
	//delete attribution for LocalDataFeed ,include dc ,name,feed.
	function deleteExtraAttrForLocalDataFeed()
	{
		for(var j = 0 ;j<localDataFeed.length;j++){
			delete (localDataFeed[j].dc);
			delete (localDataFeed[j].name);
			delete (localDataFeed[j].feed);
		
		}
	}
	function autoFeedAndAdjust(_parameter){
		var parameter = _parameter;
		var feedId = {};
		var analysisAxisArray= [];
		//collect the analysisAxises
		for (var k=0;k<localDataFeed.length;k++) {
			//revert the multiplier's dc array
			if(localDataFeed[k].id == "multiplier") {
				var revertDc = [];
				for (var r=localDataFeed[k].dc.length-1;r>=0;r--) {
					revertDc.push(localDataFeed[k].dc[r]);
				}
				localDataFeed[k].dc = revertDc;
			}
			for(var t=0;t<localDataFeed[k].dc.length;t++){
				if(localDataFeed[k].name=="AA1" && localDataFeed[k].dc[t].colName != "MND") {
					analysisAxisArray[0] = 1;
				}else if(localDataFeed[k].name=="AA2" && localDataFeed[k].dc[t].colName != "MND") {
					analysisAxisArray[1] = 1;
				}else if(localDataFeed[k].name=="AA3" && localDataFeed[k].dc[t].colName != "MND") {
					analysisAxisArray[2] = 1;
				}
			}
		}
		if (analysisAxisArray[0] + analysisAxisArray[1] + analysisAxisArray[2] == 3) {
			for (var k = 0; k < analysisAxisArray.length; k++) {
				analysisAxisArray[k] = 0;
			}
			$('#chart').empty();
			$('#feedingStatus').text("Can\'t feed three analysisaxises in multi-chart.");
			$('div#dataTable').empty();
			return;
		}
		else {
			
			for(var j = 0; j < localDataFeed.length; j++){
				var feedData  = localDataFeed[j];
				var pName = "";
				if(feedData.name == 'AA1'){
					if(feedId.aa1Id!=null&&feedId.aa1Id!=undefined){
						var newBinding = {};
						newBinding.type = 'measureNamesDimension';
						feedData.binding[0]=newBinding;
					}
					else {
						pName = "aa1";
						feedId.aa1Id = feedData.feedId;
					}			  
				}else if(feedData.name == 'AA2'){
					if(analysisAxisArray[0] != 1 &&  needAnalysisAxisFeed('AA1') == true) {
						pName = "aa1";
						feedId.aa1Id = feedData.feedId;
						if(feedData.binding[0] != null) {
							feedData.binding[0].index = 1;
						}
					}
					else if(analysisAxisArray[0] != 1&&analysisAxisArray[2]==1&&analysisAxisArray[1]==1){
						pName = "aa1";
						feedId.aa1Id = feedData.feedId;
						if(feedData.binding[0] != null) {
							feedData.binding[0].index = 1;
						}	
							
					}
					
					else if(analysisAxisArray[2]==1&&feedData.feed.min==1&&feedData.dc==0&&feedData.feed.acceptMND>-1){
						
						var newBinding = {};
						newBinding.type = 'measureNamesDimension';
						feedData.binding[0]=newBinding;
					}
					else {
						pName = "aa2";
						feedId.aa2Id = feedData.feedId;
					}
				}else if(feedData.name == 'AA3') {
					
					if(analysisAxisArray[0]!=1&&analysisAxisArray[1]!=1 && needAnalysisAxisFeed('AA1') == true) {
						
						for(var k = 0;k<localDataFeed.length;k++){
							if(localDataFeed[k].name =='AA2'&&localDataFeed[k].feed.min==1){
								pName = "aa2";
								feedId.aa2Id = feedData.feedId;		
							}
						}
						pName = "aa1";
						feedId.aa1Id = feedData.feedId;
						if(feedData.binding[0] != null) {
							feedData.binding[0].index = 1;
						}
					}else {
						pName = "aa2";
						feedId.aa2Id = feedData.feedId;
					}
				} else if (feedData.name == 'MV1') {
					pName = "mv1";
					feedId.mv1Id = feedData.feedId;
				} else if (feedData.name == 'MV2') {
					pName = "mv2";
					feedId.mv2Id = feedData.feedId;
				} else if (feedData.name == 'MV3') {
					pName = "mv3";
					feedId.mv3Id = feedData.feedId;
				} else if (feedData.name == 'MV4') {
					pName = "mv4";
					feedId.mv4Id = feedData.feedId;
				}

				var pValue = "";
				var k = 0;
				var length = Math.max(feedData.dc.length,feedData.feed.min);
				for (var i = 0; i < length; i++) {
					if(feedData.dc.length > i) {
						if (feedData.dc[i].colName != "MND") {
							if (k == 0) {
								pValue += feedData.dc[i].colName;
								k += 1;
							} else {
								pValue += "," + feedData.dc[i].colName;
								k += 1;
							}
						}
					}else {
							if (k == 0) {
									pValue += "fakeData";
									k += 1;
							} else {
									pValue += "," + "fakeData";
									k += 1;
							}
					}
				}
				if (pValue != ''&&pName !='')
					parameter[pName] = pValue;
				
			}
			if(isGeoOrNor()==true)
			{
				//find the right geoIndex.
				if(parameter['aa1']!=undefined&&(parameter['aa1'].toLowerCase()=="country"||parameter['aa1'].toLowerCase()=="city"))
					parameter["geoIndex"] = 1;
				if(parameter['aa2']!=undefined&&(parameter['aa2'].toLowerCase()=="country"||parameter['aa1'].toLowerCase()=="city"))
					parameter["geoIndex"] = 2;
				if(parameter['aa3']!=undefined&&(parameter['aa3'].toLowerCase()=="country"||parameter['aa1'].toLowerCase()=="city"))
					parameter["geoIndex"] = 3;
				//if there are fake data , for Geo chart, will return countrys.The countrys for geoFeatures need featureID
				for(var i = 0 ;i<localDataFeed.length;i++){
					var feedId = localDataFeed[i].feedId;
					if(feedId=="geoFeatures"){
						var pName = localDataFeed[i].name;
						if(pName == 'AA1')
							parameter["geoIndex"] = 1;
						else if(pName == 'AA2')
							parameter["geoIndex"] = 2;
						else if(pName == 'AA3')
							parameter["geoIndex"] = 3;
						break;
					}
						
				}
				
					
			}
			
		}
		return parameter;
	}
	/**
	 * 
	 * @param templateId
	 */
	function createChart(templateId){
		var d3color = d3.scale.category20().range();
		var columnNumber =$("#Columns").find('ul li span').length;
		var chartOption = {
			multiLayout : {
				'numberOfDimensionsInColumn' : columnNumber
			}
		};
		//alert("begin create chart");
		var parameter =  {
						 table: localTable,
						 action: "getFeedData"
						};
		parameter = autoFeedAndAdjust(parameter);
		if(parameter == null && parameter == undefined )return ;

		deleteExtraAttrForLocalDataFeed();
		
		_getDataFromNodeServer(parameter,function(data) {
			$('#dataString').val(JSON.stringify(data));
			$('#feedingString').val(JSON.stringify(localDataFeed));
			$('#optionsString').val(JSON.stringify(chartOption));
			for (var i=0;i<data.length;i++){
				if(data[i].feedId == 'AA1')
				   data[i].feedId = feedId.aa1Id;
				else if(data[i].feedId == 'AA2')
				   data[i].feedId = feedId.aa2Id;
				else if(data[i].feedId == 'MV1')
				   data[i].feedId = feedId.mv1Id;
				else if(data[i].feedId == 'MV2')
				   data[i].feedId = feedId.mv2Id;
				else if(data[i].feedId == 'MV3')
					data[i].feedId = feedId.mv3Id;
				else if(data[i].feedId == 'MV4')
					data[i].feedId = feedId.mv4Id;
			}
			// $('#chart').width($('body').width()-$('#feeds').width()-15);
			// $('#chart').height($('#feeds').height());
			$('#chart').empty();
			

			if(localChartInstance!=null||localChartInstance!=undefined){
				localChartInstance.destroy();
				localChartInstance = null;
			}
			drawTable($('div#dataTable'),data);
			localTemplateManager.apply(templateId, function(){
				var ds = new localCrosstableDataset();
				ds.setData(data);
				localChartInstance = localVIZ.createViz({
				type : $("#chartIds").attr('value'),
				data : ds,
				container : $('#chart'),
				options : chartOption,
				dataFeeding : localDataFeed
				});
			} );
			
			
		});
	}
	function generateLocalDataFeed(){
		var feeds = Manifest.viz.get($("#chartIds").attr('value')).allFeeds();
		localFeedsClass = $('.feed');
		localDataFeed = [];
		$('textarea').val('');		
		for (var i = 0; i < localFeedsClass.length; i++) {
			var feeded = {};
			var feedPos = jQuery(localFeedsClass[i]).attr("feedPos");
			feeded.feed = feeds[feedPos];
			feeded.feedId = feeds[feedPos].id;
			var dcContainer = jQuery(localFeedsClass[i]).find('ul li span');
			feeded.dc = [];
			feeded.binding = [];
			if (feeded.feed.type == 'Dimension')
				feeded.name = 'AA' + feeded.feed.aaIndex;
			else
				feeded.name = 'MV' + feeded.feed.mgIndex;
			var t = 0;
			if (dcContainer.length > 0) {
				for (var j = 0; j < dcContainer.length; j++) {
					var binding = {};
					var dc = dcContainers[jQuery(dcContainer[j]).attr("dcpos")];
					
					if (feeded.name == 'AA1') {
						if (dc.colName != "MND") {
							binding.type = "analysisAxis";
							binding.index = 1;
						} else {
							binding.type = "measureNamesDimension";
						}
					} else if (feeded.name == 'AA2') {
						if (dc.colName != "MND") {
							binding.type = "analysisAxis";
							binding.index = 2;
						} else {
							binding.type = "measureNamesDimension";
						}
					} else if (feeded.name == 'AA3') {
						if (dc.colName != "MND") {
							binding.type = "analysisAxis";
							binding.index = 2;
						} else {
							binding.type = "measureNamesDimension";
						}
					} else if (feeded.name == 'MV1') {
						binding.type = "measureValuesGroup";
						binding.index = 1;
					} else if (feeded.name == 'MV2') {
						binding.type = "measureValuesGroup";
						binding.index = 2;
					} else if (feeded.name == 'MV3') {
						binding.type = "measureValuesGroup";
						binding.index = 3;
					} else if (feeded.name == 'MV4') {
						binding.type = "measureValuesGroup";
						binding.index = 4;
					}

					feeded.dc[j] = dc;
					if (j == 0) {
						feeded.binding[t++] = binding;
					} else {
						var k;
						for ( k = feeded.binding.length - 1; k >= 0; k--) {
							if (feeded.binding[k].type == binding.type) {
								break;
							}
						}
						if (k < 0) {
							feeded.binding[t++] = binding;
						}
					}
				}
			} else if($('#ghostGen').attr('checked') == true){
				var binding = {};
				if (feeded.feed.min > 0) {
					if (feeded.name == 'AA1') {
						binding.type = "analysisAxis";
						binding.index = 1;
					} else if (feeded.name == 'AA2') {
						binding.type = "analysisAxis";
						binding.index = 2;
					} else if (feeded.name == 'AA3') {
						binding.type = "analysisAxis";
						binding.index = 2;
					} else if (feeded.name == 'MV1') {
						binding.type = "measureValuesGroup";
						binding.index = 1;
					} else if (feeded.name == 'MV2') {
						binding.type = "measureValuesGroup";
						binding.index = 2;
					} else if (feeded.name == 'MV3') {
						binding.type = "measureValuesGroup";
						binding.index = 3;
					} else if (feeded.name == 'MV4') {
						binding.type = "measureValuesGroup";
						binding.index = 4;
					}
					feeded.binding[t++] = binding;
				}
			}
			
			localDataFeed[i] = feeded;
		}
	}
	function verifyLocalDataFeed(){
		var fakeFlag = false;
		var hasRealDataContainer = false;
		
		for (var i =0;i<localDataFeed.length;i++){
			var dcContainer = jQuery(localFeedsClass[i]).find('ul li span');

			if (localDataFeed[i].feed.type == 'Dimension') {
				for(var j = 0 ;j<localDataFeed[i].dc.length;j++){
					if (localDataFeed[i].dc[j].type != 'varchar') {
						$('#chart').empty();
						$('#feedingStatus').text('Error: ' + localDataFeed[i].feed.name + " should be feeded dimension " +localDataFeed[i].dc[j].colName + " is not a dimension");
						$('#feedingStatus').attr('style', 'color:red');
						$('div#dataTable').empty();
						return ;
					} else {
						if ((localDataFeed[i].feed.acceptMND == undefined || localDataFeed[i].feed.acceptMND < 0) && localDataFeed[i].dc[j].colName == "MND") {
							$('#chart').empty();
							$('#feedingStatus').text('Error: ' + localDataFeed[i].feed.name + " don't accept a measureNamesDimension");
							$('#feedingStatus').attr('style', 'color:red');
							$('div#dataTable').empty();
							return;
						}
					}
				}
			}
			if (localDataFeed[i].feed.type == 'Measure' ) {
				for(var j = 0 ;j<localDataFeed[i].dc.length;j++){
					if (localDataFeed[i].dc[j].type == "varchar"){
						$('#chart').empty();
						$('#feedingStatus').text('Error: ' + localDataFeed[i].feed.name + " should be feeded dimension " + localDataFeed[i].dc[j].colName + " is not a measure");
						$('#feedingStatus').attr('style', 'color:red');
						$('div#dataTable').empty();
						return;
					}
				}
			}
			if (localDataFeed[i].feed.type == "Dimension") {
				if (localDataFeed[i].feed.max < localDataFeed[i].binding.length) {
					$('#chart').empty();
					$('#feedingStatus').text('Error: ' + localDataFeed[i].feed.name + " Dimension count is more than feeding definition");
					$('#feedingStatus').attr('style', 'color:red');
					$('div#dataTable').empty();
					return;
				}
				if (localDataFeed[i].dc.length < localDataFeed[i].feed.min ) {
					if($('#ghostGen').attr('checked') == true) {
						$('#feedingStatus').text('Warnning: ' + localDataFeed[i].feed.name + "Dimension count is less than feeding definition");
						$('#feedingStatus').attr('style', 'color:orange');
						fakeFlag = true;
					}else {
						$('#chart').empty();
						$('#feedingStatus').text('Error: ' + localDataFeed[i].feed.name + " Dimension count is less than feeding definition");
						$('#feedingStatus').attr('style', 'color:red');
						$('div#dataTable').empty();
						return;
					}
				}
				
				if(localDataFeed[i].dc.length > 0){
				   hasRealDataContainer = true;
				}
				
			} else if (localDataFeed[i].feed.type == "Measure") {
				if (localDataFeed[i].feed.max < dcContainer.length) {
					$('#chart').empty();
					$('#feedingStatus').text('Error: ' + localDataFeed[i].feed.name + " Measure count is more than feeding definition");
					$('#feedingStatus').attr('style', 'color:red');
					$('div#dataTable').empty();
					return;
				}
				
				if (localDataFeed[i].dc.length < localDataFeed[i].feed.min ) {
					if($('#ghostGen').attr('checked') == true) {
						$('#feedingStatus').text('Error: ' + localDataFeed[i].feed.name + " Measure count is less than feeding definition");
						$('#feedingStatus').attr('style', 'color:orange');
						fakeFlag = true;
					}else {
						$('#chart').empty();
						$('#feedingStatus').text('Error: ' + localDataFeed[i].feed.name + " Dimension count is less than feeding definition");
						$('#feedingStatus').attr('style', 'color:red');
						$('div#dataTable').empty();
						return;
					}
				}
				
				if(localDataFeed[i].dc.length > 0){
				   hasRealDataContainer = true;
				}
			}

		}
		if (fakeFlag == true) {
			$('#feedingStatus').text('Fake Feeding is Complete');
		} else {
			$('#feedingStatus').text('Success Feeding Complete');
		}
		$('#feedingStatus').attr('style', 'color:green');
		var result = {
			fakeFlag:fakeFlag,
			hasRealDataContainer:hasRealDataContainer
		};
		return result;
		
	}
	var chart = {
		doFeed :function () {
			//var feeds = Manifest.viz.get($("#chartIds").attr('value')).allFeeds();
			localFeedsClass = $('.feed');
			localDataFeed = [];

			generateLocalDataFeed();
			
			var verifyResult ={};
			verifyResult = verifyLocalDataFeed();
			
			var templateId = $("#templates").val();
			if(verifyResult == undefined||verifyResult==null)
				return;
			if(verifyResult.fakeFlag){
				if(verifyResult.hasRealDataContainer==true)
					templateId = "incomplete_ghost";
				else
			 	   templateId = "empty_ghost";
			}
			createChart(templateId);
		},
		

		applySettings :function () {
			$('#chart').empty();
			if($('#feedingString').val() != '') {
				localDataFeed = JSON.parse($('#feedingString').val());
			}else {
				localDataFeed = null;
			}
			if($('#dataString').val() != '') {
				data = JSON.parse($('#dataString').val());
			}else {
				alert("can't generate data array by empty string");
				return;
			}
			if($('#optionsString').val() != '') {
				chartOption = JSON.parse($('#optionsString').val());
			}else {
				alert("can't generate options array by empty string");
				return;
			}
			var ds = new localCrosstableDataset();
			ds.setData(data);
			if(localChartInstance!=null||localChartInstance!=undefined){
					localChartInstance.destroy();
					localChartInstance = null;
				}
			localChartInstance = localVIZ.createViz({
			type : $("#chartIds").attr('value'),
			data : ds,
			container : $('#chart'),
			options : chartOption,
			dataFeeding : localDataFeed
			});
			drawTable($('div#dataTable'),data);
		},
		updateData: function (){
			var data,localDataFeed;
			if($('#feedingString').val() != '') {
				localDataFeed = JSON.parse($('#feedingString').val());
			}else {
				localDataFeed = null;
			}
			if($('#dataString').val() != '') {
				data = JSON.parse($('#dataString').val());
			}else {
				alert("can't generate data array by empty string");
				return;
			}
			drawTable($('div#dataTable'),data);
			var ds = new localCrosstableDataset();
			ds.setData(data);
			var newData = {
				data:ds,
				feeding:localDataFeed
			};
			
			localChartInstance.update(newData);
		},
		setDcContainers : function(_){
			if(arguments.length == 0)
				return ;
			else
				dcContainers = _;
		}

	}

	return chart;
}



