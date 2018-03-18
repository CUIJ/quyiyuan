/**
 * 产品名称：quyiyuan
 * 创建者：高玉楼
 * 创建时间：2015年8月31日14:46:12
 * 创建原因：预约挂号注册控制层
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.register.password.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.appointment.register.password.service"
    ])
    .type("controller")
    .name("AppointmentRegisterPasswordController")
    .params(["$scope", "$state", "$ionicHistory", "CacheServiceBus", "KyeeMessageService","AppointmentRegisterService",
        "AppointmentRegisterPasswordService","RsaUtilService","AppointmentDoctorDetailService","KyeeI18nService"])
    .action(function ($scope, $state, $ionicHistory,CacheServiceBus, KyeeMessageService,AppointmentRegisterService,
                      AppointmentRegisterPasswordService,RsaUtilService,AppointmentDoctorDetailService,KyeeI18nService) {
        var registerInfo = AppointmentRegisterService.registerInfo;

        //初始化用户注册信息
        $scope.appointmentRegister = {
            //密码
            password : "",
            //确认密码
            rePassword:""
        };
        $scope.placeholderNum= KyeeI18nService.get("appointmentRegisterPassword.placeholderNum","请输入6到16位数字或字母");
        var cache = CacheServiceBus.getMemoryCache();
        var userSource = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);
        /**
         *  注册操作
         */
        $scope.register = function(){
            if(AppointmentRegisterPasswordService.validateTwoPassword($scope.appointmentRegister.password,$scope.appointmentRegister.rePassword))
            {
                AppointmentRegisterPasswordService.register({
                    USER_CODE:registerInfo.phoneNum,
                    PASSWORD:RsaUtilService.getRsaResult($scope.appointmentRegister.password),
                    PHONE_NUMBER:registerInfo.phoneNum,
                    //USER_SOURCE:0,
                    USER_SOURCE:userSource,
                    SECURITY_CODE:registerInfo.validateCode,
                    NAME:registerInfo.userName,
                    ID_NO:registerInfo.idCardNum,
                    REMARK:registerInfo.remark,
                    MEDICAL_GUIDE:registerInfo.guideNum,
                    isChildReg: registerInfo.isChildReg?registerInfo.isChildReg:'',
                    BIRTH_DATE : registerInfo.BIRTH_DATE?registerInfo.BIRTH_DATE:'',
                    sex : registerInfo.sex?registerInfo.sex:''

                },$scope.appointmentRegister.password,function(){
                    var bussinessType = AppointmentDoctorDetailService.selSchedule.BUSSINESS_TYPE ;
                    //预约
                    if(bussinessType==='0')
                    {
                        $state.go('appoint_confirm');
                    }
                    else
                    {
                        $state.go('regist_confirm');
                    }

                });
            }
        }

    })
    .build();
