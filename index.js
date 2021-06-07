const app = require('./app')

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

async function start ()  {
    console.log('Iniciando servidor')
    try {
        while (true) {
            await app()
            await sleep(2000)
        } 
    } catch (error) {
        console.error('Houve um erro na aplicação.')
        console.error(error)
    }
}

start()