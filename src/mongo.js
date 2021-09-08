import mongodb from 'mongodb'

const URL = 'mongodb://localhost:27017'
const DB_NAME = 'pool2mine'

export default class MongoConnector {
  constructor() {
    this.db = null
    this.data = null
  }

  connect = () => {
    const that = this
    return new Promise((resolve, reject) => {
      mongodb.MongoClient.connect(URL, { useUnifiedTopology: true }, async function (error, client) {
        if (error) reject('Falha ao conectar ao DB')
        console.log('Conectado ao DB')
        that.db = client.db(DB_NAME)
        that.data = await that.getData()
        resolve()
      })
    })
  }

  getUser = async (_id) => {
    const existingUser = await this.collection('user').findOne({ _id })
    if (existingUser) return existingUser
    else {
      const user = { _id, wallets: [], notify: true }
      await this.collection('user').insertOne(user)
      return user
    }
  }

  collection = (name) => this.db.collection(name)

  getData = async () => await this.collection('data').findOne({ _id: 0 })

  setData = (data) => this.collection('data').updateOne({ _id: 0 }, { $set: data })
}
