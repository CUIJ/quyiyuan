/**
 * 产品名称：quyiyuan
 * 创建用户：张毅
 * 日期：2017年4月20日
 * 创建原因：等待接诊页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.consultation.wait_chatting.controller")
    .require([
        "kyee.quyiyuan.consultation.order.controller",
        "kyee.quyiyuan.patients_group.personal_chat.service",
        "kyee.quyiyuan.myquyi.my_care_doctors.service",
        "kyee.quyiyuan.hospital.hospital_selector.service",
        "kyee.quyiyuan.appointment.doctor_detail.service",
        "kyee.quyiyuan.appointment.service",
        "kyee.quyiyuan.consultation.consult_satisfaction.controller"
    ])
    .type("controller")
    .name("WaitChattingController")
    .params(["$scope", "$state", "$ionicHistory", "$interval",
        "KyeeUtilsService", "KyeeListenerRegister", "KyeeViewService", "KyeeMessageService",
        "WaitChattingService", 'ConsultOrderDetailService', 'PersonalChatService',
        'MyCareDoctorsService', 'HospitalSelectorService', 'AppointmentDoctorDetailService', 'AppointmentDeptGroupService',
        "CenterUtilService", "CacheServiceBus", "$window"
    ])
    .action(function ($scope, $state, $ionicHistory, $interval,
        KyeeUtilsService, KyeeListenerRegister, KyeeViewService, KyeeMessageService,
        WaitChattingService, ConsultOrderDetailService, PersonalChatService,
        MyCareDoctorsService, HospitalSelectorService, AppointmentDoctorDetailService, AppointmentDeptGroupService,
        CenterUtilService, CacheServiceBus, $window) {
        // 0：订单生成，待支付 -> 跳转 支付页面 -> 返回 订单列表
        // 1：订单成功，待接诊 -> 跳转 接诊页面（等待接诊状态） -> 返回 订单列表
        // 2：订单成功，已接诊 -> 跳转 接诊页面（咨询医生状态） -> 返回 订单列表
        // 3：订单成功，已驳回 -> 跳转 接诊页面（重新发起咨询） -> 返回 订单列表
        // 4：订单超时，未支付 -> 跳转 订单详情页面 -> 返回 订单列表
        // 5：订单成功结束 -> 跳转 订单详情页面 -> 返回 订单列表
        // 6：订单失败 -> 跳转 订单详情页面 -> 返回 订单列表
        // 7：订单取消成功 -> 跳转 接诊页面（重新发起咨询） -> 返回 订单列表
        // 8：订单失效（医生不操作，超过订单有效时间）-> 跳转 接诊页面（重新发起咨询） -> 返回 订单列表
        // 9：订单逾期（医生已接诊，患者咨询超时）-> 跳转 订单详情页面 -> 返回 订单列表
        //10：已接诊未回拨（医生已接诊，规定时间内未回拨）-> 跳转 订单详情页面 -> 返回 订单列表
        //11：待评价（订单完成，用户待评价）-> 跳转 订单详情页面 -> 返回 订单列表
        var memoryCache = CacheServiceBus.getMemoryCache(); //全局参数
        var storageCache = CacheServiceBus.getStorageCache(); //缓存数据
        var taskID; //页面倒计时任务ID

        var orderStatusCode; //记录页面的当前状态值
        // 根据当前状态值确定页面展示数据
        var statusInfoList = {
            wait: {
                iconStyle: 'icon-status-wait qy-green', //状态图标样式
                text: '等待接诊', //状态名称
                textAlign: 'left', //补充说明信息对其方式
                notices: ["1.您的订单已提交，请耐心等待医生接诊；", //补充说明信息内容
                    "2.点击刷新按钮，查看订单的最新状态；",
                    "3.医生如果未接诊，订单费用将原路退还。"
                ],
                buttonText: '取消订单', //底部按钮显示信息
                isShowRefreshButton: true, //是否展示右上角取消订单按钮
                isShowHint: true
            },
            shareWait: {
                iconStyle: 'icon-status-wait qy-green', //状态图标样式
                text: '等待接诊', //状态名称
                textAlign: 'center', //补充说明信息对其方式
                notices: [], //补充说明信息内容
                buttonText: '取消订单', //底部按钮显示信息
                isShowRefreshButton: true, //是否展示右上角取消订单按钮
                isShowHint: true
            },
            cancelSuccess: {
                iconStyle: 'icon-status-success qy-green',
                text: '取消成功',
                textAlign: 'center',
                notices: ["您的咨询订单已经成功取消，订单产生的咨询费用将为您原路退还，感谢使用趣医院。"],
                buttonText: '重新发起咨询',
                isShowRefreshButton: false,
                isShowHint: false
            },
            cancelFail: {
                iconStyle: 'icon-status-fail color_red',
                text: '取消失败',
                textAlign: 'center',
                notices: ["抱歉，咨询订单取消失败，请重试"],
                buttonText: '重新取消',
                isShowRefreshButton: false,
                isShowHint: true
            },
            invalid: {
                iconStyle: 'icon-status-invalid qy-grey4',
                text: '超时未接诊',
                textAlign: 'center',
                notices: ["医生可能正在忙哦，超时未接诊，订单已经关闭，咨询费用将为您原路退还。"],
                buttonText: '重新发起咨询',
                isShowRefreshButton: false,
                isShowHint: false
            },
            shareInvalid: {
                iconStyle: 'icon-status-invalid qy-grey4',
                text: '超时未接诊',
                textAlign: 'center',
                notices: ["医生可能正在忙哦，超时未接诊，订单已经关闭，咨询费用将为您原路退还。"],
                buttonText: '重新发起咨询',
                isShowRefreshButton: false,
                isShowHint: false
            },
            rejected: {
                iconStyle: 'icon-status-no-pass color_red',
                text: '订单被驳回',
                textAlign: 'center',
                notices: ["医生驳回了您的咨询申请"],
                buttonText: '重新发起咨询',
                isShowRefreshButton: false,
                isShowHint: false
            },
            success: {
                iconStyle: 'icon-status-success qy-green',
                text: '医生已接诊',
                textAlign: 'center',
                notices: ["医生已接诊，快去和医生交流吧；订单有效时间内交流次数不限；医生工作较忙，如不能及时回复请耐心等待，多加谅解。"],
                buttonText: '发送消息',
                isShowRefreshButton: false,
                isShowHint: false
            },
            shareSuccess: {
                iconStyle: 'icon-status-success qy-green',
                text: '医生已接诊',
                textAlign: 'center',
                notices: [],
                buttonText: '发送消息',
                isShowRefreshButton: false,
                isShowHint: false
            },
            waitForPhone: {
                iconStyle: 'icon-phone-consult qy-green',
                text: '等待电话回拨',
                textAlign: 'center',
                notices: [],
                buttonText: '咨询完成',
                isShowRefreshButton: false,
                isShowHint: false
            },
            waitForVideo: {
                iconStyle: 'icon-video-consult qy-green',
                text: '等待视频回拨',
                textAlign: 'center',
                notices: [],
                buttonText: '咨询完成',
                isShowRefreshButton: false,
                isShowHint: false
            },
            unCallBack: {
                iconStyle: 'icon-status-invalid qy-grey4',
                text: '超时未回拨',
                textAlign: 'center',
                notices: [],
                buttonText: '重新发起咨询',
                isShowRefreshButton: false,
                isShowHint: false
            }
        };

        KyeeListenerRegister.regist({
            focus: "wait_chatting",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function () {
                initView();
            }
        });

        KyeeListenerRegister.regist({
            focus: "wait_chatting",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goBack();
            }
        });

        /**
         * 页面初始化加载事件
         * 从补充资料页面跳转时默认为等待接诊状态
         * 从订单列表跳转时，reloadData，再决定跳转到哪个页面(等待接诊页面／订单详情页面)
         */
        function initView() {
            if (ConsultOrderDetailService.isFromWeiXin) {
                ConsultOrderDetailService.consultOrderID = getQueryString("consultOrderID");
                ConsultOrderDetailService.getOrderDetail(function (data) {
                    if (ConsultOrderDetailService.orderDetail.orderState == 5 ||
                        ConsultOrderDetailService.orderDetail.orderState == 4 ||
                        ConsultOrderDetailService.orderDetail.orderState == 6 ||
                        ConsultOrderDetailService.orderDetail.orderState == 9) {
                        $state.go("consult_order_detail");
                    }
                    ConsultOrderDetailService.isFromWeiXin = false;
                    getBaseInfo();
                });
                return;
            }
            getBaseInfo();
        }

        /**
         * 等获取订单基本信息
         * */
        function getBaseInfo() {
            setHeadStatus(ConsultOrderDetailService.orderDetail.consultType);
            var consultName = '';
            switch (ConsultOrderDetailService.orderDetail.consultType) {
                case 1:
                    consultName = '图文咨询';
                    break;
                case 2:
                    consultName = '电话咨询';
                    break;
                case 3:
                    consultName = '视频咨询';
                    break;
                default:
                    consultName = '其他';
            }
            $scope.displayOrderDetail = {
                consultName: consultName,
                doctorName: ConsultOrderDetailService.orderDetail.doctorName,
                deptName: ConsultOrderDetailService.orderDetail.deptName,
                hospitalName: ConsultOrderDetailService.orderDetail.hospitalName,
                payAmount: ConsultOrderDetailService.orderDetail.free ? '免费咨询' : ConsultOrderDetailService.orderDetail.payAmount.toFixed(2) + "元"
            };
            reloadData();
        }

        /**
         *  获取URL参数
         */
        function getQueryString(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = $window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        };

        /**
         * 根据订单类型设置头部状态
         * @param consultType 1:图文；2:电话；3:视频
         */
        function setHeadStatus(consultType) {
            if (consultType == 1) {
                // 头部状态栏展示所需数据
                $scope.statusData = [{
                    'statusCode': 1,
                    'statusName': '补充资料'
                }, {
                    'statusCode': 2,
                    'statusName': '支付费用'

                }, {
                    'statusCode': 3,
                    'statusName': '等待接诊'
                }, {
                    'statusCode': 4,
                    'statusName': '咨询完成'
                }];
                $scope.consultTypeName = '图文咨询';
                $scope.currentStatusCode = '3'; //当前页面处于的状态-等待接诊
            } else if (consultType == 2 || consultType == 3) {
                // 头部状态栏展示所需数据
                $scope.statusData = [{
                    'statusCode': 1,
                    'statusName': '补充资料'
                }, {
                    'statusCode': 2,
                    'statusName': '支付费用'

                }, {
                    'statusCode': 3,
                    'statusName': '等待接诊'
                }, {
                    'statusCode': 4,
                    'statusName': '医生回拨'
                }, {
                    'statusCode': 5,
                    'statusName': '咨询完成'
                }];
                $scope.currentStatusCode = '3'; //当前页面处于的状态-等待接诊
                if (consultType == 2) {
                    $scope.consultTypeName = '电话咨询';
                } else {
                    $scope.consultTypeName = '视频咨询';
                }
            }
        }

        /**
         * 重新加载数据
         */
        function reloadData() {
            taskID && $interval.cancel(taskID);
            taskID = undefined;
            var orderDetail = ConsultOrderDetailService.orderDetail;
            if (orderDetail.orderState == 1) { //等待接诊页面
                if (orderDetail.isShare == 1 && orderDetail.shareScDoctorId != -1) { //共享订单抢单中，即抢单订单等待接诊状态
                    orderStatusCode = "shareWait";
                    var notice = "" + ConsultOrderDetailService.orderDetail.doctorName + "医生可能正在忙，超时未接诊，我们正在为您寻找其他医生，订单费用不产生变化，请耐心等待。";
                    if (statusInfoList[orderStatusCode].notices && statusInfoList[orderStatusCode].notices <= 0) {
                        statusInfoList[orderStatusCode].notices.push(notice);
                    }
                } else { //咨询订单等待接诊状态
                    orderStatusCode = "wait";
                }
                $scope.currentStatusInfo = statusInfoList[orderStatusCode]; //设置页面为等待接诊状态

                var remainTime = parseInt(orderDetail.doctorDueTime);
                var second = (remainTime % 3600) % 60;
                var minute = parseInt((remainTime % 3600) / 60);
                var hour = parseInt(remainTime / 3600);

                taskID = $interval(function () {
                    --second;
                    if (second < 0) {
                        --minute;
                        second = 59;
                    }
                    if (minute < 0) {
                        --hour;
                        minute = 59;
                    }
                    // 超时未接诊的状态，倒计时结束时请求一次更新接口
                    if (hour < 0) {
                        hour = 00;
                        minute = 00;
                        second = 00;

                        taskID && $interval.cancel(taskID);
                        taskID = undefined;
                        WaitChattingService.updateOrder(function (retVal) {
                            if (retVal.success) {
                                ConsultOrderDetailService.getOrderDetail(function (retVal) {
                                    if (retVal.success) {
                                        reloadData();
                                    }
                                }, function () {})
                            } else {
                                KyeeMessageService.broadcast({
                                    content: retVal.message,
                                    duration: 2000
                                });
                            }
                        }, function (retVal) {
                            KyeeMessageService.broadcast({
                                content: retVal.message,
                                duration: 2000
                            });
                        });
                    }
                    $scope.remainTime = '医生将于' + hour + '时' + minute + '分' + second + '秒' + '内接诊，超时订单将自动关闭'
                }, 1000);
            } else if (orderDetail.orderState == 2) { //已接诊状态
                if (orderDetail.consultType == 1) { //图文咨询
                    if (orderDetail.isShare == 1 && orderDetail.shareScDoctorId != -1 &&
                        orderDetail.shareScDoctorId !== 0) { //共享订单已接诊
                        orderStatusCode = "shareSuccess";
                        var notice = "" + ConsultOrderDetailService.orderDetail.hospitalName +
                            ConsultOrderDetailService.orderDetail.deptName +
                            ConsultOrderDetailService.orderDetail.doctorName + "医生已接诊，快去和医生交流吧";
                        if (statusInfoList[orderStatusCode].notices && statusInfoList[orderStatusCode].notices <= 0) {
                            statusInfoList[orderStatusCode].notices.push(notice);
                        }
                    } else { //咨询订单已接诊
                        orderStatusCode = "success";
                    }
                } else if (orderDetail.consultType == 2 || orderDetail.consultType == 3) { //电话／视频咨询
                    orderStatusCode = orderDetail.consultType == 2 ? "waitForPhone" : "waitForVideo";
                    var notice = "";
                    if (orderDetail.isShare == 1 && orderDetail.shareScDoctorId != -1 &&
                        orderDetail.shareScDoctorId !== 0) { //共享订单已接诊
                        notice = "" + ConsultOrderDetailService.orderDetail.hospitalName +
                            ConsultOrderDetailService.orderDetail.deptName +
                            ConsultOrderDetailService.orderDetail.doctorName;
                    }
                    notice += "医生将于" + orderDetail.remark + (orderDetail.consultType == 2 ? "之间回拨您的电话，请注意接听" : "之间向您发起视频请求，请注意接听");
                    if (statusInfoList[orderStatusCode].notices && statusInfoList[orderStatusCode].notices <= 0) {
                        statusInfoList[orderStatusCode].notices.push(notice);
                    }
                    $scope.currentStatusCode = '4'; //当前页面处于的状态-等待回拨
                }
                $scope.statusData[2].statusName = '医生接诊'; // 修改顶部状态栏显示
                $scope.currentStatusInfo = statusInfoList[orderStatusCode];
            } else if (orderDetail.orderState == 3) { //已驳回状态
                $scope.currentStatusCode = '0'; //置灰顶部状态条
                orderStatusCode = "rejected";
                if (statusInfoList[orderStatusCode].notices.length < 3) {
                    statusInfoList[orderStatusCode].notices.push('驳回原因：' + orderDetail.remark);
                    statusInfoList[orderStatusCode].notices.push('订单产生的咨询费用将为您原路退还。');
                }
                $scope.currentStatusInfo = statusInfoList[orderStatusCode];
            } else if (orderDetail.orderState == 7) { //订单取消成功状态
                $scope.currentStatusCode = '0'; //置灰顶部状态条
                orderStatusCode = "cancelSuccess";
                $scope.currentStatusInfo = statusInfoList[orderStatusCode];
            } else if (orderDetail.orderState == 8) { //医生未接诊导致订单超时
                $scope.currentStatusCode = '0'; //置灰顶部状态条
                if (orderDetail.isShare == 1) { //共享订单超时未接诊
                    orderStatusCode = "shareInvalid";
                    var notice = "" + ConsultOrderDetailService.orderDetail.hospitalName +
                        ConsultOrderDetailService.orderDetail.deptName + "医生较忙，暂无精力接诊，订单产生的费用将为您原路退还。";
                    if (statusInfoList[orderStatusCode].notices && statusInfoList[orderStatusCode].notices <= 0) {
                        statusInfoList[orderStatusCode].notices.push(notice);
                    }
                } else { //咨询订单超时未接诊
                    orderStatusCode = "invalid";
                }
                $scope.currentStatusInfo = statusInfoList[orderStatusCode];
            } else if (orderDetail.orderState == 10) { //医生已接诊，但是在规定时间内未回拨
                $scope.currentStatusCode = '0'; //置灰顶部状态条
                orderStatusCode = "unCallBack";
                var notice = orderDetail.consultType == 2 ? "医生未按时回拨您的电话，如订单产生费用，趣医将为您原路返还" : "医生未按时向您发起视频，如订单产生费用，趣医将为您原路返还。";
                if (statusInfoList[orderStatusCode].notices && statusInfoList[orderStatusCode].notices <= 0) {
                    statusInfoList[orderStatusCode].notices.push(notice);
                }
                $scope.currentStatusInfo = statusInfoList[orderStatusCode];
            } else if (orderDetail.orderState == 6) { //订单失败，跳转到订单详情页
                $state.go("consult_order_detail");
            }
            showWaitInfo();
        }

        /**
         * 跳转到医生主页
         */
        function goDoctorPage() {
            var orderDetail = ConsultOrderDetailService.orderDetail;
            var doctorToInfo = {
                DOCTOR_NAME: orderDetail.doctorName,
                DOCTOR_TITLE: orderDetail.doctorTitle,
                DOCTOR_CODE: orderDetail.doctorCode,
                DOCTOR_PIC_PATH: orderDetail.doctorPhoto
            };
            if (orderDetail.isShare == 1 && orderDetail.shareScDoctorId != -1 &&
                orderDetail.shareScDoctorId !== 0 && orderDetail.orderState == 10) {
                doctorToInfo = {
                    DOCTOR_NAME: orderDetail.shareDoctorName,
                    DOCTOR_TITLE: orderDetail.shareDoctorTitle,
                    DOCTOR_CODE: orderDetail.shareDoctorCode,
                    DOCTOR_PIC_PATH: orderDetail.shareDoctorPhoto
                };
            }
            var deptData = {
                DEPT_CODE: orderDetail.deptCode,
                DEPT_NAME: orderDetail.deptName,
                IS_ONLINE: orderDetail.isOnline,
                DOCTOR_NAME: doctorToInfo.DOCTOR_NAME,
                DOCTOR_TITLE: doctorToInfo.DOCTOR_TITLE,
                HOSPITAL_NAME: orderDetail.hospitalName
            };
            MyCareDoctorsService.queryHospitalInfo(orderDetail.hospitalId, function (retVal) {
                // 切换医院
                HospitalSelectorService.selectHospital(orderDetail.hospitalId, retVal.HOSPITAL_NAME,
                    retVal.MAILING_ADDRESS, retVal.PROVINCE_CODE, retVal.PROVINCE_NAME,
                    retVal.CITY_CODE, retVal.CITY_NAME, "医院正在切换中...",
                    function (retVal) {
                        //获取缓存中当前就诊者信息
                        var userVsId = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT).USER_VS_ID;
                        AppointmentDoctorDetailService.doctorInfo = {
                            HOSPITAL_ID: orderDetail.hospitalId,
                            DEPT_CODE: orderDetail.deptCode,
                            DEPT_NAME: orderDetail.deptName,
                            USER_VS_ID: userVsId,
                            DOCTOR_CODE: doctorToInfo.DOCTOR_CODE,
                            DOCTOR_NAME: doctorToInfo.DOCTOR_NAME,
                            DOCTOR_TITLE: doctorToInfo.DOCTOR_TITLE,
                            HOSPITAL_NAME: orderDetail.hospitalName,
                            DOCTOR_PIC_PATH: doctorToInfo.DOCTOR_PIC_PATH
                        };
                        //跳到医生列表页，将科室放入
                        AppointmentDeptGroupService.SELECT_DEPTGROUPDATA = deptData;
                        WaitChattingService.isFromWaitChattingPage = true;
                        AppointmentDoctorDetailService.activeTab = 1;
                        $state.go('doctor_info');
                    });
            });
        }

        /**
         * 跳转到聊天页面
         */
        function goChatPage() {
            var orderDetail = ConsultOrderDetailService.orderDetail;
            //聊天界面所需要的参数
            PersonalChatService.receiverInfo = {
                yxUser: orderDetail.doctorYxUser,
                userRole: 2,
                userPetname: orderDetail.doctorName,
                sex: orderDetail.doctorSex,
                userPhoto: orderDetail.doctorPhoto,
                visitName: orderDetail.patientName,
                scUserVsId: orderDetail.scUserVsId
            };

            PersonalChatService.consultParam = {
                scMsgType: 5,
                scRecordId: orderDetail.scConsultId,
                consultType: orderDetail.consultType,
                visitName: orderDetail.patientName,
                sex: orderDetail.patientSex,
                age: orderDetail.patientAge,
                diseaseName: orderDetail.diseaseName,
                diseaseDesc: orderDetail.diseaseDescription
            };
            PersonalChatService.fromView = true;
            PersonalChatService.goPersonalChat();
        }

        /**
         * 底部取消订单按钮点击事件
         */
        function doCancelOrder() {
            KyeeMessageService.confirm({
                title: "消息",
                content: "您的咨询订单已经成功提交给医生，是否仍要取消？",
                cancelText: "取消订单",
                okText: "继续等待",
                onSelect: function (select) {
                    if (typeof select === 'undefined') {
                        return;
                    } //若此时点击安卓物理返回键，会调用此方法，select 值为undefined
                    if (!select) {
                        WaitChattingService.cancelOrder(function (returnData) {
                            if (returnData.success) { //取消成功
                                taskID && $interval.cancel(taskID);
                                taskID = undefined;
                                $scope.doRefreshOrder();
                            } else { //取消失败
                                // orderStatusCode = "cancelFail";
                                // $scope.currentStatusInfo = statusInfoList[orderStatusCode];
                                KyeeMessageService.broadcast({
                                    content: returnData.message,
                                    duration: 2000
                                });
                                $scope.doRefreshOrder();
                            }
                        }, function (returnData) { //取消失败
                            // orderStatusCode = "cancelFail";
                            // $scope.currentStatusInfo = statusInfoList[orderStatusCode];
                            KyeeMessageService.broadcast({
                                content: returnData.message,
                                duration: 2000
                            });
                            $scope.doRefreshOrder();
                        });
                    }
                }
            });
        }

        /**
         * 结束订单,跳转到评价页面
         */
        function doFinishOrder() {
            //     param [Object：
            //                 scConsultId - 订单记录主键ID
            //                 orderState - 订单状态:9:咨询超时后完成 5：患者点击咨询完成]
            PersonalChatService.finishConsult({
                scConsultId: ConsultOrderDetailService.orderDetail.scConsultId,
                orderState: '5',
                showLoading: true
            }, function (retVal) {
                if (retVal.success) {
                    $state.go("consult_satisfaction");
                } else {
                    KyeeMessageService.broadcast({
                        content: retVal.message,
                        duration: 2000
                    });
                }
            }, function (retVal) {
                KyeeMessageService.broadcast({
                    content: retVal.message,
                    duration: 2000
                });
            });
        }

        /**
         * 底部按钮点击事件
         */
        $scope.doFooterButtonClick = function () {
            if (orderStatusCode === 'wait' || orderStatusCode === 'shareWait') { //等待接诊状态:取消订单
                doCancelOrder();
            } else if (orderStatusCode === 'cancelFail') { //取消失败:取消订单
                doCancelOrder();
            } else if (orderStatusCode === 'cancelSuccess') { //取消成功:跳转到医生首页
                taskID && $interval.cancel(taskID);
                taskID = undefined;
                goDoctorPage();
            } else if (orderStatusCode === 'success' || orderStatusCode === 'shareSuccess') { //医生已接诊:图文咨询-跳转到聊天页面；电话／视频咨询-结束订单
                taskID && $interval.cancel(taskID);
                taskID = undefined;
                goChatPage();
            } else if (orderStatusCode === 'waitForPhone' || orderStatusCode === 'waitForVideo') {
                var content = ConsultOrderDetailService.orderDetail.consultType == 2 ? '订单完成后将无法再接听医生的来电，确认完成？' : '订单完成后将无法再接听医生的视频申请，确认完成？';
                KyeeMessageService.confirm({
                    title: "消息",
                    content: content,
                    cancelText: "暂不确认",
                    okText: "确认完成",
                    onSelect: function (select) {
                        if (select) {
                            doFinishOrder();
                        }
                    }
                });
            } else if (orderStatusCode === 'rejected') { //医生已驳回:跳转到医生首页
                taskID && $interval.cancel(taskID);
                taskID = undefined;
                goDoctorPage();
            } else if (orderStatusCode === 'invalid' || orderStatusCode === 'shareInvalid') { //医生超时未接诊:跳转到医生首页
                taskID && $interval.cancel(taskID);
                taskID = undefined;
                goDoctorPage();
            } else if (orderStatusCode === 'unCallBack') { //医生已接诊，但是在规定时间内未回拨
                taskID && $interval.cancel(taskID);
                taskID = undefined;
                goDoctorPage();
            } else {
                var orderDetail = ConsultOrderDetailService.orderDetail;
                var errObj = {
                    msg: "orderStatusCode状态未找到：" + orderStatusCode,
                    data: JSON.stringify(orderDetail)
                }
                var error = new Error(JSON.stringify(errObj));
                clairvoyant.handleError(error);
            }
        };

        /**
         * 头部刷新按钮点击事件
         */
        $scope.doRefreshOrder = function () {
            ConsultOrderDetailService.getOrderDetail(function (returnData) {
                if (returnData.success) {
                    getBaseInfo();
                }
            }, function () {});
        };
        /**
         * 下拉刷新事件
         */
        $scope.onRefresh = function () {
            ConsultOrderDetailService.getOrderDetail(function (returnData) {
                if (returnData.success) {
                    getBaseInfo();
                    $scope.$broadcast('scroll.refreshComplete');
                }
            }, function () {});
        };
        /**
         * 头部返回按钮点击跳转事件
         */
        $scope.goBack = function () {
            $state.go("consultation_order");
        };


        /**
         * 判断显示（咨询/共享接诊）医生姓名还是医院&科室
         */
        function showWaitInfo() {
            var orderDetail = ConsultOrderDetailService.orderDetail;
            if (orderDetail.isShare == 1 && orderDetail.shareScDoctorId != -1 && orderDetail.shareScDoctorId == 0) {
                $scope.showDoctor = false;
            } else {
                $scope.showDoctor = true;
            }
        }

    })
    .build();