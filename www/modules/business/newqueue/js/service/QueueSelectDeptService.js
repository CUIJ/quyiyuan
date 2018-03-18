/**
 * 产品名称：quyiyuan
 * 创建者：WANGWAN
 * 创建时间：2015/4/26
 * 创建原因：科室列表服务层
 * 修改者：邵鹏辉
 * 修改原因：我的排队功能改进（KYEEAPPC-2655）
 * 修改时间：2015/07/14
 */
new KyeeModule()
    .group("kyee.quyiyuan.newqueue.select.dept.service")
    .require(["kyee.framework.service.message", "kyee.framework.directive.i18n.service"])
    .type("service")
    .name("NewQueueSelectDeptService")
    .params(["HttpServiceBus","KyeeMessageService","KyeeI18nService"])
    .action(function(HttpServiceBus,KyeeMessageService,KyeeI18nService){

        var deptData = {
            //获取排队科室列表
            getDeptName:function(paras,onSuccess){
                HttpServiceBus.connect({
                    url: "/sortquery/action/SortQueryActionC.jspx",
                    params: {
                        op: "getSortDeptList",
                        hospitalId: paras
                    },
                    onSuccess: function (data) {
                        var isSuccess = data.success;
                        var resultData=null;
                        if(isSuccess){
                            if(data.data!=null){
                                var callBackData=data.data.rows;
                                resultData = deptData.dealDeptData(callBackData);
                            }else{
                                KyeeMessageService.broadcast({
                                    content:KyeeI18nService.get("new_queue.dataDetail","目前还没有可叫号的门诊")
                                });
                            }
                        }else{//查询失败
                            var errorMsg = data.message;
                            KyeeMessageService.broadcast({
                                content : errorMsg
                            });
                        }
                        onSuccess(resultData);
                    },
                    onError : function(retVal){
                    }
                });
            },
            //处理后台返回的科室数据
            dealDeptData:function(deptTables){
                var letters = [];//获取字母数组
                var resultMap = {};//获取字母对应的科室
                for (var i = 0; i < deptTables.length; i++) {
                    //科室名拼音
                    if (resultMap[deptTables[i].FULL_UPPER_SPELL.substr(0, 1)] == undefined) {
                        var list = [];
                        list.push(deptTables[i]);//科室
                        resultMap[deptTables[i].FULL_UPPER_SPELL.substr(0, 1)] = list;
                        letters.push(deptTables[i].FULL_UPPER_SPELL.substr(0, 1));
                        letters = letters.sort();
                    } else {
                        resultMap[deptTables[i].FULL_UPPER_SPELL.substr(0, 1)].push(deptTables[i]);
                    }
                }
                var data = [];//组装后的数据
                for(var j=0;j<letters.length;j++){//字母循环
                    var datamap={};
                    datamap["group"]=letters[j];
                    var letterarr= resultMap[letters[j]];
                    var items=[];
                    for(var k=0;k<letterarr.length;k++){//字母下的科室循环
                        var itemMap={};
                        itemMap["value"]=letterarr[k].DEPT_CODE;
                        itemMap["pinyin"]=letterarr[k].FULL_UPPER_SPELL;
                        itemMap["deptData"]=letterarr[k];
                        itemMap["text"]=letterarr[k].DEPT_NAME;
                        //end 是否拥挤
                        items.push(itemMap)
                    }
                    datamap["items"]=items;
                    data.push(datamap);
                }
                return data;

            }
        };
        return deptData;
    })
    .build();
