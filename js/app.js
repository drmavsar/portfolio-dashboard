/**
 * Portfolio Dashboard Application
 * Main application logic for portfolio management dashboard
 */

const API_URL = 'https://script.google.com/macros/s/AKfycbxgZ2-EV7AQBd4sjtPTGXw5F1SiOFdbqlYJ3Awa2OwmbiFWSQvTguZ3gF4IHxaYsEtUxA/exec';

const state = {
    data: null,
    filterMovements: 'monthly',
    filterSearch: '',
    theme: localStorage.getItem('theme') || 'dark',
    privacyMode: localStorage.getItem('privacyMode') === 'true'
};

// ════════════════════════════════════════════════════════════════════════
// INVESTING.COM STOCK LINKS
// ════════════════════════════════════════════════════════════════════════

const investingMap = {
    'AEFES': 'anadolu-efes',
    'AKBNK': 'akbank',
    'AKSEN': 'aksa-enerji',
    'ALARK': 'alarko-holding',
    'ALBRK': 'albaraka-turk',
    'ALGYO': 'alarko-gmyo',
    'ARCLK': 'arcelik',
    'ASELS': 'aselsan',
    'ASTOR': 'astor-enerji-as',
    'AYDEM': 'aydem-enerji',
    'AYGAZ': 'aygaz',
    'BIMAS': 'bim-magazalar',
    'BRISA': 'brisa',
    'CCOLA': 'coca-cola-icecek',
    'CIMSA': 'cimsa',
    'DOAS': 'dogus-otomotiv',
    'DOHOL': 'dogan-holding',
    'EKGYO': 'emlak-konut-gmyo',
    'ENKAI': 'enka-insaat',
    'ENJSA': 'enerjisa-enerji',
    'EREGL': 'eregli-demir-celik',
    'FROTO': 'ford-otosan',
    'GARAN': 'garanti-bankasi',
    'GSRAY': 'galatasaray',
    'GUBRF': 'gubre-fabrik.',
    'HALKB': 'turkiye-halk-bankasi',
    'ISCTR': 'is-bankasi',
    'ISGYO': 'is-gmyo',
    'KCHOL': 'koc-holding',
    'KORDS': 'kordsa',
    'KOZAL': 'koza-altin',
    'KRDMD': 'kardemir-d',
    'LOGO' : 'logo-yazilim',
    'MAVI': 'mavi-giyim-sanayi-ve-ticaret-as',
    'MGROS': 'migros',
    'MPARK': 'mlp-saglik',
    'ODAS': 'odas-elektrik',
    'OYAKC': 'oyak-cimento',
    'PETKM': 'petkim',
    'PGSUS': 'pegasus-hava-yollari',
    'SAHOL': 'sabanci-holding',
    'SASA': 'sasa-polyester',
    'SISE': 'sise-cam',
    'SKBNK': 'sekerbank',
    'SOKM': 'sok-marketler',
    'TAVHL': 'tav-havalimanlari',
    'TCELL': 'turkcell',
    'THYAO': 'turk-hava-yollari',
    'TKFEN': 'tekfen-holding',
    'TOASO': 'tofas',
    'TSKB': 'tskb',
    'TTKOM': 'turk-telekom',
    'TUPRS': 'tupras',
    'ULKER': 'ulker-biskuvi',
    'VAKBN': 'vakiflar-bankasi',
    'VESTL': 'vestel',
    'YKBNK': 'yapi-ve-kredi-bank',
    'ZOREN': 'zorlu-enerji'
};

function openInvesting(sembol) {
    const slug = investingMap[sembol.toUpperCase()];
    if (slug) {
        window.open(`https://tr.investing.com/equities/${slug}`, '_blank');
    } else {
        window.open(`https://tr.investing.com/search/?q=${sembol}`, '_blank');
    }
}

window.openInvesting = openInvesting;

