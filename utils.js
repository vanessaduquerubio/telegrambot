const { Configuration, OpenAIApi } = require('openai')

const chatGPT = async (ingredientes) => {
    const config = new Configuration({
        apiKey: process.env.OPENAI_API_KEY
    })
    const openai = new OpenAIApi(config);
    const completion = await openai.createChatCompletion({
        // aqui colocamos el modelo que vamos a utilizar
        model: 'gpt-4',
        max_tokens: 300,
        // es un array y son todos los mensajes que le puedo mandar a chatgpt para que formule su respues, cuanto mas elavorada este la pregunta mejor va a ser la respuesta
        messages: [
            //establece la forma de trabajar
            { role: 'assistant', content: 'eres un bot de telegram. tu tarea principal es realizar respuestas de cocina en funcion de los ingredientes que te pase el usuario' },
            //esta es la peticion que queremos resolver
            { role: 'user', content: `genera una receta en menos de 300 caracteres a partir de los siguientes ingrdientes:${ingredientes}` }
        ]
    })
    return completion.data.choices[0].message.content
}

const chatGPTV2 = async (mensaje) => {
    const config = new Configuration({
        apiKey: process.env.OPENAI_API_KEY
    })
    const openai = new OpenAIApi(config);
    const completion = await openai.createChatCompletion({
        // aqui colocamos el modelo que vamos a utilizar
        model: 'gpt-4',
        max_tokens: 300,
        // es un array y son todos los mensajes que le puedo mandar a chatgpt para que formule su respues, cuanto mas elavorada este la pregunta mejor va a ser la respuesta
        messages: [
            //establece la forma de trabajar
            { role: 'assistant', content: 'eres un bot de telegram.tu nombre es @flamenquito_bot, debes responder siempre como si fueses un expeto en todo' },
            //esta es la peticion que queremos resolver
            { role: 'user', content: `responda de manera coherente y en menos de 200 caracteres al siguiente mensaje:${mensaje}` }
        ]
    })
    return completion.data.choices[0].message.content
}



module.exports = {
    chatGPT, chatGPTV2
}