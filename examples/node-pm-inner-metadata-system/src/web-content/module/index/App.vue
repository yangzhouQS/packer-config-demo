<template>
  <div class="page">
    <div class="header">
      <div class="logo">
        <img
          src="../../assets/image/favicon.png"
          alt=""
        >
        <span>协同管理系统</span>
      </div>
      <div class="skin fn-btn">
        <el-button
          :icon="Sunny"
          circle
        />
      </div>
      <div class="message fn-btn">
        <el-button
          :icon="Bell"
          circle
        />
      </div>
      <div class="fn-list fn-btn">
        <el-popover
          placement="bottom"
          :width="100"
          trigger="click"
        >
          <template #reference>
            <el-button
              :icon="User"
              circle
            />
          </template>
          <div class="fn-warper">
            <div
              class="fn-item"
              @click="pwdDialogVisible = true"
            >
              <el-icon><Setting /></el-icon> <span>修改密码</span>
            </div>
            <div
              class="fn-item"
              @click="loginOut"
            >
              <el-icon><SwitchButton /></el-icon> <span>注销登录</span>
            </div>
          </div>
        </el-popover>
      </div>
    </div>
    <div class="content">
      <div class="left-panel box">
        <div class="app-list">
          <div class="user-info">
            欢迎回来！{{ userInfo.realName }}
          </div>
          <el-divider content-position="left">
            应用列表
          </el-divider>
          <div class="entry-list">
            <div
              v-for="(item, index) in applicationList"
              :key="index"
              class="item"
              @click="openSystem(item)"
            >
              {{ item.appName }}
            </div>
          </div>
        </div>
        <el-divider content-position="left">
          代办事项
        </el-divider>
        <div class="work-list" />
      </div>
      <div class="right-panel box">
        <el-divider content-position="left">
          快捷方式
        </el-divider>
        <div class="nearler" />
        <el-divider content-position="left">
          系统公告
        </el-divider>
        <div class="notice" />
      </div>
    </div>
  </div>

  <!-- 修改密码窗体 -->
  <el-dialog
    v-model="pwdDialogVisible"
    :close-on-click-modal="false"
    title="修改密码"
    width="350px"
    :destroy-on-close="true"
    @close="resetForm(ruleFormRef)"
  >
    <div class="pwd-form">
      <el-form
        ref="ruleFormRef"
        hide-required-asterisk
        :model="pwdForm"
        label-width="80px"
        :rules="PwdFormRules"
      >
        <el-form-item
          label="原始密码"
          prop="originalPassword"
        >
          <el-input
            v-model.trim="pwdForm.originalPassword"
            show-password
            placeholder="请输入原始密码"
          />
        </el-form-item>
        <el-form-item
          label="新密码"
          prop="password"
        >
          <el-input
            v-model.trim="pwdForm.password"
            show-password
            type="password"
            placeholder="请输入新密码"
          />
        </el-form-item>
        <el-form-item
          label="确认密码"
          prop="confirmPassword"
        >
          <el-input
            v-model.trim="pwdForm.confirmPassword"
            show-password
            placeholder="请确认密码"
          />
        </el-form-item>
      </el-form>
    </div>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="resetForm(ruleFormRef)">重置</el-button>
        <el-button
          type="primary"
          @click="changePwd(ruleFormRef)"
        >确认</el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { $http } from "@cs/js-inner-web-framework";
import { Bell, Setting, Sunny, SwitchButton, User } from "@element-plus/icons-vue";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { onMounted, reactive, ref } from "vue";

