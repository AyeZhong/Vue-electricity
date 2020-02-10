<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <el-card>
      <!-- 添加角色 -->
      <div>
        <el-button type="primary" @click="showAddCateDiglogVisible" style="margin:10px 0 ;">添加分类</el-button>
      </div>
      <!-- 树状表格 -->
      <tree-table
        :data="cateList"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
        :show-row-hover="false"
      >
        <template slot="isOk" slot-scope="scope">
          <i class="el-icon-error" style="color:red;" v-if="scope.row.cat_deleted"></i>
          <i class="el-icon-success" style="color:green;" v-else></i>
        </template>
        <template slot-scope="scope" slot="order">
          <el-tag v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_level === 1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>
        <template slot="options" slot-scope="scope">
          <el-button size="mini" type="primary" icon="el-icon-edit">编辑</el-button>
             <el-button size="mini" type="danger" icon="el-icon-delete">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[5, 10, 20, 30]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    </el-card>
    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" :visible.sync="addCateDialogVisible" width="50%" @close="addCateColse">
      <el-form :model="addCateFrom" :rules="addCateFromRules" ref="addCateFromRef" label-width="100px">
        <el-form-item label="用户名称" prop="cat_name">
            <el-input v-model="addCateFrom.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <el-cascader :options="parentCateList" v-model="cascaderValue" :props="cascaderProp" clearable    @change="casaderHandleChange">

          </el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
          <el-button @click=" addCateDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addCate">确 定</el-button>
        </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      cateList: [],
      total: 0,
      columns: [
        {
          label: "分类名称",
          prop: "cat_name"
        },
        {
          label: "是否有效",
          type: "template",
          template: "isOk"
        },
        {
          label: "排序",
          type: "template",
          template: "order"
        },
        {
          label: "操作",
          type: "template",
          template: "options"
        }
      ],
      // 显示对话框
      addCateDialogVisible:false,
      addCateFrom:{
        // 父级分类id默认为0
        cat_pid:0,
        // 分类名称
        cat_name:'',
        // 分类等级
        cat_level:0
      },
      // 分类名称规则
      addCateFromRules:{
        cat_name:[
          {required:true,message:'请输入分类名称',trigger:'blur'}
        ]
      },
      // 父级分类列表
      parentCateList:[],
      // 分类选择储存的值
      cascaderValue:[],
      cascaderProp:{
        expandTrigger:'hover',
        value:'cat_id',
        label:'cat_name',
        checkStrictly:true
      }      

    };
  },
  created() {
    this.getGoodsCate();
  },
  methods: {
    // 获取商品数据
    async getGoodsCate() {
      // 发送数据请求
      const { data: res } = await this.$http.get("categories", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) this.$message.error("获取失败");
      this.cateList = res.data.result;
      // console.log(res.data.total);
      
      this.total = res.data.total;
      // console.log(this.cateList);
      // console.log(this.total);
    },

    handleSizeChange(val){
      this.queryInfo.pagesize=val
      this.getGoodsCate()
    },
    handleCurrentChange(val){
      this.queryInfo.pagenum=val
      this.getGoodsCate()
    },
    // 显示对话框
    showAddCateDiglogVisible(){
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取分类列表
    async getParentCateList(){
      const {data:res} = await this.$http.get('categories',{ params : { type : 2}})
      if(res.meta.status!==200) return this.$message.error('获取失败')
      this.parentCateList = res.data
      // console.log(this.parentCateList);
      
    },
    // 用户分类对话框发生改变时
   casaderHandleChange(){
    //  console.log(this.cascaderValue);
    if(this.cascaderValue.length>0){
      this.addCateFrom.cat_level=this.cascaderValue.length
      this.addCateFrom.cat_pid=this.cascaderValue[this.cascaderValue.length-1]
    }else{
    
      this.addCateFrom.cat_level=0
      this.addCateFrom.cat_pid=0
    } 
    // console.log(this.addCateFrom);
    },
    // 关闭对话框
    addCateColse(){
      this.$refs.addCateFromRef.resetFields()
      this.cascaderValue=[]
      this.addCateFrom.cat_pid=0
      this.addCateFrom.cat_level=0
    },
    addCate(){
     this.$refs.addCateFromRef.validate(async falg =>{
        if(!falg) return this.$message.error('请填写正确')
       const {data:res} = await this.$http.post('categories',this.addCateFrom)
       if(res.meta.status!==201) return this.$message.error('添加失败')
       this.$message.success('添加成功')
       this.addCateDialogVisible=false
       this.getGoodsCate()
      })
    }
  }
};
</script>

<style>

</style>