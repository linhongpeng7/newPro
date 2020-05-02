<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" class="my_breadcrumb">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-alert
          title="添加商品信息"
          type="info"
          show-icon
          :closable="false"
          center>
        </el-alert>
        <!-- 步骤条 -->
        <el-steps
          class="goodsSteps"
          :active="activeIndex - 0"
          finish-status="success"
          width="100%">
          <el-step title="基本信息"></el-step>
          <el-step title="商品参数"></el-step>
          <el-step title="商品属性"></el-step>
          <el-step title="商品图片"></el-step>
          <el-step title="商品内容"></el-step>
          <el-step title="完成"></el-step>
        </el-steps>
        <!-- tab栏区域 -->
        <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" width="100%">
          <el-tabs
            v-model="activeIndex"
            :tab-position="tabPosition"
            :before-leave="beforeTabLeave"
            @tab-click="tabClicked">
            <el-tab-pane label="基本信息" name="0">
             <el-form-item label="商品名称" prop="goods_name">
               <el-input v-model="addForm.goods_name"></el-input>
             </el-form-item>
              <el-form-item label="商品价格" prop="goods_price">
                <el-input v-model="addForm.goods_price" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品重量" prop="goods_weight">
                <el-input v-model="addForm.goods_weight" type="number"></el-input>
              </el-form-item>
              <el-form-item label="商品数量" prop="goods_number">
                <el-input v-model="addForm.goods_number" type="number"></el-input>
              </el-form-item>
              <el-form-item
                label="商品分类"
                prop="goods_cat"
              >
                <el-cascader
                  v-model="addForm.goods_cat"
                  :options="catList"
                  :props="catProps"
                  @change="handleChange"></el-cascader>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品参数" name="1">
              <el-form-item :label="item.attr_name" :key="item.attr_id" v-for="item in manyTableData">
                <el-checkbox-group v-model="item.attr_vals">
                  <el-checkbox border :label="val" v-for="(val,i) in item.attr_vals" :key="i"></el-checkbox>
                </el-checkbox-group>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品属性" name="2">
              <!-- 循环遍历的形式生成静态属性 -->
              <el-form-item v-for="item in onlyTableData" :label="item.attr_name" :key="item.attr_id">
                <el-input v-model="item.attr_vals"></el-input>
              </el-form-item>
            </el-tab-pane>
            <el-tab-pane label="商品图片" name="3">
              <!-- action 表示图片上传的接口
              :on-preview 当点击图片时候会触发的事件，进行预览效果
              :on-remove 图片右上角X的时候
              list-type:设置不同的值决定组件的渲染方式
              :headers 设置图片的 请求头-->
              <el-upload
                :action="upLoadUrl"
                :on-preview="handlePreview"
                :on-remove="handleRemove"
                :on-success="handleSuccess"
                :headers='headersObj'
                list-type="picture">
                <el-button size="small" type="primary">点击上传</el-button>
              </el-upload>
            </el-tab-pane>
            <el-tab-pane label="商品内容" name="4">
               <el-form>
                 <el-form-item label="商品内容">
                    <quill-editor class="quill-editor" v-model="addForm.goods_introduce"/>
                    <el-button type="primary" @click="addGoods">添加商品</el-button>
                  </el-form-item>
               </el-form>
            </el-tab-pane>
          </el-tabs>
        </el-form>
    </el-card>
    <!-- 预览图片对话框 -->
    <el-dialog
      title="预览图片"
      :visible.sync="previewVisible"
      width="50%">
      <img :src="previewPath" alt="" class="previewImg"/>
    </el-dialog>
  </div>
</template>

