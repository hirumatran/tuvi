/*
 * Từ điển Hán–Việt và phần Giải nghĩa lá số.
 * Nội dung luận giải dịch và biên tập từ references/stars.md, references/sihua.md của skill
 * ziwei-doushu (numerologist_skills), bổ sung quan niệm phổ biến của Tử Vi Việt Nam
 * (Tuần, Triệt, vòng Tràng Sinh, Cục–Mệnh, Âm Dương thuận/nghịch lý).
 */
(function (root) {
  "use strict";

  const STEM = { 甲: "Giáp", 乙: "Ất", 丙: "Bính", 丁: "Đinh", 戊: "Mậu", 己: "Kỷ", 庚: "Canh", 辛: "Tân", 壬: "Nhâm", 癸: "Quý" };
  const BR = { 子: "Tý", 丑: "Sửu", 寅: "Dần", 卯: "Mão", 辰: "Thìn", 巳: "Tỵ", 午: "Ngọ", 未: "Mùi", 申: "Thân", 酉: "Dậu", 戌: "Tuất", 亥: "Hợi" };
  const PAL = { 命宫: "Mệnh", 兄弟: "Huynh Đệ", 夫妻: "Phu Thê", 子女: "Tử Tức", 财帛: "Tài Bạch", 疾厄: "Tật Ách", 迁移: "Thiên Di", 交友: "Nô Bộc", 官禄: "Quan Lộc", 田宅: "Điền Trạch", 福德: "Phúc Đức", 父母: "Phụ Mẫu" };
  const PAL_DOMAIN = {
    命宫: "tính cách, nền tảng cuộc đời", 兄弟: "anh chị em, cộng sự", 夫妻: "hôn nhân, tình cảm", 子女: "con cái",
    财帛: "tiền bạc, cách kiếm và tiêu tiền", 疾厄: "sức khỏe", 迁移: "môi trường bên ngoài, đi xa", 交友: "bạn bè, cấp dưới",
    官禄: "sự nghiệp, công danh", 田宅: "nhà cửa, tài sản cố định", 福德: "đời sống tinh thần, phúc phần", 父母: "cha mẹ, bề trên",
  };
  const STAR = {
    紫微: "Tử Vi", 天机: "Thiên Cơ", 太阳: "Thái Dương", 武曲: "Vũ Khúc", 天同: "Thiên Đồng", 廉贞: "Liêm Trinh", 天府: "Thiên Phủ",
    太阴: "Thái Âm", 贪狼: "Tham Lang", 巨门: "Cự Môn", 天相: "Thiên Tướng", 天梁: "Thiên Lương", 七杀: "Thất Sát", 破军: "Phá Quân",
    文昌: "Văn Xương", 文曲: "Văn Khúc", 左辅: "Tả Phù", 右弼: "Hữu Bật", 天魁: "Thiên Khôi", 天钺: "Thiên Việt", 禄存: "Lộc Tồn",
    擎羊: "Kình Dương", 陀罗: "Đà La", 火星: "Hỏa Tinh", 铃星: "Linh Tinh", 地空: "Địa Không", 地劫: "Địa Kiếp", 天马: "Thiên Mã",
    天刑: "Thiên Hình", 天姚: "Thiên Diêu", 红鸾: "Hồng Loan", 天喜: "Thiên Hỷ", 天哭: "Thiên Khốc", 天虚: "Thiên Hư",
  };
  const SAT = ["擎羊", "陀罗", "火星", "铃星", "地空", "地劫"];
  const BRIGHT = { 庙: "M", 旺: "V", 得地: "Đ", 利: "L", 平: "B", 不得地: "BĐ", 落陷: "H" };
  const BRIGHT_FULL = { 庙: "Miếu", 旺: "Vượng", 得地: "Đắc địa", 利: "Lợi", 平: "Bình", 不得地: "Bất đắc địa", 落陷: "Hãm" };
  const HOA = { 化禄: ["Lộc", "loc"], 化权: ["Quyền", "quyen"], 化科: ["Khoa", "khoa"], 化忌: ["Kỵ", "ky"] };
  const JU = { 水二局: "Thủy nhị cục", 木三局: "Mộc tam cục", 金四局: "Kim tứ cục", 土五局: "Thổ ngũ cục", 火六局: "Hỏa lục cục" };

  // Chính tinh — dịch từ references/stars.md (主星详解)
  const STAR_TEXT = {
    紫微: { core: "Đế tinh, chủ về tôn quý và năng lực lãnh đạo", plus: "độ lượng, có khí chất thủ lĩnh, giỏi tổ chức", minus: "tự tôn cao, dễ chủ quan, cần được tôn trọng",
      命宫: "Có khí chất lãnh đạo, lòng tự trọng rất cao.", 官禄: "Sự nghiệp có tầm vóc, hợp vị trí quản lý hoặc tự lập doanh nghiệp.", 财帛: "Tài vận tốt nhưng chi tiêu cũng lớn, coi trọng thể diện.", 夫妻: "Người phối ngẫu có điều kiện tốt, song đòi hỏi cũng cao." },
    天机: { core: "Quân sư tinh, chủ về trí tuệ và mưu lược", plus: "tư duy nhanh, giỏi phân tích và hoạch định, thích ứng tốt", minus: "nghĩ nhiều làm ít, dễ do dự, thiếu kiên định",
      命宫: "Thông minh, lanh lợi nhưng dễ suy tính nhiều hơn hành động.", 官禄: "Hợp công việc hoạch định, chiến lược, tư vấn.", 财帛: "Tiền vào ra nhanh, hợp hình thức đầu tư linh hoạt.", 夫妻: "Tình cảm nhiều biến chuyển, dễ có trắc trở." },
    太阳: { core: "Chủ về quang minh, bác ái và quý khí", plus: "nhiệt tình, rộng rãi, chính trực, giỏi giao tế", minus: "khó tụ tài, cho đi quá nhiều, dễ lao lực",
      命宫: "Cởi mở, hướng ngoại, thuận lợi cho công việc mang tính cộng đồng.", 官禄: "Hợp lĩnh vực phục vụ xã hội, quan hệ công chúng, giáo dục.", 财帛: "Kiếm được tiền nhưng khó giữ, thu rộng mà tích ít.", 夫妻: "Nam mệnh được vợ giúp, nữ mệnh được chồng trợ lực." },
    武曲: { core: "Tài tinh hàng đầu, chủ về cương nghị và thực tế", plus: "thực thi mạnh, quyết đoán, ý chí vững", minus: "dễ cô độc, ăn nói thẳng, kém mềm mỏng",
      命宫: "Cương trực, thực tế, hợp lĩnh vực tài chính.", 官禄: "Hợp tài chính, ngân hàng, quân đội – công an, kỹ thuật.", 财帛: "Chính tài rất tốt, giỏi quản lý tiền bạc.", 夫妻: "Tình cảm nghiêm túc, hôn nhân cần thời gian hòa hợp." },
    天同: { core: "Phúc tinh, chủ về ôn hòa và hưởng thụ", plus: "hiền hòa, dễ gần, có phúc, không tranh giành", minus: "thiếu chí tiến thủ, hay ỷ lại, chậm trễ",
      命宫: "Hiền lành, được lòng người nhưng thiếu quyết liệt.", 官禄: "Ít tham vọng, hợp công việc ổn định.", 财帛: "Đủ đầy để hưởng nhưng khó làm giàu lớn.", 夫妻: "Tình cảm êm ấm, có thể thiếu nồng nhiệt." },
    廉贞: { core: "Chủ về sự phức tạp, khéo xoay xở; là thứ đào hoa", plus: "tháo vát, ứng biến nhanh, giỏi giao tế, nhạy cảm", minus: "cảm xúc thất thường, cố chấp, dễ cực đoan",
      命宫: "Tính cách nhiều mặt, yêu ghét phân minh.", 官禄: "Hợp chính trị, quan hệ công chúng, nghệ thuật biểu diễn, pháp luật.", 财帛: "Tài vận lên xuống mạnh, thiên về đầu cơ.", 夫妻: "Tình cảm nồng nhiệt nhưng nhiều sóng gió." },
    天府: { core: "Kho tàng tinh, chủ về ổn định và giữ gìn", plus: "vững vàng, đáng tin, giỏi giữ thành quả", minus: "quá thận trọng, thiếu tinh thần khai phá",
      命宫: "Điềm đạm, chừng mực, có cảm giác an ổn bẩm sinh.", 官禄: "Hợp quản lý, tài chính – kế toán, quản trị kho quỹ.", 财帛: "Biết giữ tiền, năng lực quản lý tài chính tốt.", 夫妻: "Hôn nhân ổn định, người phối ngẫu biết vun vén." },
    太阴: { core: "Chủ về sự nhu hòa, thanh nhã và điền trạch", plus: "tinh tế, dịu dàng, có óc thẩm mỹ, vượng nhà đất", minus: "đa sầu đa cảm, thiếu quyết đoán",
      命宫: "Ôn hòa, kín đáo; nam mệnh hay được nữ quý nhân giúp đỡ.", 官禄: "Hợp nghệ thuật, thiết kế, bất động sản.", 财帛: "Có duyên với bất động sản, khả năng tích lũy tốt.", 夫妻: "Nam mệnh có người phối ngẫu dịu dàng; nữ mệnh trọng tình cảm." },
    贪狼: { core: "Chủ về dục vọng, tài nghệ và đào hoa", plus: "đa tài, giao tế rất giỏi, thích ứng nhanh", minus: "ham muốn nhiều, dễ sa vào hưởng lạc, thiếu tập trung",
      命宫: "Đa tài, quan hệ rộng, trải nghiệm sống phong phú.", 官禄: "Hợp nghệ thuật biểu diễn, quan hệ công chúng, kinh doanh, sáng tạo.", 财帛: "Có lộc bất ngờ nhưng chi tiêu cũng nhiều.", 夫妻: "Đào hoa vượng, tình cảm phong phú nhưng phức tạp." },
    巨门: { core: "Ám tinh, chủ về khẩu tài và năng lực phân tích", plus: "ăn nói giỏi, phân tích sắc bén, giỏi nghiên cứu", minus: "dễ vướng thị phi, đa nghi",
      命宫: "Khẩu tài tốt nhưng dễ chuốc thị phi.", 官禄: "Hợp luật sư, giảng dạy, truyền thông, nghiên cứu.", 财帛: "Kiếm tiền nhờ lời nói và chuyên môn.", 夫妻: "Hôn nhân dễ có khẩu thiệt, tranh cãi." },
    天相: { core: "Ấn tinh, chủ về phụ tá và cơm áo", plus: "giỏi điều phối, lịch thiệp, có gu", minus: "thiếu chính kiến, hay dựa dẫm, chú trọng bề ngoài",
      命宫: "Nho nhã, chú trọng hình ảnh, khéo giao tiếp.", 官禄: "Hợp thư ký, hành chính, ngoại giao.", 财帛: "Có tiền nhưng cần dựa vào nền tảng, tổ chức.", 夫妻: "Coi trọng chất lượng hôn nhân." },
    天梁: { core: "Ấm tinh, chủ về che chở và hóa giải", plus: "gặp dữ hóa lành, chính trực, chín chắn", minus: "thanh cao quá mức, thích dạy người, tình cảm nhạt",
      命宫: "Có khả năng hóa giải tai ách, hợp việc thiện nguyện, cộng đồng.", 官禄: "Hợp y tế, pháp luật, tôn giáo, công tác xã hội.", 财帛: "Không quá coi trọng vật chất, thiên về liêm chính.", 夫妻: "Hôn nhân ít lãng mạn." },
    七杀: { core: "Tướng tinh, chủ về xông pha và biến động", plus: "quyết liệt, dám khai phá, không ngại khó", minus: "cô ngạo, nóng vội, quan hệ dễ căng thẳng",
      命宫: "Cuộc đời nhiều thăng trầm, lên xuống mạnh.", 官禄: "Hợp quân đội – công an, sự nghiệp khai phá, thi đấu.", 财帛: "Có thể kiếm lớn và cũng có thể mất lớn.", 夫妻: "Hôn nhân nhiều biến động." },
    破军: { core: "Chủ về phá cũ lập mới, tiên phong", plus: "khai sáng mạnh, dám cải cách, không câu nệ", minus: "thiếu ổn định, hao tổn, cả thèm chóng chán",
      命宫: "Đời nhiều thay đổi, phá cũ dựng mới.", 官禄: "Hợp lĩnh vực khai phá, nghiên cứu, cải cách.", 财帛: "Tiền vào ra nhanh, mức hao tổn lớn.", 夫妻: "Hôn nhân nhiều biến động." },
  };

  // Phụ tinh tại Mệnh — dịch từ references/stars.md (辅星、六煞星)
  const MINOR_TEXT = {
    文昌: "thông minh, ham học, diễn đạt tốt", 文曲: "đa tài, có năng khiếu nghệ thuật", 左辅: "có quý nhân, làm việc được trợ lực",
    右弼: "có quý nhân, được giúp đỡ một cách mềm mỏng", 天魁: "gặp khó có người giúp, thuận thi cử", 天钺: "có quý nhân giúp đỡ âm thầm",
    禄存: "có nguồn thu ổn định nhưng dễ cảm thấy cô đơn", 天马: "nhiều di chuyển, thay đổi",
    擎羊: "cứng rắn, hay tranh đấu, cần đề phòng va chạm, thương tích", 陀罗: "dễ trì hoãn, vướng mắc, hao tổn ngầm",
    火星: "nóng nảy, hay bộc phát", 铃星: "bề ngoài điềm tĩnh nhưng dễ lo âu bên trong",
    地空: "ý tưởng độc đáo nhưng dễ thiếu thực tế", 地劫: "dễ hao tài nhưng nhạy bén, giàu trực giác",
  };

  // Tứ hóa nhập 12 cung — dịch từ references/sihua.md
  const HOA_TEXT = {
    化禄: { 命宫: "nhiều phúc lộc, tính lạc quan, được lòng người", 兄弟: "anh chị em hòa thuận, có trợ lực", 夫妻: "tình cảm thuận lợi, người phối ngẫu mang lại tài lộc hoặc trợ giúp", 子女: "con cái có tiền đồ, vận đầu tư tốt", 财帛: "tài vận hanh thông, kiếm tiền thuận lợi", 疾厄: "thể trạng nền tảng tốt", 迁移: "ra ngoài gặp quý nhân, phát triển xa thuận lợi", 交友: "bạn bè nhiều và có ích, cấp dưới đắc lực", 官禄: "sự nghiệp thuận lợi, công việc có thành tựu", 田宅: "vượng nhà đất, nơi ở tốt", 福德: "tinh thần vui vẻ, sở thích phong phú", 父母: "được cha mẹ, bề trên nâng đỡ; việc học tốt" },
    化权: { 命宫: "có chủ kiến, tính mạnh, năng lực lãnh đạo", 兄弟: "có tiếng nói trong anh em, cần khéo dung hòa", 夫妻: "người phối ngẫu giỏi nhưng mạnh mẽ, dễ giằng co quyền quyết định", 子女: "con cái cá tính; bản thân có xu hướng kiểm soát con", 财帛: "kiếm tiền bằng nỗ lực, quản lý tài chính giỏi", 疾厄: "thể lực tốt nhưng hay gắng sức", 迁移: "có ảnh hưởng ở bên ngoài, địa vị xã hội cao", 交友: "giữ vai trò dẫn dắt trong bạn bè", 官禄: "có thực quyền trong công việc", 田宅: "nắm quyền quyết định việc nhà", 福德: "nội tâm vững vàng, tự chủ", 父母: "cha mẹ mạnh mẽ, hoặc bản thân hiếu thuận, có trách nhiệm" },
    化科: { 命宫: "nho nhã, có khí chất, có quý nhân", 兄弟: "anh em có người học giỏi, danh tiếng tốt", 夫妻: "người phối ngẫu có học thức, khí chất", 子女: "con cái sáng dạ, ham học", 财帛: "kiếm tiền nhờ uy tín, tài vận bình ổn", 疾厄: "bệnh nhẹ dễ hóa giải, gặp thầy thuốc giỏi", 迁移: "ra ngoài có danh tiếng, ứng xử chừng mực", 交友: "bạn bè có phẩm chất, giao du tầng lớp tốt", 官禄: "sự nghiệp có danh vọng", 田宅: "nơi ở thanh nhã", 福德: "đời sống tinh thần phong phú, có gu văn hóa", 父母: "cha mẹ có học, bản thân học hành thuận lợi" },
    化忌: { 命宫: "dễ phiền muộn, cố chấp — mặt khác là người nghiêm túc, tận tâm", 兄弟: "dễ có hiềm khích, duyên anh em mỏng", 夫妻: "tình cảm nhiều thử thách, vì quá để tâm nên dễ vướng bận", 子女: "lo lắng nhiều cho con cái", 财帛: "tài chính có trở ngại, dễ hao tán", 疾厄: "có vấn đề sức khỏe cần lưu ý", 迁移: "ra ngoài vất vả, kém thuận", 交友: "bạn bè có thể gây phiền lụy, cần thận trọng khi chọn người", 官禄: "công việc nhiều trắc trở, áp lực lớn — mặt khác là người tận tâm", 田宅: "cần lưu ý việc nhà đất, gia đạo kém yên", 福德: "nội tâm dễ lo âu, bất an", 父母: "cần vun đắp quan hệ với cha mẹ, bề trên" },
  };

  const TRANG_SINH_TEXT = {
    "Tràng Sinh": "sinh khí dồi dào, khởi đầu thuận lợi", "Mộc Dục": "chưa ổn định, ưa làm đẹp, dễ vướng đào hoa",
    "Quan Đới": "trưởng thành, hướng tới danh vị", "Lâm Quan": "vững vàng, đang trên đà đi lên", "Đế Vượng": "khí thế cực thịnh, năng lực mạnh",
    "Suy": "khí lực bắt đầu giảm, nên giữ hơn tiến", "Bệnh": "sức lực yếu, cần chú ý giữ gìn", "Tử": "khí trầm lắng, thiên về tĩnh",
    "Mộ": "thiên về tích tụ, cất giữ, kín đáo", "Tuyệt": "dễ đứt đoạn, phải làm lại từ đầu", "Thai": "đang hình thành, ấp ủ", "Dưỡng": "được nuôi dưỡng, chuẩn bị cho giai đoạn mới",
  };
  const CUC_MENH_TEXT = {
    cuc_sinh_menh: "Cục sinh Mệnh — được hoàn cảnh hỗ trợ, thường được xem là tốt.",
    binh_hoa: "Cục và Mệnh cùng hành — bình hòa, ổn định.",
    menh_sinh_cuc: "Mệnh sinh Cục — phải tự bỏ nhiều công sức, dễ hao tâm lực.",
    menh_khac_cuc: "Mệnh khắc Cục — vẫn chủ động được hoàn cảnh nhưng vất vả, cần nỗ lực nhiều.",
    cuc_khac_menh: "Cục khắc Mệnh — thường được xem là kém thuận nhất, dễ gặp trở ngại từ hoàn cảnh; cần bền bỉ.",
  };
  const THAN_TEXT = {
    命宫: "Mệnh Thân đồng cung: tính cách nhất quán, cuộc đời chủ yếu do bản thân tự quyết.",
    夫妻: "Thân cư Phu Thê: hậu vận chịu ảnh hưởng lớn từ hôn nhân và người phối ngẫu.",
    财帛: "Thân cư Tài Bạch: coi trọng tiền bạc; hậu vận gắn với chuyện tài chính.",
    迁移: "Thân cư Thiên Di: hay di chuyển, phát triển nhờ môi trường bên ngoài.",
    官禄: "Thân cư Quan Lộc: hậu vận gắn chặt với sự nghiệp, công danh.",
    福德: "Thân cư Phúc Đức: chú trọng đời sống tinh thần; hậu vận thiên về an hưởng.",
  };

  const gz = s => STEM[s[0]] + " " + BR[s[1]];
  const stars = p => p.major_stars.map(s => STAR[s.name]).join(", ");
  const brightNote = br =>
    ["庙", "旺"].includes(br) ? "sáng sủa, mặt tích cực phát huy rõ"
      : ["得地", "利"].includes(br) ? "phát huy ở mức khá"
      : br === "平" ? "lực sao trung bình, cần cát tinh hỗ trợ"
      : "hãm địa, mặt hạn chế dễ bộc lộ; gặp Hóa Lộc, Hóa Quyền có thể bù đắp";
  const opp = (palaces, p) => palaces.find(x => x.branch === "子丑寅卯辰巳午未申酉戌亥"[("子丑寅卯辰巳午未申酉戌亥".indexOf(p.branch) + 6) % 12]);

  function palaceLine(d, key) {
    const P = d.chart.palaces, p = P.find(x => x.name === key);
    let src = p, borrowed = false;
    if (!p.major_stars.length) { src = opp(P, p); borrowed = true; }
    const parts = src.major_stars.map(s => STAR_TEXT[s.name][key] || STAR_TEXT[s.name].core + ".");
    const head = borrowed ? `Vô chính diệu, mượn ${stars(src)} từ cung ${PAL[src.name]}` : stars(p);
    return `<b>${PAL[key]}</b> (${head}): ${parts.join(" ")}`;
  }

  function interpret(d) {
    const c = d.chart, vn = d.vn, P = c.palaces, h = d.horoscope;
    const ming = P[0];
    const out = [];

    // 1. Tổng quan
    out.push(`<h4>1. Tổng quan</h4><ul>
      <li>${vn.am_duong}, ${vn.am_duong_ly === "thuan" ? "Âm Dương thuận lý — thường được xem là thuận lợi, ít gặp trái ngang." : "Âm Dương nghịch lý — dễ gặp việc trái ý, cần kiên nhẫn hơn."}</li>
      <li>Bản mệnh <b>${vn.ban_menh.name}</b> (hành ${vn.ban_menh.element}), <b>${JU[c.wuxing_ju.name]}</b> (hành ${vn.cuc_element}). ${CUC_MENH_TEXT[vn.cuc_menh]}</li>
      <li>${THAN_TEXT[c.shen_gong.palace] || ""}</li></ul>`);

    // 2. Cung Mệnh
    const li = [];
    if (ming.major_stars.length) {
      for (const s of ming.major_stars) {
        const t = STAR_TEXT[s.name];
        li.push(`<b>${STAR[s.name]}</b> (${BRIGHT_FULL[s.brightness]}) — ${t.core}; ${brightNote(s.brightness)}. Ưu điểm: ${t.plus}. Cần lưu ý: ${t.minus}.`);
      }
    } else {
      const o = opp(P, ming);
      li.push(`Mệnh <b>vô chính diệu</b>: mượn chính tinh cung Thiên Di (${stars(o)}) để luận; tính cách dễ chịu ảnh hưởng của môi trường, linh hoạt nhưng cần xác định rõ định hướng.`);
      for (const s of o.major_stars) li.push(`<b>${STAR[s.name]}</b> (xung chiếu) — ${STAR_TEXT[s.name].core}.`);
    }
    const minors = ming.minor_stars.filter(s => MINOR_TEXT[s.name]);
    if (minors.length) li.push("Phụ tinh tại Mệnh: " + minors.map(s => `${STAR[s.name]} (${MINOR_TEXT[s.name]})`).join("; ") + ".");
    const ts = vn.trang_sinh[ming.branch];
    li.push(`Mệnh gặp <b>${ts}</b>: ${TRANG_SINH_TEXT[ts]}.`);
    const tt = [];
    if (vn.triet.includes(ming.branch)) tt.push("Triệt");
    if (vn.tuan.includes(ming.branch)) tt.push("Tuần");
    if (tt.length) li.push(`Mệnh gặp <b>${tt.join(" và ")}</b>: sức sao trong cung bị ngăn lại, cả tốt lẫn xấu đều giảm. ${tt.includes("Triệt") ? "Triệt tác động mạnh ở tiền vận (khoảng trước 30 tuổi), thường phải tự lập, khởi đầu vất vả." : "Tuần tác động nhẹ hơn nhưng kéo dài."}${ming.major_stars.some(s => ["落陷", "不得地"].includes(s.brightness)) ? " Chính tinh hãm gặp Tuần/Triệt lại được giảm bớt mặt xấu." : ""}`);
    out.push(`<h4>2. Cung Mệnh — ${gz(ming.ganzhi)}</h4><ul>${li.map(x => `<li>${x}</li>`).join("")}</ul>`);

    // 3. Các cung trọng yếu
    out.push(`<h4>3. Các cung trọng yếu</h4><ul>${["官禄", "财帛", "夫妻"].map(k => `<li>${palaceLine(d, k)}</li>`).join("")}
      <li>${(() => { const p = P.find(x => x.name === "迁移"); return `<b>Thiên Di</b> (${stars(p) || "vô chính diệu"}): ${p.major_stars.map(s => STAR_TEXT[s.name].core).join("; ") || "chịu ảnh hưởng từ cung Mệnh xung chiếu"} — thể hiện cách ứng xử và cơ hội khi ra ngoài xã hội.`; })()}</li>
      <li>${(() => { const p = P.find(x => x.name === "福德"); return `<b>Phúc Đức</b> (${stars(p) || "vô chính diệu"}): đời sống tinh thần mang màu sắc ${p.major_stars.map(s => STAR_TEXT[s.name].plus.split(",")[0]).join(", ") || "của các sao xung chiếu"}; Phúc Đức gặp ${vn.trang_sinh[p.branch]}.`; })()}</li></ul>`);

    // 4. Tứ hóa năm sinh
    out.push(`<h4>4. Tứ hóa năm sinh (ảnh hưởng suốt đời)</h4><ul>${c.year_sihua.map(x =>
      `<li><b>${STAR[x.star]} Hóa ${HOA[x.type][0]}</b> tại ${PAL[x.palace]}: ${HOA_TEXT[x.type][x.palace]}.</li>`).join("")}</ul>`);

    // 5. Vận hạn
    if (h) {
      const v = [];
      if (h.decadal) {
        const dp = P.find(x => x.name === h.decadal.natal_palace);
        v.push(`<b>Đại hạn ${h.decadal.start_age}–${h.decadal.end_age} tuổi</b> đóng tại cung ${PAL[dp.name]} (${stars(dp) || "vô chính diệu"}): mười năm này trọng tâm xoay quanh ${PAL_DOMAIN[dp.name]}.`);
      }
      const yp = P.find(x => x.name === h.yearly.ming_on_natal_palace);
      v.push(`<b>Năm ${h.query_lunar_year} (${gz(h.yearly.ganzhi)})</b>, ${h.nominal_age} tuổi âm: Mệnh lưu niên tại cung ${PAL[yp.name]} (${stars(yp) || "vô chính diệu"}) — năm nay chú ý nhiều đến ${PAL_DOMAIN[yp.name]}.`);
      const layers = [["Gốc", c.year_sihua], ["ĐH", h.decadal ? h.decadal.sihua : []], ["LN", h.yearly.sihua]];
      const by = {};
      for (const [lay, list] of layers) for (const x of list) (by[x.palace] = by[x.palace] || []).push([lay, x.type]);
      for (const [pal, arr] of Object.entries(by)) {
        const n = t => arr.filter(a => a[1] === t).length;
        if (n("化忌") >= 2) v.push(`Cung ${PAL[pal]} có <b>song Kỵ</b> (${arr.filter(a => a[1] === "化忌").map(a => a[0]).join(" + ")}): áp lực về ${PAL_DOMAIN[pal]} tăng cao, nên thận trọng.`);
        else if (n("化忌") && n("化禄")) v.push(`Cung ${PAL[pal]} có <b>Lộc – Kỵ cùng hội</b>: chuyện ${PAL_DOMAIN[pal]} có được có mất, cần cân nhắc kỹ.`);
        if (n("化禄") >= 2) v.push(`Cung ${PAL[pal]} có <b>song Lộc</b>: thuận lợi rõ rệt về ${PAL_DOMAIN[pal]}.`);
      }
      const ky = h.yearly.sihua.find(x => x.type === "化忌"), loc = h.yearly.sihua.find(x => x.type === "化禄");
      v.push(`Lưu niên: ${STAR[loc.star]} Hóa Lộc nhập ${PAL[loc.palace]} — ${HOA_TEXT["化禄"][loc.palace]}; ${STAR[ky.star]} Hóa Kỵ nhập ${PAL[ky.palace]} — ${HOA_TEXT["化忌"][ky.palace]}.`);
      out.push(`<h4>5. Vận hạn</h4><ul>${v.map(x => `<li>${x}</li>`).join("")}</ul>`);
    }

    out.push(`<p class="disclaimer">Phần giải nghĩa được tổng hợp tự động theo quy tắc, chỉ nêu xu hướng chính. Tử Vi là hệ thống mệnh lý truyền thống, mang tính tham khảo; lá số không phải định mệnh, và không thay thế tư vấn y tế, pháp lý hay tài chính.</p>`);
    return out.join("");
  }

  root.TuViVN = { STEM, BR, PAL, PAL_DOMAIN, STAR, SAT, BRIGHT, BRIGHT_FULL, HOA, JU, STAR_TEXT, HOA_TEXT, TRANG_SINH_TEXT, gz, interpret };
})(typeof globalThis !== "undefined" ? globalThis : this);
