
const chanceInput = document.getElementById("chance");

const zoomInput = document.getElementById("zoom");
const zoomNumber = document.getElementById("zoomNumber");

const contexto = document.getElementById("grafico");


// Criação do gráfico

const grafico = new Chart(contexto, {

    type: "line",

    data: {
        labels: [],

        datasets: [{
            label: "Chance acumulada (%)",

            data: [],

            borderColor: "#9b8aff",
            backgroundColor: "#9b8aff33",

            fill: true,
            tension: 0.3,

            pointRadius: 0,
            pointHoverRadius: 6
        }]
    },

    options: {

        responsive: true,
        maintainAspectRatio: false,

        interaction: {
            intersect: false,
            mode: "index"
        },

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
            },

            tooltip: {

                callbacks: {

                    title: function(items) {
                        return "Tentativa: " + items[0].label;
                    },

                    label: function(item) {
                        return "Probabilidade: " +
                            item.parsed.y.toFixed(4) + "%";
                    }

                }

            }

        }
    }
});


// Calcula a probabilidade acumulada

function calcularProbabilidade(a, n) {

    return (1 - Math.pow(1 - a, n)) * 100;

}


// Descobre quantas tentativas são necessárias

function calcularTentativas(a, alvo) {

    if (a <= 0) {
        return "Impossível";
    }

    if (a >= 1) {
        return 1;
    }

    return Math.ceil(
        Math.log(1 - alvo) / Math.log(1 - a)
    );

}


// Atualiza os resultados de probabilidade-alvo

function atualizarAlvos(a) {

    const alvos = [50, 90, 95, 99];

    alvos.forEach(function(alvo) {

        const resultado = calcularTentativas(a, alvo);

        document.getElementById("target" + alvo)
            .textContent = resultado;

    });

}


// Atualiza o gráfico inteiro

function atualizarGrafico() {

    let porcentagem = Number(chanceInput.value);

    if (!Number.isFinite(porcentagem)) {
        return;
    }

    porcentagem = Math.min(100, Math.max(0, porcentagem));

    const a = porcentagem / 100;

    const limite = Number(zoomNumber.value);

    if (!Number.isInteger(limite) || limite < 1 || limite > 10000) {
        return;
    }

    let tentativas = [];
    let probabilidades = [];

    for (let n = 1; n <= limite; n++) {

        tentativas.push(n);

        probabilidades.push(
            calcularProbabilidade(a, n)
        );

    }

    grafico.data.labels = tentativas;

    grafico.data.datasets[0].data = probabilidades;

    grafico.update("none");

    atualizarAlvos(a);

}


// Sincronização entre barra e caixinha

zoomInput.addEventListener("input", function() {

    zoomNumber.value = zoomInput.value;

    atualizarGrafico();

});


zoomNumber.addEventListener("input", function() {

    const valor = Number(zoomNumber.value);

    if (
        Number.isInteger(valor) &&
        valor >= 1 &&
        valor <= 10000
    ) {

        zoomInput.value = Math.min(
            10000,
            Math.max(10, Math.ceil(valor / 10) * 10)
        );

        atualizarGrafico();

    }

});


chanceInput.addEventListener("input", atualizarGrafico);


// Inicialização

atualizarGrafico();
