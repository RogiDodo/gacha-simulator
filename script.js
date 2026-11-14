
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
    const currencyColumnHeader = document.getElementById("currencyColumnHeader");

    const currencyToggle = document.getElementById("currencyToggle");
    const currencySettings = document.getElementById("currencySettings");
    const currencyCostInput = document.getElementById("currencyCost");
    const currencyError = document.getElementById("currencyError");

    const chartModeSwitch = document.getElementById("chartModeSwitch");
    const chartModeSpins = document.getElementById("chartModeSpins");
    const chartModeCurrency = document.getElementById("chartModeCurrency");

    const chanceDisplay = document.getElementById("chanceDisplay");

    const contexto = document.getElementById("grafico");

    let grafico = null;

    let chartMode = "spins";
    let userEditedSpins = false;

    let graphLimit = 100;


    // =================================
    // ABREVIAÇÕES DE CURRENCY
    // =================================

    const suffixes = [
        { suffix: "K", value: 1e3 },
        { suffix: "M", value: 1e6 },
        { suffix: "B", value: 1e9 },
        { suffix: "T", value: 1e12 },
        { suffix: "Qa", value: 1e15 },
        { suffix: "Qn", value: 1e18 },
        { suffix: "Sx", value: 1e21 },
        { suffix: "Sp", value: 1e24 },
        { suffix: "Oc", value: 1e27 },
        { suffix: "No", value: 1e30 },
        { suffix: "Dc", value: 1e33 }
    ];


    function interpretarCurrency(texto) {

        if (typeof texto !== "string") return null;

        const valorTexto = texto.trim().replace(",", ".");

        const correspondencia = valorTexto.match(
            /^(\d+(?:\.\d*)?|\.\d+)\s*(K|M|B|T|Qa|Qn|Sx|Sp|Oc|No|Dc)?$/i
        );

        if (!correspondencia) return null;

        const numero = Number(correspondencia[1]);
        const sufixo = (correspondencia[2] || "").toUpperCase();

        if (!Number.isFinite(numero) || numero < 0) {
            return null;
        }

        if (sufixo === "") {
            return numero;
        }

        const unidade = suffixes.find(
            item => item.suffix.toUpperCase() === sufixo
        );

        if (!unidade) return null;

        const resultado = numero * unidade.value;

        return Number.isFinite(resultado) ? resultado : null;

    }


    function formatarCurrency(valor) {

        if (!Number.isFinite(valor)) return "∞";
        if (valor === 0) return "0";

        for (let i = suffixes.length - 1; i >= 0; i--) {

            const unidade = suffixes[i];

            if (Math.abs(valor) >= unidade.value) {

                const numero = valor / unidade.value;

                return (
                    Number(numero.toFixed(2)).toString() +
                    unidade.suffix
                );

            }

        }

        return Number(valor.toFixed(2)).toLocaleString("pt-BR");

    }


    function obterCustoPorGiro() {

        return interpretarCurrency(currencyCostInput.value);

    }


    function currencyAtivo() {

        return currencyToggle.checked;

    }


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
    // ATUALIZAÇÃO DA TABELA
    // =================================

    function atualizarTabela(a) {

        const usarCurrency = currencyAtivo();
        const custo = obterCustoPorGiro();

        tabelaResultados.innerHTML = "";

        currencyColumnHeader.hidden = !usarCurrency;

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

            if (usarCurrency) {

                const colunaCurrency = document.createElement("td");

                colunaCurrency.className = "target-currency";

                if (custo === null) {

                    colunaCurrency.textContent = "—";

                } else if (!Number.isFinite(tentativas)) {

                    colunaCurrency.textContent = "∞";

                } else {

                    colunaCurrency.textContent =
                        formatarCurrency(tentativas * custo);

                }

                linha.appendChild(colunaCurrency);

            }

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

        let conteudo =
            "Giros mínimos necessários:" +
            "<strong>" + formatarTentativas(resultado) + "</strong>" +
            "Probabilidade desejada: " + alvo + "%";

        if (currencyAtivo()) {

            const custo = obterCustoPorGiro();

            if (custo === null) {

                conteudo +=
                    "<div class='currency-result'>" +
                    "💛 Informe um custo por giro válido para calcular a Currency." +
                    "</div>";

            } else {

                conteudo +=
                    "<div class='currency-result'>" +
                    "💛 Currency necessária:" +
                    "<strong>" +
                    formatarCurrency(resultado * custo) +
                    "</strong>" +
                    "</div>";

            }

        }

        customResult.innerHTML = conteudo;

    }


    // =================================
    // ATUALIZAÇÃO DA CHANCE ABAIXO DO GRÁFICO
    // =================================

    function atualizarChanceDisplay(a, limite) {

        if (!userEditedSpins || !Number.isInteger(limite) || limite < 1) {

            chanceDisplay.hidden = true;
            chanceDisplay.innerHTML = "";

            return;

        }

        const probabilidade = calcularProbabilidade(a, limite);

        chanceDisplay.hidden = false;

        chanceDisplay.classList.toggle(
            "currency-display",
            currencyAtivo() && chartMode === "currency"
        );

        let conteudo =
            "🎀 Chance acumulada em <strong>" +
            formatarTentativas(limite) +
            " giros:</strong><br>" +
            "<strong>" +
            probabilidade.toFixed(4).replace(".", ",") +
            "%</strong>";

        if (currencyAtivo()) {

            const custo = obterCustoPorGiro();

            if (custo !== null) {

                conteudo +=
                    "<br><span>💛 Custo total: <strong>" +
                    formatarCurrency(limite * custo) +
                    "</strong></span>";

            }

        }

        chanceDisplay.innerHTML = conteudo;

    }


    // =================================
    // GRÁFICO
    // =================================

    function atualizarGrafico(a, limite) {

        if (!grafico) return;

        const custo = obterCustoPorGiro();

        const usarCurrency =
            currencyAtivo() && chartMode === "currency";

        const tentativas = [];
        const probabilidades = [];

        const limiteGrafico = Math.min(limite, 10000);

        for (let n = 1; n <= limiteGrafico; n++) {

            const probabilidade =
                calcularProbabilidade(a, n);

            tentativas.push(
                usarCurrency && custo !== null
                    ? formatarCurrency(n * custo)
                    : String(n)
            );

            probabilidades.push(probabilidade);

        }

        grafico.data.labels = tentativas;
        grafico.data.datasets[0].data = probabilidades;

        grafico.data.datasets[0].borderColor =
            usarCurrency ? "#e9bd43" : "#a58bcf";

        grafico.data.datasets[0].backgroundColor =
            usarCurrency
                ? "rgba(233, 189, 67, 0.17)"
                : "rgba(165, 139, 207, 0.15)";

        grafico.data.datasets[0].label =
            usarCurrency
                ? "Probabilidade por Currency"
                : "Probabilidade por giros";

        grafico.options.scales.x.title.text =
            usarCurrency
                ? "Currency acumulada"
                : "Número de giros";

        grafico.options.scales.x.ticks.callback =
            function(value, index) {

                const total = tentativas[index];

                if (total === undefined) return "";

                return total;

            };

        grafico.options.plugins.tooltip.callbacks.title =
            function(items) {

                if (!items.length) return "";

                return usarCurrency
                    ? "Currency: " + items[0].label
                    : "Giro: " + items[0].label;

            };

        grafico.options.plugins.tooltip.callbacks.label =
            function(item) {

                return "Chance acumulada: " +
                    item.parsed.y.toFixed(4) + "%";

            };

        grafico.update("none");

    }


    // =================================
    // ATUALIZAÇÃO GERAL
    // =================================

    function atualizarTudo() {

        const chanceTexto = chanceInput.value.trim();
        const chance = Number(chanceTexto);

        if (
            chanceTexto === "" ||
            !Number.isFinite(chance) ||
            chance < 0 ||
            chance > 100
        ) {

            chanceDisplay.hidden = true;

            if (grafico) {
                grafico.data.labels = [];
                grafico.data.datasets[0].data = [];
                grafico.update("none");
            }

            return;

        }

        const a = chance / 100;

        // A meta de 95% é usada internamente.
        // Ela não aparece no campo nem no resultado.

        const metaAutomatica = calcularTentativas(a, 95);

        graphLimit = Number.isFinite(metaAutomatica)
            ? Math.max(1, Math.min(metaAutomatica, 10000))
            : 100;

        // Se a pessoa informou manualmente os giros,
        // eles passam a controlar o gráfico.

        const textoManual = zoomNumber.value.trim();
        const limiteManual = Number(textoManual);

        if (
            userEditedSpins &&
            textoManual !== "" &&
            Number.isInteger(limiteManual) &&
            limiteManual >= 1 &&
            limiteManual <= 10000
        ) {

            graphLimit = limiteManual;

        }

        // Atualiza tabela e gráfico.

        atualizarTabela(a);
        atualizarGrafico(a, graphLimit);

        // Mostra a probabilidade somente se os giros
        // tiverem sido informados manualmente.

        atualizarChanceDisplay(a, limiteManual);

        // Atualiza calculadora personalizada.

        if (targetInput.value.trim() !== "") {
            calcularPersonalizado();
        }

        // Validação visual da Currency.

        if (currencyAtivo()) {

            const custo = obterCustoPorGiro();

            currencyError.hidden = custo !== null;

        }

    }


    // =================================
    // ALTERNÂNCIA DO GRÁFICO
    // =================================

    function mudarModoGrafico(modo) {

        chartMode = modo;

        chartModeSpins.classList.toggle(
            "active",
            modo === "spins"
        );

        chartModeCurrency.classList.toggle(
            "active",
            modo === "currency"
        );

        atualizarTudo();

    }


    // =================================
    // EVENTOS
    // =================================

    // Mudança na chance individual:
    // limpa os giros manuais e volta ao gráfico automático.

    chanceInput.addEventListener("input", function() {

        zoomNumber.value = "";
        userEditedSpins = false;

        atualizarTudo();

    });


    // Mudança manual nos giros.

    zoomNumber.addEventListener("input", function() {

        const texto = zoomNumber.value.trim();

        userEditedSpins = texto !== "";

        atualizarTudo();

    });


    // Ativar ou desativar Currency.

    currencyToggle.addEventListener("change", function() {

        const ativo = currencyAtivo();

        currencySettings.hidden = !ativo;
        chartModeSwitch.hidden = !ativo;

        currencyError.hidden = true;

        if (!ativo) {

            chartMode = "spins";

        }

        mudarModoGrafico(chartMode);

    });


    // Alteração do custo por giro.

    currencyCostInput.addEventListener("input", function() {

        atualizarTudo();

    });


    // Abas do gráfico.

    chartModeSpins.addEventListener("click", function() {

        mudarModoGrafico("spins");

    });

    chartModeCurrency.addEventListener("click", function() {

        mudarModoGrafico("currency");

    });


    // Calculadora personalizada.

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
    // INICIALIZAÇÃO FINAL
    // =================================

    currencySettings.hidden = true;
    chartModeSwitch.hidden = true;
    currencyColumnHeader.hidden = true;
    chanceDisplay.hidden = true;

    atualizarTudo();

    console.log("Gacha Simulator 2.0 iniciado com sucesso!");

});
