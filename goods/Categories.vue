<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" class="my_breadcrumb">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row class="addbtn">
        <el-col :span="24">
          <el-button type="primary" @click="showAddCategoriesDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- :data 设置数据源
      :columns 设置表格中列的配置信息
      :selection-type(是否需要使用复选框)
      expand-type(是否展开数据)
      show-index(是否需要索引)
      border(是否需要边框)
      stripe(间隔斑马纹)
      show-row-hover(鼠标悬停时，是否高亮当前行)
      index-text(索引的名称)-->
      <tree-table
        :data="categoriesList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        :show-row-hover="false"
        show-index
        index-text="#"
        border
        stripe
      >
        <!-- 是否有效 -->
        <template slot="isOK" slot-scope="scope">
          <i class="el-icon-success"
            v-if="scope.row.cat_delated!==false"
            style="color:green"></i>
          <i class="el-icon-loading"
            v-else
            style="color:red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level===0" type="success">一级</el-tag>
          <el-tag size="mini" v-if="scope.row.cat_level===1" type="info">二级</el-tag>
          <el-tag size="mini" v-if="scope.row.cat_level===2">三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="options" slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            icon="el-icon-edit"
            @click="showEditDialog(scope.row.cat_id)">编辑</el-button>
          <el-button
            size="mini"
            type="danger"
            icon="el-icon-delete"
             @click="removeCategories(scope.row.cat_id)">删除</el-button>
        </template>
      </tree-table>
    </el-card>
    <!-- 分页器 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-size="queryInfo.pagesize"
      :page-sizes="[3,5,8,15]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      class="my_pagination">
    </el-pagination>
    <!-- 添加分类弹出框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCategoriesDialogVisible"
      width="50%"
      @close="addCategoriesDialogClose"
    >
      <!-- 添加分类的菜单 -->
      <el-form
        :model="addCategoriesForm"
        :rules="addCategoriesFormRules"
        ref="addCategoriesFormRef"
        label-width="90px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCategoriesForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类" prop="cat_id">
          <!--el-cascader 级联选择器
           v-model选中项绑定值
           options可选项数据源,键名可通过 Props 属性配置
           props配置数据显示的规则
           clearable 是不是有一个X来进行清空文本
           change-on-select 是不是可以选中任意一级的菜单
          -->
          <el-cascader
            v-model="selectedKeys"
            :options="parentCategoriesList"
            :props="categoriesProps"
            @change="handleChange"
            expand-trigger="hover"
            clearable>
          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCategoriesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCategories">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑分类弹出框 -->
    <el-dialog
      title="编辑分类"
      :visible.sync="editCategoriesDialogVisible"
      width="50%"
    >
      <el-form
        :rules="editCategoriesFormRules"
        label-width="80px"
        :model="editCategoriesForm"
        ref="editCategoriesFormRef">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCategoriesForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCategoriesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCategories">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Categories',
  data () {
    return {
      // 商品分类的数据列表
      categoriesList: [],
      // 商品数据总量
      total: 0,
      // 查询分类数据的条件
      queryInfo: {
        // 三层分类列表
        type: 3,
        // 初始页码
        pagenum: 1,
        // 每页个数
        pagesize: 5
      },
      // 设置表格中列的配置信息
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isOK'
        },
        {
          label: '排序',
          type: 'template',
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          template: 'options'
        }
      ],
      addCategoriesDialogVisible: false,
      parentCategoriesList: [],
      // 添加分类的表单数据对象
      addCategoriesForm: {
        // 添加分类的父级的id, 0表示一级分类
        cat_pid: 0,
        // 分类名称
        cat_name: '',
        // 添加分类的等级, 0表示一级分类
        cat_level: 0
      },
      // 添加分类的验证规则
      addCategoriesFormRules: {
        cat_name: [
          { required: true, message: '请添加分类名称', trigger: 'blur' }
        ]
      },
      // 配置级联菜单中数据是怎么展示
      categoriesProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 绑定用户选择的分类的值,一级[1]二级[1,2]三级[1,2,3]
      selectedKeys: [],
      editCategoriesDialogVisible: false,
      // 编辑分类的表单数据对象
      editCategoriesForm: {
        // 添加分类的父级的id, 0表示一级分类
        cat_id: 0,
        // 分类名称
        cat_name: ''
      },
      // 编辑分类的验证规则
      editCategoriesFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    // 获取商品分类数据
    async getCategoriesList () {
      const { data: res } = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品列表数据失败')
      }
      this.categoriesList = res.data.result
      this.total = res.data.total
    },
    // pagesize(每页个数) 改变时会触发
    handleSizeChange (newsize) {
      this.queryInfo.pagesize = newsize
      this.getCategoriesList()
    },
    // pagenum(当前页码) 改变时会触发
    handleCurrentChange (newpage) {
      this.queryInfo.pagenum = newpage
      this.getCategoriesList()
    },
    showAddCategoriesDialog () {
      // 获取父级分类的数据列表
      this.getParentCategoriesList()
      // 显示弹出框
      this.addCategoriesDialogVisible = true
    },
    async getParentCategoriesList () {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败')
      }
      console.log(res)
      this.parentCategoriesList = res.data
    },
    // 添加分类
    addCategories () {
      this.$refs.addCategoriesFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整信息')
        // 发送请求完成添加分类
        const { data: res } = await this.$http.post('categories', this.addCategoriesForm)
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败')
        }
        this.$message.success('添加分类成功')
        this.getCategoriesList()
        this.addCategoriesDialogVisible = false
      })
    },
    // 重置弹框内容
    addCategoriesDialogClose () {
      this.$refs.addCategoriesFormRef.resetFields()
      this.selectedKeys = []
      this.addCategoriesForm.cat_pid = 0
      this.addCategoriesForm.cat_level = 0
    },
    // 改变父级分类的内容
    handleChange () {
      // 级联菜单选项发生改变的时候,如果用户选择了父级分类
      console.log(this.selectedKeys)
      if (this.selectedKeys.length > 0) {
        // 把数组里面的最后一项的id设置为父级分类
        this.addCategoriesForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // level也要跟着变化
        this.addCategoriesForm.cat_level = this.selectedKeys.length
      } else {
        this.addCategoriesForm.cat_pid = 0
        this.addCategoriesForm.cat_level = 0
      }
    },
    // 展示编辑弹出框的内容
    async showEditDialog (id) {
      const { data: res } = await this.$http.get(`categories/${id}`)
      if (res.meta.status !== 200) return this.$message.error('查询分类信息失败')
      this.editCategoriesForm = res.data
      this.editCategoriesDialogVisible = true
    },
    // 编辑分类
    editCategories () {
      this.$refs.editCategoriesFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整的信息')
        const { data: res } = await this.$http.put(`categories/${this.editCategoriesForm.cat_id}`, this.editCategoriesForm)
        if (res.meta.status !== 200) return this.$message.error('编辑分类失败')
        this.$message.success('编辑分类成功')
        this.getCategoriesList()
        this.editCategoriesDialogVisible = false
      })
    },
    // 删除分类
    async removeCategories (id) {
      const isConfirm = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      // confirm 点击确定   cancel 点击取消
      if (isConfirm !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`categories/${id}`)
      if (res.meta.status !== 200) return this.$message.error('删除分类失败')
      this.$message.success('删除分类成功')
      this.getCategoriesList()
    }
  },
  created () {
    this.getCategoriesList()
  }
}
</script>

<style lang="less" scoped="scoped">
</style>
