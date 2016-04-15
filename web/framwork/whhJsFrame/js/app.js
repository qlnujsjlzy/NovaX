/**
 * Created by wangzheng on 16/4/9.
 */
//创建模块
var App = angular.module('app', ['ui.router']);



//初始化
App.run(function ($rootScope, loginService, $state) {

    //初始化默认参数到rootScope
    $rootScope.appConfig={};
    $rootScope.appConfig.theme = theme;
    $rootScope.appConfig.pchostname = pchostname;
    $rootScope.appConfig.layout = layout;


    //****************************************登录用户信息cache********************************************
    //先从localstorage里面做检测 是否存储了登录用户数据
    var userCache = window.sessionStorage.getItem("APP_USER_LOGIN_CACHE_LOLITA");
    if(userCache){
        $rootScope.login_info = JSON.parse(userCache);
    }


    //****************************************blockUI相关********************************************
    $rootScope.blockPage = function () {
        //$.blockUI({ css: { backgroundColor: '#f00', color: '#fff'} });
        $.blockUI({
                overlayCSS: {
                    backgroundColor: '#000',
                    opacity: 0.6//,
                    //cursor: 'wait'
                }
            }
        );
    }
    $rootScope.unBlockPage = function () {
        $.unblockUI();
    }



    //****************************************访问权限控制 登录验证********************************************
    // 监听state 防止用于直接用url进入内部的state
    $rootScope.$on('$stateChangeStart',
        function (event, toState, toParams, fromState, fromParams) {
            if (!loginService.ifLogin() && toState.name != 'main.login') {
                $state.go('main.login');
                event.preventDefault(); //这个很重要
                // 比如说 访问 #/mian  会在main这个state上捕获一次 然后还会在下一层#/main/login 这个state上再捕获一次   加上#/main/login自己的 就会捕获3次
            }
        })


    //****************************************登录弹出框 和 message弹出框********************************************
    //全局用的Exception弹出框
    $("#MessageWindow").kendoWindow({
        width: "615px",
        title: "哎呀 出错啦! 这里是错误信息哦!",
        resizable: false,
        //position: {
        //    top: 100, // or "100px"
        //    left: "30%"
        //},
        pinned: true,
        actions: ["Minimize", "Maximize", "Close"],
        visible: false,
        draggable: false,
        height: 400,
        animation: {
            open: {
                duration: 100
            }
        },
        close: function (e) {
            $rootScope.unBlockPage();
            $rootScope.MessageWindow.content("");//一定要清楚掉内容 否则错误页面的css会残留在你的DOM上面 扰乱你现有的页面
        }
        //content: "../content/web/window/ajax/ajaxContent.html",
        //close: onClose
    });
    $rootScope.MessageWindow = $("#MessageWindow").data("kendoWindow");
    $rootScope.MessageWindow.close();


    $("#loginViewWindow").kendoWindow({
        width: "550px;",
        title: "请登录",
        resizable: false,
        actions: [],
        pinned: true,
        visible: false,
        draggable: false,
        scrollable: false,
        maxHeight: 400,
        animation: {
            open: {
                duration: 100
            }
        },
        close: function (e) {
            //$rootScope.loginViewWindow.content("");//一定要清楚掉内容 否则错误页面的css会残留在你的DOM上面 扰乱你现有的页面
        }
    });
    $rootScope.loginViewWindow = $("#loginViewWindow").data("kendoWindow");
    $rootScope.loginViewWindow.close();


})





//生成UID
Math.uidFast = function() {
    var CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'.split('');
    var chars = CHARS, uuid = new Array(36), rnd=0, r;
    for (var i = 0; i < 36; i++) {
        if (i==8 || i==13 ||  i==18 || i==23) {
            uuid[i] = '-';
        } else if (i==14) {
            uuid[i] = '4';
        } else {
            if (rnd <= 0x02) rnd = 0x2000000 + (Math.random()*0x1000000)|0;
            r = rnd & 0xf;
            rnd = rnd >> 4;
            uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r];
        }
    }
    return uuid.join('');
};