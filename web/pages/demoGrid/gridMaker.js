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

App.controller('gridMakerMainCtrl', ['$scope', '$state', 'whhHttpService', function ($scope, $state, whhHttpService) {





//====================================================缓存定义 start=================================================================


    //全局option对象 也是最终的grid定义option对象
    $scope.globeOption = {};
    $scope.globeOption.getWidgetApi = function (gridApi) {
        //demo用的
        $scope.demoGridApi = gridApi;

        //构建测试数据
        $scope.demoGridApi.setData(createDemoData($scope.globeOption.columns));
    }


    //这些要构建出真实Option对象 这个真实Option对象要存入数据库  也就是globeOption
    //然后这些零时数据 也就是各个cache的.history 这些数据是用于恢复界面显示的  也要存储起来


    // 全局colDef
    $scope.globeOption.columns = [];

    //当前处理的colid
    $scope.globeColUid = {colid: ""};


    //缓存 存放这个设置界面最原始的信息
    $scope.GridMakerSub1CtrlCache = {
        colFieldIndex: 0,
        colDefGridData: [],
        wz_editable: true,
        wz_selectCheckBox: false,
        wz_selectable: "row",
        wz_pageable: false,
        wz_pageSize: "",
        wz_height: 300,
        wz_groupable: false,
        wz_sortable: false,
        wz_reorderable: true,
        wz_resizable: true,
        wz_title: "",
        CreatingGridApi: {}
    };

    //缓存 存放这个设置界面最原始的信息
    $scope.GridMakerColStringCtrlCache = {
        history: {"colid": {}}
    };

    //缓存 DatePicker设置界面 存放这个设置界面最原始的信息
    $scope.GridMakerColDateCtrlCache = {
        history: {"colid": {}}  //存储每一列对应的editer属性   一旦选中一列 就从这里面找出来 恢复到current里面去
    };

    //缓存 存放这个设置界面最原始的信息
    $scope.GridMakerColDropDownListCtrlCache = {
        history: {"colid": {}}
    };
    //缓存 存放这个设置界面最原始的信息
    $scope.GridMakerColComboBoxCtrlCache = {
        history: {"colid": {}}
    };
    //缓存 存放这个设置界面最原始的信息
    $scope.GridMakerColDateTimeCtrlCache = {
        history: {"colid": {}}
    };

//====================================================缓存定义 end=================================================================


//====================================================读取缓存 start=================================================================
    $scope.$on('createOption', function (event, arg) {
        //$scope.$broadcast('createOptionNow', arg);
        createOption(arg);
    });

    $scope.$on('restore', function (event, columnEditor) {
        //restore(arg);

        if (columnEditor === "Text") {

            if (!$scope.GridMakerColStringCtrlCache.history[$scope.globeColUid["colid"]]) {
                var copy = jQuery.extend({}, $scope.GridMakerColStringCtrlCache, true);
                delete copy.history;
                $scope.GridMakerColStringCtrlCache.history[$scope.globeColUid["colid"]] = copy;
            }
            $state.go('main.init.gridMaker.sub1.editor_string').then(function success() {
                if ($scope.GridMakerColStringCtrlCache.history[$scope.globeColUid["colid"]]) {
                    $scope.GridMakerColStringCtrlCache.wz_hidden = $scope.GridMakerColStringCtrlCache.history[$scope.globeColUid["colid"]].wz_hidden;
                    $scope.GridMakerColStringCtrlCache.wz_width = $scope.GridMakerColStringCtrlCache.history[$scope.globeColUid["colid"]].wz_width;
                    $scope.GridMakerColStringCtrlCache.wz_editable = $scope.GridMakerColStringCtrlCache.history[$scope.globeColUid["colid"]].wz_editable;
                    $scope.GridMakerColStringCtrlCache.wz_required = $scope.GridMakerColStringCtrlCache.history[$scope.globeColUid["colid"]].wz_required;
                }
            }, function error() {

            });
        }
        if (columnEditor === "DatePicker") {

            //没有的话 初始化
            if (!$scope.GridMakerColDateCtrlCache.history[$scope.globeColUid["colid"]]) {
                var copy = jQuery.extend({}, $scope.GridMakerColDateCtrlCache, true);
                delete copy.history;
                $scope.GridMakerColDateCtrlCache.history[$scope.globeColUid["colid"]] = copy;
            }
            $state.go('main.init.gridMaker.sub1.editor_date').then(function success() {
                if ($scope.GridMakerColDateCtrlCache.history[$scope.globeColUid["colid"]]) {
                    $scope.GridMakerColDateCtrlCache.wz_hidden = $scope.GridMakerColDateCtrlCache.history[$scope.globeColUid["colid"]].wz_hidden;
                    $scope.GridMakerColDateCtrlCache.wz_width = $scope.GridMakerColDateCtrlCache.history[$scope.globeColUid["colid"]].wz_width;
                    $scope.GridMakerColDateCtrlCache.wz_format = $scope.GridMakerColDateCtrlCache.history[$scope.globeColUid["colid"]].wz_format;
                    $scope.GridMakerColDateCtrlCache.wz_editable = $scope.GridMakerColDateCtrlCache.history[$scope.globeColUid["colid"]].wz_editable;
                    $scope.GridMakerColDateCtrlCache.wz_required = $scope.GridMakerColDateCtrlCache.history[$scope.globeColUid["colid"]].wz_required;
                    $scope.GridMakerColDateCtrlCache.wz_minDate = $scope.GridMakerColDateCtrlCache.history[$scope.globeColUid["colid"]].wz_minDate;
                    $scope.GridMakerColDateCtrlCache.wz_maxDate = $scope.GridMakerColDateCtrlCache.history[$scope.globeColUid["colid"]].wz_maxDate;
                }
            }, function error() {

            });
        }
        if (columnEditor === "DateTimePicker") {

            if (!$scope.GridMakerColDateTimeCtrlCache.history[$scope.globeColUid["colid"]]) {
                var copy = jQuery.extend({}, $scope.GridMakerColDateTimeCtrlCache, true);
                delete copy.history;
                $scope.GridMakerColDateTimeCtrlCache.history[$scope.globeColUid["colid"]] = copy;
            }

            $state.go('main.init.gridMaker.sub1.editor_datetime').then(function success() {
                if ($scope.GridMakerColDateTimeCtrlCache.history[$scope.globeColUid["colid"]]) {
                    $scope.GridMakerColDateTimeCtrlCache.wz_hidden = $scope.GridMakerColDateTimeCtrlCache.history[$scope.globeColUid["colid"]].wz_hidden;
                    $scope.GridMakerColDateTimeCtrlCache.wz_width = $scope.GridMakerColDateTimeCtrlCache.history[$scope.globeColUid["colid"]].wz_width;
                    $scope.GridMakerColDateTimeCtrlCache.wz_format = $scope.GridMakerColDateTimeCtrlCache.history[$scope.globeColUid["colid"]].wz_format;
                    $scope.GridMakerColDateTimeCtrlCache.wz_editable = $scope.GridMakerColDateTimeCtrlCache.history[$scope.globeColUid["colid"]].wz_editable;
                    $scope.GridMakerColDateTimeCtrlCache.wz_required = $scope.GridMakerColDateTimeCtrlCache.history[$scope.globeColUid["colid"]].wz_required;
                    $scope.GridMakerColDateTimeCtrlCache.wz_minDate = $scope.GridMakerColDateTimeCtrlCache.history[$scope.globeColUid["colid"]].wz_minDate;
                    $scope.GridMakerColDateTimeCtrlCache.wz_maxDate = $scope.GridMakerColDateTimeCtrlCache.history[$scope.globeColUid["colid"]].wz_maxDate;
                }
            }, function error() {

            });
        }
        if (columnEditor === "ComboBox") {

            if (!$scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]]) {
                var copy = jQuery.extend({}, $scope.GridMakerColComboBoxCtrlCache, true);
                delete copy.history;
                $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]] = copy;
            }
            $state.go('main.init.gridMaker.sub1.editor_combobox').then(function success() {
                if ($scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]]) {
                    $scope.GridMakerColComboBoxCtrlCache.wz_hidden = $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_hidden;
                    $scope.GridMakerColComboBoxCtrlCache.wz_width = $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_width;
                    $scope.GridMakerColComboBoxCtrlCache.wz_editable = $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_editable;
                    $scope.GridMakerColComboBoxCtrlCache.wz_required = $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_required;

                    $scope.GridMakerColComboBoxCtrlCache.wz_url = $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_url;
                    $scope.GridMakerColComboBoxCtrlCache.wz_para_item = $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_para_item;
                    $scope.GridMakerColComboBoxCtrlCache.wz_paraField = $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_paraField;

                    $scope.GridMakerColComboBoxCtrlCache.wz_para = $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_para;
                    $scope.GridMakerColComboBoxCtrlCache.wz_data = $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_data;

                    $scope.GridMakerColComboBoxCtrlCache.wz_textField = $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_textField;
                    $scope.GridMakerColComboBoxCtrlCache.wz_valueField = $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_valueField;
                    $scope.GridMakerColComboBoxCtrlCache.wz_columns = $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_columns;

                }
            }, function error() {

            });
        }
        if (columnEditor === "DropDownList") {
            if (!$scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]]) {
                var copy = jQuery.extend({}, $scope.GridMakerColDropDownListCtrlCache, true);
                delete copy.history;
                $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]] = copy;
            }
            $state.go('main.init.gridMaker.sub1.editor_dropdownlist').then(function success() {
                if ($scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]]) {
                    $scope.GridMakerColDropDownListCtrlCache.wz_hidden = $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]].wz_hidden;
                    $scope.GridMakerColDropDownListCtrlCache.wz_width = $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]].wz_width;
                    $scope.GridMakerColDropDownListCtrlCache.wz_editable = $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]].wz_editable;
                    $scope.GridMakerColDropDownListCtrlCache.wz_required = $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]].wz_required;

                    $scope.GridMakerColDropDownListCtrlCache.wz_url = $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]].wz_url;
                    $scope.GridMakerColDropDownListCtrlCache.wz_para_item = $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]].wz_para_item;
                    $scope.GridMakerColDropDownListCtrlCache.wz_paraField = $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]].wz_paraField;
                    $scope.GridMakerColDropDownListCtrlCache.wz_para = $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]].wz_para;
                    $scope.GridMakerColDropDownListCtrlCache.wz_data = $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]].wz_data;
                }
            }, function error() {

            });
        }


    });

