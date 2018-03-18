/**
 * 产品名称 KYMH
 * 创建用户: 李聪
 * 日期: 2017/1/11
 * 创建原因：微信，qq第三方平台授权登录
 */
angular
    .module("kyee.framework.service.third_party_auth", [])
    .factory("ThirdPartyAuthService", function(){
        return {
            // 获取第三方平台用户信息
            // 在success回调方法中需调用formatPlatformUserInfo对用户信息进行格式化
            getPlatformInfo: function(action, success, error){
                if (device.platform == "Android") {
                    if (navigator.umengSocial != undefined) {
                        if(action == "qqlogin"){
                            navigator.umengSocial.auth(success, error, "QQ");
                        } else if(action == "wxlogin"){
                            navigator.umengSocial.auth(success, error, "WeiXin");
                        }
                    }
                } else if(device.platform == "iOS"){
                    if (navigator.ThirdPartyLogin != undefined) {
                        if (action == "qqlogin") {
                            navigator.ThirdPartyLogin.callQQFunction(success, error);
                        } else if (action == "wxlogin") {
                            navigator.ThirdPartyLogin.callWeiXinFunction(success, error);
                        }
                    }

                }
            },

            /*
             * 对不同平台上的用户信息进行格式化处理
             * platformType  第三方平台 QQ, WeiXin
             * userInfo 包含的用户信息有
             *  uid：用户id
             *  name： 昵称
             *  iconurl：头像url
             *  gender：性别 男，女(android, ios qq返回的性别为gender)
             *  sex: 性别 0 男  1 女 2 未知
             **/
            formatPlatformUserInfo: function(platformType, info){
                if(info){
                    if(device.platform == "iOS") {
                        info = JSON.parse(info);
                    }
                    if (device.platform == "Android" || platformType == "QQ"){
                        info.sex = 2; // 0 男  1 女 2 未知
                        if(info.gender == "女"){
                            info.sex = 1;
                        } else if(info.gender == "男"){
                            info.sex = 0;
                        }
                    }

                    info.platform = platformType;
                    return info;
                }
            }
        };
    });