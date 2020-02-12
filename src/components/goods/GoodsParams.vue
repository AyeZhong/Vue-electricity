<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-alert type="warning" title="注意！只能修改三级分类参数"></el-alert>
      <div style="margin:20px 0;">
        选择商品分类：
        <el-cascader
          :options="GoodsCateList"
          v-model="cascaderValue"
          :props="cascaderProps"
          @change="cascaderHandleChange"
          clearable
        ></el-cascader>
        <el-tabs v-model="activeName" @tab-click="handleClick">
          <el-tab-pane label="动态参数" name="many">
            <el-button
              type="primary"
              size="mini"
              :disabled="isBtnDisabled"
              @click="addParamsVisible=true"
            >添加参数</el-button>
            <el-table :data="manyParams" border>
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag
                    v-for="(item,index) in scope.row.attr_vals"
                    :key="index"
                    closable
                    @close="removeInputVal(index,scope.row)"
                  >{{item}}</el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  ></el-input>
                  <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showInput(scope.row)"
                  >+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button
                    type="primary"
                    icon="el-icon-edit"
                    @click="showEditparams(scope.row.attr_id)"
                  >编辑</el-button>
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    @click="removeParams(scope.row.attr_id)"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="静态属性" name="only">
            <el-button
              type="primary"
              size="mini"
              :disabled="isBtnDisabled"
              @click="addParamsVisible=true"
            >添加参数</el-button>
            <el-table :data="onlyParams" border>
              <el-table-column type="expand">
                <template slot-scope="scope">
                  <el-tag
                    v-for="(item,index) in scope.row.attr_vals"
                    :key="index"
                    closable
                    @close="removeInputVal(index,scope.row)"
                  >{{item}}</el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="scope.row.inputVisible"
                    v-model="scope.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(scope.row)"
                    @blur="handleInputConfirm(scope.row)"
                  ></el-input>
                  <el-button
                    v-else
                    class="button-new-tag"
                    size="small"
                    @click="showInput(scope.row)"
                  >+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index"></el-table-column>
              <el-table-column label="属性名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template slot-scope="scope">
                  <el-button
                    type="primary"
                    icon="el-icon-edit"
                    @click="showEditparams(scope.row.attr_id)"
                  >编辑</el-button>
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    @click="removeParams(scope.row.attr_id)"
                  >删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </el-card>
    <el-dialog :visible.sync="addParamsVisible" :title="'添加'+titleText" @close="closeParamsForm">
      <el-form :model="addParamsForm" :rules="addParamsRules" ref="addFormRef">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click=" addParamsVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="editParamsVisible" :title="'编辑'+titleText" @close="closeEditForm">
      <el-form :model="editParamsForm" :rules="editParamsRules" ref="editFormRef">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editParamsForm.attr_name"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click=" editParamsVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>
    

<script>
import LoginVue from "../Login.vue";
export default {
  data() {
    return {
      GoodsCateList: [],
      cascaderValue: [],
      cascaderProps: {
        expandTrgger: "hover",
        value: "cat_id",
        label: "cat_name",
        children: "children"
      },
      activeName: "many",
      manyParams: [],
      onlyParams: [],
      inputValue: "",
      addParamsVisible: false,
      editParamsVisible: false,
      inputVisible: false,
      addParamsForm: {
        attr_name: ""
      },
      editParamsForm: {
        attr_name: ""
      },
      addParamsRules: {
        attr_name: [{ required: true, message: "请输入", trigger: "blur" }]
      },
      editParamsRules: {
        attr_name: [{ required: true, message: "请输入", trigger: "blur" }]
      }
    };
  },
  created() {
    this.getGoodsCateList();
  },
  methods: {
    removeParams(attr_id) {
      this.$confirm("确认删除？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `categories/${this.cateId}/attributes/${attr_id}`
          );
          this.$message.success("删除成功");
          this.getParams();
        })
        .catch(() => {
          this.$message("取消删除");
        });
    },
    async getGoodsCateList() {
      const { data: res } = await this.$http.get("categories");
      //  console.log({data:res});

      if (res.meta.status !== 200) return this.$message.error("获取失败");
      // console.log(res.data);

      this.GoodsCateList = res.data;
      // console.log(this.GoodCateList);
    },
    async getParams() {
      if (this.cascaderValue.length !== 3)
        return (
          (this.cascaderValue = []),
          (this.onlyParams = []),
          (this.manyParams = [])
        );
      // console.log(this.onlyParams,this.manyParams);
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: { sel: this.activeName }
        }
      );
      console.log(res);
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(" ") : [];
        console.log(item.attr_vals);
        item.inputValue = "";
        item.inputVisible = false;
      });
      console.log(res.data);
      if (res.meta.status !== 200) return this.$message.error("获取失败");
      if (this.activeName === "many") {
        this.manyParams = res.data;
      } else {
        this.onlyParams = res.data;
      }

      // console.log(this.manyParams);
      // console.log(this.onlyParams);
    },
    cascaderHandleChange() {
      this.getParams();
    },
    handleClick() {
      this.getParams();
    },
    closeParamsForm() {
      this.$refs.addFormRef.resetFields();
    },
    closeEditForm() {
      this.$refs.editFormRef.resetFields();
    },
    addParams() {
      this.$refs.addFormRef.validate(async flag => {
        if (!flag) return this.$message.error("请填写完整");
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addParamsForm.attr_name,
            attr_sel: this.activeName
          }
        );
        if (res.meta.status !== 201) return $this.message.error("添加失败");
        this.$message.success("添加成功");
        this.addParamsVisible = false;
        this.getParams();
      });
    },
    editParams() {
      this.$refs.editFormRef.validate(async flag => {
        if (!flag) return this.$message.error("请填写完整");
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editParamsForm.attr_id}`,
          {
            attr_name: this.editParamsForm.attr_name,
            attr_sel: this.activeName
          }
        );
        console.log(res);

        if (res.meta.status !== 200) return this.$message.error("添加失败");
        this.$message.success("添加成功");
        this.editParamsVisible = false;
        this.getParams();
      });
    },
    async showEditparams(val) {
      this.editParamsVisible = true;
      console.log(val);
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes/${val}`
      );
      this.editParamsForm = res.data;
    },
    handleInputConfirm(val) {
      if (val.inputValue.trim().length === 0) {
        val.inputValue = "";
        val.inputVisible = false;
        return
      }
      const flag =val.attr_vals.some(item => item === val.inputValue.trim())
      if(flag) return this.$message.error('添加的属性已存在')
      val.attr_vals.push(val.inputValue);
      val.inputValue = "";
      val.inputVisible = false;

      this.saveAttrVals(val);
    },
    async saveAttrVals(val) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${val.attr_id}`,
        {
          attr_name: val.attr_name,
          attr_sel: val.attr_sel,
          attr_vals: val.attr_vals.join(" ")
        }
      );
      if (res.meta.status !== 200) return this.$message.error("更新失败");
      this.$message.success("更新成功");
    },
    showInput(val) {
      val.inputVisible = true;
      this.$nextTick(() => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    removeInputVal(index, val) {
      console.log(index, val);

      val.attr_vals.splice(index, 1);
      this.saveAttrVals(val);
    }
  },
  computed: {
    isBtnDisabled() {
      return this.cascaderValue.length !== 3;
    },
    cateId() {
      return this.cascaderValue.length !== 3 ? null : this.cascaderValue[2];
    },
    titleText() {
      return this.activeName === "many" ? "动态参数" : "静态属性";
    }
  }
};
</script>

<style>
.el-tag {
  margin: 5px;
}
</style>