# RottenGuava

**CS 340 Spring 2020 - Team 11**
  - April Castaneda
  - Kevin Wu

**Our Website on Heroku**
  - http://calm-caverns-42889.herokuapp.com/

**1. Commands to run to prepare for your server**
  - Start bash
```
bash
```
  - Install required modules
```
npm install
npm install forever
npm install express-session
```
  - Update your credentials in dbcon.js. Enter user, password, database information.
  
  - Untrack your changes in dbcon.js so that git will no longer track dbcon.js in commits.
```
git update-index --assume-unchanged dbcon.js
```
**2. Run the server**
  - Run Node
```
node app.js {your port number}
```
**3. To run forever**
  - Run Node with forever
```
./node_modules/forever/bin/forever start app.js {your port number}
```
**4. To stop your server after running forever**
  - Find your process ID(s) (find the command that ends with "/forever/bin/monitor app.js" and the command with "app.js {your port number}"
```
ps aux | grep {your user name}
```
  - Then terminate your process ID(s)
```
kill -9 {processId}
```
**5. To open the website**
  - Open a web browser and enter "localhost:{your port number}".
