const { getCollection } = require('./utils/astraClient');

exports.handler = async (event, context) => {
  try {
    const todos = await getCollection();
    const body = JSON.parse(event.body);

    try {
      const res = await todos.update(body.id, body);
      return {
        statusCode: 200,
        body: JSON.stringify(res),
      };
    } catch (updateError) {
      return {
        statusCode: 400,
        body: JSON.stringify(updateError.message),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error.message),
    };
  }
};
