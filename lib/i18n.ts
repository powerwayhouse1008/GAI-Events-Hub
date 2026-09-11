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

const staticUiPhraseSets: TranslationEntry[] = [
  { ja: "公開中", en: "Published", zh: "已发布", vi: "Đã xuất bản" },
  { ja: "下書き", en: "Draft", zh: "草稿", vi: "Bản nháp" },
  { ja: "却下", en: "Rejected", zh: "已拒绝", vi: "Đã từ chối" },
  { ja: "編集", en: "Edit", zh: "编辑", vi: "Chỉnh sửa" },
  { ja: "公開", en: "Publish", zh: "发布", vi: "Xuất bản" },
  { ja: "コピー", en: "Copy", zh: "复制", vi: "Sao chép" },
  { ja: "削除", en: "Delete", zh: "删除", vi: "Xóa" },
  { ja: "管理できるイベントはありません。", en: "There are no events to manage.", zh: "没有可管理的活动。", vi: "Không có sự kiện nào để quản lý." },
  { ja: "保存しました", en: "Saved.", zh: "已保存。", vi: "Đã lưu." },
  { ja: "保存できませんでした。", en: "Could not save.", zh: "无法保存。", vi: "Không thể lưu." },
  { ja: "リンクプレビュー", en: "Link preview", zh: "链接预览", vi: "Xem trước liên kết" },
  { ja: "登録済みアカウントの管理者権限を変更し、不要なアカウントを削除できます。", en: "Change admin permissions for registered accounts and delete accounts that are no longer needed.", zh: "更改已注册账户的管理员权限，并删除不再需要的账户。", vi: "Thay đổi quyền quản trị của tài khoản đã đăng ký và xóa tài khoản không cần thiết." },
  { ja: "処理中...", en: "Processing...", zh: "处理中...", vi: "Đang xử lý..." },
  { ja: "mai@powerway.jp を管理者に設定", en: "Set mai@powerway.jp as admin", zh: "将 mai@powerway.jp 设为管理员", vi: "Đặt mai@powerway.jp làm quản trị viên" },
  { ja: "管理者にする", en: "Make admin", zh: "设为管理员", vi: "Đặt làm quản trị viên" },
  { ja: "管理者解除", en: "Remove admin", zh: "移除管理员", vi: "Gỡ quyền quản trị" },
  { ja: "アカウント削除", en: "Delete account", zh: "删除账户", vi: "Xóa tài khoản" },
  { ja: "このアカウントを削除しますか？", en: "Delete this account?", zh: "要删除此账户吗？", vi: "Xóa tài khoản này?" },
  { ja: "操作に失敗しました。", en: "The action failed.", zh: "操作失败。", vi: "Thao tác thất bại." },
  { ja: "管理者アカウントを準備できませんでした。", en: "Could not prepare the admin account.", zh: "无法准备管理员账户。", vi: "Không thể chuẩn bị tài khoản quản trị." },
  { ja: "アカウントがありません。", en: "No accounts found.", zh: "没有账户。", vi: "Không có tài khoản." },
  { ja: "none", en: "None", zh: "无", vi: "Không có" },
  { ja: "pending", en: "Pending", zh: "待处理", vi: "Đang chờ" },
  { ja: "approved", en: "Approved", zh: "已批准", vi: "Đã duyệt" },
  { ja: "rejected", en: "Rejected", zh: "已拒绝", vi: "Đã từ chối" },
  { ja: "日本語", en: "Japanese", zh: "日语", vi: "Tiếng Nhật", sources: ["譌･譛ｬ隱・"] },
  { ja: "中文", en: "Chinese", zh: "中文", vi: "Tiếng Trung", sources: ["荳ｭ譁・"] },
  { ja: "Tiếng Việt", en: "Vietnamese", zh: "越南语", vi: "Tiếng Việt", sources: ["Ti蘯ｿng Vi盻㏄"] },
  { ja: "Create Account", en: "Create Account", zh: "创建账户", vi: "Tạo tài khoản" },
  { ja: "Start joining and hosting better AI events.", en: "Start joining and hosting better AI events.", zh: "开始参加并举办更好的 AI 活动。", vi: "Bắt đầu tham gia và tổ chức các sự kiện AI tốt hơn." },
  { ja: "Global", en: "Global", zh: "全球", vi: "Toàn cầu" },
  { ja: "新規登録", en: "Register", zh: "注册", vi: "Đăng ký" },
  { ja: "メンバーまたは主催者としてアカウントを作成できます。", en: "Create an account as a member or organizer.", zh: "以会员或主办方身份创建账户。", vi: "Tạo tài khoản với tư cách thành viên hoặc ban tổ chức." },
  { ja: "読み込み中...", en: "Loading...", zh: "正在加载...", vi: "Đang tải..." },
  { ja: "Connect, learn and join AI events.", en: "Connect, learn and join AI events.", zh: "连接、学习并参加 AI 活动。", vi: "Kết nối, học hỏi và tham gia các sự kiện AI." },
  { ja: "Community", en: "Community", zh: "社区", vi: "Cộng đồng" },
  { ja: "Googleまたはメールでログインできます。", en: "Log in with Google or email.", zh: "使用 Google 或邮箱登录。", vi: "Đăng nhập bằng Google hoặc email." },
  { ja: "My Page", en: "My Page", zh: "我的页面", vi: "Trang của tôi" },
  { ja: "Notifications", en: "Notifications", zh: "通知", vi: "Thông báo" },
  { ja: "No notifications.", en: "No notifications.", zh: "暂无通知。", vi: "Chưa có thông báo." },
  { ja: "My Event Registrations", en: "My Event Registrations", zh: "我的活动报名", vi: "Đăng ký sự kiện của tôi" },
  { ja: "Event", en: "Event", zh: "活动", vi: "Sự kiện" },
  { ja: "Status", en: "Status", zh: "状态", vi: "Trạng thái" },
  { ja: "No registrations.", en: "No registrations.", zh: "暂无报名。", vi: "Chưa có đăng ký." },
  { ja: "主催者ダッシュボード", en: "Organizer Dashboard", zh: "主办方仪表板", vi: "Bảng điều khiển ban tổ chức" },
  { ja: "申込者", en: "Applicant", zh: "申请人", vi: "Người đăng ký" },
  { ja: "メール", en: "Email", zh: "邮箱", vi: "Email" },
  { ja: "状態", en: "Status", zh: "状态", vi: "Trạng thái" },
  { ja: "メッセージ", en: "Message", zh: "消息", vi: "Tin nhắn" },
  { ja: "操作", en: "Actions", zh: "操作", vi: "Thao tác" },
  { ja: "管理者", en: "Admin", zh: "管理员", vi: "Quản trị viên" },
  { ja: "イベント管理、アカウント権限、サイトリンクを管理できます。", en: "Manage events, account permissions, and site links.", zh: "管理活动、账户权限和站点链接。", vi: "Quản lý sự kiện, quyền tài khoản và liên kết trang." },
  { ja: "イベント管理", en: "Event Management", zh: "活动管理", vi: "Quản lý sự kiện" },
  { ja: "承認待ちを含むすべてのイベント", en: "All events including pending items", zh: "所有活动，包括待审批项目", vi: "Tất cả sự kiện, bao gồm mục chờ duyệt" },
  { ja: "アカウント権限", en: "Account Permissions", zh: "账户权限", vi: "Quyền tài khoản" },
  { ja: "管理者権限の付与と解除", en: "Grant and revoke admin access", zh: "授予和撤销管理员权限", vi: "Cấp và thu hồi quyền quản trị" },
  { ja: "イベントの編集、公開、下書きへの移動、コピー、削除を管理できます。", en: "Manage editing, publishing, drafting, copying, and deleting events.", zh: "管理活动的编辑、发布、草稿、复制和删除。", vi: "Quản lý chỉnh sửa, xuất bản, nháp, sao chép và xóa sự kiện." },
  { ja: "イベント名", en: "Event Name", zh: "活动名称", vi: "Tên sự kiện" },
  { ja: "主催者", en: "Organizer", zh: "主办方", vi: "Ban tổ chức" },
  { ja: "名前", en: "Name", zh: "姓名", vi: "Tên" },
  { ja: "会社・コミュニティ", en: "Company / Community", zh: "公司 / 社区", vi: "Công ty / Cộng đồng" },
  { ja: "権限", en: "Role", zh: "权限", vi: "Vai trò" },
  { ja: "主催者状態", en: "Organizer Status", zh: "主办方状态", vi: "Trạng thái ban tổ chức" },
  { ja: "このアカウントを削除しますか？", en: "Delete this account?", zh: "要删除此账户吗？", vi: "Xóa tài khoản này?" },
  { ja: "リンク管理", en: "Link Management", zh: "链接管理", vi: "Quản lý liên kết" },
  { ja: "Footer の各項目に Web リンクを割り当てて保存できます。", en: "Assign and save web links for each footer item.", zh: "为页脚各项分配并保存网页链接。", vi: "Gán và lưu liên kết web cho từng mục chân trang." },
  { ja: "リンクプレビュー", en: "Link Preview", zh: "链接预览", vi: "Xem trước liên kết" },
  { ja: "プロフィール", en: "Profile", zh: "个人资料", vi: "Hồ sơ" },
  { ja: "Gmail、名前、会社、職務、電話番号、プロフィール画像を確認・編集できます。", en: "Review and edit Gmail, name, company, job title, phone number, and profile image.", zh: "查看并编辑 Gmail、姓名、公司、职位、电话号码和头像。", vi: "Xem và chỉnh sửa Gmail, tên, công ty, chức danh, số điện thoại và ảnh hồ sơ." },
  { ja: "イベント修正", en: "Edit Event", zh: "编辑活动", vi: "Chỉnh sửa sự kiện" },
  { ja: "イベント情報を更新できます。管理者は更新後すぐに公開できます。", en: "Update event information. Admins can publish immediately after updating.", zh: "更新活动信息。管理员更新后可立即发布。", vi: "Cập nhật thông tin sự kiện. Quản trị viên có thể xuất bản ngay sau khi cập nhật." },
  { ja: "公開前に管理者承認が必要です", en: "Admin approval is required before publishing", zh: "发布前需要管理员审批", vi: "Cần quản trị viên duyệt trước khi xuất bản" },
  { ja: "イベント画像をアップロード", en: "Upload Event Image", zh: "上传活动图片", vi: "Tải ảnh sự kiện lên" },
  { ja: "テーマに合わせてAI画像を生成", en: "Generate AI Image for Theme", zh: "根据主题生成 AI 图片", vi: "Tạo ảnh AI theo chủ đề" },
  { ja: "画像を生成中", en: "Generating image", zh: "正在生成图片", vi: "Đang tạo ảnh" },
  { ja: "Source language", en: "Source language", zh: "源语言", vi: "Ngôn ngữ nguồn" },
  { ja: "フォント", en: "Font", zh: "字体", vi: "Phông chữ" },
  { ja: "サイズ", en: "Size", zh: "大小", vi: "Cỡ chữ" },
  { ja: "小", en: "Small", zh: "小", vi: "Nhỏ" },
  { ja: "標準", en: "Normal", zh: "标准", vi: "Bình thường" },
  { ja: "大", en: "Large", zh: "大", vi: "Lớn" },
  { ja: "特大", en: "Extra large", zh: "特大", vi: "Rất lớn" },
  { ja: "太字", en: "Bold", zh: "加粗", vi: "Đậm" },
  { ja: "斜体", en: "Italic", zh: "斜体", vi: "Nghiêng" },
  { ja: "下線", en: "Underline", zh: "下划线", vi: "Gạch chân" },
  { ja: "文字色", en: "Text color", zh: "文字颜色", vi: "Màu chữ" },
  { ja: "背景色", en: "Background color", zh: "背景颜色", vi: "Màu nền" },
  { ja: "イベント説明", en: "Event description", zh: "活动说明", vi: "Mô tả sự kiện" },
  { ja: "主催者名", en: "Organizer name", zh: "主办方名称", vi: "Tên ban tổ chức" },
  { ja: "チケット価格", en: "Ticket price", zh: "票价", vi: "Giá vé" },
  { ja: "参加者を手動承認", en: "Manually approve participants", zh: "手动审批参加者", vi: "Duyệt người tham gia thủ công" },
  { ja: "参加者を自動承認", en: "Automatically approve participants", zh: "自动审批参加者", vi: "Tự động duyệt người tham gia" },
  { ja: "定員", en: "Capacity", zh: "名额", vi: "Sức chứa" },
  { ja: "イベントを更新", en: "Update Event", zh: "更新活动", vi: "Cập nhật sự kiện" },
  { ja: "イベント作成", en: "Create Event", zh: "创建活动", vi: "Tạo sự kiện" },
  { ja: "開始日時は現在時刻以降を選択してください。過去のイベントは作成できません。", en: "Choose a start date and time after the current time. Past events cannot be created.", zh: "请选择当前时间之后的开始日期和时间。不能创建过去的活动。", vi: "Chọn thời gian bắt đầu sau thời điểm hiện tại. Không thể tạo sự kiện trong quá khứ." },
  { ja: "終了日時は開始日時以降を選択してください。", en: "Choose an end date and time after the start date and time.", zh: "请选择开始时间之后的结束日期和时间。", vi: "Chọn thời gian kết thúc sau thời gian bắt đầu." },
  { ja: "画像をアップロードできませんでした。", en: "Could not upload the image.", zh: "无法上传图片。", vi: "Không thể tải ảnh lên." },
  { ja: "Event was saved, but no event ID was returned.", en: "Event was saved, but no event ID was returned.", zh: "活动已保存，但未返回活动 ID。", vi: "Sự kiện đã lưu nhưng không nhận được ID sự kiện." },
  { ja: "イベントは保存されましたが、自動翻訳に失敗しました。後で再翻訳できます。", en: "The event was saved, but automatic translation failed. You can translate it again later.", zh: "活动已保存，但自动翻译失败。你可以稍后重新翻译。", vi: "Sự kiện đã được lưu nhưng dịch tự động thất bại. Bạn có thể dịch lại sau." },
  { ja: "翻訳モデルを準備しています...", en: "Preparing translation model...", zh: "正在准备翻译模型...", vi: "Đang chuẩn bị mô hình dịch..." },
  { ja: "翻訳中...", en: "Translating...", zh: "正在翻译...", vi: "Đang dịch..." },
  { ja: "翻訳を保存しています...", en: "Saving translations...", zh: "正在保存翻译...", vi: "Đang lưu bản dịch..." },
  { ja: "通知を送信", en: "Send Notification", zh: "发送通知", vi: "Gửi thông báo" },
  { ja: "新しい通知", en: "New Notification", zh: "新通知", vi: "Thông báo mới" },
  { ja: "タイトル", en: "Title", zh: "标题", vi: "Tiêu đề" },
  { ja: "通知タイトルを入力", en: "Enter notification title", zh: "输入通知标题", vi: "Nhập tiêu đề thông báo" },
  { ja: "内容", en: "Content", zh: "内容", vi: "Nội dung" },
  { ja: "通知内容を入力", en: "Enter notification content", zh: "输入通知内容", vi: "Nhập nội dung thông báo" },
  { ja: "タイトルと内容を入力してください。", en: "Enter both title and content.", zh: "请输入标题和内容。", vi: "Nhập cả tiêu đề và nội dung." },
  { ja: "通知を送信できませんでした。", en: "Could not send the notification.", zh: "无法发送通知。", vi: "Không thể gửi thông báo." },
  { ja: "この通知を削除しますか？", en: "Delete this notification?", zh: "要删除此通知吗？", vi: "Xóa thông báo này?" },
  { ja: "削除に失敗しました。", en: "Delete failed.", zh: "删除失败。", vi: "Xóa thất bại." },
  { ja: "まだ通知がありません。", en: "No notifications yet.", zh: "暂无通知。", vi: "Chưa có thông báo." },
  { ja: "ファイルをアップロード", en: "Upload File", zh: "上传文件", vi: "Tải tệp lên" },
  { ja: "ファイルタイトル（任意）", en: "File title (optional)", zh: "文件标题（可选）", vi: "Tiêu đề tệp (tùy chọn)" },
  { ja: "ファイルタイトルを入力", en: "Enter file title", zh: "输入文件标题", vi: "Nhập tiêu đề tệp" },
  { ja: "ファイルを選択", en: "Select file", zh: "选择文件", vi: "Chọn tệp" },
  { ja: "クリックしてファイルを選択", en: "Click to select a file", zh: "点击选择文件", vi: "Bấm để chọn tệp" },
  { ja: "最大 50MB", en: "Up to 50MB", zh: "最大 50MB", vi: "Tối đa 50MB" },
  { ja: "ファイルサイズは50MB以下にしてください。", en: "File size must be 50MB or less.", zh: "文件大小必须不超过 50MB。", vi: "Kích thước tệp phải từ 50MB trở xuống." },
  { ja: "ファイルを選択してください。", en: "Select a file.", zh: "请选择文件。", vi: "Chọn một tệp." },
  { ja: "ファイルのアップロードに失敗しました。", en: "File upload failed.", zh: "文件上传失败。", vi: "Tải tệp thất bại." },
  { ja: "アップロード中...", en: "Uploading...", zh: "正在上传...", vi: "Đang tải lên..." },
  { ja: "ブラウザで開いて表示", en: "Open in browser", zh: "在浏览器中打开", vi: "Mở trong trình duyệt" },
  { ja: "このファイルを削除しますか？", en: "Delete this file?", zh: "要删除此文件吗？", vi: "Xóa tệp này?" },
  { ja: "資料・画像はまだアップロードされていません。", en: "No materials or images have been uploaded yet.", zh: "尚未上传资料或图片。", vi: "Chưa có tài liệu hoặc ảnh nào được tải lên." },
  { ja: "開く", en: "Open", zh: "打开", vi: "Mở" },
  { ja: "参加者はまだいません。", en: "No participants yet.", zh: "暂无参加者。", vi: "Chưa có người tham gia." },
  { ja: "参加者統計", en: "Participant Stats", zh: "参加者统计", vi: "Thống kê người tham gia" },
  { ja: "合計", en: "Total", zh: "合计", vi: "Tổng" },
  { ja: "無制限", en: "Unlimited", zh: "无限制", vi: "Không giới hạn" },
  { ja: "承認", en: "Approve", zh: "批准", vi: "Duyệt" },
  { ja: "却下", en: "Reject", zh: "拒绝", vi: "Từ chối" },
  { ja: "更新できませんでした。", en: "Could not update.", zh: "无法更新。", vi: "Không thể cập nhật." },
  { ja: "手動承認のイベントです。参加申込を承認または却下できます。", en: "This event uses manual approval. You can approve or reject applications.", zh: "此活动使用手动审批。你可以批准或拒绝报名。", vi: "Sự kiện này duyệt thủ công. Bạn có thể duyệt hoặc từ chối đăng ký." },
  { ja: "自動承認のイベントなので、通常ここには申込は残りません。", en: "This event uses automatic approval, so applications usually do not remain here.", zh: "此活动使用自动审批，报名通常不会停留在这里。", vi: "Sự kiện này duyệt tự động nên thường không còn đăng ký ở đây." },
  { ja: "承認待ちの申込はありません。", en: "No pending applications.", zh: "没有待审批报名。", vi: "Không có đăng ký chờ duyệt." },
  { ja: "参加者一覧", en: "Participant List", zh: "参加者列表", vi: "Danh sách người tham gia" },
  { ja: "承認済みの参加者を確認できます。", en: "Review approved participants.", zh: "查看已批准的参加者。", vi: "Xem người tham gia đã được duyệt." },
  { ja: "却下済み", en: "Rejected", zh: "已拒绝", vi: "Đã từ chối" },
  { ja: "件", en: "items", zh: "件", vi: "mục" },
  { ja: "名", en: "people", zh: "人", vi: "người" },
  { ja: "イベント情報", en: "Event Information", zh: "活动信息", vi: "Thông tin sự kiện" },
  { ja: "イベント進行状況", en: "Event Progress", zh: "活动进度", vi: "Tiến độ sự kiện" },
  { ja: "通知・更新", en: "Notifications & Updates", zh: "通知与更新", vi: "Thông báo & cập nhật" },
  { ja: "資料・画像", en: "Materials & Images", zh: "资料与图片", vi: "Tài liệu & hình ảnh" },
  { ja: "参加申込の管理", en: "Manage Registrations", zh: "管理报名", vi: "Quản lý đăng ký" },
  { ja: "参加者リスト", en: "Participant List", zh: "参加者列表", vi: "Danh sách người tham gia" },
  { ja: "参加者を更新", en: "Refresh Participants", zh: "刷新参加者", vi: "Làm mới người tham gia" },
  { ja: "リアクション・コメント", en: "Reactions & Comments", zh: "反应与评论", vi: "Phản ứng & bình luận" },
  { ja: "コメントを書く", en: "Write a comment", zh: "写评论", vi: "Viết bình luận" },
  { ja: "コメント投稿", en: "Post Comment", zh: "发表评论", vi: "Đăng bình luận" },
  { ja: "コメントできませんでした。", en: "Could not post comment.", zh: "无法发表评论。", vi: "Không thể đăng bình luận." },
  { ja: "このコメントは非表示です。", en: "This comment is hidden.", zh: "此评论已隐藏。", vi: "Bình luận này đã bị ẩn." },
  { ja: "まだコメントはありません。", en: "No comments yet.", zh: "暂无评论。", vi: "Chưa có bình luận." },
  { ja: "非表示", en: "Hide", zh: "隐藏", vi: "Ẩn" },
  { ja: "コメント制限", en: "Restrict comments", zh: "限制评论", vi: "Hạn chế bình luận" },
  { ja: "制限解除", en: "Remove restriction", zh: "解除限制", vi: "Gỡ hạn chế" },
  { ja: "ログインして参加", en: "Log in to join", zh: "登录后参加", vi: "Đăng nhập để tham gia" },
  { ja: "参加申込", en: "Register", zh: "报名参加", vi: "Đăng ký tham gia" },
  { ja: "参加申込を送信", en: "Send Registration", zh: "提交报名", vi: "Gửi đăng ký" },
  { ja: "主催者へのメッセージ", en: "Message to organizer", zh: "给主办方的消息", vi: "Tin nhắn cho ban tổ chức" },
  { ja: "参加目的や主催者への連絡事項を入力してください", en: "Enter your reason for joining or a note for the organizer", zh: "请输入参加目的或给主办方的留言", vi: "Nhập mục đích tham gia hoặc ghi chú cho ban tổ chức" },
  { ja: "承認後に参加できます", en: "You can join after approval.", zh: "审批后即可参加。", vi: "Bạn có thể tham gia sau khi được duyệt." },
  { ja: "参加済みです。", en: "You have joined.", zh: "你已参加。", vi: "Bạn đã tham gia." },
  { ja: "参加申込済みです。承認をお待ちください。", en: "Registration submitted. Please wait for approval.", zh: "报名已提交。请等待审批。", vi: "Đã gửi đăng ký. Vui lòng chờ duyệt." },
  { ja: "参加申込は却下されています。", en: "Your registration was rejected.", zh: "你的报名已被拒绝。", vi: "Đăng ký của bạn đã bị từ chối." },
  { ja: "参加が承認された後にコメントと投票ができます。", en: "You can comment and vote after your registration is approved.", zh: "报名获批后可以评论和投票。", vi: "Bạn có thể bình luận và bình chọn sau khi đăng ký được duyệt." },
  { ja: "このイベントではコメント権限が制限されています。", en: "Commenting is restricted for this event.", zh: "此活动的评论权限受限。", vi: "Quyền bình luận bị hạn chế trong sự kiện này." }
  ,{ ja: "Unknown", en: "Unknown", zh: "未知", vi: "Không rõ" },
  { ja: "Role", en: "Role", zh: "角色", vi: "Vai trò" },
  { ja: "画像を変更", en: "Change Image", zh: "更换图片", vi: "Đổi ảnh" },
  { ja: "プロフィールを保存できませんでした。", en: "Could not save profile.", zh: "无法保存个人资料。", vi: "Không thể lưu hồ sơ." },
  { ja: "プロフィールを保存しました。", en: "Profile saved.", zh: "个人资料已保存。", vi: "Đã lưu hồ sơ." },
  { ja: "member", en: "Member", zh: "会员", vi: "Thành viên" },
  { ja: "organizer", en: "Organizer", zh: "主办方", vi: "Ban tổ chức" },
  { ja: "admin", en: "Admin", zh: "管理员", vi: "Quản trị viên" }
];

