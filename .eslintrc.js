{
  rules: {
    'no-restricted-syntax': [
      'error',
      {
        selector: "TaggedTemplateExpression[tag.name='gql']",
        message: 'Do not use gql template literals in .tsx files. Import GraphQL operations from client/src/graphql.'
      }
    ],
  },
}
