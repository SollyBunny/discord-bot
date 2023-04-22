/* string.js */

const replace = {
	"upper": {
		desc: "Make something uppercase",
		func: s => {
			return s.toUpperCase();
		}
	},
	"lower": {
		desc: "Make something lowercase",
		func: s => {
			return s.toLowerCase();
		}
	},
	"stupid": {
		desc: "Alternate between upper and lowercase",
		func: s => {
			s = s.split("");
			let flag = false;
			for (let i = 0; i < s.length; ++i) {
				if (" \r\n\t".indexOf(s[i])) continue;
				if (flag === true) {
					s[i] = s[i].toUpperCase();
					flag = false;
				} else {
					s[i] = s[i].toLowerCase();
					flag = true;
				}
			}
			return s.join("");
		}
	},
	"mirror": {
		desc: "Flip it",
		func: s => {
			return s.split("").reverse().join("");
		}
	},
	"greek": {
		desc: "Faux greek (grssk)",
		func: s => {
			s = s.split("");
			let l = undefined;
			for (let i = 0; i < s.length; ++i) {
				switch (s[i]) { // in the order of https://en.wikipedia.org/wiki/Greek_alphabet
					case "a": l = "α"; break;
					case "B": l = "β"; break;
					case "y": l = "γ"; break;
					case "d": l = "δ"; break;
					case "e": l = "ε"; break;
					case "Z": l = "ζ"; break;
					case "n": l = "η"; break;
					case "0": l = "θ"; break;
					case "l": l = "ι"; break;
					case "k": l = "κ"; break;
					case "μ": l = "u"; break;
					case "3": l = "ξ"; break;
					case "N": l = "Π"; break;
					case "n": l = "π"; break;
					case "p": l = "ρ"; break;
					case "E": l = "Σ"; break;
					case "o": l = "σ"; break;
					case "c": l = "ς"; break;
					case "t": l = "τ"; break;
					case "X": l = "χ"; break;
					case "w": l = "ω"; break;
				}
				if (l) {
					s[i] = l;
					l = undefined;
				}
			}
			return s.join("");
		}
	},
	"russian": {
		desc: "Faux russian",
		func: s => {
			s = s.split("");
			let l = undefined;
			for (let i = 0; i < s.length; ++i) {
				switch (s[i]) { // in the order of https://en.wikipedia.org/wiki/Russian_alphabet
					case "6": l = "б"; break;
					case "r": l = "г"; break;
					case "A": l = "Д"; break;
					case "a": l = "д"; break;
					case "Ж": l = "X"; break;
					case "ж": l = "x"; break;
					case "3": l = "З"; break;
					case "N": l = "И"; break;
					case "k": l = "к"; break;
					case "n": l = "л"; break;
					case "m": l = "м"; break;
					case "m": l = "м"; break;
					case "h": l = "н"; break;
					case "T": l = "т"; break;
					case "Y": l = "У"; break;
					case "y": l = "у"; break;
					case "O": l = "Ф"; break;
					case "o": l = "ф"; break;
					case "U": l = "Ц"; break;
					case "u": l = "ц"; break;
					case "4": l = "Ч"; break;
					case "W": l = "Ш"; break;
					case "w": l = "ш"; break;
					case "b": l = "Ь"; break;
					case "R": l = "Я"; break;
					case "t": l = "†"; break;
					case "0": l = "Ѳ"; break;
					case "V": l = "Ѵ"; break;
					case "V": l = "ѵ"; break;
				}
				if (l) {
					s[i] = l;
					l = undefined;
				}
			}
			return s.join("");
		}
	},
	"buffalo": {
		desc: "Encodes text into buffalos only",
		func: s => {
			let out = "";
   			let l;
   			for (let i = 0; i < s.length; ++i) {
   				l = s.charCodeAt(i);
   				if (l >= 97 && l <= 122) { // between 'a' & 'z'
   					l -= 96; // 'a' - 1
   				} else if (l >= 65 && l <= 90) { // between 'A' & 'Z'
   					l -= 64; // 'A' - 1
   				} else {
   					out = out.slice(0, -2);
   					if (s[i] === " ") out += ". ";
					else              out += s[i] + ", ";
   					continue;
   				}
   				out += (
   					("BUFFALO ".repeat(Math.floor(l / 5))) +
   					("buffalo ".repeat(l % 5))
   				).slice(0, -1) + ", ";
   			}
   			out = out.slice(0, -2); // remove tailing ", "
   			return out;
   		}
	},
	"uwu": {
		desc: "M-mwakes t-tis text c-cwute an cuwdlwee!!!1!!",
		func: s => {
			s = `  ${s}.`;
			let out = "";
			let l;
			for (let i = 2; i < s.length; ++i) {
				switch (s[i].toLowerCase()) {
					case "w":
						l = "ww";
						break;
					case "q":
						if (s[i + 1].toLowerCase() !== "u") break;
						l = "qw";
						break;
					case "n":
						if ("aeiou".indexOf(s[i + 1].toLowerCase()) === -1) break;
						if (s[i - 1].toLowerCase() === "n") break;
						l = "ny";
						break;
					case "y":
						if (s[i + 1] !== ' ') break;
						l = "y";
					case "~":
						if (l === undefined) l = "";
						l += (Math.random() > 0.5) ? "~~" : "~";
						break;
					case "c":
						if (s[i + 1].toLowerCase() === "k") l = "";
						break;
					case "r":
						if (s[i - 1] === " ") break;
						l = "w";
						break;
					case 't':
						if (s[i + 1].toLowerCase() !== "h") break;
						if (s[i - 1] !== " ") break;
						l = "v";
						break;
					case "h":
						if (s[i - 1].toLowerCase() !== "t") break;
						l = "";
						break;
					case "o":
						if ("btlm".indexOf(s[i - 1].toLowerCase()) === -1) {
							if (s[i + 1].toLowerCase() === 'o') l = "";
						} else l = "u";
						break;
					case "u":
						if ("btlm".indexOf(s[i - 1].toLowerCase()) === -1) break;
						l = "o";
						break;
					case "e":
						if ("vr".indexOf(s[i - 1].toLowerCase()) === -1) l = "ee";
						else l = "";
						break;
					case "l":
						if (s[i - 1].toLowerCase() == "l") break;
						l = (s[i + 1] === " ") ? "wl" : "w";
						break;
					case "i":
						if (s[i + 1] !== " ") break;
						l = "i-i";
						break;
					case " ":
						if (Math.random() > 0.7) {
							switch (Math.floor(Math.random() * 5)) {
								case 0: l = " \*coughs\* ";  break;
								case 1: l = " \*nuzzles\* "; break;
								case 2: l = " \*hugs\* ";    break;
								case 3: l = " \*meow\* ";    break;
								case 4: l = " \*stares\* ";  break;
								case 5: l = " \*pouncs\* ";  break;
							}
						} else {
							if ("abcdefghijklmnopqrstuvwxyz".indexOf(s[i + 1].toLowerCase()) === -1) break;
							l = ` ${s[i + 1]}-`;
						}
						break;
					case ".":
						if (Math.random() > 0.5) {
							if      (Math.random() > 0.7) l = "..";
							else if (Math.random() > 0.3) l = (Math.random() > 0.5) ? " owo" : " uwu";
							break;
						} // transform into '!'
					case "!":
						l = "!";
						for (let _ = 0; _ < Math.random() * 3 + 2; ++_)
							l += (Math.random() > 0.7) ? "1" : "!";
						break;
				}
				if (l === undefined || Math.random() > 2) {
					out += s[i];
				} else {
					if (s[i].toUpperCase() === s[i]) l = l.toUpperCase();
					out += l;
					l = undefined;
				}
			}
			if (Math.random > 0.5) out += " uwu";
			return out;
		}
	}
};

function replacefunc(s) {
	const index = s.indexOf("{");
	if (!index) return s;
	let name = s.slice(1, index).toLowerCase();
	if (!name) return s;
	name = replace[name];
	if (!name) return s;
	text = s.slice(index + 1, -1);
	text = name.func(text);
	return text;
}

module.exports.desc = "String substitution";

module.exports.hooks = [
	{
		event: "messageCreate",
		priority: 20,
		func: async function() {
			if (this.author.isNotPerson) return;
			const newcontent = this.content.replace(/\$[a-zA-Z]+\{.+?\}/gs, replacefunc);
			if (newcontent === this.content) return;
			this.webhookreply(this.author, newcontent);
			this.delete();
		}
	}
];

module.exports.cmds = {
	"test_string": {
		desc: "A test string",
		func: async function (args) {
			this.embedreply({
				msg: Object.keys(replace).map(i => {
					return `${i}: \$${i}\{the quick brown fox jumps over the lazy dog. THE QUICK BROWN FOX JUMPS OVER THE LAZY DOG! 0123456789?\}`;
				}).join("\n")
			});
		}
	}
};
