/**
 * Created by wz on 16/4/15.
 */
App.controller('fileUploadDemoCtrl',['$scope','$rootScope',function($scope,$rootScope){


    $scope.fileUploadOption = {
        url:"FileuploadService/uploadFile.json",
        // 获取api对象 和 widget对象
        getWidgetApi: function (widgetApi) {
            $scope.widgetApi = widgetApi;
            $scope.widget = widgetApi.widget;

            //绑定上传成功的事件 直接绑定事件的话 要在这里做 因为只有这里可以确保$scope.widgetApi 已经创建成功
            //开源项目ui-grid 也是这种做法  把事件绑定放在这个位置
            $scope.widgetApi.bindEvent('Complate',function(res){
                //alert(res.downloadPath);
                $("#downloadLink").attr("href",res.downloadPath);
                $("#downloadLink").text(res.downloadPath);
            });
        }
    }
}]);