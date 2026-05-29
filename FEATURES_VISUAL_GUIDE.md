# Event Management Features - Visual Guide

## 📱 User Interface Layout

### For Event Organizers

```
┌─────────────────────────────────────────────┐
│  イベント詳細ページ (Event Detail Page)    │
├─────────────────────────────────────────────┤
│                                             │
│  📋 Event Stats Dashboard                   │
│  ┌─────────┬──────────┬──────────┬────────┐│
│  │ Start   │Applications│Approved│Capacity││
│  │Date/    │   Count    │ Count  │        ││
│  │Time     │            │        │        ││
│  └─────────┴──────────┴──────────┴────────┘│
│                                             │
│  📢 Announcements Section                   │
│  ┌──────────────────────────────────────────┐│
│  │ [新しい通知] Create Button               ││
│  ├──────────────────────────────────────────┤│
│  │ Title: Important Update                 ││
│  │ Content: Event location changed...      ││
│  │ [Delete] 2026-05-29 10:30              ││
│  ├──────────────────────────────────────────┤│
│  │ Title: Time Reminder                    ││
│  │ Content: Don't forget! Event starts...  ││
│  │ [Delete] 2026-05-29 09:15              ││
│  └──────────────────────────────────────────┘│
│                                             │
│  📄 Documents Section                       │
│  ┌──────────────────────────────────────────┐│
│  │ [ファイルをアップロード] Upload Button ││
│  ├──────────────────────────────────────────┤│
│  │ 📄 Agenda.pdf        2.3 MB  [Delete]   ││
│  ├──────────────────────────────────────────┤│
│  │ 🖼️ Presentation.pptx  5.1 MB  [Delete]  ││
│  ├──────────────────────────────────────────┤│
│  │ 📄 Guidelines.pdf     1.2 MB  [Delete]  ││
│  └──────────────────────────────────────────┘│
│                                             │
│  👥 Participants Section                    │
│  ┌──────────────────────────────────────────┐│
│  │ 承認済み (Approved): 12                  ││
│  │ 🔵 🟢 🟣 🟡 🟠 🔴 🟣 🟢 🟡 🔵 🟠 🟢    ││
│  │                                         ││
│  │ 申請中 (Pending): 3                     ││
│  │ 🔵⚠️ 🟢⚠️ 🟣⚠️                          ││
│  └──────────────────────────────────────────┘│
│                                             │
└─────────────────────────────────────────────┘
```

### For Regular Participants

```
┌─────────────────────────────────────────────┐
│  イベント詳細ページ (Participant View)      │
├─────────────────────────────────────────────┤
│                                             │
│  (Same event cover and basic info)         │
│                                             │
│  📢 Announcements Section (View Only)      │
│  ┌──────────────────────────────────────────┐│
│  │ Title: Important Update                 ││
│  │ Content: Event location changed...      ││
│  │ 2026-05-29 10:30                        ││
│  ├──────────────────────────────────────────┤│
│  │ Title: Time Reminder                    ││
│  │ Content: Don't forget! Event starts...  ││
│  │ 2026-05-29 09:15                        ││
│  └──────────────────────────────────────────┘│
│                                             │
│  📄 Documents Section (View Only)          │
│  ┌──────────────────────────────────────────┐│
│  │ 📄 Agenda.pdf        ⬇️ Download         ││
│  ├──────────────────────────────────────────┤│
│  │ 🖼️ Presentation.pptx ⬇️ Download         ││
│  ├──────────────────────────────────────────┤│
│  │ 📄 Guidelines.pdf    ⬇️ Download        ││
│  └──────────────────────────────────────────┘│
│                                             │
└─────────────────────────────────────────────┘
```

## 🎨 Color Scheme & Styling

### Statistics Cards
```
┌─────────────────────────────┐
│ Label                       │
│ 12 (Large Bold Number)     │
└─────────────────────────────┘
• Blue: Start Date/Time
• Green: Applications
• Purple: Approved
• Orange: Capacity
```

