/*
* 产品名称：quyiyuan
* 创建人: 李治虎
* 创建日期:2017年6月17日
* 创建原因：我的会诊记录主页面controller
* 对应路由: consulationnote
* 备注: 该页面目前从 我的->我的会诊记录 入口进入 需要的参数如下:
*  1.  LoginService.MDT_AND_RPP: 用户登录时会将该值保存在LoginService中，该值标识当前就诊者有哪些会诊类型
*   其他的数据都是调用ConsulationNoteService查询记录接口所得
*/
new KyeeModule()
    .group("kyee.quyiyuan.consulation.note.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.consulation.note.service",
        "kyee.quyiyuan.consulation.note.detail.service",
        "kyee.quyiyuan.login.service",
        "kyee.quyiyuan.appointment.appointment_regist_detil.service",
        "kyee.quyiyuan.appointment.doctor_detail.service",
        "kyee.quyiyuan.appointment.appointment_doctor.service",
        "kyee.quyiyuan.payOrder.controller",
        "kyee.quyiyuan.appoint.appoint_appointConfirm.service",
        "kyee.quyiyuan.myquyi.my_care_doctors.service",
        "kyee.quyiyuan.hospital.hospital_selector.service"
    ])
    .type("controller")
    .name("ConsulationNoteController")
    .params(['$scope', '$filter', '$timeout', '$interval', '$state', '$ionicHistory', '$ionicScrollDelegate',
        'KyeeUtilsService', 'KyeeListenerRegister', 'KyeeI18nService', "KyeeMessageService", "CacheServiceBus",
        'ConsulationNoteDetailService', 'ConsulationNoteService', "LoginService", "UploadMaterialService",
        'AppointmentRegistDetilService', 'AppointmentDoctorDetailService', 'AppointmentDoctorService',
        'AppointConfirmService', 'MyCareDoctorsService', 'HospitalSelectorService','PayOrderService'])
    .action(function ($scope, $filter, $timeout, $interval, $state, $ionicHistory, $ionicScrollDelegate,
                      KyeeUtilsService, KyeeListenerRegister, KyeeI18nService, KyeeMessageService, CacheServiceBus,
                      ConsulationNoteDetailService, ConsulationNoteService, LoginService, UploadMaterialService,
                      AppointmentRegistDetilService, AppointmentDoctorDetailService, AppointmentDoctorService,
                      AppointConfirmService, MyCareDoctorsService, HospitalSelectorService,PayOrderService) {
        //进入页面进行监听事件
        KyeeListenerRegister.regist({
            focus: "consulationnote",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function(params){
                initView();
            }
        });

        /**
         * [action 监听物理返回键]
         */
        KyeeListenerRegister.regist({
            focus: "consulationnote",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goBack();
            }
        });

        /**
         * 初始化页面参数
         */
        function initView(){
            //初始化分页参数
            $scope.mdtCurrentPage = -1;
            $scope.mdtPageSize = 100;
            $scope.rppCurrentPage = -1;
            $scope.rppPageSize = 100;

            //初始化将mdt和rpp数据置为空
            $scope.mdtList = [];
            $scope.rppList = [];

            //是否加载更多
            $scope.hasmore = false;
            $scope.noData = false;
            //倒计时定时器数组，保存继续支付的定时器
            $scope.timer = [];

            //就诊者的会诊记录: 'NONE', 'MDT'(只有MDT), 'RPP'(只有RPP), 'BOTH'(两个都有),'ORDINARY'(远程会诊)
            $scope.MDT_AND_RPP = LoginService.MDT_AND_RPP;
            switch($scope.MDT_AND_RPP) {
                case 'NONE':
                    $scope.noData = true;
                    break;
                case 'MDT':
                    $scope.activeTab = 'MDT';
                    $scope.loadMoreMDT();
                    break;
                case 'RPP':
                    $scope.activeTab = 'RPP';
                    $scope.loadMoreRPP();
                    break;
                case 'BOTH':
                    $scope.activeTab = 'MDT';
                    //从详情页返回后 展示进入详情页之前的tab
                    var  type = ConsulationNoteDetailService.consType;
                    if (type === 'MDT' || type === 'RPP') { //不是从‘我的’页面进来 取缓存中的type
                        $scope.activeTab = type;  //
                        ConsulationNoteDetailService.consType = null;
                    }
                    $scope.loadMoreMDT();
                    $scope.loadMoreRPP();
                    break;
                default:
                    $scope.noData = true;
            }

        }

        /**
         * 为mdt数据和rpp数据设置支付倒计时
         * @param {*} item mdt或者rpp数据
         */
        function setTimer(item) {
            var remainTime = item.REMAIN_TIME;
            if (remainTime!=""&&remainTime&&remainTime > 0) {
                //remainTime是毫秒
                item.remainTimeShow = payRemainTime(remainTime);
                var timer = $interval(function(){
                    remainTime -= 1;
                    if (remainTime > 0) {
                        var timeShow = payRemainTime(remainTime);
                        item.remainTimeShow = timeShow;
                    } else {
                        item.remainTimeShow = null;
                        $interval.cancel(timer);
                        item.statusText = '支付失败';
                        item.btn = '重新支付';
                        item.goRouter = 'appoint_confirm';  //跳转至确认预约页面
                        //触发一次调用获取预约挂号详情的接口
                        var param = {
                            regId: item.REG_ID,
                            hospitalId: item.HOSPITAL_ID || item.hospitalIdXian  //mdt的数据有HOSPITAL_ID, rpp的数据有hospitalIdXian
                        };
                        AppointmentRegistDetilService.queryAppointRegistParaDetil(param);
                    }
                }, 1000);
                $scope.timer.push(timer);
            } else {
                item.statusText = '支付失败';
                item.btn = '重新支付';
                item.goRouter = 'appoint_confirm';  //跳转至确认预约页面
            }
        }
        var payRemainTime = function(remainTime){
            var remainTimeSecond = remainTime;
            var hour= Math.floor(remainTimeSecond / (60*60));//小时
            var minute = Math.floor((remainTimeSecond/60)%(60));//分钟
            var second = Math.floor(remainTimeSecond % 60);//秒
            var timeShow="";
            if (second < 10) {
                second = '0' + second;
            }
            if(hour>0){
                if (minute < 10) {
                    minute = '0' + minute;
                }
                timeShow=hour+':'+ minute + ':' + second
            }else{
                timeShow=minute + ':' + second
            }
            return timeShow;
        };

        /**
         * 处理MDT会诊记录列表数据
         * @param mdtList
         */
        function handlerMDTlist(mdtList){
            var doctorDetail={}, appointType;
            mdtList.forEach(function(item){
                    item.date = $filter('date')(new Date(item.startDate), 'yyyy/MM/dd');
                    if (item.doctorList.length >= 2) {
                        doctorDetail = item.doctorList[1].doctorDetail;   //第一个是发起医生，后面的是受邀医生
                    } else {
                        doctorDetail.hospitalName = item.receiveHospitalName;
                        doctorDetail.deptName = item.deptName;
                    }
                    item.MDTTeam = doctorDetail.hospitalName + '-' + doctorDetail.deptName;
                    item.sexText = item.patientSex === 'MALE' ? '男' : '女';
                    appointType = parseInt(item.appointType);
                    item.showRightArrow = Boolean(item.REG_ID); //是否展示右箭头
                    switch (item.status) {
                        case 'toBePaid':
                                switch (item.payNavigation) {
                                    case 'continuePay':
                                        item.statusText = '待支付';
                                        item.btn = '继续支付';
                                        item.goRouter = 'payOrder';  //跳转至支付页面

                                        if (appointType === 7) { //占号成功
                                            //设置支付倒计时
                                            setTimer(item);
                                        } else if (appointType === 0) {
                                            item.statusText = '待支付';
                                            item.btn = '继续支付';
                                            item.goRouter = 'appointment_regist_detil';
                                        } else {
                                            item.statusText = '支付失败';
                                            item.btn = '重新支付';
                                            item.goRouter = 'appoint_confirm';  //跳转至确认预约页面
                                        }
                                        break;
                                    case 'immediatePay':
                                        if((item.type === "" || item.type === null || item.type=="ORDINARY") && (typeof item.applyDto!="object"
                                                || (item.applyDto!=null && typeof item.applyDto.variables != "object") ||
                                                (item.applyDto.variables!=null && (typeof item.applyDto.variables.needPay === "undefined" || item.applyDto.variables.needPay==false)) )){
                                            if(item.doctorList.length >= 2){
                                                item.statusText = '待会诊';
                                            }else{
                                                item.statusText = '待支付';
                                            }
                                            item.btn = '';
                                        }else{
                                            item.statusText = '待支付';
                                            item.btn = '确认支付';
                                            item.goRouter = 'appoint_confirm';             //跳转至支付页面
                                        }
                                        break;
                                    case 'rePay':
                                        item.statusText = '支付失败';
                                        item.btn = '重新支付';
                                        item.goRouter = 'appoint_confirm';              //跳转至预约挂号详情页
                                        break;
                                    default:
                                        if (item.REG_ID == undefined) {
                                            item.statusText = '待支付';
                                            item.btn = '确认支付';
                                            item.goRouter = 'appoint_confirm';             //跳转至支付页面
                                            break;
                                        } else {
                                            if (appointType === 8) {
                                                item.statusText = '已支付';
                                                item.goRouter = 'appointment_regist_detil';
                                            } else if (appointType === 2) {
                                                item.statusText = '支付失败';
                                            } else if (appointType === 1) {
                                                item.statusText = '已支付';
                                                item.btn = '';
                                            } else {
                                                item.statusText = '待支付';
                                            }
                                            item.btn = '';
                                        }
                            }
                            break;
                        case 'applyInitiatePassed':  //待受邀医院审核
                            item.statusText = '待会诊';
                            item.btn = item.fileList.length === 0 ? '上传资料' : '完善资料';
                            item.goRouter = 'uploadMaterial';       //跳转至上传资料页面
                            break;
                        case 'scheduled':            //待会诊
                            item.statusText = '待会诊';
                            item.btn = item.fileList.length === 0 ? '上传资料' : '完善资料';
                            item.goRouter = 'uploadMaterial';      //跳转至上传资料页面
                            break;
                        case 'awaiting':             //等待开始
                            item.statusText = '待会诊';
                            item.btn = item.fileList.length === 0 ? '上传资料' : '完善资料';
                            item.goRouter = 'uploadMaterial';      //跳转至上传资料页面
                            break;
                        case 'ongoing':              //进行中
                            item.statusText = '会诊中';
                            break;
                        case 'finished':             //已完成
                            item.statusText = '会诊结束';
                            item.btn = '会诊报告';
                            item.goRouter = 'consulationnotereport'; //跳转至会诊报告页面
                            break;
                        case 'cancelled':             //已取消
                            item.statusText = '已取消';
                            break;
                        default:
                            item.btn = '';
                    }
                    //不管上海返的状态的情况
                    if (appointType === 4 && !item.payNavigation) { //取消失败
                        item.statusText = '取消失败';
                        item.btn = '';
                    } else if (appointType === 11) {                //取消中
                        item.statusText = '取消中';
                        item.btn = '';
                    } else if (appointType === 3) {
                        item.statusText = '已取消';
                        item.btn = '';
                        if (item.PAY_STATUS == undefined) {
                            item.btn = '重新支付';
                            item.goRouter = 'appoint_confirm';
                        }
                    }

                    var payStatusApp = parseInt(item.PAY_STATUS);
                    if (payStatusApp === 2) {
                        item.subText = '已支付';
                    } else if (payStatusApp === 4) {
                        item.subText = '退费中';
                    } else if (payStatusApp === 5) {
                        item.subText = '已退费';
                    } else {
                        if (typeof item.HANDLE_MESSAGE === 'string' && item.HANDLE_MESSAGE.indexOf('超时未付费') > -1 && appointType === 2) {
                            item.subText = '超时未支付';
                        }
                    }
            });
        }

        //加载更多
        $scope.loadMoreMDT = function(){
            var param = {
                currentPage: ++$scope.mdtCurrentPage,
                pageSize: $scope.mdtPageSize,
                showLoading: $scope.activeTab === 'MDT'
            };
            ConsulationNoteService.getMdtList(param, function(mdtList){
                if (mdtList.length > 0) {
                    handlerMDTlist(mdtList);
                    $scope.mdtList = $scope.mdtList.concat(mdtList);
                }
                judgeNoData();
                $scope.$broadcast('scroll.refreshComplete');
            }, function(res) {
                --$scope.mdtCurrentPage;
                judgeNoData();
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        /**
         * 处理RPP会诊记录列表数据
         * @param rppList
         */
        function handlerRPPlist(rppList){
            var consultationState, appointType, formatDate = $filter('date'),
                payStatus;
            rppList.forEach(function(item){
                appointType = parseInt(item.appointType);
                consultationState = item.consultationState;
                payStatus = parseInt(item.payStatus);
                item.date = formatDate(new Date(item.subTime), 'yyyy/MM/dd');  //申请日期
                item.showRightArrow = Boolean(item.REG_ID); //是否展示右箭头
                if (consultationState === '00600020') {  //上海端状态-已提交病例, PAY_STATUS为空 // && !item.PAY_STATUS
                    if (payStatus === 2) {
                        item.statusText = '待诊断';
                        item.btn = '';
                    } else if (appointType === 0 || appointType === 7) {
                        item.statusText = '待支付';
                        item.btn = '继续支付';
                        item.goRouter = 'payOrder';
                        if (appointType === 7) {
                            //设置支付倒计时
                            setTimer(item);
                        } else if (appointType === 0) {
                            item.goRouter = 'appointment_regist_detil';
                        }
                    } else if (appointType === 8) {
                        item.statusText = '已支付';
                    } else if (appointType === 2) {
                        item.statusText = '支付失败';
                        if (item.payNavigation == 'rePay') {
                            item.goRouter = 'appoint_confirm';
                            item.btn = '重新支付';
                        }
                    }  else if(appointType === 1){  //预约成功
                        item.statusText = '已支付';
                        item.btn = '';
                    } else {    //无记录
                        item.statusText = '待支付';
                        item.btn = '确认支付';
                        item.goRouter = 'appoint_confirm';
                    }
                } else if (consultationState === '00600060') {  //上海端状态-已签发报告
                    item.statusText = '已诊断';
                } else if (consultationState === '00600080') { //上海端状态-已取消会诊
                    item.statusText = '已取消';
                } else { //'00600030'(上海端状态-已分配病历),'00600040'(上海端状态-已生成报告),'00600050','00600070'
                    item.statusText = '待诊断';
                }

                //不关心上海状态
                if (appointType === 11) {        //取消中
                    item.statusText = '取消中';
                    item.btn = '';
                } else if (appointType === 4) {  //取消失败
                    item.statusText = '取消失败';
                    item.btn = '';
                } else if (appointType === 3) {  //取消成功
                    item.statusText = '已取消';
                    item.btn = '';
                    if (item.PAY_STATUS == undefined) {
                        item.goRouter = 'appoint_confirm';
                        item.btn = '重新支付';
                    }
                }
                var payStatusApp = parseInt(item.PAY_STATUS);//费用状态
                if (payStatusApp === 2) {
                    item.subText = '已支付';
                } else if (payStatusApp === 4) {
                    item.subText = '退费中';
                } else if (payStatusApp === 5) {
                    item.subText = '已退费';
                } else {
                    if (typeof item.HANDLE_MESSAGE === 'string' && item.HANDLE_MESSAGE.indexOf('超时未付费') > -1 && appointType === 2) {
                        item.subText = '超时未支付';
                    }
                }
            });
        }

        //加载更多rpp数据
        $scope.loadMoreRPP = function(){
            var param = {
                currentPage: ++$scope.rppCurrentPage,
                pageSize: $scope.rppPageSize,
                showLoading: $scope.activeTab === 'RPP'
            };
            ConsulationNoteService.getRppList(param, function(rppList){
                if (rppList.length > 0) {
                    handlerRPPlist(rppList);
                    $scope.rppList = $scope.rppList.concat(rppList);
                }
                judgeNoData();
                $scope.$broadcast('scroll.refreshComplete');
            }, function(res) {
                --$scope.rppCurrentPage;
                judgeNoData();
                $scope.$broadcast('scroll.refreshComplete');
            });
        };

        /**
         * 切换tab
         * @param tab
         */
        $scope.toggleTab = function(tab){
            $scope.activeTab = tab;
            var handler = $ionicScrollDelegate.$getByHandle('consolutionNote'),
                position = handler.getScrollPosition();
            if ($scope.lastPosition) {
                var lastPosition = $scope.lastPosition;
                handler.scrollTo(lastPosition.left, lastPosition.top, false);
                $scope.lastPosition = position;
            } else {
                $scope.lastPosition = position;
                handler.scrollTop(false);
            }
        };

        /**
         * 返回操作
         */
        $scope.goBack = function(){
            $state.go('center->MAIN_TAB');
        };

        /**
         * 跳转至会诊记录详情页
         * @param item
         */
        $scope.goDetail = function(item){
            ConsulationNoteDetailService.consType = item.type;//'MDT', 'RPP'
            if (item.type === 'MDT'||item.type === 'ORDINARY'||item.type === ""||item.type === null) {
                ConsulationNoteDetailService.data = item.applyDto.reservationId;
            } else {
                ConsulationNoteDetailService.consType = 'RPP';
                ConsulationNoteDetailService.consultPatientKeyId = item.consultPatientKeyId;
            }
            $state.go('consulationnotedetail');
        };

        /**
         * 跳转至会诊报告页面，只有MDT有会诊报告页面
         * @param item
         */
        $scope.goReport = function(item){
            ConsulationNoteDetailService.reportData = item;
            $state.go('consulationnotereport');
        };

        /**
         * 下拉刷新
         */
        $scope.onRefreshBtn = function(){
            $scope.currentPage = -1;
            $scope.mdtList = [];
            $scope.loadMore();
        };

        /**
         * 跳转至上传资料页面 只有MDT有会诊报告页面
         * @param reservationId
         * @param fileList
         */
        $scope.goToUploadMaterial = function(reservationId, fileList){
            UploadMaterialService.UPLOAD_IMGLIST = fileList;
            UploadMaterialService.reservationId = reservationId;
            $state.go("uploadMaterial");
        };

        /**
         * 跳转至确认预约页面
         * 首先要获取医生排班(调用获取医生列表的接口，在返回的医生数据里有医生排班)，取医生排班的第一条数据，然后根据此数据查询医生号源
         * 将查询到的数据赋值给service，再跳转页面
         */
        $scope.goToAmppointConfirm = function(item){
            var param = {}, deptName,hbTime;
            param.hid="";
            if (item.type === 'MDT') {  //MDT和RPP数据格式不一样
                var doctorDetail = item.doctorList[1].doctorDetail;  //doctorDetail是上海端返回的数据的医生信息
                param.hospitalId = doctorDetail.hospitalCodeXian;
                param.doctorCode = doctorDetail.doctorCodeXian;
                param.deptCode = doctorDetail.deptCodeXian;
                param.assignDate = $filter('date')(new Date(item.startDate), 'yyyy/MM/dd'); //MDT需要传日期
                param.consultationFlag = item.type;
                deptName = doctorDetail.deptName;
            }  else if(item.type === 'ORDINARY'){
                var doctorDetail = item.doctorList[1].doctorDetail;  //doctorDetail是上海端返回的数据的医生信息
                param.hospitalId = doctorDetail.hospitalCodeXian;
                param.doctorCode = doctorDetail.doctorCodeXian;
                param.deptCode = doctorDetail.deptCodeXian;
                param.assignDate = $filter('date')(new Date(item.startDate), 'yyyy/MM/dd'); //MDT需要传日期
                param.consultationFlag = item.type;
                hbTime = $filter('date')(new Date(item.startDate), 'a');
                if(hbTime === "AM"){
                    hbTime = "上午";
                }else if(hbTime === "PM"){
                    hbTime = "下午";
                }
                deptName = doctorDetail.deptName;
                if(item.reservationPayment!=null&&item.reservationPayment!=""&&item.reservationPayment!=undefined&&item.reservationPayment.hid){
                    param.hid = item.reservationPayment.hid;
                }
                else{
                    param.hid = "";
                }
            }else{    //RPP 不用传doctorCode
                param.hospitalId = item.hospitalIdXian;
                param.deptCode = item.deptCodeXian;
                param.consultationFlag = 'RPP';
                deptName = item.deptName; //后面跳确认预约页面会用到
            }
            AppointmentDoctorDetailService.getDoctorList(param, function (data) {  //获取医生列表，传了doctorCode，则只获取该医生的信息，包括排班
                var rows = data.rows;
                var ARCHIVE_FEE;
                if (rows.length > 0) {
                    var doctorInfo, schedule;   //取第一条数据 因为接口传了doctorCode  所以只有这一个医生，西安端返回的医生信息
                    for (var i = 0, len = rows.length; i < len; i++) {  //取第一个有排班的医生的最后一个排班
                        var scheduleList = rows[i].DOCTOR_SCHEDULE_LIST;
                        if(param.hid!=""&&item.type === 'ORDINARY') {
                            if (scheduleList.length > 0) {
                                for (var j = 0; j < scheduleList.length; j++) {
                                    doctorInfo = rows[i];
                                    if (scheduleList[j].CLINIC_DURATION === hbTime && scheduleList[j].CLINIC_DATE === param.assignDate) {
                                        schedule = scheduleList[j];
                                        ARCHIVE_FEE = scheduleList[j].SUM_FEE;
                                        break;
                                    }
                                }
                            }
                        }else{
                            if (scheduleList.length > 0) {
                                doctorInfo = rows[i];
                                schedule = scheduleList[0];
                                break;
                            }
                        }
                    }
                    if (schedule) { //若是有排班

                        // 查询预约号源所需参数-包括(hospitalId, deptCode, doctorCode)----start
                        param.doctorCode = doctorInfo.DOCTOR_CODE;
                        param.clinicDate = schedule.CLINIC_DATE;                                    //就诊日期
                        param.IS_ONLINE = schedule.IS_ONLINE_SCHEDULE;
                        param.hisScheduleId = schedule.HIS_SCHEDULE_ID;                             //可不传
                        param.userVsId = MEMORY_CACHE_STORE.currentCustomPatient.value.USER_VS_ID;  //就诊者id
                        param.hbTime = schedule.CLINIC_DURATION;//午别: 上午/下午
                        if(item.type==''||item.type==null||item.type==undefined){
                            item.type = 'RPP';
                        }
                        param.consultationFlag = item.type;
                        // 查询预约号源所需参数-包括(hospitalId, deptCode, doctorCode)----end
                        AppointmentDoctorService.queryAppointSource(param, function (res) {  //查询预约号源
                            if (!res.success) {
                                KyeeMessageService.broadcast({
                                    content: res.message,
                                    duration: 2000
                                });
                                return;
                            }
                            var data = res.data;
                            AppointmentDoctorDetailService.CLINIC_SOURCE = {};//清除掉选择号源控件的数据，以防止预约挂号不选择号源时，该服务数据不空导致的问题
                            if(param.hid!=""&&item.type === 'ORDINARY'){
                                AppointmentDoctorDetailService.ARCHIVE_FEE = ARCHIVE_FEE;
                            }else {
                                AppointmentDoctorDetailService.ARCHIVE_FEE = data.ARCHIVE_FEE;
                            }
                            //想确认预约服务中传入号源数据、排班数据
                            AppointmentDoctorDetailService.selSchedule = schedule;
                            AppointmentDoctorDetailService.CLINIC_DETAIL = data;
                            if(param.hid!=""&&item.type === 'ORDINARY'){
                                AppointmentDoctorDetailService.CLINIC_DETAIL.rows[0].HID = param.hid;
                            }
                            AppointmentDoctorDetailService.doctorInfo = {
                                DOCTOR_NAME: doctorInfo.DOCTOR_NAME,
                                DOCTOR_TITLE: doctorInfo.DOCTOR_TITLE,
                                HOSPITAL_NAME: doctorInfo.HOSPITAL_NAME,
                                DEPT_CODE: doctorInfo.DEPT_CODE,
                                DEPT_NAME: doctorInfo.DEPT_NAME || deptName,
                                DOCTOR_CODE: doctorInfo.DOCTOR_CODE
                            };
                            var tmpData = {};
                            if (item.type === 'MDT') {
                                tmpData.consultationFlag = 'MDT';
                                tmpData.reservationId = item.applyDto.reservationId;
                            } else if(item.type === 'ORDINARY'){
                                tmpData.consultationFlag = 'ORDINARY';
                                tmpData.reservationId = item.applyDto.reservationId;
                            } else{
                                tmpData.consultationFlag = 'RPP';
                                tmpData.consultPatientKeyId = item.consultPatientKeyId;
                            }
                            if (item.btn === '重新支付') {
                                tmpData.REG_ID = item.REG_ID;
                            }
                            AppointConfirmService.consulationData = tmpData;
                            //判断该医院与所选医院是否相同，若不同，则切换本地缓存医院
                            var localHospitalId = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO).id;
                            if (parseInt(localHospitalId) === parseInt(param.hospitalId)) {
                                $state.go("appoint_confirm");
                            } else { //切换医院
                                var hospitalId = param.hospitalId;
                                MyCareDoctorsService.queryHospitalInfo(hospitalId, function (res) {  //查询医院信息
                                    HospitalSelectorService.selectHospital(hospitalId, res.HOSPITAL_NAME, // 切换医院
                                        res.MAILING_ADDRESS, res.PROVINCE_CODE, res.PROVINCE_NAME,
                                        res.CITY_CODE, res.CITY_NAME, "医院正在切换中...", function (response) {
                                            $state.go("appoint_confirm");
                                        });
                                });
                            }
                        });
                    } else {
                        KyeeMessageService.broadcast({
                            content: '暂无可预约排班',
                            duration: 2000
                        });
                    }
                } else {
                    KyeeMessageService.broadcast({
                        content: '暂无可预约会诊医生',
                        duration: 2000
                    });
                }
            });
        }
        /**
         * 待支付，已创建预约挂号记录，处理中
         * 跳转至预约挂号详情页面
         */
        $scope.goToAppointDetail = function(item){
            if (!item.showRightArrow){return;}
            AppointmentRegistDetilService.ROUTE_STATE = "consulationnote";
            AppointmentRegistDetilService.RECORD = {
                REG_ID: item.REG_ID,
                HOSPITAL_ID: item.HOSPITAL_ID || item.hospitalIdXian
            };
            AppointmentRegistDetilService.isConsulotion = true;  //标记为会诊医生
            $state.go("appointment_regist_detil");
        };

        /**
         * 跳转至支付页面
         * TODO
         */
        $scope.goToPay = function(item){
            $scope.WARN_MSG = item.CONSULTATION_FEE_TIPS;
            if($scope.WARN_MSG!=null&&$scope.WARN_MSG!=undefined&&$scope.WARN_MSG!=''){
                var dialog = KyeeMessageService.dialog({
                    tapBgToClose : true,
                    template: "modules/business/appointment/views/delay_views/warmPrompt.html",
                    scope: $scope,
                    title:"知情同意书",
                    buttons: [
                        {
                            text: "取消",
                            click: function () {
                                dialog.close();
                            }
                        },
                        {
                            text:  "确认",
                            style:'button-size-l',
                            click: function () {
                                dialog.close();
                                goToPay(item);
                            }
                        }
                    ]
                });
            }else{
                goToPay(item);
            }
        };
        var goToPay = function(item){
            var toPayPara = {
                hospitalId:item.HOSPITAL_ID,
                patientId: item.PATIENT_ID,
                userId:item.USER_ID,
                cRegId: item.REG_ID,
                markDesc: item.MARK_DESC,
                Amount:item.AMOUNT,
                CARD_NO: item.CARD_NO
                // CARD_PWD: AppointmentCreateCardService.password,
                // IS_CREATE_CARD:isCreateCard
            };
            AppointmentRegistDetilService.goToPay(toPayPara, function (data){
                PayOrderService.payData = {
                    hospitalID: item.HOSPITAL_ID || item.hospitalIdXian,    //必传，支付页面获取支付方式会使用此医院id
                    REMAIN_SECONDS: item.remainTime/1000,  //支付剩余时间
                    PAY_DEADLINE: item.regCreateTime + item.payLimitTime,   //支付截止时间
                    // AMOUNT: parseFloat(item.amount).toFixed(2),
                    AMOUNT: item.AMOUNT,
                    USER_PAY_AMOUNT: item.AMOUNT,
                    TRADE_NO: data.OUT_TRADE_NO,
                    MARK_DESC: item.MARK_DESC,
                    MARK_DETAIL: item.MARK_DETAIL,
                    ROUTER: "consulationnote",
                    flag: 3,                         //用于支付页面 取消支付的状态：1 挂号 2：预约转挂号 3预约缴费
                    CARD_NO: item.CARD_NO,
                    CARD_TYPE: item.CARD_TYPE,
                    PATIENT_ID: item.PATIENT_ID,
                    C_REG_ID: item.REG_ID,
                    REG_ID: item.REG_ID,
                    isShow: "0",
                    IS_OPEN_BALANCE: "fail",
                    APPOINT_SUCCESS_PAY: 1, //
                    // PAY_DEADLINE: new Date(item.regCreateTime + item.payLimitTime),

                    PREFERENTIAL_LIST: '',
                    FEE_TYPE: '',
                    PRE_PAY_MARK: "" //抢号预付费标识;1表示是预付费数据 TODO
                };
                $state.go('payOrder');
            })
        };
        /**
         * 按钮点击处理
         * @param item
         */
        $scope.handlerBtn = function(item){
            switch (item.goRouter){
                case 'appointment_regist_detil':  //预约挂号详情
                    $scope.goToAppointDetail(item);
                    break;
                case 'appoint_confirm':           //确认预约页面
                    $scope.goToAmppointConfirm(item);
                    break;
                case 'uploadMaterial':            //上传资料页面
                    $scope.goToUploadMaterial(item.applyDto.reservationId,item.fileList);
                    break;
                case 'consulationnotereport':     //会诊报告页面
                    $scope.goReport(item);
                    break;
                case 'payOrder':     //会诊报告页面
                    $scope.goToPay(item);
                    break;
                default:
                    $scope.goDetail(item);
            }
        };

        /**
         * 判断有无数据
         */
        function judgeNoData(){
            $scope.noData = $scope.mdtList.length === 0 && $scope.rppList.length === 0;
        }

        /**
         * 当前页面离开时候的监听
         */
        $scope.$on("$ionicView.leave", function(event, data){
            if ($scope.timer.length > 0) { //销毁定时器
                $scope.timer.forEach(function(timer, index, arr) {
                    if(timer) {
                        $interval.cancel(timer);
                        arr[index] = undefined;
                    }
                });
            }
            ConsulationNoteDetailService.consType = $scope.activeTab;
        });
    })
    .build();