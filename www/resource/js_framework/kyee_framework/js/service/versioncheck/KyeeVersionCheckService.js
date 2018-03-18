/**
 * 产品名称 KYMH
 * 创建用户: 李文娟
 * 日期: 2015/4/28
 * 时间: 10:05
 * 创建原因：
 * 修改原因：白名单功能，增加参数user_id    zm
 * 修改时间：2015/6/2
 */
angular
    .module("kyee.framework.service.versioncheck", [])
    .factory("KyeeVersionCheckService",  ["CacheServiceBus",function(CacheServiceBus) {

        return {

            checkVersion:function(success, error) {

                if (navigator.versioncheck != undefined) {

                    navigator.versioncheck.checkVersion(success, error,this.getUserId());
                }
            },
            checkVersionOnly:function() {

                this.checkVersion(function(){}, function(){});
            },
            /**
             * 获取外壳的版本状态，success会返回版本状态，0无可升级版本，1有可升级的版本
             * @param success
             * @param error
             */
            getShellVersionState:function(success, error) {

                if (navigator.versioncheck != undefined) {
                    navigator.versioncheck.getNewVersionState(success, error,this.getUserId());
                }
            },
            /**
             * 获取当前用户id，未登录为空。  zm    2015/6/2
             * @returns {string}
             */
            getUserId:function(){
                var cache = CacheServiceBus.getMemoryCache();
                var isLogin = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN);
                var user_id="";
                if(isLogin){
                    var current_user=cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                    if(current_user){
                        user_id=current_user.USER_ID;
                    }
                }
                return user_id;
            }

        };
    }]);