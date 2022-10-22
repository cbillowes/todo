import React, { useEffect, useState, useRef } from 'react';
import api from './utils/api';
import { v4 as uuid } from 'uuid';
import './styles.css';

const getTodos = async (setErrors) => {
  try {
    const todos = await api.getTodos();
    return todos.sort((x, y) => y.created - x.created);
  } catch (e) {
    setErrors(`We tried to get your items but ${e.message}`);
  }
};

const addTodo = async (text, setErrors) => {
  try {
    const todo = {
      id: uuid(),
      completed: false,
      text,
    };
    const newTodo = await api.createTodo(todo);
    return { ...todo, id: newTodo.documentId, created: newTodo.created };
  } catch (e) {
    setErrors(`We can't add this item but ${e.message}`);
  }
};

const deleteTodo = async (id, setErrors) => {
  try {
    const item = await api.deleteTodo(id);
    return item.documentId;
  } catch (e) {
    setErrors(`We can't delete this item but ${e.message}`);
  }
};

const updateTodo = async (todo, setErrors) => {
  try {
    const item = await api.updateTodo(todo);
    return {
      id: item.documentId,
      ...item,
    };
  } catch (e) {
    setErrors(`We can't update this item but ${e.message}`);
  }
};

  const dtFormat = new Intl.DateTimeFormat('en-MU', {
    timeZone: 'UTC',
    weekday: 'short',
    year: '2-digit',
    month: 'long',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
  const created = dtFormat.format(new Date(todo.created));
  const modified = todo.modified && dtFormat.format(new Date(todo.modified));
  return (
    <div className="flex items-center text-2xl py-6 px-4 bg-slate-800 border-slate-900 border my-1">
      <button
        aria-label="Delete item"
        className="mr-2 hover:text-red-500"
        onClick={async () => {
          const id = await deleteTodo(todo.id, setErrors);
          onDelete && onDelete(id);
        }}
      >
        &times;
      </button>{' '}
      <label
        aria-label={todo.text}
        className="flex items-center cursor-pointer w-full"
      >
        <input
          type="checkbox"
          value={todo.id}
          checked={todo.completed}
          onChange={async () => {
            const toggled = await updateTodo(
              {
                ...todo,
                ...{ completed: !todo.completed },
              },
              setErrors,
            );
            onUpdate && onUpdate(toggled);
          }}
          className="w-8 h-8 mr-2 text-green-500 focus:ring-green-400 focus:ring-opacity-25 border border-gray-300 rounded cursor-pointer"
        />
        <div className="flex justify-between w-full items-center">
          <span
            className={`${todo.completed ? 'line-through text-slate-700' : ''}`}
          >
            {todo.text}
          </span>
          <span className="text-xs text-right leading-loose">
            {created && <div>Created on {created}</div>}
            {modified && (
              <div className="text-slate-700">Changed on {modified}</div>
            )}
          </span>
        </div>
      </label>
    </div>
  );
};

const App = () => {
  const [todos, setTodos] = useState([]);
  const [item, setItem] = useState('');
  const [errors, setErrors] = useState('');
  const form = useRef();
  const textbox = useRef();

  const pushToTodos = (todos) => {
    setTodos(todos.sort((x, y) => y.created - x.created));
  };

  useEffect(() => {
    const loadTodos = async () => {
      pushToTodos(await getTodos(setErrors));
    };
    loadTodos();
  }, []);

  return (
    <div className="bg-slate-700 text-white min-h-screen">
      <div className="mx-auto py-8 max-w-4xl">
        <h1 className="uppercase font-bold text-slate-300 mb-1">
          ✅ My awesome TO-DO list
        </h1>
        <form
          ref={form}
          className="flex"
          onSubmit={(e) => {
            e.preventDefault();
            textbox.current.value = '';
          }}
        >
          <input
            ref={textbox}
            aria-label="Enter a TO-DO task here"
            type="text"
            placeholder="What to do?"
            onChange={(e) => setItem(e.target.value)}
            className="bg-slate-900 text-white w-full py-6 px-4 text-5xl shadow-lg border-none truncate"
          />
          <button
            className="bg-green-800 text-white w-56 text-5xl shadow-lg"
            onClick={async () => {
              const todo = await addTodo(item, setErrors);
              pushToTodos([...todos, todo]);
            }}
          >
            Add
          </button>
        </div>
        {errors && (
          <div className="bg-red-700 text-red-200 py-2 text-center mb-6">
            <strong className="font-bold">Something broke: </strong>
            {errors}
          </div>
        )}
        {todos && todos.length === 0 && (
          <div className="py-6 px-4 text-slate-300">
            There is nothing to do right now. Add something to do ☝️.
          </div>
        )}
        {/* https://play.tailwindcss.com/TvjY5NyGgv */}
        {todos?.length > 0 &&
          todos.map((todo) => {
            return (
              <Todo
                key={todo.id}
                todo={todo}
                setErrors={setErrors}
                onDelete={(id) => pushToTodos(todos.filter((t) => t.id !== id))}
                onUpdate={(toggled) =>
                  pushToTodos(
                    todos.map((t) => {
                      return t.id === toggled.id ? toggled : t;
                    }),
                  )
                }
              />
            );
          })}
      </div>
    </div>
  );
};

export default App;
