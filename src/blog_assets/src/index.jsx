import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';


import '../assets/main.css';
import { blog, createActor } from '../../declarations/blog';

function App() {

  const [postContent, setPostContent] = useState("");
  const [secret, setSecret] = useState("");
  const [posts, setPosts] = useState([]);
  const [timelinePosts, setTimelinePosts] = useState([]);
  const [followed, setFollowed] = useState([]);


  async function getName(principal) {
    let actor = createActor(principal);
    let name = await actor.get_author();
    return name;
  }

  async function updateFollowed() {
    const followed_ = await blog.follows();
    console.log(followed_);
    let withName = await Promise.all(followed_.map(async (principal) => {
      let name = await getName(principal);
      return { "principal": principal, "name": name, "posts": [] };
    }));
    console.log(withName);
    setFollowed(withName);
  }

  async function updateTimeline() {
    const posts_ = await blog.timeline()
    setTimelinePosts(posts_);
  }

  async function handlePost() {
    if (postContent.length <= 0) {
      alert("Empty Content");
      return;
    }
    await blog.post(postContent);
    await updatePosts();
    alert("post success");
  };

  function printTime(timestamp) {
    let a = new Date(Number(timestamp) / 1000);
    return a.toLocaleTimeString("en-US");
  }

  async function updatePosts() {
    const posts_ = await blog.posts();
    setPosts(posts_);
  };

  async function expandPost(info) {
    let actor = createActor(info.principal);
    let posts = await actor.posts();
    info.posts = posts;
  }


  useEffect(() => {
    updatePosts();
    updateTimeline();
    updateFollowed();
  }, []);

  return (
    <div>
      <header><h1>Microblog for IC Entry Course 5</h1></header>
      <div>
        <h2>Say something?</h2>
        <div><textarea value={postContent} onChange={e => setPostContent(e.target.value)}></textarea></div>
        <div>
          Secret: <input value={secret} onChange={e => setSecret(e.target.value)}></input>
        </div>
        <button onClick={handlePost}>Post</button>
      </div>
      <div>
        <h2> My Posts </h2>
        <div>{
          posts.map((post, i) => (
            <div>
              <div>Time: {printTime(post.time)}, Authored By: {post.author} </div>
              <div>{post.content}</div>
            </div>
          ))
        }
        </div>
        <div>
          <h2> Following List </h2>
          <div>{
            followed.map((info, i) => (
              <div>
                <div>Principal: {info.principal.toText()}, Name: <button onClick={() => expandPost(info)}>{info.name}</button> </div>
                <div>
                  {
                    info.posts?.map((post, i) => (
                      <div>
                        <div>Time: {printTime(post.time)}, Authored By: {post.author} </div>
                        <div>{post.content}</div>
                      </div>
                    ))
                  }

                </div>
              </div>
            ))
          }
          </div>
        </div>
        <div>
          <h2> Timeline </h2>
          <div>{
            timelinePosts.map((post, i) => (
              <div>
                <div>Time: {printTime(post.time)}, Authored By: {post.author} </div>
                <div>{post.content}</div>
              </div>
            ))
          }
          </div>
        </div>
      </div>
    </div>
  );

}

export default App;

ReactDOM.render(<App />, document.getElementById('app'));
