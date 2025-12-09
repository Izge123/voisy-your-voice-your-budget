import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
const Privacy = () => {
  return <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" aria-label="Назад на главную">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold font-manrope">Политика конфиденциальности</h1>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <article className="prose prose-slate dark:prose-invert max-w-none font-inter">
          <p className="text-muted-foreground text-sm mb-8">
            Дата последнего обновления: 9 декабря 2025 г.
          </p>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-manrope mb-4">1. Общие положения</h2>
            <p className="text-foreground/80 mb-4">
              1.1. Настоящая Политика конфиденциальности (далее — «Политика») определяет порядок обработки и защиты персональных данных пользователей веб-приложения Kapitallo (далее — «Сервис»).
            </p>
            <p className="text-foreground/80 mb-4">
              1.2. Используя Сервис, Пользователь выражает согласие с условиями настоящей Политики.
            </p>
            <p className="text-foreground/80">
              1.3. Мы серьёзно относимся к защите ваших данных и принимаем все необходимые меры для их безопасности.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-manrope mb-4">2. Какие данные мы собираем</h2>
            <h3 className="text-lg font-medium font-manrope mb-3">2.1. Данные, предоставляемые Пользователем:</h3>
            <ul className="list-disc pl-6 text-foreground/80 mb-4 space-y-2">
              <li>Адрес электронной почты (для регистрации и авторизации)</li>
              <li>Имя и фамилия (опционально)</li>
              <li>Фотография профиля (опционально)</li>
              <li>Финансовые данные: транзакции, категории, описания расходов и доходов</li>
              <li>Информация AI-профиля: финансовые цели, уровень грамотности, жизненные теги</li>
            </ul>
            <h3 className="text-lg font-medium font-manrope mb-3">2.2. Данные, собираемые автоматически:</h3>
            <ul className="list-disc pl-6 text-foreground/80 space-y-2">
              <li>Техническая информация об устройстве и браузере</li>
              <li>Данные об использовании Сервиса (просмотренные страницы, действия)</li>
              <li>IP-адрес (для безопасности и аналитики)</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-manrope mb-4">3. Как мы используем данные</h2>
            <p className="text-foreground/80 mb-4">
              3.1. Ваши данные используются для:
            </p>
            <ul className="list-disc pl-6 text-foreground/80 mb-4 space-y-2">
              <li><strong>Предоставления услуг</strong> — учёт транзакций, аналитика, категоризация</li>
              <li><strong>Персонализации</strong> — адаптация AI-консультанта под ваш профиль</li>
              <li><strong>Улучшения Сервиса</strong> — анализ использования для развития функций</li>
              <li><strong>Коммуникации</strong> — уведомления о важных изменениях, поддержка</li>
              <li><strong>Безопасности</strong> — предотвращение несанкционированного доступа</li>
            </ul>
            <p className="text-foreground/80">
              3.2. Мы не используем ваши финансовые данные для рекламы или продажи третьим лицам.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-manrope mb-4">4. Обработка голосовых данных</h2>
            <p className="text-foreground/80 mb-4">
              4.1. При использовании голосового ввода:
            </p>
            <ul className="list-disc pl-6 text-foreground/80 mb-4 space-y-2">
              <li>Аудиозапись передаётся на сервер для распознавания речи</li>
              <li>Распознавание выполняется с помощью OpenAI Whisper API</li>
              <li>Аудиозаписи не сохраняются после обработки</li>
              <li>Сохраняется только текстовый результат распознавания</li>
            </ul>
            <p className="text-foreground/80">
              4.2. Текст распознавания обрабатывается AI для извлечения структурированных данных о транзакциях.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-manrope mb-4">5. AI-обработка данных</h2>
            <p className="text-foreground/80 mb-4">
              5.1. Для работы AI-консультанта и голосового ввода мы используем:
            </p>
            <ul className="list-disc pl-6 text-foreground/80 mb-4 space-y-2">
              <li><strong>Lovable AI (Google Gemini)</strong>Google Gemini — для анализа транзакций и финансовых консультаций</li>
              <li><strong>OpenAI Whisper</strong> — для распознавания голоса</li>
            </ul>
            <p className="text-foreground/80 mb-4">
              5.2. При обращении к AI передаются:
            </p>
            <ul className="list-disc pl-6 text-foreground/80 mb-4 space-y-2">
              <li>Данные вашего AI-профиля (цели, уровень грамотности)</li>
              <li>Агрегированная статистика транзакций за последние 30 дней</li>
              <li>Текст вашего вопроса</li>
            </ul>
            <p className="text-foreground/80">
              5.3. AI-провайдеры обрабатывают данные в соответствии с их политиками конфиденциальности и не используют их для обучения моделей.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-manrope mb-4">6. Хранение данных</h2>
            <p className="text-foreground/80 mb-4">
              6.1. Данные хранятся на серверах Supabase (инфраструктура AWS).
            </p>
            <p className="text-foreground/80 mb-4">
              6.2. Применяемые меры защиты:
            </p>
            <ul className="list-disc pl-6 text-foreground/80 mb-4 space-y-2">
              <li>Шифрование данных при передаче (HTTPS/TLS)</li>
              <li>Шифрование данных при хранении</li>
              <li>Row Level Security (RLS) — изоляция данных пользователей на уровне базы данных</li>
              <li>Регулярное резервное копирование</li>
            </ul>
            <p className="text-foreground/80">
              6.3. Данные хранятся в течение всего срока существования аккаунта и удаляются при его удалении.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-manrope mb-4">7. Передача данных третьим лицам</h2>
            <p className="text-foreground/80 mb-4">
              7.1. Мы не продаём и не передаём ваши персональные данные третьим лицам, за исключением:
            </p>
            <ul className="list-disc pl-6 text-foreground/80 mb-4 space-y-2">
              <li><strong>Технические провайдеры</strong> — Supabase (хостинг, база данных), OpenAI (распознавание речи), Google (AI)</li>
              <li><strong>Платёжные системы</strong> — для обработки платежей за подписку</li>
              <li><strong>По требованию закона</strong> — при наличии законного запроса от уполномоченных органов</li>
            </ul>
            <p className="text-foreground/80">
              7.2. Все технические провайдеры связаны обязательствами по защите данных.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-manrope mb-4">8. Cookies и localStorage</h2>
            <p className="text-foreground/80 mb-4">
              8.1. Мы используем:
            </p>
            <ul className="list-disc pl-6 text-foreground/80 mb-4 space-y-2">
              <li><strong>Сессионные cookies</strong> — для поддержания авторизации</li>
              <li><strong>localStorage</strong> — для хранения настроек интерфейса и кэширования</li>
            </ul>
            <p className="text-foreground/80">
              8.2. Мы не используем cookies для рекламного отслеживания.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-manrope mb-4">9. Ваши права</h2>
            <p className="text-foreground/80 mb-4">
              9.1. Вы имеете право:
            </p>
            <ul className="list-disc pl-6 text-foreground/80 mb-4 space-y-2">
              <li><strong>Доступ</strong> — запросить копию ваших данных</li>
              <li><strong>Исправление</strong> — изменить неточные данные в настройках профиля</li>
              <li><strong>Удаление</strong> — удалить аккаунт и все связанные данные</li>
              <li><strong>Экспорт</strong> — выгрузить ваши транзакции</li>
              <li><strong>Отзыв согласия</strong> — прекратить использование Сервиса в любой момент</li>
            </ul>
            <p className="text-foreground/80">
              9.2. Для реализации прав обратитесь: <a href="mailto:hello@kapitallo.com" className="text-primary hover:underline">hello@kapitallo.com</a>
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-manrope mb-4">10. Защита данных детей</h2>
            <p className="text-foreground/80">
              Сервис не предназначен для лиц младше 18 лет. Мы сознательно не собираем данные несовершеннолетних. Если вы считаете, что ребёнок предоставил нам данные, свяжитесь с нами для их удаления.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-manrope mb-4">11. Изменения политики</h2>
            <p className="text-foreground/80 mb-4">
              11.1. Мы можем обновлять настоящую Политику. Актуальная версия всегда доступна по адресу: kapitallo.com/privacy
            </p>
            <p className="text-foreground/80">
              11.2. О существенных изменениях мы уведомим по электронной почте или через уведомление в Сервисе.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-manrope mb-4">12. Контактная информация</h2>
            <p className="text-foreground/80">
              По вопросам, связанным с обработкой персональных данных, обращайтесь: <a href="mailto:info@kapitallo.com" className="text-primary hover:underline">info@kapitallo.com</a>
            </p>
          </section>
        </article>
      </main>
    </div>;
};
export default Privacy;