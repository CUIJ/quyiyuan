/**
 * 产品名称 quyiyuan.
 * 创建用户: zhangming
 * 日期: 2015年11月5日09:05:22
 * 创建原因：跨院检查检验单主控制器
 * 任务号：KYEEAPPC-4047
 * 修改：KYEEAPPC-5068  20160121   检查检验单底部黑窗提示语修改（医院首页和就医记录区分展示）
 */
'use strict';
new KyeeModule()
    .group("kyee.quyiyuan.report_multiple.controller")
    .require(["kyee.quyiyuan.report_multiple.service",
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.report_multiple.lab_detail.controller",
        "kyee.quyiyuan.report_multiple.exam_detail.controller",
        "kyee.quyiyuan.report.examDetailImg.controller",
        "kyee.quyiyuan.report_multiple_querybycard.controller"
    ])
    .type("controller")
    .name("ReportMultipleController")
    .params(["CenterUtilService","$scope", "ReportMultipleService",
        "KyeeMessageService", "CacheServiceBus",
        "KyeeViewService", "KyeeUtilsService",
        "$state",
        "AuthenticationService", "$rootScope", "PatientCardService", "KyeeI18nService", "KyeeListenerRegister", "$timeout", "$compile","KyeePhoneService","$ionicScrollDelegate","$ionicHistory","OperationMonitor"])
    .action(function (CenterUtilService,$scope, ReportMultipleService, KyeeMessageService, CacheServiceBus,
                      KyeeViewService, KyeeUtilsService, $state,
                      AuthenticationService, $rootScope, PatientCardService, KyeeI18nService, KyeeListenerRegister, $timeout, $compile,KyeePhoneService,$ionicScrollDelegate,$ionicHistory,OperationMonitor) {

        //初始化分页加载信息
        ReportMultipleService.scope = $scope;
        var count = 10; //每页显示数据为10条
        var currentPage = 1; // 初始化当前页
        $scope.sexEmpty = true;
        $scope.tipsIsShow = true;
        $scope.getCode = false;//输入验证码框是否显示
        $scope.IS_SHOW_REPORT_MESSAGE_CHECK = false;//His 是否短信校验通过
        $scope.report = {
            checkCode:""
        };

        $scope.toLeft = "left_155";
        if(window.innerWidth<=320){
            $scope.toLeft = "left_110";
        }else if(window.innerWidth<=375){
            $scope.toLeft = "left_155";
        }else{
            $scope.toLeft = "left_200";
        }

        $scope.divWidth = window.innerWidth-90-14-70-28;

        //返回键
        $scope.back = function(){
            if($scope.fromPage == "login"){
                $state.go('myquyi->MAIN_TAB.medicalGuide');
            }else if($ionicHistory.backView().stateName == "message_skip_controller"
                || $ionicHistory.backView().stateName == "extract_code_info"
                || $ionicHistory.backView().stateName == "extract_all_info"
                || $ionicHistory.backView().stateName == "doctor_patient_relation"){
                $state.go("home->MAIN_TAB");
            }else{
                $ionicHistory.goBack(-1);
            }

        };
        //监听物理键返回
        KyeeListenerRegister.regist({
            focus: "report_multiple",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.back();
            }
        });
        KyeeListenerRegister.regist({
            focus: "report_multiple",
            direction: 'both',
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            action: function (params) {
                $scope.fromPage = params.from;
                if(!ReportMultipleService.detialFlag){
                    $scope.tipsIsShow = true;
                    $scope.showCon = true;
                    $scope.ionScrollHeight=(window.innerHeight-100)+'px';
                    //当前就诊者信息
                    var userInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                    if (userInfo) {
                        //就诊者信息不为空
                        $scope.patientEmpty = "block";
                        $scope.USER_NAME = userInfo.OFTEN_NAME;
                        //年龄
                        $scope.AGE = CenterUtilService.ageBydateOfBirth(userInfo.DATE_OF_BIRTH);
                        //性别判空转换
                        var sex = userInfo.SEX;
                        if (sex && (sex == 1 || sex == '1' || sex == '男')) {
                            $scope.sexEmpty = false;//性别判空显示斜杠
                            //$scope.SEX = KyeeI18nService.get('commonText.man', '男', null);
                            $scope.SEX = KyeeI18nService.get('commonText.man','男');
                        }
                        else if (sex && (sex == 2 || sex == '2' || sex == '女')) {
                            $scope.sexEmpty = false;//性别判空显示斜杠
                            //$scope.SEX = KyeeI18nService.get('commonText.woman', '女', null);
                            $scope.SEX =KyeeI18nService.get('commonText.woman','女') ;
                        }
                        else {
                            $scope.SEX = '';
                            $scope.sexEmpty = true;//性别判空不显示斜杠
                        }
                    }
                    else {
                        $scope.patientEmpty = 'none';//就诊者信息为空不显示头部用户信息栏
                    }
                    $scope.isThreeMonthData = false;
                    $scope.isHistoryData = false;
                    //底部黑框提示
                    $scope.tips = undefined;
                    ReportMultipleService.setFlag=undefined;

                    // 初始化查询数据
                    $scope.doRefresh(true, true);
                }
                ReportMultipleService.detialFlag=false;

                //统计页面展示次数
                OperationMonitor.record("countReportMultipleVisit", "report_multiple");

            }

        });
        /**
         * 开通检查检验情况   1：开通检查 2：开通检验 3：都开通 4：都未开通
         * @param data
         * @returns {number}
         * @private
         */
        var _isOpen = function(data){
            //EXAM_STATUS 是否开通检察    LAB_STATUS 是否开通检验
            if(data.EXAM_STATUS == 1 && data.LAB_STATUS == 1){
                return 3; //3：都开通
            }else if(data.EXAM_STATUS == 0 && data.LAB_STATUS == 1){
                return 2; //2：开通检验
            }else if(data.EXAM_STATUS == 1 && data.LAB_STATUS == 0){
                return 1; //1：开通检查
            }else{
                return 4; //4：都未开通
            }
        };
        /**
         * 门诊查询条件 1:就诊卡 2:就诊卡+姓名,3:身份证号+姓名,4:手机号+姓名
         * @param data
         * @returns {number}
         * @private
         */
        var _queryItem = function(data){
            return  data.QUERY_TYPE;
        };

        $scope.getCode = false;//输入验证码框是否显示

        //初始化加载
        $scope.doRefresh = function (isShowLoading, getTerminalFlag) {
            var haveData = false; //请求是否存在返回数据
            var isOpen = undefined; //开通检查检验情况   1：开通检查 2：开通检验 3：都开通 4：都未开通
            var queryItem = undefined;//门诊查询条件   1:就诊卡 2:就诊卡+姓名,3:身份证号+姓名,4:手机号+姓名
            var datas = "";
            $scope.noLoadTxt = false;//是否显示数据已加载完毕标识
            $scope.isEmpty = false;
            $scope.noLoad = false;//是否允许继续上拉加载
            $scope.IS_SHOW_REPORT_MESSAGE_CHECK = false;//His 是否短信校验通过
            $scope.getCode = false;
            ReportMultipleService.loadData(currentPage, count, $scope, isShowLoading, getTerminalFlag, function (data, success) {
                if (success) {
                    //开通检查检验情况   1：开通检查 2：开通检验 3：都开通 4：都未开通
                    isOpen = _isOpen(data);
                    //门诊查询条件   1:就诊卡 2:就诊卡+姓名,3:身份证号+姓名,4:手机号+姓名
                    queryItem = _queryItem(data);
                    if(data.IS_SHOW_REPORT_MESSAGE_CHECK == 1){
                        $scope.IS_SHOW_REPORT_MESSAGE_CHECK = true;
                        $scope.PASS_MESSAGE = "为了保障您的信息安全，查询报告单之前需要对您的就诊者信息进行校验。";
                    }else{
                        $scope.IS_SHOW_REPORT_MESSAGE_CHECK = false;
                    }
                    if (parseInt(data.data.rows.length) == 0) {
                        $scope.isEmpty = true;
                        $scope.emptyText = KyeeI18nService.get('report_multiple.noData', '暂无检查检验单记录', null);
                    } else {
                        $scope.reportData = []; //默认当前数据为空
                        $scope.ThreeMonthData = [];//默认三个月内的数据
                        $scope.HistoryData = [];//默认历史数据（三个月外）
                        datas = data.data.rows;
                        //是否存在数据
                        if(datas.length >0){
                            haveData = true;
                        }
                        //任务号：KYEEAPPC-8465   修改分页方法   by——杨旭平   start
                        //校验数据是否加载完
                        if (datas.length >= count) {
                            $scope.noLoad = true;
                            $scope.noLoadTxt = false;
                        } else {
                            $scope.noLoad = false;
                            $scope.noLoadTxt = true;
                        }
                        //任务号：KYEEAPPC-8465   修改分页方法   by——杨旭平   end
                        //追加加载数据
                        for (var i = 0; i < datas.length; i++) {
                            $scope.reportData.push(datas[i]);
                            if (IsThreeDataFlag(datas[i].REPORT_DATE)) {
                                $scope.ThreeMonthData.push(datas[i]);
                            } else {
                                $scope.HistoryData.push(datas[i]);
                            }
                        }
                        if ($scope.ThreeMonthData.length > 0) {//三个月内数据不为空，显示标签
                            $scope.isThreeMonthData = true;
                        }
                        if ($scope.HistoryData.length > 0) {//历史数据数据不为空，显示标签
                            $scope.isHistoryData = true;
                        }
                        $scope.currentPage = currentPage + 1; //下一页
                    }
                    var storageCache = CacheServiceBus.getStorageCache();
                    var memoryCache = CacheServiceBus.getMemoryCache();
                    var hospitalInfo = storageCache.get("hospitalInfo");//当前医院信息
                    var changeHospitalStr = undefined;
                    var message = undefined;
                    var patient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                    var cardInfo = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO);
                    if (data.message != '' && data.message != null && data.message != undefined) {
                        changeHospitalStr=KyeeI18nService.get('index_hosp.preLookInfo','如需查看其他医院的检查检验单记录，请')
                                           +'<span style=\"text-decoration: underline;color: #357fbc;\" ng-click=\"goToHospitalView();\">'
                                           +KyeeI18nService.get('index_hosp.afterLookInfo','切换医院')
                                           +'</span>';
                        if(ReportMultipleService.IS_TAP_TAB && ReportMultipleService.IS_TAP_TAB =='HOS'){//非跨医院
                            changeHospitalStr='';
                        }
                        var array = data.message.split('|');
                        if ('REALNAME' == array[0]) {
                            $scope.tips= KyeeI18nService.get('index_hosp.preAuthInfo','您还未完成实名认证，请')
                                         +'<span style=\"text-decoration: underline;color: #357fbc;\" ng-click=\"goToAuth();\">'
                                         +KyeeI18nService.get('index_hosp.afterAuthInfo','实名认证');
                                         +'</span>。'+changeHospitalStr;
                            if(hospitalInfo &&  hospitalInfo.name){
                                $scope.emptyText = KyeeI18nService.get('index_hos.preNoResult','暂未从') + hospitalInfo.name + KyeeI18nService.get('index_hosp.afterNoResult','查取到检查检验结果记录');
                            }
                        }else if('REALNAMEING'==array[0]){
                            $scope.tips= KyeeI18nService.get('index_hosp.preRefreshInfo','实名认证中，请稍后下拉刷新查看检查检验记录。')+changeHospitalStr;
                            if(hospitalInfo &&  hospitalInfo.name){
                                $scope.emptyText = KyeeI18nService.get('index_hosp.preNoFrom','暂未从') + hospitalInfo.name + KyeeI18nService.get('index_hosp.afterReportInfo','查取到检查检验结果记录');
                            }
                        }else if (queryItem == 1 || queryItem == 2) {
                            /*if(hospitalInfo &&  hospitalInfo.name){
                             $scope.tips = '已成功为您刷新【' + hospitalInfo.name + '】的检查检验记录，若未查到相关记录，<span style=\"text-decoration: underline;color: #357fbc;\" ng-click=\"goToQueryByCard();\">更改设置</span>试试看。'+changeHospitalStr;
                             $scope.emptyText = '暂未从' + hospitalInfo.name + '查取到检查检验结果记录';
                             }else{
                             $scope.tips = '已成功为您刷新检查检验记录。'+changeHospitalStr;
                             }*/
                            //有就诊卡
                            message = ReportMultipleService.messageCard(hospitalInfo,changeHospitalStr,patient,isOpen,haveData,queryItem,cardInfo);
                            $scope.tips = message.tips;
                            $scope.emptyText = message.emptyText;
                        }
                        /*else if (array[0] == 'CLOSE') {
                         $scope.tips = '【' + hospitalInfo.name + '】未开通检查检验查询服务。'+changeHospitalStr;
                         $scope.emptyText = '当前医院暂未开通检查检验单查询服务，敬请期待';
                         }*/
                        else{
                            //无就诊卡
                            message = ReportMultipleService.messageNoCard(hospitalInfo,changeHospitalStr,patient,isOpen,haveData,queryItem,cardInfo);
                            $scope.tips = message.tips;
                            $scope.emptyText = message.emptyText;
                            /*if(hospitalInfo &&  hospitalInfo.name){
                             $scope.tips = '已成功为您刷新【' + hospitalInfo.name + '】的检查检验记录，若未查到相关记录，<span style=\"text-decoration: underline;color: #357fbc;\" ng-click=\"goToSetPatientInfo();\">更改设置</span>试试看。'+changeHospitalStr;
                             $scope.emptyText = '暂未从' + hospitalInfo.name + '查取到检查检验结果记录';
                             }else{
                             $scope.tips = '已成功为您刷新检查检验记录。'+changeHospitalStr;
                             $scope.emptyText = '暂未从' + hospitalInfo.name + '查取到检查检验结果记录';
                             }*/
                        }
                    }
                } else {
                    $scope.tips = undefined;
                    $scope.isEmpty = true;
                    $scope.emptyText = KyeeI18nService.get('commonText.networkErrorMsg', '网络异常，请稍后重试！', null);

                }
                $scope.showCon = false;
                $scope.tipsIsShow = true;
                footerClick();

            });
            $scope.$broadcast('scroll.refreshComplete');
        };
        //初始化底部黑框，将字符串编译为html
        var footerClick = function () {
            $timeout(
                function () {
                    var elements = angular.element(document.getElementById("report_emptyId"));
                    elements.html($scope.emptyText);
                    $compile(elements.contents())($scope);
                    var element = angular.element(document.getElementById("report_tipId"));
                    element.html($scope.tips);
                    $compile(element.contents())($scope);
                    var scroll = document.getElementById("scroll_id");
                    var nullScroll = document.getElementById("null_scroll_id");
                    var footbar = document.getElementById("footbar_id");
                    if((scroll && footbar) || (nullScroll && footbar)){
                        $scope.ionScrollHeight=(window.innerHeight-100) +'px';
                    }
                    $ionicScrollDelegate.scrollTop();
                },
                1
            );
        };
        //上拉加载
        $scope.loadMore = function (isShowLoading, getTerminalFlag) {
            ReportMultipleService.loadData($scope.currentPage, count, $scope, isShowLoading, getTerminalFlag, function (data, success) {
                if (success) {
                    var datas = data.data.rows;
                    //校验数据是否加载完
                    //任务号：KYEEAPPC-8465   修改分页方法   by——杨旭平   start
                    if (datas.length >= count) {
                        $scope.noLoad = true;
                        $scope.noLoadTxt = false;
                    } else {
                        $scope.noLoad = false;
                        $scope.noLoadTxt = true;
                    }
                    //任务号：KYEEAPPC-8465   修改分页方法   by——杨旭平   end
                    //追加加载数据
                    for (var i = 0; i < datas.length; i++) {
                        $scope.reportData.push(datas[i]);
                        if (IsThreeDataFlag(datas[i].REPORT_DATE)) {
                            $scope.ThreeMonthData.push(datas[i]);
                        } else {
                            $scope.HistoryData.push(datas[i]);
                        }
                    }
                    if ($scope.ThreeMonthData.length > 0) {//三个月内数据不为空，显示标签
                        $scope.isThreeMonthData = true;
                    }
                    if ($scope.HistoryData.length > 0) {//历史数据数据不为空，显示标签
                        $scope.isHistoryData = true;
                    }
                    $scope.currentPage = $scope.currentPage + 1; //下一页
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    $scope.tipsIsShow = true;
                }
                else {
                    $scope.emptyText = KyeeI18nService.get('commonText.networkErrorMsg', '网络异常，请稍后重试！', null);
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                }
            });
        };

        /**
         * 判断是否还有更多数据
         */
        $scope.moreDataCanBeLoaded = function () {
            return $scope.noLoad;
        };

        //日期格式化
        $scope.getDate = function (param) {
            if (param && param != "") {
                return KyeeUtilsService.DateUtils.formatFromDate(param, 'YYYY/MM/DD');
            }
        };
        /**
         * 判断是否三个月内数据
         * @param param
         * @returns {boolean}
         * @constructor
         */
        IsThreeDataFlag = function (param) {
            var date = new Date(param);
            var now_date = new Date();
            now_date.setMonth(now_date.getMonth() - 3);
            return date > now_date;
        };

        $scope.clickItem = function (itemData) {
            if (itemData.REPORT_FLAG == 'LAB') {
                ReportMultipleService.LAB_ID = itemData.EXAM_ID;
                ReportMultipleService.LAB_ITEM = itemData.EXAM_SUB_CLASS;
                ReportMultipleService.LAB_TEST_NO = itemData.LAB_TEST_NO;
                ReportMultipleService.PHOTO_URL = itemData.PHOTO_URL;
                ReportMultipleService.REPORT_DATE = itemData.REPORT_DATE;
                ReportMultipleService.PATIENT_ID = itemData.PATIENT_ID;
                ReportMultipleService.TEST_NO = itemData.LAB_TEST_NO;
                ReportMultipleService.REPORT_TIME = itemData.REPORT_DATE;
                ReportMultipleService.LAB_SOURCE = itemData.EXAM_SOURCE;
                ReportMultipleService.PICTURE_STATUS = itemData.PICTURE_STATUS;
                ReportMultipleService.PICTURE_SOURCE = itemData.PICTURE_SOURCE;
                ReportMultipleService.HOS_ID=itemData.HOSPITAL_ID;
                $state.go('lab_detail');
            } else {
                ReportMultipleService.examDetailData = itemData;
                $state.go('exam_detail');
            }
            //从详细页面返回时，不需要重新刷新页面，取缓存。
            ReportMultipleService.detialFlag=true;
        };
        //获得某数据的长度
        $scope.getLengths = function (data) {
            if (data != null && data != undefined) {
                data = JSON.parse(data);
                return data.length;
            } else {
                return 0;
            }
        };
        //校验图片地址是否存在
        $scope.getUrl = function (PHOTO_URL) {
            if (PHOTO_URL == null || PHOTO_URL == undefined || PHOTO_URL == "") {
                return true;
            }
        };
        //切换医院
        $scope.goToHospitalView = function () {
            $state.go('hospital_selector');
            //从设置页面返回时，无查询操作，不需要重新刷新页面，取缓存。
            ReportMultipleService.detialFlag=true;
            ReportMultipleService.reportSelHos=true;
        };
        //更改配置跳转
        $scope.goToQueryByCard = function(){
            $state.go('mulreport_query_by_card');
            //从设置页面返回时，无查询操作，不需要重新刷新页面，取缓存。
            ReportMultipleService.detialFlag=true;
        };
        //打客服电话
        $scope.click2call = function() {

            KyeePhoneService.callOnly("4000801010");
        };
        $scope.goToAuth=function(){
            AuthenticationService.lastClass = "report_multiple";
            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: 'modules/business/center/views/authentication/authentication.html'
            });

        };
        $scope.goToSetPatientInfo=function(){

            ReportMultipleService.setFlag="<sapn> " +
                                                    KyeeI18nService.get('report_multiple.missMatch','若就诊者信息与您在医院填写信息不匹配，将查询不到对应的检查检验记录，您可以尝试修改')
                                          +"</sapn><span style=\"text-decoration: underline;color:#264557;\" ng-click=\"goPatientDetail();\">"
                                                    +KyeeI18nService.get('report_multiple.getPatientInfo','就诊者信息')
                                          +"</span><span>。</span>";
            $state.go('mulreport_query_by_card');
            //从设置页面返回时，无查询操作，不需要重新刷新页面，取缓存。
            ReportMultipleService.detialFlag=true;
            ReportMultipleService.reportUpdatePat=true;
        };
        //KYEEAPPC-5034  20160119    张明   逻辑删除检查检验信息
        $scope.delReportData=function(index,itemData,flag){

            ReportMultipleService.delReportItem(itemData.EXAM_ID,itemData.REPORT_FLAG,itemData.PATIENT_ID,function (data, success) {
                if(success){
                    if(flag){ //三个月内的
                        $scope.ThreeMonthData.splice(index,1); //页面先进行显示删除
                        if ($scope.ThreeMonthData.length > 0) {
                            $scope.isThreeMonthData = true;
                        }
                    }else{ //历史的
                        $scope.HistoryData.splice(index,1); //页面先进行显示删除
                        if ($scope.HistoryData.length > 0) {
                            $scope.isHistoryData = true;
                        }
                    }
                }else{
                    $scope.emptyText = KyeeI18nService.get('commonText.networkErrorMsg', '网络异常，请稍后重试！', null);

                }
            });

        };
        $scope.tipIsShow = function () {
            $scope.tipsIsShow = false;
        };
        var MSG_ID="";
        /*
         *校验用户信息并获得流水号
         */
        $scope.getCheckAndCode = function () {
            ReportMultipleService.getCheckAndCode(function(retVal){
                var success = retVal.success;
                if (success) {
                    $scope.getCode = true;
                    MSG_ID = retVal.data;
                }else {
                    if(retVal.resultCode == '0013601'){
                        if (retVal.message) {
                            KyeeMessageService.message({
                                title: "温馨提示",
                                okText: "立即前往",
                                content: retVal.message,
                                onOk:function(){
                                    ReportMultipleService.reportUpdatePat = true;
                                    $state.go("comm_patient_detail");
                                }
                            });
                        } else {
                            KyeeMessageService.broadcast({
                                content: "校验失败！"
                            });

                        }
                    }else {
                        KyeeMessageService.broadcast({
                            content: "校验失败！"
                        });

                    }

                }
            });
        };
        $scope.validateBtnDisabled = true;
        $scope.codeLength = function(){
            var CHECK_CODE = $scope.report.checkCode;
            if(CHECK_CODE.trim().length>=4){
                $scope.validateBtnDisabled = false;
            }else{
                $scope.validateBtnDisabled = true;
            }
        };

        /*
         *校验验证码
         */
        $scope.toCommit = function () {
            ReportMultipleService.validateBtnDisabled = $scope.validateBtnDisabled;
            var CHECK_CODE = $scope.report.checkCode;
            if(CHECK_CODE && CHECK_CODE.trim()==""){
                KyeeMessageService.broadcast({
                    content: "验证码不能为空，请输入验证码！"
                });
            }
            ReportMultipleService.toCommit (MSG_ID,CHECK_CODE,function(data){
                if(data.success){
                    KyeeMessageService.broadcast({
                        content: "验证通过，正在为您查询..."
                    });
                    // 初始化查询数据
                    $scope.doRefresh(true, true);
                }else{
                    if(data.resultCode == '0013602'){
                        if (data.message) {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        } else {
                            KyeeMessageService.broadcast({
                                content: "校验失败！"
                            });

                        }
                    }else {
                        KyeeMessageService.broadcast({
                            content: "校验失败！"
                        });

                    }
                }

            });
        };
    })
    .build();