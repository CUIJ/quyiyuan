new KyeeModule()
    .group("kyee.quyiyuan.homeClinic.controller")
    .require([
        "kyee.quyiyuan.homeClinic.service"
    ])
    .type("controller")
    .name("HomeClinicController")
    .params(["$scope", "$rootScope", "$state","KyeeListenerRegister","$sce","$ionicHistory","ConsultDoctorListService","HomeClinicService","HospitalDetailService","OutNavigationService","AppointmentDeptGroupService",
    "HospitalService","AppointmentDoctorService","CacheServiceBus","AppointmentDoctorDetailService","$ionicScrollDelegate","HospitalDeptListService","HospitalFilterDef","KyeeUtilsService"])
    .action(function ($scope, $rootScope, $state,KyeeListenerRegister,$sce,$ionicHistory,ConsultDoctorListService,HomeClinicService,HospitalDetailService,OutNavigationService,AppointmentDeptGroupService,
                      HospitalService,AppointmentDoctorService,CacheServiceBus,AppointmentDoctorDetailService,$ionicScrollDelegate,HospitalDeptListService,HospitalFilterDef,KyeeUtilsService) {
        var storageCache= CacheServiceBus.getStorageCache(); //缓存数据
        $scope.deptList = angular.copy(ConsultDoctorListService.deptList);
        $scope.clinicDept = false;
        $scope.showMoreMenu = false;
        $scope.menu=[];
        $scope.showMoreText = "更多";
        $scope.CLINIC_DEPT_INFO = [];
        $scope.goBack = function () {
            $ionicHistory.goBack(-1);
        };
        //处理科室信息
        var detailDept = function(dept){
            $scope.CLINIC_DEPT_INFO = [];
          for(var i = 0;i<dept.length;i++){
              for(var j = 0;j<dept[i].items.length;j++){
                  $scope.CLINIC_DEPT_INFO.push(dept[i].items[j].deptData);
              }
          }
          for(var k=1;k<$scope.CLINIC_DEPT_INFO.length;k++){
              if($scope.CLINIC_DEPT_INFO[k].IS_KEY==='1'&&$scope.CLINIC_DEPT_INFO[k-1].IS_KEY!='1'){
                  var normalDept = $scope.CLINIC_DEPT_INFO[k-1];
                  $scope.CLINIC_DEPT_INFO[k-1] = $scope.CLINIC_DEPT_INFO[k];
                  $scope.CLINIC_DEPT_INFO[k] = normalDept
              }
          }
        };
        // 处理医生信息
        // var detailDoctor = function (doctor) {
        //     $scope.CLINIC_DOCTOR_INFO = [];
        //     for(var i = 0;i<doctor.length;i++){
        //     }
        // };
        var setDeptStyle = function () {
            for(var i=0;i<$scope.CLINIC_DEPT_INFO.length;i++){
                var number = i % 6 + 1;
                var deptName = $scope.CLINIC_DEPT_INFO[i].DEPT_NAME;
                switch(true){
                    case /内科/.test(deptName):
                        $scope.CLINIC_DEPT_INFO[i].icon = $scope.deptList[1].icon +' dept_color' + number + ' dept_bg' + number;
                        break;
                    case /外科/.test(deptName):
                        $scope.CLINIC_DEPT_INFO[i].icon = $scope.deptList[2].icon +' dept_color' + number + ' dept_bg' + number;
                        break;
                    case /骨科/.test(deptName):
                        $scope.CLINIC_DEPT_INFO[i].icon = $scope.deptList[3].icon +' dept_color' + number + ' dept_bg' + number;
                        break;
                    case /妇产科/.test(deptName):
                        $scope.CLINIC_DEPT_INFO[i].icon = $scope.deptList[4].icon +' dept_color' + number + ' dept_bg' + number;
                        break;
                    case /儿科/.test(deptName):
                        $scope.CLINIC_DEPT_INFO[i].icon = $scope.deptList[5].icon +' dept_color' + number + ' dept_bg' + number;
                        break;
                    case /眼科/.test(deptName):
                        $scope.CLINIC_DEPT_INFO[i].icon = $scope.deptList[6].icon +' dept_color' + number + ' dept_bg' + number;
                        break;
                    case /耳鼻喉/.test(deptName):
                        $scope.CLINIC_DEPT_INFO[i].icon = $scope.deptList[7].icon +' dept_color' + number + ' dept_bg' + number;
                        break;
                    case /口腔/.test(deptName):
                        $scope.CLINIC_DEPT_INFO[i].icon = $scope.deptList[8].icon +' dept_color' + number + ' dept_bg' + number;
                        break;
                    case /皮肤/.test(deptName):
                        $scope.CLINIC_DEPT_INFO[i].icon = $scope.deptList[9].icon +' dept_color' + number + ' dept_bg' + number;
                        break;
                    case /肿瘤/.test(deptName):
                        $scope.CLINIC_DEPT_INFO[i].icon = $scope.deptList[10].icon +' dept_color' + number + ' dept_bg' + number;
                        break;
                    case /麻醉/.test(deptName):
                        $scope.CLINIC_DEPT_INFO[i].icon = $scope.deptList[11].icon +' dept_color' + number + ' dept_bg' + number;
                        break;
                    case /医学影像/.test(deptName):
                        $scope.CLINIC_DEPT_INFO[i].icon = $scope.deptList[12].icon +' dept_color' + number + ' dept_bg' + number;
                        break;
                    case /中医/.test(deptName):
                        $scope.CLINIC_DEPT_INFO[i].icon = $scope.deptList[13].icon +' dept_color' + number + ' dept_bg' + number;
                        break;
                    case /精神心理/.test(deptName):
                        $scope.CLINIC_DEPT_INFO[i].icon = $scope.deptList[14].icon +' dept_color' + number + ' dept_bg' + number;
                        break;
                    case /生殖/.test(deptName):
                        $scope.CLINIC_DEPT_INFO[i].icon = $scope.deptList[15].icon +' dept_color' + number + ' dept_bg' + number;
                        break;
                    case /康复/.test(deptName):
                        $scope.CLINIC_DEPT_INFO[i].icon = $scope.deptList[16].icon +' dept_color' + number + ' dept_bg' + number;
                        break;
                    case /传染病/.test(deptName):
                        $scope.CLINIC_DEPT_INFO[i].icon = $scope.deptList[17].icon +' dept_color' + number + ' dept_bg' + number;
                        break;
                    default:
                        $scope.CLINIC_DEPT_INFO[i].icon = $scope.deptList[18].icon +' dept_color' + number + ' dept_bg' + number;
                        break;
                }
            }
        };
        //获取科室信息
        $scope.fowardPage = function(dept){
            var isFromFiler = false;
            HospitalFilterDef.doFinashIfNeed({
                onBefore : function(){
                    isFromFiler = true;
                }
            });
            $scope.WARN_MSG = '';
            if($scope.DEPT_REASON_TIPS!=undefined&&$scope.DEPT_REASON_TIPS!=''&&$scope.DEPT_REASON_TIPS!=null){
                for (var i = 0; i < $scope.DEPT_REASON_TIPS.length; i++){
                    if(dept.DEPT_CODE== $scope.DEPT_REASON_TIPS[i].DEPT_CODE){
                        $scope.WARN_MSG=$scope.DEPT_REASON_TIPS[i].RELEASE_MSG;
                        //$scope.SUGGESTION_MSG = "是否继续？";
                        break;
                    }

                }
            }
            dept.IS_REFERRAL =0 ;//科室分级在科室信息中传递
            AppointmentDeptGroupService.SELECT_DEPTGROUPDATA =dept;
            //将点击的某一科室对象放入科室服务中
            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.DEPT_INFO,dept);
            $state.go("appointment_doctor");
        };
        //获取医生信息
        var getDoctor = function () {
            var currentPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            var userVsId = currentPatient ? currentPatient.USER_VS_ID : '';
            //获取科室医生
            var params = {
                hospitalId: $scope.clinicInfo.HOSPITAL_ID,
                deptCode: $scope.deptCode,
                USER_VS_ID: userVsId,
                bussinessType: 2,
                IS_ONLINE: $scope.isOnline,
                IS_REFERRAL: $scope.isReferral
            };
            //获取医生数据
            AppointmentDoctorService.queryDoctorData(params, function (doctor, resultData) {
                //是否显示预约费用
                $scope.IS_SHOW_AMOUNT = doctor.IS_SHOW_AMOUNT;
                $scope.HID_REMIND = doctor.HID_REMIND;
                $scope.HID_REMIND_CARE = doctor.HID_REMIND_CARE;
                $scope.CARE_MSG = '放号提醒';
                $scope.CARE_COLOR = '';
                if (doctor.HID_REMIND_CARE.CARE == 1) {
                    $scope.CARE_MSG = '取消提醒';
                }

                var refreshGuideClose = localStorage['refreshGuideClose'];
                $scope.REFRESH_GUIDE = '1';
                if (refreshGuideClose) {
                    $scope.REFRESH_GUIDE = '0';
                }

                //暂无数据
                if (resultData.doctorListArr.length <= 0 || resultData.doctorListArr == undefined || resultData.doctorListArr == null) {
                    $scope.empty = true;
                } else {
                    $scope.empty = false;
                }
                AppointmentDoctorService.DOCTOR_LIST = resultData.doctorListArr;
                //如果有满足条件的医生排班，则只显示满足条件的医生排班
                if (resultData.doctorListArr.length === 0) {
                    $scope.sceduleIsEmpty = true;
                }
                $scope.doctorarr = resultData.doctorListArr;
                //所有有号源的医生
                $scope.arrisschudleTime = resultData.arrisschudleTime;
                $scope.arrisschudleCopy = angular.copy(resultData.arrisschudleTime);
                //是否展示医生职称过滤
                $scope.IS_SHOW_FILTER_CONDITIONS = resultData.IS_SHOW_FILTER_CONDITIONS;
                //医生职称过滤的条件
                $scope.FILTER_CONDITIONS = resultData.FILTER_CONDITIONS;
                $scope.showMYD = false;
                if (doctor.ISSHOW_MYD == 1) {
                    $scope.showMYD = true;
                }
                detailDoctor($scope.doctorarr);
            });
        };
        //进入医生首页
        $scope.showDoctorInfo=function(doctor, index){
            AppointmentDoctorDetailService.doctorInfo=doctor;
            var selDateStr=new Date();
            selDateStr=selDateStr.getFullYear()+"-"+(selDateStr.getMonth()+1)+"-"+selDateStr.getDate();
            var selectDate = [];
            selectDate.push(selDateStr);
            AppointmentDoctorDetailService.selectDate=selectDate;
            AppointmentDoctorDetailService.doctorInfo.DEPT_NAME = $scope.deptName;
            AppointmentDoctorDetailService.doctorCare={
                index : index,
                careFlag: 0
            };
            $state.go('doctor_info');
        };
        KyeeListenerRegister.regist({
            focus: "homeClinic",
            direction: "both",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function (params) {
                $ionicScrollDelegate.$getByHandle().scrollTop();
                $scope.deptList = angular.copy(ConsultDoctorListService.deptList);
                $scope.clinicInfo = HomeClinicService.clinicInfo;
                //获取科室
                AppointmentDeptGroupService.queryDept($scope.clinicInfo.HOSPITAL_ID, function (resultData,isGroupDept,deptReasonTips) {
                    //获取不分级科室
                    $scope.isGroupDept=isGroupDept;
                    $scope.DEPT_REASON_TIPS = deptReasonTips;
                    if(parseInt($scope.isGroupDept)==0){
                        //暂无数据
                        if(resultData.length<=0|| resultData==undefined || resultData==null){
                            $scope.empty=1;
                        }else{
                            $scope.empty=2;
                        }
                        $scope.data=resultData;
                        if($scope.data.length==1&&$scope.data[0].items.length==1){
                            $scope.deptCode = $scope.data[0].items[0].deptData.DEPT_CODE;
                            $scope.deptName = $scope.data[0].items[0].deptData.DEPT_NAME;
                            $scope.isReferral = 0;
                            $scope.isOnline = $scope.data[0].items[0].deptData.IS_ONLINE;
                            getDoctor();
                            $scope.clinicDept = false;
                            $scope.clinicDoctor = true;
                        }else {
                            detailDept($scope.data);
                            setDeptStyle($scope.CLINIC_DEPT_INFO);
                            $scope.clinicDept = true;
                            $scope.clinicDoctor = false;
                        }
                    }else{
                        //获取分级科室
                        if(resultData.length<=0|| resultData==undefined || resultData==null){
                            $scope.empty=1;
                        }else{
                            $scope.empty=2;
                        }
                        if(resultData.length)
                        {
                            if(resultData.length==1&&resultData[0].children.length==1) {
                                $scope.deptCode = resultData[0].children[0].DEPT_CODE;
                                $scope.deptName = resultData[0].children[0].DEPT_NAME;
                                $scope.isReferral = 0;
                                $scope.isOnline = resultData[0].children[0].IS_ONLINE;
                                getDoctor();
                                $scope.clinicDept = false;
                                $scope.clinicDoctor = true;
                            }
                            else{
                                $scope.groupDept = resultData;
                                $scope.data = [];
                                for (var i = 0; i < resultData.length; i++) {
                                    $scope.data.push.apply($scope.data, resultData[i].children);
                                }
                                detailDept($scope.data);
                                setDeptStyle($scope.CLINIC_DEPT_INFO);
                                $scope.clinicDept = true;
                                $scope.clinicDoctor = false;
                            }
                        }
                        else
                        {
                            $scope.groupDept = [];
                            $scope.deptData =  [];
                        }
                    }

                });
            }
        }),
        HospitalService.updateUI();
        $scope.sudokuData = HospitalService.loadSudokuData();
        $scope.sudokuDataList = [];
        $scope.sudokuMainList =[];
        $scope.sudokuMainList[0]={
            default: true,
            elementCode: "doctorConsult",
            enable: 0,
            href: "consult_doctor_list",
            icon: "icon-doctor-consult",
            image_new_url: "resource/images/hospital/consult.png",
            image_new_url_next: "resource/images/hospital/consult-ico.png",
            name: "咨询医生",
            name_key: "home->MAIN_TAB.name_CONSULT_DOCTOR",
            name_org: "咨询医生",
            shortcuts_image_url: "图文、电话、视频咨询",
            shortcuts_image_url_key: "home->MAIN_TAB.info_CONSULT_DOCTOR",
            shortcuts_image_url_org: "图文、电话、视频咨询"
        };
        $scope.sudokuMainList[1]={
            default: true,
            elementCode: "networkClinic",
            enable: 0,
            href: "network_clinic_dl",
            icon: "icon-online-medical",
            image_new_url: "resource/images/hospital/net-hospital.png",
            name: "网络门诊",
            name_key: "home->MAIN_TAB.name_NETWORK_CLINIC",
            name_org: "网络门诊",
            shortcuts_image_url: "远程购药开单",
            shortcuts_image_url_key: "home->MAIN_TAB.info_NETWORK_CLINIC",
            shortcuts_image_url_org: "远程购药开单"
        };

        for (var i = 0; i < $scope.sudokuData.length; i++) {
            $scope.sudokuData[i].shortcuts_image_url = '';
            if($scope.sudokuData[i].elementCode != 'hospitalIntroduce' &&$scope.sudokuData[i].elementCode != 'doctorConsult'
                && $scope.sudokuData[i].elementCode != 'networkClinic' && ($scope.sudokuData[i].enable===1||$scope.sudokuData[i].enable==='1')){
                    $scope.sudokuMainList.push($scope.sudokuData[i]);
            }else if($scope.sudokuData[i].elementCode == 'doctorConsult'){
                $scope.sudokuMainList[0].enable = $scope.sudokuData[i].enable;
            }else if($scope.sudokuData[i].elementCode == 'networkClinic'){
                $scope.sudokuMainList[1].enable = $scope.sudokuData[i].enable;
            }
        }
        for(var k = 0; k < $scope.sudokuMainList.length; k++){
            $scope.sudokuMainList[k].icon += ' menuColor'+( k % 4 + 1);
            if($scope.sudokuMainList[k].elementCode == 'walletCardRecharge'){
                $scope.sudokuMainList[k].icon += ' changeSize'
            }
            if($scope.sudokuMainList[k].elementCode == 'ncmsFamialy'){
                $scope.sudokuMainList[k].icon += ' changeSize2'
            }
            if($scope.sudokuMainList[k].elementCode == 'appointment'){
                $scope.sudokuMainList[k].icon += ' changeSize23'
            }
            if($scope.sudokuMainList[k].elementCode == 'price'){
                $scope.sudokuMainList[k].icon += ' changeSize22'
            }
            if($scope.sudokuMainList[k].elementCode == 'schedule'){
                $scope.sudokuMainList[k].icon += ' changeSize22'
            }
            if($scope.sudokuMainList[k].elementCode == 'hospitalNotice'){
                $scope.sudokuMainList[k].icon += ' changeSize23'
            }
            if($scope.sudokuMainList[k].elementCode == 'reportMultiple'){
                $scope.sudokuMainList[k].icon += ' changeSize25'
            }
            if($scope.sudokuMainList[k].enable==0){
                var tmpList = $scope.sudokuMainList[k];
                $scope.sudokuMainList.splice(k,1);
                $scope.sudokuMainList.push(tmpList);
                if(k < $scope.sudokuMainList.length-1 && $scope.sudokuMainList[k+1].enable == 1){
                    k--;
                }
            }
        }
        if($scope.sudokuMainList.length>4){
            $scope.sudokuDataList = angular.copy($scope.sudokuMainList).slice(0,4);
            $scope.showMoreMenu = true;
        }else{
            $scope.sudokuDataList = angular.copy($scope.sudokuMainList);
        }
        $scope.openModule = HospitalService.openModule;
        $scope.aboutClinic = function () {
            $state.go('clinic_introduce');
        },

        $scope.toMap = function(event){
            OutNavigationService.openNavigationOut();
            event.stopPropagation();
        },

        $scope.appoint = function () {
            $state.go('appointment')
        },
        $scope.gotoDept = function (item) {
            var dept = {
                DEPT_CODE: item.departId,
                DEPT_DIC: "",
                DEPT_ID: item.departId,
                DEPT_NAME: item.departName,

                DEPT_POSTION: "",
                DEPT_TYPE: "0",
                DISPLAY_ORDER: 0,
                FULL_UPPER_SPELL: "",
                HOSPITAL_ID: $scope.clinicInfo.HOSPITAL_ID,
                IS_KEY: "",
                IS_ONLINE: "0",
                IS_REFERRAL: 0,
                onlineAccount: 0
            };
            dept.IS_REFERRAL =AppointmentDeptGroupService.IS_REFERRAL ;//科室分级在科室信息中传递
            AppointmentDeptGroupService.SELECT_DEPTGROUPDATA =dept;
            //将点击的某一科室对象放入科室服务中
            storageCache.set(CACHE_CONSTANTS.STORAGE_CACHE.DEPT_INFO,dept);
            $state.go("appointment_doctor");
        };
        $scope.showMore = function(){
            if($scope.showMoreMenu){
                $scope.sudokuDataList = angular.copy($scope.sudokuMainList);
                $scope.showMoreMenu = !$scope.showMoreMenu;
                $scope.showMoreText = "收起";
            }else{
                $scope.sudokuDataList = angular.copy($scope.sudokuMainList).slice(0,4);
                $scope.showMoreMenu = !$scope.showMoreMenu;
                $scope.showMoreText = "更多";
            }
            $ionicScrollDelegate.$getByHandle().scrollTop();
        }
    }).build();