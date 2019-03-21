// Copyright IBM Corp. 2019. All Rights Reserved.
// Node module: @loopback/graphql
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {ApolloServer} from 'apollo-server-express';
import * as express from 'express';
import * as path from 'path';
import {buildSchema} from 'type-graphql';
import {RecipeResolver} from './controllers/recipe-resolver';

export async function main(
  options: {port?: number; host?: string} = {port: 4000},
) {
  // build TypeGraphQL executable schema
  const schema = await buildSchema({
    resolvers: [RecipeResolver],
    // automatically create `schema.gql` file with schema definition in current folder
    emitSchemaFile: path.resolve(__dirname, 'schema.gql'),
  });

  // Create GraphQL server
  const graphQLServer = new ApolloServer({
    schema,
    // enable GraphQL Playground
    playground: true,
  });

  const app = express();
  graphQLServer.applyMiddleware({app});

  // Start the server
  return app.listen(options.port || 0, options.host || '');
}

if (require.main === module) {
  main().then(() => {
    console.log(`Server ready at http://localhost:4000/graphql`);
  });
}
