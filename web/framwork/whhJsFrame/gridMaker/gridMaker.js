/**
 *
 * 2016-04-18 wangzheng
 * grid快速创建工具
 *
 *
 *
 * 主要是两个流程 一个是存储属性 一个是恢复属性
 * 存储属性 包括主界面sub1 和 各个editoer的配置页面的 值的保存 这部分操作都是通过鼠标事件来激发的
 * 恢复属性 包括主界面属性的恢复 这个在主界面grid构建完成后才开始做      然后是各个editor界面的恢复 这个基于各个界面的cache对象里的history来恢复
 * 主界面恢复 发生在切换会主界面,以及查询grid定义的时候,editor界面的恢复 在点击了具体的某一行col定义的时候 根据colid 从history对象里面取出来
 *
 * 最后是构建对象  和  还原对象
 * 构建对象是把界面属性的cache 构建成一个gridOption 要把combobox等等的columns属性json字符串转为js对象
 * 存储对象 是把构建好的gridOption转成json字符串存储起来  以及把各个cache也转成字符串存储起来
 * 恢复对象 就是从数据库中取出各个cache对象的字符串 转会对象
 *
 * 这里的问题在于 combobox的columns定义 和  data定义 这些 是json字符串 如果格式不对 比如什么换行符之类  就会导致转换错误
 *
 *
 *
 *
 */

