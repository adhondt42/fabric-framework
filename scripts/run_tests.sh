#!/usr/bin/env bash

docker-compose -f tests/hyperledger-fabric-network/docker-compose.yaml up -d orderer.dummy.com peer0.org1.dummy.com
