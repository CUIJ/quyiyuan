/**
 * 产品名称：quyiyuan
 * 创建者：wangwan
 * 创建时间：2016年3月9日19:54:26
 * 创建原因：预约挂号条款页面
 * 修改者：
 * 修改原因：KYEEAPPC-5358   预约挂号页面改版  wangwan 2016年3月9日19:47:51
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.notice.controller")
    .require([
        "kyee.quyiyuan.appointment.doctor_detail.service"
    ])
    .type("controller")
    .name("AppointmentNoticeController")
    .params(["$scope", "$state","KyeeListenerRegister","AppointmentDoctorDetailService","AppointmentDeptGroupService","KyeeI18nService"])
    .action(function ($scope, $state,KyeeListenerRegister,AppointmentDoctorDetailService,AppointmentDeptGroupService,KyeeI18nService) {


        //页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "appointment_notice",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.AFTER_ENTER,
            direction : "both",
            action: function (params) {
                var selDoctor = AppointmentDoctorDetailService.APPOINTMENT_NOTICE;
                $scope.onlyOne = true;
                showIsNotNotification(selDoctor);
                //edit by wangwan 任务号：KYEEAPPC-3903  预约挂号条款都显示，不显示网络医院的挂号条款
                if (selDoctor.APPOINT_NOTIFICATION ||selDoctor.REGISTER_NOTIFICATION||selDoctor.NETWORK_REGIST_NOTIFICATION) {
                    //预约条款不为空显示
                    if(selDoctor.APPOINT_NOTIFICATION){
                        $scope.appointRule= KyeeI18nService.get("doctor_info.appointRule","预约条款");
                        $scope.APPOINT_NOTIFICATION_SHOW=selDoctor.APPOINT_NOTIFICATION;
                        $scope.appointNotificationShow=true;

                    }
                    //如果是网络科室，展示网络医院挂号条款
                    if(AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_ONLINE=='1'){
                        if(selDoctor.NETWORK_REGIST_NOTIFICATION ){
                            $scope.registRule=KyeeI18nService.get("doctor_info.registRule","挂号条款");
                            $scope.REGIST_NOTIFICATION_SHOW=selDoctor.NETWORK_REGIST_NOTIFICATION;
                            $scope.registNotificationShow=true;//展示网络科室挂号条款
                            $scope.appointNotificationShow=false;//不展示预约条款
                        }
                    }else{
                        //如果是非网络科室展示非网络挂号条款
                        //挂号条款不为空显示
                        if(selDoctor.REGISTER_NOTIFICATION){
                            $scope.registRule=KyeeI18nService.get("doctor_info.registRule","挂号条款");
                            $scope.REGIST_NOTIFICATION_SHOW=selDoctor.REGISTER_NOTIFICATION;
                            $scope.registNotificationShow=true;

                        }
                    }
                    if($scope.REGIST_NOTIFICATION_SHOW == $scope.APPOINT_NOTIFICATION_SHOW){
                        $scope.onlyOne = false;
                        $scope.REGIST_NOTIFICATION_SHOW = '';
                    }
                }

            }
        });
        //判断是命名‘预约条款’还是‘挂号条款’
        function showIsNotNotification(selDoctor){
            //默认不显示
            $scope.appointRulerShow=false;
            //start by wangwan  任务号：KYEEAPPC-3903 网络医院和常规医院的预约挂号条款修改
            //如果网络科室，命名为挂号条款
            if(AppointmentDeptGroupService.SELECT_DEPTGROUPDATA.IS_ONLINE=='1'){
                if(selDoctor.NETWORK_REGIST_NOTIFICATION){
                    $scope.appointRulerShow=true;
                }
            }else{
                //如果非网络科室
                if(selDoctor.APPOINT_NOTIFICATION&&selDoctor.REGISTER_NOTIFICATION){
                    //预约挂号条款都不为空，则命名预约条款
                    $scope.appointRulerShow=true;
                }else if(selDoctor.APPOINT_NOTIFICATION){
                    //如果只有预约条款不为空，则命名为‘预约条款’
                    $scope.appointRulerShow=true;
                }else if(selDoctor.REGISTER_NOTIFICATION){
                    //如果只有挂号条款不为空，则显示挂号条款
                    $scope.appointRulerShow=true;
                }
            }

        };

    })
    .build();

