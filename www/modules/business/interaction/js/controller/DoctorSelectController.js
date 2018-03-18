/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月5日11:06:54
 * 创建原因：医患互动选择医生页面控制器
 * 修改者：张婧
 * 修改时间：2016年7月28日16:47:24
 * 修改原因：添加单击钮统计
 * 任务号：KYEEAPPC-6641
 */
new KyeeModule()
    .group("kyee.quyiyuan.interaction.doctorSelect.controller")
    .require([
        "kyee.quyiyuan.interaction.doctorSelect.service"
        ,"kyee.quyiyuan.interaction.doctorMessageBoard.service"
        ,"kyee.quyiyuan.interaction.doctorMessageBoard.controller"])
    .type("controller")
    .name("DoctorSelectController")
    .params(["$scope", "$state", "DoctorSelectService",
        "DoctorMessageBoardService", "CacheServiceBus", "KyeeListenerRegister", "OperationMonitor"])
    .action(function($scope, $state, DoctorSelectService,
                     DoctorMessageBoardService, CacheServiceBus, KyeeListenerRegister, OperationMonitor){

        /**
         * 注册页面回退事件
         */
        KyeeListenerRegister.regist({
            focus : "interaction",
            when : KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_ENTER,
            direction : "back",
            action : function(params){

                var unReadWord = DoctorMessageBoardService.unReadWord;

                if(!$scope.showEmpty && unReadWord.readFlag){
                    angular.forEach($scope.items, function (item, index, items) {
                        if(unReadWord.index == index){
                            $scope.items[index].READ_NUM = 0;
                        }
                    });
                }
            }
        });

        /**
         * 初始化查询可咨询医生列表
         */
        DoctorSelectService.queryDoctorList(function (data) {
            $scope.items = data;
            //显示医生图片和默认图片样式的显示，by 杜巍巍 KYEEAPPC-5367
            for(var i = 0; i< $scope.items.length; i++){
                $scope.items[i].SEX = parseInt($scope.items[i].SEX);
                if(locationUrl($scope.items[i].DOCTOR_PIC_PATH)){
                    $scope.items[i].DOCTOR_PIC_PATH = "";
                }
                if($scope.items[i] && $scope.items[i].SEX == 1 && !$scope.items[i].DOCTOR_PIC_PATH){
                    $scope.items[i].pathShow = true;//头像显示样式控制
                    $scope.items[i].DOCTOR_PIC_PATH = "resource/images/base/head_default_female.jpg";
                }else if($scope.items[i] && $scope.items[i].SEX == 0 && !$scope.items[i].DOCTOR_PIC_PATH){
                    $scope.items[i].pathShow = true;
                    $scope.items[i].DOCTOR_PIC_PATH = "resource/images/base/head_default_man.jpg";
                }else if($scope.items[i] && !$scope.items[i].SEX && !$scope.items[i].DOCTOR_PIC_PATH){
                    $scope.items[i].pathShow = true;
                    $scope.items[i].DOCTOR_PIC_PATH = "resource/images/base/head_default_man.jpg";
                }
            }
            // 判空显示
            if(!$scope.items || $scope.items.length == 0){
                $scope.showEmpty = true;
            }
        });

        /**
         * 杜巍巍
         * KYEEAPPC-5367
         * 头像显示样式控制
         * @returns {boolean}
         */
        var locationUrl = function (path) {
            if ((path && path.split('/') && path.split('/').pop() && path.split('/').pop() == "doctor_common_2_0_0.png") ||
                path == "/resource/images/base/head_default_man.jpg") {
                return true;
            } else {
                return false;
            }
        };

        /**
         * 点击单个医生事件
         */
        $scope.itemClick = function (index, item) {
            OperationMonitor.record("itemClick","interaction");//添加按钮统计
            //初始化未读消息对象
            var unReadWord = {};
            unReadWord.index = index;
            DoctorMessageBoardService.unReadWord = unReadWord;

            item.HOSPITAL_NAME = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).name;
            item.HOSPITAL_ID = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            item.USER_VS_ID = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
            item.OFTEN_NAME = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).OFTEN_NAME;
            DoctorMessageBoardService.paramData = item;
            $state.go("doctorMessageBoard");
        };

        /**
         * 获取当前医院名称函数
         * @returns {*}
         */
        $scope.getHospitalName = function () {
            return CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).name;
        }
    })
    .build();

