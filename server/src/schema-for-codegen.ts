import { buildSchema } from 'graphql';
import { mergedTypeDefs } from './schema';

// Convert the GraphQL schema to a string for codegen
const schemaString = mergedTypeDefs
  .map(typeDef => {
    if (typeof typeDef === 'string') {
      return typeDef;
    }
    return typeDef.loc?.source?.body || '';
  })
  .join('\n');

export default buildSchema(schemaString);
