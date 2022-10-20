const { getCollection } = require('./utils/astraClient');

exports.handler = async (event, context) => {
  try {
    const todos = await getCollection();
    try {
      const res = await todos.find({});
      return {
        statusCode: 200,
        body: JSON.stringify(Object.values(res.data)),
      };
    } catch (getError) {
      return {
        statusCode: 400,
        body: JSON.stringify(getError.message),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify(error.message),
    };
  }
};
