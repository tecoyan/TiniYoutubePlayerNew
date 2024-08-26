/************************************************************************
 * menu_test.js
 * 
 * background.jsへメッセージを送信するスクリプトは赤枠でコメントを挿入
 * 非同期関数
 * このスクリプトは非同期関数の定義と呼び出しで構成
 * 定義は一か所にまとめ、呼び出しも一か所にまとめる
 * 定義と呼び出しは別にする。
 * 構成
 * グローバル変数、クラス、async/await関数、関数、コール(auto,event起動)
 * 
 **************************************************************************/
'use strict';
/**************************************************************************
 * グローバル変数
 * 接頭辞　g_
 * g_xxxxxx
 ***************************************************************************/
console.log("▼グローバル変数定義▼　10 変数定義スタート");               //最初に実行する
let g_EXTENSION_ID;        //拡張機能のID 
let g_cur_detail;                      //
let g_listobj;                     //Listインスタンス1   
let g_testobj;                    //Listインスタンス2
let g_tabs_Info = [];
let g_data;
let g_msg_content;
let swsw = 0;
console.log("■■■menu.jsがリロードされました");
console.log("▼グローバル変数定義▼　36 変数定義終了");
/*
 * Listクラスの定義
 */
console.log("▼Listクラス定義▼　40 Listクラスの定義スタート");

//chrome.runtime.sendMessage({data: 'start'}, function (msg) {
//            console.log("▼▼▼startメッセージ "+swsw++);
            $("body").css("display","block");
//            //      
alert("menu_test.jsがコールされました。");
//            $("#radio_panel").draggable();
//});
//内容 : 4種類の再生リストを再生するクラス
class List {
    //プロパテイ
    rireki_vid = [];                   //
    html;                                //
    genre_data = [];                 //
    genre;                              //
    response;                         //
    list_data = [];                    //
    list_mode = "ランダム";      //リストモード　ランダムorリストor "youtube_sch"
    title;                                //
    vid;                                 //
    vid_sv;                             //
    title_sv;                           //
    thumbnail;
    thumbnail_sv;                   //
    elem;                             //
    idx_idx;                           //
    vid_list;                           //youtubeサーチ、youtube_list
    b_title;                            //
    params;

    //**************************************************************************
    //Listクラスのメソッド
    //プラグインのチェックメソッド(Listクラス)
    //いずれのインスタンスでも実行か
    //thisを使えば、競合は避けられる。
    //**************************************************************************
    youtube_plugin_check(e) {
        //プラグインがインストールされているかをチェック
        $("#search_plugin").css({"top": "0px", "display": "block"});
        $(".search_plugin").css({"display": "block"});

        try {
            /********************************************************************
             * version要求
             *********************************************************************/
            console.log("✖定義部✖✖✖✖実行順序テスト　versionメッセージ");
            chrome.runtime.sendMessage({'data': 'version'}, (msg) => {
                //
            });
        }
        catch (e) {
            //プラグインがインストールされていないケース
            $(".search_plugin").css("display", "none");
            //thisはいずれかのインスタンス
            this.data = $.ajax({
                url: 'https://common.tecoyan.net/plugin/slim/popup_alert.php',
                type: 'GET',
                dataType: 'html',
                cache: false,
                //data: this.params,
                async: false
            }).responseText;
            $("#rule_panel").html(this.data);           //このthisはいずれかのインスタンス
            $("#rule_panel").css({"padding": "1%", "overflow-y": "scroll", "zoom": "1.5",
                "font-weight": "bold", "line-height": "1.5", "display": "block",
                "position": "fixed", "top": "20px", "left": "127px",  "width": "600px"});
            //$("#rule_panel").draggable();
            $("#cancel_query").on('click', (e) => {
                //
                $("#rule_panel").css({"display": "none"});
            });
            return false;
        }
        ;
        //*************************************************************************
        //youtubeサーチ
        //ランダムに次のクェリーをセット
        //*************************************************************************
        this.params = {
            random: Math.floor(Math.random() * 785)
        };
        $.ajax({
            url: "https://common.tecoyan.net/plugin/slim/php/get_random_db.php",
            type: 'POST',
            dataType: 'html',
            cache: false,
            data: this.params, //このthisはいずれかのインスタンス
            //async: false
            success: function (data) {                          //このdataは、thisのインスタンスデータではない。ajaxから渡されたデータ  
                data = data.replace(/^s+|s+$/g, '');
                //サーチボックスへ格納
                $("#option_text").val(data);
            },
            fail: function (e) {
            }
        });
        return false;
    }   //youtube_plugin_check(e)の終わり

