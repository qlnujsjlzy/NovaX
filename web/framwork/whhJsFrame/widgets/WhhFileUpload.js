/**
 * Created by wz on 16/4/15.
 */
App.directive('ngWhhFileUpload',function(){


    return {

        restrict:"AE",
        replace: true,
        scope: {
            option: "=" // 双向绑定过来
        },
        template:'<input style="width: 100%;" type="file" id="file" name="file" />',
        controller: ['$scope','$filter', '$rootScope',function ($scope,$filter,$rootScope) {
            $scope.rootScope = $rootScope;



            $scope.widgetApi={};



            //事件处理方法
            $scope.eventHanders = {
                "Complate":[]
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
        link: function (scope, element, attrs) {

            $(element).kendoUpload({
                //multiple: true,
                showFileList: false,
                async: {
                    saveUrl:scope.option.url,
                    autoUpload: true
                },
                localization: {
                    select: "请选择文件",
                    statusFailed: "失败",
                    statusUploaded: "成功",
                    headerStatusUploaded: "成功",
                    headerStatusUploading: "进行中"
                },
                complete:function(e){

                },
                progress: function(e) {
                // Array with information about the uploaded files
                var files = e.files;
                if(e.percentComplete==100){
                    if(scope.eventHanders["Complate"].length>0){
                        for(var i=0;i<scope.eventHanders["Complate"].length;i++){
                            scope.eventHanders["Complate"][i].handler(files[0]);
                        }
                    }
                }
            }
            });



            scope.widget = $(element).data("kendoUpload");
            scope.widgetApi.widget = scope.widget;
            scope.option.getWidgetApi(scope.widgetApi);

        }
    }

});