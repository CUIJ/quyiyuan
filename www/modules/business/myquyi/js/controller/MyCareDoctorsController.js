/**
 * 产品名称：quyiyuan.
 * 创建用户：姚斌
 * 日期：2015年5月5日11:06:54
 * 创建原因：我的关注页面控制器
 * 修改人：吴伟刚
 * 修改原因：KYEEAPPC-3816 【前端国际化】我的关注模块国际化改造
 *  修改人：张明 修改时间：2015年12月02日14:37:22
 * 任务号：KYEEAPPC-4387 修改原因：提示信息修改
 * 修改人：吴伟刚 修改时间：2015年12月28日13:43:11
 * 任务号：KYEEAPPC-4710 我的关注页面增加关注数显示，并优化页面布局
 */
new KyeeModule()
    .group("kyee.quyiyuan.myquyi.my_care_doctors.controller")
    .require([
        "kyee.quyiyuan.myquyi.my_care_doctors.service",
        "kyee.quyiyuan.interaction.doctorMessageBoard.controller",
        "kyee.quyiyuan.interaction.doctorMessageBoard.service",
        "kyee.quyiyuan.myquyi.service",
        "kyee.quyiyuan.appointment.doctor_detail.service",
        "kyee.quyiyuan.appointment.service"
    ])
    .type("controller")
    .name("MyCareDoctorsController")
    .params(["$ionicScrollDelegate","PersonalChatService","MyDoctorDetailsService","$timeout","$ionicHistory","AppointmentRegistDetilService","PayOrderService","AppointmentDeptGroupService","AppointmentDoctorDetailService","OperationMonitor","KyeeUtilsService","AppointmentRegistListService","$scope", "$rootScope", "$state","MyCareDoctorsService", "KyeeMessageService",
        "DoctorMessageBoardService", "HospitalSelectorService", "CacheServiceBus",
        "MyquyiService","AppointmentDoctorDetailService","KyeeI18nService","KyeeListenerRegister"])
    .action(function($ionicScrollDelegate,PersonalChatService,MyDoctorDetailsService,$timeout,$ionicHistory,AppointmentRegistDetilService,PayOrderService,AppointmentDeptGroupService,AppointmentDoctorDetailService,OperationMonitor,KyeeUtilsService,AppointmentRegistListService,$scope, $rootScope, $state, MyCareDoctorsService, KyeeMessageService,
                     DoctorMessageBoardService, HospitalSelectorService, CacheServiceBus,
                     MyquyiService, AppointmentDoctorDetailService,KyeeI18nService,KyeeListenerRegister){

        
        $scope.canShowMultiHospital = ($rootScope.ROLE_CODE!="5");  //是否显示所有医院的关注医生

        //默认不显示家庭医生
        $scope.showFamilyDocotor = false;

        //默认不显示慢病医生
        $scope.showSpecialDiseaseDocotor = false;

        $scope.isClick = MyCareDoctorsService.lastSelectPage;  //初始显示哪个tab
        
        /**
         * 初始化查询页面数据
         */
        $scope.initialization = function(){
            MyCareDoctorsService.queryMyCareList(function(data){
                if (!data || data.length === 0){
                    $scope.showEmpty = true;
                    $scope.careList = [];
                    return;
                }

                $scope.showEmpty = false;
                var careList = [];

                if($scope.canShowMultiHospital){
                    careList = data;

                    angular.forEach(data, function(item){
                        item.pathShow = false;//头像显示样式控制
                        if (typeof item.DOCTOR_PIC_PATH === 'string' && item.DOCTOR_PIC_PATH.indexOf('doctor_common_2_0_0.png') > -1) {
                            item.DOCTOR_PIC_PATH = "";
                        }

                        if (!item.DOCTOR_PIC_PATH) {
                            item.DOCTOR_PIC_PATH = item.DOCTOR_SEX == 1 ? "resource/images/base/head_default_female.jpg" : "resource/images/base/head_default_man.jpg";
                        }
                    });
                } else {
                    // 微信公众号个性化需求
                    var urlHospitalId = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL).hospitalID;
                    angular.forEach(data, function(item){
                        if (item.HOSPITAL_ID == urlHospitalId) {

                            item.pathShow = false;//头像显示样式控制

                            if (typeof item.DOCTOR_PIC_PATH === 'string' && item.DOCTOR_PIC_PATH.indexOf('doctor_common_2_0_0.png') > -1) {
                                item.DOCTOR_PIC_PATH = "";
                            }

                            if (!item.DOCTOR_PIC_PATH) {
                                item.DOCTOR_PIC_PATH = item.DOCTOR_SEX == 1 ? "resource/images/base/head_default_female.jpg" : "resource/images/base/head_default_man.jpg";
                            }

                            careList.push(item);
                        }
                    });
                }

                $scope.careList = careList;
            });
        };

        /**
         * 跳转医生主页函数
         * @param data
         */
        $scope.gotoAppoint = function (data) {
            if(data.APPOINT_POWER == 0 && data.REGIST_POWER == 0){
                return;
            }
            var hospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
            if(data.HOSPITAL_ID != hospitalId){
                KyeeMessageService.confirm({
                    title: KyeeI18nService.get('commonText.msgTitle','消息'),
                    content: KyeeI18nService.get('careDoctors.changeHospital','此操作会切换到{{hospitalName}}，是否切换？',{hospitalName:data.HOSPITAL_NAME}),
                    onSelect: function (res) {
                        if(res){
                            MyCareDoctorsService.queryHospitalInfo(data.HOSPITAL_ID, function(result){
                                // 切换医院
                                HospitalSelectorService.selectHospital(data.HOSPITAL_ID, result.HOSPITAL_NAME,
                                    result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                                    result.CITY_CODE, result.CITY_NAME,  KyeeI18nService.get('commonText.loadingHospitalMsg','医院正在切换中...'), function () {
                                        // 跳转医生主页
                                        AppointmentDoctorDetailService.doctorInfo = data;
                                        var deptData = {};
                                        deptData.DEPT_CODE = data.DEPT_CODE;
                                        deptData.DEPT_NAME = data.DEPT_NAME;
                                        deptData.IS_ONLINE = data.IS_ONLINE;
                                        AppointmentDeptGroupService.SELECT_DEPTGROUPDATA =deptData;
                                        $state.go("doctor_info");
                                    });
                            });
                        }
                    }
                });
            } else {
                // 跳转医生主页
                AppointmentDoctorDetailService.doctorInfo = data;
                var deptData = {};
                deptData.DEPT_CODE = data.DEPT_CODE;
                deptData.DEPT_NAME = data.DEPT_NAME;
                deptData.IS_ONLINE = data.IS_ONLINE;
                AppointmentDeptGroupService.SELECT_DEPTGROUPDATA =deptData;
                $state.go("doctor_info");
            }
        };

        /**
         * 取消关注事件
         */
        $scope.cancleCare = function (doctor, index) {
            AppointmentDoctorDetailService.doctorInfo=doctor;
            AppointmentDoctorDetailService.careDoctor("0");
            $scope.careList.splice(index, 1);
            $timeout(function () {
                $scope.initialization();
            }, 200);
        };
        /**
         * 页面监听
         */
        KyeeListenerRegister.regist({
            focus: "careDoctors",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                $scope.queryInteractionInfo(false); //edit by wangsannv
                if ($scope.isClick == 1) {
                    $scope.initialization();
                } else if ($scope.isClick == 2) {
                    $scope.onRefreshBtn();
                } else if ($scope.isClick == 3) {
                    $scope.queryInteractionInfo(false);
                }
                $scope.userSource = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);
                $timeout(function(){
                    $ionicScrollDelegate.$getByHandle('businessList').scrollTop();
                }, 500);
            }
        });

        var curPage = 0, pageSize = 6, timer;
        /**
         * [selectClick 选择tab]
         * @param  {[type]} flag [description]
         * @return {[type]}      [description]
         */
        $scope.selectClick = function (flag) {
            if (1 == flag) {
                $scope.initialization();
            } else if (2 == flag) {
                //初始化分页参数
                pageSize = 6;
                $scope.hasmore = false;
                //预约挂号记录
                curPage = 0;
                $scope.resultData = [];
                $scope.loadMore();
                $scope.DoctorPatientData = {};
                //医患互动请求数据
                AppointmentRegistListService.addParameter(function(doctorPatientData){
                    $scope.DoctorPatientData = doctorPatientData.DoctorPatientData;
                });
            }

            if (timer != undefined) {
                KyeeUtilsService.cancelInterval(timer);
            }
            MyCareDoctorsService.lastSelectPage = flag;
            $scope.isClick = flag;
        };

        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "careDoctors",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.back();
            }
        });

        /**
         * [back 返回]
         * @return {[type]} [description]
         */
        $scope.back = function () {
            MyCareDoctorsService.lastSelectPage = 1;
            $ionicHistory.goBack(-1);
        };

        /***
         * 预约挂号记录 复制一份在此页面
         * 预约记录删除
         */
        $scope.delete = function ($index, paidItem) {
            var userVsId = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
            if(1==paidItem.DELET_FLAG) {
                $scope.DEL_FLAG_EXTEND = "0";
                //获取當前年月日
                $scope.datet = new Date();
                $scope.dated = KyeeUtilsService.DateUtils.formatFromDate( $scope.datet, 'YYYY/MM/DD');
                //获取當前時間點
                $scope.hourn = KyeeUtilsService.DateUtils.formatFromDate( $scope.datet, 'HH:mm');
                //获取就診時間點
                $scope.hours = (paidItem.CLINIC_DURATION).substring(paidItem.CLINIC_DURATION.lastIndexOf("/")+3,paidItem.CLINIC_DURATION.length);
                if( $scope.hours.substring(0,1).indexOf(" ")!=-1)
                {
                    $scope.hours=$scope.hours.substring(1);
                }
                if($scope.hours.length<5)
                {
                    $scope.hourt =  KyeeUtilsService.DateUtils.formatFromString($scope.hours,"h:m","hh:mm'");
                }
                else
                {
                    $scope.hourt=$scope.hours;
                }
                if((paidItem.APPOINT_TYPE==1 ||paidItem.APPOINT_TYPE==5 ||paidItem.REGIST_TYPE==1)
                    && paidItem.VISIT_STATUS==0)
                {
                    if(Date.parse(paidItem.REG_DATE_RESULT)>Date.parse($scope.dated))
                    {
                        $scope.DEL_FLAG_EXTEND = "1";
                    }
                    else if(Date.parse(paidItem.REG_DATE_RESULT)==Date.parse($scope.dated))
                    {
                        if( $scope.hourt!=null &&  $scope.hourt> $scope.hourn)
                        {
                            $scope.DEL_FLAG_EXTEND = "1";
                        }
                    }
                }
                if($scope.DEL_FLAG_EXTEND=="1")
                {
                    KyeeMessageService.broadcast({
                        content: "未过期的记录暂不支持删除 ，您可在就诊日期之后再操作"
                    });
                    return;
                }
                else {
                    AppointmentRegistListService.deleteList(function () {
                        $scope.onRefreshBtn();
                    }, paidItem.REG_ID, userVsId);
                    $scope.resultData.splice($index, 1);
                }
            }
            OperationMonitor.record("countDelete", "appointment_regist_list");
        };

        //刷新
        $scope.onRefreshBtn = function() {
            var type='1';
            $scope.loadMore(type);
        };

        /**
         * [loadMore 上拉加载更多]
         * @param  {[type]} type [description]
         * @return {[type]}      [description]
         */
        $scope.loadMore = function(type) {
            curPage++;
            if(type=='1'){
                curPage = 1;
            }
            AppointmentRegistListService.getAppointList(type,curPage,function(appointListData){
                var urlInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL);
                if(urlInfo && urlInfo.hospitalID&&!urlInfo.businessType){
                    appointListData.resultData = $filter('filter')(appointListData.resultData, {HOSPITAL_ID: urlInfo.hospitalID});
                }
                if(!$scope.resultData){
                    $scope.resultData=appointListData.resultData;
                }else{
                    if(type=='1'){
                        //如果是下拉刷新
                        $scope.resultData = appointListData.resultData;
                    }else{
                        //如果是上拉加载更多
                        $scope.resultData = $scope.resultData.concat(appointListData.resultData);
                    }
                }
                if(!type){
                    $scope.hasmore = appointListData.resultData.length > 0;
                }
                $scope.appointListNotHidden = appointListData.appointListNotHidden;
                $scope.$broadcast('scroll.infiniteScrollComplete');

                if(!$scope.resultData || $scope.resultData.length == 0){
                    $scope.dataNotHidden = true;
                    $scope.dataDetail = KyeeI18nService.get("appointment_regist_list.noRecords","暂无预约记录");
                }else{
                    $scope.dataNotHidden=false;
                }

                //支付按钮
                //start定时
                var app7index = [];
                this.timers=[];
                $scope.timeState=false;
                for(var i=0;i<appointListData.resultData.length;i++) {
                    //KYEEAPPC-4351 wangwan 修改页面定时器
                    $scope.timerFunction(appointListData.resultData[i]);
                }
                $scope.$broadcast('scroll.infiniteScrollComplete');
            });
        };

        /* $scope.timerFunction = function(resultData){
            //支付按钮
            //start定时
            var app7index=[];
            this.timers=[];
            //$scope.timeState=false;
            resultData.timeState=false;

          if (parseInt(resultData.APPOINT_TYPE) == 7 ||parseInt(resultData.REGIST_TYPE) == 8) {
                var remainSenconds = resultData.REMAIN_SECORDS;
                if (remainSenconds > 0) {
                    app7index.push(i);
                    //创建一个定时器对象
                    timer = new Object();
                    //将定时器对象放入数组，以便遍历释放
                    this.timers.push(timer);
                    //前台用regId当做id
                    var regId = resultData.REG_ID;
                    //启动定时器
                    var setTime = function (timer, time, regId) {
                        var now = new Date(), //服务器时间
                            ms = time - now,
                        //计算出开始时间和现在时间的时间戳差
                            minute = Math.floor(ms / (1000 * 60)),
                        //分钟
                            second = Math.floor(ms / 1000) % 60,
                        //秒
                            label;
                        if (ms > 0) {
                            if (second < 10) {
                                second = '0' + second;
                            }
                            resultData.leaveTime=KyeeI18nService.get("appointment_regist_list.Surplus","支付剩余时间")+"<span style='color: red'>" + minute + ':' + second + "</span>" +KyeeI18nService.get("appointment_regist_list.Minute","分钟");
                            resultData.timeState=true;
                        } else {
                            resultData.timeState =false;
                            KyeeUtilsService.cancelInterval(timer);
                            $scope.onRefreshBtn();
                        }
                    };
                    if (remainSenconds) {
                        var now = new Date();
                        var tem2 = now.getTime() + parseInt(remainSenconds) * 1000;
                        now.setTime(tem2);
                        if (now) {

                            timer = KyeeUtilsService.interval({
                                time: 1000,
                                action: function () {
                                    setTime(timer, now, regId);
                                }
                            });
                            setTime(timer, now, regId);
                        }
                    }
                }
            }
        };*/

        //跳转预约挂号详情
        $scope.onAppointRecordListTap = function(appointList) {
            AppointmentRegistDetilService.ROUTE_STATE="careDoctors";
            AppointmentRegistDetilService.RECORD=appointList;
            $state.go("appointment_regist_detil");
        };

        //医患互动按钮
        $scope.onDoctorPatientTap = function(appointList) {
            AppointmentRegistListService.onDoctorPatientTap(appointList);
        };

        //预约后支付，继续支付按钮onGoToPay
        $scope.onGoToPay = function(appointList) {
            AppointmentRegistListService.onGoToPay(appointList,function (data) {
                var amount = parseFloat(appointList.AMOUNT).toFixed(2);
                $scope.AMOUNT = "¥" + amount;
                appointList.AMOUNT=amount;
                var paydata = appointList;
                paydata.C_REG_ID = appointList.REG_ID;
                paydata.flag='3';//代表预约
                paydata.TRADE_NO =data.OUT_TRADE_NO;
                paydata.REMAIN_SECONDS=data.REMAIN_SECONDS;
                paydata.MARK_DETAIL =appointList.MARK_DESC;
                paydata.APPOINT_SUCCESS_PAY="1";
                paydata.isShow=data.isShow;
                paydata.IS_OPEN_BALANCE=data.IS_OPEN_BALANCE;
                paydata.USER_PAY_AMOUNT=data.USER_PAY_AMOUNT;
                paydata.hospitalID = appointList.HOSPITAL_ID;
                paydata.CARD_NO = data.CARD_NO;
                paydata.CARD_TYPE = data.CARD_TYPE;
                var now = new Date();
                var payDeadLine= new Date(now.getTime()+data.REMAIN_SECONDS*1000);
                paydata.PAY_DEADLINE = payDeadLine;//支付截止时间
                // wangchengcheng 2016年1月20日14:44:56 KYEEAPPC-4852
                if(data.isSupportMerge==1){
                    paydata["AMOUNT"] = data.USER_PAY_AMOUNT;
                    amount=data.USER_PAY_AMOUNT;
                    data["PREFERENTIAL_FEE"]="";
                }
                var paydataNew = angular.copy(paydata);
                paydata.MARK_DESC = KyeeI18nService.get("appointment_regist_list.markDesc","挂号费");
                PayOrderService.payData = paydataNew;
                //gch
                var feeStr = data["PREFERENTIAL_FEE"];
                $scope.zeroPay = parseFloat(paydata["USER_PAY_AMOUNT"]).toFixed(2);
                var FEE;
                if (feeStr) {
                    FEE = JSON.parse(feeStr);
                    paydataNew["PREFERENTIAL_LIST"]=FEE;
                }
                if($scope.zeroPay <= parseFloat(0.00)&&feeStr){
                    PayOrderService.payData = paydataNew;
                    KyeeMessageService.confirm({
                        content: $scope.castContent(FEE,amount),
                        onSelect: function (confirm) {
                            if (confirm) {
                                AppointmentRegistDetilService.RECORD = {
                                    HOSPITAL_ID: paydata["hospitalID"],
                                    REG_ID: paydata["C_REG_ID"],
                                    handleNoPayFlag:"1"
                                };
                                AppointmentRegistDetilService.ROUTE_STATE = "appointment_regist_list";
                                CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,true);//进入预约挂号完成页比标志必须为true，用以标识用户默认勾选赠送的停诊险
                                $state.go("appointment_result");
                                return;
                            }else{

                                $scope.cancelPayOrder();
                                return;

                            }

                        }
                    });

                }else{
                    PayOrderService.payData = paydataNew;
                    //0元支付不跳转到支付页面，直接跳转到结果页  by高萌  KYEEAPPC-5987
                    if(amount  == 0.00&&$scope.zeroPay <= parseFloat(0.00)){
                        AppointmentRegistDetilService.RECORD = {
                            HOSPITAL_ID: paydata["hospitalID"],
                            REG_ID: paydata["C_REG_ID"],
                            handleNoPayFlag:"1"
                        };
                        AppointmentRegistDetilService.ROUTE_STATE = "appointment_regist_list";
                        CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,true);//进入预约挂号完成页比标志必须为true，用以标识用户默认勾选赠送的停诊险
                        $state.go("appointment_result");
                    }else
                    {
                        $state.go("payOrder");
                    }
                }
            });
            OperationMonitor.record("countOnGoToPay", "careDoctors");
        };

        //KYEEAPPC-4351 wangwan 挂号后支付
        $scope.goToPayRegist=function(appointList){
            var toPayPara = {
                HOSPITAL_ID: appointList.HOSPITAL_ID,
                C_REG_ID: appointList.REG_ID
            };
            AppointmentRegistDetilService.goToPayRegist(toPayPara, function (data) {
                var amount = parseFloat(appointList.AMOUNT).toFixed(2);
                $scope.AMOUNT = "¥" + amount;
                appointList.AMOUNT=amount;
                var paydata = appointList;
                paydata["HOSPITAL_ID"]= appointList.HOSPITAL_ID;
                paydata["TRADE_NO"] = data.OUT_TRADE_NO;
                paydata["MARK_DETAIL"] = appointList.MARK_DESC;
                paydata["APPOINT_SUCCESS_PAY"] = 1;
                // paydata["ROUTER"] = "appointment_regist_list";
                paydata["REMAIN_SECONDS"] = data.REMAIN_SECONDS;
                //新增倒计时截止时间  edit by 高萌  2017年3月10日11:46:21
                var now = new Date();
                var payDeadLine= new Date(now.getTime()+data.REMAIN_SECONDS*1000);
                paydata["PAY_DEADLINE"] = payDeadLine;//支付截止时间
                //end by
                paydata["flag"] = 4;//用于支付页面 取消支付的状态：1 挂号 2：预约转挂号 3预约缴费 4挂号缴费
                paydata["isShow"]=data.isShow;
                paydata["IS_OPEN_BALANCE"]=data.IS_OPEN_BALANCE;
                paydata["USER_PAY_AMOUNT"]=data.USER_PAY_AMOUNT;
                paydata["CARD_NO"]=data.CARD_NO;
                paydata["CARD_TYPE"]=data.CARD_TYPE;
                paydata["C_REG_ID"]=appointList.C_REG_ID;
                paydata["hospitalID"] = paydata.HOSPITAL_ID;
                if(data.isSupportMerge==1){
                    paydata["AMOUNT"] = data.USER_PAY_AMOUNT;
                    amount=data.USER_PAY_AMOUNT;
                    data["PREFERENTIAL_FEE"]="";
                }
                var paydataNew = angular.copy(paydata);
                paydataNew["MARK_DESC"] = KyeeI18nService.get("appointment_regist_list.markDesc","挂号费");
                PayOrderService.payData = paydataNew;
                //gch
                var feeStr = data["PREFERENTIAL_FEE"];
                $scope.zeroPay = parseFloat(paydata["USER_PAY_AMOUNT"]).toFixed(2);
                var FEE;
                if (feeStr) {
                    //var FEE = JSON.parse(feeStr);
                    FEE = feeStr;
                    paydataNew["PREFERENTIAL_LIST"]=FEE;
                }
                if($scope.zeroPay <= parseFloat(0.00)&&feeStr){
                    PayOrderService.payData = paydataNew;
                    KyeeMessageService.confirm({
                        content: $scope.castContent(FEE,amount),
                        onSelect: function (confirm) {
                            if (confirm) {
                                AppointmentRegistDetilService.RECORD = {
                                    HOSPITAL_ID: paydata["hospitalID"],
                                    REG_ID: paydata["C_REG_ID"],
                                    handleNoPayFlag:"1"
                                };
                                AppointmentRegistDetilService.ROUTE_STATE = "appointment_regist_list";
                                CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,true);//进入预约挂号完成页比标志必须为true，用以标识用户默认勾选赠送的停诊险
                                $state.go("appointment_result");
                                return;
                            }else{

                                $scope.cancelPayOrder();
                                return;

                            }

                        }
                    });

                }else{
                    PayOrderService.payData = paydataNew;
                    //0元支付不跳转到支付页面，直接跳转到结果页  by高萌  KYEEAPPC-5987
                    if(amount == 0.00&&$scope.zeroPay <= parseFloat(0.00)){
                        AppointmentRegistDetilService.RECORD = {
                            HOSPITAL_ID: paydata["hospitalID"],
                            REG_ID: paydata["C_REG_ID"],
                            handleNoPayFlag:"1"
                        };
                        AppointmentRegistDetilService.ROUTE_STATE = "appointment_regist_list";
                        CacheServiceBus.getMemoryCache().set(CACHE_CONSTANTS.MEMORY_CACHE.RISK_USER_OPERTER,true);//进入预约挂号完成页比标志必须为true，用以标识用户默认勾选赠送的停诊险
                        $state.go("appointment_result");
                    }else
                    {
                        $state.go("payOrder");
                    }
                }
            });
            OperationMonitor.record("countGoToPayRegist", "careDoctors");
        };

        //取消预约
        $scope.onCancelPay = function(appointList) {
            AppointmentRegistListService.onCancelPay(appointList,function (resultData) {
            });
        };
        //0元弹出框修改
        $scope.castContent=function (fee,amount) {
            var contentInfo="";
            for(var data in fee){
                contentInfo=contentInfo+fee[data].preferentialName+"：¥"+parseFloat(fee[data].preferentialFee).toFixed(2)+ "<br>"
            }
            contentInfo="挂号费：¥"+amount + "<br>"+contentInfo+"实际支付：¥0.00";
            return contentInfo;
        };
        //重新预约
        //KYEEAPPC-4351 wangwan 重新预约
        $scope.reappoint = function (appointDetil) {
            var deptData = {};
            deptData.DEPT_CODE = appointDetil.DEPT_CODE;
            deptData.DEPT_NAME = appointDetil.DEPT_NAME;
            deptData.IS_ONLINE = appointDetil.IS_ONLINE;
            AppointmentRegistListService.reappoint(deptData,appointDetil.HOSPITAL_ID,function(reappointData){
                if(reappointData.CAN_AGAIN_APPOINT){
                    MyCareDoctorsService.queryHospitalInfo(appointDetil.HOSPITAL_ID, function(result){
                        // 切换医院
                        HospitalSelectorService.selectHospital(appointDetil.HOSPITAL_ID, result.HOSPITAL_NAME,
                            result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                            result.CITY_CODE, result.CITY_NAME, "医院正在切换中...", function () {
                                AppointmentDeptGroupService.SELECT_DEPTGROUPDATA=appointDetil;
                                //跳到医生列表页，将科室放入
                                AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptData;
                                $state.go('appointment_doctor');
                            });
                    });
                }else{
                    KyeeMessageService.message({
                        content: reappointData.AGAIN_MESSAGE
                    });
                    //提示此科室不可用了或者此科室IS_ONLINE变化
                }
            });
            OperationMonitor.record("countReappoint", "careDoctors");
        };

        //再次预约
        //KYEEAPPC-4351 wangwan 再次预约
        $scope.againAppoint = function (appointDetil) {
            if($rootScope.ROLE_CODE == "5"){
                // 微信公众号个性化需求
                var urlHospitalId = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL).hospitalID;
                if(urlHospitalId != appointDetil.HOSPITAL_ID){
                    return;
                }
            }
            var deptData = {};
            deptData.DEPT_CODE = appointDetil.DEPT_CODE;
            deptData.DEPT_NAME = appointDetil.DEPT_NAME;
            deptData.IS_ONLINE = appointDetil.IS_ONLINE;
            AppointmentRegistListService.againAppoint(deptData,appointDetil.HOSPITAL_ID,appointDetil.DOCTOR_CODE,function(againAppointData){
                if(againAppointData.CAN_AGAIN_APPOINT){

                    MyCareDoctorsService.queryHospitalInfo(appointDetil.HOSPITAL_ID, function(result){
                        // 切换医院
                        HospitalSelectorService.selectHospital(appointDetil.HOSPITAL_ID, result.HOSPITAL_NAME,
                            result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                            result.CITY_CODE, result.CITY_NAME, "医院正在切换中...", function () {
                                AppointmentDoctorDetailService.doctorInfo=appointDetil;
                                //跳到医生列表页，将科室放入
                                AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptData;
                                $state.go('doctor_info');
                            });
                    });

                }else{
                    KyeeMessageService.message({
                        content: againAppointData.AGAIN_MESSAGE
                    });
                    //提示没有此科室或者科室IS_online变化
                }
            });
            OperationMonitor.record("countAgainAppoint", "careDoctors");
        };

        //去点评  By  张家豪  KYEEAPPC-3292
        $scope.goToComment = function(appointList) {
            AppointmentRegistListService.goToComment(appointList);
            OperationMonitor.record("countGoToComment", "careDoctors");
        };

        //去查看评分
        //KYEEAPPC-4351 wangwan 顶级评分查看评分
        $scope.goToSeeComment = function(appointList,event) {
            AppointmentRegistListService.goToSeeComment(appointList);
            OperationMonitor.record("countToSeeComment", "careDoctors");
            event.stopPropagation();
        };

        //咨询医生  By  张家豪  KYEEAPPC-3292
        $scope.consultDoctor = function(appointList) {
            MyCareDoctorsService.queryHospitalInfo(appointList.HOSPITAL_ID, function(result){
                // 切换医院
                HospitalSelectorService.selectHospital(appointList.HOSPITAL_ID, result.HOSPITAL_NAME,
                    result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                    result.CITY_CODE, result.CITY_NAME, "医院正在切换中...", function () {
                        //先切换到当前记录的医院，再跳转到医生咨询页面
                        AppointmentRegistListService.consultDoctor(appointList);
                    });
            });
            OperationMonitor.record("countConsultDoctor", "careDoctors");
        };

        /**
         * [goToDoctorInfo 跳转到医生主页]
         * @param  {[type]} appointDetil [description]
         * @return {[type]}              [description]
         */
        $scope.goToDoctorInfo = function (appointDetil) {
            var deptData = {};
            deptData.DEPT_CODE = appointDetil.DEPT_CODE;
            deptData.DEPT_NAME = appointDetil.DEPT_NAME;
            deptData.IS_ONLINE = appointDetil.IS_ONLINE;
            MyCareDoctorsService.queryHospitalInfo(appointDetil.HOSPITAL_ID, function(result){
                // 切换医院
                HospitalSelectorService.selectHospital(appointDetil.HOSPITAL_ID, result.HOSPITAL_NAME,
                    result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                    result.CITY_CODE, result.CITY_NAME, "医院正在切换中...", function () {
                        AppointmentDoctorDetailService.doctorInfo=appointDetil;
                        //跳到医生列表页，将科室放入
                        AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptData;
                        $state.go('doctor_info');
                    });
            });
            OperationMonitor.record("countAppointListToDoctorInfo", "careDoctors");
        };

        /**
         * [goToConsultDoctorInfo 跳转到咨询医生主页]
         * @param  {[type]} appointDetil [description]
         * @return {[type]}              [description]
         */
        $scope.goToConsultDoctorInfo = function (appointDetil) {
            var deptData = {};
            deptData.DEPT_CODE = appointDetil.DEPT_CODE;
            deptData.DEPT_NAME = appointDetil.DEPT_NAME;
            deptData.IS_ONLINE = appointDetil.IS_ONLINE;
            MyCareDoctorsService.queryHospitalInfo(appointDetil.HOSPITAL_ID, function(result){
                // 切换医院
                HospitalSelectorService.selectHospital(appointDetil.HOSPITAL_ID, result.HOSPITAL_NAME,
                    result.MAILING_ADDRESS, result.PROVINCE_CODE, result.PROVINCE_NAME,
                    result.CITY_CODE, result.CITY_NAME, "医院正在切换中...", function () {
                        AppointmentDoctorDetailService.doctorInfo=appointDetil;
                        //跳到医生列表页，将科室放入
                        AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptData;
                        AppointmentDoctorDetailService.activeTab = 1;
                        $state.go('doctor_info');
                    });
            });
            OperationMonitor.record("countAppointListToDoctorInfo", "careDoctors");
        };

        /**
         * [toSelectCustomer 跳转至切换就诊者]
         * @return {[type]} [description]
         */
        $scope.toSelectCustomer = function(){
            $state.go('custom_patient');
        };

        /**
         * [goDoctorDetails 医生详情页]
         * @param  {[type]} doctor [description]
         * @return {[type]}        [description]
         */
        $scope.goDoctorDetails = function(doctor){
            MyDoctorDetailsService.doctorInfo = doctor;
            MyDoctorDetailsService.doctorInfo.isFromMydoctor=1;
            $state.go("my_doctor_details");
        };

        /**
         * [leaveMessage 给医生留言，跳转至聊天页面]
         * @param  {[type]} doctor [description]
         * @return {[type]}        [description]
         */
        $scope.leaveMessage = function(doctor){
            PersonalChatService.receiverInfo = { //接收者医生信息
                //YX yxUser
                userRole: doctor.userRole,
                userPetname: doctor.doctorName,
                userPhoto: doctor.doctorPhoto,
                sex: doctor.doctorSex,
                scUserVsId: doctor.scUserVsId,
                visitName:doctor.patientName //就诊者真是姓名
            };
            PersonalChatService.goPersonalChat();
        };

        /**
         * 家庭医生的页面
         */
        $scope.queryInteractionInfo = function(showPrompt,type){

            MyCareDoctorsService.queryFamilyDoctor(function(data){
                var oldData = $scope.familyDoctorViewArray;
                var oldChronicData = $scope.chronicDoctorViewArray;
                $scope.familyDoctorViewArray = [];
                $scope.chronicDoctorViewArray = [];
                if(data && data.length > 0){
                    //根据type分类家庭医生和慢病医生
                    for(var i = 0;i < data.length; i++){

                        var familyDoctorArray = [];
                        var chronicDoctorArray = [];
                        var myfamilyDoctorInfos = data[i].myfamilyDoctorInfos;
                        for (var j = 0;j < myfamilyDoctorInfos.length;j++ ){

                            if(myfamilyDoctorInfos[j].type == 2){

                                familyDoctorArray.push(myfamilyDoctorInfos[j]);

                            }else if(myfamilyDoctorInfos[j].type == 3){

                                chronicDoctorArray.push(myfamilyDoctorInfos[j]);

                            }

                        }
                        if(familyDoctorArray.length > 0){
                            $scope.familyDoctorViewArray.push({
                                "oftenName":data[i].oftenName,
                                "myfamilyDoctorInfos":familyDoctorArray
                            });
                        }
                        if(chronicDoctorArray.length > 0){
                            $scope.chronicDoctorViewArray.push({
                                "oftenName":data[i].oftenName,
                                "myfamilyDoctorInfos":chronicDoctorArray
                            });
                        }

                    }

                    //是否显示家庭医生
                    if($scope.familyDoctorViewArray.length > 0){
                        $scope.showFamilyDocotor = true;

                        if(showPrompt && type == 'family'){ //edit by wangsannv
                            if(hasNewData(oldData,$scope.familyDoctorViewArray)){
                                KyeeMessageService.message({
                                    title: KyeeI18nService.get("hospital_selector.message", "温馨提示"),
                                    content:"已为您找到并绑定家庭医生，快去和医生进行交流吧。",
                                    okText: KyeeI18nService.get("commonText.selectOk", "确定")
                                });
                            }
                        }
                    }else{
                        $scope.showFamilyDocotor = false;
                        if(showPrompt && type == 'family') {  //edit by wangsannv
                            KyeeMessageService.message({
                                title: KyeeI18nService.get("hospital_selector.message", "温馨提示"),
                                content: "暂未查询到您的家庭医生。",
                                okText: KyeeI18nService.get("commonText.selectOk", "确定")
                            });  //edit by wangsannv
                            $scope.selectClick(1);
                        }
                    }

                    //是否显示慢病医生
                    if($scope.chronicDoctorViewArray.length > 0){
                        $scope.showSpecialDiseaseDocotor = true;
                        if(showPrompt && type == 'chronic'){
                            if(hasNewData(oldChronicData,$scope.chronicDoctorViewArray)){
                                KyeeMessageService.message({
                                    title: KyeeI18nService.get("hospital_selector.message", "温馨提示"),
                                    content:"已为您找到并绑定慢病医生，快去和医生进行交流吧。",
                                    okText: KyeeI18nService.get("commonText.selectOk", "确定")
                                });
                            }
                        }
                    }else{
                        $scope.showSpecialDiseaseDocotor = false;
                        if(showPrompt && type == 'chronic') {
                            KyeeMessageService.message({
                                title: KyeeI18nService.get("hospital_selector.message", "温馨提示"),
                                content: "暂未查询到您的慢病医生。",
                                okText: KyeeI18nService.get("commonText.selectOk", "确定")
                            });
                            $scope.selectClick(1);
                        }
                    }

                }
            });
        };

        /* add by wangsannv
         * 计算是否查到新的记录
         */
        var hasNewData = function (oldData,newData){
            //处理旧数据
            var oldStr = "", newStr = [];
            for(var i=0;i<oldData.length;i++){
                var userVsId=oldData[i].userVsId;
                for(var j=0;j< oldData[i].myfamilyDoctorInfos.length;j++){
                    var scDoctorId=oldData[i].myfamilyDoctorInfos[j].scDoctorId;
                    oldStr=oldStr+userVsId+""+scDoctorId;
                }
            }
            //处理新数据
            for(var i=0;i<newData.length;i++){
                var userVsId=newData[i].userVsId;
                for(var j=0;j<newData[i].myfamilyDoctorInfos.length;j++){
                    var scDoctorId=newData[i].myfamilyDoctorInfos[j].scDoctorId;
                    newStr.push(userVsId+""+scDoctorId);
                }
            }
            for(var i=0;i<newStr.length;i++){
                if(oldStr.indexOf(newStr[i])<0){
                    return true;
                }
            }
            return false;
        }
    })
    .build();
