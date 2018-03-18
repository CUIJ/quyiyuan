/**
 * 产品名称 KYMH
 * 创建用户: 李文娟
 * 日期: 2015/4/26
 * 时间: 20:13
 * 创建原因：框架提供的短信截取服务
 * 修改原因：
 * 修改时间：
 */
angular
    .module("kyee.framework.device.message", [])
    .factory("KyeeDeviceMsgService",  function() {

        return {

            /**
             *
             * @param success received message will returned to param
             * @param error
             */
            getMessage:function(success, error) {

                if (navigator.message != undefined) {

                    navigator.message.getMessage(success, error);
                }
            }
        };
    });