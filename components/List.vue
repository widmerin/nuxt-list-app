<template>
  <div class="list">
    <ListHeader
      :lists="lists"
      :categories="categories"
      :currentListId="currentListId"
      @addedList="addList"
      @removedList="removeList"
      @addedCategory="addCategory"
      @removedCategory="removeCategory"
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
            v-for="(task, index) in tasksFilteredActive"
            :key="componentListItem + task.id"
            :task="task"
            :categories="categories"
            :index="index"
            @removedTask="removeTask"
            @finishedEdit="finishedEdit"
          />
        </transition-group>
      </div>
      <div
        class="list-content-tasks-completed"
        v-if="this.tasks && tasksFilteredCompleted && tasksFilteredCompleted.length">
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
          v-for="(task, index) in tasksFilteredCompleted"
          :key="componentListItem + task.id"
          :task="task"
          :categories="categories"
          :index="index"
          @removedTask="removeTask"
          @finishedEdit="finishedEdit"
        />
        <ListFooter
          @addedTask="addTask"
          :categories="categories"
          :suggestions="getSuggestions"
          />
      </div>
    </div>
  </div>
</template>

<script>


import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.SUPABASE_API_URL, process.env.SUPABASE_APP_KEY) 
 
import {
  createCategory,
  createList,
  createTask,
  deleteCategory,
  deleteList,
  deleteTask,
  getCategories,
  getLists,
  getTasks,
  updateTask,
} from "@/helpers/supabase";

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
    };
  },
  async mounted() {
    this.supscripeTaskUpdate()
    this.subscribeTaskInsert()
    this.subscribeTaskDelete()
  },
  computed: {
    
    tasksFilteredActive: {
      get() {
        return this.filterTasksByCategory(
          this.filterTasksCurrentList(this.filterTasksActive(this.tasks))
        );
      },
    },
    tasksFilteredCompleted() {
      return this.filterTasksCurrentList(this.filterTasksCompleted(this.tasks));
    },
    getSuggestions() {
      let suggestions = [];
      this.tasksFilteredCompleted.forEach((task) => {
        if (!suggestions.includes(task.title)) {
          suggestions.push(task.title);
        }
      });
      return suggestions;
    },
  },
  async created() {
    this.loaded = true;
    this.fetchData()
  },
  methods: {
    async fetchData(){
      this.lists = await getLists()
      this.categories = await getCategories()
      this.tasks = await getTasks()  
    },
    filterTasksByCategory: function (tasks) {
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
    },
    forceRerender() {
      this.componentListItem += 1;
    },
    selectList(id) {
      if (this.currentListId != id) {
        this.currentListId = id;
        this.forceRerender();
      }
    },
    selectCategory(id) {
      if (id > 0) {
        this.currentCategory = id;
      } else {
        this.currentCategory = 0;
      }
      this.forceRerender();
    },
    async addCategory(name) {
      const data = {
          name: name,
      }
      const newCategory = await createCategory(data)
      this.categories.push(newCategory[0])
    },

    async addList(name) {
      const data = {
        name: name,
      }
      const newList = await createList(data)
      this.lists.push(newList[0])
    },

    async addTask(title, category) {
      const data = {
          title: title,
          list: this.currentListId,
          completed: false,
          category: category ? category : null
      }
  
      const task = await createTask(data)
      this.refreshData();
    },

    removeTask(id) {
      // Delete Task in DB
      deleteTask(id);
    },
    removeList(id, index) {
      // delete all tasks from removed list
      let removeTasks = this.tasks.filter(
        (task) => task.list == id
      );
      removeTasks.forEach((task) => {
        console.log("delete" + task.id);
        deleteTask(task.id);
      });
      deleteList(id);
      this.lists.splice(index, 1);
    },
    removeCategory(id, index) {
      // remove category from all tasks
      deleteCategory(id);
      this.categories.splice(index, 1);
    },
    finishedEdit(data) {
      // Update Task in DB
      updateTask(data.task);
      this.refreshData();
    },
    refreshData() {
      this.fetchData();
      console.log("refresh data");
    },
    logout() {
      this.$emit("logout", "logout");
    },
    supscripeTaskUpdate() {
      supabase
        .from('Tasks')
        .on('UPDATE', payload => {
          let index = this.tasks.map((item) => item.id).indexOf(payload.new.id)
          this.tasks[index].title = payload.new.title
          this.tasks[index].category = payload.new.category
          this.tasks[index].completed = payload.new.completed
          console.log('subscribe insert')
        })
        .subscribe()
    },
    subscribeTaskInsert() {
      supabase
        .from('Tasks')
        .on('INSERT', payload => {
          this.tasks.push(payload.new)
          console.log('subscribe insert')
        })
        .subscribe()
    },
    subscribeTaskDelete() {
      supabase
        .from('Tasks')
        .on('DELETE', payload => {
          let index = this.tasks.map((item) => item.id).indexOf(payload.old.id)
          this.tasks.splice(index, 1);
          console.log('subscribe delete')

        })
        .subscribe()
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
