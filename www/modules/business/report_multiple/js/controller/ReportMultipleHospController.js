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
    .group("kyee.quyiyuan.report_multiple_hosp.controller")
    .require([
        "kyee.quyiyuan.report_multiple.service",
        "kyee.framework.service.message",
        "kyee.framework.service.view",
        "kyee.quyiyuan.report_multiple.lab_detail.controller",
        "kyee.quyiyuan.report_multiple.exam_detail.controller",
        "kyee.quyiyuan.report.examDetailImg.controller",
        "kyee.quyiyuan.report_multiple_querybycard.controller",
        "kyee.quyiyuan.report.detailsPage.controller",
        "kyee.quyiyuan.report.add_inpatient_number.controller"
    ])
    .type("controller")
    .name("ReportMultipleHospController")
    .params([
        "CenterUtilService",
        "$scope",
        "ReportMultipleService",
        "KyeeMessageService",
        "CacheServiceBus",
        "KyeeViewService",
        "KyeeUtilsService",
        "$state",
        "AuthenticationService",
        "$rootScope",
        "PatientCardService",
        "KyeeI18nService",
        "KyeeListenerRegister",
        "$timeout",
        "$compile",
        "KyeePhoneService",
        "$ionicScrollDelegate",
        "$ionicHistory",
        "HospitalService",
    "CommPatientDetailService",
    "StatusBarPushService",
    "OperationMonitor"])
    .action(function (CenterUtilService,
                      $scope,
                      ReportMultipleService,
                      KyeeMessageService,
                      CacheServiceBus,
                      KyeeViewService,
                      KyeeUtilsService,
                      $state,
                      AuthenticationService,
                      $rootScope,
                      PatientCardService,
                      KyeeI18nService,
                      KyeeListenerRegister,
                      $timeout,
                      $compile,
                      KyeePhoneService,
                      $ionicScrollDelegate,
                      $ionicHistory,HospitalService,CommPatientDetailService,StatusBarPushService,OperationMonitor) {

        //初始化分页加载信息
        ReportMultipleService.scope = $scope;
        var count = 10; //每页显示数据为10条
        var currentPage = 1; // 初始化当前页
        var startNo = 0; //数据开始NO
        var QUERY_TYPE = 0;
        $scope.reportSource = 0;
        $scope.reportSourceShow = KyeeI18nService.get("index_hosp.clinicReport","门诊检查检验单");
        $scope.reportSourceRight = KyeeI18nService.get("index_hosp.hospitalized","住院");
        $scope.sexEmpty = true;
        $scope.tipsIsShow = true;
        $scope.report ={
            checkCode:''
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
        $scope.currentPage=1;
        //页面bind元素
        $scope.showPage= {
            MESSAGE:"",
            MESSAGE_CLICK:"",
            QUERY_TYPE:"",
            IS_AGREE_QY_QUERY:"",
            NUMBER_INFO:"",
            IS_SELECT_NUMBER:"",
            SHOW_FRONT:"",
            REPORT_INFO:"",
            selectSize:90,
            REPORT_PROJECT:"",
            modelOne:false,
            modelTwo:false,
            modelThree:false,
            modelFour:false,
            modelFourText : KyeeI18nService.get("index_hosp.allow24Qury","允许小趣在24小时内为您查询报告单"),
            IS_REQUEST_T:0,
            MESSAGE_SHOW:"",
            iconPlotIsShow:false,
            modleOneHeight:69 + 'px',
            JOB_SYN_COUNT:1

    };

        $scope.getCode = false;//输入验证码框是否显示
        $scope.IS_SHOW_REPORT_MESSAGE_CHECK = false;//His 是否短信校验通过

        //全局bind就诊者信息
        var postdata = {
            USER_VS_ID:"",
            INP_NO:"",
            PATIENT_ID:""
        };

        //全局参数
        var memoryCache = CacheServiceBus.getMemoryCache();

        //缓存数据
        var storageCache = CacheServiceBus.getStorageCache();

        //外部通知跳转进来，显示返回键
        if(StatusBarPushService.webJump){
            $scope.$on('$ionicView.beforeEnter', function (event, viewData) {
                viewData.enableBack = true;
            });
        };

        /**
         * 进入页面监听事件
         */
        KyeeListenerRegister.regist({
            focus: "index_hosp",
            direction: 'both',
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            action: function () {
                $scope.showPage.IS_REQUEST_T = 0;
                $scope.isQueryInhosOpen = false;

                //门诊住院查询方式为 空,先查询查询方式
                if(ReportMultipleService.QUERY_TYPE_INHOSPITAL==undefined||ReportMultipleService.QUERY_TYPE==undefined){
                    var paraName = "checkType,inHospitalCheckType";
                    var hospitalInfo=CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);

                    HospitalService.getParamValueByName(hospitalInfo.id,paraName,function (hospitalPara) {
                        if(0==hospitalPara.data.checkType&&0==hospitalPara.data.inHospitalCheckType){
                            KyeeMessageService.message({
                                title : "提示",
                                content : "此功能暂未开放，敬请期待！",
                                okText : "我知道了"
                            });
                            return;
                        }else{
                            ReportMultipleService.QUERY_TYPE=hospitalPara.data.checkType;
                            ReportMultipleService.QUERY_TYPE_INHOSPITAL=hospitalPara.data.inHospitalCheckType;
                            initLoad();
                        }
                    });
                }else{
                    initLoad();
                }
            }
        });

        var initLoad = function(){
            if (!ReportMultipleService.detialFlag && ReportMultipleService.from != 1) {
                $scope.showPage.IS_SELECT_NUMBER = "";
                $scope.tipsIsShow = true;
                $scope.showCon = true;
                $scope.ionScrollHeight = (window.innerHeight) + 'px';
                //当前就诊者信息
                var userInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                userInfoDeal(userInfo);
                //当天、一个月内、历史记录的页面展示控制字段
                $scope.isThreeMonthData = false;
                $scope.isOneToDataFlag = false;
                $scope.isHistoryData = false;

                //底部黑框提示
                $scope.tips = undefined;
                ReportMultipleService.setFlag = undefined;
                // 初始化查询数据
                $scope.doRefresh(true, true);
            }else{
                $scope.showPage.IS_SELECT_NUMBER = ReportMultipleService.addNo.INP_NO;
                ReportMultipleService.addNo.INP_NO = "";
                ReportMultipleService.from = "";
                $scope.doRefresh();
            }
            ReportMultipleService.detialFlag = false;


            //统计页面展示次数
            OperationMonitor.record("countReportMultipleHospVisit", "report_multiple");
        };

        /**
         * 就诊者全局信息与页面展示信息
         */
        var userInfoDeal = function(userInfo){
            if (userInfo) {
                postdata.USER_VS_ID = userInfo.USER_VS_ID;
                //就诊者信息不为空
                $scope.patientEmpty = "block";
                $scope.USER_NAME = userInfo.OFTEN_NAME;
                $scope.idNo = userInfo.ID_NO;
                $scope.PHONE = userInfo.PHONE;
                //年龄
                $scope.AGE = CenterUtilService.ageBydateOfBirth(userInfo.DATE_OF_BIRTH);
                //性别判空转换
                var sex = userInfo.SEX;
                if (sex && (sex == 1 || sex == '1' || sex == '男')) {
                    $scope.sexEmpty = false;//性别判空显示斜杠
                    $scope.imgUrl = 'url(resource/images/center/men_ro.png)';//默认头像路径
                    $scope.imgUrlSize = 60+'px';
                    $scope.SEX = KyeeI18nService.get('commonText.man','男');
                } else if (sex && (sex == 2 || sex == '2' || sex == '女')) {
                    $scope.imgUrl = 'url(resource/images/center/women_ro.png)';//默认头像路径
                    $scope.imgUrlSize = 60+'px';
                    $scope.sexEmpty = false;//性别判空显示斜杠
                    $scope.SEX =KyeeI18nService.get('commonText.woman' ,'女');
                } else {
                    $scope.SEX = '';
                    $scope.sexEmpty = true;//性别判空不显示斜杠
                }
                if(userInfo.IMAGE_PATH){
                    $scope.imgUrl = 'url('+userInfo.IMAGE_PATH+')';
                    $scope.imgUrlSize = 60+'px';
                }
            } else {
                $scope.patientEmpty = 'none';//就诊者信息为空不显示头部用户信息栏
            }
        };
        /**
         * 开通检查检验情况   1：开通检查 2：开通检验 3：都开通 4：都未开通
         * @param data
         * @returns {number}
         * @private
         */
        var _isOpen = function (data) {
            //EXAM_STATUS 是否开通检察    LAB_STATUS 是否开通检验
            if (data.EXAM_STATUS == 1 && data.LAB_STATUS == 1) {
                return 3; //3：都开通
            } else if (data.EXAM_STATUS == 0 && data.LAB_STATUS == 1) {
                return 2; //2：开通检验
            } else if (data.EXAM_STATUS == 1 && data.LAB_STATUS == 0) {
                return 1; //1：开通检查
            } else {
                return 4; //4：都未开通
            }
        };
        /**
         * 门诊查询条件 1:就诊卡 2:就诊卡+姓名,3:身份证号+姓名,4:手机号+姓名
         * @param data
         * @returns {number}
         * @private
         */
        var _queryItem = function (data) {
            return data.QUERY_TYPE;
        };

        //初始化加载
        $scope.doRefresh = function (isShowLoading, getTerminalFlag) {
            var haveData = false; //请求是否存在返回数据
            var isOpen = undefined; //开通检查检验情况   1：开通检查 2：开通检验 3：都开通 4：都未开通
            var queryItem = undefined;//门诊查询条件   1:就诊卡 2:就诊卡+姓名,3:身份证号+姓名,4:手机号+姓名
            var datas = "";
            var currentPage = 1; //当前是第一页
            var rows = currentPage * count;
            $scope.noLoadTxt = false;//是否显示数据已加载完毕标识
            $scope.isEmpty = false;

            //添加人：付添 任务号：APPCOMMERCIALBUG-3201 描述：门诊增加关闭选择项
            //在门诊页面判断住院查询方式 若未开启 则隐藏住院入口
            if($scope.reportSource == 0&&ReportMultipleService.QUERY_TYPE_INHOSPITAL == 0){
                $scope.isQueryInhosOpen = false;
            }else{
                $scope.isQueryInhosOpen = true;
            }
            //门诊查询方式未开启 --不展示门诊页面
            if(ReportMultipleService.QUERY_TYPE== 0){
                $scope.reportSource = 1;
                $scope.isQueryInhosOpen = false;
                $scope.reportSourceShow = KyeeI18nService.get("index_hosp.hospitalReport","住院检查检验单");
            }

            ReportMultipleService.loadDataHosp($scope.showPage.IS_REQUEST_T,$scope.showPage.IS_AGREE_QY_QUERY,$scope.showPage.IS_SELECT_NUMBER,postdata.USER_VS_ID,$scope.reportSource,startNo, currentPage, rows, $scope, isShowLoading, getTerminalFlag, function (data, success) {
                if (success) {

                    if(data.data.IS_SHOW_REPORT_MESSAGE_CHECK == 1){
                        $scope.IS_SHOW_REPORT_MESSAGE_CHECK = true;
                    }else{
                        $scope.IS_SHOW_REPORT_MESSAGE_CHECK = false;
                    }

                    if($scope.IS_SHOW_REPORT_MESSAGE_CHECK){
                        $scope.showPage.modelFour = false;
                        $scope.showPage.modelOne = true;
                        data.data.IS_AGREE_QY_QUERY = 0;
                        $scope.PASS_MESSAGE = "为了保障您的信息安全，查询报告单之前需要对您的就诊者信息进行校验。";
                    }else{
                        //允许小趣24小时自动查询（modelFour）的显示 0:不显示 1:显示 KYEEAPPC-8108
                        if(data.data.IS_AGREE_XIAOQU_SHOW == 1||data.data.IS_AGREE_XIAOQU_SHOW == '1'){
                            $scope.showPage.modelFour = true;
                        }else{
                            $scope.showPage.modelFour = false;
                            $scope.showPage.modelOne = true;
                            data.data.IS_AGREE_QY_QUERY = 0;
                        }
                    }

                    $scope.showPage.JOB_SYN_COUNT = data.data.JOB_SYN_COUNT;
                    //展示模块一（不打勾才展示）**刚进入时展示
                    if($scope.showPage.IS_AGREE_QY_QUERY != 1){
                        $scope.showPage.modelOne = true;
                    }
                    $scope.showPage.modelTwo = true;    //展示模块二
                    $scope.showPage.modelThree = true; //展示模块三
                    //$scope.showPage.modelFour = true;  //展示模块四
                    //开通检查检验情况   1：开通检查 2：开通检验 3：都开通 4：都未开通
                    isOpen = _isOpen(data);
                    //门诊查询条件   1:就诊卡 2:就诊卡+姓名,3:身份证号+姓名,4:手机号+姓名
                    queryItem = _queryItem(data);

                    //查询方式全局赋值
                    $scope.showPage.QUERY_TYPE = data.data.QUERY_TYPE;

                    //是否校验通过全局赋值
                    $scope.showPage.IS_CHECK_PASS = data.data.IS_CHECK_PASS;

                    //是否24小时查询全局赋值
                    if(!data.data.IS_AGREE_QY_QUERY){
                        data.data.IS_AGREE_QY_QUERY = 0;
                    }

                    //是否24小时查询全局赋值
                    $scope.showPage.IS_AGREE_QY_QUERY = data.data.IS_AGREE_QY_QUERY;

                    //24小时内查询显示控制（分别控制模块一的隐藏和模块四的文字显示）
                    if($scope.showPage.IS_AGREE_QY_QUERY == 1){
                        $scope.showPage.modelOne = false;
                        $scope.showPage.modelFourText =  KyeeI18nService.get("index_hosp.sendMsg","查询到报告单后小趣将短信通知您");
                    }else{
                        $scope.showPage.modelOne = true;
                        $scope.showPage.modelFourText =  KyeeI18nService.get("index_hosp.allow24Qury","允许小趣在24小时内为您查询报告单");
                    }

                    //卡信息如果存在，转换成标准JSON格式，不存在置为空
                    if(data.data.NUMBER_INFO){
                        $scope.showPage.NUMBER_INFO = JSON.parse(data.data.NUMBER_INFO);
                    }else{
                        $scope.showPage.NUMBER_INFO = "";
                    }

                    //不存在点击按钮显示则置空，方便下面的replace
                    if(!data.data.CLICK_MESSAGE){
                        data.data.CLICK_MESSAGE = "";
                    }
                    //最后一次发送时间
                    $scope.showPage.LAST_SEND_TIME = data.data.LAST_SEND_TIME;
                    //replace点击信息显示，copy信息显示
                        if(data.data.MESSAGE){
                            $scope.showPage.MESSAGE_SHOW = angular.copy(data.data.MESSAGE);
                            var int = data.data.MESSAGE.lastIndexOf(data.data.CLICK_MESSAGE);
                            if(int){
                                $scope.showPage.MESSAGE = data.data.MESSAGE.substring(0,int);
                            }
                        //$scope.showPage.MESSAGE = data.data.MESSAGE.replace(data.data.CLICK_MESSAGE,"");
                        $scope.showPage.CLICK_MESSAGE = data.data.CLICK_MESSAGE;
                    }else{
                        $scope.showPage.MESSAGE = "";
                    }
                    //转换报告单为标准的JSON格式
                    if(data.data.REPORT_INFO){
                        $scope.showPage.REPORT_INFO = JSON.parse(data.data.REPORT_INFO);
                    }else{
                        $scope.showPage.REPORT_INFO = "";
                    }

                    //转换支持报告单类型为标准的JSON格式
                    if(data.data.REPORT_PROJECT){
                        $scope.showPage.REPORT_PROJECT = JSON.parse(data.data.REPORT_PROJECT);
                    }

                    //中转报告单信息赋值
                    var numberInfo = $scope.showPage.NUMBER_INFO;

                    //如果存在支持报告单类型，转换支持报告单类型为标准的JSON格式
                    if($scope.showPage.REPORT_PROJECT && $scope.showPage.REPORT_PROJECT.REPORT_PROJECT
                        && $scope.showPage.REPORT_PROJECT.REPORT_PROJECT.length>2){
                        var reportProject = JSON.parse($scope.showPage.REPORT_PROJECT.REPORT_PROJECT);
                        $scope.showPage.SHOW_REPORT_PROJECT = "";

                        //int记录是否全部支持，如果全部支持，则不显示模块三
                        var int = 0;

                        //以防万一SHOW_REPORT_PROJECT值过长导致页面无显示现象存在的字段
                        var threeTextShowAdd = "";

                        //循环处理页面模块三页面展示
                        for(var i = 0;i<reportProject.length;i++){
                            //SHOW_REPORT_PROJECT是前台模块三页面展示bind字段，大于5个字符则不继续增加，否则会撑坏页面
                            if($scope.showPage.SHOW_REPORT_PROJECT.length<5){
                                //如果SHOW_REPORT_PROJECT为空则直接赋值
                                if(reportProject[i].STATUS == 0 && !$scope.showPage.SHOW_REPORT_PROJECT){
                                    $scope.showPage.SHOW_REPORT_PROJECT = reportProject[i].REPORT_ITEM_NAME;
                                //如果SHOW_REPORT_PROJECT不为空则往后面继续追加字段
                                }else if(reportProject[i].STATUS == 0 && $scope.showPage.SHOW_REPORT_PROJECT){
                                    $scope.showPage.SHOW_REPORT_PROJECT = $scope.showPage.SHOW_REPORT_PROJECT +"、"+ reportProject[i].REPORT_ITEM_NAME;
                                }
                            }else{
                                if(reportProject[i].STATUS == 0 && !$scope.showPage.SHOW_REPORT_PROJECT && !threeTextShowAdd){
                                    threeTextShowAdd = reportProject[i].REPORT_ITEM_NAME;
                                }
                            }
                            //int记录是否全部支持，如果全部支持，则不显示模块三
                            if(reportProject[i].STATUS == 1){
                                int++;
                            }
                            if(int == reportProject.length){
                                $scope.showPage.modelThree = false;
                            }
                        }
                        //如果不支持的报告三类型字数都大于5，则使用threeTextShowAdd字段取值
                        if($scope.showPage.SHOW_REPORT_PROJECT.length<1 && threeTextShowAdd.length>2){
                            $scope.showPage.SHOW_REPORT_PROJECT = reportProject[0].substring(3);
                        }
                    }else if(data.data.EXAM_STATUS == 0){
                        if($scope.reportSource == 0){
                            $scope.showPage.SHOW_REPORT_PROJECT = KyeeI18nService.get("index_hosp.notOpenClinicReport","暂未开通门诊检查单功能");
                        }else{
                            $scope.showPage.SHOW_REPORT_PROJECT = KyeeI18nService.get("index_hosp.notOpenHospitalReport","暂未开通住院检查单功能");
                        }
                    }else if(data.data.LAB_STATUS == 0){
                        if($scope.reportSource == 0){
                            $scope.showPage.SHOW_REPORT_PROJECT = KyeeI18nService.get("index_hosp.notOpenTestReport","暂未开通门诊检验单功能");
                        }else{
                            $scope.showPage.SHOW_REPORT_PROJECT = KyeeI18nService.get("index_hosp.notOpenHosTestReport","暂未开通住院检验单功能");
                        }
                    }else if(data.data.EXAM_STATUS == 0 && data.data.EXAM_STATUS == 0){
                        if($scope.reportSource == 0){
                            $scope.showPage.SHOW_REPORT_PROJECT = KyeeI18nService.get("index_hosp.notOpenReport","暂未开通门诊检查检验单功能");
                        }else{
                            $scope.showPage.SHOW_REPORT_PROJECT = KyeeI18nService.get("index_hosp.notOpenHosReport","暂未开通住院检查检验单功能");
                        }
                    }else{
                        $scope.showPage.modelThree = false;
                    }

                    //如果有选中卡，则直接在页面展示
                    for(var i=0;i<numberInfo.length;i++){
                        if(numberInfo[i].IS_SELECTED == 1){
                            $scope.showPage.IS_SELECT_NUMBER = numberInfo[i].NUMBER_NO;
                            postdata.PATIENT_ID = numberInfo[i].PATIENT_ID;
                        }
                    }

                    $scope.QUERY_TYPE = data.data.QUERY_TYPE;
                    //0:关闭,1:就诊卡,2:就诊卡+姓名,3:身份证号+姓名,4:手机号+姓名,5:住院号
                    if(data.data.QUERY_TYPE == 1){
                        $scope.showPage.SHOW_FRONT = KyeeI18nService.get("index_hosp.cardNum","就诊卡号：");
                    }else if(data.data.QUERY_TYPE == 2){
                        $scope.showPage.content_width = window.innerWidth - 70;
                        $scope.showPage.SHOW_FRONT = KyeeI18nService.get("index_hosp.cardNum","就诊卡号：");
                    }else if(data.data.QUERY_TYPE == 3){
                        $scope.showPage.SHOW_FRONT = KyeeI18nService.get("index_hosp.idNum","身份证：");
                        $scope.showPage.IS_SELECT_NUMBER = $scope.idNo.replace(/(.{3}).*(.{4})/,"$1********$2");
                    }else if(data.data.QUERY_TYPE == 4){
                        $scope.showPage.SHOW_FRONT =  KyeeI18nService.get("index_hosp.phoneNum","手机号：");
                        $scope.showPage.IS_SELECT_NUMBER =$scope.PHONE.replace(/(.{3}).*(.{4})/,"$1********$2");
                    }else if(data.data.QUERY_TYPE == 6){
                        $scope.showPage.SHOW_FRONT = KyeeI18nService.get("index_hosp.hospitalNum","住院号：");
                        postdata.INP_NO = $scope.showPage.IS_SELECT_NUMBER;
                    }else{
                        $scope.showPage.SHOW_FRONT = KyeeI18nService.get("index_hosp.cantSupportReport","暂不支持住院报告单查询");
                    }

                    //对于模块二输入框的长度控制
                    //KYEEAPPC-8554   by-yangxuping    检查检验单页面 iphone5 信息框，字符过长折行   start
                    if((data.data.QUERY_TYPE == 1 || data.data.QUERY_TYPE == 2) && $scope.showPage.IS_SELECT_NUMBER && $scope.showPage.IS_SELECT_NUMBER.length>0) {
                        $scope.showPage.selectSize = window.innerWidth - 90 -18;
                        if(parseInt(($scope.showPage.selectSize - 30)/10) < parseInt($scope.showPage.SHOW_FRONT.length) + parseInt($scope.showPage.IS_SELECT_NUMBER.length)){
                            var num = parseInt($scope.showPage.SHOW_FRONT.length) + parseInt($scope.showPage.IS_SELECT_NUMBER.length) - parseInt(($scope.showPage.selectSize - 50)/8);
                            $scope.showPage.IS_SELECT_NUMBER = $scope.showPage.IS_SELECT_NUMBER.substr(0,$scope.showPage.IS_SELECT_NUMBER.length-num-6)+"...";
                        }
                    }
                    else{
                        $scope.showPage.selectSize = window.innerWidth - 90 -18;
                        //$scope.showPage.selectSize = (18 - $scope.showPage.IS_SELECT_NUMBER.length) * 5;
                    }

                    //KYEEAPPC-8554   by-yangxuping    检查检验单页面 iphone5 信息框，字符过长折行   end

                    //保留if分支防止后续修改
                    if (!$scope.showPage.REPORT_INFO) {
                        $scope.reportData = []; //默认当前数据为空
                        $scope.ThreeMonthData = [];//默认一个月内的数据
                        $scope.OneToDataFlag = [];//一天内的数据
                        $scope.HistoryData = [];//默认历史数据（一个月外）
                        //$scope.isEmpty = true;
                        //$scope.emptyText = KyeeI18nService.get('report_multiple.noData', '暂无检查检验单记录', null);
                    } else {
                        $scope.reportData = []; //默认当前数据为空
                        $scope.ThreeMonthData = [];//默认一个月内的数据
                        $scope.OneToDataFlag = [];//一天内的数据
                        $scope.HistoryData = [];//默认历史数据（一个月外）
                        $scope.total = parseInt($scope.showPage.REPORT_INFO.total);//记录总数
                        datas = $scope.showPage.REPORT_INFO;
                        //是否存在数据，因改版，暂时废弃
                        //if (datas.length > 0) {
                        //    haveData = true;
                        //}
                        //任务号：KYEEAPPC-8465   修改分页方法   by——杨旭平   start
                        //校验数据是否加载完
                        if (datas.rows.length >= count) {
                            $scope.noLoad = true;
                            $scope.noLoadTxt = false;
                        } else {
                            $scope.noLoad = false;
                            $scope.noLoadTxt = true;
                        }
                        //任务号：KYEEAPPC-8465   修改分页方法   by——杨旭平   end
                        //追加加载数据
                        for (var i = 0; i < datas.rows.length; i++) {
                            $scope.reportData.push(datas.rows[i]);
                            if (IsToDataFlag(datas.rows[i].REPORT_DATE)) {
                                $scope.OneToDataFlag.push(datas.rows[i]);
                            } else if (IsThreeDataFlag(datas.rows[i].REPORT_DATE)) {
                                $scope.ThreeMonthData.push(datas.rows[i]);
                            } else {
                                $scope.HistoryData.push(datas.rows[i]);
                            }
                        }
                        if ($scope.OneToDataFlag.length > 0) {//一天内数据不为空，显示标签
                            $scope.isOneToDataFlag = true;
                        }
                        if ($scope.ThreeMonthData.length > 0) {//三个月内数据不为空，显示标签
                            $scope.isThreeMonthData = true;
                        }
                        if ($scope.HistoryData.length > 0) {//历史数据数据不为空，显示标签
                            $scope.isHistoryData = true;
                        }
                        $scope.currentPage = currentPage + 1; //下一页
                    }

                    //组件页面开启时候的bind值
                    $scope.patientInf = {NUMBER_NO: "", PATIENT_ID: "", NUMBER_NAME: ""};

                    //选卡组件的初始化方法
                    setClientinfo($scope.showPage.NUMBER_INFO);


                    var storageCache = CacheServiceBus.getStorageCache();
                    var memoryCache = CacheServiceBus.getMemoryCache();
                    var hospitalInfo = storageCache.get("hospitalInfo");//当前医院信息
                    var changeHospitalStr = undefined;
                    var message = undefined;
                    var patient = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                    var cardInfo = memoryCache.get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CARD_INFO);

                    /**
                     * 以下为改版前的页面提示逻辑，因不需要发请求耗费资源，暂时保留，后续如果确认不需要，删除
                     */
                    if (data.message != '' && data.message != null && data.message != undefined) {
                        changeHospitalStr = KyeeI18nService.get('index_hosp.preNewLookInfo','如需查看其他医院的最新检查检验记录，请')+'<span style=\"text-decoration: underline;color: #357fbc;\" ng-click=\"goToHospitalView();\">'+KyeeI18nService.get('index_hosp.afterLookInfo','切换医院')+'</span>';
                        if (ReportMultipleService.IS_TAP_TAB && ReportMultipleService.IS_TAP_TAB == 'HOS') {
                            changeHospitalStr = '';
                        }
                        var array = data.message.split('|');
                        if ('REALNAME' == array[0]) {
                            $scope.tips = KyeeI18nService.get('index_hosp.preAuthInfo','您还未完成实名认证，请')+'<span style=\"text-decoration: underline;color: #357fbc;\" ng-click=\"goToAuth();\">'+KyeeI18nService.get('index_hosp.afterAuthInfo','实名认证')+'</span>。' + changeHospitalStr;
                            if (hospitalInfo && hospitalInfo.name) {
                                $scope.emptyText = KyeeI18nService.get('index_hosp.preNoResult','暂未从') + hospitalInfo.name + KyeeI18nService.get('index_hosp.afterNoResult','查取到检查检验结果记录');
                            }
                        } else if ('REALNAMEING' == array[0]) {
                            $scope.tips = KyeeI18nService.get('index_hosp.preRefreshInfo','实名认证中，请稍后下拉刷新查看检查检验记录。') + changeHospitalStr;
                            if (hospitalInfo && hospitalInfo.name) {
                                $scope.emptyText = KyeeI18nService.get('index_hosp.preNoFrom','暂未从') + hospitalInfo.name + KyeeI18nService.get('index_hosp.afterReportInfo','查取到检查检验结果记录');
                            }
                        } else if (queryItem == 1 || queryItem == 2) {
                            //有就诊卡
                            message = ReportMultipleService.messageCard(hospitalInfo, changeHospitalStr, patient, isOpen, haveData, queryItem, cardInfo);
                            $scope.tips = message.tips;
                            $scope.emptyText = message.emptyText;
                        } else {
                            //无就诊卡
                            message = ReportMultipleService.messageNoCard(hospitalInfo, changeHospitalStr, patient, isOpen, haveData, queryItem, cardInfo);
                            $scope.tips = message.tips;
                            $scope.emptyText = message.emptyText;
                        }
                    }
                    //基础校验信息没通过&&选择小趣 ---不显示小趣模块
                } else {
                    $scope.showPage.modelOne = false;//不展示模块1
                    $scope.showPage.modelTwo = false;    //不展示模块二
                    $scope.showPage.modelThree = false; //不展示模块三
                    $scope.showPage.modelFour = false;  //不展示模块四
                    $scope.tips = undefined;
                    $scope.isEmpty = true;
                    $scope.emptyText = KyeeI18nService.get('commonText.networkErrorMsg', '网络异常，请稍后重试！', null);
                }
                $scope.showCon = false;
                //footerClick();
            });
            $scope.$broadcast('scroll.refreshComplete');
        };
        //初始化底部黑框，将字符串编译为html，因改版暂时废弃
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
                    if ((scroll && footbar) || (nullScroll && footbar)) {
                        $scope.ionScrollHeight = (window.innerHeight) + 'px';
                    }
                    $ionicScrollDelegate.scrollTop();
                }
            );
        };
        //上拉加载

        $scope.loadMore = function (isShowLoading, getTerminalFlag) {
            if(isNaN($scope.currentPage)){
                $scope.currentPage=1;
            }
            ReportMultipleService.loadDataHosp($scope.showPage.IS_REQUEST_T,$scope.showPage.IS_AGREE_QY_QUERY,$scope.showPage.IS_SELECT_NUMBER,postdata.USER_VS_ID,$scope.reportSource,startNo, $scope.currentPage, count, $scope, isShowLoading, getTerminalFlag, function (data, success) {
                if (success) {
                    if(data.data.REPORT_INFO){
                        $scope.showPage.REPORT_INFO = JSON.parse(data.data.REPORT_INFO);
                    }
                    var datas = $scope.showPage.REPORT_INFO.rows;
                    //校验数据是否加载完
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
                    if ($scope.OneToDataFlag.length > 0) {//一天内数据不为空，显示标签
                        $scope.isOneToDataFlag = true;
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


        //日期格式化
        $scope.getDate = function (param) {
            if (param && param != "") {
                return KyeeUtilsService.DateUtils.formatFromDate(param, 'YYYY/MM/DD');
            }
        };
        /**
         * 判断是否一个月内数据
         * @param param
         * @returns {boolean}
         * @constructor
         */
        IsThreeDataFlag = function (param) {
            if(param==undefined || param==null || param==""){
                return false;
            }
            var date = new Date(param);
            var now_date = new Date();
            now_date.setMonth(now_date.getMonth() - 1);
            return date > now_date;
        };
        /**
         * 判断是否是同一天的数据
         * @param param
         * @returns {boolean}
         * @constructor
         */
        IsToDataFlag = function (param) {
            if(param==undefined || param==null || param==""){
                return false;
            }
            var date = new Date(param);
            var now_date = new Date();
            return date.toLocaleDateString() == now_date.toLocaleDateString();
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
            ReportMultipleService.detialFlag = true;
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
            ReportMultipleService.detialFlag = true;
            ReportMultipleService.reportSelHos = true;
        };
        //更改配置跳转
        $scope.goToQueryByCard = function () {
            $state.go('mulreport_query_by_card');
            //从设置页面返回时，无查询操作，不需要重新刷新页面，取缓存。
            ReportMultipleService.detialFlag = true;
        };
        //打客服电话
        $scope.click2call = function () {

            KyeePhoneService.callOnly("4000801010");
        };
        $scope.goToAuth = function () {
            //报告单实名认证跳转传入当前就诊者参数 yangmingsi KYEEAPPC-8715
            var patientInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            AuthenticationService.lastClass = "report_multiple";
            AuthenticationService.HOSPITAL_SM = {
                OFTEN_NAME: patientInfo.OFTEN_NAME,
                ID_NO: patientInfo.ID_NO,
                PHONE: patientInfo.PHONE,
                USER_VS_ID: patientInfo.USER_VS_ID,
                FLAG: patientInfo.FLAG
            };
            KyeeViewService.openModalFromUrl({
                scope: $scope,
                url: 'modules/business/center/views/authentication/authentication.html'
            });

        };
        $scope.goToSetPatientInfo = function () {
            ReportMultipleService.setFlag = '<span>'+KyeeI18nService.get("index_hosp.preNoMatchInfo","若就诊者信息与您在医院填写信息不匹配，将查询不到对应的检查检验记录，您可以尝试修改")+'</span><span style=\"text-decoration: underline;color:#264557;\" ng-click=\"goPatientDetail();\">'+KyeeI18nService.get('index_hosp.afterPatientInfo','就诊者信息')+'</span><span>。</span>';
            $state.go('mulreport_query_by_card');
            //从设置页面返回时，无查询操作，不需要重新刷新页面，取缓存。
            ReportMultipleService.detialFlag = true;
            ReportMultipleService.reportUpdatePat = true;
        };
        $scope.delReportData = function (index, itemData, flag) {

            ReportMultipleService.delReportItem(itemData.EXAM_ID, itemData.REPORT_FLAG, itemData.PATIENT_ID, function (data, success) {
                if (success) {
                    if (flag == 1) { //三个月内的
                        $scope.OneToDataFlag.splice(index, 1); //页面先进行显示删除
                        if ($scope.OneToDataFlag.length > 0) {//一天内数据不为空，显示标签
                            $scope.isOneToDataFlag = true;
                        }
                    } else if (flag == 2) { //三个月内的
                        $scope.ThreeMonthData.splice(index, 1); //页面先进行显示删除
                        if ($scope.ThreeMonthData.length > 0) {
                            $scope.isThreeMonthData = true;
                        }
                    } else { //历史的
                        $scope.HistoryData.splice(index, 1); //页面先进行显示删除
                        if ($scope.HistoryData.length > 0) {
                            $scope.isHistoryData = true;
                        }
                    }
                } else {
                    $scope.emptyText = KyeeI18nService.get('commonText.networkErrorMsg', '网络异常，请稍后重试！', null);
                }
            });

        };
        $scope.patientInf = {NUMBER_NO: "", PATIENT_ID: "", NUMBER_NAME: ""};
        /**
         * 过滤就诊卡
         * @param Clientinfo
         */
        var setClientinfo = function (Clientinfo) {
            $scope.Clientinfo = Clientinfo;
            var menus = [];
            if (Clientinfo != null && Clientinfo.length > 0) {
                for (var i = 0; i < Clientinfo.length; i++) {
                    if (Clientinfo[i].IS_SELECTED == '1') {
                        $scope.patientInf.NUMBER_NO = Clientinfo[i].NUMBER_NO;
                        $scope.patientInf.PATIENT_ID = Clientinfo[i].PATIENT_ID;
                        $scope.patientInf.NUMBER_NAME = Clientinfo[i].NUMBER_NAME;
                        break;
                    }
                }
                for (var l = 0; l < Clientinfo.length; l++) {
                    var resultMap = {};
                    resultMap["name"] = Clientinfo[l].NUMBER_NAME;
                    resultMap["text"] = Clientinfo[l].NUMBER_NO;
                    resultMap["value"] = Clientinfo[l].NUMBER_NO;
                    menus.push(resultMap);
                }
            }
            var resultMap = {};
            resultMap["name"] = "";
            if($scope.showPage.QUERY_TYPE == 6){
                resultMap["text"] = KyeeI18nService.get("index_hosp.addNewHosNum","+ 添加新的住院号");
            }else{
                resultMap["text"] = KyeeI18nService.get("index_hosp.addNewPatientCard","+ 添加新的就诊卡");
            }
            resultMap["value"] = -1;
            menus.push(resultMap);
            //控制器中绑定数据
            $scope.pickerItems = menus;

            //KYEEAPPC-8554   by-yangxuping    检查检验单页面 iphone5 信息框，字符过长折行   start
            //对于模块二输入框的长度控制
            if(($scope.QUERY_TYPE == 1 || $scope.QUERY_TYPE == 2) && $scope.showPage.IS_SELECT_NUMBER && $scope.showPage.IS_SELECT_NUMBER.length>0) {
                $scope.showPage.selectSize = window.innerWidth - 90 -18;
                if(parseInt(($scope.showPage.selectSize - 30)/10) < parseInt($scope.showPage.SHOW_FRONT.length) + parseInt($scope.showPage.IS_SELECT_NUMBER.length)){
                    var num = parseInt($scope.showPage.SHOW_FRONT.length) + parseInt($scope.showPage.IS_SELECT_NUMBER.length) - parseInt(($scope.showPage.selectSize - 50)/8);
                    $scope.showPage.IS_SELECT_NUMBER = $scope.showPage.IS_SELECT_NUMBER.substr(0,$scope.showPage.IS_SELECT_NUMBER.length-num-6)+"...";
                }
            }
            else{
                $scope.showPage.selectSize = window.innerWidth - 90 -18;
                //$scope.showPage.selectSize = (18 - $scope.showPage.IS_SELECT_NUMBER.length) * 5;
            }
            //KYEEAPPC-8554   by-yangxuping    检查检验单页面 iphone5 信息框，字符过长折行   end

        };
        setClientinfo($scope.showPage.NUMBER_INFO);
        $scope.tipIsShow = function () {
            $scope.tipsIsShow = false;
        };
        //绑定选择事件
        $scope.bind = function (params) {
            $scope.showPicker = params.show;
        };
        //点击选择就诊卡
        $scope.showpatientCardNo = function () {
            //if (!$scope.pickerItems.length) {
            //    PatientCardService.filteringVirtualCard.isFilteringVirtual=$scope.virtualSupportType;
            //    $state.go("patient_card_select");
            //} else {
            //0:关闭,1:就诊卡,2:就诊卡+姓名,3:身份证号+姓名,4:手机号+姓名,6:住院号
            if($scope.showPage.QUERY_TYPE == 6){
                $scope.title = KyeeI18nService.get("index_hosp.selectHosNum","请选择住院号");
                $scope.showPicker($scope.patientInf.NUMBER_NO);
            }else if($scope.showPage.QUERY_TYPE == 1 || $scope.showPage.QUERY_TYPE == 2){
                $scope.title = KyeeI18nService.get("index_hosp.selectCard","请选择就诊卡");
                $scope.showPicker($scope.patientInf.NUMBER_NO);
            }
            //}
        };
        //选择卡号
        $scope.selectItem = function (params) {
            //将选中的卡号显示到页面上
            $scope.patientInf.NUMBER_NO = params.item.value;
            //申请新卡则不进行选卡操作
            if ($scope.patientInf.NUMBER_NO == -1) {
                ReportMultipleService.addNo = {
                    USER_VS_ID:postdata.USER_VS_ID,
                    INP_NO:$scope.showPage.IS_SELECT_NUMBER,
                    PATIENT_ID:postdata.PATIENT_ID
                };
                if($scope.showPage.QUERY_TYPE == 6){
                    $state.go('add_inpatient_number');
                }else if($scope.showPage.QUERY_TYPE == 1 || $scope.showPage.QUERY_TYPE == 2){
                    var userInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                    PatientCardService.selectUserInfoUsed = {};
                    PatientCardService.selectUserInfoUsed.USER_VS_ID = userInfo.USER_VS_ID;
                    PatientCardService.IsfromIndex_hosp='1';
                    $state.go('patient_card_add');
                }
            }else {
               $scope.showPage.selectSize = window.innerWidth - 90 -18;
                if(parseInt(($scope.showPage.selectSize - 30)/10) < parseInt($scope.showPage.SHOW_FRONT.length) + parseInt(params.item.value.length)){
                    var num = parseInt($scope.showPage.SHOW_FRONT.length) + parseInt(params.item.value.length) - parseInt(($scope.showPage.selectSize - 50)/8);
                    $scope.showPage.IS_SELECT_NUMBER = params.item.value.substr(0,params.item.value.length-num-6)+"...";
                }
                else{
                    $scope.showPage.IS_SELECT_NUMBER = params.item.value;
                }
                // 初始化查询数据
                $scope.doRefresh();
            }
        };
        //去详情页
        $scope.goDetailsPage = function(){
            if($scope.showPage.REPORT_PROJECT && $scope.showPage.REPORT_PROJECT.REPORT_PROJECT){
                ReportMultipleService.reportSupport = JSON.parse($scope.showPage.REPORT_PROJECT.REPORT_PROJECT);
                $state.go('details_page');
            }else{
                ReportMultipleService.reportSupport = undefined;
            }
        };
        //去查住院号页
        $scope.goAddInpatientNumberPage = function(){
            ReportMultipleService.addNo = {
                USER_VS_ID:postdata.USER_VS_ID,
                INP_NO:$scope.showPage.IS_SELECT_NUMBER,
                PATIENT_ID:postdata.PATIENT_ID
            };
            if($scope.showPage.QUERY_TYPE == 6){
                ReportMultipleService.from = 1;
                ReportMultipleService.detialFlag = true;
                $state.go('add_inpatient_number');
            }else if($scope.showPage.QUERY_TYPE == 1 || $scope.showPage.QUERY_TYPE == 2){
                var userInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                PatientCardService.selectUserInfoUsed = {};
                PatientCardService.selectUserInfoUsed.USER_VS_ID = userInfo.USER_VS_ID;
                ReportMultipleService.from = 1;
                ReportMultipleService.detialFlag = true;
                PatientCardService.IsfromIndex_hosp='1';

                $state.go('patient_card_add');
            }else if($scope.showPage.QUERY_TYPE == 3){
                $scope.goToAuth();
            }

        };
        //24小时勾选
        $scope.twentyFour = function(){
            if($scope.showPage.IS_CHECK_PASS == 1){
                if($scope.reportSource == 1){
                    $scope.showPage.IS_REQUEST_T = 1;
                }
                if($scope.showPage.IS_AGREE_QY_QUERY == 0){
                    $scope.showPage.IS_AGREE_QY_QUERY = 1;
                    $scope.showPage.modelOne = false;
                    $scope.showPage.modelFourText =  KyeeI18nService.get("index_hosp.sendMsg","查询到报告单后小趣将短信通知您");
                    $scope.doRefresh();
                }else{
                    $scope.showPage.IS_AGREE_QY_QUERY = 0;
                    $scope.showPage.modelOne = true;
                    $scope.showPage.modelFourText =  KyeeI18nService.get("index_hosp.allow24Qury","允许小趣在24小时内为您查询报告单");
                    $scope.doRefresh();
                }
            }else{
                KyeeMessageService.broadcast({
                    content: $scope.showPage.MESSAGE_SHOW
                });
            }
        };

        //切换页面
        $scope.switchPage = function(){
            $ionicScrollDelegate.$getByHandle('mainScroll').scrollTop();
            $scope.showPage.IS_SELECT_NUMBER = "";
            $scope.showPage.IS_AGREE_QY_QUERY ="";
            $scope.showPage. selectSize=90;
            if($scope.reportSource == 1){
                $scope.reportSource = 0;
                $scope.reportSourceShow = KyeeI18nService.get("index_hosp.clinicReport","门诊检查检验单");
                $scope.reportSourceRight = KyeeI18nService.get("index_hosp.hospitalized","住院");
                if (!ReportMultipleService.detialFlag) {
                    $scope.tipsIsShow = true;
                    $scope.showCon = true;
                    $scope.ionScrollHeight = (window.innerHeight) + 'px';
                    //当前就诊者信息
                    var userInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                    if (userInfo) {
                        postdata.USER_VS_ID = userInfo.USER_VS_ID;
                        //就诊者信息不为空
                        $scope.patientEmpty = "block";
                        $scope.USER_NAME = userInfo.OFTEN_NAME;
                        $scope.idNo = userInfo.ID_NO;
                        $scope.PHONE = userInfo.PHONE;
                        //年龄
                        $scope.AGE = CenterUtilService.ageBydateOfBirth(userInfo.DATE_OF_BIRTH);
                    } else {
                        $scope.patientEmpty = 'none';//就诊者信息为空不显示头部用户信息栏
                    }
                    $scope.isOneToDataFlag = false;
                    $scope.isThreeMonthData = false;
                    $scope.isHistoryData = false;
                    //底部黑框提示
                    $scope.tips = undefined;
                    ReportMultipleService.setFlag = undefined;

                    // 初始化查询数据
                    $scope.doRefresh(true, true);
                }
                ReportMultipleService.detialFlag = false;
            }else{
                $scope.reportSource = 1;
                $scope.reportSourceShow = KyeeI18nService.get("index_hosp.hospitalReport","住院检查检验单");
                $scope.reportSourceRight = KyeeI18nService.get("index_hosp.clinicTittle","门诊");
                if (!ReportMultipleService.detialFlag) {
                    $scope.tipsIsShow = true;
                    $scope.showCon = true;
                    $scope.ionScrollHeight = (window.innerHeight) + 'px';
                    //当前就诊者信息
                    var userInfo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
                    if (userInfo) {
                        postdata.USER_VS_ID = userInfo.USER_VS_ID;
                        //就诊者信息不为空
                        $scope.patientEmpty = "block";
                        $scope.USER_NAME = userInfo.OFTEN_NAME;
                        $scope.idNo = userInfo.ID_NO;
                        $scope.PHONE = userInfo.PHONE;
                        //年龄
                        $scope.AGE = CenterUtilService.ageBydateOfBirth(userInfo.DATE_OF_BIRTH);
                    } else {
                        $scope.patientEmpty = 'none';//就诊者信息为空不显示头部用户信息栏
                    }
                    $scope.isOneToDataFlag = false;
                    $scope.isThreeMonthData = false;
                    $scope.isHistoryData = false;
                    //底部黑框提示
                    $scope.tips = undefined;
                    ReportMultipleService.setFlag = undefined;

                    // 初始化查询数据
                    $scope.doRefresh(true, true);
                }
                ReportMultipleService.detialFlag = false;
            }

        };
        /**
         * 监听物理键返回
         */
        KyeeListenerRegister.regist({
            focus: "report_multiple",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                params.stopAction();        //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.goBack();
            }
        });

        $scope.goBack = function(){
            StatusBarPushService.webJump = undefined;
            $state.go("home->MAIN_TAB");
        };

        var MSG_ID="";//流水号
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
        }
    })
    .build();