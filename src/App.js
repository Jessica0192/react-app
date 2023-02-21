import React, { useState, useEffect } from 'react';
import { Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import "./App.css"

const App = () => {
  const [subreddit, setSubreddit] = useState('');
  const [posts, setPosts] = useState([]);
  const [favorites, setFavorites] = useState([]);

  useEffect(() => {
    const favoritesIds = JSON.parse(localStorage.getItem('favorites') || '[]');
    setFavorites(favoritesIds);

    favoritesIds.forEach(async (id) => {
      const response = await fetch(`https://www.reddit.com/${id}.json`);
      const json = await response.json();
      const post = json[0].data.children[0].data;
      setFavorites((prevState) => [...prevState, post]);
    });
  }, []);

  const handleSubredditChange = (event) => {
    setSubreddit(event.target.value);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=10`);
    if (response.status === 404) {
      setPosts([]);
    } else {
      const json = await response.json();
      setPosts(json.data.children.map(child => child.data));
    }
  };
  
  const handleAddToFavorites = (post) => {
    setFavorites([...favorites, post]);
    localStorage.setItem('favorites', JSON.stringify([...favorites, post.id]));
  };

  const handleRemoveFromFavorites = (postId) => {
    setFavorites(favorites.filter(post => post.id !== postId));
    localStorage.setItem('favorites', JSON.stringify(favorites.filter(post => post.id !== postId).map(post => post.id)));
  };

  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites.map(post => post.id)));
  }, [favorites]);

  const getPostCommentsLink = (permalink) => {
    return `https://www.reddit.com${permalink}`;
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
          <Label style={{fontWeight:'bold'}} for="subreddit">Subreddit:</Label>
          <div className='redditContainer'>
            <Input type="text" id="subreddit" placeholder="name of subreddit" value={subreddit} onChange={handleSubredditChange}/>
            <Button style={{'marginLeft':'2em'}} type="submit">Search</Button>
          </div>
      </form>
      <br/>
      <h2>Top 10 posts on "{subreddit}"</h2>
      {posts.length > 0 ? (
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <a href={post.url}>{post.title}</a> | Score: {post.score} |{" "}
              <a href={getPostCommentsLink(post.permalink)}>  Comments</a>
              {favorites.find((favorite) => favorite.id === post.id) ? (
                <div>
                  <button onClick={() => handleRemoveFromFavorites(post.id)}>
                    Remove from favorites
                  </button>
                </div>
              ) : (
                <div>
                  <button onClick={() => handleAddToFavorites(post)}>
                    Add to favorites
                  </button>
                </div>
              )}
              <hr/>
            </li>
          ))}
        </ul>
      ) : (
        <p>No post found</p>
      )}
      <h2>Favorite posts</h2>
      <ul>
        {favorites.map(favorite => (
          <li key={favorite.id}>
            <a href={getPostCommentsLink(`/comments/${favorite.id}`)}>{favorite.title}</a> | Score: {favorite.score} | <a href={getPostCommentsLink(`/comments/${favorite.id}`)}>Comments</a>
            <div>
              <button onClick={() => handleRemoveFromFavorites(favorite.id)}>Remove from favorites</button>
            </div>
            <hr/>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default App;
