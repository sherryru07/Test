  //copy from original demo_charts

    $(function(){
        var Environment = sap.viz.env;
        var CrosstableDataset = sap.viz.data.CrosstableDataset;
        var vizcore = sap.viz.core;
        var Manifest = sap.viz.manifest;
        var TemplateManager = sap.viz.TemplateManager;
        //sap.viz.GeoManager.resourcePath('../../extension/viz.ext.geomaps/resources');
        Environment.initialize({
            'log': 'debug'
        });
        
        sap.viz.lang.langManager.addListener({
             fn: function(){
                chartMap =[];
                multichartMap =[];
                $('#chartIds').find('option').remove();
                $('#multichartIds').find('option').remove();
                
                Manifest.viz.each(function(obj, id) {
                 if(obj["abstract"] !== true){
                   if(id.indexOf('riv/multi') === 0){

                     multichartMap.push({
                         index: id,
                         value: obj.name
                     });
                   }else{
                     
                     chartMap.push({
                         index: id,
                         value: obj.name
                     });
                   }
                  }
                });
                 chartMap.sort(function(a,b){
                     return a.value > b.value ? 1: -1;
                 });
                 multichartMap.sort(function(a,b){
                     return a.value > b.value ? 1: -1;    
                 });

                 for( i = 0, length = chartMap.length; i < length; i++){
                     $("#chartIds").append('<option value=' + chartMap[i].index + '> ' + (i + 1) + ', ' + chartMap[i].value + '</option>');
                 }
                 for( i = 0, length = multichartMap.length; i < length; i++){
                     $("#multichartIds").append('<option value=' + multichartMap[i].index + '> ' + (i + 1) + ', ' + multichartMap[i].value + '</option>');
                 }
            },
            scope: this
        });
        
        var testDataSet = {};
        var testDataFeeding = {};
      //Sample Data
        ///////////////////
      //viz/bar
        testDataSet['viz/bar'] = {
            'analysisAxis': [{
                'index': 1,
                'data': [{
                        'type': 'Dimension',
                        'name': 'Product',
                        'values': ['Car', 'Truck', 'Motorcycle', 'Bicycle']
                    }]
              }, {
              'index' : 2,
                'data': [{
                        'type': 'Dimension',
                        'name': 'Country',
                        'values': ['China', 'USA']
                    }, {
                        'type': 'Dimension',
                        'name': 'Year',
                        'values': ['2001', '2001']
                    }]
            }], 
            'measureValuesGroup': [{
                'index': 1,
                'data': [{
                        'type': 'Measure',
                        'name': 'Profit',
                        'values': [[25, 136, 23, 116], [58, 128, 43, 73]]
                    }, {
                        'type': 'Measure',
                        'name': 'Revenue',
                        'values': [[50, 236, 43, 126], [158, 228, 143, 183]]
                    }]
            }]};
                    
            //viz/dual_bar
        testDataSet['viz/dual_bar'] = {
            'analysisAxis': [{
                'index': 1,
                'data': [{
                        'type': 'Dimension',
                        'name': 'Product',
                        'values': ['Car', 'Truck', 'Motorcycle', 'Bicycle']
                    }]
              }, {
              'index' : 2,
                'data': [{
                        'type': 'Dimension',
                        'name': 'Country',
                        'values': ['China', 'USA']
                    }, {
                        'type': 'Dimension',
                        'name': 'Year',
                        'values': ['2001', '2001']
                    }]
            }], 
            'measureValuesGroup': [{
                'index': 1,
                'data': [{
                        'type': 'Measure',
                        'name': 'Profit',
                        'values': [[25, 136, 23, 116], [58, 128, 43, 73]]
                    }]
            },{
                'index': 2,
                'data': [{
                        'type': 'Measure',
                        'name': 'Revenue',
                        'values': [[50, 236, 43, 126], [158, 228, 143, 183]]
                    }]
            }]};
        //////////////////
        //viz/pie
        testDataSet['viz/pie'] = {
            'analysisAxis':[{
        'index' :  1,
                'data': [{
                        'type': 'Dimension',
                        'name': 'Country',
                        'values': ['China', 'China', 'USA', 'USA', 'Canada', 'Canada']
                    }, {
                        'type': 'Dimension',
                        'name': 'Year',
                        'values': ['2001', '2002', '2001', '2002', '2001', '2002']
                    }]
            }], 
      'measureValuesGroup':[{
                'index' : 1,
                'data': [{
                        'type': 'Measure',
                        'name': 'Profit',
                        'values': [[25, 58, 58, 159, 149, 38]]
                    }]
            }]};
    
        testDataSet['viz/3d_column'] = testDataSet['viz/bar'];
        //viz/donut    
        testDataSet['viz/donut'] = testDataSet['viz/pie'];

        //////////////////
        //viz/line
        testDataSet['viz/line'] ={ 
            'analysisAxis': [{
                'index':1,
                'data': [ 
                {
                                'type' : 'Dimension',
                                'name' : 'Country',
                                'values' : ['China','China', 'USA','USA', 'Canada','Canada']
                }, {
                                'type' : 'Dimension',
                                'name' : 'Year',
                                'values' : ['2001','2002', '2001','2002', '2001','2002']
                }      ]
            }, {
                'index': 2,
                'data': [{
                        'type': 'Dimension',
                        'name': 'Product',
                        'values': ['Car', 'Truck', 'Motorcycle']
                    }]
            }], 
            'measureValuesGroup':[{
                'index': 1,
                'data': [{
                        'type': 'Measure',
                        'name': 'Profit',
                        'values': [[25, 136, 58, 128, 58, 24], [159, 147, 149, 269, 38, 97], [129, 47, 49, 69, 33, 47], ]
                    }, {
                        'type': 'Measure',
                        'name': 'Revenue',
                        'values': [[50, 272, 116, 256, 116, 48], [300, 247, 249, 369, 68, 197], [229, 147, 149, 169, 133, 147]]
                    }]
            }]};
        
        //viz/dual_line
        testDataSet['viz/dual_line'] = {
            'analysisAxis': [{
                'index': 1,
                'data': [ 
                {
                                'type' : 'Dimension',
                                'name' : 'Country',
                                'values' : ['China','China', 'USA','USA', 'Canada','Canada']
                },                             {
                                'type' : 'Dimension',
                                'name' : 'Year',
                                'values' : ['2001','2002', '2001','2002', '2001','2002']
                },      ]
            }, {
                'index': 2,
                'data': [{
                        'type': 'Dimension',
                        'name': 'Product',
                        'values': ['Car', 'Truck', 'Motorcycle']
                    }]
            }], 
            
            'measureValuesGroup' :[{
                'index': 1,
                'data': [{
                        'type': 'Measure',
                        'name': 'Profit',
                        'values': [[25, 136, 58, 128, 58, 24], [159, 147, 149, 269, 38, 97], [129, 47, 49, 69, 33, 47], ]
                    }]
            }, {
                'index': 2,
                'data': [{
                        'type': 'Measure',
                        'name': 'Revenue',
                        'values': [[50, 272, 116, 256, 116, 48], [300, 247, 249, 369, 68, 197], [229, 147, 149, 169, 133, 147]]
                    }]
            }]};    
        
        //riv/hline
        testDataSet['viz/horizontal_line'] = testDataSet['viz/line'];
            
        //riv/dhline
        testDataSet['viz/dual_horizontal_line'] = testDataSet['viz/dual_line'];

        //////////////////////
        //viz/sparkline
        testDataSet['viz/sparkline'] ={
            'analysisAxis':[
            {
                'index': 1,
                'data': [
                    {
                        'type': 'Dimension',
                        'name': 'Area',
                        'values': ['US', 'US', 'US', 'US', 'Europe', 'Europe', 'Europe', 'Asia', 'Asia', 'Asia']
                    }, 
                    {
                        'type': 'Dimension',
                        'name': 'Name',
                        'values': ['S&P 500', 'Nasdaq', 'Dow Jones', '10-Year Bond', 'FTSE 100', 'DAX', 'CAC 40', 'HANG SENG', 'NIKKEI 225', 'STRAITS TIMES']
                    }
                ]
            }, 
            {
                'index': 2,
                'data': [
                    {
                        'type': 'Dimension',
                        'name': 'Last 24 months value',
                        'values': ['2012 Jun', '2012 May', '2012 Apr', '2012 Mar', '2012 Feb', '2012 Jan', '2011 Dec', '2011 Nov', '2011 Oct', '2011 Sep', 
                            '2011 Aug', '2011 Jul', '2011 Jun', '2011 May', '2011 Apr', '2011 Mar', '2011 Feb', '2011 Jan', '2010 Dec', '2010 Nov', 
                            '2010 Sep', '2010 Aug', '2010 Jul', '2010 Jun']
                    }
                ]
            }], 
            'measureValuesGroup' :[{
                'index': 1,
                'data': [
                    {
                        'type': 'MeasureValue',
                        'name': 'Price',
                        'values': [
                                    [1107.53,2283.32,10719.94,2.93,5258,6187.64,3675.88,21221.43,9574.64,3025.04],
                                    [1049.72,2142.75,10948.88,2.49,5225.2,5936.94,3507.87,20570.52,8833.32,2950.33],
                                    [1143.49,2386.82,11247.6,2.55,5548.6,6244.06,3722.93,22542.36,9440.52,3097.63],
                                    [1185.71,2520.45,11451.53,2.59,5675.2,6637.09,3865.04,23366.82,9166.85,3142.62],
                                    [1186.6,2535.19,11625,2.9,5528.3,6748.36,3634.61,22973.8,9939.8,3144.7],
                                    [1257.62,2676.65,12020.52,3.38,5899.9,6973.39,3847.63,23135.64,10352.19,3190.04],
                                    [1289.14,2717.61,12391.29,3.43,5862.9,7133.34,4037.14,23451.62,10281.55,3179.72],
                                    [1328.64,2791.08,12383.46,3.46,5994,7309.8,4126.66,23317.96,10676.24,3010.51],
                                    [1329.48,2796.67,12832.83,3.5,5908.8,7086.56,4014.58,23664.48,9757.28,3105.85],
                                    [1365.21,2881.28,12876,3.31,6069.9,7570.86,4137.75,23720.81,9964.39,3179.86],
                                    [1345.2,2829.39,12569.49,3.02,5990,7310.56,4014.84,23686.77,9708.05,3159.93],
                                    [1320.64,2775.08,12753.89,3.15,5945.7,7374.49,3981.96,22813.25,9878.69,3120.44],
                                    [1292.59,2791.45,12282.42,2.79,5815.2,7254.5,3718.11,22739.55,9907.04,3189.26],
                                    [1219.12,2583.34,11716.84,2.2,5394.5,5793.1,3273.05,20790.22,9017.01,2885.26],
                                    [1131.21,2401.19,12284.31,1.88,5128.5,5311.93,2913.07,17179.2,8567.98,2675.16],
                                    [1251,2607.31,12187.51,2.03,5544.2,5934.54,3162.57,19461.08,8880.75,2855.77],
                                    [1246.91,2615.67,12328.47,2.13,5505.4,6080.48,3151.35,19033.96,8581.2,2702.46],
                                    [1258.86,2657.39,12841.95,1.95,5572.3,6124.11,3158.24,18770.64,8549.54,2646.35],
                                    [1312.45,2830.1,13055.75,1.81,5681.6,6482.95,3320.32,20394.67,8789.06,2906.69],
                                    [1365.9,2979.11,13289.08,2.03,5871.5,6831.97,3444.53,21578.19,9771.34,2994.06],
                                    [1408.47,3085.94,13297.11,2.2,5768.5,6973.99,3439.17,20662.97,10161.72,3010.46],
                                    [1397.86,3044.79,13338.66,1.92,5737.8,6861.3,3265.12,21245.48,9471.66,2978.57],
                                    [1309.87,2810.13,12898.94,1.52,5320.9,6259.76,3028.3,18498.91,8465.47,2772.54],
                                    [1362.33,2938.41,12961.3,1.64,5571.1,6405.39,3197.04,19441.46,9103.79,2878.45]
                        ]
                    }
                ]
            }
        ]};
        ////////////////
        //viz/stacked_bar
        testDataSet['viz/stacked_bar'] = {
            'analysisAxis': [                 
            {
                'index': 1,
                'data': [{
                        'type': 'Dimension',
                        'name': 'Product',
                        'values': ['Car', 'Truck', 'Motorcycle', 'Bicycle']
                    }]
            }, {
                'index': 2,
                'data': [{
                        'type': 'Dimension',
                        'name': 'Country',
                        'values': ['China', 'USA']
                    }, {
                        'type': 'Dimension',
                        'name': 'Year',
                        'values': ['2001', '2001']
                    }]
            }],
            'measureValuesGroup' :[{
                'index': 1,
                'data': [{
                        'type': 'Measure',
                        'name': 'Profit',
                        'values': [[25, 236, 23, 116], [58, 128, 43, 73]]
                    }, {
                        'type': 'Measure',
                        'name': 'Revenue',
                        //'values' : [[50,236, 43, 126], [158, 228, 143, 143], [158, 64, 84, 143], [259, 347,390, 390], [249, 369, 532, 112], [318, 197,62,156]]
                        'values': [[50, 86, 43, 146], [158, 88, 143, 183]]
                    }]
            }]};
            
        //viz/dual_stacked_bar    
        testDataSet['viz/dual_stacked_bar'] = {
            'analysisAxis': [                 
            {
                'index': 1,
                'data': [{
                        'type': 'Dimension',
                        'name': 'Product',
                        'values': ['Car', 'Truck', 'Motorcycle', 'Bicycle']
                    }]
            }, {
                'index': 2,
                'data': [{
                        'type': 'Dimension',
                        'name': 'Country',
                        'values': ['China', 'USA']
                    }, {
                        'type': 'Dimension',
                        'name': 'Year',
                        'values': ['2001', '2001']
                    }]
            }],
            'measureValuesGroup' :[{
                'index': 1,
                'data': [{
                        'type': 'Measure',
                        'name': 'Profit',
                        'values': [[25, 236, 23, 116], [58, 128, 43, 73]]
                    }, {
                        'type': 'Measure',
                        'name': 'Revenue',
                        //'values' : [[50,236, 43, 126], [158, 228, 143, 143], [158, 64, 84, 143], [259, 347,390, 390], [249, 369, 532, 112], [318, 197,62,156]]
                        'values': [[50, 86, 43, 146], [158, 88, 143, 183]]
                    }]
            },{
                'index': 2,
                'data': [{
                        'type': 'Measure',
                        'name': 'Cost',
                        'values': [[25, 236, 23, 116], [58, 128, 43, 73]]
                    }]
            }]};
        
    //viz/100_stacked_bar
        testDataSet['viz/mekko'] ={
              'analysisAxis': [                 
                               {
                                   'index': 1,
                                     'data': [{
                                             'type': 'Dimension',
                                             'name': 'Country',
                                             'values': ['China','EU','Russia','India']
                                         }
                                   ]
                               }, {
                                   'index': 2,
                                     'data': [{
                                             'type': 'Dimension',
                                             'name': 'Product',
                                             'values': ['Octavia', 'Fabia', 'Superb']
                                         }
                                   ]
                               }],
                               'measureValuesGroup' :[{
                                   'index': 1,
                                   'data': [{
                                           'type': 'Measure',
                                           'name': 'Margin',
                                           'values': [[35,32,12,5],[13,11,6,2],[13,15,5,2]]
                                       }]
                               },{
                                   'index': 2,
                                   'data': [{
                                           'type': 'Measure',
                                           'name': 'volume',
                                           'values': [[126317,102000,38200,15700],[48766,42100,19700,8100],[45006,58600,16100,6200]]
                                       }]
                               }]};
        testDataSet['viz/100_mekko'] = testDataSet['viz/mekko'];
        testDataSet['viz/horizontal_mekko'] = testDataSet['viz/mekko'];
        testDataSet['viz/100_horizontal_mekko'] = testDataSet['viz/mekko'];
        testDataSet['viz/area'] = {
              'analysisAxis': [{
                  'index':1,
                  'data': [ 
                  {
                                  'type' : 'Dimension',
                                  'name' : 'Country',
                                  'values' : ['China','China', 'USA','USA', 'Canada','Canada']
                  }, {
                                  'type' : 'Dimension',
                                  'name' : 'Year',
                                  'values' : ['2001','2002', '2001','2002', '2001','2002']
                  }      ]
              }, {
                  'index': 2,
                  'data': [{
                          'type': 'Dimension',
                          'name': 'Product',
                          'values': ['Car', 'Truck', 'Motorcycle']
                      }]
              }], 
              'measureValuesGroup':[{
                  'index': 1,
                  'data': [{
                          'type': 'Measure',
                          'name': 'Profit',
                          'values': [[25, 136, 58, 128, 58, 24], [159, 147, 149, 269, 38, 97], [129, 47, 49, 69, 33, 47] ]
                      }, {
                          'type': 'Measure',
                          'name': 'Revenue',
                          'values': [[50, 272, 116, 256, 116, 48], [300, 247, 249, 369, 68, 197], [229, 147, 149, 169, 133, 147]]
                      }]
              }]};
              testDataSet['viz/100_area'] = testDataSet['viz/area'];
              testDataSet['viz/100_horizontal_area'] = testDataSet['viz/area'];
              testDataSet['viz/horizontal_area'] = testDataSet['viz/area'];
        testDataSet['viz/100_stacked_bar'] = testDataSet['viz/stacked_bar'];
        testDataSet['viz/100_dual_stacked_bar'] = testDataSet['viz/dual_stacked_bar'];
        
        ////////////////////////////////////
        //viz/stacked_column
        testDataSet['viz/stacked_column'] = testDataSet['viz/100_stacked_bar'];
        testDataSet['viz/dual_stacked_column'] = testDataSet['viz/dual_stacked_bar'];    
            //viz/stacked_column
        testDataSet['viz/100_stacked_column'] = testDataSet['viz/100_stacked_bar'];
        testDataSet['viz/100_dual_stacked_column'] = testDataSet['viz/100_dual_stacked_bar'];  
        ////////////////
        //viz/column
        testDataSet['viz/column'] = { 
           'analysisAxis': [
            {
                'index': 1,
                'data' : [ 
                {
                                'type' : 'Dimension',
                                'name' : 'Country',
                                'values' : ['China','China', 'USA','USA', 'Canada','Canada']
                },                             {
                                'type' : 'Dimension',
                                'name' : 'Year',
                                'values' : ['2001','2002', '2001','2002', '2001','2002']
                }  
                    ]
            }, {
                'index': 2,
                'data': [{
                                'type' : 'Dimension',
                                'name' : 'Products',
                                'values' : ['Car', 'Truck']
                }]
            }], 
            'measureValuesGroup': [{
                'index': 1,
               'data' :[{
                                'type' : 'Measure',
                                'name' : 'Profit',
                                'values' : [[25, 136, 58, 128, 58, 24], [159, 147, 149, 269, 38, 97]]
                }
                                ,
                                    {
                                'type' : 'Measure',
                                'name' : 'Revenue',
                                'values' : [[199,136,58, 128,127, 97], [25, 269, 38, 58, 149, 24]]
                } ,
                                    {
                                'type' : 'Measure',
                                'name' : 'Tax',
                                'values' : [[99,36,8, 28,27, 7], [5, 69, 8, 8, 9, 4]]
                }]
            }]};
      
        ////////////////
        //viz/boxplot
        testDataSet['viz/boxplot'] = { 
           'analysisAxis': [
            {
                'index': 1,
                'data' : [ 
                {
                                'type' : 'Dimension',
                                'name' : 'Country',
                                'values' : ['China','China', 'China','USA', 'USA', 'USA', 'USA', 'Canada','Canada', 'Canada']
                },  {
                                'type' : 'Dimension',
                                'name' : 'Year',
                                'values' : ['2011','2011', '2011','2011', '2012','2012', '2012', '2011', '2011', '2011']
                } , { 
                                'type' : 'Dimension',
                                'name' : 'Month',
                                'values' : ['1','1', '1','5', '8','8', '8', '10', '10', '10']
                } 
                    ]
            }, {
                'index': 2,
                'data': [{
                                'type' : 'Dimension',
                                'name' : 'Products',
                                'values' : ['Car', 'Truck']
                }
      ]
            }], 
            'measureValuesGroup': [{
                'index': 1,
               'data' :[{
                                'type' : 'Measure',
                                'name' : 'Profit',
                                'values' : [[25, 136, 58, 128, 58, 24, 33, 45, 78, 60], [159, 147, 149, 269, 38, 97, 102, 110, 120, 88]]
                },
        {
                                'type' : 'Measure',
                                'name' : 'Revenue',
                                'values' : [[55, 126, 58, 128, 58, 24, 25, 38, 68, 48], [109, 147, 149, 249, 38, 97, 78, 38, 28, 101]]
                }]
            }]};
 
        ////////////////
        //viz/horizontal_boxplot
        testDataSet['viz/horizontal_boxplot'] = { 
           'analysisAxis': [
            {
                'index': 1,
                'data' : [ 
                {
                                'type' : 'Dimension',
                                'name' : 'Country',
                                'values' : ['China','China', 'China','USA', 'USA', 'USA', 'USA', 'Canada','Canada', 'Canada']
                },  {
                                'type' : 'Dimension',
                                'name' : 'Year',
                                'values' : ['2011','2011', '2011','2011', '2012','2012', '2012', '2011', '2011', '2011']
                } , { 
                                'type' : 'Dimension',
                                'name' : 'Month',
                                'values' : ['1','1', '1','5', '8','8', '8', '10', '10', '10']
                } 
                    ]
            }, {
                'index': 2,
                'data': [{
                                'type' : 'Dimension',
                                'name' : 'Products',
                                'values' : ['Car', 'Truck']
                }
      ]
            }], 
            'measureValuesGroup': [{
                'index': 1,
               'data' :[{
                                'type' : 'Measure',
                                'name' : 'Profit',
                                'values' : [[25, 136, 58, 128, 58, 24, 33, 45, 78, 60], [159, 147, 149, 269, 38, 97, 102, 110, 120, 88]]
                },
        {
                                'type' : 'Measure',
                                'name' : 'Revenue',
                                'values' : [[55, 126, 58, 128, 58, 24, 25, 38, 68, 48], [109, 147, 149, 249, 38, 97, 78, 38, 28, 101]]
                }]
            }]};
        
       //viz/column
        testDataSet['viz/dual_column'] ={ 
          'analysisAxis': [
            {
                'index': 1,
                'data' : [ 
                {
                                'type' : 'Dimension',
                                'name' : 'Country',
                                'values' : ['China','China', 'USA','USA', 'Canada','Canada']
                },                             {
                                'type' : 'Dimension',
                                'name' : 'Year',
                                'values' : ['2001','2002', '2001','2002', '2001','2002']
                }
                    ]
            }, {
                'index': 2,
                'data': [{
                                'type' : 'Dimension',
                                'name' : 'Products',
                                'values' : ['Car', 'Truck']
                }]
            }], 
            
            'measureValuesGroup': [{
                'index': 1,
               'data' :[{
                                'type' : 'Measure',
                                'name' : 'Profit',
                                'values' : [[25, 136, 58, 128, 58, 24], [159, 147, 149, 269, 38, 97]]
                }
                                ,
                                    {
                                'type' : 'Measure',
                                'name' : 'Revenue',
                                'values' : [[199,136,58, 128,127, 97], [25, 269, 38, 58, 149, 24]]
                }]
            },{
                'index': 2,
               'data' :[{
                                'type' : 'Measure',
                                'name' : 'Tax',
                                'values' : [[99,36,8, 28,27, 7], [5, 69, 8, 8, 9, 4]]
                }]
            }]};
            
       /////////////////
       //viz/bubble
    testDataSet['viz/bubble'] = {
      'analysisAxis':[{
      'index' : 1,
      'data' : [{
        'type' : 'Dimension',
        'name' : 'Region',
        'values' : ['Asia', 'Asia', 'Asia', 'Asia', 'Asia', 'Europe', 'Europe', 'Europe', 'Europe', 'Europe', 'North America', 'North America',
                    'North America', 'North America', 'North America', 'Others', 'Others', 'Others', 'Others']
      }, {
        'type' : 'Dimension',
        'name' : 'Company',
        'values' : ['FJ', 'JL', 'MU', 'NG', 'SQ', 'AB', 'AF', 'AZ', 'BA', 'LH', 'AA', 'AC', 'DL', 'NW', 'UA', 'CO', 'MO', 'QF', 'SA']
      }]
    }], /*{
      'feedId' : 'sap.viz.correlation.shape',
      'data' : [{
        'type' : 'Dimension',
        'name' : 'Product',
        'values' : ['Car', 'Truck']
      }]
    },*/ 
     'measureValuesGroup':[{
      'index' : 1,
      'data' : [{
        'type' : 'Measure',
        'name' : 'Revenue',
        'values' : [[4.6, 18.5, 14.2, 10.1, 21.3, 13.5, 10.1,
                     32.8, 8.7, 27.8, 20.3, 10.9, 13.2, 7.3,
                     22.1, 5.2, 7.6, 19, 2.5]]
      }]
    }, {
      'index' : 2,
      'data' : [{
        'type' : 'Measure',
        'name' : 'Number of Countries',
        'values' : [[3, 18, 7, 10, 15, 12, 16, 32, 5, 20, 21, 3, 18, 4, 21, 8, 2, 15, 3]]
      }]
    }, {
      'index' : 3,
      'data' : [{
        'type' : 'Measure',
        'name' : 'Number of Planes',
        'values' : [[18, 98, 30, 46, 100, 103, 102, 150, 73, 100, 97, 20, 119, 30, 129, 60, 30, 98, 19]]
      }]
    }/*, {
      'feedId' : 'sap.viz.correlation.marker.height',
      'data' : [{
        'type' : 'Measure',
        'name' : 'Total',
        'values' : [[4, 8, 14, 11], [12, 6, 9, 3]]
      }]
    }*/]};
    
    testDataSet['viz/multi_bubble'] = {
      'analysisAxis':[
      {
        'index': 1,
        'data': [{
          'type': 'Dimension',
          'name': 'Country',
          'values': ['China', 'China', 'USA', 'USA', 'Canada', 'Canada', 'Spain', 'Spain']
        }, {
          'type': 'Dimension',
          'name': 'Year',
          'values': ['2001', '2002', '2001', '2002', '2001', '2002', '2001', '2002']
        }]
      },{
        'index' : 2,
        'data' : [{
          'type' : 'Dimension',
          'name' : 'Region',
          'values' : ['Asia', 'Asia', 'Asia', 'Asia', 'Asia', 'Europe', 'Europe', 'Europe', 'Europe', 'Europe', 'North America', 'North America',
                      'North America', 'North America', 'North America', 'Others', 'Others', 'Others', 'Others']
        }, {
          'type' : 'Dimension',
          'name' : 'Company',
          'values' : ['FJ', 'JL', 'MU', 'NG', 'SQ', 'AB', 'AF', 'AZ', 'BA', 'LH', 'AA', 'AC', 'DL', 'NW', 'UA', 'CO', 'MO', 'QF', 'SA']
        }]
      }], /*{
      'feedId' : 'sap.viz.correlation.shape',
      'data' : [{
        'type' : 'Dimension',
        'name' : 'Product',
        'values' : ['Car', 'Truck']
      }]
    },*/ 
     'measureValuesGroup':[{
      'index' : 1,
      'data' : [{
        'type' : 'Measure',
        'name' : 'Revenue',
        'values' : [[8.44,23.76,27.98,16.95,42.67,64.29,41.20,32.78],[26.73,19.19,19.19,45.05,67.20,55.83,67.42,77.40],[15.99,23.41,15.77,43.30,29.32,39.96,24.65,65.75],[10.28,23.64,11.14,19.47,14.86,14.03,79.63,58.90],[23.57,28.31,36.03,41.03,39.23,76.72,50.59,35.11],[15.46,29.83,26.86,30.71,61.58,46.44,37.36,74.16],[19.03,30.05,20.07,22.19,40.13,35.19,51.90,57.88],[39.97,43.93,46.42,57.27,36.25,90.79,56.93,56.94],[8.76,11.70,18.62,20.65,33.31,33.58,75.17,62.12],[34.34,34.85,41.54,41.03,41.27,70.43,57.62,79.03],[21.19,27.71,43.75,55.28,58.76,49.99,81.44,74.99],[16.78,23.00,14.69,11.61,54.15,24.19,56.28,49.86],[22.87,26.56,33.69,25.43,48.83,33.29,19.45,52.54],[11.16,24.01,17.30,38.19,41.83,66.25,30.31,69.26],[29.08,26.41,30.54,41.63,40.00,65.52,24.21,25.50],[15.19,11.13,35.03,21.24,43.84,33.13,57.13,40.58],[12.87,16.78,17.62,13.49,11.12,36.92,58.76,27.86],[25.17,34.67,28.82,52.36,34.98,74.60,81.54,65.02],[9.61,19.00,12.58,8.31,51.87,32.14,3.71,76.89]]
      }]
    }, {
      'index' : 2,
      'data' : [{
        'type' : 'Measure',
        'name' : 'Number of Countries',
        'values' : [[10.71,22.31,16.15,3.05,11.67,5.55,7.25,55.89],[22.91,21.34,32.17,48.59,34.81,24.25,51.93,71.14],[11.41,19.94,21.99,24.53,51.77,37.07,32.94,63.71],[16.92,20.30,34.39,44.85,41.22,60.70,46.97,13.06],[22.40,18.19,32.10,47.12,41.91,55.66,75.82,51.80],[12.68,29.99,18.33,51.52,34.82,71.89,14.54,26.56],[22.12,16.29,31.51,35.84,32.04,63.23,39.00,27.27],[36.96,38.04,39.00,44.04,54.73,76.35,43.00,46.85],[6.69,24.98,27.58,15.31,47.62,16.35,26.53,61.53],[27.33,25.00,32.33,24.15,65.39,78.59,72.10,89.56],[22.20,26.88,22.46,22.68,50.58,36.47,36.80,91.14],[6.71,20.18,20.36,41.93,20.72,39.85,6.49,60.51],[23.11,18.79,27.61,25.09,21.54,19.52,64.08,91.80],[9.20,23.50,11.90,36.02,24.06,16.24,68.20,18.25],[29.51,40.52,34.57,21.40,62.28,33.30,58.21,79.77],[13.77,9.61,33.32,32.92,48.65,18.96,60.37,12.10],[5.14,10.46,29.14,33.65,2.35,51.85,44.53,42.01],[20.64,18.72,19.06,15.52,23.87,26.49,25.46,85.27],[11.11,18.52,17.36,40.98,23.34,30.52,50.68,77.45]]
      }]
    }, {
      'index' : 3,
      'data' : [{
        'type' : 'Measure',
        'name' : 'Number of Planes',
        'values' : [[18.25,131.08,30.36,21.41,51.66,39.01,33.86,18.36],[102.80,117.46,125.98,127.89,114.09,151.38,137.29,113.39],[34.07,45.67,50.60,59.75,35.11,37.09,95.81,38.67],[55.57,62.19,73.47,81.20,65.61,78.11,72.61,72.54],[104.41,103.10,126.54,113.46,114.66,155.93,159.11,155.33],[104.48,116.91,117.08,132.28,128.54,159.30,147.88,124.36],[106.40,117.60,103.07,132.36,118.42,108.69,127.45,125.44],[152.94,157.62,150.46,174.23,177.82,207.39,172.04,195.68],[81.04,77.02,96.30,100.90,93.32,75.87,80.75,78.23],[105.82,118.59,103.12,126.12,135.23,130.77,148.11,167.62],[101.95,113.50,120.71,135.95,136.98,117.03,120.70,152.17],[22.48,39.88,38.05,49.17,26.18,49.50,82.00,47.60],[125.71,137.52,132.33,157.59,132.47,161.14,184.16,161.99],[35.66,33.24,52.65,59.31,41.43,52.78,44.42,385.55],[132.67,130.94,153.57,155.48,161.03,159.05,171.54,185.46],[64.82,75.29,86.41,76.68,83.02,74.20,114.61,61.75],[33.30,36.97,35.28,58.98,74.83,88.84,60.75,60.90],[98.89,111.87,116.72,109.55,101.11,137.62,160.89,113.07],[22.07,28.25,45.22,38.26,43.47,36.93,63.11,32.76]]
      }]
    }/*, {
      'feedId' : 'sap.viz.correlation.marker.height',
      'data' : [{
        'type' : 'Measure',
        'name' : 'Total',
        'values' : [[4, 8, 14, 11], [12, 6, 9, 3]]
      }]
    }*/]};
    
    testDataSet['viz/scatter'] = {
      'analysisAxis':[{
      'index' : 1,
      'data' : [{
        'type' : 'Dimension',
        'name' : 'Country',
        'values': ['China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China']
      }, {
        'type' : 'Dimension',
        'name' : 'Airline',
        'values' : ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69','70','71','72','73','74','75','76','77','78','79','80','81','82','83','84']
      }]
    }], 
    'measureValuesGroup':[{
      'index' : 1,
      'data' : [{
        'type' : 'Measure',
        'name' : 'Discount',
        'values' : [[18.18,4.575,15.525,24.615,40.005,61.665,37.05,25.425,19.17,43.59,48.255,45,51.66,48.18,51.33,40.995,40.59,42.975,33.33,46.59,42.675,56.67,60,60,50.115,49.725,50.205,49.725,50.205,49.725,50.175,49.86,50.265,49.86,50.265,49.86,43.59,33.945,28.5,37.995,60,48.33,48.975,35.685,37.14,49.17,55.5,48.675,43.365,31.935,34.125,48.93,49.365,52.455,45.93,37.455,28.455,28.29,33.705,53.295,28.185,32.925,44.745,39.63,43.335,55.965,48.48,31.26,39.63,46.155,39.75,44.745,33.735,24.735,39.15,46.395,49.98,52.47,52.785,43.92,51.285,46.95,51.285,72.33]]
      }]
    }, {
      'index' : 2,
      'data' : [{
        'type' : 'Measure',
        'name' : 'Full-load',
        'values' : [[3.15,28.095,49.17,45.315,45.45,45.765,55.125,57.72,57.81,50.625,51.06,53.085,52.98,52.11,51.015,55.695,56.055,58.65,54.15,51.72,54.15,55.95,59.01,18.54,53.205,56.97,29.1,57.825,33.33,19.755,53.175,56.67,36.9,58.935,44.775,14.58,50.295,50.67,50.46,48.63,46.71,35.76,47.97,58.38,53.175,45.45,42.27,49.17,51.915,51.9,53.295,50.67,53.145,50.85,46.455,53.445,53.31,59.4,55.98,50.775,57.675,56.415,50.31,51.09,48.285,45,50.925,56.835,54.585,53.895,38.115,56.265,57.63,59.805,56.775,53.895,53.505,54.3,53.175,52.95,52.215,51.99,52.215,49.92]]
      }]
    }]};
    
    testDataSet['viz/multi_scatter'] = {
      'analysisAxis':[
           {
                'index': 1,
                'data': [{
                        'type': 'Dimension',
                        'name': 'Country',
                        'values': ['China', 'China', 'USA', 'USA', 'Canada', 'Canada', 'Spain', 'Spain']
                    }, {
                        'type': 'Dimension',
                        'name': 'Year',
                        'values': ['2001', '2002', '2001', '2002', '2001', '2002', '2001', '2002']
                    }]
            },
            {
                'index' : 2,
                'data' : [{
                  'type' : 'Dimension',
                  'name' : 'Country',
                  'values': ['China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China','China']
                }, {
                  'type' : 'Dimension',
                  'name' : 'Airline',
                  'values' : ['1','2','3','4','5','6','7','8','9','10','11','12','13','14','15','16','17','18','19','20','21','22','23','24','25','26','27','28','29','30','31','32','33','34','35','36','37','38','39','40','41','42','43','44','45','46','47','48','49','50','51','52','53','54','55','56','57','58','59','60','61','62','63','64','65','66','67','68','69','70','71','72','73','74','75','76','77','78','79','80','81','82','83','84']
                }]
      }], 
    'measureValuesGroup':[{
      'index' : 1,
      'data' : [{
        'type' : 'Measure',
        'name' : 'Discount',
        'values' : [[19.56,18.75,25.72,23.23,64.14,25.50,64.53,50.03],[6.52,24.20,24.99,26.60,15.18,47.41,27.89,49.25],[16.80,18.90,38.98,22.95,38.46,30.33,34.23,89.98],[33.23,24.74,47.78,45.69,44.00,45.45,56.07,34.07],[45.95,46.94,63.82,60.36,49.83,65.04,48.95,52.07],[66.09,81.35,63.83,71.69,73.81,92.02,119.98,122.08],[41.80,55.80,65.55,46.11,58.51,88.17,88.34,85.39],[31.83,40.59,33.10,26.53,39.23,71.93,64.43,102.96],[20.77,23.80,38.34,22.48,59.05,44.37,82.30,80.21],[51.93,58.15,55.58,50.18,86.29,82.51,110.67,103.90],[54.50,58.34,48.76,77.41,64.10,86.46,98.85,119.50],[54.15,58.81,65.86,75.72,65.89,56.12,111.10,49.89],[61.43,61.19,57.20,89.65,100.34,64.82,111.51,88.70],[49.25,61.76,60.20,72.25,55.59,79.57,96.49,119.94],[58.17,60.18,73.65,74.79,53.71,59.86,98.63,131.27],[44.57,53.22,44.51,46.74,58.34,50.19,73.48,110.73],[44.60,58.15,43.45,69.81,58.62,43.55,66.99,110.28],[45.67,47.60,58.31,80.19,75.75,102.17,90.13,55.07],[42.26,51.50,36.09,52.13,72.51,63.21,42.45,101.72],[50.76,48.31,57.34,56.79,50.97,97.26,112.68,94.28],[51.00,62.35,53.81,47.25,54.65,85.18,105.29,93.71],[59.96,71.96,67.89,77.48,93.34,78.22,78.17,110.12],[66.09,64.81,72.93,91.04,105.58,99.48,78.63,100.49],[65.80,73.91,80.58,81.78,73.16,95.51,67.35,131.31],[50.65,63.91,71.89,87.21,52.20,89.53,74.26,120.98],[52.07,54.02,76.32,74.92,67.99,89.83,111.15,112.43],[57.45,62.78,72.10,81.08,78.73,82.90,105.04,90.21],[51.21,66.92,53.09,82.00,59.04,78.48,109.00,95.64],[52.52,51.35,64.92,50.25,68.99,54.35,67.46,50.24],[58.72,55.83,74.60,55.14,79.05,98.21,60.79,92.94],[52.29,55.76,63.65,76.66,65.39,75.83,95.16,87.84],[57.70,64.17,53.39,80.58,83.61,54.00,87.78,70.18],[50.44,68.71,55.13,57.42,77.08,66.94,51.99,101.10],[57.18,60.47,74.13,83.87,75.68,59.33,54.58,100.51],[52.50,59.48,57.03,78.37,81.99,72.87,62.98,96.08],[54.93,50.83,50.81,76.43,56.33,78.19,103.03,90.81],[44.50,60.32,69.56,52.90,62.33,44.04,83.12,79.47],[40.05,37.22,52.07,62.56,35.04,45.73,45.58,93.90],[32.48,44.03,32.41,39.63,41.23,28.72,55.49,71.59],[46.34,56.93,40.45,77.61,48.85,49.81,87.04,42.40],[67.74,70.39,61.30,83.56,91.24,87.32,65.15,70.22],[53.54,66.78,59.98,49.37,83.94,87.86,112.62,117.57],[52.92,54.52,50.37,59.25,75.57,104.70,54.70,126.09],[45.62,39.22,63.14,64.15,48.85,54.37,36.74,95.88],[39.81,39.43,55.85,45.34,52.86,92.76,73.13,88.10],[54.11,68.63,50.80,54.73,87.97,52.82,69.04,85.03],[61.09,64.22,70.05,55.86,65.58,96.53,99.53,122.22],[54.11,50.63,70.94,52.83,83.53,65.01,64.89,105.94],[48.07,60.53,49.33,55.07,68.74,94.05,75.05,85.63],[40.96,37.02,51.33,37.93,45.74,42.69,100.61,65.46],[36.84,52.22,50.24,59.25,51.25,75.17,70.77,97.22],[52.54,67.72,59.36,75.53,87.16,99.02,117.94,107.67],[50.88,67.02,66.74,76.12,60.84,105.19,63.48,72.51],[54.13,62.55,68.28,77.53,62.19,69.95,97.27,108.92],[50.14,53.33,55.02,63.41,87.94,91.63,54.07,97.21],[43.89,52.41,47.99,69.88,59.80,96.50,39.40,90.58],[29.07,42.20,53.65,64.71,30.42,39.17,85.00,86.47],[35.42,31.43,52.54,63.07,39.85,45.35,31.47,31.82],[37.66,43.84,51.29,44.22,50.20,45.95,39.46,103.46],[53.88,57.84,77.30,84.06,63.06,78.32,75.35,79.23],[36.42,31.51,33.63,30.19,41.48,80.72,36.69,88.32],[39.97,47.49,59.04,58.34,52.37,89.36,84.28,100.63],[48.94,61.34,73.97,72.24,56.31,83.85,110.80,118.58],[43.00,57.56,54.63,73.76,87.86,86.44,92.91,115.36],[51.45,43.54,63.47,80.18,68.31,95.13,47.39,64.29],[65.83,72.77,69.50,69.63,69.73,98.54,114.61,87.12],[56.25,63.22,54.91,52.43,70.69,59.06,102.38,91.81],[33.21,38.98,41.22,65.59,55.75,45.36,89.98,70.72],[42.07,45.21,57.71,62.12,45.53,56.44,43.73,52.31],[53.57,60.85,67.31,50.43,87.37,86.44,56.16,61.16],[43.87,44.75,60.57,62.54,57.19,93.26,88.42,46.04],[52.14,51.10,67.65,73.18,56.32,91.01,58.04,73.78],[43.29,43.99,57.98,69.90,71.96,55.81,39.28,101.73],[33.98,24.96,36.81,50.38,59.70,57.65,38.97,102.24],[47.03,47.35,68.15,79.05,59.06,98.08,89.47,113.74],[48.09,48.56,75.02,68.66,72.27,79.27,72.46,118.55],[53.99,51.41,50.21,78.51,87.50,97.79,109.48,58.00],[57.53,71.88,75.02,60.31,93.47,106.73,70.19,128.25],[60.08,64.58,76.15,76.14,55.35,57.63,109.31,75.36],[44.23,44.67,72.75,46.91,54.15,74.83,99.20,84.23],[51.70,58.41,74.16,69.64,70.46,82.02,53.15,114.03],[47.32,47.42,53.45,83.39,63.20,53.89,93.80,84.36],[60.64,54.90,63.81,69.09,80.11,58.81,57.78,85.16],[79.53,86.25,96.50,77.71,88.04,73.85,108.52,93.80]]
      }]
    }, {
      'index' : 2,
      'data' : [{
        'type' : 'Measure',
        'name' : 'Full-load',
        'values' : [[11.72,17.21,26.02,27.19,49.92,62.87,23.07,47.86],[28.25,44.52,33.45,33.74,49.49,77.61,46.09,89.53],[54.22,65.43,67.58,67.85,93.31,61.21,118.39,86.10],[51.18,63.67,73.01,67.75,68.53,87.55,91.41,91.14],[54.85,52.94,55.86,60.70,77.12,100.14,79.16,98.53],[53.32,57.32,72.41,79.53,92.86,66.85,107.62,78.56],[61.12,57.54,73.59,78.76,98.66,97.71,115.62,98.56],[62.75,67.30,61.40,87.24,104.90,99.09,119.51,67.59],[60.63,68.57,61.47,97.63,67.54,57.98,66.53,122.34],[55.79,59.01,78.54,72.82,65.97,63.58,52.37,101.58],[56.51,51.33,58.85,70.17,79.26,92.10,51.49,67.72],[56.53,69.04,76.72,64.58,87.42,75.57,70.73,62.56],[56.47,64.44,71.52,53.05,95.13,80.34,99.18,83.87],[53.64,63.43,71.62,60.12,88.26,79.90,82.95,123.82],[55.39,62.50,52.29,65.42,61.71,52.56,109.09,79.21],[59.88,60.20,70.38,64.68,102.48,111.54,83.41,126.52],[56.53,66.19,82.40,57.30,87.42,67.49,112.25,126.26],[60.35,59.06,74.53,70.73,75.34,106.99,75.62,78.47],[59.09,54.55,72.98,67.01,72.70,79.36,72.93,97.74],[54.07,66.88,61.78,57.20,100.72,110.72,110.41,101.01],[60.34,58.61,58.20,79.32,89.14,68.21,99.70,79.07],[60.18,75.31,71.92,65.44,85.11,91.13,111.50,113.37],[61.96,59.68,71.84,76.02,71.53,92.35,61.41,138.95],[19.18,35.23,40.24,36.43,48.84,46.45,54.63,21.91],[53.21,63.04,65.40,78.78,75.74,61.01,118.69,70.00],[65.28,65.38,59.06,94.04,99.36,104.86,89.30,114.24],[37.93,31.61,44.26,51.25,44.13,87.15,35.43,40.11],[63.35,62.59,84.82,85.65,69.66,89.11,57.91,86.63],[40.47,50.42,59.32,34.80,56.42,69.18,98.51,64.33],[28.80,21.76,25.52,51.47,63.40,48.05,21.19,85.77],[59.49,59.61,79.62,92.06,99.23,85.45,122.80,123.68],[57.12,70.96,69.93,80.44,98.63,62.84,62.86,114.20],[38.58,49.88,61.12,43.38,53.76,71.20,37.49,70.40],[65.03,73.99,76.60,76.18,72.29,95.66,111.92,71.21],[54.72,50.71,66.76,73.80,82.50,74.99,86.39,86.69],[19.13,18.28,28.10,33.38,27.39,65.32,28.99,67.65],[50.36,52.95,65.01,86.57,66.83,87.96,117.72,96.50],[51.33,63.20,59.81,81.00,98.31,76.59,80.62,125.10],[57.24,65.79,74.02,68.87,59.38,93.58,79.20,101.37],[54.54,56.94,65.08,57.56,90.32,67.67,54.16,97.26],[50.96,66.39,66.18,59.36,68.58,63.41,49.32,96.07],[42.14,51.14,36.08,48.72,52.97,64.51,80.29,60.73],[48.12,49.67,64.92,60.98,50.94,93.64,98.48,97.51],[59.78,77.22,81.93,89.05,102.49,102.45,104.11,74.34],[59.12,58.58,72.77,54.26,92.75,60.95,91.71,100.74],[55.00,57.05,67.18,76.70,81.64,90.53,102.01,121.39],[51.95,59.71,44.44,49.97,52.04,64.41,94.15,59.62],[58.62,55.88,71.57,69.64,92.02,60.32,87.44,91.70],[60.67,61.89,65.36,69.25,101.01,83.41,114.64,96.74],[55.61,66.78,56.99,77.30,90.92,107.01,114.68,130.62],[58.80,64.53,70.54,80.08,68.74,75.92,86.88,83.70],[57.10,70.33,67.54,60.59,57.45,102.36,90.38,65.11],[54.95,59.69,75.86,65.33,94.08,61.59,58.42,70.75],[57.00,57.21,51.64,85.84,82.00,104.33,113.68,72.14],[46.61,59.75,55.51,82.76,70.15,92.05,73.88,102.02],[58.76,59.23,75.86,66.75,83.30,60.02,68.54,57.03],[60.88,60.72,61.35,82.16,91.47,84.70,86.03,113.98],[67.72,77.68,86.94,79.38,85.10,76.64,68.15,94.47],[57.37,67.91,69.87,81.62,102.25,82.77,60.66,124.86],[51.46,61.09,56.36,52.86,66.03,98.89,112.17,74.20],[57.89,63.69,86.27,80.79,83.78,115.74,89.17,109.93],[58.80,71.22,82.41,72.39,75.02,72.00,99.87,135.41],[59.61,55.62,52.80,64.86,99.41,104.12,71.45,115.02],[59.89,57.75,63.69,66.22,87.36,71.12,83.10,74.11],[54.87,53.56,71.51,74.83,78.50,71.59,96.07,89.45],[46.43,52.11,62.12,51.86,58.93,78.83,76.23,54.07],[60.87,67.10,54.66,71.80,65.24,60.80,76.03,113.63],[66.12,70.33,70.86,85.11,79.25,93.25,112.71,92.06],[54.99,62.53,54.81,68.20,81.86,84.71,80.84,85.01],[59.53,57.97,65.55,59.04,65.06,94.01,57.00,128.82],[38.42,50.18,45.67,50.12,69.95,40.82,76.22,48.94],[64.12,65.01,71.36,60.10,100.03,84.68,109.38,76.00],[61.86,75.72,57.64,72.12,70.71,62.24,114.44,67.33],[66.71,76.15,63.07,87.18,89.56,61.62,73.22,105.58],[64.98,73.05,73.32,93.99,104.05,84.18,79.66,73.94],[63.02,72.13,66.33,64.06,76.08,101.17,109.33,103.12],[58.76,69.07,64.61,80.54,97.13,105.42,100.15,128.17],[55.69,60.73,76.06,82.89,96.08,61.64,56.42,77.53],[60.48,69.25,72.36,89.37,58.36,75.52,86.43,126.71],[58.17,69.06,73.70,69.47,59.09,58.32,69.91,118.35],[57.60,54.54,65.48,81.32,62.18,53.12,105.89,70.02],[57.34,60.47,74.23,83.58,53.53,85.73,52.27,68.68],[57.21,55.43,80.65,60.42,59.46,109.59,109.00,91.39],[52.17,53.78,65.91,67.17,82.20,75.37,85.76,73.76]]
      }]
    }]};
    
    testDataSet['riv/cbar'] = {
     'analysisAxis':[{
      'index' : 1,
      'data' : [{
        'type' : 'Dimension',
        'name' : 'Product',
        'values' : ['China', 'USA', 'Canada', 'India','France']
      }]
    }], 
    'measureValuesGroup':[{
      'index' : 1,
      'data' : [{
        'type' : 'Measure',
        'name' : 'Profit',
        'values' : [[25,58,24,159,149]]
      }]
    },{
      'index' : 2,
      'data' : [{
        'type' : 'Measure',
        'name' : 'Revenue',
        'values' : [[14,38,44,29,69]]
      }]
    }]};

    testDataSet['viz/heatmap'] = {
      'analysisAxis': [{
    
      'index' : 1,
      'data' : [{
        'type' : 'Dimension',
        'name' : 'Country',
        'values' : ['China', 'China', 'China', 'USA', 'USA', 'USA', 'France', 'France', 'France', 'Canada', 'Canada', 'Canada', 'Japan', 'Japan', "Japan", ]
      },{
        'type' : 'Dimension',
        'name' : 'Year',
        'values' : ['2007', '2006', "2009", '2007', '2006', "2009", '2007', '2006', "2009", '2007', '2006', "2009", '2007', '2006', "2009", ]
      }]
    },
        {
                'index': 2,
                'data': [{
        'type' : 'Dimension',
        'name' : 'PC',
        'values' : ['Profit', 'Profit', 'Profit', 'Profit', 'Profit', 'Profit', 'Profit', 'Profit', 'Profit', 'Profit', 'Profit', 'Profit',  
                            'Cost', 'Cost', 'Cost', 'Cost', 'Cost', 'Cost', 'Cost', 'Cost', 'Cost', 'Cost', 'Cost', 'Cost', 
                           
                           ]
      },{
        'type' : 'Dimension',
        'name' : 'Product',
        'values' : ['Car', 'Trunk', "Bike", 'Car', 'Trunk', "Bike", 'Car', 'Trunk', "Bike", 'Car', 'Trunk', "Bike", 'Car', 'Trunk', "Bike", 'Car', 'Trunk', "Bike", 'Car', 'Trunk', "Bike", 'Car', 'Trunk', "Bike", ]
      }]
            }                    
                ], 
                'measureValuesGroup': [{
                        'index': 1,
                        'data': [{
                                'type': 'Measure',
                                'name': 'Profit',
                                'values': [[20,20,20,20,20,20,40,40,40,40,40,80,80,80,80],
[20,20,20,20,20,20,40,40,40,40,40,80,80,80,80],
[20,20,20,20,20,20,40,40,40,40,40,80,80,80,80],
[20,80,80,80,20,20,40,40,40,40,40,80,80,100,80],
[20,80,80,80,20,20,40,40,40,40,40,80,80,80,80],
[20,80,80,80,20,20,40,40,40,40,40,80,80,80,80],
[20,80,80,80,20,20,40,40,40,40,40,80,80,80,80],
[20,20,20,20,20,20,40,40,40,40,40,40,40,40,80],
[20,20,20,20,20,20,40,40,40,40,40,40,40,40,80],
[20,20,100,100,null,20,40,40,40,40,40,20,20,40,80],
[20,20,100,100,100,20,40,40,40,40,40,20,20,80,80],
[40,40,100,100,100,40,60,60,60,60,60,20,20,80,80],
[40,40,40,40,40,40,60,60,60,60,60,80,80,80,80],
[40,40,40,40,40,40,60,60,60,60,60,80,80,80,80],
[40,40,40,40,40,40,60,60,60,60,60,80,80,80,80],
[40,40,40,40,40,40,60,60,60,60,60,80,80,80,80],
[40,40,40,40,40,40,60,60,60,60,60,80,80,80,80],
[40,40,40,40,40,40,60,80,80,80,80,80,80,80,80],
[40,40,40,40,40,40,80,80,80,80,80,80,80,80,80],
[40,40,40,40,40,40,80,80,80,80,80,80,80,80,80],
[40,40,40,40,40,40,80,80,80,80,80,80,80,80,80],
[40,40,40,40,40,40,80,80,80,null,80,80,80,80,80],
[40,40,40,40,40,40,80,80,80,80,80,80,80,80,80],
[60,60,60,60,60,60,80,80,80,80,80,100,100,100,100],
]
                            }]
                    }]};
                    
  
  testDataSet['viz/treemap'] = {
      'analysisAxis': [{
    
          'index' : 1,
          'data' : [{
            'type' : 'Dimension',
            'name' : 'Continent',
            'values' : ['Asia','Asia','Asia','Asia','Asia','Asia','Europe','Europe','Europe','Europe','Europe','Europe','America','America','America','America','America','America']
          },{
            'type' : 'Dimension',
            'name' : 'Country',
            'values' : ['China','China','China','Japan','Japan','Japan','France','France','France','Germany','Germany','Germany','Canada','Canada','Canada','USA','USA','USA']
          },{
            'type' : 'Dimension',
            'name' : 'Year',
            'values' : ['2011','2010','2009','2011','2010','2009','2011','2010','2009','2011','2010','2009','2011','2010','2009','2011','2010','2009']
          }]
        }], 
      'measureValuesGroup': [{
              'index': 1,
              'data': [{
                      'type': 'Measure',
                      'name': 'Margin',
                      'values': [[23,15,12,4,2,2,10,5,5,14,8,6,9,5,5,25,12,12]]
                  }]
          },{
              'index': 2,
              'data': [{
                      'type': 'Measure',
                      'name': 'Volume',
                      'values': [[11000,6800,4300,1520,790,710,4120,2070,1720,6210,3570,2220,3610,2100,1580,12752,7978,4651]]
                  }]
          }
        ]
      };

    
  testDataSet['viz/radar'] =  {
          analysisAxis : [{
            index : 1,
            data : [{
              type : "Dimension",
              name : "Model",
              values : [ "777-200", "777-200ER", "777-200LR", "777 Freighter", "777-300", "777-300ER" ]
            }]
          }, {
            index : 2,
            data : [{
              type : "Dimension",
              name : "Route",
              values : [ "VHHH-ZBAA", "ZSPD-KLAX", "KSFO-CYVR", "KJFK-EGLL" ]
            }, {
              type : "Dimension",
              name : "Year",
              values : [ "2007", "2010", "2007", "2010" ]
            }]
          }],
          
          measureValuesGroup : [{
            index : 1,
            data : [{
              type : "Measure",
              name : "Fuel-burn",
              values : [ [ 590000, 670000, 300000, 480000, 240500, 380000 ], 
                         [ 210000, 310000, 315000, 410000, 370000, 613000 ], 
                         [ 270000, 520000, 325000, 420000, 520000, 720000 ], 
                         [ 240000, 130000, 330000, 430000, 530000, 630000 ] ]
            }, {
              type : "Measure",
              name : "Pax/cargo",
              values : [ [ 195000, 185000, 476000, 169800, 130000, 178000 ], 
                         [ 135000, 150000, 146000, 669800, 130000, 178000 ], 
                         [ 135000, 150000, 146000, 159800, 130000, 178000 ], 
                         [ 145000, 156000, 166000, 166800, 160000, 197500 ] ]
            }]
          }]
        };
  
  testDataSet['viz/waterfall'] =       {
            'analysisAxis': [{
        
            'index' : 1,
            'data' : [{
                'type' : 'Dimension',
                'name' : 'Category',
                'values' : ['Net Revenue', 'Production Cost', 'Selling Cost', 'Marketing', 'Order Processing', 'Distribution', 'Warranty'
                                    ,'General Admin','Sustainability','Vendor Process']
            }]
        }], 
        'measureValuesGroup':[{
            'index' : 1,
            'data' : [{
                'type' : 'Measure',
                'name' : 'Revenue',
                'values' : [[52000,-12000,-6400,-5000,-2000,-7000,-5200,-2400,-1400,-1000]]
            }]
        }]};
  
  testDataSet['viz/horizontal_waterfall'] = testDataSet['viz/waterfall'];

  testDataSet['viz/stacked_waterfall'] = {
      'analysisAxis' : [ {
        'index' : 1,
        'data' : [ {
          'type' : 'Dimension',
          'name' : 'Year-Quarter',
          'values' : [ '2009-Q1', '2009-Q2', '2009-Q3', '2009-Q4', '2010-Q1', '2010-Q2', '2010-Q3', '2010-Q4', '2011-Q1', '2011-Q2', '2011-Q3', '2011-Q4']
        } ]
      } ,{
        'index' : 2,
        'data' : [ {
          'type' : 'Dimension',
          'name' : 'State',
          'values' : [ 'Texas', 'California']
        } ]
      } ],
      'measureValuesGroup' : [ {
        'index' : 1,
        'data' : [ {
          'type' : 'Measure',
          'name' : 'Margin',
          'values' : [ [ 320788,295803,132718,257046,367191,323260,280224,488885,404373,449199,345547,497358],[230555,208271,150757,185308,241912,207097,259039,368479,275503,319628,255685,390671] ]
        } ]
      } ]
  };
  
  testDataSet['viz/horizontal_stacked_waterfall'] = testDataSet['viz/stacked_waterfall'];
  
  var datas = {
    words : [ 'China', 'USA', 'Japan', 'England', 'Hongkong','China', 'USA', 'Japan', 'England', 'Hongkong',
              'China', 'USA', 'Japan', 'England', 'Hongkong','China', 'USA', 'Japan', 'England', 'Hongkong',
              'China', 'USA', 'Japan', 'England', 'Hongkong','China', 'USA', 'Japan', 'England', 'Hongkong',
              'China', 'USA', 'Japan', 'England', 'Hongkong','China', 'USA', 'Japan', 'England', 'Hongkong'
              ],
    wordsSize : [10, 17, 8, 12, 15, 7, 9, 9, 10, 13, 6, 9, 17, 18, 17, 15, 11, 6, 17, 12, 8, 16, 2, 21, 10, 12, 6, 8, 7, 21, 18, 19, 2, 8, 9, 14, 4, 9, 17, 3],
    wordsFamily : [10, 17, 20, 7, 2, 4, 10, 14, 8, 10, 18, 9, 19, 13, 21, 12, 16, 5, 7, 10, 18, 6, 16, 19, 8, 4, 12, 9, 3, 6, 10, 7, 14, 6, 21, 11, 20, 5, 2, 2]
  };
//  for(var i = 0, len = datas.words.length; i < len; i++){
//    //if(i === 0) {
//    //  datas.wordsSize.push(null);
//    //  datas.wordsFamily.push(null);
//    //}else{
//      datas.wordsSize.push(Math.round(Math.random() * 20+1));
//      datas.wordsFamily.push(Math.round(Math.random() * 20+1));
//    //}
//  }
  testDataSet['viz/tagcloud'] = {
      'analysisAxis': [{
            'index': 1,
            'data': [{
              'type' : 'Dimension',
          'name' : 'tagname',
          'values' : datas.words
            }]
      }],
      'measureValuesGroup': [{
            'index': 1,
            'data': [{
              'type' : 'Measure',
          'name' : 'tagwidth',
          'values' : [datas.wordsSize]
            }]
          },{
            'index': 2,
            'data': [{
                'type' : 'Measure',
          'name' : 'tagfamily',
          'values' : [datas.wordsFamily]
          }]
          }]
    };
    
    testDataSet['viz/multi_radar'] = {
      analysisAxis : [
          {
            'index': 1,
            'data': [{
                    'type': 'Dimension',
                    'name': 'Country',
                    'values': ['China', 'China', 'USA', 'USA', 'Canada', 'Canada']
                }, {
                    'type': 'Dimension',
                    'name': 'Year',
                    'values': ['2001', '2002', '2001', '2002', '2001', '2002']
                }]
          },
          {
            index : 2,
            data : [{
              type : "Dimension",
              name : "Model",
              values : [ "777-200", "777-200ER", "777-200LR", "777 Freighter"]
            }]
          }],
          
          measureValuesGroup : [{
            index : 1,
            data : [{
              type : "Measure",
              name : "Fuel-burn",
              values : [ [ 590000, 670000, 300000, 480000, 240500, 380000 ], 
                         [ 210000, 310000, 315000, 410000, 370000, 613000 ], 
                         [ 270000, 520000, 325000, 420000, 520000, 720000 ], 
                         [ 240000, 130000, 330000, 430000, 530000, 630000 ] ]
            }, {
              type : "Measure",
              name : "Pax/cargo",
              values : [ [ 195000, 185000, 476000, 169800, 130000, 178000 ], 
                         [ 135000, 150000, 146000, 669800, 130000, 178000 ], 
                         [ 135000, 150000, 146000, 159800, 130000, 178000 ], 
                         [ 145000, 156000, 166000, 166800, 160000, 197500 ] ]
            }]
          }]
    };
  
    testDataSet['viz/multi_column'] = {
      'analysisAxis' : [{
                'index': 1,
                'data': [{
                        'type': 'Dimension',
                        'name': 'Country',
                        'values': ['China', 'China', 'USA', 'USA', 'Canada', 'Canada', 'Spain', 'Spain']
                    }, {
                        'type': 'Dimension',
                        'name': 'Year',
                        'values': ['2001', '2002', '2001', '2002', '2001', '2002', '2001', '2002']
                    }]
            }, {
                'index': 2,
                'data': [{
                        'type': 'Dimension',
                        'name': 'Product',
                        'values': ['Car', 'Car', 'Truck', 'Truck']
                    },{
                        'type': 'Dimension',
                        'name': 'Color',
                        'values': ['Black', 'Red', 'Black', 'Red']
                    }]
            }],
           'measureValuesGroup' : [{
                'index': 1,
                'data': [{
                        'type': 'Measure',
                        'name': 'Profit',
                        'values': [[16, 2, 13, 2, 31, 3, 58, 7], [75, 2, 75, 6, 22, 3, 3, 48], [6, 62, 3, 82, 1, 13, 8, 37], [45, 2, 65, 6, 82, 3, 13, 8]]
                    },{
                        'type': 'Measure',
                        'name': 'Revenue',
                        'values': [[6, 12, 3, 22, 1, 43, 8, 67], [5, 82, 5, 16, 2, 3, 33, 8], [56, 2, 73, 2, 91, 3, 8, 27], [5, 52, 5, 76, 2, 93, 3, 28]]
                    }]
            }]};
    
    testDataSet['viz/multi_bar'] = testDataSet['viz/multi_column'];
    testDataSet['viz/multi_stacked_bar'] = testDataSet['viz/multi_stacked_column'] = testDataSet['viz/multi_column'];
    testDataSet['viz/multi_100_stacked_bar'] = testDataSet['viz/multi_100_stacked_column'] = testDataSet['viz/multi_column'];
    testDataSet['viz/multi_horizontal_line'] = testDataSet['viz/multi_line'] = testDataSet['viz/multi_column'];
    testDataSet['viz/multi_area'] = testDataSet['viz/multi_horizontal_area'] = testDataSet['viz/multi_column'];
    testDataSet['viz/multi_100_area'] = testDataSet['viz/multi_100_horizontal_area'] = testDataSet['viz/multi_column'];
    testDataSet['viz/multi_dual_column'] = {
      'analysisAxis' : [{
                'index': 1,
                'data': [{
                        'type': 'Dimension',
                        'name': 'Country',
                        'values': ['China', 'China', 'USA', 'USA', 'Canada', 'Canada', 'Spain', 'Spain']
                    }, {
                        'type': 'Dimension',
                        'name': 'Year',
                        'values': ['2001', '2002', '2001', '2002', '2001', '2002', '2001', '2002']
                    }]
            }, {
                'index': 2,
                'data': [{
                        'type': 'Dimension',
                        'name': 'Product',
                        'values': ['Car', 'Car', 'Truck', 'Truck']
                    },{
                        'type': 'Dimension',
                        'name': 'Color',
                        'values': ['Black', 'Red', 'Black', 'Red']
                    }]
            }],
           'measureValuesGroup' : [{
                'index': 1,
                'data': [{
                        'type': 'Measure',
                        'name': 'Profit',
                        'values': [[109, 22, 13, 32, 31, 43, 58, 37], [111, 32, 95, 46, 22, 53, 3, 48], [26, 62, 33, 101, 31, 13, 8, 37], [45, 42, 65, 56, 82, 63, 13, 8]]
                    }]
            },{
                'index': 2,
                'data': [{
                        'type': 'Measure',
                        'name': 'Revenue',
                        'values': [[6, 12, 3, 22, 1, 43, 8, 67], [5, 82, 5, 16, 2, 3, 33, 8], [56, 2, 73, 2, 91, 3, 8, 27], [5, 52, 5, 76, 2, 93, 3, 28]]
                    }]
            }]};
    
    testDataSet['viz/multi_dual_bar'] = testDataSet['viz/multi_dual_column'];
    testDataSet['viz/multi_dual_line'] = testDataSet['viz/multi_dual_horizontal_line'] = testDataSet['viz/multi_dual_column'];
    
    testDataSet['viz/multi_dual_stacked_bar'] = {
      'analysisAxis' : [{
                'index': 1,
                'data': [{
                        'type': 'Dimension',
                        'name': 'Country',
                        'values': ['China', 'China', 'USA', 'USA', 'Canada', 'Canada', 'Spain', 'Spain']
                    }, {
                        'type': 'Dimension',
                        'name': 'Year',
                        'values': ['2001', '2002', '2001', '2002', '2001', '2002', '2001', '2002']
                    }]
            }, {
                'index': 2,
                'data': [{
                        'type': 'Dimension',
                        'name': 'Product',
                        'values': ['Car', 'Car', 'Truck', 'Truck']
                    },{
                        'type': 'Dimension',
                        'name': 'Color',
                        'values': ['Black', 'Red', 'Black', 'Red']
                    }]
            }],
           'measureValuesGroup' : [{
                'index': 1,
                'data': [{
                        'type': 'Measure',
                        'name': 'Profit',
                        'values': [[109, 22, 13, 32, 31, 43, 58, 37], [111, 32, 95, 46, 22, 53, 3, 48], [26, 62, 33, 101, 31, 13, 8, 37], [45, 42, 65, 56, 82, 63, 13, 8]]
                    },{
                        'type': 'Measure',
                        'name': 'Margin',
                        'values': [[10,20,7,25,2,10,12,30],[15,18,11,25,5,5,13,40],[10,20,7,25,2,10,12,30],[15,18,11,25,5,5,13,40]]
                    }]
            },{
                'index': 2,
                'data': [{
                        'type': 'Measure',
                        'name': 'Revenue',
                        'values': [[6, 12, 3, 22, 1, 43, 8, 67], [5, 82, 5, 16, 2, 3, 33, 8], [56, 2, 73, 2, 91, 3, 8, 27], [5, 52, 5, 76, 2, 93, 3, 28]]
                    }]
            }]};
            
    testDataSet['viz/multi_dual_stacked_column'] = testDataSet['viz/multi_dual_stacked_bar']; 
    testDataSet['viz/multi_100_dual_stacked_bar'] = testDataSet['viz/multi_100_dual_stacked_column'] = testDataSet['viz/multi_dual_stacked_bar'];           
            
    testDataSet['viz/multi_pie'] = {
      'analysisAxis' : [{
                'index': 1,
                'data': [{
                        'type': 'Dimension',
                        'name': 'Country',
                        'values': ['China', 'China', 'USA', 'USA', 'Canada', 'Canada', 'Spain', 'Spain']
                    }, {
                        'type': 'Dimension',
                        'name': 'Year',
                        'values': ['2001', '2002', '2001', '2002', '2001', '2002', '2001', '2002']
                    }]
            },{
                'index': 2,
                'data': [{
                        'type': 'Dimension',
                        'name': 'Product',
                        'values': ['Car', 'Car', 'Truck', 'Truck']
                    },{
                        'type': 'Dimension',
                        'name': 'Color',
                        'values': ['Black', 'Red', 'Black', 'Red']
                    }]
            }],
           'measureValuesGroup' : [{
                'index': 1,
                'data': [{
                        'type': 'Measure',
                        'name': 'Profit',
                        'values': [[16, 2, 13, 2, 31, 3, 58, 7], [75, 2, 95, 6, 22, 3, 3, 48], [6, 62, 3, 82, 1, 13, 8, 37], [45, 2, 65, 6, 82, 3, 13, 8]]
                    }]
            }]};
    
    testDataSet['viz/multi_donut'] = testDataSet['viz/multi_pie'];
    
    testDataSet['viz/combination'] = { 
            'analysisAxis': [{
                'index':1,
                'data': [ 
                {
                                'type' : 'Dimension',
                                'name' : 'Country',
                                'values' : ['China','China', 'USA','USA', 'Canada','Canada']
                }, {
                                'type' : 'Dimension',
                                'name' : 'Year',
                                'values' : ['2001','2002', '2001','2002', '2001','2002']
                }      ]
            }, {
                'index': 2,
                'data': [{
                        'type': 'Dimension',
                        'name': 'Product',
                        'values': ['Car', 'Truck', 'Motorcycle']
                    }]
            }], 
            'measureValuesGroup':[{
                'index': 1,
                'data': [{
                        'type': 'Measure',
                        'name': 'Profit',
                        'values': [[25, 136, 58, 128, 58, 24], [159, 147, 149, 269, 38, 97], [129, 47, 49, 69, 33, 47] ]
                    }, {
                        'type': 'Measure',
                        'name': 'Revenue',
                        'values': [[50, 272, 116, 256, 116, 48], [300, 247, 249, 369, 68, 197], [229, 147, 149, 169, 133, 147]]
                    }]
            }]};
    testDataSet['viz/dual_combination'] = { 
            'analysisAxis': [{
                'index':1,
                'data': [ 
                {
                                'type' : 'Dimension',
                                'name' : 'Country',
                                'values' : ['China','China', 'USA','USA', 'Canada','Canada']
                }, {
                                'type' : 'Dimension',
                                'name' : 'Year',
                                'values' : ['2001','2002', '2001','2002', '2001','2002']
                }      ]
            }, {
                'index': 2,
                'data': [{
                        'type': 'Dimension',
                        'name': 'Product',
                        'values': ['Car', 'Truck', 'Motorcycle']
                    }]
            }], 
            'measureValuesGroup':[
      {
                'index': 1,
                'data': [{
                        'type': 'Measure',
                        'name': 'Profit',
                        'values': [[25, 136, 58, 128, 58, 24], [159, 147, 149, 269, 38, 97], [129, 47, 49, 69, 33, 47] ]
                    }]
            },
      {
                'index': 2,
                'data': [{
                        'type': 'Measure',
                        'name': 'Revenue',
                        'values': [[50, 272, 116, 256, 116, 48], [300, 247, 249, 369, 68, 197], [229, 147, 149, 169, 133, 147]]
                    }]
            }
      ]};
  testDataSet['viz/horizontal_combination'] = testDataSet['viz/combination'];
  testDataSet['viz/dual_horizontal_combination'] = testDataSet['viz/dual_combination'];
  
    testDataSet['viz/ext/pa/pc'] = {
            'analysisAxis': [{
                'index': 1,
                'data': [{
                    'type': 'Dimension',
                    'name': 'Sample',
                    'values': ['1', '2', '3', '4', '5']
                }]
            } , {
                'index': 2,
                'data': [{
                    'type': 'Dimension',
                    'name': 'Species',
                    'values': ['setosa', 'versicolor', 'virginica']
                }]
            }],
            'measureValuesGroup': [{
                'index': 1,
                'data': [{
                    'type': 'Measure',
                    'name': 'sepal length',
                    'values': [[5.1, 4.9, 4.7, 4.6, 5], [7, 6.4, 6.9, 5.5, 6.5], [6.3, 5.8, 7.1, 6.3, 6.5]]
                }, {
                    'type': 'Measure',
                    'name': 'sepal width',
                    'values': [[3.1, 8.9, 2.7, 6.6, 5], [5, 6.6, 6.9, 7.5, 2.5], [2.3, 5.8, 8.1, 1.3, 2.5]]
                }, {
                    'type': 'Measure',
                    'name': 'petal length',
                    'values': [[5.1, 4.9, 4.7, 4.6, 5], [7, 6.4, 6.9, 5.5, 6.5], [6.3, 5.8, 7.1, 6.3, 6.5]]
                }, {
                    'type': 'Measure',
                    'name': 'petal width',
                    'values': [[3.1, 2.9, 1.7, 4.2, 1], [6, 3.4, 2.9, 1.5, 2.5], [3.3, 2.8, 8.1, 6.3, 8.5]]
                }]
            }]
        };
        
    testDataSet['viz/scatter_matrix'] = {
        'analysisAxis':[{
                'index' : 1,
                'data' : [{
                    'type' : 'Dimension',
                    'name' : 'Country',
                    'values' : ['China', 'China', 'China', 'China', 'USA', 'USA', 'USA', 'USA', 'Canada', 'Canada', 'Canada', 'Canada', 'Germany', 'Germany', 'Germany', 'Germany']
                }, {
                    'type' : 'Dimension',
                    'name' : 'Product',
                    'values' : ['Car', 'Truck', 'Motorcycle', 'Bicycle', 'Car', 'Truck', 'Motorcycle', 'Bicycle', 'Car', 'Truck', 'Motorcycle', 'Bicycle', 'Car', 'Truck', 'Motorcycle', 'Bicycle']
                }]
            }], 
            'measureValuesGroup':[{
                'index' : 1,
                'data' : [{
                    'type' : 'Measure',
                    'name' : 'Revenue',
                    'values' : [[20, 18, 25, 35, 30, 19, 22, 40, 36, 10, 42, 12, 15, 35, 28, 7]]
                },{
                    'type' : 'Measure',
                    'name' : 'Profit',
                    'values' : [[5, 8, 5, 15, 12, 15, 6, 11, 20, 5, 23, 10, 14, 8, 20, 5]]
                },{
                    'type' : 'Measure',
                    'name' : 'Cost',
                    'values' : [[11, 20, 5, 23, 10, 14, 8, 20, 5, 5, 8, 5, 15, 12, 15, 6]]
                },{
                    'type' : 'Measure',
                    'name' : 'Margin',
                    'values' : [[12, 15, 6, 11, 20, 5, 23, 10, 5, 8, 5, 15, 14, 8, 20, 5]]
                }]
             }]
    };
    testDataSet['viz/ext/pa/funnel'] = {
            'analysisAxis': [ {
                'index': 1,
                'data': [{
                    'type': 'Dimension',
                    'name': 'Sample',
                    'values': ['1']
                }]
            } ,{
                'index': 2,
                'data': [{
                    'type': 'Dimension',
                    'name': 'Species',
                    'values': ['A','B','C','D','E','A','B','C','D','E']
                }]
            }],
            'measureValuesGroup': [{
                'index': 1,
                'data': [{
                    'type': 'Measure',
                    'name': 'sepal',
                    'values': [[40],[50],[50],[10],[5],[5],[5],[5],[5],[5]]
                }]
            }]
        };
        // if url ends with ?fake, use "fake data"
        var isFake = /[\?\&]fake([\=\&]|$)/.test(window.location.search);
        /////////////////
        //viz/choropleth
        (function() {
            var navValues = [ { featureId: '21017065,NAVTEQ', name: 'Colorado' },
                            { featureId: '21009408,NAVTEQ', name: 'California' },
                            { featureId: '21010819,NAVTEQ', name: 'New York' },
                            { featureId: '21015214,NAVTEQ', name: 'Texas' },
                            { featureId: '21022302,NAVTEQ', name: 'District of Columbia' },
                            { featureId: '21014299,NAVTEQ', name: 'Massachusetts' },
                            { featureId: '21002247,NAVTEQ', name: 'Illinois' },
                            { featureId: '21023288,NAVTEQ', name: 'Florida' },
                            { featureId: '21014052,NAVTEQ', name: 'Montana' },
                            { featureId: '21001865,NAVTEQ', name: 'Washington' }, 
                            { featureId: '21001841,NAVTEQ', name: 'Oregon' }, 
                            { featureId: '21007137,NAVTEQ', name: 'Michigan' }, 
                            { featureId: '21001828,NAVTEQ', name: 'Idaho' }, 
                            { featureId: '21009401,NAVTEQ', name: 'Arizona' }, 
                            { featureId: '21020362,NAVTEQ', name: 'Tennessee' } 
                            ];

            var values = [];
            var infos = [];

            $.each(navValues, function(i, v) {
                values.push(v.name);
                infos.push({ featureId : v.featureId });
            });
            
            /*
                Geo data
                MG 1: feature id
                MG 2: size
                AA 1: (future) color
                AA 2: (future) shape
            */
            testDataSet['viz/choropleth'] = {                 
                'analysisAxis':[{
                    'index' : 1,
                    'data' : [{
                        'type' : 'GeoDimension',
                        'name' : 'Region',
                        'values' : values,
                        'infos' : infos
                    }]
                }],  
               'measureValuesGroup':[{
                    'index' : 1,
                    'data' : [{
                        'type' : 'Measure',
                        'name' : 'Number of Planes',
                        'values' : [[18, 98, 30, 46, 64, null, 102, 150, 73, 97, 55, 20, null, 128, 119, 60, 30, 98, 19].slice(0,navValues.length)],
                        'isFake': isFake
                    }]
                }]
            };
        })();

        /////////////////
        //viz/geobubble
        (function() {
            var navValues = [{ featureId: 'C21019301,NAVTEQ', name: 'New York' }, 
                            { featureId: 'C21086811,NAVTEQ', name: 'Vancouver' }, 
                            { featureId: 'C21155525,NAVTEQ', name: 'Montréal' }, 
                            { featureId: 'C21156103,NAVTEQ', name: 'Ottawa' }, 
                            { featureId: 'C21055407,NAVTEQ', name: 'Toronto' }, 
                            { featureId: 'C23039216,NAVTEQ', name: 'Rio de Janeiro' }, 
                            { featureId: 'C23380551,NAVTEQ', name: 'Санкт-Петербург' }, 
                            { featureId: 'C20337455,NAVTEQ', name: 'London' }, 
                            // { featureId: 'EM844406835,NAVTEQ', name: 'SHANGHAI' }, 
                            // { featureId: 'EM844435769,NAVTEQ', name: 'TOKYO' }, 
                            { latLong: [0, 0], name: 'Center' },
                            // { featureId: 'C21550948,NAVTEQ', name: 'Sydney' }, 
                            // { featureId: '21009408,NAVTEQ', name: 'California' }, 
                            // { featureId: '21055265,NAVTEQ', name: 'Alberta' }, 
                            // { featureId: '22832175,NAVTEQ', name: 'Lesotho' }, 
                            ];

            var values = [];
            var infos = [];

            for (var i = 0; i < navValues.length; i++) {
                values.push(navValues[i].name);
                infos.push({ featureId: navValues[i].featureId, latLong: navValues[i].latLong });
            }
            
            testDataSet['viz/geobubble'] = {
                'analysisAxis':[{
                    'index' : 1,
                    'data' : [{
                        'type' : 'Dimension',
                        'name' : 'Region',
                        'values' : values,
                        'infos' : infos
                     }]
                }],  
                'measureValuesGroup':[{
                    'index' : 1,
                    'data' : [{
                        'type' : 'Measure',
                        'name' : 'Number of Planes',
                        'values' : [[18, 98, 30, 46, 100, 103, 102, 150, 73, 100, 97, 20, 119, 30, 129, 60, 30, 98, 19].slice(0,navValues.length)],
                        'isFake': isFake
                    }]
                }]
            };
        })();

        //////////////////////////
        // viz/geopie
        (function() {
            var geoPieFeatures = [{ featureId: 'C21019301,NAVTEQ', name: 'New York' }, 
                             { featureId: 'C21086811,NAVTEQ', name: 'Vancouver' }, 
                             { featureId: 'C21155525,NAVTEQ', name: 'Montréal' }, 
                             { featureId: 'C21156103,NAVTEQ', name: 'Ottawa' }, 
                             { featureId: 'C21055407,NAVTEQ', name: 'Toronto' }, 
                             { featureId: 'C23039216,NAVTEQ', name: 'Rio de Janeiro' }, 
                             { featureId: 'C23380551,NAVTEQ', name: 'Санкт-Петербург' }, 
                             { featureId: 'C20337455,NAVTEQ', name: 'London' }, 
                             // { featureId: 'EM844406835,NAVTEQ', name: 'SHANGHAI' }, 
                             // { featureId: 'EM844435769,NAVTEQ', name: 'TOKYO' }, 
                             { latLong: [0, 0], name: 'Center' },
                             // { featureId: 'C21550948,NAVTEQ', name: 'Sydney' }, 
                             // { featureId: '21009408,NAVTEQ', name: 'California' }, 
                             // { featureId: '21055265,NAVTEQ', name: 'Alberta' }, 
                             // { featureId: '22832175,NAVTEQ', name: 'Lesotho' }, 
                             ];

            var geoPieValues = [];
            var geoPieInfos = [];

            for (var i = 0; i < geoPieFeatures.length; i++) {
                geoPieValues.push(geoPieFeatures[i].name);
                geoPieInfos.push({ featureId: geoPieFeatures[i].featureId, latLong: geoPieFeatures[i].latLong });
            }

            testDataSet['viz/geopie'] = {
              'analysisAxis':[{
                'index' : 1,
                'data' : [{
                  'type' : 'Dimension',
                  'name' : 'City',
                  'values' : geoPieValues,
                  'infos' : geoPieInfos
                }]}, {
                  'index' : 2,
                  'data' : [{
                      'type' : 'Dimension',
                      'name' : 'Year',
                      'values' : [2000, 2001, 2002]
                }]}],  
                'measureValuesGroup':[ {
                  'index' : 1,
                  'data' : [{
                      'type' : 'Measure',
                      'name' : 'Number of Planes',
                      'values' : [[18, 98, 30, 46, 100, 103, 102, 150, 73, 100, 97, 20, 119, 30, 129, 60, 30, 98, 19].slice(0, geoPieValues.length),
                                  [28, 58, 39, 77, 211, 118, 166, 50, 173, 130, 197, 120, 19, 230, 29, 68, 30, 90, 49].slice(0, geoPieValues.length),
                                  [30, 90, 50, 90, 200, 140, 160, 100, 200, 130, 197, 160, 80, 200, 100, 60, 30, 90, 39].slice(0, geoPieValues.length)],
                        'isFake': isFake
                  }]
              }]};
        })();

        // Multi-choropleth
        (function() {
              var navValues = [ { featureId: '21017065,NAVTEQ', name: 'Colorado' },
                                { featureId: '21009408,NAVTEQ', name: 'California' },
                                { featureId: '21010819,NAVTEQ', name: 'New York' },
                                { featureId: '21015214,NAVTEQ', name: 'Texas' },
                                { featureId: '21022302,NAVTEQ', name: 'District of Columbia' },
                                { featureId: '21014299,NAVTEQ', name: 'Massachusetts' },
                                { featureId: '21002247,NAVTEQ', name: 'Illinois' },
                                { featureId: '21023288,NAVTEQ', name: 'Florida' },
                                { featureId: '21014052,NAVTEQ', name: 'Montana' },
                                { featureId: '21001865,NAVTEQ', name: 'Washington' }, 
                                { featureId: '21001841,NAVTEQ', name: 'Oregon' }, 
                                { featureId: '21007137,NAVTEQ', name: 'Michigan' }, 
                                { featureId: '21001828,NAVTEQ', name: 'Idaho' }, 
                                { featureId: '21009401,NAVTEQ', name: 'Arizona' }, 
                                { featureId: '21020362,NAVTEQ', name: 'Tennessee' } 
                                ];

              var values = [];
              var infos = [];
              var measures = [], min = 18, max = 150, v;

              $.each(navValues, function(i, v) {
                values.push(v.name);
                infos.push({ featureId : v.featureId });
                
                var measure = [];
                for (var i = 0; i < 6; i++) {
                  v = Math.round(Math.random() * max);
                  measure.push((v > min) ? v : min);
                }
                measures.push(measure);
            });
              
            testDataSet['viz/multi_choropleth'] = {
                'analysisAxis' : [
                    {
                      'index' : 1,
                      'data' : [
                          {
                            'type' : 'Dimension',
                            'name' : 'Product',
                            'values' : [ 'Car', 'Car', 'Truck', 'Truck', 'Motorcycle', 'Motorcycle']
                          },
                          {
                            'type' : 'Dimension',
                            'name' : 'Year',
                            'values' : [ '2001', '2002', '2001', '2002', '2001', '2002']
                          } ]
                    }, {
                      'index' : 2,
                      'data' : [ {
                        'type' : 'Dimension',
                        'name' : 'City',
                        'values' : values,
                        'infos' : infos
                      }]
                    } ],
                'measureValuesGroup' : [ {
                      'index' : 1,
                      'data' : [ {
                        'type' : 'Measure',
                        'name' : 'Number of Planes',
                        'values' : measures,
                        'isFake': isFake
                      } ]
                    } ]
                };
        })(); 

        // multi-geobubble
        (function() {
              var navValues = [ {
                featureId : 'C21019301,NAVTEQ',
                name : 'New York'
              }, {
                featureId : 'C21086811,NAVTEQ',
                name : 'Vancouver'
              }, {
                featureId : 'C21155525,NAVTEQ',
                name : 'Montréal'
              }, {
                featureId : 'C21156103,NAVTEQ',
                name : 'Ottawa'
              }, {
                featureId : 'C21055407,NAVTEQ',
                name : 'Toronto'
              }, {
                featureId : 'C23039216,NAVTEQ',
                name : 'Rio de Janeiro'
              }, {
                featureId : 'C23380551,NAVTEQ',
                name : 'Санкт-Петербург'
              }, {
                featureId : 'C20337455,NAVTEQ',
                name : 'London'
              }, {
                latLong : [ 0, 0 ],
                name : 'Center'
              } ];

              var values = [];
              var infos = [];

              var measures = [], min = 18, max = 150, v;

              $.each(navValues, function(i, v) {
                values.push(v.name);
                infos.push({ featureId: navValues[i].featureId, latLong: navValues[i].latLong });
                
                var measure = [];
                for (var i = 0; i < 6; i++) {
                  v = Math.round(Math.random() * max);
                  measure.push((v > min) ? v : min);
                }
                measures.push(measure);
            });

            testDataSet['viz/multi_geobubble'] = {
                'analysisAxis' : [
                    {
                      'index' : 1,
                      'data' : [
                          {
                            'type' : 'Dimension',
                            'name' : 'Product',
                            'values' : [ 'Car', 'Car', 'Truck', 'Truck', 'Motorcycle', 'Motorcycle']
                          },
                          {
                            'type' : 'Dimension',
                            'name' : 'Year',
                            'values' : [ '2001', '2002', '2001', '2002', '2001', '2002']
                          } ]
                    }, {
                      'index' : 2,
                      'data' : [ {
                        'type' : 'Dimension',
                        'name' : 'City',
                        'values' : values,
                        'infos' : infos
                      }]
                    } ],
                'measureValuesGroup' : [ {
                  'index' : 1,
                  'data' : [ {
                    'type' : 'Measure',
                    'name' : 'Number of Planes',
                    'values' : measures,
                    'isFake': isFake
                  } ]
                } ]
              };
        })();
//by yuanhao , maybe we need some special chartoption for some chart.
    var chartOptions = {};
    var chartOption = {};
    //for all chart
    chartOptions['default'] = {
        multiLayout: {
          'numberOfDimensionsInColumn': 1
        },
        plotArea:{
            isRoundCorner: true
        },            
        title: {
          visible: true,
            text: 'Chart Title'
        },
     };
     //for mekko chart
    chartOptions['viz/horizontal_mekko'] = chartOptions['viz/100_horizontal_mekko']={
       multiLayout: {
          'numberOfDimensionsInColumn': 1
        },
        plotArea:{
            isRoundCorner: true
        },            
        title: {
          visible: true,
            text: 'Chart Title'
        },
        xAxis: {
            title: {
                visible: true
            }
        },
        yAxis2: {
            title: {
                visible: true
            }
        },
        yAxis: {
            title: {
                visible: true
            }
        }
    };
    chartOptions['viz/100_mekko']= chartOptions['viz/mekko']= {
        multiLayout: {
          'numberOfDimensionsInColumn': 1
        },
        plotArea:{
            isRoundCorner: true
        },            
        title: {
          visible: true,
            text: 'Chart Title'
        },
        xAxis: {
            title: {
                visible: true
            }
        },
        xAxis2: {
            title: {
                visible: true
            }
        },
        yAxis: {
            title: {
                visible: true
            }
        }
    };
    chartOption = chartOptions['default'];
     /*
         * currently it's disabled in the page.
         */
        var randomPalette = [['#756E48', '#A37B5B', '#E0776E', '#ED9164', '#FFAD51'],
                             ['#022601','#467302', '#72A603', '#ABD904', '#EAF205'],
                             ['#3D0E2E', '#8C6B56', '#E0B579', '#F5E194', '#FFF89D'],
                             ['#7F6265', '#FFA256', '#F7DD77', '#E0D054', '#ABA73C']];
        var randomPaletteIdx = 0;
        var randomPaletteLen = randomPalette.length;
        (function(){
          $('#switchCP').click(function(){
            var propCat = Manifest.viz.get(currentChartId).getChartPropCate();
            var currentProps = chartOption[propCat];
            if(!currentProps) currentProps = {};
            //add color palette to it
            currentProps['primaryValuesColorPalette'] = randomPalette[randomPaletteIdx++ % randomPaletteLen];
            //for pie like chart
            currentProps['colorPalette'] = currentProps['primaryValuesColorPalette'];
            chartInstance.properties(chartOption);
          });
        })();
        
        /*
         * currently it's disabled in the page.
         */
        
        function getRandomNumber (min, max) {
          return parseFloat((Math.random() * (max - min + 1)).toFixed(2)) + min;
        }
        
        function random2dimensionArray(arrData){
          var a1;
          for(var i = 0, len = arrData.length; i < len; i++){
            a1 = arrData[i];
            for(var j = 0, jlen = a1.length; j < jlen; j++){
              a1[j] = getRandomNumber (1, 1000); 
            }
          }
        }
        
        function randomData(currentData){
          var dataA1,dataA2,dataV;
          for(var i = 0, len = currentData.length; i < len; i++){
            dataA1 = currentData[i].data;
            for(var j = 0, jlen = dataA1.length; j < jlen; j++){
              dataA2 = dataA1[j].values;
              random2dimensionArray(dataA2);
            }
          }
        }
        
        (function(){
          $('#randomData').click(function(){
            var currentData = testDataSet[currentChartId]['measureValuesGroup'];
            randomData(currentData);
            dsInstance.setData(testDataSet[currentChartId]);
            chartInstance.data(dsInstance);
          });
        })();
        
        (function(){
          $('#modeChooser>li').click(function(e){
            var currentMode = $(e.target).parent().find("li.selected").removeClass('selected').html().toLowerCase();
            var mode = $(e.target).addClass("selected").html().toLowerCase();
            if(currentMode === mode)
                return;
            chartOption.plotArea.mode = mode;
            chartInstance.properties(chartOption);
          })     
        })()

        function findFeeds (feeds, type){
          var feed, ret = [];
          for(var i = 0, len = feeds.length; i < len; i++){
            feed = feeds[i];
            if(feed.type == type){
              ret.push(feed);
            } 
          }
          return ret;
        }
                        
        (function(){
          $('#randomSchema').click(function(){
            //TODO we are not generating random data based on feed!
            var feeds = Manifest.viz.get(currentChartId).allFeeds();
            var currentMData = testDataSet[currentChartId]['measureValuesGroup'];
            var currentDData = testDataSet[currentChartId]['analysisAxis'];
            var randomP = {
              hierarchy : true,
              range : 10000
            };
            var mfeeds = findFeeds (feeds, 'Measure');
            var dfeeds = findFeeds (feeds, 'Dimension');
            var feed;
            var maxStackedDims;
            for(var i = 0, len = mfeeds.length; i < len; i++){
              feed = mfeeds[i];
              if(feed.max > 0){
                var max = (feed.max === Infinity ? 5 : feed.max);
                var fnumber = Math.floor(getRandomNumber(feed.min, max));
                if(fnumber > 0){
                  randomP['mv' + feed.mgIndex] = fnumber;
                }  
              }
            }
            
            for(var i = 0, len = dfeeds.length; i < len; i++){
              feed = dfeeds[i];
              maxStackedDims = (feed.maxStackedDims == undefined)? 5 : feed.maxStackedDims;
              if(feed.max > 0){
              //if(range.min === 0 && Math.random() > 0.5){
                //TODO we have chance to include MND here, 50%
                //but hanads currently don't support MND
              //}else{
                randomP['aa' + feed.aaIndex] = Math.floor(getRandomNumber(1, maxStackedDims));
                randomP['aa' + feed.aaIndex + 'Count'] = Math.floor(getRandomNumber(1, 10));
              //}
              }
            }
            
            //get new random data from HANA service
            //aa1=3&aa1Count=5&aa2=1&aa2Count=8&mv1=1
            $.getJSON("http://shgtgvmwin007.dhcp.pgdev.sap.corp:8800/datagen?jsoncallback=?", randomP,

            function (data) {
                testDataSet[currentChartId] = data;
                dsInstance.setData(testDataSet[currentChartId]);
                chartInstance.data(dsInstance);
            });
          });
        })();
    function getItemFromArray(dataArray, idx){
      var ret = [];
      for(var k = 0, klen = dataArray.length; k < klen; k++){
        var item = dataArray[k];
        ret.push(item.values[idx]);       
      }
      return ret;
    }
     var currentChartId;
     var chartInstance;
    var dsInstance;

     function setChartOption(chartId, chartOption) {
                

                var title = chartOption.title;
                if (!title)
                    return;
                switch (chartId) {
                    case 'viz/bar':           
                        title.text = 'Profit and Revenue by Country, Year and Product';
                        break;
                    case 'viz/dual_bar':           
                        title.text = 'Profit and Revenue by Country, Year and Product';
                        break;
                    case 'viz/column':           
                        title.text = 'Profit, Revenue and Tax by Products, Country and Year';
                        break;
                    case 'viz/dual_column':           
                        title.text = 'Profit, Revenue and Tax by Products, Country and Year';
                        break;
                    case 'viz/stacked_bar':
                        title.text = 'Profit and Revenue by Country, Year and Product';
                        break;
                    case 'viz/100_stacked_bar':
                        title.text = 'Profit and Revenue by Country, Year and Product';
                        break;
                    case 'viz/stacked_column':
                        title.text = 'Profit and Revenue by Country, Year and Product';
                        break;
                    case 'viz/100_stacked_column':
                        title.text = 'Profit and Revenue by Country, Year and Product';
                        break;
                    case 'viz/line':
                        title.text = 'Profit and Revenue by Product, Country and Year';
                        break;
                    case 'viz/dual_line':
                        title.text = 'Profit and Revenue by Product, Country and Year';
                        break;
                    case 'viz/horizontal_line':
                        title.text = 'Profit and Revenue by Product, Country and Year';
                        break;
                    case 'viz/dual_horizontal_line':
                        title.text = 'Profit and Revenue by Product, Country and Year';
                        break;
                    case 'viz/pie':
                        title.text = 'Profit by Country and Year';
                        break;
                    case 'viz/donut':
                        title.text = 'Profit by Country and Year';
                        break;
                    case 'viz/sparkline':
                        title.text = 'Price by Region, Share index and Month';
                        break;
                    case 'viz/bubble':
                        title.text = 'Revenue, Number of Countries and Planes by Region';
                        break;
                    case 'viz/scatter':
                        title.text = 'Discount and Full-load of Country';
                        break;
                    case 'viz/radar' :
                        title.text = "Boeing 777 Sample Flights";
                        break;
                    case 'riv/cbar':
                        title.text = 'Revenue and Profit by Country';
                        break;
                    case 'viz/heatmap':
                        title.text = 'HeatMap M - N';
                        break;
                    case 'viz/treemap':
                        title.text = 'Margin and Volume by Country and Year';
                        break;
                    case 'viz/ext/pa/pc':
                        title.text = 'Sample Parallel Coordinates Chart Title';
                        break;
                    case 'viz/horizontal_mekko':
                        title.text = 'Margin and Volume by Country and Product';                       
                        break;
                    case 'viz/100_horizontal_mekko':
                        title.text = 'Margin and Volume by Country and Product';                       
                        break;
                    case 'viz/mekko':
                        title.text = 'Margin and Volume by Country and Product';                       
                        break;
                    case 'viz/100_mekko':
                        title.text = 'Margin and Volume by Country and Product';                       
                        break;
                    case 'viz/horizontal_stacked_waterfall':
                    case 'viz/stacked_waterfall':
                        title.text = 'Margin by Year and Quarter';
                        break;
                    case 'viz/horizontal_waterfall':
                    case 'viz/waterfall':
                        title.text = 'Revenue by Category';
                        break;
                    default:
                        title.text = 'Chart Title';
                }
            }
     function chooseChartOption(chartId){
            chartOption = chartOptions[chartId];
            if(chartOption == null || chartOption == undefined){
                chartOption = chartOptions['default'];
            }
            setChartOption(chartId,chartOption);
     }
     function chartChange(chartId) {
            var resizable = $('.ui-resizable-handle', $('#chart')).detach();
              $('div', $('#chart')).remove();
              
                    $('#eventData').val('');
                    $('#originalData').val('');
                    $('#deselectEventData').val('');
                    $('#deselectOriginalData').val('');
                    
                    dsInstance = new CrosstableDataset();
                    dsInstance.setData(testDataSet[chartId]);
                    
              chooseChartOption(chartId,chartOptions);
              if(chartInstance){
                vizcore.destroyViz(chartInstance); //or chartInstance.destroy();        
                chartInstance = null;
              }
              
              chartInstance = vizcore.createViz({
                type : chartId,
                data : dsInstance,
                container : $('#chart'),
                options : chartOption,
                dataFeeding : testDataFeeding[chartId]
              });
              currentChartId = chartId
              $('#chart').append(resizable);
              function showEventData(evt){
                
                /**
                 * {
                 'type' : 'Dimension' | 'Measure',
                 // for Dimension
                 'path': {
                 aa:
                 di:
                 dii:
                 }

                 // for Measure
                 'path':{
                 mg:
                 mi:
                 dii_a1:
                 dii_a2:
                 };

                 }
                 */
                
                 //convert dom elments to string 'dom element''
                 for(var i =0, len = evt.data.length; i < len; i++){
                     evt.data[i].target = 'Dom element'; 
                 }
                 $("#event_panel").data("eventDataCode").setValue(js_beautify(JSON.stringify(evt)));
                //$('#eventData').val(js_beautify(JSON.stringify(evt)));
                var res = "";
                //try to get original data
                //originalData
                var edata = evt.data, type, rowdata = [];
                
                for(var i =0, len = edata.length; i < len; i++){
                    for(var j =0, jlen = edata[i].data.length; j< jlen; j++){
                        rowdata.push(edata[i].data[j]);
                    }
                }
                
                for(var j =0; j< rowdata.length; j++){
                  if(rowdata[j] == null || rowdata[j].ctx == null)
                    continue;
                  type = rowdata[j].ctx.type;
                  if (type === 'Measure'){
                    var path = rowdata[j].ctx.path;
                    var chartId = currentChartId;
                    var data = testDataSet[chartId];
                    var result = {};
                    
                    var idx;
                    var dataItem;
                    var dimensionData = data.analysisAxis;
                    var measureData = data.measureValuesGroup;
                    //get dimension data
                    for(var i = 0, len = dimensionData.length; i < len; i++){
                      dataItem = dimensionData[i];
                      if(dataItem.index == 1){
                        idx = path.dii_a1;
                        result.dii_a1 = getItemFromArray(dataItem.data, idx).join('/');
                      }else if(dataItem.index == 2){
                        idx = path.dii_a2;
                        result.dii_a2 = getItemFromArray(dataItem.data, idx).join('/');
                      }
                    }
                    
                    for(var i = 0, len = measureData.length; i < len; i++){
                      dataItem = measureData[i];
                      if(dataItem.index === (path.mg + 1)){
                        var item = dataItem.data[path.mi];
                        result.m = item.name;
                      }
                    }
                        
                    res += (result.dii_a2 == null ? "":result.dii_a2 + '/') + result.dii_a1 + '/' + result.m + '\r';
                  }else if (type === 'Dimension'){
                    
                  }
                  
                }
                $("#event_panel").data("eventDataPoint").setValue(res);
                //$('#originalData').val(res);
                
              }
              chartInstance.on('selectData', function(e){showEventData(e)});
              function showDeselectedEventData(evt){
                
                /**
                 * {
                 'type' : 'Dimension' | 'Measure',
                 // for Dimension
                 'path': {
                 aa:
                 di:
                 dii:
                 }

                 // for Measure
                 'path':{
                 mg:
                 mi:
                 dii_a1:
                 dii_a2:
                 };

                 }
                 */

                //convert dom elments to string 'dom element''
                  for(var i =0, len = evt.data.length; i < len; i++){
                     evt.data[i].target = 'Dom element'; 
                  }
                 $("#event_panel").data('deselectEventDataCode').setValue(js_beautify(JSON.stringify(evt)));
                //$('#deselectEventData').val(js_beautify(JSON.stringify(evt)));
                var res = "";
                //try to get original data
                //originalData
                var edata = evt.data, type, rowdata = [];
                
                for(var i =0, len = edata.length; i < len; i++){
                    for(var j =0, jlen = edata[i].data.length; j< jlen; j++){
                        rowdata.push(edata[i].data[j]);
                    }
                }
                
                for(var j =0; j< rowdata.length; j++){
                  if(rowdata[j] == null || rowdata[j].ctx == null)
                    continue;
                  type = rowdata[j].ctx.type;
                  if (type === 'Measure'){
                    var path = rowdata[j].ctx.path;
                    var chartId = currentChartId;
                    var data = testDataSet[chartId];
                    var result = {};
                    
                    var idx;
                    var dataItem;
                    var dimensionData = data.analysisAxis;
                    var measureData = data.measureValuesGroup;
                    //get dimension data
                    for(var i = 0, len = dimensionData.length; i < len; i++){
                      dataItem = dimensionData[i];
                      if(dataItem.index == 1){
                        idx = path.dii_a1;
                        result.dii_a1 = getItemFromArray(dataItem.data, idx).join('/');
                      }else if(dataItem.index == 2){
                        idx = path.dii_a2;
                        result.dii_a2 = getItemFromArray(dataItem.data, idx).join('/');
                      }
                    }
                    
                    for(var i = 0, len = measureData.length; i < len; i++){
                      dataItem = measureData[i];
                      if(dataItem.index === (path.mg + 1)){
                        var item = dataItem.data[path.mi];
                        result.m = item.name;
                      }
                    }
                    
                    res += (result.dii_a2 == null ? "":result.dii_a2 + '/') + result.dii_a1 + '/' + result.m + '\r';
                    
                  }else if (type === 'Dimension'){
                    
                  }
                }
                
                $('#deselectOriginalData').val(res);
                
              }
              chartInstance.on('deselectData', function(e){showEventData(e)});

        }
        $('#chart').bind('resizestop', function(event, ui){
        if (chartInstance) {
          chartInstance.size({
            'width' : $('#chart').width(),
            'height' : $('#chart').height()
          });       
        }
      });

        $("#chart").data("drawChart",chartChange);
});;;