import './general';
const regeneratorRuntime = require("regenerator-runtime");

import toastr from 'toastr';
import 'toastr/toastr.scss';


class Bookshelf {
  constructor() {
    // these are used for pulling up userInfo
    this.allData; // I can prob change this one to scoped variable, will mess with later..... possible with other 2 as well
    this.userID;  
    this.userInfo;

    // I want there to be 3 arrays that we will add books into depending on users wants
    this.UIBooksRead = []
    this.UIBooksReading = []
    this.UIBooksToRead = []

    this.accountForm = document.querySelector('#accountSearch')
    this.accountForm.onsubmit = this.searchAccount.bind(this)

    this.creatNewAccountForm = document.querySelector('#accountCreation')
    this.creatNewAccountForm.onsubmit = this.addNewUser.bind(this)

    // I might use a few more document slectors to add events onto page, but not sure atm
    this.UIBookSearch = document.querySelector('#bookSearch')
    this.UIBookSearch.onsubmit = this.searchBook.bind(this)
    this.bookOnDisplay = {
      title: "Anciallary Justice",
      author: "Ann Leckie",
      oclc: "828142663",
    }
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
    const request = await fetch(USER_AUTH)
    const data = await request.json();
    let isUserName = false;
    this.userID = -1;

    // I tried to move to its own function but broke program in wierd way, look into later
    await data.forEach((dataIterable, i) => {
      if(dataIterable.username === enteredUsername) {
        isUserName = true;
        if(dataIterable.password === enteredPassword) {
          this.userID = (i + 1);
        } else {
          console.log("wrong password")
        }
      }
    })
    // same as comment above
    if(this.userID != -1) {
      console.log('Welcome ' + enteredUsername)
    } else if(isUserName) {
      alert("Your password didn't match")
    } else {
      alert("Your username doesn't exsist")
    }
  }

  async loadData() {
    const request = await fetch(USER_INFO);
    this.allData = await request.json();
    this.findExactUser()
    this.setAccountToPage()
  }

  findExactUser() {
    this.allData.forEach((dataIterable, i) => { 
      console.log(dataIterable.id, this.userID)
      if(dataIterable.id === this.userID) {
        this.userInfo = dataIterable;
      }
    })
  }

  setAccountToPage() {
    document.querySelector("#accountInfo").innerHTML = 
      `<p>Hello ${this.userInfo.name} I hope you are enjoying my website!`
  }
  //                                                                           This would encompass all script related to finding user
 






  async addNewUser(event) {
    event.preventDefault();
    this.addUserToAuthentication(usernameCreation.value, passwordCreation.value)
    this.addUserToUsers(usernameCreation.value)
  }

  async addUserToAuthentication(username, password) {
    const newUserInfo = new this.userAuthenticationInfo(username, password)
    const requestOptions = {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUserInfo)
    };
    const response = await fetch(USER_AUTH, requestOptions)
  }

  async addUserToUsers(username) {
    const newUserInfo = new this.userAccount(username)
    const requestOptions = {
      method: 'POST',
      mode: 'cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newUserInfo)
    };
    const response = await fetch(USER_INFO, requestOptions)
  }

  userAuthenticationInfo(username, password) {
    this.username = username,
    this.password = password
  }
  userAccount(name) {
    this.name = name,
    this.booksRead = [],
    this.booksReading = [],
    this.booksToRead = []
  }






  searchBook(event) {
    event.preventDefault();
    console.log(bookTitle.value)
    const title = bookTitle.value.replace(/\s/, '+')
    const bookData = this.fetchBook(title)
  }

  async fetchBook(title) {
    const request = await fetch(`https://openlibrary.org/search.json?title=${title}`)
    const data = await request.json()
      this.bookOnDisplay.title = data.docs[0].title
      this.bookOnDisplay.author = data.docs[0].author_name[0]
      this.bookOnDisplay.oclc = data.docs[0].oclc[0] // need to have a try and catch as not all books have an oclc
      this.setBookToPage();
  }

  setBookToPage() {
    document.querySelector('#displayBook').innerHTML = 
      `<p>${this.bookOnDisplay.title} by: ${this.bookOnDisplay.author}</p><img src='https://covers.openlibrary.org/b/oclc/${this.bookOnDisplay.oclc}-M.jpg'>`
  }
}
window.onload = () => {new Bookshelf}