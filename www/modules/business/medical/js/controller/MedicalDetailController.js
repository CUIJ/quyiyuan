/**
 * 产品名称 quyiyuan.
 * 创建用户: WangYuFei
 * 日期: 2015年5月7日13:46:40
 * 创建原因：KYEEAPPC-1959 报告单-体检单详情controller
 * 修改时间：2015年7月7日14:04:32
 * 修改人：程铄闵
 * 任务号：KYEEAPPC-2669
 * 修改原因：体检单迁移为独立模块
 */
new KyeeModule()
    .group("kyee.quyiyuan.medicalDetail.controller")
    .require(["kyee.quyiyuan.medical.service",
        "kyee.quyiyuan.appointment.service"
    ])
    .type("controller")
    .name("MedicalDetailController")
    .params(["$scope","MedicalService","AppointmentDeptGroupService","$state","KyeeUtilsService","KyeeI18nService","CacheServiceBus","HospitalSelectorService"])
    .action(function($scope,MedicalService,AppointmentDeptGroupService,$state,KyeeUtilsService,KyeeI18nService,CacheServiceBus,HospitalSelectorService){
        //初始化数据
        $scope.medicalDetailDatas = MedicalService.medicalDetailData;
        //初始化跳转科室显示
        //跳转到预约页面
        var dept = $scope.medicalDetailDatas.DEPTS;
        if(dept!=undefined&&dept!=''){
            var type = dept[0].SKIP_TYPE;
            if(type=='1'){
                $scope.skipDeptType = '1'
                $scope.skipDept = KyeeI18nService.get('medical_detail.appointBtn', '预约', null);
            }
            //跳转挂号页面
            else if(type=='2'){
                $scope.skipDeptType = '2'
                $scope.skipDept =KyeeI18nService.get('medical_detail.registBtn', '挂号', null);
            }
            //不跳转
            else{
                $scope.skipDeptType = ''
                $scope.skipDept = ''
            }
        }
        //不跳转
        else{
            $scope.skipDeptType = ''
            $scope.skipDept = ''
        }
        //单击项目
        $scope.isDisplay=0;
        $scope.clickItem= function(index){
            if($scope.isDisplay == index){
                $scope.isDisplay = -1;
            }
            else{
                $scope.isDisplay = index;
            }
        };
        //页面跳转
        $scope.goRegistOrAppointPage = function(medicalDetailData){
            var params={DEPT_CODE:medicalDetailData.SKIP_DEPT_CODE,DEPT_NAME:medicalDetailData.SKIP_DEPT_NAME};
            var currentHospitalInfo =  CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            //如果报告单的医院不是当前医院，先切换医院 KYEEAPPTEST-3535
            if(!currentHospitalInfo||medicalDetailData.HOSPITAL_ID!=currentHospitalInfo.id){
                HospitalSelectorService.selectHospitalById(medicalDetailData.HOSPITAL_ID,function(){
                    goToDoctorList(params,medicalDetailData.SKIP_TYPE);
                });
            }
            else
            {
                goToDoctorList(params,medicalDetailData.SKIP_TYPE);
            }
        };

        /**
         * 跳转到医生列表
         * @param params 给医生列表页面传递的科室信息{DEPT_CODE:'',DEPT_NAME:''}
         * @param skipType 跳转类型 1：预约 2:挂号
         */
        function goToDoctorList(params,skipType){
            if(skipType=='1'){
                //跳转到预约页面
                AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = params;
                AppointmentDeptGroupService.ROUTER_STATE="appoint";
                $state.go('appointment_doctor');
            }else if(skipType=='2'){
                //跳转挂号页面
                AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = params;
                AppointmentDeptGroupService.ROUTER_STATE="regist";
                $state.go('appointment_doctor');
            }
        }
        //日期格式化
        $scope.getDate = function(param){
            if(param !=undefined && param !=null && param !=""){
                return KyeeUtilsService.DateUtils.formatFromDate(param,'YYYY/MM/DD');
            }
        };
    })
    .build();