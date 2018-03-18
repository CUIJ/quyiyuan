/**
 * 产品名称 quyiyuan.
 * 创建用户: zhangming
 * 日期: 2015年11月17日12:01:26
 * 创建原因：跨院检查检验单  --检验单明细
 * 任务号：KYEEAPPC-4047
 * 修改：KYEEAPPC-4887  张明 对异常值默认展开参考值范围
 */
new KyeeModule()
    .group("kyee.quyiyuan.report_multiple.lab_detail.controller")
    .require(["kyee.quyiyuan.report_multiple.service"])
    .type("controller")
    .name("LabDetailMultipleController")
    .params(["OperationMonitor","ConsultDoctorListService","$scope","ReportMultipleService","KyeeViewService","KyeeUtilsService","KyeeI18nService","$state","KyeeMessageService","KyeeListenerRegister"])
    .action(function(OperationMonitor,ConsultDoctorListService,$scope,ReportMultipleService,KyeeViewService,KyeeUtilsService,KyeeI18nService,$state,KyeeMessageService,KyeeListenerRegister){
        //初始化数据
        $scope.displayPic = false; //是否显示图片
        $scope.project = false;
        $scope.isLabDetailEmpty=false;
        $scope.labDetailData=[];
        var lab_id=ReportMultipleService.LAB_ID;
        $scope.showDelBtn = true;

        $scope.LAB_ID=ReportMultipleService.LAB_ID;
        $scope.LAB_ITEM=ReportMultipleService.LAB_ITEM;
        $scope.LAB_TEST_NO=ReportMultipleService.LAB_TEST_NO;
        $scope.REPORT_DATE=ReportMultipleService.REPORT_DATE;
        $scope.PHOTO_URL=ReportMultipleService.PHOTO_URL;
		//把就诊卡传给检查单详情页面 KYEEAPPTEST-3497 gaoyulou
        $scope.PATIENT_ID = ReportMultipleService.PATIENT_ID;

        var IS_OPEN_REPORT_CONSULT="";
        var SENIOR_ID="";
        var SENIOR_NAME="";

        var labIdKey = ReportMultipleService.LAB_ID;
        if(ReportMultipleService.pUrl[labIdKey]){
            $scope.PHOTO_URL= ReportMultipleService.pUrl[labIdKey];
        }
        if($scope.PHOTO_URL !=null &&  $scope.PHOTO_URL !=undefined &&  $scope.PHOTO_URL!="" && $scope.PHOTO_URL!="null" && $scope.PHOTO_URL!="NULL"){
            ReportMultipleService.pUrl[labIdKey] = $scope.PHOTO_URL;
            $scope.displayPic=true;
        }else{
            var testNo = ReportMultipleService.TEST_NO;
            var pepottTime = ReportMultipleService.REPORT_TIME;
            var labSource = ReportMultipleService.LAB_SOURCE;
            var pictureStatus = ReportMultipleService.PICTURE_STATUS;
            ReportMultipleService.queryLabDetail($scope,lab_id,testNo,pepottTime,labSource,pictureStatus,function(data,success){
                if(success){
                    if(data.data.total>0){
                        $scope.IS_OPEN_REPORT_CONSULT=data.IS_OPEN_REPORT_CONSULT;
                        SENIOR_ID= data.SENIOR_ID;
                        SENIOR_NAME= data.SENIOR_NAME;

                        var datas =data.data.rows;
                        if(datas && datas.length>0 && datas[0].PHOTO_URL){
                            $scope.PHOTO_URL = datas[0].PHOTO_URL;
                            ReportMultipleService.pUrl[labIdKey] = $scope.PHOTO_URL;
                            $scope.displayPic=true;
                        }else{
                            for(var i=0;i<datas.length;i++){
                                if(datas[i].ABNORMAL_INDICATOR=="H" || datas[i].ABNORMAL_INDICATOR=="L"){
                                    datas[i].IS_SHOW_CANKAO=true;   //参考值展示标识
                                }else{
                                    datas[i].IS_SHOW_CANKAO=false;
                                }
                                $scope.labDetailData.push(datas[i]);
                            }
                            $scope.project = true;
                        }
                    }else{
                        $scope.isLabDetailEmpty=true;
                        $scope.LabDetailEmptyText=KyeeI18nService.get('lab_detail.nolabdetailData', '暂无明细数据，请稍后重试', null);
                    }
                }else{
                    $scope.isLabDetailEmpty=true;
                    $scope.LabDetailEmptyText=KyeeI18nService.get('lab_detail.nolabdetailData', '暂无明细数据，请稍后重试', null);
                }
            });
        }


        //单击项目
        $scope.clickItem = function (labDetailDataItem) {
            if(labDetailDataItem.IS_SHOW_CANKAO){
                labDetailDataItem.IS_SHOW_CANKAO=false;
            }else{
                labDetailDataItem.IS_SHOW_CANKAO=true;
            }
        };
        //校验值是否正常（高或者低）
        $scope.checkHighOrLow = function(reference_range){
            if(reference_range != null && reference_range != ''){
                if(reference_range=='H'){
                    $scope.color = 'red';
                    return 1;  //阳
                }
                if(reference_range=='L'){
                    $scope.color = 'red';
                    return -1; //阴
                }else{
                    return 0;
                }
            }else{
                return 0;
            }
        };
        $scope.HighOrLowColor = function(reference_range){
            if(reference_range != null && reference_range != ''){
                if(reference_range=='H'){
                    return  'qy-red';  //阳
                }
                if(reference_range=='L'){
                    return 'qy-red'; //阴
                }else{
                    return '';
                }
            }
        };
        //日期格式化
        $scope.getDate = function(param){
            if(param !=undefined && param !=null && param !=""){
                return KyeeUtilsService.DateUtils.formatFromDate(param,'YYYY/MM/DD');
            }
        };
        //为国际化准备数据
        $scope.Language={};
        $scope.Language.LAB_TEST_NO=$scope.LAB_TEST_NO;
        //检查单详细页面删除方法 KYEEAPPC-5034  20160119    张明
        //添加就诊卡校验 KYEEAPPTEST-3497
        $scope.delLabItem = function (labId,patientId) {
            KyeeMessageService.confirm({
                title: KyeeI18nService.get("commonText.warmTipMsg", "温馨提示"),
                content:KyeeI18nService.get("lab_detail.isDelete","是否确认删除？"),
                onSelect: function (para) {
                    if (para) {
                        ReportMultipleService.delReportItem(labId,'LAB',patientId,function (data, success) {
                            if(success){
                                if(param.from == "index_hosp"){//医院主页过来的报告单
                                    $state.go('index_hosp');
                                }else{
                                    ReportMultipleService.detialFlag=false;//删除后返回到主页面需要刷新重新拉取数据
                                    $state.go('report_multiple');
                                }
                            }else{
                                $scope.emptyText = KyeeI18nService.get('commonText.networkErrorMsg', '网络异常，请稍后重试！', null);

                            }
                        });

                    }
                }
            });
        };

        // 页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "lab_detail",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                if (params.from == "report_reminder"||
                    params.from == "clinic_report"||//从一键理赔进入不显示删除按钮
                    params.from == "in_hospital_report") {
                    // 从检查检验提醒进入检查单详情页不显示删除按钮
                    $scope.showDelBtn = false;
                }
                param = params;
            }
        });

        $scope.goToConsultNewDoctor =function(){
            ConsultDoctorListService.hospitalId = '';
            ConsultDoctorListService.doctorTypeTmp = 'ALL';
            ConsultDoctorListService.queryText1Tmp = '全部';
            ConsultDoctorListService.defaultDept = {
                code: SENIOR_ID,
                name: SENIOR_NAME
            };
            $state.go("consult_doctor_list");
            OperationMonitor.record("lab_consult_doctor_list", "report");
        }
    })
    .build();