/**
 * 产品名称 quyiyuan.
 * 创建用户: zhangming
 * 日期: 2015年11月15日09:05:22
 * 创建原因：检查单详细信息控制器
 * 任务号：KYEEAPPC-4047
 * KYEEAPPC-4372 修改  增加印象及建议   张明  2015.12.02
 * APPCOMMERCIALBUG-2060 对印象或者建议字段为空处理       张明  2016.01.08
 */
new KyeeModule()
    .group("kyee.quyiyuan.report_multiple.exam_detail.controller")
    .require(["kyee.quyiyuan.report_multiple.service","kyee.framework.service.message",])
    .type("controller")
    .name("ExamDetailMultipleController")
    .params(["OperationMonitor","ConsultDoctorListService","$scope","ReportMultipleService","KyeeUtilsService","KyeeViewService","KyeeMessageService","KyeeI18nService","$state","KyeeListenerRegister"])
    .action(function (OperationMonitor,ConsultDoctorListService,$scope,ReportMultipleService,KyeeUtilsService,KyeeViewService,KyeeMessageService,KyeeI18nService,$state,KyeeListenerRegister) {
        $scope.isEmpty = false;
        $scope.imgData = [];//定义图片数组
        $scope.status = true;
        $scope.showDelBtn = true;
        var param=undefined;
        var IS_OPEN_REPORT_CONSULT="";
        var SENIOR_ID="";
        var SENIOR_NAME="";

        //初始化详情文字内容
        $scope.examDetailData = ReportMultipleService.examDetailData;//选中记录的数据
        if($scope.examDetailData.EXAM_SUB_CLASS!=null && $scope.examDetailData.EXAM_SUB_CLASS!=""){
            $scope.examDetailData.TITLE=$scope.examDetailData.EXAM_CLASS+'/'+$scope.examDetailData.EXAM_SUB_CLASS;
        }else{
            $scope.examDetailData.TITLE=$scope.examDetailData.EXAM_CLASS;
        }

        if($scope.examDetailData.IMPRESSION){
            $scope.examDetailData.YXJY=$scope.examDetailData.IMPRESSION;
        }else{
            $scope.examDetailData.YXJY="";
        }

        if($scope.examDetailData.RECOMMENDATION!=null && $scope.examDetailData.RECOMMENDATION!='' && $scope.examDetailData.RECOMMENDATION!=undefined){
            if($scope.examDetailData.YXJY!="" ){
                $scope.examDetailData.YXJY=$scope.examDetailData.YXJY+'/'+$scope.examDetailData.RECOMMENDATION;
            }else{
                $scope.examDetailData.YXJY=$scope.examDetailData.RECOMMENDATION;
            }

        }
        var status = $scope.examDetailData.PICTURE_STATUS;//此条记录是否包含图片 0-不包含图片；1-包含图片；
        var pSouse = $scope.examDetailData.PICTURE_SOURCE;//此条记录是否包含图片 0-影像图片；1-详情图片；
        var labIdKey = $scope.examDetailData.EXAM_ID;
        var pUrl = ReportMultipleService.examDetailData.PHOTO_URL;
        $scope.PHOTO_URL= pUrl;
        if(status && status == 1){
            $scope.status = 1;
        }else{
            $scope.isEmpty = true;
            $scope.emptyText = KyeeI18nService.get('exam_detail.noPicData', '暂无检查单图片信息', null);
        }
        if(ReportMultipleService.pUrl[labIdKey]){
            $scope.PHOTO_URL= ReportMultipleService.pUrl[labIdKey];
        }
        $scope.pSouse = pSouse;
        //若有图片
        if($scope.status == 1 && pSouse == 1){
            if($scope.PHOTO_URL !=null &&  $scope.PHOTO_URL !=undefined &&  $scope.PHOTO_URL!="" && $scope.PHOTO_URL!="null" && $scope.PHOTO_URL!="NULL"){
                ReportMultipleService.pUrl[labIdKey] = $scope.PHOTO_URL;
                $scope.displayPic=true;
            }else{
                //初始化图片内容
                ReportMultipleService.queryExamDetail(ReportMultipleService.examDetailData,function(data,success){
                    if(success){
                        $scope.IS_OPEN_REPORT_CONSULT=data.IS_OPEN_REPORT_CONSULT;
                        SENIOR_ID= data.SENIOR_ID;
                        SENIOR_NAME= data.SENIOR_NAME;

                        var picData = data.data.rows;
                        var len = picData.length;
                        if(len>0){
                            var url = picData[0].PHOTO_URL;
                            if(url){
                                ReportMultipleService.pUrl[labIdKey] = url;
                                $scope.PHOTO_URL = url;
                                $scope.displayPic=true;
                            }else{
                                $scope.isEmpty = true;
                                $scope.emptyText = KyeeI18nService.get('exam_detail.noPicData', '暂无检查单图片信息', null);
                            }
                        }else{
                            $scope.isEmpty = true;
                            $scope.emptyText = KyeeI18nService.get('exam_detail.noPicData', '暂无检查单图片信息', null);
                        }
                    }else{
                        $scope.isEmpty = true;
                        $scope.emptyText =  KyeeI18nService.get('exam_detail.noPicData', '暂无检查单图片信息', null);
                    }
                });
            }
        }else if($scope.status == 1 && pSouse == 0){
            //初始化图片内容
            ReportMultipleService.queryExamDetail(ReportMultipleService.examDetailData,function(data,success){
                if(success){
                    $scope.IS_OPEN_REPORT_CONSULT=data.IS_OPEN_REPORT_CONSULT;
                    SENIOR_ID= data.SENIOR_ID;
                    SENIOR_NAME= data.SENIOR_NAME;

                    var picData = data.data.rows;
                    var len = picData.length;
                    var picArr = [];//图片路径数组
                    if(len>0){
                        for(var i=0;i<len;i++){
                            picArr[i] = 'data:image/jpg;base64,' + picData[i].EXAM_PICTURE;
                        }
                        $scope.imgData = picArr;
                    }else{
                        $scope.isEmpty = true;
                        $scope.emptyText = KyeeI18nService.get('exam_detail.noPicData', '暂无检查单图片信息', null);
                    }
                }else{
                    $scope.isEmpty = true;
                    $scope.emptyText =  KyeeI18nService.get('exam_detail.noPicData', '暂无检查单图片信息', null);
                }
            });
        }else{
            $scope.isEmpty = true;
            $scope.emptyText =  KyeeI18nService.get('exam_detail.noPicData', '暂无检查单图片信息', null);
        }

        //日期格式化
        $scope.getDate = function(param){
            if(param !=undefined && param !=null && param !=""){
                return KyeeUtilsService.DateUtils.formatFromDate(param,'YYYY/MM/DD');
            }
        };

        //点击单张图片显示大图页面
        $scope.clickImg = function(imgData){
            KyeeViewService.openModalFromUrl({
                url : "modules/business/report_multiple/views/exam_detail_img.html",
                scope : $scope,
                animation : "scale-in"
            });
            ReportMultipleService.imgData = imgData;
        };

        //点击大图页面消失
        $scope.removeImgModal = function(id){
            KyeeViewService.removeModal({
                id : id,
                scope : $scope
            });
        };
        // 页面添加监听事件
        KyeeListenerRegister.regist({
            focus: "exam_detail",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                if (params.from == "report_reminder"||
                    params.from == "clinic_report"||
                    params.from == "in_hospital_report") {//从一键理赔进入不显示删除按钮 任务号：KYEEAPPC-8199
                    // 从检查检验提醒进入检查单详情页不显示删除按钮
                    $scope.showDelBtn = false;
                }
                param = params;
            }
        });
        //检查单详细页面删除方法 KYEEAPPC-5034  20160119    张明
        //体检单增加就诊卡校验  KYEEAPPTEST-3497 gaoyulou
        $scope.delExamItem = function (examId,patientId) {
            KyeeMessageService.confirm({
                title: KyeeI18nService.get("commonText.warmTipMsg", "温馨提示"),
                content:KyeeI18nService.get("exam_detail.isDelete","是否确认删除？"),
                onSelect: function (para) {
                    if (para) {
                        ReportMultipleService.delReportItem(examId,'EXAM',patientId,function (data, success) {
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
        $scope.goToConsultNewDoctor =function(){
            ConsultDoctorListService.hospitalId = '';
            ConsultDoctorListService.doctorTypeTmp = 'ALL';
            ConsultDoctorListService.queryText1Tmp = '全部';
            ConsultDoctorListService.defaultDept = {
                code: SENIOR_ID,
                name: SENIOR_NAME
            };
            $state.go("consult_doctor_list");
            OperationMonitor.record("exam_consult_doctor_list", "report");
        }
    })
    .build();