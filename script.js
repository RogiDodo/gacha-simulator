
document.addEventListener("DOMContentLoaded", function() {

    // =================================
    // ELEMENTOS DA PÁGINA
    // =================================

    const chanceInput = document.getElementById("chance");
    const zoomNumber = document.getElementById("zoomNumber");

    const targetInput = document.getElementById("targetInput");
    const calculateButton = document.getElementById("calculateButton");
    const customResult = document.getElementById("customResult");

    const tabelaResultados = document.getElementById("tabelaResultados");
    const contexto = document.getElementById("grafico");

    let grafico = null;


    // =================================
    // MOSTRADOR DE CHANCE ABAIXO DO GRÁFICO
    // =================================

    const chanceDisplay = document.createElement("div");

    chanceDisplay.style.textAlign = "center";
    chanceDisplay.style.padding = "14px";
    chanceDisplay.style.marginTop = "12px";
    chanceDisplay.style.borderRadius = "14px";
    chanceDisplay.style.background = "#f8f2ff";
    chanceDisplay.style.color = "#8065aa";
    chanceDisplay.style.fontSize = "15px";
    chanceDisplay.style.lineHeight = "1.7";

    contexto.parentElement.insertAdjacentElement(
        "afterend",
        chanceDisplay
    );


    // =================================
    // MATEMÁTICA
    // =================================

    function calcularProbabilidade(a, n) {

        if (n <= 0 || a <= 0) return 0;
        if (a >= 1) return 100;

        return -Math.expm1(n * Math.log1p(-a)) * 100;

    }


    function calcularTentativas(a, alvo) {

        if (alvo <= 0) return 0;
        if (a <= 0) return Infinity;
        if (a >= 1) return 1;
        if (alvo >= 100) return Infinity;

        const resultado =
            Math.log1p(-alvo / 100) /
            Math.log1p(-a);

        return Math.ceil(resultado - 1e-12);

    }


    function formatarTentativas(valor) {

        if (!Number.isFinite(valor)) return "∞";

        return valor.toLocaleString("pt-BR");

    }


    // =================================
    // TABELA DE PROBABILIDADES
    // =================================

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


    // =================================
    // CALCULADORA PERSONALIZADA
    // =================================

    function calcularPersonalizado() {

        const texto = targetInput.value.trim();

        customResult.classList.remove("error");

        if (texto === "") {

            customResult.textContent =
                "Digite uma porcentagem primeiro.";

            customResult.classList.add("error");
            return;

        }

        const alvo = Number(texto);
        const chance = Number(chanceInput.value);

        if (!Number.isFinite(alvo) || alvo < 0 || alvo > 100) {

            customResult.textContent =
                "Digite uma porcentagem entre 0 e 100%.";

            customResult.classList.add("error");
            return;

        }

        if (!Number.isFinite(chance) || chance < 0 || chance > 100) {

            customResult.textContent =
                "Corrija a chance individual primeiro.";

            customResult.classList.add("error");
            return;

        }

        const resultado =
            calcularTentativas(chance / 100, alvo);

        if (!Number.isFinite(resultado)) {

            customResult.innerHTML =
                "Essa meta não pode ser atingida com uma quantidade finita de giros." +
                "<strong>∞</strong>";

            return;

        }

        customResult.innerHTML =
            "Giros mínimos necessários:" +
            "<strong>" + formatarTentativas(resultado) + "</strong>" +
            "Probabilidade desejada: " + alvo + "%";

    }


    // =================================
    // INICIALIZAÇÃO DO GRÁFICO
    // =================================

    if (typeof Chart !== "undefined" && contexto) {

        try {

            grafico = new Chart(contexto, {

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

        } catch (erro) {

            console.error("Erro ao criar gráfico:", erro);

        }

    } else {

        console.error("Chart.js não foi carregado!");

    }


    // =================================
    // ATUALIZAÇÃO GERAL
    // =================================

    function atualizarTudo(atualizarMeta = false) {

        const chanceTexto = chanceInput.value.trim();

        const chance = Number(chanceTexto);

        if (
            chanceTexto === "" ||
            !Number.isFinite(chance) ||
            chance < 0 ||
            chance > 100
        ) {
            chanceDisplay.textContent =
                "Insira uma chance válida para visualizar a probabilidade.";

            return;
        }

        const a = chance / 100;

        // Calcula automaticamente os giros para atingir 95%.

        if (atualizarMeta) {

            const giros95 = calcularTentativas(a, 95);

            if (Number.isFinite(giros95)) {

                zoomNumber.value = giros95;

            } else {

                zoomNumber.value = "";

            }

        }

        // Atualiza a tabela.

        atualizarTabela(a);

        // Atualiza o gráfico.

        const limiteTexto = zoomNumber.value.trim();
        const limite = Number(limiteTexto);

        if (
            grafico &&
            limiteTexto !== "" &&
            Number.isInteger(limite) &&
            limite >= 1
        ) {

            const tentativas = [];
            const probabilidades = [];

            // Limite visual para evitar gráficos excessivamente pesados.

            const limiteGrafico = Math.min(limite, 10000);

            for (let n = 1; n <= limiteGrafico; n++) {

                tentativas.push(n);

                probabilidades.push(
                    calcularProbabilidade(a, n)
                );

            }

            grafico.data.labels = tentativas;

            grafico.data.datasets[0].data = probabilidades;

            grafico.update("none");

        }

        // Mostra a chance correspondente aos giros estabelecidos.

        if (
            limiteTexto !== "" &&
            Number.isInteger(limite) &&
            limite >= 1
        ) {

            const probabilidade =
                calcularProbabilidade(a, limite);

            chanceDisplay.innerHTML =
                "🎀 Chance acumulada em <strong>" +
                formatarTentativas(limite) +
                " giros:</strong><br>" +
                "<strong style='font-size: 23px;'>" +
                probabilidade.toFixed(4).replace(".", ",") +
                "%</strong>";

            if (limite > 10000) {

                chanceDisplay.innerHTML +=
                    "<br><small>O gráfico exibe os primeiros 10.000 giros.</small>";

            }

        } else {

            chanceDisplay.textContent =
                "Informe uma quantidade válida de giros.";

        }

        // Atualiza a calculadora personalizada.

        if (targetInput.value.trim() !== "") {
            calcularPersonalizado();
        }

    }


    // =================================
    // EVENTOS
    // =================================

    // Mudou a chance? Recalcula automaticamente a meta de 95%.

    chanceInput.addEventListener("input", function() {
        atualizarTudo(true);
    });

    // Mudou o número de giros? Atualiza gráfico e chance exibida.

    zoomNumber.addEventListener("input", function() {
        atualizarTudo(false);
    });

    calculateButton.addEventListener(
        "click",
        calcularPersonalizado
    );

    targetInput.addEventListener("keydown", function(event) {

        if (event.key === "Enter") {
            calcularPersonalizado();
        }

    });


    // =================================
    // INICIALIZAÇÃO
    // =================================

    atualizarTudo(true);

    console.log("Gacha Simulator iniciado com sucesso!");

});
