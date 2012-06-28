医療計算機
======================
「医療計算機」は各種医学的計算を行うアプリケーションです。
細心の注意を払って作成しておりますが、臨床での使用には必ず元文献をご参照の上、検算を行なってください。
 
使い方
----------------------
### ウェブブラウザ上からの使用 ###
app.kcrt.net上に、[医療計算機](http://app.kcrt.net/med/)の安定版をホストしております。
ウェブブラウザでアクセスするか、iOSではWebClipとして登録して使用してください。
 
### Androidアプリケーション ###
PhoneGap:Buildを使用して時々ビルドしています。常に最新版であるとは限りません。
[PhoneGap:Buildのサイト上](https://build.phonegap.com/apps/141089/share)からダウンロードして下さい。
将来的にはGoogle Play(旧Android Market)に登録できればと思っております。

### iOSアプリケーション ###
理論上はPhoneGap:Buildで作成できると思います。
しかしApp Storeでの公開にはフリーウェアでも年会費として99米ドルをAppleに払わなければいけないため、現在のところは残念ながら予定しておりません。
もしApp Storeにフリーウェアプランのようなものができたらまた考えたいと思います。

### Windows Phone ###
[PhoneGap:Buildのサイト上](https://build.phonegap.com/apps/141089/share)からダウンロードすることができますが、実機を持ち合わせていないためテストできません。
動作報告をお待ちしております。

動作・バグ報告
--------------------------
動作報告やバグ報告は、[メール](mailto:kcrt@kcrt.net?subject=[医療計算機]報告)または、[Twitter](http://twitter.com/kcrt)に連絡ください。すべてのメールに目を通しますが、必ずしも全てに返答できるとは限りません。
計算の追加などの要望に関しましては、可能な場合は参考となる文献を教えていただけると助かります。

ライセンス
--------------------------
Copyright &copy; 2012 TAKAHASHI, Kyohei

This Application program includes jQuery and jQuery Mobile.
Redistributed under the [MIT License][mit].
[MIT]: http://www.opensource.org/licenses/mit-license.php

formula.jsonの文法について
---------------------------
医療計算機でformula.jsonを読み込み、項目の表示や計算を行なっています。
formula.jsonは以下のような構成になっています。

	{
		"menu": {
			(メニュー部分)
		},
		"formula": {
			(数式部分)
		}
	}

### menu セクション ###
	"大項目": {
		"小項目1": {
			"info": "メニューに表示される情報",
			"id": "..."
		},
		"小項目2": {
			"info": "メニューに表示される情報",
			"id": "..."
		}
	}

メニューは大項目で区切られたいくつかの小項目からなります。小項目はinfoで詳しい説明を付加することが可能です。
idに後述のformulaのIDを指定することで対応するformulaへのリンクとなります。
また、idがhttpから開始する場合は外部リンクとみなされます。

### formula セクション (htmlタイプ) ###
	"_id_": {
		"type": "html",
		"html": "<div>本日は...</div>",
		"ref": {
			"参考文献": "URLなど"
		}
	}

_id_ では前述のmenuに対応したIDを指定します。
_type_ に *html* を指定することで、 _html_ で指定した文字列をそのまま表示します。

### formula セクション (imageタイプ) ###
	"_id_": {
		"type": "image",
		"src": "_filename_",
		"ref": {
			"参考文献": "URLなど"
		}
	}
_id_ では前述のmenuに対応したIDを指定します。
_type_ に *image* を指定することで、 _src_ で指定したファイルを表示します。
ファイル名は相対パスでも絶対パスでも構いません。

### formula セクション (input/outputタイプ) ###
	"_id_" : {
		"input" : {
			"height": {"name": "身長[cm]", "type": "float", "min": 30, "max": 300},
			"weight": {"name": "体重[kg]", "type": "float", "min": 3, "max": 300}
		},
		"output": {
			"BMI": {"name": "BMI", "formula" : "weight/(height/100)/(height/100)", "toFixed": 2},
			"who": {"name": "WHO(世界保健機関)", "text" : "≧25: overwight, ≧30: obese"},
			"jasso": {"name": "日本肥満学会", "text": "＜18.5: 低体重, 22: 標準体重,≧25: 肥満"}
		},
		"ref": {
			"Wikipedia" : "http://ja.wikipedia.org/wiki/%E3%83%9C%E3%83%87%E3%82%A3%E3%83%9E%E3%82%B9%E6%8C%87%E6%95%B0"
		}
	}

_id_ では前述のmenuに対応したIDを指定します。
#### input部分 ####
_input_ 部分では
	"変数名": {"name": "表示", "type": "入力タイプ", (それぞれのタイプに合わせたオプション) }
で、入力を指定します。
  * "type": "*float*" 数値
    * "min": 数値 - 入力できる最小の値を指定します。例えば、負の値の入力を拒否したい場合は0を指定します。
	* "max": 数値 - 入力できる最大の値を指定します。
	* "placeholder" (_option_) : 文字列 - 入力ヒントを指定します。
  * "type": "*text*" 文字列
	* "placeholder" (_option_) : 文字列 - 入力ヒントを指定します。
  * "type": "*slider*" 数値(スライダー)
    * "min": 数値 - 入力できる最小の値を指定します。例えば、負の値の入力を拒否したい場合は0を指定します。
	* "max": 数値 - 入力できる最大の値を指定します。
    * min, maxを省略した場合はそれぞれ0, 100とみなされます。
  * "type": "*sex*" 性別
    * (オプション無し)
	* 変数は男を選んだ場合は1, 女を選んだ場合は0となります。
  * "type": "*onoff*" スウィッチ
    * "on": 文字列 - オンの時の文字列です。
	* "off": 文字列 - オフの時の文字列です。
	* 変数はオンを選んだ場合は1, オフを選んだ場合は0となります。
	* on, offを省略した場合はそれぞれ"Yes", "No"とみなされます。
  * "type": "*select*" 選択ボックス
    * "item": {"項目1": 値1, "項目2": 値2, ...} - 選択項目です。
	* 変数は選択した項目に対応する値となります。
  * "type": "*info*" 情報
    * "text": 文字列 - 文字列が表示されます。
  * "type": "*html*" 情報
    * "html": 文字列 - htmlがそのまま表示されます。

#### output部分 ####
	"_項目名_": {"name": "_表示名_", "formula" : "weight/(height/100)/(height/100)", "toFixed": 2}
output部分では、_text_ , _formula_ , _code_ のいずれかを指定します。
  * "text"がある場合、文字列をそのまま出力します。情報の補足が必要な場合に使用してください。
  * "formula"がある場合、それを数式として使用します。input部分で指定した項目を変数として使用出来ます。
  * "code"がある場合、それをJavaScriptコードとして使用します。表示項目を返り値(return)として指定してください。
  * "toFixed"で四捨五入を行う桁を指定できます。例えば、1/3を"toFixed": 2で表示した場合0.33となります。
  * "toFixed"を省略した場合、値が数値として解釈できない場合は変換は行われません。数値として解釈できる場合は"toFixed": 2を指定したのと同じになります。
  * 値が整数値になることがわかっているなど、変換を行いたくない場合は"toFixed": ""を指定してください。
  * formulaまたはcodeでは、すでに計算の終わっている他のoutput項目を使用出来ます。

##### formula, codeで使用できる関数 #####
  * JavaScriptの関数(Math.powなど)が使用出来ます。
  * GetZScore(**Value**, **Average**, **SD**) - Average, SDに対応するZScore(例: 0.32)を返します。
  * GetZScoreStr(**Value**, **Average**, **SD**) - GetZScoreを整形して返します。(例: 1.32 (-0.32SD) )



### 参考文献部分 ###
	"ref": {
		"表示名": "URL",
		"表示名": "URL"
	}

_表示名_ には人が識別できる文字列(書籍名や、論文名など)を指定します。
_URL_ を指定するとリンクが作成されます。
  * 空文字列を指定すると _表示名_ のみ表示され、リンクとなりません。
  * *isbn:* で始まるコードを指定すると、Amazon.co.jpなどへのリンクに自動的に変換されます。
  * *pubmed:* で始まるコードを指定すると、pubmedへのリンクに自動的に変換されます。