    //******************************************************************************
    //Listクラスのメソッド　get_lists()
    //temp_save_tagテーブルのリストの選択
    //これは、my_listのこと
    //get_lists(e)
    //非同期関数　p1定義
    //******************************************************************************
    /*Listクラスメソッド*/
    async get_lists() {
        let p1 = new Promise((resolve, reject) => {
            this.data = $.ajax({
                url: 'https://common.tecoyan.net/plugin/slim/get_lists.php',
                type: 'GET',
                dataType: 'json',
                cache: false,
                //data:params,
                async: false
            }).responseText;
            this.response = JSON.parse(this.data);
            //リストで再生
            this.plist = this.response;
            this.list_mode = "リスト";
            //リスト一覧　response[]を参照
            this.html = "";
            this.html += "<ul style='clear:both;background-color:lightpink;'>";
            $.each(this.response, (i, val) => {
                val['thumbnail'] = val['thumbnail'].replace(/&t=.*s/, "");
                //
                if (val['vid'] !== "") {
                    //リスト一覧生成
                    this.html += "<li style='padding:1%;clear:both;'><img class='my_list' name='" + i + "'\n\
            src='" + val['thumbnail'] + "' style='float:left;width:50px;'><span>" + val['title'] + "</span></li>";
                }
            });
            this.html += "</ul>";
            /*ここで、リストを表示 
             *temp_save_tagテーブルのリスト 
             */
            $("#lists").html(this.html);
            $(".f_weight").css("font-weight", "bold");
            $("#p_lists").css("display", "block");
            /*キャンセルボタン　イベントリスナー登録
             *トグルSW 
             * */
            $("#cancel_mylist").on('click', (e) => {
                if ($("#lists").css("display") === "none") {
                    //表示
                    $("#lists").css("display", "block");
                }
                else {
                    //非表示
                    //$("#lists").css("display","none");
                }
                return false;
            });
            /***********************************************************************
             *ここは、試験的にasync awaitを使用して、サムネイルのクリック処理を実装してみた例 
             *リストのサムネイルをクリックして、background.jsへ再生要求(vid)、
             *タイトル色、ステータス表示・更新、
             *サムネイルのクリックイベントリスナー登録
             ************************************************************************/
            /*非同期関数定義*/
            async function send_para_message(e) {
                console.log("async function send_para_message(e){・・・}");
                // p2オブジェクト　
                let p2 = new Promise((resolve, reject) => {
                    //リストのインデックス
                    g_listobj.index = Number(e.target.attributes['name'].value);
                    g_listobj.list_mode = "リスト";
                    //再生要求生成
                    g_listobj.title = e.target.nextSibling.innerText;
                    g_listobj.thumbnail = e.target.src;
                    g_listobj.vid = e.target.src.split("/")[4];
                    /*パラメータメッセージをbackground.jsへ送信*/
                    let param = {"index": g_listobj.index, "mylist": $("#lists")[0].innerHTML, "vid": g_listobj.vid, "title": g_listobj.title, "thumbnail": g_listobj.thumbnail, "seeka_time": 0};
                    /********************************************************************
                     * パラメータメッセージをbackground.jsへ送信
                     *********************************************************************/
                    console.log("✖実行部✖✖✖✖実行順序テスト　パラメータメッセージ送信");
                    chrome.runtime.sendMessage({data: 'パラメータ', content: param}, function (msg) {
                        //応答データ(サムネイルデータかvidデータで)取得
                        console.log("✖実行部✖◆　276 非同期処理の完了　resolve(引数)　" + msg);
                        //非同期処理の完了
                        //引数を渡している。
                        resolve({"list_mode": list_mode, "index": g_listobj.index, "vid": g_listobj.vid, "title": g_listobj.title, "thumbnail": g_listobj.thumbnail});
                        //alert("'send_para_message'が完了しました。");
                    });
                });
                //非同期処理の完了
                return await p2;
            }
            /*******************************************************************************
             * 関数 para_message_completed(ss)
             * パラメータ　ss
             ************************************************************************************/
            function para_message_completed(ss) {
                console.log("funcion para_message_completed(ss){・・・・ } ");
                //alert("bbb()を実行　" + ss.title);
                //タイトル、サムネイルを表示
                $("#title").html(ss.title);
                $(".f_weight").css("font-weight", "bold");
                ss.thumbnail = ss.thumbnail.replace(/&t=.*s/, "");
                $("#thumbnail").attr("src", ss.thumbnail);
                //*************************************************************************
                //*タイトルのcolorセット
                //*************************************************************************
                $.each($(".my_list"), (i, val) => {
                    val.nextElementSibling.style.color = "blue";
                });
                $(".my_list")[ss.index].nextElementSibling.style.color = "red";
                ss.index++;
                if (ss.index >= $("li").length) {
                    ss.index = 0;
                }
                location.href = "#block";
                console.log("✖実行部✖実行順序テスト　非同期処理　.my_list clickイベント処理のメソッドチェーンを終了");
            }
            //
            //alert("get_lists()の完了");
            console.log("get_lists()の完了");
            resolve();

        });
        console.log("get_lists()のreturn await p1;");
        return await p1;

    }
    //******************************************************************************
    //Listクラスのメソッド
    //マニュアル表示
    //関数
    //******************************************************************************
    /*Listクラスメソッド*/
    get_manual() {
        //
        //alert("マニュアル");
        this.response = $.ajax({
            url: "https://favorite.tecoyan.net/slim/get_manual.php",
            type: 'GET',
            dataType: 'html',
            cache: false,
            //data: this.params,
            async: false
        }).responseText;
        $("#rule_panel").html(this.response);

        $("#rule_panel").css({"padding": "1%", "overflow-y": "scroll", "zoom": "1.5",
            "font-weight": "bold", "line-height": "1.5", "display": "block", "position": "fixed",
            "top": "20px", "left": "127px", "width": "600px"});


        setTimeout(() => {
            $("#cancel_").on('click', (e) => {
                //
                $("#rule_panel").css({"display": "none"});
            });

        }, 1000);
        //ドラッグ
        document.getElementById("rule_panel").onpointermove = function (event) {
            if (event.buttons) {
                this.style.left = this.offsetLeft + event.movementX + 'px';
                this.style.top = this.offsetTop + event.movementY + 'px';
                this.style.position = 'absolute';
                this.draggable = false;
                this.setPointerCapture(event.pointerId);
            }
            //
            $("#rule_panel").css("position", "fixed");

        };


    }
//Listクラスの終わり
}
console.log("▼Listクラス定義▼　325 List定義終了");
/*
 *非同期関数の定義 
 *async function define_global_variable()の定義
 *シンプルなパターン 
 */
console.log("▼非同期関数定義▼　331 非同期関数define_global_variable()定義スタート");
async function define_global_variable() {
    let l_p1 = new Promise((resolve, reject) => {
        //グローバル変数に初期値を代入
        resolve();
    });
    return await l_p1;
}
/**********************************************************************
 *非同期関数の定義 
 *async function set_radio_tabId()定義
 *呼び出す場所はauto_start()で 
 ************************************************************************/
