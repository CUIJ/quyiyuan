/**
 * 产品名称 quyiyuan.
 * 创建用户: 淳思博
 * 日期: 2015/5/29.
 * 创建原因：
 * 修改： By
 * 修改： By
 */

new KyeeModule()
    .group("kyee.quyiyuan.ncms.outReim.controller")
    .require(["kyee.quyiyuan.ncms.outReim.service"])
    .type("controller")
    .name("OutReimController")
    .params(["$scope", "$state","KyeeMessageService", "myFamilyService", "OutReimService","KyeeI18nService"])
    .action(function($scope, $state,KyeeMessageService, myFamilyService, OutReimService,KyeeI18nService) {
        $scope.params = {
            familyCode : "",
            idNo : "",
            year : "",
            clinicDate : ""
        };

        $scope.dataEmpty = {
            emptyText : '',
            emptyType : 0 //0: 代表正常，提示不显示；1：代表绑定身份证不对，提示显示 2：查询无数据，提示显示；3：亳州远程连接失败
        };

        //获取参数
        var dateStr = myFamilyService.FAMILY_YEAR;
        var familyCode = myFamilyService.FAMILY_CODE;
        var family = myFamilyService.FAMILY_DATA;
        //亳州服务器远程连接失败显示内容
        var boZhouServiceFlag = myFamilyService.FAMILY_FALSE_FLAG; //默认为undefined，当连接失败为true

        if(boZhouServiceFlag){
            $scope.dataEmpty.emptyText = KyeeI18nService.get("ncms.goOnFalse","连接新农合服务器失败。");
            $scope.dataEmpty.emptyType = 3;
            return;
        }

        if(!familyCode && !dateStr && !family){
            $scope.dataEmpty.emptyText = KyeeI18nService.get("ncms.sorry","对不起，你绑定的身份证无效，不能使用该功能!");
            $scope.dataEmpty.emptyType = 1;
            return;
        }

        var cYear = new Date(dateStr).getFullYear();

        var Buttons = [];
        //初始化选择，姓名
        for(var i = 0; i < family.length; i++){
            var item = {};
            item['text'] = family[i].NAME;
            item['value'] = family[i].ID_NO;
            Buttons.push(item);
        }
        $scope.name = Buttons[0].text;
        $scope.params.idNo = Buttons[0].value;
        //选择下拉列表
        $scope.clickUpload = function() {
            KyeeMessageService.actionsheet({
                buttons :Buttons,
                onClick : function(index){
                    if(index > 0){
                        $scope.params.idNo = Buttons[index].value;
                        $scope.name = Buttons[index].text;
                    }
                },
                cancelButton : true
            });
        };

        //绑定选择事件
        $scope.bind = function(params){
            $scope.showPicker = params.show;
        };
        //选择年月日
        $scope.selectItem = function(params){
            var type = params.item.type;
            switch(type){
                case 0:
                    $scope.year = params.item.value;
                    break;
                case 1:
                    $scope.month = params.item.value;
                    break;
                case 2:
                    $scope.day = params.item.value;
                    break;
            }
        };
        //初始化年月日
        $scope.year = cYear;
        $scope.month = "--";
        $scope.day = "--";
        $scope.currentYear = cYear;
        //选择日期 0：年，1：月；2：日
        $scope.selectDate = function(type){
            switch(type){
                case 0:
                    $scope.pickerItems = $scope.creatPickerItems(2010, $scope.currentYear, type);
                    $scope.title=KyeeI18nService.get("ncms.selectYear","请选年份");
                    $scope.showPicker();
                    break;
                case 1:
                    $scope.pickerItems = $scope.creatPickerItems(1, 12, type);
                    $scope.title=KyeeI18nService.get("ncms.selectMonth","请选月份");
                    $scope.showPicker();
                    break;
                case 2:
                    if($scope.month !== '--'){
                        var date = new Date($scope.year, $scope.month, 0);
                        var days = date.getDate();
                        $scope.pickerItems = $scope.creatPickerItems(1, days, type);
                        $scope.title=KyeeI18nService.get("ncms.selectDate","请选日期");
                        //调用显示
                        $scope.showPicker();
                    }
                    break;
            }
        };

        $scope.creatPickerItems = function(start, end ,type){
            var items = [];
            for(var i = start; i <= end; i++){
                var item = {};
                var key = i < 10 ? '0' + i : i;
                var text = '';
                item['value'] = key;
                switch(type){
                    case 0 :
                        text = i + KyeeI18nService.get("ncms.year","年");
                        break;
                    case 1 :
                        text = i + KyeeI18nService.get("ncms.month","月");
                        break;
                    case 2 :
                        text = i + KyeeI18nService.get("ncms.date","日");
                        break;
                }
                item['text'] = text;
                item['type'] = type;
                items.push(item);
            }
            return items;
        };

        $scope.data = [];
        $scope.query = function(){
            //famialyCode, idNo
            var famialyCode = myFamilyService.FAMILY_CODE;
            if(!famialyCode || $scope.params.idNo.length == 0){
                $scope.dataEmpty.emptyText = KyeeI18nService.get("ncms.sorry","对不起，你绑定的身份证无效，不能使用该功能!");
                $scope.dataEmpty.emptyType = 1;
                return;
            }
            $scope.params.familyCode = famialyCode;


            //检查日期
            if($scope.month != '--' && $scope.day == '--'){
                var msgJson = {
                    title: KyeeI18nService.get("ncms.duang","提示"),
                    content: KyeeI18nService.get("ncms.pleassDoDate","请完善就诊日期!"),
                    okText: KyeeI18nService.get("ncms.ok","知道了")
                };
                KyeeMessageService.message(msgJson);
                return;
            }

            //组装日期
            if($scope.month !== '--' && $scope.day !== '--'){
                var date = $scope.year + '-' + $scope.month + '-' + $scope.day;
                $scope.params.clinicDate = date;
            }

            //year
            $scope.params.year = $scope.year;
            OutReimService.loadOutReim($scope.params.familyCode, $scope.params.idNo
                            ,$scope.params.year, $scope.params.clinicDate, function(rows){
                    $scope.data = [];
                    if(rows.length <= 0){
                        KyeeMessageService.message({
                            title : KyeeI18nService.get("ncms.duang","提示"),
                            content : KyeeI18nService.get("ncms.dontCheckYour","没有查到您的门诊报销信息！"),
                            okText : KyeeI18nService.get("ncms.ok","知道了")
                        });
                    }else{
                        $scope.data = rows;
                        $scope.dataEmpty.emptyText = "";
                        $scope.dataEmpty.emptyType = 0;
                    }

                })
        };

        //页面初始化查询当前年数据
        $scope.query();

    })
    .build();
