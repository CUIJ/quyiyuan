/**
 * 产品名称：quyiyuan
 * 创建者：wangyaning
 * 创建时间： 2016/11/25
 * 创建原因：病友圈我的医生详情控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.my_doctor_details.controller")
    .require([
        "kyee.quyiyuan.patients_group.my_doctor_details.service",
        "kyee.quyiyuan.patients_group.my_doctor.select_patients.service",
        "kyee.quyiyuan.patients_group.personal_chat.service",
        "kyee.quyiyuan.patients_group.conversation.service",
        "kyee.quyiyuan.patients_group.group_list.service",
        "kyee.quyiyuan.patients_group.group_details.service"
    ])
    .type("controller")
    .name("MyDoctorDetailsController")
    .params([
        "$scope",
        "$state",
        "$ionicHistory",
        "$ionicScrollDelegate",
        "KyeeListenerRegister",
        "CacheServiceBus",
        "KyeeI18nService",
        "KyeeUtilsService",
        "MyDoctorDetailsService",
        "SelectPatientsService",
        "PersonalChatService",
        "KyeeMessageService",
        "GroupDetailsService",
        "GroupListService",
        "ConversationService"
    ])
    .action(function($scope,$state,$ionicHistory,$ionicScrollDelegate,KyeeListenerRegister,CacheServiceBus,KyeeI18nService,KyeeUtilsService,
                     MyDoctorDetailsService,SelectPatientsService,PersonalChatService,KyeeMessageService,
                     GroupDetailsService,GroupListService,ConversationService){
        var imgLoadWatcherTimer = undefined; //定时器变量
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
            if($scope.doctorInfo.doctorPhoto){
                img.src = $scope.doctorInfo.doctorPhoto;
            }else{
                img.src = $scope.doctorInfo.doctorSex == 2 ? "resource/images/patients_group/doctor_female.png" :
                    "resource/images/patients_group/doctor_male.png";
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

        KyeeListenerRegister.regist({
            focus: "my_doctor_details",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function(){
                getDoctorInfo();
            }
        });

        // 离开页面时销毁定时器
        KyeeListenerRegister.regist({
            focus: "my_doctor_details",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function(){
                if(imgLoadWatcherTimer != undefined) {
                    KyeeUtilsService.cancelInterval(imgLoadWatcherTimer);
                }
                $ionicScrollDelegate.$getByHandle("my_doctor_details").scrollTop();
            }
        });
        /**
         * 获取医生信息
         * add by wyn 20161125
         */
        var getDoctorInfo = function(){
            //根据上一个页面判断是否返回是需要加载聊天记录等信息
            var lastView = $ionicHistory.backView().stateId;
            if(lastView == 'conversation'){
                ConversationService.pullMessageList  = false;
            }else if (lastView == 'personal_chat'){
                PersonalChatService.pullMessageList = false;
            }
            MyDoctorDetailsService.getMyDoctorInfo(function(data){
                $scope.doctorInfo = data;
                // 当前页面显示的所在群组个数
                var groupRecordsLength = 0;
                for(var i=0,j=jsInterface.routerRecords.length;i<j;i++){ // 取得经过的群组的个数
                    var item = jsInterface.routerRecords[i];
                    if("string" ==typeof(item) && item.toString().substring(0,2)=="gg"){
                        groupRecordsLength++;
                    }
                }
                if(groupRecordsLength <2){
                    var showGroupNum = (KyeeUtilsService.getInnerSize().width - 98) / 60;
                    if(data.groupList && data.groupList.length > showGroupNum) {
                        $scope.groupList = data.groupList.slice(0,showGroupNum);
                    } else {
                        $scope.groupList = data.groupList;
                    }
                }else{
                    $scope.groupList = [];
                }
            });
        };

        /**
         * 向医生报道 添加医生
         * friendStatus 医患好友的状态,0:没有建立医患关系,4:等待医生确认,5:已经是好友关系
         * addBy liwenjuan 2016/11/29
         */
        $scope.sendReportRequest = function(){
            SelectPatientsService.getBindUserInfo($scope.doctorInfo,function(data){
                if(0 == data.friendStatus){ //0未向医生报道过
                    SelectPatientsService.getCustomsPatients($scope,$scope.doctorInfo,function(){
                        getDoctorInfo();
                    });
                }
            });
        };

        /**
         * 给医生留言
         * addBy liwenjuan 2016/12/16
         */
        $scope.leaveMessage = function(){
            PersonalChatService.receiverInfo = { //接收者医生信息
                //YX  yxUser
                yxUser:$scope.doctorInf.yxUser,
                userRole: $scope.doctorInfo.userRole,
                userPetname: $scope.doctorInfo.doctorName,
                userPhoto: $scope.doctorInfo.doctorPhoto,
                sex: $scope.doctorInfo.doctorSex,
                scUserVsId: $scope.doctorInfo.scUserVsId,
                visitName: $scope.doctorInfo.visitName //就诊者真是姓名
            };
            PersonalChatService.goPersonalChat();
        };

        /**
         * 多次报道提示
         * addBy liwenjuan 2016/12/30
         */
        $scope.waitReportPrompt = function(){
            KyeeMessageService.broadcast({
                content: KyeeI18nService.get("requestPrompt", "医生已收到您的报到请求,请勿重复申请"),
                duration: 2000
            });
        };

        //监听物理键返回
        KyeeListenerRegister.regist({
            focus: "my_doctor_details",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.goBack();
            }
        });

        /**
         * 返回处理
         * addBy liwenjuan 2016/12/30
         */
        $scope.goBack = function(){
            if($scope.showBigImg){ //返回之前隐藏图片
                $scope.hideImgShow();
            }
            var backView = $ionicHistory.backView();
            if(jsInterface.routerRecords.length > 0){ // 返回的时候取得最近经过的群组ID
                var returnGroupId = jsInterface.routerRecords.pop();
                GroupDetailsService.groupId = returnGroupId;
                GroupListService.groupInfo.groupId = returnGroupId;
            }
            if(backView && backView.stateId == "personal_chat"){
                //接收者信息 edited by liwenjuan at 20161230 返回的时候更新接收者信息
                PersonalChatService.receiverInfo = { //接收者医生信息
                    yxUser: $scope.doctorInfo.yxUser,
                    userRole: $scope.doctorInfo.userRole,
                    userPetname: $scope.doctorInfo.doctorName,
                    userPhoto: $scope.doctorInfo.doctorPhoto,
                    sex: $scope.doctorInfo.doctorSex,
                    scUserVsId: $scope.doctorInfo.scUserVsId,
                    visitName: $scope.doctorInfo.visitName //就诊者真是姓名
                };
                $ionicHistory.goBack(-1);
            }else if(backView && "conversation" == backView.stateId){ //处理返回群聊天界面更新最后10条聊天记录
                    $ionicHistory.goBack(-1);
            }else{
                $ionicHistory.goBack(-1);
            }
        };

        /**
         * 进入群详情
         * addBy liwenjuan 2017/1/4
         * @param groupId
         */
        $scope.goGroupDetails = function(groupId){
            jsInterface.routerRecords.push({ //KYEEAPPC-8731 跳转至群详情页面的时候，记录下当前医生信息，以供返回时使用
                "yxUser":$scope.doctorInfo.yxUser,
                "userRole": $scope.doctorInfo.userRole
            });
            GroupDetailsService.groupId = groupId;
            $state.go("group_details");
        };
    })
    .build();
