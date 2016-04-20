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

App.controller('gridMakerMainCtrl', ['$scope','$state' ,function ($scope,$state) {





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
        //$scope.$broadcast('createOptionNow', arg);
        createOption(arg);
    });
    $scope.toSub1 = function(){
        createOption();
        $state.go('main.init.gridMaker.sub1');
    }
    $scope.toSub2 = function(){
        createOption();
        $state.go('main.init.gridMaker.sub2');
    }
    $scope.toSub3 = function(){
        createOption();
        $state.go('main.init.gridMaker.sub3');
    }


    //全局option对象 也是最终的grid定义option对象
    $scope.globeOption = {};
    $scope.globeOption.getWidgetApi=function(gridApi){
        //demo用的
        $scope.demoGridApi = gridApi;

        //构建测试数据
       // $scope.demoGridApi.setData(createDemoData($scope.globeOption.columns));
    }



    $scope.globeOption.columns = [];// 全局colDef
    $scope.globeColUid = {"uid":""};





    //缓存 存放这个设置界面最原始的信息
    $scope.GridMakerSub1CtrlCache = {
        colDefGridData :[],
        wz_editable: false,
        wz_selectCheckBox: false,
        wz_selectable: "row",
        wz_pageable : false,
        wz_pageSize : "",
        wz_height : 300,
        wz_groupable : false,
        wz_sortable : false,
        wz_reorderable: true,
        wz_resizable : true,
        wz_title : "",
        CreatingGridApi:{}
    };

    //缓存 存放这个设置界面最原始的信息
    $scope.GridMakerColStringCtrlCache = {

    };

    //缓存 DatePicker设置界面 存放这个设置界面最原始的信息
    $scope.GridMakerColDateCtrlCache = {
        wz_hidden:true,
        wz_required:false,
        wz_editable:false,
        wz_minDate:new Date(),
        wz_maxDate:new Date(),
        wz_width:100,
        wz_format:"yyyy-MM-dd"
    };

    //缓存 存放这个设置界面最原始的信息
    $scope.GridMakerColDropDownListCtrlCache = {

    };
    //缓存 存放这个设置界面最原始的信息
    $scope.GridMakerColComboBoxCtrlCache = {

    };
    //缓存 存放这个设置界面最原始的信息
    $scope.GridMakerColDateTimeCtrlCache = {

    };



     function createOption (uid){


         if(!$scope.GridMakerSub1CtrlCache.CreatingGridApi){
             return ;
         }

        //=======================================Sub1界面 start===============================================
        //双向绑定
        $scope.globeOption.editable = $scope.GridMakerSub1CtrlCache.wz_editable;
        $scope.globeOption.selectCheckBox = $scope.GridMakerSub1CtrlCache.wz_selectCheckBox;
        $scope.globeOption.selectable = $scope.GridMakerSub1CtrlCache.wz_selectable;
        $scope.globeOption.title = $scope.GridMakerSub1CtrlCache.wz_title;

        if ($scope.GridMakerSub1CtrlCache.wz_pageable) {
            $scope.globeOption.pageable = {
                refresh: true,
                pageSizes: true,
                buttonCount: 5
            }
            if ($scope.GridMakerSub1CtrlCache.wz_pageSize) { //pageSize属性 留着给dataSource用的
                $scope.globeOption.pageSize = $scope.GridMakerSub1CtrlCache.wz_pageSize;
            } else {
                $scope.globeOption.pageSize = 10;
            }
        }
        $scope.globeOption.height = $scope.GridMakerSub1CtrlCache.wz_height;
        $scope.globeOption.groupable = $scope.GridMakerSub1CtrlCache.wz_groupable;
        $scope.globeOption.sortable = $scope.GridMakerSub1CtrlCache.wz_sortable;
        $scope.globeOption.reorderable = $scope.GridMakerSub1CtrlCache.wz_reorderable;
        $scope.globeOption.resizable = $scope.GridMakerSub1CtrlCache.wz_resizable;


        //获取colDef 的定义 从grid里取出每个col的基本定义
        var colList = $scope.GridMakerSub1CtrlCache.CreatingGridApi.getData();
        for (var i = 0; i < colList.length; i++) {

            var ifHas = false;
            for (var j = 0; j < $scope.globeOption.columns.length; j++) {
                if($scope.globeOption.columns[j]["uid"]==colList[i].uid){
                    ifHas = true;
                    break;
                }
            }
            if(ifHas){
                $scope.globeOption.columns[j].field = colList[i].columnField;
                $scope.globeOption.columns[j].title = colList[i].columnTitle;
                $scope.globeOption.columns[j].type = colList[i].columnType;
                $scope.globeOption.columns[j].uid = colList[i].uid;
                $scope.globeOption.columns[j].columnEditor = colList[i].columnEditor;
            }else{
                var colDef = {};
                colDef.field = colList[i].columnField;
                colDef.title = colList[i].columnTitle;
                colDef.colDataType = colList[i].columnType;
                colDef.uid = colList[i].uid;
                colDef.columnEditor = colList[i].columnEditor;
                $scope.globeOption.columns.push(colDef);
            }
        }
         //然后没有的col 都要删掉
         for(var i=$scope.globeOption.columns.length-1;i>=0;i--){
             var ifHas = false;
             for (var j = 0; j < colList.length; j++) {
                 if($scope.globeOption.columns[i]["uid"]==colList[j].uid){
                     ifHas = true;
                     break;
                 }
             }
             if(!ifHas){
                 $scope.globeOption.columns.splice(i,1);
             }
         }



        //grid内容缓存起来
        var datas = $scope.GridMakerSub1CtrlCache.CreatingGridApi.getData();
        $scope.GridMakerSub1CtrlCache.colDefGridData.length = 0;
        for(var i=0;i < datas.length;i++){
            $scope.GridMakerSub1CtrlCache.colDefGridData.push(jQuery.extend({},datas[i],true));
        }


        //=======================================Sub1界面end===============================================

        //=======================================DatePicker界面start===============================================
        for(var i=0;i<$scope.globeOption.columns.length;i++){
            if(uid == $scope.globeOption.columns[i]["uid"] && $scope.globeOption.columns[i]["columnEditor"]=="DatePicker") {
                $scope.globeOption.columns[i].hidden = $scope.GridMakerColDateCtrlCache.wz_hidden;
                $scope.globeOption.columns[i].width = $scope.GridMakerColDateCtrlCache.wz_width;
                $scope.globeOption.columns[i].format = $scope.GridMakerColDateCtrlCache.wz_format;

                var validation;
                if($scope.GridMakerColDateCtrlCache.wz_required  ){
                    if(!validation){validation={}};
                    validation.required = $scope.GridMakerColDateCtrlCache.wz_required;
                }
                if($scope.GridMakerColDateCtrlCache.wz_minDate  ){
                    if(!validation){validation={}};
                    validation.min = $scope.GridMakerColDateCtrlCache.wz_minDate;
                }
                if($scope.GridMakerColDateCtrlCache.wz_maxDate  ){
                    if(!validation){validation={}};
                    validation.max = $scope.GridMakerColDateCtrlCache.wz_maxDate;
                }
                if(validation){
                    $scope.globeOption.columns[i].validation = validation;
                }

                //加上datePicker配置
                $scope.globeOption.columns[i].editorConfig={
                    editorType: editorTypeEnum.DateTimePicker
                }
                break;
            }
        }
        //=======================================DatePicker界面end===============================================






    }


    function  createDemoData(columns) {
        var res = [];
        for (var index = 0; index <= 10; index++) {
            var item = {};
            for (var i = 0; i < columns.length; i++) {
                if (columns[i].colDataType == "String") {
                    item[columns[i].field] = "sample" + index;
                } else if (columns[i].colDataType == "Number") {
                    item[columns[i].field] = 26.32;
                } else if (columns[i].colDataType == "Boolean") {
                    item[columns[i].field] = true;
                } else if (columns[i].colDataType == "Date") {
                    item[columns[i].field] = new Date();
                }
            }
            res.push(item);
        }
        return res;
    }


}]).controller('GridMakerSub1Ctrl', ['$scope', '$state', function ($scope, $state) {

    //$scope.$on('createOptionNow', function (event,arg) {
    //    $scope.createOption();
    //});



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
            $scope.GridMakerSub1CtrlCache.CreatingGridApi = widgetApi;
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
                if($scope.GridMakerSub1CtrlCache.colDefGridData){
                    $scope.CreatingGridApi.setData($scope.GridMakerSub1CtrlCache.colDefGridData);
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

        console.log(JSON.stringify($scope.globeOption));
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
