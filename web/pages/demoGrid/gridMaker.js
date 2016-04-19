/**
 *
 * 2016-04-18 wangzheng
 * grid快速创建工具
 *
 *
 * 问题在于 什么时候去创建option对象 我认为用事件好 每个编辑器配置的controller里 只需要接受事件就可以
 * 接收到就创建.别的都不要管.
 *
 * 至于发出事件 我觉得有几个地方要发出
 * 1.grid做select的时候
 * 2.grid change的时候
 * 3.切换tab的时候
 * 4.保存的时候 都要发出事件
 *
 *
 * 而且这个事件发出 要先向上到顶部controller 然后从顶部向下覆盖所有的controller
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


    $scope.$on('createOption', function (event,arg) {
        $scope.$broadcast('createOptionNow', arg);
    });




    //全局option对象 也是最终的grid定义option对象
    $scope.globeOption = {};
    $scope.globeOption.getWidgetApi=function(gridApi){
        $scope.demoGridApi = gridApi;
    }
    $scope.globeOption.columns = [];// 全局colDef
    $scope.globeColUid = {"uid":""};

    $scope.optionCache = {
        colDefGridData :[]

    };//缓存 存放这个设置信息 直接存放进来


}]).controller('GridMakerSub1Ctrl', ['$scope', '$state', function ($scope, $state) {

    $scope.$on('createOptionNow', function (event,arg) {
        $scope.createOption();
    });

    //基础option对象 定义了grid的基本属性 width height  title  等等基本属性 和 column数组;
    $scope.basicOption = {};
    $scope.basicOption.columns = $scope.globeOption.columns;


    //初始化
    $scope.wz_editable = false;
    $scope.wz_selectCheckBox = false;
    $scope.wz_selectable = "row"
    $scope.wz_pageable = false;
    $scope.wz_pageSize = "";
    $scope.wz_height = 300;
    $scope.wz_groupable = false;
    $scope.wz_sortable = false;
    $scope.wz_reorderable = true;
    $scope.wz_resizable = true;
    $scope.wz_title = "";







    $scope.createOption = function () {
        //双向绑定
        $scope.basicOption.editable = $scope.wz_editable;
        $scope.basicOption.selectCheckBox = $scope.wz_selectCheckBox;
        $scope.basicOption.selectable = $scope.wz_selectable;
        $scope.basicOption.title = $scope.wz_title;

        if ($scope.wz_pageable) {
            $scope.basicOption.pageable = {
                refresh: true,
                pageSizes: true,
                buttonCount: 5
            }
            if ($scope.wz_pageSize) { //pageSize属性 留着给dataSource用的
                $scope.basicOption.pageSize = $scope.wz_pageSize;
            } else {
                $scope.basicOption.pageSize = 10;
            }
        }
        $scope.basicOption.height = $scope.wz_height;
        $scope.basicOption.groupable = $scope.wz_groupable;
        $scope.basicOption.sortable = $scope.wz_sortable;
        $scope.basicOption.reorderable = $scope.wz_reorderable;
        $scope.basicOption.resizable = $scope.wz_resizable;


        //获取colDef 的定义 从grid里取出每个col的基本定义

        var colList = $scope.CreatingGridApi.getData();
        for (var i = 0; i < colList.length; i++) {

            var ifHas = false;
            for (var j = 0; j < $scope.basicOption.columns.length; j++) {
                if($scope.basicOption.columns[j]["uid"]==colList[i].uid){
                    ifHas = true;
                    break;
                }
            }

            if(ifHas){
                $scope.basicOption.columns[j].field = colList[i].columnField;
                $scope.basicOption.columns[j].title = colList[i].columnTitle;
                $scope.basicOption.columns[j].type = colList[i].columnType;
                $scope.basicOption.columns[j].uid = colList[i].uid;
            }else{
                var colDef = {};
                colDef.field = colList[i].columnField;
                colDef.title = colList[i].columnTitle;
                colDef.colDataType = colList[i].columnType;
                colDef.uid = colList[i].uid;
                $scope.basicOption.columns.push(colDef);
            }
        }


        //合并到globeOption
        for(var prop in $scope.basicOption){

            if($scope.globeOption[prop]){

            }else{
                $scope.globeOption[prop] = $scope.basicOption[prop];
            }

        }


        //grid内容缓存起来
        var datas = $scope.CreatingGridApi.getData();
        $scope.optionCache.colDefGridData.length = 0;
        for(var i=0;i < datas.length;i++){
            $scope.optionCache.colDefGridData.push(jQuery.extend({},datas[i],true));
        }

    }


    $scope.CreatingGridOption = {

        sortable: false,
        resizable: true,
        reorderable: true,
        title: "column定义",
        selectable: "row", //multiple row 多行    row单行  不写就是不可选
        editable: true,// 可修改
        height: 300,
        columns: [
            {
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
                    data: [{"key": "String", "value": "String"},   //Number|String|Boolean|Date  根据kendo里dataSource的schema
                        {"key": "Number", "value": "Number"},
                        {"key": "Boolean", "value": "Boolean"},
                        {"key": "Date", "value": "Date"}]   //如果有这个参数 就是使用本地数据源
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
                        {"key": "Text", "value": "Text"},
                        {"key": "DropDownList", "value": "DropDownList"},
                        {"key": "ComboBox", "value": "ComboBox"},
                        {"key": "DatePicker", "value": "DatePicker"},
                        {"key": "DateTimePicker", "value": "DateTimePicker"}]
                }
            }, {
                hidden: true,
                field: "uid",
                title: "uid"

            }],
        //获取widgetApi
        getWidgetApi: function (widgetApi) {
            $scope.CreatingGridApi = widgetApi;
            $scope.CreatingGrid = widgetApi.widget;

            $scope.CreatingGridApi.bindEvent('Select', function (item) {
                // alert(111);
                var colUid = item[0]["uid"];
                $scope.globeColUid["uid"] = colUid;
                $scope.$emit('createOption',colUid);
            });
            $scope.CreatingGridApi.bindEvent('Editing', function (item) {
                var colUid = item["uid"];
                $scope.globeColUid["uid"] = colUid;
                $scope.$emit('createOption',colUid);
            });


            $scope.CreatingGridApi.bindEvent('ValueChange', function (field, item) {

                var colUid = item["uid"];
                $scope.globeColUid["uid"] = colUid;
                $scope.$emit('createOption',colUid);


                if (field === "columnEditor") {




                    //var colDef;
                    //for(var i=0;i<$scope.basicOption.columns.length;i++){
                    //    if(colUid == $scope.basicOption.columns[i]["uid"]){
                    //        colDef = $scope.basicOption.columns[i];
                    //
                    //        $scope.globleTempColDef = colDef;// 上层作用域里的临时colDef 用于传递数据
                    //        break;
                    //    }
                    //}

                    if (item["columnEditor"] === "Text") {
                        $state.go('main.init.gridMaker.sub1.editor_string');
                    }
                    if (item["columnEditor"] === "DatePicker") {
                        $state.go('main.init.gridMaker.sub1.editor_date');
                    }
                    if (item["columnEditor"] === "DateTimePicker") {
                        $state.go('main.init.gridMaker.sub1.editor_datetime');
                    }
                    if (item["columnEditor"] === "ComboBox") {
                        $state.go('main.init.gridMaker.sub1.editor_combobox');
                    }
                    if (item["columnEditor"] === "DropDownList") {
                        $state.go('main.init.gridMaker.sub1.editor_dropdownlist');
                    }
                }
            });



            //restore  把globe里面的属性又恢复回来
            function restore(){
                //恢复属性
                for(var prop in $scope.globeOption){
                    if($scope.globeOption[prop]){
                        $scope['wz_'+prop] = $scope.globeOption[prop];
                    }
                }

                //恢复grid数据源
                if($scope.optionCache.colDefGridData){
                    $scope.CreatingGridApi.setData($scope.optionCache.colDefGridData);
                }

            }
            restore();
        }
    }

    $scope.addItem = function () {
        var item = {
            "uid": Math.uidFast(),
            "columnTitle": "NewColumn",
            "columnField": "NewColumn",
            "columnType": "String",
            "columnEditor": "Text"
        };
        $scope.CreatingGridApi.addItem(item);
    }
    $scope.deleteSelectedItems = function () {
        $scope.CreatingGridApi.deleteSelectedItems();
    }

    $scope.showOption = function () {

        console.log(JSON.stringify($scope.basicOption));
    }







}]).controller('GridMakerSub2Ctrl', ['$scope', '$state', function ($scope, $state) {



}]).controller('GridMakerSub3Ctrl', ['$scope', '$state', function ($scope, $state) {

    console.warn()

}]).controller('GridMakerColStringCtrl', ['$scope', function ($scope) {

    $scope.$on('createOptionNow', function (event,arg) {
         createOption(JSON.stringify($scope.basicOption));
    });

    //构建column数组里的一个column
    $scope.columnOption = {};

    function createOption(){

    }


}]).controller('GridMakerColDateCtrl', ['$scope', function ($scope) {


    $scope.$on('createOptionNow', function (event,arg) {
        createOption(arg);
    });

    //默认值
    $scope.tempColDef={
        wz_hidden:true,
        wz_required:false,
        wz_minDate:"2016-01-01",
        wz_maxDate:"2016-12-30",
        wz_width:100
    };


    function createOption(uid){

        for(var i=0;i<$scope.globeOption.columns.length;i++){
            if(uid == $scope.globeOption.columns[i]["uid"]) {


                $scope.globeOption.columns[i].hidden = $scope.tempColDef.wz_hidden;
                $scope.globeOption.columns[i].width = $scope.tempColDef.wz_width;

                var validation;
                if($scope.tempColDef.wz_required  ){
                    if(!validation){validation={}};
                    validation.required = $scope.tempColDef.wz_required;
                }
                if($scope.tempColDef.wz_minDate  ){
                    if(!validation){validation={}};
                    validation.min = $scope.tempColDef.wz_minDate;
                }
                if($scope.tempColDef.wz_maxDate  ){
                    if(!validation){validation={}};
                    validation.max = $scope.tempColDef.wz_maxDate;
                }
                if(validation){
                    $scope.globeOption.columns[i].validation = validation;
                }

                break;
            }
        }
    }


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

}]).controller('GridMakerColDropDownListCtrl', ['$scope', function ($scope) {


    $scope.$on('createOptionNow', function (event,arg) {
        createOption();
    });
    function createOption(){

    }

    $scope.columnOption = {};


}]).controller('GridMakerColComboBoxCtrl', ['$scope', function ($scope) {


    $scope.$on('createOptionNow', function (event,arg) {
        createOption();
    });
    function createOption(){

    }

    $scope.columnOption = {};


}]).controller('GridMakerColDateTimeCtrl', ['$scope', function ($scope) {


    $scope.$on('createOptionNow', function (event,arg) {
        createOption();
    });

    $scope.columnOption = {};

    function createOption(){

    }


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
