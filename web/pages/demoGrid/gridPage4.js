/**
 * Created by wz on 16/4/2.
 */


//angular.module('gridPage2', ['whh.grid'])
App.controller('gridPage4Ctrl', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {
    $scope.gridOption1 =
    {
        dataWindowId:"GridDemo4_1",

        // 首先就要获取到widgetApi
        getWidgetApi: function (widgetApi) {
            $scope.gridApi1 = widgetApi;
            $scope.grid1 = widgetApi.widget;

            $scope.gridApi1.query({
                url: "GridDemoService/getPhone.json",
                data:{"phonename":$scope.phonename}
            });
        }
    }

    $scope.gridOption2 =
    {
        dataWindowId:"GridDemo4_2",
        //获取widgetApi
        getWidgetApi: function (widgetApi) {
            $scope.gridApi2 = widgetApi;
            $scope.grid2 = widgetApi.widget;


            $scope.gridApi2.query({
                url: "GridDemoService/getPhone.json",
                data:{"phonename":$scope.phonename}
            });
        }
    }


    // 绑定事件处理器  可以绑定多个事件处理器
    var identifier1;
    var identifier2;
    $scope.bind = function () {


        $scope.gridApi1.clearBindEvent('Select');
        $scope.gridApi2.clearBindEvent('Select');

        //给第二个grid绑定事件
        identifier1 = $scope.gridApi1.bindEvent('Select',
            function (items) {  //选中行触发的事件 可以写多个 会顺序执行   参数就是选中行数组

                var info = "---------------SelectedItems grid2------------- <br>"
                for (var i = 0; i < items.length; i++) {
                    info = info + JSON.stringify(items[i].toJSON()) + "<br>";
                    info = info + "<br>"
                }

                $("#changes").html(info);
            }
        );


        //给第二个grid绑定事件
        identifier2 = $scope.gridApi2.bindEvent('Select',
            function (items) {  //选中行触发的事件 可以写多个 会顺序执行   参数就是选中行数组

                var info = "---------------SelectedItems grid2------------- <br>"
                for (var i = 0; i < items.length; i++) {
                    info = info + JSON.stringify(items[i].toJSON()) + "<br>";
                    info = info + "<br>"
                }

                $("#changes").html(info);
            }
        );

        $scope.ifHandler = "已绑定OnSelect事件";
    }


    //解绑事件
    $scope.unbind = function () {
        $scope.gridApi1.unBindEvent('Select',identifier1);
        $scope.gridApi2.unBindEvent('Select',identifier2);
        $("#changes").html("");
        $scope.ifHandler = "已取消选OnSelect事件";
    }





    $scope.deleteSelectedItems1 = function () {
        $scope.gridApi1.deleteSelectedItems();

    }
    $scope.deleteSelectedItems2 = function () {
        $scope.gridApi2.deleteSelectedItems();

    }

    $scope.getSelectedItems1 = function () {

        var arr = $scope.gridApi1.getSelectedItems();
        var info = "---------------getSelectedItems1 grid1------------- <br>"
        for (var i = 0; i < arr.length; i++) {
            info = info + JSON.stringify(arr[i].toJSON()) + "<br>";
            info = info + "<br>"
        }

        $("#changes").html(info);

    }
    $scope.getSelectedItems2 = function () {

        var arr = $scope.gridApi2.getSelectedItems();
        var info = "---------------getSelectedItems1 grid2------------- <br>"
        for (var i = 0; i < arr.length; i++) {
            info = info + JSON.stringify(arr[i].toJSON()) + "<br>";
            info = info + "<br>"
        }

        $("#changes").html(info);

    }

    $scope.showUpdates1 = function () {
        $("#changes").html($scope.gridApi1.showUpdates());
    }
    $scope.showUpdates2 = function () {
        $("#changes").html($scope.gridApi2.showUpdates());
    }


}]);