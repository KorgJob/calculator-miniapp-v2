let chart;

function correction_hrx(f, hrx) {
  if (f < 200) {
    return 8.29 * Math.pow(Math.log10(1.54 * hrx), 2) - 1.1;
  } else if (f <= 1500) {
    return (1.1 * Math.log10(f) - 0.7) * hrx - (1.56 * Math.log10(f) - 0.8);
  } else {
    return 3.2 * Math.pow(Math.log10(11.75 * hrx), 2) - 4.97;
  }
}

function path_loss_hata(f, htx, hrx, d, terrain) {
  let a_hrx = correction_hrx(f, hrx);
  let L = 69.55 + 26.16 * Math.log10(f) - 13.82 * Math.log10(htx) - a_hrx +
          (44.9 - 6.55 * Math.log10(htx)) * Math.log10(d);

  if (terrain === "suburban") {
    L = L - 4.0;
  } else if (terrain === "rural") {
    L = L - (4.78 * Math.pow(Math.log10(f), 2) - 18.33 * Math.log10(f) + 40.94);
  }
  return L;
}

function calculate() {
  const f = parseFloat(document.getElementById('freq').value);
  const p_tx = parseFloat(document.getElementById('p_tx').value);
  const g_tx = parseFloat(document.getElementById('g_tx').value);
  const g_rx = parseFloat(document.getElementById('g_rx').value);
  const sensitivity = parseFloat(document.getElementById('sensitivity').value);
  const h_tx = parseFloat(document.getElementById('h_tx').value);
  const h_rx = parseFloat(document.getElementById('h_rx').value);
  const terrain = document.getElementById('terrain').value;

  let d_max = 0;
  let prx_at_dmax = 0;

  
  for (let d = 0.1; d <= 50; d += 0.1) {
    let L = path_loss_hata(f, h_tx, h_rx, d, terrain);
    let prx = p_tx + g_tx + g_rx - L;
    if (prx >= sensitivity) {
      d_max = d;
      prx_at_dmax = prx;
    }
  }

  document.getElementById('result').innerHTML = `
    Максимальная дальность: ${d_max.toFixed(2)} км <br>
    Уровень сигнала на приёмнике: ${prx_at_dmax.toFixed(2)} дБм
  `;

  
  let distances = [];
  let prx_values = [];

  for (let d = 0.1; d <= 50; d += 0.5) {
    let L = path_loss_hata(f, h_tx, h_rx, d, terrain);
    let prx = p_tx + g_tx + g_rx - L;
    distances.push(d.toFixed(1));
    prx_values.push(prx);
  }

  if (chart) {
    chart.destroy();
  }

  const ctx = document.getElementById('chart').getContext('2d');
  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: distances,
      datasets: [{
        label: 'Уровень сигнала (дБм)',
        data: prx_values,
        borderColor: 'blue',
        fill: false,
      }]
    },
    options: {
      responsive: true,
      scales: {
        x: { title: { display: true, text: 'Расстояние (км)' } },
        y: { title: { display: true, text: 'Prx (дБм)' } }
      }
    }
  });
}