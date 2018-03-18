/**
 * 产品名称：quyiyuan.
 * 创建用户：杜巍巍
 * 日期：2015年12月15日22:01:26
 * 任务号：KYEEAPPC-4374
 * 创建原因：更改设置页面服务层
 */
//外部接口：
//setBackTabIndex(index)
//从我的趣医页面跳转时设置，标志要返回的标签页
new KyeeModule()
    .group("kyee.quyiyuan.changeSetting.service")
    .require([

    ])
    .type("service")
    .name("ChangeSettingService")
    .params(["$state","HttpServiceBus","CacheServiceBus","KyeeMessageService"])
    .action(function($state,HttpServiceBus,CacheServiceBus,KyeeMessageService){

        var def = {

            //从云上查取用户的就医记录信息
            queryOpenedFunction: function (hospitalId, onSuccess) {
                HttpServiceBus.connect({
                    url: "multibusiness/action/VisitTreeAcionC.jspx",
                    showLoading:true,
                    params: {
                        HOSPITAL_ID:hospitalId,
                        op: "getVisitTreeAuthorityList"
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            //def.dealData(data);
                            onSuccess(data);
                        }else{
                            KyeeMessageService.broadcast({
                                content:data.message
                            });
                        }
                    }
                });
            }
        };
        return def;
    })
    .build();
