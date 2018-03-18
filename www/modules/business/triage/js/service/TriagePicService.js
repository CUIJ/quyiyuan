/**
 * 产品名称：quyiyuan
 * 创建者：章剑飞
 * 创建时间：2015年5月6日15:27:27
 * 创建原因：图形导诊服务
 * 修改者：
 * 修改原因：对图形导诊服务请求加10分钟的缓存
 * 修改任务：KYEEAPPC-4269
 */
new KyeeModule()
    .group("kyee.quyiyuan.triagePic.service")
    .type("service")
    .name("TriagePicService")
    .params(["HttpServiceBus", "KyeeMessageService"])
    .action(function (HttpServiceBus, KyeeMessageService) {
        var def = {
            //默认性别 1：男 2：女
            currentSex: '1',
            //默认面向 01：正 00：反
            currentDirection: '01',
            //处理数据
            dealData: function (dataBack, bodyPosition) {
                HttpServiceBus.connect({
                    url: "triage/action/BodyPositionActionC.jspx",
                    params: {
                        op: "initBodyPosition"
                    },
                    cache: {
                        by: "TIME",
                        value: 10 * 60
                    },
                    onSuccess: function (data) {
                        if (data.success || data.success == undefined) {
                            if (data.message == 'useData') {
                                bodyPosition = angular.copy(data.data);
                            }
                            //总数据集
                            var TriageData = [];
                            //正面数据集
                            var TriageDataFront = [];
                            //背面数据集
                            var TriageDataBack = [];
                            var TriageOrgData = bodyPosition.bodyInfo;
                            for (var i = 0; i < TriageOrgData.length; i++) {
                                if (TriageOrgData[i].BODY_CODE == '32'
                                    || TriageOrgData[i].BODY_CODE == '33'
                                    || TriageOrgData[i].BODY_CODE == '34'
                                    || TriageOrgData[i].BODY_CODE == '35') {
                                    TriageDataBack.push(TriageOrgData[i]);
                                } else if (TriageOrgData[i].BODY_CODE == '1'
                                    || TriageOrgData[i].BODY_CODE == '2'
                                    || TriageOrgData[i].BODY_CODE == '3'
                                    || TriageOrgData[i].BODY_CODE == '4'
                                    || TriageOrgData[i].BODY_CODE == '5'
                                    || TriageOrgData[i].BODY_CODE == '6'
                                    || TriageOrgData[i].BODY_CODE == '7'
                                    || TriageOrgData[i].BODY_CODE == '10'
                                    || TriageOrgData[i].BODY_CODE == '11'
                                    || TriageOrgData[i].BODY_CODE == '20'
                                    || TriageOrgData[i].BODY_CODE == '21'
                                    || TriageOrgData[i].BODY_CODE == '36') {
                                    TriageDataFront.push(TriageOrgData[i]);
                                } else {
                                    TriageDataBack.push(TriageOrgData[i]);
                                    TriageDataFront.push(TriageOrgData[i]);
                                }
                            }
                            TriageData.push(TriageDataFront);
                            TriageData.push(TriageDataBack);
                            dataBack(TriageData);
                        } else {
                            KyeeMessageService.broadcast({
                                content: data.message
                            });
                        }
                    },
                    onError: function () {

                    }
                });
            },
            //坐标换算
            coordsConvert: function (coords, TriageMainData, scale) {
                //angular.forEach(coords, function (coord, index, items) {
                for (var i = 0; i < TriageMainData.length; i++) {
                    var coordArray = coords[TriageMainData[i].BODY_ID].split(',');
                    //转换后的坐标字符串
                    var coords_str = "";
                    //按比例缩放坐标
                    for (var j = 0; j < coordArray.length; j++) {
                        if (j != (coordArray.length - 1)) {
                            coords_str += parseInt(coordArray[j] * scale) + ",";
                        }
                        else {
                            coords_str += parseInt(coordArray[j] * scale);
                        }
                    }
                    coords[TriageMainData[i].BODY_ID] = coords_str;
                }
                //});
                return coords;
            },
            //判断点是否在多边形内
            isPointInPolygon: function (result, coords, TriageMainData, x, y) {
                var bodyId = '';
                var bodyName = '';
                var flag = false;
                for (var i = 0; i < TriageMainData.length; i++) {
                    var coordArray = coords[TriageMainData[i].BODY_ID].split(',');
                    var xpoints = [];
                    var ypoints = [];
                    //按比例缩放坐标
                    for (var j = 0; j < coordArray.length; j++) {
                        if (j % 2 == 0) {
                            xpoints.push(coordArray[j]);
                        } else {
                            ypoints.push(coordArray[j]);
                        }
                    }
                    flag = this.contain(xpoints, ypoints, xpoints.length, x, y);
                    //如果坐标在多边形内则跳出循环
                    if (flag) {
                        bodyId = TriageMainData[i].BODY_ID;
                        bodyName = TriageMainData[i].BODY_NAME;
                        break;
                    }
                }
                result(flag, bodyId, bodyName);
            },
            //计算某一点是否落在多边形内
            contain: function (xpoints, ypoints, npoints, x, y) {
                if (npoints <= 2 || !this.calculateBound(xpoints, ypoints, npoints, x, y)) {
                    return false;
                }

                var hits = 0;
                var lastx = parseInt(xpoints[npoints - 1]);
                var lasty = parseInt(ypoints[npoints - 1]);
                var curx, cury;

                // Walk the edges of the polygon
                for (var i = 0; i < npoints; lastx = curx, lasty = cury, i++) {
                    curx = parseInt(xpoints[i]);
                    cury = parseInt(ypoints[i]);

                    if (cury == lasty) {
                        continue;
                    }

                    var leftx;
                    if (curx < lastx) {
                        if (x >= lastx) {
                            continue;
                        }
                        leftx = curx;
                    } else {
                        if (x >= curx) {
                            continue;
                        }
                        leftx = lastx;
                    }

                    var test1, test2;
                    if (cury < lasty) {
                        if (y < cury || y >= lasty) {
                            continue;
                        }
                        if (x < leftx) {
                            hits++;
                            continue;
                        }
                        test1 = x - curx;
                        test2 = y - cury;
                    } else {
                        if (y < lasty || y >= cury) {
                            continue;
                        }
                        if (x < leftx) {
                            hits++;
                            continue;
                        }
                        test1 = x - lastx;
                        test2 = y - lasty;
                    }

                    if (test1 < (test2 / (lasty - cury) * (lastx - curx))) {
                        hits++;
                    }
                }

                return ((hits & 1) != 0);
            },

            //是否在包含多边形的最小矩形内
            calculateBound: function (xpoints, ypoints, npoints, x, y) {
                var boundsMinX = xpoints[0];
                var boundsMinY = ypoints[0];
                var boundsMaxX = xpoints[0];
                var boundsMaxY = ypoints[0];

                for (var i = 0; i < npoints; i++) {
                    var xpoint = xpoints[i];
                    boundsMinX = Math.min(boundsMinX, xpoint);
                    boundsMaxX = Math.max(boundsMaxX, xpoint);
                    var ypoint = ypoints[i];
                    boundsMinY = Math.min(boundsMinY, ypoint);
                    boundsMaxY = Math.max(boundsMaxY, ypoint);
                }
                return (((x > boundsMinX)&&(boundsMaxX > x))&&
                    ((y > boundsMinY)&&(boundsMaxY > y)));
            }
        };

        return def;
    })
    .build();