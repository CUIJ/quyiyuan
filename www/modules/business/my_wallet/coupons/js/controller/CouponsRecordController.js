/**
 * 产品名称：quyiyuan.
 * 创建用户：章剑飞
 * 日期：2015年12月28日20:25:07
 * 创建原因：优惠券页面控制器
 * 任务号：
 */
new KyeeModule()
    .group("kyee.quyiyuan.myWallet.couponsRecord.controller")
    .require(["kyee.quyiyuan.myWallet.couponsRecord.service"])
    .type("controller")
    .name("CouponsRecordController")
    .params(["$scope", "$state", "$ionicHistory", "CouponsRecordService", "KyeeMessageService", "KyeeEnv", "AppointmentRegistDetilService", "KyeeListenerRegister","KyeeI18nService","AppointmentDeptGroupService","MyCareDoctorsService","HospitalSelectorService"])
    .action(function ($scope, $state, $ionicHistory, CouponsRecordService, KyeeMessageService, KyeeEnv, AppointmentRegistDetilService, KyeeListenerRegister,KyeeI18nService,AppointmentDeptGroupService,MyCareDoctorsService,HospitalSelectorService) {


        //无数据提示信息
        $scope.emptyText = '';

        //正文最大宽度
        $scope.amountWidth = window.innerWidth - 128 + 'px';
        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "couponsRecord",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            action: function (params) {
            //无数据是否提示
            $scope.isEmpty = false;
                $scope.loadData();
            }
        });
        $scope.loadData=function(){
            //获取优惠券记录
            CouponsRecordService.getCoupons(function (data) {
                $scope.coupons = data;
                if ($scope.coupons.length > 0) {
                    $scope.isEmpty = false;
                } else {
                    $scope.isEmpty = true;
                    $scope.emptyText = KyeeI18nService.get('couponsRecord.noCoupon','暂无优惠券');
                }
            });
        }


        //添加优惠券
        $scope.addCoupon = function () {
            $state.go('coupons');
        };

        //跳转活动详情网站
        $scope.showDetail = function (coupon) {
            if (KyeeEnv.PLATFORM == 'android' || KyeeEnv.PLATFORM == 'ios') {
                window.open(coupon.COUPONS_URL_PHONE, '_blank', 'location=yes');
            } else {
                window.open(coupon.COUPONS_URL_PC, '_blank', 'location=yes');
            }
        };
        //gaomeng 跳转转诊入口
        $scope.showReferral = function (coupon) {
           /* AppointmentDeptGroupService.REFERRAL_REG_ID = coupon.REG_ID;*/
            MyCareDoctorsService.queryHospitalInfo(coupon.SOURCE_ID, function(result){
                // 切换医院
                HospitalSelectorService.selectHospital(coupon.SOURCE_ID, result.HOSPITAL_NAME,
                    result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                    result.CITY_CODE, result.CITY_NAME, "医院正在切换中...", function () {
                      /*  AppointmentDeptGroupService.SELECT_DEPTGROUPDATA=appointDetil;*/
                        //跳到转诊主页
                        AppointmentDeptGroupService.REFERRAL_REG_ID = coupon.ACTIVITY_ID;
                        AppointmentDeptGroupService.HOSPITAL_ID_HISTORY = coupon.SOURCE_ID;
                        $state.go('tiered_medical');
                    });
            });
        };

        //点击返回键
        $scope.back = function () {
            //由预约挂号跳转进入
            if (CouponsRecordService.ROUTE_STATE == "appointment_result") {
                AppointmentRegistDetilService.RECORD.REG_ID = CouponsRecordService.RECORD_REG_ID;
                AppointmentRegistDetilService.RECORD.HOSPITAL_ID = CouponsRecordService.RECORD_HOSPITAL;
                AppointmentRegistDetilService.ROUTE_STATE = 'couponsRecord';
                CouponsRecordService.ROUTE_STATE = "";
                $state.go('appointment_regist_detil');
            } else {
                $ionicHistory.goBack();
            }
        };

        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "couponsRecord",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.back();
            }
        });
    })
    .build();
