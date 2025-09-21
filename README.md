# Sistema de Gestão APAE

Sistema completo de gestão para APAE (Associação de Pais e Amigos dos Excepcionais) desenvolvido com tecnologias modernas para gerenciamento de assistidos, profissionais, agendamentos e comunicação via WhatsApp.

## 📋 Funcionalidades Principais

- **Gestão de Usuários**: Controle de acesso com diferentes perfis (Admin, Funcionário, Responsável)
- **Cadastro de Assistidos**: Gerenciamento completo dos assistidos da APAE
- **Gestão de Profissionais**: Cadastro e organização dos profissionais por especialidade
- **Sistema de Agendamentos**: Agendamento e controle de consultas e atendimentos
- **Integração WhatsApp**: Envio automático de lembretes e confirmações via WhatsApp
- **Questionários**: Sistema de perguntas e respostas personalizáveis
- **Relatórios e Histórico**: Acompanhamento e relatórios de atendimentos
- **Upload de Arquivos**: Sistema de upload e gerenciamento de documentos
- **Configurações**: Painel de configurações do sistema

## 🚀 Tecnologias Utilizadas

### Frontend
- **React 18** - Biblioteca para interfaces de usuário
- **TypeScript** - Superset JavaScript com tipagem estática
- **Vite** - Build tool e servidor de desenvolvimento
- **Tailwind CSS** - Framework CSS utilitário
- **shadcn/ui** - Biblioteca de componentes baseada no Radix UI
- **React Router DOM** - Roteamento para aplicações React
- **React Hook Form** - Gerenciamento de formulários
- **Zod** - Validação de schemas TypeScript-first

### Backend e Banco de Dados
- **Supabase** - Backend as a Service (BaaS)
- **PostgreSQL** - Banco de dados relacional via Supabase
- **Row Level Security (RLS)** - Segurança a nível de linha

### Gerenciamento de Estado e Dados
- **TanStack Query (React Query)** - Gerenciamento de estado do servidor
- **Zustand** (implícito) - Gerenciamento de estado local

### UI e UX
- **Radix UI** - Componentes acessíveis e não estilizados
- **Lucide React** - Biblioteca de ícones
- **Sonner** - Sistema de notificações toast
- **React Day Picker** - Seletor de datas
- **Recharts** - Gráficos e visualizações

### Utilitários
- **date-fns** - Manipulação de datas
- **clsx** - Utilitário para classes condicionais
- **class-variance-authority** - Variantes de componentes
- **tailwind-merge** - Merge inteligente de classes Tailwind

## 📦 Instalação e Configuração

### Pré-requisitos
- Node.js 18+ 
- npm ou yarn
- Conta no Supabase (para backend)

### 1. Clone o repositório
```bash
git clone <URL_DO_REPOSITORIO>
cd sistema-apae
```

### 2. Instale as dependências
```bash
npm install
# ou
yarn install
```

### 3. Configuração do Supabase
1. Crie um projeto no [Supabase](https://supabase.com)
2. Configure as tabelas necessárias (veja seção Database Schema)
3. Configure as variáveis de ambiente

### 4. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_do_supabase
```

### 5. Execute o projeto
```bash
npm run dev
# ou
yarn dev
```

O aplicativo estará disponível em `http://localhost:8080`

## 🗄️ Schema do Banco de Dados

### Principais Tabelas:
- **usuarios** - Gestão de usuários do sistema
- **assistidos** - Cadastro dos assistidos da APAE
- **profissionais** - Cadastro dos profissionais
- **agendamentos** - Sistema de agendamentos
- **categorias** - Categorias para organização
- **perguntas** - Sistema de questionários
- **respostas** - Respostas dos questionários
- **configuracoes** - Configurações do sistema

## 🔐 Autenticação e Autorização

O sistema utiliza:
- **Supabase Auth** para autenticação
- **Row Level Security (RLS)** para autorização
- **Perfis de usuário**: Admin, Funcionário, Responsável

### Credenciais de Teste:
```
Admin:
- Email: admin@apae.com
- Senha: admin123

Funcionário:
- Email: funcionario@apae.com  
- Senha: func123

Responsável:
- Email: responsavel@apae.com
- Senha: resp123
```

## 📱 Integração WhatsApp

O sistema inclui integração completa com WhatsApp:
- **Múltiplos métodos**: WhatsApp Web, WhatsApp App, WhatsApp Direct
- **Mensagens automáticas**: Lembretes de consulta
- **Links de confirmação**: Sistema de confirmação via WhatsApp
- **Configuração flexível**: Números configuráveis no painel admin

## 🚀 Deploy

### Lovable (Recomendado)
1. Acesse o [projeto no Lovable](https://lovable.dev/projects/1cb3f349-948c-4f74-bf7d-42e0bb45bb4a)
2. Clique em "Share" → "Publish"

### Outros Provedores
O projeto pode ser deployado em qualquer provedor que suporte:
- Node.js
- Variáveis de ambiente
- Servir arquivos estáticos

Sugestões: Vercel, Netlify, Railway, Render

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview da build
npm run preview

# Linting
npm run lint
```

## 📁 Estrutura do Projeto

```
src/
├── components/          # Componentes React
│   ├── ui/             # Componentes base (shadcn/ui)
│   └── layout/         # Componentes de layout
├── hooks/              # Custom hooks
├── lib/                # Utilitários e configurações
├── pages/              # Páginas da aplicação
├── integrations/       # Integrações (Supabase)
└── assets/            # Recursos estáticos
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 🐛 Suporte

Para reportar bugs ou solicitar features:
1. Abra uma [issue](../../issues) no GitHub
2. Descreva o problema detalhadamente
3. Inclua steps para reproduzir o bug

## 📚 Documentação Adicional

- [Documentação do Supabase](https://supabase.com/docs)
- [Documentação do React](https://react.dev)
- [Documentação do Tailwind CSS](https://tailwindcss.com/docs)
- [Documentação do shadcn/ui](https://ui.shadcn.com)
