import { createClient } from "@supabase/supabase-js";

const email = process.env.ADMIN_EMAIL || "mai@powerway.jp";
const password = process.env.ADMIN_PASSWORD || "Dao123123";
const displayName = process.env.ADMIN_DISPLAY_NAME || "MAI";
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. Set them before running this script."
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function findUserByEmail(targetEmail) {
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: 100
    });

    if (error) throw error;

    const user = data.users.find(
      (candidate) => candidate.email?.toLowerCase() === targetEmail.toLowerCase()
    );

    if (user) return user;
    if (data.users.length < 100) return null;

    page += 1;
  }
}

const existingUser = await findUserByEmail(email);
let userId = existingUser?.id;

if (existingUser) {
  const { data, error } = await supabase.auth.admin.updateUserById(existingUser.id, {
    password,
    email_confirm: true,
    user_metadata: {
      ...existingUser.user_metadata,
      display_name: existingUser.user_metadata?.display_name || displayName
    }
  });

  if (error) throw error;
  userId = data.user.id;
  console.log(`Updated password and confirmed email for ${email}.`);
} else {
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: displayName,
      requested_role: "member"
    }
  });

  if (error) throw error;
  userId = data.user.id;
  console.log(`Created admin auth user ${email}.`);
}

const { error: profileError } = await supabase.from("profiles").upsert({
  id: userId,
  email,
  display_name: displayName,
  role: "admin",
  organizer_status: "approved"
});

if (profileError) throw profileError;

console.log(`Admin profile is ready: ${email} / ${password}`);
