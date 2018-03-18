/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2015年5月17日15:53:17
 * 创建原因：通用网页支付控制器
 * 修改者：
 * 修改原因：
 */
new KyeeModule()
    .group("kyee.quyiyuan.webPay.controller")
    .require(["kyee.quyiyuan.webPay.service"])
    .type("controller")
    .name("WebPayController")
    .params(["$scope", "$ionicHistory", "$sce", "WebPayService", "PayOrderService", "KyeeMessageService",
        "CacheServiceBus","KyeeI18nService","$timeout"])
    .action(function ($scope, $ionicHistory, $sce, WebPayService, PayOrderService, KyeeMessageService,
                      CacheServiceBus,KyeeI18nService,$timeout) {

        //打开的网页链接
        $scope.openUrl = $sce.trustAsResourceUrl(WebPayService.url);
        window.result = '';
        var dialog = undefined;
        $scope.patientRechargeThirdPay = false;
        if(WebPayService.patientRechargeThirdPay){
            $scope.patientRechargeThirdPay = true;
        }
        //返回
        $scope.back = function () {
            if(WebPayService.patientRechargeThirdPay){
                WebPayService.patientRechargeThirdPay=undefined;
                $ionicHistory.goBack(-1);
            }else{
                var storageCache = CacheServiceBus.getStorageCache();
                var pageData = PayOrderService.payData;
                var tradeNo = pageData?pageData.TRADE_NO:'';
                var hospitalId = '';
                if (PayOrderService.hospitalId == undefined) {
                    hospitalId = storageCache.get('hospitalInfo').id
                } else {
                    hospitalId = PayOrderService.hospitalId;
                }
                WebPayService.hospitalId = hospitalId;
                WebPayService.pageData = pageData;
                WebPayService.tradeNo = tradeNo;
                WebPayService.isCheck = true;//默认返回去查询状态
                //统一所有支付方式页面的缓冲样式 KYEEAPPC-5701 程铄闵
                if (WebPayService.payType == '12'||WebPayService.payType == '10'||WebPayService.payType == '40') {
                    //返回
                    $ionicHistory.goBack(-1);
                    //全民付网页支付  By  章剑飞  KYEEAPPC-3037
                    //PayOrderService.checkResult(hospitalId, pageData, tradeNo, WebPayService.payType,false);
                }
                else if (WebPayService.payType == '21'||WebPayService.payType == '31') {
                    //银联在线支付 程铄闵 KYEEAPPC-5420     综合支付银联web支付
                    //支付成功
                    if(window.result == '00'){
                        $ionicHistory.goBack(-1);
                        WebPayService.isCheck = false;
                        PayOrderService.checkResult(hospitalId, pageData, tradeNo, WebPayService.payType,true);
                        return;
                    }
                    else{
                        //PayOrderService.checkResult(hospitalId, pageData, tradeNo, WebPayService.payType,false);
                        //返回
                        $ionicHistory.goBack(-1);
                    }
                }
                else if (WebPayService.payType == '22') {
                    //湘雅三院专用支付 程铄闵 KYEEAPPC-5741
                    $timeout(
                        function(){
                            //返回
                            $ionicHistory.goBack(-1);
                            //PayOrderService.checkResult(hospitalId, pageData, tradeNo, WebPayService.payType,false);
                        },WebPayService.delayTime
                    );
                }
                else {
                    dialog = KyeeMessageService.confirm({
                        title: KyeeI18nService.get("commonText.msgTitle","消息"),
                        content: KyeeI18nService.get("webPay.confirm","是否完成支付？"),//KYEEAPPC-3800 国际化翻译 by 程铄闵
                        onSelect: function (confirm) {
                            if (confirm) {
                                if (pageData.flag == undefined) {
                                    //普通支付完成
                                    PayOrderService.normalPaymentSuccess(pageData);
                                } else {
                                    //预约挂号支付完成
                                    PayOrderService.paymentSuccess(pageData, tradeNo);
                                }
                            }
                        }
                    });
                    dialog.close();//KYEEAPPC-7818 程铄闵 修复跳转弹框未关闭
                    //返回
                    $ionicHistory.goBack(-1);
                }
            }
        };
    })
    .build();