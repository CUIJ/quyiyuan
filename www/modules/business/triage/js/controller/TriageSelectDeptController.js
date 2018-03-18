/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2015年5月6日15:25:25
 * 创建原因：选择科室控制器
 * 修改者：高玉楼
 * 修改任务：KYEEAPPC-3622
 * 修改原因：症状自查科室为空时的处理
 */
new KyeeModule()
    .group("kyee.quyiyuan.triageSelectDept.controller")
    .require([
        "kyee.quyiyuan.triageSelectDept.service",
        "kyee.quyiyuan.appointment.service",
        "kyee.quyiyuan.scheduleDept.service"
    ])
    .type("controller")
    .name("TriageSelectDeptController")
    .params(["$scope", "$rootScope", "$state", "TriageSelectDeptService", "HttpServiceBus", "DiagnosticResultService", "AppointmentDeptGroupService", "ScheduleDeptService", "CacheServiceBus","HospitalSelectorService","KyeeI18nService"])
    .action(function ($scope, $rootScope, $state, TriageSelectDeptService, HttpServiceBus, DiagnosticResultService, AppointmentDeptGroupService, ScheduleDeptService, CacheServiceBus,HospitalSelectorService,KyeeI18nService) {
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
        $scope.data = [];

        //初始化加载科室列表
        TriageSelectDeptService.loadSameCityDeptData(function (data, defaultHospitalIsEmpty,isEmpty) {
            if(!$scope.canShowMultiHospital){
                // 微信公众号个性化需求
                var urlHospitalId = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL).hospitalID;
                $scope.isEmpty = true;
                for(var i=0; i<data.length; i++){
                    if(data[i].hospitalId == urlHospitalId){
                        $scope.data.push(data[i]);
                        $scope.isEmpty = false;
                        break;
                    }
                }
            } else {
                $scope.data = data;
                $scope.isEmpty = isEmpty;
            }

            $scope.defaultHospitalIsEmpty = defaultHospitalIsEmpty;

            if($scope.isEmpty||$scope.data.length<10)
            {
                $scope.moreDataCanBeLoaded =false;
            }
            else{
                $scope.moreDataCanBeLoaded =true;
            }

        }, DiagnosticResultService.disease.diseaseName,DiagnosticResultService.disease.diseaseCode,DiagnosticResultService.deptId,1);

        $scope.dept = {deptName:DiagnosticResultService.deptName};
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
                loadSameCityDeptData(true,currentPage);
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
        function loadSameCityDeptData(showLoadding,page)
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
            },DiagnosticResultService.disease.diseaseName,DiagnosticResultService.disease.diseaseCode,DiagnosticResultService.deptId,page,showLoadding);
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

        };

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
    })
    .build();