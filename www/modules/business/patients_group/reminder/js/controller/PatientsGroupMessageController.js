/**
 * 产品名称：quyiyuan
 * 创建者：李聪
 * 创建时间：2016年8月8日
 * 创建原因：病友圈消息中心控制层
 */

new KyeeModule()
    .group("kyee.quyiyuan.patients_group.patients_group_message.controller")
    .require([
        "kyee.quyiyuan.messagecenter.queryCardResult.controller",
        "kyee.quyiyuan.messagecenter.queryCardResult.service",
        "kyee.quyiyuan.messagecenter.show_web_page.controller",
        "kyee.quyiyuan.messagecenter.show_web_page.service",
        "kyee.quyiyuan.messagecenter.show_html.controller",
        "kyee.quyiyuan.messagecenter.show_html.service",
        "kyee.quyiyuan.myRefund.service",
        "kyee.quyiyuan.myWallet.clinicPaid.service",
        "kyee.quyiyuan.home.homeWeb.controller",
        "kyee.quyiyuan.patients_group.medical_orders_reminder.controller",
        "kyee.quyiyuan.patients_group.medical_record_reminder.controller",
        "kyee.quyiyuan.patients_group.report_reminder.controller",
        "kyee.quyiyuan.patients_group.conversation.controller",
        "kyee.quyiyuan.patients_group.conversation.service",
        "kyee.quyiyuan.patients_group.new_friends.controller",
        "kyee.quyiyuan.patients_group.disable_send_message.controller",
        "kyee.quyiyuan.patients_group.reminder.service",
        "kyee.quyiyuan.patients_group.personal_home.controller",
        "kyee.quyiyuan.patients_group.group_details.controller",
        "kyee.quyiyuan.patients_group.personal_chat.service",
        "kyee.quyiyuan.appointment.clound.his.message.controller",
        "kyee.quyiyuan.appointment.clound.his.message.service",
        "kyee.quyiyuan.patients_group.medication_push.controller",
        "kyee.quyiyuan.patients_group.treatment_plan.controller",
        "kyee.quyiyuan.patients_group.treatment_plan.service",
        "kyee.quyiyuan.patients_group.unified_push.controller",
        "kyee.quyiyuan.patients_group.unified_push.service",
        "kyee.quyiyuan.consultation.medicSuggestion.service",
        "kyee.quyiyuan.referral_detail.service",
        "kyee.quyiyuan.referral_detail.controller"
    ])
    .type("controller")
    .name("PatientsGroupMessageController")
    .params(["$rootScope", "$scope", "$state", "KyeeMessageService",
        "QueryCardResultService", "CacheServiceBus",
        "AppointmentRegistDetilService", "$ionicListDelegate", "$ionicScrollDelegate",
        "KyeeUtilsService", "ShowWebPageService", "ShowHtmlService","MyRefundService",
        "KyeeI18nService", "ClinicPaidMessageService","ReminderService","InpatientPaymentService",
        "PatientsGroupMessageService","GroupDetailsService","ConversationService","HomeService",
        "PersonalHomeService","PersonalChatService","KyeeListenerRegister","CloundHisMessageService",
        "IMUtilService", "MedicationPushService","UnifiedPushService","TreatmentPlanService","ClinicPaidService",
        "QuestionnaireSearchService","medicSuggestionService","ReferralDetailService"])
    .action(function ($rootScope, $scope, $state, KyeeMessageService,  QueryCardResultService, CacheServiceBus, AppointmentRegistDetilService,
                      $ionicListDelegate, $ionicScrollDelegate, KyeeUtilsService, ShowWebPageService, ShowHtmlService,
                      MyRefundService,KyeeI18nService,ClinicPaidMessageService,ReminderService,InpatientPaymentService,
                      PatientsGroupMessageService,GroupDetailsService,ConversationService,HomeService,PersonalHomeService,
                      PersonalChatService,KyeeListenerRegister,CloundHisMessageService,IMUtilService, MedicationPushService,UnifiedPushService,TreatmentPlanService,ClinicPaidService,
                      QuestionnaireSearchService,medicSuggestionService,ReferralDetailService) {

        // 初始化按钮选中样式
        $scope.activityClass = 0;
        $scope.setRead={ name :KyeeI18nService.get("messagecenter.setRead","置为已读")};
        $scope.setNoRead={ name :KyeeI18nService.get("messagecenter.setNoRead","置为未读")};

        // 初始化分页加载标记位
        $scope.moreDataCanBeLoadedFlag = true;

        // 初始化原始消息数据
        var originalMessages = [];

        KyeeListenerRegister.regist({
            focus:"patients_group_message",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_ENTER,
            direction: "back",
            action: function(){
                $ionicScrollDelegate.$getByHandle("message_list").scrollTop();
            }
        });

        /**
         * 判空显示函数
         * @param data
         * @param text
         */
        $scope.changeEmptyText = function (data, text) {

            if (!text) {
                text = KyeeI18nService.get("messagecenter.noMessage","暂无消息");
            }

            if (!data || data.length == 0) {
                $scope.showEmpty = true;
                $scope.emptyText = text;
            } else {
                $scope.showEmpty = false;
            }
        };

        /**
         * 格式化消息的标题样式和消息的时间
         */
        var formatOriginalMessage = function () {
            for (var index = 0; index < originalMessages.length; index++) {
                // 格式化标题样式
                if (originalMessages[index].URL_FLAG == 1 && originalMessages[index].MESSAGE_SOURCE == 1) {
                    //前端国际化消息中心模块改造  by  杜巍巍  KYEEAPPC-3809
                    if (originalMessages[index].MESSAGE_TYPE == 1) {
                        originalMessages[index].ULR_TEXT = KyeeI18nService.get("messagecenter.appointmentDetail","预约挂号详情");
                    } else if (originalMessages[index].MESSAGE_TYPE == 4) {
                        //返现类消息统一修改为优惠活动返现详情  KYEEAPPC-5065
                        originalMessages[index].ULR_TEXT = KyeeI18nService.get("messagecenter.freeRegistDetail","优惠活动返现详情");
                    } else if (originalMessages[index].MESSAGE_TYPE == 5) {
                        originalMessages[index].ULR_TEXT = KyeeI18nService.get("messagecenter.queryCardDetail","查卡结果详情");
                    } else if (originalMessages[index].MESSAGE_TYPE == 6) {
                        originalMessages[index].ULR_TEXT = KyeeI18nService.get("messagecenter.payRemindDetail","充值提醒详情");
                    } else if (originalMessages[index].MESSAGE_TYPE == 7) {
                        originalMessages[index].ULR_TEXT = KyeeI18nService.get("messagecenter.checkDetail","查看详情");
                    } else if (originalMessages[index].MESSAGE_TYPE == 8) {
                        originalMessages[index].ULR_TEXT = KyeeI18nService.get("messagecenter.refundHistory", "退款历史");
                    } else if (originalMessages[index].MESSAGE_TYPE == 9) {
                        originalMessages[index].ULR_TEXT = KyeeI18nService.get("messagecenter.paymentDetail","缴费详情");
                    } else if (originalMessages[index].MESSAGE_TYPE == 20) {
                        originalMessages[index].ULR_TEXT = KyeeI18nService.get("messagecenter.couponsRecord","优惠券详情");
                    } else if (originalMessages[index].MESSAGE_TYPE == 50){
                        //用药提醒的MESSAGE_TYPE == 50  需要显示'查看详情'
                        originalMessages[index].ULR_TEXT = KyeeI18nService.get("messagecenter.checkDetail","查看详情");
                    }else if (originalMessages[index].MESSAGE_TYPE == 53){
                        //会诊记录MESSAGE_TYPE == 53 需要显示'会诊记录'
                        originalMessages[index].ULR_TEXT = "会诊记录";
                    }else if (originalMessages[index].MESSAGE_TYPE == 55){//大通道-用药提醒
                        originalMessages[index].ULR_TEXT = KyeeI18nService.get("messagecenter.checkDetail","查看详情");
                    }else if (originalMessages[index].MESSAGE_TYPE == 56){//大通道-随访提醒
                        originalMessages[index].ULR_TEXT = KyeeI18nService.get("messagecenter.checkDetail","查看详情");
                    }else if (originalMessages[index].MESSAGE_TYPE == 57){//大通道-治疗计划和复诊提醒
                        originalMessages[index].ULR_TEXT = KyeeI18nService.get("messagecenter.checkDetail","查看详情");
                    }else if(originalMessages[index].MESSAGE_TYPE == 66){
                        originalMessages[index].ULR_TEXT = KyeeI18nService.get("messagecenter.checkDetail","查看详情");
                    } else {
                        originalMessages[index].ULR_TEXT = KyeeI18nService.get("messagecenter.checkDetail","查看详情");
                    }
                }
                // 病友圈消息
                if (originalMessages[index].URL_FLAG == 1 && originalMessages[index].MESSAGE_SOURCE == 2) {
                    if (originalMessages[index].MESSAGE_TYPE == 1) {
                        originalMessages[index].ULR_TEXT = KyeeI18nService.get("patientsGroupMessage.checkDetail","查看详情");
                    } else if (originalMessages[index].MESSAGE_TYPE == 2) {
                        originalMessages[index].ULR_TEXT = KyeeI18nService.get("patientsGroupMessage.goToGroup","进入该群");
                    } else if (originalMessages[index].MESSAGE_TYPE == 3) {
                        originalMessages[index].ULR_TEXT = KyeeI18nService.get("patientsGroupMessage.quickTo","快速前往");
                    } else if (originalMessages[index].MESSAGE_TYPE == 4) {
                        originalMessages[index].ULR_TEXT = KyeeI18nService.get("patientsGroupMessage.quickTo","快速前往");
                    } else if (originalMessages[index].MESSAGE_TYPE == 5) {
                        originalMessages[index].ULR_TEXT = KyeeI18nService.get("patientsGroupMessage.checkDetail","查看详情");
                    }else if (originalMessages[index].MESSAGE_TYPE == 8) {
                        originalMessages[index].ULR_TEXT = KyeeI18nService.get("patientsGroupMessage.checkDetail","查看详情");
                    }
                }

                // 为提醒消息添加发送时间PUSH_DATE
                originalMessages[index].PUSH_DATE = KyeeUtilsService.DateUtils.formatFromString(originalMessages[index].CREATE_DATE, "YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD HH:mm");

                // 格式化标题时间
                originalMessages[index].CREATE_DATE = KyeeUtilsService.DateUtils.formatFromString(
                    originalMessages[index].CREATE_DATE, 'YYYY-MM-DD', 'YYYY/MM/DD');
            }
        };

        var initView = function(){
            var userVsId = null;
            var memoryCache = CacheServiceBus.getMemoryCache();
            var currentCustomPatient = memoryCache.get('currentCustomPatient');
            if (currentCustomPatient && currentCustomPatient.USER_VS_ID){
                userVsId = currentCustomPatient.USER_VS_ID;
            }
            var userId = memoryCache.get('currentUserRecord').USER_ID;

            // 初始化页面数据
            $scope.messages = [];
            // 保存原始数据
            originalMessages = PatientsGroupMessageService.queryLocalMessage(userVsId, userId);

            // 判断是否可以继续加载
            if (!originalMessages || originalMessages.length == 0) {
                $scope.moreDataCanBeLoadedFlag = false;
            } else {
                formatOriginalMessage();
                $scope.moreDataCanBeLoadedFlag = true;
            }

            $scope.loadNextPage();

            // 判空显示
            $scope.changeEmptyText($scope.messages);
        };

        /**
         * 消息查询函数
         *
         * showLoadingFlag：是否显示加载动画
         */
        $scope.doRefresh = function (showLoadingFlag) {
            // 查询app云和病友圈的消息
            PatientsGroupMessageService.queryMessages(showLoadingFlag, function (data) {

                // 初始化页面数据
                $scope.messages = [];
                // 保存原始数据
                originalMessages = data;

                // 判断是否可以继续加载
                if (!originalMessages || originalMessages.length == 0) {
                    $scope.moreDataCanBeLoadedFlag = false;
                } else {
                    formatOriginalMessage();
                    $scope.moreDataCanBeLoadedFlag = true;
                }

                $scope.loadNextPage();

                // 判空显示
                $scope.changeEmptyText($scope.messages);
            });

            $scope.$broadcast('scroll.refreshComplete');
        };

        /**
         * 修改消息已读未读状态函数
         * @param index
         */
        $scope.changeStatus = function (index) {
            if ($scope.messages[index].READ_FLAG == 1) {

                $scope.messages[index].READ_FLAG = 0;
                originalMessages[index] = $scope.messages[index];
                //设置全局未读消息个数
                $rootScope.unreadMessageCount = ++$rootScope.unreadMessageCount;
               
            } else {

                $scope.messages[index].READ_FLAG = 1;
                originalMessages[index] = $scope.messages[index];
                //设置全局未读消息个数
                $rootScope.unreadMessageCount = --$rootScope.unreadMessageCount;
           
            }

            if(($scope.messages[index].MESSAGE_SOURCE == 2 && $scope.messages[index].MESSAGE_TYPE == 1) ||
                ($scope.messages[index].MESSAGE_SOURCE == 1 && $scope.messages[index].MESSAGE_TYPE == 14)) {
                // 欢迎消息
                PatientsGroupMessageService.updateWelcomeMessageStatus($scope.messages[index].MESSAGE_SOURCE,
                    $scope.messages[index].MESSAGE_ID, $scope.messages[index].READ_FLAG);
            } else {
                PatientsGroupMessageService.updateStatus($scope.messages[index].MESSAGE_SOURCE,
                    $scope.messages[index].MESSAGE_ID, $scope.messages[index].READ_FLAG);
            }

            $ionicListDelegate.closeOptionButtons();
            // $scope.changeEmptyText($scope.messages);// 判空显示  By  张家豪  APPCOMMERCIALBUG-1090
        };

        /**
         * 删除消息函数
         * @param index
         */
        $scope.delete = function (index) {
            //消息中心消息左划删除提醒框请去除 BY yangmingsi APPREQUIREMENT-1027
            //设置全局未读消息个数
            if ($scope.messages[index].READ_FLAG == 0) {
                $rootScope.unreadMessageCount = --$rootScope.unreadMessageCount;
               
            }

            if(($scope.messages[index].MESSAGE_SOURCE == 2 && $scope.messages[index].MESSAGE_TYPE == 1) ||
                ($scope.messages[index].MESSAGE_SOURCE == 1 && $scope.messages[index].MESSAGE_TYPE == 14)) {
                // 欢迎消息
                PatientsGroupMessageService.deleteMessage($scope.messages[index].MESSAGE_SOURCE, $scope.messages[index].MESSAGE_ID, 2);
            } else {
                PatientsGroupMessageService.deleteMessage($scope.messages[index].MESSAGE_SOURCE, $scope.messages[index].MESSAGE_ID, $scope.messages[index].READ_FLAG);
            }

            $scope.messages.splice(index, 1);
            originalMessages.splice(index, 1);

            $scope.changeEmptyText($scope.messages);
        };

        /**
         * 单击消息事件
         * @param index
         */
            $scope.messageClick = function (index) {
            var data = $scope.messages[index];
            var readFlag = data.READ_FLAG; //判断首次推荐
            var obj = {};
            if (data.MESSAGE_PARAMETER != undefined && data.MESSAGE_PARAMETER != '') {
                obj = JSON.parse(data.MESSAGE_PARAMETER);
            }
            // 将数据置为已读
            if (data.READ_FLAG == 0) {
                if((data.MESSAGE_SOURCE == 2 && data.MESSAGE_TYPE == 1) ||
                    (data.MESSAGE_SOURCE == 1 && data.MESSAGE_TYPE == 14)){
                    // 欢迎消息
                    PatientsGroupMessageService.updateWelcomeMessageStatus(data.MESSAGE_SOURCE,
                        data.MESSAGE_ID, 1);
                } else {
                    PatientsGroupMessageService.updateStatus(data.MESSAGE_SOURCE, data.MESSAGE_ID, 1);
                }

                $scope.messages[index].READ_FLAG = 1;
                originalMessages[index] = $scope.messages[index];
                //设置全局未读消息个数
                $rootScope.unreadMessageCount = --$rootScope.unreadMessageCount;
           
            }

            // 判断是否需要跳转
            if (data.URL_FLAG != '1') {
                return;
            }

            // 装换跳转数据
            var urlData;
            if (obj.URL_DATA) {
                urlData = JSON.parse(obj.URL_DATA);
            } else {
                urlData = {};
            }
            //获取URL参数 by xike
            var urlParameter;
            if (data.URL_PARAMETER != undefined && data.URL_PARAMETER != '') {
                urlParameter = JSON.parse(data.URL_PARAMETER);
            }
            var router = data.URL_NEW;
            //根据后台取相应的路由  By  章剑飞  KYEEAPPC-2965
            if (router == undefined || router == '') {
                router = obj.URL;
            }

            // 执行跳转页面
            if (router == "query_card_result") {
                //跳转查卡界面
                QueryCardResultService.data = urlData;
                $state.go("query_card_result");

            } else if (router == "appoint_regist_detail") {

                //跳转预约挂号详情界面
                var RECORD = {};
                RECORD.HOSPITAL_ID = urlData.HOSPITAL_ID;
                RECORD.REG_ID = urlData.REG_ID;
                AppointmentRegistDetilService.RECORD = RECORD;
                $state.go("appointment_regist_detil");

            } else if (router == "rebate") {
                //跳转我的零钱界面
                $state.go("apply_cash");
            }
            //退款消息 update 程铄闵 KYEEAPPC-3738
            else if (router == "refund_history") {
                MyRefundService.messageHospital = data.HOSPITAL_ID;
                //跳转我的退费界面
                $state.go("refund_history");
            }
            //缴费成功消息 by 程铄闵 KYEEAPPC-3868
            else if (router == "paid_record") {
                ClinicPaidService.fromClinicPaid = true;
                //ClinicPaidService.HOSPITAL_ID = data.HOSPITAL_ID;
                //ClinicPaidService.ORDER_NO = urlParameter.ORDER_NO;
                ////跳转我的退费界面
                //$state.go("paid_record");
                //详情增加多笔记录 程铄闵 KYEEAPPC-7609
                var params = {
                    PLACE:'1',
                    ORDER_NO:urlParameter.ORDER_NO,
                    HOSPITAL_ID:data.HOSPITAL_ID
                };
                ClinicPaidMessageService.getPaidList($state,params);
            }
            // 检查检验单提醒
            else if (router == "report") {
                ReminderService.reportData = urlData;
                ReminderService.reportData.PUSH_DATE = data.PUSH_DATE;
                $state.go("report_reminder");
            }
            // 医嘱提醒
            else if (router == "doctor") {
                ReminderService.doctorOrdersData = urlData;
                ReminderService.doctorOrdersData.PUSH_DATE = data.PUSH_DATE;
                $state.go("medical_orders_reminder");
            }
            // 病历提醒
            else if (router == "case") {
                ReminderService.medicalRecordData = urlData;
                ReminderService.medicalRecordData.PUSH_DATE = data.PUSH_DATE;
                $state.go("medical_record_reminder");
            }
            //住院每日清单消息 by 程铄闵 KYEEAPPC-6819
            else if (router == "inpatient_payment_record") {
                InpatientPaymentService.messageCenterParams = urlData;
                $state.go("myquyi_inpatient_payment");
            }
            // 趣医院欢迎消息
            else if (router == "home_web") {
                HomeService.ADV_DATA = {
                    ADV_LOCAL: urlData.ADV_LOCAL,
                    ADV_NAME: urlData.ADV_NAME
                };
                $state.go("homeWeb");
            }
            // 病友群欢迎消息
            else if (router == "welcome_to_group") {
                HomeService.ADV_DATA = {
                    ADV_LOCAL: "modules/business/patients_group/reminder/views/patients_group_banner.html",
                    ADV_NAME: "入群须知"
                };

                $state.go("homeWeb");
            }
            // 加群消息
            else if (router == "group_chat") {
                PersonalHomeService.isInGroup(urlData.groupId, function(data){
                    if(data.isInGroup) {
                        ConversationService.goConversation(data.groupProterties,$scope);
                    } else {
                        GroupDetailsService.groupId = urlData.groupId;
                        $state.go("group_details");
                    }
                });
            }
            // 请求添加好友
            else if (router == "new_friends") {
                $state.go("new_friends");
            }
            // 添加好友成功
            else if (router == "conversation") {
                if(2 == urlData.userRole){ //医生消息进入聊天界面
                    var rlUser = IMUtilService.getCrossApplicationId(urlData.rlUser);//处理跨应用通讯 addBy liwenjuan 2016/12/15
                    PersonalChatService.receiverInfo = { //接收者医生信息
                        rlUser: rlUser,
                        userRole: urlData.userRole,
                        userPetname: urlData.doctorName,
                        userPhoto: urlData.doctorPhoto,
                        sex: urlData.doctorSex,
                        scUserVsId: urlData.scUserVsId,
                        visitName: urlData.visitName //就诊者真是姓名
                    };
                    PersonalChatService.goPersonalChat();
                }else{
                    PersonalHomeService.getUserInfoByUserId(urlData.userId, function(data){
                        if(data.isMyFriend == 1) {
                            //接收者信息
                            PersonalChatService.receiverInfo = {
                                rlUser: data.rlUser,
                                userId: data.userId,
                                userPetname: data.userPetname,
                                sex: data.sex,
                                userPhoto: data.userPhoto
                            };
                            PersonalChatService.goPersonalChat();
                        } else if(data.isMyFriend == 0) {
                            PersonalHomeService.userInfo = {
                                userId: data.userId,
                                fromGroupId: ""
                            };
                            $state.go("personal_home");
                        }
                    });
                }

            }
            // 禁言
            else if (router == "disable_send_message") {
               PatientsGroupMessageService.disableSendMsgParams = urlData;
                $state.go("disable_send_message");
            }
            //优惠券详情 by 高萌 KYEEAPPC-6908
            else if (router == "couponsRecord") {
                /* InpatientPaymentService.messageCenterParams = urlData;*/
                $state.go("couponsRecord");
            }
            //wangwan KYEEAPPC-8314 预缴金不足消息提示
            else if (router == "clound_his_message") {
                CloundHisMessageService.MESSAGE =urlData;
                $state.go("clound_his_message");
            }
            else if (router == "url") {
                //显示指定url网页  By  章剑飞  KYEEAPPC-2965
                ShowWebPageService.url = data.URL;
                ShowWebPageService.title = data.MESSAGE_TITLE;
                if (data.URL_PARAMETER != undefined && data.URL_PARAMETER != '') {
                    ShowWebPageService.buttoText = urlParameter.BUTTON_TEXT;
                    ShowWebPageService.jumpRouter = urlParameter.JUMP_ROUTER;
                }
                $state.go('show_web_page');

            } else if (router == "html") {
                if (data.URL_PARAMETER != undefined && data.URL_PARAMETER != '') {
                    ShowHtmlService.buttoText = urlParameter.BUTTON_TEXT;
                    ShowHtmlService.jumpRouter = urlParameter.JUMP_ROUTER;
                }
                //获取html代码
                PatientsGroupMessageService.getHtml(data.MESSAGE_ID, function (message) {
                    //显示后端传的html代码  By  章剑飞  KYEEAPPC-2965
                    ShowHtmlService.messageHtml = message;
                    ShowHtmlService.title = data.MESSAGE_TITLE;
                    $state.go('show_html');
                });
            } else if (router == "medication_push"){        //跳转至药品推送详情页
	            MedicationPushService.medicationData = urlData;
	            $state.go(router);
            }
            else if (router == "unified_push"){        //跳转至药品推送详情页
                UnifiedPushService.msgData = urlData;
                $state.go(router);
            }
            else if (router == "treatment_plan_push"){
                TreatmentPlanService.treatmentPlan = urlData;
                $state.go(router);
            }else if(router == "consulationnote"){
                $state.go("consulationnote");
            }else if(router == "questionnaire_search"){
                QuestionnaireSearchService.URL = urlData.url;
                QuestionnaireSearchService.hcrmMsgType = urlData.hcrmMsgType;
                $state.go("questionnaire_search");
            }else if(router == "medicSuggestion"){
                medicSuggestionService.consultOrderID = urlData.scConsultId;
                $state.go("medicSuggestion");
            }else if(router == "referral_detail"){
                ReferralDetailService.referralData = urlData;
                $state.go("referral_detail");
            }
            $scope.changeEmptyText($scope.messages);// 判空显示  By  张家豪  APPCOMMERCIALBUG-1090
        };

        /**
         * 上拉加载更多数据函数
         */
        $scope.loadNextPage = function () {

            if (originalMessages && originalMessages.length > 0) {

                if (!$scope.messages) {
                    $scope.messages = [];
                }

                // 分页加载数据
                if ($scope.messages.length < originalMessages.length) {
                    var startIndex = $scope.messages.length;
                    var endIndex = $scope.messages.length + 8;
                    $scope.messages = $scope.messages.concat(originalMessages.slice(startIndex, endIndex));
                } else {
                    $scope.moreDataCanBeLoadedFlag = false;
                }

            }

            // 发送刷新完成广播
            $scope.$broadcast('scroll.infiniteScrollComplete');
        };

        // 初始化查询数据
        initView();

    })
    .build();