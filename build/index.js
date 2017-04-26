'use strict';

var _require = require('pug'),
    render = _require.render;

var _require2 = require('babel-core'),
    transform = _require2.transform;

var _require3 = require("lodash"),
    camelCase = _require3.camelCase;

module.exports = function () {
  return {
    visitor: {
      TaggedTemplateExpression: function TaggedTemplateExpression(path, state) {
        if (path.node.tag.name === 'pug') {
          (function () {
            var raw = path.node.quasi.quasis[0].value.raw;

            var splitedRaw = raw.split('\n').filter(function (str) {
              return str !== '' && str.match(/^\s*$/g) === null;
            });
            var rootIndent = /^\s*/.exec(splitedRaw[0])[0];
            var fixedRaw = splitedRaw.map(function (raw) {
              var spaceRegExp = new RegExp('^' + rootIndent);
              return raw.replace(spaceRegExp, '');
            }).join('\n');
            var html = render(fixedRaw, {
              basedir: process.cwd()
            }).replace(/"\{/g, '{').replace(/class="([^"]+)/g, function(match, p1) {
              return `className={styles.${camelCase(p1)} || '${camelCase(p1)}'}`;
            }).replace(/for="/g, 'htmlFor="').replace(/\}"/g, '}').replace(/\};"/g, '}').replace(/\\\`/g, '`');
            var _transform = transform(html, {
              presets: ['react']
            }),
                ast = _transform.ast;

            path.replaceWithMultiple(ast.program.body);
          })();
        }
      }
    }
  };
};