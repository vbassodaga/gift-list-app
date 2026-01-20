# 🔗 Configurando Frontend para Usar API na Vercel

## 📋 Passo a Passo

### 1. Obter URL da API na Vercel

Após fazer deploy do backend Next.js na Vercel, você receberá uma URL como:
- `https://gift-list-backend.vercel.app`
- Ou um domínio customizado

### 2. Atualizar environment.prod.ts

Edite o arquivo `gift-list-app/src/environments/environment.prod.ts`:

```typescript
export const environment = {
  production: true,
  apiUrl: 'https://SEU-PROJETO-VERCEL.vercel.app/api'
};
```

**Substitua `SEU-PROJETO-VERCEL` pela URL real do seu projeto na Vercel.**

### 3. Configurar CORS no Backend

O backend Next.js precisa permitir requisições do frontend no Netlify.

Edite `gift-list-backend/app/api/gifts/route.ts` e adicione headers CORS:

```typescript
export async function GET() {
  // ... código existente
  
  return NextResponse.json(giftDtos, {
    headers: {
      'Access-Control-Allow-Origin': '*', // Ou URL específica do Netlify
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    }
  });
}
```

**OU** crie um middleware do Next.js para adicionar CORS globalmente.

### 4. Configurar Variável de Ambiente (Opcional)

Se quiser usar variável de ambiente no Angular:

1. Crie arquivo `src/environments/environment.prod.ts`:
```typescript
declare var process: any;

export const environment = {
  production: true,
  apiUrl: process.env['NG_APP_API_URL'] || 'https://seu-projeto.vercel.app/api'
};
```

2. Configure no Netlify:
   - Settings > Build & deploy > Environment
   - Adicione: `NG_APP_API_URL=https://seu-projeto.vercel.app/api`

### 5. Rebuild do Frontend

Após alterar, faça rebuild:

```bash
cd gift-list-app
npm run build
```

### 6. Deploy no Netlify

O Netlify usará automaticamente o `environment.prod.ts` no build de produção.

## 🔍 Verificar Configuração

Após o deploy, verifique:

1. Abra o DevTools do navegador (F12)
2. Vá na aba Network
3. Faça uma requisição no frontend
4. Verifique se as requisições estão indo para a URL correta da Vercel

## 🐛 Troubleshooting

### Erro CORS

Se aparecer erro de CORS:
- Configure os headers CORS no backend Next.js
- Adicione a URL do Netlify nas origens permitidas

### API não responde

- Verifique se a URL está correta
- Confirme que o backend está online na Vercel
- Teste acessar a URL diretamente no navegador
