/**
 * 條文數據加載與記憶體解密模組 (Data Loader)
 * 支援：
 * 1. 本地開發模式：直接讀取結構化 JSON (tieban.json / shaozi.json)
 * 2. 生產防護模式：動態解碼二進制 XOR+Zlib 加密封裝 (tb_data.bin / sz_data.bin)
 */

const MAGIC_KEY = "TB_SZ_SHENSHU_2026_HELUO_SECRET";

class DataLoader {
    constructor() {
        this.tiebanData = null;
        this.shaoziData = null;
        this.tiebanMap = new Map();
        this.shaoziMap = new Map();
        this.isLoaded = false;
    }

    /**
     * 從二進制 ArrayBuffer 動態解密並還原 JSON
     */
    async decryptBin(arrayBuffer) {
        const view = new DataView(arrayBuffer);
        // Header: 'TBSS' (4 bytes) + origLen (4 bytes) + encLen (4 bytes) = 12 bytes
        const magic = String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3));
        if (magic !== 'TBSS') {
            throw new Error('Invalid binary format signature');
        }
        const encLen = view.getUint32(8);
        const encryptedBytes = new Uint8Array(arrayBuffer, 12, encLen);
        
        // XOR 解密
        const decryptedBytes = new Uint8Array(encLen);
        const keyLen = MAGIC_KEY.length;
        for (let i = 0; i < encLen; i++) {
            decryptedBytes[i] = encryptedBytes[i] ^ MAGIC_KEY.charCodeAt(i % keyLen);
        }

        // 瀏覽器原生的 DecompressionStream (zlib/deflate 解壓縮)
        if (typeof DecompressionStream !== 'undefined') {
            const ds = new DecompressionStream('deflate');
            const writer = ds.writable.getWriter();
            writer.write(decryptedBytes);
            writer.close();
            const response = new Response(ds.readable);
            const jsonText = await response.text();
            return JSON.parse(jsonText);
        } else {
            // 後備支援（若無原生 DecompressionStream 則使用引入的 pako/fflate）
            throw new Error('Browser DecompressionStream not supported');
        }
    }

    /**
     * 載入鐵板神數 (優先嘗試 bin，後備支援 json)
     */
    async loadTieban(basePath = '') {
        if (this.tiebanData) return this.tiebanData;
        try {
            const res = await fetch(`${basePath}assets/tb_data.bin`);
            if (res.ok) {
                const buf = await res.arrayBuffer();
                this.tiebanData = await this.decryptBin(buf);
            } else {
                throw new Error('Fallback to JSON');
            }
        } catch (e) {
            const res = await fetch(`${basePath}data/tieban.json`);
            const json = await res.json();
            this.tiebanData = json.data;
        }

        this.tiebanMap.clear();
        for (const item of this.tiebanData) {
            this.tiebanMap.set(item.id, item);
        }
        return this.tiebanData;
    }

    /**
     * 載入邵子神數 (優先嘗試 bin，後備支援 json)
     */
    async loadShaozi(basePath = '') {
        if (this.shaoziData) return this.shaoziData;
        try {
            const res = await fetch(`${basePath}assets/sz_data.bin`);
            if (res.ok) {
                const buf = await res.arrayBuffer();
                this.shaoziData = await this.decryptBin(buf);
            } else {
                throw new Error('Fallback to JSON');
            }
        } catch (e) {
            const res = await fetch(`${basePath}data/shaozi.json`);
            const json = await res.json();
            this.shaoziData = json.data;
        }

        this.shaoziMap.clear();
        for (const item of this.shaoziData) {
            this.shaoziMap.set(item.id, item);
        }
        return this.shaoziData;
    }

    /**
     * 同步或查詢單條條文
     */
    getTiebanItem(id) {
        return this.tiebanMap.get(Number(id)) || null;
    }

    getShaoziItem(id) {
        return this.shaoziMap.get(Number(id)) || null;
    }
}

// 支援 ES Module 與 Node.js / 瀏覽器全域
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DataLoader };
} else {
    window.DataLoader = DataLoader;
}
