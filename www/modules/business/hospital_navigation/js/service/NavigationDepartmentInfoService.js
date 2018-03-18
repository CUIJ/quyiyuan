/**
 *产品名称：quyiyuan
 *创建者：杜巍巍
 *任务号：KYEEAPPC-3461
 *创建时间：2015/9/6
 *创建原因：平面导航根据科室定位（选择科室）服务
 *修改者：
 *修改原因：
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.navigationDepartmentInfo.service")
    .require(["kyee.framework.service.message"])
    .type("service")
    .name("NavigationDepartmentInfoService")
    .params(["KyeeMessageService","HttpServiceBus"])
    .action(function(KyeeMessageService,HttpServiceBus){
        var def = {
            hospitalId:undefined,  //医院ID
            checkDeptName:undefined, //从预约详情传递的科室名称
            queryDepatmentInfro:function(hospitalId,Callback){
                var me = this;
                HttpServiceBus.connect({
                    url : "/health/action/HospitalNavigationActionC.jspx",
                    params : {
                        loc : "c",
                        op : "getDepartInfoList",
                        hospitalId:hospitalId
                    },
                    onSuccess : function (data) {
                        if (data.success) {
                            var deptTables = data.data.rows;
                            var resultData = me.dealDeptData(deptTables);
                            Callback(resultData);
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
            dealDeptData: function (deptTables){
                var letters = [];//获取字母数组
                var resultMap = {};//获取字母对应的科室
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
                        if(this.checkDeptName==letterarr[k].DEPT_NAME){
                            itemMap["class"]="check_department_itemStyle";
                        }
                        if(letterarr[k].IS_ONLINE==1){
                            itemMap["leftIcons"]=["appoint-shipin-img"];
                        }
                        items.push(itemMap)
                    }
                    datamap["items"]=items;
                    data.push(datamap);
                }
                return data;
            }
        };
        return def;
    })
    .build();
