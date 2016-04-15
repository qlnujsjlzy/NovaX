/**
 * Created by wz on 16/4/2.
 */


//angular.module('gridPage1', ['whh.grid'])
App.controller('gridPage1Ctrl', ['$scope', '$http','$timeout', function ($scope, $http,$timeout) {
        $scope.gridOption1 =
        {
                pageSize: 20,
                height: 450,
                groupable: true,
                sortable: true,
                title:"Grid CRUD Demo1",
                //scrolling: true,
                resizable: true,  //resizable  用户可以自己调整列宽
                reorderable: true, // 用户可以自己拖拽列的顺序
                selectable: "multiple row", //multiple row 多行    row单行  不写就是不可选
                //batch: true, // 批量修改
                editable: true,// 可修改
                columns: [{
                    field: "phonename",
                    title: "名称",
                    width: 200
                }, {
                    field: "producedate",
                    title: "日期(日期控件)",
                    format: "yyyy-MM-dd", // 支持yyyy-MM-dd   yyyy-MM-dd HH:mm:ss     HH:mm:ss   3种
                    width: 120,
                    editorConfig: {
                        editorType: editorTypeEnum.DatePicker
                    }
                }, {
                    field: "logtime",
                    title: "logtime(日期时间控件)",
                format: "yyyy-MM-dd HH:mm:ss",
                width: 210,
                editorConfig: {
                    editorType: editorTypeEnum.DateTimePicker
                }
            }, {
                field: "cpu",
                title: "cpu(多列下拉)",
                width: 350,  // 宽度只能这样设置了 就用户自己设置数值就好了
                editorConfig: {
                    editorType: editorTypeEnum.ComboBox,
                    url: "GridDemoService/getCPU.json",
                    dataType: "json",
                    paraField: "brand",
                    textField: "detail",   // 下拉控件的key
                    valueField: "detail",  // 下拉控件的value
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
                            width: 40
                        }
                    ]
                }
            }, {
                field: "os",
                title: "os(单列下拉)",
                width: 240,
                editorConfig: {
                    editorType: editorTypeEnum.DropDownList,
                    url: "GridDemoService/getOS.json",
                    dataType: "json",//如果跨域 就是jsonp   后台方法你要自己取出callback参数
                    paraField: "brand", // 要当参数传递的字段是哪个?   如果是item 那就是要传整个item   后台得用map类型接收参数
                    para: {},// 自己定义参数  如果写了这个 paraField就不要再写了
                    textField: "key",   // 下拉控件的key
                    valueField: "value",  // 下拉控件的value
                    data: []   //如果有这个参数 就是使用本地数据源
                }
            }, {
                field: "brand",
                title: "品牌"
            }, {
                field: "osversion",
                title: "系统版本"
            }, {
                field: "screen",
                title: "分辨率"
            }, {
                field: "memory",
                title: "内存"
            }, {
                field: "imgurl",
                title: "imgurl"
            }, {
                field: "id",
                title: "id"
            }],

            //获取widgetApi
            getWidgetApi: function (widgetApi) {
                $scope.gridApi = widgetApi;
                $scope.grid = widgetApi.widget;
            }
        }


        var i = 0;
        $scope.query = function (para) {

            //$http.jsonp("http://10.211.55.5:8080/XRemoteService/WhhFoodMenuService/getAllFoodInfoByName.do?callback=JSON_CALLBACK&foodName=" + $scope.foodName)
            //    .success(function (data, status, headers, config) {
            //        $scope.mianGridOptions.data = data;
            //    });

            if ($scope.phonename == undefined) {
                $scope.phonename = "";
            }
            $http({
                url: "GridDemoService/getPhone.json?phonename=" + $scope.phonename,
                method: "GET"

            }).success(function (data, status, header, config) {
                //直接赋值数据 而不使用transaction   坏处是如果远程请求耗时较长的话,不会出现菊花图标来过渡
                // 要想有菊花图标 还得自己再实现一个query方法
                $scope.gridApi.setData(data);
            });
        }
        $scope.query();


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
            $scope.gridApi.save({
                url: "GridDemoService/save.json",
                method: "POST"
            });
        }


    }]);