<template>
  <flex-box :item-num="flexConfig.length" :item-config="flexConfig">
    <template #item-1>
      <box padding-size="base">
        <el-form
          ref="ruleFormRef"
          :model="formModel"
          label-width="100px"
          :rules="rules"
        >
          <el-row>
            <el-col :span="24">
              <el-form-item label="手机号码" prop="phoneNumber">
                <el-input
                  v-model="formModel.phoneNumber"
                  placeholder="请输入"
                  clearable
                  @blur="checkPhoneUnique"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="用户姓名" prop="name">
                <el-input
                  v-model="formModel.name"
                  placeholder="请输入"
                  clearable
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="登录账号" prop="loginId">
                <el-input
                  v-model="formModel.loginId"
                  placeholder="请输入"
                  clearable
                  @blur="checkLoginIdUnique"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="性别">
                <el-select
                  v-model="formModel.gender"
                  placeholder="请选择"
                  size="default"
                  style="width: 100%"
                >
                  <el-option
                    v-for="item in genderOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="电子邮箱" prop="eMail">
                <el-input
                  v-model="formModel.eMail"
                  placeholder="请输入"
                  clearable
                  @blur="getEMail"
                />
              </el-form-item>
            </el-col>
            <el-col :span="24">
              <el-form-item label="备注">
                <el-input
                  v-model="formModel.remark"
                  placeholder="请输入"
                  clearable
                />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row v-if="formModel.userId > 0">
            <el-col :span="24">
              <fold-divider
                v-model="passNumberVisible"
                title="密码重置"
              />
            </el-col>
            <el-col v-if="!passNumberVisible" :span="24">
              <el-form-item label="登录密码">
                <el-space>
                  <el-input
                    v-model="formModel.password"
                    :disabled="autoPassWord"
                    type="password"
                    placeholder=""
                  />
                  <el-checkbox v-model="autoPassWord">
                    自动生成密码
                  </el-checkbox>
                </el-space>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </box>
    </template>
    <template #item-2>
      <box padding-size="base" :clear-padding="['top']">
        <flex-line>
          <el-space>
            <el-checkbox v-model="isClose">
              保存后关闭
            </el-checkbox>
          </el-space>
          <template #right>
            <el-button link type="primary" @click="resetForm(ruleFormRef)">
              重置
            </el-button>
            <el-button
              type="primary"
              :loading="saveLoading"
              :disabled="saveDisabled"
              @click="saveData(ruleFormRef)"
            >
              <i class="cs-common baocun" style="font-size: 14px" />&nbsp;保存
            </el-button>
          </template>
        </flex-line>
      </box>
    </template>
  </flex-box>
</template>

<script lang="ts" setup>
import { $http } from "@cs/js-inner-web-framework";
import { ElMessage, ElMessageBox, FormInstance, FormRules } from "element-plus";
import { onMounted, reactive, ref } from "vue";

const props = defineProps<Props>();
const emits = defineEmits(["close"]);

interface Props {
  currentRow: any;
}
const ruleFormRef = ref();
const autoPassWord = ref(true);
const genderOptions = ref([
  {
    value: "male",
    label: "男",
  },
  {
    value: "female",
    label: "女",
  },
]);
const flexConfig = [
  {
    tag: "item-1",
    isFixed: false,
    size: "",
    paddingSize: "large",
    clearPadding: ["bottom"],
  },
  {
    tag: "item-2",
    isFixed: true,
    size: "",
    paddingSize: "large",
    clearPadding: ["top"],
  },
];

const isClose = ref(true); // 保存后关闭
const saveLoading = ref(false);
const saveDisabled = ref(false);
const formModel = reactive({
  id: null,
  phoneNumber: "",
  name: "",
  remark: "",
  loginId: "",
  gender: "",
  eMail: "",
  password: "",
});

// #region  密码重置
const passNumberVisible = ref(false);

