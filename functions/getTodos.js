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
        body: getError.message,
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      body: error.message,
    };
  }
};
