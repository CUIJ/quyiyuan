/**
 *��Ʒ���ƣ�quyiyuan
 *�����ߣ�����
 *����ʱ�䣺2015/6/25
 *����ԭ��ƽ�浼�����ݿ��Ҷ�λ��ѡ����ң�����
 *�޸��ߣ�
 *�޸�ԭ��
 *
 */
new KyeeModule()
    .group("kyee.quyiyuan.navigation.service.navigationDepartment")
    .require(["kyee.framework.service.messager"])
    .type("service")
    .name("NavigationDepartmentService")
    .params(["KyeeMessagerService","HttpServiceBus"])
    .action(function(KyeeMessagerService,HttpServiceBus){
        var def = {
            hospitalId:undefined,  //ҽԺID
            checkDeptName:undefined, //��ԤԼ���鴫�ݵĿ�������
            queryDepatmentInfro:function(hospitalId,Callback){
                HttpServiceBus.connect({
                    url : "/health/action/HospitalNavigationActionC.jspx",
                    params : {
                        loc : "c",
                        op : "getDepartInfoList",
                        hospitalId:hospitalId
                    },
                    onSuccess : function (resp) {
                        Callback(resp);
                    }
                });
            }
        };
        return def;
    })
    .build();
