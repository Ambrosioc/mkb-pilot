# Profile Photo Bucket Setup (Supabase Storage)

## Why?
Supabase Storage buckets (like `profile` for user profile photos) **cannot be created via SQL migrations**. They must be created manually in the Supabase Dashboard or via the Storage API. This is a Supabase limitation.

## When?
- **Onboarding a new developer**
- **After a `supabase db reset`**
- **When setting up the project locally for the first time**

## Steps to Create the `profile` Bucket

### Option 1: Manual Setup (Recommended for first time)

1. **Start your local Supabase instance**
   ```sh
   supabase start
   ```

2. **Go to the local Supabase Studio**
   - Open [http://localhost:54323/project/default/storage](http://localhost:54323/project/default/storage) in your browser.

3. **Create the bucket**
   - Click on **"New bucket"**
   - **Name:** `profile`
   - **Public bucket:** Yes (recommended for profile photos)
   - **File size limit:** 5MB (optional)
   - **Allowed mime types:** `image/jpeg`, `image/png`, `image/webp` (optional)
   - Click **"Create"**

4. **Set RLS Policies** (Required to avoid 403 errors)
   - Go to the "Policies" tab of the bucket
   - Add these policies one by one:

   **INSERT Policy:**
   - Name: `Users can upload their own profile photos`
   - Action: `INSERT`
   - Target: `authenticated`
   - Expression: `bucket_id = 'profile' AND (storage.foldername(name))[1] = auth.uid()::text`

   **UPDATE Policy:**
   - Name: `Users can update their own profile photos`
   - Action: `UPDATE`
   - Target: `authenticated`
   - Expression: `bucket_id = 'profile' AND (storage.foldername(name))[1] = auth.uid()::text`

   **DELETE Policy:**
   - Name: `Users can delete their own profile photos`
   - Action: `DELETE`
   - Target: `authenticated`
   - Expression: `bucket_id = 'profile' AND (storage.foldername(name))[1] = auth.uid()::text`

   **SELECT Policy:**
   - Name: `Public read access to profile photos`
   - Action: `SELECT`
   - Target: `public`
   - Expression: `bucket_id = 'profile'`

### Option 2: Automated Setup (After bucket creation)

1. **Create the bucket manually** (steps 1-3 above)

2. **Run the automated policy setup script**
   ```sh
   # Make sure SUPABASE_SERVICE_ROLE_KEY is set in your .env.local
   node scripts/setup-profile-policies.js
   ```

   This script will automatically create all the required RLS policies.

5. **Test**
   - Try uploading a profile photo from the app. If you get a `404 Bucket not found`, restart Supabase Studio and your app, and check the bucket name.

## Notes
- **This step is required for every new local environment.**
- In production, create the bucket in the Supabase web dashboard.
- If you change the bucket name in code, update it here and in the dashboard.

---

**If you see this error:**
```
{"statusCode":"404","error":"Bucket not found","message":"Bucket not found"}
```
It means the bucket does not exist. Follow the steps above! 