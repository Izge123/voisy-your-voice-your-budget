-- Delete all test/hardcoded notifications
DELETE FROM public.notifications;

-- Create function to send welcome notification to new users
CREATE OR REPLACE FUNCTION public.send_welcome_notification()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, icon, metadata)
  VALUES (
    NEW.id,
    'tutorial',
    'Добро пожаловать в Voisy! 🎉',
    'Узнайте, как быстро начать управлять финансами с помощью голоса',
    '👋',
    jsonb_build_object(
      'is_tutorial', true,
      'steps', jsonb_build_array(
        jsonb_build_object('icon', '🎤', 'title', 'Голосовой ввод', 'description', 'Нажмите на микрофон и скажите: "Потратил 500 на кофе". AI автоматически распознает сумму и категорию.'),
        jsonb_build_object('icon', '📂', 'title', 'Категории', 'description', 'Создавайте свои категории расходов и доходов. Группируйте их для удобного анализа.'),
        jsonb_build_object('icon', '📊', 'title', 'Аналитика', 'description', 'Смотрите куда уходят деньги. Графики покажут структуру расходов по категориям и динамику по дням.'),
        jsonb_build_object('icon', '🤖', 'title', 'AI-консультант', 'description', 'Задавайте вопросы о своих финансах. AI проанализирует ваши траты и даст персональные рекомендации.')
      )
    )
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger on profiles table (created after user signup)
DROP TRIGGER IF EXISTS on_profile_created_send_welcome ON public.profiles;
CREATE TRIGGER on_profile_created_send_welcome
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.send_welcome_notification();