exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { text, mood, history = [] } = JSON.parse(event.body);

    const moodCtx = mood ? `Mood pengguna saat ini: ${mood}. ` : '';

    const messages = [
      {
        role: 'system',
        content: `Kamu adalah Peluk, temen curhat yang paling asyik dan pengertian. Balaslah curahan hati pengguna dengan bahasa yang super natural, kayak lagi ngobrol santai sama temen deket. Pakai kata "aku", "kamu", "sih", "dong", "lho", "ya", "deh", "nih" biar terasa akrab. Pokoknya kata-kata yang gen-z banget jadi kalo pengguna curhat pun merasa asik dan seru curhatnya. Jangan pake bahasa formal atau puitis yang lebay ya cukup hangat, tulus, dan sederhana.

Validasi perasaan mereka, misalnya: "Aku ngerti kok rasanya", "Wajar banget sih kamu ngerasa gitu", "Nggak usah dipendam sendiri, ya". Jangan menghakimi, jangan membandingkan, jangan buru-buru kasih solutions. Cukup jadi teman yang dengerin dan ngertiin.

Tulis jawaban sepanjang 3-4 paragraf, persis kayak kamu lagi duduk bareng temen sambil ngopi atau chattingan malam-malam. Di akhir, tambahkan baris baru lalu tulis: AFIRMASI: [afirmasi 1] | [afirmasi 2] | [afirmasi 3]. Buat afirmasi itu jadi penyemangat pengguna bahwa dia gak sendiri dan dia didengar. Contoh: "Kamu hebat, aku bangga padamu" atau "Nggak sendiri, aku selalu di sini".`
      }
    ];

    if (history && history.length > 0) {
      messages.push(...history);
    }

    messages.push({
      role: 'user',
      content: `${moodCtx}Curahan hati: ${text}`,
    });

    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        max_tokens: 1000,
        temperature: 0.9,
        messages: messages,
      }),
    });

    if (res.status === 429) {
      return {
        statusCode: 429,
        body: JSON.stringify({ error: 'Rate limit exceeded. Silakan coba lagi nanti.' }),
      };
    }

    const data = await res.json();
    console.log('Groq response:', JSON.stringify(data));
    const reply = data.choices?.[0]?.message?.content || '';

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reply }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};