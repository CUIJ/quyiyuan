/**
 * 产品名称：quyiyuan
 * 创建者：高玉楼
 * 创建时间：2015年10月14日11:44:10
 * 创建原因：疾病详情控制器
 * 修改人：武帆
 * 修改任务：KYEEAPPC-7361
 * 修改原因：迁移前端涉及ms-guide上海组件到后端调用所需改动
 */
new KyeeModule()
    .group("kyee.quyiyuan.DiagnosticInfo.controller")
    .require([
    "kyee.quyiyuan.triageSelectDept.controller",
    "kyee.quyiyuan.appointment.doctor_detail.service",
    "kyee.quyiyuan.consultation.consult_doctor_main.service",
    "kyee.quyiyuan.consultation.consult_doctor_list.service",
    "kyee.quyiyuan.consultation.consult_doctor_list.controller",
    "kyee.quyiyuan.DiagnosticDetail.controller"])
    .type("controller")
    .name("DiagnosticInfoController")
    .params(["$scope","$rootScope", "$state", "DiagnosticResultService","CacheServiceBus",
        "TriageSelectDeptService","KyeeI18nService","HospitalSelectorService",
        "AppointmentDeptGroupService","KyeeMessageService","AppointmentDoctorDetailService",
        "ConsultDoctorMainService","ConsultDoctorListService","KyeeListenerRegister","OperationMonitor"])
    .action(function ($scope,$rootScope,$state, DiagnosticResultService,CacheServiceBus,
          TriageSelectDeptService,KyeeI18nService,HospitalSelectorService,AppointmentDeptGroupService,
          KyeeMessageService,AppointmentDoctorDetailService,ConsultDoctorMainService,ConsultDoctorListService,
          KyeeListenerRegister,OperationMonitor) {
        $scope.isSummary = false;
        var diseaseId='';
        var diseaseName='';
        if(DiagnosticResultService.disease){
            diseaseId = DiagnosticResultService.disease.diseaseCode;
            diseaseName = DiagnosticResultService.disease.diseaseName;
        }
        if(DiagnosticResultService.junioNames){
            $scope.junioNamesList = DiagnosticResultService.junioNames;
            $scope.junioNames="";
            var te="";
            for(var i=0;i<$scope.junioNamesList.length;i++){
                if(i<$scope.junioNamesList.length-1){
                    $scope.junioNames = $scope.junioNames + $scope.junioNamesList[i]　+ "、"　;
                }else{
                    te=$scope.junioNamesList[i];
                }
                $scope.junioNames=$scope.junioNames+te;

            }
        };
        //初始化加载疾病信息
        DiagnosticResultService.loadDiseaseInfo(diseaseId,diseaseName,function(data){
            if(data&&data.status=="SUCCESS"){
                $scope.diseaseInfo = data.data;
                DiagnosticResultService.diseaseInfo =data.data;
                $scope.summary = dealData(data.data[0].liInfo);
            }
        });
        $scope.isShowMore = false;
        /**
         * 监听
         */
        KyeeListenerRegister.regist({
            focus: "diagnosticInfo",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (param) {
                //得到推荐医生
                var seniorDeptCodes = unique(DiagnosticResultService.seniorIds).join(',');
                DiagnosticResultService.getTopDoctor(seniorDeptCodes,function(data){
                    if(data.doctorList.length > 4){
                        $scope.isShowMore = true;
                    }
                    $scope.doctorList = handleDoctorList(data.doctorList).splice(0,4);
                });
            }
        });
        function unique(arr) {
            var result = [], hash = {};
            for (var i = 0, elem; (elem = arr[i]) != null; i++) {
                if (!hash[elem]) {
                    result.push(elem);
                    hash[elem] = true;
                }
            }
            return result;
        }
        $scope.goDoctorList = function(){
            ConsultDoctorListService.defaultDept = {
                code:$scope.doctorList[0].seniorDeptCode,
                name:$scope.doctorList[0].seniorDeptName
            };
            OperationMonitor.record("recommendDoctor", "diagnosticInfo");
            $state.go("consult_doctor_list");
        };
        $scope.goDoctorInfo = function(doctor){
            var currentCustomPatient = CacheServiceBus.getMemoryCache().get('currentCustomPatient');
            var hospitalInfo = CacheServiceBus.getStorageCache().get("hospitalInfo");
            OperationMonitor.record("recommendDoctor", "diagnosticInfo");
            AppointmentDoctorDetailService.doctorInfo = {
                HOSPITAL_ID: doctor.hospitalId,
                DEPT_CODE: doctor.deptCode,
                DEPT_NAME: doctor.dept,
                USER_VS_ID: currentCustomPatient && currentCustomPatient.USER_VS_ID,
                DOCTOR_CODE: doctor.doctorCode,
                DOCTOR_NAME: doctor.name,
                DOCTOR_TITLE: doctor.title,
                IS_ONLINE: doctor.isOnline,
                HOSPITAL_NAME: doctor.hospital,
                DOCTOR_DESC: doctor.description,
                DOCTOR_PIC_PATH: doctor.photo,
                DOCTOR_SEX:doctor.sex
            };
            AppointmentDoctorDetailService.activeTab = 1;
            //切换医院
            if(hospitalInfo && hospitalInfo.id === doctor.hospitalId) {
                $state.go("doctor_info");
                return;
            }
            changeHospital(doctor.hospitalId,function(){
                $state.go("doctor_info");
            });
        };
        function handleDoctorList(doctorList){
            angular.forEach(doctorList,function(doctor){
                //给医生图片赋默认值 页面仍做一层处理
                if (!doctor.photo) {
                    if(doctor.sex == 1) {
                        doctor.photo = 'resource/images/base/head_default_man.jpg';
                    }else{
                        doctor.photo = 'resource/images/base/head_default_female.jpg';
                    }
                }
            });
            return doctorList;
        }
        function changeHospital(hospitalId,callback){
            ConsultDoctorMainService.queryHospitalInfo(hospitalId, function(result){
                // 切换医院
                HospitalSelectorService.selectHospital(hospitalId, result.HOSPITAL_NAME,
                    result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                    result.CITY_CODE, result.CITY_NAME, "医院正在切换中...", function () {

                        callback && callback();
                    });
            });
        }
        //处理过长的简介
        function dealData (content) {
            var result=content;
            var index=result.indexOf("<p>");
            if(index!=-1){
                result=result.substring(index);
            }
            if(window.innerWidth<=320){
                if(result.length>35){
                    result = result.substr(0,35)+'...';
                }
            }else if(window.innerWidth<=375){
                if(result.length>45){
                    result = result.substr(0,45)+'...';
                }
            }else{
                if(result.length>50){
                    result = result.substr(0,50)+'...';
                }
            }
            return result;
        };

        var storageCache = CacheServiceBus.getStorageCache();

        $scope.hospitalName = storageCache.get('hospitalInfo').name;
        // 0:当前医院科室还未加载  1:当前医院无对应科室 2：当前医院有映射科室
        $scope.defaultHospitalIsEmpty = 0;
        //true 同城医院有相关科室数据;false 同城医院无相关科室数据
        $scope.isEmpty = false;
        $scope.sortShowText = KyeeI18nService.get("triageSelectDept.nearby","离我最近");
        $scope.defaultSortShow = false;
        $scope.moreDataCanBeLoaded = false;
        // 是否显示多家医院
        $scope.canShowMultiHospital = ($rootScope.ROLE_CODE!="5");
        var currentPage = 1;
        $scope.resultHos = [];

        //初始化加载科室列表
        var loadSameCityDeptData = function () {
            TriageSelectDeptService.loadSameCityDeptData(function (data, defaultHospitalIsEmpty,isEmpty) {
                if(!$scope.canShowMultiHospital){
                    // 微信公众号个性化需求
                    var urlHospitalId = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL).hospitalID;
                    $scope.isEmpty = true;
                    for(var i=0; i<data.length; i++){
                        if(data[i].hospitalId == urlHospitalId){
                            $scope.resultHos.push(data[i]);
                            $scope.isEmpty = false;
                            break;
                        }
                    }
                } else {
                    $scope.resultHos = data;
                    $scope.isEmpty = isEmpty;
                }

                $scope.defaultHospitalIsEmpty = defaultHospitalIsEmpty;

                if($scope.isEmpty||$scope.resultHos.length<10)
                {
                    $scope.moreDataCanBeLoaded =false;
                }
                else{
                    $scope.moreDataCanBeLoaded =true;
                }
                $scope.isSummary = true;
            }, DiagnosticResultService.disease.diseaseName,DiagnosticResultService.disease.diseaseCode,1);
        }
        loadSameCityDeptData();
        //选择科室
        $scope.chooseHosiptalDept = function(hospitalId,hospitalName,hospitalAddress, provinceCode, provinceName, cityCode, cityName,departName,departId){
            HospitalSelectorService.selectHospital(hospitalId, hospitalName, hospitalAddress, provinceCode, provinceName, cityCode, cityName, "正在加载医院信息...",
                function(disableInfo){
                    var hospitalInfo = CacheServiceBus.getStorageCache().get('hospitalInfo');
                    if(hospitalInfo && hospitalInfo.is_home_appoint_enable == '1'){
                        var deptInfo = {
                            DEPT_CODE: departId,
                            DEPT_NAME: departName,
                            IS_ONLINE:'0'
                        };
                        AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptInfo;
                        AppointmentDeptGroupService.ROUTER_STATE = "appointment";
                        $state.go('appointment_doctor');
                    }else{
                        KyeeMessageService.broadcast({
                            content:disableInfo
                        });
                    }
                });
        };
        //对医院排序
        $scope.sortHospital = function(){
            currentPage = 1;
            if($scope.defaultSortShow)
            {
                loadSameCityDeptDataT(true,currentPage);
                $scope.defaultSortShow = !$scope.defaultSortShow;
            }
            else{
                loadNearlyDeptData(true,currentPage);
            }

        };

        /**
         * 医院按默认方式排序
         * @param page当前记录页数
         */
        function loadSameCityDeptDataT(showLoadding,page)
        {
            //如果点击了默认排序，则显示离我最近按钮
            $scope.sortShowText = KyeeI18nService.get("triageSelectDept.nearby","离我最近");
            TriageSelectDeptService.loadSameCityDeptData(function(data, defaultHospitalIsEmpty,isEmpty){

                if(page==1)
                {
                    $scope.isEmpty = isEmpty;
                    $scope.data = data;
                }
                else
                {
                    $scope.data.concat(data);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }

                if(isEmpty||data.length<10)
                {
                    $scope.moreDataCanBeLoaded = false;
                }
                else{
                    $scope.moreDataCanBeLoaded = true;
                }
            },DiagnosticResultService.disease.diseaseName,DiagnosticResultService.disease.diseaseCode,page,showLoadding);
        };
        /**
         * 医院按离我最近方式排序
         * @param showLoadding 是否显示遮盖
         * @param page当前记录页数
         */
        function loadNearlyDeptData(showLoadding,page){
            //如果点击了离我最近，则显示默认排序按钮
            TriageSelectDeptService.loadNearlyDeptData(function(data, defaultHospitalIsEmpty,isEmpty){
                $scope.sortShowText = KyeeI18nService.get("triageSelectDept.sortByDefualt","默认排序");;
                $scope.defaultSortShow = !$scope.defaultSortShow;
                if(page==1)
                {
                    $scope.data = data;
                    $scope.isEmpty = isEmpty;
                }
                else{
                    $scope.data.concat(data);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
                if(isEmpty||data.length<10)
                {
                    $scope.moreDataCanBeLoaded = false;
                }
                else{
                    $scope.moreDataCanBeLoaded = true;
                }
            },DiagnosticResultService.disease.diseaseName,DiagnosticResultService.disease.diseaseCode,DiagnosticResultService.deptId,page,showLoadding);

        }

        /**
         * 加载更多医院信息
         */
        $scope.loadMoreData = function(){
            currentPage++;
            /**
             * 如果是按距离排序，则加载离我最近数据
             */
            if($scope.defaultSortShow)
            {
                loadSameCityDeptData(false,currentPage)
            }
            else{
                loadNearlyDeptData(false,currentPage);
            }
        };

        $scope.goToDetail= function(){
            $state.go("diagnosticDetail");
        }
    })
    .build();