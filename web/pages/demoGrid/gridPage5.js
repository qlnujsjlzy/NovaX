/**
 * Created by wz on 16/4/2.
 */
App.controller('gridPage5Ctrl', ['$scope', '$http', '$timeout', 'whhHttpService', function ($scope, $http, $timeout, whhHttpService) {
    $scope.gridOption1 =
    {
        dataWindowId: "GridDemo5",

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
        placeholder:"Excel导入数据...",

        getWidgetApi: function (widgetApi) {
            $scope.widgetApi = widgetApi;
            $scope.widget = widgetApi.widget;

            $scope.widgetApi.bindEvent('Complate', function (result) {
                //console.log(result);
                $scope.gridApi.setExcelData(result);
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