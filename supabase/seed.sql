-- Sau khi tạo tài khoản admin trong web, chạy câu này để set admin:
-- update public.profiles set role = 'admin', organizer_status = 'approved' where email = 'YOUR_EMAIL@gmail.com';

insert into public.events (
  title, description, organizer_id, organizer_name, category, region, location,
  starts_at, ends_at, ticket_price, approval_mode, status, featured
)
select
  'Liquid AI Showcase: Frontier Speech Systems',
  'AI frontier speech systems, post-training RL and edge VLMs.',
  id,
  'Global AI Industry Alliance',
  'AI',
  'Tokyo',
  'Tokyo',
  now() + interval '7 days',
  now() + interval '7 days' + interval '2 hours',
  0,
  'manual',
  'published',
  true
from public.profiles
limit 1;
