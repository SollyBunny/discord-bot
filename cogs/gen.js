/* gen.js */

class Gen {
	add(content, author) {
		this.modified = true;
		this.data.push({
			id: this.data.length,
			content: content,
			author: author,
			vote: 0,
			dnr: 0,
			added: Date.now()
		});
	}
	vote(id, score) {
		this.modified = true;
		this.data[id].vote += score;
	}
	get() {
		this.modified = true;
		let sum = 0;
		for (let i = 0; i < this.data.length; i++) {
			if (this.data[i].dnr > 0) --this.data[i].dnr;
			this.data[i].score = this.data[i].vote - this.data[i].dnr;
			sum += this.data[i].score;
		}
		sum *= Math.random(); // pick one!
		sum -= 1;
		let i;
		for (i = 0; i < this.data.length; i++) {
			sum -= this.data[i].score;
			if (sum <= 0) break;
		}
		this.data[i].dnr += 10;
		return this.data[i];
	}
	save() {
		if (!this.modified) return;
		this.modified = false;
		fs.writeFileSync(`./data/${this.name}.json`, JSON.stringify({
			title: this.title,
			color: this.color,
			data: this.data
		}));
	}
}

function genfromfile(name) {
	let out = new Gen();
	let data;
	try {
		data = fs.readFileSync(`./data/gen/${name}.json`);
	} catch (e) {
		log.error(`Failed to load gen file ${name} (${e.message})`);
		return;
	}
	try {
		data = JSON.parse(data);
	} catch (e) {
		log.error(`Failed to parse gen file ${name} (${e.message})`);
		return;
	}
	out.name = name;
	out.data = data.data;
	out.title = data.title;
	out.color = data.color;
	out.modified = false;
	return out
}

async function gencall(gen, args) {
	if (args.length === 0) { // get msg
		const data = gen.get();
		const msg = `> ${data.content}\n${data.author}`;
		if      (msg > 0) msg += ` +${data.score}`;
		else if (msg < 0) msg += ` ${data.score}`; // already has -
		this.embedreply({
			msg: msg,
			title: gen.title,
			color: gen.color
		})
	} else { // add one
		args = args[0].replaceAll(/[\t\n]/, " ");
		if (this.author.isAdmin)
			gen.add(args, "admin");
		else
			gen.add(args, this.author.username + "#" + this.author.discriminator);
	}
}

module.exports.desc = "Content generated by users";

module.exports.cmds = {};

module.exports.onload = async function() {
	module.exports.cmds = {};
	fs.readdirSync("./data/gen/").forEach(i => {
		if (!i.endsWith(".json")) return;
		const gen = genfromfile(i.slice(0, -5));
		if (!gen) return;
		module.exports.cmds[gen.name] = {
			description: gen.title,
			args: [
				[dc.BIGTEXT, gen.title.toLowerCase(), "Add a message", false],
			],
			func: async function (args) {
				gencall.bind(this)(gen, args);
			}
		};
	});
};