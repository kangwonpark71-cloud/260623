-- =============================================
-- 냉장고 레시피 App - Supabase Schema
-- =============================================

-- 1. PROFILES (사용자 프로필)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL PRIMARY KEY,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  preferences JSONB DEFAULT jsonb_build_object(
    'cuisineTypes', '[]'::jsonb,
    'difficulty', '[]'::jsonb,
    'maxCookingTime', 60,
    'servingSize', 2,
    'dietaryRestrictions', '[]'::jsonb
  )
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Auto-create profile on signup
CREATE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. INGREDIENTS (마스터 재료 목록)
CREATE TABLE ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '📦',
  category TEXT CHECK (category IN (
    'vegetable', 'fruit', 'meat', 'seafood', 'dairy',
    'condiment', 'grain', 'seasoning', 'other'
  )),
  shelf_life_days INTEGER DEFAULT 7,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ingredients are publicly readable"
  ON ingredients FOR SELECT
  USING (true);


-- 3. FRIDGE ITEMS (사용자 냉장고 속 재료)
CREATE TABLE fridge_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '📦',
  quantity TEXT DEFAULT '약간',
  category TEXT DEFAULT 'other',
  added_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  is_expiring_soon BOOLEAN GENERATED ALWAYS AS (
    expires_at IS NOT NULL
    AND expires_at <= NOW() + INTERVAL '3 days'
    AND expires_at > NOW()
  ) STORED,
  is_expired BOOLEAN GENERATED ALWAYS AS (
    expires_at IS NOT NULL AND expires_at <= NOW()
  ) STORED,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE fridge_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fridge items"
  ON fridge_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fridge items"
  ON fridge_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fridge items"
  ON fridge_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fridge items"
  ON fridge_items FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_fridge_items_user_id ON fridge_items(user_id);
CREATE INDEX idx_fridge_items_expires_at ON fridge_items(expires_at);
CREATE INDEX idx_fridge_items_user_expiry ON fridge_items(user_id, expires_at);


-- 4. RECIPES (레시피 마스터)
CREATE TABLE recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cooking_time_minutes INTEGER,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  cuisine_type TEXT,
  image_url TEXT,
  instructions JSONB DEFAULT '[]'::jsonb,
  tips JSONB DEFAULT '[]'::jsonb,
  is_ai_generated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipes are publicly readable"
  ON recipes FOR SELECT
  USING (true);


-- 5. RECIPE INGREDIENTS (레시피-재료 연결)
CREATE TABLE recipe_ingredients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  ingredient_id UUID REFERENCES ingredients(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  emoji TEXT DEFAULT '📦',
  quantity TEXT,
  is_optional BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

ALTER TABLE recipe_ingredients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Recipe ingredients are publicly readable"
  ON recipe_ingredients FOR SELECT
  USING (true);

CREATE INDEX idx_recipe_ingredients_recipe_id ON recipe_ingredients(recipe_id);


-- 6. SAVED RECIPES (사용자 저장 레시피)
CREATE TABLE saved_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE NOT NULL,
  cooked_count INTEGER DEFAULT 0,
  notes TEXT,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, recipe_id)
);

ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own saved recipes"
  ON saved_recipes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can save recipes"
  ON saved_recipes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own saved recipes"
  ON saved_recipes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own saved recipes"
  ON saved_recipes FOR DELETE
  USING (auth.uid() = user_id);


-- 7. SCAN HISTORY (스캔 기록)
CREATE TABLE scan_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  image_url TEXT,
  detected_items JSONB DEFAULT '[]'::jsonb,
  status TEXT DEFAULT 'completed' CHECK (status IN ('processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE scan_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own scan history"
  ON scan_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own scan history"
  ON scan_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);


-- 8. NOTIFICATIONS (알림)
CREATE TABLE notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT,
  type TEXT DEFAULT 'expiration' CHECK (type IN ('expiration', 'recipe', 'system')),
  related_item_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own notifications"
  ON notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert notifications"
  ON notifications FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read);


-- 9. STORAGE BUCKET (냉장고 사진 저장)
INSERT INTO storage.buckets (id, name, public) VALUES ('fridge-photos', 'fridge-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Fridge photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'fridge-photos');

CREATE POLICY "Users can upload fridge photos"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'fridge-photos'
    AND auth.role() = 'authenticated'
  );

CREATE POLICY "Users can delete own fridge photos"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'fridge-photos'
    AND auth.uid() = owner
  );


-- 10. ENABLE REALTIME for notifications and fridge_items
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;
ALTER PUBLICATION supabase_realtime ADD TABLE fridge_items;
