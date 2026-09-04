export type LanguageCode = "ja" | "en" | "zh" | "vi";

export const languages: Array<{ code: LanguageCode; label: string; shortLabel: string; htmlLang: string }> = [
  { code: "ja", label: "日本語", shortLabel: "JP", htmlLang: "ja" },
  { code: "en", label: "English", shortLabel: "EN", htmlLang: "en" },
  { code: "zh", label: "中文", shortLabel: "中文", htmlLang: "zh-CN" },
  { code: "vi", label: "Tiếng Việt", shortLabel: "VI", htmlLang: "vi" }
];

type TranslationSet = Record<LanguageCode, string>;

const phraseSets: TranslationSet[] = [
  { ja: "イベント", en: "Events", zh: "活动", vi: "Sự kiện" },
  { ja: "カレンダー", en: "Calendar", zh: "日历", vi: "Lịch" },
  { ja: "検索", en: "Search", zh: "搜索", vi: "Tìm kiếm" },
  { ja: "イベント作成", en: "Create Event", zh: "创建活动", vi: "Tạo sự kiện" },
  { ja: "ログイン", en: "Login", zh: "登录", vi: "Đăng nhập" },
  { ja: "ログアウト", en: "Logout", zh: "退出登录", vi: "Đăng xuất" },
  { ja: "AIイベントハブ", en: "AI Event Hub", zh: "AI 活动中心", vi: "Trung tâm sự kiện AI" },
  { ja: "素晴らしいAIイベントを見つける", en: "Discover Amazing AI Events", zh: "发现精彩的 AI 活动", vi: "Khám phá các sự kiện AI nổi bật" },
  {
    ja: "世界中のAIコミュニティとつながり、学び、イベントに参加できます。主催者はイベントを作成し、画像や資料も公開できます。",
    en: "Connect with AI communities around the world, learn, and join events. Organizers can create events and publish images and materials.",
    zh: "连接全球 AI 社群，学习并参加活动。主办方可以创建活动并发布图片和资料。",
    vi: "Kết nối với cộng đồng AI toàn cầu, học hỏi và tham gia sự kiện. Ban tổ chức có thể tạo sự kiện và đăng hình ảnh, tài liệu."
  },
  { ja: "イベントを検索...", en: "Search events...", zh: "搜索活动...", vi: "Tìm sự kiện..." },
  { ja: "カテゴリー", en: "Category", zh: "类别", vi: "Danh mục" },
  { ja: "地域", en: "Region", zh: "地区", vi: "Khu vực" },
  { ja: "イベントを見る", en: "Browse Events", zh: "浏览活动", vi: "Xem sự kiện" },
  { ja: "近日開催", en: "Upcoming Events", zh: "即将举行", vi: "Sắp diễn ra" },
  { ja: "イベントタイムライン", en: "Event Timeline", zh: "活动时间线", vi: "Dòng thời gian sự kiện" },
  { ja: "日付ごとに注目イベントをタイムライン表示します。", en: "Highlighted events are shown on a timeline by date.", zh: "按日期在时间线上展示重点活动。", vi: "Các sự kiện nổi bật được hiển thị theo dòng thời gian." },
  { ja: "公開中のイベントはまだありません。", en: "There are no published events yet.", zh: "目前还没有已发布的活动。", vi: "Chưa có sự kiện nào được công bố." },
  { ja: "注目ポスター", en: "Featured Poster", zh: "精选海报", vi: "Áp phích nổi bật" },
  { ja: "AIコミュニティイベント", en: "AI community event", zh: "AI 社群活动", vi: "Sự kiện cộng đồng AI" },
  { ja: "イベントに参加", en: "Join Event", zh: "参加活动", vi: "Tham gia sự kiện" },
  { ja: "カレンダーに追加", en: "Add to Calendar", zh: "添加到日历", vi: "Thêm vào lịch" },
  { ja: "すべてのイベント", en: "All Events", zh: "全部活动", vi: "Tất cả sự kiện" },
  { ja: "すべてのAIイベントを確認できます。", en: "Explore every AI event currently available.", zh: "查看当前所有 AI 活动。", vi: "Xem tất cả sự kiện AI hiện có." },
  { ja: "すべて見る", en: "View All Events", zh: "查看全部活动", vi: "Xem tất cả" },
  { ja: "条件に一致するイベントはありません。", en: "No events match your filters.", zh: "没有符合筛选条件的活动。", vi: "Không có sự kiện phù hợp với bộ lọc." },
  { ja: "詳細を見る", en: "View Details", zh: "查看详情", vi: "Xem chi tiết" },
  { ja: "参加者", en: "Participants", zh: "参与者", vi: "Người tham gia" },
  { ja: "オンライン", en: "Online", zh: "线上", vi: "Trực tuyến" },
  { ja: "オンライン / 未定", en: "Online / TBA", zh: "线上 / 待定", vi: "Trực tuyến / Sẽ cập nhật" },
  { ja: "無料", en: "Free", zh: "免费", vi: "Miễn phí" },
  { ja: "言語", en: "Language", zh: "语言", vi: "Ngôn ngữ" },
  { ja: "アクセンチュアからの情報配信設定サイト", en: "Information Delivery Settings Site", zh: "信息推送设置网站", vi: "Trang cài đặt nhận thông tin" },
  { ja: "採用情報", en: "Careers", zh: "招聘信息", vi: "Tuyển dụng" },
  { ja: "会社情報", en: "Company", zh: "公司信息", vi: "Công ty" },
  { ja: "お知らせ", en: "News", zh: "通知", vi: "Thông báo" },
  { ja: "お問い合わせ", en: "Contact", zh: "联系我们", vi: "Liên hệ" },
  { ja: "グローバルオフィス", en: "Global Office", zh: "全球办公室", vi: "Văn phòng toàn cầu" },
  { ja: "サイトマップ", en: "Site Map", zh: "网站地图", vi: "Sơ đồ trang" },
  { ja: "プライバシーポリシー", en: "Privacy Policy", zh: "隐私政策", vi: "Chính sách bảo mật" },
  { ja: "情報セキュリティ基本方針", en: "Information Security Policy", zh: "信息安全基本方针", vi: "Chính sách bảo mật thông tin" },
  { ja: "個人情報保護に関する基本方針", en: "Personal Information Protection Policy", zh: "个人信息保护基本方针", vi: "Chính sách bảo vệ thông tin cá nhân" },
  { ja: "使用条項", en: "Terms of Use", zh: "使用条款", vi: "Điều khoản sử dụng" },
  { ja: "Cookieポリシー／設定", en: "Cookie Policy / Settings", zh: "Cookie 政策 / 设置", vi: "Chính sách Cookie / Cài đặt" },
  { ja: "アクセシビリティステートメント", en: "Accessibility Statement", zh: "无障碍声明", vi: "Tuyên bố khả năng truy cập" }
];

const phraseMap = new Map<string, TranslationSet>();

for (const set of phraseSets) {
  for (const value of Object.values(set)) {
    phraseMap.set(value.toLowerCase(), set);
  }
}

export function getLanguage(code: string | null | undefined): LanguageCode {
  return languages.some((language) => language.code === code) ? (code as LanguageCode) : "ja";
}

export function translatePhrase(value: string, language: LanguageCode) {
  const trimmed = value.trim();
  if (!trimmed) return value;

  const exact = phraseMap.get(trimmed.toLowerCase());
  if (exact) return value.replace(trimmed, exact[language]);

  let translated = trimmed;
  for (const set of phraseSets) {
    for (const source of Object.values(set)) {
      translated = translated.split(source).join(set[language]);
    }
  }

  return value.replace(trimmed, translated);
}
