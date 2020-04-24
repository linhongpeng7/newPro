<template>
  <el-container class="home-container">
    <el-header>
      <div class="header-left">
        <img src="../assets/1.jpg" alt="" />
        <h3>后台管理系统</h3>
      </div>
      <el-button class="quitbtn" type="info" @click="quit">退出</el-button>
    </el-header>
    <!--页面得主体区域-->
    <el-container>
      <!--侧边栏-->
      <el-aside :width="isFold?'64px':'200px'">
        <div class="fold_button" @click="handleFold">|||</div>
         <!-- unique-opened 打开当前菜单,闭合上一个菜单 -->
         <el-menu
               :default-active="activePath"
               background-color="#545c64"
               text-color="#fff"
               active-text-color="#ffd04b"
               unique-opened
               :collapse="isFold"
               :collapse-transition="false"
               router>
               <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
                 <!-- 一级菜单 -->
                 <template slot="title">
                   <i :class="iconObj[item.id]"></i>
                   <span>{{item.authName}}</span>
                 </template>
                 <!-- 二级菜单 -->
                 <el-menu-item
                  v-for="(items,index) in item.children"
                  :key="index"
                  :index="'/'+items.path"
                  @click="saveNavState('/'+items.path)"
                 >
                   <template slot="title">
                     <i class="el-icon-menu"></i>
                     <span>{{items.authName}}</span>
                   </template>
                 </el-menu-item>
               </el-submenu>
             </el-menu>
      </el-aside>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  data () {
    return {
      // 左侧菜单栏数据
      menuList: null,
      iconObj: {
        125: 'iconfont icon-user',
        103: 'iconfont icon-tijikongjian',
        101: 'iconfont icon-shangpin',
        102: 'iconfont icon-danju',
        145: 'iconfont icon-baobiao'
      },
      // 是否折叠
      isFold: false,
      // 活跃的路由地址,刷新页面,高亮不变
      activePath: ''
    }
  },
  methods: {
    quit () {
      sessionStorage.removeItem('token')
      this.$router.push('/login')
    },
    async getMenuList () {
      const { data: res } = await this.$http.get('menus')
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.menuList = res.data
    },
    handleFold () {
      this.isFold = !this.isFold
    },
    saveNavState (activePath) {
      sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  },
  created () {
    this.getMenuList()
    this.activePath = sessionStorage.getItem('activePath')
    console.log(this.activePath)
  }

}
</script>
<style lang="less" scoped="scoped">
  .home-container{
    width: 100%;
    height: 100%;
  }
  .el-header{
     background-color: #ccc;
     color: #fff;
     line-height: 60px;
     display: flex;
     justify-content: space-between;
     align-items: center;
     .header-left{
       width: 180px;
       display: flex;
       justify-content: space-around;
       img{
         width: 50px;
         height: 50px;
         border-radius: 50%;
         margin-top: 5px;
       }
       h3{
         text-shadow: 0 0 4px red;
       }
     }
     .quitbtn{
       background: orangered;
     }
  }
  .el-aside{
    background-color: #D3DCE6;
    color: #333;
    line-height: 200px;
    .fold_button{
      width: 100%;
      height: 30px;
      line-height: 30px;
      background: #D3DCE6;
      color: red;
      text-align: center;
      cursor: pointer;
      letter-spacing: 0.2em;
    }
  }
  .el-main {
    background-color: #E9EEF3;
    color: #333;
  }
</style>
