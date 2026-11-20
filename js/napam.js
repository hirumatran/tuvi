/*
 * Ngoại lệ chế hóa của ngũ hành nạp âm — dùng trong phần "xem tuổi" (dân gian, không thuộc Tử Vi).
 *
 * Nguồn: 《三命通會》(Tam Mệnh Thông Hội, Vạn Dân Anh, đời Minh) quyển 1,
 *   mục「釋六十甲子性質吉凶」— bản Wikisource: https://zh.wikisource.org/wiki/三命通會/卷一
 *
 * Mỗi quy tắc: nạp âm `a` (bên BỊ khắc) gặp nạp âm `b` (bên khắc) nhưng cổ thư nói:
 *   eff = 1  → khắc mà thành dụng, được xem là TỐT;
 *   eff = 0  → khắc mà KHÔNG HẠI (bình thường).
 * Điều kiện tùy chọn: onlyA / onlyB = can chi bắt buộc của bên a / b; pairs = cặp can chi [a, b] bắt buộc.
 * Chỉ đưa vào các câu cổ thư nói rõ; các câu phụ thuộc cả tứ trụ hoặc mơ hồ thì không đưa vào.
 */
(function (root) {
  "use strict";
  const SRC = "Tam Mệnh Thông Hội, quyển 1, mục「釋六十甲子性質吉凶」";
  const R = (a, b, eff, zh, cond) => Object.assign({ a, b, eff, zh }, cond || {});
  const MOC = ["Tang Đố Mộc", "Tùng Bách Mộc", "Đại Lâm Mộc", "Dương Liễu Mộc", "Thạch Lựu Mộc", "Bình Địa Mộc"];

  const RULES = [
    // Kim bị Hỏa khắc
    R("Hải Trung Kim", "Lư Trung Hỏa", 0, "乙丑金库，非旺火则不能陶铸……乙丑见丙寅、丁卯，是火制金", { onlyA: ["乙丑"] }),
    R("Bạch Lạp Kim", "Lư Trung Hỏa", 0, "此金惟喜火炼，须炉中炎火"),
    R("Bạch Lạp Kim", "Sơn Hạ Hỏa", 0, "山下火生早，主荣贵，亦须水助方得"),
    R("Sa Trung Kim", "Lư Trung Hỏa", 0, "此金非炉火则不能制"),
    R("Sa Trung Kim", "Tích Lịch Hỏa", 1, "戊子、己丑龙火相逢，子午有交媾之妙，甲己有合化之理，主贵"),
    R("Kiếm Phong Kim", "Tích Lịch Hỏa", 1, "火见神龙，阴阳交遇，如壬申逢己丑、癸酉逢戊子，方为上格", { pairs: [["壬申", "己丑"], ["癸酉", "戊子"]] }),
    R("Thoa Xuyến Kim", "Thiên Thượng Hỏa", 1, "太阳火日生显耀，覆灯火夜间显耀，故皆宜见"),
    R("Thoa Xuyến Kim", "Phú Đăng Hỏa", 1, "太阳火日生显耀，覆灯火夜间显耀，故皆宜见"),
    // Hỏa bị Thủy khắc
    R("Tích Lịch Hỏa", "Đại Hải Thủy", 1, "如日时见大海，癸亥为引凡入圣，己丑为上，戊子次之"),
    R("Tích Lịch Hỏa", "Thiên Hà Thủy", 1, "火喜霹雳，为神龙之火，与此水相济"),
    R("Tích Lịch Hỏa", "Giản Hạ Thủy", 0, "涧下虽就位相克，此神火也，不忌"),
    R("Tích Lịch Hỏa", "Đại Khê Thủy", 1, "见大溪，乙卯为雷火变化，己丑为吉，戊子忌之", { onlyA: ["己丑"] }),
    R("Thiên Thượng Hỏa", "Thiên Hà Thủy", 0, "天河雨露相济，不以就位克论"),
    R("Thiên Thượng Hỏa", "Đại Hải Thủy", 1, "火喜天上，与海水相为照耀，最吉"),
    R("Thiên Thượng Hỏa", "Giản Hạ Thủy", 1, "水宜涧下，须戊午见丁丑，已未见丙子，阴阳交互，方为福贵", { pairs: [["戊午", "丁丑"], ["己未", "丙子"]] }),
    R("Thiên Thượng Hỏa", "Đại Khê Thủy", 1, "大溪有乙卯……出入得门，皆吉", { onlyB: ["乙卯"] }),
    R("Sơn Hạ Hỏa", "Tuyền Trung Thủy", 0, "是以此火喜水……水爱井泉、涧下，有木相资，主爵位崇显"),
    R("Sơn Hạ Hỏa", "Giản Hạ Thủy", 0, "是以此火喜水……水爱井泉、涧下，有木相资，主爵位崇显"),
    R("Phú Đăng Hỏa", "Tuyền Trung Thủy", 1, "水以井泉、涧下为真油"),
    R("Phú Đăng Hỏa", "Giản Hạ Thủy", 1, "水以井泉、涧下为真油"),
    R("Phú Đăng Hỏa", "Trường Lưu Thủy", 0, "长流假油"),
    R("Sơn Đầu Hỏa", "Giản Hạ Thủy", 1, "水宜涧下，多为交泰，主吉"),
    R("Sơn Đầu Hỏa", "Đại Khê Thủy", 1, "大溪，甲戌见甲寅，乙亥见乙卯，却真禄俱吉", { pairs: [["甲戌", "甲寅"], ["乙亥", "乙卯"]] }),
    R("Lư Trung Hỏa", "Thiên Hà Thủy", 1, "天上清水，寅命遇之为吉", { onlyA: ["丙寅"] }),
    // Thủy bị Thổ khắc
    R("Thiên Hà Thủy", "Sa Trung Thổ", 1, "银河之水，土不能克，故见土不忌……余土如砂中、屋上皆吉"),
    R("Thiên Hà Thủy", "Ốc Thượng Thổ", 1, "银河之水，土不能克，故见土不忌……余土如砂中、屋上皆吉"),
    R("Thiên Hà Thủy", "Thành Đầu Thổ", 0, "银河之水，土不能克，故见土不忌……城头、大驿无用"),
    R("Thiên Hà Thủy", "Đại Dịch Thổ", 0, "银河之水，土不能克，故见土不忌……城头、大驿无用"),
    R("Đại Hải Thủy", "Lộ Bàng Thổ", 1, "土爱路旁、大驿，唯此二土足以振之不泄"),
    R("Đại Hải Thủy", "Đại Dịch Thổ", 1, "土爱路旁、大驿，唯此二土足以振之不泄"),
    R("Giản Hạ Thủy", "Sa Trung Thổ", 0, "砂中、屋上二土，其气稍清"),
    R("Giản Hạ Thủy", "Ốc Thượng Thổ", 0, "砂中、屋上二土，其气稍清"),
    R("Đại Khê Thủy", "Lộ Bàng Thổ", 0, "路旁稍可"),
    ...["Bích Thượng Thổ", "Lộ Bàng Thổ", "Sa Trung Thổ", "Ốc Thượng Thổ"].map(b =>
      R("Trường Lưu Thủy", b, 1, "嫌土蹇涸，而土有堤防之用，六土之中，取庚辛丙丁为吉，戊己无用")),
    R("Tuyền Trung Thủy", "Lộ Bàng Thổ", 1, "诸土路旁、砂中最吉"),
    R("Tuyền Trung Thủy", "Sa Trung Thổ", 1, "诸土路旁、砂中最吉"),
    R("Tuyền Trung Thủy", "Ốc Thượng Thổ", 1, "屋上有天门生水之源，亦吉"),
    R("Tuyền Trung Thủy", "Thành Đầu Thổ", 0, "城头、壁上与此水则无干涉"),
    R("Tuyền Trung Thủy", "Bích Thượng Thổ", 0, "城头、壁上与此水则无干涉"),
    // Thổ bị Mộc khắc
    ...MOC.filter(m => m !== "Tùng Bách Mộc").map(b => R("Bích Thượng Thổ", b, 0, "凡见木皆可为主")),
    R("Bích Thượng Thổ", "Tùng Bách Mộc", 1, "凡见木皆可为主。庚寅辛卯亦是栋梁"),
    R("Thành Đầu Thổ", "Dương Liễu Mộc", 1, "大都城土皆须资木，杨柳癸未最佳，壬午则忌", { onlyB: ["癸未"] }),
    R("Thành Đầu Thổ", "Tang Đố Mộc", 1, "大都城土皆须资木……桑拓癸丑为上，壬子次之"),
    ...["Đại Lâm Mộc", "Bình Địa Mộc", "Thạch Lựu Mộc"].map(b => R("Thành Đầu Thổ", b, 0, "大都城土皆须资木……如见木无夹辅，只以贵人禄马论之")),
    R("Sa Trung Thổ", "Tang Đố Mộc", 1, "木爰桑拓、杨柳，以此土能载二木故也"),
    R("Sa Trung Thổ", "Dương Liễu Mộc", 1, "木爰桑拓、杨柳，以此土能载二木故也"),
    R("Lộ Bàng Thổ", "Tùng Bách Mộc", 1, "只有庚寅木，此土逢之大好", { onlyB: ["庚寅"] }),
    ...["Tang Đố Mộc", "Dương Liễu Mộc", "Thạch Lựu Mộc", "Bình Địa Mộc"].map(b => R("Lộ Bàng Thổ", b, 0, "见木可以发生，然有贵人禄马则吉")),
    ...MOC.filter(m => m !== "Đại Lâm Mộc").map(b => R("Đại Dịch Thổ", b, 1, "发生万物，以木为基……大林合中逢冲，主夭，别木则吉")),
    R("Ốc Thượng Thổ", "Bình Địa Mộc", 1, "非木无以架之，故以木为根基，平地为上，大林次之"),
    R("Ốc Thượng Thổ", "Đại Lâm Mộc", 1, "非木无以架之，故以木为根基，平地为上，大林次之"),
    // Mộc bị Kim khắc
    R("Tang Đố Mộc", "Sa Trung Kim", 1, "以金言之，砂中第一，剑锋能修整此木，为次"),
    R("Tang Đố Mộc", "Kiếm Phong Kim", 1, "以金言之，砂中第一，剑锋能修整此木，为次"),
    R("Tùng Bách Mộc", "Hải Trung Kim", 1, "金逢乙丑，为印为山", { onlyB: ["乙丑"] }),
    R("Tùng Bách Mộc", "Kim Bạch Kim", 1, "泊金就位自旺，主吉"),
    R("Tùng Bách Mộc", "Kiếm Phong Kim", 0, "剑锋能削能斫，更得壁土相成，松柏相资，主贵"),
    R("Dương Liễu Mộc", "Thoa Xuyến Kim", 1, "金见木无造化，钗钏、金泊却喜成功"),
    R("Dương Liễu Mộc", "Kim Bạch Kim", 1, "金见木无造化，钗钏、金泊却喜成功"),
    R("Thạch Lựu Mộc", "Sa Trung Kim", 1, "见金砂中最吉"),
    R("Thạch Lựu Mộc", "Kim Bạch Kim", 1, "泊金……榴木……皆脱去本性而互换归旺……谓之功侔造化格，主大贵"),
    R("Bình Địa Mộc", "Kim Bạch Kim", 0, "泊金增饰光辉"),
  ];

  /* Tìm ngoại lệ khi nạp âm của can chi gzA (bị khắc) gặp nạp âm của gzB (khắc). */
  function find(napA, gzA, napB, gzB) {
    return RULES.find(r => r.a === napA && r.b === napB
      && (!r.onlyA || r.onlyA.includes(gzA)) && (!r.onlyB || r.onlyB.includes(gzB))
      && (!r.pairs || r.pairs.some(([x, y]) => x === gzA && y === gzB))) || null;
  }

  const api = { RULES, find, SRC };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.TuViNapAm = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
