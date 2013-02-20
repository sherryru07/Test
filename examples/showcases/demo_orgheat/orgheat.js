$(function() {
	var orgheatFn = function() {
		var data, // data
		width = undefined,
		// chart width
		height = undefined,
		// chart height
		id = Math.floor(Math.random() * 10000),
		// shape palette for legend
		properties = {};
		
		var rootData, colorBinding, sizeBinding, txtBinding, colorScale, sizeScale , txtScale;
		var eDispatch = new sap.viz.modules.dispatch( 'showTooltip', 'hideTooltip');		
		var vis , diagonal , m , w, h, root , tree;
		var squareHieght = 30;
		
		function chart(selection) {
			selection.each(function() {		
				m = [20, 20, 20, 120];
				w = width - m[1] - m[3];
				h = height - m[0] - m[2];
				i = 0 ;
				tree = d3.layout.tree().size([h, w]);
				vis = d3.select(this).append("svg:g").attr("transform", "translate(" + m[3] + "," + m[0] + ")");								
				caculateScale();
				diagonal = d3.svg.diagonal().projection(function(d) {
					return [d.y, d.x];
				});				
				root = rootData;
				root.x0 = h / 2;
				root.y0 = 0;
				function toggleAll(d) {
					if (d.children) {
						d.children.forEach(toggleAll);
						toggle(d);
					}
				}
				update(root);				
			});
			return chart;
		}
		
		// Toggle children.
		function toggle(d) {
			if (d.children) {
				d._children = d.children;
				d.children = null;
			} else {
				d.children = d._children;
				d._children = null;
			}
		}
		
		function update(source) {
			var duration = d3.event && d3.event.altKey ? 5000 : 500;

			// Compute the new tree layout.
			var nodes = tree.nodes(root).reverse();

			// Normalize for fixed-depth.
			nodes.forEach(function(d) {
				d.y = d.depth * 180;
			});

			// Update the nodes¡­
			var node = vis.selectAll("g.node").data(nodes, function(d) {
				return d.id || (d.id = ++i);
			});

			// Enter any new nodes at the parent's previous position.
			var nodeEnter = node.enter().append("svg:g").attr("class", "node").attr("transform", function(d) {
				return "translate(" + source.y0 + "," + source.x0 + ")";
			}).on("click", function(d) {
				toggle(d);
				update(d);
			});
			
			if( properties.shape === "circle") {
				nodeEnter.append("svg:circle")
				.attr("r", function(d) {return sizeScale(d[sizeBinding])/2;})
				.style("stroke", "#D3D3D3")
				.style("fill", function(d){return colorScale(d[colorBinding])})
				.on("mouseover", function(d) {
					hover(d);
				}).on("mouseout", function(d) {
					eDispatch.hideTooltip();
					$(".highlight").remove();
				});
				nodeEnter.append("svg:text").attr("x",function(d) { return 20 + sizeScale(d[sizeBinding])/2 * Math.sin(Math.PI/4); })
				.attr("y",function(d) { return 20 + sizeScale(d[sizeBinding])/2 * Math.sin(Math.PI/4); })
				.text(function(d) {
					return d.name;
				}).style("fill-opacity", 1e-6);
				
				//Add Node Image
				nodeEnter.append("image").attr("width","20").attr("height","20")
				.attr("x",function(d) { return sizeScale(d[sizeBinding])/2 * Math.sin(Math.PI/4); })
				.attr("y",function(d) { return sizeScale(d[sizeBinding])/2 * Math.sin(Math.PI/4); })
				.attr("xlink:href",function(d) {
					return d._children ? "resources/heads.png" : "resources/head.png";
				}).style("fill-opacity", 1e-6);
			} else if ( properties.shape === "square" ) {
				nodeEnter.append("svg:rect")
				.attr("width", function(d) {return sizeScale(d[sizeBinding])/2;})
				.attr("height", squareHieght)
				.attr("y", -squareHieght/2)
				.style("stroke", "#D3D3D3")
				.style("fill", function(d){return colorScale(d[colorBinding])})
				.on("mouseover", function(d) {
					hover(d);
				}).on("mouseout", function(d) {
					eDispatch.hideTooltip();
					$(".highlight").remove();
				});	
				nodeEnter.append("svg:text").attr("x",squareHieght)
				.attr("y",squareHieght/2)
				.text(function(d) {
					return d.name;
				}).style("fill-opacity", 1e-6);
				
				//Add Node Image
				nodeEnter.append("image").attr("width","20").attr("height","20")
				.attr("x",squareHieght)
				.attr("y",squareHieght/2)
				.attr("xlink:href",function(d) {
					return d._children ? "resources/heads.png" : "resources/head.png";
				}).style("fill-opacity", 1e-6);			
			}			
			//Fill in Node with Dot Here
			nodeEnter.each ( function (d,i) {
				var tNode = d3.select(this);
				var dotNumber = txtScale(d[txtBinding]);						
				if( dotNumber != 0 ) {
					//tNode.append("svg:text").text(Math.round(dotNumber) + "%");
				}
			});
			
			// Transition nodes to their new position.
			var nodeUpdate = node.transition().duration(duration).attr("transform", function(d) {
				return "translate(" + d.y + "," + d.x + ")";
			});

			nodeUpdate.select("circle").attr("r", function(d) {return sizeScale(d[sizeBinding])/2;})
			.style("stroke", "#D3D3D3")
			.style("fill", function(d){return colorScale(d[colorBinding])});
			
			nodeUpdate.select("image").attr("width","20").attr("height","20").attr("xlink:href",function(d) {
				return d._children ? "resources/heads.png" : "resources/head.png";
			});

			nodeUpdate.select("text").style("fill-opacity", 1);

			// Transition exiting nodes to the parent's new position.
			var nodeExit = node.exit().transition().duration(duration).attr("transform", function(d) {
				return "translate(" + source.y + "," + source.x + ")";
			}).remove();

			nodeExit.select("circle").attr("r", 1e-6);

			nodeExit.select("text").style("fill-opacity", 1e-6);

			// Update the links¡­
			var link = vis.selectAll("path.link").data(tree.links(nodes), function(d) {
				return d.target.id;
			});

			// Enter any new links at the parent's previous position.
			link.enter().insert("svg:path", "g").attr("class", "link").attr("d", function(d) {
				var o = {
					x : source.x0,
					y : source.y0
				};
				return diagonal({
					source : o,
					target : o
				});
			}).transition().duration(duration).attr("d", diagonal);

			// Transition links to their new position.
			link.transition().duration(duration).attr("d", diagonal);

			// Transition exiting nodes to the parent's new position.
			link.exit().transition().duration(duration).attr("d", function(d) {
				var o = {
					x : source.x,
					y : source.y
				};
				return diagonal({
					source : o,
					target : o
				});
			}).remove();

			// Stash the old positions for transition.
			nodes.forEach(function(d) {
				d.x0 = d.x;
				d.y0 = d.y;
			});
		}
		
		function hover(d) {
			var tooltipData = {};
			var content = {};
			content.name = d.name;
			content.val = [];
			var measureNames = getMeasureNames();
			for ( var i = 0; i < measureNames.length ; i ++ ) {
				var obj = {};
				obj.label = measureNames[i];
				obj.value = d[measureNames[i]];
				content.val.push(obj);
			}
			
			tooltipData.body = [content];
			
			tooltipData.footer = [];
			tooltipData.point = {
				x : d.y + m[1] + m[3] + 20,
				y : d.x + m[0]
			};
			tooltipData.plotArea = {
				x : 0,
				y : 0,
				width : width,
				height : height
			};
	    var eventData = {
	        name: "showTooltip",
	        data: tooltipData
	    };
			eDispatch.showTooltip(eventData);
			showMeInParents(d, d[txtBinding]);
		}
		
		
		function showMeInParents(data, value) {
			//console.log(d);
			if( data.parent ) {
				var node = findNodeByName ( data.parent.name);
				if( node ) {
					drawPercent(node, value);	
					var pData = node.data()[0];
					showMeInParents(pData, value);
				}
			}
		}
		
		function drawPercent(node, p) {
			//console.log("draw " + node.data()[0].name + ":" + p);
			
			if( properties.shape === "circle") {
				var circleNode = node.selectAll("circle");
				if(txtBinding) { 
					var total = node.data()[0][txtBinding];
					var arc = d3.svg.arc();
					arc.innerRadius(0);
					arc.outerRadius(circleNode.attr("r"));
					arc.startAngle(0);
					arc.endAngle(0);
					node.append("path")
						.attr("class","highlight")
						.attr("d", arc)
						.attr("fill","orange")
						.style("fill-opacity", 0.8)
						.transition()
						.attr("d",arc.endAngle(p * 2 * Math.PI / total));
					node.append("svg:text").attr("class","highlight").text( (p/total).toFixed(2) * 100 + "%");
				}
			} else if( properties.shape === "square") {
				var rectNode = node.selectAll("rect");
				if(txtBinding) { 
					var total = node.data()[0][txtBinding];
					node.append("rect")
						.attr("width", 0  )
						.attr("height", squareHieght)
						.attr("class","highlight")
						.style("fill-opacity", 0.8)
						.attr("y", -squareHieght/2)
						.style("stroke", "#D3D3D3")
						.style("fill", "orange")
						.transition()
						.attr("width", p * parseInt(rectNode.attr("width")) / total  );
					node.append("svg:text").attr("class","highlight").text( (p/total).toFixed(2) * 100  + "%");
				}
			}
		}

		
		function findNodeByName(name) {
			var node = vis.selectAll("g.node");
			var result ;
			node.each(function(d,i) {
				if(d.name === name) {
					result = d3.select(this);
				}
			});
			return result;
		}
		
		function getMeasureNames() {
			var result = [];
			var measureValues = data.getMeasureValuesGroupDataByIdx(0);
			
			for (var i = 0; i < measureValues.values.length ; i ++ ) {
				result.push(measureValues.values[i].col);
			}
			return result;
		}
		
		function buildRootData( root, measures ) {
			for ( var i = 0; i < measures.length ; i ++ ) {
				for ( var j = 0; j < root.children.length ; j ++) {
					if( root[measures[i]] === undefined) {
						root[measures[i]] = 0;
					}
					root[measures[i]] = root[measures[i]] + root.children[j][measures[i]];
				}
			}			
		}
		
		function caculateScale() {
			rootData = table2tree(data);
			var measureNames = getMeasureNames();
			buildRootData(rootData, measureNames);
			
			if (measureNames.indexOf(properties.binding.color) !== -1 ) {
				colorBinding = properties.binding.color;
				colorScale = d3.scale.linear().domain([0, rootData[colorBinding]]).range(["white", "green"]);
			} else {
				colorScale = function (value) {
					return "white ";
				}
			}
			
			if (measureNames.indexOf(properties.binding.size) !== -1 ) {
				sizeBinding = properties.binding.size;
				//sizeScale = d3.scale.linear().domain([0, rootData[sizeBinding]]).range([0, 1000]);
				if( properties.shape === "circle" ) {
					sizeScale = bubbleSizeScale(rootData[sizeBinding]);
				} else {
					sizeScale =  d3.scale.linear().domain([0, rootData[sizeBinding]]).range([0, 300]);
				}
			} else {
				sizeScale = function (value) {
					return 40;
				}
			}
			
			if (measureNames.indexOf(properties.binding.text) !== -1 ) {
				txtBinding = properties.binding.text;
				txtScale = d3.scale.linear().domain([0, rootData[txtBinding]]).range([0, 100]);
			} else {
				txtScale = function (value) {
					return 0;
				}
			}
		}
		
		function sizeData() {
			caculateScale();
			if(sizeBinding) {
				return [rootData[sizeBinding],rootData[sizeBinding]/5,0];
			} else {
				return [];
			}
        }
		
		function bubbleSizeScale(vMax, wh) {
            // even 0 value for bubble size, still render a small size shape
			//return d3.scale.linear().domain([0, 10000]).range([0, 50]);
            return function(value) {
                var r = Math.pow(Math.abs(value) / vMax, 0.5) * height / 6;
                return r > 4 ? r : 4;
            };
        }

		/**
		 * set/get width
		 */
		chart.width = function(value) {
			if(!arguments.length) {
				return width;
			}
			width = value;
			return chart;
		};
		/**
		 * set/get height
		 */
		chart.height = function(value) {
			if(!arguments.length) {
				return height;
			}
			height = value;
			return chart;
		};
		/**
		 * set/get data, for some modules like Title, it doesn't need data
		 */
		chart.data = function(value) {
			if(!arguments.length) {
				return data;
			}
			data = value;
			return chart;
		};
		
		chart.mbcLegendInfo = function(){
			caculateScale();
			//return a color scale like
			var domainRg = [] , rangeRg = [], pointer = 0 , bandNumber = 8 , band = rootData[colorBinding]/bandNumber;
			
			for ( var i = 0; i < bandNumber; i ++ ) {
				domainRg.push([ pointer, pointer + band ] );
				rangeRg.push(colorScale(pointer + band ));
				pointer = pointer + band; 
			}

            hColor = d3.scale.ordinal().domain(domainRg).range(rangeRg);
            //var hColor = buildColorScale();
            return {
                'colorScale' : hColor,
                'title': "title"
            };
        };
		
		chart.sizeLegend = function() {
	        return {	    
				bubbleScale : 1/8,
				space : 0,
				scale : bubbleSizeScale(rootData[sizeBinding]) ,
				data : sizeData(),
				title : ""
	        };
	    };
		
		/**
		 * get preferred size
		 * @return {
		 'width': NUMBER,
		 'height' : NUMBER
		 }
		 */
		chart.getPreferredSize = function() {
		};
		/**
		 * set/get properties
		 */
		chart.properties = function(props) {
			if(!arguments.length) {
				return properties;
			}
			properties = props;
			return chart;
		};
		/**
		 * get/set your event dispatch if you support event
		 */
		chart.dispatch = function(_){
            if(!arguments.length)
                return eDispatch;
            eDispatch = _;
            return this;
        };
		return chart;
	};
	//set parco manifest
	var valueFeed = {
		'id' : 'sap.viz.modules.orgheat.valueaxis',
		'name' : 'Size',
		'type' : 'Measure',
		'min' : 1,
		'max' : 3,
		'mgIndex' : 1
	};

	var dimensionFeed = {
		'id' : 'sap.viz.modules.orgheat.dimension',
		'name' : 'Links',
		'type' : 'Dimension',
		'min' : 1,
		'max' : 2,
		'acceptMND' : false,
		'aaIndex' : 1
	};
	
	orgModuleConfig = {
		'id' : 'sap.viz.modules.orgheat',
		'type' : 'CHART',
		'name' : 'orgheat',
		'datastructure' : 'DATA STRUCTURE DOC',
		'properties' : {
			'binding' : {
				'name' : 'binding',
				'supportedValueType' : 'Object',
				'supportedValues' : {
					'size' : {
						'name' : 'size',
						'supportedValueType' : 'String',
						'defaultValue' : '',
						'description' : 'bind a measure to size'
					},
					'color' : {
						'name' : 'color',
						'supportedValueType' : 'String',
						'defaultValue' : '',
						'description' : 'bind a measure to color.'
					}
				},
				'description' : 'color and size binding'
			},
		},
		'events' : {
		},
		'feeds' : [valueFeed, dimensionFeed],
		'css' : null,
		'configure' : null,
		'fn' : orgheatFn
	};

	var orgConfig = {
		id : 'riv/orgheat',
		name : 'Organizational Heat Chart',
		modules : {
			title : {
				id : 'sap.viz.modules.title',
				configure : {
					propertyCategory : 'title'
				}
			},
			tooltip : {
				id : 'sap.viz.modules.tooltip',
				configure : {
					propertyCategory : 'tooltip',
					properties : {
						orientation : 'left'
					}
				}
			},
			legend : {
				id : 'sap.viz.modules.legend',
				configure : {
					propertyCategory : 'colorLegend',
					properties : {
						type : 'MeasureBasedColoringLegend'
					}
				}
			},
			sizeLegend : {
				id : 'sap.viz.modules.legend',
				configure : {
					propertyCategory : 'sizeLegend',
					properties : {
						type : 'SizeLegend'
					}
				}
			},
			main : {
				id : 'sap.viz.modules.xycontainer',
				modules : {
					plot : {
						id : 'sap.viz.modules.orgheat',
						configure : {
							propertyCategory : 'orgheat'
						}
					}
				}
			}
		},
		dependencies : {
			attributes : [{
				targetModule : 'legend',
				target : 'mbcLegendInfo',
				sourceModule : 'main.plot',
				source : 'mbcLegendInfo'
			} , {
				targetModule : 'sizeLegend',
				target : 'sizeLegendInfo',
				sourceModule : 'main.plot',
				source : 'sizeLegend'
			}],
			events : [ {
				targetModule : 'tooltip',
				listener : 'showTooltip',
				sourceModule : 'main.plot',
				type : 'showTooltip'
				}, {
				targetModule : 'tooltip',
				listener : 'hideTooltip',
				sourceModule : 'main.plot',
				type : 'hideTooltip'
			}]
		}
	};

	sap.viz.manifest.module.register(orgModuleConfig);
	sap.viz.manifest.viz.register(orgConfig);

	//console.log(sap.viz.manifests.Viz.get("riv/tree"));
});
