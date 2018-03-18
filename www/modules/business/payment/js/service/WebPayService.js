/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2015年5月17日15:53:54
 * 创建原因：通用网页支付服务
 * 修改者：
 * 修改原因：
 */
new KyeeModule()
    .group("kyee.quyiyuan.webPay.service")
    .type("service")
    .name("WebPayService")
    .params(["HttpServiceBus","HttpServiceBusService","KyeeUtilsService"])
    .action(function (HttpServiceBus,HttpServiceBusService,KyeeUtilsService) {
        var def = {
            //网页支付链接
            url: '',
            payType: '',
            delayTime:0 , //延迟时间 KYEEAPPC-5741 程铄闵
            //处理url，增加全局参数以通过后台校验 KYEEAPPC-6546 程铄闵
            setUrl: function (data) {
                var params = AppConfig.SERVICE_BUS.http.default_params;
                var paramsAppend = '';
                for(var x in params){
                    if(typeof(params[x])=='string'){
                        var val = params[x];
                        if(val){
                            val = KyeeUtilsService._encodeUriQuery(val,true);
                            paramsAppend = paramsAppend + x + '=' + val + '&';
                        }
                    }
                    else if(typeof(params[x])=='function'){
                        var val = params[x]();
                        if(val){
                            val = KyeeUtilsService._encodeUriQuery(val,true);
                            paramsAppend = paramsAppend + x + '=' + val + '&';
                        }
                    }
                }
                paramsAppend = paramsAppend.substring(0,paramsAppend.length-1);
                var index = data.indexOf('?')+1;
                var urlParamsString = data.substring(index,data.length) + '&' + paramsAppend;
                var str = {urlParamsString:urlParamsString};
                var qyCheck = HttpServiceBusService.generateFullCheckCode4GET(str);
                var url = data + '&' + paramsAppend + '&QY_CHECK_SUFFIX=' + qyCheck;
                return url;
            }
        };

        return def;
    })
    .build();