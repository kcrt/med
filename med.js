/*jslint evil: true, forin: true */
var MEDICALCULATOR_VERSION = "0.0.1";

/* ----- データの読み込みとページの構築 ----- */
var formuladata;
function onAjaxError(XMLHttpRequest, status, errorThrown){
	alert("通信エラーが発生しました。");
}
function onFormulaJsonReady(data, status){

	formuladata = data;

	for (var genre in formuladata.menu){
		var genredom = $('<li data-role="list-divider">' + genre + '</li>');
		genredom.appendTo('#lstMain');
		for(var formulatitle in formuladata.menu[genre]){
			var info = formuladata.menu[genre][formulatitle].info;
			var id = formuladata.menu[genre][formulatitle].id;
			var formuladom;
			if(id.match(/^http:/)){
				// idがhttp:で始まる場合はリンクとみなす
				formuladom = $('<li><a href="' + id + '"><h3>' + formulatitle + '</h3><p>' + id + "<br/>" + info + '</p></a></li>');
				formuladom.attr("data-icon", "star");
			}else{
				formuladom = $('<li><a href="#' + id + '"><h3>' + formulatitle + '</h3><p>' + info + '</p></a></li>');
				// 対応するformulaをpageとして追加する
				formuladata.formula[id] && generateFormula(formulatitle, id).appendTo("body");
			}
			formuladom.appendTo('#lstMain');
		}
	}

	SetVersionInformation();

	$('#lstMain').listview('refresh');

	if(deeplink){
		location.hash="#" + deeplink;
	}

}

