/**
 * Created by wangzheng 12897 on 16/3/30.
 *
 */
//angular.module('whh.grid', [])
App.directive('ngWhhGrid', function () {//编写grid对应的指令

    return {

        restrict: "E",
        replace: true,
        scope: {
            option: "=" // 双向绑定过来
        },//e6e6e6
        template: '<div><div class="whhGridMainTitle" style="border-color: dimgrey;border-width: 1px;border-style: solid;border-bottom-width: 0px;"></div><div class="whhGridMainContent"></div></div>',
        controller: ['$scope', '$http', function ($scope, $http) {


            //便捷使用
            $scope.$http = $http;


            // 创建暴露给外部的API
            $scope.widgetApi = {};
            $scope.widgetApi.modifyCache = {
                insertItems: [],
                updateItems: [],
                deleteItems: []
            };




            //各种事件处理器集合





            //事件处理方法
            $scope.eventHanders = {
                "Select":[],
                "Editing":[],
                "ValueChange":[]
            }
            $scope.widgetApi.bindEvent = function bindEvent(eventName,func){
                var identifier = Math.uidFast();
                var handler = {identifier:identifier,handler:func};
                $scope.eventHanders[eventName].push(handler);
                return identifier;
            }
            $scope.widgetApi.unBindEvent = function unBindEvent(eventName,identifier){
                for(var i=$scope.eventHanders[eventName].length-1;i>=0;i--){
                    if($scope.eventHanders[eventName][i].identifier == identifier){
                        $scope.eventHanders[eventName].splice(i,1);
                        break;
                    }
                }
            }
            $scope.widgetApi.clearBindEvent = function clearBindEvent(eventName){
                $scope.eventHanders[eventName].length = 0;
            }



            $scope.widgetApi.query = function (para) {
                $http({
                    url: para["url"],
                    method: para["method"],
                    headers: { 'needUiBlock': true}, // 加上这一句 在做http请求的时候会提供界面屏蔽
                    data:para["data"]
                }).success(function (data, status, header, config) {
                    $scope.gridApi.setData(data);
                });
            }


            $scope.widgetApi.setData = function (data) {

                // 直接给数据源加data 是不会触发change事件里的add操作的 这样正合我意,
                // 因为数据查询出来的话 本来就不需要作为insertItems 出现
                // 如果不是从后台查询出来的数据 直接set进来 那这个数据是不带oid的
                // 事实是 只要是从后台数据库过来的数据 一定都是有oid的   如果不是数据库来的 没有oid 那么如何记录呢?
                // 那就要自己创建oid  这就意味着抛弃服务器过来的oid 完全靠自己前端实现
                for(var i=0;i<data.length;i++){
                    data[i]["oid"] = "wz_init_"+Math.uidFast();
                }

                $scope.widgetApi.dataSource.data(data);
                $scope.selectedRowItems.length = 0;//要清除选中行
            }

            $scope.widgetApi.getData = function (data) {
                return jQuery.extend(true, [], $scope.widgetApi.dataSource.data());
            }

            $scope.widgetApi.deleteSelectedItemsWithAlert = function () {
                // 方式1 使用grid自己的删除功能 会弹出是否删除的提示框 这个我们不需要
                var selectedRows = $scope.grid.select();
                for (var i = 0; i < selectedRows.length; i++) {
                    var dataItem = $scope.grid.removeRow(selectedRows[i]);
                }
            }

            // 删除方法 暂时有这个就够了 一般都是删除选中行嘛
            $scope.widgetApi.deleteSelectedItems = function () {

                //var selectedRows = $scope.grid.select();
                //var selectedDataItems = [];
                //for (var i = 0; i < selectedRows.length; i++) {
                //    var dataItem = $scope.grid.dataItem(selectedRows[i]);
                //    $scope.innerOptions.dataSource.remove(dataItem);
                //}


                for (var j = $scope.selectedRowItems.length - 1; j >= 0; j--) {
                    var dataItem = $scope.widgetApi.dataSource.getByUid($scope.selectedRowItems[j]);
                    $scope.widgetApi.dataSource.remove(dataItem);
                }

                //var selectedDataItems = [];
                //for (var i = 0; i < $scope.selectedRowItems.length; i++) {
                //    var dataItem = $scope.grid.dataSource.getByUid($scope.selectedRowItems[i]);
                //    selectedDataItems.push(dataItem);
                //}
            }
            $scope.widgetApi.addItem = function (item) {

                //先检查是否有字段是单列下拉或者多列下拉 如果是的话 必须要赋一个初始值 否则会出问题的
                for (var i = 0; i < $scope.option.columns.length; i++) {
                    if ($scope.option.columns[i].editorConfig != undefined) {
                        if ($scope.option.columns[i].editorConfig.editorType == editorTypeEnum.DropDownList ||
                            $scope.option.columns[i].editorConfig.editorType == editorTypeEnum.ComboBox
                        ) {
                            if (item [$scope.option.columns[i].field] == undefined) {
                                item [$scope.option.columns[i].field] = "_";
                            }
                        }
                    }
                }

                var observable = new kendo.data.ObservableObject(item);
                var dataItem = $scope.widgetApi.dataSource.insert(0, observable);

                var index = $scope.widgetApi.dataSource.indexOf(dataItem);
                return index;
            }


            $scope.widgetApi.deleteItem = function (index) {
                $scope.widgetApi.dataSource.remove($scope.widgetApi.dataSource.at(index));

            }

            $scope.widgetApi.updateItem = function (index, para) {
                //还是要根据uid来做更新  一般我们的用法都是要循环更新一个Grid里面的某些内容

                //var innerItem = $scope.widgetApi.dataSource.getByUid(item.uid);
                //var index = $scope.widgetApi.dataSource.indexOf(innerItem);

                for (var prop in para) {
                    $scope.widgetApi.dataSource.at(index).set(prop, para[prop]);
                }
                //var prop="phonename";var index = 1;
                //$scope.innerOptions.dataSource.at(index).set(prop,item[prop]);
            }


            $scope.widgetApi.getSelectedItems = function () {

                // 统一使用自己的selectedRowItems 统一带checkbox和不带的情况
                //var selectedRows = $scope.grid.select();
                //var selectedDataItems = [];
                //for (var i = 0; i < selectedRows.length; i++) {
                //    var dataItem = $scope.grid.dataItem(selectedRows[i]);
                //    selectedDataItems.push(dataItem);
                //}


                var selectedDataItems = [];
                for (var i = 0; i < $scope.selectedRowItems.length; i++) {
                    var dataItem = $scope.grid.dataSource.getByUid($scope.selectedRowItems[i]);
                    selectedDataItems.push(dataItem);
                }


                return selectedDataItems;
            }


            $scope.widgetApi.removeAll = function () {
                // 暂时不写了
            }


            /**
             * save 的模板方法
             */
            $scope.widgetApi.save = function (para) {

                var test1 = JSON.stringify($scope.widgetApi.modifyCache);
                var test2 = JSON.stringify($scope.widgetApi.modifyCache.updateItems[0]);
                var test3 = kendo.stringify($scope.widgetApi.modifyCache.updateItems[0]);
                var test4 = kendo.stringify($scope.widgetApi.modifyCache);
                $http({
                    url: para.url,
                    method: para.method,
                    data: $scope.widgetApi.modifyCache
                }).success(function (data, status, header, config) {
                    $scope.widgetApi.dataSource.fetch();
                    $scope.widgetApi.modifyCache.insertItems.length = 0;
                    $scope.widgetApi.modifyCache.deleteItems.length = 0;
                    $scope.widgetApi.modifyCache.updateItems.length = 0;
                    alert("保存成功");
                });


            }

            //JSON

            // 显示出所有的更新行 删除行  插入行 用于调试
            $scope.widgetApi.showUpdates = function () {
                var insertItems = $scope.widgetApi.modifyCache.insertItems;
                var deleteItems = $scope.widgetApi.modifyCache.deleteItems;
                var updateItems = $scope.widgetApi.modifyCache.updateItems;


                console.log("---------------insertItems-------------");
                for (var i = 0; i < insertItems.length; i++) {
                    console.log(insertItems[i].uid + "---" + JSON.stringify(insertItems[i]));
                }
                console.log("---------------updateItems-------------");
                for (var i = 0; i < updateItems.length; i++) {
                    console.log(updateItems[i].uid + "---" + JSON.stringify(updateItems[i]));
                }
                console.log("---------------deleteItems-------------");
                for (var i = 0; i < deleteItems.length; i++) {
                    console.log(deleteItems[i].uid + "---" + JSON.stringify(deleteItems[i]));
                }


                var info = "---------------insertItems------------- <br>"
                for (var i = 0; i < insertItems.length; i++) {
                    info = info + JSON.stringify(insertItems[i].toJSON()) + "<br>";
                    info = info + "<br>"
                }
                var info = info + "---------------updateItems------------- <br>"
                for (var i = 0; i < updateItems.length; i++) {
                    info = info + JSON.stringify(updateItems[i].toJSON()) + "<br>";
                    info = info + "<br>"
                }
                var info = info + "---------------deleteItems------------- <br>"
                for (var i = 0; i < deleteItems.length; i++) {
                    info = info + JSON.stringify(deleteItems[i].toJSON()) + "<br>";
                    info = info + "<br>"
                }
                return info;
            }


            //不加$parent   不用function() { return $scope.option.data; }  就无效果 要注意是什么原因?
            //$scope.$parent.$watchCollection(function () {
            //    return $scope.option.data;
            //}, function () {
            //    //console.log($scope.option.data.length)
            //    if ($scope.option.data) {
            //        $scope.innerOptions.dataSource.data($scope.option.data);
            //    }
            //});

        }],
        link: function (scope, element, attrs) {


            //处理grid的title
            $(element).find(".whhGridMainTitle").addClass("k-grouping-header").append(scope.option.title);

            //<div><div class="whhGridMainTitle"></div><div class="whhGridMainContent"></div></div>
            //给当前scope创建一个uid   每个grid有自己唯一的uid 可以保证checkbox的事件传播不会混起来
            scope.uid = Math.uidFast();

//==========================================================================checkBox start========================================================================================
            ////做click事件的监听 主要用于checkbox 绑定在最外层的div上
            ////以前的做法是 每个item上都做绑定,用bind方法 非常的落后,每一行都要bind
            ////一旦属性数据 翻页等等 又得遍历一次重新绑定,非常的低效
            scope.selectedRowItems = [];
            //恢复选中,这里的恢复选中 我用的是uid来辨别.那么翻页以后还可以恢复选择 这是必须的.
            //但是一旦重新查询 dataSource重新赋值了 那么uid也就变化了 就恢复不了了 这个我就不管了.
            //这个dataStore的change还是不行 因为我从第一页到了第二页 再从第二页到第一页 然后change拿到的是第二页的数据 并不是我想要的第一页的数据 所以不行
            //所以还是先处理不分页的情况吧 不分页就不需要restoreSelection
            scope.restoreSelection = function () {
                //if (scope.grid) {
                //    var trs = scope.grid.items();
                //    for (var i = 0; i < trs.length; i++) {
                //        var tempitem1 = scope.grid.dataItem(trs[i]);
                //        for (var item_uid in scope.selectedRowItems) {
                //            if (tempitem1["uid"] == item_uid) {
                //                $(trs[i]).addClass("k-state-selected");
                //                break;
                //            }
                //        }
                //    }
                //}
            }
            scope.triggerOnSelect = function () {
                // 直接增删class 是不会触发grid的change事件了 所以onSelect方法只有我们自己来处理了
                // 另外我们也要增加$emit事件传播的方式暴露 不要只用onSelect回调
                // 如果用户有注册事件方法有的话 就执行
                var select_items = [];
                for (var j = 0; j < scope.selectedRowItems.length; j++) {
                    select_items.push(scope.widgetApi.dataSource.getByUid(scope.selectedRowItems[j]));
                }
                //参数就是选中行数组
                // 如果用户有注册事件方法有的话 就执行
                //if (outerOptions.onSelect) {sdfsdf
                //    for (var i = 0; i < outerOptions.onSelect.length; i++) {
                //        //参数就是选中行数组
                //        outerOptions.onSelect[i](select_items);
                //    }
                //}

                if(scope.eventHanders["Select"].length>0){
                    //循环执行 事件处理器
                    for(var i=0;i<scope.eventHanders["Select"].length;i++){
                        scope.eventHanders["Select"][i].handler(select_items);
                    }
                }
            }
            $(element).on("click", "." + scope.uid + "-whhNgGridSelCheckBox-all", function (e) {
                //e.preventDefault();

                scope.selectedRowItems.length = 0;

                var checked = this.checked;
                if (checked) {
                    var trs = scope.grid.items();
                    for (var i = 0; i < trs.length; i++) {
                        //先全部取消
                        $(trs[i]).addClass("k-state-selected");
                        var dataItem = grid.dataItem(trs[i]);
                        scope.selectedRowItems.push(dataItem["uid"]);

                        //$(trs[i]).find(".whhNgGridSelCheckBox").attr("checked",'checked');
                        $(trs[i]).find("." + scope.uid + "-whhNgGridSelCheckBox").prop('checked', true);
                    }
                    //this.attr("checked", true);
                } else {
                    var trs = scope.grid.items();
                    for (var i = 0; i < trs.length; i++) {
                        //先全部取消
                        $(trs[i]).removeClass("k-state-selected");
                        //$(trs[i]).find(".whhNgGridSelCheckBox").attr("checked", false);
                        $(trs[i]).find("." + scope.uid + "-whhNgGridSelCheckBox").prop("checked", false);
                    }
                }

            });
            $(element).on("click", "." + scope.uid + "-whhNgGridSelCheckBox", function (e) {
                //e.preventDefault();


                //要使用checkbox勾选 一定要去掉grid的selectable属性
                //否则两种选中方式同时存在 会冲突 样式不一致

                var checkbox = e.target;
                var $checkbox = $(checkbox);
                var $tr = $checkbox.parent().parent();//jQuery的tr对象
                var uid = $checkbox.parent().parent().attr("data-uid");//拿到了item的uid
                var item = scope.widgetApi.dataSource.getByUid(uid); // 顺利拿到item
                //
                //
                ////现在来判断checkbox的状态
                //if($checkbox.is(':checked')){
                //    //选择的话 用jQuery的tr对象就可以了 官方文档就是这么说的
                //    scope.grid.select($tr);
                //}else{
                //    //取消选择
                //    $tr.removeClass("k-alt");
                //    $tr.removeClass("k-state-selected");
                //}
                //
                //console.log(e.toString());

                if (outerOptions.selectable == "row") {
                    //如果是单行的
                    var trs = scope.grid.items();
                    for (var i = 0; i < trs.length; i++) {
                        //先全部取消
                        $(trs[i]).removeClass("k-state-selected");
                        scope.selectedRowItems.length = 0;
                    }
                }

                var checked = this.checked,
                    row = $(this).closest("tr"),
                    grid = scope.grid,
                    dataItem = grid.dataItem(row);

                //checkedIds[dataItem.id] = checked;
                if (checked) {
                    //-select the row
                    row.addClass("k-state-selected");

                    //触发事件 执行事件回调
                    //获取所有选中item  直接用jquery遍历tr不行 因为如果翻页的话 这个只能取到当前页的 那是不行的
                    //可以返回当前页面上的全部items 都是<tr> elements 是html元素  问题在于 当需要翻页的时候 就不行了
                    //因为 只返回当前页面渲染的 所以只有当前页的items会被返回 既然如期 那就不要翻页了  以后再想办法实现翻页情况
                    //或者 可以存下选中信息 根据uid来存  这样的话 就是不管翻页不翻页 都是通用的
                    //但是问题还是在于 因为不会触发change事件 所以翻页的时候不触发change 导致我没有机会吧item重新选回去
                    // 有办法了 翻页会触发dataSource的change 而不是grid的change
                    scope.selectedRowItems.push(uid);
                    //var list = grid.items();
                    scope.triggerOnSelect();

                } else {
                    //-remove selection
                    row.removeClass("k-state-selected")

                    //删除之前选中的uid
                    for (var j = scope.selectedRowItems.length - 1; j >= 0; j--) {
                        //for( var j = 0;j<scope.selectedRowItems.length;j++){
                        if (scope.selectedRowItems[j] == uid) {
                            scope.selectedRowItems.splice(j, 1);//删除
                        }
                    }
                    //delete scope.selectedRowItems[uid];

                    scope.triggerOnSelect();
                }
            });

//==========================================================================checkBox end========================================================================================


//==========================================================================gridOption start========================================================================================

            // 构造新的options对象 和 dataSource的Option对象
            var innerOptions = scope.innerOptions = {};
            var dataSourceOptions = {};
            var outerOptions = scope.option;

            //默认禁用分类汇总
            innerOptions.groupable = false;

            scope.innerOptions.editorColCache = {};


            //解析Options
            var innerColumns = []; //准被给grid用的真正的column定义数组
            var schema = {  // 准备给grid的dataSource用得 schema对象
                model: {
                    fields: {}
                }
            };
            //处理普通属性
            for (var property in outerOptions) {
                // 一页的item数量
                if (property == "pageSize") {
                    innerOptions.pageSize = outerOptions.pageSize;
                    //delete innerOptions.pageSize; //暂时禁用翻页功能
                }
                if (property == "pageable") {
                    innerOptions.pageable = outerOptions.pageable;
                    //暂时禁用翻页功能
                }
                // grid的高
                if (property == "height") {
                    innerOptions.height = outerOptions.height;

                }
                // grid的分类汇总属性
                if (property == "groupable") {
                    innerOptions.groupable = outerOptions.groupable;
                    delete innerOptions.groupable;
                }
                // grid的排序
                if (property == "sortable") {
                    innerOptions.sortable = outerOptions.sortable;
                }
                // grid的列顺序是否可调
                if (property == "reorderable") {
                    innerOptions.reorderable = outerOptions.reorderable;
                }
                // grid的列宽是否可调
                if (property == "resizable") {
                    innerOptions.resizable = outerOptions.resizable;
                }
                // grid的选择类型  multiple row 多行    row单行  没有这个属性就是不可选
                if (property == "selectable") {
                    innerOptions.selectable = outerOptions.selectable;
                }
                // grid的是否可编辑
                if (property == "editable") {
                    innerOptions.editable = outerOptions.editable;
                }
                // grid的是否可编辑
                if (property == "batch") {
                    innerOptions.batch = outerOptions.batch;
                }
                //grid显示勾选框
                if (property == "selectCheckBox") {
                    if (outerOptions.selectCheckBox) {
                        //测试勾选框
                        var checkCol = {
                            field: "sel",
                            template: '<input type="checkbox" class="' + scope.uid + '-whhNgGridSelCheckBox" >',
                            headerTemplate: '<input type="checkbox" class="' + scope.uid + '-whhNgGridSelCheckBox-all" />',
                            //locked: true,//锁定
                            sortable: false,
                            "width": 30
                        }
                        innerColumns.push(checkCol);
                        schema.model.fields["sel"] = {
                            editable: false
                        };

                        //删掉selectable属性
                        delete innerOptions.selectable;
                        delete innerOptions.pageSize;
                        delete innerOptions.pageable;
                    }
                }
            }
            //处理columns
            for (var property in outerOptions) {

                if (property == "columns") {
                    var outerColumns = outerOptions[property];


                    for (var index = 0; index < outerColumns.length; index++) {

                        var outerColumn = jQuery.extend(true, {}, outerColumns[index]);

                        var innerColumn = {
                            "width": 100
                        };

                        // 构建schema
                        var fieldOfSchema = {};//一个column对应的field对象 用于schema

                        for (var outerColumnProperty in outerColumn) {


                            if (outerColumnProperty == "field") {
                                innerColumn.field = outerColumn.field;
                            }
                            if (outerColumnProperty == "title") {
                                innerColumn.title = outerColumn.title;
                            }
                            if (outerColumnProperty == "width") {
                                innerColumn.width = outerColumn.width;
                            }
                            if (outerColumnProperty == "hidden") {
                                innerColumn.hidden = outerColumn.hidden;
                            }


                            if (outerColumnProperty == "format") {

                                if (outerColumn.format == "yyyy-MM-dd") {
                                    innerColumn.format = "{0: yyyy-MM-dd}";
                                    outerColumn["editorConfig"]["format"] = "yyyy-MM-dd";//给编辑器用的
                                }
                                if (outerColumn.format == "yyyy-MM-dd HH:mm:ss") {
                                    innerColumn.format = "{0: yyyy-MM-dd HH:mm:ss}";
                                    outerColumn["editorConfig"]["format"] = "yyyy-MM-dd HH:mm:ss";//给编辑器用的
                                }
                                if (outerColumn.format == "HH:mm:ss") {
                                    innerColumn.format = "{0: HH:mm:ss}";
                                    outerColumn["editorConfig"]["format"] = "HH:mm:ss";//给编辑器用的
                                }
                            }

                            // 构建schema  id: "ProductID",
                            if (outerColumn.field == "id") {  //如果字段名叫做id 那要单独处理 否则转换数据json的时候会被自动去掉
                                schema.model.id = outerColumn.field;
                            }
                            fieldOfSchema.editable = true;
                            if (outerColumnProperty == "editable") {
                                fieldOfSchema.editable = outerColumn["editable"];
                            }
                            if (outerColumnProperty == "type") {
                                fieldOfSchema.type = outerColumn["type"];
                            }
                            if (outerColumnProperty == "validation") {
                                fieldOfSchema.validation = outerColumn["validation"];
                            }
                            schema.model.fields[outerColumn.field] = fieldOfSchema;

                            // 开始对每种编辑器做处理
                            if (outerColumnProperty == "editorConfig") {

                                //**************************************** Editors Start *****************************//

                                //DropDownList
                                if (outerColumn["editorConfig"]["editorType"] == editorTypeEnum.DropDownList) {

                                    // 我把这个outerColumn存起来 免得每次都变掉
                                    scope.innerOptions.editorColCache[outerColumn.field] = jQuery.extend(true, {}, outerColumn["editorConfig"]);

                                    innerColumn.editor = function (container, options) {

                                        var editorType = scope.innerOptions.editorColCache[options.field];

                                        // 此处有问题 outerColumn是会变的 得拷贝一份才靠谱  所以editorType也是一直在变的
                                        // 使用拷贝 但是angular.extend 不支持深拷贝  改用jquery 的深拷贝
                                        //var editorType = angular.extend({}, outerColumn["editorConfig"]);
                                        //var editorType = outerColumn["editorConfig"];
                                        //最终的解决方式是存到scope.innerOptions.editorColCache里面去

                                        var field = options.field;//字段名
                                        var item = options.model;// 当前选中行

                                        var input = $('<input />');
                                        input.attr("name", options.field);//name必须和field同名 这样才能数据绑定
                                        input.appendTo(container);//把元素追加上去




                                        var dataSource ;
                                        if(editorType["url"]){
                                            //远程数据源
                                            dataSource = new kendo.data.DataSource({
                                                transport: {
                                                    read: {
                                                        url: editorType["url"],
                                                        dataType: editorType["dataType"], // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                        data: function () {
                                                            if (editorType["paraField"]) {
                                                                //如果要传某个字段值
                                                                return {"para": item[editorType['paraField']]};
                                                            } else if (editorType["para"]) {
                                                                //如果有用户自己定义的参数
                                                                return editorType["para"];
                                                            } else {
                                                                //如果用户什么都没写 那么就是默认传整个item
                                                                return JSON.stringify(item);
                                                            }
                                                        }
                                                    }
                                                }
                                            });
                                        }else{
                                            // 本地数据源
                                            dataSource = new kendo.data.DataSource({
                                                data:editorType["data"]
                                            });
                                        }

                                        input.kendoDropDownList({
                                            dataSource: dataSource,
                                            dataTextField: editorType['textField'],
                                            dataValueField: editorType['valueField']
                                        });

                                    }
                                }// DropDownList end


                                //ComboBox
                                if (outerColumn[outerColumnProperty]["editorType"] == editorTypeEnum.ComboBox) {


                                    scope.innerOptions.editorColCache[outerColumn.field] = jQuery.extend(true, {}, outerColumn["editorConfig"]);
                                    innerColumn.editor = function (container, options) {


                                        var editorType2 = scope.innerOptions.editorColCache[options.field];

                                        // 执行到这个function的时候 上下文早就没了 outerColumn你也访问不到了已经
                                        //var editorType = jQuery.extend(true, {}, outerColumn["editorConfig"]);

                                        var field = options.field;//字段名
                                        var item = options.model;// 当前选中行

                                        var input = $('<input />');
                                        input.attr("name", options.field);//name必须和field同名 这样才能数据绑定
                                        input.appendTo(container);//把元素追加上去


                                        //var dataSource = new kendo.data.DataSource({
                                        //    transport: {
                                        //        read: {
                                        //            url: editorType2["url"],
                                        //            dataType: editorType2["dataType"],
                                        //            data: function () {
                                        //                if (editorType2["paraField"]) {
                                        //                    return {"para": item[editorType2['paraField']]};
                                        //                } else if (editorType2["para"]) {
                                        //                    return editorType2["para"];
                                        //                } else {
                                        //                    return JSON.stringify(item);
                                        //                }
                                        //            }
                                        //        }
                                        //    }
                                        //});



                                        var dataSource ;
                                        if(editorType2["url"]){
                                            //远程数据源
                                            dataSource = new kendo.data.DataSource({
                                                transport: {
                                                    read: {
                                                        url: editorType2["url"],
                                                        dataType: editorType2["dataType"], // "jsonp" is required for cross-domain requests; use "json" for same-domain requests
                                                        data: function () {
                                                            if (editorType2["paraField"]) {
                                                                //如果要传某个字段值
                                                                return {"para": item[editorType2['paraField']]};
                                                            } else if (editorType2["para"]) {
                                                                //如果有用户自己定义的参数
                                                                return editorType2["para"];
                                                            } else {
                                                                //如果用户什么都没写 那么就是默认传整个item
                                                                return JSON.stringify(item);
                                                            }
                                                        }
                                                    }
                                                }
                                            });
                                        }else{
                                            // 本地数据源
                                            dataSource = new kendo.data.DataSource({
                                                data:editorType2["data"]
                                            });
                                        }




                                        //构建抬头模板
                                        var headerTemplate =
                                            '<div width="100%" class="k-header ">' +
                                            '    <div class="k-header " style="margin-right: 15px;padding-left: 5px;">' +
                                            '       <table width="100%" >' +
                                            '           <tr>  ';

                                        for (var j = 0; j < editorType2["columns"].length; j++) {
                                            headerTemplate = headerTemplate + '<td width="' + editorType2["columns"][j]["width"] + '%"><h6>' + editorType2["columns"][j]["title"] + '</h6></td>';
                                        }
                                        headerTemplate = headerTemplate +
                                            '           </tr>' +
                                            '       </table>' +
                                            '   </div>' +
                                            '</div>';


                                        //构建item模板
                                        var itemTemplate =
                                            '<div>' +
                                            '   <table width="100%" style="border-bottom:solid 1px;border-bottom-color: ghostwhite"  ><tr>';
                                        for (var j = 0; j < editorType2["columns"].length; j++) {
                                            itemTemplate = itemTemplate + '<td width="' + editorType2["columns"][j]["width"] + '%"><h6>#: data.' + editorType2["columns"][j]["field"] + ' #</h6></td>';
                                        }


                                        itemTemplate = itemTemplate + '</tr></table></div>';


                                        input.kendoComboBox({
                                            filter: "startswith",

                                            dataTextField: editorType2['textField'],
                                            dataValueField: editorType2['valueField'],
                                            headerTemplate: headerTemplate,


                                            //内容和header会有一定的偏移 因为右侧有一个滚动条 而header右侧是没有滚动条的
                                            // 整个下拉看度是335  下拉内部是320 那么差值是15 也就是滚动条的宽度
                                            // 最简单的办法 是把header缩小15px   用jquery 获取class=k-header 然后设置宽度
                                            template: itemTemplate,

                                            dataSource: dataSource,
                                            height: 200
                                            //popup: {
                                            //    origin: "top left"
                                            //}
                                        });

                                    }
                                }//ComboBox end


                                //DatePicker
                                if (outerColumn[outerColumnProperty]["editorType"] == editorTypeEnum.DatePicker) {

                                    scope.innerOptions.editorColCache[outerColumn.field] = jQuery.extend(true, {}, outerColumn["editorConfig"]);
                                    innerColumn.editor = function (container, options) {


                                        var editorType = scope.innerOptions.editorColCache[options.field];
                                        var field = options.field;
                                        var item = options.model;
                                        var val = options.model[options.field];

                                        var input = $('<input />');
                                        input.attr("name", options.field);
                                        input.appendTo(container);

                                        input.kendoDatePicker({
                                            format: editorType["format"],
                                            culture: "zh-CN",
                                            parseFormats: [editorType["format"]]//,
                                            //value: new Date(val)
                                        });

                                    }

                                }


                                //DateTimePicker
                                if (outerColumn[outerColumnProperty]["editorType"] == editorTypeEnum.DateTimePicker) {

                                    scope.innerOptions.editorColCache[outerColumn.field] = jQuery.extend(true, {}, outerColumn["editorConfig"]);
                                    innerColumn.editor = function (container, options) {


                                        var editorType = scope.innerOptions.editorColCache[options.field];
                                        var field = options.field;
                                        var item = options.model;
                                        var val = options.model[options.field];

                                        var input = $('<input />');
                                        input.attr("name", options.field);
                                        input.appendTo(container);

                                        input.kendoDateTimePicker({
                                            format: editorType["format"],
                                            culture: "zh-CN"//,
                                            //parseFormats: [editorType["format"]]//,
                                            //value: new Date(val)
                                        });

                                    }

                                }
                                //**************************************** Editors End *****************************//

                            }//开始对每种编辑器做处理 end


                        }
                        innerColumns.push(innerColumn);
                    }
                    innerOptions.columns = innerColumns;
                }
            }

            //补全grid属性
            //innerOptions.pageable = {
            //    refresh: true,
            //    pageSizes: true,
            //    buttonCount: 5
            //}

            //行 或者单元格选中事件
            innerOptions.change = function (e) {

                scope.selectedRowItems.length = 0;
                //scope.widgetApi
                var selectedRows = this.select();
                var selectedDataItems = [];
                for (var i = 0; i < selectedRows.length; i++) {
                    var dataItem = this.dataItem(selectedRows[i]);
                    selectedDataItems.push(dataItem);

                    //同时也放入自己维护的选中行对象中
                    scope.selectedRowItems.push(dataItem["uid"]);
                }

                if(scope.eventHanders["Select"].length>0){
                    //循环执行 事件处理器
                    for(var i=0;i<scope.eventHanders["Select"].length;i++){
                        scope.eventHanders["Select"][i].handler(selectedDataItems);
                    }
                }
            }

            innerOptions.edit=function(e) {
                //if (!e.model.isNew()) {
                //
                //}
                if(scope.eventHanders["Editing"].length>0){
                    //循环执行 事件处理器
                    for(var i=0;i<scope.eventHanders["Editing"].length;i++){
                        scope.eventHanders["Editing"][i].handler(e.model);
                    }
                }
            }
//==========================================================================gridOption end====================================================================================================================================================================


//==========================================================================dataSourceOption start==========================================================================================================================================================
            //dataSourceOptions.data = [];
            dataSourceOptions.schema = schema;
            if (innerOptions.pageable) {
                dataSourceOptions.pageSize = innerOptions.pageSize;
            }



            //dataSourceOptions.transport = {
            //    read: {
            //        url: "DataSourceService/fakeQuery.json",
            //        dataType: "json"
            //        }
            //    }
            //
            //
            //dataSourceOptions.requestStart = function(e) {
            //    // 第一次会使用read查询 查询出来以后我们修改内容然后保存,再fetch 就不会callURL 只会请求本地数据了,
            //
            //    console.log("request started");
            //
            //
            //    scope.$http({
            //        url: "GridDemoService/getPhone.json?phonename=",
            //        method: "GET",
            //        //headers: { 'needUiBlock': true} // 加上这一句 在做http请求的时候会提供界面屏蔽
            //
            //    }).success(function (data, status, header, config) {
            //        //直接赋值数据 而不使用transaction   坏处是如果远程请求耗时较长的话,不会出现菊花图标来过渡
            //        // 要想有菊花图标 还得自己再实现一个query方法
            //        scope.widgetApi.setData(data);
            //    });
            //
            //
            //}
            //dataSourceOptions.requestEnd = function(e) {
            //
            //
            //
            //    //
            //    ////看来这里并不能够对response做什么修改
            //    ////e.response = [e.response[1]];
            //    //
            //    //var response = e.response;
            //    //var type = e.type;
            //    //console.log(type); // displays "read"
            //    ////console.log(response.length); // displays "77"
            //}


            dataSourceOptions.change = function (e) {
                //e.sender kendo.data.DataSource
                //The data source instance which fired the event.
                //
                //    e.action String (optional)
                //String describing the action type (available for all actions other than "read"). Possible values are "itemchange", "add", "remove" and "sync".
                //
                //    e.field String (optional)
                //String describing the field that is changed (available only for "itemchange" action).
                //
                //e.items Array
                //The array of data items that were affected (or read).


                //如果不是增删改 那么就检查一下 是不是要恢复选中行
                //if(e.field==undefined && e.action==undefined){
                //    scope.restoreSelection();
                //}

                var dataSource = e.sender;
                var action = e.action;
                var field = e.field;
                var items = e.items;


                var insertItems = scope.widgetApi.modifyCache.insertItems;
                var deleteItems = scope.widgetApi.modifyCache.deleteItems;
                var updateItems = scope.widgetApi.modifyCache.updateItems;


                //update的话 e.action是"itemchange"  e.field会记录字段名字   e.items会记录当前被修改的这个item
                // 删除的话   e.action是"remove"  e.field会记录字段名字   e.items会记录当前被删除的item   如果删除多行 这个事件会进入多次
                // 新增行 因为我的写法是直接往data里插入数据 所以虽然会触发事件 但是e.action没有值 所以得改一个写法
                // 新增行  e.action是"add"  e.field是空的   e.items会记录当前被加入的这个item


                // 是否是insert 的 我们应该根据oid来判断 因为后台查询出来的数据都带oid 前台加入的数据没有oid
                // 是否有重复数据我们应该根据uid来判断,因为dataSource里的每条数据都有唯一的uid

                if (e.action == "add") {
                    for (var i = 0; i < items.length; i++) {

                        var ifHas = true;

                        // 如果有oid 那么是后台查出来的 所以不算新增的
                        if (items[i].oid) {
                            ifHas = false;
                        }

                        for (var j = 0; j < insertItems.length; j++) {
                            if (items[i].uid == insertItems[j].uid) {
                                ifHas = false;
                                break;
                            }
                        }

                        if (ifHas) {
                            insertItems.push(items[i]);
                        }
                    }
                }
                if (e.action == "remove") {


                    for (var i = 0; i < items.length; i++) {

                        var ifHas = true;

                        // 如果没有oid 那么是前台新增的 那后台本来就没有的 也就没有必要加入了
                        if (!items[i].oid) {
                            ifHas = false;
                        }

                        // 如果数组里已经有这个item 了 就不要重复加了
                        for (var j = 0; j < deleteItems.length; j++) {
                            if (items[i].uid == deleteItems[j].uid) {
                                ifHas = false;
                                break;
                            }
                        }
                        //如果insertItem 或者 updateItems里面有的话 就要删掉
                        for (var j = 0; j < insertItems.length; j++) {
                            if (items[i].uid == insertItems[j].uid) {
                                //删除
                                insertItems.splice(j, 1); //从j开始 删除1个元素
                                break;
                            }
                        }
                        for (var j = 0; j < updateItems.length; j++) {
                            if (items[i].uid == updateItems[j].uid) {
                                updateItems.splice(j, 1);
                                break;
                            }
                        }

                        if (ifHas) {
                            deleteItems.push(items[i]);
                        }
                    }
                }
                if (e.action == "itemchange") {
                    for (var i = 0; i < items.length; i++) {

                        var ifHas = true;

                        // 如果编辑的item没有oid 说明还是个新增行 就不要加到updateItems里面去了
                        if (!items[i].oid) {
                            ifHas = false;
                        }
                        // 如果数组里已经有这个item 了 就不要重复加了
                        for (var j = 0; j < updateItems.length; j++) {
                            if (items[i].uid == updateItems[j].uid) {
                                ifHas = false;
                                break;
                            }
                        }
                        if (ifHas) {
                            updateItems.push(items[i]);
                        }
                    }
                }

                //所有的数据修改操作 都会反映到这个事件上来 所以选中行的处理在这里最合适

                //if(scope.option.selectCheckBox==true){
                //如果是使用了checkBox 那么要检查一下  不需要检查了 现在不管用不用checkBox 我都要从scope.selectedRowItems走一遍
                for (var i = 0; i <= deleteItems.length - 1; i++) {
                    for (var j = scope.selectedRowItems.length - 1; j >= 0; j--) {
                        if (scope.selectedRowItems[j] == deleteItems[i]["uid"]) {
                            scope.selectedRowItems.splice(j, 1); // 要删除
                        }
                    }
                }
                // }





                if (e.action == "itemchange") {

                    if(scope.eventHanders["ValueChange"].length>0){
                        //循环执行 事件处理器
                        for(var i=0;i<scope.eventHanders["ValueChange"].length;i++){
                            scope.eventHanders["ValueChange"][i].handler(field,items[0]);
                        }
                    }

                }


            }
//==========================================================================dataSourceOption end==========================================================================================================================================================


//==========================================================================创建grid 和暴露对象==========================================================================================================================================================


            // 创建数据源 同时我也会把数据源暴露到scope上 以及外部的option上
            innerOptions.dataSource =  new kendo.data.(dataSourceOptions);
            //创建grid
            $(element).find(".whhGridMainContent").kendoGrid(innerOptions);
            var grid = $(element).find(".whhGridMainContent").data("kendoGrid");


            //向外暴露
            scope.grid = grid;// 把grid对象放到自己的scope上去
            scope.innerOptions = innerOptions;// 暴露内部options

            scope.widgetApi.dataSource = innerOptions.dataSource;//暴露出真实的dataSource对象
            scope.widgetApi.widget = grid; // 暴露出grid对象
            scope.option.getWidgetApi(scope.widgetApi);  // 暴露出widgetApi对象



//==========================================================================创建grid 和暴露对象 end==========================================================================================================================================================


        }

    }

});


// 我在这里定义controller 根本就不执行 感觉angular第一次解析页面的时候会根据出现的ng-controller来创建
// 等我这个勾选框出来的时候 已经不解析页面了 所以不出来了
// 所以这个controller的function都没有执行 同样 column模板里的{{}}也没有解析
// 要么用jquery事件去做?
// 思路是 在grid外层的div上做click事件监听 拿到checkbox对象 然后查找上一层到tr 拿到uid属性 这个uid就标示了唯一的一行数据
// 根据uid拿到item  然后使用select()方法进行选中
App.controller('selCtrl', ['$scope', function ($scope) {
    //给勾选框专用的小controller
    $scope.ifSel = "hehe";
    console.log("selCtrl");
}]);

var editorTypeEnum = {
    "DropDownList": "kendoDropDownList",
    "ComboBox": "kendoComboBox",
    "DatePicker": "kendoDatePicker",
    "DateTimePicker": "kendoDateTimePicker"
}



















