/**
 * Created by wangzheng on 16/4/11.
 */

//全局参数
var pchostname = "http://localhost:8080/";//http://192.200.5.147
var theme = "red";//默认主题 blue,blue-light,yellow,yellow-light,green,green-light,purple,purple-light,red,red-light,black,black-light
var layout = "fixed";//布局
var ifLoginCheck = false;

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

    })
//===============================================================Grid制作工具的路由 start=========================================================================
// gridMaker是父状态  下级状态是sub1 sub2  sub3
        .state('main.init.gridMaker', {
            url: "/gridMaker",
            views: {
                "userPage@main": {
                    templateUrl: "framwork/whhJsFrame/gridMaker/gridMaker.html"
                }
            }
        }).state('main.init.gridMaker.sub1', {
        url: "/sub1",
        views: {
            "gridMakerView": {
                templateUrl: "framwork/whhJsFrame/gridMaker/gridMaker_sub1.html"
            }
        }
    }).state('main.init.gridMaker.sub2', {
        url: "/sub2",
        views: {
            "gridMakerView": {
                templateUrl: "framwork/whhJsFrame/gridMaker/gridMaker_sub2.html"
            }
        },
        onEnter: function() {

            //照样拿不到jquery对象  所以在onEnter里面 还是不适合做DOM操作 时机不对
            //alert($("#sub2editor").length);
            //var editor = ace.edit("sub2editor");
            //editor.setTheme("ace/theme/monokai");//twilight tomorrow_night_bright
            //editor.setReadOnly(true);
            //editor.setFontSize(12);
            //editor.session.setMode("ace/mode/json");
            //editor.setValue("");
        }
    }).state('main.init.gridMaker.sub3', {
        url: "/sub3",
        views: {
            "gridMakerView@main.init.gridMaker": {   // gridMakerView这个View在main.init.gridMaker这个state下的  不写默认是上一级state
                templateUrl: "framwork/whhJsFrame/gridMaker/gridMaker_sub3.html"
            }
        }
    }).state('main.init.gridMaker.sub1.editor_string', {
        url: "/editor_string",
        views: {
            "gridMakerColDetailView@main.init.gridMaker": {
                templateUrl: "framwork/whhJsFrame/gridMaker/gridMaker_ColDetail_Text.html"
            }
        }
    }).state('main.init.gridMaker.sub1.editor_date', {
        url: "/editor_date",
        views: {
            "gridMakerColDetailView@main.init.gridMaker": {
                templateUrl: "framwork/whhJsFrame/gridMaker/gridMaker_ColDetail_Date.html"
            }
        }
    }).state('main.init.gridMaker.sub1.editor_dropdownlist', {
        url: "/editor_dropdownlist",
        views: {
            "gridMakerColDetailView@main.init.gridMaker": {
                templateUrl: "framwork/whhJsFrame/gridMaker/gridMaker_ColDetail_DropDownList.html"
            }
        }
    }).state('main.init.gridMaker.sub1.editor_combobox', {
        url: "/editor_combobox",
        views: {
            "gridMakerColDetailView@main.init.gridMaker": {
                templateUrl: "framwork/whhJsFrame/gridMaker/gridMaker_ColDetail_ComboBox.html"
            }
        },
        onEnter: function() {
           // alert($("#hehehe").length);
            //var editor = ace.edit("sub2editor");
            //editor.setTheme("ace/theme/monokai");//twilight tomorrow_night_bright
            //editor.setReadOnly(true);
            //editor.setFontSize(12);
            //editor.session.setMode("ace/mode/json");
            //editor.setValue("");
        }
    }).state('main.init.gridMaker.sub1.editor_datetime', {
            url: "/editor_datetime",
            views: {
                "gridMakerColDetailView@main.init.gridMaker": {
                    templateUrl: "framwork/whhJsFrame/gridMaker/gridMaker_ColDetail_DateTime.html"
                }
            }
    })
//===============================================================Grid制作工具的路由 end=========================================================================
/*
 Create by wangzheng  2016-04-01
 以上部分为框架配置 请勿修改

 */



















//*===================================================用户页面 Userages==============================================================*
//*                                                                                                                                 *
//*                                                                                                                                 *
//*                                                   用户页面 Userages                                                              *
//*                                                                                                                                 *
//*                                                                                                                                 *
//*===================================================用户页面 Userages==============================================================*
        .state('main.init.gridPage1', {
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
    }).state('main.init.FileUpload', {
        url: "/FileUpload",
        views: {
            "userPage@main": {
                templateUrl: "pages/demoFileUpload/demo.html"
            }
        }
    }).state('main.init.DropDown', {
        url: "/DropDown",
        views: {
            "userPage@main": {
                templateUrl: "pages/demoDropDown/demo1.html"
            }
        }
    })


});