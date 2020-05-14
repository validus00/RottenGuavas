# RottenGuava

**CS 340 Spring 2020 - Team 11**
  - April Castaneda
  - Kevin Wu

**1. Commands to run to prepare for your server**
  - Start bash
```
bash
```
  - Install required modules
```
npm install
npm install forever
```
  - Create a config.py file by using bash shell to echo the contents of the file into config.py. {your port number} could be any port, 12122 for example. And {api key} is your api key
```
echo -e "PORT = {your port number}\nAPI_KEY = '{api key}'" >> config.py
```
  - For the above step, for example, if your port number were 12122 and your api key were oijweiotjowetoj, you would type:
```
echo -e "PORT = 12122\nAPI_KEY = 'oijweiotjowetoj'" >> config.py
```
**2. Run the server**
  - Run Node
```
node main.js {your port number}
```
**3. To run forever**
  - Run Node with forever
```
./node_modules/forever/bin/forever start main.js {your port number}
```
**4. To stop your server after running forever**
  - Find your process ID(s) (find the command that ends with "/forever/bin/monitor main.js" and the command with "main.js {your port number}"
```
ps aux | grep {your user name}
```
  - Then terminate your process ID(s)
```
kill -9 {processId}
```
**5. To open the website**
  - Log into OSU VPN
  - Open a web browser and enter flipX.engr.oregonstate.edu:{your port number}, where X in flipX is the same flip server that you are running your instance on. flip3 is one for example. {your port number} is the {your port number} that you set in config.py. For example, to reach one instance of the server, you could enter http://flip3.engr.oregonstate.edu:12121/ in your web browser address.
