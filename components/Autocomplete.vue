<script>
export default {
  props: {
    items: {
      type: Array,
      required: false,
      default: () => [],
    },
    isAsync: {
      type: Boolean,
      required: false,
      default: false,
    },
  },

  data() {
    return {
      isOpen: false,
      results: [],
      search: "",
      isLoading: false,
      arrowCounter: 0,
    };
  },

  methods: {
    onChange() {
      // Let's warn the parent that a change was made
      this.$emit("inputSearch", this.search);

      // Is the data given by an outside ajax request?
      if (this.isAsync) {
        this.isLoading = true;
      } else {
        // Let's  our flat array
        this.filterResults();
        this.isOpen = true;
      }
    },

    filterResults() {
      // first uncapitalize all the things
      this.results = this.items.filter((item) => {
        return item.title.toLowerCase().startsWith(this.search.toLowerCase());
      });
    },
    setResult(result) {
      this.search = result.title;
      this.isOpen = false;
      this.$emit("inputSearch", this.search);
    },
    onArrowDown(evt) {
      if (this.arrowCounter < this.results.length) {
        this.arrowCounter = this.arrowCounter + 1;
      }
    },
    onArrowUp() {
      if (this.arrowCounter > 0) {
        this.arrowCounter = this.arrowCounter - 1;
      }
    },
    onEnter() {
      this.search = this.results[this.arrowCounter];
      this.isOpen = false;
      this.arrowCounter = -1;
      this.$emit("addTask", this.search);
    },
    handleClickOutside(evt) {
      if (!this.$el.contains(evt.target)) {
        this.isOpen = false;
        this.arrowCounter = -1;
      }
    },
  },
  watch: {
    items: function (val, oldValue) {
      // actually compare them
      if (val.length !== oldValue.length) {
        this.results = val;
        this.isLoading = false;
      }
    },
  },
  computed: {
    // auto focus
    /*this.$nextTick(function () {
      this.$refs.input.focus();
    });*/
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
        // auto focus
    this.$nextTick(function () {
      this.$refs.input.focus();
    });
  },
  destroyed() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>

<template>
  <div class="autocomplete">
    <input
      type="text"
      ref="input"
      @input="onChange"
      @click="isOpen = !isOpen"
      v-model="search"
      @keydown.down="onArrowDown"
      @keydown.up="onArrowUp"
      @keydown.enter="onEnter"
    />
    <ul id="autocomplete-results" v-show="isOpen" class="autocomplete-results">
      <li class="loading" v-if="isLoading">Loading results...</li>
      <li
        v-else
        v-for="(result, i) in results"
        :key="i"
        @click="setResult(result)"
        class="autocomplete-result"
        :class="{ 'is-active': i === arrowCounter }"
      >
        {{ result.title }}
      </li>
    </ul>
  </div>
</template>

<style>
.autocomplete {
  position: relative;
}

.autocomplete-results {
  position: absolute;
  background-color: white;
  z-index: 999;
  padding: 0;
  margin: 0;
  border: 1px solid #eeeeee;
  max-height: 200px;
  overflow: auto;
  width: 100%;
}

.autocomplete-result {
  list-style: none;
  text-align: left;
  padding: 4px 2px;
  cursor: pointer;
}

.autocomplete-result.is-active,
.autocomplete-result:hover {
  background-color: #4aae9b;
  color: white;
}
</style>
 
