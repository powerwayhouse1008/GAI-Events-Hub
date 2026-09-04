export type LanguageCode = "ja" | "en" | "zh" | "vi";

export const languages: Array<{ code: LanguageCode; label: string; shortLabel: string; htmlLang: string }> = [
  { code: "ja", label: "日本語", shortLabel: "JP", htmlLang: "ja" },
  { code: "en", label: "English", shortLabel: "EN", htmlLang: "en" },
  { code: "zh", label: "中文", shortLabel: "中文", htmlLang: "zh-CN" },
  { code: "vi", label: "Tiếng Việt", shortLabel: "VI", htmlLang: "vi" }
];

type TranslationSet = Record<LanguageCode, string>;

const phraseSets: TranslationSet[] = [
  { ja: "さがす", en: "Search", zh: "搜索", vi: "Tìm kiếm" },
  { ja: "イベント", en: "Events", zh: "活动", vi: "Sự kiện" },
  { ja: "カレンダー", en: "Calendar", zh: "日历", vi: "Lịch" },
  { ja: "検索", en: "Search", zh: "搜索", vi: "Tìm kiếm" },
  { ja: "イベント作成", en: "Create Event", zh: "创建活动", vi: "Tạo sự kiện" },
  { ja: "ログイン", en: "Login", zh: "登录", vi: "Đăng nhập" },
  { ja: "ログアウト", en: "Logout", zh: "退出登录", vi: "Đăng xuất" },
  { ja: "AIイベントハブ", en: "AI Event Hub", zh: "AI 活动中心", vi: "Trung tâm sự kiện AI" },
  { ja: "Discover Amazing", en: "Discover Amazing", zh: "发现精彩的", vi: "Khám phá" },
  { ja: "AI Events", en: "AI Events", zh: "AI 活动", vi: "sự kiện AI" },
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
  { ja: "アクセシビリティステートメント", en: "Accessibility Statement", zh: "无障碍声明", vi: "Tuyên bố khả năng truy cập" },
  { ja: "名前なし", en: "No name", zh: "无姓名", vi: "Không có tên" },
  { ja: "更新できませんでした。", en: "Could not update.", zh: "无法更新。", vi: "Không thể cập nhật." },
  { ja: "承認済み", en: "Approved", zh: "已批准", vi: "Đã duyệt" },
  { ja: "承認待ち", en: "Pending approval", zh: "等待批准", vi: "Chờ duyệt" },
  { ja: "却下", en: "Rejected", zh: "已拒绝", vi: "Từ chối" },
  { ja: "承認", en: "Approve", zh: "批准", vi: "Duyệt" },
  { ja: "手動承認のイベントです。参加申込を承認または却下できます。", en: "This event uses manual approval. You can approve or reject registration requests.", zh: "此活动使用人工审核。你可以批准或拒绝报名申请。", vi: "Sự kiện này duyệt thủ công. Bạn có thể duyệt hoặc từ chối đăng ký." },
  { ja: "自動承認のイベントなので、通常ここには申込は残りません。", en: "This event uses automatic approval, so requests usually do not remain here.", zh: "此活动使用自动批准，申请通常不会留在这里。", vi: "Sự kiện này duyệt tự động, nên thường không còn đơn chờ ở đây." },
  { ja: "件", en: "items", zh: "项", vi: "mục" },
  { ja: "名", en: "people", zh: "人", vi: "người" },
  { ja: "承認待ちの申込はありません。", en: "There are no pending registration requests.", zh: "没有待批准的报名申请。", vi: "Không có đăng ký nào đang chờ duyệt." },
  { ja: "参加者一覧", en: "Participant List", zh: "参与者列表", vi: "Danh sách người tham gia" },
  { ja: "承認済みの参加者を確認できます。", en: "You can review approved participants.", zh: "你可以查看已批准的参与者。", vi: "Bạn có thể xem người tham gia đã được duyệt." },
  { ja: "参加者はまだいません。", en: "There are no participants yet.", zh: "还没有参与者。", vi: "Chưa có người tham gia." },
  { ja: "却下済み", en: "Rejected", zh: "已拒绝", vi: "Đã từ chối" },
  { ja: "参加者統計", en: "Participant Stats", zh: "参与者统计", vi: "Thống kê người tham gia" },
  { ja: "合計", en: "Total", zh: "总计", vi: "Tổng cộng" },
  { ja: "定員", en: "Capacity", zh: "名额", vi: "Sức chứa" },
  { ja: "無制限", en: "Unlimited", zh: "无限制", vi: "Không giới hạn" },
  { ja: "日付", en: "Date", zh: "日期", vi: "Ngày" },
  { ja: "時間", en: "Time", zh: "时间", vi: "Thời gian" },
  { ja: "場所", en: "Location", zh: "地点", vi: "Địa điểm" },
  { ja: "価格", en: "Price", zh: "价格", vi: "Giá" },
  { ja: "参加承認", en: "Registration Approval", zh: "报名审批", vi: "Duyệt tham gia" },
  { ja: "手動承認", en: "Manual approval", zh: "人工审核", vi: "Duyệt thủ công" },
  { ja: "自動承認", en: "Automatic approval", zh: "自动批准", vi: "Duyệt tự động" },
  { ja: "公開中", en: "Published", zh: "已发布", vi: "Đã công bố" },
  { ja: "下書き", en: "Draft", zh: "草稿", vi: "Bản nháp" },
  { ja: "このイベントを管理できます。現在の状態:", en: "You can manage this event. Current status:", zh: "你可以管理此活动。当前状态：", vi: "Bạn có thể quản lý sự kiện này. Trạng thái hiện tại:" },
  { ja: "イベント編集", en: "Edit Event", zh: "编辑活动", vi: "Chỉnh sửa sự kiện" },
  { ja: "イベント情報", en: "Event Information", zh: "活动信息", vi: "Thông tin sự kiện" },
  { ja: "イベント進行状況", en: "Event Progress", zh: "活动进度", vi: "Tiến độ sự kiện" },
  { ja: "開始日時", en: "Start Date", zh: "开始时间", vi: "Thời gian bắt đầu" },
  { ja: "申込数", en: "Registrations", zh: "报名数", vi: "Số đăng ký" },
  { ja: "通知・更新", en: "Announcements & Updates", zh: "通知与更新", vi: "Thông báo & cập nhật" },
  { ja: "資料・画像", en: "Materials & Images", zh: "资料与图片", vi: "Tài liệu & hình ảnh" },
  { ja: "参加申込の管理", en: "Manage Registrations", zh: "管理报名", vi: "Quản lý đăng ký" },
  { ja: "参加者リスト", en: "Participant List", zh: "参与者列表", vi: "Danh sách người tham gia" },
  { ja: "参加者を更新", en: "Refresh Participants", zh: "刷新参与者", vi: "Làm mới người tham gia" },
  { ja: "まだ通知はありません。", en: "There are no announcements yet.", zh: "还没有通知。", vi: "Chưa có thông báo." },
  { ja: "開く", en: "Open", zh: "打开", vi: "Mở" },
  { ja: "ブラウザで開く", en: "Open in browser", zh: "在浏览器中打开", vi: "Mở trong trình duyệt" },
  { ja: "リアクション・コメント", en: "Reactions & Comments", zh: "反应与评论", vi: "Tương tác & bình luận" },
  { ja: "操作に失敗しました。", en: "The action failed.", zh: "操作失败。", vi: "Thao tác thất bại." },
  { ja: "コメントできませんでした。", en: "Could not post comment.", zh: "无法发表评论。", vi: "Không thể bình luận." },
  { ja: "コメントを書く", en: "Write a comment", zh: "写评论", vi: "Viết bình luận" },
  { ja: "送信中...", en: "Sending...", zh: "发送中...", vi: "Đang gửi..." },
  { ja: "コメント投稿", en: "Post Comment", zh: "发表评论", vi: "Đăng bình luận" },
  { ja: "このイベントではコメント権限が制限されています。", en: "Commenting is restricted for this event.", zh: "此活动已限制评论权限。", vi: "Sự kiện này đã giới hạn quyền bình luận." },
  { ja: "参加が承認された後にコメントと投票ができます。", en: "You can comment and vote after your participation is approved.", zh: "参与获批后即可评论和投票。", vi: "Bạn có thể bình luận và bình chọn sau khi được duyệt tham gia." },
  { ja: "非表示", en: "Hide", zh: "隐藏", vi: "Ẩn" },
  { ja: "削除", en: "Delete", zh: "删除", vi: "Xóa" },
  { ja: "制限解除", en: "Remove restriction", zh: "解除限制", vi: "Bỏ giới hạn" },
  { ja: "コメント制限", en: "Restrict comments", zh: "限制评论", vi: "Giới hạn bình luận" },
  { ja: "このコメントは非表示です。", en: "This comment is hidden.", zh: "此评论已隐藏。", vi: "Bình luận này đã bị ẩn." },
  { ja: "まだコメントはありません。", en: "There are no comments yet.", zh: "还没有评论。", vi: "Chưa có bình luận." },
  { ja: "承認後に参加できます", en: "You can join after approval", zh: "批准后即可参加", vi: "Bạn có thể tham gia sau khi được duyệt" },
  { ja: "ログインして参加", en: "Log in to Join", zh: "登录后参加", vi: "Đăng nhập để tham gia" },
  { ja: "参加済みです。", en: "You have joined this event.", zh: "你已参加此活动。", vi: "Bạn đã tham gia sự kiện này." },
  { ja: "参加申込済みです。承認をお待ちください。", en: "Your registration was submitted. Please wait for approval.", zh: "你的报名已提交，请等待批准。", vi: "Bạn đã gửi đăng ký. Vui lòng chờ duyệt." },
  { ja: "参加申込は却下されています。", en: "Your registration was rejected.", zh: "你的报名已被拒绝。", vi: "Đăng ký của bạn đã bị từ chối." },
  { ja: "参加申込", en: "Register", zh: "报名", vi: "Đăng ký tham gia" },
  { ja: "主催者へのメッセージ", en: "Message to Organizer", zh: "给主办方的留言", vi: "Tin nhắn cho ban tổ chức" },
  { ja: "参加目的や主催者への連絡事項を入力してください", en: "Enter your purpose for joining or a message to the organizer", zh: "请输入参加目的或给主办方的留言", vi: "Nhập mục đích tham gia hoặc lời nhắn cho ban tổ chức" },
  { ja: "参加申込を送信", en: "Submit Registration", zh: "提交报名", vi: "Gửi đăng ký" },
  { ja: "閉じる", en: "Close", zh: "关闭", vi: "Đóng" },
  { ja: "プロフィール", en: "Profile", zh: "个人资料", vi: "Hồ sơ" },
  { ja: "画像を変更", en: "Change Image", zh: "更换图片", vi: "Đổi ảnh" },
  { ja: "名前", en: "Name", zh: "姓名", vi: "Tên" },
  { ja: "会社", en: "Company", zh: "公司", vi: "Công ty" },
  { ja: "職務・役職", en: "Job Title", zh: "职位", vi: "Chức danh" },
  { ja: "電話番号", en: "Phone Number", zh: "电话号码", vi: "Số điện thoại" },
  { ja: "プロフィールを保存", en: "Save Profile", zh: "保存个人资料", vi: "Lưu hồ sơ" },
  { ja: "保存中...", en: "Saving...", zh: "保存中...", vi: "Đang lưu..." },
  { ja: "Googleでログイン", en: "Log in with Google", zh: "使用 Google 登录", vi: "Đăng nhập bằng Google" },
  { ja: "Googleへ移動中...", en: "Opening Google...", zh: "正在打开 Google...", vi: "Đang mở Google..." },
  { ja: "またはメール", en: "or email", zh: "或使用邮箱", vi: "hoặc email" },
  { ja: "メールアドレス", en: "Email address", zh: "邮箱地址", vi: "Địa chỉ email" },
  { ja: "パスワード", en: "Password", zh: "密码", vi: "Mật khẩu" },
  { ja: "ログイン中...", en: "Logging in...", zh: "登录中...", vi: "Đang đăng nhập..." },
  { ja: "Google登録のアカウント種別", en: "Google registration account type", zh: "Google 注册账号类型", vi: "Loại tài khoản đăng ký Google" },
  { ja: "Googleで登録", en: "Register with Google", zh: "使用 Google 注册", vi: "Đăng ký bằng Google" },
  { ja: "会社・コミュニティ", en: "Company / Community", zh: "公司 / 社群", vi: "Công ty / Cộng đồng" },
  { ja: "アカウント種別", en: "Account Type", zh: "账号类型", vi: "Loại tài khoản" },
  { ja: "アカウント作成", en: "Create Account", zh: "创建账号", vi: "Tạo tài khoản" },
  { ja: "作成中...", en: "Creating...", zh: "创建中...", vi: "Đang tạo..." },
  { ja: "Member / 参加者", en: "Member / Participant", zh: "会员 / 参与者", vi: "Thành viên / Người tham gia" },
  { ja: "Organizer / 主催者", en: "Organizer / Host", zh: "主办方", vi: "Ban tổ chức" },
  { ja: "イベント画像をアップロード", en: "Upload Event Image", zh: "上传活动图片", vi: "Tải ảnh sự kiện" },
  { ja: "テーマに合わせてAI画像を生成", en: "Generate an AI image for this theme", zh: "按主题生成 AI 图片", vi: "Tạo ảnh AI theo chủ đề" },
  { ja: "画像を生成中", en: "Generating image", zh: "正在生成图片", vi: "Đang tạo ảnh" },
  { ja: "イベント名", en: "Event Name", zh: "活动名称", vi: "Tên sự kiện" },
  { ja: "開始", en: "Start", zh: "开始", vi: "Bắt đầu" },
  { ja: "終了", en: "End", zh: "结束", vi: "Kết thúc" },
  { ja: "会場または住所", en: "Venue or address", zh: "会场或地址", vi: "Địa điểm hoặc địa chỉ" },
  { ja: "オンラインURL", en: "Online URL", zh: "线上 URL", vi: "URL trực tuyến" },
  { ja: "説明を追加", en: "Add description", zh: "添加说明", vi: "Thêm mô tả" },
  { ja: "主催者名", en: "Organizer name", zh: "主办方名称", vi: "Tên ban tổ chức" },
  { ja: "チケット価格", en: "Ticket price", zh: "票价", vi: "Giá vé" },
  { ja: "参加者を手動承認", en: "Manually approve participants", zh: "手动批准参与者", vi: "Duyệt người tham gia thủ công" },
  { ja: "参加者を自動承認", en: "Automatically approve participants", zh: "自动批准参与者", vi: "Tự động duyệt người tham gia" },
  { ja: "テーマカラー", en: "Theme Color", zh: "主题颜色", vi: "Màu chủ đề" },
  { ja: "イベントを更新して承認申請", en: "Update Event and Request Approval", zh: "更新活动并申请批准", vi: "Cập nhật sự kiện và gửi duyệt" },
  { ja: "新しい通知", en: "New Announcement", zh: "新通知", vi: "Thông báo mới" },
  { ja: "通知を送信", en: "Send Announcement", zh: "发送通知", vi: "Gửi thông báo" },
  { ja: "タイトル", en: "Title", zh: "标题", vi: "Tiêu đề" },
  { ja: "通知タイトルを入力", en: "Enter announcement title", zh: "输入通知标题", vi: "Nhập tiêu đề thông báo" },
  { ja: "内容", en: "Content", zh: "内容", vi: "Nội dung" },
  { ja: "通知内容を入力", en: "Enter announcement content", zh: "输入通知内容", vi: "Nhập nội dung thông báo" },
  { ja: "キャンセル", en: "Cancel", zh: "取消", vi: "Hủy" },
  { ja: "送信", en: "Send", zh: "发送", vi: "Gửi" },
  { ja: "まだ通知がありません", en: "There are no announcements yet", zh: "还没有通知", vi: "Chưa có thông báo" },
  { ja: "ファイルをアップロード", en: "Upload File", zh: "上传文件", vi: "Tải tệp lên" },
  { ja: "ファイルタイトル（任意）", en: "File title (optional)", zh: "文件标题（可选）", vi: "Tiêu đề tệp (không bắt buộc)" },
  { ja: "ファイルタイトルを入力", en: "Enter file title", zh: "输入文件标题", vi: "Nhập tiêu đề tệp" },
  { ja: "ファイルを選択", en: "Select file", zh: "选择文件", vi: "Chọn tệp" },
  { ja: "クリックしてファイルを選択", en: "Click to select a file", zh: "点击选择文件", vi: "Bấm để chọn tệp" },
  { ja: "最大 50MB", en: "Max 50MB", zh: "最大 50MB", vi: "Tối đa 50MB" },
  { ja: "アップロード", en: "Upload", zh: "上传", vi: "Tải lên" },
  { ja: "アップロード中...", en: "Uploading...", zh: "上传中...", vi: "Đang tải lên..." },
  { ja: "資料・画像はまだアップロードされていません。", en: "No materials or images have been uploaded yet.", zh: "还没有上传资料或图片。", vi: "Chưa có tài liệu hoặc hình ảnh nào được tải lên." }
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
  const orderedSets = [...phraseSets].sort((left, right) => Math.max(...Object.values(right).map((value) => value.length)) - Math.max(...Object.values(left).map((value) => value.length)));
  for (const set of orderedSets) {
    const sources = Object.values(set).sort((left, right) => right.length - left.length);
    for (const source of sources) {
      translated = translated.split(source).join(set[language]);
    }
  }

  return value.replace(trimmed, translated);
}
