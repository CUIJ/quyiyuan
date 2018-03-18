/**
 * 产品名称 quyiyuan.
 * 创建用户: zhangming
 * 日期: 2015年11月5日09:05:22
 * 创建原因：跨院检查检验单service
 *  任务号：KYEEAPPC-4047
 */
'use strict';
new KyeeModule()
    .group("kyee.quyiyuan.report_multiple.service")
    .require(["kyee.framework.service.message",
        "kyee.quyiyuan.center.authentication.service"])
    .type("service")
    .name("ReportMultipleService")
    .params(["HttpServiceBus","KyeeMessageService","$state","KyeeViewService",
        "CacheServiceBus","KyeeI18nService"])
    .action(function(HttpServiceBus,KyeeMessageService,$state,KyeeViewService,CacheServiceBus,KyeeI18nService){
        var def = {
            reportSupport:undefined,
            addNo:{},
            QUERY_TYPE:undefined, //门诊查询方式
            QUERY_TYPE_INHOSPITAL:undefined, //住院查询方式
            storageCache: CacheServiceBus.getStorageCache(),
            pUrl:{},
            goToReport :function(){
                $state.go('report_multiple');
            },
            checkPass:false,
            //任务号：KYEEAPPC-8465   修改分页方法   by——杨旭平
            //获得检查检验初始主数据
            loadData:function(page,rows,$scope,isShowLoading,getTerminalFlag,getData){
                var  card_no="";
                if(def.queryObj){
                    card_no = def.queryObj.card_no;
                }
                var  hospitalId=null;
                if(this.storageCache.get('hospitalInfo') && this.storageCache.get('hospitalInfo').id){
                    hospitalId= this.storageCache.get('hospitalInfo').id;
                }
                if(getTerminalFlag && hospitalId){    //未选择医院时，不往端发请求
                    this.getTerminalReport(hospitalId,card_no);
                }
                //KYEEAPPC-4449  张明   医院TAB页进去之后，只查询当前医院的报告单信息。此处设置参数，供后台匹配查询。
                //2015.12.12  医院主页实现跨院查询功能，is_tap_tab参数失去意义，去掉此参数。
                HttpServiceBus.connect({
                    url : "report/action/ExamActionC.jspx",
                    showLoading:isShowLoading,
                    params : {
                        op : "getAllReportRecord",
                        HOSPITAL_ID:hospitalId,
                        page:page,
                        rowLimit:rows,
                        IS_TAP_TAB: def.IS_TAP_TAB

                    },
                    onSuccess : function(data){
                        if(data !=null ){
                            //数据获取成功
                            if(data.success){
                                getData(data,true);
                            }
                            //数据获取失败
                            else{
                                getData(data,false);
                            }
                        }
                        def.queryObj=undefined;
                    },
                    onError　: function(){
                        getData('',false);
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get('commonText.networkErrorMsg', '网络异常，请稍后重试！', null)
                        });
                        def.queryObj=undefined;
                    }
                })
            },
            //修改者：付添 描述： 查询报告单支持虚拟卡模式前端优化 任务号：KYEEAPPC-8034
            //获得检查检验初始主数据FOR医院
            loadDataHosp:function(isRequestT,isAgreeQyQuery,isSelectNumber,userVsId,reportSource,start,page,rows,$scope,isShowLoading,getTerminalFlag,getData){
                var  card_no="";
                if(def.queryObj){
                    card_no = def.queryObj.card_no;
                }
                var  hospitalId=null;
                if(this.storageCache.get('hospitalInfo') && this.storageCache.get('hospitalInfo').id){
                    hospitalId= this.storageCache.get('hospitalInfo').id;
                }
                HttpServiceBus.connect({
                    url : "report/action/ExamActionC.jspx",
                    showLoading:isShowLoading,
                    params : {
                        op : "queryReportData",
                        IS_REQUEST_T:isRequestT,
                        IS_AGREE_QY_QUERY:isAgreeQyQuery,
                        hospitalID:hospitalId,
                        USER_VS_ID:userVsId,
                        REPORT_SOURCE:reportSource,
                        KEY_NO: function(){
                           // 查询 方式包含就诊卡或住院号 记录 用户当前选中的就诊卡和住院号
                            if($scope.showPage.QUERY_TYPE==1||$scope.showPage.QUERY_TYPE==2||$scope.showPage.QUERY_TYPE==6){
                                return isSelectNumber;
                            }else{
                                return "";
                            }
                        },
                        HOSPITAL_ID:hospitalId,
                        start:start,
                        page:page,
                        rowLimit:rows ,
                        IS_TAP_TAB: "HOS",
                        CLINIC_NUM:def.CLINIC_NUM,
                        INHOSPITAL_NUM:def.INHOSPITAL_NUM
                    },
                    onSuccess : function(data){
                        if(data !=null ){
                            //数据获取成功
                            if(data.success){
                                getData(data,true);
                            }
                            //数据获取失败
                            else{
                                getData(data,false);
                            }
                        }
                        def.queryObj=undefined;
                    },
                    onError　: function(){
                            getData('',false);
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get('commonText.networkErrorMsg', '网络异常，请稍后重试！', null)
                            });
                           def.queryObj=undefined;
                    }
                })
            },
            //请求当前医院下的端数据
            getTerminalReport:function(hospitalId,card_no){
                HttpServiceBus.connect({
                    url : "report/action/ExamActionC.jspx",
                    showLoading:false,
                    params : {
                        op : "getTerminalReport",
                        HOSPITAL_ID:hospitalId,
                        INPUT_CARD_NO:card_no

                    },
                    onSuccess : function(data){
                    },
                    onError　: function(type){

                    }
                })
            },
            //获得检验单详细数据
            queryLabDetail:function($scope,lab_id,testNo,pepottTime,labSource,pictureStatus,getData){
                HttpServiceBus.connect({
                    url : "report/action/ExamActionC.jspx",
                    params : {
                        op : "getLabDetailRecord",
                        EXAM_ID:lab_id,
                        TEST_NO:testNo,
                        REPORT_TIME:pepottTime,
                        LAB_SOURCE:labSource,
                        PICTURE_STATUS:pictureStatus,
                        HOSPITAL_ID_REPORT:def.HOS_ID
                    },
                    onSuccess : function(data){
                        if(data !=null ){
                            //数据获取成功
                            if(data.success){
                                getData(data,true);
                            }
                            //数据获取失败
                            else{
                                getData(data,false);
                            }
                        }
                    },
                    onError　: function(){
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get('commonText.networkErrorMsg', '网络异常，请稍后重试！', null)
                        });
                    }
                })
            },
            //获取检查单详细数据
            queryExamDetail: function (detailData, getData) {
                if (!detailData.LAB_TEST_NO) {
                    detailData.LAB_TEST_NO = "";
                }
                var examDateTime = "";
                if(detailData && detailData.REPORT_DATE){
                    examDateTime = detailData.REPORT_DATE.split(".")[0];
                }
                HttpServiceBus.connect({
                    url: "report/action/ExamActionC.jspx",
                    params: {
                        op: "queryExamPicture",
                        EXAM_DATE_TIME: examDateTime,
                        EXAM_CLASS: detailData.EXAM_CLASS,
                        EXAM_SUB_CLASS: detailData.EXAM_SUB_CLASS,
                        EXAM_PICTURE_SOURCE: detailData.EXAM_SOURCE, //0:表示门诊 1：表示住院
                        PATIENT_ID: detailData.PATIENT_ID,
                        HOSPITAL_ID_REPORT: detailData.HOSPITAL_ID,
                        PICTURE_SOURCE: detailData.PICTURE_SOURCE,
                        EXAM_NO: detailData.LAB_TEST_NO
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            getData(data, true);
                        }
                        else {
                            getData(data, false);
                        }
                    },
                    onError: function () {
                        getData("", false);
                    }
                });
            },
        //逻辑删除一条检查检验数据
            delReportItem:function(report_id,report_type,patient_id,getData){
                HttpServiceBus.connect({
                    url : "report/action/ExamActionC.jspx",
                    showLoading:false,
                    params : {
                        op : "delReportItem",
                        REPORT_ID:report_id,
                        REPORT_TYPE:report_type,
                        PATIENT_ID:patient_id
                    },
                    onSuccess : function(data){
                        if(data !=null ){
                            if(data.success){
                                getData(data,true);
                            }
                            else{
                                getData(data,false);
                            }
                        }
                    },
                    onError　: function(){
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get('commonText.networkErrorMsg', '网络异常，请稍后重试！', null)
                        });
                    }
                });
            },

            message:{},
            /**
             * 有就诊卡 isOpen 1：开通检查 2：开通检验 3：都开通 4：都未开通
             * @param hospitalInfo
             * @param changeHospitalStr
             * @param user
             * @param isOpen
             * @param haveData
             * @param queryItem
             * @param cardInfo
             * @returns {def.message|{}}
             */
            /**
             * 产品名称 quyiyuan.
             * 创建用户: weiwuchao
             * 日期: 2017年3月3日14:53:12
             * 创建原因：检查检验单未开通提示优化
             *  任务号：KYEEAPPC-10214
             */
            messageCard:function(hospitalInfo,changeHospitalStr,user,isOpen,haveData,queryItem,cardInfo){
                var emptyText = KyeeI18nService.get('report_multiple.noData','暂无检查检验单记录');
                var tips = '';
                var _queryItem = undefined;
                var _user = angular.copy(user);
                //门诊查询条件   1:就诊卡 2:就诊卡+姓名,3:身份证号+姓名,4:手机号+姓名
                if((queryItem == 1 || queryItem == 2) && cardInfo && cardInfo.CARD_NO && cardInfo.CARD_TYPE && cardInfo.CARD_TYPE != 0){
                    _queryItem = cardInfo.CARD_NO;
                }else if(queryItem == 3 && user && user.ID_NO){
                    _queryItem = _user.ID_NO.substring(0,3)+'***********'+_user.ID_NO.substring(14,18);
                }else if(queryItem == 4 && user && user.PHONE){
                    _queryItem = _user.PHONE.substring(0,3)+'****'+_user.PHONE.substring(7,11);
                }else{
                    _queryItem = "******";
                }
                if(changeHospitalStr){


                    switch (isOpen){
                        case 1 :
                            switch (haveData){
                                case true :
                                    tips = KyeeI18nService.get('report_multiple.refreshSuccess','已成功为您刷新【')
                                           + hospitalInfo.name
                                           + KyeeI18nService.get('report_multiple.afterRefresh','】的检查记录，该医院未开通门诊检验单查询功能。')
                                           +changeHospitalStr;
                                    emptyText = "";
                                    break;
                                case false :
                                    tips = '';
                                    emptyText =KyeeI18nService.get("report_multiple.preCome","暂未从【")
                                              + hospitalInfo.name
                                              +KyeeI18nService.get("report_multiple.midCome","】查询到")
                                              +user.OFTEN_NAME
                                              +'（'+_queryItem+'）'
                                              +KyeeI18nService.get('report_multiple.midAfterText','的检查单结果，该医院未开通门诊检验单查询功能。试试')
                                              +'<span style=\"text-decoration: underline;color: #357fbc;\" ng-click=\"goToQueryByCard();\">'
                                              +KyeeI18nService.get('report_multiple.afterText','更改')
                                              +'</span>'
                                              +KyeeI18nService.get('report_multiple.lastText','就诊卡号。')
                                              +changeHospitalStr;
                                    break;
                            }
                            break;
                        case 2 :
                            switch (haveData){
                                case true :
                                    tips =KyeeI18nService.get("report_multiple.preHasRefreshText","已成功为您刷新【")
                                          + hospitalInfo.name
                                          + KyeeI18nService.get('report_multiple.midHasRefreshText','】的检验记录，该医院未开通门诊检查单查询功能。')
                                          +changeHospitalStr;
                                    emptyText = "";
                                    break;
                                case false :
                                    tips = '';
                                    emptyText = KyeeI18nService.get("report_multiple.preCome","暂未从【")
                                                + hospitalInfo.name
                                                 +KyeeI18nService.get("report_multiple.midCome","】查询到")
                                                 +user.OFTEN_NAME
                                                  +'（'+_queryItem+')'
                                                 +KyeeI18nService.get('report_multiple.afterTestRet','的检验单结果，该医院未开通门诊检查单查询功能。试试')
                                                 +'<span style=\"text-decoration: underline;color: #357fbc;\" ng-click=\"goToQueryByCard();\">'
                                                 +KyeeI18nService.get('report_multiple.afterChange','更改')+'</span>'
                                                 +KyeeI18nService.get('report_multiple.lastTextCard','就诊卡号。')
                                                 +changeHospitalStr;
                                    break;
                            }
                            break;
                        case 3 :
                            switch (haveData){
                                case true :
                                    tips = KyeeI18nService.get("report_multiple.preHasRefreshText","已成功为您刷新【")
                                            + hospitalInfo.name
                                            + KyeeI18nService.get('report_multiple.midTestReport','】的检查检验记录。')
                                           +changeHospitalStr;
                                    emptyText = "";
                                    break;
                                case false :
                                    tips = '';
                                    emptyText = KyeeI18nService.get("report_multiple.preCome","暂未从【")
                                                + hospitalInfo.name
                                                 + KyeeI18nService.get("report_multiple.midCome","】查询到")
                                                 +user.OFTEN_NAME
                                                 +'（'+_queryItem+'）'
                                                 +KyeeI18nService.get('report_multiple.afterAllReport','的检查检验单结果。试试')
                                                 +'<span style=\"text-decoration: underline;color: #357fbc;\" ng-click=\"goToQueryByCard();\">'
                                                 +KyeeI18nService.get('report_multiple.afterChange','更改')
                                                 +'</span>'
                                                 +KyeeI18nService.get('report_multiple.lastTextCard','就诊卡号。')
                                                 +changeHospitalStr;
                                    break;
                            }
                            break;
                        case 4 :
                            switch (haveData){
                                case true :
                                   /* tips =KyeeI18nService.get("report_multiple.preHasRefreshText","已成功为您刷新【")
                                           + hospitalInfo.name
                                           +KyeeI18nService.get('report_multiple.midHosText','】的住院检查检验记录，该医院未开通门诊检查检验单查询功能。')
                                           +changeHospitalStr;*/
                                    tips =KyeeI18nService.get("report_multiple.preNewText","【")
                                         +hospitalInfo.name
                                         +KyeeI18nService.get('report_multiple.midHosText','】暂未开通检查检验单查询功能。')
                                         +changeHospitalStr;
                                    emptyText =KyeeI18nService.get('report_multiple.noData','暂无检查检验单记录');
                                    break;
                                case false :
                                    tips = '';
                                  /*  emptyText = KyeeI18nService.get("report_multiple.preCome","暂未从【")
                                                + hospitalInfo.name
                                                 + KyeeI18nService.get("report_multiple.midCome","】查询到")
                                                 +user.OFTEN_NAME
                                                 +'（'+_queryItem+'）'
                                                 +KyeeI18nService.get('report_multiple.afterAllReportText','的检查检验单结果，该医院未开通门诊检查检验单查询功能。试试')
                                                 +'<span style=\"text-decoration: underline;color: #357fbc;\" ng-click=\"goToQueryByCard();\">'
                                                 +KyeeI18nService.get('report_multiple.afterChange','更改')
                                                 +'</span>'
                                                 +KyeeI18nService.get('report_multiple.lastTextCard','就诊卡号。')
                                                 +changeHospitalStr;*/
                                    //修改者：魏武超 描述： 医院未开通检查检验单功能的提示语优化 任务号：KYEEAPPC-10214
                                    emptyText= KyeeI18nService.get('report_multiple.nofunction','该医院未开通检查检验单查询功能,')+changeHospitalStr;
                                    break;
                            }
                            break;
                    }
                }else{
                    switch (isOpen){
                        case 1 :
                            switch (haveData){
                                case true :
                                    tips = KyeeI18nService.get('report_multiple.refreshSuccessReportInfo','已成功为您刷新该医院的检查记录，该医院未开通门诊检验单查询功能。若未查到相关记录，')
                                          +'<span style=\"text-decoration: underline;color: #357fbc;\" ng-click=\"goToQueryByCard();\">'
                                          +KyeeI18nService.get('report_multiple.afterChange','更改')
                                          +'</span>'
                                          +KyeeI18nService.get('report_multiple.lastCardTryText','就诊卡号试试看');
                                    emptyText = '';
                                    break;
                                case false :
                                    tips = '';
                                    emptyText = KyeeI18nService.get('report_multiple.preQueryNoText','暂未查询到')
                                               +user.OFTEN_NAME
                                               +'（'+_queryItem+'）'
                                               +KyeeI18nService.get('report_multiple.midQueryNoText','的检查单结果，该医院未开通门诊检验单查询功能。您可以试试')
                                               +'<span style=\"text-decoration: underline;color: #357fbc;\" ng-click=\"goToQueryByCard();\">'
                                               +KyeeI18nService.get('report_multiple.afterChange','更改')
                                               +'</span>'
                                               +KyeeI18nService.get('report_multiple.lastTextCard','就诊卡号。');
                                    break;
                            }
                            break;
                        case 2 :
                            switch (haveData){
                                case true :
                                    tips = KyeeI18nService.get('report_multiple.preSuccessRefreshTip','已成功为您刷新该医院的检验记录，该医院未开通门诊检查单查询功能。若未查到相关记录，')
                                           +'<span style=\"text-decoration: underline;color: #357fbc;\" ng-click=\"goToQueryByCard();\">'
                                           +KyeeI18nService.get('report_multiple.afterChange','更改')
                                           +'</span>'
                                           +KyeeI18nService.get('report_multiple.lastCardTryText','就诊卡号试试看');
                                    emptyText = '';
                                    break;
                                case false :
                                    tips = '';
                                    emptyText = KyeeI18nService.get('report_multiple.preQueryNoText','暂未查询到')
                                                +user.OFTEN_NAME
                                                +'（'+_queryItem+'）'
                                                +KyeeI18nService.get('report_multiple.midTestFailTip','的检验单结果，该医院未开通门诊检查单查询功能。您可以试试')
                                                +'<span style=\"text-decoration: underline;color: #357fbc;\" ng-click=\"goToQueryByCard();\">'
                                                +KyeeI18nService.get('report_multiple.afterChange','更改')
                                                +'</span>'
                                                +KyeeI18nService.get('report_multiple.lastTextCard','就诊卡号。');
                                    break;
                            }
                            break;
                        case 3 :
                            switch (haveData){
                                case true :
                                    tips = '';
                                    emptyText = '';
                                    break;
                                case false :
                                    tips = '';
                                    emptyText =  KyeeI18nService.get('report_multiple.preQueryNoText','暂未查询到')
                                               +user.OFTEN_NAME
                                               +'（'+_queryItem+'）'
                                               +KyeeI18nService.get('report_multiple.midTryAllReport','的检查检验单结果。您可以试试')
                                               +'<span style=\"text-decoration: underline;color: #357fbc;\" ng-click=\"goToQueryByCard();\">'
                                               +KyeeI18nService.get('report_multiple.afterChange','更改')
                                               +'</span>'
                                               +KyeeI18nService.get('report_multiple.lastTextCard','就诊卡号。');
                                    break;
                            }
                            break;
                        case 4 :
                            switch (haveData){
                                case true :
                                   /* tips = KyeeI18nService.get('report_multiple.preHosCloseTip','已成功为您刷新该医院的住院检查检验记录，该医院未开通门诊检查检验单查询功能。若未查到相关记录，')
                                           +'<span style=\"text-decoration: underline;color: #357fbc;\" ng-click=\"goToQueryByCard();\">'
                                           +KyeeI18nService.get('report_multiple.afterChange','更改')
                                           +'</span>'
                                           +KyeeI18nService.get('report_multiple.lastCardTryText','就诊卡号试试看');*/
                                    tips=KyeeI18nService.get("report_multiple.preNewText","【")
                                         +hospitalInfo.name
                                         + KyeeI18nService.get('report_multiple.midHosText','】暂未开通检查检验单查询功能。')
                                         + KyeeI18nService.get('index_hosp.preLookInfo','如需查看其他医院的检查检验单记录，请')
                                         +'<span style=\"text-decoration: underline;color: #357fbc;\" ng-click=\"goToHospitalView();\">'
                                         +KyeeI18nService.get('index_hosp.afterLookInfo','切换医院')
                                         +'</span>';
                                    emptyText = KyeeI18nService.get('report_multiple.noData','暂无检查检验单记录');
                                    break;
                                case false :
                                    tips = '';
                                  /*  emptyText = KyeeI18nService.get('report_multiple.preQueryNoText','暂未查询到')
                                               +user.OFTEN_NAME
                                               +'（'+_queryItem+'）'
                                               +KyeeI18nService.get('report_multiple.afterAllReportText','的检查检验单结果，该医院未开通门诊检查检验单查询功能。试试')
                                               +'<span style=\"text-decoration: underline;color: #357fbc;\" ng-click=\"goToQueryByCard();\">'
                                               +KyeeI18nService.get('report_multiple.afterChange','更改')
                                               +'</span>'
                                               +KyeeI18nService.get('report_multiple.lastTextCard','就诊卡号。');*/
                                    //修改者：魏武超 描述： 医院未开通检查检验单功能的提示语优化 任务号：KYEEAPPC-10214
                                    emptyText= KyeeI18nService.get('report_multiple.nofunction','该医院未开通检查检验单查询功能,')
                                             +  KyeeI18nService.get('index_hosp.preLookInfo','如需查看其他医院的检查检验单记录，请')
                                             +'<span style=\"text-decoration: underline;color: #357fbc;\" ng-click=\"goToHospitalView();\">'
                                             +KyeeI18nService.get('index_hosp.afterLookInfo','切换医院')
                                             +'</span>';
                                    break;
                            }
                            break;
                        default :  break;
                    }
                }
                def.message = {
                    tips: tips,
                    emptyText: emptyText
                };
                return def.message;
            },
            /**
             * 无就诊卡 isOpen 1：开通检查 2：开通检验 3：都开通 4：都未开通
             * @param hospitalInfo
             * @param changeHospitalStr
             * @param user
             * @param isOpen
             * @param haveData
             * @param queryItem
             * @param cardInfo
             * @returns {def.message|{}}
             */

           /* * 产品名称 quyiyuan.
              * 创建用户: weiwuchao
              * 日期: 2017年3月3日16:34:56
              * 创建原因：检查检验单未开通提示优化
              *  任务号：APPREQUIREMENT-2241
          */
            messageNoCard:function(hospitalInfo,changeHospitalStr,user,isOpen,haveData,queryItem,cardInfo){
                var emptyText = KyeeI18nService.get('report_multiple.noData','暂无检查检验单记录');
                var tips = '';
                var _queryItem = undefined;
                var _user = angular.copy(user);
                //门诊查询条件   1:就诊卡 2:就诊卡+姓名,3:身份证号+姓名,4:手机号+姓名
                if((queryItem == 1 || queryItem == 2) && cardInfo && cardInfo.CARD_NO && cardInfo.TYPE && cardInfo.TYPE != 0){
                    _queryItem = cardInfo.CARD_NO;
                }else if(queryItem == 3 && user && user.ID_NO){
                    _queryItem = _user.ID_NO.substring(0,3)+'***********'+_user.ID_NO.substring(14,18);
                }else if(queryItem == 4 && user && user.PHONE){
                    _queryItem = _user.PHONE.substring(0,3)+'****'+_user.PHONE.substring(7,11);
                }else{
                    _queryItem = "******";
                }

                if(changeHospitalStr){
                    switch (isOpen){
                        case 1 :
                            switch (haveData){
                                case true :
                                    tips = KyeeI18nService.get("report_multiple.preHasRefreshText","已成功为您刷新【")
                                           + hospitalInfo.name
                                           + KyeeI18nService.get('report_multiple.midHosCantQueryClinicReport','】的检查记录，该医院未开通门诊检验单查询功能。')
                                           +changeHospitalStr;
                                    emptyText = "";
                                    break;
                                case false :
                                    tips = '';
                                    emptyText = KyeeI18nService.get("report_multiple.preCome","暂未从【")
                                                + hospitalInfo.name
                                                 +  KyeeI18nService.get("report_multiple.midCome","】查询到")
                                                 +user.OFTEN_NAME
                                              +'（'+_queryItem+'）'
                                             +KyeeI18nService.get('report_multiple.afterCloseQueryText','的检查单结果，该医院未开通门诊检验单查询功能。')
                                              +changeHospitalStr;
                                    break;
                            }
                            break;
                        case 2 :
                            switch (haveData){
                                case true :
                                    tips = KyeeI18nService.get("report_multiple.preHasRefreshText","已成功为您刷新【")
                                           + hospitalInfo.name
                                           + KyeeI18nService.get('report_multiple.midHasRefreshText','】的检验记录，该医院未开通门诊检查单查询功能。')
                                           +changeHospitalStr;
                                    emptyText = "";
                                    break;
                                case false :
                                    tips = '';
                                    emptyText = KyeeI18nService.get("report_multiple.preCome","暂未从【")
                                                + hospitalInfo.name
                                                + KyeeI18nService.get("report_multiple.midCome","】查询到")
                                                +user.OFTEN_NAME
                                                +'（'+_queryItem+'）'
                                                +KyeeI18nService.get('report_multiple.heateThisWorld','的检验单结果，该医院未开通门诊检查单查询功能。')
                                                +changeHospitalStr;
                                    break;
                            }
                            break;
                        case 3 :
                            switch (haveData){
                                case true :
                                    tips =  KyeeI18nService.get("report_multiple.preHasRefreshText","已成功为您刷新【")
                                           + hospitalInfo.name
                                           +  KyeeI18nService.get('report_multiple.midTestReport','】的检查检验记录。')
                                           +changeHospitalStr;
                                    emptyText = "";
                                    break;
                                case false :
                                    tips = '';
                                    emptyText = KyeeI18nService.get("report_multiple.preCome","暂未从【")
                                               + hospitalInfo.name
                                               + KyeeI18nService.get("report_multiple.midCome","】查询到")
                                               +user.OFTEN_NAME+'（'+_queryItem+'）'
                                               +KyeeI18nService.get('report_multiple.allReportTextRet','的检查检验单结果。')
                                               +changeHospitalStr;
                                    break;
                            }
                            break;
                        case 4 :
                            switch (haveData){
                                case true :
                                    tips =KyeeI18nService.get("report_multiple.preNewText","【")
                                          +hospitalInfo.name
                                          +KyeeI18nService.get('report_multiple.midHosText','】暂未开通检查检验单查询功能。')
                                          +changeHospitalStr;
                                    emptyText =  KyeeI18nService.get('report_multiple.noData','暂无检查检验单记录');
                                    break;
                                case false :
                                    tips = '';
                                    /*emptyText =  KyeeI18nService.get("report_multiple.preCome","暂未从【")
                                                + hospitalInfo.name
                                                + KyeeI18nService.get("report_multiple.midCome","】查询到")
                                                +user.OFTEN_NAME+'（'+_queryItem+'）'
                                                +KyeeI18nService.get('report_multiple.pleaseEnd','的检查检验单结果，该医院未开通门诊检查检验单查询功能。')
                                                +changeHospitalStr;*/
                                    //修改者：魏武超 描述： 医院未开通检查检验单功能的提示语优化 任务号：KYEEAPPC-10214
                                    emptyText= KyeeI18nService.get('report_multiple.nofunction','该医院未开通检查检验单查询功能,')+changeHospitalStr;
                                    break;
                            }
                            break;
                    }
                }else{
                    switch (isOpen){
                        case 1 :
                            switch (haveData){
                                case true :
                                    tips = KyeeI18nService.get('report_multiple.iPressEnd','已成功为您刷新该医院的检查记录，该医院未开通门诊检验单查询功能');
                                    emptyText = '';
                                    break;
                                case false :
                                    tips = '';
                                    emptyText = KyeeI18nService.get('report_multiple.preQueryNoText','暂未查询到')
                                               +user.OFTEN_NAME
                                               +'（'+_queryItem+'）'
                                               +KyeeI18nService.get('report_multiple.afterCloseQueryText','的检查单结果，该医院未开通门诊检验单查询功能。');
                                    break;
                            }
                            break;
                        case 2 :
                            switch (haveData){
                                case true :
                                    tips = KyeeI18nService.get('report_multiple.hasSuccessRefreshTextBig','已成功为您刷新该医院的检验记录，该医院未开通门诊检查单查询功能');
                                    emptyText = '';
                                    break;
                                case false :
                                    tips = '';
                                    emptyText =  KyeeI18nService.get('report_multiple.preQueryNoText','暂未查询到')
                                                +user.OFTEN_NAME
                                                  +'（'+_queryItem+'）'
                                                 +KyeeI18nService.get('report_multiple.heateThisWorld','的检验单结果，该医院未开通门诊检查单查询功能。');
                                    break;
                            }
                            break;
                        case 3 :
                            switch (haveData){
                                case true :
                                    tips = '';
                                    emptyText = '';
                                    break;
                                case false :
                                    tips = '';
                                    emptyText =  KyeeI18nService.get('report_multiple.preQueryNoText','暂未查询到')
                                                 +user.OFTEN_NAME
                                                 +'（'+_queryItem+'）'
                                                 +KyeeI18nService.get('report_multiple.allReportTextRet','的检查检验单结果。');
                                    break;
                            }
                            break;
                        case 4 :
                            switch (haveData){
                                case true :
                                   /* tips = KyeeI18nService.get('report_multiple.madTextLastOne','已成功为您刷新该医院的住院检查检验记录，该医院未开通门诊检查检验单查询功能');*/
                                    tips=KyeeI18nService.get("report_multiple.preNewText","【")
                                        +hospitalInfo.name
                                        + KyeeI18nService.get('report_multiple.midHosText','】暂未开通检查检验单查询功能。')
                                        + KyeeI18nService.get('index_hosp.preLookInfo','如需查看其他医院的检查检验单记录，请')
                                        +'<span style=\"text-decoration: underline;color: #357fbc;\" ng-click=\"goToHospitalView();\">'
                                        +KyeeI18nService.get('index_hosp.afterLookInfo','切换医院')
                                        +'</span>';
                                    emptyText = KyeeI18nService.get('report_multiple.noData','暂无检查检验单记录');
                                    break;
                                case false :
                                    tips = '';
                                    /*emptyText = KyeeI18nService.get('report_multiple.preQueryNoText','暂未查询到')
                                               +user.OFTEN_NAME
                                               +'（'+_queryItem+'）'
                                               +KyeeI18nService.get('report_multiple.iAmMadLast','的住院检查检验单结果，该医院未开通门诊检查检验单查询功能');*/
                                    //修改者：魏武超 描述： 医院未开通检查检验单功能的提示语优化 任务号：KYEEAPPC-10214
                                    emptyText= KyeeI18nService.get('report_multiple.nofunction','该医院未开通检查检验单查询功能,')
                                               +  KyeeI18nService.get('index_hosp.preLookInfo','如需查看其他医院的检查检验单记录，请')
                                               +'<span style=\"text-decoration: underline;color: #357fbc;\" ng-click=\"goToHospitalView();\">'
                                               +KyeeI18nService.get('index_hosp.afterLookInfo','切换医院')
                                               +'</span>';
                                    break;
                            }
                            break;
                    }
                }
                def.message = {
                    tips: tips,
                    emptyText: emptyText
                };
                return def.message;
            },
            addHospNo:function(postdata,onSuccess){
                HttpServiceBus.connect({
                    url : "report/action/ExamActionC.jspx",
                    params : {
                        op : "addInpatienNumber",
                        postdata:postdata,
                        HOSPITAL_ID : function () {
                            //获取 StorageCache 服务
                            var storageCache = CacheServiceBus.getStorageCache();
                            var hospitalInfo = storageCache.get("hospitalInfo");
                            if (hospitalInfo != null) {
                                return hospitalInfo.id;
                            }
                            return null;
                        }
                    },
                    onSuccess : function(data){
                        onSuccess(data);
                    },
                    onError　: function(type){
                    }
                })
            },
       /*
        *校验用户信息并获得流水号
        */
        getCheckAndCode :function(onSuccess){
            HttpServiceBus.connect({
                url: '/report/action/ExamActionC.jspx',
                params: {
                    op: 'checkPatientInfoAndSendMsg'
                },
                onSuccess: function (retVal) {
                    onSuccess(retVal);
                    setTimeout(function () {
                        def.onRefreshDataviewDelay();
                    }, 100);
                },
                onError:function(){
                    KyeeMessageService.broadcast({
                        content: "网络连接异常！"
                    });
                }
            });
        },
        /**
         * *  进入倒计时
         */
        onRefreshDataviewDelay: function () {
            def.second = 60;
            var validateMsg = document.getElementById("report.validateMsg");
            def.task = window.setInterval(def.setBtnState, 1000, validateMsg);
            },
            /**
             * 修改页面元素倒计时
             * @param validateMsgBtn
             * @param phoneNumInput
             */
            setBtnState: function (validateMsg) {
                try {
                    if (def.second != -1) {
                        //直接操作$scope中的模型效率低下并且页面无法更新,因此直接操作dom
                        validateMsg.innerText =
                        "重新获取" +"("
                           + def.second +
                         ")";
                        def.second--;
                    } else {
                        def.second = 60;
                        if(!def.checkPass){
                            clearInterval(def.task);
                            def.onRefreshDataviewDelay();
                        }else{
                            clearInterval(def.task);
                        }
                    }
                } catch (e) {
                    clearInterval(def.task);
                }
            },
            toCommit : function(MSG_ID,CHECK_CODE,onSuccess){
                HttpServiceBus.connect({
                    url: '/report/action/ExamActionC.jspx',
                    params: {
                        op: 'checkMsgAndMsdId',
                        MSG_ID:MSG_ID,
                        CHECK_CODE:CHECK_CODE
                    },
                    onSuccess: function (retVal) {
                        if(retVal.success){
                            def.checkPass = true;
                        }else{
                            def.checkPass = false;
                        }
                        onSuccess(retVal);
                    },
                    onError:function(){
                        def.checkPass = false;
                        KyeeMessageService.broadcast({
                            content: "网络连接异常！"
                        });
                    }
                });
            }
        }
        return def;
    })
    .build();