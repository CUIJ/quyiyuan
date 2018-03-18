/**
 * 产品名称：quyiyuan.
 * 创建用户：高玉楼
 * 日期：2015年10月28日10:39:16
 * 创建原因：疾病信息页面控制器
 * 任务：KYEEAPPC-3622
 * 修改人：武帆
 * 修改任务：KYEEAPPC-7361
 * 修改原因：迁移前端涉及ms-guide上海组件到后端调用所需改动
 */
new KyeeModule()
    .group("kyee.quyiyuan.multiplequery.diseaseinfoquery.controller")
    .require(["kyee.quyiyuan.multiplequery.diseaseinfoquery.service",
    "kyee.quyiyuan.DiagnosticInfo.controller",
    "kyee.quyiyuan.diseaseinfo.controller"])
    .type("controller")
    .name("DiseaseInfoQueryController")
    .params(["$scope","$state", "KyeeMessageService","DiseaseInfoQueryService","AppointmentDeptGroupService","CacheServiceBus","HospitalSelectorService","MultipleQueryService","KyeeI18nService"])
    .action(function($scope,$state, KyeeMessageService,DiseaseInfoQueryService,AppointmentDeptGroupService,CacheServiceBus,HospitalSelectorService,MultipleQueryService,KyeeI18nService){
        var selectedCity = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO),cityCode;
        if(selectedCity){
            cityCode = selectedCity.CITY_CODE;
        }
        $scope.result={
            deptData:[],
            doctorData:[]
        };
        var diseaseInfoContent='';
        $scope.diseaseName = DiseaseInfoQueryService.diseaseName;
        $scope.diseaseId = DiseaseInfoQueryService.diseaseId;

        /**
         * 跳转到医生排班页面
         */
        $scope.goToAppointMent = function(data){
            var hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            if(data.HOSPITAL_ID !== hospitalId){
                // 切换医院
                HospitalSelectorService.selectHospital(data.HOSPITAL_ID, data.HOSPITAL_NAME,
                    data.MAILING_ADDRESS, data.PROVINCE_CODE, data.PROVINCE_NAME,
                    data.CITY_CODE, data.CITY_NAME, KyeeI18nService.get("multiple_query.switchHospital","医院正在切换中..."), function (disableInfo) {
                        //预约挂号禁用权限
                        var hospitalInfo = CacheServiceBus.getStorageCache().get('hospitalInfo');
                        if(hospitalInfo && hospitalInfo.is_home_appoint_enable == '1'){
                            var deptData = {};
                            deptData.DEPT_CODE = data.DEPT_CODE;
                            deptData.DEPT_NAME = data.DEPT_NAME;
                            deptData.IS_ONLINE = 0;
                            AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptData;
                            $state.go("appointment_doctor");
                        }else{
                            KyeeMessageService.broadcast({
                                content:disableInfo
                            });
                        }
                    });
            }
            else{
                var deptData = {};
                deptData.DEPT_CODE = data.DEPT_CODE;
                deptData.DEPT_NAME = data.DEPT_NAME;
                AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptData;
                $state.go("appointment_doctor");
            }

        };
        /**
         * 跳转到疾病详情页面
         */
        $scope.goToDiseaseInfo = function(){
            DiseaseInfoQueryService.disease = {
                diseaseName:DiseaseInfoQueryService.diseaseName,
                diseaseId:DiseaseInfoQueryService.diseaseId,
                diseaseInfo:diseaseInfoContent
            };
            $state.go("disease_info");
        };

			

        //初始化加载疾病信息 KYEEAPPC-10354 yangmingsi
        DiseaseInfoQueryService.getDiseaseInfo(function(data){
            diseaseInfoContent = data.data;
            if(data.data)
            {
                //去除描述中的html标签
                var diseaseInfoFont = data.data[0].liInfo;
                $scope.diseaseInfo=diseaseInfoFont.replace(/<[^>]+>/g,"");
            }

        });
        //获取科室请求是否完成
        $scope.departLoaded = false;
        /**
         * 获取标准科室和各医院数据
         */
        DiseaseInfoQueryService.getDeptInfo(function(deptData,departData){
            var departStr="";
            for(var i=0;i<deptData.data.length;i++)
            {
                departStr=deptData.data[i].juniorName+" / ";
            }
            if(departStr.length>0)
            {
                if(departStr.lastIndexOf(" / ")==departStr.length-3)
                {
                    departStr = departStr.substr(0,departStr.length-3);
                }
            }
            var deptData = formatDeptData(departData);
            //begin 高玉楼  同城科室优先显示  KYEEAPPC-3973
            deptData = deptData.sort(compareDeptaData);
            //end 高玉楼 KYEEAPPC-3973
            $scope.departName = departStr;
            $scope.result.deptData = deptData;
            $scope.departLoaded = true;
            DiseaseInfoQueryService.depetData = deptData;
        });
        //更多推荐医院科室
        $scope.goToDeptList = function(){
            MultipleQueryService.allMetipleInfo.deptData =DiseaseInfoQueryService.depetData;
            MultipleQueryService.KeyWords = DiseaseInfoQueryService.keyWords;
            //记录页面跳转的路由栈  By 杜巍巍  KYEEAPPC-3927
            MultipleQueryService.ChangeRouter("multiple_query.disease_info_query","multiple_query.multiple_deptInfo");
            MultipleQueryService.historyStack.push('multiple_query.disease_info_query');
            $state.go('multiple_query.multiple_deptInfo');
        };

        /**
         *  格式化数据
         * @param departData
         * @returns {Array}
         */
        function formatDeptData(departData){
            var deptData=[];
            if(departData)
            {
                for(var i=0;i<departData.length;i++)
                {
                    var hospitalData = departData[i];

                        deptData.push({
                            HOSPITAL_ID:hospitalData.hospitalCodeXian,
                            HOSPITAL_NAME:hospitalData.hospitalName,
                            HOSPITAL_PICTURE:hospitalData.hospitalLogo,
                            PROVINCE_CODE:hospitalData.provinceCode,
                            PROVINCE_NAME:hospitalData.provinceName,
                            CITY_CODE:hospitalData.cityCode,
                            CITY_NAME:hospitalData.cityName,
                            HOSPITAL_ADDRESS:hospitalData.hospitalAddress,
                            DEPT_CODE:hospitalData.deptCodeXian,
                            DEPT_NAME:hospitalData.deptName,
                            showText:hospitalData.deptName
                        });

                }
            }
            return deptData;
        };

        //begin 高玉楼  同城科室优先显示  KYEEAPPC-3973
        function compareDeptaData(preDeptData,nextDeptData){
            if(cityCode)
            {
                return Math.abs(parseInt(preDeptData.CITY_CODE)-parseInt(cityCode))-Math.abs(nextDeptData.CITY_CODE-parseInt(cityCode));
            }
            else{
                return 1;
            }
        };
        //end 高玉楼  KYEEAPPC-3973

    })
    .build();