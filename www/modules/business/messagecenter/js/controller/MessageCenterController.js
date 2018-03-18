/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月5日11:06:54
 * 创建原因：消息中心主页面控制器
 *
 * 修改人：姚斌
 * 修改时间：2015年7月14日19:52:59
 * 任务号：KYEEAPPTEST-2354
 * 修改原因：消息本地缓存
 *
 * 修改人：姚斌
 * 修改时间：2015年7月22日09:27:26
 * 任务号：KYEEAPPTEST-2761
 * 修改原因：添加前台分页功能优化性能
 *
 * 修改人：杜巍巍
 * 修改时间：2015年11月15日08:10:26
 * 任务号：KYEEAPPC-3809
 * 修改原因：前端国际化消息中心模块改造
 */
new KyeeModule()
    .group("kyee.quyiyuan.messagecenter.messageCenter.controller")
    .require([
        "kyee.quyiyuan.messagecenter.messageCenter.service"
        , "kyee.quyiyuan.messagecenter.queryCardResult.controller"
        , "kyee.quyiyuan.messagecenter.queryCardResult.service"
        , "kyee.quyiyuan.messagecenter.show_web_page.controller"
        , "kyee.quyiyuan.messagecenter.show_web_page.service"
        , "kyee.quyiyuan.messagecenter.show_html.controller"
        , "kyee.quyiyuan.messagecenter.show_html.service",
        "kyee.quyiyuan.myRefund.service",
        "kyee.quyiyuan.myWallet.clinicPaid.service",
        "kyee.quyiyuan.patients_group.medical_orders_reminder.controller",
        "kyee.quyiyuan.patients_group.medical_record_reminder.controller",
        "kyee.quyiyuan.patients_group.report_reminder.controller",
        "kyee.quyiyuan.patients_group.reminder.service",
        "kyee.quyiyuan.appointment.clound.his.message.controller",
        "kyee.quyiyuan.appointment.clound.his.message.service",
	    "kyee.quyiyuan.patients_group.medication_push.controller",
	    "kyee.quyiyuan.patients_group.medication_push.service",
        "kyee.quyiyuan.patients_group.treatment_plan.controller",
        "kyee.quyiyuan.patients_group.treatment_plan.service",
        "kyee.quyiyuan.patients_group.unified_push.controller",
        "kyee.quyiyuan.patients_group.unified_push.service"
    ])
    .type("controller")
    .name("MessageCenterController")
    .params(["$rootScope", "$scope", "$state", "KyeeMessageService",
        "MessageCenterService", "QueryCardResultService", "CacheServiceBus",
        "AppointmentRegistDetilService", "$ionicListDelegate", "$ionicScrollDelegate",
        "KyeeUtilsService", "ShowWebPageService", "ShowHtmlService","MyRefundService", "KyeeI18nService",
        "ClinicPaidMessageService","ReminderService","InpatientPaymentService","HomeService",
        "CloundHisMessageService", "MedicationPushService","UnifiedPushService","TreatmentPlanService",
        "QuestionnaireSearchService"])
    .action(function ($rootScope, $scope, $state, KyeeMessageService, MessageCenterService, QueryCardResultService,
                      CacheServiceBus, AppointmentRegistDetilService, $ionicListDelegate, $ionicScrollDelegate,
                      KyeeUtilsService, ShowWebPageService, ShowHtmlService,MyRefundService,
                      KyeeI18nService,ClinicPaidMessageService,ReminderService,InpatientPaymentService,
                      HomeService,CloundHisMessageService, MedicationPushService, UnifiedPushService,TreatmentPlanService,
                      QuestionnaireSearchService) {

        // 初始化按钮选中样式
        $scope.activityClass = 0;
        $scope.setRead={ name :KyeeI18nService.get("messagecenter.setRead","置为已读")};
        $scope.setNoRead={ name :KyeeI18nService.get("messagecenter.setNoRead","置为未读")};
        // 初始化搜索框内容
        $scope.searchInfo = {};
        $scope.searchInfo.searchText = "";

        // 初始化消息读取状态
        $scope.readFlag = 0;

        // 初始化分页加载标记位
        $scope.moreDataCanBeLoadedFlag = true;

        // 初始化原始消息数据
        var originalMessages = [];

        /**
         * 判空显示函数
         * @param data
         * @param text
         */
        $scope.changeEmptyText = function (data, text) {

            if (!text) {
                //前端国际化消息中心模块改造  by  杜巍巍  KYEEAPPC-3809
                if ($scope.readFlag == 0) {
                    text = KyeeI18nService.get("messagecenter.noUnreadMessage","暂无未读消息")
                } else if ($scope.readFlag == 1) {
                    text = KyeeI18nService.get("messagecenter.noReadMessage","暂无已读消息")
                }
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
                if (originalMessages[index].URL_FLAG == 1) {
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
                    }else if (originalMessages[index].MESSAGE_TYPE == 9) {
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
                    }else {
                        originalMessages[index].ULR_TEXT = KyeeI18nService.get("messagecenter.checkDetail","查看详情");
                    }
                }

                // 为提醒消息添加发送时间PUSH_DATE
                originalMessages[index].PUSH_DATE = KyeeUtilsService.DateUtils.formatFromString(originalMessages[index].CREATE_DATE, "YYYY-MM-DD HH:mm:ss", "YYYY-MM-DD HH:mm");

                // 格式化标题时间
                originalMessages[index].CREATE_DATE = KyeeUtilsService.DateUtils.formatFromString(
                    originalMessages[index].CREATE_DATE, 'YYYY-MM-DD', 'YYYY/MM/DD');
            }
        };

        /**
         * 消息查询函数
         *
         * showLoadingFlag：是否显示加载动画
         */
        $scope.doRefresh = function (showLoadingFlag) {

            MessageCenterService.queryMessages(showLoadingFlag, $scope.readFlag, function (data) {

                // 初始化页面数据
                $scope.messages = [];
                originalMessages = [];

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

                if ($scope.readFlag == 0) {
                    //设置全局未读消息个数
                    $rootScope.unreadMessageCount = originalMessages.length;
                
                }
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

            MessageCenterService.updateStatus($scope.messages[index].MESSAGE_ID
                , $scope.messages[index].READ_FLAG);

            $scope.messages.splice(index, 1);// 移除这条消息  By  张家豪  APPCOMMERCIALBUG-1090
            originalMessages.splice(index, 1);// 移除这条消息  By  张家豪  APPCOMMERCIALBUG-1090

            $ionicListDelegate.closeOptionButtons();
            $scope.changeEmptyText($scope.messages);// 判空显示  By  张家豪  APPCOMMERCIALBUG-1090
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

            MessageCenterService.deleteMessage($scope.messages[index].MESSAGE_ID, $scope.messages[index].READ_FLAG);
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
            var obj = {};
            if (data.MESSAGE_PARAMETER != undefined && data.MESSAGE_PARAMETER != '') {
                obj = JSON.parse(data.MESSAGE_PARAMETER);
            }
            // 将数据置为已读
            if (data.READ_FLAG == 0) {
                MessageCenterService.updateStatus(data.MESSAGE_ID, 1);
                $scope.messages[index].READ_FLAG = 1;
                originalMessages[index] = $scope.messages[index];
                //设置全局未读消息个数
                $rootScope.unreadMessageCount = --$rootScope.unreadMessageCount;
             
                $scope.messages.splice(index, 1);// 移除这条消息  By  张家豪  APPCOMMERCIALBUG-1090
                originalMessages.splice(index, 1);// 移除这条消息  By  张家豪  APPCOMMERCIALBUG-1090
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
                var hospitalId = data.HOSPITAL_ID;
                MyRefundService.messageHospital = hospitalId;
                //跳转我的退费界面
                $state.go("refund_history");
            }
            //缴费成功消息 by 程铄闵 KYEEAPPC-3868
            else if (router == "paid_record") {
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
                MessageCenterService.getHtml(data.MESSAGE_ID, function (message) {
                    //显示后端传的html代码  By  章剑飞  KYEEAPPC-2965
                    ShowHtmlService.messageHtml = message;
                    ShowHtmlService.title = data.MESSAGE_TITLE;
                    $state.go('show_html');
                });
            }else if(router == "unified_push") {
                UnifiedPushService.msgData = urlData;
                $state.go(router);
            }
            else if (router == "medication_push"){        //跳转至药品推送详情页
	            MedicationPushService.medicationData = urlData;
	            $state.go(router);
            }else if (router == "treatment_plan_push") {
                TreatmentPlanService.treatmentPlan = urlData;
                $state.go(router);
            }else if(router == "consulationnote"){
                $state.go("consulationnote");
            }else if(router == "questionnaire_search"){
                QuestionnaireSearchService.URL = urlData.url;
                QuestionnaireSearchService.hcrmMsgType = urlData.hcrmMsgType;
                $state.go("questionnaire_search");
            }
            $scope.changeEmptyText($scope.messages);// 判空显示  By  张家豪  APPCOMMERCIALBUG-1090
        };

        /**
         * 筛选已读未读事件
         * @param status
         */
        $scope.selectStatus = function (status) {
            $scope.activityClass = status;
            $scope.readFlag = status;

            // 清空搜索框数据
            $scope.searchInfo.searchText = "";

            $scope.doRefresh(true);
            $ionicScrollDelegate.scrollTop();
        };

        /**
         * 搜索框输入响应事件
         */
        $scope.searchContent = function () {
            $scope.messages = [];
            var messages = [];
            var searchKey = $scope.searchInfo.searchText.trim();
            if (searchKey.length != 0 && originalMessages) {
                for (var index = 0; index < originalMessages.length; index++) {
                    var item = originalMessages[index];
                    var messageTitle = item["MESSAGE_TITLE"];
                    var messageDescription = item["MESSAGE_DESCRIPTION"];
                    if (messageTitle.indexOf(searchKey) != -1 || messageDescription.indexOf(searchKey) != -1) {
                        messages.push(item);
                    }
                }
                $scope.messages = messages;
                //前端国际化消息中心模块改造  by  杜巍巍  KYEEAPPC-3809
                $scope.changeEmptyText($scope.messages, KyeeI18nService.get("messagecenter.noFindContent","没有找到相关内容"));
                $scope.moreDataCanBeLoadedFlag = false;// 分页功能关闭  By  张家豪  APPCOMMERCIALBUG-1090
            } else {
                $scope.messages = [];
                $scope.loadNextPage();
                $scope.changeEmptyText($scope.messages);
                $ionicScrollDelegate.scrollTop();
                $scope.moreDataCanBeLoadedFlag = true;// 分页功能开启  By  张家豪  APPCOMMERCIALBUG-1090
            }
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
        $scope.doRefresh(true);

    })
    .build();