#!/usr/bin/env bash

docker-compose -f hyperledger-fabric-network/docker-compose.yaml up -d
sleep 10
docker ps -a
docker-compose -f hyperledger-fabric-network/docker-compose.yaml down

