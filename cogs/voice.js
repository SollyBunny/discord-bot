/* voice.js
Requires:
@discordjs/voice
ytdl-core
*/

let voice, ytdl;

const ALREADYINCHANNEL = 0;

class Ctx {
	constructor() {
		this.player = voice.createAudioPlayer({
			behaviors: { noSubscriber: voice.NoSubscriberBehavior.Pause }
		});
	}
	async setchannel(channel) {
		if (this.channel === channel)
			return ALREADYINCHANNEL;
		if (this.connection)
			this.connection.close();
		this.channel = channel;
		this.connection = await voice.joinVoiceChannel({
			"channelId": channel.id,
			"guildId": channel.guild.id,
			"adapterCreator": channel.guild.voiceAdapterCreator
		});
		this.connection.subscribe(this.player);
	}
	async seturl(url) {
		this.url = url;
		if (this.stream)
			this.stream.close();
		if (this.resource)
			this.resource.close();
		this.stream = await ytdl(url, { filter: "audioonly" });
		this.resource = await voice.createAudioResource(this.stream);
	}
	play() {
		this.player.play(this.resource);
	}
	stop() {
		
	}
}

module.exports.desc = "A music bot!";

module.exports.require = { "@discordjs/voice": "Interact with discord.js voice", "ytdl-core": "Stream content" };
module.exports.requireoptional = {}; // TODO (opus and stuff)

module.exports.onload = async function() {
	ytdl = require("ytdl-core");
	voice = require("@discordjs/voice");
};

module.exports.cmds = {
	"play": {
		desc: "Play a song voice channel",
		dm: false,
		args: [
			[dc.BIGTEXT, "url", "URL to play from youtube, soundcloud or others", true],
		],
		func: async function (args) {
			if (!this.member.voice) {
				this.errreply("You aren't in a voice chat");
				return;
			}
			const ctx = new Ctx();
			await ctx.setchannel(this.member.voice.channel);
			await ctx.seturl(args[0]);
			ctx.play();
			ctxs[this.member.guild.id] = ctx;
		}
	},
	"pause": {
		desc: "Pause song!",
		dm: false,
		func: async function (args) {
			if (!this.member.voice) {
				this.errreply("You aren't in a voice chat");
				return;				
			}
		}
	}
	
};
