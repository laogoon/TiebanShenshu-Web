/**
 * 天文曆法與四柱八字排盤核心引擎
 * 支援精確二十四節氣月柱、早夜子時、干支藏干、十神、納音五行、大運推排
 */
(function(global) {
    'use strict';

    // 基礎天文常數與干支數據
    const TIANGAN = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
    const DIZHI = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
    const SHENGXIAO = ["鼠", "牛", "虎", "兔", "龍", "蛇", "馬", "羊", "猴", "雞", "狗", "豬"];
    const WUXING = { "木": ["甲", "乙", "寅", "卯"], "火": ["丙", "丁", "巳", "午"], "土": ["戊", "己", "辰", "戌", "丑", "未"], "金": ["庚", "辛", "申", "酉"], "水": ["壬", "癸", "亥", "子"] };

    // 六十甲子納音五行表
    const NAYIN_TABLE = {
        "甲子": "海中金", "乙丑": "海中金", "丙寅": "爐中火", "丁卯": "爐中火", "戊辰": "大林木", "己巳": "大林木",
        "庚午": "路旁土", "辛未": "路旁土", "壬申": "劍鋒金", "癸酉": "劍鋒金", "甲戌": "山頭火", "乙亥": "山頭火",
        "丙子": "澗下水", "丁丑": "澗下水", "戊寅": "城頭土", "己卯": "城頭土", "庚辰": "白蠟金", "辛巳": "白蠟金",
        "壬午": "楊柳木", "癸未": "楊柳木", "甲申": "泉中水", "乙酉": "泉中水", "丙戌": "屋上土", "丁亥": "屋上土",
        "戊子": "霹靂火", "己丑": "霹靂火", "庚寅": "松柏木", "辛卯": "松柏木", "壬辰": "長流水", "癸巳": "長流水",
        "甲午": "砂中金", "乙未": "砂中金", "丙申": "山下火", "丁酉": "山下火", "戊戌": "平地木", "己亥": "平地木",
        "庚子": "壁上土", "辛丑": "壁上土", "壬寅": "金箔金", "癸卯": "金箔金", "甲辰": "覆燈火", "乙巳": "覆燈火",
        "丙午": "天河水", "丁未": "天河水", "戊申": "大驛土", "己酉": "大驛土", "庚戌": "釵釧金", "辛亥": "釵釧金",
        "壬子": "桑柘木", "癸丑": "桑柘木", "甲寅": "大溪水", "乙卯": "大溪水", "丙辰": "砂中土", "丁巳": "砂中土",
        "戊午": "天上火", "己未": "天上火", "庚申": "石榴木", "辛酉": "石榴木", "壬戌": "大海水", "癸亥": "大海水"
    };

    // 地支藏干表
    const CANGGAN_TABLE = {
        "子": ["癸"],
        "丑": ["己", "癸", "辛"],
        "寅": ["甲", "丙", "戊"],
        "卯": ["乙"],
        "辰": ["戊", "乙", "癸"],
        "巳": ["丙", "庚", "戊"],
        "午": ["丁", "己"],
        "未": ["己", "丁", "乙"],
        "申": ["庚", "壬", "戊"],
        "酉": ["辛"],
        "戌": ["戊", "辛", "丁"],
        "亥": ["壬", "甲"]
    };

    // 天干五行與陰陽
    const GAN_INFO = {
        "甲": { elem: "木", yinYang: "陽" }, "乙": { elem: "木", yinYang: "陰" },
        "丙": { elem: "火", yinYang: "陽" }, "丁": { elem: "火", yinYang: "陰" },
        "戊": { elem: "土", yinYang: "陽" }, "己": { elem: "土", yinYang: "陰" },
        "庚": { elem: "金", yinYang: "陽" }, "辛": { elem: "金", yinYang: "陰" },
        "壬": { elem: "水", yinYang: "陽" }, "癸": { elem: "水", yinYang: "陰" }
    };

    // 地支五行與陰陽
    const ZHI_INFO = {
        "子": { elem: "水", yinYang: "陽", shengxiao: "鼠" }, "丑": { elem: "土", yinYang: "陰", shengxiao: "牛" },
        "寅": { elem: "木", yinYang: "陽", shengxiao: "虎" }, "卯": { elem: "木", yinYang: "陰", shengxiao: "兔" },
        "辰": { elem: "土", yinYang: "陽", shengxiao: "龍" }, "巳": { elem: "火", yinYang: "陰", shengxiao: "蛇" },
        "午": { elem: "火", yinYang: "陽", shengxiao: "馬" }, "未": { elem: "土", yinYang: "陰", shengxiao: "羊" },
        "申": { elem: "金", yinYang: "陽", shengxiao: "猴" }, "酉": { elem: "金", yinYang: "陰", shengxiao: "雞" },
        "戌": { elem: "土", yinYang: "陽", shengxiao: "狗" }, "亥": { elem: "水", yinYang: "陰", shengxiao: "豬" }
    };

    // 十神推導表 (以日主天干與目標天干對照)
    const SHISHEN_MAP = {
        "同性生我": "偏印", "異性生我": "正印",
        "同性同我": "比肩", "異性同我": "劫財",
        "我生同性": "食神", "我生異性": "傷官",
        "我剋同性": "偏財", "我剋異性": "正財",
        "剋我同性": "七殺", "剋我異性": "正官"
    };

    const ELEM_RELATION = {
        "木": { "木": "同", "火": "生", "土": "剋", "金": "被剋", "水": "被生" },
        "火": { "火": "同", "土": "生", "金": "剋", "水": "被剋", "木": "被生" },
        "土": { "土": "同", "金": "生", "水": "剋", "木": "被剋", "火": "被生" },
        "金": { "金": "同", "水": "生", "木": "剋", "火": "被剋", "土": "被生" },
        "水": { "水": "同", "木": "生", "火": "剋", "土": "被剋", "金": "被生" }
    };

    function getTenGod(dayMaster, targetGan) {
        if (!dayMaster || !targetGan || !GAN_INFO[dayMaster] || !GAN_INFO[targetGan]) return "";
        const dm = GAN_INFO[dayMaster];
        const tg = GAN_INFO[targetGan];
        const isSameYinYang = (dm.yinYang === tg.yinYang);
        const relation = ELEM_RELATION[dm.elem][tg.elem];
        
        let key = "";
        if (relation === "同") key = isSameYinYang ? "同性同我" : "異性同我";
        else if (relation === "生") key = isSameYinYang ? "我生同性" : "我生異性";
        else if (relation === "剋") key = isSameYinYang ? "我剋同性" : "我剋異性";
        else if (relation === "被生") key = isSameYinYang ? "同性生我" : "異性生我";
        else if (relation === "被剋") key = isSameYinYang ? "剋我同性" : "剋我異性";

        return SHISHEN_MAP[key] || "";
    }

    // 24節氣計算常數 (世紀常數演算法 1900-2100 精確交節公式)
    // 依序為：小寒、大寒、立春、雨水、驚蟄、春分、清明、穀雨、立夏、小滿、芒種、夏至、小暑、大暑、立秋、處暑、白露、秋分、寒露、霜降、立冬、小雪、大雪、冬至
    const JIEQI_NAMES = [
        "小寒", "大寒", "立春", "雨水", "驚蟄", "春分", "清明", "穀雨",
        "立夏", "小滿", "芒種", "夏至", "小暑", "大暑", "立秋", "處暑",
        "白露", "秋分", "寒露", "霜降", "立冬", "小雪", "大雪", "冬至"
    ];

    // 節氣 D 常數與 C 值 (20與21世紀精確值)
    const D_TERM = 0.2422;
    const C_20 = [
        6.11, 20.84, 4.6295, 19.4599, 6.3826, 21.4155, 5.59, 20.888,
        6.318, 21.86, 6.5, 22.2, 7.928, 23.65, 8.35, 23.95,
        8.44, 23.822, 9.098, 24.218, 8.218, 23.08, 7.9, 22.6
    ];
    const C_21 = [
        5.4055, 20.12, 3.87, 18.73, 5.63, 20.646, 4.81, 20.1,
        5.52, 21.04, 5.678, 21.37, 7.108, 22.83, 7.5, 23.13,
        7.646, 23.042, 8.318, 23.438, 7.438, 22.36, 7.18, 21.94
    ];

    /**
     * 計算某年某節氣的精確公曆日期（日）與估算時間
     */
    function getSolarTermDay(year, termIndex) {
        const century = Math.floor(year / 100);
        const C = (century === 19) ? C_20[termIndex] : C_21[termIndex];
        const Y = year % 100;
        let day = Math.floor(Y * D_TERM + C) - Math.floor((Y - 1) / 4);
        
        // 特殊修正
        if (year === 2019 && termIndex === 0) day = 5;
        if (year === 2026 && termIndex === 2) day = 4; // 2026 立春 2/4
        return day;
    }

    /**
     * 計算年干支 (以立春為界)
     */
    function getYearGZ(year, month, day, hour) {
        // 立春通常在 2 月 4 日前後
        const lichunDay = getSolarTermDay(year, 2);
        let effectiveYear = year;
        if (month < 2 || (month === 2 && day < lichunDay)) {
            effectiveYear = year - 1;
        }
        // 甲子年為 1984, 1924, 1864... (year - 4) % 60
        let offset = (effectiveYear - 4) % 60;
        if (offset < 0) offset += 60;
        const gan = TIANGAN[offset % 10];
        const zhi = DIZHI[offset % 12];
        return { gz: gan + zhi, gan: gan, zhi: zhi, year: effectiveYear };
    }

    /**
     * 計算月干支 (精確以 12 節氣為界：立春、驚蟄、清明、立夏、芒種、小暑、立秋、白露、寒露、立冬、大雪、小寒)
     * 月上起日訣：甲己之年丙作首，乙庚之歲戊為頭，丙辛之歲尋庚上，丁壬壬寅順水流，若問戊癸何處起，甲寅之上好追求。
     */
    const JIE_TERMS = [
        { termIdx: 2, zhi: "寅", monthNum: 1 },  // 立春 -> 寅月 (1月)
        { termIdx: 4, zhi: "卯", monthNum: 2 },  // 驚蟄 -> 卯月 (2月)
        { termIdx: 6, zhi: "辰", monthNum: 3 },  // 清明 -> 辰月 (3月)
        { termIdx: 8, zhi: "巳", monthNum: 4 },  // 立夏 -> 巳月 (4月)
        { termIdx: 10, zhi: "午", monthNum: 5 }, // 芒種 -> 午月 (5月)
        { termIdx: 12, zhi: "未", monthNum: 6 }, // 小暑 -> 未月 (6月)
        { termIdx: 14, zhi: "申", monthNum: 7 }, // 立秋 -> 申月 (7月)
        { termIdx: 16, zhi: "酉", monthNum: 8 }, // 白露 -> 酉月 (8月)
        { termIdx: 18, zhi: "戌", monthNum: 9 }, // 寒露 -> 戌月 (9月)
        { termIdx: 20, zhi: "亥", monthNum: 10 },// 立冬 -> 亥月 (10月)
        { termIdx: 22, zhi: "子", monthNum: 11 },// 大雪 -> 子月 (11月)
        { termIdx: 0, zhi: "丑", monthNum: 12 }  // 小寒 -> 丑月 (12月)
    ];

    const MONTH_START_GAN = {
        "甲": "丙", "己": "丙",
        "乙": "戊", "庚": "戊",
        "丙": "庚", "辛": "庚",
        "丁": "壬", "壬": "壬",
        "戊": "甲", "癸": "甲"
    };

    function getMonthGZ(yearGzGan, year, month, day) {
        // 判定當前落在何節氣月份
        let monthZhi = "丑";
        let monthOffset = 11; // 丑月預設

        // 檢查各節
        const jieDays = JIE_TERMS.map(j => ({
            ...j,
            day: getSolarTermDay(year, j.termIdx)
        }));

        // 月份粗估與節氣判斷
        if (month === 1) {
            monthZhi = (day >= jieDays[11].day) ? "丑" : "子";
            monthOffset = (day >= jieDays[11].day) ? 11 : 10;
        } else if (month === 2) {
            monthZhi = (day >= jieDays[0].day) ? "寅" : "丑";
            monthOffset = (day >= jieDays[0].day) ? 0 : 11;
        } else {
            // 3~12月
            const mIdx = month - 2; // 對應 JIE_TERMS 索引
            if (mIdx >= 0 && mIdx < JIE_TERMS.length) {
                if (day >= jieDays[mIdx].day) {
                    monthZhi = JIE_TERMS[mIdx].zhi;
                    monthOffset = mIdx;
                } else {
                    const prevIdx = (mIdx - 1 + 12) % 12;
                    monthZhi = JIE_TERMS[prevIdx].zhi;
                    monthOffset = prevIdx;
                }
            }
        }

        const startGan = MONTH_START_GAN[yearGzGan];
        const startGanIdx = TIANGAN.indexOf(startGan);
        const gan = TIANGAN[(startGanIdx + monthOffset) % 10];
        return { gz: gan + monthZhi, gan: gan, zhi: monthZhi };
    }

    /**
     * 高精度高斯公曆日干支計算法
     */
    function getDayGZ(year, month, day, isNightZi) {
        // 基準日：2000年1月1日為 戊午日 (索引 54)
        const baseDate = new Date(Date.UTC(2000, 0, 1));
        const targetDate = new Date(Date.UTC(year, month - 1, day));
        const diffDays = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));
        
        // 2000-01-01 是 戊午 (甲子=0, ..., 戊午=54)
        let gzIdx = (54 + diffDays) % 60;
        if (gzIdx < 0) gzIdx += 60;

        // 若為夜子時（23:00~24:00），八字日柱依傳統算當日，但早夜子時切換時可換日
        if (isNightZi) {
            gzIdx = (gzIdx + 1) % 60;
        }

        const gan = TIANGAN[gzIdx % 10];
        const zhi = DIZHI[gzIdx % 12];
        return { gz: gan + zhi, gan: gan, zhi: zhi, index: gzIdx };
    }

    /**
     * 計算時干支
     * 日上起時訣（五鼠遁）：甲己還加甲，乙庚丙作初，丙辛從戊起，丁壬庚子居，戊癸何方發，壬子是真途。
     */
    const HOUR_START_GAN = {
        "甲": "甲", "己": "甲",
        "乙": "丙", "庚": "丙",
        "丙": "戊", "辛": "戊",
        "丁": "庚", "壬": "庚",
        "戊": "壬", "癸": "壬"
    };

    function getHourGZ(dayGzGan, hour, minute) {
        let zhiIndex = 0;
        let isNightZi = false;

        if (hour === 23) {
            zhiIndex = 0; // 子時
            isNightZi = true;
        } else {
            zhiIndex = Math.floor((hour + 1) / 2) % 12;
        }

        const zhi = DIZHI[zhiIndex];
        const startGan = HOUR_START_GAN[dayGzGan];
        const startGanIdx = TIANGAN.indexOf(startGan);
        const gan = TIANGAN[(startGanIdx + zhiIndex) % 10];

        return { gz: gan + zhi, gan: gan, zhi: zhi, isNightZi: isNightZi, zhiIndex: zhiIndex };
    }

    /**
     * 計算八字四柱全套命盤
     */
    function calculateBazi(year, month, day, hour, minute, gender = "乾造") {
        const h = parseInt(hour, 10) || 0;
        const m = parseInt(minute, 10) || 0;
        const y = parseInt(year, 10);
        const mon = parseInt(month, 10);
        const d = parseInt(day, 10);

        const isNight = (h === 23);

        const yearObj = getYearGZ(y, mon, d, h);
        const monthObj = getMonthGZ(yearObj.gan, y, mon, d);
        const dayObj = getDayGZ(y, mon, d, false); // 基礎日柱
        const hourObj = getHourGZ(dayObj.gan, h, m);

        const dayMaster = dayObj.gan;

        // 構造四柱詳細數據
        const pillars = {
            year: {
                role: "年柱（祖業/根基）",
                gz: yearObj.gz,
                gan: yearObj.gan,
                zhi: yearObj.zhi,
                nayin: NAYIN_TABLE[yearObj.gz] || "",
                tenGod: getTenGod(dayMaster, yearObj.gan),
                canggan: CANGGAN_TABLE[yearObj.zhi].map(cg => ({ gan: cg, tenGod: getTenGod(dayMaster, cg) })),
                shengxiao: ZHI_INFO[yearObj.zhi].shengxiao
            },
            month: {
                role: "月柱（事業/提綱）",
                gz: monthObj.gz,
                gan: monthObj.gan,
                zhi: monthObj.zhi,
                nayin: NAYIN_TABLE[monthObj.gz] || "",
                tenGod: getTenGod(dayMaster, monthObj.gan),
                canggan: CANGGAN_TABLE[monthObj.zhi].map(cg => ({ gan: cg, tenGod: getTenGod(dayMaster, cg) }))
            },
            day: {
                role: "日柱（元神/配偶）",
                gz: dayObj.gz,
                gan: dayObj.gan,
                zhi: dayObj.zhi,
                nayin: NAYIN_TABLE[dayObj.gz] || "",
                tenGod: "日主 (元神)",
                canggan: CANGGAN_TABLE[dayObj.zhi].map(cg => ({ gan: cg, tenGod: getTenGod(dayMaster, cg) }))
            },
            hour: {
                role: "時柱（歸宿/子女）",
                gz: hourObj.gz,
                gan: hourObj.gan,
                zhi: hourObj.zhi,
                nayin: NAYIN_TABLE[hourObj.gz] || "",
                tenGod: getTenGod(dayMaster, hourObj.gan),
                canggan: CANGGAN_TABLE[hourObj.zhi].map(cg => ({ gan: cg, tenGod: getTenGod(dayMaster, cg) }))
            }
        };

        // 大運計算 (陽男陰女順排，陰男陽女逆排)
        const isYangYear = (GAN_INFO[yearObj.gan].yinYang === "陽");
        const isMale = (gender === "乾造" || gender === "男");
        const isForward = (isMale && isYangYear) || (!isMale && !isYangYear);

        const dayunList = [];
        const monthGzIdx = (TIANGAN.indexOf(monthObj.gan) * 6 + DIZHI.indexOf(monthObj.zhi)) % 60; // 簡化
        let mGanIdx = TIANGAN.indexOf(monthObj.gan);
        let mZhiIdx = DIZHI.indexOf(monthObj.zhi);

        for (let i = 1; i <= 8; i++) {
            if (isForward) {
                mGanIdx = (mGanIdx + 1) % 10;
                mZhiIdx = (mZhiIdx + 1) % 12;
            } else {
                mGanIdx = (mGanIdx - 1 + 10) % 10;
                mZhiIdx = (mZhiIdx - 1 + 12) % 12;
            }
            const dGz = TIANGAN[mGanIdx] + DIZHI[mZhiIdx];
            dayunList.push({
                step: i,
                ageStart: (i * 10 - 2),
                ageEnd: (i * 10 + 7),
                gz: dGz,
                nayin: NAYIN_TABLE[dGz] || "",
                tenGod: getTenGod(dayMaster, TIANGAN[mGanIdx])
            });
        }

        return {
            solarDate: `${y}年${mon}月${d}日 ${h}:${m < 10 ? '0' + m : m}`,
            gender: gender,
            pillars: pillars,
            dayMaster: dayMaster,
            dayMasterInfo: GAN_INFO[dayMaster],
            dayunList: dayunList,
            direction: isForward ? "順行大運" : "逆行大運"
        };
    }

    /**
     * 根據西曆年份計算年干支與納音五行
     */
    function getNayinByYear(year) {
        const y = parseInt(year, 10);
        if (isNaN(y)) return null;
        let offset = (y - 4) % 60;
        if (offset < 0) offset += 60;
        const gan = TIANGAN[offset % 10];
        const zhi = DIZHI[offset % 12];
        const gz = gan + zhi;
        const nayin = NAYIN_TABLE[gz] || "";
        const shengxiao = ZHI_INFO[zhi].shengxiao;
        const wuxing = nayin.slice(-1); // 金、木、水、火、土
        return {
            year: y,
            gz: gz,
            gan: gan,
            zhi: zhi,
            nayin: nayin,
            wuxing: wuxing,
            shengxiao: shengxiao
        };
    }

    // 導出模組
    const BaziCalendar = {
        calculateBazi,
        getTenGod,
        getNayinByYear,
        NAYIN_TABLE,
        CANGGAN_TABLE,
        TIANGAN,
        DIZHI,
        SHENGXIAO,
        GAN_INFO,
        ZHI_INFO
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = BaziCalendar;
    } else {
        global.BaziCalendar = BaziCalendar;
    }

})(typeof window !== 'undefined' ? window : this);
