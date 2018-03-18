/**
 * 产品名称：quyiyuan
 * 创建者：刘健
 * 创建时间： 2015/5/20
 * 创建原因：c端预约挂号详情控制器
 * 修改者：杜巍巍
 * 修改时间： 2015/9/10
 * 修改原因：新版本院内导航替换老的接口
 * 任务号：KYEEAPPC-3461
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.appointment_regist_detil.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.appointment.appointment_regist_detil.service",
        "kyee.quyiyuan.hospitalNavigation.service",
        "kyee.quyiyuan.navigationOut.service",
        "kyee.quyiyuan.payOrder.service",
        "kyee.quyiyuan.myRefundDetailNew.service",

	    //'诊后咨询'功能跳转至和医生聊天界面所需
	    "kyee.quyiyuan.patients_group.personal_chat.controller",
	    "kyee.quyiyuan.patients_group.personal_chat.service",
        "kyee.quyiyuan.patients_group.my_doctor_details.service",
        "kyee.quyiyuan.consulation.note.controller",
        "kyee.quyiyuan.consulation.note.detail.service"
    ])
    .type("controller")
    .name("AppointmentRegistDetilController")
    .params(["$scope","$timeout", "$filter", "$compile", "$state", "$ionicHistory", "$ionicScrollDelegate",
	    "CacheServiceBus","KyeeMessageService", "KyeeUtilsService", "KyeeListenerRegister", "KyeePhoneService", "KyeeI18nService",
        "AppointmentRegistDetilService", "HospitalNavigationService", "NavigationOutService", "PayOrderService",
        "RsaUtilService", "HospitalService", "AppointmentDoctorService", "AppointmentDeptGroupService",
        "AppointmentDoctorDetailService", "MyCareDoctorsService", "HospitalSelectorService", "AppointmentRegistListService",
        "AppointmentAutoSignService","OutNavigationService", "MyRefundDetailNewService", "ClinicPaidService",
        "OperationMonitor", "AboutQuyiService", "PatientCardService", "AppointmentCreateCardService", "QueryHisCardService",
        "AppointConfirmService", "PersonalChatService", "MyDoctorDetailsService","ClinicPaymentReviseService", "ConsulationNoteDetailService","StatusBarPushService"])
    .action(function ($scope, $timeout, $filter, $compile, $state, $ionicHistory, $ionicScrollDelegate,
                       CacheServiceBus, KyeeMessageService, KyeeUtilsService, KyeeListenerRegister, KyeePhoneService, KyeeI18nService,
                      AppointmentRegistDetilService,HospitalNavigationService, NavigationOutService, PayOrderService,
                      RsaUtilService, HospitalService, AppointmentDoctorService, AppointmentDeptGroupService,
                      AppointmentDoctorDetailService, MyCareDoctorsService, HospitalSelectorService, AppointmentRegistListService,
                      AppointmentAutoSignService, OutNavigationService, MyRefundDetailNewService, ClinicPaidService,
                      OperationMonitor, AboutQuyiService, PatientCardService, AppointmentCreateCardService, QueryHisCardService,
                      AppointConfirmService, PersonalChatService, MyDoctorDetailsService,ClinicPaymentReviseService, ConsulationNoteDetailService,StatusBarPushService) {
        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "appointment_regist_detil",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.back();
            }
        });
        //外部通知跳转进来，显示返回键
        if(StatusBarPushService.webJump){
            $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
                viewData.enableBack = true;
            });
        }

        var timer = undefined;
        var delFlag = false;//是否删除标记 张婧 KYEEAPPC-6169
        //页面离开，销毁定时器
        KyeeListenerRegister.regist({
            focus: "appointment_regist_detil",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function (params) {
                if (timer) {
                    KyeeUtilsService.cancelInterval(timer);
                }
                AppointmentCreateCardService.enterInfo= false;
                AppointmentCreateCardService.password = "";
                var weiXinParams = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                if(weiXinParams&& weiXinParams.wx_forward === "appointment_regist_detil"){
                    CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL, null);
                }
                AppointmentRegistDetilService.isConsulotion = false; //将会诊医生的标记清除
            }
        });
        //返回
        $scope.back = function () {
            $scope.CAN_SIGN = false;//赋值是为了页面离开阻止签到弹框弹出
            $scope.SIGN_TYPE = '3';//赋值是为了页面离开阻止签到弹框弹出
            if($scope.isConsulotion){ //此详情是会诊预约详情页面 返回到会诊列表
                if ($scope.consulotion === 'MDT' || $scope.consulotion === 'RPP') {
                    ConsulationNoteDetailService.consType = $scope.consulotion;
                }
                $state.go('consulationnote');
            } else if (AppointmentRegistDetilService.ROUTE_STATE == "appointment_regist_list") {
                AppointmentRegistDetilService.ROUTE_STATE = "";
                AppointmentRegistListService.ROUTE_STATE = "appointment_regist_detil";
                $state.go("appointment_regist_list");
            } else if (AppointmentRegistDetilService.ROUTE_STATE == "appoint_confirm") {
                AppointmentRegistDetilService.ROUTE_STATE = "";
                $state.go("myquyi->MAIN_TAB.medicalGuide");
            }
            else if (AppointmentRegistDetilService.ROUTE_STATE == "regist_confirm") {
                AppointmentRegistDetilService.ROUTE_STATE = "";
                $state.go("myquyi->MAIN_TAB.medicalGuide");
            }
            else if (AppointmentRegistDetilService.ROUTE_STATE == "myquyi->MAIN_TAB.medicalGuide") {
                AppointmentRegistDetilService.ROUTE_STATE = "";
                $state.go("myquyi->MAIN_TAB.medicalGuide");
            }
            else if (AppointmentRegistDetilService.ROUTE_STATE == "payOrder") {
                AppointmentRegistDetilService.ROUTE_STATE = "";
                $state.go("myquyi->MAIN_TAB.medicalGuide");
            }
            else if (AppointmentRegistDetilService.ROUTE_STATE == "appointment_result") {
                AppointmentRegistDetilService.ROUTE_STATE = "";
                $state.go("myquyi->MAIN_TAB.medicalGuide");
            }
            else if (AppointmentRegistDetilService.ROUTE_STATE == "couponsRecord") {
                AppointmentRegistDetilService.ROUTE_STATE = "";
                $state.go("myquyi->MAIN_TAB.medicalGuide");
            }
            else if(AppointmentRegistDetilService.ROUTE_STATE == "clinicPaid"){
                if(!delFlag){
                    ClinicPaidService.recordBack = true;//张婧 非删除返回，历史缴费页面不刷新 KYEEAPPC-6169
                }
                AppointmentRegistDetilService.ROUTE_STATE = "";
                $state.go("clinicPaid");
            }
            else if(AppointmentRegistDetilService.ROUTE_STATE == "clinic_payment_revise"){
                //门诊待缴费页面跳详情 程铄闵 KYEEAPPC-6170
                AppointmentRegistDetilService.ROUTE_STATE = "";
                $state.go("clinic_payment_revise");
            }
            else if(AppointmentRegistDetilService.ROUTE_STATE =="rush_clinic_detail"){
                //从抢号管理页面跳转过来  高萌
                AppointmentRegistDetilService.ROUTE_STATE = "";
                $state.go("rush_clinic_detail");
            }
            else if(AppointmentRegistDetilService.ROUTE_STATE =="rush_clinic_success"){
                //从抢号管理页面跳转过来  高萌
                AppointmentRegistDetilService.ROUTE_STATE = "";
                $state.go("rush_clinic_success");
            } else if(StatusBarPushService.webJump){
                //外部通知跳转进来,返回到首页
                StatusBarPushService.webJump = undefined;
                $state.go('home->MAIN_TAB');
            }else {
                $ionicHistory.goBack(-1);
            }
        };
        //缓存数据
        var storageCache = CacheServiceBus.getStorageCache();
        //begin 预约签到 By 高玉楼 KYEEAPPC-2693
        $scope.sign = function(){
            //如果返现签到，则隐藏浮动层
            if($scope.IS_SHOW_SIGNFREE==1){
                $scope.hideOverlay();
            }
            AppointmentRegistDetilService.sign({
                hospitalId: AppointmentRegistDetilService.RECORD.HOSPITAL_ID,
                regId: AppointmentRegistDetilService.RECORD.REG_ID,
                regDate:$scope.REG_DATE_TIME
            },function(data){
                if(data.success){
                    refreshinit();
                }
            });
        };
        //转挂号输入就诊卡密码，输入框底部文字
        $scope.placeholderCardNo = KyeeI18nService.get("appointment_regist_deti.placeholderCardNo","请输入就诊卡号");
        $scope.placeholderCardPwd = KyeeI18nService.get("appointment_regist_deti.placeholderCardPwd","请输入就诊卡密码");
        //end 预约签到
        //begin 增加签到状态 By 高玉楼 KYEEAPPC-2693
        //获取预约挂号状态
        var getStatus = function (type, statusType,signAble) {
            var  s = '';
            //签到状态
            if(signAble) {
                //0：签到处理中;1:签到成功;2:签到失败
                switch(parseInt(statusType))
                {
                    case 0:
                        s = '#ff9900';
                        break;
                    case 1:
                        s = '#5baa8a';
                        break;
                    case 2:
                        s = '#ff777a';
                        break;
                }
            }
            else if (type == 0) {//预约
                //0:正在处理中;1:预约成功;2:预约失败;3:取消成功;4:取消失败;5:已转挂号;6:未转成功;7:待缴费;8:已缴费;9:待退费;11:取消中;
                switch (parseInt(statusType)) {
                    case 0:
                        s = '#ff9900';
                        break;
                    case 1:
                        s = '#5baa8a';
                        break;
                    case 2:
                        s = '#ff777a';
                        break;
                    case 3:
                        s = '#5baa8a';
                        break;
                    case 4:
                        s = '#ff777a';
                        break;
                    case 5:
                        s = '#5baa8a';
                        break;
                    case 6:
                        s = '#ff777a';
                        break;
                    case 7:
                        s = '#5baa8a';
                        break;
                    case 8:
                        s = '#5baa8a';
                        break;
                    case 9:
                        s = '#ff9900';
                        break;
                    case 11:
                        s = '#ff9900';
                        break;
                    default:
                        s = '#ff9900';// 未知状态
                }
            } else if (type == 1) {//挂号
                //0:正在处理中;1:挂号成功;2:挂号失败;3:未缴费;4:取消成功;5:取消失败;6:已退费;7:待退费;8:待缴费;11:取消中
                switch (parseInt(statusType)) {
                    case 0:
                        s = '#ff9900';
                        break;
                    case 1:
                        s = '#5baa8a';
                        break;
                    case 2:
                        s = '#ff777a';
                        break;
                    case 3:
                        s = '#ff9900';
                        break;
                    case 4:
                        s = '#5baa8a';
                        break;
                    case 5:
                        s = '#ff777a';
                        break;
                    case 6:
                        s = '#5baa8a';
                        break;
                    case 7:
                        s = '#ff9900';
                        break;
                    case 8:
                        s = '#ff9900';
                        break;
                    case 9:
                        s ='#5baa8a';
                        break;
                    case 11:
                        s = '#ff9900';
                        break;
                    default:
                        s = '#ff9900';// 未知状态
                }
            } else if (type == 2) {
                //预约转挂号
                //0:正在处理;5:已转挂号;6:未转成功;12:取消中;13:取消成功;14:取消失败;
                switch (parseInt(statusType)) {
                    case 0:
                        s = '#ff777a';
                        break;
                    case 5:
                        s = '#5baa8a';
                        break;
                    case 6:
                        s = '#ff9900';
                        break;
                    case 12:
                        s = '#ff9900';
                        break;
                    case 13:
                        s = '#5baa8a';
                        break;
                    case 14:
                        s = '#ff777a';
                        break;
                    default:
                        s = '#ff9900';// 未知状态
                }
            }
            return s;

        };
        //end 增加签到状态
        //就诊状态

        //将身份证号转换为****
        var getStarIdNo = function (idNo) {
            if (idNo == null || idNo == undefined || idNo == '') {
                return;
            }
            else {
                var len = idNo.length;
                var head = idNo.substr(0, 3);
                var idNoS = head;
                var tail = idNo.substr(len - 4, 4);
                for (var i = 3; i < idNo.length - 4; i++) {
                    idNoS = idNoS + '*';
                }
                idNoS = idNoS + tail;
                return idNoS;
            }
        };
        //将手机号转换为****
        var getStarPhoneNum = function (phoneNum) {
            if (phoneNum == null || phoneNum == undefined || phoneNum == '') {
                return;
            }
            else {
                var len = phoneNum.length;
                var head = phoneNum.substr(0, 3);
                var phoneS = head;
                var tail = phoneNum.substr(len - 4, 4);
                for (var i = 3; i < phoneNum.length - 4; i++) {
                    phoneS = phoneS + '*';
                }
                phoneS = phoneS + tail;
                return phoneS;
            }
        };
        //是否被按下
        $scope.pressed = false;
        ////默认位置

        var screenSize = KyeeUtilsService.getInnerSize();
        $scope.overlayData = {
            width : screenSize.width,
            height:screenSize.height/2+50,
            imgWidht:230,
            greenIndex:1,
            codeUrl:"",
            MES_NUMBER:""
        };
        //判断设备是否为ios
        if(window.device && ionic.Platform.platform() === "ios"){
            $scope.deviceTop= 64;
        } else {
            $scope.deviceTop=44;
        }
        $scope.bindGetType = function (params) {
            $scope.showOverlay = params.show;
            $scope.hideOverlay = params.hide;
            params.regist({
                oneSizeShow: $scope.oneSizeShow,
                twoSizeShow: $scope.twoSizeShow,
                threeSizeShow: $scope.threeSizeShow
            });
        };
        //取消签到
        $scope.cancelsign=function(){
            $scope.hideOverlay();
        };

        //详情页删除
        $scope.delete = function(paidItem){
            var userVsId = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
            if($scope.DEL_FLAG_EXTEND=="1") {
                KyeeMessageService.broadcast({
                    content: "未过期的记录暂不支持删除 ，您可在就诊日期之后再操作"
                });
                return;
            } else {
                KyeeMessageService.confirm({
                    title: KyeeI18nService.get("update_user.sms", "消息"),
                    content: KyeeI18nService.get("appointment_regist_deti.sureToDeleteIt", "该记录删除后，将无法恢复。请确认是否删除？"),
                    onSelect: function (flag) {
                        if (flag) {
                            AppointmentRegistDetilService.deleteList(paidItem.REG_ID,userVsId,function(data){
                                delFlag = true;
                                $scope.back();
                            })
                        }
                    }
                })
            }
            OperationMonitor.record("countDelete", "appointment_regist_detil");
        };
        // 刷新初始化页面
        //初始化显示签到弹窗
        var SHOW_SIGN=true;
        //由于ng-module只能绑定页面对象就诊者信息
        $scope.patientCard = {
            CARD_NO: "",
            CARD_SHOW: "",
            CARD_NAME:""
        };
        var refreshinit = function () {
            $scope.statusTypePlus = "";
            $scope.empt = false;
            var paramsDetil = {
                hospitalId: AppointmentRegistDetilService.RECORD.HOSPITAL_ID,
                regId: AppointmentRegistDetilService.RECORD.REG_ID
            };
            $scope.SHOW_SELECT_CARD = false;
            //如果输入卡信息完成或者进入此页面清掉显示的卡信息
            if (!AppointmentCreateCardService.enterInfo) {
                $scope.patientCard.CARD_SHOW = undefined;
                $scope.patientCard.CARD_NO = undefined;
                $scope.PATIENT_ID = undefined;
            }
            AppointmentRegistDetilService.queryAppointRegistParaDetil(paramsDetil, function (detilData, resultCode) {
                $scope.appointDetil ="";
                //当获取到的记录为已删除时，页面展示为空
                $scope.isSupportMerge =detilData.isSupportMerge;
                if (resultCode === "0020406") {
                    $scope.empt = true;
                } else {
                    if(detilData.APPOINT_SOURCE=="20003" &&((detilData.TYPE=="0"&&detilData.APPOINT_TYPE=="0")||(detilData.TYPE=="1"&&detilData.REGIST_TYPE=="0"))
                        &&(detilData.PAY_STATUS==""||detilData.PAY_STATUS==null||detilData.PAY_STATUS=='0'))
                    {
                        $scope.SHOW_SELECT_CARD = true;
                        //start 获取就诊者就诊卡信息
                        AppointmentRegistDetilService.setClientinfo(function (Clientinfo) {
                            $scope.Clientinfo = Clientinfo;
                            $scope.trueOrfalse = function () {
                                //只读
                                if (Clientinfo.CARDNO_TO_APPOINT == 0) {
                                    $scope.placeholder = "";
                                    return true;
                                } else {
                                    $scope.placeholder = "请输入或选择就诊卡";
                                    return false;
                                }
                            };
                            var menus = [];
                            if (Clientinfo.rows != null && Clientinfo.rows.length > 0) {
                                for (var i = 0; i < Clientinfo.rows.length; i++) {
                                    if (Clientinfo.rows[i].IS_DEFAULT == '1') {
                                        if (Clientinfo.SELECT_FLAG == "1") {
                                            $scope.patientCard.CARD_NO = Clientinfo.rows[i].CARD_NO;
                                            $scope.patientCard.CARD_SHOW = Clientinfo.rows[i].CARD_SHOW;
                                            $scope.PATIENT_ID = Clientinfo.rows[i].PATIENT_ID;
                                            $scope.patientCard.CARD_NAME = Clientinfo.rows[i].CARD_NAME;
                                            break;
                                        }
                                    } else {
                                        if (Clientinfo.SELECT_FLAG == "1") {
                                            $scope.patientCard.CARD_NO = Clientinfo.rows[0].CARD_NO;
                                            $scope.patientCard.CARD_SHOW = Clientinfo.rows[0].CARD_SHOW;
                                            $scope.PATIENT_ID = Clientinfo.rows[0].PATIENT_ID;
                                            $scope.patientCard.CARD_NAME = Clientinfo.rows[0].CARD_NAME;
                                        }
                                    }
                                }
                                for (var i = 0; i < Clientinfo.rows.length; i++) {
                                    var resultMap = {};
                                    if (Clientinfo.rows[i].CARD_NAME == null || Clientinfo.rows[i].CARD_NAME == undefined || Clientinfo.rows[i].CARD_NAME == "") {
                                        resultMap["name"] = "";
                                    }
                                    else {
                                        resultMap["name"] = Clientinfo.rows[i].CARD_NAME;
                                    }
                                    resultMap["text"] = Clientinfo.rows[i].CARD_SHOW;
                                    resultMap["value2"] = Clientinfo.rows[i].PATIENT_ID;
                                    resultMap["value"] = Clientinfo.rows[i].CARD_NO;
                                    resultMap["value3"] = Clientinfo.rows[i].CARD_TYPE;
                                    menus.push(resultMap);
                                }
                            }
                            //begin 申请新卡参数打开时当用户未邦卡时默认跳转到申请新卡页面 By 高玉楼  KYEEAPPC-2917
                            //wangwenbo 2015年10月8日09:25:15 增加用户有卡则不显示申请新卡 APPCOMMERCIALBUG-1429
                            if((menus.length == 0) && ('true' === $scope.Clientinfo.REMOTE_BUILD_CARD
                                || 'input' === $scope.Clientinfo.REMOTE_BUILD_CARD)){
                                var resultMap = {};
                                resultMap["name"] = "";
                                resultMap["text"] = KyeeI18nService.get("regist_confirm.applyNewCard","申请新卡");
                                resultMap["value2"] = -1;
                                resultMap["value"] = -1;
                                menus.push(resultMap);
                            }
                            //控制器中绑定数据
                            $scope.pickerItems = menus;
                            //end 申请新卡参数打开时当用户未邦卡时默认跳转到申请新卡页面 By 高玉楼
                            HospitalService.getParamValueByName(detilData.HOSPITAL_ID,"virtualCardType",function (hospitalPara) {
                                //KYEEAPPC-4733 确认挂号跳选卡界面是否展示虚拟卡标识  wangwan 2016年1月6日11:01:43
                                if(!(hospitalPara.data.virtualCardType.indexOf("1"))){
                                    $scope.virtualSupportType=false;
                                }else{
                                    $scope.virtualSupportType=true;//选卡界面不需要展示虚拟卡
                                }
                            });
                        });

                        var params = {
                            IS_ONLINE:0,
                            USER_ID:detilData.USER_ID,
                            USER_VS_ID:detilData.USER_VS_ID,
                            TYPE:detilData.TYPE,
                            AMOUNT:detilData.AMOUNT,
                            HOSPITAL_ID:detilData.HOSPITAL_ID
                        };
                        AppointmentRegistDetilService.queryClientinfo(params);
                    }
                    //end 查卡结束
                    $scope.IS_REFERRAL = detilData.IS_REFERRAL;
                    $scope.SHOW_REFERAL_HOSPITAL = false;
                    if(detilData.IS_REFERRAL=='2'&&detilData.REFERRAL_HOSPITAL_NAME!=undefined&&detilData.REFERRAL_HOSPITAL_NAME!=""){
                        $scope.SHOW_REFERAL_HOSPITAL = true;
                    }
                    //如果电话预约记录则展示支付按钮
                    $scope.SHOW_TEL_REGIST_PAY ='0';
                    $scope.SHOW_TEL_APPOINT_PAY ='0';
                    if(detilData.SHOW_TEL_APPOINT_PAY=='1'||detilData.SHOW_TEL_APPOINT_PAY=='2'){
                        //预约
                        if(detilData.TYPE=='0'&&detilData.APPOINT_TYPE=='0'){
                            $scope.SHOW_TEL_APPOINT_PAY=detilData.SHOW_TEL_APPOINT_PAY;
                        }else if(detilData.TYPE=='1'&&detilData.REGIST_TYPE=='0'){
                            $scope.SHOW_TEL_REGIST_PAY=detilData.SHOW_TEL_APPOINT_PAY;
                        }
                    }
                    $scope.showOutMap = true;
                    //优惠活动展示，如果为0表示返现，1表示全免，2表示减免
                    if (detilData.FLAG == 1) {
                        $scope.buttonColor = "#98C931"
                    } else if (detilData.FLAG == 0) {
                        $scope.buttonColor = "#F8AE2E";
                    } else if (detilData.FLAG == 2) {
                        $scope.buttonColor = "#F77662";
                    }
                    //优惠活动展示，如果为0表示返现，1表示全免，2表示减免
                    //显示重新预约、再次预约
                    $scope.IS_SHOW_REAPPOINT = detilData.IS_SHOW_REAPPOINT;
                    $scope.IS_SHOW_AGAIN_APPOINT = detilData.IS_SHOW_AGAIN_APPOINT;
                    //修改挂号费用为诊查费 edit by cuijin KYEEAPPC-11628
                    $scope.FeeType = 0;
                    $scope.REG_FEE_REPLACE = detilData.REG_FEE_REPLACE;
                    if($scope.REG_FEE_REPLACE != undefined && $scope.REG_FEE_REPLACE != "" && $scope.REG_FEE_REPLACE != null) {
                      $scope.REG_NAME_REPLACE = $scope.REG_FEE_REPLACE + "：";
                      $scope.FeeType = 1;
                    }
                    //就诊指导的医院科室名字
                    $scope.hospitalDeptName = detilData.HOSPITAL_NAME + '-' + detilData.DEPT_NAME;
                    //就诊指导
                    $scope.appointDetil = detilData;
                    //预约费用
                    $scope.AMOUNT_NAME = detilData.AMOUNT_NAME;
                    if (!detilData.AMOUNT) {
                        $scope.AMOUNT = "";
                    } else {
                        $scope.AMOUNT = "¥" + detilData.AMOUNT;
                    }

                    // 如果EXPENSE_DETAIL不为空，则优先显示明细 任务号：KYEEAPPC-6791
                    if (detilData.EXTEND_FIELD) {
                        if (detilData.EXTEND_FIELD.EXPENSE_DETAIL) {
                            $scope.appointDetil.EXPENSE_DETAIL = angular.copy(detilData.EXTEND_FIELD.EXPENSE_DETAIL);
                        }
                    }

                    //预约挂号接口详情返回的会诊标识，标识该笔记录是否是会诊的预约挂号记录，值: MDT, RPP
                    if (!$scope.isConsulotion) {
                        $scope.isConsulotion = Boolean(detilData.CONSULTATION_FLAG);
                        $scope.consulotion = detilData.CONSULTATION_FLAG;
                    }

                    //如果COMMENT_DETAIL不为空 zhoushiyu
                    $scope.COMMENT_COMMENT = undefined;
                    if(detilData.COMMENT_DETAIL && detilData.COMMENT_DETAIL.commentDetail) {
                        $scope.appointDetil.COMMENT_DETAIL = angular.copy(detilData.COMMENT_DETAIL.commentDetail);
                        $scope.COMMENT_NAME = $scope.appointDetil.COMMENT_DETAIL.COMMENT_BUTTON_NAME;
                        $scope.SHOW_COMMENT = $scope.appointDetil.COMMENT_DETAIL.SHOW_COMMENT;
                    }

                     $scope.DEL_FLAG_EXTEND = "0";
                     //获取當前年月日
                     $scope.datet = new Date();
                     $scope.dated = KyeeUtilsService.DateUtils.formatFromDate( $scope.datet, 'YYYY/MM/DD');
                     //获取當前時間點
                     $scope.hourn = KyeeUtilsService.DateUtils.formatFromDate( $scope.datet, 'HH:mm');
                     //获取就診時間點
                     $scope.hours = ($scope.appointDetil.CLINIC_DURATION).substring($scope.appointDetil.CLINIC_DURATION.lastIndexOf("/")+3,$scope.appointDetil.CLINIC_DURATION.length);
                     if( $scope.hours.substring(0,1).indexOf(" ")!=-1)
                     {
                         $scope.hours=$scope.hours.substring(1);
                     }
                     if($scope.hours.length<5)
                     {
                         $scope.hourt =  KyeeUtilsService.DateUtils.formatFromString($scope.hours,"h:m","hh:mm'");
                     }
                     else
                     {
                         $scope.hourt=$scope.hours;
                     }
                     if(($scope.appointDetil.APPOINT_TYPE==1 ||$scope.appointDetil.APPOINT_TYPE==5 ||$scope.appointDetil.REGIST_TYPE==1)
                         &&  $scope.appointDetil.VISIT_STATUS==0)
                     {
                         if(Date.parse($scope.appointDetil.REG_DATE)>Date.parse($scope.dated))
                         {
                             $scope.DEL_FLAG_EXTEND = "1";
                         }
                         else if(Date.parse($scope.appointDetil.REG_DATE)==Date.parse($scope.dated))
                         {
                             if( $scope.hourt!=null &&  $scope.hourt> $scope.hourn)
                             {
                                 $scope.DEL_FLAG_EXTEND = "1";
                             }
                         }
                     }


                    $scope.feeDetail = detilData.FEE_DETAIL;
                    $scope.isShowFee = detilData.IS_SHOW_FEE;
                    $scope.showFee = 1;
                    var fee = $scope.AMOUNT;
                    if (('0' == $scope.isShowFee) && (('¥0' == fee) || ('¥0.0' == fee) || ('¥0.00' == fee))) {
                        $scope.showFee = 0;
                    }
                    //省份证号转换*
                    $scope.ID_NO_STAR = getStarIdNo(detilData.ID_NO);
                    // 出生证号 wangchengcheng
                    $scope.BIRTH_NUMBER_SWITCH = detilData.BIRTH_NUMBER_SWITCH == '1' ? true : false;
                    $scope.BIRTH_CERTIFICATE_NO = detilData.BIRTH_CERTIFICATE_NO;
                    //手机号转换*
                    $scope.PHONE_NUMBER = getStarPhoneNum(detilData.PHONE_NUMBER);
                    //就诊时间
                    var clinicDuration = detilData.CLINIC_DURATION.split('/');
                    $scope.REG_DATE_TIME = detilData.REG_DATE + ' ' + clinicDuration[clinicDuration.length - 1];
                    //缴费凭证参数 0:隐藏  1：显示
                    $scope.IS_SHOW_PROVE = detilData.IS_SHOW_PROVE;
                    //取号方式控制 0:隐藏  1：显示
                    $scope.IS_SHOW_GET_TYPE = detilData.IS_SHOW_GET_TYPE;
                    //BUTTON_ACTION==0 继续支付  BUTTON_ACTION==2 预约转挂号
                    $scope.BUTTON_ACTION = detilData.BUTTON_ACTION;
                    //是否显示不返现签到框 1：显示 0：不显示
                    $scope.IS_SHOW_SIGN = detilData.IS_SHOW_SIGN;
                    // 是否支持就诊签到功能 0：不支持 1：支持
                    $scope.IS_SIGN = detilData.IS_SIGN;
                    //签到类型：0：自动签到；1：手动签到
                    $scope.SIGN_TYPE_HOSPITAL = detilData.SIGN_TYPE_HOSPITAL;
                    //签到提示内容
                    $scope.SIGN_CONTENT = detilData.SIGN_CONTENT;
                    //签到后是否允许取消预约挂号
                    $scope.AFTER_SIGN_CANCEL = detilData.AFTER_SIGN_CANCEL;
                    //签到经纬度范围
                    $scope.SIGN_RANGE = detilData.SIGN_RANGE;
                    $scope.CAN_SIGN = detilData.CAN_SIGN;
                    $scope.SIGN_TYPE = detilData.SIGN_TYPE;
                    //是否显示返现签到框 1：显示 0：不显示
                    $scope.IS_SHOW_SIGNFREE = detilData.IS_SHOW_SIGNFREE;
                    $scope.STATUS_TYPE = detilData.STATUS_TYPE;
                    if(detilData.statusTypePlus!=null && detilData.statusTypePlus !='' && detilData.statusTypePlus!=undefined){
                        $scope.statusTypePlus = detilData.statusTypePlus;  //几天后就诊
                    }
                    //就诊提示
                    if (detilData.MSG == "" && detilData.ATTENTION_MATTERS == "") {
                        $scope.typeMsgNotHidden = true;
                    } else {
                        $scope.typeMsgNotHidden = false;
                    }
                    if (detilData.BAR_CODE != '' && detilData.BAR_CODE != undefined && detilData.BAR_CODE != null) {
                        $scope.barCode = detilData.BAR_CODE.split('|')[0];
                        $scope.barCodeUrl = detilData.BAR_CODE.split('|')[1];
                    }
                    if (detilData.QR_CODE != '' && detilData.QR_CODE != undefined && detilData.QR_CODE != null) {
                        $scope.qrCode = detilData.QR_CODE.split('|')[0];
                        $scope.qrCodeUrl = detilData.QR_CODE.split('|')[1];
                    }
                    if (detilData.CLINIC_BAR_CODE != '' && detilData.CLINIC_BAR_CODE != undefined && detilData.CLINIC_BAR_CODE != null) {
                        $scope.clinicbarCode = detilData.CLINIC_BAR_CODE.split('|')[0];
                        $scope.clinicbarCodeUrl = detilData.CLINIC_BAR_CODE.split('|')[1];
                        $scope.clinicbarCodeNum = detilData.CLINIC_BAR_CODE.split('|')[2];
                    }
                    if (detilData.ID_NO_QR_CODE != '' && detilData.ID_NO_QR_CODE != undefined && detilData.ID_NO_QR_CODE != null) {
                        $scope.idNoqrCode = detilData.ID_NO_QR_CODE.split('|')[0];
                        $scope.idNoqrCodeUrl = detilData.ID_NO_QR_CODE.split('|')[1];
                        $scope.idNoqrCodeNum = detilData.ID_NO_QR_CODE.split('|')[2];
                    }
                    //注意事项里的提示信息，如果是转挂号显示，其他不显示
                    //$scope.ATTENTION_MATTERS=detilData.ATTENTION_MATTERS;
                    //预约转挂号按钮是否置灰  0：置灰 1：不置灰
                    $scope.CAN_APPOINT2REGIST_FLAG = detilData.CAN_APPOINT2REGIST_FLAG;
                    //取消预约按钮是否置灰  0：置灰 1：不置灰
                    $scope.CAN_CANCEL_APPOINT = detilData.CAN_CANCEL_APPOINT;
                    //取消挂号按钮是否置灰 0：置灰 1：不置灰
                    $scope.CAN_CANCEL_REGIST = detilData.CAN_CANCEL_REGIST;
                    //取消预约转挂号（取消挂号）按钮是否置灰 0：置灰 1：不置灰
                    $scope.CAN_CANCEL_APPOINT2REGIST = detilData.CAN_CANCEL_APPOINT2REGIST;

                    //按钮显示 是否展示 继续支付，预约转挂号按钮 0：不显示 1：显示
                    $scope.IS_SHOW_BUTTON = detilData.IS_SHOW_BUTTON;
                    //预约挂号状态
                    $scope.APPOINT_REGISTER_TYPE = detilData.TYPE;

                    //是否显示就诊序号 1：显示 0：不显示
                    $scope.IS_SHOW_VISIT_NO = detilData.IS_SHOW_VISIT_NO;
                    //按钮显示 是否展示 取消预约订单 0：不显示 1：显示  KYEEAPPC-3002  By  章剑飞
                    $scope.IS_CAN_CANCEL_AFTER_APPOINT_PAY = detilData.IS_CAN_CANCEL_AFTER_APPOINT_PAY;
                    //是否需要倒计时 0：不需要 1需要
                    $scope.IS_COUNT_DOWN = detilData.IS_COUNT_DOWN;
                    if ($scope.IS_COUNT_DOWN == 1) {
                        $scope.APY_CHANGE_NAME = KyeeI18nService.get("appointment_regist_deti.ispayTime", "可支付时间：");
                        var time = detilData.BUTTON_NAME;
                        if (time > 0) {
                            timer = KyeeUtilsService.interval({
                                time: 1000,
                                action: function () {
                                    time -= 1;
                                    //KYEEAPPC-4351 wangwan 修改页面定时器
                                    var hour= Math.floor(time / (60*60));//小时
                                    var minute = Math.floor((time/60)%(60));//分钟
                                    var second = Math.floor(time % 60);//秒
                                    var timeShow="";
                                    if (time > 0) {
                                        if (second < 10) {
                                            second = '0' + second;
                                        }
                                        if(hour>0){
                                            if (minute < 10) {
                                                minute = '0' + minute;
                                            }
                                            timeShow=hour+':'+ minute + ':' + second
                                        }else{
                                            timeShow=minute + ':' + second
                                        }
                                        $scope.BUTTON_NAME = "<span style='color: orange'>" + timeShow + "</span>" + KyeeI18nService.get("appointment_regist_deti.isPay", "内完成支付");
                                    } else {
                                        //关闭定时器
                                        if (timer != undefined) {
                                            KyeeUtilsService.cancelInterval(timer);
                                        }
                                        $scope.BUTTON_NAME = '00:00';
                                        refreshinit();
                                        //将继续支付，刷新按钮隐藏
                                        $scope.IS_SHOW_REFRESH = 0;
                                        $scope.IS_SHOW_BUTTON = 0;
                                    }
                                    //    setTime(timer,time);
                                }
                            });
                        }
                    } else {
                        $scope.APY_CHANGE_NAME = KyeeI18nService.get("appointment_regist_deti.is2RegistDate", "支付时限：");//吴伟刚 KYEEAPPC-4349 确认页面的就诊卡相关优化？取消预约挂号时弹出询问框
                        // 显示 可支付时限
                        $scope.BUTTON_NAME = detilData.BUTTON_NAME;
                    }
                    //是否 展示取消按钮，0：不显示 1：显示  取消预约，取消挂号
                    $scope.IS_SHOW_CANCEL = detilData.IS_SHOW_CANCEL;
                    if($scope.AFTER_SIGN_CANCEL == 1 && $scope.IS_SIGN == 1 && (detilData.SIGN_TYPE == '3' || detilData.SIGN_TYPE == '4' || detilData.SIGN_TYPE == '5')){
                        $scope.IS_SHOW_CANCEL = 0;
                    }
                    //1  取消挂号  0：取消预约
                    $scope.CANCEL_ACTION = detilData.CANCEL_ACTION;
                    //0 不显示 刷新按钮 1：显示
                    $scope.IS_SHOW_REFRESH = detilData.IS_SHOW_REFRESH;
                    //是否展示失败原因
                    $scope.IS_SHOW_HANDLE_MESSAGE = detilData.IS_SHOW_HANDLE_MESSAGE;
                    if ($scope.IS_SHOW_HANDLE_MESSAGE==1) {
                        if($scope.appointDetil.HANDLE_MESSAGE!=undefined&&
                            $scope.appointDetil.HANDLE_MESSAGE!=""&&$scope.appointDetil.HANDLE_MESSAGE!=null){
                            $scope.WARN_MSG=$scope.appointDetil.HANDLE_MESSAGE+$scope.appointDetil.REFUND_MESSAGE;
                        }else{
                            $scope.WARN_MSG="";
                        }
                    }
                    // 0：预约挂号处理中；1：预约挂号成功；2：预约挂号失败；3：预约挂号成功后待支付
                    if ((detilData.TYPE==='0' && detilData.APPOINT_TYPE==='0') || (detilData.TYPE==='1' && detilData.REGIST_TYPE==='0') || (detilData.TYPE==='2' && detilData.APPOINT_TYPE==='0')) {
                        $scope.STATUS_FLAG = '0';
                    } else if ((detilData.TYPE==='0' && detilData.APPOINT_TYPE==='1') || (detilData.TYPE==='1' && detilData.REGIST_TYPE==='1') || (detilData.TYPE==='2' && detilData.APPOINT_TYPE==='5')) {
                        $scope.STATUS_FLAG = '1';
                      //  $scope.id="appointDetilSuccessMSG";
                       // zhankai($scope.id);
                        //detilData.CONSULTATION_FLAG不为空，则说明是会诊记录
                        if(detilData.CONSULTATION_FLAG!=null&&detilData.CONSULTATION_FLAG!=undefined&&detilData.CONSULTATION_FLAG!=''){
                            $scope.WARMING = '温馨提示';
                        }else{
                            $scope.WARMING = '取号信息';
                        }
                        //$scope.showMoreFlag = $scope.STATUS_TYPE.length + $scope.appointDetilMSG.length > ((KyeeUtilsService.getInnerSize().width-58)*2-14)/14;
                        // by gaomeng 新增取消预约失败、取消预约转挂号失败、取消挂号失败的原因
                    } else if ((detilData.TYPE==='0' && (detilData.APPOINT_TYPE==='2'|| detilData.APPOINT_TYPE==='4')) || (detilData.TYPE==='1' && (detilData.REGIST_TYPE==='2' || detilData.REGIST_TYPE==='5')) || (detilData.TYPE==='2' && (detilData.APPOINT_TYPE==='6'|| detilData.APPOINT_TYPE==='14'))) {
                        $scope.STATUS_FLAG = '2';
                        //$scope.showMoreFlag = $scope.STATUS_TYPE.length + $scope.WARN_MSG.length > ((KyeeUtilsService.getInnerSize().width-58)*2-14)/14;
                       // $scope.id="appointDetilFailMSG";
                       // zhankai($scope.id);
                        if ($scope.IS_SHOW_HANDLE_MESSAGE==1) {
                            if($scope.WARN_MSG.indexOf('意见反馈')>-1 || $scope.WARN_MSG.indexOf('联系客服')>-1){
                                $scope.WARN_MSG_TEM = $scope.WARN_MSG.replace('意见反馈', '<span class="qy-blue" ng-click="gofeedback()">意见反馈</span>');
                                $scope.WARN_MSG_TEM = $scope.WARN_MSG_TEM.replace('联系客服', '<span class="qy-blue" ng-click="click2call()">联系客服</span>');
                                footerClickWaryMsg();
                            }
                        }
                        $scope.WARMING = '失败原因';
                    } else if ((detilData.TYPE==='0'&&detilData.APPOINT_TYPE==='7') || (detilData.TYPE==='1'&&detilData.REGIST_TYPE==='8')) {
                        $scope.STATUS_FLAG = '3';
                    } else if ((detilData.TYPE==='0'&&detilData.APPOINT_TYPE==='3') || (detilData.TYPE==='1'&&detilData.REGIST_TYPE==='4')||(detilData.TYPE==='2' && detilData.APPOINT_TYPE==='13')) {
                        $scope.STATUS_FLAG = '1';
                    } else {
                        $scope.STATUS_FLAG = '-1';
                    }
                    $scope.moreMsgShow = false;
                    $scope.showMoreMsg = function () {
                        $scope.moreMsgShow = !$scope.moreMsgShow;
                    };
                    //预约状态描述
                    if (1 === parseInt(detilData.IS_SHOW_SIGNTYPE)) {
                        $scope.state = getStatus(detilData.TYPE, detilData.SIGN_TYPE, true);
                    }
                    else if (parseInt(detilData.TYPE) == 0) {
                        //预约状态
                        $scope.state = getStatus(detilData.TYPE, detilData.APPOINT_TYPE, false);
                        //end 预约签到
                    } else if (parseInt(detilData.TYPE) == 1) {
                        //挂号状态
                        $scope.state = getStatus(detilData.TYPE, detilData.REGIST_TYPE, false);
                    } else if (parseInt(detilData.TYPE) == 2) {
                        //预约转挂号状态
                        $scope.state = getStatus(detilData.TYPE, detilData.APPOINT_TYPE, false);
                    }
                    $scope.CANCEL_WARN_MSG = detilData.CANCEL_WARN_MSG;
                        //获取失败提示内容
                        $scope.WARN_MSG_data = detilData.WARN_MSG;
                        dealVisitMsg(detilData.MSG, detilData.ATTENTION_MATTERS);
                $scope.IS_PARTICULAR_DEPT = detilData.IS_PARTICULAR_DEPT;
                $scope.CLINIC_MESSAGE = detilData.CLINIC_MESSAGE;
                if($scope.IS_PARTICULAR_DEPT) {
                    KyeeMessageService.confirm({
                        title: KyeeI18nService.get('appointment_regist_deti.clinicMsgTitle', "温馨提示"),
                        content: $scope.CLINIC_MESSAGE,
                        okText: KyeeI18nService.get('appointment_regist_deti.letsGo', "在线支付"),
                        cancelText: KyeeI18nService.get('appointment_regist_deti.knowIt', "取消"),
                        onSelect: function (res) {
                            if (res) {
                                ClinicPaymentReviseService.lastRootState = "appointment_regist_detil";
                                $state.go("clinic_payment_revise");
                            }
                        }
                    });
                }

                    //如果从确认预约、确认挂号、支付页面跳转过来，且支持取号方式提示则弹出取号方式信息
                    /*//begin 取号方式提示信息改进 By 高玉楼 KYEEAPPC-2799
                     if((AppointmentRegistDetilService.ROUTE_STATE == "regist_confirm"
                     ||AppointmentRegistDetilService.ROUTE_STATE == "regist_confirm"
                     ||AppointmentRegistDetilService.ROUTE_STATE == "payOrder")&&$scope.IS_SHOW_GET_TYPE==1)
                     {
                     $scope.showMsg();
                     }
                     //end 取号方式提示信息改进 By 高玉楼*/
                    // 院内导航图标是否显示 wangchengcheng 2015年12月25日13:10:43 APPCOMMERCIALBUG-1969
                    $scope.showNavigation = detilData.IS_SHOW_NAVIGATION == 1 ? true : false;

                    if($scope.CAN_SIGN && ($scope.SIGN_TYPE != '3' && $scope.SIGN_TYPE != '4' && $scope.SIGN_TYPE != '5')){

                        var hospitalLatAndLng = $scope.SIGN_RANGE.split('-');

                        var hosptail1Array = hospitalLatAndLng[0].split(',');
                        var radii = hospitalLatAndLng[1];
                        if(hosptail1Array.length>=2)
                        {
                            AppointmentAutoSignService.getlocation(function(userLng,userLat){
                                var distance=AppointmentAutoSignService.getGreatCircleDistance(hosptail1Array[1],hosptail1Array[0],userLat,userLng);
                                if(distance != -1) {
                                    if(distance<parseInt(radii)){
                                        if($scope.SIGN_TYPE_HOSPITAL == "0"){
                                            $scope.sign();
                                        }else{
                                            if ($scope.SIGN_TYPE != '3' && $scope.SIGN_TYPE != '4' && $scope.SIGN_TYPE != '5') {
                                                //$scope.showOverlay();
                                                //// 显示不返现签到提示框
                                                $scope.dialog = KyeeMessageService.dialog({
                                                    tapBgToClose : true,
                                                    template: "modules/business/appointment/views/delay_views/isSign.html",
                                                    scope: $scope,
                                                    title: KyeeI18nService.get("appointment_regist_deti.messageTitle", "提示"),
                                                    buttons: [
                                                        {
                                                            text: KyeeI18nService.get("appointment_regist_deti.sign", "就诊签到"),
                                                            style: 'button-size-l',
                                                            click: function () {
                                                                $scope.sign();
                                                                //点击知道了按钮后，就不显示弹窗
                                                                $scope.dialog.close();
                                                            }
                                                        }
                                                    ]
                                                });
                                            }

                                        }
                                    } else {
                                        AppointmentAutoSignService.recodeFailSign(3, "不在签到范围内", userLat, userLng,distance, radii);
                                    }
                                } else {
                                    AppointmentAutoSignService.recodeFailSign(2, "未获取到用户经纬坐标",0,0,0,0);
                                }
                            });

                        }
                    }
                  $scope.FeeType = 0;
                  $scope.oneFeeDetailTemp = [];
                  $scope.REG_FEE_REPLACE = detilData.REG_FEE_REPLACE;
                  $scope.Fee_Name = "挂号费用：";
                  if($scope.appointDetil.EXPENSE_DETAIL && $scope.appointDetil.EXPENSE_DETAIL.length == 1 && $scope.appointDetil['EXPENSE_DETAIL'][0]['feedesc'] != "建档费") {
                    $scope.Fee_Name = $scope.appointDetil['EXPENSE_DETAIL'][0]['feedesc'] + "：";
                    $scope.oneFeeDetailTemp = angular.copy($scope.appointDetil['EXPENSE_DETAIL']);
                    $scope.appointDetil.EXPENSE_DETAIL.splice(0, 1);
                  } else if($scope.appointDetil.EXPENSE_DETAIL && $scope.appointDetil.EXPENSE_DETAIL.length >1) {
                    $scope.Fee_Name = "支付费用：";
                  }else if($scope.REG_FEE_REPLACE){
                    $scope.REG_NAME_REPLACE = $scope.REG_FEE_REPLACE + "：";
                    $scope.FeeType = 1;
                  }
                  //handlerConsultData(detilData); //诊后咨询功能
                    handlerNewConsultData(detilData); //新版在线咨询功能
                }
            }, function(response){  //renniu KYEEAPPTEST-3721  2016年9月1日09:58:46
                if(response === "NETWORK_ERROR"){
                    KyeeMessageService.broadcast({
                        content: "加载失败，似乎网络出问题了！",
                        duration: 3000
                    });
                    return;
                }
                var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                if(hospitalInfo && !hospitalInfo.id){
                    KyeeMessageService.message({
                        content: "<p class='text-center'>医院正在维护，请稍后重试！</p>",
                        onOk: function(){
                            $state.go("myquyi->MAIN_TAB.medicalGuide");
                        }
                    });
                }
            });
        };
        //关闭不返现签到框
        $scope.closedialog = function(){
            $scope.dialog.close();
        };

        //监听进入当前页面
        KyeeListenerRegister.regist({
            focus: "appointment_regist_detil",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                $scope.showOutMap=false;
                $scope.appointDetil = null;
                $scope.STATUS_TYPE = null;
                //$scope.isShowChatWithDoctor = false;

                //初始化会诊所需的数据
                $scope.isConsulotion = AppointmentRegistDetilService.isConsulotion;

                var weiXinParams = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                if(weiXinParams && weiXinParams.wx_forward === "appointment_regist_detil"){
                    var record = {};
                    record.HOSPITAL_ID = decodeURI(weiXinParams.hospitalID);
                    record.REG_ID = decodeURI(weiXinParams.regId);
                    AppointmentRegistDetilService.RECORD =record;
                    var hospitalInfo =  CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                    if(weiXinParams.hospitalID==hospitalInfo.id){
                        refreshinit();
                    } else {
                        MyCareDoctorsService.queryHospitalInfo(weiXinParams.hospitalID, function(result){
                            // 切换医院
                            HospitalSelectorService.selectHospital(weiXinParams.hospitalID, result.HOSPITAL_NAME,
                                result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                                result.CITY_CODE, result.CITY_NAME, "医院正在切换中...", function () {
                                    refreshinit();
                                });
                        });
                    }
                }else{
                    refreshinit();
                }

                //统计页面展示次数
                OperationMonitor.record("countAppointDetailVisit", "appointment_regist_detil");
            }
        });
        //显示取号方式详情
        //$scope.showMsg = function () {
        //    KyeeMessageService.message({
        //        title:  KyeeI18nService.get("appointment_regist_deti.visitMessage","就诊提示"),
        //        content: $scope.appointDetil.MSG
        //    });
        //};
        //处理就诊提示信息
        dealVisitMsg=function(msg,ATTENTION_MATTERS){
            //包含条形码
            if(msg.indexOf('%a%')>-1){
                var e=new RegExp('%a%',"g");
                msg = msg.replace(e, '<span class="margin_bottom_list see_doctor_div qy-blue fw-500" ng-click="showCoderImg(barCodeUrl)">条形码</span>');
               // msg= msg.replace('%a%','<span class="margin_bottom_list see_doctor_div" ng-click="showCoderImg()">条形码</span>');
            }
            //包含二维码
            if(msg.indexOf('%b%')>-1){
                var e=new RegExp('%b%',"g");
                msg = msg.replace(e, '<span class="margin_bottom_list see_doctor_div qy-blue fw-500" ng-click="showCoderImg(qrCodeUrl)">二维码</span>');
               // msg= msg.replace('%b%','<span class="margin_bottom_list see_doctor_div" ng-click="showCoderImg()">二维码</span>');
            }
            //包含门诊编号
            if(msg.indexOf('%c%')>-1){
                var e=new RegExp('%c%',"g");
                msg = msg.replace(e, '<span class="margin_bottom_list see_doctor_div qy-blue fw-500" ng-click="showCoderImg(clinicbarCodeUrl,clinicbarCodeNum)">门诊编号</span>');
               // msg= msg.replace('%c%','<span class="margin_bottom_list see_doctor_div" ng-click="showCoderImg()">门诊编号</span>');
            }
            //包含身份证号
            if(msg.indexOf('%d%')>-1){
                var e=new RegExp('%d%',"g");
                msg = msg.replace(e, '<span class="margin_bottom_list see_doctor_div qy-blue fw-500" ng-click="showCoderImg(idNoqrCodeUrl,idNoqrCodeNum)">身份证号</span>');
            }
            if(msg.indexOf('（获取失败）')>-1){
                var e=new RegExp('（获取失败）',"g");
                msg = msg.replace(e, '<span class="margin_bottom_list see_doctor_div qy-blue fw-500" ng-click="showWarmmessage()">（获取失败）</span>');
            }
            if(msg.indexOf('（重发短信）')>-1){
                var e=new RegExp('（重发短信）',"g");
                msg = msg.replace(e, '<span class="margin_bottom_list see_doctor_div qy-blue fw-500" ng-click="getMessage()">（重发短信）</span>');
            }
            if(msg.indexOf('（短信已重发）')>-1){
                var e=new RegExp('（短信已重发）',"g");
                msg = msg.replace(e, '<span class="margin_bottom_list see_doctor_div qy-grey5 fw-500">（短信已重发）</span>');
            }
            $scope.appointDetilMSG=msg+ATTENTION_MATTERS;
            footerClick();
        };
      /*  zhankai = function(id){
            $timeout(
                function () {
                    $scope.element=document.getElementById(id).scrollHeight;
                    if($scope.element>50){
                        $scope.showMoreFlag=true;
                    }else{
                        $scope.showMoreFlag=false;
                    }
                },
                200
            );
        };*/
        //将html绑定的ng-clinic事件重新编译
         footerClick = function(){
            $timeout(
                function () {
                    var element=angular.element(document.getElementById("appointDetilMSG"));
                    element.html($scope.appointDetilMSG);
                    $compile(element.contents())($scope);
                },
                1000
            );
        };
        //将html绑定的ng-clinic事件重新编译
        footerClickWaryMsg = function(){
            $timeout(
                function () {
                    var element=angular.element(document.getElementById("WARN_MSG"));
                    element.html($scope.WARN_MSG_TEM);
                    $compile(element.contents())($scope);
                },
                1000
            );
        };
        //KYEEAPPC-4988 UI细节修改，预约失败，在结果页和预约挂号详情页，增加意见反馈话语，点击跳转到意见反馈  wangwan
        $scope.showHeadMesg = function () {
           /* KyeeMessageService.message({
                title:  KyeeI18nService.get("appointment_regist_deti.statusInfo","状态详情"),
                content: $scope.appointDetil.HANDLE_MESSAGE
            });*/
            if($scope.appointDetil.HANDLE_MESSAGE!=undefined&&
                $scope.appointDetil.HANDLE_MESSAGE!=""&&$scope.appointDetil.HANDLE_MESSAGE!=null){
                $scope.WARN_MSG='失败原因：'+$scope.appointDetil.HANDLE_MESSAGE;
            }else{
                $scope.WARN_MSG="";
            }
            $scope.SUGGESTION_MSG = $scope.appointDetil.APPOINT_FAIL_MSG;
            $scope.messdialog = KyeeMessageService.dialog({
                tapBgToClose : true,
                template: "modules/business/appointment/views/delay_views/warmPrompt.html",
                scope: $scope,
                title:  KyeeI18nService.get("appointment_regist_deti.messageTitle","温馨提示"),
                buttons: [
                    {
                        text:  KyeeI18nService.get("appointment_regist_deti.suggest","意见反馈"),
                        click: function () {
                            $scope.messdialog.close();
                            $state.go("aboutquyi_feedback");
                        }
                    },
                    {
                        text: KyeeI18nService.get("appointment_regist_deti.callPhone","拨打电话"),
                        style:'button-size-l',
                        click: function () {
                            $scope.messdialog.close();
                            KyeePhoneService.callOnly("4000801010");
                        }
                    }
                ]
            });
        };
        //显示条形码图片
        $scope.showCoderImg = function (CodeUrl,CodeNum) {

            $scope.codeUrl=CodeUrl;
            $scope.MES_NUMBER=CodeNum;
            $scope.overlayData.codeUrl=CodeUrl;
            $scope.overlayData.MES_NUMBER=CodeNum;
            $scope.showOverlay();
            //var dialog = KyeeMessageService.dialog({
            //    template: "modules/business/appointment/views/pictule_img.html",
            //    scope: $scope,
            //    buttons: [
            //        {
            //            text:  KyeeI18nService.get("appointment_regist_deti.cancel","取消"),
            //            click: function () {
            //                dialog.close();
            //            }
            //        }
            //    ]
            //});
        };
        //一倍大小图片
        $scope.oneSizeShow=function(){
            $scope.overlayData.imgWidht=1*230;
            $scope.overlayData.greenIndex=1;
        };
        //0.5倍大小图片
        $scope.twoSizeShow=function(){
            $scope.overlayData.imgWidht=0.5*230;
            $scope.overlayData.greenIndex=2;
        };
        //0.25倍大小图片
        $scope.threeSizeShow=function(){
            $scope.overlayData.imgWidht=0.25*230;
            $scope.overlayData.greenIndex=3;
        };
        //鼠标按下时
        //$scope.press = function () {
        //    $scope.pressed = true;
        //};
        //鼠标移动时
        //$scope.drag = function (event) {
        //    if ($scope.pressed) {
        //        //实时定位铃铛位置,18为高度的一半
        //        $scope.overlayData.bellTop = event.gesture.touches[0].clientY-125 ;
        //        //- 18;
        //        //20为宽度的一半
        //        $scope.overlayData.bellLeft = event.gesture.touches[0].clientX-125;
        //        //- 20;
        //    }
        //};
        //鼠标放开时
        //$scope.leave = function (event) {
        //    $scope.pressed = false;
        //    if ($scope.overlayData.bellTop <0) {
        //        $scope.overlayData.bellTop =0;
        //    } else if ($scope.overlayData.bellTop > window.innerHeight/2-200) {
        //        // 图片高度250px
        //        $scope.overlayData.bellTop = (window.innerHeight/2+50) - 250;
        //    }
        //    if ($scope.overlayData.bellLeft > window.innerWidth-250) {
        //        //250为图片宽度
        //        $scope.overlayData.bellLeft = window.innerWidth - 250;
        //    } else {
        //        $scope.overlayData.bellLeft = 0;
        //    }
        //    //将当前位置存入缓存
        //    //var bellImgPosition = {
        //    //    top: $scope.bellTop,
        //    //    left: $scope.bellLeft
        //    //};
        //    //storage.set('bellImgPosition', bellImgPosition);
        //    //设置弹出页面方向
        //    //if ($scope.bellLeft == 0) {
        //    //    $scope.msgDirection = 'left';
        //    //} else {
        //    //    $scope.msgDirection = 'right';
        //    //}
        //};
        //显示获取失败提示
        $scope.showWarmmessage=function(){
            $scope.WARN_MSG=$scope.WARN_MSG_data;
            $scope.SUGGESTION_MSG="";
            $scope.messdialog = KyeeMessageService.dialog({
                tapBgToClose : true,
                template: "modules/business/appointment/views/delay_views/warmPrompt.html",
                scope: $scope,
                title:  KyeeI18nService.get("appointment_regist_deti.messageTitle","温馨提示"),
                buttons: [
                    {
                        text:  KyeeI18nService.get("appointment_regist_deti.suggest","意见反馈"),
                        click: function () {
                            $scope.messdialog.close();
                            $state.go("aboutquyi_feedback");
                         }
                    },
                    {
                        text: KyeeI18nService.get("appointment_regist_deti.callPhone","拨打电话"),
                        style:'button-size-l',
                        click: function () {
                            $scope.messdialog.close();
                            KyeePhoneService.callOnly("4000801010");
                        }
                    }
                ]
            });
        };
        //短信重发  by gaomeng
        $scope.getMessage = function () {
            var messageParams={
                hospitalId: $scope.appointDetil.HOSPITAL_ID,
                regId: $scope.appointDetil.REG_ID
            };
            AppointmentRegistDetilService.reSendMsg(messageParams,function(data){
                var msg = $scope.appointDetil.MSG;
                if (data.success) {
                    if (data.message == "true") {
                        if (msg.indexOf('（重发短信）') > -1) {
                            var e=new RegExp('（重发短信）',"g");
                            msg = msg.replace(e, '<span>（短信已重发）</span>');
                            dealVisitMsg(msg, $scope.appointDetil.ATTENTION_MATTERS);
                        }
                    }
                    else{
                        getMessage();
                    }
                }else {
                    KyeeMessageService.broadcast({
                        content: data.message,
                        duration: 3000
                    });
                    getMessage();
                }
            });
        };

        //关闭提示窗口
        $scope.closemessdialog=function(){
            $scope.messdialog.close();
        };
        //跳转到医院外导航
        $scope.goToHospitalLocat = function () {
            OutNavigationService.hospitalId = $scope.appointDetil.HOSPITAL_ID;
            OutNavigationService.openNavigationOut();
            OperationMonitor.record("countHospitalLocal", "appointment_regist_detil");
        };
        //跳转到科室导航（院内导航）
        $scope.goToDeptLocat = function () {
            HospitalNavigationService.ROUTE_STATE = "appointment_regist_detil";
            // KYEEAPPC-3461 现版本院内导航接口 by 杜巍巍  begin
            HospitalNavigationService.lastClassName = "appointment_regist_detil";
            HospitalNavigationService.fixedPositionInfro = {
                HOSPITAL_ID: $scope.appointDetil.HOSPITAL_ID,
                DEPT_NAME: $scope.appointDetil.DEPT_NAME,
                //APPREQUIREMENT-1473  任妞  为多院区提供的一个参数
                HOSPITAL_AREA: $scope.appointDetil.EXTEND_FIELD.HOSPITAL_AREA
            };
            $state.go("hospital_navigation");
            // KYEEAPPC-3461 新版本院内导航接口 by 杜巍巍   end
            OperationMonitor.record("countGoToDeptLocat", "appointment_regist_detil");
        };
        //点击刷新按钮
        $scope.refreshBtn = function () {
            refreshinit();
            OperationMonitor.record("countRefresh", "appointment_regist_detil");
        };
        //点击预约转挂号
        $scope.appointToregist = function () {
            var appToregPara = {//吴伟刚 KYEEAPPC-4352 预约挂号详情页调整&预约转挂号提示
                hospitalId: $scope.appointDetil.HOSPITAL_ID,
                regId: $scope.appointDetil.REG_ID,
                userId: $scope.appointDetil.USER_ID,
                cRegId: $scope.appointDetil.C_REG_ID,
                markDesc: $scope.appointDetil.MARK_DESC,
                Amount: $scope.appointDetil.AMOUNT
             ///   postData: $scope.appointDetil
            };
            //获取缓存中医院信息
            var hospitalinfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            var isVerifyMedicalCard = hospitalinfo.is_appoint_to_regist_card_pwd;//挂号是否输入卡号，卡密码 0：不输入就诊卡号，密码 1：输入就诊卡号
            if(isVerifyMedicalCard=="1"){
                //预约转挂号需要输入卡号，密码对象
                $scope.isVerifyRegistMedicalCard = {
                    IN_CARDNO: $scope.appointDetil.CARD_NO,//无需存入缓存，现在如果挂号成功，后台会有机制将此卡号设置为默认卡号，下次会自动查询出来，前台无需处理  -张明
                    IN_CARDPWD: ""
                };
                inputCardPwd(appToregPara);
            }else{
                appointToregist(appToregPara);
            }
            $ionicScrollDelegate.$getByHandle("appointment_detail").scrollTop();
            OperationMonitor.record("countAppointToRegist", "appointment_regist_detil");
        };
         //预约转挂号请求  (增加就诊卡密码输入功能，将请求交互方法提出来，方便程序扩展  张明 KYEEAPPC-3020)
        var appointToregist=function(appToregPara){
            AppointmentRegistDetilService.appointToregist(appToregPara, function (data) {
                if (data.IS_PAY == '0') {
                    $state.go('appointment_result');
                } else {
                    var amount = parseFloat($scope.appointDetil.AMOUNT).toFixed(2);
                    $scope.AMOUNT = "¥" + amount;
                    $scope.appointDetil.AMOUNT = amount;
                    var paydata = $scope.appointDetil;
                    paydata["TRADE_NO"] = data.OUT_TRADE_NO;
                    paydata["isShow"] = data.isShow;
                    paydata["IS_OPEN_BALANCE"] = data.IS_OPEN_BALANCE;
                    paydata["USER_PAY_AMOUNT"] = data.USER_PAY_AMOUNT;
                    paydata["MARK_DETAIL"] = $scope.appointDetil.MARK_DESC;
                    paydata["ROUTER"] = "appointment_regist_detil";
                    paydata["flag"] = 2;//用于支付页面 取消支付的状态：1 挂号 2：预约转挂号 3预约缴费
                    paydata["C_REG_ID"]=$scope.appointDetil.C_REG_ID;
                    paydata["hospitalID"] = paydata.HOSPITAL_ID;
                    paydata["CARD_NO"] = $scope.appointDetil.CARD_NO;
                    paydata["CARD_TYPE"] = $scope.appointDetil.CARD_TYPE;
                    if(data.isSupportMerge==1){
                        paydata["AMOUNT"] = data.USER_PAY_AMOUNT;
                        amount=data.USER_PAY_AMOUNT;
                        data["PREFERENTIAL_FEE"]="";
                    }
                    var paydataNew = angular.copy(paydata);
                    paydataNew["MARK_DESC"] = KyeeI18nService.get("appointment_regist_deti.markDesc","挂号费");
                    var feeStr = data["PREFERENTIAL_FEE"];
                    $scope.zeroPay = parseFloat(paydata["USER_PAY_AMOUNT"]).toFixed(2);
                    var FEE;
                    if (feeStr) {
                        // wangchengcheng 2016年1月20日14:44:56 KYEEAPPC-4852
                        FEE = JSON.parse(feeStr);
                        paydataNew["PREFERENTIAL_LIST"]=FEE;
                    }
                    if($scope.zeroPay <= parseFloat(0.00)&&feeStr){
                        PayOrderService.payData = paydataNew;
                        KyeeMessageService.confirm({
                            content: $scope.castContent(FEE,amount),
                            onSelect: function (confirm) {
                                if (confirm) {
                                    AppointmentRegistDetilService.RECORD = {
                                        HOSPITAL_ID:paydata["hospitalID"],
                                        REG_ID: paydata["C_REG_ID"],
                                        handleNoPayFlag:"1"
                                    };
                                    AppointmentRegistDetilService.ROUTE_STATE = "appointment_regist_detil";
                                    CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,true);//进入预约挂号完成页比标志必须为true，用以标识用户默认勾选赠送的停诊险
                                    $state.go("appointment_result");
                                    return;
                                }else{

                                    $scope.cancelPayOrder();
                                    return;

                                }

                            }
                        });

                    }else{
                        PayOrderService.payData = paydataNew;
                        //0元支付不跳转到支付页面，直接跳转到结果页  by高萌  KYEEAPPC-5987
                        if(amount == 0.00&&$scope.zeroPay <= parseFloat(0.00)){
                            AppointmentRegistDetilService.RECORD = {
                                 HOSPITAL_ID:paydata["hospitalID"],
                                 REG_ID: paydata["C_REG_ID"],
                                 handleNoPayFlag:"1"
                            };
                            AppointmentRegistDetilService.ROUTE_STATE = "appointment_regist_detil";
                            CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,true);//进入预约挂号完成页比标志必须为true，用以标识用户默认勾选赠送的停诊险
                            $state.go("appointment_result");
                        }else
                        {
                            $state.go("payOrder");
                        }

                    }
                }
            })
        };
        //0元弹出框修改
        $scope.castContent=function (fee,amount) {
            var contentInfo="";
            for(var data in fee){
                contentInfo=contentInfo+fee[data].preferentialName+"：¥"+parseFloat(fee[data].preferentialFee).toFixed(2)+ "<br>"
            }
            contentInfo="挂号费：¥"+amount + "<br>"+contentInfo+"实际支付：¥0.00";
            return contentInfo;
        };
        //取消订单
        $scope.cancelPayOrder = function () {
            var data = PayOrderService.payData;
            //begin 取消订单合并  By  章剑飞  APPCOMMERCIALBUG-884
            PayOrderService.cancelPayOrder(function () {

                //跳转页面之后清除数据
                PayOrderService.payData = undefined;
            });
        }
        //预约转挂号确认界面输入就诊卡密码  张明  KYEEAPPC-3020
        var inputCardPwd = function (appToregPara) {
            var dialog = KyeeMessageService.dialog({
                template: "modules/business/appointment/views/delay_views/isVerifyMedicalCard.html",
                scope: $scope,
                title:  KyeeI18nService.get("appointment_regist_deti.isAppoint2RegistNo","预约转挂号就诊卡验证"),
                buttons: [
                    {
                        text:  KyeeI18nService.get("appointment_regist_deti.cancel","取消"),
                        click: function () {
                            dialog.close();
                        }
                    },
                    {
                        text: KyeeI18nService.get("appointment_regist_deti.isOk","确定"),
                        style:'button-size-l',
                        click: function () {
                            if (!$scope.isVerifyRegistMedicalCard.IN_CARDNO || !$scope.isVerifyRegistMedicalCard.IN_CARDPWD) {
                                KyeeMessageService.broadcast({
                                    content: KyeeI18nService.get("appointment_regist_deti.cardNotEmpty","就诊卡号或密码不能为空"),
                                    duration: 3000
                                });
                            } else {
                                dialog.close();
                                var psw = $scope.isVerifyRegistMedicalCard.IN_CARDPWD;
                                appToregPara["CARD_PWD"] = RsaUtilService.getRsaResult(psw);
                                appointToregist(appToregPara)
                            }
                        }
                    }
                ]
            });
        };
        //点击取消预约按钮
        $scope.appointCancel = function () {
            //该笔记录已购买停诊险
            if($scope.appointDetil.IS_SHOW_RISK_MSG == true) {
                var riskCanPara = {
                    hospitalId: AppointmentRegistDetilService.RECORD.HOSPITAL_ID,
                    regId: AppointmentRegistDetilService.RECORD.REG_ID
                };
                AppointmentRegistDetilService.riskAppointCancel(riskCanPara, function (data) {
                    if (data.data) {
                        $scope.RISK_CANCEL_MSG = data.data.RISK_CANCEL_MSG;
                        if($scope.RISK_CANCEL_MSG !=null && $scope.RISK_CANCEL_MSG !="" && $scope.RISK_CANCEL_MSG !=undefined && $scope.RISK_CANCEL_MSG !=" "){
                            $scope.SHOW_RISK_CANCEL_MSG = true;
                        }
                        cancleAppoint();
                    } else{
                        cancleAppoint();
                    }
                });
            }else{
                cancleAppoint();
            }
            OperationMonitor.record("countAppointCancel", "appointment_regist_detil");
        };
        //点击取消挂号按钮(取消预约转挂号)
        $scope.appToRegCancel = function () {
            $scope.isAppToRegCancel = true;
            //该笔记录已购买停诊险
            if($scope.appointDetil.IS_SHOW_RISK_MSG == true) {
                var riskCanPara = {
                    hospitalId: AppointmentRegistDetilService.RECORD.HOSPITAL_ID,
                    regId: AppointmentRegistDetilService.RECORD.REG_ID
                };
                AppointmentRegistDetilService.riskAppointCancel(riskCanPara, function (data) {
                    if (data.data) {
                        $scope.RISK_CANCEL_MSG = data.data.RISK_CANCEL_MSG;
                        if($scope.RISK_CANCEL_MSG !=null && $scope.RISK_CANCEL_MSG !="" && $scope.RISK_CANCEL_MSG !=undefined && $scope.RISK_CANCEL_MSG !=" "){
                            $scope.SHOW_RISK_CANCEL_MSG = true;
                        }
                        cancleAppointToRegist();
                    } else{
                        cancleAppointToRegist();
                    }
                });
            }else{
                cancleAppointToRegist();
            }
            OperationMonitor.record("countAppToRegCancel", "appointment_regist_detil");
        };

        var cancleAppoint=function(){
            $scope.CAN_SIGN = false;//赋值是为了不让签到弹框弹出,导致页面卡死
            $scope.SIGN_TYPE = '3';//赋值是为了不让签到弹框弹出,导致页面卡死
            // 取消预约需要延迟一定时间  高萌 2017年2月4日15:04:36  KYEEAPPC-9804
            if($scope.appointDetil.IS_CANCLE_APPOINT_DELAY == true){
                var regCanPara = {
                    hospitalId: AppointmentRegistDetilService.RECORD.HOSPITAL_ID,
                    regId: AppointmentRegistDetilService.RECORD.REG_ID,
                    cRegId: $scope.appointDetil.C_REG_ID
                };
                AppointmentRegistDetilService.appointCancelDelay(regCanPara, function (){
                    $scope.dialog = KyeeMessageService.dialog({
                        template: "modules/business/appointment/views/delay_views/cancleRecord.html",
                        scope: $scope,
                        title: KyeeI18nService.get("appointment_regist_deti.cancelmessage", "取消提示"),
                        buttons: [
                            {
                                text: KyeeI18nService.get("appointment_regist_deti.cancel", "取消"),
                                click: function () {
                                    $scope.dialog.close();
                                }
                            },
                            {
                                text: KyeeI18nService.get("appointment_regist_deti.isOk", "确定"),
                                style: 'button-size-l',
                                click: function () {
                                    $scope.dialog.close();
                                    var regCanPara = {
                                        hospitalId: AppointmentRegistDetilService.RECORD.HOSPITAL_ID,
                                        regId: AppointmentRegistDetilService.RECORD.REG_ID,
                                        cRegId: $scope.appointDetil.C_REG_ID
                                    };
                                    AppointmentRegistDetilService.appointCancel(regCanPara, function (){
                                        refreshinit();
                                        $ionicScrollDelegate.$getByHandle("appointment_detail").scrollTop();
                                    })
                                }
                            }
                        ]
                    });
                })
            }else{
                $scope.dialog = KyeeMessageService.dialog({
                    template: "modules/business/appointment/views/delay_views/cancleRecord.html",
                    scope: $scope,
                    title: KyeeI18nService.get("appointment_regist_deti.cancelmessage", "取消提示"),
                    buttons: [
                        {
                            text: KyeeI18nService.get("appointment_regist_deti.cancel", "取消"),
                            click: function () {
                                $scope.dialog.close();
                            }
                        },
                        {
                            text: KyeeI18nService.get("appointment_regist_deti.isOk", "确定"),
                            style: 'button-size-l',
                            click: function () {
                                $scope.dialog.close();
                                var regCanPara = {
                                    hospitalId: AppointmentRegistDetilService.RECORD.HOSPITAL_ID,
                                    regId: AppointmentRegistDetilService.RECORD.REG_ID,
                                    cRegId: $scope.appointDetil.C_REG_ID
                                };
                                AppointmentRegistDetilService.appointCancel(regCanPara, function (){
                                    refreshinit();
                                    $ionicScrollDelegate.$getByHandle("appointment_detail").scrollTop();
                                })
                            }
                        }
                    ]
                });
            }
        };

        var cancleAppointToRegist=function(){
            $scope.CAN_SIGN = false;//赋值是为了不让签到弹框弹出,导致页面卡死
            $scope.SIGN_TYPE = '3';//赋值是为了不让签到弹框弹出,导致页面卡死
            $scope.dialog = KyeeMessageService.dialog({
                template: "modules/business/appointment/views/delay_views/cancleRecord.html",
                scope: $scope,
                title: KyeeI18nService.get("appointment_regist_deti.cancelmessage", "取消提示"),
                buttons: [
                    {
                        text: KyeeI18nService.get("appointment_regist_deti.cancel", "取消"),
                        click: function () {
                            $scope.dialog.close();
                        }
                    },
                    {
                        text: KyeeI18nService.get("appointment_regist_deti.isOk", "确定"),
                        style: 'button-size-l',
                        click: function () {
                            $scope.dialog.close();
                            var regCanPara = {
                                hospitalId: $scope.appointDetil.HOSPITAL_ID,
                                regId: $scope.appointDetil.REG_ID
                            };
                            AppointmentRegistDetilService.appointToregistCancel(regCanPara, function (){
                                refreshinit();
                                $ionicScrollDelegate.$getByHandle("appointment_detail").scrollTop();
                            })
                        }
                    }
                ]
            });
        };


        //点击取消挂号按钮
        $scope.registCancel = function () {
            $scope.CAN_SIGN = false;//赋值是为了不让签到弹框弹出,导致页面卡死
            $scope.SIGN_TYPE = '3';//赋值是为了不让签到弹框弹出,导致页面卡死
            KyeeMessageService.confirm({
                title:  KyeeI18nService.get("appointment_regist_deti.cancelmessage","取消提示"),
                content:  KyeeI18nService.get("appointment_regist_deti.isCancelRegist","是否取消该挂号？"),
                onSelect: function (select) {
                    if (select) {
                        var regCanPara = {
                            hospitalId: $scope.appointDetil.HOSPITAL_ID,
                            regId: $scope.appointDetil.REG_ID,
                            cRegId: $scope.appointDetil.C_REG_ID,
                            userId: $scope.appointDetil.USER_ID
                        };
                       AppointmentRegistDetilService.registCancel(regCanPara, function (detilData) {
                            KyeeMessageService.broadcast({
                                content: detilData.message,
                                duration: 3000
                            });
                            refreshinit();
                        })
                    }
                }
            });
            $ionicScrollDelegate.$getByHandle("appointment_detail").scrollTop();
            OperationMonitor.record("countRegistCancel", "appointment_regist_detil");
        };
        //点击继续支付,预约后支付
        $scope.goToPayNew = function(){
            if($scope.appointDetil.CONSULTATION_FLAG!=null&&$scope.appointDetil.CONSULTATION_FLAG!=''&&$scope.appointDetil.CONSULTATION_FLAG!=undefined){
                $scope.WARN_MSG = $scope.appointDetil.CONSULTATION_FEE_TIPS;
                if($scope.WARN_MSG!=null&&$scope.WARN_MSG!=undefined&&$scope.WARN_MSG!=''){
                    var dialog = KyeeMessageService.dialog({
                        tapBgToClose : true,
                        template: "modules/business/appointment/views/delay_views/warmPrompt.html",
                        scope: $scope,
                        title:"知情同意书",
                        buttons: [
                            {
                                text: "取消",
                                click: function () {
                                    dialog.close();
                                }
                            },
                            {
                                text:  "确认",
                                style:'button-size-l',
                                click: function () {
                                    dialog.close();
                                    $scope.goToPay();
                                }
                            }
                        ]
                    });
                }else{
                    $scope.goToPay();
                }

            }else{
                $scope.goToPay();
            }
        };
        //点击继续支付,预约后支付
        $scope.goToPay = function () {
            if($scope.SHOW_SELECT_CARD){
                if($scope.patientCard.CARD_NO=="-1"||$scope.patientCard.CARD_NO==""){
                    var isCreateCard = "1";
                }else{
                    QueryHisCardService.updateCardByUserVsId(function () {
                    }, $scope.appointDetil.USER_VS_ID, $scope.patientCard.CARD_NO, $scope.appointDetil.HOSPITAL_ID,true);
                    var isCreateCard = "0";
                }
               $scope.patientId = $scope.PATIENT_ID;
            }else{
                $scope.patientId =    $scope.appointDetil.PATIENT_ID
            }
            var toPayPara = {
                hospitalId: $scope.appointDetil.HOSPITAL_ID,
                patientId: $scope.patientId,
                userId: $scope.appointDetil.USER_ID,
                cRegId: $scope.appointDetil.C_REG_ID,
                markDesc: $scope.appointDetil.MARK_DESC,
                Amount: $scope.appointDetil.AMOUNT,
            //    postData: $scope.appointDetil
                CARD_NO: $scope.patientCard.CARD_NO,
                CARD_PWD: AppointmentCreateCardService.password,
                IS_CREATE_CARD:isCreateCard
            };
            AppointmentRegistDetilService.goToPay(toPayPara, function (data) {
                var amount = parseFloat($scope.appointDetil.AMOUNT).toFixed(2);
                $scope.AMOUNT = "¥" + amount;
                var paydata = $scope.appointDetil;
                paydata["TRADE_NO"] = data.OUT_TRADE_NO;
                paydata["MARK_DETAIL"] = $scope.appointDetil.MARK_DESC;
                //如果电话预约支付，在支付页面不显示剩余时间
                if(!$scope.SHOW_SELECT_CARD){
                    paydata["APPOINT_SUCCESS_PAY"] = 1;
                }
                paydata["ROUTER"] = "appointment_regist_detil";
                paydata["REMAIN_SECONDS"] = data.REMAIN_SECONDS;
                //新增倒计时截止时间  edit by 高萌  2017年3月10日11:46:21
                var now = new Date();
                var payDeadLine= new Date(now.getTime()+data.REMAIN_SECONDS*1000);
                paydata["PAY_DEADLINE"] = payDeadLine;//支付截止时间
                //end by
                paydata["flag"] = 3;//用于支付页面 取消支付的状态：1 挂号 2：预约转挂号 3预约缴费
                paydata["isShow"]=data.isShow;
                paydata["IS_OPEN_BALANCE"]=data.IS_OPEN_BALANCE;
                paydata["USER_PAY_AMOUNT"]=data.USER_PAY_AMOUNT;
                paydata["C_REG_ID"]=$scope.appointDetil.C_REG_ID;
                paydata["CARD_NO"] = data.CARD_NO;
                paydata["CARD_TYPE"] = data.CARD_TYPE;
                paydata["hospitalID"] = paydata.HOSPITAL_ID;
                if(data.isSupportMerge==1){
                    paydata["AMOUNT"] = data.USER_PAY_AMOUNT;
                    amount=data.USER_PAY_AMOUNT;
                    data["PREFERENTIAL_FEE"]="";
                }
                // wangchengcheng 2016年1月20日14:44:56 KYEEAPPC-4852
                var paydataNew = angular.copy(paydata);
                paydataNew["MARK_DESC"] = KyeeI18nService.get("appointment_regist_deti.markDesc","挂号费");
                PayOrderService.payData = paydataNew;
                //gch
                var feeStr = data["PREFERENTIAL_FEE"];
                $scope.zeroPay = parseFloat(paydata["USER_PAY_AMOUNT"]).toFixed(2);
                var FEE;
                if (feeStr) {
                    FEE = JSON.parse(feeStr);
                    paydataNew["PREFERENTIAL_LIST"]=FEE;
                }
                if($scope.zeroPay <= parseFloat(0.00)&&feeStr){
                    PayOrderService.payData = paydataNew;
                    KyeeMessageService.confirm({
                        content: $scope.castContent(FEE,amount),
                        onSelect: function (confirm) {
                            if (confirm) {
                                AppointmentRegistDetilService.RECORD = {
                                    HOSPITAL_ID: paydata["hospitalID"],
                                    REG_ID: paydata["C_REG_ID"],
                                    handleNoPayFlag:"1"
                                };
                                AppointmentRegistDetilService.ROUTE_STATE = "appointment_regist_deti";
                                CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,true);//进入预约挂号完成页比标志必须为true，用以标识用户默认勾选赠送的停诊险
                                $state.go("appointment_result");
                                return;
                            }else{

                                $scope.cancelPayOrder();
                                return;

                            }

                        }
                    });

                }else{
                    PayOrderService.payData = paydataNew;
                    //0元支付不跳转到支付页面，直接跳转到结果页  by高萌  KYEEAPPC-5987
                    if(amount == 0.00&&$scope.zeroPay <= parseFloat(0.00)){
                        AppointmentRegistDetilService.RECORD = {
                            HOSPITAL_ID: paydata["hospitalID"],
                            REG_ID: paydata["C_REG_ID"],
                            handleNoPayFlag:"1"
                        };
                        AppointmentRegistDetilService.ROUTE_STATE = "appointment_regist_deti";
                        CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,true);//进入预约挂号完成页比标志必须为true，用以标识用户默认勾选赠送的停诊险
                        $state.go("appointment_result");
                    }else
                    {
                        $state.go("payOrder");
                    }
                }
            });
            OperationMonitor.record("countGoToPay", "appointment_regist_detil");
        };
        //begin 先挂号后交费 By 高玉楼 KYEEAPPC-2677
        $scope.goToPayRegist=function(){
            if($scope.SHOW_SELECT_CARD){
                //在点击确认预约、确认挂号时，发请求去后台更新默认卡   wangwan KYEEAPPC-4470
                if($scope.patientCard.CARD_NO=="-1"||$scope.patientCard.CARD_NO==""){
                    var isCreateCard = "1";
                }else{
                    QueryHisCardService.updateCardByUserVsId(function () {
                    }, $scope.appointDetil.USER_VS_ID, $scope.patientCard.CARD_NO, $scope.appointDetil.HOSPITAL_ID,true);
                    var isCreateCard = "0";
                }
                $scope.patientId = $scope.PATIENT_ID;
            }else{
                $scope.patientId = $scope.appointDetil.PATIENT_ID;
            }
            var toPayPara = {
                HOSPITAL_ID: $scope.appointDetil.HOSPITAL_ID,
                C_REG_ID: $scope.appointDetil.C_REG_ID,

                PATIENT_ID: $scope.patientId,
                CARD_NO: $scope.patientCard.CARD_NO,//
                CARD_PWD: AppointmentCreateCardService.password,
                IS_CREATE_CARD:isCreateCard
            };
            AppointmentRegistDetilService.goToPayRegist(toPayPara, function (data) {
                var amount = parseFloat($scope.appointDetil.AMOUNT).toFixed(2);
                $scope.AMOUNT = "¥" + amount;
                var paydata = $scope.appointDetil;
                paydata["HOSPITAL_ID"]= $scope.appointDetil.HOSPITAL_ID;
                paydata["TRADE_NO"] = data.OUT_TRADE_NO;
                paydata["MARK_DETAIL"] = $scope.appointDetil.MARK_DESC;
                //如果电话预约支付，在支付页面不显示剩余时间
                if(!$scope.SHOW_SELECT_CARD){
                    paydata["APPOINT_SUCCESS_PAY"] = 1;
                }
                paydata["ROUTER"] = "appointment_regist_detil";
                paydata["REMAIN_SECONDS"] = data.REMAIN_SECONDS;
                //新增倒计时截止时间  edit by 高萌  2017年3月10日11:46:21
                var now = new Date();
                var payDeadLine= new Date(now.getTime()+data.REMAIN_SECONDS*1000);
                paydata["PAY_DEADLINE"] = payDeadLine;//支付截止时间
                //end by
                paydata["flag"] = 4;//用于支付页面 取消支付的状态：1 挂号 2：预约转挂号 3预约缴费 4挂号缴费
                paydata["isShow"]=data.isShow;
                paydata["IS_OPEN_BALANCE"]=data.IS_OPEN_BALANCE;
                paydata["USER_PAY_AMOUNT"]=data.USER_PAY_AMOUNT;
                paydata["C_REG_ID"]=$scope.appointDetil.C_REG_ID;
                paydata["hospitalID"] = paydata.HOSPITAL_ID;
                if(data.isSupportMerge==1){
                    paydata["AMOUNT"] = data.USER_PAY_AMOUNT;
                    amount=data.USER_PAY_AMOUNT;
                    data["PREFERENTIAL_FEE"]="";
                }
                // wangchengcheng 2016年1月20日14:44:56 KYEEAPPC-4852
                var paydataNew = angular.copy(paydata);
                paydataNew["MARK_DESC"] = KyeeI18nService.get("appointment_regist_deti.markDesc","挂号费");
                PayOrderService.payData = paydataNew;
                //gch
                var feeStr = data["PREFERENTIAL_FEE"];
                $scope.zeroPay = parseFloat(paydata["USER_PAY_AMOUNT"]).toFixed(2);
                var FEE;
                if (feeStr) {
                    //var FEE = JSON.parse(feeStr);
                    FEE = feeStr;
                    paydataNew["PREFERENTIAL_LIST"]=FEE;
                }
                if($scope.zeroPay <= parseFloat(0.00)&&feeStr){
                    PayOrderService.payData = paydataNew;
                    KyeeMessageService.confirm({
                        content: $scope.castContent(FEE,amount),
                        onSelect: function (confirm) {
                            if (confirm) {
                                AppointmentRegistDetilService.RECORD = {
                                    HOSPITAL_ID: paydata["hospitalID"],
                                    REG_ID: paydata["C_REG_ID"],
                                    handleNoPayFlag:"1"
                                };
                                AppointmentRegistDetilService.ROUTE_STATE = "appointment_regist_detil";
                                CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,true);//进入预约挂号完成页比标志必须为true，用以标识用户默认勾选赠送的停诊险
                                $state.go("appointment_result");
                                return;
                            }else{

                                $scope.cancelPayOrder();
                                return;

                            }

                        }
                    });

                }else{
                    PayOrderService.payData = paydataNew;
                    //0元支付不跳转到支付页面，直接跳转到结果页  by高萌  KYEEAPPC-5987
                    if(amount == 0.00&&$scope.zeroPay <= parseFloat(0.00)){
                        AppointmentRegistDetilService.RECORD = {
                            HOSPITAL_ID: paydata["hospitalID"],
                            REG_ID: paydata["C_REG_ID"],
                            handleNoPayFlag:"1"
                        };
                        AppointmentRegistDetilService.ROUTE_STATE = "appointment_regist_detil";
                        CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,true);//进入预约挂号完成页比标志必须为true，用以标识用户默认勾选赠送的停诊险
                        $state.go("appointment_result");
                    }else
                    {
                        $state.go("payOrder");
                    }
                }

            });
            OperationMonitor.record("countGoToPayRegist", "appointment_regist_detil");
        };
        //电话预约点击支付
        $scope.goToPayTel=function(type){
            if (!$scope.patientCard.CARD_NO && !$scope.placeholder) {//吴伟刚 KYEEAPPC-4349 确认页面的就诊卡相关优化？取消预约挂号时弹出询问框
                AppointConfirmService.choosePatientIdCardCheck();
                //end 前端校验阻塞后发送请求 By 高玉楼
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("appointment_regist_deti.noCard","请选择就诊卡")
                });
                return;
            }

            if (!$scope.patientCard.CARD_SHOW) {
                AppointConfirmService.inputOrChoosePatientIdCardCheck();
                //end 前端校验阻塞后发送请求 By 高玉楼
                KyeeMessageService.broadcast({//吴伟刚 KYEEAPPC-4349 确认页面的就诊卡相关优化？取消预约挂号时弹出询问框
                    content: KyeeI18nService.get("appointment_regist_deti.inputCardtoAppoint","请输入就诊卡号")
                });
                return;
            }
            if(type==1){
                //挂号
                $scope.goToPayRegist();
            }else{
                //预约
                $scope.goToPay();
            }

        };
        //begin 药事费明细中冒号改进为中文全角冒号 By 高玉楼 KYEEAPPTEST-2819
        //begin 药事服务费 By 高玉楼 KYEEAPPC-2789
        //挂号费明细查看
        $scope.showRegistCostMsg=function()
        {
            var regFeeStr='',diagFeeStr = '',pharmacyFeeStr='';
            //挂号费
            if(!$scope.appointDetil.REG_FEE)
            {
                regFeeStr = '';
            }
            else
            {
                regFeeStr= KyeeI18nService.get("appointment_regist_deti.REG_FEE","挂号费：¥")+ $scope.appointDetil.REG_FEE;
            }
            //诊疗费
            if (!$scope.appointDetil.DIAG_FEE) {
                diagFeeStr = "";
            } else {
                diagFeeStr = KyeeI18nService.get("appointment_regist_deti.DIAG_FEE","<br>诊疗费：¥")+ $scope.appointDetil.DIAG_FEE;
            }
            //药事费
            if (!$scope.appointDetil.PHARMACY_FEE) {
                pharmacyFeeStr = "";
            } else {
                pharmacyFeeStr =  KyeeI18nService.get("appointment_regist_deti.PHARMACY_FEE","<br>药事费：¥")+ $scope.appointDetil.PHARMACY_FEE;
            }
            KyeeMessageService.message({
                title: KyeeI18nService.get("appointment_regist_deti.registAmount","挂号费明细"),
                content:regFeeStr+pharmacyFeeStr+diagFeeStr
            });
        };
        //end 要药事服务费 By 高玉楼
        //end 药事费明细中冒号改进为中文全角冒号 By 高玉楼
        //是否有底边
        // wangchengcheng KYEEAPPC-3991 2015年12月18日16:50:04
        $scope.hasFooter = function () {
            //begin 先挂号后交费 By 高玉楼 KYEEAPPC-2677
            if (
                ($scope.IS_SHOW_BUTTON == 1 && $scope.BUTTON_ACTION == 2) ||
                ($scope.IS_SHOW_CANCEL == 1 && $scope.CANCEL_ACTION == 0) ||
                ($scope.IS_SHOW_BUTTON == 1 && ($scope.BUTTON_ACTION == 0||$scope.BUTTON_ACTION == 1)) ||
                ($scope.IS_SHOW_REFRESH == 1) ||
                ($scope.IS_SHOW_CANCEL == 1 && $scope.CANCEL_ACTION == 1) || ($scope.IS_SHOW_CANCEL == 1 && $scope.CANCEL_ACTION == 2)||
                ($scope.IS_SHOW_REAPPOINT)||($scope.IS_SHOW_AGAIN_APPOINT)||
                ($scope.IS_SHOW_CANCEL==1 && ($scope.CANCEL_ACTION==10 || $scope.CANCEL_ACTION==20))||
                ($scope.IS_SHOW_CANCEL==1 && ($scope.CANCEL_ACTION==11 || $scope.CANCEL_ACTION==21))||
                ($scope.IS_SHOW_CANCEL==1 && ($scope.CANCEL_ACTION==12 || $scope.CANCEL_ACTION==22))||
                $scope.SHOW_TEL_APPOINT_PAY!='0'||$scope.SHOW_TEL_REGIST_PAY!='0' ||
                ($scope.IS_SHOW_CANCEL !=1 && $scope.SHOW_COMMENT)){
                    if (!$scope.isConsulotion) {
                        return true;
                    }else if($scope.isConsulotion && $scope.appointDetil.TYPE==0
                        && ($scope.appointDetil.APPOINT_TYPE==1||$scope.appointDetil.APPOINT_TYPE==2)){
                        return false;
                    }else{
                        return true;
                    }
                }
            //end 先挂号后交费 By 高玉楼
            return false
        };
        //取消订单（预约后支付）
        $scope.cancelAppointOrder = function(){
            AppointmentRegistDetilService.cancelAppointOrder($scope.appointDetil,function(){
                //请求成功后刷新页面
                refreshinit();
                if (timer != undefined) {
                    KyeeUtilsService.cancelInterval(timer);
                }
            });
            OperationMonitor.record("countCancelAppointOrder", "appointment_regist_detil");
        };

        /**
         * 取消订单（挂号后支付）
         * KYEEAPPC-11027
         */
        $scope.cancelRegisterOrder = function(){
            AppointmentRegistDetilService.cancelRegisterOrder($scope.appointDetil,function(){
                //请求成功后刷新页面
                refreshinit();
                if (timer != undefined) {
                    KyeeUtilsService.cancelInterval(timer);
                }
            });
            OperationMonitor.record("countCancelAppointOrder", "appointment_regist_detil");
        };

        //重新预约
        $scope.reappoint = function (appointDetil) {
            var deptData = {};
            deptData.DEPT_CODE = appointDetil.DEPT_CODE;
            deptData.DEPT_NAME = appointDetil.DEPT_NAME;
            deptData.IS_ONLINE = appointDetil.IS_ONLINE;
            AppointmentRegistListService.reappoint(deptData,appointDetil.HOSPITAL_ID,function(reappointData){
                if(reappointData.CAN_AGAIN_APPOINT ){
                    MyCareDoctorsService.queryHospitalInfo(appointDetil.HOSPITAL_ID, function(result){
                        // 切换医院
                        HospitalSelectorService.selectHospital(appointDetil.HOSPITAL_ID, result.HOSPITAL_NAME,
                            result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                            result.CITY_CODE, result.CITY_NAME, "医院正在切换中...", function () {
                                AppointmentDeptGroupService.SELECT_DEPTGROUPDATA=appointDetil;
                                //跳到医生列表页，将科室放入
                                AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptData;
                                $state.go('appointment_doctor');
                            });
                    });
                }else{
                    KyeeMessageService.message({
                        content:reappointData.AGAIN_MESSAGE
                    });
                    //提示此科室不可用了或者此科室IS_ONLINE变化
                }
            });
            OperationMonitor.record("countReappoint", "appointment_regist_detil");
        };
        //再次预约
        $scope.againAppoint = function (appointDetil) {
            var deptData = {};
            deptData.DEPT_CODE = appointDetil.DEPT_CODE;
            deptData.DEPT_NAME = appointDetil.DEPT_NAME;
            deptData.IS_ONLINE = appointDetil.IS_ONLINE;
            AppointmentRegistListService.againAppoint(deptData,appointDetil.HOSPITAL_ID,appointDetil.DOCTOR_CODE,function(againAppointData){
                if(againAppointData.CAN_AGAIN_APPOINT){

                        MyCareDoctorsService.queryHospitalInfo(appointDetil.HOSPITAL_ID, function(result){
                            // 切换医院
                            HospitalSelectorService.selectHospital(appointDetil.HOSPITAL_ID, result.HOSPITAL_NAME,
                                result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                                result.CITY_CODE, result.CITY_NAME, "医院正在切换中...", function () {
                                    AppointmentDoctorDetailService.doctorInfo=appointDetil;
                                    //跳到医生列表页，将科室放入
                                    AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptData;
                                    $state.go('doctor_info');
                                });
                        });

                }else{
                    KyeeMessageService.message({
                        content: againAppointData.AGAIN_MESSAGE
                    });
                    //提示没有此科室或者科室IS_online变化
                }
            });
            OperationMonitor.record("countAgainAppoint", "appointment_regist_detil");
        }
        // 线下取消 edit by caochen 任务号：KYEEAPPC-4364
        $scope.offlineCancel = function () {
            if(!$scope.CANCEL_WARN_MSG){
                var regCanPara = {
                    hospitalId: $scope.appointDetil.HOSPITAL_ID,
                    regId: $scope.appointDetil.REG_ID,
                    cancelAction:$scope.appointDetil.CANCEL_ACTION
                };
                AppointmentRegistDetilService.offlineCancel(regCanPara, function (detilData) {
                    KyeeMessageService.broadcast({
                        content: detilData.message,
                        duration: 3000
                    });
                    refreshinit();
                })
            } else{
                KyeeMessageService.confirm({
                    title:  KyeeI18nService.get("appointment_regist_deti.cancelmessage","取消提示"),
                    content:  $scope.CANCEL_WARN_MSG,
                    onSelect: function (select) {
                        if (select) {
                            var regCanPara = {
                                hospitalId: $scope.appointDetil.HOSPITAL_ID,
                                regId: $scope.appointDetil.REG_ID,
                                cancelAction:$scope.appointDetil.CANCEL_ACTION
                            };
                            AppointmentRegistDetilService.offlineCancel(regCanPara, function (detilData) {
                                KyeeMessageService.broadcast({
                                    content: detilData.message,
                                    duration: 3000
                                });
                                refreshinit();
                            })
                        }
                    }
                });
            }

            $ionicScrollDelegate.$getByHandle("appointment_detail").scrollTop();
            OperationMonitor.record("countOfflineCancel", "appointment_regist_detil");
        };
        $scope.gofeedback = function () {
            if($scope.dialog){
                $scope.dialog.close();
            }
            AboutQuyiService.getNetParams(function (CUSTOMER_NUMBERS) {
                $state.go("aboutquyi_feedback");
            });
            //统计意见反馈各入口点击数量  by 高萌  KYEEAPPC-5534
            OperationMonitor.record("aboutquyi_feedback", "appointRegistDetail");
        };
        $scope.click2call = function () {
            KyeePhoneService.callOnly("4000801010");
        };

        $scope.goToRefund = function(appointDetil){
            if(appointDetil.PAY_STATUS!=4 && appointDetil.PAY_STATUS!=5){
                return;
            }
            MyRefundDetailNewService.OUT_TRADE_NO=appointDetil.TRADE_ORDER_NO;
            $state.go('refund_detail_new');

        }
        // 判断当前浏览器是否是微信浏览器
        function isWeiXin(){
            var ua = window.navigator.userAgent.toLowerCase();
            if(ua.match(/MicroMessenger/i) == 'micromessenger'){
                return true;
            }else{
                return false;
            }
        }
        // gaomeng  KYEEAPPC-6416 查看我的保单详情  2016年6月19日17:03:06
        $scope.goToRiskMsg = function(){
            var riskUrl = $scope.appointDetil.RISK_URL;
            if(isWeiXin()){
                riskUrl = $scope.appointDetil.RISK_URL_WEIXIN;
            }
            var riskSign = KyeeUtilsService.SecurityUtils.md5(riskUrl);
            riskUrl = riskUrl+"&riskSign="+riskSign;
            AboutQuyiService.webUrl = riskUrl;
            if(window.device && device.platform == "iOS"){
                var cache = CacheServiceBus.getMemoryCache();
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_VIEW_ROUTER, "appointment_regist_detil");
                window.open(riskUrl,"_blank","location=yes");
            }else{
                $state.go("risk_web_url");
            }
            OperationMonitor.record("RiskMessage", "appointment_regist_detil", true);
        };
        //修改就诊卡输入框中的内容
        $scope.inputCardNo = function () {
            //将患者输入的卡号作为预约卡号
            $scope.patientCard.CARD_NO = $scope.patientCard.CARD_SHOW;
            //清空PATIENT_ID
            $scope.PATIENT_ID = '';
        };
        $scope.showChardNoInf = function(){

            $scope.userMessage =KyeeI18nService.get("appoint_confirm.cardNoinfo","就诊卡是医院存储您就诊卡资料的磁性卡，是您与医院挂号，付款等交互的唯一实体凭据（某些地区可由医保卡代替），由于医疗的特殊和保密性需要，每家医院的就诊卡不通用。为保证您的挂号等操作的顺利进行，请正确填选您正在使用的就诊卡。没有就诊卡的患者，请到您就诊的医院凭个人身份证办理就诊卡。");
            var dialog = KyeeMessageService.dialog({
                template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                scope: $scope,
                title:KyeeI18nService.get("appoint_confirm.messageTitle","温馨提示"),
                buttons: [
                    {
                        text:  KyeeI18nService.get("appoint_confirm.isOk","确定"),
                        style:'button-size-l',
                        click: function () {
                            dialog.close();
                        }
                    }
                ]
            });
            OperationMonitor.record("countShowChardNoInf", "appointment_regist_detil");
        };
        //点击选择就诊卡
        $scope.showpatientCardNo = function () {
            //begin  当用户未邦卡时默认跳转到申请新卡页面 By 高玉楼 KYEEAPPC-2917
            if (!$scope.pickerItems.length) {
                MyCareDoctorsService.queryHospitalInfo($scope.appointDetil.HOSPITAL_ID, function(result){
                    // 切换医院
                    HospitalSelectorService.selectHospital($scope.appointDetil.HOSPITAL_ID, result.HOSPITAL_NAME,
                        result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                        result.CITY_CODE, result.CITY_NAME, "医院正在切换中...", function () {
                            //KYEEAPPC-4733 确认挂号跳选卡界面是否展示虚拟卡标识  wangwan 2016年1月6日11:01:43
                            PatientCardService.filteringVirtualCard.isFilteringVirtual=$scope.virtualSupportType;
                            $state.go("patient_card_select");
                        });
                });
            } else {
                $scope.title = "请选择就诊卡";
                //调用显示
                $scope.showPicker($scope.patientCard.CARD_NO);
            }
            //end 当用户未邦卡时默认跳转到申请新卡页面 By 高玉楼
            OperationMonitor.record("countPatientCardNo", "appointment_regist_detil");
        };
        $scope.bind = function (params) {
            $scope.showPicker = params.show;
        };
        //选择卡号
        $scope.selectItem = function (params) {
            $scope.patientCard.CARD_SHOW = params.item.text;//展示值
            //edit by wangwan 任务号:APPCOMMERCIALBUG-1744 一个patient_id对应多个就诊卡，预约时无法选择就诊卡，因此将CARD_NO作为唯一属性。
            $scope.patientCard.CARD_NO = params.item.value;//唯一属性
            $scope.PATIENT_ID = params.item.value2;//第二属性
            $scope.Card_Type = params.item.value3;//第三属性
            //申请新卡则不进行选卡操作
            if ($scope.PATIENT_ID != -1) {

            } else if ('input' === $scope.Clientinfo.REMOTE_BUILD_CARD) {
                AppointmentCreateCardService.confirmScope = $scope;
                $state.go('create_card_info');
            }
        };
        //详情页增加去点评按钮， zhoushiyu KYEEAPPC-8008
        $scope.goToComment = function(params) {
            AppointmentRegistListService.goToComment(params);
        };

	    /**
	     * 根据返回的数据处理诊后咨询功能
	     */
	    function handlerConsultData(response){
	    	//医院开启诊后咨询功能并且医生容联账号存在才展示诊后咨询功能
		    if (response.isConsultOpen && response.consultData){
			    $scope.isShowConsult = true;
			    $scope.canClickConsult = false;
			    //预约成功或者是预约转挂号成功或者是挂号成功的状态下'诊后咨询'功能才可能能使用
                var appointType = parseInt(response.APPOINT_TYPE);
			    if (appointType === 1 || appointType === 5 || parseInt(response.REGIST_TYPE) === 1){
				    var visitStatus = response.VISIT_STATUS;
                    //就诊状态为2 或者是后端根据时间判断的已就诊 就诊咨询方可点击
				    $scope.canClickConsult = (parseInt(visitStatus) === 2 || response.visited);
			    }
			    $scope.canNotClickConsult = !$scope.canClickConsult;

                var doc = response.consultData;
                $scope.consultData = {
                    doctorInfo: {
                        userPetname: doc.doctorName,
                        userPhoto: doc.doctorPhoto,
                        sex: doc.doctorSex,
                        rlUser: doc.rlUser,
                        scDoctorId: doc.scDoctorId
                    },
                    customPatient: {
                        userVsId: response.USER_VS_ID,
                        idNo: response.ID_NO,
                        visitName: response.PATIENT_NAME,
                        phone: response.PHONE_NUMBER
                    }
                };
		    } else {
			    $scope.isShowConsult = false;
            }
	    };

	    //预约挂号成功后进行新版在线咨询
        function handlerNewConsultData(response){
            //医院开启预约挂号成功后进行新版在线咨询功能并且医生容联账号存在且开通在线咨询功能才展示咨询医生功能
            if (response.isConsultOpen && response.consultNewData){
                $scope.canClickConsult = false;
                //预约成功或者是预约转挂号成功或者是挂号成功的状态下'咨询医生'功能才可能能使用
                var appointType = parseInt(response.APPOINT_TYPE);
                if (appointType === 1 || appointType === 5 || parseInt(response.REGIST_TYPE) === 1){
                    //该医生开通在线咨询功能'咨询医生'方可点击
                    $scope.isShowConsult = true;
                    $scope.canClickConsult = response.visited;
                }
                $scope.canNotClickConsult = !$scope.canClickConsult;

                var doc = response.consultNewData;
                $scope.consultData = {
                    doctorInfo: {
                        userPetname: doc.doctorName,
                        userPhoto: doc.doctorPhoto,
                        sex: doc.doctorSex,
                        rlUser: doc.rlUser,
                        scDoctorId: doc.scDoctorId
                    },
                    customPatient: {
                        userVsId: response.USER_VS_ID,
                        idNo: response.ID_NO,
                        visitName: response.PATIENT_NAME,
                        phone: response.PHONE_NUMBER
                    }
                };
            } else {
                $scope.isShowConsult = false;
            }
        };

        //新版咨询医生
        $scope.goToConsultNewDoctor = function (appointDetil) {
            var deptData = {};
            deptData.DEPT_CODE = appointDetil.DEPT_CODE;
            deptData.DEPT_NAME = appointDetil.DEPT_NAME;
            deptData.IS_ONLINE = appointDetil.IS_ONLINE;
            MyCareDoctorsService.queryHospitalInfo(appointDetil.HOSPITAL_ID, function(result){
                // 切换医院
                HospitalSelectorService.selectHospital(appointDetil.HOSPITAL_ID, result.HOSPITAL_NAME,
                    result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                    result.CITY_CODE, result.CITY_NAME, "医院正在切换中...", function () {
                        AppointmentDoctorDetailService.doctorInfo=appointDetil;
                        //跳到医生列表页，将科室放入
                        AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptData;
                        AppointmentDoctorDetailService.activeTab = 1;
                        $state.go('doctor_info');
                    });
            });
            OperationMonitor.record("countAppointDetailToDoctorInfo", "appointment_regist_detil");
        };

	    /**
         * 点击'诊后咨询'跳转至和医生聊天页面，若和医生还不是好友，会置为好友
	     */
	    $scope.goToChatWithDoctor = function(){
	        if($scope.canClickConsult){
	            var conData = $scope.consultData,
                    doc = conData.doctorInfo,
                    cp  = conData.customPatient,
                    customPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT),
		            param = {
                        scUserId: CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO).scUserId,
			            userVsId: cp.userVsId,
                        scDoctorId: doc.scDoctorId
                    };
		        if (customPatient && customPatient.USER_VS_ID == cp.userVsId){ //当前就诊者就是预约挂号的就诊者
		            //就诊者相关信息
			        param.idNo = customPatient.ID_NO;
                    param.phone = customPatient.PHONE;
                    param.visitName = customPatient.OFTEN_NAME;
			        param.dateOfBirth = customPatient.DATE_OF_BIRTH;
			        param.sex = customPatient.SEX;
                } else {                                //当前就诊者不是预约挂号的就诊者
                    param.idNo = cp.idNo;
                    param.phone = cp.phone;
                    param.visitName = cp.visitName;
                    var idNo = (cp.idNo + "").trim(),
                        len = idNo.length;
                    if (len === 15){  //根据身份证号获取出生日期和性别
                        param.dateOfBirth = "19" + idNo.slice(6, 8) + "-" + idNo.slice(8,10) + "-" + idNo.slice(10, 12);
                        param.sex = parseInt(idNo.slice(14,15))%2 === 0 ? 2 : 1;
                    } else if (len === 18){
                        param.dateOfBirth = idNo.slice(6, 10) + "-" + idNo.slice(10, 12) + "-" + idNo.slice(12, 14);
                        param.sex = parseInt(idNo.slice(16,17))%2 === 0 ? 2 : 1;
                    }
                }
		        MyDoctorDetailsService.getChatDataForConsult(param, function(response){
                    var doctorInfo = $scope.consultData.doctorInfo;
                    //跳转至和医生聊天页面，receiverInfo中所需参数有:
                    // rlUser,userRole,userPetname,sex,userPhoto --医生相关
                    //visitName,scUserVsId --就诊者相关
	                PersonalChatService.receiverInfo = {
                        //YX  yxUser
		                userRole: 2,
		                userPetname: doctorInfo.userPetname,
		                sex: doctorInfo.sex,
		                userPhoto: doctorInfo.userPhoto,
		                visitName: response.visitName,
		                scUserVsId: response.scUserVsId
                    };
	                PersonalChatService.goPersonalChat();
                });
            }
        };
    })
    .build();

