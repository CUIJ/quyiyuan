/**
 * 产品名称：quyiyuan
 * 创建者：licong
 * 创建时间： 2016/7/22
 * 创建原因：病友个人主页控制层
 */

new KyeeModule()
    .group("kyee.quyiyuan.patients_group.personal_home.controller")
    .require([
        "kyee.quyiyuan.patients_group.personal_home.service",
        "kyee.quyiyuan.patients_group.patients_report.controller",
        "kyee.quyiyuan.patients_group.group_details.controller",
        "kyee.quyiyuan.patients_group.conversation.service",
        "kyee.quyiyuan.patients_group.personal_chat.service",
	    "kyee.quyiyuan.patients_group.set_remark.controller",
        "kyee.quyiyuan.patients_group.personal_setting.service",
        "kyee.quyiyuan.patients_group.set_remark.service"
    ])
    .type("controller")
    .name("PersonalHomeController")
    .params(["$scope", "$state", "PersonalHomeService", "GroupDetailsService",
        "ConversationService", "PatientsReportService", "ContractsListService",
        "KyeeListenerRegister", "KyeeMessageService", "KyeeI18nService",
        "GroupListService", "KyeeUtilsService",
        "PersonalChatService", '$ionicHistory',"CacheServiceBus", "SetRemarkService","$ionicScrollDelegate"])
    .action(function($scope, $state, PersonalHomeService, GroupDetailsService,
                     ConversationService, PatientsReportService,
                     ContractsListService, KyeeListenerRegister, KyeeMessageService,
                     KyeeI18nService, GroupListService,
                     KyeeUtilsService,PersonalChatService,$ionicHistory,CacheServiceBus, SetRemarkService,$ionicScrollDelegate){



        KyeeListenerRegister.regist({
            focus: "personal_home",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function () {
                var backView = $ionicHistory.backView();
                var lastView = $ionicHistory.backView().stateId;
                if(lastView == 'conversation'){
                    ConversationService.pullMessageList  = false;
                }else if (lastView == 'personal_chat'){
                    PersonalChatService.pullMessageList = false;
                }
                if("query_friends" == backView.stateId){
                    PersonalHomeService.userInfo.fromGroupId = "";
                }
                $scope.isMyFriend = undefined; //默认为未定义 不显示按钮
                $scope.fromGroupId = PersonalHomeService.userInfo.fromGroupId;
                PersonalHomeService.getUserInfoByUserId(PersonalHomeService.userInfo.userId, function(data) {
                    $scope.isMyFriend = (data.isMyFriend == 1);
                    $scope.user = data;
                    initMyGroupList($scope.user.userId);
                });
            }
        });

        var imgLoadWatcherTimer = undefined;

        // 离开页面时销毁定时器
        KyeeListenerRegister.regist({
            focus: "personal_home",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function(){
                if(imgLoadWatcherTimer != undefined) {
                    KyeeUtilsService.cancelInterval(imgLoadWatcherTimer);
                }
            }
        });

        /**
         * 获取用户所在群组
         * add by licong 2016/7/22
         * modify by wyn 20161121 配合后台修改个人详情查看所在群组接口；
         * edited by zhangyi at 20161124 for KYEEAPPC-8731
         */
        var initMyGroupList = function(userId){
            var groupRecordsLength = 0;
            for(var i=0,j=jsInterface.routerRecords.length;i<j;i++){ // 取得经过的群组的个数
                if(jsInterface.routerRecords[i].toString().substring(0,2)=="gg"){
                    groupRecordsLength++;
                }
            }
            $scope.onePageGroupListArr = [];
            if(groupRecordsLength < 2){ // 如果群组个数达到2个，则在个人详情页面不显示所在群组列表

                GroupListService.getGroupListDataByUserId(userId, function(data){

                    $scope.groupList = data;
                });

            }else{
                $scope.groupList = [];
            }
        };


        /**
         * 跳转至举报界面,勿删勿改,移除时请和作者联系
         * add by wyn 20160726
         */
        $scope.goReport = function(){
            PatientsReportService.reportParams = {
                formGroupId: $scope.fromGroupId,
                reportedUserId: $scope.user.userId  //被举报人ID
            };
            $state.go("patients_report");
        };

        /**
         * 进入聊天界面
         */
        $scope.sendMessage = function(){
            //接收者信息
            /*var userPhoto = $scope.user.userPhoto;
            if(!userPhoto){
                var sex = $scope.user.sex;
                userPhoto = (sex == "2" ? "resource/images/patients_group/user_female.png":"resource/images/patients_group/user_male.png");
            }*/
            var user = $scope.user;
            PersonalChatService.receiverInfo = {
                yxUser: user.yxUser?user.yxUser:null,
                userId: user.yxUser?user.yxUser.substring(4):null,
                userPetname: user.remark || user.userPetname,
                sex: user.sex,
                userPhoto: user.userPhoto,
                remark:user.remark,
                userPetname:user.userPetname
            };
            PersonalChatService.goPersonalChat();
            //$state.go("personal_chat");
        };

        /**
         * 跳转至群组详情界面
         * add by wyn 20160727
         * edited by zhangyi at 20161124 for KYEEAPPC-8731
         */
        $scope.goGroupDetails = function(groupId){
            jsInterface.routerRecords.push(PersonalHomeService.userInfo.userId); //KYEEAPPC-8731 跳转至群详情页面的时候，记录下当前用户ID，以供返回时使用
            GroupDetailsService.groupId = groupId;
            $state.go("group_details");
        };

	    /**
         * 绑定弹出图片层参数传递
         * @param params
         */
        $scope.bind = function (params) {
            var screenSize = KyeeUtilsService.getInnerSize();
            $scope.overlayPicData = {
                width : screenSize.width,
                height: screenSize.height,
                imgWidth: screenSize.width,
                imgHeight: screenSize.height
            };

            $scope.showOverlay = params.show;
            $scope.hideOverlay = params.hide;
            params.regist({
                hideImgShow:$scope.hideImgShow,
                animate: false //隐藏放大图片的是否显示动画 false不显示 true显示
            });
        };

        var img = new Image();

        // 计算放大图片的尺寸
        var initImg = function(){
            var screenSize = KyeeUtilsService.getInnerSize();
            var imgWidth = screenSize.width;
            var imgHeight = (img.height * imgWidth)/img.width;
            imgHeight = Math.round(imgHeight * 100) / 100;
            var top = imgHeight>screenSize.height ? 0 : (screenSize.height-imgHeight)/2;

            $scope.overlayPicData = {
                width : screenSize.width,
                height: screenSize.height,
                imgWidth: imgWidth,
                imgHeight: imgHeight,
                imgTop: top,
                imgUrl: img.src
            };
        };

        /**
         * 图片放大缩小响应事件
         */
        $scope.showBigPic = function(){
            $scope.showBigImg = true;
            if($scope.user.userPhoto) {
                img.src = $scope.user.userPhoto;
            } else {
                img.src = $scope.user.sex == 2 ? "resource/images/patients_group/user_female.png" : "resource/images/patients_group/user_male.png";
            }

            //关闭之前正在运行的定时器
            if(imgLoadWatcherTimer != undefined){
                KyeeUtilsService.cancelInterval(imgLoadWatcherTimer);
            }

            imgLoadWatcherTimer = KyeeUtilsService.interval({
                time: 200,
                action: function(){
                    if(img.width>0) {
                        KyeeUtilsService.cancelInterval(imgLoadWatcherTimer);
                        initImg();
                        $scope.showOverlay();
                    }
                }
            });
        };

        /**
         * 隐藏放大图片
         */
        $scope.hideImgShow = function(){
            $scope.showBigImg = false;
            $scope.hideOverlay();
        };

        //监听物理键返回
        KyeeListenerRegister.regist({
            focus: "personal_home",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.back();
            }
        });
        $scope.updateNickInTeam = function(teamId,account,nickInTeam){
            IMDispatch.updateNickInTeam('219071821','qypa8031632','侯蕊',function (data) {
                alert(data);
            });
        };

        /**
         * 返回个人聊天界面时更新好友信息
         * modifyBy liwenjuan 2016/11/22
         */
        $scope.back = function(){
            if ($scope.showBigImg) {
                // 隐藏放大图片
                $scope.hideImgShow();
            } else {
                var backView = $ionicHistory.backView();
                if(jsInterface.routerRecords.length > 0){ // 返回的时候取得最近经过的群组ID
                    var returnGroupId = jsInterface.routerRecords.pop();
                    GroupDetailsService.groupId = returnGroupId;
                    GroupListService.groupInfo.groupId = returnGroupId;
                }
                if(backView && backView.stateId == "personal_chat" && !$scope.isMyFriend) {
                    $ionicHistory.goBack(-1);
                } else {
                    if(backView && backView.stateId == "personal_chat"){
                        //接收者信息 edited by zhangyi at 20161124 返回的时候更新接收者信息
                        var user = $scope.user;
                        PersonalChatService.receiverInfo = {
                            rlUser: user.rlUser,
                            userId: user.userId,
                            userPetname: user.remark || user.userPetname,  //如有备注 则显示备注 add by dangliming at 20170224
                            sex: user.sex,
                            userPhoto: user.userPhoto
                        };
                        PersonalChatService.updateEndMessageList(function(){
                            $ionicHistory.goBack(-1);
                        });
                    }else if(backView && "conversation" == backView.stateId){ //处理返回群聊天界面更新最后10条聊天记录
                            $ionicHistory.goBack(-1);
                    }else{
                        $ionicHistory.goBack(-1);
                    }
                }
            }
        };

	    /**
         * 设置好友备注
         * add by dangliming 2017/02/22
	     */
	    $scope.goSetRemark = function(){
            SetRemarkService.friendInfo = $scope.user;
		    SetRemarkService.userId = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID;
            $state.go("set_remark");
        };


    })
    .build();