/**
 * 产品名称 KYMH
 * 创建用户: 朱学亮
 * 修改者：张家豪
 * 日期: 2015/5/10
 * 时间: 15:45
 * 创建原因：个人二维码service
 * 任务：KYEEAPPC-4434
 */
new KyeeModule()
    .group("kyee.quyiyuan.center.qr_code.service")
    .require(["kyee.framework.service.messager", "kyee.quyiyuan.login.md5util.service"])
    .type("service")
    .name("QrCodeService")
    .params(["$state","KyeeI18nService","CacheServiceBus","KyeeMessagerService", "HttpServiceBus", "RsaUtilService", "KyeeMessageService"])
    .action(function ($state,KyeeI18nService,CacheServiceBus,KyeeMessagerService, HttpServiceBus, RsaUtilService, KyeeMessageService) {
        var def = {

            qrCodeType: "CARD_NO",
            qrImage: null,
            eanImage: null,

            getQrCode: function (hospitalId,requestHandle) {
                HttpServiceBus.connect({
                    url: 'hospitalInform/action/HospitalinforActionC.jspx',
                    params: {
                        op: 'queryHospitalParam',
                        hospitalId: hospitalId,
                        paramName: 'qrCodeType'
                    },
                    onSuccess: function (retVal) {
                        requestHandle(retVal);
                    },
                    onError: function (retVal) {
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("comm_patient_detail.takeQrFail","获取二维码失败！")
                        });
                    }
                });
            },

            getQrImage: function (hospitalId, patientId, qrCodeType, scope) {
                HttpServiceBus.connect({
                    url: 'center/action/QrcodeAction.jspx',
                    params: {
                        op: 'queryQrcode',
                        hospitaId: hospitalId,
                        patientId: patientId,
                        qrCodeType: qrCodeType
                    },
                    onSuccess: function (retVal) {
                        if (retVal.success) {
                            def.qrImage = retVal.data.QRCODE;
                            def.eanImage = retVal.data.EANCODE;
                            scope.picSrc = def.qrImage;
                        } else {
                            // 获取二维码失败
                            KyeeMessageService.broadcast({
                                content: KyeeI18nService.get("comm_patient_detail.takeQrFail","获取二维码失败！")
                            });
                            $ionicHistory.goBack();
                        }
                    },
                    onError: function (retVal) {
                        // 获取二维码失败
                        KyeeMessageService.broadcast({
                            content: KyeeI18nService.get("comm_patient_detail.takeQrFail","获取二维码失败！")
                        });
                        $ionicHistory.goBack();
                    }
                });
            }
        };
        return def;
    })
    .build();