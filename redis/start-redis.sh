#! /bin/bash

PORT=20000
NODES=6
REPLICAS=1
END_PORT=$((PORT+NODES))
TIMEOUT=2000
HOSTS=""

echo "Starting Redis Servers"

cd nodes

while [ $((PORT < END_PORT)) != "0" ]; do
  PORT=$((PORT+1))
  HOSTS="$HOSTS 127.0.0.1:$PORT"

  redis-server --port $PORT \
    --cluster-enabled yes \
    --cluster-config-file nodes-${PORT}.conf \
    --cluster-node-timeout $TIMEOUT \
    --appendonly yes \
    --appendfilename appendonly-${PORT}.aof \
    --dbfilename dump-${PORT}.rdb \
    --logfile ${PORT}.log \
    --maxmemory 100MB \
    --maxmemory-policy allkeys-lru \
    --daemonize yes
done

redis-cli --cluster create $HOSTS --cluster-replicas $REPLICAS --cluster-yes