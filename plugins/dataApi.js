import { createClient } from '@supabase/supabase-js'
const supabase = createClient(process.env.SUPABASE_API_URL, process.env.SUPABASE_APP_KEY) 

export default function (context, inject) {

    inject("dataApi", {
      getLists,
      getCategories,
      getTasks,
      createCategory,
      createTask,
      createList,
      deleteCategory,
      deleteTask,
      deleteList,
      updateTask
    });
  
    async function getLists() {
      return await getData('Lists')
    }
    async function getCategories() {
      return await getData('Categories')
    }
      
    async function getTasks() {
      return await getData('Tasks')
    }

    async function getData(from){
      try {
        let { data } = await supabase.from(from).select('*');
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
      return data
    } catch (err) {
      console.error('Unknown problem inserting to db', err)
      return null
    }
    }

  }