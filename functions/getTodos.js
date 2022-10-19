const { getCollection } = require('./utils/astraClient');

exports.handler = async (event, context) => {
  const todos = await getCollection();
  try {
    const res = await todos.find({});
    return {
      statusCode: 200,
      body: JSON.stringify(Object.values(res.data)),
    };
  } catch (e) {
    return {
      statusCode: 400,
      body: JSON.stringify(e),
    };
  }
};
