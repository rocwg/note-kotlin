

1. elasticsearch 搜索引擎 
   作为独立服务（有界面），可直接购买 阿里云的 es节点。
2. canal ：MySQL binlog 同步到 es中
   iot-card-canal-task：作为一个独立的 jar 运行 Scheduled 去监听 MySQL的 CUD。




## docker 

官网：(https://docs.docker.com/engine/install/debian/)


###  elasticsearch
es: (https://www.elastic.co/guide/en/elasticsearch/reference/master/docker.html)

```shell
docker network create elastic
docker pull docker.elastic.co/elasticsearch/elasticsearch:8.10.2
docker run --name es01 --net elastic -p 9200:9200 -it -m 1GB docker.elastic.co/elasticsearch/elasticsearch:8.10.2

# 疑问
docker run --name es01 --net elastic -p 9201:9200 -it -m 1GB docker.elastic.co/elasticsearch/elasticsearch:8.10.2
docker run --name es01 --net elastic -p 9201:9200 -it -m 1GB bb20157f1390
```

The command prints the elastic user password and an enrollment token for Kibana.

::: info 运行结果

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Elasticsearch security features have been automatically configured!
✅ Authentication is enabled and cluster connections are encrypted.

ℹ️  Password for the elastic user (reset with `bin/elasticsearch-reset-password -u elastic`):
7f_cL7nKRJxeHdWT4Izo

ℹ️  HTTP CA certificate SHA-256 fingerprint:
76f6c569da196a4eff594b0ecee358d0ecee4f0627ad5e7aa7df7748ad6d6fd1

ℹ️  Configure Kibana to use this cluster:
• Run Kibana and click the configuration link in the terminal when Kibana starts.
• Copy the following enrollment token and paste it into Kibana in your browser (valid for the next 30 minutes):
eyJ2ZXIiOiI4LjEwLjIiLCJhZHIiOlsiMTcyLjE4LjAuMjo5MjAwIl0sImZnciI6Ijc2ZjZjNTY5ZGExOTZhNGVmZjU5NGIwZWNlZTM1OGQwZWNlZTRmMDYyN2FkNWU3YWE3ZGY3NzQ4YWQ2ZDZmZDEiLCJrZXkiOiI0V0NaMVlvQlE5NEljZGNUQmJ0VjpMZnU0X2ZrNlNPYWtDaVJFWml4U0N3In0=

ℹ️ Configure other nodes to join this cluster:
• Copy the following enrollment token and start new Elasticsearch nodes with `bin/elasticsearch --enrollment-token <token>` (valid for the next 30 minutes):
eyJ2ZXIiOiI4LjEwLjIiLCJhZHIiOlsiMTcyLjE4LjAuMjo5MjAwIl0sImZnciI6Ijc2ZjZjNTY5ZGExOTZhNGVmZjU5NGIwZWNlZTM1OGQwZWNlZTRmMDYyN2FkNWU3YWE3ZGY3NzQ4YWQ2ZDZmZDEiLCJrZXkiOiIzMkNaMVlvQlE5NEljZGNUQmJzMjpLOF8wSXlpSlNjdWhsUnpJSWlRbm9nIn0=

If you're running in Docker, copy the enrollment token and run:
`docker run -e "ENROLLMENT_TOKEN=<token>" docker.elastic.co/elasticsearch/elasticsearch:8.10.2`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
:::


We recommend storing the elastic password as an environment variable in your shell. Example:

export ELASTIC_PASSWORD="7f_cL7nKRJxeHdWT4Izo"




### kibana

```shell
docker pull docker.elastic.co/kibana/kibana:8.10.2
docker run --name kib01 --net elastic -p 5601:5601 docker.elastic.co/kibana/kibana:8.10.2
docker exec -it es01 /usr/share/elasticsearch/bin/elasticsearch-create-enrollment-token -s kibana

```

### remove containers
To remove the containers and their network, run:

```shell
# Remove the Elastic network
docker network rm elastic

# Remove Elasticsearch containers
docker rm es01
docker rm es02

# Remove the Kibana container
docker rm kib01
```


::: info 我的操作记录

```shell
cs@localhost:~$ docker ps -a
CONTAINER ID   IMAGE         COMMAND    CREATED          STATUS                      PORTS     NAMES
f868e49d99d5   hello-world   "/hello"   8 minutes ago    Exited (0) 8 minutes ago              reverent_mccarthy
271a01738656   hello-world   "/hello"   10 minutes ago   Exited (0) 10 minutes ago             keen_ishizaka
cs@localhost:~$ docker rm f868e49d99d5
f868e49d99d5
cs@localhost:~$ docker rm 271a01738656
271a01738656
cs@localhost:~$ 
```
:::