//====================================================读取缓存 end=================================================================


//====================================================页面跳转 start=================================================================
    $scope.toSub1 = function () {
        //createOption();
        $state.go('main.init.gridMaker.sub1');
    }
    $scope.toSub2 = function () {
        createOption();
        $state.go('main.init.gridMaker.sub2');
    }
    $scope.toSub3 = function () {
        createOption();
        $state.go('main.init.gridMaker.sub3');
    }
//====================================================页面跳转 end=================================================================


//====================================================初始化缓存 start=================================================================
    $scope.globeEditorCacheInit = function () {
        // 设置过editor属性以后 这几个cache的current值会变化 在我新增行的时候 我需要做一个初始化

        $scope.GridMakerColStringCtrlCache["wz_hidden"] = false;
        $scope.GridMakerColStringCtrlCache["wz_required"] = false;
        $scope.GridMakerColStringCtrlCache["wz_editable"] = true;
        $scope.GridMakerColStringCtrlCache["wz_width"] = 100;


        $scope.GridMakerColDateCtrlCache["wz_hidden"] = false;
        $scope.GridMakerColDateCtrlCache["wz_required"] = false;
        $scope.GridMakerColDateCtrlCache["wz_editable"] = true;
        $scope.GridMakerColDateCtrlCache["wz_width"] = 100;
        $scope.GridMakerColDateCtrlCache["wz_minDate"] = new Date();
        $scope.GridMakerColDateCtrlCache["wz_maxDate"] = new Date();
        $scope.GridMakerColDateCtrlCache["wz_format"] = "yyyy-MM-dd";


        $scope.GridMakerColDateTimeCtrlCache["wz_hidden"] = false;
        $scope.GridMakerColDateTimeCtrlCache["wz_required"] = false;
        $scope.GridMakerColDateTimeCtrlCache["wz_editable"] = true;
        $scope.GridMakerColDateTimeCtrlCache["wz_width"] = 100;
        $scope.GridMakerColDateTimeCtrlCache["wz_minDate"] = new Date();
        $scope.GridMakerColDateTimeCtrlCache["wz_maxDate"] = new Date();
        $scope.GridMakerColDateTimeCtrlCache["wz_format"] = "yyyy-MM-dd HH:mm:ss";


        $scope.GridMakerColDropDownListCtrlCache["wz_hidden"] = false;
        $scope.GridMakerColDropDownListCtrlCache["wz_required"] = false;
        $scope.GridMakerColDropDownListCtrlCache["wz_editable"] = true;
        $scope.GridMakerColDropDownListCtrlCache["wz_width"] = 100;
        $scope.GridMakerColDropDownListCtrlCache["wz_url"] = "";
        $scope.GridMakerColDropDownListCtrlCache["wz_para_item"] = "";
        $scope.GridMakerColDropDownListCtrlCache["wz_paraField"] = "";
        $scope.GridMakerColDropDownListCtrlCache["wz_para"] = "";
        $scope.GridMakerColDropDownListCtrlCache["wz_data"] = "";


        $scope.GridMakerColComboBoxCtrlCache["wz_hidden"] = false;
        $scope.GridMakerColComboBoxCtrlCache["wz_required"] = false;
        $scope.GridMakerColComboBoxCtrlCache["wz_editable"] = true;
        $scope.GridMakerColComboBoxCtrlCache["wz_width"] = 100;
        $scope.GridMakerColComboBoxCtrlCache["wz_url"] = "";
        $scope.GridMakerColComboBoxCtrlCache["wz_para_item"] = "";
        $scope.GridMakerColComboBoxCtrlCache["wz_paraField"] = "";
        $scope.GridMakerColComboBoxCtrlCache["wz_para"] = "";
        $scope.GridMakerColComboBoxCtrlCache["wz_data"] = "";
        $scope.GridMakerColComboBoxCtrlCache["wz_textField"] = "";
        $scope.GridMakerColComboBoxCtrlCache["wz_valueField"] = "";
        $scope.GridMakerColComboBoxCtrlCache["wz_columns"] = ""; // 这个定义是json字符串 要转成js对象才行的


    }
