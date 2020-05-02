<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" class="my_breadcrumb">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 警告提示 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        :closable="false"
        show-icon
        type="warning">
      </el-alert>
      <el-row>
        <el-col :span="24">
          <b>选择商品分类</b>
          <el-cascader
            v-model="selectCatKeys"
            :options="catList"
            :props="catProps"
            clearable
            @change="handleChange"></el-cascader>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24">
          <el-tabs v-model="activeName" @tab-click="handleClick">
            <el-tab-pane label="动态参数" name="many">
              <el-button
                size="mini"
                type="primary"
                :disabled="isBtnDisabled"
                @click="addMsgProp"
              >添加参数</el-button>
              <!-- 展示动态参数表格 -->
              <el-table
                :data="manyData"
                style="width: 100%"
                border
                stripe>
                <!-- 展开行 -->
                <el-table-column type="expand" width="60">
                  <template slot-scope="scope">
                    <el-tag
                      closable
                      @close="handleClose(index,scope.row)"
                      v-for="(item,index) in scope.row.attr_vals"
                      :key="index"
                    >
                      {{item}}
                    </el-tag>
                    <!-- 输入框 -->
                    <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)"
                    >
                    </el-input>
                    <el-button
                      v-else
                      size="small"
                      @click="showInput(scope.row)"
                    >
                      + New Tag
                    </el-button>
                  </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" label="#" width="60"></el-table-column>
                <el-table-column prop="attr_name" label="参数名称"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button
                      size="mini"
                      icon="el-icon-edit"
                      @click="showEditDialog(scope.row)">编辑</el-button>
                    <el-button
                      size="mini"
                      type="danger"
                      icon="el-icon-delete"
                      @click="deleteParams(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            <el-tab-pane label="静态属性" name="only">
              <el-button
                size="mini"
                type="primary"
                :disabled="isBtnDisabled"
                @click="addMsgProp"
              >添加属性</el-button>
              <!-- 展示动态参数表格 -->
              <el-table
                :data="onlyData"
                style="width: 100%"
                border
                stripe>
                <!-- 展开行 -->
                <el-table-column type="expand" width="60">
                  <template slot-scope="scope">
                    <el-tag
                      closable
                      @close="handleClose(index,scope.row)"
                      v-for="(item,index) in scope.row.attr_vals"
                      :key="index"
                    >
                      {{item}}
                    </el-tag>
                    <!-- 输入框 -->
                    <el-input
                      class="input-new-tag"
                      v-if="scope.row.inputVisible"
                      v-model="scope.row.inputValue"
                      ref="saveTagInput"
                      size="small"
                      @keyup.enter.native="handleInputConfirm(scope.row)"
                      @blur="handleInputConfirm(scope.row)"
                    >
                    </el-input>
                    <el-button
                      v-else
                      size="small"
                      @click="showInput(scope.row)"
                    >
                      + New Tag
                    </el-button>
                  </template>
                </el-table-column>
                <!-- 索引列 -->
                <el-table-column type="index" label="#" width="60"></el-table-column>
                <el-table-column prop="attr_name" label="参数名称"></el-table-column>
                <el-table-column label="操作">
                  <template slot-scope="scope">
                    <el-button
                      size="mini"
                      icon="el-icon-edit"
                      @click="showEditDialog(scope.row)">编辑</el-button>
                    <el-button
                      size="mini"
                      type="danger"
                      icon="el-icon-delete"
                      @click="deleteParams(scope.row)">删除</el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </el-card>
    <!-- 添加属性或参数的对话框 -->
    <el-dialog
      :title="'添加'+titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 添加一个表单 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑参数弹出框 -->
    <el-dialog
      :title="'修改'+titleText"
      :visible.sync="editDialogVisible"
      width="50%"
    >
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Params',
  data () {
    return {
      // 分类列表
      catList: [],
      // 用户在级联下拉菜单中选中分类id
      selectCatKeys: [],
      // 配置级联菜单中的数据是怎么展示的
      catProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 通过 only 或 many 来获取分类静态参数还是动态参数
      activeName: 'many',
      // 用来保存动态参数数据
      manyData: [],
      // 用来保存静态参数数据
      onlyData: [],
      // 添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      // 添加参数的表单验证规则
      addFormRules: {
        attr_name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }]
      },
      addDialogVisible: false,
      // tag标签的显示隐藏
      // inputVisible: false,
      // inputValue: '',
      editDialogVisible: false,
      // 编辑参数的表单数据对象
      editForm: {
        attr_id: '',
        attr_name: '',
        attr_sal: ''
      },
      // 编辑参数的表单验证规则
      editFormRules: {
        attr_name: [{ required: true, message: '请输入活动名称', trigger: 'blur' }]
      }
    }
  },
  methods: {
    // 获取分类列表
    async getCatList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类数据失败')
      }
      // 将数据列表赋值给catelist
      this.catList = res.data
    },
    // 级联选择器的值发生改变时触发
    handleChange () {
      // 如果selectCatKeys的长度不是3(3级),清空其值,不让其显示
      if (this.selectCatKeys.length !== 3) {
        this.selectCatKeys = []
        this.manyData = []
        this.onlyData = []
        return
      }
      // 否则正常请求改变的数据
      this.updateList()
    },
    // 更新数据
    async updateList () {
      // 当用户在级联菜单中进行选择内容的时候触发
      console.log(this.selectCatKeys)
      // 发送请求，根据用户选择的三级分 类和面板获取参数数据
      const { data: res } = await this.$http.get(`categories/${this.catId}/attributes`, {
        params: {
          sel: this.activeName
        }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数列表数据失败')
      }
      // 切割字符串成数组,使tag标签可以渲染
      res.data.forEach(item => {
        // 使用三目运算解决 ''.split(' ')=[''] 的问题
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 添加两个属性用于控制tag标签
        item.inputVisible = false
        item.inputValue = ''
      })
      if (this.activeName === 'many') {
        this.manyData = res.data
      } else if (this.activeName === 'only') {
        this.onlyData = res.data
      }
    },
    // 点击标签页触发
    handleClick () {
      this.updateList()
    },
    // 弹出添加对话框
    addMsgProp () {
      this.addDialogVisible = true
    },
    // 添加参数
    addParams () {
      // 首先点击确定进行表单验证
      this.$refs.addFormRef.validate(async valid => {
        // 如果验证不通过
        if (!valid) return
        const { data: res } = await this.$http.post(`categories/${this.catId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
          // attr_vals: 'a,v,c'
        })
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加' + this.titleText + '数据失败')
        }
        this.$message.success('添加' + this.titleText + '数据成功')
        this.addDialogVisible = false
        this.updateList()
      })
    },
    // 弹窗结束之后进行重置表单
    addDialogClosed () {
      this.$refs.addFormRef.resetFields()
    },
    handleInputConfirm (row) {
      // 判断用户在文本输入框输入得内容是否合法(排除没有值的情况)
      if (row.inputValue.trim().length === 0) {
        row.inputVisible = false
        row.inputValue = ''
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputVisible = false
      row.inputValue = ''
      // 调用保存修改后的操作
      this.saveAttrVals(row)
    },
    // 展示input框添加tag标签
    showInput (row) {
      row.inputVisible = true
      // input自动获取焦点
      // $nextTick主要作用:当标签或页面重新渲染的时候,一定会执行其内部的操作
      // 点击按钮得时候已经把布尔值变成true,但是页面中得input还没渲染出来,直接获取这个元素,肯定没有,
      // 那么等待一个时机,当页面中元素重新渲染之后,肯定会执行$nextTick,
      // 咱们就在nextTick东西得回调里面去执行咱们得dom操作
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // 删除标签
    handleClose (index, row) {
      // 删除对应索引得参数可选项
      row.attr_vals.splice(index, 1)
      // 调用函数完成保存可选项得操作
      this.saveAttrVals(row)
    },
    // 保存修改后参数状态
    async saveAttrVals (row) {
      const { data: res } = await this.$http.put(`categories/${this.catId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        return this.$message.error('修改参数失败')
      }
      this.$message.success('修改参数成功')
    },
    // 展示编辑弹出框
    async showEditDialog (row) {
      const { data: res } = await this.$http.get(`categories/${this.catId}/attributes/${row.attr_id}`, {
        attr_sel: row.attr_sel
        // attr_vals: 'a,v,c'
      })
      if (res.meta.status !== 200) return this.$message.error('查询参数失败')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 编辑参数
    editParams () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整信息')
        const { data: res } = await this.$http.put(`categories/${this.catId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.editForm.attr_sel
        })
        if (res.meta.status !== 200) {
          return this.$message.error('编辑' + this.titleText + '数据失败')
        }
        this.$message.success('编辑' + this.titleText + '数据成功')
        this.editDialogVisible = false
        this.updateList()
      })
    },
    // 删除参数
    async deleteParams (row) {
      const isConfirm = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (isConfirm !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`categories/${this.catId}/attributes/${row.attr_id}`)
      if (res.meta.status !== 200) return this.$message.error('删除用户失败')
      this.$message.success('删除用户成功')
      this.updateList()
    }
  },
  created () {
    this.getCatList()
  },
  computed: {
    // 用计算属性来控制catId
    catId () {
      if (this.selectCatKeys.length === 3) {
        return this.selectCatKeys[this.selectCatKeys.length - 1]
      }
      return null
    },
    // 用计算属性来控制按钮是否禁用
    isBtnDisabled () {
      return this.selectCatKeys.length !== 3
    },
    // 添加弹出框标题内容
    titleText () {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>
<style lang="less" scoped="scoped">
  .el-cascader{
    margin: 20px;
  }
  .el-tabs{
    margin-bottom: 20px;
  }
  .el-tag{
    margin: 5px 5px;
  }
  .input-new-tag{
    width: 120px;
  }
</style>
