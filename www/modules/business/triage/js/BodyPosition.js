/**
 * 创建人：章剑飞
 * 创建时间：2015年9月8日14:05:12
 * 创建原因：维护部位坐标
 */
BODY_POSITION = {
    //部位名与对应的ID和CODE
   /* bodyInfo: [{
        BODY_CODE: 1,
        BODY_ID: 1,
        BODY_NAME: "头部"
    }, {
        BODY_CODE: 2,
        BODY_ID: 2,
        BODY_NAME: "颈部"
    }, {
        BODY_CODE: 10,
        BODY_ID: 10,
        BODY_NAME: "胸部"
    }, {
        BODY_CODE: 11,
        BODY_ID: 11,
        BODY_NAME: "腹部"
    }, {
        BODY_CODE: 16,
        BODY_ID: 16,
        BODY_NAME: "背部"
    }, {
        BODY_CODE: 18,
        BODY_ID: 18,
        BODY_NAME: "臀部"
    }, {
        BODY_CODE: 12,
        BODY_ID: 39,
        BODY_NAME: "右上肢"
    }, {
        BODY_CODE: 13,
        BODY_ID: 33,
        BODY_NAME: "右手部"
    }, {
        BODY_CODE: 12,
        BODY_ID: 38,
        BODY_NAME: "左上肢"
    }, {
        BODY_CODE: 13,
        BODY_ID: 40,
        BODY_NAME: "左手部"
    }, {
        BODY_CODE: 14,
        BODY_ID: 35,
        BODY_NAME: "右下肢"
    }, {
        BODY_CODE: 15,
        BODY_ID: 37,
        BODY_NAME: "右足部"
    }, {
        BODY_CODE: 14,
        BODY_ID: 34,
        BODY_NAME: "左下肢"
    }, {
        BODY_CODE: 15,
        BODY_ID: 36,
        BODY_NAME: "左足部"
    }],*/
    bodyInfo: [{
        BODY_CODE: 1,
        BODY_ID: 1,
        BODY_NAME: "左眼部"
    }, {
        BODY_CODE: 2,
        BODY_ID: 2,
        BODY_NAME: "右眼部"
    }, {
        BODY_CODE: 3,
        BODY_ID: 3,
        BODY_NAME: "左耳部"
    }, {
        BODY_CODE: 4,
        BODY_ID: 4,
        BODY_NAME: "右耳部"
    }, {
        BODY_CODE: 5,
        BODY_ID: 5,
        BODY_NAME: "鼻部"
    }, {
        BODY_CODE: 6,
        BODY_ID: 6,
        BODY_NAME: "口部"
    }, {
        BODY_CODE: 7,
        BODY_ID: 7,
        BODY_NAME: "面部"
    }, {
        BODY_CODE: 8,
        BODY_ID: 8,
        BODY_NAME: "头部"
    }, {
        BODY_CODE: 9,
        BODY_ID: 9,
        BODY_NAME: "颈部"
    }, {
        BODY_CODE: 36,
        BODY_ID: 36,
        BODY_NAME: "乳房"
    }, {
        BODY_CODE: 10,
        BODY_ID: 10,
        BODY_NAME: "胸部"
    }, {
        BODY_CODE: 11,
        BODY_ID: 11,
        BODY_NAME: "腹部"
    }, {
        BODY_CODE: 12,
        BODY_ID: 12,
        BODY_NAME: "左肘部"
    }, {
        BODY_CODE: 13,
        BODY_ID: 13,
        BODY_NAME: "右肘部"
    }, {
        BODY_CODE: 14,
        BODY_ID: 14,
        BODY_NAME: "左手部"
    }, {
        BODY_CODE: 15,
        BODY_ID: 15,
        BODY_NAME: "右手部"
    },{
        BODY_CODE: 16,
        BODY_ID: 16,
        BODY_NAME: "左腕部"
    },{
        BODY_CODE: 17,
        BODY_ID: 17,
        BODY_NAME: "右腕部"
    },{
        BODY_CODE: 18,
        BODY_ID: 18,
        BODY_NAME: "左上臂"
    },{
        BODY_CODE: 19,
        BODY_ID: 19,
        BODY_NAME: "右上臂"
    }, {
        BODY_CODE: 20,
        BODY_ID: 20,
        BODY_NAME: "髋部"
    },  {
        BODY_CODE: 21,
        BODY_ID: 21,
        BODY_NAME: "阴部"
    }, {
        BODY_CODE: 22,
        BODY_ID: 22,
        BODY_NAME: "左大腿"
    }, {
        BODY_CODE: 23,
        BODY_ID: 23,
        BODY_NAME: "右大腿"
    },  {
        BODY_CODE: 24,
        BODY_ID: 24,
        BODY_NAME: "左膝部"
    }, {
        BODY_CODE: 25,
        BODY_ID: 25,
        BODY_NAME: "右膝部"
    }, {
        BODY_CODE: 26,
        BODY_ID: 26,
        BODY_NAME: "左小腿"
    },{
        BODY_CODE: 27,
        BODY_ID: 27,
        BODY_NAME: "右小腿"
    }, {
        BODY_CODE: 28,
        BODY_ID: 28,
        BODY_NAME: "左脚踝"
    }, {
        BODY_CODE: 29,
        BODY_ID: 29,
        BODY_NAME: "右脚踝"
    }, {
        BODY_CODE: 30,
        BODY_ID: 30,
        BODY_NAME: "左脚部"
    },{
        BODY_CODE: 31,
        BODY_ID: 31,
        BODY_NAME: "右脚部"
    }, {
        BODY_CODE: 32,
        BODY_ID: 32,
        BODY_NAME: "腰背部"
    }, {
        BODY_CODE: 33,
        BODY_ID: 33,
        BODY_NAME: "臀部"
    }, {
        BODY_CODE: 34,
        BODY_ID: 34,
        BODY_NAME: "下臂"
    }, {
        BODY_CODE: 35,
        BODY_ID: 35,
        BODY_NAME: "其他"
    }],
    //key为BODY_ID，VALUE为坐标
    //儿童
    child: {
        //正面
        front: {
            1: "181,94,187,94,187,102,181,102",
            2: "154,94,160,94,160,102,154,102",
            3: "197,92,204,90,203,104,196,107",
            4: "141,91,146,92,148,106,143,106",
            5: "170,102,173,112,166,102",
            6: "163,116,179,116,170,122",
            7: "148,92,196,92,196,113,177,128,162,128,149,115",
            8: "142,61,173,50,196,59,202,102,180,128,160,125,149,114,134,79",
            9: "161,127,170,130,182,126,183,137,157,137",
            10: "140,142,156,136,184,136,204,142,197,204,142,204",
            11: "142,204,197,204,204,245,138,245",
            12: "206,193,222,193,225,204,209,204",
            13: "119,190,133,194,130,209,113,209",
            14: "220,244,234,244,240,267,224,279,214,266",
            15: "105,244,121,244,125,266,114,284,100,266",
            16: "218,237,232,230,234,241,220,241",
            17: "110,234,123,234,120,243,108,241",
            18: "204,144,214,154,234,235,221,241,202,179",
            19: "138,143,140,180,120,242,107,240,128,147",
            20: "",
            21: "138,245,204,245,180,275,157,275",
            22: "204,245,205,313,181,315,176,271",
            23: "138,245,157,275,161,314,134,314",
            24: "182,321,205,321,204,336,182,339",
            25: "135,317,160,322,158,335,135,335",
            26: "183,337,206,337,207,393,192,392",
            27: "135,339,157,340,150,390,135,390",
            28: "192,393,205,393,208,408,192,410",
            29: "134,393,149,393,148,406,134,408",
            30: "191,413,209,408,230,444,205,448",
            31: "133,409,149,408,151,422,129,450,109,442",
            36: ""
        },
       /* front: {
            //头部
            1: "172,55,145,60,135,80,145,110,160,130,180,130,200,110,208,80,195,60",
            //颈部
            2: "160,130,160,140,182,140,182,130",
            //胸部
            10: "160,140,140,143,140,195,202,195,202,143,182,140",
            //腹部
            11: "140,195,143,233,162,280,176,280,200,235,202,195",
            //右上肢
            39: "140,143,128,150,108,240,123,240,140,182",
            //右手部
            33: "108,240,100,252,102,270,117,284,118,264,128,271,123,240",
            //左上肢
            38: "202,143,215,152,235,240,220,240,202,185",
            //左手部
            40: "220,240,213,271,223,264,223,284,240,270,240,250,235,240",
            //右下肢
            35: "143,233,132,305,134,407,149,407,159,355,159,330,162,280",
            //右足部
            37: "134,407,111,443,129,452,153,419,149,407",
            //左下肢
            34: "176,280,182,330,184,363,193,408,208,408,208,306,200,235",
            //左足部
            36: "193,408,189,421,210,450,232,443,208,408"
        },*/

        back: {
            8: "149,55,173,52,208,78,189,121,152,120,133,77",
            9: "159,122,180,124,181,136,157,137",
            32: "137,144,158,136,181,136,204,144,202,184,199,233,142,232,137,183",
            33: "139,233,139,234,208,270,135,270",
            12: "114,199,133,199,128,217,111,217",
            13: "207,197,224,197,230,213,213,217",
            14: "102,248,117,250,123,272,113,283,101,282,98,257",
            15: "224,248,236,248,242,277,229,287,215,271",
            16: "107,236,121,236,117,245,105,242",
            17: "220,239,234,235,235,242,223,247",
            18: "136,146,139,184,118,244,104,241,125,155",
            19: "204,143,214,153,234,238,224,245,202,183",
            22: "134,285,170,287,163,329,135,326",
            23: "172,285,208,278,206,327,181,326",
            24: "136,330,161,330,159,349,137,349",
            25: "181,329,206,330,205,346,184,336",
            26: "137,350,158,350,153,416,137,416",
            27: "184,350,206,350,207,415,190,415",
            28: "135,416,151,416,151,428,134,428",
            29: "190,418,207,416,208,429,192,430",
            30: "112,448,134,429,153,428,156,449",
            31: "193,431,208,428,232,447,187,448",
            34:"",
            35:""
        }
        //背面
     /*   back: {
            //头部
            1: "170,55,135,70,135,100,150,125,185,125,205,100,205,70",
            //颈部
            2: "160,125,160,140,180,140,180,125",
            //背部
            16: "160,140,135,145,140,185,140,235,200,235,200,185,205,145,180,140",
            //臀部
            18: "140,235,133,285,210,285,200,235",
            //右上肢
            39: "205,145,215,155,235,245,220,245,200,185",
            //右手部
            33: "235,245,242,260,242,280,238,287,230,287,225,270,215,275,220,245",
            //左上肢
            38: "135,145,125,155,105,245,120,245,140,185",
            //左手部
            40: "105,245,100,260,100,275,105,285,115,285,115,270,125,275,120,245",
            //右下肢
            35: "170,285,182,338,185,380,191,427,209,427,210,285",
            //右足部
            37: "191,427,188,443,194,450,220,450,230,445,209,427",
            //左下肢
            34: "133,285,135,427,153,427,160,380,160,340,170,285",
            //左足部
            36: "135,427,113,443,124,450,150,450,156,442,153,427"
        }*/
    },
    //男人
    man: {
        //正面
/*        front: {
            //头部
            1: "247,18,234,29,232,45,236,65,246,79,255,79,269,66,275,47,275,31,265,19",
            //颈部
            2: "238,67,233,82,268,87,265,71,255,79,246,79",
            //胸部
            10: "233,82,223,84,200,120,206,150,286,155,286,93,268,87",
            //腹部
            11: "206,150,204,185,195,215,231,262,236,262,281,218,278,206,279,186,286,155",
            //右上肢
            39: "223,84,211,80,186,85,152,86,121,82,83,85,80,102,90,102,115,109,135,109,168,118,200,120",
            //右手部
            33: "83,85,76,77,61,71,57,64,52,69,58,79,26,80,30,102,65,105,80,102",
            //左上肢
            38: "286,93,305,100,314,115,314,210,304,262,290,259,286,155",
            //左手部
            40: "290,259,283,270,290,301,308,288,304,262",
            //右下肢
            35: "195,215,157,375,125,445,147,462,148,450,194,380,200,340,231,262",
            //右足部
            37: "125,445,95,466,75,475,82,481,146,482,152,473,147,462",
            //左下肢
            34: "236,262,252,440,270,440,280,370,276,354,275,325,280,292,282,218",
            //左足部
            36: "252,440,247,486,273,480,270,440"
        },*/
        front: {
            1: "256,52,265,51,261,52",
            2: "240,49,248,51,244,52",
            3: "269,49,273,46,270,55",
            4: "234,40,234,54,232,44",
            5: "248,62,252,57,254,62",
            6: "244,66,257,68,250,70",
            7: "236,52,268,54,266,66,253,77,245,75,235,61",
            8: "234,30,244,16,262,15,275,34,267,66,253,77,245,75,235,61",
            9: "237,68,245,76,252,78,265,72,265,85,234,81",
            10: "199,114,203,81,286,94,286,145,204,142",
            11: "205,147,285,153,275,209,197,208",
            12: "290,182,313,179,313,193,289,193",
            13: "137,82,152,86,139,108,125,106",
            14: "287,262,302,268,306,288,289,300,285,274",
            15: "28,81,53,65,78,81,79,100,26,98",
            16: "291,250,305,252,303,259,289,258",
            17: "80,83,89,85,88,99,75,99",
            18: "289,94,312,109,302,258,290,255,286,143",
            19: "89,84,193,84,200,116,88,100",
            20: "194,215,279,218,280,230,193,229",
            21: "211,234,252,242,233,264",
            22: "238,259,291,232,273,327,245,331",
            23: "193,232,228,260,198,332,172,323",
            24: "246,337,272,335,275,357,249,363",
            25: "168,341,196,340,195,355,163,358",
            26: "247,371,277,368,269,427,251,428",
            27: "160,367,194,364,158,432,136,427",
            28: "252,438,268,440,267,449,250,450",
            29: "132,437,153,441,144,456,122,447",
            30: "250,455,267,454,272,481,247,482",
            31: "112,455,143,459,150,478,73,478",
            36: ""
        },
        //背面
/*        back: {
            //头部
            1: "84,18,73,36,72,55,83,69,113,69,122,50,118,28,106,18",
            //颈部
            2: "83,69,79,83,116,83,113,69",
            //背部
            16: "79,83,50,93,58,156,72,193,72,209,150,209,145,185,153,123,135,83",
            //臀部
            18: "72,209,66,240,68,265,162,257,150,209",
            //右上肢
            39: "135,83,152,80,200,86,230,80,262,84,264,102,153,123",
            //右手部
            33: "262,84,278,74,291,63,294,70,289,78,320,79,317,99,282,104,264,102",
            //左上肢
            38: "50,93,35,102,31,130,22,214,30,258,49,254,47,243,48,200,58,156",
            //左手部
            40: "30,258,32,280,43,296,56,297,65,293,60,285,58,266,49,254",
            //右下肢
            35: "111,262,152,348,155,365,166,392,196,432,206,465,230,452,216,428,162,257",
            //右足部
            37: "206,465,202,476,207,484,260,485,272,477,260,474,230,452",
            //左下肢
            34: "68,265,78,335,73,363,73,400,84,440,82,459,103,459,100,450,100,430,108,390,108,360,105,343,110,310,111,262",
            //左足部
            36: "82,459,72,480,96,485,105,475,103,459"
        }*/
        back: {
            8: "73,33,81,17,110,20,112,64,81,64,74,47",
            9: "80,67,109,67,110,81,80,80",
            32: "55,95,75,81,111,82,152,117,145,209,71,211,55,146",
            33: "70,214,146,208,157,242,137,257,81,260,64,248",
            12: "21,186,48,185,45,203,20,201",
            13: "196,85,211,83,222,108,208,109",
            14: "29,261,47,256,61,289,39,292",
            15: "270,81,291,65,318,80,316,95,272,98",
            16: "28,244,42,240,44,251,30,255",
            17: "255,83,264,82,267,99,257,102",
            18: "36,102,54,142,42,244,27,240,20,197",
            19: "131,81,258,82,261,102,153,118",
            22: "66,259,109,259,103,332,78,326",
            23: "112,258,157,253,176,325,147,331",
            24: "78,336,102,336,102,352,75,350",
            25: "151,338,177,326,185,345,152,352",
            26: "71,360,104,365,98,433,82,437",
            27: "154,360,185,350,217,433,198,431,163,386",
            28: "84,448,98,446,100,459,81,462",
            29: "203,444,221,441,231,456,206,461",
            30: "80,470,100,468,100,480,71,479",
            31: "206,465,240,464,273,479,203,481",
            34: "",
            35: ""
        }
    },
    //女人
    woman: {
        //正面
    /*    front: {
            //头部
            1: "173,20,161,23,154,30,155,63,174,84,182,84,202,62,201,34,189,19",
            //颈部
            2: "169,80,169,92,190,92,189,78,182,84,174,84",
            //胸部
            10: "169,92,147,96,150,120,146,134,152,151,204,151,211,132,209,121,209,95,190,92",
            //腹部
            11: "152,151,157,163,156,175,146,189,143,201,173,224,180,224,208,200,208,185,199,171,204,151",
            //右上肢
            39: "147,96,137,103,129,124,121,174,110,198,103,238,113,238,116,226,134,191,137,175,148,141,146,134,150,120",
            //右手部
            33: "103,238,87,247,78,271,89,269,92,255,103,251,104,263,113,246,113,238",
            //左上肢
            38: "209,95,220,100,230,116,264,151,245,172,219,190,208,185,238,151,209,121",
            //左手部
            40: "208,185,208,212,214,205,217,222,223,212,223,205,219,197,219,190",
            //右下肢
            35: "143,201,136,217,138,244,145,273,159,317,159,324,153,343,152,377,157,436,170,436,171,412,180,350,180,335,183,326,179,248,173,224",
            //右足部
            37: "157,436,147,461,146,476,160,481,166,477,170,436",
            //左下肢
            34: "180,224,179,248,183,326,183,326,180,335,180,350,171,412,172,445,185,446,190,396,198,358,198,318,212,259,217,222,214,205,208,212,208,200",
            //左足部
            36: "172,445,170,454,172,473,178,479,198,478,201,473,185,446"
        },*/
        front: {
            1: "183,58,193,56,192,60",
            2: "163,56,173,58,165,60",
            3: "198,56,200,65,195,64",
            4: "156,56,160,58,160,66",
            5: "177,61,182,69,175,68",
            6: "171,73,185,73,177,76",
            7: "160,60,195,60,193,72,177,82,163,72",
            8: "157,25,187,20,197,52,193,72,177,82,163,72,158,52",
            9: "170,80,177,84,188,78,188,90,170,90",
            36: "153,119,178,125,208,118,204,143,152,146",
            10: "150,96,169,71,187,91,206,95,200,159,157,163",
            11: "158,166,198,166,207,193,146,193",
            12: "237,146,258,144,264,151,257,159,238,153",
            13: "123,164,139,165,135,180,119,180",
            14: "209,191,218,193,224,206,217,220",
            15: "102,238,112,238,106,260,80,266,87,247",
            16: "215,181,223,185,219,189,210,188",
            17: "106,228,114,230,113,236,103,235",
            18: "214,98,263,153,224,185,217,178,241,152,210,122",
            19: "147,98,149,137,116,228,103,220",
            20: "146,194,213,195,216,214,192,199,163,199,139,220",
            21: "158,199,193,198,197,208,181,225,173,223,153,204",
            22: "182,225,214,208,199,311,184,310",
            23: "142,201,174,225,181,306,159,312,136,215",
            24: "183,311,199,314,196,336,179,335",
            25: "160,310,183,313,180,337,156,333",
            26: "180,346,199,345,185,431,173,428",
            27: "153,342,179,341,169,421,156,413,152,355",
            28: "174,435,183,438,184,450,171,452",
            29: "158,428,170,425,169,443,154,439",
            30: "172,456,189,445,200,473,175,476",
            31: "152,448,169,448,165,475,146,472"
        },
        back: {
            8: "155,18,182,25,189,34,193,78,133,81,143,30",
            9: "155,83,171,82,173,91,152,91",
            32: "134,97,153,92,173,90,194,98,192,136,183,169,196,193,131,191,144,169,132,132",
            33: "132,193,196,193,203,212,203,236,126,234",
            12: "85,144,106,144,106,154,83,160,80,153",
            13: "204,170,219,166,224,182,206,186",
            14: "123,190,131,186,129,200,126,219,118,205",
            15: "231,242,242,239,255,247,262,266,231,256",
            16: "118,183,126,177,132,185,122,189",
            17: "228,229,235,229,237,235,227,234",
            18: "132,97,133,119,102,151,129,182,115,183,80,151,86,139",
            19: "200,96,238,229,222,227,192,134",
            22: "126,234,163,234,168,310,142,310",
            23: "165,235,203,234,184,310,168,310",
            24: "142,310,168,310,171,331,144,331",
            25: "168,310,185,310,188,331,171,331",
            26: "144,331,173,331,170,433,157,427",
            27: "173,331,192,331,186,421,173,420",
            28: "157,431,168,431,169,446,156,448",
            29: "174,421,186,421,186,437,173,437",
            30: "157,446,170,451,168,475,138,474",
            31: "172,437,188,437,198,472,174,475",
            34:"",
            35:""
        }
        //背面
    /*   back: {
            //头部
            1: "155,20,144,27,134,83,196,83,189,53,190,35,180,23",
            //颈部
            2: "154,83,154,95,176,95,173,83",
            //背部
            16: "154,95,133,95,133,137,143,174,185,174,192,136,192,97,176,95",
            //臀部
            18: "143,174,133,186,132,200,126,213,130,223,145,240,185,240,202,204,185,174",
            //右上肢
            39: "192,97,203,101,214,123,221,176,232,198,239,236,230,243,226,226,207,193,205,172,192,136",
            //右手部
            33: "230,243,236,264,239,252,248,254,252,268,260,272,264,269,255,247,239,236",
            //左上肢
            38: "133,95,120,103,78,153,123,192,133,186,104,152,133,120",
            //左手部
            40: "123,192,117,209,130,223,126,213,132,200,133,186",
            //右下肢
            35: "202,204,205,241,184,315,184,326,191,344,186,436,172,436,171,409,175,344,170,321,163,240,185,240",
            //右足部
            37: "172,436,176,480,184,481,197,475,196,463,186,436",
            //左下肢
            34: "126,223,131,272,144,325,145,364,156,427,156,452,171,452,170,428,171,409,175,344,170,321,163,240,145,240",
            //左足部
            36: "156,452,140,474,142,478,164,478,170,471,171,452"
        }*/
    }
};
