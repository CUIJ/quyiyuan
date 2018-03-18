/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月5日11:06:54
 * 创建原因：医生视角留言咨询页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.doctorRole.messageBoard.controller")
    .require([
        "kyee.quyiyuan.doctorRole.messageBoard.service",
        "kyee.quyiyuan.doctorRole.doctorUnreadMessage.service",
        "kyee.quyiyuan.doctorRole.doctorUnreadMessage.controller"])
    .type("controller")
    .name("MessageBoardController")
    .params(["$scope", "$state", "MessageBoardService",
        "CacheServiceBus", "$ionicActionSheet", "DoctorUnreadMessageService",
        "KyeeListenerRegister", "$ionicScrollDelegate", "KyeeMessageService","KyeeI18nService"])
    .action(function($scope, $state, MessageBoardService,
                     CacheServiceBus, $ionicActionSheet, DoctorUnreadMessageService,
                     KyeeListenerRegister, $ionicScrollDelegate, KyeeMessageService,KyeeI18nService){

        //初始化数据
        MessageBoardService.paramData.HOSPITAL_NAME = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).name;
        MessageBoardService.paramData.HOSPITAL_ID = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;

        //获取上个页面传递的参数
        $scope.data = MessageBoardService.paramData;
        //根子留言状态标记，0：发表根留言，1：发表子留言
        $scope.chatFlag = 0;
        //空提示
        $scope.emptyText = KyeeI18nService.get("patientInfo.doctorMessageBoard.noAdvisoryMessage", "暂无咨询留言");
        //分页设置
        $scope.page = 0;
        $scope.limit = 8;
        //是否可以加载更多的开关初始化
        $scope.moreDataCanBeLoadedFlag = true;
        //是否有改变
        MessageBoardService.changeFlag = false;
        //共享scope
        MessageBoardService.scopeData = $scope;


        KyeeListenerRegister.regist({
            focus : "patientInfo.doctorMessageBoard",
            when : KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_ENTER,
            direction : "back",
            action : function(params){
                $scope.UNREAD_NUM = 0;

                //标记该医生消息已读
                if(MessageBoardService.unReadWord){
                    MessageBoardService.unReadWord.readFlag = true;
                }

                if(MessageBoardService.changeFlag){
                    //更新页面元素
                    $scope.queryChatWords(true);
                }
            }
        });

        /**
         * 加载数据函数
         */
        $scope.loadMore = function(){
            $scope.page++;
            var hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            var doctorCode = $scope.data.DOCTOR_CODE;

            var showLoading = false;
            if($scope.page == 1){
                showLoading = true;
            }

            MessageBoardService.queryChatWords(showLoading, $scope.data.USER_VS_ID ,0, hospitalId, doctorCode,
                $scope.page, $scope.limit, function (data) {

                    if($scope.words == undefined){
                        $scope.words = [];
                    }
                    if(data){
                        if(data.length != 8){
                            $scope.moreDataCanBeLoadedFlag = false;
                        } else {
                            $scope.moreDataCanBeLoadedFlag = true;
                        }
                        for(var index = 0; index < data.length ; index++){
                            $scope.words.push(data[index]);
                        }
                    } else {
                        $scope.moreDataCanBeLoadedFlag = false;
                    }

                    // 判空显示
                    if(!$scope.words || $scope.words.length == 0){
                        $scope.showEmpty = true;
                    } else {
                        $scope.showEmpty = false;
                    }

                    //新留言显示 UNREAD_NUM
                    $scope.showNewMessage();

                    $scope.$broadcast('scroll.infiniteScrollComplete');
                });
        };

        /**
         * 初始化查询聊天内容
         */
        $scope.queryChatWords = function(showLoading){
            $scope.page = 1;
            var hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            var doctorCode = $scope.data.DOCTOR_CODE;
            MessageBoardService.queryChatWords(showLoading, $scope.data.USER_VS_ID, 0, hospitalId, doctorCode,
                $scope.page, $scope.limit, function (data) {

                    $scope.words = data;

                    if(data && data.length == 8){
                        $scope.moreDataCanBeLoadedFlag = true;
                    } else {
                        $scope.moreDataCanBeLoadedFlag = false;
                    }

                    // 判空显示
                    if(!$scope.words || $scope.words.length == 0){
                        $scope.showEmpty = true;
                    } else {
                        $scope.showEmpty = false;
                    }

                    //新留言显示 UNREAD_NUM
                    $scope.showNewMessage();

                    $ionicScrollDelegate.scrollTop();

                    $scope.$broadcast('scroll.refreshComplete');
                });
        };

        /**
         * 判断新留言标记是否显示
         */
        $scope.showNewMessage = function () {
            if(!$scope.showEmpty && $scope.words[0].READ_NUM > 0){
                $scope.UNREAD_NUM = $scope.words[0].READ_NUM;
            }
        };

        /**
         * 打开未读留言页面
         */
        $scope.openUnreadMessage = function () {
            DoctorUnreadMessageService.DOCTOR_CODE = $scope.data.DOCTOR_CODE;
            DoctorUnreadMessageService.USER_VS_ID = $scope.data.USER_VS_ID;
            $state.go("doctorUnreadMessage");
        }

        /**
         * 判断显示名称
         */
        $scope.showName = function (word) {
            if(word.WORDS_FLAG == 0){
                return word.SHOW_NAME;
            } else {
                return KyeeI18nService.get("patientInfo.doctorMessageBoard.me", "我");
            }
        };

        /**
         * 判断发送人显示名称
         */
        $scope.showSendName = function (parentIndex, index) {
            if($scope.words[parentIndex].RESET[index].SEND_ID
                == $scope.data.DOCTOR_CODE){
                return KyeeI18nService.get("patientInfo.doctorMessageBoard.me", "我");
            } else {
                return $scope.words[parentIndex].RESET[index].SEND_NAME;
            }
        };

        /**
         * 判断接收人显示名称
         */
        $scope.showReceiveName = function (parentIndex, index) {
            if($scope.words[parentIndex].RESET[index].RECEIVE_ID
                == $scope.data.DOCTOR_CODE){
                return KyeeI18nService.get("patientInfo.doctorMessageBoard.me", "我");
            } else {
                return $scope.words[parentIndex].RESET[index].RECEIVE_NAME;
            }
        };

        /**
         * 删除根留言
         */
        $scope.deleteRootWord = function (index) {

            /**
             * 姚斌 2015年7月14日09:20:32
             * KYEEAPPTEST-2714  增加删除留言确认功能
             */
            KyeeMessageService.confirm({
                content: KyeeI18nService.get("patientInfo.doctorMessageBoard.deleteMessage", "确认要删除该条留言吗？"),
                onSelect: function (res) {
                    if(res){
                        MessageBoardService.deleteRootWord($scope.words[index].WORDS_ID);
                        $scope.words.splice(index, 1);
                    }
                }
            });
        };

        /**
         * 删除子留言
         */
        $scope.deleteResetWord = function () {
            MessageBoardService.deleteResetWord($scope.words[$scope.parentIndex].RESET[$scope.index].RESET_ID);
            $scope.words[$scope.parentIndex].RESET.splice($scope.index, 1);
        };

        /**
         * 发表根留言
         */
        $scope.postRootWord = function (me, words) {
            var hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            var postdata = {
                HOSPITAL_ID: hospitalId,
                WORDS_TEXT: words,
                DOCTOR_CODE: $scope.data.DOCTOR_CODE,
                WORDS_FLAG: 0,
                USER_VS_ID: $scope.data.USER_VS_ID,
                DEPT_CODE: $scope.data.DEPT_CODE
            };
            MessageBoardService.postRootWord(postdata, 1);

            $scope.queryChatWords(true);

            me.reset = "";
        };

        /**
         * 发表子留言
         */
        $scope.postResetWord = function (me, words) {
            var hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            var postdata = {
                HOSPITAL_ID: hospitalId,
                RESET_TEXT: words,
                WORDS_ID: $scope.words[$scope.parentIndex].WORDS_ID,
                DOCTOR_CODE: $scope.data.DOCTOR_CODE,
                SEND_ID: $scope.data.DOCTOR_CODE,
                SEND_NAME: $scope.data.DOCTOR_NAME,
                RECEIVE_ID: $scope.receiverId,
                RECEIVE_NAME: $scope.receiverName,
                DEPT_CODE: $scope.data.DEPT_CODE
            };
            MessageBoardService.postResetWord(hospitalId, $scope.data.DOCTOR_CODE,
                $scope.words[$scope.parentIndex].WORDS_ID, postdata, function (data) {

                $scope.words[$scope.parentIndex].RESET = data[0].RESET;
            });

            me.reset = "";
        };

        /**
         * 发表子留言按钮事件
         */
        $scope.postResetWordBtn = function (index) {
            $scope.parentIndex = index;
            $scope.chatFlag = 1;
            if($scope.words[index].WORDS_FLAG == 0){
                $scope.receiverName = $scope.data.OFTEN_NAME;
                $scope.receiverId = $scope.data.USER_VS_ID;
            } else {
                $scope.receiverName = $scope.data.DOCTOR_NAME;
                $scope.receiverId = $scope.data.DOCTOR_CODE;
            }

            $scope.receiverNameShow = "";
            document.querySelector('#submitInout').style.display = '';
        };

        /**
         * 点击留言按钮事件
         */
        $scope.onPostRootClick = function () {
            $scope.chatFlag = 0;

            document.querySelector('#submitInout').style.display='';
        };

        /**
         * 点击某一条子留言操作
         */
        $scope.operateReset = function (parentIndex, index) {
            if($scope.words[parentIndex].RESET[index].SEND_ID == $scope.data.DOCTOR_CODE){
                $scope.parentIndex = parentIndex;
                $scope.index = index;
                $scope.showDelete();
                document.querySelector('#submitInout').style.display='none';
            } else if($scope.words[parentIndex].WORDS_FLAG == 1
                || $scope.words[parentIndex].DOCTOR_CODE == $scope.data.DOCTOR_CODE){

                $scope.parentIndex = parentIndex;
                $scope.chatFlag = 1;
                $scope.receiverName = $scope.words[$scope.parentIndex].RESET[index].SEND_NAME;
                $scope.receiverId = $scope.words[$scope.parentIndex].RESET[index].SEND_ID;
                $scope.receiverNameShow = $scope.words[$scope.parentIndex].RESET[index].SEND_NAME;
                document.querySelector('#submitInout').style.display='';
            }
        };

        /**
         * 提交回复
         */
        $scope.submitWords = function (words) {
            if(!words || !words.trim()){
                return;
            }

            if($scope.chatFlag == 0){
                $scope.postRootWord(this, words);
            } else {
                $scope.postResetWord(this, words);
            }

            document.querySelector('#submitInout').style.display='none';
        }

        /**
         * 显示删除操作菜单
         */
        $scope.showDelete = function() {
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    { text: KyeeI18nService.get("patientInfo.doctorMessageBoard.deleteIs", "删除")},
                    { text: KyeeI18nService.get("patientInfo.doctorMessageBoard.cance", "取消")},
                ],
                buttonClicked: function(index) {
                    if(index == 0){
                        $scope.deleteResetWord();
                    }
                    return true;
                }
            });
        };

        /**
         * 判断显示Placeholder函数
         * @returns {string}
         */
        $scope.getPlaceholderText = function () {
            if($scope.chatFlag == 0){
                return KyeeI18nService.get("patientInfo.doctorMessageBoard.give", "给") + MessageBoardService.paramData.OFTEN_NAME + KyeeI18nService.get("patientInfo.doctorMessageBoard.leaveMessage", "留言");
            } else {
                return KyeeI18nService.get("patientInfo.doctorMessageBoard.reply", "回复") + $scope.receiverNameShow;
            }
        };

        /**
         * 判断删除和回复按钮是否显示的函数
         */
        $scope.showOperateBtn = function (index) {
            if(($scope.words[index].WORDS_FLAG == 1
                && $scope.words[index].DOCTOR_CODE == $scope.data.DOCTOR_CODE)
                || $scope.words[index].WORDS_FLAG == 0){
                return true;
            } else {
                return false;
            }
        };

        /**
         * 判断删除按钮是否显示的函数
         */
        $scope.showDeleteBtn = function (index) {
            if($scope.words[index].WORDS_FLAG == 1
                && $scope.words[index].DOCTOR_CODE == $scope.data.DOCTOR_CODE){
                return true;
            } else {
                return false;
            }
        };

        /**
         * 判断是否还有更多数据
         * @returns {boolean}
         */
        $scope.moreDataCanBeLoaded = function(){
            return $scope.moreDataCanBeLoadedFlag;
        };
    })
    .build();

