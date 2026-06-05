# GN Sports - Loja esportiva com dashboard

Projeto React + Vite para vitrine de produtos esportivos com painel administrativo, Supabase Auth, banco PostgreSQL, Storage para imagens e atendimento via WhatsApp.

## O que mudou

- A loja agora trabalha com camisas de times, clubes, seleções e itens esportivos.
- As rotas principais são `/`, `/produtos`, `/camisas`, `/esportes`, `/ofertas`, `/produto/:slug`, `/categoria/:slug` e `/blog`.
- O painel usa `/admin/produtos` para cadastro e gestão do catálogo.
- A logo padrão da GN Sports é `/logo.png`.

## Banco novo

1. Crie um novo projeto no Supabase para a loja sports.
2. Abra o SQL Editor do Supabase novo.
3. Execute `supabase/schema-sports.sql`.
4. Crie um usuário em Authentication. O trigger cria o perfil admin automaticamente.
5. Copie a URL e as chaves públicas do projeto novo para `.env.local`.

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

## Observações

- Banners continuam editáveis pelo painel e podem ser trocados manualmente.
- O seed sports cria categorias, produtos demo, variantes de tamanho, settings e posts iniciais.
- Use `supabase/schema-sports.sql` no banco novo.
