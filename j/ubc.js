var curr_a;
var curr_b;

var sga = 0;
var sgsa = 0;
var sgb = 0;
var sgsb = 0;

var input = new BigNumber(0);
var output = new BigNumber(0).toString();

var chain = {};
var lang = 0;
var language = ["english", "spanish", "francais"];

function init() {
	$.getJSON('j/tr/' + language[lang] + '.json', function(data) {
		$.i18n.setDictionary(data);

		$('.translate').map(function() {
			$(this).text($.i18n._($(this).attr('data-translate')));
		});
	});

	$.getJSON('j/unit/unit.json?c=' + (new Date().getTime()), function(data) {
		fx = data;
		curr_a = fx[0];
		curr_b = fx[0];

		if(localStorage.unitBeast != null && localStorage.unitBeast.substring(0, 1) == "{") {
			chain = $.evalJSON(localStorage.unitBeast);
			input = new BigNumber(chain.input);
			curr_a = chain.origin;
			curr_b = chain.destination;
		} else {
			chain = {
				"input" : input.toString(),
				"origin" : curr_a,
				"destination" : curr_b
			}
			localStorage.unitBeast = $.toJSON(chain);
		}

		$("#origin").val(curr_a.typ[lang]);
		$("#destination").val(curr_b.typ[lang]);
		$("#input").val(input.toString());
		obtain();

		$("#input").focus();
	});
}

init();

$("#origin").blur(function() {
	setTimeout(function() {
		blur_a();
	}, 100);
});

function blur_a() {
	$("#origin-sugg").fadeOut(100);
	$("#origin").val(curr_a.typ[lang]);
}

function peek_a(n) {
	curr_a = fx[n];
	$("#origin").val(curr_a.typ[lang]);
	$("#origin-sugg").fadeOut(100);

	if(curr_b.mag != curr_a.mag) {
		curr_b = curr_a;
		for( i = 0; i < fx.length; i++) {
			if(fx[i].fac == 1 && fx[i].mag == curr_a.mag) {
				curr_b = fx[i];
				break;
			}
		}
		$("#destination").val(curr_b.typ[lang]);
	}

	chain.origin = curr_a;
	chain.destination = curr_b;
	localStorage.unitBeast = $.toJSON(chain);

	obtain();
}

function obtain() {
	if(curr_a.mag != curr_b.mag) {
		output.set(0);
		$("#output").val("err");
	} else {
		output = new BigNumber(input.multiply(unzip(curr_a.fac)).divide(unzip(curr_b.fac))).toString().replace(/([0]+981|\.[0]*981)/, "");
		$("#output").val(output.toString() + " " + curr_b.sym);
	}
}


$("#destination").blur(function() {
	setTimeout(function() {
		blur_b();
	}, 100);
});
function blur_b() {
	$("#destination-sugg").fadeOut(100);
	$("#destination").val(curr_b.typ[lang]);
}

function peek_b(n) {
	curr_b = fx[n];
	$("#destination").val(curr_b.typ[lang]);
	$("#destination-sugg").fadeOut(100);

	chain.destination = curr_b;
	localStorage.unitBeast = $.toJSON(chain);

	obtain();
}


$("#origin").keyup(function(e) {
	sugg_a(e);
});
$("#origin").focus(sugg_a);

$("#destination").keyup(function(e) {
	sugg_b(e);
});
$("#destination").focus(sugg_b);

