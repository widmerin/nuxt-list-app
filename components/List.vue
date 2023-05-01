<template>
  <div class="list">
    <ListHeader
      :lists="lists"
      :categories="categories"
      :currentListId="currentListId"
      @removedList="removeList"
      @logoutUser="logout"
      @selectedList="selectList"
      @refreshedData="refreshData"
      @selectedCategory="selectCategory"
    /> 
        <div class="list-content">
      <div class="list-content-tasks-active" v-if="this.tasks">
        <transition-group
          name="fade"
          enter-active-class="animated fadeInUp"
          leave-active-class="animated fadeOutDown"
        >
          <ListItem
           v-for="(task, index) in openTasks"
            :key="componentListItem + task.category + task.id"
            :task="task"
            :categories="categories"
            :index="index"
            @refreshedData="refreshData"
          />
        </transition-group>
      </div>
      <div
        class="list-content-tasks-completed"
        v-if="completedTasks.length > 0">
        <p class="tasks-title">
          Completed Tasks
          <i
            v-if="showCompletedTasks"
            class="material-icons list-content-tasks-completed-icon"
            @click="showCompletedTasks = !showCompletedTasks"
            >arrow_drop_down</i
          >
          <i
            v-else
            class="material-icons list-content-tasks-completed-icon"
            @click="showCompletedTasks = !showCompletedTasks"
            >arrow_drop_up</i
          >
        </p>
        <ListItem
          v-if = "showCompletedTasks"
          v-for="(task, index) in completedTasks"
          :key="componentListItem + task.id"
          :task="task"
          :categories="categories"
          :index="index"
          @refreshedData="refreshData"
        />
        

      </div>
      <ListFooter
          :categories="categories"
          :suggestions="getSuggestions"
          :currentListId="currentListId"
          @refreshedData="refreshData"
          />
    </div>
  </div>
</template>

<script>
 

export default {
  name: "List",
  data() {
    return {
      loaded: false,
      componentListItem: 0,
      newTask: "",
      idForTask: 4,
      currentCategory: 0,
      currentListId: 1,
      beforeEditCache: "",
      showCompletedTasks: false,
      lists: [],
      categories: [],
      tasks: [],
      completedTasks: [],
      openTasks: [],
    };
  },

  computed: {
    
    tasksFilteredActive: {
      get() {
        return this.filterTasksByCategory(
        //  this.filterTasksCurrentList(this.filterTasksActive(this.tasks))
        );
      },
    },
    tasksFilteredCompleted() {
     // return this.filterTasksCurrentList(this.filterTasksCompleted(this.tasks));
    },
    getSuggestions() {
      let suggestions = [];
/*        this.tasksFilteredCompleted.forEach((task) => {
        if (!suggestions.includes(task.title)) {
          suggestions.push(task.title);
        }
      }); */
      return suggestions;
    },
  },

 async mounted() {
    this.refresh()
    this.refreshTasks()
  },
  methods: {
    async refresh() {
      console.log("refresh")
      const { $fetchData } = useNuxtApp()
      this.lists = await $fetchData("Lists")
      this.categories = await $fetchData("Categories")
      this.tasks = await $fetchData("Tasks")

    },
    async refreshTasks() {
      const { $fetchTasks, $fetchCompletedTasks } = useNuxtApp()
      this.openTasks = await $fetchTasks(this.currentListId)
      this.completedTasks = await $fetchCompletedTasks(this.currentListId)
      console.log(this.completedTasks)
    },
  /*  filterTasksByCategory: function (tasks) {
      if (this.currentCategory != 0) {
        return tasks.filter((task) => task.category == this.currentCategory);
      }
      return tasks;
    },
    filterTasksActive: function (tasks) {
      return tasks.filter((task) => !task.completed);
    },
    filterTasksCompleted: function (tasks) {
      return tasks.filter((task) => task.completed);
    },
    filterTasksCurrentList: function (tasks) {
      return tasks.filter((task) => task.list == this.currentListId);
    },*/

    selectList(id) {
      if (this.currentListId != id) {
        this.currentListId = id;
      }
      this.refreshTasks()
    },
    selectCategory(id) {
      if (id > 0) {
        this.currentCategory = id;
      } else {
        this.currentCategory = 0;
      }
    },
    async removeList(id, index) {
      // delete all tasks from removed list
      let removeTasks = this.tasks.filter(
        (task) => task.list == id
      );
       removeTasks.forEach((task) => {
        console.log("delete" + task.id);
        const { $deleteTask } = useNuxtApp()
        $deleteTask(task.id);
      });

      const { $deleteList } = useNuxtApp()
      await $deleteList(id)

      this.lists.splice(index, 1);
    },
    refreshData() {
      this.refresh();
      console.log("refresh data");
    },
    logout() {
      this.$emit("logout", "logout");
    },
  },
};
</script>

<style lang='scss'>
.list-content {
  padding: 0 15px 15px;
  .completed {
    text-decoration: line-through;
  }
  &-tasks-active,
  &-tasks-completed {
    padding-bottom: 50px;
    &-icon {
      float: right;
      margin-right: 0;
      cursor: pointer;
    }
  }
}
</style>
