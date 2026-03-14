console.log("Gangnam Style reservation page loaded");

const bookingDate = document.getElementById("booking-date");
const bookingTime = document.getElementById("booking-time");
const reservationForm = document.getElementById("reservation-form");
const formStatus = document.getElementById("form-status");

const scriptURL = "https://script.google.com/macros/s/AKfycbwIafle3Wjelt99fWtTKQOPm0szkPMwXFLNVwKfqsBdEmibXKkhL_P0T_PedZ9P8Rnj9w/exec";

function pad(num) {
  return String(num).padStart(2, "0");
}

function addTimeOptions(startHour, endHour) {
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += 15) {
      const hh = pad(hour);
      const mm = pad(minute);
      const timeValue = `${hh}:${mm}`;

      const option = document.createElement("option");
      option.value = timeValue;
      option.textContent = timeValue;
      bookingTime.appendChild(option);
    }
  }

  const lastOption = document.createElement("option");
  lastOption.value = `${pad(endHour)}:00`;
  lastOption.textContent = `${pad(endHour)}:00`;
  bookingTime.appendChild(lastOption);
}

function resetTimeOptions() {
  bookingTime.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.value = "";
  defaultOption.textContent = "Select a time";
  bookingTime.appendChild(defaultOption);
}

function updateTimeOptions() {
  const selectedDate = bookingDate.value;

  resetTimeOptions();

  if (!selectedDate) {
    bookingTime.disabled = false;
    return;
  }

  const day = new Date(selectedDate).getDay();
  // 일=0, 월=1, 화=2, 수=3, 목=4, 금=5, 토=6

  // 화요일 휴무
  if (day === 2) {
    const closedOption = document.createElement("option");
    closedOption.value = "";
    closedOption.textContent = "Closed on Tuesday";
    bookingTime.appendChild(closedOption);
    bookingTime.disabled = true;
    return;
  }

  bookingTime.disabled = false;

  // 월/수/목/금 : 17:00 ~ 21:00
  if (day === 1 || day === 3 || day === 4 || day === 5) {
    addTimeOptions(17, 21);
    return;
  }

  // 토/일 : 12:00 ~ 14:00 + 17:00 ~ 21:00
  if (day === 0 || day === 6) {
    addTimeOptions(12, 14);
    addTimeOptions(17, 21);
  }
}

if (bookingDate) {
  bookingDate.addEventListener("change", updateTimeOptions);

  // 오늘 이전 날짜 선택 방지
  const today = new Date();
  const yyyy = today.getFullYear();
  const mm = pad(today.getMonth() + 1);
  const dd = pad(today.getDate());
  bookingDate.min = `${yyyy}-${mm}-${dd}`;
}

if (reservationForm) {
  reservationForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const formData = new FormData(reservationForm);

    formStatus.textContent = "Sending your request...";

    try {
      const response = await fetch(scriptURL, {
        method: "POST",
        body: new URLSearchParams(formData)
      });

      const result = await response.json();

      if (result.success) {
        formStatus.textContent = "Thank you. Your reservation request has been received. We will contact you soon.";
        reservationForm.reset();
        resetTimeOptions();
        bookingTime.disabled = false;
      } else {
        formStatus.textContent = "Sorry, something went wrong. Please try again.";
        console.error(result.message);
      }
    } catch (error) {
      formStatus.textContent = "Sorry, something went wrong. Please try again.";
      console.error(error);
    }
  });
}