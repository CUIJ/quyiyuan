/**
 * 产品名称：quyiyuan
 * 创建者：吴伟刚
 * 创建时间： 2015年8月6日14:07:48
 * 创建原因：查询配送范围的服务
 * 任务号：KYEEAPPC-2919
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.send_address.service")
    .require(["kyee.framework.service.message"])
    .type("service")
    .name("SendAddressService")
    .params(["HttpServiceBus", "KyeeMessageService"])
    .action(function (HttpServiceBus, KyeeMessageService) {
        //获取预约科室
        var AddressData = {
            //获取预约科室列表
            queryAddress: function (hospitalId,router, onSuccess) {
                HttpServiceBus.connect({
                    url: "/receiveAddress/action/userReceiveAddressActionC.jspx",
                    params: {
                        op: "getDistributionRange",
                        HOSPITAL_ID: hospitalId,
                        ROUTER: router
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            var addressTables = data.data;
                            var resultData = '';
                            if(addressTables&&addressTables.length>0){
                                resultData = AddressData.dealAddressData(addressTables);
                            }else{
                                resultData = addressTables;
                            }
                            onSuccess(resultData);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            //处理后台返回的科室数据
            dealAddressData: function (deptTables) {
                var provinceLength = deptTables.length;
                for(var i=0;i<provinceLength;i++){
                    var province = deptTables[i];
                    var cityLength = province.CITY_LIST.length;
                    deptTables[i].COUNT = cityLength;
                    for(var j=0;j<cityLength;j++){
                        var city = province.CITY_LIST[j];
                        var areaLength = city.COUNTY_LIST.length;
                        var areasName = "";
                        for(var k=0;k<areaLength;k++){
                            var name = city.COUNTY_LIST[k].COUNTY;
                            if(k+1<areaLength){
                                areasName += name+'、';
                            }else{
                                areasName += name;
                            }
                        }
                        city.COUNTIES = areasName;
                    }
                }
                return deptTables;
            }
        };
        return AddressData;
    })
    .build();

