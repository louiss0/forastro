module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [2, 'always', [
      'feat','fix','docs','style','refactor','perf','test','build','ci','chore','revert','remove','wip','merge'
    ]],
    'scope-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-max-length': [2, 'always', 64],
    'subject-full-stop': [2, 'never'],
  },
};
