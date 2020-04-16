
/*初期値 */
var view_count_plus_num = 0, chart_num = 0, view_count_plus_list = [], config = {}, cash_url, main_loop_count_num = 0;
var message_count, last_get_message_id, superchat_count = 0, last_get_superchat_id, last_moderator_id;
var canvas_flag = {}, canvas_height = {}, content_text_length;
var one_time_flag = false;
cash_url = location.href;
/*メインループ実行 */
page_reload_check();
/*メインループ*/
function page_reload_check() {
    comment_view();
    /*配信コメント欄がないなら除外 */
    if ($('#chatframe').contents().length == 0) {
        setTimeout(page_live_check, 500);
        return;
    }
    /*urlチェック*/
    if (cash_url == location.href) {
        cash_url = location.href;
        main_loop_count_num++;
        if (main_loop_count_num == 10) {
            main_loop_count_num = 0;
            setTimeout(watch_main_loop, 0);
        }
    } else {
        cash_url = location.href;
        setTimeout(canvas_reset, 0);
        return;
    }

    setTimeout(page_reload_check, 500);




    /*配信コメント*/

    i = -1;
    while (true) {
        last_message_id = $('#chatframe').contents().find('yt-live-chat-text-message-renderer').eq(i).attr('id');
        if (last_message_id == null) {
            message_count = 0;
            break;
        }
        if (last_message_id == last_get_message_id) {
            break;
        }
        message_count++;
        i--;
        moderator_id = $('#chatframe').contents().find('#author-name.moderator.yt-live-chat-author-chip').eq(-1).parent().parent().parent().attr('id');
        if (moderator_id == null) {
            last_moderator_id = moderator_id;
        } else if (last_moderator_id != moderator_id) {
            moderator_img = $('#chatframe').contents().find('#author-name.moderator.yt-live-chat-author-chip').eq(-1).parent().parent().parent().find('#img').attr('src');
            moderator_time = $('#chatframe').contents().find('#author-name.moderator.yt-live-chat-author-chip').eq(-1).parent().parent().parent().find('#timestamp').text();
            moderator_name = $('#chatframe').contents().find('#author-name.moderator.yt-live-chat-author-chip').eq(-1).parent().parent().parent().find('#author-name').text();;
            moderator_message = $('#chatframe').contents().find('#author-name.moderator.yt-live-chat-author-chip').eq(-1).parent().parent().parent().find('#message').text();;
            $('#youtube_moderator_message').prepend('<div id="youtube_moderator_message_box" style="font-size: 13px;border-radius: 50%;">' +
                '<img class="img" alt="" height="24" width="24" src="' + moderator_img + '">' +
                '<span style="color: rgba(17,17,17,0.4);font-size: 11px;margin:3px;">' + moderator_time + '</span>' +
                '<span style="color: rgba(17,17,17,0.6);margin:3px;">' + moderator_name + '</span>' +
                '<p style="color: #111111;">' + moderator_message + '</p>' +
                "</div>");

            if ($("div#youtube_moderator_message_box").eq(5).html() != null) {
                $("div#youtube_moderator_message_box").eq(5).remove();

            }

            last_moderator_id = moderator_id;
        }

    }
    last_get_message_id = $('#chatframe').contents().find('yt-live-chat-text-message-renderer').eq(-1).attr('id');
    function last_superchat_jpy(num, ratio, superchat_count) {
        num = /(\d|,)+/.exec(num);
        num = num[0].replace(/,/g, "");
        return Number(superchat_count) + (Number(num) * ratio);
    }
    /*配信スパチャ */
    i = -1;
    while (true) {
        last_superchat = $('#chatframe').contents().find('div#purchase-amount').eq(i).html();
        last_superchat_id = $('#chatframe').contents().find('yt-live-chat-paid-message-renderer').eq(i).attr('id');

        if (last_superchat_id == null) {
            break;
        }
        if (last_superchat_id == last_get_superchat_id) {
            last_get_superchat_id = last_superchat_id;
            break;
        }
        /*日本円変換 */
        if (last_superchat.match(/￥/)) {
            superchat_count = last_superchat_jpy(last_superchat, 1, superchat_count);
        } else if (last_superchat.match(/₩/)) {
            superchat_count = last_superchat_jpy(last_superchat, 0.1, superchat_count);
        } else if (last_superchat.match(/£/)) {
            superchat_count = last_superchat_jpy(last_superchat, 135, superchat_count);
        } else if (last_superchat.match(/RUB/)) {
            superchat_count = last_superchat_jpy(last_superchat, 1.5, superchat_count);
        } else if (last_superchat.match(/HK/)) {
            superchat_count = last_superchat_jpy(last_superchat, 13, superchat_count);
        } else if (last_superchat.match(/NT/)) {
            superchat_count = last_superchat_jpy(last_superchat, 3, superchat_count);
        } else if (last_superchat.match(/CA/)) {
            superchat_count = last_superchat_jpy(last_superchat, 77, superchat_count);
        } else if (last_superchat.match(/^\$/)) {
            superchat_count = last_superchat_jpy(last_superchat, 110, superchat_count);
        }
        i--;
    }
    last_get_superchat_id = $('#chatframe').contents().find('yt-live-chat-paid-message-renderer').eq(-1).attr('id');
}