function sugg_a(e) {
	k = (e.keyCode ? e.keyCode : e.which);
	if(k == 13) {
		eval($("#sga" + sga).attr("onclick"));
		$("#origin").focus();
		return;
	}

	if(k == 27) {
		$("#origin").blur();
		return;
	}

	if(k == 40) {
		$("#sga" + sga).removeClass("key");
		sga++;
		if($("#sga" + sga).addClass("key").length == 0) {
			sga = 0;
			$("#sga" + sga).addClass("key");
		}

		if($("#sga" + sga).position().top < 0)
			$("#sga" + sga).parent().scrollTop($("#sga" + sga).position().top + $("#sga" + sga).parent().scrollTop() - 10);
		if($("#sga" + sga).position().top > 160)
			$("#sga" + sga).parent().scrollTop($("#sga" + sga).position().top + $("#sga" + sga).parent().scrollTop() - 140);

		return;
	}
	if(k == 38) {
		$("#sga" + sga).removeClass("key");
		sga--;
		if($("#sga" + sga).addClass("key").length == 0) {
			sga = sgsa;
			$("#sga" + sga).addClass("key");
		}

		if($("#sga" + sga).position().top < 0)
			$("#sga" + sga).parent().scrollTop($("#sga" + sga).position().top + $("#sga" + sga).parent().scrollTop() - 10);
		if($("#sga" + sga).position().top > 160)
			$("#sga" + sga).parent().scrollTop($("#sga" + sga).position().top + $("#sga" + sga).parent().scrollTop() - 140);

		return;
	}

	sugg = "";
	n = 0;
	for( i = 0; i < fx.length; i++)
		if(normalize(fx[i].typ[lang]).indexOf(normalize($("#origin").val())) == 0)
			sugg += "<div class=\"unidad\" id=\"sga" + (n++) + "\" onclick=\"peek_a(" + i + ")\">" + fx[i].typ[lang] + " (" + fx[i].sym + ")</div>\n";

	for( i = 0; i < fx.length; i++)
		if(normalize(fx[i].typ[lang]).indexOf(normalize($("#origin").val())) > 0)
			sugg += "<div class=\"unidad\" id=\"sga" + (n++) + "\" onclick=\"peek_a(" + i + ")\">" + fx[i].typ[lang] + " (" + fx[i].sym + ")</div>\n";

	sgsa = n - 1;

	if(sugg == "")
		sugg += "<div class=\"carita\">Ninguna coincidencia</div>\n";

	$("#origin-sugg").html(sugg);

	sga = 0;
	$("#sga" + sga).addClass("key");
	$("#sga" + sga).parent().scrollTop(0);

	$("#origin-sugg").fadeIn(300);
}

function sugg_b(e) {
	k = (e.keyCode ? e.keyCode : e.which);
	if(k == 13) {
		eval($("#sgb" + sgb).attr("onclick"));
		$("#destination").focus();
		return;
	}

	if(k == 27) {
		$("#destination").blur();
		return;
	}

	if(k == 40) {
		$("#sgb" + sgb).removeClass("key");
		sgb++;
		if($("#sgb" + sgb).addClass("key").length == 0) {
			sgb = 0;
			$("#sgb" + sgb).addClass("key");
		}

		if($("#sgb" + sgb).position().top < 0)
			$("#sgb" + sgb).parent().scrollTop($("#sgb" + sgb).position().top + $("#sgb" + sgb).parent().scrollTop() - 10);
		if($("#sgb" + sgb).position().top > 160)
			$("#sgb" + sgb).parent().scrollTop($("#sgb" + sgb).position().top + $("#sgb" + sgb).parent().scrollTop() - 140);

		return;
	}
	if(k == 38) {
		$("#sgb" + sgb).removeClass("key");
		sgb--;
		if($("#sgb" + sgb).addClass("key").length == 0) {
			sgb = sgsb;
			$("#sgb" + sgb).addClass("key");
		}

		if($("#sgb" + sgb).position().top < 0)
			$("#sgb" + sgb).parent().scrollTop($("#sgb" + sgb).position().top + $("#sgb" + sgb).parent().scrollTop() - 10);
		if($("#sgb" + sgb).position().top > 160)
			$("#sgb" + sgb).parent().scrollTop($("#sgb" + sgb).position().top + $("#sgb" + sgb).parent().scrollTop() - 140);

		return;
	}

	sugg = "";
	n = 0;
	for( i = 0; i < fx.length; i++)
		if(fx[i].mag == curr_a.mag && normalize(fx[i].typ[lang]).indexOf(normalize($("#destination").val())) == 0)
			sugg += "<div class=\"unidad\" id=\"sgb" + (n++) + "\" onclick=\"peek_b(" + i + ")\">" + fx[i].typ[lang] + " (" + fx[i].sym + ")</div>\n";
	for( i = 0; i < fx.length; i++)
		if(fx[i].mag == curr_a.mag && normalize(fx[i].typ[lang]).indexOf(normalize($("#destination").val())) > 0)
			sugg += "<div class=\"unidad\" id=\"sgb" + (n++) + "\" onclick=\"peek_b(" + i + ")\">" + fx[i].typ[lang] + " (" + fx[i].sym + ")</div>\n";

	sgsb = n - 1;

	if(sugg == "")
		sugg += "<div class=\"carita\">Ninguna coincidencia</div>\n";

	$("#destination-sugg").html(sugg);

	sgb = 0;
	$("#sgb" + sgb).addClass("key");
	$("#sgb" + sgb).parent().scrollTop(0);

	$("#destination-sugg").fadeIn(300);
}


