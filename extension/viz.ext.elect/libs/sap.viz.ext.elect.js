(function(){
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////// Module Function /////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var electChart = function() {
	
		var data, // data
		width = undefined,
		// chart width
		height = undefined,
		// chart height
		id = Math.floor(Math.random() * 10000), colorPalette = d3.scale.category20().range().concat(d3.scale.category20b().range()).concat(d3.scale.category20c().range()), shapePalette = ['square'],
		// shape palette for legend
		properties = {};
		// poreperteis that is used to control chart
		/**
		 * Create chart
		 */
	
		function chart(selection) {
	
			selection.each(function() {
				// Data Convert
				function convert(vals) {
					var res = [];
					vals.forEach(function(obj){
						if (obj.val) res.push(obj.val);
					});
					return res;
				}
				var entities = convert(data.getAnalysisAxisDataByIdx(0).values[0].rows);
				var groups = convert(data.getAnalysisAxisDataByIdx(0).values[1].rows);
				var types = convert(data.getAnalysisAxisDataByIdx(0).values[2].rows);
				var kfs = convert(data.getMeasureValuesGroupDataByIdx(0).values[0].rows[0]);
				var groupTitles = properties.groups;// convert(data.getAnalysisAxisDataByIdx(0).values[3].rows);
				var typeTitles = properties.types;// convert(data.getAnalysisAxisDataByIdx(0).values[4].rows);
				var winRule = +properties.rule;
				var nodes = [];
				for (var i = 0; i < entities.length; i++) {
					nodes.push({
						title: entities[i],
						group: groups[i],
						type: types[i],
						data: kfs[i]
					});
				}
				
				

				var w = width, 
					h = height,
				    fill = d3.scale.category10(),
				    wPart = width / 6.0,
				    top = h * .3 + wPart,
				    foci = [{x: wPart, y: top}, {x: wPart*3, y: top}, {x: wPart*5, y: top}];
//				var groupTitles = ['Group A', 'Undecided', 'Group B'];
				    
				nodes.forEach(function(node) {
					node.r = 8 + node.data * 8 ; 
				});
				
//				var vis = d3.select("body").append("svg:svg")
//				    .attr("width", w)
//				    .attr("height", h)
//					.style('font-family', 'Helvetica, Arial')
//				    ;
				var vis = d3.select(this).append('svg:g')
					.attr('class', 'vis')
					.style('font-family', 'Helvetica, Arial')
					;
					
				var filter = vis.append('defs')
					.append('filter')
					.attr('id', 'dropshadow')
					.attr('height', '130%')
					;
				filter.append('feGaussianBlur')
					.attr('in', 'SourceAlpha')
					.attr('stdDeviation', '1')
					;
				filter.append('feOffset')
					.attr('dx', 1)
					.attr('dy', 1)
					.attr('result', 'offsetblur')
					;
				var merge = filter.append('feMerge');
				merge.append('feMergeNode');
				merge.append('feMergeNode').attr('in', 'SourceGraphic');
				var force = d3.layout.force()
				    .nodes(nodes)
				    .links([])
				    .gravity(0)
					.charge(function(d, i) {
						return -Math.pow(d.r, 2) / 8
					})
				    .size([w, h]);
				    
				var drag = d3.behavior.drag()
				        .on("dragstart", dragstart)
				        .on("drag", dragmove)
				        .on("dragend", dragend);
				
				function dragstart(d, i) {
				    force.stop() // stops the force auto positioning before you start dragging
				}
				
				function dragmove(d, i) {
				    d.px += d3.event.dx;
				    d.py += d3.event.dy;
				    d.x += d3.event.dx;
				    d.y += d3.event.dy; 
					tip.attr('transform', 'translate(' + (d.x - 50) + ',' + (d.y - d.r - 50 - 8) + ')');
				    updateNodes(); // this is the key to make it work together with updating both px,py,x,y on d !
				    //force.resume();
				}
				
				function dragend(d, i) {
				    //d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
				    //d.id = 1;
				    //tick();
					//check the nearest foci
					var minDis = 99999;
					for (var j = 0; j < foci.length; j++) {
						var dis = Math.pow(d.x - foci[j].x, 2) + Math.pow(d.y - foci[j].y, 2);
						if (dis < minDis) {
							minDis = dis;
							d.group = j;
						}
					}
					updateSum();
				    force.resume();
				}    
				    
				function updateNodes() {
					vis.selectAll("g.node").attr('transform', function(d) {return 'translate(' + d.x +', ' + d.y + ')' });
				}
				
				force.on("tick", function(e) {
				
					// Push nodes toward their designated focus.
					var k = .1 * e.alpha;
					nodes.forEach(function(o, i) {
						o.y += (foci[o.group].y - o.y) * k;
						o.x += (foci[o.group].x - o.x) * k;
					});
					
					updateNodes();
				
				});
				
				var groups = vis.selectAll('g.group')
					.data(foci)
					.enter()
					.append('g')
					.attr('class', 'group')
					.attr('transform', function(d) {return 'translate(' + d.x + ',' + d.y + ')'})
					;
				var sums = groups.append('g')
					.attr('class', 'sum')
					.attr('transform', 'translate(0, -200)')
					;
				function updateSum() {
					var groupSum = [], total = 0.0;
					vis.selectAll('text.sum').text(function(d, i){
						var sum = 0;
						nodes.forEach(function(node){
							if (node.group == i) sum += node.data;
						})
						groupSum.push(sum);
						total += sum;
						return sum;
					});
					
					var wins = Math.ceil(total * winRule);
					if (wins * 1.0 / total <= winRule) wins += 1;
					var determined = wins <= groupSum[0] ||  wins <= groupSum[2];
					if (determined) {
						vis.selectAll('text.needs')
							.style('fill', 'red')
							.style('font-size', '24px')
							.text(function(d, i) {
								return wins <= groupSum[i] ? 'WIN' : '';
							})
					} else {
						vis.selectAll('text.needs')
							.style('fill', '#aaa')
							.style('font-size', '12px')
							//.filter(function(d, i) {return i != 1 ? this : null;})
							.text(function(d, i){
								if (i==1) return '';
								return 'Needs ' + (wins - groupSum[i]); 
						});
					}
					vis.selectAll('text.towin')
						.text(function(d, i) { return i==1 ? '' : (determined ? '' : 'to win')})
				}
				sums.append('text')
					.attr('class', 'groupTitle')
					.attr('text-anchor', function(d, i) {return ['end', 'middle', 'begin'][i];})
					.attr('x', function(d, i) {return i == 1 ? 0 : (i==0 ? -15 : 15);})
					.attr('y', function(d, i) {return i == 1 ? 0 : -10})
					.style('fill', function(d, i) { return i == 1 ? '#aaa' : 'black';})
					.style('font-size', function(d, i) { return i == 1 ? '12px' : '20px';})
					.text(function(d, i) {
						return groupTitles[i];
					})
					;
				sums.append('text') //sum of two groups
					.attr('class', 'sum')
					.attr('text-anchor', function(d, i) {return ['begin', 'middle', 'end'][i];})
					.attr('y', function(d, i) {return i==1 ? -15 : 0})
					.style('font-size', function(d, i) {return (i==1 ? 30 : 50) + 'px';})
					;
				sums.append('text') //needs xx
					.attr('class', 'needs')
					.attr('text-anchor', function(d, i) {return ['begin', 'middle', 'end'][i];})
					.attr('x', function(d, i) {return i == 1 ? 0 : (i==0 ? 70 : -70);})
					.attr('y', -10)
					.style('font-family', 'Helvetica, Arial')
					;
				sums.append('text') // to win
					.attr('class', 'towin')
					.attr('text-anchor', function(d, i) {return i == 0 ? 'begin' : 'end'})
					.attr('x', function(d, i) {return i==0 ? 70 : -70;})
					.style('fill', '#aaa')
					.style('font-size', '12px')
					;
				updateSum();
				groups.append('circle')
					.filter(function(d, i) {return i != 1 ? this : null;})
					.attr('class', 'bg')
					.attr('cx', 0)
					.attr('cy', 0)
					.attr('r', wPart)
					.style('fill', '#eee')
					.style('stroke', '#bbb')
					.style('stroke-dasharray', '4 1')
					.style('storke-width', 1.5);
				
				for (var j = 0; j < 21; j++) {
					force.start();
					
					var gs = vis.selectAll("g.node")
						.data(nodes)
						.enter().append("svg:g")
						.attr("class", "node")
						.attr('transform', function(d) {return 'translate(' + d.x +', ' + d.y + ')' })
						.style('cursor', '-webkit-grabbing')
						.call(drag)
						.on('mouseover', function(d, i){
							this.parentNode.appendChild(this);
							d3.select(this).select('circle.node')
								.attr('stroke', 'black')
								.style('stroke-dasharray', '');
							tip.select('text.tip_title').text(d.title);
							tip.select('text.tip_data').text(d.data);
							tip.node().parentNode.appendChild(tip.node());
							tip.attr('transform', 'translate(' + (d.x - 50) + ',' + (d.y - d.r - 50 - 8) + ')');
						})
						.on('mouseout', function(d, i) {
							d3.select(this).select('circle.node')
								.attr('stroke', function(d) { return d3.rgb(fill(d.group)).darker(2); })
								.style('stroke-dasharray', '4 1');
							tip.attr('transform', 'translate(-1000, -1000)');
						})
						;
					gs.append('circle')
						.attr('class', 'node')
						.attr("cx", 0)
						.attr("cy", 0)
						.attr("r", function(d, i) {return d.r;})
						.style("fill", function(d) { return fill(d.type); })
						.style("stroke", function(d) { return d3.rgb(fill(d.type)).darker(2); })
						.style('stroke-dasharray', '4 1')
						.style("stroke-width", 1)
						.attr('filter', 'url(#dropshadow)')
						;
					gs.append('text')
						.attr('fill', 'white')
						.attr('text-anchor', 'middle')
						.attr('dy', function(d, i) { return (d.data < 2 ? 4 : 6) + 'px';})
						.style('font-size', function(d, i) { return (d.data < 2 ? 8 : 13) + 'px';})
						.style('pointer-events', 'none')
						.text(function(d){return d.title;});
				
				}
				
				//legend
				var legendWidth = 70,
				legendX0 = w / 2.0 - legendWidth * typeTitles.length / 2.0;
				var legend = vis.selectAll('g.legend')
					.data(typeTitles)
					.enter().append('svg:g')
					.attr('class', 'legend')
					.attr('transform', function(d, i){
						var x = legendX0 + i * legendWidth, y = h - 50;
						return 'translate(' + x + ', ' + y + ')';
					})
					;
				legend.append('circle')
					.attr('class', 'legend')
					.attr('cx', 7.5)
					.attr('cy', 7.5)
					.attr('r', 7.5)
					.style('fill', function(d, i) {return fill(i);})
					.style("stroke", function(d) { return d3.rgb(fill(i)).darker(2); })
					;
				legend.append('text')
					.attr('class', 'legend')
					.attr('x', 20)
					.attr('dy', 10)
					.style('fill', function(d, i) {return fill(i);})
					.text(function(d) {return d;})
					;
					
				//tip
				var tip = vis.append('g')
					.attr('class', 'tip')
					.attr('transform', 'translate(-1000, -1000)')
					;
//				tip.append('rect')
//					.attr('class', 'tip')
//					.attr('width', 100)
//					.attr('height', 50)
//					.style('fill', 'white')
//					.style('stroke', 'gray')
//					.style('stroke-width', .5)
//					.attr('filter', 'url(#dropshadow)')
//					;
				tip.append('path')
					.attr('class', 'tip')
					.attr('d', 'M0,0 h100 v50 h-40 l-10,10 l-10,-10 H0 v-50')
					.style('fill', 'white')
					.style('stroke', 'gray')
					.style('stroke-width', .5)
					.attr('filter', 'url(#dropshadow)')
					;					
				tip.append('text')
					.attr('class', 'tip_title')
					.attr('x', 10)
					.attr('y', 20)
					.style('font-size', '12px')
					.text('Title');
				tip.append('text')
					.attr('class', 'tip_data')
					.attr('x', 10)
					.attr('y', 40)
					.style('font-size', '12px')
					.style('fill', 'gray')
					.text('Data');				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
				
	
			});
			return chart;
		};
	
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
	/*Feed Definition*/
	var valueFeed = {
		'id' : 'sap.viz.modules.elect.valueaxis1',
		'name' : 'Primary Values',
		'type' : 'Measure',
		'min' : 1,
		'max' : Number.POSITIVE_INFINITY,
		'mgIndex' : 1
	};

	var entityFeed = {
		'id' : 'sap.viz.modules.elect.entity',
		'name' : 'Entity',
		'type' : 'Dimension',
		'min' : 1,
		'max' : Number.POSITIVE_INFINITY,
		'acceptMND' : false,
		'aaIndex' : 1
	};

	
	/*Module Definition*/
	var module = {
		'id' : 'sap.viz.modules.elect',
		'type' : 'CHART',
		'name' : 'Electrical',
		'datastructure' : 'DATA STRUCTURE DOC',
		'properties' : {
		},
		'events' : {
		},
		'feeds' : [valueFeed, entityFeed],
		'css' : null,
		'configure' : null,
		'fn' : electChart
	};
	sap.viz.manifest.module.register(module);	
	
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	///////////////////////// Chart Configuration /////////////////////////
	//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
	var chart = {
	  id : 'viz/ext/elect',
	  name : 'Electrical Chart',
	  modules : {
	    title : {
	      id : 'sap.viz.modules.title',
	      configure : {
		      propertyCategory : 'title'
	      }
	    },
//	    legend : {
//	      id : 'sap.viz.modules.legend',
//	      data : {
//		      aa : [ 1 ]
//	      },
//	      configure : {
//		      propertyCategory : 'legend'
//	      }
//	    },
	    main : {
	      id : 'sap.viz.modules.xycontainer',
	      modules : {
		      plot : {
			      id : 'sap.viz.modules.elect',
			      configure : {
		      			propertyCategory : 'elect'
			      }
		      }
	      }
	    }
	  },
	  dependencies : {
//	    attributes : [ {
//	      targetModule : 'legend',
//	      target : 'colorPalette',
//	      sourceModule : 'main.plot',
//	      source : 'colorPalette'
//	    } ],
	    events : []
	  }
	};
	
	sap.viz.manifest.viz.register(chart);
	
})();