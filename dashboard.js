const baseUrl = "http://18.193.250.181:1337";
const filterCountryEl = document.getElementById("countries");

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

// random visitors number 5000 - 10000
document.getElementById("visitorNum").textContent = Math.floor(
  Math.random() * (10000 - 5000 + 1) + 5000
);

const displayStats = async () => {
  const masterData = await getData(
    `${baseUrl}/api/people?populate=*&pagination[pageSize]=500`
  );

  // display total signups num in stats
  document.getElementById("signupsNum").textContent = masterData.length;

  // display how many countries there are
  const countriesData = [
    ...new Set(
      masterData
        .map((a) => a.attributes.country.data?.attributes?.country)
        .filter(Boolean)
    ),
  ];
  document.getElementById("countriesNum").textContent = countriesData.length;

  // display how many names are not capitalized
  const notCapNames = masterData.filter(
    (a) =>
      a.attributes.first_name.charAt(0) !==
        a.attributes.first_name.charAt(0).toUpperCase() ||
      a.attributes.last_name.charAt(0) !==
        a.attributes.last_name.charAt(0).toUpperCase()
  );
  document.getElementById("notCapitalized").textContent = notCapNames.length;
};
displayStats();

const displaySignups = async (query, filter) => {
  let masterData = await getData(
    `${baseUrl}/api/people?populate=*&pagination[pageSize]=500`
  );

  if (filter) {
    masterData = await getData(
      `${baseUrl}/api/people?populate=*&pagination[pageSize]=500&filters[country][country][$containsi]=${filter}`
    );
  }

  if (query) {
    if (filter) {
      masterData = await getData(
        `${baseUrl}/api/people?populate=*&pagination[pageSize]=500&filters[$or][0][first_name][$containsi]=${query}&filters[$or][1][last_name][$containsi]=${query}&filters[$or][2][email][$containsi]=${query}&filters[country][country][$containsi]=${filter}`
      );
    } else {
      masterData = await getData(
        `${baseUrl}/api/people?populate=*&pagination[pageSize]=500&filters[$or][0][first_name][$containsi]=${query}&filters[$or][1][last_name][$containsi]=${query}&filters[$or][2][email][$containsi]=${query}`
      );
    }
  }

  const signupsDiv = document.querySelector(".signups");

  signupsDiv.innerHTML = "";

  masterData.forEach((person) => {
    const personEl = document.createElement("div");
    personEl.classList.add("person");

    const iconEl = document.createElement("div");
    iconEl.classList.add("icon");
    iconEl.textContent = `${person.attributes.first_name
      .charAt(0)
      .toUpperCase()}${person.attributes.last_name.charAt(0).toUpperCase()}`;

    const personInfoEl = document.createElement("div");
    personInfoEl.classList.add("person-info");

    const nameEl = document.createElement("h5");
    nameEl.textContent = `${person.attributes.first_name} ${person.attributes.last_name}`;

    const emailEl = document.createElement("p");
    emailEl.textContent = `${
      person.attributes.email || "Person doesn't have an email"
    }`;

    const countryEl = document.createElement("div");
    countryEl.classList.add("country");
    countryEl.textContent = `${
      person.attributes.country?.data?.attributes.country ||
      "No country to show"
    }`;

    signupsDiv.append(personEl);
    personInfoEl.append(nameEl, emailEl);
    personEl.append(iconEl, personInfoEl, countryEl);
  });
};
displaySignups();

// display country filter
const displayCountries = async () => {
  const data = await getData(`${baseUrl}/api/countries`);

  data.forEach((country) => {
    const option = document.createElement("option");
    option.value = country.attributes.country.toLowerCase();
    option.textContent = country.attributes.country;

    filterCountryEl.append(option);
  });
};
displayCountries();

// ------------------ SEARCH INPUT ------------------------
const searchField = document.querySelector(".search-block > input");

searchField.addEventListener("keyup", (e) => {
  const query = e.target.value;

  if (filterCountryEl.classList.contains("selected")) {
    displaySignups(query, filterCountryEl.value);
  } else {
    displaySignups(query, null);
  }
});

// ------------------ FILTER BY COUNTRY ------------------------
filterCountryEl.addEventListener("change", (e) => {
  if (!e.target.classList.contains("selected"))
    e.target.classList.add("selected");

  if (searchField.value) {
    displaySignups(searchField.value, e.target.value);
  } else {
    displaySignups(null, e.target.value);
  }
});
