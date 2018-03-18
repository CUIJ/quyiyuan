/**
 * 产品名称：quyiyuan
 * 创建者：刘健
 * 创建时间： 2015/5/14
 * 创建原因：南京12320平台账号绑定页面控制器
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appoint.binding12320.controller")
    .require(["kyee.framework.service.view", "kyee.quyiyuan.appoint.binding12320.service", "kyee.framework.service.message"])
    .type("controller")
    .name("Binding12320Controller")
    .params(["$scope", "$state", "KyeeViewService", "CacheServiceBus", "Binding12320Service", "KyeeMessageService","KyeeI18nService"])
    .action(function ($scope, $state, KyeeViewService, CacheServiceBus, Binding12320Service, KyeeMessageService,KyeeI18nService) {
        //获取缓存中医院信息
        var hospitalinfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
        //获取缓存中当前就诊者信息
        var currentPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
        //获取缓存中当前就诊卡信息
        var currentCardinf = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO);
        //获取缓存中当前登录用户信息
        var currentuser = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
        //绑定页面姓名
        $scope.NAME = currentCardinf.PATIENT_NAME;
        //绑定页面身份证号
        $scope.ID_NO = currentPatient.ID_NO;
        //页面手机号输入框底部
        $scope.placeholderPhone= KyeeI18nService.get("binding12323.placeholderPhone","请输入手机号");
        $scope.placeholderUser=KyeeI18nService.get("binding12323.placeholderUser","12320平台用户名");
        $scope.placeholderPwd=KyeeI18nService.get("binding12323.placeholderPwd","12320平台密码");
        //绑定页面手机号 如果合作平台手机号为空，则填写常用就诊者手机号为合作平台手机号
        var phoneNumber = null;
        if (!currentuser.CO_PHONE) {
            phoneNumber = currentPatient.PHONE;
        } else {
            phoneNumber = currentuser.CO_PHONE;
        }
        //绑定页面南京12320用户名
        $scope.USER = {
            PHONE_NUMBER: phoneNumber,
            USER_CODE: currentuser.CO_USERCODE,
            USER_PWD: ""
        };
        //手机格式校验
        var isMobil = function (s) {
            var patrn = /^(\+86)?1[3|5|4|7|8|9|6]\d{9}$/;
            if (!patrn.test(s)) {
                return false;
            }
            return true
        };
        //点击绑定时绑定12320用户
        $scope.bindingUser = function () {
            //验证手机号
            var phoneNum = $scope.USER.PHONE_NUMBER;
            $scope.USER.PHONE_NUMBER = $scope.USER.PHONE_NUMBER.trim();
            if ($scope.USER.PHONE_NUMBER.length == 14) {
                phoneNum = $scope.USER.PHONE_NUMBER.substring(3);
            }
            if (phoneNum == "" || phoneNum == null) {
                KyeeMessageService.message({
                    title: KyeeI18nService.get("binding12323.message","消息"),
                    content: KyeeI18nService.get("binding12323.notEmptyPhone","手机号不能为空")
                });
                return;
            }
            if (!isMobil(phoneNum)) {
                KyeeMessageService.message({
                    title: KyeeI18nService.get("binding12323.message","消息"),
                    content:  KyeeI18nService.get("binding12323.errorPhone","手机号格式错误")
                });
                return;
            } else if ((phoneNum.length != 11) && (phoneNum.length != 14)) {
                KyeeMessageService.message({
                    title: KyeeI18nService.get("binding12323.message","消息"),
                    content:  KyeeI18nService.get("binding12323.longPhone","手机号长度错误")
                });
                return;
            }
            //检测用户名
            var reg = /^[\w\@\.]+$/;//用户户名格式
            if ($scope.USER.USER_CODE == "" || $scope.USER.USER_CODE == null) {
                KyeeMessageService.message({
                    title: KyeeI18nService.get("binding12323.message","消息"),
                    content:KyeeI18nService.get("binding12323.notEmptyUser","用户名不能为空")
                });
                return;
            } else if ($scope.USER.USER_CODE.length < 5 || $scope.USER.USER_CODE.length > 18) {
                KyeeMessageService.message({
                    title:KyeeI18nService.get("binding12323.message","消息"),
                    content: KyeeI18nService.get("binding12323.longUser","用户名长度只能在5位和18位之间")
                });
                return;
            } else if (!reg.test($scope.USER.USER_CODE)) {
                KyeeMessageService.message({
                    title:KyeeI18nService.get("binding12323.message","消息"),
                    content: KyeeI18nService.get("binding12323.UserNameRule",'用户名必须为字母数字或"@"、"."')
                });
                return;
            }
            //检测密码
            if ($scope.USER.USER_PWD == "" || $scope.USER.USER_PWD == null) {
                KyeeMessageService.message({
                    title: KyeeI18nService.get("binding12323.message","消息"),
                    content: KyeeI18nService.get("binding12323.notEmptyPwd","密码不能为空！")
                });
                return;
            } else if ($scope.USER.USER_PWD.length < 6) {
                KyeeMessageService.message({
                    title: KyeeI18nService.get("binding12323.message","消息"),
                    content: KyeeI18nService.get("binding12323.longPwd","密码至少为6位！")
                });
                return;
            }
            var params = {
                hospitalId: hospitalinfo.id,
                phoneNum: $scope.USER.PHONE_NUMBER,
                userCode: $scope.USER.USER_CODE,
                userId: currentPatient.USER_ID,
                pswd: $scope.USER.USER_PWD
            };
            //绑定
            Binding12320Service.bandingUser(params, function (bindingResult) {
                if (bindingResult.success) {
                    //将绑定成功的用户名，密码存入缓存中
                    var currentuser = CacheServiceBus.getMemoryCache();
                    currentuser.apply("currentUserRecord", "CO_PHONE", $scope.USER.PHONE_NUMBER);
                    currentuser.apply("currentUserRecord", "CO_USERCODE", $scope.USER.USER_CODE);
                    currentuser.apply("currentUserRecord", "CO_PASSWORD", $scope.USER.USER_PWD);
                    $state.go("appointment_doctor");
                    KyeeMessageService.broadcast({
                        content:  KyeeI18nService.get("binding12323.bindEuccess","绑定成功！"),
                        duration: 5000
                    });
                } else if (bindingResult.resultCode == "0410007") {
                    KyeeMessageService.broadcast({
                        content: KyeeI18nService.get("binding12323.bindError",bindingResult.message)
                    });
                } else {
                    KyeeMessageService.broadcast({
                        content:  KyeeI18nService.get("binding12323.bindError","账号或密码不正确，请输入正确的账号密码！"),
                        duration: 5000
                    });
                }
            });
        }
    })
    .build();
