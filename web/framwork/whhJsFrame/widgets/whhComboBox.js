/**
 * Created by wz on 16/4/11.
 */
//angular.module('whh.comboBox',[])
App.directive('ngWhhComboBox',function(){
    return {
        restrict:"A",
        replace: false,
        require: '?ngModel',
        scope: {
            option: "=" // 双向绑定过来
        },
        //template:'<input style="width: 100%;" />',
        controller: ['$scope', function ($scope) {

            $scope.widgetApi={};


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

                if($scope.ngModel){
                    $scope.ngModel.$setViewValue($scope.widget.dataItem(index));
                }
            }







            //事件处理方法
            $scope.eventHanders = {
                "Select":[],
                "Change":[]
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





        }],
        link: function (scope, element, attrs,ctrl) {


            //=====================================ng-model双向数据绑定 start===================================
            if(ctrl){
                scope.ngModel = ctrl;





                // 这次 modelValue  是keyValue字符串    viewValue是itemobject
                // 其实这个不是那么严格的说viewValue必须是字符串什么的,其实在封装控件的时候,viewValue并不是决定界面显示什么的因素,
                // 而是控件来决定界面显示什么,你看render方法都重写掉了,所以真的没有必要太在意是不是string类型 只是记录就可以了



                //重写render 不需要去给input控件赋值 只需要给下拉控件赋值就可以了
                scope.ngModel.$render = function () {
                    //就是直接把modelValue赋值给日历控件呗
                    var keyValue = scope.ngModel.$modelValue;
                    scope.widget.value(keyValue);// 把$modelValue 赋值给我们下拉控件
                }


                //1. from model to view     js直接改model值的时候  也就是$watch捕获的时候
                // 用户直接改model的时候 会触发$watch  会使用formatter构造viewValue  会做render
                scope.ngModel.$formatters.push(function(value) {
                    //value是model的值 就是keyvalue
                    var ds = dataSource.data();
                    for(var i =0;i<ds.length;i++){
                        if(ds[i][scope.option.valueField] == value){
                            return ds[i];
                        }
                    }

                    return  value;  //这个值会被用来做render 在render里面我会给下拉控件赋值
                });



                //2. from view to model     用户直接给控件对象赋值 其实就是用户下拉选择了一个item 这时候我们会去调用setViewValue
                // 在setViewValue的时候用到  我们的modelValue 其实就keyValue字段的值了
                //在setViewValue的时候 会去构建modelValue的值 要用到parsers
                scope.ngModel.$parsers.unshift(function (inputValue) {

                    //inputValue 是view传来的值 就是itemObject 需要转换成keyValue字符串
                    return inputValue[scope.option.valueField];
                });




                //3.用户直接在input里打字
                // 会触发$watch  会执行render 把value传给render  执行我们重写的render 实现下拉值得改变



                //只要知道 {{}}绑定的是model 所以model就是我们要在{{}}展示的东西
                //view是界面上的文本框,但是我们的文本框已经变成控件了,所以,当然不能直接去置文本框的值 而是要给控件赋值 所以要重写render方法
                //给而此时 view存储的就是要给控件赋值所需的类型,也就是obj 或者date之类的类型 而不是纯文本了


                //在link方法的最后 人为的调用一次setViewValue 这样可以让控件加载好 就直接出现绑定数据




            }

            //=====================================ng-model双向数据绑定 end===================================









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
                    },
                    requestEnd: function(e) {
                        //var response = e.response;
                        //var type = e.type;
                        //console.log(type); // displays "read"
                        //console.log(response.length); // displays "77"
                        if(ctrl){
                            //默认选中第一行
                            scope.ngModel.$setViewValue(e.response[0]);
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
                width:"100%",
                index:0,
                change: function(e) {
                    var comboBox = e.sender;
                    var index = comboBox.select();
                    var item = jQuery.extend({},comboBox.dataItem(index),true);


                    if(ctrl){
                        scope.ngModel.$setViewValue(item);
                    }

                    if(scope.eventHanders["Change"].length>0){

                        //循环执行 事件处理器
                        for(var i=0;i<scope.eventHanders["Change"].length;i++){
                            scope.eventHanders["Change"][i].handler(item);
                        }

                    }
                },
                select: function(e) {
                    // var item = e.item;
                    //var item = jQuery.extend({},e.item,true);


                    var comboBox = e.sender;
                    var index = comboBox.select();
                    var item = jQuery.extend({},comboBox.dataItem(index),true);


                    if(ctrl){
                        scope.ngModel.$setViewValue(item);
                    }

                    if(scope.eventHanders["Select"].length>0){

                        //循环执行 事件处理器
                        for(var i=0;i<scope.eventHanders["Select"].length;i++){
                            scope.eventHanders["Select"][i].handler(item);
                        }
                    }
                }

            });


            scope.widget = $(element).data("kendoComboBox");

            scope.widgetApi.widget = scope.widget;
            scope.option.getWidgetApi(scope.widgetApi);
           // scope.option.getWidgetObj(scope.widget);

            if(ctrl){
                //默认选中第一行
                if(scope.widget.dataItem(0)){
                    scope.ngModel.$setViewValue(scope.widget.dataItem(0));
                }
            }

        }
    }
});