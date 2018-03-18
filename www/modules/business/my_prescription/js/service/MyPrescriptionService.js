/**
 * Created by lizhihu on 2017/10/25.
 */

new KyeeModule()
    .group("kyee.quyiyuan.myprescription.service")
    .require([])
    .type("service")
    .name("MyPrescriptionsService")
    .params(["HttpServiceBus","KyeeMessageService"])
    .action(function(HttpServiceBus,KyeeMessageService){
         var def = {
           getPrescriptionList:function(param,onSuccess,onError){
               HttpServiceBus.connect({
                   url: "/myrecipe/action/MyRecipeActionC.jspx",
                   showLoading: true,
                   params: {
                       op: "queryMyRecipeList",
                       phoneNum: param.phoneNum,
                       patientName:param.patientName
                   },
                   onSuccess: function(data){
                       if (data.success) {
                           onSuccess(data.data);
                       } else {
                           KyeeMessageService.broadcast({
                               content: data.message,
                               duration: 3000
                           });
                       }
                   },
                   onError: function(err) {
                       typeof error === 'function' && error(err);
                   }
               });
           },
             getPresitionDetail:function(prescriptionNo,hospitalId,onSuccess,onError){
                 HttpServiceBus.connect({
                     url: "/myrecipe/action/MyRecipeActionC.jspx",
                     showLoading: true,
                     params: {
                         op: "queryRecipeDetailInfo",
                         prescriptionNo: prescriptionNo,
                         hospitalCode:hospitalId

                     },
                     onSuccess: function(data){
                         if (data.success) {
                             onSuccess(data.data);
                         } else {
                             KyeeMessageService.broadcast({
                                 content: data.message,
                                 duration: 3000
                             });
                         }
                     },
                     onError: function(err) {
                         typeof error === 'function' && error(err);
                     }
                 });
             },
             queryCustomPatient: function (USER_ID, onSuccess) {
                 HttpServiceBus.connect({
                     url: "/center/action/CustomPatientAction.jspx",
                     showLoading: true,
                     params: {
                         USER_ID: USER_ID,
                         FLAG: "cloud",
                         op: "queryCustomPatient"
                     },
                     onSuccess: function (data) {
                         if (data) {
                             onSuccess(data);
                         }
                     }
                 });
             }
         }
         return def;
    })
    .build();