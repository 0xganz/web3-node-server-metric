### web3-node-server-metric

测试第三方服务节点的延迟测试

####

第三方服务
 - infura
 - alchemy
 - quicknode
#### 收集数据说明
 - 各服务商 eth defi合约（weth-usdt） log 的推送时间差
 - 各服务商 eth pending - transaction 的推送时间差

 时间差以 infura 为基数

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

#### 查看收集结果

启动 web 服务
```
node ./dist/server.js
```
访问 http://localhost:9999/list

#### 效果图展示

![]((https://github.com/CyberXCorp/web3-node-server-metric/img/tk_log_infura_alchemy_diff.png)