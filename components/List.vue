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
        <draggable 
        v-model="filteredItems" 
        group="tasks" 
        @start="drag=true" 
        @end="drag=false"
        :disabled="currentCategory != 0"
        item-key="id">
        <template #item="{element, index}">
          <ListItem :task="element" :categories="categories" :key="element.id" :index="index"/>
         </template>
      </draggable>
      
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
    const drag = ref(false)
    const supabase = useSupabaseClient();
    const itemIndices = ref([]);
    const { $updateTask } = useNuxtApp()

    const Tasks = supabase.channel('custom-all-channel').on('postgres_changes',{ event: '*', schema: 'public', table: '*' }, (payload) => { 
      console.log(payload)
      if (payload.table == "Tasks") {
        fetchTasks() 
      }
      else {
        fetchCategoriesList()
      }

    }).subscribe()

    const updateOpenTasksSortOrder = async () => {
      openTasks.value.forEach((update, index) => {
        console.log(update.title+" sortby: " +update.sortOrder + "new index" + index)
        if(update.sortOrder != index) {
          console.log("UPDATE")
          $updateTask({
            id: update.id,
            sortOrder: index,
          });
        }
      });
    };
    

    // Filtered List (computed)
    const filteredItems = computed({
      get() {
        return currentCategory.value === 0
          ? openTasks.value // All items
          : openTasks.value.filter((task) =>
            task.category === currentCategory.value &&
            task.list === currentListId.value); // Filter by category
      },
      set(newFiltered) {
        // Update the original list's order based on the filtered list
        const originalOrder = openTasks.value.map((item) => item.id);
        openTasks.value = newFiltered.concat(
          openTasks.value.filter((item) => !originalOrder.includes(item.id))
        );
      },
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

    watch(
      openTasks, 
      () => {
        updateOpenTasksSortOrder()
      }
    );

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
       // delete all tasks from removed listf
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
