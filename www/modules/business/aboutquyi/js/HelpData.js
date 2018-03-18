/**
 * 产品名称 KYMH
 * 创建用户: 李文娟
 * 日期: 2015/9/10
 * 时间: 15:45
 * 创建原因：帮助页面的数据
 * 修改原因：
 * 修改时间：
 */
var problemItems = [
    {
        question:'预约总是提示预约、挂号失败？',
        answer:'&nbsp;&nbsp;&nbsp;&nbsp;您好，在预约挂号失败后会有提示，点击查看失败提示原因。其中失败原因可分为以下几类：<br>(1)号源已满/占用：即所选择的预约号源已约满或是号源属于抢号机制，抢号失败即预约失败，可改约其他医生或其他时段的号源预约； <br>(2)使用预交金支付时余额不足失败：提示就诊卡余额不足（查看患者所选择的医院是否支持线上就诊卡充值，如果支持提示患者先进行就诊卡充值，若不支持提示患者先到医院窗口进行就诊卡充值后再进行预约挂号）； <br>(3)您已有相应科室的预约记录，不能重复预约：确认是否已通过其他渠道预约或是存在未就诊的预约记录； <br>(4)就诊卡信息异常预约/挂号失败：即您的预约就诊者信息和在医院办理就诊卡时预留的信息不一致导致，或是就诊卡信息异常，建议到窗口查询信息并完善信息； <br>(5)用户的预约受到了医院的限制不能正常使用预约/挂号；建议患者联系医院进行咨询如何解除限制； <br>(6)其他异常预约/挂号失败情况，可联系咨询APP客服处理。（注：<font color="red">复旦大学附属肿瘤医院在就诊日期前一天下午15时左右才会显示预约是否成功</font>）。'
    },
    {
        question:'预约/挂号缴费成功，返回预约/挂号结果失败如何退费？',
        answer:'&nbsp;&nbsp;&nbsp;&nbsp;您好，在预约挂号时，缴费成功但预约挂号失败，系统会自动将缴纳的费用原路退还至缴纳时的支付账号中。一般1-7个工作日退款会到账，但实际到账时间会在1-3天。'
    },
    {
        question:'为什么预约、挂号成功了不能取消预约、挂号？怎么取消预约、挂号？',
        answer:'&nbsp;&nbsp;&nbsp;&nbsp;您不能取消主要有以下几种原因：<br>(1)一般取消操作需在就诊日前完成； <br>(2)该医院不允许线上取消（未开通线上取消功能），建议您在预约挂号前，仔细阅读预约挂号条款； <br>(3)该记录已经就诊或已取号不允许取消； <br>(4)在有效时间内支持取消或是挂号的操作，点击首页下方【就医记录】-点击【预约记录】-选择对应的预约挂号记录点击【取消预约/挂号】即可。'
    },{
        question:'不能预约挂号的可能原因有哪些？',
        answer:'&nbsp;&nbsp;&nbsp;&nbsp;您好，不能预约挂号可能有以下原因：<br>(1)您当前的号源已被其他用户占用；<br>(2)您当天预约挂号次数已达到该医院限制的最大次数，所以不能预约；<br>(3)您无此医院的就诊卡，且该医院不支持无卡预约或申请建卡时，请到该医院办理就诊卡后预约；<br>(4)您被多个用户添加为就诊者，需要实名认证后，方可预约；<br>(5)您已在该医院的某一科室预约过，且达到限制的最大次数，则当天不能预约该科室；<br>若以上情况，都不是您不能预约挂号的原因，可联系趣医客服帮您查看。'
    },
    {
        question:'如何设置预约的自动抢号？',
        answer:'&nbsp;&nbsp;&nbsp;&nbsp;您好，只有医院开通了自动抢号功能且医院预约不缴费，才可以设置该功能，该功能设置时需进行注册账户的实名认证。若医院开通了自动抢号，提示用户可在趣医院APP首页点击【医院】-【预约挂号】-【科室】已约满的医生会有显示【已约满，可抢号】，在约满医生界面点击【自动抢号】-【添加自动抢号】确认即可，确认成功后如需查看或取消可在趣医院APP首页点击【我的】-【我的抢号】进行查看或删除。'
    },
    {
        question:'就诊卡绑定失败的可能原因是什么？',
        answer:'&nbsp;&nbsp;&nbsp;&nbsp;您好，请确认您在医院预留的身份信息及手机号与APP上维护的是否一致。若不一致，可选择在医院修改信息或进入APP【我的】选择对应的就诊者修改信息。如果还有其他疑问，可联系医院导医或拨打我们的客服热线：400-080-1010，感谢您的使用！'
    },
    {
        question:'当时注册身份证号和姓名不符，可以修改吗？',
        answer:'&nbsp;&nbsp;&nbsp;&nbsp;您好，需要您升级至最新版本，如果您要修改就诊者信息，可以在主页右下方点击【我的】进入个人中心界面，在界面上方显示的是当前就诊者的信息，您可以点击进入详情界面，然后点击界面下方的“上传身份证”提起申诉，我们将根据您提交身份信息进行修改，您也可以在个人中心打开设置修改您的账户信息，感谢您的使用！'
    },
    {
        question:'有些儿童没有身份证号码的怎么添加？',
        answer:'&nbsp;&nbsp;&nbsp;&nbsp;您好，您可将APP升级到最新版本后，在【我的】-【切换就诊者】-【添加】下新增就诊者，选择添加儿童就诊者即可，感谢您的支持！'
    },
    {
        question:'为什么有的报告单不能即时查到？',
        answer:'&nbsp;&nbsp;&nbsp;&nbsp;您好，没有即时查取到报告单可能有以下原因：<br>(1)您在医院的个人信息和注册时的个人信息不一致，如:姓名、手机号、身份证号；<br>(2)您没有绑定该医院的就诊卡，或者绑定的就诊卡不是做检查时的就诊卡；<br>(3)可能您的检查、检验报告单尚未出来；<br>(4)可能该医院暂未开通报告单的查询服务，可联系医院导医帮您确定；<br>若以上情况，都不是您没有即时查取到报告单的原因，可联系趣医客服帮您查看。'
    }
];
