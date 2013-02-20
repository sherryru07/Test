$(function() {
	var treeFn = function() {
		var data, // data
		width = undefined,
		// chart width
		height = undefined,
		// chart height
		id = Math.floor(Math.random() * 10000),
		// shape palette for legend
		properties = {};

		function chart(selection) {
			selection.each(function() {
				var m = [20, 20, 20, 20], w = width - m[1] - m[3], h = height - m[0] - m[2], i = 0, root;
				var vis = d3.select(this).append("svg:g").attr("transform", "translate(" + m[3] + "," + m[0] + ")");
				if(properties.layout === "tree") {
					buildD3Tree(vis, h, w);
				} else if(properties.layout === "cluster") {
					buildD3Cluster(vis, h, w);
				} else if(properties.layout === "force") {
					buildD3Force(vis, h, w);
				} else if(properties.layout === "pack") {
					buildD3Pack(vis, h, w);
				}

			});
			return chart;
		}

		function buildD3Cluster(svg, h, w) {
			var rx = w / 2, ry = h / 2, m0, rotate = 0;

			var cluster = d3.layout.cluster().size([360, ry - 60]).sort(null);

			var diagonal = d3.svg.diagonal.radial().projection(function(d) {
				return [d.y, d.x / 180 * Math.PI];
			});
			var vis = svg.append("svg:svg").attr("width", w).attr("height", w).append("svg:g").attr("transform", "translate(" + rx + "," + ry + ")");

			vis.append("svg:path").attr("class", "arc").attr("d", d3.svg.arc().innerRadius(ry - 120).outerRadius(ry).startAngle(0).endAngle(2 * Math.PI)).on("mousedown", mousedown).style("fill", "#fff").style("cursor", "move");

			var json = table2tree(data);
			var nodes = cluster.nodes(json);

			var link = vis.selectAll("path.link").data(cluster.links(nodes)).enter().append("svg:path").attr("class", "link").attr("d", diagonal).style("fill", "none").style("stroke", "#ccc").style("stroke-width", "1.5px");

			var node = vis.selectAll("g.node").data(nodes).enter().append("svg:g").attr("class", "node").attr("transform", function(d) {
				return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")";
			}).style("font-size", "8px").style("pointer-events", "none");

			node.append("svg:circle").attr("r", 3).style("fill", "#fff").style("stroke", "steelblue").style("stroke-width", "1px");

			node.append("svg:text").attr("dx", function(d) {
				return d.x < 180 ? 8 : -8;
			}).attr("dy", ".31em").attr("text-anchor", function(d) {
				return d.x < 180 ? "start" : "end";
			}).attr("transform", function(d) {
				return d.x < 180 ? null : "rotate(180)";
			}).text(function(d) {
				return d.name;
			});

			d3.select(window).on("mousemove", mousemove).on("mouseup", mouseup);

			function mouse(e) {
				return [e.pageX - rx, e.pageY - ry];
			}

			function mousedown() {
				m0 = mouse(d3.event);
				d3.event.preventDefault();
			}

			function mousemove() {
				if(m0) {
					var m1 = mouse(d3.event), dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI, tx = "translate3d(0," + (ry - rx) + "px,0)rotate3d(0,0,0," + dm + "deg)translate3d(0," + (rx - ry) + "px,0)";
					svg.style("-moz-transform", tx).style("-ms-transform", tx).style("-webkit-transform", tx);
				}
			}

			function mouseup() {
				if(m0) {
					var m1 = mouse(d3.event), dm = Math.atan2(cross(m0, m1), dot(m0, m1)) * 180 / Math.PI, tx = "rotate3d(0,0,0,0deg)";
					rotate += dm;
					if(rotate > 360)
						rotate -= 360;
					else if(rotate < 0)
						rotate += 360;
					m0 = null;

					svg.style("-moz-transform", tx).style("-ms-transform", tx).style("-webkit-transform", tx);

					vis.attr("transform", "translate(" + rx + "," + ry + ")rotate(" + rotate + ")").selectAll("g.node text").attr("dx", function(d) {
						return (d.x + rotate) % 360 < 180 ? 8 : -8;
					}).attr("text-anchor", function(d) {
						return (d.x + rotate) % 360 < 180 ? "start" : "end";
					}).attr("transform", function(d) {
						return (d.x + rotate) % 360 < 180 ? null : "rotate(180)";
					});
				}
			}

			function cross(a, b) {
				return a[0] * b[1] - a[1] * b[0];
			}

			function dot(a, b) {
				return a[0] * b[0] + a[1] * b[1];
			}

		}

		function buildD3Force(vis, h, w) {
			var node, link, root;
			var format = d3.format(",d");

			var force = d3.layout.force().on("tick", tick).charge(function(d) {
				return d._children ? -d.size / 100 : -30;
			}).linkDistance(function(d) {
				return d.target._children ? 80 : 30;
			}).size([w, h]);
			root = table2tree(data);
			root.fixed = true;
			root.x = w / 2;
			root.y = h / 2;
			update();

			function update() {
				var nodes = flatten(root), links = d3.layout.tree().links(nodes);

				// Restart the force layout.
				force.nodes(nodes).links(links).start();

				// Update the linksÉ
				link = vis.selectAll("line.link").data(links, function(d) {
					return d.target.id;
				});
				// Enter any new links.
				link.enter().insert("svg:line", ".node").attr("class", "link").attr("x1", function(d) {
					return d.source.x;
				}).attr("y1", function(d) {
					return d.source.y;
				}).attr("x2", function(d) {
					return d.target.x;
				}).attr("y2", function(d) {
					return d.target.y;
				}).style("fill", "none").style("stroke", "#9ecae1").style("stroke-width", "1.5px");
				// Exit any old links.
				link.exit().remove();

				// Update the nodesÉ
				node = vis.selectAll("circle.node").data(nodes, function(d) {
					return d.id;
				}).style("fill", color);

				node.transition().attr("r", function(d) {
					return d.children ? 4.5 : Math.sqrt(d.size) / 10;
				});
				// Enter any new nodes.
				node.enter().append("svg:circle").attr("class", "node").attr("cx", function(d) {
					return d.x;
				}).attr("cy", function(d) {
					return d.y;
				}).attr("r", function(d) {
					return d.children ? 4.5 : Math.sqrt(d.size) / 10;
				}).style("fill", color).on("click", click).call(force.drag).style("cursor", "pointer").style("stroke", "#000").style("stroke-width", ".5px").append("title").text(function(d) {
					return d.name + (d.children ? "" : ": " + format(d.size));
				});
				// Exit any old nodes.
				node.exit().remove();
			}

			function tick() {
				link.attr("x1", function(d) {
					return d.source.x;
				}).attr("y1", function(d) {
					return d.source.y;
				}).attr("x2", function(d) {
					return d.target.x;
				}).attr("y2", function(d) {
					return d.target.y;
				});

				node.attr("cx", function(d) {
					return d.x;
				}).attr("cy", function(d) {
					return d.y;
				});
			}

			// Color leaf nodes orange, and packages white or blue.
			function color(d) {
				return d._children ? "#3182bd" : d.children ? "#c6dbef" : "#fd8d3c";
			}

			// Toggle children on click.
			function click(d) {
				if(d.children) {
					d._children = d.children;
					d.children = null;
				} else {
					d.children = d._children;
					d._children = null;
				}
				update();
			}

			// Returns a list of all nodes under the root.
			function flatten(root) {
				var nodes = [], i = 0;

				function recurse(node) {
					if(node.children)
						node.size = node.children.reduce(function(p, v) {
							return p + recurse(v);
						}, 0);
					if(!node.id)
						node.id = ++i;
					nodes.push(node);
					return node.size;
				}


				root.size = recurse(root);
				return nodes;
			}

		}

		function buildD3Pack(vis, h, w) {
			var pack = d3.layout.pack().size([w, h]).value(function(d) {
				return d.size;
			});
			var format = d3.format(",d");
			var json = table2tree(data);
			var node = vis.data([json]).selectAll("g.node").data(pack.nodes).enter().append("g").attr("class", function(d) {
				return d.children ? "node" : "leaf node";
			}).attr("transform", function(d) {
				return "translate(" + d.x + "," + d.y + ")";
			});

			node.append("title").text(function(d) {
				return d.name + (d.children ? "" : ": " + format(d.size));
			});

			node.append("circle").attr("r", function(d) {
				return d.r;
			}).style("fill", function(d) {
				return d.children ? "lightsteelblue" : "steelblue";
			}).style("stroke", "#ccc").style("stroke-width", "1px");

			node.filter(function(d) {
				return !d.children;
			}).append("text").attr("text-anchor", "middle").attr("dy", ".3em").text(function(d) {
				return d.name.substring(0, d.r / 3);
			});
		}

		function buildD3Tree(vis, h, w) {
			var i = 0, root;
			var tree = d3.layout.tree().size([h, w]);

			var diagonal = d3.svg.diagonal().projection(function(d) {
				return [d.y, d.x];
			});
			root = table2tree(data);
			root.x0 = h / 2;
			root.y0 = 0;

			function toggleAll(d) {
				if(d.children) {
					d.children.forEach(toggleAll);
					toggle(d);
				}
			}

			// Initialize the display to show a few nodes.
			root.children.forEach(toggleAll);

			update(root);

			function update(source) {
				var duration = d3.event && d3.event.altKey ? 5000 : 500;

				// Compute the new tree layout.
				var nodes = tree.nodes(root).reverse();

				// Normalize for fixed-depth.
				nodes.forEach(function(d) {
					d.y = d.depth * 180;
				});
				// Update the nodesÉ
				var node = vis.selectAll("g.node").data(nodes, function(d) {
					return d.id || (d.id = ++i);
				});
				// Enter any new nodes at the parent's previous position.
				var nodeEnter = node.enter().append("svg:g").attr("class", "node").attr("transform", function(d) {
					return "translate(" + source.y0 + "," + source.x0 + ")";
				}).on("click", function(d) { toggle(d);
					update(d);
				});

				nodeEnter.append("svg:circle").attr("r", 1e-6).style("fill", function(d) {
					return d._children ? "lightsteelblue" : "#fff";
				});

				nodeEnter.append("svg:text").attr("x", function(d) {
					return d.children || d._children ? -10 : 10;
				}).attr("dy", ".35em").attr("text-anchor", function(d) {
					return d.children || d._children ? "end" : "start";
				}).text(function(d) {
					return d.name;
				}).style("fill-opacity", 1e-6);

				// Transition nodes to their new position.
				var nodeUpdate = node.transition().duration(duration).attr("transform", function(d) {
					return "translate(" + d.y + "," + d.x + ")";
				});

				nodeUpdate.select("circle").attr("r", 4.5).style("fill", function(d) {
					return d._children ? "lightsteelblue" : "#fff";
				}).style("cursor", "pointer").style("stroke", "steelblue").style("stroke-width", "1.5px");

				nodeUpdate.select("text").style("fill-opacity", 1);

				// Transition exiting nodes to the parent's new position.
				var nodeExit = node.exit().transition().duration(duration).attr("transform", function(d) {
					return "translate(" + source.y + "," + source.x + ")";
				}).remove();

				nodeExit.select("circle").attr("r", 1e-6);

				nodeExit.select("text").style("fill-opacity", 1e-6);

				// Update the linksÉ
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
				}).style("fill", "none").style("stroke", "#ccc").style("stroke-width", "2px").transition().duration(duration).attr("d", diagonal);

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

			// Toggle children.
			function toggle(d) {
				if(d.children) {
					d._children = d.children;
					d.children = null;
				} else {
					d.children = d._children;
					d._children = null;
				}
			}

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
		chart.dispatch = function(_) {
			//DO Nothing Now
			return this;
		};
		return chart;
	};
	//set parco manifest
	var valueFeed = {
		'id' : 'sap.viz.modules.tree.valueaxis',
		'name' : 'Size',
		'type' : 'Measure',
		'min' : 1,
		'max' : 1,
		'mgIndex' : 1
	};

	var dimensionFeed = {
		'id' : 'sap.viz.modules.tree.dimension',
		'name' : 'Links',
		'type' : 'Dimension',
		'min' : 1,
		'max' : 2,
		'acceptMND' : false,
		'aaIndex' : 1
	};
	treeModuleConfig = {
		'id' : 'sap.viz.modules.mytree',
		'type' : 'CHART',
		'name' : 'tree',
		'datastructure' : 'DATA STRUCTURE DOC',
		'properties' : {
			'layout' : {
				'name' : 'layout',
				'supportedValueType' : 'List',
				'supportedValues' : ['tree', 'cluster', 'force', 'pack'],
				'defaultValue' : "tree",
				'description' : 'Set layout type'
			},
		},
		'events' : {
		},
		'feeds' : [valueFeed, dimensionFeed],
		'css' : null,
		'configure' : null,
		'fn' : treeFn
	};

	var treeConfig = {
		id : 'riv/tree',
		name : 'Tree Chart',
		modules : {
			title : {
				id : 'sap.viz.modules.title',
				configure : {
					propertyCategory : 'title'
				}
			},
			main : {
				id : 'sap.viz.modules.xycontainer',
				modules : {
					plot : {
						id : 'sap.viz.modules.mytree',
						configure : {
							propertyCategory : 'tree'
						}
					}
				}
			}
		},
		dependencies : {
			attributes : [],
			events : []
		}
	};

	sap.viz.manifest.module.register(treeModuleConfig);
	sap.viz.manifest.viz.register(treeConfig);

	//console.log(sap.viz.manifests.Viz.get("riv/tree"));
});
