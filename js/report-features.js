/**
 * Report and Enhanced Features
 * Annual report and charts
 *
 * Note: openInvesting() function is defined in app.js
 */

// ════════════════════════════════════════════════════════════════════════
// ANNUAL REPORT
// ════════════════════════════════════════════════════════════════════════

let myCharts = {};

function renderReport() {
    const year = parseInt(document.getElementById('report-year')?.value || new Date().getFullYear());
    const snapshots = state.data?.snapshots || [];
    const hareketler = state.data?.hareketler || [];
    const months = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

    // Debug: Check if we have data
    console.log('renderReport called for year:', year);
    console.log('Snapshots count:', snapshots.length);
    console.log('Hareketler count:', hareketler.length);
    console.log('First snapshot:', snapshots[0]);
    console.log('First hareket:', hareketler[0]);

    // Parse snapshot date
    const parseSnapDate = (s) => {
        const t = s['Tarih'];
        if (!t) return null;
        if (typeof t === 'string' && t.includes('T')) {
            return new Date(t);
        }
        if (typeof t === 'string' && t.includes('.')) {
            const p = t.split('.');
            return new Date(p[2], p[1] - 1, p[0]);
        }
        return new Date(t);
    };

    // Find previous year end snapshot
    const prevYearEnd = snapshots.find(s => {
        const d = parseSnapDate(s);
        return d && d.getFullYear() === (year - 1) && d.getMonth() === 11;
    });
    let startTotal = prevYearEnd ? parseFloat(prevYearEnd['Toplam Varlık'] || 0) : 0;

    // Calculate monthly stats
    const monthlyStats = [];
    let yearlyIncome = 0, yearlyExpense = 0, endTotal = 0;

    for (let i = 0; i < 12; i++) {
        const monthSnaps = snapshots.filter(s => {
            const d = parseSnapDate(s);
            return d && d.getFullYear() === year && d.getMonth() === i;
        }).sort((a, b) => parseSnapDate(a) - parseSnapDate(b));

        const monthStart = i === 0 && monthSnaps.length > 0 ? (prevYearEnd ? parseFloat(prevYearEnd['Toplam Varlık'] || 0) : parseFloat(monthSnaps[0]['Toplam Varlık'] || 0)) : (monthlyStats[i - 1]?.endAsset || 0);
        const monthEnd = monthSnaps.length > 0 ? parseFloat(monthSnaps[monthSnaps.length - 1]['Toplam Varlık'] || 0) : monthStart;
        const assetChange = monthEnd - monthStart;

        const monthMovements = hareketler.filter(m => {
            if (!m['Tarih']) return false;
            const d = new Date(m['Tarih']);
            return d.getFullYear() === year && d.getMonth() === i;
        });

        let income = 0, expense = 0;
        monthMovements.forEach(m => {
            const amt = parseFloat(m['Tutar'] || 0);
            if (m['Ana Kategori'] === 'Gelir') income += amt;
            else if (m['Ana Kategori'] === 'Gider') expense += amt;
        });

        const savings = income - expense;
        const savingsRate = income > 0 ? (savings / income * 100) : 0;

        monthlyStats.push({
            month: months[i],
            startAsset: monthStart,
            endAsset: monthEnd,
            assetChange,
            income,
            expense,
            savings,
            savingsRate
        });

        yearlyIncome += income;
        yearlyExpense += expense;
        if (i === 11) endTotal = monthEnd;
    });

    const yearlySavings = yearlyIncome - yearlyExpense;
    const yearlySavingsRate = yearlyIncome > 0 ? (yearlySavings / yearlyIncome * 100) : 0;
    const assetGrowth = endTotal - startTotal;
    const assetGrowthPct = startTotal > 0 ? (assetGrowth / startTotal * 100) : 0;

    // Render summary cards
    renderReportCards({
        year,
        startTotal,
        endTotal,
        assetGrowth,
        assetGrowthPct,
        yearlyIncome,
        yearlyExpense,
        yearlySavings,
        yearlySavingsRate
    });

    // Render monthly table
    renderReportTable(monthlyStats, {
        yearlyIncome,
        yearlyExpense,
        yearlySavings,
        yearlySavingsRate,
        assetGrowth,
        startTotal,
        endTotal
    });

    // Render charts
    renderReportCharts(monthlyStats);
}

