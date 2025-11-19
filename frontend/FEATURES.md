# Features Avançadas - Frontend Tributec

Documentação das features avançadas implementadas no sistema.

---

## 🌙 Dark Mode

### Visão Geral

Sistema completo de Dark Mode com três opções:
- **Claro**: Tema claro fixo
- **Escuro**: Tema escuro fixo
- **Sistema**: Segue a preferência do sistema operacional

### Uso

```typescript
import { useTheme } from '@/contexts/ThemeProvider'
import { DarkModeToggle } from '@/components/common/DarkModeToggle'

function MyComponent() {
  const { isDark, toggle, colorMode } = useTheme()

  return (
    <>
      <p>Modo atual: {colorMode}</p>
      <button onClick={toggle}>Alternar tema</button>

      {/* Ou use o componente pronto */}
      <DarkModeToggle />
    </>
  )
}
```

### Características

- ✅ Persistência no localStorage
- ✅ Detecção automática da preferência do sistema
- ✅ Listener para mudanças na preferência do sistema
- ✅ Atualiza meta theme-color automaticamente
- ✅ Suporte a todas as cores do Material-UI
- ✅ Transições suaves entre temas

### Arquivo de Tema

O tema é configurado em `src/theme.ts` com cores otimizadas para cada modo:

**Modo Claro:**
- Background: `#f5f5f5`
- Paper: `#ffffff`
- Text Primary: `rgba(0, 0, 0, 0.87)`

**Modo Escuro:**
- Background: `#121212`
- Paper: `#1e1e1e`
- Text Primary: `#ffffff`

---

## 📱 PWA (Progressive Web App)

### Visão Geral

Aplicação pode ser instalada como app nativo no dispositivo.

### Características

- ✅ Manifest completo com ícones e metadados
- ✅ Service Worker com cache offline
- ✅ Atalhos rápidos (shortcuts)
- ✅ Notificações push
- ✅ Background sync
- ✅ Compartilhamento nativo (Web Share API)
- ✅ Detecção de conexão (online/offline)

### Uso

```typescript
import {
  registerServiceWorker,
  setupInstallPrompt,
  sendNotification,
  isAppInstalled,
  share,
} from '@/utils/pwa'

// Registrar Service Worker
await registerServiceWorker()

// Prompt de instalação
const installer = setupInstallPrompt()
if (installer.canInstall) {
  await installer.prompt()
}

// Enviar notificação
await sendNotification('Novo lançamento disponível', {
  body: 'IPTU 2024 foi lançado',
  icon: '/icon-192x192.png',
})

// Compartilhar
await share({
  title: 'Tributec',
  text: 'Sistema de Gestão Tributária',
  url: window.location.href,
})

// Verificar se está instalado
if (isAppInstalled()) {
  console.log('App instalado como PWA')
}
```

### Service Worker

Estratégia de cache implementada:

- **Cache-first** para arquivos estáticos
- **Network-only** para APIs
- **Stale-while-revalidate** para outros recursos

### Manifest

Localizado em `/public/manifest.json` com:
- Ícones de 72px a 512px
- Shortcuts para ações rápidas
- Screenshots para store

---

## 🌍 Internacionalização (i18n)

### Visão Geral

Suporte a múltiplos idiomas com traduções completas.

**Idiomas Suportados:**
- 🇧🇷 Português (Brasil) - pt-BR
- 🇺🇸 English (US) - en-US

### Uso

```typescript
import { useTranslation, useI18n } from '@/i18n'

function MyComponent() {
  const { t } = useTranslation()
  const { locale, setLocale } = useI18n()

  return (
    <>
      <h1>{t('common.welcome')}</h1>
      <p>{t('pessoa.createSuccess')}</p>

      {/* Com parâmetros */}
      <p>{t('validation.minLength', { min: 5 })}</p>

      {/* Mudar idioma */}
      <select value={locale} onChange={e => setLocale(e.target.value)}>
        <option value="pt-BR">Português</option>
        <option value="en-US">English</option>
      </select>
    </>
  )
}
```

