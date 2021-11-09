### centos 搭建 geth client 节点

#### install golang
sudo yum install golang


#### 
mkdir ~/app
cd ~/app
wget https://gethstore.blob.core.windows.net/builds/geth-linux-amd64-1.10.12-6c4dc6c3.tar.gz
tar -xzvf geth-linux-amd64-1.10.12-6c4dc6c3.tar.gz

vim ~/.bash_profile





#### 启动 geth 开始同步块
 nohup  geth --graphql --http --http.addr=0.0.0.0 --ws --ws.addr=0.0.0.0 --datadir=/app/eth > /app/geth.log 2>&1 &