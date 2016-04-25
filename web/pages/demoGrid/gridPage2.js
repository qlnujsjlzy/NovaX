/**
 * Created by wz on 16/4/2.
 */


//angular.module('gridPage2', ['whh.grid'])
App.controller('gridPage2Ctrl', ['$scope', '$http','$timeout','whhHttpService' ,function ($scope, $http,$timeout,whhHttpService) {
        $scope.gridOption1 =
        {
            dataWindowId:"GridDemo2",
            //获取widgetApi
            getWidgetApi: function (widgetApi) {
                $scope.gridApi = widgetApi;
                $scope.grid = widgetApi.widget;
                $scope.gridApi.query({
                    url: "GridDemoService/getPhone.json",
                    data:{"phonename":$scope.phonename}
                });
            }
        }


        var i = 0;
        $scope.query = function (para) {

            if ($scope.phonename == undefined) {
                $scope.phonename = "";
            }
            $scope.gridApi.query({
                url: "GridDemoService/getPhone.json",
                data:{"phonename":$scope.phonename}
            });
        }



        var timeout;
        var watch = $scope.$watch('phonename',function(newValue,oldValue, scope){

            if (newValue) {
                // 先取消之前的计时器
                if (timeout) {
                    $timeout.cancel(timeout);
                }

                //使用timeout的目的是 不要在用户刚输入就查询 否则界面会变得迟钝
                timeout = $timeout(function () {
                    $scope.query();
                }, 350);
            }
        });


        $scope.addItem = function () {
            var item = {"phonename": "测试机", "brand": "测试", "os": "IOS", "producedate": new Date()};
            $scope.gridApi.addItem(item);
        }


        $scope.deleteAllItems = function () {
            $scope.mianGridOptions.data = [];
        }

        $scope.updateItem = function () {
            // 参数1 是index  参数2是要修改的值
            $scope.gridApi.updateItem(1, {"phonename": "小米Note3!", "brand": "小米!"});
        }

        $scope.deleteItem = function () {
            //参数是index
            $scope.gridApi.deleteItem(1);
        }

        $scope.deleteSelectedItems = function () {
            $scope.gridApi.deleteSelectedItems();
        }

        $scope.getSelectedItems = function () {

            var arr = $scope.gridApi.getSelectedItems();
            var info = "---------------SelectedItems------------- <br>"
            for (var i = 0; i < arr.length; i++) {
                info = info + JSON.stringify(arr[i].toJSON()) + "<br>";
                info = info + "<br>"
            }

            $("#changes").html(info);

        }


        $scope.showUpdates = function () {
            $("#changes").html($scope.gridApi.showUpdates());
        }

        $scope.save = function () {
            $scope.gridApi.save("GridDemoService/save.json");
        }


        $scope.throwException = function () {

            whhHttpService.getRequest("GridDemoService/throwException.json",{})
            .success(function (data, status, header, config) {

            });
        }


    }]);