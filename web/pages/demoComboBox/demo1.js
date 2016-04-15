/**
 * Created by wz on 16/4/2.
 */
//angular.module('comboBoxDemo1', ['whh.comboBox'])
App.controller('demo1Ctrl', ['$scope', function ($scope) {


    //
    $scope.comboBoxOption1 =
    {
        url: "GridDemoService/getCPU.json",  //只允许json数据 放弃其他格式
        textField: "detail",   // 下拉控件的显示 text
        valueField: "detail",  // 下拉控件的value
        para: {"para": "a"}, // 传参数
        columns: [
            {
                field: "producer",
                title: "厂商",
                width: 30
            },
            {
                field: "serialname",
                title: "系列",
                width: 30
            },
            {
                field: "performance",
                title: "性能",
                width: 30
            }
        ],

        //获取widgetApi
        getWidgetApi: function (widgetApi) {
            $scope.widgetApi1 = widgetApi;
            $scope.widget1 = widgetApi.widget;
        }
    }


    $scope.comboBoxOption2 =
    {
        textField: "serialname",   // 下拉控件的显示 text
        valueField: "serialname",  // 下拉控件的value
        columns: [
            {
                field: "producer",
                title: "厂商",
                width: 30
            },
            {
                field: "serialname",
                title: "系列",
                width: 30
            },
            {
                field: "performance",
                title: "性能",
                width: 30
            }
        ],
        data: [
            {"producer": "Apple", "serialname": "苹果A9+M9运动协处理器", "performance": "1.85GHz(双核)"},
            {"producer": "高通", "serialname": "骁龙820", "performance": "2.15GHz(4核)"},
            {"producer": "MTK", "serialname": "MT6755", "performance": "2GHz(8核)"},
            {"producer": "高通", "serialname": "骁龙808", "performance": "1.8GHz(6核)"},
            {"producer": "高通", "serialname": "骁龙617", "performance": "1.5GHz(8核)"},
            {"producer": "华为", "serialname": "海思麒麟950", "performance": "4*2.3+4*1.8GHz(8核)"}
        ],
        onChange: function (item) {
            //选中事件,返回选中行
            $("#changes").html(JSON.stringify(item));
        },


        //获取widgetApi 和 widget
        getWidgetApi: function (widgetApi) {
            $scope.widgetApi2 = widgetApi;
            $scope.widget2 = widgetApi.widget;
        }
    }


    // 绑定事件处理器  可以绑定多个事件处理器
    var identifier1;
    var identifier2;
    $scope.bind1 = function () {

        $scope.widgetApi1.clearOnChangeHandler();
        $scope.widgetApi2.clearOnChangeHandler();

        identifier1 = $scope.widgetApi1.bindOnChangeHandler(function (item) {
            //选中事件,返回选中行
            $("#changes").html(JSON.stringify(item));
            alert(JSON.stringify(item));
        });
        // 绑定事件处理器  可以绑定多个事件处理器  参数是选中行
        identifier2 = $scope.widgetApi2.bindOnChangeHandler(function (item) {
            //选中事件,返回选中行
            $("#changes").html(JSON.stringify(item));
            alert(JSON.stringify(item));
        });

        $scope.ifHandler = "已绑定选中事件";
    }


    //解绑事件
    $scope.unbind1 = function () {
        $scope.widgetApi1.unBindOnChangeHandler(identifier1);
        $scope.widgetApi2.unBindOnChangeHandler(identifier2);

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
}]);