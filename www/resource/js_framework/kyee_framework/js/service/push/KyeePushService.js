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
    .module("kyee.framework.service.push", [])
    .factory("KyeePushService",  function() {

        return {

            isRegistered:function() {

                if (navigator.push != undefined) {

                    return navigator.push.registered;
                }

                return false;
            },
            getUserId:function() {

                if (navigator.push != undefined) {

                    return navigator.push.userid;
                }

                return null;
            },
            getAppId:function() {

                if (navigator.push != undefined) {

                    return navigator.push.appid;
                }

                return null;
            },
            getChannelId:function() {

                if (navigator.push != undefined) {

                    return navigator.push.channelid;
                }

                return null;
            },
            init:function(apiKey) {

                if (navigator.push != undefined) {

                    return navigator.push.init(apiKey);
                }
            },
            success:function(info) {

                if (navigator.push != undefined) {

                    return navigator.push.successFn(info);
                }
            },
            message:function(pushmessage) {

                if (navigator.push != undefined) {

                    return navigator.push.message(pushmessage);
                }
            },
            fail:function(info) {

                if (navigator.push != undefined) {

                    return navigator.push.failureFn(info);
                }
            }
        };
    });