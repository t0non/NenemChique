# Como corrigir o erro "Could not find the 'is_best_seller' column"

## Problema
O erro ocorre porque as colunas `is_best_seller` e `best_seller_rank` não existem na tabela `products` do seu banco de dados Supabase.

## Solução 1: Executar SQL manualmente (Recomendado)

1. Acesse o painel do Supabase: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá para "SQL Editor" no menu lateral
4. Clique em "New query"
5. Cole e execute o seguinte SQL:

```sql
-- Adicionar colunas ausentes na tabela products
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_best_seller boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS best_seller_rank integer;
```

## Solução 2: Usar o arquivo SQL fornecido

1. No painel do Supabase, vá para "SQL Editor"
2. Clique em "Upload file"
3. Selecione o arquivo `add_missing_columns.sql` que foi criado na raiz do projeto
4. Execute o script

## Verificação

Após executar o SQL, você pode verificar se as colunas foram adicionadas:

```sql
-- Verificar estrutura da tabela products
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'products' 
ORDER BY ordinal_position;
```

## O que foi corrigido no código

O tratamento de erro foi melhorado para garantir que quando as colunas não existem, o sistema automaticamente as remove da tentativa de inserção/atualização e tenta novamente sem essas colunas.

Isso significa que mesmo que você não execute o SQL, o sistema deve funcionar, mas os campos "Best Seller" não serão salvos no banco até que as colunas sejam adicionadas.
