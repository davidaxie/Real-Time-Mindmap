// UI Controls module

export function setAIStatus(message, success = false, error = null) {
  const aiStatus = document.getElementById('ai-status');
  if (!aiStatus) return;

  aiStatus.innerHTML = '';
  const pill = document.createElement('div');
  pill.className = success
    ? 'metric-pill success'
    : error
    ? 'metric-pill danger'
    : 'metric-pill';
  pill.textContent = message;
  aiStatus.appendChild(pill);

  if (error) {
    const errorText = document.createElement('small');
    errorText.textContent = error;
    errorText.style.color = '#b91c1c';
    aiStatus.appendChild(errorText);
  }
}

export function displayAISummary(analysis) {
  const aiOutput = document.getElementById('ai-output');
  if (!aiOutput) return;

  let summaryHTML = '';

  if (analysis.summary) {
    summaryHTML += `<p><strong>Summary:</strong> ${analysis.summary}</p>`;
  }

  if (analysis.themes && analysis.themes.length > 0) {
    summaryHTML += `<p><strong>Themes:</strong> ${analysis.themes.join(', ')}</p>`;
  }

  if (analysis.concepts && analysis.concepts.length > 0) {
    summaryHTML += `<p><strong>Key Concepts:</strong> ${analysis.concepts.slice(0, 10).join(', ')}</p>`;
  }

  aiOutput.innerHTML = summaryHTML || '<p>Analysis complete.</p>';
}

export function exportJSON(segments, concepts, edges) {
  const payload = {
    exportedAt: new Date().toISOString(),
    segments,
    nodes: Array.from(concepts),
    edges: Array.from(edges)
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], {
    type: 'application/json'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `mindmap-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function appendSegment(text, timestamp) {
  const transcriptLog = document.getElementById('transcript-log');
  if (!transcriptLog) return;

  const wrapper = document.createElement('div');
  wrapper.className = 'segment';
  
  const timeEl = document.createElement('time');
  timeEl.textContent = new Date(timestamp).toLocaleTimeString();
  
  const textEl = document.createElement('p');
  textEl.textContent = text;
  
  wrapper.appendChild(timeEl);
  wrapper.appendChild(textEl);
  transcriptLog.prepend(wrapper);
}

export function setStatus(text, active) {
  const statusText = document.getElementById('status-text');
  const statusIndicator = document.getElementById('status-indicator');
  
  if (statusText) statusText.textContent = text;
  if (statusIndicator) {
    statusIndicator.classList.toggle('active', active);
  }
}

export function updateButtonStates({ 
  startDisabled, 
  pauseDisabled, 
  stopDisabled, 
  exportDisabled,
  pauseText = 'Pause' 
}) {
  const startBtn = document.getElementById('start-btn');
  const pauseBtn = document.getElementById('pause-btn');
  const stopBtn = document.getElementById('stop-btn');
  const exportBtn = document.getElementById('export-btn');

  if (startBtn) startBtn.disabled = startDisabled;
  if (pauseBtn) {
    pauseBtn.disabled = pauseDisabled;
    pauseBtn.textContent = pauseText;
  }
  if (stopBtn) stopBtn.disabled = stopDisabled;
  if (exportBtn) exportBtn.disabled = exportDisabled;
}

export function updateLiveTranscript(text, isFinal = false) {
  const liveTranscript = document.getElementById('live-transcript');
  if (!liveTranscript) return;
  
  const prefix = isFinal ? '✔' : '…';
  liveTranscript.textContent = `${prefix} ${text}`;
}