### Estrutura de Traduções

Arquivos em `src/i18n/`:
- `pt-BR.ts` - Traduções em português
- `en-US.ts` - Traduções em inglês
- `index.ts` - Provider e hooks

**Exemplo de estrutura:**
```typescript
{
  common: {
    save: 'Salvar',
    cancel: 'Cancelar',
  },
  pessoa: {
    title: 'Pessoas',
    createSuccess: 'Pessoa criada com sucesso',
  },
  validation: {
    minLength: 'Mínimo de {{min}} caracteres',
  }
}
```

### Funções de Formatação

```typescript
import { formatCurrency, formatDate, formatNumber } from '@/i18n'

// Formata moeda baseado no locale
formatCurrency(1234.56, 'pt-BR') // R$ 1.234,56
formatCurrency(1234.56, 'en-US') // $1,234.56

// Formata data
formatDate(new Date(), 'pt-BR') // 19/11/2024
formatDate(new Date(), 'en-US') // 11/19/2024

// Formata número
formatNumber(1234.56, 'pt-BR') // 1.234,56
formatNumber(1234.56, 'en-US') // 1,234.56
```

---

## ♿ Acessibilidade (a11y)

### Visão Geral

Sistema completo de acessibilidade seguindo WCAG 2.1 AA.

### Características

- ✅ Navegação completa por teclado
- ✅ Labels ARIA em todos os elementos interativos
- ✅ Suporte a leitores de tela
- ✅ Detecta preferência de reduced motion
- ✅ Detecta preferência de high contrast
- ✅ Skip to content link
- ✅ Live regions para anúncios
- ✅ Focus trap em modais
- ✅ Indicadores visuais de foco

### Componentes

#### SkipToContent

```typescript
import { SkipToContent } from '@/components/common/SkipToContent'

function App() {
  return (
    <>
      <SkipToContent />
      {/* resto do app */}
      <main id="main-content">
        {/* conteúdo principal */}
      </main>
    </>
  )
}
```

#### LiveRegion

```typescript
import { LiveRegion } from '@/components/common/LiveRegion'

function MyComponent() {
  const [message, setMessage] = useState('')

  return (
    <>
      <LiveRegion message={message} priority="polite" />
      <button onClick={() => setMessage('Ação realizada com sucesso')}>
        Executar
      </button>
    </>
  )
}
```

### Funções Utilitárias

```typescript
import {
  announce,
  trapFocus,
  prefersReducedMotion,
  setupKeyboardDetection,
  focusElement,
} from '@/utils/accessibility'

// Anunciar para leitores de tela
announce('Dados salvos com sucesso', 'polite')

// Trap focus em modal
const cleanup = trapFocus(modalElement)
// Quando fechar: cleanup()

// Detectar reduced motion
if (prefersReducedMotion()) {
  // Desabilitar animações
}

// Detectar navegação por teclado
const cleanup = setupKeyboardDetection()
// Adiciona classe .keyboard-navigation ao body quando navegando por Tab

// Focar elemento programaticamente
focusElement(inputElement)
```

### Atributos ARIA Helpers

```typescript
import {
  getLoadingAriaAttributes,
  getErrorAriaAttributes,
} from '@/utils/accessibility'

// Loading state
<div {...getLoadingAriaAttributes(isLoading)}>
  {isLoading ? 'Carregando...' : 'Conteúdo'}
</div>

// Error state
<input {...getErrorAriaAttributes(hasError, 'error-id')} />
<div id="error-id">{errorMessage}</div>
```

---

## 📊 Analytics

### Visão Geral

Sistema flexível de analytics com suporte a múltiplos providers.

### Providers Suportados

- **Google Analytics 4** (GA4)
- **Plausible Analytics** (privacy-friendly)
- **Console** (desenvolvimento)

### Configuração

