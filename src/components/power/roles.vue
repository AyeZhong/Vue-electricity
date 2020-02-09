<template>
  <div>
    <!-- 面包屑 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色 -->
      <div>
        <el-button type="primary" @click="showRolesUser">添加角色</el-button>
      </div>
      <el-table :data="rolesList" border stripe>
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom',index1===0?'bdtop':'']"
              v-for="(item1,index1) in scope.row.children"
              :key="item1.id"
            >
              <el-col :span="5">
                <el-tag type="primary" closable>{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <el-col :span="19">
                <!-- 通过for循环嵌套渲染二级权限 -->
                <el-row
                  :class="index2===0? '':'bdtop'"
                  v-for="(item2,index2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag type="success" closable>{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag
                      type="warning"
                      v-for="(item3) in item2.children"
                      :key="item3.id"
                      closable
                      @close="removeTag(scope.row,item3.id)"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="primary"
              size="mini"
              icon="el-icon-edit"
              @click="showEditRoles(scope.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              size="mini"
              icon="el-icon-delete"
              @click="removeRoles(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              size="mini"
              icon="el-icon-setting"
              @click="showAssighRolesVisble(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色 -->
    <el-dialog title="添加角色" :visible.sync="addRolerVisible" width="50%" @close="closeRolesUser">
      <el-form :model="rolesAddList" :rules="rolesAddrules" ref="rulesFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="rolesAddList.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="rolesAddList.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRolerVisible = false">取 消</el-button>
        <el-button type="primary" @click="addRolesUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 编辑角色 -->
    <el-dialog title="编辑角色" :visible.sync="editRolesVisible" width="50%" @close="closeRolesUser">
      <el-form :model="rolesInfo" :rules="rolesAddrules" ref="rulesFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="rolesInfo.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="rolesInfo.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editRolesVisible = false">取 消</el-button>
        <el-button type="primary" @click=" editRolesUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限 -->
    <div class="roles">
      <el-dialog title="分配权限" :visible.sync="assighRolerVisible"  width="50%" @close="closeSetRightDialog">
        <el-tree
          :data="rightList"
          :default-checked-keys="defaultKeys"
          :props="defaultProps"
          :default-expand-all="true"
          node-key="id"
          ref="treeRef"
          show-checkbox
        ></el-tree>
        <span slot="footer" class="dialog-footer">
          <el-button @click=" assighRolerVisible = false">取 消</el-button>
          <el-button type="primary" @click="setRights">确 定</el-button>
        </span>
      </el-dialog>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      rightList: [],
      roleId:[],
      defaultKeys: [],
      defaultProps: {
        children: "children",
        label: "authName"
      },
      addRolerVisible: false,
      editRolesVisible: false,
      assighRolerVisible: false,
      rolesInfo: {},
      rolesAddList: {
        roleName: "",
        roleDesc: ""
      },
      rolesAddrules: {
        roleName: [
          { required: true, message: "请输入角色名称", trigger: "blur" },
          { min: 3, max: 10, message: "长度在 3 到 10 个字符", trigger: "blur" }
        ]
      }
    };
  },
  created() {
    this.getRolesList();
    this.getRightList();
  },
  methods: {
    // 获取角色数据
    async getRolesList() {
      const { data: res } = await this.$http.get("roles");
      if (res.meta.status !== 200) return this.$message.error("获取失败");
      this.rolesList = res.data;
      //   console.log(this.rolesList);
    },
    async getRightList() {
      const { data: res } = await this.$http.get("rights/tree");
      if (res.meta.status !== 200) return this.$message.error("获取失败");
      this.rightList = res.data;
    },
    closeRolesUser() {
      this.$refs.rulesFormRef.resetFields();
    },
    // 显示弹窗框
    showRolesUser() {
      this.addRolerVisible = true;
    },
    // 显示编辑框
    async showEditRoles(id) {
      console.log(id);

      const { data: res } = await this.$http.get(`roles/${id}`);
      // console.log(res.data);
      if (res.meta.status !== 200) return this.$message.error("查询失败");
      this.rolesInfo = res.data;
      // console.log(this.rolesInfo);
      this.editRolesVisible = true;
    },
    // 添加角色
    addRolesUser() {
      // console.log(this.$refs);
      this.$refs.rulesFormRef.validate(async falg => {
        if (!falg) return this.$message.error("填写不正确");
        const { data: res } = await this.$http.post("roles", this.rolesAddList);
        if (res.meta.status !== 201) return this.$message.error(this.meta.msg);
        this.$message.success("创建成功");
        this.addRolerVisible = false;
        this.getRolesList();
      });
    },
    // 删除角色
    removeRoles(id) {
      this.$confirm("此操作将永久删除该用户，是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const { data: res } = await this.$http.delete("roles/" + id);
          if (res.meta.status !== 200) return this.$message.error("删除失败");
          this.$message({
            type: "success",
            message: "删除成功"
          });
          this.getRolesList();
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消"
          });
        });
    },
    // 编辑角色
    editRolesUser() {
      this.$refs.rulesFormRef.validate(async flag => {
        if (!flag) return this.$message.error("请填写完整");
        console.log(this.rolesInfo);

        const { data: res } = await this.$http.put(
          "roles/" + this.rolesInfo.roleId,
          {
            roleName: this.rolesInfo.roleName,
            roleDesc: this.rolesInfo.roleDesc
          }
        );
        console.log({ data: res });
        if (res.meta.status !== 200) return this.$message.error("更新失败");
        this.editRolesVisible = false;
        this.getRolesList();
        this.$message.success("更新成功");
      });
    },
    // 删除权限提示框
    removeTag(roleId, rightId) {
      this.$confirm("此操作将永久删除权限", "提示", {
        confirmButtonText: "确认",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(async () => {
          const { data: res } = await this.$http.delete(
            `roles/${roleId.id}/rights/${rightId}`
          );
          console.log({ data: res });
          if (res.meta.status !== 200)
            return this.$message.error("取消权限失败");
          this.$message.success("取消权限成功");
          roleId.children = res.data;
        })
        .catch(() => {
          this.$message("已取消操作");
        });
    },
    // 显示分配权限对话框
    showAssighRolesVisble(id) {
      this.roleId=id
      this.getRightList();
      this.assighRolerVisible = true;
      this.getAllid(id);
    },
    getAllid(row) {
      // console.log(data);
      
      // data.forEach(item => {
      //   if(!item.children){
      //     this.defaultKeys.push(item.id)
      //     return
      //   }
      //   this.getAllid(item)
      // });
      if (!row.children) {  
        this.defaultKeys.push(row.id);       
        return
      }
      row.children.forEach(item => {
        this.getAllid(item);
      });
    },
    closeSetRightDialog(){
      this.defaultKeys=[]
    },
    // 添加用户状态
   async setRights(){
      // console.log(this.$refs.treeRef.getCheckedKeys());
      const allId=[
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]     
      // console.log(this.roleId.id);
      
      // console.log(allId);
      
      const { data:res } = await this.$http.post(`roles/${this.roleId.id}/rights`,{
       rids:allId.join(',')
      })
      // console.log({data:res});
      if(res.meta.status!==200)  return this.$message.error('更新失败')
      this.$message.success('更新成功')
      this.assighRolerVisible=false;
      this.getRolesList() 
    }
  }
};
</script>

<style scoped lang="less">
.el-tag {
  margin: 7px;
}
.el-row {
  display: flex;
  align-items: center;
}
.bdbottom {
  border-bottom: 1px solid #eee;
}
.bdtop {
  border-top: 1px solid #eee;
}
</style>