console.log("▼非同期関数定義▼　344 set_radio_tabId()定義スタート");
async function set_radio_tabId() {
    //alert("async関数(set_radio_tabId)が呼び出されました。");
    //ここで、Promiseオブジェクト　p1を生成
    let l_p1 = new Promise((resolve, reject) => {
        //background.jsへset_radio_tabIdメッセージを送信
        chrome.runtime.sendMessage({data: 'set_radio_tabId', 'content': {"vid": "none", "url": location.href}}, function (msg) {
            //完了
            //alert("background.jsから応答が返りました。");
            resolve("AAA");
        });

    });
    //p1が完了(resolve)して、そのオブジェクトを返却する。set_radio_tabId()が完了する
    return await l_p1;

};
console.log("▼非同期関数▼　361 set_radio_tabId終了");
//background.jsからのメッセージ受信　リスナー定義
//
console.log("▼メッセージリスナー(background.jsより)定義▼　364 chromeメッセージリスナー定義スタート");
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    //各タブのiframeプレーヤーからRSメッセージをbackground.jsを経由して受信
    //3秒毎に
    switch (msg.data) {
        case "GS_request":
            console.log("▼実行部▼　370 case 'GS_request':　");
            //alert("GS_request"); 
            //ここで、GSメッセージを出す。
            //操作卓へ転送してステータスの表示を行います。
            chrome.runtime.sendMessage({data: 'GS', content: {}}, function (msg) {
                /*
                 * 応答
                 * 
                 */
                return false;
            });


            break;

        case "RS":

            //
            let src;
            let thumbnail;
            console.log("▼操作卓▼　390 case 'RS':　" + msg.data + "  " + msg.content[0]['music_class']);
            //alert("RSメッセージが来ました。");
            //n回実行
            display_status_default(msg.content);

            let content = [];
            /*******************************************************
             * background.jsより、tab_array[] 結果が返る。
             * タブの数だけ入る
             *******************************************************/
            //alert("◆◆◆backからの応答　RS　" + msg.content.tabId);
            //タブの情報を取得
            g_msg_content = msg.content;
            //background.jsへ応答を返す。
            sendResponse(msg.content);


            break;
            /***************************************************************************
             *iframeプレーヤーのChangeイベントでbackground.js経由で受信 
             *tabIdのサムネイルのみ更新する。 
             *曲名もチェック
             *
             *****************************************************************************/

        case "change_thumb":
            console.log("▼実行部▼　430 case 'change_thumb':");
            //alert("change_thumbメッセージが来ました。");
            thumbnail = "<img  style='width:50px;' src='" + msg.content.thumb + "'>";
            let title = msg.content.title;
            //alert("menu_detail_ststus.php 引数　"+msg.content.tabId+"  "+thumbnail);
            let thumb = [];
            if ($(".video_tabId").length === 0) {
                return false;
            }
            //
            //tabIdで指定されたサムネイルのみ更新する　msg.content.tabId
            let elem = $(".thumbnail_class");
            let tabId = $(".video_tabId");
            //
            for (let i = 0; i < elem.length; i++) {
                //当該タブのみ更新
                if (msg.content.tabId === tabId[i].innerText) {
                    console.log("✖実行部✖✖✖✖実行順序テスト　background リスナー change_thumb " + title);

                    //thumbデータ生成
                    $(".thumbnail_class")[i].innerHTML = thumbnail;
                    //曲名を更新
                    $(".music_class")[i].innerHTML = title;

                }
            }
            //タイトル、サムネイルの更新
            //サムネイルが????
            $("#thumbnail").attr("src", msg.content.thumb);
            $("#title").html(msg.content.title);
            break;
            /**************************************************************************
             *操作卓でサムネイル、タイトル欄のサムネイルをクリックして、 
             *その動画を再生し、ステータスも更新　すべてのタブで 
             *
             ***************************************************************************/
        case "title_thumb":
            console.log("▼実行部▼　468 case 'title_thumb':");
            //再生状況のサムネイルを更新
            //サムネイルを生成
            //src = "https://i.ytimg.com/vi/"+msg.content.vid+"/hqdefault.jpg";
            for (let i = 0; i < msg.content.length; i++) {
                thumbnail = "<img  style='width:50px;' src='" + msg.content[i].thumb + "'>";
                if ($(".video_tabId").length === 0) {
                    return false;
                }
                $(".thumbnail_class")[i].innerHTML = thumbnail;


            }
            return false;
            break;
            /*****************************************************************
             * 同時に4つの更新を行う。
             * list_index
             * 
             ******************************************************************/
        case "list_index":
            console.log("▼操作卓▼　493 case 'list_index':");
            //alert("list_indexメッセージが来ました。");
            console.log("✖操作卓✖✖✖✖実行順序テスト　background リスナー list_index");
            //リストのタイトル色を更新
            //*****************************************************************
            //タイトルのcolorセット
            //*****************************************************************
            $.each($(".my_list"), (i, val) => {
                val.nextElementSibling.style.color = "blue";
            });
            $(".my_list")[Number(msg.content)].nextElementSibling.style.color = "red";
            //タイトルとサムネイルを更新
            g_listobj.thumbnail = $(".my_list")[msg.content].src.replace(/&t=.*s/, "");
            $("#thumbnail").attr("src", g_listobj.thumbnail);
            $("#title").html($("li")[msg.content].innerText);
            //リストの更新

            //
            /********************************************************************
             * ステータスの更新
             * これは、background.jsへ依頼して、全タブの情報をtabs.queryで取得する
             * その時に取得したデータにはサムネイルデータがないため、生成して、追加する
             *********************************************************************/
            chrome.runtime.sendMessage({data: 'ステータス'}, function (msg) {
                //応答でステータスを取得し、先のサムネイルも合成して表示
                //ここで、サムネイルがないので追加する
                for (let i = 0; i < msg.length; i++) {
                    //thumbデータ生成
                    let thumbnail = "<img  style=width:50px; src=" + g_listobj.thumbnail + ">";
                    msg[i].thumbnail = thumbnail;
                }
                //
                g_cur_detail = msg;
                display_status_default(msg);

                console.log("▼操作卓▼　1895 後からリターン");
                return false;
            });
            console.log("▼操作卓▼　1998 先にリターン");
            return false;
            break;
            /*********************************************************************************
             * vid サムネイルを生成　再生状況更新
             *********************************************************************************/
        case "vid":
            console.log("▼操作卓▼　539 case 'vid':");

            //このvidデータでサムネイルを指定の
            //表示内容の更新
            //サムネイルを生成
            src = "https://i.ytimg.com/vi/" + msg.content.vid + "/hqdefault.jpg";
            thumbnail = "<img  style=width:50px; src=" + src + ">";
            //ここで、g_cur_detailを更新しておく
            for (let i = 0; i < g_cur_detail.length; i++) {
                g_cur_detail[i].thumbnail = thumbnail;

            }
            g_listobj.params = {
                detail_data: g_cur_detail,
                tabId: msg.content.tabId,
                thumbnail: thumbnail
            };
            g_data = $.ajax({
                url: 'https://favorite.tecoyan.net/slim/menu_detail_status.php',
                type: 'POST',
                dataType: 'html',
                cache: false,
                data: g_listobj.params,
                async: false
            }).responseText;
            $("#detail_status").html(g_data);
            //
            //タイトル、サムネイルの更新
            $("#thumbnail").attr("src", src);
            $("#title").html(g_listobj.title);
            return false;
            //ここで、g_cur_detailを更新しておく
            break;
    }
    //switch() 終わり

});     //リスナーの終わり
console.log("▼メッセージリスナー(background.jsより)終了▼　581 chromeメッセージリスナー定義終了");

/***************************************************************************
 *async/await 非同期関数定義 
 *async function thumbnail_click(e)
 *(1)全タブのiframeプレーヤーで選択された動画を再生
 *(2)ステータスを更新
 ****************************************************************************/
async function thumbnail_click(e) {
    console.log("▼非同期関数定義▼　903 async thumbnail_click() 実行");//
    let l_p1 = new Promise((resolve, reject) => {

        g_listobj.list_mode = "ランダム";
        g_listobj.title = $("#title")[0].innerText;
        g_listobj.vid = e.target.src.split("/")[4];
        g_listobj.thumbnail = "<img  style=width:50px; src=" + e.target.src + ">";

        //background.jsへ"ランダム"メッセージ送信
        /********************************************************************
         *操作卓から ランダム再生メッセージ(vid、タイトル、サムネイル)を送信
         *********************************************************************/
        console.log("操作卓 919 async thumbnail_clickでランダムメッセージ送信");
        let param = {"vid": g_listobj.vid, "title": g_listobj.title, "thumbnail": g_listobj.thumbnail};
        chrome.runtime.sendMessage({data: 'サムネイル', content: param}, function (msg) {
            resolve("サムネイル　クリックが完了しました。");
        });

    });
    return await l_p1;
}

/*
 * 非同期関数のコール
 * async function define_global_variable()の呼び出し
 * コールでは、単にシーケンス順にコールすればいいというわけではなく、ある意図に従って
 * コールする必要がある。
 * どのタイミングでコールすればいいのかを考慮してコールする。
 * 
 */
