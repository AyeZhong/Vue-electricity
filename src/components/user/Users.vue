<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区域 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <el-input clearable placeholder="请输入内容" v-model="queryInfo.query" @clear="getUserList">
            <el-button slot="append" icon="el-icon-search" @click="getUserList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="showAddUserDialog">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template slot-scope="scope">
            <el-switch v-model="scope.row.mg_state" @change="switchChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="180px">
          <template slot-scope="scope">
            <!-- 修改按钮 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDiglog(scope.row)"
            ></el-button>
            <!-- 删除按钮 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUser(scope.row.id)"
            ></el-button>
            <!-- 分配角色按钮 -->
            <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
              <el-button
                type="warning"
                icon="el-icon-setting"
                size="mini"
                @click="showAssighDiglog(scope.row)"
              ></el-button>
            </el-tooltip>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[2, 5, 10, 15]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 对话框 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="closeAddUserDialog"
    >
      <el-form :model="addForm" :rules="addFormRules" ref="ruleFormRef" label-width="100px">
        <el-form-item label="用户名:" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码:" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱:" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机:" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="编辑用户" :visible.sync="editDialogVisble" width="50%" @close="closeEditDoglog">
      <el-form :model="userInfo" :rules="editFormRules" ref="editRuleFormRef" label-width="100px">
        <el-form-item label="用户名:" prop="username">
          <el-input v-model="userInfo.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱:" prop="email">
          <el-input v-model="userInfo.email"></el-input>
        </el-form-item>
        <el-form-item label="手机:" prop="mobile">
          <el-input v-model="userInfo.mobile"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisble = false">取 消</el-button>
        <el-button type="primary" @click="editUser">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog title="分配角色" :visible.sync="assighVisble" width="50%">
      <div>姓名：{{userInfo.username}}</div>
      <div>角色：{{userInfo.role_name}}</div>
      <span slot="footer" class="dialog-footer">
        <el-button @click="assighVisble=false">取 消</el-button>
        <el-button type="primary" @click="assighVisble=false">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    //验证邮箱的规则
    var checkEmail = (rule, value, cb) => {
      //验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/;
      if (regEmail.test(value)) {
        //合法的邮箱
        return cb();
      }
      cb(new Error("请输入合法的邮箱"));
    };
    //验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      //验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/;
      if (regMobile.test(value)) {
        return cb();
      }
      cb(new Error("请输入合法的手机号"));
    };

    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: "",
        // 当前的页数
        pagenum: 1,
        // 当前每页显示多少条数据
        pagesize: 2
      },
      userlist: [],
      total: 0,
      addDialogVisible: false,
      editDialogVisble: false,
      assighVisble: false,
      userInfo: {},
      assighUser: [],
      addForm: {
        username: "",
        password: "",
        email: "",
        mobile: ""
      },
      addFormRules: {
        username: [
          { required: true, message: "请输入用户名称", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ],
        password: [
          { required: true, message: "请输入密码", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 2 到 10 个字符", trigger: "blur" }
        ],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      },
      editFormRules: {
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          { validator: checkEmail, trigger: "blur" }
        ],
        mobile: [
          { required: true, message: "请输入手机", trigger: "blur" },
          { validator: checkMobile, trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getUserList();
  },

  methods: {
    async getUserList() {
      const { data: res } = await this.$http.get("users", {
        params: this.queryInfo
      });
      if (res.meta.status !== 200) {
        return this.$message.error("获取用户列表失败！");
      }
      this.userlist = res.data.users;
      this.total = res.data.total;
      console.log(res);
    },
    handleSizeChange(newval) {
      this.queryInfo.pagesize = newval;
      this.getUserList();
    },
    handleCurrentChange(newval) {
      this.queryInfo.pagenum = newval;
      this.getUserList();
    },
    // 修改用户状态
    async switchChange(val) {
      // console.log(val);
      const { data: res } = await this.$http.put(
        `users/${val.id}/state/${val.mg_state}`
      );
      // console.log({ data: res });
      if (res.meta.status !== 200) return this.$message.error("修改失败");
      this.$message.success("修改成功");
    },
    // 显示添加对话框
    showAddUserDialog() {
      this.addDialogVisible = true;
    },
    // 关闭对话框
    closeAddUserDialog() {
      this.$refs.ruleFormRef.resetFields();
    },
    addUser() {
      // 先验证表单是否填写完整
      // 如果填写完整可以发送网址
      this.$refs.ruleFormRef.validate(async flag => {
        // 判断
        if (!flag) return this.$message.error("填写不正确");
        // 发送请求
        const { data: res } = await this.$http.post("users", this.addForm);
        if (res.meta.status !== 201) return this.$message.error(this.meta.msg);
        this.$message.success("创建成功");
        // 关闭页面
        this.addDialogVisible = false;
        this.getUserList();
      });
    },
    // 显示编辑对话框
    async showEditDiglog(id) {
      // console.log(id);
      const { data: res } = await this.$http(`users/${id.id}`);
      console.log(res.data);
      if (res.meta.status !== 200) return this.$message.error("查询失败");
      this.userInfo = res.data;
      this.editDialogVisble = true;
    },
    // 关闭对话框
    closeEditDoglog() {
      this.$refs.editRuleFormRef.resetFields();
    },
    // 编辑用户
    editUser() {
      this.$refs.editRuleFormRef.validate(async flag => {
        if (!flag) return this.$message.error("请完善表格");
        const { data: res } = await this.$http.put(
          "users/" + this.userInfo.id,
          { email: this.userInfo.email, mobile: this.userInfo.mobile }
        );
        if (res.meta.status !== 200) return this.$message.error("更新失败");
        this.editDialogVisble = false;
        this.getUserList();
        this.$message.success("更新成功");
      });
    },
    // 移除用户
    removeUser(id) {
      //  console.log(this.$confirm);

      this.$confirm("此操作将永久删除该用户，是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const { data: res } = await this.$http.delete("users/" + id);
          if (res.meta.status !== 200) return this.$message.error("删除失败");
          this.$message({
            type: "success",
            message: "删除成功"
          });
          this.getUserList();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消"
          });
        });
    },
    // 显示分配角色对话框
   async showAssighDiglog(userInfo) {
      // console.log(1);
      this.userInfo = userInfo;
      const {data:res} = await $http.get('roles')
      if(res.meta.status!==200) return this.$message.error('获取用户列表失败')
      this.assighVisble = true;
    }
  }
};
</script>

<style lang="less" scoped>
</style>