/* function generateRandomPassword() {
  const length = 6; // 密码长度
  let result = "";
  const characters
    = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"; // 可用字符集
  const charactersLength = characters.length;
  // 确保至少包含1个大写字母、1个小写字母和1个数字
  result += characters[Math.floor(Math.random() * 26)]; // 大写字母
  result += characters[Math.floor(Math.random() * 26) + 26]; // 小写字母（从26开始计数）
  result += characters[Math.floor(Math.random() * 10) + 52]; // 数字（从52开始计数）
  // 填充剩余的字符
  for (let i = result.length; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  // 打乱结果字符串的顺序（可选）
  result = result
    .split("")
    .sort(() => {
      return 0.5 - Math.random();
    })
    .join("");
  return result;
} */
// #endregion

async function checkPhoneUnique() {
  const value = formModel.phoneNumber;
  console.log(1111, value);

  if (!value) {
    // ElMessage({
    //   message: "手机号不能为空",
    //   type: "error",
    // });
    return;
  }
  const reg = /^1[3-9]\d{9}$/;
  if (!reg.test(value)) {
    ElMessage({
      message: "手机号格式错误",
      type: "error",
    });
    return;
  }
  const data = await $http.post("user/check-phone-number", {
    phoneNumber: formModel.phoneNumber,
    id: formModel.id,
  });
  if (data.result.isExist) {
    ElMessage({
      message: data.result.msg,
      type: "warning",
    });
  }
  else {
    if (data.result.user) {
      ElMessageBox.confirm(
        `需要将【${data.result.user.name}】用户加到当前组织吗?`,
        "提醒",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning",
        },
      )
        .then(async () => {
          const { id, name, phoneNumber, loginId, gender, eMail, remark }
            = data.result.user;
          Object.assign(formModel, {
            operatorId: id,
            name,
            phoneNumber,
            loginId,
            gender,
            eMail,
            remark,
          });
        })
        .catch(() => {
          formModel.phoneNumber = "";
        });
    }
    else {
      // pass
    }
  }
}

async function checkLoginIdUnique() {
  const value = formModel.loginId;
  if (!value) {
    // ElMessage({
    //   message: "登录账号不能为空",
    //   type: "error",
    // });
    return;
  }
  try {
    const data = await $http.post("user/check-login-id", {
      loginId: formModel.loginId,
      id: formModel.id,
    });
    if (data.result.isExist) {
      ElMessage({
        message: data.result.msg,
        type: "warning",
      });
    }
    else {
      if (data.result.user) {
        ElMessageBox.confirm(
          `需要将【${data.result.user.name}】登录账号加到当前组织吗?`,
          "提醒",
          {
            confirmButtonText: "确定",
            cancelButtonText: "取消",
            type: "warning",
          },
        )
          .then(async () => {
            const { id, name, phoneNumber, loginId, gender, eMail, remark }
              = data.result.user;
            Object.assign(formModel, {
              operatorId: id,
              name,
              phoneNumber,
              loginId,
              gender,
              eMail,
              remark,
            });
          })
          .catch(() => {
            formModel.loginId = "";
          });
      }
      else {
        // pass
      }
    }
  }
  catch {
    ElMessage({
      message: "服务器验证失败",
      type: "error",
    });
  }
}

