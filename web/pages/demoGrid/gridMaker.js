/**
 *
 * 2016-04-18 wangzheng
 * grid快速创建工具
 *
 *
 */

App.controller('gridMakerMainCtrl', ['$scope', function ($scope) {


    angular.element(document).ready(function () {
        $("#tabstrip").kendoTabStrip({
            animation: {
                open: {
                    effects: "fadeIn"
                }
            }
        });
    });



    //全局option对象 也是最终的grid定义option对象
    $scope.globeOption = {};








}]).controller('GridMakerSub1Ctrl', ['$scope','$state', function ($scope,$state) {



    //基础option对象 定义了grid的基本属性 width height  title  等等基本属性 和 column数组;
    $scope.basicOption={};
    $scope.basicOption.columns = [];



    //初始化
    $scope.wz_editable = false;
    $scope.wz_selectCheckBox = false;
    $scope.wz_selectable = "row";




    $scope.createOption = function(){
        //双向绑定
        $scope.basicOption.editable = $scope.wz_editable;
        $scope.basicOption.selectCheckBox = $scope.wz_selectCheckBox;
        $scope.basicOption.selectable = $scope.wz_selectable;


    }



    $scope.CreatingGridOption = {

        sortable: false,
        resizable: true,
        reorderable: true,
        title: "column定义",
        selectable: "row", //multiple row 多行    row单行  不写就是不可选
        editable: true,// 可修改
        height: 300,
        columns: [{
            field: "columnTitle",
            title: "字段名称",
            width: 100
        }, {
            field: "columnField",
            title: "字段代码",
            width: 100
        }, {
            field: "columnType",
            title: "字段类型",
            width: 60,
            editorConfig: {
                editorType: editorTypeEnum.DropDownList,
                //url: "GridDemoService/getOS.json",
                //dataType: "json",//如果跨域 就是jsonp   后台方法你要自己取出callback参数
                //paraField: "brand", // 要当参数传递的字段是哪个?   如果是item 那就是要传整个item   后台得用map类型接收参数
                //para: {},// 自己定义参数  如果写了这个 paraField就不要再写了
                textField: "key",   // 下拉控件的key
                valueField: "value",  // 下拉控件的value
                data: [{"key":"String","value":"String"},
                    {"key":"Number","value":"Number"},
                    {"key":"BigDecimal","value":"BigDecimal"},
                    {"key":"Date","value":"Date"},
                    {"key":"DateTime","value":"DateTime"}]   //如果有这个参数 就是使用本地数据源
            }
        }, {
            field: "columnEditor",
            title: "编辑器",
            width: 60,
            editorConfig: {
                editorType: editorTypeEnum.DropDownList,
                textField: "key",   // 下拉控件的key
                valueField: "value",  // 下拉控件的value
                data: [
                    {"key":"Text","value":"Text"},
                    {"key":"DropDownList","value":"DropDownList"},
                    {"key":"ComboBox","value":"ComboBox"},
                    {"key":"DatePicker","value":"DatePicker"},
                    {"key":"DateTimePicker","value":"DateTimePicker"}]
            }
        }],
        //获取widgetApi
        getWidgetApi: function (widgetApi) {
            $scope.CreatingGridApi = widgetApi;
            $scope.CreatingGrid = widgetApi.widget;

            $scope.CreatingGridApi.bindEvent('Select',function(item){
               // alert(111);
            });

            $scope.CreatingGridApi.bindEvent('ValueChange',function(field,item){
                if(field==="columnEditor"){
                    if(item["columnEditor"]==="Text"){
                        $state.go('main.init.gridMaker.sub1.editor_string');
                    }
                    if(item["columnEditor"]==="DatePicker"){
                        $state.go('main.init.gridMaker.sub1.editor_date');
                    }
                    if(item["columnEditor"]==="DateTimePicker"){
                        $state.go('main.init.gridMaker.sub1.editor_datetime');
                    }
                    if(item["columnEditor"]==="ComboBox"){
                        $state.go('main.init.gridMaker.sub1.editor_combobox');
                    }
                    if(item["columnEditor"]==="DropDownList"){
                        $state.go('main.init.gridMaker.sub1.editor_dropdownlist');
                    }
                }
            });
        }

    }

    $scope.addItem = function () {
        var item = {"columnTitle": "NewColumn", "columnField": "NewColumn", "columnType": "String","columnEditor":"Text"};
        $scope.CreatingGridApi.addItem(item);
    }
    $scope.deleteSelectedItems = function () {
        $scope.gridApi.deleteSelectedItems();
    }

    $scope.showOption = function () {
        $scope.createOption();
        alert(JSON.stringify($scope.basicOption));
    }

}]).controller('GridMakerColStringCtrl',['$scope',function($scope){

    //构建column数组里的一个column
    $scope.columnOption={};


}]).controller('GridMakerColDateCtrl',['$scope',function($scope){

    $scope.columnOption={};

    $scope.MaxdateOption =
    {
        // 获取api对象 和 widget对象
        getWidgetApi: function (widgetApi) {
            $scope.maxDateWidgetApi = widgetApi;
            //$scope.widget = widgetApi.widget;
        }
    }
    $scope.MindateOption =
    {
        // 获取api对象 和 widget对象
        getWidgetApi: function (widgetApi) {
            $scope.minDateWidgetApi = widgetApi;
            //$scope.widget = widgetApi.widget;
        }
    }

}]).controller('GridMakerColDropDownListCtrl',['$scope',function($scope){

    $scope.columnOption={};


}]).controller('GridMakerColComboBoxCtrl',['$scope',function($scope){

    $scope.columnOption={};


}]).controller('GridMakerColDateTimeCtrl',['$scope',function($scope){

    $scope.columnOption={};


    $scope.MaxdateOption =
    {
        // 获取api对象 和 widget对象
        getWidgetApi: function (widgetApi) {
            $scope.maxDateWidgetApi = widgetApi;
            //$scope.widget = widgetApi.widget;
        }
    }
    $scope.MindateOption =
    {
        // 获取api对象 和 widget对象
        getWidgetApi: function (widgetApi) {
            $scope.minDateWidgetApi = widgetApi;
            //$scope.widget = widgetApi.widget;
        }
    }
}]);
