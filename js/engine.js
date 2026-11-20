/*
 * Lõi an sao Tử Vi — chạy trực tiếp trên trình duyệt.
 *
 * Phần 1 (buildChart): chuyển 1:1 từ ziwei-doushu/scripts/ziwei_cli.py của repo
 *   https://github.com/fanzr-arch/numerologist_skills (phái Tam Hợp).
 *   Kết quả được đối chiếu tự động với bản Python: xem tests/.
 * Phần 2 (addVietnamese): bổ sung theo Tử Vi Việt Nam — Tuần, Triệt, vòng Tràng Sinh,
 *   nạp âm bản mệnh, sinh khắc Cục–Mệnh, Âm Dương thuận/nghịch lý.
 *
 * Phụ thuộc: lunar-javascript (Solar, Lunar, LunarYear) — nạp trước file này.
 */
(function (root) {
  "use strict";
  const L = root.Solar ? root : (typeof require === "function" ? require("./lunar.js") : null);
  const { Solar, Lunar, LunarYear } = L;

  const STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
  const BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];
  const YIN = 2; // cung Dần
  const PALACE_NAMES = ["命宫", "兄弟", "夫妻", "子女", "财帛", "疾厄", "迁移", "交友", "官禄", "田宅", "福德", "父母"];

  const STEM_NUMBER = { 甲: 1, 乙: 1, 丙: 2, 丁: 2, 戊: 3, 己: 3, 庚: 4, 辛: 4, 壬: 5, 癸: 5 };
  const BRANCH_NUMBER = { 子: 1, 午: 1, 丑: 1, 未: 1, 寅: 2, 申: 2, 卯: 2, 酉: 2, 辰: 3, 戌: 3, 巳: 3, 亥: 3 };
  const JU_BY_REMAINDER = { 1: ["木三局", 3], 2: ["金四局", 4], 3: ["水二局", 2], 4: ["火六局", 6], 5: ["土五局", 5] };
  const YIN_STEM_BY_YEAR_STEM = { 甲: "丙", 己: "丙", 乙: "戊", 庚: "戊", 丙: "庚", 辛: "庚", 丁: "壬", 壬: "壬", 戊: "甲", 癸: "甲" };

  const ZIWEI_GROUP_OFFSETS = [["紫微", 0], ["天机", -1], ["太阳", -3], ["武曲", -4], ["天同", -5], ["廉贞", -8]];
  const TIANFU_GROUP_OFFSETS = [["天府", 0], ["太阴", 1], ["贪狼", 2], ["巨门", 3], ["天相", 4], ["天梁", 5], ["七杀", 6], ["破军", 10]];
  const MAJOR_STARS = ZIWEI_GROUP_OFFSETS.map(x => x[0]).concat(TIANFU_GROUP_OFFSETS.map(x => x[0]));

  const KUI_YUE = {
    甲: ["丑", "未"], 戊: ["丑", "未"], 庚: ["丑", "未"], 乙: ["子", "申"], 己: ["子", "申"],
    丙: ["亥", "酉"], 丁: ["亥", "酉"], 辛: ["午", "寅"], 壬: ["卯", "巳"], 癸: ["卯", "巳"],
  };
  const LUCUN = { 甲: "寅", 乙: "卯", 丙: "巳", 戊: "巳", 丁: "午", 己: "午", 庚: "申", 辛: "酉", 壬: "亥", 癸: "子" };
  const SANHE_GROUP = {
    寅: "寅午戌", 午: "寅午戌", 戌: "寅午戌", 申: "申子辰", 子: "申子辰", 辰: "申子辰",
    巳: "巳酉丑", 酉: "巳酉丑", 丑: "巳酉丑", 亥: "亥卯未", 卯: "亥卯未", 未: "亥卯未",
  };
  const HUO_START = { 寅午戌: "丑", 申子辰: "寅", 巳酉丑: "卯", 亥卯未: "酉" };
  const LING_START = { 寅午戌: "卯", 申子辰: "戌", 巳酉丑: "戌", 亥卯未: "戌" };
  const TIANMA = { 寅午戌: "申", 申子辰: "寅", 巳酉丑: "亥", 亥卯未: "巳" };

  const SIHUA_TYPES = ["化禄", "化权", "化科", "化忌"];
  const SIHUA = {
    甲: ["廉贞", "破军", "武曲", "太阳"], 乙: ["天机", "天梁", "紫微", "太阴"],
    丙: ["天同", "天机", "文昌", "廉贞"], 丁: ["太阴", "天同", "天机", "巨门"],
    戊: ["贪狼", "太阴", "右弼", "天机"], 己: ["武曲", "贪狼", "天梁", "文曲"],
    庚: ["太阳", "武曲", "太阴", "天同"], 辛: ["巨门", "太阳", "文曲", "文昌"],
    壬: ["天梁", "紫微", "左辅", "武曲"], 癸: ["破军", "巨门", "太阴", "贪狼"],
  };

  const BRIGHTNESS_ROWS = {
    紫微: "平 庙 旺 旺 得地 旺 庙 庙 旺 旺 得地 旺",
    天机: "庙 落陷 得地 旺 利 平 庙 落陷 得地 旺 利 平",
    太阳: "落陷 不得地 旺 庙 旺 旺 旺 得地 得地 平 不得地 落陷",
    武曲: "旺 庙 得地 利 庙 平 旺 庙 得地 利 庙 平",
    天同: "旺 不得地 利 平 平 庙 落陷 不得地 旺 平 平 庙",
    廉贞: "平 利 庙 平 利 落陷 平 利 庙 平 利 落陷",
    天府: "庙 庙 庙 得地 庙 得地 旺 庙 得地 旺 庙 得地",
    太阴: "庙 庙 旺 落陷 落陷 落陷 不得地 不得地 利 旺 旺 庙",
    贪狼: "旺 庙 平 利 庙 落陷 旺 庙 平 利 庙 落陷",
    巨门: "旺 不得地 庙 庙 落陷 旺 旺 不得地 庙 庙 落陷 旺",
    天相: "庙 庙 庙 落陷 得地 得地 庙 得地 庙 落陷 得地 得地",
    天梁: "庙 旺 庙 庙 庙 落陷 庙 旺 落陷 得地 庙 落陷",
    七杀: "旺 庙 庙 旺 庙 平 旺 庙 庙 旺 庙 平",
    破军: "庙 旺 得地 落陷 旺 平 庙 旺 得地 落陷 旺 平",
  };
  const BRIGHTNESS = Object.fromEntries(Object.entries(BRIGHTNESS_ROWS).map(([k, v]) => [k, v.split(" ")]));

  const MING_ZHU = ["贪狼", "巨门", "禄存", "文曲", "廉贞", "武曲", "破军", "武曲", "廉贞", "文曲", "禄存", "巨门"];
  const SHEN_ZHU = ["火星", "天相", "天梁", "天同", "文昌", "天机", "火星", "天相", "天梁", "天同", "文昌", "天机"];
  const ZIWEI_PAIR_BRANCHES = { 天府: ["寅", "申"], 贪狼: ["卯", "酉"], 天相: ["辰", "戌"], 七杀: ["巳", "亥"], 破军: ["丑", "未"] };

  const LEAP_MONTH_RULES = ["current", "next", "split_15"];
  const LATE_ZI_RULES = ["next_day", "same_day"];
  const GENDER_ALIASES = { 男: "男", male: "男", m: "男", nam: "男", 女: "女", female: "女", f: "女", "nữ": "女", nu: "女" };

  const b = name => BRANCHES.indexOf(name);
  const wrap = i => ((i % 12) + 12) % 12;
  const pad = n => String(n).padStart(2, "0");

  class ChartError extends Error {}

  function daysInSolarMonth(y, m) { return new Date(Date.UTC(y, m, 0)).getUTCDate(); }

  function parseDateTime(value) {
    const m = String(value).trim().match(/^(\d{1,4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{1,2})(?::(\d{1,2}))?)?/);
    if (!m) throw new ChartError("Ngày sinh phải có dạng YYYY-MM-DD HH:MM");
    if (m[4] === undefined) throw new ChartError("Thiếu giờ sinh: lập lá số Tử Vi bắt buộc phải có giờ sinh.");
    return { year: +m[1], month: +m[2], day: +m[3], hour: +m[4], minute: m[5] === undefined ? 0 : +m[5] };
  }

  function normalizeInput(payload) {
    const warnings = [];
    const calendarType = String(payload.calendar_type || "solar").trim().toLowerCase();
    if (payload.birth_time === undefined || payload.birth_time === null || payload.birth_time === "")
      throw new ChartError("Thiếu ngày giờ sinh.");
    const raw = parseDateTime(payload.birth_time);
    const isLeap = !!payload.is_leap_month;
    if (!(raw.hour >= 0 && raw.hour <= 23 && raw.minute >= 0 && raw.minute <= 59))
      throw new ChartError("Giờ sinh không hợp lệ (giờ 0–23, phút 0–59).");

    let solar;
    if (calendarType === "solar") {
      if (raw.month < 1 || raw.month > 12 || raw.day < 1 || raw.day > daysInSolarMonth(raw.year, raw.month))
        throw new ChartError("Ngày dương lịch không tồn tại.");
      solar = Solar.fromYmd(raw.year, raw.month, raw.day);
    } else if (calendarType === "lunar") {
      if (raw.month < 1 || raw.month > 12 || raw.day < 1 || raw.day > 30) throw new ChartError("Ngày âm lịch không hợp lệ.");
      if (isLeap && LunarYear.fromYear(raw.year).getLeapMonth() !== raw.month)
        throw new ChartError(`Năm âm lịch ${raw.year} không có tháng ${raw.month} nhuận.`);
      let lunar;
      try { lunar = Lunar.fromYmd(raw.year, isLeap ? -raw.month : raw.month, raw.day); }
      catch (e) { throw new ChartError("Ngày âm lịch không tồn tại (tháng này có thể chỉ có 29 ngày)."); }
      solar = lunar.getSolar();
    } else {
      throw new ChartError("calendar_type chỉ nhận solar hoặc lunar.");
    }

    const g = String(payload.gender || "").trim().toLowerCase();
    if (!(g in GENDER_ALIASES)) throw new ChartError("Thiếu giới tính: giới tính quyết định chiều đại hạn.");

    let leapRule = payload.leap_month_rule, leapSource = "explicit";
    if (leapRule === undefined || leapRule === null || leapRule === "") { leapRule = "split_15"; leapSource = "default"; }
    if (!LEAP_MONTH_RULES.includes(leapRule)) throw new ChartError("leap_month_rule không hợp lệ.");
    const lateZi = payload.late_zi_rule || "next_day";
    if (!LATE_ZI_RULES.includes(lateZi)) throw new ChartError("late_zi_rule không hợp lệ.");

    const minutes = raw.hour * 60 + raw.minute;
    const r = (((minutes - 60) % 120) + 120) % 120;
    if (Math.min(r, 120 - r) <= 15) warnings.push({ code: "near_boundary" });

    return {
      calendarType, solar, hour: raw.hour, minute: raw.minute, gender: GENDER_ALIASES[g],
      leapRule, leapSource, lateZi, original: payload.birth_time, warnings,
    };
  }

  const hourBranchIndex = hour => Math.floor((hour + 1) / 2) % 12;

  function resolveCalendar(info) {
    const hourIdx = hourBranchIndex(info.hour);
    let chartSolar = info.solar, rollover = false;
    if (info.hour === 23 && info.lateZi === "next_day") { chartSolar = info.solar.next(1); rollover = true; }
    const lunar = chartSolar.getLunar();
    const lunarMonth = Math.abs(lunar.getMonth());
    const isLeap = lunar.getMonth() < 0;
    const lunarDay = lunar.getDay();
    let chartMonth = lunarMonth;
    if (isLeap && (info.leapRule === "next" || (info.leapRule === "split_15" && lunarDay > 15))) chartMonth = (lunarMonth % 12) + 1;
    return {
      chartSolar, rollover, lunarYear: lunar.getYear(), lunarMonth, lunarDay, isLeap, chartMonth,
      yearStem: STEMS[lunar.getYearGanIndex()], yearBranch: BRANCHES[lunar.getYearZhiIndex()], hourIdx,
      lunarText: `${lunar.getYearInGanZhi()}年${lunar.getMonthInChinese()}月${lunar.getDayInChinese()}`,
    };
  }

  function palaceStem(yearStem, idx) {
    const start = STEMS.indexOf(YIN_STEM_BY_YEAR_STEM[yearStem]);
    return STEMS[(start + wrap(idx - YIN)) % 10];
  }

  function wuxingJu(stem, branch) {
    let t = STEM_NUMBER[stem] + BRANCH_NUMBER[branch];
    while (t > 5) t -= 5;
    return JU_BY_REMAINDER[t];
  }

  function ziweiPosition(ju, day) {
    const q = Math.ceil(day / ju);
    const short = q * ju - day;
    const base = wrap(YIN + q - 1);
    if (short === 0) return base;
    return short % 2 === 1 ? wrap(base - short) : wrap(base + short);
  }

  function placeMajor(ziweiIdx) {
    const pos = {};
    for (const [n, o] of ZIWEI_GROUP_OFFSETS) pos[n] = wrap(ziweiIdx + o);
    const tf = wrap(4 - ziweiIdx);
    for (const [n, o] of TIANFU_GROUP_OFFSETS) pos[n] = wrap(tf + o);
    return pos;
  }

  function placeMinor(ys, yb, month, h) {
    const g = SANHE_GROUP[yb], [kui, yue] = KUI_YUE[ys], lc = b(LUCUN[ys]);
    return {
      文昌: wrap(b("戌") - h), 文曲: wrap(b("辰") + h), 左辅: wrap(b("辰") + month - 1), 右弼: wrap(b("戌") - (month - 1)),
      天魁: b(kui), 天钺: b(yue), 禄存: lc, 擎羊: wrap(lc + 1), 陀罗: wrap(lc - 1),
      火星: wrap(b(HUO_START[g]) + h), 铃星: wrap(b(LING_START[g]) + h),
      地空: wrap(b("亥") - h), 地劫: wrap(b("亥") + h), 天马: b(TIANMA[g]),
    };
  }

  function placeAdjective(yb, month) {
    const y = b(yb), hl = wrap(b("卯") - y);
    return {
      天刑: wrap(b("酉") + month - 1), 天姚: wrap(b("丑") + month - 1), 红鸾: hl, 天喜: wrap(hl + 6),
      天哭: wrap(b("午") - y), 天虚: wrap(b("午") + y),
    };
  }

  function sihuaForStem(stem, starIndex, names) {
    return SIHUA[stem].map((star, i) => ({ type: SIHUA_TYPES[i], star, branch: BRANCHES[starIndex[star]], palace: names[starIndex[star]] }));
  }

  const decadalDirection = (ys, gender) => ((STEMS.indexOf(ys) % 2 === 0) === (gender === "男") ? 1 : -1);

  function buildChart(info) {
    const cal = resolveCalendar(info);
    const { yearStem: ys, yearBranch: yb, hourIdx: h, chartMonth: month } = cal;
    const monthPalace = wrap(YIN + month - 1);
    const ming = wrap(monthPalace - h), shen = wrap(monthPalace + h);
    const names = {}; PALACE_NAMES.forEach((n, i) => { names[wrap(ming - i)] = n; });
    const stems = {}; for (let i = 0; i < 12; i++) stems[i] = palaceStem(ys, i);
    const [juName, ju] = wuxingJu(stems[ming], BRANCHES[ming]);
    const major = placeMajor(ziweiPosition(ju, cal.lunarDay));
    const minor = placeMinor(ys, yb, month, h);
    const adjective = placeAdjective(yb, month);
    const starIndex = { ...major, ...minor, ...adjective };
    const yearSihua = sihuaForStem(ys, starIndex, names);
    const sihuaByStar = Object.fromEntries(yearSihua.map(x => [x.star, x.type]));
    const dir = decadalDirection(ys, info.gender);
    const decadal = {};
    for (let s = 0; s < 12; s++) decadal[wrap(ming + dir * s)] = { start_age: ju + 10 * s, end_age: ju + 10 * s + 9 };

    const palaces = PALACE_NAMES.map((name, i) => {
      const idx = wrap(ming - i);
      return {
        name, branch: BRANCHES[idx], stem: stems[idx], ganzhi: stems[idx] + BRANCHES[idx], is_shen_gong: idx === shen,
        major_stars: MAJOR_STARS.filter(s => major[s] === idx).map(s => ({ name: s, brightness: BRIGHTNESS[s][idx], sihua: sihuaByStar[s] || null })),
        minor_stars: Object.keys(minor).filter(s => minor[s] === idx).map(s => ({ name: s, sihua: sihuaByStar[s] || null })),
        adjective_stars: Object.keys(adjective).filter(s => adjective[s] === idx),
        decadal: decadal[idx],
      };
    });
    return { cal, ming, shen, juName, ju, starIndex, major, yearSihua, dir, palaces, names, stems, decadal };
  }

  function selfCheck(chart) {
    const issues = [];
    const zb = BRANCHES[chart.major["紫微"]];
    for (const [p, allowed] of Object.entries(ZIWEI_PAIR_BRANCHES))
      if (chart.major[p] === chart.major["紫微"] && !allowed.includes(zb)) issues.push(`Tử Vi đồng cung ${p} tại ${zb}`);
    for (const it of chart.yearSihua) if (!(it.star in chart.starIndex)) issues.push(`Sao hóa ${it.star} không có trên lá số`);
    if (Object.keys(chart.major).length !== 14) issues.push("Thiếu chính tinh");
    if (issues.length) throw new Error("Tự kiểm tra thất bại: " + issues.join("; "));
    return { major_star_count: 14, ziwei_branch: zb, ziwei_partner: Object.keys(ZIWEI_PAIR_BRANCHES).find(p => chart.major[p] === chart.major["紫微"]) || null, passed: true };
  }

  function buildHoroscope(chart, qy) {
    const age = qy - chart.cal.lunarYear + 1;
    const ys = STEMS[(((qy - 4) % 10) + 10) % 10], ybi = (((qy - 4) % 12) + 12) % 12;
    const res = {
      query_lunar_year: qy, nominal_age: age,
      yearly: {
        ganzhi: ys + BRANCHES[ybi], ming_branch: BRANCHES[ybi], ming_on_natal_palace: chart.names[ybi],
        palaces: PALACE_NAMES.map((n, i) => ({ name: n, branch: BRANCHES[wrap(ybi - i)], natal_palace: chart.names[wrap(ybi - i)] })),
        sihua: sihuaForStem(ys, chart.starIndex, chart.names),
      },
      decadal: null,
    };
    for (const [idxS, span] of Object.entries(chart.decadal)) {
      const idx = +idxS;
      if (span.start_age <= age && age <= span.end_age) {
        const st = chart.stems[idx];
        res.decadal = { branch: BRANCHES[idx], ganzhi: st + BRANCHES[idx], natal_palace: chart.names[idx], start_age: span.start_age, end_age: span.end_age, sihua: sihuaForStem(st, chart.starIndex, chart.names) };
      }
    }
    return res;
  }

  /* ---------------- Phần 2: bổ sung theo Tử Vi Việt Nam ---------------- */

  // Nạp âm Lục thập hoa giáp: mỗi cặp can chi liên tiếp (Giáp Tý–Ất Sửu, …) chung một nạp âm.
  const NAP_AM = [
    ["Hải Trung Kim", "Kim"], ["Lư Trung Hỏa", "Hỏa"], ["Đại Lâm Mộc", "Mộc"], ["Lộ Bàng Thổ", "Thổ"], ["Kiếm Phong Kim", "Kim"],
    ["Sơn Đầu Hỏa", "Hỏa"], ["Giản Hạ Thủy", "Thủy"], ["Thành Đầu Thổ", "Thổ"], ["Bạch Lạp Kim", "Kim"], ["Dương Liễu Mộc", "Mộc"],
    ["Tuyền Trung Thủy", "Thủy"], ["Ốc Thượng Thổ", "Thổ"], ["Tích Lịch Hỏa", "Hỏa"], ["Tùng Bách Mộc", "Mộc"], ["Trường Lưu Thủy", "Thủy"],
    ["Sa Trung Kim", "Kim"], ["Sơn Hạ Hỏa", "Hỏa"], ["Bình Địa Mộc", "Mộc"], ["Bích Thượng Thổ", "Thổ"], ["Kim Bạch Kim", "Kim"],
    ["Phú Đăng Hỏa", "Hỏa"], ["Thiên Hà Thủy", "Thủy"], ["Đại Dịch Thổ", "Thổ"], ["Thoa Xuyến Kim", "Kim"], ["Tang Đố Mộc", "Mộc"],
    ["Đại Khê Thủy", "Thủy"], ["Sa Trung Thổ", "Thổ"], ["Thiên Thượng Hỏa", "Hỏa"], ["Thạch Lựu Mộc", "Mộc"], ["Đại Hải Thủy", "Thủy"],
  ];
  function napAm(stem, branch) {
    const s = STEMS.indexOf(stem), r = BRANCHES.indexOf(branch);
    let n = 0; while (n % 10 !== s || n % 12 !== r) n++; // vị trí trong vòng 60 hoa giáp
    return NAP_AM[Math.floor(n / 2)];
  }
  const JU_ELEMENT = { 水二局: "Thủy", 木三局: "Mộc", 金四局: "Kim", 土五局: "Thổ", 火六局: "Hỏa" };
  const SINH = { Kim: "Thủy", Thủy: "Mộc", Mộc: "Hỏa", Hỏa: "Thổ", Thổ: "Kim" }; // A sinh SINH[A]
  const KHAC = { Kim: "Mộc", Mộc: "Thổ", Thổ: "Thủy", Thủy: "Hỏa", Hỏa: "Kim" }; // A khắc KHAC[A]
  function cucMenh(cuc, menh) {
    if (cuc === menh) return "binh_hoa";
    if (SINH[cuc] === menh) return "cuc_sinh_menh";
    if (SINH[menh] === cuc) return "menh_sinh_cuc";
    if (KHAC[cuc] === menh) return "cuc_khac_menh";
    return "menh_khac_cuc";
  }

  // Triệt Lộ Không Vong — theo can năm sinh.
  const TRIET = { 甲: ["申", "酉"], 己: ["申", "酉"], 乙: ["午", "未"], 庚: ["午", "未"], 丙: ["辰", "巳"], 辛: ["辰", "巳"], 丁: ["寅", "卯"], 壬: ["寅", "卯"], 戊: ["子", "丑"], 癸: ["子", "丑"] };
  // Tuần Trung Không Vong — hai địa chi bị "khuyết" trong tuần giáp chứa năm sinh.
  function tuan(stem, branch) {
    const start = wrap(BRANCHES.indexOf(branch) - STEMS.indexOf(stem)); // địa chi đi cùng can Giáp đầu tuần
    return [BRANCHES[wrap(start + 10)], BRANCHES[wrap(start + 11)]];
  }
  // Vòng Tràng Sinh — khởi theo Cục: Thủy, Thổ tại Thân; Mộc tại Hợi; Kim tại Tỵ; Hỏa tại Dần.
  // Dương Nam, Âm Nữ đi thuận; Âm Nam, Dương Nữ đi nghịch.
  const TRANG_SINH = ["Tràng Sinh", "Mộc Dục", "Quan Đới", "Lâm Quan", "Đế Vượng", "Suy", "Bệnh", "Tử", "Mộ", "Tuyệt", "Thai", "Dưỡng"];
  const TRANG_SINH_START = { 水二局: "申", 土五局: "申", 木三局: "亥", 金四局: "巳", 火六局: "寅" };

  function addVietnamese(chart, info) {
    const { yearStem: ys, yearBranch: yb } = chart.cal;
    const start = b(TRANG_SINH_START[chart.juName]);
    const trangSinh = {};
    TRANG_SINH.forEach((n, i) => { trangSinh[BRANCHES[wrap(start + chart.dir * i)]] = n; });
    const [napName, napElement] = napAm(ys, yb);
    const yangYear = STEMS.indexOf(ys) % 2 === 0;
    const yangPalace = chart.ming % 2 === 0; // Tý, Dần, Thìn, Ngọ, Thân, Tuất là cung dương
    return {
      tuan: tuan(ys, yb),
      triet: TRIET[ys],
      trang_sinh: trangSinh,
      ban_menh: { name: napName, element: napElement },
      cuc_element: JU_ELEMENT[chart.juName],
      cuc_menh: cucMenh(JU_ELEMENT[chart.juName], napElement),
      am_duong: (yangYear ? "Dương " : "Âm ") + (info.gender === "男" ? "Nam" : "Nữ"),
      am_duong_ly: yangYear === yangPalace ? "thuan" : "nghich",
    };
  }

  function buildOutput(payload) {
    const info = normalizeInput(payload);
    const chart = buildChart(info);
    const cal = chart.cal;
    const check = selfCheck(chart);
    const warnings = info.warnings.slice();
    if (cal.rollover) warnings.push({ code: "late_zi" });
    if (cal.isLeap) warnings.push({ code: "leap", lunar_month: cal.lunarMonth, lunar_day: cal.lunarDay, chart_month: cal.chartMonth, rule: info.leapRule, source: info.leapSource });
    const s = info.solar;
    const out = {
      normalized_input: {
        calendar_type: info.calendarType, original_birth_time: info.original,
        civil_solar_datetime: `${s.getYear()}-${pad(s.getMonth())}-${pad(s.getDay())} ${pad(info.hour)}:${pad(info.minute)}`,
        gender: info.gender, leap_month_rule: info.leapRule, leap_month_rule_source: info.leapSource, late_zi_rule: info.lateZi,
      },
      calendar: {
        chart_solar_date: `${cal.chartSolar.getYear()}-${pad(cal.chartSolar.getMonth())}-${pad(cal.chartSolar.getDay())}`,
        day_rollover_applied: cal.rollover, lunar_year: cal.lunarYear, lunar_month: cal.lunarMonth, lunar_day: cal.lunarDay,
        is_leap_month: cal.isLeap, chart_month: cal.chartMonth, lunar_text: cal.lunarText,
        year_ganzhi: cal.yearStem + cal.yearBranch, year_yinyang: STEMS.indexOf(cal.yearStem) % 2 === 0 ? "阳" : "阴",
        hour_branch: BRANCHES[cal.hourIdx] + "时",
      },
      chart: {
        ming_gong: { branch: BRANCHES[chart.ming], ganzhi: chart.stems[chart.ming] + BRANCHES[chart.ming] },
        shen_gong: { branch: BRANCHES[chart.shen], palace: chart.names[chart.shen] },
        wuxing_ju: { name: chart.juName, number: chart.ju },
        ming_zhu: MING_ZHU[chart.ming], shen_zhu: SHEN_ZHU[b(cal.yearBranch)],
        decadal_direction: chart.dir === 1 ? "顺行" : "逆行",
        year_sihua: chart.yearSihua,
        star_index: Object.fromEntries(Object.entries(chart.starIndex).map(([k, v]) => [k, BRANCHES[v]])),
        palaces: chart.palaces,
        self_check: check,
      },
      vn: addVietnamese(chart, info),
      warnings,
    };
    if (payload.query_year !== undefined && payload.query_year !== null && payload.query_year !== "")
      out.horoscope = buildHoroscope(chart, parseInt(payload.query_year, 10));
    return out;
  }

  const api = { buildOutput, ChartError, BRANCHES, STEMS, _internals: { tuan, napAm, cucMenh, TRIET, TRANG_SINH_START } };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  else root.TuViEngine = api;
})(typeof globalThis !== "undefined" ? globalThis : this);
