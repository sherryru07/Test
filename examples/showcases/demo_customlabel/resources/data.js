var data = {
            'analysisAxis': [{
                'index': 1,
                'data': [{                   
                        'name': 'Product',
                        'values': ['Car', 'Truck', 'Motorcycle', 'Bicycle'],
                        'infos' : [{
                          'customlabel': {
                            'type' : 'string',
                            'val' : 'CAR'
                          }
                        }, {
                          'customlabel': {
                            'type' : 'string',
                            'val' : 'TRUCK'
                          }
                        }, , {
                          'customlabel': {
                            'type' : 'string',
                            'val' : 'BICYCLE'
                          }
                        }]
                    }]
              }, {
              'index' : 2,
                'data': [{                        
                        'name': 'Country',
                        'values': ['China', 'usa'],
                        'infos' : [{
                          'customlabel': {
                            'type' : 'string',
                            'val' : 'CHINA'
                          }
                        }, undefined]
                    }, {                        
                        'name': 'Year',
                        'values': ['2001', '2001']
                    }]
            }], 
            'measureValuesGroup': [{
                'index': 1,
                'data': [{                        
                        'name': 'Profit',
                        'values': [[25, 136, 23, 116], [58, 128, 43, 73]]
                    }, {                        
                        'name': 'Revenue',
                        'values': [[50, 236, 43, 126], [158, 228, 143, 183]]
                    }]
}]};

var piedata = {
            'analysisAxis':[{
              'index' :  1,
                'data': [{                        
                        'name': 'Country',
                        'values': ['China', 'China', 'USA', 'USA', 'Canada', 'Canada']
                    }, {                        
                        'name': 'Year',
                        'values': ['2001', '2002', '2001', '2002', '2001', '2002']
                    }]
            }], 
      'measureValuesGroup':[{
                'index' : 1,
                'data': [{                        
                        'name': 'Profit',
                        'values': [[25, 58, 58, 159, 149, 38]]
                    }]
            }]};
            
var boxplotdata = { 
           'analysisAxis': [
            {
                'index': 1,
                'data' : [ 
                {
                                
                                'name' : 'Country',
                                'values' : ['China','China', 'China','USA', 'USA', 'USA', 'USA', 'Canada','Canada', 'Canada']
                },  {
                                
                                'name' : 'Year',
                                'values' : ['2011','2011', '2011','2011', '2012','2012', '2012', '2011', '2011', '2011']
                } , { 
                                
                                'name' : 'Month',
                                'values' : ['1','1', '1','5', '8','8', '8', '10', '10', '10']
                } 
                    ]
            }, {
                'index': 2,
                'data': [{
                                
                                'name' : 'Products',
                                'values' : ['Car', 'Truck']
                }
      ]
            }], 
            'measureValuesGroup': [{
                'index': 1,
               'data' :[{
                                
                                'name' : 'Profit',
                                'values' : [[25, 136, 58, 128, 58, 24, 33, 45, 78, 60], [159, 147, 149, 269, 38, 97, 102, 110, 120, 88]]
                },
        {
                                
                                'name' : 'Revenue',
                                'values' : [[55, 126, 58, 128, 58, 24, 25, 38, 68, 48], [109, 147, 149, 249, 38, 97, 78, 38, 28, 101]]
                }]
            }]};
            
var waterfalldata = {
            'analysisAxis': [{
        
            'index' : 1,
            'data' : [{
                
                'name' : 'Category',
                'values' : ['Net Revenue', 'Production Cost', 'Selling Cost', 'Marketing', 'Order Processing', 'Distribution', 'Warranty'
                                    ,'General Admin','Sustainability','Vendor Process']
            }]
        }], 
        'measureValuesGroup':[{
            'index' : 1,
            'data' : [{
                
                'name' : 'Revenue',
                'values' : [[52000,-12000,-6400,-5000,-2000,-7000,-5200,-2400,-1400,-1000]]
            }]
        }]};
        
