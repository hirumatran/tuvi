(function () {
  "use strict";
  const { STAR, SAT, BR, PAL, BRIGHT, BRIGHT_FULL, HOA, JU, STAR_TEXT, TRANG_SINH_TEXT, gz, interpret } = window.TuViVN;
  const ORDER = "子丑寅卯辰巳午未申酉戌亥";
  // Bố cục truyền thống: Tỵ Ngọ Mùi Thân / Thìn · · Dậu / Mão · · Tuất / Dần Sửu Tý Hợi
  const POS = { 巳: [1, 1], 午: [1, 2], 未: [1, 3], 申: [1, 4], 辰: [2, 1], 酉: [2, 4], 卯: [3, 1], 戌: [3, 4], 寅: [4, 1], 丑: [4, 2], 子: [4, 3], 亥: [4, 4] };
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const hoaTag = h => (h ? `<span class="hoa ${HOA[h][1]}">${HOA[h][0]}</span>` : "");
  const thisLunarYear = Lunar.fromDate(new Date()).getYear();
  const mounted = []; // các lá số đang hiển thị (để đặt lại nhãn Tuần/Triệt khi đổi kích thước)

  /* ---------- Hai tab chính ---------- */
  function showTab(name) {
    document.querySelectorAll(".maintabs button").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab === name)));
    $("#tab-ca-nhan").hidden = name !== "ca-nhan";
    $("#tab-con-cai").hidden = name !== "con-cai";
    try { history.replaceState(null, "", "#" + name); } catch (e) { /* bỏ qua */ }
    mounted.forEach(m => m.host.offsetParent && placeVoids(m.host, m.data));
  }
  document.querySelectorAll(".maintabs button").forEach(b => b.addEventListener("click", () => showTab(b.dataset.tab)));
  showTab(location.hash === "#con-cai" ? "con-cai" : "ca-nhan");

  $("#qy").value = thisLunarYear;
  $("#c-qy").value = thisLunarYear;

  function warnText(w, who) {
    const p = who ? `${who}: ` : "";
    if (w.code === "near_boundary") return p + "giờ sinh cách ranh giới giờ (canh giờ) dưới 15 phút — nếu giờ sinh lệch, cả lá số sẽ thay đổi. Nên lập thêm lá số với giờ liền kề để so sánh.";
    if (w.code === "late_zi") return p + "sinh sau 23:00, đã tính là giờ Tý của ngày hôm sau. Nếu theo quan điểm không đổi ngày, chọn “Giữ ngày hôm đó”.";
    if (w.code === "leap") return p + `sinh ngày ${w.lunar_day} tháng ${w.lunar_month} nhuận: theo mặc định, ngày 1–15 tính theo tháng ${w.lunar_month}, từ ngày 16 tính sang tháng sau — lá số dùng tháng ${w.chart_month}.`;
    return "";
  }
  const warnBox = list => (list.length ? `<div class="warn">⚠ ${list.join("<br>⚠ ")}</div>` : "");

  /* ---------- Tab 1: lá số cá nhân ---------- */
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
      const d = TuViEngine.buildOutput(payload);
      $("#out").innerHTML = warnBox(d.warnings.map(w => warnText(w)).filter(Boolean)) + `<div class="chart-host"></div>`;
      mountChart($("#out .chart-host"), d, "Giải nghĩa lá số");
    } catch (err) {
      $("#out").innerHTML = `<div class="err">Lỗi: ${esc(err.message)}</div>`;
    }
  });

  /* ---------- Tab 2: con cái hai vợ chồng ---------- */
  $("#fc").addEventListener("submit", e => {
    e.preventDefault();
    const start = +$("#c-qy").value || thisLunarYear;
    const person = (k, gender) => ({
      calendar_type: $(`#${k}-cal`).value,
      birth_time: `${$(`#${k}-date`).value} ${$(`#${k}-time`).value}`,
      gender, is_leap_month: $(`#${k}-leap`).checked, late_zi_rule: $("#c-zi").value,
    });
    const inH = person("h", "男"), inW = person("w", "女");
    let who = "Chồng";
    try {
      const H = TuViEngine.buildOutput({ ...inH, query_year: start });
      who = "Vợ";
      const W = TuViEngine.buildOutput({ ...inW, query_year: start });
      const warns = [...H.warnings.map(w => warnText(w, "Chồng")), ...W.warnings.map(w => warnText(w, "Vợ"))].filter(Boolean);
      $("#out2").innerHTML = warnBox(warns) + TuViCouple.analyzeCouple(H, W, inH, inW, "Chồng", "Vợ", start) +
        `<div class="tabs"><span class="tabs-label">Xem lá số chi tiết:</span>
           <button type="button" data-v="0" class="on">Lá số Chồng</button><button type="button" data-v="1">Lá số Vợ</button></div>
         <div class="chart-host"></div>`;
      const charts = [H, W], labels = ["Chồng", "Vợ"], host = $("#out2 .chart-host");
      const show = i => {
        $("#out2").querySelectorAll(".tabs button").forEach(b => b.classList.toggle("on", +b.dataset.v === i));
        mountChart(host, charts[i], "Giải nghĩa lá số — " + labels[i]);
      };
      $("#out2").querySelectorAll(".tabs button").forEach(b => b.addEventListener("click", () => show(+b.dataset.v)));
      show(0);
    } catch (err) {
      $("#out2").innerHTML = `<div class="err">Lỗi (${who}): ${esc(err.message)}</div>`;
    }
  });

  /* ---------- Vẽ một lá số vào host ---------- */
  function mountChart(host, d, title) {
    const { chart: c, calendar: cal, horoscope: h, vn, normalized_input: ni } = d;
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
    host.innerHTML = `<div class="board-wrap"><div class="board">${cells}${center}</div></div>
      <div class="detail"></div>
      <div class="panel"><h3>${title}</h3>${interpret(d)}</div>`;
    host.querySelectorAll(".cell").forEach(el => el.addEventListener("click", () => select(host, d, el.dataset.br)));
    const i = mounted.findIndex(m => m.host === host);
    if (i >= 0) mounted[i].data = d; else mounted.push({ host, data: d });
    placeVoids(host, d);
    select(host, d, c.ming_gong.branch);
  }

  // Đặt nhãn Tuần/Triệt trên ranh giới giữa hai cung liền kề.
  function placeVoids(host, d) {
    const wrap = host.querySelector(".board-wrap");
    if (!wrap) return;
    wrap.querySelectorAll(".void").forEach(x => x.remove());
    const base = wrap.getBoundingClientRect();
    const used = {};
    for (const [label, [a, b]] of [["Triệt", d.vn.triet], ["Tuần", d.vn.tuan]]) {
      const ra = wrap.querySelector(`[data-br="${a}"]`).getBoundingClientRect();
      const rb = wrap.querySelector(`[data-br="${b}"]`).getBoundingClientRect();
      let x, y;
      if (Math.abs(ra.top - rb.top) < 2) { x = (Math.max(ra.left, rb.left) + Math.min(ra.right, rb.right)) / 2; y = ra.top + ra.height * 0.5; }
      else { y = (Math.max(ra.top, rb.top) + Math.min(ra.bottom, rb.bottom)) / 2; x = ra.left + ra.width * 0.5; }
      const key = a + b, tag = document.createElement("div");
      tag.className = "void";
      tag.textContent = used[key] ? "Tuần · Triệt" : label;
      if (used[key]) used[key].remove();
      tag.style.left = (x - base.left) + "px";
      tag.style.top = (y - base.top) + "px";
      wrap.appendChild(tag);
      used[key] = tag;
    }
  }
  window.addEventListener("resize", () => mounted.forEach(m => m.host.offsetParent && placeVoids(m.host, m.data)));

  function select(host, d, br) {
    const c = d.chart, vn = d.vn;
    const i = ORDER.indexOf(br), at = k => ORDER[(i + k + 12) % 12];
    const tri = [at(6), at(4), at(-4)];
    host.querySelectorAll(".cell").forEach(el => {
      el.classList.toggle("sel", el.dataset.br === br);
      el.classList.toggle("tri", tri.includes(el.dataset.br));
    });
    const P = Object.fromEntries(c.palaces.map(p => [p.branch, p]));
    const p = P[br];
    const majors = p.major_stars.length
      ? p.major_stars.map(s => `<li><b>${STAR[s.name]}</b> — ${BRIGHT_FULL[s.brightness]}${s.sihua ? ", Hóa " + HOA[s.sihua][0] : ""}: ${STAR_TEXT[s.name].core}.</li>`).join("")
      : `<li>Vô chính diệu — mượn chính tinh cung đối diện <b>${PAL[P[at(6)].name]}</b> (${P[at(6)].major_stars.map(s => STAR[s.name]).join(", ")}).</li>`;
    const voids = [vn.triet.includes(br) ? "Triệt" : "", vn.tuan.includes(br) ? "Tuần" : ""].filter(Boolean);
    host.querySelector(".detail").innerHTML = `<div class="panel"><h3>Cung ${PAL[p.name]} — ${gz(p.ganzhi)}${p.is_shen_gong ? " (Thân cư)" : ""}</h3>
      <ul>${majors}
      <li>Vòng Tràng Sinh: <b>${vn.trang_sinh[br]}</b> — ${TRANG_SINH_TEXT[vn.trang_sinh[br]]}.</li>
      ${voids.length ? `<li>Gặp <b>${voids.join(", ")}</b>: sức các sao trong cung bị ngăn lại.</li>` : ""}
      ${p.name === "子女" ? '<li>Xem luận giải chi tiết ở mục <a href="#" class="goto-cc">Con cái</a> trong phần Giải nghĩa.</li>' : ""}
      <li><b>Tam phương tứ chính:</b> ${tri.map(b => `${PAL[P[b].name]} (${P[b].major_stars.map(s => STAR[s.name]).join(", ") || "VCD"})`).join(" · ")}</li></ul></div>`;
    const go = host.querySelector(".goto-cc");
    if (go) go.addEventListener("click", ev => { ev.preventDefault(); host.querySelector("#con-cai, [id='con-cai']").scrollIntoView({ behavior: "smooth" }); });
  }
})();
