/**
 * 产品名称 KYMH
 * 创建用户: 李文娟
 * 日期: 2015/5/7
 * 时间: 14:47
 * 创建原因：二维码扫描服务
 * 修改原因：
 * 修改时间：
 */
angular
    .module("kyee.framework.service.scanning", [])
    .factory("KyeeScanService",  function() {

        return {

            /**
             *
             * @param success
             *
             * //扫描得到的二维码
             * function(code) {
             * }
             *
             * @param error
             * //错误信息
             * function(msg) {
             * }
             */
            scan:function(success, error) {

                if (navigator.scanning != undefined) {

                    navigator.scanning.scann(success, error);
                }
            }

        };
    });