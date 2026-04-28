export default async (req) => {
    const body = await req.json();
    const prompt = body.prompt;

    // 从Netlify环境变量读取密钥，永远不会暴露给前端
    const API_KEY = Netlify.env.get("DOUBAO_API_KEY");

    const res = await fetch('https://api.doubao.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${API_KEY}`
        },
        body: JSON.stringify({
            model: 'doubao-lite-32k',
            messages: [
                { 
                    role: 'system', 
                    content: '你是【AI故事小助手】，专门为初中生提供文字冒险故事创作辅助。性格亲切有耐心，像有趣的学长学姐。严格过滤暴力、恐怖等不适合青少年的内容，引导正向价值观。' 
                },
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
