var map = new Array();

function init() {
	$.getJSON('j/unit.json', function(data) {
		for( i = 0; i < data.length; i++) {
			map.push({
				"typ" : [(data[i].typ[0] || "N/C"), (data[i].typ[1] || "N/C")],
				"sym" : data[i].sym,
				"mag" : data[i].mag,
				"fac" : data[i].fac
			});
		}

		list();
	});
}

init();

function list() {
	for( i = 0; i < map.length; i++) {
		if($("#unitlist #MAG" + map[i].mag).length == 0) {
			$("<div/>").attr("id", "MAG" + map[i].mag).appendTo("#unitlist");
			$("<div/>").addClass('c').html(map[i].mag).appendTo("#unitlist #MAG" + map[i].mag);
		}
		$("<div/>").addClass('e').html(map[i].typ[0] + " (" + map[i].sym + ")").appendTo("#unitlist #MAG" + map[i].mag);
	}
}
