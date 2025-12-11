import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
const FAQ = () => {
  const faqs = [{
    question: "Сколько длится триал?",
    answer: "7 дней полного доступа ко всем функциям: голосовой ввод, сплит-транзакции, AI-консультант, аналитика. Карта не нужна для активации — просто зарегистрируйся и пользуйся."
  }, {
    question: "Поймет ли AI сленг?",
    answer: "Да, Whisper понимает даже шепот и сленг. Технология обучена на миллионах голосовых записей на русском языке, включая разговорную речь и сокращения."
  }, {
    question: "Что такое сплит-транзакции?",
    answer: "Когда говоришь «потратил 5000: 3000 на такси, 2000 на кофе» — AI автоматически создаёт две отдельные транзакции по категориям. Удобно для чеков с разными покупками."
  }, {
    question: "Что умеет AI-консультант?",
    answer: "Анализирует твои траты, даёт персональные советы по бюджету, отвечает на вопросы о финансах. Адаптируется под твой уровень финансовой грамотности — от новичка до продвинутого."
  }, {
    question: "Безопасно ли это?",
    answer: "Мы не храним банковские доступы, только обезличенные записи транзакций. Все данные шифруются по протоколу AES-256 и передаются через защищенное соединение SSL/TLS. Мы не продаем данные третьим лицам."
  }, {
    question: "Какие валюты поддерживаются?",
    answer: "Kapitallo поддерживает 14 валют СНГ: рубль, тенге, сум, гривна, лари и другие. Ты можешь тратить в одной валюте, а учитывать в другой — конвертация происходит автоматически."
  }, {
    question: "Работает ли приложение оффлайн?",
    answer: "Частично. Просмотр транзакций и аналитики работает без интернета. Голосовой ввод и AI-консультант требуют подключения, так как используют облачные модели распознавания."
  }, {
    question: "Как отменить подписку?",
    answer: "В любой момент в настройках профиля. После окончания подписки доступ сохраняется в режиме просмотра — все твои данные остаются. Подключить PRO снова можно когда угодно."
  }];
  return <section id="faq" className="w-full py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-manrope text-center text-foreground mb-4">
          Частые вопросы
        </h2>
        <p className="text-center text-muted-foreground font-inter mb-12 md:mb-16 max-w-2xl mx-auto">Не нашел ответ? Напиши нам на info@kapitallo.com</p>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => <AccordionItem key={index} value={`item-${index}`} className="bg-card rounded-2xl border border-border px-6 shadow-sm">
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold font-manrope text-foreground hover:text-primary py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base font-inter text-muted-foreground pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>)}
          </Accordion>
        </div>
      </div>
    </section>;
};
export default FAQ;