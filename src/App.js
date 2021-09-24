import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

function TodoForm({ addTodo}){
  const[value, setValue] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    if(!value) return;
    addTodo(value);
    setValue('');
  }

  return(
    <form onSubmit={handleSubmit}>
     <label>Enter todo name </label>
     <div style = {{display:'flex'}} >
      <input
      type="text"
      className="input"
      value={value}
      onChange={e => setValue(e.target.value) }
      />
     {value !== '' ? <h4 style={{color:'black'}}>  ← Press enter </h4> : null}
     </div>
     </form>
  );
}

function Todo ({todo, index, completeTodo, removeTodo, editTodo }){
  const[editing, setEditing] = useState(false);
  const[value, editedValue]  = useState('');

  const toggleEdit = () => {
    const newEdit = !editing;
    setEditing(newEdit);
  }

  const handleSubmit = e =>{
    e.preventDefault();
    if(!value) return;
    editTodo(value, index);
    editedValue('');
    toggleEdit();
  }

  return(

    <div className="todo"
    style = {{textDecoration: (todo.isCompleted) ? 'line-through' : '' }}>

    {!editing ? todo.text : <form onSubmit={handleSubmit} > <input
    id="editInput"
    type="text"
    className="input"
    value={value}
    onChange={e => editedValue(e.target.value)}
    />
    </form>
    }
    {value !== '' && editing ? <p style={{color:'black', margin:'0', padding:'0'}}><small>  ← Press enter</small> </p> : null}
    
    <div>
    <button style={{color:'darkgreen'}} onClick={()=>completeTodo(index)}>✓</button>
    <button style={{color:'red'}} onClick={()=>removeTodo(index)}>X </button>
    <button onClick={toggleEdit} disabled={todo.isCompleted ? true:false }>✎</button>
    </div>

  </div>
);
};

function App(){
  const[todos, setTodos] = useState([])

  const[taskToggle, setTaskToggle] = useState(false);

  useEffect(() => {
   const getTasks = async () => {
      const tasksFromServer = await fetchTasks();
      setTodos(tasksFromServer);
    }

    getTasks();
  }, [])

  const fetchTasks = async () => {
    const res = await fetch('http://localhost:5000/todos')
    const data = await res.json()

    return data
  }

  const fetchTask = async (id) => {
    const res = await fetch(`http://localhost:5000/todos/${id}`)
    const data = await res.json()

    return data
  }

  const addTodo = async (text) => {

    const todo = {text, isCompleted:false}

    const res = await fetch('http://localhost:5000/todos', {
    method:'POST',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify(todo)
  })

  const data = await res.json()

  setTodos([...todos, data]);
  };

  const completeTodo = async index => {

    const todoToggled = await fetchTask(index)
    const updTodo = {...todoToggled, isCompleted: !todoToggled.isCompleted}
  
    const res = await fetch(`http://localhost:5000/todos/${index}`, {
      method:'PUT',
      headers: {
        'Content-type': 'application/json'
      },

      body: JSON.stringify(updTodo)
    })

    const data = await res.json()
    
     setTodos(
     todos.map((todo) => 
     todo.id === index ? {...todo, isCompleted: 
     data.isCompleted} : todo))
  };


  const removeTodo = async index => {
    
    await fetch(`http://localhost:5000/todos/${index}`, {
      method: 'DELETE',
    })

     setTodos(todos.filter(todo => todo.id !== index));
    
  }

  const toggleTodo = () =>{
    const toggle = !taskToggle;
    setTaskToggle(toggle);
  }

  const editTodo = async (text, index) => {

    const todoToggled = await fetchTask(index)
    const updTodo = {...todoToggled, text:text}

    await fetch(`http://localhost:5000/todos/${index}`, {
    method:'PUT',
    headers: {
      'Content-type': 'application/json'
    },
    body: JSON.stringify(updTodo)
  })
  const newTodos = await fetchTasks()

   setTodos(newTodos);
  }

  return(
    <div className="app">
    <h3 style={{textAlign:'center'}}> The best todo application </h3>
      {todos.map((todo, index) => (
        <Todo
            key={index}
            todo={todo}
            index={todos[index].id}
            completeTodo={completeTodo}
            removeTodo={removeTodo}
            editTodo={editTodo}
          />
      ))}

      {todos.length==0 ? <h3>No todos yet</h3> : null}
      <br/>

      <button onClick = {toggleTodo} className='new'> {taskToggle? 'Done': 'New Todo'}</button>
      { taskToggle ? <TodoForm addTodo = {addTodo} /> : null }
    </div>
  )
}

export default App