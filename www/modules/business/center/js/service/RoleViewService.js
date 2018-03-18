/**
 * Created by Administrator on 2015/4/29.
 * 修改日期：2015-05-15 14:46
 * 修改人：朱学亮
 * 修改内容：与后台交互，获取当前用户的可用角色
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.service.RoleViewService")
    .require(["kyee.framework.service.messager"])
    .type("service")
    .name("RoleViewService")
    .params(["KyeeMessagerService", "HttpServiceBus"])
    .action(function(KyeeMessagerService, HttpServiceBus){
        var def = {
            // 获取当前用户的可选角色
            queryDevList : function(Callback){
                HttpServiceBus.connect({
                    url : '/UserRoleManagementBackground/action/UserRoleManagementBackgroundActionC.jspx',
                    params : {
                        loc : 'c',
                        op : 'queryAll'
                    },
                    onSuccess : function(retVal){
                        // 返回成功后调用回调函数
                        Callback(retVal);
                    },
                    onError : function(retVal){
                        // 返回失败时暂未处理
                    }
                });
            },
            // 当用户选择需要切换的角色后，将此信息同步到服务器
            updateUserRole : function(Callback, data) {
                HttpServiceBus.connect({
                    url : 'user/action/LoginAction.jspx',
                    params : {
                        loc : 'c',
                        op : 'updateUserView',
                        postdata: data
                    },
                    onSuccess : function(retVal) {
                        Callback(retVal);
                    },
                    onError : function(retVal) {
                        // 返回失败时暂未处理
                    }
                });
            }
        };

        return def;
    })
    .build();
