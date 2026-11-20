/*
 * Luận con cái cho hai vợ chồng.
 *
 * Nguyên tắc (theo SKILL.md của ziwei-doushu, mục 特殊情况 · 合盘):
 *   "先分别排两张盘，再谈互动结构，不直接下'合/不合'的绝对结论" —
 *   lập riêng hai lá số, xét cung Tử Tức của từng người, rồi mới bàn sự tương tác;
 *   không kết luận tuyệt đối "hợp / không hợp".
 * Phần Tử Vi: quy tắc cung Tử Tức theo 《紫微斗數全書》卷二「四子女」 (xem js/children.js)
 *   và Tứ hóa đại hạn / lưu niên nhập Tử Tức theo references/sihua.md.
 * Phần "xem tuổi sinh con": phép dân gian Việt Nam (ngũ hành nạp âm, địa chi hợp – xung),
 *   KHÔNG thuộc Tử Vi Đẩu Số; được tách riêng và ghi rõ.
 */
(function (root) {
  "use strict";
  const STEMS = "甲乙丙丁戊己庚辛壬癸", BRANCHES = "子丑寅卯辰巳午未申酉戌亥";
  const CAT = ["左辅", "右弼", "文昌", "文曲", "天魁", "天钺"];
  const SAT = ["擎羊", "陀罗", "火星", "铃星", "地空", "地劫"];
  const BRIGHT_GOOD = ["庙", "旺", "得地"], BRIGHT_BAD = ["落陷", "不得地"];
  // Cổ thư mục「四子女」: 七杀主孤; 武曲主一子; 廉贞一人; 禄存主孤
  const FEW = { 七杀: "Thất Sát chủ cô", 武曲: "Vũ Khúc chủ một con", 廉贞: "Liêm Trinh chủ một người", 禄存: "Lộc Tồn chủ cô" };
  const TS_GOOD = ["Tràng Sinh", "Quan Đới", "Lâm Quan", "Đế Vượng"], TS_WEAK = ["Bệnh", "Tử", "Mộ", "Tuyệt"];

  const SINH = { Kim: "Thủy", Thủy: "Mộc", Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim" };
  const KHAC = { Kim: "Mộc", Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim" };
  const LUC_HOP = ["子丑", "寅亥", "卯戌", "辰酉", "巳申", "午未"];
  const LUC_XUNG = ["子午", "丑未", "寅申", "卯酉", "辰戌", "巳亥"];
  const TAM_HOP = ["申子辰", "寅午戌", "巳酉丑", "亥卯未"];

  function engine() { return root.TuViEngine || require("./engine.js"); }

  /* Đánh giá cung Tử Tức của một lá số: liệt kê điểm thuận / điểm cần lưu tâm (minh bạch, không chấm điểm ẩn). */
  function assess(d) {
    const V = root.TuViVN, P = d.chart.palaces, vn = d.vn;
    const p = P.find(x => x.name === "子女");
    const opp = P.find(x => x.branch === BRANCHES[(BRANCHES.indexOf(p.branch) + 6) % 12]);
    const plus = [], minus = [];
    const majors = p.major_stars.length ? p.major_stars : opp.major_stars;
    const borrowed = !p.major_stars.length;
    for (const s of majors) {
      if (BRIGHT_GOOD.includes(s.brightness)) plus.push(`${V.STAR[s.name]} ${V.BRIGHT_FULL[s.brightness]}${borrowed ? " (mượn từ Điền Trạch)" : ""}`);
      if (BRIGHT_BAD.includes(s.brightness)) minus.push(`${V.STAR[s.name]} ${V.BRIGHT_FULL[s.brightness]}${borrowed ? " (mượn từ Điền Trạch)" : ""}`);
      if (!borrowed && FEW[s.name]) minus.push(`cổ thư: ${FEW[s.name]}`);
    }
    const mins = p.minor_stars.map(s => s.name);
    if (mins.includes("禄存")) minus.push(`cổ thư: ${FEW["禄存"]}`);
    const cat = mins.filter(s => CAT.includes(s)), sat = mins.filter(s => SAT.includes(s));
    if (cat.length) plus.push("cát tinh " + cat.map(s => V.STAR[s]).join(", "));
    if (sat.length) minus.push("sát tinh " + sat.map(s => V.STAR[s]).join(", "));
    for (const x of d.chart.year_sihua) if (x.palace === "子女") (x.type === "化忌" ? minus : plus).push(`${V.STAR[x.star]} Hóa ${V.HOA[x.type][0]} (năm sinh)`);
    const ts = vn.trang_sinh[p.branch];
    if (TS_GOOD.includes(ts)) plus.push(`Tràng Sinh: ${ts}`);
    if (TS_WEAK.includes(ts)) minus.push(`Tràng Sinh: ${ts}`);
    const voids = [vn.triet.includes(p.branch) ? "Triệt" : "", vn.tuan.includes(p.branch) ? "Tuần" : ""].filter(Boolean);
    if (voids.length) minus.push(`gặp ${voids.join(", ")} (thường ứng muộn con)`);
    const hy = p.adjective_stars.filter(s => s === "红鸾" || s === "天喜");
    if (hy.length) plus.push(hy.map(s => V.STAR[s]).join(", "));
    const level = plus.length - minus.length >= 2 ? "good" : minus.length - plus.length >= 2 ? "care" : "mid";
    return { p, borrowed, majors, plus, minus, level, voids: voids.length > 0, ky: minus.some(x => x.includes("Hóa Kỵ")) };
  }

  function relElement(child, parent) {
    if (child === parent) return ["Bình hòa", 0];
    if (SINH[child] === parent) return ["Con sinh", 1];
    if (SINH[parent] === child) return ["Sinh con", 1];
    if (KHAC[child] === parent) return ["Con khắc", -1];
    return ["Khắc con", -1];
  }
  function relBranch(a, b) {
    const pair = [a + b, b + a];
    if (LUC_XUNG.some(x => pair.includes(x))) return ["Lục xung", -1];
    if (LUC_HOP.some(x => pair.includes(x))) return ["Lục hợp", 1];
    if (a !== b && TAM_HOP.some(g => g.includes(a) && g.includes(b))) return ["Tam hợp", 1];
    return ["", 0];
  }

  function yearRows(inA, inB, a, b, start, n) {
    const E = engine(), V = root.TuViVN, rows = [];
    const hitsOf = (o) => {
      const h = o.horoscope, out = [];
      if (h.decadal) for (const x of h.decadal.sihua) if (x.palace === "子女") out.push({ t: x.type, s: x.star, lay: "ĐH" });
      for (const x of h.yearly.sihua) if (x.palace === "子女") out.push({ t: x.type, s: x.star, lay: "LN" });
      return { out, menh: h.yearly.ming_on_natal_palace === "子女", dh: h.decadal && h.decadal.natal_palace === "子女" };
    };
    for (let y = start; y < start + n; y++) {
      const oa = E.buildOutput({ ...inA, query_year: y }), ob = E.buildOutput({ ...inB, query_year: y });
      const ha = hitsOf(oa), hb = hitsOf(ob);
      const s = STEMS[(y - 4) % 10], br = BRANCHES[(y - 4) % 12];
      const [napName, napEl] = E._internals.napAm(s, br);
      const ea = relElement(napEl, a.vn.ban_menh.element), eb = relElement(napEl, b.vn.ban_menh.element);
      const ba = relBranch(br, a.calendar.year_ganzhi[1]), bb = relBranch(br, b.calendar.year_ganzhi[1]);
      const good = [...ha.out, ...hb.out].some(x => x.t !== "化忌");
      const ky = [...ha.out, ...hb.out].some(x => x.t === "化忌" && x.lay === "LN");
      const tuoiOk = ea[1] >= 0 && eb[1] >= 0 && ba[1] >= 0 && bb[1] >= 0;
      rows.push({ y, gz: s + br, napName, napEl, ha, hb, ea, eb, ba, bb, star: good && !ky && tuoiOk, tvGood: good && !ky, tuoiOk });
    }
    return rows;
  }

  function analyzeCouple(A, B, inA, inB, labelA, labelB, startYear) {
    const V = root.TuViVN;
    const a = assess(A), b = assess(B);
    const LV = { good: "nhiều điểm thuận", mid: "thuận – nghịch đan xen", care: "nhiều điểm cần lưu tâm" };
    const card = (lab, d, r) => `<div class="pcard"><div class="pcard-h">${lab} · Tử Tức ${V.gz(r.p.ganzhi)}</div>
      <div>${r.majors.map(s => `<b>${V.STAR[s.name]}</b> (${V.BRIGHT_FULL[s.brightness]})`).join(", ")}${r.borrowed ? " <i>(vô chính diệu, mượn Điền Trạch)</i>" : ""}</div>
      <div class="lv ${r.level}">${LV[r.level]}</div>
      <div><span class="ok">Thuận:</span> ${r.plus.join("; ") || "—"}</div>
      <div><span class="no">Cần lưu tâm:</span> ${r.minus.join("; ") || "—"}</div></div>`;

    // Tổng hợp tương tác — quy tắc diễn giải, hiển thị minh bạch
    const syn = [];
    if (a.level === "good" && b.level === "good") syn.push("Cung Tử Tức của cả hai lá số đều có nhiều điểm thuận: theo Tử Vi, đường con cái của hai vợ chồng được xem là hanh thông.");
    else if (a.level === "care" && b.level === "care") syn.push("Cung Tử Tức của cả hai đều có nhiều điểm cần lưu tâm: theo cổ thư thường ứng với muộn con hoặc cần kiên nhẫn; nên chủ động chăm sóc sức khỏe và khám sức khỏe sinh sản cho cả hai.");
    else if (a.level !== b.level) {
      const [st, wk] = (a.level === "good" || (a.level === "mid" && b.level === "care")) ? [labelA, labelB] : [labelB, labelA];
      syn.push(`Lá số của <b>${st}</b> thuận về con cái hơn, có thể bù đắp phần cần lưu tâm ở lá số của <b>${wk}</b>. Khi luận con cái cho hai vợ chồng, Tử Vi xét cả hai lá số chứ không dựa vào một người.`);
    } else syn.push("Cả hai lá số đều ở mức thuận – nghịch đan xen: đường con cái bình thường, thời điểm thuận lợi phụ thuộc vào vận hạn (xem bảng bên dưới).");
    if (a.voids && b.voids) syn.push("Cả hai cùng có Tuần hoặc Triệt ở Tử Tức: dấu hiệu muộn con được nhấn mạnh.");
    if (a.ky && b.ky) syn.push("Cả hai cùng có Hóa Kỵ năm sinh ở Tử Tức: cả hai đều rất để tâm đến con cái, dễ lo lắng — nên thống nhất cách nuôi dạy.");
    const ma = A.vn.ban_menh, mb = B.vn.ban_menh, rm = relElement(ma.element, mb.element)[0];
    const rmText = { "Bình hòa": "bình hòa (cùng hành)", "Con sinh": `${ma.element} sinh ${mb.element} (tương sinh)`, "Sinh con": `${mb.element} sinh ${ma.element} (tương sinh)`, "Con khắc": `${ma.element} khắc ${mb.element} (tương khắc)`, "Khắc con": `${mb.element} khắc ${ma.element} (tương khắc)` }[rm];
    syn.push(`Bản mệnh: ${labelA} <b>${ma.name}</b>, ${labelB} <b>${mb.name}</b> — ${rmText} <span class="tagx">xem tuổi dân gian</span>.`);

    const rows = yearRows(inA, inB, A, B, startYear, 10);
    const hitTxt = r => r.out.map(x => `<span class="hoa ${V.HOA[x.t][1]}" title="${x.lay === "ĐH" ? "Đại hạn" : "Lưu niên"}: ${V.STAR[x.s]}">${x.lay} ${V.HOA[x.t][0]}</span>`).join(" ") + (r.menh ? ' <span class="mini">Mệnh LN tại Tử Tức</span>' : "") || "—";
    const rel = (e, br) => `<span class="${e[1] < 0 ? "no" : "ok"}">${e[0]}</span>${br[0] ? `, <span class="${br[1] < 0 ? "no" : "ok"}">${br[0]}</span>` : ""}`;
    const table = `<div class="tbl-wrap"><table class="yt"><thead><tr>
        <th>Năm (âm lịch)</th><th>Tứ hóa vào Tử Tức · ${labelA}</th><th>Tứ hóa vào Tử Tức · ${labelB}</th>
        <th>Tuổi con – ${labelA}</th><th>Tuổi con – ${labelB}</th><th></th></tr></thead><tbody>
      ${rows.map(r => `<tr class="${r.star ? "star" : ""}"><td><b>${r.y}</b> ${V.gz(r.gz)}<div class="mini">${r.napName}</div></td>
        <td>${hitTxt(r.ha)}</td><td>${hitTxt(r.hb)}</td><td>${rel(r.ea, r.ba)}</td><td>${rel(r.eb, r.bb)}</td>
        <td>${r.star ? "★" : ""}</td></tr>`).join("")}</tbody></table></div>`;

    return `<div class="panel" id="couple-panel"><h3>Con cái của hai vợ chồng</h3>
      <p class="sub">Theo nguyên tắc luận hai lá số: lập riêng từng lá số, xét cung Tử Tức của mỗi người, rồi mới bàn tương tác; không kết luận tuyệt đối “hợp” hay “không hợp”.</p>
      <div class="pcards">${card(labelA, A, a)}${card(labelB, B, b)}</div>
      <h4>Nhận định chung</h4><ul>${syn.map(x => `<li>${x}</li>`).join("")}</ul>
      <h4>Mười năm tới (${startYear}–${startYear + 9})</h4>
      ${table}
      <ul class="legend2">
        <li><b>Tứ hóa vào Tử Tức</b> (Tử Vi): ĐH = Tứ hóa của đại hạn, LN = Tứ hóa của lưu niên rơi vào cung Tử Tức gốc. Lộc, Quyền, Khoa: thuận lợi về con cái; Kỵ: nên để tâm, tránh nóng vội.</li>
        <li><b>Tuổi con – cha/mẹ</b> (<span class="tagx">xem tuổi dân gian</span>, không thuộc Tử Vi): so ngũ hành nạp âm của năm sinh con với bản mệnh cha/mẹ (Con sinh, Sinh con, Bình hòa là thuận; Con khắc, Khắc con là kém) và địa chi năm (Tam hợp, Lục hợp là thuận; Lục xung là kém). Chưa xét các ngoại lệ chế hóa của nạp âm.</li>
        <li><b>★</b>: năm có Lộc, Quyền hoặc Khoa vào Tử Tức của ít nhất một người, không có Kỵ lưu niên vào Tử Tức của ai, và tuổi con không khắc, không xung với cả hai. Năm tính theo âm lịch (từ Tết đến Tết).</li>
      </ul>
      <p class="disclaimer">Đây là gợi ý theo quy tắc truyền thống, chỉ để tham khảo. Thời điểm sinh con nên dựa trên sức khỏe, điều kiện gia đình và tư vấn của bác sĩ.</p></div>`;
  }

  const api = { assess, analyzeCouple, yearRows, relElement, relBranch };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.TuViCouple = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
