"use strict";

const books = [];
const RENDER_EVENT = "book-render";
const STORAGE_KEY = "book-app";

const id = document.getElementById("input-book-id");
const title = document.getElementById("inputBookTitle");
const author = document.getElementById("inputBookAuthor");
const publisher = document.getElementById("inputBookPublisher");
const year = document.getElementById("inputBookYear");
const isComplete = document.getElementById("inputBookIsComplete");
const search = document.getElementById("search-text");
const modal = document.querySelector("#modal");
const modalTitle = document.getElementById("modal-title");
let statusSave = null; //0 = edit; 1 = new; -1 = delete

document.addEventListener(RENDER_EVENT, function () {
  const obj = books.filter(function (v, i) {
    if (
      v.title.toLowerCase().indexOf(search.value.toLowerCase()) >= 0 ||
      v.author.toLowerCase().indexOf(search.value.toLowerCase()) >= 0 ||
      v.publisher.toLowerCase().indexOf(search.value.toLowerCase()) >= 0
    ) {
      return true;
    } else false;
  });
  if (obj.length == 0) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Tidak ada data untuk ditampilkan.",
    });
  } else {
    renderBooks(obj);
  }
});

document.addEventListener("DOMContentLoaded", function () {
  //check storage
  if (isStorageExist()) loadDataFromStorage();

  //form input
  const submitForm = document.getElementById("inputBook");
  submitForm.addEventListener("submit", function (event) {
    event.preventDefault();
    saveBook();
  });

  //form search
  const searchForm = document.getElementById("search-form");
  searchForm.addEventListener("submit", function (event) {
    event.preventDefault();
    document.dispatchEvent(new Event(RENDER_EVENT));
  });

  // reset search
  const resetSearch = document.getElementById("reset-search");
  resetSearch.addEventListener("click", function () {
    renderBooks(books);
  });

  //add new 1
  const addBook1 = document.getElementById("add-book-1");
  addBook1.addEventListener("click", function () {
    modalShow();
    clearInput(false);
  });

  //add new 2
  const addBook2 = document.getElementById("add-book-2");
  addBook2.addEventListener("click", function () {
    modalShow();
    clearInput(true);
  });
});

function isStorageExist() {
  if (typeof Storage === undefined) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Browser kamu tidak mendukung local storage!",
    });
    return false;
  }
  return true;
}

function loadDataFromStorage() {
  const serializedData = localStorage.getItem(STORAGE_KEY);

  if (!serializedData) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Belum ada data untuk ditampilkan. Silakan input data!",
    });
    return;
  }

  let data = JSON.parse(serializedData);
  if (data !== null) {
    for (const book of data) {
      books.push(book);
    }
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
}

function generateBookObject(id, title, author, publisher, year, isComplete) {
  return {
    id,
    title,
    author,
    publisher,
    year,
    isComplete,
  };
}

function saveBook() {
  //validasi tahun
  if (year.value.length != 4) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Harus empat digit!",
    });
    return;
  }

  if (id.value.length > 0) {
    // edit
    const old = findBook(parseInt(id.value));
    old.title = title.value;
    old.author = author.value;
    old.publisher = publisher.value;
    old.year = year.value;
    old.isComplete = isComplete.checked;
    statusSave = 0;
  } else {
    // baru
    const bookObject = generateBookObject(
      +new Date(),
      title.value,
      author.value,
      publisher.value,
      year.value,
      isComplete.checked
    );
    books.push(bookObject);
    statusSave = 1;
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
  saveDataStorage();
}

function clearInput(check = false) {
  id.value = "";
  title.value = "";
  author.value = "";
  publisher.value = "";
  year.value = "";
  if (check) {
    isComplete.checked = true;
  } else {
    isComplete.checked = false;
  }
}

function saveDataStorage(message = true) {
  if (isStorageExist()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(STORAGE_KEY, parsed);

    modalHide();
    if (message) {
      let text;
      if (statusSave == 0) {
        text = "Data buku berhasil diupdate";
      } else if (statusSave == 1) {
        text = "Buku baru berhasil ditambahkan";
      } else if (statusSave == -1) {
        text = "Buku berhasil dihapus";
      }
      Swal.fire({
        icon: "success",
        title: text,
        showConfirmButton: false,
        timer: 1500,
      });
    }
  }
}

