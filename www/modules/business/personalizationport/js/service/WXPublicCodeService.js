/**
 * 产品名称 quyiyuan
 * 创建用户: 程铄闵
 * 创建时间: 2016年2月22日11:32:09
 * 创建原因：获取非APP来源的openid
 * 任务号：KYEEAPPC-5231
 */
new KyeeModule()
    .group("kyee.quyiyuan.wxpubliccode.service")
    .require([])
    .type("service")
    .name("WXPublicCodeService")
    .params([
        "CacheServiceBus",
        "HttpServiceBus"
    ])
    .action(function(CacheServiceBus,HttpServiceBus){

        var def = {
            //获取微信公众号的openId
            getWxOpenId:function(urlInfo){
                HttpServiceBus.connect({
                    url : '/apppay/action/PayActionC.jspx',
                    params : {
                        op:'queryWxOpenIdByCode',
                        hospitalId:urlInfo.hospitalId,
                        wx_code:urlInfo.code
                    },
                    onSuccess : function(retVal){
                        if(retVal.success){
                            var openId = retVal.data.openId;
                            var cache = CacheServiceBus.getMemoryCache();
                            cache.set(CACHE_CONSTANTS.MEMORY_CACHE.WX_OPEN_ID, openId);
                            def.openIdNullTip = retVal.message;//如果openId为空的提示语
                        }
                        else{
                            def.openIdNullTip = retVal.message;
                        }
                    },
                    onError : function(retVal){
                    }
                });

            }
        };
        return def;
    })
    .build();
