/**
 * Created by wz on 16/4/2.
 */


//angular.module('gridPage2', ['whh.grid'])
App.controller('gridPage5Ctrl', ['$scope', '$http', '$timeout', 'whhHttpService', function ($scope, $http, $timeout, whhHttpService) {
    $scope.gridOption1 =
    {
        dataWindowId: "GridDemo2",
        //获取widgetApi
        getWidgetApi: function (widgetApi) {
            $scope.gridApi = widgetApi;
            $scope.grid = widgetApi.widget;
            $scope.gridApi.query({
                url: "GridDemoService/getPhone.json",
                data: {"phonename": ""}
            });
        }
    }

    $scope.fileUploadOption = {
        url: "GridDemoService/importExcel.json",
        // 获取api对象 和 widget对象
        getWidgetApi: function (widgetApi) {
            $scope.widgetApi = widgetApi;
            $scope.widget = widgetApi.widget;

            $scope.widgetApi.bindEvent('Complate', function (result) {
                //console.log(result);
                $scope.gridApi.setData(result);
            });

        }
    }





    $scope.exportExcel = function () {
        $scope.gridApi.exportExcel();
    }
    $scope.deleteAllItems = function(){
        $scope.gridApi.deleteAllItem();
    }

}]);