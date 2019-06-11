import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import client from './services/graphql/apollo-client'
import { ApolloProvider } from 'react-apollo';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';

const GET_BLOG = gql`
  {
    blog(id: 1) {
      title
      content
    }
  }
`;
const Blog = ({ onDogSelected }) => (
  <Query query={GET_BLOG}>
    {({ loading, error, data }) => {
      console.log('yoo');
      console.log(data);
      console.log(error);
      if (loading) return 'Loading...';
      if (error) return `Error! ${error.message}`;

      return (
        <select name="dog" onChange={onDogSelected}>
          {data.blog.map(blog => (
            <option key={blog.title} value={blog.content}>
              {blog.content}
            </option>
          ))}
        </select>
      );
    }}
  </Query>
);

ReactDOM.render(
  <ApolloProvider client={client}>
    <Blog />
    <App />
  </ApolloProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
