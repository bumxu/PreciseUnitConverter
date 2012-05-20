var ubc = function(options){
	var units;				// Here live the units!
	
	var loaded = 0;		// 3 mean application loaded
	var firstReset = true;
	
	var A;					// Current origin unit
	var B;					// Current destination unit
	var M;					// Current common magnitude
	var I;					// Current input
	var O;					// Current output
	
	var sgA = 0;			// Selected origin suggestion
	var sgsA = 0;			// Number of origin suggestions
	var sgB = 0;			// Selected destination suggestion
	var sgsB = 0;			// Number of destination suggestions
	
	var language = 0;		// Current language
	var languages = ["english", "spanish"];
	var acronyms =  ["en_US", "es_ES"];
	var money =     ["USD", "EUR"];
	
	
	/*   Hi!   */
	
	console.log("\nPrecise Unit Converter 0.9.15\nCopyright © 2012 Bumxu\nBy Juande Martos\n");
	
	
	/*   Amazing start animation   */
	
	var initialBar = function(debug){
		console.log(debug);
		loaded++;
		
		switch(loaded){
			case 1:
				$("#subline").stop().animate({"width": "28%", "left": "36%"}, 300);
				break;
			case 2:
				$("#subline").stop().animate({"width": "52%", "left": "24%"}, 300);
				break;
			case 3:
				$("#subline").stop().animate({"width": "84%", "left": "8%"}, 300);
				break;
		}
		if(loaded == 3){
			firstReset = false;
			
			$("#subline").stop().animate({"width": "84%", "left": "8%"}, 200, function(){
				$("#titulo, #subtitulo, #subline").delay(450).animate({"top": "16%"}, 600);
				$("#input-tag, #input, #origin, #destination, #output, #output-tag, #arrow").delay(600).fadeIn(600, function(){
					$("#subtitulo.no").fadeIn(500);
					$("#subtitulo.bx").fadeOut(500);
				});
			});
		}
	}

	
	/*   Start!   */
	
	var reset = function(){
		if(firstReset)
			initialBar("Loading...");

		// Prepares data struct
		$.getJSON('j/unit/alt.json', function(data) {
			units = data;
			if(localStorage.unitBeast != null && localStorage.unitBeast.substring(0, 1) == "{")
				local = $.evalJSON(localStorage.unitBeast);
			else {
				local = {
					"I" : 0,
					"A" : units["length"][0],
					"B" : units["length"][0],
					"M" : "length",
					"L" : detectLang()
				}
				localStorage.unitBeast = $.toJSON(local);
			}

			I = new BigNumber(local.I);
			A = local.A;
			B = local.B;
			M = local.M;
			
			language = local.L;
	
			$("#input").val(I.toString());
			$("#origin").val(A.t[language]);
			$("#destination").val(B.t[language]);
			
			calculate();
			
			if(firstReset)
				initialBar("Units loaded...");
				
			// Translates interface
			$.getJSON('j/tr/' + languages[language] + '.json', function(data) {
				$.i18n.setDictionary(data);
	
				$('.translate').map(function() {
					$(this).html($.i18n._($(this).attr('data-translate')));
				});
				
				$("#donate-bot").val($.i18n._($("#donate-bot").attr('data-translate')));
				$("#donate-currency").val(money[language]);
				
				if(firstReset)
					initialBar("Translations loaded...");
			});
			
			// Donate scrollbar
			$("#donate-slider").draggable({axis: "x", containment: "#donate-bar", drag: function(e, uie){
					$("#amount").val(Math.round((uie.position.left-192)*99/200+1));
				}
			});
			
		}); 
	}
	reset();
	this.reset = reset;
	
	/*   Aux Functions   */
	
	// Removes accents and pass the string to uppercase in order to compare it in a search
	var normalize = (function() {
		var from = "ÃÀÁÄÂÈÉËÊÌÍÏÎÒÓÖÔØÙÚÜÛÑÇ", to = "AAAAAEEEEIIIIOOOOOUUUUNC", mapping = {};

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
	
	// Detects the browser language
	var detectLang = function(){
		userLang = (navigator.language) ? navigator.language : navigator.userLanguage;
		switch(userLang){
			case "es":
				return 1;
		}
		return 0;
	}

	// Converts a number or string in scientific notation to a string in decimal notation
	var unzip = function(n) {
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
	
	// Hide the symbol when i'is empty
	var hideSym = function(s){
		if(s == "")
			return s;
		return "(" + s + ")";
	}

	
	/*   UI Actions   */

	// Box to changes the interface language
	this.setLang = function(n) {
		language = n;
		
		local.L = n;
		localStorage.unitBeast = $.toJSON(local);

		reset();

		hideBoxes();
	}
	
	// Open the request dialog
	this.openBox = function(w) {
		hideBoxes(function(){
			$("#content-abs").fadeTo(300, 0.2);
			$("#mascara").fadeIn(100);
	
			switch(w) {
				case "language":
					$("#lang-box").fadeIn(300);
					break;
				case "tutorial":
					$("#tutorial-box").fadeIn(300);
					break;
				case "about":
					$("#about-box").fadeIn(300);
					break;
				case "donate":
					$("#donate-box").fadeIn(300);
					break;
			}
		});
	}
	
	var hideBoxes = function(callback){
			if(typeof(callback) == "function"){
				$(".boxx").fadeOut(200);
				callback();
			}else{
				$("#mascara").fadeOut(100);
				$("#content-abs").fadeTo(300, 1);
				$(".boxx").fadeOut(200);
			}
	}
	this.hideBoxes = hideBoxes;
	
	$("#mascara").click(hideBoxes);
	
	
	/*   UI Reactions   */

	var suggA = function(e) {
		key = (e.keyCode ? e.keyCode : e.which);
		if(key == 13) {
			eval($("#sgA_" + sgA).attr("onmousedown"));
			$("#origin").focus();
			return;
		}

		if(key == 27) {
			$("#origin").blur();
			return;
		}

		if(key == 40) {
			$("#sgA_" + sgA).removeClass("key");
			sgA++;
			if($("#sgA_" + sgA).addClass("key").length == 0) {
				sgA = 0;
				$("#sgA_" + sgA).addClass("key");
			}

			if($("#sgA_" + sgA).length > 0 && $("#sgA_" + sgA).position().top < 0)
				$("#sgA_" + sgA).parent().scrollTop($("#sgA_" + sgA).position().top + $("#sgA_" + sgA).parent().scrollTop() - 10);
			if($("#sgA_" + sgA).length > 0 && $("#sgA_" + sgA).position().top > 160)
				$("#sgA_" + sgA).parent().scrollTop($("#sgA_" + sgA).position().top + $("#sgA_" + sgA).parent().scrollTop() - 140);

			return;
		}
		if(key == 38) {
			$("#sgA_" + sgA).removeClass("key");
			sgA--;
			if($("#sgA_" + sgA).addClass("key").length == 0) {
				sgA = sgsA;
				$("#sgA_" + sgA).addClass("key");
			}

			if($("#sgA_" + sgA).length > 0 && $("#sgA_" + sgA).position().top < 0)
				$("#sgA_" + sgA).parent().scrollTop($("#sgA_" + sgA).position().top + $("#sgA_" + sgA).parent().scrollTop() - 10);
			if($("#sgA_" + sgA).length > 0 && $("#sgA_" + sgA).position().top > 160)
				$("#sgA_" + sgA).parent().scrollTop($("#sgA_" + sgA).position().top + $("#sgA_" + sgA).parent().scrollTop() - 140);

			return;
		}

		suggestions = "";
		numerator = 0;
		
		for(mag in units)
			for( i = 0; i < units[mag].length; i++)
				if(normalize(units[mag][i].t[language]).indexOf(normalize($("#origin").val())) == 0 || normalize(units[mag][i].s) == normalize($("#origin").val()))
					suggestions += '<div class="unidad" id="sgA_' + (numerator++) + '" onmousedown="$ubc.peekA(\'' + mag + '\', ' + i + ')">' + units[mag][i].t[language] + ' ' + hideSym(units[mag][i].s) + '</div>\n';
		for(mag in units)
			for( i = 0; i < units[mag].length; i++)
				if(normalize(units[mag][i].t[language]).indexOf(normalize($("#origin").val())) > 0)
					suggestions += '<div class="unidad" id="sgA_' + (numerator++) + '" onmousedown="$ubc.peekA(\'' + mag + '\', ' + i + ')">' + units[mag][i].t[language] + ' ' + hideSym(units[mag][i].s) + '</div>\n';
		
		sgsA = numerator - 1;

		if(suggestions == "")
			suggestions = '<div class="carita">' + $.i18n.dict["nosuggs"] + '</div>\n';

		$("#origin-sugg").html(suggestions);

		sgA = 0;
		$("#sgA_" + sgA).addClass("key");
		$("#sgA_" + sgA).parent().scrollTop(0);

		$("#origin-sugg").fadeIn(300);
	}

	function blurA() {
		$("#origin-sugg").fadeOut(100);
		$("#origin").val(A.t[language]);
	}

	this.peekA = function(mag, id) {
		A = units[mag][id];

		if(M != mag) {
			B = A;
			
			for( i = 0; i < units[mag].length; i++)
				if(units[mag][i].f == 1){
					B = units[mag][i];
					break;
				}
			
			$("#destination").val(B.t[language]);
		}
		
		M = mag;
		
		$("#origin").val(A.t[language]);
		$("#origin-sugg").fadeOut(100);

		local.A = A;
		local.B = B;
		local.M = M;
		localStorage.unitBeast = $.toJSON(local);

		calculate();
	}

	function suggB(e) {
		key = (e.keyCode ? e.keyCode : e.which);
		if(key == 13) {
			eval($("#sgB_" + sgB).attr("onmousedown"));
			$("#destination").focus();
			return;
		}

		if(key == 27) {
			$("#destination").blur();
			return;
		}

		if(key == 40) {
			$("#sgB_" + sgB).removeClass("key");
			sgB++;
			if($("#sgB_" + sgB).addClass("key").length == 0) {
				sgB = 0;
				$("#sgB_" + sgB).addClass("key");
			}

			if($("#sgB_" + sgB).position().top < 0)
				$("#sgB_" + sgB).parent().scrollTop($("#sgB_" + sgB).position().top + $("#sgB_" + sgB).parent().scrollTop() - 10);
			if($("#sgB_" + sgB).position().top > 160)
				$("#sgB_" + sgB).parent().scrollTop($("#sgB_" + sgB).position().top + $("#sgB_" + sgB).parent().scrollTop() - 140);

			return;
		}
		if(key == 38) {
			$("#sgB_" + sgB).removeClass("key");
			sgB--;
			if($("#sgB_" + sgB).addClass("key").length == 0) {
				sgB = sgsB;
				$("#sgB_" + sgB).addClass("key");
			}

			if($("#sgB_" + sgB).position().top < 0)
				$("#sgB_" + sgB).parent().scrollTop($("#sgB_" + sgB).position().top + $("#sgB_" + sgB).parent().scrollTop() - 10);
			if($("#sgB_" + sgB).position().top > 160)
				$("#sgB_" + sgB).parent().scrollTop($("#sgB_" + sgB).position().top + $("#sgB_" + sgB).parent().scrollTop() - 140);

			return;
		}

		suggestions = "";
		numerator = 0;

		for( i = 0; i < units[M].length; i++)
			if(normalize(units[M][i].t[language]).indexOf(normalize($("#destination").val())) == 0 || normalize(units[M][i].s) == normalize($("#destination").val()))
				suggestions += '<div class="unidad" id="sgB_' + (numerator++) + '" onmousedown="$ubc.peekB(' + i + ')">' + units[M][i].t[language] + ' ' + hideSym(units[M][i].s) + '</div>\n';
		for( i = 0; i < units[M].length; i++)
			if(normalize(units[M][i].t[language]).indexOf(normalize($("#destination").val())) > 0)
				suggestions += '<div class="unidad" id="sgB_' + (numerator++) + '" onmousedown="$ubc.peekB(' + i + ')">' + units[M][i].t[language] + ' ' + hideSym(units[M][i].s) + '</div>\n';

		sgsB = numerator - 1;

		if(suggestions == "")
			suggestions = '<div class="carita">' + $.i18n.dict["nosuggs"] + '</div>\n';

		$("#destination-sugg").html(suggestions);

		sgB = 0;
		$("#sgB_" + sgB).addClass("key");
		$("#sgB_" + sgB).parent().scrollTop(0);

		$("#destination-sugg").fadeIn(300);
	}

	function blurB() {
		$("#destination-sugg").fadeOut(100);
		$("#destination").val(B.t[language]);
	}

	this.peekB = function(id) {
		B = units[M][id];
		
		$("#destination").val(B.t[language]);
		$("#destination-sugg").fadeOut(100);

		local.B = B;
		localStorage.unitBeast = $.toJSON(local);

		calculate();
	}

	var calculate = function() {
		if(A.f.indexOf("%") > -1 || B.f.indexOf("%") > -1){
			// Advanced process
			BN = I;
			
			// 1.
			if(A.f.indexOf("%") > -1){
				operator = A.f.split("|")[0].replace(/%/g, "BN").replace(/\.a\(/g, ".add(").replace(/\.s\(/g, ".subtract(").replace(/\.m\(/g, ".multiply(").replace(/\.d\(/g, ".divide(").replace(/\.n\(/g, ".negate(");
				//console.log(operator);   <---debug
				eval("BN = " + operator);
			}else{
				BN = BN.multiply(A.f);
			}
			
			// 2.
			if(B.f.indexOf("%") > -1){
				operator = B.f.split("|")[1].replace(/%/g, "BN").replace(/\.a\(/g, ".add(").replace(/\.s\(/g, ".subtract(").replace(/\.m\(/g, ".multiply(").replace(/\.d\(/g, ".divide(").replace(/\.n\(/g, ".negate(");
				//console.log(operator);   <---debug
				eval("BN = " + operator);
			}else{
				BN = BN.divide(B.f);
			}
			
			O = BN;
		}else{
			// Automatic process
			O = I.multiply(unzip(A.f)).divide(unzip(B.f)).toString().replace(/([0]+981|\.[0]*981)/, "");
			//console.log("I.multiply("+unzip(A.f)+").divide("+unzip(B.f)+").toString().replace(/([0]+981|\.[0]*981)/, '')");   <---debug
		}
		
		$("#output").val(O.toString() + " " + B.s);
	}

	
	/*   UI Events   */
	
	$("#origin").blur(function() {
		setTimeout(function() {
			blurA();
		}, 100);
	}).keyup(function(e) {
		suggA(e);
	}).focus(suggA);

	$("#destination").blur(function() {
		setTimeout(function() {
			blurB();
		}, 100);
	}).keyup(function(e) {
		suggB(e);
	}).focus(suggB);

	$("#origin, #destination").keydown(function(e) {
		key = (e.keyCode ? e.keyCode : e.which);
		if(key == 40 || key == 38)
			e.preventDefault();
	}); 

	$("#input").keyup(function() {
		if(isNaN($("#input").val()) || $("#input").val().indexOf(" ") > -1) {
			Nstr = I.toString();
			if(Nstr.substr(Nstr.length - 1, 1) == ".")
				$("#input").val();//Nstr.substr(0, Nstr.length - 1));
			else
				$("#input").val(Nstr);
		} else
			I = new BigNumber($("#input").val());

		local.I = I.toString();
		localStorage.unitBeast = $.toJSON(local);

		calculate();
	}).keydown(function(e) {
		key = (e.keyCode ? e.keyCode : e.which);
		if(key == 13)
			e.preventDefault();
	}).blur(function() {
		if($("#input").val() == "")
			$("#input").val("0");
	});

	$("#arrow").click(function() {
		a = A;
		A = B;
		B = a;

		local.A = A;
		local.B = B;
		localStorage.unitBeast = $.toJSON(local);

		$("#origin").val(A.t[language]);
		$("#destination").val(B.t[language]);

		calculate();
	}); 

}

var $ubc = new ubc();