function generateFormula(Name, f){
	// Name = "JCS ( Japan Coma Scale)" (title)
	// f = "jcs" (id)
	
	var formula = formuladata.formula[f];
	var pagedom = $('<div data-role="page" data-title="' + Name + '"> </div>');
	pagedom.attr('id', f);
	pagedom.attr('data-url', f);
	$('<div data-role="header" data-position="fixed"><a href="#index" data-icon="home" data-theme="b" data-direction="reverse">Home</a><h1>' + Name + '</h1><a href="#config" data-icon="gear">Options</a></a></div>').appendTo(pagedom);
	var contentdom = $('<div data-role="content"> </div>');

	if (typeof(formula) == "undefined"){
		// do nothing
	}else if(formula.type == 'html'){
		$(formula.html).appendTo(contentdom);
	}else if(formula.type == 'image'){
		$('<a href="' + formula.src + '" data-ajax="false">クリックで拡大<br /><img src="' + formula.src + '" style="max-width: 100%;"/></a>').appendTo(contentdom);
	}else{
		// 入力部分
		for(var itemstr in formula.input){
			var item = formula.input[itemstr];
			var itemdom;
			var id = f + "_" + itemstr;
			itemdom = $('<div data-role="fieldcontain"> </div>');
			switch(item.type){
				case "float":
					var placeholder_f = item.placeholder || "";
					$('<label for="' + id + '">' + item.name + ': </label>').appendTo(itemdom);
					$('<input type="number" id="' + id + '" placeholder="'+ placeholder_f +'"> </input>').appendTo(itemdom);
					break;
				case "text":
					var placeholder_t = item.placeholder || "";
					$('<label for="' + id + '">' + item.name + ': </label>').appendTo(itemdom);
					$('<input type="text" id="' + id + '" placeholder="' + placeholder_t + '"> </input>').appendTo(itemdom);
					break;
				case "datetime":
					$('<label for="' + id + '">' + item.name + ': </label>').appendTo(itemdom);
					$('<input type="datetime" id="' + id + '"> </input>').appendTo(itemdom);
					break;
				case "slider":
					var min = item.min || 0;
					var max = item.max || 100;
					var value = item.value || min;
					$('<label for="' + id + '">' + item.name + ': </label>').appendTo(itemdom);
					$('<input type="range" id="' + id + '" value="' + value + '" min="' + min + '" max="' + max + '"> </input>').appendTo(itemdom);
					break;
				case "sex":
					var fieldset = $('<fieldset data-role="controlgroup" data-type="horizontal"> </fieldset>');
					$('<legend>' + item.name + ': </legend>').appendTo(fieldset);
					$('<input type="radio" name="' + id + '" id="' + id + '_m" value="1" />').appendTo(fieldset);
					$('<label for="' + id + '_m">男</label>').appendTo(fieldset);
					$('<input type="radio" name="' + id + '" id="' + id + '_f" value="0" />').appendTo(fieldset);
					$('<label for="' + id + '_f">女</label>').appendTo(fieldset);
					fieldset.appendTo(itemdom);
					break;
				case "onoff":
					$('<label for="' + id + '">' + item.name + ': </label>').appendTo(itemdom);
					var select = $('<select name="' + id + '" id = "' + id + '"data-role="slider"> </select>');
					var off = item.off || "No";
					var on = item.on || "Yes";
					$('<option value="0">' + off + '</option>').appendTo(select);
					$('<option value="1">' + on + '</option>').appendTo(select);
					select.appendTo(itemdom);
					break;
				case "select":
					$('<label for="' + id + '">' + item.name + ': </label>').appendTo(itemdom);
					var selectstr = $('<select name="' + id + '" id = "' + id + '"> </select>');
					for(var k in item.item){
						$('<option value="' + item.item[k] + '">' + k + '</option>').appendTo(selectstr);
					}
					selectstr.appendTo(itemdom);
					break;
				case "info":
					$('<label for="' + id + '"> </label>').appendTo(itemdom);
					$('<div id="' + id + '">' + item.text +  '</div>').appendTo(itemdom);
					break;
				case "html":
					$('<label for="' + id + '"> </label>').appendTo(itemdom);
					$('<div id="' + id + '">' + item.html +  '</div>').appendTo(itemdom);
					break;
				default:
					$('<label for="' + id + '">' + item.name + ': </label>').appendTo(itemdom);
					itemdom = $('<p> unsupported type </p>');
			}
			itemdom.appendTo(contentdom);
		}
		// 計算ボタン
		$('<a href="#" data-role="button" data-icon="arrow-d" data-theme="b" onclick="Calc(\'' + f + '\')">計算</a>').appendTo(contentdom);
		// アウトプットウィンドウ
		$('<div id="' + f + '_outputbox" style="display: none"> <textarea id="' + f + '_txtOutput" readonly="readonly"></textarea> </div>').appendTo(contentdom);
	}

	// 参考文献(あれば)
	if('ref' in formula){
		$('<hr />').appendTo(contentdom);
		var refdom = $('<div><span>参考文献:</span></div>');
		for(var name in formula.ref){
			var link = formula.ref[name];
			var code;
			if(link === ""){
				// リンクなし
				$('<span>' + name + '</span>').appendTo(refdom);
			}else if(code = (/^isbn:(.*)/.exec(link) || [])[1]){
				$('<a href="http://www.amazon.co.jp/s?url=search-alias=aps&field-keywords=' + code + '">'+name+'</a>').appendTo(refdom);
			}else if(code = (/^pubmed:(.*)/.exec(link) || [])[1]){
				$('<a href="http://www.ncbi.nlm.nih.gov/pubmed/' + code + '">'+name+'</a>').appendTo(refdom);
			}else{
				$('<a href="' + link + '">'+name+'</a>').appendTo(refdom);
			}
			$('<span> </span>').appendTo(refdom);
		}
		refdom.appendTo(contentdom);
	}
	

	contentdom.appendTo(pagedom);

	$('<div data-role="footer" data-position="fixed" data-id="myfooter"><a href="#about">医療計算機</a> by <a href="http://profile.kcrt.net/">kcrt</a></div>').appendTo(pagedom);

	return pagedom;
}

function Calc(f){

	// f = "jcs" (id)
	var output = "";
	var d = [];
	var formula = formuladata.formula[f];
	var itemstr;

	// 入力情報の収集
	try{
		for(itemstr in formula.input){
			var item = formula.input[itemstr];
			var id = f + "_" + itemstr;
			switch(item.type){
				case "float":
					d[itemstr] = GetFloat(id, item.min, item.max);
					break;
				case "sex":
					d[itemstr] = GetSex(id);
					break;
				case "select":
				case "onoff":
					d[itemstr] = GetSelect(id);
					break;
				case "info":
				case "html":
					break;
				default:
					throw "対応していないデータ形式";
			}
		}
	}catch(e){
		alert("入力情報にミスがあります:" + e);
		return;
	}

	// 入力情報を eval可能な文字列に
	var valdim="";
	for(var key in d){
		if(typeof(d[key]) == 'number'){
			valdim += "var " + key + ' = ' + d[key] + ';';
		}else{
			valdim += "var " + key + ' = "' + d[key] + '";';
		}
	}

	// 計算
	// var formula = formuladata['formula'][f];
	for(itemstr in formula.output){
		var item = formula.output[itemstr];
		var code;
		var value;
		if(item.formula){
			code = "(function(){" + valdim + " return (" + item.formula + ");})()";
			value = eval(code);
		}else if(item.code){
			code = "(function(){" + valdim + item.code + "})()";
			value = eval(code);
		}else if(item.text){
			value = item.text;
		}	
		if(typeof(value) == 'number'){
			if(item.toFixed === undefined) item.toFixed = 2;
			if(item.toFixed !== "") value = value.toFixed(item.toFixed);
			valdim += "var " + itemstr + ' = ' + value + ';';
		}else{
			valdim += "var " + itemstr + ' = "' + value + '";';
		}

		output += item.name + ": " + value + "\n";
	}

	// 結果の表示
	$("#" + f + "_outputbox").slideUp('normal', function(){$( '#' + f + '_txtOutput').val(output).keyup();});
	$("#" + f + "_outputbox").slideDown();

}

