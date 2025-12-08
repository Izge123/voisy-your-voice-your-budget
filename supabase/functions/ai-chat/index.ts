import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userId } = await req.json();
    
    if (!userId) {
      throw new Error("User ID is required");
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
    }

    // Fetch transactions for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const { data: transactions, error: transactionsError } = await supabase
      .from("transactions")
      .select(`
        *,
        category:categories(name, type, icon, color)
      `)
      .eq("user_id", userId)
      .gte("date", thirtyDaysAgo.toISOString().split('T')[0])
      .order("date", { ascending: false });

    if (transactionsError) {
      console.error("Error fetching transactions:", transactionsError);
    }

    // Fetch all user categories
    const { data: categories, error: categoriesError } = await supabase
      .from("categories")
      .select("*")
      .eq("user_id", userId);

    if (categoriesError) {
      console.error("Error fetching categories:", categoriesError);
    }

    // Calculate financial summary
    const income = (transactions || [])
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const expenses = (transactions || [])
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0);
    
    const savings = (transactions || [])
      .filter(t => t.type === 'savings')
      .reduce((sum, t) => sum + Number(t.amount), 0);

    // Group expenses by category
    const expensesByCategory: Record<string, { name: string; amount: number; icon: string }> = {};
    (transactions || [])
      .filter(t => t.type === 'expense' && t.category)
      .forEach(t => {
        const catName = t.category?.name || 'Другое';
        const catIcon = t.category?.icon || '📦';
        if (!expensesByCategory[catName]) {
          expensesByCategory[catName] = { name: catName, amount: 0, icon: catIcon };
        }
        expensesByCategory[catName].amount += Number(t.amount);
      });

    const topCategories = Object.values(expensesByCategory)
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    // Get recent transactions for context
    const recentTransactions = (transactions || [])
      .slice(0, 10)
      .map(t => ({
        date: t.date,
        amount: t.amount,
        type: t.type,
        category: t.category?.name || 'Без категории',
        description: t.description || ''
      }));

    // Build personalized system prompt
    const currency = profile?.currency || 'USD';
    const literacyLevel = profile?.financial_literacy_level || 'Beginner';
    
    let literacyInstruction = '';
    if (literacyLevel === 'Beginner') {
      literacyInstruction = 'Объясняй простым языком, избегай финансовых терминов, приводи понятные примеры из жизни.';
    } else if (literacyLevel === 'Intermediate') {
      literacyInstruction = 'Можешь использовать базовые финансовые термины с пояснениями.';
    } else {
      literacyInstruction = 'Можешь использовать профессиональную финансовую терминологию.';
    }

    const systemPrompt = `Ты — Kapitallo Assistant, персональный финансовый консультант пользователя. 
Ты дружелюбный, поддерживающий и даёшь практичные советы на основе реальных данных пользователя.

ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ:
- Имя: ${profile?.full_name || 'Пользователь'}
- О себе: ${profile?.bio || 'Не указано'}
- Финансовая цель: ${profile?.financial_goal || 'Не указана'}
- Целевая сумма: ${profile?.target_amount ? `${profile.target_amount} ${currency}` : 'Не указана'}
- Горизонт планирования: ${profile?.planning_horizon || 'Не указан'}
- Уровень финансовой грамотности: ${literacyLevel}
- Жизненные ситуации: ${profile?.life_tags?.join(', ') || 'Не указаны'}
- Валюта: ${currency}

ФИНАНСОВЫЕ ДАННЫЕ (последние 30 дней):
- Общий доход: ${income.toFixed(2)} ${currency}
- Общие расходы: ${expenses.toFixed(2)} ${currency}
- Сбережения: ${savings.toFixed(2)} ${currency}
- Остаток: ${(income - expenses).toFixed(2)} ${currency}

ТОП-5 КАТЕГОРИЙ РАСХОДОВ:
${topCategories.length > 0 
  ? topCategories.map((c, i) => `${i + 1}. ${c.icon} ${c.name}: ${c.amount.toFixed(2)} ${currency}`).join('\n')
  : 'Нет данных о расходах'}

ПОСЛЕДНИЕ 10 ТРАНЗАКЦИЙ:
${recentTransactions.length > 0
  ? recentTransactions.map(t => `- ${t.date}: ${t.type === 'income' ? '+' : t.type === 'expense' ? '-' : ''}${t.amount} ${currency} (${t.category})${t.description ? ` — ${t.description}` : ''}`).join('\n')
  : 'Нет транзакций'}

ВСЕ КАТЕГОРИИ ПОЛЬЗОВАТЕЛЯ:
${(categories || []).map(c => `${c.icon || '📁'} ${c.name} (${c.type})`).join(', ') || 'Нет категорий'}

ПРАВИЛА:
1. ${literacyInstruction}
2. Давай конкретные советы на основе реальных данных пользователя
3. Помогай достигать финансовых целей пользователя
4. Отвечай на русском языке
5. Будь дружелюбным и поддерживающим
6. Если пользователь спрашивает о своих тратах — анализируй реальные данные
7. Если данных мало — предлагай добавить транзакции через голосовой ввод
8. Не выдумывай данные, которых нет — честно говори, если информации недостаточно
9. Используй эмодзи для наглядности, но не перебарщивай`;

    console.log("Sending request to Lovable AI with personalized context");

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds to your Lovable AI workspace." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Streaming response from Lovable AI");

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (error) {
    console.error("Error in ai-chat function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
