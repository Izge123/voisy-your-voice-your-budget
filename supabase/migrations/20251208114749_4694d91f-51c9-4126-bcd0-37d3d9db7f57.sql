-- Удалить старую функцию и создать новую с ends_at
DROP FUNCTION IF EXISTS public.check_subscription_status(uuid);

-- 1. Обновить handle_new_user: триал 14 → 30 дней
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data ->> 'full_name'
  );
  
  -- Create subscription with 30-day trial (changed from 14 to 30)
  INSERT INTO public.subscriptions (user_id, status, plan, trial_started_at, trial_ends_at)
  VALUES (
    NEW.id,
    'trial',
    'free',
    now(),
    now() + interval '30 days'
  );
  
  -- Create 4 default categories
  INSERT INTO public.categories (user_id, name, type, icon, color) VALUES
    (NEW.id, 'Еда', 'expense', '🍔', '#22c55e'),
    (NEW.id, 'Транспорт', 'expense', '🚕', '#3b82f6'),
    (NEW.id, 'Дом', 'expense', '🏠', '#f97316'),
    (NEW.id, 'Зарплата', 'income', '💰', '#10b981');
  
  RETURN NEW;
END;
$function$;

-- 2. Создать check_subscription_status с ends_at
CREATE FUNCTION public.check_subscription_status(p_user_id uuid)
RETURNS TABLE(
  status text, 
  plan text, 
  days_remaining integer, 
  is_active boolean,
  ends_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
    v_subscription RECORD;
BEGIN
    SELECT * INTO v_subscription
    FROM public.subscriptions s
    WHERE s.user_id = p_user_id;
    
    IF NOT FOUND THEN
        RETURN QUERY SELECT 'expired'::TEXT, 'free'::TEXT, 0, FALSE, NULL::timestamptz;
        RETURN;
    END IF;
    
    -- Автоматически обновляем статус если триал истёк
    IF v_subscription.status = 'trial' AND v_subscription.trial_ends_at < now() THEN
        UPDATE public.subscriptions
        SET status = 'expired', updated_at = now()
        WHERE subscriptions.user_id = p_user_id;
        
        RETURN QUERY SELECT 'expired'::TEXT, v_subscription.plan, 0, FALSE, v_subscription.trial_ends_at;
        RETURN;
    END IF;
    
    -- Проверяем активную подписку
    IF v_subscription.status = 'active' AND v_subscription.subscription_ends_at < now() THEN
        UPDATE public.subscriptions
        SET status = 'expired', updated_at = now()
        WHERE subscriptions.user_id = p_user_id;
        
        RETURN QUERY SELECT 'expired'::TEXT, v_subscription.plan, 0, FALSE, v_subscription.subscription_ends_at;
        RETURN;
    END IF;
    
    -- Возвращаем текущий статус с датой окончания
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
        v_subscription.status IN ('trial', 'active'),
        CASE 
            WHEN v_subscription.status = 'trial' THEN v_subscription.trial_ends_at
            WHEN v_subscription.status = 'active' THEN v_subscription.subscription_ends_at
            ELSE NULL
        END;
END;
$function$;