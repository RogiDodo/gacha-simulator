
const chanceInput = document.getElementById("chance");
const zoomNumber = document.getElementById("zoomNumber");

const targetInput = document.getElementById("targetInput");
const calculateButton = document.getElementById("calculateButton");
const customResult = document.getElementById("customResult");

const tabelaResultados = document.getElementById("tabelaResultados");

const contexto = document.getElementById("grafico");


// =====================================
// CÁLCULO DA PROBABILIDADE ACUMULADA
// =====================================

function calcularProbabilidade(a, n) {

    if (n <= 0) return 0;

    if (a <= 0) return 0;

    if (a >= 1) return 100;

    return -Math.expm1(n * Math.log1p(-a)) * 100;

}


// =====================================
// CÁLCULO DO NÚMERO DE GIROS
// =====================================

function calcularTentativas(a, alvo) {

    if (alvo <= 0) {
        return 0;
    }

    if (a <= 0) {
        return Infinity;
    }

    if (a >= 1) {
        return 1;
    }

    if (alvo >= 100) {
        return Infinity;
    }

    const resultado =
        Math.log1p(-alvo / 100) /
        Math.log1p(-a);

    return Math.ceil(resultado - 1e-12);

}


// =====================================
// FORMATAÇÃO DOS RESULTADOS
// =====================================

function formatarTentativas(valor) {

    if (!Number.isFinite(valor)) {
        return "∞";
    }

    return valor.toLocaleString("pt-BR");

}


// =====================================
// CRIAÇÃO DA TABELA
// =====================================

function atualizarTabela(a) {

    tabelaResultados.innerHTML = "";

    for (let alvo = 50; alvo <= 100; alvo += 5) {

        const tentativas = calcularTentativas(a, alvo);

        const linha = document.createElement("tr");

        const colunaAlvo = document.createElement("td");
        const colunaTentativas = document.createElement("td");

        colunaAlvo.className = "target-percent";
        colunaTentativas.className = "target-spins";

        colunaAlvo.textContent = alvo + "%";

        colunaTentativas.textContent =
            formatarTentativas(tentativas);

        linha.appendChild(colunaAlvo);
        linha.appendChild(colunaTentativas);

        tabelaResultados.appendChild(linha);

    }

}


// =====================================
// CALCULADORA PERSONALIZADA
// =====================================

function calcularPersonalizado() {

    const porcentagem = targetInput.value;

    customResult.classList.remove("error");

    if (porcentagem.trim() === "") {

        customResult.textContent =
            "Digite uma porcentagem primeiro.";

        customResult.classList.add("error");
        return;

    }

    const alvo = Number(porcentagem);

    if (
        !Number.isFinite(alvo) ||
        alvo < 0 ||
        alvo > 100
    ) {

        customResult.textContent =
            "Digite um valor entre 0 e 100%.";

        customResult.classList.add("error");
        return;

    }

    const a = Number(chanceInput.value) / 100;

    const resultado = calcularTentativas(a, alvo);

    if (!Number.isFinite(resultado)) {

        customResult.innerHTML =
            "Essa meta não pode ser atingida com uma quantidade finita de giros. <strong>∞</strong>";

        return;

    }

    customResult.innerHTML =
        "Giros mínimos necessários:" +
        "<strong>" + formatarTentativas(resultado) + "</strong>" +
        "Probabilidade desejada: " + alvo + "%";

}


// =====================================
// CRIAÇÃO DO GRÁFICO
// =====================================

const grafico = new Chart(contexto, {

    type: "line",

    data: {

        labels: [],

        datasets: [{

            label: "Probabilidade acumulada",

            data: [],

            borderColor: "#a58bcf",
            backgroundColor: "rgba(165, 139, 207, 0.15)",

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
                    color: "#8065aa"
                },

                ticks: {
                    color: "#8e8199"
                },

                grid: {
                    color: "#eee5f5"
                }

            },

            x: {

                title: {
                    display: true,
                    text: "Número de giros",
                    color: "#8065aa"
                },

                ticks: {
                    color: "#8e8199",
                    maxTicksLimit: 10
                },

                grid: {
                    display: false
                }

            }

        },

        plugins: {

            legend: {
                labels: {
                    color: "#8065aa"
                }
            },

            tooltip: {

                callbacks: {

                    title: function(items) {

                        return "Giro: " + items[0].label;

                    },

                    label: function(item) {

                        return "Chance acumulada: " +
                            item.parsed.y.toFixed(4) + "%";

                    }

                }

            }

        }

    }

});


// =====================================
// ATUALIZAÇÃO GERAL
// =====================================

function atualizarTudo() {

    const chance = Number(chanceInput.value);
    const limite = Number(zoomNumber.value);

    if (
        chanceInput.value.trim() === "" ||
        !Number.isFinite(chance) ||
        chance < 0 ||
        chance > 100
    ) {
        return;
    }

    if (
        zoomNumber.value.trim() === "" ||
        !Number.isInteger(limite) ||
        limite < 1 ||
        limite > 10000
    ) {
        return;
    }

    const a = chance / 100;

    const tentativas = [];
    const probabilidades = [];

    for (let n = 1; n <= limite; n++) {

        tentativas.push(n);

        probabilidades.push(
            calcularProbabilidade(a, n)
        );

    }

    grafico.data.labels = tentativas;

    grafico.data.datasets[0].data = probabilidades;

    grafico.update("none");

    atualizarTabela(a);

}


// =====================================
// EVENTOS
// =====================================

chanceInput.addEventListener("input", function() {

    atualizarTudo();

    // Atualiza o resultado personalizado
    // caso já exista uma meta digitada.

    if (targetInput.value.trim() !== "") {
        calcularPersonalizado();
    }

});


zoomNumber.addEventListener("input", atualizarTudo);

calculateButton.addEventListener(
    "click",
    calcularPersonalizado
);

targetInput.addEventListener("keydown", function(event) {

    if (event.key === "Enter") {
        calcularPersonalizado();
    }

});


// =====================================
// INICIALIZAÇÃO
// =====================================

atualizarTudo();
