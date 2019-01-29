#!/bin/bash

command -v docker > /dev/null 2>&1 
if [ $? -ne 0 ]
then
  echo -e "[#] Docker not found , install docker first"
  exit 1
fi

echo -e "[*] Checking for presence WorkManagement image"
docker images | grep -i workmgmt_node  | grep -i latest > /dev/null 2>&1
if [ $? -ne 0 ]
then
  echo -e "[#] docker images for workmgmt_node not found, generating image first"
  docker build -t workmgmt_node -f DockerfileNode .
  if [ $? -eq 0 ]
  then
    echo -e "[*] workmgmt_node image build successful"
  else
    echo -e "[*] workmgmt_node image build failed, exiting..."
    exit 1
  fi
else
  echo -e "[*] docker image for workmgmt_node found"
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
docker run -dit --net=host -p 8080:8080 --name work_management_webapp -v $PWD:/app -v $PWD/views:/views  workmgmt_node node /app/app.js > /dev/null 2>&1
if [ $? -eq 0 ]
then
  echo -en "[*] Server started, for accessing WebApp visit : 127.0.0.1:8080\n"
else
  echo -en "[#] Unable to WebApp server\n"
  exit 1
fi

# Start redis container with persistent storage


