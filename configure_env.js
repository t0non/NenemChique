const fs = require('fs');
const path = require('path');

const envJsPath = path.join(__dirname, 'out', 'env.js');

console.log('=== Configurador de Ambiente para Deploy ===\n');

// Pergunta ao usuário pelas credenciais
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
);

readline.question('Digite sua URL do Supabase (ex: https://xyz.supabase.co): ', (supabaseUrl) => {
  readline.question('Digite sua ANON KEY do Supabase: ', (anonKey) => {
    
    const envContent = `window.__NENEM_ENV={SUPABASE_URL:"${supabaseUrl.trim()}",SUPABASE_ANON_KEY:"${anonKey.trim()}"};`;
    
    try {
      fs.writeFileSync(envJsPath, envContent, { encoding: 'utf8' });
      console.log('\n✅ Arquivo env.js configurado com sucesso!');
      console.log('📁 Local:', envJsPath);
      console.log('\n🚀 Pasta "out" pronta para fazer deploy no hosting!');
      console.log('\n📋 Não se esqueça:');
      console.log('   • Fazer upload de todo o conteúdo da pasta "out/"');
      console.log('   • Manter o arquivo .htaccess');
      console.log('   • Testar o site após o upload');
    } catch (err) {
      console.error('\n❌ Erro ao configurar env.js:', err.message);
    }
    
    readline.close();
  });
});
