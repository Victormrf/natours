(() => {
  // public/js/mapbox.js
  var displayMap = (locations) => {
    mapboxgl.accessToken = "pk.eyJ1IjoidmljdG9ybXJmIiwiYSI6ImNsd2p3ZG92NTAwMjQycXFyNmRsYmFiOHYifQ.hXM5UlkNhQgzOz-cJyrvCw";
    var map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/light-v10",
      scrollZoom: false
    });
    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach((loc) => {
      const el = document.createElement("div");
      el.className = "marker";
      new mapboxgl.Marker({
        element: el,
        anchor: "bottom"
      }).setLngLat(loc.coordinates).addTo(map);
      new mapboxgl.Popup({
        offset: 30
      }).setLngLat(loc.coordinates).setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`).addTo(map);
      bounds.extend(loc.coordinates);
    });
    map.fitBounds(bounds, {
      padding: {
        top: 200,
        bottom: 150,
        left: 100,
        right: 100
      }
    });
  };

  // public/js/alerts.js
  var hideAlert = () => {
    const el = document.querySelector(".alert");
    if (el) el.parentElement.removeChild(el);
  };
  var showAlert = (type, msg) => {
    hideAlert();
    const markup = `<div class="alert alert--${type}">${msg}</div>`;
    document.querySelector("body").insertAdjacentHTML("afterbegin", markup);
    window.setTimeout(hideAlert, 5e3);
  };

  // public/js/login.js
  var login = async (email, password) => {
    console.log(email, password);
    try {
      const res = await axios({
        method: "POST",
        url: "http://127.0.0.1:8000/api/v1/users/login",
        data: {
          email,
          password
        }
      });
      if (res.data.status === "success") {
        showAlert("success", "Logged in successfully");
        window.setTimeout(() => {
          location.assign("/");
        }, 1500);
      }
    } catch (err) {
      showAlert("error", err.response.data.message);
    }
  };
  var logout = async () => {
    try {
      const res = await axios({
        method: "GET",
        url: "http://127.0.0.1:8000/api/v1/users/logout"
      });
      if (res.data.status === "success") {
        location.reload(true);
      }
    } catch (err) {
      showAlert("error", "Error logging out! Try again");
    }
  };

  // public/js/updateSettings.js
  var updateSettings = async (data, type) => {
    try {
      const url = type === "password" ? "http://127.0.0.1:8000/api/v1/users/updateMyPassword" : "http://127.0.0.1:8000/api/v1/users/updateMe";
      const res = await axios({
        method: "PATCH",
        url,
        data
      });
      if (res.data.status === "success") {
        showAlert("success", `${type.toUpperCase()} updated successfully!`);
      }
    } catch (err) {
      showAlert("error", err.response.data.message);
    }
  };

  // public/js/index.js
  var mapBox = document.getElementById("map");
  var loginForm = document.querySelector(".form--login");
  var logOutBtn = document.querySelector(".nav__el--logout");
  var userDataForm = document.querySelector(".form-user-data");
  var userPasswordForm = document.querySelector(".form-user-password");
  if (mapBox) {
    const locations = JSON.parse(mapBox.dataset.locations);
    displayMap(locations);
  }
  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;
      login(email, password);
    });
  }
  if (logOutBtn) {
    logOutBtn.addEventListener("click", logout);
  }
  if (userDataForm) {
    userDataForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      updateSettings({ name, email }, "data");
    });
  }
  if (userPasswordForm) {
    userPasswordForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      document.querySelector(".btn--save-password").textContent = "Updating...";
      const passwordCurrent = document.getElementById("password-current").value;
      const password = document.getElementById("password").value;
      const passwordConfirm = document.getElementById("password-confirm").value;
      await updateSettings({ passwordCurrent, password, passwordConfirm }, "password");
      document.querySelector(".btn--save-password").textContent = "Save password";
      document.getElementById("password-current").value = "";
      document.getElementById("password").value = "";
      document.getElementById("password-confirm").value = "";
    });
  }
})();
