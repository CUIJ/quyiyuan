/**
 * 产品名称 KYMH
 * 创建用户: 李文娟
 * 日期: 2015/4/29
 * 时间: 14:54
 * 创建原因：
 * 修改原因：添加对ios分享的支持
 * 修改时间：2015/4/29 17:40
 */
angular
    .module("kyee.framework.service.share", [])
    .factory("KyeeShareService",  function() {

        return {
            share:function(action, success, error, params) {
                if (device.platform == "Android") {
                    // 新浪微博分享使用Cordova插件com.kingyee.kymh.share
                    if(action == "sinashare"){
                        if(navigator.share != undefined){
                            navigator.share.share("weiboshare", success, error, params);
                        }
                    } else {
                        /* qq空间，微信朋友圈，微信好友分享使用基于友盟社会化插件的Cordova插件
                         * kyeegroup-plugin-umeng-social
                         * params = [platform, shareUrl, shareTitle, description]
                         * platform 第三方平台: WeiXinHY, WeiXinCircle, Qzone
                         * */
                        if (navigator.umengSocial != undefined) {
                            navigator.umengSocial.share(success, error,
                                [action, params[0], params[1], params[2], params[3]]);
                        }
                    }
                } else if (device.platform == "iOS" && kyeeWXShare != undefined) {
                    switch(action){
                        case "WeiXinCircle":
                            kyeeWXShare.wxshare(success, error, params);
                            break;
                        case "WeiXinHY":
                            kyeeWXShare.wxhyshare(success, error, params);
                            break;
                        case "Qzone":
                            kyeeTencentShare.tencentshare(success, error, params);
                            break;
                        case "sinashare":
                            kyeeWeiboShare.weiboshare(success, error, params);
                            break;
                    }
                }
            }
        };
    });