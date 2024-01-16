/* tp.js */

let defs, defnames;

module.exports.desc = "Toki Pona";

module.exports.cmds = {
	"tp": {
		desc: "Translate word or phrase from Toki Pona to English",
		args: [
			[dc.BIGTEXT, "input", "Word or phrase to translate", true, undefined, 50]
		]
	},
	"tpize": {
		desc: "Transliterate to Toki Pona",
		args: [
			[dc.BIGTEXT, "input", "Word or phrase to transliterate", true, undefined, 100]
		],
		func: async function (args) {
			args = args[0].toLowerCase();
			let out = "";
			let coolout = "";
			let i = 0;
			let c, d, coold;
			while (i < args.length) {
				c = args.slice(i);
				d = undefined;
				switch (c.slice(0, 2)) {
					case "ch":
					case "sh":
						c = "s";
						break;
				}
				switch (c.slice(0, 2)) {
					case "pe":
						d = c;
						coold = "ᐯ";
						break;
					case "po":
						d = c;
						coold = "ᐳ";
						break;
					case "pu":
						d = c;
						coold = "ᐴ";
						break;
					case "pa":
						d = c;
						coold = "ᐸ";
						break;
					case "pi":
						d = c;
						coold = "ᐱ";
						break;
					case "te":
						d = c;
						coold = "ᑌ";
						break;
					case "to":
						d = c;
						coold = "ᑐ";
						break;
					case "tu":
						d = c;
						coold = "ᑑ";
						break;
					case "ta":
					case "ti":
						d = c;
						coold = "ᑕ";
					case "sh":
						c = "s";
						break;
				}
				if (d !== undefined) {
					out += d;
					continue;
				}
				switch (c[0]) {
					
					default: d = c[0];
				}
				out += d;
				if (c.startsWith("ch") || c.startsWith("sh")) {
					d = "s";
				} else {
					switch (c[0]) {
						// case ""
						default: d = c[0];
					}
				}
				out += d;
				++i;
			}
			this.embedreply({ msg: out });
		}
	}
};

module.exports.onload = async function() {

	defs = JSON.parse(fs.readFileSync("./data/tp.json"));
	defnames = Array(Object.keys(defs));

};