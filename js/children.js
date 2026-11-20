/*
 * Luận cung Tử Tức (con cái).
 *
 * Nguồn cổ thư: 《紫微斗數全書》卷二「四 子女」, bản Wikisource oldid=1963110
 *   https://zh.wikisource.org/w/index.php?title=紫微斗數全書/卷二&oldid=1963110
 *   (cùng bản mà skill ziwei-doushu dùng làm chuẩn cho bảng độ sáng sao).
 *   Trường `zh` giữ nguyên văn; `co` là bản dịch sang tiếng Việt.
 * Phần luận hiện đại (`vn`) và quy ước Tràng Sinh, Tuần, Triệt, Hồng Loan, Thiên Hỷ
 *   theo quan niệm phổ biến của Tử Vi Việt Nam.
 * Số con trong cổ thư phản ánh xã hội xưa; app hiển thị như tư liệu tham khảo,
 *   không dùng để dự đoán số con hay giới tính con.
 */
(function (root) {
  "use strict";

  const SRC = "Tử Vi Đẩu Số Toàn Thư, quyển 2, mục「四子女」";

  // Nguyên tắc chung — dịch từ đoạn mở đầu mục「四子女」
  const RULES_ZH = "凡看子女先看本宫星宿主有几子。若加羊陀火玲空劫杀忌主生子女有刑克，次看对宫有冲刑否。如本宫无星曜专看对宫有何星宿主有几子。若善星贵星守子女宫必主其人生子昌盛贵显。";

  const MAJOR = {
    紫微: { vn: "Con cái có cá tính, tự trọng, có chí hướng; được con nể trọng nhưng cha mẹ dễ đặt kỳ vọng cao.",
      co: "Miếu vượng: ba trai hai gái; thêm Tả Phù, Hữu Bật, Văn Xương, Văn Khúc: năm người; gặp Kình, Đà, Hỏa, Linh, Không, Kiếp: chỉ một cặp. Đồng cung Phá Quân: ba người; đồng Thiên Phủ thêm cát tinh: bốn, năm người, thêm Xương Khúc Tả Hữu có quý tử.",
      zh: "紫微庙旺男三女二，加左右昌曲有五人，加羊陀火铃空劫只一双，不然偏室生者多，或招祀子居长，破军同三人，天府同加吉星四五人，加昌曲左右有贵子，若独守再加空劫孤君。" },
    天机: { vn: "Con cái lanh lợi, thông minh, hiếu động; số con thường không nhiều.",
      co: "Miếu vượng: hai người. Đồng Cự Môn: một; đồng Thiên Lương ở Dần: hai, ba người, ở Thân: gái nhiều trai ít; đồng Thái Âm: hai, ba người; gặp sát tinh: đường con rất khó.",
      zh: "天机庙旺二人，或庶生多，巨门一人，天梁同在寅宫，有二三人，在申宫女多男少，只可一子，太阴同二三人，加羊陀火铃空劫全无子。" },
    太阳: { vn: "Con cái cởi mở, có chí, thường thành đạt muộn mà vững; quan hệ cha mẹ – con cởi mở.",
      co: "Nhập miếu: ba trai hai gái, con muộn mà quý. Đồng Cự Môn: ba; đồng Thái Âm: năm. Hãm địa: có con nhưng khó thành đạt; thêm sát tinh: chỉ một con nương tựa lúc tuổi già.",
      zh: "太阳入庙男三女二晚子贵，巨门同三人，太阴同五人，陷地有三子不成盖，再加羊陀火铃空劫止留一子送终。" },
    武曲: { vn: "Duyên con cái mỏng hoặc muộn; quan hệ cha mẹ – con nghiêm, ít bộc lộ tình cảm.",
      co: "Chủ một con. Đồng Phá Quân: có hình khắc, một người; đồng Tham Lang: muộn có hai con; đồng Thiên Tướng: trước có con nuôi, sau sinh một con; đồng Thất Sát: cô độc. Gặp sát tinh: đường con rất khó.",
      zh: "武曲主一子或成至生者多，破军同主刑，止有一人，加羊陀火铃空劫绝祀，贪狼晚招二子，天相同先招外子，后亲生一子，七杀同主孤或伤残之子。" },
    天同: { vn: "Con cái hiền hòa, gia đình êm ấm; thường được xem là thuận về đường con.",
      co: "Miếu vượng: năm con, có quý. Đồng Cự Môn: ba; đồng Thái Âm: năm, ở Ngọ hãm giảm một nửa; đồng Thiên Lương: trước gái sau trai, hai con (ở Thân một con, ở Dần thêm cát tinh ba con). Gặp sát tinh: có hình khắc, ít con.",
      zh: "天同庙旺五子有贵，巨门同三人，太阴同五人，在午宫陷地减半，天梁同先女后男有二子，守在申宫只可留一子送终，在寅宫加吉星有三子，加羊陀火铃空劫见刑克，子少送终。" },
    廉贞: { vn: "Con cái cá tính mạnh, dễ có va chạm giữa hai thế hệ; số con thường ít.",
      co: "Một người. Đồng Thiên Phủ: ba quý tử; đồng Tham Lang, Phá Quân, Thất Sát: cô, thêm sát tinh thì rất khó; đồng Thiên Tướng: hai con.",
      zh: "廉贞一人，天府同主贵子三人，若贪狼破军七杀同主孤，再加羊陀火铃空劫全无，天相同有二子。" },
    天府: { vn: "Đường con cái thuận; con hiếu thảo, biết lo toan; thường được xem là tốt.",
      co: "Năm người. Đồng Vũ Khúc: hai; đồng Tử Vi: bốn, năm; đồng Liêm Trinh: ba; gặp sát tinh: ba người.",
      zh: "天府五人，武曲同二人，紫微同四五人，廉贞同三人，加羊陀火铃空劫止三人。" },
    太阴: { vn: "Con cái hiền, giàu tình cảm, gần gũi mẹ; có duyên với con gái.",
      co: "Ba gái hai trai, trước gái sau trai. Miếu vượng có quý tử; hãm địa giảm một nửa, con yếu đuối hoặc khó nên người. Đồng Thái Dương: năm; đồng Thiên Cơ: hai; đồng Thiên Đồng: năm. Miếu thì không khắc, hãm thì có khắc; gặp sát tinh ít con.",
      zh: "太阴女三男二先女后男，庙旺有贵子，陷地减半，招软弱之子，或虚花不成器，太阳同五人，天机同二人，天同同五人，庙地无克，陷宫有克，加羊陀火铃空劫子少。" },
    贪狼: { vn: "Con cái năng động, đa tài, ham chơi; cha mẹ cần định hướng.",
      co: "Miếu vượng: hai người, sớm có hình khắc. Đồng Tử Vi: hai; đồng Liêm Trinh: ít con; đồng Vũ Khúc: ba, trước khó sau dễ.",
      zh: "贪狼庙旺二人，早有刑克，紫微同二人，廉贞同子少，如占星二人，武曲同三人，先难后易。" },
    巨门: { vn: "Con cái ăn nói giỏi, hay tranh luận; dễ bất đồng giữa hai thế hệ; thường trước khó sau dễ.",
      co: "Nhập miếu: hai người, trước khó sau dễ. Đồng Thái Dương: một, hai con dễ nuôi; đồng Thiên Cơ: một, có cát tinh hai; gặp Kình, Đà, Hỏa, Linh: ít con.",
      zh: "巨门入庙二入，先难后易，太阳同居一二子易养，加羊陀火铃子少，天机同一人，有吉星同二人加空劫全无。" },
    天相: { vn: "Con cái ngoan, biết điều, quan hệ hài hòa.",
      co: "Không gặp Kình, Đà, Hỏa, Linh: hai con thành đạt; có sát tinh: trước nhận con nuôi làm trưởng, sau sinh một, hai con. Đồng Tử Vi thêm Xương Khúc Tả Hữu: ba, bốn người; đồng Vũ Khúc: ba người.",
      zh: "天相无羊陀火铃同有二子成器，有杀先招祀子居长，亲生一二子，紫微同如昌曲左右有三四人，武曲同有三人，见羊陀火铃空劫必克，宜偏室生。" },
    天梁: { vn: "Con cái chín chắn, sớm hiểu chuyện; cha mẹ được con chăm lo về già.",
      co: "Miếu vượng: hai người; gặp sát tinh sớm có khắc. Đồng Thiên Đồng thêm cát tinh: ba; đồng Thiên Cơ: hai.",
      zh: "天梁庙旺二人，加羊陀火铃空劫早克，天同同加昌曲左右吉星有三人，天机同有二人，加羊陀火铃空劫全无。" },
    七杀: { vn: "Con cái mạnh mẽ, độc lập, khó bảo; thường ít con hoặc muộn.",
      co: "Chủ cô, phần một con. Đồng Tử Vi thêm cát tinh: ba người; gặp sát tinh: rất khó, nếu có thì con ương bướng.",
      zh: "七杀主孤一人之分，紫微同再吉星有三人，见羊陀火铃空劫全无，纵有不成器，必强横败家之子。" },
    破军: { vn: "Con cái cá tính, thích phá cách; quan hệ cha mẹ – con nhiều thay đổi.",
      co: "Nhập miếu: ba người, con cương cường. Đồng Tử Vi: ba; đồng Vũ Khúc thêm Xương Khúc Tả Hữu: ba; đồng Liêm Trinh: một. Gặp Không, Kiếp, Hỏa, Đà mà không chế hóa: ít con.",
      zh: "破军入庙三人，刚强之子，紫微同三人，武曲同加昌曲左右有三人，廉贞同一人，见羊陀相生有制，无制见空劫火陀少子。" },
  };

  const MINOR = {
    左辅: { co: "đơn thủ ba trai một gái; gặp Tử Vi, Thiên Phủ và cát tinh có quý tử", zh: "左辅单居男三女一，见紫微天府诸吉星主贵子" },
    右弼: { co: "ba người, thêm cát tinh có quý tử; gặp sát tinh giảm một nửa", zh: "右弼三人加吉星有贵子，见羊陀火铃空劫减半" },
    文昌: { co: "ba người, thêm cát tinh càng nhiều", zh: "文昌三人，加吉星更多" },
    文曲: { co: "miếu vượng bốn người, hãm địa hai, ba", zh: "文曲庙旺有四人，陷地有二三人" },
    天魁: { co: "chủ có quý tử", zh: "魁钺单守主有贵子" },
    天钺: { co: "chủ có quý tử", zh: "魁钺单守主有贵子" },
    禄存: { co: "chủ cô, hợp con thứ hoặc con nuôi; thêm cát tinh có một người", zh: "禄存主孤宜庶出一螟蛉之子，加吉星有一人" },
    擎羊: { co: "hãm địa cô đơn; miếu vượng thêm cát tinh có một người, đối cung nhiều cát tinh có ba, bốn", zh: "羊陀陷宫孤单，加吉星庙旺有一人，如对宫有吉星多无杀冲，亦有三四人" },
    陀罗: { co: "hãm địa cô đơn; miếu vượng thêm cát tinh có một người, đối cung nhiều cát tinh có ba, bốn", zh: "羊陀陷宫孤单，加吉星庙旺有一人，如对宫有吉星多无杀冲，亦有三四人" },
    火星: { co: "gặp cát tinh thì không cô; hãm địa thêm sát có hình thương", zh: "火星逢吉同不孤，陷宫加杀刑伤" },
    铃星: { co: "độc thủ cô đơn; thêm cát tinh nhập miếu thì có, đối cung nhiều cát có hai, ba", zh: "铃星独守孤单，加吉星入庙可许庶出，看对宫吉多二三人" },
  };

  const CAT = ["左辅", "右弼", "文昌", "文曲", "天魁", "天钺"];
  const SAT = ["擎羊", "陀罗", "火星", "铃星", "地空", "地劫"];
  // Vòng Tràng Sinh tại Tử Tức — quan niệm phổ biến ở Việt Nam
  const TS_GOOD = ["Tràng Sinh", "Quan Đới", "Lâm Quan", "Đế Vượng"];
  const TS_WEAK = ["Bệnh", "Tử", "Mộ", "Tuyệt"];

  function analyze(d) {
    const V = root.TuViVN, P = d.chart.palaces, vn = d.vn, h = d.horoscope;
    const p = P.find(x => x.name === "子女");
    const ORDER = "子丑寅卯辰巳午未申酉戌亥";
    const opp = P.find(x => x.branch === ORDER[(ORDER.indexOf(p.branch) + 6) % 12]); // Điền Trạch
    const li = [], notes = [];

    // 1) Chính tinh
    let src = p;
    if (!p.major_stars.length) {
      src = opp;
      li.push(`Tử Tức <b>vô chính diệu</b>: theo cổ thư, xem chính tinh cung đối diện Điền Trạch (${src.major_stars.map(s => V.STAR[s.name]).join(", ")}) để luận.`);
    }
    for (const s of src.major_stars) {
      const m = MAJOR[s.name];
      li.push(`<b>${V.STAR[s.name]}</b> (${V.BRIGHT_FULL[s.brightness]}${s.sihua ? ", Hóa " + V.HOA[s.sihua][0] : ""}): ${m.vn}
        <div class="cite">Cổ thư: ${m.co} <span class="zh" title="${SRC}">「${m.zh}」</span></div>`);
    }

    // 2) Phụ tinh
    const minors = p.minor_stars.map(s => s.name);
    const cat = minors.filter(s => CAT.includes(s)), sat = minors.filter(s => SAT.includes(s));
    const hasKy = p.major_stars.concat(p.minor_stars).some(s => s.sihua === "化忌");
    if (cat.length) li.push(`Cát tinh ${cat.map(s => V.STAR[s]).join(", ")}: con cái được trợ lực, học hành, công danh thuận lợi.` +
      cat.filter(s => MINOR[s]).map(s => `<div class="cite">Cổ thư: ${V.STAR[s]} ${MINOR[s].co}. <span class="zh">「${MINOR[s].zh}」</span></div>`).join(""));
    if (sat.length || hasKy) {
      li.push(`Gặp ${sat.map(s => V.STAR[s]).concat(hasKy ? ["Hóa Kỵ"] : []).join(", ")}: cổ thư gọi là "hình khắc" — nghĩa là chuyện con cái dễ khiến cha mẹ bận lòng: muộn con, con khó nuôi hoặc khác biệt quan điểm. Có cát tinh cùng cung thì giảm nhẹ.` +
        sat.filter(s => MINOR[s]).map(s => `<div class="cite">Cổ thư: ${V.STAR[s]} ${MINOR[s].co}. <span class="zh">「${MINOR[s].zh}」</span></div>`).join(""));
    }
    const oppSat = opp.minor_stars.filter(s => SAT.includes(s.name)).map(s => V.STAR[s.name]);
    if (oppSat.length) li.push(`Cung đối diện Điền Trạch có ${oppSat.join(", ")} xung chiếu: cần lưu ý thêm (cổ thư: “次看对宫有冲刑否”).`);
    if (!cat.length && !sat.length && !hasKy) li.push("Không có lục cát tinh hay lục sát tinh tại cung: luận chủ yếu theo chính tinh.");

    // 3) Tứ hóa năm sinh
    for (const x of d.chart.year_sihua) if (x.palace === "子女") li.push(`<b>${V.STAR[x.star]} Hóa ${V.HOA[x.type][0]}</b> nhập Tử Tức: ${V.HOA_TEXT[x.type]["子女"]}.`);

    // 4) Quy ước Việt Nam: Tràng Sinh, Tuần, Triệt, Hồng Loan, Thiên Hỷ, Thiên Hình, Thiên Khốc, Thiên Hư
    const ts = vn.trang_sinh[p.branch];
    li.push(`Vòng Tràng Sinh: Tử Tức gặp <b>${ts}</b> — ${TS_GOOD.includes(ts) ? "thường được xem là đường con cái vượng" : TS_WEAK.includes(ts) ? "thường được xem là con ít hoặc muộn" : V.TRANG_SINH_TEXT[ts]}.`);
    const voids = [vn.triet.includes(p.branch) ? "Triệt" : "", vn.tuan.includes(p.branch) ? "Tuần" : ""].filter(Boolean);
    if (voids.length) li.push(`Tử Tức gặp <b>${voids.join(" và ")}</b>: thường ứng với muộn con hoặc lúc đầu khó khăn, về sau mới thuận.`);
    const adj = p.adjective_stars;
    if (adj.includes("红鸾") || adj.includes("天喜")) li.push(`Có ${adj.filter(s => s === "红鸾" || s === "天喜").map(s => V.STAR[s]).join(", ")}: chủ tin vui, có duyên với con cái.`);
    const sad = adj.filter(s => ["天刑", "天哭", "天虚"].includes(s));
    if (sad.length) li.push(`Có ${sad.map(s => V.STAR[s]).join(", ")}: dễ có điều lo nghĩ về con, nên quan tâm sức khỏe và tâm lý của con.`);

    // 5) Vận hạn
    if (h) {
      const hit = [];
      if (h.decadal) for (const x of h.decadal.sihua) if (x.palace === "子女") hit.push(`Hóa ${V.HOA[x.type][0]} đại hạn (${V.STAR[x.star]})`);
      for (const x of h.yearly.sihua) if (x.palace === "子女") hit.push(`Hóa ${V.HOA[x.type][0]} lưu niên (${V.STAR[x.star]})`);
      if (h.decadal && h.decadal.natal_palace === "子女") notes.push(`Đại hạn ${h.decadal.start_age}–${h.decadal.end_age} tuổi đóng tại Tử Tức: chuyện con cái là trọng tâm của mười năm này.`);
      if (h.yearly.ming_on_natal_palace === "子女") notes.push(`Mệnh lưu niên năm ${h.query_lunar_year} rơi vào Tử Tức: năm nay chuyện con cái được chú ý nhiều.`);
      if (hit.length) {
        const good = hit.filter(x => !x.includes("Kỵ")), bad = hit.filter(x => x.includes("Kỵ"));
        notes.push(`Năm ${h.query_lunar_year}, Tử Tức nhận ${hit.join(", ")}: ${good.length ? "có tin vui, thuận lợi về con cái" : ""}${good.length && bad.length ? "; đồng thời " : ""}${bad.length ? "nên để tâm hơn đến con, tránh nóng vội" : ""}.`);
      }
      if (!notes.length) notes.push(`Năm ${h.query_lunar_year} không có Tứ hóa đại hạn hay lưu niên nhập Tử Tức: chuyện con cái không phải điểm nhấn của năm.`);
    }

    return `<h4>Con cái — cung Tử Tức (${V.gz(p.ganzhi)})</h4>
      <p class="sub">Cổ thư dạy: xem chính tinh tại cung trước; gặp sát tinh, Hóa Kỵ thì có hình khắc; xét thêm cung đối diện; cung không có chính tinh thì mượn sao đối cung; cát tinh, quý tinh tọa thủ thì con cái hưng thịnh. <span class="zh" title="${SRC}">「${RULES_ZH}」</span></p>
      <ul>${li.map(x => `<li>${x}</li>`).join("")}</ul>
      ${notes.length ? `<p><b>Vận hạn:</b> ${notes.join(" ")}</p>` : ""}
      <p class="disclaimer">Số con, trai hay gái trong cổ thư (${SRC}) phản ánh quan niệm xã hội xưa, chỉ dùng làm tư liệu tham khảo, không phải dự báo. Việc sinh con phụ thuộc sức khỏe, y học và lựa chọn của mỗi gia đình; nếu có băn khoăn về khả năng sinh sản, hãy tham khảo bác sĩ chuyên khoa.</p>`;
  }

  root.TuViChildren = { analyze, MAJOR, MINOR, SRC };
})(typeof globalThis !== "undefined" ? globalThis : this);
