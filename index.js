// solo necesito que la app esté levantada asi qu eno necesitamos http
const express = require('express');
// de la libreria telegraf solo me quiero quedar con telegraf, asi que hago un destructurin
const { Telegraf } = require('telegraf')
//requiero axios
const axios = require('axios');
const { chatGPT, chatGPTV2 } = require('./utils');
const googleTTS = require('google-tts-api')
const User = require('./modules/user.module')

//configurar .env
require('dotenv').config();
//congiguracion db
require('./config/db')

//creamos app
const app = express()
//creo el bot y le meto el token por parametro
const bot = new Telegraf(process.env.BOT_TOKEN)

//configurar telegram
app.use(bot.webhookCallback('/telegram-bot'))
bot.telegram.setWebhook(`${process.env.BOT_URL}/telegram-bot`);

app.post('/telegram-bot', (req, res) => {
    res.send('lalalalilili')
})
//middleware
//para poder almacenar los datos de cada usuario
bot.use(async (ctx, next) => {
    //crear la clave telegram_id
    ctx.from.telegram_id = ctx.from.id
    //para no repetir los usuarios, antes de crearle, comprobamos si el telegram_id está repetido
    const user = await User.findOne({ telegram_id: ctx.from.id })
    //almacenar los datos en la db
    if (!user) await User.create(ctx.from)
    next()
})
//para poder envíar un mesaje a cada persona que tenga guardada en la bd
bot.command('chat', async ctx => {
    const mensaje = ctx.message.text.slice(6)
    //esto devuelve el numero de usuarios que tengo almacenado en la base de datos
    const count = await User.countDocuments()
    const randomNum = Math.floor(Math.random() * count)
    const user = await User.findOne().skip(randomNum);

    bot.telegram.sendMessage(user.telegram_id, mensaje);
    ctx.reply(`Mensaje enviado a ${user.first_name}`);
})

// bot.command('make', async ctx => {
//     const response = await axios.post('https://hook.eu1.make.com/x8durtb32rv6ejhndaiienfzhc6omc6y', {
//         telegram_id: ctx.from.id, first_name: ctx.from.first_name
//     });
//     console.log(response);
// });

//comados para hablar con el bto, primer parametro el nombre de comando y luego una funcion
bot.command('test', async (ctx) => {
    await ctx.reply(`Hola ${ctx.from.first_name}`)
    await ctx.reply('prueba de cambio')
    await ctx.replyWithDice()

})

bot.command('tiempo', async (ctx) => {
    // /tiempo ciudad 
    let ciudad = ctx.message.text.slice(8)
    console.log(ciudad)
    try {
        const { data } = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${ciudad}&appid=${process.env.OWM_API_KEY}&units=metric`)
        console.log(data)
        ctx.reply(`el tiempo en ${ciudad}:
    🌡️temperatura:${data.main.temp}º
    🔥maxima:${data.main.temp_max}º
    ❄️minima:${data.main.temp_min}º
    💧humedad:${data.main.humidity}%`)
        await ctx.replyWithLocation(data.coord.lat, data.coord.lon)
    } catch {
        ctx.reply('Ha ocurrido un error, vuelve a intentarlo en unos minutos')
    }

})

bot.command('receta', async (ctx) => {
    try {
        const ingredientes = ctx.message.text.slice(8)
        const response = await chatGPT(ingredientes)
        ctx.reply(response)

    } catch {
        ctx.reply('No existen recetas con esos ingredientes')
    }

})

//eventos me pudeo suscribir a lo que pase en el bot
bot.on('text', async ctx => {
    /*  const response = await chatGPTV2(ctx.message.text) */
    const response = ctx.message.text
    const url = googleTTS.getAudioUrl(response, {
        lang: 'es', slow: false, host: 'https://translate.google.com'
    })

    await ctx.reply(response)
    await ctx.replyWithAudio(url)

})




// ponemos la aplicacion a 
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`servidor escuchando en puerto ${PORT}`)
})