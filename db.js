const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Cria ou abre o banco de dados local
const dbPath = path.resolve(__dirname, 'financeiro.db');
const db = new sqlite3.Database(dbPath);

// Inicializa a tabela se não existir
db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS transacoes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      usuario_id TEXT,
      tipo TEXT, -- 'DESPESA' ou 'RECEITA'
      valor REAL,
      categoria TEXT,
      descricao TEXT,
      data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
});

module.exports = {
  // Adicionar transação
  adicionarTransacao: (usuario_id, tipo, valor, categoria, descricao) => {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare("INSERT INTO transacoes (usuario_id, tipo, valor, categoria, descricao) VALUES (?, ?, ?, ?, ?)");
      stmt.run(usuario_id, tipo, valor, categoria, descricao, function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
      stmt.finalize();
    });
  },

  // Consultar saldo/extrato por período
  consultarTransacoes: (usuario_id, periodo = 'mes') => {
    return new Promise((resolve, reject) => {
      let filtroData;
      
      // Definição de filtros de data (SQLite)
      if (periodo === 'dia') {
        filtroData = "date(data_criacao) = date('now')";
      } else if (periodo === 'semana') {
        filtroData = "date(data_criacao) >= date('now', '-7 days')";
      } else { // mes (padrão)
        filtroData = "strftime('%Y-%m', data_criacao) = strftime('%Y-%m', 'now')";
      }

      const sql = `SELECT * FROM transacoes WHERE usuario_id = ? AND ${filtroData}`;
      
      db.all(sql, [usuario_id], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },
  
  // Resumo financeiro total
  resumoFinanceiro: (usuario_id) => {
      return new Promise((resolve, reject) => {
          const sql = `
            SELECT 
                SUM(CASE WHEN tipo = 'RECEITA' THEN valor ELSE 0 END) as total_receitas,
                SUM(CASE WHEN tipo = 'DESPESA' THEN valor ELSE 0 END) as total_despesas
            FROM transacoes 
            WHERE usuario_id = ?
          `;
          db.get(sql, [usuario_id], (err, row) => {
              if (err) reject(err);
              else resolve(row);
          });
      });
  }
};
