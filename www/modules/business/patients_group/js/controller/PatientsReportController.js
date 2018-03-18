/**
 * 产品名称：quyiyuan
 * 创建者：王亚宁
 * 创建时间： 2016/7/26
 * 创建原因：举报界面开发 KYEESUPPORT-54
 */

new KyeeModule()
    .group("kyee.quyiyuan.patients_group.patients_report.controller")
    .require([
        "kyee.framework.service.view",
        "kyee.quyiyuan.patients_group.patients_report.service"
    ])
    .type("controller")
    .name("PatientsReportController")
    .params([
        "$scope",
        "$state",
        "KyeeListenerRegister",
        "CacheServiceBus",
        "KyeeMessageService",
        "PatientsReportService",
        "KyeeI18nService",
        "$ionicHistory"
    ])
    .action(function($scope,$state,KyeeListenerRegister,CacheServiceBus,
                     KyeeMessageService,PatientsReportService,KyeeI18nService,$ionicHistory){

        $scope.itemFlag = { //选择项开关
            sqdsFlag: false,
            zzmgFlag: false,
            sxqzFlag: false,
            ggsrFlag: false,
            blkbFlag: false,
            otherReasonFlag:false
        };
        $scope.hasReport = false;//标志是否有举报内容
        $scope.reportContent = { //选择项内容
             sqds:"",
             zzmg:"",
             sxqz:"",
             ggsr:"",
             blkb:"",
             otherReason: ""
        };

        /**
         * 切换举报内容选项选择状态
         * @param itemFalg
         */
        $scope.switchItemChecked = function(itemFalg){
            switch(itemFalg){
                case "sqds":
                    if($scope.itemFlag.sqdsFlag){
                        $scope.itemFlag.sqdsFlag = false;
                    } else{
                        $scope.itemFlag.sqdsFlag = true;
                    }
                    break;
                case "zzmg":
                    if($scope.itemFlag.zzmgFlag){
                        $scope.itemFlag.zzmgFlag = false;
                    } else{
                        $scope.itemFlag.zzmgFlag = true;
                    }
                    break;
                case "sxqz":
                    if($scope.itemFlag.sxqzFlag){
                        $scope.itemFlag.sxqzFlag = false;
                    } else{
                        $scope.itemFlag.sxqzFlag = true;
                    }
                    break;
                case "ggsr":
                    if($scope.itemFlag.ggsrFlag){
                        $scope.itemFlag.ggsrFlag = false;
                    } else{
                        $scope.itemFlag.ggsrFlag = true;
                    }
                    break;
                case "blkb":
                    if($scope.itemFlag.blkbFlag){
                        $scope.itemFlag.blkbFlag = false;
                    } else{
                        $scope.itemFlag.blkbFlag = true;
                    }
                    break;
            }
        };

        /**
         * 点击其他项切换显示文本域输入框
         */
        $scope.showInputReport = function(){
            if($scope.itemFlag.otherReasonFlag){
                $scope.itemFlag.otherReasonFlag = false;
            } else {
                $scope.itemFlag.otherReasonFlag = true;
            }
        };

        /**
         * 提交举报内容
         */
        $scope.submitReportInfo = function(){
            dealReportContent();
            if(!$scope.hasReport){
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("personal_setting_modify_sucess","举报内容不能为空！")
                });
                return;
            }
            PatientsReportService.submitReportInfo($scope.reportContent,function(){
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get("personal_setting_modify_sucess","举报成功！")
                });
                $ionicHistory.goBack(-1);
            });
        };

        /**
         * 处理举报内容
         */
        var dealReportContent = function(){
             if($scope.itemFlag.sqdsFlag){
                 $scope.reportContent.sqds = "色情低俗";
             } else if($scope.itemFlag.zzmgFlag){
                 $scope.reportContent.zzmg = "政治敏感";
             } else if($scope.itemFlag.sxqzFlag){
                 $scope.reportContent.sxqz = "涉嫌欺诈";
             } else if($scope.itemFlag.ggsrFlag){
                 $scope.reportContent.ggsr = "广告骚扰";
             } else if($scope.itemFlag.blkbFlag){
                 $scope.reportContent.blkb = "暴力恐怖";
             }
             //判断举报内容是否为空
             for(var item in $scope.reportContent){
                 if($scope.reportContent[item]){
                     $scope.hasReport = true;
                     break;
                 }
             }
         };
    })
    .build();