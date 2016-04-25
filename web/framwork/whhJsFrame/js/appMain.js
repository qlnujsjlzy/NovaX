/**
 * Created by wangzheng on 16/4/7.
 */

App.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
}).constant('', {

}).controller('loginPopCtrl', ['$scope', '$rootScope', 'loginService', '$state', '$timeout', function ($scope, $rootScope, loginService, $state, $timeout) {
    //****************************************登录弹出框的controller********************************************
    $scope.userInfo = {
        "username": "",
        "password": "",
        "passwordCache": false
    };

    $scope.keyLogin = function($event){
        if($event.code == "Enter"){
            $scope.login();
        }
    }
    $scope.login = function () {

        loginService.doLogin($scope)
            .then(function loginSuccess(loginInfo) {

                $rootScope.login_info = loginInfo;
                $rootScope.login_info.loginUserIconShow = true;


                //界面数据模型绑定   界面数据模型的变更 肯定要在scope里面做 当然不能放在service里面去
                $scope.loginMessage = loginInfo.message;
                $scope.errorBoxShow = false;
                $scope.successBoxShow = true;


                //返回加载菜单的promis  这个promis会在下一个then中被处理
                return loginService.doGetMenu();

            }, function loginError(loginFailReson) {

                $scope.loginMessage = loginFailReson;
                $scope.errorBoxShow = true;
                $scope.successBoxShow = false;


            }).then(function menuSuccess(menuData) {  //第二个then 用于菜单加载函数的promis
            //菜单数组存好了 准备留着在后面构造模板
            $rootScope.login_info.user_menu = menuData;

            //创建HTML
            var menuHTML = loginService.createMenuHtml(menuData);
            $rootScope.login_info.menuHTML = menuHTML;

            var timeout;
            timeout = $timeout(function () {

                if (timeout) {
                    $timeout.cancel(timeout);
                }

                $scope.errorBoxShow = false;
                $scope.successBoxShow = false;
                //关闭登录窗口
                $rootScope.loginViewWindow.close();

                //缓存登录信息
                window.sessionStorage.setItem("APP_USER_LOGIN_CACHE_LOLITA",JSON.stringify($rootScope.login_info))

                //转到登录页面
                $state.go('main.init');

            }, 1000);


        })
    }

    $scope.reset = function () {
        $scope.userInfo = undefined;
        $scope.password = "";
        $scope.passwordCache = false;
    }

}]).controller('mainAppCtrl', ['$scope', '$rootScope', 'loginService', '$state', function ($scope, $rootScope, loginService, $state) {
    //****************************************app主界面的controller********************************************
    //退出登录
    $scope.logout = function () {
        loginService.logout().then(function successLogout() {
            //服务器端session清空
            $rootScope.login_info = null;


            //sessionStorage 清空
            window.sessionStorage.removeItem("APP_USER_LOGIN_CACHE_LOLITA");


            //$state.go('main.welcome');//这样不行 因为当前state本来就是welcome 不会触发事件的
            //$rootScope.loginUserIconShow = false;

            $state.go('main.login');//转到登录页面

        });
    }

    $scope.ifLogin = function () {
        loginService.ifLogin();
    }

}]);



//****************************************登录相关的service********************************************
App.service('loginService', ['$rootScope', '$http', '$timeout', '$state', '$q', function ($rootScope, $http, $timeout, $state, $q) {

    var loginService = {};

    loginService.doLogin = function (logInCtrlScope) {
        logInCtrlScope.errorBoxShow = false;
        logInCtrlScope.successBoxShow = false;

        var loginDefer = $q.defer();

        $http({
            method: 'POST',
            url: "loginServcie/login.json",
            data: logInCtrlScope.userInfo
        }).success(function (data, status, headers, config) {
            if (data.loginSuccess) {
                loginDefer.resolve(data);
            } else {
                loginDefer.reject(data.message);
            }
        }).error(function (data, status, headers, config) {
            loginDefer.reject("登录失败 " + status + " 错误");
        });

        return loginDefer.promise;
    }


    loginService.doGetMenu = function () {
        var menuDefer = $q.defer();

        //取菜单数据
        $http({
            method: 'POST',
            url: "loginServcie/getUserMenu.json"
        }).success(function (data, status, headers, config) {
            menuDefer.resolve(data.main);
        });
        return menuDefer.promise;
    }


    loginService.createMenuHtml = function (menuData) {

        var menu = menuData;

        // 这个menu是一个平面的数组 没有办法用递归直接来拼接字符串的 首先要基于这个数组 自己来构建一个树形对象
        var menuTree = [];

        // 把一个item 放到属于他的parent下面去
        for (var i = 0; i < menu.length; i++) {
            menu[i].items = [];
        }

        //第一步 找出顶部节点们
        for (var i = 0; i < menu.length; i++) {
            var ifhas = false;
            for (var j = 0; j < menu.length; j++) {
                if (menu[i].parentId == menu[j].moduleId) {
                    ifhas = true;
                    break;
                }
            }
            if (!ifhas) {
                menuTree.push(menu[i]);
            }
        }


        // 现在 menuTree 里面全部是顶层节点了  开始给每个节点设置subItem  参数是上部的item  我需要递归
        var setSubItems = function (item) {
            if (item.isLeaf == '是') {
                return;
            } else {
                for (var i = 0; i < menu.length; i++) {
                    if (menu[i].parentId == item.moduleId) {
                        item.items.push(menu[i]);
                        setSubItems(menu[i]);
                    }
                }
            }
        }
        for (var i = 0; i < menuTree.length; i++) {
            setSubItems(menuTree[i]);
        }

        //现在 menuTree就是一个树形结构了  可以开始拼接html
        var html2="";
        //html2 = '<section class="sidebar">';
        //html2 += '<ul class="sidebar-menu">';


        function createHTMLByItem(item) {
            if (item.isLeaf == '否') {
                html2 += '<li class="treeview">' +
                    '<a href="">' +
                    '<i class="fa fa-folder-o"></i> <span>' + item.moduleName + '</span> ' +
                    '<i class="fa fa-angle-left pull-right"></i> ' +
                    '</a> ';
                html2 += '<ul class="treeview-menu">';

                for (var j = 0; j < item.items.length; j++) {
                    //进一步解析
                    createHTMLByItem(item.items[j]);
                }
                html2 += '</ul></li>';
            } else {
                html2 += '<li><a href="#/main/init/' + item.moduleUrl + '"><i class="fa fa-sticky-note-o"></i>' + item.moduleName + '</a></li>';
            }
        }

        for (var i = 0; i < menuTree.length; i++) {
            createHTMLByItem(menuTree[i]);
        }
        //html2 += '</ul>';
        //html2+="</section>";

        return html2;
    }


    //是否登录?
    loginService.ifLogin = function () {

        //if(!ifLoginCheck){
        //    return true;
        //}
        if ($rootScope.login_info) {
            return true;
        } else {
            return false;
        }
    }

    //退出登录
    loginService.logout = function () {
        var defer = $q.defer();
        $http({
            method: 'POST',
            url: "loginServcie/logout.json",
            date: $rootScope.login_info
        }).success(function (data, status, headers, config) {
            defer.resolve();
        });
        return defer.promise;
    }


    return loginService;
}]);




