const COHORT = "2308-ACC-ET-WEB-PT-A";
const BASE_URL = "https://fsa-crud-2aa9294fe819.herokuapp.com/api/" + COHORT;


const state = {
  events: [],
};


const form = document.querySelector("form");
const eventList = document.getElementById("eventList");


form.addEventListener("submit", async (event) => {
  event.preventDefault();
  try {
   
    const eventDate = new Date(form.eventDate.value).toISOString();
  
    await createEvent(
      form.eventName.value,
      form.eventDescription.value,
      eventDate,
      form.eventLocation.value
    );

    
    form.eventName.value = "";
    form.eventDescription.value = "";
    form.eventDate.value = "";
    form.eventLocation.value = "";
  } catch (err) {
    console.log(err);
  }
});

/***** RENDER *****/
// Sync state with the API and re-render to update UI
async function render() {
  // Fetch events data from endpoint
  await getEvents();
  // Render to update UI with new data
  renderEvents();
}

// The app contains a list of the names, dates, times, locations, and descriptions of all parties
function renderEvents() {
  const eventElements = state.events.map((event) => {
    // Format Date ISO string to readable
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString
    const eventDate = new Date(event.date).toLocaleString();
    // Each party in the list has a delete button which removes the party when clicked
    const eventCard = document.createElement("section");
    eventCard.innerHTML = `
      <div>
        <h3>${event.name}</h3>
        <p>${event.description}</p>
        <p>${eventDate}</p>
        <p>${event.location}</p>
      </div>
    `;

    // Use createElement because we need to attach an event listener
    const deleteButton = document.createElement("button");
    deleteButton.innerText = "Delete Event";
    // Append button to event card section
    eventCard.append(deleteButton);
    
    deleteButton.addEventListener("click", () => deleteEvent(event.id));

    return eventCard;
  });

  eventList.replaceChildren(...eventElements);
}

// Initial render
render();

/***** ASYNC FUNCTIONS *****/
// Fetch is used correctly to GET party data from the API.
async function getEvents() {
  try {
    const response = await fetch(`${BASE_URL}/events`);
    // Parse the response
    const json = await response.json();
    // The data stored in state is updated to stay in sync with the API
    state.events = json.data;
  } catch (err) {
    console.log(err);
  }
}

// Fetch is used correctly to POST a new party to the API.
async function createEvent(name, description, date, location) {
  try {
    const response = await fetch(`${BASE_URL}/events`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        description,
        date,
        location,
      }),
    });
    const json = await response.json();

    // Notice the error property on the response schema in the API documentation: https://fsa-crud-2aa9294fe819.herokuapp.com/api/
    if (json.error) {
      throw new Error(json.message);
    }

    // Making a call to the API doesn't actually change the client state,
    // so we'll need to refetch the data and re-render
    render();
  } catch (err) {
    console.log(err);
  }
}


async function deleteEvent(id) {
  try {
    const response = await fetch(`${BASE_URL}/events/${id}`, {
      method: "DELETE",
    });

    
    if (!response.ok) {
      throw new Error("Event could not be deleted.");
    }

    render();
  } catch (err) {
    console.log(err);
  }
}