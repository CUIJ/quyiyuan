/*
 * 产品名称：quyiyuan
 * 创建人: 陈艳婷
 * 创建日期:2017年10月31日20:08:22
 * 创建原因：即时随访调用医院+和HCRM获取随访表单
 * 任务号：APP-274
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.questionnaire_search.controller")
    .require(["kyee.quyiyuan.patients_group.questionnaire_search.service"])
    .type("controller")
    .name("QuestionnaireSearchController")
    .params(["$scope", "$state", "$sce", "$ionicHistory", "CacheServiceBus", "KyeeListenerRegister", "QuestionnaireSearchService",
        "AttendingDoctorService","KyeeI18nService","KyeeMessageService","CommPatientDetailService"])
    .action(function ($scope, $state, $sce, $ionicHistory, CacheServiceBus, KyeeListenerRegister, QuestionnaireSearchService,
                      AttendingDoctorService,KyeeI18nService,KyeeMessageService,CommPatientDetailService) {

        var storageCache = CacheServiceBus.getStorageCache();
        var memoryCache = CacheServiceBus.getMemoryCache();
        $scope.deptType = QuestionnaireSearchService.deptType;
        $scope.isSearching = true;
        $scope.isFail = false;//系统繁忙，则fail
        $scope.title = "随访查询";
        $scope.buttonText="";
        KyeeListenerRegister.regist({
            focus: "questionnaire_search",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                if(QuestionnaireSearchService.URL){
                    $scope.hcrmMsgType = QuestionnaireSearchService.hcrmMsgType;
                    if($scope.hcrmMsgType==1){
                        $scope.title = "随访表单";
                    }else if($scope.hcrmMsgType==2){
                        $scope.title = "用药提醒";
                    }else if($scope.hcrmMsgType==3){
                        $scope.title = "治疗计划";
                    }else if($scope.hcrmMsgType==4){
                        $scope.title = "复诊提醒";
                    }
                    $scope.isSearching = false;
                    $scope.pageMessageType = "instant_follow";
                    $scope.buttonText="";
                    $scope.isFail=false;
                    var url = QuestionnaireSearchService.URL;
                    $scope.openUrl = $sce.trustAsResourceUrl(url);
                }else{
                    doLoading();
                }

            }
        });

        /**
         * 初始化加载页面
         */
        function doLoading(){
            var hospitalId = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            var currentPatient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            var currentUser = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
            var checkParams = {
                hospitalizationNo:"",//住院号
                clinicNo:"",//门诊号
                phoneNumber:currentPatient.PHONE,//手机号
                idNo:currentPatient.ID_NO,//身份证号
                patientName:currentPatient.OFTEN_NAME,//姓名
                deptType:$scope.deptType,//科室类型
                hospitalId:hospitalId,
                isChild:0 //是否儿童
            };
            if(QuestionnaireSearchService.clinicNo){
                checkParams.clinicNo =QuestionnaireSearchService.clinicNo;
            }
            if(QuestionnaireSearchService.hospitalizationNo){
                checkParams.hospitalizationNo = QuestionnaireSearchService.hospitalizationNo;
            }
            $scope.currentPatientInfo = {
                patientName:currentPatient.OFTEN_NAME,
                patientSex:judgeSex(currentPatient.ID_NO),
                patientIdNo:currentPatient.ID_NO
            };
            if(currentPatient.ID_NO.indexOf("XNSF")==0 && currentPatient.SEX!=0){
                if(currentPatient.SEX==1){
                    $scope.currentPatientInfo.patientSex = KyeeI18nService.get("update_user.man", "男");
                }else if(currentPatient.SEX==2){
                    $scope.currentPatientInfo.patientSex = KyeeI18nService.get("update_user.women", "女");
                }
            }
            AttendingDoctorService.getHplusUserInf(checkParams,function (response) {
                if (response.success) {
                    var data = response.data;
                    var followCode = data.followCode;
                    if(followCode=="002"){
                        //医院+不存在用户
                        $scope.isSearching = false;
                        $scope.pageMessageType = "no_hplus_user";
                        $scope.tips = "暂未查到您的就诊信息";
                        $scope.message = "暂未查到您的就诊信息，请核对您的信息。";
                        $scope.buttonText = "去核对";
                        $scope.isFail=false;
                    }else{
                        checkParams.deptType = data.userInfo.deptType;//科室类型
                        getFollowByHcrm(checkParams);
                    }
                }else{
                    systemErrorDialog();
                }
            });
        }
        //调用HCRM生成随访
        function getFollowByHcrm(checkParams){
            AttendingDoctorService.getHplusFollowTab(checkParams,function (response) {
                if (response.success && response.data !=null) {
                    var hcrmData = response.data;
                    var hcrmFollowCode = hcrmData.followCode;
                    if(hcrmFollowCode=="001"){
                        //即时随访
                        $scope.isSearching = false;
                        $scope.pageMessageType = "instant_follow";
                        var url = hcrmData.followMessage;
                        $scope.openUrl = $sce.trustAsResourceUrl(url);
                        $scope.buttonText="";
                        $scope.isFail=false;
                    }else if(hcrmFollowCode=="002"){
                        getFollowByHcrm(checkParams);
                    }else if(hcrmFollowCode=="003"){
                        //未查到随访信息
                        $scope.isSearching = false;
                        $scope.pageMessageType = "no_follow_info";
                        $scope.tips = "暂未查到您的随访信息";
                        $scope.message = "暂未查到您的随访信息，请核对您的就诊者信息。";
                        $scope.buttonText = "切换就诊者";
                        $scope.isFail=false;
                    }else{
                        systemErrorDialog();
                    }
                }else{
                    systemErrorDialog();
                }
            });
        }

        //异常提示
        function systemErrorDialog(){
            KyeeMessageService.broadcast({
                content: "系统繁忙，请稍后再试！",
                duration: 2000
            });
            $scope.isSearching = false;
            $scope.isFail = true;
            $scope.buttonText="";
        }

        /**
         * 判断男女的方法
         */
        var judgeSex = function (ID_NO) {
            var Id = ID_NO.trim();
            var sex = Id.substring(16, 17);
            if (!isNaN(sex)) {
                if (Id.length > 16) {
                    if (sex % 2 == 0) {
                        return KyeeI18nService.get("update_user.women", "女");
                    } else {
                        return KyeeI18nService.get("update_user.man", "男");
                    }
                }
            }
            return sex;
        };

        /**
         * 点击跳转到下个页面
         */
        $scope.nextPage = function(){
            if($scope.pageMessageType == "no_follow_info"){
                $state.go("custom_patient");
            }else{
                var patient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                patient.orgphone = patient.PHONE; //储存一个手机号来对比手机号是否产生变化
                patient.idnumber = patient.ID_NO; //储存一个身份证号来对比手机号是否产生变化
                patient.loginNum = "";         //短信验证码制空
                var people = angular.copy(patient);
                CommPatientDetailService.item = people;
                CommPatientDetailService.F_L_A_G = "appoint_confirm";
                $state.go("comm_patient_detail");
            }

        };
        /**
         * 监听物理键返回
         */
        KyeeListenerRegister.regist({
            focus: "questionnaire_search",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function () {
                $scope.goBack();
            }
        });

        /**
         * 描述：返回到主页
         */
        $scope.goBack = function(){
            var backView = $ionicHistory.backView();
            if (backView && backView.stateId == "patients_group_message"){
                $state.go("patients_group_message");
            }else if (backView && backView.stateId == "select_patient_list"){
                $state.go("select_patient_list");
            }else{
                $state.go('home->MAIN_TAB');
            }

        }

    })
    .build();