// ════════════════════════════════════════════════════════════════════════
// INITIALIZATION
// ════════════════════════════════════════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
    applyTheme(state.theme);
    applyPrivacyMode(state.privacyMode);
    await fetchData();
    setupEvents();
});

// ════════════════════════════════════════════════════════════════════════
// DATA FETCHING
// ════════════════════════════════════════════════════════════════════════

async function fetchData() {
    setLoading(true);
    try {
        const res = await fetch(API_URL);
        const json = await res.json();
        if (json.error) throw new Error(json.error);
        state.data = json;
        render();
    } catch (e) {
        console.error(e);
        alert("Veri çekilemedi: " + e.message);
    } finally {
        setLoading(false);
    }
}

// ════════════════════════════════════════════════════════════════════════
// RENDERING
// ════════════════════════════════════════════════════════════════════════

function render() {
    if (!state.data) return;
    try {
        renderHeader();
        renderKPI();
        renderPortfolioGrouped();
        renderMovements();
        renderAccounts();
        renderMarketNative();

        const d = new Date();
        const timeStr = d.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
        const dateStr = d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' });
        document.getElementById('last-update').innerText = `${dateStr} ${timeStr} Güncellendi`;
    } catch (e) {
        console.error(e);
    }
}

// ────────────────────────────────────────────────────────────────────────
// Render Header
// ────────────────────────────────────────────────────────────────────────

function renderHeader() {
    const kurlar = state.data.kurlar;
    const container = document.getElementById('header-ticker');
    if (!kurlar || !container) return;

    const keys = ['USD', 'EUR', 'GRA'];
    let html = '';

    keys.forEach(k => {
        const item = kurlar[k];
        if (item) {
            const colorClass = item.degisim >= 0 ? 'text-up' : 'text-down';
            html += `
                <div class="ticker-item">
                    <div class="ticker-label">${k}/TRY</div>
                    <div class="ticker-value num ${colorClass}">${formatMoney(item.satis)}</div>
                </div>
            `;
        }
    });

    container.innerHTML = html;
}

// ────────────────────────────────────────────────────────────────────────
// Render KPI Cards
// ────────────────────────────────────────────────────────────────────────

let assetPieChart = null;

function renderKPI() {
    const snaps = state.data.snapshots || [];
    if (snaps.length === 0) return;

    const curr = snaps[0];
    const prev = snaps.length > 1 ? snaps[1] : curr;
    const getVal = (row, key) => parseFloat(row[key] || 0);

    // Total Assets
    const total = getVal(curr, 'Toplam Varlık');
    const diff = total - getVal(prev, 'Toplam Varlık');
    const diffSign = diff >= 0 ? '+' : '';
    setHtml('kpi-total', formatMoney(total));
    setHtml('kpi-total-sub', `${diffSign}${formatMoney(diff)} (24s)`);
    document.getElementById('kpi-total-sub').className = "sub-value num sensitive " + (diff >= 0 ? 'text-up' : 'text-down');

    // Cash with breakdown
    const nakit = getVal(curr, 'Nakit TRY');
    const doviz = getVal(curr, 'Döviz TRY');
    const altin = getVal(curr, 'Altın TRY');
    const cash = nakit + doviz + altin;
    setHtml('kpi-cash', formatMoney(cash));
    setHtml('kpi-cash-breakdown', `TL: ${formatMoney(nakit)}<br>Döviz: ${formatMoney(doviz)}<br>Altın: ${formatMoney(altin)}`);

    // Portfolio Value with breakdown - calculate from hisseler
    const hisseler = state.data.hisseler || [];
    let mehmetTotal = 0, ahmetTotal = 0, salihTotal = 0;

    hisseler.forEach(h => {
        const hesap = h['Hesap'] || '';
        const adet = parseFloat(h['Adet'] || 0);
        const fiyat = parseFloat(h['Son İşlem Fiyatı'] || 0);
        const tutar = adet * fiyat;

        if (hesap.includes('Mehmet')) {
            mehmetTotal += tutar;
        } else if (hesap.includes('Ahmet Burak') || hesap.includes('Ahmet')) {
            ahmetTotal += tutar;
        } else if (hesap.includes('Salih')) {
            salihTotal += tutar;
        }
    });

    const stock = mehmetTotal + ahmetTotal + salihTotal;
    setHtml('kpi-stock', formatMoney(stock));
    setHtml('kpi-stock-breakdown', `Mehmet: ${formatMoney(mehmetTotal)}<br>Ahmet: ${formatMoney(ahmetTotal)}<br>Salih: ${formatMoney(salihTotal)}`);

    // Asset Distribution Pie Chart - TL, Döviz, Altın, Portföy
    const ctx = document.getElementById('asset-pie-chart');
    if (ctx) {
        if (assetPieChart) assetPieChart.destroy();

        const tlPct = total > 0 ? (nakit / total * 100) : 0;
        const dovizPct = total > 0 ? (doviz / total * 100) : 0;
        const altinPct = total > 0 ? (altin / total * 100) : 0;
        const stockPct = total > 0 ? (stock / total * 100) : 0;

        assetPieChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['TL', 'Döviz', 'Altın', 'Portföy'],
                datasets: [{
                    data: [tlPct, dovizPct, altinPct, stockPct],
                    backgroundColor: ['#34d399', '#fbbf24', '#f59e0b', '#60a5fa'],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: true,
                        position: 'bottom',
                        labels: {
                            color: 'rgb(156, 163, 175)',
                            font: { size: 9 },
                            padding: 6,
                            usePointStyle: true
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': %' + context.parsed.toFixed(1);
                            }
                        }
                    }
                }
            }
        });
    }
}

