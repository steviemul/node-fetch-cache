# Introduction

A drop in replacement for node-fetch which supports caching by honouring standard browser cache headers e.g. Cache-Control, ETag, Last-Modified.

Different types of caches may be implemented, so far, there's a basic in memory cache handler, a basic disk cache, and a Redis (https://redis.io/) cache client.

