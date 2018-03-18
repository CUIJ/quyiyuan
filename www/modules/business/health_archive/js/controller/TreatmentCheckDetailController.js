/*
 * 产品名称：健康档案
 * 创建人: 王婉
 * 创建日期:2016年11月15日16:11:13
 * 创建原因：检查检验单明细
 */
new KyeeModule()
    .group("kyee.quyiyuan.health.archive.treatment.check.detail.controller")
    .require([
        "kyee.quyiyuan.health.archive.treatment.check.detail.service"
    ])
    .type("controller")
    .name("TreatmentCheckDetailController")
    .params(["$scope", "$state","KyeeI18nService","KyeeMessageService","KyeeListenerRegister","TreatmentCheckDetailService","CacheServiceBus"])
    .action(function ($scope, $state,KyeeI18nService,KyeeMessageService,KyeeListenerRegister,TreatmentCheckDetailService,CacheServiceBus) {

        KyeeListenerRegister.regist({
            focus: "treatment_check_detail",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "both",
            action: function (params) {
                $scope.userSource = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_USER_SOURCE);//用户来源

                 $scope.initCheckDetail();
            }
        });
        $scope.initCheckDetail = function(){

            $scope.reportNo=TreatmentCheckDetailService.CHECK_DETAIL.REPORT_NO;
            $scope.datagenerateDate = TreatmentCheckDetailService.CHECK_DETAIL.TEST_DATE;
            $scope.reportName =  TreatmentCheckDetailService.CHECK_DETAIL.REPORT_NAME;
            $scope.noCheckDetail = false;
            $scope.isExamination = TreatmentCheckDetailService.CHECK_DETAIL.IS_EXAMINATION;//上个页面传过来的0检验1检查
            if($scope.isExamination=='0'){
                $scope.checkTitle = "检验详情";
            }
            $scope.checkDetailList = [];
            var idCardNo = "";
            var name = "";
            var phoneNumber = "";
            var idNo = "";
            var patientName = "";
            if(CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL)&& CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL).state=="my_health_archive"){
                idCardNo = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL).idCard;
                name = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL).name;
                phoneNumber = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.URL_INFO_HOSPITAL).phoneNumber;
            }else{
                var currentCustomPatient = CacheServiceBus.getMemoryCache().get('currentCustomPatient');
                idNo = currentCustomPatient.ID_NO;
                patientName = currentCustomPatient.OFTEN_NAME;
            }
            var param = {
                ID_NO: idNo,
                PATIENT_NAME: patientName,
                NUMBER: TreatmentCheckDetailService.CHECK_DETAIL.NUMBER,
                SOURCE_TYPE: TreatmentCheckDetailService.CHECK_DETAIL.IS_IN_HOSPITAL,
                ORGANIZATION_CODE: TreatmentCheckDetailService.CHECK_DETAIL.ORGANIZATION_CODE,
                REPORT_NO: $scope.reportNo,
                IS_EXAMINATION:$scope.isExamination,//0检查1检验
                idCardNo: idCardNo,
                name: name,
                phoneNumber: phoneNumber
            };
            TreatmentCheckDetailService.getCheckDetail(param,function(result){
                if (result != null && result != "" && result != undefined && result.length > 0) {
                    $scope.noCheckDetail = false;

                    for(var i=0;i<result.length;i++){
                        //0：检验，1：检查
                        //ABNORMAL_ID和TEST_RESULTS_EXCEPTION_ID   1、正常2、异常3、异常偏高4、异常偏低5、无法识别的异常
                        if('0'==result[i].IS_EXAMINATION){
                            //0：检验，1：检查
                            if(result[i].TEST_RESULTS_EXCEPTION_ID!='1'){
                                result[i].IS_SHOW_CANKAO=true;
                            }else{
                                result[i].IS_SHOW_CANKAO=false;
                            }
                        }else{
                            if(result[i].ABNORMAL_ID!='1'){
                                result[i].IS_SHOW_CANKAO=true;
                            }else{
                                result[i].IS_SHOW_CANKAO=false;
                            }
                        }
                        if('0'==$scope.isExamination){
                            $scope.checkDetailList.push(result[i]);
                        }else{
                            $scope.checkDetailList.push(result[0]);
                            break;
                        }
                    }
                } else {
                    $scope.noCheckDetail = true;
                }

            })

        };
        $scope.resultColor = function(reference_range){
            //1、正常2、异常3、异常偏高4、异常偏低5、无法识别的异常
            if(reference_range != null && reference_range != ''){
                //不为1异常
                if(reference_range!='1'){
                    return  'qy-red';  //阳
                }else{
                   // 为1正常
                    return 'qy-green';
                }
            }
        };
        //校验值是否正常（高或者低）
        $scope.resultHighOrLow = function(reference_range){
            //1、正常2、异常3、异常偏高4、异常偏低5、无法识别的异常
            if(reference_range != null && reference_range != ''){
                if(reference_range!='1'){
                    $scope.color = 'red';
                    return 1;  //阳
                }
                if(reference_range=='1'){
                    $scope.color = 'green';
                    return -1; //阴
                }else{
                    return 0;
                }
            }else{
                return 0;
            }
        };
        //单击项目
        $scope.clickCheck = function (item) {
            if(item.IS_SHOW_CANKAO){
                item.IS_SHOW_CANKAO=false;
            }else{
                item.IS_SHOW_CANKAO=true;
            }
        };
    })
    .build();

