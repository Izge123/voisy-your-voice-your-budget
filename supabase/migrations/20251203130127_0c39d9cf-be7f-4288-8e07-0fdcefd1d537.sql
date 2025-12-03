-- Создаём таблицу подписок
CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'expired', 'active', 'cancelled')),
    plan TEXT NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
    trial_started_at TIMESTAMPTZ DEFAULT now(),
    trial_ends_at TIMESTAMPTZ DEFAULT (now() + interval '14 days'),
    subscription_started_at TIMESTAMPTZ,
    subscription_ends_at TIMESTAMPTZ,
    payment_provider TEXT,
    payment_id TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS политики
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
ON public.subscriptions FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Обновляем триггер handle_new_user для создания подписки
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  
  -- Create subscription with 14-day trial
  INSERT INTO public.subscriptions (user_id, status, plan, trial_started_at, trial_ends_at)
  VALUES (
    NEW.id,
    'trial',
    'free',
    now(),
    now() + interval '14 days'
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

-- Функция для проверки статуса подписки
CREATE OR REPLACE FUNCTION public.check_subscription_status(p_user_id UUID)
RETURNS TABLE (
    status TEXT,
    plan TEXT,
    days_remaining INTEGER,
    is_active BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
    v_subscription RECORD;
BEGIN
    SELECT * INTO v_subscription
    FROM public.subscriptions s
    WHERE s.user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT 'expired'::TEXT, 'free'::TEXT, 0, FALSE;
        RETURN;
    END IF;
    
    -- Автоматически обновляем статус если триал истёк
    IF v_subscription.status = 'trial' AND v_subscription.trial_ends_at < now() THEN
        UPDATE public.subscriptions
        SET status = 'expired', updated_at = now()
        WHERE subscriptions.user_id = p_user_id;
        
        RETURN QUERY SELECT 'expired'::TEXT, v_subscription.plan, 0, FALSE;
        RETURN;
    END IF;
    
    -- Проверяем активную подписку
    IF v_subscription.status = 'active' AND v_subscription.subscription_ends_at < now() THEN
        UPDATE public.subscriptions
        SET status = 'expired', updated_at = now()
        WHERE subscriptions.user_id = p_user_id;
        
        RETURN QUERY SELECT 'expired'::TEXT, v_subscription.plan, 0, FALSE;
        RETURN;
    END IF;
    
    -- Возвращаем текущий статус
    RETURN QUERY SELECT 
        v_subscription.status,
        v_subscription.plan,
        CASE 
            WHEN v_subscription.status = 'trial' THEN 
                GREATEST(0, EXTRACT(DAY FROM (v_subscription.trial_ends_at - now()))::INTEGER)
            WHEN v_subscription.status = 'active' THEN 
                GREATEST(0, EXTRACT(DAY FROM (v_subscription.subscription_ends_at - now()))::INTEGER)
            ELSE 0
        END,
        v_subscription.status IN ('trial', 'active');
END;
$$;