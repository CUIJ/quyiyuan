/**
 * 产品名称：quyiyuan
 * 创建者：程铄闵
 * 创建时间：2016年10月8日10:34:08
 * 创建原因：门诊缴费凭证控制器
 * 任务号：KYEEAPPC-8138
 */
new KyeeModule()
    .group("kyee.quyiyuan.clinicClaim.controller")
    .require([
        "kyee.quyiyuan.clinicClaim.service",
        "kyee.quyiyuan.claim_inpatient_general.controller"
    ])
    .type("controller")
    .name("ClinicClaimController")
    .params(["$scope", "$state","ClinicClaimService", "ClinicPaidService","AppointmentRegistDetilService",
        "KyeeMessageService","$ionicScrollDelegate","KyeeI18nService","PaidRecordService","AccidentRecordsService","KyeeListenerRegister"])
    .action(function ($scope, $state, ClinicClaimService, ClinicPaidService,AppointmentRegistDetilService,
                      KyeeMessageService,$ionicScrollDelegate,KyeeI18nService,PaidRecordService,AccidentRecordsService,KyeeListenerRegister) {

        var currentPage = 0;//当前页数
        var rows = 20;//一页加载20条
        var total = 0;//记录总数

        //初始化
        var init = function(){
            currentPage = 0;//当前页数
            rows = 20;//一页加载20条
            total = 0;//记录总数
            //获取上一页照片数据
            $scope.picTotal = AccidentRecordsService.pictureTotal;
            $scope.paidALLData = [];
            $scope.paidData = [];
            $scope.isLargeChannel=false;
        };
    
        //刷新
        $scope.loadData = function () {
            ClinicClaimService.getClinicData(function (success,data,largeChannelMsg) {
                $scope.noLoad = false;//默认加载完成
                if(success){
                    if(largeChannelMsg&&'isLargeChannel'==largeChannelMsg){
                        $scope.isLargeChannel=true;
                    }
                    else{
                        $scope.isLargeChannel=false;
                    }
                    $scope.isChooseFir = false;
                    $scope.paidALLData = data;
                    total = data.length;//记录总数
                    if(total<=0){
                        $scope.isChooseFir = true;
                    }
                    else if(total>0 && total <= rows){
                        $scope.paidData = data;
                    }
                    else{
                        $scope.noLoad = true;
                        $scope.paidData = data.slice(0,rows);
                    }
                }
                else{
                    $scope.isChooseFir = true;
                }
            });
        };

        //加载更多
        $scope.loadMore = function(){
            var data = $scope.paidData;
            if(total>0 && (total <= rows || data.length >= total)){
                $scope.noLoad = false;//已加载完成
                $ionicScrollDelegate.$getByHandle('clinicClaim').resize();
                return;
            }
            else{
                currentPage++;
                var arr = $scope.paidALLData.slice(currentPage*rows,(currentPage+1)*rows);
                $scope.paidData = data.concat(arr);
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
        };

        //选中某一项
        $scope.chooseItem = function(type,paid){
            //无相关项
            if(type=='1'){
                if($scope.isChooseFir){
                    $scope.isChooseFir = false;
                }
                else{
                    $scope.isChooseFir = true;
                    for(var i=0;i<$scope.paidData.length;i++){
                        $scope.paidData[i].checked = false;
                    }
                }
            }
            else{
                $scope.isChooseFir = false;
                if(paid.checked){
                    paid.checked = false;
                }
                else{
                    paid.checked = true;
                }
            }
        };

        //跳转到详情页
        $scope.goDetail = function (paidInfo) {
            //跳转到预约挂号详情
            if(paidInfo.DEPT_NAME){
                AppointmentRegistDetilService.RECORD = {
                    HOSPITAL_ID: paidInfo.HOSPITAL_ID,
                    REG_ID: paidInfo.REG_ID
                };
                AppointmentRegistDetilService.ROUTE_STATE = "clinic_claim";
                $state.go('appointment_regist_detil');
            }
            else{
                //跳转到门诊详情
                ClinicPaidService.fromClinicPaid = true;//从已缴费记录中跳到详情标记
                //详情增加多笔记录
                if(!paidInfo.DEPT_NAME&&paidInfo.IS_ADD != '1'){
                    paidInfo.EXTRA_KEY = undefined;//无附加费则传此字段为空
                }
                var params = {
                    PLACE:'0',
                    REC_MASTER_ID:paidInfo.REC_MASTER_ID,
                    EXTRA_KEY:paidInfo.EXTRA_KEY,
                    isLargeChannel:false
                };
                console.log($scope.isLargeChannel);
                if($scope.isLargeChannel){
                    params.isLargeChannel=true;
                  
                }
                PaidRecordService.params = params;
                $state.go('paid_record');
            }
        };

        //下一步
        $scope.nextStep = function(){
            var flag = false;//是否选择任何一项标记
            var sum = 0;
            if(!$scope.isChooseFir){
                for(var i=0;i<$scope.paidData.length;i++){
                    if($scope.paidData[i].checked){
                        flag = true;
                        sum++;
                    }
                }
            }
            else{
                flag = true;
            }
            if(!flag){
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("clinic_claim.checkNull", "请选择门诊缴费凭证")
                });
                return;
            }
            ClinicClaimService.selectedTotal = sum;
            $state.go("claim_inpatient_general");//跳到住院已结算凭证页面
        };

        KyeeListenerRegister.regist({
            focus: "clinic_claim",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "forward",
            action: function (params) {
                init();
                $scope.loadData();
            }
        });
    })
    .build();