/**
 * summary:表情service(表情数据、消息发送以及接收时表情码的转换)
 * author:WuDongDong
 * time:2016年6月27日15:04:40
 */
new KyeeModule()
    .group("kyee.quyiyuan.emoji.service")
    .require([])
    .type("service")
    .name("EmojiService")
    .params([])
    .action(function () {
        var imgPath = "resource/images/patients_group/emoji/";
        var rabbitPath = imgPath+'rabbit/';
        var def = {
            emojiUrl: imgPath, //表情存放的路径
            emojiData: [{ //表情集合
                    emojiUrl: imgPath + "ue056.png",
                    emojiCode: "ue056",
                    chineseSign: "[微笑]"
                }, {
                    emojiUrl: imgPath + "ue40b.png",
                    emojiCode: "ue40b",
                    chineseSign: "[吓]"
                }, {
                    emojiUrl: imgPath + "ue416.png",
                    emojiCode: "ue416",
                    chineseSign: "[咒骂]"
                }, {
                    emojiUrl: imgPath + "ue412.png",
                    emojiCode: "ue412",
                    chineseSign: "[流泪]"
                }, {
                    emojiUrl: imgPath + "ue105.png",
                    emojiCode: "ue105",
                    chineseSign: "[坏笑]"
                }, {
                    emojiUrl: imgPath + "ue415.png",
                    emojiCode: "ue415",
                    chineseSign: "[装海豹]"
                }, {
                    emojiUrl: imgPath + "ue414.png",
                    emojiCode: "ue414",
                    chineseSign: "[糗大了]"
                }, {
                    emojiUrl: imgPath + "ue020.png",
                    emojiCode: "ue020",
                    chineseSign: "[疑问]"
                }, {
                    emojiUrl: imgPath + "ue407.png",
                    emojiCode: "ue407",
                    chineseSign: "[擦汗]"
                }, {
                    emojiUrl: imgPath + "ue057.png",
                    emojiCode: "ue057",
                    chineseSign: "[发呆]"
                }, {
                    emojiUrl: imgPath + "ue409.png",
                    emojiCode: "ue409",
                    chineseSign: "[可怜]"
                }, {
                    emojiUrl: imgPath + "ue418.png",
                    emojiCode: "ue418",
                    chineseSign: "[亲亲]"
                }, {
                    emojiUrl: imgPath + "ue404.png",
                    emojiCode: "ue404",
                    chineseSign: "[得意]"
                }, {
                    emojiUrl: imgPath + "ue411.png",
                    emojiCode: "ue411",
                    chineseSign: "[哭瞎]"
                }, {
                    emojiUrl: imgPath + "ue106.png",
                    emojiCode: "ue106",
                    chineseSign: "[色]"
                }, {
                    emojiUrl: imgPath + "ue410.png",
                    emojiCode: "ue410",
                    chineseSign: "[晕]"
                }, {
                    emojiUrl: imgPath + "ue402.png",
                    emojiCode: "ue402",
                    chineseSign: "[阴险]"
                }, {
                    emojiUrl: imgPath + "ue00e.png",
                    emojiCode: "ue00e",
                    chineseSign: "[鼓掌]"
                }, {
                    emojiUrl: imgPath + "ue408.png",
                    emojiCode: "ue408",
                    chineseSign: "[睡]"
                }, {
                    emojiUrl: imgPath + "ue403.png",
                    emojiCode: "ue403",
                    chineseSign: "[叹气]"
                }, {
                    emojiUrl: imgPath + "ue107.png",
                    emojiCode: "ue107",
                    chineseSign: "[憨笑]"
                }, {
                    emojiUrl: imgPath + "ue413.png",
                    emojiCode: "ue413",
                    chineseSign: "[大哭]"
                }, {
                    emojiUrl: imgPath + "ue406.png",
                    emojiCode: "ue406",
                    chineseSign: "[揪心]"
                }, {
                    emojiUrl: imgPath + "ue108.png",
                    emojiCode: "ue108",
                    chineseSign: "[流汗]"
                }, {
                    emojiUrl: imgPath + "ue420.png",
                    emojiCode: "ue420",
                    chineseSign: "[再见]"
                }, {
                    emojiUrl: imgPath + "ue405.png",
                    emojiCode: "ue405",
                    chineseSign: "[调皮]"
                }
            ],

            //表情码与ascii对照表
            emojiCodeComp: {
                "ue056": "",
                "ue40b": "",
                "ue416": "",
                "ue412": "",
                "ue105": "",
                "ue415": "",
                "ue414": "",
                "ue020": "",
                "ue407": "",
                "ue057": "",
                "ue409": "",
                "ue418": "",
                "ue404": "",
                "ue411": "",
                "ue106": "",
                "ue410": "",
                "ue402": "",
                "ue00e": "",
                "ue408": "",
                "ue403": "",
                "ue107": "",
                "ue413": "",
                "ue406": "",
                "ue108": "",
                "ue420": "",
                "ue405": ""
            },

            //表情码与ascii对照表
            emojiCodeCompChineseSign: {
                "ue056": "[微笑]",
                "ue40b": "[吓]",
                "ue416": "[咒骂]",
                "ue412": "[流泪]",
                "ue105": "[坏笑]",
                "ue415": "[装海豹]",
                "ue414": "[糗大了]",
                "ue020": "[疑问]",
                "ue407": "[擦汗]",
                "ue057": "[发呆]",
                "ue409": "[可怜]",
                "ue418": "[亲亲]",
                "ue404": "[得意]",
                "ue411": "[哭瞎]",
                "ue106": "[色]",
                "ue410": "[晕]",
                "ue402": "[阴险]",
                "ue00e": "[鼓掌]",
                "ue408": "[睡]",
                "ue403": "[叹气]",
                "ue107": "[憨笑]",
                "ue413": "[大哭]",
                "ue406": "[揪心]",
                "ue108": "[流汗]",
                "ue420": "[再见]",
                "ue405": "[调皮]",
            },

            /**
             * 格式化消息文本（msgType=1）接收内容：将表情码转义成表情元素
             * @param content：消息内容
             * @returns {*}
             */
            formatReceiveText: function (content) {
                var me = this;
                for (var key in me.emojiCodeComp) {
                    content = content.replace(new RegExp("(" + me.emojiCodeComp[key] + ")", "g"), "<img style='width:20px;height:20px' src='" + me.emojiUrl + key + ".png'>");
                }
                return content;
            },

            /**
             * 将表情处理成[表情]文本（由于Notification不支持富文本）
             * @param content
             * @returns {*}
             */
            formatReceiveTextForNotification: function (content) {
                var me = this;
                for (var key in me.emojiCodeComp) {
                    content = content.replace(new RegExp("(" + me.emojiCodeComp[key] + ")", "g"), "[表情]");
                }
                return content;
            },

            /**
             * 将中文表情码转换为表情元素（用于接收）
             * @param content
             * @returns {*}
             */
            formatChineseSignToEmojiImage: function (content) {
                var me = this;
                for (var key in me.emojiCodeCompChineseSign) {
                    if (content) {
                        if (key.indexOf('lt') > -1) {
                            content = content.replace(new RegExp("(\\" + me.emojiCodeCompChineseSign[key].substring(0, me.emojiCodeCompChineseSign[key].length - 1) + "\\])", "g"), "<img class='rabbit_msg' src='" + me.emojiUrl + key + ".png'>");
                        } else {
                            content = content.replace(new RegExp("(\\" + me.emojiCodeCompChineseSign[key].substring(0, me.emojiCodeCompChineseSign[key].length - 1) + "\\])", "g"), "<img class='emoji_msg' src='" + me.emojiUrl + key + ".png'>");
                        }
                    }
                }
                return content;
            },

            //格式化消息文本(msgType=1)发送内容：将表情元素转义成表情码
            formatSendText: function (content) {
                var me = this;
                var startIndex = content.indexOf("<img");
                if (startIndex > -1) {
                    var endIndex = content.indexOf("\">", startIndex + 4) + 2;
                    var subEmoji = content.substring(startIndex, endIndex);
                    var subEmojiCode = subEmoji.substring(subEmoji.indexOf("\"") + 1, subEmoji.indexOf("_"));
                    content = content.replace(subEmoji, me.emojiCodeComp[subEmojiCode]);
                    content = me.formatSendText(content); //递归
                }
                return content;
            },

            /**
             * 将表情元素转换为中文表情码(用于发送)
             * @param content
             * @returns {*}
             */
            formatEmojiImageToChineseSignTo: function (content) {
                var me = this;
                var startIndex = content.indexOf("<img");
                if (startIndex > -1) {
                    var endIndex = content.indexOf(">", startIndex + 4) + 1;
                    var subEmoji = content.substring(startIndex, endIndex);
                    var subEmojiCode = subEmoji.substring(subEmoji.lastIndexOf("/") + 1, subEmoji.indexOf('.png'));
                    content = content.replace(subEmoji, me.emojiCodeCompChineseSign[subEmojiCode]);
                    content = me.formatEmojiImageToChineseSignTo(content); //递归
                }
                return content;
            },

            //格式化图片路径
            formatImageUrl: function (content) {
                var url = "<img class='picClass' id='pic_" + content.id + "' src=" + content.localPath + ">"
                return url;
            },

            //格式化发送图片
            formatSendImage: function (content) {
                var url = "<img class='picClass' id='pic_" + content.id + "' src=" + content.localPath + ">"
                return url;
            },
            //格式化接收图片
            formatReceiveImage: function (content) {
                var url = "<img class='picClass' id='pic_" + content.id + "' src=" + content.url + ">"
                return url;
            }
        };
        return def;
    })
    .build();