/*メイン処理 */
function watch_main_loop() {

    /*Canvasの初期値 */
    function config_reset(label) {
        return {
            type: 'line',
            data: {
                labels: [],
                datasets: [
                    {
                        label: label,
                        data: [],
                        borderColor: "rgba(255,0,0,1)",
                        backgroundColor: "rgba(0,0,0,0)"
                    }
                ],
            },
            options: {
                responsive: true,
                title: {
                    display: false,
                    text: 'youtubelive'
                },
                tooltips: {
                    mode: 'index',
                    intersect: false,
                },
                hover: {
                    mode: 'nearest',
                    intersect: true
                }
            }
        }
    }
    /*色々取得 */
    var view_count = $(".view-count").html();
    var like = $("a.yt-simple-endpoint.style-scope.ytd-toggle-button-renderer > yt-formatted-string#text").html();
    var bad = $("a.yt-simple-endpoint.style-scope.ytd-toggle-button-renderer > yt-formatted-string#text").eq(1).html();
    var result = /(\d|,)+/.exec(view_count);
    /*5×12秒でリセット */
    if (view_count_plus_num >= 12) {
        view_count_plus_num = 0;
    }
    /*取得できてなかったら実行しない */
    if (result != null) {
        if (one_time_flag == false) {
            one_time_flag = true;
            /*1回のみ実行 */
            if (view_count.match(/回視聴/)) {
                /*もしラアーカイブなら */
                /*グラフ */
                $('ytd-live-chat-frame#chat').after(
                    '<div class="youtube_live_box">' +
                    '<div id="youtube_moderator_message">' +
                    '</div>' +
                    '<canvas id="myLineChart4"></canvas>' +
                    '<canvas id="myLineChart5"></canvas>' +

                    '<p>' +
                    '<div class="canvas_btn" style="opacity:0.5" id="canvas_btn4">コメント</div>' +
                    '<div class="canvas_btn" style="opacity:0.5" id="canvas_btn5">スパチャ</div>' +
                    '<div class="canvas_btn" id="canvas_btn_del">消去</div>' +
                    '</p></div>');

                var ctx = document.getElementById("myLineChart4");
                config4 = config_reset("コメント");
                window.myLineChart4 = new Chart(ctx, config4);
                var ctx = document.getElementById("myLineChart5");
                config5 = config_reset("スパチャ");
                window.myLineChart5 = new Chart(ctx, config5);

                btn_click_set(4);
                btn_click_set(5);
                function btn_click_set(canvas_num) {
                    $('#canvas_btn' + canvas_num).click(function () {
                        if (canvas_flag[canvas_num]) {
                            $.Deferred(function (deferredAnim) {
                                deferredAnim.then(function () {
                                    $("#myLineChart" + canvas_num).animate({
                                        "height": canvas_height[canvas_num]
                                    }, 500);
                                    $("#canvas_btn" + canvas_num).animate({
                                        "opacity": "0.5"
                                    }, 500);
                                })
                            }).resolve();
                            canvas_flag[canvas_num] = false;
                            setTimeout(function () {
                                $('#myLineChart' + canvas_num).removeClass('display_none');
                            }, 0);
                        } else {
                            canvas_height[canvas_num] = $("canvas#myLineChart" + canvas_num).height();
                            $.Deferred(function (deferredAnim) {
                                deferredAnim.then(function () {
                                    $("#myLineChart" + canvas_num).animate({
                                        "height": "0"
                                    }, 500);
                                    $("#canvas_btn" + canvas_num).animate({
                                        "opacity": "1"
                                    }, 500);
                                })
                            }).resolve();
                            canvas_flag[canvas_num] = true;
                            setTimeout(function () {
                                $('#myLineChart' + canvas_num).addClass('display_none');
                            }, 470);
                        }
                    });
                }
                $('#canvas_btn_del').click(function () {

                    if ($(".youtube_live_box").html() != null) {
                        window.myLineChart4.destroy();
                        config4 = config_reset("コメント");
                        window.myLineChart4 = new Chart(document.getElementById("myLineChart4"), config4);
                        window.myLineChart5.destroy();
                        config5 = config_reset("スパチャ");
                        window.myLineChart5 = new Chart(document.getElementById("myLineChart5"), config5);
                    }
                });

                i = 4;
                while (i <= 5) {
                    canvas_num = i;
                    if (canvas_flag[canvas_num]) {
                        $('#myLineChart' + canvas_num).addClass('display_none');
                        $("#canvas_btn" + canvas_num).css("opacity", "1");
                        $("#myLineChart" + canvas_num).css("height", "0");
                    } else {
                        $('#myLineChart' + canvas_num).removeClass('display_none');
                        $("#canvas_btn" + canvas_num).css("opacity", "0.5");
                        $("#myLineChart" + canvas_num).css("height", canvas_height[canvas_num]);
                    }
                    i++;
                }

            } else {
                /*配信なら */
                $('.view-count').append('<span id="view-count-plus"> • 処理中</span>');
                $('ytd-live-chat-frame#chat').after(
                    '<div class="youtube_live_box">' +
                    '<div id="youtube_moderator_message">' +
                    '</div>' +
                    '<canvas id="myLineChart"></canvas>' +
                    '<canvas id="myLineChart2"></canvas>' +
                    '<canvas id="myLineChart3"></canvas>' +
                    '<canvas id="myLineChart4"></canvas>' +
                    '<canvas id="myLineChart5"></canvas>' +

                    '<p>' +
                    '<div class="canvas_btn" style="opacity:0.5" id="canvas_btn">視聴数</div>' +
                    '<div class="canvas_btn" style="opacity:0.5" id="canvas_btn2">高評価</div>' +
                    '<div class="canvas_btn" style="opacity:0.5" id="canvas_btn3">低評価</div>' +
                    '<div class="canvas_btn" style="opacity:0.5" id="canvas_btn4">コメント</div>' +
                    '<div class="canvas_btn" style="opacity:0.5" id="canvas_btn5">スパチャ</div>' +
                    '<div class="canvas_btn" id="canvas_btn_del">消去</div>' +
                    '</p></div>');
                /*chart表示 */
                var ctx = document.getElementById("myLineChart");
                config = config_reset("視聴数");
                window.myLineChart = new Chart(ctx, config);
                var ctx = document.getElementById("myLineChart2");
                config2 = config_reset("高評価");
                window.myLineChart2 = new Chart(ctx, config2);
                var ctx = document.getElementById("myLineChart3");
                config3 = config_reset("低評価");
                window.myLineChart3 = new Chart(ctx, config3);
                var ctx = document.getElementById("myLineChart4");
                config4 = config_reset("コメント");
                window.myLineChart4 = new Chart(ctx, config4);
                var ctx = document.getElementById("myLineChart5");
                config5 = config_reset("スパチャ");
                window.myLineChart5 = new Chart(ctx, config5);


                /*ボタンセット */
                btn_click_set("");
                btn_click_set(2);
                btn_click_set(3);
                btn_click_set(4);
                btn_click_set(5);
                function btn_click_set(canvas_num) {
                    $('#canvas_btn' + canvas_num).click(function () {
                        if (canvas_flag[canvas_num]) {
                            $.Deferred(function (deferredAnim) {
                                deferredAnim.then(function () {
                                    $("#myLineChart" + canvas_num).animate({
                                        "height": canvas_height[canvas_num]
                                    }, 500);
                                    $("#canvas_btn" + canvas_num).animate({
                                        "opacity": "0.5"
                                    }, 500);
                                })
                            }).resolve();
                            canvas_flag[canvas_num] = false;
                            setTimeout(function () {
                                $('#myLineChart' + canvas_num).removeClass('display_none');
                            }, 0);
                        } else {
                            canvas_height[canvas_num] = $("canvas#myLineChart" + canvas_num).height();
                            $.Deferred(function (deferredAnim) {
                                deferredAnim.then(function () {
                                    $("#myLineChart" + canvas_num).animate({
                                        "height": "0"
                                    }, 500);
                                    $("#canvas_btn" + canvas_num).animate({
                                        "opacity": "1"
                                    }, 500);
                                })
                            }).resolve();
                            canvas_flag[canvas_num] = true;
                            setTimeout(function () {
                                $('#myLineChart' + canvas_num).addClass('display_none');
                            }, 470);
                        }
                    });
                }
                /*消去ボタン */
                $('#canvas_btn_del').click(function () {

                    if ($(".youtube_live_box").html() != null) {
                        window.myLineChart.destroy();
                        config = config_reset("視聴数");
                        window.myLineChart = new Chart(document.getElementById("myLineChart"), config);
                        window.myLineChart2.destroy();
                        config2 = config_reset("高評価");
                        window.myLineChart2 = new Chart(document.getElementById("myLineChart2"), config2);
                        window.myLineChart3.destroy();
                        config3 = config_reset("低評価");
                        window.myLineChart3 = new Chart(document.getElementById("myLineChart3"), config3);
                        window.myLineChart4.destroy();
                        config4 = config_reset("コメント");
                        window.myLineChart4 = new Chart(document.getElementById("myLineChart4"), config4);
                        window.myLineChart5.destroy();
                        config5 = config_reset("スパチャ");
                        window.myLineChart5 = new Chart(document.getElementById("myLineChart5"), config5);
                    }
                });
                /*ボタンの表示の継承 */
                i = 0;
                while (i <= 5) {
                    if (i == 0) {
                        canvas_num = "";
                    } else {
                        canvas_num = i;
                    }
                    if (canvas_flag[canvas_num]) {
                        $('#myLineChart' + canvas_num).addClass('display_none');
                        $("#canvas_btn" + canvas_num).css("opacity", "1");
                        $("#myLineChart" + canvas_num).css("height", "0");
                    } else {
                        $('#myLineChart' + canvas_num).removeClass('display_none');
                        $("#canvas_btn" + canvas_num).css("opacity", "0.5");
                        $("#myLineChart" + canvas_num).css("height", canvas_height[canvas_num]);
                    }
                    i++;
                }
            }
        }
        /*ここからグラフ更新関係*/

        /*現在時間取得 */
        var now = new Date();
        var Hour = now.getHours();
        var Min = now.getMinutes();
        var Sec = now.getSeconds();
        if (Hour < 10) Hour = "0" + Hour;
        if (Min < 10) Min = "0" + Min;
        if (Sec < 10) Sec = "0" + Sec;

        if (!view_count.match(/回視聴/)) {
            /*配信なら */
            result = result[0].replace(/,/g, "");
            if (view_count_plus_list[view_count_plus_num] != null) {

                var view_count_plus = result - view_count_plus_list[view_count_plus_num];
                if (view_count_plus >= 0) {
                    view_count_plus = "+" + view_count_plus;
                }
                $('#view-count-plus').html(" • 推移 " + view_count_plus);
            }
            view_count_plus_list[view_count_plus_num] = result;
            config.data.labels.push(String(Hour + ":" + Min + ":" + Sec));
            config.data.datasets.forEach(function (dataset) {
                dataset.data.push(result);
            });
            window.myLineChart.update();

            config2.data.labels.push(String(Hour + ":" + Min + ":" + Sec));
            config2.data.datasets.forEach(function (dataset) {
                dataset.data.push(like);
            });
            window.myLineChart2.update();

            config3.data.labels.push(String(Hour + ":" + Min + ":" + Sec));
            config3.data.datasets.forEach(function (dataset) {
                dataset.data.push(bad);
            });
            window.myLineChart3.update();
        }
        /*配信とアーカイブ */
        config4.data.labels.push(String(Hour + ":" + Min + ":" + Sec));
        config4.data.datasets.forEach(function (dataset) {
            dataset.data.push(message_count);
        });
        window.myLineChart4.update();

        config5.data.labels.push(String(Hour + ":" + Min + ":" + Sec));
        config5.data.datasets.forEach(function (dataset) {
            dataset.data.push(superchat_count);
        });
        window.myLineChart5.update();

        view_count_plus_num++;
        message_count = 0;
    }
}

