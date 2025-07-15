const fetch = require('node-fetch');

async function testGraphQL() {
  try {
    console.log('Testing GraphQL tennis query...');

    const query = `
      query GetTennisLeagues {
        tennisLeagues {
          id
          name
          description
          startDate
          endDate
          isActive
          createdAt
          updatedAt
        }
      }
    `;

    const response = await fetch('http://localhost:4010/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query,
      }),
    });

    const result = await response.json();
    console.log('GraphQL Response:', JSON.stringify(result, null, 2));

  } catch (error) {
    console.error('Error:', error);
  }
}

testGraphQL();
