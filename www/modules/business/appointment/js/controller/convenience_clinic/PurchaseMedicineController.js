/**
 * 描述： 远程购药控制器
 * 作者:  wangsannv
 * 时间:  2017年3月31日11:22:52
 */

new KyeeModule()
    .group("kyee.quyiyuan.appointment.purchase_medincine.controller")
    .require([
        "kyee.quyiyuan.appointment.video_interrogation.service",
        "kyee.framework.service.view",
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.appoint.appoint_appointConfirm.service",
        "kyee.quyiyuan.appointment.service",
        "kyee.framework.service.message",
        "kyee.quyiyuan.center.service.QueryHisCardService",
        "kyee.quyiyuan.payOrder.service",
        "kyee.quyiyuan.appoint.binding12320.controller",
        "kyee.quyiyuan.appointment.appointment_regist_detil.service",
        "kyee.quyiyuan.login.rsautil.service",
        "kyee.quyiyuan.address_manage.controller",
        "kyee.quyiyuan.appointment.create_card.controller",
        "kyee.quyiyuan.appoint.sendAddressController.controller",
        "kyee.quyiyuan.appointment.result.controller",
        "kyee.quyiyuan.appointment.video_interrogation.service",
        "kyee.framework.device.deviceinfo",
        "kyee.framework.device.camera",
        "kyee.quyiyuan.appointment.appointment_regist_detil.service",
        "kyee.quyiyuan.appointment.purchase_medince.service",
        "kyee.quyiyuan.appointment.result.service",
        "kyee.quyiyuan.aboutquyi.newFeedback.controller",
        "kyee.framework.service.view",
        "kyee.framework.service.message",
        "kyee.framework.device.deviceinfo",
        "kyee.framework.device.message",
        "kyee.framework.device.camera",
        "kyee.quyiyuan.patients_group.personal_chat.service",
        "kyee.quyiyuan.emoji.service",
        "kyee.quyiyuan.login.service",
        "kyee.quyiyuan.consultation.consult_order_detail.service",
        "kyee.quyiyuan.appointment.connect_doctor.service"
    ])
    .type("controller")
    .name("PurchaseMedicineController")
    .params(["$scope", "$state","$ionicHistory", "KyeeViewService", "AppointConfirmService", "AppointmentDeptGroupService",
        "CacheServiceBus", "KyeeMessageService", "QueryHisCardService", "CustomPatientService",
        "KyeeListenerRegister", "HospitalService", "AuthenticationService",
        "AppointmentCreateCardService","AppointmentDoctorDetailService","KyeePhoneService","$ionicScrollDelegate","KyeeI18nService",
        "CommPatientDetailService","PatientCardService",
        "PurchaseMedinceService","KyeeDeviceInfoService","KyeeUtilsService","AppointmentRegistDetilService",
        "KyeeCameraService","PersonalChatService","LoginService",
        "ConntectDoctorService","AppointmentRegistListService","ShowPicturesService","$window","RsaUtilService","RegistConfirmService",
        "PayOrderService","ConsultOrderDetailService"])
    .action(function ($scope, $state,$ionicHistory, KyeeViewService, AppointConfirmService, AppointmentDeptGroupService,
                      CacheServiceBus, KyeeMessageService, QueryHisCardService, CustomPatientService,
                      KyeeListenerRegister, HospitalService, AuthenticationService,
                      AppointmentCreateCardService,AppointmentDoctorDetailService,KyeePhoneService,$ionicScrollDelegate,KyeeI18nService,
                      CommPatientDetailService,PatientCardService,PurchaseMedinceService,KyeeDeviceInfoService,KyeeUtilsService,
                      AppointmentRegistDetilService,KyeeCameraService,PersonalChatService,LoginService,
                      ConntectDoctorService,AppointmentRegistListService,ShowPicturesService,$window,RsaUtilService,RegistConfirmService,
                      PayOrderService,ConsultOrderDetailService){
        var memoryCache = CacheServiceBus.getMemoryCache();
        var storageCache = CacheServiceBus.getStorageCache();
        var screenSize = KyeeUtilsService.getInnerSize();//屏幕尺寸
        $scope.windowHeight = screenSize.height - 44;//窗口高度
        $scope.windowWidth = screenSize.width;//窗口宽度
        var selSchedule = [];
        $scope.IMGLIST=[]; //图片上传列表
        $scope.distributionChoose=1;
        $scope.netHosRegistFeeType = PurchaseMedinceService.netHosRegistFeeType; //网络医院挂号收款模式

        var addNewCardStyle = "<div style='display: block; width: 100%;'><div style='text-align:center;vertical-align: middle;display:flex;justify-content:center;height:36px;line-height:36px;border-radius:2px;border:1px solid #5baa8a;background-color:white;margin:14px'> <i class='icon ion-plus f18 qy-green' style='display: inline-block;'></i><span class='f14 qy-green' style='padding-left: 10px;display: inline-block'> 添加新就诊卡 </span></div></div>";
        $scope.currentStatusCode = '1';//当前页面处于的状态-补充信息
        // 头部状态栏展示所需数据
        $scope.statusData = [
            {
                'statusCode': 1,
                'statusName': '网络挂号'
            }, {
                'statusCode': 2,
                'statusName': '申请填单'

            }, {
                'statusCode': 3,
                'statusName': '医生响应'
            }, {
                'statusCode': 4,
                'statusName': '订单完成'
            }
        ];

        /**
         *  获取URL参数
         */
        function getQueryString(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = $window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        }

        $scope.imageWidth = parseInt((window.innerWidth - 14 * 2 - 10 * 3) / 4); //动态计算每一张图的宽度(按照放四张的比例)
        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "purchase_medince",
            direction: "both",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function (params) {


                $scope.IMGLIST=[];
                $scope.CONFIRM_BACK = false;
                $scope.currentStatusCode = '1';//当前页面处于的状态-补充信息
                $scope.distributionChoose=1;
                // 头部状态栏展示所需数据
                $scope.statusData = [
                    {
                        'statusCode': 1,
                        'statusName': '网络挂号'
                    }, {
                        'statusCode': 2,
                        'statusName': '申请填单'

                    }, {
                        'statusCode': 3,
                        'statusName': '医生响应'
                    }, {
                        'statusCode': 4,
                        'statusName': '订单完成'
                    }
                ];
                //重新从缓存中获取数据
                if($scope.notEmpty(PurchaseMedinceService.REG_ID)){
                    //查看详情
                    $scope.regId= PurchaseMedinceService.REG_ID;
                    $scope.requestBackShow = false;
                    $scope.toDetail();
                }else if(ConsultOrderDetailService.isFromWeiXin && getQueryString("regId")!=null){
                    //检测是否为微信推送的内容
                    var regId  = getQueryString("regId");
                    var hospitalId = getQueryString("hospitalId");
                    var param={
                        REG_ID:regId,
                        HOSPITAL_ID:hospitalId
                    };
                    PurchaseMedinceService.queryDetail(param,function(data){
                        ConsultOrderDetailService.isFromWeiXin = false;
                        PurchaseMedinceService.wxJoin = true;
                        $scope.goToComment(data);
                    });
                    return;
                }else{
                    $scope.hasRegId = false;
                    $scope.initAppointConfirm();   //初始化数据
                }
            }
        });

        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "purchase_medince",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.backToDoctorInfo();
            }
        });
        /**
         * 获取当前设备平台 iOS or android
         */
        KyeeDeviceInfoService.getInfo(function (info) {
            $scope.platform = info.platform;
        }, function () {
        });
        /**
         * 一键反馈
         */
        $scope.goFeedback = function () {
            $state.go("aboutquyi_feedback");
        };
        //判断非空的方法
        $scope.notEmpty = function(data){
            if(data!=undefined&&data!=''&&data!=null){
                return true;
            }else{
                return false
            }
        };
        //动态设置输入框的高度
        $scope.illDescriptFatherALl = function(){
            var observe;
            if (window.attachEvent) {
                observe = function (element, event, handler) {
                    element.attachEvent('on'+event, handler);
                };
            }
            else {
                observe = function (element, event, handler) {
                    element.addEventListener(event, handler, false);
                };
            }
            var descript = document.getElementById('illnessDesc');
            var medicineList = document.getElementById('medicineList');
            var checkList = document.getElementById('checkList');
            function resize () {
                descript.style.height = 'auto';
                descript.style.height = descript.scrollHeight+'px';
                medicineList.style.height = '23px';
                medicineList.style.height = (medicineList.scrollHeight)+'px';
                checkList.style.height = '23px';
                checkList.style.height = (checkList.scrollHeight)+'px';
            }
            /* 0-timeout to get the already changed text */
            function delayedResize () {
                //window.setTimeout(resize, 0);
                resize();
            }
            observe(descript, 'input',  delayedResize);
            observe(descript, 'cut',     delayedResize);
            observe(descript, 'paste',   delayedResize);
            observe(medicineList, 'input',  delayedResize);
            observe(medicineList, 'cut',     delayedResize);
            observe(medicineList, 'paste',   delayedResize);
            observe(checkList, 'input',  delayedResize);
            observe(checkList, 'cut',     delayedResize);
            observe(checkList, 'paste',   delayedResize);
        };
        //查看详情
        $scope.toDetail = function() {
            storageCache = CacheServiceBus.getStorageCache();
            //获取缓存中医院信息
            var hospitalinfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            var param={
                REG_ID:$scope.regId,
                HOSPITAL_ID:hospitalinfo.id
            };
            PurchaseMedinceService.queryDetail(param,function(data){
                $scope.DETAIL_DATA = data;
                $scope.iconColor = $scope.getIconColor(data);//判断显示图标
                $scope.hasRegId = true;
                $scope.requestBackShow = true;
                var businessStatus=data.BUSINESS_STATUS; // -1表示失败或者预约挂号中 0:申请填单中;1:等待医生响应;2:购药/开单完成;3:超时未响应,4:订单失效 5:取消问诊
                switch(businessStatus)
                {
                    case '-2':
                        $scope.clinicDue=2;// 填单申请失败
                        $scope.appointFaill=true;
                        break;
                    case '-1':
                        $scope.clinicDue=2;//网络挂号处理中 或 填单申请处理中
                        $scope.appointFaill=true;
                        break;
                    case '0':
                        $scope.clinicDue=2;//申请填单中
                        $scope.isToApply=true;
                        break;
                    case '1':
                    case '7':
                        $scope.clinicDue=3;//等待医生响应
                        break;
                    case '2':
                        $scope.clinicDue=4;//购药/开单完成
                        $scope.clinicFinish=true;
                        break;
                    case '3':
                        $scope.clinicDue=4;//超时未响应
                        $scope.outTime=true;
                        break;
                    case '4':
                        $scope.clinicDue=2;//订单失效
                        $scope.orderUnuse=true;//4:订单失效
                        break;
                }
                if($scope.clinicDue==4){
                    $scope.currentStatusCode =5;//当前页面处于的状态-补充信息
                }else{
                    $scope.currentStatusCode = $scope.clinicDue;//当前页面处于的状态-补充信息
                }

                // 头部状态栏展示所需数据
                if($scope.outTime){
                    $scope.statusData = [
                        {
                            'statusCode': 1,
                            'statusName': '网络挂号'
                        }, {
                            'statusCode': 2,
                            'statusName': '申请填单'

                        }, {
                            'statusCode': 3,
                            'statusName': '医生响应'
                        }, {
                            'statusCode': 4,
                            'statusName': '超时未响应'
                        }
                    ];
                }
                $scope.hospitalName=data.HOSPITAL_NAME;
                $scope.cardNo=data.CARD_NO;
                $scope.idNo=data.ID_NO;//141***********0134,
                $scope.checkList=data.EXAM_TEST_ITEMS;//
                $scope.applyFlag=data.APPLY_FLAG; // true/ false
                $scope.tipsMessage=data.TIPS_MESSAGE;//注：（语句）
                $scope.promptMsg=data.PROMPT_MESSAGE;//温馨提示
                $scope.businessDesc=data.BUSINESS_STATUS_DESC; //预约业务状态语句描述
                $scope.illnessDesc=data.CONDITION_DESCRIPTION; //病情描述
                $scope.clinicType=data.CLINIC_TYPE;//副主任,
                $scope.sumFee = data.AMOUNT;
                var receiveAddress = data.DRUG_DELIVERY_INFO;//PHONE:18700980757,ADDRESS:安徽省亳州市谯城区1, NAME:123
                if(receiveAddress){
                    $scope.receiveStartTel=receiveAddress.PHONE;
                    $scope.Clientinfo={
                        ADDRESS_NAME:receiveAddress.NAME,
                        ADDRESS_DETAIL:receiveAddress.ADDRESS
                    }
                }
                $scope.medicineList=data.DRUG_LIST;
                $scope.petientName=data.PATIENT_NAME;
                $scope.doctorReminder=data.DOCTOR_REMINDER;
                $scope.applyTime= data.APPLY_TIME;
                $scope.appointType = data.APPOINT_TYPE;
                $scope.checkImg=data.EXAM_TEST_ITEMS_PICTURE;
                $scope.doctorName=data.DOCTOR_NAME; //李医生
                $scope.doctorTitle=data.CLINIC_TYPE;//(副主任),
                $scope.regDate=data.REG_DATE; //2017/04/13 白天,
                $scope.commentFlag= data.COMMENT_FLAG;
                $scope.contactDoctorFlag=data.CONTACT_DOCTOR_FLAG;//联系医生按钮
                $scope.suggestFlag=data.SUGGEST_FLAG; //意见反馈的标志按钮 true/ false
                $scope.cancelFlag=data.CANCEL_FLAG; //是否支持取消按钮 true/false
                $scope.cancelAction=data.CANCEL_ACTION; //支持取消按钮 0 预约/1 挂号
                $scope.viewChatLogFlag=data.VIEW_CHAT_LOG_FLAG ; //聊天记录按钮 true/false
                $scope.commonButton=data.COMMENT_BUTTON_NAME;
                $scope.doctorPhoto = data.DOCTOR_PHOTO;
                $scope.doctorSex=data.DOCTOR_SEX;
                $scope.hospitalPhoto=data.HOSPIAL_PHOTO;
                if(!data.HOSPIAL_PHOTO){
                    $scope.hospitalPhoto='resource/images/icons/logo_default.png';
                }
                $scope.refreshFlag=data.REFRESH_FALG; //是否刷新
                $scope.serverType=data.SERVICE_TYPE;// 医生端返回的服务类型,0:开单,开药;1:开单;2:开药;
                var tempList = [];
                $scope.IMGLIST= $scope.tempImgList(data.DRUG_LIST_PICTURE,tempList);
                $ionicScrollDelegate.$getByHandle("purchase_medince_content").resize();
                $ionicScrollDelegate.$getByHandle("purchase_medince_content").scrollTop();
                if(data.NEED_SEND_IM){
                    $scope.ToDoctorMessage(data);
                    //更新购药发送IM状态为已发送
                    PurchaseMedinceService.updateBusinessStatus($scope.regId);
                }

            });
        };
        //点击添加新就诊卡时跳转界面
        $scope.toAddNewCard = function() {
            //预约挂号确认页面进入查卡页面标识
            PatientCardService.fromSource = "fromAppoint";
            PatientCardService.fromAppoint = true;
            PatientCardService.fromPatientCard = false;
            $state.go("patient_card_add");
        };

        //跳转到配送范围页面
        $scope.toSendAddress = function () {
            KyeeViewService.openModalFromUrl({
                url: "modules/business/appoint/views/send_address.html",
                scope: $scope,
                animation: "scale-in"
            });
        };

        //选择配送
        $scope.chooseDistrion=function(){
            if($scope.distribitionType==1){
                $scope.distributionChoose= $scope.distributionChoose==0?1:0;
            }
            $ionicScrollDelegate.$getByHandle("purchase_medince_content").resize();
            $ionicScrollDelegate.$getByHandle("purchase_medince_content").scrollBottom();
        };


        //单击返回按钮，返回到医生详情页面
        $scope.backToDoctorInfo=function(){
            if(!$scope.notEmpty(PurchaseMedinceService.REG_ID)){
                AppointmentDoctorDetailService.activeTab = 2;
                $state.go("doctor_info");
            }else{
                if(PurchaseMedinceService.ROUTER=='doctor_info'&&$scope.CONFIRM_BACK){
                    $state.go("myquyi->MAIN_TAB.medicalGuide");
                }else if(PurchaseMedinceService.ROUTER=='myquyi->MAIN_TAB'){
                    $state.go("myquyi->MAIN_TAB");
                } else{
                    var backView = $ionicHistory.backView();
                    if (backView && backView.stateId === "doctor_info"){
                        AppointmentDoctorDetailService.activeTab = 2;
                    }
                    if(backView && backView.stateId === 'personal_chat'){
                        PersonalChatService.pullMessageList = false;
                    }
                    $ionicHistory.goBack(-1);
                }
            }
        };
        //绑定选择事件
        $scope.bind = function (params) {
            $scope.showPicker = params.show;
        };

        //查看配送范围
        $scope.toCheckDistributionScope =function(){
            var hospital_info = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            var hospitalId = hospital_info.id;
            var param={
                hospitalID:hospitalId,
                addressId:$scope.Clientinfo.ADDRESS_ID
            };
            PurchaseMedinceService.checkDistributionScope(param,function(data){
                if(data.success){
                    $scope.isInRegion=true;
                }else{
                    $scope.isInRegion=false;
                }
            });
        };
        //跳转到选择地址界面
        $scope.toAddAddress = function () {
            $state.go("address_manage");
        };

        //评价医生
        $scope.goToComment = function(DETAIL_DATA) {
            var detailData  = angular.copy(DETAIL_DATA);
            detailData.DOCTOR_PIC_PATH =detailData.DOCTOR_PHOTO;
            detailData.DRUG_LIST_PICTURE = null;
            detailData.EXAM_TEST_ITEMS_PICTURE = null;
            AppointmentRegistListService.goToComment(detailData);
        };

        //取消
        $scope.cancelAppointOrRegist= function () {
            if ($scope.cancelAction == 0) { //预约
                $scope.cancleAppoint();
            } else {   //挂号
                $scope.cancelRegist();
            }
        };
        //取消预约记录
        $scope.cancleAppoint=function(){
            var hospitalinfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
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
                                hospitalId: hospitalinfo.id,
                                regId: $scope.regId,
                                cRegId: $scope.regId
                            };
                            AppointmentRegistDetilService.appointCancel(regCanPara, function (){
                                $scope.toDetail();
                            })
                        }
                    }
                ]
            });
        };
        //点击取消挂号按钮
        $scope.cancelRegist = function () {
            var hospitalinfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            KyeeMessageService.confirm({
                title:  KyeeI18nService.get("appointment_regist_deti.cancelmessage","取消提示"),
                content:  KyeeI18nService.get("appointment_regist_deti.isCancelRegist","是否取消该挂号？"),
                onSelect: function (select) {
                    if (select) {
                        var regCanPara = {
                            hospitalId:hospitalinfo.id,
                            regId: $scope.regId,
                            cRegId: $scope.regId,
                            userId: ''
                        };
                        AppointmentRegistDetilService.registCancel(regCanPara, function (detilData) {
                            $scope.toDetail();
                        })
                    }
                }
            });
            $ionicScrollDelegate.$getByHandle("appointment_detail").scrollTop();
        };

        //点击选择从相册中选择图片
        $scope.choosePhoto = function (){
            if(typeof(device) == "undefined" || !(device.platform == "Android"||device.platform == "iOS")){
                KyeeMessageService.broadcast({
                    content: "暂不支持，请使用趣医院APP上传照片"
                });
                return;
            }
            var options = {
                maximumImagesCount:(9-$scope.IMGLIST.length),
                quality: 50
            };
            KyeeCameraService.getPictures(
                // 调用成功时返回的值
                function (retVal) {
                    $scope.IMGLIST=$scope.tempImgList(retVal,$scope.IMGLIST);
                    setTimeout(function () {
                        $scope.$apply();
                    }, 1);
                },
                // 调用失败时返回的值
                function (retVal) {
                }, options
            );
        };
        $scope.tempImgList = function(IMG_LIST,tempList){
            if($scope.notEmpty(IMG_LIST)){
                var tempImg = {
                    imgUrl:""
                };
                for (var i = 0; i < IMG_LIST.length; i++) {
                    tempImg.imgUrl  = IMG_LIST[i];
                    tempList.push(angular.copy(tempImg));
                }
            }
            return tempList;
        };
        //点击下一步按钮，跳转到填单页面
        $scope.nextPage = function () {
            //校验就诊者卡信息
            if (!$scope.patientInf.CARD_NO || !$scope.patientInf.CARD_SHOW) {
                //校验就诊者卡失败，向后端发送家这款校验失败的请求
                AppointConfirmService.choosePatientIdCardCheck();
                // 前端校验阻塞后发送请求
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("appoint_confirm.noCard","请选择就诊卡")
                });
                return;
            }
            //如果为远程建卡
            if ($scope.PATIENT_ID == -1) {
                $scope.PATIENT_ID = '';
                $scope.patientInf.CARD_NO = '';
            }
            var addressId='';
            //如果必选地址，或者用户勾选了地址，则判断是否有address_id
            if($scope.distribitionType==2||($scope.distribitionType==1&&$scope.distributionChoose==1)){  //如果是必选的配送
                if($scope.Clientinfo.ADDRESS_ID==null||$scope.Clientinfo.ADDRESS_ID==''||$scope.Clientinfo.ADDRESS_ID==undefined){
                    KyeeMessageService.broadcast({
                        content: "请选择收货地址",
                        duration: 3000
                    });
                    return;
                }else if(!$scope.isInRegion){
                    KyeeMessageService.broadcast({
                        content: "该地址不在配送范围之内，请重新选择收货地址",
                        duration: 3000
                    });
                    return;
                }
                addressId = $scope.Clientinfo.ADDRESS_ID;
            }
            // 判断出生证号是否合法
            if ($scope.birthNumberSwitchNew == "1" ) {
                var regExpress = /^[A-Za-z0-9]+$/;
                if ($scope.patientInf.BIRTH_CERTIFICATE_NO == undefined || $scope.patientInf.BIRTH_CERTIFICATE_NO == null || $scope.patientInf.BIRTH_CERTIFICATE_NO == "") {
                    KyeeMessageService.broadcast({
                        content:  KyeeI18nService.get("appoint_confirm.birthCertificateNoError1","请输入出生证号！"),
                        duration: 3000
                    });
                    return;
                } else if (!regExpress.test($scope.patientInf.BIRTH_CERTIFICATE_NO)) {
                    KyeeMessageService.broadcast({
                        content:  KyeeI18nService.get("appoint_confirm.birthCertificateNoError2","出生证号不合法！"),
                        duration: 3000
                    });
                    return;
                }
            }
            $scope.clinicDue=2;
            $scope.currentStatusCode = 2;
            //填单数据初始化
            $scope.diseaseInfo = {
                illnessDesc: '',
                medicineList: '',
                checkList: ''
            };
            //动态设置输入框高度
            setTimeout(function(){
                $scope.illDescriptFatherALl()
            },10)
        };

        //点击提交申请
        $scope.toAppoint=function() {
            //判断数据是否填写完整
            var illnessDesc = $scope.diseaseInfo.illnessDesc.replace(/\s/g, "&nbsp;").replace(/\n|\r\n/g, "<br>");
            var medicineList = $scope.diseaseInfo.medicineList.replace(/\s/g, "&nbsp;").replace(/\n|\r\n/g, "<br>");
            var checkList = $scope.diseaseInfo.checkList.replace(/\s/g, "&nbsp;").replace(/\n|\r\n/g, "<br>");

            if (illnessDesc.length == 0) {
                KyeeMessageService.broadcast({
                    content: "病情描述不能为空",
                    duration: 5000
                });
                return;
            } else if (illnessDesc.length <= 20) {
                KyeeMessageService.broadcast({
                    content: "病情描述字数不能小于20",
                    duration: 5000
                });
                return;
            } else if (illnessDesc.length > 200) {
                KyeeMessageService.broadcast({
                    content: "病情描述字数不能大于200",
                    duration: 5000
                });
                return;
            } else if (!validInputValue(illnessDesc)) {
                return;
            }
            if (medicineList.length == 0 && checkList.length == 0) {
                KyeeMessageService.broadcast({
                    content: "药品清单或者检查检验单不能都为空",
                    duration: 5000
                });
                return;
            } else if (medicineList.length != 0 && !validInputValue(medicineList)) {
                return;
            } else if (checkList.length != 0 && !validInputValue(checkList)) {
                return;
            }
            $scope.CONDITION_DESCRIPTION = illnessDesc;
            $scope.DRUG_LIST = medicineList;
            $scope.EXAM_TEST_ITEMS = checkList;

            //获取缓存中当前登录用户信息
            var currentUser = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            //获取缓存中医院信息
            var hospitalInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            //获取缓存中当前就诊者信息
            var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            //生成唯一值，用于存储购药开单记录，作为REG_ID更新前提条件
            $scope.sequenceNo = '' + currentPatient.USER_ID + new Date().getTime();
            //获取缓存中当前就诊卡信息
            var currentCardinf = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO);
            //获取缓存中记录的患者预约输入的物理卡号
            var medicalCardNo = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.MEDICAL_CARDNO);
            //预约来源
            var appointSource = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);
            //如果必选地址，或者用户勾选了地址，则判断是否有address_id
            var addressId='';
            if($scope.distribitionType==2||($scope.distribitionType==1&&$scope.distributionChoose==1)){  //如果是必选的配送
                addressId = $scope.Clientinfo.ADDRESS_ID;
            }

            var paramsConfirm = {
                "hospitalId": hospitalInfo.id,
                "hospitalID": hospitalInfo.id,
                "postdata": {
                    "DEPT_CODE": $scope.deptCode,
                    "DEPT_NAME": $scope.deptName,
                    "DOCTOR_CODE": $scope.Appointconfrimdoctor.DOCTOR_CODE,
                    "DOCTOR_NAME": $scope.Appointconfrimdoctor.DOCTOR_NAME,
                    "MARK_DESC": $scope.AppointconfrimSchedule.CLINIC_LABEL,//号别
                    "CLINIC_TYPE": $scope.AppointconfrimSchedule.CLINIC_TYPE,
                    "REG_DATE": $scope.AppointconfrimSchedule.CLINIC_DATE,//预约日期
                    "CLINIC_DURATION": $scope.AppointconfrimSchedule.CLINIC_DURATION,//午别
                    "IS_ONLINE": '1',   //医院网络在线
                    "AMOUNT": $scope.AppointconfrimSchedule.SUM_FEE,//预约费用
                    "AMOUNT_TEXT": $scope.registAmount,//显示¥的挂号费用
                    "AMOUNT_TYPE":'0',//挂号费别：0:普通；1:特殊人群优惠
                    "PATIENT_ID": $scope.PATIENT_ID,//----------------------------
                    "PATIENT_NAME": $scope.petientName,
                    "ID_NO": currentPatient.ID_NO,//身份证
                    "ID_NO_STAR": $scope.idNo,//加*的身份证
                    "BIRTH_CERTIFICATE_NO":$scope.patientInf.BIRTH_CERTIFICATE_NO, // 出生证号  //TODO
                    "PHONE_NUMBER": currentPatient.PHONE,//不加* 的电话号码
                    "PHONE_NUMBER_STAR": $scope.PHONE_NUMBER,//加*的手机号
                    "LOC_INFO": $scope.AppointconfrimSchedule.CLINIC_POSITION,//门诊位置
                    "CARD_NO": $scope.patientInf.CARD_NO,//----------------------------------------
                    "HID": $scope.HID,//获取号源
                    "PHARMACY_FEE": $scope.AppointconfrimSchedule.PHARMACY_FEE,
                    "DIAG_FEE": $scope.AppointconfrimSchedule.DIAG_FEE,
                    "CARD_PWD": AppointmentCreateCardService.password,
                    "HB_TYPE":$scope.appointClinicData.HB_TYPE,
                    "HB_NO":$scope.appointClinicData.HB_NO,
                    "HIS_SCHEDULE_ID":''
                },
                "MARK_DESC": $scope.AppointconfrimSchedule,//号别
                "HID": $scope.HID + "/" + $scope.CLINIC_DURATION,
                "AMOUNT": $scope.AppointconfrimSchedule.SUM_FEE,
                "USER_ID": currentUser.USER_ID,
                "PATIENT_ID": $scope.PATIENT_ID,//-----------------------------
                "USER_VS_ID": currentPatient.USER_VS_ID,
                "APPOINT_SOURCE": appointSource,//预约来源
                "PHONE": currentUser.PHONE_NUMBER,
                "ADDRESS_ID": addressId,//地址ID
                "DEPT_CODE": $scope.deptData.DEPT_CODE,
                "IS_ONLINE": '1',   //医院网络在线
                "IS_REFERRAL":$scope.IS_REFERRAL,
                "REFERRAL_REG_ID":AppointmentDeptGroupService.REFERRAL_REG_ID,
                "REFERRAL_DIRECTION":AppointmentDeptGroupService.REFERRAL_DIRECTION,
                "HOSPITAL_AREA":$scope.AppointconfrimSchedule.HOSPITAL_AREA,
                "ONLINE_BUSINESS_TYPE":'1', //0：视频问诊    1：购药开单
                "IMG_SEQUENCE_NO":$scope.sequenceNo //唯一键值，用于存储购药开单记录，作为REG_ID更新前提条件
            };
            if($scope.businessType == '0'){//预约
                //预约不缴费
                appointNoPayRequest(paramsConfirm);
            }else {// 挂号
                //确认挂号请求
                var isVerifyMedicalCard = hospitalInfo.is_regist_card_pwd;//挂号是否输入卡号，卡密码 0：不输入就诊卡号，密码 1：输入就诊卡号
                if (isVerifyMedicalCard == "1" && paramsConfirm.postdata.CARD_NO != '') {
                    //挂号需要输入卡号，密码对象
                    $scope.isVerifyRegistMedicalCard = {
                        IN_CARDNO: $scope.patientInf.CARD_NO,//无需存入缓存，现在如果挂号成功，后台会有机制将此卡号设置为默认卡号，下次会自动查询出来，前台无需处理  -张明
                        IN_CARDPWD: ""
                    };
                    //输入就诊卡密码
                    inputCardPwd(paramsConfirm);
                } else {
                    registPayRequest(paramsConfirm);
                }
            }

        };


        //预约不缴费
        var appointNoPayRequest = function (paramsConfirm) {
            //在点击提交申请时，发请求去后台更新默认卡   wangwan KYEEAPPC-4470
            QueryHisCardService.updateCardByUserVsId(function () {
            }, paramsConfirm.USER_VS_ID, paramsConfirm.postdata.CARD_NO, paramsConfirm.hospitalId, true);

            var paramDetail = {
                IMG_SEQUENCE_NO: $scope.sequenceNo, //唯一键值，用于存储购药开单记录，作为REG_ID更新前提条件
                CONDITION_DESCRIPTION: $scope.CONDITION_DESCRIPTION, //病情描述
                DRUG_LIST: $scope.DRUG_LIST, //药品清单
                EXAM_TEST_ITEMS: $scope.EXAM_TEST_ITEMS //检查检验项目
            };
            //提交图片
            var result = $scope.IMGLIST;
            if (result.length > 0) {
                var param = {
                    IMG_SEQUENCE_NO: $scope.sequenceNo,
                    HOSPITAL_ID: paramsConfirm.hospitalId,
                    INDEX: 1,
                    opVersion:DeploymentConfig.VERSION
                };
                PurchaseMedinceService.uploadPicList = angular.copy(result);
                PurchaseMedinceService.PICTURE_PARAM = angular.copy(param);
                //上传图片
                PurchaseMedinceService.uploadPictures(function() {
                    //预约
                    confirmAppointInfo(paramsConfirm, function(regId) {
                        //保存填单数据，更新记录regId
                        paramDetail.REG_ID = regId;
                        PurchaseMedinceService.confirmPurchaseInfo(paramDetail, function (data) {
                            $scope.toDetail();
                        });
                    });
                });

            } else {
                //预约
                confirmAppointInfo(paramsConfirm, function(regId) {
                    //保存填单数据，更新记录regId
                    paramDetail.REG_ID = regId;
                    PurchaseMedinceService.confirmPurchaseInfo(paramDetail, function (data) {
                        $scope.toDetail();
                    });
                });

            }
        };

        //预约
        var confirmAppointInfo = function(paramsConfirm, onSuccess){
            //获取缓存中医院信息
            var hospitalInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            AppointConfirmService.confirmAppointNopay(paramsConfirm, function (data) {
                //预约不缴费处理成功，跳转到我的趣医
                if (data.success) {
                    $scope.regId=data.data.REG_ID;
                    $scope.clinicDue=2;
                    if (hospitalInfo.id == "1001") {
                        KyeeMessageService.message({
                            title: KyeeI18nService.get("appoint_confirm.message","消息"),
                            content: KyeeI18nService.get("appoint_confirm.hospitalmessage","体验医院仅供用户体验，不能作为实际就诊依据"),
                            tapBgToClose:true,
                            onOk:function(message){
                                PurchaseMedinceService.REG_ID=$scope.regId;
                                $scope.CONFIRM_BACK = true;
                            }
                        });
                    }
                    else {
                        $scope.clinicDue=2;
                        PurchaseMedinceService.REG_ID=$scope.regId;
                        $scope.CONFIRM_BACK = true;
                    }
                    onSuccess($scope.regId);
                }
                //预约失败，您今日已经在该科室预约过，不能重复预约！
                else if (data.resultCode == "0020405") {
                    KyeeMessageService.broadcast({
                        content: data.message,
                        duration: 5000
                    });
                }
                // 校验就诊者信息
                else if (data.resultCode == "0020638") {
                    KyeeMessageService.broadcast({
                        content: data.message,
                        duration: 5000
                    });
                    var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                    var current = angular.copy(currentPatient);//可直接操作缓存问题
                    CommPatientDetailService.editPatient(current);
                }
                //请绑定就诊者的手机号后，再进行预约
                else if (data.resultCode == "0020505") {
                    KyeeMessageService.broadcast({
                        content: data.message,
                        duration: 5000
                    });
                }
                //请绑定个人信息的手机号后，再进行预约
                else if (data.resultCode == "0020504") {
                    KyeeMessageService.broadcast({
                        content: data.message,
                        duration: 5000
                    });
                }
                //预约不支持虚拟卡
                else if (data.resultCode == "0020503") {
                    KyeeMessageService.broadcast({
                        content: data.message,
                        duration: 5000
                    });
                }
                //需要实名认证后再预约挂号  By  章剑飞  KYEEAPPC-2862
                else if (data.resultCode == "0020526") {
                    if (data.data.flag == '0') {
                        KyeeMessageService.broadcast({
                            content: data.message
                        });
                    } else {
                        KyeeMessageService.confirm({
                            content: data.message,
                            onSelect: function (confirm) {
                                if (confirm) {
                                    AuthenticationService.lastClass = 'appointConfirm';
                                    var userInfo = memoryCache.get('currentCustomPatient');
                                    AuthenticationService.HOSPITAL_SM = {
                                        OFTEN_NAME: userInfo.OFTEN_NAME,
                                        ID_NO: userInfo.ID_NO,
                                        PHONE: userInfo.PHONE,
                                        USER_VS_ID:userInfo.USER_VS_ID,// 【个人中心】实名认证增加传入后台参数  By  张家豪  KYEEAPPC-3404
                                        FLAG: data.data.flag
                                    };
                                    //跳转页面
                                    $scope.openModal('modules/business/center/views/authentication/authentication.html');
                                }
                            }
                        });
                    }
                }
                // 黑名单提示
                else if (data.resultCode == "0020612") {
                    var buttons = [{
                        text:  KyeeI18nService.get("appoint_confirm.back","返回"),
                        click: function () {
                            $scope.dialog.close();
                        }
                    }, {
                        text: KyeeI18nService.get("appoint_confirm.callPhone","拨打电话"),
                        style: "button button-block button-size-l",
                        click: function () {
                            click2call();
                        }
                    }];
                    if(data.message.indexOf('意见反馈')>-1){
                        data.message = data.message.replace('意见反馈', '<span class="qy-blue text_decoration" ng-click="gofeedback()">意见反馈</span>');
                    }
                    //弹出对话框
                    $scope.blacklistDetail = data.message;
                    footerClick();
                    $scope.dialog = KyeeMessageService.dialog({
                        tapBgToClose : true,
                        template: "modules/business/regist/views/delay_views/blacklist_detail.html",
                        scope: $scope,
                        title: KyeeI18nService.get("appoint_confirm.userError","账号操作异常"),
                        buttons: buttons
                    });
                    click2call = function () {
                        KyeePhoneService.callOnly("4000801010");
                    };
                }
                //增加爽约限制提示
                else if(data.resultCode=="0020533"){
                    $scope.userMessage = data.message;
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
                }
                //儿童是否校验
                else if(data.resultCode == "0020539"){
                    var buttons = [{
                        text:  KyeeI18nService.get("appoint_confirm.confirmMsgPerfect","前往完善"),
                        style: "button button-block button-size-l",
                        click: function () {
                            $scope.dialog.close();
                            var patient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                            patient.orgphone = patient.PHONE; //储存一个手机号来对比手机号是否产生变化
                            patient.idnumber = patient.ID_NO; //储存一个身份证号来对比手机号是否产生变化
                            patient.loginNum = "";         //短信验证码制空
                            var people = angular.copy(patient);
                            CommPatientDetailService.item = people;
                            CommPatientDetailService.F_L_A_G = "appoint_confirm";
                            $state.go('comm_patient_detail');
                        }
                    }];
                    //弹出对话框
                    $scope.userMessage = data.message;
                    $scope.dialog = KyeeMessageService.dialog({
                        tapBgToClose : true,
                        template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                        scope: $scope,
                        title:KyeeI18nService.get("appoint_confirm.messageTitle","温馨提示"),
                        buttons: buttons
                    });
                }
                // 成人挂儿科的限制
                else if (data.resultCode == "0020620") {
                    var buttons = [{
                        text:  KyeeI18nService.get("appoint_confirm.isOk","确定"),
                        style: "button button-block button-size-l",
                        click: function () {
                            $scope.dialog.close();
                        }
                    }];
                    //弹出对话框
                    $scope.ageLimit = data.message;
                    $scope.dialog = KyeeMessageService.dialog({
                        template: "modules/business/regist/views/delay_views/age_limit.html",
                        scope: $scope,
                        title:KyeeI18nService.get("appoint_confirm.messageTitle","温馨提示"),
                        buttons: buttons
                    });
                }
                else {
                    KyeeMessageService.broadcast({
                        content: data.message,
                        duration: 5000
                    });
                }
            });
        };

        //挂号确认界面输入就诊卡密码  张明  KYEEAPPC-3020
        var inputCardPwd = function (paramsConfirm) {
            var dialog = KyeeMessageService.dialog({
                template: "modules/business/regist/views/delay_views/isVerifyMedicalCard.html",
                scope: $scope,
                title: KyeeI18nService.get("regist_confirm.cardVerification","挂号就诊卡验证"),
                buttons: [
                    {
                        text: KyeeI18nService.get("commonText.cancelMsg","取消"),
                        click: function () {
                            dialog.close();
                        }
                    },
                    {
                        text: KyeeI18nService.get("commonText.ensureMsg","确定"),
                        style:'button-size-l',
                        click: function () {
                            if (!$scope.isVerifyRegistMedicalCard.IN_CARDNO || !$scope.isVerifyRegistMedicalCard.IN_CARDPWD) {
                                KyeeMessageService.broadcast({
                                    content: KyeeI18nService.get("regist_confirm.cardOrPassWordCannotEmpty","就诊卡号或密码不能为空"),
                                    duration: 3000
                                });
                            } else {
                                dialog.close();
                                var psw = $scope.isVerifyRegistMedicalCard.IN_CARDPWD;
                                paramsConfirm["postdata"]["CARD_NO"] = $scope.isVerifyRegistMedicalCard.IN_CARDNO;
                                paramsConfirm["postdata"]["CARD_PWD"] = RsaUtilService.getRsaResult(psw);
                                registPayRequest(paramsConfirm);
                            }
                        }
                    }
                ]
            });
        };

        //挂号缴费
        var registPayRequest = function (paramsConfirm) {
            //在点击提交申请时，发请求去后台更新默认卡   wangwan KYEEAPPC-4470
            QueryHisCardService.updateCardByUserVsId(function () {
            }, paramsConfirm.USER_VS_ID, paramsConfirm.postdata.CARD_NO, paramsConfirm.hospitalId, true);

            var paramDetail = {
                IMG_SEQUENCE_NO: $scope.sequenceNo, //唯一键值，用于存储购药开单记录，作为REG_ID更新前提条件
                CONDITION_DESCRIPTION: $scope.CONDITION_DESCRIPTION, //病情描述
                DRUG_LIST: $scope.DRUG_LIST, //药品清单
                EXAM_TEST_ITEMS: $scope.EXAM_TEST_ITEMS //检查检验项目
            };
            //提交图片
            var result = $scope.IMGLIST;
            if (result.length > 0) {
                var param = {
                    IMG_SEQUENCE_NO: $scope.sequenceNo,
                    HOSPITAL_ID: paramsConfirm.hospitalId,
                    INDEX: 1,
                    opVersion:DeploymentConfig.VERSION
                };
                PurchaseMedinceService.uploadPicList = angular.copy(result);
                PurchaseMedinceService.PICTURE_PARAM = angular.copy(param);
                //上传图片
                PurchaseMedinceService.uploadPictures(function() {
                    //挂号并保存填单数据，更新记录regId
                    confirmRegistInfo(paramsConfirm, paramDetail, function(regId) {
                        $scope.toDetail();
                    });
                });

            } else {
                //挂号并保存填单数据，更新记录regId
                confirmRegistInfo(paramsConfirm, paramDetail, function(data) {
                    $scope.toDetail();
                });

            }
        };

        //确认挂号请求  (增加就诊卡密码输入功能，将请求交互方法提出来，方便程序扩展  张明 KYEEAPPC-3020)
        var confirmRegistInfo = function (paramsConfirm, paramDetail, onSuccess) {
            //获取缓存中医院信息
            var hospitalinfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            //在点击确认预约、确认挂号时，发请求去后台更新默认卡   wangwan KYEEAPPC-4470
            QueryHisCardService.updateCardByUserVsId(function () {
            }, paramsConfirm.USER_VS_ID, paramsConfirm.postdata.CARD_NO, paramsConfirm.hospitalID,true);

            RegistConfirmService.confirmRegist(paramsConfirm, function (data) {
                //根据请求返回判断：
                if (data.success) {
                    paramDetail.REG_ID = $scope.regId = PurchaseMedinceService.REG_ID = data.data.REG_ID;
                    //保存填单记录
                    PurchaseMedinceService.confirmPurchaseInfo(paramDetail,function(purchaseDetail){
                        if (data.data.businessType != "REGIST_NOPAY") {
                            // wangchengcheng 2016年1月20日14:44:56 KYEEAPPC-4852
                            data.data["MARK_DESC"] = KyeeI18nService.get("regist_confirm.markDesc","挂号费");
                            data.data["MARK_DETAIL"] = $scope.AppointconfrimSchedule.CLINIC_LABEL;
                            ///////////////////////////////
                            data.data["FEE_TYPE"] = $scope.netHosRegistFeeType; // 挂号费用收款模式  0预约挂号模式；1付费咨询模式
                            data.data["FEE_NAME"] = "挂号费"; // 费用名称
                            data.data["AMOUNT"] = $scope.sumFee;    // 费用金额
                            ///////////////////////////////////
                            data.data["flag"] = 1;//用于支付页面 取消支付的状态：1 挂号 2：预约转挂号 3:预约缴费
                            data.data["TRADE_NO"] = data.data.OUT_TRADE_NO;
                            data.data["hospitalID"] = hospitalinfo.id;//由于跨医院，需要将hospitalId传递到支付页面
                            data.data["HID"] = $scope.HID;
                            data.data["CARD_NO"] = $scope.patientInf.CARD_NO;
                            if ($scope.Clientinfo.rows) {
                                data.data["CARD_TYPE"] = '';
                                for (var i = 0; i <$scope.Clientinfo.rows.length; i++) {
                                    if ($scope.patientInf.CARD_NO == $scope.Clientinfo.rows[i].CARD_NO) {
                                        data.data["CARD_TYPE"] = $scope.Clientinfo.rows[i].CARD_TYPE;
                                        break;
                                    }
                                }
                            }
                            data.data["PATIENT_ID"] = $scope.PATIENT_ID;
                            data.data["CLINIC_DURATION"] = $scope.AppointconfrimSchedule.CLINIC_DURATION;
                            data.data["C_REG_ID"] = data.data.REG_ID;
                            //传入确认挂号路由
                            data.data["ROUTER"] = "purchase_medince";
                            //挂号缴费
                            PayOrderService.payData = data.data;
                            $state.go("payOrder");
                        }else{
                            $scope.toDetail();
                        }
                    });
                } else {
                    //挂号不缴费，挂号失败，请重试；
                    if (data.resultCode == "0020602") {
                        KyeeMessageService.broadcast({
                            content: data.message,
                            duration: 5000
                        });
                    }
                    // 校验就诊者信息
                    else if (data.resultCode == "0020638") {
                        KyeeMessageService.broadcast({
                            content: data.message,
                            duration: 5000
                        });
                        var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                        var current = angular.copy(currentPatient);//可直接操作缓存问题   By  张家豪  KYEEAPPTEST-3068
                        CommPatientDetailService.editPatient(current);
                    }
                    //挂号缴费生成订单号失败；
                    else if (data.resultCode == " 0020606") {
                        KyeeMessageService.broadcast({
                            content: data.message,
                            duration: 5000
                        });
                    }
                    //挂号不支持虚拟卡，生成订单号失败；
                    else if (data.resultCode == "0020607") {
                        KyeeMessageService.broadcast({
                            content: data.message,
                            duration: 5000
                        });
                    }
                    //挂号手机号为空，跳转绑定默认就诊者，生成订单号失败
                    else if (data.resultCode == "0020608") {
                        KyeeMessageService.broadcast({
                            content: data.message,
                            duration: 5000
                        });
                        //跳转到默认就诊者信息维护界面
                        //$state.go("update_user");
                        {
                            var patient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                            patient.orgphone = patient.PHONE; //储存一个手机号来对比手机号是否产生变化
                            patient.idnumber = patient.ID_NO; //储存一个身份证号来对比手机号是否产生变化
                            patient.loginNum = "";         //短信验证码制空
                            CommPatientDetailService.item = patient;
                            CommPatientDetailService.F_L_A_G = "regist_confirm";
                            $state.go('comm_patient_detail');
                        }

                    }
                    //挂号手机号为空，跳转绑定附加就诊者，生成订单号失败；
                    else if (data.resultCode == "0020609") {
                        KyeeMessageService.broadcast({
                            content: data.message,
                            duration: 5000
                        });
                        //跳转到附加就诊者信息维护界面
                        $state.go("comm_patient_detail");
                    }
                    //需要实名认证后再预约挂号  By  章剑飞  KYEEAPPC-2862
                    else if (data.resultCode == "0020526") {
                        if (data.data.flag == '0') {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        } else {
                            KyeeMessageService.confirm({
                                content: data.message,
                                onSelect: function (confirm) {
                                    if (confirm) {
                                        AuthenticationService.lastClass = 'appointConfirm';
                                        var userInfo = memoryCache.get('currentCustomPatient');
                                        AuthenticationService.HOSPITAL_SM = {
                                            OFTEN_NAME: userInfo.OFTEN_NAME,
                                            ID_NO: userInfo.ID_NO,
                                            PHONE: userInfo.PHONE,
                                            USER_VS_ID:userInfo.USER_VS_ID,// 【个人中心】实名认证增加传入后台参数  By  张家豪  KYEEAPPC-3404
                                            FLAG: data.data.flag
                                        };
                                        //跳转页面
                                        $scope.openModal('modules/business/center/views/authentication/authentication.html');
                                    }
                                }
                            });
                        }
                    }
                    // 黑名单提示
                    else if (data.resultCode == "0020612") {
                        var buttons = [{
                            text: KyeeI18nService.get("regist_confirm.goBack","返回"),
                            click: function () {
                                $scope.dialog.close();
                            }
                        }, {
                            text: KyeeI18nService.get("regist_confirm.callServicePhone","拨打电话"),
                            style: "button button-block button-size-l",
                            click: function () {
                                click2call();
                            }
                        }];
                        if(data.message.indexOf('意见反馈')>-1){
                            data.message = data.message.replace('意见反馈', '<span class="qy-blue text_decoration" ng-click="gofeedback()">意见反馈</span>');
                        }
                        //弹出对话框
                        $scope.blacklistDetail = data.message;
                        footerClick();
                        $scope.dialog = KyeeMessageService.dialog({
                            tapBgToClose : true,
                            template: "modules/business/regist/views/delay_views/blacklist_detail.html",
                            scope: $scope,
                            title: KyeeI18nService.get("regist_confirm.accountOperationException","账号操作异常"),
                            buttons: buttons
                        });
                        click2call = function () {
                            KyeePhoneService.callOnly("4000801010");
                        };
                    }
                    //增加爽约限制提示
                    else if(data.resultCode=="0020533"){
                        $scope.userMessage = data.message;
                        var dialog = KyeeMessageService.dialog({
                            template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                            scope: $scope,
                            title: KyeeI18nService.get("regist_confirm.kindlyReminder","温馨提示"),
                            buttons: [
                                {
                                    text: KyeeI18nService.get("commonText.ensureMsg","确定"),
                                    style:'button-size-l',
                                    click: function () {
                                        dialog.close();
                                    }
                                }
                            ]
                        });
                    }
                    //儿童是否校验
                    else if(data.resultCode == "0020539"){
                        var buttons = [{
                            text:  KyeeI18nService.get("regist_confirm.confirmMsgPerfect","前往完善"),
                            style: "button button-block button-size-l",
                            click: function () {
                                $scope.dialog.close();
                                var patient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                                patient.orgphone = patient.PHONE; //储存一个手机号来对比手机号是否产生变化
                                patient.idnumber = patient.ID_NO; //储存一个身份证号来对比手机号是否产生变化
                                patient.loginNum = "";         //短信验证码制空
                                var people = angular.copy(patient);
                                CommPatientDetailService.item = people;
                                CommPatientDetailService.F_L_A_G = "regist_confirm";
                                $state.go('comm_patient_detail');
                            }
                        }];
                        //弹出对话框
                        $scope.userMessage = data.message;
                        $scope.dialog = KyeeMessageService.dialog({
                            template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                            scope: $scope,
                            title:KyeeI18nService.get("appoint_confirm.messageTitle","温馨提示"),
                            buttons: buttons
                        });
                    }
                    // 成人挂儿科的限制
                    else if (data.resultCode == "0020620") {
                        var buttons = [{
                            text: KyeeI18nService.get("regist_confirm.confirm","确认"),
                            style: "button button-block button-size-l",
                            click: function () {
                                $scope.dialog.close();
                            }
                        }];
                        //弹出对话框
                        $scope.ageLimit = data.message;
                        $scope.dialog = KyeeMessageService.dialog({
                            template: "modules/business/regist/views/delay_views/age_limit.html",
                            scope: $scope,
                            title: KyeeI18nService.get("regist_confirm.prompt","提示"),
                            buttons: buttons
                        });
                    }
                    else {
                        KyeeMessageService.broadcast({
                            content: data.message,
                            duration: 5000
                        });
                    }
                }
            });
        };

        /**
         * 输入有效验证(汉字，字母，数字，标点符号)
         * @param text
         */
        function validInputValue(text) {
            var reg = /^[\u4E00-\u9FA5A-Za-z 0-9，。、？！.“”（）\-/／：；¥@<>()【】《》{}｛｝\[\]#%^*+=_—\\|～$&·…:;"~£•,?!']*$/;
            if (!reg.test(text)) {
                KyeeMessageService.broadcast({
                    content: "请勿输入中文、英文、数字和常用标点之外的内容！",
                    duration: 3000
                });
                return false;
            }
            return true;
        }
        $scope.ToDoctorMessage = function(detailData){
       
            //给医生发送消息
            var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            var currentuser = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            var userInf=LoginService.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO);
            if(!userInf){
                LoginService.getIMLoginInfo();
            }
            var sendInfo={
                userId:currentuser.USER_ID,
                userRole: 1,
                scUserId:detailData.scUserId,
                userPetname:detailData.PATIENT_NAME,
                hospitalLogo:detailData.HOSPIAL_PHOTO,
                visitName:detailData.PATIENT_NAME,
                userPhoto:userInf.userPhoto,
                sex:userInf.sex,
                scRecordId:$scope.regId  //购药申请纪录
            };
            var serverType=$scope.serverType; // $scope.serverType  医生端返回的服务类型,0:开单,开药;1:开单;2:开药;

            if(serverType == 0 ||  (! PurchaseMedinceService.isDataBlank(detailData.DRUG_LIST) && !PurchaseMedinceService.isDataBlank( detailData.EXAM_TEST_ITEMS))){
                sendInfo.buyMedicine=true;
                sendInfo.inspection=true;
            }else if(serverType == 1 || !PurchaseMedinceService.isDataBlank( detailData.EXAM_TEST_ITEMS)){
                sendInfo.inspection=true;
            }else{
                sendInfo.buyMedicine=true;
            }
            var photo=detailData.doctorPhoto;
            if(!photo){
                photo=detailData.DOCTOR_SEX==1?'resource/images/base/head_default_female.jpg':'resource/images/base/head_default_man.jpg';
            }
            //查询用户云信信息
            var receiverInfo={ //接收者医生信息
                yxUser: detailData.doctorYxUser,
                userRole: 2,
                userPetname: detailData.DOCTOR_NAME, //医生姓名
                userPhoto: photo,
                sex: detailData.DOCTOR_SEX,
                hospitalLogo:detailData.HOSPIAL_PHOTO,
                /* scUserVsId: commitData.scUserVsId,*/
                //  scUserId:commitData.scUserId,
                visitName: detailData.PATIENT_NAME ,//就诊者真是姓名
                scRecordId:$scope.regId
            };
            PersonalChatService.receiverInfo = receiverInfo;
            var desc="您向医生发送了一个购药开单申请";
            ConntectDoctorService.sendImMsg(sendInfo,receiverInfo,3,desc);
        };
        //点击选择就诊卡
        $scope.showpatientCardNo = function () {
            if (!$scope.pickerItems.length) {
                //KYEEAPPC-4733 确认挂号跳选卡界面是否展示虚拟卡标识  wangwan 2016年1月6日11:01:43
                PatientCardService.filteringVirtualCard.isFilteringVirtual=$scope.virtualSupportType;
                PatientCardService.fromSource = "fromAppoint";
                PatientCardService.fromAppoint = true;
                $state.go("patient_card_select");

            } else {
                $scope.title = "请选择就诊卡";
                //调用显示
                //edit by wangwan 任务号:APPCOMMERCIALBUG-1744 一个patient_id对应多个就诊卡，预约时无法选择就诊卡，因此将CARD_NO作为唯一属性。
                $scope.showPicker($scope.patientInf.CARD_NO);
            }
            //end 当用户未邦卡时默认跳转到申请新卡页面 By 高玉楼

        };

        //日期格式化
        Date.prototype.format = function (format) {
            var o = {
                "M+": this.getMonth() + 1, //month
                "d+": this.getDate(), //day
                "h+": this.getHours(), //hour
                "m+": this.getMinutes(), //minute
                "s+": this.getSeconds(), //second
                "q+": Math.floor((this.getMonth() + 3) / 3), //quarter
                "S": this.getMilliseconds() //millisecond
            };
            if (/(y+)/.test(format)) {
                format = format.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            }
            for (var k in o) {
                if (new RegExp("(" + k + ")").test(format)) {
                    format = format.replace(RegExp.$1, RegExp.$1.length == 1 ? o[k] : ("00" + o[k]).substr(("" + o[k]).length));
                }
            }
            return format;
        };

        //将身份证号转换为****
        var getIdNo = function (idNo) {
            if (idNo == null || idNo == undefined || idNo == '') {
                return;
            }
            else {
                var len = idNo.length;
                var head = idNo.substr(0, 3);
                var idNoS = head;
                var tail = idNo.substr(len - 4, 4);//substr(len - 6, 6);
                for (var i = 3; i < idNo.length - 4; i++) {
                    idNoS = idNoS + '*';
                }
                idNoS = idNoS + tail;
                return idNoS;
            }
        };

        //打开模态窗口
        $scope.openModal = function (url) {
            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: url
            });
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

        //打开模态窗口
        $scope.openModal = function (url) {
            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: url
            });
        };
        //点击选择就诊人
        $scope.changePatient = function () {
            CustomPatientService.F_L_A_G = "purchase_medince";
            //关闭弹出的儿科限制
            if($scope.dialog){
                $scope.dialog.close();
            }
            $state.go("custom_patient");
        };

        //初始化数据
        $scope.initAppointConfirm = function(){
            memoryCache = CacheServiceBus.getMemoryCache();
            storageCache = CacheServiceBus.getStorageCache();
            $scope.showAmountData = false;
            //获取缓存中医院信息
            var hospitalInfo = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            //获取医院名称
            $scope.hospitalName=hospitalInfo.name;
            $scope.hospitalPhoto=hospitalInfo.hospitalPhoto;
            if(!hospitalInfo.hospitalPhoto){
                $scope.hospitalPhoto='resource/images/icons/logo_default.png';
            }
            //获取缓存中当前就诊者信息
            var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            //获取当前就诊者的姓名
            $scope.petientName= currentPatient.OFTEN_NAME;
            //获取当前就诊者的身份证号
            $scope.idNo= getIdNo(currentPatient.ID_NO);//将身份证号转换为xxx****xxxx
            //医生列表页点击预约时的医生信息
            $scope.Appointconfrimdoctor = AppointmentDoctorDetailService.doctorInfo;
            $scope.AppointconfrimSchedule = PurchaseMedinceService.netWorkShedule[0].DOCTOR_SCHEDULE_LIST[0];
            //号源信息
            $scope.ClinicSource = PurchaseMedinceService.clinicSource;
            $scope.CLINIC_DURATION = $scope.ClinicSource.rows[0].HB_TIME;
            $scope.HID = $scope.ClinicSource.rows[0].HID;
            $scope.appointClinicData=$scope.ClinicSource.rows[0];
            $scope.showCardNo = $scope.ClinicSource.isHidden;
            if(AppointmentDoctorDetailService.doctorInfo)
            {
                $scope.deptCode=AppointmentDoctorDetailService.doctorInfo.DEPT_CODE;
                $scope.deptName=AppointmentDoctorDetailService.doctorInfo.DEPT_NAME;
                $scope.doctorName=AppointmentDoctorDetailService.doctorInfo.DOCTOR_NAME;
                $scope.doctorTitle=AppointmentDoctorDetailService.doctorInfo.DOCTOR_TITLE;
                $scope.deptData=
                {
                    DEPT_CODE:AppointmentDoctorDetailService.doctorInfo.DEPT_CODE,
                    DEPT_NAME:AppointmentDoctorDetailService.doctorInfo.DEPT_NAME
                };
            } else
            {
                $scope.deptCode=AppointmentDeptGroupService.doctorInfo.DEPT_CODE;
                $scope.deptName=AppointmentDeptGroupService.doctorInfo.DEPT_NAME;
                $scope.doctorName=AppointmentDeptGroupService.doctorInfo.DOCTOR_NAME;
                $scope.doctorTitle=AppointmentDeptGroupService.doctorInfo.DOCTOR_TITLE;
                $scope.deptData = AppointmentDeptGroupService.SELECT_DEPTGROUPDATA;
            }

            /**
             *NET_HOS_QUERY_CARD_CASH  //是否展示温馨提示0:否,1:是  $scope.isShowKindMsg
             DISTRIBUTION_TYPE  医院配送支持类型 0:不支持,1:用户自由选择,2:用户必须填写
             DISTRIBUTION_SCOPE_SWITCH  是否划定配送范围 0:否,1:是
             */
            //获取温馨提示和配送的系统参数
            HospitalService.getParamValueByName(hospitalInfo.id,
                "NET_HOS_QUERY_CARD_CASH,DISTRIBUTION_TYPE,DISTRIBUTION_SCOPE_SWITCH",function (hospitalPara) {
                    $scope.isShowKindMsg=hospitalPara.data.NET_HOS_QUERY_CARD_CASH;
                    $scope.distribitionType=hospitalPara.data.DISTRIBUTION_TYPE; //配送类型 医院配送支持类型 0:不支持,1:用户自由选择,2:用户必须填写
                    if($scope.distribitionType == 2){
                        $scope.distributionChoose=1;
                    }
                    $scope.distributionSwitch=hospitalPara.data.DISTRIBUTION_SCOPE_SWITCH; // 是否划定配送范围 0:否,1:是
                });
            $scope.patientInf = {
                CARD_NO: "",
                CARD_SHOW: "",
                CARD_NAME:"",
                CARD_TYPE:""
            };
            //如果输入卡信息完成
            if (AppointmentCreateCardService.enterInfo) {
                $scope = AppointmentCreateCardService.confirmScope;
                $scope.patientInf.CARD_SHOW = KyeeI18nService.get("purchase_medince.newCard","申请新卡");
                $scope.patientInf.CARD_NO = -1;
                $scope.PATIENT_ID = -1;
                $scope.appointConfirm();
                AppointmentCreateCardService.enterInfo = false;
                return;
            }
            else
            {
                $scope.patientInf.CARD_SHOW = undefined;
                $scope.patientInf.CARD_NO = undefined;
                $scope.PATIENT_ID = undefined;
            }

            //获取建档费
            $scope.archiveDetail = AppointmentDoctorDetailService.ARCHIVE_FEE + "";
            //就诊卡回调函数
            AppointConfirmService.setClientinfo(function (Clientinfo) {
                $scope.Clientinfo = Clientinfo;
                $scope.receiveStartTel=getStarPhoneNum($scope.Clientinfo.ADDRESS_PHONE_NUMBER);
                $scope.patientInf.BIRTH_CERTIFICATE_NO = Clientinfo.BIRTH_CERTIFICATE_NO;
                $scope.trueOrfalse = function () {
                    //只读
                    if (Clientinfo.CARDNO_TO_APPOINT == 0) {
                        $scope.placeholder = KyeeI18nService.get("purchase_medince.placeholderChooseCard","请选择就诊卡");
                        return true;
                    } else {
                        $scope.placeholder = KyeeI18nService.get("purchase_medince.placeholderCard","请输入或选择就诊卡");
                        return false;
                    }
                };
                var menus = [];
                if (Clientinfo.rows != null && Clientinfo.rows.length > 0) {
                    for (var i = 0; i < Clientinfo.rows.length; i++) {
                        if (Clientinfo.rows[i].IS_DEFAULT == '1') {
                            if(Clientinfo.SELECT_FLAG=="1"){
                                $scope.patientInf.CARD_NO = Clientinfo.rows[i].CARD_NO;
                                $scope.patientInf.CARD_SHOW = Clientinfo.rows[i].CARD_SHOW;
                                $scope.PATIENT_ID = Clientinfo.rows[i].PATIENT_ID;
                                $scope.patientInf.CARD_NAME = Clientinfo.rows[i].CARD_NAME;
                                $scope.patientInf.CARD_TYPE = Clientinfo.rows[i].CARD_TYPE;
                                break;
                            }
                        } else {
                            if(Clientinfo.SELECT_FLAG=="1"){
                                $scope.patientInf.CARD_NO = Clientinfo.rows[0].CARD_NO;
                                $scope.patientInf.CARD_SHOW = Clientinfo.rows[0].CARD_SHOW;
                                $scope.PATIENT_ID = Clientinfo.rows[0].PATIENT_ID;
                                $scope.patientInf.CARD_NAME = Clientinfo.rows[0].CARD_NAME;
                                $scope.patientInf.CARD_TYPE = Clientinfo.rows[0].CARD_TYPE;
                            }
                        }
                    }

                    //选择卡组件赋值
                    for (var i = 0; i < Clientinfo.rows.length; i++) {
                        var resultMap = {};
                        if(Clientinfo.rows[i].CARD_NAME == null || Clientinfo.rows[i].CARD_NAME == undefined || Clientinfo.rows[i].CARD_NAME == ""){
                            resultMap["name"] = "";
                        }
                        else{
                            resultMap["name"] =  Clientinfo.rows[i].CARD_NAME;
                        }
                        resultMap["text"] = Clientinfo.rows[i].CARD_SHOW;
                        resultMap["value2"] = Clientinfo.rows[i].PATIENT_ID;
                        resultMap["value"] = Clientinfo.rows[i].CARD_NO;//唯一属性CARD_NO
                        resultMap["value3"] = Clientinfo.rows[i].CARD_TYPE;
                        menus.push(resultMap);
                    }
                }


                //begin 申请新卡参数打开时当用户未邦卡时默认跳转到申请新卡页面
                //  增加用户有卡则不显示申请新卡
                var addNewCard = false;
                if((menus.length == 0) && ('true' === $scope.Clientinfo.REMOTE_BUILD_CARD
                    || 'input' === $scope.Clientinfo.REMOTE_BUILD_CARD)){
                    var resultMap = {};
                    resultMap["name"] = "";
                    resultMap["text"] =  KyeeI18nService.get("purchase_medince.newCard","申请新卡");
                    resultMap["value2"] = -1;
                    resultMap["value"] = -1;
                    resultMap["value3"] = 0;
                    menus.push(resultMap);
                    addNewCard = true;
                }
                //控制器中绑定数据：
                //查看就诊卡
                if(Clientinfo.SUPPORT_PHYSICALCARD == 1) {
                    addNewCard = true;
                }
                if(addNewCard) {
                    $scope.footerBar = addNewCardStyle;
                }
                $scope.pickerItems = menus;
                if($scope.distributionSwitch==1){  //如果是划定配送范围
                    $scope.toCheckDistributionScope();
                }else{
                    $scope.isInRegion=true;
                }
                //end 申请新卡参数打开时当用户未绑卡时默认跳转到申请新卡页面 By 高玉楼
            });
            //获取就诊卡方法
            AppointConfirmService.queryClientinfo({IS_ONLINE: '1'});

            var netWorkShedule=PurchaseMedinceService.netWorkShedule;//获取排班信息
            selSchedule=netWorkShedule[0].DOCTOR_SCHEDULE_LIST[0];
            $scope.clinicDue=PurchaseMedinceService.clinicDue;
            $scope.receieAddress=PurchaseMedinceService.receieAddress;
            $scope.clinicName=PurchaseMedinceService.clinicName;
            $scope.appointAmount = "¥" + selSchedule.SUM_FEE;
            $scope.sumFee = selSchedule.SUM_FEE;
            $scope.clinicDuration =selSchedule.CLINIC_DURATION;
            $scope.clinicLabel =selSchedule.CLINIC_LABEL;
            $scope.clinicDate = selSchedule.CLINIC_DATE;//就诊日期
            $scope.clinicType = selSchedule.CLINIC_TYPE;
            $scope.businessType = selSchedule.BUSSINESS_TYPE;
            $scope.doctorPhoto = netWorkShedule[0].DOCTOR_PIC_PATH;
            $scope.doctorSex=netWorkShedule[0].DOCTOR_SEX;
        };
        //选择卡号
        $scope.selectItem = function (params) {
            $scope.patientInf.CARD_SHOW = params.item.text;//展示值
            //edit by wangwan 任务号:APPCOMMERCIALBUG-1744 一个patient_id对应多个就诊卡，预约时无法选择就诊卡，因此将CARD_NO作为唯一属性。
            $scope.patientInf.CARD_NO = params.item.value;//唯一属性
            $scope.PATIENT_ID = params.item.value2;//第二属性
            $scope.CARD_TYPE = params.item.value3;//第三属性
            $scope.Card_Type = params.item.value3;//第三属性
            if ('input' === $scope.Clientinfo.REMOTE_BUILD_CARD) {
                AppointmentCreateCardService.confirmScope = $scope;
                $state.go('create_card_info');
            }
        };
        $scope.showChardNoInf = function(){
            $scope.userMessage =KyeeI18nService.get("purchase_medince.cardNoinfo","就诊卡是医院存储您就诊卡资料的磁性卡，是您与医院挂号，付款等交互的唯一实体凭据（某些地区可由医保卡代替），由于医疗的特殊和保密性需要，每家医院的就诊卡不通用。为保证您的挂号等操作的顺利进行，请正确填选您正在使用的就诊卡。没有就诊卡的患者，请到您就诊的医院凭个人身份证办理就诊卡。");
            var dialog = KyeeMessageService.dialog({
                template: "modules/business/appoint/views/delay_views/limit_appoint_message.html",
                scope: $scope,
                title:KyeeI18nService.get("purchase_medince.messageTitle","温馨提示"),
                buttons: [
                    {
                        text:  KyeeI18nService.get("purchase_medince.isOk","确定"),
                        style:'button-size-l',
                        click: function () {
                            dialog.close();
                        }
                    }
                ]
            });
        };
        //修改就诊卡输入框中的内容
        $scope.inputCardNo = function () {
            //将患者输入的卡号作为预约卡号
            $scope.patientCard.CARD_NO = $scope.patientCard.CARD_SHOW;
            //清空PATIENT_ID
            $scope.PATIENT_ID = '';
        };
        //点击展示大图
        $scope.showBigPicture = function(index){
            ShowPicturesService.ACTIVESLIDE = index; //定义页面初始展示第几张图
            ShowPicturesService.IMGLIST = $scope.IMGLIST;
            KyeeViewService.openModalFromUrl({
                url: "modules/business/consultation/views/template/show_picture.html",
                scope: $scope,
                animation: "slide-in-right"
            });
        };
        /**
         * 点击删除图标事件
         * @param index
         * @param event
         */
        $scope.doDeleteImg = function (index,event) {
            $scope.IMGLIST.splice(index, 1);
            event.stopPropagation();
        };
        /**
         * 联系医生
         */
        $scope.chatWithDoctor = function (DETAIL_DATA) {
            var param={
                hospitalId:DETAIL_DATA.HOSPITAL_ID,
                deptCode:DETAIL_DATA.DEPT_CODE,
                doctorCode:DETAIL_DATA.DOCTOR_CODE,
                type:1
            };
            PurchaseMedinceService.queryDoctorDetail(param,function(data){
                var userInf=LoginService.storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.USER_ACT_INFO);
                if(!userInf){
                    LoginService.getIMLoginInfo();
                }
                PersonalChatService.receiverInfo = { //接收者医生信息
                    yxUser: data.yxUser,
                    userRole: 2,
                    userPetname: data.doctorName, //医生姓名
                    userPhoto: data.doctorPhoto,
                    sex: data.doctorSex,
                    /*scUserVsId: $scope.scUserVsId,*/
                    scUserId:userInf.scUserId,
                    visitName: $scope.petientName //就诊者真是姓名
                };
                PersonalChatService.goPersonalChat();
            });
        };
        //状态展示图标
        $scope.getIconColor = function(detailData){
            var flag = 3;//0处理中图标，1、成功图标 2 失败图标 3不显示图标
            if(detailData.TYPE=='0'){
                if(detailData.APPOINT_TYPE=='2'||detailData.APPOINT_TYPE=='4'||
                    (detailData.BUSINESS_STATUS=='-2' && detailData.APPOINT_TYPE=='1')){
                    //预约失败、取消预约失败
                    flag = 2;
                }else if(detailData.APPOINT_TYPE=='0'||detailData.APPOINT_TYPE=='11'||
                    (detailData.BUSINESS_STATUS=='-1' && detailData.APPOINT_TYPE=='1')){
                    //预约处理中、取消预约处理中
                    flag = 0;
                }
            }else {
                if(detailData.REGIST_TYPE=='2'||detailData.REGIST_TYPE=='5'||
                    (detailData.BUSINESS_STATUS=='-2' && detailData.REGIST_TYPE=='1')){
                    //挂号失败、取消挂号失败
                    flag = 2;
                }else if(detailData.REGIST_TYPE=='0'||detailData.REGIST_TYPE=='11'||
                    (detailData.BUSINESS_STATUS=='-1' && detailData.REGIST_TYPE=='1')){
                    //挂号处理中、取消挂号处理中
                    flag = 0;
                }
            }
            return flag;
        }

    })
    .build();
