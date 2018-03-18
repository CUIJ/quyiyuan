/**
 * 产品名称：quyiyuan
 * 创建者：WANGWAN
 * 创建时间：2015/5/9.
 * 创建原因：预约挂号记录
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.appointment.regist.list.controller")
    .require([ "kyee.framework.service.view",
        "kyee.quyiyuan.appointment.regist.List.service",
        "kyee.quyiyuan.appointment.appointment_regist_detil.service",
        "kyee.quyiyuan.appointment.appointment_regist_detil.controller"])
    .type("controller")
    .name("AppointmentRegistListController")
    .params(["$scope","$rootScope","AppointmentRegistListService","$state","AppointmentRegistDetilService",
        "KyeeUtilsService","KyeeListenerRegister","KyeeI18nService","$ionicHistory","MyCareDoctorsService",
        "HospitalSelectorService","AppointmentDeptGroupService","AppointmentDoctorDetailService","PayOrderService","KyeeMessageService","CacheServiceBus","OperationMonitor","$filter"])
    .action(function($scope,$rootScope,AppointmentRegistListService,$state,AppointmentRegistDetilService,
                     KyeeUtilsService,KyeeListenerRegister,KyeeI18nService,$ionicHistory,MyCareDoctorsService,
                     HospitalSelectorService,AppointmentDeptGroupService,AppointmentDoctorDetailService,PayOrderService,KyeeMessageService,CacheServiceBus,OperationMonitor,$filter){
        //初始化分页参数
        var curPage=0;
        var pageSize=6;
       $scope.hasmore=false;
        //预约记录删除
        $scope.delete = function ($index,paidItem) {
            var userVsId = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
            if(1==paidItem.DELET_FLAG)
            {
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
                    $scope.resultData.splice($index, 1);
                    AppointmentRegistListService.deleteList(function () {
                        $scope.onRefreshBtn();
                    }, paidItem.REG_ID, userVsId);
                }
            }
            OperationMonitor.record("countDelete", "appointment_regist_list");
        };


        //增加监听事件
        KyeeListenerRegister.regist({
            focus : "appointment_regist_list",
            when : KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            direction: "both",
            action : function(params){
                //预约挂号记录
                curPage=0;
                $scope.loadMore();
                //医患互动请求数据
                AppointmentRegistListService.addParameter(function(doctorPatientData){
                    $scope.DoctorPatientData=doctorPatientData.DoctorPatientData;
                    $scope.DoctorPatientNotHidden=doctorPatientData.DoctorPatientNotHidden;
                });
            }
        });
        var timer = undefined;
        //页面离开，销毁定时器
        KyeeListenerRegister.regist({
            focus: "appointment_regist_list",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_LEAVE,
            action: function (params) {
                if (timer != undefined) {
                    KyeeUtilsService.cancelInterval(timer);
                }
            }
        });
        //监听物理返回键
        KyeeListenerRegister.regist({
            focus: "appointment_regist_list",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.back();
            }
        });
        //返回
        $scope.back = function () {
            /*if (AppointmentRegistListService.ROUTE_STATE == "appointment_result") {
                AppointmentRegistListService.ROUTE_STATE = "";
                $state.go("myquyi->MAIN_TAB.medicalGuide");
            }else if (AppointmentRegistListService.ROUTE_STATE == "appointment_regist_detil") {*/
                AppointmentRegistListService.ROUTE_STATE = "";

                $state.go("myquyi->MAIN_TAB.medicalGuide");
           /* }
            else {
                $ionicHistory.goBack(-1);
            }*/
        };
        //刷新
        $scope.onRefreshBtn = function() {
           /* AppointmentRegistListService.getAppointList(false,curPage, function (appointListData) {
                $scope.resultData=appointListData.resultData;
                $scope.appointListNotHidden=appointListData.appointListNotHidden;

                if(!$scope.resultData || $scope.resultData.length == 0){
                    $scope.dataNotHidden=true;
                    $scope.dataDetail="暂无预约挂号记录"
                }
            });*/
            //curPage=0;
            //下拉刷新标识  wangwan  2015年12月16日15:29:55
            var type='1';
            $scope.loadMore(type);
            $scope.$broadcast('scroll.refreshComplete');
        };

        $scope.loadMore = function(type) {
            curPage++;
            if(type=='1'){
                curPage=1;
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
                        $scope.resultData=appointListData.resultData;
                        }else{
                        //如果是上拉加载更多
                        $scope.resultData=$scope.resultData.concat(appointListData.resultData);
                        }
                    }
                 if(!type){
                     $scope.hasmore=appointListData.resultData.length>0;
                 }
                $scope.appointListNotHidden = appointListData.appointListNotHidden;
                $scope.$broadcast('scroll.infiniteScrollComplete');

                if(!$scope.resultData || $scope.resultData.length == 0){
                      $scope.dataNotHidden=true;
                      $scope.dataDetail= KyeeI18nService.get("appointment_regist_list.noRecords","暂无预约记录");
                }

                        //支付按钮
                        //start定时
                        var app7index=[];
                        this.timers=[];
                        $scope.timeState=false;
                        for(var i=0;i<appointListData.resultData.length;i++) {
                            //KYEEAPPC-4351 wangwan 修改页面定时器
                            $scope.timerFunction(appointListData.resultData[i]);
                          }
            $scope.$broadcast('scroll.infiniteScrollComplete');
           });
        };
        //定时器方法
        //KYEEAPPC-4351 wangwan 修改页面定时器
        $scope.timerFunction = function(resultData){
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
                                //$scope.timeState = true;
                               // $scope.regId = regId;
                                //$scope.leaveTime =KyeeI18nService.get("appointment_regist_list.Surplus","支付剩余时间")+"<span style='color: red'>" + minute + ':' + second + "</span>" +KyeeI18nService.get("appointment_regist_list.Minute","分钟");
                            } else {
                                resultData.timeState =false;
                                //$scope.timeState = false;
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

        }
        //更多
        //$scope.moreDataCanBeLoaded=function(){
        //    return hasmore;
        //};
        //跳转预约挂号详情
        $scope.onAppointRecordListTap = function(appointList) {
            AppointmentRegistDetilService.ROUTE_STATE="appointment_regist_list";
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
                if(data.isSupportMerge==1){
                    paydata["AMOUNT"] = data.USER_PAY_AMOUNT;
                    amount=data.USER_PAY_AMOUNT;
                    data["PREFERENTIAL_FEE"]="";
                }
                // wangchengcheng 2016年1月20日14:44:56 KYEEAPPC-4852
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
            OperationMonitor.record("countOnGoToPay", "appointment_regist_list");

        };
        //挂号后支付，继续支付按钮goToPayRegist
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
                // wangchengcheng 2016年1月20日14:44:56 KYEEAPPC-4852
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
            })
            OperationMonitor.record("countGoToPayRegist", "appointment_regist_list");
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
            OperationMonitor.record("countReappoint", "appointment_regist_list");
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
            OperationMonitor.record("countAgainAppoint", "appointment_regist_list");
        };
        //去点评  By  张家豪  KYEEAPPC-3292
        $scope.goToComment = function(appointList) {
            AppointmentRegistListService.goToComment(appointList);
            OperationMonitor.record("countGoToComment", "appointment_regist_list");
        };
        //去查看评分
        //KYEEAPPC-4351 wangwan 顶级评分查看评分
        $scope.goToSeeComment = function(appointList,event) {
            AppointmentRegistListService.goToSeeComment(appointList);
            OperationMonitor.record("countToSeeComment", "appointment_regist_list");
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
            OperationMonitor.record("countConsultDoctor", "appointment_regist_list");
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
            OperationMonitor.record("countAppointListToDoctorInfo", "appointment_regist_list");
        };

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
            OperationMonitor.record("countAppointListToDoctorInfo", "appointment_regist_list");
        };
    })
    .build();

