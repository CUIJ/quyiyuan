/**
 * 产品名称 KYMH
 * 创建用户: 李文娟
 * 日期: 2015/4/28
 * 时间: 15:29
 * 创建原因：
 * 修改原因：
 * 修改时间：
 */
angular
    .module("kyee.framework.service.umengchannel", [])
    .factory("KyeeUmengChannelService",  function() {

        return {

            getChannel:function(success, error, params) {

                if (navigator.umengchannel != undefined) {

                    return navigator.umengchannel.getUMengChannel(success, error, params);
                }
            }
        };
    });