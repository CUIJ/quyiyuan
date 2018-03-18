/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月5日11:06:54
 * 创建原因：医患互动留言咨询页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.interaction.doctorMessageBoard.controller")
    .require([
        "kyee.quyiyuan.interaction.doctorMessageBoard.service",
        "kyee.quyiyuan.interaction.unreadMessage.controller",
        "kyee.quyiyuan.interaction.unreadMessage.service"])
    .type("controller")
    .name("DoctorMessageBoardController")
    .params(["$scope", "$state", "DoctorMessageBoardService",
        "CacheServiceBus", "$ionicActionSheet", "UnreadMessageService",
        "KyeeListenerRegister", "$ionicScrollDelegate", "KyeeMessageService",
        "KyeeI18nService"])
    .action(function($scope, $state, DoctorMessageBoardService,
                     CacheServiceBus, $ionicActionSheet, UnreadMessageService,
                     KyeeListenerRegister, $ionicScrollDelegate, KyeeMessageService,
                     KyeeI18nService){
        //是否显示默认图片的样式  by 杜巍巍 KYEEAPPC-5367
        $scope.defaultImage = undefined;
        $scope.data = DoctorMessageBoardService.paramData;
        //聊天标记，发表根留言：0，子留言：1
        $scope.chatFlag = 0;
        //输入框是否显示
        $scope.chatInputShowFlag = false;
        $scope.emptyText = "暂无咨询留言";
        //医生是否绑定账号标记
        $scope.bindingFlag = false;
        //分页设置
        $scope.page = 0;
        $scope.limit = 8;
        //是否加载分页
        $scope.moreDataCanBeLoadedFlag = false;
        //是否有改变
        DoctorMessageBoardService.changeFlag = false;

        /**
         * 注册页面回退事件
         */
        KyeeListenerRegister.regist({
            focus : "doctorMessageBoard",
            when : KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_ENTER,
            direction : "back",
            action : function(params){
                $scope.UNREAD_NUM = 0;
                //标记该医生消息已读
                if(DoctorMessageBoardService.unReadWord){
                    DoctorMessageBoardService.unReadWord.readFlag = true;
                }

                if(DoctorMessageBoardService.changeFlag){
                    //更新页面元素
                    $scope.queryChatWords(true);
                }
            }
        });

        /**
         * 查询该医生是否绑定
         */
        DoctorMessageBoardService.queryDoctorBindingFlag(
            CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id,
            $scope.data.DOCTOR_CODE, function (data) {
            if(data.FLAG == 0){
                $scope.bindingFlag = false;
                $scope.showEmpty = true;
                $scope.emptyText = KyeeI18nService.get("doctorMessageBoard.noAccess", "该医生暂未开通咨询功能");
            } else {
                $scope.bindingFlag = true;
                $scope.moreDataCanBeLoadedFlag = true;
            }
        });

        /**
         * 查询医生图片信息  by 杜巍巍 KYEEAPPC-5367
         * 修改：张婧 KYEEAPPTEST-3719 预约挂号记录里面点击医患互动，页面不显示医生默认头像
         */
        if($scope.data.DOCTOR_PIC_PATH){
            if($scope.data.DOCTOR_PIC_PATH == "resource/images/base/head_default_female.jpg" || $scope.data.DOCTOR_PIC_PATH =="resource/images/base/head_default_man.jpg"){
                $scope.defaultImage = true;
            }else{
                $scope.defaultImage = false;
            }
        }
        else if($scope.data.LOGO_PHOTO){
            $scope.data.DOCTOR_PIC_PATH = $scope.data.LOGO_PHOTO;
            $scope.defaultImage = false;
        }
        else{
            DoctorMessageBoardService.queryDoctorCareInfo($scope.data.HOSPITAL_ID,
                $scope.data.DEPT_CODE, $scope.data.DOCTOR_CODE, function (data) {

                    if(data.DOCTOR_PIC_PATH){
                        $scope.data.DOCTOR_PIC_PATH = data.DOCTOR_PIC_PATH;
                    }else{
                        $scope.data.DOCTOR_PIC_PATH = 'resource/images/base/head_default_man.jpg';
                    }
                });
        }

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

            DoctorMessageBoardService.queryChatWords(showLoading, 0, hospitalId, doctorCode,
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
            if($scope.bindingFlag){
                $scope.page = 1;
                var hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
                var doctorCode = $scope.data.DOCTOR_CODE;
                DoctorMessageBoardService.queryChatWords(showLoading, 0, hospitalId, doctorCode,
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

                        //滚动到页面顶端
                        $ionicScrollDelegate.scrollTop();

                        $scope.$broadcast('scroll.refreshComplete');
                    });
            }
            else{
                return false;
            }

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
            UnreadMessageService.DOCTOR_CODE = $scope.data.DOCTOR_CODE;
            $state.go("patientUnreadMessage");
        }

        /**
         * 判断显示名称
         */
        $scope.showName = function (word) {
            if(word.WORDS_FLAG == 0){
                if (word.USER_VS_ID == $scope.data.USER_VS_ID){
                    return "我";
                } else {
                    return word.SHOW_NAME;
                }
            } else {
                return "医生";
            }
        };

        /**
         * 判断发送人显示名称
         */
        $scope.showSendName = function (parentIndex, index) {
            if($scope.words[parentIndex].RESET[index].SEND_ID
                == $scope.data.USER_VS_ID){
                return "我";
            } else if($scope.words[parentIndex].RESET[index].SEND_ID
                == $scope.data.DOCTOR_CODE) {
                return "医生";
            } else {
                return $scope.words[parentIndex].RESET[index].SEND_NAME;
            }
        };

        /**
         * 判断接收人显示名称
         */
        $scope.showReceiveName = function (parentIndex, index) {
            if($scope.words[parentIndex].RESET[index].RECEIVE_ID
                == $scope.data.USER_VS_ID){
                return "我";
            } else if($scope.words[parentIndex].RESET[index].RECEIVE_ID
                == $scope.data.DOCTOR_CODE) {
                return "医生";
            }else {
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
                content: "确认要删除该条留言吗？",
                onSelect: function (res) {
                    if(res){
                        DoctorMessageBoardService.deleteRootWord($scope.words[index].WORDS_ID);
                        $scope.words.splice(index, 1);
                    }
                }
            });
        };

        /**
         * 删除子留言
         */
        $scope.deleteResetWord = function () {
            DoctorMessageBoardService.deleteResetWord($scope.words[$scope.parentIndex].RESET[$scope.index].RESET_ID);
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
            DoctorMessageBoardService.postRootWord(postdata, 0);

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
                SEND_ID: $scope.data.USER_VS_ID,
                SEND_NAME: $scope.data.OFTEN_NAME,
                RECEIVE_ID: $scope.receiverId,
                RECEIVE_NAME: $scope.receiverName,
                DEPT_CODE: $scope.data.DEPT_CODE
                
            };
            DoctorMessageBoardService.postResetWord(hospitalId, $scope.data.DOCTOR_CODE,
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
            $scope.chatInputShowFlag = true;
        };

        /**
         * 点击留言按钮事件
         */
        $scope.onPostRootClick = function () {
            $scope.chatInputShowFlag = true;
            $scope.chatFlag = 0;
        };

        /**
         * 点击某一条子留言操作
         */
        $scope.operateReset = function (parentIndex, index) {
            if($scope.words[parentIndex].RESET[index].SEND_ID == $scope.data.USER_VS_ID){
                $scope.parentIndex = parentIndex;
                $scope.index = index;
                $scope.showDelete();
                $scope.chatInputShowFlag = false;
            } else if($scope.words[parentIndex].WORDS_FLAG == 1
                || $scope.words[parentIndex].USER_VS_ID == $scope.data.USER_VS_ID){

                $scope.parentIndex = parentIndex;
                $scope.chatFlag = 1;
                $scope.receiverName = $scope.words[$scope.parentIndex].RESET[index].SEND_NAME;
                $scope.receiverId = $scope.words[$scope.parentIndex].RESET[index].SEND_ID;
                $scope.receiverNameShow = $scope.words[$scope.parentIndex].RESET[index].SEND_NAME;
                $scope.chatInputShowFlag = true;
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

            $scope.chatInputShowFlag = false;
            //解决IOS手机上输入完键盘不收起问题
            if (window.cordova && window.cordova.plugins.Keyboard){
                cordova.plugins.Keyboard.close();
            }
        }

        /**
         * 显示删除操作菜单
         */
        $scope.showDelete = function() {
            var hideSheet = $ionicActionSheet.show({
                buttons: [
                    { text: '删除' },
                    { text: '取消' }
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
                if(window.device && window.device.platform == "iOS"){
                    return " 给" + DoctorMessageBoardService.paramData.DOCTOR_NAME + "留言";
                }else{
                    return "给" + DoctorMessageBoardService.paramData.DOCTOR_NAME + "留言";
                }
            } else {
                if(window.device && window.device.platform == "iOS"){
                    return " 回复" + $scope.receiverNameShow;
                }else{
                    return "回复" + $scope.receiverNameShow;
                }
            }
        };

        /**
         * 判断删除和回复按钮是否显示的函数
         */
        $scope.showOperateBtn = function (index) {
            if(($scope.words[index].WORDS_FLAG == 0
                && $scope.words[index].USER_VS_ID == $scope.data.USER_VS_ID)
                || $scope.words[index].WORDS_FLAG == 1){
                return true;
            } else {
                return false;
            }
        };

        /**
         * 判断删除按钮是否显示的函数
         */
        $scope.showDeleteBtn = function (index) {
            if($scope.words[index].WORDS_FLAG == 0
                && $scope.words[index].USER_VS_ID == $scope.data.USER_VS_ID){
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

