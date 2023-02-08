const thegame = "The game, The game 2, The thought, The memory, The thing, The hand, Sus, Among us, I hardly know her, Egad my roast is ruined, Egam, Have you found your micrphone yet?"

module.exports.cmds = {
	"game": {
		desc: "The Game!!! (and much more)",
		func: async function (args) {
			try {
				await this.reply ({ content: thegame });
			} catch (e) {
				this.channel.send({ content: thegame });
			}			
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
        desc: "Mirror text",
		args: [
			[dc.BIGTEXT, "text", "What to mirror", true],
		],
		hide: true,
		func: async function (args) {
            let out = "";
            let l;
            for (let i = 0; i < args[0].length; ++i) {
                switch (args[0][i]) {
                    case 'p':
                        l = 'Q';
                        break;
                    case 'P':
                        l = 'q';
                        break;
                    case 'q':
                        l = 'P';
                        break;
                    case 'Q':
                        l = 'p';
                        break;
                    case 'b':
                        l = 'D';
                        break;
                    case 'B':
                        l = 'd';
                        break;
                    case 'd':
                        l = 'B';
                        break;
                    case 'D':
                        l = 'b';
                        break;
                    case 'm':
                        l = 'N';
                        break;
                    case 'M':
                        l = 'n';
                        break;
                    case 'n':
                        l = 'M';
                        break;
                    case 'N':
                        l = 'm';
                        break;
                    default:
                        l = args[0][i];
                }
                out += l;
            }
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
