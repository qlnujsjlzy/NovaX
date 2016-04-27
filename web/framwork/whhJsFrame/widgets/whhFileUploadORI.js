/**
 * Created by wz on 16/4/27.
 */
App.directive('ngWhhFileUploadOri', function () {

    return {
        restrict:"E",
        replace:true,
        scope: {
            option: "=" // 双向绑定过来
        },
        template:
        '<div class="input-group">'+
        '<input type="file" style="display:none;visibility: hidden;height: 0px;">'+
        '<input type="text" class="form-control">'+
        '<span class="input-group-btn">'+
        //'<div class="btn-group">' +
        '<button class="btn btn-default btn-flat" ng-click="choseFile()" type="button">浏览</button>'+
        '<button class="btn btn-default btn-flat" ng-click="upload()" type="button">上传</button>'+
        // '</div>'+
        '</span>'+
        '</div>',

    controller: ['$scope','whhHttpService',function ($scope,$http,$rootScope,whhHttpService) {

            $scope.fileuid = Math.uidFast();
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

            $scope.upload = function () {
                var formData = new FormData();
                formData.append('file', $('#file_'+$scope.fileuid)[0].files[0]);
                $.ajax({
                    url: $scope.option.url,
                    type: 'POST',
                    data: formData,
                    async: false,
                    cache: false,
                    contentType: false,
                    processData: false,
                    success: function (returndata) {
                        if($scope.eventHanders["Complate"].length>0){
                            for(var i=0;i<$scope.eventHanders["Complate"].length;i++){
                                $scope.eventHanders["Complate"][i].handler(returndata);
                            }
                        }
                    },
                    error: function (returndata) {
                        alert("上传出错了 "+returndata);
                    }
                });
            }
        
        
        $scope.choseFile = function () {
            //alert(12121);
            $('#file_'+$scope.fileuid).click();
        }

        }],
        link:function(scope, element, attrs){



            $($(element).find("input")[0]).attr("id","file_"+scope.fileuid);
            $($(element).find("input")[1]).attr("id","fileName_"+scope.fileuid);


            $('#file_'+scope.fileuid).change(function() {
                $('#fileName_'+scope.fileuid).val( $('#file_'+scope.fileuid).val() );
               // scope.upload();
            });

            scope.option.getWidgetApi(scope.widgetApi);
        }
    }

});