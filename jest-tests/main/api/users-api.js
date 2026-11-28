const { graphql } = require('./graphql-client');

const ME = 'query { me { id name email } }';

const usersApi = {
  me(options) {
    return graphql(ME, {}, options);
  },
};

module.exports = { usersApi };
