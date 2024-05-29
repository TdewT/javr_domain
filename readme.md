# JAVR Strona
This is a website made mainly for easy control of all servers I am hosting.
Although it may have more features in the future

## Currently available features:
### Server features:
- Stopping and starting servers (for all supported types)
- Monitoring server status
- Live list of users on servers (currently only available for minecraft servers with query)

### API
- Token system
- Get live information about servers

### Other:
- Information about ZeroTier network
- Form for modifying ZeroTier network users

### Supported types of servers:
- Minecraft vanilla (full support of all features)
- Minecraft forge (same as vanilla, needs different initialization, 
<a href="https://github.com/TdewT/javr_strona/blob/api/json_templates/servers_info.json#L53"> see json_templates/servers_info.json</a>)
- Arma 3 (no user list)
- Teamspeak (no user list)

Other types of servers can still be monitored based on port 
activity (as GenericServer type), but without any additional features.

# Documentation
There is currently no proper documentation, although it is planned (not so)soon™. <br>
For now, you need to make due with comments in code.

# API

## 1. Token

To use site's api you need to get yourself a token, which will be generated after sending GET request on `http://website.address/api/token`

> [!NOTE]
> If you send token request while already having one assigned, you will get a new one.

>[!IMPORTANT]
> Current token system will most likely be replaced in the future.

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

## 2. Other endpoints
All endpoints, except for the token generator, will always look like this: `http://website.address/your-token/endpoint-name`


### Currently supported endpoint names:
- servers

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
