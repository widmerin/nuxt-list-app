<template>
  <div class="list-footer">
    <!-- overlay -->
    <div
      class="list-footer-overlay"
      v-if="showModal"
      @click="closeModal()"
    ></div>

    <!-- modal -->
    <div class="list-footer-modal" v-if="showModal">
      <div class="list-footer-modal-form">
        <button class="list-footer-modal-close" @click="closeModal()">x</button>
        <h5>New Task</h5>
        <Autocomplete :items="suggestions" @inputSearch="input" @addTask="addTask"/>
        <select
          class="list-footer-modal-category"
          v-model="newCategory"
          placeholder="Add Task..."
          v-on:keyup.enter="addTask"
        >
          <option value="" disabled selected>-- Category --</option>
          <option
            v-for="(category, index) in categories"
            v-bind:value="category.id"
            :key="index"
          >
            {{ category.name }}
          </option>
        </select>
        <button class="waves-effect waves-light btn" @click="addTask">
          Add Task
        </button>
      </div>
    </div>
    <button
      class="waves-effect waves-light btn list-footer-add-btn"
      @click="openModal()"
    >
      +
    </button>
  </div>
</template>

<script>

export default {
  props: {
    categories: {
      type: Array,
      required: true,
    },
    suggestions: {
      type: Array,
      required: true,
    },
    currentListId: {
      type: Number,
      required: true,
    },

  },
  data() {
    return {
      newTask: "",
      newCategory: "",
      showModal: false,
    };
  },
  methods: {
    openModal() {
      this.showModal = true;
      this.newTask = "";
      this.newCategory = "";
      window.scrollTo(0,0);
    },
    closeModal() {
      this.showModal = false;
    },
    async addTask() {
      if (this.newTask.trim().length == 0) {
        return;
      }
       const data = {
          title: this.newTask,
          list: this.currentListId,
          completed: false,
          category:  this.newCategory ?  this.newCategory : null
      }

      const { $createTask } = useNuxtApp()
      await $createTask(data)
    
      this.newTask = "";
      this.newCategory = "";
      this.showModal = false;
      this.$emit("refreshedData");
    },
    input(value) {
      this.newTask = value;
    },
  },
};
</script>

<style lang='scss'>
.list-footer {
  display: flex;
  align-items: center;
  justify-content: center;

  &-add-btn {
    position: fixed;
    bottom: 15px;
    right: 15px;
    text-align: center;
    width: 60px;
    height: 60px;
    border-radius: 100%;
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 30px;
    padding-bottom: 4px;
  }

  &-overlay {
    position: fixed;
    z-index: 9998;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
  }

  &-modal {
    position: absolute;
    top: 50px;
    width: 300px;
    min-height: 250px;
    z-index: 9999;
    margin: 0 auto;
    background-color: #fff;
    &-close {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 5px 10px;
      background: none;
      border: none;
      font-weight: bold;
      cursor: pointer;
    }
    &-category {
      display: inline-block;
    }
    &-form {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 15px;
      align-items: stretch;
      justify-content: space-between;
      height: 250px;
    }
    input[type="text"],
    select {
      box-sizing: border-box;
      padding-left: 10px;
      border: 1px solid;
      &:focus {
        border: 2px solid #26a69a;
      }
    }
  }
}
</style>
