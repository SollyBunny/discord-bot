/* say.js
Trolling.inc

Config:
"say": {
	"stickers": {
		"<name1>": "<funnygif1>",
		"<name2>": "<funnygif2>"
	}
}
*/

const predict = require("./predict.json");
const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ !?*(),.#\"\'\n".split("");

module.exports.cmds = {
	"sticker": {
		desc: "Send a sticker",
		args: [
			[dc.CHOICE, "name", "Name of sticker", true, Object.keys(conf.say.stickers)]
		],
		hide: true,
		func: async function (args) {
			this.webhookreply(this.member, conf.say.stickers[args[0]]);
		}
	},
	"welsh": {
		desc: "Use a bad predictive model to speak welsh",
		hide: true,
		func: async function (args) {
			let prevchar = chars[Math.floor(Math.random() * 26) + 26];
			let out = prevchar;
			let ran;
			let i;
			while (1) {
				ran = Math.random();
				for (i = 0; i < chars.length; ++i)
					if (predict[prevchar][i] > ran) break;
				if (i === chars.length) break;
				out += chars[i];
				prevchar = chars[i];
				if (out.length > 100) break;
			}
			this.webhookreply(this.member, out);
		}
	},
	"echo": {
		desc: "Echo whatever you say",
		args: [
			[dc.BIGTEXT, "text", "What to echo", true]
		],
		func: async function (args) {
			try {
				await this.reply ({ content: args[0] });
			} catch (e) {
				this.channel.send({ content: args[0] });
			}
		}
	},
	"say": {
		desc: "Make anyone say anything",
		args: [
			[dc.USER, "user", "Who says this", false],
			[dc.BIGTEXT, "text", "What to say", true],
		],
		dm: false,
		hide: true,
		func: async function (args) {
			this.webhookreply(args[0] || this.member, args[1] || "");
		}
	},
	"stupid": {
		desc: "Make text stupid",
		args: [
			[dc.BIGTEXT, "text", "What to stupid-ize", true],
		],
		hide: true,
		func: async function (args) {
			let out = "";
			let flag = false;
			for (let i = 0; i < args[0].length; ++i) {
				if (args[0][i] === ' ') {
					out += ' ';
				} else if (flag === true) {
					out += args[0][i].toUpperCase()
					flag = false;
				} else {
					out += args[0][i].toLowerCase()
					flag = true;
				}
			}
			this.webhookreply(this.member, out);
		}
	},
	"lower": {
		desc: "Make text lowercase",
		args: [
			[dc.BIGTEXT, "text", "What to lowercase", true],
		],
		hide: true,
		func: async function (args) {
			let out = "";
			for (let i = 0; i < args[0].length; ++i) {
				out += args[0][i].toLowerCase()
			}
			this.webhookreply(this.member, out);
		}
	},
	"upper": {
		desc: "Make text uppercase",
		args: [
			[dc.BIGTEXT, "text", "What to uppercase", true],
		],
		hide: true,
		func: async function (args) {
			let out = "";
			for (let i = 0; i < args[0].length; ++i) {
				out += args[0][i].toUpperCase()
			}
			this.webhookreply(this.member, out);
		}
	},
	"mirror": {
		desc: "Mirror text",
		args: [
			[dc.BIGTEXT, "text", "What to mirror", true],
		],
		hide: true,
		func: async function (args) {
			this.webhookreply(this.member, args[0].split("").reverse().join(""));
		}
	},
    "weird": {
        desc: "Replace reflected characters with reflected characters",
		args: [
			[dc.BIGTEXT, "text", "What to weirdify", true],
		],
		hide: true,
		func: async function (args) {
            let out = "";
            let l;
            for (let i = 0; i < args[0].length; ++i) {
                switch (args[0][i]) {
                    case 'p': l = 'Q'; break;
                    case 'P': l = 'q'; break;
                    case 'q': l = 'P'; break;
                    case 'Q': l = 'p'; break;
                    case 'b': l = 'D'; break;
                    case 'B': l = 'd'; break;
                    case 'd': l = 'B'; break;
                    case 'D': l = 'b'; break;
                    case 'm': l = 'W'; break;
                    case 'M': l = 'w'; break;
                    case 'w': l = 'M'; break;
                    case 'W': l = 'm'; break;
                    case 'n': l = 'U'; break;
                    case 'N': l = 'u'; break;
                    case 'n': l = 'u'; break;
                    case 'N': l = 'U'; break;
                    default: l = args[0][i];
                }
                out += l;
            }
            this.webhookreply(this.member, out);
        }
    },
    "greek": {
        desc: "Roughly transliterates latin text into greek text",
		args: [
			[dc.BIGTEXT, "text", "What to transliterate", true],
		],
		hide: true,
		func: async function (args) {
			// TODO replace th & TH with θ
			// TODO replace ch with χ
			// TODO replace CH with X
			// TODO replace ps with ψ
			// TODO replace PS with Ψ
			
            let out = "";
            for (let l, i = 0; i < args[0].length; ++i) {
                switch (args[0][i]) {
					// Letters without direct analogues have been left unchanged and commented out
					// Lowercase
					case 'a': l = 'α'; break;
					case 'b': l = 'β'; break;
					case 'c': l = 'ς'; break;
					case 'd': l = 'δ'; break;
					case 'e': l = 'ε'; break;
					case 'f': l = 'φ'; break;
					case 'g': l = 'γ'; break;
					// case 'h': l = 'h'; break;
					case 'i': l = 'ι'; break;
					// case 'j': l = 'j'; break;
					case 'k': l = 'κ'; break;
					case 'l': l = 'λ'; break;
					// case 'm': l = 'm'; break;
					case 'n': l = 'η'; break;
					// case 'o': l = 'o'; break;
					case 'p': l = 'π'; break;
					// case 'q': l = 'q'; break;
					case 'r': l = 'ρ'; break;
					case 's': l = 'σ'; break;
					case 't': l = 'τ'; break;
					case 'u': l = 'μ'; break;
					// case 'v': l = 'v'; break;
					case 'w': l = 'ω'; break;
					case 'x': l = 'ξ'; break;
					// case 'y': l = 'y'; break;
					case 'z': l = 'ζ'; break;
					// Uppercase
					// case 'A': l = 'A'; break;
					// case 'B': l = 'B'; break;
					// case 'C': l = 'C'; break;
					case 'D': l = 'Δ'; break;
					// case 'E': l = 'Е'; break;
					case 'F': l = 'Φ'; break;
					case 'G': l = 'Γ'; break;
					// case 'H': l = 'H'; break;
					// case 'I': l = 'I'; break;
					// case 'J': l = 'J'; break;
					// case 'K': l = 'K'; break;
					case 'L': l = 'Λ'; break;
					// case 'M': l = 'M'; break;
					// case 'N': l = 'N'; break;
					case 'O': l = 'Ω'; break;
					case 'P': l = 'Π'; break;
					// case 'Q': l = 'Q'; break;
					// case 'R': l = 'R'; break;
					case 'S': l = 'Σ'; break;
					case 'T': l = 'Θ'; break;
					// case 'U': l = 'U'; break;
					// case 'V': l = 'V'; break;
					// case 'W': l = 'W'; break;
					case 'X': l = 'Ξ'; break;
					// case 'Y': l = 'Y'; break;
					// case 'Z': l = 'Z'; break;
                    default: l = args[0][i];
                }
                out += l;
            }
            this.webhookreply(this.member, out);
        }
    },
    "russian": {
        desc: "Roughly transliterates latin text into cyrillic text",
		args: [
			[dc.BIGTEXT, "text", "What to transliterate", true],
		],
		hide: true,
		func: async function (args) {
            let out = "";
            for (let l, i = 0; i < args[0].length; ++i) {
                switch (args[0][i]) {
                	// Credit: BrotherEarth967
					// Letters without direct analogues have been left unchanged and commented out
					// Lowercase
					case 'a': l = 'а'; break;
					case 'b': l = 'б'; break;
					// case 'c': l = 'c'; brea//
					case 'd': l = 'д'; break;
					case 'e': l = 'е'; break;
					case 'f': l = 'ф'; break;
					case 'g': l = 'г'; break;
					case 'h': l = 'х'; break;
					case 'i': l = 'и'; break;
					// case 'j': l = 'j'; break;
					case 'k': l = 'к'; break;
					case 'l': l = 'л'; break;
					case 'm': l = 'м'; break;
					case 'n': l = 'n'; break;
					case 'o': l = 'о'; break;
					case 'p': l = 'п'; break;
					// case 'q': l = 'q'; break;
					case 'r': l = 'р'; break;
					case 's': l = 'с'; break;
					case 't': l = 'т'; break;
					case 'u': l = 'у'; break;
					case 'v': l = 'в'; break;
					// case 'w': l = 'w'; break;
					// case 'x': l = 'x'; break;
					// case 'y': l = 'y'; break;
					case 'z': l = 'з'; break;
					// Uppercase
					case 'A': l = 'А'; break;
					case 'B': l = 'Б'; break;
					// case 'C': l = 'C'; break;
					case 'D': l = 'Д'; break;
					case 'E': l = 'Е'; break;
					case 'F': l = 'Ф'; break;
					case 'G': l = 'Г'; break;
					case 'H': l = 'Х'; break;
					case 'I': l = 'И'; break;
					// case 'J': l = 'J'; break;
					case 'K': l = 'К'; break;
					case 'L': l = 'Л'; break;
					case 'M': l = 'М'; break;
					case 'N': l = 'Н'; break;
					case 'O': l = 'О'; break;
					case 'P': l = 'П'; break;
					// case 'Q': l = 'Q'; break;
					case 'R': l = 'Р'; break;
					case 'S': l = 'С'; break;
					case 'T': l = 'Т'; break;
					case 'U': l = 'У'; break;
					case 'V': l = 'В'; break;
					// case 'W': l = 'W'; break;
					// case 'X': l = 'X'; break;
					// case 'Y': l = 'Y'; break;
					case 'Z': l = 'З'; break;
                    default: l = args[0][i];
                }
                out += l;
            }
            this.webhookreply(this.member, out);
        }
    },
    "buffalo": { // buffalo is hard to spell
		desc: "Encodes text in purely buffalos",
		args: [
			[dc.BIGTEXT, "text", "What to buffalo", true],
		],
		hide: true,
		func: async function (args) {
			let out = "";
			let l;
			for (let i = 0; i < args[0].length; ++i) {
				l = args[0].charCodeAt(i);
				if (l >= 97 && l <= 122) { // between 'a' & 'z'
					l -= 96; // 'a' - 1
				} else if (l >= 65 && l <= 90) { // between 'A' & 'Z'
					l -= 64; // 'A' - 1
				} else {
					if (args[0][i] === " ") continue; // spaces make things confusing
					out = out.slice(0, -2) + args[0][i] + ", ";
					continue;
				}
				out += (
					("BUFFALO ".repeat(Math.floor(l / 5))) +
					("buffalo ".repeat(l % 5))
				).slice(0, -1) + ", ";
			}
			out = out.slice(0, -2); // remove tailing ", "
			this.webhookreply(this.member, out);
		}
    },	
    "uwu": {
        desc: "Mirror text",
		args: [
			[dc.BIGTEXT, "text", "What to mirror", true],
		],
		hide: true,
		func: async function (args) {
            args = `  ${args[0]}.`;
            let out = "";
            let l;
            for (let i = 2; i < args.length; ++i) {
                switch (args[i].toLowerCase()) {
                    case 'w':
                        l = "ww";
                        break;
                    case 'q':
                        if (args[i + 1].toLowerCase() !== 'u') break;
                        l = 'qw';
                        break;
                    case 'n':
                        if ("aeiou".indexOf(args[i + 1].toLowerCase()) === -1) break;
                        if (args[i - 1].toLowerCase() === 'n') break;
                        l = "ny";
                        break;
                    case 'y':
                        if (args[i + 1] !== ' ') break;
                        l = 'y'
                    case '~':
                        if (l === undefined) l = "";
                        if (Math.random() > 0.5) l += "~~";
                        else l += "~";
                        break;
                    case 'c':
                        if (args[i + 1].toLowerCase() === 'k') l = '';
                        break;
                    case 'r':
                        if (args[i - 1] === ' ') break;
                        l = 'w'
                        break;
                    case 't':
                        if (args[i + 1].toLowerCase() !== 'h') break;
                        if (args[i - 1] !== ' ') break;
                        l = 'v'
                        break;
                    case 'h':
                        if (args[i - 1].toLowerCase() !== 't') break;
                        l = '';
                        break;
                    case 'o':
                        if ("btlm".indexOf(args[i - 1].toLowerCase()) === -1) {
                            if (args[i + 1].toLowerCase() === 'o') l = '';
                            break;
                        };
                        l = 'u';
                        break;
                    case 'u':
                        if ("btlm".indexOf(args[i - 1].toLowerCase()) === -1) break;
                        l = 'o';
                        break;
                    case 'e':
                        if ("vr".indexOf(args[i - 1].toLowerCase()) === -1) l = 'ee';
                        else l = '';
                        break;
                    case 'l':
                        if (args[i - 1].toLowerCase() == 'l') break;
                        if (args[i + 1] === ' ') l = 'wl';
                        else l = 'w'
                        break;
                    case 'i':
                        if (args[i + 1] !== ' ') break;
                        l = 'i-i'
                        break;
                    case ' ':
                        if (Math.random() > 0.7) {
                            switch (Math.floor(Math.random() * 5)) {
                                case 0: l = " \*coughs\* "; break;
                                case 1: l = " \*nuzzles\* "; break;
                                case 2: l = " \*hugs\* "; break;
                                case 3: l = " \*meow\* "; break;
                                case 4: l = " \*stares\* "; break;
                                case 5: l = " \*pouncs\* "; break;
                            }
                        } else {
                            if ("abcdefghijklmnopqrstuvwxyz".indexOf(args[i + 1].toLowerCase()) === -1) break;
                            l = ` ${args[i + 1]}-`;
                        }
                        break;
                    case '.':
                        if (Math.random() > 0.5) {
                            if (Math.random() > 0.7) l = "..";
                            else if (Math.random() > 0.3) {
                                if (Math.random() > 0.5) l = " owo";
                                else l = " uwu";
                            }
                            break;
                        } // transform into '!'
                    case '!':
                        l = "!";
                        for (let _ = 0; _ < Math.random() * 3 + 2; ++_) {
                            if (Math.random() > 0.7) l += '1';
                            else l += '!';
                        }
                        break;
                }
                if (l === undefined || Math.random() > 2) {
                    out += args[i];
                } else {
                    if (args[i] !== ' ' && args[i] !== '.' && args[i] !== '!' && args[i].toUpperCase() === args[i]) l = l.toUpperCase();
                    out += l;
                }
                l = undefined;
            }
            if (Math.random > 0.5)
                out += " uwu";
            this.webhookreply(this.member, out);
        }
    },
};
