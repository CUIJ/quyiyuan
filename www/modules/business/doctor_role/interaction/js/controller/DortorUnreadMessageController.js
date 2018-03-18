/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年6月29日18:13:43
 * 创建原因：医生视角未读留言列表页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.doctorRole.doctorUnreadMessage.controller")
    .require([
        "kyee.quyiyuan.doctorRole.doctorUnreadMessageDetail.service",
        "kyee.quyiyuan.doctorRole.doctorUnreadMessageDetail.controller",
        "kyee.quyiyuan.doctorRole.messageBoard.service"
        ])
    .type("controller")
    .name("DoctorUnreadMessageController")
    .params(["$scope", "$state", "DoctorUnreadMessageService",
        "MessageBoardService", "CacheServiceBus", "DoctorUnreadMessageDetailService",
        "KyeeListenerRegister"])
    .action(function($scope, $state, DoctorUnreadMessageService,
                     MessageBoardService, CacheServiceBus, DoctorUnreadMessageDetailService,
                     KyeeListenerRegister){

        KyeeListenerRegister.regist({
            focus : "doctorUnreadMessage",
            when : KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_ENTER,
            direction : "back",
            action : function(params){

                if(MessageBoardService.changeFlag){
                    //更新页面元素
                    $scope.words[DoctorUnreadMessageDetailService.wordsIndex] =
                        DoctorUnreadMessageDetailService.words;
                }
            }
        });

        /**
         * 查询未读留言列表
         */
        $scope.queryUnreadWords = function(){
            var hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            var doctorCode = DoctorUnreadMessageService.DOCTOR_CODE;

            MessageBoardService.queryChatWords(true, DoctorUnreadMessageService.USER_VS_ID, 1, hospitalId, doctorCode,
                1, 8, function (data) {
                    $scope.words = data;
                    $scope.unreadList = [];

                    for(var index = 0; index <data.length; index ++){
                        //插入根留言
                        var root = data[index];
                        if(root.WORDS_READ_FLAG == 0
                            && root.WORDS_FLAG == 0){
                            var item = {};
                            item.name = root.SHOW_NAME;
                            item.time = root.WORDS_TIME;
                            item.text = root.WORDS_TEXT;
                            item.index = index;
                            $scope.unreadList.push(item);
                        }

                        for(var indexRest = 0; indexRest < root.RESET.length; indexRest ++){
                            //插入子留言
                            var reset = root.RESET[indexRest];
                            if(reset.WORDS_READ_FLAG == 0
                                && reset.RECEIVE_ID == doctorCode
                                && reset.SEND_ID != doctorCode){
                                var item = {};
                                item.name = reset.SEND_NAME;
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
            DoctorUnreadMessageService.words = $scope.words[item.index];
            DoctorUnreadMessageService.wordsIndex = item.index;
            $state.go("doctorUnreadMessageDetail");
        };

    })
    .build();

