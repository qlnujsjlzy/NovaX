/**
 * Created by wz on 16/4/18.
 */
App.directive('ngWhhDropDown',function() {
    return {
        restrict: "A",
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
        link : function (scope,element,attr,ctrl) {

            if(ctrl){
                scope.ngModel = ctrl;


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

                    return  value;  //这个值会被赋值给$viewValue 用来做render 在render里面我会给下拉控件赋值
                });



                //2. from view to model     用户直接给控件对象赋值 其实就是用户下拉选择了一个item 这时候我们会去调用setViewValue
                // 在setViewValue的时候用到  我们的modelValue 其实就keyValue字段的值了
                //在setViewValue的时候 会去构建modelValue的值 要用到parsers
                scope.ngModel.$parsers.unshift(function (inputValue) {

                    //inputValue 是view传来的值 就是itemObject 需要转换成keyValue字符串
                    return inputValue[scope.option.valueField];
                });


            }


            //数据源

            var dataSource ;
            if(scope.option["url"]){
                //远程数据源
                dataSource = new kendo.data.DataSource({
                    transport: {
                        read: {
                            url: scope.option["url"],
                            dataType: "json",
                            data: function () {
                                if (scope.option["para"]) {
                                    return scope.option["para"];  // 方式1 用户自己定义一个对象来传
                                } else {
                                    return {}; // JSON.stringify(item);  // 方式3 传整个item
                                }
                            }
                        }
                    },
                    requestEnd: function(e) {
                        if(ctrl){
                            //默认选中第一行
                            if(e.response){
                                scope.ngModel.$setViewValue(e.response[0]);
                            }
                        }
                    }
                });
            }else{
                // 本地数据源
                dataSource = new kendo.data.DataSource({
                    data:scope.option["data"]
                });
            }

            $(element).kendoDropDownList({
                dataSource: dataSource,
                dataTextField: scope.option['textField'],
                dataValueField: scope.option['valueField'],
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

            scope.widget = $(element).data("kendoDropDownList");

            scope.widgetApi.widget = scope.widget;
            scope.option.getWidgetApi(scope.widgetApi);

            if(ctrl){
                //默认选中第一行
                if(scope.widget.dataItem(0)){
                    scope.ngModel.$setViewValue(scope.widget.dataItem(0));
                }
            }


        }

    };

});