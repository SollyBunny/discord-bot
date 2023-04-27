/* info.js */

const imgurl = "https://sollybunny.xyz/elements/"

let els, elnames;

module.exports.desc = "Element Info!";

module.exports.cmds = {
	"element": {
		desc: "Fetch an element by number or name",
		args: [
			[dc.BIGTEXT, "element", "Number or name of element", true],
		],
		func: async function (args) {
			args = args[0].toLowerCase();
			let out = {};
			if (args === "4.5" || args === "copium") {
				out.title = "Copium `Cp` #`4.5`";
				out.msg = "Copium is imbetween the 4th and 5th element, a single atom opiod used commonly by those struck with ligma";
				out.color = [29, 145, 54];
				out.image = imgurl + "4.5.jpg";
				args = undefined;
			} else if (isNaN(Number(args[0]))) { // name
				let search = util.levdisclosest(elnames, args, 3);
				if (search) {
					els[elnames.indexOf(search)];
				} else {
					out.title = `${args[0].toUpperCase()}${args.slice(1)} \`${args[0].toUpperCase()}${args[1] || ""}\` #\`???\``;
					out.msg = `A fictional element created and named by <@${this.author.id}>`;
					args = undefined;
				}
			} else { // number
				args = Math.round(args[0]);
				if (!els[args]) {
					out.title = `??? \`??\` #\`${args[0]}\``;
					out.msg = `An element not yet discovered by scientists`
					args = undefined;
				} else {
					args = els[args];
				}
			}
			if (args !== undefined) {
				out.title = `${args.name} #\`${args.number}\``;
				out.msg = args.desc;
				out.rawcolor = args.color;
				out.image = imgurl + args.number + ".jpg";
			}
			this.embedreply(out);
		}
	}
};

module.exports.onload = async function() {

	els = JSON.parse(fs.readFileSync("./data/elements.json"));
	elnames = els.map(i => { return i.name;});

};
