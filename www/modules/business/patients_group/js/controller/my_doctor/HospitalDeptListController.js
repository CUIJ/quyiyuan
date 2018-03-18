/**
 * 产品名称：趣医院
 * 创建者：张毅
 * 创建时间： 2016/12/11
 * 创建原因：病友圈三期之精准医患管理系统
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.patients_group.hospital_dept_list.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.patients_group.dept_doctor_list.controller",
        "kyee.quyiyuan.patients_group.hospital_dept_list.service",
        "kyee.quyiyuan.patients_group.dept_doctor_list.service"
    ])
    .type("controller")
    .name("HospitalDeptListController")
    .params(["$scope", "$state", "$ionicHistory",
        "CacheServiceBus",
        "KyeeListenerRegister",
        "HospitalDeptListService",
        "DeptDoctorListService"])
    .action(function ($scope, $state, $ionicHistory,
                      CacheServiceBus,
                      KyeeListenerRegister,
                      HospitalDeptListService,
                      DeptDoctorListService) {

        $scope.dksIndex = 0; //初始化默认张开第一个大科室

        $scope.xksIndex = -1; //初始化默认小科室为未被长按选中的状态

        $scope.isEmptyFlag = "0"; //初始化页面显示为空:0; 为查询到数据:1; 成功返回数据:2

        var storageCache= CacheServiceBus.getStorageCache(); //缓存数据

        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "hospital_dept_list",
            direction: "both",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function (params) {
                $scope.hospitalName=HospitalDeptListService.hospitalInfo.hospitalName;//医院名称

                //获取分级科室数据(此处只有分级科室，不存在不分级科室的情况)
                HospitalDeptListService.queryDeptInfo(function (resultData) {
                    if(!resultData || resultData.length == 0){
                        $scope.isEmptyFlag = "1";
                    }else {
                        $scope.isEmptyFlag = "2";
                        $scope.groupDepts = resultData;
                        $scope.detailDepts =  resultData[$scope.dksIndex].children;
                    }
                })
            }
        });

        //统一物理返回键和APP返回键
        KyeeListenerRegister.regist({
            focus: "appointment_regist_list",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.back();
            }
        });

        //返回按钮点击事件
        $scope.back = function () {
            $ionicHistory.goBack(-1);
        };

        //点击大科室时，更新相应的小科室数据
        $scope.showDept=function(dksIndex){
            $scope.xksIndex = -1;
            $scope.dksIndex = dksIndex;
            $scope.detailDepts = $scope.groupDepts[dksIndex].children;
        };

        //点击小科室时，跳转到医生界面
        $scope.selectSecondDept=function(dept){
            DeptDoctorListService.deptInfo = dept;
            $state.go("dept_doctor_list");
        };

        //长按小科室时更新其字体颜色
        $scope.changeColor = function () {
            $scope.xksIndex = this.$index;
        }

        //拖拽事件清除由长按事件导致的小科室颜色
        $scope.clearColor = function () {
            $scope.xksIndex = -1;
        }

        //长按事件结束后，进行页面跳转
        $scope.goToDoctorList = function (dept) {
            if($scope.xksIndex != -1){
                $scope.selectSecondDept(dept);
            }
        }
    })
    .build();
