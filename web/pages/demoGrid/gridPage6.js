/**
 * Created by wz on 16/4/2.
 */


//angular.module('gridPage2', ['whh.grid'])
App.controller('gridPage6Ctrl', ['$scope', '$http', '$timeout', 'whhHttpService', function ($scope, $http, $timeout, whhHttpService) {
    $scope.gridOption1 =
    {

        //获取widgetApi
        getWidgetApi: function (widgetApi) {
            $scope.gridApi = widgetApi;
            $scope.grid = widgetApi.widget;

            $scope.gridApi.query({
                url: "GridDemoService/getPhone.json",
                data: {"phonename": $scope.phonename}
            });
        },
        columnButtons:{
            "details1":function (item) {  //details1必须唯一
                console.log("Details1 for: " + item.phonename);
            },
            "details2":function (item) {
                console.log("Details2 for: " + item.phonename);
            }
        },
        height: 450,
        title: "Grid CRUD Demo6",
        resizable: true,  //resizable  用户可以自己调整列宽
        reorderable: true, // 用户可以自己拖拽列的顺序
        selectable: "row", //multiple row 多行    row单行  不写就是不可选
        editable: true,// 可修改
        columns: [{
            field: "phonename",
            title: "名称",
            width: 150
        }, {
            field: "brand",
            title: "品牌"
        }, {
            field: "work1",
            title: "操作1",
            buttons: [{ name: "details1", text: "查看明细1"} ]
        }, {
            field: "work2",
            title: "操作2",
            buttons: [{ name: "details2", text: "查看明细2"} ]
        }

        ]

    }

    $scope.fileUploadOption = {
        url: "GridDemoService/importExcel.json",
        // 获取api对象 和 widget对象
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
    $scope.deleteAllItems = function () {
        $scope.gridApi.deleteAllItem();
    }

}]);
