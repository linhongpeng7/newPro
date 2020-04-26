<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" class="rights_breadcrumb">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-table
      :data="rightsList"
      height="600"
      border
      stripe
      style="width: 100%">
      <el-table-column
        type="index"
        label="#"
        width="50px"
      >
      </el-table-column>
      <el-table-column
        prop="authName"
        label="权限名称"
      >
      </el-table-column>
      <el-table-column
        prop="path"
        label="路径"
      >
      </el-table-column>
      <el-table-column
        prop="level"
        label="权限等级">
        <template slot-scope="scope">
          <el-tag v-if="scope.row.level === '0'" type="success">一级</el-tag>
          <el-tag v-if="scope.row.level === '1'" type="info">二级</el-tag>
          <el-tag v-if="scope.row.level === '2'">三级</el-tag>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: 'Rights',
  data () {
    return {
      // 列表形式的权限数据
      rightsList: []
    }
  },
  methods: {
    async getRightsList () {
      const { data: res } = await this.$http.get('rights/list')
      if (res.meta.status !== 200) return this.$message.error('获取权限列表失败')
      this.rightsList = res.data
    }
  },
  created () {
    this.getRightsList()
  }
}
</script>

<style lang="less" scoped="scoped">
  .rights_breadcrumb{
    margin: 20px 0;
  }
</style>
