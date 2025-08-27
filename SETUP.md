# Supabase Authentication Setup

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up/Login and create a new project
3. Wait for the project to be ready

## 2. Get Your Project Credentials

1. In your Supabase dashboard, go to **Settings** → **API**
2. Copy your **Project URL** and **anon/public key**

## 3. Set Environment Variables

1. Create a `.env` file in your project root
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## 4. Configure Authentication

1. In Supabase dashboard, go to **Authentication** → **Settings**
2. Enable **Email confirmations** (recommended)
3. Configure your site URL in **Site URL**
4. Add your domain to **Redirect URLs** if needed

## 5. Database Schema (Optional)

If you want to store additional user data, create a `profiles` table:

```sql
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
```

## 6. Test the Authentication

1. Run your app: `npm run dev`
2. Click "Sign up" button
3. Fill out the form and submit
4. Check your email for verification
5. Try signing in with your credentials

## Features Implemented

- ✅ User registration with email/password
- ✅ Email verification
- ✅ User sign in
- ✅ Form validation
- ✅ Loading states
- ✅ Error handling
- ✅ Success messages
- ✅ Modal switching between Sign Up/Sign In

## Next Steps

- Add user profile management
- Implement password reset
- Add social authentication (Google, GitHub)
- Create protected routes
- Add user state management
- Implement quiz functionality with user data
