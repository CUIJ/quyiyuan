/**
 * 产品名称 KYMH
 * 创建用户: 李文娟
 * 日期: 2015/4/30
 * 时间: 13:18
 * 创建原因：
 * 修改原因：
 * 修改时间：
 */
new KyeeModule()
    .group("kyee.quyiyuan.aboutquyi.service")
    .require([])
    .type("service")
    .name("AboutQuyiService")
    .params([
        "$state", "KyeeMessageService", "HttpServiceBus",
        "CacheServiceBus", "KyeeI18nService"
    ])
    .action(function($state, KyeeMessageService, HttpServiceBus,
                     CacheServiceBus, KyeeI18nService){

        var def = {

            customerNumbers:"", //客服电话
            SERVICE_TIME:"", //客服服务时间
            webUrl:"http://www.quyiyuan.com/",
            name:"帮助",
            getProblemItems : function() {
                return problemItems;
            },

            suggest:{
                EditText:""
            },
            //提示
            remind : function(content, okText){
                KyeeMessageService.message({
                    content : content,
                    okText : okText
                });
            },

            submitSuggest:function($scope,afterSubmitSuggest){
                var cache = CacheServiceBus.getMemoryCache();
                var me = this;
                HttpServiceBus.connect({
                    url : '/suggest/action/SuggestActionC.jspx',
                    params : {
                        op: 'suggestC',
                        INFO:$scope.suggest.EditText,
                        NAME:cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).OFTEN_NAME,
                        ID_NO:cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).ID_NO,
                        PHONE_NUMBER:cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).PHONE
                    },
                    onSuccess : function(retVal){
                        var success = retVal.success;
                        var status = retVal.data;
                        if(success){
                            afterSubmitSuggest();
                            me.querySuggest($scope);
                        }else{
                            def.remind("提交失败！", "知道了");
                        }
                    },
                    onError : function(retVal){
                    }
                });
            },

            querySuggest:function($scope){
                var memoryCache = CacheServiceBus.getMemoryCache();
                HttpServiceBus.connect({
                    url : '/suggest/action/SuggestActionC.jspx',
                    params : {
                        op: 'querySuggestByUser',
                        userId: memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID
                    },
                    onSuccess : function(retVal){
                        var success = retVal.success;
                        var status = retVal.data;
                        if(success){
                            $scope.suggestData=retVal.data.rows;
                            if($scope.suggestData!=null&&$scope.suggestData.length>0){
                                for(var i=0;i<$scope.suggestData.length;i++){
                                    if($scope.suggestData[i].STATUS == '1'){
                                        $scope.suggestData[i].STATUS_TEXT = KyeeI18nService.get("aboutquyi_feedback.alreadyResetCheck","已回复");
                                    }else if($scope.suggestData[i].LOCK_STATUS == '1' ){
                                        $scope.suggestData[i].STATUS_TEXT = KyeeI18nService.get("aboutquyi_feedback.alreadyResetCheck","处理中");
                                    }else{
                                        $scope.suggestData[i].STATUS_TEXT = KyeeI18nService.get("aboutquyi_feedback.unReset","未回复");
                                    }
                                }
                            }
                        }else{
                            def.remind("查询失败！", "知道了");
                        }
                    },
                    onError : function(retVal){
                    }
                });
            },

            // 获取短信平台号码
            getSms: function(Callback) {
                HttpServiceBus.connect({
                    url: 'function/action/FunctionActionC.jspx',
                    params: {
                        op:'getAboutSmsPort'
                    },
                    cache : {
                        by : "ONCE"
                    },
                    onSuccess: function(retVal) {
                        Callback(retVal);
                    },
                    onError: function(retVal) {
                    }
                });
            },
            //获取客服电话参数
            getNetParams: function (getData) {
                HttpServiceBus.connect({
                    url: "/config/action/ParamsystemActionC.jspx",
                    params: {
                        op: "querySysParams",
                        PARA_CODE: "CUSTOMER_NUMBERS,SERVICE_TIME"
                    },
                    onSuccess: function (data) {//回调函数
                        if (data.success) {
                            if(data.data.CUSTOMER_NUMBERS){
                                def.customerNumbers = data.data.CUSTOMER_NUMBERS;
                            }
                            if(data.data.SERVICE_TIME){
                                def.SERVICE_TIME = data.data.SERVICE_TIME;
                            }else{
                                def.SERVICE_TIME="8:00~23:00";
                            }

                            getData(data.data.CUSTOMER_NUMBERS);
                        } else {
                            getData("4000801010");
                            def.SERVICE_TIME="8:00~23:00";
                        }
                    },
                    onError: function () {
                        getData("4000801010");
                        def.SERVICE_TIME="8:00~23:00";
                    }
                });
            },

            /*
             * 用户分享趣医网信息后，将分享渠道上传到服务器
             * sharePlatform: QQZone, wxhy, wxpyq, weibo
             * status:  0 成功 1 失敗  2 取消
             * shareData: 分享参数
             * */
            saveShareChannel: function(sharePlatform, status, shareData) {
                // userId=0 表示游客   userId有值表示某个登录用户的ID
                var userId = "0";
                var cache = CacheServiceBus.getMemoryCache();
                var userData = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                if (userData) {
                    userId = userData.USER_ID;
                }

                //0代表Android平台 1 代表IOS平台
                var platformCode = 0;
                if (shareData.platform == "iOS") {
                    platformCode = 1;
                }

                // 1 朋友圈  2 微博  3 QQ空间  4 微信好友
                var channel = {
                    "wxpyq": "1",
                    "weibo": "2",
                    "QQZone": "3",
                    "wxhy": "4"
                };

                HttpServiceBus.connect({
                    url: "/share/action/ShareAction.jspx",
                    params: {
                        loc: "c",
                        op: "saveShareHistory",
                        USER_ID: userId,
                        SHARE_TYPE: channel.get(sharePlatform),
                        PHONE_STYLE: platformCode,
                        SHARE_STATUS: status,
                        INFO_URL: shareData.infoUrl,   // 分享页面链接
                        INFO_TITLE: shareData.infoTitle, // 分享标题
                        INFO_DESCRIPTION: shareData.infoDescription  // 分享描述
                    }
                });
            }
        };

        return def;
    })
    .build();