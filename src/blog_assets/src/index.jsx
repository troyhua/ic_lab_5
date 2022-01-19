import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';


import '../assets/main.css';
import loading from '../assets/loading.gif';
import { blog, createActor } from '../../declarations/blog';

function App() {

  const [postContent, setPostContent] = useState("");
  const [secret, setSecret] = useState("");
  const [posts, setPosts] = useState([]);
  const [timelinePosts, setTimelinePosts] = useState([]);
  const [followed, setFollowed] = useState([]);
  const [followPosts, setFollowPosts] = useState([]);

  async function getName(principal) {
    let actor = createActor(principal);
    let name = await actor.get_name();
    return name;
  }

  async function updateFollowed() {
    console.log('start update following list')
    const followed_ = await blog.follows();
    let withName = await Promise.all(followed_.map(async (principal) => {
      let name = await getName(principal);
      return { "principal": principal, "name": name, "posts": [] };
    }));
    setFollowed(withName);
  }

  async function updateTimeline() {
    console.log('start update timeline')
    const posts_ = await blog.timeline()
    setTimelinePosts(posts_);
  }

  async function handlePost() {
    if (postContent.length <= 0) {
      alert("Empty Content");
      return;
    }
    await blog.post(postContent, secret);
    await updatePosts();
    setPostContent("")
    setSecret("");
  };

  function printTime(timestamp) {
    let a = new Date(Number(timestamp) / 1000);
    return a.toLocaleTimeString("en-US");
  }

  async function updatePosts() {
    console.log('start update my posts')
    const posts_ = await blog.posts();
    setPosts(posts_);
  };

  async function expandPost(info) {
    console.log('start expanding posts')
    let actor = createActor(info.principal);
    let posts_ = await actor.posts();
    setFollowPosts(posts_);
  }


  useEffect(() => {
    updatePosts();
    updateTimeline();
    updateFollowed();
  }, []);

  return (
    <div>
      <header><h1>Microblog for IC Entry Course 5</h1></header>
      <div style={{ paddingLeft: 20 }}>
        <h2>Say something?</h2>
        <div><textarea value={postContent} onChange={e => setPostContent(e.target.value)}></textarea></div>
        <div>Secret: <input value={secret} onChange={e => setSecret(e.target.value)}></input></div>
        <button onClick={handlePost}>Post</button>
      </div>
      <div style={{ paddingLeft: 20 }}>
        <h2> My Posts </h2>
        {posts.length == 0 ? <img src={loading}></img> : <div></div>}
        <div>{
          posts.map((post, i) => (
            <div>
              <div className="blogmeta">Time: {printTime(post.time)}, Authored By: {post.author} </div>
              <div className="blog">{post.content}</div>
            </div>
          ))
        }
        </div>
      </div>
      <div style={{ paddingLeft: 20 }}>
        <h2> Following List </h2>
        {followed.length == 0 ? <img src={loading}></img> : <div></div>}
        <div>{
          followed.map((info, i) => (
            <div>Principal: {info.principal.toText()}, Name: <button onClick={() => expandPost(info)}>{info.name}</button> </div>
          ))
        }
        </div>
        <div>
          {
            followPosts.map((post, i) => (
              <div>
                <div className="blogmeta">Time: {printTime(post.time)}, Authored By: {post.author} </div>
                <div className="blog">{post.content}</div>
              </div>
            ))
          }
        </div>
      </div>
      <div style={{ paddingLeft: 20 }}>
        <h2> Timeline </h2>
        {timelinePosts.length == 0 ? <img src={loading}></img> : <div></div>}
        <div> {
          timelinePosts.map((post, i) => (
            <div>
              <div className="blogmeta">Time: {printTime(post.time)}, Authored By: {post.author} </div>
              <div className="blog">{post.content}</div>
            </div>
          ))
        }
        </div>
      </div>
    </div>
  );

}

export default App;

ReactDOM.render(<App />, document.getElementById('app'));
