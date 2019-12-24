#! /bin/bash

PORT=20000
NODES=6
REPLICAS=1
END_PORT=$((PORT+NODES))
TIMEOUT=2000
HOSTS=""

# Creates and starts a basic 6 node redis cluster, for testing with locally
function start () {
  mkdir -p nodes

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
}

# Kills all active process with name redis-server
function stop () {
  killall redis-server
}

# cleans out any config, db files, to start with a clean cluster
function clean () {
  rm -rf nodes/*.log
  rm -rf nodes/appendonly*.aof
  rm -rf nodes/dump*.rdb
  rm -rf nodes/nodes*.conf
}

# Rebuilds the local redis cluster by calling, stop, clean, start
function rebuild () {
  stop
  clean
  start
}

case "$1" in
  start)
    start
    ;;
  stop)
    stop
    ;;
  clean)
    clean
    ;;
  rebuild)
    rebuild
    ;;
  *)
    echo $"Usage: $0 {start|stop|clean|rebuild}"
    exit 1
esac
