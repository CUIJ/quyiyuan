/**
 * 发送消息
 * 用作数据传递
 * hx
 */
angular
    .module('kyee.framework.service.broadcast3', [])
    .factory("KyeeBroadcastService", ["$rootScope",function ($rootScope) {
        return {
            //发送消息
            doSend:function(name,params){
                 $rootScope.$broadcast(name,params);
            },
            //注册监听
            doRegister:function(scope,name,successCallBack){
                scope.$on(name, function(event,data) {
                    successCallBack(data);
                });
            }
        }
    }])