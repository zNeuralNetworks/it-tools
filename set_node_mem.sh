#!/bin/bash

if [[ "$OSTYPE" == "darwin"* ]]; then
    memory=$(sysctl -n hw.memsize)
    memory=$((memory / 1024 / 1024))
else
    memory=$(awk '/MemTotal/{print $2}' /proc/meminfo)
    memory=$((memory / 1024))
fi

# Homelab: cap the heap so a build can't thrash a shared host (coolify-vm is
# 2 vCPU/6GB and runs Traefik + all apps — uncapped, this computed 4901 and took
# the VM down, 2026-07-16). Override with MAX_NODE_MEM if building on a big box.
heap=$((memory - 1024))
max_heap="${MAX_NODE_MEM:-3072}"
[ "$heap" -gt "$max_heap" ] && heap=$max_heap
node_options="--max-old-space-size=$heap"

echo "NODE_OPTIONS=$node_options"
export NODE_OPTIONS="$node_options"