// ────────────────────────────────────────────────────────────────────────
// Render Portfolio Grouped by Bank
// ────────────────────────────────────────────────────────────────────────

function renderPortfolioGrouped() {
    const container = document.getElementById('portfolio-list');
    if (!container) return;
    container.innerHTML = '';

    const list = state.data.hisseler || [];
    const search = state.filterSearch.toLowerCase();
    const groups = {};

    // Group stocks by bank
    list.forEach(h => {
        const sembol = h['Sembol'] || h['Hisse Kodu'] || '';
        if (!sembol || !sembol.toLowerCase().includes(search)) return;

        const banka = h['Hesap'] || 'Diğer';
        if (!groups[banka]) groups[banka] = { items: [], totalVal: 0, totalKZ: 0 };

        const adet = parseFloat(h['Adet'] || 0);
        const fiyat = parseFloat(h['Son İşlem Fiyatı'] || 0);
        const maliyet = parseFloat(h['Ortalama Maliyet'] || 0);

        // Parse daily change: "1,65%" or "-1,92%" format
        let degisimRaw = h['Günlük Değişim'] || h['Değişim'] || 0;
        let degisim = 0;
        if (typeof degisimRaw === 'string') {
            degisim = parseFloat(degisimRaw.replace('%', '').replace(',', '.')) || 0;
        } else {
            degisim = parseFloat(degisimRaw) || 0;
            // If decimal like 0.0165, multiply by 100
            if (Math.abs(degisim) < 1 && degisim !== 0) degisim = degisim * 100;
        }

        const tutar = parseFloat(h['Tutar'] || (adet * fiyat));
        const kz = parseFloat(h['Olası Kar/Zarar'] || (tutar - (adet * maliyet)));

        h._calc = { adet, fiyat, maliyet, degisim, tutar, kz, sembol };
        groups[banka].items.push(h);
        groups[banka].totalVal += tutar;
        groups[banka].totalKZ += kz;
    });

    // Render each group
    Object.keys(groups).forEach(bankName => {
        const grp = groups[bankName];
        const plClass = grp.totalKZ >= 0 ? 'text-up' : 'text-down';

        const headerHtml = `
            <div class="group-header">
                <div class="group-title">
                    ${bankName}
                    <span class="group-badge">${grp.items.length}</span>
                </div>
                <div class="text-right">
                    <div class="group-total num text-muted">
                        T: <span class="sensitive" style="color:var(--text-primary)">${formatMoney(grp.totalVal)}</span>
                    </div>
                    <div class="num ${plClass} sensitive" style="font-size:11px">
                        K/Z: ${formatMoney(grp.totalKZ)}
                    </div>
                </div>
            </div>
        `;

        let rowsHtml = `
            <table style="width:100%">
                <thead>
                    <tr>
                        <th style="padding-left:24px">Sembol</th>
                        <th class="text-right">Fiyat</th>
                        <th class="text-right">%</th>
                        <th class="text-right">Maliyet</th>
                        <th class="text-right">Değer</th>
                        <th class="text-right" style="padding-right:24px">K/Z</th>
                    </tr>
                </thead>
                <tbody>
        `;

        grp.items.forEach(h => {
            const { sembol, fiyat, maliyet, degisim, tutar, kz } = h._calc;
            const color = kz >= 0 ? 'text-up' : 'text-down';
            const degColor = degisim >= 0 ? 'text-up' : 'text-down';
            const degSign = degisim >= 0 ? '+' : '';
            rowsHtml += `
                <tr>
                    <td class="fw-medium" style="padding-left:24px">
                        <span class="stock-link" onclick="openInvesting('${sembol}')" title="Investing.com'da aç">${sembol}</span>
                        <span class="text-muted" style="font-size:11px">(${h._calc.adet})</span>
                    </td>
                    <td class="text-right num">${formatMoney(fiyat)}</td>
                    <td class="text-right num ${degColor}" style="font-size:12px">${degSign}${degisim.toFixed(2)}</td>
                    <td class="text-right num text-muted">${formatMoney(maliyet)}</td>
                    <td class="text-right num fw-medium sensitive">${formatMoney(tutar)}</td>
                    <td class="text-right num ${color} sensitive" style="padding-right:24px">${formatMoney(kz)}</td>
                </tr>
            `;
        });

        rowsHtml += `</tbody></table>`;

        const section = document.createElement('div');
        section.innerHTML = headerHtml + rowsHtml;
        container.appendChild(section);
    });
}

