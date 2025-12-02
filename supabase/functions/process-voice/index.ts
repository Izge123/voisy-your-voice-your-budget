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

    const aiPrompt = `Ты финансовый ассистент. Проанализируй текст пользователя и извлеки транзакции.

Доступные категории:
${categoriesContext}

Текст пользователя: "${transcript}"

Правила:
1. Если пользователь говорит о нескольких тратах в одном высказывании (например "5000 рублей: 3000 на еду, 2000 на такси"), создай несколько транзакций (split transactions).
2. Для каждой транзакции определи: сумму, тип (income/expense), категорию (матчи по названию из списка), описание.
3. Если категория не найдена, установи category_id: null.
4. Если пользователь не указал тип явно, по умолчанию это расход (expense).
5. Верни JSON в формате: { "transactions": [{ "amount": number, "category_id": string|null, "type": "income"|"expense", "description": string }] }

Пример:
Ввод: "Потратил 5000 рублей: 3000 на продукты, 2000 на такси"
Вывод: { "transactions": [{ "amount": 3000, "category_id": "<id категории Еда>", "type": "expense", "description": "Продукты" }, { "amount": 2000, "category_id": "<id категории Транспорт>", "type": "expense", "description": "Такси" }] }`;

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
