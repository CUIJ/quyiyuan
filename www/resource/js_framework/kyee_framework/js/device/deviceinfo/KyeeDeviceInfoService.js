/**
 * 产品名称 KYMH
 * 创建用户: 李文娟
 * 日期: 2015/4/26
 * 时间: 20:13
 * 创建原因：框架提供的设备信息服务
 * 修改原因：修改判断undefined的方法
 * 修改用户：朱学亮
 * 修改时间：2015/5/10
 */
angular
    .module("kyee.framework.device.deviceinfo", [])
    .factory("KyeeDeviceInfoService",  function() {

        return {

            /**
             *
             * @param success 回调成功时，会把设备信息作为参数传递
             *
             * device.cordova
             * device.model
             * device.platform  平台
             * device.uuid   UUID
             * device.version 系统版本，例如Android 2.3返回是2.3
             * @param error
             */
            getInfo:function(success, error) {

                if (typeof(device) != "undefined") {

                    device.getInfo(success, error);
                }
            }
        };
    });