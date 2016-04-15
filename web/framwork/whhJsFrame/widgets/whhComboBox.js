/**
 * Created by wz on 16/4/11.
 */
//angular.module('whh.comboBox',[])
App.directive('ngWhhComboBox',function(){
    return {
        restrict:"E",
        replace: true,
        scope: {
            option: "=" // 双向绑定过来
        },
        template:'<input style="width: 100%;" />',
        controller: ['$scope', function ($scope) {

            $scope.widgetApi={};
            $scope.onChangeHandler = [];

            // 获取控件的value 返回string
            $scope.widgetApi.getValue = function(){
                return $scope.widget.value();
            }

            // 返回选中的item对象 是一个复制后的对象
            $scope.widgetApi.getSelectItem = function(){
                var index = $scope.widget.select();
                var item = jQuery.extend({},$scope.widget.dataItem(index),true);
                return item;
            }


            //根据index来选中一行
            $scope.widgetApi.setSelectIndex = function(index){
                $scope.widget.select(index);
            }


            // 注册一个事件处理器  返回一个identifier
            $scope.widgetApi.bindOnChangeHandler = function(func){

                var identifier = Math.uidFast();
                var handler = {identifier:identifier,handler:func};
                $scope.onChangeHandler.push(handler);

                return identifier;
            }

            //取消注册一个事件处理器
            $scope.widgetApi.unBindOnChangeHandler = function(identifier){
                for(var i=$scope.onChangeHandler.length-1;i>=0;i--){
                    if($scope.onChangeHandler[i].identifier == identifier){
                        $scope.onChangeHandler.splice(i,1);
                        break;
                    }
                }
            }
            //clear
            $scope.widgetApi.clearOnChangeHandler = function(){
                $scope.onChangeHandler.length = 0;
            }

            //$scope.widgetApi.setSelectItem = function(item,fields){
            //    //根据哪些字段匹配? 根据fields里的字段来匹配
            //
            //}


        }],
        link: function (scope, element, attrs) {

            var editorType2 = scope.option;
            var dataSource ;
            if(scope.option["url"]){
                dataSource = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: scope.option["url"],
                            dataType: "json",
                            data: function () {
                                if (scope.option["paraField"]) {  //call url的时候传参
                                    return {}; // {"para": item[scope.option['paraField']]};  //方式1 传这行某个field的值
                                } else if (scope.option["para"]) {
                                    return scope.option["para"];  // 方式2 用户自己定义一个对象来传
                                } else {
                                    return {}; // JSON.stringify(item);  // 方式3 传整个item
                                }
                            }
                        }
                    }
                });
            }else{
                dataSource = new kendo.data.DataSource({
                    data:scope.option["data"]
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


            $(element).kendoComboBox({
                filter: "startswith",

                dataTextField: editorType2['textField'],
                dataValueField: editorType2['valueField'],
                headerTemplate: headerTemplate,

                //内容和header会有一定的偏移 因为右侧有一个滚动条 而header右侧是没有滚动条的
                // 整个下拉看度是335  下拉内部是320 那么差值是15 也就是滚动条的宽度
                // 最简单的办法 是把header缩小15px   用jquery 获取class=k-header 然后设置宽度
                template: itemTemplate,
                dataSource: dataSource,
                height: 400,
                index:0,
                change: function(e) {
                    if(scope.onChangeHandler.length>0){
                        var comboBox = e.sender;
                        var index = comboBox.select();
                        var item = jQuery.extend({},comboBox.dataItem(index),true);

                        //循环执行 事件处理器
                        for(var i=0;i<scope.onChangeHandler.length;i++){
                            scope.onChangeHandler[i].handler(item);
                        }

                    }
                }

            });


            scope.widget = $(element).data("kendoComboBox");

            scope.widgetApi.widget = scope.widget;
            scope.option.getWidgetApi(scope.widgetApi);
           // scope.option.getWidgetObj(scope.widget);
        }
    }
});