App.controller('gridMakerMainCtrl', ['$scope', '$state', '$filter', 'whhHttpService','whhDateService', function ($scope, $state, $filter, whhHttpService,whhDateService) {





//====================================================缓存定义 start=================================================================


    //常量
    $scope.comboBoxDataInitStr = '[{"username":"sample","address":"hangzhou","age":25}]';
    $scope.comboBoxParaInitStr = '{"username":"sample"}';
    $scope.comboBoxColumnsInitStr = '[{"field":"sample", "title":"sample", "width":30}]';

    $scope.dropDownDataInitStr = '[{"text":"hello","value":"world"}]';
    $scope.dropDownParaInitStr = '{"username":"sample"}';



    //全局按钮状态
    $scope.QueryDisable = "";
    $scope.NewDisable = "";
    $scope.SaveDisable = "disabled";
    $scope.newSaveDisable = "disabled";
    $scope.addItemDisable = "disabled";
    $scope.deleteSelectedItemsDisable ="disabled";
    function btn_initState() {  //初始态
        $scope.QueryDisable = "";
        $scope.NewDisable = "";
        $scope.SaveDisable = "disabled";
        $scope.newSaveDisable = "disabled";
        $scope.addItemDisable = "disabled";
        $scope.deleteSelectedItemsDisable ="disabled";
    }

    function btn_alterState() { //修改态
        $scope.QueryDisable = "";
        $scope.NewDisable = "";
        $scope.SaveDisable = "";
        $scope.newSaveDisable = "";
        $scope.addItemDisable = "";
        $scope.deleteSelectedItemsDisable ="";
    }


    //全局option对象 也是最终的grid定义option对象
    $scope.grid_id;
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
        wz_pageSize: 0,
        wz_height: 300,
        wz_groupable: false,
        wz_sortable: false,
        wz_reorderable: true,
        wz_resizable: true,
        wz_title: "NewGrid",
        wz_groupable: false,
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
        editor_wz_data:{},
        editor_wz_para:{},
        history: {"colid": {}}
    };
    //缓存 存放这个设置界面最原始的信息
    $scope.GridMakerColComboBoxCtrlCache = {
        editor_wz_data:{},
        editor_wz_columns:{},
        editor_wz_para:{},
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
    $scope.$on('$viewContentLoaded', function (event, viewName) {


        //$viewContentLoaded
        //Fired once the view is loaded, after the DOM is rendered.
        // 这里 这个DOM已经渲染好了的 为什么还是无法获取到div的jquery对象?
        // 事实证明 执行到这里的时候 只是gridMakerColDetailView 这个view的框子准备好了 里面的内容并没有出来
        // 比如这个view的模版里有一个div 这个div此时并没有加载出来的 所以是获取不到的!
       //alert(viewName);
        if( viewName=="gridMakerColDetailView@main.init.gridMaker"){
            if($state.is('main.init.gridMaker.sub1.editor_combobox')){
                $scope.GridMakerColComboBoxCtrlCache.editor_wz_data = ace.edit("wz_data");
                $scope.GridMakerColComboBoxCtrlCache.editor_wz_data.setTheme("ace/theme/monokai");//twilight tomorrow_night_bright
                $scope.GridMakerColComboBoxCtrlCache.editor_wz_data.setReadOnly(false);
                $scope.GridMakerColComboBoxCtrlCache.editor_wz_data.setFontSize(12);
                $scope.GridMakerColComboBoxCtrlCache.editor_wz_data.renderer.setShowGutter(false);
                $scope.GridMakerColComboBoxCtrlCache.editor_wz_data.session.setMode("ace/mode/json");
                $scope.GridMakerColComboBoxCtrlCache.editor_wz_data.setValue($scope.comboBoxDataInitStr);


                $scope.GridMakerColComboBoxCtrlCache.editor_wz_columns = ace.edit("wz_columns");
                $scope.GridMakerColComboBoxCtrlCache.editor_wz_columns.setTheme("ace/theme/monokai");//twilight tomorrow_night_bright
                $scope.GridMakerColComboBoxCtrlCache.editor_wz_columns.setReadOnly(false);
                $scope.GridMakerColComboBoxCtrlCache.editor_wz_columns.setFontSize(12);
                $scope.GridMakerColComboBoxCtrlCache.editor_wz_columns.renderer.setShowGutter(false);
                $scope.GridMakerColComboBoxCtrlCache.editor_wz_columns.session.setMode("ace/mode/json");
                $scope.GridMakerColComboBoxCtrlCache.editor_wz_columns.setValue($scope.comboBoxColumnsInitStr);

                $scope.GridMakerColComboBoxCtrlCache.editor_wz_para = ace.edit("wz_para");
                $scope.GridMakerColComboBoxCtrlCache.editor_wz_para.setTheme("ace/theme/monokai");//twilight tomorrow_night_bright
                $scope.GridMakerColComboBoxCtrlCache.editor_wz_para.setReadOnly(false);
                $scope.GridMakerColComboBoxCtrlCache.editor_wz_para.setFontSize(12);
                $scope.GridMakerColComboBoxCtrlCache.editor_wz_para.renderer.setShowGutter(false);
                $scope.GridMakerColComboBoxCtrlCache.editor_wz_para.session.setMode("ace/mode/json");
                $scope.GridMakerColComboBoxCtrlCache.editor_wz_para.setValue($scope.comboBoxParaInitStr);
            }
            if($state.is('main.init.gridMaker.sub1.editor_dropdownlist')){
                $scope.GridMakerColDropDownListCtrlCache.editor_wz_data = ace.edit("wz_data");
                $scope.GridMakerColDropDownListCtrlCache.editor_wz_data.setTheme("ace/theme/monokai");//twilight tomorrow_night_bright
                $scope.GridMakerColDropDownListCtrlCache.editor_wz_data.setReadOnly(false);
                $scope.GridMakerColDropDownListCtrlCache.editor_wz_data.setFontSize(12);
                $scope.GridMakerColDropDownListCtrlCache.editor_wz_data.renderer.setShowGutter(false);
                $scope.GridMakerColDropDownListCtrlCache.editor_wz_data.session.setMode("ace/mode/json");
                $scope.GridMakerColDropDownListCtrlCache.editor_wz_data.setValue($scope.dropDownDataInitStr);

                $scope.GridMakerColDropDownListCtrlCache.editor_wz_para = ace.edit("wz_para");
                $scope.GridMakerColDropDownListCtrlCache.editor_wz_para.setTheme("ace/theme/monokai");//twilight tomorrow_night_bright
                $scope.GridMakerColDropDownListCtrlCache.editor_wz_para.setReadOnly(false);
                $scope.GridMakerColDropDownListCtrlCache.editor_wz_para.setFontSize(12);
                $scope.GridMakerColDropDownListCtrlCache.editor_wz_para.renderer.setShowGutter(false);
                $scope.GridMakerColDropDownListCtrlCache.editor_wz_para.session.setMode("ace/mode/json");
                $scope.GridMakerColDropDownListCtrlCache.editor_wz_para.setValue($scope.dropDownParaInitStr);
            }
        }

        if( viewName=="gridMakerView@main.init.gridMaker"){
            if($state.is('main.init.gridMaker.sub2')){
                var formatJson = function (txt,compress/*是否为压缩模式*/){/* 格式化JSON源码(对象转换为JSON文本) */
                    var indentChar = '    ';
                    if(/^\s*$/.test(txt)){
                        alert('数据为空,无法格式化! ');
                        return;
                    }
                    try{var data=eval('('+txt+')');}
                    catch(e){
                        alert('数据源语法错误,格式化失败! 错误信息: '+e.description,'err');
                        return;
                    };
                    var draw=[],last=false,This=this,line=compress?'':'\n',nodeCount=0,maxDepth=0;

                    var notify=function(name,value,isLast,indent/*缩进*/,formObj){
                        nodeCount++;/*节点计数*/
                        for (var i=0,tab='';i<indent;i++ )tab+=indentChar;/* 缩进HTML */
                        tab=compress?'':tab;/*压缩模式忽略缩进*/
                        maxDepth=++indent;/*缩进递增并记录*/
                        if(value&&value.constructor==Array){/*处理数组*/
                            draw.push(tab+(formObj?('"'+name+'":'):'')+'['+line);/*缩进'[' 然后换行*/
                            for (var i=0;i<value.length;i++)
                                notify(i,value[i],i==value.length-1,indent,false);
                            draw.push(tab+']'+(isLast?line:(','+line)));/*缩进']'换行,若非尾元素则添加逗号*/
                        }else   if(value&&typeof value=='object'){/*处理对象*/
                            draw.push(tab+(formObj?('"'+name+'":'):'')+'{'+line);/*缩进'{' 然后换行*/
                            var len=0,i=0;
                            for(var key in value)len++;
                            for(var key in value)notify(key,value[key],++i==len,indent,true);
                            draw.push(tab+'}'+(isLast?line:(','+line)));/*缩进'}'换行,若非尾元素则添加逗号*/
                        }else{
                            if(typeof value=='string')value='"'+value+'"';
                            draw.push(tab+(formObj?('"'+name+'":'):'')+value+(isLast?'':',')+line);
                        };
                    };
                    var isLast=true,indent=0;
                    notify('',data,isLast,indent,false);
                    return draw.join('');
                }

                var tempObj = jQuery.extend({},$scope.globeOption,true);
                tempObj.info="构建GridOption的中间层json 会被用于转换成构建WhhGrid所需的真正的option对象";
                tempObj.infoTime = "构建时间: "+whhDateService.dateTimeToString(new Date());

                var jsonStr = formatJson(JSON.stringify(tempObj, null, 4),false);

                var editor = ace.edit("sub2editor");
                editor.setTheme("ace/theme/monokai");//twilight tomorrow_night_bright
                editor.setReadOnly(true);
                editor.setFontSize(13);
                editor.session.setMode("ace/mode/json");
                editor.setValue(jsonStr);
            }
        }

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
                    $scope.GridMakerColDateCtrlCache.wz_minDate = whhDateService.StringToDateTime($scope.GridMakerColDateCtrlCache.history[$scope.globeColUid["colid"]].wz_minDate);
                    $scope.GridMakerColDateCtrlCache.wz_maxDate = whhDateService.StringToDateTime($scope.GridMakerColDateCtrlCache.history[$scope.globeColUid["colid"]].wz_maxDate);
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
                    $scope.GridMakerColDateTimeCtrlCache.wz_minDate = whhDateService.StringToDateTime($scope.GridMakerColDateTimeCtrlCache.history[$scope.globeColUid["colid"]].wz_minDate);
                    $scope.GridMakerColDateTimeCtrlCache.wz_maxDate = whhDateService.StringToDateTime($scope.GridMakerColDateTimeCtrlCache.history[$scope.globeColUid["colid"]].wz_maxDate);
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
                //alert("state.go('main.init.gridMaker.sub1.editor_combobox')");
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


                    //复原代码编辑框
                    if($scope.GridMakerColComboBoxCtrlCache.wz_data!=$scope.comboBoxDataInitStr   && $scope.GridMakerColComboBoxCtrlCache.wz_data !=""){
                        $scope.GridMakerColComboBoxCtrlCache.editor_wz_data.setValue($scope.GridMakerColComboBoxCtrlCache.wz_data);
                    }
                    if($scope.GridMakerColComboBoxCtrlCache.wz_columns!=$scope.comboBoxColumnsInitStr   && $scope.GridMakerColComboBoxCtrlCache.wz_columns !=""){
                        $scope.GridMakerColComboBoxCtrlCache.editor_wz_columns.setValue($scope.GridMakerColComboBoxCtrlCache.wz_columns);
                    }
                    if($scope.GridMakerColComboBoxCtrlCache.wz_para!=$scope.comboBoxParaInitStr   && $scope.GridMakerColComboBoxCtrlCache.wz_para !=""){
                        $scope.GridMakerColComboBoxCtrlCache.editor_wz_para.setValue($scope.GridMakerColComboBoxCtrlCache.wz_para);
                    }
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

                    if($scope.GridMakerColDropDownListCtrlCache.wz_data!=$scope.dropDownDataInitStr && $scope.GridMakerColDropDownListCtrlCache.wz_data !=""){
                        $scope.GridMakerColDropDownListCtrlCache.editor_wz_data.setValue($scope.GridMakerColDropDownListCtrlCache.wz_data);
                    }
                    if($scope.GridMakerColDropDownListCtrlCache.wz_para!=$scope.dropDownParaInitStr && $scope.GridMakerColDropDownListCtrlCache.wz_para !=""){
                        $scope.GridMakerColDropDownListCtrlCache.editor_wz_para.setValue($scope.GridMakerColDropDownListCtrlCache.wz_para);
                    }

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
        $state.go('main.init.gridMaker.sub2').then(function success(){






        },function error(){});
    }
    $scope.toSub3 = function () {
        createOption();
        $state.go('main.init.gridMaker.sub3');
    }
//====================================================页面跳转 end=================================================================


//====================================================初始化缓存 start=================================================================
    $scope.globeEditorCacheInit = function (ifInitSub1) {
        // 设置过editor属性以后 这几个cache的current值会变化 在我新增行的时候 我需要做一个初始化

        if (ifInitSub1) {
            $scope.GridMakerSub1CtrlCache["colFieldIndex"] = 0;
            $scope.GridMakerSub1CtrlCache["colDefGridData"] = [];
            $scope.GridMakerSub1CtrlCache["wz_editable"] = true;
            $scope.GridMakerSub1CtrlCache["wz_selectCheckBox"] = false;
            $scope.GridMakerSub1CtrlCache["wz_selectable"] = "row";
            $scope.GridMakerSub1CtrlCache["wz_pageable"] = false;
            $scope.GridMakerSub1CtrlCache["wz_pageSize"] = 0;
            $scope.GridMakerSub1CtrlCache["wz_height"] = 300;
            $scope.GridMakerSub1CtrlCache["wz_groupable"] = false;
            $scope.GridMakerSub1CtrlCache["wz_sortable"] = false;
            $scope.GridMakerSub1CtrlCache["wz_reorderable"] = true;
            $scope.GridMakerSub1CtrlCache["wz_resizable"] = true;
            $scope.GridMakerSub1CtrlCache["wz_title"] = "NewGrid";
            $scope.GridMakerSub1CtrlCache["wz_groupable"] = false;
            if ($scope.GridMakerSub1CtrlCache.CreatingGridApi) {
                $scope.GridMakerSub1CtrlCache.CreatingGridApi.deleteAllItem();
            }
        }


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
        //为了把构建columns的顺序也根据用户的上移下移的顺序来调整
        var tempCols = [];
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
                tempCols[i] = $scope.globeOption.columns[j];
            } else {
                var colDef = {};
                colDef.field = colList[i].columnField;
                colDef.title = colList[i].columnTitle;
                colDef.type = colList[i].columnType;
                colDef.colid = colList[i].colid;
                colDef.columnEditor = colList[i].columnEditor;
                tempCols[i] = colDef;
               // $scope.globeOption.columns.push(colDef);
            }
        }
        $scope.globeOption.columns = tempCols;

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

                try{
                    if (cache["wz_para"] && cache["wz_para"].replace(/(^\s*)|(\s*$)/g, "") !== "") {
                        //做json字符串到json对象的转换
                        $scope.globeOption.columns[i].editorConfig.para = JSON.parse(cache["wz_para"])
                    }

                    if (cache["wz_data"] && cache["wz_data"].replace(/(^\s*)|(\s*$)/g, "") !== "") {
                        //做json字符串到json对象的转换
                        $scope.globeOption.columns[i].editorConfig.data = JSON.parse(cache["wz_data"])
                    }
                }catch (err){
                    alert("参数 和 本地数据 json转换出错");
                    return;
                }



                // 如果要用整行做参数 就删掉para 和 paraField
                if (cache["wz_para_item"]) {
                    delete $scope.globeOption.columns[i].editorConfig.para;
                    delete $scope.globeOption.columns[i].editorConfig.paraField;
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



                try{
                    if (cache["wz_para"] && cache["wz_para"].replace(/(^\s*)|(\s*$)/g, "") !== "") {
                        //做json字符串到json对象的转换
                        $scope.globeOption.columns[i].editorConfig.para = JSON.parse(cache["wz_para"])
                    }
                    if (cache["wz_data"] && cache["wz_data"].replace(/(^\s*)|(\s*$)/g, "") !== "") {
                        //做json字符串到json对象的转换
                        $scope.globeOption.columns[i].editorConfig.data = JSON.parse(cache["wz_data"])
                    }
                    if (cache["wz_columns"] && cache["wz_columns"].replace(/(^\s*)|(\s*$)/g, "") !== "") {
                        //做json字符串到json对象的转换
                        $scope.globeOption.columns[i].editorConfig.columns = JSON.parse(cache["wz_columns"])
                    }
                }catch (err){
                    alert("参数 columns 或者 data 的json转换出错")
                    return;
                }


                // 如果要用整行做参数 就删掉para 和 paraField
                if (cache["wz_para_item"]) {
                    delete $scope.globeOption.columns[i].editorConfig.para;
                    delete $scope.globeOption.columns[i].editorConfig.paraField;
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


    $scope.saveGridDef = function () {

        // 说明还没有新建Grid
        if (!$scope.grid_id) {
            alert("请先点击新建按钮");
        }

        createOption();


        if ($scope.grid_name && $scope.grid_name != "") {

        } else {
            alert("请输入grid的name");
            return;
        }

        var gridInfoPkg = {};

        gridInfoPkg.grid_id = $scope.grid_id;//Math.uidFast();
        gridInfoPkg.grid_name = $scope.grid_name;


        gridInfoPkg.globe_option = jQuery.extend({},$scope.globeOption,true);
        for(var i=0;i<gridInfoPkg.globe_option.columns.length;i++){
            if(gridInfoPkg.globe_option.columns[i].editorConfig){
                if(gridInfoPkg.globe_option.columns[i].editorConfig.editorType==editorTypeEnum.DatePicker){
                    if(gridInfoPkg.globe_option.columns[i].validation){
                        if(gridInfoPkg.globe_option.columns[i].validation.min){
                            gridInfoPkg.globe_option.columns[i].validation.min = whhDateService.dateToString(gridInfoPkg.globe_option.columns[i].validation.min);
                        }
                        if(gridInfoPkg.globe_option.columns[i].validation.max){
                            gridInfoPkg.globe_option.columns[i].validation.max = whhDateService.dateToString(gridInfoPkg.globe_option.columns[i].validation.max);
                        }
                    }
                }
                if(gridInfoPkg.globe_option.columns[i].editorConfig.editorType==editorTypeEnum.DateTimePicker){  //是日期控件
                    if(gridInfoPkg.globe_option.columns[i].validation){   //有validation
                        if(gridInfoPkg.globe_option.columns[i].validation.min){  //有min
                            gridInfoPkg.globe_option.columns[i].validation.min = whhDateService.dateTimeToString(gridInfoPkg.globe_option.columns[i].validation.min);
                        }
                        if(gridInfoPkg.globe_option.columns[i].validation.max){
                            gridInfoPkg.globe_option.columns[i].validation.max = whhDateService.dateTimeToString(gridInfoPkg.globe_option.columns[i].validation.max);
                        }
                    }
                }
            }
        }


        gridInfoPkg.grid_cache_option = {};
        gridInfoPkg.grid_cache_option.GridMakerSub1CtrlCache = jQuery.extend({},$scope.GridMakerSub1CtrlCache,true);
        delete gridInfoPkg.grid_cache_option.GridMakerSub1CtrlCache.CreatingGridApi;



        gridInfoPkg.grid_cache_option.GridMakerColDateCtrlCache = jQuery.extend({},$scope.GridMakerColDateCtrlCache,true);
        for(var innercolid in gridInfoPkg.grid_cache_option.GridMakerColDateCtrlCache.history ){

            gridInfoPkg.grid_cache_option.GridMakerColDateCtrlCache.history[innercolid].wz_maxDate = whhDateService.dateToString(gridInfoPkg.grid_cache_option.GridMakerColDateCtrlCache.history[innercolid].wz_maxDate);
            gridInfoPkg.grid_cache_option.GridMakerColDateCtrlCache.history[innercolid].wz_minDate = whhDateService.dateToString(gridInfoPkg.grid_cache_option.GridMakerColDateCtrlCache.history[innercolid].wz_minDate);
        }

        gridInfoPkg.grid_cache_option.GridMakerColDateTimeCtrlCache = jQuery.extend({},$scope.GridMakerColDateTimeCtrlCache,true);
        for(var innercolid in gridInfoPkg.grid_cache_option.GridMakerColDateTimeCtrlCache.history ){

            gridInfoPkg.grid_cache_option.GridMakerColDateTimeCtrlCache.history[innercolid].wz_maxDate = whhDateService.dateTimeToString(gridInfoPkg.grid_cache_option.GridMakerColDateTimeCtrlCache.history[innercolid].wz_maxDate);
            gridInfoPkg.grid_cache_option.GridMakerColDateTimeCtrlCache.history[innercolid].wz_minDate = whhDateService.dateTimeToString(gridInfoPkg.grid_cache_option.GridMakerColDateTimeCtrlCache.history[innercolid].wz_minDate);

        }



        gridInfoPkg.grid_cache_option.GridMakerColStringCtrlCache = jQuery.extend({},$scope.GridMakerColStringCtrlCache,true);

        //这种有大段json字符串的 还带各种换行的 存回去再取出来会有问题 格式会有问题的
        gridInfoPkg.grid_cache_option.GridMakerColDropDownListCtrlCache = jQuery.extend({},$scope.GridMakerColDropDownListCtrlCache,true);
        //for(var innercolid in gridInfoPkg.grid_cache_option.GridMakerColDropDownListCtrlCache.history ){
        //    gridInfoPkg.grid_cache_option.GridMakerColDropDownListCtrlCache.history[innercolid].wz_para =  JSON.parse(gridInfoPkg.grid_cache_option.GridMakerColDropDownListCtrlCache.history[innercolid].wz_para);
        //    gridInfoPkg.grid_cache_option.GridMakerColDropDownListCtrlCache.history[innercolid].wz_data =  JSON.parse(gridInfoPkg.grid_cache_option.GridMakerColDropDownListCtrlCache.history[innercolid].wz_data);
        //}


        gridInfoPkg.grid_cache_option.GridMakerColComboBoxCtrlCache =jQuery.extend({},$scope.GridMakerColComboBoxCtrlCache,true);
        //for(var innercolid in gridInfoPkg.grid_cache_option.GridMakerColComboBoxCtrlCache.history ){
        //    gridInfoPkg.grid_cache_option.GridMakerColComboBoxCtrlCache.history[innercolid].wz_para =  JSON.parse(gridInfoPkg.grid_cache_option.GridMakerColComboBoxCtrlCache.history[innercolid].wz_para);
        //    gridInfoPkg.grid_cache_option.GridMakerColComboBoxCtrlCache.history[innercolid].wz_data =  JSON.parse(gridInfoPkg.grid_cache_option.GridMakerColComboBoxCtrlCache.history[innercolid].wz_data);
        //    gridInfoPkg.grid_cache_option.GridMakerColComboBoxCtrlCache.history[innercolid].wz_columns =  JSON.parse(gridInfoPkg.grid_cache_option.GridMakerColComboBoxCtrlCache.history[innercolid].wz_columns);
        //}


        delete gridInfoPkg.grid_cache_option.GridMakerColComboBoxCtrlCache.editor_wz_columns;
        delete gridInfoPkg.grid_cache_option.GridMakerColComboBoxCtrlCache.editor_wz_data;
        delete gridInfoPkg.grid_cache_option.GridMakerColComboBoxCtrlCache.editor_wz_para;

        delete gridInfoPkg.grid_cache_option.GridMakerColDropDownListCtrlCache.editor_wz_data;
        delete gridInfoPkg.grid_cache_option.GridMakerColDropDownListCtrlCache.editor_wz_para;


        whhHttpService.request("GridDefService/uploadLoadGridDef.json", gridInfoPkg).success(function (data, status, headers, config) {
            alert("保存成功");
        }).error(function (data, status, headers, config) {
            alert("上传出错");
        });


    }

    $scope.queryGridDef = function () {

        whhHttpService.request("GridDefService/queryGridDef.json", {"grid_name": $scope.grid_name}).success(function (data, status, headers, config) {


            $scope.grid_id = data.grid_id;


            try{
                var grid_cache_option = JSON.parse(data.grid_cache_option)
            }catch(err){
                alert("json转换出错");
                return;
            }

            //改变界面按钮的状态
            btn_alterState();

            //准备开始恢复
            delete grid_cache_option.GridMakerSub1CtrlCache.CreatingGridApi; //这个CreatingGridApi可不能覆盖

            for (var prop in grid_cache_option.GridMakerSub1CtrlCache) {
                $scope.GridMakerSub1CtrlCache[prop] = grid_cache_option.GridMakerSub1CtrlCache[prop];
            }
            //$scope.GridMakerSub1CtrlCache = grid_cache_option.GridMakerSub1CtrlCache;


            //可以直接赋值 但是GridMakerColDateCtrlCache的话 还得做个转换 因为存到数据库再取出来转换成对象 maxDate这种Date类型的数据已经变成字符串了
            //得在这里手动再转换一下 需要统一标准  date 就是 yyyy-MM-dd   dateTime 就是yyyy-MM-dd HH:mm:ss  在传入后台之前我们就应该转化为字符串 不要让后台参与
            $scope.GridMakerColStringCtrlCache = grid_cache_option.GridMakerColStringCtrlCache;
            $scope.GridMakerColDateCtrlCache = grid_cache_option.GridMakerColDateCtrlCache;
            $scope.GridMakerColDateTimeCtrlCache = grid_cache_option.GridMakerColDateTimeCtrlCache;
            $scope.GridMakerColDropDownListCtrlCache = grid_cache_option.GridMakerColDropDownListCtrlCache;
            $scope.GridMakerColComboBoxCtrlCache = grid_cache_option.GridMakerColComboBoxCtrlCache;

            //每个编辑器页面的恢复不用担心因为有history对象
            //关键是把列定义的grid填充回去
            $scope.GridMakerSub1CtrlCache.CreatingGridApi.deleteAllItem();
            for (var i = 0; i < $scope.GridMakerSub1CtrlCache.colDefGridData.length; i++) {
                $scope.GridMakerSub1CtrlCache.CreatingGridApi.addItem($scope.GridMakerSub1CtrlCache.colDefGridData[i]);
            }


        }).error(function (data, status, headers, config) {
            alert("出错");
        });


    }


    $scope.createGridDef = function () {
        btn_alterState();
        $scope.grid_id = Math.uidFast();
        $scope.grid_name = "NewGrid " + $filter('date')(new Date(), 'yyyy-MM-dd HH:mm:ss');

        //做初始化
        $scope.globeEditorCacheInit(true);
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


            //启动的时候 执行一次初始化! 这很重要  但是不要把col定义grid给初始化了 切记
            $scope.globeEditorCacheInit(false);


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
                //恢复属性  感觉不需要这样的恢复了 因为属性都存在$scope.GridMakerSub1CtrlCache里面 就算你换页面也没有变化 不需要做恢复
                //for (var prop in $scope.globeOption) {
                //    if ($scope.globeOption[prop]) {
                //        $scope['wz_' + prop] = $scope.globeOption[prop];
                //    }
                //}

                //恢复grid数据源
                if ($scope.GridMakerSub1CtrlCache.colDefGridData.length>0) {
                    $scope.CreatingGridApi.setData($scope.GridMakerSub1CtrlCache.colDefGridData);
                }
            }

            // 主界面的restore只能在这里做,因为主界面有一个grid 必须要等这个grid构建完成了才可以做restore 所以只有在这里可以保证这个grid是构建完成的
            //感觉我还是不太喜欢这种写法 有没有办法使用promise来实现同步的写法 就可以不用写在这个里面了
            //感觉比较难 promise对象只能在whhgrid内部创建出来 那能不能从外部穿一个promise对象进去呢? 直接放在option对象里穿进去,然后whhGrid内部对这个promise做reject 之类的
            //然后就可以使用这个promise 了 就不需要把事件绑定之类的都写到这个里面来了.但是我觉得这样似乎并没有方便多少的感觉
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
        $scope.globeEditorCacheInit(false);


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


    $scope.toUp = function () {
        //var currentItem = $scope.CreatingGridApi.getSelectedItems()[0];
        var arr = $scope.CreatingGridApi.getSelectedItems();


        if(arr.length>=1){

            var items = $scope.CreatingGridApi.dataSource.data();


            var j = $scope.CreatingGridApi.dataSource.indexOf(arr[0]);
            var temp = items[j-1];
            items[j-1] = items[j];
            items[j] = temp;

            //var j=2;
            //var temp = items[j-1];
            //items[j-1] = items[j];
            //items[j] = temp;

            //for (var j=0; j< items.length ;  j++) {
            //    if(arr[0]["uid"] == items[j]["uid"]){
            //
            //        //做替换
            //        var temp = items[j-1];
            //        items[j-1] = items[j];
            //        items[j] = temp;
            //
            //        break;
            //    }
            //}

            $scope.CreatingGridApi.dataSource.data(items);


            //$scope.CreatingGridApi.widget.select().addClass("k-state-selected");

            //更换位置后 还要保持这一行的选中状态
            //var newIndex = $scope.CreatingGridApi.dataSource.indexOf(arr[0]);
            //$scope.CreatingGridApi.widget.select("tr:eq("+(j-1)+")");
            $scope.CreatingGridApi.selectItem(j-1);

        }


    }
    $scope.toDown = function () {
        var arr = $scope.CreatingGridApi.getSelectedItems();
        if(arr.length>=1){
            var items = $scope.CreatingGridApi.dataSource.data();
            var j = $scope.CreatingGridApi.dataSource.indexOf(arr[0]);


            var temp = items[j+1];
            items[j+1] = items[j];
            items[j] = temp;

            $scope.CreatingGridApi.dataSource.data(items);
            //$scope.CreatingGridApi.widget.select("tr:eq("+(j+1)+")");
            $scope.CreatingGridApi.selectItem(j+1)
        }
    }

    $scope.getSelectItem= function () {

        var arr = $scope.CreatingGridApi.getSelectedItems();
        var info = "---------------getSelectedItems1 grid1------------- <br>"
        for (var i = 0; i < arr.length; i++) {
            info = info + arr[i]["columnField"] + "<br>";
            info = info + "<br>"
        }

        alert(info);
    }

}]).controller('GridMakerSub2Ctrl', ['$scope', '$state', function ($scope, $state) {







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
        //$scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]].wz_para = $scope.GridMakerColDropDownListCtrlCache.wz_para;


        //代码编辑器中的内容 存入history
        if($scope.GridMakerColDropDownListCtrlCache.editor_wz_data.getValue() != $scope.dropDownDataInitStr){
            $scope.GridMakerColDropDownListCtrlCache.wz_data = $scope.GridMakerColDropDownListCtrlCache.editor_wz_data.getValue();
            $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]].wz_data = $scope.GridMakerColDropDownListCtrlCache.wz_data;
        }else{
            $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]].wz_data ="";
        }

        if($scope.GridMakerColDropDownListCtrlCache.editor_wz_para.getValue() != $scope.dropDownParaInitStr) {
            $scope.GridMakerColDropDownListCtrlCache.wz_para = $scope.GridMakerColDropDownListCtrlCache.editor_wz_para.getValue();
            $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]].wz_para = $scope.GridMakerColDropDownListCtrlCache.wz_para;
        }else {
            $scope.GridMakerColDropDownListCtrlCache.history[$scope.globeColUid["colid"]].wz_para = "";

        }


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
        //$scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_para = $scope.GridMakerColComboBoxCtrlCache.wz_para;


        $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_textField = $scope.GridMakerColComboBoxCtrlCache.wz_textField;
        $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_valueField = $scope.GridMakerColComboBoxCtrlCache.wz_valueField;


        if($scope.GridMakerColComboBoxCtrlCache.editor_wz_data.getValue() != $scope.comboBoxDataInitStr) {
            $scope.GridMakerColComboBoxCtrlCache.wz_data = $scope.GridMakerColComboBoxCtrlCache.editor_wz_data.getValue();
            $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_data = $scope.GridMakerColComboBoxCtrlCache.wz_data;
        }else {
            $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_data = "";
        }

        if($scope.GridMakerColComboBoxCtrlCache.editor_wz_columns.getValue() != $scope.comboBoxColumnsInitStr) {
            $scope.GridMakerColComboBoxCtrlCache.wz_columns = $scope.GridMakerColComboBoxCtrlCache.editor_wz_columns.getValue();
            $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_columns = $scope.GridMakerColComboBoxCtrlCache.wz_columns;
        }else {
            $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_columns = "";
        }


        if($scope.GridMakerColComboBoxCtrlCache.editor_wz_para.getValue() != $scope.comboBoxParaInitStr) {
            $scope.GridMakerColComboBoxCtrlCache.wz_para = $scope.GridMakerColComboBoxCtrlCache.editor_wz_para.getValue();
            $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_para = $scope.GridMakerColComboBoxCtrlCache.wz_para;
        }else{
            $scope.GridMakerColComboBoxCtrlCache.history[$scope.globeColUid["colid"]].wz_para ="";
        }
        //if($scope.GridMakerColComboBoxCtrlCache.wz_columns){
        //    $scope.GridMakerColComboBoxCtrlCache.editor_wz_data.setValue(JSON.stringify($scope.GridMakerColComboBoxCtrlCache.wz_columns));
        //}else{
        //    $scope.GridMakerColComboBoxCtrlCache.editor_wz_data.setValue('[{"sample":"helloWorld","address":"hangzhou","age":25}]');
        //}

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