//====================================================初始化缓存 end=================================================================


//====================================================构建真实Option对象 start=================================================================
    function createOption(colid) {


        if (!$scope.GridMakerSub1CtrlCache.CreatingGridApi) {
            return;
        }

        //=======================================Sub1界面 start===============================================
        //grid基本属性
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
        } else {
            delete $scope.globeOption.pageable;
            delete $scope.globeOption.pageSize;
        }
        $scope.globeOption.height = Number($scope.GridMakerSub1CtrlCache.wz_height);
        $scope.globeOption.groupable = $scope.GridMakerSub1CtrlCache.wz_groupable;
        $scope.globeOption.sortable = $scope.GridMakerSub1CtrlCache.wz_sortable;
        $scope.globeOption.reorderable = $scope.GridMakerSub1CtrlCache.wz_reorderable;
        $scope.globeOption.resizable = $scope.GridMakerSub1CtrlCache.wz_resizable;


        //获取colDef 的定义 从grid里取出每个col的基本定义 restore回来之后 uid已经改变了! 导致了重新创建 丢失了editer相关属性 需要使用自己的uuid 不要使用grid的uid
        var colList = $scope.GridMakerSub1CtrlCache.colDefGridData;
        for (var i = 0; i < colList.length; i++) {

            var ifHas = false;
            for (var j = 0; j < $scope.globeOption.columns.length; j++) {
                if ($scope.globeOption.columns[j]["colid"] == colList[i].colid) {
                    ifHas = true;
                    break;
                }
            }
            if (ifHas) {
                $scope.globeOption.columns[j].field = colList[i].columnField;
                $scope.globeOption.columns[j].title = colList[i].columnTitle;
                $scope.globeOption.columns[j].type = colList[i].columnType;
                $scope.globeOption.columns[j].colid = colList[i].colid;
                $scope.globeOption.columns[j].columnEditor = colList[i].columnEditor;
            } else {
                var colDef = {};
                colDef.field = colList[i].columnField;
                colDef.title = colList[i].columnTitle;
                colDef.type = colList[i].columnType;
                colDef.colid = colList[i].colid;
                colDef.columnEditor = colList[i].columnEditor;
                $scope.globeOption.columns.push(colDef);
            }
        }
        //然后没有的col 都要删掉
        for (var i = $scope.globeOption.columns.length - 1; i >= 0; i--) {
            var ifHas = false;
            for (var j = 0; j < colList.length; j++) {
                if ($scope.globeOption.columns[i]["colid"] == colList[j].colid) {
                    ifHas = true;
                    break;
                }
            }
            if (!ifHas) {
                $scope.globeOption.columns.splice(i, 1);
            }
        }
        //=======================================Sub1界面end===============================================

        //现在是history里面每个col都要做构建
        for (var i = 0; i < $scope.globeOption.columns.length; i++) {
            //=======================================Text界面start=============================================
            if ($scope.globeOption.columns[i]["columnEditor"] == "Text") {

                var cache = $scope.GridMakerColStringCtrlCache.history[$scope.globeOption.columns[i]["colid"]];

                $scope.globeOption.columns[i].hidden = cache.wz_hidden;
                $scope.globeOption.columns[i].width = Number(cache.wz_width);
                $scope.globeOption.columns[i].editable = cache.wz_editable;


                var validation;
                if (cache.wz_required) {
                    if (!validation) {
                        validation = {}
                    }
                    ;
                    validation.required = cache.wz_required;
                }
                if (validation) {
                    $scope.globeOption.columns[i].validation = validation;
                }
            }
            //=======================================Text界面end===============================================

            //=======================================DatePicker界面start=======================================
            if ($scope.globeOption.columns[i]["columnEditor"] == "DatePicker") {

                var cache = $scope.GridMakerColDateCtrlCache.history[$scope.globeOption.columns[i]["colid"]];

                $scope.globeOption.columns[i].hidden = cache.wz_hidden;
                $scope.globeOption.columns[i].width = Number(cache.wz_width);
                $scope.globeOption.columns[i].format = cache.wz_format;
                $scope.globeOption.columns[i].editable = cache.wz_editable;


                var validation;
                if (cache.wz_required) {
                    if (!validation) {
                        validation = {}
                    }
                    ;
                    validation.required = cache.wz_required;
                }
                if (cache.wz_minDate) {
                    if (!validation) {
                        validation = {}
                    }
                    ;
                    validation.min = cache.wz_minDate;
                }
                if (cache.wz_maxDate) {
                    if (!validation) {
                        validation = {}
                    }
                    ;
                    validation.max = cache.wz_maxDate;
                }
                if (validation) {
                    $scope.globeOption.columns[i].validation = validation;
                }

                //加上datePicker配置
                $scope.globeOption.columns[i].editorConfig = {
                    editorType: editorTypeEnum.DatePicker
                }
            }
            //=======================================DatePicker界面end=========================================

            //=======================================DateTimePicker界面start===================================
            if ($scope.globeOption.columns[i]["columnEditor"] == "DateTimePicker") {

                var cache = $scope.GridMakerColDateTimeCtrlCache.history[$scope.globeOption.columns[i]["colid"]];

                $scope.globeOption.columns[i].hidden = cache.wz_hidden;
                $scope.globeOption.columns[i].width = Number(cache.wz_width);
                $scope.globeOption.columns[i].format = cache.wz_format;
                $scope.globeOption.columns[i].editable = cache.wz_editable;


                var validation;
                if (cache.wz_required) {
                    if (!validation) {
                        validation = {}
                    }
                    ;
                    validation.required = cache.wz_required;
                }
                if (cache.wz_minDate) {
                    if (!validation) {
                        validation = {}
                    }
                    ;
                    validation.min = cache.wz_minDate;
                }
                if (cache.wz_maxDate) {
                    if (!validation) {
                        validation = {}
                    }
                    ;
                    validation.max = cache.wz_maxDate;
                }
                if (validation) {
                    $scope.globeOption.columns[i].validation = validation;
                }

                //加上datePicker配置
                $scope.globeOption.columns[i].editorConfig = {
                    editorType: editorTypeEnum.DateTimePicker
                }
            }
            //=======================================DateTimePicker界面end=====================================

            //=======================================DropDownList界面start=====================================
            if ($scope.globeOption.columns[i]["columnEditor"] == "DropDownList") {

                var cache = $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeOption.columns[i]["colid"]];

                $scope.globeOption.columns[i].hidden = cache.wz_hidden;
                $scope.globeOption.columns[i].width = Number(cache.wz_width);
                $scope.globeOption.columns[i].editable = cache.wz_editable;


                var validation;
                if (cache.wz_required) {
                    if (!validation) {
                        validation = {}
                    }
                    ;
                    validation.required = cache.wz_required;
                }
                if (validation) {
                    $scope.globeOption.columns[i].validation = validation;
                }

                //加上datePicker配置
                $scope.globeOption.columns[i].editorConfig = {
                    editorType: editorTypeEnum.DropDownList,
                    textField: "text",
                    valueField: "value",
                    dataType: "json"
                }


                if (cache["wz_url"]) {
                    cache["wz_url"] = cache["wz_url"].replace(/(^\s*)|(\s*$)/g, "");
                    if (cache["wz_url"] === "") {
                    } else {
                        $scope.globeOption.columns[i].editorConfig.url = cache["wz_url"];
                    }
                }
                if (cache["wz_paraField"]) {
                    cache["wz_paraField"] = cache["wz_paraField"].replace(/(^\s*)|(\s*$)/g, "");
                    if (cache["wz_paraField"] === "") {
                    } else {
                        $scope.globeOption.columns[i].editorConfig.paraField = cache["wz_paraField"];
                    }
                }

                if (cache["wz_para"] && cache["wz_para"].replace(/(^\s*)|(\s*$)/g, "") !== "") {
                    //做json字符串到json对象的转换
                    $scope.globeOption.columns[i].editorConfig.para = JSON.parse(cache["wz_para"])
                }
                // 如果要用整行做参数 就删掉para 和 paraField
                if (cache["wz_para_item"]) {
                    delete $scope.globeOption.columns[i].editorConfig.para;
                    delete $scope.globeOption.columns[i].editorConfig.paraField;
                }


                if (cache["wz_data"] && cache["wz_data"].replace(/(^\s*)|(\s*$)/g, "") !== "") {
                    //做json字符串到json对象的转换
                    $scope.globeOption.columns[i].editorConfig.data = JSON.parse(cache["wz_data"])
                }

            }
            //=======================================DropDownList界面end=======================================

            //=======================================ComboBox界面start=========================================
            if ($scope.globeOption.columns[i]["columnEditor"] == "ComboBox") {

                var cache = $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeOption.columns[i]["colid"]];

                $scope.globeOption.columns[i].hidden = cache.wz_hidden;
                $scope.globeOption.columns[i].width = Number(cache.wz_width);
                $scope.globeOption.columns[i].editable = cache.wz_editable;


                var validation;
                if (cache.wz_required) {
                    if (!validation) {
                        validation = {}
                    }
                    ;
                    validation.required = cache.wz_required;
                }
                if (validation) {
                    $scope.globeOption.columns[i].validation = validation;
                }

                //加上datePicker配置
                $scope.globeOption.columns[i].editorConfig = {
                    editorType: editorTypeEnum.ComboBox,
                    textField: "key",
                    valueField: "value",
                    dataType: "json",
                    textField: cache["wz_textField"],
                    wz_valueField: cache["wz_valueField"]
                }


                if (cache["wz_url"]) {
                    cache["wz_url"] = cache["wz_url"].replace(/(^\s*)|(\s*$)/g, "");
                    if (cache["wz_url"] === "") {
                    } else {
                        $scope.globeOption.columns[i].editorConfig.url = cache["wz_url"];
                    }
                }
                if (cache["wz_paraField"]) {
                    cache["wz_paraField"] = cache["wz_paraField"].replace(/(^\s*)|(\s*$)/g, "");
                    if (cache["wz_paraField"] === "") {
                    } else {
                        $scope.globeOption.columns[i].editorConfig.paraField = cache["wz_paraField"];
                    }
                }

                if (cache["wz_para"] && cache["wz_para"].replace(/(^\s*)|(\s*$)/g, "") !== "") {
                    //做json字符串到json对象的转换
                    $scope.globeOption.columns[i].editorConfig.para = JSON.parse(cache["wz_para"])
                }
                // 如果要用整行做参数 就删掉para 和 paraField
                if (cache["wz_para_item"]) {
                    delete $scope.globeOption.columns[i].editorConfig.para;
                    delete $scope.globeOption.columns[i].editorConfig.paraField;
                }

                if (cache["wz_data"] && cache["wz_data"].replace(/(^\s*)|(\s*$)/g, "") !== "") {
                    //做json字符串到json对象的转换
                    $scope.globeOption.columns[i].editorConfig.data = JSON.parse(cache["wz_data"])
                }
                if (cache["wz_columns"] && cache["wz_columns"].replace(/(^\s*)|(\s*$)/g, "") !== "") {
                    //做json字符串到json对象的转换
                    $scope.globeOption.columns[i].editorConfig.columns = JSON.parse(cache["wz_columns"])
                }

            }
            //=======================================ComboBox界面end===========================================
        }


    }