console.log("define_global_variable()のコール");
//スタート　順にコール
//グローバル変数に初期値をセット
define_global_variable().then(() => {
    console.log("define_global_variable()実行");
    //alert("define_global_variable()実行");
});
window.addEventListener('load', function () {
    console.log("▼auto_start()呼び出し▼　61 スクリプト実行　auto_start()");
    auto_start("yL0hMUSgjFU");
});
console.log("▼auto_start()関数定義▼　661 auto_start()関数定義スタート");
/******************************************************************
 //auto_start()
 //このページ(favorite)がロードされたときにコールされる
 //今回はリスト処理をクラス化している。4つのリスト形式があるので、g_listobj.list_modeプロパティ
 //で定義
 //初期化処理
 ******************************************************************/
function auto_start(videoid) {
    console.log("▼auto_start()の開始▼　436 auto_start()の開始");
    //alert("操作卓　" + window.location);
    //ここで、Listインスタンスを生成
    console.log("▼インスタンス生成▼　439 Listクラスのインスタンス生成　g_listobj ,g_testobj");
    g_listobj = new List();               //Listクラスのインスタンス生成
    g_testobj = new List();              // 
    //
    //g_listobjの初期設定
    g_listobj.vid_list = [];
    //g_listobj.vid_list_ = [];
//radio_tabidのセット要求
    /********************************************************************
     * 非同期関数　set_radio_tabId()をコール
     * background.jsへradio_tabIdのセット要求を出す。
     * 完了すると、then()メソッドを実行する。
     *********************************************************************/
    set_radio_tabId().then((xxx) => {
        //alert("set_radio_tabId()より、完了メッセージ　" + xxx);
        //マイリストを表示
        //DBからマイリストを取得し、画面に表示する。
        /*********************************************************************
         * マイリストを表示
         *********************************************************************/
        //alert("マイリストを表示します。");
        g_listobj.get_lists();

    }).then(() => {
        //.my_listのサムネイルにリスナーを登録
        $(".my_list").on('click',(e)=>{
                        //指定のサムネイルを引数にして、background.jsへメッセージを送信
                        //全タブのframeプレーヤーにその動画を再生する監視を起動
                        //executeScriptで監視起動
                        let thumb = e.target.src;
                        chrome.runtime.sendMessage({data: 'play_video', content: {thumb:thumb}}, function (msg) {
                            
                            
                            
                       });
                        
                        
                        
            
        })
        


    });
//
//
    $("#comment").css("display", "block");
    //キャンセル イベントリスナー
    /*イベントリスナー登録*/
    $("#clear_text").on('click', (e) => {
        //
        $("#query_text")[0].value = "";
        return false;

    });
    //
    if ($("#popup_panel").length === 0) {
        //
        $("body").append(`<div id="popup_panel" class="f_weight" style="width:750px;z-index:1000;
    background-color:lightgreen;"></div>`);
        $("body").append(`<div id="rule_panel" class="f_weight" style="position:relative;
     top:-154px; left:547px; display:none; width:550px;z-index:1000;color:white;background-color:black;"></div>`);

    }
    $("#popup_panel").css("display", "block");
    /**************************************************************************
     *コントロールキー　イベント リスナー
     *body要素で
     *keydownイベント
     **************************************************************************/
    console.log("▼リスナー登録　keydown▼　472 リスナー登録　keydown");
    /*イベントリスナー登録*/
    $(document).on('keydown', 'body', function (e) {
        //
        switch (e.keyCode) {
            //
            case 17:

                break;
                //
            case 18:

                break;
                //削除   
            case 68:
                //alert("キーダウン");
                if (e.ctrlKey === true && e.altKey === true && e.keyCode === 68) {
                    //
                    del_video_to_db(e);
                    //alert("Ctrl+Alt+Dキー");
                }
                //
            case 77:
                //alert("キーダウン");
                if (e.ctrlKey === true && e.altKey === true && e.keyCode === 77) {
                    g_listobj.get_manual();
                    //alert("Ctrl+Alt+Mキー");
                }
                break;
                //保管   
            case 72:
                ////alert("キーダウン");
                if (e.ctrlKey === true && e.altKey === true && e.keyCode === 72) {
                    //
                    save_video_to_db(e);
                    //alert("Ctrl+Alt+Hキー");
                }
                break;

        }
    });
    console.log("▼リスナー登録　ホバーイベント▼　527 リスナー登録　ホバーイベント");
    /*******************************************************************************
     * イベントリスナー登録
     * ホバーイベント
     * 各要素のクリック
     * 
     * 
     * *******************************************************************************/
    $(document).on({
        "mouseenter": function (e) {
            ////alert("このボタンは、ctrlキーを押しながらクリックするとリスト選択ポップが表示されます。そこで、リストを選択してゆくと、再生がスタートします。");
            let html = "ctrlキーを押し、クリックするとリスト選択して再生ができます";
            $("#popup_panel").html(html);
            $(".f_weight").css("font-weight", "bold");
            $("#popup_panel").css({"width": "auto", "position": "fixed", "top": "5%", "left": "10%", "display": "block"});
        },
        "mouseleave": function (e) {
            $("#popup_panel").css("display", "none");

        }
    }, "#lists_btn");
    console.log("▼リスナー登録　#lists_btn▼　553 リスナー登録　#lists_btn");
    /*****************************************************************************
     *dbサーチ
     *リスト選択ボタン　イベントリスナー
     *"#lists_btn"
     *イベントリスナー登録
     *****************************************************************************/
    $("#lists_btn").on('click', (e) => {
        $("#search_plugin").css("display", "none");
        /*************************************************
         *ここで、ctrlkeyがtrueならば、リスト一覧へ飛ぶ
         **************************************************/
        if (e.ctrlKey === true) {
            //先にクェリー入力を表示
            $("#db_search").css({"top": "0px", "display": "block"});
            $(".db_search").css("display", "block");
            //$("#search_start").attr('id', 'test');
            //*************************************************************************
            //*db検索ボタン
            //
            //*************************************************************************
            $("#db_start").on('click', (e) => {
                $("#p_ichiran").css("display", "block");
                $("#lists").css({"width": "400px", "display": "block"});
                $("#p_lists").css({"width": "400px", "display": "block"});
                //クェリーをgetして、queryへ保存
                ////alert("クェリーを取得");
                //リスト一覧表示
                g_listobj.params = {
                    query: $("#query_text")[0].value
                };
                g_listobj.data = $.ajax({
                    url: 'https://common.tecoyan.net/plugin/slim/query_popup_youtube_list.php',
                    type: 'POST',
                    dataType: 'json',
                    cache: false,
                    data: g_listobj.params,
                    async: false
                }).responseText;
                g_listobj.response = JSON.parse(g_listobj.data);
                //thumnail,title,list_data
                //list_dataの保管
                g_listobj.html = "<ul id='ul_ylist' style='width:350px;overflow-y:scroll;\n\
height:320px;'>";
                $.each(g_listobj.response, function (i, val) {
                    g_listobj.html += `<li style="padding-top:5px;font-size:1.2em;
font-weight:bold;border-bottom:1px solid gray;" class="y_list" >` + i +
                            `<img class="big li_img" name="` + i + `" style="width:100px;" src="` + val[1] + `">` + val[2] + ` </li>`;
                    g_listobj.list_data[i] = val[3];
                    g_listobj.genre_data[i] = val[0];
                });
                g_listobj.html += "</ul>";
                $("#ichiran").html(g_listobj.html);
                $(".f_weight").css("font-weight", "bold");
                //********************************************************************
                //この一覧のサムネイルをクリックすると、その詳細リストをその右側へ表示する
                //一回目はひとつ表示だが、二回目はすべて表示?
                //********************************************************************
                /*イベントリスナー登録*/
                $(".big.li_img").on('click', (e) => {
                    if ($("#p_ichiran").css("display") === "block") {
                        //
                        $("#lists").css({"width": "400px", "display": "block"});
                        $("#p_lists").css({"width": "400px", "display": "block"});
                    }
                    else {
                        //
                        $("#lists").css({"width": "800px", "display": "block"});
                        $("#p_lists").css({"width": "800px", "display": "block"});
                    }
                    //このサムネイルの詳細リストをlist_data[]より取得して右側へ表示
                    g_listobj.list_mode = "db_query";
                    //この表示が重いか　サムネイルがある
                    $("#lists").html(g_listobj.list_data[Number(e.target.name)]);
                    $(".f_weight").css("font-weight", "bold");
                    g_listobj.genre = g_listobj.genre_data[Number(e.target.name)];
                    //$("#both_list").draggable();
                    //
                    setTimeout((e) => {
                        //2秒後
                        //youtubeで削除された動画のサムネイルチェックして不要タグを削除
                        g_listobj.html = $("#lists").html();
                        $(".f_weight").css("font-weight", "bold");
                        /****************************************
                         *delete_undef_thumb()コール
                         ****************************************/
                        delete_undef_thumb(g_listobj.html, g_listobj.genre);

                        //title,thumbnailを表示
                        g_listobj.thumbnail = $(".big.thumb")[0].src;
                        g_listobj.title = $(".b_title")[0].innerText;
                        $("#title").html(g_listobj.title);
                        $(".f_weight").css("font-weight", "bold");
                        $("#thumbnail").attr("src", g_listobj.thumbnail);
                        //ここで、リストの先頭を再生
                        //nplayer.loadVideoById($(".big.youtube")[0].id);

                    }, 2000);
                    return false;

                });
                return false;
            });
            return false;
        }
        /*********************************************************************
         * マイリストを表示
         *********************************************************************/
        g_listobj.get_lists(e);
        //
        $("#search_plugin").css("top", "-200px");
        if ($("#p_ichiran").css("display") === "block") {
            //
            $("#lists").css({"width": "400px", "display": "block"});
            $("#p_lists").css({"width": "400px", "display": "block"});
        }
        else {
            //
            $("#lists").css({"width": "800px", "display": "block"});
            $("#p_lists").css({"width": "800px", "display": "block"});
        }
        return false;
    });

    /**********************************************************************
     *$("#lists_btn").on('click', 終わり 
     ***********************************************************************/
    console.log("▼リスナー登録　#y_btn▼　680 リスナー登録　#y_btn");
    /******************************************************************************
     *youtubeサーチボタン
     *イベントリスナー
     *$("#y_btn").on('click',
     *イベントリスナー登録
     *****************************************************************************/
    $("#y_btn").on('click', (e) => {
        $("#db_search").css("display", "none");
        //複数のインスタンスがあるが、この場合は、g_testobjのメソッドで実行
        g_testobj.youtube_plugin_check(e);

        return false;
    });
    /*****************************************************************************
     * 各種関数定義
     *
     ******************************************************************************/
    function aaa() {
        //alert("to-amebaボタンクリック");
        //$("#ameba").css("display","block");
        $("#ameba_iframe").css("display", "block");
        $("#id_iframe").css("display", "block");
        $("#mess_disp").css("display", "none");
        $("#mess").css("display", "none");
    }
    /*****************************************************************
     * auto_start()の中で、登録
     * ここで、async thumb_click().then();
     * 
     ***********************************************************************/
    $("#thumbnail").on('click', (e) => {
        //alert("896 サムネイルをクリック");
        console.log("896 サムネイルをクリック");
        /*ここで、メソッドチェーンで順番(同期して)に実行する。*/
        thumbnail_click(e).then((ss) => {
            status_display(ss);
        });
        return false;
    });
    /**************************************************************
     * ステータスを更新(タブ毎)
     * オブジェクトデータ
     * 1を除き0から5まではtabs.query()で取得し、6,7はiframeプレーヤーから
     * 取得
     * {0:ico,1:speaker,2:url,3:タイトル,4:tabId,5:frameId,6:曲名,7:thumbnail}
     * 更新処理
     * 現在のステータスを取得して、引数のエントリーデータ(tabId)と比較
     * 一致　更新
     * 不一致　そのまま
     * tabIdが''ならばエントリーを削除
     ***************************************************************/
    $("#block").on('click', (e) => {
        console.log("▼リスナー登録　#block▼　680 リスナー登録　#block");
        //e.targetでクリックした対象要素をチェック可
        //switch()とかで
        switch (e.currentTarget.id) {
            /*********************************************************************
             *サムネイル、タイトル欄で、サムネイルをクリック 
             * ここは、ランダム再生 ステータスのサムネイルを更新
             * タブ間で再生が前後している
             **********************************************************************/
            case "block":
                location.href = "#block";
                break;
            case "thumb_title":
                //
                $("body").css("zoom", "0.7");
                location.href = "#block";
                break;
            case "header":
                //vidを引き継ぐ
                //ここでは、この実行はNG
                //nplayer.stopVideo();
                window.open("https://favorite.tecoyan.net/slim/index.php?v=" + g_listobj.vid);
                break;
        }
        //
        $("#lists").css("display", "block");
        //
        switch (e.target.className) {
            case "my_list":
                //alert("マイリストのサムネイルをクリック");
                /*****************************************************************
                 * マイリストのサムネイルをクリックすると入る
                 * ここで、ステータスを表示しておく
                 * 
                 ******************************************************************/
                //クリック再生
                g_listobj.num = Number(e.target.name);
                g_listobj.vid = e.target.src.split("/")[4];
                //loadVideo(g_listobj.vid);
                g_listobj.title = e.target.nextElementSibling.innerText;
                g_listobj.thumbnail = "https://i.ytimg.com/vi/" + g_listobj.vid + "/mqdefault.jpg";
                //タイトル、サムネイルを表示
                $("#title").html(g_listobj.title);
                $(".f_weight").css("font-weight", "bold");
                $("#thumbnail").attr("src", g_listobj.thumbnail);
                //*****************************************************************
                //タイトルのcolorセット
                //*****************************************************************
                $.each($(".my_list"), (i, val) => {
                    val.nextElementSibling.style.color = "blue";
                });
                $(".my_list")[g_listobj.num].nextElementSibling.style.color = "red";
                location.href = "#block";
                //ステータス表示
                //パックグランドに依頼し、タブの情報を取得し表示する
                //{ico:pp[0],speaker:pp[1],url:pp[2],タイトル:pp[3],tabId:pp[4],frameId:pp[5],music_class:pp[6],thumbnail:pp[7]}
                //但し、music_class:pp[6],thumbnail:pp[7]は、ifeameプレーヤーから取得
                let l_dd = [];
                let l_thumbnail;
                l_thumbnail = "<img  style=width:50px; src=" + g_listobj.thumbnail + ">";
                //background.jsから対象のタブのg_tabs_Infoデータを取得
                get_g_tabs_Info().then((Info) => {
                    g_tabs_Info = Info;
                    let l_ico = "<img src='" + g_tabs_Info['ico'] + "' style='width:20px;'>";
                    l_dd.push({ico: l_ico, speaker: g_tabs_Info['speaker'], url: g_tabs_Info['url'], タイトル: g_tabs_Info['title'], tabId: g_tabs_Info['id'], frameId: g_tabs_Info['frameId'], music_class: g_listobj.title, thumbnail: l_thumbnail});
                    //alert("display_status_default(dd)");
                    //display_status_default(dd);
                    //再生起動(監視)するには                    //
                    //alert("GSメッセージ送信");
                    chrome.runtime.sendMessage({data: 'GS', content: {}}, function (msg) {

                    });

                });

                return false;
                break;
            case "big thumb zoom-in":
                //
                //ここで、cntrlKeyがtrueならば、当該サムネイルのタグをリストから削除
                if (e.ctrlKey === true) {
                    //
                    //alert("のサムネイルを削除します。");
                    g_listobj.idx_idx = Number(e.target.name);
                    aaa = $(".ui-state-default");
                    let l_list = [];
                    $.each(aaa, (i, val) => {
                        //
                        if (i !== g_listobj.idx_idx) {
                            l_list.push(val);
                        }

                    });
                }
                $("#lists").css("display", "block");
                g_listobj.idx_idx = Number(e.target.name);

                //if (g_listobj.vid_list.length === 0) {
                g_listobj.elem = $(".f_jump");
                g_listobj.b_title = $(".b_title");
                $.each(g_listobj.elem, (i, val) => {
                    //ここで、先にvid_list_[]を生成しておく
                    //.big.thumbからvidを抽出して生成
                    g_listobj.vid_list = [];

                    $.each($(".big.thumb"), (i, val) => {
                        //imgのsrcから
                        g_listobj.data = {'location': location.href,
                            'vid': val.src.split('/')[4],
                            'thumbnail': val.src, 'title': g_listobj.b_title[i].innerText};
                        g_listobj.vid_list.push(g_listobj.data);

                    });
                });
                //}
                //maxチェック
                if (g_listobj.idx_idx >= g_listobj.vid_list.length) {
                    g_listobj.idx_idx = 0;
                }
                g_listobj.vid = g_listobj.vid_list[g_listobj.idx_idx].vid;
                g_listobj.b_title = $(".b_title");
                g_listobj.title = g_listobj.b_title[g_listobj.idx_idx].innerText;

                $.each(g_listobj.b_title, (i, val) => {
                    $(".b_title")[i].style.color = "blue";
                });
                $(".b_title")[g_listobj.idx_idx].style.color = "red";

                g_listobj.thumbnail = $(".big.thumb")[g_listobj.idx_idx].src;
                $("#thumbnail").attr("src", g_listobj.thumbnail);
                $("#title").html(g_listobj.title);
                $(".f_weight").css("font-weight", "bold");
                loadVideo(g_listobj.vid);

                break;
            case "big thumb":
                $("#lists").css("display", "block");
                //ここは、name=""がセットされていないときは、生成して保存する
                if (e.target.name === "") {
                    //生成して保存


                }
                g_listobj.idx_idx = Number(e.currentTarget.name);

                //if (g_listobj.vid_list.length === 0) {
                g_listobj.elem = $(".f_jump");
                g_listobj.b_title = $(".b_title");
                $.each(g_listobj.elem, (i, val) => {
                    //ここで、先にvid_list_[]を生成しておく
                    //.big.thumbからvidを抽出して生成
                    g_listobj.vid_list = [];

                    $.each($(".big.thumb"), (i, val) => {
                        //imgのsrcから
                        g_listobj.data = {'location': location.href,
                            'vid': val.src.split('/')[4],
                            'thumbnail': val.src, 'title': g_listobj.b_title[i].innerText};
                        g_listobj.vid_list.push(g_listobj.data);

                    });
                });
                //}
                //maxチェック
                if (g_listobj.idx_idx >= g_listobj.vid_list.length) {
                    g_listobj.idx_idx = 0;
                }
                g_listobj.vid = g_listobj.vid_list[g_listobj.idx_idx].vid;
                g_listobj.b_title = $(".b_title");
                g_listobj.title = g_listobj.b_title[g_listobj.idx_idx].innerText;

                $.each(g_listobj.b_title, (i, val) => {
                    $(".b_title")[i].style.color = "blue";
                });
                $(".b_title")[g_listobj.idx_idx].style.color = "red";

                g_listobj.thumbnail = $(".big.thumb")[g_listobj.idx_idx].src;
                $("#thumbnail").attr("src", g_listobj.thumbnail);
                $("#title").html(g_listobj.title);
                $(".f_weight").css("font-weight", "bold");
                loadVideo(g_listobj.vid);

                break;
            case "f_jump":
                //alert("db_idの送信");
                //レコードidを取得
                let l_db_id = Number($(".c_icon")[0].dataset.id);
                //サムネイルとタイトルをbackground.jsへ送信
                //backgound.jsへ送信
                let l_title = encodeURIComponent(g_listobj.title);
                l_title = escape_html(g_listobj.title);
                let l_content = {'link': get_vid(), 'title': l_title, 'db_id': l_db_id};
                //msg.type 'link_data'
                //ここで、background.jsへ送信
                g_EXTENSION_ID = get_extid("youtube_radio").trim();
                /********************************************************************
                 * link_data_listを送信 vid title db_id
                 *********************************************************************/
                chrome.runtime.sendMessage(g_EXTENSION_ID, {'type': 'link_data_list',
                    "content": l_content}, response => {
                    //
                });
                break;

        }


        //ここで、e.target.id==="thumbnail_a"ならば、そのリスナーを登録するとか。
        switch (e.target.id) {
            case "clear_query":
                $("#option_text")[0].value = "";
                break;

            case "thumbnail_a":
                let l_ele = document.getElementById("thumbnail_a");
                l_ele.addEventListener('click', () => {
                    //
                    //alert("addEventListener");
                    loadVideo($("#vid_a")[0].innerText);
                    return false;
                });
                break;
            case "thumbnail_b":
                l_ele = document.getElementById("thumbnail_b");
                l_ele.addEventListener('click', () => {
                    //
                    //alert("addEventListener");
                    loadVideo($("#vid_b")[0].innerText);
                    return false;
                });
                break;
        }
        if (e.target.id === "content_b" || e.target.id === "toroku") {
            //ここでのクリックはここの処理を抜ける
            return;
        }
        //この時、まだ、リストがないケースが、
        if ($("#lists").length !== 1) {
            $("#lists").css("display", "block");
        }
        $("#id_iframe").css("display", "none");

        //履歴の再生　一回限り
        if (e.altKey === true) {
            if (g_listobj.rireki_vid.length === 0) {
                return;
            }
            //ならば、履歴から再生、遡って再生
            //履歴データは、rireki_vid=[]
            let l_vv = g_listobj.rireki_vid.shift();
            //ここでは、この実行はNG
            //nplayer.loadVideoById(vv['vid']);
            $("#thumbnail").attr("src", l_vv['thumbnail']);
            $("#title").html(l_vv['title']);
            $(".f_weight").css("font-weight", "bold");
            return;
        }
        //文字列をセレクトしてmouseupしても入るため、それを無視するには
        //文字列をセレクト中かをチェック
        if (String(document.getSelection()).length !== 0) {
            return false;
        }
        if (e.target.id === "comment_text") {
            return false;
        }

        //**********************************************************************
        //動画の再生　ランダムかリストか
        //**********************************************************************
        //$("#comment").css("display", "block");
        //リストモードを見て、
        g_listobj.params = {
            list_mode: "ランダム"
        };
        g_listobj.data = $.ajax({
            url: 'https://common.tecoyan.net/plugin/slim/get_random_vid.php',
            type: 'POST',
            dataType: 'json',
            cache: false,
            data: g_listobj.params,
            async: false
        }).responseText;
        g_listobj.response = JSON.parse(g_listobj.data);
        g_listobj.vid = $.trim(g_listobj.response['vid']);
        g_listobj.title = g_listobj.response['title'];
        $("#option_text")[0].value = g_listobj.title;
        g_listobj.thumbnail = g_listobj.response['thumbnail'];
        /***********************************************************************
         *  プレーヤー側にデータを送り、そこで再生
         * スクリプトインジェクションで実行
         * background.jsへ通知　パラメータと同じ手順で
         * **********************************************************************/
        g_listobj.thumbnail = g_listobj.thumbnail.replace(/&t=.*s/, "");
        $("#thumbnail").attr("src", g_listobj.thumbnail);
        $("#title").html(g_listobj.title);
        $(".f_weight").css("font-weight", "bold");
        //履歴保存
        g_listobj.dd = {'vid': g_listobj.vid, 'thumbnail': g_listobj.thumbnail, 'title': g_listobj.title};
        g_listobj.rireki_vid.push(g_listobj.dd);
        g_listobj.list_mode = "ランダム";

    });
    console.log("▼リスナー登録終了　#block▼　680 リスナー登録終了　#block");

    //*************************************************************************
    //選択されたリストの表示
    //*************************************************************************
    $("#lists").html(g_listobj.html);
    if ($("#p_ichiran").css("display") === "none") {
        //2倍に広げる
        $("#lists").css({"width": "800px", "display": "block"});
        $("#p_lists").css({"width": "800px", "display": "block"});
    }
    else {
        $("#lists").css({"width": "400px", "display": "block"});
        $("#p_lists").css({"width": "400px", "display": "block"});

        //
    }
    console.log("イベントリスナー　#comment 1382 #comment イベントリスナー");
    //***********************************************************
    //説明コーナー
    //クリックして、youtubeサーチボタン、dbサーチボタン表示
    //イベントリスナー
    //***********************************************************
    /*イベントリスナー登録*/
    $("#comment").on('click', (e) => {

        $("#comment").css("display", "block");
        //表示
        $(".db_search").css("display", "none");
        $(".search_plugin").css("display", "none");
        $("#lists_btn").css("display", "block");
        $("#search_plugin").css("display", "block");
        $("#y_btn").css("display", "block");
        $("#btns").css("display", "block");
        //ここで、check_manager.phpを実行
        g_listobj.data = $.ajax({
            url: 'https://culture.tecoyan.net/check_manager.php',
            type: 'GET',
            dataType: 'json',
            cache: false,
            //data:params,
            async: false
        }).responseText;
        g_listobj.response = JSON.parse(g_listobj.data);

        //リストあり
        $("#btns").css("display", "block");
        $("#db_search").css("display", "block");
        //入力時の一時保存
        g_listobj.vid_sv = g_listobj.vid;
        g_listobj.title_sv = g_listobj.title;
        g_listobj.thumbnail_sv = g_listobj.thumbnail;
        return false;

    });
    console.log("イベントリスナー 1420 トリガー各種　イベントリスナー");
    /***************************************************************
     * 
     ****************************************************************/
    //alert("auto_start()の最後で");
    //サーチボタン表示 
    g_listobj.ee = jQuery.Event('click');
    $('#comment').trigger(g_listobj.ee);
    /*****************************************************************
     * ステータスをクリック
     * リスナー定義
     * 
     ******************************************************************/
    //ここで、GSを出す
    console.log("✖操作卓✖ 1434 実行順序テスト　GSを送信　");
    //以下のリスナーは登録するだけで、
//    document.querySelector("#status").addEventListener('click', () => {
//        //alert("ページでクリックされました。");
//        //ここで、ステータスの更新を実行。
//        //backgrond.jsへ依頼して、更新データを取得し表示する
//        //backgrond.jsでは、この応答はなく、iframeプレーヤーからのRSメッセージを
//        //操作卓へ転送してステータスの表示を行います。
//        chrome.runtime.sendMessage({data: 'GS', content: {}}, function (msg) {
//            /*
//             * 応答
//             * 
//             */
//            return false;
//        });
//        return false;
//
//    });

    g_listobj.ee = jQuery.Event('click');
    $('#thumbnail').trigger(g_listobj.ee);
    /*
     * ラジオボタン
     */
    $("#radio_btn").on('click',()=>{
                if (window.File) {
                  // File APIに関する処理を記述
                  window.alert("File APIが実装されてます。");
                } else {
                  window.alert("本ブラウザではFile APIが使えません");
                }
                


                //
//                var gg = "https://kaitoriillust.com/illust/%e7%9c%9f%e7%a9%ba%e7%ae%a1%e3%83%a9%e3%82%b8%e3%82%aa%e3%81%ae%e7%b4%a0%e6%9d%90/";
//                window.open(gg, '_blank noopener');
                //ここで、プラグインを保存
        
        
    });

}
console.log("▼操作卓▼　1457 auto_start()定義終了");
//
/**********************************************************************
 *関数定義
 *del_video_to_db()
 *
 ************************************************************************/
