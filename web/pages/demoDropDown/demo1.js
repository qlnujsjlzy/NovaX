/**
 * Created by wz on 16/4/2.
 */
//angular.module('comboBoxDemo1', ['whh.comboBox'])
App.controller('dropDownDemoCtrl', ['$scope', function ($scope) {



    $scope.Option1 =
    {

        url: "GridDemoService/getOS.json",  //如果有这个参数  就认为是远程数据源 data属性将无效
        para: {"para":""},// 自己定义参数
        textField: "key",   // 下拉控件的key
        valueField: "value",  // 下拉控件的value
        //data: [],   //使用本地数据源

        //获取widgetApi 和 widget
        getWidgetApi: function (widgetApi) {
            $scope.widgetApi1 = widgetApi;
            $scope.widget1 = widgetApi.widget;

            //$scope.widgetApi1.bindEvent('Select',function (item) {
            //    //选中事件,返回选中行
            //    $("#changes").html(JSON.stringify(item));
            //    alert(JSON.stringify(item));
            //});


        }
    }




    // 绑定事件处理器  可以绑定多个事件处理器
    var identifier1;
    $scope.bind1 = function () {

        $scope.widgetApi1.clearBindEvent('Select');

        identifier1 = $scope.widgetApi1.bindEvent('Select',function (item) {
            //选中事件,返回选中行
            $("#changes").html(JSON.stringify(item));
            alert(JSON.stringify(item));
        });
        $scope.ifHandler = "已绑定选中事件";
    }

    //解绑事件
    $scope.unbind1 = function () {
        $scope.widgetApi1.unBindEvent('Select',identifier1);
        $scope.ifHandler = "已取消选中事件";
    }



    $scope.getSelectItem = function () {
        var item = $scope.widgetApi1.getSelectItem();
        $("#changes").html(JSON.stringify(item));
        alert(JSON.stringify(item));
    }

    $scope.selectItem = function () {
        var item = $scope.widgetApi1.setSelectIndex(2);
    }


    $scope.setValue = function () {
        $scope.dropDown1 = "Android";
    }


}]);