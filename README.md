# discord-bot
Version 2 of a cog based framework for discord.js bots  

## Features
* Ping bot for help
* Modulur cog system
* Bootifull embed UI
* Automatic slash command builder
* Automatic help builder
* Can infact cook pancakes (discord is lying)

## Usage
Run `./run.sh` or `./index.js` with `nodejs`

## Config
Config is located in `conf.json`, the structure of a config file can be found in `conf.def.json`  
Config is split between files where `main` is for the main file whilst others like `goodmorning` are for cogs  
Help for configuration for other cogs can be found at the top of their files  

### Main config
`token`: The discord token to use (also known as OAuth2 Client Secret) 
`prefix`: The command prefix to use  
`admins`:  
`color`:  
`help`:  

###### This next part is for developers :)

## Globals
Stuff which you can use everywhere

### Modules
Both `fs` and `http`s are included

### Discord.js
Discord.js is included as `dc` with added parts  
#### Argument types
This is mostly for internal use. The types of arguments are `dc.TEXT`, `dc.BIGTEXT`, `dc.INT`, `dc.NUM`, `dc.USER`, `dc.ROLE`, `dc.BOOL`, `dc.CHOICE`. You can get a string name for these using  
`dc.typename(n: Enum) => String`: Convert an argument type to a string

### Util
`util.levdis(a: String, b: String) => dis: Integer`: Get the levenhtein distance between two strings  
`util.levdissort(list: List<String>, target: String, cutoff: Integer) => List<String>`: Sort a list by `levdis` to a `target` (items further than `cutoff` are removed)  
`util.rgbtoarr(rgb: Integer) => List<Integer>)`: Convert a 24 bit rgb int to an array of the rgb values  
`async util.fetch(url: String) => String`: A url fetching tool when bultin fetch and http don't work  

### Client
Where all client related shenanigans is stored, refer to (docs)[https://discord.js.org/#/docs/discord.js/main/class/Client] for more info  
`client.cmds`: Dictionary of commands  
`client.cogs`: Paths of loaded cogs  
Here are some functions!  
`client.cogs.load(name: String) => undefined` Load a cog

## Cogs
Cogs can be found in `./cogs/*.js`, this is the format of a cog  
```js
/* cogname.js
<what I does>
Config
"cogname": {
	"name": <value>
}
Requires
nop: provide an actuall reason for this library to exist, I'm serious go onto npm, search nop, and tell me why this exists and why 42 other libraries depend on LITERALLY NOTHING whilst having FIVE THOUSAND, THREE HUNDRED AND FORTY SIX WEEKLY DOWNLODS. LIKE I CAN WRITE THIS CODE RIGHT HERE RIGHT NOW, 3, 2, 1, function nop(){}, wow i DID IT AAAAGH
*/

module.exports.cmds = {
	...
};

console.log("Put effects here");
```

### Commands
In `module.exports.cmds` you can place any amount of commands in this format  
```js
"commandname": {
	"desc": "What I do",
	"func": async function (args) {
		...
	}
}
```  
Here are some extra options
`admin`: Whether user must be an admin (in `conf.main.admins`)  
`dm`: Whether this command can be used in DMs or not  
`hide`: Whether the calling of this command is hidden  
`args`: List of arguments (look below for more info)

### Arguments
Arguments are very clamplicated, here is an example of some args  
```js
args: [
	[dc.TEXT, "channel", "Name of channel", true],
	[dc.USER, "user", "User to make immortal", false],
	[dc.INT, "server", "ID of the server", false]
]
```  
And an explanation of the format
```js
args: [
	[dc.TYPEOFARG, "name", "Description", <required>]
]
```
As a reminder, the arg types are `dc.TEXT`, `dc.BIGTEXT`, `dc.INT`, `dc.NUM`, `dc.USER`, `dc.ROLE`, `dc.BOOL`, `dc.CHOICE`. There are also some extra items for certain arg types  
#### dc.INT / dc.NUM
2 more arguments `min` and `max` can be specified
#### dc.CHOICE
another argument of a list must be specified with the different things this argument can be

### IO
In the command function, `this` refers to the message object with some extras
#### Embedreply
This is the most complicated given function, and as such I'm going to break it down a bit more. Here is the semi formal syntax for referance  
```js
async this.embedreply(Object<{
	msg: String
	title: String
	color: List<Integer>
	fields: List<Object<{
		name: String,
		value: String
	}>>
	thumb: Url (String),
	image: Url (String),
	url: Url (String),
}>) => undefined
```
Don't be scared! look at this example instead  
```js
await this.embed({
	"title": "Hello World",
	"msg": "I'm a bot!"
});
```
See? ez.
#### Everything else
`async this.errorreply(msg: String)`: A shorthand for an error message embedreply  
`async this.webhookreply(user: dc.GuildMember, msg: String)`: Send a message as a different user (doesn't work in DMs)

