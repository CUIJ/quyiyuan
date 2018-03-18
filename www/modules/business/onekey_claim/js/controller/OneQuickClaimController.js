/**
 * 产品名称：quyiyuan
 * 创建者：董茁
 * 创建时间：2016年10月08日10:12:30
 * 创建原因：一键理赔首页controller
 * 任务号：KYEEAPPC-8135
 */
new KyeeModule()
    .group("kyee.quyiyuan.one_quick_claim.controller")
    .require([
        "kyee.quyiyuan.one_quick_claim.service",
        "kyee.quyiyuan.medicalRecords.controller"
    ])
    .type("controller")
    .name("OneQuickClaimController")
    .params(["$scope", "$state", "$ionicHistory", "KyeeI18nService", "$ionicScrollDelegate","$timeout","KyeeUtilsService","CacheServiceBus","KyeeMessageService","KyeeListenerRegister","OneQuickClaimService"])
    .action(function ($scope, $state, $ionicHistory, KyeeI18nService, $ionicScrollDelegate,$timeout,KyeeUtilsService,CacheServiceBus,KyeeMessageService,KyeeListenerRegister,OneQuickClaimService) {
        //动态获取当前屏幕宽度
        $scope.wid = (document.body.clientWidth-240)/2;
        $scope.isView = false;
        //初始化数据
        var startDate = new Date();
        $scope.yearRange = (startDate.getFullYear() - 18) + '->' + (startDate.getFullYear());
        //日期格式处理
        Date.prototype.Format = function (fmt) {
            var o = {
                "M+": this.getMonth() + 1, //月份
                "d+": this.getDate(), //日
                "h+": this.getHours(), //小时
                "m+": this.getMinutes(), //分
                "s+": this.getSeconds(), //秒
                "q+": Math.floor((this.getMonth() + 3) / 3), //季度
                "S": this.getMilliseconds() //毫秒
            };
            if (/(y+)/.test(fmt)) fmt = fmt.replace(RegExp.$1, (this.getFullYear() + "").substr(4 - RegExp.$1.length));
            for (var k in o)
                if (new RegExp("(" + k + ")").test(fmt)) fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
            return fmt;
        };
        var initData = function(){
            var name  = [];

            //获取保险公司名称
            if(OneQuickClaimService.isFrom){
                OneQuickClaimService.getComPany(function(data){
                    if(data.indexOf(",")>0){
                        var str =  data.split(","); //字符分割
                        for(var i=0;i<str.length;i++){
                            name.push(str[i]);
                        }
                    }else{
                        name.push(data);
                    }
                    $scope.companyName= name[0];
                    var menus = [];
                    $scope.companyNames = name;
                    for(var j=0;j<name.length;j++){
                        var resultMap = {};
                        resultMap["text"] = name[j];
                        resultMap["value"] = name[j];
                        menus.push(resultMap);
                    }
                    $scope.pickerItems = menus;
                });
            }
            $scope.CLINIC_DATE = new Date().Format("yyyy/MM/dd");//默认显示当前日期
            //获取当前患者
            $scope.currentPatient = CacheServiceBus.getMemoryCache().get(CACHE_CONSTANTS.MEMORY_CACHE.CURRENT_CUSTOM_PATIENT);
            //var name = KyeeI18nService.get("one_quick_claim.companyName", "中国平安财产保险股份有限公司");
            $timeout(
                function () {
                    $scope.isView = true;
                },
              1500
            );
        };

        //initData();

        /**
         * 生日选择
         */
        $scope.chooseInsuranceDate = function () {
            $scope.show();
        };


        /**
         * 绑定日期组件方法
         * @param params
         */
        $scope.bind = function (params) {
            $scope.show = params.show;
        };


        /**
         * 选择日期完成
         * @param params
         * @returns {boolean}
         */
        $scope.onFinash = function (params) {
            $scope.CLINIC_DATE = params[0].value + "/" + params[1].value + "/" + params[2].value;//选什么日期显示什么日期
            return true;
        };

        //选择保险公司
        $scope.chooseInsuraceCompany = function(){
            $scope.title = KyeeI18nService.get("one_quick_claim.companyChoose", "请选择保险公司");
            //调用显示
            $scope.showPicker($scope.companyNames);
        };

        //选择出险人
        $scope.chooseInsuracePeople = function(){
            OneQuickClaimService.isFrom = false;
            $state.go("custom_patient");
        };


        //下一步
        $scope.nextInsunrance = function() {
            $scope.isView = false;
            if($scope.CLINIC_DATE==undefined || $scope.currentPatient==undefined){
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("one_quick_claim.checkNull", "基本资料填写不完整")
                });
                return ;
            }

            var hospitalInfo = CacheServiceBus.getStorageCache().get(CACHE_CONSTANTS.STORAGE_CACHE.HOSPITAL_INFO);
            if(hospitalInfo.id &&hospitalInfo.id !=1001){
                OneQuickClaimService.isFrom = false;
            }
            $state.go("medical_records");
        };

        //返回到上一个页面
        $scope.back = function() {
            OneQuickClaimService.isFrom = true;
            $ionicHistory.goBack();
        };

        //绑定选择事件
        $scope.bindCompany = function (params) {
            $scope.showPicker = params.show;
            params.hideMode = "AUTO";
        };

        //选择医院
        $scope.selectItem = function (params) {
            $scope.companyName = params.item.text;//展示值


        };

        KyeeListenerRegister.regist({
            focus: "one_quick_claim",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            direction: "both",
            action: function (params) {
                initData();
            }
        });
        //监听物理键返回
        KyeeListenerRegister.regist({
            focus: "patient_card_recharge",
            when: KYEE_LISTENER_WHEN_TYPES.DEVICE.HARDWARE_BACK,
            action: function (params) {
                OneQuickClaimService.isFrom = true;
                params.stopAction();   //禁掉默认处理，使物理返回与页面上的返回键一致
                $scope.back();
            }
        });

    })
    .build();