// Kiểm thử: node tests/run.js [file_fixtures]
// 1) So khớp lõi JS với kết quả script Python gốc. 2) Kiểm tra quy tắc Tuần/Triệt/Tràng Sinh.
const fs = require("fs"), path = require("path");
const E = require("../js/engine.js");
const file = process.argv[2] || path.join(__dirname, "fixtures.json");
const cases = JSON.parse(fs.readFileSync(file, "utf8"));
let fail = 0;
for (const { input, expected } of cases) {
  let got;
  try {
    const o = E.buildOutput(input);
    const c = { ...o.chart }; delete c.star_index; delete c.self_check;
    got = { calendar: o.calendar, chart: c, n_warnings: o.warnings.length };
    if (o.horoscope) got.horoscope = o.horoscope;
  } catch (e) { got = { error: true }; }
  const a = JSON.stringify(got), b = JSON.stringify(expected);
  if (a !== b) {
    if (fail++ < 3) { console.log("LỆCH:", JSON.stringify(input));
      for (const k of Object.keys(expected)) if (JSON.stringify(got[k]) !== JSON.stringify(expected[k])) console.log("  khác ở", k, "\n  JS:", JSON.stringify(got[k]).slice(0, 300), "\n  PY:", JSON.stringify(expected[k]).slice(0, 300)); }
  }
}
console.log(`Đối chiếu với Python: ${cases.length - fail}/${cases.length} khớp`);

// Quy tắc Việt Nam — các ví dụ tra cứu chuẩn
const { tuan, napAm, TRIET } = E._internals;
const eq = (x, y, msg) => { if (JSON.stringify(x) !== JSON.stringify(y)) { fail++; console.log("SAI:", msg, x, "≠", y); } };
eq(tuan("甲", "子"), ["戌", "亥"], "Tuần Giáp Tý"); eq(tuan("癸", "酉"), ["戌", "亥"], "Tuần Quý Dậu");
eq(tuan("甲", "戌"), ["申", "酉"], "Tuần Giáp Tuất"); eq(tuan("庚", "午"), ["戌", "亥"], "Tuần Canh Ngọ");
eq(tuan("乙", "丑"), ["戌", "亥"], "Tuần Ất Sửu"); eq(tuan("甲", "寅"), ["子", "丑"], "Tuần Giáp Dần"); eq(tuan("癸", "亥"), ["子", "丑"], "Tuần Quý Hợi");
eq(TRIET["甲"], ["申", "酉"], "Triệt Giáp"); eq(TRIET["戊"], ["子", "丑"], "Triệt Mậu");
eq(napAm("甲", "子")[0], "Hải Trung Kim", "Nạp âm Giáp Tý"); eq(napAm("庚", "午")[0], "Lộ Bàng Thổ", "Nạp âm Canh Ngọ");
eq(napAm("乙", "丑")[0], "Hải Trung Kim", "Nạp âm Ất Sửu"); eq(napAm("丙", "寅")[0], "Lư Trung Hỏa", "Nạp âm Bính Dần");
eq(napAm("癸", "亥")[0], "Đại Hải Thủy", "Nạp âm Quý Hợi"); eq(napAm("乙", "丑")[0], "Hải Trung Kim", "Ất Sửu");
eq(napAm("丙", "午")[0], "Thiên Hà Thủy", "Nạp âm Bính Ngọ"); eq(napAm("甲", "辰")[0], "Phú Đăng Hỏa", "Nạp âm Giáp Thìn");
// Tràng Sinh: Thủy nhị cục, Dương Nam → Tràng Sinh tại Thân, Mộc Dục tại Dậu
const o = E.buildOutput({ birth_time: "1990-05-15 14:30", gender: "男" });
const ts = o.vn.trang_sinh, start = { 水二局: "申", 土五局: "申", 木三局: "亥", 金四局: "巳", 火六局: "寅" }[o.chart.wuxing_ju.name];
eq(ts[start], "Tràng Sinh", "Tràng Sinh khởi đúng cục");
const dirOk = (o.calendar.year_yinyang === "阳") === (o.normalized_input.gender === "男") ? 1 : -1;
eq(ts[E.BRANCHES[(E.BRANCHES.indexOf(start) + dirOk + 12) % 12]], "Mộc Dục", "Chiều Tràng Sinh");
eq(Object.keys(ts).length, 12, "Đủ 12 sao Tràng Sinh");
// Ngoại lệ chế hóa nạp âm (js/napam.js)
const NA = require("../js/napam.js"), C = require("../js/couple.js");
const names = {}; for (let s = 0; s < 10; s++) for (let r = 0; r < 12; r++) if (s % 2 === r % 2) { const [n, el] = napAm(E.STEMS[s], E.BRANCHES[r]); names[n] = el; }
const KHAC = { Kim: "Mộc", Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim" };
for (const r of NA.RULES) {
  if (!(r.a in names) || !(r.b in names)) { fail++; console.log("SAI tên nạp âm:", r.a, r.b); continue; }
  if (KHAC[names[r.b]] !== names[r.a]) { fail++; console.log("SAI: không phải cặp khắc", r.a, "←", r.b); }
}
eq(C.relNap("壬戌", "庚午")[0], "Khắc con · chế hóa (tốt)", "Đại Hải Thủy (con) – Lộ Bàng Thổ (cha mẹ)");
eq(C.relNap("庚午", "壬戌")[0], "Con khắc · chế hóa (tốt)", "Lộ Bàng Thổ (con) – Đại Hải Thủy (cha mẹ)");
eq(C.relNap("己丑", "壬申")[0], "Con khắc · chế hóa (tốt)", "Kiếm Phong 壬申 – Tích Lịch 己丑");
eq(C.relNap("戊子", "壬申")[0], "Con khắc", "Kiếm Phong 壬申 – Tích Lịch 戊子 (không thuộc cặp)");
eq(C.relNap("丙午", "庚午")[0], "Khắc con", "Thiên Hà – Lộ Bàng (cổ thư: 就位相克)");
eq(C.relNap("丙午", "丙辰")[0], "Khắc con · chế hóa (tốt)", "Thiên Hà – Sa Trung Thổ");
console.log(`Ngoại lệ chế hóa: ${NA.RULES.length} quy tắc đã kiểm tra.`);
if (fail) { console.log(`THẤT BẠI: ${fail} lỗi`); process.exit(1); }
console.log("Tất cả kiểm thử đạt.");
