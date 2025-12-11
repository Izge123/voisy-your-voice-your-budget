-- Update handle_new_user trigger to process promo code from user metadata
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_promo_code TEXT;
  v_blogger_id UUID;
  v_trial_days INTEGER := 7; -- Default 7 days trial
BEGIN
  -- Get promo code from user metadata
  v_promo_code := UPPER(TRIM(NEW.raw_user_meta_data ->> 'promo_code'));
  
  -- If promo code exists, validate it
  IF v_promo_code IS NOT NULL AND v_promo_code != '' THEN
    SELECT id INTO v_blogger_id
    FROM public.bloggers
    WHERE promo_code = v_promo_code;
    
    -- If promo code is valid, give 14 days trial
    IF v_blogger_id IS NOT NULL THEN
      v_trial_days := 14;
    END IF;
  END IF;

  -- Create profile with promo code if valid
  INSERT INTO public.profiles (id, email, full_name, promo_code_used, referred_by_blogger_id)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name',
    CASE WHEN v_blogger_id IS NOT NULL THEN v_promo_code ELSE NULL END,
    v_blogger_id
  );
  
  -- Create subscription with dynamic trial period
  INSERT INTO public.subscriptions (user_id, status, plan, trial_started_at, trial_ends_at)
  VALUES (
    NEW.id,
    'trial',
    'free',
    now(),
    now() + (v_trial_days || ' days')::interval
  );
  
  -- Create 4 default categories
  INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
    (NEW.id, 'Еда', 'expense', '🍔', '#22c55e'),
    (NEW.id, 'Транспорт', 'expense', '🚕', '#3b82f6'),
    (NEW.id, 'Дом', 'expense', '🏠', '#f97316'),
    (NEW.id, 'Зарплата', 'income', '💰', '#10b981');
  
  RETURN NEW;
END;
$$;