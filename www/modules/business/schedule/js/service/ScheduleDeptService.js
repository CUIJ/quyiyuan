/**
 * 产品名称：quyiyuan
 * 创建者：刘健
 * 创建时间： 2015/5/5
 * 创建原因：医生排班中科室选择服务
 * 修改者：
 * 修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.scheduleDept.service")
    .require(["kyee.framework.service.message"])
    .type("service")
    .name("ScheduleDeptService")
    .params(["HttpServiceBus","KyeeMessageService"])
    .action(function(HttpServiceBus,KyeeMessageService){

        var deptData = {
            //获取预约科室分级列表
            queryGroupDept: function (hospitalId, onSuccess) {
                HttpServiceBus.connect({
                    url: "/triage/action/DeptClassificActionC.jspx",
                    params: {
                        op: "getAppoinDeptDictForAPP",
                        hospitalId: hospitalId
                    },
                    cache : {
                        by : "TIME",
                        value : 5 * 60
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            onSuccess(data.data);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message,
                                duration: 3000
                            });
                        }
                    }
                });
            },
            //获取预约科室列表
            queryDept: function (hospitalId, onSuccess) {
                HttpServiceBus.connect({
                    url : "/register/action/DoctorScheduleAcionC.jspx",
                    params: {
                        op: "getScheduleDeptDictActionC",
                        hospitalId: hospitalId
                    },
                    cache : {
                        by : "TIME",
                        value : 5 * 60
                    },
                    onSuccess: function (data) {
                        if (data.success) {
                            var resultData =data.data.rows;
                            //如果科室不分级，则需要进行对科室数据进行处理
                            if (parseInt(data.data.isGroupDept)==0){
                                var deptTables = data.data.rows;
                                resultData = deptData.dealDeptData(deptTables);
                            }
                            onSuccess(resultData,data.data.isGroupDept);
                        }
                        else{
                            KyeeMessageService.broadcast({
                                content:data.message
                            });
                        }
                    }
                });
            },
            //处理后台返回的科室数据
            dealDeptData: function (deptTables) {
                var letters = [];//获取字母数组
                var resultMap = {};//获取字母对应的科室
                var result = {};//返回处理后的数据
                for (var i = 0; i < deptTables.length; i++) {
                    if (resultMap[deptTables[i].FULL_UPPER_SPELL.substr(0, 1)] == undefined) {
                        var list = [];
                        list.push(deptTables[i]);
                        resultMap[deptTables[i].FULL_UPPER_SPELL.substr(0, 1)] = list;
                        letters.push(deptTables[i].FULL_UPPER_SPELL.substr(0, 1));
                        letters = letters.sort();
                    } else {
                        resultMap[deptTables[i].FULL_UPPER_SPELL.substr(0, 1)].push(deptTables[i]);
                    }
                }
                var data = [];//组装后的数据
                for(var j=0;j<letters.length;j++){
                    var datamap={};
                    datamap["group"]=letters[j];
                    var letterarr= resultMap[letters[j]];
                    var items=[];
                    for(var k=0;k<letterarr.length;k++){
                        var itemMap={};
                        itemMap["text"]=letterarr[k].DEPT_NAME;
                        itemMap["value"]=letterarr[k].DEPT_CODE;
                        itemMap["pinyin"]=letterarr[k].FULL_UPPER_SPELL;
                        itemMap["deptData"]=letterarr[k];
                        if(letterarr[k].IS_ONLINE==1){
                            itemMap["leftIcons"]=["appoint-shipin-img"];
                        }
                        if(letterarr[k].IS_KEY=="1"){
                            itemMap["rightIcons"]=["features_dept_img"];
                        }
                        items.push(itemMap)
                    }
                    datamap["items"]=items;
                    data.push(datamap);
                }
                return data;

            }
        };
        return deptData ;
    })
    .build();