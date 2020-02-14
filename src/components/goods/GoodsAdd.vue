<template>
  <div>
    <!-- 面包屑  -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <el-alert title="添加商品信息" type="info" show-icon center :closable="false"></el-alert>
      <el-steps :active="tabIndex - 0" align-center :span="20" finish-status="success">
        <el-step title="基本信息"></el-step>
        <el-step title="商品参数"></el-step>
        <el-step title="商品属性"></el-step>
        <el-step title="商品图片"></el-step>
        <el-step title="商品内容"></el-step>
      </el-steps>
      <!-- 标签页 -->
      <el-form
        :model="addGoodsForm"
        status-icon
        :rules="addGoodsRules"
        ref="addGooFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs :tab-position="'left'" style="height: 600px;" v-model="tabIndex" :before-leave="beforeLeave" @tab-click="tabClickChange">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addGoodsForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addGoodsForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addGoodsForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addGoodsForm.goods_number" type="number"></el-input>
            </el-form-item>
             <el-form-item label="商品分类" prop="goods_cats">
              <el-cascader :options="goodsCate" v-model="addGoodsForm.goods_cat" :props="cascaderProps" @change='handleChange' ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
              <el-form-item :label="item.attr_name" v-for="(item) in manyTableData" :key="item.attr_id">
                  <el-checkbox-group v-model="item.attr_vals">
                    <el-checkbox :label="cb" v-for="(cb,index) in item.attr_vals" :key="index" border></el-checkbox>
                  </el-checkbox-group>
              </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
              <el-form-item :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
                  <el-input v-model="item.attr_vals"></el-input>
              </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
          <el-upload
  class="upload-demo"
  :action="uploadURL"
  :on-preview="handlePreview"
  :on-remove="handleRemove"
  list-type="picture">
  <el-button size="small" type="primary">点击上传</el-button>
  <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
</el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">商品内容</el-tab-pane>
        </el-tabs>
      </el-form>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
    //   activeIdenx: 0,
      tabIndex: '0',
      addGoodsForm: {
        goods_name: "",
        goods_price: "",
        goods_weight: "",
        goods_number: "",
        goods_cat:[],
        pics:[]
      },
      addGoodsRules: {
        goods_name: [
          { required: true, message: "请输入商品名称", trigger: "blur" }
        ],
        goods_price: [
          { required: true, message: "请输入商品价格", trigger: "blur" }
        ],
        goods_weight: [
          { required: true, message: "请输入商品重量", trigger: "blur" }
        ],
        goods_number: [
          { required: true, message: "请输入商品数量", trigger: "blur" }
        ],
        goods_cats:[
             { required: true, message: "请输入商品分类", trigger: "blur" }
        ]
      },
      goodsCate: [],
      cascaderProps:{
          expandTrigger:'hover',
          label:'cat_name',
          value:'cat_id'
      },
      manyTableData:[],
      onlyTableData:[],
      uploadURL:'https://www.liulongbin.top:8888/api/private/v1/upload',
      headerObj:{
          Authrization:window.sessionStorage.getItem('token')
      }

    };
  },
  created() {
      this.getGoodCate()
  },
  methods: {
    async getGoodCate() {
      const { data: res } = await this.$http.get("categories");
    //   console.log(res);
      
      if (res.meta.status !== 200) return this.$message.error("获取失败");

      this.goodsCate = res.data;
    //   console.log(this.goodsCate);
      
    },
    handleChange(){
        if(this.addGoodsForm.goods_cat.length !== 3) return this.addGoodsForm.goods_cat=[]
        // console.log(1);
        
    },
    beforeLeave(activeName,oldActiveName){
        // console.log(this.addGoodsForm.goods_cat);
        
        if(oldActiveName === '0' && this.addGoodsForm.goods_cat.length !==3 ){
            this.$message.error('请选择商品分类')
            return false
        }
    },

   async tabClickChange(){
    //    console.log(this.caseId);
        // console.log(this.tabIndex);
        if(this.tabIndex === '1') {
            const {data:res} = await this.$http.get(`categories/${this.caseId}/attributes`,{
                params:{sel:'many'}
            }) 
    
        if(res.meta.status !== 200)  return this.$message.error('获取列表失败')
        res.data.forEach(item => {
            item.attr_vals=item.attr_vals.length === 0 ? []:item.attr_vals.split(' ')
        })
        this.manyTableData=res.data
        // console.log(this.manyTableData);        
        } else if(this.tabIndex === '2')  {
             const {data:res} = await this.$http.get(`categories/${this.caseId}/attributes`,{
                params:{sel:'only'}
        })
        if(res.meta.status !== 200)  return this.$message.error('获取列表失败')
     
        this.onlyTableData=res.data    
        // console.log(this.onlyTableData); 
        
        }
    
    
  },
  handleRemove(){

  },
  handleSuccess(){

  },
  handlePreview(){

  }
  },
  computed:{
      caseId(){
          return  this.addGoodsForm.goods_cat.length ===3? this.addGoodsForm.goods_cat[2]:'null'
      }
  }
};
</script>

<style>
</style>