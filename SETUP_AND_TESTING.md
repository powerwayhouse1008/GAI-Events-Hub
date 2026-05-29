# Setup & Testing Guide

## 🗄️ Database Setup Instructions

### Step 1: Apply Database Migrations

Run the SQL from `supabase/schema.sql` in your Supabase SQL editor:

```bash
# Copy the entire contents of supabase/schema.sql
# and execute in Supabase dashboard -> SQL Editor
```

This creates:
- ✓ `announcements` table
- ✓ `event_documents` table  
- ✓ `event_documents` storage bucket
- ✓ RLS policies for all tables

### Step 2: Verify Tables Created

Check Supabase dashboard:
1. Go to "Database" → "Tables"
2. Verify you see:
   - `announcements`
   - `event_documents`
3. Go to "Storage"
4. Verify you see:
   - `event-documents` bucket

### Step 3: Environment Setup

Create `.env.local` in project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Get these values from:
- Supabase Dashboard → Settings → API

## 🚀 Running the Application

### Development Server

```bash
# Navigate to project directory
cd gai-events-nextjs-supabase

# Start development server
npm run dev
# or
node node_modules/next/dist/bin/next dev
```

Server runs at: `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

## ✅ Feature Testing Checklist

### Test Suite 1: Organizer Announcements

**Setup:**
- [ ] Login as event organizer
- [ ] Navigate to your created event
- [ ] Scroll down to see "通知" (Announcements) section

**Create Announcement:**
- [ ] Click "新しい通知" button
- [ ] Modal opens with title and content fields
- [ ] Enter test title: "テスト通知"
- [ ] Enter test content: "これはテスト通知です"
- [ ] Click "送信" button
- [ ] Verify loading state shows "送信中..."
- [ ] Verify announcement appears in list below
- [ ] Verify timestamp shows correct date/time

**Delete Announcement:**
- [ ] Hover over announcement
- [ ] Click trash icon
- [ ] Confirm deletion dialog
- [ ] Verify announcement removed from list
- [ ] Verify error handling if deletion fails

**Multiple Announcements:**
- [ ] Create 3+ announcements
- [ ] Verify they display in reverse chronological order
- [ ] Verify timestamps are different
- [ ] Verify all can be deleted independently

### Test Suite 2: Document Management

**Setup:**
- [ ] Still logged in as organizer
- [ ] On same event page
- [ ] Scroll to "ドキュメント" (Documents) section

**Upload Document:**
- [ ] Click "ファイルをアップロード" button
- [ ] Modal opens with file input
- [ ] Click dashed area to open file picker
- [ ] Select a PDF or text file
- [ ] Enter optional title
- [ ] Click "アップロード" button
- [ ] Verify loading state shows "アップロード中..."
- [ ] Verify file appears in list with:
  - [ ] Correct filename
  - [ ] File size display
  - [ ] Upload timestamp
  - [ ] Download icon
  - [ ] Delete button (organizer only)

**Download Document:**
- [ ] Click on document entry
- [ ] File should download
- [ ] Verify downloaded file is correct

**Test File Size Limit:**
- [ ] Try uploading file > 50MB
- [ ] Should show error: "ファイルサイズは50MB以下"
- [ ] Try uploading valid file again
- [ ] Should succeed

**Multiple Documents:**
- [ ] Upload 5+ different file types
- [ ] Verify appropriate icons show:
  - [ ] PDF files → 📄 icon
  - [ ] Images → 🖼️ icon
  - [ ] Documents → 📄 icon
- [ ] Verify each can be deleted independently

### Test Suite 3: Participant Display

**Setup:**
- [ ] Still on organizer's event page
- [ ] Scroll to "参加者" (Participants) section

**Statistics Display:**
- [ ] Verify statistics cards show:
  - [ ] Total "申請中" (Pending) count
  - [ ] Total "承認済み" (Approved) count
  - [ ] Total applications count
  - [ ] Event capacity

**Avatar Display:**
- [ ] Verify approved participants show as colored circles
- [ ] Verify each avatar has unique color
- [ ] Verify 2-letter initials shown
- [ ] Verify "承認済み" section header
- [ ] Verify approved avatars grouped together

**Pending Status:**
- [ ] Verify pending participants show with ⚠️ badge
- [ ] Verify opacity/styling differs from approved
- [ ] Verify "申請中" section header
- [ ] Verify count shows correctly

**Tooltip Functionality:**
- [ ] Hover over any avatar
- [ ] Tooltip appears with:
  - [ ] Display name
  - [ ] Company (if available)
  - [ ] Email
  - [ ] Registration date/time
  - [ ] Status badge (色に応じて)
- [ ] Hover over different avatars
- [ ] Each shows correct person's info

**Responsive Layout:**
- [ ] Resize browser window
- [ ] Avatars should wrap to new lines
- [ ] Spacing consistent on all sizes
- [ ] Tooltips position correctly

### Test Suite 4: Participant View

**Setup:**
- [ ] Logout current session
- [ ] Login as regular user (not organizer)
- [ ] Find organizer's event
- [ ] Register/apply for event

**View Announcements:**
- [ ] Verify announcements section shows
- [ ] Verify organizer's announcements visible
- [ ] Verify delete button NOT shown
- [ ] Verify can read full content

**View Documents:**
- [ ] Verify documents section shows
- [ ] Verify all uploaded files visible
- [ ] Verify download button works
- [ ] Verify delete button NOT shown
- [ ] Download file and verify content

**Hidden Elements:**
- [ ] Verify statistics cards NOT shown
- [ ] Verify "新しい通知" button NOT shown
- [ ] Verify "ファイルをアップロード" button NOT shown
- [ ] Verify participants section NOT shown

### Test Suite 5: Authorization & Security

**Test Organizer-Only Access:**
- [ ] Login as User A (organizer)
- [ ] Create announcement
- [ ] Delete should work ✓
- [ ] Login as User B (participant)
- [ ] Find same event
- [ ] Delete button should NOT appear ✓

**Test Document Permissions:**
- [ ] Organizer uploads document
- [ ] Participant can download ✓
- [ ] Participant cannot delete ✓
- [ ] Admin user can view all ✓

**Test RLS Policies:**
- [ ] Unauthenticated users cannot see announcements ✓
- [ ] Only registered participants see content ✓
- [ ] Only organizer manages their event ✓

### Test Suite 6: Error Handling

**Test Announcements:**
- [ ] Try creating empty announcement
- [ ] Should show error: "Please fill in all fields"
- [ ] Try creating with only title
- [ ] Should show same error
- [ ] Test successful creation

**Test Documents:**
- [ ] Try uploading without selecting file
- [ ] Should show error: "ファイルを選択してください"
- [ ] Try uploading oversized file
- [ ] Should show size error
- [ ] Test successful upload

**Test Network Errors:**
- [ ] Open DevTools → Network tab
- [ ] Simulate offline (Throttle)
- [ ] Try creating announcement
- [ ] Should show error message
- [ ] Go back online
- [ ] Should work normally

### Test Suite 7: UI/UX Quality

**Visual Design:**
- [ ] Statistics cards show gradient backgrounds
- [ ] Buttons have proper styling
- [ ] Forms look polished
- [ ] Colors are consistent
- [ ] Typography is clear

**Interactions:**
- [ ] Buttons show loading state
- [ ] Modals open/close smoothly
- [ ] Hovers show visual feedback
- [ ] Icons are aligned properly

**Responsive Design:**
- [ ] Test on mobile (375px width)
- [ ] Test on tablet (768px width)
- [ ] Test on desktop (1920px width)
- [ ] All layouts look good

### Test Suite 8: Japanese Localization

**Verify All Japanese Text:**
- [ ] 新しい通知 - New notification button
- [ ] 通知 - Announcements header
- [ ] ファイルをアップロード - Upload file button
- [ ] ドキュメント - Documents header
- [ ] 参加者 - Participants header
- [ ] 送信中... - Sending...
- [ ] イベント統計 - Event statistics
- [ ] 承認済み - Approved
- [ ] 申請中 - Pending
- [ ] 参加者申請 - Participant applications

**Verify Dates:**
- [ ] Check timestamps in announcements
- [ ] Should be in format: 2026-05-29 10:30:00
- [ ] Should be JST timezone (Asia/Tokyo)

## 🐛 Debugging Tips

### Check Console Errors
```bash
# In browser DevTools → Console
# Should see no errors related to:
# - Component rendering
# - Server action calls
# - TypeScript type issues
```

### Check Network Tab
```bash
# In browser DevTools → Network
# Verify requests to:
# - Server actions complete successfully
# - File uploads complete
# - All responses have 200/201 status
```

### Check Supabase Logs
```bash
# Supabase Dashboard → Logs
# Monitor:
# - Database queries
# - RLS policy violations
# - Storage uploads
# - Error messages
```

### Common Issues & Fixes

**Issue: "Cannot find module" errors**
- Fix: Make sure imports use correct paths
- Use: `@/` prefix for workspace imports

**Issue: "Type 'any' not assignable"**
- Fix: Ensure proper types on all variables
- Use: ` as Type` for type assertions when needed

**Issue: Supabase environment variables missing**
- Fix: Create `.env.local` file
- Add: All required NEXT_PUBLIC_* and SUPABASE_* keys

**Issue: Files not uploading**
- Fix: Check Supabase storage bucket permissions
- Fix: Verify storage bucket name is `event-documents`
- Fix: Check RLS policies allow insert

**Issue: Announcements not deleting**
- Fix: Verify RLS policy allows delete
- Fix: Check you're logged in as organizer
- Fix: Ensure event_id matches

## 📊 Performance Testing

### Page Load Time
- [ ] Open DevTools → Performance
- [ ] Load event page with 20+ participants
- [ ] Load event page with 10+ documents
- [ ] Load event page with 15+ announcements
- [ ] Should load < 3 seconds

### Interaction Performance
- [ ] Create announcement → Should appear < 1s
- [ ] Delete announcement → Should remove < 1s
- [ ] Upload file → Should complete based on file size
- [ ] Hover over avatar → Tooltip appears < 100ms

## 🎯 Final Verification Checklist

- [ ] All TypeScript errors resolved
- [ ] Development server runs without errors
- [ ] All 8 test suites pass
- [ ] Database migrations applied
- [ ] Environment variables configured
- [ ] Responsive design verified
- [ ] Japanese text correct
- [ ] Error handling works
- [ ] Security policies enforced
- [ ] Performance acceptable

## ✨ Ready for Production Checklist

- [ ] Run `npm run build` successfully
- [ ] No console errors in production build
- [ ] Test all features in production build
- [ ] Database backup created
- [ ] RLS policies tested
- [ ] Performance metrics reviewed
- [ ] Security audit complete
- [ ] Documentation updated
- [ ] Team trained on features
- [ ] Deployment plan ready

## 📞 Support & Troubleshooting

If you encounter issues:

1. **Check the console** for error messages
2. **Review Supabase logs** for database issues
3. **Check file permissions** in storage
4. **Verify RLS policies** are correctly set
5. **Test in incognito mode** to rule out cache issues
6. **Review the implementation files** for logic issues

For detailed technical information, see:
- `IMPLEMENTATION_SUMMARY.md` - Feature overview
- `FEATURES_VISUAL_GUIDE.md` - UI/UX details
- Code comments in component files
