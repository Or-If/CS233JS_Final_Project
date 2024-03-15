import "./general";
const regeneratorRuntime = require("regenerator-runtime");

import toastr from "toastr";
import "toastr/toastr.scss";

class Bookshelf {
  constructor() {
    this.bookOnDisplay = {
      title: "Anciallary Justice",
      author: "Ann Leckie",
      oclc: "828142663",
    };

    this.currentUser = {
      id: NaN,
      name: "",
      booksRead: [],
      booksReading: [],
      booksToRead: [],
    };

    // When this one was added to the function that establishes all other event handlers it broke the system
    document.querySelector("#bookSearch").onsubmit = this.searchBook.bind(this);
    this.addEventHandlers();
  }

  addEventHandlers() {
    document.querySelector("#addBookRead").onclick = this.addBookToList.bind(this, "booksRead");
    document.querySelector("#addBookReading").onclick = this.addBookToList.bind(this, "booksReading");
    document.querySelector("#addBookToRead").onclick = this.addBookToList.bind(this, "booksToRead");
    document.querySelector("#changeSubmit").onclick = this.changeFormButton.bind(this);
    document.querySelector("#accountCreation").onsubmit = this.addNewUser.bind(this);
    document.querySelector("#accountSearch").onsubmit = this.searchAccount.bind(this);
  }




  //                                                                      //
  searchAccount(event) {
    event.preventDefault();
    // fires the async function with the forms username and password values
    this.checkAuthentication(username.value, password.value);
  }

  async checkAuthentication(enteredUsername, enteredPassword) {
    try {
      const request = await fetch(USER_AUTH);
      const data = await request.json();
      let isUserName = false;
      let userID = -1;
      // I tried to move to its own function but broke program in wierd way, look into later
      await data.forEach((dataIterable, i) => {
        if (dataIterable.username === enteredUsername) {
          isUserName = true;
          if (dataIterable.password === enteredPassword) {
            userID = i + 1;
          } else {
            console.log("wrong password");
          }
        }
      });
      // same as comment above
      if (userID != -1) {
        console.log("Welcome " + enteredUsername);
        // if the username and password are correct than this will load the users data onto the page
        this.loadData(userID);
      } else if (isUserName) {
        alert("Your password didn't match");
      } else {
        alert("Your username doesn't exsist");
      }
    }
    catch (error) {
      console.log(error)
    } 
  }

  async loadData(userID) {
    const request = await fetch(USER_INFO);
    const allUserData = await request.json();
    const userInfo = this.findExactUser(allUserData, userID);
    this.setAccountToPage(userInfo);
  }

  findExactUser(allUserData, userID) { 
    let userInfo;
    allUserData.forEach((dataIterable) => {
      console.log(dataIterable.id, userID);
      if (dataIterable.id === userID) {
        userInfo = dataIterable;
      }
    });
    return userInfo;
  }

  setAccountToPage(userInfo) {
    document.querySelector("#accountSearchBars").classList.add("d-none");
    document.querySelector("#accountInfo").classList.remove("d-none");
    document.querySelector("#accountName").innerHTML =
      `<p>${userInfo.name}'s <b>BookShelf</b></p>`;
    this.currentUser.id = userInfo.id;
    this.currentUser.name = userInfo.name;
    this.currentUser.booksRead = userInfo.booksRead;
    this.currentUser.booksReading = userInfo.booksReading;
    this.currentUser.booksToRead = userInfo.booksToRead;
    this.updatePageLists("booksToRead");
    this.updatePageLists("booksRead");
    this.updatePageLists("booksReading");
  }



  //                                                            //

  async addNewUser(event) { // can maybe take off async
    event.preventDefault();
    this.addUserToAuthentication(usernameCreation.value, passwordCreation.value);
    this.addUserToUsersDB(usernameCreation.value);
    
    // added these so the user won't have to type in info twice
    this.checkAuthentication(usernameCreation.value, passwordCreation.value);
    this.changeFormButton();
  }

