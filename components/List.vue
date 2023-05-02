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
      <div class="list-content-tasks-active" v-if="openTasks">
          <ListItem
           v-for="(task, index) in filteredTasks"
            :key="task.id"
            :task="task"
            :categories="categories"
            :index="index"
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
          v-for="(task, index) in completedTasks"
          :key="componentListItem + task.id"
          :task="task"
          :categories="categories"
          :index="index"
        />
        

      </div>
      <ListFooter
          :categories="categories"
          :suggestions="getSuggestions"
          :currentListId="currentListId"
          />
    </div>
  </div>
</template>
<script setup>
  const loaded = ref(false);
    const componentListItem = ref(0);
    const currentCategory = ref(0);
    const currentListId = ref(1);
    const showCompletedTasks = ref(false);
    const lists = ref([]);
    const categories = ref([]);
    const completedTasks = ref([]);
    const openTasks = ref([]);
    const suggestions = ref([]);

    const supabase = useSupabaseClient();

    const Tasks = supabase.channel('custom-all-channel').on('postgres_changes',{ event: '*', schema: 'public', table: '*' }, (payload) => { 
      console.log(payload)
      if (payload.table == "Tasks") {
        fetchTasks() 
      }
      else {
        fetchCategoriesList()
      }

    }).subscribe()



    const filteredTasks = computed(() => {
      if (currentCategory.value === 0) {
        return openTasks.value;
      } else {
        return openTasks.value.filter(
          (task) =>
            task.category === currentCategory.value &&
            task.list === currentListId.value
        );
      }
    });

    const getSuggestions = computed(() => {
      const uniqueArr = [];
      suggestions.value.forEach((item) => {
        if (
          !uniqueArr.some(
            (obj) =>
              obj.title.toLowerCase() === item.title.toLowerCase()
          )
        ) {
          uniqueArr.push(item);
        }
      });
      return uniqueArr;
    });


    onMounted(async () =>{
      fetchCategoriesList()
      fetchTasks()

      const { $fetchSuggestions } = useNuxtApp()
      suggestions.value = await $fetchSuggestions()    
    })
    const fetchCategoriesList = async () => {
      const { $fetchData } = useNuxtApp();
      lists.value = await $fetchData("Lists");
      categories.value = await $fetchData("Categories");
    };

    const fetchTasks = async () => {
      const { $fetchTasks, $fetchCompletedTasks } = useNuxtApp();
      openTasks.value = await $fetchTasks(currentListId.value);
      completedTasks.value = await $fetchCompletedTasks(currentListId.value);
    };


    const selectList = (id) => {
      if (currentListId.value !== id) {
        currentListId.value = id;
      }
      fetchTasks();
    };

    const selectCategory = (id) => {
      if (id > 0) {
        currentCategory.value = id;
      } else {
        currentCategory.value = 0;
      }
    };

    const removeList = async (id, index) => {
       // delete all tasks from removed list
      let removeTasks = openTasks.value.filter(
        (task) => task.list == id
      );
      let removeCompleted = completedTasks.value.filter(
        (task) => task.list == id
      );
      removeTasks.push(...removeCompleted)
       removeTasks.forEach((task) => {
        const { $deleteTask } = useNuxtApp()
        $deleteTask(task.id);
      });

      const { $deleteList } = useNuxtApp()
      await $deleteList(id)

      lists.value.splice(index, 1); 
    }

    const refetchData = () => {
      fetchTasks();
      fetchCategoriesList();
      console.log("refresh all data");
    }

    const refetchTaskData = () => {
      fetchTasks();
      console.log("refresh task data");
    }

    const  logout = () => {
      this.$emit("logout", "logout");
    }
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
