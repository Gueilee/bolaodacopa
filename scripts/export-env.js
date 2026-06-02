const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');
const targetPath = '/etc/environment';

if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  const lines = content.split(/\r?\n/);
  let output = '';

  for (let line of lines) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;

    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?$/);
    if (match) {
      const key = match[1];
      let value = match[2] || '';

      if (value.startsWith("'")) {
        const qMatch = value.match(/^'([^']*)'/);
        if (qMatch) value = qMatch[1];
      } else if (value.startsWith('"')) {
        const qMatch = value.match(/^"([^"]*)"/);
        if (qMatch) value = qMatch[1];
      } else {
        value = value.split(/\s+#/)[0].trim();
      }

      output += `${key}="${value.replace(/"/g, '\\"')}"\n`;
    }
  }

  fs.appendFileSync(targetPath, '\n' + output);
  console.log('✅ Variáveis de ambiente exportadas para o Cron.');
} else {
  console.warn('⚠️ Arquivo .env não encontrado para exportar para o Cron.');
}
