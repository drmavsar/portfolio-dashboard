/**
 * Reports Module
 * Asset composition charts and analytics
 */

let assetCompositionChart = null;

function renderReports() {
    const snapshots = state.data?.snapshots || [];
    if (snapshots.length === 0) return;

    // Get chronological data (oldest to newest)
    const sortedSnaps = [...snapshots].reverse();

    // Extract data arrays
    const dates = sortedSnaps.map(s => s['Tarih'] ? new Date(s['Tarih']).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit' }) : '');
    const dataNakit = sortedSnaps.map(s => parseFloat(s['Nakit TRY'] || 0));
    const dataDoviz = sortedSnaps.map(s => parseFloat(s['Döviz TRY'] || 0));
    const dataAltin = sortedSnaps.map(s => parseFloat(s['Altın TRY'] || 0));
    const dataHisse = sortedSnaps.map(s => parseFloat(s['Hisse TRY'] || 0));

    // Calculate totals
    const totals = sortedSnaps.map(s => parseFloat(s['Toplam Varlık'] || 0));
    const lastTotal = totals[totals.length - 1];
    const firstTotal = totals[0];
    const totalChg = ((lastTotal - firstTotal) / firstTotal) * 100;

    // Update KPI chips
    document.getElementById('chip-total').innerHTML = `<strong>Toplam:</strong> <span class="sensitive">${formatMoney(lastTotal)}</span>`;
    document.getElementById('chip-change').innerHTML = `<strong>Değişim:</strong> <span class="sensitive ${totalChg >= 0 ? 'text-up' : 'text-down'}">${totalChg >= 0 ? '▲' : '▼'} %${Math.abs(totalChg).toFixed(2)}</span>`;

    // Update breakdown percentages
    const wN = (dataNakit[dataNakit.length - 1] / lastTotal) * 100;
    const wD = (dataDoviz[dataDoviz.length - 1] / lastTotal) * 100;
    const wA = (dataAltin[dataAltin.length - 1] / lastTotal) * 100;
    const wH = (dataHisse[dataHisse.length - 1] / lastTotal) * 100;

    const breakdownEl = document.getElementById('asset-breakdown');
    if (breakdownEl) {
        breakdownEl.innerHTML = `
            <span style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:999px; padding:6px 12px;">Nakit: %${wN.toFixed(1)}</span>
            <span style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:999px; padding:6px 12px;">Döviz: %${wD.toFixed(1)}</span>
            <span style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:999px; padding:6px 12px;">Altın: %${wA.toFixed(1)}</span>
            <span style="background:rgba(255,255,255,0.04); border:1px solid rgba(255,255,255,0.08); border-radius:999px; padding:6px 12px;">Hisse: %${wH.toFixed(1)}</span>
        `;
    }

    // Render chart
    renderAssetCompositionChart(dates, dataNakit, dataDoviz, dataAltin, dataHisse, totals);
}

function renderAssetCompositionChart(dates, dataNakit, dataDoviz, dataAltin, dataHisse, totals) {
    const ctx = document.getElementById('asset-composition-chart');
    if (!ctx) return;

    // Helper to convert to 100-base index
    function toIndex100(arr) {
        const base = arr[0];
        return arr.map(v => (v / base) * 100);
    }

    // Build datasets (normalized or absolute)
    function buildDatasets(isNormalized) {
        const series = [
            { name: 'Nakit TRY', data: dataNakit, color: 'rgba(52, 211, 153, 0.7)', borderColor: 'rgb(52, 211, 153)' },
            { name: 'Döviz TRY', data: dataDoviz, color: 'rgba(251, 191, 36, 0.7)', borderColor: 'rgb(251, 191, 36)' },
            { name: 'Altın TRY', data: dataAltin, color: 'rgba(245, 158, 11, 0.7)', borderColor: 'rgb(245, 158, 11)' },
            { name: 'Hisse', data: dataHisse, color: 'rgba(96, 165, 250, 0.7)', borderColor: 'rgb(96, 165, 250)' }
        ];

        return series.map(s => ({
            label: s.name,
            data: isNormalized ? toIndex100(s.data) : s.data,
            backgroundColor: s.color,
            borderColor: s.borderColor,
            borderWidth: 1.5,
            fill: true,
            tension: 0.3,
            pointRadius: 2,
            pointHoverRadius: 4
        }));
    }

    // Destroy existing chart
    if (assetCompositionChart) {
        assetCompositionChart.destroy();
    }

    // Create chart
    assetCompositionChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: buildDatasets(false)
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false
            },
            plugins: {
                legend: {
                    labels: {
                        color: 'rgb(156, 163, 175)',
                        font: { size: 11 },
                        padding: 12,
                        usePointStyle: true
                    }
                },
                tooltip: {
                    callbacks: {
                        label: (ctx) => {
                            const v = ctx.parsed.y;
                            const lbl = ctx.dataset.label;
                            const isNormalized = document.getElementById('toggle-normalize')?.checked;
                            if (isNormalized) {
                                return `${lbl}: ${v.toFixed(1)} (100=baz)`;
                            }
                            return `${lbl}: ${formatMoney(v)}`;
                        },
                        footer: (items) => {
                            if (!items || items.length === 0) return '';
                            const isNormalized = document.getElementById('toggle-normalize')?.checked;
                            if (isNormalized) {
                                const idx = items[0].dataIndex;
                                return `TOPLAM (orijinal): ${formatMoney(totals[idx])}`;
                            }
                            let sum = 0;
                            items.forEach(it => sum += it.parsed.y);
                            return `TOPLAM: ${formatMoney(sum)}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.08)'
                    },
                    ticks: {
                        color: 'rgba(156, 163, 175, 0.8)',
                        font: { size: 10 }
                    }
                },
                y: {
                    stacked: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.08)'
                    },
                    ticks: {
                        color: 'rgba(156, 163, 175, 0.8)',
                        font: { size: 10 },
                        callback: function(value) {
                            const isNormalized = document.getElementById('toggle-normalize')?.checked;
                            if (isNormalized) {
                                return value.toFixed(0);
                            }
                            // Show in millions
                            return '₺' + (value / 1_000_000).toFixed(1) + 'M';
                        }
                    }
                }
            }
        }
    });

    // Setup normalize toggle
    const toggleNormalize = document.getElementById('toggle-normalize');
    if (toggleNormalize) {
        toggleNormalize.addEventListener('change', (e) => {
            const normalized = e.target.checked;
            assetCompositionChart.data.datasets = buildDatasets(normalized);
            assetCompositionChart.update();
        });
    }
}

// Make globally available
window.renderReports = renderReports;
