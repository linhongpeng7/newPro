<template>
    <div class="login_home">
      <div class="login_box">
        <div class="login_head">
          <img src="../assets/logo.png" alt="">
        </div>
        <el-form
          ref="loginForm"
          class="login_form"
          :model="loginForm"
          :rules="loginFormRules"
          label-width="0"
         >
          <el-form-item prop="username">
            <el-input prefix-icon="iconfont icon-user" v-model="loginForm.username"></el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              type="password"
              prefix-icon="iconfont icon-3702mima"
              v-model="loginForm.password"
            >
            </el-input>
          </el-form-item>
          <el-form-item class="btns">
            <el-button type="primary" @click="login">登录</el-button>
            <el-button type="primary" @click="reset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
</template>

<script>
export default {
  name: 'Login',
  data () {
    return {
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单正则验证
      loginFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 5, message: '长度在 3 到 5 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在6-15之间', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    login () {
      // validate验证方法
      this.$refs.loginForm.validate(async valid => {
        // console.log(valid)  true or false
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        console.log(res.data)
        if (res.meta.status !== 200) {
          return this.$message.error('登录失败')
        }
        this.$message.success('登录成功')
        sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    },
    reset () {
      // resetFields重置方法
      this.$refs.loginForm.resetFields()
    }
  }
}
</script>

<style lang="less" scoped="scoped">
    .login_home {
      background: wheat;
      width: 100%;
      height: 100%;
      position: relative;
    }
    .login_box {
      width: 400px;
      height: 300px;
      background: white;
      border-radius: 20px;
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%,-50%);
        .login_head {
          width: 120px;
          height: 120px;
          background: white;
          border-radius: 50%;
          margin-left: 50%;
          transform: translate(-50%,-50%);
          border: 1px solid #ccc;
          padding: 15px;
          box-shadow: 0px 0px 10px red;
            img{
              width: 100%;
              height: 100%;
              border-radius: 50%;
              border: 1px solid #ccc;
            }
        }
        .login_form{
          width: 90%;
          margin-left: 5%;
        }
    }
    .btns{
      display: flex;
      justify-content: flex-end;
      padding: 0 20px;
    }
</style>
