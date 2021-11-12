### web3-node-server-metric

测试第三方服务节点的延迟测试

####

第三方服务
 - infura
 - alchemy
 - quicknode
 - bloxRouter
 - bloxRouter-gateway
#### 收集数据说明
 - 各服务商 eth newBlockHeader  的推送时间差
 - 各服务商 eth pending - transaction 的推送时间差


### 部署
#### requirement

 - node >= 10

#### 安装依赖
```
npm i
```

#### 编译
```
 npm run build
```

#### 收集测试数据
node ./dist/index.js 1 [收集数据时间（分钟）] [收集次数]


例如： 每次收集 15分钟数据， 收集 4次

```
node ./dist/index.js 1  15 4

```
单独测试 一个服务节点的数据

例如 测试 alchemy

```
node ./dist/worker.js  wss://eth-mainnet.alchemyapi.io/v2/ZjBad3Dq8qMtn4_fcbWpBnVI3XxOIx2m /Users/xxx/code/typescript/web3-node-server-metric  alchemy  1234 
```
#### 查看收集结果

启动 web 服务
```
node ./dist/server.js
```
访问 http://localhost:9999/list

#### 效果图展示

![](https://github.com/CyberXCorp/web3-node-server-metric/blob/master/img/tk_log_infra_alchemy_diff.png)