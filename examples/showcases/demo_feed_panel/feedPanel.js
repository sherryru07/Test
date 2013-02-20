var dropNotice = "Drop your feed items here";
var mndStr = "Measure Name Dimension";

var feedPanel = function(container, data, onchange) {
	var lpanel = $("<div></div>").attr("id", "lpanel").css("width", "50%").css("float", "left"), rpanel = $("<div></div>").attr("id", "rpanel").css("width", "50%").css("float", "left");

	container.append(lpanel);
	container.append(rpanel);

	//Add Feed Target Panel
	buildTargetPanle(lpanel, data.feedTo, onchange);
	buildSourcePanel(rpanel, data.feedFrom, onchange);

	$(".feed li").draggable({
		appendTo : "body",
		helper : "clone",
		//connectToSortable : ".feed ol"
	});

}
function buildTargetPanle(container, data, onchange) {
	var targetLength = data.length;
	for(var i = 0; i < targetLength; i++) {
		var item = data[i];
		var panel = $("<div></div>").attr("class", "feed").css("width", "90%").css("float", "left");
		var header = $("<h3></h3>").attr("class", "ui-widget-header").text(item.name);
		var li = $("<li></li>").attr("class", "placeholder").text(dropNotice);
		var ol = $("<ol></ol>").attr("class", item.type + "Feed");
		var div = $("<div></div>").attr("class", "ui-widget-content");
		div.append(ol);
		ol.append(li);
		panel.append(header);
		panel.append(div);
		container.append(panel);
		var acceptSelector;
		if(item.type === "Measure") {
			acceptSelector = ".Measure";

		} else if(item.type === "Dimension") {
			if(item.acceptMND) {
				acceptSelector = ".Dimension,.MND"
			} else {
				acceptSelector = ".Dimension";
			}
		}
		ol.droppable({
			activeClass : "ui-state-default",
			hoverClass : "ui-state-hover",
			accept : acceptSelector,
			drop : function(event, ui) {
				$(this).find(".placeholder").remove();
				//TODO Handle the position of insert
				ui.draggable.appendTo(this);
				onchange(getFeedData());
			}
		});

	}
}

function buildSourcePanel(container, data, onchange) {
	var soruceLength = data.length;
	var panel = $("<div></div>").attr("class", "feed").css("width", "90%").css("float", "left");
	var header = $("<h3></h3>").attr("class", "ui-widget-header").text("Available Feeds");
	var div = $("<div></div>").attr("class", "ui-widget-content");
	var ul = $("<ul></ul>");
	for(var i = 0; i < soruceLength; i++) {
		var li = $("<li></li>").text(data[i].name).attr("class", data[i].type);
		ul.append(li);
	}
	var mnd = $("<li></li>").attr("class", "MND").text(mndStr);
	ul.append(mnd);
	div.append(ul);
	panel.append(header);
	panel.append(div);
	container.append(panel);
	ul.droppable({
		activeClass : "ui-state-default",
		hoverClass : "ui-state-hover",
		accept : ":not(.ui-sortable-helper)",
		drop : function(event, ui) {
			$(this).find(".placeholder").remove();
			//TODO Handle the position of insert
			ui.draggable.appendTo(this);
			onchange(getFeedData());
		}
	});
}

function getFeedData() {
	var data = {};
	var names = $("#lpanel h3");
	var values = $("#lpanel ol");

	for(var i = 0; i < names.length; i++) {
		data[names[i].textContent] = [];
		for(var j = 0; j < values[i].children.length; j++) {
			var val = values[i].children[j].textContent;
			if( val === mndStr) {
				data[names[i].textContent].push("MND");
			} else if (val === dropNotice) {
				
			} else {
				data[names[i].textContent].push(val);
			}
			
		}
	}
	return data;
}