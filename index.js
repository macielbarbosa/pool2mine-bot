import { app } from './src/app.js'

const start = async () => {
  console.log('Iniciando servidor')
  try {
    app()
  } catch (error) {
    console.error('Houve um erro na aplicação.', error)
  }
}

start()
