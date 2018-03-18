/**
 * 产品名称：quyiyuan
 * 创建者：董茁
 * 创建时间：2016年10月8日10:34:08
 * 创建原因：住院缴费凭证 控制
 * 任务号：KYEEAPPC-8139
 */
new KyeeModule()
    .group("kyee.quyiyuan.claim_inpatient_general.controller")
    .require([
        "kyee.quyiyuan.claim_inpatient_general.service",
        "kyee.quyiyuan.quick_clinic_report.controller"
    ])
    .type("controller")
    .name("ClaimInpatientGeneralController")
    .params(["$scope", "$state","KyeeMessageService","$ionicScrollDelegate","KyeeI18nService",
        "ClaimInpatientGeneralService","InpatientPaidService","ClinicClaimService","KyeeListenerRegister","InpatientPaymentService","ClaimInpatientGeneralService"])
    .action(function ($scope, $state,KyeeMessageService,$ionicScrollDelegate,KyeeI18nService,
                      ClaimInpatientGeneralService,InpatientPaidService,ClinicClaimService,KyeeListenerRegister,InpatientPaymentService,ClaimInpatientGeneralService) {

        var currentPage = 0;//当前页数
        var rows = 20;//一页加载20条
        var total = 0;//记录总数

        var init = function(){
            $scope.lastTotal = ClinicClaimService.selectedTotal;//门诊条数
            $scope.paidALLData = [];
            $scope.paidData = [];

        };
        //刷新  得到住院已结算数据
        $scope.loadData = function () {
            ClaimInpatientGeneralService.loadPermission(function(permission){
                $scope.permission = permission;
                if($scope.permission.INHOSPITALHISTORY_PERMISSION==1 || permission==undefined){
                    ClaimInpatientGeneralService.queryInHospitalPatientHistoryFeeNew(function (success,data) {
                        $scope.noLoad = false;//默认加载完成
                        if(data!=undefined && success){
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
                }else{
                    $scope.isChooseFir = true;
                }
            });
        };

        //转换金额
        $scope.convertMoney = function(v){
            if (v != undefined) {
                v = parseFloat(v);
                var data = v.toFixed(2);
                return data;
            }
        };

        //加载更多
        $scope.loadMore = function(){
            var data = $scope.paidData;
            if(total>0 && (total <= rows || data.length >= total)){
                $scope.noLoad = false;//已加载完成
                $ionicScrollDelegate.$getByHandle('claimInpatientGeneral').resize();
                return;
            }
            else{
                currentPage++;
                var arr = $scope.paidALLData.slice(currentPage*rows,(currentPage+1)*rows);
                $scope.paidData = data.concat(arr);
            }
            $scope.$broadcast('scroll.infiniteScrollComplete');
        };

        //选中某一项 住院
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
        $scope.goDetail = function (infor) {
            InpatientPaidService.paidDetail = infor;
            $state.go('inpatient_paid_detail');
        };

        //下一步
        $scope.nextStep = function(){
            var flag = false;//是否选择任何一项标记住院
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
                    content: KyeeI18nService.get("qy_claim_inpatient_general.checkNull", "请选择住院缴费凭证")
                });
                return;
            }
            ClaimInpatientGeneralService.selectedTotal = sum;
            $state.go("clinic_report");
        };

        KyeeListenerRegister.regist({
            focus: "claim_inpatient_general",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.BEFORE_ENTER,
            direction: "forward",
            action: function (params) {
                init();
                $scope.loadData();
            }
        });
    })
    .build();