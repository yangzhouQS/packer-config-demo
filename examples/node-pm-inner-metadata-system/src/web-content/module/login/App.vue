<template>
  <div class="login">
    <div class="content">
      <P class="chinese">
        欢迎使用物智云支撑管理平台
      </P>
      <P class="english">
        Welcome to use the Wuzhiyun Support Management Platform
      </P>
    </div>
    <div class="login-form">
      <div class="title">
        <img
          class="logo"
          src="../../assets/image/logo.png"
        > 西安易龙软件有限公司
      </div>
      <div class="lo-form">
        <el-form
          v-if="loginType"
          ref="ruleFormRef"
          hide-required-asterisk
          :model="loginForm"
          label-width="80px"
          :rules="loginRules"
          size="default"
        >
          <el-form-item
            label="用户名"
            prop="userName"
          >
            <el-input
              v-model.trim="loginForm.userName"
              placeholder="请输入用户名"
            />
          </el-form-item>
          <el-form-item
            label="密  码"
            prop="password"
          >
            <el-input
              v-model.trim="loginForm.password"
              show-password
              type="password"
              placeholder="请输入密码"
              @keyup.enter="_login(ruleFormRef)"
            />
          </el-form-item>
          <el-form-item
            label="验证码"
            prop="varifyCode"
          >
            <el-col :span="12">
              <el-input
                v-model.trim="loginForm.varifyCode"
                placeholder="验证码"
                @keyup.enter="_login(ruleFormRef)"
              />
            </el-col>
            <el-col :span="12">
              <div
                class="code"
                @click="getCode"
              >
                <img :src="code.img">
              </div>
            </el-col>
          </el-form-item>
        </el-form>
        <el-form
          v-else
          ref="ruleFormRef"
          hide-required-asterisk
          :model="loginCodeForm"
          label-width="80px"
          :rules="loginCodeRules"
          size="default"
        >
          <el-form-item
            label="手机号"
            prop="phoneNumber"
          >
            <el-input
              v-model.trim="loginCodeForm.phoneNumber"
              placeholder="请输入手机号"
            />
          </el-form-item>
          <el-form-item
            label="验证码"
            prop="varifyCode"
          >
            <el-col :span="14">
              <el-input
                v-model.trim="loginCodeForm.varifyCode"
                placeholder="验证码"
                @keyup.enter="_login(ruleFormRef)"
              />
            </el-col>
            <el-col :span="10">
              <div
                class="vcode"
              >
                <span
                  v-if="isVarify"
                  class="resend"
                >{{ second }}秒后重发</span>
                <span
                  v-else
                  class="get-code"
                  @click="getVCode"
                >获取验证码</span>
              </div>
            </el-col>
          </el-form-item>
        </el-form>
      </div>
      <div class="btn-line">
        <div class="btn pwd" @click="changeLoginType">
          {{ loginText }}
        </div>
        <div class="btn forget-pwd">
          忘记密码
        </div>
      </div>
      <div class="lo-button">
        <el-button
          type="primary"
          :loading="false"
          style="width:280px;"
          @click="_login(ruleFormRef)"
        >
          登 录
        </el-button>
      </div>
      <p class="tips">
        给第三方登录占个地方
      </p>
    </div>
    <div class="footer">
      <div class="banquan">
        版权所有(C) (2022-2030) 西龙软件有限公司 <span @click="beian">陕ICP备17000844号</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { $http } from "@cs/js-inner-web-framework";
import { ElMessage, FormInstance, FormRules } from "element-plus";
import { onMounted, reactive, ref } from "vue";
import { md5 } from "../../assets/utils";
import { catchMessage } from "../../utils/utils";

const ruleFormRef = ref<FormInstance>();
const loginForm = reactive({
  userName: "",
  password: "",
  varifyCode: "",
  captchaId: "",
  flag: "PASSWORD",
});
const loginRules = reactive<FormRules>({
  userName: [
    { required: true, message: "请输入用户名", trigger: "blur" },
  ],
  password: [
    {
      required: true,
      message: "请输入密码",
      trigger: "blur",
    },
  ],
  varifyCode: [
    {
      required: true,
      message: "请输入验证码",
      trigger: "blur",
    },
  ],
});
const code = reactive({
  img: "",
  id: "",
});

async function getCode() {
  const result = await $http.get("/inner/verifyCode");
  if (result.result && result.status === "success") {
    const _code = result.result;
    code.img = _code.img;
    loginForm.captchaId = _code.id;
  }
}

const loginCodeForm = reactive({
  phoneNumber: "",
  varifyCode: "",
  flag: "SMS",
});

