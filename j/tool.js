var map = new Array();
var current = {};
var open = -1;

var TYPS = 2;
// <========== TRANSLATIONS NUMBER =========|
var symbol;

function init() {
	$.getJSON('j/unit/unit.json?c=' + (new Date().getTime()), function(data) {
		
		for( i = 0; i < data.length; i++) {
			map.push({
				"typ" : [(data[i].typ[0] || "N/C"), (data[i].typ[1] || "N/C")], //FIXME
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
	$("#unitlist").html("");
	for( i = 0; i < map.length; i++) {
		if($("#unitlist #MAG" + map[i].mag).length == 0) {
			$("<div/>").attr("id", "MAG" + map[i].mag).appendTo("#unitlist");
			$("<div/>").addClass('c').html(map[i].mag).appendTo("#unitlist #MAG" + map[i].mag);
		}
		$("<div/>").addClass('e').attr({
			"onclick" : "pick(" + i + ")",
			"data-dest" : i
		}).html(map[i].typ[0] + " (" + map[i].sym + ")").appendTo("#unitlist #MAG" + map[i].mag);
	}
}

function pick(n) {
	current = map[n];
	open = n;
	unit();
}

function unit() {
	$("#unitedit").html("");

	$("<div/>").html("Magnitude:").appendTo("#unitedit");
	$("<input/>").addClass("i-w-bot").attr("id", "in-mag").css("width", 300).val(current.mag).appendTo("#unitedit");

	$("<div/>").html("Unit:").appendTo("#unitedit");
	for( i = 0; i < TYPS; i++)
		$("<input/>").addClass("i-w-bot").attr("id", "in-typ" + i).css("width", 200).val(current.typ[i]).appendTo("#unitedit");

	$("<div/>").html("Symbol:").appendTo("#unitedit");
	symbol = $("<input/>").addClass("i-w-bot").attr("id", "in-sym").css("width", 100).val(current.sym).appendTo("#unitedit");

	$("<div/>").html("Conversion factor:").appendTo("#unitedit");
	$("<input/>").addClass("i-w-bot").attr("id", "in-fac").css("width", 400).val(current.fac).appendTo("#unitedit");

	$("<div/>").html("Save").addClass("i-w-bot").attr({
		"id" : "save",
		"onclick" : "save()"
	}).appendTo("#unitedit");
	$("<div/>").html("Add new").addClass("i-w-bot").attr({
		"id" : "add",
		"onclick" : "add()"
	}).appendTo("#unitedit");
	$("<div/>").html("Clone").addClass("i-w-bot").attr({
		"id" : "clone",
		"onclick" : "clone()"
	}).appendTo("#unitedit");
	$("<div/>").html("Save file").addClass("i-w-bot").attr({
		"id" : "exp",
		"onclick" : "exp()"
	}).appendTo("#unitedit");
}

function add(){
	current = {
		"typ" : ["new", "nuevo"], //FIXME
		"sym" : "NEW",
		"mag" : "new",
		"fac" : 1
	}
	open = -1;
	unit();
}

function clone(){
	current = $.extend({}, current)
	open = -1;
	unit();
}

function save() {
	$H$("save").hide();

	current.typ = new Array();
	for( i = 0; i < TYPS; i++)
		current.typ[i] = $H$("in-typ" + i).val();
	current.mag = $H$("in-mag").val();
	current.sym = $H$("in-sym").val();
	current.fac = $H$("in-fac").val();

	if(open == -1) {
		map.push(current);
		open = map.length - 1;

		list();
	} else {
		map[open] = current;

		list();
	}
	$H$("save").show();
}

function exp() {
	$("#unitedit").html("");
	s = $("<div/>").attr('id', 'info').addClass('i-w-box').html("Calling php<br><br>Wait! Trying to save on file...").appendTo("#unitedit");
	$.post('l/save.php', {
		map : $.toJSON(map),
		alt : alt()
	}, function(response) {
		if(response == "ok") {
			$(s).html("Success to save");
		} else {
			$(s).html(response);
		}
	});
}

function alt() {
	alternative = "{\n";

	families = $H$("unitlist").children("div");
	for( i = 0; i < families.length; i++) {
		family = families[i].id.substring(3);
		alternative += "\"" + family + "\":[";
		elements = $H$("MAG"+family).children(".e");

		for( j = 0; j < elements.length; j++){
			dest = $(elements[j]).attr("data-dest");
			
			alternative += "\n\t\t{";
			
			alternative += "\"t\":[\"" + map[dest].typ[0] + "\",\"" + map[dest].typ[1] + "\"],";
			alternative += "\"s\":\"" + map[dest].sym + "\",";
			alternative += "\"f\":\"" + map[dest].fac + "\"";
		
			alternative += "}";
			if(j < elements.length - 1)
				alternative += ",";
		}
		alternative += "\n\t]";
		if(i < families.length - 1)
			alternative += ",";

	}

	alternative += '}';

	return alternative;
}

$H$ = function(objID) {
	return $(document.getElementById(objID));
}
