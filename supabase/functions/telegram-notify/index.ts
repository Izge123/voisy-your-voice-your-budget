import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface NotificationData {
  type: 'new_user' | 'subscription';
  data: {
    email?: string;
    full_name?: string;
    promo_code?: string;
    user_id?: string;
    plan?: string;
    duration_months?: number;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const chatId = Deno.env.get('TELEGRAM_CHAT_ID');

    if (!botToken || !chatId) {
      console.error('Telegram credentials not configured');
      return new Response(
        JSON.stringify({ error: 'Telegram not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { type, data }: NotificationData = await req.json();
    
    console.log('Telegram notification request:', { type, data });

    let message = '';
    const now = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' });

    if (type === 'new_user') {
      message = `🎉 <b>Новый пользователь!</b>\n\n` +
        `👤 ${data.full_name || 'Без имени'}\n` +
        `📧 ${data.email || 'Нет email'}\n` +
        `🎫 Промокод: ${data.promo_code || 'нет'}\n` +
        `📅 ${now}`;
    } else if (type === 'subscription') {
      message = `💰 <b>Новая подписка PRO!</b>\n\n` +
        `👤 ${data.user_id}\n` +
        `📦 План: ${data.plan || 'pro'}\n` +
        `⏱ Срок: ${data.duration_months || 1} мес.\n` +
        `📅 ${now}`;
    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid notification type' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const telegramResponse = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
          parse_mode: 'HTML'
        })
      }
    );

    const telegramResult = await telegramResponse.json();
    
    if (!telegramResponse.ok) {
      console.error('Telegram API error:', telegramResult);
      return new Response(
        JSON.stringify({ error: 'Telegram API error', details: telegramResult }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Telegram notification sent successfully');

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Telegram notify error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
