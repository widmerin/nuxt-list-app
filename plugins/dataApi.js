export default defineNuxtPlugin(nuxtApp => {
    const supabase = useSupabaseClient()
    async function fetchData(from){

      try {
        const { data } = await supabase.from(from).select('*');
        if (data && data.length > 0) {
          return data
        }
        return []
      }
      catch (err) {
        console.error('Error Fetching data', err)
      }
    }

    async function fetchTasks(list){
      if(list === undefined) {
        list = 1
      }

      try {
        const { data } = await supabase.from("Tasks").select('*').eq('list', list).eq('completed', 'false').order('created')
        if (data && data.length > 0) {
          return data
        }
        return []
      }
      catch (err) {
        console.error('Error Fetching data', err)
      }
    }


    async function fetchCompletedTasks(list){
      if(list === undefined) {
        list = 1
      }
      try {
        const { data } = await supabase.from("Tasks").select('*').eq('list', list).eq('completed', 'true').limit('10').order('created', { ascending: false })
        if (data && data.length > 0) {
          return data
        }
        return []
      }
      catch (err) {
        console.error('Error Fetching data', err)
      }
    }

    async function createCategory(name) {
      const data = {
        name: name,
      }
      create('Categories', data)
    }

    async function createTask(data) {
      create('Tasks', data)
    }

    async function createList(name) {
      const data = {
        name: name,
      }
      create('Lists', data)
    }

    async function create(from, input) {
      try {
        const { data, error } = await supabase
          .from(from)
          .insert(input)
    
        if (error) {
          console.error('There was an error inserting', error)
          return null
        }
        console.log("created " + JSON.stringify(data));
        return data
      } catch (err) {
        console.error('Unknown problem inserting to db', err)
        return null
      }
    }


    async function deleteCategory(id) {
      const { data, error } = await supabase
      .from('Categories')
      .delete()
      .eq('id', id)
    }
    
    async function deleteList(id) {
      const { data, error } = await supabase
      .from('Lists')
      .delete()
      .eq('id', id)
    }
    
    async function deleteTask(id) {
      console.log("delete task")
      console.log(id)
      const { data, error } = await supabase
      .from('Tasks')
      .delete()
      .eq('id', id)
    }


    async function updateTask(task) {
      try {
        const { data, error } = await supabase
        .from('Tasks')
        .update(task)
        .eq('id', task.id)
    
      if (error) {
        console.error('There was an error updateing task', error)
        return null
      }
      console.log("updated task" + JSON.stringify(task));
      return data
    } catch (err) {
      console.error('Unknown problem inserting to db', err)
      return null
    }
    }
    return {
        provide: {
            fetchData,
            fetchTasks,
            fetchCompletedTasks,
            createCategory,
            deleteCategory,
            createList,
            deleteList,
            createTask,
            deleteTask,
            updateTask
        }
    }
})