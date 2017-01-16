module.exports = {
  "env": {
    "browser": true,
    "es6": true,
    "node": true,
    "webextensions": true
  },
  "extends": [
    "eslint:recommended"
  ],
  "plugins": [
    "promise"
  ],
  "root": true,
  "rules": {
    "promise/always-return": "off",
    "promise/avoid-new": "off",
    "promise/catch-or-return": "error",
    "promise/no-callback-in-promise": "warn",
    "promise/no-native": "off",
    "promise/no-nesting": "warn",
    "promise/no-promise-in-callback": "warn",
    "promise/no-return-wrap": "error",
    "promise/param-names": "error",

    "eqeqeq": "error",
    "indent": ["error", 2],
    "linebreak-style": ["error", "unix"],
    "no-throw-literal": "error",
    "no-warning-comments": "warn",
    "quotes": ["error", "double"],
    "radix": "error",
    "semi": ["error", "always"]
  }
};
