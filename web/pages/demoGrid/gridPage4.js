/**
 * Created by wz on 16/4/2.
 */


//angular.module('gridPage2', ['whh.grid'])
App.controller('gridPage4Ctrl', ['$scope', '$http', '$timeout', function ($scope, $http, $timeout) {
    $scope.gridOption1 =
    {
        title:"Grid 勾选框和select事件",
        pageable: false,
        height: 300,
        groupable: true,
        sortable: true,
        //scrolling: true,
        resizable: true,  //resizable  用户可以自己调整列宽
        reorderable: true, // 用户可以自己拖拽列的顺序
        selectable: "multiple row", //multiple row 多行    row单行  不写就是不可选
        selectCheckBox: true, // 是否要显示勾选框
        //batch: true, // 批量修改
        //editable: true,// 可修改
        columns: [{
            field: "phonename",
            title: "名称",
            width: 200,

            type: "string",  //类型 用于schema "string", "number", "boolean", "date". The default is "string".
            editable: false, //每一列的编辑状态 不写就默认是true了
            validation: {   // validation
                required: true
            }
        }, {
            field: "os",
            title: "os(单列下拉)",
            width: 240,
            editorConfig: {
                editorType: editorTypeEnum.DropDownList,
                url: "GridDemoService/getOS.json",
                dataType: "json",
                paraField: "brand",
                para: {},
                textField: "key",
                valueField: "value"
            }
        }, {
            field: "id",
            title: "id"
        }],

        // 首先就要获取到widgetApi
        getWidgetApi: function (widgetApi) {
            $scope.gridApi1 = widgetApi;
            $scope.grid1 = widgetApi.widget;
        }
    }



    $scope.gridOption2 =
    {

        height: 300,
        sortable: true,
        title:"Grid 勾选框和select事件",
        resizable: true,  //resizable  用户可以自己调整列宽
        reorderable: true, // 用户可以自己拖拽列的顺序
        selectable: "multiple row", //multiple row 多行    row单行  不写就是不可选   如果使用了selectCheckBox=true 那么selectable属性会做特殊处理
        selectCheckBox: false, // 是否要显示勾选框
        //editable: true,// 可修改
        columns: [{
            field: "phonename",
            title: "名称",
            width: 200,

            type: "string",  //类型 用于schema "string", "number", "boolean", "date". The default is "string".
            editable: false, //每一列的编辑状态 不写就默认是true了
            validation: {   // validation
                required: true
            }
        }, {
            field: "os",
            title: "os(单列下拉)",
            width: 240,
            editorConfig: {
                editorType: editorTypeEnum.DropDownList,
                url: "GridDemoService/getOS.json",
                dataType: "json",
                paraField: "brand",
                para: {},
                textField: "key",
                valueField: "value"
            }
        }, {
            field: "id",
            title: "id"
        }],


        //获取widgetApi
        getWidgetApi: function (widgetApi) {
            $scope.gridApi2 = widgetApi;
            $scope.grid2 = widgetApi.widget;
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




    $scope.query = function (para) {
        $http({
            url: "GridDemoService/getPhone.json?phonename=",
            method: "GET"
        }).success(function (data, status, header, config) {
            $scope.gridApi1.setData(data);
        });
        $http({
            url: "GridDemoService/getPhone.json?phonename=",
            method: "GET"
        }).success(function (data, status, header, config) {
            $scope.gridApi2.setData(data);
        });

    }
    $scope.query();


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