function renderReportCards(data) {
    const cards = document.getElementById('report-cards');
    if (!cards) return;

    const growthClass = data.assetGrowth >= 0 ? 'text-up' : 'text-down';
    const savingsClass = data.yearlySavings >= 0 ? 'text-up' : 'text-down';

    cards.innerHTML = `
        <div class="card-kpi">
            <div class="label">Başlangıç Varlık</div>
            <div class="value-lg num sensitive">${formatMoney(data.startTotal)} ₺</div>
            <div class="sub-value text-muted">${data.year - 1} Sonu</div>
        </div>
        <div class="card-kpi">
            <div class="label">Bitiş Varlık</div>
            <div class="value-lg num sensitive">${formatMoney(data.endTotal)} ₺</div>
            <div class="sub-value text-muted">${data.year} Sonu</div>
        </div>
        <div class="card-kpi">
            <div class="label">Varlık Büyümesi</div>
            <div class="value-lg num sensitive ${growthClass}">${data.assetGrowth >= 0 ? '+' : ''}${formatMoney(data.assetGrowth)} ₺</div>
            <div class="sub-value num ${growthClass}">%${data.assetGrowthPct.toFixed(2)}</div>
        </div>
        <div class="card-kpi">
            <div class="label">Toplam Gelir</div>
            <div class="value-lg num sensitive text-up">+${formatMoney(data.yearlyIncome)} ₺</div>
            <div class="sub-value text-muted">${data.year}</div>
        </div>
        <div class="card-kpi">
            <div class="label">Toplam Gider</div>
            <div class="value-lg num sensitive text-down">-${formatMoney(data.yearlyExpense)} ₺</div>
            <div class="sub-value text-muted">${data.year}</div>
        </div>
        <div class="card-kpi">
            <div class="label">Net Tasarruf</div>
            <div class="value-lg num sensitive ${savingsClass}">${data.yearlySavings >= 0 ? '+' : ''}${formatMoney(data.yearlySavings)} ₺</div>
            <div class="sub-value num ${savingsClass}">%${data.yearlySavingsRate.toFixed(1)} Oran</div>
        </div>
    `;
}

