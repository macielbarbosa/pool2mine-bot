import Discord from 'discord.js'
import { DISCORD_BLOCKS_CHANNEL_ID, DISCORD_BOT_TOKEN } from '../private.js'

class Bot {
  constructor(token) {
    this.token = token
    this.client = new Discord.Client()
  }

  login = () =>
    new Promise((resolve) => {
      this.client.on('ready', () => {
        console.log(`Logado no discord como ${this.client.user.tag}!`)
        this.client.user.setActivity('blocks', { type: 'WATCHING' })
        this.channel = this.client.channels.cache.get(DISCORD_BLOCKS_CHANNEL_ID)
        resolve(this)
      })
      this.client.login(this.token)
    })

  alertBlock = ({ number, reward, isUncle }) => {
    try {
      const message = new Discord.MessageEmbed()
        .setColor('#0078D7')
        .setTitle(`🎉 New ${isUncle ? 'Uncle' : 'Block'} 🎉`)
        .setURL(`https://etherscan.io/block/${number}`)
        .setDescription(`_#${number}_\n\n💰 Reward: **${reward}** ETH`)
      return this.channel.send(message)
    } catch (error) {
      console.warn('Discord Bot: Erro ao alertar o block', error)
    }
  }
}

export const DiscordBot = new Bot(DISCORD_BOT_TOKEN)