//====================================================构建真实Option对象 end=================================================================


//====================================================构建测试数据 start=================================================================
    function createDemoData(columns) {
        var res = [];
        for (var index = 0; index <= 10; index++) {
            var item = {};
            for (var i = 0; i < columns.length; i++) {
                if (columns[i].type == "String") {
                    item[columns[i].field] = "sample" + index;
                } else if (columns[i].type == "Number") {
                    item[columns[i].field] = 26.32;
                } else if (columns[i].type == "Boolean") {
                    item[columns[i].field] = true;
                } else if (columns[i].type == "Date") {
                    item[columns[i].field] = new Date();
                }
            }
            res.push(item);
        }
        return res;
    }

//====================================================构建测试数据 end=================================================================


//启动的时候 执行一次初始化! 这很重要
    $scope.globeEditorCacheInit();


    $scope.saveGridDef = function () {

        createOption();


        if ($scope.grid_name && $scope.grid_name != "") {

        } else {
            alert("请输入grid的name");
            return;
        }

        var gridInfoPkg = {};

        gridInfoPkg.grid_id = Math.uidFast();
        gridInfoPkg.grid_name = $scope.grid_name;
        gridInfoPkg.globe_option = $scope.globeOption;

        gridInfoPkg.grid_cache_option = {};
        gridInfoPkg.grid_cache_option.GridMakerSub1CtrlCache = $scope.GridMakerSub1CtrlCache;
        gridInfoPkg.grid_cache_option.GridMakerColStringCtrlCache = $scope.GridMakerColStringCtrlCache;
        gridInfoPkg.grid_cache_option.GridMakerColDateCtrlCache = $scope.GridMakerColDateCtrlCache;
        gridInfoPkg.grid_cache_option.GridMakerColDropDownListCtrlCache = $scope.GridMakerColDropDownListCtrlCache;
        gridInfoPkg.grid_cache_option.GridMakerColComboBoxCtrlCache = $scope.GridMakerColComboBoxCtrlCache;
        gridInfoPkg.grid_cache_option.GridMakerColDateTimeCtrlCache = $scope.GridMakerColDateTimeCtrlCache;


        whhHttpService.request("GridDefService/uploadLoadGridDef.json", gridInfoPkg).success(function (data, status, headers, config) {
            alert("保存成功");
        }).error(function (data, status, headers, config) {
            alert("上传出错");
        });


    }

    $scope.queryGridDef = function () {

        createOption();


        if ($scope.grid_name && $scope.grid_name != "") {

        } else {
            alert("请输入grid的name");
            return;
        }

        var gridInfoPkg = {};

        gridInfoPkg.grid_id = Math.uidFast();
        gridInfoPkg.grid_name = $scope.grid_name;
        gridInfoPkg.globe_option = $scope.globeOption;

        gridInfoPkg.grid_cache_option = {};
        gridInfoPkg.grid_cache_option.GridMakerSub1CtrlCache = $scope.GridMakerSub1CtrlCache;
        gridInfoPkg.grid_cache_option.GridMakerColStringCtrlCache = $scope.GridMakerColStringCtrlCache;
        gridInfoPkg.grid_cache_option.GridMakerColDateCtrlCache = $scope.GridMakerColDateCtrlCache;
        gridInfoPkg.grid_cache_option.GridMakerColDropDownListCtrlCache = $scope.GridMakerColDropDownListCtrlCache;
        gridInfoPkg.grid_cache_option.GridMakerColComboBoxCtrlCache = $scope.GridMakerColComboBoxCtrlCache;
        gridInfoPkg.grid_cache_option.GridMakerColDateTimeCtrlCache = $scope.GridMakerColDateTimeCtrlCache;


        whhHttpService.request("GridDefService/uploadLoadGridDef.json", gridInfoPkg).success(function (data, status, headers, config) {
            alert("保存成功");
        }).error(function (data, status, headers, config) {
            alert("上传出错");
        });


    }
}]).controller('GridMakerSub1Ctrl', ['$scope', '$state', function ($scope, $state) {


    $scope.move = function () {
        //随时保存 鼠标移动就保存
        //$scope.GridMakerSub1CtrlCache.wz_editable=$scope.GridMakerSub1CtrlCache.wz_editable;
        //$scope.GridMakerSub1CtrlCache.wz_selectCheckBox=$scope.GridMakerSub1CtrlCache.wz_selectCheckBox;
        //$scope.GridMakerSub1CtrlCache.wz_selectable=$scope.GridMakerSub1CtrlCache.wz_selectable;
        //$scope.GridMakerSub1CtrlCache.wz_pageable=$scope.GridMakerSub1CtrlCache.wz_pageable;
        //$scope.GridMakerSub1CtrlCache.wz_pageSize=$scope.GridMakerSub1CtrlCache.wz_pageSize;
        //$scope.GridMakerSub1CtrlCache.wz_height=$scope.GridMakerSub1CtrlCache.wz_height;
        //$scope.GridMakerSub1CtrlCache.wz_groupable=$scope.GridMakerSub1CtrlCache.wz_groupable;
        //$scope.GridMakerSub1CtrlCache.wz_sortable=$scope.GridMakerSub1CtrlCache.wz_sortable;
        //$scope.GridMakerSub1CtrlCache.wz_reorderable=$scope.GridMakerSub1CtrlCache.wz_reorderable;
        //$scope.GridMakerSub1CtrlCache.wz_resizable=$scope.GridMakerSub1CtrlCache.wz_resizable;
        //$scope.GridMakerSub1CtrlCache.wz_title=$scope.GridMakerSub1CtrlCache.wz_title;


        if ($scope.GridMakerSub1CtrlCache.wz_selectCheckBox) {
            $scope.GridMakerSub1CtrlCache.wz_pageable = false;
            $scope.GridMakerSub1CtrlCache.wz_pageSize = 0;
            //delete $scope.GridMakerSub1CtrlCache.wz_selectable;
        }

        //grid内容缓存起来
        var datas = $scope.GridMakerSub1CtrlCache.CreatingGridApi.getData();
        $scope.GridMakerSub1CtrlCache.colDefGridData.length = 0;
        for (var i = 0; i < datas.length; i++) {
            $scope.GridMakerSub1CtrlCache.colDefGridData.push(jQuery.extend({}, datas[i], true));
        }


        console.log(new Date());
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
                field: "colid",
                title: "colid"

            }],
        //获取widgetApi
        getWidgetApi: function (widgetApi) {
            $scope.GridMakerSub1CtrlCache.CreatingGridApi = widgetApi;
            $scope.CreatingGridApi = widgetApi;
            $scope.CreatingGrid = widgetApi.widget;

            $scope.CreatingGridApi.bindEvent('Select', function (items) {
                // alert(111);
                var item = items[0];
                var colUid = item["colid"];
                $scope.globeColUid["colid"] = colUid;
                console.log(JSON.stringify($scope.GridMakerColDateCtrlCache.history[colUid]));
                $scope.$emit('restore', item["columnEditor"]);

            });
            //$scope.CreatingGridApi.bindEvent('Editing', function (item) {
            //    var colUid = item["colid"];
            //    $scope.globeColUid  = colUid;
            //    //$scope.$emit('createOption',colUid);
            //
            //    if (item["columnEditor"] === "Text") {
            //        $state.go('main.init.gridMaker.sub1.editor_string');
            //    }
            //    if (item["columnEditor"] === "DatePicker") {
            //        $state.go('main.init.gridMaker.sub1.editor_date');
            //    }
            //    if (item["columnEditor"] === "DateTimePicker") {
            //        $state.go('main.init.gridMaker.sub1.editor_datetime');
            //    }
            //    if (item["columnEditor"] === "ComboBox") {
            //        $state.go('main.init.gridMaker.sub1.editor_combobox');
            //    }
            //    if (item["columnEditor"] === "DropDownList") {
            //        $state.go('main.init.gridMaker.sub1.editor_dropdownlist');
            //    }
            //});


            $scope.CreatingGridApi.bindEvent('ValueChange', function (field, item) {

                var colUid = item["colid"];
                $scope.globeColUid["colid"] = colUid;
                $scope.$emit('restore', item["columnEditor"]);


                if (field === "columnEditor") {
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
            function restore() {
                //恢复属性
                for (var prop in $scope.globeOption) {
                    if ($scope.globeOption[prop]) {
                        $scope['wz_' + prop] = $scope.globeOption[prop];
                    }
                }

                //恢复grid数据源
                if ($scope.GridMakerSub1CtrlCache.colDefGridData) {
                    $scope.CreatingGridApi.setData($scope.GridMakerSub1CtrlCache.colDefGridData);
                }

            }

            restore();
        }
    }

    $scope.addItem = function () {
        var item = {
            "colid": Math.uidFast(),
            "columnTitle": "NewTitle" + $scope.GridMakerSub1CtrlCache.colFieldIndex,
            "columnField": "NewField" + $scope.GridMakerSub1CtrlCache.colFieldIndex,
            "columnType": "String",
            "columnEditor": "Text"
        };
        $scope.CreatingGridApi.addItem(item);
        $scope.GridMakerSub1CtrlCache.colFieldIndex++;

        //初始化editor自页面的缓存
        $scope.globeEditorCacheInit();


        // 发出事件 构建history对象
        $scope.globeColUid["colid"] = item["colid"];
        $scope.$emit('restore', item["columnEditor"]);

    }
    $scope.deleteSelectedItems = function () {
        $scope.CreatingGridApi.deleteSelectedItems();
    }

    $scope.showOption = function () {

        if ($scope.GridMakerColDateCtrlCache.wz_required) {
            $scope.GridMakerColDateCtrlCache.wz_required = false;
        } else {
            $scope.GridMakerColDateCtrlCache.wz_required = true;
        }
        // console.log(JSON.stringify($scope.globeOption));
    }


}]).controller('GridMakerSub2Ctrl', ['$scope', '$state', function ($scope, $state) {


    var formatJson = function (json, options) {
        var reg = null,
            formatted = '',
            pad = 0,
            PADDING = '';
        //one can also use '\t' or a different number of spaces
        // optional settings
        options = options || {};
        // remove newline where '{' or '[' follows ':'
        options.newlineAfterColonIfBeforeBraceOrBracket = (options.newlineAfterColonIfBeforeBraceOrBracket === true) ? true : false;
        // use a space after a colon
        options.spaceAfterColon = (options.spaceAfterColon === false) ? false : true;
        // begin formatting...
        if (typeof json !== 'string') {
            // make sure we start with the JSON as a string
            json = JSON.stringify(json);
        } else {
            // is already a string, so parse and re-stringify
            //in order to remove extra whitespace
            json = JSON.parse(json);
            json = JSON.stringify(json);
        }
        // add newline before and after curly braces
        reg = /([\{\}])/g;
        json = json.replace(reg, '\r\n$1\r\n');
        // add newline before and after square brackets
        reg = /([\[\]])/g;
        json = json.replace(reg, '\r\n$1\r\n');
        // add newline after comma
        reg = /(\,)/g;
        json = json.replace(reg, '$1\r\n');
        // remove multiple newlines
        reg = /(\r\n\r\n)/g;
        json = json.replace(reg, '\r\n');
        // remove newlines before commas
        reg = /\r\n\,/g;
        json = json.replace(reg, ',');
        // optional formatting...
        if (!options.newlineAfterColonIfBeforeBraceOrBracket) {
            reg = /\:\r\n\{/g;
            json = json.replace(reg, ':{');
            reg = /\:\r\n\[/g;
            json = json.replace(reg, ':[');
        }
        if (options.spaceAfterColon) {
            reg = /\:/g;
            json = json.replace(reg, ': ');
        }
        $.each(json.split('\r\n'), function (index, node) {
            var i = 0,
                indent = 0,
                padding = '';
            if (node.match(/\{$/) || node.match(/\[$/)) {
                indent = 1;
            } else if (node.match(/\}/) || node.match(/\]/)) {
                if (pad !== 0) {
                    pad -= 1;
                }
            } else {
                indent = 0;
            }
            for (i = 0; i < pad; i++) {
                padding += PADDING;
            }
            formatted += padding + node + '\r\n';
            pad += indent;
        });
        return formatted;
    };


    $scope.jsonStr = formatJson(JSON.stringify($scope.globeOption, null, 4));


}]).controller('GridMakerSub3Ctrl', ['$scope', '$state', function ($scope, $state) {

    console.warn()

}]).controller('GridMakerColStringCtrl', ['$scope', function ($scope) {


    $scope.move = function () {
        //随时保存 鼠标移动就保存
        if ($scope.GridMakerColStringCtrlCache.history[$scope.globeColUid]) {

        } else {
            $scope.GridMakerColStringCtrlCache.history[$scope.globeColUid["colid"]] = {};
        }
        $scope.GridMakerColStringCtrlCache.history[$scope.globeColUid["colid"]].wz_hidden = $scope.GridMakerColStringCtrlCache.wz_hidden;
        $scope.GridMakerColStringCtrlCache.history[$scope.globeColUid["colid"]].wz_width = $scope.GridMakerColStringCtrlCache.wz_width;
        $scope.GridMakerColStringCtrlCache.history[$scope.globeColUid["colid"]].wz_editable = $scope.GridMakerColStringCtrlCache.wz_editable;
        $scope.GridMakerColStringCtrlCache.history[$scope.globeColUid["colid"]].wz_required = $scope.GridMakerColStringCtrlCache.wz_required;

        console.log($scope.globeColUid["colid"]);
        console.log(JSON.stringify($scope.GridMakerColStringCtrlCache.history[$scope.globeColUid["colid"]]));
    }


}]).controller('GridMakerColDateCtrl', ['$scope', function ($scope) {


    //$scope.$on('createOptionNow', function (event,arg) {
    //    createOption(arg);
    //});


    $scope.move = function () {
        //随时保存 鼠标移动就保存
        if ($scope.GridMakerColDateCtrlCache.history[$scope.globeColUid]) {

        } else {
            $scope.GridMakerColDateCtrlCache.history[$scope.globeColUid["colid"]] = {};
        }
        $scope.GridMakerColDateCtrlCache.history[$scope.globeColUid["colid"]].wz_hidden = $scope.GridMakerColDateCtrlCache.wz_hidden;
        $scope.GridMakerColDateCtrlCache.history[$scope.globeColUid["colid"]].wz_width = $scope.GridMakerColDateCtrlCache.wz_width;
        $scope.GridMakerColDateCtrlCache.history[$scope.globeColUid["colid"]].wz_format = $scope.GridMakerColDateCtrlCache.wz_format;
        $scope.GridMakerColDateCtrlCache.history[$scope.globeColUid["colid"]].wz_editable = $scope.GridMakerColDateCtrlCache.wz_editable;
        $scope.GridMakerColDateCtrlCache.history[$scope.globeColUid["colid"]].wz_required = $scope.GridMakerColDateCtrlCache.wz_required;
        $scope.GridMakerColDateCtrlCache.history[$scope.globeColUid["colid"]].wz_minDate = $scope.GridMakerColDateCtrlCache.wz_minDate;
        $scope.GridMakerColDateCtrlCache.history[$scope.globeColUid["colid"]].wz_maxDate = $scope.GridMakerColDateCtrlCache.wz_maxDate;

        console.log($scope.globeColUid["colid"]);
        console.log(JSON.stringify($scope.GridMakerColDateCtrlCache.history[$scope.globeColUid["colid"]]));
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

    $scope.move = function () {
        //随时保存 鼠标移动就保存
        if ($scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid]) {

        } else {
            $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]] = {};
        }
        $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]].wz_hidden = $scope.GridMakerColDropDownListCtrlCache.wz_hidden;
        $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]].wz_width = $scope.GridMakerColDropDownListCtrlCache.wz_width;
        $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]].wz_editable = $scope.GridMakerColDropDownListCtrlCache.wz_editable;
        $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]].wz_required = $scope.GridMakerColDropDownListCtrlCache.wz_required;
        $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]].wz_url = $scope.GridMakerColDropDownListCtrlCache.wz_url;
        $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]].wz_para_item = $scope.GridMakerColDropDownListCtrlCache.wz_para_item;
        $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]].wz_paraField = $scope.GridMakerColDropDownListCtrlCache.wz_paraField;
        $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]].wz_para = $scope.GridMakerColDropDownListCtrlCache.wz_para;
        $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]].wz_data = $scope.GridMakerColDropDownListCtrlCache.wz_data;
        console.log($scope.globeColUid["colid"]);
        console.log(JSON.stringify($scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]]));
    }


}]).controller('GridMakerColComboBoxCtrl', ['$scope', function ($scope) {


    $scope.move = function () {
        //随时保存 鼠标移动就保存
        if ($scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid]) {

        } else {
            $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]] = {};
        }
        $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_hidden = $scope.GridMakerColComboBoxCtrlCache.wz_hidden;
        $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_width = $scope.GridMakerColComboBoxCtrlCache.wz_width;
        $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_editable = $scope.GridMakerColComboBoxCtrlCache.wz_editable;
        $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_required = $scope.GridMakerColComboBoxCtrlCache.wz_required;
        $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_url = $scope.GridMakerColComboBoxCtrlCache.wz_url;
        $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_para_item = $scope.GridMakerColComboBoxCtrlCache.wz_para_item;
        $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_paraField = $scope.GridMakerColComboBoxCtrlCache.wz_paraField;
        $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_para = $scope.GridMakerColComboBoxCtrlCache.wz_para;
        $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_data = $scope.GridMakerColComboBoxCtrlCache.wz_data;

        $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_textField = $scope.GridMakerColComboBoxCtrlCache.wz_textField;
        $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_valueField = $scope.GridMakerColComboBoxCtrlCache.wz_valueField;
        $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_columns = $scope.GridMakerColComboBoxCtrlCache.wz_columns;


        console.log($scope.globeColUid["colid"]);
        console.log(JSON.stringify($scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]]));
    }


}]).controller('GridMakerColDateTimeCtrl', ['$scope', function ($scope) {


    $scope.move = function () {
        //随时保存 鼠标移动就保存
        if ($scope.GridMakerColDateTimeCtrlCache.history[$scope.globeColUid]) {

        } else {
            $scope.GridMakerColDateTimeCtrlCache.history[$scope.globeColUid["colid"]] = {};
        }
        $scope.GridMakerColDateTimeCtrlCache.history[$scope.globeColUid["colid"]].wz_hidden = $scope.GridMakerColDateTimeCtrlCache.wz_hidden;
        $scope.GridMakerColDateTimeCtrlCache.history[$scope.globeColUid["colid"]].wz_width = $scope.GridMakerColDateTimeCtrlCache.wz_width;
        $scope.GridMakerColDateTimeCtrlCache.history[$scope.globeColUid["colid"]].wz_format = $scope.GridMakerColDateTimeCtrlCache.wz_format;
        $scope.GridMakerColDateTimeCtrlCache.history[$scope.globeColUid["colid"]].wz_editable = $scope.GridMakerColDateTimeCtrlCache.wz_editable;
        $scope.GridMakerColDateTimeCtrlCache.history[$scope.globeColUid["colid"]].wz_required = $scope.GridMakerColDateTimeCtrlCache.wz_required;
        $scope.GridMakerColDateTimeCtrlCache.history[$scope.globeColUid["colid"]].wz_minDate = $scope.GridMakerColDateTimeCtrlCache.wz_minDate;
        $scope.GridMakerColDateTimeCtrlCache.history[$scope.globeColUid["colid"]].wz_maxDate = $scope.GridMakerColDateTimeCtrlCache.wz_maxDate;

        console.log($scope.globeColUid["colid"]);
        console.log(JSON.stringify($scope.GridMakerColDateTimeCtrlCache.history[$scope.globeColUid["colid"]]));
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
