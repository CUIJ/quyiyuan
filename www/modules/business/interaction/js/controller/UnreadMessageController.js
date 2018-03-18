/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年6月29日18:13:43
 * 创建原因：医患互动未读留言列表页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.interaction.unreadMessage.controller")
    .require([
        "kyee.quyiyuan.interaction.unreadMessage.service",
        "kyee.quyiyuan.interaction.unreadMessageDetail.controller",
        "kyee.quyiyuan.interaction.unreadMessageDetail.service"
        ])
    .type("controller")
    .name("UnreadMessageController")
    .params(["$scope", "$state", "UnreadMessageService",
        "DoctorMessageBoardService", "CacheServiceBus", "UnreadMessageDetailService",
        "KyeeListenerRegister"])
    .action(function($scope, $state, UnreadMessageService,
                     DoctorMessageBoardService, CacheServiceBus, UnreadMessageDetailService,
                     KyeeListenerRegister){

        KyeeListenerRegister.regist({
            focus : "patientUnreadMessage",
            when : KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_ENTER,
            direction : "back",
            action : function(params){

                if(DoctorMessageBoardService.changeFlag){
                    //更新页面元素
                    $scope.words[UnreadMessageDetailService.wordsIndex] = UnreadMessageDetailService.words;
                }
            }
        });

        /**
         * 查询未读留言列表
         */
        $scope.queryUnreadWords = function(){
            var hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            var doctorCode = UnreadMessageService.DOCTOR_CODE;
            var userVsId = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
            DoctorMessageBoardService.queryChatWords(true, 1, hospitalId, doctorCode,
                1, 8, function (data) {
                    $scope.words = data;
                    $scope.unreadList = [];

                    for(var index = 0; index <data.length; index ++){
                        //插入根留言
                        var root = data[index];
                        if(root.WORDS_READ_FLAG == 0
                            && root.WORDS_FLAG == 1
                            && root.USER_VS_ID == userVsId){
                            var item = {};
                            item.name = "医生";
                            item.time = root.WORDS_TIME;
                            item.text = root.WORDS_TEXT;
                            item.index = index;
                            $scope.unreadList.push(item);
                        }

                        for(var indexRest = 0; indexRest <root.RESET.length; indexRest ++){
                            //插入子留言
                            var reset = root.RESET[indexRest];
                            if(reset.WORDS_READ_FLAG == 0
                                && reset.RECEIVE_ID == userVsId
                                && reset.SEND_ID != userVsId){
                                var item = {};
                                item.name = "医生";
                                item.time = reset.RESET_TIME;
                                item.text = reset.RESET_TEXT;
                                item.index = index;
                                $scope.unreadList.push(item);
                            }
                        }
                    }
                });
        };

        $scope.queryUnreadWords();

        /**
         * 点击单个未读留言事件
         */
        $scope.itemClick = function (item) {
            UnreadMessageDetailService.words = $scope.words[item.index];
            UnreadMessageDetailService.wordsIndex = item.index;
            $state.go("patientUnreadMessageDetail");
        };

    })
    .build();

