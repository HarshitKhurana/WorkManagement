#!/bin/bash

# Start redis container with persistent storage
docker run -p '6379:6379' -v $PWD/redisData:/data -d redis   --appendonly yes


