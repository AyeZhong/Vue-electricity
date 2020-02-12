<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable  @keyup.native.enter="getGoodsList"  @clear="getGoodsList" class="input-with-select">
            <el-button slot="append"  icon="el-icon-search" @click="getGoodsList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="5">
          <el-button type="primary">添加商品</el-button>
        </el-col>
      </el-row>
      <el-table :data="GoodsList" border>
        <el-table-column type="index" label="#"></el-table-column>
        <el-table-column label="商品名称" prop="goods_name"></el-table-column>
        <el-table-column label="商品价格（元）" prop="goods_price" width="160"></el-table-column>
        <el-table-column label="商品重量" prop="goods_number" width="100"></el-table-column>
        <el-table-column label="创建时间" width="150">
            <template slot-scope="scope">
                {{scope.row.add_time | dateFromat}}
            </template>
        </el-table-column>
        <el-table-column label="操作" width="130">
          <template slot-scope="scope">
            <el-button icon="el-icon-edit" type="primary" size="mini"></el-button>
            <el-button icon="el-icon-delete" type="danger" size="mini" @click="removeGoodsList(scope.row.goods_id)"></el-button>
          </template>
        </el-table-column>
      </el-table>
         <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[10, 20, 30, 40]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      background
      >
    </el-pagination>
    </el-card>
    <!-- <el-dialog title="添加商品" :visible.sync="addGoodsVisible"></el-dialog> -->
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: "",
        pagenum: 1,
        pagesize: 5
      },
      total:0,
      GoodsList: []
      // 对话框状态
      // addGoodVisible:false,
    };
  },
  created() {
    this.getGoodsList();
  },
  methods: {
    async getGoodsList() {
      const { data: res } = await this.$http.get("goods/", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) return this.$message.error("获取失败");
    //   this.$message.success("获取成功");
    //   console.log(res.data.goods);
      
      this.GoodsList = res.data.goods;
      this.total=res.data.total
    //   console.log(this.GoodsList);
    },
    handleSizeChange(val){
        this.queryInfo.pagesize=val
        console.log(this.queryInfo);
        this.getGoodsList()
        
    },
    handleCurrentChange(val){
        this.queryInfo.pagenum=val
        console.log(this.queryInfo);
        
        this.getGoodsList()
    },
    removeGoodsList(id){
        this.$confirm('是否操作永久删除', '标题', {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning'
        }).then( async () => {
            const {data:res} = await this.$http.delete(`goods/${id}`)
            // console.log(res);
            if(res.meta.status !==200) return this.$message.error('删除失败')
            this.$message.success('删除成功')
            this.getGoodsList()       
        }).catch(() => {
            this.$message('取消操作')
        });
    }
    // 显示添加对话框
    // showAddGoodsVisible(){
    //     this.addGoodVisible=true
    // }
  }
};
</script>

<style>
</style>