console.log("▼関数定義スタート▼　1464 関数定義 del_video_to_db(e) スタート");
function del_video_to_db(e) {
    // 
    if (confirm("リストからこのサムネイルを削除しますか?") === true) {
        //この動画を削除
        //#thumbnailに表示されている動画

        g_listobj.params = {
            vid: $("#thumbnail")[0].src.split("/")[4]
        };
        g_listobj.data = $.ajax({
            url: 'https://common.tecoyan.net/plugin/slim/del_current_video.php',
            type: 'POST',
            dataType: 'html',
            cache: false,
            data: g_listobj.params,
            async: false
        }).responseText;
        //alert("この動画を削除しました。");
        //triggerする
        g_listobj.ee = jQuery.Event('click');

        $('#lists_btn').trigger(g_listobj.ee);


        return false;

    }
    else {


    }



}
/**************************************************************************
 * 関数定義
 * save_video_to_db
 * 
 ***************************************************************************/
//
console.log("▼関数定義スタート▼　1464 関数定義 save_video_to_db(e) スタート");

function save_video_to_db(e) {
    //alert("ctrl+alt+Hで保管");
    g_listobj.params = {
        vid: g_listobj.vid,
        title: g_listobj.title,
        thumbnail: g_listobj.thumbnail
    };
    g_listobj.data = $.ajax({
        url: 'https://common.tecoyan.net/plugin/slim/save_current_video.php',
        type: 'POST',
        dataType: 'html',
        cache: false,
        data: g_listobj.params,
        async: false
    }).responseText;
    //alert("この動画を一時保管しました。");
    return false;
}
console.log("▼関数定義終了▼　1464 関数定義 save_video_to_db(e) 終了");

