new KyeeModule()
    .group("kyee.quyiyuan.hospital.service")
    .require([
        "kyee.quyiyuan.navigationOut.service",
        "kyee.quyiyuan.newqueue.select.dept.service",
        "kyee.quyiyuan.queue.select.dept.service",
        "kyee.quyiyuan.newqueue.clinic.service",
        "kyee.quyiyuan.waitingqueue.clinic.service",
        "kyee.quyiyuan.waitingqueue.dept.service",
        "kyee.quyiyuan.report_multiple.service",
        "kyee.quyiyuan.consultation.consult_doctor_list.service",
        "kyee.quyiyuan.consultation.consult_doctor_list.controller",
        "kyee.quyiyuan.my.convenience.networkclinicDL.service",
        "kyee.quyiyuan.my.convenience.networkclinicDL.controller"
    ])
    .type("service")
    .name("HospitalService")
    .params(["ReportMultipleService","$state", "HttpServiceBus", "CacheServiceBus", "HospitalNavigationService", "NewQueueClinicService", "InpatientPaymentService",
        "KyeeMessageService", "NavigationOutService", "NewQueueSelectDeptService", "QueueSelectDeptService", "AppointmentDeptGroupService", "KyeeI18nService","PatientCardRechargeService","HomeService",
        "WaitingQueueClinicService","WaitingQueueDeptService","ClinicPaymentReviseService", "ConsultDoctorListService", "NetWorkClinicService","KyeeUtilsService"])
    .action(function (ReportMultipleService,$state, HttpServiceBus, CacheServiceBus, HospitalNavigationService, NewQueueClinicService, InpatientPaymentService,
                      KyeeMessageService, NavigationOutService, NewQueueSelectDeptService, QueueSelectDeptService, AppointmentDeptGroupService, KyeeI18nService,PatientCardRechargeService,HomeService,
                      WaitingQueueClinicService,WaitingQueueDeptService,ClinicPaymentReviseService, ConsultDoctorListService, NetWorkClinicService,KyeeUtilsService){

        var def = {

            //记录是否选择了新的医院，如果是，则需要更新首页数据（广告、九宫格数据）
            isSelectedNewHospital: false,

            //单击广告图片的 ID
            clickedAdvId: null,

            //hospital controller $scope 引用
            ctrlScope: null,

            //选择医院的按钮是否禁用
            isHospitalSelecterBtnDisabled: false,

            //过滤器执行器
            filterChainInvoker: null,
            hospitalWebUrl: undefined,

            /**
             * 加载九宫格数据
             *
             * @param cfg
             */
            getCurrMenus: function (cfg) {

                cfg.onFinish(HOSPITAL_DATA);
            },

            /**
             * 加载广告数据
             */
            loadAdvData: function () {

                //自动加载上一次医院的广告，如果为空，则加载默认广告
                var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                return hospitalInfo != null && hospitalInfo.advs != undefined ? hospitalInfo.advs : HOSPITAL_DATA.defaultSlideboxData();
            },

            /**
             * 获取默认九宫格数据
             */
            loadSudokuData: function () {

                //如果上次已经选择医院，则返回该医院的九宫格数据
                var sudokuData = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOME_DATA);
                if (sudokuData != null && sudokuData.sudokuData != null) {
                    return sudokuData.sudokuData;
                }

                //如果上次没有选择医院，则构建初始化九宫格数据
                var data = HOSPITAL_DATA.homeSudokuMetaData.data;

                var list = [];
                for (var code in data) {

                    //默认不显示健康资讯
                    //if (code == "YYGG") {
                    //    continue;
                    //}

                    var item = data[code];

                    //此功能是否默认显示
                    if (item.default != undefined && item.default == false) {
                        continue;
                    }

                    list.push(item);
                }

                return list;
            },

            /**
             * 更新首页九宫格数据
             *
             * @returns {{home: Array, more: Array}}
             */
            updateSudokuData: function () {
                var  hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                if(hospitalInfo&&hospitalInfo.id){
                    //获取元素的权限描述
                    var rights = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOME_DATA).rights;

                    var data = HOSPITAL_DATA.homeSudokuMetaData.data;

                    //抽取按钮对象
                    var buttons = [];
                    //是否转换预约或挂号权限
                    var changeAppointRegist = false;
                    for (var right in rights) {

                        var code = rights[right].MODULE_CODE;
                        var visible = rights[right].IS_VISIBLE;
                        var enable = rights[right].IS_ENABLE;
                        var disableInfo = rights[right].DISABLEINFO;

                        //如果设置该按钮不可见，则不添加此按钮
                        if (visible == 0) {
                            continue;
                        }

                        //预约或挂号权限转换为预约挂号权限
                        if(!changeAppointRegist && (code == 'APPOINT' || code == 'RIGIST')){
                            code = 'APPOINTREGIST';
                        }

                        var button = data[code];
                        if (button != undefined) {
                            button.name = KyeeI18nService.get(button.name_key, button.name_org);
                            button.shortcuts_image_url = KyeeI18nService.get(button.shortcuts_image_url_key, button.shortcuts_image_url_org);

                            //预约挂号权限
                            if(code == 'APPOINTREGIST'){
                                button.red = true;
                                enable = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).is_home_appoint_enable;
                            }

                            //动态添加是否启用属性
                            button.enable = enable;
                            //仅当启用状态为 0 时，消息提示才有意义
                            if (enable == 0) {
                                button.disableInfo = disableInfo;
                            }

                            buttons.push(button);
                        } else {
                            KyeeLogger.warn("没有找到 CODE=" + code + " 的主页按钮！");
                        }
                    }
                    return buttons;
                }else{
                    return null;
                }

            },

            /**
             * 获取指定医院的指定参数
             *
             * @param hospitalId
             * @param paramName
             * @param onSuccess
             */
            getParamValueByName: function (hospitalId, paramName, onSuccess) {

                HttpServiceBus.connect({
                    url: "/hospitalInform/action/HospitalinforActionC.jspx",
                    params: {
                        hospitalId: hospitalId,
                        paramName: paramName,
                        op: "queryHospitalParam"
                    },
                    showLoading: false,
                    onSuccess: function (data) {
                        onSuccess(data);
                    }
                });
            },

            /**
             * 打开九宫格主菜单
             */
            openModule: function ( params, flag) {
                //如果该按钮已被禁用，则提示消息并终止操作
                if (params.enable == 0) {
                    if(flag){
                        KyeeMessageService.message({
                            title: KyeeI18nService.get("commonText.warmTipMsg", "温馨提示"),
                            content: params.disableInfo,
                            okText: KyeeI18nService.get("home->MAIN_TAB.iKnow", "我知道了")
                        });
                    }
                } else {
                    var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                    if(hospitalInfo==undefined||hospitalInfo==null||hospitalInfo.id==undefined||hospitalInfo.id==null||hospitalInfo.id==''){
                        if (def.isHospitalSelecterBtnDisabled) {
                            return;//禁用选择医院
                        }
                        $state.go("hospital_selector");
                        return;
                    }
                    if (params.href != undefined) {
                        //医院导航
                        if (params.href == "hospital_navigation") {
                            HospitalNavigationService.lastClassName = "home->MAIN_TAB";
                            $state.go(params.href);
                        } else if (params.href == "queue") {
                            //排队做适配
                            HttpServiceBus.connect(
                                {
                                    url: "/sortquery/action/SortQueryActionC.jspx",
                                    params: {
                                        op: "getSortParams"
                                    },
                                    onSuccess: function (data) {//回调函数
                                        if (data.success) {
                                            var queueType = data.data.QUEUE_METHOD_CHOOSE; //1为新版，0为旧版,2 最新版
                                            var queueOrCall = data.data.HAS_USER_QUEUELIST;//true为我的叫号有数据
                                            var onlyCall = data.data.ONLY_USERQUEUE_INFO;//此医院直接进入我的叫号 1为直接接入我的叫号
                                            var cache = CacheServiceBus.getMemoryCache();
                                            cache.set(CACHE_CONSTANTS.MEMORY_CACHE.QUEUE_JUMP_VIEW, onlyCall);
                                            if (queueType == "1" && (queueOrCall == "true" || onlyCall == "1")) {
                                                NewQueueClinicService.frontPage = -1;  //重置状态位
                                                $state.go("new_queue_clinic");
                                            } else if (queueType == "1" && queueOrCall == "false") {
                                                $state.go("new_queue");
                                            } else if (queueType == "0" && (queueOrCall == "true" || onlyCall == "1")) {
                                                $state.go("queue_clinic");
                                            } else if(queueType == "0" && queueOrCall == "false"){
                                                $state.go("queue");
                                            }else if(queueType == "2" && (queueOrCall == "true" || onlyCall == "1")){
                                                $state.go("waiting_queue_clinic");
                                            }else{
                                                $state.go("waiting_queue_dept");
                                            }
                                            //KYEEAPPTEST-2763   排队模块设置跳转标识    张明
                                            NewQueueSelectDeptService.isHomeOrHospital = "hosp";
                                            QueueSelectDeptService.isHomeOrHospital = "hosp";
                                        } else {
                                            if (data.alertType == 'ALERT' && data.message) {
                                                KyeeMessageService.broadcast({
                                                    content: data.message
                                                });
                                            }else if(data.message=='此功能暂未开放，敬请期待！'){
                                                KyeeMessageService.message({
                                                    title: KyeeI18nService.get("commonText.warmTipMsg", "温馨提示"),
                                                    content: data.message,
                                                    okText: KyeeI18nService.get("home->MAIN_TAB.iKnow", "我知道了")
                                                });
                                            }
                                        }
                                    }
                                }
                            );
                        }else if(params.href == 'report_multiple'){
                            ReportMultipleService.IS_TAP_TAB='HOS';
                            $state.go(params.href);
                        }
                        //住院费用入口 2.2.40 程铄闵 KYEEAPPC-6603
                        else if(params.href == 'inpatient_payment_record'){
                            def.filterChainInvoker.invokeChain({
                                id: "USER_LOGIN_AND_SELECT_CUSTOM_PATIENT_FILTER",
                                token: "home->MAIN_TAB",
                                onFinash: function () {
                                    InpatientPaymentService.loadPermission(function(route){
                                        $state.go(route);
                                    });
                                }
                            });
                        }
                        //就诊卡充值(2.1.60版后)入口 KYEEAPPC-5217 程铄闵
                        else if(params.href == 'patient_card_recharge'){
                            PatientCardRechargeService.fromView = $state.current.name;
                            KyeeMessageService.loading({
                                mask: true
                            });//增加遮罩 KYEEAPPTEST-3945 程铄闵
                            PatientCardRechargeService.getModule(function (route) {
                                KyeeMessageService.hideLoading();//取消遮罩
                                PatientCardRechargeService.isFirstEnter = true;// KYEEAPPC-8088 程铄闵 2.3.10充值功能改版
                                $state.go(route);//KYEEAPPC-4842 程铄闵
                            },$state);
                        }
                        //门诊缴费(2.2.13版后)入口 KYEEAPPC-6170 程铄闵
                        else if(params.href == 'clinicPayment'){
                            ClinicPaymentReviseService.isMedicalInsurance(1,function (route) {
                                $state.go(route);
                            });
                         //任务：KYEEAPPC-7679 描述：医院主页趣护入口 作者：futian
                        }else if(params.href == 'homeWeb'){//护士陪诊
                           /* var loginFalg=CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN) == true;
                            if(loginFalg){
                                HomeService.withTheDiagnosis= 3;
                                $state.go(params.href);
                            }else{
                                $state.go("login");
                            }*/
                            HomeService.withTheDiagnosis= 3;
                            $state.go(params.href);
                        } else if(params.href == "index_hosp"){//报告单入口
                            var hospitalInfo=CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                            if(hospitalInfo&&hospitalInfo.id){
                                var paraName = "checkType,inHospitalCheckType";
                                def.getParamValueByName(hospitalInfo.id,paraName,function (hospitalPara) {
                                    //APPCOMMERCIALBUG-3201 提前判断是否开通门诊/住院报告单
                                    if(0==hospitalPara.data.checkType&&0==hospitalPara.data.inHospitalCheckType){
                                        KyeeMessageService.message({
                                            title : "提示",
                                            content : "此功能暂未开放，敬请期待！",
                                            okText : "我知道了"
                                        });
                                        return;
                                    }else{
                                        ReportMultipleService.QUERY_TYPE=hospitalPara.data.checkType;
                                        ReportMultipleService.QUERY_TYPE_INHOSPITAL=hospitalPara.data.inHospitalCheckType;
                                        $state.go("index_hosp");
                                    }
                                });
                            }else{
                                KyeeMessageService.broadcast({
                                    content: KyeeI18nService.get("commonText.selectHospitalMsg","请选择前往的医院")
                                });
                            }
                        } else if (params.href === 'consult_doctor_list') {   //跳转至咨询医生页面
                            ConsultDoctorListService.hospitalId = hospitalInfo.id;
                            if(ConsultDoctorListService.defaultDept){
                                ConsultDoctorListService.defaultDept = null;
                            }
                            $state.go(params.href);
                        } else if (params.href === 'network_clinic_dl') {
                            NetWorkClinicService.hospitalId = hospitalInfo.id;
                            $state.go(params.href);
                        }else if(params.href == 'escortWeb'){//住院陪护gch
                                HomeService.withTheDiagnosis= 5;
                                $state.go('homeWeb');
                        }else if(params.href == 'service_satisfaction'){
                            $state.go(params.href);
                        }
                        //end By 高玉楼  APPCOMMERCIALBUG-1364
                        else {
                            //转诊标识2转诊  0不转诊
                            AppointmentDeptGroupService.IS_REFERRAL = 0;
                            //清掉首页时间，使得从医院“预约挂号”入口进入不受首页时间的影响
                            HomeService.selDateStr = null;
                            $state.go(params.href);
                        }
                    }
                }
            },
            toAppointDoctorPage: function () {
                var deptInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.DEPT_INFO);
                AppointmentDeptGroupService.TO_ROUTER_STATE = "appointment_doctor";
                //AppointmentDeptGroupService.UP_PAGE = "HospitalService"; //wangwenbo
                //如果已经选择科室则跳转到医生列表
                /*if (deptInfo) {
                 //AppointmentDeptGroupService.ROUTER_STATE = "appointment";
                 //$state.go("appointment_doctor");
                 $state.go("schedule");
                 }
                 //如果没有选择科室，则跳转到科室选择页面
                 else {*/
                //AppointmentDeptGroupService.ROUTER_STATE = "home->MAIN_TAB";
                //$state.go("appointment");
                $state.go("schedule");
                /*}*/
            },

            /**
             * 更新九宫格页面视图
             */
            updateUI: function () {

                var  hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
                if(hospitalInfo&&hospitalInfo.id){

                    var me = this;
                    //更新广告
                    me.ctrlScope.slideboxData = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).advs;
                    //进入页面后自动播放医院广告
                    if (me.ctrlScope.updateSlideboxImage != undefined) {
                        me.ctrlScope.updateSlideboxImage();
                    }

                    //更新九宫格权限
                    var menus = me.updateSudokuData();
                    CacheServiceBus.getStorageCache().apply(CACHE_CONSTANTS.STORAGE_CACHE.HOME_DATA, "sudokuData", menus);

                    me.ctrlScope.sudokuData = menus;

                    me.ctrlScope.sudokuDataList = [];
                    for(var i=0; i<me.ctrlScope.sudokuData.length;i++){
                        if(i>3){
                            me.ctrlScope.sudokuDataList.push(me.ctrlScope.sudokuData[i]);
                        }
                    }

                    me.isSelectedNewHospital = false;
                }
            },

            /**
             * 设置九宫格页面中的选择医院按钮是否禁用
             *
             * @param state
             */
            setHospitalSelecterBtnDisabled: function (state) {

                var me = this;

                me.isHospitalSelecterBtnDisabled = state;
            },
            /**
             * 调用微信插件获取用户照片
             * 任务:APPCOMMERCIALBUG-2267
             * 作者:gaoyulou
             */
        scanCode: function(currentUrl,onSuccess){
            HttpServiceBus.connect({
                url: 'realname/action/GetPictureActionC.jspx',
                params: {
                    op: 'getWXConfig',
                    currentUrl:currentUrl
                },
                onSuccess: function (data) {
                    console.log(data)
                    var result = data.data;
                    if (data.success) {
                        wx.config({
                            debug: false,
                            appId: result.appId, // 必填，公众号的唯一标识
                            timestamp: result.timeStamp, // 必填，生成签名的时间戳
                            nonceStr: result.nonceStr, // 必填，生成签名的随机串
                            signature: result.signature,// 必填，签名
                            jsApiList: ['scanQRCode'] //调用扫一扫
                        });
                        wx.ready(function(){
                            wx.scanQRCode({
                                needResult: 1,  // 默认为0，扫描结果由微信处理，1则直接返回扫描结果
                                scanType: ["qrCode","barCode"], // 可以指定扫二维码还是一维码，默认二者都有
                                success: function (res) {
                                    var result = res.resultStr; // 当needResult 为 1 时，扫码返回的结果
                                    onSuccess(result);
                                }
                            });
                        });
                    }
                    else
                    {
                        KyeeMessageService.broadcast({
                            content: data.message,
                            duration: 3000
                        });
                    }
                },
                onError: function (err) {
                    typeof error === 'function' && error(err);
                }
            });
        },
        getScanInfo:function(param,onSuccess,onError){
            HttpServiceBus.connect({
                url: "drugstore/action/FetchDrugsActionC.jspx",
                showLoading: true,
                params: {
                    op: "fetchDrugs",
                    phone: param.phoneNum,
                    patientName:param.patientName
                },
                onSuccess: function(data){
                    if (data.success) {
                        onSuccess(data);
                    } else {
                        return;
                    }
                },
                onError: function(err) {
                    typeof error === 'function' && error(err);
                }
            });
        },
            /**
             * 记录用户关于就医全流程URL点击跳转的记录
             * @param objParams
             */
            addRecord : function(objParams){
                var opRecords = [];
                var pageCode = "home->EMAIN_TAB";
                var record = {
                    "PAGE_CODE":pageCode,
                    "ELEMENT_CODE": objParams.skipRoute,
                    "OPERATE_TIME": KyeeUtilsService.DateUtils.getDate("YYYY-MM-DD HH:mm:ss"),
                    "HOSPITAL_ID":objParams.hospitalID,
                    "USER_ID":objParams.USER_ID
                };
                opRecords.push(record);
                // 延迟5秒向后台发送操作记录
                setTimeout(
                    function(){
                        HttpServiceBus.connect({
                            type: "POST",
                            url : "/CloudManagement/operation/action/OperationRecordsActionC.jspx?",
                            showLoading: false,
                            params : {
                                op: "monitorRecords",
                                monitorRecords : opRecords
                            }
                        });
                    },
                    5000);
            },
            queryCustomPatient: function (USER_ID, onSuccess) {
                HttpServiceBus.connect({
                    url: "/center/action/CustomPatientAction.jspx",
                    showLoading: true,
                    params: {
                        USER_ID: USER_ID,
                        FLAG: "cloud",
                        op: "queryCustomPatient"
                    },
                    onSuccess: function (data) {
                        if (data) {
                            onSuccess(data);
                        }
                    }
                });
            }
        };

        return def;
    })
    .build();