function renderBooks(obj) {
  const completed = document.getElementById("table-complete");
  completed.innerHTML = "";

  const uncompleted = document.getElementById("table-uncomplete");
  uncompleted.innerHTML = "";

  for (const bookItem of obj) {
    const bookElement = makeBook(bookItem);
    if (!bookItem.isComplete) uncompleted.append(bookElement);
    else completed.append(bookElement);
  }
}

function findBookID(id) {
  for (const index in books) {
    if (books[index].id === id) {
      return index;
    }
  }
  return -1;
}

function findBook(id) {
  for (const book of books) {
    if (book.id == id) {
      return book;
    }
  }
  return null;
}

function deleteBook(id) {
  const target = findBookID(id);
  if (target === -1) return;

  Swal.fire({
    title: "Yakin mau menghapus buku ini?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya. Hapus",
    confirmCancelText: "Tidak",
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        icon: "success",
        title: "Buku Dihapus!",
        showConfirmButton: false,
        timer: 1500,
      });

      books.splice(target, 1);
      document.dispatchEvent(new Event(RENDER_EVENT));
      statusSave = -1;
      saveDataStorage();
    }
  });
}

function updateStatusBook(id, updateTo) {
  const target = findBook(id);
  if (target == null) return;

  let text;
  if (updateTo) {
    text = "Ganti status buku menjadi sudah dibaca?";
  } else {
    text = "Ganti status buku menjadi belum dibaca?";
  }
  Swal.fire({
    title: text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Ya",
    cancelButtonText: "Tidak",
  }).then((result) => {
    if (result.isConfirmed) {
      if (updateTo) {
        target.isComplete = true;
      } else {
        target.isComplete = false;
      }
      document.dispatchEvent(new Event(RENDER_EVENT));
      saveDataStorage(false);
      Swal.fire({
        icon: "success",
        title: "Status buku disimpan.",
        showConfirmButton: false,
        timer: 1500,
      });
    }
  });
}

function editBook(idBook) {
  const target = findBook(idBook);
  if (target == null) return;
  // attachObject(target);
  id.value = target.id;
  title.value = target.title;
  author.value = target.author;
  publisher.value = target.publisher;
  year.value = target.year;
  target.isComplete
    ? (isComplete.checked = true)
    : (isComplete.checked = false);

  modalShow("Edit Buku");
}

function makeBook(bookObject) {
  const tr = document.createElement("tr");

  const iTitle = document.createElement("td");
  const iAuthor = document.createElement("td");
  const iPublisher = document.createElement("td");
  const iYear = document.createElement("td");
  const iButton = document.createElement("td");

  iTitle.innerText = bookObject.title;
  iAuthor.innerText = bookObject.author;
  iPublisher.innerText = bookObject.publisher;
  iYear.innerText = bookObject.year;

  const btnGreen = document.createElement("button");
  btnGreen.classList.add("btn", "btn-green", "btn-action"); //tak perlu
  if (bookObject.isComplete) {
    btnGreen.innerHTML = "<i class='bi bi-check-circle-fill'></i>";
    btnGreen.addEventListener("click", function () {
      updateStatusBook(bookObject.id, false);
    });
  } else {
    btnGreen.innerHTML = "<i class='bi bi-check-circle'></i>";
    btnGreen.addEventListener("click", function () {
      updateStatusBook(bookObject.id, true);
    });
  }

  const btnYellow = document.createElement("button");
  btnYellow.innerHTML = "<i class='bi bi-pencil-square'></i>";
  btnYellow.classList.add("btn", "btn-yellow", "btn-action");
  btnYellow.addEventListener("click", function () {
    editBook(bookObject.id);
  });

  const btnRed = document.createElement("button");
  btnRed.innerHTML = '<i class="bi bi-trash-fill"></i>';
  btnRed.classList.add("btn", "btn-red", "btn-action");
  btnRed.addEventListener("click", function () {
    deleteBook(bookObject.id);
  });

  iButton.append(btnGreen, btnYellow, btnRed);

  tr.append(iTitle, iAuthor, iPublisher, iYear, iButton);
  tr.setAttribute("id", `book-${bookObject.id}`);

  return tr;
}

function modalShow(judul = "Input Buku Baru") {
  modal.classList.add("is-visible");
  modalTitle.innerText = judul;
}

function modalHide() {
  modal.classList.remove("is-visible");
}

document.addEventListener("keyup", (e) => {
  if (e.key == "Escape" && modal) {
    modalHide();
  }
});