  async addUserToAuthentication(username, password) {
    try {
      const newUserInfo = new this.userAuthenticationInfo(username, password);
      const requestOptions = {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserInfo),
      };
      const response = await fetch(USER_AUTH, requestOptions);
    }
    catch (error) {
      console.log(error)
      alert("Sorry we had trouble adding your account to our Database")
    }
  }

  userAuthenticationInfo(username, password) {
    (this.username = username);
    (this.password = password);
  }

  async addUserToUsersDB(username) {
    try {
      const newUserInfo = new this.userAccount(username);
      const requestOptions = {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUserInfo),
      };
      const response = await fetch(USER_INFO, requestOptions);
    }
    catch (error) {
      console.log(error)
      alert("Sorry we had trouble adding your account to our Database")
    }
  }

  userAccount(name) {
    (this.name = name),
    (this.booksRead = []),
    (this.booksReading = []),
    (this.booksToRead = []);
  }



  //                                             //

  searchBook(event) {
    event.preventDefault();
    console.log(bookTitle.value);
    const title = bookTitle.value.replace(/\s/, "+");
    const bookData = this.fetchBook(title);
  }

  async fetchBook(title) {
    try {
      const request = await fetch(
        `https://openlibrary.org/search.json?title=${title}`,
      );
      const data = await request.json();
      this.bookOnDisplay.title = data.docs[0].title;
      this.bookOnDisplay.author = data.docs[0].author_name[0];
      this.bookOnDisplay.oclc = data.docs[0].oclc[0]; // need to have a try and catch as not all books have an oclc
      this.setBookToPage();
    }
    catch (error) {
      console.log(error)
      alert("Your search didnt't process correctly, please check spelling")
    }
  }

  setBookToPage() {
    alert("Picture of book might take a few seconds")
    document.querySelector("#displayBook").innerHTML =
      `<div class="indvBookSearched"><h3>${this.bookOnDisplay.title}</h3> by: ${this.bookOnDisplay.author}</h><img src='https://covers.openlibrary.org/b/oclc/${this.bookOnDisplay.oclc}-M.jpg'> </div>`;
    document.querySelector("#displayButtons").classList.remove("d-none");
  }



  //                                                    //

  changeFormButton() {
    if (document.querySelector("#accountCreation").classList.contains("d-none")) {
      document.querySelector("#accountCreation").classList.remove("d-none");
      document.querySelector("#changeSubmit").innerHTML = "Already have an account";
      document.querySelector("#accountSearch").classList.add("d-none");
    } else {
      document.querySelector("#accountSearch").classList.remove("d-none");
      document.querySelector("#changeSubmit").innerHTML = "Create an account instead";
      document.querySelector("#accountCreation").classList.add("d-none");
    }
  }


  addBookToList(list) {
    const bookToPush = {
      title: this.bookOnDisplay.title,
      author: this.bookOnDisplay.author,
      oclc: this.bookOnDisplay.oclc,
    };
    console.log(list)
    console.log(this.currentUser.list)

    console.log(this.currentUser)
    console.log(this.currentUser.booksReading)
    console.log(this.currentUser.booksRead)
    console.log(this.currentUser.booksToRead)



    this.currentUser[`${list}`].push(bookToPush);
    this.updatePageLists(list);
    this.updateDataBase();
  }

  updatePageLists(list) {
    // this is to see if the user has any lists to add, if they dont than we wont add html of nothing
    if (this.currentUser[list].length > 0) {
      document.getElementById(list).innerHTML = " ";
      for (let i = 0; i < this.currentUser[list].length; i++) {
        document.getElementById(list).innerHTML +=
          `<div class="indvBook"><p><i>${this.currentUser[list][i].title}</i> <br> by: ${this.currentUser[list][i].author}</p> 
        <img width="100px" height="150px" src='https://covers.openlibrary.org/b/oclc/${this.currentUser[list][i].oclc}-M.jpg'></div>`;
      }
    }
  }

  async updateDataBase() {
    const requestOptions = {
      method: "PUT",
      mode: "cors",  // this is a copy version of the post request, i need to figure out what mode & headers do
      headers: { "Content-Type": "application/json" }, // ^^^
      body: JSON.stringify(this.currentUser),
    };
    const correctURL = (USER_INFO + "/" + this.currentUser.id)
    const response = await fetch(correctURL, requestOptions)
  }

  closeOtherDetails() {
    // If I get to it I would like this to close all other detail tags when one is picked
  }

}
window.onload = () => {
  new Bookshelf();
};
