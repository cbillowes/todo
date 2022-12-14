const wrapError = (response, message) => {
  return {
    status: response.status,
    message,
    response,
  };
};

const respond = (response) => {
  if (response.status >= 500) {
    throw wrapError(response, 'Internal Server Error');
  }
  if (response.status >= 400) {
    throw wrapError(response, 'Bad Request');
  }
  return response.json();
};

const getTodos = async () => {
  const response = await fetch(`/.netlify/functions/getTodos`);
  return await respond(response);
};

const createTodo = async (todo) => {
  const body = {
    ...todo,
    created: new Date().getTime(),
  };
  const response = await fetch('/.netlify/functions/createTodo', {
    body: JSON.stringify(body),
    method: 'POST',
  });
  return {
    ...(await respond(response)),
    ...body,
  };
};

const updateTodo = async (todo) => {
  const body = {
    ...todo,
    modified: new Date().getTime(),
  };
  const response = await fetch('/.netlify/functions/updateTodo', {
    body: JSON.stringify(body),
    method: 'PUT',
  });
  return {
    ...(await respond(response)),
    ...body,
  };
};

const deleteTodo = async (id) => {
  const response = await fetch('/.netlify/functions/deleteTodo', {
    body: JSON.stringify({ id }),
    method: 'POST',
  });
  return respond(response);
};

const api = {
  getTodos,
  createTodo,
  deleteTodo,
  updateTodo,
};

export default api;
