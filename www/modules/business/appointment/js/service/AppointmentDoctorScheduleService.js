/**
 * 产品名称：quyiyuan.
 * 创建用户：章剑飞
 * 日期：2015年5月22日17:26:56
 * 创建原因：C端医生排班页面服务
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.doctorSchedule.service")
    .require([])
    .type("service")
    .name("AppointmentDoctorScheduleService")
    .params(["HttpServiceBus","KyeeMessageService","CacheServiceBus"])
    .action(function(HttpServiceBus,KyeeMessageService,CacheServiceBus){
        var def = {

            reservationOrRegistration:undefined,   // 在确认号源的时候区分预约、挂号  By  张家豪  KYEEAPPC-3017
            assignmentOfRegistered:undefined,      // 挂号的赋值  By  张家豪  KYEEAPPC-3017
            onTimeToSeeDoctor:1             //区分是否开启号源选择  By   张家豪  KYEEAPPC-3017

        };
        return def;
    })
    .build();
