/**
 *
 * 修改日期：2015-05-05 14:46
 * 修改人：朱学亮
 * 修改内容：完善部分切换角色的内容
 *
 * 修改时间：2015-05-06 10:46
 * 修改人：朱学亮
 * 修改内容：将切换后的角色信息同步到服务器
 *
 * 说明：切换角色是对于当前就诊者而言的，注册用户如果没有附加就诊者，该用户就是当前就诊者
 *      若切换了就诊者，切换角色便是针对该就诊者。
 *
 * 修改时间：2015-06-26 14:10
 * 修改人：朱学亮
 * 修改内容：放开对医生角色的控制。
 *
 * 修改人：张家豪
 * 任务：KYEEAPPC-4422
 * 修改内容：去掉非必要选择医院拦截
 * 页面逻辑说明：
 * 1. 初始化页面：a. 获取全局变量；b. 判断用户是否登录；c. 获取当前就诊者信息（角色）；d. 选中当前角色
 * 2. 定义方法：切换角色，
 *      a. 首先校验是否选择了医院（未选医院先选医院）
 *      b. 用户信息是否完善，用户信息未完善时，一定没有附加就诊者，当前用户就是默认就诊者，
 *      current_costumer_patient的 IS_DEFAULT = 1
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.controller.role_view")
    .require(["kyee.quyiyuan.center.service",
              "kyee.framework.service.message",
              "kyee.framework.service.view",
              "kyee.quyiyuan.center.service.RoleViewService",
              "kyee.quyiyuan.myquyi.service",
              "kyee.quyiyuan.login.service",
              "kyee.quyiyuan.doctorRole.login.controller",
              "kyee.quyiyuan.doctorRole.login.service",
              "kyee.quyiyuan.doctorRole.center.service"
    ])
    .type("controller")
    .name("RoleViewController")
    .params(["$rootScope",
             "$scope",
             "$state",
             "RoleViewService" ,
             "KyeeMessageService",
             "KyeeViewService",
             "MyquyiService",
             "CacheServiceBus",
             "LoginService",
             "DoctorLoginService",
             "KyeeI18nService",
             "DoctorCenterService"])
    .action(function(
        $rootScope,
        $scope,
        $state,
        RoleViewService,
        KyeeMessageService,
        KyeeViewService,
        MyquyiService,
        CacheServiceBus,
        LoginService,
        DoctorLoginService,
        KyeeI18nService,
        DoctorCenterService){

        // 获取全局变量
        var cache = CacheServiceBus.getMemoryCache();
        // 判断用户是否登录
        if (!cache.get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN)) {
            // 用户未登录
            $state.go("login");
            LoginService.frontPage = "2";
        }
        //从医患互动中跳到切换角色  KYEEAPPTEST-3152 程铄闵
        $scope.rightBtn = false;//默认显示右上方选项按钮
        var skipRoute = DoctorCenterService.skipRoute;
        if(skipRoute == 'doctorCenter'){
            $scope.rightBtn = true;
            DoctorCenterService.skipRoute = undefined;
        }

        // 获取当前就诊者的角色 CURRENT_USER_RECORD
        var cur_patient = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
        var current_role = "4";
        if (cur_patient == null || cur_patient.ROLE_CODE == null) {
            current_role = "4";
        } else if (cur_patient.ROLE_CODE == "3") {
            //current_role = cur_patient.ROLE_CODE;
            current_role = "3";
        } else {
            current_role = "4";
        }

        $scope.currentChoose = "(当前角色)";

        // 获取可选角色
        RoleViewService.queryDevList(function(retVal){
            // 判断当前返回结果是否有效
            if (retVal.success && retVal.data && retVal.data.rows && (retVal.data.rows.length > 0)) {

                // 删除医生角色
                for (var i = 0; i < retVal.data.rows.length; i++) {
                    /*
                    if (retVal.data.rows[i].ROLE_CODE == "3") {
                        retVal.data.rows.splice(i, 1);
                    }
                    */
                    //处理掉门诊患者或住院患者角色
                    if (retVal.data.rows[i].ROLE_CODE == "1") {
                        retVal.data.rows.splice(i, 1);
                    }
                    if (retVal.data.rows[i].ROLE_CODE == "2") {
                        retVal.data.rows.splice(i, 1);
                    }
                }

                // 设置当前的角色
                for (var i = 0; i < retVal.data.rows.length; i++) {

                    if (retVal.data.rows[i].ROLE_CODE == current_role) {
                        $scope.chooseID = i;
                        $scope.changeStyle(i)
                    }
                    if(i==0){
                        retVal.data.rows[i].isFirst= true;
                    }
                }
                $scope.devList = retVal.data.rows;


            } else {
                KyeeMessageService.message({
                    title :  KyeeI18nService.get("role_view.sms","消息"),
                    content :  KyeeI18nService.get("role_view.noRole","当前用户没有可选的角色！"),
                    okText : KyeeI18nService.get("role_view.iKnow","知道了！")
                });
            }
        });

        // 初始化结束，下面定义方法
        // 控制选中的状态
        $scope.messageClick = function(index) {
            // 判断用户是否已经登录
            var cache = CacheServiceBus.getMemoryCache();
            if (!cache.get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN)) {
                // 用户未登录，需要跳转到登录界面
                $state.go("login");
                LoginService.frontPage = "2";
                return;
            }
            // 获取所选角色名
            $scope.chooseID = index;
            var roleCode = $scope.devList[index].ROLE_CODE;
            var roleName = "";
            switch (roleCode) {
                case "1":
                    roleName = KyeeI18nService.get("role_view.doorHosp","门诊患者");
                    break;
                case "2":
                    roleName = KyeeI18nService.get("role_view.homeHosp","住院患者");
                    break;
                case "3":
                    roleName = KyeeI18nService.get("role_view.doctor","医生");
                    break;
                case "4":
                    roleName = KyeeI18nService.get("role_view.normalPeople","普通用户");
                    break;
                default:
                    roleName = KyeeI18nService.get("role_view.unKnowPeople","未知用户");
            }
            if (roleCode == current_role) {
                if (roleCode == "3") {
                    $state.go("doctorHome->MAIN_TAB");
                } else if (roleCode == "4") {
                    $state.go("home->MAIN_TAB");
                }
                return;
            }
            KyeeMessageService.confirm({
                title:  KyeeI18nService.get("role_view.sms","消息"),
                content: KyeeI18nService.get("role_view.smsChange","确认切换至")
                    + roleName +
                    KyeeI18nService.get("role_view.roleChange","角色？"),
                onSelect:function(select) {
                    if (select) {
                        // 当前用户选择医生时
                        if (roleCode == "3") {
                            $scope.restoreToDefaultRole();

                            var result = DoctorLoginService.checkIsBindingDoctor();
                            if (result == 0) {

                                var cur_patient = CacheServiceBus.getMemoryCache().
                                    get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                                cur_patient.ROLE_CODE = 3;
                                CacheServiceBus.getMemoryCache().
                                    set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, cur_patient);

                                $rootScope.ROLE_CODE = 3;

                                $state.go("doctorHome->MAIN_TAB");
                            } else if (result == 1) {
                                KyeeMessageService.message({
                                    content: KyeeI18nService.get("role_view.selectRoleChange","请选择您所在的医院再切换到医生角色！"),
                                    okText: KyeeI18nService.get("role_view.iKnow","知道了！")
                                });
                            } else if (result == 2) {
                                $state.go("doctor_login");
                            }
                            return;
                        }
                        // 修改全局变量，并将此全局变量同步到服务器
                        var cur_patient = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                        // 当前就诊者不为空时
                        if (cur_patient != null) {
                            var data = {ROLE_CODE: roleCode, USER_ID: cur_patient.USER_ID};
                            // 用户角色同步到服务器，调用updateUserRole方法，传入两个参数1、回调方法，2、data
                            RoleViewService.updateUserRole(function(retVal) {
                                if (retVal.success) {
                                    // 同步服务器成功，同步本地全局变量
                                    cur_patient.ROLE_CODE = roleCode;
                                    cache.set(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT, cur_patient);
                                    $rootScope.ROLE_CODE = roleCode;
                                    // 1 --- 门诊患者；2 --- 住院患者；3 --- 医生；4 --- 普通用户
                                    if(roleCode == "1") {
                                        // 门诊患者
                                        $state.go("myquyi->MAIN_TAB.medicalGuide");
                                    } else if(roleCode == "2") {
                                        // 住院患者
                                        // 跳转我的趣医-住院业务界面
                                        $state.go("myquyi->MAIN_TAB.inpatientBusiness");
                                    } else if(roleCode == "3") {
                                        // 用户选择医生
                                    } else if(roleCode == "4") {
                                        // 普通用户 跳到主界面根据后台数据生成主页面
                                        $state.go("home->MAIN_TAB");
                                    }
                                } else {
                                    // 同步服务器失败，恢复初始的角色选择
                                    $scope.restoreToDefaultRole();
                                }
                            }, data);
                        } else {
                            KyeeMessageService.message({
                                title:  KyeeI18nService.get("role_view.sms","消息"),
                                content: KyeeI18nService.get("role_view.changeRoleFalse","切换角色失败！"),
                                okText : KyeeI18nService.get("role_view.iKnow","知道了！"),
                                onOk: function () {
                                    $scope.restoreToDefaultRole();
                                }
                            });
                        }
                    } else {
                        // 用户选择了取消切换，恢复初始的角色选择
                        $scope.restoreToDefaultRole();
                    }
                }
            });
        };

        //根据选择判断ridio显示样式
        $scope.changeStyle = function(index) {
            return $scope.chooseID == index;
        };

        $scope.openModal = function(url) {
            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: url
            });
        };

        // 恢复初始的角色选择
        $scope.restoreToDefaultRole = function() {
            for (var i = 0; i < $scope.devList.length; i++) {
                if ($scope.devList[i].ROLE_CODE == current_role) {
                    $scope.chooseID = i;
                    $scope.changeStyle(i);
                }
            }
        };
    })
    .build();