// ────────────────────────────────────────────────────────────────────────
// Render Accounts with Currency Conversion
// ────────────────────────────────────────────────────────────────────────

function renderAccounts() {
    const grid = document.getElementById('accounts-grid');
    if (!grid) return;
    grid.innerHTML = '';

    const accs = state.data.hesaplar || [];
    const grouped = {};
    const kurlar = state.data.kurlar || {};

    // Group accounts by bank
    accs.forEach(a => {
        const banka = a['Banka'] || 'Diğer';
        if (!grouped[banka]) grouped[banka] = { items: [], totalTRY: 0, goldUnits: {} };

        const rawVal = parseFloat(a['Bakiye'] || 0);
        const pb = a['PB'] || 'TRY';
        const hesapAdi = a['Hesap Adı'] || '';

        // Calculate TRY equivalent
        let valTRY = rawVal;
        let exchangeRate = 1;
        let goldType = null;

        if (pb !== 'TRY') {
            // Check if it's a gold account (15 Altın, 15 Çeyrek, Cumhuriyet, Bilezik)
            if (pb === 'Altın' || hesapAdi.includes('Altın') || hesapAdi.includes('Çeyrek') || hesapAdi.includes('Cumhuriyet') || hesapAdi.includes('Bilezik')) {
                // Determine gold type from account name and use correct formula
                if (hesapAdi.includes('15 Altın') || hesapAdi === 'Altın') {
                    goldType = '15 Altın';
                    // Formula: GRA × rawVal (rawVal is the quantity)
                    if (kurlar['GRA']) {
                        valTRY = rawVal * kurlar['GRA'].alis;
                    }
                } else if (hesapAdi.includes('15 Çeyrek') || hesapAdi.includes('Çeyrek')) {
                    goldType = '15 Çeyrek';
                    // Formula: CEYREKALTIN × rawVal (rawVal should be something like 6)
                    // But based on Excel: CEYREKALTIN × 6 (fixed multiplier)
                    if (kurlar['CEYREKALTIN']) {
                        valTRY = kurlar['CEYREKALTIN'].alis * rawVal;
                    } else if (kurlar['GRA']) {
                        valTRY = kurlar['GRA'].alis * rawVal; // Fallback
                    }
                } else if (hesapAdi.includes('Cumhuriyet')) {
                    goldType = 'Cumhuriyet';
                    // Formula: CUMHURIYETALTINI × rawVal (rawVal should be 5)
                    if (kurlar['CUMHURIYETALTINI']) {
                        valTRY = kurlar['CUMHURIYETALTINI'].alis * rawVal;
                    } else if (kurlar['GRA']) {
                        valTRY = kurlar['GRA'].alis * rawVal; // Fallback
                    }
                } else if (hesapAdi.includes('Bilezik')) {
                    goldType = 'Bilezik';
                    // Formula: YIA × rawVal × 25 (rawVal should be 2, 25 is grams per bracelet)
                    if (kurlar['YIA']) {
                        valTRY = kurlar['YIA'].alis * rawVal * 25;
                    } else if (kurlar['GRA']) {
                        valTRY = kurlar['GRA'].alis * rawVal * 25; // Fallback
                    }
                } else {
                    goldType = 'Altın';
                    if (kurlar['GRA']) {
                        valTRY = rawVal * kurlar['GRA'].alis;
                    }
                }

                // Track gold units separately
                if (!grouped[banka].goldUnits[goldType]) {
                    grouped[banka].goldUnits[goldType] = 0;
                }
                grouped[banka].goldUnits[goldType] += rawVal;

                // Exchange rate not used since we calculated valTRY directly
                exchangeRate = 1;
            } else if (kurlar[pb]) {
                exchangeRate = kurlar[pb].alis;
                valTRY = rawVal * exchangeRate;
            }
        }

        a._calculated = { rawVal, pb, valTRY, goldType };
        grouped[banka].items.push(a);
        grouped[banka].totalTRY += valTRY;
    });

    // Render each group
    Object.keys(grouped).forEach(bank => {
        const grp = grouped[bank];
        const div = document.createElement('div');
        div.className = 'table-wrapper';

        let rows = '';
        grp.items.forEach(a => {
            const { rawVal, pb, valTRY, goldType } = a._calculated;
            const displayVal = formatMoney(valTRY);
            const subText = goldType ? `${rawVal} ${goldType}` : (pb !== 'TRY' ? `${rawVal} ${pb}` : 'TRY');

            rows += `
                <tr>
                    <td style="padding:12px 24px">
                        <div class="fw-medium">${a['Hesap Adı'] || '-'}</div>
                        <div style="font-size:11px" class="text-muted num">${a['IBAN'] || ''}</div>
                    </td>
                    <td class="text-right">
                        <div class="num fw-medium sensitive">${displayVal} ₺</div>
                        <div class="text-muted num sensitive" style="font-size:11px">${subText}</div>
                    </td>
                </tr>
            `;
        });

        // Build gold summary if any
        let goldSummary = '';
        if (Object.keys(grp.goldUnits).length > 0) {
            const goldParts = Object.entries(grp.goldUnits).map(([type, amount]) => {
                return `${amount} ${type}`;
            });
            goldSummary = `<div style="font-size:11px; color:var(--text-tertiary); margin-top:4px;">${goldParts.join(' | ')}</div>`;
        }

        div.innerHTML = `
            <div style="padding:12px 24px; border-bottom:1px solid var(--border-subtle); background:var(--bg-surface-hover);">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:600; font-size:12px; letter-spacing:0.05em; color:var(--text-tertiary); text-transform:uppercase;">${bank}</span>
                    <span class="num text-primary sensitive" style="font-size:13px; font-weight:600;">≈ ${formatMoney(grp.totalTRY)} ₺</span>
                </div>
                ${goldSummary}
            </div>
            <table>${rows}</table>
        `;
        grid.appendChild(div);
    });
}