<script>
// 操作js的包
import _ from 'lodash'
export default {
  name: 'AddGoods',
  data () {
    return {
      // 保存步骤条激活项得索引
      activeIndex: 0,
      // tab选项卡得位置
      tabPosition: 'left',
      // 添加商品的表单数据对象
      addForm: {
        goods_name: '',
        goods_price: '0',
        goods_number: '0',
        goods_weight: '0',
        // 商品分类的数组
        goods_cat: [],
        // 存放图片路径的数组
        pics: [],
        // 商品内容介绍
        goods_introduce: '',
        // 商品的参数（数组），包含 `动态参数` 和 `静态属性`
        attrs: []
      },
      // 上传路径(提交地址)
      upLoadUrl: 'http://127.0.0.1:8888/api/private/v1/upload',
      // 图片上传时的请求头对象
      headersObj: {
        Authorization: sessionStorage.getItem('token')
      },
      // 预览图片路径
      previewPath: '',
      previewVisible: false,
      // 验证规则
      addFormRules: {
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
            message: '请输入商品重量',
            trigger: 'blur'
          }
        ],
        goods_number: [
          {
            required: true,
            message: '请输入商品数量',
            trigger: 'blur'
          }
        ],
        goods_cat: [
          {
            required: true,
            message: '请输入商品分类',
            trigger: 'blur'
          }
        ]
      },
      // 设定一个变量保存分类的数据
      catList: [],
      // 配置级联菜单中数据是怎么展示的
      catProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      // 动态参数的列表
      manyTableData: [],
      // 静态属性的列表
      onlyTableData: []
    }
  },
  methods: {
    async getCatList () {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取分类商品失败')
      }
      this.catList = res.data
    },
    handleChange () {
      if (this.addForm.goods_cat.length !== 3) {
        return false
      }
    },
    // 切换标签之前执行的钩子,如果返回false,则阻止切换
    beforeTabLeave (activeName, oldActiveName) {
      // 在tab栏切换之前进行触发，两个形参切换前后的tab栏的name
      console.log(activeName)
      console.log(oldActiveName)
      // 第一个标签向第二个标签切换的时候
      if (oldActiveName === '0') {
        if (this.addForm.goods_cat.length !== 3) {
          this.$message.error('请选择商品的分类')
          return false
        } else if (this.addForm.goods_name.trim() === '') {
          this.$message.error('请输入商品名称')
          return false
        } else if (this.addForm.goods_price.trim() === '0') {
          this.$message.error('请输入商品价格')
          return false
        } else if (this.addForm.goods_weight.trim() === '0') {
          this.$message.error('请输入商品重量')
          return false
        } else if (this.addForm.goods_number.trim() === '0') {
          this.$message.error('请输入商品数量')
          return false
        }
      }
    },
    // 切换标签页触发的事件
    async tabClicked () {
      console.log('点击走吗')
      // 当用户点击的是那个 tab栏
      if (this.activeIndex === '1') {
        console.log('肯定走不了')
        // 发送请求来请求动态参数
        const { data: res } = await this.$http.get(`categories/${this.catId}/attributes`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取动态列表失败')
        }
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        })
        this.manyTableData = res.data
      } else if (this.activeIndex === '2') {
        // 获取静态属性列表
        const { data: res } = await this.$http.get(`categories/${this.catId}/attributes`, {
          params: { sel: 'only' }
        })
        if (res.meta.status !== 200) {
          return this.$message.error('获取静态列表失败')
        }
        this.onlyTableData = res.data
      }
    },
    // 点击图片执行的函数,file自带参数，代表用户预览的那个文件
    handlePreview (file) {
      // 当用户点击的时候，预览的时候进行处理
      this.previewPath = file.response.data.url
      // 把预览对话框打开
      this.previewVisible = true
    },
    // 删除图片,file自带参数，代表点击的文件
    handleRemove (file) {
      console.log(file)
      // 获取点击删除这张图片的临时路径
      const filePath = file.response.data.tmp_path
      // 通过findIndex去再pics找下标
      const index = this.addForm.pics.findIndex(item => {
        return item.pic === filePath
      })
      // 移除这个索引
      this.addForm.pics.splice(index, 1)
    },
    // 上传图片成功后的操作
    handleSuccess (response) {
      // 当上传成功之后执行
      // response 表示上传成功之后服务器返回的结果
      // 将服务器返回的临时路径保存addForm里面的pics数组中
      this.addForm.pics.push({
        pic: response.data.tmp_path
      })
    },
    // 最后添加商品
    addGoods () {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return this.$message.error('请填写必要的表单项')
        // 根据api接口的需求，我要把goods_cat 变成字符串的形式
        // this.addForm.goods_cat = this.addForm.goods_cat.join(',')
        /**
         * 级联选择器 必须绑定在一个数组身上，否则报错，在执行之前一点问题没有，
         * 只要一执行addGoods这个函数，数组变成了字符串。
         * 深拷贝一下addForm,把对象原封不动的拷贝出来新的一份，和原对象没有关系，
         * 有一个包  lodash  可以对js操作做简化处理------cloneDeep(obj)
         */
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 循环遍历manyTableData push每一项 attr_id 和 attr_vals
        this.manyTableData.forEach(item => {
          this.addForm.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals.join('')
          })
        })
        // 将onlyTableData 处理添加到attrs
        this.onlyTableData.forEach(item => {
          this.addForm.attrs.push({
            attr_id: item.attr_id,
            attr_value: item.attr_vals
          })
        })
        form.attrs = this.addForm.attrs
        // 一切准备就绪, 直接完成商品添加,请求接口
        const { data: res } = await this.$http.post('goods', form)
        if (res.meta.status !== 201) {
          return this.$message.error('添加商品失败')
        }
        this.$message.success('添加商品成功')
        // 添加成功后编程式导航跳转到商品列表
        this.$router.push('/goods')
      })
    }
  },
  created () {
    this.getCatList()
  },
  computed: {
    catId () {
      if (this.addForm.goods_cat.length === 3) {
        return this.addForm.goods_cat[2]
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped="scoped">
  .goodsSteps{
    margin: 20px 0;
  }
  .previewImg{
    width: 100%;
  }
  .quill-editor{
    min-height: 300px;
  }
</style>