const rules = reactive<FormRules>({
  name: [
    {
      required: true,
      message: "用户名称",
      trigger: "blur",
    },
    { min: 2, message: "长度最少 2个 字符", trigger: "change" },
  ],
  loginId: [
    {
      required: true,
      message: "登录账号",
      trigger: "blur",
    },
  ],
  phoneNumber: [
    {
      required: true,
      message: "手机号码",
      trigger: "blur",
    },
  ],
  eMail: [
    {
      pattern: /^[\w.%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/i,
      message: "请输入有效的邮箱地址（示例：user@example.com）",
      trigger: "blur",
    },
  ],
});

async function validatePhone() {
  console.log("需填写手机号或账号");
  if (!formModel.phoneNumber && !formModel.loginId) {
    return { valid: false, message: "需填写手机号或账号" };
  }
  console.log("手机号格式不正确");
  const regex = /^1[3-9]\d{9}$/;
  if (formModel.phoneNumber && !regex.test(formModel.phoneNumber)) {
    return { valid: false, message: "手机号格式不正确" };
  }

  if (!formModel.id) {
    try {
      const result = await $http.post("user/check-user-unique", {
        phoneNumber: formModel.phoneNumber,
        loginId: formModel.loginId,
      });
      if (result.code === 203) {
        return { valid: false, message: result.message };
      }
      else {
        return { valid: true };
      }
    }
    catch (error) {
      return { valid: false, message: error.message };
    }
  }
  else {
    return { valid: true };
  }
}

async function validateForm(formEl: FormInstance) {
  try {
    // 捕获所有验证结果，确保不因单个拒绝而中断
    const [phoneResult, fieldsResult] = await Promise.all([
      validatePhone().catch(error => ({
        valid: false,
        message: error.message || "手机号或账号验证失败",
      })),
      formEl
        .validateField(["name", "eMail", "phoneNumber", "loginId"])
        .then(() => ({ valid: true })) // 验证成功
        .catch(error => ({
          valid: false,
          message: error.message || "字段验证失败",
        })),
    ]);

    // 收集所有验证结果
    const res = [phoneResult, fieldsResult];
    console.log("验证结果", res);

    // 检查是否存在任何无效项
    const allValid = res.every(item => item.valid);
    if (!allValid) {
      // 显示所有错误信息
      const messages = res.filter(i => !i.valid).map(i => i.message);
      ElMessage({
        message: messages.join("；") || "表单校验失败",
        type: "warning",
      });
      return false;
    }
    return true;
  }
  catch (error) {
    ElMessage({
      message: error.message || "表单校验失败",
      type: "warning",
    });
    return false;
  }
}

async function saveData(formEl: FormInstance | undefined) {
  const isValid = await validateForm(formEl);
  console.log(isValid);
  if (!isValid)
    return;
  // 3. 全部通过则提交
  saveLoading.value = true;
  saveDisabled.value = true;
  if (formModel.id > 0) {
    if (!passNumberVisible.value && autoPassWord.value) {
      // const randomPassword = generateRandomPassword();
      formModel.password = formModel.phoneNumber.slice(-4);
    }
    else {
      delete formModel.password;
    }
    try {
      const result = await $http.put("user/update-user", formModel);
      saveLoading.value = false;
      saveDisabled.value = false;
      if (result.code === 203) {
        ElMessage({
          message: result.message,
          type: "warning",
        });
      }
      else {
        emits("close", isClose.value);
        ElMessage({
          message: "保存成功！",
          type: "success",
        });
      }
    }
    catch (error) {
      saveLoading.value = false;
      saveDisabled.value = false;
      ElMessage({
        message: `保存失败${error.response.data.message}`,
        type: "error",
      });
    }
  }
  else {
    try {
      const randomPassword = formModel.phoneNumber.slice(-4);
      formModel.password = randomPassword;
      const result = await $http.post("user/create-user", formModel);
      setTimeout(() => {
        saveLoading.value = false;
        saveDisabled.value = false;
      }, 300);
      if (result.code === 203) {
        ElMessage({
          message: result.message,
          type: "warning",
        });
      }
      else {
        emits("close", {
          isClose: isClose.value,
          result: result.result,
        });
        ElMessage({
          message: "保存成功！",
          type: "success",
        });
      }
    }
    catch (error) {
      saveLoading.value = false;
      saveDisabled.value = false;
      ElMessage({
        message: `保存失败${error.response.data.message}`,
        type: "error",
      });
    }
  }
}

function resetForm(formEl: FormInstance | undefined) {
  if (!formEl)
    return;
  formEl.resetFields();
  emits("close");
}

onMounted(async () => {
  Object.assign(formModel, props.currentRow);
});
</script>
