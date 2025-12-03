-- Insert trial subscriptions for existing users who don't have one
INSERT INTO public.subscriptions (user_id, status, plan, trial_started_at, trial_ends_at)
SELECT p.id, 'trial', 'free', now(), now() + interval '14 days'
FROM public.profiles p
LEFT JOIN public.subscriptions s ON p.id = s.user_id
WHERE s.id IS NULL
ON CONFLICT (user_id) DO NOTHING;