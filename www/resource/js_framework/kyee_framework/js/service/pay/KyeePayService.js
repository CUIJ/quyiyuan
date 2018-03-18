/**
 * 产品名称 KYMH
 * 创建用户: 朱学亮
 * 日期: 2015/4/29
 * 时间: 07:18
 * 创建原因：框架提供的支付服务
 * 修改原因：
 * 修改时间：
 */
angular
    .module("kyee.framework.service.pay", [])
    .factory("KyeePayService",  function() {

        return {
            /**
             * @param action 可选择的支付类型
             *        wxpay  --- 微信支付
             *        alipay --- 阿里支付
             *        uppay  --- 银联支付
             *        qypay  --- 趣医支付
             *
             * @param successCallback 调用成功的回调函数
             *        可能返回三种状态  1. 支付成功；2. 支付失败；3. 用户取消了支付。
             *                      
             * @param errorCallback 调用失败的回调函数：其他异常情况导致支付失败。
             *
             * @param options 需要传入“数组”参数：
             *
             * 除微信支付以外的其他三种支付方式需要传入7个参数：
             * [out_trade_no, subject, MARK_DESC, AMOUNT, paymentType, hospitalID, USER_ID]
             * 
             * 微信支付需要传入8个参数：
             * [out_trade_no, subject, MARK_DESC, AMOUNT, paymentType, hospitalID, USER_ID, APP_ID]
             */

            pay : function(action, successCallback, errorCallback, options) {

                if (device.platform == "Android") {

                    navigator.payment.payForAndroid(action, successCallback, errorCallback, options);

                } else if (device.platform == "iOS") {

                    if (action == "wxpay") {

                        if (kyeeWXPay != undefined) {

                            kyeeWXPay.wxpay(successCallback, errorCallback, options);

                        }
                    
                    } else if (action == "alipay") {

                        if (kyeeAliPay != undefined) {

                            kyeeAliPay.alipay(successCallback, errorCallback, options);

                        }

                    } else if (action == "uppay") {

                        if (kyeeUPPay != undefined) {

                            kyeeUPPay.uppay(successCallback, errorCallback, options);

                        }

                    } else if (action == "qypay") {

                        if (kyeeQYPay != undefined) {

                            kyeeQYPay.qypay(successCallback, errorCallback, options);

                        }   
                    } else if (action == "allinpay") {

                        if (kyeeTLPay != undefined) {

                            kyeeTLPay.tlpay(successCallback, errorCallback, options);
                        }
                    }
                }
                
            }
        };
    });