function renderReportTable(monthlyStats, totals) {
    const tbody = document.getElementById('report-body');
    const tfoot = document.getElementById('report-footer');
    if (!tbody || !tfoot) return;

    tbody.innerHTML = '';
    monthlyStats.forEach(m => {
        const changeClass = m.assetChange >= 0 ? 'text-up' : 'text-down';
        const savingsClass = m.savings >= 0 ? 'text-up' : 'text-down';
        const rateClass = m.savingsRate >= 50 ? 'text-up' : m.savingsRate >= 20 ? 'text-muted' : 'text-down';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td style="padding-left:24px" class="fw-medium">${m.month}</td>
            <td class="text-right num sensitive">${formatMoney(m.startAsset)}</td>
            <td class="text-right num sensitive">${formatMoney(m.endAsset)}</td>
            <td class="text-right num sensitive ${changeClass}">${m.assetChange >= 0 ? '+' : ''}${formatMoney(m.assetChange)}</td>
            <td class="text-right num sensitive text-up">+${formatMoney(m.income)}</td>
            <td class="text-right num sensitive text-down">-${formatMoney(m.expense)}</td>
            <td class="text-right num sensitive ${savingsClass}">${m.savings >= 0 ? '+' : ''}${formatMoney(m.savings)}</td>
            <td class="text-right num ${rateClass}" style="padding-right:24px">%${m.savingsRate.toFixed(1)}</td>
        `;
        tbody.appendChild(tr);
    });

    const totalChangeClass = totals.assetGrowth >= 0 ? 'text-up' : 'text-down';
    const totalSavingsClass = totals.yearlySavings >= 0 ? 'text-up' : 'text-down';
    const totalRateClass = totals.yearlySavingsRate >= 50 ? 'text-up' : totals.yearlySavingsRate >= 20 ? 'text-muted' : 'text-down';

    tfoot.innerHTML = `
        <tr style="font-weight:600; background:var(--bg-surface-hover);">
            <td style="padding:16px 24px">TOPLAM</td>
            <td class="text-right num sensitive">${formatMoney(totals.startTotal)}</td>
            <td class="text-right num sensitive">${formatMoney(totals.endTotal)}</td>
            <td class="text-right num sensitive ${totalChangeClass}">${totals.assetGrowth >= 0 ? '+' : ''}${formatMoney(totals.assetGrowth)}</td>
            <td class="text-right num sensitive text-up">+${formatMoney(totals.yearlyIncome)}</td>
            <td class="text-right num sensitive text-down">-${formatMoney(totals.yearlyExpense)}</td>
            <td class="text-right num sensitive ${totalSavingsClass}">${totals.yearlySavings >= 0 ? '+' : ''}${formatMoney(totals.yearlySavings)}</td>
            <td class="text-right num ${totalRateClass}" style="padding-right:24px">%${totals.yearlySavingsRate.toFixed(1)}</td>
        </tr>
    `;
}

function renderReportCharts(monthlyStats) {
    const labels = monthlyStats.map(m => m.month);
    const assetData = monthlyStats.map(m => m.endAsset);
    const incomeData = monthlyStats.map(m => m.income);
    const expenseData = monthlyStats.map(m => m.expense);
    const savingsData = monthlyStats.map(m => m.savings);
    const stockData = monthlyStats.map(m => m.endAsset); // Simplified

    // Debug: Check chart data
    console.log('Chart labels:', labels);
    console.log('Asset data:', assetData);
    console.log('Income data:', incomeData);
    console.log('Expense data:', expenseData);
    console.log('Savings data:', savingsData);

    // Destroy old charts
    Object.values(myCharts).forEach(chart => chart?.destroy());
    myCharts = {};

    // Total Assets Chart
    const ctx1 = document.getElementById('chart-total-assets');
    if (ctx1) {
        myCharts.totalAssets = new Chart(ctx1, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Toplam Varlık',
                    data: assetData,
                    borderColor: 'rgb(96, 165, 250)',
                    backgroundColor: 'rgba(96, 165, 250, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }

    // Income vs Expense Chart
    const ctx2 = document.getElementById('chart-income-expense');
    if (ctx2) {
        myCharts.incomeExpense = new Chart(ctx2, {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    {
                        label: 'Gelir',
                        data: incomeData,
                        backgroundColor: 'rgba(52, 211, 153, 0.8)'
                    },
                    {
                        label: 'Gider',
                        data: expenseData,
                        backgroundColor: 'rgba(248, 113, 113, 0.8)'
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: true, position: 'top' } }
            }
        });
    }

    // Stock Portfolio Chart
    const ctx3 = document.getElementById('chart-stock-trend');
    if (ctx3) {
        myCharts.stockTrend = new Chart(ctx3, {
            type: 'line',
            data: {
                labels,
                datasets: [{
                    label: 'Hisse Portföyü',
                    data: stockData,
                    borderColor: 'rgb(139, 92, 246)',
                    backgroundColor: 'rgba(139, 92, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }

    // Savings Chart
    const ctx4 = document.getElementById('chart-savings');
    if (ctx4) {
        myCharts.savings = new Chart(ctx4, {
            type: 'bar',
            data: {
                labels,
                datasets: [{
                    label: 'Tasarruf',
                    data: savingsData,
                    backgroundColor: savingsData.map(v => v >= 0 ? 'rgba(52, 211, 153, 0.8)' : 'rgba(248, 113, 113, 0.8)')
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } }
            }
        });
    }
}

// Make renderReport globally available
window.renderReport = renderReport;