// ────────────────────────────────────────────────────────────────────────
// Render Movements/Transactions
// ────────────────────────────────────────────────────────────────────────

function renderMovements() {
    const tbody = document.getElementById('movements-body');
    if (!tbody) return;
    tbody.innerHTML = '';

    const raw = state.data.hareketler || [];
    const sorted = [...raw].reverse();
    const now = new Date();

    // Filter by time range
    let filtered = sorted.filter(m => {
        if (!m['Tarih']) return false;
        const d = new Date(m['Tarih']);
        if (state.filterMovements === 'all') return true;
        if (state.filterMovements === 'monthly') {
            return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
        }
        if (state.filterMovements === 'daily') {
            return d.toDateString() === now.toDateString();
        }
        return true;
    });

    filtered = filtered.slice(0, 50);

    // Calculate both income and expense
    let expense = 0;
    let income = 0;
    filtered.forEach(m => {
        const tutar = parseFloat(m['Tutar'] || 0);
        if (m['Ana Kategori'] === 'Gider') {
            expense += tutar;
        } else if (m['Ana Kategori'] === 'Gelir') {
            income += tutar;
        }
    });
    setHtml('mov-summary', `Gelir: <span class="text-up sensitive">+${formatMoney(income)}</span> &nbsp;│&nbsp; Gider: <span class="text-down sensitive">-${formatMoney(expense)}</span>`);

    // Render rows
    filtered.forEach(m => {
        const tutar = parseFloat(m['Tutar'] || 0);
        const isExp = m['Ana Kategori'] === 'Gider';
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td class="num text-muted">${formatDate(m['Tarih'])}</td>
            <td>
                <div class="fw-medium">${m['Açıklama'] || '-'}</div>
                <div style="font-size:11px" class="text-muted">${m['Etiket'] || ''}</div>
            </td>
            <td>
                <span style="font-size:11px; padding:2px 8px; background:var(--bg-body); border-radius:4px; color:var(--text-tertiary)">
                    ${m['Alt Kategori'] || '-'}
                </span>
            </td>
            <td style="font-size:12px">${m['Banka'] || '-'}</td>
            <td class="text-right num fw-medium sensitive ${isExp ? '' : 'text-up'}">
                ${isExp ? '-' : '+'}${formatMoney(tutar)}
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ────────────────────────────────────────────────────────────────────────
// Render Market Overview
// ────────────────────────────────────────────────────────────────────────

function renderMarketNative() {
    const listContainer = document.getElementById('market-list');
    if (!listContainer) return;
    listContainer.innerHTML = '';

    const data = state.data.piyasa || [];
    if (data.length === 0) {
        listContainer.innerHTML = '<div style="color:var(--text-tertiary);text-align:center">Veri yok</div>';
        return;
    }

    const groups = {
        'KAR_EDEN': { title: 'Yükselen', items: [] },
        'ZARAR_EDEN': { title: 'Düşen', items: [] },
        'EN_AKTIF': { title: 'Hacimli', items: [] }
    };

    data.forEach(item => {
        const listType = item['Liste'];
        if (listType && groups[listType]) {
            groups[listType].items.push(item);
        }
    });

    // Render in order: Rising, Falling, Active
    const sortOrder = ['KAR_EDEN', 'ZARAR_EDEN', 'EN_AKTIF'];
    sortOrder.forEach(key => {
        const grp = groups[key];
        if (!grp || grp.items.length === 0) return;

        const titleDiv = document.createElement('div');
        titleDiv.className = 'market-category-title';
        titleDiv.innerText = grp.title;
        listContainer.appendChild(titleDiv);

        grp.items.slice(0, 5).forEach(s => {
            const sembol = s['Sembol'] || s['Isim'] || '-';
            const fark = parseFloat(s['Fark %'] || 0);
            const fiyat = parseFloat(s['Son Fiyat'] || 0);
            const isUp = fark >= 0;

            const itemDiv = document.createElement('div');
            itemDiv.className = 'market-list-item';
            itemDiv.innerHTML = `
                <div class="flex-col">
                    <span class="fw-semibold" style="font-size:13px">${sembol}</span>
                    <span class="text-muted num" style="font-size:11px">${formatMoney(fiyat)}</span>
                </div>
                <div class="num ${isUp ? 'text-up' : 'text-down'}" style="font-size:13px; font-weight:500;">
                    ${isUp ? '▲' : '▼'} %${(fark).toFixed(2)}
                </div>
            `;
            listContainer.appendChild(itemDiv);
        });
    });
}

// ════════════════════════════════════════════════════════════════════════
// EVENT HANDLERS
// ════════════════════════════════════════════════════════════════════════

function setupEvents() {
    // Tab navigation
    document.querySelectorAll('.tab-link').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.tab-link').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            ['portfolio', 'movements', 'accounts'].forEach(v => {
                const el = document.getElementById('view-' + v);
                if (el) el.classList.add('hidden');
            });

            const target = document.getElementById('view-' + e.target.dataset.tab);
            if (target) target.classList.remove('hidden');
        });
    });

    // Movement filter pills
    document.querySelectorAll('.filter-pill').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-pill').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            state.filterMovements = e.target.dataset.range;
            renderMovements();
        });
    });

    // Portfolio search
    const search = document.getElementById('portfolio-search');
    if (search) {
        search.addEventListener('input', (e) => {
            state.filterSearch = e.target.value;
            renderPortfolioGrouped();
        });
    }

    // Theme toggle
    document.getElementById('theme-btn').addEventListener('click', () => {
        applyTheme(state.theme === 'dark' ? 'light' : 'dark');
    });

    // Refresh button
    document.getElementById('refresh-btn').addEventListener('click', fetchData);

    // Privacy mode toggle
    document.getElementById('privacy-btn').addEventListener('click', () => {
        applyPrivacyMode(!state.privacyMode);
    });
}