$("#input").keyup(function() {
	if(isNaN($("#input").val()) || $("#input").val().indexOf(" ") > -1) {
		Nstr = input.toString();
		if(Nstr.substr(Nstr.length - 1, 1) == ".")
			$("#input").val(Nstr.substr(0, Nstr.length - 1));
		else
			$("#input").val(Nstr);
	} else {
		input = new BigNumber($("#input").val());
	}

	chain.input = input.toString();
	localStorage.unitBeast = $.toJSON(chain);

	obtain();
});

$("#input").keydown(function(e) {
	k = (e.keyCode ? e.keyCode : e.which);
	if(k == 13)
		e.preventDefault();
});

$("#origin, #destination").keydown(function(e) {
	k = (e.keyCode ? e.keyCode : e.which);
	if(k == 40 || k == 38)
		e.preventDefault();
});

$("#input").blur(function() {
	if($("#input").val() == "")
		$("#input").val("0");

});

var normalize = (function() {
	var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔÙÚÜÛÑÇ", to = "AAAAAEEEEIIIIOOOOUUUUNC", mapping = {};

	for(var i = 0, j = from.length; i < j; i++)
		mapping[ from.charAt(i)] = to.charAt(i);

	return function(str) {
		var ret = [];
		str = str.toUpperCase();
		for(var i = 0, j = str.length; i < j; i++) {
			var c = str.charAt(i);
			if(mapping.hasOwnProperty(str.charAt(i)))
				ret.push(mapping[c]);
			else
				ret.push(c);
		}
		return ret.join('');
	}
})();

function unzip(n) {
	str = n + "";

	ep_ = str.indexOf("e");

	if(ep_ == -1)
		return str;

	exp = Number(str.substring(ep_ + 1));
	dec = str.substring(0, ep_);

	e = new BigNumber(10);
	e = e.pow(exp).toString();

	f = new BigNumber(dec);
	f = f.multiply(e).toString();

	return f;
}


$("#arrow").click(function() {
	temp = curr_a;
	curr_a = curr_b;
	curr_b = temp;

	chain.origin = curr_a;
	chain.destination = curr_b;
	localStorage.unitBeast = $.toJSON(chain);

	$("#origin").val(curr_a.typ[lang]);
	$("#destination").val(curr_b.typ[lang]);

	obtain();
});

function box(w) {
	switch(w) {
		case "language":
			$("#content-abs").fadeTo(100, 0.2);
			$("#lang-box").fadeIn(100);
		case "tutorial":
			$("#content-abs").fadeTo(100, 0.2);
			$("#tutorial-box").fadeIn(100);
	}
}

function relang(n) {
	lang = n;

	init();

	$("#content-abs").fadeTo(100, 1);
	$("#lang-box").fadeOut(100);
}
