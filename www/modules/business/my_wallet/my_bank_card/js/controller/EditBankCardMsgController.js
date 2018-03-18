/**
 * 产品名称：quyiyuan.
 * 创建用户：张文华
 * 日期：2015年5月11日23:01:26
 * 创建原因：编辑银行卡页面控制器
 */
new KyeeModule()
    .group("kyee.quyiyuan.rebate.editBankCardMsg.controller")
    .require([
        "kyee.quyiyuan.rebate.editBankCardMsg.service",
        "kyee.quyiyuan.rebate.rebateBankBranch.controller",
        "kyee.framework.directive.picker.list_picker",
        "kyee.quyiyuan.rebate.bankList.controller"
    ])
    .type("controller")
    .name("EditBankCardMsgController")
    .params(["$scope", "$state", "EditBankCardMsgService", 'KyeeListenerRegister', "KyeeMessageService", "KyeeI18nService"])
    .action(function ($scope, $state, EditBankCardMsgService, KyeeListenerRegister, KyeeMessageService, KyeeI18nService) {
        $scope.cardOwnerPlacetxt = KyeeI18nService.get('editBankCardMsg.cardOwnerPlaceHolder', '请输入您的姓名', null);
        $scope.cardNumPlacetxt = KyeeI18nService.get('editBankCardMsg.cardNumPlaceHolder', '请输入银行卡号', null);
        $scope.bankTypePlacetxt = KyeeI18nService.get('editBankCardMsg.bankTypePlaceHolder', '请选择所属银行', null);
        $scope.cardProvincePlacetxt = KyeeI18nService.get('editBankCardMsg.cardProvincePlaceHolder', '请选择或输入省份', null);
        $scope.cardCityPlacetxt = KyeeI18nService.get('editBankCardMsg.cardCityPlaceHolder', '请选择或输入城市', null);
        $scope.belongBranchPlacetxt = KyeeI18nService.get('editBankCardMsg.belongBranchPlaceHolder', '请选择或输入所属支行', null);
        //初始化要返回的页面
        KyeeListenerRegister.regist({
            focus: "editBankCardMsg",
            when: KYEE_LISTENER_WHEN_TYPES.VIEW.ENTER,
            action: function (params) {
                EditBankCardMsgService.setLastPage(params.from);
            }
        });
        //初始化页面数据默认值
        $scope.formMsgs = {
            CARD_NAME: "",
            CARD_NO: "",
            BANK_CODE: "",
            BANK_NAME: '',
            BANK_CITY_CODE: "",
            BANK_CITY_NAME: '',
            BANK_PROVINCE_CODE: "",
            BANK_PROVINCE_NAME: '',
            BANK_BRANCH: ""
        };
        //银行卡选项信息
        $scope.BankInfo = {
            bankType: {},
            bankArea: {},
            bankCity: {}
        };
        //选择器类型，如：银行、省份、日期等
        $scope.selectorType = '';
        //默认是银企直连模式
        $scope.MAINTYPE_STATUS = 1;
        //选择器加载的数据
        $scope.selectItems = [];
        $scope.title = [];
        EditBankCardMsgService.initView($scope, function (result) {
            $scope.BankInfo.bankType = result.bankType;
            $scope.BankInfo.bankArea = result.bankArea;
        });

        //绑定选择器
        $scope.bind = function (params) {
            $scope.show = params.show;
        };
        //选择器点击,根据所点选择器不同，准备相应数据
        $scope.onSelectorTap = function (type) {
            $scope.selectItems = [];
            $scope.selectorType = type;
            //初始化选择器数据
            var result = EditBankCardMsgService.setSelectItems(type,
                $scope.BankInfo, $scope.formMsgs.BANK_PROVINCE_NAME);
            //数据准备成功，显示选择器
            if (result != false) {
                if (type == 'province') {
                    $scope.title = KyeeI18nService.get('editBankCardMsg.selectProvince', '请选择省份', null);
                } else if (type == 'city') {
                    $scope.title = KyeeI18nService.get('editBankCardMsg.selectCity', '请选择城市', null);
                }
                $scope.selectItems = result;
                $scope.show();
            }
        };
        //选择事件
        $scope.selectItem = function (record) {
            var type = $scope.selectorType;
            if (type == 'province') {
                $scope.formMsgs.BANK_PROVINCE_CODE = record.item.value;
                $scope.formMsgs.BANK_PROVINCE_NAME = record.item.text;
                EditBankCardMsgService.loadCityStore($scope.formMsgs.BANK_PROVINCE_CODE, function (result) {
                    $scope.BankInfo.bankCity = result.bankCity;
                });
            } else if (type == 'city') {
                $scope.formMsgs.BANK_CITY_CODE = record.item.value;
                $scope.formMsgs.BANK_CITY_NAME = record.item.text;
            }
        };

        $scope.onProvinceChange = function () {
            EditBankCardMsgService.onProvinceChange(
                $scope.BankInfo.bankArea,
                $scope.formMsgs.BANK_PROVINCE_NAME,
                function (result) {
                    $scope.formMsgs.BANK_PROVINCE_CODE = result.BANK_PROVINCE_CODE;
                    $scope.BankInfo.bankCity = result.bankCity;
                }
            );
        };
        $scope.onCityChange = function () {
            $scope.formMsgs.BANK_CITY_CODE = EditBankCardMsgService.onCityChange(
                $scope.BankInfo.bankCity,
                $scope.formMsgs.BANK_CITY_NAME
            );
        };
        $scope.onBankBranchTap = function () {
            EditBankCardMsgService.onBankBranchTap(
                $scope.formMsgs.BANK_NAME, $scope.formMsgs.BANK_CITY_NAME, $scope.BankInfo
            );
        };
        //确认
        $scope.onSubmitBtn = function () {
            //获取银行名字
            var bankName = EditBankCardMsgService.onInputCardNo($scope.formMsgs.CARD_NO);
            if (bankName.name != '' && bankName.name != $scope.formMsgs.BANK_NAME) {
                KyeeMessageService.broadcast({
                    content: KyeeI18nService.get('editBankCardMsg.mismatching', '银行卡号和开户银行不匹配，请重新选择或输入！', null)
                });
                return;
            }
            EditBankCardMsgService.onSubmitBtn($scope.formMsgs, $scope.MAINTYPE_STATUS);
        };
        //获取开户行
        $scope.onInputCardNo = function () {
            var result = EditBankCardMsgService.onInputCardNo($scope.formMsgs.CARD_NO);
            //因部分机型问题去除格式化功能
            //$scope.formMsgs.CARD_NO = result.cardNo;
            if (result.name != '') {
                //判断该银行是否为银企直连  By  章剑飞  KYEEAPPC-3018
                for (var i = 0; i <= $scope.BankInfo.bankType.length - 1; i++) {
                    if ($scope.BankInfo.bankType[i].BANK_NAME == result.name) {
                        $scope.MAINTYPE_STATUS = $scope.BankInfo.bankType[i].MAINTYPE_STATUS;
                        $scope.formMsgs.BANK_NAME = result.name;
                        break;
                    }
                }
                //非银企直连则银行名置空  By  huabo  KYEEAPPC-4566
                if(i == $scope.BankInfo.bankType.length){
                    $scope.formMsgs.BANK_NAME = '';
                }
                //$scope.formMsgs.BANK_NAME = result.name;
            }
        };

        //进入开户行列表  By  章剑飞  KYEEAPPC-4565
        $scope.selectBank = function () {
            $state.go('bank_list');
        }
    })
    .build();