const ruleFormRef = ref<FormInstance>();
const pwdDialogVisible = ref(false);
const applicationList = reactive([]);
const pwdForm = reactive({
  originalPassword: "",
  password: "",
  confirmPassword: "",
});
const userInfo = reactive({});
function compare(rule: any, value: any, callback: any) {
  if (pwdForm.confirmPassword === pwdForm.password) {
    return true;
  }
  else {
    callback(new Error("确认密码不正确！"));
  }
}
const PwdFormRules = reactive<FormRules>({
  password: [
    {
      required: true,
      message: "请输入密码",
      trigger: "blur",
    },
  ],
  originalPassword: [
    {
      required: true,
      message: "请输入原始密码",
      trigger: "blur",
    },
  ],
  confirmPassword: [
    {
      required: true,
      message: "请输入确认密码",
      trigger: "blur",
    },
    {
      validator: compare,
      trigger: "change",
    },
  ],
});
async function changePwd(formEl: FormInstance | undefined) {
  if (!formEl)
    return;
  await formEl.validate(async (valid: any, fields: any) => {
    if (valid) {
      const result = await $http.post("/casServer/changePwd", pwdForm);
      if (result && result.status === "success") {
        ElMessage({
          message: "修改密码成功！",
          type: "success",
        });
        pwdDialogVisible.value = false;
      }
      else {
        ElMessage({
          message: result.message,
          type: "warning",
        });
      }
    }
    else {
      console.log("error submit!", fields);
    }
  });
}
function resetForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return;
  formEl.resetFields();
}
async function loginOut() {
  const result = await $http.get("/casServer/logout");
  if (result && result.status === "success") {
    // 退出
    window.open("/login.html", "_self");
    sessionStorage.removeItem("__cstk");
  }
  else {
    console.log(result);
  }
}
async function openSystem(item: object) {
  if (item.appEntrance) {
    // 请求跳转应用的默认模块
    const result = await $http.get(`/innerMetaServer/module/default-module?applicationId=${item.id}`);
    if (result && result.status === "success") {
      const { moduleUrl, moduleId, orgId } = result.result;
      window.open(`${moduleUrl}?applicationId=${item.id}&moduleId=${moduleId}&orgId=${orgId}`);
    }
    else {
      console.log(result);
    }
    // window.open(`${item.appEntrance}?applicationId=${item.id}`)
  }
}
/* async function getAppList() {
  const result = await $http.get("/innerMetaServer/application/user-apps");
  if (result && result.status === "success") {
    applicationList.push(...result.result);
  }
  else {
    console.log(result);
  }
} */

onMounted(async () => {
});
</script>

<style lang="less" scoped>
.page {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  background-color: #f2f3f5;
  color: rgb(93, 92, 92);
  display: flex;
  flex-direction: column;
  .header {
    width: 100%;
    height: 60px;
    background-color: #fff;
    border-bottom: 1px #e4e5e8 solid;
    display: flex;
    flex-direction: row;
    .logo {
      flex: 1;
      margin: 0px;
      font-size: 18px;
      font-weight: 600;
      line-height: 60px;
      img {
        height: 40px;
        vertical-align: middle;
        padding: 0px 20px;
      }
    }
    .fn-btn {
      line-height: 60px;
      width: 50px;
      text-align: center;
    }
    .fn-list {
      padding-right: 20px;
    }
  }
  .content {
    padding: 10px;
    display: flex;
    flex: 1;
    flex-direction: row;
    height: 100%;
    .box {
      background-color: #fff;
      border: 1px #e4e5e8 solid;
      margin: 5px;
      padding: 10px;
    }
    .left-panel {
      flex: 1;
      display: flex;
      flex-direction: column;
      .app-list {
        height: 280px;
        display: flex;
        flex-direction: column;
        .user-info {
          height: 60px;
          font-size: 18px;
          line-height: 60px;
          padding-left: 20px;
        }
        .entry-list {
          display: flex;
          padding: 5px 20px;
          height: 100%;
          flex-direction: row;
          flex-wrap: wrap;
          .item {
            width: 120px;
            height: 60px;
            text-align: center;
            line-height: 60px;
            margin: 5px;
            border: 1px #e4e5e8 solid;
            color: #fff;
            font-weight: 500;
            font-size: 14px;
            background-image: linear-gradient(-45deg, #4798f5, #a7c7f1);
            &:hover {
              background-image: linear-gradient(-45deg, #64a5ef, #c4d7f1);
              cursor: pointer;
            }
          }
        }
      }
      .work-list {
        flex: 1;
      }
    }
    .right-panel {
      width: 300px;
    }
  }
}
.fn-warper {
  font-size: 14px;
  text-align: center;
  .fn-item {
    display: flex;
    align-items: center;
    height: 32px;
    line-height: 32px;
    span {
      padding-left: 10px;
    }
    &:hover {
      background-color: #ebeef66b;
      cursor: pointer;
    }
  }
}
</style>
