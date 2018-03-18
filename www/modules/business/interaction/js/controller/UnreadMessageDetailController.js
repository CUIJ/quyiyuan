/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年6月29日18:13:43
 * 创建原因：医患互动未读留言详情页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.interaction.unreadMessageDetail.controller")
    .require([
        "kyee.quyiyuan.interaction.unreadMessageDetail.service"])
    .type("controller")
    .name("UnreadMessageDetailController")
    .params(["$scope", "$state", "UnreadMessageDetailService",
        "DoctorMessageBoardService", "CacheServiceBus", "$ionicActionSheet"])
    .action(function($scope, $state, UnreadMessageDetailService,
                     DoctorMessageBoardService, CacheServiceBus, $ionicActionSheet){

        $scope.word = UnreadMessageDetailService.words;
        $scope.data = {};
        $scope.data.USER_VS_ID = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
        $scope.data.OFTEN_NAME = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).OFTEN_NAME;
        $scope.data.DOCTOR_CODE = DoctorMessageBoardService.paramData.DOCTOR_CODE;
        $scope.data.DOCTOR_NAME = DoctorMessageBoardService.paramData.DOCTOR_NAME;
        //未读留言页面是否有修改的标记
        DoctorMessageBoardService.changeFlag = false;

        /**
         * 判断显示名称
         */
        $scope.showName = function () {
            if($scope.word.WORDS_FLAG == 0){
                return "我";
            } else {
                return "医生";
            }
        };

        /**
         * 判断发送人显示名称
         */
        $scope.showSendName = function (index) {
            if($scope.word.RESET[index].SEND_ID
                == $scope.data.USER_VS_ID){
                return "我";
            } if($scope.word.RESET[index].SEND_ID
                == $scope.data.DOCTOR_CODE) {
                return "医生";
            } else {
                return $scope.word.RESET[index].SEND_NAME;
            }
        };

        /**
         * 判断接收人显示名称
         */
        $scope.showReceiveName = function (index) {
            if($scope.word.RESET[index].RECEIVE_ID
                == $scope.data.USER_VS_ID){
                return "我";
            } if($scope.word.RESET[index].RECEIVE_ID
                == $scope.data.DOCTOR_CODE) {
                return "医生";
            } else {
                return "医生";
            }
        };

        /**
         * 删除根留言
         */
        $scope.deleteRootWord = function () {
            DoctorMessageBoardService.deleteRootWord($scope.word.WORDS_ID);
            $scope.word = undefined;

            UnreadMessageDetailService.words = $scope.word;
            DoctorMessageBoardService.changeFlag = true;
        };

        /**
         * 删除子留言
         */
        $scope.deleteResetWord = function () {
            DoctorMessageBoardService.deleteResetWord($scope.word.RESET[$scope.index].RESET_ID);
            $scope.word.RESET.splice($scope.index, 1);

            UnreadMessageDetailService.words = $scope.word;
            DoctorMessageBoardService.changeFlag = true;
        };

        /**
         * 发表子留言
         */
        $scope.postResetWord = function (words) {
            var hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            var postdata = {
                HOSPITAL_ID: hospitalId,
                RESET_TEXT: words,
                WORDS_ID: $scope.word.WORDS_ID,
                DOCTOR_CODE: $scope.data.DOCTOR_CODE,
                SEND_ID: $scope.data.USER_VS_ID,
                SEND_NAME: $scope.data.OFTEN_NAME,
                RECEIVE_ID: $scope.receiverId,
                RECEIVE_NAME: $scope.receiverName
            };
            DoctorMessageBoardService.postResetWord(hospitalId, $scope.data.DOCTOR_CODE,
                $scope.word.WORDS_ID, postdata, function (data) {

                    $scope.word.RESET = data[0].RESET;
                    UnreadMessageDetailService.words = $scope.word;
                });

            //输入框隐藏
            $scope.chatFlag = false;
            DoctorMessageBoardService.changeFlag = true;
        };

        /**
         * 发表子留言按钮事件
         */
        $scope.postResetWordBtn = function () {
            if($scope.word.WORDS_FLAG == 0){
                $scope.receiverName = $scope.data.OFTEN_NAME;
                $scope.receiverId = $scope.data.USER_VS_ID;
            } else {
                $scope.receiverName = $scope.data.DOCTOR_NAME;
                $scope.receiverId = $scope.data.DOCTOR_CODE;
            }

            $scope.receiverNameShow = "";
            $scope.chatFlag = true;
        };

        /**
         * 点击子留言操作
         */
        $scope.operateReset = function (index) {
            if ($scope.word.RESET[index].SEND_ID == $scope.data.USER_VS_ID){

                $scope.index = index;
                $scope.receiverName = $scope.word.RESET[$scope.index].SEND_NAME;
                $scope.receiverId = $scope.word.RESET[$scope.index].SEND_ID;
                $scope.showDelete();
                $scope.chatFlag = false;

            } else if($scope.word.WORDS_FLAG == 1
                || $scope.word.USER_VS_ID == $scope.data.USER_VS_ID){

                $scope.index = index;
                $scope.chatFlag = 1;
                $scope.receiverName = $scope.word.RESET[index].SEND_NAME;
                $scope.receiverId = $scope.word.RESET[index].SEND_ID;
                $scope.receiverNameShow = $scope.word.RESET[index].SEND_NAME;
                $scope.chatFlag = true;
            }
        };

        /**
         * 提交回复
         */
        $scope.submitWords = function (words) {
            if(!words || !words.trim()){
                return;
            }

            $scope.postResetWord(words);
            //解决IOS手机上输入完键盘不收起问题
            if (window.cordova && window.cordova.plugins.Keyboard){
                cordova.plugins.Keyboard.close();
            }
        }

        /**
         * 显示操作菜单
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
            return "回复" + $scope.receiverNameShow;
        };

        /**
         * 判断删除按钮是否显示的函数
         */
        $scope.showDeleteBtn = function (index) {
            if($scope.word.WORDS_FLAG == 0
                && $scope.word.USER_VS_ID == $scope.data.USER_VS_ID){
                return true;
            } else {
                return false;
            }
        };

    })
    .build();

