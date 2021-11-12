### centos 搭建 geth client 节点


### geth install
mkdir ~/app
cd ~/app
wget https://gethstore.blob.core.windows.net/builds/geth-linux-amd64-1.10.12-6c4dc6c3.tar.gz
tar -xzvf geth-linux-amd64-1.10.12-6c4dc6c3.tar.gz


```
vim ~/.bash_profile
---
  GETH_PATH=/home/ec2-user/app/geth-linux-amd64-1.10.12-6c4dc6c3
  PATH=$PATH:$HOME/.local/bin:$HOME/bin:$GETH_PATH

  export PATH
----
source ~/.bash_profile
```

#### 启动 geth 开始同步块
sudo chown -R ec2-user /app
mkdir /app/eth /app/logs  /app/logs/geth
nohup  geth --graphql --http --http.addr=0.0.0.0 --ws --ws.addr=0.0.0.0 --datadir=/app/eth >> /app/logs/geth/geth.log 2>&1 &


### 填加信任节点
geth attach /app/eth/geth.ipc

admin.addTrustedPeer('node address from bloxgateway')

### 安装部署 bloxRouterX
<!-- copy run_bloxrouter_gateway.sh  -> ~/app -->

#### install docker
```
sudo yum install docker
sudo service docker restart
```
#### 启动 bloxrouter

```
docker run --publish 1801:1801 -d --publish 28332:28332 --publish 28333:28333 --volume /home/ec2-user/ssl:/app/ssl  --volume /app/bloxrouter/datadir:/app/datadir\
    bloxroute/bxgateway \
    --private-ssl-base-url file:///app/ssl \
    --blockchain-protocol Ethereum  \
    --blockchain-network Mainnet  \
    --blockchain-ip 172.31.3.190\
    --blockchain-port 30303 \
    --ws true \
    --data-dir /app/datadir \
    --node-public-key="a51d4d172f08700a47479d8d5e44d07ecfcdb0a226667019fff7ebaf40ee9d47787ccb70847f86532a64bb10ce4b196534c8583bcafa935972cb9d7774ad5b1c" \
    --external-ip=35.158.108.187
```
blockchain-ip : eth node ip
#### enode 获取
enode://xxx....xxx@127.0.0.1:30303 信息获取
head -n 100 /app/logs/geth/geth.log |grep enode

#### ssl文件获取

从 bloxrouter 网站下载 , 解压后放至 ~/ssl