/**************************************************************************
 * 関数定義
 * get_vid
 * 
 ***************************************************************************/
//プラグイン方式
//関数
function get_vid() {
    g_listobj.vid = g_listobj.thumbnail.split("/")[4];
    g_listobj.tt = g_listobj.title.slice(0, 20);
    return "https://favorite.tecoyan.net/slim/index.php?vid=" + g_listobj.vid + "&title=" + g_listobj.tt + "&url=";

}
/**************************************************************************
 * 関数定義
 * get_title
 * 
 ***************************************************************************/
//再生中のタイトルをコピー
//関数
function get_title(e) {
    g_listobj.tt = g_listobj.title;        //
    const temp = document.getElementById("temp");
    const input = document.createElement("input");
    temp.append(input);
    input.type = "text";
    input.value = g_listobj.tt;
    input.select();
    document.execCommand("copy");
    temp.removeChild(input);

}

/*******************************************************************
 * 関数
 * escape_html
 * 
 * 
 **********************************************************************/
//https://qiita.com/saekis/items/c2b41cd8940923863791
function escape_html(string) {
    if (typeof string !== 'string') {
        return string;
    }
    return string.replace(/[&'`"<>]/g, function (match) {
        return {
            '&': '&amp;',
            "'": '&#x27;',
            '`': '&#x60;',
            '"': '&quot;',
            '<': '&lt;',
            '>': '&gt;'
        }[match];
    });
}
/******************************************************************
 * 関数
 * get_extid
 *
 *******************************************************************/
