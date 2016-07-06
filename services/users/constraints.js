const CREATE = {
  email: {
    presence: true,
    email: true
  },
  username: {
    presence: true,
    length: {
      minimum: 5,
      maximum: 30
    },
    format: {
      pattern: /^[A-Za-z0-9-_\^]{5,30}$/
    }
  },
  password: {
    presence: true,
    length: {
      minimum: 5,
      maximum: 30
    }
  }
};

module.exports.CREATE = CREATE;
