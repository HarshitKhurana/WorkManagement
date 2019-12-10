<h2> WorkManagement </h2>

-> A Simple Node based personalized WebApp for managing work.<br>
-> Includes deadlines so as to keep you on track. <br>

<h3>[*] Installation | Execution</h3>
-> Once docker is installed simply go to the directory and execute `startApp.sh`, this will start the server on port 8080 which you can simply access via browser.</br>
<br>

```bash
./startApp.sh
```

<h3>[*] Notes</h3>
-> It uses redis for faster storage and retreval of information <br>
-> The entire app runs inside a docker container be it the Web base application or the redis storage. <br>
-> Once a task is added it cannot be modified, so take some time while adding the task specially the deadlines. <br>
-> The groups columns helps to club one or more tasks together i.e helps in clubbing of tasks.<br>
-> Tasks listed on 'deadline' are in sorted order as per their deadlines.<br>
-> It only uses docker to run inside a protected environment.<br>

<h3>[*] Dependencies</h3>
-> Since it runs inside a container the first and primary requirement in for installation refer to <a href="https://docs.docker.com/install/">installing docker</a>. <br>
-> Modules dependencies present in package.json, these will be installed in the node\_app docker container.<br>

<h3>[*] Limitations</h3>
-> Currently no login feature added as it was solely meant to be a personal use app. </br>
