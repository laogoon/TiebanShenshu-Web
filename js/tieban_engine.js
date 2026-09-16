/**
 * 鐵板神數 & 邵子神數 數理起例與 96 刻起卦核心引擎
 * 支援太玄配數、先天八卦數、後天洛書數、四柱六親起卦、96 刻八刻數列
 */
(function(global) {
    'use strict';

    // 太玄配數訣：甲己子午九，乙庚丑未八，丙辛寅申七，丁壬卯酉六，戊癸辰戌五，巳亥四數尋。
    const TAIXUAN_GAN = { "甲": 9, "己": 9, "乙": 8, "庚": 8, "丙": 7, "辛": 7, "丁": 6, "壬": 6, "戊": 5, "癸": 5 };
    const TAIXUAN_ZHI = { "子": 9, "午": 9, "丑": 8, "未": 8, "寅": 7, "申": 7, "卯": 6, "酉": 6, "辰": 5, "戌": 5, "巳": 4, "亥": 4 };

    // 先天八卦數（邵雍伏羲先天數）：乾1 兌2 離3 震4 巽5 坎6 艮7 坤8
    const XIANTIAN_GUA_NUM = { "乾": 1, "兌": 2, "離": 3, "震": 4, "巽": 5, "坎": 6, "艮": 7, "坤": 8 };
    const NUM_TO_XIANTIAN_GUA = { 1: "乾", 2: "兌", 3: "離", 4: "震", 5: "巽", 6: "坎", 7: "艮", 8: "坤" };

    // 後天八卦數（洛書數）：坎1 坤2 震3 巽4 中5 乾6 兌7 艮8 離9
    const HOUTIAN_GUA_NUM = { "坎": 1, "坤": 2, "震": 3, "巽": 4, "乾": 6, "兌": 7, "艮": 8, "離": 9 };

    // 八卦符號與陰陽象
    const GUA_SYMBOLS = {
        "乾": { symbol: "☰", nature: "天", elem: "金" },
        "兌": { symbol: "☱", nature: "澤", elem: "金" },
        "離": { symbol: "☲", nature: "火", elem: "火" },
        "震": { symbol: "☳", nature: "雷", elem: "木" },
        "巽": { symbol: "☴", nature: "風", elem: "木" },
        "坎": { symbol: "☵", nature: "水", elem: "水" },
        "艮": { symbol: "☶", nature: "山", elem: "土" },
        "坤": { symbol: "☷", nature: "地", elem: "土" }
    };

    // 天干配卦訣：壬甲從乾數，乙癸向坤求，庚來震上立，辛在巽方遊，丙歸艮位止，己入離門頭，戊投坎宮去，丁向兌家流。
    const GAN_TO_GUA = {
        "甲": "乾", "壬": "乾",
        "乙": "坤", "癸": "坤",
        "庚": "震",
        "辛": "巽",
        "丙": "艮",
        "己": "離",
        "戊": "坎",
        "丁": "兌"
    };

    // 地支配卦訣：亥子坎宮寅卯震，巳午離宮申酉兌，辰戌丑未居中寄（辰戌艮、丑未坤）。
    const ZHI_TO_GUA = {
        "子": "坎", "亥": "坎",
        "寅": "震", "卯": "震",
        "巳": "離", "午": "離",
        "申": "兌", "酉": "兌",
        "辰": "艮", "戌": "艮",
        "丑": "坤", "未": "坤"
    };

    // 六十四卦卦名表 (上卦 + 下卦)
    const HEXAGRAMS = {
        "乾乾": "乾為天", "乾兌": "天澤履", "乾離": "天火同人", "乾震": "天雷無妄", "乾巽": "天風姤", "乾坎": "天水訟", "乾艮": "天山遁", "乾坤": "天地否",
        "兌乾": "澤天夬", "兌兌": "兌為澤", "兌離": "澤火革", "兌震": "澤雷隨", "兌巽": "澤風大過", "兌坎": "澤水困", "兌艮": "澤山咸", "兌坤": "澤地萃",
        "離乾": "火天大有", "離兌": "火澤睽", "離離": "離為火", "離震": "火雷噬嗑", "離巽": "火風鼎", "離坎": "火水未濟", "離艮": "火山旅", "離坤": "火地晉",
        "震乾": "雷天大壯", "震兌": "雷澤歸妹", "震離": "雷火豐", "震震": "震為雷", "震巽": "雷風恆", "震坎": "雷水解", "震艮": "雷山小過", "震坤": "雷地豫",
        "巽乾": "風天小畜", "巽兌": "風澤中孚", "巽離": "風火家人", "巽震": "風雷益", "巽巽": "巽為風", "巽坎": "風水渙", "巽艮": "風山漸", "巽坤": "風地觀",
        "坎乾": "水天需", "坎兌": "水澤節", "坎離": "水火既濟", "坎震": "水雷屯", "坎巽": "水風井", "坎坎": "坎為水", "坎艮": "水山蹇", "坎坤": "水地比",
        "艮乾": "山天大畜", "艮兌": "山澤損", "艮離": "山火賁", "艮震": "山雷頤", "艮巽": "山風蠱", "艮坎": "山水蒙", "艮艮": "艮為山", "艮坤": "山地剝",
        "坤乾": "地天泰", "坤兌": "地澤臨", "坤離": "地火明夷", "坤震": "地雷復", "坤巽": "地風升", "坤坎": "地水師", "坤艮": "地山謙", "坤坤": "坤為地"
    };

    /**
     * 96 刻計算 (12時辰 * 8刻，每刻 15 分鐘)
     */
    function getBaKe(hour, minute) {
        const h = parseInt(hour, 10);
        const m = parseInt(minute, 10);
        
        // 計算當日總分鐘 (以 23:00 為一日之始的早夜子時考量)
        // 23:00~23:59 -> 子時前 4 刻 (第 1~4 刻)
        // 00:00~00:59 -> 子時後 4 刻 (第 5~8 刻)
        let totalMinutes = (h * 60 + m + 60) % 1440; // 00:00 對應第 5 刻 (60分處)
        
        const keInDay = Math.floor(totalMinutes / 15) + 1; // 1~96
        const shichenIdx = Math.floor(totalMinutes / 120); // 0~11 (0為子時)
        const keInShichen = Math.floor((totalMinutes % 120) / 15) + 1; // 1~8 刻

        const shichenNames = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
        const shichenName = shichenNames[shichenIdx];

        const startMin = (keInShichen - 1) * 15;
        const endMin = keInShichen * 15;

        return {
            keInDay: keInDay,
            shichenName: shichenName,
            keInShichen: keInShichen,
            minutes: `${startMin}分 ~ ${endMin}分`
        };
    }

    /**
     * 計算時辰八刻數列 (時干支與刻數起例)
     */
    function getBaKeArray(hourGan, hourZhi) {
        const baseTaixuan = (TAIXUAN_GAN[hourGan] || 0) + (TAIXUAN_ZHI[hourZhi] || 0);
        const list = [];
        for (let k = 1; k <= 8; k++) {
            // 八刻基數衍生公式
            const code = (baseTaixuan * 100 + k * 12 + 1000) % 12000 + 1000;
            const startMin = (k - 1) * 15;
            const endMin = k * 15;
            list.push({
                ke: k,
                code: code,
                minutes: `${startMin} - ${endMin}分`
            });
        }
        return list;
    }

    /**
     * 四柱六親起卦
     */
    function getLiuQinGua(yearGz, monthGz, dayGz, hourGz, schoolMode = "xiantian") {
        function buildSingleGua(role, gz) {
            const stem = gz[0];
            const branch = gz[1];

            const stemGua = GAN_TO_GUA[stem] || "乾";
            const branchGua = ZHI_TO_GUA[branch] || "坤";
            const hexName = HEXAGRAMS[stemGua + branchGua] || (stemGua + branchGua);

            const sGuaNum = (schoolMode === "houtian") ? HOUTIAN_GUA_NUM[stemGua] : XIANTIAN_GUA_NUM[stemGua];
            const bGuaNum = (schoolMode === "houtian") ? HOUTIAN_GUA_NUM[branchGua] : XIANTIAN_GUA_NUM[branchGua];

            const txS = TAIXUAN_GAN[stem] || 0;
            const txB = TAIXUAN_ZHI[branch] || 0;

            return {
                role: role,
                gz: gz,
                stem: stem,
                branch: branch,
                stemGua: stemGua,
                branchGua: branchGua,
                stemGuaSymbol: GUA_SYMBOLS[stemGua].symbol,
                branchGuaSymbol: GUA_SYMBOLS[branchGua].symbol,
                stemGuaAttr: GUA_SYMBOLS[stemGua],
                branchGuaAttr: GUA_SYMBOLS[branchGua],
                hexagram: hexName,
                stemGuaNum: sGuaNum,
                branchGuaNum: bGuaNum,
                taixuanS: txS,
                taixuanB: txB,
                bakeCode: txS * 1000 + txB * 100 + sGuaNum * 10 + bGuaNum
            };
        }

        return {
            parent: buildSingleGua("父母宮 (考父母)", yearGz),
            sibling: buildSingleGua("兄弟宮 (考兄弟)", monthGz),
            spouse: buildSingleGua("夫妻宮 (考配偶)", dayGz),
            children: buildSingleGua("子女宮 (考子息)", hourGz)
        };
    }

    /**
     * 綜合神數碼計算
     */
    function getShenshuCode(yearGz, monthGz, dayGz, hourGz, schoolMode = "xiantian") {
        const txTotal = (TAIXUAN_GAN[yearGz[0]] || 0) + (TAIXUAN_ZHI[yearGz[1]] || 0) +
                        (TAIXUAN_GAN[monthGz[0]] || 0) + (TAIXUAN_ZHI[monthGz[1]] || 0) +
                        (TAIXUAN_GAN[dayGz[0]] || 0) + (TAIXUAN_ZHI[dayGz[1]] || 0) +
                        (TAIXUAN_GAN[hourGz[0]] || 0) + (TAIXUAN_ZHI[hourGz[1]] || 0);

        const lq = getLiuQinGua(yearGz, monthGz, dayGz, hourGz, schoolMode);
        const guaSeq = `${lq.parent.stemGuaNum}${lq.sibling.stemGuaNum}${lq.spouse.stemGuaNum}${lq.children.stemGuaNum}`;

        const schoolLabel = (schoolMode === "houtian") ? "後天洛書八卦數（南派）" : "伏羲先天八卦數（邵雍北派）";

        // 主元堂神數條號推演 (公式模型)
        const primaryCode = (txTotal * 123 + parseInt(guaSeq, 10)) % 12000 + 1001;

        return {
            full: `太玄總數 ${txTotal} ‧ 卦序碼 ${guaSeq} ‧ 主元堂數 【${primaryCode}】`,
            taixuan: txTotal,
            guaSequence: guaSeq,
            primaryCode: primaryCode,
            schoolMode: schoolMode,
            schoolLabel: schoolLabel
        };
    }

    /**
     * 【正統正向八刻起例考親】
     * 根據四柱干支、太玄數、六親卦序與八刻加則，正向客觀推導時辰 8 刻專屬條號，
     * 並調取原典真實讖語供問命者比對核實。
     */
    function getShichenKaoQinVerses(hourZhi, hourGan, fullRecords = [], fInfo = null, mInfo = null, shaoziRecords = [], bazi = null, schoolMode = "xiantian") {
        const results = [];
        const shengxiaoList = ["鼠", "牛", "虎", "兔", "龍", "蛇", "馬", "羊", "猴", "雞", "狗", "豬"];
        const wuxingList = ["金", "木", "水", "火", "土"];
        const zhiIdx = Math.max(0, ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"].indexOf(hourZhi));

        // 1. 若有四柱八字，計算正統太玄數與六親卦數
        let txTotal = 60;
        let pGuaNum = 1;
        let hGuaNum = 1;
        if (bazi && bazi.pillars) {
            const p = bazi.pillars;
            txTotal = (TAIXUAN_GAN[p.year.gan] || 0) + (TAIXUAN_ZHI[p.year.zhi] || 0) +
                      (TAIXUAN_GAN[p.month.gan] || 0) + (TAIXUAN_ZHI[p.month.zhi] || 0) +
                      (TAIXUAN_GAN[p.day.gan] || 0) + (TAIXUAN_ZHI[p.day.zhi] || 0) +
                      (TAIXUAN_GAN[p.hour.gan] || 0) + (TAIXUAN_ZHI[p.hour.zhi] || 0);
            const lq = getLiuQinGua(p.year.gz, p.month.gz, p.day.gz, p.hour.gz, schoolMode);
            pGuaNum = lq.parent.stemGuaNum * 10 + lq.parent.branchGuaNum;
            hGuaNum = lq.children.stemGuaNum * 10 + lq.children.branchGuaNum;
        }

        // 短句語義分析輔助
        function parseClauseParentZodiac(text) {
            if (!text) return { fSx: null, mSx: null };
            const clauses = text.split(/[,，.。\s\n]+/);
            let fSx = null;
            let mSx = null;

            for (const c of clauses) {
                if (/父|嚴君|嚴父|椿|生父|父命|翁/.test(c)) {
                    for (const sx of shengxiaoList) {
                        if (c.includes(sx)) { fSx = sx; break; }
                    }
                }
                if (/母|慈母|萱|生母|母親|娘|慈親/.test(c)) {
                    for (const sx of shengxiaoList) {
                        if (c.includes(sx)) { mSx = sx; break; }
                    }
                }
            }
            if (!fSx || !mSx) {
                const mf = text.match(/父[^\w\s，。]*?([鼠牛虎兔龍蛇馬羊猴雞狗豬])/);
                if (mf) fSx = mf[1];
                const mm = text.match(/母[^\w\s，。]*?([鼠牛虎兔龍蛇馬羊猴雞狗豬])/);
                if (mm) mSx = mm[1];
            }
            return { fSx, mSx };
        }

        // 2. 正向推導 8 個刻度的客觀條號
        // 公式：基於時辰太玄數、父母卦數、時柱卦數與八刻遞增數
        for (let k = 1; k <= 8; k++) {
            // 正統八刻數理公式模型 (範圍 1001 ~ 13000)
            const forwardCode = ((txTotal * 113 + pGuaNum * 37 + hGuaNum * 19 + k * 289 + zhiIdx * 83) % 12000) + 1001;

            // 從 12,000 條鐵板庫中精確調取該條號
            let matchedRecord = fullRecords ? fullRecords.find(r => r.id === forwardCode) : null;
            let actualText = matchedRecord ? matchedRecord.t : `皇極神數正向起數第 ${forwardCode} 條 (時辰第 ${k} 刻真數)`;

            // 分析該客觀條文中的考親線索
            const parsed = parseClauseParentZodiac(actualText);
            let summaryDesc = `第 ${k} 刻數理推演條號 【#${forwardCode}】`;
            let isExactMatch = false;

            if (parsed.fSx || parsed.mSx) {
                summaryDesc = `考親暗示：${parsed.fSx ? `嚴父屬${parsed.fSx}` : '父位定數'} ‧ ${parsed.mSx ? `慈母屬${parsed.mSx}` : '母位定數'}`;
            } else if (actualText.includes('雙親') || actualText.includes('父母')) {
                summaryDesc = `考親暗示：雙親存歿長幼緣份`;
            }

            // 若使用者提供了父母生年，純粹做對照標記（不篡改條文）
            if (fInfo && mInfo) {
                if (parsed.fSx === fInfo.shengxiao && parsed.mSx === mInfo.shengxiao) {
                    isExactMatch = true;
                } else if (parsed.fSx === fInfo.shengxiao || parsed.mSx === mInfo.shengxiao) {
                    isExactMatch = true;
                }
            }

            results.push({
                ke: k,
                code: forwardCode,
                text: actualText,
                fatherSx: parsed.fSx || '',
                motherSx: parsed.mSx || '',
                isExactMatch: isExactMatch,
                summary: summaryDesc
            });
        }
        return results;
    }

    /**
     * 【正統定刻滾盤命書生成器】
     * 依據問命者鎖定的客觀考刻條號作為「定刻種子數（Locked Seed）」，
     * 結合四柱六親卦象與大運加則，正向滾盤推算出人生十二宮與流年卷軸。
     */
    function calculateFullLifeBook(bazi, selectedKe, schoolMode = "xiantian", fullRecords = []) {
        const p = bazi.pillars;
        const sCode = getShenshuCode(p.year.gz, p.month.gz, p.day.gz, p.hour.gz, schoolMode);
        const lq = getLiuQinGua(p.year.gz, p.month.gz, p.day.gz, p.hour.gz, schoolMode);

        // 1. 取得該刻的正統考親條號作為「定刻樞紐種子」
        const kaoqinList = getShichenKaoQinVerses(p.hour.zhi, p.hour.gan, fullRecords, null, null, null, bazi, schoolMode);
        const targetKeItem = kaoqinList.find(item => item.ke === selectedKe) || kaoqinList[0];
        const lockedSeed = targetKeItem.code;

        function findRecord(code) {
            const actualCode = ((code - 1001) % 12000 + 12000) % 12000 + 1001;
            const rec = fullRecords.find(r => r.id === actualCode);
            return {
                id: actualCode,
                text: rec ? rec.t : `皇極神數條文第 ${actualCode} 條 (數理真傳)`,
                tags: rec ? (rec.g || rec.tags || []) : []
            };
        }

        // 2. 以定刻條號為基數，依八卦加則滾盤推算六親各宮
        // 父母宮：鎖定之定刻條號
        const parentCode = lockedSeed;

        // 兄弟宮：基數 + 月柱兄弟卦滾則
        const siblingCode = lockedSeed + lq.sibling.stemGuaNum * 64 + lq.sibling.branchGuaNum * 8 + 120;

        // 夫妻宮：基數 + 日柱夫妻卦滾則
        const spouseCode = lockedSeed + lq.spouse.stemGuaNum * 64 + lq.spouse.branchGuaNum * 8 + 240;

        // 子息宮：基數 + 時柱子息卦滾則
        const childrenCode = lockedSeed + lq.children.stemGuaNum * 64 + lq.children.branchGuaNum * 8 + 360;

        // 官祿宮：基數 + 太玄總數滾則
        const careerCode = lockedSeed + sCode.taixuan * 73 + 480;

        // 財帛宮：基數 + 太玄總數滾則
        const wealthCode = lockedSeed + sCode.taixuan * 51 + 600;

        // 壽元宮：基數 + 乾坤歸宿滾則
        const longevityCode = lockedSeed + 999;

        // 3. 大運流年歲數條文卷軸 (推算人生各階段條文：16, 18, 22, 25, 28, 32, 36, 40, 45, 50, 56, 62, 70歲)
        const liunianAges = [16, 18, 22, 25, 28, 32, 36, 40, 45, 50, 56, 62, 70];
        const liunianVerses = liunianAges.map((age, idx) => {
            const code = lockedSeed + age * 83 + idx * 47 + 720;
            const pick = findRecord(code);
            return {
                age: age,
                id: pick.id,
                text: pick.text,
                stage: `${age} 歲大運流年`
            };
        });

        return {
            selectedKe: selectedKe,
            lockedSeed: lockedSeed,
            sections: [
                { category: "① 父母宮 ‧ 考定刻分", id: findRecord(parentCode).id, ...findRecord(parentCode), desc: "考時定刻之樞紐讖語，定雙親生年與存歿緣份" },
                { category: "② 兄弟宮 ‧ 棠棣手足", id: findRecord(siblingCode).id, ...findRecord(siblingCode), desc: "以定刻基數滾月柱兄弟卦，推同胞手足排行與聚散" },
                { category: "③ 夫妻宮 ‧ 琴瑟姻緣", id: findRecord(spouseCode).id, ...findRecord(spouseCode), desc: "以定刻基數滾日柱夫妻卦，推配偶屬相與姻緣吉凶" },
                { category: "④ 子息宮 ‧ 兒郎丹桂", id: findRecord(childrenCode).id, ...findRecord(childrenCode), desc: "以定刻基數滾時柱子息卦，推命中兒郎個數與晚年依靠" },
                { category: "⑤ 官祿宮 ‧ 功名科甲", id: findRecord(careerCode).id, ...findRecord(careerCode), desc: "以定刻基數滾太玄數理，推學業及第與仕途事業機遇" },
                { category: "⑥ 財帛宮 ‧ 田產豐歉", id: findRecord(wealthCode).id, ...findRecord(wealthCode), desc: "以定刻基數滾財帛數理，推一生正偏財運與聚散" },
                { category: "⑦ 壽元宮 ‧ 塵緣歸宿", id: findRecord(longevityCode).id, ...findRecord(longevityCode), desc: "以定刻基數推乾坤終元數，推天賦壽數與晚景" }
            ],
            liunianList: liunianVerses
        };
    }

    // 八卦爻位結構 (底爻至頂爻: 1=陽, 0=陰)
    const TRIGRAM_LINES = {
        "乾": [1, 1, 1], "兌": [1, 1, 0], "離": [1, 0, 1], "震": [1, 0, 0],
        "巽": [0, 1, 1], "坎": [0, 1, 0], "艮": [0, 0, 1], "坤": [0, 0, 0]
    };
    const LINES_TO_TRIGRAM = {
        "1,1,1": "乾", "1,1,0": "兌", "1,0,1": "離", "1,0,0": "震",
        "0,1,1": "巽", "0,1,0": "坎", "0,0,1": "艮", "0,0,0": "坤"
    };

    // 三組洛書數序映射表 (鐵版神數秘傳)
    const BAGUA_ARRAY_NUM = { "乾": 1, "兌": 2, "離": 3, "震": 4, "巽": 5, "坎": 6, "艮": 7, "坤": 8 };
    const XIANTIAN_LUOSHU_NUM = { "乾": 9, "兌": 4, "離": 3, "震": 8, "巽": 2, "坎": 7, "艮": 6, "坤": 1 };
    const HOUTIAN_LUOSHU_NUM = { "坎": 1, "坤": 2, "震": 3, "巽": 4, "中": 5, "乾": 6, "兌": 7, "艮": 8, "離": 9 };

    /**
     * 【步驟一：求天數】以生辰八字求先天命卦與三元甲子天數
     */
    function calculateTianShu(bazi, schoolMode = "xiantian") {
        const p = bazi.pillars;
        const yearNum = p.year.gan;
        const yearZhi = p.year.zhi;
        const birthYear = parseInt(bazi.solarDate, 10) || 1990;

        // 判定三元甲子：1864~1923 上元，1924~1983 中元，1984~2043 下元
        let yuanType = "下元甲子";
        if (birthYear >= 1864 && birthYear <= 1923) yuanType = "上元甲子";
        else if (birthYear >= 1924 && birthYear <= 1983) yuanType = "中元甲子";
        else if (birthYear >= 1984 && birthYear <= 2043) yuanType = "下元甲子";

        const ganTx = TAIXUAN_GAN[yearNum] || 8;
        const zhiTx = TAIXUAN_ZHI[yearZhi] || 8;
        const isMale = (bazi.gender === "乾造" || bazi.gender === "男");
        const isYang = (p.year.gan === "甲" || p.year.gan === "丙" || p.year.gan === "戊" || p.year.gan === "庚" || p.year.gan === "壬");

        let yearTianFactor = 0;
        if (yuanType === "上元甲子") {
            yearTianFactor = ganTx * 10 + zhiTx * 1;
        } else if (yuanType === "下元甲子") {
            yearTianFactor = zhiTx * 10 + ganTx * 1;
        } else { // 中元甲子
            if ((isMale && isYang) || (!isMale && !isYang)) {
                yearTianFactor = ganTx * 100 + zhiTx * 10;
            } else {
                yearTianFactor = zhiTx * 100 + ganTx * 10;
            }
        }

        // 起元堂基本卦 (納甲元堂)
        const upperGua = GAN_TO_GUA[p.day.gan] || GAN_TO_GUA[p.year.gan] || "乾";
        const lowerGua = ZHI_TO_GUA[p.day.zhi] || ZHI_TO_GUA[p.year.zhi] || "坤";
        const baseHexName = HEXAGRAMS[upperGua + lowerGua] || (upperGua + lowerGua);

        // 基本數序 (太玄配數 * 500 + 4410)
        const baseSeq = ((TAIXUAN_GAN[p.year.gan] || 0) + (TAIXUAN_ZHI[p.year.zhi] || 0)) * 500 + 4410;
        const totalTianShu = baseSeq + yearTianFactor;

        return {
            yuanType: yuanType,
            yearTianFactor: yearTianFactor,
            upperGua: upperGua,
            lowerGua: lowerGua,
            baseHexName: baseHexName,
            baseSeq: baseSeq,
            totalTianShu: totalTianShu
        };
    }

    /**
     * 【步驟二：求人數】以求占現時（演算年月日時）求占時機遇密碼
     */
    function calculateRenShu(nowYear, nowMonth, nowDay, nowHour, nowMinute) {
        const ny = parseInt(nowYear, 10);
        const nm = parseInt(nowMonth, 10);
        const nd = parseInt(nowDay, 10);
        const nh = parseInt(nowHour, 10);
        const nmin = parseInt(nowMinute, 10);

        const nowBazi = BaziCalendar.calculateBazi(ny, nm, nd, nh, nmin, "乾造");
        const np = nowBazi.pillars;

        const hGanTx = TAIXUAN_GAN[np.hour.gan] || 7;
        const hZhiTx = TAIXUAN_ZHI[np.hour.zhi] || 8;
        const renFactor = (hGanTx + hZhiTx) * 11 + (nh * 60 + nmin) % 96;

        return {
            nowDateStr: `${ny}年${nm}月${nd}日 ${nh}:${nmin < 10 ? '0' + nmin : nmin}`,
            nowPillars: np,
            renFactor: renFactor,
            hourGz: np.hour.gz,
            hourGanTx: hGanTx,
            hourZhiTx: hZhiTx
        };
    }

    /**
     * 【步驟三四五：正統八卦滾法 48 條神數大典生成】
     */
    function calculateBaGuaGun48(bazi, renShuData, fullRecords = [], schoolMode = "xiantian") {
        const tian = calculateTianShu(bazi, schoolMode);
        const ren = renShuData || calculateRenShu(2026, 9, 16, 14, 0);

        // 基本卦 6 爻線
        const g0Lines = TRIGRAM_LINES[tian.lowerGua].concat(TRIGRAM_LINES[tian.upperGua]);

        function linesToGua(lines) {
            const lowKey = lines.slice(0, 3).join(',');
            const upKey = lines.slice(3, 6).join(',');
            return {
                upper: LINES_TO_TRIGRAM[upKey] || "乾",
                lower: LINES_TO_TRIGRAM[lowKey] || "坤"
            };
        }

        // 第 1 卦 G1: G0 的 2~4 爻為下卦，3~5 爻為上卦 (互體卦)
        const g1Lines = [g0Lines[1], g0Lines[2], g0Lines[3], g0Lines[2], g0Lines[3], g0Lines[4]];
        const g1 = linesToGua(g1Lines);

        // 第 2 卦 G2: (天數 + 人數) % 9 動爻變卦
        const changeRem = ((tian.totalTianShu + ren.renFactor) % 9) || 9;
        const g2Lines = [...g1Lines];
        if (changeRem === 1) g2Lines[0] = 1 - g2Lines[0];
        else if (changeRem === 2) g2Lines[1] = 1 - g2Lines[1];
        else if (changeRem === 3) g2Lines[2] = 1 - g2Lines[2];
        else if (changeRem === 4) g2Lines[3] = 1 - g2Lines[3];
        else if (changeRem === 5) g2Lines[4] = 1 - g2Lines[4];
        else if (changeRem === 6) g2Lines[5] = 1 - g2Lines[5];
        else if (changeRem === 7) { g2Lines[0] = 1 - g2Lines[0]; g2Lines[3] = 1 - g2Lines[3]; }
        else if (changeRem === 8) { g2Lines[1] = 1 - g2Lines[1]; g2Lines[4] = 1 - g2Lines[4]; }
        else if (changeRem === 9) { g2Lines[2] = 1 - g2Lines[2]; g2Lines[5] = 1 - g2Lines[5]; }
        const g2 = linesToGua(g2Lines);

        // 第 3 卦 G3: G1 之互卦
        const g3Lines = [g1Lines[1], g1Lines[2], g1Lines[3], g1Lines[2], g1Lines[3], g1Lines[4]];
        const g3 = linesToGua(g3Lines);

        // 第 4 卦 G4: G2 之互卦
        const g4Lines = [g2Lines[1], g2Lines[2], g2Lines[3], g2Lines[2], g2Lines[3], g2Lines[4]];
        const g4 = linesToGua(g4Lines);

        // 第 5~8 卦: G1~G4 各變第 4 爻後，上下卦對調
        function makeG5toG8(srcLines) {
            const mLines = [...srcLines];
            mLines[3] = 1 - mLines[3];
            const g = linesToGua(mLines);
            return { upper: g.lower, lower: g.upper }; // 對調
        }

        const g5 = makeG5toG8(g1Lines);
        const g6 = makeG5toG8(g2Lines);
        const g7 = makeG5toG8(g3Lines);
        const g8 = makeG5toG8(g4Lines);

        const eightHexagrams = [
            { id: 1, title: "第 1 卦 (元堂互體卦)", upper: g1.upper, lower: g1.lower },
            { id: 2, title: "第 2 卦 (天人交參變卦)", upper: g2.upper, lower: g2.lower },
            { id: 3, title: "第 3 卦 (初卦正互卦)", upper: g3.upper, lower: g3.lower },
            { id: 4, title: "第 4 卦 (變卦正互卦)", upper: g4.upper, lower: g4.lower },
            { id: 5, title: "第 5 卦 (初卦反對爻調卦)", upper: g5.upper, lower: g5.lower },
            { id: 6, title: "第 6 卦 (變卦反對爻調卦)", upper: g6.upper, lower: g6.lower },
            { id: 7, title: "第 7 卦 (三卦反對爻調卦)", upper: g7.upper, lower: g7.lower },
            { id: 8, title: "第 8 卦 (四卦反對爻調卦)", upper: g8.upper, lower: g8.lower }
        ];

        function findRec(code) {
            const actualId = ((code - 1001) % 12000 + 12000) % 12000 + 1001;
            const rec = fullRecords.find(r => r.id === actualId);
            return {
                id: actualId,
                text: rec ? rec.t : `皇極神數條文第 ${actualId} 條 (八卦滾正數)`,
                tags: rec ? (rec.g || rec.tags || []) : []
            };
        }

        const baguaGunSections = [];
        eightHexagrams.forEach(hg => {
            const u = hg.upper;
            const l = hg.lower;
            const hexName = HEXAGRAMS[u + l] || (u + l);

            const s1 = BAGUA_ARRAY_NUM[u] * 10 + BAGUA_ARRAY_NUM[l];
            const s2 = XIANTIAN_LUOSHU_NUM[u] * 10 + XIANTIAN_LUOSHU_NUM[l];
            const s3 = HOUTIAN_LUOSHU_NUM[u] * 10 + HOUTIAN_LUOSHU_NUM[l];

            const formulaCodes = [
                { formula: "S1×100 + S2", code: s1 * 100 + s2 },
                { formula: "S1×100 + S3", code: s1 * 100 + s3 },
                { formula: "S2×100 + S1", code: s2 * 100 + s1 },
                { formula: "S2×100 + S3", code: s2 * 100 + s3 },
                { formula: "S3×100 + S1", code: s3 * 100 + s1 },
                { formula: "S3×100 + S2", code: s3 * 100 + s2 }
            ];

            const verseItems = formulaCodes.map(fc => {
                const r = findRec(fc.code);
                return {
                    formula: fc.formula,
                    rawCode: fc.code,
                    id: r.id,
                    text: r.text,
                    tags: r.tags
                };
            });

            baguaGunSections.push({
                guaId: hg.id,
                title: hg.title,
                hexName: hexName,
                upper: u,
                lower: l,
                s1: s1,
                s2: s2,
                s3: s3,
                verses: verseItems
            });
        });

        return {
            tian: tian,
            ren: ren,
            eightHexagrams: baguaGunSections
        };
    }

    // 導出模組
    const TiebanEngine = {
        getBaKe,
        getBaKeArray,
        getLiuQinGua,
        getShenshuCode,
        getShichenKaoQinVerses,
        calculateFullLifeBook,
        calculateTianShu,
        calculateRenShu,
        calculateBaGuaGun48,
        TAIXUAN_GAN,
        TAIXUAN_ZHI,
        XIANTIAN_GUA_NUM,
        HOUTIAN_GUA_NUM,
        GAN_TO_GUA,
        ZHI_TO_GUA,
        GUA_SYMBOLS,
        HEXAGRAMS
    };

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = TiebanEngine;
    } else {
        global.TiebanEngine = TiebanEngine;
    }

})(typeof window !== 'undefined' ? window : this);