// ════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ════════════════════════════════════════════════════════════════════════

function formatMoney(val) {
    return new Intl.NumberFormat('tr-TR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(val || 0);
}

function formatDate(str) {
    if (!str) return '-';
    return new Date(str).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'short'
    });
}

function setLoading(bool) {
    const el = document.getElementById('loader');
    if (el) {
        el.style.opacity = bool ? '1' : '0';
        setTimeout(() => {
            if (!bool) {
                el.classList.add('hidden');
            } else {
                el.classList.remove('hidden');
            }
        }, 500);
    }
}

function setHtml(id, val) {
    const el = document.getElementById(id);
    if (el) el.innerHTML = val;
}

function applyTheme(t) {
    document.body.setAttribute('data-theme', t);
    state.theme = t;
    localStorage.setItem('theme', t);
}

// ════════════════════════════════════════════════════════════════════════
// PRIVACY MODE
// ════════════════════════════════════════════════════════════════════════

function applyPrivacyMode(isPrivate) {
    state.privacyMode = isPrivate;
    localStorage.setItem('privacyMode', isPrivate);
    const btn = document.getElementById('privacy-btn');

    if (isPrivate) {
        document.body.classList.add('privacy-mode');
        if (btn) {
            btn.classList.add('active');
            btn.textContent = '🙈';
        }
    } else {
        document.body.classList.remove('privacy-mode');
        if (btn) {
            btn.classList.remove('active');
            btn.textContent = '👁';
        }
    }
}
