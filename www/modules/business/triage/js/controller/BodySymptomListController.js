/**
 * 产品名称：quyiyuan
 * 创建者：高玉楼
 * 创建时间：2015年6月26日17:03:03
 * 创建原因：列表导诊和小部位主症列表控制器
 * 修改人：武帆
 * 修改任务：KYEEAPPC-7361
 * 修改原因：迁移前端涉及ms-guide上海组件到后端调用所需改动
 */
new KyeeModule()
    .group("kyee.quyiyuan.bodySymptomList.controller")
    .require(["kyee.quyiyuan.bodySymptomList.service", "kyee.quyiyuan.onSetList.controller"])
    .type("controller")
    .name("BodySymptomListController")
    .params(["$scope", "$ionicHistory", "$state", "BodySymptomListService", "TriagePicService", "KyeeMessageService", "KyeeListenerRegister", "$ionicScrollDelegate"])
    .action(function ($scope, $ionicHistory, $state, BodySymptomListService, TriagePicService, KyeeMessageService, KyeeListenerRegister, $ionicScrollDelegate) {
        var bodyId = TriagePicService.bodyId;
        var bodyAndPart = {
            1: '眼部',
            2: '眼部',
            3: '耳部',
            4: '耳部',
            5: '鼻部',
            6: '口部',
            7: '面部',
            8: '头部',
            9: '颈部',
            10: '胸部',
            11: '腹部',
            12: '肘部',
            13: '肘部',
            14: '手部',
            15: '手部',
            16: '腕部',
            17: '腕部',
            18: '上臂',
            19: '上臂',
            20: '髋部',
            21: '阴部',
            22: '大腿',
            23: '大腿',
            24: '膝部',
            25: '膝部',
            26: '小腿',
            27: '小腿',
            28: '脚踝',
            29: '脚踝',
            30: '脚部',
            31: '脚部',
            32: '腰背部',
            33: '臀部',
            34: '下臂',
            35: '其他',
            36: '乳房'
        };
        //选中的大部位
        $scope.bodyName = TriagePicService.bodyName;
        //小部位数据
        $scope.partDatas = [];
        //部位ID
        $scope.partId = 0;
        var noSex = TriagePicService.noSex;
        var currentSex = TriagePicService.currentSex;
        //如果为列表导诊加载全部小部位
        BodySymptomListService.loadAllPartData(noSex, currentSex, function (data) {
            $scope.partDatas = data;
            findFirstPartIndex(data, bodyId);
            //当前小部位滚动到屏幕可见区域。
            $ionicScrollDelegate.$getByHandle("triage-body-symptom-list-depart").scrollTo(0, $scope.partId * 42 - (window.innerHeight - 53) / 2, true);
        });

        //选择部位
        $scope.onPartItemClick = function (index) {
            $scope.partId = index;
            //begin 清除用户选择部位 By 高玉楼 KYEEAPPTEST-2711
            //在服务中记录选中的partId
            BodySymptomListService.partId = index;
            //end 清除用户选择部位 By 高玉楼 KYEEAPPTEST-2711
            $ionicScrollDelegate.$getByHandle("triage-body-symptom-list-symptom").scrollTo(0, 0);
        };
        //点击症状
        $scope.onSymptomItemClick = function (mainId, mainName) {
            BodySymptomListService.mainId = mainId;
            BodySymptomListService.mainName = mainName;
            $state.go("onSetList");
        };

        //选择默认部位
        function findFirstPartIndex(partData, bodyId) {
            //如果服务中有选中的部位编号，则选中上次选中的部位
            if (BodySymptomListService.partId != undefined) {
                $scope.partId = BodySymptomListService.partId;
                return;
            }
            //如果从列表进入，默认选择头部
            if (bodyId == -1) {
                $scope.partId = 0;
                return;
            }
            var partId = bodyAndPart[bodyId];
            //设置选择的部位
            for (var i = 0; i < partData.length; i++) {
                if (partData[i].bodyName === partId) {
                    $scope.partId = i;
                    return;
                }

            }
        }

        //跳转回图形导诊
        $scope.toPic = function () {
            //$ionicHistory.goBack();
            $state.go('triageMain');
        }
    })
    .build();