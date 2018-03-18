/**
 * 产品名称 KYMH
 * 创建用户: 李文娟
 * 日期: 2015/4/27
 * 时间: 10:54
 * 创建原因：电话相关的服务
 * 修改原因：
 * 修改时间：
 */
angular
    .module("kyee.framework.device.phone", [])
    .factory("KyeePhoneService", function() {

        return {

            call:function(success, error, phoneNum) {
                if (navigator.phone != undefined) {
                    navigator.phone.call(success, error, phoneNum);
                }
            },

            callOnly:function(phoneNum) {
                if(!window.device){//网页版
                    window.location.href = "tel:" + phoneNum;
                }else{
                    this.call(function(){}, function(){}, phoneNum);
                }
            }
        };
    });