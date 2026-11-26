document.addEventListener("DOMContentLoaded", () => {

    // hamburger menu

    const menuToggle = document.getElementById("menu-toggle");
    const navList = document.getElementById("nav-list");

    if (menuToggle && navList) {
        menuToggle.addEventListener("click", () => {
            menuToggle.classList.toggle("active");
            navList.classList.toggle("active");
        });
    }

    // zastępcze graficzki dla brakujących plików

    document.querySelectorAll("img").forEach((img) => {
        const wstawZastepczySvg = () => {
            if (img.dataset.fallbackApplied) return;
            img.dataset.fallbackApplied = "true";
            const tekst = (img.alt || "Ochrona pszczół").replace(/&/g, "&").replace(/</g, "<");
            const svg = `
                <svg xmlns="http://www.w3.org/2000/svg" width="600" height="340" viewBox="0 0 600 340">
                    <defs>
                        <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stop-color="#fef3c7"/>
                            <stop offset="100%" stop-color="#fde68a"/>
                        </linearGradient>
                    </defs>
                    <rect width="600" height="340" fill="url(#g)"/>
                    <circle cx="300" cy="130" r="46" fill="#f59e0b" opacity="0.25"/>
                    <text x="300" y="146" font-size="48" text-anchor="middle">🐝</text>
                    <text x="300" y="218" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="700" fill="#301b08" text-anchor="middle">${tekst}</text>
                    <text x="300" y="248" font-family="Inter, Arial, sans-serif" font-size="13" fill="#5c452b" text-anchor="middle">Miejsce na własne zdjęcie (${img.getAttribute("src")})</text>
                </svg>`;
            img.src = "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
        };

        img.addEventListener("error", wstawZastepczySvg);
        if (img.complete && img.naturalWidth === 0) {
            wstawZastepczySvg();
        }
    });

    // okno modalne z blokadą przewijania

    const otworzModal = document.getElementById("otworzModal");
    const zamknijModal = document.getElementById("zamknijModal");
    const modalOkno = document.getElementById("modalOkno");

    if (otworzModal && zamknijModal && modalOkno) {
        const zamknij = () => {
            modalOkno.classList.remove("otwarty");
            document.body.style.overflow = "";
        };

        otworzModal.addEventListener("click", () => {
            modalOkno.classList.add("otwarty");
            document.body.style.overflow = "hidden";
        });

        zamknijModal.addEventListener("click", zamknij);

        // Opcjonalne zamykanie po kliknięciu w ciemne tło
        modalOkno.addEventListener("click", (e) => {
            if (e.target === modalOkno) {
                zamknij();
            }
        });
    }


    // lista obiektów do przewijania

    const listaRoslin = document.getElementById("listaRoslin");
    const btnDol = document.getElementById("btnDol");
    const btnGora = document.getElementById("btnGora");

    if (listaRoslin && btnDol && btnGora) {
        btnDol.addEventListener("click", () => {
            listaRoslin.scrollBy({ top: 120, behavior: "smooth" });
        });

        btnGora.addEventListener("click", () => {
            listaRoslin.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    // galeria zdjęć interaktywna

    const galeriaOkno = document.getElementById("galeriaOkno");
    const galeriaPasek = document.getElementById("galeriaPasek");
    const galeriaLewo = document.getElementById("galeriaLewo");
    const galeriaPrawo = document.getElementById("galeriaPrawo");
    const galeriaAuto = document.getElementById("galeriaAuto");

    if (galeriaOkno && galeriaPasek && galeriaLewo && galeriaPrawo && galeriaAuto) {
        const zatrzymajAuto = () => {
            galeriaPasek.classList.remove("animacja-ruch");
            galeriaAuto.textContent = "▶ Wznów animację";
        };

        galeriaLewo.addEventListener("click", () => {
            zatrzymajAuto();
            galeriaOkno.scrollBy({ left: -300, behavior: "smooth" });
        });

        galeriaPrawo.addEventListener("click", () => {
            zatrzymajAuto();
            galeriaOkno.scrollBy({ left: 300, behavior: "smooth" });
        });

        galeriaAuto.addEventListener("click", () => {
            const aktywna = galeriaPasek.classList.toggle("animacja-ruch");
            if (aktywna) {
                galeriaOkno.scrollTo({ left: 0, behavior: "smooth" });
                galeriaAuto.textContent = "⏸ Zatrzymaj animację";
            } else {
                galeriaAuto.textContent = "▶ Wznów animację";
            }
        });
    }

    // pogoda (openmeteo api) i leaflet
    const listaPasiek = document.getElementById("listaPasiek");
    const pogodaBox = document.getElementById("pogoda");
    const mapaEl = document.getElementById("mapa");

    if (listaPasiek && pogodaBox) {
        let mapa = null;
        let aktualnyMarker = null;

        if (mapaEl && typeof L !== "undefined") {
            mapa = L.map("mapa").setView([52.0, 19.2], 6);
            L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                attribution: "© OpenStreetMap"
            }).addTo(mapa);
        }

        const opisPogody = (kod) => {
            if (kod === 0) return "Bezchmurnie ☀️";
            if (kod <= 3) return "Częściowe zachmurzenie ⛅";
            if (kod <= 48) return "Mgła 🌫️";
            if (kod <= 67) return "Opady deszczu 🌧️";
            if (kod <= 77) return "Opady śniegu ❄️";
            return "Przelotne opady / burza ⛈️";
        };

        fetch("assets/data/pasieki.json")
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Nie udało się pobrać pliku assets/data/pasieki.json");
                }
                return response.json();
            })
            .then((pasieki) => {
                pasieki.forEach((pasieka) => {
                    const li = document.createElement("li");
                    li.textContent = `🐝 ${pasieka.nazwa} (${pasieka.wojewodztwo})`;

                    li.addEventListener("click", () => {
                        // podświetlenie aktywnego elementu
                        document
                            .querySelectorAll("#listaPasiek li")
                            .forEach((el) => el.classList.remove("wybrany"));
                        li.classList.add("wybrany");

                        // aktualizacja mapy leaflet
                        if (mapa) {
                            mapa.setView([pasieka.lat, pasieka.lon], 10);
                            if (aktualnyMarker) {
                                mapa.removeLayer(aktualnyMarker);
                            }
                            aktualnyMarker = L.marker([pasieka.lat, pasieka.lon])
                                .addTo(mapa)
                                .bindPopup(`
                                    <strong>${pasieka.nazwa}</strong><br>
                                    Miejscowość: ${pasieka.miejscowosc}<br>
                                    Pożytek: ${pasieka.pozytek}<br>
                                    Liczba uli: ${pasieka.liczbaUli}
                                `)
                                .openPopup();
                        }

                        pogodaBox.innerHTML = `<p>Ładowanie danych pogodowych dla: <strong>${pasieka.nazwa}</strong>...</p>`;

                        const url = `https://api.open-meteo.com/v1/forecast?latitude=${pasieka.lat}&longitude=${pasieka.lon}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=3`;

                        fetch(url)
                            .then((res) => {
                                if (!res.ok) {
                                    throw new Error("Błąd połączenia z API Open-Meteo.");
                                }
                                return res.json();
                            })
                            .then((dane) => {
                                const teraz = dane.current_weather;
                                const dni = dane.daily;

                                let wierszeTabeli = "";
                                for (let i = 0; i < dni.time.length; i++) {
                                    wierszeTabeli += `
                                        <tr>
                                            <td>${dni.time[i]}</td>
                                            <td>${dni.temperature_2m_min[i]} °C</td>
                                            <td>${dni.temperature_2m_max[i]} °C</td>
                                            <td>${dni.precipitation_sum[i]} mm</td>
                                        </tr>`;
                                }

                                pogodaBox.innerHTML = `
                                    <h3>${pasieka.nazwa}</h3>
                                    <p><strong>Lokalizacja:</strong> ${pasieka.miejscowosc} (woj. ${pasieka.wojewodztwo})</p>
                                    <p><strong>Główny pożytek:</strong> ${pasieka.pozytek}</p>
                                    <p>${pasieka.opis}</p>
                                    <h4>Aktualna pogoda dla lotów pszczół</h4>
                                    <p><strong>Temperatura:</strong> ${teraz.temperature} °C | <strong>Wiatr:</strong> ${teraz.windspeed} km/h | <strong>Warunki:</strong> ${opisPogody(teraz.weathercode)}</p>
                                    <h4>Prognoza na 3 dni</h4>
                                    <table>
                                        <thead>
                                            <tr>
                                                <th>Data</th>
                                                <th>Temp. min</th>
                                                <th>Temp. max</th>
                                                <th>Opady</th>
                                            </tr>
                                        </thead>
                                        <tbody>${wierszeTabeli}</tbody>
                                    </table>
                                `;
                            })
                            .catch((err) => {
                                pogodaBox.innerHTML = `<p>Nie udało się pobrać pogody: <strong>${err.message}</strong></p>`;
                            });
                    });

                    listaPasiek.appendChild(li);
                });
            })
            .catch((error) => {
                listaPasiek.innerHTML = `<li>Błąd wczytywania danych JSON: ${error.message} (uruchom projekt przez Live Server)</li>`;
            });
    }

    // chart.js i wykresy
    
    const canvasStatyczny = document.getElementById("wykresStatyczny");
    const canvasDynamiczny = document.getElementById("wykresDynamiczny");

    if (canvasStatyczny && typeof Chart !== "undefined") {
        new Chart(canvasStatyczny, {
            type: "bar",
            data: {
                labels: [
                    "Pestycydy i opryski",
                    "Choroby (np. warroza)",
                    "Utrata łąk kwietnych",
                    "Zmiany klimatu",
                    "Monokultury rolne"
                ],
                datasets: [
                    {
                        label: "Szacowana skala zagrożenia (0–100)",
                        data: [88, 82, 76, 68, 64],
                        backgroundColor: [
                            "#f59e0b",
                            "#d97706",
                            "#16a34a",
                            "#eab308",
                            "#65a30d"
                        ],
                        borderRadius: 6
                    }
                ]
            },
            options: {
                indexAxis: "y",
                responsive: true,
                plugins: {
                    legend: { display: false }
                },
                scales: {
                    x: { beginAtZero: true, max: 100 }
                }
            }
        });
    }

    if (canvasDynamiczny && typeof Chart !== "undefined") {
        fetch("assets/data/pasieki.json")
            .then((res) => {
                if (!res.ok) throw new Error("Błąd pobierania JSON do wykresu.");
                return res.json();
            })
            .then((pasieki) => {
                const etykiety = pasieki.map((p) => p.nazwa.replace("Pasieka ", ""));
                const wartosci = pasieki.map((p) => p.produkcjaMioduKg);

                new Chart(canvasDynamiczny, {
                    type: "bar",
                    data: {
                        labels: etykiety,
                        datasets: [
                            {
                                label: "Roczna produkcja miodu (kg)",
                                data: wartosci,
                                backgroundColor: "#16a34a",
                                hoverBackgroundColor: "#f59e0b",
                                borderRadius: 6
                            }
                        ]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: { beginAtZero: true }
                        }
                    }
                });
            })
            .catch((err) => {
                console.error("Wykres dynamiczny:", err);
            });
    }
});