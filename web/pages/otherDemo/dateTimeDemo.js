/**
 * Created by wz on 16/4/2.
 */
//angular.module('datePage1', ['whh.datePicker'])
App.controller('dateTimeDemoCtrl', ['$scope', 'whhDateService',function ($scope,whhDateService) {
    $scope.dateOption1 =
    {

        // 获取api对象 和 widget对象
        getWidgetApi: function (widgetApi) {
            $scope.widgetApi = widgetApi;
            $scope.widget = widgetApi.widget;
        }
    }


    $scope.setDate1 = function () {
        $scope.widgetApi.setDate( whhDateService.StringToDateTime("2011-12-31 12:23:11") );
    }
    $scope.setDate2 = function () {
        $scope.widgetApi.setDate( "2015-01-01 12:23:22" );
    }


    $scope.getDate = function () {
       var date =  $scope.widgetApi.getDate();
        alert(date);
    }

    $scope.getDateStr = function () {
       var dateStr =  $scope.widgetApi.getDateStr();
        alert(dateStr);
    }

    $scope.getMSeconds = function () {
        alert($scope.widgetApi.getMSeconds());
    }

    $scope.changeDateByNgModel = function () {
        $scope.aDate = new Date();
    }


    // 绑定事件处理器  可以绑定多个事件处理器
    var identifier;
    $scope.bind = function () {
        $scope.widgetApi.clearBindEvent('Change');

        identifier = $scope.widgetApi.bindEvent('Change',function (date) {
            //选中事件,返回选中行
            alert(date);
        });
        $scope.ifHandler = "已绑定OnChange事件";
    }


    //解绑事件
    $scope.unbind = function () {
        $scope.widgetApi.unBindEvent('Change',identifier);
        $scope.ifHandler = "已取消选OnChange事件";
    }
}]);

