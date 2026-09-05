export type LanguageCode = "ja" | "en" | "zh" | "vi";

export const languages: Array<{ code: LanguageCode; label: string; shortLabel: string; htmlLang: string }> = [
  { code: "ja", label: "日本語", shortLabel: "JP", htmlLang: "ja" },
  { code: "en", label: "English", shortLabel: "EN", htmlLang: "en" },
  { code: "zh", label: "中文", shortLabel: "ZH", htmlLang: "zh-CN" },
  { code: "vi", label: "Tiếng Việt", shortLabel: "VI", htmlLang: "vi" }
];

type TranslationSet = Record<LanguageCode, string>;
type TranslationEntry = TranslationSet & {
  sources?: string[];
};

const phraseSets: TranslationEntry[] = [
  { ja: "言語", en: "Language", zh: "语言", vi: "Ngôn ngữ", sources: ["Language"] },
  { ja: "検索", en: "Search", zh: "搜索", vi: "Tìm kiếm", sources: ["Search", "さがす"] },
  { ja: "イベント", en: "Events", zh: "活动", vi: "Sự kiện", sources: ["Events", "イベント"] },
  { ja: "カレンダー", en: "Calendar", zh: "日历", vi: "Lịch", sources: ["Calendar", "カレンダー"] },
  { ja: "イベント作成", en: "Create Event", zh: "创建活动", vi: "Tạo sự kiện", sources: ["Create Event", "イベント作成"] },
  { ja: "ログイン", en: "Login", zh: "登录", vi: "Đăng nhập", sources: ["Login"] },
  { ja: "ログアウト", en: "Logout", zh: "退出登录", vi: "Đăng xuất", sources: ["Logout"] },
  { ja: "プロフィール", en: "Profile", zh: "个人资料", vi: "Hồ sơ", sources: ["Profile"] },
  { ja: "管理者", en: "Admin", zh: "管理员", vi: "Quản trị", sources: ["Admin"] },

  { ja: "AIイベントハブ", en: "AI Event Hub", zh: "AI 活动中心", vi: "Trung tâm sự kiện AI", sources: ["AI Event Hub"] },
  { ja: "素晴らしいAIイベントを見つける", en: "Discover Amazing AI Events", zh: "发现精彩的 AI 活动", vi: "Khám phá các sự kiện AI nổi bật", sources: ["Discover Amazing AI Events"] },
  { ja: "素晴らしいイベントを見つける", en: "Discover Amazing", zh: "发现精彩活动", vi: "Khám phá", sources: ["Discover Amazing"] },
  { ja: "AIイベント", en: "AI Events", zh: "AI 活动", vi: "sự kiện AI", sources: ["AI Events"] },
  {
    ja: "世界中のAIコミュニティとつながり、学び、イベントに参加できます。主催者はイベントを作成し、画像や資料も公開できます。",
    en: "Connect with AI communities around the world, learn, and join events. Organizers can create events and publish images and materials.",
    zh: "与世界各地的 AI 社群连接、学习并参加活动。主办方可以创建活动并发布图片和资料。",
    vi: "Kết nối với cộng đồng AI trên toàn thế giới, học hỏi và tham gia sự kiện. Ban tổ chức có thể tạo sự kiện, đăng hình ảnh và tài liệu.",
    sources: [
      "Connect with AI communities around the world, learn, and join events. Organizers can create events and publish images and materials."
    ]
  },
  { ja: "イベントを検索...", en: "Search events...", zh: "搜索活动...", vi: "Tìm sự kiện...", sources: ["Search events..."] },
  { ja: "すべてのイベントを検索...", en: "Search all events...", zh: "搜索所有活动...", vi: "Tìm tất cả sự kiện...", sources: ["Search all events..."] },
  { ja: "カテゴリー", en: "Category", zh: "分类", vi: "Danh mục", sources: ["Category"] },
  { ja: "地域", en: "Region", zh: "地区", vi: "Khu vực", sources: ["Region"] },
  { ja: "イベントを見る", en: "Browse Events", zh: "浏览活动", vi: "Xem sự kiện", sources: ["Browse Events"] },
  { ja: "近日開催", en: "Upcoming Events", zh: "即将举行", vi: "Sắp diễn ra", sources: ["Upcoming Events"] },
  { ja: "イベントタイムライン", en: "Event Timeline", zh: "活动时间线", vi: "Dòng thời gian sự kiện", sources: ["Event Timeline"] },
  { ja: "日付ごとに注目イベントをタイムライン表示します。", en: "Highlighted events are shown on a timeline by date.", zh: "重点活动会按日期显示在时间线上。", vi: "Các sự kiện nổi bật được hiển thị theo dòng thời gian.", sources: ["Highlighted events are shown on a timeline by date."] },
  { ja: "注目ポスター", en: "Featured Poster", zh: "精选海报", vi: "Áp phích nổi bật", sources: ["Featured Poster"] },
  { ja: "AIコミュニティイベント", en: "AI community event", zh: "AI 社群活动", vi: "Sự kiện cộng đồng AI", sources: ["AI community event"] },
  { ja: "イベントに参加", en: "Join Event", zh: "参加活动", vi: "Tham gia sự kiện", sources: ["Join Event"] },
  { ja: "カレンダーに追加", en: "Add to Calendar", zh: "添加到日历", vi: "Thêm vào lịch", sources: ["Add to Calendar"] },
  { ja: "すべてのイベント", en: "All Events", zh: "所有活动", vi: "Tất cả sự kiện", sources: ["All Events"] },
  { ja: "すべてのAIイベントを確認できます。", en: "Explore every AI event currently available.", zh: "查看当前所有 AI 活动。", vi: "Xem tất cả sự kiện AI hiện có.", sources: ["Explore every AI event currently available."] },
  { ja: "すべて見る", en: "View All Events", zh: "查看全部", vi: "Xem tất cả", sources: ["View All Events"] },
  { ja: "詳細を見る", en: "View Details", zh: "查看详情", vi: "Xem chi tiết", sources: ["View Details"] },
  { ja: "参加者", en: "Participants", zh: "参与者", vi: "Người tham gia", sources: ["Participants"] },
  { ja: "オンライン", en: "Online", zh: "线上", vi: "Trực tuyến", sources: ["Online"] },
  { ja: "オンライン / 未定", en: "Online / TBA", zh: "线上 / 待定", vi: "Trực tuyến / Sẽ cập nhật", sources: ["Online / TBA"] },
  { ja: "無料", en: "Free", zh: "免费", vi: "Miễn phí", sources: ["Free"] },
  { ja: "公開中のイベントはまだありません。", en: "There are no published events yet.", zh: "暂无已发布活动。", vi: "Chưa có sự kiện nào được công bố.", sources: ["There are no published events yet."] },
  { ja: "条件に一致するイベントはありません。", en: "No events match your filters.", zh: "没有符合条件的活动。", vi: "Không có sự kiện phù hợp với bộ lọc.", sources: ["No events match your filters.", "No events found."] },

  { ja: "アーカイブ", en: "Event Archive", zh: "活动归档", vi: "Lưu trữ sự kiện", sources: ["Event Archive"] },
  { ja: "過去のイベント", en: "Past Event", zh: "过去活动", vi: "Sự kiện đã qua", sources: ["Past Event"] },
  { ja: "今後のイベント", en: "Upcoming", zh: "即将开始", vi: "Sắp tới", sources: ["Upcoming"] },

  { ja: "月", en: "Month", zh: "月", vi: "Tháng", sources: ["Month", "Tháng"] },
  { ja: "週", en: "Week", zh: "周", vi: "Tuần", sources: ["Week", "Tuần"] },
  { ja: "表示", en: "View", zh: "查看", vi: "Xem", sources: ["View", "XEM"] },
  { ja: "前へ", en: "Previous", zh: "上一页", vi: "Trước", sources: ["Previous"] },
  { ja: "次へ", en: "Next", zh: "下一页", vi: "Sau", sources: ["Next"] },
  { ja: "予定なし", en: "No events", zh: "暂无活动", vi: "Không có sự kiện", sources: ["No events"] },
  { ja: "日付を押すと週表示へ移動します。イベントのロゴまたはタイトルを押すと詳細ページを開きます。", en: "Select a date to switch to that week. Select an event logo or title to open the event page.", zh: "点击日期切换到该周。点击活动图标或标题可打开活动详情。", vi: "Bấm vào ngày để xem tuần đó. Bấm logo hoặc tiêu đề sự kiện để mở trang chi tiết.", sources: ["Select a date to switch to that week. Select an event logo or title to open the event page."] },

  { ja: "承認済み", en: "Approved", zh: "已批准", vi: "Đã duyệt", sources: ["Approved"] },
  { ja: "承認待ち", en: "Pending approval", zh: "待批准", vi: "Chờ duyệt", sources: ["Pending approval"] },
  { ja: "却下", en: "Rejected", zh: "已拒绝", vi: "Từ chối", sources: ["Rejected"] },
  { ja: "承認", en: "Approve", zh: "批准", vi: "Duyệt", sources: ["Approve"] },
  { ja: "削除", en: "Delete", zh: "删除", vi: "Xóa", sources: ["Delete"] },
  { ja: "閉じる", en: "Close", zh: "关闭", vi: "Đóng", sources: ["Close"] },
  { ja: "キャンセル", en: "Cancel", zh: "取消", vi: "Hủy", sources: ["Cancel"] },
  { ja: "送信", en: "Send", zh: "发送", vi: "Gửi", sources: ["Send"] },
  { ja: "送信中...", en: "Sending...", zh: "发送中...", vi: "Đang gửi...", sources: ["Sending..."] },
  { ja: "名前", en: "Name", zh: "姓名", vi: "Tên", sources: ["Name"] },
  { ja: "会社", en: "Company", zh: "公司", vi: "Công ty", sources: ["Company"] },
  { ja: "役職", en: "Job Title", zh: "职位", vi: "Chức danh", sources: ["Job Title"] },
  { ja: "電話番号", en: "Phone Number", zh: "电话号码", vi: "Số điện thoại", sources: ["Phone Number"] },
  { ja: "保存", en: "Save Profile", zh: "保存资料", vi: "Lưu hồ sơ", sources: ["Save Profile"] },
  { ja: "保存中...", en: "Saving...", zh: "保存中...", vi: "Đang lưu...", sources: ["Saving..."] },
  { ja: "メールアドレス", en: "Email address", zh: "邮箱地址", vi: "Địa chỉ email", sources: ["Email address", "Email"] },
  { ja: "パスワード", en: "Password", zh: "密码", vi: "Mật khẩu", sources: ["Password"] },
  { ja: "Googleでログイン", en: "Log in with Google", zh: "使用 Google 登录", vi: "Đăng nhập bằng Google", sources: ["Log in with Google"] },
  { ja: "Googleで登録", en: "Register with Google", zh: "使用 Google 注册", vi: "Đăng ký bằng Google", sources: ["Register with Google", "Continue with Google"] },
  { ja: "アカウント作成", en: "Create Account", zh: "创建账号", vi: "Tạo tài khoản", sources: ["Create Account"] },
  { ja: "作成中...", en: "Creating...", zh: "创建中...", vi: "Đang tạo...", sources: ["Creating...", "Creating account..."] },
  { ja: "メンバー", en: "Member", zh: "成员", vi: "Thành viên", sources: ["Member"] },
  { ja: "主催者", en: "Organizer", zh: "主办方", vi: "Ban tổ chức", sources: ["Organizer"] },
  { ja: "表示名", en: "Display name", zh: "显示名称", vi: "Tên hiển thị", sources: ["Display name"] },

  { ja: "日付", en: "Date", zh: "日期", vi: "Ngày", sources: ["Date"] },
  { ja: "時間", en: "Time", zh: "时间", vi: "Thời gian", sources: ["Time"] },
  { ja: "場所", en: "Location", zh: "地点", vi: "Địa điểm", sources: ["Location"] },
  { ja: "価格", en: "Price", zh: "价格", vi: "Giá", sources: ["Price"] },
  { ja: "開始", en: "Start", zh: "开始", vi: "Bắt đầu", sources: ["Start"] },
  { ja: "終了", en: "End", zh: "结束", vi: "Kết thúc", sources: ["End"] },
  { ja: "イベント名", en: "Event Name", zh: "活动名称", vi: "Tên sự kiện", sources: ["Event Name"] },
  { ja: "説明を追加", en: "Add description", zh: "添加说明", vi: "Thêm mô tả", sources: ["Add description"] },
  { ja: "会場または住所", en: "Venue or address", zh: "会场或地址", vi: "Địa điểm hoặc địa chỉ", sources: ["Venue or address"] },
  { ja: "オンラインURL", en: "Online URL", zh: "线上 URL", vi: "URL trực tuyến", sources: ["Online URL"] },
  { ja: "テーマカラー", en: "Theme Color", zh: "主题颜色", vi: "Màu chủ đề", sources: ["Theme Color"] },
  { ja: "画像をアップロード", en: "Upload Event Image", zh: "上传活动图片", vi: "Tải ảnh sự kiện", sources: ["Upload Event Image"] },
  { ja: "ファイルを選択", en: "Select file", zh: "选择文件", vi: "Chọn tệp", sources: ["Select file"] },
  { ja: "アップロード", en: "Upload", zh: "上传", vi: "Tải lên", sources: ["Upload"] },

  { ja: "採用情報", en: "Careers", zh: "招聘", vi: "Tuyển dụng", sources: ["Careers"] },
  { ja: "会社情報", en: "Company", zh: "公司", vi: "Công ty", sources: ["Company"] },
  { ja: "お知らせ", en: "News", zh: "新闻", vi: "Tin tức", sources: ["News"] },
  { ja: "お問い合わせ", en: "Contact", zh: "联系", vi: "Liên hệ", sources: ["Contact"] },
  { ja: "グローバルオフィス", en: "Global Office", zh: "全球办公室", vi: "Văn phòng toàn cầu", sources: ["Global Office"] },
  { ja: "サイトマップ", en: "Site Map", zh: "网站地图", vi: "Sơ đồ trang", sources: ["Site Map"] },
  { ja: "プライバシーポリシー", en: "Privacy Policy", zh: "隐私政策", vi: "Chính sách bảo mật", sources: ["Privacy Policy"] },
  { ja: "利用規約", en: "Terms of Use", zh: "使用条款", vi: "Điều khoản sử dụng", sources: ["Terms of Use"] },
  { ja: "Cookieポリシー / 設定", en: "Cookie Policy / Settings", zh: "Cookie 政策 / 设置", vi: "Chính sách Cookie / Cài đặt", sources: ["Cookie Policy / Settings"] },
  { ja: "アクセシビリティ声明", en: "Accessibility Statement", zh: "无障碍声明", vi: "Tuyên bố khả năng truy cập", sources: ["Accessibility Statement"] }
];

const phraseMap = new Map<string, TranslationSet>();

for (const set of phraseSets) {
  const values = [...Object.values(set).filter((value): value is string => typeof value === "string"), ...(set.sources || [])];
  for (const value of values) {
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
  const orderedSets = [...phraseSets].sort((left, right) => {
    const leftValues = [...Object.values(left).filter((item): item is string => typeof item === "string"), ...(left.sources || [])];
    const rightValues = [...Object.values(right).filter((item): item is string => typeof item === "string"), ...(right.sources || [])];
    return Math.max(...rightValues.map((item) => item.length)) - Math.max(...leftValues.map((item) => item.length));
  });

  for (const set of orderedSets) {
    const sources = [...Object.values(set).filter((item): item is string => typeof item === "string"), ...(set.sources || [])].sort(
      (left, right) => right.length - left.length
    );
    for (const source of sources) {
      if (!source || source === set[language]) continue;
      translated = translated.split(source).join(set[language]);
    }
  }

  return value.replace(trimmed, translated);
}
