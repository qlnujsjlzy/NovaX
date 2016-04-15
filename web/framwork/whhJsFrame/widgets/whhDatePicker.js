
//angular.module('whh.datePicker',[])
App.directive('ngWhhDatePicker', function () {
    return {

        restrict:"E",
        replace: true,
        scope: {
            option: "=" // 双向绑定过来
        },
        template:'<input style="width: 100%;" />',
        controller: ['$scope','$filter', function ($scope,$filter) {

            //$scope.$watch($scope.option.date, function (newValue,oldValue,scope) {
            //    //监控date
            //    console.log(newValue);
            //});

            $scope.onChangeHandler = [];
            $scope.widgetApi={};

            $scope.widgetApi.setDate = function (date) {
                if(typeof(date) == "string"){
                    //如果传入字符串 必须是 yyyy-MM-dd格式 不能有其他格式
                    var year = date.split("-")[0];
                    var month = date.split("-")[1];
                    var day = date.split("-")[2];

                    $scope.datePicker.value(new Date(year+"/"+month+"/"+day));

                }else{
                    //或者 传入Date类型的参数
                    $scope.datePicker.value(date);
                }
            }

            //返回js Date对象
            $scope.widgetApi.getDate = function(){
                return $scope.datePicker.value();
            }

            //
            $scope.widgetApi.getDateStr = function(){
                return $filter('date')($scope.datePicker.value(), 'yyyy-MM-dd');
            }

            $scope.widgetApi.getMSeconds = function(){
                return $scope.datePicker.value().getTime();
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

        }],
        link: function (scope, element, attrs) {

            //补全option
            scope.option.format ="yyyy-MM-dd";
            scope.option.value=new Date();
            scope.option.culture="zh-CN";
            scope.option.change = function() {
                var value = this.value();
                if(scope.onChangeHandler.length>0){
                    //循环执行 事件处理器
                    for(var i=0;i<scope.onChangeHandler.length;i++){
                        scope.onChangeHandler[i].handler(value);
                    }

                }
            }

            $(element).kendoDatePicker(scope.option);
            scope.datePicker = $(element).data("kendoDatePicker");

            scope.widgetApi.widget = scope.datePicker;
            scope.option.getWidgetApi(scope.widgetApi);
            //scope.option.getWidgetObj(scope.datePicker);
        }
    }
});