/*全てをリセット */
function canvas_reset() {
    if ($(".youtube_live_box").html() != null) {

        if ($("#myLineChart").html() != null) {
            window.myLineChart.destroy();
            window.myLineChart2.destroy();
            window.myLineChart3.destroy();
            $("#view-count-plus").remove();
        }
        window.myLineChart4.destroy();
        window.myLineChart5.destroy();
        $(".youtube_live_box").remove();
    }

    $(".ytp-progress-bar-padding").empty();
    $(".chapter-title").remove();

    $("a#import_btn").each(function () {
        $("a#import_btn").remove();
    });


    one_time_flag = false;
    view_count_plus_num = 0;
    superchat_count = 0;
    view_count_plus_list = [];
    main_loop_count_num = 0
    setTimeout(page_live_check, 500);
}
/*動画の以外のページのときの処理*/
function page_live_check() {
    if (location.href.match(/watch/)) {
        comment_view();
        if ($('#chatframe').contents().length == 1) {
            setTimeout(page_reload_check, 500);
            return;
        }
    }
    setTimeout(page_live_check, 500);
}


/*コメントチェック*/
function comment_view() {

    function video_length_time(now = false) {
        if (now) {
            video_time_get = $("span.ytp-time-current").text()
        } else {
            video_time_get = $("span.ytp-time-duration").text()
        }
        if (video_time_get.match(/\d+:\d+:\d+/)) {
            num = /(\d+):(\d+):(\d)/.exec(video_time_get);
            video_time = (num[1] * 60 * 60) + (num[2] * 60) + Number(num[3]);
        } else if (video_time_get.match(/\d+:\d+/)) {
            num = /(\d+):(\d+)/.exec(video_time_get);
            video_time = (num[1] * 60) + Number(num[2]);
        } else if (video_time_get.match(/\d+/)) {
            num = /(\d+)/.exec(video_time_get);
            video_time = Number(num[1]);
        }
        return video_time;
    }




    i = 0;
    max_time = 0;
    $(".ytp-progress-bar-padding").find(".chapter").each(function () {
        time = Number($(".ytp-progress-bar-padding").find(".chapter").eq(i).attr("time"));
        if (time < video_length_time(true) + 2) {
            if (time > max_time) {
                max_time = time;
            }
        }

        i++;
    });

    if ($("div[time='" + max_time + "']").attr("title") != null) {
        if ($(".chapter-title").find(p).text() != $("div[time='" + max_time + "']").attr("title")) {
            $(".chapter-title").remove();
            $("ytd-video-primary-info-renderer.style-scope.ytd-watch-flexy").prepend('<div class="chapter-title"><p>' + $("div[time='" + max_time + "']").attr("title") + '</p></div>');
        }
    }
    if ($("yt-formatted-string#content-text").length != content_text_length) {
        content_text_length = $("yt-formatted-string#content-text").length;

        i = 0;
        $("ytd-comment-renderer#comment>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").each(function () {
            if ($("ytd-comment-renderer#comment>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").eq(i).find("a.yt-simple-endpoint.style-scope.yt-formatted-string").eq(0).html() != null) {

                if ($("ytd-comment-renderer#comment>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").eq(i).parent().parent().parent().find("div#header-author").find("#import_btn").html() == null) {



                    $("ytd-comment-renderer#comment>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").eq(i).parent().parent().parent().find("div#header-author").append('<a class="yt-simple-endpoint style-scope yt-formatted-string" id="import_btn">インポート</a>');
                    import_btn_click_set(i);
                    function import_btn_click_set(i) {
                        $("ytd-comment-renderer#comment>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").eq(i).parent().parent().parent().find("div#header-author").find('a').click(
                            function () {
                                ii = 0;
                                $("ytd-comment-renderer#comment>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").eq(i).find("a.yt-simple-endpoint.style-scope.yt-formatted-string").each(function () {
                                    if ($("ytd-comment-renderer#comment>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").eq(i).find("a.yt-simple-endpoint.style-scope.yt-formatted-string").eq(ii).html() != null) {
                                        url = $("ytd-comment-renderer#comment>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").eq(i).find("a.yt-simple-endpoint.style-scope.yt-formatted-string").eq(ii).attr("href");
                                        var time = /(\d+)s$/.exec(url)[1];
                                        left = (time / video_length_time()) * 100;
                                        left = left + "%";
                                        $(".ytp-progress-bar-padding").append('<div class="chapter" title="' + $("ytd-comment-renderer#comment>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").eq(i).find("a.yt-simple-endpoint.style-scope.yt-formatted-string").eq(ii).next().text() + '" time="' + time + '" style="left:' + left + ';"><div class="arrow">▼</div></div>');

                                        $("ytd-comment-renderer#comment>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").eq(i).parent().parent().parent().find("div#header-author").find("#import_btn").css("display", "none");
                                        chapter_arrow_btn_hover_set($("ytd-comment-renderer#comment>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").eq(i).find("a.yt-simple-endpoint.style-scope.yt-formatted-string").eq(ii).next().text());
                                        function chapter_arrow_btn_hover_set(name) {
                                            $('.ytp-progress-bar-padding').find('.chapter').eq($('.chapter').children().length - 1).find(".arrow").hover(
                                                function () {
                                                    $(".ytp-left-controls").append('<span class="chapter-name">' + name + '</span>');
                                                }, function () {
                                                    $(".ytp-left-controls").find('.chapter-name').remove();
                                                }
                                            );
                                        }
                                    }
                                    ii++;
                                });
                            });
                    }
                }
            }

            ii = 0;


            $("ytd-comment-renderer#comment").eq(i).parent().find("ytd-comment-renderer.style-scope.ytd-comment-replies-renderer>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").each(function () {
                if ($("ytd-comment-renderer#comment").eq(i).parent().find("ytd-comment-renderer.style-scope.ytd-comment-replies-renderer>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").eq(ii).find("a.yt-simple-endpoint.style-scope.yt-formatted-string").eq(0).html() != null) {
                    if ($("ytd-comment-renderer#comment").eq(i).parent().find("ytd-comment-renderer.style-scope.ytd-comment-replies-renderer>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").eq(ii).parent().parent().parent().find("div#header-author").find("#import_btn").html() == null) {
                        iii = 0;
                        flag = false;
                        $("ytd-comment-renderer#comment").eq(i).parent().find("ytd-comment-renderer.style-scope.ytd-comment-replies-renderer>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").eq(ii).find("a.yt-simple-endpoint.style-scope.yt-formatted-string").each(function () {

                            url = $("ytd-comment-renderer#comment").eq(i).parent().find("ytd-comment-renderer.style-scope.ytd-comment-replies-renderer>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").eq(ii).find("a.yt-simple-endpoint.style-scope.yt-formatted-string").eq(iii).attr("href");
                            if (url != null) {
                                time = /(\d+)s$/.exec(url)[1];
                                if (time != null) {
                                    flag = true;
                                }
                            }
                            iii++;
                        });
                        if (flag == true) {
                            $("ytd-comment-renderer#comment").eq(i).parent().find("ytd-comment-renderer.style-scope.ytd-comment-replies-renderer>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").eq(ii).parent().parent().parent().find("div#header-author").append('<a class="yt-simple-endpoint style-scope yt-formatted-string" id="import_btn" style="font-size:10px;">インポート</a>');


                            import_btn_click_set(i, ii);
                        }
                        function import_btn_click_set(i, ii) {

                            $("ytd-comment-renderer#comment").eq(i).parent().find("ytd-comment-renderer.style-scope.ytd-comment-replies-renderer>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").eq(ii).parent().parent().parent().find("div#header-author").find('a#import_btn').click(

                                function () {
                                    iii = 0;
                                    $("ytd-comment-renderer#comment").eq(i).parent().find("ytd-comment-renderer.style-scope.ytd-comment-replies-renderer>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").eq(ii).find("a.yt-simple-endpoint.style-scope.yt-formatted-string").each(function () {

                                        if ($("ytd-comment-renderer#comment").eq(i).parent().find("ytd-comment-renderer.style-scope.ytd-comment-replies-renderer>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").eq(ii).find("a.yt-simple-endpoint.style-scope.yt-formatted-string").eq(iii).html() != null) {



                                            url = $("ytd-comment-renderer#comment").eq(i).parent().find("ytd-comment-renderer.style-scope.ytd-comment-replies-renderer>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").eq(ii).find("a.yt-simple-endpoint.style-scope.yt-formatted-string").eq(iii).attr("href");
                                            time = /(\d+)s$/.exec(url)[1];
                                            left = (time / video_length_time()) * 100;
                                            left = left + "%";
                                            $(".ytp-progress-bar-padding").append('<div class="chapter" title="' + $("ytd-comment-renderer#comment").eq(i).parent().find("ytd-comment-renderer.style-scope.ytd-comment-replies-renderer>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").eq(ii).find("a.yt-simple-endpoint.style-scope.yt-formatted-string").eq(iii).next().text() + '" time="' + time + '" style="left:' + left + ';"><div class="arrow">▼</div></div>');

                                            $("ytd-comment-renderer#comment").eq(i).parent().find("ytd-comment-renderer.style-scope.ytd-comment-replies-renderer>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").eq(ii).parent().parent().parent().find("div#header-author").find("#import_btn").css("display", "none");
                                            chapter_arrow_btn_hover_set($("ytd-comment-renderer#comment").eq(i).parent().find("ytd-comment-renderer.style-scope.ytd-comment-replies-renderer>div#body>div#main>ytd-expander#expander>div#content>yt-formatted-string#content-text").eq(ii).find("a.yt-simple-endpoint.style-scope.yt-formatted-string").eq(iii).next().text());
                                            function chapter_arrow_btn_hover_set(name) {
                                                $('.ytp-progress-bar-padding').find('.chapter').eq($('.chapter').children().length - 1).find(".arrow").hover(
                                                    function () {
                                                        $(".ytp-left-controls").append('<span class="chapter-name">' + name + '</span>');
                                                    }, function () {
                                                        $(".ytp-left-controls").find('.chapter-name').remove();
                                                    }
                                                );
                                            }
                                        }
                                        iii++;
                                    });
                                });
                        }




                    }
                }

                ii++;
            });

            i++;
        }

        );
    }
}