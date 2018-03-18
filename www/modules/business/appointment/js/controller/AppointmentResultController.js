/**
 * 产品名称：quyiyuan
 * 创建者：高玉楼
 * 创建时间：2015年8月31日14:46:12
 * 创建原因：预约挂号注册控制层
 * 修改者：王成成
 * 修改原因：KYEEAPPC-3612 将预约完成页和挂号展示方式统一
 * 修改时间：2015年10月21日15:29:25
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.result.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.appointment.result.service",
        "kyee.quyiyuan.aboutquyi.weburl.controller",
        "kyee.quyiyuan.myWallet.clinicPaymentRevise.controller",
        "kyee.quyiyuan.consulation.note.controller",
        "kyee.quyiyuan.consulation.note.detail.service",
    ])
    .type("controller")
    .name("AppointmentResultController")
    .params(["$scope", "$state", "$ionicHistory", "CacheServiceBus", "KyeeMessageService",
        "KyeeUtilsService","AppointmentResultService","AppointmentRegistDetilService",
        "PayOrderService","RsaUtilService", "KyeeListenerRegister","KyeeI18nService",
        "HospitalNavigationService","AppointmentRegistListService","AppointmentDoctorService",
        "$ionicViewSwitcher","$compile","$timeout","CouponsRecordService","OutNavigationService",
        "KyeePhoneService","OperationMonitor","AboutQuyiService","HomeService","BootstrapService",
        "AppointmentDoctorDetailService","ClinicPaymentReviseService","$location","ConsulationNoteDetailService"])
        .action(function ($scope, $state, $ionicHistory,CacheServiceBus, KyeeMessageService,
            KyeeUtilsService, AppointmentResultService,AppointmentRegistDetilService,
                          PayOrderService,RsaUtilService, KyeeListenerRegister,KyeeI18nService,
                          HospitalNavigationService,AppointmentRegistListService,AppointmentDoctorService,
                          $ionicViewSwitcher,$compile,$timeout,CouponsRecordService,OutNavigationService,
                          KyeePhoneService,OperationMonitor,AboutQuyiService,HomeService,BootstrapService,
                          AppointmentDoctorDetailService,ClinicPaymentReviseService,$location,ConsulationNoteDetailService) {
        //页面添加监听事件( 物理返回键按下之后)
        KyeeListenerRegister.regist({
            focus: "appointment_result",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $ionicViewSwitcher.nextDirection('back');
                $state.go('myquyi->MAIN_TAB.medicalGuide');
            }
        });
        var timer = undefined;
        //页面离开，销毁定时器
        KyeeListenerRegister.regist({
            focus: "appointment_result",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function (params) {
                if (timer != undefined) {
                    KyeeUtilsService.cancelInterval(timer);
                }
            }
        });
        var msg='';
        var payTime = 0;
        var payTimeShow="";
        var resultInfo = undefined;
        var whereIComeFrom = "WEB";//APP WEIXIN WEB

        //页面添加监听事件(进入之前)
        KyeeListenerRegister.regist({
            focus: "appointment_result",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                msg = '';
                payTime = 0;
                payTimeShow = "";
                resultInfo = undefined;
                //获取排班页面用户点击挂号的排班数据
                $scope.AppointmentResultSchedule = AppointmentDoctorDetailService.selSchedule;
                //初始化用户注册信息
                $scope.appointmentResult = {
                    statusType:'',
                    statusTypePlus:'', //几天后就诊
                    msgShow:'',
                    clinicTime:'',
                    hospitalName:'',
                    deptName:'',
                    isShowGetType:'0',// 取号凭证
                    getType:'',// 取号方式
                    getTypeMsg:'',// 取号说明
                    tipMsg:'',// 转挂号的提示
                    flag:'',// 0：预约挂号处理中；1：预约挂号成功；2：预约挂号失败；3：预约挂号成功后待支付
                    returnVisitTreeShow:0,
                    isShowRefresh:0,
                    returnToPayShow:0,// 0：不支持；1：支持并在缴费期间；2：支持但不在缴费期间
                    appointToregistShow:'',
                    isShowReAppoint:false,// 重新预约
                    payTime:'',
                    isPicture:'0',
                    REFERRAL_HOSPITAL_NAME :"",
                    HOSPITAL_NAME:"",
                    DEPT_NAME:"",
                    IS_REFERRAL:0
                };
                //预约挂号完成页有关广告参数（保险、陪诊服务）
                $scope.appointmentResultAD = {
                    //保险
                    IS_SHOW_RISK:false,
                    IS_SHOW_RISK_NEW:false,
                    RISK_PAY_TYPE:"",
                    RISK_NAME:"",
                    RISK_CODE:"",
                    RISK_PHOTO:"",
                    RISK_URL:"",
                    RISK_URL_WEIXIN:"",
                    RISK_PREM:"",
                    RISK_PREM_TEXT:"",
                    RISK_CHECK_BOX_UP:"",
                    RISK_OTHERS:"",
                    RISK_OPERATION:"",//统计点击量
                    //陪诊服务
                    SHOW_DIAGNOSIS:false,
                    SHOW_NEW_DIAGNOSIS:false,
                    NEW_DIAGNOSIS_TITLE:"",
                    NEW_DIAGNOSIS_TEXT:"",
                    NEW_DIAGNOSIS_URL:"",
                    NEW_DIAGNOSIS_URL_WEIXIN:"",
                    NEW_DIAGNOSIS_PHOTO:"",
                    NEW_DIAGNOSIS_OTHERS:""
                };
                $scope.refreshView();
            }
        });

        $scope.forwardBack = function(){
            if ($scope.consulotion === 'MDT' || $scope.consulotion === 'RPP') { //返回到会诊列表页面
                ConsulationNoteDetailService.consType = $scope.consulotion;
                $state.go('consulationnote');
            } else {
                $ionicViewSwitcher.nextDirection('back');//吴伟刚 KYEEAPPC-4348 预约挂号完成页优化调整
                $state.go('myquyi->MAIN_TAB.medicalGuide');
            }
            
        };

        $scope.refreshView = function()
        {
            $scope.appointmentResult.flag = "";
            $scope.user = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER);
          // 判断当前浏览器是否是微信浏览器
            function isWeiXin(){
                var ua = window.navigator.userAgent.toLowerCase();
                if(ua.match(/MicroMessenger/i) == 'micromessenger'){
                    return true;
                }else{
                    return false;
                }
            }
            whereIComeFrom = "WEB";
            if ($location.$$absUrl.indexOf("file:///") != -1 || $location.$$absUrl.indexOf("localhost:8080/var") != -1){
                whereIComeFrom = "APP";
            }
            if(isWeiXin()){
                whereIComeFrom = "WEIXIN";
            }
            var doctorInfo = AppointmentDoctorDetailService.doctorInfo;
            var rushId = "";
            if(doctorInfo!=undefined && doctorInfo!=null && doctorInfo!=""){
                rushId = doctorInfo.RUSH_ID;
            }
            $scope.SHOW_RESULT_DATE = false;
            AppointmentResultService.queryAppointmentResult({
                hospitalId: AppointmentRegistDetilService.RECORD.HOSPITAL_ID,
                regId: AppointmentRegistDetilService.RECORD.REG_ID,
                handleNoPayFlag: AppointmentRegistDetilService.RECORD.handleNoPayFlag,
                whereIComeFrom:whereIComeFrom,
                "RUSH_ID":rushId    //有号提醒记录对应的ID
            },function(data){
                $scope.SHOW_RESULT_DATE = true;
                $scope.SHOW_REFERAL_HOSPITAL = false;
                if(data.IS_REFERRAL=='2'&&data.REFERRAL_HOSPITAL_NAME!=undefined&&data.REFERRAL_HOSPITAL_NAME!=""){
                    $scope.SHOW_REFERAL_HOSPITAL = true;
                    $scope.appointmentResult.REFERRAL_HOSPITAL_NAME = data.REFERRAL_HOSPITAL_NAME;
                    $scope.appointmentResult.HOSPITAL_NAME = data.HOSPITAL_NAME;
                    $scope.appointmentResult.DEPT_NAME = data.DEPT_NAME;
                    $scope.appointmentResult.IS_REFERRAL = data.IS_REFERRAL;
                }

                //预约挂号接口详情返回的会诊标识，标识该笔记录是否是会诊的预约挂号记录，值: MDT, RPP
                $scope.consulotion = data.CONSULTATION_FLAG;

                resultInfo = data;
                //KYEEAPPC-4988 UI细节修改，预约失败，在结果页和预约挂号详情页，增加意见反馈话语，点击跳转到意见反馈  wangwan
                $scope.appointmentResult.statusType = data.STATUS_TYPE;
                if(data.statusTypePlus!=null && data.statusTypePlus !='' && data.statusTypePlus!=undefined){
                    $scope.appointmentResult.statusTypePlus = data.statusTypePlus;  //几天后就诊
                }
                msg = data.FINAL_MSG.replace('$suggestion$','<span class="qy-blue" ng-click="goToFeedback()">'+data.SUGGESTION+'</span>');
                var elementId="appointResultMsgPrompt";
                footerClick(elementId);
                var clinicDuration = data.CLINIC_DURATION.split('/');
                $scope.appointmentResult.clinicTime = data.REG_DATE + ' ' + clinicDuration[clinicDuration.length - 1];
                $scope.appointmentResult.hospitalName = data.HOSPITAL_NAME;
                $scope.appointmentResult.deptName = data.DEPT_NAME;
                $scope.appointmentResult.returnVisitTreeShow = data.RETURN_VISIT_TREE;
                $scope.appointmentResult.isShowRefresh = data.IS_SHOW_REFRESH;
                $scope.appointmentResult.isShowGetType = data.IS_SHOW_GET_TYPE;
                $scope.appointmentResult.isPicture = data.IS_PICTURE;
                $scope.appointmentResult.getType = data.GET_TYPE;
                $scope.appointmentResult.isShowReAppoint = data.IS_SHOW_REAPPOINT;
                $scope.appointmentResultAD.RISK_PAY_TYPE = data.RISK_PAY_TYPE;
                $scope.appointmentResultAD.IS_SHOW_RISK = data.IS_SHOW_RISK;//2.2.80版本以前推荐停诊险的标志
                $scope.appointmentResultAD.IS_SHOW_RISK_NEW = data.IS_SHOW_RISK_NEW;//2.2.80版本以后推荐保险（包括停诊险）的标志
                $scope.appointmentResultAD.RISK_NAME = data.RISK_NAME;//险种名称
                $scope.appointmentResultAD.RISK_CODE = data.RISK_CODE;//险种编码
                $scope.appointmentResultAD.RISK_PHOTO = data.RISK_PHOTO;//险种广告图
                $scope.appointmentResultAD.RISK_URL = data.RISK_URL;
                $scope.appointmentResultAD.RISK_URL_WEIXIN = data.RISK_URL_WEIXIN;
                $scope.appointmentResultAD.RISK_PREM = data.RISK_PREM;
                $scope.appointmentResultAD.RISK_PREM_TEXT = data.RISK_PREM_TEXT;
                $scope.appointmentResultAD.RISK_CHECK_BOX_UP = data.RISK_CHECK_BOX_UP;//默认勾选停诊
                if($scope.user&&$scope.appointmentResultAD.RISK_CHECK_BOX_UP=='1'){
                    $scope.checkBoxUp = '1';
                }else{
                    $scope.checkBoxUp = '2';
                }
                $scope.appointmentResultAD.RISK_OTHERS = data.RISK_OTHERS;//"立即购买"或者“免费领取”
                $scope.appointmentResultAD.RISK_OPERATION = data.RISK_OPERATION;
                //统计推荐停诊险的次数
                if( $scope.appointmentResultAD.IS_SHOW_RISK_NEW){
                    /*  OperationMonitor.record("showRisk", "appointmentResult");*/
                    var showInsuranceCount = "showInsurance" + $scope.appointmentResultAD.RISK_OPERATION;
                    OperationMonitor.record(showInsuranceCount, "appointment_result");
                }
                //陪诊服务
                $scope.appointmentResultAD.SHOW_DIAGNOSIS = data.SHOW_DIAGNOSIS;//2.2.70版本以后可删掉
                $scope.appointmentResultAD.SHOW_NEW_DIAGNOSIS = data.SHOW_NEW_DIAGNOSIS;//是否显示陪诊服务
                $scope.appointmentResultAD.NEW_DIAGNOSIS_TITLE = data.NEW_DIAGNOSIS_TITLE;//“陪诊服务”
                $scope.appointmentResultAD.NEW_DIAGNOSIS_TEXT = data.NEW_DIAGNOSIS_TEXT;//“59元首单体验券”
                $scope.appointmentResultAD.NEW_DIAGNOSIS_URL = data.NEW_DIAGNOSIS_URL;//链接跳转到趣护页面
                $scope.appointmentResultAD.NEW_DIAGNOSIS_URL_WEIXIN = data.NEW_DIAGNOSIS_URL_WEIXIN;//链接跳转到趣护页面(微信公众号)
                $scope.appointmentResultAD.NEW_DIAGNOSIS_PHOTO = data.NEW_DIAGNOSIS_PHOTO;//陪诊广告图片
                $scope.appointmentResultAD.NEW_DIAGNOSIS_OTHERS = data.NEW_DIAGNOSIS_OTHERS;//陪诊广告"立即使用"
                // 院内导航图标是否显示 wangchengcheng 2015年12月25日13:10:43 APPCOMMERCIALBUG-1969
                $scope.showNavigation = data.IS_SHOW_NAVIGATION == 1 ? true : false;
                $scope.isShowCoupons = data.IS_SHOW_COUPONS;
                //就诊提醒
                if(data.MSG==""&&data.ATTENTION_MATTERS==""){
                    $scope.typeMsgNotHidden=true;
                }else{
                    $scope.typeMsgNotHidden=false;
                }
                if(data.BAR_CODE!=''&& data.BAR_CODE!=undefined &&data.BAR_CODE!=null){
                    $scope.barCode= data.BAR_CODE.split('|')[0];
                    $scope.barCodeUrl=data.BAR_CODE.split('|')[1];
                }
                if(data.QR_CODE!=''&& data.QR_CODE!=undefined &&data.QR_CODE!=null){
                    $scope.qrCode= data.QR_CODE.split('|')[0];
                    $scope.qrCodeUrl=data.QR_CODE.split('|')[1];
                }
                if(data.CLINIC_BAR_CODE!=''&& data.CLINIC_BAR_CODE!=undefined &&data.CLINIC_BAR_CODE!=null){
                    $scope.clinicbarCode= data.CLINIC_BAR_CODE.split('|')[0];
                    $scope.clinicbarCodeUrl=data.CLINIC_BAR_CODE.split('|')[1];
                    $scope.clinicbarCodeNum=data.CLINIC_BAR_CODE.split('|')[2];
                }
                if(data.ID_NO_QR_CODE!=''&& data.ID_NO_QR_CODE!=undefined &&data.ID_NO_QR_CODE!=null){
                    $scope.idNoqrCode= data.ID_NO_QR_CODE.split('|')[0];
                    $scope.idNoqrCodeUrl=data.ID_NO_QR_CODE.split('|')[1];
                    $scope.idNoqrCodeNum=data.ID_NO_QR_CODE.split('|')[2];
                }
                //获取失败提示内容
                $scope.WARN_MSG_data=data.WARN_MSG;
                $scope.dealVisitMsg(data.MSG,data.ATTENTION_MATTERS);
                // 对flag赋值
                if ((data.TYPE==='0' && data.APPOINT_TYPE==='0') || (data.TYPE==='1' && data.REGIST_TYPE==='0') || (data.TYPE==='2' && data.APPOINT_TYPE==='0')) {
                    $scope.appointmentResult.flag = '0';
                } else if ((data.TYPE==='0' && data.APPOINT_TYPE==='1') || (data.TYPE==='1' && data.REGIST_TYPE==='1') || (data.TYPE==='2' && data.APPOINT_TYPE==='5')) {
                    $scope.appointmentResult.flag = '1';
                    $scope.appointmentResult.tipMsg = data.MSG;
                } else if ((data.TYPE==='0' && data.APPOINT_TYPE==='2') || (data.TYPE==='1' && data.REGIST_TYPE==='2') || (data.TYPE==='2' && data.APPOINT_TYPE==='6')) {
                    $scope.appointmentResult.flag = '2';
                } else if ((data.TYPE==='0'&&data.APPOINT_TYPE==='7') || (data.TYPE==='1'&&data.REGIST_TYPE==='8')) {
                    $scope.appointmentResult.flag = '3';
                }
                //如果是预约转挂号，显示继续支付按钮
                if(data.IS_SHOW_BUTTON==='1'&&data.BUTTON_ACTION==='2'&&data.CAN_APPOINT2REGIST_FLAG!=='0')
                {
                    $scope.appointmentResult.returnToPayShow = '1';
                }else if(data.IS_SHOW_BUTTON==='1'&&data.BUTTON_ACTION==='2'&&data.CAN_APPOINT2REGIST_FLAG==='0')
                {
                    $scope.appointmentResult.returnToPayShow = '2';
                }
                else if(data.IS_SHOW_BUTTON==='1'&&data.BUTTON_ACTION!=='2')
                {
                    $scope.appointmentResult.returnToPayShow = '1';
                }
                else
                {
                    $scope.appointmentResult.returnToPayShow = '0';
                }
                //是否是预约待缴费或挂号待缴费
                if(data.TYPE==='0'&&data.APPOINT_TYPE==='7'||data.TYPE==='1'&&data.REGIST_TYPE==='8')
                {
                        payTime = parseInt(data.PAY_TIME);
                        payTimeShow = getPayTime(payTime);
                        $scope.appointmentResult.msgShow = msg.replace('$payTime$','规定时间');
                        $scope.appointmentResult.payTime = payTimeShow;
                        if(payTime>0)
                        {
                            timer = KyeeUtilsService.interval({
                                time: 1000,
                                action: function () {
                                    payTime -= 1;
                                    if (payTime > 0) {
                                        payTimeShow = getPayTime(payTime);
                                    } else {
                                        //关闭定时器
                                        if (timer != undefined) {
                                            KyeeUtilsService.cancelInterval(timer);
                                        }
                                        payTimeShow = '00:00';
                                        $scope.refreshView();
                                    }
                                    if(msg)
                                    {
                                        $scope.appointmentResult.msgShow = msg.replace('$payTime$','规定时间');
                                        $scope.appointmentResult.payTime = payTimeShow;
                                    }
                                }
                            });
                        }
                }
                else{
                    $scope.appointmentResult.msgShow = msg;

                }
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
                //start去掉查详情请求
                $scope.IS_SHOW_HANDLE_MESSAGE = data.IS_SHOW_HANDLE_MESSAGE;
                if ($scope.IS_SHOW_HANDLE_MESSAGE==1) {
                    if(data.HANDLE_MESSAGE!=undefined&&
                        data.HANDLE_MESSAGE!=""&&data.HANDLE_MESSAGE!=null){
                        $scope.WARN_MSG=data.HANDLE_MESSAGE;
                    }else{
                        $scope.WARN_MSG="";
                    }
                }
                $scope.appointmentResult.statusType = data.STATUS_TYPE;
                // 0：预约挂号处理中；1：预约挂号成功；2：预约挂号失败；3：预约挂号成功后待支付
                $scope.STATUS_FAIL = false;
                if ((data.TYPE==='0' && data.APPOINT_TYPE==='2') || (data.TYPE==='1' && data.REGIST_TYPE==='2') || (data.TYPE==='2' && data.APPOINT_TYPE==='6')) {
                    $scope.STATUS_FAIL = true;
                    if($scope.WARN_MSG.indexOf('意见反馈')>-1 || $scope.WARN_MSG.indexOf('联系客服')>-1){
                        $scope.WARN_MSG_TEM = $scope.WARN_MSG.replace('意见反馈', '<span class="qy-blue" ng-click="goToFeedback()">意见反馈</span>');
                        $scope.WARN_MSG_TEM = $scope.WARN_MSG_TEM.replace('联系客服', '<span class="qy-blue" ng-click="click2call()">联系客服</span>');
                        footerClickWaryMsg();
                    }
                }
                //end 去掉查详情请求
                $scope.IS_PARTICULAR_DEPT = data.IS_PARTICULAR_DEPT;
                $scope.CLINIC_MESSAGE = data.CLINIC_MESSAGE;
                if($scope.IS_PARTICULAR_DEPT) {
                    KyeeMessageService.confirm({
                        title: KyeeI18nService.get('appointment.clinicMsgTitle', "温馨提示"),
                        content: $scope.CLINIC_MESSAGE,
                        okText: KyeeI18nService.get('appointment.letsGo', "在线支付"),
                        cancelText: KyeeI18nService.get('appointment.knowIt', "取消"),
                        onSelect: function (res) {
                            if (res) {
                                ClinicPaymentReviseService.lastRootState = "appointment_result";
                                $state.go("clinic_payment_revise");
                            }
                        }
                    });
                }
            });
            $scope.$broadcast('scroll.refreshComplete');
            OperationMonitor.record("countRefresh", "appointment_result");
        };
        //跳转到意见反馈页面
        $scope.goToFeedback = function(){
            $state.go("aboutquyi_feedback");
            //统计意见反馈各入口点击数量  by 高萌  KYEEAPPC-5534
            OperationMonitor.record("aboutquyi_feedback", "appointRegistResult");
        };
        $scope.click2call = function () {
            KyeePhoneService.callOnly("4000801010");
        };
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
        if(window.device != undefined && ionic.Platform.platform() == "ios"){
            var screenSize = KyeeUtilsService.getInnerSize();
            $scope.deviceTop= 64;
        }else{
            $scope.deviceTop=44;
        }
        // 完成页门诊门诊编号、条形码、二维码显示不全  by 高萌  KYEEAPPTEST-3609
        $scope.bind = function (params) {
            $scope.showOverlay = params.show;
            $scope.hideOverlay = params.hide;
            params.regist({
                oneSizeShow:$scope.oneSizeShow,
                twoSizeShow:$scope.twoSizeShow,
                threeSizeShow:$scope.threeSizeShow
            });
        };
        function getPayTime(payTime){
            if(payTime<=0){
                return;
            }
            var hour= Math.floor(payTime / (60*60));//小时
            var minute = Math.floor((payTime/60)%(60));//分钟
            var second = Math.floor(payTime%60);//秒
            var timeShow="";
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
            return "<span style='color: orange'>" + timeShow + "</span>";
        }
        //处理就诊提示信息
        $scope.dealVisitMsg=function(msg,ATTENTION_MATTERS){
            //包含条形码
            if(msg.indexOf('%a%')>-1){
                var e=new RegExp('%a%',"g");
                msg = msg.replace(e, '<span class="see_doctor_div qy_blue" ng-click="showCoderImg(barCodeUrl)">条形码</span>');
                // msg= msg.replace('%a%','<span class="margin_bottom_list see_doctor_div" ng-click="showCoderImg()">条形码</span>');
            }
            //包含二维码
            if(msg.indexOf('%b%')>-1){
                var e=new RegExp('%b%',"g");
                msg = msg.replace(e, '<span class="see_doctor_div qy_blue" ng-click="showCoderImg(qrCodeUrl)">二维码</span>');
                // msg= msg.replace('%b%','<span class="margin_bottom_list see_doctor_div" ng-click="showCoderImg()">二维码</span>');
            }
            //包含门诊编号
            if(msg.indexOf('%c%')>-1){
                var e=new RegExp('%c%',"g");
                msg = msg.replace(e, '<span class="see_doctor_div qy_blue" ng-click="showCoderImg(clinicbarCodeUrl,clinicbarCodeNum)">门诊编号</span>');
                // msg= msg.replace('%c%','<span class="margin_bottom_list see_doctor_div" ng-click="showCoderImg()">门诊编号</span>');
            }
            //包含身份证号
            if(msg.indexOf('%d%')>-1){
                var e=new RegExp('%d%',"g");
                msg = msg.replace(e, '<span class="see_doctor_div qy_blue" ng-click="showCoderImg(idNoqrCodeUrl,idNoqrCodeNum)">身份证号</span>');
            }
            if(msg.indexOf('（获取失败）')>-1){
                var e=new RegExp('（获取失败）',"g");
                msg = msg.replace(e, '<span class="margin_bottom_list see_doctor_div qy_blue" ng-click="showWarmmessage()">（获取失败）</span>');
            }
            if(msg.indexOf('（重发短信）')>-1){
                var e=new RegExp('（重发短信）',"g");
                msg = msg.replace(e, '');
            }
            $scope.appointmentResultDetilMSG=msg+ATTENTION_MATTERS;
            var elementId = "appointmentResultDetilMSG";
            footerClick(elementId);
        };
        //将html绑定的ng-clinic事件重新编译
        footerClick = function(elementId){
            $timeout(
                function () {
                    var element=angular.element(document.getElementById(elementId));
                    if(elementId=="appointmentResultDetilMSG"){
                        element.html($scope.appointmentResultDetilMSG);
                    }else if(elementId=="appointResultMsgPrompt"){
                        //KYEEAPPC-4988 UI细节修改，预约失败，在结果页和预约挂号详情页，增加意见反馈话语，点击跳转到意见反馈  wangwan
                        element.html($scope.appointmentResult.msgShow);
                    }
                    $compile(element.contents())($scope);
                },
                1000
            );
        };
        $scope.returnVisitTree = function(){
            $state.go('myquyi->MAIN_TAB.medicalGuide');
        };

        //  预约挂号记录
        $scope.returnAppointRegistMor = function(){
            if ($scope.consulotion === 'MDT' || $scope.consulotion === 'RPP') { //返回到会诊列表页面
                ConsulationNoteDetailService.consType = $scope.consulotion;
                $state.go('consulationnote');
            } else {
                AppointmentRegistListService.ROUTE_STATE = "appointment_result";
                $state.go('appointment_regist_list');
                OperationMonitor.record("countComplite", "appointment_result", true);
            }            
        };

        //跳转到科室导航（院内导航）
        $scope.goToDeptLocat = function () {
            HospitalNavigationService.ROUTE_STATE = "appointment_result";
            HospitalNavigationService.lastClassName = "appointment_result";
            HospitalNavigationService.fixedPositionInfro = {
                HOSPITAL_ID: AppointmentRegistDetilService.RECORD.HOSPITAL_ID,
                DEPT_NAME: $scope.appointmentResult.deptName,
                HOSPITAL_AREA:$scope.AppointmentResultSchedule.HOSPITAL_AREA
            };
            $state.go("hospital_navigation");
            OperationMonitor.record("countGoToDeptLocat", "appointment_result");
        };
        //跳转到医院外导航
        $scope.goToHospitalLocat = function () {
            OutNavigationService.hospitalId = $scope.appointmentResult.HOSPITAL_ID;
            OutNavigationService.openNavigationOut();
            OperationMonitor.record("countHospitalLocal", "appointment_result");
        };

        // 再次预约挂号
        $scope.reappoint = function () {
            AppointmentDoctorService.ROUTE_STATE = "appointment_result";
            $state.go('appointment_doctor');
            OperationMonitor.record("countReappoint", "appointment_result");
        };

        // 查看详情
        $scope.todetail = function () {
            AppointmentRegistDetilService.ROUTE_STATE = "appointment_result";
            $state.go('appointment_regist_detil');
            OperationMonitor.record("countToDetail", "appointment_result", true);
        };

        // 查看优惠券 wangchengcheng KYEEAPPC-4616 2015年12月29日18:20:11
        $scope.toCouponsRecord = function () {
            CouponsRecordService.ROUTE_STATE = "appointment_result";
            CouponsRecordService.RECORD_HOSPITAL =  AppointmentRegistDetilService.RECORD.HOSPITAL_ID;
            CouponsRecordService.RECORD_REG_ID = AppointmentRegistDetilService.RECORD.REG_ID;
            $state.go('couponsRecord');
            OperationMonitor.record("countToCouponsRecord", "appointment_result");
        };

        //显示条形码图片
        $scope.showCoderImg = function (CodeUrl,CodeNum) {
            $scope.codeUrl=CodeUrl;
            $scope.MES_NUMBER=CodeNum;
            $scope.overlayData.codeUrl=CodeUrl;
            $scope.overlayData.MES_NUMBER=CodeNum;
            $scope.showOverlay();
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
        //显示获取失败提示
        $scope.showWarmmessage=function(){
            $scope.WARN_MSG=$scope.WARN_MSG_data;
            $scope.SUGGESTION_MSG="";
            $scope.messdialog = KyeeMessageService.dialog({
                tapBgToClose : true,
                template: "modules/business/appointment/views/delay_views/warmPrompt.html",
                scope: $scope,
                title:  KyeeI18nService.get("appointment.messageTitle","温馨提示"),
                buttons: [
                    {
                        text:  KyeeI18nService.get("appointment.suggest","意见反馈"),
                        click: function () {
                            $scope.messdialog.close();
                            $state.go("aboutquyi_feedback");
                        }
                    },
                    {
                        text: KyeeI18nService.get("appointment.callPhone","拨打电话"),
                        style:'button-size-l',
                        click: function () {
                            $scope.messdialog.close();
                            KyeePhoneService.callOnly("4000801010");
                        }
                    }
                ]
            });
        };
        //关闭提示窗口
        $scope.closemessdialog=function(){
            $scope.messdialog.close();
        };
        var goToPay = function(){
            var toPayPara = {
                hospitalId: resultInfo.HOSPITAL_ID,
                patientId: resultInfo.PATIENT_ID,
                userId: resultInfo.USER_ID,
                cRegId: resultInfo.REG_ID,
                markDesc: resultInfo.MARK_DESC,
                Amount: resultInfo.AMOUNT
            };
            AppointmentRegistDetilService.goToPay(toPayPara, function (data) {
                //gch修改预约后支付
                var amount = parseFloat(resultInfo.AMOUNT).toFixed(2);
                $scope.AMOUNT = "¥" + amount;
                resultInfo.AMOUNT=amount;
                var paydata = resultInfo;
                paydata["TRADE_NO"] = data.OUT_TRADE_NO;
                paydata["MARK_DETAIL"] = resultInfo.MARK_DESC;
                paydata["APPOINT_SUCCESS_PAY"] = 1;
                paydata["ROUTER"] = "appointment_result";
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
                paydata["CARD_NO"]=data.CARD_NO;
                paydata["CARD_TYPE"]=data.CARD_TYPE;
                paydata["C_REG_ID"]=resultInfo.C_REG_ID;
                paydata["hospitalID"] = resultInfo.HOSPITAL_ID;
                if(data.isSupportMerge==1){
                    paydata["AMOUNT"] = data.USER_PAY_AMOUNT;
                    amount=data.USER_PAY_AMOUNT;
                    data["PREFERENTIAL_FEE"]="";
                }
                // wangchengcheng 2016年1月20日14:44:56 KYEEAPPC-4852
                var paydataNew = angular.copy(paydata);
                paydataNew["MARK_DESC"] = KyeeI18nService.get("appointment.markDesc","挂号费");
                PayOrderService.payData = paydataNew;
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
                                AppointmentRegistDetilService.ROUTE_STATE = "appointment_result";
                                CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,true);//进入预约挂号完成页比标志必须为true，用以标识用户默认勾选赠送的停诊险
                                //$state.go("appointment_result");
                                //gch调用自己页面的刷新方法
                                $scope.refreshView();
                                return;
                            }else{

                                $scope.cancelPayOrder();
                                return;

                            }

                        }
                    });

                }else{
                    PayOrderService.payData = paydataNew;
                    //0元支付不跳转到支付页面，直接跳转到结果页
                    if(amount  == 0.00&&$scope.zeroPay <= parseFloat(0.00)){
                        AppointmentRegistDetilService.RECORD = {
                            HOSPITAL_ID: paydata["hospitalID"],
                            REG_ID: paydata["C_REG_ID"],
                            handleNoPayFlag:"1"
                        };
                        AppointmentRegistDetilService.ROUTE_STATE = "appointment_result";
                        CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,true);//进入预约挂号完成页比标志必须为true，用以标识用户默认勾选赠送的停诊险
                        //gch调用自己页面的刷新方法
                        $scope.refreshView();
                    }else
                    {
                        $state.go("payOrder");
                    }
                }
            });
        };
        $scope.returnPay = function(){
            //预约后缴费
            if(resultInfo.BUTTON_ACTION==='0')
            {
                if(resultInfo.CONSULTATION_FLAG!=null&&resultInfo.CONSULTATION_FLAG!=''&&resultInfo.CONSULTATION_FLAG!=undefined){
                    $scope.WARN_MSG = resultInfo.CONSULTATION_FEE_TIPS;
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
                                        goToPay();
                                    }
                                }
                            ]
                        });
                    }else{
                        goToPay();
                    }
                }else{
                    goToPay();
                }
            }
            //挂号后缴费
            else if(resultInfo.BUTTON_ACTION==='1')
            {
                var toPayPara = {
                    HOSPITAL_ID: resultInfo.HOSPITAL_ID,
                    C_REG_ID: resultInfo.C_REG_ID
                };
                AppointmentRegistDetilService.goToPayRegist(toPayPara, function (data) {
                    var amount = parseFloat(resultInfo.AMOUNT).toFixed(2);
                    $scope.AMOUNT = "¥" + amount;
                    resultInfo.AMOUNT=amount;
                    var paydata = resultInfo;
                    paydata["TRADE_NO"] = data.OUT_TRADE_NO;
                    paydata["MARK_DETAIL"] = resultInfo.MARK_DESC;
                    paydata["APPOINT_SUCCESS_PAY"] = 1;
                    paydata["ROUTER"] = "appointment_result";
                    paydata["REMAIN_SECONDS"] = data.REMAIN_SECONDS;
                    //新增倒计时截止时间  edit by 高萌  2017年3月10日11:46:21
                    var now = new Date();
                    var payDeadLine= new Date(now.getTime() + data.REMAIN_SECONDS*1000);
                    paydata["PAY_DEADLINE"] = payDeadLine;//支付截止时间
                    //end by
                    paydata["flag"] = 4;//用于支付页面 取消支付的状态：1 挂号 2：预约转挂号 3预约缴费 4挂号缴费
                    paydata["isShow"]=data.isShow;
                    paydata["IS_OPEN_BALANCE"]=data.IS_OPEN_BALANCE;
                    paydata["USER_PAY_AMOUNT"]=data.USER_PAY_AMOUNT;
                    paydata["CARD_NO"]=data.CARD_NO;
                    paydata["CARD_TYPE"]=data.CARD_TYPE;
                    paydata["C_REG_ID"]=resultInfo.C_REG_ID;
                    paydata["hospitalID"] = resultInfo.HOSPITAL_ID;
                    if(data.isSupportMerge==1){
                        paydata["AMOUNT"] = data.USER_PAY_AMOUNT;
                        amount=data.USER_PAY_AMOUNT;
                        data["PREFERENTIAL_FEE"]="";
                    }
                    var paydataNew = angular.copy(paydata);
                    paydataNew["MARK_DESC"] =  KyeeI18nService.get("appointment.markDesc","挂号费");
                    PayOrderService.payData = paydataNew;
                    //gch 修改挂号后支付
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
                                    AppointmentRegistDetilService.ROUTE_STATE = "appointment_result";
                                    CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,true);//进入预约挂号完成页比标志必须为true，用以标识用户默认勾选赠送的停诊险
                                    //gch调用自己页面的刷新方法
                                    $scope.refreshView();
                                    return;
                                }else{

                                    $scope.cancelPayOrder();
                                    return;

                                }

                            }
                        });

                    }else{
                        PayOrderService.payData = paydataNew;
                        //0元支付不跳转到支付页面，直接跳转到结果页
                        if(amount == 0.00&&$scope.zeroPay <= parseFloat(0.00)){
                            AppointmentRegistDetilService.RECORD = {
                                HOSPITAL_ID: paydata["hospitalID"],
                                REG_ID: paydata["C_REG_ID"],
                                handleNoPayFlag:"1"
                            };
                            AppointmentRegistDetilService.ROUTE_STATE = "appointment_result";
                            CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,true);//进入预约挂号完成页比标志必须为true，用以标识用户默认勾选赠送的停诊险
                            //gch调用自己页面的刷新方法
                            $scope.refreshView();
                        }else
                        {
                            $state.go("payOrder");
                        }
                    }

                })
            }
            //预约转挂号
            else if(resultInfo.IS_SHOW_BUTTON==='1'&&resultInfo.BUTTON_ACTION==='2'&&resultInfo.CAN_APPOINT2REGIST_FLAG!=='0')
            {
                var appToregPara = {
                    hospitalId: resultInfo.HOSPITAL_ID,
                    regId: resultInfo.REG_ID,
                    userId:resultInfo.USER_ID,
                    cRegId: resultInfo.C_REG_ID,
                    markDesc: resultInfo.MARK_DESC,
                    Amount: resultInfo.AMOUNT
                };
                //获取缓存中医院信息
                var hospitalinfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                var isVerifyMedicalCard = hospitalinfo.is_appoint_to_regist_card_pwd;//挂号是否输入卡号，卡密码 0：不输入就诊卡号，密码 1：输入就诊卡号
                if(isVerifyMedicalCard=="1"){
                    //预约转挂号需要输入卡号，密码对象
                    $scope.isVerifyRegistMedicalCard = {
                        IN_CARDNO: resultInfo.CARD_NO,//无需存入缓存，现在如果挂号成功，后台会有机制将此卡号设置为默认卡号，下次会自动查询出来，前台无需处理  -张明
                        IN_CARDPWD: ""
                    };
                    inputCardPwd(appToregPara);
                }else{
                    appointToregist(appToregPara);
                }
            }
            OperationMonitor.record("countReturnPay", "appointment_result", true);
        };

        var appointToregist=function(appToregPara){
            AppointmentRegistDetilService.appointToregist(appToregPara, function (data) {
                if (data.IS_PAY == '0') {
                    $scope.refreshView();
                } else {
                    var amount = parseFloat(resultInfo.AMOUNT).toFixed(2);
                    $scope.AMOUNT = "¥" + amount;
                    resultInfo.AMOUNT=amount;
                    var paydata = resultInfo;
                    paydata["TRADE_NO"] = data.OUT_TRADE_NO;
                    paydata["isShow"] = data.isShow;
                    paydata["IS_OPEN_BALANCE"] = data.IS_OPEN_BALANCE;
                    paydata["USER_PAY_AMOUNT"] = data.USER_PAY_AMOUNT;
                    paydata["MARK_DETAIL"] = resultInfo.MARK_DESC;
                    paydata["ROUTER"] = "appointment_result";
                    paydata["flag"] = 2;//用于支付页面 取消支付的状态：1 挂号 2：预约转挂号 3预约缴费
                    paydata["C_REG_ID"]=resultInfo.C_REG_ID;
                    paydata["hospitalID"] = paydata.HOSPITAL_ID;
                    paydata["CARD_NO"] = data.CARD_NO;
                    paydata["CARD_TYPE"] = data.CARD_TYPE;
                    if(data.isSupportMerge==1){
                        paydata["AMOUNT"] = data.USER_PAY_AMOUNT;
                        amount=data.USER_PAY_AMOUNT;
                        data["PREFERENTIAL_FEE"]="";
                    }
                    //gaomeng KYEEAPPC-5987
                    var paydataNew = angular.copy(paydata);
                    // wangchengcheng 2016年1月20日14:44:56 KYEEAPPC-4852
                    paydataNew["MARK_DESC"] = KyeeI18nService.get("appointment.markDesc","挂号费");
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
                                    AppointmentRegistDetilService.ROUTE_STATE = "appointment_result";
                                    CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,true);//进入预约挂号完成页比标志必须为true，用以标识用户默认勾选赠送的停诊险
                                    //gch调用自己页面的刷新方法
                                    $scope.refreshView();
                                    return;
                                }else{

                                    $scope.cancelPayOrder();
                                    return;

                                }

                            }
                        });

                    }else{
                        PayOrderService.payData = paydataNew;
                        //0元支付不跳转到支付页面，直接跳转到结果页  by 高萌  KYEEAPPC-5987
                        if(amount == 0.00&&$scope.zeroPay <= parseFloat(0.00)){
                            AppointmentRegistDetilService.RECORD = {
                                HOSPITAL_ID: paydata["hospitalID"],
                                REG_ID: paydata["C_REG_ID"],
                                handleNoPayFlag:"1"
                            };
                            AppointmentRegistDetilService.ROUTE_STATE = "appointment_result";
                            CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,true);//进入预约挂号完成页比标志必须为true，用以标识用户默认勾选赠送的停诊险
                            //gch调用自己页面的刷新方法
                            $scope.refreshView();
                        } else {
                            $state.go("payOrder");
                        }
                    }


                }
            })
        };
        //取消订单
        $scope.cancelPayOrder = function () {
            var data = PayOrderService.payData;
            //begin 取消订单合并  By  章剑飞  APPCOMMERCIALBUG-884
            PayOrderService.cancelPayOrder(function () {
                //跳转页面之后清除数据
                PayOrderService.payData = undefined;
            });
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

        var inputCardPwd = function (appToregPara) {
            var dialog = KyeeMessageService.dialog({
                template: "modules/business/appointment/views/delay_views/isVerifyMedicalCard.html",
                scope: $scope,
                title: KyeeI18nService.get("appointment.appoint2RegistCard","预约转挂号就诊卡验证"),
                buttons: [
                    {
                        text:KyeeI18nService.get("appointment.cancel","取消"),
                        click: function () {
                            dialog.close();
                        }
                    },
                    {
                        text:KyeeI18nService.get("appointment.isOk","确定"),
                        style:'button-size-l',
                        click: function () {
                            if (!$scope.isVerifyRegistMedicalCard.IN_CARDNO || !$scope.isVerifyRegistMedicalCard.IN_CARDPWD) {
                                KyeeMessageService.broadcast({
                                    content: KyeeI18nService.get("appointment.isNotempty","就诊卡号或密码不能为空"),
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

        $scope.noSelectRiskFree = function(){
            $scope.user = !$scope.user;
            CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,$scope.user);
            if($scope.user&&$scope.appointmentResultAD.RISK_CHECK_BOX_UP=='1'){
                $scope.checkBoxUp = '1';
            }else{
                $scope.checkBoxUp = '2';
            }
        };
        //购买保险页面
        $scope.goToBuyRisk = function(){
            var userAgents=navigator.userAgent;
            userAgents=userAgents.toLowerCase();
            //统计进入停诊险页面的次数
        /*   OperationMonitor.record("goToRisk", "appointment_result");*/
            var riskUrl = $scope.appointmentResultAD.RISK_URL;
            if(whereIComeFrom == "WEIXIN"){
                riskUrl = $scope.appointmentResultAD.RISK_URL_WEIXIN;
            }
            riskUrl = riskUrl  +"&backup="+  $scope.checkBoxUp;
            var riskSign = KyeeUtilsService.SecurityUtils.md5(riskUrl);//对url进行md5加密
            riskUrl = riskUrl+"&riskSign="+riskSign;
             AboutQuyiService.webUrl = riskUrl;
            if(window.device && device.platform == "iOS"){
                var cache = CacheServiceBus.getMemoryCache();
                cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_VIEW_ROUTER, "appointment_result");
                //$ionicHistory.goBack();
                window.open(riskUrl,"_blank","location=yes");
            }else if (whereIComeFrom == "WEIXIN"){
                    window.location.href = riskUrl;
            }else{
                $state.go("risk_web_url");
            }
        };

        // gaomeng  2016年6月19日17:03:06
        //跳转陪诊页面
        $scope.withTheDiagnosis = function(){
            var riskUrl = $scope.appointmentResultAD.NEW_DIAGNOSIS_URL;
           if(whereIComeFrom == "WEIXIN"){
               riskUrl = $scope.appointmentResultAD.NEW_DIAGNOSIS_URL_WEIXIN;
           }
            AboutQuyiService.webUrl = riskUrl;
            AboutQuyiService.name = "就医陪诊";
            $state.go("aboutquyi_webview");
            OperationMonitor.record("countWithTheDiagnosis", "appointment_result");
        };
    })
    .build();
