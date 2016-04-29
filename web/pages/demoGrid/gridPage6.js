/**
 * Created by wangzheng on 16/4/2.
 */
App.controller('gridPage6Ctrl', ['$scope', function ($scope) {
    $scope.gridOption1 =
    {

        dataWindowId:"GridDemo6",

        getWidgetApi: function (widgetApi) {
            $scope.gridApi = widgetApi;
            $scope.grid = widgetApi.widget;

            $scope.gridApi.query({   //查询数据
                url: "GridDemoService/getPhone.json",
                data: {"phonename": $scope.phonename}
            });
        },
        buttonsFunc:{
            "details":function (item) {  //点击button要执行的function定义在这里  名称必须唯一
                alert("Details1 for: " + JSON.stringify(item));
            },
            "deleteItem":function (item) {
                $scope.gridApi.deleteItem(item);
            }
        },
        uploadsFunc:{

            complete: function (result,item) {  //上传文件成功后要执行的function定义在这里  两个参数 一个是后台上传方法的返回值result 一个是当前行item
                alert(item.phonename+"  对应的文件上传成功!");
            }
        }
    }








    $scope.deleteAllItems = function () {
        $scope.gridApi.deleteAllItem();
    }

}]);
