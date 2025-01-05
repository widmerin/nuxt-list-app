<template>
  <div class="list-item"  @mousedown="handleItemMouseDown">
    <div class="list-item-label">
      <label>
        <input
          type="checkbox"
          v-model="completed"
          @change="doneEdit"
        /><span></span>
      </label>
      <span
        v-if="!editing"
        @click="editTask"
        :class="{ completed: completed }"
        > {{ task.title }} </span
      >
      <input
        v-else
        class="list-item-edit"
        type="text"
        v-model="title"
        @blur="doneEdit"
        @keyup.enter="doneEdit"
        @keyup.esc="cancelEdit"
        v-focus
      />
    </div>
    <select 
      class="list-item-category-select"
      v-model="task.category"
      @change="doneEdit"
      dir="rtl"
    >
      <option selected value=""></option>
      <option
        v-for="(category) in categories"
        v-bind:value="category.id"
        :key="category.id"
      >
        {{ category.name }} 
      </option>
    </select>
    <span class="list-item-drag drag-handle" v-if="!completed" @mousedown="handleDragStart">
      &#x21d5; <!-- Example drag icon -->
    </span>
    <div class="list-item-remove" v-if="completed" @click="removeTask">&times;</div>
  </div>
</template>

<script>
export default {
  props: {
    task: {
      type: Object,
      required: true,
    },
    index: {
      type: Number,
      required: true,
    },
    categories: {
      type: Array,
    },
  },
  data() {
    return {
      id: this.task.id,
      title: this.task.title,
      completed: this.task.completed,
      editing: this.task.editing,
      category: this.task.category,
      beforeEditCache: "",
      editCategory: false,
    };
  },
  directives: {
    focus: {
      inserted: function (el) {
        el.focus();
      },
    },
  },
  methods: {
    handleDragStart() {
        console.log("drage")
    },
    cancelEdit() {
      this.editing = false;
      this.title = this.beforeEditCache;
    },
    async doneEdit() {
      if (this.title.trim() == "") {
        this.title = this.beforeEditCache;
      }
      const task = {
          id: this.task.id,
          title: this.title,
          completed: this.completed,
          category: this.task.category ?  this.task.category : null,
          sortOrder: this.completed ? null : this.task.sortOrder,
      }
      const { $updateTask } = useNuxtApp()
      await $updateTask(task)
      this.editing = false;
      this.editCategory = false;
    },
    editTask() {
      this.beforeEditCache = this.title;
      this.editing = true;
    },
    getCategoryName(id) {
      if (id != 0) {
        const categories = this.categories.filter(
          (category) => category.id == id
        );
        if (categories[0]) {
          return categories[0].name;
        }
      }
    },
    async removeTask() {
       const { $deleteTask } = useNuxtApp()
       await $deleteTask(this.id)
    },
  },
};
</script>

<style lang='scss'>
.list-item {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 10px;
  border: 1px solid #9e9e9e;
  border-radius: 5px;
  margin: 2px 0;
  background-color: #fff;
  color: #48426d;
  font-size: 16px;

  &-label {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: stretch;
    label {
      padding-top: 2px;
      padding-left: 5px;
    }
    [type="checkbox"] + span:not(.lever) {
      padding-left: 30px;
    }
  }
  &-drag {
    padding: 1px 10px 0;
  }
  &-edit {
    height: 2em;
    border-bottom: 2px solid #48426d !important;
    max-width: 250px;
  }
  &-category {
    &-select {
      display: inline-block;
      text-transform: uppercase;
      font-size: 12px;
      padding: 0 5px;
      color: #48426d;
      border: none;
      max-width: 70px;
      // remove dropdown icon
      -webkit-appearance: none;
      -moz-appearance: none;
      text-indent: 1px;
      text-overflow: "";
    }
  }
  &-remove {
    cursor: pointer;
    padding: 5px;
  }
}
.tasks-active {
  .list-item {
    .list-item-label {
      [type="checkbox"] + span:not(.lever):before {
        top: 2px;
      }
    }
  }
}
</style>
