/**
 * 产品名称：quyiyuan
 * 创建用户：张毅
 * 日期：2017年4月20日
 * 创建原因：评价订单页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.consultation.consult_satisfaction.controller")
    .require(["kyee.quyiyuan.consultation.consult_satisfaction.service",
        "kyee.quyiyuan.consultation.consult_order_detail.controller"])
    .type("controller")
    .name("ConsultationSatisfactionController")
    .params(["$scope", "$state", "$ionicHistory",
        "KyeeUtilsService", "KyeeListenerRegister", "KyeeViewService", "KyeeMessageService",
        "ConsultOrderDetailService", "ConsultSatisfactionService",
        "CenterUtilService", "CacheServiceBus","$window"])
    .action(function ($scope, $state, $ionicHistory,
                      KyeeUtilsService, KyeeListenerRegister, KyeeViewService, KyeeMessageService,
                      ConsultOrderDetailService, ConsultSatisfactionService,
                      CenterUtilService, CacheServiceBus,$window) {
        var memoryCache = CacheServiceBus.getMemoryCache();//全局参数
        var storageCache = CacheServiceBus.getStorageCache();//缓存数据

        /**
         * [action 页面进入监听]
         */
        KyeeListenerRegister.regist({
            focus: "consult_satisfaction",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function () {
                initView();
            }
        });

        /**
         * [action 页面物理返回监听]
         */
        KyeeListenerRegister.regist({
            focus: "consult_satisfaction",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();
                $scope.goBack();
            }
        });

        /**
         *  获取URL参数
         */
        function getQueryString(name) {
            var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i");
            var r = $window.location.search.substr(1).match(reg);
            if (r != null) return unescape(r[2]);
            return null;
        }

        /**
         * 页面初始化加载事件
         */
        function initView() {
            /*处理微信推送页面加载*/
            //判断是否为微信推送内容
            if(ConsultOrderDetailService.isFromWeiXin){
                ConsultOrderDetailService.consultOrderID = getQueryString("consultOrderID");
                ConsultOrderDetailService.getOrderDetail(function (res) {
                    if(ConsultOrderDetailService.orderDetail.evaluationTime >= 1){
                        KyeeMessageService.broadcast({
                            content: "您已评价"
                        });
                        $state.go("consult_order_detail");
                    }
                    getBaseInfo();
                });
                return;
            }
            // 头部订单类型／状态信息
            getBaseInfo();
        }

        /**
         * 获取订单基本信息
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
            var payAmount = ConsultOrderDetailService.orderDetail.payAmount;
            if (ConsultOrderDetailService.orderDetail.free || parseFloat(payAmount) === 0){
                payAmount = '免费咨询';
            } else {
                payAmount = payAmount.toFixed(2) + '元';
            }
            $scope.displayOrderDetail = {
                consultName: consultName,
                doctorName: ConsultOrderDetailService.orderDetail.doctorName,
                payAmount: payAmount,
                suggestValue: ''
            };
            ConsultSatisfactionService.querySurveyItems(ConsultOrderDetailService.orderDetail.hospitalId, function (returnData) {
                if (returnData && returnData.rows) {
                    $scope.items = returnData.rows;
                }else {
                    KyeeMessageService.broadcast({
                        content: "获取医生评价项异常，请稍后重试",
                        duration: 1000
                    });
                }
            }, function (returnData) {
                KyeeMessageService.broadcast({
                    content: returnData.message,
                    duration: 1000
                });
            });
        }
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
                    'statusName': '医生接诊'
                }, {
                    'statusCode': 4,
                    'statusName': '咨询完成'
                }];
                $scope.consultTypeName = '图文咨询';
                $scope.currentStatusCode = '4'; //当前页面处于的状态-咨询完成
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
                    'statusName': '医生接诊'
                }, {
                    'statusCode': 4,
                    'statusName': '医生回拨'
                }, {
                    'statusCode': 5,
                    'statusName': '咨询完成'
                }];
                $scope.currentStatusCode = '5'; //当前页面处于的状态-咨询完成
                if (consultType == 2) {
                    $scope.consultTypeName = '电话咨询';
                } else {
                    $scope.consultTypeName = '视频咨询';
                }
            }
        }

        /**
         * 提交评价时先预计算医生得分
         */
        function calculateDoctorScore() {
            var postData = {
                USER_ID: memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_RECORD).USER_ID,
                PATIENT_ID: '-1', // 订单是用户级别，暂不传就诊者ID
                PATIENT_NAME: ConsultOrderDetailService.orderDetail.patientName,
                TRADE_ORDER_NO: ConsultOrderDetailService.orderDetail.scConsultId,
                REG_ID: ConsultOrderDetailService.orderDetail.scConsultId,
                SUGGEST_VALUE: $scope.displayOrderDetail.suggestValue,
                PHONE_NUMBER: ConsultOrderDetailService.orderDetail.patientPhone,
                ITEM_SCORES:$scope.items
            };

            postData.HOSPITAL_ID = ConsultOrderDetailService.orderDetail.hospitalId;
            postData.DEPT_CODE = ConsultOrderDetailService.orderDetail.deptCode;
            postData.DEPT_NAME = ConsultOrderDetailService.orderDetail.deptName;
            postData.DOCTOR_CODE = ConsultOrderDetailService.orderDetail.doctorCode;
            postData.DOCTOR_NAME = ConsultOrderDetailService.orderDetail.doctorName;

            var hospitalId = postData.HOSPITAL_ID;
            var doctorSuggestItem = document.getElementById("doctorSuggest");
            ConsultSatisfactionService.calculateDoctorScore(postData, hospitalId, function (returnData) {
                if (returnData.success && returnData.data) {
                    postData.DOCTOR_SCORE = returnData.data.score; //提交评价接口增加平均分
                    // 差评的时候提示用户填写补充信息
                    if (returnData.data.score < 3 && returnData.data.isBadPopup == 1 && !postData.SUGGEST_VALUE) {
                        KyeeMessageService.confirm({
                            title: '温馨提示',
                            cancelText: "坚持提交",
                            okText: "去填写",
                            content: "医生服务不满意？写下您的评价意见可以帮助医生提高服务质量哦~",
                            onSelect: function (res) {
                                if (res) {
                                    if (doctorSuggestItem) {
                                        window.setTimeout(function () {
                                            doctorSuggestItem.setSelectionRange(0, 0); //将光标定位在textarea的开头
                                            doctorSuggestItem.focus();
                                        }, 0);
                                    }
                                } else {
                                    submitSuggest(postData);
                                }
                            }
                        });
                    } else {
                        submitSuggest(postData);
                    }
                } else {
                    KyeeMessageService.broadcast({
                        content: "评价医生失败，请稍后重试",
                        duration: 1000
                    });
                }
            }, function (returnData) {
                KyeeMessageService.broadcast({
                    content: "评价医生失败，请稍后重试",
                    duration: 1000
                });
            });
        }

        /**
         * 提交评价信息
         * @param postData
         */
        function submitSuggest(postData) {
            ConsultSatisfactionService.submitSatisfactionData(postData,function (returnData) {
                if(returnData.success){ //保存评价信息成功后，调用查询详情接口获取最新的详情
                    ConsultOrderDetailService.getOrderDetail(function (returnData) {
                        if(returnData.success){
                            $state.go("consult_order_detail"); //跳转到订单详情页面
                        }
                    });
                }else {
                    KyeeMessageService.broadcast({
                        content: returnData.message,
                        duration: 1000
                    });
                }
            },function (returnData) {
                KyeeMessageService.broadcast({
                    content: returnData.message,
                    duration: 1000
                });
            });
        }

        /**
         * 输入有效验证(汉子，字母，数字，标点符号)
         * @param text
         */
        function validInputValue(text) {
            var reg = /^[\u4E00-\u9FA5A-Za-z 0-9，。、？！.“”（）\-/／：；¥@<>()【】《》{}｛｝\[\]#%^*+=_—\\|～$&·…:;"~£•,?!']*$/;
            if (!reg.test(text)) {
                KyeeMessageService.broadcast({
                    content: "请勿输入中文、英文、数字和常用标点之外的内容！",
                    duration:3000
                });
                return false;
            }
            return true;
        }

        /**
         * 星星点击事件
         * @param index
         * @param score
         */
        $scope.clickStar = function (index, score) {
            $scope.items[index].SCORE_VALUE = score;
        };

        /**
         * 底部按钮点击事件
         */
        $scope.submit = function () {
            if(validInputValue($scope.displayOrderDetail.suggestValue)){
                // 遍历满意度，没有填写的默认五星好评
                for (var i = 0; i < $scope.items.length; i++) {
                    if (!$scope.items[i].SCORE_VALUE) {
                        $scope.items[i].SCORE_VALUE = 5;
                    }
                }
                // 计算医生此次评价得分
                calculateDoctorScore();
            }
        };

        /**
         * 返回按钮点击事件，返回到订单列表页面
         */
        $scope.goBack = function () {
            $state.go("consultation_order");
        };


    })
    .build();
