requirejs.config({
  paths: {
    "_": "../../bower_components/lodash/dist/lodash"
  },

  shim: {
    "zepto": {
      "exports": '$'
    }
  }
});