const loginType = ref(true);
const loginText = ref("验证码登录");
const isVarify = ref(false);
const second: number = ref(60);
const loginCodeRules = reactive<FormRules>({
  phoneNumber: [
    { required: true, message: "请输入手机号", trigger: "blur" },
  ],
  varifyCode: [
    {
      required: true,
      message: "请输入验证码",
      trigger: "blur",
    },
  ],
});
async function getVCode() {
  if (!loginCodeForm.phoneNumber) {
    ElMessage({
      message: "请输入手机号",
      type: "warning",
    });
  }
  const result = await $http.get(`/inner/smsVerifyCode?phoneNumber=${loginCodeForm.phoneNumber}&flag=loginCode`);
  if (result && result.status === "success" && (result.result.code === "OK" || result.result.code === "success")) {
    isVarify.value = true;
    const timerInterval = setInterval(() => {
      if (second.value > 1) {
        second.value--;
      }
      else {
        second.value = 60;
        isVarify.value = false;
        clearInterval(timerInterval);
      }
    }, 1000);
  }
  else {
    ElMessage({
      message: result.message,
      type: "warning",
    });
  }
}

async function _login(formEl: FormInstance | undefined) {
  if (!formEl)
    return;
  await formEl.validate(async (valid: any, fields: any) => {
    if (valid) {
      try {
        if (loginType.value) {
          // let _loginForm = { password: md5(loginForm.userName + (loginForm.password)) }
          let _loginForm = { password: loginForm.password };
          _loginForm = Object.assign({}, loginForm, _loginForm);
          // const service = getUrlParams(location.href).service;
          const loginUrl = "/inner/login";
          const result = await $http.post(loginUrl, _loginForm);
          if (result && result.status === "success") {
            const { redirectUrl } = result.result;
            window.open(redirectUrl, "_self");
            ElMessage({
              message: "登入系统成功！",
              type: "success",
            });
          }
          else {
            ElMessage({
              message: result.message,
              type: "warning",
            });
          }
        }
        else {
          // 短信验证码方式登录
          let _loginCodeForm = { varifyCode: md5(loginCodeForm.varifyCode) };
          _loginCodeForm = Object.assign({}, loginCodeForm, _loginCodeForm);
          const result = await $http.post("/cas/login", _loginCodeForm);
          if (result && result.status === "success") {
            sessionStorage.setItem("__cstk", result.result.access_token);
            ElMessage({
              message: "登入系统成功！",
              type: "success",
            });
            // setTimeout(() => {
            //   window.open('/home.html', '_self')
            // }, 1000)
          }
          else {
            ElMessage({
              message: result.message,
              type: "warning",
            });
          }
        }
      }
      catch (error) {
        catchMessage("登陆失败")(error);
        /*
        ElMessage({
          message: `${error.message || "登陆失败"}`,
          type: "error",
        }); */
      }
    }
    else {
      console.log("error submit!", fields);
    }
  });
}
function beian() {
  window.open("https://beian.miit.gov.cn/#/Integrated/index");
}
function changeLoginType() {
  loginType.value = !loginType.value;
  loginText.value = loginType.value ? "验证码登录" : "密码登录";
}
onMounted(async () => {
  await getCode();
});
</script>

<style lang="less" scoped>
.login {
  position: absolute;
  top: 0px;
  left: 0px;
  right: 0px;
  bottom: 0px;
  background-size: cover;
  background-image: url('../../assets/image/login_bg.png');

  .content {
    position: absolute;
    top: 20%;
    left: 15%;
    width: 450px;
    height: 80px;
    background: #99a09e7a;
    font-size: 30px;
    color: white;
    font-weight: bold;
    padding: 30px;
    border: #f1ebeb85 1px solid;

    .chinese {
      font-size: 28px;
    }

    .english {
      font-size: 14px;
      line-height: 35px;
    }
  }

  .login-form {
    position: absolute;
    top: 20%;
    right: 15%;
    width: 380px;
    height: 420px;
    text-align: center;
    backdrop-filter: blur(20px);
    border-radius: 10px;
    box-shadow: 0 0 30px 10px rgba(0, 0, 0, 0.2);

    .title {
      padding: 20px 0px;
      font-size: 16px;
      color: #2a75a7;
      font-weight: 600;

      .logo {
        height: 40px;
        padding-right: 10px;
        vertical-align: middle;
      }
    }

    .lo-form {
      padding: 20px 30px 0px;

      .code {
        height: 40px;
        text-align: left;
        padding-left: 10px;

        img {
          height: 100%;

          &:hover {
            cursor: pointer;
          }
        }
      }

      .vcode {
        height: 40px;
        text-align: left;
        padding-left: 10px;

        .get-code {
          height: 100%;
          line-height: 40px;

          &:hover {
            cursor: pointer;
          }

          color: #2a75a7;
        }

        .resend {
          height: 100%;
          line-height: 40px;
          color: #9c9e9f;
        }
      }
    }

    .btn-line {
      height: 40px;
      line-height: 40px;
      display: flex;
      flex-direction: row;
      text-align: left;
      padding: 0px 50px;
      color: #7db4ec;
      font-size: 12px;

      .btn {
        flex: 1;
        text-align: center;

        &:hover {
          cursor: pointer;
        }
      }
    }

    .tips {
      font-size: 12px;
      color: #9c9e9f;
      padding-top: 15px;
    }
  }

  .footer {
    height: 20px;
    line-height: 20px;
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    text-align: center;
    color: rgba(49, 47, 47, 0.729);

    .banquan {
      text-align: center;

      span {
        color: rgba(22, 20, 20, 0.729);

        &:hover {
          cursor: pointer;
        }
      }
    }
  }
}
</style>
