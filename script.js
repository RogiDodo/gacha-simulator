
console.log("Chart.js:", typeof Chart);

const chanceInput = document.getElementById("chance");
const zoomInput = document.getElementById("zoom");
const zoomValue = document.getElementById("zoomValue");

const contexto = document.getElementById("grafico");

let grafico = new Chart(contexto, {

    type: "line",

    data: {
        labels: [],
        datasets: [{
            label: "Chance acumulada (%)",
            data: [],
            borderColor: "#8b7cff",
            backgroundColor: "#8b7cff33",
            fill: true,
            tension: 0.3
        }]
    },

    options: {
        responsive: true,
        maintainAspectRatio: true,

        scales: {
            y: {
                min: 0,
                max: 100,
                title: {
                    display: true,
                    text: "Probabilidade (%)",
                    color: "white"
                },
                ticks: {
                    color: "white"
                }
            },

            x: {
                title: {
                    display: true,
                    text: "Número de tentativas",
                    color: "white"
                },
                ticks: {
                    color: "white"
                }
            }
        },

        plugins: {
            legend: {
                labels: {
                    color: "white"
                }
            }
        }
    }
});


function atualizarGrafico() {

    let a = Number(chanceInput.value) / 100;

    let limite = Number(zoomInput.value);

    let tentativas = [];
    let probabilidades = [];

    for (let n = 1; n <= limite; n++) {

        let resultado = 1 - Math.pow(1 - a, n);

        tentativas.push(n);
        probabilidades.push(resultado * 100);
    }

    grafico.data.labels = tentativas;
    grafico.data.datasets[0].data = probabilidades;

    grafico.update();

    zoomValue.textContent = limite;
}


chanceInput.addEventListener("input", atualizarGrafico);
zoomInput.addEventListener("input", atualizarGrafico);

atualizarGrafico();
