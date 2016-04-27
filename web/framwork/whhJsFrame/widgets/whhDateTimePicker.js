
//angular.module('whh.datePicker',[])
App.directive('ngWhhDateTimePicker', function () {
    return {

        // 必须改 不能用元素 必须是input元素上加一个属性这种模式 这样才可以使用ng=model 才可以实现双向数据绑定
        // 只有双向数据绑定了 创建表单才会变得方便
        restrict:"AE",
        //replace: true,
        require: '?ngModel',
        scope: {
            option: "=" // 双向绑定过来
        },
        //template:'<input style="width: 100%;" />',
        controller: ['$scope','$filter','whhDateService', function ($scope,$filter,whhDateService) {

            //$scope.$watch($scope.option.date, function (newValue,oldValue,scope) {
            //    //监控date
            //    console.log(newValue);
            //});
            $scope.$filter = $filter;
            $scope.whhDateService = whhDateService;
            $scope.widgetApi={};

            $scope.widgetApi.setDate = function (date) {
                if(typeof(date) == "string"){
                    //如果传入字符串 必须是 yyyy-MM-dd HH:mm:ss格式 不能有其他格式
                    //var year = date.split("-")[0];
                    //var month = date.split("-")[1];
                    //var day = date.split("-")[2];
                    //
                    //$scope.datePicker.value(new Date(year+"/"+month+"/"+day));


                    $scope.datePicker.value($scope.whhDateService.StringToDateTime(date));


                }else{
                    //或者 传入Date类型的参数
                    $scope.datePicker.value(date);

                }

                $scope.ifModelChange(date);

            }

            //返回js Date对象
            $scope.widgetApi.getDate = function(){
                return $scope.datePicker.value();
            }

            //
            $scope.widgetApi.getDateStr = function(){
                return $scope.whhDateService.dateTimeToString($scope.datePicker.value());//$filter('date')($scope.datePicker.value(), 'yyyy-MM-dd HH:mm:ss');
            }

            $scope.widgetApi.getMSeconds = function(){
                return $scope.datePicker.value().getTime();
            }



            //事件处理方法

            $scope.eventHanders = {
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
        link: function (scope, element, attrs,controller) {




            //=====================================ng-model双向数据绑定 start===================================
            //要实现双向数据绑定 要做两个事情
            // 1.本地model改变后 view里的input控件值要改变  view里的{{}}标签要改变
            // 2.界面上的input元素里用户打字 要更新到scope里的model上

            if(controller){
                scope.ngModelCtrl = controller;



                // from Model to View  我们的model是date对象  view 是日期字符串
                scope.ngModelCtrl.$formatters.push(function(value) {
                    // 把日期对象转换成日期字符串
                    return  scope.whhDateService.dateTimeToString(value); //scope.$filter('date')(value, 'yyyy-MM-dd HH:mm:ss');
                });




                //重写render 不需要去给input控件赋值 只需要给日期控件赋值就可以了
                var _$render = scope.ngModelCtrl.$render;
                scope.ngModelCtrl.$render = function () {

                    //就是直接把modelValue赋值给日历控件呗
                    var date = controller.$modelValue;
                    if ( angular.isDefined(date) && date !== null && !angular.isDate(date) ) {
                        //throw new Error('ng-Model value must be a Date object - currently it is a ' + typeof date + ' - use ui-date-format to convert it from a string');
                        // 灵活一点 如果不是date类型 是字符串 那么就直接转换成date类型就好了
                        date = scope.whhDateService.StringToDateTime(date);
                    }
                    scope.datePicker.value(date);// 把$modelValue 赋值给我们自己的日历控件

                }



                // from View to Model 用户在界面上输入字符的情况导致view改变了
                scope.ngModelCtrl.$parsers.unshift(function (inputValue) {

                    //inputValue 是view传来的值 我们要转成date对象 存起来
                    if(typeof(inputValue) == "string"){
                        //如果传入字符串 必须是 yyyy-MM-dd格式 不能有其他格式
                        //var year = inputValue.split("-")[0];
                        //var month = inputValue.split("-")[1];
                        //var day = inputValue.split("-")[2];
                        //
                        //return new Date(year+"/"+month+"/"+day);
                        return scope.whhDateService.StringToDateTime(inputValue);
                    }else {
                        return undefined;
                    }
                });


                // if  datePicker changed  这种情况,也就是用户下拉选择日期了.(直接js去改变model不用担心 这个ngModelCtrl会处理的)
                // 这部分代码写到datePicker的change事件里面去
                scope.ifModelChange = function(value){
                    if( typeof(value) == "string"){
                        scope.ngModelCtrl.$setViewValue(value);
                    }else{
                        scope.ngModelCtrl.$setViewValue(scope.whhDateService.dateTimeToString(value));  //scope.$filter('date')(value, 'yyyy-MM-dd')
                    }
                }

                // 最后 用户直接自己输入内容,自己打字 触发的是ngModelCtrl的$watch 会执行$viewValue 和 $modelValue的改变
                // 会导致view的改变 最后会做render render已经被我们重写 所以在render的时候 会去给我们的日历控件赋值 就实现了绑定


            }
            //=====================================ng-model双向数据绑定 end===================================




            //补全option
            scope.option.format ="yyyy-MM-dd HH:mm:ss";
            scope.option.value=new Date();
            scope.option.culture="zh-CN";
            scope.option.change = function() {
                var value = this.value();

                if(controller) {
                    scope.ifModelChange(value);
                }

                if(scope.eventHanders["Change"].length>0){
                    //循环执行 事件处理器
                    for(var i=0;i<scope.eventHanders["Change"].length;i++){
                        scope.eventHanders["Change"][i].handler(value);
                    }

                }
            }



            $(element).kendoDateTimePicker(scope.option);




            scope.datePicker = $(element).data("kendoDateTimePicker");

            scope.widgetApi.widget = scope.datePicker;
            scope.option.getWidgetApi(scope.widgetApi);
            //scope.option.getWidgetObj(scope.datePicker);

            if(controller){
                //默认就取一次控件的值做绑定
                if(scope.widgetApi.getDate()){
                    scope.ifModelChange(scope.widgetApi.getDate());
                }
            }
        }
    }
});