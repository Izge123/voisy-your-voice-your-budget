import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const Offer = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon" aria-label="Назад на главную">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-lg font-semibold font-manrope">Публичная оферта</h1>
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
              1.1. Настоящий документ является публичной офертой (далее — «Оферта») и содержит все существенные условия предоставления доступа к веб-приложению Kapitallo (далее — «Сервис»).
            </p>
            <p className="text-foreground/80 mb-4">
              1.2. В соответствии с положениями применимого законодательства, данная Оферта является публичным предложением, адресованным неопределённому кругу лиц.
            </p>
            <p className="text-foreground/80 mb-4">
              1.3. Акцептом (принятием) настоящей Оферты является регистрация в Сервисе и/или использование функций Сервиса.
            </p>
            <p className="text-foreground/80">
              1.4. Оферта вступает в силу с момента её акцепта Пользователем.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-manrope mb-4">2. Термины и определения</h2>
            <p className="text-foreground/80 mb-4">
              2.1. <strong>Сервис</strong> — веб-приложение Kapitallo, доступное по адресу kapitallo.com, включая все его функции и возможности.
            </p>
            <p className="text-foreground/80 mb-4">
              2.2. <strong>Пользователь</strong> — физическое лицо, акцептовавшее Оферту и использующее Сервис.
            </p>
            <p className="text-foreground/80 mb-4">
              2.3. <strong>Администрация</strong> — владельцы и операторы Сервиса Kapitallo.
            </p>
            <p className="text-foreground/80">
              2.4. <strong>Подписка</strong> — платный тарифный план, предоставляющий расширенный доступ к функциям Сервиса.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-manrope mb-4">3. Предмет оферты</h2>
            <p className="text-foreground/80 mb-4">
              3.1. Администрация предоставляет Пользователю неисключительное право использования Сервиса для личного учёта финансов.
            </p>
            <p className="text-foreground/80 mb-4">
              3.2. Сервис предоставляет следующие функции:
            </p>
            <ul className="list-disc pl-6 text-foreground/80 mb-4 space-y-2">
              <li>Голосовой ввод транзакций с автоматической категоризацией</li>
              <li>Сплит-транзакции (разделение чека на категории)</li>
              <li>Аналитика расходов и доходов</li>
              <li>AI-консультант по финансовым вопросам</li>
              <li>Управление категориями и подкатегориями</li>
            </ul>
            <p className="text-foreground/80">
              3.3. Сервис предоставляется «как есть» (as is). Администрация не гарантирует, что Сервис будет соответствовать целям и ожиданиям Пользователя.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-manrope mb-4">4. Тарифы и оплата</h2>
            <p className="text-foreground/80 mb-4">
              4.1. <strong>Пробный период (Trial)</strong> — 30 дней бесплатного полного доступа ко всем функциям Сервиса. Привязка банковской карты не требуется.
            </p>
            <p className="text-foreground/80 mb-4">
              4.2. <strong>Подписка PRO</strong> — $4.99 USD в месяц. Предоставляет полный доступ ко всем функциям после окончания пробного периода.
            </p>
            <p className="text-foreground/80 mb-4">
              4.3. Оплата производится ежемесячно в начале каждого расчётного периода.
            </p>
            <p className="text-foreground/80 mb-4">
              4.4. По окончании пробного периода без оформления подписки доступ к Сервису переходит в режим «только чтение».
            </p>
            <p className="text-foreground/80">
              4.5. Администрация оставляет за собой право изменять стоимость подписки, уведомив Пользователей не менее чем за 30 дней.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-manrope mb-4">5. Права и обязанности сторон</h2>
            <h3 className="text-lg font-medium font-manrope mb-3">5.1. Пользователь обязуется:</h3>
            <ul className="list-disc pl-6 text-foreground/80 mb-4 space-y-2">
              <li>Предоставлять достоверную информацию при регистрации</li>
              <li>Не передавать доступ к своему аккаунту третьим лицам</li>
              <li>Не использовать Сервис для незаконных целей</li>
              <li>Соблюдать условия настоящей Оферты</li>
            </ul>
            <h3 className="text-lg font-medium font-manrope mb-3">5.2. Администрация обязуется:</h3>
            <ul className="list-disc pl-6 text-foreground/80 space-y-2">
              <li>Обеспечивать доступ к Сервису 24/7 (за исключением технических работ)</li>
              <li>Защищать персональные данные Пользователя</li>
              <li>Уведомлять о существенных изменениях в работе Сервиса</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-manrope mb-4">6. Ограничение ответственности</h2>
            <p className="text-foreground/80 mb-4">
              6.1. Администрация не несёт ответственности за:
            </p>
            <ul className="list-disc pl-6 text-foreground/80 mb-4 space-y-2">
              <li>Финансовые решения, принятые Пользователем на основе данных Сервиса</li>
              <li>Рекомендации AI-консультанта (носят информационный характер)</li>
              <li>Временную недоступность Сервиса по техническим причинам</li>
              <li>Потерю данных вследствие действий Пользователя</li>
            </ul>
            <p className="text-foreground/80">
              6.2. Максимальная ответственность Администрации ограничивается суммой, уплаченной Пользователем за последний месяц подписки.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-manrope mb-4">7. Срок действия и расторжение</h2>
            <p className="text-foreground/80 mb-4">
              7.1. Оферта действует бессрочно с момента акцепта.
            </p>
            <p className="text-foreground/80 mb-4">
              7.2. Пользователь вправе в любой момент прекратить использование Сервиса и удалить свой аккаунт.
            </p>
            <p className="text-foreground/80 mb-4">
              7.3. Администрация вправе заблокировать доступ Пользователя при нарушении условий Оферты.
            </p>
            <p className="text-foreground/80">
              7.4. При удалении аккаунта все данные Пользователя удаляются безвозвратно.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-manrope mb-4">8. Заключительные положения</h2>
            <p className="text-foreground/80 mb-4">
              8.1. Администрация оставляет за собой право вносить изменения в настоящую Оферту.
            </p>
            <p className="text-foreground/80 mb-4">
              8.2. Актуальная версия Оферты всегда доступна по адресу: kapitallo.com/offer
            </p>
            <p className="text-foreground/80">
              8.3. Продолжение использования Сервиса после изменения Оферты означает согласие с новыми условиями.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl font-semibold font-manrope mb-4">9. Контактная информация</h2>
            <p className="text-foreground/80">
              По всем вопросам, связанным с настоящей Офертой, обращайтесь: <a href="mailto:hello@kapitallo.com" className="text-primary hover:underline">hello@kapitallo.com</a>
            </p>
          </section>
        </article>
      </main>
    </div>
  );
};

export default Offer;
