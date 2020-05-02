<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" class="my_breadcrumb">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input
            placeholder="请输入搜索内容"
            clearable
            v-model="queryInfo.query"
            @clear="getGoodsList">
            <el-button slot="append" icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click='addGoods'>添加商品</el-button>
        </el-col>
      </el-row>
      <!-- 表格 -->
      <el-table
        :data="goodsList"
        style="width: 100% ; margin:20px 0"
        border
        stripe>
        <el-table-column
          type="index"
          label="#"
          width="60"></el-table-column>
        <el-table-column
          label="商品名称"
          prop="goods_name"
          width="700"></el-table-column>
        <el-table-column
          label="商品价格(元)"
          prop="goods_price"></el-table-column>
        <el-table-column
          label="商品重量"
          prop="goods_weight"></el-table-column>
        <el-table-column
          label="创建时间"
          prop="add_time"
          width="220">
          <template slot-scope="scope">{{scope.row.add_time | dateFormat}}</template>
        </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              size="mini"
              icon="el-icon-edit"
              @click="showEditDialog(scope.row.goods_id)"></el-button>
            <el-button
              size="mini"
              icon="el-icon-delete"
              type="danger"
              @click="deleteGoods(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页器 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5, 10, 15, 20]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total">
      </el-pagination>
    </el-card>
    <!-- 编辑商品弹出框 -->
    <el-dialog
      title="提示"
      :visible.sync="editDialogVisible"
      width="70%">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="100px">
        <el-form-item label="商品名称" prop="goods_name">
          <el-input v-model="editForm.goods_name"></el-input>
        </el-form-item>
        <el-form-item label="商品价格" prop="goods_price">
          <el-input v-model="editForm.goods_price"></el-input>
        </el-form-item>
        <el-form-item label="商品重量" prop="goods_weight">
          <el-input v-model="editForm.goods_weight"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editGoods">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Goods',
  data () {
    return {
      goodsList: [],
      // 商品列表总数量
      total: 0,
      // 查询参数
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      editDialogVisible: false,
      editForm: {
        goods_id: '',
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: ''
      },
      editFormRules: {
        goods_name: [
          {
            required: true,
            message: '请输入商品名称',
            trigger: 'blur'
          }
        ],
        goods_price: [
          {
            required: true,
            message: '请输入商品价格',
            trigger: 'blur'
          }
        ],
        goods_weight: [
          {
            required: true,
            message: '请输入商品价格',
            trigger: 'blur'
          }
        ]
      }
    }
  },
  methods: {
    async getGoodsList () {
      const { data: res } = await this.$http.get('goods', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('获取商品列表失败')
      this.goodsList = res.data.goods
      this.total = res.data.total
    },
    handleSizeChange (newsize) {
      this.queryInfo.pagesize = newsize
      this.getGoodsList()
    },
    handleCurrentChange (newpage) {
      this.queryInfo.pagenum = newpage
      this.getGoodsList()
    },
    // 删除商品
    async deleteGoods (id) {
      const isConfirm = await this.$confirm('此操作将永久删除该文件, 是否继续?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (isConfirm !== 'confirm') {
        return this.$message.info('已经取消删除')
      }
      const { data: res } = await this.$http.delete(`goods/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('删除商品失败')
      }
      this.$message.success('删除商品成功')
      this.getGoodsList()
    },
    // 添加商品
    addGoods () {
      this.$router.push('/goods/addgoods')
    },
    // 展示编辑弹出框
    async showEditDialog (id) {
      const { data: res } = await this.$http.get(`goods/${id}`)
      if (res.meta.status !== 200) {
        return this.$message.error('查询商品信息失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 编辑商品
    editGoods () {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写完整信息')
        const { data: res } = await this.$http.put(`goods/${this.editForm.goods_id}`, this.editForm)
        if (res.meta.status !== 200) {
          return this.$message.error('编辑用户信息失败')
        }
        this.$message.success('编辑用户信息成功')
        this.editDialogVisible = false
        this.getGoodsList()
      })
    }
  },
  created () {
    this.getGoodsList()
  }
}
</script>

<style lang="less" scoped="scoped">
</style>
