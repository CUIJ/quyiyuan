/**
 * 产品名称：quyiyuan.
 * 创建用户：杜巍巍
 * 日期：2015年8月6日
 * 创建原因：附近医院页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.nearbyHospital.controller")
    .require([
        "kyee.quyiyuan.nearbyHospital.service",
        "kyee.framework.base.support.listener",
        "kyee.quyiyuan.home.service",
        "kyee.framework.service.message"
    ])
    .type("controller")
    .name("NearbyHospitalController")
    .params(["$scope", "$state", "KyeeListenerRegister",
        "NearbyHospitalService", "HospitalSelectorService", "CacheServiceBus",
        "HomeService", "KyeeMessageService","KyeeI18nService",
        "AppointmentDeptGroupService"])
    .action(function ($scope, $state, KyeeListenerRegister,
                      NearbyHospitalService, HospitalSelectorService, CacheServiceBus,
                      HomeService, KyeeMessageService,KyeeI18nService,
                      AppointmentDeptGroupService) {
        $scope.RecommendHasData = false;
        $scope.NearbyHasData = false;
        $scope.NearbyText = false;
        $scope.RecommendText = false;
        $scope.RecDeptNameHasData = [];
        $scope.NearDeptNameHasData = [];


        //选择推荐医院后跳回C端主页，并且把C端主页的医院名字切换成所选择的医院
        $scope.selectRemHospital = function (index) {
            var info = $scope.recommendhospitalinfo[index];
            // 切换医院
            HospitalSelectorService.selectHospital(info.HOSPITAL_ID, info.HOSPITAL_NAME,
                info.MAILING_ADDRESS, info.PROVINCE_CODE, info.PROVINCE_NAME,
                info.CITY_CODE, info.CITY_NAME, KyeeI18nService.get('nearby_hospital.switchHospital','医院正在切换中...'), function () {
                    var storageCache = CacheServiceBus.getStorageCache();
                    storageCache.remove(CACHE_CONSTANTS.STORAGE_CACHE.DEPT_INFO);//清除选择科室的内容
                    $state.go("home->MAIN_TAB");//调到C端主页时页面会自己刷新，根据缓存里面的信息刷新页面
                });
        };

        //选择附近医院后跳回C端主页，并且把C端主页的医院名字切换成所选择的医院
        $scope.selectNearHospital = function (index) {
            var info = $scope.nearbyhospitalinfo[index];
            // 切换医院
            HospitalSelectorService.selectHospital(info.HOSPITAL_ID, info.HOSPITAL_NAME,
                info.MAILING_ADDRESS, info.PROVINCE_CODE, info.PROVINCE_NAME,
                info.CITY_CODE, info.CITY_NAME, KyeeI18nService.get('nearby_hospital.switchHospital','医院正在切换中...'), function () {

                    //转诊标识2转诊  0不转诊
                    AppointmentDeptGroupService.IS_REFERRAL = 0;
                    AppointmentDeptGroupService.ROUTER_STATE = "appointment";
                    $state.go("appointment");
                });
        };
        /* 任务号：KYEEAPPC-3347
         修改人：杜巍巍
         修改原因：附近的医院功能中添加特色科室信息
         */
        //判断推荐医院信息里面是否有特色科室，如果没有把RecDeptNameHasData() 置为false,并在界面上隐藏
        $scope.RecDeptNameHasData = function (index) {
            if (!$scope.recommendhospitalinfo[index].DEPT_NAME) {
                return false;
            }
            return true;
        };
        //判断附近医院信息里面是否有特色科室，如果没有把NearDeptNameHasData 置为false,并在界面上隐藏
        $scope.NearDeptNameHasData = function (index) {
            if (!$scope.nearbyhospitalinfo[index].DEPT_NAME) {
                return false;
            }
            return true;
        };
        //判断附近医院信息里面是否有地址，如果没有把NearMailingAddressData 置为false,并在界面上隐藏
        $scope.NearMailingAddressData = function (index) {
            if (!$scope.nearbyhospitalinfo[index].MAILING_ADDRESS) {
                return false;
            }
            return true;
        };
        /*任务号：KYEEAPPC-3347 附近的医院功能中添加特色科室信息  end*/

        /** 任务号：KYEEAPPC-3962
         *  修改人：高玉楼
         *  修改原因：附件的医院数据缓存5分钟
         *  任务号：KYEEAPPTEST-3909
         *  修改人：杨旭平
         *  修改原因：附近医院多次进入退出后拿不到用户的“当前信息”和“距离信息错误"
         */
        function showNearbyHospitalData(data,flag){

            $scope.nearbyhospitalinfo = data.NEARBY;
            $scope.recommendhospitalinfo = data.RECOMMEND;


            for(var i = 0; i<$scope.nearbyhospitalinfo.length;i++){
                //判断如果是缓存的数据，则不需要处理距离信息（原因：第一次加载的时候已经处理过了） 任务号：KYEEAPPTEST-3909   by-杨旭平
                if(null !=$scope.nearbyhospitalinfo[i] && undefined != $scope.nearbyhospitalinfo[i].DISTANCE && !flag){
                    $scope.nearbyhospitalinfo[i].DISTANCE = $scope.nearbyhospitalinfo[i].DISTANCE/1000;
                    $scope.nearbyhospitalinfo[i].DISTANCE = Math.round($scope.nearbyhospitalinfo[i].DISTANCE*Math.pow(10, 1))/Math.pow(10, 1);
                }
                else if(null ==$scope.nearbyhospitalinfo[i] || undefined == $scope.nearbyhospitalinfo[i].DISTANCE){
                    $scope.nearbyhospitalinfo[i].DISTANCE = 0;
                }
                /* 任务号：KYEEAPPTEST-3704
                 修改人：杨明思
                 修改原因：字数显示过长，未用省略符
                 */
                if($scope.nearbyhospitalinfo[i] && $scope.nearbyhospitalinfo[i].HOSPITAL_NAME && $scope.nearbyhospitalinfo[i].HOSPITAL_NAME.length > 11){
                    $scope.nearbyhospitalinfo[i].HOSPITAL_NAME = $scope.nearbyhospitalinfo[i].HOSPITAL_NAME.substring(0,11)+"..."
                }
                if($scope.nearbyhospitalinfo[i] && $scope.nearbyhospitalinfo[i].DEPT_NAME && $scope.nearbyhospitalinfo[i].DEPT_NAME.length>13){
                    $scope.nearbyhospitalinfo[i].DEPT_NAME_SHOW = angular.copy($scope.nearbyhospitalinfo[i].DEPT_NAME.substring(0,13)+"...")
                }else{
                    $scope.nearbyhospitalinfo[i].DEPT_NAME_SHOW = angular.copy($scope.nearbyhospitalinfo[i].DEPT_NAME)
                }
                /*任务号：KYEEAPPTEST-3704 字数显示过长，未用省略符 end*/
            }
            for(var j = 0; j<$scope.recommendhospitalinfo.length;j++){
                if($scope.recommendhospitalinfo[j] && $scope.recommendhospitalinfo[j].HOSPITAL_NAME && $scope.recommendhospitalinfo[j].HOSPITAL_NAME.length > 11){
                    $scope.recommendhospitalinfo[j].HOSPITAL_NAME = $scope.recommendhospitalinfo[j].HOSPITAL_NAME.substring(0,11)+"..."
                }
                if($scope.recommendhospitalinfo[j] && $scope.recommendhospitalinfo[j].DEPT_NAME && $scope.recommendhospitalinfo[j].DEPT_NAME.length > 13){
                    $scope.recommendhospitalinfo[j].DEPT_NAME_SHOW = angular.copy($scope.recommendhospitalinfo[j].DEPT_NAME.substring(0,13)+"...")
                }else{
                    $scope.recommendhospitalinfo[j].DEPT_NAME_SHOW = angular.copy($scope.recommendhospitalinfo[j].DEPT_NAME)
                }

            }

            var len = $scope.recommendhospitalinfo;
            if (len && len.length > 0) {    //没有数据隐藏推荐医院的所有信息
                $scope.RecommendHasData = true;
                $scope.RecommendText = false;
            }else{
                $scope.RecommendText = true;
            }
            var len = $scope.nearbyhospitalinfo;
            if (len && len.length > 0) {    //没有数据显示提示信息
                $scope.NearbyHasData = true;
                $scope.NearbyText = false;
            } else {
                $scope.NearbyText = true;
            }
        }
        //附件的医院数据缓存五分钟
        if(NearbyHospitalService.lastqueryTimeStamp&&new Date().getTime()-NearbyHospitalService.lastqueryTimeStamp<5*60000){
            showNearbyHospitalData(NearbyHospitalService.nearbyHospitalData,true);
            //多次进入退出再进入后，显示当前位置信息  任务号：KYEEAPPTEST-3909   by-杨旭平
            $scope.address = NearbyHospitalService.address;
        }else{
            //点击附近医院时去查用户的定位信息时，进行数据加载提示。
            KyeeMessageService.loading({mask: false});
            //获取附近医院的信息
            NearbyHospitalService.getNearHospitalInfo(function (data) {
                NearbyHospitalService.nearbyHospitalData = data;
                NearbyHospitalService.lastqueryTimeStamp = new Date().getTime();
                showNearbyHospitalData(data,false);
                $scope.address = NearbyHospitalService.address;
            });
        }
        $scope.refresh = function () {
            //点击附近医院时去查用户的定位信息时，进行数据加载提示。
            KyeeMessageService.loading({mask: false});
            //获取附近医院的信息
            NearbyHospitalService.getNearHospitalInfo(function (data) {
                NearbyHospitalService.nearbyHospitalData = data;
                NearbyHospitalService.lastqueryTimeStamp = new Date().getTime();
                showNearbyHospitalData(data,false);
                $scope.address = NearbyHospitalService.address;
            });
        }

    })
    .build();
