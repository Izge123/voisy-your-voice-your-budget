import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ = () => {
  const faqs = [
    {
      question: "Поймет ли AI сленг?",
      answer: "Да, Whisper понимает даже шепот и сленг. Технология обучена на миллионах голосовых записей на русском языке, включая разговорную речь и сокращения."
    },
    {
      question: "Могу ли я выгрузить данные?",
      answer: "Да, экспорт в CSV доступен в любой момент. Все твои транзакции, категории и статистика будут сохранены в удобном формате для использования в других приложениях."
    },
    {
      question: "Безопасно ли это?",
      answer: "Мы не храним банковские доступы, только обезличенные записи транзакций. Все данные шифруются по протоколу AES-256 и передаются через защищенное соединение SSL/TLS. Мы не продаем данные третьим лицам."
    },
    {
      question: "Работает ли приложение оффлайн?",
      answer: "Частично. Ручной ввод транзакций работает без интернета. Голосовой ввод и AI-консультант требуют подключения, так как используют облачные модели распознавания."
    },
    {
      question: "Какие валюты поддерживаются?",
      answer: "Voisy поддерживает более 150 мировых валют с автоматическим обновлением курсов. Ты можешь тратить в одной валюте, а учитывать в другой — конвертация происходит автоматически."
    },
    {
      question: "Как отменить подписку?",
      answer: "В любой момент в настройках профиля. Никаких скрытых условий — отписался и всё. Доступ к PRO функциям сохранится до конца оплаченного периода."
    }
  ];

  return (
    <section className="w-full py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold font-manrope text-center text-foreground mb-4">
          Частые вопросы
        </h2>
        <p className="text-center text-muted-foreground font-inter mb-12 md:mb-16 max-w-2xl mx-auto">
          Не нашел ответ? Напиши нам в Telegram
        </p>

        {/* FAQ Accordion */}
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-card rounded-2xl border border-border px-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left text-base md:text-lg font-semibold font-manrope text-foreground hover:text-primary py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm md:text-base font-inter text-muted-foreground pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