function LoadSettings(){

	if(typeof JSON == 'undefined' || typeof window.localStorage == 'undefined'){
		settings = {};
		settings.noJSON = 1;
	}else{
		settings = JSON.parse(window.localStorage.settings || '{"firstVersion": "' + MEDICALCULATOR_VERSION + '"}');
	}

	// OSの識別
	settings.userAgent = navigator.userAgent;
	settings.iOS = settings.userAgent.match(/(iphone|ipod|ipad)/i);
	
	// デフォルト値の設定
	settings.defaultPageTransition = settings.defaultPageTransition || (settings.iOS ? "slide" : "none");

}

function SaveSettings(){
	settings.defaultPageTransition = $('#selectTransition').val();

	window.localStorage.settings = JSON.stringify(settings);

	ApplySettings();
	alert("設定しました。");
}

function ClearSettings(){
	window.localStorage.clear();
	LoadSettings();
	alert("設定をクリアしました。アプリケーションを再起動してください。");
}

function ApplySettings(){

	if($.mobile === undefined) return 0;

	$.mobile.defaultPageTransition = settings.defaultPageTransition;

}

function SetSettingsForm(){

	// この時点ではまだjQuery Mobileは初期化されておらず、refreshは不要
	$('#selectTransition').val(settings.defaultPageTransition);//.selectmenu('refresh', true);

}

function SetVersionInformation(){

	var numformula = 0;
	for( var f in formuladata.formula){
		numformula++;
	}
	var verinfo =
		"Medicalculator ver." + MEDICALCULATOR_VERSION + "<br />" +
		"formula.json ver." + numformula + "<br />" + 
		"<br />" +
		"jQuery ver." + $().jquery +  "<br />" +
		"jQueryMobile ver." + $.mobile.version;

	$('#divVersion').html(verinfo);

}

/* ----- データ取得 ----- */
function GetFloat(id, min, max){
	var val = parseFloat($("#" + id).val());
	if(isNaN(val) || val < min || val > max){
		throw new Error(id + "の値にエラーがあります。");
	}
	return val;
}

function GetSex(id){

	// 男 - 1, 女 - 0
	if($("#" + id + "_m").attr("checked")){
		return 1;
	}else if ($("#" + id + "_f").attr("checked")){
		return 0;
	}else{
		throw new Error(id + "を選択してください。");
	}

}
function GetSelect(id){
	var val = $('#' + id).val();
	if(isNaN(parseFloat(val))){
		return val;
	}else{
		return parseFloat(val);
	}
}

/* ----- on Load ----- */
var deeplink;
var settings;
(function ($){

	if (location.hash) {
		deeplink = location.href.replace(/.*#/,"");
		location.hash = "";
	}

	LoadSettings();

	$(document).ready(function(){
		
		SetSettingsForm();

		// JSONデータの読み込み
		$.ajax({"error": onAjaxError});
		$.getJSON("./formula.json", onFormulaJsonReady);


		if(settings.noJSON){
			$('#aSetting').text('ブラウザの機能不足のため設定機能を利用することができません。');
		}

	});
	
})(jQuery);

$(document).bind("mobileinit", function(){
	ApplySettings();
});



/* ===== formula, code用関数 ===== */
function GetZScore(value, average, sd){
	return (value - average) / sd;
}
function GetZScoreStr(value, average, sd){

	var zscore = GetZScore(value, average, sd).toFixed(2);
	
	if(zscore == 0 ){
		return value + " ( ±0.00 SD )";
	}else if(zscore > 0){
		return value + " ( +" + zscore + " SD )";
	}else{
		return value + " ( " + zscore + " SD )";
	}

}

