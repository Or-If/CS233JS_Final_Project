import "./general";
const regeneratorRuntime = require("regenerator-runtime");

import toastr from "toastr";
import "toastr/toastr.scss";

class Bookshelf {
  constructor() {
    //                                                                         delete these and implement into code better
    this.allData; // I can prob change this one to scoped variable, will mess with later..... possible with other 2 as well
    this.userID;
    this.userInfo;

    //                                                                         Add these all to a single function
    this.accountForm = document.querySelector("#accountSearch");
    this.accountForm.onsubmit = this.searchAccount.bind(this);

    this.creatNewAccountForm = document.querySelector("#accountCreation");
    this.creatNewAccountForm.onsubmit = this.addNewUser.bind(this);

    document.querySelector("#addBookRead").onclick = this.addBookToList.bind(
      this,
      "booksRead",
    );
    document.querySelector("#addBookReading").onclick = this.addBookToList.bind(
      this,
      "booksReading",
    );
    document.querySelector("#addBookToRead").onclick = this.addBookToList.bind(
      this,
      "booksToRead",
    );

    //this.changeButton = document.querySelector(".changeSubmit") // this wasnt working for some reason
    this.changeButton = document.querySelector("#changeSubmit");
    this.changeButton.onclick = this.changeFormButton.bind(this);

    // I might use a few more document slectors to add events onto page, but not sure atm
    this.UIBookSearch = document.querySelector("#bookSearch");
    this.UIBookSearch.onsubmit = this.searchBook.bind(this);

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
  }

  //                                               I might put this chunk of code into a seperate js file to make tidy
  searchAccount(event) {
    event.preventDefault();
    console.log(username.value);
    console.log(password.value);
    // fires the async function with the forms username and password values
    this.checkAuthentication(username.value, password.value);
    this.loadData();
  }

  async checkAuthentication(enteredUsername, enteredPassword) {
    const request = await fetch(USER_AUTH);
    const data = await request.json();
    let isUserName = false;
    this.userID = -1;

    // I tried to move to its own function but broke program in wierd way, look into later
    await data.forEach((dataIterable, i) => {
      if (dataIterable.username === enteredUsername) {
        isUserName = true;
        if (dataIterable.password === enteredPassword) {
          this.userID = i + 1;
        } else {
          console.log("wrong password");
        }
      }
    });
    // same as comment above
    if (this.userID != -1) {
      console.log("Welcome " + enteredUsername);
    } else if (isUserName) {
      alert("Your password didn't match");
    } else {
      alert("Your username doesn't exsist");
    }
  }

  async loadData() {
    const request = await fetch(USER_INFO);
    this.allData = await request.json();
    this.findExactUser();
    this.setAccountToPage();
  }

  findExactUser() {
    this.allData.forEach((dataIterable, i) => {
      console.log(dataIterable.id, this.userID);
      if (dataIterable.id === this.userID) {
        this.userInfo = dataIterable;
      }
    });
  }

  setAccountToPage() {
    document.querySelector("#accountName").innerHTML =
      `${this.userInfo.name}'s <b>BookShelf</b>`;
    this.currentUser.id = this.userInfo.id;
    this.currentUser.name = this.userInfo.name;
    this.currentUser.booksRead = this.userInfo.booksRead;
    this.currentUser.booksReading = this.userInfo.booksReading;
    this.currentUser.booksToRead = this.userInfo.booksToRead;
    this.updatePageLists("booksToRead");
    this.updatePageLists("booksRead");
    this.updatePageLists("booksReading");
  }
  //                                                                           This would encompass all script related to finding user

  async addNewUser(event) {
    event.preventDefault();
    this.addUserToAuthentication(
      usernameCreation.value,
      passwordCreation.value,
    );
    this.addUserToUsersDB(usernameCreation.value);
  }

  async addUserToAuthentication(username, password) {
    const newUserInfo = new this.userAuthenticationInfo(username, password);
    const requestOptions = {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUserInfo),
    };
    const response = await fetch(USER_AUTH, requestOptions);
  }

  async addUserToUsersDB(username) {
    const newUserInfo = new this.userAccount(username);
    const requestOptions = {
      method: "POST",
      mode: "cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUserInfo),
    };
    const response = await fetch(USER_INFO, requestOptions);
  }

  userAuthenticationInfo(username, password) {
    (this.username = username), (this.password = password);
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
    const request = await fetch(
      `https://openlibrary.org/search.json?title=${title}`,
    );
    const data = await request.json();
    this.bookOnDisplay.title = data.docs[0].title;
    this.bookOnDisplay.author = data.docs[0].author_name[0];
    this.bookOnDisplay.oclc = data.docs[0].oclc[0]; // need to have a try and catch as not all books have an oclc
    this.setBookToPage();
  }

  setBookToPage() {
    document.querySelector("#displayBook").innerHTML =
      `<p>${this.bookOnDisplay.title} by: ${this.bookOnDisplay.author}</p><img src='https://covers.openlibrary.org/b/oclc/${this.bookOnDisplay.oclc}-M.jpg'>`;
    document.querySelector("#displayButtons").classList.remove("d-none");
  }

  //                                                    //

  changeFormButton() {
    if (this.creatNewAccountForm.classList.contains("d-none")) {
      this.creatNewAccountForm.classList.remove("d-none");
      this.changeButton.innerHTML = "Already have an account";
      this.accountForm.classList.add("d-none");
    } else {
      this.accountForm.classList.remove("d-none");
      this.changeButton.innerHTML = "Create an account instead";
      this.creatNewAccountForm.classList.add("d-none");
    }
  }

  //                                                      //

  addBookToList(list) {
    console.log(this.currentUser);
    console.log(this.bookOnDisplay);
    console.log(list);
    const bookToPush = {
      title: this.bookOnDisplay.title,
      author: this.bookOnDisplay.author,
      oclc: this.bookOnDisplay.oclc,
    };
    this.currentUser[list].push(bookToPush);
    this.updatePageLists(list);
    this.pushToDataBase(list);
    // push on to the DB
  }

  updatePageLists(list) {
    console.log(this.currentUser[list].length); // this is to see if the user has any lists to add, if they dont than we wont add html of nothing
    if (this.currentUser[list].length > 0) {
      document.getElementById(list).innerHTML = " ";
      for (let i = 0; i < this.currentUser[list].length; i++) {
        document.getElementById(list).innerHTML +=
          `<p>${this.currentUser[list][i].title} <br> by: ${this.currentUser[list][i].author}</p> 
        <img width="100px" height="150px" src='https://covers.openlibrary.org/b/oclc/${this.currentUser[list][i].oclc}-M.jpg'>`;
      }
    }
  }

  async pushToDataBase(list) {}
}
window.onload = () => {
  new Bookshelf();
};
