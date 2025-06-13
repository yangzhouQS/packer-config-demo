<template>
  <div class="main-content">
    hello words
    <el-button type="primary" @click="handleCkick">测试按钮</el-button>
    <el-button type="primary" @click="verifyCode">测试验证码</el-button>
    <el-button type="primary" @click="getPmInnerShare">getPmInnerShare</el-button>
    <el-button type="primary" @click="formDesignConfig">formDesignConfig</el-button>
  </div>
</template>

<script setup lang="ts">
import {$http} from '@cs/js-inner-web-framework'

const handleCkick = () => {
  console.log('测试按钮')
  $http.get('user/get-plat-form-manu-facturer?b=2').then(res => {
    console.log(res)
  })
}
const verifyCode = () => {
  $http.get('verifyCode?a=1').then(res => {
    console.log(res)
  })
}

const getPmInnerShare = () => {
  $http.get('/pmInnerShare/inner-metadata-api/menus?productId=850814625399808&c=222').then(res => {
    console.log(res)
  })
}

const formDesignConfig = () => {
  const params = {
    namespaceCode: "opConfig",
    paramsKeys: ["formDesignConfig"],
  };
  $http
      .post("/configure/params-value/get-configs", params)
      .then((result: any) => {
        console.log(result);
      });
}

</script>

<style scoped lang="less">

</style>
