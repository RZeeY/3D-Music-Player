module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
  },
  globals: { qq: true, TMap: true, AMap: true },
  extends: ['eslint:recommended', 'plugin:vue/essential'],
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module',
  },
  plugins: ['vue'],
  rules: {
    indent: ['error', 2], // 两格缩进
    'no-multi-spaces': ['error'],
    'block-spacing': ['error', 'always'], // 禁止或强制在代码块中开括号前和闭括号后有空格
    eqeqeq: ['error', 'always'], // 要求使用 === 和 !==
    'object-curly-spacing': ['error', 'always'], // 强制在花括号中使用一致的空格
    'spaced-comment': ['error', 'always'], // 要求或禁止在注释前有空白
    'space-infix-ops': ['error'], // 要求中缀操作符周围有空格
    'prefer-template': ['error'], // 建议使用模板字面量而非字符串连接
  },
};
