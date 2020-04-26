<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb class="user_breadcrumb">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
     <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入搜索内容" clearable
          v-model="queryInfo.query" @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
           <el-button type="primary" @click="addDialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
    </el-card>
    <!-- 用户列表区域 -->
    <el-table
      :data="userList"
      style="width: 100%"
      border
      stripe>
      <el-table-column prop="username" label="姓名"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="mobile" label="电话"></el-table-column>
      <el-table-column prop="role_name" label="角色"></el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.mg_state" @change="changeUserState(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="350px">
        <template slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit" @click="showEditDialog(scope.row.id)">编辑</el-button>
          <el-button size="mini" type="danger" icon="el-icon-delete" @click="removeUser(scope.row.id)">删除</el-button>
          <el-button size="mini" type="primary" icon="el-icon-setting" @click="setRoles(scope.row)">分配角色</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页器区域 -->
    <!-- size-changepageSize改变时会触发===更改每页个数
    current-changecurrentPage改变时会触发===更改页数
    current-page当前页数,支持.sync 修饰符
    page-size每页显示条目个数,支持.sync 修饰符
    total总条目数 -->
    <div class="user_pagination">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </div>
    <!-- 添加用户弹出框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="resetAddDialog"
      >
      <el-form :model="addForm" ref="addFormRef" label-width="90px" :rules="formRules">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑用户弹出框 -->
    <el-dialog
      title="编辑用户信息"
      :visible.sync="editDialogVisible"
      width="50%"
      >
      <el-form :model="editForm" :rules="formRules" ref="editFormRef" label-width="90px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" :disabled="true"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配角色弹出框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRolesDialogVisbile"
      width="50%"
      @close="setRolesDialogClose">
      <el-form :model="editForm" :rules="formRules" ref="editFormRef" label-width="90px">
        <p>当前用户:{{userInfo.username}}</p>
        <p>当前角色:{{userInfo.role_name}}</p>
        <p>分配新角色:
          <!-- v-model绑定的是设置用户选中角色之后的id -->
          <el-select v-model="selectRolesId" placeholder="请选择">
            <el-option
              v-for="item in rolesList"
              :key="item.id"
              :label="item.roleName"
              :value="item.id">
            </el-option>
          </el-select>
        </p>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRolesDialogVisbile = false">取 消</el-button>
        <el-button type="primary" @click="saveRolesInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'User',
  data () {
    // 验证邮箱的自定义规则
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^\w+@\w+(\.\w+)+$/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入正确邮箱'))
    }
    // 验证手机的正则
    var checkMobile = (rule, value, cb) => {
      const regMobile = /^1[3-9]\d{9}$/
      if (regMobile.test(value)) {
        return cb()
      }
      cb(new Error('请输入正确手机号'))
    }
    return {
      // 分配角色弹出框
      setRolesDialogVisbile: false,
      // 角色列表
      rolesList: [],
      // 正在操作得用户得信息
      userInfo: {},
      // 选择角色id
      selectRolesId: '',
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 2
      },
      userList: [],
      total: 0,
      addDialogVisible: false,
      editDialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      editForm: {
        id: '',
        username: '',
        email: '',
        mobile: ''
      },
      // 表单验证规则
      formRules: {
        username: [
          {
            require: true,
            message: '请输入用户名',
            trigger: 'blur'
          },
          {
            min: 3,
            max: 10,
            message: '用户名3-10个字符之间',
            trigger: 'blur'
          }
        ],
        password: [
          {
            require: true,
            message: '请输入密码',
            trigger: 'blur'
          },
          {
            min: 6,
            max: 15,
            message: '用户名6-15个字符之间',
            trigger: 'blur'
          }
        ],
        email: [
          {
            require: true,
            message: '请输入邮箱',
            trigger: 'blur'
          },
          {
            validator: checkEmail,
            message: '邮箱格式不正确,请重新输入',
            trigger: 'blur'
          }
        ],
        mobile: [
          {
            require: true,
            message: '请输入手机号',
            trigger: 'blur'
          },
          {
            validator: checkMobile,
            message: '手机号格式不正确,请重新输入',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    // 获取用户数据
    async getUserList () {
      const { data: res } = await this.$http.get('users', {
        params: this.queryInfo
      })
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取用户类表失败')
      }
      this.userList = res.data.users
      this.total = res.data.total
    },
    // 每页个数发生改变的时候触发
    handleSizeChange (newsize) {
      this.queryInfo.pagesize = newsize
      this.getUserList()
    },
    // 页码发生改变的时候触发
    handleCurrentChange (current) {
      this.queryInfo.pagenum = current
      this.getUserList()
    },
    // 改变用户状态
    async changeUserState (row) {
      const { data: res } = await this.$http.put(`users/${row.id}/state/${row.mg_state}`)
      if (res.meta.status !== 200) {
        return this.$message.error('修改状态失败')
      }
      this.$message.success('修改状态成功')
    },
    // 添加用户
    addUser () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整信息')
        const { data: res } = await this.$http.post('users', this.addForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加用户失败')
        }
        this.$message.success('添加用户成功')
        this.addDialogVisible = false
        this.getUserList()
      })
    },
    // 重置添加弹出框的内容
    resetAddDialog () {
      this.$refs.addFormRef.resetFields()
    },
    // 展示编辑弹出框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get(`users/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 编辑用户
    async editUser () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整信息')
      })
      const { data: res } = await this.$http.put(`users/${this.editForm.id}`, this.editForm)
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('编辑用户信息失败')
      }
      this.$message.success('编辑用户信息成功')
      this.editDialogVisible = false
      this.getUserList()
    },
    // 删除用户
    async removeUser (id) {
      const isConfirm = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // confirm-- 点击确定   cancel  点击取消
      if (isConfirm !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`users/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      this.$message.success('删除用户成功')
      this.getUserList()
    },
    // 分配角色
    async setRoles (userInfo) {
      // 获取用户信息,弹出来的时候自动展示
      this.userInfo = userInfo
      // 获取所有角色信息,为了下拉框进行选择
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
      // 打开分配角色弹出框
      this.setRolesDialogVisbile = true
    },
    // 关闭分配角色对话框
    setRolesDialogClose () {
      // 关闭对话框时，重置下拉框的内容
      this.selectRolesId = ''
      this.userInfo = {}
    },
    // 保存角色信息
    async saveRolesInfo () {
      if (!this.selectRolesId) {
        return this.$message.error('请选择需要分配的角色')
      }
      const { data: res } = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectRolesId
      })
      if (res.meta.status !== 200) return this.$message.error('分配角色失败')
      this.$message.success('分配角色成功')
      // 更新用户数据
      this.getUserList()
      // 关闭分配角色弹出框
      this.setRolesDialogVisbile = false
    }
  },
  created () {
    this.getUserList()
  }
}
</script>

<style lang="less" scoped="scoped">
  .user_pagination,.user_breadcrumb{
    margin: 20px 0;
  }
</style>
