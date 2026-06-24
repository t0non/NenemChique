# Instruções de Deploy - Neném Chique

## 📁 Arquivos Prontos para Deploy

A pasta `out/` contém todos os arquivos otimizados para produção. Basta fazer o upload do conteúdo desta pasta para seu hosting.

## 🔧 Configuração Necessária ANTES do Deploy

### 1. Configurar variáveis do Supabase

Edite o arquivo `out/env.js` e substitua os valores vazios pelas suas credenciais do Supabase:

```javascript
window.__NENEM_ENV={
  SUPABASE_URL:"https://SEU-PROJETO.supabase.co",
  SUPABASE_ANON_KEY:"SUA-CHAVE-ANON"
};
```

**Onde encontrar essas informações:**
1. Acesse https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá para Settings > API
4. Copie a URL e a anon key

### 2. Opcional: Adicionar colunas ao banco (se ainda não fez)

Execute no SQL Editor do Supabase:
```sql
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_best_seller boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS best_seller_rank integer;
```

## 🚀 Como Fazer o Deploy

### Para Hostinger (e outros hostings compartilhados):

1. **Acesse seu painel do Hostinger**
2. **Vá para Gerenciador de Arquivos**
3. **Faça backup dos arquivos atuais** (se houver)
4. **Delete todos os arquivos da pasta public_html**
5. **Faça upload de TODO o conteúdo da pasta `out/`**
6. **Configure as permissões (755 para pastas, 644 para arquivos)**

### Para Vercel/Netlify:

1. **Arraste a pasta `out/` para a área de upload**
2. **Configure as variáveis de ambiente no painel**
3. **Faça o deploy**

## ✅ Verificação Pós-Deploy

Após o upload, verifique:

1. **Site carrega corretamente**: https://seusite.com
2. **Painel admin funciona**: https://seusite.com/admin
3. **WhatsApp funciona**: Todos os botões devem abrir com o número (31) 99624-4487
4. **Produtos carregam**: Se estiver usando Supabase, os produtos devem aparecer

## 📱 Número de WhatsApp Atualizado

Todos os links de WhatsApp agora apontam para: **(31) 99624-4487**

## 🔍 Arquivos Importantes

- **`.htaccess`**: Configurações de URL amigáveis e cache
- **`env.js`**: Variáveis de ambiente (precisa ser configurado)
- **`imagens/`**: Todas as imagens do site
- **Páginas HTML**: index.html, admin.html, etc.

## ⚠️ Importante

- **Não altere a estrutura das pastas**
- **Mantenha o arquivo `.htaccess`**
- **Configure o `env.js` ANTES de acessar o site**
- **Se o site não carregar, verifique o console do navegador**

## 🆘 Suporte

Se encontrar problemas:

1. **Verifique o console do navegador** (F12)
2. **Confirme que o `env.js` está preenchido**
3. **Teste o acesso ao Supabase**
4. **Verifique se os arquivos foram enviados corretamente**

---

**Status**: ✅ Build concluído e arquivos prontos para deploy
