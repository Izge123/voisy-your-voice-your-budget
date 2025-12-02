-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'system',
  title TEXT NOT NULL,
  message TEXT,
  icon TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
ON public.notifications
FOR DELETE
USING (auth.uid() = user_id);

-- Index for fast unread count queries
CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- Insert test notifications for existing users (will be filtered by RLS)
INSERT INTO public.notifications (user_id, type, title, message, icon)
SELECT id, 'budget', 'Превышен бюджет', 'Вы потратили больше запланированного в этом месяце', '💰'
FROM auth.users
LIMIT 1;

INSERT INTO public.notifications (user_id, type, title, message, icon, created_at)
SELECT id, 'ai', 'Совет от AI', 'Попробуйте сократить расходы на транспорт', '🤖', now() - interval '1 day'
FROM auth.users
LIMIT 1;

INSERT INTO public.notifications (user_id, type, title, message, icon, is_read, created_at)
SELECT id, 'system', 'Добро пожаловать!', 'Спасибо что выбрали Voisy', '🎉', true, now() - interval '3 days'
FROM auth.users
LIMIT 1;