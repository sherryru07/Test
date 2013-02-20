var data = {
	analysisAxis : [{
		index : 1,
		data : [{
			type : "Dimension",
			name : "Product",
			values : ["Car", "Truck", "Motorcycle", "Bicycle"]
		}]
	}, {
		index : 2,
		data : [{
			type : "Dimension",
			name : "Country",
			values : ["China", "USA"]
		}, {
			type : "Dimension",
			name : "Year",
			values : ["2001", "2001"]
		}]
	}],
	measureValuesGroup : [{
		index : 1,
		data : [{
			type : "Measure",
			name : "Profit",
			values : [[25, 136, 23, 116], [58, 128, 43, 73]]
		}, {
			type : "Measure",
			name : "Revenue",
			values : [[50, 236, 43, 126], [158, 228, 143, 183]]
		}]
	}]
};