/**
 * 通过选择医院选择医生
 * 显示已开通医院和未开通医院
 * Created by liwenjuan on 2016/11/28.
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.my_doctor.select_hospital_list.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.framework.service.message",
        "kyee.framework.device.message",
        "kyee.quyiyuan.patients_group.my_doctor.select_hospital_list.service",
        "kyee.quyiyuan.patients_group.hospital_dept_list.controller",
        "kyee.quyiyuan.patients_group.hospital_dept_list.service"
    ])
    .type("controller")
    .name("SelectHospitalListController")
    .params([
        "$scope",
        "$state",
        "$rootScope",
        "$ionicHistory",
        "CacheServiceBus",
        "KyeeI18nService",
        "MultipleQueryCityService",
        "KyeeListenerRegister",
        "SelectHospitalListService",
        "HospitalDeptListService"
    ])
    .action(function($scope,$state,$rootScope,$ionicHistory,CacheServiceBus,KyeeI18nService,MultipleQueryCityService,
                     KyeeListenerRegister,SelectHospitalListService,HospitalDeptListService){

        //存储当前所选省份的索引
        $scope.provinceIdx = 0;
        //取城市名宽度
        $scope.cityWidth = window.innerWidth - 184 + 'px';
        $scope.isAreaHospital = false;
        var storageCache = CacheServiceBus.getStorageCache();
        var cache = CacheServiceBus.getMemoryCache();
        $scope.userSource = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);
        var selected = storageCache.get(CACHE_CONSTANTS.STORAGE_CACHE.LAST_PROVINCE_CITY_INFO);
        //是否可选医院
        $scope.canSelectHospital = ($rootScope.ROLE_CODE != "5");
        //无开通医院时，界面提示语
        $scope.closedHospitalsTipsText = KyeeI18nService.get("msg_selectHospital.noOpenHospitalTipsText",
            "该城市暂无开通医院，小趣会努力开通更多医院方便您的使用!");

        /**
         * 进入页面之前初始化页面数据
         */
        KyeeListenerRegister.regist({
            focus: "select_hospital_list",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function () {
                if (selected) {
                    //已经选过省市
                    loadHospitals(selected);
                } else {
                    //用户未选择省市
                    MultipleQueryCityService.cityNotSelect = true;
                    $state.go('multiple_city_list');
                }
            }
        });

        /**
         * 初始化选中城市
         * add by lwj
         * modify by wyn 20161228 增加判断选择所有医院时，cityCode置空
         * @param city
         */
        var loadHospitals = function(city){
            if(city.PROVINCE_ID == 0){
                city.PROVINCE_CODE = city.CITY_CODE;
                city.PROVINCE_NAME = $scope.provinceName;
            }
            $scope.provinceName = city.PROVINCE_NAME;

            //修改首页左上角城市名字 ---选择了该省下所有市
            if (city.CITY_CODE == city.PROVINCE_CODE) {
                $rootScope.localCityName = city.PROVINCE_NAME;
            } else {
                $rootScope.localCityName = city.CITY_NAME;
            }
            //选择城市下所有市改为所有医院 KYEEAPPC-
            var cityCode = "";//城市code，和后端约定当选择“所有医院”时，cityCode置为空；
            if(city.CITY_NAME == "所有医院"){
                $scope.cityName = city.PROVINCE_NAME;
            }else if(city.CITY_NAME!= "" && city.CITY_NAME.length >0){
                $scope.cityName = city.CITY_NAME;
                cityCode = city.CITY_CODE;
            }
            initView(city.PROVINCE_CODE,cityCode);
        };

        /**
         * 初始化数据
         * add by wyn 20161205
         * @params isRecommend: 0有开通医院，1无开通医院
         */
        var initView = function(provinceCode,cityCode){
            SelectHospitalListService.requestHospital(provinceCode,cityCode,function(data){
                $scope.openedHospitals = data.openChatHospitalList;//开通医院
                $scope.closedHospitals = data.closeChatHospitalList; // 未开通医院
                $scope.recommendHospitals = data.recommendHospitalList;// 推荐医院
                $scope.isRecommend = (1 == data.isRecommend);//该城市无开通医患聊天医院,即显示推荐医院
            });
        };

        /**
         * 返回处理
         * addBy liwenjuan 2016/11/28
         */
        $scope.goBack = function(){
            $ionicHistory.goBack();
        };

        /**
         * 进入选择城市页面选择城市
         * addBy liwenjuan 2016/11/28
         */
        $scope.goToProvince = function(){
            if(!$scope.canSelectHospital){
                return;
            }
            var cache = CacheServiceBus.getMemoryCache();
            var userSource=cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);
            var publicServiceType = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_PUBLIC_SERVER_TYPE);
            //注：洛阳、驻马店卫计委个性化---要求禁止切换省市
            if(userSource == "12" || publicServiceType == "020073"||userSource=="4001"){
                return;
            }
            //进入选择城市页面前，记录当前进入的路径，用于选择完后返回切换城市下的医院列表 By 杜巍巍  KYEEAPPC-4117
            MultipleQueryCityService.goState = "select_hospital_list";
            $state.go('multiple_city_list');
        };

        /**
         * 选择医院进入该医院对应科室页面
         * addBy liwenjuan 2016/11/28
         * modified by zhangyi at 20161215 :添加页面跳转处理
         * @param hospital
         */
        $scope.getDeptListByHospital = function(hospital){
            HospitalDeptListService.hospitalInfo = hospital;
            $state.go('hospital_dept_list');
        };
    })
    .build();