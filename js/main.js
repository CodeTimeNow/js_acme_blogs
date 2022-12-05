function createElemWithText(tagName = "p", text, className) {
  const newElement = document.createElement(tagName);
  newElement.textContent = text;
  if (className) newElement.className = className;
  return newElement;
}

function createSelectOptions(users) {
  if (!users) return;
  const userArray = [];
  users.forEach((user) => {
    const optionElement = document.createElement("option");
    optionElement.value = user.id;
    optionElement.textContent = user.name;
    userArray.push(optionElement);
  });
  return userArray;
}

function toggleCommentSection(postId) {
  if (!postId) return;
  const sectionElement = document.querySelector(
    `section[data-post-id='${postId}']`
  );
  if (sectionElement !== null) {
    sectionElement.classList.toggle("hide");
  }
  return sectionElement;
}

function toggleCommentButton(postId) {
  if (!postId) return;
  const buttonElement = document.querySelector(
    `button[data-post-id='${postId}']`
  );
  if (buttonElement !== null) {
    buttonElement.textContent === "Show Comments"
      ? (buttonElement.textContent = "Hide Comments")
      : (buttonElement.textContent = "Show Comments");
  }
  return buttonElement;
}

function deleteChildElements(parentElement) {
  if (!(parentElement instanceof HTMLElement)) return;
  let childElement = parentElement.lastElementChild;
  while (childElement) {
    parentElement.removeChild(childElement);
    childElement = parentElement.lastElementChild;
  }
  return parentElement;
}

function addButtonListeners() {
  const mainButtons = document.querySelectorAll("main button");
  if (mainButtons) {
    mainButtons.forEach((button) => {
      const postId = button.dataset.postId;
      button.addEventListener(
        "click",
        function (e) {
          toggleComments(e, postId);
        },
        false
      );
    });
  }
  return mainButtons;
}

function removeButtonListeners() {
  const mainButtons = document.querySelectorAll("main button");
  mainButtons.forEach((button) => {
    const postId = button.dataset.postId;
    button.removeEventListener(
      "click",
      function (e) {
        toggleComments(e, postId);
      },
      false
    );
  });
  return mainButtons;
}

function createComments(comments) {
  if (!comments) return;
  const fragment = new DocumentFragment();
  comments.forEach((comment) => {
    const article = document.createElement("article");
    const h3 = createElemWithText("h3", comment.name);
    const p1 = createElemWithText("p", comment.body);
    const p2 = createElemWithText("p", `From: ${comment.email}`);
    article.append(h3, p1, p2);
    fragment.append(article);
  });
  return fragment;
}

function populateSelectMenu(users) {
  if (!users) return;
  const selectMenu = document.getElementById("selectMenu");
  const optionElements = createSelectOptions(users);
  optionElements.forEach((option) => {
    selectMenu.append(option);
  });
  return selectMenu;
}

async function getUsers() {
  const response = await fetch("https://jsonplaceholder.typicode.com/users");
  const jsonUserData = await response.json();
  return jsonUserData;
}

async function getUserPosts(userId) {
  if (!userId) return;
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/posts?userId=${userId}`
  );
  const jsonUserData = await response.json();
  return jsonUserData;
}

async function getUser(userId) {
  if (!userId) return;
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/users/${userId}`
  );
  const jsonUserData = await response.json();
  return jsonUserData;
}

async function getPostComments(postId) {
  if (!postId) return;
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/comments?postId=${postId}`
  );
  const jsonPostData = await response.json();
  return jsonPostData;
}

async function displayComments(postId) {
  if (!postId) return;
  const sectionElement = document.createElement("section");
  sectionElement.dataset.postId = postId;
  sectionElement.classList.add("comments", "hide");
  const comments = await getPostComments(postId);
  const fragment = createComments(comments);
  sectionElement.append(fragment);
  return sectionElement;
}

async function createPosts(posts) {
  if (!posts) return;
  const fragment = document.createDocumentFragment();
  for (const post of posts) {
    const article = document.createElement("article");
    const h2 = createElemWithText("h2", post.title);
    const p1 = createElemWithText("p", post.body);
    const p2 = createElemWithText("p", `Post ID: ${post.id}`);
    const author = await getUser(post.userId);
    const p3 = createElemWithText(
      "p",
      `Author: ${author.name} with ${author.company.name}`
    );
    const p4 = createElemWithText("p", `${author.company.catchPhrase}`);
    const button = document.createElement("button");
    button.textContent = "Show Comments";
    button.dataset.postId = post.id;
    article.append(h2, p1, p2, p3, p4, button);
    const section = await displayComments(post.id);
    article.append(section);
    fragment.append(article);
  }
  return fragment;
}

async function displayPosts(posts) {
  const main = document.querySelector("main");
  const element = !posts
    ? createElemWithText(
        "p",
        "Select an Employee to display their posts.",
        "default-text"
      )
    : await createPosts(posts);
  main.append(element);
  return element;
}

function toggleComments(event, postId) {
  if (!event && !postId) return;
  event.target.listener = true;
  return [toggleCommentSection(postId), toggleCommentButton(postId)];
}

async function refreshPosts(posts) {
  if (!posts) return;
  const removeButtons = removeButtonListeners();
  const main = deleteChildElements(document.querySelector("main"));
  const fragment = await displayPosts(posts);
  const addButtons = addButtonListeners();
  return [removeButtons, main, fragment, addButtons];
}

async function selectMenuChangeEventHandler(event) {
  if (!event) return;
  const selectMenu = document.getElementById("selectMenu");
  selectMenu.setAttribute("disabled", "");
  const userId = event?.target?.value || 1;
  const posts = await getUserPosts(userId);
  const refreshPostsArray = await refreshPosts(posts);
  selectMenu.removeAttribute("disabled");
  return [userId, posts, refreshPostsArray];
}

async function initPage() {
  const users = await getUsers();
  const select = populateSelectMenu(users);
  return [users, select];
}

function initApp() {
  initPage();
  const selectMenu = document.getElementById("selectMenu");
  selectMenu.addEventListener("change", selectMenuChangeEventHandler);
}

document.addEventListener("DOMContentLoaded", (event) => {
  initApp();
});
