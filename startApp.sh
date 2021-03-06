#!/bin/bash

dockerImageBuild()
{
  docker build -t node_app . &> /dev/null
  return $?
}

currdir=`pwd | rev | cut -d / -f 1 | rev`

if [[ $currdir != "WorkManagement" ]]
then
  echo -en "[#] Move to directory 'WorkManagement' and then execute this\n"
  exit 1
fi

command -v docker > /dev/null 2>&1 
if [ $? -ne 0 ]
then
  echo -e "[#] Docker not found , install docker first"
  exit 1
fi

echo -e "[*] Checking for presence node docker image"
docker images | grep -i node_app  | grep -i latest > /dev/null 2>&1
if [ $? -ne 0 ]
then
  echo -e "[#] docker image for node_app not found, preparing the image first"
  dockerImageBuild
  if [ $? -eq 0 ]
  then
    echo -e "[*] docker image preperation succesfull"
  else
    echo -e "[#] docker image preperation failed"
    exit 1
  fi
else
  echo -e "[*] docker image for node_app already available"
fi

echo -e "[*] Checking for presence redis image"
docker images | grep -i redis | grep -i latest > /dev/null 2>&1
if [ $? -ne 0 ]
then
  echo -e "[#] docker images for redis not found, pulling image first"
  docker pull redis
else
  echo -e "[*] docker image for redis found"
fi

echo -e "[*] Starting redis container first , for DB access"
echo -e "[*] For persistance data will be stored in $PWD/redisData/ directory."
docker rm --force work_management_redis > /dev/null 2>&1
docker run -p '6379:6379' -v $PWD/redisData:/data --name work_management_redis -d redis  --appendonly yes > /dev/null 2>&1
if [ $? -eq 0 ]
then
  echo -e "[*] Started redis container"
else
  echo -en "[#] Unable to redis server\n"
  exit 1
fi


echo -en "[*] Starting node container for WebApp\n"
docker rm --force work_management_webapp > /dev/null 2>&1
npm i &> /dev/null
docker run -dit --net=host --name work_management_webapp -v $PWD:/app -v $PWD/views:/views  node_app node /app/app.js > /dev/null 2>&1
if [ $? -eq 0 ]
then
  echo -en "[*] Server started, for accessing WebApp visit : 127.0.0.1:8008\n"
  exit 0
else
  echo -en "[#] Unable to start WebApp server\n"
  exit 1
fi

