# GN Sports - Loja esportiva com dashboard

Projeto React + Vite para vitrine de produtos esportivos com painel administrativo, Supabase Auth, banco PostgreSQL, Storage para imagens e atendimento via WhatsApp.

## O que mudou

- A loja agora trabalha com camisas de times, clubes, seleções e itens esportivos.
- As rotas principais sao `/`, `/produtos`, `/camisas`, `/esportes`, `/ofertas`, `/produto/:slug`, `/categoria/:slug` e `/blog`.
- O painel usa `/admin/produtos` para cadastro e gestão do catálogo.
- A logo padrao passou a ser `/logo.png`.
- O banco antigo de veículos não foi alterado. As credenciais antigas foram preservadas em `.env.vehicles.local.backup`.

## Banco novo

1. Crie um novo projeto no Supabase para a loja sports.
2. Abra o SQL Editor do Supabase novo.
3. Execute `supabase/schema-sports.sql`.
4. Crie um usuario em Authentication. O trigger cria o perfil admin automaticamente.
5. Copie a URL e as chaves publicas do projeto novo para `.env.local`.

Exemplo:

```env
VITE_SUPABASE_URL=https://seu-projeto-sports.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sua_chave_publishable
VITE_SUPABASE_ANON_KEY=sua_chave_anon_public
VITE_SUPABASE_PRODUCT_IMAGE_BUCKET=product-images
VITE_APP_URL=http://localhost:5173
```

## Rodar local

```bash
npm install
npm run dev
```

## Observacoes

- Banners continuam editaveis pelo painel e podem ser trocados manualmente.
- O seed sports cria categorias, produtos demo, variantes de tamanho, settings e posts iniciais.
- O arquivo `supabase/schema.sql` antigo foi mantido como referencia/legado; use `supabase/schema-sports.sql` no banco novo.