function get_extid(pname) {
    var param = {
        pname: pname
    };
    g_data = $.ajax({
        url: 'https://common.tecoyan.net/plugin/slim/get_extension_id.php',
        type: 'POST',
        dataType: 'html',
        cache: false,
        data: param,
        async: false
    }).responseText;
    return g_data;
}


/*
 * async/await関数
 * get_g_tabs_Info()
 * 対象のタブのg_tabs_Infoデータを取得
 * 
 */
async function get_g_tabs_Info(tabId) {
    let l_p1 = new Promise((resolve, reject) => {
        //alert("get_g_tabs_Info TABS_INFO送信");
        console.log("▼操作卓▼　1609 get_g_tabs_Info TABS_INFO送信");
        chrome.runtime.sendMessage({data: 'TABS_INFO', content: {}}, function (msg) {
            //      
            //alert("get_g_tabs_Info(tabId) " + msg[0]['ico']);
            //対象タブのデータ
            let l_dd;
            $.each(msg, (i, val) => {
                if (val['tabId'] === tabId) {
                    l_dd = val;

                }

            });
            resolve(l_dd);

        });

    });
    return await l_p1;
}
//
//get_g_tabs_Info().then((Info) => {
//    //Infoデータを
//    console.log("操作卓▼　▼　1632 g_tabs_Info " + g_tabs_Info['ico']);
//    g_tabs_Info = Info;
//
//});

