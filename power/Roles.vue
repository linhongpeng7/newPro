<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" class="roles_breadcrumb">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-row class="addbtn">
      <el-col :span="24">
        <el-button type="primary" @click="addRolesDialogVisible = true">添加角色</el-button>
      </el-col>
    </el-row>
    <!-- row-key="id" 如果这是一个嵌套的数据，rowkey 必须添加的属性-->
    <el-table
      :data="rolesList"
      style="width: 100%"
      border>
      <!--展开列 expand-->
      <el-table-column
        type="expand"
        width="50">
        <!-- 填入具体的这个角色所拥有的一级权限 -->
        <template slot-scope="scope">
          <el-row
            v-for="(item1,index1) in scope.row.children"
            :key="index1"
            :class="['border_bottom',index1===0?'border_top':'']">
            <!-- 渲染一级权限 -->
            <!-- 常用的右指向符号 <i class="el-icon-caret-right"></i> -->
            <!-- 右测删除符号 closable -->
            <el-col :span="3">
              <el-tag type="success" @click="removeRightsById(scope.row,item1.id)" closable>{{item1.authName}}</el-tag>
              <i class="el-icon-caret-right"></i>
            </el-col>
            <!-- 渲染二级三级权限 -->
            <el-col :span="21">
              <el-row v-for="(item2,index2) in item1.children"
              :key="index2"
              :class="index2===0?'':'border_top'">
                <el-col :span="4">
                  <el-tag type="info" @click="removeRightsById(scope.row,item2.id)" closable>{{item2.authName}}</el-tag>
                  <i class="el-icon-caret-right"></i>
                </el-col>
                <el-col :span="20">
                  <el-tag
                    v-for="(item3,index3) in item2.children"
                    :key="index3"
                    @click="removeRightsById(scope.row,item3.id)"
                    closable>
                    {{item3.authName}}
                  </el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
        </template>
      </el-table-column>
      <el-table-column
        label="#"
        type="index"
        width="50">
      </el-table-column>
      <el-table-column
        label="角色名称"
        prop="roleName">
      </el-table-column>
      <el-table-column
        label="角色描述"
        prop="roleDesc">
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button
            size="mini"
            icon="el-icon-edit"
            @click="showEditDialog(scope.row.id)">编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
            @click="removeRoles(scope.row.id)">删除</el-button>
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-setting"
            @click="showSetRightsDialog(scope.row)">分配权限</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 添加角色弹出框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRolesDialogVisible"
      width="50%"
      @close="handleClose">
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="90px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色弹出框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="editRolesDialogVisible"
      width="50%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="90px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="editForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editRoles">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限弹出框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightsDialogVisible"
      @close="setRightsDialogClose"
      width="40%">
      <!-- 树形菜单内容 -->
     <el-tree
       :data="rightsList"
       show-checkbox
       node-key="id"
       default-expand-all
       :default-checked-keys="defaultCheckedKeys"
       :props="defaultTreeProps"
       ref="treeRef">
     </el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRightsDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="updateRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data () {
    return {
      rolesList: [],
      rightsList: [],
      setRightsDialogVisible: false,
      defaultTreeProps: {
        // 通过label设置树形节点文本展示内容
        label: 'authName',
        // 通过children属性展示子节点的信息
        children: 'children'
      },
      // 树形控件中默认选中得内容
      defaultCheckedKeys: [],
      // 角色id
      roleId: '',
      addRolesDialogVisible: false,
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      },
      editRolesDialogVisible: false,
      editForm: {
        roleId: '',
        roleName: '',
        roleDesc: ''
      },
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名称', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取角色数据
    async getRolesList () {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        this.$message.error('获取角色列表失败')
      }
      this.rolesList = res.data
    },
    // 删除权限
    async removeRightsById (role, rightId) {
      const isConfirm = await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // confirm-- 点击确定   cancel  点击取消
      if (isConfirm !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) {
        this.$message.error('删除指定权限失败')
      }
      this.$message.success('删除指定权限成功')
      // 需要对现有得角色权限进行更新
      role.children = res.data
    },
    // 展示分配权限弹出框
    async showSetRightsDialog (role) {
      // 角色id
      this.roleId = role.id
      // 点击分配权限按钮，展示对应得对话框
      this.setRightsDialogVisible = true
      // 获取所有权限得数据,tree树状显示权限,list列表显示权限
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限树失败')
      }
      this.rightsList = res.data
      // 写一个方法，将三级的权限的id添加到数组defaultCheckedKeys
      this.getRightsKey(role, this.defaultCheckedKeys)
    },
    // 获取权限的默认选中项
    getRightsKey (node, checkedArr) {
      // 获取当前角色所有得三级权限得id添加到defaultCheckedKeys里
      // 如果说当前节点不包含children属性,说明node是三级权限
      if (!node.children) {
        return checkedArr.push(node.id)
      }
      // 递归调用
      node.children.forEach(item => {
        this.getRightsKey(item, checkedArr)
      })
    },
    // 点击树状显示权限的确定,更新列表显示权限
    async updateRights () {
      // 如果在树形对话框点击确定,将用户进行选择的对权限进行更新
      // 先获取选中的以及处于半选状态得内容
      // [被选中的节点的key所组成的数组,半选中的节点所组成的数组]
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      console.log(keys)
      // 将数组转化成字符串
      const strId = keys.join(',')
      // 发送请求进行权限更新
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: strId
      })
      if (res.meta.status !== 200) {
        return this.$message.error('分配权限失败')
      }
      this.$message.success('分配权限成功')
      // 数据更新一下
      this.getRolesList()
      // 关闭弹窗
      this.setRightsDialogVisible = false
    },
    // 关闭分配权限弹出框
    setRightsDialogClose () {
      this.defaultCheckedKeys = []
    },
    // 关闭后重置添加弹框内容
    handleClose () {
      this.$refs.addFormRef.resetFields()
    },
    // 添加角色
    addRoles () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整的信息')
        const { data: res } = await this.$http.post('roles', this.addForm)
        if (res.meta.status !== 201) return this.$message.error('添加角色失败')
        this.$message.success('添加角色成功')
        // 更新角色数据
        this.getRolesList()
        // 关闭对话框
        this.addRolesDialogVisible = false
      })
    },
    // 展示编辑角色弹出框的内容
    async showEditDialog (id) {
      const { data: res } = await this.$http.get(`roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error('查询角色信息失败')
      this.editForm = res.data
      this.editRolesDialogVisible = true
    },
    // 编辑角色
    editRoles (id) {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整的信息')
        const { data: res } = await this.$http.put(`roles/${this.editForm.roleId}`, this.editForm)
        if (res.meta.status !== 200) return this.$message.error('编辑角色失败')
        console.log(res)
        this.$message.success('编辑角色成功')
        // 更新角色数据
        this.getRolesList()
        // 关闭对话框
        this.editRolesDialogVisible = false
      })
    },
    // 删除角色
    async removeRoles (id) {
      const isConfirms = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // confirm 点击确定   cancel 点击取消
      if (isConfirms !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`roles/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除角色失败')
      this.$message.success('删除角色成功')
      // 更新角色数据
      this.getRolesList()
    }
  },
  created () {
    this.getRolesList()
  }
}
</script>

<style lang="less" scoped="scoped">
  .roles_breadcrumb{
    margin: 20px 0;
  }
  .addbtn{
    margin: 15px 0;
  }
  .el-tag{
    margin: 10px;
  }
  .border_bottom{
    border-bottom: 1px solid #ccc;
  }
  .border_top{
    border-top: 1px solid #ccc;
  }
</style>
