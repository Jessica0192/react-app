/*
* FILE : App.js
* PROJECT : SENG3080 - Frontend programming assignment
* PROGRAMMER : Jessica Sim
* FIRST VERSION : 2023-02-17
* DESCRIPTION :
* It allows user to input name of subreddit and the website will display 10 posts on 
  this subreddit sorted by "hot". And it allows to select favorit posts from listing and also
  user can remove favorite posts from their favorites. It stores the favorite posts' id in localStorage
  so when the browser is closed and reopened, the favorite posts' ids will be persisted 
  and it makes a another api call to get data by passing post's id
*/

import React, { useState, useEffect } from 'react';
import { Button, Label, Input } from 'reactstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as farHeart } from '@fortawesome/free-regular-svg-icons';
import "./App.css"


const App = () => {
  const [subreddit, setSubreddit] = useState('');
  const [posts, setPosts] = useState([]);
  const [favorites, setFavorites] = useState([]);

  /*
  * FUNCITON:useEffect
  * DESCRIPTION: 
  *   This useEffect hook is used to retrieve the favorite posts from local storage when the component 
  *   mounts for the first time. It runs only once, because of the empty dependency array [].
  * PARAMETERS: no parameters
  * RETURN: no returns
  */
  useEffect(() => {
    const favoritesIds = JSON.parse(localStorage.getItem('favorites') || '[]');
    // setFavorites(favoritesIds);

    favoritesIds.forEach(async (id) => {
      const response = await fetch(`https://www.reddit.com/${id}.json`);
      const json = await response.json();
      const post = json[0].data.children[0].data;
      if (post.title !== "" && post.title !== null){
        console.log(post)
        setFavorites((prevState) => [...prevState, post]);
      }
    });
  }, []);

  /*
  * FUNCITON: handleSubredditChange
  * DESCRIPTION: 
  *   This is a handler function that gets called whenever the user types in the subreddit input field. 
  *   It updates the subreddit state with the input value.
  * PARAMETERS: event: event object when subreddit input field is changed
  * RETURN: no returns
  */
  const handleSubredditChange = (event) => {
    setSubreddit(event.target.value);
  };

  /*
  * FUNCITON: handleSubmit
  * DESCRIPTION: 
  *   This is a handler function that gets called when the user submits the form by 
  *   clicking the "Search" button. It makes an API call to fetch the top 10 posts 
  *   from the subreddit and updates the posts state with the fetched data.
  * PARAMETERS: event: event object when "Search" button is clicked
  * RETURN: no returns
  */
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
  
  /*
  * FUNCITON: handleAddToFavorites
  * DESCRIPTION: 
  *   This is a handler function that gets called when the user clicks the 
  *   "Add to favorites" button on a post. It updates the favorites state with the post data
  *   and also updates the localStorage with the new favorite post.
  * PARAMETERS: post: the post object which needs to be added to favorites
  * RETURN: no returns
  */
  const handleAddToFavorites = (post) => {
    setFavorites([...favorites, post]);
    localStorage.setItem('favorites', JSON.stringify([...favorites, post.id]));
  };

  /*
  * FUNCITON: handleRemoveFromFavorites
  * DESCRIPTION: 
  *   This is a handler function that gets called when the user clicks the "Remove from favorites"
  *   button on a post. It updates the favorites state by filtering out the post with the given ID,
  *   and also updates the localStorage to remove the ID of the removed post.
  * PARAMETERS: postId: the post id which needs to be removed from favorites
  * RETURN: no returns
  */
  const handleRemoveFromFavorites = (postId) => {
    setFavorites(favorites.filter(post => post.id !== postId));
    localStorage.setItem('favorites', JSON.stringify(favorites.filter(post => post.id !== postId).map(post => post.id)));
  };

  /*
  * FUNCITON: useEffect
  * DESCRIPTION: 
  *   This useEffect hook is used to update the localStorage whenever the favorites state changes.
  * PARAMETERS: no parameters
  * RETURN: no returns
  */
  useEffect(() => {
    if(JSON.stringify(favorites.map(post => post.id))!==null)
    {
      localStorage.setItem('favorites', JSON.stringify(favorites.map(post => post.id)));
    }
  }, [favorites]);


  /*
  * FUNCITON: getPostCommentsLink
  * DESCRIPTION: 
  *   This is a utility function that takes a permalink string and returns the link 
  *   to the post's comments page on Reddit.
  * PARAMETERS: permalink: link to reddit post
  * RETURN: return full string of api endpoint getting reddit post
  */
  const getPostCommentsLink = (permalink) => {
    return `https://www.reddit.com${permalink}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ fontWeight: 'bold', color: 'lightcoral' }}>Welcome to Top 10 Reddit Posts</h1>
      <form onSubmit={handleSubmit}>
        <h6 for="subreddit">
          Subreddit:
        </h6>
        <div className="redditContainer">
          <Input
            type="text"
            id="subreddit"
            placeholder="name of subreddit"
            value={subreddit}
            onChange={handleSubredditChange}
          />
          <Button style={{ marginLeft: '2em' }} type="submit">
            Search
          </Button>
        </div>
      </form>
      <div style={{ display: 'flex', flexDirection: 'row', marginTop: '30px' }}>
        <div style={{ flex: '2' }}>
          <h2>Top 10 posts on "{subreddit}"</h2>
          {posts.length > 0 ? (
            <ul>
              {posts.map((post) => (
                <li key={post.id}>
                  {post.title} | Score: {post.score} |{' '}
                  <a href={getPostCommentsLink(post.permalink)}> Comments </a>
                  {favorites.find((favorite) => favorite.id === post.id) ? (
                    <FontAwesomeIcon
                      onClick={() => handleRemoveFromFavorites(post.id)}
                      icon={faHeart}
                      style={{ color: 'red' }}
                    />
                  ) : (
                    <FontAwesomeIcon
                      onClick={() => handleAddToFavorites(post)}
                      icon={
                        favorites.some((favorite) => favorite.id === post.id)
                          ? faHeart
                          : farHeart
                      }
                    />
                  )}
                  <hr />
                </li>
              ))}
            </ul>
          ) : (
            <p>No post found</p>
          )}
        </div>
        <div style={{ flex: '1', marginLeft: '2em' }}>
          <h2>Favorite posts</h2>
          <ul>
            {favorites.map((favorite) => (
              <li key={favorite.id}>
                {favorite.title} | Score: {favorite.score} |{' '}
                <a href={getPostCommentsLink(`/comments/${favorite.id}`)}>
                  Comments
                </a>
                <div>
                  <FontAwesomeIcon
                    onClick={() => handleRemoveFromFavorites(favorite.id)}
                    icon={faHeart}
                    style={{ color: 'red' }}
                  />
                </div>
                <hr />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
  
};

export default App;
