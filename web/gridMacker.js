/**
 *
 * 2016-04-18 wangzheng
 * grid快速创建工具
 *
 *
 */

App.controller('gridMakerMainCtrl',['$scope',function($scope){


    angular.element(document).ready(function() {
        $("#tabstrip").kendoTabStrip({
            animation:  {
                open: {
                    effects: "fadeIn"
                }
            }
        });
    });



}]);

