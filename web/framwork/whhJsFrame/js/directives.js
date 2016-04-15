/**
 * Created by wangzheng on 16/4/12.
 */

//App.directive('indexImports',function(){
//    return {
//        restrict:"E",
//        replace: true,
//        templateUrl:"/framwork/whhJsFrame/template/indexImports.html"
//    };
//});


//不要独立作用域 要继承上层作用域
App.directive('ngWhhIndexHeader',function(){
    return {
        restrict:"A",
        replace: false,
        templateUrl:"framwork/whhJsFrame/template/indexHeader.html"
    };
});