var heatmapdata = {
      'analysisAxis': [{
    
      'index' : 1,
      'data' : [{
        
        'name' : 'Country',
        'values' : ['China', 'China', 'China', 'USA', 'USA', 'USA', 'France', 'France', 'France', 'Canada', 'Canada', 'Canada', 'Japan', 'Japan', "Japan", ]
      },{
        
        'name' : 'Year',
        'values' : ['2007', '2006', "2009", '2007', '2006', "2009", '2007', '2006', "2009", '2007', '2006', "2009", '2007', '2006', "2009", ]
      }]
    },
        {
                'index': 2,
                'data': [{
        
        'name' : 'PC',
        'values' : ['Profit', 'Profit', 'Profit', 'Profit', 'Profit', 'Profit', 'Profit', 'Profit', 'Profit', 'Profit', 'Profit', 'Profit',  
                            'Cost', 'Cost', 'Cost', 'Cost', 'Cost', 'Cost', 'Cost', 'Cost', 'Cost', 'Cost', 'Cost', 'Cost', 
                           
                           ]
      },{
        
        'name' : 'Product',
        'values' : ['Car', 'Trunk', "Bike", 'Car', 'Trunk', "Bike", 'Car', 'Trunk', "Bike", 'Car', 'Trunk', "Bike", 'Car', 'Trunk', "Bike", 'Car', 'Trunk', "Bike", 'Car', 'Trunk', "Bike", 'Car', 'Trunk', "Bike", ]
      }]
            }                    
                ], 
                'measureValuesGroup': [{
                        'index': 1,
                        'data': [{
                                
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
                    
  
var treemapdata = {
      'analysisAxis': [{
    
          'index' : 1,
          'data' : [{
            
            'name' : 'Continent',
            'values' : ['Asia','Asia','Asia','Asia','Asia','Asia','Europe','Europe','Europe','Europe','Europe','Europe','America','America','America','America','America','America']
          },{
            
            'name' : 'Country',
            'values' : ['China','China','China','Japan','Japan','Japan','France','France','France','Germany','Germany','Germany','Canada','Canada','Canada','USA','USA','USA']
          },{
            
            'name' : 'Year',
            'values' : ['2011','2010','2009','2011','2010','2009','2011','2010','2009','2011','2010','2009','2011','2010','2009','2011','2010','2009']
          }]
        }], 
      'measureValuesGroup': [{
              'index': 1,
              'data': [{
                      
                      'name': 'Margin',
                      'values': [[23,15,12,4,2,2,10,5,5,14,8,6,9,5,5,25,12,12]]
                  }]
          },{
              'index': 2,
              'data': [{
                      
                      'name': 'Volume',
                      'values': [[11000,6800,4300,1520,790,710,4120,2070,1720,6210,3570,2220,3610,2100,1580,12752,7978,4651]]
                  }]
          }
        ]
      };

    
var radardata =  {
          analysisAxis : [{
            index : 1,
            data : [{
              
              name : "Model",
              values : [ "777-200", "777-200ER", "777-200LR", "777 Freighter", "777-300", "777-300ER" ]
            }]
          }, {
            index : 2,
            data : [{
              
              name : "Route",
              values : [ "VHHH-ZBAA", "ZSPD-KLAX", "KSFO-CYVR", "KJFK-EGLL" ]
            }, {
              
              name : "Year",
              values : [ "2007", "2010", "2007", "2010" ]
            }]
          }],
          
          measureValuesGroup : [{
            index : 1,
            data : [{
              
              name : "Fuel-burn",
              values : [ [ 590000, 670000, 300000, 480000, 240500, 380000 ], 
                         [ 210000, 310000, 315000, 410000, 370000, 613000 ], 
                         [ 270000, 520000, 325000, 420000, 520000, 720000 ], 
                         [ 240000, 130000, 330000, 430000, 530000, 630000 ] ]
            }, {
              
              name : "Pax/cargo",
              values : [ [ 195000, 185000, 476000, 169800, 130000, 178000 ], 
                         [ 135000, 150000, 146000, 669800, 130000, 178000 ], 
                         [ 135000, 150000, 146000, 159800, 130000, 178000 ], 
                         [ 145000, 156000, 166000, 166800, 160000, 197500 ] ]
            }]
          }]
        };