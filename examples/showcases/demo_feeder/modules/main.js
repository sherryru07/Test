sap.riv.require(
[
{
  qname : 'sap.viz.core',
  version : '4.0.0'
},
{  qname : 'sap.viz.manifest',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.CrosstableDataset',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.feed.feeder',
  version : '4.0.0'
},
{  qname : 'sap.viz.data.handler.BaseDataHandler',
  version : '4.0.0'
}
],
function main(viz, Manifest, CrosstableDataset, Feeder, BaseDataHandler) {
	$(function() {
		
		//Env.initialize({
		//	'locale' : 'en_US',
		//	'log' : 'debug'
		//});
		
		var dataSets = {};
		var feeding = {};
		
		(function (){
			 
			Manifest.viz.each(function(viz, obj){
				if(viz["abstract"] == false)
				  $("#chartIds").append('<option value=' + obj + '> ' + obj + '</option>');
			});
			
			$("#chartIds").change(function(){
				
				chartChange();
			});
			
			var ds = {                                             
                        "analysisAxis" : [ {                        
                            "index": 1,                      
                            "data":                                   
                                       [                                     
                                         {                                                                           
                                             "name"  : "Country",
                                             "values": ["China", "China","France", "France","German", "German", "USA","USA"]                                      
                                         },                                   
                                         {                                                                          
                                             "name"  : "YEAR",
                                             "values": ["2001", "2002", "2001", "2002", "2001", "2002", "2001", "2002"]
                                         }
                                       ]                   
                             },{                         
                            "index": 2,                        
                            "data":                                    
                                       [
                                        {
                                            "name"   : "Product",                                         
                                            "values" : ["CAR", "TRUNK"]
                                        }                                     
                                       ]                       
                             }
                         ],   
         
                       
                       "measureValuesGroup":[{
                           "index": 1,                        
                           "data":                                    
                                       [
                                         {
                                            "name"   : "Profit",
                                            "values" : [[10,32,23,43,123,34,14,25],[12,78,45,86,34,56,23,76]]
                                         }
                                       ]
                          }]
                   };
			
			var feeding = [
			               {
			            	    "feedId": "RegionColor",
			            	    "binding": [{
			            	      "type": "analysisAxis",
			            	      "index": 2
			            	    }]
			            	  },
			            	  {
			            	    "feedId": "AxisLabels",
			            	    "binding": [{
			            	      "type": "analysisAxis",
			            	      "index": 1
			            	    }]
			            	  },
			            	  {
			            	    "feedId": "PrimaryValues",
			            	    "binding": [{
			            	      "type": "measureValuesGroup",
			            	      "index": 1
			            	    }]
			            	  }
			            	];
			$("#dataset").val(JSON.stringify(ds));
			$("#feeding").val(JSON.stringify(feeding));
			chartChange();
			initDataSets();
		})();
		
		function initDataSets(){
			dataSets['A1,A2,MV1'] = {
					'analysisAxis': [{
						'data' : [{
							'name' : 'Country',
							'values' : ['China', 'China', 'USA', 'USA', 'Canada', 'Canada']
						}, {
							'name' : 'Year',
							'values' : ['2001', '2002', '2001', '2002', '2001', '2002']
						}],
						'index': 2
					}, {
						'data' : [{
							'type' : 'Dimension',
							'name' : 'Product',
							'values' : ['Car', 'Truck']
						}],
						'index': 1
					}], 
					
					'measureValuesGroup':[{
						'data' : [{
							'type' : 'Measure',
							'name' : 'Profit',
							'values' : [[25, 136], [58, 128], [58, 24], [159, 147], [149, 269], [38, 97]]
						},{
							'type' : 'Measure',
							'name' : 'Revenue',
							'values' : [[25, 13], [8, 1], [8, 2], [19, 17], [14, 9], [8, 7]]
						}],
						'index': 1
					}]};
			
			/*feeding['A1,A2,MV1'] = [
			                     {
			                         'feedId'   : 'RegionColor',
			                         'binding'   : [{
			                                        'type' : 'analysisAxis',
			                                        'index':  2 
			                                      }]
			                       },{

			                         'feedId'   : 'AxisLabels',                       
			                         'binding' : [{
			                                      'type' :'analysisAxis',                                
			                                      'index': 1
			                                    }]
			                       },{
			                         'feedId' : 'PrimaryValues',                      
			                         'binding' : [{
			                                      'type' : 'measureValuesGroup',                                
			                                      'index':  1
			                                    }]
			                       }

			                  ];*/
			///////////
			dataSets['A1MND,A2,MV1'] = dataSets['A1,A2,MV1'];
			feeding['A1MND,A2,MV1'] = [
			                     {
			                         'feedId'   : 'RegionColor',
			                         'binding'   : [{
			                                        'type' : 'analysisAxis',
			                                        'index':  2 
			                                      }]
			                       },{

			                         'feedId'   : 'AxisLabels',                       
			                         'binding' : [{
			                                      'type' :'analysisAxis',                                
			                                      'index': 1
			                                    },{
												   'type' : 'measureNamesDimension'
												}]
			                       },{
			                         'feedId' : 'PrimaryValues',                      
			                         'binding' : [{
			                                      'type' : 'measureValuesGroup',                                
			                                      'index':  1
			                                    }]
			                       }

			                  ];
							  
			////////////////
			dataSets['MNDA1,A2,MV1'] = dataSets['A1,A2,MV1'];
			feeding['MNDA1,A2,MV1'] = [
			                     {
			                         'feedId'   : 'RegionColor',
			                         'binding'   : [{
			                                        'type' : 'analysisAxis',
			                                        'index':  2 
			                                      }]
			                       },{

			                         'feedId'   : 'AxisLabels',                       
			                         'binding' : [{
												   'type' : 'measureNamesDimension'
												},{
			                                      'type' :'analysisAxis',                                
			                                      'index': 1
			                                    }]
			                       },{
			                         'feedId' : 'PrimaryValues',                      
			                         'binding' : [{
			                                      'type' : 'measureValuesGroup',                                
			                                      'index':  1
			                                    }]
			                       }

			                  ];
							  
							  
			dataSets['A1,A2MND,MV1'] = dataSets['A1,A2,MV1'];
			feeding['A1,A2MND,MV1'] = [
			                     {
			                         'feedId'   : 'RegionColor',
			                         'binding'   : [{
			                                        'type' : 'analysisAxis',
			                                        'index':  2 
			                                      },{
												   'type' : 'measureNamesDimension'
												}]
			                       },{

			                         'feedId'   : 'AxisLabels',                       
			                         'binding' : [{
			                                      'type' :'analysisAxis',                                
			                                      'index': 1
			                                    }]
			                       },{
			                         'feedId' : 'PrimaryValues',                      
			                         'binding' : [{
			                                      'type' : 'measureValuesGroup',                                
			                                      'index':  1
			                                    }]
			                       }

			                  ];
							 
							 
			dataSets['A1,MNDA2,MV1'] = dataSets['A1,A2,MV1'];
			feeding['A1,MNDA2,MV1'] = [
			                     {
			                         'feedId'   : 'RegionColor',
			                         'binding'   : [{
												   'type' : 'measureNamesDimension'
												},{
			                                        'type' : 'analysisAxis',
			                                        'index':  2 
			                                      }]
			                       },{

			                         'feedId'   : 'AxisLabels',                       
			                         'binding' : [{
			                                      'type' :'analysisAxis',                                
			                                      'index': 1
			                                    }]
			                       },{
			                         'feedId' : 'PrimaryValues',                      
			                         'binding' : [{
			                                      'type' : 'measureValuesGroup',                                
			                                      'index':  1
			                                    }]
			                       }
			                  ];
							  
			dataSets['A1,MV1'] = {
					'analysisAxis': [{
						'data' : [{
							'name' : 'Country',
							'values' : ['China', 'China', 'USA', 'USA', 'Canada', 'Canada']
						}, {
							'name' : 'Year',
							'values' : ['2001', '2002', '2001', '2002', '2001', '2002']
						}],
						'index': 1
					}], 
					
					'measureValuesGroup':[{
						'data' : [{
							'type' : 'Measure',
							'name' : 'Profit',
							'values' : [[25, 136, 58, 128, 58, 24]]
						},{
							'type' : 'Measure',
							'name' : 'Revenue',
							'values' : [[25, 13, 8, 1, 8, 2]]
						}],
						'index': 1
					}]};
					
			/*feeding['A1,MV1'] = [
			                     {

			                         'feedId'   : 'AxisLabels',                       
			                         'binding' : [{
			                                      'type' :'analysisAxis',                                
			                                      'index': 1
			                                    }]
			                       },{
			                         'feedId' : 'PrimaryValues',                      
			                         'binding' : [{
			                                      'type' : 'measureValuesGroup',                                
			                                      'index':  1
			                                    }]
			                       }

			                  ];*/
							  
			dataSets['A1MND,MV1'] = dataSets['A1,MV1'];
			feeding['A1MND,MV1'] = [
			                     {

			                         'feedId'   : 'AxisLabels',                       
			                         'binding' : [{
			                                      'type' :'analysisAxis',                                
			                                      'index': 1
			                                    },{
												   'type': 'measureNamesDimension'
												}]
			                       },{
			                         'feedId' : 'PrimaryValues',                      
			                         'binding' : [{
			                                      'type' : 'measureValuesGroup',                                
			                                      'index':  1
			                                    }]
			                       }

			                  ];
			dataSets['MNDA1,MV1'] = dataSets['A1,MV1'];
			feeding['MNDA1,MV1'] = [
			                     {

			                         'feedId'   : 'AxisLabels',                       
			                         'binding' : [{
										   'type': 'measureNamesDimension'
										},{
			                                      'type' :'analysisAxis',                                
			                                      'index': 1
			                                    }]
			                       },{
			                         'feedId' : 'PrimaryValues',                      
			                         'binding' : [{
			                                      'type' : 'measureValuesGroup',                                
			                                      'index':  1
			                                    }]
			                       }

			                  ];
			
			dataSets['A1,MND,MV1'] = dataSets['A1,MV1'];
			feeding['A1,MND,MV1'] = [
			                     {

			                         'feedId'   : 'RegionColor',                       
			                         'binding' : [{
										   'type': 'measureNamesDimension'
										}]
			                       }, 
			                       {'feedId'   : 'AxisLabels',                       
			                         'binding' : [{
			                                      'type' :'analysisAxis',                                
			                                      'index': 1
			                                    }]
			                       },{
			                         'feedId' : 'PrimaryValues',                      
			                         'binding' : [{
			                                      'type' : 'measureValuesGroup',                                
			                                      'index':  1
			                                    }]
			                       }

			                  ];
			
			dataSets['MND,A2,MV1'] = {
					'analysisAxis': [{
						'data' : [{
							'name' : 'Country',
							'values' : ['China', 'China', 'USA', 'USA', 'Canada', 'Canada']
						}, {
							'name' : 'Year',
							'values' : ['2001', '2002', '2001', '2002', '2001', '2002']
						}],
						'index': 2
					}], 
					
					'measureValuesGroup':[{
						'data' : [{
							'type' : 'Measure',
							'name' : 'Profit',
							'values' : [[25], [136], [58], [128], [58], [24]]
						},{
							'type' : 'Measure',
							'name' : 'Revenue',
							'values' : [[25], [13], [8], [1], [8], [2]]
						}],
						'index': 1
					}]};;
					
			feeding['MND,A2,MV1'] = [
						                     {

						                         'feedId'   : 'RegionColor',                       
						                         'binding' : [{
													   'type': 'analysisAxis',
													   'index': 2
													}]
						                       }, 
						                       {'feedId'   : 'AxisLabels',                       
						                         'binding' : [{
						                                      'type' :'measureNamesDimension',                                
						                                    }]
						                       },{
						                         'feedId' : 'PrimaryValues',                      
						                         'binding' : [{
						                                      'type' : 'measureValuesGroup',                                
						                                      'index':  1
						                                    }]
						                       }

						                  ];
			
			for(var o in dataSets){
				$("#lineDataSets").
				
				append('<option value=' + o + '> ' + o + '</option>');
			}
			
            $("#lineDataSets").change(function(){
            	dataSetChange();
			});
			
			dataSetChange();
		}
		
		function dataSetChange(){
		
		    $('#chart').empty();
		    var ds = new CrosstableDataset();
			var dsName = $("#lineDataSets").attr('value');
			ds.setData(dataSets[dsName]);
			var line = viz.createViz({
					type : 'viz/line',
					data : ds,
					container : $('#chart'),
					options : null,
					dataFeeding : feeding[dsName]
				});
		}
		
		function chartChange(){
			$('.feed').remove();
			
            var feeds = Feeder(Manifest.viz.get($("#chartIds").attr('value')).allFeeds(), null, null).getFeeds();
            
            for(var i = 0; i < feeds.length; i++){
            	var feed = feeds[i];
            
               var td = '<tr class = feed>' + 
                         '<td>' + feed.feedId() + '</td>' + 
                         '<td>' + feed.feedName() + '</td>' + 
                         '<td>' + feed.type() + '</td>' + 
                         '<td>' + feed.min() + '</td>' +
                         '<td>' + feed.max() + '</td>' +
                         '<td>' + feed.analysisAxisIndex() + '</td>' +  
                         '<td>' + feed.measureGroupIndex() + '</td>' + 
                         '<td>' + feed.acceptMND() + '</td>' + 
                         '</tr>';

               $('#feedTable').append(td);
            }
            
           
        }
	

		function testParseData(){
			
			 $('#chart').empty();
	         var ds = new CrosstableDataset();      
	         ds.setData(JSON.parse($("#dataset").val()));
	         var feeding = JSON.parse($("#feeding").val());
	
				
			 var chart = viz.createViz({
						type : $("#chartIds").attr('value'),
						data : ds,
						container : $('#chart'),
						options : null,
						dataFeeding : feeding
					});
	        
	         //}
	        // catch(e){
	        //	 alert(e);
	        // }
	        
        }

        $("#testFeed").click(testParseData);
       
	});
});