```typescript
import {
  analytics,
  GoogleAnalyticsProvider,
  PlausibleProvider,
  ConsoleProvider
} from '@/utils/analytics'

// Desenvolvimento
if (import.meta.env.DEV) {
  analytics.registerProvider(new ConsoleProvider())
}

// Produção
if (import.meta.env.PROD) {
  // Google Analytics
  analytics.registerProvider(
    new GoogleAnalyticsProvider('G-XXXXXXXXXX')
  )

  // Ou Plausible (privacy-friendly)
  analytics.registerProvider(
    new PlausibleProvider('tributec.com')
  )
}

// Inicializar
analytics.init({ enabled: true })
```

### Uso

```typescript
import { analytics, trackButtonClick, trackFormSubmit } from '@/utils/analytics'

// Page view (automático com React Router)
analytics.pageView({
  path: '/cadastro/pessoas',
  title: 'Cadastro de Pessoas',
})

// Evento customizado
analytics.event({
  category: 'Engagement',
  action: 'button_click',
  label: 'save_pessoa',
  value: 1,
})

// Helpers prontos
trackButtonClick('create_pessoa', { tipo: 'fisica' })
trackFormSubmit('pessoa_form', true)
trackSearch('João Silva', 10)
trackError('Network error', 'api_call')

// Identificar usuário
analytics.identify('user-123', {
  name: 'João Silva',
  role: 'admin',
})

// Propriedades do usuário
analytics.setUserProperties({
  userType: 'admin',
  department: 'fiscal',
})

// Reset (logout)
analytics.reset()
```

### Eventos Automáticos

O sistema pode rastrear automaticamente:
- Visualizações de página
- Cliques em botões
- Submissões de formulário
- Erros JavaScript
- Performance da página

---

## 🎨 CSS Global para Acessibilidade

Adicione ao seu CSS global:

```css
/* Screen reader only */
.sr-only {
  position: absolute;
  left: -9999px;
  width: 1px;
  height: 1px;
  overflow: hidden;
}

/* Indicador de foco para navegação por teclado */
.keyboard-navigation *:focus {
  outline: 2px solid #1976d2;
  outline-offset: 2px;
}

/* Respeitar reduced motion */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* High contrast mode */
@media (prefers-contrast: high) {
  * {
    border-color: currentColor !important;
  }
}
```

---

## 📚 Recursos

### Dark Mode
- [Material-UI Theming](https://mui.com/material-ui/customization/theming/)
- [prefers-color-scheme](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme)

### PWA
- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Web App Manifest](https://developer.mozilla.org/en-US/docs/Web/Manifest)

### i18n
- [Internationalization Best Practices](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl)

### Acessibilidade
- [WCAG 2.1](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM](https://webaim.org/)

### Analytics
- [Google Analytics 4](https://developers.google.com/analytics/devguides/collection/ga4)
- [Plausible](https://plausible.io/docs)

---

## ✅ Checklist de Implementação

### Dark Mode
- [ ] Importar ThemeProvider em App.tsx
- [ ] Adicionar DarkModeToggle no header/settings
- [ ] Testar mudança de tema
- [ ] Testar modo "Sistema"

### PWA
- [ ] Registrar Service Worker no main.tsx
- [ ] Adicionar ícones em /public
- [ ] Testar instalação
- [ ] Testar offline mode
- [ ] Testar notificações

### i18n
- [ ] Envolver app com I18nProvider
- [ ] Substituir strings hardcoded por t()
- [ ] Adicionar seletor de idioma
- [ ] Testar todos os idiomas

### Acessibilidade
- [ ] Adicionar SkipToContent
- [ ] Testar navegação por teclado
- [ ] Executar lighthouse accessibility audit
- [ ] Testar com leitor de tela
- [ ] Verificar contraste de cores

### Analytics
- [ ] Configurar provider (GA4/Plausible)
- [ ] Inicializar analytics
- [ ] Adicionar tracking de eventos críticos
- [ ] Testar em desenvolvimento
- [ ] Verificar dados em produção
