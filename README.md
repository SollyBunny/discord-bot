# discord-bot
Version 2 of a cog based framework for discord.js bots  

## Features
* Ping bot for help
* Modulur cog / hook system
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
`admins`: List of string IDs of admins  
`activity`: Activity text of the bot  

###### This next part is for developers :)

## Globals
Stuff which you can use everywhere

### Modules
Both `fs` and `http`s are included

### Custom log
When possible use the custom `log` global instead of `console.log`, here are the functions available:  
`log(msg: String) => undefined`: Print a debug msg  
`log.info(msg: String) => undefined`: Print an info msg  
`log.warn(msg: String) => undefined`: Print a warn msg  
`log.error(msg: String) => undefined`: Print an error msg  
`log.fake(...args: *) => String`: Same arguments as `console.log`, outputs the string which woud've been printed (includes escape codes) (don't use this) (ever)  

### Discord.js
Discord.js is included as `dc` with added parts  
#### Argument types
This is mostly for internal use. The types of arguments are `dc.TEXT`, `dc.BIGTEXT`, `dc.INT`, `dc.NUM`, `dc.USER`, `dc.ROLE`, `dc.BOOL`, `dc.CHOICE`. You can get a string name for these using  
`dc.typename(n: Enum) => String`: Convert an argument type to a string

### Util
`util.levdis(a: String, b: String) => dis: Integer`: Get the levenhtein distance between two strings  
`util.levdisclosest(list: List<String>, target: String, cutoff: Integer) => List<String>`: Sort a list by `levdis` to a `target` (items further than `cutoff` are removed)  
`util.levdisuserclosest(list: List<User / GuildMember>, target: String, cutoff: Integer) => List<String>`: Sort a list of users by `levdis` to a `target` (items further than `cutoff` are removed)  
`async util.fetch(url: String) => String`: A url fetching tool when bultin fetch and http don't work  

### Client
Where all client related shenanigans is stored, refer to (docs)[https://discord.js.org/#/docs/discord.js/main/class/Client] for more info  
`client.cmds`: Dictionary of commands  
`client.cogs`: Paths of loaded cogs  
`client.hooks`: All hooks  
Here are some functions!  
`client.cogs.load(name: String) => undefined` Load a cog  
`client.hooks.add(event: String, priority: Number, func: async function => Boolean) => undefined` Add a hook  

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

module.exports.hooks = { // optional
	...
};

module.exports.cmds = { // optional
	...
};

// optional
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
  
Here is the format for the argument param  
```js
args: [
	[dc.TEXT, "channel", "Name of channel", true],
	[dc.USER, "user", "User to make immortal", false],
	[dc.INT, "server", "ID of the server", false]
]
```  
And the format
```js
args: [
	[dc.TYPEOFARG, "name", "Description", <required>]
]
```
As a reminder, the arg types are `dc.TEXT`, `dc.BIGTEXT`, `dc.INT`, `dc.NUM`, `dc.USER`, `dc.ROLE`, `dc.BOOL`, `dc.CHOICE`. There are also some extra items for certain arg types  
`dc.INT` / `dc.NUM` 2 more arguments `min` and `max` can be specified  
`dc.CHOICE`: another argument of a list must be specified with the different things this argument can be  
  
In the command function, `this` refers to the (message)[https://discord.js.org/#/docs/discord.js/main/class/Message], (interaction)[https://discord.js.org/#/docs/discord.js/main/class/CommandInteraction] object with some extras.  
These extras are:
`this.author.isNotPerson`: Whether the author is a bot, system or webhook message or just a user  
`async this.embedreply(Object {<opts>}) => undefined`: Send an embed reply  
`async this.errorreply(msg: String) => undefined`: A shorthand for an error message embedreply  
`async this.webhookreply(user: dc.GuildMember, msg: String) => undefined`: Send a message as a different user (sends a message in DMs)  

Here is an explanation of the most complicated given function, and as such I'm going to break it down a bit more. Here is the semi formal syntax for referance  
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

### Hooks

In `module.exports.hooks` you can place any amount of hooks in this format  
```js
"commandname": {
	"event": "<event name>",
	"priority": 0,
	"func": async function () {
		...
	}
}
```  
Explanation of each param:  
`event`: The name of the event to hook to, you can see them (here)[https://discord.js.org/#/docs/discord.js/main/class/Client] -> events  
`priority`: The (order) priority of this hook (-10, 0, 10 are normal)  
`func`: The function, this is the event object, return `true` to "consume" this event  


