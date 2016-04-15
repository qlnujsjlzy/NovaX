/**
 * Created by wangzheng on 16/4/11.
 */

//全局参数
var pchostname = "localhost";//http://192.200.5.147
var theme = "red";//默认主题 blue,blue-light,yellow,yellow-light,green,green-light,purple,purple-light,red,red-light,black,black-light
var layout = "fixed";//布局

//配置路由
App.config(function ($stateProvider, $urlRouterProvider) {

    //如果没有匹配的路径 跳转到这个路径去
    //$urlRouterProvider.otherwise("main/init");

    $stateProvider.state('main', {
        url: "/main",
        views: {
            //"mainHeaderView@": {
            //    templateUrl: "framwork/whhJsFrame/template/mainHeaderView.html"
            //},
            "mainSideBarView@": {
                templateProvider: function ($rootScope, loginService) {
                    if ($rootScope.login_info) {
                        return $rootScope.login_info.menuHTML;
                    } else {
                        return "<div>111</div>";
                    }
                }
            },
            "mianContent@": {
                templateUrl: "framwork/whhJsFrame/template/mainContentView.html"
            }//,
            //"mianFooter@": {
            //    templateUrl: "framwork/whhJsFrame/template/mainFooterView.html"
            //},
            //"mainControlSiderBar@":{
            //    templateUrl: "framwork/whhJsFrame/template/mainControlSiderBarView.html"
            //}
        }
    }).state('main.login', {
            url: "/login",
            views: {
                "userPage@main": {
                    templateUrl: "framwork/whhJsFrame/template/loginView.html",
                    controller:function ($rootScope, $scope, $http, $state,$timeout, loginService) {
                        //这个scope是view专有的独立scope 和view里面我自己写的scope还是不一样的 不是同一个
                        $scope.$on('$viewContentLoaded',
                            function(event){
                                $rootScope.loginViewWindow.open();
                                $rootScope.loginViewWindow.center();
                            });
                    }
                },
                "mainSideBarView@": {  //让左侧菜单不显示内容
                    template: "<div></div>"
                }
            }
        }
    ).state('main.init', {
        url: "/init",
        views: {   //区块@状态名    要在index.html页面上找内容区块时，你需要这样写:content@
            "userPage@main": {
                templateUrl: "framwork/whhJsFrame/template/welcomeView.html"
            },
            "mainSideBarView@": {
                templateProvider: function ($rootScope, loginService) {
                    return $rootScope.login_info.menuHTML;
                }
            }
        }

    }).state('main.init.gridPage1', {
        // 很奇怪的是 为什么我载入 main.gridPage1这个state里的view 结果main里面的mainSideBarView也没有了 也得重新载入?
        // 而header啊 footer啊 这些 怎么又不会消失掉的
        // 原因是  这个view只会载入一次的  main.gridPage1这个state里的view  那么父级别的main状态也开始载入 于是mainSideBarView被载入
        // 从此以后mainSideBarView就不会再被载入了 除非你退回到main状态  既然不会重复载入了 而第一次到main的时候 mainSideBarView是没有内容的
        // 所以后面就再也不会载入内容了  而在后面子页面的时候 去加载之前的内容 显然很不好

        // 另一个问题 在main.welcome 的状态下 我加载了mainSideBarView 但是这个是在main.welcome状态下做的,当我进入到main.gridPage1状态 这个加载就失效了
        // 也就是说 这个载入一定要在main状态做,在子状态做都是不行的

        // 解决方案1.增加一个层级的父级别状态init  然后userpage在init下一层 这个办法是有效果的
        url: "/gridPage1",
        views: {
            "userPage@main": {
                templateUrl: "pages/demoGrid/gridPage1.html"
            }
        }
    }).state('main.init.gridPage2', {
        url: "/gridPage2",
        views: {
            "userPage@main": {
                templateUrl: "pages/demoGrid/gridPage2.html"
            }
        }
    }).state('main.init.datePage1', {
        url: "/datePage1",
        views: {
            "userPage@main": {
                templateUrl: "pages/demoDatePicker/datePage1.html"
            }
        }
    }).state('main.init.gridPage4', {
        url: "/gridPage4",
        views: {
            "userPage@main": {
                templateUrl: "pages/demoGrid/gridPage4.html"
            }
        }
    }).state('main.init.devlog', {
        url: "/devlog",
        views: {
            "userPage@main": {
                templateUrl: "pages/demoGrid/devlog.html"
            }
        }
    }).state('main.init.comboBoxDemo', {
        url: "/comboBoxDemo",
        views: {
            "userPage@main": {
                templateUrl: "pages/demoComboBox/demo1.html"
            }
        }
    }).state('main.init.btnDemo', {
        url: "/btnDemo",
        views: {
            "userPage@main": {
                templateUrl: "pages/demoBtn/demoBtn.html"
            }
        }
    })
});