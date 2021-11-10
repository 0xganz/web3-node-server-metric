### centos 搭建 geth client 节点

#### install golang
sudo yum install golang


#### 
mkdir ~/app
cd ~/app
wget https://gethstore.blob.core.windows.net/builds/geth-linux-amd64-1.10.12-6c4dc6c3.tar.gz
tar -xzvf geth-linux-amd64-1.10.12-6c4dc6c3.tar.gz


```
vim ~/.bash_profile

GETH_PATH=/home/ec2-user/app/geth-linux-amd64-1.10.12-6c4dc6c3
PATH=$PATH:$HOME/.local/bin:$HOME/bin:$GETH_PATH

export PATH
```

#### 启动 geth 开始同步块
chmod -R ec2-user /app
nohup  geth --graphql --http --http.addr=0.0.0.0 --ws --ws.addr=0.0.0.0 --datadir=/app/eth > /app/geth.log 2>&1 &


### 安装部署 bloxRouterX
copy run_bloxrouter_gateway.sh  -> ~/app

```
docker run --publish 1801:1801 -d --publish 28332:28332 --publish 28333:28333 --volume /home/ec2-user/ssl:/app/ssl  --volume /app/bloxrouter/datadir:/app/datadir\
    bloxroute/bxgateway \
    --private-ssl-base-url file:///app/ssl \
    --blockchain-protocol Ethereum  \
    --blockchain-network Mainnet  \
    --blockchain-ip 192.168.37.69\
    --blockchain-port 30303\
    --ws true \
    --data-dir /app/datadir \
    --node-public-key="565a39192ff7224de7d0777d913a0997bdbf98b266ccd6e769dfe6d3fc53f67182c7539726367e897a86cf0352ad68e79305db4fa1f968c6c2f5e8b309f8140d" \
    --external-ip=13.229.143.14
```
blockchain-ip : eth node ip
#### enode 获取
enode://xxx....xxx@127.0.0.1:30303 信息获取
head -n 100 /app/geth.log |grep enode

#### ssl文件获取

从 bloxrouter 网站下载 , 解压后放至 ~/ssl