App.service('whhHttpService', ['$rootScope', '$http', function ($rootScope, $http) {

    var whhHttpService = {};

    whhHttpService.request = function(url,para){
        //进行http请求
        return $http({
            url: url,
            method: 'POST',
            data:para,
            responseType:"json",
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    whhHttpService.postRequest = function(url,para){
        //进行http请求
        return $http({
            url: url,
            method: 'POST',
            data:para,
            responseType:"json",
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    whhHttpService.getRequest = function(url,para){
        //进行http请求
        return $http({
            url: url,
            method: 'GET',
            data:para,
            responseType:"json",
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }

    return whhHttpService;

}]);
App.service('whhDateService', ['$rootScope', '$filter', function ($rootScope, $filter) {

    var whhDateService = {};

    whhDateService.dateToString = function(date){
         return $filter('date')(date, 'yyyy-MM-dd');
    }
    whhDateService.dateTimeToString = function(date){
        return $filter('date')(date, 'yyyy-MM-dd HH:mm:ss');
    }


    whhDateService.StringToDateTime = function(dateStr){
        var endLogTimeDate = new Date(Date.parse(dateStr.replace(/-/g, "/")));
        return endLogTimeDate;
    }
    whhDateService.StringToDate = function(dateStr){
        var endLogTimeDate = new Date(Date.parse(dateStr.replace(/-/g, "/")));
        return endLogTimeDate;
    }




    return whhDateService;

}]);
//****************************************用于捕获后台异常的拦截器********************************************
//创建拦截器 用来捕获后台异常
App.factory('appExceptionInterceptor', ['$rootScope', function ($rootScope) {
    var interceptor = {
        response: function (response) {
            if(response.data){
                if(response.data.errorInfo){
                    $rootScope.MessageWindow.content(response.data.errorInfo);
                    $rootScope.blockPage();
                    $rootScope.MessageWindow.open();
                    $rootScope.MessageWindow.center();
                }
            }

            //if (response.status != 200) {
            //    var reg1 = new RegExp("com\.whhercp\.lang\.exception\.AppException");
            //    var res1 = reg1.test(response.data);
            //    if (res1.length >= 1) {
            //        //说明是AppException
            //        //对数据做xml解析 取出真正的错误信息
            //    } else {
            //        //说明是普通错误 那么久全部显示出来
            //    }
            //
            //    //if(response.data)
            //    $rootScope.MessageWindow.content(response.data);
            //    $rootScope.blockPage();
            //    $rootScope.MessageWindow.open();
            //    $rootScope.MessageWindow.center();
            //}

            return response;
        },
        responseError: function (response) {
            if (response.status != 200) {
                var reg1 = new RegExp("com\.whhercp\.lang\.exception\.AppException");
                var res1 = reg1.test(response.data);
                if (res1.length >= 1) {
                    //说明是AppException
                    //对数据做xml解析 取出真正的错误信息
                } else {
                    //说明是普通错误 那么久全部显示出来
                }

                //if(response.data)
                $rootScope.MessageWindow.content(response.data);
                $rootScope.blockPage();
                $rootScope.MessageWindow.open();
                $rootScope.MessageWindow.center();
            }

            return response;
        }
    };
    return interceptor;
}]);
App.factory('httpBlockUIInterceptor',['$rootScope',function($rootScope){

    // 需要屏蔽用户操作的http请求 拦截下来 开启blockui遮罩
    var interceptor = {
        request: function (config) {
            //不能什么请求都遮罩,比如一些下拉框等控件在加载数据的时候 就不应该出现遮罩 这个我们需要在header里面放一个参数来进行区分
            if(config.headers.needUiBlock){
                $rootScope.blockPage();
            }
            return config;
        },
        response:function(response){
            if(response.config.headers.needUiBlock){
                $rootScope.unBlockPage();
            }
            return response;
        },
        requestError: function (config) {
            if(config.headers.needUiBlock){
                $rootScope.unBlockPage();
            }
            return config;
        },
        responseError: function (response) {
            if(response.config.headers.needUiBlock){
                $rootScope.unBlockPage();
            }
            return response;
        }
    }

    return interceptor


}]);
App.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('httpBlockUIInterceptor');
    $httpProvider.interceptors.push('appExceptionInterceptor');

}]);





















