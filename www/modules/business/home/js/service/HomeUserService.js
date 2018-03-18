/**
 * 产品名称 KYMH
 * 创建用户: 朱学亮
 * 日期: 2015/5/18
 * 时间: 10:45
 * 创建原因：C端主页，用户部分
 * 修改用户: 程铄闵
 * 日期: 2015年7月16日
 * 修改原因：虚拟卡不显示卡号
 * 任务号：KYEEAPPTEST-2729
 *
 * 服务实现的逻辑：
 * 1. 获取头像：确定当前用户是否有头像可用，若有，返回该头像的url，若无，返回默认头像url
 * 2. 姓名栏显示的内容：
 *      a. 未登录时，实现登陆，注册
 *      b. 登陆后，用户信息是否完善，完善：显示当前用户姓名；未完善：显示请去完善个人信息
 *
 * 3. 医院选择栏显示
 *
 * 4. 就诊卡栏显示，1.选择了医院；2.该医院是否需要显示就诊卡；3.完善的就诊者信息
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.home.user.service")
    .require(["kyee.quyiyuan.login.md5util.service",
              "kyee.quyiyuan.center.service.QueryHisCardService",
              "kyee.quyiyuan.center.comm_patient_detail.service"])
    .type("service")
    .name("HomeUserService")
    .params(["KyeeMessagerService",
             "HttpServiceBus",
             "RsaUtilService",
             "KyeeMessageService",
             "CacheServiceBus",
             "KyeeViewService",
             "QueryHisCardService",
             "CommPatientDetailService",
             "CustomPatientService",
             "KyeeI18nService",
             "$state"])
    .action(function(KyeeMessagerService,
                     HttpServiceBus,
                     RsaUtilService,
                     KyeeMessageService,
                     CacheServiceBus,
                     KyeeViewService,
                     QueryHisCardService,
                     CommPatientDetailService,
                     CustomPatientService,
                     KyeeI18nService,
                     $state){

        var def = {

            // 用户默认头像url
            headImageSrc : "url(resource/images/home/unloginface.png)",
            currentState : null,

            onQueryCardSuccess : null,
            onPatientNameSuccess : null,

            //初始化从查卡页面返回对象
            queryCardObj:{
                cardNo:null,//卡号
                flag:false,//true-从查卡页返回
                isVCard:false//true-是虚拟卡
            },

            setOnQueryCardSuccessFn : function(fn){
                this.onQueryCardSuccess = fn;
            },


            //回调设置就诊者姓名
            setOnPatientNameSuccessFn : function(fn){
                //console.log('setPatientNameSuccessFn');
                this.onPatientNameSuccess = fn;
            },

            //调用设置首页就诊者姓名
            setPatientName : function(){
                var patientInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                if(patientInfo != null){
                    var str = patientInfo.OFTEN_NAME + KyeeI18nService.get('home->MAIN_TAB.welcomeYou','，欢迎您！',null);
                    this.onPatientNameSuccess(str);
                }
                else{
                    this.onPatientNameSuccess('');
                }
            },

            // 获取用户当前状态，可用状态UNLOGIN/USER_INFO_MISSING/SHOW_ALL
            getCurrentState: function() {
                var cache = CacheServiceBus.getMemoryCache();
                if (!cache.get(CACHE_CONSTANTS.MEMORY_CACHE.IS_LOGIN)) {
                    def.currentState = "UNLOGIN";
                    return def.currentState;
                } else {
                    // 判断用户信息是否完善
                    var user_record = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD);
                    if (!user_record || user_record.ID_NO == null || user_record.ID_NO == "" ||
                        user_record.NAME == null || user_record.NAME == "") {
                        def.currentState = "USER_INFO_MISSING";
                        return def.currentState;
                    } else {
                        // 获取用户头像url，更新headImageSrc
                        def.currentState = "SHOW_ALL";
                        return def.currentState;
                    }
                }
            },

            // 获取当前医院名称，为选择医院则返回""
            getCurrentHospitalName: function() {
                var storageCache = KyeeAppHelper.getSimpleService("kyee.quyiyuan.service_bus.cache", "CacheServiceBus").getStorageCache();
                var hospitalInfo = storageCache.get("hospitalInfo");
                if (!hospitalInfo || !hospitalInfo.id || hospitalInfo.id == 0) {
                    return "";
                } else {
                    return hospitalInfo.name;
                }
            },

            // 判断就诊卡是否显示，若显示并且当前用户有就诊卡则显示卡号，若没有就诊卡则返回""
            isCardShown: function() {
                var storageCache = KyeeAppHelper.getSimpleService("kyee.quyiyuan.service_bus.cache", "CacheServiceBus").getStorageCache();
                var hospitalInfo = storageCache.get("hospitalInfo");
                var me = this;
                if (!hospitalInfo || !hospitalInfo.id || hospitalInfo.id == 0) {
                    //onSuccess(false);
                    this.onQueryCardSuccess(false);
                } else {
                    HttpServiceBus.connect({
                        showLoading : false,
                        url: 'hospitalInform/action/HospitalinforActionC.jspx',
                        params: {
                            op: 'queryHospitalParam',
                            hospitalId: hospitalInfo.id,
                            paramName: 'showCard,CARDNO_TO_APPOINT,IF_SHOW'// showCard-0显示就诊卡；CARDNO_TO_APPOINT-1就诊卡可编辑
                        },
                        onSuccess: function (retVal) {
                            if(retVal.success) {
                                var readonlyFlag = false;//就诊卡是否可编辑（0-不可编辑；1-可编辑）
                                var ifShow = retVal.data.IF_SHOW;//虚拟卡是否显示（true-显示；false-不显示）
                                if (retVal.data.showCard == '0') {
                                    // 显示就诊卡栏
                                    if (def.currentState == "SHOW_ALL") {
                                        var cache = CacheServiceBus.getMemoryCache();
                                        var cur_patient = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                                        readonlyFlag = def.getReadonly(retVal.data.CARDNO_TO_APPOINT );
                                        //从查卡页面跳转来
                                        if(def.queryCardObj.flag){
                                            var queryCardNo = '';
                                            def.queryCardObj.flag = false;
                                            queryCardNo = def.queryCardObj.cardNo;
/*                                            //显示虚拟卡
                                            if(ifShow==true || ifShow=='true'){
                                                queryCardNo = def.queryCardObj.cardNo;
                                            }
                                            else{
                                                //是虚拟卡
                                                if(def.queryCardObj.isVCard){
                                                    queryCardNo = '';
                                                }
                                                else{
                                                    queryCardNo = def.queryCardObj.cardNo;
                                                }
                                            }*/
                                            me.onQueryCardSuccess(queryCardNo,readonlyFlag);
                                        }
                                        //从非查卡页面跳转来
                                        else{
                                            //有就诊卡
                                            if (cur_patient && cur_patient.CARD_SHOW) {
                                                me.onQueryCardSuccess(cur_patient.CARD_SHOW,readonlyFlag);
                                            } else {
                                                me.onQueryCardSuccess("",readonlyFlag);
                                            }
                                        }
                                    } else {
                                        me.onQueryCardSuccess(false,readonlyFlag);
                                    }
                                } else {
                                    me.onQueryCardSuccess(false,readonlyFlag);
                                }
                            } else {
                                me.onQueryCardSuccess(false);
                            }
                        },
                        onError: function () {
                            me.onQueryCardSuccess(false);
                        }
                    });
                }
            },

            // 去登录界面
            login: function($scope) {
               // def.openModal('modules/business/login/index.html', $scope);
                $state.go("login");//模态改路由 付添  KYEEAPPC-3658
            },

            // 去注册界面
            regist: function($scope) {
              //  def.openModal('modules/business/login/views/regist.html', $scope);
                $state.go("regist_user");//模态改路由 付添  KYEEAPPC-3658
            },

            // 维护用户信息，此处会判断当前就诊者是附加就诊还是注册用户默认就诊者，分别去不同的页面
            goToUpdateUser: function($state) {
                var cache = CacheServiceBus.getMemoryCache();
                var cur_patient = cache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                if (cur_patient && cur_patient.IS_DEFAULT!=undefined){
                    if (cur_patient.IS_DEFAULT == 0) {
                        def.queryPatientInfo($state);//当前为附加就诊者则跳转就诊者信息页面
                    } else {
                        def.skipRoute="home->MAIN_TAB";
                        $state.go('update_user');
                    }
                }
            },

            // 首次注册，完善个人信息
            goToUpdateUser4FirstRegister: function($state) {
                def.skipRoute="home->MAIN_TAB";
                $state.go('update_user');
            },

            // 切换就诊者
            goToChangePatient: function($state) {
                CustomPatientService.F_L_A_G="home->MAIN_TAB";
                $state.go('custom_patient');
            },

            //获取最新就诊者信息
            queryPatientInfo: function($state){
                var customPatientCache = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                var userVsId = customPatientCache.USER_VS_ID;
                HttpServiceBus.connect({
                    url : "/center/action/CustomPatientAction.jspx",
                    params : {
                        op : "queryCommPatient"
                    },
                    onSuccess : function(data){
                        if(data.success){
                            var info = data.data;
                            for(var i=0;i<info.length;i++){
                                if(info[i].USER_VS_ID == userVsId){
                                    var cur_patient = info[i];
                                    customPatientCache.FLAG = cur_patient.FLAG;//更新缓存中实名认证状态
                                    if(CommPatientDetailService.item == undefined){
                                        CommPatientDetailService.item = {};
                                    }
                                    var sex = cur_patient.SEX;
                                    if(sex==1 || sex=='1' || sex=='男'){
                                        sex = KyeeI18nService.get('home->MAIN_TAB.male','男',null);
                                    }
                                    else if(sex==2 || sex=='2' || sex=='女'){
                                        sex = KyeeI18nService.get('home->MAIN_TAB.female','女',null);
                                    }
                                    else{
                                        sex = '';
                                    }
                                    CommPatientDetailService.item.loginNum = "";
                                    CommPatientDetailService.item.IMAGE_PATH = cur_patient.IMAGE_PATH;
                                    CommPatientDetailService.item.orgphone = cur_patient.PHONE;
                                    CommPatientDetailService.item.PHONE = cur_patient.PHONE;
                                    CommPatientDetailService.item.DATE_OF_BIRTH = cur_patient.DATE_OF_BIRTH;
                                    CommPatientDetailService.item.ID_NO = cur_patient.ID_NO;
                                    CommPatientDetailService.item.idnumber = cur_patient.ID_NO;
                                    CommPatientDetailService.item.OFTEN_NAME = cur_patient.OFTEN_NAME;
                                    CommPatientDetailService.item.FLAG = cur_patient.FLAG;
                                    CommPatientDetailService.item.IS_CHILD = cur_patient.IS_CHILD;
                                    CommPatientDetailService.item.IS_DEFAULT = cur_patient.IS_DEFAULT;
                                    CommPatientDetailService.item.IS_SELECTED = cur_patient.IS_SELECTED;
                                    CommPatientDetailService.item.LAST_SELECT = cur_patient.LAST_SELECT;
                                    CommPatientDetailService.item.ROLE_CODE = cur_patient.ROLE_CODE;
                                    CommPatientDetailService.item.SEX = sex;
                                    CommPatientDetailService.item.USER_ID = cur_patient.USER_ID;
                                    CommPatientDetailService.item.USER_VS_ID = cur_patient.USER_VS_ID;
                                    CommPatientDetailService.item.STATUS = cur_patient.STATUS;
                                    CommPatientDetailService.F_L_A_G="home->MAIN_TAB";
                                    $state.go("comm_patient_detail");
                                }
                            }
                        }
                        else{
                            if(data.alertType == 'ALERT'&&data.message!=undefined){
                                KyeeMessageService.message({
                                    content : data.message,
                                    okText : KyeeI18nService.get('commonText.iknowMsg','我知道了',null)
                                });
                            }
                        }
                    }
                });
            },

//            openModal : function(url, $scope) {
//                KyeeViewService.openModalFromUrl({
//                    scope: $scope,
//                    url: url
//                });
//            },

            //获取就诊卡是否可编辑状态
            getReadonly:function(data){
                if(data == '1'){
                    return false;//false-可编辑
                }
                else{
                    return true;//true-不可编辑
                }
            }
        };

        return def;
    })
    .build();