### Participant Avatars
```
Avatar Colors (8 distinct colors):
🔵 Blue    🟢 Green   🟣 Purple   🟡 Yellow
🟠 Orange  🔴 Red     🟣 Indigo   🟦 Teal

Status Indicators:
✓ Green checkmark: Approved
⚠️ Yellow badge: Pending
```

## 🔄 Data Flow

### Creating an Announcement
```
User Input Form
    ↓
[createAnnouncement Server Action]
    ↓
Validation Check
    ↓
Insert into DB (announcements table)
    ↓
Refresh UI with [getAnnouncements]
    ↓
Display in AnnouncementsList
```

### Uploading a Document
```
File Selection
    ↓
[uploadDocument Server Action]
    ↓
Upload to Supabase Storage
    ↓
Create DB Record (event_documents table)
    ↓
Get Public URL
    ↓
Refresh UI with [getEventDocuments]
    ↓
Display in DocumentsList
```

### Viewing Participants
```
Event Detail Page Loads
    ↓
[getEventParticipants Server Action]
    ↓
Fetch with User Profile Data
    ↓
Separate by Status (approved/pending)
    ↓
ParticipantsList Component
    ↓
Render Avatar Icons with Tooltips
```

## 📊 Component Hierarchy

```
page.tsx (Server Component)
├── Fetch Data
│   ├── Event Details
│   ├── Announcements
│   ├── Documents
│   └── Participants
└── EventDetailClient.tsx (Client Component)
    ├── Layout & Typography
    ├── Organizer Dashboard (if applicable)
    │   ├── Statistics Cards
    │   ├── AnnouncementForm
    │   ├── AnnouncementsList
    │   ├── DocumentUpload
    │   ├── DocumentsList
    │   └── ParticipantsList
    └── Sidebar
        └── Event Registration Form
```

## 🔐 Security & Authorization

### Database-Level (RLS Policies)
```
Announcements:
✓ Organizer: Can view/create/delete own
✓ Participants: Can view registered events
✓ Admin: Can view all

Documents:
✓ Organizer: Can upload/delete own
✓ Participants: Can view/download
✓ Admin: Can manage all

Registrations:
✓ User: Can view/create own
✓ Organizer: Can view/manage own events
✓ Admin: Can manage all
```

### Application-Level (Server Actions)
```
Each Server Action:
1. Requires authentication (requireUser)
2. Checks organizer ownership
3. Validates input data
4. Returns errors if unauthorized
5. Only executes allowed operations
```

## 📱 Responsive Breakpoints

```
Statistics Grid:
• Mobile: 1 column (full width)
• Tablet: 2 columns (sm: grid-cols-2)
• Desktop: 4 columns (md: grid-cols-4)

Participant Avatars:
• Flex wrap with consistent spacing
• Tooltips position intelligently
• Icons scale appropriately
```

## ⌚ Real-time Updates

Currently implemented:
- ✓ Manual refresh after actions
- Manual page refresh shows latest data

Potential future enhancements:
- WebSocket for real-time updates
- Optimistic UI updates
- Background data synchronization

## 📈 Performance Features

- Server-side data fetching (No N+1 queries)
- Optimized database queries with joins
- Static avatar colors (no computation)
- Memoized components for rerenders
- CSS-based animations (GPU accelerated)

## 🌐 Internationalization

Currently:
- ✓ UI in Japanese (日本語)
- ✓ Dates in JST timezone (Asia/Tokyo)
- ✓ Proper number formatting

## ✨ Future Enhancement Ideas

1. **Real-time Notifications**
   - Websocket updates for new announcements
   - Email notifications for participants

2. **Advanced Document Management**
   - Document categories
   - Version control
   - Comments on documents

3. **Participant Management**
   - Bulk approval/rejection
   - CSV export
   - Attendance tracking

4. **Analytics**
   - Event analytics dashboard
   - Attendance statistics
   - Engagement metrics

5. **Accessibility**
   - Screen reader support
   - Keyboard navigation
   - High contrast mode