/**************************************************************
 * ステータスを更新(タブ毎)
 * オブジェクトデータ
 * 1を除き0から5まではtabs.query()で取得し、6,7はiframeプレーヤーから
 * 取得
 * {0:ico,1:speaker,2:url,3:タイトル,4:tabId,5:frameId,6:曲名,7:thumbnail}
 * 更新処理
 * 現在のステータスを取得して、引数のエントリーデータ(tabId)と比較
 * 一致　更新
 * 不一致　そのまま
 * tabIdが''ならばエントリーを削除
 ***************************************************************/
function status_display(content) {
    //content = {"tabId": "",fameId": "","music_class":"","thumbnail":""}  
    //alert(content['tabId']);

    //$(".video_tab")[0].cells[6].innerText
    let l_video_tab = $(".video_tab");
    /*
     *エントリーにtabIdがなければ削除 
     *contentと一致すれば、入れ替え
     *一致しなければ、追加
     */

    let l_dd = [];
    let l_aa = {};
    //現行データの各エントリーをチェック
    $.each(l_video_tab, (i, val) => {
        //tabId
        if (val.cells[4].innerText !== '') {
            //tabIdあり
            if (val.cells[4].innerText === content['tabId']) {
                //入れ替え
                //val.cells[].innerText
                //0:ico,1:speaker,2:url,3:タイトル,4:tabId,5:frameId,6:曲名,7:thumbnail
                $.each(val.cells, (j, val1) => {
                    l_aa[j] = val1.innerText;

                });
                l_dd.push(l_aa);
            }
            else {
                //不一致ならば、そのまま挿入
                l_dd.push(content);
            }
        }
        else {
            //tabIdなし
            l_dd.push(content);


        }

    });

}
/*******************************************************************
 *関数 display_status_default(content)
 *説明 ステータスを表示　
 *パラメーター　content  
 ********************************************************************/
function display_status_default(content) {
    //先に現在の状態をチェック
    //タブIdが一致するエントリーを更新、その他はそのまま
    /*
     * タブIdがなければ削除、
     */
    let l_dd = [];
    $.each(content, (i, val) => {
        l_dd.push(val);
    });
    let l_params = {
        //dd: dd,
        content: l_dd
    };
    let l_data = $.ajax({
        url: 'https://favorite.tecoyan.net/slim/menu_detail_status_update.php',
        type: 'POST',
        dataType: 'html',
        cache: false,
        data: l_params,
        async: false
    }).responseText;
    $("#detail_status").html(l_data);
    $(".video_tab").css("font-weight", "bold");
    //

}



console.log("▼操作卓▼　1742 関数定義終了");
console.log("▼操作卓▼　1743 スクリプトの最後");
