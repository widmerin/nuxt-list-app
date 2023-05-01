<template>
  <div class="list">
    <ListHeader
      :lists="lists"
      :categories="categories"
      :currentListId="currentListId"
      @removedList="removeList"
      @logoutUser="logout"
      @selectedList="selectList"
      @refreshedData="refetchData"
      @selectedCategory="selectCategory"
    /> 
        <div class="list-content">
      <div class="list-content-tasks-active" v-if="this.openTasks">
          <ListItem
           v-for="(task, index) in filteredTasks"
            :key="task.id"
            :task="task"
            :categories="categories"
            :index="index"
            @refreshedData="refetchTaskData"
          />
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
          v-if="showCompletedTasks"
          v-for="(task, index) in filteredTasks"
          :key="componentListItem + task.id"
          :task="task"
          :categories="categories"
          :index="index"
          @refreshedData="refetchTaskData"
        />
        

      </div>
      <ListFooter
          :categories="categories"
          :suggestions="getSuggestions"
          :currentListId="currentListId"
          @refreshedData="refetchTaskData"
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
      suggestions: [],
    };
  },

  computed: {
    filteredTasks() {
      if (this.currentCategory === 0) {
        return this.openTasks;
      } else {
        return this.openTasks.filter((task) => task.category == this.currentCategory && task.list == this.currentListId);
      }
    },
    

    getSuggestions() {
      const uniqueArr = [];
      this.suggestions.forEach(item => {
        if (!uniqueArr.some(obj => obj.title.toLowerCase() === item.title.toLowerCase())) {
          uniqueArr.push(item);
        }
      });
      return uniqueArr;
    },
  },

 async mounted() {
    this.fetchCategoriesList()
    this.fetchTasks()

    const { $fetchSuggestions } = useNuxtApp()
    this.suggestions = await $fetchSuggestions()
  },
  methods: {
    async fetchCategoriesList() {
      const { $fetchData } = useNuxtApp()
      this.lists = await $fetchData("Lists")
      this.categories = await $fetchData("Categories")

    },
    async fetchTasks() {
      const { $fetchTasks, $fetchCompletedTasks } = useNuxtApp()
      this.openTasks = await $fetchTasks(this.currentListId)
      this.completedTasks = await $fetchCompletedTasks(this.currentListId)
    },
    filterTasksByCategory: function (tasks) {
      if (this.currentCategory != 0) {
        return tasks.filter((task) => task.category == this.currentCategory && task.list == this.currentListId);
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
    },

    selectList(id) {
      if (this.currentListId != id) {
        this.currentListId = id;
      }
      this.fetchTasks()
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
      let removeTasks = this.openTasks.filter(
        (task) => task.list == id
      );
       removeTasks.forEach((task) => {
        const { $deleteTask } = useNuxtApp()
        $deleteTask(task.id);
      });

      const { $deleteList } = useNuxtApp()
      await $deleteList(id)

      this.lists.splice(index, 1);
    },
    refetchData() {
      this.fetchTasks();
      this.fetchCategoriesList();
      console.log("refresh all data");
    },
    refetchTaskData() {
      this.fetchTasks();
      console.log("refresh task data");
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
