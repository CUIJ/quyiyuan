/**
 * Created by lwj on 2016/7/27.
 */
new KyeeModule().group('kyee.quyiyuan.patients_group.personal_chat.controller').require([
    'kyee.quyiyuan.patients_group.personal_chat.service',
    'kyee.quyiyuan.imUtil.service',
    'kyee.framework.service.message',
    'kyee.quyiyuan.emoji.service',
    'kyee.framework.service.broadcast3',
    'kyee.quyiyuan.patients_group.personal_home.service',
    'kyee.framework.device.deviceinfo',
    'kyee.framework.device.camera',
    'kyee.quyiyuan.login.service',
    'kyee.quyiyuan.patients_group.patients_group_web.service',
    'kyee.quyiyuan.patients_group.my_doctor_details.service',
    'kyee.quyiyuan.patients_group.questionnaire_survey.controller',
    'kyee.quyiyuan.appointment.purchase_medince.service',
    'kyee.quyiyuan.appointment.purchase_medincine.controller',
    'kyee.quyiyuan.consultation.consult_patient_disease_info.controller',
    //聊天对象是医生 诊后咨询 再次咨询 跳转至医生主页所需
    // "kyee.quyiyuan.appointment.doctor_info.controller",
    // "kyee.quyiyuan.appointment.doctor_detail.service",
    //聊天对象是医生 诊后咨询 返回 跳转至订单详情页和等待接诊页面所需
    'kyee.quyiyuan.consultation.wait_chatting.controller',
    'kyee.quyiyuan.consultation.consult_order_detail.controller',
    'kyee.quyiyuan.consultation.consult_order_detail.service',
]).type('controller').name('PersonalChatController').params([
    '$http',
    '$scope',
    '$state',
    '$sce',
    '$timeout',
    '$filter',
    '$ionicScrollDelegate',
    '$ionicHistory',
    'EmojiService',
    'KyeeListenerRegister',
    'KyeeMessageService',
    'KyeeBroadcastService',
    'KyeeViewService',
    'CacheServiceBus',
    'PersonalChatService',
    'PersonalHomeService',
    'KyeeCameraService',
    'KyeeDeviceInfoService',
    'KyeeI18nService',
    'KyeeEnv',
    'KyeeUtilsService',
    'LoginService',
    '$ionicSlideBoxDelegate',
    'patientsGroupWebService',
    '$ionicViewSwitcher',
    'MyDoctorDetailsService',
    'QuestionnaireSurveyService',
    'PurchaseMedinceService',
    'AppointmentDoctorDetailService',
    'ConsultOrderDetailService',
    'IMUtilService',
    'MessageService',
]).action(function ($http, $scope, $state, $sce, $timeout, $filter, $ionicScrollDelegate, $ionicHistory, EmojiService, KyeeListenerRegister, KyeeMessageService,
    KyeeBroadcastService, KyeeViewService, CacheServiceBus, PersonalChatService,
    PersonalHomeService, KyeeCameraService, KyeeDeviceInfoService, KyeeI18nService,
    KyeeEnv, KyeeUtilsService, LoginService,
    $ionicSlideBoxDelegate, patientsGroupWebService, $ionicViewSwitcher, MyDoctorDetailsService, QuestionnaireSurveyService,
    PurchaseMedinceService, AppointmentDoctorDetailService, ConsultOrderDetailService, IMUtilService, MessageService) {
    //变量的初始化
    $scope.isWeb = false;
    var lastReadMsg = '';
    var typeFlag = 0;
    $scope.revokeIndex = 0;
    $scope.receiver == '';
    $scope.me == '';
    var receipts = {};
    $scope.firstRecord = true;
    $scope.bigImageMessage = {};
    var imgLoadWatcherTimer, keyboardLoadWatcherTimer;
    var isLegalWebApp = jsInterface.isPatientGroupLegalWebApp();
    //从后台获取的数据暂置为空
    $scope.receiverInfo = PersonalChatService.receiverInfo;
    $scope.receiver = $scope.receiverInfo.yxUser;
    //测试数据
    if (PersonalChatService.me != '') {
        $scope.me = PersonalChatService.me;
    }
    if (PersonalChatService.receiver != '') {
        $scope.receiver = PersonalChatService.receiver;
    }
    //解决ios键盘弹出时页面内容（包含header）被挤到上面的问题
    if (window.cordova && window.cordova.plugins.Keyboard) {
        var isIOS = window.ionic.Platform.isIOS();
        $scope.isIos = isIOS;
        if (isIOS) {
            window.cordova.plugins.Keyboard.disableScroll(true);
            // 监听键盘弹出，隐藏
            window.addEventListener('native.keyboardshow', keyboardShowHandlerPC);
            window.addEventListener('native.keyboardhide', keyboardHideHandlerPC);
        }
    }

    function keyboardShowHandlerPC(e) {
        //var keyboardHeight = e.keyboardHeight;
        $ionicScrollDelegate.$getByHandle('personal_content').resize();
        $ionicScrollDelegate.$getByHandle('personal_content').scrollBottom(true);
    }

    function keyboardHideHandlerPC() {
        $ionicScrollDelegate.$getByHandle('personal_content').resize();
        $ionicScrollDelegate.$getByHandle('personal_content').scrollBottom(true);
    }

    /**
     * 脏值检测及强制刷新
     */
    function checkApply(flag) {
        $scope.$evalAsync(function () {
            if (flag == 0) {
                $ionicScrollDelegate.$getByHandle('personal_content').resize();
                $ionicScrollDelegate.$getByHandle('personal_content').scrollBottom(true);
            } else if (flag == 1) {
                $ionicScrollDelegate.$getByHandle('personal_content').resize();
                $ionicScrollDelegate.$getByHandle('personal_content').scrollTop(true);
            }
        });
    };
    /**
     * 进入界面之前将消息定位到底部---Listener
     */
    KyeeListenerRegister.regist({
        focus: 'personal_chat',
        when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
        direction: 'both',
        action: function () {
            init(); // modified by zhangyi 整合后台推送消息以及普通聊天消息初始化处理
        },
    });
    //监听物理键返回
    KyeeListenerRegister.regist({
        focus: 'personal_chat',
        when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
        action: function (params) {
            params.stopAction(); //禁掉默认处理，使物理返回与页面上的返回键一致
            $scope.back();
        },
    });
    //离开页面之前处理
    KyeeListenerRegister.regist({
        focus: 'personal_chat',
        when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
        direction: 'both',
        action: function () {
            var arg = {
                'isIn': false,
                'pageType': 'CHAT',
                'sessionType': 0,
                'sessionId': $scope.receiver,
            };
            IMDispatch.setChattingAccount(arg);
            //如果有正在播放的录音则将它停止
            if ($scope.voiceMessage.startRecordFlag) {
                IMDispatch.endAudioRecording();
            }
            if ($scope.voiceMessage.playMsgId) {
                //停止播放语音
                IMDispatch.stopPlayAudio();
            }
            // 离开页面时销毁定时器
            if (imgLoadWatcherTimer != undefined) {
                KyeeUtilsService.cancelInterval(imgLoadWatcherTimer);
            }
            if (keyboardLoadWatcherTimer != undefined) {
                KyeeUtilsService.cancelInterval(keyboardLoadWatcherTimer);
            }
            // 离开页面时删除键盘监听事件
            if (isIOS) {
                window.removeEventListener('native.keyboardshow', keyboardShowHandlerPC);
                window.removeEventListener('native.keyboardhide', keyboardHideHandlerPC);
            }
            if (angular.isDefined($scope.clock)) {
                stopClock();
            }
        },
    });
    /**
     * 各类初始化集合
     */
    var init = function () {
        //若由随访表单进入则...
        //否则...
        initPageParams();
        initEmoJi();
        initView();
        setFooterBarStyle();
    };
    /**
     * 初始化参数
     */
    var initPageParams = function () {
        if (PersonalChatService.pullMessageList) {
            $scope.talkData = []; //聊天记录对象
            $scope.MsgListTmp = [];
        }
        if (IMUtil.isDeviceAvailable()) {
            $scope.isWeb = false;
        } else {
            $scope.isWeb = true;
        }
        $scope.yxLoginInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO);
        $scope.receiverInfo = PersonalChatService.receiverInfo; //接受者信息
        $scope.senderInfo = PersonalChatService.senderInfo(); //发送者信息
        $scope.receiver = $scope.receiverInfo.yxUser;
        $scope.me = $scope.senderInfo.yxUser;
        receipts = localStorage.getItem('receipts-' + $scope.me); //获取已读回执信息
        receipts = JSON.parse(receipts);
        $scope.noMoreMessage = ''; //下拉刷新加载更多提示
        $scope.showMenuIndex = -1; //是否有显示的删除消息、撤回菜单标识 默认-1 没有显示// 记录 大于-1 有显示记录
        $scope.foo = ''; //初始化消息内容
        $scope.contentBottom = 56; //初始化底部高度
        $scope.emojiOpenFlag = false; //表情包显示或隐藏
        $scope.attachOpenFlag = false; //选择图片区域显示或隐藏
        $scope.voiceOpenFlag = false; //语音功能开启或隐藏
        $scope.allowSend = false; //是否允许发送
        //语音消息设置
        $scope.voiceMessage = {
            playMsgId: null, //当前播放语音对象id
            showVoiceModal: false, //语音录制界面是否显示 false默认不显示 true显示
            cancel_tit: '手指上滑，取消发送', //语音录制界面文本提示
            cancelFlag: false, //默认不取消状态 true取消发送
            record_tit: '按住 说话', //语音发送按钮文本
            voiceAutoEnd: false, //默认为false 响应结束录音事件  true不响应结束录音事件  勿删
            startRecordFlag: false, //是否开始执行录音
            shortRecordFlag: false //录音时间过短
        };
        // 屏蔽网页版语音功能模块
        if (IMUtil.isDeviceAvailable()) {
            $scope.showVoiceArea = true;
        } else {
            $scope.showVoiceArea = false;
        }
    };
    /**
     * 初始化聊天界面
     */
    var initView = function () {
        $scope.isCanSentReminder = false;
        //标识进入聊天界面(设置会话未读数)
        var arg = {
            'isIn': true,
            'pageType': 'CHAT',
            'sessionType': 0,
            'sessionId': $scope.receiver,
        };
        IMDispatch.setChattingAccount(arg);
        //获取历史聊天记录（网易）
        var msg = {
            'to': $scope.receiver,
            'scene': 0,
        };
        if (PersonalChatService.pullMessageList) {
            IMDispatch.getMessageList(msg, 5, msg.endTime, function (msgList) {
                formatHistory(msgList, 0);
            });
        }
        var receiverInfo = $scope.receiverInfo;
        //医患聊天（以后均为医患聊天）
        if (2 == receiverInfo.userRole) {
            initChatWithDoctor();
            var param = {
                yxUser: receiverInfo.yxUser,
            };
            //获取能否聊天的参数
            PersonalChatService.getIsChatOpen(param, function (response) {
                if (response.success) {
                    var data = response.data;
                    ConsultOrderDetailService.orderIdStatus = data.scConsultId;
                    if (data.isChatOpen) { //可以和医生聊天
                        if (!data.dueTime && !data.dueTimeHos) { //没有时间的情况下，属于其他类型的医患聊天 例如: 购药
                            $scope.consultData.isHideInputForm = false;
                            $scope.contentBottom = 56;
                        } else if (PersonalChatService.fromView && PersonalChatService.consultParam && data.scConsultId != PersonalChatService.consultParam.scRecordId) {
                            //从已完成的订单详情页进入此页面,不能聊天
                            //PersonalChatService.fromView为true代表从图文咨询订单详情页或者是医生已接诊页面进入此页面
                            $scope.consultData.isHideInputForm = true;
                            $scope.contentBottom = 0;
                        } else { //从正在咨询的订单详情页进入 或者是从session进入此页面
                            handlerChatWithDoctorData(data);
                        }
                    } else {
                        $scope.consultData.isHideInputForm = true;
                        $scope.contentBottom = 0;
                    }
                }
            });

        }
        //不再针对好友获取信息（无好友机制)
        // add by zhangyi on 20161223 for KYEEAPPC-8906 随访回访表单相关功能开发 用户提交完随访表单后，模拟用户发送一条消息
        if (QuestionnaireSurveyService.isFromQuestionnairePageFlag) {
            $scope.sendImMsg('[您提交了一份回访单]');
        }
        QuestionnaireSurveyService.isFromQuestionnairePageFlag = false; //置空，避免$ionicHistory.goBack(-1)导致的异常

    };
    /**
     * 初始化表情
     */
    var initEmoJi = function () {
        //封装表情数据
        var lineSize = 7;
        var initHeight = ($scope.KyeeEnv.innerSize.height / 2) - 56;
        $scope.emojiDivHeight = (initHeight >= 240) ? 240 : (initHeight <= 184 ? 200 : initHeight); //限制最下高度和最大高度
        $scope.emojiPadding = (($scope.KyeeEnv.innerSize.width - 28 - 25 * 7) / 14);
        $scope.clearOffLeft = ($scope.KyeeEnv.innerSize.width - 28) / 7 * 6 + 14;
        var lineNum = 3; //一页三行
        $scope.emojiData = []; //分页
        $scope.rabbitData = [];
        var emojiPageData = []; //分行
        var rabbitPageData = []; //分行
        var emojiLineData = []; //一行
        var rabbitLineDate = [];
        var pageIndex = 0;
        var page2Index = 0;
        for (var i = 0; i < EmojiService.emojiData.length; i++) {

            emojiLineData.push(EmojiService.emojiData[i]);
            if ((i + 1 - pageIndex * 20) % lineSize == 0) { // 20 一页显示的个数
                emojiPageData.push(emojiLineData);
                emojiLineData = [];
            }
            if ((i + 1) % 20 == 0) {
                emojiPageData.push(emojiLineData);
                $scope.emojiData.push(emojiPageData);
                pageIndex++;
                emojiLineData = [];
                emojiPageData = [];
            }
        }
        // 删除按钮,在每页的最后一行末尾添加
        var deleteIcon = {
            emojiUrl: 'resource/images/patients_group/delete.png',
            chineseSign: 'deleteIcon',
        };
        // 空白表情，占位
        var emptyIcon = {
            emojiUrl: '',
            chineseSign: 'emptyIcon',
        };

        if (emojiLineData != []) {
            if (emojiLineData.length == lineSize) {
                emojiPageData.push(emojiLineData);
                emojiLineData = [];
                emptyIcon.emptyBlock = (lineSize - 1) * (25 + 2 * $scope.emojiPadding);
                emojiLineData.push(emptyIcon);
                emojiLineData.push(deleteIcon);
            } else if (emojiLineData.length == lineSize - 1) {
                emojiLineData.push(deleteIcon);
            } else {
                emptyIcon.emptyBlock = (lineSize - 1 - emojiLineData.length) * (25 + 2 * $scope.emojiPadding);
                emojiLineData.push(emptyIcon);
                emojiLineData.push(deleteIcon);
            }

            emojiPageData.push(emojiLineData);
            emojiLineData = [];
        }
        if (emojiPageData != []) {
            $scope.emojiData.push(emojiPageData);
            emojiPageData = [];
        }

        if ($scope.emojiData && $scope.emojiData.length > 0) {
            for (var i = 0; i < $scope.emojiData.length - 1; i++) {
                ($scope.emojiData[i])[lineNum - 1].push(deleteIcon);
            }
        }
    };
    /**
     * 发送消息响应
     * addBy lwj 20160726
     */
    $scope.sendImMsg = function (extraText) {
        var text = extraText || $scope.foo.trim();
        if (text.length > 1000) {
            KyeeMessageService.broadcast({
                content: '输入字符已超上限！',
            });
            return;
        }
        clearInputText(); //清除输入框内容
        $scope.wholeCursor = 0; //发送之后重置游标位置
        if (!$scope.emojiOpenFlag && !$scope.rabbitOpenFlag) {
            $scope.getFocus();
        }
        resetContentBottom();
        // var qyData = getQyData(), //获取自定义数据
        personalChatService = PersonalChatService;
        if (QuestionnaireSurveyService.isFromQuestionnairePageFlag) { //患者填写完随访回访表单后，保存参数信息
            // add by zhangyi on 20161223 for KYEEAPPC-8906 随访回访表单相关功能开发
            var queryParams = QuestionnaireSurveyService.queryQuestionInfoParams,
                sender = qyData.sender,
                receiver = qyData.receiver;
            //重新赋值
            sender.visitName = queryParams.patientName;
            sender.scRecordId = personalChatService.scRecordId;
            qyData.scMsgType = personalChatService.scMsgType;
            //增加额外的值
            sender.hospitalLogo = queryParams.hospitalLogo;
            receiver.hospitalId = queryParams.hospitalId;
            receiver.deptCode = queryParams.deptCode;
            receiver.doctorCode = queryParams.doctorCode;
        } else if ($scope.receiverInfo.userRole == 2 && $scope.consultData) {
            //医患聊天部分的处理
            var cData = $scope.consultData;
            if (cData.shouldSendCard) {
                var conParam = personalChatService.consultParamList[cData.scConsultId + ''];
                //重新负值
                qyData.sender.scRecordId = conParam.scRecordId;
                qyData.scMsgType = conParam.scMsgType || 5;
                //增加额外的值  向医生发起咨询生成订单的就诊者信息
                qyData.patientInfo = {
                    visitName: conParam.visitName,
                    sex: conParam.sex === '男' ? 1 : 2,
                    age: conParam.age,
                    diseaseName: conParam.diseaseName,
                    diseaseDesc: conParam.diseaseDesc,
                    scConsultId: cData.scConsultId,
                };
                cData.shouldSendCard = false;
            } else if (cData.shouldSendConsultEndTip) {
                cData.shouldSendConsultEndTip = false;
            }
        }
        var remoteExtension = {};
        remoteExtension = {
            'ver': IMChatting.currentVersion,
        };
        //发送文本消息（网易）
        var tmpMessage = {
            'scene': 0,
            'type': 'text',
            'from': $scope.me,
            'to': $scope.receiver,
            'flow': 0,
            'content': EmojiService.formatEmojiImageToChineseSignTo(text),
            'pushContent': EmojiService.formatSendText(text),
            'remoteExtension': remoteExtension,
        };
        sendContent(tmpMessage); //-1 首次发送
    };
    /**
     * 重新发送（未考虑云信是否登录情况）
     */
    $scope.reSend = function (data, index) {
        data.resend = true;
        setTimeout(1000, function () {
            $scope.talkData[index].status = 'sending';
            $scope.$apply();
        });
        var userInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.YX_LOGIN_INFO);
        if (!userInfo) {} else {
            if(data.type == 'audio'){
                IMDispatch.sendAudioMessage(data);
            }else{
                sendContent(data);
            }
        }
    };
    /**
     *  进入个人设置
     */
    $scope.goPersonalSetting = function () {
        $state.go('personal_setting');
    };
    /**
     *提醒医生
     */
    $scope.goSentReminder = function () {
        PersonalChatService.SentReminderConsult(ConsultOrderDetailService.orderIdStatus, function (response) {
            if (response.success) {
                var createReminderTime = new Date().getTime();
                if (!localStorage.getItem('createReminderTime')) {
                    localStorage.setItem('createReminderTime', createReminderTime);
                    $scope.SentReminder();
                } else {
                    var newClickTime = new Date().getTime();
                    var spaceTime = (newClickTime - localStorage.getItem('createReminderTime')) / 1000;
                    if (spaceTime >= 3600) {
                        var createReminderTime = new Date().getTime();
                        localStorage.setItem('createReminderTime', createReminderTime);
                        $scope.SentReminder();
                    } else {
                        KyeeMessageService.message({
                            title: '提示',
                            content: '距您上次提醒医生还不满一小时，无需频繁操作哦',
                            okText: '我知道了',
                        });
                    }
                }
            } else {
                KyeeMessageService.message({
                    title: '提示',
                    content: '提醒医生失败，请重试',
                    okText: '我知道了',
                });
            }
        });

    };
    /**
     * 发送消息为超链接时，点击链接跳转方法
     * @param text
     */
    $scope.openUrl = function (text) {
        if (!IMUtilService.urlValid(text)) {
            return;
        }
        var webUrl = text;
        if (0 > webUrl.indexOf("http")) {
            webUrl = "http://" + webUrl;
        }
        //判断是移动端还是网页版 网页跳至对应页面
        if (window.device && window.device.platform) {
            var params = [];
            params.push(webUrl);
            if ($scope.platform == 'iOS') {
                var url = {
                    'url': webUrl
                };
                navigator.pubplugin.openOutBrowser(function () {},
                    function () {}, params);
            } else {
                window.open(webUrl, '_blank', 'location=yes');
            }
        } else {
            patientsGroupWebService.webUrl = webUrl;
            $state.go("patient_group_web");
        }
    };
    /*
     *
     * 发送消息提醒催单
     * */
    $scope.SentReminder = function () {
        $scope.wholeCursor = 0; //发送之后重置游标位置
        if (!$scope.emojiOpenFlag) {
            $scope.getFocus();
        }
        resetContentBottom();
        var remoteExtension = {
            'ver': IMChatting.currentVersion,
            'localContent': '已为您发送提醒，请耐心等待医生的回复',
            'type': 'qypa-tip-1003'
        };
        var tmpMessage = {
            'to': $scope.receiver,
            'content': '患者正在等您的回答，请您尽快回复',
            'type': 'tip',
            'scene': 0,
            'remoteExtension': remoteExtension,
            'pushContent': '患者正在等您的回答，请您尽快回复'
        };
        IMDispatch.sendTipMessage(tmpMessage, function (message) {
            formatSendingMessage(message);
        });



    };
    /**
     * ng-bind-html需要安全绑定
     */
    $scope.TrustInputContent = function (text) {
        var newText = text;
        if (IMUtilService.urlValid(newText)) {
            newText = '<a href="javascript:void(0);" class="qy-blue text_href">' + newText + '</a>';
        }
        return $sce.trustAsHtml(newText);
    };

    //**************历史消息的处理 */
    function formatHistoryList(message, lastReadMsg, flag) {
        $scope.talkData = [];
        for (var i = message.length - 1; i >= 0; i--) {
            message[i].showTimeFlag = getShowTimeFlag(message[i]);
            message[i].showTime = IMUtilService.formatCurDate(message[i].time);
            if (message[i].flow == 0) {
                if (receipts && receipts[$scope.receiver] && message[i].time <= receipts[$scope.receiver] ||
                    (message[0].from != $scope.me) || (message[i].time < lastReadMsg.time)) {
                    message[i].readMsg = '已读';
                } else {
                    message[i].readMsg = '未读';
                }
            }
            $scope.talkData.push(message[i]);
        }
        checkApply(flag);
    };
    var formatHistory = function (message, flag) {
        var readFlag = true;
        if (message.length == 0 && flag == 1) {
            $scope.noHisMsg = true;
            $scope.noMoreMessage = '没有更多历史记录';
        } else if (flag == 0 && message.length > 0 && message[0].flow == 1) {
            IMDispatch.sendMessageReceipt(message[0], function () {}, function () {});
        }
        for (var i = 0; i < message.length; i++) {
            if (message[i].flow == 1 && readFlag && (flag == 0 || (flag == 1 && lastReadMsg == ''))) {
                lastReadMsg = message[i];
                readFlag = false;
            }
            if (message[i].type == 'tip' && message[i].flow == 0 && message[i].remoteExtension) {
                message[i].content = message[i].remoteExtension.localContent;
            }
            if (message[i].type == 'text') {
                message[i].content = EmojiService.formatChineseSignToEmojiImage(message[i].content);
            }
            message[i].isShowSendFrame = (message[i].flow == 0 && message[i].type != 'tip' && !('audio' == message[i].type && $scope.isWeb));
            message[i].isShowReceiveFrame = (message[i].flow == 1 && message[i].type != 'tip' && !('audio' == message[i].type && $scope.isWeb));
            $scope.MsgListTmp.push(message[i]);
        }
        formatHistoryList($scope.MsgListTmp, lastReadMsg, flag);
    };
    /**
     * 撤回消息
     * @param rlParams
     * @param curMsg
     */
    $scope.revokeMessage = function (curMsg, index) {
        $scope.revokeIndex = index;
        if (curMsg.type == 'audio') {
            //停止正在播放的语音消息
            IMDispatch.stopPlayAudio(function (res) {
                $scope.$apply(function () {
                    $scope.voiceMessage.playMsgId = null;
                });
            });
        }
        IMDispatch.revokeMessage(angular.copy(curMsg), function (message) {
            var notice = '您撤回了一条消息';
            var tipMsg = revokeMessageDone(index);
            IMDispatch.saveTipMessageToLocal(0, tipMsg.sessionId, tipMsg.content, tipMsg.time);
        }, function (errorMsg) {
            KyeeMessageService.message({
                content: "发送时间超过2分钟的消息，不能被撤回。"
            });
        });
    };
    /**
     * 发送消息监听
     */
    var formatSendMessage = function (message) {
        if (message.type != 'custom' && message.content) {
            message.content = EmojiService.formatChineseSignToEmojiImage(message.content);
        }
        if (message.type == 'custom') {
            if (message.attach.scMsgType == 5) {
                localStorage.setItem(message.attach.scRecordId, true);
            }
        }
        if (message.type == 'tip' && message.flow == 0 && message.remoteExtension) {
            message.content = message.remoteExtension.localContent;
        }
        for (var i = 0; i < $scope.talkData.length; i++) {
            if (receipts && receipts[$scope.receiver] && message.time < receipts[$scope.receiver]) {
                message.readMsg = '已读';
            } else {
                message.readMsg = '未读';
            }
            if (message.preId && $scope.talkData[i].id == message.preId) {
                message.showTimeFlag = $scope.talkData[i].showTimeFlag;
                message.showTime = $scope.talkData[i].showTime;
                message.isShowSendFrame = $scope.talkData[i].isShowSendFrame;
                message.isShowReceiveFrame = $scope.talkData[i].isShowReceiveFrame;
                $scope.talkData[i] = message;
                checkApply();
                break;
            } else if ($scope.talkData[i].id == message.id) {
                message.showTimeFlag = $scope.talkData[i].showTimeFlag;
                message.showTime = $scope.talkData[i].showTime;
                message.isShowSendFrame = $scope.talkData[i].isShowSendFrame;
                message.isShowReceiveFrame = $scope.talkData[i].isShowReceiveFrame;
                $scope.talkData[i] = message;
                checkApply();
                break;
            }
        }
        for (var j = 0; j < $scope.MsgListTmp.length; j++) {
            if (message.preId && $scope.MsgListTmp[j].id == message.preId) {
                $scope.MsgListTmp[j] = message;
                break;
            } else if ($scope.MsgListTmp[j].id == message.id) {
                $scope.MsgListTmp[j] = message;
                break;
            }
        }
        checkApply();
        var storageCache = CacheServiceBus.getStorageCache();
        var session = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST);
        for (var i = 0; i < session.length; i++) {
            if (session[i].id == message.sessionId) {
                session[i].lastMsg = message;
                jsInterface.receiveSession([session[i]]);
                break;
            }
        }
    };
    /**
     * 发送消息监听
     */
    var formatSendingMessage = function (message) {
        if (message.type == 'tip' && message.flow == 0 && message.remoteExtension) {
            message.content = message.remoteExtension.localContent;
        }
        if (message.type == 'text') {
            message.content = EmojiService.formatChineseSignToEmojiImage(message.content);
        }
        message.isShowSendFrame = (message.type != 'tip' && !('audio' == message.type && $scope.isWeb));
        $scope.MsgListTmp.reverse();
        $scope.MsgListTmp.push(message);
        $scope.MsgListTmp.reverse();
        message.showTimeFlag = getShowTimeFlag(message);
        message.showTime = IMUtilService.formatCurDate(message.time);
        $scope.talkData.push(message);
        checkApply(0);
    };
    /**
     * 已读回执处理
     */
    var formatReceipt = function (time) {
        for (var i = $scope.talkData.length; i >= 0; i--) {
            if ($scope.talkData[i].time < time) {
                $scope.receiptTime = $scope.talkData[i].time;
                break;
            }
        }
    };
    KyeeBroadcastService.doRegister($scope, 'sendMsgDone', function (message) {
        formatSendMessage(message);
    });
    KyeeBroadcastService.doRegister($scope, 'revokeMsg', function (message) {
        for (var i = 0; i < $scope.talkData.length; i++) {
            if ($scope.talkData[i].id == message.id) {
                $scope.talkData[i].type = 'tip';
                $scope.talkData[i].isShowReceiveFrame = false;
                $scope.talkData[i].content = '对方撤回了一条消息';
                checkApply();
                return;
            }
        }
    });
    KyeeBroadcastService.doRegister($scope, 'messageReceiptsListener', function () {
        var receiptsNew = localStorage.getItem('receipts-' + $scope.me);
        receiptsNew = JSON.parse(receiptsNew);

        if (!receipts || receipts[$scope.receiver] != receiptsNew[$scope.receiver]) {
            receipts = receiptsNew;
            formatRead(receiptsNew[$scope.receiver]);
        }
    });
    var formatRead = function (time) {
        for (var i = $scope.talkData.length - 1; i >= 0; i--) {
            if ($scope.talkData[i].time <= time) {
                $scope.talkData[i].readMsg = '已读';
            } else {
                $scope.talkData[i].readMsg = '未读';
            }
        }
        checkApply();
    };


    /**
     * 接收消息监听
     */
    KyeeBroadcastService.doRegister($scope, 'receiveMsg', function (msg) {
        if (msg.sessionId == $scope.receiver) {
            IMDispatch.sendMessageReceipt(msg, function () {}, function () {});
            if (msg.type == 'image') {
                if (IMUtil.isDeviceAvailable()) {
                    if (msg.attach.thumbPath != null && msg.attach.thumbPath != undefined) {
                        msg.filePath = msg.attach.thumbPath;
                    } else if (msg.attach.filePath) {
                        msg.filePath = msg.attach.filePath;
                    } else {
                        msg.filePath = msg.attach.url;
                    }
                } else {
                    msg.filePath = msg.attach.url;
                }
            } else if (msg.type == 'audio') {
                msg.filePath = msg.attach.path;
                msg.voiceUnreadState = 1;
            } else if (msg.type == 'text') {
                msg.content = EmojiService.formatChineseSignToEmojiImage(msg.content);
            }
            if (msg.type == 'tip' &&
                msg.remoteExtension &&
                msg.remoteExtension.type == 'qypa-tip-1002') { //结束咨询标识
                var param = getCompleteConsultParam();
                param.orderState = 5;
                param.showLoading = true;
                PersonalChatService.finishConsult(param, function (response) {
                    if (response.success) {
                        var cData = $scope.consultData;
                        localStorage.removeItem($scope.consultData.scConsultId);
                        cData.shouldSendConsultEndTip = true;
                        cData.remainMillSeconds = 0;
                        stopClock();
                        ConsultOrderDetailService.consultOrderID = param.scConsultId; //调用接口所需参数
                    } else {
                        KyeeMessageService.broadcast({
                            duration: 2500,
                            content: response.message,
                        });
                    }
                });
            }
            msg.isShowReceiveFrame = (msg.type != 'tip' && !('audio' == msg.type && $scope.isWeb));
            $scope.MsgListTmp.reverse();
            $scope.MsgListTmp.push(msg);
            $scope.MsgListTmp.reverse();
            msg.showTimeFlag = getShowTimeFlag(msg);
            msg.showTime = IMUtilService.formatCurDate(msg.time);
            $scope.talkData.push(msg);
            $ionicScrollDelegate.$getByHandle('personal_content').resize();
            $ionicScrollDelegate.$getByHandle('personal_content').scrollBottom(true);
            checkApply(0);
        }
    });
    /**
     * 撤回消息监听
     */
    var revokeMessageDone = function (index) {
        var tipMsg = $scope.talkData[index];
        tipMsg.isShowSendFrame = false;
        tipMsg.type = 'tip';
        tipMsg.content = '您撤回了一条消息';
        //处理session变更
        var session = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.SESSION_LIST);
        for (var i = 0; i < session.length; i++) {
            if (session[i].id == $scope.talkData[index].sessionId) {
                session[i].lastMsg.type = 'text';
                session[i].lastMsg.content = '您撤回了一条消息';
                jsInterface.receiveSession([session[i]]);
            }
        }
        $ionicScrollDelegate.$getByHandle('personal_content').resize();
        $ionicScrollDelegate.$getByHandle('personal_content').scrollBottom(true);
        checkApply();
        return tipMsg;
    };
    /**
     * 初始化页面数据渲染完成后充值页面到底部
     */
    $scope.repeatFinshed = function () {
        $ionicScrollDelegate.$getByHandle('personal_content').scrollBottom(true);
    };
    /**
     * 清除输入框最后一个字符
     */
    $scope.clearLastWord = function () {
        if (!$scope.foo) {
            return;
        }
        var lastChar = $scope.foo.substring($scope.wholeCursor - 1, $scope.wholeCursor);
        var startIndex = $scope.wholeCursor - 1;
        var partFoo = $scope.foo.substring(0, $scope.wholeCursor);
        if (lastChar == ']' && partFoo.lastIndexOf('[') > -1) {
            var emoJiIndex = partFoo.lastIndexOf('[');
            var lastEmoJi = $scope.foo.substring(emoJiIndex, $scope.wholeCursor);
            for (var i in EmojiService.emojiCodeCompChineseSign) {
                if (lastEmoJi == EmojiService.emojiCodeCompChineseSign[i]) {
                    startIndex = emoJiIndex;
                    break;
                }
            }
        }
        $scope.foo = $scope.foo.substring(0, startIndex) + $scope.foo.substring($scope.wholeCursor, $scope.foo.length);
        $scope.wholeCursor = startIndex;
    };
    /**
     * 获取当前设备平台 iOS or android
     */
    KyeeDeviceInfoService.getInfo(function (info) {
        $scope.platform = info.platform;
    }, function () {});
    /**
     * 选择图片
     * add by wyn 21060804
     */
    $scope.choosePicture = function () {
        if (isLegalWebApp) {
            document.getElementById('webChoosePicture').click();
        } else {
            deviceChoosePicture();
        }
        $scope.hideBottomContent();
    };
    /**
     * 选择图片
     */
    document.getElementById('webChoosePicture').addEventListener('change', function () {
        var webSelectImg = this.files[0];
        var validFlag = IMUtilService.validSelectFile(webSelectImg);
        if (validFlag) {
            KyeeMessageService.loading({
                mask: true,
            });
            $scope.sendImgMsg(webSelectImg, true);

            var personTimer = setInterval(function () {
                var isReady = localStorage.getItem('isReady');
                if (isReady == 'yes') {
                    KyeeMessageService.hideLoading();
                    localStorage.removeItem('isReady');
                    clearInterval(personTimer);
                }
            }, 100);
        }
        this.value = ''; //清除选择文件
    });
    /**
     * 设备设备选择相册图片
     * add by wyn 20161027
     */
    var deviceChoosePicture = function () {
        if ($scope.platform == 'Android') {
            var options = {
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                targetWidth: 900, //设置图片宽度
                targetHeight: 900, //设置图片高度
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                sourceType: Camera.PictureSourceType.SAVEDPHOTOALBUM,
                invokeEC: true,
            };
            KyeeCameraService.getPicture(
                // 调用成功时返回的值
                function (retVal) {
                    if (-1 < retVal.indexOf('file://')) {
                        retVal = retVal.substr(7);
                    }
                    $scope.sendImgMsg(retVal, false);
                    checkApply();
                },
                // 调用失败时返回的值
                function (retVal) {}, options);
        } else if ($scope.platform == 'iOS') {
            var options = {
                quality: 50,
                destinationType: Camera.DestinationType.FILE_URI,
                targetWidth: 900, //设置图片宽度
                targetHeight: 900, //设置图片高度
                saveToPhotoAlbum: false,
                allowEdit: false,
                sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                invokeEC: true,
            };
            KyeeCameraService.getPicture(
                // 调用成功时返回的值
                function (retVal) {
                    $scope.sendImgMsg(retVal, false);
                    checkApply();
                },
                // 调用失败时返回的值
                function (retVal) {}, options);
        }
    };
    /**
     * 发送图片消息
     * add by wyn 20160805
     * @param {string} imgMsg
     * @param {boolean} isWebFlag true:微信网页客户端；false:APP外壳端
     */
    $scope.sendImgMsg = function (imgMsg, isWebFlag) {
        if (!IMUtil.isDeviceAvailable()) {
            // 创建 一个FileReader对象
            var reader = new FileReader();
            // 读取文件作为URL可访问地址
            reader.readAsDataURL(imgMsg);
            reader.onprogress = function (e) {
                reader.onload = function (e) {
                    var DataURL = reader.result;
                    var remoteExtension = {};
                    remoteExtension = {
                        'ver': IMChatting.currentVersion,
                    };
                    var tmpImgMsg = {
                        'filePath': DataURL,
                        'scene': 0,
                        'from': $scope.me,
                        'to': $scope.receiver,
                        'type': 'image',
                        'target': $scope.receiver,
                        'flow': 0,
                        'remoteExtension': remoteExtension,
                    };
                    checkApply();
                    sendContent(tmpImgMsg);
                };
            };
        } else {
            var tmpImgMsg = {
                'filePath': imgMsg,
                'scene': 0,
                'from': $scope.me,
                'to': $scope.receiver,
                'time': Date.parse(new Date()),
                'type': 'image',
                'flow': 0,
            };
            sendContent(tmpImgMsg);
        }
    };
    /**
     * 点击拍照，发送图片消息
     * modify by wyn 增加调用微信拍照入口
     */
    $scope.goToCamera = function () {
        if (isLegalWebApp) {
            document.getElementById('webChoosePicture').click();
        } else {
            deviceTakePicture();
        }
        $scope.hideBottomContent();
    };
    /**
     * 移动设备拍照
     * add by wyn 20161027
     */
    var deviceTakePicture = function () {
        if ($scope.platform == 'Android') {
            var options = {
                quality: 40,
                destinationType: Camera.DestinationType.FILE_URI,
                targetWidth: 900, //设置图片宽度
                targetHeight: 1200, //设置图片高度
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                sourceType: Camera.PictureSourceType.CAMERA,
                saveToPhotoAlbum: false,
                correctOrientation: true,
            };
            KyeeCameraService.getPicture(
                // 调用成功时返回的值
                function (retVal) {
                    var cameraPhoto = retVal.replace('file://', '').trim();
                    $scope.sendImgMsg(cameraPhoto, false);
                    checkApply();
                },
                // 调用失败时返回的值
                function (retVal) {}, options);
        } else if ($scope.platform == 'iOS') {
            var options = {
                quality: 40,
                destinationType: Camera.DestinationType.FILE_URI,
                targetWidth: 900, //设置图片宽度
                targetHeight: 1200, //设置图片高度
                allowEdit: false,
                encodingType: Camera.EncodingType.JPEG,
                sourceType: Camera.PictureSourceType.CAMERA,
                saveToPhotoAlbum: false,
                correctOrientation: true,
            };
            KyeeCameraService.getPicture(
                // 调用成功时返回的值
                function (retVal) {
                    var cameraPhoto = retVal.replace('file://', '').trim();
                    $scope.sendImgMsg(cameraPhoto, false);
                    checkApply();
                },
                // 调用失败时返回的值
                function (retVal) {}, options);
        }
    };
    /**
     * 处理撤回/删除的消息的界面展示
     * @param index
     */
    var dealDeleteMessage = function (index) {
        //撤回语音消息时将播放playId置空
        for (var i = index; i < $scope.talkData.length - 1; i++) {
            $scope.talkData[i] = $scope.talkData[i + 1];
        }
        var start = $scope.talkData.length - index - 1;
        for (var i = start; i < $scope.MsgListTmp.length - 1; i++) {
            $scope.MsgListTmp[i] = $scope.MsgListTmp[i + 1];
        }
        $scope.talkData.pop();
        $scope.MsgListTmp.pop();
        checkApply();
    };
    /**
     * 删除某条消息
     * @param {*} message
     * @param {*} index
     */
    $scope.deleteMessage = function (message, index) {
        IMDispatch.deleteChattingHistory(message);
        dealDeleteMessage(index);
    };
    /**
     * 绑定弹出图片层参数传递
     * @param params
     */
    $scope.bind = function (params) {
        var screenSize = KyeeUtilsService.getInnerSize();
        $scope.overlayPicData = {
            width: screenSize.width,
            height: screenSize.height,
            imgWidth: screenSize.width,
            imgHeight: screenSize.height,
        };

        $scope.showOverlay = params.show;
        $scope.hideOverlay = params.hide;
        params.regist({
            hideImgShow: $scope.hideImgShow,
            showTipPanel: $scope.showTipPanel,
            animate: false //隐藏放大图片的是否显示动画 false不显示 true显示
        });
    };
    /**
     * 长按图片显示提示面板，暂仅提供保存图片至本地和取消功能 【注：仅支持移动端接收方保存图片】
     * add by wyn 20170123
     */
    $scope.showTipPanel = function () {
        if (IMUtilService.isDeviceAvailable()) {
            KyeeMessageService.actionsheet({
                title: '',
                buttons: [{
                    text: KyeeI18nService.get('patientsGroup.savePhotosToLocal', '保存图片'),
                }],
                onClick: function (index) {
                    if (0 == index) {
                        IMDispatch.downloadAttachment($scope.bigImageMessage, function () {
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get('patientsGroup.savePhotoSuccess', '保存成功'),
                            });
                        }, function () {
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get('patientsGroup.savePhotoFailed', '保存失败，请重试！'),
                            });
                        });
                    }
                },
                cancelButton: true,
            });
        }
    };
    /**
     * 计算图片放大的尺寸
     * @param {*} event
     */
    var initImg = function (event) {
        var screenSize = KyeeUtilsService.getInnerSize();
        var imgWidth = screenSize.width;
        // add by zhang at 20161214 for KYEEAPPC-9226 ios微信网页版，消息图片放大变形问题修复
        var iOSWebImageFlag = isLegalWebApp &&
            (event && event.target &&
                ((event.target.offsetHeight > event.target.offsetWidth && img.height < img.width) ||
                    (event.target.offsetHeight < event.target.offsetWidth && img.height > img.width))
            );
        var imgHeight = iOSWebImageFlag ? (img.width * imgWidth) / img.height : (img.height * imgWidth) / img.width;

        imgHeight = Math.round(imgHeight * 100) / 100;
        var top = imgHeight > screenSize.height ? 0 : (screenSize.height - imgHeight) / 2;

        $scope.overlayPicData = {
            width: screenSize.width,
            height: screenSize.height,
            imgWidth: imgWidth,
            imgHeight: imgHeight,
            imgTop: top,
            imgUrl: img.src,
        };
    };
    var img = new Image();
    /**
     * 图片放大缩小响应事件 addBy lwj 2016/08/06
     */
    $scope.showBigPic = function (imgUrl, direction, event, message) {
        $scope.bigImageMessage = message;
        $scope.showBigImg = true;
        img.src = imgUrl;
        img.setAttribute('direction', direction);
        //关闭之前正在运行的定时器
        if (imgLoadWatcherTimer != undefined) {
            KyeeUtilsService.cancelInterval(imgLoadWatcherTimer);
        }

        imgLoadWatcherTimer = KyeeUtilsService.interval({
            time: 200,
            action: function () {
                if (img.width > 0) {
                    KyeeUtilsService.cancelInterval(imgLoadWatcherTimer);
                    initImg(event);
                    $scope.showOverlay();
                }
            },
        });
    };
    /**
     * 隐藏放大图片
     */
    $scope.hideImgShow = function () {
        $scope.bigImageMessage = {};
        $scope.showBigImg = false;
        $scope.hideOverlay();
    };
    $scope.back = function () {
        if ($scope.showBigImg) {
            // 隐藏放大图片
            $scope.hideImgShow();
        } else { //edited by zhangyi at 20161124 for KYEEAPPC-8731 聊天页面点击返回键的时候跳转到聊天列表页面
            jsInterface.routerRecords = [];
            $ionicViewSwitcher.nextDirection('back');

            var userRole = $scope.receiverInfo.userRole;
            //医患聊天 返回至订单详情页面和待接诊页面
            if (userRole == 2 && $scope.consultData && PersonalChatService.fromView) {
                PersonalChatService.fromView = false;
                // ConsultOrderDetailService.consultOrderID = $scope.consultData.lastViewScConsultId;
                ConsultOrderDetailService.getOrderDetail(function (response) {
                    if (response.success) {
                        var state = response.data.orderState;
                        //1,2,3,7,8,10状态跳转至等待接诊页面
                        if (state === 1 || state === 2 || state === 3 || state === 7 || state === 8 || state === 10) {
                            $state.go('wait_chatting');
                        } else if (state === 4 || state === 5 || state === 6 || state === 9) {
                            //4,5,6,9状态跳转至订单详情页
                            $state.go('consult_order_detail');
                        } else if (state === 0) {

                        }
                    }
                });
            } else {
                $state.go('message->MAIN_TAB');
            }
        }
    };
    $scope.wholeCursor = 0;
    var KEY_CODE = {
        BACKSPACE: 8 //删除键键值
    };
    /**
     * 显示/隐藏表情区域
     */
    $scope.showOrHideEmojiDiv = function () {
        if (isIOS) {
            var isDalay = true;
        } else {
            var isDalay = false;
        }
        // 附加区域切换表情区域
        if ($scope.attachOpenFlag) {
            $scope.attachOpenFlag = !$scope.attachOpenFlag;
            isDalay = false;
        }
        if ($scope.voiceOpenFlag) {
            $scope.voiceOpenFlag = !$scope.voiceOpenFlag;
            isDalay = false;
        }
        // 隐藏表情区域
        if ($scope.emojiOpenFlag) {
            isDalay = false;
        }
        $scope.emojiOpenFlag = !$scope.emojiOpenFlag;
        $ionicSlideBoxDelegate.$getByHandle('emoji-slide').update();

        //关闭之前正在运行键盘定时器
        if (keyboardLoadWatcherTimer != undefined) {
            KyeeUtilsService.cancelInterval(keyboardLoadWatcherTimer);
        }
        if (isDalay) {
            keyboardLoadWatcherTimer = KyeeUtilsService.interval({
                time: 100,
                action: function () {
                    if (keyboardLoaded) {
                        KyeeUtilsService.cancelInterval(keyboardLoadWatcherTimer);
                        setFooterBarStyle();
                    }
                },
            });
        } else {
            setFooterBarStyle();
        }
    };
    /**
     * 显示/隐藏附加区域
     */
    $scope.showOrHideAttachDiv = function () {
        var isDalay = Boolean(isIOS);
        // 表情区域切换附加区域
        if ($scope.emojiOpenFlag) {
            $scope.emojiOpenFlag = !$scope.emojiOpenFlag;
            $ionicSlideBoxDelegate.$getByHandle('emoji-slide').update();
            isDalay = false;
        }

        if ($scope.voiceOpenFlag) {
            $scope.voiceOpenFlag = !$scope.voiceOpenFlag;
            isDalay = false;
        }

        // 隐藏附加区域
        if ($scope.attachOpenFlag) {
            isDalay = false;
        }


        $scope.attachOpenFlag = !$scope.attachOpenFlag;

        //关闭之前正在运行键盘定时器
        if (keyboardLoadWatcherTimer != undefined) {
            KyeeUtilsService.cancelInterval(keyboardLoadWatcherTimer);
        }
        if (isDalay) {
            keyboardLoadWatcherTimer = KyeeUtilsService.interval({
                time: 100,
                action: function () {
                    if (keyboardLoaded) {
                        KyeeUtilsService.cancelInterval(keyboardLoadWatcherTimer);
                        setFooterBarStyle();
                    }
                },
            });
        } else {
            setFooterBarStyle();
        }
    };
    /**
     * 判断键盘是否完全隐藏
     */
    var keyboardLoaded = function () {
        var inputEle = document.getElementById('personal_input');
        var taHeight = inputEle.offsetHeight;
        var newFooterHeight = taHeight + 16;
        newFooterHeight = (newFooterHeight > 56) ? newFooterHeight : 56;
        var footerEle = document.getElementById('footerBar');
        return footerEle.offsetHeight == newFooterHeight;
    };
    /**
     * 根据textarea高度动态调整footer高度
     */
    var setFooterBarStyle = function () {
        if ($scope.consultData && $scope.consultData.isHideInputForm) {
            return;
        }
        var inputEle = document.getElementById('personal_input');
        var taHeight = inputEle.offsetHeight;
        var newFooterHeight = taHeight + 16;
        newFooterHeight = (newFooterHeight > 56) ? newFooterHeight : 56;

        //调整ion-footer-bar高度
        if ($scope.emojiOpenFlag || $scope.attachOpenFlag) {
            $scope.footerBarHeight = newFooterHeight + $scope.emojiDivHeight - 12;
            $scope.contentBottom = newFooterHeight + $scope.emojiDivHeight - 12;
        } else {
            $scope.footerBarHeight = newFooterHeight;
            $scope.contentBottom = newFooterHeight;
        }
        if (PersonalChatService.pullMessageList) {
            $ionicScrollDelegate.$getByHandle('personal_content').resize();
            $ionicScrollDelegate.$getByHandle('personal_content').scrollBottom(true);
        } else {
            PersonalChatService.pullMessageList = true;
        }
    };
    /**
     * textarea获得焦点事件
     * @param $event
     */
    $scope.inputFocus = function ($event) {
        if ($scope.emojiOpenFlag) {
            $scope.showOrHideEmojiDiv();
        } 
        if ($scope.attachOpenFlag) {
            $scope.showOrHideAttachDiv();
        }
    };
    /**
     * textarea 点击事件
     * @param $event
     */
    $scope.inputClick = function ($event) {
        $scope.wholeCursor = $event.target.selectionStart;
        $ionicScrollDelegate.$getByHandle('personal_content').resize();
        $ionicScrollDelegate.$getByHandle('personal_content').scrollBottom(true);
        $scope.getFocus();
    };
    /**
     * textarea keyUp事件
     * @param $event
     */
    $scope.inputKeyup = function ($event) {
        $scope.wholeCursor = $event.target.selectionStart;
        var target = $event.target;
        var cursor = target.selectionStart;
    };
    /**
     * textarea keydown事件
     * @param $event
     * @returns {boolean}
     */
    $scope.inputKeydown = function ($event) {
        var target = $event.target;
        var cursor = target.selectionStart; //通过 selectionStart 获得光标所在位置
        if ($event.keyCode == KEY_CODE.BACKSPACE) { //删除事件
            if (target.value.charAt(cursor - 1) === ']') {
                var res = forEachText($scope.foo, cursor);
                $scope.foo = res.text;
                return false;
            }
        }
    };
    /**
     * 遍历文本，是否含有表情，转换为表情图片
     * @param text
     * @param cursor
     * @returns {{text: string, cursor: *}}
     */
    var forEachText = function (text, cursor) {
        var res = '';
        for (var i = cursor - 1; i > -1; i--) {
            if (text.charAt(i) == '[') {
                var temp = text.substring(i, cursor);
                var m = KyeeKit.filter(EmojiService.emojiData, function (x) {
                    return x.chineseSign == temp;
                });
                if (m) {
                    res = text.substring(0, i) + ' ' + text.substring(cursor, text.length + 1);
                    cursor = cursor - (m[0].chineseSign.length - 1); //焦点位置
                    break;
                }
            }
        }
        return {
            text: res,
            cursor: cursor,
        };
    };
    /**
     * 选择表情（转换成表情中文字符）
     * @param emojiData
     */
    $scope.chooseEmoji = function (emojiData) {
        if (emojiData.chineseSign == 'emptyIcon') {
            return;
        }
        if (emojiData.chineseSign == 'deleteIcon') {
            $scope.clearLastWord();
        } else {
            var chineseSign = EmojiService.emojiCodeCompChineseSign[emojiData.emojiCode];
            if ($scope.foo) {
                if ($scope.wholeCursor > $scope.foo.length) {
                    $scope.wholeCursor = $scope.foo.length;
                }
                $scope.foo = $scope.foo.substring(0, $scope.wholeCursor) + chineseSign + $scope.foo.substring($scope.wholeCursor, $scope.foo.length);
            } else {
                $scope.foo = chineseSign;
            }
            $scope.wholeCursor += (chineseSign.length);
        }
    };
    /**
     * 事件监控：textarea自动扩展事件
     */
    $scope.$on('taResize', function (e, ta) {
        setFooterBarStyle();
    });
    /**
     * 重置内容区距离底部的距离
     */
    var resetContentBottom = function () {
        if ($scope.emojiOpenFlag || $scope.attachOpenFlag || $scope.voiceOpenFlag) {
            $scope.contentBottom = 56 + $scope.emojiDivHeight - 12;
        } else {
            $scope.contentBottom = 56;
        }
        $ionicScrollDelegate.$getByHandle('personal_content').resize();
        $ionicScrollDelegate.$getByHandle('personal_content').scrollBottom(true);
    };

    /**
     * 发送成功后清空输入框内容
     */
    var clearInputText = function () {
        $scope.foo = '';
    };
    /**
     * 收起表情/附加/语音 区域
     */
    $scope.hideBottomContent = function () {
        if ($scope.emojiOpenFlag) {
            $scope.showOrHideEmojiDiv();
        }
        if ($scope.attachOpenFlag) {
            $scope.showOrHideAttachDiv();
        }
    };

    /**
     * 处理文本域获取焦点
     */
    $scope.getFocus = function () {
        var currentObj = document.getElementById('personal_input');
        var curTxt = $scope.foo.trim();
        var target_index = curTxt ? curTxt.length : 0;
        if (currentObj.setSelectionRange) { //兼容火狐
            var delayIndex = KyeeUtilsService.delay({
                time: 5,
                action: function () {
                    currentObj.setSelectionRange(target_index, target_index);
                    currentObj.focus();
                    KyeeUtilsService.cancelDelay(delayIndex);
                },
            });
        } else if (currentObj.createTextRange) { //兼容IE
            var rng = currentObj.createTextRange();
            rng.move('character', target_index);
            rng.select();
        }
    };
    /**
     * 下拉加载更多历史记录
     */
    $scope.doRefresh = function () {
        var msg = $scope.talkData[0];
        msg.to = $scope.receiver;
        IMDispatch.getMessageList(msg, 5, msg.time, function (msgList) {
            formatHistory(msgList, 1);
        });
        // 发送刷新完成广播
        $scope.$broadcast('scroll.refreshComplete');
    };

    /**
     * 获取消息是否显示时间
     * @returns {*}
     */
    function getShowTimeFlag(message) {
        var time = message.time;
        var nowTime = new Date().getTime();
        var preMsgTime = $scope.talkData.length > 0 ? $scope.talkData[$scope.talkData.length - 1].time : nowTime;
        return IMUtilService.getShowTimeFlag(preMsgTime, time);
    }

    /**
     * 发送文本、图片信息  (网易)
     * @param tmpMessage
     * @param index
     */
    var sendContent = function (tmpMessage) {
        if (tmpMessage.type == 'text') {
            IMDispatch.sendTextMessage(tmpMessage, function (msg) {
                if (!tmpMessage.resend) {
                    formatSendingMessage(msg);
                }
            }, function (msg) {
                if (!tmpMessage.resend) {
                    formatSendingMessage(msg);
                }
                if (msg.statusCode && msg.statusCode != 2) {
                    if (msg.errorCode && (msg.errorCode == '408' || msg.errorCode == '1000')) {
                        LoginService.getIMLoginInfo();
                    }
                }
            });
        } else if (tmpMessage.type == 'image') {
            IMDispatch.sendImageMessage(tmpMessage, function (msg) {
                if (!tmpMessage.resend) {
                    formatSendingMessage(msg);
                }
            }, function (msg) {
                if (!tmpMessage.resend) {
                    formatSendingMessage(msg);
                }
                if (msg.statusCode && msg.statusCode != 2) {
                    if (msg.errorCode && (msg.errorCode == '408' || msg.errorCode == '1000')) {
                        LoginService.getIMLoginInfo();
                    }
                }
            });
        } else if (tmpMessage.type == 'audio') {
            IMDispatch.sendAudioMessage(tmpMessage, function (msg) {
                if (!tmpMessage.resend) {
                    formatSendingMessage(msg);
                }
            }, function (msg) {
                if (!tmpMessage.resend) {
                    formatSendingMessage(msg);
                }
                if (msg.statusCode && msg.statusCode != 2) {
                    if (msg.errorCode && (msg.errorCode == '408' || msg.errorCode == '1000')) {
                        LoginService.getIMLoginInfo();
                    }
                }
            });
        } else if (tmpMessage.type == 'custom') {
            IMDispatch.sendCustomMessage(tmpMessage, function (msg) {
                if (!tmpMessage.resend) {
                    formatSendingMessage(msg);
                }
            }, function (msg) {
                if (!tmpMessage.resend) {
                    formatSendingMessage(msg);
                }
                if (msg.statusCode && msg.statusCode != 2) {
                    if (msg.errorCode && (msg.errorCode == '408' || msg.errorCode == '1000')) {
                        LoginService.getIMLoginInfo();
                    }
                }
            });
        }
    };
    /**
     * [getPatientDiseaseDesc 用于向医生发送卡片消息的个人病情描述]
     * @param  {[type]} userData [description]
     * @return {[type]}             [description]
     */
    $scope.getPatientDiseaseDesc = function (userData) {
        var info;
        try {
            info = JSON.parse(userData).patientInfo;
        } catch (e) {
            info = {};
        }
        return info.diseaseDesc;
    };
    /**
     * [getPatientInfoForCard 用于向医生发送卡片消息的个人信息展示]
     * @param  {[string]} userData [description]
     * @return {[string]} info     [description]
     */
    $scope.getPatientInfoForCard = function (userData) {
        var visitName, sex;
        sex = userData.sex == 1 ? '男' : '女';
        visitName = userData.visitName;
        if (visitName.length > 3) {
            visitName = visitName.substr(0, 3) + '...';
        }
        info = '<div class="line20 text-ellipsis">' +
            '<span class="f14 inline" style="color:#333">' + visitName + '</span>' +
            '<span class="f12 mar-l-5 inline">' + sex + ' / ' + userData.age + '岁' + '</span>' +
            '</div>' + '<div class="f12 line20 text-ellipsis" >' + userData.diseaseName + '</div>';
        return info;
    };
    /**
     * 点击患者卡片跳转患者信息页面
     * @param orderID
     */
    $scope.goToConsultInfo = function (orderID) {
        ConsultOrderDetailService.consultOrderID = orderID; //调用接口所需参数
        ConsultOrderDetailService.getOrderDetail(function (response) {
            if (response.success) {
                $state.go('consult_patient_disease_info');
            }
        });
    };
    /**
     * 复制消息到系统剪切板功能实现
     * @param {Object} message 消息体对象
     * @date 2017-01-24
     * @author 张毅
     */
    $scope.copyMessage = function (message) {
        var copyContent = message.content;
        // 文本内容为表情时,将表情转换为对应的中文字符
        if (copyContent.indexOf('class=\'emoji_msg\'') > -1) {
            copyContent = EmojiService.formatEmojiImageToChineseSignTo(copyContent);
        }
        try {
            cordova.plugins.clipboard.copy(copyContent);
        } catch (e) {
            KyeeMessageService.broadcast({
                content: KyeeI18nService.get('patientsGroup.clickCopyError', '您的设备暂不支持消息复制功能'),
            });
        }
    };
    /**
     * 消息长按响应事件
     * @param curMsg
     * @param index
     */
    $scope.longPressEvent = function (curMsg, index) {
        $scope.hiddenMenuTab();
        if ('sending' == curMsg.status) {
            return;
        }
        $scope.showMenuIndex = index;
        curMsg.showMenuFlag = true;
    };

    /**
     * 隐藏消息菜单显示
     */
    $scope.hiddenMenuTab = function () {
        if (-1 < $scope.showMenuIndex) {
            var index = $scope.showMenuIndex;
            $scope.talkData[index].showMenuFlag = false;
            $scope.showMenuIndex = -1;
        }
    };
    $scope.loseRe = function () {
        $scope.receiverInfo.remark = 'loseFocus';
        console.log('Web---------------------loseFocus');
        checkApply();
    };
    /**
     * 显示/隐藏语音区域
     * addBy liwenjuan 2017/6/8
     */
    $scope.showOrHideVoiceDiv = function () {
        var isDalay = Boolean(isIOS);
        // 表情区域切换附加区域
        if ($scope.emojiOpenFlag) {
            $scope.emojiOpenFlag = !$scope.emojiOpenFlag;
            $ionicSlideBoxDelegate.$getByHandle('emoji-slide').update();
            isDalay = false;
        }
        // 隐藏附加区域
        if ($scope.attachOpenFlag) {
            $scope.attachOpenFlag = !$scope.attachOpenFlag;
            isDalay = false;
        }
        if ($scope.voiceOpenFlag) {
            isDalay = false;
        }
        $scope.voiceOpenFlag = !$scope.voiceOpenFlag;
        //关闭之前正在运行键盘定时器
        if (keyboardLoadWatcherTimer != undefined) {
            KyeeUtilsService.cancelInterval(keyboardLoadWatcherTimer);
        }
        if (isDalay) {
            keyboardLoadWatcherTimer = KyeeUtilsService.interval({
                time: 100,
                action: function () {
                    if (keyboardLoaded) {
                        KyeeUtilsService.cancelInterval(keyboardLoadWatcherTimer);
                        setFooterBarStyle();
                    }
                },
            });
        } else {
            setFooterBarStyle();
        }
    };

    /**
     * 点击查看详情，跳转到购药申请详情页面
     * @param {Object} message 消息体对象
     * @date 2017-04-24
     * @author wangsannv
     */
    $scope.goToApplyDetail = function (message) {
        PurchaseMedinceService.REG_ID = message.attach.scRecordId;
        PurchaseMedinceService.HOSPITAL_ID = null;
        PurchaseMedinceService.ROUTER = 'personal_chat';
        $state.go('purchase_medince');
    };

    //****************录音部分start */
    /**
     * 开始录音
     */
    $scope.startRecording = function () {
        $scope.voiceMessage.shortRecordFlag = false;
        $scope.voiceMessage.cancelFlag = false;
        $scope.voiceMessage.showVoiceModal = true;
        $scope.voiceMessage.record_tit = '松开 结束';
        $scope.voiceMessage.startRecordFlag = true;
        $scope.voiceMessage.cancel_tit = "手指上滑，取消发送";
        var remoteExtension = {};
        remoteExtension = {
            'ver': IMChatting.currentVersion,
        };
        var msg = {
            'scene': 0,
            'to': $scope.receiver,
            'remoteExtension': remoteExtension,
        };
        IMDispatch.startAudioRecording(msg, function (data) {
            if (data && data.recordStatus) {
                if (data.recordStatus == 'recordTimeout') {
                    //录音时间超过60s自动结束录音
                    $scope.voiceMessage.voiceAutoEnd = true;
                    $scope.endAudioRecording(true);
                } else if (data.recordStatus == 'recordCancel') {
                    //取消发送
                } else if (data.recordStatus == 'recordBelowMinTime') {
                    $scope.voiceMessage.startRecordFlag = false;
                    $scope.voiceMessage.voiceAutoEnd = false;
                    $scope.endAudioRecording(true);
                }
            } else {
                //消息发送完成回调
                formatSendingMessage(data);
            }
        }, function (msg) {
            if (msg) {
                if (msg.statusCode && msg.statusCode != 2) {
                    if (msg.errorCode && (msg.errorCode == '408' || msg.errorCode == '1000')) {
                        LoginService.getIMLoginInfo();
                    }
                }
            } else {
                updateVoiceTit({
                    'msg': '录音失败',
                });
            }
        });
        //停止播放当前正在播放的语音消息
        if ($scope.voiceMessage.playMsgId != null) {
            IMDispatch.stopPlayAudio(function (res) {
                $scope.$apply(function () {
                    $scope.voiceMessage.playMsgId = null;
                });
            }, function (res) {
                $scope.$apply(function () {
                    $scope.voiceMessage.playMsgId = null;
                });
            });
        }
    };
    /**
     * 结束录音
     */
    $scope.endAudioRecording = function (flag) {
        console.log('Web---已进入松开结束语音');
        //从开始录音 超过60s的自动结束录音处理
        if (!flag && $scope.voiceMessage.voiceAutoEnd) {
            //录音自动结束
            $scope.voiceMessage.voiceAutoEnd = false;
            return;
        }
        //处理未触发长按事件的操作
        if (!$scope.voiceMessage.startRecordFlag) {
            //未触发长按事件
            $scope.voiceMessage.showVoiceModal = true;
            $scope.voiceMessage.record_tit = '松开 结束';
            if ($scope.voiceMessage.cancelFlag) {
                updateVoiceTit({
                    'msg': '手指上滑，取消发送',
                });
            } else {
                $scope.voiceMessage.shortRecordFlag = true;
                updateVoiceTit({
                    'msg': '录音时间太短',
                });
            }
            return;
        }
        $scope.voiceMessage.showVoiceModal = false;
        $scope.voiceMessage.startRecordFlag = false;
        $scope.voiceMessage.record_tit = '按住 说话';
        IMDispatch.endAudioRecording();
    };
    /**
     * 取消录音
     */
    $scope.cancelRecording = function () {
        $scope.voiceMessage.cancel_tit = '松开手指，取消发送';
        $scope.voiceMessage.cancelFlag = true;
        // $scope.voiceMessage.showVoiceModal = false;
        IMDispatch.cancelAudioRecording();
    };
    /**
     * 播放语音
     * addBy liwenjuan 2017/6/8
     * @param message
     */
    $scope.playAudio = function (message, index) {
        //如果当前语音还没下载下来则直接返回
        if (!message.attach.filePath) {
            return;
        }
        message.showMenuFlag = false;
        //如果正在播放则使其停止播放
        if ($scope.voiceMessage.playMsgId) {
            IMDispatch.stopPlayAudio();
            if ($scope.voiceMessage.playMsgId == message.id) {
                $scope.voiceMessage.playMsgId = null;
                return;
            }
            $scope.voiceMessage.playMsgId = null;
        }
        //更新语音消息的已读状态并更新到界面
        message.voiceUnreadState = 0;
        $scope.voiceMessage.playMsgId = message.id;
        $scope.talkData[index].status = 'read';
        checkApply();
        IMDispatch.playAudio(message, 3, function (flag) {
            if (message.id == $scope.voiceMessage.playMsgId) {
                $scope.voiceMessage.playMsgId = null;
                checkApply();
            }
        }, function (message) {
            $scope.$apply(function () {
                $scope.voiceMessage.playMsgId = null;
            });
        });
    };
    /**
     * 处理语音资源文件转为安全格式
     * addBy liwenjuan 2017/6/8
     * @param url
     * @returns {*}
     */
    $scope.trustAsResourceUrl = function (url) {
        return $sce.trustAsResourceUrl(url);
    };

    /**
     * 更新录音状态以及对应的提示信息
     * addBy liwenjuan 2017/6/9
     * @param params
     */
    function updateVoiceTit(params) {
        $scope.voiceMessage.cancel_tit = params.msg;
        checkApply();
        var index = KyeeUtilsService.delay({
            time: 1000,
            action: function () {
                $scope.voiceMessage.showVoiceModal = false;
                $scope.voiceMessage.cancel_tit = '手指上滑，取消发送';
                $scope.voiceMessage.record_tit = '按住 说话';
                $scope.voiceMessage.cancelFlag = false;
                $scope.voiceMessage.shortRecordFlag = false;
                KyeeUtilsService.cancelDelay(index);
                checkApply();
            },
        });
    };
    /**
     * 发送咨询提醒
     */
    function sendAheadRemind() {
        var tmpMessage = {
            'content': '温馨提示：订单即将自动关闭',
            'type': 'tip',
            'scene': 0,
            'time': new Date().getTime()
        };
        // IMDispatch.saveTipMessageToLocal(0, $scope.receiver, tmpMessage.content, tmpMessage.time);
        tmpMessage.isShowSendFrame = false;
        $scope.MsgListTmp.reverse();
        $scope.MsgListTmp.push(tmpMessage);
        $scope.MsgListTmp.reverse();
        tmpMessage.showTimeFlag = getShowTimeFlag(tmpMessage);
        tmpMessage.showTime = IMUtilService.formatCurDate(tmpMessage.time);
        $scope.talkData.push(tmpMessage);
    };
    /**
     * 发送咨询提醒，订单时间完成之后
     */
    function sendAheadRemindDoc() {
        var tmpMessage = {
            'content': '您的咨询时限已到，请尽快完成交流，医生随时可以结束此次咨询。',
            'type': 'tip',
            'scene': 0,
            'time': new Date().getTime()
        };
        // IMDispatch.saveTipMessageToLocal(0, $scope.receiver, tmpMessage.content, tmpMessage.time);
        tmpMessage.isShowSendFrame = false;
        $scope.MsgListTmp.reverse();
        $scope.MsgListTmp.push(tmpMessage);
        $scope.MsgListTmp.reverse();
        tmpMessage.showTimeFlag = getShowTimeFlag(tmpMessage);
        tmpMessage.showTime = IMUtilService.formatCurDate(tmpMessage.time);
        $scope.talkData.push(tmpMessage);
    };
    //****************录音部分end */
    /**  付费咨询功能----start -----**/
    /**
     * 初始化和医生聊天页面数据
     */
    var initChatWithDoctor = function () {
            $scope.isCanSentReminder = true;
            $scope.consultData = {
                shouldSendCard: false,
                shouldSendConsultEndTip: false,
                shouldCancelTimeOut: true,
                consultType: 0,
                isShowRightBtn: false, //是否展示右上角 咨询完成 按钮
                rightBtnText: '完成咨询',
                remainMillSeconds: 0,
                remainTime: '',
                isShowClock: false, //是否展示倒计时
                isHideInputForm: false //是否隐藏聊天输入框
            };
            $scope.contentBottom = 0; //初始时不展示输入框也不展示‘再次咨询’按钮,content距底部0px
        },
        setClock = function (type) { //设置倒计时
            var con = $scope.consultData,
                rem = con.remainMillSeconds, //;
                rema = con.remainMillSecondsAfter;
            if (con.shouldCancelTimeOut) {
                stopClock();
                return;
            }
            if (rem > 0) {
                rem -= 8 * 3600000; //减去8小时  因为默认起始时间是1970-01-01 08:00:00
                con.remainTime = $filter('date')(rem, 'HH:mm:ss');
                $scope.clock = $timeout(setClock, 1000);
                con.remainMillSeconds -= 1000;
                con.remainMillSecondsAfter -= 1000;

                if (type == 1) {
                    typeFlag = 1;
                } else if (type == 3 || typeFlag == 3) {
                    typeFlag = 3;
                    if (con.remainMillSeconds == con.aheadTime * 1000) {
                        con.shouldSendConsultEndReminder = true;
                        sendAheadRemind();
                    }
                }
            } else {
                if (typeFlag == 1 && rema > 0) {
                    if (con.isShowClock) {
                        con.shouldSendConsultEndReminder = true;
                        sendAheadRemindDoc();
                        con.isShowClock = false;
                    }

                    $scope.clock = $timeout(setClock, 1000);
                    con.remainMillSeconds -= 1000;
                    con.remainMillSecondsAfter -= 1000;
                    if (con.remainMillSecondsAfter == con.aheadTime * 1000) {
                        con.shouldSendConsultEndReminder = true;
                        sendAheadRemind();
                    }
                } else if ((type == 2 || typeFlag == 2) && rema > 0) {
                    typeFlag = 2;
                    if (type == 2 && con.remainMillSecondsAfter > con.aheadTime * 1000) {
                        con.shouldSendConsultEndReminder = true;
                        sendAheadRemindDoc();
                    }

                    $scope.clock = $timeout(setClock, 1000);
                    con.remainMillSeconds -= 1000;
                    con.remainMillSecondsAfter -= 1000;
                    if (con.remainMillSecondsAfter == con.aheadTime * 1000) {
                        con.shouldSendConsultEndReminder = true;
                        sendAheadRemind();
                    }
                } else if (typeFlag == 3 || (typeFlag == 1 && rema <= 0) || (typeFlag == 2 && rema <= 0)) {
                    KyeeMessageService.beforePopupShownAction(); //若有弹出框 则隐藏
                    stopClock();
                    var param = getCompleteConsultParam();
                    param.orderState = 9; //咨询超时后完成
                    PersonalChatService.finishConsult(param, function (response) {
                        if (response.success) {
                            con.shouldSendConsultEndTip = true;
                            sendFinishMessage();
                        } else {
                            KyeeMessageService.broadcast({
                                duration: 2500,
                                content: response.message,
                            });
                        }
                    });
                }
            }
        },
        stopClock = function () { //停止倒计时 结束咨询 执行的内容
            var cData = $scope.consultData;
            cData.shouldCancelTimeOut = true;
            cData.isShowRightBtn = false;
            cData.isHideInputForm = true;
            $scope.contentBottom = 0;
            if (angular.isDefined($scope.clock)) {
                $timeout.cancel($scope.clock);
                cData.remainTime = '00:00:00';
                cData.isShowClock = false;
                $scope.clock = undefined;
            }
        },
        getCompleteConsultParam = function () { //获取完成咨询请求的参数
            return {
                scConsultId: $scope.consultData.scConsultId,
                orderState: 5 //5是倒计时结束自动提交,9是手动点击完成提交
            };
        };

    /**
     * [handlerChatWithDoctorData 若是由付费咨询页面跳转过来 则处理数据]
     * @param  {[type]} data [description]
     * @return {[type]}          [description]
     */
    function handlerChatWithDoctorData(data) {
        var cData = $scope.consultData,
            pService = PersonalChatService,
            list = pService.consultParamList,
            consultParam = pService.consultParam,
            scConsultId = data.scConsultId + '';
        cData.scConsultId = data.scConsultId; //当前正在咨询的订单id
        if (PersonalChatService.fromView) {
            var attach = PersonalChatService.consultParam;
            if (attach.sex == '男') {
                attach.sex = 1;
            } else {
                attach.sex = 2;
            }
            if (attach.age) {
                attach.age = attach.age.substring(0, attach.age.indexOf('岁'));
            }
            var remoteExtension = {
                ver: IMChatting.currentCustomVersion,
                type: 'qypa-custom-' + attach.scMsgType,
            };
            var customMessage = {
                scene: 0,
                to: $scope.receiverInfo.yxUser,
                attach: attach,
                pushContent: '咨询医生消息',
                remoteExtension: remoteExtension,
            };
            var sendFlag = localStorage.getItem(PersonalChatService.consultParam.scRecordId);
            if (!sendFlag) {
                IMDispatch.sendCustomMessage(customMessage, function (customMessage) {
                    formatSendingMessage(customMessage);
                });
            }
            PersonalChatService.fromView = false;
        }
        if (data.imAutoFinishTime > 0) {
            if (data.dueTime > 0) {
                cData.isShowRightBtn = true;
                cData.shouldCancelTimeOut = false;
                cData.remainMillSeconds = data.dueTime * 1000;
                cData.remainMillSecondsAfter = data.dueTimeHos * 1000;
                cData.aheadTime = data.aheadTime;
                cData.aheadReminder = data.aheadReminder;
                cData.aheadReminderDoc = data.aheadReminderDoc;
                cData.isShowClock = true;
                cData.isHideInputForm = false;
                $scope.contentBottom = 56;
                setClock(1); //开始倒计时,1为医生设置咨询时长且时间未倒计时完
            } else if (data.dueTimeHos > 0) {
                cData.isShowRightBtn = true;
                cData.shouldCancelTimeOut = false;
                cData.remainMillSeconds = data.dueTime * 1000;
                cData.remainMillSecondsAfter = data.dueTimeHos * 1000;
                cData.aheadTime = data.aheadTime;
                cData.aheadReminder = data.aheadReminder;
                cData.aheadReminderDoc = data.aheadReminderDoc;
                cData.isShowClock = false;
                cData.isHideInputForm = false;
                $scope.contentBottom = 56;
                setClock(2); //开始倒计时，2为医生设置咨询时长且时间倒计时完
            }
        } else {
            cData.isShowRightBtn = true;
            cData.shouldCancelTimeOut = false;
            cData.remainMillSeconds = data.dueTime * 1000;
            cData.remainMillSecondsAfter = data.dueTimeHos * 1000;
            cData.aheadTime = data.aheadTime;
            cData.aheadReminder = data.aheadReminder;
            cData.isShowClock = true;
            cData.isHideInputForm = false;
            $scope.contentBottom = 56;
            setClock(3); //开始倒计时，3为医生未设置咨询时长，以医院设置的为主
        }
    };
    /**
     * 跳转至个人详情界面
     */
    $scope.goPersonalDetails = function (receiverId) {
        if (2 == $scope.receiverInfo.userRole) {
            $scope.goDoctorDetails();
        } else {
            PersonalHomeService.userInfo = {
                userId: receiverId,
                fromGroupId: '',
            };
            $state.go('personal_home');
        }
    };
    /**
     * 进入医生详情
     * addBy liwenjuan 2016/12/26
     */
    $scope.goDoctorDetails = function () {

        var yxUser = $scope.receiverInfo.yxUser;
        MyDoctorDetailsService.doctorInfo = {
            'yxUser': yxUser,
            'userRole': $scope.receiverInfo.userRole,
        };
        $state.go('my_doctor_details');
    };
    var sendFinishMessage = function () {
        var remoteExtension = {
            'ver': IMChatting.currentVersion,
            'localContent': '图文咨询已结束',
            'type': 'qypa-tip-1002'
        };
        var tmpMessage = {
            'to': $scope.receiver,
            'content': '患者已结束本次咨询',
            'type': 'tip',
            'scene': 0,
            'remoteExtension': remoteExtension,
            'pushContent': '患者已结束本次咨询'
        };
        IMDispatch.sendTipMessage(tmpMessage, function (message) {
            formatSendingMessage(message);
        });
    };
    /**
     * 患者和医生进行诊后咨询-图文咨询时，点击完成按钮，完成咨询
     */
    $scope.completeConsultation = function () {
        var handler = $ionicScrollDelegate.$getByHandle('personal_content'),
            position = handler.getScrollPosition(),
            cfg = {
                title: '温馨提示',
                okText: '完成',
                content: '您的病情咨询已完成？',
                onSelect: function (res) {
                    handler.freezeScroll(false);
                    if (res) {
                        var param = getCompleteConsultParam();
                        param.orderState = 5; //患者点击咨询完成
                        param.showLoading = true;
                        PersonalChatService.finishConsult(param, function (response) {
                            if (response.success) {
                                var cData = $scope.consultData;
                                localStorage.removeItem($scope.consultData.scConsultId);
                                cData.shouldSendConsultEndTip = true;
                                cData.remainMillSeconds = 0;
                                sendFinishMessage();
                                stopClock();
                                ConsultOrderDetailService.consultOrderID = param.scConsultId; //调用接口所需参数
                                ConsultOrderDetailService.getOrderDetail(function (res) {
                                    if (res.success) {
                                        $state.go('consult_satisfaction');
                                    }
                                });
                            } else {
                                KyeeMessageService.broadcast({
                                    duration: 2500,
                                    content: response.message,
                                });
                            }
                        });
                    }
                },
            };
        KyeeMessageService.confirm(cfg);
        handler.scrollTo(position.left, position.top, false);
        localStorage.removeItem('createReminderTime');
        localStorage.removeItem('isCanSender');
    };

}).build();