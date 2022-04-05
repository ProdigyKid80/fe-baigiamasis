const baseUrl = "http://18.193.250.181:1337";

const getData = async (url) => {
  try {
    const res = await fetch(url);
    const data = await res.json();

    if (data.data.length > 0) {
      return data.data;
    }
    alert("An error has occured!");
  } catch (err) {
    alert(err);
  }
};

//--------------------- COPYRIGHT ----------------------
const date = new Date();
document.querySelector(".year").textContent = date.getFullYear();

//------------------------------------ FIRST SECTION ---------------------------------

// fetch get activities
const activitiesDiv = document.querySelector(".activities");

const displayActivities = async () => {
  const data = await getData(`${baseUrl}/api/activities`);

  data.forEach((activity) => {
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    // checkbox.id = activity.attributes.title.split(" ")[0].toLowerCase();
    checkbox.id = activity.id;
    checkbox.name = activity.attributes.title.split(" ")[0].toLowerCase();

    const label = document.createElement("label");
    label.htmlFor = activity.attributes.title.split(" ")[0].toLowerCase();
    label.textContent = activity.attributes.title;

    activitiesDiv.append(checkbox, label);
  });
};
displayActivities();

// submit chosen activities
const submitActivities = document.getElementById("btn-section-first");

submitActivities.addEventListener("click", () => {
  const checkedBoxes = Array.from(
    activitiesDiv.querySelectorAll('input[type="checkbox"]:checked')
  );

  if (checkedBoxes.length > 0) {
    let activitiesArr = [];
    checkedBoxes.forEach((checkbox) => {
      activitiesArr.push(checkbox.id);
    });
    localStorage.setItem("activities", activitiesArr);
    // display second section, hide the first
    document.querySelector(".section--first").classList.add("hidden");
    document.querySelector(".section--second").classList.remove("hidden");
  } else {
    alert("Choose at least one activity!");
  }
});

//------------------------------------ SECOND SECTION ---------------------------------

// fetch get countries
const selectCountryEl = document.getElementById("countries");

const displayCountries = async () => {
  const data = await getData(`${baseUrl}/api/countries`);

  data.forEach((country) => {
    const option = document.createElement("option");
    option.value = country.attributes.country.toLowerCase();
    option.id = `country-${country.id}`;
    option.textContent = country.attributes.country;

    selectCountryEl.append(option);
  });
};
displayCountries();

// fetch post person
const postPerson = async (personInfo) => {
  try {
    const res = await fetch(`${baseUrl}/api/people`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: personInfo }),
    });
    const data = await res.json();
    localStorage.setItem("personId", data.data.id); // set person id for the third section
    displayPersonInfo(); // fill third section with info
    console.log(data);
  } catch (err) {
    alert(err);
  }
};

document.forms.postPerson.addEventListener("submit", (e) => {
  e.preventDefault();

  const first_name = e.target.first_name.value.trim();
  const last_name = e.target.last_name.value.trim();
  const email = e.target.email.value.trim();

  let countryId = e.target.countries.options[countries.selectedIndex].id;
  countryId = countryId.slice(countryId.length - 1);

  const activities = localStorage.getItem("activities").split(",");

  const person = {
    first_name,
    last_name,
    email,
    country: countryId,
    activities,
  };

  try {
    postPerson(person);
    alert("Your info is saved");
    // display third section, hide the second
    document.querySelector(".section--second").classList.add("hidden");
    document.querySelector(".section--third").classList.remove("hidden");
  } catch (err) {
    alert(err);
  }
});

//------------------------------------ THIRD SECTION ---------------------------------

// fetch person pagal ID
const displayPersonInfo = async () => {
  const data = await getData(
    `${baseUrl}/api/people?populate=*&filters[id][$eq]=${localStorage.getItem(
      "personId"
    )}`
  );

  const personNameEl = document.getElementById("person-name");
  const personName = document.createElement("p");
  personName.textContent = data[0].attributes.first_name;
  personNameEl.append(personName);

  const personSurnameEl = document.getElementById("person-surname");
  const personSurname = document.createElement("p");
  personSurname.textContent = data[0].attributes.last_name;
  personSurnameEl.append(personSurname);

  const personEmailEl = document.getElementById("person-email");
  const personEmail = document.createElement("p");
  personEmail.textContent = data[0].attributes.email;
  personEmailEl.append(personEmail);

  const personCountryEl = document.getElementById("person-country");
  const personCountry = document.createElement("p");
  personCountry.textContent =
    data[0].attributes.country.data.attributes.country;
  personCountryEl.append(personCountry);
};

// delete person
const deletePerson = async (personId) => {
  console.log(personId);
  try {
    const res = await fetch(`${baseUrl}/api/people/${personId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const data = await res.json();
    console.log(data);
  } catch (err) {
    alert(err);
  }
};

document.getElementById("btn-delete-person").addEventListener("click", () => {
  deletePerson(localStorage.getItem("personId"));
  alert("Person info was deleted!");
  // display first section, hide the third
  document.querySelector(".section--third").classList.add("hidden");
  document.querySelector(".section--first").classList.remove("hidden");
});

// confirm details
document.getElementById("btn-section-third").addEventListener("click", () => {
  // display fourth section, hide the third
  document.querySelector(".section--third").classList.add("hidden");
  document.querySelector(".section--fourth").classList.remove("hidden");
});
