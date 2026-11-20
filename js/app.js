(function () {
  "use strict";
  const { STAR, SAT, BR, PAL, BRIGHT, BRIGHT_FULL, HOA, JU, STAR_TEXT, TRANG_SINH_TEXT, gz, interpret } = window.TuViVN;
  const ORDER = "子丑寅卯辰巳午未申酉戌亥";
  // Bố cục truyền thống: Tỵ Ngọ Mùi Thân / Thìn · · Dậu / Mão · · Tuất / Dần Sửu Tý Hợi
  const POS = { 巳: [1, 1], 午: [1, 2], 未: [1, 3], 申: [1, 4], 辰: [2, 1], 酉: [2, 4], 卯: [3, 1], 戌: [3, 4], 寅: [4, 1], 丑: [4, 2], 子: [4, 3], 亥: [4, 4] };
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const hoaTag = h => (h ? `<span class="hoa ${HOA[h][1]}">${HOA[h][0]}</span>` : "");
  let DATA = null;

  $("#qy").value = Lunar.fromDate(new Date()).getYear();

  $("#f").addEventListener("submit", e => {
    e.preventDefault();
    const payload = {
      calendar_type: $("#cal").value,
      birth_time: `${$("#date").value} ${$("#time").value}`,
      gender: $("#gender").value,
      is_leap_month: $("#leap").checked,
      late_zi_rule: $("#zi").value,
    };
    if ($("#qy").value) payload.query_year = +$("#qy").value;
    try {
      DATA = TuViEngine.buildOutput(payload);
      render();
    } catch (err) {
      $("#out").innerHTML = `<div class="err">Lỗi: ${esc(err.message)}</div>`;
    }
  });

  function warnText(w) {
    if (w.code === "near_boundary") return "Giờ sinh cách ranh giới giờ (canh giờ) dưới 15 phút — nếu giờ sinh lệch, cả lá số sẽ thay đổi. Nên lập thêm lá số với giờ liền kề để so sánh.";
    if (w.code === "late_zi") return "Sinh sau 23:00: đã tính là giờ Tý của ngày hôm sau. Nếu bạn theo quan điểm không đổi ngày, chọn “Giữ ngày hôm đó”.";
    if (w.code === "leap") return `Sinh ngày ${w.lunar_day} tháng ${w.lunar_month} nhuận: theo mặc định, ngày 1–15 tính theo tháng ${w.lunar_month}, từ ngày 16 tính sang tháng sau — lá số này dùng tháng ${w.chart_month}.`;
    return "";
  }

  function render() {
    const { chart: c, calendar: cal, horoscope: h, vn, normalized_input: ni } = DATA;
    const byBr = Object.fromEntries(c.palaces.map(p => [p.branch, p]));
    const dh = h && h.decadal ? h.decadal.branch : null, ln = h ? h.yearly.ming_branch : null;
    let cells = "";
    for (const br of Object.keys(POS)) {
      const p = byBr[br], [r, col] = POS[br];
      const majors = p.major_stars.map(s => `<div class="major">${STAR[s.name]} <small>(${BRIGHT[s.brightness]})</small>${hoaTag(s.sihua)}</div>`).join("") || `<div class="adj">(Vô chính diệu)</div>`;
      const minors = p.minor_stars.map(s => `<span class="${SAT.includes(s.name) ? "bad" : ""}">${STAR[s.name]}${hoaTag(s.sihua)}</span>`).join(", ");
      const adj = p.adjective_stars.map(s => STAR[s]).join(", ");
      cells += `<div class="cell" data-br="${br}" style="grid-row:${r};grid-column:${col}">
        ${majors}<div class="minor">${minors}</div><div class="adj">${adj}</div>
        <div class="foot"><span>${gz(p.ganzhi)}<br>${p.decadal.start_age}–${p.decadal.end_age}</span>
          <span class="ts">${vn.trang_sinh[br]}</span>
          <span class="r"><span class="pname">${PAL[p.name]}</span><br>${p.is_shen_gong ? '<span class="tag than">Thân</span>' : ""}${br === dh ? '<span class="tag dh">ĐH</span>' : ""}${br === ln ? '<span class="tag ln">LN</span>' : ""}</span>
        </div></div>`;
    }
    const male = ni.gender === "男";
    const center = `<div class="center">
      <h2>${vn.am_duong}</h2>
      <div class="row">Dương lịch: <b>${ni.civil_solar_datetime}</b></div>
      <div class="row">Âm lịch: <b>ngày ${cal.lunar_day} tháng ${cal.is_leap_month ? "nhuận " : ""}${cal.lunar_month} năm ${gz(cal.year_ganzhi)}</b>, giờ <b>${BR[cal.hour_branch[0]]}</b></div>
      <div class="row">Bản mệnh: <b>${vn.ban_menh.name}</b> · Cục: <b>${JU[c.wuxing_ju.name]}</b></div>
      <div class="row">Mệnh tại <b>${gz(c.ming_gong.ganzhi)}</b> · Thân cư <b>${PAL[c.shen_gong.palace]}</b></div>
      <div class="row">Mệnh chủ: <b>${STAR[c.ming_zhu]}</b> · Thân chủ: <b>${STAR[c.shen_zhu]}</b></div>
      <div class="row">Tuần: <b>${vn.tuan.map(x => BR[x]).join("–")}</b> · Triệt: <b>${vn.triet.map(x => BR[x]).join("–")}</b></div>
      <div class="row">Tứ hóa: ${c.year_sihua.map(x => STAR[x.star] + hoaTag(x.type)).join(" ")}</div>
      ${h ? `<div class="row">Năm ${h.query_lunar_year} (${gz(h.yearly.ganzhi)}), ${h.nominal_age} tuổi âm</div>` : ""}
      <div class="legend">M Miếu · V Vượng · Đ Đắc · L Lợi · B Bình · BĐ Bất đắc · H Hãm<br>ĐH đại hạn · LN lưu niên · Bấm một cung để xem chi tiết</div>
    </div>`;
    const warns = DATA.warnings.map(warnText).filter(Boolean);
    $("#out").innerHTML = (warns.length ? `<div class="warn">⚠ ${warns.join("<br>⚠ ")}</div>` : "") +
      `<div class="board-wrap"><div class="board">${cells}${center}</div></div>
       <div id="detail"></div>
       <div class="panel"><h3>Giải nghĩa lá số</h3>${interpret(DATA)}</div>`;
    document.querySelectorAll(".cell").forEach(el => el.addEventListener("click", () => select(el.dataset.br)));
    placeVoids();
    select(c.ming_gong.branch);
  }

  // Đặt nhãn Tuần/Triệt trên ranh giới giữa hai cung liền kề.
  function placeVoids() {
    const wrap = document.querySelector(".board-wrap");
    wrap.querySelectorAll(".void").forEach(x => x.remove());
    const base = wrap.getBoundingClientRect();
    const pairs = [["Triệt", DATA.vn.triet], ["Tuần", DATA.vn.tuan]];
    const used = {};
    for (const [label, [a, b]] of pairs) {
      const ra = wrap.querySelector(`[data-br="${a}"]`).getBoundingClientRect();
      const rb = wrap.querySelector(`[data-br="${b}"]`).getBoundingClientRect();
      let x, y;
      if (Math.abs(ra.top - rb.top) < 2) { x = (Math.max(ra.left, rb.left) + Math.min(ra.right, rb.right)) / 2; y = ra.top + ra.height * 0.5; }
      else { y = (Math.max(ra.top, rb.top) + Math.min(ra.bottom, rb.bottom)) / 2; x = ra.left + ra.width * 0.5; }
      const key = a + b;
      const tag = document.createElement("div");
      tag.className = "void";
      tag.textContent = used[key] ? "Tuần · Triệt" : label;
      if (used[key]) used[key].remove();
      tag.style.left = (x - base.left) + "px";
      tag.style.top = (y - base.top) + "px";
      wrap.appendChild(tag);
      used[key] = tag;
    }
  }
  window.addEventListener("resize", () => DATA && placeVoids());

  function select(br) {
    const c = DATA.chart, vn = DATA.vn;
    const i = ORDER.indexOf(br), at = k => ORDER[(i + k + 12) % 12];
    const tri = [at(6), at(4), at(-4)];
    document.querySelectorAll(".cell").forEach(el => {
      el.classList.toggle("sel", el.dataset.br === br);
      el.classList.toggle("tri", tri.includes(el.dataset.br));
    });
    const P = Object.fromEntries(c.palaces.map(p => [p.branch, p]));
    const p = P[br];
    const majors = p.major_stars.length
      ? p.major_stars.map(s => `<li><b>${STAR[s.name]}</b> — ${BRIGHT_FULL[s.brightness]}${s.sihua ? ", Hóa " + HOA[s.sihua][0] : ""}: ${STAR_TEXT[s.name].core}.</li>`).join("")
      : `<li>Vô chính diệu — mượn chính tinh cung đối diện <b>${PAL[P[at(6)].name]}</b> (${P[at(6)].major_stars.map(s => STAR[s.name]).join(", ")}).</li>`;
    const voids = [vn.triet.includes(br) ? "Triệt" : "", vn.tuan.includes(br) ? "Tuần" : ""].filter(Boolean);
    $("#detail").innerHTML = `<div class="panel"><h3>Cung ${PAL[p.name]} — ${gz(p.ganzhi)}${p.is_shen_gong ? " (Thân cư)" : ""}</h3>
      <ul>${majors}
      <li>Vòng Tràng Sinh: <b>${vn.trang_sinh[br]}</b> — ${TRANG_SINH_TEXT[vn.trang_sinh[br]]}.</li>
      ${voids.length ? `<li>Gặp <b>${voids.join(", ")}</b>: sức các sao trong cung bị ngăn lại.</li>` : ""}
      ${p.name === "子女" ? '<li>Xem luận giải chi tiết ở mục <a href="#con-cai">Con cái</a> trong phần Giải nghĩa.</li>' : ""}
      <li><b>Tam phương tứ chính:</b> ${tri.map(b => `${PAL[P[b].name]} (${P[b].major_stars.map(s => STAR[s.name]).join(", ") || "VCD"})`).join(" · ")}</li></ul></div>`;
  }
})();
