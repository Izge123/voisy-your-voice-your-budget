import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { audio, userId } = await req.json();
    
    if (!audio || !userId) {
      throw new Error('Missing required fields: audio and userId');
    }

    console.log('Processing voice input for user:', userId);

    // Initialize Supabase client to fetch user categories
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user categories
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('id, name, type, parent_id')
      .eq('user_id', userId);

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      throw new Error('Failed to fetch user categories');
    }

    console.log('Fetched categories:', categories?.length);

    // Step 1: Transcribe audio using OpenAI Whisper
    console.log('Transcribing audio...');
    const audioBuffer = Uint8Array.from(atob(audio), c => c.charCodeAt(0));
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });
    
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    });

    if (!whisperResponse.ok) {
      const errorText = await whisperResponse.text();
      console.error('Whisper API error:', errorText);
      throw new Error('Failed to transcribe audio');
    }

    const { text: transcript } = await whisperResponse.json();
    console.log('Transcription:', transcript);

    // Step 2: Parse transcript using Lovable AI
    console.log('Parsing transcript with AI...');
    const categoriesContext = categories?.map(cat => 
      `- id: ${cat.id}, name: "${cat.name}", type: "${cat.type}", parent_id: ${cat.parent_id || 'null'}`
    ).join('\n');

    const aiPrompt = `Ты умный финансовый ассистент. Твоя задача — понять НАМЕРЕНИЕ пользователя, а не просто искать ключевые слова.

## ФИЛОСОФИЯ
- Люди говорят в свободной форме — понимай контекст и смысл
- Один источник дохода = одна транзакция дохода (не дублируй)
- "Остаток на жизнь" — это НЕ транзакция, это просто остаток денег
- Всегда проверяй математику: сумма частей должна равняться целому

## ДОСТУПНЫЕ КАТЕГОРИИ
${categoriesContext}

## ТИПЫ ТРАНЗАКЦИЙ
- income: получил деньги (зарплата, подарок, возврат, вернули долг, кэшбэк)
- expense: потратил деньги (покупки, оплата, дал в долг, подарил)
- savings: отложил в сбережения (резерв, накопления, "в копилку"). МОЖЕТ БЫТЬ ОТРИЦАТЕЛЬНЫМ при изъятии!

## СЦЕНАРИИ

### 1. РАСПРЕДЕЛЕНИЕ ЗАРПЛАТЫ/ДОХОДА
Когда пользователь получает зарплату и распределяет её — это:
- ОДИН доход (полная сумма зарплаты)
- Расходы/сбережения из этой суммы
- "Остаток на жизнь/на месяц/в доходы" — НЕ транзакция, ИГНОРИРУЙ

Пример: "Зарплата 100000: 30000 аренда, 20000 в сбережения, остальное на жизнь"
→ Доход: 100000, Расход: 30000, Сбережения: 20000
→ "50000 на жизнь" — НЕ ЗАПИСЫВАЕМ (это просто остаток)

### 2. СМЕШАННЫЕ ПОКУПКИ
"Потратил 5000: 3000 на еду, 2000 на такси" → 2 расхода

### 3. ДОЛГИ
- "Дал в долг Саше 5000" → расход (описание: "Дал в долг Саше")
- "Саша вернул долг 5000" → доход (описание: "Возврат долга от Саши")
- "Взял в долг 10000" → доход (описание: "Взял в долг")
- "Вернул долг 10000" → расход (описание: "Вернул долг")

### 4. ВОЗВРАТЫ И КЭШБЭК
- "Вернул товар, получил 2000" → доход
- "Пришёл кэшбэк 500" → доход
- "Отменил заказ, вернули деньги" → доход

### 5. ПОДАРКИ
- "Подарили на день рождения 10000" → доход
- "Купил подарок маме за 3000" → расход

### 6. ПЕРЕВОДЫ МЕЖДУ СЧЕТАМИ
- "Перевёл на накопительный счёт" → savings (положительное)
- "Отложил в резерв" → savings (положительное)
- Просто "перевёл себе" без контекста сбережений — ИГНОРИРУЙ (это не транзакция)

### 7. ⚠️ ИЗЪЯТИЕ ИЗ СБЕРЕЖЕНИЙ (КРИТИЧЕСКИ ВАЖНО!)
Когда пользователь БЕРЁТ/ДОСТАЁТ/СНИМАЕТ деньги ИЗ сбережений — это НЕ доход!
Это ОТРИЦАТЕЛЬНАЯ транзакция типа savings.

Триггерные фразы:
- "Взял из сбережений" / "достал из накоплений" / "снял со сбережений"
- "Взял из отложенных" / "из резерва" / "из копилки"

Если пользователь взял из сбережений И сразу потратил:
→ Создай 2 транзакции:
1. savings: ОТРИЦАТЕЛЬНАЯ сумма (изъятие из сбережений)
2. expense: ПОЛОЖИТЕЛЬНАЯ сумма (на что потратил)

Если пользователь просто взял из сбережений без указания на что:
→ savings: ОТРИЦАТЕЛЬНАЯ сумма

## ❌ АНТИ-ПАТТЕРНЫ (НЕ СОЗДАВАЙ ТРАНЗАКЦИИ)
- "Остаток на жизнь/на месяц" — это не трата
- "40000 в доходы" в контексте распределения зарплаты — это остаток, не отдельный доход
- "Надо будет заплатить завтра" — это план, не факт
- "Примерно/около 5000" — бери названную сумму (5000)
- Внутренние переводы без явного сбережения
- ⚠️ "Взял из сбережений" — НЕ ДОХОД! Это отрицательные savings!

## МАТЕМАТИЧЕСКАЯ ПРОВЕРКА
Если пользователь говорит "зарплата X, на Y потратил A, на Z потратил B, остальное в сбережения":
- Сбережения = X - A - B
- Проверь: A + B + Сбережения = X

## ПРИМЕРЫ

Ввод: "Ира получила зарплату 110000 рублей, распредели: 23500 на аренду, 40000 на жизнь, остальное в сбережения"
Вывод: { "transactions": [
  { "amount": 110000, "category_id": null, "type": "income", "description": "Зарплата Иры" },
  { "amount": 23500, "category_id": null, "type": "expense", "description": "Аренда квартиры" },
  { "amount": 46500, "category_id": null, "type": "savings", "description": "Отложено в сбережения" }
]}
// 40000 "на жизнь" — НЕ записываем, это остаток

Ввод: "Потратил 5000 рублей: 3000 на продукты, 2000 на такси"
Вывод: { "transactions": [
  { "amount": 3000, "category_id": "<id Еда>", "type": "expense", "description": "Продукты" },
  { "amount": 2000, "category_id": "<id Транспорт>", "type": "expense", "description": "Такси" }
]}

Ввод: "Получил зарплату 50000"
Вывод: { "transactions": [{ "amount": 50000, "category_id": "<id Зарплата>", "type": "income", "description": "Зарплата" }] }

Ввод: "Отложил 10000 в сбережения"
Вывод: { "transactions": [{ "amount": 10000, "category_id": null, "type": "savings", "description": "Отложено в сбережения" }] }

Ввод: "Дал Пете в долг 15000"
Вывод: { "transactions": [{ "amount": 15000, "category_id": null, "type": "expense", "description": "Дал в долг Пете" }] }

Ввод: "Мне вернули долг 8000 рублей"
Вывод: { "transactions": [{ "amount": 8000, "category_id": null, "type": "income", "description": "Возврат долга" }] }

Ввод: "Подарили 5000 на праздник"
Вывод: { "transactions": [{ "amount": 5000, "category_id": null, "type": "income", "description": "Подарок" }] }

⚠️ ИЗЪЯТИЕ ИЗ СБЕРЕЖЕНИЙ:

Ввод: "Взял из сбережений 1000 рублей и потратил"
Вывод: { "transactions": [
  { "amount": -1000, "category_id": null, "type": "savings", "description": "Изъято из сбережений" },
  { "amount": 1000, "category_id": null, "type": "expense", "description": "Расход из сбережений" }
]}

Ввод: "Достал из накоплений 5000 и купил подарок"
Вывод: { "transactions": [
  { "amount": -5000, "category_id": null, "type": "savings", "description": "Изъято из сбережений" },
  { "amount": 5000, "category_id": null, "type": "expense", "description": "Подарок" }
]}

Ввод: "Снял со сбережений 2000 на ремонт"
Вывод: { "transactions": [
  { "amount": -2000, "category_id": null, "type": "savings", "description": "Изъято из сбережений" },
  { "amount": 2000, "category_id": null, "type": "expense", "description": "Ремонт" }
]}

Ввод: "Взял из отложенных 3000"
Вывод: { "transactions": [
  { "amount": -3000, "category_id": null, "type": "savings", "description": "Изъято из сбережений" }
]}

## ТЕКСТ ПОЛЬЗОВАТЕЛЯ
"${transcript}"

## ФОРМАТ ОТВЕТА
Верни ТОЛЬКО JSON: { "transactions": [{ "amount": number, "category_id": string|null, "type": "income"|"expense"|"savings", "description": string }] }`;

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'user', content: aiPrompt }
        ],
        response_format: { type: 'json_object' }
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('Lovable AI error:', errorText);
      throw new Error('Failed to parse transcript with AI');
    }

    const aiResult = await aiResponse.json();
    const parsedContent = JSON.parse(aiResult.choices[0].message.content);
    console.log('Parsed transactions:', parsedContent);

    return new Response(
      JSON.stringify({ 
        success: true, 
        transcript,
        transactions: parsedContent.transactions 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in process-voice function:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
