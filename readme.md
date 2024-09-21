<p style="display: flex;">
  <img style="margin: auto;" src="./Banner.jpg" alt="JAVR Domain banner">
</p>




# Welcome to JAVR Domain
Functionality of the website is now divided between to webservers, one for managing servers ([Server_Manager](/server_manager)) and another that hosts only the website ([Website](/website)). <br>
This way, the more powerful server can be left offline until it's needed, keeping main site available on another. It will wake up on request from the main website. Once they establish connection with each other you will be able to use the web interface to manage servers the way same as the main branch.



<br>

## Currently available features:


### Server features:
- Stopping and starting servers (for all supported types).
- Monitoring server and Discord bots status.
- Managing servers and Discord bots.
- Live list of users on servers (currently only available for minecraft servers with query).

### API
- Token system.
- Get live information about servers.
- Api for Discord bots coming as always soon™.

### Other:
- Information about ZeroTier network.
- Form for modifying ZeroTier network users.

### Supported types of servers:
- Minecraft vanilla (full support).
- Minecraft forge (full support).
- Arma 3 (basic support+).
- Teamspeak (basic support+).
- Other (basic support)

For more information see [servers](#servers) section



<br><br>
# Services
This section contains information on various server int
> [!WARNING]
> When creating any service object (server, bot, etc.), remember that the names should be unique!


<br>

## Servers
Here are the details of what features are available for different server types:


### 1. Minecraft
Information about the server is gathered live using Minecraft query protocol.

- Display current status of the server.
- List of concurrent players on the server.
- Option to turn the server off or on from web page.
- Automatic shutdown if the server gets stuck while saving data.
- Pick a proper java version for servers minecraft version (currently manually added to look-up file, see template [here](json_templates/minecraft_java_ver.json)).

> [!IMPORTANT] 
> Forge servers require different config structure. See [template file](json_templates/servers_info.json) for more information


### 2. Arma 3 and Teamspeak
Server status is determined by listening on port specified in the config.

- Display current status of the server.
- Option to turn the server off or on from web page.


### 3. Other servers
Server status is determined by listening on port specified in the config.

- Display current status of the server.

<br>

> [!NOTE]
> If you wish to find out how to properly make a config for a server checkout the template file [here](json_templates/servers_info.json)



<br>

## Discord Bots
This is a feature that's early in development and currently is a mess, expect things to break.<br>
That said, it does works, but is limited to bots launched through the website only.

### Current features include:

- Display live status of the bot.
- Check if bot has connected to a lavalink server (required for music, currently not available from website).
- Start or stop bot manually with from the website.
- Start bot with server.

<br>

> [!NOTE]
> If you wish to find out how to properly make a config for a Discord bot checkout the template file [here](json_templates/discord_bots.json)



<br><br>
# Documentation
There is currently no proper documentation, although it is planned (not so)soon™. <br>
For now, you need to make due with comments in code.

<br><br>
# API


## 1. Token

To use site's api you need to get yourself a token, which will be generated after sending GET request on `http://website.address/api/token`.

> [!Warning]
> Currently API is temporarily disabled.

> [!NOTE]
> If you send token request while already having one assigned, you will get a new one.


### Python example

```py
import requests

# api token generator endpoint
token_url = "http://localhost/api/token"
# send GET request
resp = requests.get(url=token_url)
# get object and extract token
token = resp.json()['token']
print(token)
```
### Example output

```
drbu8e1ph1jdknh8o414tnsdspv0phl56eltn
```

<br>

## 2. Other endpoints
All endpoints, except for the token generator, will always look like this: `http://website.address/your-token/endpoint-name`.


### Currently supported endpoint names:
- servers.

<br>

## 3. Servers API
Now you can use your token get information about servers. <br>
To do that you need to send post request on the "servers" endpoint.

### Python example

``` py
import requests

# endpoint for server information
serversEndpoint = "http://localhost/api/drbu8e1ph1jdknh8o414tnsdspv0phl56eltn/servers"
# send POST request
resp = requests.post(url=serversEndpoint)
# get object
servers_info = resp.json()
print(servers_info)
```
### Example output
```yaml
{
  'testos': {
    'lastStatus': 'offline',
    'port': 1234,
    'htmlID': 'testos',
    'displayName': 'Generic: Testos',
    'status': 'offline',
    'path': 'E:\\servers\\generic',
    'type': 'generic'
  },
  'forge-test': {
    'lastStatus': 'offline',
    'port': 25567,
    'htmlID': 'forge-test',
    'displayName': 'Minecraft: forge test',
    'status': 'offline',
    'path': 'E:\\Serwery\\Minecraft Forge - test',
    'type': 'minecraft',
    'lastPlayers': [],
    'currProcess': None,
    'currPlayers': [],
    'maxPlayers': 0,
    'startArgs': [
      '@user_jvm_args.txt',
      '@libraries/net/minecraftforge/forge/1.19.2-43.3.9/win_args.txt',
      '%*'
    ],
    'minecraftVersion': '1.19.2',
    'failedQuery': 2000
  },
  'antistasi-cherno': {
    'lastStatus': 'offline',
    'port': 2302,
    'htmlID': 'antistasi-cherno',
    'displayName': 'Antistasi: Chernarus',
    'status': 'offline',
    'path': 'E:\\steamcmd\\steamapps\\common\\Arma 3 Server\\arma3server_x64.exe',
    'type': 'arma',
    'startArgs': [],
    'currProcess': None
  },
  'teamspeak-main': {
    'lastStatus': 'offline',
    'port': 9987,
    'htmlID': 'teamspeak-main',
    'displayName': 'Teamspeak 3 Server',
    'status': 'offline',
    'path': 'E:\\Serwery\\teamspeak3-server_win64\\ts3server.lnk',
    'type': 'tsserver',
    'currProcess': None
  }
}
```
