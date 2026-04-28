export default async (req) => {
    const body = await req.json();
    const prompt = body.prompt;

    const res = await fetch('https://api.doubao.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ark-6e96df7b-52dc-4c2f-85e6-89be4d69e55c-d8269'
        },
        body: JSON.stringify({
            model: 'doubao-lite-32k',
            messages: [
                { role: 'system', content: '你是青少年故事创作助手，写适合初中生的文字冒险剧情。' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            max_tokens: 500
        })
    });

    const data = await res.json();
    return new Response(JSON.stringify(data), {
        headers: { 'Content-Type': 'application/json' }
    });
};