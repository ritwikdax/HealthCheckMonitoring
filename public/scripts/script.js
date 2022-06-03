const ctx = document.getElementById("myChart").getContext("2d");

const data = {
  labels: ["Critical", "Warning", "Communication Error", "Health OK"],
  datasets: [
    {
      label: "My First Dataset",
      data: [6, 10, 2, 200],
      backgroundColor: ["#f00039", "#ed7245", "#F4A45A", "#27D0BA"],
      hoverOffset: 4,
    },
  ],
};

const config = {
  type: "doughnut",
  data: data,
};

const myChart = new Chart(ctx, config);