phraseSets.push(...staticUiPhraseSets);
phraseSets.push(
  { ja: "参加承認", en: "Participant approval", zh: "参加审批", vi: "Duyệt tham gia", sources: ["Participant approval"] }
);

const phraseMap = new Map<string, TranslationSet>();
const orderedPhraseSources = phraseSets
  .map((set) => ({
    set,
    sources: [...Object.values(set).filter((item): item is string => typeof item === "string"), ...(set.sources || [])].sort(
      (left, right) => right.length - left.length
    )
  }))
  .sort((left, right) => {
    const leftMax = Math.max(...left.sources.map((item) => item.length));
    const rightMax = Math.max(...right.sources.map((item) => item.length));
    return rightMax - leftMax;
  });

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
  for (const { set, sources } of orderedPhraseSources) {
    for (const source of sources) {
      if (!source || source === set[language]) continue;
      translated = translated.split(source).join(set[language]);
    }
  }

  return value.replace(trimmed, translated);
}

function containsCjk(text: string) {
  return /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff]/.test(text);
}

function containsJapaneseKana(text: string) {
  return /[\u3040-\u30ff]/.test(text);
}

function looksBrokenLocalizedText(text: string, locale: LanguageCode | string) {
  const trimmed = text.trim();
  if (!trimmed) return true;
  if (/^(?:A[\s-]*){8,}$/i.test(trimmed)) return true;
  if (/^[A-Za-z]$/.test(trimmed) && locale !== "en") return true;
  if (/[�ﾂﾃﾄ盻蘯譁繧縺蜿謇逕譌髢]/.test(trimmed)) return true;
  if ((locale === "en" || locale === "vi") && containsCjk(trimmed)) return true;
  if (locale === "zh" && containsJapaneseKana(trimmed)) return true;
  return false;
}

export function pickLocalized(value: unknown, locale: LanguageCode | string, fallback: LanguageCode | string = "en") {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value !== "object") return "";

  const localized = value as Record<string, unknown>;
  const candidates = [
    localized[locale],
    localized[fallback],
    localized.ja,
    localized.zh,
    ...Object.values(localized)
  ];

  return String(candidates.find((item) => typeof item === "string" && item.trim() && !looksBrokenLocalizedText(item, locale)) || "");
}
