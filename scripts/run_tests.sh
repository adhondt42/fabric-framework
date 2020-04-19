#!/usr/bin/env bash

BUILD_NUMBER="${BUILD_NUMBER:-0}"

docker-compose -f tests/hyperledger-fabric-network/docker-compose-ci.yaml --project-name hyperledger-fabric-network_${BUILD_NUMBER} up -d orderer.dummy.com peer0.org1.dummy.com

docker build . -t fabric_framework_test_with_ava_job_${BUILD_NUMBER};

docker run --rm --network=hyperledger-fabric-network_${BUILD_NUMBER}_default -v `pwd`:/home \
fabric_framework_test_with_ava_job_${BUILD_NUMBER} bash -c 'npm rebuild; yarn test:local; exit $?;';

rc=$?;

docker-compose -f tests/hyperledger-fabric-network/docker-compose-ci.yaml --project-name hyperledger-fabric-network_${BUILD_NUMBER} down;
docker rmi -f fabric_framework_test_with_ava_job_${BUILD_NUMBER};
docker images -qf dangling=true | xargs docker rmi -f
docker volume prune -f;
docker network prune -f;

exit $rc;
